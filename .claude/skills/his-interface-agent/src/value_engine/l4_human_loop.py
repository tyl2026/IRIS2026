"""L4 人工兜底交互工作流

当 L1/L2/L3 均无法解析字段时，通过结构化交互让人工提供取值表达式，
并自动回流到别名库。

两种模式：
- 交互模式 (--interactive): 逐字段询问用户
- 自动推测模式 (--auto-l4): 接受低于阈值的最佳匹配作为推测值
"""
from typing import Any, Dict, List, Optional, Tuple

from .feedback import FeedbackCollector


class L4HumanLoop:
    """L4 人工兜底处理器"""

    def __init__(self, feedback_collector: Optional[FeedbackCollector] = None):
        self._feedback = feedback_collector or FeedbackCollector()

    def prepare_interactive_prompt(self, unmatched: List[Dict],
                                   view_code: str = "",
                                   view_name: str = "",
                                   domain_hint: str = "") -> str:
        """为交互模式准备展示 prompt

        Args:
            unmatched: [{"code": ..., "name_cn": ..., "best_guess": ..., "suggestion": ...}, ...]
            view_code: 视图代码
            view_name: 视图名称
            domain_hint: 域提示

        Returns:
            格式化的交互提示文本
        """
        lines = [
            f"\n{'='*70}",
            f"  L4 人工兜底 — {view_name} ({view_code})",
            f"  以下 {len(unmatched)} 个字段未能自动解析，请逐字段提供取值表达式。",
            f"{'='*70}\n",
        ]

        for i, u in enumerate(unmatched, 1):
            code = u.get("code", "?")
            name_cn = u.get("name_cn", "")
            best = u.get("best_guess", {})
            suggestion = u.get("suggestion", "")

            lines.append(f"[{i}/{len(unmatched)}] {code}")
            if name_cn:
                lines.append(f"  中文名: {name_cn}")

            if best:
                lines.append(f"  最接近匹配: {best.get('name', '?')} "
                           f"(得分: {best.get('score', 0):.3f})")

            if suggestion:
                lines.append(f"  建议: {suggestion}")

            lines.append(f"  输入格式: <取值表达式> | <Global名称>")
            lines.append(f"  示例: $p($g(^PAPER(patDR,\"ALL\")),\"^\",1) | ^PAPER")
            lines.append(f"  输入 'skip' 跳过, 'auto' 接受最佳推测")
            lines.append("")

        return "\n".join(lines)

    def parse_user_input(self, user_input: str) -> Optional[Dict]:
        """解析用户的单字段输入

        支持格式:
        - 表达式: $p($g(^GLOBAL(id)),"^",N)
        - 表达式 | Global: $p($g(^GLOBAL(id)),"^",N) | ^GLOBAL
        - skip → None（跳过）
        - auto → {"_action": "auto"}（接受推测）

        Returns:
            {"valueExpression": ..., "globalUsed": ...} 或 None(skip) 或 {"_action": "auto"}
        """
        text = user_input.strip()
        if not text:
            return None

        if text.lower() in ("skip", "s", "跳过"):
            return None

        if text.lower() in ("auto", "a", "自动"):
            return {"_action": "auto"}

        # 解析 "表达式 | Global" 格式
        if "|" in text:
            parts = text.split("|", 1)
            return {
                "valueExpression": parts[0].strip(),
                "globalUsed": parts[1].strip() if len(parts) > 1 else "",
            }

        # 纯表达式
        return {
            "valueExpression": text,
            "globalUsed": "",
        }

    def auto_fill(self, unmatched: List[Dict],
                  l1_results: Optional[List] = None) -> List[Dict]:
        """自动推测模式：为未匹配字段接受最佳候选

        对每个未匹配字段，如果存在低于阈值的 L1 候选，
        接受它作为推测值（标记为 L4-auto + 极低置信度）。

        Args:
            unmatched: 未匹配字段列表
            l1_results: 对应的 L1 候选结果

        Returns:
            推测结果列表
        """
        results = []
        for i, u in enumerate(unmatched):
            best = u.get("best_guess", {})
            auto_result = {
                "field_code": u.get("code", ""),
                "field_name_cn": u.get("name_cn", ""),
                "value_expression": best.get("expression", ""),
                "global_used": best.get("global", ""),
                "confidence": min(best.get("score", 0.2), 0.4),
                "source": "L4-auto",
                "status": "auto_filled" if best.get("expression") else "unresolved",
            }
            results.append(auto_result)
        return results

    def record_feedback_batch(self, user_inputs: List[Dict],
                              domain: str = "",
                              dry_run: bool = False) -> List[Dict]:
        """批量记录用户提供的反馈

        Args:
            user_inputs: [{"field_code": ..., "field_name_cn": ..., "valueExpression": ..., "globalUsed": ...}, ...]
            domain: 域 ID
            dry_run: 是否仅预览

        Returns:
            每条的结果列表
        """
        results = []
        for inp in user_inputs:
            if inp.get("valueExpression"):
                r = self._feedback.record(
                    field_code=inp.get("field_code", ""),
                    field_name_cn=inp.get("field_name_cn", ""),
                    value_expression=inp.get("valueExpression", ""),
                    global_used=inp.get("globalUsed", ""),
                    domain=domain,
                    standard_name=inp.get("standard_name", ""),
                    dry_run=dry_run,
                )
                results.append(r)
        return results

    def generate_l4_summary(self, unmatched_fields: List[Dict],
                            domain_hint: str = "") -> Dict:
        """生成 L4 待处理摘要

        Returns:
            {"total": int, "fields": [...], "suggested_commands": [...]}
        """
        summary = {
            "total": len(unmatched_fields),
            "fields": [],
            "suggested_commands": [],
            "domain": domain_hint,
        }

        for u in unmatched_fields:
            field_info = {
                "code": u.get("code", ""),
                "name_cn": u.get("name_cn", ""),
                "best_guess": u.get("best_guess", {}),
                "suggestion": u.get("suggestion", ""),
            }
            summary["fields"].append(field_info)

            # 为 feedback 命令生成建议
            if u.get("code"):
                cmd = (
                    f'his-agent feedback --field "{u["code"]}" '
                    f'--name "{u.get("name_cn", "")}" '
                    f'--expr "<表达式>" '
                    f'--global "<Global>" '
                    f'--domain "{domain_hint}"'
                )
                summary["suggested_commands"].append(cmd)

        return summary


def format_unmatched_for_display(unmatched: List[Dict]) -> str:
    """格式化未匹配字段为紧凑的显示文本

    用于在代码生成完成后向用户展示需要人工处理的内容。
    """
    if not unmatched:
        return ""

    lines = [
        f"\n{'#'*60}",
        f"# L4 待处理: {len(unmatched)} 个字段未能自动取值",
        f"# 可用 his-agent feedback 命令逐条回流",
        f"{'#'*60}",
    ]

    for u in unmatched:
        code = u.get("code", "?")
        name_cn = u.get("name_cn", "")
        best = u.get("best_guess", {})
        lines.append(f"\n# {code}" + (f" ({name_cn})" if name_cn else ""))
        if best:
            lines.append(f"#   推测: {best.get('name', 'N/A')} (得分{best.get('score',0):.3f})")

    lines.append(f"\n{'#'*60}")
    return "\n".join(lines)
