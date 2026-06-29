"""文档解析器模块"""

from .base_parser import BaseParser, ParsedField, ParsedView, ParseResult
from .docx_parser import DocxParser, parse_docx
from .pdf_parser import PdfParser, parse_pdf
from .xlsx_parser import XlsxParser, parse_xlsx
from .doc_converter import DocConverter, parse_doc
from .factory import DocumentParser

__all__ = [
    "BaseParser", "ParsedField", "ParsedView", "ParseResult",
    "DocxParser", "parse_docx",
    "PdfParser", "parse_pdf",
    "XlsxParser", "parse_xlsx",
    "DocConverter", "parse_doc",
    "DocumentParser",
]
