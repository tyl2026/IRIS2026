"""表头映射引擎

将各种文档的列名映射到统一字段名。
通过 YAML 配置文件驱动，新增格式只需添加配置。
"""

import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import yaml


class HeaderMapper:
    """表头映射器"""

    def __init__(self, config_path: Optional[str] = None):
        """初始化映射器

        Args:
            config_path: 配置文件路径，默认使用 config/header_mapping.yaml
        """
        if config_path is None:
            config_path = str(Path(__file__).parent / "config" / "header_mapping.yaml")

        self._config = self._load_config(config_path)
        self._field_mappings = self._build_field_mappings()

    def _load_config(self, config_path: str) -> dict:
        """加载 YAML 配置文件"""
        path = Path(config_path)
        if not path.exists():
            raise FileNotFoundError(f"配置文件不存在: {config_path}")

        with open(path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)

    def _build_field_mappings(self) -> Dict[str, List[str]]:
        """构建字段映射表：统一字段名 → 变体列表（小写）"""
        mappings = {}
        fields_config = self._config.get("fields", {})

        for unified_name, variants in fields_config.items():
            if variants:
                mappings[unified_name] = [v.strip().lower() for v in variants]

        return mappings

    def map_header(self, header_row: List[str]) -> Dict[int, str]:
        """将表头行映射到统一字段名

        Args:
            header_row: 表头行，如 ['序号', '字段名', '数据类型', '字段说明']

        Returns:
            映射结果：{列索引: 统一字段名}
            未映射的列不会出现在结果中
        """
        mapping = {}

        for col_idx, raw_name in enumerate(header_row):
            if raw_name is None:
                continue

            # 清理：去掉换行符、前后空格、转小写
            cleaned = raw_name.replace('\n', '').replace('\r', '').strip().lower()
            if not cleaned:
                continue

            # 尝试匹配每个统一字段的变体
            for unified_name, variants in self._field_mappings.items():
                if cleaned in variants:
                    mapping[col_idx] = unified_name
                    break

        return mapping

    def resolve_ambiguity(self, mapping: Dict[int, str],
                          data_rows: List[List[str]]) -> Dict[int, str]:
        """解决映射歧义

        某些列名（如"字段名称"）在不同文档中含义不同：
        - 有些文档中是字段代码（HOSPITAL_ID）
        - 有些文档中是中文名（医院代码）

        通过检查实际数据内容来判断。

        Args:
            mapping: 初始映射结果
            data_rows: 数据行列表

        Returns:
            修正后的映射结果
        """
        # 检查是否有多个列映射到同一个字段
        reverse_map: Dict[str, List[int]] = {}
        for col_idx, field_name in mapping.items():
            if field_name not in reverse_map:
                reverse_map[field_name] = []
            reverse_map[field_name].append(col_idx)

        # 如果某个字段有多个列映射，需要判断哪个是真正的
        for field_name, col_indices in reverse_map.items():
            if len(col_indices) <= 1:
                continue

            if field_name == "field_chinese_name":
                self._resolve_chinese_name_ambiguity(mapping, col_indices, data_rows)

        # 交叉校验：检测 field_name 与 field_chinese_name 是否互换
        mapping = self.detect_and_fix_swap(mapping, data_rows)

        return mapping

    def _sample_column_data(self, col_indices: List[int],
                            data_rows: List[List[str]],
                            sample_size: int = 15) -> Dict[int, List[str]]:
        """采集指定列的样本数据（前 N 行非空值）"""
        col_samples: Dict[int, List[str]] = {}
        for col_idx in col_indices:
            samples = []
            for row in data_rows[:sample_size]:
                if col_idx < len(row) and row[col_idx]:
                    val = str(row[col_idx]).strip()
                    if val:
                        samples.append(val)
            col_samples[col_idx] = samples
        return col_samples

    def _resolve_chinese_name_ambiguity(self, mapping: Dict[int, str],
                                         col_indices: List[int],
                                         data_rows: List[List[str]]):
        """解决 field_chinese_name 的歧义

        如果有多个列都映射到 field_chinese_name，检查数据内容：
        - 包含中文字符的列 → field_chinese_name
        - 全是英文/数字/下划线的列 → field_name
        """
        col_samples = self._sample_column_data(col_indices, data_rows, sample_size=15)

        # 判断哪些列是中文名，哪些是字段代码
        chinese_cols = []
        code_cols = []

        for col_idx, samples in col_samples.items():
            if not samples:
                continue

            has_chinese = any(re.search(r'[一-鿿]', s) for s in samples)
            all_code = all(re.match(r'^[A-Za-z0-9_]+$', s) for s in samples)

            if has_chinese:
                chinese_cols.append(col_idx)
            elif all_code:
                code_cols.append(col_idx)

        # 修正映射
        for col_idx in code_cols:
            mapping[col_idx] = "field_name"

        if len(chinese_cols) > 1:
            for col_idx in chinese_cols[1:]:
                mapping[col_idx] = "description"

    def detect_and_fix_swap(self, mapping: Dict[int, str],
                            data_rows: List[List[str]]) -> Dict[int, str]:
        """检测并修复 field_name 与 field_chinese_name 的互换

        当文档列名模糊时（如"字段名称"同时匹配 field_name 和 field_chinese_name 的变体），
        HeaderMapper 可能将代码列映射为 field_chinese_name、中文列映射为 field_name。
        此方法通过核验列数据内容来检测和修正这种互换。
        """
        # 找到 field_name 和 field_chinese_name 对应的列
        name_col = None
        cn_col = None
        for col_idx, field in mapping.items():
            if field == "field_name" and name_col is None:
                name_col = col_idx
            elif field == "field_chinese_name" and cn_col is None:
                cn_col = col_idx

        if name_col is None or cn_col is None:
            # 只有一列，无法判断互换，直接返回
            return mapping

        # 采样两列数据
        all_cols = [name_col, cn_col]
        col_samples = self._sample_column_data(all_cols, data_rows, sample_size=15)

        name_samples = col_samples.get(name_col, [])
        cn_samples = col_samples.get(cn_col, [])

        if not name_samples or not cn_samples:
            return mapping

        # 计算各列的中文字符占比
        def _chinese_ratio(samples: List[str]) -> float:
            total_chars = sum(len(s) for s in samples)
            if total_chars == 0:
                return 0.0
            chinese_chars = sum(len(re.findall(r'[一-鿿]', s)) for s in samples)
            return chinese_chars / total_chars

        name_cn_ratio = _chinese_ratio(name_samples)
        cn_cn_ratio = _chinese_ratio(cn_samples)

        # 判断是否互换：field_name 列中文占比高 且 field_chinese_name 列中文占比低
        if name_cn_ratio > 0.6 and cn_cn_ratio < 0.3:
            # 互换：field_name 列实际是中文名，field_chinese_name 列实际是代码
            mapping[name_col] = "field_chinese_name"
            mapping[cn_col] = "field_name"
            return mapping

        # field_name 列有中文但 cn_col 也有中文 → 两者都可能是中文名
        if name_cn_ratio > 0.5 and cn_cn_ratio > 0.5:
            # 保留中文占比更高的一列作为 field_chinese_name
            if name_cn_ratio >= cn_cn_ratio:
                mapping[name_col] = "field_chinese_name"
                mapping[cn_col] = "description"
            else:
                mapping[cn_col] = "field_chinese_name"
                mapping[name_col] = "description"

        return mapping

    def validate_mapping(self, mapping: Dict[int, str],
                         data_rows: List[List[str]]) -> List[str]:
        """验证映射结果的合理性，返回警告信息列表

        检查项：
        - field_name 列数据是否含中文（可能是映射错误）
        - 必填列 field_name/field_chinese_name 是否缺失
        - field_name 列数据是否异常（全空/全部相同）
        """
        warnings = []
        name_col = None
        cn_col = None
        for col_idx, field in mapping.items():
            if field == "field_name":
                name_col = col_idx
            elif field == "field_chinese_name":
                cn_col = col_idx

        if name_col is None:
            warnings.append("WARNING: 未识别到字段代码列(field_name)，请检查表头映射配置")
        else:
            samples = self._sample_column_data([name_col], data_rows, sample_size=10)
            name_samples = samples.get(name_col, [])
            if name_samples:
                # 检查是否包含中文（应全是代码）
                cn_count = sum(1 for s in name_samples if re.search(r'[一-鿿]', s))
                if cn_count > len(name_samples) * 0.3:
                    warnings.append(
                        f"WARNING: field_name 列({name_col})中 {cn_count}/{len(name_samples)} "
                        f"个样本含中文，该列可能是中文名列。请确认表头映射是否正确"
                    )

        if cn_col is None:
            warnings.append("WARNING: 未识别到字段中文名列(field_chinese_name)，请检查表头映射配置")

        return warnings

    def get_core_fields(self) -> List[str]:
        """获取核心字段列表（用于表格分类判断）"""
        classifier_config = self._config.get("table_classifier", {})
        return classifier_config.get("core_fields", ["field_name", "field_chinese_name", "data_type"])

    def get_min_core_fields(self) -> int:
        """获取字段定义表的最小命中核心字段数"""
        classifier_config = self._config.get("table_classifier", {})
        return classifier_config.get("min_core_fields", 2)

    def get_min_rows(self) -> int:
        """获取字段定义表的最小行数"""
        classifier_config = self._config.get("table_classifier", {})
        return classifier_config.get("min_rows", 2)

    def get_skip_keywords(self) -> List[str]:
        """获取跳过的表头关键词"""
        classifier_config = self._config.get("table_classifier", {})
        return classifier_config.get("skip_keywords", [])

    def get_view_patterns(self) -> List[str]:
        """获取视图标识提取的正则模式"""
        view_config = self._config.get("view_identifier", {})
        return view_config.get("patterns", [])

    def get_xlsx_config(self) -> dict:
        """获取 XLSX 特殊配置"""
        view_config = self._config.get("view_identifier", {})
        return view_config.get("xlsx", {})
