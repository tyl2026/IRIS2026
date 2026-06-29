"""规则库遍历配置加载器

从规则库的 frontmatter 中加载 traversal 配置，
供代码生成器使用。
"""

import re
from pathlib import Path
from typing import Any, Dict, List, Optional


class SubtableConfig:
    """子表遍历配置

    用于遍历主表关联的子表数据（如检验细项、药敏结果等）。
    """

    def __init__(self, data: Dict[str, Any]):
        self.view_matchers = data.get("viewMatchers", [])
        self.description = data.get("description", "")
        self.global_name = data.get("global", "")
        self.parent_key = data.get("parentKey", {})
        self.index = data.get("index", {})
        self.template = data.get("template", "")

    @property
    def parent_key_expression(self) -> str:
        """获取父键表达式（从主表data中提取关联键）"""
        return self.parent_key.get("expression", "")

    @property
    def index_global(self) -> str:
        return self.index.get("global", "")

    @property
    def index_name(self) -> str:
        return self.index.get("name", "")

    @property
    def index_keys(self) -> List[str]:
        return self.index.get("keys", [])


class TraversalConfig:
    """遍历配置

    支持两种遍历模式：
    - dateBatch: 日期批量导出（pDateFrom/pDateTo），不需要PAADMi外层
    - admSingle: 按就诊ID单次查询（admRowId），需要PAADMi提供adm
    """

    def __init__(self, data: Dict[str, Any]):
        self.type = data.get("type", "")
        self.input_param = data.get("inputParam", {})
        self.pre_variables = data.get("preVariables", [])
        self.index = data.get("index", {})
        self.data = data.get("data", {})
        self.template = data.get("template", "")
        self.modes = data.get("modes", {})  # {dateBatch: {...}, admSingle: {...}}
        self.view_matchers = data.get("viewMatchers", [])  # 视图名称匹配关键词
        self._selected_mode = data.get("_selectedMode", "")  # 当前选中的模式名
        # 子表配置
        subtable_data = data.get("subtable", {})
        self.subtable = SubtableConfig(subtable_data) if subtable_data else None

    @property
    def has_date_batch(self) -> bool:
        """是否支持日期批量导出模式"""
        return "dateBatch" in self.modes

    def get_mode(self, mode_name: str) -> Optional[Dict[str, Any]]:
        """获取指定遍历模式配置"""
        return self.modes.get(mode_name)

    @property
    def needs_paadm(self) -> bool:
        """是否需要PAADMi外层循环 — 模板中引用了adm/admRowId则需

        如果模板中已经包含了日期循环（pDateFrom/pDateTo），则不需要PAADMi外层循环。
        """
        tmpl = self.template or ""
        # 如果模板中已经包含了日期循环，不需要PAADMi外层循环
        if 'pDateFrom' in tmpl or 'pDateTo' in tmpl:
            return False
        # 如果模板中引用了adm/admRowId，需要PAADMi外层循环
        return 'admRowId' in tmpl or 'visitNo' in tmpl or 'admId' in tmpl or '\badm\b' in tmpl

    @property
    def index_global(self) -> str:
        return self.index.get("global", "")

    @property
    def index_name(self) -> str:
        return self.index.get("name", "")

    @property
    def index_keys(self) -> List[str]:
        return self.index.get("keys", [])

    @property
    def index_expression(self) -> str:
        return self.index.get("expression", "")

    @property
    def data_global(self) -> str:
        return self.data.get("global", "")

    @property
    def data_variable(self) -> str:
        return self.data.get("variable", "data")

    @property
    def data_format(self) -> str:
        return self.data.get("format", "p")

    @property
    def data_expression(self) -> str:
        return self.data.get("expression", "")

    def to_dict(self) -> Dict[str, Any]:
        result = {
            "type": self.type,
            "inputParam": self.input_param,
            "preVariables": self.pre_variables,
            "index": self.index,
            "data": self.data,
            "template": self.template,
        }
        # 保留子表配置
        if self.subtable:
            result["subtable"] = {
                "viewMatchers": self.subtable.view_matchers,
                "description": self.subtable.description,
                "global": self.subtable.global_name,
                "parentKey": self.subtable.parent_key,
                "index": self.subtable.index,
                "template": self.subtable.template,
            }
        return result


class TraversalLoader:
    """遍历配置加载器

    所有业务域映关系由规则库 frontmatter 中的 viewMatchers 字段驱动，
    生成器代码不包含任何硬编码的业务关键词。
    """

    def __init__(self, rules_dir: Optional[Path] = None):
        self.rules_dir = rules_dir or Path(__file__).parent.parent.parent / "rules" / "domains"
        self._configs: Dict[str, TraversalConfig] = {}  # by type
        self._configs_by_domain: Dict[str, TraversalConfig] = {}  # by domain ID
        self._loaded = False

    def load(self) -> Dict[str, TraversalConfig]:
        """加载所有规则库的遍历配置"""
        if self._loaded:
            return self._configs

        self._configs.clear()
        self._configs_by_domain.clear()

        for rule_file in self.rules_dir.glob("*.md"):
            if rule_file.name.startswith("traversal-schema"):
                continue

            try:
                frontmatter = self._extract_frontmatter(rule_file.read_text(encoding="utf-8"))
                if not frontmatter:
                    continue

                traversal_data = frontmatter.get("traversal")
                if not traversal_data:
                    continue

                config = TraversalConfig(traversal_data)
                self._configs[config.type] = config

                # 同时按域ID索引
                domain_id = frontmatter.get("domain", "")
                if domain_id:
                    self._configs_by_domain[domain_id] = config
            except Exception as e:
                print(f"Warning: Failed to parse {rule_file.name}: {e}")

        self._loaded = True
        return self._configs

    def get_config_by_domain(self, domain_id: str) -> Optional[TraversalConfig]:
        """根据业务域ID查找遍历配置（主入口）

        Args:
            domain_id: 域ID，如 "50-lab-exam"、"40-order"

        Returns:
            遍历配置，未找到返回 None
        """
        if not self._loaded:
            self.load()

        # 直接查找（域文件frontmatter中的domain字段）
        return self._configs_by_domain.get(domain_id)

    def _extract_frontmatter(self, content: str) -> Optional[Dict[str, Any]]:
        """从 Markdown 文件中提取 YAML frontmatter"""
        match = re.match(r'^---\s*\n(.*?)\n---', content, re.DOTALL)
        if not match:
            return None

        yaml_content = match.group(1)

        try:
            import yaml
            return yaml.safe_load(yaml_content)
        except ImportError:
            return self._simple_yaml_parse(yaml_content)

    def _simple_yaml_parse(self, yaml_content: str) -> Dict[str, Any]:
        """简单的 YAML 解析（用于没有 PyYAML 的情况）"""
        result = {}
        current_key = None
        current_value = None
        indent_level = 0

        for line in yaml_content.split('\n'):
            if not line.strip() or line.strip().startswith('#'):
                continue

            # 计算缩进
            indent = len(line) - len(line.lstrip())

            # 检查是否是新的顶级键
            if indent == 0 and ':' in line:
                if current_key:
                    result[current_key] = current_value
                key, _, value = line.partition(':')
                current_key = key.strip()
                current_value = value.strip() if value.strip() else {}
                indent_level = 0
            elif indent > indent_level:
                # 子级内容
                if isinstance(current_value, dict):
                    # 简单处理，实际应该用完整的 YAML 解析器
                    pass

        if current_key:
            result[current_key] = current_value

        return result

    def get_config(self, traversal_type: str) -> Optional[TraversalConfig]:
        """获取指定类型的遍历配置"""
        if not self._loaded:
            self.load()
        return self._configs.get(traversal_type)

    def get_config_by_view_name(self, view_name: str) -> Optional[TraversalConfig]:
        """根据视图名称查找匹配的遍历配置

        遍历所有已加载的域配置，检查 viewMatchers 是否匹配视图名称。
        匹配策略：关键词越长优先级越高（更具体的匹配优先）。

        支持 modes 多模式：
        - 先检查各 mode 的 viewMatchers（更具体）
        - 再检查主级 viewMatchers（兜底）
        - 主配置无模板时，回退到首个有模板的 mode
        """
        if not self._loaded:
            self.load()

        if not self._configs:
            return None

        view_lower = view_name.lower()
        best_match = None
        best_match_len = 0

        for config in self._configs.values():
            # 1. 先检查 modes 中的 viewMatchers（更具体的匹配）
            if config.modes:
                for mode_name, mode in config.modes.items():
                    mode_matchers = mode.get("viewMatchers", [])
                    match_len = self._find_match_length(view_lower, mode_matchers)
                    if match_len > best_match_len:
                        best_match_len = match_len
                        best_match = self._build_mode_config(config, mode_name, mode)

            # 2. 再检查主级 viewMatchers（兜底）
            match_len = self._find_match_length(view_lower, config.view_matchers)
            if match_len > best_match_len:
                best_match_len = match_len
                # 如果主配置无模板但有 modes，回退到首个有模板的 mode
                if not config.template and config.modes:
                    for mode_name, mode in config.modes.items():
                        if mode.get("template", ""):
                            best_match = self._build_mode_config(config, mode_name, mode)
                            break
                    else:
                        best_match = config
                else:
                    best_match = config

        return best_match

    @staticmethod
    def _find_match_length(view_lower: str, matchers: list) -> int:
        """查找匹配关键词的长度（越长越具体）

        匹配策略：返回匹配到的最长关键词长度。
        更长的关键词代表更具体的业务语义，优先级更高。

        Returns:
            匹配到的关键词长度，未匹配返回 0
        """
        max_len = 0
        for m in matchers:
            m_lower = m.lower()
            if m_lower in view_lower:
                if len(m) > max_len:
                    max_len = len(m)
        return max_len

    @staticmethod
    def _find_match_length(view_lower: str, matchers: list) -> int:
        """查找匹配关键词的长度（越长越具体）

        Returns:
            匹配到的关键词长度，未匹配返回 0
        """
        max_len = 0
        for m in matchers:
            if m.lower() in view_lower:
                if len(m) > max_len:
                    max_len = len(m)
        return max_len

    @staticmethod
    def _build_mode_config(config: TraversalConfig, mode_name: str,
                            mode: Dict[str, Any]) -> TraversalConfig:
        """从主配置和 mode 构建新的 TraversalConfig"""
        new_data = config.to_dict()
        new_data["index"] = mode.get("index", config.index)
        new_data["template"] = mode.get("template", config.template)
        new_data["_selectedMode"] = mode_name
        new_data["_modeDescription"] = mode.get("description", "")
        return TraversalConfig(new_data)

    @property
    def config_count(self) -> int:
        return len(self._configs)


# 全局实例
_loader: Optional[TraversalLoader] = None


def get_traversal_loader(rules_dir: Optional[Path] = None) -> TraversalLoader:
    """获取遍历配置加载器实例"""
    global _loader
    if _loader is None:
        # 规则库实际在 rules/domains 目录下
        # 如果传入的是 rules 目录，则添加 "domains" 子目录
        # 如果传入的是 rules/domains 目录，则直接使用
        if rules_dir and rules_dir.name == "domains":
            domains_dir = rules_dir
        elif rules_dir:
            domains_dir = rules_dir / "domains"
        else:
            domains_dir = None
        _loader = TraversalLoader(domains_dir)
    return _loader
