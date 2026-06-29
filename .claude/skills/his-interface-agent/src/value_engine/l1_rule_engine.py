"""L1 规则库匹配引擎

基于本地规则库进行字段名匹配，零延迟，离线可用。
匹配策略（优先级从高到低）：
0. 别名映射查找（field-aliases.json）
1. 精确匹配 standardName
2. 正则匹配 fieldPattern
3. 关键词模糊匹配
4. 按置信度排序返回最佳匹配
"""

import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from ..utils.markdown_parser import DomainRules, MarkdownRuleParser, Rule


class AliasRule:
    """从别名映射创建的虚拟规则对象"""

    def __init__(self, data: Dict[str, Any]):
        self._data = data

    @property
    def data(self) -> Dict[str, Any]:
        return self._data

    @property
    def standard_name(self) -> str:
        return self._data.get("ruleStandardName", "")

    @property
    def value_expression(self) -> str:
        return self._data.get("valueExpression", "")

    @property
    def global_used(self) -> str:
        return self._data.get("global", "")

    @property
    def domain(self) -> str:
        return self._data.get("domain", "")

    @property
    def description(self) -> str:
        return self._data.get("description", "")

    @property
    def match_keywords(self) -> List[str]:
        return self._data.get("keywords", [])

    @property
    def dependencies(self) -> List[str]:
        return self._data.get("dependencies", [])

    @property
    def field_pattern(self) -> str:
        return ""

    @property
    def code_snippet(self) -> str:
        return ""

    @property
    def field_type(self) -> str:
        """字段类型：business(业务数据), parameter(配置参数), computed(计算字段)"""
        return self._data.get("fieldType", "business")

    @property
    def default_value(self) -> str:
        """默认值（用于配置参数）"""
        return self._data.get("defaultValue", "")

    def to_dict(self) -> Dict:
        return self._data.copy()


class L1MatchResult:
    """L1 匹配结果"""

    def __init__(self, rule, score: float, match_type: str,
                 resolution_status: str = "resolved"):
        self.rule = rule
        self.score = score
        self.match_type = match_type  # exact, pattern, keyword, alias, fuzzy
        # "resolved"=有表达式, "identified"=匹配到但无表达式, "partial"=表达式含TODO
        self.resolution_status = resolution_status

    @property
    def standard_name(self) -> str:
        return self.rule.standard_name

    @property
    def value_expression(self) -> str:
        return self.rule.value_expression

    @property
    def global_used(self) -> str:
        return self.rule.global_used

    @property
    def confidence(self) -> float:
        return self.score

    @property
    def is_resolved(self) -> bool:
        return (self.resolution_status == "resolved"
                and bool(self.value_expression)
                and "?" not in self.value_expression)

    def to_dict(self) -> Dict:
        result = self.rule.to_dict()
        result["confidence"] = self.score
        result["matchType"] = self.match_type
        result["source"] = "L1"
        result["resolutionStatus"] = self.resolution_status
        return result

    def __repr__(self) -> str:
        return (f"L1Match({self.standard_name}, score={self.score:.2f}, "
                f"type={self.match_type}, status={self.resolution_status})")


class L1RuleEngine:
    """L1 规则库匹配引擎"""

    # 默认分级阈值
    DEFAULT_THRESHOLDS = {
        "alias": 0.85,
        "exact": 0.90,
        "pattern": 0.85,
        "keyword": 0.65,
        "fuzzy": 0.55,
    }
    # 兜底阈值：低于分级阈值但仍保留最佳候选的最低分数
    DEFAULT_FALLBACK_THRESHOLD = 0.70

    def __init__(self, rules_dir: Optional[Path] = None, threshold: float = 0.8,
                 thresholds: Optional[Dict[str, float]] = None,
                 fallback_threshold: Optional[float] = None):
        """初始化 L1 引擎

        Args:
            rules_dir: 规则目录路径，默认为项目根目录下的 rules/domains
            threshold: 置信度阈值（单值模式，为向后兼容保留）
            thresholds: 按匹配类型的分级阈值（优先于 threshold）
            fallback_threshold: 兜底阈值（低于此分数的结果不会被保留）
        """
        self.threshold = threshold
        self.thresholds = thresholds or self.DEFAULT_THRESHOLDS
        self.fallback_threshold = (fallback_threshold
                                   if fallback_threshold is not None
                                   else self.DEFAULT_FALLBACK_THRESHOLD)
        self._parser = MarkdownRuleParser()
        self._domains: Dict[str, DomainRules] = {}
        self._all_rules: List[Rule] = []
        self._rules_dir = rules_dir
        # 别名映射：{normalized_keyword: alias_data}
        self._alias_map: Dict[str, Dict[str, Any]] = {}
        self._aliases_loaded = False

    def _get_threshold(self, match_type: str) -> float:
        """获取指定匹配类型的阈值"""
        return self.thresholds.get(match_type, self.threshold)

    def load_rules(self, rules_dir: Optional[Path] = None) -> int:
        """加载规则库

        Args:
            rules_dir: 规则目录路径

        Returns:
            加载的规则总数
        """
        dir_path = rules_dir or self._rules_dir
        if dir_path is None:
            # 默认路径
            dir_path = Path(__file__).parent.parent.parent / "rules" / "domains"

        self._domains.clear()
        self._all_rules.clear()

        domains = self._parser.parse_directory(dir_path)
        for domain in domains:
            self._domains[domain.domain_id] = domain
            self._all_rules.extend(domain.rules)

        # 加载别名映射
        self._load_aliases(dir_path.parent / "common" / "field-aliases.json")

        # 合并别名关键词到规则中
        self._merge_aliases_into_rules()

        # 运行规则校验（WARNING级别，不阻断）
        self._validate_rules()

        return len(self._all_rules)

    def _load_aliases(self, aliases_path: Path) -> None:
        """加载字段别名映射（加载 common/ 目录下所有 *-aliases.json）"""
        self._alias_map.clear()
        self._aliases_loaded = False

        common_dir = aliases_path.parent  # rules/common/
        if not common_dir.exists():
            return

        # 加载所有 *-aliases.json 文件
        for alias_file in sorted(common_dir.glob("*-aliases.json")):
            try:
                with open(alias_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                aliases = data.get("aliases", {})
                for alias_key, alias_data in aliases.items():
                    keywords = alias_data.get("keywords", [])
                    for kw in keywords:
                        normalized = kw.strip().lower()
                        if normalized:
                            self._alias_map[normalized] = alias_data

            except Exception:
                pass

        self._aliases_loaded = len(self._alias_map) > 0

    def _validate_rules(self) -> None:
        """校验规则库中的取值表达式合法性

        WARNING级别，不阻断加载，只输出告警信息
        """
        try:
            from .rule_validator import get_validator
            validator = get_validator()

            # 收集所有规则的表达式
            rules_data = []
            for rule in self._all_rules:
                if rule.value_expression:
                    rules_data.append({
                        'ruleStandardName': rule.standard_name,
                        'valueExpression': rule.value_expression
                    })

            # 运行校验
            issues = validator.validate_batch(rules_data)

            # 输出报告（仅在有问题时）
            if issues:
                validator.print_report(issues)

        except Exception:
            # 校验失败不影响主流程
            pass

    def _merge_aliases_into_rules(self) -> None:
        """将别名 JSON 中的关键词合并到对应的规则条目中

        消除"别名命名体系"和"规则命名体系"不互通的问题：
        1. 用别名 ruleStandardName 查找匹配规则 → 合并关键词
        2. 别名有表达式而匹配规则没有 → 回填表达式
        3. 别名无法匹配任何规则且自身有表达式 → 创建新规则
        """
        if not self._alias_map or not self._all_rules:
            return

        # 收集所有唯一的别名数据（去重）
        seen_std_names = set()
        unique_aliases = []
        for kw, alias_data in self._alias_map.items():
            std_name = alias_data.get("ruleStandardName", "")
            if std_name and std_name not in seen_std_names:
                seen_std_names.add(std_name)
                unique_aliases.append(alias_data)

        merged_count = 0
        new_rule_count = 0

        for alias_data in unique_aliases:
            std_name = alias_data.get("ruleStandardName", "")
            alias_expr = alias_data.get("valueExpression", "")
            alias_keywords = alias_data.get("keywords", [])
            alias_domain = alias_data.get("domain", "")

            # 查找匹配的规则
            matched_rule = None
            norm_std = self._normalize_name(std_name) if hasattr(self, '_normalize_name') else std_name.lower().replace('_', '')

            for rule in self._all_rules:
                rule_name_norm = rule.standard_name.lower().replace('_', '').replace(' ', '')
                if rule_name_norm == norm_std:
                    matched_rule = rule
                    break

            # 也尝试用别名关键词匹配规则
            if not matched_rule:
                for rule in self._all_rules:
                    for kw in alias_keywords:
                        kw_norm = kw.lower().replace('_', '').replace(' ', '')
                        rule_kw_norm = rule.standard_name.lower().replace('_', '').replace(' ', '')
                        if kw_norm and (kw_norm == rule_kw_norm or kw_norm in rule_kw_norm):
                            matched_rule = rule
                            break
                    if matched_rule:
                        break

            if matched_rule:
                # 合并关键词（去重）
                existing_kw = set(k.lower() for k in matched_rule.match_keywords)
                for kw in alias_keywords:
                    if kw.lower() not in existing_kw:
                        matched_rule.match_keywords.append(kw)
                        existing_kw.add(kw.lower())

                # 如果规则没有表达式但别名有，回填
                if not matched_rule.value_expression and alias_expr:
                    matched_rule.data["valueExpression"] = alias_expr

                merged_count += 1

            elif alias_expr and std_name:
                # 别名有表达式但无匹配规则 → 创建新规则（跳过含 ? 或 dataRowId 的无效表达式）
                if '?' in alias_expr or 'dataRowId' in alias_expr:
                    continue
                new_rule = AliasRule({
                    "standardName": std_name,
                    "domain": alias_domain,
                    "matchKeywords": alias_keywords,
                    "valueExpression": alias_expr,
                    "globalUsed": alias_data.get("global", ""),
                    "confidence": 0.85,
                    "description": alias_data.get("description", ""),
                    "codeSnippet": "",
                    "fieldPattern": "",
                    "dependencies": [],
                    "isIntermediate": False
                })
                self._all_rules.append(new_rule)
                new_rule_count += 1

            elif alias_expr and std_name:
                # 别名有表达式但无匹配规则 → 创建新规则（跳过含 ? 或 dataRowId 的无效表达式）
                if '?' in alias_expr or 'dataRowId' in alias_expr:
                    continue
                new_rule = AliasRule({
                    "standardName": std_name,
                    "domain": alias_domain,
                    "matchKeywords": alias_keywords,
                    "valueExpression": alias_expr,
                    "globalUsed": alias_data.get("global", ""),
                    "confidence": 0.85,
                    "description": alias_data.get("description", ""),
                    "codeSnippet": "",
                    "fieldPattern": "",
                    "dependencies": [],
                    "isIntermediate": False
                })
                self._all_rules.append(new_rule)
                new_rule_count += 1

    @property
    def rule_count(self) -> int:
        return len(self._all_rules)

    @property
    def domain_count(self) -> int:
        return len(self._domains)

    def match(self, field_name: str, context: Optional[Dict] = None,
              debug_tracker=None) -> Optional[L1MatchResult]:
        """匹配字段名

        Args:
            field_name: 要匹配的字段名（支持代码/中文名/长描述）
            context: 上下文信息（可选，如域ID）
            debug_tracker: 可选的 DebugTracker 用于记录匹配轨迹

        Returns:
            L1MatchResult 或 None
            - resolved: 匹配到规则且有有效表达式
            - identified: 匹配到规则/别名但表达式缺失
            - 仅在完全无匹配时返回 None

        匹配优先级：别名映射 > 规则精确匹配 > 关键词提取匹配 > 规则模糊匹配
        """
        # 优先查别名映射
        alias_result = self._match_alias(field_name, context, debug_tracker)
        if alias_result and alias_result.is_resolved:
            return alias_result

        # 常规规则匹配（用原始字段名）
        best = None
        if self._all_rules:
            candidates = self.match_all(field_name, context, top_n=1,
                                        debug_tracker=debug_tracker)
            if candidates:
                best = candidates[0]

        # 如果原始名称没匹配到，尝试从长描述中提取关键词
        if len(field_name) > 10:
            keywords = self._extract_keywords_from_description(field_name)
            for kw in keywords:
                kw_candidates = self.match_all(kw, context, top_n=1)
                if kw_candidates:
                    kw_result = kw_candidates[0]
                    if best is None or kw_result.confidence > (best.confidence if best else 0):
                        if debug_tracker:
                            debug_tracker.record(
                                strategy="keyword_extract",
                                candidate_name=f"{kw} → {kw_result.standard_name}",
                                score=kw_result.confidence,
                                threshold=0.35,
                                passed=True,
                                reason=f"从长描述提取关键词 '{kw}' 匹配",
                            )
                        best = kw_result

        # 中文名关键词语义匹配：从中文字段名提取关键词，搜索规则库
        if not best or not best.is_resolved:
            cn_result = self._match_chinese_keywords(field_name, context, debug_tracker)
            if cn_result and cn_result.is_resolved:
                if best is None or cn_result.confidence > (best.confidence if best else 0):
                    best = cn_result

        # 返回最佳匹配（优先 resolved，否则 identified）
        if best and best.is_resolved:
            return best

        # 别名结果即使无表达式也保留
        if alias_result and not best:
            return alias_result

        if best and alias_result:
            # 两者都存在时，优先分数高的
            return best if best.confidence >= alias_result.confidence else alias_result

        return best or alias_result

    _DESC_SPLIT_RE = None  # 编译一次正则

    @classmethod
    def _extract_keywords_from_description(cls, text: str) -> List[str]:
        """从长描述文本中提取有意义的匹配关键词

        "每条医嘱的内部唯一编号,在医嘱视图里,该字段唯一,相当于主键"
        → ["医嘱", "内部唯一编号", "主键", "医嘱内部唯一编号"]
        """
        if cls._DESC_SPLIT_RE is None:
            cls._DESC_SPLIT_RE = (
                r'[，,、。；;：:\s\|/\(\)（）\[\]【】《》"\']+'
                r'|格式[：:]|说明[：:]|如[：:]|举例[：:]|该字段|相当于|举例内容见下图'
            )
        import re as _re
        # 清理常见格式噪音
        cleaned = _re.sub(cls._DESC_SPLIT_RE, ' ', text)
        cleaned = _re.sub(r'\d+\s*[.、]', ' ', cleaned)  # 去掉编号 1. a.
        cleaned = _re.sub(r'yyyy-mm-dd.*|hh24:mi.*', ' ', cleaned, flags=_re.IGNORECASE)

        # 提取中文关键词（2字及以上）
        words = [w.strip() for w in cleaned.split() if len(w.strip()) >= 2]
        # 去重保序
        seen = set()
        result = []
        for w in words:
            if w not in seen:
                seen.add(w)
                result.append(w)
        return result

    def _match_chinese_keywords(self, field_name: str, context: Optional[Dict] = None,
                                 debug_tracker=None) -> Optional[L1MatchResult]:
        """中文名关键词语义匹配

        从中文字段名中提取关键词，搜索规则库中匹配模式包含这些关键词的规则。
        例如："挂号医生身份证号码" → 提取 ["挂号", "医生", "身份证", "号码"]
        → 搜索规则库中 匹配模式 含 "挂号" AND "医生" 的规则。

        匹配策略：
        1. 提取中文关键词（2字及以上）
        2. 用关键词搜索规则库的匹配模式
        3. 选择匹配关键词最多的规则
        4. 仅接受匹配 >= 2 个关键词的结果
        """
        # 只处理包含中文的字段名
        import re as _re
        if not _re.search(r'[一-鿿]', field_name):
            return None

        if not self._all_rules:
            return None

        # 提取中文关键词（2字及以上）
        cn_chars = _re.findall(r'[一-鿿]+', field_name)
        keywords = []
        for seg in cn_chars:
            # 拆分为2字词
            for i in range(len(seg) - 1):
                word = seg[i:i+2]
                if word not in keywords:
                    keywords.append(word)
            # 也保留完整段
            if len(seg) >= 2 and seg not in keywords:
                keywords.append(seg)

        if not keywords:
            return None

        # 搜索规则库：规则的匹配模式中包含关键词
        best_rule = None
        best_match_count = 0
        best_match_keywords = []

        # 如果指定了域，只在该域中搜索
        rules_to_search = self._all_rules
        if context and "domain" in context:
            domain_id = context["domain"]
            if domain_id in self._domains:
                rules_to_search = self._domains[domain_id].rules

        for rule in rules_to_search:
            # 收集规则的所有可匹配文本
            match_texts = set()
            std_name = getattr(rule, 'standard_name', '') or ''
            match_pattern = getattr(rule, 'match_pattern', '') or ''
            if std_name:
                match_texts.add(std_name.lower())
            if match_pattern:
                for mp in match_pattern.split(","):
                    match_texts.add(mp.strip().lower())

            # 计算匹配的关键词数
            matched_kws = []
            for kw in keywords:
                kw_lower = kw.lower()
                for mt in match_texts:
                    if kw_lower in mt:
                        matched_kws.append(kw)
                        break

            if len(matched_kws) > best_match_count:
                best_match_count = len(matched_kws)
                best_rule = rule
                best_match_keywords = matched_kws

        # 至少匹配2个关键词才接受
        if best_rule and best_match_count >= 2:
            confidence = min(0.95, 0.5 + best_match_count * 0.1)
            value_expr = getattr(best_rule, 'value_expression', '') or ''
            result = L1MatchResult(
                standard_name=getattr(best_rule, 'standard_name', ''),
                value_expression=value_expr,
                confidence=confidence,
                resolution_status="resolved" if value_expr else "identified",
                rule=best_rule,
            )
            if debug_tracker:
                debug_tracker.record(
                    strategy="chinese_keyword",
                    candidate_name=f"{field_name} → {result.standard_name}",
                    score=confidence,
                    threshold=0.5,
                    passed=True,
                    reason=f"中文关键词匹配: {best_match_keywords} → {result.standard_name}",
                )
            return result

        return None

    def _match_alias(self, field_name: str, context: Optional[Dict] = None, debug_tracker=None) -> Optional[L1MatchResult]:
        """通过别名映射匹配字段

        匹配策略：
        1. 精确匹配（忽略大小写）
        2. 去掉下划线后匹配
        3. 别名表达式为空时，尝试用 ruleStandardName 查实际规则
        4. 仍为空时，尝试用别名关键词搜索规则
        """
        alias_data = self._find_alias_data(field_name)
        if not alias_data:
            if debug_tracker:
                debug_tracker.record(
                    strategy="alias",
                    candidate_name="(无匹配)",
                    score=0.0,
                    threshold=self._get_threshold("alias"),
                    passed=False,
                    reason=f"'{field_name}' 未在别名映射中找到",
                )
            return None

        alias_keyword = alias_data.get("keywords", [field_name])[0] if alias_data.get("keywords") else field_name

        # 如果别名表达式为空，尝试从实际规则获取
        alias_expr = alias_data.get("valueExpression", "")
        if not alias_expr and self._all_rules:
            # 策略A: 用 ruleStandardName 查规则（★ 传递别名域信息，优先匹配同域规则）
            std_name = alias_data.get("ruleStandardName", "")
            alias_domain = alias_data.get("domain", "")
            if std_name:
                rule_data = self._find_rule_data_by_name(std_name, preferred_domain=alias_domain)
                if rule_data and rule_data.get("valueExpression"):
                    alias_data = dict(alias_data)
                    alias_data["valueExpression"] = rule_data["valueExpression"]

        # 如果仍然为空，用别名关键词二次搜索（仅接受高置信度 >= 0.9）
        alias_expr = alias_data.get("valueExpression", "")
        if not alias_expr and self._all_rules:
            keywords = alias_data.get("keywords", [])
            for kw in keywords:
                kw_results = self.match_all(kw, context, top_n=1)
                if kw_results and kw_results[0].value_expression and kw_results[0].confidence >= 0.9:
                    alias_data = dict(alias_data)
                    alias_data["valueExpression"] = kw_results[0].value_expression
                    break

        rule = AliasRule(alias_data)
        has_expr = bool(alias_data.get("valueExpression"))
        confidence = 0.98 if has_expr else 0.85
        status = "resolved" if has_expr else "identified"

        if debug_tracker:
            alias_threshold = self._get_threshold("alias")
            passed = confidence >= alias_threshold
            reason = "" if passed else f"得分 {confidence:.2f} < alias阈值 {alias_threshold}"
            if not has_expr:
                reason = (reason + "；" if reason else "") + "别名已识别但表达式为空"
            debug_tracker.record(
                strategy="alias",
                candidate_name=f"{alias_keyword} → {rule.standard_name}",
                score=confidence,
                threshold=alias_threshold,
                passed=passed,
                reason=reason,
            )

        return L1MatchResult(rule, confidence, "alias", status)

    def _find_alias_data(self, field_name: str) -> Optional[Dict[str, Any]]:
        """在别名映射中查找字段"""
        normalized = field_name.strip().lower()

        if normalized in self._alias_map:
            return self._alias_map[normalized]

        no_underscore = normalized.replace("_", "").replace("-", "")
        for kw, alias_data in self._alias_map.items():
            if kw.replace("_", "").replace("-", "") == no_underscore:
                return alias_data

        return None

    @staticmethod
    def _normalize_name(name: str) -> str:
        """标准化名称：去下划线、转小写、去空格"""
        return name.strip().lower().replace('_', '').replace('-', '').replace(' ', '')

    def _find_rule_data_by_name(self, standard_name: str,
                                preferred_domain: str = "") -> Optional[Dict[str, Any]]:
        """根据标准名查找实际规则数据（支持名称变体匹配 + 域感知优先）

        尝试：精确匹配 → 标准化匹配 → 双向包含匹配
        自动跳过无效规则：? 占位符、dataRowId 未定义变量、空标准名

        ★ 域感知：当指定 preferred_domain 时，优先返回该域的规则，
        避免跨域匹配到错误的表达式（如检验域匹配到医嘱域的申请科室）。
        """
        target = standard_name.strip().lower()
        target_norm = self._normalize_name(target)
        if not target_norm:
            return None

        # 两轮查找：第一轮只在 preferred_domain 中找，第二轮全局找
        for domain_filter in ([preferred_domain, ""] if preferred_domain else [""]):
            for rule in self._all_rules:
                expr = rule.value_expression or ''
                if '?' in expr or 'dataRowId' in expr:
                    continue
                # 域过滤：第一轮只看指定域的规则
                if domain_filter and rule.domain != domain_filter:
                    continue
                name = rule.standard_name.strip().lower()
                name_norm = self._normalize_name(name)
                if not name_norm:
                    continue
                # 1. 精确匹配
                if name == target:
                    return rule.data
                # 2. 标准化后匹配（APP_DEPT_NAME ↔ APPDEPTNAME）
                if name_norm == target_norm:
                    return rule.data
                # 3. 双向包含匹配（DIAGNOSE ↔ diag, LAB_REPORT ↔ REPORT）
                if target_norm in name_norm or name_norm in target_norm:
                    return rule.data

        return None

    def match_all(self, field_name: str, context: Optional[Dict] = None,
                  top_n: int = 5, debug_tracker=None) -> List[L1MatchResult]:
        """匹配字段名，返回所有候选结果

        Args:
            field_name: 要匹配的字段名
            context: 上下文信息
            top_n: 返回前 N 个结果
            debug_tracker: 可选的 DebugTracker 用于记录匹配轨迹

        Returns:
            L1MatchResult 列表，按分数降序排列
        """
        if not self._all_rules:
            return []

        # 如果指定了域，只在该域中搜索
        rules_to_search = self._all_rules
        if context and "domain" in context:
            domain_id = context["domain"]
            if domain_id in self._domains:
                # 只在指定域中搜索
                rules_to_search = self._domains[domain_id].rules

        candidates: List[Tuple[float, Rule, str]] = []
        skipped_count = 0

        for rule in rules_to_search:
            expr = rule.value_expression or ''
            if '?' in expr or 'dataRowId' in expr:
                skipped_count += 1
                continue
            score, match_type = self._calculate_score(field_name, rule)
            if score > 0:
                candidates.append((score, rule, match_type))

        # 按分数降序排序
        candidates.sort(key=lambda x: x[0], reverse=True)

        # 去重（同一个 standardName 只保留最高分）
        seen = set()
        results = []
        rejected_for_debug = []  # 记录被阈值拒绝的候选

        for score, rule, match_type in candidates:
            if rule.standard_name in seen:
                continue
            seen.add(rule.standard_name)

            final_score = min(score, 1.0)
            type_threshold = self._get_threshold(match_type)

            if final_score >= type_threshold:
                # 判断表达式是否有效
                expr = rule.value_expression or ''
                if expr and '?' not in expr:
                    status = "resolved"
                else:
                    status = "identified"
                results.append(L1MatchResult(rule, final_score, match_type, status))
                if len(results) >= top_n:
                    break
            else:
                rejected_for_debug.append((final_score, rule, match_type, type_threshold))

        # debug 模式：记录所有尝试的候选（独立 seen 避免与结果收集冲突）
        if debug_tracker is not None:
            debug_seen = set()
            for score, rule, match_type in candidates:
                if rule.standard_name in debug_seen:
                    continue
                debug_seen.add(rule.standard_name)
                seen.add(rule.standard_name)
                final_score = min(score, 1.0)
                type_threshold = self._get_threshold(match_type)
                passed = final_score >= type_threshold
                reason = "" if passed else (
                    f"得分 {final_score:.3f} < {match_type}阈值 {type_threshold}"
                )
                debug_tracker.record(
                    strategy=match_type,
                    candidate_name=rule.standard_name,
                    score=final_score,
                    threshold=type_threshold,
                    passed=passed,
                    reason=reason,
                )

        # 无结果但存在被拒候选 → 兜底返回最高分候选（标记为 fallback）
        if not results and rejected_for_debug:
            best_score, best_rule, best_type, best_threshold = max(
                rejected_for_debug, key=lambda x: x[0]
            )
            if best_score >= self.fallback_threshold:
                expr = best_rule.value_expression or ''
                fallback_status = "resolved" if (expr and '?' not in expr) else "identified"
                results.append(L1MatchResult(
                    best_rule, best_score, f"fallback_{best_type}", fallback_status
                ))

        return results

    def _calculate_score(self, field_name: str, rule: Rule) -> Tuple[float, str]:
        """计算匹配分数

        Args:
            field_name: 输入的字段名
            rule: 规则

        Returns:
            (分数, 匹配类型) 元组
        """
        # 标准化：去掉空格，转小写
        normalized_input = field_name.strip().lower()
        normalized_standard = rule.standard_name.strip().lower()

        # 1. 精确匹配 standardName
        if normalized_input == normalized_standard:
            return 1.0, "exact"

        # 2. 匹配关键词列表
        for keyword in rule.match_keywords:
            normalized_keyword = keyword.strip().lower()
            if normalized_input == normalized_keyword:
                return 0.95, "exact"

        # 3. 正则匹配 fieldPattern
        pattern = rule.field_pattern
        if pattern:
            try:
                if re.match(f"^{pattern}$", field_name, re.IGNORECASE):
                    return 0.9, "pattern"
            except re.error:
                pass

        # 4. 包含匹配（关键词在字段名中，或字段名在关键词中）
        for keyword in rule.match_keywords:
            normalized_keyword = keyword.strip().lower()
            if not normalized_keyword:
                continue
            # 字段名包含关键词（如"医嘱项目编码"包含"项目编码"）
            if normalized_keyword in normalized_input:
                ratio = len(normalized_keyword) / len(normalized_input)
                # 关键词长度权重：短关键词匹配不可信
                length_weight = min(1.0, len(normalized_keyword) / 8)  # 8字符以上才满分
                score = (0.5 + ratio * 0.3) * length_weight  # 0.5 ~ 0.8，乘以长度权重
                if score >= 0.55:
                    return score, "keyword"
            # 关键词包含字段名
            if normalized_input in normalized_keyword:
                ratio = len(normalized_input) / len(normalized_keyword)
                length_weight = min(1.0, len(normalized_input) / 8)
                score = (0.4 + ratio * 0.3) * length_weight  # 0.4 ~ 0.7，乘以长度权重
                if score >= 0.55:
                    return score, "keyword"

        # 5. 模糊匹配（编辑距离）
        min_distance = float('inf')
        for keyword in rule.match_keywords:
            normalized_keyword = keyword.strip().lower()
            if not normalized_keyword:
                continue
            distance = self._levenshtein_distance(normalized_input, normalized_keyword)
            min_distance = min(min_distance, distance)

        # 编辑距离阈值：短字符串要求更严格
        max_distance = 1 if len(normalized_input) <= 5 else 2
        if min_distance <= max_distance:
            # 编辑距离分数：距离越小分数越高
            score = max(0.3, 0.7 - min_distance * 0.2)
            return score, "fuzzy"

        return 0.0, "none"

    @staticmethod
    def _levenshtein_distance(s1: str, s2: str) -> int:
        """计算编辑距离"""
        if len(s1) < len(s2):
            return L1RuleEngine._levenshtein_distance(s2, s1)

        if len(s2) == 0:
            return len(s1)

        previous_row = range(len(s2) + 1)
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row

        return previous_row[-1]

    def lookup_by_domain(self, domain_id: str) -> List[Rule]:
        """获取指定域的所有规则"""
        if domain_id in self._domains:
            return self._domains[domain_id].rules
        return []

    def get_domain_info(self, domain_id: str) -> Optional[DomainRules]:
        """获取域信息"""
        return self._domains.get(domain_id)

    def list_domains(self) -> List[str]:
        """列出所有域ID"""
        return list(self._domains.keys())
