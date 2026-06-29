# HIS 接口自动开发 Agent — 施工设计蓝图

> **版本**：v1.3
> **日期**：2026-06-03
> **状态**：进行中

---

## 目录

1. [项目概述](#1-项目概述)
2. [需求分析](#2-需求分析)
3. [架构设计](#3-架构设计)
4. [目录结构设计](#4-目录结构设计)
5. [核心组件设计](#5-核心组件设计)
   - 5.1 文档解析器
   - 5.2 取值引擎
   - 5.3 代码生成器
   - 5.4 代码审查器
   - 5.5 匹配率提升策略
   - **5.6 接口修改与测试子Agent** ★新增
   - **5.7 接口索引系统** ★新增
   - **5.8 代码风格规范体系** ★新增
6. [配置系统设计](#6-配置系统设计)
7. [规则库设计](#7-规则库设计)
8. [多项目复用方案](#8-多项目复用方案)
9. [版本管理方案](#9-版本管理方案)
10. [实施计划](#10-实施计划)
11. [附录](#11-附录)

---

## 1. 项目概述

### 1.1 项目背景

在医疗信息系统（HIS）集成场景中，需要频繁开发接口程序以对接外部系统（如单病种上报、智慧医疗、互联互通等）。这些接口程序具有以下特点：

- **结构相似**：解析参数 → 查询数据 → 格式化输出（Query/JSON/XML）
- **字段映射固定**：HIS 的 Global 存储结构相对稳定
- **重复性高**：不同项目的同类接口（如患者信息查询）逻辑基本一致

### 1.2 项目目标

构建一个 **HIS 接口自动开发 Agent**，实现：

1. **文档解析**：自动解析接口文档（PDF/DOCX/Excel/在线网页）
2. **代码生成**：自动生成 InterSystems IRIS ObjectScript 接口代码
3. **规则学习**：通过使用不断积累和完善取值规则
4. **多项目支持**：支持多个项目共享规则库，同时允许项目个性化

### 1.3 核心价值

| 价值点 | 说明 |
|--------|------|
| **效率提升** | 从手工编码转为自动生成，预计节省 60-80% 开发时间 |
| **质量保证** | 基于验证过的规则库生成代码，减少人为错误 |
| **知识沉淀** | 将 HIS 数据结构知识固化为可复用的规则库 |
| **持续进化** | 通过 L4 回流机制，使用越多、覆盖越广 |

---

## 2. 需求分析

### 2.1 输入源

| 格式 | 说明 | 优先级 |
|------|------|--------|
| **PDF** | 视图版文档，定义数据结构（字段名、类型、长度） | 高 |
| **DOCX** | 接口版文档，定义接口调用方式（URL、参数、返回格式） | 高 |
| **Excel** | 部分厂商提供的接口文档，格式不统一 | 中 |
| **在线网页** | Swagger/OpenAPI 或厂商自有平台 | 低（后续扩展） |

### 2.2 输出格式

| 格式 | 适用场景 | 示例 |
|------|---------|------|
| **Query** | 数据集视图，适用于报表查询 | `Query GetPatientList()` |
| **JSON** | REST API，适用于移动端/前端 | `ClassMethod GetPatientJSON()` |
| **XML** | WebService，适用于第三方系统对接 | `ClassMethod GetPatientXML()` |

### 2.3 接口参数类型

| 参数类型 | 说明 | 示例 |
|---------|------|------|
| 日期范围 | 按时间筛选 | `pAdmDateFrom`, `pAdmDateTo` |
| 就诊ID | 按就诊记录查询 | `pAdmId` |
| 登记号 | 按患者登记号查询 | `pRegNo` |
| 流水号 | 按业务流水号查询 | `pLSH` |

### 2.4 业务域覆盖

基于 v2.5.0 规则库，覆盖以下业务域（17域，~777条规则）：

| 域ID | 名称 | 规则数 | 版本 | 说明 |
|------|------|--------|------|------|
| 00 | 字典类 | 36 | v1.0.0 | 科室、人员、床位、医嘱项等6大核心字典 |
| 01 | 用户/员工 | 39 | v2.2.0 | 医生、护士、技师、登录用户 |
| 10 | 患者主索引 | 55 | v2.2.0 | 患者基本信息、联系方式、证件 |
| 20 | 就诊/入院 | 56 | v2.2.0 | 就诊记录、入院信息、床位 |
| 30 | 诊断 | 24+ | v3.2.0 | 门诊/住院诊断（最高成熟度域） |
| 40 | 医嘱 | 75 | v2.1.0 | 医嘱开具、执行、停止 |
| 50 | 检验检查 | 95 | v2.1.0 | LIS检验报告+细项+药敏（IRIS验证） |
| 55 | 影像报告 | 67 | v2.0.0 | RIS/PACS影像检查报告 |
| 60 | 手术 | 58 | v2.0.0 | 手术记录+麻醉（双版本CIS.AN/DHCANOP） |
| 70 | 护理 | 50 | v2.0.0 | 护理病历、生命体征、术语集 |
| 80 | 体征/生命体征 | 50 | v2.0.0 | 体征数据采集、血糖等 |
| 90 | 病案首页 | 44 | v2.0.0 | EMR病案首页 |
| A0 | 费用结算 | 70+ | v2.0.0 | 门诊/住院费用明细 |
| B0 | 库存/物资 | 40 | v2.0.0 | 库存管理、物资出入库 |
| D0 | 药品/药房 | 161 | v2.0.0 | 发药、退药、库存、药品信息 |
| z0 | 跨域通用 | 7 | v2.0.0 | 跨域通用字段抽象 |
| zz | 自定义 | 19 | v2.0.0 | 实战回流自定义规则 |

---

## 3. 架构设计

### 3.1 总体架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                    HIS 接口自动开发 Agent 总体架构                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │
│  │  文档解析器  │  │  取值引擎   │  │  代码生成器  │  │  代码审查  │  │
│  │  (Parser)   │  │(Value Engine)│  │ (Generator) │  │ (Reviewer)│  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬─────┘  │
│         │                │                │               │        │
│         └────────────────┼────────────────┼───────────────┘        │
│                          ▼                ▼                        │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                      规则库 (Rules)                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │  │
│  │  │  domains/   │  │   common/   │  │   custom/   │          │  │
│  │  │  业务域规则  │  │  通用规则   │  │  自定义规则  │          │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘          │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    配置中心 (Config)                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │  │
│  │  │  全局配置   │  │  项目配置   │  │  MCP 配置   │          │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘          │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 四级取值引擎架构（升级版）

> **设计原则**：真实数据优先于猜测，能力范围内补充，超出能力交人工兜底

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        取值引擎 (Value Engine) — 四级降级策略              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  L1 规则库匹配（始终启用，零延迟，最可靠）                                  │
│  │  数据源: rules/domains/*.md（人工验证过的规则库）                       │
│  │  匹配策略: 精确 → 别名 → 正则 → 包含 → 模糊（5级匹配）                 │
│  │  confidence ≥ threshold → 采用 valueExpression                       │
│  │                                                                      │
│  ├─ 未命中 ──→ L2 深度学习（从真实数据学习，较可靠）                       │
│  │              ├─ 有MCP连接: 查询IRIS数据库                              │
│  │              │   方式: iris_search / docs_introspect / iris_execute   │
│  │              │   优势: 真实数据，可验证，非猜测                         │
│  │              │                                                        │
│  │              └─ 无MCP连接: 参考示例代码                                │
│  │                  数据源1: examples/*.cls（优秀示例代码）               │
│  │                  数据源2: sources/（相关代码库）                       │
│  │                  fallback: 提示用户放入更多示例材料                    │
│  │                                                                      │
│  │              ├─ 未命中 ──→ L3 AI 推理（能力范围内补充）                │
│  │              │              方式: LLM根据字段名语义推断                │
│  │              │              依据: 业务知识 + 上下文分析                │
│  │              │              定位: 补充，不是兜底                       │
│  │              │              限制: 复杂业务可能推断不准                 │
│  │              │                                                        │
│  │              │              ├─ 推断不准/不懂 ──→ L4 人工兜底+回流     │
│  │              │              │                  用户告知取值逻辑       │
│  │              │              │                  Agent按SOP整理规则     │
│  │              │              │                  人工确认后回流规则库 ★ │
│  └──────────────┴──────────────┴─────────────────────────────────────  │
│                                                                         │
│  自学习闭环: L2/L4 确认 → Agent按SOP整理 → 回流 rules/custom/ → L1命中   │
│  越用越强: 每次人工兜底都是一次学习，规则库持续扩充                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 四级引擎定位说明

| 层级 | 名称 | 定位 | 数据来源 | 可靠性 | 何时启用 |
|------|------|------|---------|--------|---------|
| **L1** | 规则库匹配 | 核心 | `rules/domains/*.md` | ⭐⭐⭐⭐⭐ | 始终启用 |
| **L2** | 深度学习 | 补充 | IRIS数据库 / 本地示例 | ⭐⭐⭐⭐ | L1未命中 |
| **L3** | AI推理 | 补充 | LLM语义推断 | ⭐⭐⭐ | L1-L2未命中 |
| **L4** | 人工兜底+回流 | 兜底 | 用户指导+SOP整理 | ⭐⭐⭐⭐⭐ | L3推断不准 |

#### L2 深度学习 — 两种模式

**模式A：有MCP连接（查IRIS）**
```
字段: "入院诊断代码" (L1未命中)
  ↓
调用MCP工具:
  1. iris_search(query="诊断") — 搜索相关类和方法
  2. docs_introspect(class_name="MR.Diagnos") — 查看类结构
  3. iris_execute(code="...") — 验证取值逻辑
  ↓
学习结果:
  ^MR(mrAdm,"DIA",sub) — 诊断记录Global
  $p($g(^MR(mrAdm,"DIA",sub)),"^",1) — ICD诊断DR
  $p($g(^MRC("ID",icdDr)),"^",4) — ICD编码
  ↓
输出: s inDiagCode=$p($g(^MRC("ID",icdDr)),"^",4)
```

**模式B：无MCP连接（参考示例）**
```
字段: "入院诊断代码" (L1未命中)
  ↓
扫描本地资源:
  1. examples/*.cls — 搜索"诊断"相关接口
  2. sources/ — 搜索相关代码库
  ↓
如果找到示例 → 提取取值逻辑
如果未找到 → 提示用户:
  "建议在 examples/ 目录下放入诊断相关的接口代码，可以提升取值质量"
```

#### L4 人工兜底+回流流程

```
字段: "特殊业务字段" (L1-L3均未命中或不准确)
  ↓
Agent询问用户: "这个字段应该怎么取值？"
  ↓
用户告知: "从^XXX(Global)的第3位取，通过YYY字典翻译"
  ↓
Agent按SOP整理规则:
  - 标准名: SPECIAL_FIELD
  - 匹配模式: 特殊业务字段, SpecialField
  - 取值表达式: $p($g(^XXX(id)),"^",3)
  - Global: ^XXX
  - 置信度: 1.0（人工确认）
  ↓
人工确认后写入: rules/custom/zz-custom.md
  ↓
下次L1直接命中 ✅
```

#### 越用越强机制

```
┌────────────────────────────────────────────────────────────┐
│                    自学习闭环（越用越强）                      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  第1次: L1未命中 → L2/L3未命中 → L4人工兜底 → 回流规则库    │
│  第2次: L1直接命中 ✅                                      │
│  ...                                                       │
│  第N次: 规则库越来越全，L1命中率越来越高                      │
│                                                            │
│  核心: 每次人工兜底都是一次学习机会                          │
│  目标: 从 70% 填充率 → 95%+ 填充率                          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 3.3 工作流设计

```
Phase 1: 准备
    ├── 加载项目配置 (_project.yaml)
    ├── 加载规则库 (rules/)
    └── 确认输入文件和输出格式

Phase 2: 解析 (Parse)
    ├── PDF → pdf_parser.py
    ├── DOCX → docx_parser.py
    ├── Excel → xlsx_parser.py
    └── 输出: parsed.json (标准化接口数据)

Phase 3: 识别 (Recognize)
    ├── 自动判别接口模式 (Query/JSON/XML)
    ├── 字段名归一化 (别名映射)
    └── 推导类名和方法名

Phase 4: 取值 (Value Resolution) — 四级降级策略
    ├── L1 规则库匹配（核心，始终启用）
    ├── L2 深度学习（补充：有MCP查IRIS / 无MCP参考示例）
    ├── L3 AI 推理（补充：LLM能力范围内语义推断）
    └── L4 人工兜底 + 回流（越用越强）

Phase 5: 生成 (Generate)
    ├── 选择模板 (Query/JSON/XML)
    ├── 注入取值表达式
    └── 渲染输出 .cls 代码

Phase 6: 审查 (Review) — P0检查清单17项
    ├── P0 红线检查 (阻断，12条)
    ├── P1 约束检查 (告警)
    └── 输出审查报告

Phase 7: 输出 (Output)
    ├── 生成的 .cls 代码文件 → output/
    ├── value-gap-report.md (未确定字段报告)
    └── 填充率统计

Phase 8: ★验证与修改 (Test & Modify) — 子Agent
    ├── Mode A: 验证自动生成的代码
    │   上传 → 编译 → 修复(≤5次) → 功能测试
    ├── Mode B: 修改已有接口
    │   定位(索引/MCP/询问) → 导出 → 修改 → 编译 → 测试 → 更新索引
    └── 测试数据: 空参优先 → iris_query获取真实数据
```

---

## 4. 目录结构设计

### 4.1 完整目录结构

```
{PROJECT_DIR}\
│
├── CLAUDE.md                              # 项目配置文件（Claude Code 自动加载）
│
├── config/                                # 配置中心
│   └── default.json                       # 全局默认配置
│
├── rules/                                 # 共享规则库（17域, v2.5.0, ~777条）
│   ├── README.md                          # 规则库使用说明
│   ├── _registry.json                     # 规则索引
│   ├── _version.json                      # 版本信息
│   ├── common/                            # 通用规则
│   │   ├── global-access.md               # Global 访问模式
│   │   └── *-aliases.json                 # 别名映射库
│   ├── domains/                           # 业务域规则（17域）
│   │   ├── 00-dictionary.md               # 字典类
│   │   ├── 01-user.md                     # 用户/员工域
│   │   ├── 10-patient.md                  # 患者主索引域
│   │   ├── 20-visit.md                    # 就诊/入院域
│   │   ├── 30-diagnosis.md                # 诊断域
│   │   ├── 40-order.md                    # 医嘱域
│   │   ├── 50-lab-exam.md                 # 检验检查域
│   │   ├── 55-exam-report.md              # 影像报告域
│   │   ├── 60-surgery.md                  # 手术域
│   │   ├── 70-nursing.md                  # 护理病历域
│   │   ├── 80-vital-sign.md               # 体征域
│   │   ├── 90-medical-record.md           # 病案首页域
│   │   ├── a0-fee-settlement.md           # 费用结算域
│   │   ├── b0-inventory.md                # 库存物资域
│   │   ├── d0-pharmacy.md                 # 药品/药房域
│   │   ├── z0-common.md                   # 跨域通用字段
│   │   └── zz-custom.md                   # 用户自定义规则
│   ├── redlines/                          # 红线规则
│   │   ├── p0-critical.md                 # P0 红线（12条，阻断）
│   │   └── p1-warning.md                  # P1 约束（告警）
│   └── custom/                            # 全局自定义规则
│       └── README.md
│
├── references/                            # ★新增 参考资料库
│   ├── interfaces/                        # 接口标准模板
│   │   ├── query-standard.md              # Query 标准写法
│   │   ├── json-standard.md               # JSON 标准写法
│   │   └── xml-standard.md                # XML 标准写法
│   ├── interface-index/                   # ★接口索引系统
│   │   ├── README.md                      # 索引使用说明
│   │   ├── INDEX.md                       # 快速查找指南
│   │   ├── all-interfaces.md              # 全量接口索引（238类/644方法）
│   │   ├── _template.md                   # 索引条目模板
│   │   └── custom.md                      # 自定义接口
│   ├── objectscript-coding-standards.md   # ObjectScript 编码规范
│   ├── objectscript-code-style.md         # 代码风格详细规范
│   ├── variable-definition-spec.md        # 变量定义规范
│   ├── coding-principles.md               # 编码原则
│   ├── iris-naming-conventions.md         # IRIS 命名约定
│   ├── mcp-entity-lookup.md               # MCP 实体类查找规范
│   ├── his-table-moc.md                   # HIS 业务表 MOC 索引（205表）
│   ├── his-data-flow.md                   # HIS 数据流转参考
│   ├── his-pitfalls.md                    # 踩坑经验积累
│   ├── rule-library-sop.md                # 规则库整理 SOP
│   └── rule-library-progress.md           # 规则库进度
│
├── templates/                             # 代码模板库
│   ├── project/
│   │   └── _project.yaml                  # 项目配置模板
│   ├── query/                             # Query 模式模板
│   │   └── query-template.cls
│   ├── json/                              # JSON 模式模板
│   │   └── json-template.cls
│   └── xml/                               # XML 模式模板
│       └── xml-template.cls
│
├── src/                                   # Agent 源码（Python）
│   ├── __init__.py
│   ├── parsers/                           # 文档解析器
│   │   ├── __init__.py
│   │   ├── base_parser.py                 # 解析器基类 + 数据结构
│   │   ├── header_mapper.py               # 表头映射引擎（配置驱动）
│   │   ├── table_classifier.py            # 表格分类器
│   │   ├── docx_parser.py                 # DOCX 解析器
│   │   ├── pdf_parser.py                  # PDF 解析器
│   │   ├── xlsx_parser.py                 # XLSX 解析器
│   │   ├── doc_converter.py               # DOC 转换器
│   │   ├── factory.py                     # 解析器工厂
│   │   └── config/
│   │       └── header_mapping.yaml        # 表头映射配置（核心资产）
│   ├── value_engine/                      # 取值引擎
│   │   ├── __init__.py
│   │   ├── engine.py                      # 引擎调度器
│   │   ├── rule_loader.py                 # 规则加载器
│   │   ├── l1_rule_engine.py              # L1 规则库匹配
│   │   ├── l2_ai_inference.py             # L2 AI 推理
│   │   ├── l3_mcp_prober.py               # L3 MCP 探测
│   │   └── l4_manual_feedback.py          # L4 人工补全
│   ├── generators/                        # 代码生成器
│   │   ├── __init__.py
│   │   ├── code_generator.py              # 核心生成逻辑
│   │   ├── template_engine.py             # 模板渲染引擎
│   │   └── field_mapper.py                # 字段映射器
│   ├── reviewers/                         # 代码审查器
│   │   ├── __init__.py
│   │   ├── linter.py                      # 红线检查器
│   │   └── iris_tester.py                 # IRIS 编译测试
│   └── utils/                             # 工具函数
│       ├── __init__.py
│       ├── config_loader.py               # 配置加载器
│       └── validator.py                   # 数据校验器
│
├── docs/                                  # 项目文档
│   ├── DESIGN_BLUEPRINT.md                # 本文件（施工设计蓝图）
│   └── input/                             # 接口文档示例
│
├── examples/                              # 示例代码
│   ├── GetLabReport.cls                   # JSON 格式示例
│   ├── PatInfo.cls                        # XML 格式示例
│   └── PatientInfo.cls                    # Query 格式示例
│
├── output/                                # 生成代码输出目录
│
├── scripts/                               # 工具脚本
│   ├── convert_rules.py                   # 规则库转换工具
│   ├── generate_interface_index.py        # ★接口索引生成脚本
│   └── verify.py                          # 验收脚本
│
└── tests/                                 # ★接口测试修改子Agent
    ├── interface-test-agent.md            # 子Agent定义（Mode A/B）
    ├── workflow.md                        # 完整工作流（Mode A/B）
    ├── test-data-discovery.md             # 测试数据发现策略
    └── test_parsers/                      # 单元测试
```

### 4.2 目录职责说明

| 目录 | 职责 | 说明 |
|------|------|------|
| `config/` | 配置中心 | 存储全局默认配置 |
| `rules/` | 共享规则库 | 17域 v2.5.0，~777条规则 |
| `references/` | ★参考资料库 | 编码规范、接口标准、数据流转、MOC索引、接口索引 |
| `templates/` | 代码模板 | 三种模式的 ObjectScript 代码模板 |
| `src/` | Agent 源码 | Python 实现的核心逻辑 |
| `docs/` | 文档 | 设计文档、使用说明 |
| `examples/` | 示例 | 现有的接口代码示例 |
| `output/` | 输出目录 | 生成代码统一输出位置 |
| `scripts/` | 工具脚本 | 规则库转换、索引生成、验收脚本 |
| `tests/` | ★子Agent系统 | 接口测试修改子Agent（Mode A/B）、测试数据发现 |

---

## 5. 核心组件设计

### 5.1 文档解析器 (Parser) ★已实现

#### 职责

将不同格式的接口文档解析为统一的中间格式（ParsedView/ParsedField）。

#### 架构设计

```
文件输入 (.docx / .pdf / .xlsx / .doc)
    │
    ▼
┌──────────────────────────────┐
│  1. 文件读取层 (File Reader)  │  ← 每种格式一个读取器
│  DOCX → python-docx          │
│  PDF  → pdfplumber            │
│  XLSX → openpyxl              │
│  DOC  → LibreOffice转换→DOCX  │
└──────────┬───────────────────┘
           │ 统一输出: 原始表格 + 标题文本
           ▼
┌──────────────────────────────┐
│  2. 表头映射引擎 (HeaderMap)  │  ← YAML配置驱动
│  "字段名" → field_name        │
│  "字段代码" → field_name      │
│  "数据元标识符" → field_name  │
└──────────┬───────────────────┘
           │ 统一输出: 标准字段列表
           ▼
┌──────────────────────────────┐
│  3. 表格分类器 (TableClass)   │  ← 根据映射命中率判断
│  字段定义表? 字典表? 分隔符?  │
└──────────┬───────────────────┘
           │ 只保留字段定义表
           ▼
┌──────────────────────────────┐
│  4. 视图标识提取器 (ViewID)   │  ← 每种格式的策略
│  DOCX: 标题文本               │
│  PDF: 正则 中文名（英文名）    │
│  XLSX: Sheet名 + 第1行标题    │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  5. 统一输出                  │
│  ParsedField / ParsedView /   │
│  ParseResult                  │
└──────────────────────────────┘
```

#### 核心模块

| 模块 | 文件 | 职责 |
|------|------|------|
| 基类 | `base_parser.py` | 定义 ParsedField/ParsedView/ParseResult 数据结构 |
| 映射引擎 | `header_mapper.py` | 配置驱动的表头映射，含歧义解决 |
| 表格分类器 | `table_classifier.py` | 判断表格类型（字段表/字典表/分隔符） |
| DOCX解析器 | `docx_parser.py` | 解析 Word 文档，支持标题+表格结构 |
| PDF解析器 | `pdf_parser.py` | 解析 PDF 文档，支持多种表格格式 |
| XLSX解析器 | `xlsx_parser.py` | 解析 Excel 文档，支持多 Sheet |
| DOC转换器 | `doc_converter.py` | 将 .doc 转换为 .docx 后解析 |
| 工厂类 | `factory.py` | 根据文件扩展名自动选择解析器 |
| 配置文件 | `config/header_mapping.yaml` | 表头映射配置（核心资产） |

#### 配置驱动设计

```yaml
# header_mapping.yaml 示例
fields:
  field_name:
    - "字段名"           # 通用叫法
    - "字段代码"         # 通用叫法
    - "数据字段名"       # 医院端格式
    - "数据元标识符"     # 卫健委标准
    - "程序字段名"       # 医院端格式v3.3
    # 新增格式只需在这里加一行
```

**优势**：新增文档格式只需编辑配置文件，无需修改代码。

#### 验证结果

| 文件 | 格式 | 视图 | 字段 | 状态 |
|------|------|------|------|------|
| 医院端数据格式v3.3.xlsx | .xlsx | 9 | 188 | ✓ |
| 福建省三医一张网.pdf | .pdf | 28 | 430 | ✓ |
| iMedical .doc | .doc | - | - | ✗ (需安装LibreOffice) |
| 单病种上报平台.pdf | .pdf | 20 | 239 | ✓ |
| 智慧病房查询接口.pdf | .pdf | 63 | 394 | ✓ |
| 智慧病房管理系统接口.docx | .docx | 7 | 245 | ✓ |
| 绩效接口HIS系统.xlsx | .xlsx | 12 | 1050 | ✓ |
| 自助机费用查询.pdf | .pdf | 2 | 11 | ✓ |
| 广东省智慧健康.docx | .docx | 47 | 1115 | ✓ |

**8/9 文件成功解析，共 188 个视图，3672 个字段**

### 5.2 取值引擎 (Value Engine)

#### 职责

根据字段名和上下文，推导出 ObjectScript 取值表达式。

#### 设计

```python
# src/value_engine/engine.py

class ValueEngine:
    """取值引擎调度器"""

    def __init__(self, config: dict):
        self.l1 = L1RuleEngine(config.get('l1', {}))
        self.l2 = L2AIInference(config.get('l2', {}))
        self.l3 = L3MCPProber(config.get('l3', {}))
        self.l4 = L4ManualFeedback(config.get('l4', {}))

    def resolve(self, field_name: str, context: dict) -> dict:
        """
        解析字段取值

        返回格式：
        {
            "fieldName": "患者姓名",
            "standardName": "PATIENT_NAME",
            "valueExpression": "$p($g(^PAPER(tPatDR,\"ALL\")),\"^\",1)",
            "global": "^PAPER",
            "confidence": 0.97,
            "source": "L1"
        }
        """
        # L1: 规则库匹配
        result = self.l1.match(field_name, context)
        if result and result['confidence'] >= self.l1.threshold:
            result['source'] = 'L1'
            return result

        # L2: AI 推理（如果启用）
        if self.l2.enabled:
            result = self.l2.infer(field_name, context)
            if result and result['confidence'] >= self.l2.threshold:
                result['source'] = 'L2'
                return result

        # L3: MCP 探测（如果启用）
        if self.l3.enabled:
            result = self.l3.probe(field_name, context)
            if result and result['confidence'] >= self.l3.threshold:
                result['source'] = 'L3'
                # 回流到规则库
                self._feedback_to_rules(result)
                return result

        # L4: 人工补全
        result = self.l4.ask(field_name, context)
        result['source'] = 'L4'
        # 回流到规则库
        if self.l4.autoFeedback:
            self._feedback_to_rules(result)
        return result
```

#### L1 规则匹配算法

```python
# src/value_engine/l1_rule_engine.py

class L1RuleEngine:
    """L1 规则库匹配引擎"""

    def match(self, field_name: str, context: dict) -> dict:
        """
        匹配规则

        匹配策略：
        1. 精确匹配 standardName
        2. 正则匹配 fieldPattern
        3. 关键词匹配 descKeywords
        4. 按置信度排序返回最佳匹配
        """
        candidates = []

        for rule in self.rules:
            score = self._calculate_score(field_name, rule)
            if score > 0:
                candidates.append((score, rule))

        if candidates:
            # 按分数排序
            candidates.sort(key=lambda x: x[0], reverse=True)
            best_score, best_rule = candidates[0]
            best_rule['confidence'] = best_score
            return best_rule

        return None

    def _calculate_score(self, field_name: str, rule: dict) -> float:
        """计算匹配分数"""
        score = 0.0

        # 精确匹配 standardName
        if field_name.upper() == rule.get('standardName', '').upper():
            return 1.0

        # 正则匹配 fieldPattern
        pattern = rule.get('fieldPattern', '')
        if pattern and re.match(pattern, field_name, re.IGNORECASE):
            score += 0.9

        # 关键词匹配 descKeywords
        keywords = rule.get('descKeywords', [])
        for keyword in keywords:
            if keyword in field_name or field_name in keyword:
                score += 0.7
                break

        return score
```

### 5.3 代码生成器 (Generator)

#### 职责

根据取值结果和模板，生成 ObjectScript 接口代码。

#### 设计

```python
# src/generators/code_generator.py

class CodeGenerator:
    """代码生成器"""

    def __init__(self, config: dict):
        self.template_engine = TemplateEngine()
        self.package_prefix = config.get('packagePrefix', 'web.DHCENS.BLL')
        self.default_system = config.get('defaultSystem', '')

    def generate(self, view_data: dict, value_results: list, format: str) -> str:
        """
        生成接口代码

        参数：
            view_data: 视图定义（从解析器获取）
            value_results: 取值结果（从取值引擎获取）
            format: 输出格式（query/json/xml）

        返回：
            ObjectScript 代码字符串
        """
        # 构建模板上下文
        context = self._build_context(view_data, value_results)

        # 选择模板
        template = self._select_template(format)

        # 渲染代码
        code = self.template_engine.render(template, context)

        return code

    def _build_context(self, view_data: dict, value_results: list) -> dict:
        """构建模板上下文"""
        return {
            'className': self._build_class_name(view_data),
            'packagePath': self._build_package_path(view_data),
            'viewCode': view_data.get('viewCode'),
            'viewName': view_data.get('viewName'),
            'fields': value_results,
            'parameters': self._extract_parameters(view_data),
        }
```

### 5.4 代码审查器 (Reviewer)

#### 职责

检查生成的代码是否符合红线规则。

#### 设计

```python
# src/reviewers/linter.py

class Linter:
    """代码审查器"""

    def __init__(self):
        self.p0_rules = self._load_p0_rules()  # 阻断规则
        self.p1_rules = self._load_p1_rules()  # 告警规则

    def review(self, code: str) -> dict:
        """
        审查代码

        返回格式：
        {
            "passed": true/false,
            "errors": [...],    # P0 错误（阻断）
            "warnings": [...],  # P1 警告（告警）
            "score": 95
        }
        """
        errors = []
        warnings = []

        # 检查 P0 红线
        for rule in self.p0_rules:
            violations = rule.check(code)
            errors.extend(violations)

        # 检查 P1 约束
        for rule in self.p1_rules:
            violations = rule.check(code)
            warnings.extend(violations)

        return {
            'passed': len(errors) == 0,
            'errors': errors,
            'warnings': warnings,
            'score': max(0, 100 - len(errors) * 10 - len(warnings) * 2)
        }
```

### 5.5 匹配率提升策略

> **背景**：当前 L1 规则库匹配率约 48-100%（视域而定），核心瓶颈在于 matchKeywords 覆盖不全。本节定义系统性的提升路线。

#### 5.5.1 匹配率瓶颈根因

| 根因 | 说明 | 示例 |
|------|------|------|
| **接口文档命名差异大** | 不同厂商/系统的字段命名风格完全不同 | 规则库有 `PatName`，文档写 `pat_name` / `PATIENT_NAME` / `XM` |
| **包含匹配易误中** | 短关键词子串匹配会命中无关规则 | `"Name"` 会命中 PatientName、DrugName、DeptName 等所有含 Name 的规则 |
| **缺少拼音缩写映射** | HIS 系统大量使用拼音首字母 | `HZXM`(患者姓名)、`CSRQ`(出生日期)、`MZH`(门诊号) |
| **缺少跨域同义词** | 同一概念在不同系统叫法不同 | `VisitID` / `AdmID` / `就诊ID` / `住院号` 都是同一个东西 |
| **规则库覆盖不均** | 部分域规则少，matchKeywords 不够丰富 | 字典类变体多，需要更丰富的关键词 |

#### 5.5.2 三级提升路线

```
┌─────────────────────────────────────────────────────────────┐
│  第一级：扩充 matchKeywords（方案A，投入产出比最高）            │
│  ─────────────────────────────────────────────────────────  │
│  不改引擎代码，只在规则库的「匹配模式」行补充变体关键词        │
│  流程：真实文档 → 跑匹配 → 导出未匹配清单 → 逐条补充         │
│  预期：匹配率 48% → 70-80%                                  │
├─────────────────────────────────────────────────────────────┤
│  第二级：分离描述关键词（方案B）                               │
│  ─────────────────────────────────────────────────────────  │
│  在规则中新增「描述关键词」行，专门匹配中文描述                │
│  代码已支持（markdown_parser.py:317-322）                     │
│  预期：匹配率再提升 5-10%                                    │
├─────────────────────────────────────────────────────────────┤
│  第三级：引擎算法优化（方案C，按需）                           │
│  ─────────────────────────────────────────────────────────  │
│  针对反复出现的误中/漏匹问题，调整匹配算法                    │
│  需有测试用例后再动引擎代码                                   │
└─────────────────────────────────────────────────────────────┘
```

#### 5.5.3 matchKeywords 变体类型

每条规则的「匹配模式」应覆盖以下变体类型：

| 变体类型 | 示例（患者姓名） | 说明 |
|---------|----------------|------|
| 下划线风格 | `Patient_Name` | 文档常用 snake_case |
| 全大写 | `PATIENT_NAME` | 文档常用全大写 |
| 拼音首字母 | `HZXM`、`XM` | HIS 系统特有 |
| 中文别名 | `姓名`、`患者姓名`、`病人姓名` | 文档用中文描述 |
| 缩写 | `PatName`、`PName` | 开发者习惯 |
| 系统特有名 | `PAPMI_Name` | IRIS Global 字段名 |

#### 5.5.4 匹配率提升实战流程

```
Step 1: 准备测试文档
    ├── 收集 1-2 个真实接口文档（PDF/DOCX/Excel）
    └── 文档解析器提取字段清单

Step 2: 跑基线匹配
    ├── 用当前规则库匹配所有字段
    ├── 输出：匹配率统计 + 未匹配字段清单
    └── 记录基线数据

Step 3: 分析未匹配字段
    ├── 逐条分析应归属哪条规则
    ├── 分类：缺关键词 / 缺规则 / 误中其他规则
    └── 按影响面排序（高频字段优先）

Step 4: 补充关键词
    ├── 在规则的「匹配模式」行追加变体
    ├── 对于误中问题：缩短或细化关键词
    └── 对于全新字段：新建规则

Step 5: 验证提升效果
    ├── 重新跑匹配，对比基线
    ├── 确认无回归（已匹配的字段没被破坏）
    └── 更新规则库版本号

Step 6: 沉淀为标准流程
    ├── 每个新文档都走一次 Step 2-5
    └── 匹配率持续提升，使用越多覆盖越广
```

#### 5.5.5 L1 匹配引擎当前算法详解

> 基于 `src/value_engine/l1_rule_engine.py` 实际实现

**匹配策略（优先级从高到低）**：

| 优先级 | 策略 | 分数 | 说明 |
|--------|------|------|------|
| 0 | 别名映射 (field-aliases.json) | 0.95-0.98 | 精确匹配或去下划线匹配 |
| 1 | standardName 精确匹配 | 1.0 | 完全一致 |
| 2 | matchKeywords 精确匹配 | 0.95 | 关键词完全一致 |
| 3 | fieldPattern 正则匹配 | 0.9 | 正则表达式匹配 |
| 4 | matchKeywords 包含匹配 | 0.5-0.9 | 子串包含，按比例计分 |
| 5 | matchKeywords 模糊匹配 | 0.3-0.6 | 编辑距离 ≤ 2 |

**包含匹配计分公式**：
- 关键词在字段名中：`score = 0.65 + (关键词长度/字段名长度) * 0.25`
- 字段名在关键词中：`score = 0.5 + (字段名长度/关键词长度) * 0.3`

**置信度阈值**：≥ 0.8 才返回结果

**CLI 双保险策略**：先用字段代码匹配，代码没中再用中文名回退

#### 5.5.6 待实施优化点

| 优化点 | 当前问题 | 改进方向 | 优先级 |
|-------|---------|---------|--------|
| 包含匹配权重过高 | 短关键词（"Name"）误中 | 加最短关键词长度限制，或要求匹配占比≥50% | 中 |
| 多字段命中无消歧 | "Name" 命中10条规则 | 加域上下文权重，同域规则加分 | 低 |
| 缺少组合匹配 | `Patient_Name` 拆开匹配 | 支持分词后组合匹配 | 低 |
| 拼音未处理 | `HZXM` 完全匹配不到 | 通过 matchKeywords 覆盖（不改引擎） | 高 |

### 5.6 接口修改与测试子Agent ★新增

> **文档位置**：`tests/interface-test-agent.md` + `tests/workflow.md`

#### 职责

支持已有接口的验证（Mode A）和修改（Mode B），通过 MCP 工具与 IRIS 服务器交互。

#### 双模式设计

| 模式 | 用途 | 触发条件 | 核心流程 |
|:----:|------|---------|---------|
| **Mode A** | 验证自动生成的接口 | "测试这个接口" / "编译检查 xxx.cls" | 上传 → 编译 → 修复(≤5次) → 功能测试 |
| **Mode B** | 修改已有接口 | "修改 xxx 接口" / "修复 bug" | 定位 → 导出 → 修改 → 编译 → 测试 → 更新索引 |

#### Mode B 三级定位策略

```
L1: Grep 索引文件（最快）
  → Grep references/interface-index/all-interfaces.md
  → 支持：接口编码(W000xxx)、方法名、类名片段、业务描述
  → 命中 → 获取类名+方法清单，跳转导出

L2: MCP 发现（索引未命中时）
  → iris_symbols / iris_search / docs_introspect
  → 命中 → 跳转导出

L3: 询问用户（MCP 也未找到时）
  → "请提供需要修改的类名或方法名"
```

#### 关键约束

| 约束 | 说明 |
|------|------|
| 最大修改循环 | ≤5次，超过则停止并输出诊断，提示人工介入 |
| 修复后重新上传 | 每次修复后必须 iris_doc(put) 重新上传 |
| 修复前备份 | 同目录 `.bak` 或 `.YYYYMMDD_bak` |
| Mode A 范围 | 只修编译错误，不改业务逻辑 |
| Mode B 范围 | 复杂修改方案先与用户确认；修改后必须更新接口索引 |

#### 测试数据获取策略

详见 `tests/test-data-discovery.md`：
1. **空参优先**：能跑先跑空参
2. **真实数据**：跑不通再用 iris_query 查生产库获取真实值
3. **入参识别**：日期类查最近7天、编码类查字典表、ID类查主表

### 5.7 接口索引系统 ★新增

> **文档位置**：`references/interface-index/`

#### 职责

为 Mode B 子Agent 提供接口定位能力，实现从业务描述到代码类的快速映射。

#### 数据来源

从生产环境的「接口注册对照信息」导出，覆盖 238 个类、644 个方法。

#### 文件结构

```
references/interface-index/
├── all-interfaces.md   ← 全量索引（核心文件，按类名排序）
├── INDEX.md            ← 快速查找指南（按业务功能/编码前缀）
├── README.md           ← 使用说明
├── _template.md        ← 条目模板
└── custom.md           ← 自定义接口
```

#### 索引格式

```markdown
## {类名}

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000386` | `GetPatInfo` | 血透-获取患者基本信息 | Y |
```

#### 查找方式

| 用户输入 | Grep 搜索模式 |
|---------|--------------|
| 接口编码 "W00000386" | `Grep "W00000386" all-interfaces.md` |
| 方法名 "GetPatInfo" | `Grep "GetPatInfo" all-interfaces.md` |
| 业务描述 "血透患者" | `Grep "血透" all-interfaces.md` |

#### 索引维护

- **全量重建**：`python scripts/generate_interface_index.py`（从Excel重新生成）
- **增量更新**：Mode B 修改接口后自动更新 all-interfaces.md

### 5.8 代码风格规范体系 ★新增

> **文档位置**：`references/objectscript-code-style.md` + `references/objectscript-coding-standards.md`

#### 职责

定义 ObjectScript 代码生成和审查的强制规范，由代码生成器内置执行，代码审查器自动检查。

#### P0 红线规则（12条）

| # | 红线 | 说明 |
|---|------|------|
| 1 | 禁止删减/捏造接口文档字段 | 文档要求多少字段，代码就输出多少字段 |
| 2 | 输出格式遵循文档 | 文档要求什么格式就生成什么格式 |
| 3 | ObjectScript语法规范 | 标识符禁下划线、操作符无空格、花括号命令全写、函数缩写 |
| 4 | 参数必须用 As 关键字 | `pWardNo As %String` ✅ / `pWardNo:%String` ❌ |
| 5 | 事务安全 + 错误陷阱 | ts/tc/tro 成对；err标签第一行必须 `s $zt=""` |
| 6 | 外部类属性双引号 | `node."DEPT_CODE"` ✅ / `node.DEPT_CODE` ❌ |
| 7 | 内存管理 | 临时 Global 用完 Kill；HTTP 设 Timeout |
| 8 | 必须查规则库 | 每个字段生成前必须先查规则库 |
| 9 | 变量先定义后使用 | `$lg(data,N)` 必须先有 `data=$g(^...D(rowId))` |
| 10 | 字段必须有中文注释 | 每个 `d dataObj.%Set("KEY", val)` 行尾必须有注释 |
| 11 | ^TMP只是中转 | 数据源头必须是业务表，不能把 ^TMP 当数据源头 |
| 12 | 日期范围查询必须带院区ID | 入参含起止日期时必须增加院区ID参数 |

#### 代码风格要点

| 要点 | 规范 |
|------|------|
| 取值赋值分离 | `$p($g(^XXX)),"^",1)` 先赋值给变量，再 Set 到 JSON/XML |
| for循环用花括号 | `for { ... }` 推荐写法 |
| 花括号内命令全写 | `Set/Quit/If/For/Do/Kill`（生成器自动保证） |
| 操作符禁止空格 | 赋值/比较/条件两边不能有空格 |
| 函数缩写 | 用 `$p/$g/$lg/$o/$d/$zd/$zt` 等 |
| 变量初始化简洁写法 | 2个用 `s var1="",var2=""`；3-5个用 `s (var1,var2,...)=""` |

#### 生成后检查清单（17项）

代码输出前必须逐条执行，逐条打勾确认：
1. 文档字段数 vs 代码字段数一致
2. 每个字段名与文档完全一致
3. 不知道取值的字段置空而非删减
4. ROWSPEC 与文档字段一一对应
5. 每个字段已查规则库
6. 所有变量在使用前定义
7. 每个字段取值行有中文注释
8. `$lg()` 表达式已生成 ENS Global 遍历代码
9. ^TMP 是否自己从业务表写入
10. 外部类属性含下划线是否双引号包裹
11. XML接口是否使用 PHA.COM.XML
12. 实体类 Global 是否已查 Storage 定义
13. 操作符无空格
14. 多表关联是否查阅 his-data-flow.md
15. 退费/发药/结算是否遵循业务规则
16. 日期范围查询是否带了院区ID入参
17. 花括号内命令全写+函数缩写

---

## 6. 配置系统设计

### 6.1 全局配置 (config/default.json)

```json
{
  "project": {
    "packagePrefix": "web.DHCENS.BLL",
    "author": "CodeBuddy",
    "namespace": "DHC-APP",
    "outputEncoding": "utf-8-bom"
  },
  "valueEngine": {
    "l1": {
      "enabled": true,
      "confidenceThreshold": 0.8
    },
    "l2": {
      "enabled": true,
      "mcp模式": {
        "enabled": true,
        "mcpConfig": ".mcp.json"
      },
      "示例模式": {
        "enabled": true,
        "examplesDir": "examples",
        "sourcesDir": "sources",
        "提示用户": true
      }
    },
    "l3": {
      "enabled": true,
      "confidenceThreshold": 0.6
    },
    "l4": {
      "enabled": true,
      "autoFeedback": true,
      "sopReference": "references/rule-library-sop.md"
    }
  },
  "pipeline": {
    "enhanced": {
      "review": true,
      "test": false,
      "package": false
    }
  }
}
```

### 6.2 项目配置 (_project.yaml)

```yaml
project:
  name: "项目名称"
  id: "project-id"
  description: "项目描述"

inherit:
  source: "local"
  localPath: "../../rules"
  # 或 Git 来源
  # source: "git"
  # url: "https://github.com/xxx/rules.git"
  # version: "v1.1.0"

rules:
  customEnabled: true
  overridesEnabled: true
  lookupOrder:
    - "overrides"
    - "custom"
    - "domains"
    - "common"

package:
  prefix: "web.DHCENS.BLL"
  system: "SystemName"
  subPath: ""

output:
  dir: "output/"
  formats: ["query", "json", "xml"]
  defaultFormat: "all"
```

---

## 7. 规则库设计

### 7.1 规则文件格式

采用 **Markdown + YAML Frontmatter** 格式：

```markdown
---
domain: "10-patient"
name: "患者主索引域"
version: "2.1.0"
totalRules: 55
---

# 患者主索引域

## 字段映射规则

### PATIENT_NAME

| 属性 | 值 |
|------|-----|
| 标准名 | `PATIENT_NAME` |
| 匹配模式 | 患者姓名, PatientName, HZXM |
| 取值表达式 | `$p($g(^PAPER(tPatDR,"ALL")),"^",1)` |
| Global | `^PAPER` |
| 置信度 | 0.97 |

**说明**：^PAPER 的 ALL 节点 ^1 位存姓名。

```objectscript
s PATIENT_NAME = $p($g(^PAPER(tPatDR,"ALL")),"^",1)
```
```

### 7.2 规则优先级

```
1. 项目 overrides/     （覆盖通用规则，优先级最高）
2. 项目 custom/        （项目特有规则）
3. 通用规则库 domains/ （业务域规则）
4. 通用规则库 common/  （通用规则，兜底）
```

### 7.3 自学习回流机制

```
L3 探测成功 或 L4 人工确认
        │
        ▼
    写入 custom/zz-custom.md
        │
        ▼
    下次 L1 直接命中
        │
        ▼
    使用越多、覆盖越广
```

---

## 8. 多项目复用方案

> **状态：暂不实现** — 当前只有松岗单病种一个项目，过早抽象会增加不必要的复杂度。待有第二个项目需要接入时，再根据实际需求设计多项目架构。

### 8.1 架构设计（预留）

```
his-interface-agent/rules/              # 共享规则库（Git 管理）
    ├── domains/                  # 通用业务域规则
    └── common/                   # 通用基础规则

projects/songgang-dbz/rules/      # 项目级规则
    ├── custom/                   # 项目特有规则
    └── overrides/                # 覆盖通用规则

projects/smart-medical/rules/     # 另一个项目
    ├── custom/
    └── overrides/
```

### 8.2 规则加载流程

```python
def load_domain_rules(domain_id: str, project_config: dict) -> dict:
    """加载域规则，合并项目级和通用规则"""

    rules = {}

    # 1. 加载通用规则库（基础）
    global_rules = load_global_domain(domain_id)
    rules.update(global_rules)

    # 2. 加载项目特有规则
    if project_config.get('customEnabled'):
        custom_rules = load_project_custom(domain_id, project_config)
        rules.update(custom_rules)

    # 3. 加载项目覆盖规则（覆盖通用）
    if project_config.get('overridesEnabled'):
        override_rules = load_project_overrides(domain_id, project_config)
        rules.update(override_rules)

    return rules
```

---

## 9. 版本管理方案

### 9.1 版本号规则

采用语义化版本：`主版本.次版本.修订号`

| 类型 | 说明 | 示例 |
|------|------|------|
| 主版本 | 规则结构重大变更 | v2.0.0 |
| 次版本 | 新增域或大量规则 | v1.2.0 |
| 修订号 | Bug 修复或少量更新 | v1.1.1 |

### 9.2 版本文件

```json
// rules/_version.json
{
  "version": "1.1.0",
  "lastUpdated": "2026-05-10",
  "changelog": [
    {
      "version": "1.1.0",
      "date": "2026-05-10",
      "changes": ["转换为 Markdown 格式", "新增 8 个域"]
    }
  ]
}
```

### 9.3 Git 管理

```bash
# 初始化
cd his-interface-agent/rules
git init
git remote add origin https://github.com/xxx/rules.git

# 版本标签
git tag -a v1.1.0 -m "Convert to Markdown"
git push origin main --tags

# 项目引用特定版本
# _project.yaml:
# inherit:
#   version: "v1.1.0"
```

---

## 10. 实施计划

### 10.1 分阶段实施

| 阶段 | 目标 | 交付物 | 状态 |
|------|------|--------|------|
| **MVP** | 能用 | DOCX解析 + L1规则匹配 + 代码生成(Query/JSON/XML) + CLI + 代码审查 | ✅ 已完成 |
| **V1.0** | 好用 | + 通用文档解析器 + 匹配率提升 + 骨架域补全 + L4人工回流 | 🔧 进行中 |
| **V2.0** | 强用 | + L2 AI 推理 + L3 MCP 探测 | 待启动 |
| **V3.0** | 智用 | + 批量生成 + Web 界面 | 待启动 |

### 10.2 当前待办（V1.0 阶段）

- [x] 规则库 17/17 域全覆盖（v2.5.0, ~777条）
- [x] L1 规则引擎（精确/正则/包含/模糊/别名 5级匹配）
- [x] 代码生成器（Query/JSON/XML 三种格式）
- [x] 代码审查器（P0红线12条 + P1约束）
- [x] CLI 入口（parse/rule/generate/review 四个子命令）
- [x] **通用文档解析器** — 支持 DOCX/PDF/XLSX/DOC 四种格式
- [x] **表头映射配置** — 覆盖所有已知文档格式
- [x] **接口索引系统** — 238类/644方法，支持三级定位
- [x] **接口测试子Agent** — Mode A验证 + Mode B修改
- [x] **代码风格规范体系** — P0红线12条 + 17项检查清单
- [x] **参考资料库** — references/ 目录（编码规范/数据流转/MOC索引）
- [x] **MCP集成** — IRIS编译/查询/实体类查找
- [ ] **匹配率提升** — 扩充 matchKeywords（需真实文档驱动）
- [ ] **测试用例** — 当前完全空白
- [ ] **Git 初始化** — 未配置版本管理

### 10.3 依赖项

| 依赖 | 说明 | 状态 |
|------|------|------|
| Python 3.8+ | 开发语言 | ✅ 已安装 |
| pdfplumber | PDF 解析库 | ✅ 已安装 |
| python-docx | DOCX 解析库 | ✅ 已安装 |
| openpyxl | Excel 解析库 | ✅ 已安装 |
| PyYAML | YAML 解析库 | ✅ 已安装 |
| mammoth | DOC 转换库（可选） | ✅ 已安装 |

---

## 11. 附录

### 11.1 规则库统计（v2.5.0）

| 域ID | 名称 | 规则数 | 版本 | 状态 |
|------|------|--------|------|------|
| 00-dictionary | 字典类 | 36 | v2.5.0 | ✅ SOP标准版 |
| 01-user | 用户/员工 | 39 | v2.5.0 | ✅ 完整版 |
| 10-patient | 患者主索引 | 55 | v2.5.0 | ✅ 完整版 |
| 20-visit | 就诊/入院 | 56 | v2.5.0 | ✅ 完整版 |
| 30-diagnosis | 诊断 | 24+ | v2.5.0 | ✅ 最高成熟度 |
| 40-order | 医嘱 | 75 | v2.5.0 | ✅ 完整版 |
| 50-lab-exam | 检验检查 | 95 | v2.5.0 | ✅ SOP完整版(IRIS验证) |
| 55-exam-report | 影像报告 | 67 | v2.5.0 | ✅ SOP完整版 |
| 60-surgery | 手术 | 58 | v2.5.0 | ✅ 完整版 |
| 70-nursing | 护理 | 50 | v2.5.0 | ✅ SOP版 |
| 80-vital-sign | 体征/生命体征 | 50 | v2.5.0 | ✅ SOP版 |
| 90-medical-record | 病案首页 | 44 | v2.5.0 | ✅ 完整版 |
| a0-fee-settlement | 费用结算 | 70+ | v2.5.0 | ✅ SOP标准版 |
| b0-inventory | 库存/物资 | 40 | v2.5.0 | ✅ SOP版 |
| d0-pharmacy | 药品/药房 | 161 | v2.5.0 | ✅ SOP完整版 |
| z0-common | 跨域通用 | 7 | v2.5.0 | ✅ SOP版 |
| zz-custom | 自定义 | 19 | v2.5.0 | ✅ SOP增强版 |
| **合计** | | **~777** | **v2.5.0** | **17/17 全域SOP标准版** |

### 11.2 关键设计决策记录

| 决策项 | 选项 | 最终决策 | 理由 |
|--------|------|---------|------|
| 开发语言 | Python / Node.js | Python | Excel/在线文档支持更好 |
| 规则库格式 | JSON / Markdown | Markdown + YAML Frontmatter | 人类友好，Git diff 友好 |
| 取值引擎 | 单层 / 多层 | 四级（L1-L4）降级策略 | 离线可用（L1），在线更准（L2/L3） |
| 多项目复用 | 独立 / 共享 | 共享 + 项目覆盖 | 减少重复，允许个性化 |
| 版本管理 | 无 / Git | Git + 语义化版本 | 可追溯，可回滚 |
| 匹配策略 | 精确 / 模糊 | 5级匹配（精确→别名→正则→包含→模糊） | 兼顾精度和召回率 |
| 匹配率提升 | 改引擎 / 扩关键词 | 优先扩关键词，引擎按需微调 | 投入产出比最高，零代码改动 |
| 接口索引 | 分散文件 / 单文件 | 单文件 all-interfaces.md | 查找简单，Grep一次命中 |
| 子Agent模式 | 内嵌 / 独立Spawn | 独立Spawn子Agent | 隔离上下文，主Agent不被污染 |
| 接口定位 | 用户指定 / 自动发现 | 三级策略（索引→MCP→询问） | 多数情况自动定位，减少用户输入 |

### 11.3 参考资料

- 原 SKILL.md：`F:\AIAUTO\his-interface-generator-v4.21\SKILL.md`
- 示例代码：`{PROJECT_DIR}\examples\`
- 规则库：`{PROJECT_DIR}\rules\`
- 编码规范：`{PROJECT_DIR}\references\objectscript-coding-standards.md`
- 代码风格：`{PROJECT_DIR}\references\objectscript-code-style.md`
- 数据流转：`{PROJECT_DIR}\references\his-data-flow.md`
- MOC索引：`{PROJECT_DIR}\references\his-table-moc.md`
- 接口索引：`{PROJECT_DIR}\references\interface-index\all-interfaces.md`
- 子Agent：`{PROJECT_DIR}\tests\interface-test-agent.md`

---

**文档结束**

请评估此设计蓝图，确认后我们开始实施。
