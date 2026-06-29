"""L2 深度学习引擎

两阶段搜索策略：
1. 文件扫描模式（离线）：扫描 examples/*.cls、sources/ 目录、global-access.md
2. MCP 模式（在线）：通过 IRIS MCP 工具查询真实数据库

会话级缓存：同一字段只查一次，避免重复。
"""
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


class L2SearchResult:
    """L2 搜索结果"""

    def __init__(self, field_name: str, standard_name: str,
                 value_expression: str, global_used: str,
                 confidence: float, source: str, raw_context: str = ""):
        self.field_name = field_name
        self.standard_name = standard_name
        self.value_expression = value_expression
        self.global_used = global_used
        self.confidence = confidence
        self.source = source  # "mcp", "examples", "sources", "global_doc"
        self.raw_context = raw_context  # 找到的原始代码上下文

    def to_dict(self) -> Dict[str, Any]:
        return {
            "fieldName": self.field_name,
            "standardName": self.standard_name,
            "valueExpression": self.value_expression,
            "globalUsed": self.global_used,
            "confidence": self.confidence,
            "source": f"L2_{self.source}",
            "rawContext": self.raw_context[:500],
        }


class L2SearchEngine:
    """L2 深度学习搜索引擎

    离线模式（无 MCP）：
    - 扫描 examples/*.cls 中的取值模式
    - 扫描 sources/ 目录中的源码
    - 读取 rules/common/global-access.md 的 Global 参考

    在线模式（有 MCP）：
    - 生成 IRIS MCP 搜索建议供调用方执行
    """

    # ObjectScript 取值表达式模式
    EXPR_PATTERNS = [
        # $p($g(^GLOBAL(...)), "^", N)
        re.compile(r'\$p\(\$g\(\^(\w+)\([^)]+\)\),\s*"\^",\s*(\d+)\)'),
        # $lg(^GLOBAL(...), N) or $lg(data, N)
        re.compile(r'\$lg\((\^?\w+),\s*(\d+)\)'),
        # $g(^GLOBAL(...))
        re.compile(r'\$g\(\^(\w+)\([^)]+\)\)'),
        # s xxx = $p($g(^...)...)
        re.compile(r's\s+(\w+)\s*=\s*(.+?)(?:\s*;|$)'),
    ]

    def __init__(self, rules_dir: Optional[Path] = None,
                 examples_dir: Optional[Path] = None,
                 sources_dir: Optional[Path] = None):
        self._rules_dir = rules_dir
        self._examples_dir = examples_dir
        self._sources_dir = sources_dir
        # 会话级缓存: field_name → L2SearchResult
        self._cache: Dict[str, Optional[L2SearchResult]] = {}
        # Global 参考文档缓存
        self._global_docs: Optional[str] = None

    @property
    def examples_dir(self) -> Path:
        if self._examples_dir:
            return self._examples_dir
        return (self._rules_dir.parent / "examples") if self._rules_dir else Path("examples")

    @property
    def sources_dir(self) -> Path:
        if self._sources_dir:
            return self._sources_dir
        return (self._rules_dir.parent / "sources") if self._rules_dir else Path("sources")

    def search(self, field_name: str, field_name_cn: str = "",
               context: Optional[Dict] = None) -> Optional[L2SearchResult]:
        """搜索字段取值（带缓存）

        Args:
            field_name: 字段代码
            field_name_cn: 字段中文名
            context: 上下文信息

        Returns:
            L2SearchResult 或 None
        """
        cache_key = f"{field_name}|{field_name_cn}"
        if cache_key in self._cache:
            return self._cache[cache_key]

        # 策略1: 扫描 examples
        result = self._scan_examples(field_name, field_name_cn)
        if result:
            self._cache[cache_key] = result
            return result

        # 策略2: 扫描 sources
        result = self._scan_sources(field_name, field_name_cn)
        if result:
            self._cache[cache_key] = result
            return result

        # 策略3: 查 Global 参考文档
        result = self._search_global_docs(field_name, field_name_cn)
        if result:
            self._cache[cache_key] = result
            return result

        self._cache[cache_key] = None
        return None

    def generate_mcp_search_prompt(self, field_name: str, field_name_cn: str = "",
                                   domain_hint: str = "") -> str:
        """生成 MCP 搜索建议提示词（供 LLM/调用方使用 MCP 工具执行）

        Returns:
            可直接传给 LLM 的 MCP 搜索指令文本
        """
        lines = [
            f"## L2 MCP 搜索: {field_name}",
            f"字段代码: {field_name}",
        ]
        if field_name_cn:
            lines.append(f"中文名: {field_name_cn}")
        if domain_hint:
            lines.append(f"域: {domain_hint}")

        lines.extend([
            "",
            "请执行以下 MCP 工具调用：",
            f"1. iris_search(query=\"{field_name}\") — 搜索包含该字段的类",
            f"2. 如果找到类名，执行 docs_introspect(class_name=<找到的类>) — 查看类结构",
            f"3. iris_doc(name=<类名>.cls, mode=get) — 读取源码提取取值逻辑",
            "",
            f"也尝试用中文名搜索: iris_search(query=\"{field_name_cn or field_name}\")",
            "",
            "目标: 找到类似 `$p($g(^GLOBAL(...)),\"^\",N)` 的取值表达式",
        ])
        return "\n".join(lines)

    def batch_mcp_suggestions(self, unmatched_fields: List[Tuple[str, str, str]]
                              ) -> str:
        """为一批未匹配字段生成批量 MCP 搜索建议

        Args:
            unmatched_fields: [(field_code, field_name_cn, domain_hint), ...]
        """
        suggestions = []
        for code, name_cn, domain in unmatched_fields:
            suggestions.append(
                self.generate_mcp_search_prompt(code, name_cn, domain)
            )
        return "\n\n---\n\n".join(suggestions)

    # ===== 私有方法 =====

    def _scan_examples(self, field_name: str, field_name_cn: str) -> Optional[L2SearchResult]:
        """扫描 examples/ 目录中的示例代码"""
        if not self.examples_dir.exists():
            return None

        for cls_file in self.examples_dir.glob("*.cls"):
            try:
                with open(cls_file, 'r', encoding='utf-8-sig') as f:
                    code = f.read()
            except (OSError, UnicodeDecodeError):
                continue

            # 在代码中搜索字段名
            result = self._extract_expression(code, field_name, field_name_cn)
            if result:
                expr, global_name = result
                return L2SearchResult(
                    field_name=field_name,
                    standard_name=field_name,
                    value_expression=expr,
                    global_used=global_name,
                    confidence=0.65,
                    source="examples",
                    raw_context=f"File: {cls_file.name}",
                )

        return None

    def _scan_sources(self, field_name: str, field_name_cn: str) -> Optional[L2SearchResult]:
        """扫描 sources/ 目录中的源码"""
        if not self.sources_dir.exists():
            return None

        # 限制扫描范围避免过慢
        count = 0
        for cls_file in self.sources_dir.rglob("*.cls"):
            if count > 100:
                break
            try:
                with open(cls_file, 'r', encoding='utf-8-sig') as f:
                    code = f.read()
            except (OSError, UnicodeDecodeError):
                continue

            result = self._extract_expression(code, field_name, field_name_cn)
            if result:
                expr, global_name = result
                return L2SearchResult(
                    field_name=field_name,
                    standard_name=field_name,
                    value_expression=expr,
                    global_used=global_name,
                    confidence=0.75,
                    source="sources",
                    raw_context=f"File: {cls_file.name}",
                )
            count += 1

        return None

    def _search_global_docs(self, field_name: str, field_name_cn: str) -> Optional[L2SearchResult]:
        """查 Global 参考文档"""
        if self._global_docs is None:
            self._load_global_docs()

        if not self._global_docs:
            return None

        # 在文档中搜索字段名
        query = field_name_cn or field_name
        if query.lower() in self._global_docs.lower():
            # 找到相关段落，尝试提取 Global 名称
            idx = self._global_docs.lower().find(query.lower())
            snippet = self._global_docs[max(0, idx - 200):idx + 300]
            global_match = re.search(r'\^(\w+)', snippet)
            if global_match:
                return L2SearchResult(
                    field_name=field_name,
                    standard_name=field_name,
                    value_expression="",  # 仅指示 Global，无具体表达式
                    global_used=f"^{global_match.group(1)}",
                    confidence=0.55,
                    source="global_doc",
                    raw_context=snippet[:300],
                )

        return None

    def _load_global_docs(self):
        """加载 Global 参考文档"""
        if self._rules_dir:
            doc_path = self._rules_dir / "common" / "global-access.md"
            if doc_path.exists():
                try:
                    with open(doc_path, 'r', encoding='utf-8') as f:
                        self._global_docs = f.read()
                except (OSError, UnicodeDecodeError):
                    self._global_docs = ""

    def _extract_expression(self, code: str, field_name: str,
                            field_name_cn: str) -> Optional[Tuple[str, str]]:
        """从代码中提取与字段相关的取值表达式

        Returns:
            (表达式, Global名称) 或 None
        """
        # 搜索字段名在代码中的出现
        search_terms = [field_name]
        if field_name_cn and field_name_cn != field_name:
            search_terms.append(field_name_cn)

        for term in search_terms:
            if term not in code:
                continue

            # 在字段名附近搜索表达式
            idx = code.find(term)
            context = code[max(0, idx - 500):idx + 200]

            for pattern in self.EXPR_PATTERNS:
                matches = pattern.findall(context)
                if matches:
                    if pattern == self.EXPR_PATTERNS[0]:  # $p($g(^GLOBAL))
                        global_name, piece = matches[0]
                        expr = f'$p($g(^{global_name}(...)),"^",{piece})'
                        return expr, f"^{global_name}"
                    elif pattern == self.EXPR_PATTERNS[1]:  # $lg
                        data_ref, idx_n = matches[0]
                        expr = f"$lg({data_ref},{idx_n})"
                        return expr, data_ref
                    elif pattern == self.EXPR_PATTERNS[2]:  # $g(^GLOBAL)
                        global_name = matches[0]
                        expr = f"$g(^{global_name}(...))"
                        return expr, f"^{global_name}"
                    elif pattern == self.EXPR_PATTERNS[3]:  # s xxx = ...
                        var_name, expr_raw = matches[0]
                        if field_name.lower() in var_name.lower() or field_name.lower() in expr_raw.lower():
                            return expr_raw.strip(), ""

        return None

    def clear_cache(self):
        """清除会话缓存"""
        self._cache.clear()
        self._global_docs = None
