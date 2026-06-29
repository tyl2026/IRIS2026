"""Markdown 规则解析器

解析 rules/domains/*.md 文件，提取 YAML Frontmatter 和规则内容。
规则文件格式：
---
domain: "10-patient"
name: "患者主索引域"
version: "2.1.0"
totalRules: 55
---

# 标题

## 字段映射规则

### PATIENT_NAME

| 属性 | 值 |
|------|-----|
| 标准名 | `PATIENT_NAME` |
| 匹配模式 | 患者姓名, PatientName, HZXM |
| 取值表达式 | `$p(...)` |
| Global | `^PAPER` |
| 置信度 | 0.97 |

**说明**：xxx

```objectscript
s PATIENT_NAME = $p(...)
```
"""

import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


class Rule:
    """单条取值规则"""

    def __init__(self, data: Dict[str, Any]):
        self.data = data

    @property
    def standard_name(self) -> str:
        """标准字段名"""
        return self.data.get("standardName", "")

    @property
    def field_pattern(self) -> str:
        """字段匹配模式（正则）"""
        return self.data.get("fieldPattern", "")

    @property
    def match_keywords(self) -> List[str]:
        """匹配关键词列表"""
        return self.data.get("matchKeywords", [])

    @property
    def value_expression(self) -> str:
        """取值表达式"""
        return self.data.get("valueExpression", "")

    @property
    def global_used(self) -> str:
        """使用的 Global"""
        return self.data.get("globalUsed", "")

    @property
    def confidence(self) -> float:
        """置信度"""
        return self.data.get("confidence", 0.0)

    @property
    def description(self) -> str:
        """说明"""
        return self.data.get("description", "")

    @property
    def domain(self) -> str:
        """所属域"""
        return self.data.get("domain", "")

    @property
    def dependencies(self) -> List[str]:
        """依赖的变量或规则"""
        return self.data.get("dependencies", [])

    @property
    def is_intermediate(self) -> bool:
        """是否是中间变量（需要先取值再供其他规则使用）"""
        return self.data.get("isIntermediate", False)

    @property
    def code_snippet(self) -> str:
        """代码片段"""
        return self.data.get("codeSnippet", "")

    @property
    def field_type(self) -> str:
        """字段类型：business(业务数据), parameter(配置参数), computed(计算字段)"""
        return self.data.get("fieldType", "business")

    @property
    def default_value(self) -> str:
        """默认值（用于配置参数）"""
        return self.data.get("defaultValue", "")

    def to_dict(self) -> Dict[str, Any]:
        return self.data.copy()

    def __repr__(self) -> str:
        return f"Rule({self.standard_name}, confidence={self.confidence})"


class DomainRules:
    """一个业务域的所有规则"""

    def __init__(self, domain_id: str, name: str, version: str,
                 description: str, rules: List[Rule], metadata: Dict[str, Any]):
        self.domain_id = domain_id
        self.name = name
        self.version = version
        self.description = description
        self.rules = rules
        self.metadata = metadata

    @property
    def rule_count(self) -> int:
        return len(self.rules)

    def __repr__(self) -> str:
        return f"DomainRules({self.domain_id}, {self.rule_count} rules)"


class MarkdownRuleParser:
    """Markdown 规则文件解析器"""

    def __init__(self):
        # YAML Frontmatter 正则
        self._frontmatter_pattern = re.compile(
            r'^---\s*\n(.*?)\n---\s*\n', re.DOTALL
        )
        # 规则标题正则（### 或 #### 开头）
        self._rule_header_pattern = re.compile(
            r'^#{3,4}\s+(.+?)$', re.MULTILINE
        )
        # 表格行正则 — 支持 ||| 和 | 两种格式
        # ||| 属性 | 值 ||  →  key="属性", value="值"
        # | 属性 | 值 |     →  key="属性", value="值"
        self._table_row_pattern = re.compile(
            r'^\|+\s*(.+?)\s*\|\s*(.+?)\s*\|+', re.MULTILINE
        )
        # 代码块正则
        self._code_block_pattern = re.compile(
            r'```objectscript\s*\n(.*?)```', re.DOTALL
        )

    def parse_file(self, file_path: Path) -> Optional[DomainRules]:
        """解析单个规则文件

        Args:
            file_path: .md 文件路径

        Returns:
            DomainRules 对象，解析失败返回 None
        """
        if not file_path.exists():
            return None

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception:
            return None

        return self.parse_content(content, file_path.stem)

    def parse_content(self, content: str, default_domain: str = "") -> Optional[DomainRules]:
        """解析规则内容

        Args:
            content: Markdown 内容
            default_domain: 默认域ID

        Returns:
            DomainRules 对象
        """
        # 1. 解析 YAML Frontmatter
        metadata = self._parse_frontmatter(content)
        domain_id = metadata.get("domain", default_domain)
        name = metadata.get("name", domain_id)
        version = metadata.get("version", "1.0.0")
        description = metadata.get("description", "")

        # 2. 解析规则列表
        rules = self._parse_rules(content, domain_id)

        return DomainRules(
            domain_id=domain_id,
            name=name,
            version=version,
            description=description,
            rules=rules,
            metadata=metadata
        )

    def _parse_frontmatter(self, content: str) -> Dict[str, Any]:
        """解析 YAML Frontmatter"""
        metadata = {}
        match = self._frontmatter_pattern.match(content)
        if not match:
            return metadata

        yaml_content = match.group(1)
        for line in yaml_content.split('\n'):
            line = line.strip()
            if not line or line.startswith('#'):
                continue

            # 简单的 YAML 键值对解析
            if ':' in line:
                key, _, value = line.partition(':')
                key = key.strip()
                value = value.strip()

                # 处理引号
                if value.startswith('"') and value.endswith('"'):
                    value = value[1:-1]
                elif value.startswith("'") and value.endswith("'"):
                    value = value[1:-1]

                # 处理数组（简单情况）
                if value.startswith('[') and value.endswith(']'):
                    value = [v.strip().strip('"\'') for v in value[1:-1].split(',')]
                # 处理数字（仅对字符串类型）
                elif isinstance(value, str):
                    try:
                        if '.' in value:
                            value = float(value)
                        else:
                            value = int(value)
                    except ValueError:
                        pass

                metadata[key] = value

        # 处理 relatedGlobals 数组（多行格式）
        if "relatedGlobals" not in metadata:
            rg_start = yaml_content.find("relatedGlobals:")
            if rg_start >= 0:
                rg_lines = yaml_content[rg_start:].split('\n')[1:]
                globals_list = []
                for line in rg_lines:
                    line = line.strip()
                    if line.startswith('- '):
                        globals_list.append(line[2:].strip().strip('"'))
                    elif line and not line.startswith('#'):
                        break
                if globals_list:
                    metadata["relatedGlobals"] = globals_list

        return metadata

    def _parse_rules(self, content: str, domain_id: str) -> List[Rule]:
        """解析所有规则（标题段落 + 属性速查表）"""
        rules = []
        seen_names = set()  # 去重用

        # 1. 从属性速查表提取（优先，数据更可靠）
        table_rules = self._extract_rules_from_tables(content, domain_id)
        for rule_data in table_rules:
            name = rule_data.get("standardName", "")
            if name and name not in seen_names and rule_data.get("valueExpression"):
                rules.append(Rule(rule_data))
                seen_names.add(name)

        # 2. 从 ### 标题段落提取（兜底，_parse_single_rule 会自行过滤无效条目）
        headers = list(self._rule_header_pattern.finditer(content))
        for i, header in enumerate(headers):
            rule_name = header.group(1).strip()
            if not rule_name:
                continue

            start = header.end()
            if i + 1 < len(headers):
                end = headers[i + 1].start()
            else:
                end = len(content)

            rule_content = content[start:end]
            rule_data = self._parse_single_rule(rule_content, rule_name, domain_id)
            if rule_data:
                name = rule_data.get("standardName", "")
                if name and name not in seen_names:
                    rules.append(Rule(rule_data))
                    seen_names.add(name)

        return rules

    def _extract_rules_from_tables(self, content: str, domain_id: str) -> List[Dict[str, Any]]:
        """从属性速查表中提取规则

        识别包含 Piece 列的属性定义表，提取:
        - 属性名 → standardName
        - Piece编号 → $lg(data,N) 表达式
        - 中文描述 → 匹配关键词
        - Date/Time类型 → $zd()/$zt() 包装
        """
        rules = []

        # 找到所有表格区域：连续的 | 开头的行
        table_blocks = re.finditer(
            r'(?:^\|.*\|\s*\n)+',
            content, re.MULTILINE
        )

        for block_match in table_blocks:
            block = block_match.group(0)
            lines = block.strip().split('\n')

            if len(lines) < 2:
                continue

            # 检查表头是否包含 Piece 列
            header_line = lines[0]
            headers = [c.strip() for c in header_line.split('|') if c.strip()]
            if not headers:
                continue

            # 识别 Piece 列的位置（第一列是"Piece"或"lg"）
            first_header = headers[0].strip('*').strip()
            is_piece_table = (
                first_header == 'Piece' or
                first_header.startswith('Piece') or
                first_header == 'lg' or
                (len(headers) >= 2 and 'Piece' in headers[0])
            )

            if not is_piece_table:
                # 也检查第二列是否是属性名
                if len(headers) >= 2:
                    second = headers[1].strip('*').strip()
                    if second not in ('属性名', 'Property', '字段名'):
                        continue
                else:
                    continue

            # 判断类型列位置（通常叫"类型"或"Type"）
            type_col_idx = None
            desc_col_idx = 1  # 描述通常在第二列
            for idx, h in enumerate(headers):
                h_clean = h.strip('*').strip()
                if h_clean in ('类型', 'Type', '数据类型'):
                    type_col_idx = idx
                if h_clean in ('描述', 'Description', '说明', '中文名'):
                    desc_col_idx = idx

            # 解析数据行
            for line in lines[2:]:  # 跳过表头和分隔行
                line = line.strip()
                if not line or not line.startswith('|'):
                    continue

                cells = [c.strip() for c in line.split('|') if c.strip()]
                if len(cells) < 2:
                    continue

                # 提取 Piece 编号（第一列）
                piece_str = cells[0].strip('*').strip()
                try:
                    piece = int(piece_str)
                except ValueError:
                    continue

                # 提取属性名（第二列）
                prop_name = cells[1].strip('*').strip()
                if not prop_name or not prop_name[0].isalpha():
                    continue

                # 提取描述
                description = cells[desc_col_idx].strip('*').strip() if desc_col_idx < len(cells) else ''

                # 检查是否是 Date/Time 类型
                is_date = False
                is_time = False
                if type_col_idx is not None and type_col_idx < len(cells):
                    type_val = cells[type_col_idx].strip('*').strip().lower()
                    is_date = 'date' in type_val
                    is_time = 'time' in type_val

                # 生成取值表达式
                if is_date:
                    expr = f'$zd($lg(data,{piece}),3)'
                elif is_time:
                    expr = f'$zt($lg(data,{piece}))'
                else:
                    expr = f'$lg(data,{piece})'

                # 构建匹配关键词
                keywords = [prop_name, prop_name.upper(), prop_name.lower()]
                if description:
                    keywords.append(description)

                # 尝试从周围代码块中查找更精确的表达式
                # （如 $replace($lg(data,25),$c(10),"") 这种特殊处理）
                special_expr = self._find_special_expression(content, prop_name, piece)
                if special_expr:
                    expr = special_expr

                rules.append({
                    "standardName": prop_name,
                    "domain": domain_id,
                    "matchKeywords": keywords,
                    "valueExpression": expr,
                    "globalUsed": "",
                    "confidence": 0.90,
                    "description": description,
                    "codeSnippet": "",
                    "fieldPattern": "",
                    "dependencies": [],
                    "isIntermediate": False
                })

        return rules

    def _find_special_expression(self, content: str, prop_name: str, piece: int) -> Optional[str]:
        """在代码块中查找属性的特殊处理表达式

        如: $replace($lg(data,25),$c(10),"") 而非简单的 $lg(data,25)
        """
        # 搜索代码块中引用该属性的行
        pattern = re.compile(
            rf's\s+\w+\s*=\s*(.+?)\s*;.*?{re.escape(prop_name)}',
            re.IGNORECASE
        )
        match = pattern.search(content)
        if match:
            expr = match.group(1).strip()
            # 如果表达式包含特殊处理（replace, zdt, 等），返回它
            if any(fn in expr for fn in ['$replace', '$e', '$tr', '$zdt', '$zdth']):
                return expr

        # 也尝试按 Piece 编号查找
        lg_pattern = re.compile(
            rf'(\$replace\(\$lg\(data,{piece}\)[^)]+\))',
        )
        match = lg_pattern.search(content)
        if match:
            return match.group(1)

        return None

    def _parse_single_rule(self, content: str, rule_name: str, domain_id: str) -> Optional[Dict[str, Any]]:
        """解析单条规则"""
        data = {
            "standardName": rule_name,
            "domain": domain_id,
            "matchKeywords": [],
            "valueExpression": "",
            "globalUsed": "",
            "confidence": 0.0,
            "description": "",
            "codeSnippet": "",
            "fieldPattern": "",
            "dependencies": [],  # 依赖的变量或规则
            "isIntermediate": False  # 是否是中间变量
        }

        # 解析属性表格
        table_matches = self._table_row_pattern.findall(content)
        for key, value in table_matches:
            key = key.strip()
            value = value.strip()

            # 去掉代码标记
            value = value.strip('`')

            if key == "标准名":
                data["standardName"] = value
            elif key == "匹配模式":
                # 解析为关键词列表
                keywords = [k.strip() for k in value.split(',')]
                data["matchKeywords"] = keywords
                # 构建正则模式
                if keywords:
                    escaped = [re.escape(k) for k in keywords if k]
                    data["fieldPattern"] = '|'.join(escaped)
            elif key == "描述关键词":
                # 合并描述关键词到匹配关键词
                desc_keywords = [k.strip() for k in value.split(',')]
                existing = set(data["matchKeywords"])
                for kw in desc_keywords:
                    if kw and kw not in existing:
                        data["matchKeywords"].append(kw)
            elif key == "取值表达式":
                data["valueExpression"] = value
            elif key == "Global":
                data["globalUsed"] = value
            elif key == "置信度":
                try:
                    data["confidence"] = float(value)
                except ValueError:
                    data["confidence"] = 0.0
            elif key == "依赖":
                # 解析依赖关系
                data["dependencies"] = self._parse_dependencies(value)
            elif key == "说明":
                # 说明可能在表格外面，后面单独处理
                pass

        # 解析说明文本
        desc_match = re.search(r'\*\*说明\*\*[：:]\s*(.+?)(?:\n\n|\n```)', content, re.DOTALL)
        if desc_match:
            data["description"] = desc_match.group(1).strip()

        # 判断是否是中间变量（依赖其他规则的变量）
        if data["dependencies"]:
            data["isIntermediate"] = True

        # 解析代码片段
        code_match = self._code_block_pattern.search(content)
        if code_match:
            data["codeSnippet"] = code_match.group(1).strip()

        # 必须有取值表达式才视为有效规则（codeSnippet 只是辅助文档）
        if data["valueExpression"]:
            # ★ 检查是否是中文占位符（如"待补充"、"暂无"等）
            expr = data["valueExpression"].strip()
            if re.search(r'[一-鿿]', expr):
                # 包含中文，视为无效表达式
                return None
            return data

        return None

    def _parse_dependencies(self, dep_str: str) -> List[str]:
        """解析依赖关系字符串

        示例输入：
        - "依赖 SEX_ROWID 的 SexRowID 变量"
        - "依赖 CARD_NO 规则的 CardTypeRowid 变量"
        - "需先取 CredentialTypeRowID (见 CREDENTIAL_TYPE_ROWID)"

        返回：
        - 依赖的变量名列表，如 ["SexRowID", "CardTypeRowid"]
        """
        deps = []

        # 匹配 "依赖 XXX 的 YYY 变量" 模式
        match = re.search(r'依赖\s+(\w+)\s+的\s+(\w+)\s+变量', dep_str)
        if match:
            deps.append(match.group(2))  # 返回变量名
            return deps

        # 匹配 "需先取 XXX" 模式
        match = re.search(r'需先取\s+(\w+)', dep_str)
        if match:
            deps.append(match.group(1))
            return deps

        # 匹配 "(见 XXX)" 模式
        match = re.search(r'见\s+(\w+)', dep_str)
        if match:
            deps.append(match.group(1))
            return deps

        return deps

    def parse_directory(self, dir_path: Path) -> List[DomainRules]:
        """解析目录下所有规则文件

        Args:
            dir_path: 规则目录路径

        Returns:
            DomainRules 列表
        """
        domains = []
        if not dir_path.exists():
            return domains

        for md_file in sorted(dir_path.glob("*.md")):
            domain = self.parse_file(md_file)
            if domain and domain.rules:
                domains.append(domain)

        return domains


def parse_frontmatter(content: str) -> Tuple[Dict[str, Any], str]:
    """解析 YAML Frontmatter（独立函数，方便外部调用）

    Args:
        content: Markdown 内容

    Returns:
        (metadata, body) 元组
    """
    parser = MarkdownRuleParser()
    match = parser._frontmatter_pattern.match(content)
    if match:
        yaml_content = match.group(1)
        body = content[match.end():]
        metadata = parser._parse_frontmatter(content)
        return metadata, body
    return {}, content
