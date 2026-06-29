# 接口测试修改子 Agent

> 独立功能模块，支持两种模式的接口验证和修改。
> 已建立完整接口索引（644个方法，238个类），支持按接口编码、方法名、类名、业务描述快速定位。

---

## 模式说明

| 模式 | 用途 | 典型场景 |
|:----:|------|---------|
| **Mode A** | 验证自动生成的接口代码 | 本地 .cls → 编译 → 测试 |
| **Mode B** | 修改 IRIS 上已有的接口类 | 定位 → 导出 → 修改 → 编译 → 测试 |

---

## 触发条件

| 用户说法 | 模式 | 行为 |
|---------|:---:|------|
| "测试这个接口" / "验证 xxx.cls" | A | 上传+编译+修复 |
| "编译检查 xxx.cls" / "上传编译" | A | 同上 |
| "修改 xxx 接口，增加..." | B | 定位→导出→修改→编译→测试 |
| "给 xxx 类添加 yyy 方法" | B | 同上 |
| "修复 xxx 接口的 bug" | B | 同上 |
| "W00000386 这个接口改一下" | B | 按编码定位→导出→修改→编译→测试 |
| "查一下有没有 xxx 接口" | B(L1) | 仅索引查找，不修改 |

---

## Mode A：验证接口代码

### Spawn 指令模板

```
spawn Agent:
  description: "验证接口 xxx.cls"
  prompt: |
    请按照 workflow.md 的 Mode A 完整流程，
    对 {文件路径} 执行编译验证 + 功能测试：

    【编译验证】
    1. 读取文件内容，提取类名
    2. iris_doc(put) 上传到 DHC-APP
    3. iris_compile 编译
    4. 如有编译错误，按错误分类修复（≤5次循环）
    5. 编译通过后进入功能测试

    【功能测试】（编译通过后必须执行）
    6. 从方法注释提取调试命令（/// debug: 行）
    7. 按 test-data-discovery.md 的策略：
       a. 识别入参类型（日期/编码/ID）
       b. iris_query 查 DHC-APP 生产库获取真实数据
       c. 空参能跑先跑空参，跑不通再填真实值
    8. iris_execute 执行调试命令，验证返回值：
       - Query: 返回数据非空
       - JSON: code=0 且 data 非空
       - XML: 结构正确无错误码
    9. 输出完整验证报告（编译状态 + 测试结果 + 字段输出情况）

    修复代码时必须遵守 references/objectscript-coding-standards.md。
    参考 references/his-pitfalls.md 避免常见陷阱。
```

### 流程图

```
本地 .cls 文件
    ↓
iris_doc(put) 上传
    ↓
iris_compile 编译
    ↓
┌─ 编译成功 ─────────────────────────┐
│  提取 debug 命令                     │
│  获取真实测试数据                     │
│  执行并验证返回值                     │
│  输出验证报告                        │
└────────────────────────────────────┘
    ↓ 编译失败
修复代码（≤5次循环）
    ↓
重新上传+编译
```

---

## Mode B：修改已有接口

### 四级定位策略

> **数据来源**：优先从IRIS的`Ens_InterfaceMethod`表动态获取（MCP连接时），降级使用本地`all-interfaces.md`静态索引。
> 本地索引数据来源为`Ens_InterfaceMethod`表的历史导出，无MCP连接时作为兜底。

| 级别 | 条件 | 方式 | 说明 |
|:----:|------|------|------|
| **L0** | MCP连接可用 | `iris_query("SELECT ... FROM Ens_InterfaceMethod")` | 实时获取，数据最新 |
| **L1** | MCP不可用 或 L0未命中 | `Grep all-interfaces.md` | 本地静态索引兜底 |
| **L2** | L0+L1均未命中，MCP可用 | `iris_symbols` / `iris_search` | 扩大搜索范围 |
| **L3** | 所有自动策略均未命中 | 向用户提问 | 给出精确提问引导 |

**L0 MCP动态查询方式**：

| 用户输入 | SQL查询 |
|---------|---------|
| 接口编码 "W00000386" | `SELECT ... FROM Ens_InterfaceMethod WHERE Code='W00000386'` |
| 方法名 "GetPatInfo" | `SELECT ... FROM Ens_InterfaceMethod WHERE ClassMethod LIKE '%GetPatInfo%'` |
| 类名片段 "BloodDialysis" | `SELECT ... FROM Ens_InterfaceMethod WHERE ClassName LIKE '%BloodDialysis%'` |
| 业务描述 "血透" | `SELECT ... FROM Ens_InterfaceMethod WHERE Description LIKE '%血透%'` |

**L1 本地索引搜索方式**：

| 用户输入 | Grep 搜索方式 |
|---------|--------------|
| 接口编码 "W00000386" | `Grep "W00000386" all-interfaces.md` |
| 方法名 "GetPatInfo" | `Grep "GetPatInfo" all-interfaces.md` |
| 类名片段 "BloodDialysis" | `Grep "BloodDialysis" all-interfaces.md` |
| 业务描述 "血透患者" | `Grep "血透" all-interfaces.md` |

**L3 用户交互模板**：
```
未能自动定位到目标接口。请提供以下任一信息：
1. 完整类名（如 web.DHCENS.BLL.SmartWard.IP.PatientInfo）
2. 方法名（如 GetPatInfo）
3. 接口编码（如 W00000386）
4. 该接口所在的业务系统名称（如 血透/药房/检验）
```

### Spawn 指令模板

```
spawn Agent:
  description: "修改接口 {需求描述}"
  prompt: |
    请按照 workflow.md 的 Mode B 完整流程，
    对需求"{用户需求描述}"执行修改+验证：

    1. Step 0: 检测MCP连接（check_config）
       → connected=true: 进入L0（MCP动态查询Ens_InterfaceMethod）
       → connected=false: 跳过L0，直接L1（本地索引兜底）

    2. B1: 按四级策略定位目标类
       ┌─ L0: MCP查 Ens_InterfaceMethod（有连接时首选）
       │    iris_query("SELECT ... FROM Ens_InterfaceMethod WHERE ...")
       ├─ L1: Grep interface-index/all-interfaces.md（无连接时兜底/L0未命中补充）
       ├─ L2: iris_symbols / iris_search（L0+L1均未命中且MCP可用）
       └─ L3: 询问用户，给出精确提问模板

    3. B2: iris_doc(get) 导出源码到 output/
    4. B3: 备份 + 理解现有逻辑，输出摘要
    5. B4: 设计修改方案（复杂修改先确认）
    6. B5: 执行修改
    7. B6: 编译验证（Mode A 流程）
    8. B7: 功能测试（用真实数据执行调试命令）
    9. B8: 更新接口索引（本地 all-interfaces.md + 确认 Ens_InterfaceMethod 同步）

    遵守编码规范 references/objectscript-coding-standards.md。
    测试数据获取参考 test-data-discovery.md。
```

### 流程图

```
用户需求描述
    ↓
Step 0: 检测MCP连接（check_config）
    ↓
B1: 四级定位策略
    ├─ L0: MCP查 Ens_InterfaceMethod（有连接时首选）
    │      iris_query → SQL精确/模糊匹配 → 唯一命中/候选列表
    ├─ L1: Grep all-interfaces.md（无连接兜底 / L0未命中补充）
    ├─ L2: iris_symbols / iris_search（L0+L1均未命中且MCP可用）
    └─ L3: 询问用户（给出精确提问模板）
    ↓
B2: iris_doc(get) 导出源码
    ↓
B3: 备份 + 理解逻辑
    ↓
B4: 设计修改方案（复杂先确认）
    ↓
B5: 执行修改
    ↓
B6: 编译验证（Mode A 流程）
    ↓
B7: 功能测试
    ↓
B8: 更新接口索引（本地 all-interfaces.md + 确认 Ens_InterfaceMethod 同步）
```

---

## 关键约束

| 约束 | 说明 |
|------|------|
| 最大修改循环 | ≤5次，超过则停止并输出诊断，提示人工介入 |
| 修复后重新上传 | 每次修复后必须 iris_doc(put) 重新上传，不能假设本地修改已同步 |
| 修复前备份 | 同目录 `.bak` 或 `.YYYYMMDD_bak` |
| Mode A 范围 | 只修编译错误，不改业务逻辑 |
| Mode B 范围 | 复杂修改方案先与用户确认；修改后必须更新接口索引 |

---

## 测试数据获取策略

详见 `test-data-discovery.md`

核心原则：
1. **空参优先**：能跑先跑空参
2. **真实数据**：跑不通再用 iris_query 查生产库获取真实值
3. **入参识别**：
   - 日期类：查最近7天的数据
   - 编码类：查字典表获取有效编码
   - ID类：查主表获取有效RowID

---

## 参考资料

| 文件 | 用途 |
|------|------|
| `workflow.md` | Mode A + Mode B 完整工作流 |
| `test-data-discovery.md` | 测试数据获取策略（真实生产数据） |
| `references/interface-index/all-interfaces.md` | 本地静态接口索引（无MCP时兜底） |
| `references/interface-index/INDEX.md` | 快速查找指南（按业务功能） |
| `references/interface-index/README.md` | 接口索引使用说明 |
| `references/interface-index/_template.md` | 接口索引条目模板 |
| IRIS `Ens_InterfaceMethod` 表 | 接口方法注册表（MCP连接时首选数据源） |
| `references/objectscript-coding-standards.md` | 修复时参考的编码规范 |
| `references/his-pitfalls.md` | 常见编译陷阱速查 |

---

## 输出报告格式

### Mode A 验证报告

```
## 验证报告

### 基本信息
- 文件：xxx.cls
- 类名：web.DHCENS.BLL.xxx
- 字段数：25

### 编译状态
- 状态：✅ 通过 / ❌ 失败
- 错误数：0
- 警告数：0

### 功能测试
- 测试命令：d ##class(xxx).xxx("123")
- 返回状态：✅ 正常
- 数据行数：5
- 字段覆盖：25/25

### 结论
接口验证通过，可部署使用。
```

### Mode B 修改报告

```
## 修改报告

### 需求描述
增加 xxx 字段

### 定位结果
- 接口编码：W00000386
- 类名：web.DHCENS.BLL.BloodDialysis.Method.PatInfo
- 方法名：GetPatInfo
- 来源：interface-index/all-interfaces.md

### 修改内容
1. 新增字段 xxx（第xx行）
2. 修改 ROWSPEC（第xx行）

### 编译状态
- 状态：✅ 通过

### 功能测试
- 测试命令：d ##class(xxx).xxx("123")
- 新增字段输出：✅ 正常

### 索引更新
- 已更新 references/interface-index/all-interfaces.md

### 结论
修改完成，接口验证通过。
```
