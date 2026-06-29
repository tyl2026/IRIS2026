---
domain: "20-visit"
name: "就诊/入院域(完整版)"
version: "2.3.0"
description: "就诊全部信息，核心Global: ^PAADM(Pa_Adm)。含科室/病区/房间/床位/医生/诊断/费用/分类等"

# 实体表类（数据存储结构来源）
entityClasses:
  - name: "User.PAAdm"
    description: "就诊主表"
    global: "^PAADM(PAADM_RowID)"
    primaryKey: "PAADM_RowID"

# 接口程序类（用于验证对照）
apiClasses:
  - name: "web.DHCENS.Method.AdmInfo"
    method: "AdmInfo(AdmNo)"

# 相关字典类
relatedDicts:
  - name: "User.CTLoc"
    global: "^CTLOC(RowID)"
    description: "科室地点"
  - name: "User.CTHospital"
    global: "^CT(\"HOSP\",RowId)"
    description: "院区"
  - name: "User.CTCareProv"
    global: "^CTPCP(RowId,1)"
    description: "医护人员(医生)"
  - name: "User.PACAdmReason"
    global: "^PAC(\"ADMREA\",RowId)"
    description: "费用类别/入院原因"
  - name: "User.PACDischargeCondition"
    global: "^PAC(\"DISCON\",RowId)"
    description: "出院转归"
  - name: "User.PACWard"
    global: "^PAWARD(RowId)"
    description: "病区"
  - name: "User.PARoom"
    global: "^pAROOM(RowId)"
    description: "房间"

# 数据源遍历配置（供代码生成器使用）
# 支持两种模式：按入院日期(admDate)遍历 / 按出院日期(disDate)遍历
traversal:
  type: "PAADM"
  viewMatchers: ["admission", "discharge", "入院", "出院", "outpatient", "门诊"]
  inputParam:
    name: "pStartDate"
    type: "%String"
    description: "开始日期"
  preVariables: []
  modes:
    admDate:
      viewMatchers: ["admission", "入院"]
      description: "按入院日期遍历（入院记录/默认）"
      index:
        global: "^PAADMi"
        name: "PAADM_AdmDate"
        keys: ["date", "admRowId"]
        expression: '$o(^PAADMi("PAADM_AdmDate",date,admRowId))'
      template: |
        f date=pStartDate:1:pEndDate d
        .s admRowId=""
        .f  s admRowId=$o(^PAADMi("PAADM_AdmDate",date,admRowId)) q:admRowId=""  d
    disDate:
      viewMatchers: ["discharge", "出院"]
      description: "按出院日期遍历（出院记录）"
      index:
        global: "^PAADMi"
        name: "PAADM_DischgDate"
        keys: ["date", "admRowId"]
        expression: '$o(^PAADMi("PAADM_DischgDate",date,admRowId))'
      template: |
        f date=pStartDate:1:pEndDate d
        .s admRowId=""
        .f  s admRowId=$o(^PAADMi("PAADM_DischgDate",date,admRowId)) q:admRowId=""  d
  # 默认模板（按入院日期）
  index:
    global: "^PAADMi"
    name: "PAADM_AdmDate"
    keys: ["date", "admRowId"]
    expression: '$o(^PAADMi("PAADM_AdmDate",date,admRowId))'
  data:
    global: "^PAADM"
    variable: "admData"
    format: "p"
    expression: '$g(^PAADM(admRowId))'
  template: |
    f date=pStartDate:1:pEndDate d
    .s admRowId=""
    .f  s admRowId=$o(^PAADMi("PAADM_AdmDate",date,admRowId)) q:admRowId=""  d

totalRules: 63
lastUpdated: "2026-05-30"
relatedGlobals:
  - "^PAADM(admRowId) — 就诊主记录(^分隔串，80+字段)"
  - "^PAADM(admRowId,1) — 就诊扩展节点(费用类别等)"
  - "^PAADM(admRowId,\"tRANS\",childsub) — 转科换床记录"
  - "^PAADMi — 就诊索引(按日期/患者DR/类型等)"
  - "^CTLOC(RowID) — 科室地点"
  - "^CTPCP(RowId,1) — 医护人员"
  - "^PAWARD(RowId) — 病区"
  - "^pAROOM(RowId) — 房间"
  - "^PAC(\"ADMREA\") — 费用类别"
  - "^PAC(\"DISCON\") — 出院转归"
  - "^MR(MrAdmDr,\"DIA\") — 病案诊断"
  - "^MRC(\"ID\") — ICD诊断字典"
---

# 就诊/入院域(完整版)

## 元信息

| 属性 | 值 |
|------|-----|
| 域ID | `20-visit` |
| 版本 | 2.3.0 |
| 规则数 | 63 |
| 实体表 | User.PAAdm |
| 接口程序 | web.DHCENS.Method.AdmInfo.AdmInfo() |
| 更新时间 | 2026-05-30 |

## 描述

就诊全部信息，核心 Global: ^PAADM(Pa_Adm)。PAADM 是 hIS 中最重要的表之一，所有业务（医嘱、诊断、费用）都以就诊为单位组织。就诊通过 ^1 位关联患者DR。

## 表关联关系

```
User.PAAdm (就诊主表)
  ^PAADM(admRowId) — ^分隔串，80+字段
     ├── ^1: PatDR          → ^PAPER(patDR)           # 关联患者
     ├── ^2: AdmTypeCode     (O=门诊/I=住院/E=急诊/H=体检/N=新生儿)
     ├── ^4: DeptDR          → ^CTLOC(DeptDR)          # 当前科室
     ├── ^6: AdmDate         (H格式)                    # 入院日期
     ├── ^7: AdmTime         (秒数)                     # 入院时间
     ├── ^9: DoctorDR        → ^CTPCP(DoctorDR,1)       # 入院医生
     ├── ^17: DisDateNurse   (护士出院日期)
     ├── ^20: AdmStatusCode  (A=在就诊/C=取消/D=出院/P=预约)
     ├── ^29: VisitNum       (就诊次数)
     ├── ^49: DischConditDR  → ^PAC("DISCON")          # 出院转归
     ├── ^59: DisDateDoctor  (医生出院日期)
     ├── ^61: MrAdmDr        → ^MR(MrAdmDr)            # 病案记录
     ├── ^69: RoomDR         → ^pAROOM(RoomDR)          # 当前房间
     ├── ^70: WardDR         → ^PAWARD(WardDR)          # 当前病区
     ├── ^73: BedDR          → ^PAWARD(Ward,"BED",sub)  # 当前床位
     └── ^81: AdmSerialNum   (就诊流水号)

  ^PAADM(admRowId,1):
     └── ^7: FeeTypeDR       → ^PAC("ADMREA")          # 费用类别

  ^PAADM(admRowId,"tRANS",childsub) — 转科换床记录:
     ├── ^1: InBedDate
     ├── ^2: InBedTime
     ├── ^6: TransDeptDR     → ^CTLOC
     ├── ^7: TransRoomDR     → ^pAROOM
     ├── ^8: TransBedDR      → ^PAWARD("BED")
     └── ^9: TransWardDR     → ^PAWARD

  院区链路:
     ^PAADM^4(DeptDR) → ^CTLOC(DeptDR)^22 → ^CT("HOSP",HospDR)^1/^2 = 院区代码/名称
```

## Global 结构速查

### ^PAADM(admRowId) — 就诊主记录

| ^位 | 字段 | 说明 |
|-----|------|------|
| ^1 | PatDR | **患者DR → ^PAPER** |
| ^2 | AdmTypeCode | O=门诊/I=住院/E=急诊/H=体检/N=新生儿 |
| ^4 | DeptDR | **当前科室DR → ^CTLOC** |
| ^6 | AdmDate | 入院日期(H格式) |
| ^7 | AdmTime | 入院时间(秒数) |
| ^9 | DoctorDR | **入院医生DR → ^CTPCP** |
| ^17 | DisDateNurse | 护士出院日期 |
| ^18 | DisTimeNurse | 护士出院时间 |
| ^20 | AdmStatusCode | A=在就诊/C=取消/D=出院/P=预约 |
| ^29 | VisitNum | 就诊次数 |
| ^49 | DischConditDR | **转归DR → ^PAC("DISCON")** |
| ^59 | DisDateDoctor | 医生出院日期 |
| ^60 | DisTimeDoctor | 医生出院时间 |
| ^61 | MrAdmDr | **病案DR → ^MR** |
| ^69 | RoomDR | **当前房间DR → ^pAROOM** |
| ^70 | WardDR | **当前病区DR → ^PAWARD** |
| ^73 | BedDR | **当前床位DR(Ward||Sub)** |
| ^81 | AdmSerialNum | 就诊流水号 |

### ^PAADM(admRowId,1) — 扩展节点

| ^位 | 字段 | 说明 |
|-----|------|------|
| ^7 | FeeTypeDR | **费用类别DR → ^PAC("ADMREA")** |

### ^PAADM(admRowId,"TRANS",childsub) — 转科记录

| ^位 | 字段 | 说明 |
|-----|------|------|
| ^1 | InBedDate | 入床日期 |
| ^2 | InBedTime | 入床时间 |
| ^6 | DeptDR | 转入科室DR |
| ^7 | RoomDR | 转入房间DR |
| ^8 | BedDR | 转入床位DR |
| ^9 | WardDR | 转入病区DR |

### ^PAADMi — 常用索引

| 索引 | 结构 | 用途 |
|------|------|------|
| PAADM_AdmDate | `^PAADMi("PAADM_AdmDate",date,adm)` | 按入院日期遍历 |
| paadmPapmiDr | `^PAADMi("paadmPapmiDr",patDR,adm)` | 按患者查就诊记录 |
| PAADM_Type | `^PAADMi("PAADM_Type",type,adm)` | 按就诊类型查 |

---

## 字段映射规则

### 就诊标识

---

#### ADM_ROWID

| 属性 | 值 |
|------|-----|
| 标准名 | `admRowid` |
| 匹配模式 | AdmRowID, AdmNo, PAADM_RowID, EpisodeID, 就诊ID, 就诊号 |
| 取值表达式 | `AdmNo` |
| Global | - |
| 置信度 | 1.0 |
| 分类 | 标识 |

```objectscript
s admRowid = AdmNo
```

---

#### ADM_SERIAL_NUM

| 属性 | 值 |
|------|-----|
| 标准名 | `admSerialNum` |
| 匹配模式 | AdmSerialNum, lSH, 流水号, 就诊流水号 |
| 取值表达式 | `$p($g(^PAADM(AdmNo)),"^",81)` |
| Global | `^PAADM` |
| 节点路径 | `^PAADM(AdmNo)^81` |
| 置信度 | 0.95 |
| 分类 | 标识 |

```objectscript
s admSerialNum = $p($g(^PAADM(AdmNo)),"^",81)
```

---

### 患者关联

---

#### PAT_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `patDr` |
| 匹配模式 | PatRowID, PapmiDR, NameCode, 患者DR, 患者ID |
| 取值表达式 | `$p($g(^PAADM(AdmNo)),"^",1)` |
| Global | `^PAADM` |
| 节点路径 | `^PAADM(AdmNo)^1` |
| 置信度 | 1.0 |
| 分类 | 患者关联 |

**说明**：^1位是患者PAPMI_RowId→^PAPER。所有患者信息通过此DR获取。

```objectscript
s patDr = $p($g(^PAADM(AdmNo)),"^",1)
```

---

#### REG_NO

| 属性 | 值 |
|------|-----|
| 标准名 | `regNo` |
| 匹配模式 | RegisterNo, RegNo, 登记号, 病历号 |
| 取值表达式 | `$p($g(^PAPER(patDR,"PAT",1)),"^",1)` |
| Global | `^PAPER` |
| 置信度 | 0.99 |
| 分类 | 患者关联 |
| 依赖 | patDr |

```objectscript
s regNo = $p($g(^PAPER(patDR,"PAT",1)),"^",1)
```

---

#### PAT_NAME

| 属性 | 值 |
|------|-----|
| 标准名 | `patName` |
| 匹配模式 | AdmName, PatientName, 就诊姓名, 患者姓名 |
| 取值表达式 | `$p($g(^PAPER(patDR,"ALL")),"^",1)` |
| Global | `^PAPER` |
| 置信度 | 0.99 |
| 分类 | 患者关联 |
| 依赖 | patDr |

```objectscript
s patName = $p($g(^PAPER(patDR,"ALL")),"^",1)
```

---

### 就诊类型

---

#### ADM_TYPE_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `admTypeCode` |
| 匹配模式 | AdmTypeCode, VisitType, 就诊类型, jZLB |
| 取值表达式 | `$p($g(^PAADM(AdmNo)),"^",2)` |
| Global | `^PAADM` |
| 节点路径 | `^PAADM(AdmNo)^2` |
| 置信度 | 0.99 |
| 分类 | 就诊属性 |

**说明**：O=门诊/I=住院/E=急诊/H=体检/N=新生儿。

```objectscript
s admTypeCode = $p($g(^PAADM(AdmNo)),"^",2)
```

---

#### ADM_TYPE_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `admTypeDesc` |
| 匹配模式 | AdmTypeDesc, VisitTypeName, 就诊类型名称 |
| 取值表达式 | `$case(AdmTypeCode,"O":"门诊","I":"住院","E":"急诊","H":"体检","N":"新生儿")` |
| Global | - |
| 置信度 | 0.99 |
| 分类 | 就诊属性 |
| 依赖 | admTypeCode |

```objectscript
s admTypeDesc = $case(AdmTypeCode,"O":"门诊","I":"住院","E":"急诊","H":"体检","N":"新生儿")
```

---

### 就诊状态

---

#### ADM_STATUS_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `admStatusCode` |
| 匹配模式 | AdmStatusCode, VisitStatus, 就诊状态, jZZT |
| 取值表达式 | `$p($g(^PAADM(AdmNo)),"^",20)` |
| Global | `^PAADM` |
| 节点路径 | `^PAADM(AdmNo)^20` |
| 置信度 | 0.99 |
| 分类 | 就诊状态 |

**说明**：A=在就诊/C=取消就诊/D=出院/P=预约。

```objectscript
s admStatusCode = $p($g(^PAADM(AdmNo)),"^",20)
```

---

#### ADM_STATUS_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `admStatusDesc` |
| 匹配模式 | AdmStatusDesc, VisitStatusName, 就诊状态名称 |
| 取值表达式 | `$case(StatusCode,"A":"在就诊","C":"取消就诊","D":"出院","P":"预约")` |
| Global | - |
| 置信度 | 0.99 |
| 分类 | 就诊状态 |
| 依赖 | admStatusCode |

```objectscript
s admStatusDesc = $case(StatusCode,"A":"在就诊","C":"取消就诊","D":"出院","P":"预约")
```

---

#### VISIT_NUM

| 属性 | 值 |
|------|-----|
| 标准名 | `visitNum` |
| 匹配模式 | VisitNum, 就诊次数, VisitTimes, 住院次数 |
| 取值表达式 | `$p($g(^PAADM(admId)),"^",81)` |
| Global | `^PAADM` |
| 节点路径 | `^PAADM(AdmNo)^29` |
| 置信度 | 0.95 |
| 分类 | 就诊属性 |

```objectscript
s visitNum = $p($g(^PAADM(AdmNo)),"^",29)
```

---

### 时间信息

---

#### ADM_DATE

| 属性 | 值 |
|------|-----|
| 标准名 | `admDate` |
| 匹配模式 | AdmDate, VisitDate, 入院日期, jZRQ |
| 取值表达式 | `$zd($p($g(^PAADM(admId)),"^",6),3)` |
| Global | `^PAADM` |
| 节点路径 | `^PAADM(AdmNo)^6` |
| 置信度 | 0.99 |
| 分类 | 时间信息 |

```objectscript
s tDate = $p($g(^PAADM(AdmNo)),"^",6)
i tDate'="" s tDate = $zd(tDate,3)
s admDate = tDate
```

---

#### ADM_TIME

| 属性 | 值 |
|------|-----|
| 标准名 | `admTime` |
| 匹配模式 | AdmTime, VisitTime, 入院时间, jZSJ |
| 取值表达式 | `$zt($p($g(^PAADM(admId)),"^",7),1)` |
| Global | `^PAADM` |
| 节点路径 | `^PAADM(AdmNo)^7` |
| 置信度 | 0.99 |
| 分类 | 时间信息 |

```objectscript
s tTime = $p($g(^PAADM(AdmNo)),"^",7)
i tTime'="" s tTime = $zt(tTime)
s admTime = tTime
```

---

#### DIS_DATE_NURSE

| 属性 | 值 |
|------|-----|
| 标准名 | `disDateNurse` |
| 匹配模式 | DisDateNurse, DisDate, discharge_time, dischargeTime, 出院日期, 出院时间, cYRQ, DischargeDate |
| 取值表达式 | `$zd($p($g(^PAADM(admId)),"^",17),3)` |
| Global | `^PAADM` |
| 节点路径 | `^PAADM(AdmNo)^17` |
| 置信度 | 0.99 |
| 分类 | 时间信息 |

```objectscript
s tDate = $p($g(^PAADM(AdmNo)),"^",17)
i tDate'="" s tDate = $zd(tDate,3)
s disDateNurse = tDate
```

---

#### DIS_DATE_DOCTOR

| 属性 | 值 |
|------|-----|
| 标准名 | `disDateDoctor` |
| 匹配模式 | DisDateDoctor, 医生出院日期, ySCYRQ |
| 取值表达式 | `$zd($p($g(^PAADM(admId)),"^",59),3)` |
| Global | `^PAADM` |
| 节点路径 | `^PAADM(AdmNo)^59` |
| 置信度 | 0.93 |
| 分类 | 时间信息 |

```objectscript
s tDate = $p($g(^PAADM(AdmNo)),"^",59)
i tDate'="" s tDate = $zd(tDate,3)
s disDateDoctor = tDate
```

---

#### RESIDENT_DAYS

| 属性 | 值 |
|------|-----|
| 标准名 | `residentDays` |
| 匹配模式 | ResidentDays, 住院天数, zYTS, lOS |
| 取值表达式 | `DisDate - AdmDate + 1` (仅住院类型) |
| Global | 计算字段 |
| 置信度 | 0.95 |
| 分类 | 时间信息 |
| 条件 | AdmTypeCode="I" |

```objectscript
i (AdmDate'="")&&(DisDate'="")&&(AdmTypeCode="I") d
. s residentDays = DisDate - AdmDate + 1
```

---

### 院区信息

---

#### ADM_HOSP_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `admHospDr` |
| 匹配模式 | HospDR, AdmHosp, 院区DR, HospitalDR |
| 取值表达式 | `$p($g(^CTLOC(deptDR)),"^",22)` |
| Global | `^CTLOC` |
| 节点路径 | `^CTLOC(DeptDR)^22` |
| 置信度 | 0.97 |
| 分类 | 院区信息 |
| 依赖 | deptDr |

**说明**：⚠️ 院区信息不直接存在PAADM中，通过科室CTLOC^22间接获取。

```objectscript
s admHospDr = $p($g(^CTLOC(deptDR)),"^",22)
```

---

#### ADM_HOSP_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `admHospCode` |
| 匹配模式 | HospCode, AdmHospCode, 院区代码 |
| 取值表达式 | `$p($g(^CT("HOSP",HospDR)),"^",1)` |
| Global | `^CT("HOSP")` |
| 置信度 | 0.97 |
| 分类 | 院区信息 |
| 依赖 | admHospDr |

```objectscript
s admHospCode = $p($g(^CT("HOSP",HospDR)),"^",1)
```

---

#### ADM_HOSP_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `admHospDesc` |
| 匹配模式 | AdmHospDesc, HospName, 院区名称 |
| 取值表达式 | `$p($g(^CT("HOSP",HospDR)),"^",2)` |
| Global | `^CT("HOSP")` |
| 置信度 | 0.97 |
| 分类 | 院区信息 |
| 依赖 | admHospDr |

```objectscript
s admHospDesc = $p($g(^CT("HOSP",HospDR)),"^",2)
```

---

### 科室信息

---

#### DEPT_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `deptDr` |
| 匹配模式 | DeptRowID, KeshiCode, AdmDept, 科室DR, 就诊科室 |
| 取值表达式 | `$p($g(^PAADM(AdmNo)),"^",4)` |
| Global | `^PAADM` |
| 节点路径 | `^PAADM(AdmNo)^4` |
| 置信度 | 0.99 |
| 分类 | 科室信息 |

```objectscript
s deptDr = $p($g(^PAADM(AdmNo)),"^",4)
```

---

#### DEPT_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `deptCode` |
| 匹配模式 | AdmDeptCode, CurDeptCode, 科室代码 |
| 取值表达式 | `$p($g(^CTLOC($p($g(^PAADM(admId)),"^",4))),"^",1)` |
| Global | `^CTLOC` |
| 置信度 | 0.97 |
| 分类 | 科室信息 |
| 依赖 | deptDr |

```objectscript
s deptCode = $p($g(^CTLOC(deptDR)),"^",1)
```

---

#### DEPT_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `deptDesc` |
| 匹配模式 | AdmDeptDesc, CurDeptDesc, 科室名称, 就诊科室名称 |
| 取值表达式 | `$p($g(^CTLOC(deptDR)),"^",2)` |
| Global | `^CTLOC` |
| 置信度 | 0.97 |
| 分类 | 科室信息 |
| 依赖 | deptDr |

**说明**：⚠️ 科室名称中可能含"-"分隔符，生产代码中常做 `$p(desc,"-",2)` 取后半部分。

```objectscript
s deptDesc = $p($g(^CTLOC(deptDR)),"^",2)
```

---

### 转科信息 (TRANS 子节点)

---

#### TRANS_DEPT_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `transDeptDr` |
| 匹配模式 | AdmDeptRowID, TransDeptDR, 转入科室, 入院科室DR |
| 取值表达式 | `""` |
| Global | `^PAADM` |
| 节点路径 | `^PAADM(AdmNo,"tRANS",childsub)^6` |
| 置信度 | 0.95 |
| 分类 | 转科信息 |

**说明**：⚠️ 通过遍历TRANS子节点获取，取有床位记录的最后一条。

```objectscript
s childsub = "" f  s childsub = $o(^PAADM(AdmNo,"tRANS",childsub)) q:(childsub="")!(Bed'="")  d
. s Bed = $p($g(^PAADM(AdmNo,"tRANS",childsub)),"^",8)
. i Bed'="" s transDeptDr = $p($g(^PAADM(AdmNo,"tRANS",childsub)),"^",6)
```

---

### 病区信息

---

#### WARD_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `wardDr` |
| 匹配模式 | WardRowID, CurrentWardDR, 病区DR |
| 取值表达式 | `$p($g(^PAADM(AdmNo)),"^",70)` |
| Global | `^PAADM` |
| 节点路径 | `^PAADM(AdmNo)^70` |
| 置信度 | 0.95 |
| 分类 | 病区床位 |

**说明**：⚠️ 区分：^70=当前病区(直接存储)、TRANS节点=转科病区(子节点遍历)。

```objectscript
s wardDr = $p($g(^PAADM(AdmNo)),"^",70)
```

---

#### WARD_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `wardCode` |
| 匹配模式 | AdmWardCode, WardCode, 病区代码 |
| 取值表达式 | `$p($g(^PAWARD($p($g(^PAADM(admId)),"^",70))),"^",1)` |
| Global | `^PAWARD` |
| 置信度 | 0.93 |
| 分类 | 病区床位 |
| 依赖 | wardDr |

```objectscript
s wardCode = $p($g(^PAWARD(WardDR)),"^",1)
```

---

#### WARD_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `wardDesc` |
| 匹配模式 | AdmWardDesc, WardName, 病区名称 |
| 取值表达式 | `$p($g(^PAWARD(WardDR)),"^",2)` |
| Global | `^PAWARD` |
| 置信度 | 0.93 |
| 分类 | 病区床位 |
| 依赖 | wardDr |

```objectscript
s wardDesc = $p($g(^PAWARD(WardDR)),"^",2)
```

---

### 房间床位

---

#### ROOM_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `roomDr` |
| 匹配模式 | RoomRowID, CurrentRoomDR, 房间DR |
| 取值表达式 | `$p($g(^PAADM(AdmNo)),"^",69)` |
| Global | `^PAADM` |
| 节点路径 | `^PAADM(AdmNo)^69` |
| 置信度 | 0.93 |
| 分类 | 病区床位 |

```objectscript
s roomDr = $p($g(^PAADM(AdmNo)),"^",69)
```

---

#### BED_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `bedDr` |
| 匹配模式 | BedRowID, BedDR, CurrentBedDR, 床位DR |
| 取值表达式 | `$p($g(^PAADM(AdmNo)),"^",73)` |
| Global | `^PAADM` |
| 节点路径 | `^PAADM(AdmNo)^73` |
| 置信度 | 0.93 |
| 分类 | 病区床位 |

**说明**：⚠️ 格式为WardDR||BedChildSub，需拆分获取床号。

```objectscript
s bedDr = $p($g(^PAADM(AdmNo)),"^",73)
```

---

#### BED_NO

| 属性 | 值 |
|------|-----|
| 标准名 | `bedNo` |
| 匹配模式 | BedNo, AdmBedNo, 床号, 床位号 |
| 取值表达式 | `$p($g(^PAWARD(WardDr,"BED",BedSub)),"^",1)` |
| Global | `^PAWARD` |
| 置信度 | 0.90 |
| 分类 | 病区床位 |
| 依赖 | bedDr |

```objectscript
s WardDr = $p(BedDR,"||",1)
s BedSub = $p(BedDR,"||",2)
s bedNo = $p($g(^PAWARD(WardDr,"BED",BedSub)),"^",1)
```

---

#### IN_BED_DATE

| 属性 | 值 |
|------|-----|
| 标准名 | `inBedDate` |
| 匹配模式 | InBedDate, 入床日期, rCRQ |
| 取值表达式 | `""` |
| Global | `^PAADM` |
| 节点路径 | `^PAADM(AdmNo,"tRANS",childsub)^1` |
| 置信度 | 0.90 |
| 分类 | 病区床位 |

```objectscript
s childsub = "" f  s childsub = $o(^PAADM(AdmNo,"tRANS",childsub)) q:(childsub="")!(Bed'="")  d
. s Bed = $p($g(^PAADM(AdmNo,"tRANS",childsub)),"^",8)
. s tDate = $p(^PAADM(AdmNo,"tRANS",childsub),"^",1)
. i tDate'="" s inBedDate = $zd(tDate,3)
```

---

### 医生信息

---

#### ADM_DOCTOR_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `admDoctorDr` |
| 匹配模式 | AdmDoctorRowID, DoctorDR, 入院医生, 主治医生 |
| 取值表达式 | `$p($g(^PAADM(AdmNo)),"^",9)` |
| Global | `^PAADM` |
| 节点路径 | `^PAADM(AdmNo)^9` |
| 置信度 | 0.99 |
| 分类 | 人员信息 |

```objectscript
s admDoctorDr = $p($g(^PAADM(AdmNo)),"^",9)
```

---

#### ADM_DOCTOR_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `admDoctorCode` |
| 匹配模式 | AdmDoctorCode, DoctorCode, 入院医生工号 |
| 取值表达式 | `$p($g(^CTPCP($p($g(^PAADM(admId)),"^",9),1)),"^",1)` |
| Global | `^CTPCP` |
| 置信度 | 0.97 |
| 分类 | 人员信息 |
| 依赖 | admDoctorDr |

```objectscript
s admDoctorCode = $p($g(^CTPCP(DoctorDR,1)),"^",1)
```

---

#### ADM_DOCTOR_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `admDoctorDesc` |
| 匹配模式 | AdmDoctorDesc, DoctorName, 入院医生姓名 |
| 取值表达式 | `$p($g(^CTPCP(DoctorDR,1)),"^",2)` |
| Global | `^CTPCP` |
| 置信度 | 0.97 |
| 分类 | 人员信息 |
| 依赖 | admDoctorDr |

```objectscript
s admDoctorDesc = $p($g(^CTPCP(DoctorDR,1)),"^",2)
```

---

### 费用信息

---

#### FEE_TYPE_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `feeTypeDr` |
| 匹配模式 | FeeTypeRowID, FeeTypeDR, 费用类别DR, PayTypeDR |
| 取值表达式 | `$p($g(^PAADM(AdmNo,1)),"^",7)` |
| Global | `^PAADM` |
| 节点路径 | `^PAADM(AdmNo,1)^7` |
| 置信度 | 0.97 |
| 分类 | 费用信息 |

**说明**：⚠️ 在子节点 1 中，不是主节点！

```objectscript
s feeTypeDr = $p($g(^PAADM(AdmNo,1)),"^",7)
```

---

#### FEE_TYPE_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `feeTypeCode` |
| 匹配模式 | FeeTypeCode, 费用类别代码, fylbCode |
| 取值表达式 | `$p($g(^PAC("ADMREA",FeeTypeDR)),"^",1)` |
| Global | `^PAC("ADMREA")` |
| 置信度 | 0.95 |
| 分类 | 费用信息 |
| 依赖 | feeTypeDr |

```objectscript
s feeTypeCode = $p($g(^PAC("ADMREA",FeeTypeDR)),"^",1)
```

---

#### FEE_TYPE_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `feeTypeDesc` |
| 匹配模式 | FeeTypeDesc, 费用类别名称, fYLB |
| 取值表达式 | `$p($g(^PAC("ADMREA",FeeTypeDR)),"^",2)` |
| Global | `^PAC("ADMREA")` |
| 置信度 | 0.95 |
| 分类 | 费用信息 |
| 依赖 | feeTypeDr |

```objectscript
s feeTypeDesc = $p($g(^PAC("ADMREA",FeeTypeDR)),"^",2)
```

---

### 就诊分类(高频补充)

---

#### ADM_CATEGORY_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `admCategoryDr` |
| 匹配模式 | AdmCateg_DR, AdmCategory, 就诊类别DR |
| 取值表达式 | `$p($g(^PAADM(AdmNo)),"^",5)` |
| Global | `^PAADM` |
| 节点路径 | `^PAADM(AdmNo)^5` |
| 置信度 | 0.90 |
| 分类 | 就诊属性 |

**说明**：就诊类别DR，→ PAC_AdmCategory 字典。

```objectscript
s admCategoryDr = $p($g(^PAADM(AdmNo)),"^",5)
s admCategoryDesc = $p($g(^PAC("ADMCAT",admCategoryDr)),"^",2)
```

---

#### SPECIALTY_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `specialtyDr` |
| 匹配模式 | Specialty_DR, Specialty, 科室专业DR, 专科DR |
| 取值表达式 | `$p($g(^PAADM(AdmNo)),"^",8)` |
| Global | `^PAADM` |
| 节点路径 | `^PAADM(AdmNo)^8` |
| 置信度 | 0.90 |
| 分类 | 就诊属性 |

**说明**：科室专业/专科DR → CT_Specialty 字典。

```objectscript
s specialtyDr = $p($g(^PAADM(AdmNo)),"^",8)
s specialtyDesc = $p($g(^CT("SPEC",specialtyDr)),"^",2)
```

---

#### ADM_SRC_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `admSrcDr` |
| 匹配模式 | AdmSrc_DR, AdmSource, 入院来源DR |
| 取值表达式 | `$p($g(^PAADM(AdmNo)),"^",10)` |
| Global | `^PAADM` |
| 节点路径 | `^PAADM(AdmNo)^10` |
| 置信度 | 0.88 |
| 分类 | 就诊属性 |

**说明**：入院来源DR → PAC_AdmSource 字典。

```objectscript
s admSrcDr = $p($g(^PAADM(AdmNo)),"^",10)
s admSrcDesc = $p($g(^PAC("ADMSRC",admSrcDr)),"^",2)
```

---

#### REF_DOC_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `refDocDr` |
| 匹配模式 | RefDocCodeDR, RefDoc, 转诊医生DR, referralDoctor |
| 取值表达式 | `$p($g(^PAADM(AdmNo)),"^",15)` |
| Global | `^PAADM` |
| 节点路径 | `^PAADM(AdmNo)^15` |
| 置信度 | 0.88 |
| 分类 | 人员信息 |

**说明**：转诊/介绍医生DR → CTCareProv。

```objectscript
s refDocDr = $p($g(^PAADM(AdmNo)),"^",15)
```

---

#### DISCH_DOCTOR_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `dischDoctorDr` |
| 匹配模式 | DischgDoc_DR, DischDoctor, 出院医生DR |
| 取值表达式 | `$p($g(^PAADM(AdmNo)),"^",19)` |
| Global | `^PAADM` |
| 节点路径 | `^PAADM(AdmNo)^19` |
| 置信度 | 0.90 |
| 分类 | 人员信息 |

**说明**：出院医生DR → CTCareProv。⚠️ 与^9(入院医生)区分。

```objectscript
s dischDoctorDr = $p($g(^PAADM(AdmNo)),"^",19)
```

---

#### CREATE_DATE

| 属性 | 值 |
|------|-----|
| 标准名 | `createDate` |
| 匹配模式 | CreateDate, 创建日期, 建档日期 |
| 取值表达式 | `$zd($p($g(^PAADM(AdmNo)),"^",41),3)` |
| Global | `^PAADM` |
| 节点路径 | `^PAADM(AdmNo)^41` |
| 置信度 | 0.88 |
| 分类 | 时间信息 |

**说明**：就诊记录创建日期。

```objectscript
s tDate = $p($g(^PAADM(AdmNo)),"^",41)
i tDate'="" s tDate = $zd(tDate,3)
s createDate = tDate
```

---

#### CREATE_USER

| 属性 | 值 |
|------|-----|
| 标准名 | `createUser` |
| 匹配模式 | CreateUser, 创建用户, 建档人 |
| 取值表达式 | `$p($g(^PAADM(AdmNo)),"^",43)` |
| Global | `^PAADM` |
| 节点路径 | `^PAADM(AdmNo)^43` |
| 置信度 | 0.85 |
| 分类 | 人员信息 |

```objectscript
s createUser = $p($g(^PAADM(AdmNo)),"^",43)
```

---

### 转归信息

---

#### DISCH_CONDIT_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `dischConditDr` |
| 匹配模式 | DischCondit, DischConditDR, 转归DR, 出院转归 |
| 取值表达式 | `$p($g(^PAADM(AdmNo)),"^",49)` |
| Global | `^PAADM` |
| 节点路径 | `^PAADM(AdmNo)^49` |
| 置信度 | 0.97 |
| 分类 | 出院信息 |

**说明**：转归DR → ^PAC("DISCON")，1=治愈/2=好转/3=未愈/4=死亡/5=其他。

```objectscript
s dischConditDr = $p($g(^PAADM(AdmNo)),"^",49)
```

---

#### DISCH_CONDIT_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `dischConditCode` |
| 匹配模式 | DischConditCode, 转归代码, zGDM |
| 取值表达式 | `$p($g(^PAC("DISCON",DischConditDR)),"^",1)` |
| Global | `^PAC("DISCON")` |
| 置信度 | 0.95 |
| 分类 | 出院信息 |
| 依赖 | dischConditDr |

```objectscript
s dischConditCode = $p($g(^PAC("DISCON",DischConditDR)),"^",1)
```

---

#### DISCH_CONDIT_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `dischConditDesc` |
| 匹配模式 | DischConditDesc, 转归描述, zGMS |
| 取值表达式 | `$p($g(^PAC("DISCON",DischConditDR)),"^",2)` |
| Global | `^PAC("DISCON")` |
| 置信度 | 0.95 |
| 分类 | 出院信息 |
| 依赖 | dischConditDr |

```objectscript
s dischConditDesc = $p($g(^PAC("DISCON",DischConditDR)),"^",2)
```

---

### 诊断关联

---

#### MR_ADM_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `mrAdmDr` |
| 匹配模式 | MrAdmDr, MRAdm, 病案DR, 病历DR |
| 取值表达式 | `$p($g(^PAADM(AdmNo)),"^",61)` |
| Global | `^PAADM` |
| 节点路径 | `^PAADM(AdmNo)^61` |
| 置信度 | 0.99 |
| 分类 | 诊断关联 |

**说明**：病案DR → ^MR，用于获取诊断信息。

```objectscript
s mrAdmDr = $p($g(^PAADM(AdmNo)),"^",61)
```

---

### 患者扩展信息(从^PAPER关联)

---

#### SEX_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `sexCode` |
| 匹配模式 | SexCode, Sex, 性别代码, 性别 |
| 取值表达式 | `$p($g(^CT("SEX",$p($g(^PAPER(patDR,"ALL")),"^",7))),"^",1)` |
| Global | `^PAPER → ^CT("SEX")` |
| 置信度 | 0.97 |
| 分类 | 患者扩展 |
| 依赖 | patDr |

```objectscript
s sexDR = $p($g(^PAPER(patDR,"ALL")),"^",7)
s sexCode = $p($g(^CT("SEX",sexDR)),"^",1)
```

---

#### AGE

| 属性 | 值 |
|------|-----|
| 标准名 | `aGE` |
| 匹配模式 | PatientAge, 年龄, nL, EstAgeYear, 估算年龄 |
| 取值表达式 | `##class(web.DHCDocInterface).GetAge(PatientID)` |
| Global | 计算字段 |
| 置信度 | 0.93 |
| 分类 | 患者扩展 |
| 依赖 | patDr, dOB |

```objectscript
s dOB = $p($g(^PAPER(patDR,"ALL")),"^",6)
s AgeYr = $p($zd($p($h,",",1),3),"-",1) - $p($zd(dOB,3),"-",1)
s aGE = AgeYr
```

---

#### BIRTHDAY

| 属性 | 值 |
|------|-----|
| 标准名 | `bIRTHDAY` |
| 匹配模式 | BirthDay, Birthday, 出生日期 |
| 取值表达式 | `s tDate=$p($g(^PAPER(patDR,"ALL")),"^",6) i tDate'="" s tDate=$zd(tDate,3)` |
| Global | `^PAPER` |
| 置信度 | 0.97 |
| 分类 | 患者扩展 |
| 依赖 | patDr |

```objectscript
s tDate = $p($g(^PAPER(patDR,"ALL")),"^",6)
i tDate'="" s bIRTHDAY = $zd(tDate,3)
```

---

## 常用索引与遍历方式

### 按入院日期遍历就诊
```objectscript
s date = dateFrom - 1 f  s date = $o(^PAADMi("PAADM_AdmDate",date)) q:(date="")!(date>dateTo)  d
. s adm = "" f  s adm = $o(^PAADMi("PAADM_AdmDate",date,adm)) q:adm=""  d
. . ; 处理就诊记录
```

### 按患者查所有就诊
```objectscript
s adm = "" f  s adm = $o(^PAADMi("paadmPapmiDr",patDR,adm)) q:adm=""  d
. ; adm = 就诊RowID
```

### 全量遍历
```objectscript
s adm = "" f  s adm = $o(^PAADM(adm)) q:adm=""  d
. s patDR = $p($g(^PAADM(adm)),"^",1)
. q:patDR=""
. ; 取值 + 输出
```

### 通过医嘱号取就诊
```objectscript
s admNo = $p($g(^OEORD(+ordRowid)),"^",1)
```

### 遍历转科记录
```objectscript
s childsub = "" f  s childsub = $o(^PAADM(AdmNo,"tRANS",childsub)) q:childsub=""  d
. s bed = $p($g(^PAADM(AdmNo,"tRANS",childsub)),"^",8)
. q:bed=""  ; 只取有床位的记录
```

## 踩坑提示

### ⚠️ 院区信息需要间接获取

院区不直接存在PAADM中！链路：`^PAADM^4(deptDR) → ^CTLOC(deptDR)^22(hospDR) → ^CT("HOSP",hospDR)^1/^2`。

### ⚠️ FeeType 在子节点中

`FeeTypeDR` 在 `^PAADM(AdmNo,1)^7`，不是主节点的 ^7（主节点 ^7=AdmTime）。

### ⚠️ TRANS 节点遍历

转科记录只取有床位的最后一条（生产代码模式：`q:(childsub="")!(Bed'="")`）。

### ⚠️ 出院日期分护士/医生

^17=护士出院日期(DisDateNurse)，^59=医生出院日期(DisDateDoctor)，两字段不同。

## 别名映射表

| 标准名 | 别名列表 |
|--------|----------|
| admRowid | AdmNo, PAADM_RowID, EpisodeID, 就诊ID, 就诊号 |
| patDr | PatRowID, PapmiDR, NameCode, 患者DR |
| admTypeCode | AdmTypeCode, VisitType, jZLB, 就诊类型 |
| admStatusCode | AdmStatusCode, VisitStatus, jZZT, 就诊状态 |
| admDate | AdmDate, VisitDate, jZRQ, 入院日期 |
| disDate | DisDateNurse, DisDate, cYRQ, 出院日期 |
| deptCode | AdmDeptCode, KeshiCode, CurDeptCode, 科室代码 |
| admDoctorDesc | AdmDoctorDesc, DoctorName, 医生姓名 |
| dischConditDesc | DischConditDesc, zGMS, 转归 |
| wardDesc | AdmWardDesc, WardName, 病区 |
| feeTypeDesc | FeeTypeDesc, fYLB, 费用类别 |

## 规则统计

| 分类 | 规则数 | 说明 |
|------|--------|------|
| 就诊标识 | 2 | admRowid/AdmSerialNum |
| 患者关联 | 3 | PatDR/RegNo/PatName/dOB/Age/Sex |
| 就诊类型/状态 | 4 | AdmType/AdmStatus/VisitNum |
| 时间信息 | 5 | AdmDate/AdmTime/DisDateNurse/DisDateDoctor/ResidentDays |
| 院区信息 | 3 | HospDR/HospCode/HospDesc |
| 科室信息 | 3 | DeptDR/DeptCode/DeptDesc |
| 转科信息 | 1 | TransDeptDR |
| 病区床位 | 7 | WardDR/Code/Desc + RoomDR + BedDR/No + InBedDate |
| 人员信息 | 5 | DoctorDR/Code/Desc + DischDoctorDR + RefDocDR |
| 费用信息 | 3 | FeeTypeDR/Code/Desc |
| 出院信息 | 3 | DischConditDR/Code/Desc |
| 诊断关联 | 1 | MrAdmDr |
| 就诊分类 | 4 | AdmCategoryDR + SpecialtyDR + AdmSrcDR |
| 时间补充 | 2 | CreateUser + CreateDate |
| **合计** | **45** | (计入父级63条含字典子字段) |

---
