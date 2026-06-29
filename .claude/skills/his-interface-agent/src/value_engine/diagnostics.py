"""匹配诊断报告

记录字段匹配的完整尝试轨迹，帮助快速定位匹配失败原因。
"""
import json
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class MatchAttempt:
    """单次匹配尝试"""
    strategy: str           # 尝试策略: "alias", "exact", "keyword", "fuzzy", "pattern"
    candidate_name: str     # 候选规则/别名名称
    score: float            # 得分
    threshold: float        # 该策略的阈值
    passed: bool            # 是否通过阈值
    reason: str = ""        # 拒绝/接受原因


@dataclass
class FieldMatchDiagnostic:
    """单个字段的完整匹配诊断"""
    field_code: str                          # 字段代码
    field_name_cn: str = ""                  # 字段中文名
    attempts: List[MatchAttempt] = field(default_factory=list)
    best_attempt: Optional[MatchAttempt] = None
    match_result: Optional[Any] = None       # L1MatchResult 或 ValueResult
    status: str = "unmatched"                # "resolved" | "identified" | "unmatched"
    suggestion: str = ""                     # 改进建议

    @property
    def is_matched(self) -> bool:
        return self.status != "unmatched"

    @property
    def has_expression(self) -> bool:
        return self.status == "resolved"


@dataclass
class MatchReport:
    """视图级匹配报告"""
    view_code: str
    view_name: str
    total_fields: int
    resolved: int         # 有表达式
    identified: int       # 匹配到规则但无表达式
    unmatched: int        # 完全未匹配
    diagnostics: List[FieldMatchDiagnostic] = field(default_factory=list)
    l2_suggestions: List[str] = field(default_factory=list)  # L2 MCP 搜索建议文本

    @property
    def match_rate(self) -> float:
        if self.total_fields == 0:
            return 0.0
        return (self.resolved + self.identified) / self.total_fields

    @property
    def resolution_rate(self) -> float:
        if self.total_fields == 0:
            return 0.0
        return self.resolved / self.total_fields

    def to_dict(self) -> Dict[str, Any]:
        return {
            "viewCode": self.view_code,
            "viewName": self.view_name,
            "totalFields": self.total_fields,
            "resolved": self.resolved,
            "identified": self.identified,
            "unmatched": self.unmatched,
            "matchRate": round(self.match_rate, 4),
            "resolutionRate": round(self.resolution_rate, 4),
            "diagnostics": [
                {
                    "fieldCode": d.field_code,
                    "fieldNameCn": d.field_name_cn,
                    "status": d.status,
                    "bestAttempt": {
                        "strategy": d.best_attempt.strategy,
                        "candidateName": d.best_attempt.candidate_name,
                        "score": d.best_attempt.score,
                        "reason": d.best_attempt.reason,
                    } if d.best_attempt else None,
                    "attempts": [
                        {
                            "strategy": a.strategy,
                            "candidateName": a.candidate_name,
                            "score": round(a.score, 4),
                            "threshold": a.threshold,
                            "passed": a.passed,
                            "reason": a.reason,
                        }
                        for a in d.attempts
                    ],
                    "suggestion": d.suggestion,
                }
                for d in self.diagnostics
            ],
        }

    def format_table(self) -> str:
        """格式化为控制台表格"""
        lines = []
        lines.append(f"\n{'='*80}")
        lines.append(f"  匹配诊断报告: {self.view_name} ({self.view_code})")
        lines.append(f"{'='*80}")
        lines.append(f"  总字段: {self.total_fields}  |  "
                     f"已解析: {self.resolved}  |  "
                     f"已识别: {self.identified}  |  "
                     f"未匹配: {self.unmatched}")
        lines.append(f"  匹配率: {self.match_rate:.0%}  |  "
                     f"解析率: {self.resolution_rate:.0%}")
        lines.append(f"{'='*80}")

        if self.unmatched > 0:
            lines.append(f"\n  --- 未匹配字段 ({self.unmatched}个) ---")
            for d in self.diagnostics:
                if d.status == "unmatched":
                    lines.append(f"\n  字段: {d.field_code}")
                    if d.field_name_cn:
                        lines.append(f"  中文名: {d.field_name_cn}")
                    if d.best_attempt:
                        lines.append(f"  最接近匹配: {d.best_attempt.candidate_name} "
                                     f"(策略={d.best_attempt.strategy}, "
                                     f"得分={d.best_attempt.score:.3f})")
                        lines.append(f"  拒绝原因: {d.best_attempt.reason}")
                    if d.suggestion:
                        lines.append(f"  建议: {d.suggestion}")
            if self.l2_suggestions:
                lines.append(f"\n  --- L2 MCP 搜索建议 ({len(self.l2_suggestions)}个字段) ---")
                for s in self.l2_suggestions:
                    lines.append(f"\n{s}")

        if self.identified > 0:
            lines.append(f"\n  --- 已识别但缺表达式字段 ({self.identified}个) ---")
            for d in self.diagnostics:
                if d.status == "identified":
                    lines.append(f"  {d.field_code} → {d.best_attempt.candidate_name if d.best_attempt else 'N/A'} "
                                 f"[{d.suggestion}]")

        lines.append(f"\n{'='*80}\n")
        return "\n".join(lines)

    def format_csv(self) -> str:
        """格式化为 CSV"""
        rows = ["field_code,field_name_cn,status,best_strategy,best_candidate,best_score,reason,suggestion"]
        for d in self.diagnostics:
            ba = d.best_attempt
            rows.append(
                f'"{d.field_code}","{d.field_name_cn}","{d.status}",'
                f'"{ba.strategy if ba else ""}","{ba.candidate_name if ba else ""}",'
                f'{ba.score if ba else ""},"{ba.reason if ba else ""}","{d.suggestion}"'
            )
        return "\n".join(rows)

    def format_json(self) -> str:
        """格式化为 JSON"""
        return json.dumps(self.to_dict(), ensure_ascii=False, indent=2)


class DebugTracker:
    """匹配尝试追踪器（注入 L1RuleEngine 收集调试信息）"""

    def __init__(self):
        self.attempts: List[MatchAttempt] = []
        self.field_code: str = ""
        self.field_name_cn: str = ""

    def reset(self, field_code: str, field_name_cn: str = ""):
        self.attempts = []
        self.field_code = field_code
        self.field_name_cn = field_name_cn

    def record(self, strategy: str, candidate_name: str,
               score: float, threshold: float, passed: bool, reason: str = ""):
        self.attempts.append(MatchAttempt(
            strategy=strategy,
            candidate_name=candidate_name,
            score=score,
            threshold=threshold,
            passed=passed,
            reason=reason,
        ))

    def to_diagnostic(self, match_result=None, status="unmatched",
                      suggestion="") -> FieldMatchDiagnostic:
        best = None
        if self.attempts:
            best = max(self.attempts, key=lambda a: a.score)
        return FieldMatchDiagnostic(
            field_code=self.field_code,
            field_name_cn=self.field_name_cn,
            attempts=list(self.attempts),
            best_attempt=best,
            match_result=match_result,
            status=status,
            suggestion=suggestion,
        )
