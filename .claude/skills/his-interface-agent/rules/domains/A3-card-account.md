---
domain: "A3-card-account"
name: "卡账户域(新增)"
version: "1.0.0"
description: "就诊卡+账户+预交金管理. DHC_CardRef→DHC_AccManager→DHC_AccPreDeposit. 基于MCP iris_doc提取."

entityClasses:
  - name: "User.DHCCardRef"
    description: "就诊卡信息表"
    global: "^DHCCARD(\"CF\",cfId)"
    primaryKey: "CF_RowID"
  - name: "User.DHCAccManager"
    description: "卡账户管理表"
    global: "^DHCACD(\"AccM\",accmId)"
    primaryKey: "AccM_RowID"

relatedDicts:
  - name: "User.DHCCardTypeDef"
    description: "卡类型字典"
  - name: "User.CTHospital"
    global: "^CT(\"HOSP\",RowId)"
    description: "医院"

totalRules: 30
lastUpdated: "2026-05-30"
relatedGlobals:
  - "^DHCCARD(\"CF\",cfId) — 就诊卡主表(^1=账户DR ^2=卡号 ^4=患者DR ^10=有效标志)"
  - "^DHCCARDi(\"CF\",0,\"PAPMIDR\",patDr,cfId) — 按患者查卡索引"
  - "^DHCCARDi(\"CF\",0,\"CardNo\",cardNo,cfId) — 按卡号查卡索引"
  - "^DHCACD(\"AccM\",accmId) — 账户主表(^1=账户号 ^2=患者DR ^8=余额 ^13=状态)"
  - "^DHCACDi(\"AccM\",0,\"PAPMI\",patDr,accmId) — 按患者查账户索引"
  - "^DHCACD(\"AccM\",accmId,\"AccPD\",sub) — 预交金子表"
---

# 卡账户域 (A3-card-account) 取值规则 v1.0.0

> MCP iris_doc 提取 | DHC_CardRef + DHC_AccManager

## 架构总览

```
DHC_CardRef (就诊卡)
    │ ^DHCCARD("CF",cfId)  ^1=账户DR ^2=卡号 ^4=患者DR ^10=有效标志
    │ 索引: ^DHCCARDi("CF",0,"PAPMIDR",patDr,cfId)
    │
    └── DHC_AccManager (账户) [通过 CF_AccNo_DR 关联]
        │ ^DHCACD("AccM",accmId)  ^1=账户号 ^8=余额 ^13=状态
        │ 索引: ^DHCACDi("AccM",0,"PAPMI",patDr,accmId)
        │
        └── DHC_AccPreDeposit (预交金) [子表]
            │ ^DHCACD("AccM",accmId,"AccPD",sub)
```

## CF_ACTIVE_FLAG 卡状态值

| 代码 | 含义 |
|------|------|
| N | 正常(Normal) |
| S | 挂起(Suspend) |
| R | 回收(Reclaim) |
| D | 作废(Depose) |
| UA | 未激活(UnActivated) |

## ACC_STATUS 账户状态值

| 代码 | 含义 |
|------|------|
| N | 正常(Normal) |
| F | 已结算(Foot) |
| S | 挂起(Suspend) |

---

## 一、就诊卡 (DHC_CardRef)

#### CF_ROWID

| 属性 | 值 |
|------|-----|
| 标准名 | `cfRowid` |
| 匹配模式 | CF_RowID, CardRowID, 卡RowID |
| 取值表达式 | `cfId` |
| Global | `^DHCCARD("CF")` |
| 置信度 | 1.0 |

```objectscript
s cfRowid = cfId
```

#### CF_CARD_NO

| 属性 | 值 |
|------|-----|
| 标准名 | `cfCardNo` |
| 匹配模式 | CardNo, 卡号, CF_CardNo |
| 取值表达式 | `$p($g(^DHCCARD("CF",cfId)),"^",2)` |
| Global | `^DHCCARD("CF")` |
| 节点路径 | `^DHCCARD("CF",cfId)^2` |
| 置信度 | 0.99 |

**说明**：索引: ^DHCCARDi("CF",0,"CardNo",cardNo,cfId)。

```objectscript
s cfCardNo = $p($g(^DHCCARD("CF",cfId)),"^",2)
```

#### CF_PAPMI_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `cfPapmiDr` |
| 匹配模式 | CF_PAPMI_DR, 卡患者DR |
| 取值表达式 | `$p($g(^DHCCARD("CF",cfId)),"^",4)` |
| Global | `^DHCCARD("CF")` |
| 节点路径 | `^DHCCARD("CF",cfId)^4` |
| 置信度 | 0.99 |

**说明**：索引: ^DHCCARDi("CF",0,"PAPMIDR",patDr,cfId)。

```objectscript
s cfPapmiDr = $p($g(^DHCCARD("CF",cfId)),"^",4)
```

#### CF_PAPMINO

| 属性 | 值 |
|------|-----|
| 标准名 | `cfPapmiNo` |
| 匹配模式 | CF_PAPMINo, 卡登记号 |
| 取值表达式 | `$p($g(^DHCCARD("CF",cfId)),"^",6)` |
| Global | `^DHCCARD("CF")` |
| 节点路径 | `^DHCCARD("CF",cfId)^6` |
| 置信度 | 0.95 |

```objectscript
s cfPapmiNo = $p($g(^DHCCARD("CF",cfId)),"^",6)
```

#### CF_ACTIVE_FLAG

| 属性 | 值 |
|------|-----|
| 标准名 | `cfActiveFlag` |
| 匹配模式 | CF_ActiveFlag, 卡状态, 卡有效标志 |
| 取值表达式 | `$p($g(^DHCCARD("CF",cfId)),"^",10)` |
| Global | `^DHCCARD("CF")` |
| 节点路径 | `^DHCCARD("CF",cfId)^10` |
| 置信度 | 0.95 |

**说明**：N=正常, S=挂起, R=回收, D=作废, UA=未激活。

```objectscript
s cfActiveFlag = $p($g(^DHCCARD("CF",cfId)),"^",10)
```

#### CF_CARD_TYPE_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `cfCardTypeDr` |
| 匹配模式 | CF_CardType_DR, 卡类型DR |
| 取值表达式 | `$p($g(^DHCCARD("CF",cfId)),"^",16)` |
| Global | `^DHCCARD("CF")` |
| 节点路径 | `^DHCCARD("CF",cfId)^16` |
| 置信度 | 0.90 |

**说明**：→ DHC_CardTypeDef 卡类型字典。

```objectscript
s cfCardTypeDr = $p($g(^DHCCARD("CF",cfId)),"^",16)
```

#### CF_ACC_NO_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `cfAccNoDr` |
| 匹配模式 | CF_AccNo_DR, 卡账户DR |
| 取值表达式 | `$p($g(^DHCCARD("CF",cfId)),"^",1)` |
| Global | `^DHCCARD("CF")` |
| 节点路径 | `^DHCCARD("CF",cfId)^1` |
| 置信度 | 0.95 |

**说明**：关联 DHC_AccManager。

```objectscript
s cfAccNoDr = $p($g(^DHCCARD("CF",cfId)),"^",1)
```

#### CF_DATE / CF_TIME

| 属性 | 值 |
|------|-----|
| 标准名 | `cfDate` |
| 匹配模式 | CF_Date, 卡创建日期 |
| 取值表达式 | `$zd($p($g(^DHCCARD("CF",cfId)),"^",7),3)` |
| Global | `^DHCCARD("CF")` |
| 节点路径 | `^DHCCARD("CF",cfId)^7` |
| 置信度 | 0.90 |

```objectscript
s tDate = $p($g(^DHCCARD("CF",cfId)),"^",7)
i tDate'="" s cfDate = $zd(tDate,3)
s cfTime = $zt($p($g(^DHCCARD("CF",cfId)),"^",8))
```

#### CF_IS_TEMPORARY

| 属性 | 值 |
|------|-----|
| 标准名 | `cfIsTemporary` |
| 匹配模式 | IsTemporaryCard, 临时卡标志 |
| 取值表达式 | `$p($g(^DHCCARD("CF",cfId)),"^",29)` |
| Global | `^DHCCARD("CF")` |
| 节点路径 | `^DHCCARD("CF",cfId)^29` |
| 置信度 | 0.85 |

**说明**：Y=临时卡, N=正式卡。

```objectscript
s cfIsTemporary = $p($g(^DHCCARD("CF",cfId)),"^",29)
```

---

## 二、账户管理 (DHC_AccManager)

#### ACCM_ROWID

| 属性 | 值 |
|------|-----|
| 标准名 | `accmRowid` |
| 匹配模式 | AccM_RowID, 账户RowID |
| 取值表达式 | `accmId` |
| Global | `^DHCACD("AccM")` |
| 置信度 | 1.0 |

```objectscript
s accmRowid = accmId
```

#### ACCM_ACCOUNT_NO

| 属性 | 值 |
|------|-----|
| 标准名 | `accmAccountNo` |
| 匹配模式 | AccountNo, 账户号, AccM_AccountNo |
| 取值表达式 | `$p($g(^DHCACD("AccM",accmId)),"^",1)` |
| Global | `^DHCACD("AccM")` |
| 节点路径 | `^DHCACD("AccM",accmId)^1` |
| 置信度 | 0.99 |

```objectscript
s accmAccountNo = $p($g(^DHCACD("AccM",accmId)),"^",1)
```

#### ACCM_PAPMI_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `accmPapmiDr` |
| 匹配模式 | AccM_PAPMI_DR, 账户患者DR |
| 取值表达式 | `$p($g(^DHCACD("AccM",accmId)),"^",2)` |
| Global | `^DHCACD("AccM")` |
| 节点路径 | `^DHCACD("AccM",accmId)^2` |
| 置信度 | 0.99 |

**说明**：索引: ^DHCACDi("AccM",0,"PAPMI",patDr,accmId)。

```objectscript
s accmPapmiDr = $p($g(^DHCACD("AccM",accmId)),"^",2)
```

#### ACCM_CARD_NO

| 属性 | 值 |
|------|-----|
| 标准名 | `accmCardNo` |
| 匹配模式 | AccM_CardNo, 账户卡号 |
| 取值表达式 | `$p($g(^DHCACD("AccM",accmId)),"^",4)` |
| Global | `^DHCACD("AccM")` |
| 节点路径 | `^DHCACD("AccM",accmId)^4` |
| 置信度 | 0.95 |

```objectscript
s accmCardNo = $p($g(^DHCACD("AccM",accmId)),"^",4)
```

#### ACCM_BALANCE

| 属性 | 值 |
|------|-----|
| 标准名 | `accmBalance` |
| 匹配模式 | Balance, 账户余额, AccM_Balance |
| 取值表达式 | `+$p($g(^DHCACD("AccM",accmId)),"^",8)` |
| Global | `^DHCACD("AccM")` |
| 节点路径 | `^DHCACD("AccM",accmId)^8` |
| 置信度 | 0.99 |

```objectscript
s accmBalance = +$p($g(^DHCACD("AccM",accmId)),"^",8)
```

#### ACCM_ACC_STATUS

| 属性 | 值 |
|------|-----|
| 标准名 | `accmAccStatus` |
| 匹配模式 | AccStatus, 账户状态, AccM_AccStatus |
| 取值表达式 | `$p($g(^DHCACD("AccM",accmId)),"^",13)` |
| Global | `^DHCACD("AccM")` |
| 节点路径 | `^DHCACD("AccM",accmId)^13` |
| 置信度 | 0.95 |

**说明**：N=正常, F=已结算, S=挂起。

```objectscript
s accmAccStatus = $p($g(^DHCACD("AccM",accmId)),"^",13)
```

#### ACCM_TYPE

| 属性 | 值 |
|------|-----|
| 标准名 | `accmType` |
| 匹配模式 | AccType, 账户类型, AccM_Type |
| 取值表达式 | `$p($g(^DHCACD("AccM",accmId)),"^",16)` |
| Global | `^DHCACD("AccM")` |
| 节点路径 | `^DHCACD("AccM",accmId)^16` |
| 置信度 | 0.90 |

**说明**：P=个人(Person), C=集体(Collect)。

```objectscript
s accmType = $p($g(^DHCACD("AccM",accmId)),"^",16)
```

#### ACCM_OC_DATE

| 属性 | 值 |
|------|-----|
| 标准名 | `accmOcDate` |
| 匹配模式 | OCDate, 开户日期, AccM_OCDate |
| 取值表达式 | `$zd($p($g(^DHCACD("AccM",accmId)),"^",5),3)` |
| Global | `^DHCACD("AccM")` |
| 节点路径 | `^DHCACD("AccM",accmId)^5` |
| 置信度 | 0.90 |

```objectscript
s tDate = $p($g(^DHCACD("AccM",accmId)),"^",5)
i tDate'="" s accmOcDate = $zd(tDate,3)
```

#### ACCM_HOSP_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `accmHospDr` |
| 匹配模式 | AccM_Hosp_DR, 账户院区DR |
| 取值表达式 | `$p($g(^DHCACD("AccM",accmId)),"^",24)` |
| Global | `^DHCACD("AccM")` |
| 节点路径 | `^DHCACD("AccM",accmId)^24` |
| 置信度 | 0.85 |

```objectscript
s accmHospDr = $p($g(^DHCACD("AccM",accmId)),"^",24)
```

---

## 常用遍历方式

### 按患者查就诊卡
```objectscript
s cfId = "" f  s cfId = $o(^DHCCARDi("CF",0,"PAPMIDR",patDr,cfId)) q:cfId=""  d
. s activeFlag = $p($g(^DHCCARD("CF",cfId)),"^",10)
. q:activeFlag'="N"  ; 只取正常卡
. s cardNo = $p($g(^DHCCARD("CF",cfId)),"^",2)
```

### 按卡号查卡
```objectscript
s cfId = $o(^DHCCARDi("CF",0,"CardNo",cardNo,""))
```

### 按患者查账户
```objectscript
s accmId = "" f  s accmId = $o(^DHCACDi("AccM",0,"PAPMI",patDr,accmId)) q:accmId=""  d
. s balance = +$p($g(^DHCACD("AccM",accmId)),"^",8)
. s status = $p($g(^DHCACD("AccM",accmId)),"^",13)
```

## 踩坑提示

### ⚠️ DHC_CardRef 和 DHC_AccManager 是两张独立表
通过 CF_AccNo_DR(^1) 关联，不是父子表关系。

### ⚠️ 卡状态 CF_ActiveFlag 有5种值
N/S/R/D/UA，不只是"有效/无效"。

### ⚠️ 预交金是 AccManager 的子表
^DHCACD("AccM",accmId,"AccPD",sub) — 三级下标。

## 规则统计

| 分类 | 规则数 | 说明 |
|------|--------|------|
| 就诊卡 | 10 | CfRowid/CardNo/PapmiDr/PapmiNo/ActiveFlag/CardTypeDr/AccNoDr/Date/Time/IsTemporary |
| 账户管理 | 9 | AccmRowid/AccountNo/PapmiDr/CardNo/Balance/AccStatus/Type/OcDate/HospDr |
| **合计** | **19** | + 状态值表/遍历方式/踩坑提示 |

---
