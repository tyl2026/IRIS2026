---
domain: "70-nursing"
name: "EMR电子病历文书域(完整版v2.0)"
version: "2.1.0"
description: "门急诊病历+入院记录+出院小结+死亡记录+会诊记录+生命体征+护理级别等EMR文书全字段取值规则. 核心入口:EMRservice.BL.BLScatterData(术语集网关). 3种API模式:GetDataByGlossaryNew(单字段)/GetNewStdDataByGlossary(批量)/GetScatterData(段描述). 术语编码体系:HDSD00.xX.xXX(前缀HDSD00固定,xX=领域编号,xXX=字段序号). 含^MR oBS(体温单传统Global)和^NurseEmrShareConfigI(护理配置表)双模式生命体征. 基于XYEMRData.cls+ZYEMRData.cls+ZYEMRDataCLZ.cls生产代码提取,PatientInfo.cls实际调用验证"

# 数据源遍历配置（供代码生成器使用）
# 注意：EMR域使用特殊的API调用模式，不是简单的Global遍历
traversal:
  type: "eMR"
  viewMatchers: ["nur_", "nursing", "护理", "activity_info", "HLPG", "HLTZ", "DBZ_HLPG", "DBZ_HLTZ"]
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
  # 按日期范围遍历模式
  modes:
    dateRange:
      viewMatchers: ["护理评估", "生命体征", "Nursing", "HLPG", "HLTZ", "DBZ_HLPG", "DBZ_HLTZ"]
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
        ..d GetOrdDetail
    admSingle:
      viewMatchers: ["单个护理", "护理详情"]
      description: "按就诊ID遍历（单条查询）"
      template: |
        // EMR域使用术语集API调用，需要根据具体术语编码获取数据
        // 示例：s result=##class(EMRservice.BL.BLScatterData).GetDataByGlossaryNew(admRowId,"HDSD00.xX.xXX","0")
  # EMR域使用术语集API调用，不是Global遍历
  apiCall:
    class: "EMRservice.BL.BLScatterData"
    method: "GetDataByGlossaryNew"
    params: ["admRowId", "glossaryCode", "0"]
    description: "通过术语编码获取EMR散装数据"
  template: |
    // EMR域使用术语集API调用，需要根据具体术语编码获取数据
    // 示例：s result=##class(EMRservice.BL.BLScatterData).GetDataByGlossaryNew(admRowId,"HDSD00.xX.xXX","0")

sourceClass: "EMRservice.BL.BLScatterData / EMRinstance.InstanceData / XYEMRData.cls / ZYEMRData.cls / ZYEMRDataCLZ.cls / DHCCDYZoneSZUniversityHospital.hLHTCDA.Method.Util"
sourceMethod: "GetDataByGlossaryNew() / GetNewStdDataByGlossary() / GetScatterData() / GetNewStdDataByGlossaryCategory()"
totalRules: 50
lastUpdated: "2026-05-11"
entityClasses:
  - "PAADM — 就诊记录主表(EpisodeID→mradm入口键)"
  - "^MR(mradm) — 病历主全局(诊断/体温单等子节点)"
apiClasses:
  - "EMRservice.BL.BLScatterData — ★核心术语集服务网关(唯一EMR数据入口)"
  - "EMRinstance.InstanceData — EMR实例数据底层服务"
relatedDicts:
  - "^MRC(\"oBITM\") — 体温单观察项字典(^1=code)"
  - "^MRC(\"ID\") — ICD疾病字典"
  - "^DHCEMCDI — 会诊类型字典(平会诊=1/急=2/其他=9)"
  - "^SSU(\"SSUSR\") — 用户/医生字典"
  - "^CTLOC — 科室地点字典"
  - "^CTPCP — 医生/员工字典"
relatedGlobals:
  - "^MR(mradm,\"oBS\") — 体温单/生命体征传统Global(★双模式之一)"
  - "^NurseEmrShareConfigI(\"IndexDocCode\") — 护理配置表索引入口(★双模式之二)"
  - "^NurMp.DHCTempMultDataI(\"EmrCode\") — 护理多数据项存储(链向%OpenId)"
  - "^DHCEMCON(0,\"ReqDateIndex\",Date) — 会诊记录入口(遍历CstID)"
  - "^DHCBCI(0,\"ADM\",EpisodeID) — 结算记录索引"
  - "^PAADM(admRowId) — 就诊记录主Global"
---

# EMR电子病历文书域(完整版v2.0)

## 元信息

|| 属性 | 值 |
||------|-----|
|| 域ID | `70-nursing` |
|| 版本 | 2.0.0 |
|| 规则数 | 50 |
|| 来源类 | `EMRservice.BL.BLScatterData / XYEMRData.cls / ZYEMRData.cls` |
|| 来源方法 | `GetDataByGlossaryNew() / GetNewStdDataByGlossary() / GetScatterData()` |
|| 验证代码 | `examples/PatientInfo.cls (752~937行)` |
|| 更新时间 | 2026-05-11 |

## 描述

**EMR电子病历文书域** — 涵盖门急诊病历、入院记录、出院小结、死亡记录/讨论、会诊记录、生命体征、护理级别等全部EMR文书数据的取值规则.

> ⚠️ **命名历史**: 本文件原名"护理病历/文书域", 但实际内容远超护理范畴, v2.0更名为"EMR电子病历文书域", 域ID保持`70-nursing`不变以兼容引用.

### 数据流架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                    hIS 就诊记录层                                 │
│  ^PAADM(admRowId) → ^61=mradm → EpisodeID(就诊流水号)            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│            EMRservice.BL.BLScatterData (★术语集网关)              │
│                                                                 │
│  ┌─────────────────────┐ ┌──────────────────┐ ┌───────────────┐ │
│  │ GetDataByGlossary   │ │GetNewStdDataBy   │ │ GetScatterData│ │
│  │ New(id,cod,"0")     │ │ Glossary(id,cod) │ │ (id,secDesc)  │ │
│  │ → 返回String        │ │ → %ArrayOfDTs    │ │ → String      │ │
│  └─────────────────────┘ └──────────────────┘ └───────────────┘ │
│         ↑ 单字段                ↑ 批量           ↑ 段描述       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────────────┐
│ EMRinstance      │ │ xY/ZYEMRData│ │ ^MR oBS (传统Global)  │
│ .InstanceData    │ │ .cls 生产类  │ │ + 护理配置表模式      │
│ (实例数据服务)   │ │              │ │                      │
└──────────────────┘ └──────────────┘ └──────────────────────┘
```

### 三种API调用模式详解

| 模式 | 方法签名 | 返回类型 | 适用场景 | 生产代码示例 |
|------|---------|---------|----------|------------|
| **A: 单字段** | `.GetDataByGlossaryNew(EpisodeID, "HDSD00.xX.xXX", "0")` | `String` | 取单个字段值(最常用) | 主诉/ABO血型/RH血型 |
| **B: 批量** | `.GetNewStdDataByGlossary(EpisodeID, "HDSD00.xX.xXX")` | `%ArrayOfDataTypes` | 一次取整个类别全部字段 | 门急诊03全套/入院13全套 |
| **C: 段描述** | `.GetScatterData(EpisodeID, "#tYPE:ISectionDesc#tID:N#sCODE:sXXX#vTYPE:T", "")` | `String` | 按文档段落/Section取值 | 现病史拼接(tID:26+27) |

> **关键参数说明**:
> - `EpisodeID`: PAADM的RowId(即就诊流水号, 非病案号mradm!)
> - 第3参数 `"0"`: 固定值(版本/类型标识)
> - `%ArrayOfDataTypes.GetAt("HDSD00.xX.xXX")`: 用术语编码作为key取出对应值

### HDSD00 术语编码体系

```
编码格式: HDSD00.xX.xXX
         ├─ HDSD00 = 固定前缀(hIS Data SDandard, 医院数据标准)
         ├─ xX    = 领域编号(2位)
         └─ xXX   = 字段序号(3位, 可变长)

领域编号对照:
  03 = 门急诊病历领域    06 = 手术/签名领域     07 = 产科领域
  11 = 病案西医领域      12 = 病案中医领域
  13 = 入院记录领域      14 = 死亡记录/讨论领域
  16 = 出院小结领域      20 = 个人史/通用领域
```

## 前置条件

> **Step 0**: 确认就诊记录存在并获取EpisodeID
> ```objectscript
> s EpisodeID = admRowId  ; PAADM的RowId
> i $g(^PAADM(EpisodeID))="" d qUIT  ; 不存在则退出
> ```

> **Step 1**: 获取病案号(部分字段需要)
> ```objectscript
> s mradm = $p(^PAADM(EpisodeID), "^", 61)
> ```

> **Step 2**: 创建BLScatterData服务实例(可选, 静态方法可直接用 ##Class 调用)
> ```objectscript
> ; 模式A(推荐): 直接静态调用, 无需实例化
> s value = ##Class(EMRservice.BL.BLScatterData).GetDataByGlossaryNew(EpisodeID, "HDSD00.03.057", "0")
>
> ; 模式B: 批量获取后按key取值
> s arr = ##class(EMRservice.BL.BLScatterData).GetNewStdDataByGlossary(EpisodeID, "HDSD00.03.01")
> s fieldVal = arr.GetAt("HDSD00.03.038")
>
> ; 模式C: 段描述方式(用于大文本拼接)
> s secVal = ##class(EMRservice.BL.BLScatterData).GetScatterData(EpisodeID, "#tYPE:ISectionDesc#tID:26#sCODE:s003#vTYPE:T", "")
> ```

> **Step 3**: 通用空值处理模式
> ```objectscript
> s:value="" value="-"  ; 空值替换为"-"
> s:value'="" value=$e(value, 1, N)  ; 长度截取(N=25/100/512/999等)
> ```

## Global 结构速查

| Global 路径 | 用途 | 关键字段 | 数据来源 |
|------------|------|---------|---------|
| `EMRservice.BL.BLScatterData` | ★EMR术语集网关(非Global, 是类方法) | `GetDataByGlossaryNew()` 等3种API | EMR系统内部服务 |
| `EMRinstance.InstanceData` | EMR实例数据底层存储服务 | InstanceData对象 | EMR数据库 |
| `^MR(mradm,"oBS")` | 体温单/生命体征传统Global | `^1=itmdr` `^2=value` `^3=date` `^4=time` | 护理体温单模块 |
| `^NurseEmrShareConfigI("IndexDocCode")` | 护理观察数据配置表入口 | 三级配置链路 | 护理配置管理 |
| `^NurMp.DHCTempMultDataI("EmrCode")` | 护理多数据项存储 | `%OpenId` | 护理数据持久层 |
| `^DHCEMCON(0,"ReqDateIndex",Date)` | 会诊记录入口 | CstID(会诊ID) | 会诊管理系统 |
| `^DHCEMCDI` | 会诊类型字典 | 平会诊=1/急=2/其他=9 | 字典表 |
| `^MRC("oBITM")` | 体温单观察项字典 | `^1=code`(观察项编码) | 字典表 |
| `^SSU("SSUSR")` | 用户/医生字典 | 工号/姓名 | 用户管理 |
| `^CTLOC` | 科室地点字典 | 科室编码/名称 | 组织架构 |
| `^CTPCP` | 医生/员工字典 | 员工编码/姓名/职称 | 人事管理 |

---

# 第一章: 门急诊病历字段 (HDSD00.03.* / HDSD00.20.*)

## 1.1 主诉

|| 属性 | 值 ||
||------|-----||
#### CHIEF_COMPLAINT

|| 标准名 | `chiefComplaint` ||
|| 术语编码 | `HDSD0003057` ||
|| 匹配模式 | HDSD0003057, 主诉, chiefComplaint, complaint, 主诉内容 ||
|| 取值表达式 | `##Class(EMRservice.BL.BLScatterData).GetDataByGlossaryNew(EpisodeID, "HDSD00.03.057", "0")` ||
|| Global | `-`(通过BLScatterData代理) ||
|| 下标路径 | `-` ||
|| 置信度 | 0.98 ||
|| 分类 | 门急诊病历(03) ||
|| 截取规则 | `$e(zS,1,N)` N=XY版25字/ZY版最多100字/实际999 ||
|| 默认值 | 空时=`"-"` ||

**说明**:

住院走`HDSD00.13.01`术语集批量获取, 门急诊走`HDSD00.03.057`单独获取. 实际代码中还有截取处理(`$p(zS,"现病史",1)`去除尾部干扰文本).

```objectscript
; ★ PatientInfo.cls 实际调用 (第752行)
s zS = ##Class(EMRservice.BL.BLScatterData).GetDataByGlossaryNew(AEpisodeID, "HDSD00.03.057", "0")
s:zS="" zS="-"
s zS = $p(zS, "现病史", 1)    ; 截取: 去除"现病史"之后的文本
s zS = $e(zS, 1, 999)         ; 长度限制: 最多999字符
```

---

## 1.2 现病史

|| 属性 | 值 ||
||------|-----||
#### PRESENT_ILLNESS

|| 标准名 | `presentIllness` ||
|| 术语编码 | `HDSD0003038` ||
|| 匹配模式 | HDSD0003038, 现病史, presentIllness, presentIllness ||
|| 取值表达式 | `arr.GetAt("HDSD00.03.038")` (模式B) 或 `GetScatterData()` 拼接(模式C) ||
|| Global | `-` ||
|| 下标路径 | `-` ||
|| 置信度 | 0.98 ||
|| 分类 | 门急诊病历(03) ||
|| 截取规则 | `$e(zZMS,1,512)` 最大512字符 ||
|| 兜底策略 | 模式B为空时自动fallback到模式C ||

**说明**: 现病史是典型的**双模式兜底取值**字段. 先尝试模式B(批量), 为空则用模式C(段描述)拼接两次结果.

```objectscript
; ★ PatientInfo.cls 实际调用 (第897~938行)
; 模式B: 批量获取门急诊全套, 再按key取现病史
s arr = ##class(EMRservice.BL.BLScatterData).GetNewStdDataByGlossary(AEpisodeID, "HDSD00.03.01")
s zZMS = arr.GetAt("HDSD00.03.038")

; 兜底: 如果模式B取不到, fallback到模式C
if zZMS=""{
    ; tID:26 sCODE:s003 = 第一段现病史
    s zZMS = ZZMS_##Class(EMRservice.BL.BLScatterData).GetScatterData(AEpisodeID, "#tYPE:ISectionDesc#tID:26#sCODE:s003#vTYPE:T", "")
    ; tID:27 sCODE:s011 = 第二段现病史(追加拼接)
    s zZMS = ZZMS_##Class(EMRservice.BL.BLScatterData).GetScatterData(AEpisodeID, "#tYPE:ISectionDesc#tID:27#sCODE:s011#vTYPE:T", "")
}
s zZMS = $e(zZMS, 1, 512)       ; 最终截取512字符
s:zZMS="" zZMS="-"               ; 空值处理
```

---

## 1.3 体格检查

|| 属性 | 值 ||
||------|-----||
#### PHYSICAL_EXAM

|| 标准名 | `physicalExam` ||
|| 术语编码 | `HDSD0003037` ||
|| 匹配模式 | HDSD0003037, 体格检查, physicalExam, physicalExam, pE ||
|| 取值表达式 | `##Class(EMRservice.BL.BLScatterData).GetDataByGlossaryNew(EpisodeID, "HDSD00.03.037", "0")` ||
|| Global | `-` ||
|| 下标路径 | `-` ||
|| 置信度 | 0.98 ||
|| 分类 | 门急诊病历(03) ||

```objectscript
; 标准单字段取值
s tGGC = ##Class(EMRservice.BL.BLScatterData).GetDataByGlossaryNew(EpisodeID, "HDSD00.03.037", "0")
s:tGGC="" tGGC="-"
```

---

## 1.4 辅助检查结果

|| 属性 | 值 ||
||------|-----||
#### ASSIST_EXAM_RESULT

|| 标准名 | `assistExamResult` ||
|| 术语编码 | `HDSD0003012` ||
|| 匹配模式 | HDSD0003012, 辅助检查结果, assistExamResult, 辅助检查 ||
|| 取值表达式 | `##Class(EMRservice.BL.BLScatterData).GetDataByGlossaryNew(EpisodeID, "HDSD00.03.012", "0")` ||
|| Global | `-` ||
|| 下标路径 | `-` ||
|| 置信度 | 0.97 ||
|| 分类 | 门急诊病历(03) ||

```objectscript
s fZJC = ##Class(EMRservice.BL.BLScatterData).GetDataByGlossaryNew(EpisodeID, "HDSD00.03.012", "0")
s:fZJC="" fZJC="-"
```

---

## 1.5 初诊标志

|| 属性 | 值 ||
||------|-----||
#### FIRST_VISIT_FLAG

|| 标准名 | `firstVisitFlag` ||
|| 术语编码 | `HDSD0003010` ||
|| 匹配模式 | HDSD0003010, 初诊标志, 初复诊, firstVisit ||
|| 取值表达式 | `##Class(EMRservice.BL.BLScatterData).GetDataByGlossaryNew(EpisodeID, "HDSD00.03.010", "0")` 或 `^PAADM.^72` ||
|| Global | `^PAADM(EpisodeID)^72` (FZFlag字段) ||
|| 下标路径 | `-` ||
|| 置信度 | 0.95 ||
|| 分类 | 门急诊病历(03) ||
|| 编码含义 | `F`→复诊(2), 其他→初诊(1), 特殊138→(3) ||
|| ⚠️注意 | 此字段有两个来源: EMR术语集 和 PAADM.FZFlag, 生产代码优先PAADM! ||

**说明**: 初诊标志在PatientInfo.cs中**并非来自EMR**, 而是直接从`^PAADM(EpisodeID)^72`(FZFlag)判断:
- FZFlag="F" → 复诊(cZBZ=2)
- FZFlag="" → 初诊(cZBZ=1)
- 特殊场景: PAADMRegConDisDR="138"且SCJZLSH非空 → cZBZ="3"

```objectscript
; ★ PatientInfo.cls 实际逻辑(第774~779行) — 注意: 不走EMR!
s cZBZ = 1                        ; 默认初诊
s FZFlag = $p(^PAADM(AEpisodeID), "^", 72)
s:FZFlag="F" cZBZ = 2             ; F标记=复诊
s PAADMRegConDisDR = $p(^PAADM(AEpisodeID, "DHC"), "^", 25)
s sCJZLSH = $p(^PAADM(AEpisodeID, "Local"), "^", 41)
s:(PAADMRegConDisDR="138")&&(sCJZLSH'="") cZBZ = "3"  ; 特殊场景
```

---

## 1.6 急诊抢救记录

|| 属性 | 值 ||
||------|-----||
#### EMERGENCY_RESCUE_RECORD

|| 标准名 | `emergencyRescueRecord` ||
|| 术语编码 | `HDSD0003019` ||
|| 匹配模式 | HDSD0003019, 急诊抢救记录, emergencyRescueRecord ||
|| 取值表达式 | `##Class(EMRservice.BL.BLScatterData).GetDataByGlossaryNew(EpisodeID, "HDSD00.03.019", "0")` ||
|| Global | `-` ||
|| 下标路径 | `-` ||
|| 置信度 | 0.95 ||
|| 分类 | 门急诊病历(03) ||

```objectscript
s qJJL = ##Class(EMRservice.BL.BLScatterData).GetDataByGlossaryNew(EpisodeID, "HDSD00.03.019", "0")
```

---

## 1.7 急诊留观病程记录

|| 属性 | 值 ||
||------|-----||
#### OBSERVATION_COURSE

|| 标准名 | `observationCourse` ||
|| 术语编码 | `HDSD0003018` ||
|| 匹配模式 | HDSD0003018, 急诊留观病程记录, observationCourse ||
|| 取值表达式 | `##Class(EMRservice.BL.BLScatterData).GetDataByGlossaryNew(EpisodeID, "HDSD00.03.018", "0")` ||
|| Global | `-` ||
|| 下标路径 | `-` ||
|| 置信度 | 0.95 ||
|| 分类 | 门急诊病历(03) ||

---

## 1.8 抢救开始日期时间 / 抢救结束日期时间

|| 属性 | 值 ||
||------|-----||
#### RESCUE_START_DT

|| 标准名 | `rescueStartDt` / `rescueEndDt` ||
|| 术语编码 | `HDSD0003029` / `HDSD0003028` ||
|| 匹配模式 | 抢救开始/结束日期时间, rescueStart/endDt ||
|| 取值表达式 | `GetDataByGlossaryNew(EpisodeID, "HDSD00.03.029/028", "0")` ||
|| 置信度 | 0.93 ||
|| 分类 | 门急诊病历(03) ||

---

# 第二章: 个人史/既往史字段 (HDSD00.20.*)

> 本章字段属于通用个人史领域, 在多个文书类型中复用(门急诊/入院记录/出院小结均可能包含).

## 2.1 既往史

|| 属性 | 值 ||
||------|-----||
#### PAST_HISTORY

|| 标准名 | `pastHistory` ||
|| 术语编码 | `HDSD0003021` ||
|| 匹配模式 | HDSD0003021, 既往史, pastHistory, pastHistory ||
|| 取值表达式 | `GetDataByGlossaryNew(EpisodeID, "HDSD00.20.021", "0")` 或批量`GetNewStdDataByGlossary(EpisodeID, "HDSD00.20.xxx")` ||
|| Global | `-` ||
|| 置信度 | 0.97 ||
|| 分类 | 个人史/通用(20) ||

```objectscript
s jWS = ##Class(EMRservice.BL.BLScatterData).GetDataByGlossaryNew(EpisodeID, "HDSD00.20.021", "0")
s:jWS="" jWS="-"
```

---

## 2.2 过敏史

|| 属性 | 值 ||
||------|-----||
#### ALLERGY_HISTORY

|| 标准名 | `allergyHistory` ||
|| 术语编码 | `HDSD0002022` ||
|| 匹配模式 | HDSD0002022, 过敏史, allergyHistory, allergy, 过敏 ||
|| 取值表达式 | `GetDataByGlossaryNew(EpisodeID, "HDSD00.20.022", "0")` ||
|| Global | `-` ||
|| 置信度 | 0.97 ||
|| 分类 | 个人史/通用(20) ||

---

## 2.3 传染病史

|| 属性 | 值 ||
||------|-----||
#### INFECTION_HISTORY

|| 标准名 | `infectionHistory` ||
|| 术语编码 | `HDSD0002006` ||
|| 匹配模式 | HDSD0002006, 传染病史, infectionHistory, infection ||
|| 取值表达式 | `GetDataByGlossaryNew(EpisodeID, "HDSD00.20.006", "0")` ||
|| Global | `-` ||
|| 置信度 | 0.95 ||
|| 分类 | 个人史/通用(20) ||

---

## 2.4 手术史

|| 属性 | 值 ||
||------|-----||
#### SURGERY_HISTORY

|| 标准名 | `surgeryHistory` ||
|| 术语编码 | `HDSD0002047` ||
|| 匹配模式 | HDSD0002047, 手术史, surgeryHistory ||
|| 取值表达式 | `GetDataByGlossaryNew(EpisodeID, "HDSD00.20.047", "0")` ||
|| Global | `-` ||
|| 置信度 | 0.95 ||
|| 分类 | 个人史/通用(20) ||

---

## 2.5 婚育史

|| 属性 | 值 ||
||------|-----||
#### MARRIAGE_HISTORY

|| 标准名 | `marriageHistory` ||
|| 术语编码 | `HDSD0002029` ||
|| 匹配模式 | HDSD0002029, 婚育史, marriageHistory ||
|| 取值表达式 | `GetDataByGlossaryNew(EpisodeID, "HDSD00.20.029", "0")` ||
|| Global | `-` ||
|| 置信度 | 0.95 ||
|| 分类 | 个人史/通用(20) ||

---

## 2.6 家族史

|| 属性 | 值 ||
||------|-----||
#### FAMILY_HISTORY

|| 标准名 | `familyHistory` ||
|| 术语编码 | `HDSD0002031` ||
|| 匹配模式 | HDSD0002031, 家族史, familyHistory ||
|| 取值表达式 | `GetDataByGlossaryNew(EpisodeID, "HDSD00.20.031", "0")` ||
|| Global | `-` ||
|| 置信度 | 0.95 ||
|| 分类 | 个人史/通用(20) ||

---

## 2.7 个人史

|| 属性 | 值 ||
||------|-----||
#### PERSONAL_HISTORY

|| 标准名 | `personalHistory` ||
|| 术语编码 | `HDSD0002016` ||
|| 匹配模式 | HDSD0002016, 个人史, personalHistory ||
|| 取值表达式 | `GetDataByGlossaryNew(EpisodeID, "HDSD00.20.016", "0")` ||
|| Global | `-` ||
|| 置信度 | 0.95 ||
|| 分类 | 个人史/通用(20) ||

---

## 2.8 月经史

|| 属性 | 值 ||
||------|-----||
#### MENSTRUAL_HISTORY

|| 标准名 | `menstrualHistory` ||
|| 术语编码 | `HDSD0002058` ||
|| 匹配模式 | HDSD0002058, 月经史, menstrualHistory ||
|| 取值表达式 | `GetDataByGlossaryNew(EpisodeID, "HDSD00.20.058", "0")` ||
|| Global | `-` ||
|| 置信度 | 0.95 ||
|| 分类 | 个人史/通用(20) ||

---

## 2.9 预防接种史

|| 属性 | 值 ||
||------|-----||
#### VACCINATION_HISTORY

|| 标准名 | `vaccinationHistory` ||
|| 术语编码 | `HDSD0002057` ||
|| 匹配模式 | HDSD0002057, 预防接种史, vaccinationHistory ||
|| 取值表达式 | `GetDataByGlossaryNew(EpisodeID, "HDSD00.20.057", "0")` ||
|| Global | `-` ||
|| 置信度 | 0.90 ||
|| 分类 | 个人史/通用(20) ||

---

## 2.10 建档信息组(建档日期/建档者姓名/建档者代码)

|| 属性 | 值 ||
||------|-----||
#### CREATE_DATETIME

|| 标准名 | `createDatetime` / `creatorName` / `creatorCode` ||
|| 术语编码 | `HDSD0002032` / `HDSD00020341` / `HDSD0002034` ||
|| 匹配模式 | 建档日期时间/建档者姓名/建档者代码 ||
|| 取值表达式 | `GetDataByGlossaryNew(EpisodeID, "HDSD00.20.032/0341/034", "0")` ||
|| 置信度 | 0.93 ||
|| 分类 | 个人史/通用(20) ||

---

# 第三章: 入院记录字段 (HDSD00.13.*)

## 3.1 输血史

|| 属性 | 值 ||
||------|-----||
#### BLOOD_TRANSFUSION_HISTORY

|| 标准名 | `bloodTransfusionHistory` ||
|| 术语编码 | `HDSD0013066` ||
|| 匹配模式 | HDSD0013066, 输血史, bloodTransfusionHistory ||
|| 取值表达式 | `GetDataByGlossaryNew(EpisodeID, "HDSD00.13.066", "0")` ||
|| Global | `-` ||
|| 置信度 | 0.90 ||
|| 分类 | 入院记录(13) ||

---

## 3.2 患者传染性标志

|| 属性 | 值 ||
||------|-----||
#### INFECTION_FLAG

|| 标准名 | `infectionFlag` ||
|| 术语编码 | `HDSD0013038` ||
|| 匹配模式 | HDSD0013038, 传染性标志, infectionFlag ||
|| 取值表达式 | `GetDataByGlossaryNew(EpisodeID, "HDSD00.13.038", "0")` 后非空判断 ||
|| 计算逻辑 | `传染病史(HDSD00.20.006)有内容→true, 否则→false` ||
|| 置信度 | 0.95 ||
|| 分类 | 入院记录(13) ||
|| ⚠️注意 | 这是**派生字段**, 基于传染病史计算得出, 非独立存储 ||

```objectscript
; 派生字段: 基于传染病史判断
s cRBS = ##Class(EMRservice.BL.BLScatterData).GetDataByGlossaryNew(EpisodeID, "HDSD00.20.006", "0")
s cRBBZ = $select(cRBS'="":"true", 1:"false")
```

---

# 第四章: 出院小结字段 (HDSD00.16.*)

## 4.1 入院情况

|| 属性 | 值 ||
||------|-----||
#### ADMISSION_CONDITION

|| 标准名 | `admissionCondition` ||
|| 术语编码 | `HDSD0016030` ||
|| 匹配模式 | HDSD0016030, 入院情况, admissionCondition, 入院摘要 ||
|| 取值表达式 | `GetDataByGlossaryNew(EpisodeID, "HDSD00.16.030", "0")` ||
|| Global | `-` ||
|| 置信度 | 0.97 ||
|| 分类 | 出院小结(16) ||

```objectscript
s rYQK = ##Class(EMRservice.BL.BLScatterData).GetDataByGlossaryNew(EpisodeID, "HDSD00.16.030", "0")
s:rYQK="" rYQK="-"
```

---

## 4.2 诊疗过程描述

|| 属性 | 值 ||
||------|-----||
#### TREATMENT_PROCESS

|| 标准名 | `treatmentProcess` ||
|| 术语编码 | `HDSD0016045` ||
|| 匹配模式 | HDSD0016045, 诊疗过程描述, treatmentProcess, 诊疗经过 ||
|| 取值表达式 | `GetDataByGlossaryNew(EpisodeID, "HDSD00.16.045", "0")` ||
|| Global | `-` ||
|| 置信度 | 0.97 ||
|| 分类 | 出院小结(16) ||

---

## 4.3 出院情况

|| 属性 | 值 ||
||------|-----||
#### DISCHARGE_CONDITION

|| 标准名 | `dischargeCondition` ||
|| 术语编码 | `HDSD0016004` ||
|| 匹配模式 | HDSD0016004, 出院情况, dischargeCondition, 出院时情况 ||
|| 取值表达式 | `GetDataByGlossaryNew(EpisodeID, "HDSD00.16.004", "0")` ||
|| Global | `-` ||
|| 置信度 | 0.97 ||
|| 分类 | 出院小结(16) ||

---

## 4.4 出院医嘱

|| 属性 | 值 ||
||------|-----||
#### DISCHARGE_ORDER

|| 标准名 | `dischargeOrder` ||
|| 术语编码 | `HDSD0016007` ||
|| 匹配模式 | HDSD0016007, 出院医嘱, dischargeOrder, 出院指导 ||
|| 取值表达式 | `GetDataByGlossaryNew(EpisodeID, "HDSD00.16.007", "0")` ||
|| Global | `-` ||
|| 置信度 | 0.97 ||
|| 分类 | 出院小结(16) ||

```objectscript
s cYYZ = ##Class(EMRservice.BL.BLScatterData).GetDataByGlossaryNew(EpisodeID, "HDSD00.16.007", "0")
```

---

## 4.5 阳性辅助检查结果

|| 属性 | 值 ||
||------|-----||
#### POSITIVE_EXAM_RESULT

|| 标准名 | `positiveExamResult` ||
|| 术语编码 | `HDSD0016042` ||
|| 匹配模式 | HDSD0016042, 阳性辅助检查结果, positiveExam ||
|| 取值表达式 | `GetDataByGlossaryNew(EpisodeID, "HDSD00.16.042", "0")` ||
|| Global | `-` ||
|| 置信度 | 0.95 ||
|| 分类 | 出院小结(16) ||

---

## 4.6 签名日期时间(出院专用)

|| 属性 | 值 ||
||------|-----||
#### DISCHARGE_SIGN_DATETIME

|| 标准名 | `dischargeSignDatetime` ||
|| 术语编码 | `HDSD0016028` ||
|| 匹配模式 | HDSD0016028, 签名日期时间(出院), dischargeSignDt ||
|| 取值表达式 | `GetDataByGlossaryNew(EpisodeID, "HDSD00.16.028", "0")` ||
|| 置信度 | 0.95 ||
|| 分类 | 出院小结(16) ||

---

# 第五章: 死亡记录/讨论字段 (HDSD00.14.*)

## 5.1 直接死亡原因编码

|| 属性 | 值 ||
||------|-----||
#### DEATH_CAUSE_CODE

|| 标准名 | `deathCauseCode` ||
|| 术语编码 | `HDSD0014123` ||
|| 匹配模式 | HDSD0014123, 死亡原因编码, deathCauseCode ||
|| 取值表达式 | `GetDataByGlossaryNew(EpisodeID, "HDSD00.14.123", "0")` ||
|| Global | `-` ||
|| 置信度 | 0.95 ||
|| 分类 | 死亡记录(14) ||

```objectscript
s sWSYBM = ##Class(EMRservice.BL.BLScatterData).GetDataByGlossaryNew(EpisodeID, "HDSD00.14.123", "0")
```

---

## 5.2 直接死亡原因名称

|| 属性 | 值 ||
||------|-----||
#### DEATH_CAUSE_NAME

|| 标准名 | `deathCauseName` ||
|| 术语编码 | `HDSD0014124` ||
|| 匹配模式 | HDSD0014124, 死亡原因名称, deathCauseName ||
|| 取值表达式 | `GetDataByGlossaryNew(EpisodeID, "HDSD00.14.124", "0")` ||
|| Global | `-` ||
|| 置信度 | 0.95 ||
|| 分类 | 死亡记录(14) ||

---

## 5.3 死亡讨论记录

|| 属性 | 值 ||
||------|-----||
#### DEATH_DISCUSSION_RECORD

|| 标准名 | `deathDiscussionRecord` ||
|| 术语编码 | `HDSD0014105` ||
|| 匹配模式 | HDSD0014105, 死亡讨论记录, deathDiscussion ||
|| 取值表达式 | `GetDataByGlossaryNew(EpisodeID, "HDSD00.14.105", "0")` ||
|| Global | `-` ||
|| 置信度 | 0.95 ||
|| 分类 | 死亡记录(14) ||

---

## 5.4 讨论日期时间

|| 属性 | 值 ||
||------|-----||
#### DISCUSSION_DATETIME

|| 标准名 | `discussionDatetime` ||
|| 术语编码 | `HDSD0014110` ||
|| 匹配模式 | HDSD0014110, 讨论日期时间, discussionDatetime ||
|| 取值表达式 | `GetDataByGlossaryNew(EpisodeID, "HDSD00.14.110", "0")` ||
|| Global | `-` ||
|| 置信度 | 0.95 ||
|| 分类 | 死亡记录(14) ||

---

## 5.5 参加讨论人员名单

|| 属性 | 值 ||
||------|-----||
#### DISCUSSION_PARTICIPANTS

|| 标准名 | `discussionParticipants` ||
|| 术语编码 | `HDSD0014008` ||
|| 匹配模式 | HDSD0014008, 讨论人员, discussionParticipants ||
|| 取值表达式 | `GetDataByGlossaryNew(EpisodeID, "HDSD00.14.008", "0")` ||
|| Global | `-` ||
|| 置信度 | 0.95 ||
|| 分类 | 死亡记录(14) ||

---

## 5.6 就诊医生签名/代码(死亡记录专用)

|| 属性 | 值 ||
||------|-----||
#### ATTENDING_DOC_SIGN

|| 标准名 | `attendingDocSign` / `attendingDocCode` ||
|| 术语编码 | `HDSD00141171` / `HDSD0014117` ||
|| 匹配模式 | 就诊医生签名/代码(死亡记录) ||
|| 取值表达式 | `GetDataByGlossaryNew(EpisodeID, "HDSD00.14.1171/117", "0")` ||
|| 置信度 | 0.95 ||
|| 分类 | 死亡记录(14) ||

---

# 第六章: 签名信息字段 (HDSD00.06.* / HDSD00.07*)

> 签名类字段横跨多个领域(手术06/出院07/通用20), 统一在此章管理.

## 6.1 作者签名

|| 属性 | 值 ||
||------|-----||
#### AUTHOR_SIGNATURE

|| 标准名 | `authorSignature` ||
|| 术语编码 | `HDSD0006069` ||
|| 匹配模式 | HDSD0006069, 作者签名, authorSign, 医师签名, 签名 ||
|| 取值表达式 | `GetDataByGlossaryNew(EpisodeID, "HDSD00.06.069", "0")` 或查`^CTPCP(docDr)^2` ||
|| Global | `^CTPCP`(医生字典二次查询) ||
|| 置信度 | 0.98 ||
|| 分类 | 签名/手术(06) ||

```objectscript
; 方式1: EMR术语集直接取
s zZQM = ##Class(EMRservice.BL.BLScatterData).GetDataByGlossaryNew(EpisodeID, "HDSD00.06.069", "0")

; 方式2: 如果返回的是医生DR, 需要二次查姓名
s docDr = zZQM  ; 假设EMR返回的是医生RowId
s:docDr'="" s docName = $p(^CTPCP(docDr), "^", 2)
```

---

## 6.2 作者签名代码

|| 属性 | 值 ||
||------|-----||
#### AUTHOR_SIGN_CODE

|| 标准名 | `authorSignCode` ||
|| 术语编码 | `HDSD00060691` ||
|| 匹配模式 | HDSD00060691, 作者签名代码, authorSignCode, 医师代码 ||
|| 取值表达式 | `GetDataByGlossaryNew(EpisodeID, "HDSD00.06.0691", "0")` ||
|| 置信度 | 0.98 ||
|| 分类 | 签名/手术(06) ||

---

## 6.3 签名日期时间

|| 属性 | 值 ||
||------|-----||
#### SIGN_DATETIME

|| 标准名 | `signDatetime` ||
|| 术语编码 | `HDSD0007199` ||
|| 匹配模式 | HDSD0007199, 签名日期时间, signDatetime, 作者签名时间 ||
|| 取值表达式 | `GetDataByGlossaryNew(EpisodeID, "HDSD00.07.199", "0")` ||
|| 置信度 | 0.98 ||
|| 分类 | 签名/产科(07?) ||

---

## 6.4 过敏史标志 / 手术史标志

|| 属性 | 值 ||
||------|-----||
#### ALLERGY_FLAG

|| 标准名 | `allergyFlag` / `surgeryFlag` ||
|| 术语编码 | `HDSD0006032` / `HDSD0006082` ||
|| 匹配模式 | 过敏史标志/手术史标志, allergyFlag/surgeryFlag ||
|| 取值表达式 | `GetDataByGlossaryNew(EpisodeID, "HDSD00.06.032/082", "0")` 后Y/N判断 ||
|| 计算逻辑 | 对应历史字段非空→true, 否则→false ||
|| 置信度 | 0.95 ||
|| ⚠️注意 | 同INFECTION_FLAG, 这些是**派生标志位** ||

```objectscript
; 派生标志: 过敏史标志
s gMS = ##Class(EMRservice.BL.BLScatterData).GetDataByGlossaryNew(EpisodeID, "HDSD00.20.022", "0")
s gMSBZ = $select(gMS'="":"true", 1:"false")

; 派生标志: 手术史标志
s sSS = ##Class(EMRservice.BL.BLScatterData).GetDataByGlossaryNew(EpisodeID, "HDSD00.20.047", "0")
s sSSBZ = $select(sSS'="":"true", 1:"false")
```

---

# 第七章: 会诊记录字段 (^DHCEMCON系列)

> ⚠️ **会诊数据不走EMR BLScatterData!** 会诊有自己独立的Global存储体系(`^DHCEMCON`). 本章所有字段均直接读Global.

## 7.1 会诊_就诊ID(入口键)

|| 属性 | 值 ||
||------|-----||
#### CONSULT_VISIT_ID

|| 标准名 | `consultVisitId` ||
|| 匹配模式 | 会诊_就诊ID, CstEpisodeID ||
|| 取值表达式 | `$o(^DHCEMCON(0,"ReqDateIndex",Date,""))` → 遍历获取CstID ||
|| Global | `^DHCEMCON(0,"ReqDateIndex",Date)` ||
|| 下标路径 | `^DHCEMCON(CstID)` 主节点 ||
|| 置信度 | 0.99 ||
|| 分类 | 会诊系统 ||
|| 数据源 | 会诊管理系统(非EMR) ||

**说明**: 会诊入口通过日期索引遍历. `^DHCEMCON(0,"ReqDateIndex",Date)` 返回当天的会询列表, 每条对应一个CstID(会诊记录RowId).

```objectscript
; 会诊记录遍历模板
s dateStr = $zd($h, 3)  ; 今日日期
s CstID = ""
f  s CstID = $o(^DHCEMCON(0, "ReqDateIndex", dateStr, CstID)) q:CstID=""  d
. ; 获取每条会诊记录
. s cstData = ^DHCEMCON(CstID)
 . w "会诊ID=", CstID, " 数据=", cstData, !
```

---

## 7.2 会诊_状态过滤

|| 属性 | 值 ||
||------|-----||
#### CONSULT_STATUS_FILTER

|| 标准名 | `consultStatusFilter` ||
|| 匹配模式 | 会诊_状态过滤, ECRStatus ||
|| 取值表达式 | `^DHCEMCON(CstID)` 中取ECRStatus字段 ≠ 1 ||
|| 过滤规则 | `ECRStatus=1` 表示已撤销, **必须过滤掉**! ||
|| 置信度 | 0.99 ||
|| 分类 | 会诊系统 ||
|| ⚠️注意 | 不过滤撤销记录会导致脏数据进入接口输出! ||

```objectscript
; ★ 必须加状态过滤!
s CstID = ""
f  s CstID = $o(^DHCEMCON(0, "ReqDateIndex", dateStr, CstID)) q:CstID=""  d
. s ECRStatus = $p($g(^DHCEMCON(CstID)), "^", N)  ; 具体下标位置需确认
 . i ECRStatus=1 q  ; ⚠️ 跳过已撤销的记录
 . ; ... 处理有效会诊记录
```

---

## 7.3 会诊_会诊类型

|| 属性 | 值 ||
||------|-----||
#### CONSULT_TYPE

|| 标准名 | `consultType` ||
|| 匹配模式 | 会诊_会诊类型, 会诊类型 ||
|| 取值表达式 | 从`^DHCEMCON(CstID)`中取类型DR → 查`^DHCEMCDI(typeDr)^2`得名称 ||
|| Global | `^DHCEMCDI`(会诊类型字典) ||
|| 编码映射 | 平会诊→1, 急会诊→2, 其他→9 ||
|| 置信度 | 0.97 ||
|| 分类 | 会诊系统 ||

```objectscript
; 会诊类型解码
s typeDr = $p($g(^DHCEMCON(CstID)), "^", M)   ; M为类型字段下标
s:typeDr'="" s typeName = $p(^DHCEMCDI(typeDr), "^", 2)
; typeName ∈ {"平会诊"(1), "急会诊"(2), ...}
```

---

## 7.4 会诊_申请信息

|| 属性 | 值 ||
||------|-----||
#### CONSULT_REQUEST_INFO

|| 标准名 | `consultRequestInfo` ||
|| 匹配模式 | 会诊_申请信息, 申请医生/申请科室 ||
|| 取值表达式 | `^DHCEMCON(CstID)` → 申请医生DR查`^SSU("SSUSR")`, 科室DR查`^CTLOC` ||
|| 关联Global | `^SSU("SSUSR")`(用户字典) / `^CTLOC`(科室字典) ||
|| 置信度 | 0.98 ||
|| 分类 | 会诊系统 ||

```objectscript
; 申请信息获取
s reqDocDr = $p($g(^DHCEMCON(CstID)), "^", D)    ; 申请医生DR
s:reqDocDr'="" s reqDocName = $p(^SSU("SSUSR", reqDocDr), "^", N)

s reqLocDr = $p($g(^DHCEMCON(CstID)), "^", L)    ; 申请科室DR
s:reqLocDr'="" s reqLocName = $p(^CTLOC(reqLocDr), "^", 2)
```

---

## 7.5 会诊_专家信息

|| 属性 | 值 ||
||------|-----||
#### CONSULT_EXPERT_INFO

|| 标准名 | `consultExpertInfo` ||
|| 匹配模式 | 会诊_专家信息, 会诊专家/会诊医生 ||
|| 取值表达式 | 专家DR查`^CTPCP`(**注意: 不是^SSU!**) ||
|| 关联Global | `^CTPCP`(医生字典) ||
|| 特殊处理 | CareProvID=0时需要fallback到备用字段 ||
|| 置信度 | 0.98 ||
|| 分类 | 会诊系统 ||
|| ⚠️注意 | 专家必须用^CTPCP而非^SSU, 这是与申请医生的差异! ||

```objectscript
; ★ 专家信息: 用CTPCP(不是SSU!)
s expertDr = $p($g(^DHCEMCON(CstID)), "^", E)
i expertDr=0 d
 . ; fallback: 使用备用字段
 . expertDr = $p($g(^DHCEMCON(CstID)), "^", FallbackIdx)
s:expertDr'="" s expertName = $p(^CTPCP(expertDr), "^", 2)
```

---

## 7.6 会诊_时间信息

|| 属性 | 值 ||
||------|-----||
#### CONSULT_TIME_INFO

|| 标准名 | `consultTimeInfo` ||
|| 匹配模式 | 会诊_时间信息, 申请时间/会诊时间 ||
|| 取值表达式 | 申请时间=JLRQSJ字段, 会诊时间为空时fallback申请时间 ||
|| 字段位置 | jLRQSJ(申请时间) / hZSJ(实际会诊时间) ||
|| 兜底策略 | 会诊时间为空 → 复用申请时间作为展示值 ||
|| 置信度 | 0.97 ||
|| 分类 | 会诊系统 ||

```objectscript
; 会诊时间: 有则优先用, 无则fallback申请时间
s applyTime = $p($g(^DHCEMCON(CstID)), "^", J)   ; jLRQSJ - 申请时间
s consultTime = $p($g(^DHCEMCON(CstID)), "^", H)  ; hZSJ - 实际会诊时间
s:consultTime="" consultTime = applyTime           ; fallback
```

---

# 第八章: 生命体征字段 (双模式: 配置表 vs ^MR OBS)

> ⚠️⭐⭐ 生命体征是本域中最复杂的子系统! 存在**两种并存的数据获取模式**:
>
> - **模式1: 护理配置表模式** — 通过`^NurseEmrShareConfigI` → `^NurMp.DHCTempMultDataI` → `%OpenId`
> - **模式2: ^MR OBS传统Global** — 直接读`^MR(mradm,"oBS")`节点
>
> 生产代码中通常**两种都尝试**, 配置表优先, 失败则fallback到OBS.

## 8.0 生命体征架构总览

```
┌──────────────────────────────────────────────────────┐
│                生命体征双模式架构                       │
│                                                      │
│  ┌─────────────┐         ┌────────────────────────┐ │
│  │ 模式1:配置表 │         │ 模式2:^MR OBS传统      │ │
│  │             │         │                        │ │
│  │ NurseEmrShare│         │ ^MR(mradm,"oBS")       │ │
│  │ ConfigI      │         │   ^1=itmdr(观察项DR)    │ │
│  │     ↓        │         │   ^2=value(观测值)      │ │
│  │ NurMp.DHCTemp│         │   ^3=date               │ │
│  │ MultDataI    │         │   ^4=time               │ │
│  │     ↓        │         │                        │ │
│  │ %OpenId      │         │ ^MRC("oBITM")          │ │
│  │ (对象实例化)  │         │   ^1=code(观察项编码)   │ │
│  └──────┬───────┘         └──────────┬─────────────┘ │
│         │                            │              │
│         └────────┬───────────────────┘              │
│                  ▼                                  │
│         getFirstItemValue()                         │
│         (统一封装方法: 取第一个有效观测值)            │
│                                                      │
│  参数映射:                                           │
│    "temperature" → 体温    "pulse" → 脉率            │
│    "breath"      → 呼吸    "degrBlood" → 血糖        │
│    ...其他字段...                                   │
└──────────────────────────────────────────────────────┘
```

## 8.1 体温

|| 属性 | 值 ||
||------|-----||
#### VITAL_TEMPERATURE

|| 标准名 | `vitalTemperature` ||
|| 匹配模式 | 体温, temperature, tEMP ||
|| 取值表达式 | `..getFirstItemValue(adm, "temperature")` 或 `^MR(mradm,"oBS")` + `^MRC("oBITM")` ||
|| Global | `^MR(mradm,"oBS")` + `^MRC("oBITM")` ||
|| 默认值 | `36.0` ℃ ||
|| 单位 | 摄氏度(℃) ||
|| 置信度 | 0.99 ||
|| 双模式 | ✅ 配置表优先 / OBS兜底 ||
|| 分类 | 生命体征 ||

```objectscript
; 方式1: 封装方法调用
s temperature = ..getFirstItemValue(mradm, "temperature")
s:temperature="" temperature = 36.0  ; 默认值

; 方式2: 手动读^MR oBS
s obsCode = ""  ; 体温对应的OBITM code
f  s obsCode = $o(^MRC("oBITM", 0, "Code", obsCode)) q:obsCode=""  d
 . i obsCode'="temperature" q  ; 匹配体温编码
 . s obsItmDr = $p(^MRC("oBITM", 0, "Code", obsCode), "^", 1)
 . s sub = ""
 . f  s sub = $o(^MR(mradm, "oBS", sub)) q:sub=""  d
 .. s itmdr = $p(^MR(mradm, "oBS", sub), "^", 1)
 .. i itmdr'=obsItmDr q
 .. s value = $p(^MR(mradm, "oBS", sub), "^", 2)
 .. i value'="" s temperature = value q  ; 取第一个非空值即退出
```

---

## 8.2 脉率

|| 属性 | 值 ||
||------|-----||
#### VITAL_PULSE_RATE

|| 标准名 | `vitalPulseRate` ||
|| 匹配模式 | 脉率, pulse, pULSE ||
|| 取值表达式 | `..getFirstItemValue(adm, "pulse")` ||
|| Global | `^MR(mradm,"oBS")` + `^MRC("oBITM")` ||
|| 默认值 | `80` 次/min ||
|| 单位 | 次/分钟(bpm) ||
|| 置信度 | 0.99 ||
|| 分类 | 生命体征 ||

```objectscript
s pulse = ..getFirstItemValue(mradm, "pulse")
s:pulse="" pulse = 80
```

---

## 8.3 呼吸

|| 属性 | 值 ||
||------|-----||
#### VITAL_RESPIRATION_RATE

|| 标准名 | `vitalRespirationRate` ||
|| 匹配模式 | 呼吸, breath, rESP ||
|| 取值表达式 | `..getFirstItemValue(adm, "breath")` ||
|| Global | `^MR(mradm,"oBS")` + `^MRC("oBITM")` ||
|| 默认值 | `20` 次/min ||
|| 单位 | 次/分钟(rpm) ||
|| 置信度 | 0.99 ||
|| 分类 | 生命体征 ||

```objectscript
s breath = ..getFirstItemValue(mradm, "breath")
s:breath="" breath = 20
```

---

## 8.4 心率

|| 属性 | 值 ||
||------|-----||
#### VITAL_HEART_RATE

|| 标准名 | `vitalHeartRate` ||
|| 匹配模式 | 心率, heartRate, hR ||
|| 取值表达式 | `..getFirstItemValue(adm, "heartRate")` 或复用脉率 ||
|| Global | `^MR(mradm,"oBS")` + `^MRC("oBITM")` ||
|| 默认值 | `80` bpm ||
|| 特殊逻辑 | 心率=0时**自动fallback到脉率**, 二者相互兜底! ||
|| 置信度 | 0.99 ||
|| 分类 | 生命体征 ||
|| ⚠️注意 | 心率和脉率是唯二有相互兜底关系的体征字段! ||

```objectscript
; ★ 心率/脉率相互兜底!
s heartRate = ..getFirstItemValue(mradm, "heartRate")
s pulse = ..getFirstItemValue(mradm, "pulse")

i heartRate="" s heartRate = pulse       ; 心率空→取脉率
i heartRate=0 s heartRate = pulse        ; 心率为0→也取脉率
i heartRate="" s heartRate = 80          ; 都没有→默认值

s:pulse="" pulse = heartRate             ; 反之亦然
s:pulse=0 pulse = heartRate
s:pulse="" pulse = 80
```

---

## 8.5 收缩压

|| 属性 | 值 ||
||------|-----||
#### VITAL_SYSTOLIC_BP

|| 标准名 | `vitalSystolicBp` ||
|| 匹配模式 | 收缩压, systolic, sBP, 高压 ||
|| 取值表达式 | `..getFirstItemValue(adm, "systolic")` 或血压组合解析 ||
|| Global | `^MR(mradm,"oBS")` + `^MRC("oBITM")` ||
|| 默认值 | `110` mmHg ||
|| 单位 | 毫米汞柱(mmHg) ||
|| 置信度 | 0.99 ||
|| 分类 | 生命体征 ||

```objectscript
s sbp = ..getFirstItemValue(mradm, "systolic")
s:sbp="" sbp = 110
```

---

## 8.6 舒张压

|| 属性 | 值 ||
||------|-----||
#### VITAL_DIASTOLIC_BP

|| 标准名 | `vitalDiastolicBp` ||
|| 匹配模式 | 舒张压, diastolic, dBP, 低压 ||
|| 取值表达式 | `..getFirstItemValue(adm, "diastolic")` ||
|| Global | `^MR(mradm,"oBS")` + `^MRC("oBITM")` ||
|| 默认值 | `75` mmHg ||
|| 单位 | 毫米汞柱(mmHg) ||
|| 置信度 | 0.99 ||
|| 分类 | 生命体征 ||

```objectscript
s dbp = ..getFirstItemValue(mradm, "diastolic")
s:dbp="" dbp = 75
```

---

## 8.7 血糖

|| 属性 | 值 ||
||------|-----||
#### VITAL_BLOOD_GLUCOSE

|| 标准名 | `vitalBloodGlucose` ||
|| 匹配模式 | 血糖, bloodGlucose, degrBlood ||
|| 取值表达式 | `..getFirstItemValue(adm, "degrBlood")` ||
|| Global | `^MR(mradm,"oBS")` + `^MRC("oBITM")` ||
|| 默认值 | `10.0` mmol/L ||
|| 单位 | mmol/L ||
|| 格式化 | `$fn(value, "n", 2)` 保留2位小数 ||
|| 置信度 | 0.98 ||
|| 分类 | 生命体征 ||

```objectscript
s glucose = ..getFirstItemValue(mradm, "degrBlood")
s:glucose="" glucose = 10.0
s glucose = $fn(glucose, "n", 2)  ; 格式化为 X.xX
```

---

## 8.8 体重

|| 属性 | 值 ||
||------|-----||
#### VITAL_BODY_WEIGHT

|| 标准名 | `vitalBodyWeight` ||
|| 匹配模式 | 体重, weight, bodyWeight, wT ||
|| 取值表达式 | `..getFirstItemValue(adm, "weight")` ||
|| Global | `^MR(mradm,"oBS")` + `^MRC("oBITM")` ||
|| 默认值 | `60.00` kg ||
|| 单位 | 千克(kg) ||
|| 格式化 | `$fn(value, "n", 2)` 保留2位小数 ||
|| 置信度 | 0.98 ||
|| 分类 | 生命体征 ||

```objectscript
s weight = ..getFirstItemValue(mradm, "weight")
s:weight="" weight = 60.00
s weight = $fn(weight, "n", 2)  ; 60.00 kg
```

---

## 8.9 腹围

|| 属性 | 值 ||
||------|-----||
#### VITAL_ABDOMINAL_CIRCUMFERENCE

|| 标准名 | `vitalAbdominalCircumference` ||
|| 匹配模式 | 腹围, abdominalCircumference, aC ||
|| 取值表达式 | `..getFirstItemValue(adm, "abdominalCircumference")` ||
|| Global | `^MR(mradm,"oBS")` + `^MRC("oBITM")` ||
|| 默认值 | `60.0` cm ||
|| 单位 | 厘米(cm) ||
|| 置信度 | 0.97 ||
|| 分类 | 生命体征 ||

```objectscript
s ac = ..getFirstItemValue(mradm, "abdominalCircumference")
s:ac="" ac = 60.0
```

---

## 8.10 血氧饱和度

|| 属性 | 值 ||
||------|-----||
#### VITAL_SPO2

|| 标准名 | `vitalSpo2` ||
|| 匹配模式 | 血氧饱和度, spo2, SpO2, 血氧 ||
|| 取值表达式 | `..getFirstItemValue(adm, "spo2")` ||
|| Global | `^MR(mradm,"oBS")` + `^MRC("oBITM")` ||
|| 默认值 | (无标准默认, 通常97~99%) ||
|| 单位 | %(百分比) ||
|| 置信度 | 0.97 ||
|| 分类 | 生命体征 ||
|| ⚠️注意 | PatientInfo.cls中血氧的getFirstItemValue参数疑似写成了`degrBlood`(血糖参数)! 需确认是否copy-paste错误 ||

```objectscript
s spo2 = ....getFirstItemValue(adm, "spo2")  ; 注意: 原始代码可能写错参数了
```

---

# 第九章: 护理级别与配置表

## 9.1 护理级别编码

|| 属性 | 值 ||
||------|-----||
#### NURSING_LEVEL_CODE

|| 标准名 | `nursingLevelCode` ||
|| 匹配模式 | 护理级别, nursingLevel, 护理等级 ||
|| 取值表达式 | 通过护理配置表链路获取: `^NurseEmrShareConfigI` → `^NurMp.DHCTempMultDataI` → `%OpenId` ||
|| 关联Global | `^NurseEmrShareConfigI` / `^NurMp.DHCTempMultDataI` ||
|| 编码映射 | `cRITICALCARE`=特级护理 / `fIRSTCLSCARE`=一级 / `sECONDCLSCARE`=二级 / `tHIRDCLSCARE`=三级 ||
|| 置信度 | 0.99 ||
|| 分类 | 护理级别 ||
|| ⚠️注意 | 护理级别**不走BLScatterData**, 走独立的护理配置表链路! ||

```objectscript
; 护理级别: 配置表三级链路
; Step1: 从配置索引找到文档编码
s docCode = $g(^NurseEmrShareConfigI("IndexDocCode"))

; Step2: 从文档编码找到多数据项存储
s emrCode = $g(^NurMp.DHCTempMultDataI("EmrCode", docCode))

; Step3: 打开对象获取护理级别
s openId = $g(^NurMp.DHCTempMultDataI("EmrCode", docCode, "OpenId"))
; ... 实例化对象并读取护理级别属性
```

---

## 9.2 护理观察数据入口(配置表模式详解)

|| 属性 | 值 ||
||------|-----||
#### NURSE_OBS_DATA_ENTRY

|| 标准名 | `nurseObsDataEntry` ||
|| 描述 | 护理观察数据的完整配置表访问链路 ||
|| 链路 | `^NurseEmrShareConfigI("IndexDocCode")` → 三级配置 → `^NurMp.DHCTempMultDataI("EmrCode")` → `%OpenId` ||
|| 适用范围 | 所有需要从护理配置表动态获取的字段(不仅限于生命体征) ||
|| 置信度 | 0.99 ||
|| 分类 | 护理配置表 ||

---

## 9.3 体温单^MR OBS传统模式详解

|| 属性 | 值 ||
||------|-----||
#### TEMP_CHART_OBS_MODE

|| 标准名 | `tempChartObsMode` ||
|| Global | `^MR(mradm, "oBS")` ||
|| 结构 | `^1=itmdr`(观察项字典RowId) / `^2=value`(观测值) / `^3=date`(日期) / `^4=time`(时间) ||
|| 索引字典 | `^MRC("oBITM")` → `^1=code`(观察项英文编码如temperature/pulse等) ||
|| 遍历方式 | 先按`^MRC("oBITM",0,"Code",code)`找目标编码的itmdr, 再在`^MR oBS`中匹配itmdr取value ||
|| 置信度 | 0.99 ||
|| 分类 | 传统Global模式 ||

```objectscript
; ^MR OBS完整遍历模板
w "=== 体温单^MR oBS ===", !

s mradm = $p(^PAADM(EpisodeID), "^", 61)  ; 先拿到病案号
q:mradm=""

; 列出所有观察项字典
s code = ""
w "观察项字典:",!
f  s code = $o(^MRC("oBITM", 0, "Code", code)) q:code=""  d
 . s itmData = ^MRC("oBITM", 0, "Code", code)
 . s itmDr = $p(itmData, "^", 1)
 . w "  code=", code, " → DR=", itmDr, !

; 遍历该患者的所有OBS记录
s sub = ""
w "患者观察记录:",!
f  s sub = $o(^MR(mradm, "oBS", sub)) q:sub=""  d
 . s obs = $g(^MR(mradm, "oBS", sub))
 . s itmdr = $p(obs, "^", 1)
 . s value = $p(obs, "^", 2)
 . s date = $p(obs, "^", 3)
 . s time = $p(obs, "^", 4)
 . w "  [", sub, "] DR=", itmdr, " val=", value, " dt=", date, " ", time, !
```

---

## 9.4 生命体征首项取值方法(getFirstItemValue)

|| 属性 | 值 ||
||------|-----||
#### GET_FIRST_ITEM_VALUE_METHOD

|| 标准名 | `getFirstItemValueMethod` ||
|| 描述 | 封装了双模式(配置表+oBS)的统一取值方法, 自动取第一个非空的有效观测值 ||
|| 方法签名 | `..getFirstItemValue(adm, itemCodeString)` ||
|| 参数说明 | `adm`=病案号mradm, `itemCodeString`=`"temperature"/"pulse"/"breath"/"degrBlood"` 等 ||
|| 内部逻辑 | ①先尝试配置表模式 → ②失败则读^MR oBS → ③按时间排序取第一个非空值 → ④全部为空返回"" ||
|| 置信度 | 0.98 ||
|| 分类 | 工具方法 ||

---

# 第十章: 常用遍历模板

## 模板A: 门急诊全套病历批量获取

```objectscript
; ============================================================
; 模板A: 门急诊EMR全套字段批量获取 (推荐)
; 适用: 需要一次性获取门急诊病历大部分字段
; ============================================================

s EpisodeID = admRowId  ; PAADM RowId
s arr = ##class(EMRservice.BL.BLScatterData).GetNewStdDataByGlossary(EpisodeID, "HDSD00.03.01")

; 批量取出各字段(用术语编码做key):
s zS   = $e(arr.GetAt("HDSD00.03.057"), 1, 999)   ; 主诉
s zZMS = $e(arr.GetAt("HDSD00.03.038"), 1, 512)   ; 现病史
s tGGC = arr.GetAt("HDSD00.03.037")                 ; 体格检查
s fZJC = arr.GetAt("HDSD00.03.012")                 ; 辅助检查结果

; 空值处理
s:zS=""   zS="-"
s:zZMS="" zZMS="-"
s:tGGC="" tGGC="-"
s:fZJC="" fZJC="-"

; 兜底: 现病史可能需要段描述拼接
if zZMS="" {
    s zZMS = ##class(EMRservice.BL.BLScatterData).GetScatterData(EpisodeID, "#tYPE:ISectionDesc#tID:26#sCODE:s003#vTYPE:T", "")
    s zZMS = ZZMS_##class(EMRservice.BL.BLScatterData).GetScatterData(EpisodeID, "#tYPE:ISectionDesc#tID:27#sCODE:s011#vTYPE:T", "")
}
```

---

## 模板B: 单字段逐个获取(灵活)

```objectscript
; ============================================================
; 模板B: 单字段逐个获取 (灵活, 可选择性取所需字段)
; 适用: 只需要少量特定字段
; ============================================================

s EpisodeID = admRowId

s zS   = ##Class(EMRservice.BL.BLScatterData).GetDataByGlossaryNew(EpisodeID, "HDSD00.03.057", "0")   ; 主诉
s jWS  = GetData(EpisodeID, "HDSD00.20.021")  ; 既往史
s gMS  = GetData(EpisodeID, "HDSD00.20.022")  ; 过敏史
s cRBS = GetData(EpisodeID, "HDSD00.20.006")  ; 传染病史
s rYQK = GetData(EpisodeID, "HDSD00.16.030")  ; 入院情况
s cYQK = GetData(EpisodeID, "HDSD00.16.004")  ; 出院情况
s sWSYBM = GetData(EpisodeID, "HDSD00.14.123") ; 死亡原因编码
s sWSYMC = GetData(EpisodeID, "HDSD00.14.124") ; 死亡原因名称

; 辅助宏(减少重复代码)
GetData(ep, cod) { 
    q ##Class(EMRservice.BL.BLScatterData).GetDataByGlossaryNew(ep, cod, "0") 
}
```

---

## 模板C: 会诊记录完整遍历

```objectscript
; ============================================================
; 模板C: 会诊记录完整遍历 (含状态过滤+字典翻译)
; 适用: 获取某患者的全部有效会诊记录
; ============================================================

s mradm = $p(^PAADM(EpisodeID), "^", 61)
q:mradm=""

; 遍历会诊记录
s CstID = ""
f  s CstID = $o(^DHCEMCON(0, "ReqDateIndex", "", CstID)) q:CstID=""  d
. s cstData = $g(^DHCEMCON(CstID))
 .
 . ; ★ Step1: 状态过滤
 . s status = $p(cstData, "^", S)  ; S=状态下标(需确认具体位置)
 . i status=1 q                    ; 跳过已撤销
 .
 . ; Step2: 基本信息
 . s reqLocDr = $p(cstData, "^", rL)
 . s reqLocName = $p($g(^CTLOC(reqLocDr)), "^", 2)
 .
 . ; Step3: 会诊类型(字典翻译)
 . s typeDr = $p(cstData, "^", T)
 . s:typeDr'="" s typeName = $p($g(^DHCEMCDI(typeDr)), "^", 2)
 .
 . ; Step4: 专家信息(★用CTPCP不用SSU!)
 . s expertDr = $p(cstData, "^", E)
 . i expertDr=0 s expertDr = $p(cstData, "^", fB)  ; fallback
 . s:expertDr'="" s expertName = $p($g(^CTPCP(expertDr)), "^", 2)
 .
 . ; Step5: 时间信息
 . s applyTime = $p(cstData, "^", aT)
 . s consultTime = $p(cstData, "^", CT)
 . s:consultTime="" consultTime = applyTime
 .
 . ; 输出
 . w CstID, "|", reqLocName, "|", typeName, "|", expertName, "|", consultTime, !
```

---

## 模板D: 生命体征全套获取(双模式)

```objectscript
; ============================================================
; 模板D: 生命体征全套获取 (双模式自动切换)
; 适用: 护理文书/住院清单等需要生命体征的场景
; ============================================================

s mradm = $p(^PAADM(EpisodeID), "^", 61)
q:mradm=""

; 使用封装方法(推荐)
s temp = ..getFirstItemValue(mradm, "temperature"):s:temp="" temp=36.0
s pulse = ..getFirstItemValue(mradm, "pulse"):s:pulse="" pulse=80
s breath = ..getFirstItemValue(mradm, "breath"):s:breath="" breath=20
s hr = ..getFirstItemValue(mradm, "heartRate")

; ★ 心率/脉率相互兜底
i hr="" s hr=pulse
i hr=0 s hr=pulse
s:hr="" hr=80

s sbp = ..getFirstItemValue(mradm, "systolic"):s:sbp="" sbp=110
s dbp = ..getFirstItemValue(mradm, "diastolic"):s:dbp="" dbp=75
s glucose = $fn(..getFirstItemValue(mradm, "degrBlood"), "n", 2):s:glucose="" glucose=10.0
s weight = $fn(..getFirstItemValue(mradm, "weight"), "n", 2):s:weight="" weight=60.00
s ac = ..getFirstItemValue(mradm, "abdominalCircumference"):s:ac="" ac=60.0
s spo2 = ..getFirstItemValue(mradm, "spo2")

; 格式化输出血压(合并显示)
s bP = sbp_"/"_dbp_"mmHg"
```

---

## 模板E: 出院小结全套拼接

```objectscript
; ============================================================
; 模板E: 出院小结核心字段组装
; 适用: 构建出院小结XML/JSON报文
; ============================================================

s EpisodeID = admRowId

; 出院小结五大件
s rYQK  = GetData(EpisodeID, "HDSD00.16.030")   ; 入院情况
s zLGC  = GetData(EpisodeID, "HDSD00.16.045")   ; 诊疗过程
s cYQK  = GetData(EpisodeID, "HDSD00.16.004")   ; 出院情况
s cYYZ  = GetData(EpisodeID, "HDSD00.16.007")   ; 出院医嘱
s yXFZJC = GetData(EpisodeID, "HDSD00.16.042")  ; 阳性辅查

; 空值统一处理
d HandleEmpty(.rYQK)  d HandleEmpty(.zLGC)
d HandleEmpty(.cYQK)  d HandleEmpty(.cYYZ)
d HandleEmpty(.yXFZJC)

HandleEmpty(val) { s:$g(val)="" val="-" }

; 签名信息
s qM   = GetData(EpisodeID, "HDSD00.06.069")    ; 作者签名
s qMDM = GetData(EpisodeID, "HDSD00.06.0691")   ; 签名代码
s qMSJ = GetData(EpisodeID, "HDSD00.07.199")    ; 签名时间
```

---

# 第十一章: 踩坑提示

## ⚠️⭐⭐ 高频坑(必读)

| # | 坑点 | 说明 | 解决方案 |
|---|------|------|---------|
| 1 | **EpisodeID vs mradm混淆** | BLScatterData的参数是**PAADM的RowId**(EpisodeID/就诊流水号), 不是病案号mradm! 但^MR和^MR OBS用的是mradm! | `s EpisodeID = admRowId`(PAADM RowId) / `s mradm = $p(^PAADM(EpisodeID),"^",61)` |
| 2 | **初诊标志不走EMR** | 初诊标志(firstVisit)在PatientInfo.cls中**不从BLScatterData取**, 而是`^PAADM.^72`(FZFlag). 规则库中的HDSD00.03.010可能是备用或历史遗留 | 优先PAADM.FZFlag判断, EMR术语集作为fallback |
| 3 | **现病史双模式兜底** | 现病史先用`GetNewStdDataByGlossary`批量取(HDSD00.03.038), 为空则fallback到`GetScatterData`两次拼接(tID:26+27). **单次API调用很可能拿不到!** | 必须实现双模式兜底, 参考模板A |
| 4 | **会诊专家用^CTPCP而非^SSU** | 申请医生查`^SSU("SSUSR")`, 但会诊专家必须查`^CTPCP`. 两个字典结构不同! | 专家信息固定走CTPCP, CareProvID=0时记得fallback |
| 5 | **会诊必须过滤ECRStatus=1** | ECRStatus=1表示已撤销的会诊记录. 不过滤会把废数据送出去 | 遍历时第一件事就是`i status=1 q` |
| 6 | **心率/脉率相互兜底** | 心率和脉率是唯一一对有相互fallback关系的体征字段. 一个为空或为0就取另一个 | 写死兜底逻辑, 不要单独处理 |

## ⚠️⭐ 中频坑

| # | 坑点 | 说明 | 解决方案 |
|---|------|------|---------|
| 7 | **主诉截取处理** | 主诉原始值可能包含"现病史"等干扰文本, 需要`$p(zS,"现病史",1)`截取 | 截取后再做长度限制 |
| 8 | **血糖/血氧参数疑混** | 原始规则写血氧饱和度的getFirstItemValue参数是`degrBlood`(这是血糖的参数!). 可能是copy-paste错误 | 验证后修正为正确参数(可能是`"spo2"`) |
| 9 | **派生标志位非独立存储** | infectionFlag/allergyFlag/surgeryFlag 都是**计算得出**, 不是独立存储字段 | 基于对应的历史字段非空判断, 不要尝试直接取值 |
| 10 | **护理级别不走BLScatterData** | 护理级别编码走独立的`^NurseEmrShareConfigI`→`^NurMp.DHCTempMultDataI`链路, 与EMR术语集完全隔离 | 按第九章的三级链路代码实现 |
| 11 | **术语集领域编号不一致** | HDSD00的第2段(xX)并非严格按业务划分. 如输血史是13(入院)但预防接种是20(通用). **不要假设同领域字段编号连续!** | 严格按照每个字段的术语编码逐一取值, 不要自行推断编号 |

## ⚠️ 低频坑

| # | 坑点 | 说明 |
|---|------|------|
| 12 | GetScatterData的段描述格式复杂 | `#tYPE:ISectionDesc#tID:N#sCODE:sXXX#vTYPE:T` 这种格式是硬编码的, TID和SCODE对应关系需要查阅EMR文档 |
| 13 | ^MR OBS的时间精度 | ^3=date, ^4=time 分开存储, 拼接时注意格式 |
| 14 | 配置表模式的%OpenId | 最终需要`%OpenId`打开一个持久对象, 不同版本的对象属性名可能不同 |

---

# 第十二章: 别名映射表

## 12.1 门急诊病历 (03)

| 术语编码 | 标准名 | 英文别名 | 中文别名 |
|----------|--------|---------|---------|
| `HDSD0003057` | chiefComplaint | complaint | 主诉, 主诉内容 |
| `HDSD0003038` | presentIllness | presentIllness | 现病史 |
| `HDSD0003037` | physicalExam | physicalExam, pE | 体格检查 |
| `HDSD0003012` | assistExamResult | assistExamResult | 辅助检查结果 |
| `HDSD0003010` | firstVisitFlag | firstVisit | 初诊标志, 初复诊 |
| `HDSD0003019` | emergencyRescueRecord | emergencyRescue | 急诊抢救记录 |
| `HDSD0003018` | observationCourse | observationCourse | 急诊留观病程记录 |
| `HDSD0003028` | rescueEndDt | rescueEndDT | 抢救结束日期时间 |
| `HDSD0003029` | rescueStartDt | rescueStartDT | 抢救开始日期时间 |

## 12.2 个人史/通用 (20)

| 术语编码 | 标准名 | 英文别名 | 中文别名 |
|----------|--------|---------|---------|
| `HDSD0003021` | pastHistory | pastHistory | 既往史 |
| `HDSD0002022` | allergyHistory | allergy | 过敏史 |
| `HDSD0002006` | infectionHistory | infection | 传染病史 |
| `HDSD0002047` | surgeryHistory | surgeryHistory | 手术史 |
| `HDSD0002029` | marriageHistory | marriageHistory | 婚育史 |
| `HDSD0002031` | familyHistory | familyHistory | 家族史 |
| `HDSD0002016` | personalHistory | personalHistory | 个人史 |
| `HDSD0002058` | menstrualHistory | menstrualHistory | 月经史 |
| `HDSD0002057` | vaccinationHistory | vaccinationHistory | 预防接种史 |
| `HDSD0002032` | createDatetime | createDT | 建档日期时间 |
| `HDSD00020341` | creatorName | creatorName | 建档者姓名 |
| `HDSD0002034` | creatorCode | creatorCode | 建档者代码 |

## 12.3 入院记录 (13)

| 术语编码 | 标准名 | 英文别名 | 中文别名 |
|----------|--------|---------|---------|
| `HDSD0013066` | bloodTransfusionHistory | bloodTransfusion | 输血史 |
| `HDSD0013038` | infectionFlag | infectionFlag | 患者传染性标志, 传染性标志 |

## 12.4 出院小结 (16)

| 术语编码 | 标准名 | 英文别名 | 中文别名 |
|----------|--------|---------|---------|
| `HDSD0016030` | admissionCondition | admissionCondition | 入院情况, 入院摘要 |
| `HDSD0016045` | treatmentProcess | treatmentProcess | 诊疗过程描述, 诊疗经过 |
| `HDSD0016004` | dischargeCondition | dischargeCondition | 出院情况, 出院时情况 |
| `HDSD0016007` | dischargeOrder | dischargeOrder | 出院医嘱, 出院指导 |
| `HDSD0016042` | positiveExamResult | positiveExam | 阳性辅助检查结果 |
| `HDSD0016028` | dischargeSignDt | dischargeSignDT | 签名日期时间(出院) |

## 12.5 死亡记录 (14)

| 术语编码 | 标准名 | 英文别名 | 中文别名 |
|----------|--------|---------|---------|
| `HDSD0014123` | deathCauseCode | deathCauseCode | 直接死亡原因编码, 死亡原因编码 |
| `HDSD0014124` | deathCauseName | deathCauseName | 直接死亡原因名称, 死亡原因名称 |
| `HDSD0014105` | deathDiscussion | deathDiscussion | 死亡讨论记录 |
| `HDSD0014110` | discussionDatetime | discussionDT | 讨论日期时间 |
| `HDSD0014008` | discussionParticipants | participants | 参加讨论人员名单, 讨论人员 |
| `HDSD0014117` | attendingDocCode | attendingDocCode | 就诊医生签名代码(死亡) |
| `HDSD00141171` | attendingDocName | attendingDocName | 就诊医生签名(死亡) |

## 12.6 签名/手术/产科 (06/07)

| 术语编码 | 标准名 | 英文别名 | 中文别名 |
|----------|--------|---------|---------|
| `HDSD0006069` | authorSign | authorSign | 作者签名, 医师签名, 签名 |
| `HDSD00060691` | authorSignCode | authorSignCode | 作者签名代码, 医师代码 |
| `HDSD0007199` | signDatetime | signDT | 签名日期时间, 作者签名时间 |
| `HDSD0006032` | allergyFlag | allergyFlag | 过敏史标志 |
| `HDSD0006082` | surgeryFlag | surgeryFlag | 手术史标志 |

---

# 附录: 规则统计

## 按章节分布

| 章节 | 子域 | 规则数 | 数据来源 |
|------|------|--------|---------|
| 第一章 | 门急诊病历 | 8 | HDSD00.03.* |
| 第二章 | 个人史/既往史 | 10 | HDSD00.20.* |
| 第三章 | 入院记录 | 2 | HDSD00.13.* |
| 第四章 | 出院小结 | 6 | HDSD00.16.* |
| 第五章 | 死亡记录/讨论 | 7 | HDSD00.14.* |
| 第六章 | 签名信息 | 5 | HDSD00.06*/07* |
| 第七章 | 会诊记录 | 6 | ^DHCEMCON(非EMR!) |
| 第八章 | 生命体征 | 10 | 双模式(oBS+配置表) |
| 第九章 | 护理级别/配置表 | 4 | 护理配置表链路 |
| **合计** | **10个子域** | **50 (+2派生)** | **3种数据源** |

## 按数据来源分布

| 数据源 | 规则数 | 占比 | 说明 |
|--------|--------|------|------|
| BLScatterData (EMR术语集) | ~38 | 76% | 绝大多数文书字段 |
| ^DHCEMCON (会诊Global) | 6 | 12% | 会诊系统独立存储 |
| ^MR oBS / 护理配置表 | 6 | 12% | 生命体征+护理级别 |
| PAADM 派生 | 2+ | 4% | 初诊标志/各种flag |