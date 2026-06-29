---
name: his-class-query
author: qiaoruiqi
description: |
  编写 HIS 系统（InterSystems IRIS for Health）的 ObjectScript Class Query。
  触发场景：写页面查询、润乾报表查询、%Query（Execute/Fetch/Close）、
  封装查询方法、web 查询接口、Global 遍历查询、汇总统计查询。
  即使用户没说"Class Query"，只要意图是封装 HIS 数据为可调用查询接口
  （而非直接 SQL），就应触发。"写个查询""帮我写query""封装一下""统计一下"
  等口语表达同样触发。

  与 his-sql-select 的区别：
  - his-sql-select → 纯 SQL SELECT，直接查数据
  - his-class-query → ObjectScript %Query，封装为可调用接口

  安全约束：仅允许生成查询代码，禁止 INSERT/UPDATE/DELETE/全局变量写操作。
  用户要求修改数据时，只提供查询代码定位数据行。

version: "1.0.0"
created_at: 2025-05-15
---

# HIS Class Query 助手

## 安全红线（最高优先级）

**仅允许生成查询代码。** 这是不可商量的硬性约束。

| 禁止的操作 | 替代做法 |
|-----------|---------|
| 全局变量写操作（`s ^XXX=...`） | 只用 `$o()` 遍历、`$p()` 读取 |
| SQL INSERT/UPDATE/DELETE | 用 SELECT 定位目标行 |
| TSTART/TCOMMIT/TROLLBACK 事务 | 告知用户修改操作需自行处理 |

## 与 his-sql-select 的协作

| 场景 | 用哪个技能 |
|------|-----------|
| 直接查数据、导报表、排查数据 | `his-sql-select` |
| 封装为页面查询、润乾报表调用、web 接口 | `his-class-query` |
| 不确定 | 先用 `his-sql-select` 写 SQL，确认可行后再封装 |

## 工作流程

写 Class Query 前，按以下顺序查阅参考文件：

### 第 1 步：确定表和字段

查阅技能目录下 `references/表结构/` 目录对应的表结构文档：

| 业务域 | 首选的表结构文件 |
|--------|-----------------|
| 病人/就诊/挂号 | `基本表结构(修订).md`、`医生工作站_开发数据字典(业务表).md` |
| 计费/收费 | `计费表结构汇总.md` |
| 药品/药房 | `新药品管理系统--数据库结构说明书.md` |
| 医嘱 | `医生工作站_医嘱改造数据结构说明.md` |
| 手术/麻醉 | `手术申请界面各个元素字段存储位置.md` |
| 检验 LIS | `检验表结构20210812新.md` |
| 医保 | `四川医保表结构20251021.md` |
| 院感/传染病 | `DHCMedBase2.0数据结构说明.md` |

> **表字段速查**：各表的关键字段查阅 `references/核心表速查.md`（病人与就诊、医嘱、计费、药品、发药、科室人员、检验、手术等）。

### 第 2 步：理解表关系

查阅技能目录下 `references/表结构图谱/` 目录的表关系图。

图谱文件使用 `→` 表示外键关联关系，例如 `PAADM_PAPMI_DR → PA_PatMas`
表示 `PA_Adm` 表通过 `PAADM_PAPMI_DR` 字段关联到 `PA_PatMas` 表。

### 第 3 步：查找相似示例

查阅技能目录下 `references/query/` 目录的 Class Query 示例文件：

| 文件 | 业务域 | 包含示例 |
|------|--------|---------|
| `references/query/示例_门诊与挂号.md` | 门诊/挂号 | 门诊人次、缴费、挂号、诊断统计、诊断查询 |
| `references/query/示例_住院与计费.md` | 住院/计费 | 欠费、医嘱费用、出院费用分类、床位信息、床位费用 |
| `references/query/示例_药房与其他.md` | 药房/其他 | 发药、未发药医嘱、输血、排班、建卡 |

每个示例包含：调用方式、关键 Global 节点、核心逻辑代码片段、ROWSPEC 定义。

### 第 4 步：查阅语法指南

查阅 `references/query/class-query-guide.md` 了解 Class Query 语法细节：
- `%SQLQuery` 基本查询 vs `%Query` 自定义查询的区别
- `ROWSPEC` / `CONTAINID` 参数定义
- Execute / Fetch / Close 三方法模式
- 调用方式（`%SQL.Statement` + `%PrepareClassQuery`）

## 安全编码规范

### 缩进与命名规范

**`f` 循环后必须跟两个空格再写命令**：

```objectscript
; 错误：f 后只跟一个空格
f Date=startDate:1:endDate d
.s RowId="" f  s RowId=$o(^Global(Date,RowId)) q:RowId=""  d

; 正确：f 后跟两个空格
f  s RowId=$o(^Global(Date,RowId)) q:RowId=""  d
```

**变量名禁止使用下划线，统一驼峰命名**：

```objectscript
; 错误
s pat_name=$p(^PAPER(PAPMIDR,"ALL"),"^",1)
s adm_rowid=$p(^PAADM(AdmId),"^",1)

; 正确
s PatName=$p(^PAPER(PAPMIDR,"ALL"),"^",1)
s AdmRowId=$p(^PAADM(AdmId),"^",1)
```

### 注释规范

**极简注释原则**：注释只标注"是什么"，不解释"为什么"。

| 允许（保留） | 禁止（删除） |
|-------------|-------------|
| 类定义注释 `/// 查询说明` | `// 校验就诊记录` |
| 方法定义注释 | `// 仅住院患者` |
| 字段赋值后的简短标注 `//科室` `//正常` `//年龄` | `// 获取科室代码` |
| 关键过滤条件的行内注释 `//排除已取消` | `// 遍历日期范围` |
| | `// 判断是否已结算` |
| | `// 取病人信息` |

```objectscript
; 错误：废话注释
..; 校验就诊记录
..s PAADMData=$g(^PAADM(AdmId))
..q:PAADMData=""
..; 仅住院患者
..s AdmType=$p(PAADMData,"^",2)
..q:AdmType'="I"

; 正确：只在赋值后标注字段含义
..s PAADMData=$g(^PAADM(AdmId))
..q:PAADMData=""
..s AdmType=$p(PAADMData,"^",2)
..q:AdmType'="I"
..s AdmLocDR=$p(PAADMData,"^",4)  //科室
..s PAPMIDR=$p(PAADMData,"^",1)   //病人DR
```

### 必须使用 `$g()` 读取 Global 节点

直接用 `$p(^Global(Id),"^",1)` 在节点不存在时会报错。必须先用 `$g()` 取值：

```objectscript
; 错误：节点不存在时崩溃
s Name=$p(^PAPER(PAPMIDR,"ALL"),"^",1)

; 正确：$g() 兜底
s PAPERData=$g(^PAPER(PAPMIDR,"ALL"))
q:PAPERData="" ""
s Name=$p(PAPERData,"^",1)
```

**规则**：所有通过 `$p()` 读取 Global 的地方，都应先 `$g()` 取到变量，再 `$p()` 解析。

### 就诊记录通用校验

根据就诊 ID 取数据时，必须先校验就诊有效性：

```objectscript
; 校验就诊记录
s PAADMData=$g(^PAADM(AdmId))
q:PAADMData="" ""              ; 就诊不存在
s AdmType=$p(PAADMData,"^",2)
s VisitStatus=$p(PAADMData,"^",20)
q:VisitStatus="C" ""           ; 排除已取消就诊
```

按业务场景过滤就诊类型：

| 场景 | 过滤条件 |
|------|---------|
| 仅门诊 | `q:AdmType'="O"` |
| 仅住院 | `q:AdmType'="I"` |
| 门诊+急诊 | `q:(AdmType'="O")&&(AdmType'="E")` |
| 不限类型 | 不加类型过滤 |

### 类方法调用规范

必须使用 `##class(包名.类名).方法名()` 格式调用，**禁止 `$$` 语法**：

```objectscript
; 错误
s Age=$$Age^EMRservice.HISInterface.PatientInfoAssist(PapmiDR, AdmID)

; 正确
s Age=##class(EMRservice.HISInterface.PatientInfoAssist).Age(PapmiDR, AdmID, "", "")
```

### 年龄字段取法

年龄字段**必须**调用标准接口，禁止自行计算：

```objectscript
s Age=##class(EMRservice.HISInterface.PatientInfoAssist).Age(PapmiDR, AdmID, "", "")
```

参数 `PapmiDR` 和 `AdmID` 根据当前上下文变量传入。

### 业务状态过滤

遍历结果时，必须过滤无效/作废记录。常见状态字段：

| 表 | 字段 | 有效值 | 无效值 |
|----|------|--------|--------|
| `PA_Adm` | `PAADM_VisitStatus` | A=在院, D=出院 | C=取消 |
| `DHC_INVPRT` | `PRT_Flag` | N=正常 | A=作废, S=冲红 |
| `OE_OrdItem` | `OEORI_ItemStat_DR` | 1=核实, 6=执行 | 4=停止, 5=撤销 |

## 代码模板与遍历模式

写代码时查阅 `references/代码模板与遍历模式.md`，包含：
- **代码模板**：标准 Query（Execute/Fetch/Close）、汇总统计、ClassMethod 直接输出
- **Global 遍历模式**：按日期、按就诊、按账单、按病人、子表、在院住院、诊断、发药、医嘱执行记录、建卡记录
- **常用取值模式**：取就诊信息、病人姓名、科室名称、医生姓名、年龄、医嘱名称、日期时间格式化等 15 种常用取值

## 输出结构

生成代码时，按以下结构组织响应：

```
## 参考文件
- references/表结构/[具体文件名]   — 表字段来源
- references/query/示例_[业务域].md     — Class Query 示例参考

## Global 遍历路径
[列出涉及的 Global 节点和遍历顺序]

## 调用方式
d ##class(%ResultSet).RunQuery("web.ClassName","QueryName","参数")

## 代码
[带注释的完整 Query + Execute/Fetch/Close 代码]
```

**关键要求**：

1. **必须显式列出参考文件** — 证明已走完工作流
2. **注释极简**：只保留类定义注释（///）和字段赋值后的简短标注（如 `//科室`、`//正常`），禁止"获取xxx""遍历xxx"等解释性注释
3. **ROWSPEC 必须与输出字段一一对应**
4. **只生成查询代码**，不输出任何修改操作
5. **不确定的 Global 或字段**，在输出中标注"需确认"并给出验证建议
6. **日期参数统一用 `$zdh(date,3)` 转换**，支持 "YYYY-MM-DD" 格式输入
7. **循环前初始化变量**，避免上一轮循环的残留值污染当前行
8. **必须使用 `$g()` 读取 Global**，先取到变量再 `$p()` 解析，防空节点报错
9. **根据就诊 ID 取数据时必须校验就诊有效性**（存在性、类型、状态）
10. **年龄字段必须调用标准接口**：`##class(EMRservice.HISInterface.PatientInfoAssist).Age(PapmiDR,AdmID,"","")`
11. **类方法调用使用 `##class()` 格式**，禁止 `$$` 语法
12. **Query 和 ClassMethod 命名精简**，可适当使用缩写，避免过长
13. **Fetch/Close 方法内容固定**，除 Query 名外不可修改
