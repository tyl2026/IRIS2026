# HIS 接口自动开发 Agent

基于接口文档自动生成 InterSystems IRIS ObjectScript 接口程序。

## 功能特性

- **多格式支持**：DOCX / PDF / XLSX / DOC 四种文档格式
- **配置驱动**：新增文档格式只需编辑配置文件，无需改代码
- **规则匹配**：15个业务域、705+条取值规则，5级匹配策略
- **代码生成**：支持 Query/JSON/XML 三种格式
- **代码审查**：P0红线7条 + P1约束8条，自动检查
- **四级取值引擎**：规则库→深度学习→AI推理→人工回流，越用越强

## 前置条件

| 依赖 | 版本要求 | 说明 |
|------|---------|------|
| Python | >= 3.8 | 推荐 3.10+ |
| pip | 最新版 | 用于安装依赖包 |

检查环境：
```bash
python --version   # 确认 >= 3.8
pip --version      # 确认可用
```

## 安装

### 方式1：本地安装（推荐）

```bash
# 克隆项目
git clone <repository-url>
cd his-interface-agent

# 安装（可编辑模式）
pip install -e .

# 安装含 .doc 支持
pip install -e ".[doc]"
```

### 方式2：仅安装依赖

```bash
pip install pdfplumber python-docx openpyxl PyYAML

# 如需 .doc 支持
pip install mammoth
```

### 方式3：直接拷贝文件夹

适用于无法访问 Git 仓库的场景（U盘拷贝、共享文件夹、内网传输等）。

```bash
# 1. 进入项目目录
cd his-interface-agent

# 2. 安装依赖（二选一）
pip install -e .              # 推荐：安装为可执行包，可直接用 his-agent 命令
pip install -e ".[doc]"       # 含 .doc 格式支持

# 或仅安装依赖（不注册命令）
pip install pdfplumber python-docx openpyxl PyYAML

# 3. 验证安装
his-agent --help              # 方式1安装后可用
python -m src --help          # 通用方式
```

> **注意**：直接拷贝的项目没有 `.git` 目录，无法使用 `git pull` 更新。如需后续更新，建议转为 git 管理。

## 更新同步

项目更新后，按安装方式同步：

```bash
# 方式1（可编辑模式，推荐）：直接 git pull 即可，自动生效
cd his-interface-agent
git pull

# 方式2（仅安装依赖）：同样 git pull，新增依赖需手动安装
cd his-interface-agent
git pull
pip install <新增的依赖库>
```

> **推荐 `pip install -e .`**，更新代码后无需重装，即时生效。

## 首次使用配置

安装完成后，建议根据实际环境调整以下配置：

### 1. 项目配置（按需修改）

位置：`config/default.json`

```json
{
  "project": {
    "packagePrefix": "web.DHCENS.BLL",  // 包路径前缀，按项目规范修改
    "author": "YourName",                // ← 改为你的名字
    "namespace": "DHC-APP"               // IRIS 命名空间，按实际修改
  }
}
```

### 2. 放入接口文档

将待处理的接口文档放入 `docs/input/` 目录：

```
docs/input/
├── 智慧病房管理系统接口.docx
├── 检验系统接口.pdf
└── 其他接口文档.xlsx
```

### 3. 验证环境

```bash
# 检查命令可用
his-agent --help

# 测试文档解析（替换为你的文档路径）
his-agent parse --file "docs/input/你的文档.docx"

# 查询规则库
his-agent rule list-domains
```

### 4. 可选：配置 MCP 连接

如需 L2 深度学习能力（查询 IRIS 实体类），需配置 MCP 连接：

```json
// .mcp.json（项目根目录）
{
  "mcpServers": {
    "iris-dev-official": {
      "command": "npx",
      "args": ["-y", "iris-agentic-dev@latest"]
    }
  }
}
```

> 无 MCP 连接时，L2 会自动降级为示例扫描模式，不影响核心功能。

## 使用方式

本项目支持两种使用方式，推荐优先使用 **AI Agent 自然语言**方式。

### 方式1：AI Agent 自然语言（推荐）

在项目目录下打开 Coding Agent，直接用自然语言描述需求即可。

**支持的 Agent 工具**：

| Agent | 指令文件 | 说明 |
|-------|---------|------|
| Claude Code | `CLAUDE.md` | 自动加载，完整支持 |
| CodeBuddy | `AGENTS.md` | 通用指令文件 |
| 其他 Agent | `AGENTS.md` | 兼容使用 |

**典型场景**：

```
# 生成新接口
帮我根据这个文档生成 Query 格式的接口代码 docs/input/智慧病房管理系统接口.docx

# 指定格式
把文档里的患者基本信息接口生成 JSON 格式

# 修改已有接口
给 output/SmartWard_PatientInfo.cls 添加按科室ID过滤的功能

# 查询规则库
患者身份证号怎么取值？

# 代码审查
帮我审查一下 output/ 下生成的代码有没有违反 P0 红线

# 测试验证
测试一下这个接口能不能在 IRIS 上编译通过
```

**Agent 工作流程**：

```
用户描述需求
    ↓
Agent 自动加载 CLAUDE.md 指令集
    ↓
┌─ 生成代码 ─────────────────────────────────┐
│  1. 识别业务域 → 加载对应规则库             │
│  2. 逐字段查规则库（L1）                    │
│  3. 未命中 → L2深度学习 → L3 AI推理         │
│  4. 生成代码 → P0红线检查                   │
│  5. 输出到 output/ 目录                     │
└────────────────────────────────────────────┘
    ↓
┌─ 修改代码 ─────────────────────────────────┐
│  1. 读取已有代码                            │
│  2. 理解修改需求                            │
│  3. 执行修改 → 保持风格一致                 │
│  4. P0红线检查                              │
└────────────────────────────────────────────┘
```

**最佳实践**：

1. **明确需求**：说明要生成什么格式（Query/JSON/XML）、哪些字段
2. **提供上下文**：如有特殊取值逻辑，直接告诉 Agent
3. **分步执行**：复杂接口可分多次生成，逐步完善
4. **确认结果**：Agent 生成后会展示代码，确认无误再使用
5. **反馈修正**：发现问题直接说，Agent 会修改并记住规则

### 方式2：CLI 命令行

> **注意**：以下命令需在项目根目录执行。文档路径支持相对路径和绝对路径。

```bash
# 1. 解析接口文档
his-agent parse --file "docs/input/智慧病房管理系统接口.docx"

# 2. 生成接口代码
his-agent generate --file "docs/input/智慧病房管理系统接口.docx" --format query

# 3. 查询取值规则
his-agent rule lookup --field "患者姓名"
his-agent rule list-domains

# 4. 审查代码
his-agent review --file output/SmartWard_PatientInfo.cls

# 5. 验收测试
python scripts/verify.py
```

未安装为可执行包时，可用 `python -m src` 替代 `his-agent`：

```bash
python -m src parse --file "docs/input/智慧病房管理系统接口.docx"
```

### 两种方式对比

| 对比项 | AI Agent 自然语言 | CLI 命令行 |
|-------|------------------|-----------|
| 学习成本 | 直接说话，零门槛 | 需记命令和参数 |
| 灵活性 | 任意描述需求 | 固定参数组合 |
| 修改能力 | Agent 自动修改 | 需手动编辑代码 |
| 规则回流 | Agent 自动整理 | 需手动操作 |
| 复杂逻辑 | 自然描述即可 | 难以表达 |

## 支持的文档格式

| 格式 | 说明 | 状态 |
|------|------|------|
| .docx | Word 文档 | ✅ 完全支持 |
| .pdf | PDF 文档 | ✅ 完全支持 |
| .xlsx | Excel 文档 | ✅ 完全支持 |
| .doc | 旧版 Word 文档 | ⚠️ 需安装 LibreOffice 或 mammoth |

## 配置文件

### 表头映射配置

位置：`src/parsers/config/header_mapping.yaml`

新增文档格式时，只需在此文件中添加列名变体：

```yaml
fields:
  field_name:
    - "字段名"      # 已有
    - "字段代码"    # 已有
    - "你的列名"    # ← 新增
```

### 全局配置

位置：`config/default.json`

```json
{
  "project": {
    "packagePrefix": "web.DHCENS.BLL",
    "author": "CodeBuddy",
    "namespace": "DHC-APP"
  },
  "valueEngine": {
    "l1": { "enabled": true, "confidenceThreshold": 0.8 },
    "l2": { "enabled": true },
    "l3": { "enabled": true },
    "l4": { "enabled": true, "autoFeedback": true }
  }
}
```

## 目录结构

```
his-interface-agent/
├── CLAUDE.md                      # Claude Code 指令集
├── AGENTS.md                      # 通用 Agent 指令文件
├── README.md                      # 本文件
├── setup.py                       # 安装配置
├── config/
│   └── default.json               # 全局配置
├── docs/
│   ├── DESIGN_BLUEPRINT.md        # 施工设计蓝图
│   └── input/                     # 接口文档存放处
├── examples/                      # 优秀示例代码
├── output/                        # 生成的代码输出
├── references/                    # 参考资料
├── rules/                         # 取值规则库（核心资产）
│   ├── domains/                   # 15个业务域规则
│   ├── common/                    # 通用规则
│   └── custom/                    # 自定义规则（回流目标）
├── scripts/                       # 工具脚本
└── src/                           # Agent 源码
    ├── cli.py                     # 命令行入口
    ├── parsers/                   # 文档解析器
    │   ├── config/
    │   │   └── header_mapping.yaml  # 表头映射配置
    │   ├── factory.py             # 解析器工厂
    │   ├── docx_parser.py         # DOCX 解析器
    │   ├── pdf_parser.py          # PDF 解析器
    │   ├── xlsx_parser.py         # XLSX 解析器
    │   └── doc_converter.py       # DOC 转换器
    ├── generators/                # 代码生成器
    ├── value_engine/              # 取值引擎
    └── reviewers/                 # 代码审查器
```

## 四级取值引擎

| 级别 | 名称 | 说明 |
|------|------|------|
| L1 | 规则库匹配 | 核心，零延迟，最可靠 |
| L2 | 深度学习 | 有MCP查IRIS / 无MCP参考示例 |
| L3 | AI推理 | LLM语义推断，能力范围内补充 |
| L4 | 人工兜底+回流 | 用户指导→整理→回流规则库 |

**越用越强**：每次人工兜底都会回流到规则库，下次直接命中。

## 规则库覆盖

| 域ID | 名称 | 规则数 |
|------|------|--------|
| 00-dictionary | 字典类 | 76 |
| 01-user | 用户/员工 | 49 |
| 10-patient | 患者主索引 | 44 |
| 20-visit | 就诊/入院 | 47 |
| 30-diagnosis | 诊断 | 38 |
| 40-order | 医嘱 | 75 |
| 50-lab-exam | 检验检查 | 131 |
| 55-exam-report | 影像报告 | 67 |
| 60-surgery | 手术 | 25 |
| 70-nursing | 护理 | 56 |
| 90-medical-record | 病案首页 | 3 |
| a0-fee-settlement | 费用结算 | 48 |
| d0-pharmacy | 药品/药房 | 38 |
| z0-common | 跨域通用 | 7 |
| zz-custom | 自定义 | 1 |
| **合计** | | **705** |

## 常见问题

**Q: 生成的代码字段取值为空（TODO）怎么办？**

A: 说明该字段在规则库中未命中。可以：
1. 在 `examples/` 放入相关示例代码
2. 直接告诉我取值逻辑，我会整理后回流到规则库

**Q: 如何添加新的业务域规则？**

A: 参考 `references/rule-library-sop.md` 中的标准流程，在 `rules/domains/` 下创建新的域文件。

**Q: 如何支持新的文档格式？**

A: 编辑 `src/parsers/config/header_mapping.yaml`，在对应的字段名下添加新的列名变体即可。

**Q: .doc 文件无法解析？**

A: .doc 格式需要安装 LibreOffice 或 mammoth：
```bash
pip install mammoth
```
或手动将 .doc 另存为 .docx 格式。

## 相关文档

- [施工设计蓝图](docs/DESIGN_BLUEPRINT.md) - 详细的架构设计
- [规则库整理SOP](references/rule-library-sop.md) - 如何添加规则
- [踩坑经验](references/his-pitfalls.md) - 常见问题和解决方案
- [表头映射配置](src/parsers/config/header_mapping.yaml) - 文档格式配置

## 许可证

内部项目，仅限授权使用。
