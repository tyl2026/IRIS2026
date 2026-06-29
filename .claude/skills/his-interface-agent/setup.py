"""HIS 接口自动开发 Agent - 安装配置"""

from setuptools import setup, find_packages
from pathlib import Path

# 读取 README
readme_file = Path(__file__).parent / "README.md"
long_description = readme_file.read_text(encoding="utf-8") if readme_file.exists() else ""

# 读取依赖
requirements = [
    "pdfplumber>=0.7.0",
    "python-docx>=0.8.11",
    "openpyxl>=3.0.0",
    "PyYAML>=6.0",
]

# 可选依赖
extras_require = {
    "doc": ["mammoth>=1.12.0"],  # .doc 文件支持
    "all": ["mammoth>=1.12.0"],  # 全部功能
}

setup(
    name="his-interface-agent",
    version="1.0.0",
    description="HIS 接口自动开发 Agent - 基于接口文档自动生成 IRIS ObjectScript 接口程序",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="SoneAleko",
    python_requires=">=3.8",
    packages=find_packages(),
    include_package_data=True,
    package_data={
        "src": [
            "parsers/config/*.yaml",
            "config/*.json",
        ],
    },
    install_requires=requirements,
    extras_require=extras_require,
    entry_points={
        "console_scripts": [
            "his-agent=src.cli:main",
        ],
    },
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Software Development :: Code Generators",
    ],
)
