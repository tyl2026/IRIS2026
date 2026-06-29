"""PDF 接口文档解析器

解析 PDF 格式的接口文档，支持：
- "中文名（英文名）" 格式的数据表标识
- 多种表格格式（5列/6列/7列等）
- 通过配置驱动的表头映射
"""

import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from .base_parser import BaseParser, ParsedField, ParsedView, ParseResult
from .header_mapper import HeaderMapper
from .table_classifier import TableClassifier, TableType


class PdfParser(BaseParser):
    """PDF 解析器"""

    def __init__(self, config_path: Optional[str] = None):
        self._mapper = HeaderMapper(config_path)
        self._classifier = TableClassifier(self._mapper)

    def parse(self, file_path: str) -> ParseResult:
        """解析 PDF 文件"""
        path = Path(file_path)
        if not path.exists():
            return ParseResult(file_path=str(file_path), errors=[f"文件不存在: {file_path}"])

        try:
            import pdfplumber
        except ImportError:
            return ParseResult(file_path=str(file_path), errors=["缺少 pdfplumber 库，请执行: pip install pdfplumber"])

        try:
            pdf = pdfplumber.open(str(path))
        except Exception as e:
            return ParseResult(file_path=str(file_path), errors=[f"打开文件失败: {e}"])

        result = ParseResult(file_path=str(path))

        try:
            views = self._parse_pdf(pdf)
            result.views = views
        finally:
            pdf.close()

        return result

    def _parse_pdf(self, pdf) -> List[ParsedView]:
        """解析 PDF 文档"""
        views = []
        current_view_id = ("", "")  # (code, name)

        for page in pdf.pages:
            text = page.extract_text() or ""

            # 从页面文本中提取视图标识
            view_id = self._extract_view_id_from_text(text)
            if view_id:
                current_view_id = view_id

            # 解析页面中的表格
            tables = page.extract_tables()
            for table in tables:
                if not table or len(table) < 2:
                    continue

                # 清理表格数据
                cleaned_table = self._clean_table(table)
                if not cleaned_table:
                    continue

                # 检查第一行是否是视图名称（单病种格式）
                first_row_text = " ".join(cleaned_table[0])
                view_from_table = self._extract_view_id_from_text(first_row_text)

                if view_from_table:
                    # 第一行是视图名称，第二行是表头
                    current_view_id = view_from_table
                    if len(cleaned_table) < 3:
                        continue
                    header_row = cleaned_table[1]
                    data_rows = cleaned_table[2:]
                else:
                    # 第一行是表头
                    header_row = cleaned_table[0]
                    data_rows = cleaned_table[1:]

                # 映射表头
                mapping = self._mapper.map_header(header_row)
                mapping = self._mapper.resolve_ambiguity(mapping, data_rows)

                # 分类表格
                classification = self._classifier.classify(header_row, data_rows)
                classification.header_mapping = mapping

                if not classification.is_field_table:
                    continue

                # 使用当前视图标识
                view_code, view_name = current_view_id
                if not view_code:
                    view_code = view_name

                # 提取字段
                fields = self._extract_fields(data_rows, mapping)

                if fields:
                    views.append(ParsedView(
                        view_code=view_code,
                        view_name=view_name,
                        fields=fields,
                    ))

        return views

    def _extract_view_id_from_text(self, text: str) -> Optional[Tuple[str, str]]:
        """从页面文本中提取视图标识

        模式: 中文名（英文名）
        示例: 门急诊挂号记录（outp_register_record）
        """
        # 模式1: 中文名（英文名）
        match = re.search(r'([一-龥]+)[（(]([A-Za-z_]\w+)[)）]', text)
        if match:
            return match.group(2), match.group(1)

        # 模式2: 数据表名（英文名）
        match = re.search(r'([\w]+)[（(]([A-Za-z_]\w+)[)）]', text)
        if match:
            return match.group(2), match.group(1)

        return None

    def _clean_table(self, table: List[List]) -> List[List[str]]:
        """清理表格数据"""
        cleaned = []
        for row in table:
            if row is None:
                continue
            cleaned_row = []
            for cell in row:
                if cell is None:
                    cleaned_row.append("")
                else:
                    # 清理：去掉换行符、前后空格
                    cleaned_row.append(str(cell).replace('\n', ' ').strip())
            # 跳过全空行
            if any(c for c in cleaned_row):
                cleaned.append(cleaned_row)
        return cleaned

    def _extract_fields(self, data_rows: List[List[str]], mapping: Dict[int, str]) -> List[ParsedField]:
        """从数据行提取字段定义"""
        fields = []

        # 找到各字段的列索引
        name_col = None
        code_col = None
        type_col = None
        length_col = None
        required_col = None
        desc_col = None

        for col_idx, field_type in mapping.items():
            if field_type == "field_name":
                code_col = col_idx
            elif field_type == "field_chinese_name":
                name_col = col_idx
            elif field_type == "data_type":
                type_col = col_idx
            elif field_type == "data_length":
                length_col = col_idx
            elif field_type == "required":
                required_col = col_idx
            elif field_type == "description":
                desc_col = col_idx

        # 至少需要 code 或 name
        if code_col is None and name_col is None:
            return []

        for row in data_rows:
            # 获取字段代码
            code = ""
            if code_col is not None and code_col < len(row):
                code = row[code_col].strip().replace(" ", "")  # 去掉所有空格

            # 获取字段中文名
            name = ""
            if name_col is not None and name_col < len(row):
                name = row[name_col].strip()

            # 跳过空行
            if not code and not name:
                continue

            # 跳过明显不是字段定义的行
            if code in ["合计", "总计", "小计"] or name in ["合计", "总计", "小计"]:
                continue

            # 获取数据类型
            field_type = ""
            if type_col is not None and type_col < len(row):
                field_type = row[type_col].strip()

            # 获取长度
            length = 0
            if length_col is not None and length_col < len(row):
                length_str = row[length_col].strip()
                match = re.search(r'\d+', length_str)
                if match:
                    length = int(match.group())

            # 获取是否必填
            required = False
            if required_col is not None and required_col < len(row):
                req_str = row[required_col].strip().upper()
                required = req_str in ["Y", "YES", "是", "必填", "非空", "TRUE", "1"]

            # 获取备注
            description = ""
            if desc_col is not None and desc_col < len(row):
                description = row[desc_col].strip()

            fields.append(ParsedField(
                name=name,
                code=code,
                field_type=field_type,
                length=length,
                required=required,
                description=description,
            ))

        return fields


def parse_pdf(file_path: str, config_path: Optional[str] = None) -> ParseResult:
    """便捷函数：解析 PDF 文件"""
    parser = PdfParser(config_path)
    return parser.parse(file_path)
