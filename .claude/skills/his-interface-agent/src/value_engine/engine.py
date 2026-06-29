"""取值引擎调度器

四级降级策略：
- L1: 规则库匹配（核心，始终启用，零延迟）
- L2: 深度学习（补充：有MCP查IRIS / 无MCP参考示例）
- L3: AI 推理（补充：LLM能力范围内语义推断，非兜底）
- L4: 人工兜底+回流（用户指导→Agent按SOP整理→回流规则库，越用越强）
"""

from pathlib import Path
from typing import Any, Dict, List, Optional

from .diagnostics import DebugTracker, FieldMatchDiagnostic, MatchReport
from .l1_rule_engine import L1MatchResult, L1RuleEngine
from .l2_search_engine import L2SearchEngine
from .l3_ai_engine import L3AIEngine
from .l4_human_loop import L4HumanLoop, format_unmatched_for_display
from .normalizer import FieldNameNormalizer


class ValueResult:
    """取值结果"""

    def __init__(self, field_name: str, standard_name: str,
                 value_expression: str, global_used: str,
                 confidence: float, source: str, rule=None,
                 resolution_status: str = "resolved", **kwargs):
        self.field_name = field_name
        self.standard_name = standard_name
        self.value_expression = value_expression
        self.global_used = global_used
        self.confidence = confidence
        self.source = source
        self.rule = rule  # 原始规则对象（包含依赖信息等）
        self.resolution_status = resolution_status  # "resolved" | "identified" | "partial"
        self.extra = kwargs
        # 字段类型：business(业务数据), parameter(配置参数), computed(计算字段)
        self.field_type = kwargs.get('field_type', 'business')
        self.default_value = kwargs.get('default_value', '')

    @property
    def is_resolved(self) -> bool:
        # 配置参数字段即使没有取值表达式也算resolved
        if self.field_type == 'parameter':
            return True
        return (self.resolution_status == "resolved"
                and bool(self.value_expression)
                and "?" not in self.value_expression)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "fieldName": self.field_name,
            "standardName": self.standard_name,
            "valueExpression": self.value_expression,
            "globalUsed": self.global_used,
            "confidence": self.confidence,
            "source": self.source,
            "resolutionStatus": self.resolution_status,
            **self.extra
        }

    def __repr__(self) -> str:
        return (f"ValueResult({self.standard_name}, "
                f"source={self.source}, confidence={self.confidence:.2f}, "
                f"status={self.resolution_status})")


class ValueEngine:
    """取值引擎调度器（四级降级策略）"""

    def __init__(self, config: Optional[Dict[str, Any]] = None,
                 rules_dir: Optional[Path] = None):
        """初始化取值引擎

        Args:
            config: 取值引擎配置
            rules_dir: 规则目录路径
        """
        self.config = config or {}
        self._rules_dir = rules_dir

        # L1: 规则库匹配（核心）
        l1_config = self.config.get("l1", {})
        l1_threshold = l1_config.get("confidenceThreshold", 0.8)
        l1_thresholds = l1_config.get("confidenceThresholds", None)
        l1_fallback = l1_config.get("fallbackThreshold", None)
        self.l1 = L1RuleEngine(
            rules_dir=rules_dir,
            threshold=l1_threshold,
            thresholds=l1_thresholds,
            fallback_threshold=l1_fallback,
        )
        self.l1_enabled = l1_config.get("enabled", True)

        # L2: 深度学习（有MCP查IRIS / 无MCP参考示例）
        l2_config = self.config.get("l2", {})
        self.l2_enabled = l2_config.get("enabled", True)
        self.l2_mcp_enabled = l2_config.get("mcp模式", {}).get("enabled", True)
        self.l2_example_enabled = l2_config.get("示例模式", {}).get("enabled", True)

        # L3: AI 推理（LLM能力范围内补充，非兜底）
        l3_config = self.config.get("l3", {})
        self.l3_enabled = l3_config.get("enabled", True)

        # L4: 人工兜底+回流（越用越强）
        l4_config = self.config.get("l4", {})
        self.l4_enabled = l4_config.get("enabled", True)

        # L2: 深度学习搜索引擎
        self._l2_engine: Optional[L2SearchEngine] = None

        # L3: AI 推理引擎（延迟初始化，依赖 L1）
        self._l3_engine: Optional[L3AIEngine] = None

        # L4: 人工兜底
        self._l4_handler: Optional[L4HumanLoop] = None

        # 字段名标准化器（延迟初始化，首次使用时从别名文件构建）
        self._normalizer: Optional[FieldNameNormalizer] = None

        self._loaded = False

    @property
    def l2_engine(self) -> L2SearchEngine:
        """获取 L2 搜索引擎（延迟初始化）"""
        if self._l2_engine is None:
            self._l2_engine = L2SearchEngine(rules_dir=self._rules_dir)
        return self._l2_engine

    @property
    def l3_engine(self) -> L3AIEngine:
        """获取 L3 AI 推理引擎（延迟初始化）"""
        if self._l3_engine is None:
            self._l3_engine = L3AIEngine(l1_engine=self.l1 if self.l1_enabled else None)
        return self._l3_engine

    @property
    def l4_handler(self) -> L4HumanLoop:
        """获取 L4 人工兜底处理器（延迟初始化）"""
        if self._l4_handler is None:
            from .feedback import FeedbackCollector
            self._l4_handler = L4HumanLoop(FeedbackCollector(rules_dir=self._rules_dir))
        return self._l4_handler

    @property
    def normalizer(self) -> FieldNameNormalizer:
        """获取标准化器（延迟初始化）"""
        if self._normalizer is None:
            self._normalizer = FieldNameNormalizer.from_alias_files(self._rules_dir)
        return self._normalizer

    def load_rules(self) -> int:
        """加载规则库

        Returns:
            加载的规则数量
        """
        if self.l1_enabled:
            # 规则库实际在 rules/domains 目录下
            # 如果传入的是 rules 目录，则添加 "domains" 子目录
            # 如果传入的是 rules/domains 目录，则直接使用
            if self._rules_dir and self._rules_dir.name == "domains":
                domains_dir = self._rules_dir
            elif self._rules_dir:
                domains_dir = self._rules_dir / "domains"
            else:
                domains_dir = None
            count = self.l1.load_rules(domains_dir)
            self._loaded = True
            return count
        return 0

    @property
    def rule_count(self) -> int:
        return self.l1.rule_count

    @property
    def domain_count(self) -> int:
        return self.l1.domain_count

    def resolve(self, field_name: str, context: Optional[Dict] = None) -> Optional[ValueResult]:
        """解析字段取值

        四级降级策略：L1 → L2 → L3 → L4

        Args:
            field_name: 字段名
            context: 上下文信息（可选）

        Returns:
            ValueResult 或 None（仅在完全无匹配时返回 None）
        """
        if not self._loaded:
            self.load_rules()

        l1_result = None

        # L1: 规则库匹配（核心）
        if self.l1_enabled:
            result = self._try_l1(field_name, context)
            if result and result.is_resolved:
                return result
            l1_result = result

        # L2: 深度学习
        if self.l2_enabled:
            result = self._try_l2(field_name, context)
            if result and result.is_resolved:
                return result

        # L3: AI 推理
        if self.l3_enabled:
            result = self._try_l3(field_name, context)
            if result and result.is_resolved:
                return result

        # 返回最佳非 resolved 结果（identified）
        if l1_result is not None:
            return l1_result

        # L4: 人工兜底
        if self.l4_enabled:
            return self._try_l4(field_name, context)

        return None

    def resolve_multi_round(self, field_code: str, field_name_cn: str = "",
                            domain_hint: str = "", description: str = "",
                            debug_tracker=None) -> Optional[ValueResult]:
        """多轮重试解析字段取值

        依次尝试多种策略，选择最佳匹配结果。
        中文名匹配优先于英文名匹配（更精准）。

        当指定 domain_hint 时，优先选择该域的规则。
        """
        if not self._loaded:
            self.load_rules()

        def _try_match(field_input: str, ctx: Optional[Dict]) -> Optional[ValueResult]:
            if not field_input or not field_input.strip():
                return None
            return self._try_l1(field_input, ctx, debug_tracker)

        best_result = None
        best_score = 0.0
        code_result = None  # 记录 code 匹配的最佳结果
        domain_result = None  # 记录域匹配的结果

        def _update_best(result, strategy_name=""):
            nonlocal best_result, best_score
            if result and result.is_resolved:
                score = getattr(result, 'confidence', 0) if hasattr(result, 'confidence') else 0
                # 中文名匹配给予额外权重
                if '中文' in strategy_name or 'name' in strategy_name.lower():
                    score += 0.1
                # 域匹配给予额外权重
                if 'domain' in strategy_name.lower():
                    score += 0.2
                if score > best_score:
                    best_result = result
                    best_score = score

        # 策略1: code + domain（优先）
        if domain_hint and field_code:
            result = _try_match(field_code, {"domain": domain_hint})
            if result and result.is_resolved:
                # 域匹配的结果直接返回，不再比较其他策略
                return result
            domain_result = result

        # 策略2: name + domain（优先）
        if domain_hint and field_name_cn:
            result = _try_match(field_name_cn, {"domain": domain_hint})
            if result and result.is_resolved:
                # 域匹配的结果直接返回，不再比较其他策略
                return result
            if result and (not domain_result or result.confidence > domain_result.confidence):
                domain_result = result

        # 如果指定了域但没有匹配到，返回 None（不继续尝试其他策略）
        if domain_hint and not domain_result:
            return None

        # 策略3: code 原始匹配
        result = _try_match(field_code, None)
        _update_best(result, "code")
        code_result = result

        # 策略4: code.upper()
        if field_code:
            result = _try_match(field_code.upper(), None)
            _update_best(result, "code_upper")
            if not code_result and result:
                code_result = result

        # 策略5: code 去下划线/分隔符
        if field_code:
            stripped = field_code.replace("_", "").replace("-", "").replace(".", "")
            if stripped != field_code and stripped != field_code.upper():
                result = _try_match(stripped, None)
                _update_best(result, "code_stripped")
                if not code_result and result:
                    code_result = result

        # 策略5b: 标准化变体（驼峰分词、前缀剥离、首字母缩写展开等）
        if field_code:
            for variant in self.normalizer.normalize(field_code, max_variants=5):
                if variant == field_code or variant == field_code.upper():
                    continue  # 避免重复已尝试的
                result = _try_match(variant, None)
                _update_best(result, "code_variant")
                if not code_result and result:
                    code_result = result

        # 策略6: 中文名匹配（辅助策略）
        # 仅在 code 匹配无结果时使用中文名匹配，否则仅作参考
        if field_name_cn and field_name_cn != field_code:
            result = _try_match(field_name_cn, None)
            if result:
                # 如果 code 已匹配到高置信度结果，中文名匹配降低权重
                if code_result and code_result.confidence >= 0.90:
                    result.confidence = result.confidence * 0.4
                _update_best(result, "中文名匹配")

        # 策略7: description 关键词提取
        if description and len(description) > 10:
            from .l1_rule_engine import L1RuleEngine
            keywords = L1RuleEngine._extract_keywords_from_description(description)
            for kw in keywords[:3]:
                result = _try_match(kw, None)
                _update_best(result, "description")

        # 返回最佳结果
        if best_result:
            return best_result

        # 全部未命中 → 返回最佳识别（可能无表达式）
        return _try_match(field_code, None) or \
               (_try_match(field_name_cn, None) if field_name_cn else None)

    def resolve_with_diagnostics(self, field_code: str, field_name_cn: str = "",
                                 domain_hint: str = "", description: str = ""
                                 ) -> tuple:
        """解析字段取值并返回诊断信息

        Returns:
            (Optional[ValueResult], FieldMatchDiagnostic)
        """
        tracker = DebugTracker()
        tracker.reset(field_code, field_name_cn)

        result = self.resolve_multi_round(
            field_code=field_code,
            field_name_cn=field_name_cn,
            domain_hint=domain_hint,
            description=description,
            debug_tracker=tracker,
        )

        if result and result.is_resolved:
            status = "resolved"
            suggestion = ""
        elif result and result.standard_name:
            status = "identified"
            suggestion = (f"规则 '{result.standard_name}' 已识别但表达式缺失，"
                          f"请补充 {result.global_used or '对应Global'} 取值逻辑")
        else:
            status = "unmatched"
            suggestion = _generate_suggestion(field_code, field_name_cn, tracker)

        diagnostic = tracker.to_diagnostic(
            match_result=result,
            status=status,
            suggestion=suggestion,
        )
        return result, diagnostic

    def build_match_report(self, fields: List[tuple],
                           domain_hint: str = "") -> MatchReport:
        """为一组字段构建匹配报告

        Args:
            fields: [(code, name_cn, description), ...]
            domain_hint: 域提示
        """
        diagnostics = []
        resolved_count = 0
        identified_count = 0
        unmatched_count = 0

        for code, name_cn, desc in fields:
            result, diag = self.resolve_with_diagnostics(
                field_code=code,
                field_name_cn=name_cn or "",
                domain_hint=domain_hint,
                description=desc or "",
            )
            diagnostics.append(diag)
            if diag.status == "resolved":
                resolved_count += 1
            elif diag.status == "identified":
                identified_count += 1
            else:
                unmatched_count += 1

        return MatchReport(
            view_code="",
            view_name="",
            total_fields=len(fields),
            resolved=resolved_count,
            identified=identified_count,
            unmatched=unmatched_count,
            diagnostics=diagnostics,
        )

    def resolve_batch(self, field_names: List[str],
                      context: Optional[Dict] = None) -> List[Optional[ValueResult]]:
        """批量解析字段取值

        Args:
            field_names: 字段名列表
            context: 上下文信息

        Returns:
            ValueResult 列表（与 field_names 一一对应）
        """
        return [self.resolve(name, context) for name in field_names]

    def _try_l1(self, field_name: str, context: Optional[Dict],
                debug_tracker=None) -> Optional[ValueResult]:
        """尝试 L1 规则库匹配"""
        match_result = self.l1.match(field_name, context, debug_tracker=debug_tracker)
        if match_result:
            return ValueResult(
                field_name=field_name,
                standard_name=match_result.standard_name,
                value_expression=match_result.value_expression,
                global_used=match_result.global_used,
                confidence=match_result.confidence,
                source="L1",
                rule=match_result.rule,
                resolution_status=match_result.resolution_status,
                matchType=match_result.match_type,
                domain=match_result.rule.domain,
                description=match_result.rule.description,
                codeSnippet=match_result.rule.code_snippet,
                field_type=match_result.rule.field_type,
                default_value=match_result.rule.default_value
            )
        return None

    def _try_l2(self, field_name: str, context: Optional[Dict]) -> Optional[ValueResult]:
        """尝试 L2 深度学习

        离线模式：扫描 examples/ + sources/ + global-access.md
        返回 None 由下级处理。
        """
        l2_result = self.l2_engine.search(field_name, context.get("field_name_cn", "") if context else "")
        if l2_result and l2_result.value_expression:
            return ValueResult(
                field_name=field_name,
                standard_name=l2_result.standard_name,
                value_expression=l2_result.value_expression,
                global_used=l2_result.global_used,
                confidence=l2_result.confidence,
                source=f"L2_{l2_result.source}",
                resolution_status="resolved",
                rawContext=l2_result.raw_context,
            )
        return None

    def _try_l3(self, field_name: str, context: Optional[Dict]) -> Optional[ValueResult]:
        """尝试 L3 AI 推理

        不直接调用 API，而是标记该字段需要 AI 推理。
        实际推理在 resolve_with_diagnostics 中通过构建 prompt 完成。
        """
        # L3 返回特殊标记结果，调用方根据此结果获取推理 prompt
        return ValueResult(
            field_name=field_name,
            standard_name="L3_PENDING",
            value_expression="",
            global_used="",
            confidence=0.0,
            source="L3",
            resolution_status="partial",
            needs_inference=True,
        )

    def _try_l4(self, field_name: str, context: Optional[Dict]) -> Optional[ValueResult]:
        """尝试 L4 人工兜底

        返回标记结果，由调用方决定交互模式（interactive/auto）。
        """
        return ValueResult(
            field_name=field_name,
            standard_name="L4_PENDING",
            value_expression="",
            global_used="",
            confidence=0.0,
            source="L4",
            resolution_status="partial",
            needs_human=True,
        )

    def get_l3_prompts_for_unmatched(self, unmatched_fields: List[Dict],
                                     view_context: Optional[Dict] = None,
                                     domain_hint: str = "") -> str:
        """为一组未匹配字段生成 L3 推理 prompt 列表

        Args:
            unmatched_fields: [{"code": ..., "name_cn": ..., "description": ...}, ...]
            view_context: 包含 "matched" 键的视图上下文
            domain_hint: 域提示

        Returns:
            合并的推理 prompt 文本
        """
        return self.l3_engine.batch_inference_prompts(
            unmatched=unmatched_fields,
            view_context=view_context,
            domain_hint=domain_hint,
        )

    def get_l4_summary(self, unmatched_fields: List[Dict],
                       domain_hint: str = "") -> Dict:
        """生成 L4 待处理摘要"""
        return self.l4_handler.generate_l4_summary(unmatched_fields, domain_hint)

    def search_rules(self, keyword: str, domain: Optional[str] = None) -> List[L1MatchResult]:
        """搜索规则（用于调试和探索）

        Args:
            keyword: 搜索关键词
            domain: 指定域（可选）

        Returns:
            匹配结果列表
        """
        if not self._loaded:
            self.load_rules()

        context = {"domain": domain} if domain else None
        return self.l1.match_all(keyword, context, top_n=10)

    def list_domains(self) -> List[str]:
        """列出所有域"""
        if not self._loaded:
            self.load_rules()
        return self.l1.list_domains()

    def get_domain_rules(self, domain_id: str):
        """获取指定域的所有规则"""
        if not self._loaded:
            self.load_rules()
        return self.l1.lookup_by_domain(domain_id)


def _generate_suggestion(field_code: str, field_name_cn: str,
                         tracker) -> str:
    """根据匹配轨迹生成改进建议"""
    if not tracker or not tracker.attempts:
        return "建议: 在别名库 rules/common/*-aliases.json 中添加该字段的别名映射"

    # 找到得分最高的尝试
    best = max(tracker.attempts, key=lambda a: a.score)
    if best.score <= 0:
        return "建议: 该字段未在任何别名/规则中找到，请确认字段名拼写，或在别名库中添加新条目"

    if best.score < 0.5:
        return (f"建议: 最接近匹配为 '{best.candidate_name}' "
                f"(得分{best.score:.3f})，建议在别名库中为 '{field_code}' "
                f"添加指向该规则的关键词映射")

    if best.passed is False:
        return (f"建议: 找到候选 '{best.candidate_name}' "
                f"(得分{best.score:.3f})但被 {best.strategy} 阈值 "
                f"({best.threshold}) 过滤。可降低该类型阈值或增加更精确的关键词")

    return f"建议: 候选 '{best.candidate_name}' 得分{best.score:.3f}，请确认是否为预期匹配"
