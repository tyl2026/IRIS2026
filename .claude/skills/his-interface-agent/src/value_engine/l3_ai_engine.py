"""L3 AI 推理引擎

不直接调用外部 API，而是为 LLM（当前对话中的 Claude）构建高质量的推理 prompt。
LLM 根据字段语义 + 上下文模式推断取值表达式。

使用方式：
1. 在 CLI generate 流程中，L1/L2 无法解析的字段交给 L3
2. L3 准备推理上下文（同视图已匹配字段 + 域规则参考）
3. 输出可直接用于 LLM 对话的推理 prompt
"""
import json
from typing import Any, Dict, List, Optional, Tuple

from .l1_rule_engine import L1RuleEngine


class L3InferencePrompt:
    """L3 推理 prompt"""

    def __init__(self, field_code: str, field_name_cn: str = "",
                 description: str = "", domain: str = ""):
        self.field_code = field_code
        self.field_name_cn = field_name_cn
        self.description = description
        self.domain = domain
        self.matched_context: List[Dict] = []     # 同视图已匹配字段
        self.related_rules: List[Dict] = []        # 域内相关规则
        self.best_l1_guess: Optional[Dict] = None  # L1 最接近匹配

    def build(self) -> str:
        """构建完整的推理 prompt"""
        parts = [
            "## L3 AI 推理请求",
            "",
            "请根据以下信息推断字段的 ObjectScript 取值表达式：",
            "",
            "### 目标字段",
            f"- 字段代码: `{self.field_code}`",
        ]
        if self.field_name_cn:
            parts.append(f"- 中文名: {self.field_name_cn}")
        if self.description:
            parts.append(f"- 描述: {self.description}")
        if self.domain:
            parts.append(f"- 业务域: {self.domain}")

        # 同视图已匹配字段（模式参考）
        if self.matched_context:
            parts.append("")
            parts.append("### 同视图已匹配字段（模式参考）")
            parts.append("以下字段已在同一接口文档中成功匹配，可参考其取值模式：")
            parts.append("")
            for m in self.matched_context[:10]:
                parts.append(
                    f"- `{m['code']}` ({m.get('name_cn', '')}) "
                    f"→ `{m['expression']}` "
                    f"[{m.get('global', '')}]"
                )

        # 域规则参考
        if self.related_rules:
            parts.append("")
            parts.append("### 域规则库参考")
            parts.append("以下为同域规则库中的相关取值规则：")
            parts.append("")
            for r in self.related_rules[:5]:
                parts.append(
                    f"- {r.get('standardName', '?')}: "
                    f"`{r.get('valueExpression', '')}` "
                    f"[{r.get('globalUsed', '')}]"
                )

        # L1 最接近匹配
        if self.best_l1_guess:
            parts.append("")
            parts.append("### L1 最接近匹配（低于置信度阈值）")
            parts.append(
                f"- {self.best_l1_guess.get('standardName', '?')} "
                f"(得分: {self.best_l1_guess.get('score', 0):.3f}, "
                f"策略: {self.best_l1_guess.get('matchType', '?')})"
            )

        parts.append("")
        parts.append("### 常见 ObjectScript 取值模式速查")
        parts.extend([
            "```",
            "$p($g(^PAPER(patDR,\"ALL\")),\"^\",N)   — 病人主索引 ^PAPER",
            "$p($g(^PAADM(adm)),\"^\",N)           — 就诊记录 ^PAADM",
            "$p($g(^OEORD(ordId)),\"^\",N)         — 医嘱主表 ^OEORD",
            "$p($g(^OEORD(0,\"ARCIM\",ordId,itm)),\"^\",N) — 医嘱项目 ^ARCIM",
            "$p($g(^CTLOC(deptDr)),\"^\",N)        — 科室 ^CTLOC",
            "$p($g(^CT(\"SEX\",id)),\"^\",N)        — 字典项 ^CT",
            "$p($g(^SSU(\"SSUSR\",userDr)),\"^\",N) — 用户 ^SSU",
            "$lg(^OEORD(0,\"Exec\",ordId,itm),N)   — ENS Global 列表取值",
            "```",
        ])

        parts.append("")
        parts.append("### 输出格式")
        parts.append("请用 JSON 格式输出推理结果：")
        parts.append("```json")
        parts.append("{")
        parts.append('  "valueExpression": "推断的 ObjectScript 表达式",')
        parts.append('  "globalUsed": "使用的 Global 名称",')
        parts.append('  "confidence": 0.0-1.0,')
        parts.append('  "reasoning": "推理依据（1-2句话）"')
        parts.append("}")
        parts.append("```")
        parts.append("如果无法推断，输出 `{\"valueExpression\": null, \"reasoning\": \"...\"}`")

        return "\n".join(parts)


class L3AIEngine:
    """L3 AI 推理引擎

    负责为未匹配字段构建推理 prompt，供 LLM 使用。
    """

    # 域 ID → 常见 Global 映射
    DOMAIN_GLOBALS = {
        "10-patient": ["^PAPER", "^PAPERi", "^CT(\"SEX\")", "^CT(\"Marital\")"],
        "20-visit": ["^PAADM", "^PAADMi", "^CTLOC", "^CTPCP"],
        "30-diagnosis": ["^MR(""ADM"")", "^MRC(""DT"")", "^MRC(""DXT"")"],
        "40-order": ["^OEORD", "^OEORDi", "^ARCIM", "^ARC(""Item"")"],
        "50-lab-exam": ["^OEORD", "^TCLAB", "^TCExams", "^TEPI"],
        "55-exam-report": ["^OEORD", "^TCLAB", "^TEPI"],
        "60-surgery": ["^OEORD", "^ORC(""ANMET"")", "^OR(""ANAESTH"")"],
        "70-nursing": ["^PAADM", "^NUR"],
        "90-medical-record": ["^MR(""ADM"")", "^PAADM", "^MRC"],
        "a0-fee-settlement": ["^DHCOP", "^DHCBill", "^INCI"],
        "d0-pharmacy": ["^INCI", "^ARCIM", "^PHC(""PO"")"],
    }

    def __init__(self, l1_engine: Optional[L1RuleEngine] = None):
        self._l1 = l1_engine

    def build_inference_prompt(self, field_code: str, field_name_cn: str = "",
                               description: str = "", domain_hint: str = "",
                               matched_fields: Optional[List[Dict]] = None,
                               best_l1: Optional[Any] = None) -> str:
        """为单个字段构建推理 prompt

        Args:
            field_code: 字段代码
            field_name_cn: 字段中文名
            description: 字段描述
            domain_hint: 域提示
            matched_fields: [{"code": ..., "name_cn": ..., "expression": ..., "global": ...}, ...]
            best_l1: L1 的最接近匹配结果（低于阈值）

        Returns:
            可直接用于 LLM 的推理 prompt 文本
        """
        prompt = L3InferencePrompt(
            field_code=field_code,
            field_name_cn=field_name_cn,
            description=description,
            domain=domain_hint,
        )

        if matched_fields:
            prompt.matched_context = matched_fields

        if best_l1:
            prompt.best_l1_guess = {
                "standardName": best_l1.standard_name if hasattr(best_l1, 'standard_name') else str(best_l1),
                "score": best_l1.confidence if hasattr(best_l1, 'confidence') else 0,
                "matchType": best_l1.match_type if hasattr(best_l1, 'match_type') else "unknown",
            }

        # 搜索域规则
        if self._l1 and domain_hint:
            try:
                domain_rules = self._l1.lookup_by_domain(domain_hint)
                if domain_rules:
                    prompt.related_rules = [
                        {
                            "standardName": r.standard_name,
                            "valueExpression": r.value_expression,
                            "globalUsed": r.global_used,
                        }
                        for r in domain_rules.rules[:5]
                        if r.value_expression
                    ]
            except Exception:
                pass

        return prompt.build()

    def batch_inference_prompts(self, unmatched: List[Dict],
                                view_context: Optional[Dict] = None,
                                domain_hint: str = "") -> str:
        """为一组未匹配字段批量构建推理 prompt

        Args:
            unmatched: [{"code": ..., "name_cn": ..., "description": ...}, ...]
            view_context: 视图上下文（包含已匹配字段列表等）
            domain_hint: 域提示

        Returns:
            合并后的推理 prompt
        """
        if len(unmatched) == 1:
            u = unmatched[0]
            matched = view_context.get("matched", []) if view_context else []
            return self.build_inference_prompt(
                field_code=u.get("code", ""),
                field_name_cn=u.get("name_cn", ""),
                description=u.get("description", ""),
                domain_hint=domain_hint,
                matched_fields=matched,
            )

        # 多字段合并 prompt
        parts = [
            "## L3 AI 批量推理请求",
            "",
            f"以下 {len(unmatched)} 个字段需要推断取值表达式。",
            f"业务域: {domain_hint or '未指定'}",
            "",
        ]

        # 已匹配字段参考
        if view_context and view_context.get("matched"):
            parts.append("### 同视图已匹配字段（模式参考）")
            for m in view_context["matched"][:10]:
                parts.append(
                    f"- `{m['code']}` → `{m['expression']}` [{m.get('global', '')}]"
                )
            parts.append("")

        # 列出未匹配字段
        parts.append("### 待推断字段")
        parts.append("| # | 字段代码 | 中文名 | 描述 |")
        parts.append("|---|---------|--------|------|")
        for i, u in enumerate(unmatched, 1):
            parts.append(
                f"| {i} | `{u.get('code', '?')}` | {u.get('name_cn', '')} | "
                f"{u.get('description', '')[:30]} |"
            )
        parts.append("")

        parts.append("### 输出格式")
        parts.append("请对每个字段输出 JSON 数组：")
        parts.append("```json")
        parts.append("[")
        for i, u in enumerate(unmatched):
            comma = "," if i < len(unmatched) else ""
            parts.append("  {")
            parts.append(f'    "fieldCode": "{u.get("code", "")}",')
            parts.append(f'    "valueExpression": "表达式或 null",')
            parts.append(f'    "globalUsed": "Global",')
            parts.append(f'    "confidence": 0.5,')
            parts.append(f'    "reasoning": "..."')
            parts.append(f'  }}{comma}')
        parts.append("]")
        parts.append("```")

        return "\n".join(parts)

    @classmethod
    def get_domain_globals(cls, domain: str) -> List[str]:
        """获取指定域的常见 Global 列表"""
        for key, globals_list in cls.DOMAIN_GLOBALS.items():
            if key in domain or domain in key:
                return globals_list
        return ["^PAPER", "^PAADM", "^OEORD"]  # 默认通用 Global

    @staticmethod
    def parse_llm_response(response: str) -> List[Dict]:
        """解析 LLM 返回的推理结果

        支持单对象 `{...}` 或数组 `[{...}, ...]` 格式。
        """
        # 尝试提取 JSON 块
        import re
        json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', response)
        if json_match:
            response = json_match.group(1)

        # 尝试解析
        try:
            parsed = json.loads(response.strip())
            if isinstance(parsed, dict):
                return [parsed]
            if isinstance(parsed, list):
                return parsed
        except json.JSONDecodeError:
            # 尝试修复常见格式问题
            pass

        # 尝试逐个提取 JSON 对象
        results = []
        for match in re.finditer(r'\{[^{}]*\}', response):
            try:
                obj = json.loads(match.group())
                results.append(obj)
            except json.JSONDecodeError:
                continue

        return results
