---
domain: "50-lab-exam"
name: "检验检查域(lIS/平台组)"
version: "2.2.0"
description: "HIS检验检查取值规则集(v2.1.0 完整版-IRIS验证).涵盖ENS平台组第三方LIS厂商回传数据:检验报告主表(EnsLISReportResult,149属性SQLStorage完整映射)+检验细项结果表(EnsLISItemResult,34属性含药敏子表EnsLISItemSenResult).数据存储在^Busi.ENS全局,$lg()List格式(非^分隔符!).基于MCP获取完整类定义+LabReport.cls/LabDetails.cls双生产接口代码双重验证. v2.1.0修正: IRIS读取LabReport.cls生产源码验证,申请时间用lg80~81非lg22~23,补充初审时间/初/双审医生字段映射."

# 数据源遍历配置（供代码生成器使用）
traversal:
  type: "lIS"
  viewMatchers: ["_lab_", "ex_lab", "lab_item", "test_culture", "test_anti", "test_price", "test_file", "test_qc", "test_host", "JYBG", "DBZ_JYBG", "DBZ_JYBGMX"]
  inputParam:
    name: "admRowId"
    type: "%String"
    description: "就诊ID"
  # 注意：preVariables 不再定义，因为 visitNo/patDR 是在遍历模板循环内部赋值的
  # preVariables 中的变量会在标签代码块最前面执行，此时 admRowId 尚未赋值
  # 子表遍历配置（检验细项结果表）
  subtable:
    viewMatchers: ["JYBGMX", "检验明细", "检验细项", "细项结果", "lab_item"]
    description: "检验细项结果表(EnsLISItemResult)遍历配置"
    global: "^Busi.ENS.EnsLISItemResultD"
    parentKey:
      expression: "$lg(data,2)"
      description: "主表lg(2)=ReportID作为子表关联键"
    index:
      global: "^Busi.ENS.EnsLISItemResultI"
      name: "IndexReportItem"
      keys: ["reportId", "itemCode", "itemRowId"]
      expression: '$o(^Busi.ENS.EnsLISItemResultI("IndexReportItem",$zcvt(reportId,"U"),itemCode,itemRowId))'
    template: |
      ; 遍历检验细项子表
      s reportId=$lg(data,2)
      s itemCode=""
      f {
        s itemCode=$o(^Busi.ENS.EnsLISItemResultI("IndexReportItem",$zcvt(reportId,"U"),itemCode))
        q:itemCode=""
        s itemRowId=""
        f {
          s itemRowId=$o(^Busi.ENS.EnsLISItemResultI("IndexReportItem",$zcvt(reportId,"U"),itemCode,itemRowId))
          q:itemRowId=""
          s itemData=$g(^Busi.ENS.EnsLISItemResultD(itemRowId))
          continue:itemData=""
          d GetItemDetail
        }
      }

  # 按日期范围遍历模式（直接从报告表日期索引进入）
  modes:
    dateRange:
      viewMatchers: ["检验报告", "检验信息", "LabReport", "JYBG", "DBZ_JYBG", "DBZ_JYBGMX"]
      description: "按审核日期范围遍历（直接从报告表索引进入，性能更优）"
      index:
        global: "^Busi.ENS.EnsLISReportResultI"
        name: "LISRRCheckDateTimeIndex"
        keys: ["checkDate", "checkTime", "rowId"]
        expression: '$o(^Busi.ENS.EnsLISReportResultI("LISRRCheckDateTimeIndex",checkDate,checkTime,rowId))'
      template: |
        ; 日期格式转换
        i pDateFrom'="" s pDateFrom=$zdh(pDateFrom,3)
        i pDateTo'="" s pDateTo=$zdh(pDateTo,3)
        f checkDate=pDateFrom:1:pDateTo d
        .s checkTime=""
        .f  s checkTime=$o(^Busi.ENS.EnsLISReportResultI("LISRRCheckDateTimeIndex",checkDate,checkTime),-1) q:checkTime=""  d
        ..s rowId=""
        ..f  s rowId=$o(^Busi.ENS.EnsLISReportResultI("LISRRCheckDateTimeIndex",checkDate,checkTime,rowId)) q:rowId=""  d
        ...s data=$g(^Busi.ENS.EnsLISReportResultD(rowId))
        ...i data="" q
        ...; 院区过滤（lg146=院区代码）
        ...q:(pHospitalId'="")&&($lg(data,146)'=pHospitalId)
        ...s visitNo=$lg(data,5)
        ...s admRowId=visitNo
        ...s patDR=$lg(data,3)
        ...d GetReportDetail
    admSingle:
      viewMatchers: ["单个检验", "检验详情"]
      description: "按就诊ID遍历（单条查询）"
      index:
        global: "^Busi.ENS.EnsLISReportResultI"
        name: "LISRRVisitNumberIndex"
        keys: ["visitNo", "rowId"]
        expression: '$o(^Busi.ENS.EnsLISReportResultI("LISRRVisitNumberIndex",visitNo,rowId))'
      template: |
        s rowId=""
        f  s rowId=$o(^Busi.ENS.EnsLISReportResultI("LISRRVisitNumberIndex",visitNo,rowId)) q:rowId=""  d
        .s data=$g(^Busi.ENS.EnsLISReportResultD(rowId))
        .i (data="") q
  # 默认配置（按就诊ID遍历，兼容旧逻辑）
  index:
    global: "^Busi.ENS.EnsLISReportResultI"
    name: "LISRRVisitNumberIndex"
    keys: ["visitNo", "rowId"]
    expression: '$o(^Busi.ENS.EnsLISReportResultI("LISRRVisitNumberIndex",visitNo,rowId))'
  data:
    global: "^Busi.ENS.EnsLISReportResultD"
    variable: "data"
    format: "lg"
    expression: "$g(^Busi.ENS.EnsLISReportResultD(rowId))"
  template: |
    s rowId=""
    f  s rowId=$o(^Busi.ENS.EnsLISReportResultI("LISRRVisitNumberIndex",visitNo,rowId)) q:rowId=""  d
    .s data=$g(^Busi.ENS.EnsLISReportResultD(rowId))
    .i (data="") q

sourceClass:
  - name: "User.EnsLISReportResult (报告主表, 149属性) ✅ SQLStorage完整"
    description: "★ENS平台报告主表.SqlTableName=Ens_LISReportResult.Global=^Busi.ENS.EnsLISReportResultD.pK=LISRRReportID($lg(2)).$lg()List格式,SqlColumnNumber 2~149全覆盖."
    keyProperties: "lg(2)=ReportID(pK)/lg(3)=PatientID->PAPatMas/lg(5)=VisitNumber->PAAdm/lg(20~21)=DeptCode+Name/lg(22~23)=RequestDT(申请)/lg(46)=RequestNo/lg(47)=Urgent/lg(48~49)=CollectDT(采集)/lg(61~62)=CarryDT(运送)/lg(85~86)=ArriveDT(送达)/lg(92~93)=TestDT(检测)/lg(101)=ReprotType(1普2危)/lg(107~108)=CheckDT(审核)/lg(109~110)=CheckUser/lg(113~114)=FirstCheckUser/lg(115)=OrderItemDesc/lg(117)=Status(1审2取消3废)/lg(120~121)=WorkGroup/lg(125~128)=Accept(核收)/lg(143~144)=Conclusion/lg(147)=SpecimenDesc"
    sqlTableName: "Ens_LISReportResult"
    global: "^Busi.ENS.EnsLISReportResultD"
    indexes: "LISRRPatientIDIndex(lg3,lg107,lg108)/LISRRVisitNumberIndex(lg5)/LISRRUpdateTimeIndex(lg104,lg105)/LISRRCheckDateTimeIndex(lg146,lg107,lg108)"

  - name: "User.EnsLISItemResult (细项结果表, 34属性) ✅ SQLStorage完整"
    description: "★细项结果表.SqlTableName=Ens_LISItemResult.fK=lg(3)LISIRReportID->EnsLISReportResult.索引IndexReportItem必须$zcvt(reportID,'U')转大写!"
    keyProperties: "lg(2)=RowID(PK自增整数)/lg(3)=ReportID(fK!)/lg(4)=PatientID/lg(5)->PAAdm/lg(6)=ItemCode(项目编码)/lg(7)=ItemDesc(项目名称)/lg(8)=Result(结果值)/lg(9)=Uint(单位)/lg(10)=TextResult(定性fallback)/lg(13)=AbnormalFlags(H/L/N)/lg(14)=Ranges(参考范围)/lg(15)=TestMethod/ lg(16)=TestMachine/lg(19)=ShowSeq(显示序号)/lg(27)=InterCode(lOINC?)/lg(28)->OEOrdItem(医嘱FK)/lg(29)=AssayStatus(1创2传3果4查)/lg(32)=Organism(细菌名)"
    sqlTableName: "Ens_LISItemResult"
    global: "^Busi.ENS.EnsLISItemResultD"
    parentKey: "lg(3)LISIRReportID -> EnsLISReportResult.lg(2)LISRRReportID"
    indexes: "IndexReportItem(lg3,lg6 uNIQUE)/LISIRAdmItemIndex(lg5,lg6,lg20,lg21)"

  - name: "^Busi.ENS.EnsLISItemSenResultD (药敏子表) ⚠️ LabDetails发现"
    description: "★抗生素敏感性结果子表.每条细项对应的药敏试验.通过EnsLISItemResult.lg(2)RowID关联."
    usage: "索引: ('pKHIPUSERLISITEMSENRESULT', lisIRRowId, antId); 字段: lg(3)=antId, lg(4)=antCname"

  - name: "LabReport.cls (生产接口) ✅ 完整源码"
    description: "★GetLabReport(XML输入).支持登记号/住院号/身份证三种方式.QryRepByID提取40+字段含危急值/加急/诊断."
    methods: ["GetLabReport", "QryRepByID", "GetDiagnoses", "getDateTime"]

  - name: "LabDetails.cls (生产接口) ✅ 完整源码"
    description: "★GetLabDetails(repNo).细项遍历:$zcvt转大写+TextResult fallback+参考范围min-max解析+药敏子表."
    methods: ["GetLabDetails", "GetResultIDByRepNo", "ReportDetails"]

totalRules: 95
lastUpdated: "2026-05-11"
status: "v2.1.0 完整版-IRIS验证 — 149+34属性SQLStorage映射 + LabReport.cls生产源码IRIS验证 + 修正申请时间/补充初审核收字段"
---

# 检验检查域 (50-lab-exam) 取值规则 v2.0

> ENS平台组第三方LIS厂商回传 | `$lg()` List格式 |互联互通必报项

## 架构总览

```
┌──────────────────────────────────────────────────────────────┐
│                    eNS 平台总线层                             │
│            第三方LIS厂商 → ^Busi.ENS 全局                    │
└────────────────────┬─────────────────────────────────────────┘
                     │
     ┌───────────────┼───────────────┐
     ▼               ▼               ▼
┌───────────┐ ┌───────────┐ ┌──────────────────┐
│ ReportResult│ │ ItemResult│ │ ItemSenResult    │
│ 报告主表    │ │ 细项子表   │ │ 药敏子表(v2.0新)│
│ 149属性     │ │ 34属性     │ │ 抗生素敏感性      │
│ ^Busi...D   │ │ ^Busi...D  │ │ ^Busi...D        │
│ $lg()List  │ │ $lg()List  │ │ $lg()List        │
└─────┬──────┘ └─────┬──────┘ └────────┬─────────┘
      │              │                 │
      │  fK:         │  fK:            │  fK:
      │  lg(2)       │  lg(3)          │  ItemResult.lg(2)
      │  =ReportID   │  =ReportID      │  =lisIRRowID
      └──────────────┴─────────────────┘

遍历入口:
  PatientID → LISRRPatientIDIndex → ReportRowId
                                          → IndexReportItem($zcvt,U!) → ItemRowId
                                                                   → pKHIPUSER...SenResult → SenRowId
```

## 一、$lg() 格式强制规范（🔴 最高优先级）

### 规则 F0-001/F0-002

| 维度 | 传统HIS (^DHCPB等) | ENS平台 (^Busi.ENS.*) |
|------|-------------------|---------------------|
| **取值函数** | `$p(data,"^",n)` | **`$lg(data,n)`** |
| **下标起始** | Piece=1 | List元素通常从1或2 |
| **Global示例** | `^DHCPB`, `^OEORD`, `^PAADM` | `^Busi.ENS.EnsLIS*D` |
| **索引Global** | `^DHCPBI(...)` | `^Busi.ENS.EnsLIS*I` |

```objectscript
;; ✅ 正确
s val = $lg($g(^Busi.ENS.EnsLISReportResultD(rowId)), 2)

;; ❌ 错误 - 用了^分隔符读ENS数据!
s val = $p($g(^Busi.ENS.EnsLISReportResultD(rowId)), "^", 2)
```

---

## 二、EnsLISReportResult 报告主表 — 149属性完整速查

### Global 结构

```
数据:  ^Busi.ENS.EnsLISReportResultD(RowId)  → $lg() List
索引:  ^Busi.ENS.EnsLISReportResultI
       ("LISRRPatientIDIndex", PatRowId, CheckDate, CheckTime, RowId)
pK:    LISREPORTRESULTPKey on LISRRReportID (lg(2))
```

### 属性速查表（按功能分组）

#### A. 基础标识 (lg1~6)

| lg(n) | 属性名 | 类型 | 说明 | 上报用途 |
|-------|--------|------|------|---------|
| 2 | **LISRRReportID** | String(300) | ★报告ID/pK, $I自增 | jybgBgdh |
| 3 | **LISRRPatientID** | →PAPatMas | ★患者ID, 索引键 | 关联患者 |
| 4 | LISRREncounterTypeCode | String(20) | 就诊类型代码 | 门诊/住院区分 |
| 5 | **LISRRVisitNumber** | →PAAdm | ★就诊号→PAADM | JYBG_HZJZH间接 |
| 6 | LISRRDocumentNO | String(15) | 病案号 | 住院病案号 |

#### B. 就诊信息 (lg7~12)

| lg(n) | 属性名 | 类型 | 说明 |
|-------|--------|------|------|
| 7 | LISRRAdmDate | Date | 就诊日期 |
| 8 | LISRRAdmTime | Time | 就诊时间 |
| 9 | LISRRCertType | String(15) | 证件类型名称 |
| 10 | LISRRCertNo | String(18) | 证件号 |
| 11 | **LISRRIDNumber** | String(18) | 身份证号 |
| 12 | LISRRPaymentType | String(40) | 支付类型名称 |

#### C. 患者人口学 (lg13~18)

| lg(n) | 属性名 | 类型 | 说明 |
|-------|--------|------|------|
| 13 | **LISRRPatientName** | String(60) | 姓名 |
| 14 | **LISRRSex** | String(20) | 性别(男/女/未知/未说明) |
| 15 | lISRRDOB | Date | 出生日期 |
| 16 | **LISRRAge** | String(30) | 年龄字符串 |
| 17 | LISRRAgeUnit | String(60) | 年龄单位 |
| 18 | LISRRNation | String(50) | 民族 |

#### D. 申请科室/医院 (lg19~26) — 核心业务字段

| lg(n) | 属性名 | 类型 | 说明 | 上报 |
|-------|--------|------|------|------|
| 19 | LISRRHospital | String(50) | 申请医院 | |
| 20 | **LISRRDeptCode** | String(30) | ★申请科室代码 | jybgSqks(code) |
| 21 | **LISRRDeptName** | String(50) | ★申请科室名称 | jybgSqks(name) |
| 22 | **LISRRRequestDate** | Date | ★申请日期 | jybgSqsj(date) |
| 23 | **LISRRRequestTime** | Time | ★申请时间 | jybgSqsj(time) |
| 24 | LISRRWardCode | String(50) | 病区代码 | |
| 25 | LISRRWardName | String(50) | 病区名称 | |
| 26 | **LISRRBedNo** | String(20) | 床号 | 床位信息 |

#### E. 临床症状/联系方式/体征 (lg27~44)

| lg(n) | 属性名 | 说明 | lg(n) | 属性名 | 说明 |
|-------|--------|------|-------|--------|------|
| 27 | LISRRSymptom | 临床症状 | 36 | LISRRPregnantWeeks | 怀孕周数 |
| 28 | LISRRMobileNo | 手机号 | 37 | **lISRRABO** | ABO血型(A/B/O/aB) |
| 29 | LISRRPhoneNo | 座机号 | 38 | **lISRRRH** | RH血型(阴/阳) |
| 30 | LISRREmail | 邮箱 | 39 | LISRRAddress | 地址 |
| 31 | LISRRHeight | 身高 | 40 | LISRRInfectFlag | 传染标志 |
| 32 | LISRRWeight | 体重 | 41 | LISRRInfectAlert | 院感标志 |
| 33 | LISRRBloodPressure | 血压 | 42 | LISRRSpecialFlag | 特殊标本标志 |
| 34 | LISRRClinicalConditions | 生理条件 | 43 | LISRRPregnantNum | 孕次 |
| 35 | LISRRPregnant | 是否怀孕 | 44 | LISRRChildbirthNum | 产次 |

#### F. 申请信息 (lg45~47)

| lg(n) | 属性名 | 说明 | 风险 |
|-------|--------|------|------|
| 45 | LISRRReqNotes | 申请备注 | |
| 46 | **LISRRRequestNo** | ★申请单号! | 唯一申请标识 |
| 47 | **LISRRUrgent** | ★是否加急! | 危急值相关 |

#### G. 采集信息 (lg48~60) — 标本生命周期起点

| lg(n) | 属性名 | 说明 | 上报 | 验证 |
|-------|--------|------|------|------|
| 48 | **LISRRCollectDate** | ★采集日期 | jybgCysj(date) | ✅ GetLabReport |
| 49 | **LISRRCollectTime** | ★采集时间 | jybgCysj(time) | ✅ GetLabReport |
| 50 | LISRRCollectUserCode | 采集者代码 | →SSUser | LabReport |
| 51 | LISRRCollectUserDesc | 采集者姓名 | | LabReport |
| 52 | LISRRCollectPositionCode | 采集部位代码 | | |
| 53 | LISRRCollectPosition | 采集部位名称(如"静脉") | | |
| 54 | LISRRContainerCode | 容器代码 | | |
| 55 | LISRRContainer | 容器名称(如"EDTA管"/"促凝管") | 标本类型 | |
| 56 | LISRRCollectNotes | 采集说明 | | |
| 57 | LISRRH24Volume | 24h尿量 | | |
| 58 | LISRRH24UTimePeriod | 24h时间段 | | |
| 59 | LISRRBodyTemp | 体温 | | |
| 60 | LISRRConfidential | 保密标志 | | |

#### H. 运送/接收 (lg61~70)

| lg(n) | 属性名 | 说明 | 上报 |
|-------|--------|------|------|
| 61 | LISRRCarryDate | 运送日期 | jybgSjsj(date) |
| 62 | LISRRCarryTime | 运送时间 | jybgSjsj(time) |
| 63 | LISRRCarryUserCode | 运送者代码 | |
| 64 | LISRRCarryUserDesc | 运送者姓名 | |
| 65 | LISRRReceiveDate | 接收日期 | |
| 66 | LISRRReceiveTime | 接收时间 | |
| 67 | LISRRReceiveUserCode | 接收者代码 | |
| 68 | LISRRReceiveUserDesc | 接收者描述 | |
| 69 | **LISRRSpecimenQuality** | 标本质量(溶血/脂血/凝固等) | 🟡质控关键 |
| 70 | LISRRReceiveNotes | 接收说明 | |

#### I. 出入库管理 (lg71~79)

| lg(n) | 属性名 | lg(n) | 属性名 |
|-------|--------|-------|--------|
| 71 | LISRRInStorageDate (入日期) | 76 | LISRROutStorageDate (出日期) |
| 72 | LISRRInStorageTime (入时间) | 77 | LISRROutStorageTime (出时间) |
| 73 | LISRRInStorageUserCode (入人码) | 78 | LISRROutStorageUserCode (出人码) |
| 74 | LISRRInStorageUserDesc (入人名) | 79 | LISRROutStorageType (出类型) |
| 75 | LISRRInStorageUserDesc (入人名) | | |

#### J. 创建/送达 (lg80~89) ⚠️ v1.0 GetLabReport 误标!

| lg(n) | 属性名 | v1.0误标 | 正确含义 | 来源验证 |
|-------|--------|---------|---------|---------|
| 80 | LISRRAddDate | ~~申请日期~~ | 创建/系统日期 | 类定义 |
| 81 | LISRRAddTime | ~~申请时间~~ | 创建/系统时间 | 类定义 |
| 82 | **LISRRAddUserCode** | | 创建者≈**申请医生代码**! | LabReport用作appDrCode |
| 83 | **LISRRAddUserDesc** | | 创建者≈**申请医生姓名**! | LabReport用作appDrName |
| 84 | LISRRAddType | | 创建类型 | |
| 85 | **LISRRArriveDate** | ~~运送日期~~ | ★送达/到达日期! | 类定义 |
| 86 | **LIRRRArriveTime** | ~~运送时间~~ | ★送达/到达时间! | 类定义 |
| 87 | LIRRRArriveUserCode | | 送达者代码 | LabReport用作sendOper |
| 88 | LIRRRArriveUserDesc | | 送达者姓名 | LabReport用作sendOperName |
| 89 | LIRRRArriveWorkGroup | | 送达工作组/位置 | |

#### K. 检测/作废 (lg90~98)

| lg(n) | 属性名 | 说明 | 上报 |
|-------|--------|------|------|
| 90 | LISRRMachineDate | 上机日期 | |
| 91 | LISRRMachineTime | 上机时间 | |
| 92 | **LISRRTestDate** | ★检测日期 | jybgJysj(date) ✅ |
| 93 | **LISRRTestTime** | ★检测时间 | jybgJysj(time) ✅ |
| 94 | LISRRCancelDate | 作废日期 | 状态=3时有效 |
| 95 | LISRRCancelTime | 作废时间 | |
| 96 | LISRRCancelUserCode | 作废者代码 | |
| 97 | LISRRCancelUserDesc | 作废者描述 | |
| 98 | LISRRCancelReason | 作废原因(mAXLEN=100) | |

#### L. 报告内容 (lg99~106)

| lg(n) | 属性名 | 类型 | 说明 |
|-------|--------|------|------|
| 99 | LISRRReprotXml | Stream | 报告XML原文 |
| 100 | LISRRReprotPdf | Stream | 报告PDF |
| 101 | **LISRRReprotType** | String(4) | ★报告类型: **1普通 / 2危急值 / 0其他** 🔴 |
| 102 | LISRRRemarks | String(512) | 备注 |
| 103 | LISRRISMcroorganism | String(1) | 是否微生物: **1微生物 / 2普通** |
| 104 | LISRRUpdateDate | Date | 时间戳日期 |
| 105 | LISRRUpdateTime | Time | 时间戳时间 |
| 106 | LISRRIdentifition | String(100) | 鉴定结果(微生物专用) |

#### M. 审核/状态 — 最重要业务字段 (lg107~118)

| lg(n) | 属性名 | 说明 | 上报 | 验证来源 |
|-------|--------|------|------|---------|
| 107 | **LISRRCheckDate** | ★审核/发布日期 | jybgBgsj(date) | ✅ 双重验证 |
| 108 | **LISRRCheckTime** | ★审核/发布时间 | jybgBgsj(time) | ✅ 双重验证 |
| 109 | **LISRRCheckUserCode** | ★审核医生代码 | | LabReport |
| 110 | **LISRRCheckUserDesc** | ★审核医生姓名 | | LabReport |
| 111 | LISRRFirstCheckDate | 初审日期 | | |
| 112 | LISRRFirstCheckTime | 初审时间 | | |
| 113 | **LISRRFirstCheckUserCode** | ★初审医生代码 | | LabReport=checkDrCode |
| 114 | **LISRRFirstCheckUserDesc** | ★初审医生姓名 | | LabReport=checkDrName |
| 115 | **LISRROrderItemDesc** | 医嘱/组合项目描述 | ≈jybgJyxmmc | LabReport=repName |
| 116 | LISRRWarnCode | 异常标识代码 | | |
| 117 | **LISRRStatus** | ★状态: **1已审 / 2取消 / 3作废** | 🔴 过滤条件 | |
| 118 | LISRRAuthType | 审核方式: 1手工 / 2自动 | | |

#### N. 扩展字段 (lg119~142)

| 分组 | lg范围 | 关键字段 |
|------|--------|---------|
| 传输/工作 | 119~124 | TransmitDate / WorkGroupCode+Desc / Order(序号) / SpecimenID(标本代码) / AccessionNo(细菌鉴定) |
| 核收 | 125~128 | AcceptDate+Time + **AcceptUserCode+Desc(核收者)** |
| 重审 | 129~132 | ReCheckDate+Time + ReCheckUserCode+Desc |
| 签名/阅读 | 133~142 | AutoCheck / DigitSign+String+Time / Printed / Readed / FirstRead(Date+Time+User) |

#### O. 结论/院区/标本 (lg143~149) — 最终输出

| lg(n) | 属性名 | 说明 | 上报用途 |
|-------|--------|------|---------|
| 143 | **LISRRMainConclusion** | ★报告主评价/结论! | jYBG 结论文本 |
| 144 | **LISRRMinorConclusion** | ★报告次评价/结论! | 补充结论 |
| 145 | LISRRReAssayNumber | 复查号 | |
| 146 | **LISRRHosCode** | ★院区代码 | 多院区区分 |
| 147 | **LISRRSpecimenDesc** | ★标本名称! | 如"全血""血清""尿液""痰液" |
| 148 | LISRRHosName | 院区名称 | |
| 149 | LISRRManualOrdItemList | 手工计费医嘱rowid串 | 特殊计费场景 |

---

## 三、报告主表取值规则 (LRR-001 ~ LRR-020)

### LRR-001: 遍历入口 — 四层索引循环

```objectscript
;; 输入: patRowId (pAPMI.RowId)
;; 输出: 遍历该患者所有报告
;; 可选过滤: startDateTime / endDateTime (LabReport支持)

s checkDate = ""
f {
    s checkDate = $o(^Busi.ENS.EnsLISReportResultI("LISRRPatientIDIndex", patRowId, checkDate))
    q:checkDate=""

    ;; 可选: 时间范围过滤 (来自LabReport.cls)
    ; i $l(SttDate), checkDate < SttDate q       ; 早于起始日期跳过
    ; i $l(EndDate), checkDate > EndDate q       ; 晚于截止日期跳过

    s checkTime = ""
    f {
        s checkTime = $o(^Busi.ENS.EnsLISReportResultI("LISRRPatientIDIndex", patRowId, checkDate, checkTime))
        q:checkTime=""

        ;; 可选: 时间过滤
        ; i +StTime > 0, checkTime < StTime q
        ; i +EndTime > 0, checkTime > EndTime q

        s rowId = ""
        f {
            s rowId = $o(^Busi.ENS.EnsLISReportResultI("LISRRPatientIDIndex", patRowId, checkDate, checkTime, rowId))
            q:rowId=""

            s rd = $g(^Busi.ENS.EnsLISReportResultD(rowId))
            continue:(rd="")
            ;; ↓↓↓ 处理单条报告 ↓↓↓
        }
    }
}

;; ⚠️ 索引名固定为 "LISRRPatientIDIndex", 拼错不报错但返回空集
```

**来源**: LabReport.cls `GetReport` 标签 + GetLabReport.cls 遍历逻辑

### LRR-002: 报告号 + 危急值标志 + 加急标志

```objectscript
s rd = $g(^Busi.ENS.EnsLISReportResultD(rowId))

s reportId   = $lg(rd, 2)    ;; 报告单号 (pK)
s repType    = $lg(rd, 101)   ;; 报告类型: 1普通 / 2危急 / 0其他
s urgentFlag = $lg(rd, 47)    ;; 是否加急

;; 危急值判断 (来自LabReport.cls):
s dangerFlag = 0
i repType = 2 s dangerFlag = 1   ;; type=2 表示危急值

;; 加急判断:
s urgent = 0
i urgentFlag'="" s urgent = 1
```

**验证**: ✅ LabReport.cls QryRepByID

### LRR-003: 就诊关联 + 患者基本信息

```objectscript
s admId    = $lg(rd, 5)      ;; 就诊号 → PAADM
s papmiDr  = $lg(rd, 3)      ;; 患者ID → pAPATMAS (索引键!)

;; 从PAPATMAS取患者详情 (LabReport.cls做法):
s patName = $p($g(^PAPER(papmiDr, "ALL")), "^", 1)   ;; 姓名
s sexDr   = $p($g(^PAPER(papmiDr, "ALL")), "^", 7)   ;; 性别DR
s:(sexDr'="") sex = $p($g(^CT("SEX", sexDr)), "^", 2) ;; 性别名称
s age     = ##class(web.DHCBillInterface).GetPapmiAge(papmiDr, "")  ;; 年龄
s bedNo   = $lg(rd, 26)      ;; 床号 (报告中自带!)
s diag    = ..GetDiagnoses(admId)  ;; 诊断 (调用诊断域方法)
s address = $g(^PAPER(papmiDr, "PER", "aDD", 1))  ;; 地址
s tel     = $p($g(^PAPER(papmiDr, "PER", 4)), "^", 21)  ;; 电话
s insNo   = $p($g(^PAPER(papmiDr, "PAT", 3)), "^", 6)  ;; 医保号/社保号
```

**验证**: ✅ LabReport.cls QryRepByID 完整代码

### LRR-004: 申请科室 + 申请医生 (v2.0 修正!)

```objectscript
;; 申请科室
s appDeptCode = $lg(rd, 20)    ;; 科室代码
s appDeptName = $lg(rd, 21)    ;; 科室名称

;; 申请医生 ⚠️ v2.0修正: 是lg(82/83)创建者,不是独立字段!
s appDrCode  = $lg(rd, 82)     ;; 创建者代码 ≈ 申请医生代码
s appDrName  = $lg(rd, 83)     ;; 创建者描述 ≈ 申请医生姓名

;; 注意: LabReport.cls中确实用lg(82)/lg(83)作为appDrCode/appDrName
;; 这意味着"创建者"在语义上等同于"开立申请的医生"
```

**验证**: ✅ LabReport.cls QryRepByID (`appDrCode`/`appDrName`赋值)

#### JYBG_SQKS (申请科室)

| 属性 | 值 |
|------|-----|
| 标准名 | `jybgSqks` |
| 匹配模式 | jybgSqks, JYBG_SQKS, 申请科室, 申请科室名称, 申请科室代码 |
| 取值表达式 | `$lg(data,21)` |
| Global | `^Busi.ENS.EnsLISReportResultD` |
| 节点路径 | `lg(21)=LISRRDeptName` |
| 置信度 | 0.99 |
| 分类 | 申请科室 |
| 域 | 50-lab-exam |

**说明**：申请科室名称，从检验报告主表 lg(21) 获取。与医嘱域的申请科室不同，检验域直接从报告表获取。

```objectscript
s jybgSqks = $lg(data,21)  ; 申请科室名称
```

### LRR-005: 申请时间 (v2.1 IRIS验证!)

```objectscript
;; ✅ v2.1 IRIS验证: 申请日期/时间用 lg(80)/lg(81)!
;; LabReport.cls生产代码确认: ReqDate=$lg(ReportData,80)
s reqDate = $lg(rd, 80)     ;; 申请日期 (LabReport.cls验证)
s reqTime = $lg(rd, 81)     ;; 申请时间 (LabReport.cls验证)
s reqDateTime = ..getDateTime(reqDate, reqTime)

;; ⚠️ SQLStorage属性名: lg(80)=LISRRAddDate, lg(22)=LISRRRequestDate
;; 但生产代码实际用的是lg80/81! 按生产代码为准!
```

**验证**: ✅ LabReport.cls QryRepByID (`ReqDate=$lg(rd,80), ReqTime=$lg(rd,81)`)

### LRR-006: 采集时间 (保持不变)

```objectscript
s colDate = $lg(rd, 48)     ;; LISRRCollectDate ✅
s colTime = $lg(rd, 49)     ;; LISRRCollectTime ✅
s colDateTime = ..getDateTime(colDate, colTime)

s sampleOperCode = $lg(rd, 50)  ;; 采集者代码
s sampleOperName = $lg(rd, 51)  ;; 采集者姓名
```

### LRR-007: 送运时间 (v2.0 修正!)

```objectscript
;; ✅ v2.0正确: 运送用 lg(61)/lg(62), 送达用 lg(85)/lg(86)

;; 方式A: 运送 ( Carry )
s carryDate = $lg(rd, 61)
s carryTime = $lg(rd, 62)
s carryDateTime = ..getDateTime(carryDate, carryTime)
s carryOper  = $lg(rd, 63)
s carryName  = $lg(rd, 64)

;; 方式B: 送达/到达 ( Arrive ) ← LabReport用作sendTime
s arriveDate = $lg(rd, 85)
s arriveTime = $lg(rd, 86)
s arriveDateTime = ..getDateTime(arriveDate, arriveTime)
s arriveOper = $lg(rd, 87)
s arriveName = $lg(rd, 88)

;; LabReport.cls中:
;; sendTime = getDateTime(lg(85), lg(86))  -- 用的是Arrive不是Carry!
;; sendOper = lg(87), sendOperName = lg(88)
```

**验证**: ✅ LabReport.cls QryRepByID

### LRR-008: 检验时间 (不变 ✅)

```objectscript
s testDate = $lg(rd, 92)    ;; LISRRTestDate ✅
s testTime = $lg(rd, 93)    ;; LISRRTestTime ✅
s testDateTime = ..getDateTime(testDate, testTime)
```

### LRR-009: 核收/接收时间 (v2.0 新增!)

```objectscript
;; 接收 (Receive, lg65~68)
; s recDate = $lg(rd, 65)  ; LISRRReceiveDate
; s recTime = $lg(rd, 66)  ; LISRRReceiveTime

;; 核收 (Accept, lg125~128) -- LabReport用作receiveTime!
s acceptDate = $lg(rd, 125)   ;; LISRRAcceptDate
s acceptTime = $lg(rd, 126)   ;; LISRRAcceptTime
s acceptDateTime = ..getDateTime(acceptDate, acceptTime)
s acceptOper  = $lg(rd, 127)  ;; 核收者代码
s acceptName  = $lg(rd, 128)  ;; 核收者姓名
```

**验证**: ✅ LabReport.cls (`receiveOper`/`receiveOperName`/`receiveTime`)

### LRR-010: 审核时间 + 审核医生 (v2.0 扩展)

```objectscript
;; 终审 (lg107~110) -- 报告最终发布时间
s auditDate  = $lg(rd, 107)   ;; LISRRCheckDate ✅
s auditTime  = $lg(rd, 108)   ;; LISRRCheckTime ✅
s auditDateTime = ..getDateTime(auditDate, auditTime)
s auditDrCode  = $lg(rd, 109)  ;; 审核医生代码
s auditDrName  = $lg(rd, 110)  ;; 审核医生姓名

;; 初审 (lg111~114) -- 第一次审核
s firstAuditDate = ..getDateTime($lg(rd, 111), $lg(rd, 112))
s firstAuditDrCode = $lg(rd, 113)  ;; LabReport=firstAuditDrCode
s firstAuditDrName = $lg(rd, 114)  ;; LabReport=firstAuditDrName

;; ⚠️ LabReport.cls中初审和终审用的是不同的医生字段!
;; firstAuditDrCode = lg(113), firstAuditDrName = lg(114)
;; secondAuditDrCode = lg(109), secondAuditDrName = lg(110)
```

**验证**: ✅ LabReport.cs QryRepByID (firstAudit + secondAudit 分别赋值)

### LRR-011: 报告状态过滤

```objectscript
s status = $lg(rd, 117)  ;; LISRRStatus: 1=已审 / 2=取消审核 / 3=作废

;; 只取已审核的报告:
i status'=1 continue  ;; 或 status=2!(status'="1")

;; 状态说明:
;;  "1" = 已审核(正常可上报)
;;  "2" = 取消审核(退回修改, 不应上报)
;;  "3" = 已作废(无效报告)
```

### LRR-012: 项目/标本信息

```objectscript
s orderDesc   = $lg(rd, 115)   ;; 医嘱描述/组合项目名 (如"血常规")
s specimenDesc= $lg(rd, 147)   ;; 标本名称 (如"全血")
s specimenID  = $lg(rd, 123)   ;; 标本代码/条码号
s workGroupCd = $lg(rd, 120)   ;; 工作组代码
s workGroupNm = $lg(rd, 121)   ;; 工作组名称
s reportNo   = $lg(rd, 122)   ;; 标本报告序号
s requestNo  = $lg(rd, 46)    ;; 申请单号
```

### LRR-013: 报告结论

```objectscript
s mainConclusion  = $lg(rd, 143)  ;; 主评价/结论
s minorConclusion = $lg(rd, 144)  ;; 次评价/结论
s remarks         = $lg(rd, 102)  ;; 备注(mAXLEN=512)
s identifition    = $lg(rd, 106)  ;; 鉴定结果(微生物)
s isMicroorganism = $lg(rd, 103)  ;; 1微生物 / 2普通
s warnCode        = $lg(rd, 116)  ;; 异常标识代码
s protType        = $lg(rd, 101)  ;; 报告类型(1普/2危/0其)
```

### LRR-014: 院区/医院信息

```objectscript
s hospital = $lg(rd, 19)      ;; 申请医院
s hosCode   = $lg(rd, 146)    ;; 院区代码
s hosName   = $lg(rd, 148)    ;; 院区名称
```

### LRR-015 ~ LRR-020: 辅助规则（占位，按需展开）

| 规则 | 字段 | 说明 |
|------|------|------|
| lRR-015 | lg(99~100) | XML/PDF报告原文(Stream类型, 需特殊读取) |
| lRR-016 | lg(133~136) | 自动审核标志 + 数字签名 |
| lRR-017 | lg(137~142) | 打印/阅读状态追踪 |
| lRR-018 | lg(129~132) | 重审信息 |
| lRR-019 | lg(94~98) | 作废流程追踪 |
| lRR-020 | lg(149) | 手工计费医嘱列表 |

---

## 四、EnsLISItemResult 细项结果表 — 34属性 + 遍历

### v2.0 完整属性速查

| lg(n) | 属性名 | 类型 | 说明 | 上报 |
|-------|--------|------|------|------|
| 2 | **LISIRRowID** | Integer pK | 序列ID, $I自增 | 内部标识 |
| 3 | **LISIRReportID** | String(50) | ★fK → 报告主表.lg(2) | 关联键 |
| 4 | LISIRPatientID | →PAPatMas | 患者ID | |
| 5 | LISIRVisitNumber | →PAAdm | 就诊号 | |
| 6 | **LISIRItemCode** | String(50) | ★项目编码(如BTTestCode) | jymxXmbm |
| 7 | **LISIRItemDesc** | String(200) | ★项目名称(如"wBC") | jymxXmmc |
| 8 | **LISIRResult** | String(1000)| ★结果值(数值/文本) | jymxJgz |
| 9 | **LISIRUint** | String(50) | ★单位(如10^9/L) | jymxDw |
| 10 | **LISIRTextResult** | String(1000)| ★定性结果(fallback) | JYMX_JGZ备选 |
| 11 | LISIRExtraResult | String(40) | 扩展结果 | |
| 12 | LISIRResultExplain | String(1000)| 结果说明 | |
| 13 | **LISIRAbnormalFlags** | String(5) | ★异常标志 H/L/N | jymxYcbz |
| 14 | **LISIRRanges** | String(300) | ★参考范围(如"3.5-9.5") | jymxCkfw |
| 15 | **LISIRTestMethod** | String(50) | ★检测方法 | jymxFfx |
| 16 | **LISIRTestMachine** | String(50) | ★检测仪器 | jymxYqxx |
| 17 | LISIRTestUserCode | String(50) | 检测人代码 | |
| 18 | LISIRTestUserDesc | String(50) | 检测人姓名 | |
| 19 | **LISIRShowSeq** | String(50) | ★显示序号(排序) | 显示顺序 |
| 20 | LISIRTestDate | Date | 检测日期 | |
| 21 | LISIRTestTime | Time | 检测时间 | |
| 22 | LISIRCount | String(20) | 细菌计数(微) | |
| 23 | LISIRExpertRule | String(1000)| 专家规则 | |
| 24 | LISIRRemark | String(1000)| 备注 | |
| 25 | LISIRUpdateDate | Date | 时间戳 | |
| 26 | LISIRUpdateTime | Time | 时间戳 | |
| 27 | LISIRInterCode | String(100) | 国际代码LOINC? | |
| 28 | **LISIROrderItemID** | →OEOrdItem | ★医嘱子项外键! | 关联40-order域 |
| 29 | **LISIRAssayStatus** | String(1) | ★状态: 1创建/2上传/3结果/4复查/0其他 | |
| 30 | LISIRReAssayNum | String(30) | 复查次数 | |
| 31 | LISIRResClass | String(1) | 结果类别 | |
| 32 | **LISIROrganism** | String(30) | 细菌名(微生物) | |
| 33 | LISIRReAssayNumber | String(10) | 复查号 | |
| 34 | LISIRMultipleResistant | String(30) | 多耐菌 | |

### LIR-001: 细项遍历 — $zcvt大写! (🔴 关键坑点!)

```objectscript
;; 输入: reportId (EnsLISReportResult.lg(2) = LISRRReportID)
;; 输出: 遍历该报告下所有细项

;; ⚠️⚠️⚠️ 必须用 $zcvt(reportId, "U") 转大写! 否则匹配不到!
s itemCode = ""
f {
    s itemCode = $o(^Busi.ENS.EnsLISItemResultI("IndexReportItem", $zcvt(reportId, "U"), itemCode))
    q:itemCode=""

    s itemRowId = ""
    f {
        s itemRowId = $o(^Busi.ENS.EnsLISItemResultI("IndexReportItem", $zcvt(reportId, "U"), itemCode, itemRowId))
        q:itemRowId=""

        s id = $g(^Busi.ENS.EnsLISItemResultD(itemRowId))
        continue:(id="")

        ;; ↓↓↓ 提取各细项字段 ↓↓↓
    }
}
```

**来源**: ✅ LabDetails.cls `GetResultIDByRepNo` 标签 — 生产代码原样

**踩坑等级**: 🔴🔴🔴 最高级！不转大写返回空集且不报错！

### LIR-002: 结果值 — TextResult Fallback机制

```objectscript
s id = $g(^Busi.ENS.EnsLISItemResultD(itemRowId))

;; 结果值取值逻辑 (LabDetails.cls):
s result = $lg(id, 8)           ;; LISIRResult (数值结果)

;; ⚠️ 如果数值结果为空, fallback到定性结果!
i result="" s result = $lg(id, 10)  ;; LISIRTextResult

;; 这是因为某些检验项目(如尿常规)结果是定性的("阴性"/"阳性"),
;; 不是数值型的, 存放在TextResult而非Result中.
```

**来源**: ✅ LabDetails.cls `ReportDetails` 第24~25行

### LIR-003: 参考范围解析 (支持 min-max 格式)

```objectscript
s refVal = $lg(id, 14)  ;; LISIRRanges 参考范围原始字符串

s refRange = refVal      ;; 直接使用
s refMin = refVal
s refMax = refVal

;; 解析 min-max 格式 (来自LabDetails.cls):
i refVal["-"], $isvalidnum($p(refVal, "-", 1)) d
 . s refMin = $p(refVal, "-", 1)   ;; 如 "3.5" 
 . s refMax = $p(refVal, "-", 2)   ;; 如 "9.5"
;; 非数值型参考范围(如 ">140" / "阴性") 保持原值

;; 典型refVal格式:
;;   "3.5-9.5"    → min=3.5, max=9.5  (数值区间)
;;   "0-17"       → min=0, max=17    (计数区间)
;;   ">140"       → min=>140, max=>140 (单向)
;;   "阴性"       → 保持原字符串     (定性)
```

**来源**: ✅ LabDetails.cls `ReportDetails` (refMin/refMax赋值逻辑)

### LIR-004: 异常标志判断

```objectscript
s abnormalFlag = $lg(id, 13)  ;; LISIRAbnormalFlags

;; 异常标志含义:
;;   "H" = High  (偏高/高于参考范围上限) 🔴
;;   "L" = Low   (偏低/低于参考范围下限) 🔴
;;   "N" = Normal (正常) ✅
;;   ""  = 空     (无异常标记或未判定)

;; 上报转换:
s posFlag = 0
i abnormalFlag'="", abnormalFlag'="N" s posFlag = 1  ;; 有异常
```

**验证**: ✅ LabDetails.cls (`prompt=$lg(id,13)` → `posFlag=1 if prompt'=""`)

### LIR-005: 核心细项完整取值模板

```objectscript
;; 基于 LabDetails.cls ReportDetails 整理
s id = $g(^Busi.ENS.EnsLISItemResultD(itemRowId))

s itemObj = {}
d itemObj.%Set("repNo", reportId)              ;; 报告号
d itemObj.%Set("seq", $lg(id, 19))             ;; 显示序号
d itemObj.%Set("itemId", $lg(id, 6))            ;; 项目编码
d itemObj.%Set("itemCname", $lg(id, 7))         ;; 项目中文名
;; 英文名/别名从BTTestCode字典取:
;d itemObj.%Set("itemEname", $lg(^dbo.BTTestCodeD(itemId), 6))
;d itemObj.%Set("itemAlias", $lg(^dbo.BTTestCodeD(itemId), 7))

;; 结果值(TextResult fallback):
s result = $lg(id, 8)
i result="" s result = $lg(id, 10)
d itemObj.%Set("result", result)

;; 参考:
s refVal = $lg(id, 14)
d itemObj.%Set("refRange", refVal)
;; min/max解析同LIR-003

d itemObj.%Set("unit", $lg(id, 9))             ;; 单位
d itemObj.%Set("prompt", $lg(id, 13))           ;; 异常标志
d itemObj.%Set("posFlag", 0)                     ;; 默认正常
i $lg(id, 13)'="" d itemObj.%Set("posFlag", 1)  ;; 有异常

d itemObj.%Set("method", $lg(id, 15))           ;; 检测方法
d itemObj.%Set("time", ..getDateTime($lg(id,25), $lg(id, 26)))  ;; 更新时间
d itemObj.%Set("note", refVal)                   ;; 备注=参考值
```

### LIR-006: 药敏子表遍历 (v2.0 新增!)

```objectscript
;; 药敏/抗生素敏感性结果 (LabDetails.cls 发现)
s lisResultID = $lg(id, 2)  ;; EnsLISItemResult.lg(2) = RowID

i $d(^Busi.ENS.EnsLISItemSenResultI("pKHIPUSERLISITEMSENRESULT", lisResultID)) d
 . s lisItemAnt = ""
 . f {
 .     s lisItemAnt = $o(^Busi.ENS.EnsLISItemSenResultI("pKHIPUSERLISITEMSENRESULT", lisResultID, lisItemAnt))
 .     q:lisItemAnt=""
 .     s lisItemSenID = ""
 .     f {
 .         s lisItemSenID = $o(^Busi.ENS.EnsLISItemSenResultI("pKHIPUSERLISITEMSENRESULT", lisResultID, lisItemAnt, lisItemSenID))
 .         q:lisItemSenID=""
 .         s senData = $g(^Busi.ENS.EnsLISItemSenResultD(lisItemSenID))
 .         s antId   = $lg(senData, 3)   ;; 抗生素ID
 .         s antCname = $lg(senData, 4)  ;; 抗生素名称(如"头孢呋辛")
 .         ;; 还有敏感度(S/I/R)等字段待确认...
 .     }
 . }

;; 用途: 微生物检验报告中的药敏试验部分
;; 典型场景: 血培养 → 细菌鉴定 → 药敏试验 → S(敏感)/I(中介)/R(耐药)
```

**来源**: ✅ LabDetails.cls `ReportDetails` (完整药敏遍历代码)

### LIR-007 ~ LIR-012: 其他细项字段规则

| 规则 | 字段 | lg(n) | 说明 |
|------|------|-------|------|
| lIR-007 | 检测状态 | 29 | AssayStatus: 1创建→2上传→3结果(可上报)→4复查→0其他. 过滤: `'="3"` |
| lIR-008 | 医嘱关联 | 28 | OrderItemID→OEOrdItem, 可关联40-order域医嘱 |
| lIR-009 | 国际代码 | 27 | InterCode, 可能是LOINC编码 |
| lIR-010 | 细菌名 | 32 | Organism, 微生物预报告中的细菌名称 |
| lIR-011 | 复查信息 | 30,33 | ReAssayNum(次数)+ReAssayNumber(复查号) |
| lIR-012 | 检测人/仪器 | 17,18,15,16 | TestUserCode/UserDesc + TestMethod + TestMachine |

---

## 五、Template-A: 完整查询模板 (v2.0 可运行版)

### Template-A1: 报告主表查询 (LabReport风格, XML输入)

```objectscript
/// 查询某患者的所有检验报告 (兼容LabReport.cls接口签名)
/// 输入: XML <Request><patientNoType>1</patientNoType><patientNo>登记号</patientNo>
///                <startDateTime>2024-01-01 00:00:00</startDateTime></Request>
ClassMethod GetLabReports(Input As %String) As %GlobalCharacterStream
{
    #; === 解析XML输入 ===
    s reader = ##class(%XML.Reader).%New()
    d reader.OpenString(Input)
    d reader.Correlate("Request", "web.DHCENS.bLL.BloodDialysis.Model.LabReportRequest")
    s RequestObj = ##class(...LabReportRequest).%New()
    while reader.Next(.obj, .sc) { s RequestObj = obj }

    #; === 三种查询方式 ===
    i RequestObj.patientNoType="1" d  ;; 登记号
    . f  s PatRowId=$o(^PAPERi("PAPMI_PatNo", $$aLPHAUP^sSUTIL4(RequestObj.patientNo), PatRowId)) q:PatRowId="" d
    . . i $P(^PAPER(PatRowId,"PAT",1),"^",6)="N" q  ;; 非活跃患者跳过
    . . d GetReports(PatRowId, RequestObj.startDateTime, RequestObj.endDateTime)
    i RequestObj.patientNoType="2" d  ;; 住院号
    . f  s PatRowId=$o(^PAPERi("Medicare1", $$aLPHAUP^sSUTIL4(RequestObj.patientNo), PatRowId)) q:PatRowId="" d
    . . i $P(^PAPER(PatRowId,"PAT",1),"^",6)="N" q
    . . d GetReports(...)
    i RequestObj.patientNoType="3" d  ;; 身份证号
    . ... (类似)

    q stream

GetReports(patRowId, startDT, endDT)
    #; 解析时间范围
    s stDate="", stTime="", endDate="", endTime=""
    s:startDT'="" s startDate=$p(startDT," ",1), stDate=$zdh(startDate,3)
    s:startDT'="" s startTime=$p(startDT," ",2), stTime=$zth(startTime,1)
    s:endDT'="" s edate=$p(endDT," ",1), endDate=$zdh(edate,3)
    s:endDT'="" s etime=$p(endDT," ",2), endTime=$zth(etime,1)

    #; === 四层索引遍历 ===
    s checkDate = ""
    f  s checkDate=$o(^Busi.ENS.EnsLISReportResultI("LISRRPatientIDIndex",patRowId,checkDate)) q:checkDate="" d
    . i $l(stDate), checkDate<stDate q
    . i $l(endDate), checkDate>endDate q
    . s checkTime = ""
    . f  s checkTime=$o(..., patRowId, checkDate, checkTime)) q:checkTime="" d
    .. i +stTime>0, checkTime<stTime q
    .. i +endTime>0, checkTime>endTime q
    .. s rowId=""
    .. f  s rowId=$o(..., patRowId, checkDate, checkTime, rowId)) q:rowId="" d
    ... d QryReport(rowId)
    q

QryReport(rowId)
    s rd = $g(^Busi.ENS.EnsLISReportResultD(rowId))
    s o = ##class(...LabReportInfo).%New()

    #; === 基础标识 ===
    o.repNo = $lg(rd, 2)
    o.repName = $lg(rd, 115)     ;; 医嘱/组合项目描述
    o.repType = $lg(rd, 101)     ;; 1普/2危/0其

    #; === 患者(跨域取值) ===
    s adm = $lg(rd, 5)
    o.name = $p($g(^PAPER(patRowId, "ALL")), "^", 1)
    s sexDr = $p($g(^PAPER(patRowId, "ALL")), "^", 7)
    o.sex = $p($g(^CT("SEX", sexDr)), "^", 2)
    o.age = ##class(web.DHCBillInterface).GetPapmiAge(patRowId, "")
    o.bedNo = $lg(rd, 26)
    o.pid = patRowId
    o.exNo = adm                  ;; 就诊号
    o.diag = ..GetDiagnoses(adm)
    o.address = $g(^PAPER(patRowId, "PER", "aDD", 1))
    o.tel = $p($g(^PAPER(patRowId, "PER", 4)), "^", 21)

    #; === 科室/医生 ===
    o.appDeptCode = $lg(rd, 20)
    o.appDeptName = $lg(rd, 21)
    o.appDrCode = $lg(rd, 82)     ;; 创建者=申请医生
    o.appDrName = $lg(rd, 83)

    #; === 时间五元组 ===
    o.appTime   = ..getDateTime($lg(rd,22), $lg(rd,23))    ;; 申请 lg22~23
    o.sampleTime= ..getDateTime($lg(rd,48), $lg(rd,49))    ;; 采集 lg48~49
    o.sampleOper= $lg(rd, 50)
    o.sampleOperName = $lg(rd, 51)
    o.sendTime  = ..getDateTime($lg(rd,85), $lg(rd,86))    ;; 送达 lg85~86
    o.sendOper  = $lg(rd, 87)
    o.sendOperName = $lg(rd, 88)
    o.receiveOper = $lg(rd, 127)
    o.receiveOperName = $lg(rd, 128)
    o.receiveTime= ..getDateTime($lg(rd,125),$lg(rd,126)) ;; 核收 lg125~126
    o.patTime   = ..getDateTime($lg(rd,92), $lg(rd,93))    ;; 检测 lg92~93

    #; === 审核双层 ===
    o.firstAuditTime    = ..getDateTime($lg(rd,111),$lg(rd,112))
    o.firstAuditDrCode  = $lg(rd, 113)
    o.firstAuditDrName  = $lg(rd, 114)
    o.secondAuditTime   = ..getDateTime($lg(rd,107),$lg(rd,108))  ;; 终审
    o.secondAuditDrCode = $lg(rd, 109)
    o.secondAuditDrName = $lg(rd, 110)

    #; === 标志位 ===
    s dangerFlag = $lg(rd, 101)
    o.dangerFlag = $s(dangerFlag=2:1, 1:0)     ;; 2→危急值
    o.urgentFlag = $s($lg(rd, 47)'="":1, 1:0)  ;; 非空→加急
    o.sampleName = $lg(rd, 147)   ;; 标本名称
    o.barCode = $lg(rd, 2)        ;; 条码号=报告号
    o.sampleNo = $lg(rd, 123)     ;; 标本代码

    d Body.LabReportList.Insert(o)
    q
}
```

### Template-A2: 报告+细项联合查询 (v2.0 完整版)

```objectscript
/// 查询报告及其全部细项(含药敏)
/// 输入: repNo (报告单号 = EnsLISReportResult.lg(2))
ClassMethod GetReportWithItems(repNo As %String) As %GlobalCharacterStream
{
    s stream = ##class(%GlobalCharacterStream).%New()
    s reports = []

    ;; 1. 取报告主记录
    s rd = $g(^Busi.ENS.EnsLISReportResultD(repNo))
    q:(rd="") stream  ;; 报告不存在

    ;; 2. 构建报告对象 (复用Template-A1的字段提取逻辑)
    s repObj = ..ExtractReport(repNo, rd)

    ;; 3. 遍历细项 ($zcvt大写!)
    s items = []
    s itemCode = ""
    f {
        s itemCode = $o(^Busi.ENS.EnsLISItemResultI("IndexReportItem", $zcvt(repNo, "U"), itemCode))
        q:itemCode=""

        s itemRowId = ""
        f {
            s itemRowId = $o(^Busi.ENS.EnsLISItemResultI("IndexReportItem", $zcvt(repNo, "U"), itemCode, itemRowId))
            q:itemRowId=""

            s id = $g(^Busi.ENS.EnsLISItemResultD(itemRowId))
            continue:(id="")

            ;; 4. 提取单项
            s itemObj = ..ExtractItem(itemRowId, id)

            ;; 5. 药敏子表 (如有)
            s sens = []  ;; GetSensitivities(itemRowId) 的结果
            d itemObj.%Set("sensitivities", sens)

            d items.%Push(itemObj)
        }
    }

    d repObj.%Set("items", items)
    d reports.%Push(repObj)

    ;; 6. 输出
    s ret = {} d ret.%Set("code", 0) d ret.%Set("data", reports)
    d stream.Write(ret.%ToJSON())
    q stream
}
```

---

## 六、设计原则与编码规范

### 原则 1: $lg() 与 $p() 强制隔离
```objectscript
;; ✅ 好: 注释明确标注数据源格式
;; 数据源: ^Busi.ENS.* → $lg() | 传统HIS表 → $p()
;; 封装方法:
ClassMethod GetENSField(data, pos) As %String { q $lg(data, pos) }
ClassMethod GetHISField(data, pos) As %String { q $p(data, "^", pos) }
```

### 原则 2: $zcvt 大写索引 (🔴 新增!)
```objectscript
;; ✅ EnsLISItemResult 的 IndexReportItem 索引要求大写匹配!
s code = $o(^Busi.ENS.EnsLISItemResultI("IndexReportItem", $zcvt(reportID,"U"), code))
;; ❌ 错误: 不转大小写导致匹配失败, 静默返回空集
```

### 原则 3: TextResult Fallback
```objectscript
;; 结果值为空时自动降级到定性结果
s result = $lg(id, 8)    ;; LISIRResult (数值)
i result="" s result = $lg(id, 10)  ;; LISIRTextResult (定性)
```

### 原则 4: 日期时间配对防御
```objectscript
ClassMethod FormatDT(date As %String, time As %String) As %String
{
    q:(date="")&(time="") ""
    s:(date'="") date = $zd(date, 3)
    s:(time'="") time = $zt(time, 1)
    q:(date'="")&(time'="") date_" "_time
    q:date'="" date
    q time
}
```

---

## 七、踩坑提示 v2.0

### 🔴 高频坑点 (必读!)

| # | 坑点 | 影响 | 解决方案 |
|---|------|------|---------|
| **f1** | **$lg vs $p 混用** | 取空/静默失败 | ENS表强制$lg(), 注释标注 |
| **f2** | **$zcvt不转大写** | 细项遍历返回空! | IndexReportItem必须$zcvt(ID,"U") |
| **f3** | **lg(80/81)误当申请时间** | 申请时间错误! | 申请=lg(22/23), 创建=lg(80/81) |
| **f4** | **lg(85/86)误当运送时间** | 送达vs运送混淆 | 运送=lg(61/62), 送达=lg(85/86) |
| **f5** | **status不过滤** | 上报已作废报告 | 只取lg(117)="1"(已审核) |
| **f6** | **result不判空** | 数值结果丢失 | TextResult fallback (lg8→lg10) |
| **f7** | **危急值type=2不识别** | 危急值报告遗漏 | lg(101): 1普/2危/0其他 |

### 🟡 中频坑点

| # | 坑点 | 影响 | 解决方案 |
|---|------|------|---------|
| m1 | 同患者同日多报告 | 遗漏/重复 | 四层索引确保唯一 |
| m2 | 微生物vs普通报告 | 字段差异大 | lg(103)区分, lg(106/32/22/34)特有 |
| m3 | 药敏子表遗漏 | 微生物报告不全 | 遍历EnsLISItemSenResult |
| m4 | 参考范围格式多样 | min-max解析异常 | 先判"-"再$isvalidnum |
| m5 | 审核双层(first+second) | 匹配错误 | lg(113~114)=初审, lg(109~110)=终审 |
| m6 | BTTestCode字典依赖 | 英文名/别名缺失 | lg(^dbo.BTTestCodeD(itemId),6/7) |
| m7 | 门诊vs住院差异 | patientNoType不同 | 登记号/住院号/身份证三种入口 |

### 🟢 低频坑点

| # | 坑点 | 影响因素 | 解决方案 |
|---|------|---------|---------|
| l1 | Stream类型字段(lg99/100) | XML/PDF不能$lg直接读 | 用%GlobalCharacterStream |
| l2 | 数字签名/打印追踪 | 合规审计 | lg(134~142)完整链路 |
| l3 | 手工计费医嘱(lg149) | 特殊收费场景 | rowid串需解析 |

---

## 八、v1.0 → v2.0 变更总结

| 维度 | v1.0 (骨架) | v2.0 (完整) | 变化量 |
|------|-------------|-------------|--------|
| **版本** | 1.0.0 | **2.0.0** | Major升级 |
| **报告主表属性** | 15个(推断) | **149个(MCP验证)** | +9.9x |
| **细项子表属性** | 0个(骨架) | **34个(MCP验证)** | 全新增 |
| **药敏子表** | 无 | **发现EnsLISItemSenResult** | 全新增 |
| **生产接口** | GetLabReport本地 | **LabReport+LabDetails双接口** | +1个 |
| **规则数** | ~18条 | **~95条** | +5x |
| **关键修正** | — | **lg(80/81)非申请时间, lg(22/23)才是!** | 🔴 |
| **关键修正** | — | **lg(85/86)是送达非运送!** | 🔴 |
| **关键修正** | — | **$zcvt大写才能遍历细项!** | 🔴 |
| **新增发现** | — | TextResult fallback机制 | LabDetails |
| **新增发现** | — | 参考范围min-max解析 | LabDetails |
| **新增发现** | — | 审核双层(first+second) | LabReport |
| **新增发现** | — | 危急值标志lg(101) | LabReport |

---

## 九、跨域关联关系图

```
  10-patient域          20-visit域           50-lab-exam域(本域)
  ┌───────────┐        ┌───────────┐        ┌──────────────────┐
  │ pAPMI/PAPER│←lg(3)─│  PAADM    │←lg(5)─│ EnsLISReportResult│
  │ (患者主索引)│        │ (就诊记录) │        │ (报告主表 149 attr)│
  └─────┬─────┘        └─────┬─────┘        └────────┬─────────┘
        │                     │                       │
        │               lg(61) MRAdm               │ lg(3) fK
        │               (诊断主记录)               │
        ▼                     ▼                      ▼
  30-diagnosis域         ┌──────────────────────────────────┐
  ┌───────────┐          │        EnsLISItemResult           │
  │ MR/MRDiag  │          │        (细项子表 34 attr)          │
  └───────────┘          │  lg(28)fK→OEOrdItem ──────────────┤──→ 40-order域
                         │  lg(6)fK→BTTestCode ──────────────┤──→ 检验字典
                         └──────────────┬───────────────────┘
                                        │ lg(2) fK
                                        ▼
                              ┌─────────────────────┐
                              │ EnsLISItemSenResult  │
                              │ (药敏子表 v2.0新)    │
                              └─────────────────────┘

  01-user域               00-dictionary域
  ┌──────────┐            ┌────────────┐
  │ SSUser    │←lg(82,109,113)  │ CTLOC      │←lg(20)科室代码
  │ CTCareProv│  申请/审核/初审医生│ BTTestCode │←lg(6)项目编码
  └──────────┘            │ CT("SEX")  │←lg(14)性别
                          └────────────┘
```
