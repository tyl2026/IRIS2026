---
domain: "a2-insurance"
name: "医保域"
version: "1.0.0"
description: "HIS医保取值规则集.基于^DHCINADM医保就诊登记+^DHCINDIV医保费用分解. 42条规则."

# 实体表类（数据存储结构来源）
entityClasses:
  - name: "User.INSUAdmInfo"
    description: "医保就诊登记信息表"
    global: "^DHCINADM"
    primaryKey: "INADM_Rowid"
    sqlTableName: "INSU_AdmInfo"
    indexes:
      - name: "ADM"
        description: "按就诊ID查询"
        indexGlobal: '^DHCINADM(0,"ADM",admDr,inadmRowId)'
      - name: "ADMDate"
        description: "按登记日期查询"
        indexGlobal: '^DHCINADM(0,"ADMDate",date,inadmRowId)'
      - name: "CardNo"
        description: "按医保卡号查询"
        indexGlobal: '^DHCINADM(0,"CardNo",cardNo,inadmRowId)'
      - name: "AdmSeriNo"
        description: "按就诊序列号查询"
        indexGlobal: '^DHCINADM(0,"AdmSeriNo",seriNo,inadmRowId)'
    structure: "$p()格式"
    keyFields:
      - piece: 1
        name: "INADM_AdmDr"
        description: "就诊指针 -> User.PAAdm"
      - piece: 2
        name: "INADM_InsuId"
        description: "医保ID"
      - piece: 3
        name: "INADM_CardNo"
        description: "医保卡号"
      - piece: 4
        name: "INADM_PatType"
        description: "患者类型"
      - piece: 5
        name: "INADM_CardStatus"
        description: "卡状态"
      - piece: 10
        name: "INADM_AdmSeriNo"
        description: "就诊序列号"
      - piece: 11
        name: "INADM_ActiveFlag"
        description: "有效标志"
      - piece: 12
        name: "INADM_AdmDate"
        description: "登记日期"
      - piece: 13
        name: "INADM_AdmTime"
        description: "登记时间"
      - piece: 14
        name: "INADM_AdmType"
        description: "就诊类型"
      - piece: 15
        name: "INADM_DeptDesc"
        description: "科室描述"
      - piece: 18
        name: "INADM_InsuType"
        description: "医保类型"

  - name: "User.INSUDivide"
    description: "医保费用分解表"
    global: "^DHCINDIV"
    primaryKey: "INPAY_Rowid"
    sqlTableName: "INSU_Divide"
    indexes:
      - name: "Adm"
        description: "按就诊ID查询"
        indexGlobal: '^DHCINDIV(0,"Paadm",admDr,indivRowId)'
    structure: "$p()格式"
    keyFields:
      - piece: 1
        name: "INPAY_AdmDr"
        description: "就诊指针 -> User.PAAdm"
      - piece: 2
        name: "INPAY_AdmInfoDr"
        description: "医保登记指针 -> User.INSUAdmInfo"
      - piece: 3
        name: "INPAY_DHCpblDr"
        description: "账单指针 -> User.DHCPatientBill"
      - piece: 4
        name: "INPAY_DhcInvPrtDr"
        description: "发票指针(字符串) -> User.DHCINVPRT"
      - piece: 5
        name: "INPAY_Flag"
        description: "状态标志"
      - piece: 7
        name: "INPAY_INSUDivideDr"
        description: "医保分解指针(自关联)"
      - piece: 8
        name: "INPAY_bcbxf0"
        description: "本次报销金额"
      - piece: 9
        name: "INPAY_djlsh0"
        description: "单据流水号"
      - piece: 15
        name: "INPAY_grzfe0"
        description: "个人自付金额"
      - piece: 16
        name: "INPAY_iDate"
        description: "结算日期"
      - piece: 17
        name: "INPAY_iTime"
        description: "结算时间"
      - piece: 19
        name: "INPAY_jjzfe0"
        description: "基金支付金额"
      - piece: 28
        name: "INPAY_zhzfe0"
        description: "账户支付金额"
      - piece: 31
        name: "INPAY_InsuPay1"
        description: "医保支付1(统筹)"
      - piece: 32
        name: "INPAY_InsuPay2"
        description: "医保支付2(大病)"
      - piece: 33
        name: "INPAY_InsuPay3"
        description: "医保支付3(救助)"
      - piece: 34
        name: "INPAY_InsuPay4"
        description: "医保支付4"
      - piece: 35
        name: "INPAY_InsuPay5"
        description: "医保支付5"

# 相关字典类
relatedDicts:
  - name: "User.PAAdm"
    global: "^PAADM(RowId)"
    description: "就诊表"
  - name: "User.DHCPatientBill"
    global: "^DHCPB(RowId)"
    description: "患者账单表"
  - name: "User.DHCINVPRT"
    global: "^DHCINVPRT(RowId)"
    description: "门诊发票表"

# 数据源遍历配置（供代码生成器使用）
traversal:
  type: "INSUAdmInfo"
  viewMatchers: ["insurance", "医保"]
  inputParam:
    name: "admRowId"
    type: "%String"
    description: "就诊ID"
  preVariables: []
  index:
    global: "^DHCINADM"
    name: "ADM"
    keys: ["admDr", "inadmRowId"]
    expression: '$o(^DHCINADM(0,"ADM",admDr,inadmRowId))'
  data:
    global: "^DHCINADM"
    variable: "inadmData"
    format: "p"
    expression: "$g(^DHCINADM(inadmRowId))"
  template: |
    s inadmRowId=""
    f  s inadmRowId=$o(^DHCINADM(0,"ADM",admRowId,inadmRowId)) q:inadmRowId=""  d
    .s inadmData=$g(^DHCINADM(inadmRowId))
    .i (inadmData="") q

# 医保费用分解遍历配置
divideTraversal:
  type: "INSUDivide"
  inputParam:
    name: "admRowId"
    type: "%String"
    description: "就诊ID"
  index:
    global: "^DHCINDIV"
    name: "Adm"
    keys: ["admDr", "indivRowId"]
    expression: '$o(^DHCINDIV(0,"Paadm",admDr,indivRowId))'
  data:
    global: "^DHCINDIV"
    variable: "indivData"
    format: "p"
    expression: "$g(^DHCINDIV(indivRowId))"
  template: |
    s indivRowId=""
    f  s indivRowId=$o(^DHCINDIV(0,"Paadm",admRowId,indivRowId)) q:indivRowId=""  d
    .s indivData=$g(^DHCINDIV(indivRowId))
    .i (indivData="") q

totalRules: 42
lastUpdated: "2026-05-30"
---

# 医保域 (A2-insurance)

> INSUAdmInfo医保就诊登记 | INSUDivide医保费用分解 | $p()格式

## 架构总览

```
┌─────────────────────────────────────────────────────────────────┐
│                      User.PAAdm (就诊表)                        │
│                      ^PAADM(admRowId)                          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
           ┌────────────────┼────────────────┐
           │                │                │
           ▼                ▼                ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ User.INSUAdmInfo │ │ User.INSUDivide  │ │ User.DHCPB       │
│ (医保就诊登记)    │ │ (医保费用分解)    │ │ (患者账单)       │
│ ^DHCINADM        │ │ ^DHCINDIV        │ │ ^DHCPB           │
└────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘
         │                    │                    │
         │    INPAY_AdmInfoDr │                    │
         └────────────────────┤                    │
                              │                    │
                              │  INPAY_DHCpblDr    │
                              ├────────────────────┘
                              │
                              │  INPAY_DhcInvPrtDr
                              ▼
                    ┌──────────────────┐
                    │ User.DHCINVPRT   │
                    │ (门诊发票表)      │
                    │ ^DHCINVPRT       │
                    └──────────────────┘
```

## 关联关系

### User.INSUAdmInfo (医保就诊登记信息表)
```
^DHCINADM(inadmRowId) — $p()格式，52个字段
   ├── ^1: INADM_AdmDr          → ^PAADM(admRowId)        # 就诊指针
   ├── ^2: INADM_InsuId         (医保ID)
   ├── ^3: INADM_CardNo         (医保卡号)
   ├── ^4: INADM_PatType        (患者类型)
   ├── ^5: INADM_CardStatus     (卡状态)
   ├── ^10: INADM_AdmSeriNo     (就诊序列号)
   ├── ^11: INADM_ActiveFlag    (有效标志)
   ├── ^12: INADM_AdmDate       (登记日期)
   ├── ^13: INADM_AdmTime       (登记时间)
   ├── ^14: INADM_AdmType       (就诊类型)
   ├── ^15: INADM_DeptDesc      (科室描述)
   └── ^18: INADM_InsuType      (医保类型)
```

### User.INSUDivide (医保费用分解表)
```
^DHCINDIV(indivRowId) — $p()格式，71个字段
   ├── ^1: INPAY_AdmDr          → ^PAADM(admRowId)        # 就诊指针
   ├── ^2: INPAY_AdmInfoDr      → ^DHCINADM(inadmRowId)   # 医保登记指针
   ├── ^3: INPAY_DHCpblDr       → ^DHCPB(pbId)            # 账单指针
   ├── ^4: INPAY_DhcInvPrtDr    → ^DHCINVPRT(prtRowId)    # 发票指针(字符串)
   ├── ^5: INPAY_Flag           (状态标志)
   ├── ^8: INPAY_bcbxf0         (本次报销金额)
   ├── ^9: INPAY_djlsh0         (单据流水号)
   ├── ^15: INPAY_grzfe0        (个人自付金额)
   ├── ^16: INPAY_iDate         (结算日期)
   ├── ^17: INPAY_iTime         (结算时间)
   ├── ^19: INPAY_jjzfe0        (基金支付金额)
   ├── ^28: INPAY_zhzfe0        (账户支付金额)
   ├── ^31: INPAY_InsuPay1      (医保支付1-统筹)
   ├── ^32: INPAY_InsuPay2      (医保支付2-大病)
   ├── ^33: INPAY_InsuPay3      (医保支付3-救助)
   ├── ^34: INPAY_InsuPay4      (医保支付4)
   └── ^35: INPAY_InsuPay5      (医保支付5)
```

## 规则列表

#### INSU_ADM_ROW_ID

| 属性 | 值 |
|------|-----|
| 标准名 | `insuAdmRowId` |
| 匹配模式 | insuAdmRowId, insu_adm_row_id, 医保登记ID |
| 取值表达式 | `inadmRowId` |
| Global | `^DHCINADM` |
| 置信度 | 0.95 |

**说明**：医保就诊登记主键

```objectscript
s insu_adm_row_id = inadmRowId
```

#### INSU_ID

| 属性 | 值 |
|------|-----|
| 标准名 | `insuId` |
| 匹配模式 | insuId, insu_id, 医保ID |
| 取值表达式 | `$p(inadmData,"^",2)` |
| Global | `^DHCINADM` |
| 置信度 | 0.95 |

**说明**：INADM_InsuId 医保ID

```objectscript
s insu_id = $p(inadmData,"^",2)
```

#### INSU_CARD_NO

| 属性 | 值 |
|------|-----|
| 标准名 | `insuCardNo` |
| 匹配模式 | insuCardNo, insu_card_no, 医保卡号 |
| 取值表达式 | `$p(inadmData,"^",3)` |
| Global | `^DHCINADM` |
| 置信度 | 0.95 |

**说明**：INADM_CardNo 医保卡号

```objectscript
s insu_card_no = $p(inadmData,"^",3)
```

#### INSU_PAT_TYPE

| 属性 | 值 |
|------|-----|
| 标准名 | `insuPatType` |
| 匹配模式 | insuPatType, insu_pat_type, 医保患者类型 |
| 取值表达式 | `$p(inadmData,"^",4)` |
| Global | `^DHCINADM` |
| 置信度 | 0.90 |

**说明**：INADM_PatType 患者类型

```objectscript
s insu_pat_type = $p(inadmData,"^",4)
```

#### INSU_CARD_STATUS

| 属性 | 值 |
|------|-----|
| 标准名 | `insuCardStatus` |
| 匹配模式 | insuCardStatus, insu_card_status, 医保卡状态 |
| 取值表达式 | `$p(inadmData,"^",5)` |
| Global | `^DHCINADM` |
| 置信度 | 0.90 |

**说明**：INADM_CardStatus 卡状态

```objectscript
s insu_card_status = $p(inadmData,"^",5)
```

#### INSU_ADM_SERI_NO

| 属性 | 值 |
|------|-----|
| 标准名 | `insuAdmSeriNo` |
| 匹配模式 | insuAdmSeriNo, insu_adm_seri_no, 医保就诊序列号 |
| 取值表达式 | `$p(inadmData,"^",10)` |
| Global | `^DHCINADM` |
| 置信度 | 0.95 |

**说明**：INADM_AdmSeriNo 就诊序列号

```objectscript
s insu_adm_seri_no = $p(inadmData,"^",10)
```

#### INSU_ACTIVE_FLAG

| 属性 | 值 |
|------|-----|
| 标准名 | `insuActiveFlag` |
| 匹配模式 | insuActiveFlag, insu_active_flag, 医保有效标志 |
| 取值表达式 | `$p(inadmData,"^",11)` |
| Global | `^DHCINADM` |
| 置信度 | 0.90 |

**说明**：INADM_ActiveFlag 有效标志

```objectscript
s insu_active_flag = $p(inadmData,"^",11)
```

#### INSU_ADM_DATE

| 属性 | 值 |
|------|-----|
| 标准名 | `insuAdmDate` |
| 匹配模式 | insuAdmDate, insu_adm_date, 医保登记日期 |
| 取值表达式 | `$zd($p(inadmData,"^",12),3)` |
| Global | `^DHCINADM` |
| 置信度 | 0.95 |

**说明**：INADM_AdmDate 登记日期

```objectscript
s insu_adm_date = $zd($p(inadmData,"^",12),3)
```

#### INSU_ADM_TIME

| 属性 | 值 |
|------|-----|
| 标准名 | `insuAdmTime` |
| 匹配模式 | insuAdmTime, insu_adm_time, 医保登记时间 |
| 取值表达式 | `$zt($p(inadmData,"^",13))` |
| Global | `^DHCINADM` |
| 置信度 | 0.95 |

**说明**：INADM_AdmTime 登记时间

```objectscript
s insu_adm_time = $zt($p(inadmData,"^",13))
```

#### INSU_ADM_TYPE

| 属性 | 值 |
|------|-----|
| 标准名 | `insuAdmType` |
| 匹配模式 | insuAdmType, insu_adm_type, 医保就诊类型 |
| 取值表达式 | `$p(inadmData,"^",14)` |
| Global | `^DHCINADM` |
| 置信度 | 0.90 |

**说明**：INADM_AdmType 就诊类型

```objectscript
s insu_adm_type = $p(inadmData,"^",14)
```

#### INSU_TYPE

| 属性 | 值 |
|------|-----|
| 标准名 | `insuType` |
| 匹配模式 | insuType, insu_type, 医保类型 |
| 取值表达式 | `$p(inadmData,"^",18)` |
| Global | `^DHCINADM` |
| 置信度 | 0.95 |

**说明**：INADM_InsuType 医保类型

```objectscript
s insu_type = $p(inadmData,"^",18)
```

#### INSU_DIV_ROW_ID

| 属性 | 值 |
|------|-----|
| 标准名 | `insuDivRowId` |
| 匹配模式 | insuDivRowId, insu_div_row_id, 医保分解ID |
| 取值表达式 | `indivRowId` |
| Global | `^DHCINDIV` |
| 置信度 | 0.95 |

**说明**：医保费用分解主键

```objectscript
s insu_div_row_id = indivRowId
```

#### INSU_DIV_ADM_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `insuDivAdmDR` |
| 匹配模式 | insuDivAdmDR, insu_div_adm_dr, 医保分解就诊指针 |
| 取值表达式 | `$p(indivData,"^",1)` |
| Global | `^DHCINDIV` |
| 置信度 | 0.95 |

**说明**：INPAY_AdmDr 就诊指针

```objectscript
s insu_div_adm_dr = $p(indivData,"^",1)
```

#### INSU_DIV_ADM_INFO_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `insuDivAdmInfoDR` |
| 匹配模式 | insuDivAdmInfoDR, insu_div_adm_info_dr, 医保登记指针 |
| 取值表达式 | `$p(indivData,"^",2)` |
| Global | `^DHCINDIV` |
| 置信度 | 0.95 |

**说明**：INPAY_AdmInfoDr 医保登记指针 -> User.INSUAdmInfo

```objectscript
s insu_div_adm_info_dr = $p(indivData,"^",2)
```

#### INSU_DIV_PB_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `insuDivPbDR` |
| 匹配模式 | insuDivPbDR, insu_div_pb_dr, 医保分解账单指针 |
| 取值表达式 | `$p(indivData,"^",3)` |
| Global | `^DHCINDIV` |
| 置信度 | 0.95 |

**说明**：INPAY_DHCpblDr 账单指针 -> User.DHCPatientBill

```objectscript
s insu_div_pb_dr = $p(indivData,"^",3)
```

#### INSU_DIV_INV_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `insuDivInvDR` |
| 匹配模式 | insuDivInvDR, insu_div_inv_dr, 医保分解发票指针 |
| 取值表达式 | `$p(indivData,"^",4)` |
| Global | `^DHCINDIV` |
| 置信度 | 0.95 |

**说明**：INPAY_DhcInvPrtDr 发票指针(字符串) -> User.DHCINVPRT

```objectscript
s insu_div_inv_dr = $p(indivData,"^",4)
```

#### INSU_DIV_FLAG

| 属性 | 值 |
|------|-----|
| 标准名 | `insuDivFlag` |
| 匹配模式 | insuDivFlag, insu_div_flag, 医保分解状态 |
| 取值表达式 | `$p(indivData,"^",5)` |
| Global | `^DHCINDIV` |
| 置信度 | 0.90 |

**说明**：INPAY_Flag 状态标志

```objectscript
s insu_div_flag = $p(indivData,"^",5)
```

#### INSU_REIMBURSEMENT_AMOUNT

| 属性 | 值 |
|------|-----|
| 标准名 | `insuReimbursementAmount` |
| 匹配模式 | insuReimbursementAmount, insu_reimbursement_amount, 医保报销金额 |
| 取值表达式 | `$p(indivData,"^",8)` |
| Global | `^DHCINDIV` |
| 置信度 | 0.95 |

**说明**：INPAY_bcbxf0 本次报销金额

```objectscript
s insu_reimbursement_amount = $p(indivData,"^",8)
```

#### INSU_SERIAL_NO

| 属性 | 值 |
|------|-----|
| 标准名 | `insuSerialNo` |
| 匹配模式 | insuSerialNo, insu_serial_no, 医保单据流水号 |
| 取值表达式 | `$p(indivData,"^",9)` |
| Global | `^DHCINDIV` |
| 置信度 | 0.90 |

**说明**：INPAY_djlsh0 单据流水号

```objectscript
s insu_serial_no = $p(indivData,"^",9)
```

#### INSU_SELF_PAY_AMOUNT

| 属性 | 值 |
|------|-----|
| 标准名 | `insuSelfPayAmount` |
| 匹配模式 | insuSelfPayAmount, insu_self_pay_amount, 个人自付金额 |
| 取值表达式 | `$p(indivData,"^",15)` |
| Global | `^DHCINDIV` |
| 置信度 | 0.95 |

**说明**：INPAY_grzfe0 个人自付金额

```objectscript
s insu_self_pay_amount = $p(indivData,"^",15)
```

#### INSU_SETTLE_DATE

| 属性 | 值 |
|------|-----|
| 标准名 | `insuSettleDate` |
| 匹配模式 | insuSettleDate, insu_settle_date, 医保结算日期 |
| 取值表达式 | `$zd($p(indivData,"^",16),3)` |
| Global | `^DHCINDIV` |
| 置信度 | 0.95 |

**说明**：INPAY_iDate 结算日期

```objectscript
s insu_settle_date = $zd($p(indivData,"^",16),3)
```

#### INSU_SETTLE_TIME

| 属性 | 值 |
|------|-----|
| 标准名 | `insuSettleTime` |
| 匹配模式 | insuSettleTime, insu_settle_time, 医保结算时间 |
| 取值表达式 | `$zt($p(indivData,"^",17))` |
| Global | `^DHCINDIV` |
| 置信度 | 0.95 |

**说明**：INPAY_iTime 结算时间

```objectscript
s insu_settle_time = $zt($p(indivData,"^",17))
```

#### INSU_FUND_PAY_AMOUNT

| 属性 | 值 |
|------|-----|
| 标准名 | `insuFundPayAmount` |
| 匹配模式 | insuFundPayAmount, insu_fund_pay_amount, 基金支付金额 |
| 取值表达式 | `$p(indivData,"^",19)` |
| Global | `^DHCINDIV` |
| 置信度 | 0.95 |

**说明**：INPAY_jjzfe0 基金支付金额

```objectscript
s insu_fund_pay_amount = $p(indivData,"^",19)
```

#### INSU_ACCOUNT_PAY_AMOUNT

| 属性 | 值 |
|------|-----|
| 标准名 | `insuAccountPayAmount` |
| 匹配模式 | insuAccountPayAmount, insu_account_pay_amount, 账户支付金额 |
| 取值表达式 | `$p(indivData,"^",28)` |
| Global | `^DHCINDIV` |
| 置信度 | 0.95 |

**说明**：INPAY_zhzfe0 账户支付金额

```objectscript
s insu_account_pay_amount = $p(indivData,"^",28)
```

#### INSU_PAY_1 (统筹支付)

| 属性 | 值 |
|------|-----|
| 标准名 | `insuPay1` |
| 匹配模式 | insuPay1, insu_pay_1, 统筹支付 |
| 取值表达式 | `$p(indivData,"^",31)` |
| Global | `^DHCINDIV` |
| 置信度 | 0.95 |

**说明**：INPAY_InsuPay1 统筹支付金额

```objectscript
s insu_pay_1 = $p(indivData,"^",31)
```

#### INSU_PAY_2 (大病支付)

| 属性 | 值 |
|------|-----|
| 标准名 | `insuPay2` |
| 匹配模式 | insuPay2, insu_pay_2, 大病支付 |
| 取值表达式 | `$p(indivData,"^",32)` |
| Global | `^DHCINDIV` |
| 置信度 | 0.95 |

**说明**：INPAY_InsuPay2 大病支付金额

```objectscript
s insu_pay_2 = $p(indivData,"^",32)
```

#### INSU_PAY_3 (救助支付)

| 属性 | 值 |
|------|-----|
| 标准名 | `insuPay3` |
| 匹配模式 | insuPay3, insu_pay_3, 救助支付 |
| 取值表达式 | `$p(indivData,"^",33)` |
| Global | `^DHCINDIV` |
| 置信度 | 0.95 |

**说明**：INPAY_InsuPay3 救助支付金额

```objectscript
s insu_pay_3 = $p(indivData,"^",33)
```

## 使用示例

### 按就诊ID查询医保登记信息

```objectscript
// 已知就诊ID(admRowId)，查医保登记
s inadmRowId=""
f  s inadmRowId=$o(^DHCINADM(0,"ADM",admRowId,inadmRowId)) q:inadmRowId=""  d
.s inadmData=$g(^DHCINADM(inadmRowId))
.i (inadmData="") q
.s insuId=$p(inadmData,"^",2)         ; 医保ID
.s cardNo=$p(inadmData,"^",3)         ; 医保卡号
.s insuType=$p(inadmData,"^",18)      ; 医保类型
```

### 按就诊ID查询医保费用分解

```objectscript
// 已知就诊ID(admRowId)，查医保费用分解
s indivRowId=""
f  s indivRowId=$o(^DHCINDIV(0,"Paadm",admRowId,indivRowId)) q:indivRowId=""  d
.s indivData=$g(^DHCINDIV(indivRowId))
.i (indivData="") q
.s bcbxf0=$p(indivData,"^",8)         ; 本次报销金额
.s grzfe0=$p(indivData,"^",15)        ; 个人自付
.s jjzfe0=$p(indivData,"^",19)        ; 基金支付
.s zhzfe0=$p(indivData,"^",28)        ; 账户支付
```

### 通过医保分解关联发票和账单

```objectscript
// 从医保分解获取关联的发票和账单
s invDR=$p(indivData,"^",4)           ; 发票指针(字符串)
s pbDR=$p(indivData,"^",3)            ; 账单指针
s inadmDR=$p(indivData,"^",2)         ; 医保登记指针

// 获取发票信息
i invDR'="" d
.s prtData=$g(^DHCINVPRT(invDR))
.s invoiceNo=$p(prtData,"^",11)       ; 发票号
.s invoiceAmt=$p(prtData,"^",2)       ; 发票金额

// 获取账单信息
i pbDR'="" d
.s pbData=$g(^DHCPB(pbDR))
.s totalFee=$p(pbData,"^",8)          ; 账单总费用
```
