"""规则库质量评估系统

提供规则库健康度检查：零匹配检测、冲突发现、Global 有效性验证。
通过 SQLite 记录匹配历史，支持趋势分析。
"""
import json
import os
import re
import sqlite3
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple


class MatchHistoryDB:
    """匹配历史记录数据库（SQLite）

    记录每次 generate 运行时的字段匹配情况，用于质量分析。
    """

    def __init__(self, db_path: Optional[Path] = None):
        if db_path is None:
            db_path = Path(__file__).parent.parent.parent / "data" / "match_history.db"
        self._db_path = Path(db_path)
        self._db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(str(self._db_path)) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS match_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    view_code TEXT,
                    field_code TEXT NOT NULL,
                    field_name_cn TEXT,
                    match_status TEXT NOT NULL,
                    matched_rule TEXT,
                    match_type TEXT,
                    confidence REAL,
                    source TEXT,
                    domain TEXT,
                    document_file TEXT
                )
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_field_code ON match_log(field_code)
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_match_status ON match_log(match_status)
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_matched_rule ON match_log(matched_rule)
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_timestamp ON match_log(timestamp)
            """)
            conn.commit()

    def log_match(self, field_code: str, match_status: str,
                  matched_rule: str = "", match_type: str = "",
                  confidence: float = 0.0, source: str = "",
                  field_name_cn: str = "", domain: str = "",
                  view_code: str = "", document_file: str = ""):
        """记录一条匹配"""
        with sqlite3.connect(str(self._db_path)) as conn:
            conn.execute(
                """INSERT INTO match_log
                   (timestamp, view_code, field_code, field_name_cn, match_status,
                    matched_rule, match_type, confidence, source, domain, document_file)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (datetime.now().isoformat(), view_code, field_code, field_name_cn,
                 match_status, matched_rule, match_type, confidence, source,
                 domain, document_file),
            )
            conn.commit()

    def log_batch(self, fields: List[Dict], view_code: str = "",
                  document_file: str = ""):
        """批量记录匹配"""
        with sqlite3.connect(str(self._db_path)) as conn:
            now = datetime.now().isoformat()
            rows = []
            for f in fields:
                rows.append((
                    now, view_code,
                    f.get("field_code", ""),
                    f.get("field_name_cn", ""),
                    f.get("match_status", "unknown"),
                    f.get("matched_rule", ""),
                    f.get("match_type", ""),
                    f.get("confidence", 0.0),
                    f.get("source", ""),
                    f.get("domain", ""),
                    document_file,
                ))
            conn.executemany(
                """INSERT INTO match_log
                   (timestamp, view_code, field_code, field_name_cn, match_status,
                    matched_rule, match_type, confidence, source, domain, document_file)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                rows,
            )
            conn.commit()

    def get_rule_stats(self, limit: int = 100) -> List[Dict]:
        """获取规则匹配统计"""
        with sqlite3.connect(str(self._db_path)) as conn:
            conn.row_factory = sqlite3.Row
            rows = conn.execute("""
                SELECT matched_rule,
                       COUNT(*) as total_matches,
                       AVG(confidence) as avg_confidence,
                       MAX(timestamp) as last_matched,
                       SUM(CASE WHEN match_status = 'resolved' THEN 1 ELSE 0 END) as resolved_count,
                       SUM(CASE WHEN match_status = 'identified' THEN 1 ELSE 0 END) as identified_count,
                       SUM(CASE WHEN match_status = 'unmatched' THEN 1 ELSE 0 END) as unmatched_count
                FROM match_log
                WHERE matched_rule != ''
                GROUP BY matched_rule
                ORDER BY total_matches DESC
                LIMIT ?
            """, (limit,))
            return [dict(r) for r in rows]

    def get_unmatched_fields(self, limit: int = 50) -> List[Dict]:
        """获取常见未匹配字段"""
        with sqlite3.connect(str(self._db_path)) as conn:
            conn.row_factory = sqlite3.Row
            rows = conn.execute("""
                SELECT field_code, COUNT(*) as count
                FROM match_log
                WHERE match_status = 'unmatched'
                GROUP BY field_code
                ORDER BY count DESC
                LIMIT ?
            """, (limit,))
            return [dict(r) for r in rows]

    @property
    def total_records(self) -> int:
        with sqlite3.connect(str(self._db_path)) as conn:
            row = conn.execute("SELECT COUNT(*) FROM match_log").fetchone()
            return row[0] if row else 0


class RuleQualityAnalyzer:
    """规则库质量分析器"""

    # 已知有效的 IRIS Global 前缀
    KNOWN_GLOBALS = {
        "^PAPER", "^PAPERi", "^PAADM", "^PAADMi",
        "^OEORD", "^OEORDi", "^ARCIM", "^ARC(",
        "^CTLOC", "^CTPCP", "^CT(", "^MRC(", "^MR(",
        "^SSU(", "^INCI", "^DHCOP", "^DHCBill",
        "^TCLAB", "^TEPI", "^TCExams", "^ORC(",
        "^OR(", "^NUR", "^PHC(", "^DOC",
    }

    def __init__(self, rules_dir: Optional[Path] = None,
                 history_db: Optional[MatchHistoryDB] = None):
        if rules_dir is None:
            rules_dir = Path(__file__).parent.parent.parent / "rules"
        self._rules_dir = Path(rules_dir)
        self._db = history_db or MatchHistoryDB()

    def find_stale_rules(self, min_days_since_last_match: int = 30) -> List[Dict]:
        """查找长期未被匹配的规则"""
        if self._db.total_records == 0:
            return []
        stats = self._db.get_rule_stats(limit=500)
        now = datetime.now()
        stale = []
        for s in stats:
            last = s.get("last_matched", "")
            if last:
                try:
                    last_dt = datetime.fromisoformat(last)
                    days = (now - last_dt).days
                    if days >= min_days_since_last_match:
                        s["days_since_last_match"] = days
                        stale.append(s)
                except (ValueError, TypeError):
                    pass
        return stale

    def find_conflicts(self) -> List[Dict]:
        """查找别名冲突（同一关键词 → 不同规则标准名）"""
        # 从别名 JSON 文件中提取
        common_dir = self._rules_dir / "common"
        if not common_dir.exists():
            return []

        # 构建 keyword → [standard_names] 映射
        kw_map: Dict[str, Set[str]] = defaultdict(set)
        for fname in os.listdir(str(common_dir)):
            if not fname.endswith("-aliases.json"):
                continue
            try:
                with open(common_dir / fname, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                aliases = data.get("aliases", {}) if isinstance(data, dict) else {}
                for key, entry in aliases.items():
                    if not isinstance(entry, dict):
                        continue
                    std_name = entry.get("ruleStandardName", key)
                    for kw in entry.get("keywords", []):
                        kw_map[kw.lower()].add(std_name)
            except (json.JSONDecodeError, OSError):
                continue

        conflicts = []
        for kw, std_names in kw_map.items():
            if len(std_names) > 1:
                conflicts.append({
                    "keyword": kw,
                    "standard_names": list(std_names),
                })

        return sorted(conflicts, key=lambda x: -len(x["standard_names"]))

    def validate_global_references(self, rule_expressions: List[Dict]
                                   ) -> List[Dict]:
        """检查表达式中的 Global 引用是否有效

        Args:
            rule_expressions: [{"standardName": ..., "valueExpression": ...}, ...]

        Returns:
            可疑引用列表
        """
        suspicious = []
        for rule in rule_expressions:
            expr = rule.get("valueExpression", "")
            if not expr:
                continue
            # 提取表达式中的 Global 引用
            globals_found = re.findall(r'\^[\w("]+', expr)
            for g in globals_found:
                # 检查是否匹配任何已知 Global
                is_known = any(g.startswith(kg) for kg in self.KNOWN_GLOBALS)
                if not is_known and g not in ("^CacheTemp", "^TMP", "^||"):
                    suspicious.append({
                        "standardName": rule.get("standardName", "?"),
                        "unrecognizedGlobal": g,
                        "expression": expr[:100],
                    })
        return suspicious

    def analyze_domain(self, domain_id: str) -> Dict:
        """分析指定域的健康状况"""
        # 加载域规则
        from ..utils.markdown_parser import MarkdownRuleParser
        parser = MarkdownRuleParser()
        domain_path = self._rules_dir / "domains" / f"{domain_id}.md"
        if not domain_path.exists():
            return {"error": f"域文件不存在: {domain_path}"}

        domain_rules = parser.parse_file(domain_path)
        if not domain_rules:
            return {"error": "无法解析域规则"}

        rules = domain_rules.rules if hasattr(domain_rules, 'rules') else []

        # 统计
        total = len(rules)
        with_expr = sum(1 for r in rules if r.value_expression and "?" not in r.value_expression)
        without_expr = total - with_expr
        empty_keywords = sum(1 for r in rules if not r.match_keywords)

        # 从历史获取匹配统计
        matched_rules = set()
        if self._db.total_records > 0:
            stats = self._db.get_rule_stats(limit=500)
            matched_rules = {s["matched_rule"] for s in stats if s["total_matches"] > 0}

        never_matched = [r.standard_name for r in rules
                        if r.standard_name not in matched_rules]

        return {
            "domain": domain_id,
            "name": domain_rules.metadata.get("name", ""),
            "total_rules": total,
            "with_expression": with_expr,
            "without_expression": without_expr,
            "empty_keywords": empty_keywords,
            "never_matched": never_matched[:20],
            "never_matched_count": len(never_matched),
            "coverage_rate": with_expr / total if total > 0 else 0,
        }

    def generate_quality_report(self) -> str:
        """生成完整的规则库质量报告"""
        lines = [
            f"\n{'='*70}",
            f"  规则库质量报告",
            f"  生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M')}",
            f"{'='*70}\n",
        ]

        # 1. 冲突检查
        conflicts = self.find_conflicts()
        if conflicts:
            lines.append(f"[!] 别名冲突: {len(conflicts)} 个关键词指向多个规则标准名")
            for c in conflicts[:10]:
                lines.append(f"    '{c['keyword']}' → {', '.join(c['standard_names'])}")
        else:
            lines.append("[OK] 未发现别名冲突")
        lines.append("")

        # 2. 僵尸规则
        if self._db.total_records > 0:
            stale = self.find_stale_rules(min_days_since_last_match=14)
            if stale:
                lines.append(f"[!] 长期未匹配规则 (>{14}天): {len(stale)} 条")
                for s in stale[:10]:
                    lines.append(f"    {s['matched_rule']}: 最后匹配 {s['days_since_last_match']} 天前")
            else:
                lines.append("[OK] 无长期未匹配规则")
        else:
            lines.append("[i] 无匹配历史数据，跳过僵尸规则检查")
        lines.append("")

        # 3. 高频未匹配字段
        if self._db.total_records > 0:
            unmatched = self._db.get_unmatched_fields(limit=20)
            if unmatched:
                lines.append(f"[i] 高频未匹配字段 (Top {len(unmatched)}):")
                for u in unmatched[:10]:
                    lines.append(f"    {u['field_code']}: {u['count']} 次")
        lines.append("")

        lines.append(f"{'='*70}")
        return "\n".join(lines)

    def list_all_domains_stats(self) -> List[Dict]:
        """列出所有域的基本统计"""
        domains_dir = self._rules_dir / "domains"
        if not domains_dir.exists():
            return []

        results = []
        for fname in sorted(os.listdir(str(domains_dir))):
            if not fname.endswith(".md"):
                continue
            domain_id = fname.replace(".md", "")
            try:
                stats = self.analyze_domain(domain_id)
                results.append(stats)
            except Exception:
                results.append({"domain": domain_id, "error": "解析失败"})

        return results
