"""字段名标准化预处理器

对文档中提取的字段名进行多种标准化变换，生成候选变体列表供匹配引擎多轮尝试。
解决文档字段名与规则库关键词之间的格式差异（前缀、分隔符、拼音缩写等）。
"""
import re
from pathlib import Path
from typing import Dict, List, Optional


class FieldNameNormalizer:
    """字段名标准化器

    对原始字段名应用多种变换策略，生成排序后的候选变体列表。
    变体按优先级排序：最可能的匹配形式排在前面。
    """

    # 常见前缀（大小写不敏感）
    COMMON_PREFIXES = [
        "v_", "t_", "tmp_", "his_", "ext_", "m_",
        "V_", "T_", "TMP_", "HIS_", "EXT_", "M_",
    ]

    # 分隔符模式
    SEPARATOR_PATTERN = re.compile(r'[_\-.]+')

    # camelCase 分词模式
    CAMEL_SPLIT = re.compile(r'(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])')

    def __init__(self, alias_map: Optional[Dict[str, dict]] = None):
        """初始化标准化器

        Args:
            alias_map: 别名映射表 {keyword: alias_data}，用于构建拼音缩写→全称的反向查找
        """
        self._alias_map = alias_map or {}
        self._pinyin_reverse: Optional[Dict[str, List[str]]] = None  # 延迟构建

    def build_pinyin_reverse(self):
        """从别名映射表构建拼音缩写→英文全称的反向查找表

        例如: "HZXM" → ["PATIENT_NAME", "NAME"]
        """
        if self._pinyin_reverse is not None:
            return

        self._pinyin_reverse = {}
        for keyword, alias_data in self._alias_map.items():
            std_name = alias_data.get("ruleStandardName", "")
            if not std_name:
                continue

            # 收集所有原始关键词（保留大小写以便检测拼音缩写）
            all_keywords = set()
            all_keywords.add(keyword)  # 保留原始大小写
            for kw in alias_data.get("keywords", []):
                all_keywords.add(kw)   # 保留原始大小写

            for kw in all_keywords:
                # 全大写、纯字母、短长度 → 可能是拼音首字母缩写
                if kw and kw.isalpha() and kw.isupper() and len(kw) <= 6:
                    if kw not in self._pinyin_reverse:
                        self._pinyin_reverse[kw] = []
                    if std_name not in self._pinyin_reverse[kw]:
                        self._pinyin_reverse[kw].append(std_name)

    def normalize(self, field_name: str, max_variants: int = 5) -> List[str]:
        """对字段名应用多种标准化变换，返回候选变体列表

        Args:
            field_name: 原始字段名
            max_variants: 最多返回的变体数

        Returns:
            排序后的变体列表，原始输入排在第一位
        """
        if not field_name or not field_name.strip():
            return [field_name] if field_name else []

        original = field_name.strip()
        variants = [original]  # 原始形式始终排第一
        seen = {original.lower()}

        # 1. 全小写
        lower_v = original.lower()
        if lower_v not in seen:
            variants.append(lower_v)
            seen.add(lower_v)

        # 2. 全大写
        upper_v = original.upper()
        if upper_v not in seen:
            variants.append(upper_v)
            seen.add(upper_v)

        # 3. 去前缀变体
        for prefix in self.COMMON_PREFIXES:
            if original.lower().startswith(prefix.lower()):
                stripped = original[len(prefix):]
                if stripped and stripped.lower() not in seen:
                    variants.append(stripped)
                    seen.add(stripped.lower())
                break  # 只去第一个匹配的前缀

        # 4. 去分隔符变体（下划线/横线/点）
        no_sep = self.SEPARATOR_PATTERN.sub('', original)
        if no_sep != original and no_sep.lower() not in seen:
            variants.append(no_sep)
            seen.add(no_sep.lower())

        # 5. 驼峰分词后重组（PatName → PAT_NAME, pat_name, Pat Name 等）
        tokens = self._tokenize(original)
        if len(tokens) > 1:
            # 下划线连接大写
            snake_upper = '_'.join(t.upper() for t in tokens)
            if snake_upper.lower() not in seen:
                variants.append(snake_upper)
                seen.add(snake_upper.lower())

            # 下划线连接小写
            snake_lower = '_'.join(t.lower() for t in tokens)
            if snake_lower.lower() not in seen:
                variants.append(snake_lower)
                seen.add(snake_lower.lower())

            # 直接拼接
            joined = ''.join(tokens)
            if joined.lower() not in seen:
                variants.append(joined)
                seen.add(joined.lower())

        # 6. 拼音缩写→英文全称尝试
        if self._pinyin_reverse is None and self._alias_map:
            self.build_pinyin_reverse()

        if self._pinyin_reverse and original.isupper() and original.isalpha():
            expansions = self._pinyin_reverse.get(original, [])
            for exp in expansions[:2]:  # 最多取2个展开
                if exp.lower() not in seen:
                    variants.append(exp)
                    seen.add(exp.lower())

        # 7. 去数字后缀（FIELD_01 → FIELD）
        suffix_stripped = re.sub(r'[_\-. ]*\d+$', '', original)
        if suffix_stripped and suffix_stripped != original and suffix_stripped.lower() not in seen:
            variants.append(suffix_stripped)
            seen.add(suffix_stripped.lower())

        return variants[:max_variants]

    def _tokenize(self, name: str) -> List[str]:
        """将字段名分词为 token 列表

        处理下划线/横线/点分隔 和 驼峰命名。
        """
        # 先用分隔符拆分
        parts = self.SEPARATOR_PATTERN.split(name)
        tokens = []
        for part in parts:
            if not part:
                continue
            # 对每个部分再按驼峰拆分
            sub_tokens = self.CAMEL_SPLIT.split(part)
            tokens.extend(t for t in sub_tokens if t)
        return tokens

    @classmethod
    def from_alias_files(cls, rules_dir: Optional[Path] = None) -> 'FieldNameNormalizer':
        """从别名 JSON 文件构建标准化器

        Args:
            rules_dir: 规则目录路径

        Returns:
            配置好的 FieldNameNormalizer 实例
        """
        import json
        import os

        if rules_dir is None:
            rules_dir = Path(__file__).parent.parent.parent / "rules"

        common_dir = rules_dir / "common" if not str(rules_dir).endswith("common") else rules_dir
        if not common_dir.exists():
            return cls({})

        alias_map: Dict[str, dict] = {}
        for fname in os.listdir(str(common_dir)):
            if fname.endswith('-aliases.json'):
                fpath = common_dir / fname
                try:
                    with open(fpath, 'r', encoding='utf-8') as f:
                        entries = json.load(f)
                    # 支持两种格式: list of entries 或 {"aliases": {key: entry}} dict
                    alias_entries = []
                    if isinstance(entries, list):
                        alias_entries = entries
                    elif isinstance(entries, dict):
                        alias_entries = list(entries.get("aliases", {}).values())
                    for entry in alias_entries:
                        keywords = entry.get("keywords", [])
                        for kw in keywords:
                            alias_map[kw.lower()] = entry
                except (json.JSONDecodeError, OSError):
                    pass

        return cls(alias_map)
