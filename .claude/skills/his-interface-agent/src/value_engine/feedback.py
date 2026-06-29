"""匹配反馈自动回流

将用户手动提供的字段取值表达式自动写入别名 JSON 文件，
实现"越用越强"的自学习机制。
"""
import json
import os
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


class FeedbackCollector:
    """反馈收集器

    将用户提供的取值表达式记录到别名库，下次 L1 直接命中。
    """

    def __init__(self, rules_dir: Optional[Path] = None):
        if rules_dir is None:
            rules_dir = Path(__file__).parent.parent.parent / "rules"
        self._rules_dir = Path(rules_dir)
        self._common_dir = self._rules_dir / "common"

    def record(self, field_code: str, field_name_cn: str = "",
               value_expression: str = "", global_used: str = "",
               domain: str = "", standard_name: str = "",
               dry_run: bool = False) -> Dict[str, Any]:
        """记录一条反馈

        Args:
            field_code: 字段代码（作为关键词）
            field_name_cn: 字段中文名（作为关键词）
            value_expression: 取值表达式
            global_used: 使用的 Global
            domain: 域 ID
            standard_name: 标准字段名
            dry_run: 仅预览不写入

        Returns:
            {"status": "added"/"merged"/"skipped"/"error", "file": str, "message": str}
        """
        if not value_expression or not field_code:
            return {"status": "error", "file": "", "message": "字段代码和表达式不能为空"}

        # 确定目标文件
        target_file = self._find_target_file(domain)
        if not target_file:
            target_file = self._common_dir / "common-aliases.json"

        # 加载现有别名
        existing = self._load_aliases(target_file)
        aliases = existing.get("aliases", {})

        # 检查是否已存在
        exists_result = self._check_exists(field_code, aliases)
        if exists_result:
            existing_key, existing_entry = exists_result
            # 合并策略：添加新关键词，更新表达式
            merged = self._merge_entry(existing_entry, field_code, field_name_cn,
                                       value_expression, global_used, standard_name)
            if merged == existing_entry:
                return {"status": "skipped", "file": str(target_file),
                        "message": f"'{field_code}' 已存在且无需更新"}

            aliases[existing_key] = merged
            if dry_run:
                return {"status": "merged", "file": str(target_file),
                        "message": f"[DRY RUN] 将合并到 '{existing_key}': 新增关键词 {field_code}",
                        "preview": merged}
            return self._save(target_file, existing, aliases, "merged",
                             f"合并到 '{existing_key}'")

        # 新建条目
        entry_key = field_code.upper().replace(" ", "_")
        new_entry = {
            "keywords": self._build_keywords(field_code, field_name_cn),
            "ruleStandardName": standard_name or field_code.upper(),
            "valueExpression": value_expression,
            "global": global_used,
            "domain": domain or self._guess_domain_from_code(field_code),
            "description": f"用户反馈回流 {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        }
        aliases[entry_key] = new_entry

        if dry_run:
            return {"status": "added", "file": str(target_file),
                    "message": f"[DRY RUN] 将新增 '{entry_key}'",
                    "preview": new_entry}

        return self._save(target_file, existing, aliases, "added",
                         f"新增 '{entry_key}'")

    def record_batch(self, fields: List[Dict[str, str]],
                     domain: str = "", dry_run: bool = False) -> List[Dict[str, Any]]:
        """批量记录反馈

        Args:
            fields: [{"field_code": ..., "field_name_cn": ..., "value_expression": ..., ...}, ...]
            domain: 域 ID
            dry_run: 仅预览

        Returns:
            每条的结果列表
        """
        results = []
        for f in fields:
            result = self.record(
                field_code=f.get("field_code", ""),
                field_name_cn=f.get("field_name_cn", ""),
                value_expression=f.get("value_expression", ""),
                global_used=f.get("global_used", ""),
                domain=f.get("domain", domain),
                standard_name=f.get("standard_name", ""),
                dry_run=dry_run,
            )
            results.append(result)
        return results

    # ===== 私有方法 =====

    def _find_target_file(self, domain: str) -> Optional[Path]:
        """根据域 ID 查找目标别名文件"""
        if not domain:
            return None

        # 域 ID 格式: "10-patient" → 匹配 "patient" 或 "10"
        domain_parts = domain.lower().replace("-", " ").replace("_", " ").split()

        if not self._common_dir.exists():
            return None

        candidates = []
        for fname in os.listdir(str(self._common_dir)):
            if not fname.endswith('-aliases.json'):
                continue
            fname_lower = fname.lower()
            for part in domain_parts:
                if part in fname_lower:
                    candidates.append(self._common_dir / fname)
                    break

        if candidates:
            # 优先选最具体的（非 common/generic）
            specific = [c for c in candidates
                       if "common-aliases" not in c.name and "field-aliases" not in c.name]
            return specific[0] if specific else candidates[0]

        return None

    def _load_aliases(self, filepath: Path) -> Dict:
        """加载别名文件"""
        if filepath.exists():
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except (json.JSONDecodeError, OSError):
                pass
        return {"aliases": {}}

    def _save(self, filepath: Path, original: Dict, aliases: Dict,
              status: str, message: str) -> Dict:
        """保存别名文件（先备份）"""
        original["aliases"] = aliases
        original["_lastUpdated"] = datetime.now().strftime("%Y-%m-%d %H:%M")

        try:
            # 备份
            backup_path = filepath.with_suffix(filepath.suffix + ".bak")
            if filepath.exists():
                with open(filepath, 'r', encoding='utf-8') as f:
                    backup_content = f.read()
                with open(backup_path, 'w', encoding='utf-8') as f:
                    f.write(backup_content)

            # 写入
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(original, f, ensure_ascii=False, indent=2)

            return {"status": status, "file": str(filepath), "message": message}
        except OSError as e:
            return {"status": "error", "file": str(filepath), "message": str(e)}

    def _check_exists(self, field_code: str,
                      aliases: Dict[str, Dict]) -> Optional[Tuple[str, Dict]]:
        """检查字段代码是否已存在于别名中

        Returns:
            (existing_key, existing_entry) 或 None
        """
        code_lower = field_code.lower().strip()
        for key, entry in aliases.items():
            if not isinstance(entry, dict):
                continue
            keywords = entry.get("keywords", [])
            for kw in keywords:
                if kw.lower().strip() == code_lower:
                    return key, entry
        return None

    def _merge_entry(self, existing: Dict, field_code: str,
                     field_name_cn: str, value_expression: str,
                     global_used: str, standard_name: str) -> Dict:
        """合并反馈到现有条目"""
        merged = dict(existing)
        keywords = list(merged.get("keywords", []))

        changed = False
        for new_kw in [field_code, field_name_cn]:
            if new_kw and new_kw.strip():
                kw = new_kw.strip()
                if kw.lower() not in [k.lower() for k in keywords]:
                    keywords.append(kw)
                    changed = True

        merged["keywords"] = keywords

        # 更新表达式（仅当现有为空时）
        if not merged.get("valueExpression") and value_expression:
            merged["valueExpression"] = value_expression
            changed = True

        if global_used and not merged.get("global"):
            merged["global"] = global_used
            changed = True

        if standard_name and not merged.get("ruleStandardName"):
            merged["ruleStandardName"] = standard_name
            changed = True

        return merged

    def _build_keywords(self, field_code: str, field_name_cn: str) -> List[str]:
        """构建关键词列表"""
        keywords = []
        if field_code:
            keywords.append(field_code.strip())
        if field_name_cn and field_name_cn.strip():
            keywords.append(field_name_cn.strip())
        return keywords

    def _guess_domain_from_code(self, field_code: str) -> str:
        """从字段代码推测域"""
        code_upper = field_code.upper()
        domain_hints = {
            "PATIENT": "10-patient", "PAPER": "10-patient",
            "ADM": "20-visit", "PAADM": "20-visit",
            "DIAG": "30-diagnosis",
            "ORD": "40-order", "OEORD": "40-order",
            "LAB": "50-lab-exam", "EXAM": "50-lab-exam",
            "SURG": "60-surgery", "OPER": "60-surgery",
            "NUR": "70-nursing",
            "MED": "90-medical-record", "MR": "90-medical-record",
            "BILL": "a0-fee-settlement", "FEE": "a0-fee-settlement",
            "DRUG": "d0-pharmacy", "PHAR": "d0-pharmacy", "PHARM": "d0-pharmacy",
        }
        for hint, domain in domain_hints.items():
            if hint in code_upper:
                return domain
        return "common"
