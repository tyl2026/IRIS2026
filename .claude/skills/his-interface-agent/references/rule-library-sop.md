# 规则库整理标准操作规范 (SOP)

> 最后更新：2026-05-11

## 标准流程（6 步）

### Step 1: 用户指定入口实体表

用户告诉我要整理的业务域 + 对应的实体表 cls 名称列表。

**用户提供**：
- 主实体表 cls 名称
- 关联实体表 cls 名称（如有）
- 可选的接口程序 cls 名称（用于后续验证）

---

### Step 2: 通过 MCP 读取实体表定义

使用 `iris_doc` 工具读取每个实体表的 cls 源码。

**重点关注**：
- `Storage SQLStorage` 部分 → Global 名称和结构
- `Data name="..."` → 字段在 `^` 分隔串中的 Piece 位置
- `Node="..."` → 子节点结构
- 索引定义 → 常用遍历方式

---

### Step 3: 分析表关联和取值逻辑

从 cls 定义中提取：

1. **Global 结构速查表** — 每个 Global 的节点/字段位置一览
2. **表关联关系图** — 外键引用链路（A.DR → B.RowID → C.DR）
3. **索引遍历方式** — 从 Index 定义提取常用 $o 遍历骨架
4. **踩坑点** — 非标字段位置、隐藏字段、条件字段

---

### Step 4: 整理为规则库文件

按标准模板生成 `rules/domains/{domain}.md`。

YAML Frontmatter 必须包含：entityClasses / apiClasses / relatedDicts / totalRules / relatedGlobals。

规则格式：每条规则包含 `| 属性 | 值 |` 表格 + 说明 + 代码示例，按业务含义分类组织。

---

### Step 5: 用生产接口代码验证

读取用户指定的接口程序 cls，对照验证：
1. 取值表达式是否一致
2. 索引遍历是否一致
3. 发现遗漏字段
4. 发现遗漏关联路径
5. 发现字段名与用途不符的陷阱

---

### Step 6: 补充更新规则库

将验证发现的内容补充到规则库，更新版本号和统计数字。

---

## 规则库文件标准模板

```yaml
---
domain: "XX-name"
name: "域中文名(完整版)"
version: "2.X.0"
description: "域描述"

# 实体表类（数据存储结构来源）
entityClasses:
  - name: "User.XXX"
    description: "表说明"
    global: "^GLOBAL(path)"
    primaryKey: "RowID_Field"

# 接口程序类（用于验证对照）
apiClasses:
  - name: "web.XXX.XXX"
    method: "Method()"

# 相关字典类
relatedDicts:
  - name: "User.YYY"
    global: "^GLOBAL(path)"
    description: "字典说明"

totalRules: N
lastUpdated: "2026-05-XX"
relatedGlobals:
  - "^GLOBAL — 说明"
---

# 域中文名

## 元信息
## 描述
## 表关联关系
## Global 结构速查
## 字段映射规则
  ### 分类标题
    #### FIELD_NAME (规则)
## 常用索引与遍历方式
## 踩坑提示
## 别名映射表
## 规则统计
```

---

## 版本号规则

- 初次按新标准整理：v2.0.0
- 经生产代码验证后：v2.1.0
- 补充遗漏字段后：v2.2.0+
- 旧 JSON 转换版本：v1.X.0

---

## 关键原则

1. **实体表是真相来源**，接口程序只是验证对照
2. **必须先读 cls 定义**，再写规则（不能直接搬 JSON）
3. **踩坑点必须记录**，尤其是 ^位置与字段名不符的情况
4. **索引遍历方式必须记录**，这是接口代码生成的关键
5. **每个域完成后记录 apiClasses**，方便后续未覆盖字段回溯查找
