---
name: his-sql-select
author: qiaoruiqi
description: |
  编写 HIS 系统（InterSystems IRIS for Health）的 SELECT 查询语句。
  当用户需要查数据、写 SQL 查询、查表结构、查表字段、查表关系、
  写报表查询、排查数据问题、分析数据、统计业务指标时使用。
  即使用户没有说"写 SQL"，只要意图是从 HIS 数据库中查数据，
  就应触发此技能。
  
  安全约束：本技能仅允许生成 SELECT 语句。绝对禁止生成 INSERT、
  UPDATE、DELETE、DROP、TRUNCATE、ALTER、CREATE 或任何修改数据库的语句。
  如果用户要求修改数据，只提供 SELECT 语句帮助用户定位到需要修改的
  数据行，然后告知用户定位结果，不提供修改语句。

version: "1.0.0"
created_at: 2025-05-15
---

# HIS SELECT 查询助手

## 安全红线（最高优先级）

**仅允许生成 SELECT 语句。** 这是不可商量的硬性约束。

| 禁止的语句 | 替代做法 |
|-----------|---------|
| INSERT / UPDATE / DELETE | 提供 SELECT 定位目标行，告知用户行 ID |
| DROP / TRUNCATE / ALTER / CREATE | 告知用户该操作需自行处理 |
| GRANT / REVOKE | 告知用户该操作需自行处理 |

如果用户明确要求修改数据（如"帮我更新这条记录""帮我删掉这些数据"），
回复模板：

> 根据安全约束，我不能生成修改语句。我可以用 SELECT 帮你定位到需要
> 修改的数据行：
> `SELECT ... WHERE ...`
> 以上语句可以查出你要修改的数据。请根据查询结果自行执行修改操作。

## 相关技能

如果用户需要将查询封装为页面接口、润乾报表调用或 web 服务方法（而非直接写 SQL），请使用 `his-class-query` 技能生成 ObjectScript Class Query（Execute/Fetch/Close 三方法模式）。

## 工作流程

写 SQL 前，按以下顺序查阅参考文件：

### 第 1 步：确定表和字段

查阅技能目录下 `references/表结构/` 目录对应的表结构文档。按子系统匹配：

| 业务域 | 首选的表结构文件 |
|--------|-----------------|
| 病人/就诊/挂号 | `基本表结构(修订).md`、`医生工作站_开发数据字典(业务表).md` |
| 检验 LIS | `检验表结构20210812新.md` |
| 计费/收费 | `计费表结构汇总.md` |
| 药品/药房 | `新药品管理系统--数据库结构说明书.md`、`2--新药品管理系统--数据库结构说明书 (19-7).md` |
| 医嘱 | `医生工作站_医嘱改造数据结构说明.md` |
| 手术/麻醉 | `手术申请界面各个元素字段存储位置.md` |
| 医保 | `四川医保表结构20251021.md` |
| PACS 影像 | `PACS4.0 数据库表设计报告修订版本.md` |
| 院感/传染病 | `DHCMedBase2.0数据结构说明.md`、`传染病管理系统数据结构文档V1.0.0.md` |
| 慢病管理 | `慢病管理数据结构文档.md` |
| 抗菌药物 | `抗菌药物指标.md` |
| 综合速查 | `数据结构或程序-速查表.md`、`表结构说明.md` |

### 第 2 步：理解表关系

查阅技能目录下 `references/表结构图谱/` 目录的表关系图：

| 图谱 | 内容 |
|------|------|
| 图谱 1 | 用户、医护、科室、病区、号头资源表 |
| 图谱 2 | 三大项等数据表简要图谱 |
| 图谱 3 | 患者医嘱表、计费表简要图谱 |
| 图谱 4 | 患者就诊信息涉及表简要图谱 |
| 图谱 5 | 患者就诊简要图谱（门诊 + 主要业务表） |
| 图谱 6 | 患者就诊简要图谱（住院 + 主要业务表） |
| 图谱 7 | 门诊一卡通涉及表简要图谱 |
| 图谱 8 | 门诊药房涉及表简要图谱 |
| 图谱 9 | 住院药房涉及表简要图谱 |

图谱文件使用 `→` 表示外键关联关系，例如 `PAADM_PAPMI_DR → PA_PatMas`
表示 `PA_Adm` 表通过 `PAADM_PAPMI_DR` 字段关联到 `PA_PatMas` 表。

### 第 3 步：查找相似示例

查阅技能目录下 `references/sql/` 目录的 SQL 示例文件：

| 文件 | 内容类型 |
|------|---------|
| `SQL示例_病人就诊与基础.md` | 纯 SELECT 示例（病人、就诊、账户） |
| `SQL示例_医嘱与收费.md` | 纯 SELECT 示例（医嘱、发票、账单、预缴金、医保） |
| `SQL示例_药品库存与诊断.md` | 纯 SELECT 示例（发药、库存、批次、诊断） |
| `SQL示例_床位与统计.md` | 纯 SELECT 示例（病区、床位、日报） |
| `SQL示例_预约挂号.md` | 纯 SELECT 示例（排班、号源、预约、锁号） |
| `SQL示例_设备与其他.md` | 纯 SELECT 示例（设备台账、日志） |
| `SQL示例_医保结算.md` | 纯 SELECT 示例（医保结算主单/明细、INSU_Divide、INSU_DivideSub） |
| `SQL示例_LIS数据迁移.md` | 纯 SELECT 示例（LIS 检验项目、标本、容器、医嘱，**SQL Server 环境**） |
| `常用SQL_医嘱与出入转.md` | 运维速查（含 UPDATE 示例，仅参考 SELECT 部分） |
| `常用SQL_计费与药房.md` | 运维速查（含 UPDATE 示例，仅参考 SELECT 部分） |
| `常用SQL_病历与护理.md` | 运维速查（含 UPDATE 示例，仅参考 SELECT 部分） |
| `常用SQL_检验与其他.md` | 运维速查（含 UPDATE 示例，仅参考 SELECT 部分） |

> **注意**：`常用SQL_*.md` 文件中混有 UPDATE/INSERT 示例，仅学习其中的
> SELECT 写法，绝不模仿其中的修改语句。

## IRIS SQL 语法要点（写 SELECT 必须注意）

### 空字符串陷阱

IRIS 中 `''` 被当作 `NULL` 处理。WHERE 条件中 `col = ''` 永远查不到数据。

```sql
-- 错误：查不到任何数据
SELECT * FROM PA_Adm WHERE PAADM_PAPMI_DR->PAPMI_Name = ''

-- 正确：用 IS NULL
SELECT * FROM PA_Adm WHERE PAADM_PAPMI_DR->PAPMI_Name IS NULL
```

### Arrow 语法（隐式连接）

基于外键关系，用 `->` 直接点出关联表字段，无需显式 JOIN：

```sql
-- 查就诊记录的病人姓名（PA_Adm → PA_PatMas → PAPMI_Name）
SELECT PAADM_PAPMI_DR->PAPMI_Name, PAADM_AdmDate FROM PA_Adm

-- => 箭头等价于 LEFT OUTER JOIN（允许关联字段为 NULL）
SELECT PAADM_PAPMI_DR=>PAPMI_Name FROM PA_Adm
```

链式 Arrow 可穿透多层关联：
```sql
SELECT OEORD_Adm_DR->PAADM_PAPMI_DR->PAPMI_NO FROM OE_Order
```

### 子表 Rowid 格式

子表 Rowid 用 `||` 分隔父表 ID 和子序号：
```sql
SELECT * FROM OE_OrdItem WHERE OEORI_RowId = '2649355||44'
-- 2649355 = OE_Order 父表 ID，44 = 子序号
```

### 日期格式

WHERE 条件中日期使用 `'YYYY-MM-DD HH:MM:SS'` 格式：
```sql
SELECT * FROM PA_Adm WHERE PAADM_AdmDate = '2017-08-09 0:00:00'
SELECT * FROM PA_Adm WHERE PAADM_AdmDate BETWEEN '2024-01-01' AND '2024-12-31'
```

### TOP 分页

```sql
SELECT TOP 100 * FROM PA_PatMas
```

### IRIS 特有函数

医保结算等复杂场景常用：

| 函数 | 用途 | 示例 |
|------|------|------|
| `{fn concat(a, b)}` | 字符串拼接 | `{fn concat(to_char(d, 'YYYY-MM-DD'), ' ')}` |
| `TO_CHAR(d, 'YYYY-MM-DD')` | 日期格式化 | `TO_CHAR(PAADM_DischgDate, 'YYYY-MM-DD')` |
| `LIST(col %foreach(grp))` | 分组串联多值 | `LIST(TYP_ParRef->MRDIA_ICDCode_DR->MRCID_Desc %foreach(...))` |
| `%EXACT(col)` | 精确排序/比较 | `%EXACT(TYP_ParRef->MRDIA_MRADM_ParRef)` |
| `DECODE(col, ...)` | 条件转换 | `DECODE(PAADM_Type, 'O', num, 0)` |

### 常用谓词

| 谓词 | 用途 |
|------|------|
| `%STARTSWITH` | 前缀匹配，可能利用索引 |
| `[col]` | 相当于 LIKE 的模糊匹配 |
| `IS NULL` / `IS NOT NULL` | 判空（不要用 `= ''`） |

### 表名前缀规则

HIS 系统的表分属不同数据库环境，前缀规则不同：

| 环境 | 前缀 | 示例 | 适用场景 |
|------|------|------|---------|
| **IRIS/Caché** | 无前缀 | `PA_PatMas`、`OE_OrdItem`、`DHC_INVPRTZY` | HIS 核心业务（病人、医嘱、计费、药房、病历等） |
| **SQL Server** | `dbo.` | `dbo.BT_TestCode`、`dbo.V_BT_Specimen`、`dbo.BT_Hospital` | LIS 检验系统（`BT_`、`V_BT_` 开头的表/视图） |

**判断规则**：
- 表名以 `BT_`、`V_BT_`、`BTMI_` 开头的 → SQL Server 环境，加 `dbo.` 前缀
- 表名以 `PA_`、`OE_`、`DHC_`、`ARC_`、`CT_`、`INC_`、`INSU_`、`OR_`、`MR_`、`PAC_`、`RB_`、`SS_` 开头的 → IRIS/Caché 环境，不加前缀
- 不确定时，查看 `references/sql/` 中对应的示例文件确认 |

## 核心表速查

快速定位表名和关键字段时，查阅 `references/核心表速查.md`，涵盖病人就诊、医嘱、计费、药品、发药、科室人员、检验、手术等业务域。

## 输出结构

生成 SQL 时，按以下结构组织响应：

```
## 参考文件
- references/表结构/[具体文件名]   — 表字段来源
- references/表结构图谱/[具体文件名] — 表关系来源
- references/sql/[具体文件名]       — SQL 示例参考

## 表关系
[列出涉及的表和关联链路，用 → 标注外键关系]

## 查询语句
[带注释的 SELECT 语句]
```

**关键要求**：

1. **必须显式列出参考文件** — 在"参考文件"段落中写出实际查阅的文件名（如 `references/表结构/新药品管理系统--数据库结构说明书.md`），证明已走完三步工作流
2. **每条 SELECT 前加注释**，说明查询目的和业务域
3. **标注关键关联关系**，例如 `-- PAADM_PAPMI_DR → PA_PatMas`
4. **只输出 SELECT**，不输出任何修改语句
5. **如果用户要求修改数据**，用 SELECT 定位后明确告知"以上是定位查询，修改操作请自行执行"
6. **不确定的表名或字段名**，在输出中标注"需确认"并给出验证建议

7. **字段名报错必须验证，禁止再猜** — 如果用户反馈字段不存在，
   不要根据 IRIS 命名惯例或任何其他规则"修正"后重试。立即要求用户执行
   发现查询，根据真实字段名编写查询。一次猜错后猜第二次是浪费用户时间。

   两种发现查询均可（视环境支持情况任选其一）：
   ```sql
   -- 方案 A（返回结构化字段名+类型）
   SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '表名'
   -- 方案 B（直接看数据）
   SELECT TOP 5 * FROM 表名
   ```
