---
domain: "10-patient"
name: "患者主索引域(完整版)"
version: "2.3.0"
description: "患者全部基本信息，基于 ^PAPER(Pa_PatMas+Pa_Person) 全局，含 ALL/PAT/PER/NOK 多节点结构"

# 实体表类（数据存储结构来源）
entityClasses:
  - name: "User.PAPatMas"
    description: "患者主表"
    global: "^PAPER(PAPMI_RowId)"
    primaryKey: "PAPMI_RowId"
  - name: "User.PAPerson"
    description: "个人信息基类"
    global: "^PAPER(RowId)"  
    primaryKey: "PAPER_RowId"

# 接口程序类（用于验证对照）
apiClasses:
  - name: "web.DHCENS.Method.PatInfo"
    method: "PatInfo(PatRowID)"

# 相关字典类
relatedDicts:
  - name: "User.CTSex"
    global: "^CT(\"SEX\",RowId)"
    description: "性别字典"
  - name: "User.CTMarital"
    global: "^CT(\"MAR\",RowId)"
    description: "婚姻状况"
  - name: "User.CTNation"
    global: "^CT(\"NAT\",RowId)"
    description: "民族字典"
  - name: "User.CTOccupation"
    global: "^CT(\"OCC\",RowId)"
    description: "职业字典"
  - name: "User.CTCountry"
    global: "^CT(\"COU\",RowId)"
    description: "国籍字典"
  - name: "User.CTProvince"
    global: "^CT(\"PROV\",RowId)"
    description: "省份字典"
  - name: "User.CTCity"
    global: "^CT(\"CIT\",RowId)"
    description: "城市字典"
  - name: "User.CTRelation"
    global: "^CT(\"RLT\",RowId)"
    description: "联系人关系"

totalRules: 64
lastUpdated: "2026-05-30"
relatedGlobals:
  - "^PAPER(PAPMI_RowId) — 患者主索引核心Global，多节点结构"
  - "^PAPERi — 患者索引Global(按姓名/登记号/身份证/手机等)"
  - "^PAADM(AdmRowId) — 就诊记录(^1=患者DR)"
  - "^CT(\"SEX\") — 性别字典"
  - "^CT(\"MAR\") — 婚姻字典"
  - "^CT(\"NAT\") — 民族字典"
  - "^CT(\"OCC\") — 职业字典"
  - "^CT(\"COU\") — 国籍字典"
  - "^CT(\"PROV\") — 省份字典"
  - "^CT(\"CIT\") — 城市字典"
  - "^CT(\"RLT\") — 联系人关系字典"
  - "^CT(\"SS\") — 身份类型字典(CT_SocialStatus)"
  - "^CT(\"TTL\") — 称谓字典"
  - "^DHCCARD — 就诊卡相关"
---

# 患者主索引域(完整版)

## 元信息

| 属性 | 值 |
|------|-----|
| 域ID | `10-patient` |
| 版本 | 2.3.0 |
| 规则数 | 64 |
| 实体表 | User.PAPatMas / User.PAPerson |
| 接口程序 | web.DHCENS.Method.PatInfo.PatInfo() |
| 更新时间 | 2026-05-30 |

## 描述

患者全部基本信息，基于 ^PAPER(Pa_PatMas) 全局。PAPatMas 是患者主表，PAPerson 是个人信息基类，两者的 RowID 相同（PAPMI_RowId = PAPER_RowId）。

## 表关联关系

```
User.PAPatMas (患者主表) = PAPerson 的子类
  ^PAPER(RowID) — 多节点存储
     ├── "ALL" 节点 — 基本信息(Name/dOB/Sex/ID/Language/Country/Deceased/Name3-8)
     ├── "PAT",1 — 登记信息(IPNo/OPNo/Active/PatCategory/HomeClinic/BlackList)
     ├── "PAT",2 — 扩展联系信息(Alias/ForeignPhone/Soundex/Lang/LangPrint)
     ├── "PAT",3 — 卡证信息(Medicare/Concession/dVA/CardType/HealthFund)
     ├── "PAT",4 — 特殊标志(VIPFlag/RequireAssist/HealthCardExpiry)
     ├── "PER",4 — 个人扩展(Province/GovernCard/Email/MobPhone/Pregnancy等)
     ├── "rMK" — 备注(Remark, sub-node)
     ├── "gP" — GP信息
     ├── "aLLERGY" — 过敏信息
     ├── "NOK" — 紧急联系人(Next of Kin)
     ├── "PER",1 — 个人基础(国籍/民族身份类型/电话)
     ├── "PER",2 — 个人扩展(民族/婚姻/职业/宗教)
     └── "PER",5 — 扩展信息(血型/护照/工作等)
     
  关联链路:
     ^PAPER(patDR,"ALL")^7 → SexRowID → ^CT("SEX",SexRowID)^2 = SexDesc
     ^PAPER(patDR,"PER",4)^2 → ProvDR → ^CT("pROV",ProvDR)^2 = ProvDesc
     ^PAPER(patDR,"ALL")^18 → CityDr → ^CT("cIT",CityDr)^2 = CityDesc
```

## Global 结构速查

### ^PAPER(RowId) — 患者主索引 (多节点)

| 节点 | ^位 | 字段 | 说明 |
|------|-----|------|------|
| ALL | ^1 | Name | 患者姓名 |
| ALL | ^2 | Name2 | 姓名2 |
| ALL | ^6 | dOB | 出生日期(H格式) |
| ALL | ^7 | Sex_DR | **性别DR → ^CT("SEX")** |
| ALL | ^8 | DeceasedTime | 死亡时间 |
| ALL | ^9 | ID | 身份证号 |
| ALL | ^10 | LangPrim_DR | 母语 |
| ALL | ^11 | CountryOfBirth_DR | 出生国 |
| ALL | ^12 | Deceased | 死亡标志(Y/N) |
| ALL | ^13 | Deceased_Date | 死亡日期 |
| ALL | ^15 | EstAgeYear | 估算年龄(年) |
| ALL | ^16 | EstAgeMonth | 估算年龄(月) |
| ALL | ^18 | CityBirth_DR | **出生城市DR → ^CT("CIT")** |
| ALL | ^19 | Name3 | 医保卡号 |
| PAT,1 | ^1 | IPNo | 住院登记号 |
| PAT,1 | ^2 | OPNo | 门诊登记号 |
| PAT,1 | ^6 | Active | 有效标志(Y/N) |
| PAT,1 | ^8 | PatCategory_DR | 患者类别 |
| PAT,1 | ^19 | BlackList | 黑名单标志 |
| PAT,1 | ^22 | Medicare | 医保号 |
| PAT,2 | ^1 | Alias | 别名 |
| PAT,2 | ^2 | ForeignPhoneNo | 国外电话 |
| PER,4 | ^2 | CT_Province_DR | **籍贯省DR → ^CT("PROV")** |
| PER,4 | ^4 | GovernCardNo | 社保卡号 |
| PER,4 | ^19 | Email | 邮箱 |
| PER,4 | ^21 | MobPhone | 手机 |
| PER,4 | ^25 | ElecMasterIndex | 健康卡主索引 |
| PER,4 | ^26 | Pregnancy_G | 孕次 |
| PER,4 | ^27 | Pregnancy_P | 产次 |
| PER,4 | ^20 | Title_DR | **称谓DR → ^CT("TTL")** |
| PER,1 | ^8 | Country_DR | **国籍DR → ^CT("COU")** |
| PER,1 | ^10 | SocialStatus_DR | **身份类型DR → ^CT("SS")** |
| PER,2 | ^1 | Nation_DR | **民族DR → ^CT("NAT")** |
| PER,2 | ^3 | Marital_DR | **婚姻DR → ^CT("MAR")** |
| PER,2 | ^6 | Occupation_DR | **职业DR → ^CT("OCC")** |
| NOK | ^1 | NokName | 紧急联系人姓名 |
| NOK | ^2 | NokPhone | 紧急联系人电话 |
| NOK | ^4 | NokCTRLT_DR | **联系人关系DR → ^CT("RLT")** |

### ^PAPERi — 患者索引

| 索引名 | 结构 | 说明 |
|--------|------|------|
| PAPER_PatName | `^PAPERi("PAPER_PatName",$$aLPHAUP(Name),RowID)` | 按姓名查 |
| PAPMI_PatNo | `^PAPERi("PAPMI_PatNo",$$aLPHAUP(PatNo),RowID)` | 按登记号查 |
| papmiIcppbc | `^PAPERi("papmiIcppbc",$$aLPHAUP(ID),RowID)` | 按身份证查 |
| dOB | `^PAPERi("dOB",+dOB,$$aLPHAUP(Name),RowID)` | 按出生日期查 |
| PAPER_YBCode | `^PAPERi("PAPER_YBCode",$$aLPHAUP(Name3),RowID)` | 按医保卡号查 |
| MobPhone | `^PAPERi("MobPhone",$$aLPHAUP(MobPhone),RowID)` | 按手机号查 |
| ElecMI | `^PAPERi("ElecMI",$$aLPHAUP(ElecMI),RowID)` | 按健康卡查 |

## 前置条件

从就诊记录获取患者DR (若已有PatRowID参数则跳过):

```objectscript
s patDR = $p($g(^PAADM(admRowId)),"^",1)
```

> 所有以下规则均依赖 patDR (=PatRowID=PapmiDR=PAPER_RowId) 变量已赋值。

---

## 字段映射规则

### 基本信息

---

#### PATIENT_ROWID

| 属性 | 值 |
|------|-----|
| 标准名 | `patientRowid` |
| 匹配模式 | PapmiDR, PatRowID, patientId, patientId, papmiDR, 患者ID |
| 取值表达式 | `patDR` |
| Global | 输入参数或从 ^PAADM 获取 |
| 置信度 | 1.0 |
| 分类 | 标识 |

**说明**：PATRowID 是从就诊记录 ^PAADM(admRowID)^1 取出的患者DR，即 PAPMI_RowId。

```objectscript
s patientRowid = patDR
```

---

#### PATIENT_NAME

| 属性 | 值 |
|------|-----|
| 标准名 | `patientName` |
| 匹配模式 | PatName, hZXM, PatientName, 患者姓名 |
| 取值表达式 | `$p($g(^PAPER(patDR,"ALL")),"^",1)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"ALL")^1` |
| 置信度 | 0.99 |
| 分类 | 基本信息 |

**说明**：患者姓名，^PAPER 的 ALL 节点 ^1 位。索引: `^PAPERi("PAPER_PatName",$$aLPHAUP(name),RowID)`。

```objectscript
s patientName = $p($g(^PAPER(patDR,"ALL")),"^",1)
```

---

#### PATIENT_NAME2

| 属性 | 值 |
|------|-----|
| 标准名 | `patientName2` |
| 匹配模式 | PatName2, Name2, 患者姓名2, 别名 |
| 取值表达式 | `$p($g(^PAPER(patDR,"ALL")),"^",2)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"ALL")^2` |
| 置信度 | 0.95 |
| 分类 | 基本信息 |

```objectscript
s patientName2 = $p($g(^PAPER(patDR,"ALL")),"^",2)
```

---

### 登记号

---

#### REG_NO

| 属性 | 值 |
|------|-----|
| 标准名 | `regNo` |
| 匹配模式 | registerNo, RegNo, dJH, 登记号, 病历号, 病案号 |
| 取值表达式 | `$p($g(^PAPER(patDR,"PAT",1)),"^",1)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"PAT",1)^1` |
| 置信度 | 0.99 |
| 分类 | 登记信息 |

**说明**：住院登记号(IPNo)。索引: `^PAPERi("PAPMI_PatNo",$$aLPHAUP(no),RowID)`。

```objectscript
s regNo = $p($g(^PAPER(patDR,"PAT",1)),"^",1)
```

---

#### OP_NO

| 属性 | 值 |
|------|-----|
| 标准名 | `opNo` |
| 匹配模式 | opRegNo, OPNo, mZH, 门诊号 |
| 取值表达式 | `$p($g(^PAPER(patDR,"PAT",1)),"^",2)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"PAT",1)^2` |
| 置信度 | 0.99 |
| 分类 | 登记信息 |

```objectscript
s opNo = $p($g(^PAPER(patDR,"PAT",1)),"^",2)
```

---

#### ID_CARD

| 属性 | 值 |
|------|-----|
| 标准名 | `idCard` |
| 匹配模式 | IDCard, sFZH, papmiId, 身份证, 证件号 |
| 取值表达式 | `$p($g(^PAPER(patDR,"ALL")),"^",9)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"ALL")^9` |
| 置信度 | 0.98 |
| 分类 | 证件信息 |

**说明**：患者身份证号码。索引: `^PAPERi("papmiIcppbc",$$aLPHAUP(id),RowID)`。

```objectscript
s idCard = $p($g(^PAPER(patDR,"ALL")),"^",9)
```

---

#### CREDENTIAL_TYPE

| 属性 | 值 |
|------|-----|
| 标准名 | `credentialType` |
| 匹配模式 | CredentialType, certificateTypeCode, certificateTypeName, 证件类型, ZJLX |
| 取值表达式 | `s credentialTypeDR=$p($g(^PAPER(patDR,"PAT",3)),"^",7) i credentialTypeDR'="" s credentialType=$p($g(^PAC("CARD",credentialTypeDR)),"^",2)` |
| Global | `^PAPER`, `^PAC("CARD")` |
| 节点路径 | `^PAPER(patDR,"PAT",3)^7` → `^PAC("CARD",DR)^2` |
| 置信度 | 0.95 |
| 分类 | 证件信息 |

**说明**：患者证件类型名称。通过 `^PAPER(patDR,"PAT",3)` 第7个Piece获取证件类型DR，再从 `^PAC("CARD",DR)` 第2个Piece获取类型名称。

```objectscript
s credentialTypeDR = $p($g(^PAPER(patDR,"PAT",3)),"^",7)
i credentialTypeDR'="" {
    s credentialType = $p($g(^PAC("CARD",credentialTypeDR)),"^",2)
}
```

---

#### CREDENTIAL_NO

| 属性 | 值 |
|------|-----|
| 标准名 | `credentialNo` |
| 匹配模式 | CredentialNo, certificateNo, 证件号码, ZJHM |
| 取值表达式 | `s credentialNo=$p($g(^PAPER(patDR,"PAT",3)),"^",6) s:credentialNo="" credentialNo=$p($g(^PAPER(patDR,"ALL")),"^",9)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"PAT",3)^6` (优先), `^PAPER(patDR,"ALL")^9` (兜底) |
| 置信度 | 0.95 |
| 分类 | 证件信息 |

**说明**：患者证件号码。优先从 `^PAPER(patDR,"PAT",3)` 第6个Piece获取，若为空则兜底取身份证号 `^PAPER(patDR,"ALL")` 第9个Piece。

```objectscript
s credentialNo = $p($g(^PAPER(patDR,"PAT",3)),"^",6)
s:credentialNo="" credentialNo = $p($g(^PAPER(patDR,"ALL")),"^",9)
```

---

### 人口统计

---

#### DOB

| 属性 | 值 |
|------|-----|
| 标准名 | `dOB` |
| 匹配模式 | BirthDate, dOB, cSRQ, 出生日期, papmiDob |
| 取值表达式 | `s tDate=$p($g(^PAPER(patDR,"ALL")),"^",6) i tDate'="" s tDate=$zd(tDate,3)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"ALL")^6` |
| 置信度 | 0.99 |
| 分类 | 人口统计 |

**说明**：出生日期(H格式)，需 $zd(,3) 格式化。

```objectscript
s tDate = $p($g(^PAPER(patDR,"ALL")),"^",6)
i tDate'="" s tDate = $zd(tDate,3)
s dOB = tDate
```

---

#### SEX_ROWID

| 属性 | 值 |
|------|-----|
| 标准名 | `sexRowid` |
| 匹配模式 | SexRowID, SexDR, 性别RowID, PAPMI_Sex_DR |
| 取值表达式 | `$p($g(^PAPER(patDR,"ALL")),"^",7)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"ALL")^7` |
| 置信度 | 0.99 |
| 分类 | 人口统计 |

**说明**：性别DR，中间变量。⚠️ 需两步: 先取RowID → 再查 ^CT("SEX")。

```objectscript
s sexRowid = $p($g(^PAPER(patDR,"ALL")),"^",7)
```

---

#### SEX_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `sexCode` |
| 匹配模式 | SexCode, xbCode, 性别代码 |
| 取值表达式 | `$p($g(^CT("SEX",$p($g(^PAPER(patDR,"ALL")),"^",7))),"^",1)` |
| Global | `^CT("SEX")` |
| 置信度 | 0.97 |
| 分类 | 人口统计 |
| 依赖 | sexRowid |

```objectscript
s sexCode = $p($g(^CT("SEX",SexRowID)),"^",1)
```

---

#### SEX_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `sexDesc` |
| 匹配模式 | SexName, xbName, 性别, SexCode, xB |
| 取值表达式 | `$p($g(^CT("SEX",SexRowID)),"^",2)` |
| Global | `^CT("SEX")` |
| 节点路径 | `^CT("SEX",SexRowID)^2` |
| 置信度 | 0.97 |
| 分类 | 人口统计 |
| 依赖 | sexRowid |

**说明**：标准CT字典 ^1=代码 ^2=描述。

```objectscript
s sexDesc = $p($g(^CT("SEX",SexRowID)),"^",2)
```

---

#### AGE_YEAR

| 属性 | 值 |
|------|-----|
| 标准名 | `ageYear` |
| 匹配模式 | AgeYear, EstAgeYear, 估算年龄, 年龄 |
| 取值表达式 | `$p($g(^PAPER(patDR,"PAT",1)),"^",13)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"ALL")^15` |
| 置信度 | 0.90 |
| 分类 | 人口统计 |

```objectscript
s ageYear = $p($g(^PAPER(patDR,"ALL")),"^",15)
```

---

#### DECEASED_FLAG

| 属性 | 值 |
|------|-----|
| 标准名 | `deceasedFlag` |
| 匹配模式 | Deceased, 死亡标志, 死亡, DeceasedFlag |
| 取值表达式 | `$p($g(^PAPER(patDR,"ALL")),"^",12)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"ALL")^12` |
| 置信度 | 0.95 |
| 分类 | 人口统计 |

**说明**：Y=已死亡, N=存活。

```objectscript
s deceasedFlag = $p($g(^PAPER(patDR,"ALL")),"^",12)
```

---

#### DECEASED_DATE

| 属性 | 值 |
|------|-----|
| 标准名 | `deceasedDate` |
| 匹配模式 | DeceasedDate, 死亡日期, Deceased_Date |
| 取值表达式 | `$zd($p($g(^PAPER(patDR,"ALL")),"^",13),3)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"ALL")^13` |
| 置信度 | 0.93 |
| 分类 | 人口统计 |

```objectscript
s tDate = $p($g(^PAPER(patDR,"ALL")),"^",13)
i tDate'="" s tDate = $zd(tDate,3)
s deceasedDate = tDate
```

---

#### BIRTH_COUNTRY_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `birthCountryDr` |
| 匹配模式 | CountryOfBirthDR, BirthCountry, 出生国, 国籍RowID |
| 取值表达式 | `$p($g(^PAPER(patDR,"ALL")),"^",11)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"ALL")^11` |
| 置信度 | 0.93 |
| 分类 | 人口统计 |

**说明**：⚠️ 注意：^11位是CountryOfBirthDR(出生国)，^CT("COU")字典。国籍通过 PER,1^8 取RowID → ^CT("COU")。

```objectscript
s birthCountryDr = $p($g(^PAPER(patDR,"ALL")),"^",11)
```

---

#### BIRTH_CITY_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `birthCityDr` |
| 匹配模式 | CityBirthDR, BirthCity, 出生城市, CityDR |
| 取值表达式 | `$p($g(^PAPER(patDR,"ALL")),"^",18)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"ALL")^18` |
| 置信度 | 0.90 |
| 分类 | 人口统计 |

**说明**：⚠️ 在ALL^18位，不在PER节点！籍贯城市。→ ^CT("CIT")。

```objectscript
s birthCityDr = $p($g(^PAPER(patDR,"ALL")),"^",18)
```

---

### 联系方式

---

#### MOBILE_PHONE

| 属性 | 值 |
|------|-----|
| 标准名 | `mobilePhone` |
| 匹配模式 | MobPhone, 手机, MobilePhone, Phone, Tel, 联系电话 |
| 取值表达式 | `$p($g(^PAPER(patDR,"PER",4)),"^",21)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"PER",4)^21` |
| 置信度 | 0.95 |
| 分类 | 联系方式 |

**说明**：⚠️ 手机号在 PER,4^21 位，不在 ALL 或 PAT 节点！

```objectscript
s mobilePhone = $p($g(^PAPER(patDR,"PER",4)),"^",21)
```

---

#### EMAIL

| 属性 | 值 |
|------|-----|
| 标准名 | `eMAIL` |
| 匹配模式 | Email, 邮箱, 电子邮箱, PAPMI_Email |
| 取值表达式 | `$p($g(^PAPER(patDR,"PER",4)),"^",19)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"PER",4)^19` |
| 置信度 | 0.93 |
| 分类 | 联系方式 |

**说明**：⚠️ 邮箱在 PER,4^19 位。

```objectscript
s eMAIL = $p($g(^PAPER(patDR,"PER",4)),"^",19)
```

---

#### SECOND_PHONE

| 属性 | 值 |
|------|-----|
| 标准名 | `secondPhone` |
| 匹配模式 | SecondPhone, Phone2, 第二电话, 备用电话 |
| 取值表达式 | `$p($g(^PAPER(patDR,"PER",4)),"^",18)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"PER",4)^18` |
| 置信度 | 0.88 |
| 分类 | 联系方式 |

```objectscript
s secondPhone = $p($g(^PAPER(patDR,"PER",4)),"^",18)
```

---

### 籍贯/地址

---

#### PROVINCE_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `provinceDr` |
| 匹配模式 | ProvinceDR, ProvDR, 籍贯省DR, CT_Province_DR |
| 取值表达式 | `$p($g(^PAPER(patDR,"PER",4)),"^",2)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"PER",4)^2` |
| 置信度 | 0.95 |
| 分类 | 籍贯地址 |

**说明**：⚠️ 在 PER,4^2 位。→ ^CT("pROV",ProvDR)^2 = 省份名。

```objectscript
s provinceDr = $p($g(^PAPER(patDR,"PER",4)),"^",2)
```

---

#### PROVINCE_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `provinceDesc` |
| 匹配模式 | ProvDesc, ProvinceName, 籍贯省, 省份 |
| 取值表达式 | `$p($g(^CT("pROV",ProvDR)),"^",2)` |
| Global | `^CT("PROV")` |
| 置信度 | 0.93 |
| 分类 | 籍贯地址 |
| 依赖 | provinceDr |

```objectscript
s provinceDesc = $p($g(^CT("pROV",ProvDR)),"^",2)
```

---

#### CITY_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `cityDr` |
| 匹配模式 | CityDR, CityAreaDR, 城市DR, 籍贯市DR |
| 取值表达式 | `$p($g(^PAPER(patDR,"ALL")),"^",18)` |
| Global | `^PAPER` |
| 置信度 | 0.88 |
| 分类 | 籍贯地址 |

**说明**：⚠️ 注意：城市DR在ALL^18，不在PER节点。

```objectscript
s cityDr = $p($g(^PAPER(patDR,"ALL")),"^",18)
```

---

#### CITY_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `cityDesc` |
| 匹配模式 | CityName, CityDesc, 城市名, 籍贯市 |
| 取值表达式 | `$p($g(^CT("cIT",CityDr)),"^",2)` |
| Global | `^CT("CIT")` |
| 置信度 | 0.88 |
| 分类 | 籍贯地址 |
| 依赖 | cityDr |

**说明**：^CT("CIT") 字典: ^1=代码 ^2=名称 ^4=省份DR。

```objectscript
s cityDesc = $p($g(^CT("cIT",CityDr)),"^",2)
```

---

#### AREA_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `areaDr` |
| 匹配模式 | CityAreaDR, AreaDR, 区县DR |
| 取值表达式 | `$p($g(^PAPER(patDR,"PER",4)),"^",9)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"PER",4)^9` |
| 置信度 | 0.85 |
| 分类 | 籍贯地址 |

**说明**：⚠️ 在 PER,4^9 位。→ ^CT("cITAREA")。

```objectscript
s areaDr = $p($g(^PAPER(patDR,"PER",4)),"^",9)
```

---

### 医疗卡证

---

#### HEALTH_CARD_NO

| 属性 | 值 |
|------|-----|
| 标准名 | `healthCardNo` |
| 匹配模式 | ElecMasterIndex, 健康卡号, 电子健康卡, ElecMI |
| 取值表达式 | `$p($g(^PAPER(patDR,"PER",4)),"^",25)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"PER",4)^25` |
| 置信度 | 0.93 |
| 分类 | 医疗卡证 |

**说明**：电子健康卡主索引。索引: `^PAPERi("ElecMI",$$aLPHAUP(elecMI),RowID)`。

```objectscript
s healthCardNo = $p($g(^PAPER(patDR,"PER",4)),"^",25)
```

---

#### MEDICARE_NO

| 属性 | 值 |
|------|-----|
| 标准名 | `medicareNo` |
| 匹配模式 | Medicare, yBKH, 医保卡号, PAPMI_Medicare |
| 取值表达式 | `$p($g(^PAPER(patDR,"PAT",1)),"^",22)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"PAT",1)^22` |
| 置信度 | 0.95 |
| 分类 | 医疗卡证 |

**说明**：⚠️ 在 PAT,1^22 位。

```objectscript
s medicareNo = $p($g(^PAPER(patDR,"PAT",1)),"^",22)
```

---

#### GOVERN_CARD_NO

| 属性 | 值 |
|------|-----|
| 标准名 | `governCardNo` |
| 匹配模式 | GovernCardNo, 社保卡号, sBKH |
| 取值表达式 | `$p($g(^PAPER(patDR,"PER",4)),"^",4)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"PER",4)^4` |
| 置信度 | 0.93 |
| 分类 | 医疗卡证 |

**说明**：⚠️ 在 PER,4^4 位。

```objectscript
s governCardNo = $p($g(^PAPER(patDR,"PER",4)),"^",4)
```

---

### 患者状态

---

#### ACTIVE_FLAG

| 属性 | 值 |
|------|-----|
| 标准名 | `activeFlag` |
| 匹配模式 | PAPMI_Active, Active, 有效标志, 启用标志, IsActive |
| 取值表达式 | `$p($g(^PAPER(patDR,"PAT",1)),"^",6)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"PAT",1)^6` |
| 置信度 | 0.99 |
| 分类 | 患者状态 |

**说明**：⚠️ Active 在 PAT,1^6 位，不在 ALL 节点！Y=可用，N=不可用。

```objectscript
s activeFlag = $p($g(^PAPER(patDR,"PAT",1)),"^",6)
```

---

#### BLACK_LIST

| 属性 | 值 |
|------|-----|
| 标准名 | `blackList` |
| 匹配模式 | BlackList, hMD, 黑名单, 黑名单标志 |
| 取值表达式 | `$p($g(^PAPER(patDR,"PAT",1)),"^",19)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"PAT",1)^19` |
| 置信度 | 0.90 |
| 分类 | 患者状态 |

```objectscript
s blackList = $p($g(^PAPER(patDR,"PAT",1)),"^",19)
```

---

#### VIP_FLAG

| 属性 | 值 |
|------|-----|
| 标准名 | `vipFlag` |
| 匹配模式 | VIPFlag, vIP, 贵宾标志, PAPMI_VIPFlag |
| 取值表达式 | `$p($g(^PAPER(patDR,"PAT",4)),"^",1)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"PAT",4)^1` |
| 置信度 | 0.90 |
| 分类 | 患者状态 |

**说明**：⚠️ 在 PAT,4^1 位。Y=vIP, N=普通, A=匿名。

```objectscript
s vipFlag = $p($g(^PAPER(patDR,"PAT",4)),"^",1)
```

---

#### YBC_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `ybcCode` |
| 匹配模式 | Name3, YBCode, 医保编码, PAPMI_Name3 |
| 取值表达式 | `$p($g(^PAPER(patDR,"ALL")),"^",19)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"ALL")^19` |
| 置信度 | 0.88 |
| 分类 | 医疗卡证 |

**说明**：字段名是Name3但存医保卡号(YBCode)。

```objectscript
s ybcCode = $p($g(^PAPER(patDR,"ALL")),"^",19)
```

---

### 妇科信息

---

#### PREGNANCY_G

| 属性 | 值 |
|------|-----|
| 标准名 | `pregnancyG` |
| 匹配模式 | PregnancyG, 孕次, Gravida |
| 取值表达式 | `$p($g(^PAPER(patDR,"PER",4)),"^",26)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"PER",4)^26` |
| 置信度 | 0.88 |
| 分类 | 妇科信息 |

**说明**：⚠️ 在 PER,4^26-29 位。

```objectscript
s pregnancyG = $p($g(^PAPER(patDR,"PER",4)),"^",26)
```

---

#### PREGNANCY_P

| 属性 | 值 |
|------|-----|
| 标准名 | `pregnancyP` |
| 匹配模式 | PregnancyP, 产次, Para |
| 取值表达式 | `$p($g(^PAPER(patDR,"PER",4)),"^",27)` |
| Global | `^PAPER` |
| 置信度 | 0.88 |
| 分类 | 妇科信息 |

```objectscript
s pregnancyP = $p($g(^PAPER(patDR,"PER",4)),"^",27)
```

---

#### PREGNANCY_A

| 属性 | 值 |
|------|-----|
| 标准名 | `pregnancyA` |
| 匹配模式 | PregnancyA, 流次, Abortion |
| 取值表达式 | `$p($g(^PAPER(patDR,"PER",4)),"^",28)` |
| Global | `^PAPER` |
| 置信度 | 0.88 |
| 分类 | 妇科信息 |

```objectscript
s pregnancyA = $p($g(^PAPER(patDR,"PER",4)),"^",28)
```

---

#### PREGNANCY_L

| 属性 | 值 |
|------|-----|
| 标准名 | `pregnancyL` |
| 匹配模式 | PregnancyL, 存活, Living |
| 取值表达式 | `$p($g(^PAPER(patDR,"PER",4)),"^",29)` |
| Global | `^PAPER` |
| 置信度 | 0.85 |
| 分类 | 妇科信息 |

```objectscript
s pregnancyL = $p($g(^PAPER(patDR,"PER",4)),"^",29)
```

---

### 教育

---

#### EDUCATION_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `educationDr` |
| 匹配模式 | Education, edu_background, eduBackground, 文化程度, 学历, EduDR |
| 取值表达式 | `$p($g(^PAPER(patDR,"PER",4)),"^",30)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"PER",4)^30` |
| 置信度 | 0.88 |
| 分类 | 教育信息 |

**说明**：⚠️ 在 PER,4^30 位。→ CT_Education 字典。

```objectscript
s educationDr = $p($g(^PAPER(patDR,"PER",4)),"^",30)
```

---

### 个人身份(高频补充)

> 以下字段位于 PAPerson 的 PER,1/PER,2 节点，PAPatMas 的 ^PAPER 共享同一 Global

---

#### NATION_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `nationDr` |
| 匹配模式 | NationDR, Nation, 民族DR, PAPER_Nation_DR |
| 取值表达式 | `$p($g(^PAPER(patDR,"PER",2)),"^",1)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"PER",2)^1` |
| 置信度 | 0.95 |
| 分类 | 个人身份 |

**说明**：民族DR，→ ^CT("NAT") 字典。⚠️ 在 PER,2 节点不是 PER,4。

```objectscript
s nationDr = $p($g(^PAPER(patDR,"PER",2)),"^",1)
s nationDesc = $p($g(^CT("nAT",nationDr)),"^",2)
```

---

#### MARITAL_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `maritalDr` |
| 匹配模式 | MaritalDR, Marital, 婚姻DR, PAPER_Marital_DR |
| 取值表达式 | `$p($g(^PAPER(patDR,"PER",2)),"^",3)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"PER",2)^3` |
| 置信度 | 0.95 |
| 分类 | 个人身份 |

**说明**：婚姻状况DR，→ ^CT("MAR") 字典。⚠️ 在 PER,2^3 不是 PER,4。

```objectscript
s maritalDr = $p($g(^PAPER(patDR,"PER",2)),"^",3)
s maritalDesc = $p($g(^CT("MAR",maritalDr)),"^",2)
```

---

#### OCCUPATION_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `occupationDr` |
| 匹配模式 | OccupationDR, Occupation, 职业DR, PAPER_Occupation_DR |
| 取值表达式 | `$p($g(^PAPER(patDR,"PER",2)),"^",6)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"PER",2)^6` |
| 置信度 | 0.93 |
| 分类 | 个人身份 |

**说明**：职业DR，→ ^CT("OCC") 字典。⚠️ 在 PER,2^6。

```objectscript
s occupationDr = $p($g(^PAPER(patDR,"PER",2)),"^",6)
s occupationDesc = $p($g(^CT("OCC",occupationDr)),"^",2)
```

---

#### COUNTRY_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `countryDr` |
| 匹配模式 | CountryDR, Nationality, 国籍DR, PAPER_Country_DR |
| 取值表达式 | `$p($g(^PAPER(patDR,"PER",1)),"^",8)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"PER",1)^8` |
| 置信度 | 0.93 |
| 分类 | 个人身份 |

**说明**：国籍DR，→ ^CT("COU") 字典。⚠️ 在 PER,1^8，注意与 ALL^11(CountryOfBirth_DR 出生国)区分。

```objectscript
s countryDr = $p($g(^PAPER(patDR,"PER",1)),"^",8)
s countryDesc = $p($g(^CT("cOU",countryDr)),"^",2)
```

---

#### SOCIAL_STATUS_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `socialStatusDr` |
| 匹配模式 | SocialStatusDR, SocialStatus, 身份类型DR, 患者类型 |
| 取值表达式 | `$p($g(^PAPER(patDR,"PER",1)),"^",10)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"PER",1)^10` |
| 置信度 | 0.90 |
| 分类 | 个人身份 |

**说明**：患者身份/社会类型DR，→ ^CT("SS") 字典(MCP确认Global名)。⚠️ 在 PER,1^10。

```objectscript
s socialStatusDr = $p($g(^PAPER(patDR,"PER",1)),"^",10)
s socialStatusDesc = $p($g(^CT("SS",socialStatusDr)),"^",2)
```

---

#### TITLE_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `titleDr` |
| 匹配模式 | TitleDR, Title, 称谓DR, PAPER_Title_DR |
| 取值表达式 | `$p($g(^PAPER(patDR,"PER",4)),"^",20)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"PER",4)^20` |
| 置信度 | 0.90 |
| 分类 | 个人身份 |

**说明**：称谓DR（先生/女士等），→ ^CT("TTL") 字典。

```objectscript
s titleDr = $p($g(^PAPER(patDR,"PER",4)),"^",20)
s titleDesc = $p($g(^CT("TTL",titleDr)),"^",2)
```

---

### 联系人/紧急联系人(高频补充)

> 以下字段位于 PAPerson 的 NOK(Next of Kin) 节点

---

#### NOK_NAME

| 属性 | 值 |
|------|-----|
| 标准名 | `nokName` |
| 匹配模式 | NokName, NextOfKinName, 联系人姓名, 紧急联系人 |
| 取值表达式 | `$p($g(^PAPER(patDR,"NOK")),"^",1)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"NOK")^1` |
| 置信度 | 0.93 |
| 分类 | 联系人 |

**说明**：紧急联系人姓名。⚠️ 在 NOK 独立节点。

```objectscript
s nokName = $p($g(^PAPER(patDR,"NOK")),"^",1)
```

---

#### NOK_PHONE

| 属性 | 值 |
|------|-----|
| 标准名 | `nokPhone` |
| 匹配模式 | NokPhone, NextOfKinPhone, 联系人电话, 紧急联系电话 |
| 取值表达式 | `$p($g(^PAPER(patDR,"NOK")),"^",2)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"NOK")^2` |
| 置信度 | 0.93 |
| 分类 | 联系人 |

```objectscript
s nokPhone = $p($g(^PAPER(patDR,"NOK")),"^",2)
```

---

#### NOK_RELATION_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `nokRelationDr` |
| 匹配模式 | NokCTRLT_DR, NokRelation, 联系人关系DR |
| 取值表达式 | `$p($g(^PAPER(patDR,"NOK")),"^",4)` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"NOK")^4` |
| 置信度 | 0.90 |
| 分类 | 联系人 |

**说明**：联系人关系DR，→ ^CT("RLT") 字典。

```objectscript
s nokRelationDr = $p($g(^PAPER(patDR,"NOK")),"^",4)
s nokRelationDesc = $p($g(^CT("rLT",nokRelationDr)),"^",2)
```

---

### 备注

---

#### REMARK

| 属性 | 值 |
|------|-----|
| 标准名 | `rEMARK` |
| 匹配模式 | Remark, bZ, 备注, PAPMI_Remark |
| 取值表达式 | `""` |
| Global | `^PAPER` |
| 节点路径 | `^PAPER(patDR,"rMK")` |
| 置信度 | 0.85 |
| 分类 | 备注 |

**说明**：⚠️ rMK 是独立子节点不是^分隔串！通过 $o() 遍历。

```objectscript
s rEMARK = ""
s rmkIdx = "" f  s rmkIdx = $o(^PAPER(patDR,"rMK",rmkIdx)) q:rmkIdx=""  d
. s rEMARK = REMARK_$g(^PAPER(patDR,"rMK",rmkIdx))
```

---

## 常用索引与遍历方式

### 按姓名查患者 (最常用)
```objectscript
s patDR = $o(^PAPERi("PAPER_PatName",$$aLPHAUP(name),""))
```

### 按登记号查患者
```objectscript
s patDR = $o(^PAPERi("PAPMI_PatNo",$$aLPHAUP(regNo),""))
```

### 按身份证查患者
```objectscript
s patDR = $o(^PAPERi("papmiIcppbc",$$aLPHAUP(idCard)_"Z",""))
```

### 按出生日期范围遍历患者
```objectscript
s date = dateFrom - 1 f  s date = $o(^PAPERi("dOB",date)) q:(date="")!(date>dateTo)  d
. s name = "" f  s name = $o(^PAPERi("dOB",date,name)) q:name=""  d
. . s patDR = "" f  s patDR = $o(^PAPERi("dOB",date,name,patDR)) q:patDR=""  d
. . . ; 处理患者
```

### 按手机号查患者
```objectscript
s patDR = $o(^PAPERi("MobPhone",$$aLPHAUP(mobile)_"Z",""))
```

### 按健康卡查患者
```objectscript
s patDR = $o(^PAPERi("ElecMI",$$aLPHAUP(elecMI),""))
```

### 全量遍历
```objectscript
s patDR = "" f  s patDR = $o(^PAPER(patDR)) q:patDR=""  d
. s patName = $p($g(^PAPER(patDR,"ALL")),"^",1)
. q:patName=""  ; 跳过无效记录
. ; 取值 + 输出
```

## 踩坑提示

### ⚠️ ^PAPER 多节点结构

取值时**必须指定节点名**：`^PAPER(patDR,"ALL")`、`^PAPER(patDR,"PAT",1)`、`^PAPER(patDR,"PER",4)`，否则取不到数据。

### ⚠️ 易混淆的字段位置

| 字段 | 你以为的位置 | 实际位置 | 说明 |
|------|------------|---------|------|
| Active | ALL节点 | **PAT,1^6** | 不在ALL节点！ |
| 手机号 | ALL/PAT | **PER,4^21** | 在PER扩展节点 |
| 邮箱 | ALL/PAT | **PER,4^19** | 在PER扩展节点 |
| 城市 | PER | **ALL^18** | 在ALL不在PER！ |
| 国籍 | PER | **ALL^11** | 在ALL不在PER！ |

### ⚠️ ^CT("CIT") 省份DR在^4位

CTCity 字典: ^1=代码 ^2=名称 **^4=省份DR**（⚠️非^3！），与 CTCounty 不对称（CTCounty的城市DR在^3）。

## 别名映射表

| 标准名 | 别名列表 |
|--------|----------|
| patientName | PatName, hZXM, PatientName, 患者姓名 |
| regNo | registerNo, RegNo, dJH, 登记号, 病历号 |
| idCard | IDCard, sFZH, papmiId, 身份证 |
| dOB | BirthDate, cSRQ, 出生日期 |
| mobilePhone | MobPhone, Phone, Tel, 联系电话 |
| sexDesc | SexName, xbName, 性别 |
| medicareNo | Medicare, yBKH, 医保卡号 |
| healthCardNo | ElecMasterIndex, ElecMI, 健康卡号 |
| vipFlag | VIPFlag, vIP, 贵宾标志 |
| deceasedFlag | Deceased, 死亡标志 |
| nationDr | NationDR, 民族DR, Nation |
| maritalDr | MaritalDR, 婚姻DR, Marital |
| occupationDr | OccupationDR, 职业DR, Occupation |
| countryDr | CountryDR, 国籍DR, Nationality |
| socialStatusDr | SocialStatusDR, 身份类型DR, 患者类型 |
| titleDr | TitleDR, 称谓DR, Title |
| nokName | NokName, 联系人姓名, 紧急联系人 |
| nokPhone | NokPhone, 联系人电话, 紧急联系电话 |
| nokRelationDr | NokCTRLT_DR, 联系人关系DR |

## 规则统计

| 分类 | 规则数 | 说明 |
|------|--------|------|
| 标识 | 1 | patientRowid |
| 基本信息 | 3 | Name/Name2/dOB |
| 登记信息 | 4 | RegNo/OPNo/IDCard/Active |
| 人口统计 | 7 | SexRowID/SexCode/SexDesc/AgeYear/DeceasedFlag/DeceasedDate/BirthCountry |
| 联系方式 | 3 | MobilePhone/Email/SecondPhone |
| 籍贯地址 | 5 | ProvDR/ProvDesc/CityDR/CityDesc/AreaDR |
| 医疗卡证 | 4 | HealthCard/Medicare/GovernCard/YBCode |
| 患者状态 | 3 | Active/BlackList/VIPFlag |
| 妇科信息 | 4 | PregG/PregP/PregA/PregL |
| 教育 | 1 | Education |
| 个人身份 | 6 | Nation/Marital/Occupation/Country/SocialStatus/Title |
| 联系人 | 3 | NokName/NokPhone/NokRelation |
| 备注 | 1 | Remark |
| **合计** | **44** | (核心高频字段64条含字典子字段) |

---
