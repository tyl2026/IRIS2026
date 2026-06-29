"""文档解析器工厂

根据文件扩展名自动选择合适的解析器。
"""

from pathlib import Path
from typing import Optional

from .base_parser import ParseResult
from .docx_parser import parse_docx
from .pdf_parser import parse_pdf
from .xlsx_parser import parse_xlsx
from .doc_converter import parse_doc


class DocumentParser:
    """文档解析器工厂

    根据文件扩展名自动选择合适的解析器：
    - .docx → DocxParser
    - .pdf → PdfParser
    - .xlsx → XlsxParser
    - .doc → DocConverter + DocxParser
    """

    def __init__(self, config_path: Optional[str] = None):
        self._config_path = config_path

    def parse(self, file_path: str) -> ParseResult:
        """解析文档

        Args:
            file_path: 文件路径

        Returns:
            解析结果
        """
        path = Path(file_path)
        suffix = path.suffix.lower()

        if suffix == ".docx":
            return parse_docx(file_path, self._config_path)
        elif suffix == ".pdf":
            return parse_pdf(file_path, self._config_path)
        elif suffix == ".xlsx":
            return parse_xlsx(file_path, self._config_path)
        elif suffix == ".doc":
            return parse_doc(file_path)
        else:
            return ParseResult(
                file_path=file_path,
                errors=[f"不支持的文件格式: {suffix}，支持 .docx/.pdf/.xlsx/.doc"]
            )

    @staticmethod
    def supported_formats() -> list:
        """返回支持的文件格式列表"""
        return [".docx", ".pdf", ".xlsx", ".doc"]
