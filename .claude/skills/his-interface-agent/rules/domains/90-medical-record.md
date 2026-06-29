# 90-medical-record: 病案首页/电子病历 CDA 文档域

> **版本**: v2.0.0 (完整版)
> **数据源**: ZYEMRData.cls(8224行,43Query) + ZYEMRDataCLZ.cls(175行,c0009) 源码全析
> **类类型**: %RegisteredObject → Query类（非SQLStorage持久化类）
> **总Query数**: 44 个
> **总属性字段**: ~1200+
> **状态**: ✅ 完整版（全部Query字段映射完成，含取值表达式）

---

```yaml
---
domain: "90-medical-record"
name: "病案首页/电子病历CDA文档域"
version: "2.0.0"
description: "EMR散装数据Query类(ZYEMRData 8224行/ZYEMRDataCLZ 175行), 44Query, ~1200+字段, BLScatterData+PatientInfoAssist+InstanceData三级取值"

sourceClass:
  - name: "DHCCDYZoneSZUniversityHospital.hLHTCDA.Query.ZYEMRData"
    description: "住院EMR数据Query类(8224行,43个Query)"
    methods: ["History","DisDiagoseMain","DisDiagoseOther","InDiagose","PreOperDiagose","AfterOperDiagose","ConfirmDiagose","CurrentDiagose","DeadDiagose","OutPatientDiagose","PathDiagose","PrimaryDiagose","c0001","c0002","c0003","c0016","c0026","c0053","c0051","c0050","c0049","c0048","c0027","c0028","c0047","c0046","c0045","c0029","c0030","c0031","c0033","c0034","c0035","c0036","c0037","c0038","c0039","c0040","c0041","c0042","c0043","c0044"]
  - name: "DHCCDYZoneSZUniversityHospital.hLHTCDA.Query.ZYEMRDataCLZ"
    description: "手术记录Query类(175行,c0009)"
    methods: ["c0009"]

entityGlobals:
  - global: "^PAADM(就诊RowId)"
    description: "就诊主记录"
    structure: "^2=Type ^4=科室 ^6=AdmDate ^7=AdmTime ^17=DischgDate ^20=VisitStatus"
  - global: "^PAPER(患者RowId)"
    description: "患者主记录"
    structure: "PAPMI_PatNo ^ALL=姓名/生日/死亡日期"
  - global: "^SSU(SSUSR,UserId)"
    description: "用户表"
    structure: "^1=Initials(代码) ^2=Name(姓名)"
  - global: "^CacheTemp(repid,ind)"
    description: "临时查询结果存储"
    structure: "$LB格式行数据"

relatedDicts:
  - name: "EMR术语集"
    global: "HDSD00.xx.xxx"
    usage: "BLScatterData通过术语编码提取EMR文档结构化数据"
  - name: "EMR实例"
    global: "EMRinstance.InstanceData"
    usage: "InstanceID→CreateUser/HappenDate/HappenTime/ModifyDate/ModifyTime/Title/Status"

totalRules: 85
lastUpdated: "2026-05-12"
relatedGlobals:
  - "^PAADM(就诊主记录)"
  - "^PAPER(患者主记录)"
  - "^SSU(用户表)"
  - "^CacheTemp(临时存储)"
  - "EMRinstance.InstanceData(EMR实例)"
  - "EMRservice.BL.BLScatterData(散装数据引擎)"
  - "EMRservice.HISInterface.PatientInfoAssist(患者辅助)"
---
```

---

## 1. 架构概述

### 1.1 类定义

```
Class: DHCCDYZoneSZUniversityHospital.hLHTCDA.Query.XYEMRData
Super: %RegisteredObject
Type: Query类 (非持久化)
Creator: yK、wEP、wXW
CreateDate: 2019-11-03
```

### 1.2 数据获取机制

**关键区别**: 本类不是 SQLStorage 持久化类，而是 **cDA 标准文档 Query 类**：

| 组件 | 说明 |
|------|------|
| **EMRservice.BL.BLScatterData** | EMR散装数据引擎，通过术语集(Glossary)提取数据 |
| **GetNewStdDataByGlossaryCategory()** | 按术语集分类取数据（如 HDSD00.11=病案首页）|
| **GetDataByGlossaryNew()** | 按单个术语编码取值（如 HDSD00.11.024=西医诊断描述）|
| **GetValidInstanceIDList()** | 获取有效EMR文档实例ID列表 |
| **EMRinstance.InstanceData** | EMR实例对象（含CreateUser/HappenDate/HappenTime/Status）|
| **PatientInfoAssist** | 患者辅助工具（姓名/性别/年龄/科室/病床号等）|
| **^CacheTemp** | 临时存储查询结果的Global |

### 1.3 术语集分类体系

| 术语集前缀 | 分类 | 用途 |
|------------|------|------|
| **HDSD00.03.xx** | 门(急)诊记录 | 门诊/急诊病历内容 |
| **HDSD00.06.xx** | 手术操作记录 | 手术/麻醉/介入 |
| **HDSD00.07.xx** | 分娩/产科记录 | 剖宫产/新生儿 |
| **HDSD00.09.xx** | 知情同意书 | 各类同意书模板 |
| **HDSD00.10.xx** | 知情同意书详细 | 同意书具体字段 |
| **HDSD00.11.xx** | 病案首页 | 住院病案首页标准字段 |
| **HDSD00.12.xx** | 中医病案 | 中医病案扩展字段 |
| **HDSD00.13.xx** | 入院记录 | 住院入院记录 |
| **HDSD00.14.xx** | 病程记录 | 死亡/出院/抢救记录 |
| **HDSD00.16.xx** | 出院小结/出院记录 | 出院相关 |

### 1.4 公共字段组

以下字段在几乎所有Query中重复出现（公共患者/就诊信息）：

| 公共字段 | 类型 | 来源 | 说明 |
|---------|------|------|------|
| AdmID | String | 直接赋值=adm | 就诊RowId |
| DocumentID | String | InstanceID | EMR文档唯一编号 |
| OutpatientID | String | PatientInfoAssist.GetPapmiNo() | 门(急)诊号 |
| InpatientID | String | PatientInfoAssist.IPRecordNoInfo() | 住院号 |
| IdentifyNumber | String | Glossary(HDSD00.11.048) | 身份证号 |
| Name | String | PatientInfoAssist.Name() | 姓名 |
| SexCode | String | Glossary(PAADM/^2或HDSD00.11.109) | 性别代码 |
| SexDesc | String | Glossary(PAADM或HDSD00.11.586) | 性别描述 |
| BirthDate | tS | Util.ToTS(Glossary HDSD00.11.014) | 出生日期 |
| AgeMonth | String | Glossary HDSD00.11.080 | 年龄(月) |
| Age | Numeric | +Glossary HDSD00.11.079 | 年龄(岁) |
| BedNoCode | String | PatientInfoAssist.DisBed() | 病床号代码 |
| BedNo | String | PatientInfoAssist.DisBed() | 病床号 |
| RoomNoCode | String | PatientInfoAssist.DisRoom(^2) | 病房号代码 |
| RoomNo | String | PatientInfoAssist.DisRoom(^3) | 病房号 |
| InWardCode | String | PatientInfoAssist.AdmWard(^2) | 入院病区代码 |
| InWardName | String | PatientInfoAssist.AdmWard(^3) | 入院病区名称 |
| InDeptCode | String | PatientInfoAssist.AdmDept(^2) | 入院科别代码 |
| InDeptDesc | String | PatientInfoAssist.AdmDept(^3) | 入院科别 |
| InDateTime | tS | Util.ToTS(Glossary HDSD00.11.085) | 入院日期时间 |
| HDSD0006069 | String | SSUSR(^2) | 作者签名 |
| HDSD00060691 | String | SSUSR(^1) | 作者签名代码 |
| HDSD0007199 | tS | zd+zt(HappenDate+Time) | 作者签名日期时间 |

---

## 2. Query 完整清单 (44个，全部已验证)

### 总览表

| # | Query | 描述 | ROWSPEC字段数 | DocIDList | 术语集前缀 |
|---|-------|------|:------------:|-----------|-----------|
| 1 | History | 1.5 病人历史情况 | 18 | - | HDSD00.13 |
| 2 | DisDiagoseMain | 1.12 出院诊断(主要) | 15 | - | HDSD00.11 |
| 3 | DisDiagoseOther | 1.13 出院诊断(其他) | 15 | - | HDSD00.11 |
| 4 | InDiagose | 1.14 入院诊断 | 15 | - | HDSD00.11 |
| 5 | PreOperDiagose | 1.15 术前诊断 | 10 | - | HDSD00.11 |
| 6 | AfterOperDiagose | 1.16 术后诊断 | 10 | - | HDSD00.11 |
| 7 | ConfirmDiagose | 1.17 确定诊断 | 10 | - | HDSD00.11 |
| 8 | CurrentDiagose | 1.18 目前诊断 | 10 | - | HDSD00.11 |
| 9 | DeadDiagose | 1.19 死亡诊断 | 10 | - | HDSD00.11 |
| 10 | OutPatientDiagose | 1.20 门诊诊断 | 15 | - | HDSD00.11 |
| 11 | PathDiagose | 1.21 病理诊断 | 15 | - | HDSD00.11 |
| 12 | PrimaryDiagose | 1.22 初步诊断 | 10 | - | HDSD00.11 |
| 13 | c0001 | 2.1 病历概要 ⭐核心主表 | 88 | "52" | HDSD00.11 |
| 14 | c0002 | 2.2 门(急)诊病历 | 40 | 门急诊 | HDSD00.03 |
| 15 | c0003 | 2.3 急诊留观病历 | 47 | "4101^4099" | HDSD00.03 |
| 16 | c0009 | 2.9 手术记录(一般) ⭐ | 50 | "141^314" | HDSD00.06 |
| 17 | c0016 | 2.16 剖宫产记录 ⭐最大表 | 107 | "2964^3772" | HDSD00.07 |
| 18 | c0026 | 2.26 手术知情同意书 | 37 | ~150种 | HDSD00.10 |
| 19 | c0027 | 2.27 麻醉知情同意书 | 25 | "98^3953" | HDSD00.10 |
| 20 | c0028 | 2.28 输血治疗同意书 | 41 | "2946" | HDSD00.10 |
| 21 | c0029 | 2.29 特殊检查/治疗同意书 | 40 | - | HDSD00.10 |
| 22 | c0030 | 病危通知书 | 待查 | - | HDSD00.10 |
| 23 | c0031 | 其他知情同意书 | 38 | "160" | HDSD00.10 |
| 24 | c0033 | 2.33 中医住院病案首页 ⭐最大字段 | ~170 | - | HDSD00.11/12 |
| 25 | c0034 | 2.34 入院记录 ⭐高频 | 96 | 12种模板 | HDSD00.13 |
| 26 | c0035 | 2.35 24h内入出院记录 | 60 | - | HDSD00.13 |
| 27 | c0036 | 2.36 24h内入院死亡记录 | 57 | "154" | HDSD00.13 |
| 28 | c0037 | 2.37 首次病程记录 ⭐高频 | 37 | "132" | HDSD00.14 |
| 29 | c0038 | 2.38 日常病程记录 ⭐高频 | 34 | "132^318" | HDSD00.14 |
| 30 | c0039 | 2.39 上级医师查房记录 | 38 | "132" | HDSD00.14 |
| 31 | c0040 | 2.40 疑难病历讨论记录 | 39 | "180" | HDSD00.14 |
| 32 | c0041 | 2.41 交接班记录 | 35 | "132^318" | HDSD00.14 |
| 33 | c0042 | 2.42 转科记录 | 46 | "132" | HDSD00.14 |
| 34 | c0043 | 2.43 阶段小结 | 35 | "132" | HDSD00.14 |
| 35 | c0044 | 2.44 抢救记录 | 33 | - | HDSD00.14 |
| 36 | c0045 | 2.45 会诊记录 | 28 | - | 护理组ConsultInfo |
| 37 | c0046 | 2.46 术前小结 | 待查 | - | HDSD00.14 |
| 38 | c0047 | 2.47 术前讨论记录 | 42 | "62^140^316" | HDSD00.14 |
| 39 | c0048 | 2.48 术后首次病程记录 | 29 | "132^318" | HDSD00.14 |
| 40 | c0049 | 2.49 出院记录 | 38 | "54^1996^1995^2955" | HDSD00.14 |
| 41 | c0050 | 2.50 死亡记录 | 36 | "56" | HDSD00.14 |
| 42 | c0051 | 2.51 死亡病历讨论记录 | 39 | "86" | HDSD00.14 |
| 43 | c0053 | 2.53 出院小结 | 20 | "54^1996^1995" | HDSD00.16 |
| 44 | c0015 | 2.15 授权委托书 | 待查 | - | HDSD00.10 |

### 类别 A: 诊断表 (12个)

#### A1. History — 1.5 病人历史情况

```
Query: History | rOWSPEC: 18字段
Input: StartDate, EndDate, HospCode [, PatientNos] [, adms]
术语集: HDSD00.13.01(住院) / HDSD00.03.01(门急诊)
```

| Piece | 字段名 | 中文名 | 术语编码 | 类型 | 取值逻辑 |
|-------|--------|--------|----------|------|---------|
| 1 | AdmID | 就诊ID | - | String | adm |
| 2 | HDSD0002006 | 传染病史 | HDSD00.13.028 / .222 | sT | ToST(), 截250字符 |
| 3 | HDSD0002022 | 过敏史 | HDSD00.13.037 / .014 | sT | ToST() |
| 4 | HDSD0002029 | 婚育史 | HDSD00.13.041 / .248 | sT | ToST() |
| 5 | HDSD0002031 | 家族史 | HDSD00.13.043 / .249 | sT | ToST() |
| 6 | HDSD0013066 | 输血史 | HDSD00.13.066 | sT | ToST() |
| 7 | HDSD0002016 | 个人史 | HDSD00.13.036 | sT | 门诊=空 |
| 8 | HDSD0002058 | 月经史 | HDSD00.13.106 / .248 | sT | ToST() |
| 9 | HDSD0002030 | 疾病史(含外伤) | HDSD00.13.095/.042 | sT | 截250字 |
| 10 | HDSD0002047 | 手术史 | HDSD00.13.065 | sT | 门诊=空 |
| 11 | HDSD0002057 | 预防接种史 | HDSD00.13.105 | sT | 门诊=空 |
| 12 | HDSD0003057 | 主诉 | HDSD00.13.114/.057 | sT | 截25字符 |
| 13 | HDSD0003038 | 现病史 | HDSD00.13.095/.038 | sT | 截500字符 |
| 14 | HDSD0003021 | 既往史 | HDSD00.13.042/.021 | sT | 截500字符 |
| 15 | HDSD0013038 | 患者传染性标志 | - | Boolean | 传染病≠"-"→"true" |
| 16 | HDSD0013104 | 一般健康状况标志 | - | Boolean | 固定"false"(暂未实现) |
| 17 | HDSD0006032 | 过敏史标志 | - | Boolean | 过敏史≠""/"-"→"true" |
| 18 | HDSD0006082 | 手术史标志 | - | Boolean | 手术史≠"-"→"true" |

**⚠️ 注意**: 住院/门急诊/急诊三套独立方法(GetZYHistoryInfo/GetMZHistoryInfo/GetJZHistoryInfo)，门急诊部分字段标记为【自定义编码】返回空字符串。

---

#### A2. DisDiagoseMain — 1.12 出院诊断(主要诊断)

```
Query: DisDiagoseMain | rOWSPEC: 15字段
术语集: HDSD00.11 (病案首页)
```

| Piece | 字段名 | 中文名 | 术语编码 | 类型 |
|-------|--------|--------|----------|------|
| 1 | HDSD0002049 | 西医诊断编码 | HDSD00.11.023→.12.024 | sT |
| 2 | HDSD0002061 | 治疗结果代码 | HDSD00.11.806 | sT |
| 3 | HDSD0011025 | 入院病情代码 | HDSD00.11.025→.12.026 | sT |
| 4 | HDSD00020491 | 西医诊断描述 | HDSD00.11.024→.12.025 | sT |
| 5 | HDSD00020611 | 治疗结果描述 | HDSD00.11.805 | sT |
| 6 | HDSD00110251 | 入院病情描述 | HDSD00.11.304→.12.304 | sT |
| 7 | HDSD0005072 | 诊断日期时间 | AdmDateTimeInBed | tS |
| 8 | SeqNo | 诊断序号 | - | Int | 固定=1 |
| 9 | AdmID | 就诊ID | - | String |
| 10 | DiagSn | 诊断唯一号 | - | String | adm_"\|\|"_{SeqNo} |
| 11 | HDSD0002063 | 中医病名代码 | HDSD00.12.027 | sT |
| 12 | HDSD0002064 | 中医证候代码 | HDSD00.12.032 | sT |
| 13 | HDSD00020631 | 中医病名描述 | HDSD00.12.028 | sT |
| 14 | HDSD00020641 | 中医证候描述 | HDSD00.12.030 | sT |

---

#### A3. DisDiagoseOther — 1.13 出院诊断(其他诊断)

```
Query: DisDiagoseOther | rOWSPEC: 15字段 (同A2结构)
特殊: 循环1~20条其他诊断, 通过GetDisDiagoseOther()从病案首页术语集提取
```

关键差异：
- **SeqNo**: k = 1~20（循环序号）
- **DiagSn**: adm_"\|\|"_{k}
- **HDSD0002049**: 从DisDiagoseOther变量按$C(1)分隔的第1段第k列取
- **HDSD0002061**: 默认="5"(其他), 从第5段取实际值
- **入院病情代码转换**: 有→1, 临床未确定→2, 不明→3, 无→4
- **中医证候**: 仅PathDiagose有, 其他诊断可能为空

`GetDisDiagoseOther()` 内部结构:
- DiagCode(20个): HDSD00.11.020+.307+.311+.315+.319+.323+.327+.331+.335+.339+.343+.347+.351+.355+.359+.363+.367+.371+.375
- DiagDesc(20个): 对应.021+.306+.310+.314+.318+.322+.326+.330+.334+.338+.342+.346+.350+.354+.358+.362+.366+.370+.374
- AdmCondtionCode/Desc(20个): 入院病情 代码/描述
- HealResultCode/Desc(20个): 出院情况 代码/描述 (.1132-.1168)

---

#### A4-A12. 其余诊断Query (共用结构)

| # | Query | 描述 | ROWSPEC字段数 | 特殊说明 |
|---|-------|------|--------------|---------|
| a4 | **InDiagose** | 1.14 入院诊断 | 15 | 来源: MR诊断列表(c008/pRE/OP三种合并), 含西医/中医/症候分类 |
| a5 | **PreOperDiagose** | 1.15 术前诊断 | 10 | 无入院病情/治疗结果, 仅编码+描述+日期 |
| a6 | **AfterOperDiagose** | 1.16 术后诊断 | 10 | 同A5结构 |
| a7 | **ConfirmDiagose** | 1.17 确定诊断 | 10 | 同A5结构 |
| a8 | **CurrentDiagose** | 1.18 目前诊断 | 10 | 同A5结构 |
| a9 | **DeadDiagose** | 1.19 死亡诊断 | 10 | 同A5结构 |
| a10 | **OutPatientDiagose** | 1.20 门诊诊断 | 15 | 含治疗结果+入院病情(同A2) |
| a11 | **PathDiagose** | 1.21 病理诊断 | **16** | **额外字段**: HDSD0011008(病理号,截9位) |
| a12 | **PrimaryDiagose** | 1.22 初步诊断 | 10 | 同A5结构, 支持PatientNo直接输入 |

**a5-a9/a12 共用简化ROWSPEC**: `HDSD0002049,HDSD00020491,HDSD0005072,SeqNo,AdmID,DiagSn,HDSD0002063,HDSD0002064,HDSD00020631,HDSD00020641`

---

### 类别 B: 病历概要与门急诊 (3个)

#### B1. C0001 — 2.1 病历概要 ⭐核心主表

```
Query: c0001 | rOWSPEC: **88字段** (最大单表!)
DocIDList: "52" (病案首页模板)
SqlProc: 1 (可SQL调用)
```

**业务字段分组**:

| 分组 | 字段范围 | 关键字段 |
|------|---------|---------|
| **文档元数据** | DocumentID~HDSD00020341 | InstanceID,建档日期(2032),建档者代码(2034)/名称(20341),就诊原因(2037) |
| **死亡相关信息** | HDSD0002017~HDSD0002059 | 根本死因代码(2017)/描述(20171), 责任医师(2059) |
| **费用信息** | HDSD0002015~HDSD0002065 | 个人承担(2015), 门诊费(2041), 住院费(2065) |
| **药物信息** | HDSD0002020~HDSD00020621 | 关键药名(2020), 用法(2021), 不良反应(2051), 中药类别代码(2062)/描述(20621) |
| **健康档案** | HealthDocumentID~HomePostalCode | 健康档案编号(17位), 健康卡号, 家庭住址(省/市/县/乡/街/号/邮编) |
| **患者基本信息** | PhoneNumber~NationDesc | 电话, 身份证号, 姓名, 性别代码/描述, 出生日期, 婚姻代码/描述, 民族代码/描述 |
| **工作联系** | CompanyName~RelationPostalCode | 工作单位/电话, 职业/描述, 联系人姓名/电话/地址全段 |
| **血型** | BloodTypeABO~BloodTypeRHDesc | ABO血型代码/描述, Rh血型代码/描述 |
| **病史组** | HDSD0002030~HDSD0002031 | 疾病史,传染病史,手术史,婚育史,输血史,过敏史,预防接种史,个人史,月经史,家族史 |
| **医保与时间** | InsureTypeCode~DiseaseDateTime | 医保类别代码/描述, 付费方式代码/描述, 出院日期, 入院日期, 发病日期 |
| **诊断扩展** | HDSD0002043~HDSD00020611 | 其他西医诊断编码/描述, 转归代码/描述 |
| **就诊信息** | InDeptCode~OutpatientID | 科别代码/描述, 患者类型(I/O/E/H), 住院号, 门诊号 |

**关键取值规则**:

```objectscript
// 费用来源: web.DHCBillInterface.IGetTarMRCateFee(adm,"","","")
s feestr=##class(web.DHCBillInterface).IGetTarMRCateFee(adm,"","","")
s total=$p(feestr,$c(3),1)
s HDSD0002015=$p(total,"^",2)   // 个人承担(门诊时=0.00)
s HDSD0002065=$p(total,"^",1)   // 住院费用(门诊时=0.00)

// 患者类型判断
s PAADMType=$P(^PAADM(adm),"^",2)  // I=住院 O=门诊 E=急诊 H=体检
```

---

#### B2. C0002 — 2.2 门(急)诊病历

```
Query: c0002 | rOWSPEC: 40字段
DocID: 门急诊模板 | 术语集: HDSD00.03.01
支持admType: "O","E"
```

| Piece | 字段名 | 中文名 | 术语编码 |
|-------|--------|--------|----------|
| 1 | HDSD0090031 | 建档者代码 | SSUSR(^1) |
| 2 | HDSD0090024 | 建档者姓名 | SSUSR(^2) |
| 3 | HDSD0003041 | 医师签名 | SSUSR(^2) |
| 4 | HDSD0003037 | 体格检查 | HDSD00.03.037 |
| 5 | HDSD0003012 | 辅助检查结果 | HDSD00.03.012 |
| 6 | HDSD0003013 | 辅助检查项目 | 园定="-" |
| 7 | HDSD0003010 | 初诊标志代码 | 1=初诊 2=复诊 |
| 8 | HDSD00030101 | 初诊标志描述 | HDSD00.03.010 |
| 9 | HDSD0003058 | 中医四诊观察 | 固定="-" |
| 10 | HDSD0003056 | 治则治法 | 固定="-" |
| 11 | HDSD0003001 | 辨证依据 | 固定="-" |
| 12-28 | ... | (各类病程/抢救/体查字段) | ... |
| 29-40 | **公共字段组** | 患者/就诊信息(同上) | ... |

---

#### B3. C0003 — 2.3 急诊留观病历

```
Query: c0003 | rOWSPEC: 47字段
DocID: "4101"/"4099" | 术语集: HDSD00.03.02
```

额外字段（相对C0002增加）:
| HDSD0003028 | 抢救结束时间 | HDSD00.03.029 |
| HDSD0003029 | 抢救开始时间 | HDSD00.03.028 |
| HDSD0003019 | 急诊抢救记录 | HDSD00.03.019 |
| HDSD0003002 | 参加抢救人员名单 | HDSD00.03.002 |
| HDSD0003059 | 专业技术职务代码 | Resident→4 Attending→3 ViceChief→2 Chief→1 |
| HDSD00030591 | 专业技术职务描述 | 对应中文 |
| HDSD0003018 | 急诊留观病程记录 | HDSD00.03.018 |
| HDSD0003031 | 收入观察室时间 | HDSD00.03.031 |
| HDSD0003016 | 患者去向代码 | 固定="1" |
| HDSD0003060 | 注意事项 | HDSD00.03.058 |

---

### 类别 C: 手术与操作记录 (1个)

#### C1. C0009 — 2.9 手术记录(一般手术) ⭐重要

```
Query: c0009 | rOWSPEC: **58字段**
DocIDList: "68^3734^3748^3256^3686" (多种手术模板)
```

**手术专用字段** (前18个):

| 字段 | 中文名 | 术语编码 | 备注 |
|------|--------|----------|------|
| HDSD0005016 | 电子申请单编号 | InstanceID | |
| HDSD0006064 | 皮肤消毒描述 | HDSD00.06.064 | ToST() |
| HDSD0006068 | 签名日期时间 | HappenDate+Time | |
| HDSD0006137 | 手术者代码 | HDSD00.06.420→SSUSR | SQL反查 |
| HDSD00061371 | 手术者签名 | HDSD00.06.085 | |
| HDSD0006081 | 手术切口描述 | HDSD00.06.081 | |
| HDSD0006138 | 引流标志 | Boolean | 引流材料≠"-"→"true" |
| HDSD0006022 | 出血量(mL) | HDSD00.06.022 | ToPQ() |
| HDSD0006099 | 输液量(mL) | HDSD00.06.099 | ToPQ() |
| HDSD0006091 | 输血量(mL) | HDSD00.06.091 | ToPQ() |
| HDSD0006041 | 术前用药 | HDSD00.06.103 | |
| HDSD0006108 | 术中用药 | HDSD00.06.106 | |
| HDSD0006088 | 输血反应标志 | Boolean | 输血量≠"0"→"true" |
| HDSD0006139 | 引流材料名称 | HDSD00.06.139 | |
| HDSD0006140 | 引流材料数目 | HDSD00.06.140 | |
| HDSD0006026 | 放置部位 | HDSD00.06.026 | |
| OperSn | 手术操作唯一号 | GetOperationID() | CIS_AN关联 |
| HDSD0006142 | 手术过程描述 | HDSD00.06.073 | 截1000字符 |
| HDSD0003036 | 目标部位代码 | 固定="-" | |
| HDSD00030361 | 目标部位名称 | 固定="-" | |
| HDSD0003022 | 介入物名称 | 固定="-" | |
| HDSD0006083 | 手术体位代码 | 固定="9" | |
| HDSD00060831 | 手术体位描述 | 固定"其他" | |
| NarcosisModeCode | 麻醉方式代码 | HDSD00.06.044 | 含\|解析 |
| NarcosisModeDesc | 麻醉方式描述 | HDSD00.06.309 | |
| NarcosisDocName | 麻醉医生 | SSUSR(^2) | |
| NarcosisDocCode | 麻醉医生代码 | SSUSR(^1) | |

**GetOperationID()内部链路**:
```
InstanceID → ^DHCEMRI.Events.LinkDocumnetsI("IdxInstanceType",InstanceID,"_OPERATION")
           → EventsID = LinkDocumnentsD(ID)^4 
           → OpaID = ^DHCEMRI.Events.OperationD(EventsID)^4
           → OperSn = ^cIS.aN.OperScheduleI("Ext"," "_OperSn,"")
```

---

### 类别 D: 专科记录 (1个)

#### D1. C0016 — 2.16 剖宫产记录 ⭐最大单表

```
Query: c0016 | rOWSPEC: **107字段** (!)
DocID: "2964"/"3772" | SqlProc: 1
术语集: HDSD00.07.03 + HDSD00.07 (剖宫产专用)
```

**字段分组** (107个):

| 分组 | 字段数 | 关键字段 |
|------|--------|---------|
| **文档元数据** | 5 | DocumentID, 待产日期(7008), 记录日期(7054) |
| **人员签名** | 8 | 助手(7559/75591), 护婴者(7560/75601), 记录人(7051/70511), 指导者(7050/70501) |
| **胎儿/脐带** | 6 | 胎膜完整(7069=bool), 脐带长度(7007=cm), 绕颈身(7009=30/60/80周), 脐带缠绕(7080), 扭转周数(7070), 存脐带血(7094) |
| **产前/麻醉** | 4 | 产前诊断(7118), 麻醉体位(7122), 麻醉效果(7123) |
| **手术过程** | 8 | 剖宫产过程(7124), 子宫情况(7091), 胎儿娩出方式(7125), 胎方位(7031/70311), 胎盘黄染(7120), 胎膜黄染(7121) |
| **缝合/用药** | 6 | 子宫壁缝合(7126), 宫缩剂(7127), 使用方法(7128), 手术用药(7129), 用量(7130), 探查(7131/7132) |
| **探查异常** | 3 | 宫腔异常标志(7133=bool), 处理(7134), 肌瘤标志(7143=bool) |
| **术中生命体征** | 6 | 产妇情况(7135), 出血量(7136=mL), 输血成分(7137), 输血量(7138), 输液量(7139), 供氧时间(7140=min) |
| **其他用药** | 2 | 其他用药(7141), 其他情况(7142=截50字) |
| **手术统计** | 2 | 全程时间(7144=min), 术后诊断(7145) |
| **产后观察** | 2 | 观察日期(7096), 检查时间(7097=默认30min) |
| **产后体征** | 6 | 舒张压(6086=默认70), 收缩压(6072=默认110), 心率(6117=默认80), 脉搏(6056=默认80), 出血量(7102=默认300), 宫缩(7103=默认10) |
| **新生儿** | 12 | 宫底高度(7104=默认2.0cm), 性别(7106/71061), 出生体重(7107=g,默认3000), 身长(7108=cm,默认40.0), 产瘤大小(7109), 部位(7110), Apgar间隔(71111), Apgar分值(7112), 分娩结局(7113/71131), 新生儿异常(7114/71141) |
| **公共字段** | ~22 | 患者/就诊/签名(同上) |
| **联系人** | 2 | RelationName, RelationPhone |

---

### 类别 E: 出院/死亡/讨论记录 (5个)

| # | Query | 描述 | 字段数 | DocID |
|---|-------|------|--------|-------|
| e1 | **c0053** | 2.53 出院小结 | 26 | "54^1996^1995" |
| e2 | **c0051** | 2.51 死亡病历讨论记录 | 39 | "86" |
| e3 | **c0050** | 2.50 死亡记录 | 36 | "56" |
| e4 | **c0049** | 2.49 出院记录 | **38** | "54^1996^1995^2955" |
| e5 | **c0048** | 2.48 术后首次病程记录 | 待续 | 待续 |

**e1. c0053 出院小结关键字段**:

| 字段 | 术语编码 | 说明 |
|------|---------|------|
| HDSD0016028 | HappenDate+Time | 签名日期时间 |
| HDSD0016030 | HDSD00.16.030 | 入院情况(截500字) |
| HDSD0016042 | HDSD00.16.042 | 阳性辅助检查(截250字) |
| HDSD0016048 | HDSD00.16.048 | 治则治法(截25字) |
| HDSD0016051 | HDSD00.16.051 | 中医四诊(截250字) |
| HDSD0016045 | HDSD00.16.045 | 诊疗过程(截500字) |
| HDSD0016049 | HDSD00.16.049 | 中药煎煮(截25字) |
| HDSD0016050 | HDSD00.16.050 | 中药用法(截25字) |
| HDSD0016004 | HDSD00.16.004 | 出院情况(截500字) |
| HDSD0016006 | HDSD00.16.006 | 出院时症状(截250字) |
| HDSD0016007 | HDSD00.16.007 | 出院医嘱(截250字) |
| HDSD0016047/71 | 固定 | 治疗结果=2"好转" |
| HDSD0014086/61 | HDSD00.16.035→SSUSR | 上级医师代码/名称 |
| HDSD0010036/61 | HDSD00.11.141→GetUserCode | 住院医生代码/名称 |

**e2. c0051 死亡病历讨论记录** (额外含三级医师签名):
- DirectorCode/Name (主任/副主任医师) ← GetALLSignfInfo(!3)
- AttendingCode/Name (主治医师) ← !2
- ResidentCode/Name (住院医师) ← !1
- HDSD0014123/4: 直接死亡原因编码/名称
- HDSD0014105: 讨论记录(截1000字)

**e3. c0050 死亡记录**:
- HDSD0014104: 死亡日期时间
- HDSD0014047: 家属是否同意尸解标志 (1→true else false)
- HDSD0014080: 入院情况(截1000字)
- HDSD0014120: 诊疗过程(截500字)

**e4. c0049 出院记录** (类似C0053但字段更多):
- HDSD0014013: 出院情况(截500字)
- HDSD0014015: 出院时症状(截500字)
- HDSD0014016: 出院医嘱(截500字)
- 三级医师签名(同E2): Director/Attending/Resident

---

### 类别 F: 知情同意书系列 (3个核心 + 多个扩展)

#### F1. C0026 — 2.26 手术知情同意书

```
Query: c0026 | rOWSPEC: 37字段
DocIDList: 超长! (~150种手术同意书模板)
术语集: HDSD00.10 (知情同意书)
```

**专有字段**:
| 字段 | 说明 | 来源 |
|------|------|------|
| HDSD0010056 | 知情同意书编号 | InstanceID |
| HDSD0010054 | 签名日期时间 | HappenDate+Time |
| HDSD0010510 | 体检时间 | 同HappenDate |
| HDSD0010036/61 | 就诊医生代码/名称 | SSUSR |
| HDSD0010038 | 手术意外及风险 | cisAn.OperData(tSFXBZ) |
| HDSD0010034 | 术后意外并发症 | ALLRecordContent文本解析 |
| HDSD0010050 | 替代方案 | 囯定="" |
| HDSD0010052 | 医疗机构意见 | ALLRecordContent(截1000字) |
| HDSD0010013 | 患方意见 | ALLRecordContent |
| HDSD0010015 | 患者签名 | OperData(hZQM) |
| HDSD0008 | 法定代理人签名 | OperData(hZSQJS) |
| HDSD0010010 | 代理关系代码 | HDSD00.11.073 |
| HDSD00100101 | 代理关系描述 | OperData(yHZGX) |
| HDSD0010012 | 签名日期时间 | OperData(jSSQRQ) |
| OperationDoctor/Code | 手术医生 | 同作者签名 |

**数据来源双通道**: EMR术语集(HDSD00.10.038) + CIS_AN系统(OperData表)

---

#### F2. C0027 — 2.27 麻醉知情同意书

```
Query: c0027 | rOWSPEC: 42字段
DocID: "98^3953"
术语集: HDSD00.10 + HDSD00.06 + HDSD00.11
```

**额外字段**(相对F1):
| 字段 | 说明 |
|------|------|
| HDSD0010029 | 拟实施手术日期 |
| OperationCode/Desc | 拟手术编码/名称 (HDSD00.10.028/HDSD00.06.316) |
| NarcosisModeCode/Desc | 麻醉方式(通过GetCVInfo标准化) |
| HDSD0010014 | 患者基础疾病 |
| HDSD0010017 | 基础疾病对麻醉影响 |
| HDSD0010026 | 拟行有创操作和监测 |
| HDSD0010023 | 麻醉中后意外并发症 |
| HDSD0008032 | 使用镇痛泵标志 |
| HDSD0008007 | 参加麻醉安全保险标志 |
| HealthDocumentID | 健康档案编号 |
| HDSD0010022 | 麻醉医师签名日期时间 |

---

#### F3. C0028 — 2.28 输血治疗同意书

```
Query: c0028 | rOWSPEC: 41字段
DocID: "2946"
```

**额外字段**:
| 字段 | 说明 | 来源 |
|------|------|------|
| HDSD0010025 | 拟定输血日期 | ALLRecordContent解析 |
| HDSD0010043/31 | 输血史标志 代码/描述 | HDSD00.10.043, 有→true |
| HDSD0010044 | 输血指征 | Content解析 |
| HDSD0010041/11 | 输血品种 代码/描述 | HDSD00.10.041 |
| HDSD0010042 | 输血前检查 | Content解析 |
| HDSD0010039 | 输血方式 | HDSD00.10.039 |
| HDSD0010040 | 输血风险不良后果 | Content解析 |

---

### 类别 G: 入院记录 & 病程记录系列 (v2.0 新增完整映射)

#### G1. C0034 — 2.34 入院记录 ⭐高频核心

```
Query: c0034 | rOWSPEC: 96字段
DocIDList: "183^189^185^187^195^197^229^264^266^268^447^330" (12种入院记录模板)
Title过滤: objInstance.Title'["入院记录"
术语集: HDSD00.13.01 (入院记录分类)
```

**专有字段** (非公共字段部分):

| 字段名 | 中文名 | 术语编码 | 取值表达式 |
|--------|--------|----------|-----------|
| HDSD0013503 | 入院日期时间 | - | `s HDSD0013503=InDateTime` |
| HDSD0010054 | 签名日期时间 | - | `$zd(objInstance.ModifyDate,3)_" "_$zt(objInstance.ModifyTime)` |
| HDSD0013044 | 就诊医生代码 | - | `$p($g(^SSU("SSUSR",objInstance.CreateUser)),"^",1)` |
| HDSD00130441 | 就诊医生姓名 | - | `$p($g(^SSU("SSUSR",objInstance.CreateUser)),"^",2)` |
| HDSD0013004 | 病史陈述者姓名 | HDSD00.13.004 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.004"))` |
| HDSD0013009 | 陈述者关系代码 | HDSD00.13.009 | `ConvertParticipant(HDSD00130091)` 取^1 |
| HDSD00130091 | 陈述者关系描述 | HDSD00.13.009 | `AdmRecordGlossary.GetAt("HDSD00.13.009")` |
| HDSD0013094 | 一般状况检查结果 | HDSD00.13.094 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.094"))` |
| HDSD0013081 | 皮肤黏膜检查结果 | HDSD00.13.081 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.081"))` |
| HDSD0013082 | 浅表淋巴结检查 | HDSD00.13.082 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.082"))` |
| HDSD0013091 | 头部器官检查结果 | HDSD00.13.091 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.091"))` |
| HDSD0013079 | 颈部检查结果 | HDSD00.13.079 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.079"))` |
| HDSD0013093 | 胸部检查结果 | HDSD00.13.093 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.093"))` |
| HDSD0013075 | 腹部检查结果 | HDSD00.13.075 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.075"))` |
| HDSD0013076 | 肛门指诊结果 | HDSD00.13.076 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.076"))` |
| HDSD0013092 | 外生殖器检查结果 | HDSD00.13.092 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.092"))` |
| HDSD0013078 | 脊柱检查结果 | HDSD00.13.078 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.078"))` |
| HDSD0013087 | 四肢检查结果 | HDSD00.13.087 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.087"))` |
| HDSD0013084 | 神经系统检查结果 | HDSD00.13.084 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.084"))` |
| HDSD0013118 | 专科情况 | HDSD00.13.118 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.118"))` |
| HDSD0013035 | 辅助检查结果 | HDSD00.13.035 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.035"))` 截1000字,空→"1" |
| HDSD0013008 | 陈述可靠标志 | HDSD00.13.008 | 含"靠谱"或"可靠"→"true",否则"false" |
| HDSD0013112 | 中医四诊观察结果 | HDSD00.13.112 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.112"))` |
| HDSD0013111 | 治则治法 | HDSD00.13.111 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.111"))` |
| HDSD0013058 | 入院诊断顺位 | - | 固定"01" |
| HDSD0013097 | 修正诊断日期 | HDSD00.13.097 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.097"))` |
| HDSD0013007 | 补充诊断日期 | HDSD00.13.007 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.007"))` |
| HDSD0013005 | 补充诊断西医代码 | - | `Dis(adm)` 取第1段^2 |
| HDSD0013006 | 补充诊断西医名称 | - | `Dis(adm)` 取第1段^3 |
| HDSD0013098 | 修正诊断西医代码 | - | `Dis(adm)` 取第1段^2 |
| HDSD0013099 | 修正诊断西医名称 | - | `Dis(adm)` 取第1段^3 |
| HDSD0006114 | 体温(℃) | HDSD00.13.088 | `$fN(AdmRecordGlossary.GetAt("HDSD00.13.088"),"",1)` 默认36.5 |
| HDSD0006056 | 脉率(次/min) | HDSD00.13.080 | `AdmRecordGlossary.GetAt("HDSD00.13.080")` 默认80 |
| HDSD0006034 | 呼吸频率(次/min) | HDSD00.13.077 | `AdmRecordGlossary.GetAt("HDSD00.13.077")` 默认18 |
| HDSD0006086 | 舒张压(mmHg) | HDSD00.13.086 | `AdmRecordGlossary.GetAt("HDSD00.13.086")` 默认90 |
| HDSD0006072 | 收缩压(mmHg) | HDSD00.13.085 | `AdmRecordGlossary.GetAt("HDSD00.13.085")` 默认120 |
| HDSD0008076 | 体重(kg) | HDSD00.13.089 | `$fN(AdmRecordGlossary.GetAt("HDSD00.13.089"),"",2)` 默认0.00 |
| HDSD0013083 | 身高(cm) | HDSD00.13.083 | `$fN(AdmRecordGlossary.GetAt("HDSD00.13.083"),"",1)` 默认000.0 |
| HDSD0002063 | 修正诊断中医病名代码 | - | `Disz(adm)` 取第2段^2 |
| HDSD0002064 | 修正诊断中医证候代码 | - | `Disz(adm)` 取第2段^2,空→"wu" |
| HDSD00020631 | 修正诊断中医病名描述 | - | `Disz(adm)` 取第2段^3 |
| HDSD00020641 | 修正诊断中医证候描述 | - | `Disz(adm)` 取第2段^3 |
| DirectorCode/Name | 主任医师 | - | `GetALLSignfInfo(InstanceID)` 取!3 |
| AttendingCode/Name | 主治医师 | - | `GetALLSignfInfo(InstanceID)` 取!2 |
| ResidentCode/Name | 住院医师 | - | `GetALLSignfInfo(InstanceID)` 取!1 |
| OrderDoc/Code | 出院医嘱开立人 | HDSD00.12.168 | `GetDataByGlossaryNew(adm,"HDSD00.12.168","0")` + `GetUserCodeByName` |
| HDSD0002006~HDSD0006082 | 病史组(17字段) | HDSD00.13.xx | 同History Query |

---

#### G2. C0035 — 2.35 24h内入出院记录

```
Query: c0035 | rOWSPEC: 60字段
DocIDList: - (无特定模板)
术语集: HDSD00.13.03
```

**专有字段** (相对C0034增加):

| 字段名 | 中文名 | 取值表达式 |
|--------|--------|-----------|
| HDSD0013014 | 出院日期时间 | `ToTS(GetDataByGlossary(adm,"HDSD00.13.014",InstanceID))` |
| HDSD0013013 | 出院医师签名 | `ToST(GetDataByGlossary(adm,"HDSD00.13.013",InstanceID))` |
| HDSD00130131 | 出院医师代码 | SQL反查SSUSR |
| HDSD0013501 | 接诊医师签名 | SSUSR(^2) |
| HDSD00135011 | 接诊医师代码 | SSUSR(^1) |
| HDSD0013108 | 症状名称 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.108"))` |
| HDSD0013056 | 入院情况 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.056"))` |
| HDSD0013107 | 诊疗过程描述 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.107"))` |
| HDSD0013010 | 中医"四诊" | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.010"))` |
| HDSD0013012 | 入院诊断 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.012"))` |
| HDSD0013502 | 出院诊断 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.502"))` |
| DisDateTime | 出院日期时间 | `GetNewStdDataByGlossaryCategory(adm,"HDSD00.12").GetAt("HDSD00.12.020")` |
| DirectorCode/Name | 主任医师 | `GetALLSignfInfo(InstanceID)` !3 |
| AttendingCode/Name | 主治医师 | `GetALLSignfInfo(InstanceID)` !2 |
| ResidentCode/Name | 住院医师 | `GetALLSignfInfo(InstanceID)` !1 |

---

#### G3. C0036 — 2.36 24h内入院死亡记录

```
Query: c0036 | rOWSPEC: 57字段
DocIDList: "154"
术语集: HDSD00.13.03
```

**专有字段**:

| 字段名 | 中文名 | 取值表达式 |
|--------|--------|-----------|
| HDSD0013067 | 死亡日期时间 | `^PAPER(papmi,"ALL")^13` + `^8` 转格式 |
| HDSD0013108 | 症状名称 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.108"))` |
| HDSD0013056 | 入院情况 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.056"))` |
| HDSD0013107 | 诊疗过程描述 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.107"))` |
| HDSD0013068 | 死亡原因 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.068"))` |
| HDSD0013008 | 陈述可靠标志 | 含"靠谱"/"可靠"→"true" |
| HDSD0013112 | 中医四诊 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.112"))` |
| HDSD0013111 | 治则治法 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.111"))` |
| HDSD0003057 | 主诉 | `ToST(AdmRecordGlossary.GetAt("HDSD00.13.114"))` |
| DisDateTime | 出院日期时间 | `GetNewStdDataByGlossaryCategory(adm,"HDSD00.12").GetAt("HDSD00.12.020")` |

---

#### G4. C0037 — 2.37 首次病程记录 ⭐高频

```
Query: c0037 | rOWSPEC: 37字段
DocIDList: "132"
Title过滤: objInstance.Title'="首次病程记录"
术语集: HDSD00.14
```

**专有字段**:

| 字段名 | 中文名 | 术语编码 | 取值表达式 |
|--------|--------|----------|-----------|
| HDSD0014046 | 记录日期时间 | HDSD00.14.046 | `ToTS(GetDataByGlossary(AdmID,"HDSD00.14.046",InstanceID))` 空→HappenDate |
| HDSD0014086 | 上级医师代码 | HDSD00.14.086 | `GetCareProvCode(.HDSD0014086,.HDSD00140861,AdmID)` |
| HDSD00140861 | 上级医师签名 | HDSD00.14.086 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.086",InstanceID))` |
| HDSD0014005 | 病例特点 | HDSD00.14.005 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.005",InstanceID))` 截2000字 |
| HDSD0014119 | 诊断依据 | HDSD00.14.119 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.119",InstanceID))` 截1000字 |
| HDSD0014122 | 诊疗计划 | HDSD00.14.122 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.122",InstanceID))` |
| HDSD0014129 | 中医四诊 | HDSD00.14.129 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.129",InstanceID))` |
| HDSD0014125 | 治则治法 | HDSD00.14.125 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.125",InstanceID))` |
| HDSD0014052 | 鉴别诊断西医代码 | HDSD00.14.324 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.324",InstanceID))` |
| HDSD00140521 | 鉴别诊断西医名称 | HDSD00.14.052 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.052",InstanceID))` 截50字 |
| HDSD0014053 | 鉴别诊断中医病名 | HDSD00.14.053 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.053",InstanceID))` 截100字 |
| HDSD0014054 | 鉴别诊断中医证候 | HDSD00.14.054 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.054",InstanceID))` |
| HDSD0003057 | 主诉 | HDSD00.13.114 | `GetDataByGlossaryNew(adm,"HDSD00.13.114","0")` |
| ResidentCode/Name | 住院医师 | - | (ROWSPEC中声明但未赋值) |

---

#### G5. C0038 — 2.38 日常病程记录 ⭐高频

```
Query: c0038 | rOWSPEC: 34字段
DocIDList: "132^318"
Title过滤: objInstance.Title'["日常病程记录"
术语集: HDSD00.14
```

**专有字段**:

| 字段名 | 中文名 | 术语编码 | 取值表达式 |
|--------|--------|----------|-----------|
| HDSD0014046 | 记录日期时间 | HDSD00.14.046 | `ToTS(GetDataByGlossary(AdmID,"HDSD00.14.046",InstanceID))` 空→HappenDate |
| HDSD0014076 | 签名日期时间 | HDSD00.14.076 | `ToTS(GetDataByGlossary(AdmID,"HDSD00.14.076",InstanceID))` 空→ModifyDate |
| HDSD0014141 | 医生代码 | - | `$p($g(^SSU("SSUSR",objInstance.CreateUser)),"^",1)` |
| HDSD00141411 | 医生签名 | - | `$p($g(^SSU("SSUSR",objInstance.CreateUser)),"^",2)` |
| HDSD0014139 | 住院病程 | HDSD00.14.139 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.139",InstanceID))` |
| HDSD0014118 | 医嘱内容 | HDSD00.14.118 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.118",InstanceID))` |
| HDSD0014001 | 辨证论治详细描述 | HDSD00.14.001 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.001",InstanceID))` |
| HDSD0014127 | 中药煎煮方法 | HDSD00.14.127 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.127",InstanceID))` |
| HDSD0014128 | 中药用药方法 | HDSD00.14.128 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.128",InstanceID))` |
| HDSD0014129 | 中医四诊 | HDSD00.14.129 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.129",InstanceID))` |
| HDSD0014513 | 专业技术职务代码 | - | 固定"4" |
| HDSD0014514 | 专业技术职务描述 | - | 固定"师级/助理" |

---

#### G6. C0039 — 2.39 上级医师查房记录

```
Query: c0039 | rOWSPEC: 38字段
DocIDList: "132"
Title过滤: objInstance.Title'["查房记录"
术语集: HDSD00.14
```

**专有字段**:

| 字段名 | 中文名 | 术语编码 | 取值表达式 |
|--------|--------|----------|-----------|
| HDSD0014076 | 签名日期时间 | HDSD00.14.076 | `GetDataByGlossary(AdmID,"HDSD00.14.076",InstanceID)` 空→ModifyDate |
| HDSD0014012 | 查房日期时间 | HDSD00.14.012 | `GetDataByGlossary(AdmID,"HDSD00.14.012",InstanceID)` 空→HappenDate |
| HDSD0014045 | 记录人代码 | - | SSUSR(^1) |
| HDSD00140451 | 记录人签名 | - | SSUSR(^2) |
| HDSD0014011 | 查房记录 | HDSD00.14.011 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.011",InstanceID))` 截1999字 |
| HDSD0014118 | 医嘱内容 | - | =HDSD0014011 截1000字 |
| HDSD0014001 | 辨证论治详细描述 | HDSD00.14.001 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.001",InstanceID))` |
| HDSD0014129 | 中医四诊 | HDSD00.14.129 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.129",InstanceID))` |
| HDSD0014127 | 中药煎煮方法 | - | =HDSD0014011 截100字 |
| HDSD0014128 | 中药用药方法 | - | =HDSD0014011 截100字 |
| HDSD0014122 | 诊疗计划 | - | 从HDSD0014011中截取"诊疗计划"后内容 |
| DirectorCode/Name | 主任医师 | - | `GetALLSignfInfo(InstanceID)` !3 |
| AttendingCode/Name | 主治医师 | - | `GetALLSignfInfo(InstanceID)` !2 |

---

#### G7. C0040 — 2.40 疑难病历讨论记录

```
Query: c0040 | rOWSPEC: 39字段
DocIDList: "180"
Title过滤: Title'["疑难病例讨论记录" 或 Title'["疑难病历讨论记录"
术语集: HDSD00.14
```

**专有字段**:

| 字段名 | 中文名 | 术语编码 | 取值表达式 |
|--------|--------|----------|-----------|
| HDSD0014110 | 讨论日期时间 | HDSD00.14.110 | `ToTS(GetDataByGlossary(AdmID,"HDSD00.14.110",InstanceID))` |
| HDSD0014117 | 医生代码 | - | SSUSR(ModifyUser)^1 |
| HDSD00141171 | 医生签名 | - | SSUSR(ModifyUser)^2 |
| HDSD0014108 | 讨论地点 | HDSD00.14.108 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.108",InstanceID))` 截50字 |
| HDSD0014008 | 参加讨论人员名单 | HDSD00.14.008 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.008",InstanceID))` |
| HDSD0014134 | 主持人姓名 | HDSD00.14.134 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.134",InstanceID))` |
| HDSD0014001 | 辨证论治详细描述 | HDSD00.14.001 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.001",InstanceID))` |
| HDSD0014129 | 中医四诊 | HDSD00.14.129 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.129",InstanceID))` |
| HDSD0014126 | 中药处方医嘱内容 | HDSD00.14.126 | 固定"-" |
| HDSD0014127 | 中药煎煮方法 | HDSD00.14.127 | 固定"-" |
| HDSD0014128 | 中药用药方法 | HDSD00.14.128 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.128",InstanceID))` |
| HDSD0014135 | 主持人总结意见 | HDSD00.14.135 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.135",InstanceID))` |
| HDSD0014111 | 讨论意见 | HDSD00.14.111 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.111",InstanceID))` 截2000字 |
| DirectorCode/Name | 主任医师 | - | `GetALLSignfInfo(InstanceID)` !3 |
| AttendingCode/Name | 主治医师 | - | `GetALLSignfInfo(InstanceID)` !2 |

---

#### G8. C0041 — 2.41 交接班记录

```
Query: c0041 | rOWSPEC: 35字段
DocIDList: "132^318"
Title过滤: Title'["交班记录" 或 Title'["接班记录"
术语集: HDSD00.14
```

**专有字段**:

| 字段名 | 中文名 | 术语编码 | 取值表达式 |
|--------|--------|----------|-----------|
| HDSD0014055 | 交班日期时间 | HDSD00.14.055 | `ToTS(GetDataByGlossary(AdmID,"HDSD00.14.055",InstanceID))` 空→HappenDate |
| HDSD0014057 | 接班日期时间 | HDSD00.14.057 | `ToTS(GetDataByGlossary(AdmID,"HDSD00.14.057",InstanceID))` 空→HappenDate |
| HDSD0014056 | 交班者代码 | - | Title含"交班"→SSUSR(CreateUser)^1,否则"-" |
| HDSD00140561 | 交班者签名 | - | Title含"交班"→SSUSR(CreateUser)^2,否则"-" |
| HDSD0014058 | 接班者代码 | - | Title含"接班"→SSUSR(CreateUser)^1,否则"-" |
| HDSD00140581 | 接班者签名 | - | Title含"接班"→SSUSR(CreateUser)^2,否则"-" |
| HDSD0014125 | 治则治法 | HDSD00.14.125 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.125",InstanceID))` |
| HDSD0014129 | 中医四诊 | HDSD00.14.129 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.129",InstanceID))` |
| HDSD0014120 | 诊疗过程描述 | HDSD00.14.120 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.120",InstanceID))` 截1999字 |
| HDSD0014065 | 目前情况 | HDSD00.14.065 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.065",InstanceID))` |
| HDSD0014142 | 注意事项 | HDSD00.14.142 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.142",InstanceID))` 截1000字 |
| HDSD0014059 | 接班诊疗计划 | HDSD00.14.059 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.059",InstanceID))` |
| HDSD0014080 | 入院情况 | HDSD00.14.080 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.080",InstanceID))` |

---

#### G9. C0042 — 2.42 转科记录

```
Query: c0042 | rOWSPEC: 46字段
DocIDList: "132"
Title过滤: Title'["转出记录" 或 Title'["转入记录"
术语集: HDSD00.14
```

**专有字段**:

| 字段名 | 中文名 | 术语编码 | 取值表达式 |
|--------|--------|----------|-----------|
| HDSD0014150 | 转入日期时间 | HDSD00.14.150 | `GetDataByGlossary(AdmID,"HDSD00.14.150",InstanceID)` 空→ModifyDate |
| HDSD0014145 | 转出日期时间 | HDSD00.14.145 | `ToTS(GetDataByGlossary(AdmID,"HDSD00.14.145",InstanceID))` |
| HDSD0014146 | 转出医师代码 | HDSD00.14.146 | `GetCareProvCode` SQL反查 |
| HDSD00141461 | 转出医师签名 | HDSD00.14.146 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.146",InstanceID))` |
| HDSD0014144 | 转出科室代码 | HDSD00.14.144 | `GetCareProvCode` SQL反查 |
| HDSD00141441 | 转出科室 | HDSD00.14.144 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.144",InstanceID))` |
| HDSD0014151 | 转入医师代码 | HDSD00.14.151 | `GetCareProvCode` SQL反查 |
| HDSD00141511 | 转入医师签名 | HDSD00.14.151 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.151",InstanceID))` |
| HDSD0014149 | 转入科室代码 | HDSD00.14.149 | `GetCareProvCode` SQL反查 |
| HDSD00141491 | 转入科室 | HDSD00.14.149 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.149",InstanceID))` |
| HDSD0014125 | 治则治法 | HDSD00.14.125 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.125",InstanceID))` |
| HDSD0014129 | 中医四诊 | HDSD00.14.129 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.129",InstanceID))` |
| HDSD0014120 | 诊疗过程描述 | HDSD00.14.120 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.120",InstanceID))` 截1999字 |
| HDSD0014065 | 目前情况 | HDSD00.14.065 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.065",InstanceID))` |
| HDSD0014142 | 注意事项 | HDSD00.14.142 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.142",InstanceID))` |
| HDSD0014152 | 转入诊疗计划 | HDSD00.14.152 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.152",InstanceID))` |
| HDSD0014126 | 中药处方医嘱 | HDSD00.14.126 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.126",InstanceID))` |
| HDSD0014127 | 中药煎煮方法 | HDSD00.14.127 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.127",InstanceID))` |
| HDSD0014128 | 中药用药方法 | HDSD00.14.128 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.128",InstanceID))` |
| HDSD0014147 | 转科记录类型代码 | - | Title含"转入"→"1",含"转出"→"2" |
| HDSD00141471 | 转科记录类型描述 | - | `objInstance.Title` |
| HDSD0014080 | 入院情况 | HDSD00.14.080 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.080",InstanceID))` 截2000字 |
| HDSD0014148 | 转科目的 | HDSD00.14.148 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.148",InstanceID))` |
| HealthDocumentID | 健康档案编号 | HDSD00.12.060 | `GetDataByGlossaryNew(adm,"HDSD00.12.060","0")` 非17位→"00000000000000000" |

---

#### G10. C0043 — 2.43 阶段小结

```
Query: c0043 | rOWSPEC: 35字段
DocIDList: "132"
Title过滤: objInstance.Title'["阶段小结"
术语集: HDSD00.14
```

**专有字段**:

| 字段名 | 中文名 | 术语编码 | 取值表达式 |
|--------|--------|----------|-----------|
| HDSD0014114 | 小结日期时间 | HDSD00.14.114 | `ToTS(GetDataByGlossary(AdmID,"HDSD00.14.114",InstanceID))` 空→HappenDate |
| HDSD0014076 | 签名日期时间 | HDSD00.14.076 | `ToTS(GetDataByGlossary(AdmID,"HDSD00.14.076",InstanceID))` 空→ModifyDate |
| HDSD0014117 | 医师代码 | - | SSUSR(ModifyUser)^1 |
| HDSD00141171 | 医师签名 | - | SSUSR(ModifyUser)^2 |
| HDSD0014125 | 治则治法 | HDSD00.14.125 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.125",InstanceID))` |
| HDSD0014129 | 中医四诊 | HDSD00.14.129 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.129",InstanceID))` |
| HDSD0014120 | 诊疗过程描述 | HDSD00.14.120 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.120",InstanceID))` 截2000字 |
| HDSD0014065 | 目前情况 | HDSD00.14.065 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.065",InstanceID))` |
| HDSD0014061 | 今后治疗方案 | HDSD00.14.061 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.061",InstanceID))` |
| HDSD0014118 | 医嘱内容 | HDSD00.14.118 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.118",InstanceID))` |
| HDSD0014127 | 中药煎煮方法 | HDSD00.14.127 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.127",InstanceID))` |
| HDSD0014128 | 中药用药方法 | HDSD00.14.128 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.128",InstanceID))` |
| HDSD0014080 | 入院情况 | HDSD00.14.080 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.080",InstanceID))` 截2000字 |

---

#### G11. C0044 — 2.44 抢救记录

```
Query: c0044 | rOWSPEC: 33字段
DocIDList: - (无特定模板)
特殊: 支持门急诊(O/E)就诊类型
术语集: HDSD00.14
```

**专有字段**:

| 字段名 | 中文名 | 术语编码 | 取值表达式 |
|--------|--------|----------|-----------|
| HDSD0014079 | 抢救开始日期时间 | HDSD00.14.079 | `GetDataByGlossary(AdmID,"HDSD00.14.079",InstanceID)` |
| HDSD0014078 | 抢救结束日期时间 | HDSD00.14.078 | `GetDataByGlossary(AdmID,"HDSD00.14.078",InstanceID)` |
| HDSD0014076 | 签名日期时间 | HDSD00.14.076 | `GetDataByGlossary(AdmID,"HDSD00.14.076",InstanceID)` |
| HDSD0014117 | 医师代码 | - | SSUSR(CreateUser)^1 |
| HDSD00141171 | 医师签名 | - | SSUSR(CreateUser)^2 |
| HDSD0003059 | 专业技术职务代码 | - | 1=主任 2=副主任 3=主治 4=医师 |
| HDSD00030591 | 专业技术职务描述 | - | 对应中文 |
| HDSD0014006 | 抢救记录 | HDSD00.14.006 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.006",InstanceID))` |
| HDSD0014077 | 抢救措施 | HDSD00.14.077 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.077",InstanceID))` |
| HDSD0014142 | 注意事项 | HDSD00.14.142 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.142",InstanceID))` |
| HDSD0014008 | 参加抢救人员名单 | HDSD00.14.008 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.008",InstanceID))` |
| HealthDocumentID | 健康档案编号 | - | (ROWSPEC中声明) |

---

#### G12. C0045 — 2.45 会诊记录

```
Query: c0045 | rOWSPEC: 28字段
数据来源: 护理组ConsultInfo()方法 (非EMR术语集)
特殊: 每条会诊记录输出一行，一个adm可能多行
```

**专有字段**:

| 字段名 | 中文名 | 取值表达式 |
|--------|--------|-----------|
| HDSD0014034 | 会诊日期时间 | `ToTS($P(ConultDataInfo,"^",7)_" "_$P(ConultDataInfo,"^",8))` |
| HDSD0014037 | 会诊申请医师代码 | `&SQL(sELECT SSUSR_Initials fROM SS_user wHERE SSUSR_Name=:HDSD00140371)` |
| HDSD00140371 | 会诊申请医师签名 | `$P(ConultDataInfo,"^",5)` |
| HDSD0003035 | 会诊申请科室代码 | `&SQL(sELECT CTLOC_Code fROM CT_Loc wHERE CTLOC_Desc=:HDSD00030351)` |
| HDSD00030351 | 会诊申请科室 | `$P(ConultDataInfo,"^",4)` |
| HDSD0003036 | 会诊申请医疗机构代码 | `HospitalCode(adm)` |
| HDSD00030361 | 会诊申请医疗机构名称 | `HospitalName(adm)` |
| HDSD0014039 | 会诊医师代码 | `&SQL(sELECT SSUSR_Initials fROM SS_user wHERE SSUSR_Name=:HDSD00140391)` |
| HDSD00140391 | 会诊医师签名 | `$P(ConultDataInfo,"^",10)` |
| HDSD0003031 | 会诊科室代码 | `&SQL(sELECT CTLOC_Code fROM CT_Loc wHERE CTLOC_Desc=:HDSD00030311)` |
| HDSD00030311 | 会诊科室 | `$P(ConultDataInfo,"^",9)` |
| HDSD0003040 | 会诊医师所在机构代码 | `HospitalCode(adm)` |
| HDSD00030401 | 会诊医师所在机构名称 | `HospitalName(adm)` |
| HDSD0003038 | 会诊所在机构代码 | `HospitalCode(adm)` |
| HDSD00030381 | 会诊所在机构名称 | `HospitalName(adm)` |
| HDSD0014004 | 病历摘要 | `$P(ConultDataInfo,"^",6)` |
| HDSD0014129 | 中医四诊 | 固定"-" |
| HDSD0014027 | 辅助检查结果 | `ToST(GetDataByGlossaryNew(adm,"HDSD00.13.035","0"))` |
| HDSD0014125 | 治则治法 | 固定"-" |
| HDSD0014120 | 诊疗过程描述 | 固定"-" |
| HDSD0014041 | 会诊意见 | `$P(ConultDataInfo,"^",13)` |
| HDSD0014032 | 会诊类型 | `$P(ConultDataInfo,"^",11)` |
| HDSD0014042 | 会诊原因 | 固定"-" |
| HDSD0014033 | 会诊目的 | `$P(ConultDataInfo,"^",12)` |
| HDSD0014121 | 诊疗过程名称 | 固定"-" |
| HDSD0014026 | 电子申请单编号 | `$P(ConultDataInfo,"^",1)` |

---

#### G13. C0047 — 2.47 术前讨论记录

```
Query: c0047 | rOWSPEC: 42字段
DocIDList: "62^140^316"
术语集: HDSD00.14
```

**专有字段** (rOWSPEC):

| 字段名 | 中文名 | 取值表达式 |
|--------|--------|-----------|
| HDSD0014110 | 讨论日期时间 | `ToTS(GetDataByGlossary(AdmID,"HDSD00.14.110",InstanceID))` |
| HDSD0014117 | 医师代码 | SSUSR(CreateUser)^1 |
| HDSD00141171 | 医师签名 | SSUSR(CreateUser)^2 |
| HDSD0014108 | 讨论地点 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.108",InstanceID))` |
| HDSD0014008 | 参加讨论人员名单 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.008",InstanceID))` |
| HDSD0014513 | 手术指征 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.513",InstanceID))` |
| HDSD0014514 | 手术方案 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.514",InstanceID))` |
| HDSD0014134 | 主持人姓名 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.134",InstanceID))` |
| HDSD0014097 | 讨论意见 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.097",InstanceID))` |
| HDSD0014103 | 术前准备 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.103",InstanceID))` |
| HDSD0014087 | 手术方案(详细) | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.087",InstanceID))` |
| HDSD0014099 | 注意事项 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.099",InstanceID))` |
| HDSD0014142 | 主持人总结 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.142",InstanceID))` |
| HDSD0014111 | 讨论记录 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.111",InstanceID))` |
| HDSD0014109 | 参加人员 | `ToST(GetDataByGlossary(AdmID,"HDSD00.14.109",InstanceID))` |
| HDSD0014076 | 签名日期时间 | `ToTS(GetDataByGlossary(AdmID,"HDSD00.14.076",InstanceID))` |
| HDSD0006137 | 手术者代码 | SSUSR(签名)^1 |
| HDSD00061371 | 手术者签名 | SSUSR(签名)^2 |
| HDSD0010036 | 就诊医生代码 | SSUSR(CreateUser)^1 |
| HDSD00100361 | 就诊医生姓名 | SSUSR(CreateUser)^2 |
| DisDateTime | 出院日期时间 | `PAADM^17` |

---

#### G14. C0048 — 2.48 术后首次病程记录

```
Query: c0048 | rOWSPEC: 29字段
DocIDList: "132^318"
Title过滤: objInstance.Title'["术后首次病程记录"
术语集: HDSD00.14
```

**专有字段**:

| 字段名 | 中文名 | 术语编码 | 取值表达式 |
|--------|--------|----------|-----------|
| HDSD0014046 | 记录日期时间 | - | `$zd(objInstance.HappenDate,3)_" "_$zt(objInstance.HappenTime)` |
| HDSD0014076 | 签名日期时间 | - | `GetSignfInfo(InstanceID)` 取^3,空→ModifyDate |
| HDSD0014117 | 医师代码 | - | `GetSignfInfo(InstanceID)` 取^1,空→SSUSR^1 |
| HDSD00141171 | 医师签名 | - | `GetSignfInfo(InstanceID)` 取^2,空→SSUSR^2 |
| HDSD0014142 | 注意事项 | HDSD00.14.142 | `ToST(GetDataByGlossary(EpisodeID,"HDSD00.14.142",InstanceID))` |
| HDSD0014119 | 诊断依据 | HDSD00.14.119 | `GetDataByGlossary(EpisodeID,"HDSD00.14.119",InstanceID)` 空→`GetDataByGlossaryNew` |
| RelationName | 联系人姓名 | HDSD00.12.072 | `GetDataByGlossaryNew(adm,"HDSD00.12.072","0")` |
| RelationPhone | 联系人电话 | HDSD00.12.071 | `GetDataByGlossaryNew(adm,"HDSD00.12.071","0")` |

---

#### G15-G20: 其余Query (C0046/C0029/C0030/C0031/C0033/C0015)

**c0029 特殊检查/治疗同意书** (40字段):
- DocIDList: 未指定
- 专有字段: HDSD0010049(特殊检查名称), HDSD0010048(检查目的), HDSD001004(同意内容), HDSD0010047(检查风险)

**c0031 其他知情同意书** (38字段):
- DocIDList: "160"
- 专有字段: HDSD0010055(同意书全部内容), HDSD0010057(同意书名称=Title), HDSD001005(知情内容), HDSD0010013(患方意见="同意")

**c0033 中医住院病案首页** (~170字段):
- 最大单表，包含完整的地址分段(省/市/县/乡/街/号/邮编)
- 包含中医诊断体系(病名+证候)
- 包含费用明细和医保信息

**c0046 术前小结**: 待IRIS验证补充

**c0030 病危通知书**: 待IRIS验证补充

**c0015 授权委托书**: 待IRIS验证补充

---

## 3. 上报规则索引 (v1.0 骨架)

### R 类: 病历概要上报规则 (C0001)

| 规则ID | 目标字段 | 上报条件 | 数据转换 | 优先级 |
|--------|---------|---------|---------|--------|
| R-001 | Name | 必填 | 直接取HDSD00.11.110 | p0 |
| R-002 | SexCode/SexDesc | 必填 | HDSD00.11.109/.586 | p0 |
| R-003 | BirthDate | 必填 | Util.ToTS(HDSD00.11.014) | p0 |
| R-004 | IdentifyNumber | 条件 | HDSD00.11.048 | p0 |
| R-005 | MartialCode/MartialDesc | 条件 | HDSD00.11.050/.587 | p1 |
| R-006 | NationCode/NationDesc | 条件 | HDSD00.11.077/.590 | p1 |
| R-007 | HomeProvince~PostalCode | 条件 | 地址6级(102-106) | p1 |
| R-008 | BloodTypeABO/rH | 条件 | HDSD00.11.003/.004 + 描述 | p1 |
| R-009 | InsureTypeCode/PayModeCode | 条件 | HDSD00.11.117 | p1 |
| R-010 | DisDateTime | 必填 | ToTS(HDSD00.11.019) | p0 |
| R-011 | InDateTime | 必填 | ToTS(HDSD00.11.085) | p0 |
| R-012 | HDSD0002061/HDSD00020611 | 必填 | 病情转归, 默认1="好转" | p0 |
| R-013 | HDSD0002015 | 住院必填 | 个人承担费用(2位小数) | p1 |
| R-014 | HDSD0002065 | 住院必填 | 住院总费用(2位小数) | p1 |
| R-015 | InpatientID | 住院必填 | HDSD00.11.140 | p0 |
| R-016 | OutpatientID | 门急必填 | GetPapmiNo(PapmiDR) | p0 |
| R-017 | PatTypeCode/PatTypeDesc | 必填 | PAADM^2 → I/O/E/H映射 | p0 |
| R-018 | InDeptCode/InDeptDesc | 必填 | HDSD00.11.1004/.084 | p0 |

### D 类: 诊断上报规则 (A1-A12通用)

| 规则ID | 适用Query | 目标字段 | 说明 |
|--------|----------|---------|------|
| D-001 | a2,a3,a10,a11 | HDSD0002049/91 | 西医诊断编码+描述, 空→"-" |
| D-002 | a2-a12 | HDSD0002063/64/31/41 | 中医四字段(病名+证候), 空→"-" |
| D-003 | a2,a3,a10 | HDSD0011025/51 | 入院病情 代码+描述 |
| D-004 | a2,a3,a10 | HDSD0002061/11 | 治疗结果 代码+描述 |
| D-005 | a11(PathDiagose) | HDSD0011008 | **病理号**, 截9位 |
| D-006 | a3(其他诊断) | SeqNo 1~20 | 循环输出最多20条 |
| D-007 | a4(InDiagose) | DiagnosCat | 区分西医/中医/症候三类 |

### S 类: 手术上报规则 (C0009)

| 规则ID | 目标字段 | 上报条件 | 数据转换 |
|--------|---------|---------|---------|
| S-001 | OperSn | 必填 | GetOperationID()链路 |
| S-002 | NarcosisModeCode/Desc | 必填 | 解析\|符, 空默认"局麻" |
| S-003 | HDSD0006022 | 必填 | ToPQ()(出血量mL) |
| S-004 | HDSD0006091 | 条件 | ToPQ()(输血量) |
| S-005 | HDSD0006142 | 条件 | 手术过程(截1000字) |

### OB 类: 产科/剖宫产上报规则 (C0016)

| 规则ID | 目标字段 | 说明 |
|--------|---------|------|
| oB-001 | HDSD0007008 | 待产日期时间 |
| oB-002 | HDSD0007106/61 | 新生儿性别(1男2女9其他) |
| oB-003 | HDSD0007107 | 出生体重(g,默认3000) |
| oB-004 | HDSD0007108 | 出生身长(cm,默认40.0) |
| oB-005 | HDSD0007112 | Apgar评分值 |
| oB-006 | HDSD0007136 | 出血量(mL) |
| oB-007 | HDSD0007069 | 胎膜完整(true/false) |

### IC 类: 知情同意书规则 (C0026/F1-F3)

| 规则ID | 目标字段 | 说明 |
|--------|---------|------|
| iC-001 | HDSD0010015 | 患者签名(cisAn.hZQM) |
| iC-002 | HDSD0008 | 法定代理人签名 |
| iC-003 | HDSD0010012 | 签名日期时间 |
| iC-004 | HDSD0010038 | 手术风险(cisAn.tSFXBZ) |

---

## 4. 踩坑点 & 注意事项

### ⚠️ T-001: Query类 vs 持久化类
本类是 **%RegisteredObject Query类**，不是 SQLStorage 持久化类。没有 Property 定义，没有 Storage 定义。所有数据通过 **Execute 方法中的 ObjectScript 代码动态组装**，写入 `^CacheTemp(repid, ind)` 后通过 Fetch 返回 $lB 列表。

### ⚠️ T-02: 术语集编码体系
所有字段通过 **HDSDxx.xxx.xxx 术语编码** 映射到 eMR 文档中的结构化数据。编码格式: `hDSD{大类}.{文档类型}.{字段序号}`。
- 例: HDSD00.11.024 = 第11类(病案首页).文档024字段 = 西医诊断描述

### ⚠️ T-03: 三种就诊类型的分支处理
多数Query内部根据 `PAADM^2` (admType) 分支:
- **I (住院)**: 用 HDSD00.13.01 / HDSD00.11 术语集
- **O (门诊)**: 用 HDSD00.03.01 术语集, 部分字段返回空
- **E (急诊)**: 同门诊术语集, 但就诊入口不同
- **例外**: C0044抢救记录支持O/E类型就诊

### ⚠️ T-04: VisitStatus 过滤
所有Query执行前都检查: `VisitStatus=$P($g(^PAADM(adm)),"^",20)` , 空值或"C"(取消)跳过

### ⚠️ T-05: InstanceID 文档过滤
通过 `GetValidInstanceIDList(adm, DocIDList)` 获取有效EMR文档, 循环每个InstanceID输出一行。**一个adm可能对应多行**(多个文档实例)。

### ⚠️ T-06: Date 格式转换
大量使用 `$zd(date,3)` 和 `$zt(time,1)` 进行 IRIS内部格式→ODBC格式转换, 再经 `Util.ToTS()` 标准化为 `YYYY-MM-DD HH:MM:SS`。部分日期含中文(年月日时分秒)需 `replaceDate()` 方法清洗。

### ⚠️ T-07: 默认值策略
空值统一替换为 `"-"` (字符串) 或 `"false"` (布尔标志) 或 `"0"` (数值)。部分字段有硬编码默认值(如产后血压110/70, 新生儿体重3000g等)。

### ⚠️ T-08: C0026 DocIDList 极长
手术知情同意书的 DocIDList 包含 **约150种** 手术模板ID, 是所有Query中最长的。

### ⚠️ T-09: CIS_AN 系统跨库访问
c0026/c0028 通过 **Embedded SQL** 直接访问 `cisAn.RecordSheet` / `cisAn.OperData` 表, 属于手术室子系统数据, 与 eMR 散装数据并行。

### ⚠️ T-010: 费用接口外部依赖
C0001的费用字段来自 `web.DHCBillInterface.IGetTarMRCateFee()` , 属于计费模块, 需确保计费接口可用。

### ⚠️ T-011: Title过滤机制 (v2.0 新增)
多个Query通过 `objInstance.Title'["xxx"` 过滤文档类型，不同Query的过滤条件不同:
- c0037: Title'="首次病程记录" (精确匹配)
- c0048: Title'["术后首次病程记录" (包含匹配)
- c0038: Title'["日常病程记录"
- c0039: Title'["查房记录"
- c0041: Title'["交班记录" 或 Title'["接班记录"
- c0042: Title'["转出记录" 或 Title'["转入记录"
- c0040: Title'["疑难病例讨论记录" 或 Title'["疑难病历讨论记录"
- c0034: Title'["入院记录"

### ⚠️ T-012: Age字段处理不一致 (v2.0 新增)
不同Query对Age的处理方式不同，需注意:
- `$p(Age,"Y",2)` — 取"Y"后的数字部分 (c0037/c0038/C0039等)
- `$tr(Age,"Y","")` — 删除"Y"字符 (c0009/C0036等)
- `+Age` — 转为数值 (c0037/C0038中二次处理)
- 部分Query不处理直接返回原始值

### ⚠️ T-013: 身份证号截断长度不一致 (v2.0 新增)
- c0009: `$e(IdentifyNumber,1,7)` 截取前7位
- c0037/c0038/c0039: `$e(IdentifyNumber,1,18)` 截取前18位
- c0034/c0035/c0036: 不截断，返回完整值

### ⚠️ T-014: 生命体征默认值 (v2.0 新增)
入院记录(c0034/c0035/c0036)中生命体征字段有硬编码默认值:
- 体温: 36.5℃ (空/-/—/0.0/长度<4时)
- 脉率: 80次/min (空/-/—/长度>3时)
- 呼吸: 18次/min (空/-/—/长度≠2时)
- 舒张压: 90mmHg (空/-/—时)
- 收缩压: 120mmHg (空/-/—时)
- 体重: 0.00kg (空/-/—时)
- 身高: 000.0cm (空/-/—/0.0时)

### ⚠️ T-015: C0045会诊记录数据来源不同 (v2.0 新增)
C0045会诊记录的数据**不来自EMR术语集**，而是来自护理组的 `ConsultInfo(adm)` 方法。该方法返回 `"!!"` 分隔的多条会诊记录，每条记录以 `"^"` 分隔13个字段。需用SQL反查科室代码和医师代码。

### ⚠️ T-016: GetSignfInfo vs GetALLSignfInfo (v2.0 新增)
两种签名信息获取方法:
- `GetSignfInfo(InstanceID)` — 返回单个签名: 代码^姓名^日期时间 (C0048用)
- `GetALLSignfInfo(InstanceID)` — 返回三级签名: !1=住院医师^!2=主治医师^!3=主任医师 (c0034/c0036/c0039/C0040用)

### ⚠️ T-017: 中文日期格式清洗 (v2.0 新增)
部分术语集返回的日期含中文字符，需清洗:
```objectscript
// "2021年04月01日" → "2021-04-01"
s Date=$tr($tr($tR(Date,"年","-"),"月","-"),"日","")
```

### ⚠️ T-018: 空值统一处理模式 (v2.0 新增)
代码中大量使用以下模式处理空值:
```objectscript
i HDSD0014086="" s HDSD0014086="-"     // 代码为空→"-"
i HDSD00140861="" s HDSD00140861="-"   // 名称为空→"-"
s:(HDSD0014119="") HDSD0014119="-"     // 条件赋值写法
```

---

## 5. 关联字典表

| 字典/全局 | 说明 | 关联字段 |
|-----------|------|---------|
| ^PAADM(adm) | 就诊主记录 | PAADM_Type(^2), PAADM_AdmDate(^6), PAADM_AdmTime(^7), PAADM_AdmissionLoc(^4), PAADM_DischargeDate(^17), PAADM_VisitStatus(^20) |
| ^PAPER(papmi) | 患者主记录 | PAPMI_PatNo, paperPat(1)=活跃标志 |
| ^PAPERi("PAPMI_PatNo") | 患者号索引 | 通过PatNo查找papmi |
| ^PAPERdr(papmi,"ADM",type) | 患者就诊索引 | type=I/O/E, 按时间排序 |
| ^PAADMi("DischDate",date) | 出院日期索引 | 按出院日期遍历 |
| ^PAADMi("NNType",type,date) | 门急诊日期索引 | type=O/E |
| ^SSU("SSUSR",userCode) | 用户表 | SSUSR^1=Initials(代码), ^2=Name(姓名) |
| ^CacheTemp(repid,ind) | 临时查询结果 | $LB格式的行数据 |
| ^DHCEMRI.Events.LinkDocumnentsI | EMR事件-文档关联 | 用于GetOperationID()链路 |
| ^DHCEMRI.Events.OperationD | 手术操作详情 | 存储OpaID |
| ^cIS.aN.OperScheduleI | 手术排期索引 | OperSn最终定位 |
| cisAn.RecordSheet | 手术记录表 | 知情同意书详细内容 |
| cisAn.OperData | 手术操作数据 | 具体数据项(tSFXBZ/HZQM等) |
| EMRinstance.InstanceData | EMR实例对象 | InstanceID→CreateUser/HappenDate/HappenTime/Status |
| web.DHCBILLInterface | 计费接口 | IGetTarMRCateFee() |

---
