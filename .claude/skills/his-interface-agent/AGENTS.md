# HIS 接口自动开发 Agent - 通用 Agent 使用指南

> 本文件供其他 AI Agent（如 CodeBuddy、Trae、CoStrict 等）使用，提供标准化的调用接口。

## 变量说明

本文中用 `{PROJECT_DIR}` 表示项目所在目录（即 clone 后项目根目录）。

| 变量 | 含义 | 确定方式 |
|------|------|---------|
| `{PROJECT_DIR}` | 项目根目录 | clone 时所在目录，如 `/home/user/his-interface-agent` |

## 项目概述

这是一个 HIS 接口自动开发工具，可以根据接口文档自动生成 InterSystems IRIS ObjectScript 接口代码。

**核心能力**：
- 解析接口文档（DOCX/PDF/XLSX/DOC）
- 匹配取值规则（15个业务域、705+条规则）
- 生成接口代码（Query/JSON/XML）

## 环境要求

- Python 3.8+
- 依赖库：pdfplumber、python-docx、openpyxl、PyYAML

## 安装方法

> **前提**：所有命令需在项目根目录执行（即 clone 后项目所在的目录，下文用 `{PROJECT_DIR}` 表示）。

### 方式A：直接使用（无需安装）

```bash
# 进入项目目录
cd {PROJECT_DIR}

# 只装依赖，不装 CLI
pip install pdfplumber python-docx openpyxl PyYAML

# 使用 python -m src 运行
python -m src parse --file "docs/input/接口文档.docx"
python -m src generate --file "docs/input/接口文档.docx" --format query
```

### 方式B：安装后使用（推荐给团队）

```bash
# 安装项目包（可编辑模式，推荐！）
pip install -e .

# 使用简化的 CLI 命令
his-agent parse --file "docs/input/接口文档.docx"
his-agent generate --file "docs/input/接口文档.docx" --format query
```

## 更新同步

项目功能完善和更新后，按安装方式不同，同步方法如下：

### 方式A 安装的（直接使用的）

```bash
cd {PROJECT_DIR}
git pull
pip install <新增的依赖库>  # 如有新依赖
```

### 方式B 安装的（`pip install -e .` 可编辑模式）

```bash
cd {PROJECT_DIR}
git pull          # 拉取最新代码，自动生效，无需重装
```

> **推荐使用 `pip install -e .`**（可编辑模式），更新代码后立即生效，无需任何额外操作。

### 更新注意事项

| 情况 | 操作 |
|------|------|
| 代码更新（.py 文件） | `git pull` 即可，可编辑模式自动生效 |
| 新增依赖库 | `pip install <新库名>` |
| 配置文件更新（yaml/json） | `git pull` 即可 |
| 规则库更新（rules/） | `git pull` 即可 |
| 破坏性变更 | 查看提交记录，必要时重新安装：`pip install -e . --force-reinstall` |

## 调用接口

### 1. 解析文档

**命令格式**：
```bash
python -m src parse --file "<文档路径>"
```

**示例**：
```bash
python -m src parse --file "docs/input/绩效接口HIS系统.xlsx"
```

**返回信息**：
- 视图数量
- 字段数量
- 每个视图的名称和字段列表

### 2. 生成代码

**命令格式**：
```bash
python -m src generate --file "<文档路径>" --format <格式> --output <输出目录>
```

**参数说明**：
- `--file`：接口文档路径
- `--format`：输出格式（query/json/xml/all）
- `--output`：输出目录（默认 output/）
- `--view`：只生成指定视图（可选）
- `--system`：系统名（可选，用于包路径）
- `--subpath`：子路径（可选，OP/IP/Common）

**示例**：
```bash
# 生成 Query 格式
python -m src generate --file "doc.docx" --format query --output output/

# 生成所有格式
python -m src generate --file "doc.docx" --format all

# 只生成指定视图
python -m src generate --file "doc.docx" --format query --view "V_NIS_PatientBasicInfo"
```

### 3. 查询规则

**命令格式**：
```bash
python -m src rule lookup --field "<字段名>"
```

**示例**：
```bash
python -m src rule lookup --field "患者姓名"
```

### 4. 审查代码

**命令格式**：
```bash
python -m src review --file "<代码文件路径>"
```

**示例**：
```bash
python -m src review --file "output/SmartWard_PatientInfo.cls"
```

## 工作流程

### 典型使用流程

```
1. 用户提供接口文档（DOCX/PDF/XLSX/DOC）
   ↓
2. 解析文档，获取字段列表
   python -m src parse --file "doc.docx"
   ↓
3. 生成接口代码
   python -m src generate --file "doc.docx" --format query
   ↓
4. 审查生成的代码
   python -m src review --file "output/xxx.cls"
   ↓
5. 将代码上传到 IRIS 编译验证
```

### 自然语言调用示例

用户可能会这样请求：

> "帮我解析这个接口文档并生成代码"

Agent 应该：

1. 识别用户提供的文档路径
2. 调用解析命令
3. 调用生成命令
4. 返回结果

## 输出说明

### 解析输出

```
解析成功! 共 12 个视图, 1050 个字段

  HIS_DICT_DEPT      | 科室字典     | 5字段
  HIS_DICT_EMPLOYEE  | 员工字典     | 15字段
  ...
```

### 生成输出

生成的代码文件保存在 `output/` 目录，文件名格式：
- Query: `{视图名}.cls`
- JSON: `{视图名}_JSON.cls`
- XML: `{视图名}_XML.cls`

## 配置文件

### 表头映射配置

位置：`src/parsers/config/header_mapping.yaml`

如果文档的列名无法识别，需要在此文件中添加映射：

```yaml
fields:
  field_name:
    - "字段名"      # 已有
    - "你的列名"    # ← 新增
```

### 全局配置

位置：`config/default.json`

可配置项：
- 包路径前缀
- 默认作者
- IRIS 命名空间
- 取值引擎参数

## 注意事项

1. **工作目录**：所有命令需要在项目根目录执行
2. **文档路径**：支持相对路径和绝对路径
3. **编码问题**：Windows 环境下可能需要设置 `PYTHONIOENCODING=utf-8`
4. **.doc 文件**：需要额外安装 mammoth 或 LibreOffice

## 错误处理

常见错误及解决方案：

| 错误 | 原因 | 解决方案 |
|------|------|---------|
| `ModuleNotFoundError` | 依赖未安装 | `pip install pdfplumber python-docx openpyxl PyYAML` |
| `FileNotFoundError` | 文件路径错误 | 检查文件路径是否正确 |
| `解析失败: 未解析到任何视图` | 文档格式不支持 | 检查 header_mapping.yaml 配置 |

## 技术支持

如有问题，请联系项目维护者或查看：
- [README.md](README.md) - 项目说明
- [DESIGN_BLUEPRINT.md](docs/DESIGN_BLUEPRINT.md) - 架构设计
