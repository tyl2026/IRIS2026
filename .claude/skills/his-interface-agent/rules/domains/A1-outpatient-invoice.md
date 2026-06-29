---
domain: "a1-outpatient-invoice"
name: "门诊发票/支付方式域"
version: "1.1.0"
description: "HIS门诊发票和支付方式取值规则集.基于^DHCINVPRT发票主表+^DHCINVPRT(prtRowId,\"P\",sub)支付方式子表+^DHCBCI票据连接中间表. 35条规则."

# 实体表类（数据存储结构来源）
entityClasses:
  - name: "User.DHCINVPRT"
    description: "门诊发票主表"
    global: "^DHCINVPRT"
    primaryKey: "PRT_Rowid"
    sqlTableName: "DHC_INVPRT"
    indexes:
      - name: "Date"
        description: "按收费日期查询"
        indexGlobal: '^DHCINVPRT(0,"Date",date,prtRowId)'
      - name: "HandinDate"
        description: "按交款日期查询"
        indexGlobal: '^DHCINVPRT(0,"HandDate",date,prtRowId)'
      - name: "INV"
        description: "按发票号查询"
        indexGlobal: '^DHCINVPRT(0,"INV",invNo,prtRowId)'
    structure: "$p()格式"

  - name: "User.DHCINVPayMode"
    description: "门诊支付方式子表"
    global: "^DHCINVPRT(prtRowId,\"P\",sub)"
    primaryKey: "IPM_RowID"
    parentRef: "IPM_PRT_ParRef"
    sqlTableName: "DHC_INVPayMode"
    structure: "$p()格式"

  - name: "User.DHCBillConINV"
    description: "票据连接中间表(发票-账单-就诊)"
    global: "^DHCBCI"
    primaryKey: "DHCBCI_Rowid"
    sqlTableName: "DHC_BillConINV"
    indexes:
      - name: "INV"
        description: "按发票ID查账单"
        indexGlobal: '^DHCBCI(0,"INV",invDR,bciRowId)'
      - name: "Bill"
        description: "按账单ID查发票"
        indexGlobal: '^DHCBCI(0,"Bill",patBillDR,bciRowId)'
      - name: "ADM"
        description: "按就诊ID查发票/账单"
        indexGlobal: '^DHCBCI(0,"ADM",admRowId,bciRowId)'
    structure: "$p()格式"
    fields:
      - name: "DHCBCI_Rowid"
        piece: 1
        description: "主键"
      - name: "DHCBCI_INVDR"
        piece: 1
        description: "发票指针 -> User.DHCINVPRT"
      - name: "DHCBCI_PatBillDR"
        piece: 2
        description: "账单指针 -> User.DHCPatientBill"
      - name: "DHCBCI_ADMDR"
        piece: 3
        description: "就诊指针 -> User.PAAdm"

  - name: "User.CTPayMode"
    description: "支付方式字典"
    global: "^CT(\"PMT\",payModeId)"
    structure: "$p()格式"

  - name: "User.CMCBankMas"
    description: "银行字典"
    global: "^CMC(\"BANK\",bankId)"
    structure: "$p()格式"

# 相关字典类
relatedDicts:
  - name: "User.CTPayMode"
    global: "^CT(\"PMT\",RowId)"
    description: "支付方式"
  - name: "User.CMCBankMas"
    global: "^CMC(\"BANK\",RowId)"
    description: "银行"
  - name: "User.PAPatMas"
    global: "^PAPER(RowId)"
    description: "患者主索引"
  - name: "User.SSUser"
    global: "^SSU(\"SSUSR\",RowId)"
    description: "系统用户"

# 数据源遍历配置（供代码生成器使用）
# 业务链路：发票表^DHCINVPRT → 支付方式子表
traversal:
  type: "DHCINVPRT"
  viewMatchers: ["invoice", "发票", "payment_method", "支付方式"]
  inputParam:
    name: "pDateFrom"
    type: "%String"
    description: "开始日期"
  preVariables: []
  index:
    global: "^DHCINVPRT"
    name: "Date"
    keys: ["date", "prtRowId"]
    expression: '$o(^DHCINVPRT(0,"Date",date,prtRowId))'
  data:
    global: "^DHCINVPRT"
    variable: "prtData"
    format: "p"
    expression: "$g(^DHCINVPRT(prtRowId))"
  template: |
    f date=pDateFrom:1:pDateTo d
    .s prtRowId=""
    .f  s prtRowId=$o(^DHCINVPRT(0,"Date",date,prtRowId)) q:prtRowId=""  d
    ..s prtData=$g(^DHCINVPRT(prtRowId))
    ..i (prtData="") q
    ..s prtFlag=$p(prtData,"^",6)
    ..continue:prtFlag'="N"  ; 只取正常状态(N=Normal)
    ..s adm=$p(prtData,"^",44)  ; 就诊ID
    ..s sub=""
    ..f  s sub=$o(^DHCINVPRT(prtRowId,"P",sub)) q:sub=""  d
    ...s payData=$g(^DHCINVPRT(prtRowId,"P",sub))

# 支付方式子表遍历配置
subTraversal:
  type: "DHCINVPayMode"
  parentRef: "prtRowId"
  index:
    global: "^DHCINVPRT"
    keys: ["prtRowId", "sub"]
    expression: '$o(^DHCINVPRT(prtRowId,"P",sub))'
  data:
    global: "^DHCINVPRT(prtRowId,\"P\",sub)"
    variable: "payData"
    format: "p"
    expression: '$g(^DHCINVPRT(prtRowId,"P",sub))'
  template: |
    s sub=""
    f  s sub=$o(^DHCINVPRT(prtRowId,"P",sub)) q:sub=""  d
    .s payData=$g(^DHCINVPRT(prtRowId,"P",sub))
    .i (payData="") q

totalRules: 35
lastUpdated: "2026-05-30"
---

# 门诊发票/支付方式域 (A1-outpatient-invoice)

> DHCINVPRT发票主表 | DHCINVPayMode支付方式子表 | DHCBillConINV票据连接中间表 | $p()格式

## 架构总览

```
                    ┌─────────────────────┐
                    │   User.PAAdm        │
                    │   (就诊表)           │
                    │   ^PAADM(admRowId)  │
                    └──────────┬──────────┘
                               │
                               │ DHCBCI_ADMDR
                               │
┌─────────────────────┐        │        ┌─────────────────────┐
│ User.DHCINVPRT      │◄───────┼───────►│ User.DHCPatientBill │
│ (门诊发票表)         │        │        │ (患者账单表)         │
│ ^DHCINVPRT(prtRowId)│  DHCBCI_INVDR   │ ^DHCPB(pbId)        │
└─────────────────────┘        │        └─────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │ User.DHCBillConINV  │
                    │ (票据连接中间表)     │
                    │ ^DHCBCI(bciRowId)   │
                    └─────────────────────┘

发票支付方式子表:
^DHCINVPRT(prtRowId)  ← 发票主表 (49个字段)
    |
    +-- ^DHCINVPRT(prtRowId,"P",sub)  ← 支付方式子表 (17个字段)
            |
            +-- IPM_PayMode_DR → ^CT("PMT",payModeId)  ← 支付方式字典
            +-- IPM_CMBank_DR → ^CMC("BANK",bankId)     ← 银行字典
```

## 关联关系

```
User.DHCINVPRT (门诊发票主表)
  ^DHCINVPRT(prtRowId) — $p()格式，49个字段
     ├── ^2: PRT_Acount          (金额)
     ├── ^4: PRT_Date            (收费日期, H格式)
     ├── ^6: PRT_Flag            (状态: N=正常/A=作废/S=冲红/TP=已付)
     ├── ^11: PRT_inv            (发票号)
     ├── ^12: PRT_PAPMI_DR       → ^PAPER(patDR)        # 患者指针
     ├── ^14: PRT_Time           (收费时间, 秒数)
     ├── ^15: PRT_Usr            → ^SSU("SSUSR",userId)  # 操作员
     ├── ^19: PRT_PayorShare     (医保支付)
     ├── ^20: PRT_DiscAmount     (折扣金额)
     ├── ^21: PRT_PatientShare   (患者自付)
     └── ^40: PRT_Hospital_DR    → ^CT("HOSP",hospId)    # 医院

  ^DHCINVPRT(prtRowId,"P",sub) — 支付方式子表，$p()格式
     ├── ^2: IPM_Sub             (子表行号)
     ├── ^3: IPM_PayMode_DR      → ^CT("PMT",payModeId)  # 支付方式
     ├── ^4: IPM_CMBank_DR       → ^CMC("BANK",bankId)    # 银行
     ├── ^5: IPM_Amt             (支付金额)
     ├── ^6: IPM_CardChequeNo    (卡号/支票号)
     ├── ^7: IPM_Card_DR         → ^ARC("CARD",cardId)    # 银行卡类型
     ├── ^8: IPM_Date            (支付日期)
     ├── ^9: IPM_Time            (支付时间)
     └── ^12: IPM_PayAccNO       (支付账号)
```

## 规则列表

#### INVOICE_ID

| 属性 | 值 |
|------|-----|
| 标准名 | `invoiceId` |
| 匹配模式 | invoiceId, invoice_id, 发票ID |
| 取值表达式 | `prtRowId` |
| Global | `^DHCINVPRT` |
| 置信度 | 0.95 |

**说明**：发票主表RowId

```objectscript
s invoice_id = prtRowId
```

#### INVOICE_NO

| 属性 | 值 |
|------|-----|
| 标准名 | `invoiceNo` |
| 匹配模式 | invoiceNo, invoice_no, 发票号 |
| 取值表达式 | `$p(prtData,"^",11)` |
| Global | `^DHCINVPRT` |
| 置信度 | 0.95 |

**说明**：PRT_inv 发票号

```objectscript
s invoice_no = $p(prtData,"^",11)
```

#### INVOICE_AMOUNT

| 属性 | 值 |
|------|-----|
| 标准名 | `invoiceAmount` |
| 匹配模式 | invoiceAmount, invoice_amount, 发票金额 |
| 取值表达式 | `$p(prtData,"^",2)` |
| Global | `^DHCINVPRT` |
| 置信度 | 0.95 |

**说明**：PRT_Acount 发票金额

```objectscript
s invoice_amount = $p(prtData,"^",2)
```

#### INVOICE_DATE

| 属性 | 值 |
|------|-----|
| 标准名 | `invoiceDate` |
| 匹配模式 | invoiceDate, invoice_date, 收费日期 |
| 取值表达式 | `$zd($p(prtData,"^",4),3)` |
| Global | `^DHCINVPRT` |
| 置信度 | 0.95 |

**说明**：PRT_Date 收费日期

```objectscript
s invoice_date = $zd($p(prtData,"^",4),3)
```

#### INVOICE_TIME

| 属性 | 值 |
|------|-----|
| 标准名 | `invoiceTime` |
| 匹配模式 | invoiceTime, invoice_time, 收费时间 |
| 取值表达式 | `$zt($p(prtData,"^",14))` |
| Global | `^DHCINVPRT` |
| 置信度 | 0.95 |

**说明**：PRT_Time 收费时间

```objectscript
s invoice_time = $zt($p(prtData,"^",14))
```

#### INVOICE_FLAG

| 属性 | 值 |
|------|-----|
| 标准名 | `invoiceFlag` |
| 匹配模式 | invoiceFlag, invoice_flag, 发票状态 |
| 取值表达式 | `$p(prtData,"^",6)` |
| Global | `^DHCINVPRT` |
| 置信度 | 0.95 |
| 值域 | N=正常, A=作废, S=冲红, TP=已付 |

**说明**：PRT_Flag 发票状态

```objectscript
s invoice_flag = $p(prtData,"^",6)
```

#### PATIENT_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `patientDR` |
| 匹配模式 | patientDR, patDR, 患者DR |
| 取值表达式 | `$p(prtData,"^",12)` |
| Global | `^DHCINVPRT` |
| 置信度 | 0.95 |

**说明**：PRT_PAPMI_DR 患者指针

```objectscript
s patDR = $p(prtData,"^",12)
```

#### PATIENT_SHARE

| 属性 | 值 |
|------|-----|
| 标准名 | `patientShare` |
| 匹配模式 | patientShare, patient_share, 患者自付 |
| 取值表达式 | `$p(prtData,"^",21)` |
| Global | `^DHCINVPRT` |
| 置信度 | 0.95 |

**说明**：PRT_PatientShare 患者自付金额

```objectscript
s patient_share = $p(prtData,"^",21)
```

#### PAYOR_SHARE

| 属性 | 值 |
|------|-----|
| 标准名 | `payorShare` |
| 匹配模式 | payorShare, payor_share, 医保支付 |
| 取值表达式 | `$p(prtData,"^",19)` |
| Global | `^DHCINVPRT` |
| 置信度 | 0.95 |

**说明**：PRT_PayorShare 医保支付金额

```objectscript
s payor_share = $p(prtData,"^",19)
```

#### DISC_AMOUNT

| 属性 | 值 |
|------|-----|
| 标准名 | `discAmount` |
| 匹配模式 | discAmount, disc_amount, 折扣金额 |
| 取值表达式 | `$p(prtData,"^",20)` |
| Global | `^DHCINVPRT` |
| 置信度 | 0.95 |

**说明**：PRT_DiscAmount 折扣金额

```objectscript
s disc_amount = $p(prtData,"^",20)
```

#### OPERATOR_ID

| 属性 | 值 |
|------|-----|
| 标准名 | `operatorId` |
| 匹配模式 | operatorId, operator_id, 操作员ID |
| 取值表达式 | `$p(prtData,"^",15)` |
| Global | `^DHCINVPRT` |
| 置信度 | 0.95 |

**说明**：PRT_Usr 操作员指针

```objectscript
s operator_id = $p(prtData,"^",15)
```

#### OPERATOR_NAME

| 属性 | 值 |
|------|-----|
| 标准名 | `operatorName` |
| 匹配模式 | operatorName, operator_name, 操作员姓名 |
| 取值表达式 | `$p($g(^SSU("SSUSR",$p(prtData,"^",15))),"^",2)` |
| Global | `^SSU` |
| 置信度 | 0.90 |

**说明**：通过操作员DR关联SSUser表获取姓名

```objectscript
s operator_name = $p($g(^SSU("SSUSR",$p(prtData,"^",15))),"^",2)
```

#### PAY_MODE_ID

| 属性 | 值 |
|------|-----|
| 标准名 | `payModeId` |
| 匹配模式 | payModeId, pay_mode_id, 支付方式ID |
| 取值表达式 | `$p(payData,"^",3)` |
| Global | `^DHCINVPRT(prtRowId,"P",sub)` |
| 置信度 | 0.95 |

**说明**：IPM_PayMode_DR 支付方式指针

```objectscript
s pay_mode_id = $p(payData,"^",3)
```

#### PAY_MODE_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `payModeCode` |
| 匹配模式 | payModeCode, pay_mode_code, 支付方式代码 |
| 取值表达式 | `$p($g(^CT("PMT",$p(payData,"^",3))),"^",1)` |
| Global | `^CT("PMT")` |
| 置信度 | 0.90 |

**说明**：通过支付方式DR关联CTPayMode字典获取代码

```objectscript
s pay_mode_code = $p($g(^CT("PMT",$p(payData,"^",3))),"^",1)
```

#### PAY_MODE_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `payModeDesc` |
| 匹配模式 | payModeDesc, pay_mode_desc, 支付方式名称 |
| 取值表达式 | `$p($g(^CT("PMT",$p(payData,"^",3))),"^",2)` |
| Global | `^CT("PMT")` |
| 置信度 | 0.90 |

**说明**：通过支付方式DR关联CTPayMode字典获取描述

```objectscript
s pay_mode_desc = $p($g(^CT("PMT",$p(payData,"^",3))),"^",2)
```

#### PAY_AMOUNT

| 属性 | 值 |
|------|-----|
| 标准名 | `payAmount` |
| 匹配模式 | payAmount, pay_amount, 支付金额 |
| 取值表达式 | `$p(payData,"^",5)` |
| Global | `^DHCINVPRT(prtRowId,"P",sub)` |
| 置信度 | 0.95 |

**说明**：IPM_Amt 支付金额

```objectscript
s pay_amount = $p(payData,"^",5)
```

#### PAY_CARD_NO

| 属性 | 值 |
|------|-----|
| 标准名 | `payCardNo` |
| 匹配模式 | payCardNo, pay_card_no, 卡号/支票号 |
| 取值表达式 | `$p(payData,"^",6)` |
| Global | `^DHCINVPRT(prtRowId,"P",sub)` |
| 置信度 | 0.90 |

**说明**：IPM_CardChequeNo 卡号或支票号

```objectscript
s pay_card_no = $p(payData,"^",6)
```

#### PAY_DATE

| 属性 | 值 |
|------|-----|
| 标准名 | `payDate` |
| 匹配模式 | payDate, pay_date, 支付日期 |
| 取值表达式 | `$zd($p(payData,"^",8),3)` |
| Global | `^DHCINVPRT(prtRowId,"P",sub)` |
| 置信度 | 0.95 |

**说明**：IPM_Date 支付日期

```objectscript
s pay_date = $zd($p(payData,"^",8),3)
```

#### PAY_TIME

| 属性 | 值 |
|------|-----|
| 标准名 | `payTime` |
| 匹配模式 | payTime, pay_time, 支付时间 |
| 取值表达式 | `$zt($p(payData,"^",9))` |
| Global | `^DHCINVPRT(prtRowId,"P",sub)` |
| 置信度 | 0.95 |

**说明**：IPM_Time 支付时间

```objectscript
s pay_time = $zt($p(payData,"^",9))
```

#### BANK_NAME

| 属性 | 值 |
|------|-----|
| 标准名 | `bankName` |
| 匹配模式 | bankName, bank_name, 银行名称 |
| 取值表达式 | `$p($g(^CMC("BANK",$p(payData,"^",4))),"^",2)` |
| Global | `^CMC("BANK")` |
| 置信度 | 0.90 |

**说明**：通过银行DR关联CMCBankMas字典获取银行名称

```objectscript
s bank_name = $p($g(^CMC("BANK",$p(payData,"^",4))),"^",2)
```

#### PAY_ACCOUNT_NO

| 属性 | 值 |
|------|-----|
| 标准名 | `payAccountNo` |
| 匹配模式 | payAccountNo, pay_account_no, 支付账号 |
| 取值表达式 | `$p(payData,"^",12)` |
| Global | `^DHCINVPRT(prtRowId,"P",sub)` |
| 置信度 | 0.90 |

**说明**：IPM_PayAccNO 支付账号

```objectscript
s pay_account_no = $p(payData,"^",12)
```

#### BCI_ROW_ID

| 属性 | 值 |
|------|-----|
| 标准名 | `bciRowId` |
| 匹配模式 | bciRowId, bci_row_id, 票据连接ID |
| 取值表达式 | `bciRowId` |
| Global | `^DHCBCI` |
| 置信度 | 0.95 |

**说明**：票据连接中间表主键

```objectscript
s bci_row_id = bciRowId
```

#### BCI_INV_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `bciInvDR` |
| 匹配模式 | bciInvDR, bci_inv_dr, 发票指针 |
| 取值表达式 | `$p(bciData,"^",1)` |
| Global | `^DHCBCI` |
| 置信度 | 0.95 |

**说明**：DHCBCI_INVDR 发票指针 -> User.DHCINVPRT

```objectscript
s bci_inv_dr = $p(bciData,"^",1)
```

#### BCI_PAT_BILL_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `bciPatBillDR` |
| 匹配模式 | bciPatBillDR, bci_pat_bill_dr, 账单指针 |
| 取值表达式 | `$p(bciData,"^",2)` |
| Global | `^DHCBCI` |
| 置信度 | 0.95 |

**说明**：DHCBCI_PatBillDR 账单指针 -> User.DHCPatientBill

```objectscript
s bci_pat_bill_dr = $p(bciData,"^",2)
```

#### BCI_ADM_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `bciAdmDR` |
| 匹配模式 | bciAdmDR, bci_adm_dr, 就诊指针 |
| 取值表达式 | `$p(bciData,"^",3)` |
| Global | `^DHCBCI` |
| 置信度 | 0.95 |

**说明**：DHCBCI_ADMDR 就诊指针 -> User.PAAdm

```objectscript
s bci_adm_dr = $p(bciData,"^",3)
```

#### BILL_ID (通过票据连接表)

| 属性 | 值 |
|------|-----|
| 标准名 | `billId` |
| 匹配模式 | billId, bill_id, 账单ID |
| 取值表达式 | `$p(bciData,"^",2)` |
| Global | `^DHCBCI` |
| 置信度 | 0.90 |

**说明**：通过票据连接中间表获取关联的账单ID

```objectscript
s bill_id = $p(bciData,"^",2)
```

#### INVOICE_ID_FROM_BILL (通过票据连接表)

| 属性 | 值 |
|------|-----|
| 标准名 | `invoiceIdFromBill` |
| 匹配模式 | invoiceIdFromBill, invoice_id_from_bill, 账单关联发票ID |
| 取值表达式 | `$p(bciData,"^",1)` |
| Global | `^DHCBCI` |
| 置信度 | 0.90 |

**说明**：通过票据连接中间表从账单获取关联的发票ID

```objectscript
s invoice_id_from_bill = $p(bciData,"^",1)
```

## 使用示例

### 按日期遍历发票

```objectscript
s date=pDate-1
f  s date=$o(^DHCINVPRT(0,"Date",date)) q:date=""!(date>pDateTo)  d
.s prtRowId=""
.f  s prtRowId=$o(^DHCINVPRT(0,"Date",date,prtRowId)) q:prtRowId=""  d
..s prtData=$g(^DHCINVPRT(prtRowId))
..i (prtData="") q
..s prtFlag=$p(prtData,"^",6)
..i prtFlag'="N" q  ; 只取正常状态
```

### 遍历支付方式子表

```objectscript
s sub=""
f  s sub=$o(^DHCINVPRT(prtRowId,"P",sub)) q:sub=""  d
.s payData=$g(^DHCINVPRT(prtRowId,"P",sub))
.i (payData="") q
.s payModeDR=$p(payData,"^",3)
.s payModeDesc=$p($g(^CT("PMT",payModeDR)),"^",2)
```

### 从发票查关联账单 (通过票据连接表)

```objectscript
// 已知发票ID(prtRowId)，查关联的账单
s bciRowId=""
f  s bciRowId=$o(^DHCBCI(0,"INV",prtRowId,bciRowId)) q:bciRowId=""  d
.s bciData=$g(^DHCBCI(bciRowId))
.i (bciData="") q
.s patBillDR=$p(bciData,"^",2)  ; 账单指针
.s pbData=$g(^DHCPB(patBillDR))
.i (pbData="") q
.s totalFee=$p(pbData,"^",8)    ; 账单总费用
```

### 从账单查关联发票 (通过票据连接表)

```objectscript
// 已知账单ID(pbId)，查关联的发票
s bciRowId=""
f  s bciRowId=$o(^DHCBCI(0,"Bill",pbId,bciRowId)) q:bciRowId=""  d
.s bciData=$g(^DHCBCI(bciRowId))
.i (bciData="") q
.s invDR=$p(bciData,"^",1)      ; 发票指针
.s prtData=$g(^DHCINVPRT(invDR))
.i (prtData="") q
.s invoiceNo=$p(prtData,"^",11) ; 发票号
.s invoiceAmt=$p(prtData,"^",2) ; 发票金额
```

### 从就诊查所有发票和账单 (通过票据连接表)

```objectscript
// 已知就诊ID(admRowId)，查所有发票和账单
s bciRowId=""
f  s bciRowId=$o(^DHCBCI(0,"ADM",admRowId,bciRowId)) q:bciRowId=""  d
.s bciData=$g(^DHCBCI(bciRowId))
.i (bciData="") q
.s invDR=$p(bciData,"^",1)      ; 发票指针
.s patBillDR=$p(bciData,"^",2)  ; 账单指针
.s prtData=$g(^DHCINVPRT(invDR))
.s pbData=$g(^DHCPB(patBillDR))
```
