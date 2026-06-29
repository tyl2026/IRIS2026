"""DR 指针链路解析器

从 his-data-flow.md 解析 DR 指针速查表，
在代码生成时自动解析跨表取值链路，减少 TODO 标记。

=== 工作原理 ===

1. 解析 his-data-flow.md 中的 DR 指针链路格式：
   `SourceTable^Piece → TargetTable (描述) → ^GLOBAL(dr)^Piece = 值`

2. 构建查找表：
   - source_field → (target_global, target_piece, description)
   - 例如：OE_OrdItem^31 → OEC_OrderStatus → ^OEC("OSTAT")^1=Code

3. 在代码生成时：
   - 当变量缺少定义时，检查是否是已知的 DR 指针
   - 自动生成 $p($g(^TARGET_GLOBAL(dr)),"^",piece) 表达式

=== 数据来源 ===
- references/his-data-flow.md — DR 指针速查表
- references/his-table-moc.md — 表名→Global 映射
"""

import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple


class DRPointer:
    """单条 DR 指针链路"""

    def __init__(self, source_table: str, source_piece: int,
                 target_table: str, target_global: str,
                 target_pieces: List[int], description: str,
                 target_field_names: List[str] = None):
        self.source_table = source_table      # 源表名 (如 OE_OrdItem)
        self.source_piece = source_piece      # 源表中的 Piece 位置
        self.target_table = target_table      # 目标表名 (如 OEC_OrderStatus)
        self.target_global = target_global    # 目标 Global (如 ^OEC("OSTAT"))
        self.target_pieces = target_pieces    # 目标取值 Piece 列表
        self.description = description        # 中文描述
        self.target_field_names = target_field_names or []  # 目标字段名

    def __repr__(self):
        return (f"DRPointer({self.source_table}^{self.source_piece} → "
                f"{self.target_table} → {self.target_global})")


class DRPointerResolver:
    """DR 指针链路解析器

    解析 his-data-flow.md 中的 DR 指针速查表，
    提供按变量名/表名/Piece 查找跨表取值链路的能力。
    """

    def __init__(self, references_dir: Optional[Path] = None):
        self._references_dir = references_dir or Path(__file__).parent.parent.parent / "references"
        self._pointers: List[DRPointer] = []
        self._loaded = False
        # 按关键词索引（变量名/表名 → DR 指针列表）
        self._keyword_index: Dict[str, List[DRPointer]] = {}

    def load(self):
        """加载 DR 指针链路"""
        if self._loaded:
            return

        data_flow_path = self._references_dir / "his-data-flow.md"
        if not data_flow_path.exists():
            return

        content = data_flow_path.read_text(encoding="utf-8")
        self._parse_dr_chains(content)
        self._build_keyword_index()
        self._loaded = True

    def _parse_dr_chains(self, content: str):
        """解析 DR 指针链路

        格式：SourceTable^Piece → TargetTable (描述) → ^GLOBAL(dr)^Piece = 值
        示例：OE_OrdItem^31 → OEC_OrderStatus (医嘱状态DR) → ^OEC("OSTAT")^1=Code
        """
        # 匹配完整三段式链路
        pattern = re.compile(
            r'^(\w+)\^(\d+)\s*→\s*(\w+)\s*\(([^)]+)\)\s*→\s*(\^[^\s]+)\^(\d+(?:/\^?\d+)*)\s*=\s*(.+)$',
            re.MULTILINE
        )
        for m in pattern.finditer(content):
            source_table = m.group(1)
            source_piece = int(m.group(2))
            target_table = m.group(3)
            description = m.group(4)
            target_global = m.group(5)
            pieces_str = m.group(6)
            field_names_str = m.group(7).strip()

            # 解析 Piece 列表（支持 1/^2 格式）
            target_pieces = []
            for p in re.findall(r'\d+', pieces_str):
                target_pieces.append(int(p))

            # 解析字段名列表
            target_field_names = [fn.strip() for fn in field_names_str.split('/') if fn.strip()]

            self._pointers.append(DRPointer(
                source_table=source_table,
                source_piece=source_piece,
                target_table=target_table,
                target_global=target_global,
                target_pieces=target_pieces,
                description=description,
                target_field_names=target_field_names,
            ))

        # 也匹配两段式链路（只有源→目标，无具体取值）
        pattern2 = re.compile(
            r'^(\w+)\^(\d+)\s*→\s*(\w+)\s*\(([^)]+)\)',
            re.MULTILINE
        )
        for m in pattern2.finditer(content):
            source_table = m.group(1)
            source_piece = int(m.group(2))
            target_table = m.group(3)
            description = m.group(4)

            # 检查是否已被三段式匹配过
            exists = any(
                p.source_table == source_table and p.source_piece == source_piece
                for p in self._pointers
            )
            if not exists:
                self._pointers.append(DRPointer(
                    source_table=source_table,
                    source_piece=source_piece,
                    target_table=target_table,
                    target_global="",  # 未知，需要从 MOC 表查找
                    target_pieces=[],
                    description=description,
                ))

    def _build_keyword_index(self):
        """按关键词建立索引"""
        for pointer in self._pointers:
            # 按源表名索引
            key = pointer.source_table.lower()
            self._keyword_index.setdefault(key, []).append(pointer)
            # 按目标表名索引
            key = pointer.target_table.lower()
            self._keyword_index.setdefault(key, []).append(pointer)
            # 按描述关键词索引
            for word in re.findall(r'[一-鿿]+', pointer.description):
                if len(word) >= 2:
                    self._keyword_index.setdefault(word, []).append(pointer)

    def find_by_source(self, source_table: str, piece: int) -> Optional[DRPointer]:
        """按源表和 Piece 查找 DR 指针"""
        if not self._loaded:
            self.load()
        for p in self._pointers:
            if p.source_table.lower() == source_table.lower() and p.source_piece == piece:
                return p
        return None

    def find_by_keyword(self, keyword: str) -> List[DRPointer]:
        """按关键词查找 DR 指针"""
        if not self._loaded:
            self.load()
        results = []
        keyword_lower = keyword.lower()
        for key, pointers in self._keyword_index.items():
            if keyword_lower in key or key in keyword_lower:
                results.extend(pointers)
        # 去重
        seen = set()
        unique = []
        for p in results:
            key = (p.source_table, p.source_piece, p.target_table)
            if key not in seen:
                seen.add(key)
                unique.append(p)
        return unique

    def resolve_dr_variable(self, var_name: str, context_vars: dict) -> Optional[str]:
        """尝试解析一个 DR 指针变量，生成取值表达式

        逻辑：
        1. 查找 var_name 是否是已知的 DR 指针目标（如 statusDr → OEC_OrderStatus）
        2. 如果是，生成 $p($g(^TARGET_GLOBAL(var_name)),"^",1) 表达式

        Args:
            var_name: 缺少定义的变量名
            context_vars: 当前上下文中已定义的变量

        Returns:
            取值表达式字符串，无法解析返回 None
        """
        if not self._loaded:
            self.load()

        # 尝试从变量名推断它是什么 DR
        # 常见模式：xxxDr → 查找 xxx 对应的表
        var_lower = var_name.lower()

        # 精确匹配：变量名包含目标表关键词
        for pointer in self._pointers:
            target_lower = pointer.target_table.lower()
            # 变量名包含目标表名（如 statusDr 包含 status → OEC_OrderStatus）
            if target_lower in var_lower and pointer.target_global:
                if pointer.target_pieces:
                    piece = pointer.target_pieces[0]
                    return f'$p($g({pointer.target_global}({var_name})),"^",{piece})'

        # 模糊匹配：从描述中查找
        for pointer in self._pointers:
            desc_lower = pointer.description.lower()
            # 变量名的核心部分在描述中
            var_core = var_name.replace('Dr', '').replace('DR', '').replace('RowID', '').lower()
            if var_core and var_core in desc_lower and pointer.target_global:
                if pointer.target_pieces:
                    piece = pointer.target_pieces[0]
                    return f'$p($g({pointer.target_global}({var_name})),"^",{piece})'

        return None

    def get_pointer_info(self, pointer: DRPointer) -> str:
        """获取指针链路的可读描述"""
        parts = [f"{pointer.source_table}^{pointer.source_piece}"]
        parts.append(f"→ {pointer.target_table}")
        if pointer.target_global:
            pieces = '/'.join(f'^{p}' for p in pointer.target_pieces)
            parts.append(f"→ {pointer.target_global}{pieces}")
            if pointer.target_field_names:
                parts.append(f"= {'/'.join(pointer.target_field_names)}")
        return ' '.join(parts)

    @property
    def pointer_count(self) -> int:
        return len(self._pointers)


# 全局实例
_resolver: Optional[DRPointerResolver] = None


def get_dr_pointer_resolver(references_dir: Optional[Path] = None) -> DRPointerResolver:
    """获取 DR 指针解析器实例"""
    global _resolver
    if _resolver is None:
        _resolver = DRPointerResolver(references_dir)
    return _resolver
