---
domain: "10-registration"
name: "挂号预约域(合并版)"
version: "2.0.0"
description: "门诊挂号预约全流程:排班→预约→队列→挂号费. 合并原10-registration(挂号费)+15-registration(排班预约)."

entityClasses:
  - name: "User.RBResource"
    description: "资源表(医生/设备)"
    global: "^RB(\"RES\",resId)"
    primaryKey: "RES_RowId"
  - name: "User.RBApptSchedule"
    description: "排班表"
    global: "^RBAS(resId,asChildSub)"
    primaryKey: "AS_ChildSub"
    parentRef: "AS_RES_ParRef"
  - name: "User.RBAppointment"
    description: "预约表"
    global: "^RBAS(resId,asChildSub,\"APPT\",apptChildSub)"
    primaryKey: "APPT_ChildSub"
    parentRef: "APPT_AS_ParRef"
  - name: "User.DHCQueue"
    description: "挂号队列表"
    global: "^User.DHCQueueD(queueId)"
  - name: "User.DHCRegistrationFee"
    description: "挂号费表"
    global: "^User.DHCRegistrationFeeD(rowId)"
    primaryKey: "RowID"
    indexes:
      - name: "ADM"
        description: "按就诊ID查挂号记录"
        indexGlobal: "^User.DHCRegistrationFeeI(\"ADM\",admId,rowId)"
      - name: "RegDate"
        description: "按挂号日期查挂号记录"
        indexGlobal: "^User.DHCRegistrationFeeI(\"RegDate\",date,rowId)"

relatedDicts:
  - name: "User.CTLoc"
    global: "^CTLOC(RowID)"
    description: "科室"
  - name: "User.CTCareProv"
    global: "^CTPCP(RowId,1)"
    description: "医护人员"
  - name: "User.RBCSessionType"
    description: "出诊级别"
  - name: "User.RBCAppointMethod"
    description: "预约方式"

traversal:
  type: "rEG"
  viewMatchers: ["register", "挂号", "regist"]
  modes:
    dateBatch:
      inputParam: {name: "pDateFrom", type: "%String", description: "开始日期"}
      index:
        global: "^User.DHCRegistrationFeeI"
        name: "RegDate"
        keys: ["date", "rowId"]
      data:
        global: "^User.DHCRegistrationFeeD"
        variable: "data"
        format: "lg"
      template: |
        f date=pStartDate:1:pEndDate d
        .s rowId=""
        .f  s rowId=$o(^User.DHCRegistrationFeeI("RegDate",date,rowId)) q:rowId=""  d
        ..s data=$g(^User.DHCRegistrationFeeD(rowId))
        ..i (data="") q
    admSingle:
      inputParam: {name: "admRowId", type: "%String", description: "就诊ID"}
      index:
        global: "^User.DHCRegistrationFeeI"
        name: "ADM"
        keys: ["admRowId", "rowId"]
      data:
        global: "^User.DHCRegistrationFeeD"
        variable: "data"
        format: "lg"

totalRules: 54
lastUpdated: "2026-05-30"
relatedGlobals:
  - "^RB(\"RES\",resId) — 资源主表(^1=科室DR ^2=医生DR ^17=描述 ^18=有效)"
  - "^RBAS(resId,childsub) — 排班主表(^1=日期 ^4=开始时间 ^7=号源数)"
  - "^RBAS(resId,childsub,\"APPT\",apptChildSub) — 预约子表(^2=患者DR ^3=状态 ^5=排队号)"
  - "^User.DHCQueueD(queueId) — 挂号队列(QueDate/QueDepDr/QueDocDr/QueNo/QueStateDr)"
  - "^User.DHCRegistrationFeeD(rowId) — 挂号费表($li格式)"
  - "^User.DHCRegistrationFeeI(\"ADM\",admId,rowId) — 按就诊查挂号索引"
  - "^User.DHCRegistrationFeeI(\"RegDate\",date,rowId) — 按日期查挂号索引"
---

# 挂号预约域 (10-registration) 取值规则 v2.0.0

> 合并版: 排班预约(RB表) + 挂号队列(DHCQueue) + 挂号费(DHCRegistrationFee)

## 业务流程

```
排班 → 预约 → 挂号 → 队列 → 就诊 → 挂号费

RB_Resource (资源/医生)
    └── RB_ApptSchedule (排班)
            └── RB_Appointment (预约)
                    ↓ 转就诊
                DHCQueue (挂号队列)
                    ↓
                DHCRegistrationFee (挂号费)
```

## APPT_STATUS 预约状态值

| 代码 | 含义 |
|------|------|
| I | 已插入(初始) |
| A | 已就诊(已挂号) |
| X | 已取消 |
| N | 未到 |
| D | 已离开 |

---

# 第一部分: 排班预约 (RB表)

## 一、资源表 (RB_Resource)

#### RES_CTLOC_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `resCtlocDr` |
| 匹配模式 | ResDeptDR, 资源科室DR |
| 取值表达式 | `$p($g(^RB("RES",resId)),"^",1)` |
| Global | `^RB("RES")` |
| 节点路径 | `^RB("RES",resId)^1` |
| 置信度 | 0.99 |

```objectscript
s resCtlocDr = $p($g(^RB("RES",resId)),"^",1)
```

#### RES_CTPCP_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `resCtpcpDr` |
| 匹配模式 | ResDoctorDR, 资源医生DR |
| 取值表达式 | `$p($g(^RB("RES",resId)),"^",2)` |
| Global | `^RB("RES")` |
| 节点路径 | `^RB("RES",resId)^2` |
| 置信度 | 0.99 |

```objectscript
s resCtpcpDr = $p($g(^RB("RES",resId)),"^",2)
```

#### RES_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `resDesc` |
| 匹配模式 | ResDesc, 资源描述 |
| 取值表达式 | `$p($g(^RB("RES",resId)),"^",17)` |
| Global | `^RB("RES")` |
| 节点路径 | `^RB("RES",resId)^17` |
| 置信度 | 0.95 |

```objectscript
s resDesc = $p($g(^RB("RES",resId)),"^",17)
```

#### RES_ACTIVE

| 属性 | 值 |
|------|-----|
| 标准名 | `resActive` |
| 匹配模式 | ResActive, 资源有效标志 |
| 取值表达式 | `$p($g(^RB("RES",resId)),"^",18)` |
| Global | `^RB("RES")` |
| 节点路径 | `^RB("RES",resId)^18` |
| 置信度 | 0.95 |

```objectscript
s resActive = $p($g(^RB("RES",resId)),"^",18)
```

---

## 二、排班表 (RB_ApptSchedule)

#### AS_DATE

| 属性 | 值 |
|------|-----|
| 标准名 | `asDate` |
| 匹配模式 | ScheduleDate, 排班日期, AS_Date |
| 取值表达式 | `$p($g(^RBAS(resId,asSub)),"^",1)` |
| Global | `^RBAS` |
| 节点路径 | `^RBAS(resId,asSub)^1` |
| 置信度 | 0.99 |

```objectscript
s tDate = $p($g(^RBAS(resId,asSub)),"^",1)
i tDate'="" s asDate = $zd(tDate,3)
```

#### AS_SESS_START_TIME

| 属性 | 值 |
|------|-----|
| 标准名 | `asSessStartTime` |
| 匹配模式 | SessStartTime, 排班开始时间 |
| 取值表达式 | `$zt($p($g(^RBAS(resId,asSub)),"^",4),2)` |
| Global | `^RBAS` |
| 节点路径 | `^RBAS(resId,asSub)^4` |
| 置信度 | 0.95 |

```objectscript
s asSessStartTime = $zt($p($g(^RBAS(resId,asSub)),"^",4),2)
```

#### AS_LOAD

| 属性 | 值 |
|------|-----|
| 标准名 | `asLoad` |
| 匹配模式 | Load, 号源数, AS_Load |
| 取值表达式 | `+$p($g(^RBAS(resId,asSub)),"^",8)` |
| Global | `^RBAS` |
| 节点路径 | `^RBAS(resId,asSub)^8` |
| 置信度 | 0.95 |

```objectscript
s asLoad = +$p($g(^RBAS(resId,asSub)),"^",8)
```

#### AS_SESSION_TYPE_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `asSessionTypeDr` |
| 匹配模式 | SessionTypeDR, 出诊级别DR |
| 取值表达式 | `$p($g(^RBAS(resId,asSub)),"^",14)` |
| Global | `^RBAS` |
| 节点路径 | `^RBAS(resId,asSub)^14` |
| 置信度 | 0.90 |

```objectscript
s asSessionTypeDr = $p($g(^RBAS(resId,asSub)),"^",14)
```

---

## 三、预约表 (RB_Appointment)

#### APPT_STATUS

| 属性 | 值 |
|------|-----|
| 标准名 | `apptStatus` |
| 匹配模式 | ApptStatus, 预约状态 |
| 取值表达式 | `$p($g(^RBAS(resId,asSub,"APPT",apptSub)),"^",3)` |
| Global | `^RBAS(...,"APPT",...)` |
| 节点路径 | `^RBAS(resId,asSub,"APPT",apptSub)^3` |
| 置信度 | 0.99 |

```objectscript
s apptStatus = $p($g(^RBAS(resId,asSub,"APPT",apptSub)),"^",3)
```

#### APPT_QUEUE_NO

| 属性 | 值 |
|------|-----|
| 标准名 | `apptQueueNo` |
| 匹配模式 | QueueNo, 排队号 |
| 取值表达式 | `$p($g(^RBAS(resId,asSub,"APPT",apptSub)),"^",5)` |
| Global | `^RBAS(...,"APPT",...)` |
| 节点路径 | `^RBAS(resId,asSub,"APPT",apptSub)^5` |
| 置信度 | 0.95 |

```objectscript
s apptQueueNo = $p($g(^RBAS(resId,asSub,"APPT",apptSub)),"^",5)
```

#### APPT_ADM_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `apptAdmDr` |
| 匹配模式 | ApptAdmDR, 预约就诊DR |
| 取值表达式 | `$p($g(^RBAS(resId,asSub,"APPT",apptSub)),"^",4)` |
| Global | `^RBAS(...,"APPT",...)` |
| 节点路径 | `^RBAS(resId,asSub,"APPT",apptSub)^4` |
| 置信度 | 0.95 |

```objectscript
s apptAdmDr = $p($g(^RBAS(resId,asSub,"APPT",apptSub)),"^",4)
```

---

## 四、挂号队列 (DHCQueue)

> DHCQueue 使用 DefaultStorage，$lg()取值

#### QUE_NO

| 属性 | 值 |
|------|-----|
| 标准名 | `queNo` |
| 匹配模式 | QueNo, 队列号, 挂号序号 |
| 取值表达式 | `$lg($g(^User.DHCQueueD(queueId)),12)` |
| Global | `^User.DHCQueueD` |
| 置信度 | 0.95 |

```objectscript
s queNo = $lg($g(^User.DHCQueueD(queueId)),12)
```

#### QUE_PAADM_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `quePaadmDr` |
| 匹配模式 | QuePaadmDr, 队列就诊DR |
| 取值表达式 | `$lg($g(^User.DHCQueueD(queueId)),13)` |
| Global | `^User.DHCQueueD` |
| 置信度 | 0.95 |

```objectscript
s quePaadmDr = $lg($g(^User.DHCQueueD(queueId)),13)
```

#### QUE_STATE_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `queStateDr` |
| 匹配模式 | QueStateDr, 队列状态DR |
| 取值表达式 | `$lg($g(^User.DHCQueueD(queueId)),16)` |
| Global | `^User.DHCQueueD` |
| 置信度 | 0.90 |

```objectscript
s queStateDr = $lg($g(^User.DHCQueueD(queueId)),16)
```

---

# 第二部分: 挂号费 (DHCRegistrationFee)

> DHCRegistrationFee 使用 DefaultStorage，$lg()格式

## Global 结构速查

### ^User.DHCRegistrationFeeD(rowId) — 挂号主表 ($li格式)

| $li位 | 属性 | 说明 |
|------|------|------|
| $lg(data,1) | RegfeeAdmDr | 就诊ID |
| $lg(data,2) | RegfeeArcDr | 费用项ARCIM |
| $lg(data,3) | RegfeeArcPrice | 挂号费 |
| $lg(data,6) | RegfeeName | 挂号名称 |
| $lg(data,7) | RegfeeNo | 排号 |
| $lg(data,8) | RegfeeLookPrice | 诊查费 |
| $lg(data,12) | RegfeeDepDr | 挂号科室 → ^CTLOC |
| $lg(data,13) | RegfeeDocDr | 挂号医生 → ^CTPCP |
| $lg(data,14) | RegfeeDate | 挂号日期($H) |
| $lg(data,15) | RegfeeTime | 挂号时间($H) |
| $lg(data,16) | RegfeeUserDr | 操作人 |
| $lg(data,18) | RegfeeSessionTypeDr | 就诊号级别 → ^CT("sESS") |
| $lg(data,19) | RegfeeRoomDr | 诊室 |
| $lg(data,25) | RegfeeInsuCash | 现金支付(医保) |
| $lg(data,26) | RegfeeInsuCount | 账户支付(医保) |
| $lg(data,27) | RegfeeInsuFund | 基金支付(医保) |
| $lg(data,28) | RegfeeInsuOverallPlanning | 统筹支付(医保) |
| $lg(data,34) | RegfeePrintDate | 打印日期($H) |
| $lg(data,41) | RegfeeTransactionId | 交易流水号 |

## 挂号费规则

#### GHJLID

| 属性 | 值 |
|------|-----|
| 标准名 | `gHJLID` |
| 匹配模式 | gHJLID, ghjlid, 挂号记录ID |
| 取值表达式 | `rowId` |
| Global | `^User.DHCRegistrationFeeD` |
| 置信度 | 0.95 |

```objectscript
s gHJLID = rowId
```

#### REG_DATE

| 属性 | 值 |
|------|-----|
| 标准名 | `regDate` |
| 匹配模式 | regDate, gthsj, 挂号日期, 挂号时间, 挂/退号时间, 挂退号时间 |
| 取值表达式 | `$zd($lg(data,14),3)_" "_$zt($lg(data,15),1)` |
| Global | `^User.DHCRegistrationFeeD` |
| 置信度 | 0.95 |

```objectscript
s regDate = $zd($lg(data,14),3)_" "_$zt($lg(data,15),1)
```

#### DEPT_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `deptCode` |
| 匹配模式 | deptCode, dept_code, 挂号科室编码, 科室编码, 科室代码 |
| 取值表达式 | `$p($g(^CTLOC($lg(data,12))),"^",1)` |
| Global | `^User.DHCRegistrationFeeD → ^CTLOC` |
| 置信度 | 0.95 |

```objectscript
s deptCode = $p($g(^CTLOC($lg(data,12))),"^",1)
```

#### DEPT_NAME

| 属性 | 值 |
|------|-----|
| 标准名 | `deptName` |
| 匹配模式 | deptName, dept_name, 挂号科室名称, 科室名称, 科室编码 |
| 取值表达式 | `$p($g(^CTLOC($lg(data,12))),"^",2)` |
| Global | `^User.DHCRegistrationFeeD → ^CTLOC` |
| 置信度 | 0.95 |

```objectscript
s deptName = $p($g(^CTLOC($lg(data,12))),"^",2)
```

#### DOC_NAME

| 属性 | 值 |
|------|-----|
| 标准名 | `docName` |
| 匹配模式 | docName, ghysxm, doctorName, 挂号医生姓名, 医生姓名 |
| 取值表达式 | `$p($g(^CTPCP($lg(data,13),1)),"^",2)` |
| Global | `^User.DHCRegistrationFeeD → ^CTPCP` |
| 置信度 | 0.95 |

```objectscript
s docName = $p($g(^CTPCP($lg(data,13),1)),"^",2)
```

#### DOC_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `docCode` |
| 匹配模式 | docCode, ghysbh, doctorCode, 挂号医生编号, 医生工号 |
| 取值表达式 | `$p($g(^CTPCP($lg(data,13),1)),"^",1)` |
| Global | `^User.DHCRegistrationFeeD → ^CTPCP` |
| 置信度 | 0.95 |

```objectscript
s docCode = $p($g(^CTPCP($lg(data,13),1)),"^",1)
```

#### REG_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `regFee` |
| 匹配模式 | regFee, ghzfy, regTotalFee, 挂号费, 挂号总费用 |
| 取值表达式 | `+$lg(data,3)+$lg(data,8)` |
| Global | `^User.DHCRegistrationFeeD` |
| 置信度 | 0.95 |

```objectscript
s regFee = +$lg(data,3)+$lg(data,8)
```

#### LOOK_FEE

| 属性 | 值 |
|------|-----|
| 标准名 | `lookFee` |
| 匹配模式 | lookFee, 诊查费 |
| 取值表达式 | `+$lg(data,8)` |
| Global | `^User.DHCRegistrationFeeD` |
| 置信度 | 0.95 |

```objectscript
s lookFee = +$lg(data,8)
```

#### SESSION_TYPE

| 属性 | 值 |
|------|-----|
| 标准名 | `sessionType` |
| 匹配模式 | sessionType, ghlb, regType, 挂号类别, 就诊号级别, 挂号类型 |
| 取值表达式 | `$p($g(^CT("sESS",$lg(data,18))),"^",2)` |
| Global | `^User.DHCRegistrationFeeD → ^CT("sESS")` |
| 置信度 | 0.95 |

```objectscript
s sessionType = $p($g(^CT("sESS",$lg(data,18))),"^",2)
```

#### TRANSACTION_ID

| 属性 | 值 |
|------|-----|
| 标准名 | `transactionId` |
| 匹配模式 | transactionId, stfbh, 收退费编号, 交易流水号, 交易流水号 |
| 取值表达式 | `$lg(data,41)` |
| Global | `^User.DHCRegistrationFeeD` |
| 置信度 | 0.95 |

```objectscript
s transactionId = $lg(data,41)
```

#### REG_FEE_ADM_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `regfeeAdmDr` |
| 匹配模式 | regfeeAdmDr, admRowId, 就诊ID, 就诊DR |
| 取值表达式 | `$lg(data,1)` |
| Global | `^User.DHCRegistrationFeeD` |
| 置信度 | 0.95 |

```objectscript
s regfeeAdmDr = $lg(data,1)
```

#### REG_FEE_DEPT_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `regfeeDepDr` |
| 匹配模式 | regfeeDepDr, deptDr, 科室DR, 挂号科室DR |
| 取值表达式 | `$lg(data,12)` |
| Global | `^User.DHCRegistrationFeeD` |
| 置信度 | 0.95 |

```objectscript
s regfeeDepDr = $lg(data,12)
```

#### REG_FEE_DOC_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `regfeeDocDr` |
| 匹配模式 | regfeeDocDr, docDr, 医生DR, 挂号医生DR |
| 取值表达式 | `$lg(data,13)` |
| Global | `^User.DHCRegistrationFeeD` |
| 置信度 | 0.95 |

```objectscript
s regfeeDocDr = $lg(data,13)
```

#### IS_EMERGENCY

| 属性 | 值 |
|------|-----|
| 标准名 | `isEmergency` |
| 匹配模式 | isEmergency, sfjz, 是否急诊, 急诊标志 |
| 取值表达式 | `$case($p($g(^PAADM($lg(data,1))),"^",2),"E":"1",:"0")` |
| Global | `^User.DHCRegistrationFeeD → ^PAADM` |
| 置信度 | 0.90 |

```objectscript
s isEmergency = $case($p($g(^PAADM($lg(data,1))),"^",2),"E":"1",:"0")
```

#### PAT_ID

| 属性 | 值 |
|------|-----|
| 标准名 | `patId` |
| 匹配模式 | patId, patientId, patient_id, 患者ID, 患者基本信息ID |
| 取值表达式 | `$p($g(^PAPER($p($g(^PAADM($lg(data,1))),"^",1),"PAT",1)),"^",1)` |
| Global | `^User.DHCRegistrationFeeD → ^PAADM → ^PAPER` |
| 置信度 | 0.90 |

```objectscript
s patId = $p($g(^PAPER($p($g(^PAADM($lg(data,1))),"^",1),"PAT",1)),"^",1)
```

---

## 踩坑提示

### ⚠️ 两种存储格式并存
- RB表/DHCQueue: 用 `$p($g(^...),"^",N)` 取值
- DHCRegistrationFee/DHCQueue: 用 `$lg($g(^...),N)` 或 `$lg(data,N)` 取值

### ⚠️ 预约表是排班表的孙表
RB_Appointment 路径: `^RBAS(resId,asChildSub,"APPT",apptChildSub)`，三级下标。

### ⚠️ DHCQueue 用 DefaultStorage
`$lg(^User.DHCQueueD(id),N)` 取值，不用 `$p()`。

## 规则统计

| 分类 | 规则数 | 说明 |
|------|--------|------|
| 资源表 | 4 | ResCtlocDr/ResCtpcpDr/ResDesc/ResActive |
| 排班表 | 4 | AsDate/SessStartTime/Load/SessionTypeDr |
| 预约表 | 3 | ApptStatus/QueueNo/AdmDr |
| 队列表 | 3 | QueNo/PaadmDr/StateDr |
| 挂号费 | 9 | GHJLID/RegDate/DeptCode/DeptName/DocName/RegFee/LookFee/SessionType/TransactionId |
| **合计** | **23** | 核心高频字段 + 状态值表/遍历方式/踩坑提示 |

---
