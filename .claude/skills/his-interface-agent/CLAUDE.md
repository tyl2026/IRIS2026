# HIS 接口自动开发 Agent

基于接口文档自动生成 InterSystems IRIS ObjectScript 接口程序。

## 项目概述

|- **目标语言**：InterSystems IRIS ObjectScript
|- **开发语言**：Python（Agent 本体）
|- **核心流程**：解析接口文档 → 规则库匹配 → 生成代码 → 编译验证
|- **四级取值引擎**：L1规则库 → L2深度学习(MCP/示例) → L3 AI推理 → L4人工兜底回流

---

## 四级取值引擎

|| 级别 | 名称 | 定位 | 说明 |
||------|------|------|------|
|| L1 | 规则库匹配 | 核心 | 零延迟，最可靠，始终启用 |
|| L2 | 深度学习 | 补充 | 有MCP查IRIS / 无MCP参考examples |
|| L3 | AI推理 | 补充 | LLM能力范围内语义推断，非兜底 |
|| L4 | 人工兜底+回流 | 兜底 | 用户指导→Agent按SOP整理→回流规则库 |

**越用越强机制**：L4人工兜底的每次经验都会回流到规则库，下次L1直接命中。

查找优先级: domains/{domain}.md > common/ > custom/

### ⚠️ 代码生成强制流程（禁止跳过）

```
第一步：识别业务域 → 读取 rules/domains/ 对应规则库文件
第二步：使用规则库中的取值表达式
        规则库未命中 → 自动执行L2深度学习（MCP查询/示例扫描）
        L2也未命中 → 标记TODO，不得凭空编造
第三步：★ 检查是否需要数据流转逻辑（触发条件见下方）
第四步：生成代码 → 执行 P0 检查清单

⛔ 禁止：不查规则库就直接生成代码
⛔ 禁止：凭空编造没有来源依据的 Global 索引
```

### ⚠️ 数据流转参考触发条件

**当接口满足以下任一条件时，必须查阅 `references/his-data-flow.md`：**

| 触发条件 | 查阅内容 |
|---------|---------|
| 涉及 **2 个以上表**的关联取值 | DR 指针速查表 |
| 涉及 **退费/退药/退押金** | 业务规则 + 状态机 |
| 涉及 **发药/配药/打包** | 药房数据流图 |
| 涉及 **账单/计费/结算** | 计费数据流图 + 账单状态机 |
| 涉及 **医保结算/分解** | 医保链路 |
| 涉及 **就诊卡/预交金/账户** | 卡账户链路 |
| 涉及 **挂号/预约/排班/分诊** | 挂号预约链路 |
| 涉及 **库存/入库/退货/调价** | 库存变动流程 |
| 用户提及 **业务流程/数据流向/表间关系** | 对应业务数据流图 |

### L2 深度学习自动执行准则

> **当字段L1未命中时，自动执行以下流程，无需用户提示**

```
L1未命中
  ↓
★ 第0步：查阅 MOC 索引
  grep 关键字 references/his-table-moc.md → 定位实体表名+类名+Global+所属规则域
  （MOC 覆盖 205 个 HIS 业务表，按业务场景/表前缀/Global 前缀均可检索）
  ↓
自动检测MCP工具可用性（iris_search / docs_introspect / iris_doc）
  ↓
┌─ 有MCP连接 ──────────────────────────────────────────────┐
│  1. SQL表名→实体类名：去下划线+首字母大写                   │
│     DHC_OEDispensing → User.DHCOEDispensing.cls           │
│     （详见 references/mcp-entity-lookup.md）               │
│  2. iris_doc(get, "User.DHCXxx.cls") 读取源码              │
│     提取 Global + Piece 位置 + 索引定义                    │
│  3. 若 MOC 无匹配 → iris_search(query=字段名或关键词)     │
│  4. ★ 查阅 his-data-flow.md 确认 DR 指针链路和业务规则    │
│  5. ★ 将新发现的 Global 名/类名回填到 his-table-moc.md    │
└──────────────────────────────────────────────────────────┘
  ↓ 无MCP连接或MCP查询无结果
┌─ 扫描本地资源 ────────────────────────────────────────────┐
│  1. 扫描 examples/*.cls — 搜索相似接口的取值逻辑           │
│  2. 扫描 sources/ — 搜索相关代码库                        │
│  3. 提取可复用的取值表达式                                 │
└──────────────────────────────────────────────────────────┘
  ↓ 都没有找到
┌─ 提示用户 ────────────────────────────────────────────────┐
│  提示: "建议在 examples/ 目录下放入[业务域]相关的接口代码， │
│         可以提升取值质量。是否需要我继续用L3 AI推理尝试？"  │
└──────────────────────────────────────────────────────────┘
```

### MCP 连接配置

|- 服务名：`iris-dev-official`
|- 关键工具：`iris_doc(get)` 读取cls | `docs_introspect()` 反射 | `iris_execute()` 执行

---

## 🔴 P0 红线规则（违反即阻断）

> **任何代码生成任务都必须严格遵守以下规则。违反任何一条 = 必须修复后才能输出代码。**

| # | 红线 | 说明 |
|---|------|------|
| **1** | **禁止删减/捏造接口文档字段** | 文档要求多少字段，代码就输出多少字段。不知道取值的置空 `s xxx=""`，**绝不擅自删减或编造不存在的字段名** |
| **2** | **输出格式遵循文档** | 文档要求什么格式（XML/JSON/Query）就生成什么格式，不能擅自改 |
| **3** | **ObjectScript语法规范** | (1)标识符禁下划线，类名大驼峰、方法名小驼峰、变量名小驼峰；(2)操作符/赋值/比较/命令条件两边禁止空格；(3)花括号语法 `If{}/Else{}` 关键字必须全写（不能 `i{}/e{}`），行内缩写允许（`s/q/i/f/d/k` 等）；(4)函数缩写($p/$g/$lg/$o/$d/$zd/$zt等)，ROWSPEC可用下划线(%Query规范豁免) |
| **4** | **参数必须用 As 关键字** | `pWardNo As %String` ✅ / `pWardNo:%String` ❌ |
| **5** | **事务安全 + 错误陷阱** | ts/tc/tro 成对；锁超时 :3；err 标签第一行必须 `s $zt=""` 防死循环 |
| **6** | **外部类属性双引号** | `node."DEPT_CODE"` ✅ / `node.DEPT_CODE` ❌ |
| **7** | **内存管理** | 临时 Global 用完 Kill；HTTP 设 Timeout |
| **8** | **必须查规则库** | 每个字段生成前必须先查 `rules/domains/*.md` + `rules/common/*-aliases.json`，L1 命中则用规则表达式，未命中标记 `TODO` 并列出未命中字段清单 |
| **9** | **变量先定义后使用** | $lg(data,N) 必须先有 `data=$g(^...D(rowId))` 遍历代码；$g(^PAADM(adm)) 中 adm 必须先定义为 admRowId |
| **10** | **字段必须有中文注释** | 每个 `d dataObj.%Set("KEY", val)` 行尾必须有 `; 中文说明` |
| **11** | **^TMP只是中转，数据源头必须是业务表** | `^TMP` 允许作为中间暂存，但**必须自己从业务表（`^INCI`/`^ARCIM`/`^CTLOC`等）提取数据写入**，不能把 `^TMP` 当数据源头用。遇外部方法填充的 `^TMP` 必须先追问：每个字段从哪个业务 Global 来？ |
| **12** | **日期范围查询必须带院区ID参数** | 入参含起止日期时必须增加院区ID：**Query** → `pHospitalId As %String=""`；**JSON** → 入参JSON中加 `hospitalId` 节点；**XML** → 入参XML中加 `<HospitalId>` 节点。默认空（兼容单院区），有传入时按 `Hospital_DR` 过滤。多院区共库不区分院区会导致数据混乱 |

### 🔴 代码生成后检查清单

```
□ 1. 文档字段数 vs 代码字段数 — 数量一致吗？
□ 2. 每个字段名 — 是否与文档完全一致？有无捏造？
□ 3. 不知道取值的字段 — 是否置空而非删减？
□ 4. ROWSPEC — 是否与文档字段一一对应？
□ 5. 每个字段是否已查规则库？ — 未命中的字段是否已列出清单？
□ 6. 所有变量是否在使用前定义？ — data/ adm/ ordId/ ordItm 等
□ 7. 每个字段取值行是否有中文注释？
□ 8. 如有 $lg() 表达式，是否已生成 ENS Global 遍历代码？
□ 9. 字典/列表类 — 如有 ^TMP，是否自己从业务表写入的？每个字段能追溯到业务表位置吗？
□ 10. 外部类属性含下划线 — 是否双引号包裹？ (P0#6)
□ 11. XML接口 — 是否使用 PHA.COM.XML 而非手工拼接字符串？
□ 12. 实体类 — 涉及的 Global 是否已查实体类 Storage 定义？字段位置是否精确？
□ 13. 操作符空格 — 赋值/比较/命令条件/参数调用两边是否无空格？
□ 14. 多表关联 — 涉及2个以上表时，是否查阅了 his-data-flow.md 的 DR 指针链路？
□ 15. 业务逻辑 — 涉及退费/退药/发药/结算时，是否遵循了 his-data-flow.md 的业务规则？
□ 16. 院区过滤 — 日期范围查询是否带了院区ID入参(Query:pHospitalId/JSON:hospitalId/XML:HospitalId)？有传入时是否按 Hospital_DR 过滤？
□ 17. 命令全写+函数缩写 — 花括号内是否全写(Set/Quit/If)？函数是否缩写($p/$g/$lg等)？操作符是否无空格？
□ 18. 遍历路径验证 — 是否使用了最优索引？(1)ENS平台表(^Busi.ENS)有独立日期索引，应直接使用而非通过^PAADMi间接查找；(2)遍历模板中的变量是否都有定义？不能混用其他业务域的变量（如医嘱域的ordId/ordItm）
```

> ⚠️ **代码输出前必须逐条执行以上检查清单，逐条打勾确认，禁止跳过。**

---

## 🧪 接口测试修改子 Agent

> 独立功能模块，支持验证和修改接口代码

| 模式 | 用途 | 典型场景 |
|:----:|------|---------|
| **A** | 验证自动生成的接口 | "测试这个接口" / "编译检查 xxx.cls" |
| **B** | 修改已有接口 | "修改 xxx 接口" / "给 xxx 添加方法" / "修复 bug" |

**详细说明**：`tests/interface-test-agent.md`（含 Spawn 指令模板、流程图、约束、报告格式）

---

## 核心命名约定

|| 项目 | 约定 | 示例 |
||------|------|------|
|| 类名 | 大驼峰 PascalCase | PatientInfo |
|| 方法名 | **小驼峰 lowerCamelCase** | getPatientList() |
|| 属性名 | 大驼峰 PascalCase | HospName |
|| 参数名 | `p` 前缀 + 小驼峰 | pWardNo, pStDate |
|| 变量名 | **小驼峰(禁止下划线)** | tPatDR, admRowId |
|| ROWSPEC | 可用下划线(%Query规范豁免) | ROW_ID, PATIENT_NAME |
|| 备份命名 | `.YYYYMMDD_bak` | EmVisitInfo.cls.20260511_bak |

## 代码风格规范

**核心原则**（详细说明见 `references/objectscript-code-style.md`）：
- **取值赋值分离**：函数调用（$p/$lg等）必须先赋值给变量，再Set到JSON/XML
- **for循环用花括号**：推荐 `{}` 写法，生成器自动输出花括号
- **花括号内命令全写**：Set/Quit/If/For/Do/Kill（生成器自动保证）
- **操作符禁止空格**：赋值/比较/条件两边不能有空格（生成器自动修复）
- **函数缩写**：用 $p/$g/$lg/$o/$d/$zd/$zt 等
- **取值格式区分**：$p()用于`^`分隔串，$lg()用于$lb打包的List结构（CacheStorage实体类）
- **变量初始化简洁写法**：2个变量用 `s var1="",var2=""`；3-5个用 `s (var1,var2,...)=""`

---

## 编码原则（代码生成器已内置执行）

1. **公共方法抽离**：使用频率高+功能复杂 → 抽离；简单操作 → 内联
2. **公共参数抽离**：个性化配置参数 → 定义为类Parameter，修改一处全局生效

详细说明见 `references/coding-principles.md`

---

## 包路径命名规范

```
web.DHCENS.BLL.{系统名}.{OP|IP|Common}.{类名}
示例: web.DHCENS.BLL.SmartWard.IP.PatientInfo
文件: SmartWard_IP_PatientInfo.cls
```

## 输出目录

|- 生成代码统一输出到 `output/` 目录
|- 文件命名：`{视图代码}_{格式}.cls`（如 `V_NIS_PatientBasicInfo_query.cls`）
|- 包路径 `web.DHCENS.BLL.xxx` 是 ObjectScript 类逻辑路径，**不是**文件系统路径，不要按包路径创建目录结构

## 强制操作规范

|| 操作 | 规范 |
||------|------|
|| 修改前必须备份 | 同目录 `.bak` 文件 |
|| 删除前列清单 | 列出待删文件→等确认→再删 |
|| 描述优于数字ID | 字典匹配用文字 $case 映射 |
|| 成对原则 | *_CODE + *_NAME 一起出现 |

## 参考资料（按需读取）

|| 文件 | 用途 |
||------|------|
|| `references/interfaces/query-standard.md` | Query标准写法模板 |
|| `references/interfaces/json-standard.md` | JSON标准写法模板 |
|| `references/interfaces/xml-standard.md` | XML标准写法模板 |
|| `references/objectscript-coding-standards.md` | ObjectScript编码规范 |
|| `references/objectscript-code-style.md` | 代码风格详细规范(取值分离/花括号/缩写等) |
|| `references/variable-definition-spec.md` | 变量定义规范(先定义后使用/命名规范/作用域等) |
|| `references/coding-principles.md` | 编码原则详细说明(公共方法/参数抽离) |
|| `tests/interface-test-agent.md` | 接口测试修改子Agent(触发条件/Spawn指令/流程) |
|| `references/iris-naming-conventions.md` | IRIS命名约定(Global前缀/类包前缀) |
|| `references/mcp-entity-lookup.md` | MCP实体类查找规范(表名→类名转换/iris_doc用法/Piece提取) |
|| `rules/domains/*.md` | 各业务域取值规则(核心资产) |
|| `examples/*.cls` | 优秀示例代码，生成时参考学习 |
|| `docs/input/` | 待生成代码的接口文档存放处 |
|| `output/` | 生成代码的输出目录 |
|| `references/rule-library-sop.md` | 规则库整理SOP |
|| `references/rule-library-progress.md` | 规则库最新进度 |
|| `references/his-table-moc.md` | HIS业务表MOC索引(205表→类名→Global→规则域，按业务/关键字检索) |
|| `references/his-data-flow.md` | HIS数据流转参考(DR指针链路/状态机/业务规则/多表遍历模板) |
|| `references/his-pitfalls.md` | 踩坑经验积累 |
|| `tests/workflow.md` | 接口测试验证工作流（子 Agent） |
|| `tests/test-data-discovery.md` | 测试数据发现策略 |
|| `references/interface-index/all-interfaces.md` | 本地静态接口索引(无MCP时兜底,MCP可用时优先查Ens_InterfaceMethod表) |
|| `references/interface-index/INDEX.md` | 快速查找指南(按业务功能/编码前缀) |
|| `references/interface-index/README.md` | 接口索引使用说明(四级发现策略: MCP查表→本地索引→MCP扩大→用户交互) |
|| `src/parsers/config/header_mapping.yaml` | 表头映射配置（新增文档格式时编辑此文件） |

**规则库**: 17/17域完成, v2.5.0, ~777+条规则, 全域SOP标准版。
**文档解析器**: 支持 DOCX/PDF/XLSX/DOC 四种格式，配置驱动，8/9文件验证通过。

## 待办事项

### 已完成 ✅

- [x] 17/17 业务域全部完成 (v2.5.0, ~777条规则)
- [x] 90-medical-record 完整版升级 (v2.0.0)
- [x] 四级取值引擎架构设计 (L1规则库→L2深度学习→L3 AI推理→L4人工兜底回流)
- [x] 配置系统 (config/default.json)
- [x] 验收脚本 (scripts/verify.py)
- [x] CLAUDE.md优化 (含L2自动执行准则)
- [x] 施工蓝图更新 (DESIGN_BLUEPRINT.md)
- [x] 通用文档解析器 (支持DOCX/PDF/XLSX/DOC四种格式)
- [x] 表头映射配置 (header_mapping.yaml，覆盖所有已知文档格式)
- [x] IRIS编译上传验证 (通过MCP执行)

### 可选扩展

- [ ] Git初始化 (规则库版本管理)
- [ ] 测试体系建设 (专业单元测试，当前验收脚本够用)
- [ ] 视图命名配置 (naming_config.yaml，映射原始标识到标准包路径)
