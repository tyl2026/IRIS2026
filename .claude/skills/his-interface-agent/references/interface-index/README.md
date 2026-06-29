# 接口索引使用说明

> 帮助 Agent 在修改已有接口时自主发现目标类和方法，避免每次都需要用户指定完整类名。

## 数据来源

| 来源 | 条件 | 说明 |
|------|------|------|
| **IRIS `Ens_InterfaceMethod` 表** | MCP连接可用时（首选） | 实时查询，数据始终最新 |
| **本地 `all-interfaces.md`** | MCP连接不可用时（兜底） | 历史导出，可能不是最新状态 |

**`Ens_InterfaceMethod` 表关键字段**：
- `ClassMethod` — 方法名（如 GetPatInfo）
- `Description` — 功能描述（如 "获取患者基本信息"）
- `Code` — 接口编码（如 W00000386）
- `ClassName` — 类名（如 web.DHCENS.BLL.BloodDialysis.Method.PatInfo）

## 目录结构

```
references/interface-index/
├── README.md               ← 本文件
├── INDEX.md                ← 快速查找指南（按业务功能/编码前缀）
├── all-interfaces.md       ← 本地静态接口索引（无MCP时兜底文件）
├── _template.md            ← 新建索引条目模板
└── custom.md               ← 用户自定义/第三方接口
```

## Agent 发现策略（四级）

当用户说"修改 xxx 接口"时，Agent 按以下优先级定位目标类：

### Step 0: 检测MCP连接

```
调用 check_config 检测IRIS连接状态
  → connected=true  → 进入 L0（MCP动态获取）
  → connected=false → 跳过L0，直接进入 L1（本地索引兜底）
```

### L0: MCP动态查询（最高优先级，需MCP连接）

```
iris_query("SELECT ID, ClassMethod, Description, Code, ClassName FROM Ens_InterfaceMethod")
```

| 用户输入 | SQL查询 |
|---------|---------|
| "W00000386这个接口" | `WHERE Code='W00000386'` |
| "GetPatInfo方法" | `WHERE ClassMethod LIKE '%GetPatInfo%'` |
| "血透的接口" | `WHERE Description LIKE '%血透%'` |
| "BloodDialysis类" | `WHERE ClassName LIKE '%BloodDialysis%'` |

匹配结果：唯一命中→直接使用；多条命中→请用户确认；无命中→降级L1。

### L1: 本地索引查找（无MCP时兜底）

```
Grep 搜索 references/interface-index/all-interfaces.md
```

| 用户输入 | Grep 搜索模式 |
|---------|--------------|
| "W00000386这个接口" | `Grep "W00000386" all-interfaces.md` |
| "GetPatInfo方法" | `Grep "GetPatInfo" all-interfaces.md` |
| "血透的接口" | `Grep "血透" all-interfaces.md` |
| "BloodDialysis类" | `Grep "BloodDialysis" all-interfaces.md` |

**快速定位**：先查 `INDEX.md` 的"按业务功能快速定位"表，缩小搜索范围。

### L2: MCP 扩大搜索（L0+L1均未命中，且MCP可用）

```
1. iris_symbols(query="web.DHCENS.BLL.{系统名}*")
   → 列出该包下所有类
2. iris_search(query="关键词")
   → 全文搜索匹配代码
3. docs_introspect(class_name=候选类)
   → 查看方法签名确认是否目标
```

### L3: 询问用户（所有自动策略均未命中）

```
"未能自动定位到目标接口。请提供以下任一信息：
 1. 完整类名（如 web.DHCENS.BLL.SmartWard.IP.PatientInfo）
 2. 方法名（如 GetPatInfo）
 3. 接口编码（如 W00000386）
 4. 该接口所在的业务系统名称（如 血透/药房/检验）

提示：如有MCP连接，我已尝试从 Ens_InterfaceMethod 表查询但未匹配到。
     您也可以直接指定类名，我将直接从IRIS导出源码进行修改。"
```

## 索引文件格式

`all-interfaces.md` 按类名排序，每个类包含方法清单：

```markdown
## {类名}

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000386` | `GetPatInfo` | 血透-获取患者基本信息 | Y |
```

## 索引维护

- **MCP连接可用时**：直接从 `Ens_InterfaceMethod` 表获取最新数据，无需维护本地索引
- **本地索引全量重建**：运行 `python scripts/generate_interface_index.py` 从 Excel 重新生成
- **本地索引增量更新**：每次通过 Mode B 修改接口后，Agent 自动更新 `all-interfaces.md` 中对应条目
- **新增条目**：新接口类按 `_template.md` 格式添加到 `all-interfaces.md`
- **Ens_InterfaceMethod 同步**：如修改涉及新增/删除方法，提示用户确认IRIS端注册状态

## 参考

- 快速查找指南：`INDEX.md`
- 全量接口索引：`all-interfaces.md`
- 接口测试工作流：`tests/workflow.md`
- 接口测试子Agent：`tests/interface-test-agent.md`
