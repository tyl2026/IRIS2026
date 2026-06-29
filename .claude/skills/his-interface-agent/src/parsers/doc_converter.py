"""DOC 文件转换器

将 .doc 格式转换为 .docx 格式，然后使用 docx_parser 解析。
支持的转换工具：
- LibreOffice (soffice --convert-to docx)
- Pandoc (pandoc -f doc -t docx)
"""

import os
import subprocess
import tempfile
from pathlib import Path
from typing import Optional

from .base_parser import ParseResult
from .docx_parser import parse_docx


class DocConverter:
    """DOC 文件转换器"""

    def __init__(self):
        self._converter = self._find_converter()

    def _find_converter(self) -> Optional[str]:
        """查找可用的转换工具"""
        # 检查 LibreOffice
        for cmd in ["libreoffice", "soffice"]:
            try:
                subprocess.run([cmd, "--version"], capture_output=True, timeout=5)
                return cmd
            except (FileNotFoundError, subprocess.TimeoutExpired):
                continue

        # 检查 Pandoc
        try:
            subprocess.run(["pandoc", "--version"], capture_output=True, timeout=5)
            return "pandoc"
        except (FileNotFoundError, subprocess.TimeoutExpired):
            pass

        return None

    @property
    def is_available(self) -> bool:
        """检查转换工具是否可用"""
        return self._converter is not None

    def convert_and_parse(self, file_path: str) -> ParseResult:
        """转换并解析 DOC 文件

        Args:
            file_path: DOC 文件路径

        Returns:
            解析结果
        """
        path = Path(file_path)
        if not path.exists():
            return ParseResult(file_path=str(file_path), errors=[f"文件不存在: {file_path}"])

        if not self.is_available:
            return ParseResult(
                file_path=str(file_path),
                errors=[
                    "无法解析 .doc 格式文件，需要安装转换工具：",
                    "  1. LibreOffice: https://www.libreoffice.org/",
                    "  2. Pandoc: https://pandoc.org/",
                    "  或者手动将 .doc 文件另存为 .docx 格式"
                ]
            )

        # 创建临时目录
        with tempfile.TemporaryDirectory() as tmp_dir:
            try:
                # 转换为 docx
                docx_path = self._convert(path, tmp_dir)
                if docx_path is None:
                    return ParseResult(
                        file_path=str(file_path),
                        errors=[f"转换失败: {self._converter} 未能将 .doc 转换为 .docx"]
                    )

                # 解析 docx
                return parse_docx(str(docx_path))

            except Exception as e:
                return ParseResult(
                    file_path=str(file_path),
                    errors=[f"转换或解析失败: {e}"]
                )

    def _convert(self, doc_path: Path, output_dir: str) -> Optional[Path]:
        """将 .doc 转换为 .docx

        Args:
            doc_path: DOC 文件路径
            output_dir: 输出目录

        Returns:
            转换后的 DOCX 文件路径，失败返回 None
        """
        if self._converter in ["libreoffice", "soffice"]:
            return self._convert_with_libreoffice(doc_path, output_dir)
        elif self._converter == "pandoc":
            return self._convert_with_pandoc(doc_path, output_dir)

        return None

    def _convert_with_libreoffice(self, doc_path: Path, output_dir: str) -> Optional[Path]:
        """使用 LibreOffice 转换"""
        try:
            cmd = [
                self._converter,
                "--headless",
                "--convert-to", "docx",
                "--outdir", output_dir,
                str(doc_path)
            ]
            result = subprocess.run(cmd, capture_output=True, timeout=60)

            if result.returncode != 0:
                return None

            # 查找输出文件
            expected_name = doc_path.stem + ".docx"
            output_path = Path(output_dir) / expected_name

            if output_path.exists():
                return output_path

            # 尝试查找任何 docx 文件
            for f in Path(output_dir).glob("*.docx"):
                return f

            return None

        except Exception:
            return None

    def _convert_with_pandoc(self, doc_path: Path, output_dir: str) -> Optional[Path]:
        """使用 Pandoc 转换"""
        try:
            output_path = Path(output_dir) / (doc_path.stem + ".docx")
            cmd = [
                "pandoc",
                "-f", "doc",
                "-t", "docx",
                "-o", str(output_path),
                str(doc_path)
            ]
            result = subprocess.run(cmd, capture_output=True, timeout=60)

            if result.returncode != 0:
                return None

            if output_path.exists():
                return output_path

            return None

        except Exception:
            return None


def parse_doc(file_path: str) -> ParseResult:
    """便捷函数：解析 DOC 文件

    自动转换为 DOCX 后解析。
    """
    converter = DocConverter()
    return converter.convert_and_parse(file_path)
