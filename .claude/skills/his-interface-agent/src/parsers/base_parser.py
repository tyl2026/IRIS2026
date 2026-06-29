"""解析器基类和统一输出格式

所有解析器（PDF/DOCX/Excel）的输出都统一为 ParsedView 格式，
供下游取值引擎和代码生成器消费。
"""

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional


@dataclass
class ParsedField:
    """解析后的字段定义"""

    name: str             # 中文名，如 "病人姓名"
    code: str             # 字段代码，如 "Name" 或 "PATIENT_NAME"
    field_type: str = "String"   # 数据类型
    length: int = 0       # 长度（0表示未指定）
    required: bool = False  # 是否必填
    description: str = "" # 备注/说明
    default_value: str = ""  # 默认值

    @property
    def standard_code(self) -> str:
        """标准化字段代码（大写，下划线分隔）"""
        return self.code.upper()

    @property
    def var_name(self) -> str:
        """ObjectScript 变量名（小驼峰，无下划线）"""
        # 将下划线分隔的代码转为小驼峰
        parts = self.code.split('_')
        if len(parts) == 1:
            return parts[0].lower()
        return parts[0].lower() + ''.join(p.capitalize() for p in parts[1:])

    def __repr__(self) -> str:
        return f"Field({self.code}: {self.name})"


@dataclass
class ParsedView:
    """解析后的视图定义"""

    view_code: str        # 视图代码，如 "V_NIS_PatientBasicInfo"
    view_name: str        # 视图中文名，如 "病人基本信息"
    fields: List[ParsedField] = field(default_factory=list)
    source_system: str = ""   # 数据来源（HIS/LIS/PACS/EMR等）
    category: str = ""    # 分类（综合/住院）
    actual_table: str = ""  # 实际表名（如 V_Hais_PatientBasicInfo）
    description: str = "" # 视图描述
    metadata: Dict[str, Any] = field(default_factory=dict)

    @property
    def field_count(self) -> int:
        return len(self.fields)

    def __repr__(self) -> str:
        return f"ParsedView({self.view_code}: {self.view_name}, {self.field_count} fields)"


@dataclass
class ParseResult:
    """解析结果"""

    file_path: str                    # 源文件路径
    views: List[ParsedView] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

    @property
    def view_count(self) -> int:
        return len(self.views)

    @property
    def total_fields(self) -> int:
        return sum(v.field_count for v in self.views)

    @property
    def success(self) -> bool:
        return len(self.errors) == 0 and self.view_count > 0

    def summary(self) -> str:
        """生成解析摘要"""
        lines = [f"文件: {self.file_path}"]
        lines.append(f"视图数: {self.view_count}, 总字段数: {self.total_fields}")
        if self.errors:
            lines.append(f"错误: {len(self.errors)}")
            for err in self.errors:
                lines.append(f"  - {err}")
        for view in self.views:
            lines.append(f"  {view.view_code}: {view.view_name} ({view.field_count}字段) [{view.source_system}]")
        return "\n".join(lines)


class BaseParser:
    """解析器基类"""

    def parse(self, file_path: str) -> ParseResult:
        """解析文档，返回统一格式的结果

        Args:
            file_path: 文件路径

        Returns:
            ParseResult 对象
        """
        raise NotImplementedError

    def validate(self, result: ParseResult) -> List[str]:
        """校验解析结果

        Returns:
            错误信息列表（空表示通过）
        """
        errors = []
        if not result.views:
            errors.append("未解析到任何视图定义")
        for view in result.views:
            if not view.view_code:
                errors.append(f"视图缺少代码: {view.view_name}")
            if not view.fields:
                errors.append(f"视图缺少字段定义: {view.view_code}")
        return errors
