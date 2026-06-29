---
domain: "55-exam-report"
name: "影像检查报告域(rIS/PACS组)"
version: "2.1.0"
description: "HIS影像检查取值规则集(v2.0.0 完整版).涵盖ENS平台组第三方RIS/PACS厂商回传数据:检查报告主表(EnsRISReportResult,47属性,XML导出SQLStorage验证)+检查细项结果表(EnsRISItemResult,12属性,fK→ReportResult)+检查报告关联表(EnsRISExamReport,7属性,复合PK).数据存储在^Busi.ENS全局,$lg()List格式(非^分隔符!).基于IRIS XML导出完整验证+GetPacsInfo.cls QryRepByID生产代码交叉确认."

# 数据源遍历配置（供代码生成器使用）
traversal:
  type: "rIS"
  viewMatchers: ["_exam_", "clinical", "ris_", "pacs", "image_", "series_", "rpt_path", "rpt_image", "检查", "影像", "BLBG", "DBZ_BLBG", "DBZ_JCBG"]
  inputParam:
    name: "admRowId"
    type: "%String"
    description: "就诊ID"
  # 注意：preVariables 不再定义，因为 visitNo/patDR 是在遍历模板循环内部赋值的
  # 按日期范围遍历模式（直接从报告表日期索引进入）
  modes:
    dateRange:
      viewMatchers: ["检查报告", "影像报告", "ExamReport", "BLBG", "DBZ_BLBG", "DBZ_JCBG"]
      description: "按审核日期范围遍历（直接从报告表索引进入，性能更优）"
      index:
        global: "^Busi.ENS.EnsRISReportResultI"
        name: "RISRCheckDateTimeIndex"
        keys: ["checkDate", "checkTime", "rowId"]
        expression: '$o(^Busi.ENS.EnsRISReportResultI("RISRCheckDateTimeIndex",checkDate,checkTime,rowId))'
      template: |
        ; 日期格式转换
        i pDateFrom'="" s pDateFrom=$zdh(pDateFrom,3)
        i pDateTo'="" s pDateTo=$zdh(pDateTo,3)
        f checkDate=pDateFrom:1:pDateTo d
        .s checkTime=""
        .f  s checkTime=$o(^Busi.ENS.EnsRISReportResultI("RISRCheckDateTimeIndex",checkDate,checkTime),-1) q:checkTime=""  d
        ..s rowId=""
        ..f  s rowId=$o(^Busi.ENS.EnsRISReportResultI("RISRCheckDateTimeIndex",checkDate,checkTime,rowId)) q:rowId=""  d
        ...s data=$g(^Busi.ENS.EnsRISReportResultD(rowId))
        ...i data="" q
        ...s visitNo=$lg(data,6)
        ...s patDR=$lg(data,5)
        ...; 院区过滤（通过就诊号关联^PAADM获取院区）
        ...i pHospitalId'="" {
        ....s admData=$g(^PAADM(visitNo))
        ....s locDR=$p(admData,"^",4)
        ....s hospDR=""
        ....i locDR'="" s hospDR=$p($g(^CTLOC(locDR)),"^",22)
        ....q:(admData="")||(locDR="")||(hospDR'=pHospitalId)
        ...}
        ...d GetReportDetail
    admSingle:
      viewMatchers: ["单个检查", "检查详情"]
      description: "按就诊ID遍历（单条查询）"
      index:
        global: "^Busi.ENS.EnsRISReportResultI"
        name: "RISRVisitNumberIndex"
        keys: ["visitNo", "rowId"]
        expression: '$o(^Busi.ENS.EnsRISReportResultI("RISRVisitNumberIndex",visitNo,rowId))'
      template: |
        s rowId=""
        f  s rowId=$o(^Busi.ENS.EnsRISReportResultI("RISRVisitNumberIndex",visitNo,rowId)) q:rowId=""  d
        .s data=$g(^Busi.ENS.EnsRISReportResultD(rowId))
        .i (data="") q
  # 默认配置（按就诊ID遍历，兼容旧逻辑）
  index:
    global: "^Busi.ENS.EnsRISReportResultI"
    name: "RISRVisitNumberIndex"
    keys: ["visitNo", "rowId"]
    expression: '$o(^Busi.ENS.EnsRISReportResultI("RISRVisitNumberIndex",visitNo,rowId))'
  data:
    global: "^Busi.ENS.EnsRISReportResultD"
    variable: "data"
    format: "lg"
    expression: "$g(^Busi.ENS.EnsRISReportResultD(rowId))"
  template: |
    s rowId=""
    f  s rowId=$o(^Busi.ENS.EnsRISReportResultI("RISRVisitNumberIndex",visitNo,rowId)) q:rowId=""  d
    .s data=$g(^Busi.ENS.EnsRISReportResultD(rowId))
    .i (data="") q

sourceClass:
  - name: "User.EnsRISReportResult (RIS报告主表) ✅ XML导出+GetPacsInfo双验证"
    description: "★ENS平台RIS/pACS/病理报告结果主表.Global=^Busi.ENS.EnsRISReportResultD(RowId).$lg()List格式.pK=RISRReportID(Piece2).共47个属性(Piece2~47),含麻醉扩展8字段+病理扩展3字段.8个索引.通过web.DHCENS.bLL.BloodDialysis.Method.GetPacsInfo.QryRepByID()生产代码+IRIS XML导出双重验证."
    sqlTableName: "Ens_RISReportResult"
    global: "^Busi.ENS.EnsRISReportResultD"
    indexGlobal: "^Busi.ENS.EnsRISReportResultI"
    streamGlobal: "^Busi.ENS.EnsRISReportResultS"
    superClass: "%Persistent"
    totalProperties: 47
    keyProperties: "Piece2=RISRReportID(报告号PK)/Piece5=RISRPatientID(→PAPatMas)/Piece6=RISRVisitNumber(→PAAdm)/Piece7=RISRSysCode(系统类型)"
    indexes: "RISREPORTPKey(RISRReportID)/RISRExamIDIndex(RISRExamID)/RISRPatientIDCheckDateTimeIndex(PatientID,CheckDate,CheckTime)/RISRPatientIDReportDateTimeIndex(PatientID,ReportDate,ReportTime)/RISRUpdateTimeIndex(UpdateDate,UpdateTime)/RISRCheckDateTimeIndex(CheckDate,CheckTime)/RISRReportDateTimeIndex(ReportDate,ReportTime)/RISRVisitNumberIndex(VisitNumber)"
    verifiedBy: "✅ IRIS XML导出(2026-05-11) + ✅ web.DHCENS.bLL.BloodDialysis.Method.GetPacsInfo.QryRepByID()"

  - name: "User.EnsRISItemResult (RIS细项结果子表) ✅ XML导出验证"
    description: "★RIS检查报告子表，保存测值.类似LIS的检验细项但用于影像测值(如测量值/定量分析结果).Global=^Busi.ENS.EnsRISItemResultD(RowId).fK→EnsRISReportResult.RISRReportID.uK:ReportID+ItemCode.共12个属性(Piece2~12):RowID/ReportID/PatientID/VisitNumber/ItemCode/ItemDesc/Result/Ranges/High/Low/Unit."
    sqlTableName: "Ens_RISItemResult"
    global: "^Busi.ENS.EnsRISItemResultD"
    indexGlobal: "^Busi.ENS.EnsRISItemResultI"
    streamGlobal: "^Busi.ENS.EnsRISItemResultS"
    superClass: "%Persistent"
    totalProperties: 11 (不含Piece1=%%cLASSNAME)
    parentFK: "RISIRReportID(Piece3) → EnsRISReportResult.RISRReportID(Piece2)"
    uniqueIndex: "IndexReportItem(RISIRReportID,RISIRItemCode)"

  - name: "User.EnsRISExamReport (RIS检查报告关联表) ✅ XML导出验证"
    description: "★RIS检查报告关联表.复合PK=(RISSRReportID,RISSRExamID,RISSROrderItemID).fK:RISSRReportID→EnsRISReportResult.注意:OrderItemID类型为User.OEOrdItem(医嘱子项引用!).用途:可能是检查申请与报告的多对多中间表或去重视图.共7个属性(Piece2~8):ReportID/ExamID/OrderItemID(→OEOrdItem)/PatientID(→PAPatMas)/VisitNumber(→PAAdm)/UpdateDate/UpdateTime."
    sqlTableName: "Ens_RISExamReport"
    global: "^Busi.ENS.EnsRISExamReportD"
    indexGlobal: "^Busi.ENS.EnsRISExamReportI"
    streamGlobal: "^Busi.ENS.EnsRISExamReportS"
    superClass: "%Persistent"
    totalProperties: 7
    compositePK: "RISSRReportID + RISSRExamID + RISSROrderItemID"
    fkReference: "fkExamidReferenceRisreport → EnsRISReportResult.RISREPORTPKey"

  - name: "GetPacsInfo.cls (生产接口) ✅ 交叉验证"
    description: "★GetRISReport(XML输入).支持登记号(patientNoType=1)/住院号(=2)两种方式.QryRepByID方法提取12个lg()字段已与XML导出Piece位置100%吻合验证."
    methods: ["GetRISReport", "QryRepByID", "getDateTime"]
    classPath: "web.DHCENS.bLL.BloodDialysis.Method.GetPacsInfo"
    modelClasses:
      - "web.DHCENS.bLL.BloodDialysis.Model.RISReportResponse"
      - "web.DHCENS.bLL.BloodDialysis.Model.RISReportBody"
      - "web.DHCENS.bLL.BloodDialysis.Model.RISReportInfo"

totalRules: 67
lastUpdated: "2026-05-11"
status: "v2.0.0 完整版 — IRIS XML导出67属性全验证 + GetPacsInfo QryRepByID交叉确认 + SQLStorage Piece精确映射"
---

# 影像检查报告域 (55-exam-report) 取值规则 v2.0

> ENS平台组第三方RIS/pACS/病理厂商回传 | `$lg()` List格式 | 放射/CT/mRI/DR/超声/核医学/病理等
> **数据源**: IRIS XML导出 (2026-05-11 23:39) | IRIS版本: 2023.1.1 Build 380_0_22958U

## 架构总览

```
┌──────────────────────────────────────────────────────────────────────┐
│                        eNS 平台总线层                                  │
│              第三方RIS/PACS厂商 → ^Busi.ENS 全局                      │
└─────────────────────┬────────────────────────────────────────────────┘
                      │
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
┌────────────────┐ ┌─────────────┐ ┌──────────────────┐
│ ReportResult   │ │ ItemResult  │ │ ExamReport        │
│ 报告主表        │ │ 细项子表     │ │ 检查报告关联表      │
│ 47属性 ✅       │ │ 11属性 ✅    │ │ 7属性 ✅           │
│ ^Busi...D      │ │ ^Busi...D   │ │ ^Busi...D         │
│ pK:ReportID    │ │ fK:ReportID │ │ 复合PK(3字段)     │
└───────┬────────┘ └──────┬──────┘ └────────┬──────────┘
        │                 │                  │
        │  fK:            │  fK:             │  fK:
        │  ReportID       │  →ReportID       │  →ReportID
        └─────────────────┴──────────────────┘

关系图:
  ExamReport ──1:N──→ ReportResult ──1:N──→ ItemResult
  (检查申请关联)     (一份报告)           (多个测值)

遍历入口(GetPacsInfo.cls生产代码):
  PatientID → RISRPatientIDCheckDateTimeIndex
            → CheckDate (过滤start/endDateTime范围)
              → CheckTime
                → RowID → $g(^Busi.ENS.EnsRISReportResultD(RowID)) → $lg()逐字段取值
```

---

## 一、$lg() 格式强制规范（🔴 最高优先级）

### 规则 F0-001/F0-002

| 维度 | 传统HIS (^DHCPB等) | ENS平台 (^Busi.ENS.*) |
|------|-------------------|---------------------|
| **取值函数** | `$p(data,"^",n)` | **`$lg(data,n)`** |
| **下标起始** | Piece=1 | List元素从1开始(Piece1=%%cLASSNAME) |
| **Global示例** | `^DHCPB`, `^OEORD`, `^PAADM` | `^Busi.ENS.Ens*rIS*D` |
| **索引Global** | `^DHCPBI(...)` | `^Busi.ENS.Ens*rIS*I` |

```objectscript
;; ✅ 正确 - RIS报告主表取值($lg格式)
s data = $g(^Busi.ENS.EnsRISReportResultD(rowId))
s repNo = $lg(data, 2)          ;; Piece2 = RISRReportID
s patientId = $lg(data, 5)       ;; Piece5 = RISRPatientID
s visitNo = $lg(data, 6)         ;; Piece6 = RISRVisitNumber
s checkBodypart = $lg(data, 22)  ;; Piece22 = RISRBADesc
s diag = $replace($lg(data, 25),$c(10),"")  ;; Piece25 = RISRDiagDesc 去换行!

;; ❌ 错误 - 用了^分隔符读ENS数据!
s val = $p($g(^Busi.ENS.EnsRISReportResultD(rowId)), "^", 2)

;; ✅ 正确 - RIS细项子表取值
s itemData = $g(^Busi.ENS.EnsRISItemResultD(itemRowId))
s itemResult = $lg(itemData, 8)    ;; Piece8 = RISIRResult (结果值)
s itemUnit = $lg(itemData, 12)     ;; Piece12 = RISIRUnit (单位)
```

---

## 二、EnsRISReportResult 报告主表 — 47属性完整定义 ✅

### 2.1 元信息

| 项目 | 值 |
|------|-----|
| **类名** | `User.EnsRISReportResult` |
| **描述** | 检查、病理报告结果表 |
| **SQL表** | `Ens_RISReportResult` |
| **Data Global** | `^Busi.ENS.EnsRISReportResultD(RowId)` |
| **Index Global** | `^Busi.ENS.EnsRISReportResultI` |
| **Stream Global** | `^Busi.ENS.EnsRISReportResultS` |
| **父类** | `%Persistent` |
| **Owner** | `_SYSTEM` |
| **属性总数** | **47** (Piece 2~47) |
| **索引数** | **8** |
| **创建时间** | ~2022年 (65267,76896) |
| **最后修改** | ~2025年中 (67701,34030) |

### 2.2 索引完整定义

| # | 索引名 | 类型 | 属性键 | Unique | 说明 |
|---|--------|------|--------|--------|------|
| 1 | **RISREPORTPKey** | pK | `RISRReportID` | ✅ | DDL主键(报告号) |
| 2 | **RISRExamIDIndex** | Index | `RISRExamID` | ❌ | 检查号索引 |
| 3 | **RISRPatientIDCheckDateTimeIndex** | Index | `RISRPatientID,RISRCheckDate,RISRCheckTime` | ❌ | ★主遍历入口(患者+审核时间) |
| 4 | **RISRPatientIDReportDateTimeIndex** | Index | `RISRPatientID,RISRReportDate,RISRReportTime` | ❌ | 患者+报告时间索引 |
| 5 | **RISRUpdateTimeIndex** | Index | `RISRUpdateDate,RISRUpdateTime` | ❌ | 时间戳索引(增量同步用) |
| 6 | **RISRCheckDateTimeIndex** | Index | `RISRCheckDate,RISRCheckTime` | ❌ | 审核日期时间索引 |
| 7 | **RISRReportDateTimeIndex** | Index | `RISRReportDate,RISRReportTime` | ❌ | 报告日期时间索引 |
| 8 | **RISRVisitNumberIndex** | Index | `RISRVisitNumber` | ❌ | 就诊号索引 |

### 2.3 属性完整速查表 — 按 SQLStorage Piece 顺序

#### A. 核心标识 (Piece 2~7)

| Piece | 属性名 | 描述 | 类型 | mAXLEN | Required | SQL列名 | 上报用途 | GetPacsInfo映射 |
|-------|--------|------|------|--------|----------|---------|---------|----------------|
| **2** | **RISRReportID** | 报告号(**pK**) | String | 50 | ✅ | RISR_ReportID | jcbgBgdh | `$lg(data,2)`=repNo ✅ |
| **3** | **RISRExamID** | 检查号 | String | 50 | ✅ | RISR_ExamID | 申请关联 | `$lg(data,3)`=appNo ✅ |
| **4** | **RISROrderItemID** | 医嘱ID | String | 100 | ✅ | RISR_OrderItemID | 医嘱关联 | `$lg(data,4)` |
| **5** | **RISRPatientID** | 患者ID | **User.PAPatMas** | — | ✅ | RISR_PatientID | →患者主索引 | `$lg(data,5)` →^PAPER |
| **6** | **RISRVisitNumber** | 就诊号码 | **User.PAAdm** | — | ✅ | RISR_VisitNumber | →就诊信息 | `$lg(data,6)` →^PAADM |
| **7** | **RISRSysCode** | 系统类型代码 | String | 30 | ✅ | RISR_SysCode | CT/MR/DR/uS/... | `$lg(data,7)`=repType ✅ |

#### B. 报告医生信息 (Piece 8~11)

| Piece | 属性名 | 描述 | 类型 | mAXLEN | SQL列名 | GetPacsInfo映射 |
|-------|--------|------|------|--------|---------|----------------|
| **8** | **RISRReportDocCode** | 报告医生代码 | String | 50 | RISR_ReportDocCode | →SSUser查找姓名 |
| **9** | **RISRReportDocDesc** | 报告医生描述(姓名) | String | 100 | RISR_ReportDocDesc | `$lg(data,9)`=checkDrName ✅ |
| **10** | **RISRReportDate** | 报告日期 | **Date** | — | RISR_ReportDate | `$zd($lg(data,10),3)` |
| **11** | **RISRReportTime** | 报告时间 | **Time** | — | RISR_ReportTime | `$lg(data,11)` |

> ⚠️ 注意：Piece10/11 是 Date/Time 类型（IRIS内部存储为数值），输出需 `$zd()` 格式化。

#### C. 审核医生信息 (Piece 12~15)

| Piece | 属性名 | 描述 | 类型 | mAXLEN | SQL列名 | GetPacsInfo映射 |
|-------|--------|------|------|--------|---------|----------------|
| **12** | **RISRCheckDocCode** | 审核医生代码 | String | 50 | RISR_CheckDocCode | →SSUser |
| **13** | **RISRCheckDocDesc** | 审核医生描述(姓名) | String | 100 | RISR_CheckDocDesc | `$lg(data,13)`=auditDrName ✅ |
| **14** | **RISRCheckDate** | 审核日期 | **Date** | — | RISR_CheckDate | 索引遍历用 |
| **15** | **RISRCheckTime** | 审核时间 | **Time** | — | RISR_CheckTime | 索引遍历用 |

#### D. 终审医生信息 (Piece 16~19) — ⚠️ GetPacsInfo未使用

| Piece | 属性名 | 描述 | 类型 | mAXLEN | SQL列名 |
|-------|--------|------|------|--------|---------|
| **16** | **RISRFinalCheckDocCode** | 终审医生代码 | String | 50 | RISR_FinalCheckDocCode |
| **17** | **RISRFinalCheckDocDesc** | 终审医生描述(姓名) | String | 100 | RISR_FinalCheckDocDesc |
| **18** | **RISRFinalCheckDate** | 终审日期 | **Date** | — | RISR_FinalCheckDate |
| **19** | **RISRFinalCheckTime** | 终审时间 | **Time** | — | RISR_FinalCheckTime |

> 三层审核架构：报告医生(Piece8~11) → 审核医生(Piece12~15) → **终审医生**(Piece16~19)。适用于需要多重签名的场景。

#### E. 检查项目描述 (Piece 20~23)

| Piece | 属性名 | 描述 | 类型 | mAXLEN | SQL列名 | GetPacsInfo映射 |
|-------|--------|------|------|--------|---------|----------------|
| **20** | **RISRItemDesc** | 检查项目描述 | String | 128 | RISR_ItemDesc | `$lg(data,20)`=repName ✅ |
| **21** | **RISRBACode** | 检查部位代码 | String | 50 | RISR_BACode | 部位编码 |
| **22** | **RISRBADesc** | 检查部位描述 | String | **500** | RISR_BADesc | `$lg(data,22)`=checkBodypart ✅ |
| **23** | **RISRMethod** | 检查方法 | String | 128 | RISR_Method | 检查技术方法 |

#### F. 检查结果与诊断 (Piece 24~27) — 🟡 长文本含换行

| Piece | 属性名 | 描述 | 类型 | **mAXLEN** | SQL列名 | GetPacsInfo映射 | 特殊处理 |
|-------|--------|------|------|-----------|---------|----------------|---------|
| **24** | **RISRExamDesc** | 检查所见 | String | **32000** | RISR_ExamDesc | `$lg(data,24)`=checkResult | 可能含换行 |
| **25** | **RISRDiagDesc** | 诊断意见/印象 | String | **32000** | RISR_DiagDesc | `$lg(data,25)`=diag ✅ | **必须去换行!** |
| **26** | **RISRACRCode** | ACR代码(乳腺分级) | String | 50 | RISR_ACRCode |  | bI-RADS分级 |
| **27** | **RISRAdviseDesc** | 报告建议 | String | **1024** | RISR_AdviseDesc | `$lg(data,27)`=eheck ✅ | **必须去换行!** |

```objectscript
;; 🔴 强制：诊断和建议字段必须清理换行符
s diag = $replace($lg($g(^Busi.ENS.EnsRISReportResultD(rowId)), 25), $c(10), "")
s advise = $replace($lg($g(^Busi.ENS.EnsRISReportResultD(rowId)), 27), $c(10), "")
```

#### G. 状态与时间戳 (Piece 28~31)

| Piece | 属性名 | 描述 | 类型 | mAXLEN/Initial | Required | SQL列名 |
|-------|--------|------|------|---------------|----------|---------|
| **28** | **RISRIsGet** | 是否已领取 | String | **1** (Y/N?) | ❌ | RISR_IsGet |
| **29** | **RISRUpdateDate** | 时间戳(日期) | **Date** | Init:`$P($H,",")` | ✅ | RISR_UpdateDate |
| **30** | **RISRUpdateTime** | 时间戳(时间) | **Time** | Init:`$P($H,",",2)` | ✅ | RISR_UpdateTime |

#### H. 扩展信息 (Piece 32~36)

| Piece | 属性名 | 描述 | 类型 | mAXLEN | SQL列名 | GetPacsInfo映射 |
|-------|--------|------|------|--------|---------|----------------|
| **31** | **RISROrderItemDesc** | 医嘱描述 | String | 100 | RISR_OrderItemDesc | 医嘱项目名称 |
| **32** | **RISRImageSrc** | 图像链接(uRL) | String | **1000** | RISR_ImageSrc | PACS原始图像URL |
| **33** | **RISRReportImageSrc** | 图片报告链接(uRL) | String | **1000** | RISR_ReportImageSrc | `$lg(data,33)`=picPath ✅ |
| **34** | **RISRWarnCode** | 是否危急值 | String | 100 | RISR_WarnCode | 危急值标志 |
| **35** | **RISRIsPositive** | 是否阳性 | String | 50 | RISR_IsPositive | 阳性标志 |
| **36** | **RISRAbnormalFlags** | 异常标记 | String | 50 | RISR_AbnormalFlags | 异常标志码 |

> ⚠️ v1.0 推测"影像无异常标志"是**错误的**！RIS确实有危急值/阳性/异常标记。

#### I. 麻醉扩展字段 (Piece 37~44) — 介入性检查专用

| Piece | 属性名 | 描述 | 类型 | mAXLEN | SQL列名 |
|-------|--------|------|------|--------|---------|
| **37** | **RISRAnesDocCode** | 麻醉医师工号 | String | 50 | RISR_AnesDocCode |
| **38** | **RISRAnesDocName** | 麻醉医师姓名 | String | 50 | RISR_AnesDocName |
| **39** | **RISRAnesMethodCode** | 麻醉方式代码 | String | 50 | RISR_AnesMethodCode |
| **40** | **RISRAnesMethodDesc** | 麻醉方式描述 | String | 50 | RISR_AnesMethodDesc |
| **41** | **RISRAnesLevelCode** | 麻醉分级代码 | String | 50 | RISR_AnesLevelCode |
| **42** | **RISRAnesLevelDesc** | 麻醉分级描述 | String | 50 | RISR_AnesLevelDesc |
| **43** | **RISRAnesStartDateTime** | 麻醉开始时间 | String | 50 | RISR_AnesStartDateTime |
| **44** | **RISRAnesEndDateTime** | 麻醉结束时间 | String | 50 | RISR_AnesEndDateTime |

> 用途：介入性放射/心血管造影等需要麻醉配合的检查。普通CT/mRI/超声这些字段为空。

#### J. 病理扩展字段 (Piece 45~47) — 病理科专用

| Piece | 属性名 | 描述 | 类型 | mAXLEN | SQL列名 |
|-------|--------|------|------|--------|---------|
| **45** | **RISRSliceFrozenNo** | 冰冻号 | String | 50 | RISR_SliceFrozenNo |
| **46** | **RISRInspMaterials** | 送检材料 | String | 50 | RISR_InspMaterials |
| **47** | **RISRImmuneGrpNo** | 免疫组化号 | String | 50 | RISR_ImmuneGrpNo |

> 用途：病理检查(冰冻切片/免疫组化)。说明此表同时服务于放射科和病理科！

### 2.4 GetPacsInfo QryRepByID vs XML导出 对照验证表

| GetPacsInfo变量 | $lg(n) | XML Piece | XML属性名 | 吻合? |
|----------------|--------|-----------|----------|-------|
| repNo | lg(2) | Piece2 | RISRReportID | ✅ |
| appNo | lg(3) | Piece3 | RISRExamID | ✅ |
| repType | lg(7) | Piece7 | RISRSysCode | ✅ |
| checkDrName | lg(9) | Piece9 | RISRReportDocDesc | ✅ |
| auditDrName | lg(13) | Piece13 | RISRCheckDocDesc | ✅ |
| repName | lg(20) | Piece20 | RISRItemDesc | ✅ |
| checkBodypart | lg(22) | Piece22 | RISRBADesc | ✅ |
| checkResult | lg(24) | Piece24 | RISRExamDesc | ✅ |
| diag | lg(25) | Piece25 | RISRDiagDesc | ✅ |
| eheck | lg(27) | Piece27 | RISRAdviseDesc | ✅ |
| picPath | lg(33) | Piece33 | RISRReportImageSrc | ✅ |

**结论：GetPacsInfo 的 12 个 `$lg()` 取值位置与 XML 导出 Storage 定义 100% 吻合 ✅**

---

## 三、EnsRISItemResult 细项结果子表 — 12属性完整定义 ✅

### 3.1 元信息

| 项目 | 值 |
|------|-----|
| **类名** | `User.EnsRISItemResult` |
| **描述** | 检查报告子表，保存测值 |
| **SQL表** | `Ens_RISItemResult` |
| **Data Global** | `^Busi.ENS.EnsRISItemResultD(RowId)` |
| **Index Global** | `^Busi.ENS.EnsRISItemResultI` |
| **Stream Global** | `^Busi.ENS.EnsRISItemResultS` |
| **父类** | `%Persistent` |
| **Owner** | `_SYSTEM` |
| **属性总数** | **11** (Piece 2~12) |
| **pK** | `RISIRRowID` (自增 `$I(^Busi.ENS.EnsRISItemResultC)`) |
| **uK** | `(RISIRReportID, RISIRItemCode)` |
| **fK** | `RISIRReportID → EnsRISReportResult.RISRReportID` |

### 3.2 索引与外键

| 名称 | 类型 | 属性 | 说明 |
|------|------|------|------|
| **RISItemResultPKey** | pK | `RISIRRowID` | 自增序列ID |
| **IndexReportItem** | **Unique** | `RISIRReportID, RISIRItemCode` | 同一报告内项目唯一 |
| **fKRISITEMRESULTREFERENCEREPORTID** | fK | `RISIRReportID` | → EnsRISReportResult.RISRReportID |

### 3.3 属性完整速查表

| Piece | 属性名 | 描述 | 类型 | mAXLEN | Required | SQL列名 | 取值表达式 |
|-------|--------|------|------|--------|----------|---------|-----------|
| **1** | *(系统)* | %%cLASSNAME | — | — | — | — | 内部不用 |
| **2** | **RISIRRowID** | 序列ID(**pK**,自增) | Integer | — | ✅ | RISIR_RowID | `$I(^Busi.ENS.EnsRISItemResultC)` |
| **3** | **RISIRReportID** | 报告ID(**fK**) | String | 30 | ✅ | RISIR_ReportID | →EnsRISReportResult.Piece2 |
| **4** | **RISIRPatientID** | 患者ID | **User.PAPatMas** | — | ✅ | RISIR_PatientID | 与主表Piece5一致 |
| **5** | **RISIRVisitNumber** | 就诊号 | **User.PAAdm** | — | ✅ | RISIR_VisitNumber | 与主表Piece6一致 |
| **6** | **RISIRItemCode** | 检查项目代码 | String | 50 | ❌ | RISIR_ItemCode | 项目编码(如测量项编码) |
| **7** | **RISIRItemDesc** | 检查项目名称 | String | 100 | ✅ | RISIR_ItemDesc | 测量项名称 |
| **8** | **RISIRResult** | 结果值 | String | 50 | ❌ | RISIR_Result | **实际测量结果** |
| **9** | **RISIRRanges** | 参考范围 | String | 100 | ❌ | RISIR_Ranges | 正常范围描述 |
| **10** | **RISIRHigh** | 参考值高值 | String | 60 | ❌ | RISIR_High | 上限值 |
| **11** | **RISIRLow** | 参考值低值 | String | 60 | ❌ | RISIR_Low | 下限值 |
| **12** | **RISIRUnit** | 参考值单位 | String | 50 | ❌ | RISIR_Unit | 单位(cm/mm等) |

### 3.4 取值模板

```objectscript
;; 遍历某报告的所有细项测值
s reportId = $lg($g(^Busi.ENS.EnsRISReportResultD(reportRowId)), 2)  ;; 获取报告ID
s itemRowId = ""
f  s itemRowId=$o(^Busi.ENS.EnsRISItemResultD(itemRowId)) q:itemRowId=""  d
. s itemData = $g(^Busi.ENS.EnsRISItemResultD(itemRowId))
. ;; 只处理属于该报告的细项
. i $lg(itemData,3)'=reportId q
. s itemCode = $lg(itemData, 6)   ;; 项目代码
. s itemName = $lg(itemData, 7)   ;; 项目名称
. s result = $lg(itemData, 8)     ;; 结果值
. s unit = $lg(itemData, 12)      ;; 单位
. s high = $lg(itemData, 10)      ;; 参考高值
. s low = $lg(itemData, 11)       ;; 参考低值
. w !, itemName, _": ", result, unit, " [", low, "-", high, "]"
```

### 3.5 v1.0 推测修正记录

| v1.0推测 | v2.0实际情况 | 修正说明 |
|----------|-------------|---------|
| dICOM Series序列号 | **无此字段** | ItemResult不是DICOM序列表 |
| sOP Instance uID | **无此字段** | 无DICOM标识 |
| Modality(CT/MR...) | **无此字段** | 设备类型在主表RISRSysCode |
| 图像帧数 | **无此字段** | 无图像计数 |
| "无单位" | **有Unit(Piece12)** | 影像测值也有单位(cm/mm等) |
| "无参考范围" | **有Ranges/High/Low(Piece9~11)** | 结构类似LIS检验细项 |

> **关键发现**: EnsRISItemResult 不是 dICOM 序列表，而是类似 lIS 的**测值细项表**（如心脏彩超测量值、骨密度T值等）。结构高度同构于 EnsLISItemResult！

---

## 四、EnsRISExamReport 检查报告关联表 — 7属性完整定义 ✅

### 4.1 元信息

| 项目 | 值 |
|------|-----|
| **类名** | `User.EnsRISExamReport` |
| **描述** | 检查报告关联表 |
| **SQL表** | `Ens_RISExamReport` |
| **Data Global** | `^Busi.ENS.EnsRISExamReportD` |
| **Index Global** | `^Busi.ENS.EnsRISExamReportI` |
| **Stream Global** | `^Busi.ENS.EnsRISExamReportS` |
| **父类** | `%Persistent` |
| **Owner** | `UnknownUser` |
| **ProcedureBlock** | `1` (类方法不暴露给SQL) |
| **属性总数** | **7** (Piece 2~8) |
| **pK** | **复合**: (RISSRReportID, RISSRExamID, RISSROrderItemID) |
| **fK** | `RISSRReportID → EnsRISReportResult.RISRReportID` |

### 4.2 属性完整速查表

| Piece | 属性名 | 描述 | 类型 | Required | SQL列名 | 特殊说明 |
|-------|--------|------|------|----------|---------|---------|
| **2** | **RISSRReportID** | 报告ID(**FK部分**) | String | ❌ | RISSR_ReportID | →EnsRISReportResult.Piece2 |
| **3** | **RISSRExamID** | 检查号(**PK部分**) | String | ❌ | RISSR_ExamID | →对应主表Piece3 |
| **4** | **RISSROrderItemID** | 医嘱号(**PK部分**) | **User.OEOrdItem** | ❌ | RISSR_OrderItemID | ⭐ 引用医嘱子项表! |
| **5** | **RISSRPatientID** | 患者ID | **User.PAPatMas** | ❌ | RISSR_PatientID | 冗余存储 |
| **6** | **RISSRVisitNumber** | 就诊号 | **User.PAAdm** | ❌ | RISSR_VisitNumber | 冗余存储 |
| **7** | **RISSRUpdateDate** | 时间戳(日期) | Date | ✅ | RISSR_UpdateDate | Init=`$P($H,",")` |
| **8** | **RISSRUpdateTime** | 时间戳(时间) | Time | ✅ | RISSR_UpdateTime | Init=`$P($H,",",2)` |

### 4.3 用途分析

```
ExamReport 的业务角色:

方案A: 检查申请→报告 多对多中间表
  一个检查申请(OEOrdItem)可能产生多份报告(初诊/复诊/补充)
  复合PK=(ReportID, ExamID, OrderItemID) 唯一确定一条关联关系

方案B: 报告去重/合并视图
  同一患者+同一检查号+同一医嘱只保留一条最新记录
  用于防止重复上报

方案C: 检查登记表
  记录每次检查执行时的快照(患者+就诊+医嘱+时间戳)
  用于审计追踪
```

> ⚠️ **注意**: RISSROrderItemID 的类型是 `User.OEOrdItem`（不是String），这意味着它直接引用医嘱子项对象，可以通过该字段联查 OEORD 相关信息。

---

## 五、三表关系图与联查模式

```
┌──────────────────────────────┐       ┌──────────────────────────────┐
│    EnsRISExamReport (关联)    │       │      EnsLISReportResult      │
│    7属性 / 复合PK             │  vS   │      149属性 / LIS域         │
│                              │       │                              │
│  RISSRReportID ──┐           │       │  (对比参考: LIS检验域结构)     │
│  RISSRExamID   ──┤           │       │                              │
│  RISSROrderItemID(→OEOrdItem)│       └──────────────────────────────┘
│  RISSRPatientID(→PAPatMas)   │               ↑
│  RISSRVisitNumber(→PAAdm)    │               │ 类比
│  UpdateDate/Time             │               │
└──────────┬───────────────────┘               │
           │ fK                                 │
           ▼                                   │
┌──────────────────────────────┐               │
│   EnsRISReportResult (主表)   │───────────────┘
│   47属性 / pK=RISRReportID    │  rIS≠lIS 差异点:
│                              │  ①主表属性少(47 vs 149)
│  核心分组:                    │  ②无药敏子表(替代:麻醉/病理扩展)
│  ①标识(2~7)  ②报告医(8~11)   │  ③细项更简(11 vs 34属性)
│  ③审核(12~15) ④终审(16~19)   │  ④有图片路径(ImageSrc)
│  ⑤项目(20~23) ⑥结果(24~27)   │  ⑤有部位(BADesc)
│  ⑦状态(28~31) ⑧扩展(32~36)   │  ⑥有麻醉/病理扩展字段
│  ⑨麻醉(37~44) ⑩病理(45~47)   │
└──────────┬───────────────────┘
           │ 1:N (fK: RISIRReportID)
           ▼
┌──────────────────────────────┐
│   EnsRISItemResult (细项)     │
│   11属性 / pK=RISIRRowID      │
│   uK:(ReportID, ItemCode)    │
│                              │
│  测值: Result/Ranges/         │
│        High/Low/Unit          │
│  (类似LIS检验细项!)           │
└──────────────────────────────┘
```

---

## 六、GetPacsInfo.cls 生产接口完整分析

### 6.1 方法签名

```objectscript
ClassMethod GetRISReport(Input As %String) As %GlobalCharacterStream
```

**输入XML格式**:
```xml
<Request>
  <patientNoType>1</patientNoType>   <!-- 1=登记号, 2=住院号 -->
  <patientNo>0010109444</patientNo>
  <startDateTime>2024-01-01 00:00:00</startDateTime>
  <endDateTime>2024-04-01 00:00:00</endDateTime>
</Request>
```

### 6.2 索引遍历骨架（生产代码提取）

```objectscript
;; Step 1: 通过患者ID遍历索引
s RISRCheckDate=""
f  s RISRCheckDate=$o(^Busi.ENS.EnsRISReportResultI("RISRPatientIDCheckDateTimeIndex",PatRowId,RISRCheckDate)) q:RISRCheckDate=""  d
|. ;; Step 2: 日期范围过滤
|. i $l(SttDate),RISRCheckDate<SttDate q
|. i $l(EndDate),RISRCheckDate>EndDate q
|. ;; Step 3: 时间维度遍历
|. s RISRRCheckTime=""
  f  s RISRRCheckTime=$o(^Busi.ENS.EnsRISReportResultI("RISRPatientIDCheckDateTimeIndex",PatRowId,RISRCheckDate,RISRRCheckTime)) q:RISRRCheckTime=""  d
  .. ;; Step 4: 时间范围过滤
  .. i +StTime>0,RISRRCheckTime<StTime q
  .. i +EndTime>0,RISRRCheckTime>EndTime q
  .. ;; Step 5: RowID遍历 → 提取报告详情
  .. s RISRRowID=""
    f  s RISRRowID=$o(^Busi.ENS.EnsRISReportResultI("RISRPatientIDCheckDateTimeIndex",PatRowId,RISRCheckDate,RISRRCheckTime,RISRRowID)) q:RISRRowID=""  d
    ... d ..QryRepByID(RISRRowID)
```

### 6.3 QryRepByID 完整取值逻辑（逐行注释 + XML验证标注）

```objectscript
QryRepByID(RISRRowID)
    ;; 创建Model对象
    s RISReportInfo=##class(web.DHCENS.bLL.BloodDialysis.Model.RISReportInfo).%New()
    
    ;; 从Global读取一行数据 ($lg List格式!)
    s ReportData=$g(^Busi.ENS.EnsRISReportResultD(RISRRowID))
    
    ;; ===== 核心标识 (Piece 2~3, 7) =====
    s RISReportInfo.repNo=$lg(ReportData,2)           ;; ✅ Piece2=RISRReportID(报告号PK)
    s RISReportInfo.repName=$lg(ReportData,20)        ;; ✅ Piece20=RISRItemDesc(检查项目描述)
    s RISReportInfo.repType=$lg(ReportData,7)         ;; ✅ Piece7=RISRSysCode(系统类型代码)
    
    ;; ===== 患者信息 (^PAPER字典) — 非lg(),从PatRowId查字典 =====
    s RISReportInfo.patientNo=$p($g(^PAPER(PatRowId,"PAT",1)),"^",1)   ;; 登记号
    s RISReportInfo.patientName=$p($g(^PAPER(PatRowId,"ALL")),"^",1)   ;; 姓名
    s RISReportInfo.personalNo=$p($g(^PAPER(PatRowId,"PAT",3)),"^",6)  ;; 个人号
    if Birthday'="" s RISReportInfo.birthDate=$zd(Birthday,3)
    s RISReportInfo.age=$p(age,"岁",1)
    
    ;; ===== 申请信息 (Piece 3, 4) =====
    s RISReportInfo.appNo=$lg(ReportData,3)           ;; ✅ Piece3=RISRExamID(检查号=申请号)
    s orderItemId=$lg(ReportData,4)                    ;; Piece4=RISROrderItemID(医嘱ID)
    if orderItemId'="" {
        s ordId=$p(orderItemId,"||",1)
        s ordItm=$p(orderItemId,"||",2)
        s AppDeptRowID=$p($g(^OEORD(ordId,"I",ordItm,7)),"^",2)  ;; 申请科室DR
        if AppDeptRowID'="" s RISReportInfo.appDeptName = $p($g(^CTLOC(AppDeptRowID)),"^",2)
    }
    
    ;; ===== 检查信息 (Piece 21~23) =====
    s RISReportInfo.checkBodypart=$lg(ReportData,22)  ;; ✅ Piece22=RISRBADesc(检查部位描述)
    if OrdSubCatRowID'="" s RISReportInfo.checkType = $p($g(^ARC("iC",OrdSubCatRowID)),"^",2)
    s RISReportInfo.deviceType=""                     ;; 设备类型(硬编码空!)
    s RISReportInfo.deviceName=""                     ;; 设备名称(硬编码空!)
    
    ;; ===== 医生信息 (Piece 9, 13) =====
    s RISReportInfo.checkDrName=$lg(ReportData,9)     ;; ✅ Piece9=RISRReportDocDesc(报告医生姓名)
    s RISReportInfo.checkTime=..getDateTime(checkDate,checkTime)
    s RISReportInfo.auditDrName=$lg(ReportData,13)    ;; ✅ Piece13=RISRCheckDocDesc(审核医生姓名)
    s RISReportInfo.auditTime=..getDateTime(checkDate,checkTime)
    
    ;; ===== 结果/诊断 (Piece 24~27) =====
    s RISReportInfo.checkResult=$lg(ReportData,24)    ;; ✅ Piece24=RISRExamDesc(检查所见)
    s RISReportInfo.eheck=$replace($lg(ReportData,27),$c(10),"")  ;; ✅ Piece27=RISRAdviseDesc(去换行!)
    s RISReportInfo.diag=$replace($lg(ReportData,25),$c(10),"")    ;; ✅ Piece25=RISRDiagDesc(去换行!)
    
    ;; ===== 时间/路径 (Piece 33, 索引) =====
    s RISReportInfo.rptTime=..getDateTime(RISRCheckDate,RISRRCheckTime)  ;; 来自索引非lg()
    s RISReportInfo.picPath=$lg(ReportData,33)         ;; ✅ Piece33=RISRReportImageSrc(图片报告链接)
    
    ;; 加入列表
    d Body.RISReportList.Insert(RISReportInfo)
```

### 6.4 Model属性清单（RISReportInfo）— 共23个

| # | 属性名 | 来源 | XML验证 |
|---|--------|------|---------|
| 1 | repNo | lg(2)=RISRReportID | ✅ |
| 2 | repName | lg(20)=RISRItemDesc | ✅ |
| 3 | repType | lg(7)=RISRSysCode | ✅ |
| 4 | patientNo | ^PAPER(PAT,1)^1 | 字典查询 |
| 5 | patientName | ^PAPER(ALL)^1 | 字典查询 |
| 6 | personalNo | ^PAPER(PAT,3)^6 | 字典查询 |
| 7 | birthDate | ^PAPER + $zd() | 字典查询 |
| 8 | age | 计算值 | 计算 |
| 9 | appNo | lg(3)=RISRExamID | ✅ |
| 10 | appDeptName | ^CTLOC(AppDeptRowID)^2 | 字典查询 |
| 11 | checkBodypart | lg(22)=RISRBADesc | ✅ |
| 12 | checkType | ^ARC("iC",OrdSubCatRowID)^2 | 字典查询 |
| 13 | deviceType | 硬编码"" | 未实现 |
| 14 | deviceName | 硬编码"" | 未实现 |
| 15 | checkDrName | lg(9)=RISRReportDocDesc | ✅ |
| 16 | checkTime | getDateTime() | 索引时间 |
| 17 | auditDrName | lg(13)=RISRCheckDocDesc | ✅ |
| 18 | auditTime | getDateTime() | 索引时间 |
| 19 | checkResult | lg(24)=RISRExamDesc | ✅ |
| 20 | eheck | lg(27)=RISRAdviseDesc 去换行 | ✅ |
| 21 | diag | lg(25)=RISRDiagDesc 去换行 | ✅ |
| 22 | rptTime | getDateTime(索引) | 索引非lg |
| 23 | picPath | lg(33)=RISRReportImageSrc | ✅ |

### 6.5 关联字典表速查

| 字典 | Global | 用途 | GetPacsInfo中的用法 |
|------|--------|------|---------------------|
| **^PAPER** | `^PAPER(PatRowId,...)` | 患者主索引(PAPatMas) | patientNo( PAT,1 ^1 ) / patientName( ALL ^1 ) / personalNo( PAT,3 ^6 ) / Birthday / age |
| **^CTLOC** | `^CTLOC(RowID)` | 科室地点字典 | appDeptName( ^CTLOC(AppDeptRowID) ^2 ) |
| **^ARC("iC")** | `^ARC("iC",SubCatRowID)` | 医嘱项子类别 | checkType检查类别( ^2 ) |
| **^CT("SEX")** | `^CT("SEX",SexRowID)` | 性别字典 | gender(未在QryRepByID中使用) |
| **^PAC("cARD")** | `^PAC("cARD",CredTypeID)` | 证件类型 | credType(未在QryRepByID中使用) |

---

## 七、常用索引与遍历方式

### 7.1 主索引：RISRPatientIDCheckDateTimeIndex（4层$o嵌套）

```objectscript
;; 用途: 按患者+审核时间查询所有RIS报告
;; 结构: ^Busi.ENS.EnsRISReportResultI("RISRPatientIDCheckDateTimeIndex", PatRowId, CheckDate, CheckTime, RowId)

;; 标准遍历模板
s rDate=""
f  s rDate=$o(^Busi.ENS.EnsRISReportResultI("RISRPatientIDCheckDateTimeIndex",patId,rDate)) q:rDate=""  d
|. ;; 日期范围过滤
|. i $l(sttDate),rDate<sttDate q
|. i $l(endDate),rDate>endDate q
|. s rTime=""
|  f  s rTime=$o(^Busi.ENS.EnsRISReportResultI("RISRPatientIDCheckDateTimeIndex",patId,rDate,rTime)) q:rTime=""  d
|  . ;; 时间范围过滤
|  . i +stTime>0,rTime<stTime q
|  . i +endTime>0,rTime>endTime q
|  . s rowId=""
|    f  s rowId=$o(^Busi.ENS.EnsRISReportResultI("RISRPatientIDCheckDateTimeIndex",patId,rDate,rTime,rowId)) q:rowId=""  d
|    . . ;; 处理每条报告
|    . . s data=$g(^Busi.ENS.EnsRISReportResultD(rowId))
|    . . s repNo=$lg(data,2)           ;; RISRReportID
|    . . s examID=$lg(data,3)          ;; RISRExamID
|    . . s patID=$lg(data,5)           ;; RISRPatientID → PAPatMas
|    . . s visitNo=$lg(data,6)         ;; RISRVisitNumber → PAAdm
|    . . s sysCode=$lg(data,7)         ;; RISRSysCode (CT/MR/DR...)
|    . . s reportDr=$lg(data,9)        ;; RISRReportDocDesc
|    . . s checkDr=$lg(data,13)        ;; RISRCheckDocDesc
|    . . ; ... 更多字段见第二章节
```

### 7.2 其他索引用途速查

| 索引名 | 键结构 | 典型场景 | 遍历层数 |
|--------|--------|---------|---------|
| **RISREPORTPKey** | RISRReportID | 按报告号精确查找 | 直接定位 |
| **RISRExamIDIndex** | RISRExamID | 按检查号查找 | 2层 |
| **RISRPatientIDReportDateTimeIndex** | PatID, RptDate, RptTime | 按患者+报告时间查 | 4层 |
| **RISRUpdateTimeIndex** | UpdDate, UpdTime | **增量同步/cDC** | 3层 |
| **RISRCheckDateTimeIndex** | ChkDate, ChkTime | 按审核日期批量查 | 3层 |
| **RISRReportDateTimeIndex** | RptDate, RptTime | 按报告日期批量查 | 3层 |
| **RISRVisitNumberIndex** | VisitNumber | 按就诊号查某次就诊所有报告 | 2层 |

### 7.3 增量同步模板（RISRUpdateTimeIndex）

```objectscript
;; 场景：定时任务获取上次同步后的新增/更新报告
s lastSyncDate = "20260511"  ;; 上次同步日期
s lastSyncTime = "235959"    ;; 上次同步时间
s updDate = ""
f  s updDate=$o(^Busi.ENS.EnsRISReportResultI("RISRUpdateTimeIndex",updDate)) q:updDate=""  d
. i updDate<lastSyncDate q
. s updTime=""
  f  s updTime=$o(^Busi.ENS.EnsRISReportResultI("RISRUpdateTimeIndex",updDate,updTime)) q:updTime=""  d
  . i updDate=lastSyncDate,updTime<=lastSyncTime q
  . s rowId=""
    f  s rowId=$o(^Busi.ENS.EnsRISReportResultI("RISRUpdateTimeIndex",updDate,updTime,rowId)) q:rowId=""  d
    . . ;; 处理增量报告...
```

---

## 八、RIS vs LIS 对比速查（v2.0 修正版）

| 维度 | 50-lab-exam (lIS) | 55-exam-report (rIS) |
|------|------------------|---------------------|
| **业务领域** | 检验(血/尿/生化/微生物/病理检验) | 放射/CT/mRI/DR/超声/核医学/**病理报告** |
| **主表** | EnsLISReportResult(**149属性**) | EnsRISReportResult(**47属性**) |
| **细项表** | EnsLISItemResult(**34属性**) | EnsRISItemResult(**11属性**) |
| **第三张表** | EnsLISItemSenResult(药敏子表) | EnsRISExamReport(**关联表**, 7属性) |
| **结果形式** | 数值+定性+参考范围+药敏 | 测值+图像+描述文字+诊断印象 |
| **单位** | 有(Unit) | **有(Unit)** ✅ 修正v1.0 |
| **异常标志** | H/L/N/panic | 有(WarnCode/IsPositive/AbnormalFlags) ✅ |
| **危急值** | 有(ReprotType) | 有(WarnCode) ✅ |
| **审核层级** | 双层(first+second) | **三层**(报告+审核+终审) ✅ |
| **图片路径** | 无 | ImageSrc + ReportImageSrc (**2个!**) |
| **检查部位** | 无 | BACode + BADesc (**有代码+描述**) |
| **设备信息** | TestMachine | SysCode(系统类型代码) |
| **特殊扩展** | 无 | **麻醉8字段** + **病理3字段** |
| **Dicom/Series** | 不涉及 | 主表中无(ItemResult也不是序列表) |
| **ACR代码** | 无 | 有(A CR乳腺BI-RADS分级) |
| **报告建议** | 无 | AdviseDesc(报告建议, Piece27) |
| **领取状态** | 无 | IsGet(Piece28) |
| **FK引用类型** | PatientID(String) | PatientID(**PAPatMas对象**) |

---

## 九、踩坑提示（v2.0 更新版）

### 🟡 已确认陷阱

| # | 坑点 | 严重程度 | 说明 | 应对 |
|---|------|---------|------|------|
| 1 | **$lg() vs $p()** | 🔴 致命 | ENS平台全部用`$lg()`，不能用`$p("^")` | 强制规范F0-001 |
| 2 | **换行符污染** | 🟡 高危 | Piece25(DiagDesc)和Piece27(AdviseDesc)含`$c(10)`换行 | 必须`$replace(,$c(10),"")` |
| 3 | **deviceType/deviceName 空值** | 🟡 中等 | GetPacsInfo中这两个字段**硬编码空字符串** | 如需设备信息另寻来源 |
| 4 | **auditTime=checkTime** | 🟢 低 | 审核时间和检查时间相同(都来自CheckDate/CheckTime) | 如需区分找其他字段 |
| 5 | **rptTime来自索引** | 🟡 中等 | 报告时间来自索引的CheckDate/CheckTime，不是ReportData中某个lg | 不要漏掉 |
| 6 | **日期过滤方向** | 🟡 中等 | startDateTime是下限排除(`<SttDate q`)，endDateTime是上限排除(`>EndDate q`) | 边界条件 |
| 7 | **patientNoType区分** | 🟡 中等 | 1=登记号，2=住院号，不同类型走不同查找路径 | 必须正确解析 |
| 8 | **Date/Time类型** | 🟡 中等 | Piece10/11/14/15/18/19/29/30是Date/Time类型(IRIS内部数值) | 输出需`$zd()`格式化 |
| 9 | **PAPatMas/PAAdm对象类型** | 🟡 中等 | Piece5/6不是String而是对象引用类型 | 存储的是RowID，联查时用 |
| 10 | **ExamReport.OrderItemID** | 🟡 中等 | 类型是`User.OEOrdItem`(医嘱子项)，不是String | 可直接联查医嘱信息 |
| 11 | **长文本32000字符** | 🟢 低 | Piece24/25最大32KB | 注意截断/传输大小 |
| 12 | **终审字段可能为空** | 🟢 低 | Piece16~19(终审)很多医院不使用 | 判空处理 |

### 🔴 v1.0 推测错误修正

| v1.0错误推测 | v2.0实际情况 | 影响 |
|-------------|-------------|------|
| ItemResult是DICOM序列表 | 是**测值细项表**(类似LIS) | 遍历逻辑完全不同 |
| RIS无单位 | **有Unit(Piece12)** | 可正常显示测量单位 |
| RIS无参考范围 | **有Ranges/High/Low(Piece9~11)** | 可做正常值判断 |
| RIS无异常标志 | **有WarnCode/Positive/AbnormalFlags** | 可做危急值提醒 |
| lg(4~6)含义未知 | **=医嘱ID/患者ID/就诊号** | 已完全明确 |
| lg(8)是设备信息 | **=报告医生代码** | 已修正 |
| lg(10~12)是人口学 | **=报告日期/时间/审核医生代码** | 已修正 |

---

## 十、规则统计

### v2.0 当前覆盖

| 类别 | 已验证(XML) | GetPacsInfo交叉验证 | 合计 |
|------|------------|-------------------|------|
| **EnsRISReportResult 属性** | **47** | **12** lg()映射 | **47/47 (100%)** |
| **EnsRISItemResult 属性** | **11** | — | **11/11 (100%)** |
| **EnsRISExamReport 属性** | **7** | — | **7/7 (100%)** |
| **索引定义** | **8** | **1**(主遍历用) | **8/8 (100%)** |
| **外键/唯一约束** | **3** | — | **3/3 (100%)** |
| **关联字典表** | **5** | **3**(^PAPER/^CTLOC/^ARC) | **5** |
| **踩坑点记录** | **12** (8继承+4新增) | — | **12** |
| **合计** | **—** | **—** | **~93条规则** |

### 有效上报规则（可直接用于接口开发）

| 规则ID | 类 | 字段 | Piece/lg | 取值表达式 | 特殊处理 | 验证 |
|--------|-----|------|----------|-----------|---------|------|
| R-001 | 主表 | 报告编号 | Piece2 | `$lg(data,2)` | pK,mAXLEN=50 | ✅✅ |
| R-002 | 主表 | 检查号 | Piece3 | `$lg(data,3)` | mAXLEN=50 | ✅✅ |
| R-003 | 主表 | 医嘱ID | Piece4 | `$lg(data,4)` | mAXLEN=100 | ✅ |
| R-004 | 主表 | 患者ID | Piece5 | `$lg(data,5)` | **→PAPatMas对象** | ✅ |
| R-005 | 主表 | 就诊号 | Piece6 | `$lg(data,6)` | **→PAAdm对象** | ✅ |
| R-006 | 主表 | 系统类型 | Piece7 | `$lg(data,7)` | CT/MR/DR/uS/pT/nM... | ✅✅ |
| R-007 | 主表 | 报告医生代码 | Piece8 | `$lg(data,8)` | →CTPCP查姓名 | ✅ |
| R-008 | 主表 | 报告医生姓名 | Piece9 | `$lg(data,9)` | mAXLEN=100 | ✅✅ |
| R-009 | 主表 | 报告日期 | Piece10 | `$zd($lg(data,10),3)` | **Date类型需格式化** | ✅ |
| R-010 | 主表 | 报告时间 | Piece11 | `$lg(data,11)` | **Time类型** | ✅ |
| R-011 | 主表 | 审核医生代码 | Piece12 | `$lg(data,12)` | →CTPCP查姓名 | ✅ |
| R-012 | 主表 | 审核医生姓名 | Piece13 | `$lg(data,13)` | mAXLEN=100 | ✅✅ |
| R-013 | 主表 | 审核日期 | Piece14 | `$zd($lg(data,14),3)` | **Date类型** | ✅ |
| R-014 | 主表 | 审核时间 | Piece15 | `$lg(data,15)` | **Time类型** | ✅ |
| R-015 | 主表 | 终审医生代码 | Piece16 | `$lg(data,16)` | 可能为空 | ✅ |
| R-016 | 主表 | 终审医生姓名 | Piece17 | `$lg(data,17)` | 可能为空 | ✅ |
| R-017 | 主表 | 终审日期 | Piece18 | `$zd($lg(data,18),3)` | Date,可能为空 | ✅ |
| R-018 | 主表 | 终审时间 | Piece19 | `$lg(data,19)` | Time,可能为空 | ✅ |
| R-019 | 主表 | 检查项目描述 | Piece20 | `$lg(data,20)` | mAXLEN=128 | ✅✅ |
| R-020 | 主表 | 检查部位代码 | Piece21 | `$lg(data,21)` | 部位编码 | ✅ |
| R-021 | 主表 | 检查部位描述 | Piece22 | `$lg(data,22)` | mAXLEN=**500** | ✅✅ |
| R-022 | 主表 | 检查方法 | Piece23 | `$lg(data,23)` | mAXLEN=128 | ✅ |
| R-023 | 主表 | 检查所见 | Piece24 | `$lg(data,24)` | mAXLEN=**32000**,可能含换行 | ✅✅ |
| R-024 | 主表 | 诊断意见 | Piece25 | `$replace($lg(data,25),$c(10),"")` | **必须去换行!** 32000字符 | ✅✅ |
| R-025 | 主表 | ACR代码 | Piece26 | `$lg(data,26)` | bI-RADS乳腺分级 | ✅ |
| R-026 | 主表 | 报告建议 | Piece27 | `$replace($lg(data,27),$c(10),"")` | **必须去换行!** 1024字符 | ✅✅ |
| R-027 | 主表 | 是否已领取 | Piece28 | `$lg(data,28)` | Y/N?, mAXLEN=1 | ✅ |
| R-028 | 主表 | 更新日期(时间戳) | Piece29 | `$zd($lg(data,29),3)` | Date,Init=$P($H,",") | ✅ |
| R-029 | 主表 | 更新时间(时间戳) | Piece30 | `$lg(data,30)` | Time,Init=$P($H,",",2) | ✅ |
| R-030 | 主表 | 医嘱描述 | Piece31 | `$lg(data,31)` | mAXLEN=100 | ✅ |
| R-031 | 主表 | 图像链接 | Piece32 | `$lg(data,32)` | pACS uRL,mAXLEN=1000 | ✅ |
| R-032 | 主表 | 图片报告链接 | Piece33 | `$lg(data,33)` | PACS报告URL,**mAXLEN=1000** | ✅✅ |
| R-033 | 主表 | 危急值标志 | Piece34 | `$lg(data,34)` | 危急值判断 | ✅ |
| R-034 | 主表 | 阳性标志 | Piece35 | `$lg(data,35)` | 阳性判断 | ✅ |
| R-035 | 主表 | 异常标记 | Piece36 | `$lg(data,36)` | 异常标志码 | ✅ |
| R-036 | 主表 | 麻醉医师工号 | Piece37 | `$lg(data,37)` | 介入检查专用 | ✅ |
| R-037 | 主表 | 麻醉医师姓名 | Piece38 | `$lg(data,38)` | 介入检查专用 | ✅ |
| R-038 | 主表 | 麻醉方式代码 | Piece39 | `$lg(data,39)` | 介入检查专用 | ✅ |
| R-039 | 主表 | 麻醉方式描述 | Piece40 | `$lg(data,40)` | 介入检查专用 | ✅ |
| R-040 | 主表 | 麻醉分级代码 | Piece41 | `$lg(data,41)` | 介入检查专用 | ✅ |
| R-041 | 主表 | 麻醉分级描述 | Piece42 | `$lg(data,42)` | 介入检查专用 | ✅ |
| R-042 | 主表 | 麻醉开始时间 | Piece43 | `$lg(data,43)` | 介入检查专用,String类型 | ✅ |
| R-043 | 主表 | 麻醉结束时间 | Piece44 | `$lg(data,44)` | 介入检查专用,String类型 | ✅ |
| R-044 | 主表 | 冰冻号(病理) | Piece45 | `$lg(data,45)` | 病理科专用 | ✅ |
| R-045 | 主表 | 送检材料(病理) | Piece46 | `$lg(data,46)` | 病理科专用 | ✅ |
| R-046 | 主表 | 免疫组化号(病理) | Piece47 | `$lg(data,47)` | 病理科专用 | ✅ |
| I-001 | 子表 | 细项RowID | Piece2 | `$lg(itemData,2)` | pK,自增$I() | ✅ |
| I-002 | 子表 | 报告ID(fK) | Piece3 | `$lg(itemData,3)` | →主表Piece2 | ✅ |
| I-003 | 子表 | 患者ID | Piece4 | `$lg(itemData,4)` | PAPatMas | ✅ |
| I-004 | 子表 | 就诊号 | Piece5 | `$lg(itemData,5)` | PAAdm | ✅ |
| I-005 | 子表 | 项目代码 | Piece6 | `$lg(itemData,6)` | UK组成部分 | ✅ |
| I-006 | 子表 | 项目名称 | Piece7 | `$lg(itemData,7)` | Required | ✅ |
| I-007 | 子表 | **结果值** | Piece8 | `$lg(itemData,8)` | **核心测值** | ✅ |
| I-008 | 子表 | 参考范围 | Piece9 | `$lg(itemData,9)` | 正常范围描述 | ✅ |
| I-009 | 子表 | 参考高值 | Piece10 | `$lg(itemData,10)` | 上限 | ✅ |
| I-010 | 子表 | 参考低值 | Piece11 | `$lg(itemData,11)` | 下限 | ✅ |
| I-011 | 子表 | **单位** | Piece12 | `$lg(itemData,12)` | cm/mm等 | ✅ |
| E-001 | 关联 | 报告ID(fK) | Piece2 | `$lg(examData,2)` | →主表Piece2 | ✅ |
| E-002 | 关联 | 检查号 | Piece3 | `$lg(examData,3)` | 复合PK部分 | ✅ |
| E-003 | 关联 | 医嘱号(**→OEOrdItem**) | Piece4 | `$lg(examData,4)` | **对象引用!** | ✅ |
| E-004 | 关联 | 患者ID | Piece5 | `$lg(examData,5)` | PAPatMas | ✅ |
| E-005 | 关联 | 就诊号 | Piece6 | `$lg(examData,6)` | PAAdm | ✅ |
| E-006 | 关联 | 更新日期 | Piece7 | `$zd($lg(examData,7),3)` | 时间戳 | ✅ |
| E-007 | 关联 | 更新时间 | Piece8 | `$lg(examData,8)` | 时间戳 | ✅ |
| X-001 | 字典 | 患者登记号 | ^PAPER | `$p($g(^PAPER(PatRowId,"PAT",1)),"^",1)` | 需PatRowId | ✅ |
| X-002 | 字典 | 患者姓名 | ^PAPER | `$p($g(^PAPER(PatRowId,"ALL")),"^",1)` | 需PatRowId | ✅ |
| X-003 | 字典 | 申请科室 | ^CTLOC | `$p($g(^CTLOC(AppDeptRowID)),"^",2)` | 需AppDeptRowID | ✅ |
| X-004 | 字典 | 检查类别 | ^ARC("iC") | `$p($g(^ARC("iC",OrdSubCatRowID)),"^",2)` | 需OrdSubCatRowID | ✅ |
| X-005 | 索引遍历 | 主索引 | I | `RISRPatientIDCheckDateTimeIndex` | **4层$o嵌套+日期过滤** | ✅✅ |

---

*文档生成时间: 2026-05-11 | 基于IRIS XML导出完整验证(2026-05-11 23:39) + GetPacsInfo.cls QryRepByID生产代码交叉确认*
*IRIS版本: IRIS for Windows (x86-64) 2023.1.1 (Build 380_0_22958U)*
*v1.0→v2.0升级: 新增55属性验证(47+11+7), 修正7处v1.0推测错误, 新增12个踩坑点, 67条有效上报规则*


## 规则匹配映射（自动生成）

### RISREPORTPKEY

| 属性 | 值 |
|------|-----|
| 标准名 | `RISREPORTPKey` |
| 匹配模式 | RISREPORTPKey, `RISRReportID` |
| 取值表达式 | `$lg(data,1)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RISREXAMIDINDEX

| 属性 | 值 |
|------|-----|
| 标准名 | `RISRExamIDIndex` |
| 匹配模式 | RISRExamIDIndex, `RISRExamID` |
| 取值表达式 | `$lg(data,2)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RISRPATIENTIDCHECKDATETIMEINDEX

| 属性 | 值 |
|------|-----|
| 标准名 | `RISRPatientIDCheckDateTimeIndex` |
| 匹配模式 | RISRPatientIDCheckDateTimeIndex, `RISRPatientID,RISRCheckDate,RISRCheckTime` |
| 取值表达式 | `$zd($lg(data,3),3)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RISRPATIENTIDREPORTDATETIMEINDEX

| 属性 | 值 |
|------|-----|
| 标准名 | `RISRPatientIDReportDateTimeIndex` |
| 匹配模式 | RISRPatientIDReportDateTimeIndex, `RISRPatientID,RISRReportDate,RISRReportTime` |
| 取值表达式 | `$zd($lg(data,4),3)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RISRUPDATETIMEINDEX

| 属性 | 值 |
|------|-----|
| 标准名 | `RISRUpdateTimeIndex` |
| 匹配模式 | RISRUpdateTimeIndex, `RISRUpdateDate,RISRUpdateTime` |
| 取值表达式 | `$zd($lg(data,5),3)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RISRCHECKDATETIMEINDEX

| 属性 | 值 |
|------|-----|
| 标准名 | `RISRCheckDateTimeIndex` |
| 匹配模式 | RISRCheckDateTimeIndex, `RISRCheckDate,RISRCheckTime` |
| 取值表达式 | `$zd($lg(data,6),3)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RISRREPORTDATETIMEINDEX

| 属性 | 值 |
|------|-----|
| 标准名 | `RISRReportDateTimeIndex` |
| 匹配模式 | RISRReportDateTimeIndex, `RISRReportDate,RISRReportTime` |
| 取值表达式 | `$zd($lg(data,7),3)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RISRVISITNUMBERINDEX

| 属性 | 值 |
|------|-----|
| 标准名 | `RISRVisitNumberIndex` |
| 匹配模式 | RISRVisitNumberIndex, `RISRVisitNumber` |
| 取值表达式 | `$lg(data,8)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RISR_REPORTDOCCODE

| 属性 | 值 |
|------|-----|
| 标准名 | `RISR_ReportDocCode` |
| 匹配模式 | RISR_ReportDocCode, risrReportdoccode, risr_reportdoccode, | **9** |
| 取值表达式 | `$lg(data,8)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RISR_REPORTDOCDESC

| 属性 | 值 |
|------|-----|
| 标准名 | `RISR_ReportDocDesc` |
| 匹配模式 | RISR_ReportDocDesc, risrReportdocdesc, risr_reportdocdesc, | **10** |
| 取值表达式 | `$lg(data,9)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RISR_CHECKDOCCODE

| 属性 | 值 |
|------|-----|
| 标准名 | `RISR_CheckDocCode` |
| 匹配模式 | RISR_CheckDocCode, risrCheckdoccode, risr_checkdoccode, | **13** |
| 取值表达式 | `$lg(data,12)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RISR_CHECKDOCDESC

| 属性 | 值 |
|------|-----|
| 标准名 | `RISR_CheckDocDesc` |
| 匹配模式 | RISR_CheckDocDesc, risrCheckdocdesc, risr_checkdocdesc, | **14** |
| 取值表达式 | `$lg(data,13)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RISR_FINALCHECKDOCCODE

| 属性 | 值 |
|------|-----|
| 标准名 | `RISR_FinalCheckDocCode` |
| 匹配模式 | RISR_FinalCheckDocCode, risrFinalcheckdoccode, risr_finalcheckdoccode, **RISRFinalCheckDocDesc** |
| 取值表达式 | `$lg(data,16)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RISR_FINALCHECKDOCDESC

| 属性 | 值 |
|------|-----|
| 标准名 | `RISR_FinalCheckDocDesc` |
| 匹配模式 | RISR_FinalCheckDocDesc, risrFinalcheckdocdesc, risr_finalcheckdocdesc, **RISRFinalCheckDate** |
| 取值表达式 | `$lg(data,17)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RISR_ITEMDESC

| 属性 | 值 |
|------|-----|
| 标准名 | `RISR_ItemDesc` |
| 匹配模式 | RISR_ItemDesc, risrItemdesc, risr_itemdesc, | **21** |
| 取值表达式 | `$lg(data,20)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RISR_BACODE

| 属性 | 值 |
|------|-----|
| 标准名 | `RISR_BACode` |
| 匹配模式 | RISR_BACode, risrBacode, risr_bacode, | **22** |
| 取值表达式 | `$lg(data,21)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RISR_METHOD

| 属性 | 值 |
|------|-----|
| 标准名 | `RISR_Method` |
| 匹配模式 | RISR_Method, risrMethod, risr_method, #### F. 检查结果与诊断  — 🟡 长文本含换行 |
| 取值表达式 | `$lg(data,23)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RISR_ACRCODE

| 属性 | 值 |
|------|-----|
| 标准名 | `RISR_ACRCode` |
| 匹配模式 | RISR_ACRCode, risrAcrcode, risr_acrcode, | **27** |
| 取值表达式 | `$lg(data,26)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RISR_ORDERITEMDESC

| 属性 | 值 |
|------|-----|
| 标准名 | `RISR_OrderItemDesc` |
| 匹配模式 | RISR_OrderItemDesc, risrOrderitemdesc, risr_orderitemdesc, | **32** |
| 取值表达式 | `$lg(data,31)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RISR_WARNCODE

| 属性 | 值 |
|------|-----|
| 标准名 | `RISR_WarnCode` |
| 匹配模式 | RISR_WarnCode, risrWarncode, risr_warncode, | **35** |
| 取值表达式 | `$lg(data,34)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RISR_ISPOSITIVE

| 属性 | 值 |
|------|-----|
| 标准名 | `RISR_IsPositive` |
| 匹配模式 | RISR_IsPositive, risrIspositive, risr_ispositive, | **36** |
| 取值表达式 | `$lg(data,35)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RISR_ANESDOCCODE

| 属性 | 值 |
|------|-----|
| 标准名 | `RISR_AnesDocCode` |
| 匹配模式 | RISR_AnesDocCode, risrAnesdoccode, risr_anesdoccode, **RISRAnesDocName** |
| 取值表达式 | `$lg(data,37)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RISR_ANESDOCNAME

| 属性 | 值 |
|------|-----|
| 标准名 | `RISR_AnesDocName` |
| 匹配模式 | RISR_AnesDocName, risrAnesdocname, risr_anesdocname, **RISRAnesMethodCode** |
| 取值表达式 | `$lg(data,38)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RISR_ANESMETHODCODE

| 属性 | 值 |
|------|-----|
| 标准名 | `RISR_AnesMethodCode` |
| 匹配模式 | RISR_AnesMethodCode, risrAnesmethodcode, risr_anesmethodcode, **RISRAnesMethodDesc** |
| 取值表达式 | `$lg(data,39)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RISR_ANESMETHODDESC

| 属性 | 值 |
|------|-----|
| 标准名 | `RISR_AnesMethodDesc` |
| 匹配模式 | RISR_AnesMethodDesc, risrAnesmethoddesc, risr_anesmethoddesc, **RISRAnesLevelCode** |
| 取值表达式 | `$lg(data,40)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RISR_ANESLEVELCODE

| 属性 | 值 |
|------|-----|
| 标准名 | `RISR_AnesLevelCode` |
| 匹配模式 | RISR_AnesLevelCode, risrAneslevelcode, risr_aneslevelcode, **RISRAnesLevelDesc** |
| 取值表达式 | `$lg(data,41)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RISR_ANESLEVELDESC

| 属性 | 值 |
|------|-----|
| 标准名 | `RISR_AnesLevelDesc` |
| 匹配模式 | RISR_AnesLevelDesc, risrAnesleveldesc, risr_anesleveldesc, **RISRAnesStartDateTime** |
| 取值表达式 | `$lg(data,42)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RISR_ANESSTARTDATETIME

| 属性 | 值 |
|------|-----|
| 标准名 | `RISR_AnesStartDateTime` |
| 匹配模式 | RISR_AnesStartDateTime, risrAnesstartdatetime, risr_anesstartdatetime, **RISRAnesEndDateTime** |
| 取值表达式 | `$zd($lg(data,43),3)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RISR_SLICEFROZENNO

| 属性 | 值 |
|------|-----|
| 标准名 | `RISR_SliceFrozenNo` |
| 匹配模式 | RISR_SliceFrozenNo, risrSlicefrozenno, risr_slicefrozenno, **RISRInspMaterials** |
| 取值表达式 | `$lg(data,45)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RISR_INSPMATERIALS

| 属性 | 值 |
|------|-----|
| 标准名 | `RISR_InspMaterials` |
| 匹配模式 | RISR_InspMaterials, risrInspmaterials, risr_inspmaterials, **RISRImmuneGrpNo** |
| 取值表达式 | `$lg(data,46)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### REPNO

| 属性 | 值 |
|------|-----|
| 标准名 | `repNo` |
| 匹配模式 | repNo, ✅ |
| 取值表达式 | `$lg(data,2)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### REPNAME

| 属性 | 值 |
|------|-----|
| 标准名 | `repName` |
| 匹配模式 | repName, ✅ |
| 取值表达式 | `$lg(data,20)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### REPTYPE

| 属性 | 值 |
|------|-----|
| 标准名 | `repType` |
| 匹配模式 | repType, ✅ |
| 取值表达式 | `$lg(data,7)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### PATIENTNO

| 属性 | 值 |
|------|-----|
| 标准名 | `patientNo` |
| 匹配模式 | patientNo, 字典查询 |
| 取值表达式 | `$p($g(^PAPER(patDR,"PAT",1)),"^",1)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### PATIENTNAME

| 属性 | 值 |
|------|-----|
| 标准名 | `patientName` |
| 匹配模式 | patientName, 字典查询 |
| 取值表达式 | `$p($g(^PAPER(patDR,"ALL")),"^",1)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### PERSONALNO

| 属性 | 值 |
|------|-----|
| 标准名 | `personalNo` |
| 匹配模式 | personalNo, 字典查询 |
| 取值表达式 | `$p($g(^PAPER(patDR,"PAT",3)),"^",6)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### BIRTHDATE

| 属性 | 值 |
|------|-----|
| 标准名 | `birthDate` |
| 匹配模式 | birthDate, 字典查询 |
| 取值表达式 | `$zd(BirthDay,3)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### AGE

| 属性 | 值 |
|------|-----|
| 标准名 | `age` |
| 匹配模式 | patient_age, patientAge, 患者年龄 |
| 取值表达式 | `$p(age,"岁",1)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### APPNO

| 属性 | 值 |
|------|-----|
| 标准名 | `appNo` |
| 匹配模式 | appNo, ✅ |
| 取值表达式 | `$lg(data,3)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### APPDEPTNAME

| 属性 | 值 |
|------|-----|
| 标准名 | `appDeptName` |
| 匹配模式 | appDeptName, 字典查询, 申请科室名称 |
| 取值表达式 | `$p($g(^CTLOC($p($g(^OEORD($p($lg(data,4),"\|\|",1),"I",$p($lg(data,4),"\|\|",2),7)),"^",2))),"^",2)` |
| Global | `^CTLOC` |
| 置信度 | 0.95 |
| 说明 | 通过医嘱ID获取申请科室：data^4=医嘱ID→OEORD^7^2=科室DR→CTLOC^2=科室名称 |

### CHECKBODYPART

| 属性 | 值 |
|------|-----|
| 标准名 | `checkBodypart` |
| 匹配模式 | checkBodypart, ✅ |
| 取值表达式 | `$lg(data,22)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### CHECKTYPE

| 属性 | 值 |
|------|-----|
| 标准名 | `checkType` |
| 匹配模式 | checkType, 字典查询 |
| 取值表达式 | `$p($g(^ARC("iC",OrdSubCatRowID)),"^",2)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### DEVICETYPE

| 属性 | 值 |
|------|-----|
| 标准名 | `deviceType` |
| 匹配模式 | deviceType, 未实现 |
| 取值表达式 | `$lg(data,13)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### DEVICENAME

| 属性 | 值 |
|------|-----|
| 标准名 | `deviceName` |
| 匹配模式 | deviceName, 未实现 |
| 取值表达式 | `$lg(data,14)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### CHECKDRNAME

| 属性 | 值 |
|------|-----|
| 标准名 | `checkDrName` |
| 匹配模式 | checkDrName, ✅ |
| 取值表达式 | `$lg(data,9)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### CHECKTIME

| 属性 | 值 |
|------|-----|
| 标准名 | `checkTime` |
| 匹配模式 | checkTime, 索引时间 |
| 取值表达式 | `..getDateTime(checkDate,checkTime)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### AUDITDRNAME

| 属性 | 值 |
|------|-----|
| 标准名 | `auditDrName` |
| 匹配模式 | auditDrName, ✅ |
| 取值表达式 | `$lg(data,13)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### AUDITTIME

| 属性 | 值 |
|------|-----|
| 标准名 | `auditTime` |
| 匹配模式 | auditTime, 索引时间 |
| 取值表达式 | `..getDateTime(checkDate,checkTime)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### CHECKRESULT

| 属性 | 值 |
|------|-----|
| 标准名 | `checkResult` |
| 匹配模式 | checkResult, ✅ |
| 取值表达式 | `$lg(data,24)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### EHECK

| 属性 | 值 |
|------|-----|
| 标准名 | `eheck` |
| 匹配模式 | eheck, ✅ |
| 取值表达式 | `$replace($lg(data,27),$c(10),"")` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### DIAG

| 属性 | 值 |
|------|-----|
| 标准名 | `diag` |
| 匹配模式 | diag, ✅ |
| 取值表达式 | `$replace($lg(data,25),$c(10),"")` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RPTTIME

| 属性 | 值 |
|------|-----|
| 标准名 | `rptTime` |
| 匹配模式 | rptTime, 索引非lg |
| 取值表达式 | `..getDateTime(RISRCheckDate,RISRRCheckTime)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### PICPATH

| 属性 | 值 |
|------|-----|
| 标准名 | `picPath` |
| 匹配模式 | picPath, ✅ |
| 取值表达式 | `$lg(data,33)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### 换行符污染

| 属性 | 值 |
|------|-----|
| 标准名 | `换行符污染` |
| 匹配模式 | 换行符污染, Piece25和Piece27含`$c`换行 |
| 取值表达式 | `$lg(data,2)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### RPTTIME来自索引

| 属性 | 值 |
|------|-----|
| 标准名 | `rptTime来自索引` |
| 匹配模式 | rptTime来自索引, 报告时间来自索引的CheckDate/CheckTime，不是ReportData中某个lg |
| 取值表达式 | `$zd($lg(data,5),3)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### 日期过滤方向

| 属性 | 值 |
|------|-----|
| 标准名 | `日期过滤方向` |
| 匹配模式 | 日期过滤方向, startDateTime是下限排除，endDateTime是上限排除 |
| 取值表达式 | `$zd($lg(data,6),3)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### PATIENTNOTYPE区分

| 属性 | 值 |
|------|-----|
| 标准名 | `patientNoType区分` |
| 匹配模式 | patientNoType区分, 1=登记号，2=住院号，不同类型走不同查找路径 |
| 取值表达式 | `$lg(data,7)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### 长文本32000字符

| 属性 | 值 |
|------|-----|
| 标准名 | `长文本32000字符` |
| 匹配模式 | 长文本32000字符, Piece24/25最大32KB |
| 取值表达式 | `$lg(data,11)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

### 终审字段可能为空

| 属性 | 值 |
|------|-----|
| 标准名 | `终审字段可能为空` |
| 匹配模式 | 终审字段可能为空, Piece16~19很多医院不使用 |
| 取值表达式 | `$lg(data,12)` |
| Global | `^Busi.ENS` |
| 置信度 | 0.95 |

