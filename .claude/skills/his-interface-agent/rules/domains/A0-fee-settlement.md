---
domain: "a0-fee-settlement"
name: "费用结算域(计费)"
version: "2.2.0"
description: "HIS费用结算取值规则集.基于^DHCPB三层结构(pB→pBO→pBD). MCP验证修正+补充高频字段."

entityGlobals:
  - global: "^DHCPB(pbId)"
    description: "账单主表"
    structure: "$p()格式. ^2=日期 ^3=时间 ^8=总费用 ^12=实付金额 ^16=退费标志"

  - global: "^DHCPB(pbId,O,pboChild)"
    description: "账单医嘱子表"
    structure: "$p()格式. ^3=医嘱DR ^4=数量 ^7=金额"

  - global: "^DHCPB(pbId,O,pboChild,D,pbdChild)"
    description: "账单明细子表"
    structure: "$p()格式. ^3=tariDr ^4=单价 ^5=数量 ^6=分类DR ^7=金额"

# 数据源遍历配置（供代码生成器使用）
# 业务链路：发票表^DHCINVPRT → 票据连接中间表^DHCBCI → 账单表^DHCPB → 医嘱子表 → 明细子表
traversal:
  type: "DHCPB"
  viewMatchers: ["expense_record", "expense_record_info", "fee_settlement", "fee_details", "fee_records", "outpatient_fee", "outpatient_fee_details", "outpatient_fee_records", "费用记录", "费用明细", "费用结算", "结算记录", "结算主单", "结算明细", "JS", "JSMX", "DBZ_ZYFY"]
  inputParam:
    name: "pDateFrom"
    type: "%String"
    description: "开始日期"
  preVariables:
    - name: "patDR"
      expression: "$p($g(^PAADM(admRowId)),\"^\",1)"
      description: "患者DR"
  # 按日期范围遍历模式（从发票表入手）
  modes:
    dateRange:
      viewMatchers: ["费用记录", "费用明细", "费用结算", "Fee", "ZYFY", "DBZ_ZYFY"]
      description: "按发票日期范围遍历（批量导出）"
      index:
        global: "^DHCINVPRT"
        name: "Date"
        keys: ["date", "prtRowId"]
        expression: '$o(^DHCINVPRT(0,"Date",date,prtRowId))'
      template: |
        f date=pDateFrom:1:pDateTo d
        .s prtRowId=""
        .f  s prtRowId=$o(^DHCINVPRT(0,"Date",date,prtRowId)) q:prtRowId=""  d
        ..s prtData=$g(^DHCINVPRT(prtRowId))
        ..i (prtData="") q
        ..s prtFlag=$p(prtData,"^",6)
        ..continue:prtFlag'="N"  ; 只取正常状态(N=Normal)
        ..; 通过票据连接中间表找到账单
        ..s bciRowId=""
        ..f  s bciRowId=$o(^DHCBCI(0,"INV",prtRowId,bciRowId)) q:bciRowId=""  d
        ...s bciData=$g(^DHCBCI(bciRowId))
        ...q:bciData=""
        ...s pbId=$p(bciData,"^",2)
        ...q:pbId=""
        ...s pbData=$g(^DHCPB(pbId))
        ...q:pbData=""
        ...s adm=$p(pbData,"^",1)
        ...s pboChild=""
        ...f  s pboChild=$o(^DHCPB(pbId,"O",pboChild)) q:pboChild=""  d
        ....s pboData=$g(^DHCPB(pbId,"O",pboChild))
        ....s pbdChild=""
        ....f  s pbdChild=$o(^DHCPB(pbId,"O",pboChild,"D",pbdChild)) q:pbdChild=""  d
        .....s pbdData=$g(^DHCPB(pbId,"O",pboChild,"D",pbdChild))
        .....d GetFeeInfo
    admSingle:
      viewMatchers: ["单个费用", "费用详情"]
      description: "按就诊ID遍历（单条查询）"
      index:
        global: "^DHCPB"
        name: "ADM"
        keys: ["admRowId", "pbId"]
        expression: '$o(^DHCPB(0,"ADM",admRowId,pbId))'
      template: |
        s pbId=""
        f  s pbId=$o(^DHCPB(0,"ADM",admRowId,pbId)) q:pbId=""  d
        .s pbData=$g(^DHCPB(pbId))
        .i (pbData="") q
        .s pboChild=""
        .f  s pboChild=$o(^DHCPB(pbId,"O",pboChild)) q:pboChild=""  d
        ..s pboData=$g(^DHCPB(pbId,"O",pboChild))
        ..s pbdChild=""
        ..f  s pbdChild=$o(^DHCPB(pbId,"O",pboChild,"D",pbdChild)) q:pbdChild=""  d
        ...s pbdData=$g(^DHCPB(pbId,"O",pboChild,"D",pbdChild))
  # 默认配置（按就诊ID遍历，兼容旧逻辑）
  index:
    global: "^DHCPB"
    name: "ADM"
    keys: ["admRowId", "pbId"]
    expression: '$o(^DHCPB(0,"ADM",admRowId,pbId))'
  data:
    global: "^DHCPB"
    variable: "pbData"
    format: "p"
    expression: "$g(^DHCPB(pbId))"
  template: |
    s pbId=""
    f  s pbId=$o(^DHCPB(0,"ADM",admRowId,pbId)) q:pbId=""  d
    .s pbData=$g(^DHCPB(pbId))
    .i (pbData="") q
    .s pboChild=""
    .f  s pboChild=$o(^DHCPB(pbId,"O",pboChild)) q:pboChild=""  d
    ..s pboData=$g(^DHCPB(pbId,"O",pboChild))
    ..s pbdChild=""
    ..f  s pbdChild=$o(^DHCPB(pbId,"O",pboChild,"D",pbdChild)) q:pbdChild=""  d
    ...s pbdData=$g(^DHCPB(pbId,"O",pboChild,"D",pbdChild))

totalRules: 59
lastUpdated: "2026-05-30"
---

# 费用结算域 (A0-fee-settlement) 取值规则 v2.0

> DHCPB三层结构 | $p()格式 | pB→pBO→pBD

## 架构总览

```
^DHCPB(pbId)  -> 账单主表
    |
    +-- ^DHCPB(pbId,O,pboChild)  -> 医嘱子表
            |
            +-- ^DHCPB(pbId,O,pboChild,D,pbdChild)  -> 明细子表
```

## 规则列表

#### PBO_OEORI_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `ordItm` |
| 匹配模式 | ordItm, ordItmDr, oeoriDr, 医嘱DR, 医嘱项目DR, PBOOEORIDR |
| 取值表达式 | `$p(pboData,"^",3)` |
| Global | `^DHCPB(pbId,"O",pboChild)` |
| 节点路径 | ^3=医嘱DR(OE_OrdItem) |
| 置信度 | 0.99 |
| 分类 | 账单医嘱子表 |

**说明**：账单医嘱子表指向医嘱明细表的指针，可用于获取医嘱相关信息。

```objectscript
; 从账单医嘱子表获取医嘱DR
s ordItm = $p(pboData,"^",3)

; 通过医嘱DR获取医嘱信息
if ordItm'="" {
    s ordId = +ordItm
    s ordSub = $p(ordItm,"||",2)
    s ordstr1 = $g(^OEORD(ordId,"I",ordSub,1))
    s ordstr2 = $g(^OEORD(ordId,"I",ordSub,2))
    s ordstr3 = $g(^OEORD(ordId,"I",ordSub,3))
}
```

#### HOSP_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `hospDr` |
| 匹配模式 | hospDr, hosp_dr, 院区DR, 医院DR |
| 取值表达式 | `$p($g(^CTLOC($p($g(^PAADM(adm)),"^",4))),"^",22)` |
| Global | `^CTLOC` |
| 置信度 | 0.95 |

**说明**：从就诊信息的科室DR获取院区DR

```objectscript
s ctlocDr = $p($g(^PAADM(adm)),"^",4)  ; 科室DR
s hospDr = $p($g(^CTLOC(ctlocDr)),"^",22)  ; 院区DR
```

#### SETTLEMENT_ID

| 属性 | 值 |
|------|-----|
| 标准名 | `settlementId` |
| 匹配模式 | settlementId, settlement_id, 结算流水号 |
| 取值表达式 | `pbId` |
| Global | `^DHCPB` |
| 置信度 | 0.95 |

**说明**：账单主表RowId

```objectscript
s settlement_id = pbId
```

#### TOTAL_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `totalFee` |
| 匹配模式 | totalFee, total_fee, 结算总费用 |
| 取值表达式 | `+$p($g(^DHCPB(pbId)),"^",9)` |
| Global | `^DHCPB` |
| 置信度 | 0.95 |

**说明**：pbId^8=总费用

```objectscript
s total_fee = +$p($g(^DHCPB(pbId)),"^",8)
```

#### BASE_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `baseFee` |
| 匹配模式 | baseFee, base_fee, 基本统筹支付金额 |
| 取值表达式 | `""` |
| Global | - |
| 置信度 | 0.80 |

**说明**：⚠️ 基本统筹支付金额需从医保结算表获取，当前置空

```objectscript
s baseFee = ""  ; TODO: 需从医保结算表获取
```

#### SELF_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `selfFee` |
| 匹配模式 | selfFee, self_fee, 自费金额, 患者自付 |
| 取值表达式 | `+$p($g(^DHCPB(pbId)),"^",12)` |
| Global | `^DHCPB` |
| 节点路径 | `^DHCPB(pbId)^12` |
| 置信度 | 0.95 |

**说明**：⚠️ ^12=PatientShare(患者自付金额), ^13=AmountPaid(已付金额), ^11=PayorShare(医保支付)。

```objectscript
s selfFee = +$p($g(^DHCPB(pbId)),"^",12)
s amountPaid = +$p($g(^DHCPB(pbId)),"^",13)
```

#### ACCOUNT_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `accountFee` |
| 匹配模式 | accountFee, account_fee, 医保个人账户支付金额 |
| 取值表达式 | `""` |
| Global | - |
| 置信度 | 0.80 |

**说明**：⚠️ 医保个人账户支付金额需从医保结算表获取，当前置空

```objectscript
s accountFee = ""  ; TODO: 需从医保结算表获取
```

#### OWN_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `ownFee` |
| 匹配模式 | ownFee, own_fee, 自付金额 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需从医保表获取

```objectscript
s own_fee = ""  ; tODO: 待补充
```

#### CHARGE_TIME

| 属性 | 值 |
|------|-----|
| 标准名 | `chargeTime` |
| 匹配模式 | chargeTime, charge_time, payTime, pay_time, 结算时间, 支付时间 |
| 取值表达式 | `$zd($p($g(^DHCPB(pbId)),"^",2),3)` |
| Global | `^DHCPB` |
| 节点路径 | `^DHCPB(pbId)^2` |
| 置信度 | 0.95 |

**说明**：⚠️ ^2=AdmDate(就诊日期), ^3=DisChargeDate(出院日期), 非时间字段。结算日期取^2。

```objectscript
s chargeTime = $zd($p($g(^DHCPB(pbId)),"^",2),3)
```

#### REFERENCED_INVOICE_ID

| 属性 | 值 |
|------|-----|
| 标准名 | `referencedInvoiceId` |
| 匹配模式 | referencedInvoiceId, referenced_invoice_id, 关联票据号 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需从发票表获取

```objectscript
s referenced_invoice_id = ""  ; tODO: 待补充
```

#### IS_REVERSED

| 属性 | 值 |
|------|-----|
| 标准名 | `isReversed` |
| 匹配模式 | isReversed, is_reversed, 是否退费, RefundFlag |
| 取值表达式 | `$p($g(^DHCPB(pbId)),"^",17)` |
| Global | `^DHCPB` |
| 节点路径 | `^DHCPB(pbId)^17` |
| 置信度 | 0.95 |

**说明**：⚠️ ^17=RefundFlag(R=退费, B=被退费), ^16=PayedFlag(B=未付, P=已付)。之前规则误将^16当退费标志。

```objectscript
s refundFlag = $p($g(^DHCPB(pbId)),"^",17)
s isReversed = $s(refundFlag="R":"1",1:"0")
s payedFlag = $p($g(^DHCPB(pbId)),"^",16)
```

#### PB_ADM_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `pbAdmDr` |
| 匹配模式 | AdmDr, EpisodeID, 就诊DR, PB_Adm_Dr |
| 取值表达式 | `$p($g(^DHCPB(pbId)),"^",1)` |
| Global | `^DHCPB` |
| 节点路径 | `^DHCPB(pbId)^1` |
| 置信度 | 0.99 |

**说明**：就诊DR，关联PA_Adm表。

```objectscript
s pbAdmDr = $p($g(^DHCPB(pbId)),"^",1)
```

#### DISCHARGE_DATE

| 属性 | 值 |
|------|-----|
| 标准名 | `dischargeDate` |
| 匹配模式 | DisChargeDate, 出院日期, PB_DisChargeDate |
| 取值表达式 | `$zd($p($g(^DHCPB(pbId)),"^",3),3)` |
| Global | `^DHCPB` |
| 节点路径 | `^DHCPB(pbId)^3` |
| 置信度 | 0.95 |

**说明**：⚠️ ^3=出院日期(非时间)，^2=就诊日期。

```objectscript
s tDate = $p($g(^DHCPB(pbId)),"^",3)
i tDate'="" s dischargeDate = $zd(tDate,3)
```

#### INS_TYPE_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `insTypeDr` |
| 匹配模式 | PatInsType_DR, InsType, 费别DR, PB_PatInsType_DR |
| 取值表达式 | `$p($g(^DHCPB(pbId)),"^",4)` |
| Global | `^DHCPB` |
| 节点路径 | `^DHCPB(pbId)^4` |
| 置信度 | 0.95 |

**说明**：费别/保险类型DR → PAC_AdmReason。

```objectscript
s insTypeDr = $p($g(^DHCPB(pbId)),"^",4)
s insTypeDesc = $p($g(^PAC("ADMREA",insTypeDr)),"^",2)
```

#### DISC_AMOUNT

| 属性 | 值 |
|------|-----|
| 标准名 | `discAmount` |
| 匹配模式 | DiscAmount, 折扣金额, PB_DiscAmount |
| 取值表达式 | `+$p($g(^DHCPB(pbId)),"^",9)` |
| Global | `^DHCPB` |
| 节点路径 | `^DHCPB(pbId)^9` |
| 置信度 | 0.95 |

```objectscript
s discAmount = +$p($g(^DHCPB(pbId)),"^",9)
```

#### PAYOR_SHARE

| 属性 | 值 |
|------|-----|
| 标准名 | `payorShare` |
| 匹配模式 | PayorShare, 医保支付金额, PB_PayorShare |
| 取值表达式 | `+$p($g(^DHCPB(pbId)),"^",11)` |
| Global | `^DHCPB` |
| 节点路径 | `^DHCPB(pbId)^11` |
| 置信度 | 0.95 |

**说明**：医保/第三方支付金额。

```objectscript
s payorShare = +$p($g(^DHCPB(pbId)),"^",11)
```

#### AMOUNT_PAID

| 属性 | 值 |
|------|-----|
| 标准名 | `amountPaid` |
| 匹配模式 | AmountPaid, 已付金额, PB_AmountPaid |
| 取值表达式 | `+$p($g(^DHCPB(pbId)),"^",13)` |
| Global | `^DHCPB` |
| 节点路径 | `^DHCPB(pbId)^13` |
| 置信度 | 0.95 |

**说明**：⚠️ ^13=AmountPaid(已付), ^12=PatientShare(患者自付), ^14=AmountToPay(应付)。

```objectscript
s amountPaid = +$p($g(^DHCPB(pbId)),"^",13)
```

#### PAYED_FLAG

| 属性 | 值 |
|------|-----|
| 标准名 | `payedFlag` |
| 匹配模式 | PayedFlag, 付款标志, PB_PayedFlag |
| 取值表达式 | `$p($g(^DHCPB(pbId)),"^",16)` |
| Global | `^DHCPB` |
| 节点路径 | `^DHCPB(pbId)^16` |
| 置信度 | 0.95 |

**说明**：B=未结算, P=已结算。

```objectscript
s payedFlag = $p($g(^DHCPB(pbId)),"^",16)
```

#### BILL_TYPE

| 属性 | 值 |
|------|-----|
| 标准名 | `billType` |
| 匹配模式 | BillType, 账单类型, PB_BillType |
| 取值表达式 | `$p($g(^DHCPB(pbId)),"^",15)` |
| Global | `^DHCPB` |
| 节点路径 | `^DHCPB(pbId)^15` |
| 置信度 | 0.90 |

```objectscript
s billType = $p($g(^DHCPB(pbId)),"^",15)
```

#### ORIGINAL_BILL_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `originalBillDr` |
| 匹配模式 | OriginalBill_DR, 原账单DR, 退费关联 |
| 取值表达式 | `$p($g(^DHCPB(pbId)),"^",18)` |
| Global | `^DHCPB` |
| 节点路径 | `^DHCPB(pbId)^18` |
| 置信度 | 0.90 |

**说明**：退费时关联原账单DR。

```objectscript
s originalBillDr = $p($g(^DHCPB(pbId)),"^",18)
```

#### 常用索引

| 索引名 | Global | 结构 | 用途 |
|--------|--------|------|------|
| INDEXPAAdm | `^DHCPB` | `^DHCPB(0,"ADM",admDr,pbId)` | 按就诊查账单 |
| INDEXPayedFlag | `^DHCPB` | `^DHCPB(0,"PayedFlag",flag,pbId)` | 按结算状态查 |
| indexAdmDate | `^DHCPB` | `^DHCPB(0,"AdmDate",date,pbId)` | 按就诊日期查 |
| INDEXBillType | `^DHCPB` | `^DHCPB(0,"BType",type,pbId)` | 按账单类型查 |

#### REPORT_DATETIME

| 属性 | 值 |
|------|-----|
| 标准名 | `reportDatetime` |
| 匹配模式 | reportDatetime, report_datetime, 数据上报时间 |
| 取值表达式 | `$zdt($h,3,1)` |
| Global | `` |
| 置信度 | 0.95 |

**说明**：当前系统时间

```objectscript
s report_datetime = $zdt($h,3,1)
```

#### SERVICE_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `serviceFee` |
| 匹配模式 | serviceFee, service_fee, 一般医疗服务费 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需遍历PBD按收费分类累加

```objectscript
s service_fee = ""  ; tODO: 待补充
```

#### OPERATION_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `operationFee` |
| 匹配模式 | operationFee, operation_fee, 一般治疗操作费 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需遍历PBD按收费分类累加

```objectscript
s operation_fee = ""  ; tODO: 待补充
```

#### NURSING_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `nursingFee` |
| 匹配模式 | nursingFee, nursing_fee, 护理费 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需遍历PBD按收费分类累加

```objectscript
s nursing_fee = ""  ; tODO: 待补充
```

#### SERVICEOTHER_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `serviceotherFee` |
| 匹配模式 | serviceotherFee, serviceother_fee, 综合医疗服务类其他费用 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需遍历PBD按收费分类累加

```objectscript
s serviceother_fee = ""  ; tODO: 待补充
```

#### PATHOLOGY_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `pathologyFee` |
| 匹配模式 | pathologyFee, pathology_fee, 病理诊断费 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需遍历PBD按收费分类累加

```objectscript
s pathology_fee = ""  ; tODO: 待补充
```

#### LAB_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `labFee` |
| 匹配模式 | labFee, lab_fee, 实验室诊断费 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需遍历PBD按收费分类累加

```objectscript
s lab_fee = ""  ; tODO: 待补充
```

#### RADIO_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `radioFee` |
| 匹配模式 | radioFee, radio_fee, 影像学诊断费 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需遍历PBD按收费分类累加

```objectscript
s radio_fee = ""  ; tODO: 待补充
```

#### CLINICALDIA_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `clinicaldiaFee` |
| 匹配模式 | clinicaldiaFee, clinicaldia_fee, 临床诊断项目费 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需遍历PBD按收费分类累加

```objectscript
s clinicaldia_fee = ""  ; tODO: 待补充
```

#### NONSURGICAL_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `nonsurgicalFee` |
| 匹配模式 | nonsurgicalFee, nonsurgical_fee, 非手术治疗项目费 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需遍历PBD按收费分类累加

```objectscript
s nonsurgical_fee = ""  ; tODO: 待补充
```

#### CLINICALPHY_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `clinicalphyFee` |
| 匹配模式 | clinicalphyFee, clinicalphy_fee, 临床物理治疗费 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需遍历PBD按收费分类累加

```objectscript
s clinicalphy_fee = ""  ; tODO: 待补充
```

#### SURGICALTREAT_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `surgicaltreatFee` |
| 匹配模式 | surgicaltreatFee, surgicaltreat_fee, 手术治疗费 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需遍历PBD按收费分类累加

```objectscript
s surgicaltreat_fee = ""  ; tODO: 待补充
```

#### ANESTHETIC_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `anestheticFee` |
| 匹配模式 | anestheticFee, anesthetic_fee, 麻醉费 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需遍历PBD按收费分类累加

```objectscript
s anesthetic_fee = ""  ; tODO: 待补充
```

#### SURGICAL_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `surgicalFee` |
| 匹配模式 | surgicalFee, surgical_fee, 手术费 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需遍历PBD按收费分类累加

```objectscript
s surgical_fee = ""  ; tODO: 待补充
```

#### REHABILITATION_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `rehabilitationFee` |
| 匹配模式 | rehabilitationFee, rehabilitation_fee, 康复费 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需遍历PBD按收费分类累加

```objectscript
s rehabilitation_fee = ""  ; tODO: 待补充
```

#### WESTERNDRUG_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `westerndrugFee` |
| 匹配模式 | westerndrugFee, westerndrug_fee, 西药费 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需遍历PBD按收费分类累加

```objectscript
s westerndrug_fee = ""  ; tODO: 待补充
```

#### ANTIBACTERIAL_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `antibacterialFee` |
| 匹配模式 | antibacterialFee, antibacterial_fee, 抗菌药物费用 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需遍历PBD按收费分类累加

```objectscript
s antibacterial_fee = ""  ; tODO: 待补充
```

#### CHINESEPATENTMEDICINE_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `chinesepatentmedicineFee` |
| 匹配模式 | chinesepatentmedicineFee, chinesepatentmedicine_fee, 中成药费 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需遍历PBD按收费分类累加

```objectscript
s chinesepatentmedicine_fee = ""  ; tODO: 待补充
```

#### CHINESEHERBALMEDICINE_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `chineseherbalmedicineFee` |
| 匹配模式 | chineseherbalmedicineFee, chineseherbalmedicine_fee, 中草药费 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需遍历PBD按收费分类累加

```objectscript
s chineseherbalmedicine_fee = ""  ; tODO: 待补充
```

#### BLOOD_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `bloodFee` |
| 匹配模式 | bloodFee, blood_fee, 血费 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需遍历PBD按收费分类累加

```objectscript
s blood_fee = ""  ; tODO: 待补充
```

#### RICIM_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `ricimFee` |
| 匹配模式 | ricimFee, ricim_fee, 白蛋白类制品费 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需遍历PBD按收费分类累加

```objectscript
s ricim_fee = ""  ; tODO: 待补充
```

#### GLOBIN_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `globinFee` |
| 匹配模式 | globinFee, globin_fee, 球蛋白类制品费 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需遍历PBD按收费分类累加

```objectscript
s globin_fee = ""  ; tODO: 待补充
```

#### COAGUALATIONFACTOR_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `coagualationfactorFee` |
| 匹配模式 | coagualationfactorFee, coagualationfactor_fee, 凝血因子类制品费 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需遍历PBD按收费分类累加

```objectscript
s coagualationfactor_fee = ""  ; tODO: 待补充
```

#### CYTOKINES_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `cytokinesFee` |
| 匹配模式 | cytokinesFee, cytokines_fee, 细胞因子类制品费 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需遍历PBD按收费分类累加

```objectscript
s cytokines_fee = ""  ; tODO: 待补充
```

#### SINGLEINSPECTION_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `singleinspectionFee` |
| 匹配模式 | singleinspectionFee, singleinspection_fee, 检查用一次性医用材料费 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需遍历PBD按收费分类累加

```objectscript
s singleinspection_fee = ""  ; tODO: 待补充
```

#### SINGLETREATMENT_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `singletreatmentFee` |
| 匹配模式 | singletreatmentFee, singletreatment_fee, 治疗用一次性医用材料费 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需遍历PBD按收费分类累加

```objectscript
s singletreatment_fee = ""  ; tODO: 待补充
```

#### SINGLESURGICAL_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `singlesurgicalFee` |
| 匹配模式 | singlesurgicalFee, singlesurgical_fee, 手术用一次性医用材料费 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需遍历PBD按收费分类累加

```objectscript
s singlesurgical_fee = ""  ; tODO: 待补充
```

#### OTHER_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `otherFee` |
| 匹配模式 | otherFee, other_fee, 其他费 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需遍历PBD按收费分类累加

```objectscript
s other_fee = ""  ; tODO: 待补充
```

#### CHARGE_TYPE

| 属性 | 值 |
|------|-----|
| 标准名 | `chargeType` |
| 匹配模式 | chargeType, charge_type, 收费分类 |
| 取值表达式 | `$p($g(^DHCPB(pbId,"O",pboChild,"D",pbdChild)),"^",6)` |
| Global | `^DHCPB pBD` |
| 置信度 | 0.95 |

**说明**：pBD^6=收费分类DR

```objectscript
s charge_type = $p($g(^DHCPB(pbId,"O",pboChild,"D",pbdChild)),"^",6)
```

#### CHARGE_ITEM_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `chargeItemCode` |
| 匹配模式 | chargeItemCode, charge_item_code, 收费项目主项代码 |
| 取值表达式 | `$p($g(^DHCTARI($p($g(^DHCPB(pbId,"O",pboChild,"D",pbdChild)),"^",3))),"^",1)` |
| Global | `^DHCPB pBD→^DHCTARI` |
| 置信度 | 0.95 |

**说明**：pBD^3=tariDr→tAR^1=代码

```objectscript
s charge_item_code = $p($g(^DHCTARI($p($g(^DHCPB(pbId,"O",pboChild,"D",pbdChild)),"^",3))),"^",1)
```

#### CHARGE_ITEM_NAME

| 属性 | 值 |
|------|-----|
| 标准名 | `chargeItemName` |
| 匹配模式 | chargeItemName, charge_item_name, 收费项目主项名称 |
| 取值表达式 | `$p($g(^DHCTARI($p($g(^DHCPB(pbId,"O",pboChild,"D",pbdChild)),"^",3))),"^",2)` |
| Global | `^DHCPB pBD→^DHCTARI` |
| 置信度 | 0.95 |

**说明**：pBD^3=tariDr→tAR^2=名称

```objectscript
s charge_item_name = $p($g(^DHCTARI($p($g(^DHCPB(pbId,"O",pboChild,"D",pbdChild)),"^",3))),"^",2)
```

#### ITEM_SUB_NO

| 属性 | 值 |
|------|-----|
| 标准名 | `itemSubNo` |
| 匹配模式 | itemSubNo, item_sub_no, 收费子项项目编码 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需从子项表获取

```objectscript
s item_sub_no = ""  ; tODO: 待补充
```

#### ITEM_SUB_NAME

| 属性 | 值 |
|------|-----|
| 标准名 | `itemSubName` |
| 匹配模式 | itemSubName, item_sub_name, 收费子项项目名称 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需从子项表获取

```objectscript
s item_sub_name = ""  ; tODO: 待补充
```

#### IS_REFUND

| 属性 | 值 |
|------|-----|
| 标准名 | `isRefund` |
| 匹配模式 | isRefund, is_refund, 是否退费项目 |
| 取值表达式 | `$s(+$p($g(^DHCPB(pbId,"O",pboChild,"D",pbdChild)),"^",7)<0:"1",1:"0")` |
| Global | `^DHCPB pBD` |
| 置信度 | 0.95 |

**说明**：pBD^7<0表示退费

```objectscript
s is_refund = $s(+$p($g(^DHCPB(pbId,"O",pboChild,"D",pbdChild)),"^",7)<0:"1",1:"0")
```

#### UNIT_PRICE_AMT

| 属性 | 值 |
|------|-----|
| 标准名 | `unitPriceAmt` |
| 匹配模式 | unitPriceAmt, unit_price_amt, 单价 |
| 取值表达式 | `+$p($g(^DHCPB(pbId,"O",pboChild,"D",pbdChild)),"^",4)` |
| Global | `^DHCPB pBD` |
| 置信度 | 0.95 |

**说明**：pBD^4=单价

```objectscript
s unit_price_amt = +$p($g(^DHCPB(pbId,"O",pboChild,"D",pbdChild)),"^",4)
```

#### UNIT_QUANTITY

| 属性 | 值 |
|------|-----|
| 标准名 | `unitQuantity` |
| 匹配模式 | unitQuantity, unit_quantity, 数量 |
| 取值表达式 | `+$p($g(^DHCPB(pbId,"O",pboChild,"D",pbdChild)),"^",5)` |
| Global | `^DHCPB pBD` |
| 置信度 | 0.95 |

**说明**：pBD^5=数量

```objectscript
s unit_quantity = +$p($g(^DHCPB(pbId,"O",pboChild,"D",pbdChild)),"^",5)
```

#### FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `fEE` |
| 匹配模式 | fEE, fee, 项目总金额 |
| 取值表达式 | `+$p($g(^DHCPB(pbId,"O",pboChild,"D",pbdChild)),"^",7)` |
| Global | `^DHCPB pBD` |
| 置信度 | 0.95 |

**说明**：pBD^7=金额

```objectscript
s fee = +$p($g(^DHCPB(pbId,"O",pboChild,"D",pbdChild)),"^",7)
```

#### MAT_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `matCode` |
| 匹配模式 | matCode, mat_code, 耗材编码 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需从耗材表获取

```objectscript
s mat_code = ""  ; tODO: 待补充
```

#### IS_HV

| 属性 | 值 |
|------|-----|
| 标准名 | `isHv` |
| 匹配模式 | isHv, is_hv, 是否高值耗材 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需从耗材表获取

```objectscript
s is_hv = ""  ; tODO: 待补充
```

#### OPERATOR_ID

| 属性 | 值 |
|------|-----|
| 标准名 | `operatorId` |
| 匹配模式 | operatorId, operator_id, 操作人ID, 操作员 |
| 取值表达式 | `$p(prtData,"^",15)` |
| Global | `^DHCINVPRT` |
| 置信度 | 0.90 |

**说明**：从发票表获取操作人ID

```objectscript
s operatorId = $p(prtData,"^",15)
```

#### PAY_TIME

| 属性 | 值 |
|------|-----|
| 标准名 | `payTime` |
| 匹配模式 | payTime, pay_time, 支付时间, 结算时间 |
| 取值表达式 | `$zt($p(payData,"^",9))` |
| Global | `^DHCINVPRT(prtRowId,"P",sub)` |
| 置信度 | 0.90 |

**说明**：从支付方式子表获取支付时间

```objectscript
s payTime = $zt($p(payData,"^",9))
```
