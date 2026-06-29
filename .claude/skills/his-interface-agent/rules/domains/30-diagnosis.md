---
domain: "30-diagnosis"
name: "诊断域(完整版)"
version: "3.3.0"
description: "住院+门急诊诊断信息全部字段取值规则。核心Global:^MR(mradm,'DIA',sub)。含ICD编码/名称/类型/主诊标志/时间/备注/中医标识/医保NHS编码/医生/发现日期/工伤标志/诊断状态/体征症状/DRG排序/EPR序号等。基于实体表User.MRAdm(诊断主表)+User.MRDiagnos(诊断明细表,80个属性)，以web.DHCENS.Method.AdmInfo.GetDiagnoses()方法作为验证对照。v3.1.0新增9个MRDiagnos补充字段(docCodeDr/dateDetect/workRelated/diagStatDr/signSymDr/drgOrder/insuMainDiagFlag/SEQUENCE/LEVEL)。v3.2.0修正：明确数据层统一、差异仅在接口处理层"

# 实体表类（数据存储结构来源）
entityClasses:
  - name: "User.MRAdm"
    description: "病案/诊断主表"
    global: "^MR(MRADM_RowID)"
    primaryKey: "MRADM_RowID"
  - name: "User.MRDiagnos"
    description: "诊断明细表（每条诊断记录，住院/门诊共用同一张表！）"
    global: "^MR(mradm,'DIA',sub)"
    primaryKey: "复合键: mradm||DIA_Sub"

# 接口程序类（用于验证对照）
apiClasses:
  - name: "web.DHCENS.Method.AdmInfo"
    method: "GetDiagnoses(admRowId)"

# 相关字典类
relatedDicts:
  - name: "User.MRCICD"
    global: "^MRC(\"ID\",RowId)"
    description: "ICD诊断码字典(^1=本地编码,^2=名称,^4=标准编码,^15=billflag3中医标志)"
  - name: "User.MRCICDType"
    global: "^MRC(\"DTYP\",RowId)"
    description: "诊断类型字典(主诊断/副诊断/入院/出院/中医等)"
  - name: "User.DHCINICTLink"
    global: "^DHCINICT"
    description: "医保ICD对照表(^5=NHS编码,^6=NHS名称)"

# 数据源遍历配置（供代码生成器使用）
traversal:
  type: "MRDIA"
  viewMatchers: ["diagnosis", "diag", "judge", "judge_infolist", "outpatient_judge", "诊断", "ZDXX", "DBZ_ZDXX"]
  inputParam:
    name: "admRowId"
    type: "%String"
    description: "就诊ID"
  preVariables:
    - name: "patDR"
      expression: "$p($g(^PAADM(admRowId)),\"^\",1)"
      description: "患者DR"
    - name: "mradm"
      expression: "$p($g(^PAADM(admRowId)),\"^\",61)"
      description: "病案号"
      validation: |
        i (mradm="") {
            d stream.Write("{""code"":1,""msg"":""未找到病案号"",""data"":[]}")
            q stream
        }
  # 按日期范围遍历模式
  modes:
    dateRange:
      viewMatchers: ["诊断信息", "诊断记录", "Diagnosis", "ZDXX", "DBZ_ZDXX"]
      description: "按入院日期范围遍历（批量导出）"
      index:
        global: "^PAADMi"
        name: "PAADM_AdmDate"
        keys: ["date", "admRowId"]
        expression: '$o(^PAADMi("PAADM_AdmDate",date,admRowId))'
      template: |
        f date=pDateFrom:1:pDateTo d
        .s admRowId=""
        .f  s admRowId=$o(^PAADMi("PAADM_AdmDate",date,admRowId)) q:admRowId=""  d
        ..s admData=$g(^PAADM(admRowId))
        ..i admData="" q
        ..s patDR=$p(admData,"^",1)
        ..s mradm=$p(admData,"^",61)
        ..i mradm="" q
        ..s sub=""
        ..f  s sub=$o(^MR(mradm,"DIA",sub)) q:sub=""  d
        ...s diaData=$g(^MR(mradm,"DIA",sub))
        ...i diaData="" q
        ...s icdDr=$p(diaData,"^",1)
        ...i icdDr="" q
        ...d GetOrdDetail
    admSingle:
      viewMatchers: ["单个诊断", "诊断详情"]
      description: "按就诊ID遍历（单条查询）"
      index:
        global: "^MR"
        name: "DIA"
        keys: ["mradm", "sub"]
        expression: '$o(^MR(mradm,"DIA",sub))'
      template: |
        s sub=""
        f  s sub=$o(^MR(mradm,"DIA",sub)) q:sub=""  d
        .s diaData=$g(^MR(mradm,"DIA",sub))
        .i (diaData="") q
        .s icdDr=$p(diaData,"^",1)
        .q:icdDr=""
  # 默认配置（按就诊ID遍历，兼容旧逻辑）
  index:
    global: "^MR"
    name: "DIA"
    keys: ["mradm", "sub"]
    expression: '$o(^MR(mradm,"DIA",sub))'
  data:
    global: "^MR"
    variable: "diaData"
    format: "p"
    expression: '$g(^MR(mradm,"DIA",sub))'
  template: |
    s sub=""
    f  s sub=$o(^MR(mradm,"DIA",sub)) q:sub=""  d
    .s diaData=$g(^MR(mradm,"DIA",sub))
    .i (diaData="") q
    .s icdDr=$p(diaData,"^",1)
    .q:icdDr=""

totalRules: 33
lastUpdated: "2026-05-11"
relatedGlobals:
  - "^MR(mradm) — ★诊断主全局,入口键=病案号(来自^PAADM^61)"
  - "^MR(mradm,\"DIA\",sub) — ★诊断明细子节点,每条诊断一条记录(主串11位:^1~^11), 住院/门诊共用!"
  - "^MR(mradm,\"DIA\",sub,\"TYP\",n) — 诊断类型子节点(住院/门诊均可用)"
  - "^MR(mradm,\"DIA\",sub,\"DES\",n) — 医生备注子节点(住院/门诊均可用)"
  - "^MR(mradm,\"DIA\",sub,1) — 诊断第三下标(存mainflag/insuMainDiagFlag等扩展位,^20/^28等)"
  - "^MR(mradm,\"DIA\",sub,\"EPR\") — EPR诊断子节点(^1=Level级别,^2=Sequence序号)"
  - "^MRC(\"ID\",icdDr) — ICD码字典(核心字典!所有ICD字段的源头)"
  - "^MRC(\"DTYP\",typeDr) — 诊断类型字典"
  - "^CTPCP(docDr) — 医生/用户字典(医生姓名等)"
  - "^DHCINICT — 医保ICD对照表(^5=NHS编码,^6=NHS名称)"
  - "^PAADM(admRowId) — 就诊记录(^61=病案号→^MR入口键)"
---

# 诊断域(完整版)

## 元信息

||| 属性 | 值 |
|||------|-----|
||| 域ID | `30-diagnosis` |
||| 版本 | 3.2.0 |
||| 规则数 | 33 |
||| 实体表 | User.MRAdm / User.MRDiagnos(80属性, 住院&门诊共用) |
||| 接口程序 | web.DHCENS.Method.AdmInfo.GetDiagnoses() |
||| 更新时间 | 2026-05-11 |

## 描述

**住院+门急诊诊断信息的完整取值规则集。⭐ 重要：诊断数据底层完全统一——住院和门诊使用同一张实体表 User.MRDiagnos、同一个 ^MR 全局结构。差异仅存在于各接口程序的处理逻辑中（如选择读取哪些字段、输出时采用哪种编码转换）。**

核心数据流：

```
就诊记录 ^PAADM(admRowId)          ← 住院(WateNumber) / 门诊(admId) 都走这里
    ↓ ^61 取病案号
病案主表 ^MR(mradm)                ← 统一入口，不区分就诊类型
    ↓ 'DIA' 子节点遍历 ($o)
诊断明细 ^MR(mradm,"DIA",sub)      ← ★ 11位主串 + TYP/DES/EPR 子节点，全场景通用
    ↓ ^1 取 ICD_DR
ICD字典  ^MRC("ID",icdDr)
    ↓ ^1=本地编码, ^2=名称, ^4=标准编码, ^15=中医标志
```

### 数据层 vs 接口层差异说明

```
┌─────────────────────────────────────────────────────────┐
│                    数据层 (统一)                          │
│                                                         │
│   User.MRDiagnos 实体表 = 80个属性                       │
│   ^MR(mradm,"DIA",sub) = 11位主串 + TYP + DES + EPR     │
│   ★ 无论住院还是门诊，结构完全一致 ★                      │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                 接口处理层 (有差异)                        │
│                                                         │
│   GetDiagnoses()  → 读全部字段，标准转换                  │
│   WJJXH(住院接口)   → 用 TYP细粒度类型, 拼 DES备注        │
│   OEMethod(门诊接口)→ 可选: 用 billflag3 二分法替代 TYP   │
│                   → 可选: 不拼 DES 备注                  │
│                   → 主诊编码: Y→1, 其他→2 (vs 住院的→0)  │
│                                                         │
│   ⚠️ 差异是"接口选择读什么/怎么转"，不是"数据存不存在"！     │
└─────────────────────────────────────────────────────────┘
```

## 表关联关系

```
User.MRAdm (病案主表)
  ^MR(mradm) — 入口键 = PAADM^61(病案号)
  │
  └── "DIA" 节点 — 诊断明细集合 [★ 住院 & 门诊共用同一结构]
       │
       ├── ^MR(mradm,"DIA",sub) — 第sub条诊断记录(主串11位)
       │     ├── ^1  → ICD_DR(RowID) → ^MRC("ID",DR) 字典
       │     ├── ^2  → ICDSup_DR(补充ICD引用)
       │     ├── ^3  → ICDStatus(诊断状态原始值)
       │     ├── ^4  → DocCode_DR(下诊断医生) → ^CTPCP
       │     ├── ^5  → DateDetect(发现日期)
       │     ├── ^6  → WorkRelated(工伤标志 Y/N)
       │     ├── ^7  → DiagDate(诊断日期 $H格式)
       │     ├── ^8  → DiagTime(诊断时间 $H格式)
       │     ├── ^9  → DiagStat_DR(诊断状态DR)
       │     ├── ^10 → SignSym_DR(体征症状DR)
       │     └── ^11 → DRGOrder(DRG排序号)
       │
       │   [第三下标 sub,1 — 扩展位]
       │     ├── ^20 → MainDiagFlag(主诊断标志 Y/N)
       │     └── ^28 → InsuMainDiagFlag(医保结算主诊标识)
       │
       │   [TYP子节点 — 诊断类型]
       │     └── ^MR(...,"DIA",sub,"TYP",1)^1 → DTYP_DR → ^MRC("DTYP")
       │         (数据存在，部分接口方法选择不读)
       │
       │   [DES子节点 — 医生备注]
       │     └── ^MR(...,"DIA","DES",0)=行数, 1~n=备注文本
       │         (数据存在，部分接口方法选择不拼接到输出)
       │
       │   [EPR子节点]
       │     └── ^MR(...,"DIA",sub,"EPR") → ^1=Level级别, ^2=Sequence序号
       │
  关联链路:
     ^PAADM(admRowId)^61 → mradm(病案号) → ^MR(mradm,"DIA",sub)^1 → icdDr
                                                         ↓
                                               ^MRC("ID",icdDr)^1=本地编码
                                               ^MRC("ID",icdDr)^2=诊断名称
                                               ^MRC("ID",icdDr)^4=标准ICD编码
                                               ^MRC("ID",icdDr)^15=中医billflag3
                                                         ↓
                                    ^DHCINICT("0","MRCICDID",icdDr,"") → insuConDr
                                                         ↓
                                               ^DHCINICT(insuConDr)^5 = nhsDxCode
                                               ^DHCINICT(insuConDr)^6 = nhsDxName
```

## Global 结构速查

#### ^MR(mradm,"DIA",sub) — 诊断明细主串(完整11位) [★ 全场景通用]

||| ^位 | 字段(Property) | 说明 | 类型 |
|||------|------|------|------|
||| ^1 | ICD_DR / MRDIA_ICDCODEDR | ICD码字典RowID → ^MRC("ID") | DR引用 |
||| ^2 | ICDSup_DR | 补充ICD引用(备用) | DR引用 |
||| ^3 | ICDStatus | 诊断状态原始值 | String |
||| ^4 | DocCode_DR / MRDIA_DocCode_DR | 下诊断医生DR → ^CTPCP取姓名 | DR引用 |
||| ^5 | DateDetect / MRDIA_DateDetect | 发现日期($H格式) | Date |
||| ^6 | WorkRelated / MRDIA_WorkRelated | 工伤标志 Y/N | String |
||| ^7 | DiagDate | 诊断日期($H格式) | Date |
||| ^8 | DiagTime | 诊断时间($H格式) | Time |
||| ^9 | DiagStat_DR / MRDIA_DiagStat_DR | 诊断状态DR → 字典 | DR引用 |
||| ^10 | SignSym_DR / MRDIA_SignSym_DR | 体征症状DR → 字典 | DR引用 |
||| ^11 | DRGOrder / MRDIA_DRGOrder | DRG排序号 | Integer |

#### ^MR(mradm,"DIA",sub,1) — 诊断扩展位(第三下标=数字1)

||| ^位 | 字段(Property) | 说明 | 类型 |
|||------|------|------|------|
||| ^20 | MainDiagFlag / MRDIA_MainDiagFlag | 主诊断标志 Y/N | String |
||| ^28 | InsuMainDiagFlag / MRDIA_InsuMainDiagFlag | 医保结算主诊标识 | String |

#### ^MR(mradm,"DIA",sub,"TYP","DES","EPR") — 子节点 [★ 全场景通用]

||| 子节点 | 路径 | 说明 | 使用提示 |
|||--------|------|------|---------|
||| TYP | `"TYP",1` | 诊断类型DR → ^MRC("DTYP") | 数据存在；部分旧接口未读取此字段，但新接口(GetDiagnoses)会读 |
||| DES | `"DES",0~n` | 医生备注多行文本 | 数据存在；部分旧接口未拼接DES到输出，但数据可正常读取 |
||| EPR | `"EPR"` | ^1=级别, ^2=序号 | EPR子系统使用 |

#### ^MRC("ID",icdDr) — ICD诊断码字典

||| ^位 | 字段 | 说明 | 类型 |
|||------|------|------|------|
||| ^1 | LocalCode | 机构内部ICD编码 | String |
||| ^2 | DiagName | 诊断名称(本地=标准) | String |
||| ^4 | StandardCode | 标准ICD编码(可能含双引号) | String |
||| ^15 | BillFlag3 | 中医标志 Y=中医 N=西医 | String |

#### ^DHCINICT(insuConDr) — 医保ICD对照表

||| ^位 | 字段 | 说明 | 类型 |
|||------|------|------|------|
||| ^5 | NHS_DX_Code | 国家医保诊断编码 | String |
||| ^6 | NHS_DX_Name | 国家医保诊断名称 | String |

#### ^CTPCP(docDr) — 医生/用户字典

||| ^位 | 字段 | 说明 | 类型 |
|||------|------|------|------|
||| ^1 | Code | 用户工号/编码 | String |
||| ^2 | Name | 用户姓名 | String |
||| ^3 | Pinyin | 拼音码 | String |

## 前置条件

#### Step 1: 从就诊记录获取病案号

```objectscript
; 方式A: 从参数传入 admRowId(就诊DR/PAADM RowID)
s mradm = $p($g(^PAADM(admRowId)),"^",61)

; 方式B: 已有参数直接用(PAADM/WateNumber即住院流水号)
s mradm = PAADM  ; 或 WateNumber
```

> 所有以下规则均依赖 **mradm**(病案号/MRADM_RowID) 和 **sub**(诊断序号/$o遍历变量) 两个变量已赋值。
> **无论住院还是门诊，后续取值表达式完全相同。**

#### Step 2: 遍历诊断记录

```objectscript
; 标准遍历模式 — 住院/门诊通用!
s sub="" f  s sub=$o(^MR(mradm,"DIA",sub)) q:sub=""  d
|. ; 处理每条诊断记录
|. s icdDr = $p($g(^MR(mradm,"DIA",sub)),"^",1)
|. ; ... 后续取值（与就诊类型无关）
```

---

## 字段映射规则

#### 一、核心标识字段

---

### MRADM

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `MRADM` |
||| 匹配模式 | MRADM, mradm, 病案号, MR_No, MRNo, mrNo, MRADM_RowID |
||| 描述关键词 | 病案号, 病案ID, MR号, 病历号, 诊断主索引 |
||| 取值表达式 | `$p(^PAADM(admRowId),"^",61)` |
||| Global | `^PAADM` |
||| 下标路径 | `^PAADM(admRowId)^61 → ^MR(mradm)` |
||| 置信度 | 1.0 |
||| 分类 | 核心标识 |

**说明**：病案号是 ^MR 全局的入口键，从 ^PAADM 就诊记录的 ^61 位获取。PAADM 即 WateNumber（住院流水号）/ admId（门诊流水号）。⚠️ 此值必须在遍历诊断前获取。

```objectscript
s MRADM = $p($g(^PAADM(admRowId)),"^",61)
```

---

### DIA_SUB

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `DIA_SUB` |
||| 匹配模式 | DIA_SUB, diaSub, 诊断序号, 诊断子节点, MRDIA_Childsub, diagSeq, diagnosis_no, sub |
||| 描述关键词 | 诊断序号, 诊断子节点, 诊断序, DIA子节点编号 |
||| 取值表达式 | `sub` |
||| Global | `^MR` |
||| 下标路径 | `(mradm,"DIA",sub)` |
||| 置信度 | 1.0 |
||| 分类 | 核心标识 |

**说明**：^MR(mradm,'DIA') 下的子节点编号，通过 $o() 遍历获取。每个 sub 代表一条独立的诊断记录。

```objectscript
s DIA_SUB = sub  ; 来自 $o(^MR(mradm,"DIA",sub)) 遍历
```

---

### DISE_ID

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `DISE_ID` |
||| 匹配模式 | DISE_ID, Dise_id, diseId, 诊断ID, 诊断标识, diagId, diagnosisNo |
||| 描述关键词 | 诊断标识, 诊断ID, 复合唯一标识 |
||| 取值表达式 | `mradm_"||"_sub` |
||| Global | `组合字段` |
||| 下标路径 | `-` |
||| 置信度 | 1.0 |
||| 分类 | 核心标识 |

**说明**：复合唯一标识，病案号 || 诊断序号（双管道符拼接）。用于下游系统关联定位具体诊断记录。

```objectscript
s diseId = mradm_"||"_sub
```

---

#### 二、ICD 编码与名称（两步查询：先取DR再查字典）

---

### ICD_CODE_DR

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `ICD_CODE_DR` |
||| 匹配模式 | ICD_CODE_DR, icdCodeDr, ICDDr, icdDr, 诊断ICD_DR, MRDIA_ICDCODEDR, icdId, ICD_Dr |
||| 描述关键词 | ICD码RowID, ICD字典引用, 诊断ICD_DR, ICD字典指针 |
||| 取值表达式 | `$p($g(^MR(mradm,"DIA",sub)),"^",1)` |
||| Global | `^MR` |
||| 下标路径 | `(mradm,"DIA",sub)^1` |
||| 置信度 | 1.0 |
||| 分类 | ICD编码 |

**说明**：⚠️ **关键入口字段！** 诊断主串 ^1 位存的是 ICD 码表的 RowID(DR)，指向 ^MRC("ID",DR)。这是后续所有 ICD 相关字段（localDiagCode / diagName / standardDiagCode / tcmBillflag3 等）的**前置依赖**！必须先取此值才能查 ^MRC 字典。

```objectscript
s icdCodeDr = $p($g(^MR(mradm,"DIA",sub)),"^",1)  ; 中间变量★
```

---

### LOCAL_DIAG_CODE

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `LOCAL_DIAG_CODE` |
||| 匹配模式 | LOCAL_DIAG_CODE, localDiagCode, local_diagnosis_code, localDiagnosisCode, 机构内部诊断编码, 本地ICD编码 |
||| 描述关键词 | 机构内部诊断编码, 本地ICD编码, local Diagnosis Code, 内部编码 |
||| 取值表达式 | `$p($g(^MRC("ID",ICD_CODE_DR)),"^",1)` |
||| Global | `^MRC("ID")` |
||| 下标路径 | `(ICD_CODE_DR)^1` |
||| 置信度 | 1.0 |
||| 分类 | ICD编码 |
||| 依赖 | `ICD_CODE_DR` |

**说明**：⚠️⚠️⚠️ 这是**机构内部** ICD 编码，不是标准医保编码！^MRC('ID')^1 存的是本院自定义的 ICD 版本。对接医保时必须用 standardDiagCode(^4) 或 nhsDxCode，而非此字段！

```objectscript
s localDiagCode = $p($g(^MRC("ID",icdCodeDr)),"^",1)
```

---

### DIAG_NAME

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `DIAG_NAME` |
||| 匹配模式 | DIAG_NAME, DiagName, diagName, LOCAL_DIAG_NAME, localDiagnosisName, diagnosis_name, 诊断名称, ICD_DESC, IcdDesc |
||| 描述关键词 | 诊断名称, 诊断描述, 疾病名称, ICD名称, 本地诊断名称 |
||| 取值表达式 | `$p($g(^MRC("ID",ICD_CODE_DR)),"^",2)` |
||| Global | `^MRC("ID") [+ ^MR(..."DES")]` |
||| 下标路径 | `(ICD_CODE_DR)^2` |
||| 置信度 | 1.0 |
||| 分类 | ICD编码 |
||| 依赖 | `ICD_CODE_DR` |

**说明**：从 ICD 码字典 ^MRC('ID',DR)^2 取标准诊断名称。⚠️ 关于 DES 备注拼接：DES 子节点的数据在住院和门诊中都**同样存在**且可正常读取。是否将 DES 拼接到诊断名称中取决于**具体接口程序的实现选择**，而非数据层的限制。推荐默认取 ^MRC^2，如需完整描述再按需拼接 DES（见 diagRemarkDes）。

```objectscript
s diagName = $p($g(^MRC("ID",icdCodeDr)),"^",2)
```

---

### STANDARD_DIAG_CODE

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `STANDARD_DIAG_CODE` |
||| 匹配模式 | STANDARD_DIAG_CODE, standardDiagCode, diagnosis_code, 标准诊断编码, ICD标准编码, standardIcdCode |
||| 描述关键词 | 标准诊断编码, 标准ICD编码, diagnosis_code(标准), 国家标准编码 |
||| 取值表达式 | `$tr($p($g(^MRC("ID",ICD_CODE_DR)),"^",4),$c(34),"")` |
||| Global | `^MRC("ID")` |
||| 下标路径 | `(ICD_CODE_DR)^4` |
||| 置信度 | 1.0 |
||| 分类 | ICD编码 |
||| 依赖 | `ICD_CODE_DR` |

**说明**：**标准 ICD 编码**（区别于 localDiagCode 的机构内部编码）。⚠️ ^4 位置的编码可能包含双引号（如 `"i10"`），表达式已含 `$tr(...,$c(34),"")` 清除。对接国家平台时优先使用此字段。

```objectscript
s standardDiagCode = $tr($p($g(^MRC("ID",icdCodeDr)),"^",4),$c(34),"")  ; ⚠️ 清除可能的双引号
```

---

### STANDARD_DIAG_NAME

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `STANDARD_DIAG_NAME` |
||| 匹配模式 | STANDARD_DIAG_NAME, standardDiagName, 标准诊断名称 |
||| 描述关键词 | 标准诊断名称, 标准ICD名称 |
||| 取值表达式 | `DIAG_NAME` |
||| Global | `= DIAG_NAME (相同值)` |
||| 下标路径 | `-` |
||| 置信度 | 0.95 |
||| 分类 | ICD编码 |
||| 依赖 | `DIAG_NAME` |

**说明**：在此系统中 ^MRC^2 存储的诊断名称本身就是标准名称，无需额外映射。目前与 diagName 共用同一值。但如果未来需要区分（如多语言版本），可能需要独立字段。

```objectscript
s standardDiagName = diagName
```

---

#### 三、诊断属性（类型/主诊标志/备注）

---

### MAIN_DIAG_FLAG

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `MAIN_DIAG_FLAG` |
||| 匹配模式 | MAIN_DIAG_FLAG, maindise_flag, mainFlag, is_main_diag, IS_MAIN, 主诊断标志, mainDiagFlag |
||| 描述关键词 | 主诊断标志, 是否主诊断, mainflag, 主诊 |
||| 取值表达式 | `s mainflag=$p($g(^MR(mradm,"DIA",sub,1)),"^",20)` `s isMainDiag=$case(mainflag,"Y":1,:0)` |
||| Global | `^MR` |
||| 下标路径 | `(mradm,"DIA",sub,1)^20` |
||| 置信度 | 1.0 |
||| 分类 | 诊断属性 |

**说明**：主诊断标志位在 ^MR(...'DIA',sub,**1**) 的 ^20 位置（注意第三下标是数字 1 不是字符串）。Y→1(是主诊), 其他→0(非主诊)。⚠️ 另见 isMainDiagAlt 规则（某些接口方法用不同的转换：非主诊=2 而非 0，这是**接口输出编码差异**，非数据差异）。

```objectscript
s mainflag = $p($g(^MR(mradm,"DIA",sub,1)),"^",20)
s mainDiagFlag = $case(mainflag,"Y":1,:0)
```

---

### IS_MAIN_DIAG_ALT

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `IS_MAIN_DIAG_ALT` |
||| 匹配模式 | IS_MAIN_DIAG_ALT, is_main_diag_02, isMainDiagAlt, 是否主要诊断_02, mainDiagFlag02 |
||| 描述关键词 | 是否主要诊断, 主诊标志(02编码), 非主诊=2 |
||| 取值表达式 | `$case(mainflag,"Y":1,:2) ; ⚠️ 非主诊=2(非0!) 与MAIN_DIAG_FLAG不同!` |
||| Global | `^MR` |
||| 下标路径 | `(mradm,"DIA",sub,1)^20` |
||| 置信度 | 1.0 |
||| 分类 | 诊断属性 |

**说明**：⚠️ **与 mainDiagFlag 转换规则不同——这是接口输出编码层面的差异！** 数据源都是 ^MR(...,1)^20 的同一个 Y/N 值，只是不同下游系统要求的编码规范不同：(1) 01编码体系：Y→1, 其他→**0**（如 WJJXH 住院接口）；(2) 02编码体系：Y→1, 其他→**2**（如 OEMethod 门急诊接口）。**使用前确认目标系统要求的编码体系即可，与数据存储无关。**

```objectscript
s isMainDiagAlt = $case(mainflag,"Y":1,:2)  ; ⚠️ 非主诊=2
```

---

### DIAG_TYPE_DR_TYP

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `DIAG_TYPE_DR_TYP` |
||| 匹配模式 | DIAG_TYPE_DR, diagTypeDr, 诊断类型_DR, diatypedr, DTYP_DR, diagTypDr |
||| 描述关键词 | 诊断类型DR, 诊断类型RowID, DTYP字典引用, 诊断类别ID |
||| 取值表达式 | `$p($g(^MR(mradm,"DIA",sub,"TYP",1)),"^",1)` |
||| Global | `^MR` |
||| 下标路径 | `(mradm,"DIA",sub,"TYP",1)^1` |
||| 置信度 | 1.0 |
||| 分类 | 诊断属性 |

**说明**：诊断类型的 TYP 子节点第1条记录 ^1，存的是 ^MRC('DTYP') 字典 RowID。可区分主诊断/副诊断/入院诊断/出院诊断/中医诊断等细粒度类型。**⭐ TYP 子节点在住院和门诊诊断数据中都存在且结构一致。** 某些旧版门急诊接口（如 OEMethod）因业务简化需求选择了不读取 TYP（改用 billflag3 二分法），但这不代表门诊数据没有 TYP——新的 GetDiagnoses 接口对所有场景都会读取 TYP。开发时根据目标接口要求决定是否使用此字段。

```objectscript
s diagTypeDrTyp = $p($g(^MR(mradm,"DIA",sub,"TYP",1)),"^",1)
```

---

### DIAG_TYPE_DESC_DTYP

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `DIAG_TYPE_DESC_DTYP` |
||| 匹配模式 | DIAG_TYPE_DESC, diagTypeDesc, 诊断类型描述, DTYP描述, diagTypeDescDtyp, 诊断类别名称 |
||| 描述关键词 | 诊断类型描述, 诊断类别文本, ^MRC DTYP, 诊断类型名称 |
||| 取值表达式 | `$p($g(^MRC("DTYP",DIAG_TYPE_DR_TYP)),"^",2)` |
||| Global | `^MRC("DTYP")` |
||| 下标路径 | `(DIAG_TYPE_DR_TYP)^2` |
||| 置信度 | 1.0 |
||| 分类 | 诊断属性 |
||| 依赖 | `DIAG_TYPE_DR_TYP` |

**说明**：从 ^MRC('DTYP') 字典取诊断类型描述文本。常见值：主诊断/副诊断/入院诊断/出院诊断/中医诊断 等。**数据层全场景通用，使用与否取决于接口程序的选择。**

```objectscript
s diagTypeDescDtyp = $p($g(^MRC("DTYP",diagTypeDrTyp)),"^",2)
```

---

### TCM_BILLFLAG3

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `TCM_BILLFLAG3` |
||| 匹配模式 | TCM_DIAG_FLAG, tcmFlag, BILLFLAG3, billflag3, ZYBS, 中医诊断标志, isTcmDiag, diagnosis_type_raw, MRCIDBillFlag3 |
||| 描述关键词 | 中医诊断, 中医标识, TCM, ZYBS, BillFlag3, 中西医原始标志, isTcmDiagnosis |
||| 取值表达式 | `$p($g(^MRC("ID",ICD_CODE_DR)),"^",15) ; 值='Y'=中医, 'N'/空=西医` |
||| Global | `^MRC("ID")` |
||| 下标路径 | `(ICD_CODE_DR)^15` |
||| 置信度 | 1.0 |
||| 分类 | 诊断属性 |
||| 依赖 | `ICD_CODE_DR` |

**说明**：多用途字段！在 ^MRC('ID')^15 位置的值可用于多种用途（由接口程序决定）：(A) 作为中西医二分类依据（N→西医/Y→中医）；(B) 直接映射为诊断类型编码。别名：zYBS / isTcmDiag / billflag3 / tcmFlag / MRCIDBillFlag3。**注意：这不是"门诊专用"字段——它存在于所有诊断记录中，只是不同接口对其用法不同。**

```objectscript
s tcmBillflag3 = $p($g(^MRC("ID",icdCodeDr)),"^",15)  ; Y=中医, N/空=西医
```

---

### DIAG_TYPE_TCM_SIMPLE

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `DIAG_TYPE_TCM_SIMPLE` |
||| 匹配模式 | DIAG_TYPE_SIMPLE, diagnosis_type, diagTypeSimple, 中西医诊断类型, 西医中医分类, simplifiedDiagType |
||| 描述关键词 | 诊断类型(简化), 西医/中医诊断, diagnosis_type, 中西医分类 |
||| 取值表达式 | `$case(TCM_BILLFLAG3,"N":1,:2) ; → 1=西医诊断, 2=中医诊断` |
||| Global | `间接(来自 ^MRC('ID')^15)` |
||| 下标路径 | `-` |
||| 置信度 | 1.0 |
||| 分类 | 诊断属性 |
||| 依赖 | `TCM_BILLFLAG3` |

**说明**：基于 ICD 字典 ^15 的 billflag3 做的二分类简化编码：N→1(西医诊断)，其他(Y/空)→2(中医诊断)。**这是某些接口方法（如 OEMethod）选择的简化编码方式，用于在不查询 TYP 子节点的情况下快速区分中西医。它与 diagTypeDrTyp（细粒度 TYP 字典分类）是两种不同粒度的分类方案，可在同一个数据上同时存在——选用哪种取决于目标接口的要求，而非数据限制。**

```objectscript
s diagTypeTcmSimple = $case(tcmBillflag3,"N":1,:2)  ; 1=西医, 2=中医
```

---

### DIAG_REMARK_DES

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `DIAG_REMARK_DES` |
||| 匹配模式 | DIAG_REMARK, diagRemark, TheRemark, 诊断备注, mrdesc, 医生备注, DES, remark, diagRemarkDes |
||| 描述关键词 | 诊断备注, 医生备注, 诊断描述补充, DES多行文本, 医生填写备注 |
||| 取值表达式 | `s mrdesc="" f de=1:1:$g(^MR(mradm,"DIA",sub,"DES",0)) d ..s mrdesc=mrdesc_$g(^MR(mradm,"DIA",sub,"DES",de))` |
||| Global | `^MR` |
||| 下标路径 | `(mradm,"DIA",sub,"DES",de)` |
||| 置信度 | 1.0 |
||| 分类 | 诊断属性 |

**说明**：医生写在备注里的详细描述。结构：^MR('DIA',sub,'DES',0)=总行数, 'DES',1~n=每行文本。**⭐ DES 子节点在住院和门诊诊断数据中都同样存在且可正常读取。** 是否将 DES 拼接到最终输出取决于接口程序的选择：（1）WJJXH 等住院接口通常会拼接 DES 到诊断名称；（2）OEMethod 等旧版门诊接口可能选择不拼接（只输出字典名称），但这纯粹是实现选择，不是数据缺失。新接口 GetDiagnoses 对所有场景均可读取 DES。

```objectscript
s mrdesc=""
f de=1:1:$g(^MR(mradm,"DIA",sub,"DES",0)) d
|. s mrdesc=mrdesc_$g(^MR(mradm,"DIA",sub,"DES",de))
s diagRemarkDes = mrdesc
```

---

#### 四、时间戳

---

### DIAG_DATE

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `DIAG_DATE` |
||| 匹配模式 | DIAG_DATE, diagDate, ZDSJ, zdsj, 诊断日期, 确诊日期, icddate, diagDate, diagnosisDate |
||| 描述关键词 | 诊断日期, 确诊日期, ICD日期, 诊断开立日期 |
||| 取值表达式 | `$zd($p($g(^MR(mradm,"DIA",diagId)),"^",14),3)` |
||| Global | `^MR` |
||| 下标路径 | `(mradm,"DIA",sub)^7` |
||| 置信度 | 1.0 |
||| 分类 | 时间戳 |

**说明**：诊断日期在诊断主串 ^7 位置。存储 Cache $H 日期格式，输出时需 $zd(value,3) 格式化为 YYYY-MM-DD。

```objectscript
s rawDate = $p($g(^MR(mradm,"DIA",sub)),"^",7")
s diagDate = $zd(rawDate,3)
```

---

### DIAG_TIME

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `DIAG_TIME` |
||| 匹配模式 | DIAG_TIME, diagTime, 诊断时间, 确诊时间, icdtime, diagTime, diagnosisTime |
||| 描述关键词 | 诊断时间, 确诊时间 |
||| 取值表达式 | `$zt($p($g(^MR(mradm,"DIA",diagId)),"^",15),1)` |
||| Global | `^MR` |
||| 下标路径 | `(mradm,"DIA",sub)^8` |
||| 置信度 | 1.0 |
||| 分类 | 时间戳 |

**说明**：诊断时间在诊断主串 ^8 位置。与 ^7(日期)分离存储！Cache $H 时间格式，输出时需 $zt(value,1) 格式化。

```objectscript
s rawTime = $p($g(^MR(mradm,"DIA",sub)),"^",8")
s diagTime = $zt(rawTime,1)
```

---

### DIAG_DATETIME

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `DIAG_DATETIME` |
||| 匹配模式 | DIAG_DATETIME, diagDateTime, DiagTime, diagAuthoredTime, 诊断时间完整, 诊断日期时间, 诊断开立时间, fullDiagDatetime |
||| 描述关键词 | 诊断日期时间, 完整诊断时间, 开立时间, 完整时间戳 |
||| 取值表达式 | `$zd(diagDate,3)_" "_$zt(diagTime,1) ; YYYY-MM-DD HH:MM:SS` |
||| Global | `组合字段(derived from DIAG_DATE + DIAG_TIME)` |
||| 下标路径 | `-` |
||| 置信度 | 1.0 |
||| 分类 | 时间戳 |
||| 依赖 | `DIAG_DATE, DIAG_TIME` |

**说明**：完整诊断时间戳，由日期和时间拼接而成。输出格式 YYYY-MM-DD HH:MM:SS。

```objectscript
s diagDatetime = $zd(diagDate,3)_" "_$zt(diagTime,1)
```

---

#### 五、医保映射（国家医保平台对接专用）

---

### NHS_DX_CODE

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `NHS_DX_CODE` |
||| 匹配模式 | NHS_DX_CODE, nhs_dx_code, nhsDxCode, 国家医保诊断编码, 医保ICD编码, 医保诊断代码, nhsDxCode, ybIcdCode |
||| 描述关键词 | 国家医保诊断编码, NHS诊断编码, 医保ICD, 医保对照码, 国家标准编码 |
||| 取值表达式 | `s insuConDr=$o(^DHCINICT("0","MRCICDID",ICD_CODE_DR,""),-1) i insuConDr'="" s nhsDxCode=$p(^DHCINICT(insuConDr),"^",5)` |
||| Global | `^DHCINICT` |
||| 下标路径 | `("0","MRCICDID",ICD_CODE_DR,"") 索引 → insuConDr → ^5` |
||| 置信度 | 1.0 |
||| 分类 | 医保映射 |
||| 依赖 | `ICD_CODE_DR` |

**说明**：⚠️⚠️⚠️ **全新Global! 完整数据链路：**
Step1: `^DHCINICT('0','MRCICDID',icdDr,'')` — 以 ICD 的 RowID 为键建索引，取最后一条 $o(...,-1)（最近一次匹配的医保对照）
Step2: `^DHCINICT(insuConDr)^5` = **国家医保标准诊断编码**
这是**医保上传必需字段！** 旧版接口可能完全没有此链路，属于智慧健康新增需求。

```objectscript
; 两步取值
s insuConDr = $o(^DHCINICT("0","MRCICDID",icdCodeDr,""),-1)
s nhsDxCode = ""
|i insuConDr'="" s nhsDxCode = $p(^DHCINICT(insuConDr),"^",5)
```

---

### NHS_DX_NAME

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `NHS_DX_NAME` |
||| 匹配模式 | NHS_DX_NAME, nhs_dx_name, nhsDxName, 国家医保诊断名称, 医保ICD名称, 医保诊断名称, nhsDxName, ybIcdName |
||| 描述关键词 | 国家医保诊断名称, NHS诊断名称, 医保ICD名称, 国家标准名称 |
||| 取值表达式 | `$s(insuConDr'="":$p(^DHCINICT(insuConDr),"^",6),1:"")` |
||| Global | `^DHCINICT` |
||| 下标路径 | `(insuConDr)^6` |
||| 置信度 | 1.0 |
||| 分类 | 医保映射 |
||| 依赖 | `NHS_DX_CODE` |

**说明**：国家医保标准诊断名称。与 nhsDxCode 配对，来自同一个 ^DHCINICT(insuConDr) 记录。^5=编码, ^6=名称。当医院内部 ICD 与国家标准不同时，此字段提供映射后的标准名称用于医保上报。

```objectscript
s nhsDxName = ""
|i insuConDr'="" s nhsDxName = $p(^DHCINICT(insuConDr),"^",6)
```

---

#### 六、上下文信息

---

### ORG_CODE

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `ORG_CODE` |
||| 匹配模式 | ORG_CODE, OrgCode, organiz_code, 机构代码, 医疗机构编码, organizCode, hospitalCode |
||| 描述关键词 | 机构代码, 医院代码, OrgCode, 组织编码, 医疗机构标识 |
||| 取值表达式 | `..#OrganizCode  ; Parameter引用, 或 UtilMethod.GetPublicDataForHosp(hospId).Data("organiz_code")` |
||| Global | `-` |
||| 下标路径 | `-` |
||| 置信度 | 0.99 |
||| 分类 | 上下文信息 |

**说明**：机构代码的两种获取方式：(1) Parameter 引用（推荐）：`..#OrganizCode`；(2) 动态查询：`UtilMethod.GetPublicDataForHosp(院区ID).Data('organiz_code')`。结果相同，Parameter 方式性能更优。

```objectscript
s orgCode = ..#OrganizCode  ; Parameter引用方式（推荐）
```

---

### ADMISSION_NO

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `ADMISSION_NO` |
||| 匹配模式 | ADMISSION_NO, adm_no, WateNumber, wateNumber, 住院流水号, 就诊流水号, ZYLSH, PAADM, admId, admissionNo |
||| 描述关键词 | 住院流水号, 就诊流水号, WateNumber, admNo, PAADM, admId, 就诊号 |
||| 取值表达式 | `admRowId` |
||| Global | `-` (输入参数) |
||| 下标路径 | `-` |
||| 置信度 | 1.0 |
||| 分类 | 上下文信息 |

**说明**：就诊/住院流水号。物理含义都是 PAADM RowID。住院场景：来自 XML 输入 `<WateNumber>` 参数；门急诊：来自 ^PAADMi 索引遍历得到的 admId 变量。

```objectscript
s admissionNo = PAADM  ; 住院: WateNumber参数 / 门急诊: admId遍历变量
```

---

### REPORT_DATETIME

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `REPORT_DATETIME` |
||| 匹配模式 | REPORT_DATETIME, report_datetime, reportDatetime, 数据上报时间, 上报时间, exportTime, reportTs |
||| 描述关键词 | 数据上报时间, 报告时间戳, reportDatetime, 导出时间, 数据生成时间 |
||| 取值表达式 | `$zdt($h,3,1)` |
||| Global | `无(当前时间$h)` |
||| 下标路径 | `-` |
||| 置信度 | 1.0 |
||| 分类 | 上下文信息 |

**说明**：数据上报/导出时间戳，取当前服务器时间。所有接口的通用输出字段，表示"这批数据是什么时候生成的"。功能等价于 `DateLogicalToHtml($p($h,",",1))_" "_TimeLogicalToHtml($p($h,",",2))`。

```objectscript
s reportDatetime = $zdt($h,3,1)
```

---

### DIAG_COUNT_TOTAL

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `DIAG_COUNT_TOTAL` |
||| 匹配模式 | DIAG_COUNT, diagCount, 诊断总数, 诊断记录数, totalDiagCount, diagnosisCount |
||| 描述关键词 | 诊断数量, 诊断总数, 诊断记录数, 诊断条数 |
||| 取值表达式 | `$o(^MR(mradm,"DIA",""),-1) ; 最后一个有效DIA编号 ≈ 总数` |
||| Global | `^MR` |
||| 下标路径 | `(mradm,"DIA")` |
||| 置信度 | 0.9 |
||| 分类 | 上下文信息 |

**说明**：诊断记录总数。通过 $o 倒数获取最大 DIA 编号近似总数（前提是 sub 连续递增）。两个来源均通过 $o 遍历统计，未显式存储总数。

```objectscript
s diagCountTotal = $o(^MR(mradm,"DIA",""),-1)
```

---

#### 七、扩展字段（v3.1.0 新增 — 来源于 User.MRDiagnos 80属性中的补充字段）

> **数据来源**：以下9个字段均来自 IRIS 生产环境 `User.MRDiagnos.cls` 实体类的 Storage 定义，通过 `iris_doc(mode="get")` 获取源码后交叉验证确认。这些字段存在于 ^MR 全局的主串(^2~^11)、扩展位(sub,1^28)和 EPR 子节点中，但在 v3.0.0 中未被收录。**所有字段住院/门诊通用。**

---

### DOC_CODE_DR

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `DOC_CODE_DR` |
||| 匹配模式 | DOC_CODE_DR, docCodeDr, DocCode_DR, MRDIA_DocCode_DR, 诊断医生DR, docDr, 下诊断医生 |
||| 描述关键词 | 下诊断医生, 诊断医生DR, 开立医生, DocCode, 医生编码 |
||| 取值表达式 | `$p($g(^MR(mradm,"DIA",sub)),"^",4)` |
||| Global | `^MR` |
||| 下标路径 | `(mradm,"DIA",sub)^4` |
||| 置信度 | 1.0 |
||| 分类 | 扩展字段 |

**说明**：下诊断医生的 RowID(DR)，指向 ^CTPCP 用户/医生字典。⚠️ 此值为 DR 引用而非姓名！需二次查询 ^CTPCP(docDr)^2 获取医生姓名（见 docName）。Property 对应：`MRDIA_DocCode_DR`。

```objectscript
s docCodeDr = $p($g(^MR(mradm,"DIA",sub)),"^",4)
```

---

### DOC_NAME

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `DOC_NAME` |
||| 匹配模式 | DOC_NAME, docName, DocName, 诊断医生姓名, doctorName, 医生名称 |
||| 描述关键词 | 诊断医生姓名, 医生名字, 开立医生姓名 |
||| 取值表达式 | `$p($g(^CTPCP(DOC_CODE_DR)),"^",2)` |
||| Global | `^CTPCP` |
||| 下标路径 | `(DOC_CODE_DR)^2` |
||| 置信度 | 1.0 |
||| 分类 | 扩展字段 |
||| 依赖 | `DOC_CODE_DR` |

**说明**：从 ^CTPCP 医生/用户字典取医生姓名。⚠️ 必须先取 docCodeDr（^4位）才能查此字段。^CTPCP ^2=姓名, ^1=编码, ^3=拼音码。

```objectscript
s docName = ""
s docDr = $p($g(^MR(mradm,"DIA",sub)),"^",4)
|i docDr'="" s docName = $p($g(^CTPCP(docDr)),"^",2)
```

---

### DATE_DETECT

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `DATE_DETECT` |
||| 匹配模式 | DATE_DETECT, dateDetect, DateDetect, MRDIA_DateDetect, 发现日期, detectDate |
||| 描述关键词 | 发现日期, 检出日期, DateDetect, 初次发现时间 |
||| 取值表达式 | `$p($g(^MR(mradm,"DIA",sub)),"^",5) ; $H格式→$zd(,3)=YYYY-MM-DD` |
||| Global | `^MR` |
||| 下标路径 | `(mradm,"DIA",sub)^5` |
||| 置信度 | 1.0 |
||| 分类 | 扩展字段 |

**说明**：诊断发现/检出日期，存储在主串 ^5 位置。Cache $H 日期格式，输出时需 $zd 格式化。与 diagDate(^7,诊断开立日期) 不同——dateDetect 是初次发现的时间，diagDate 是正式确诊/开立诊断的时间。

```objectscript
s dateDetect = $zd($p($g(^MR(mradm,"DIA",sub)),"^",5),3)
```

---

### WORK_RELATED

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `WORK_RELATED` |
||| 匹配模式 | WORK_RELATED, workRelated, WorkRelated, MRDIA_WorkRelated, 工伤标志, gsFlag, isWorkRelated |
||| 描述关键词 | 工伤标志, 工伤关联, 是否职业病, WorkRelated, 工伤标识 |
||| 取值表达式 | `$p($g(^MR(mradm,"DIA",sub)),"^",6) ; 值='Y'=工伤, 'N'/空=非工伤` |
||| Global | `^MR` |
||| 下标路径 | `(mradm,"DIA",sub)^6` |
||| 置信度 | 1.0 |
||| 分类 | 扩展字段 |

**说明**：工伤/职业病标志位。Y=该诊断属于工伤或职业病相关，N/空=普通疾病。主要用于工伤保险结算和职业病上报场景。Property 对应：`MRDIA_WorkRelated`。

```objectscript
s workRelated = $p($g(^MR(mradm,"DIA",sub)),"^",6)  ; Y=工伤, N/空=非工伤
```

---

### DIAG_STAT_DR

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `DIAG_STAT_DR` |
||| 匹配模式 | DIAG_STAT_DR, diagStatDr, DiagStat_DR, MRDIA_DiagStat_DR, 诊断状态DR, diagStatusDr |
||| 描述关键词 | 诊断状态DR, 诊断状态编码, 诊断状态RowID, DiagStat |
||| 取值表达式 | `$p($g(^MR(mradm,"DIA",sub)),"^",9)` |
||| Global | `^MR` |
||| 下标路径 | `(mradm,"DIA",sub)^9` |
||| 置信度 | 1.0 |
||| 分类 | 扩展字段 |

**说明**：诊断状态的 RowID(DR)引用，指向诊断状态字典。⚠️ 此值为 DR 引用！具体含义需查对应字典（可能指向 ^MRC 或自定义字典表）。常见值可能包括：疑似/确诊/治愈/好转/死亡 等（以实际字典为准）。Property 对应：`MRDIA_DiagStat_DR`。

```objectscript
s diagStatDr = $p($g(^MR(mradm,"DIA",sub)),"^",9")
```

---

### SIGN_SYM_DR

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `SIGN_SYM_DR` |
||| 匹配模式 | SIGN_SYM_DR, signSymDr, SignSym_DR, MRDIA_SignSym_DR, 体征症状DR, signSymptomDr |
||| 描述关键词 | 体征症状DR, 体征症状编码, SignSym, 体征症状RowID |
||| 取值表达式 | `$p($g(^MR(mradm,"DIA",sub)),"^",10)` |
||| Global | `^MR` |
||| 下标路径 | `(mradm,"DIA",sub)^10` |
||| 置信度 | 1.0 |
||| 分类 | 扩展字段 |

**说明**：体征/症状的 RowID(DR)，指向体征症状字典。⚠️ DR 引用，需二次查字典获取具体文本。用于记录做出诊断所依据的主要临床表现。Property 对应：`MRDIA_SignSym_DR`。

```objectscript
s signSymDr = $p($g(^MR(mradm,"DIA",sub)),"^",10")
```

---

### DRG_ORDER

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `DRG_ORDER` |
||| 匹配模式 | DRG_ORDER, drgOrder, DrgOrder, MRDIA_DRGOrder, DRG排序号, drgSeq, drgSequence |
||| 描述关键词 | DRG排序号, DRG顺序, DRG分组序号, DrgOrder, 诊断DRG权重排序 |
||| 取值表达式 | `$p($g(^MR(mradm,"DIA",sub)),"^",11)` |
||| Global | `^MR` |
||| 下标路径 | `(mradm,"DIA",sub)^11` |
||| 置信度 | 1.0 |
||| 分类 | 扩展字段 |

**说明**：dRG(诊断相关分组)排序号/优先级整数。数值越小优先级越高，用于 dRG 分组时确定主诊断和并发症的权重顺序。Property 对应：`MRDIA_DRGOrder`。

```objectscript
s drgOrder = $p($g(^MR(mradm,"DIA",sub)),"^",11")
```

---

### INSU_MAIN_DIAG_FLAG

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `INSU_MAIN_DIAG_FLAG` |
||| 匹配模式 | INSU_MAIN_DIAG_FLAG, insuMainDiagFlag, InsuMainDiagFlag, MRDIA_InsuMainDiagFlag, 医保主诊标识, ybMainFlag |
||| 描述关键词 | 医保结算主诊标识, 医保主诊断标志, InsuMainDiagFlag, 医保端主诊标记 |
||| 取值表达式 | `$p($g(^MR(mradm,"DIA",sub,1)),"^",28)` |
||| Global | `^MR` |
||| 下标路径 | `(mradm,"DIA",sub,1)^28` |
||| 置信度 | 1.0 |
||| 分类 | 扩展字段 |

**说明**：⚠️ **医保专用主诊标识！** 位于第三下标(sub,1)的 ^28 位，与 mainDiagFlag(^20,通用主诊标志) 是**不同维度**的主诊标记：mainDiagFlag 用于院内/HIS业务逻辑；insuMainDiagFlag 专用于医保结算/DRG付费场景。两者可能不一致（例如院内主诊≠医保结算主诊）。Property 对应：`MRDIA_InsuMainDiagFlag`。

```objectscript
s insuMainDiagFlag = $p($g(^MR(mradm,"DIA",sub,1)),"^",28")
```

---

### SEQUENCE

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `SEQUENCE` |
||| 匹配模式 | SEQUENCE, sequence, MRDIA_Sequence, EPR诊断序号, eprSeq, eprSequence, 诊断序号_EPR |
||| 描述关键词 | EPR诊断序号, EPR Sequence, 电子病历诊断顺序, epr序列号 |
||| 取值表达式 | `$g(^MR(mradm,"DIA",sub,"EPR"))` → Piece 2 (即 `$p(...,"^",2)`) |
||| Global | `^MR` |
||| 下标路径 | `(mradm,"DIA",sub,"EPR")^2` |
||| 置信度 | 0.95 |
||| 分类 | 扩展字段 |

**说明**：EPR(电子病历)子系统使用的诊断序号。存储在 `"EPR"` 子节点中，Piece=2。⚠️ 与 DIA_SUB 不同——DIA_SUB 是 ^MR 全局的原生子节点编号，SEQUENCE 是 EPR 系统赋予的业务序号。两者通常一致但并非绝对。Property 对应：`MRDIA_Sequence`。

```objectscript
s SEQUENCE = $p($g(^MR(mradm,"DIA",sub,"EPR")),"^",2")
```

---

### LEVEL

||| 属性 | 值 |
|||------|-----|
||| 标准名 | `LEVEL` |
||| 匹配模式 | LEVEL, level, MRDIA_Level, EPR诊断级别, eprLevel, 诊断级别, diagLevel |
||| 描述关键词 | EPR诊断级别, 诊断级别, Level, 电子病历诊断等级, 可疑/确诊等级 |
||| 取值表达式 | `$g(^MR(mradm,"DIA",sub,"EPR"))` → Piece 1 (即 `$p(...,"^",1)`) |
||| Global | `^MR` |
||| 下标路径 | `(mradm,"DIA",sub,"EPR")^1` |
||| 置信度 | 0.95 |
||| 分类 | 扩展字段 |

**说明**：EPR(电子病历)子系统的诊断级别/确信度等级。存储在 `"EPR"` 子节点中，Piece=1。可能值视 EPR 系统定义（如：1=确定, 2=疑似, 3=待排查 等）。与 SEQUENCE 配对使用，同属 EPR 子节点的两个字段。Property 对应：`MRDIA_Level`。

```objectscript
s LEVEL = $p($g(^MR(mradm,"DIA",sub,"EPR")),"^",1")
```

---

## 常用遍历方式

#### 标准诊断遍历（最常用 — 含v3.1.0全部字段，住院/门诊通用）

```objectscript
; === 前置：已获取 mradm(病案号) ===
; === 注意: 此遍历模板同时适用于住院和门诊诊断！===
s sub="" f  s sub=$o(^MR(mradm,"DIA",sub)) q:sub=""  d
|. s icdDr = $p($g(^MR(mradm,"DIA",sub)),"^",1)
|. q:icdDr=""  ; 跳过空记录
|.
|. ; --- ICD 信息 ---
|. s localCode = $p($g(^MRC("ID",icdDr)),"^",1)
|. s diagName = $p($g(^MRC("ID",icdDr)),"^",2)
|. s stdCode = $tr($p($g(^MRC("ID",icdDr)),"^",4),'"','')
|. s billflag3 = $p($g(^MRC("ID",icdDr)),"^",15)
|.
|. ; --- 诊断属性 ---
|. s mainflag = $p($g(^MR(mradm,"DIA",sub,1)),"^",20)
|. s isMain = $case(mainflag,"Y":1,:0)
|.
|. ; --- 扩展字段: 医生 ---
|. s docDr = $p($g(^MR(mradm,"DIA",sub)),"^",4)
|. s docName = $s(docDr'="":$p($g(^CTPCP(docDr)),"^",2),1:"")
|.
|. ; --- 扩展字段: 发现日期/工伤/状态/体征/dRG ---
|. s dateDetect = $zd($p($g(^MR(mradm,"DIA",sub)),"^",5),3)
|. s workRelated = $p($g(^MR(mradm,"DIA",sub)),"^",6")
|. s diagStatDr = $p($g(^MR(mradm,"DIA",sub)),"^",9")
|. s signSymDr = $p($g(^MR(mradm,"DIA",sub)),"^",10")
|. s drgOrder = $p($g(^MR(mradm,"DIA",sub)),"^",11")
|.
|. ; --- 扩展字段: 医保主诊 + EPR ---
|. s insuMainFlag = $p($g(^MR(mradm,"DIA",sub,1)),"^",28")
|. s eprLevel = $p($g(^MR(mradm,"DIA",sub,"EPR")),"^",1")
|. s eprSeq = $p($g(^MR(mradm,"DIA",sub,"EPR")),"^",2")
|.
|. ; --- 时间戳 ---
|. s diagDate = $zd($p($g(^MR(mradm,"DIA",sub)),"^",7),3)
|. s diagTime = $zt($p($g(^MR(mradm,"DIA",sub)),"^",8),1)
|.
|. ; --- 诊断类型(TYP子节点 — 数据存在,按需读取) ---
|. s typDr = $p($g(^MR(mradm,"DIA",sub,"TYP",1)),"^",1)
|. s typDesc = $s(typDr'="":$p($g(^MRC("DTYP",typDr)),"^",2),1:"")
|.
|. ; --- 医保映射(可选) ---
|. s insuConDr = $o(^DHCINICT("0","MRCICDID",icdDr,""),-1)
|. s nhsCode = $s(insuConDr'="":$p(^DHCINICT(insuConDr),"^",5),1:"")
|.
|. ; --- 输出 ---
|. s diseId = mradm_"||"_sub
|. ; ... 组装输出
```

#### 完整诊断遍历（含 TYP + DES + 全量扩展字段）

```objectscript
; === 完整遍历: 含诊断类型(TYP) + 医生备注(DES) + v3.1.0全量 ===
; === 适用: 住院 & 门诊 (数据结构完全一致) ===
s sub="" f  s sub=$o(^MR(mradm,"DIA",sub)) q:sub=""  d
|. s icdDr = $p($g(^MR(mradm,"DIA",sub)),"^",1)
|. q:icdDr=""
|.
|. ; 诊断类型(TYP子节点 — 数据存在,按需使用)
|. s typDr = $p($g(^MR(mradm,"DIA",sub,"TYP",1)),"^",1)
|. s typDesc = ""
|. i typDr'="" s typDesc = $p($g(^MRC("DTYP",typDr)),"^",2)
|.
|. ; 医生备注(DES子节点 — 数据存在,按需拼接)
|. s desText = ""
|. s desCnt = $g(^MR(mradm,"DIA",sub,"DES",0))
|. f di=1:1:desCnt d
|. . s desText = desText_$g(^MR(mradm,"DIA",sub,"DES",di))
|.
|. ; 下诊断医生
|. s docDr = $p($g(^MR(mradm,"DIA",sub)),"^",4)
|. s docName = $s(docDr'="":$p($g(^CTPCP(docDr)),"^",2),1:"")
|.
|. ; 发现日期 / 工伤 / DRG排序
|. s dateDet = $zd($p($g(^MR(mradm,"DIA",sub)),"^",5),3)
|. s workRel = $p($g(^MR(mradm,"DIA",sub)),"^",6")
|. s drgOrd = $p($g(^MR(mradm,"DIA",sub)),"^",11")
|.
|. ; 完整诊断名称 = 字典名称 + 备注(可选拼接)
|. s fullDiagName = $p($g(^MRC("ID",icdDr)),"^",2)
|. i desText'="" s fullDiagName = fullDiagName_"("_desText_")"
|.
|. ; ... 后续同上
```

## 踩坑提示

### ⚠️ ^MR 第三下标是数字不是字符串

诊断的主诊标志存在 `^MR(mradm,"DIA",sub,1)` —— 注意第三个下标是**数字 1**，不是字符串 "1"！这是 IRIS Global 的数字下标和字符串下标的区别，取错会导致取到 null。同样适用于 insuMainDiagFlag(^28)。

### ⚠️ LOCAL_DIAG_CODE ≠ STANDARD_DIAG_CODE

两个字段都来自 ^MRC("ID",icdDr)，但位置不同：
- ^1 = **本院内部** ICD 编码（可能与国际标准不一致）
- ^4 = **国家标准** ICD 编码（对接医保/国家平台必须用这个）

⚠️ ^4 可能包含双引号包裹（如 `"i10"`），务必 `$tr(...,'"','')` 清除。

### ⚠️ ⭐⭐ 数据层统一！住院/门诊诊断结构完全相同

**这是最重要的认知纠正：**

```
❌ 错误认知: "TYP/DES 只有住院才有" / "门诊诊断表结构不同"
✅ 正确理解: User.MRDiagnos 是唯一的诊断明细表, 住院和门诊共用
            ^MR(mradm,"DIA",sub) 的11位主串 + TYP + DES + EPR 全场景一致
            所谓"差异"只是不同接口程序选择读哪些字段/用什么编码输出
```

**实际差异对照（接口层，非数据层）：**

||| 维度 | WJJXH(住院接口常见做法) | OEMethod(门诊接口常见做法) | 数据层实际情况 |
|||------|----------------------|--------------------------|-------------|
||| 诊断类型 | 读 TYP → ^MRC("DTYP") 细粒度 | 可选: 用 billflag3 二分法 | **TYP 数据两者都有** ||
||| 主诊编码 | Y→1, 其他→**0** (01编码) | Y→1, 其他→**2** (02编码) | **^20 存的都是 Y/N，一样** ||
||| DES备注 | 通常拼接到诊断名称 | 可能不拼接 | **DES 数据两者都有** ||

**结论：写新代码时无需考虑"住院还是门诊"——取值表达式完全一样。只需关注目标接口的输出编码规范。**

### ⚠️ MAIN_DIAG_FLAG ≠ INSU_MAIN_DIAG_FLAG（两个维度的主诊）

两个"主诊标志"位于同一第三下标(sub,1)但不同位置：
- `^20` = mainDiagFlag：**院内/HIS业务主诊**（通用场景）
- `^28` = insuMainDiagFlag：**医保结算主诊**（DRG付费场景）

⚠️ 两者可以不同！例如某患者的院内主诊是"急性心梗"，但医保结算主诊可能被调整为"冠心病"以满足DRG分组规则。使用时务必根据目标场景选择正确的字段。

### ⚠️ NHS_DX_CODE 需要 ^DHCINICT 新 Global

这是**智慧健康新增**的医保对照链路，旧版接口可能没有部署。如果目标环境没有 ^DHCINICT 表，此字段将始终为空。使用前需确认环境支持。

### ⚠️ DISE_ID 是双管道符 || 拼接

不是单管道符 `^`，也不是下划线 `_`，是双管道符 `||`：`mradm_"||"_sub`。下游系统按此格式解析。

### ⚠️ DOC_CODE_DR 需二次查 ^CTPCP

^4 位存的是医生 RowID(DR)，不是姓名字符串！必须再查 `^CTPCP(docDr)^2` 才能获取医生姓名。不要把 DR 值当姓名用。

## 别名映射表

||| 标准名 | 别名列表 |
|||--------|----------|
||| `MRADM` | mradm, 病案号, MR_No, MRNo, MR号, MRADM_RowID |
||| `DIA_SUB` | diaSub, 诊断序号, 诊断子节点, MRDIA_Childsub, diagSeq, sub |
||| `DISE_ID` | Dise_id, diseId, 诊断ID, diagId, diagnosisNo |
||| `ICD_CODE_DR` | icdCodeDr, ICDDr, icdDr, icdId, ICD_Dr, MRDIA_ICDCODEDR |
||| `LOCAL_DIAG_CODE` | localDiagCode, local_diagnosis_code, 机构内部诊断编码, 本地ICD |
||| `DIAG_NAME` | DiagName, diagName, LOCAL_DIAG_NAME, localDiagnosisName, ICD_DESC, IcdDesc |
||| `STANDARD_DIAG_CODE` | standardDiagCode, diagnosis_code, 标准ICD编码, standardIcdCode |
||| `MAIN_DIAG_FLAG` | maindise_flag, mainFlag, is_main_diag, 主诊断标志, IS_MAIN |
||| `TCM_BILLFLAG3` | tcmFlag, BILLFLAG3, ZYBS, isTcmDiag, MRCIDBillFlag3 |
||| `DIAG_DATE` | diagDate, ZDSJ, zdsj, 诊断日期, 确认日期, icddate |
||| `DIAG_TIME` | diagTime, 诊断时间, 确认时间, icdtime |
||| `NHS_DX_CODE` | nhs_dx_code, nhsDxCode, 国家医保诊断编码, 医保ICD, ybIcdCode |
||| `NHS_DX_NAME` | nhs_dx_name, nhsDxName, 国家医保诊断名称, ybIcdName |
||| `ADMISSION_NO` | WateNumber, wateNumber, 住院流水号, ZYLSH, PAADM, admId, adm_no |
||| `ORG_CODE` | OrgCode, organiz_code, 机构代码, hospitalCode |
||| `DOC_CODE_DR` | docCodeDr, DocCode_DR, MRDIA_DocCode_DR, 诊断医生DR, docDr, 下诊断医生 |
||| `DOC_NAME` | docName, DocName, 诊断医生姓名, doctorName, 医生名称 |
||| `DATE_DETECT` | dateDetect, DateDetect, MRDIA_DateDetect, 发现日期, detectDate |
||| `WORK_RELATED` | workRelated, WorkRelated, MRDIA_WorkRelated, 工伤标志, gsFlag, isWorkRelated |
||| `DIAG_STAT_DR` | diagStatDr, DiagStat_DR, MRDIA_DiagStat_DR, 诊断状态DR, diagStatusDr |
||| `SIGN_SYM_DR` | signSymDr, SignSym_DR, MRDIA_SignSym_DR, 体征症状DR, signSymptomDr |
||| `DRG_ORDER` | drgOrder, DrgOrder, MRDIA_DRGOrder, DRG排序号, drgSeq, drgSequence |
||| `INSU_MAIN_DIAG_FLAG` | insuMainDiagFlag, InsuMainDiagFlag, MRDIA_InsuMainDiagFlag, 医保主诊标识, ybMainFlag |
||| `SEQUENCE` | sequence, MRDIA_Sequence, EPR诊断序号, eprSeq, eprSequence |
||| `LEVEL` | level, MRDIA_Level, EPR诊断级别, eprLevel, 诊断级别, diagLevel |

## 规则统计

||| 分类 | 规则数(v3.0.0) | 规则数(v3.2.0) | 说明 |
|||------|--------|--------|------|
||| 核心标识 | 3 | 3 | MRADM / DIA_SUB / DISE_ID |
||| ICD编码 | 5 | 5 | ICD_CODE_DR / LOCAL_DIAG_CODE / DIAG_NAME / STANDARD_DIAG_CODE / STANDARD_DIAG_NAME |
||| 诊断属性 | 7 | 7 | MAIN_DIAG_FLAG / IS_MAIN_DIAG_ALT / DIAG_TYPE_DR_TYP / DIAG_TYPE_DESC_DTYP / TCM_BILLFLAG3 / DIAG_TYPE_TCM_SIMPLE / DIAG_REMARK_DES |
||| 时间戳 | 3 | 3 | DIAG_DATE / DIAG_TIME / DIAG_DATETIME |
||| 医保映射 | 2 | 2 | NHS_DX_CODE / NHS_DX_NAME |
||| 上下文信息 | 4 | 4 | ORG_CODE / ADMISSION_NO / REPORT_DATETIME / DIAG_COUNT_TOTAL |
||| **扩展字段** | **0** | **9** | **DOC_CODE_DR / DOC_NAME / DATE_DETECT / WORK_RELATED / DIAG_STAT_DR / SIGN_SYM_DR / DRG_ORDER / INSU_MAIN_DIAG_FLAG / SEQUENCE / LEVEL** |
||| **合计** | **24** | **33** | **v3.1.0+9 / v3.2.0 修正住院门诊差异表述** |

---
