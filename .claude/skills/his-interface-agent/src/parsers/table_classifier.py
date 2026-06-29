"""表格分类器

根据表头映射结果判断表格类型：
- FIELD_TABLE: 字段定义表（需要解析）
- DICT_TABLE: 字典表（跳过）
- SEPARATOR: 分隔符表格（跳过）
- UNKNOWN: 未知类型
"""

from enum import Enum
from typing import Dict, List, Tuple

from .header_mapper import HeaderMapper


class TableType(Enum):
    """表格类型枚举"""
    FIELD_TABLE = "field_table"    # 字段定义表
    DICT_TABLE = "dict_table"      # 字典表
    SEPARATOR = "separator"        # 分隔符表格
    UNKNOWN = "unknown"            # 未知类型


class TableClassification:
    """表格分类结果"""

    def __init__(self, table_type: TableType, header_mapping: Dict[int, str],
                 confidence: float = 0.0, reason: str = ""):
        self.table_type = table_type
        self.header_mapping = header_mapping
        self.confidence = confidence
        self.reason = reason

    @property
    def is_field_table(self) -> bool:
        return self.table_type == TableType.FIELD_TABLE

    def __repr__(self) -> str:
        return f"TableClassification({self.table_type.value}, fields={len(self.header_mapping)}, confidence={self.confidence:.2f})"


class TableClassifier:
    """表格分类器"""

    def __init__(self, mapper: HeaderMapper):
        self._mapper = mapper
        self._core_fields = set(mapper.get_core_fields())
        self._min_core_fields = mapper.get_min_core_fields()
        self._min_rows = mapper.get_min_rows()
        self._skip_keywords = mapper.get_skip_keywords()

    def classify(self, header_row: List[str], data_rows: List[List[str]]) -> TableClassification:
        """分类表格

        Args:
            header_row: 表头行
            data_rows: 数据行列表

        Returns:
            分类结果
        """
        # 1. 检查是否是空表或分隔符
        if self._is_separator(header_row, data_rows):
            return TableClassification(
                TableType.SEPARATOR,
                {},
                confidence=1.0,
                reason="分隔符表格（行数过少或表头为空）"
            )

        # 2. 映射表头
        mapping = self._mapper.map_header(header_row)

        # 3. 计算核心字段命中数
        core_hit = sum(1 for f in mapping.values() if f in self._core_fields)

        # 4. 判断表格类型
        if core_hit >= self._min_core_fields:
            # 命中足够多的核心字段 → 字段定义表
            confidence = min(core_hit / len(self._core_fields), 1.0)
            return TableClassification(
                TableType.FIELD_TABLE,
                mapping,
                confidence=confidence,
                reason=f"命中 {core_hit} 个核心字段: {[f for f in mapping.values() if f in self._core_fields]}"
            )

        if self._is_dict_table(header_row, data_rows, mapping):
            return TableClassification(
                TableType.DICT_TABLE,
                mapping,
                confidence=0.8,
                reason="字典表（2列，编码+名称模式）"
            )

        # 未知类型
        return TableClassification(
            TableType.UNKNOWN,
            mapping,
            confidence=0.0,
            reason=f"核心字段命中 {core_hit}，不足 {self._min_core_fields}"
        )

    def _is_separator(self, header_row: List[str], data_rows: List[List[str]]) -> bool:
        """判断是否是分隔符表格"""
        # 行数过少
        if len(data_rows) < self._min_rows:
            return True

        # 表头全为空
        non_empty = [h for h in header_row if h and str(h).strip()]
        if len(non_empty) < 2:
            return True

        # 表头是否全部由跳过关键词组成（精确匹配）
        # 例如：表头是 ["总计", "合计"] 时才跳过
        # 不会因为表头包含"说明"就跳过
        header_set = set(h.strip() for h in non_empty)
        if header_set and header_set.issubset(set(self._skip_keywords)):
            return True

        return False

    def _is_dict_table(self, header_row: List[str], data_rows: List[List[str]],
                       mapping: Dict[int, str]) -> bool:
        """判断是否是字典表"""
        # 字典表特征：只有2列，通常是编码+名称
        if len(header_row) == 2:
            # 检查是否没有映射到核心字段
            if not any(f in self._core_fields for f in mapping.values()):
                return True

        return False
