"""配置加载器

读取 config/default.json 和项目配置，提供统一的配置访问接口。
"""

import json
import os
from pathlib import Path
from typing import Any, Dict, Optional


class ConfigLoader:
    """配置加载器"""

    def __init__(self, project_root: Optional[str] = None):
        """初始化配置加载器

        Args:
            project_root: 项目根目录，默认自动检测
        """
        if project_root:
            self.project_root = Path(project_root)
        else:
            # 自动检测：从当前文件向上找包含 config/ 的目录
            self.project_root = self._find_project_root()

        self._config: Dict[str, Any] = {}
        self._loaded = False

    def _find_project_root(self) -> Path:
        """自动查找项目根目录"""
        current = Path(__file__).parent
        while current != current.parent:
            if (current / "config" / "default.json").exists():
                return current
            current = current.parent
        # 回退到当前工作目录
        return Path.cwd()

    def load(self, project_config: Optional[str] = None) -> Dict[str, Any]:
        """加载配置

        Args:
            project_config: 项目配置文件路径（可选）

        Returns:
            合并后的配置字典
        """
        # 加载默认配置
        default_path = self.project_root / "config" / "default.json"
        if default_path.exists():
            with open(default_path, "r", encoding="utf-8") as f:
                self._config = json.load(f)
        else:
            self._config = self._get_default_config()

        # 加载项目配置（如果有）
        if project_config:
            project_path = Path(project_config)
            if project_path.exists():
                with open(project_path, "r", encoding="utf-8") as f:
                    project_cfg = json.load(f)
                self._merge_config(self._config, project_cfg)

        self._loaded = True
        return self._config

    def _merge_config(self, base: Dict, override: Dict) -> Dict:
        """递归合并配置"""
        for key, value in override.items():
            if key in base and isinstance(base[key], dict) and isinstance(value, dict):
                self._merge_config(base[key], value)
            else:
                base[key] = value
        return base

    def get(self, key: str, default: Any = None) -> Any:
        """获取配置值，支持点号分隔的路径

        示例: config.get("project.packagePrefix")
        """
        if not self._loaded:
            self.load()

        keys = key.split(".")
        value = self._config
        for k in keys:
            if isinstance(value, dict):
                value = value.get(k)
            else:
                return default
            if value is None:
                return default
        return value

    @property
    def project(self) -> Dict[str, Any]:
        """项目配置"""
        return self.get("project", {})

    @property
    def config(self) -> Dict[str, Any]:
        """完整配置字典"""
        if not self._loaded:
            self.load()
        return self._config

    @property
    def value_engine(self) -> Dict[str, Any]:
        """取值引擎配置"""
        return self.get("valueEngine", {})

    @property
    def pipeline(self) -> Dict[str, Any]:
        """流水线配置"""
        return self.get("pipeline", {})

    @property
    def rules_dir(self) -> Path:
        """规则库目录"""
        return self.project_root / "rules"

    @property
    def domains_dir(self) -> Path:
        """业务域规则目录"""
        return self.rules_dir / "domains"

    @property
    def templates_dir(self) -> Path:
        """模板目录"""
        return self.project_root / "templates"

    @property
    def output_dir(self) -> Path:
        """输出目录"""
        return self.project_root / "output"

    def _get_default_config(self) -> Dict[str, Any]:
        """获取默认配置（当配置文件不存在时使用）"""
        return {
            "project": {
                "packagePrefix": "web.DHCENS.BLL",
                "author": "CodeBuddy",
                "namespace": "DHC-APP",
                "outputEncoding": "utf-8-bom"
            },
            "valueEngine": {
                "l1": {"enabled": True, "confidenceThreshold": 0.8},
                "l2": {"enabled": False, "provider": "claude", "confidenceThreshold": 0.7},
                "l3": {"enabled": False, "confidenceThreshold": 0.9},
                "l4": {"enabled": True, "autoFeedback": True}
            },
            "pipeline": {
                "enhanced": {
                    "review": True,
                    "test": False,
                    "package": False
                }
            }
        }


# 全局配置实例
_config_instance: Optional[ConfigLoader] = None


def get_config(project_root: Optional[str] = None) -> ConfigLoader:
    """获取全局配置实例"""
    global _config_instance
    if _config_instance is None:
        _config_instance = ConfigLoader(project_root)
        _config_instance.load()
    return _config_instance
