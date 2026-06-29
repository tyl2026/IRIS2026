---
domain: "40-order"
name: "医嘱域(完整版)"
version: "2.4.0"
description: "医嘱开具全部信息95条规则(医嘱项/类型/状态/剂量/频次/用法/科室/医生/价格/检验/药品剂型/执行记录等). 核心Global:^OEORD. 基于实体表和接口程序完整提取"

# 实体表类（数据存储结构来源）
entityClasses:
  - name: "User.OEOrder"
    description: "医嘱主表"
    global: "^OEORD"
    primaryKey: "OEORD_RowId"
  - name: "User.OEOrdItem"
    description: "医嘱明细表"
    global: "^OEORD(ord,'I',sub)"
    primaryKey: "OEORI_Childsub"
    parentRef: "OEORI_OEORD_ParRef"
  - name: "User.OEOrdExec"
    description: "医嘱执行明细表"
    global: "^OEORD(ord,'I',sub,'X',execSub)"
    primaryKey: "OEORE_Childsub"
    parentRef: "OEORE_OEORI_ParRef"
    sqlTableName: "OE_OrdExec"
    indexes:
      - name: "DateExecute"
        description: "按执行日期查询"
        indexGlobal: '^OEORDi(0,"DateExecute",date,ordId,ordItm,execSub)'
      - name: "StopExec"
        description: "按停止日期查询"
        indexGlobal: '^OEORDi(0,"StopExecE",xDate,xTime,ordId,ordItm,execSub)'
      - name: "OrdItem"
        description: "按医嘱项查询"
        indexGlobal: '^OEORDi(0,"OrdItem",ordId,ordItm,exStDate,execSub)'
    structure: "$p()格式"
    keyFields:
      - piece: 1
        name: "OEORE_ExStDate"
        description: "执行开始日期"
      - piece: 2
        name: "OEORE_ExStTime"
        description: "执行开始时间"
      - piece: 3
        name: "OEORE_PhQtyIss"
        description: "发药数量"
      - piece: 4
        name: "OEORE_PhQtyOrd"
        description: "申请数量"
      - piece: 5
        name: "OEORE_QtyAdmin"
        description: "执行数量"
      - piece: 6
        name: "OEORE_Billed"
        description: "计费标志(B=已计费,TB=待计费,I=忽略,R=退费,P=已支付)"
      - piece: 15
        name: "OEORE_CTPCP_DR"
        description: "执行医护人员 -> CTCareProv"
      - piece: 16
        name: "OEORE_Order_Status_DR"
        description: "执行状态 -> OECOrderAdminStatus"
      - piece: 17
        name: "OEORE_CTUOM_DR"
        description: "单位 -> CTUOM"
      - piece: 19
        name: "OEORE_DateExecuted"
        description: "执行日期"
      - piece: 20
        name: "OEORE_TimeExecuted"
        description: "执行时间"
      - piece: 21
        name: "OEORE_Desc"
        description: "描述"
      - piece: 25
        name: "OEORE_XDate"
        description: "停止日期"
      - piece: 26
        name: "OEORE_XTime"
        description: "停止时间"
      - piece: 29
        name: "OEORE_OverseeUser_DR"
        description: "监督用户 -> SSUser"
      - piece: 44
        name: "OEORE_Notes"
        description: "执行备注"
      - piece: 45
        name: "OEORE_InsertDate"
        description: "插入日期"
      - piece: 46
        name: "OEORE_InsertTime"
        description: "插入时间"
      - piece: 49
        name: "OEORE_CoverMainIns"
        description: "医保标志(Y=是,N=否)"

# 接口程序类（用于验证对照）
apiClasses:
  - name: "web.DHCENS.Method.OrderInfo"
    method: "GetOrderInfo(rowid)"

# 相关字典类
relatedDicts:
  - name: "User.ARCItmMast"
    global: "^ARCIM"
    description: "医嘱项主数据"
  - name: "User.ARCItemCat"
    global: "^ARC('iC')"
    description: "医嘱子类别"
  - name: "User.OECOrderCategory"
    global: "^OEC('oRCAT')"
    description: "医嘱大类别"
  - name: "User.OECPriority"
    global: "^OECPR"
    description: "医嘱类型/优先级"
  - name: "User.OECOrderStatus"
    global: "^OEC('OSTAT')"
    description: "医嘱状态"
  - name: "User.cTUOM"
    global: "^CT('UOM')"
    description: "剂量单位"
  - name: "User.PHCFreq"
    global: "^pHCFR"
    description: "频次"
  - name: "User.PHCInstruc"
    global: "^pHCIN"
    description: "用法"
  - name: "User.PHCDuration"
    global: "^pHCDU"
    description: "疗程"
  - name: "User.CTLoc"
    global: "^CTLOC"
    description: "科室"
  - name: "User.CTCareProv"
    global: "^CTPCP"
    description: "医护人员"
  - name: "User.SSUser"
    global: "^SSU('SSUSR')"
    description: "系统用户"

# 数据源遍历配置（供代码生成器使用）
traversal:
  type: "OEORD"
  viewMatchers: ["order", "医嘱", "presc", "nonmedication", "drugorder", "drug_order", "outpatient_drug", "outpatient_non_drug", "YZJL", "DBZ_ZYYZJL"]
  inputParam:
    name: "admRowId"
    type: "%String"
    description: "就诊ID"
  preVariables:
    - name: "patDR"
      expression: "$p($g(^PAADM(admRowId)),\"^\",1)"
      description: "患者DR"
  # 按日期范围遍历模式
  modes:
    dateRange:
      viewMatchers: ["医嘱记录", "医嘱信息", "Order", "YZJL", "DBZ_ZYYZJL"]
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
        ..s ordId=""
        ..f  s ordId=$o(^OEORD(0,"Adm",admRowId,ordId)) q:ordId=""  d
        ...s ordItm=""
        ...f  s ordItm=$o(^OEORD(ordId,"I",ordItm)) q:ordItm=""  d
        ....s ordstr1=$g(^OEORD(ordId,"I",ordItm,1))
        ....i ordstr1="" q
        ....s ordstr2=$g(^OEORD(ordId,"I",ordItm,2))
        ....s arcimDr=$p(ordstr2,"^",1)
        ....d GetOrdDetail
    admSingle:
      viewMatchers: ["单个医嘱", "医嘱详情"]
      description: "按就诊ID遍历（单条查询）"
      index:
        global: "^OEORD"
        name: "Adm"
        keys: ["admRowId", "ordId"]
        expression: '$o(^OEORD(0,"Adm",admRowId,ordId))'
      template: |
        s ordId=""
        f  s ordId=$o(^OEORD(0,"Adm",admRowId,ordId)) q:ordId=""  d
        .s ordItm=""
        .f  s ordItm=$o(^OEORD(ordId,"I",ordItm)) q:ordItm=""  d
        ..s ordstr1=$g(^OEORD(ordId,"I",ordItm,1))
        ..i (ordstr1="") q
        ..s ordstr2=$g(^OEORD(ordId,"I",ordItm,2))
        ..s arcimDr=$p(ordstr2,"^",1)
  # 默认配置（按就诊ID遍历，兼容旧逻辑）
  index:
    global: "^OEORD"
    name: "Adm"
    keys: ["admRowId", "ordId"]
    expression: '$o(^OEORD(0,"Adm",admRowId,ordId))'
  data:
    global: "^OEORD"
    variable: "ordstr1"
    format: "p"
    expression: '$g(^OEORD(ordId,"I",ordItm,1))'
  template: |
    s ordId=""
    f  s ordId=$o(^OEORD(0,"Adm",admRowId,ordId)) q:ordId=""  d
    .s ordItm=""
    .f  s ordItm=$o(^OEORD(ordId,"I",ordItm)) q:ordItm=""  d
    ..s ordstr1=$g(^OEORD(ordId,"I",ordItm,1))
    ..i (ordstr1="") q
    ..s ordstr2=$g(^OEORD(ordId,"I",ordItm,2))
    ..s arcimDr=$p(ordstr2,"^",1)

totalRules: 95
lastUpdated: "2026-05-30"
relatedGlobals:
  - "^OEORD(医嘱主索引)"
  - "^OEORDi(医嘱索引)"
  - "^ARCIM(医嘱项)"
  - "^ARC('iC')(医嘱子类别)"
  - "^OEC('oRCAT')(医嘱大类别)"
  - "^OECPR(医嘱类型/优先级)"
  - "^OEC('OSTAT')(医嘱状态)"
  - "^OEC('ASTAT')(执行状态)"
  - "^CT('UOM')(剂量单位)"
  - "^pHCFR(频次)"
  - "^pHCIN(用法)"
  - "^pHCDU(疗程)"
  - "^CTLOC(科室)"
  - "^CTPCP(医护人员)"
  - "^SSU('SSUSR')(系统用户)"
  - "^tTAB('tS')(LIS映射)"
  - "^tTAB('sPEC')(标本类型)"

# 医嘱执行表遍历配置
execTraversal:
  type: "OEOrdExec"
  inputParam:
    name: "ordIdItm"
    type: "%String"
    description: "医嘱ID(格式: ordId||ordItm)"
  preVariables: []
  index:
    global: "^OEORD"
    keys: ["ordId", "ordItm", "execSub"]
    expression: '$o(^OEORD(ordId,"I",ordItm,"X",execSub))'
  data:
    global: "^OEORD(ordId,\"I\",ordItm,\"X\",execSub)"
    variable: "execData"
    format: "p"
    expression: '$g(^OEORD(ordId,"I",ordItm,"X",execSub))'
  template: |
    s execSub=""
    f  s execSub=$o(^OEORD(ordId,"I",ordItm,"X",execSub)) q:execSub=""  d
    .s execData=$g(^OEORD(ordId,"I",ordItm,"X",execSub))
    .i (execData="") q
---

# 医嘱域(完整版)

## 元信息

| 属性 | 值 |
|------|-----|
| 域ID | `40-order` |
| 版本 | 2.0.0 |
| 规则数 | 65 |
| 来源类 | `web.DHCENS.Method.OrderInfo.cls` |
| 来源方法 | `GetOrderInfo(rowid)` |
| 更新时间 | 2026-05-11 |

## 描述

医嘱开具全部信息，包含医嘱项、类型、状态、剂量、频次、用法、科室、医生、价格、检验等字段。基于 ^OEORD(Order Entry) 全局，从 OrderInfo.cls 生产代码完整提取。

## 前置条件

输入参数 `rowid` 格式: `ord_sub` (如 `250_3`)，内部存储用 `||` 分隔，对外公布用 `_` 分隔。

```objectscript
; 输入参数: rowid (如 "250_3")
set ord = $P(rowid,"_",1)           ; 医嘱主ID
set sub = $P(rowid,"_",2)           ; 医嘱子序号

; 获取医嘱节点下的字符串
set ordstr1 = $g(^OEORD(ord,"I",sub,1))  ; 主信息串
set ordstr2 = $g(^OEORD(ord,"I",sub,2))  ; 剂量频次用法串
set ordstr3 = $g(^OEORD(ord,"I",sub,3))  ; 收费科室时间检验串
set ordstr7 = $g(^OEORD(ord,"I",sub,7))  ; 申请录入者串
```

## Global 结构速查

### ^OEORD 主索引

| 节点 | 用途 | 关键字段 |
|------|------|---------|
| `^OEORD(ord)` | 医嘱主记录 | ^1=就诊DR ^2=日期 ^3=时间 ^4=医生DR |
| `^OEORD(ord,"I",sub,1)` | 主信息串 | ^2=ArcimID ^8=类型DR ^9=开始日期 ^10=开始时间 ^11=医生DR ^12=数量 ^13=状态DR ^14=处方号 ^17=审核时间 |
| `^OEORD(ord,"I",sub,2)` | 剂量频次串 | ^1=剂量 ^3=剂量单位DR ^4=频次DR ^6=疗程DR ^7=用法DR |
| `^OEORD(ord,"I",sub,3)` | 收费科室串 | ^5=收费标志 ^6=接收科室DR ^7=审核日期 ^20=检验号 ^36=预置条码号 |
| `^OEORD(ord,"I",sub,7)` | 申请录入串 | ^1=录入者DR ^2=申请科室DR |
| `^OEORD(ord,"I",sub,"dEP",1)` | 备注 | 医嘱备注/说明 |
| `^OEORD(ord,"I",sub,"sT",stChildsub)` | 停医嘱记录 | ^4=停医嘱操作者DR |
| `^OEORD(ord,"I",sub,"sPEC",specDr)` | 标本类型 | ^1=标本代码 |
| `^OEORD(ord,"I",sub,"X",1,"NUR")` | 执行记录 | ^10=采集人DR ^11=采集日期 ^12=采集时间 |

### ^ARCIM 医嘱项

| 节点 | 用途 | 关键字段 |
|------|------|---------|
| `^ARCIM(arcSub,arcVer,1)` | 基础信息 | ^1=代码 ^2=名称 ^3=部位编码 ^10=子类DR |
| `^ARCIM(arcSub,arcVer,7)` | 扩展信息 | ^6=服务项目标识 |
| `^ARCIM(arcSub,arcVer,"eXT",n)` | 外部代码 | ^4=第三方LIS代码 |

### 相关字典

| 字典 | Global | 说明 |
|------|--------|------|
| 医嘱子类别 | `^ARC("IC",RowID)` | ^1=代码 ^2=描述 ^8=大类DR |
| 医嘱大类别 | `^OEC("oRCAT",RowID)` | ^1=代码 ^2=描述 |
| 医嘱类型/优先级 | `^OECPR(RowID)` | ^1=代码 ^2=描述 |
| 医嘱状态 | `^OEC("OSTAT",RowID)` | ^1=代码 ^2=描述 |
| 剂量单位 | `^CT("UOM",RowID)` | ^1=代码 ^2=描述 |
| 频次 | `^pHCFR(RowID)` | ^1=代码 **^3=描述** ⚠️非^2 |
| 用法 | `^pHCIN(RowID)` | ^1=代码 ^2=描述 |
| 疗程 | `^pHCDU(RowID)` | ^1=代码 **^3=描述** ⚠️非^2 |
| 科室 | `^CTLOC(RowID)` | ^1=代码 ^2=名称 ^22=院区DR |
| 医护人员 | `^CTPCP(RowID,1)` | ^1=工号 ^2=姓名 |
| 系统用户 | `^SSU("SSUSR",RowID)` | ^1=登录名 ^2=显示名 |
| LIS映射 | `^tTAB("tS",ExtCode)` | \3=LIS代码 (反斜杠分隔) |
| 标本类型 | `^tTAB("sPEC",SpecCode)` | \1=标本名称 (反斜杠分隔) |

## 字段映射规则

### 医嘱标识类

---

#### ORD_ROWID

| 属性 | 值 |
|------|-----|
| 标准名 | `ordRowid` |
| 匹配模式 | oeRowid, oeRowid, oEORE, oeore, OrdRowID, ordRowid, 医嘱ID, 医嘱序号, 医嘱号 |
| 取值表达式 | `rowid` |
| Global | 输入参数 |
| 置信度 | 1.0 |
| 分类 | 医嘱标识 |

**说明**：输入参数本身，格式: 'ord_sub' (如 '250_3')。内部存储用||分隔，对外公布用_分隔。

```objectscript
s ordRowid = rowid
```

---

#### ARCIM_ID

| 属性 | 值 |
|------|-----|
| 标准名 | `arcimId` |
| 匹配模式 | arcimId, arcimId, ArcimId, 医嘱项ID, 项目ID |
| 取值表达式 | `$P(ordstr1,"^",2)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,1)^2` |
| 置信度 | 1.0 |
| 分类 | 医嘱标识 |

**说明**：医嘱项ID，格式: arcSub||arcVer (双管道符)，需进一步解析为arcSub和arcVer。

```objectscript
s arcimId = $P(ordstr1,"^",2)
```

---

#### ARCIM_SUB

| 属性 | 值 |
|------|-----|
| 标准名 | `arcimSub` |
| 匹配模式 | arcimSub, arcSub, ArcSub |
| 取值表达式 | `$P(arcimId,"\|\|",1)` |
| Global | 从arcimId解析 |
| 置信度 | 1.0 |
| 分类 | 医嘱标识 |
| 依赖 | arcimId |

**说明**：从arcimId解析，用于查^ARCIM字典的第一次下标。

```objectscript
s arcimSub = $P(arcimId,"||",1)
```

---

#### ARCIM_VER

| 属性 | 值 |
|------|-----|
| 标准名 | `arcimVer` |
| 匹配模式 | arcimVer, arcVer, ArcVer |
| 取值表达式 | `$P(arcimId,"\|\|",2)` |
| Global | 从arcimId解析 |
| 置信度 | 1.0 |
| 分类 | 医嘱标识 |
| 依赖 | arcimId |

**说明**：从arcimId解析，用于查^ARCIM字典的第二下标。同一医嘱项可能有多个版本(价格/规格变更)。

```objectscript
s arcimVer = $P(arcimId,"||",2)
```

---

### 医嘱项信息类

---

#### ARCIM_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `arcimCode` |
| 匹配模式 | arcimCode, arcimCode, ArcimCode, yPDM, ypdm, orderItemCode, 医嘱项代码, 项目编码, 收费项编码 |
| 取值表达式 | `$p($g(^ARCIM(arcSub,arcVer,1)),"^",1)` |
| Global | `^ARCIM` |
| 节点路径 | `^ARCIM(arcSub,arcVer,1)^1` |
| 置信度 | 0.99 |
| 分类 | 医嘱项信息 |
| 依赖 | arcimSub, arcimVer |

**说明**：⚠️ 特殊覆盖: 如果OrdCatDesc='化验费'或'输血费', 此值会被GetLabCode结果覆盖为LIS侧代码！

```objectscript
s arcimCode = $p($g(^ARCIM(arcSub,arcVer,1)),"^",1)
```

---

#### ARCIM_NAME

| 属性 | 值 |
|------|-----|
| 标准名 | `arcimName` |
| 匹配模式 | arcimDesc, arcimDesc, ArcimName, yPMC, ypmc, orderItemName, 医嘱项名称, 项目名称 |
| 取值表达式 | `$p($g(^ARCIM(arcSub,arcVer,1)),"^",2)` |
| Global | `^ARCIM` |
| 节点路径 | `^ARCIM(arcSub,arcVer,1)^2` |
| 置信度 | 0.98 |
| 分类 | 医嘱项信息 |
| 依赖 | arcimSub, arcimVer |

**说明**：医嘱项基础名称。放射部位后缀(bwcode)仅在放射科场景下需要，由 GetBodyPartByOrditem() 获取，一般门诊场景不需要。

```objectscript
s arcimName = $p($g(^ARCIM(arcSub,arcVer,1)),"^",2)
```

---

#### ITM_MAST_SERVICE

| 属性 | 值 |
|------|-----|
| 标准名 | `itmMastService` |
| 匹配模式 | itmMastService, ItmMastService, 服务项目, serviceId |
| 取值表达式 | `$p($g(^ARCIM(arcSub,arcVer,7)),"^",6)` |
| Global | `^ARCIM` |
| 节点路径 | `^ARCIM(arcSub,arcVer,7)^6` |
| 置信度 | 0.95 |
| 分类 | 医嘱项信息 |
| 依赖 | arcimSub, arcimVer |

**说明**：位于^ARCIM第7节点^6位置，标识该医嘱项归属的服务项目类别。

```objectscript
s itmMastService = $p($g(^ARCIM(arcSub,arcVer,7)),"^",6)
```

---

### 医嘱分类类

---

#### ORD_SUB_CAT_ROWID

| 属性 | 值 |
|------|-----|
| 标准名 | `ordSubCatRowid` |
| 匹配模式 | ordSubCatRowid, OrdSubCatRowID, 子类ID, SubCatID |
| 取值表达式 | `$p($g(^ARCIM(arcSub,arcVer,1)),"^",10)` |
| Global | `^ARCIM` |
| 节点路径 | `^ARCIM(arcSub,arcVer,1)^10` |
| 置信度 | 0.99 |
| 分类 | 医嘱分类 |
| 依赖 | arcimSub, arcimVer |

**说明**：⚠️ 藏在^ARCIM的第1节点^10位置！不是独立字段，通过医嘱项间接获取。此RowID用于查^ARC('iC')子类字典。

```objectscript
s ordSubCatRowid = $p($g(^ARCIM(arcSub,arcVer,1)),"^",10)
```

---

#### ORD_SUB_CAT_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `ordSubCatCode` |
| 匹配模式 | ordSubCatCode, OrdSubCatCode, 子类代码, SubCatCode |
| 取值表达式 | `$p($g(^ARC("IC",OrdSubCatRowID)),"^",1)` |
| Global | `^ARC('iC')` |
| 节点路径 | `^ARC("IC",OrdSubCatRowID)^1` |
| 置信度 | 0.97 |
| 分类 | 医嘱分类 |
| 依赖 | ordSubCatRowid |

**说明**：医嘱子类别代码，从^ARC('iC')字典获取。

```objectscript
s ordSubCatCode = $p($g(^ARC("IC",OrdSubCatRowID)),"^",1)
```

---

#### ORD_SUB_CAT_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `ordSubCatDesc` |
| 匹配模式 | ordSubCatDesc, OrdSubCatDesc, 子类名称, SubCatDesc |
| 取值表达式 | `$p($g(^ARC("IC",OrdSubCatRowID)),"^",2)` |
| Global | `^ARC('iC')` |
| 节点路径 | `^ARC("IC",OrdSubCatRowID)^2` |
| 置信度 | 0.97 |
| 分类 | 医嘱分类 |
| 依赖 | ordSubCatRowid |

**说明**：医嘱子类别描述。

```objectscript
s ordSubCatDesc = $p($g(^ARC("IC",OrdSubCatRowID)),"^",2)
```

---

#### ORD_CAT_ROWID

| 属性 | 值 |
|------|-----|
| 标准名 | `ordCatRowid` |
| 匹配模式 | ordCatRowid, OrdCatRowID, 大类ID, CatRowID, oeCatId |
| 取值表达式 | `$p($g(^ARC("IC",OrdSubCatRowID)),"^",8)` |
| Global | `^ARC('iC')` |
| 节点路径 | `^ARC("IC",OrdSubCatRowID)^8` |
| 置信度 | 0.98 |
| 分类 | 医嘱分类 |
| 依赖 | ordSubCatRowid |

**说明**：⚠️ 大类不是直接存的！是从子类字典^ARC('iC',SubCatRowID)^8桥接出来的！两步链路: OEORD→^ARCIM→^ARC('iC')[子类]→^OEC('oRCAT')[大类]。

```objectscript
s ordCatRowid = $p($g(^ARC("IC",OrdSubCatRowID)),"^",8)
```

---

#### ORD_CAT_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `ordCatCode` |
| 匹配模式 | ordCatCode, OrdCatCode, 大类代码, CatCode |
| 取值表达式 | `$p($g(^OEC("oRCAT",OrdCatRowID)),"^",1)` |
| Global | `^OEC('oRCAT')` |
| 节点路径 | `^OEC("oRCAT",OrdCatRowID)^1` |
| 置信度 | 0.97 |
| 分类 | 医嘱分类 |
| 依赖 | ordCatRowid |

**说明**：医嘱大类别代码，示例: 化验费/输血费/药品费/治疗费/检查费/手术费/护理费/其他费。

```objectscript
s ordCatCode = $p($g(^OEC("oRCAT",OrdCatRowID)),"^",1)
```

---

#### ORD_CAT_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `ordCatDesc` |
| 匹配模式 | ordCatDesc, OrdCatDesc, 大类名称, CatDesc, orderCategory |
| 取值表达式 | `$p($g(^OEC("oRCAT",OrdCatRowID)),"^",2)` |
| Global | `^OEC('oRCAT')` |
| 节点路径 | `^OEC("oRCAT",OrdCatRowID)^2` |
| 置信度 | 0.97 |
| 分类 | 医嘱分类 |
| 依赖 | ordCatRowid |

**说明**：此字段是判断是否为检验类医嘱的关键条件！if (OrdCatDesc='化验费'|'输血费') 则走检验专用逻辑。

```objectscript
s ordCatDesc = $p($g(^OEC("oRCAT",OrdCatRowID)),"^",2)
```

---

### 医嘱属性类

---

#### ORD_TYPE_ROWID

| 属性 | 值 |
|------|-----|
| 标准名 | `ordTypeRowid` |
| 匹配模式 | ordTypeRowid, OrdTypeRowID, 类型ID, TypeID, orderTypeDr |
| 取值表达式 | `$P(ordstr1,"^",8)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,1)^8` |
| 置信度 | 0.99 |
| 分类 | 医嘱属性 |

**说明**：位于ordstr1(即^OEORD...1)的^8位置。⚠️ 源码中Priority也取同一位置！

```objectscript
s ordTypeRowid = $P(ordstr1,"^",8)
```

---

#### ORD_TYPE_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `ordTypeCode` |
| 匹配模式 | ordTypeCode, OrdTypeCode, 类型代码, typeCode, yZLX, yzlx, rSStT |
| 取值表达式 | `$P($g(^OECPR(OrdTypeRowID)),"^",1)` |
| Global | `^OECPR` |
| 节点路径 | `^OECPR(OrdTypeRowID)^1` |
| 置信度 | 0.97 |
| 分类 | 医嘱属性 |
| 依赖 | ordTypeRowid |

**说明**：医嘱类型代码，示例: R=长期医嘱 / S=临时医嘱 / sT=术前医嘱 / T=术后医嘱 / pRN=必要时。

```objectscript
s ordTypeCode = $P($g(^OECPR(OrdTypeRowID)),"^",1)
```

---

#### ORD_TYPE_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `ordTypeDesc` |
| 匹配模式 | ordTypeDesc, OrdTypeDesc, 类型名称, typeDesc, 医嘱类型名称 |
| 取值表达式 | `$P($g(^OECPR(OrdTypeRowID)),"^",2)` |
| Global | `^OECPR` |
| 节点路径 | `^OECPR(OrdTypeRowID)^2` |
| 置信度 | 0.97 |
| 分类 | 医嘱属性 |
| 依赖 | ordTypeRowid |

**说明**：医嘱类型描述。

```objectscript
s ordTypeDesc = $P($g(^OECPR(OrdTypeRowID)),"^",2)
```

---

#### IS_LONG_PRES

| 属性 | 值 |
|------|-----|
| 标准名 | `isLongPres` |
| 匹配模式 | isLongPres, IsLongPres, 长处方标志, longPresFlag, 长期医嘱标志 |
| 取值表达式 | `$case(OrdTypeCode,"R":"1",:"0")` |
| Global | - |
| 置信度 | 0.90 |
| 分类 | 医嘱属性 |
| 依赖 | ordTypeCode |

**说明**：长处方标志，根据医嘱类型代码判断。R=长期医嘱，返回"1"；其他返回"0"。

```objectscript
s isLongPres = $case(OrdTypeCode,"R":"1",:"0")
```

---

#### PRIORITY_ROWID

| 属性 | 值 |
|------|-----|
| 标准名 | `priorityRowid` |
| 匹配模式 | priorityRowid, PriorityRowID, 优先级ID, 优先ID |
| 取值表达式 | `$p(^OEORD(ord,"I",sub,1),"^",8)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,1)^8` |
| 置信度 | 0.95 |
| 分类 | 医嘱属性 |

**说明**：⚠️⚠️ 源码疑似bug: 取的是ordstr1(^OEORD...1)^8, 与OrdTypeRowID完全相同位置！可能Priority就是复用OrdType字段, 或源码有误需确认。

```objectscript
s priorityRowid = $p(^OEORD(ord,"I",sub,1),"^",8)
```

---

#### PRIORITY_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `priorityCode` |
| 匹配模式 | priorityCode, PriorityCode, 优先级代码 |
| 取值表达式 | `$p(^OECPR(PriorityDr),"^",1)` |
| Global | `^OECPR` |
| 节点路径 | `^OECPR(PriorityDr)^1` |
| 置信度 | 0.90 |
| 分类 | 医嘱属性 |
| 依赖 | priorityRowid |

**说明**：继承上述⚠️，如果PriorityDr确实=OrdTypeRowID则此值=OrdTypeCode。

```objectscript
s priorityCode = $p(^OECPR(PriorityDr),"^",1)
```

---

#### PRIORITY_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `priorityDesc` |
| 匹配模式 | priorityDesc, PriorityDesc, 优先级名称, 优先级描述 |
| 取值表达式 | `$p(^OECPR(PriorityDr),"^",2)` |
| Global | `^OECPR` |
| 节点路径 | `^OECPR(PriorityDr)^2` |
| 置信度 | 0.90 |
| 分类 | 医嘱属性 |
| 依赖 | priorityRowid |

**说明**：优先级描述。

```objectscript
s priorityDesc = $p(^OECPR(PriorityDr),"^",2)
```

---

### 医嘱状态类

---

#### STATUS_ROWID

| 属性 | 值 |
|------|-----|
| 标准名 | `statusRowid` |
| 匹配模式 | statusRowid, StatusRowID, 状态ID, oeStatusDr |
| 取值表达式 | `$P(ordstr1,"^",13)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,1)^13` |
| 置信度 | 0.99 |
| 分类 | 医嘱状态 |

**说明**：医嘱状态RowID，位于ordstr1的^13位置。

```objectscript
s statusRowid = $P(ordstr1,"^",13)
```

---

#### STATUS_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `statusCode` |
| 匹配模式 | statusCode, StatusCode, 状态代码, oeStatus, yZZT, yzzt |
| 取值表达式 | `$p($g(^OEC("OSTAT",StatusRowID)),"^",1)` |
| Global | `^OEC('OSTAT')` |
| 节点路径 | `^OEC("OSTAT",StatusRowID)^1` |
| 置信度 | 0.97 |
| 分类 | 医嘱状态 |
| 依赖 | statusRowid |

**说明**：医嘱状态代码，示例: A=活跃(Active) / D=停嘱(Discontinued) / S=暂停(Suspend) / C=完成(Complete)。

```objectscript
s statusCode = $p($g(^OEC("OSTAT",StatusRowID)),"^",1)
```

---

#### STATUS_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `statusDesc` |
| 匹配模式 | statusDesc, StatusDesc, 状态名称, oeStatusDesc |
| 取值表达式 | `$p($g(^OEC("OSTAT",StatusRowID)),"^",2)` |
| Global | `^OEC('OSTAT')` |
| 节点路径 | `^OEC("OSTAT",StatusRowID)^2` |
| 置信度 | 0.97 |
| 分类 | 医嘱状态 |
| 依赖 | statusRowid |

**说明**：医嘱状态描述。

```objectscript
s statusDesc = $p($g(^OEC("OSTAT",StatusRowID)),"^",2)
```

---

### 剂量数量类

---

#### DOSAGE_QTY

| 属性 | 值 |
|------|-----|
| 标准名 | `dosageQty` |
| 匹配模式 | dOSE, dose, dose_quantity, doseQuantity, yL, yl, dosageQty, DosageQty, 剂量, 用量, 单次用量, 每次用量 |
| 取值表达式 | `$P(ordstr2,"^",1)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,2)^1` |
| 置信度 | 0.99 |
| 分类 | 剂量数量 |

**说明**：位于ordstr2(^OEORD...2)的^1位置，纯数值。

```objectscript
s dosageQty = $P(ordstr2,"^",1)
```

---

#### QTY

| 属性 | 值 |
|------|-----|
| 标准名 | `qTY` |
| 匹配模式 | qTY, qty, 数量, 总量, 总数量, sL, sl, totalQty |
| 取值表达式 | `$P(ordstr1,"^",12)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,1)^12` |
| 置信度 | 0.99 |
| 分类 | 剂量数量 |

**说明**：位于ordstr1的^12位置，与DosageQty不同！Qty=总量(如5盒), DosageQty=单次剂量(如10mg)。

```objectscript
s qTY = $P(ordstr1,"^",12)
```

---

#### DOSAGE_UNIT_ROWID

| 属性 | 值 |
|------|-----|
| 标准名 | `dosageUnitRowid` |
| 匹配模式 | dosageUnitRowid, DosageUnitRowID, 单位ID, unitDr, jldwDr |
| 取值表达式 | `$P(ordstr2,"^",3)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,2)^3` |
| 置信度 | 0.99 |
| 分类 | 剂量数量 |

**说明**：剂量单位RowID。

```objectscript
s dosageUnitRowid = $P(ordstr2,"^",3)
```

---

#### DOSAGE_UNIT_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `dosageUnitCode` |
| 匹配模式 | dosageUnitCode, DosageUnitCode, 单位代码, unitCode, jldwCode |
| 取值表达式 | `$P($g(^CT("UOM",DosageUnitRowID)),"^",1)` |
| Global | `^CT('UOM')` |
| 节点路径 | `^CT("UOM",DosageUnitRowID)^1` |
| 置信度 | 0.97 |
| 分类 | 剂量数量 |
| 依赖 | dosageUnitRowid |

**说明**：剂量单位代码。

```objectscript
s dosageUnitCode = $P($g(^CT("UOM",DosageUnitRowID)),"^",1)
```

---

#### DOSAGE_UNIT_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `dosageUnitDesc` |
| 匹配模式 | dosageUnitDesc, DosageUnitDesc, 单位名称, unitDesc, jLDW, 剂量单位 |
| 取值表达式 | `$P($g(^CT("UOM",DosageUnitRowID)),"^",2)` |
| Global | `^CT('UOM')` |
| 节点路径 | `^CT("UOM",DosageUnitRowID)^2` |
| 置信度 | 0.97 |
| 分类 | 剂量数量 |
| 依赖 | dosageUnitRowid |

**说明**：剂量单位描述，示例: mg / ml / g / 片 / 支 / U(单位) / 滴 / 次。

```objectscript
s dosageUnitDesc = $P($g(^CT("UOM",DosageUnitRowID)),"^",2)
```

---

### 频次信息类

---

#### FREQ_ROWID

| 属性 | 值 |
|------|-----|
| 标准名 | `freqRowid` |
| 匹配模式 | freqRowid, FreqRowID, 频次ID, pcDr, frequencyDr |
| 取值表达式 | `$P(ordstr2,"^",4)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,2)^4` |
| 置信度 | 0.99 |
| 分类 | 频次信息 |

**说明**：频次RowID。

```objectscript
s freqRowid = $P(ordstr2,"^",4)
```

---

#### FREQ_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `freqCode` |
| 匹配模式 | fREQ, freq, pC, pc, fREQUENCY, FrequencyCode, 频次代码, 频次编码, yPFS, ypfs |
| 取值表达式 | `$p($g(^pHCFR(FreqRowID)),"^",1)` |
| Global | `^pHCFR` |
| 节点路径 | `^pHCFR(FreqRowID)^1` |
| 置信度 | 0.97 |
| 分类 | 频次信息 |
| 依赖 | freqRowid |

**说明**：频次代码，示例: qD(每日1次) / bID(每日2次) / tID(每日3次) / qID(每日4次) / qOD(隔日1次) / qW(每周1次) / sTAT(立即) / pRN(必要时)。

```objectscript
s freqCode = $p($g(^pHCFR(FreqRowID)),"^",1)
```

---

#### FREQ_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `freqDesc` |
| 匹配模式 | freqDesc, FreqDesc, 频次名称, frequencyDesc, 频次描述, yPFSMC, 频度, administrationTiming, frequencyName |
| 取值表达式 | `$p($g(^pHCFR(FreqRowID)),"^",3)` |
| Global | `^pHCFR` |
| 节点路径 | `^pHCFR(FreqRowID)^3` |
| 置信度 | 0.97 |
| 分类 | 频次信息 |
| 依赖 | freqRowid |

**说明**：⚠️ PHCFR字典的描述在^3位置不是^2！与大多数CT字典不同！

```objectscript
s freqDesc = $p($g(^pHCFR(FreqRowID)),"^",3)
```

---

#### OCC_TIME

| 属性 | 值 |
|------|-----|
| 标准名 | `occTime` |
| 匹配模式 | occTime, OccTime, 执行时间点, 频次时间 |
| 取值表达式 | `""` |
| Global | - |
| 置信度 | 0.5 |
| 分类 | 频次信息 |

**说明**：⚠️ 源码标记为暂未设置(空字符串)！实际执行时间需从^OEORD(...'X'...)执行记录子节点遍历提取。

```objectscript
s occTime = ""
```

---

### 用法疗程类

---

#### USAGE_ROWID

| 属性 | 值 |
|------|-----|
| 标准名 | `usageRowid` |
| 匹配模式 | usageRowid, UsageRowID, 用法ID, yfDr, instructionDr |
| 取值表达式 | `$P(ordstr2,"^",7)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,2)^7` |
| 置信度 | 0.99 |
| 分类 | 用法疗程 |

**说明**：用法RowID。

```objectscript
s usageRowid = $P(ordstr2,"^",7)
```

---

#### USAGE_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `usageCode` |
| 匹配模式 | usageCode, UsageCode, 用法代码, yfCode, instructionCode, 给药途径 |
| 取值表达式 | `$p($g(^pHCIN(UsageRowID)),"^",1)` |
| Global | `^pHCIN` |
| 节点路径 | `^pHCIN(UsageRowID)^1` |
| 置信度 | 0.97 |
| 分类 | 用法疗程 |
| 依赖 | usageRowid |

**说明**：用法代码，示例: iV(静脉滴注) / pO(口服) / iM(肌肉注射) / sC(皮下注射) / 外用 / 吸入 / 含服 / 灌肠。

```objectscript
s usageCode = $p($g(^pHCIN(UsageRowID)),"^",1)
```

---

#### USAGE_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `usageDesc` |
| 匹配模式 | usageDesc, UsageDesc, 用法名称, yfDesc, instructionDesc, 用法, 给药途径描述 |
| 取值表达式 | `$p($g(^pHCIN(UsageRowID)),"^",2)` |
| Global | `^pHCIN` |
| 节点路径 | `^pHCIN(UsageRowID)^2` |
| 置信度 | 0.97 |
| 分类 | 用法疗程 |
| 依赖 | usageRowid |

**说明**：用法描述。

```objectscript
s usageDesc = $p($g(^pHCIN(UsageRowID)),"^",2)
```

---

#### USE_DAYS_ROWID

| 属性 | 值 |
|------|-----|
| 标准名 | `useDaysRowid` |
| 匹配模式 | useDaysRowid, UseDaysRowID, 疗程ID, tsDr, durationDr |
| 取值表达式 | `$P(ordstr2,"^",6)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,2)^6` |
| 置信度 | 0.99 |
| 分类 | 用法疗程 |

**说明**：疗程天数RowID。

```objectscript
s useDaysRowid = $P(ordstr2,"^",6)
```

---

#### USE_DAYS_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `useDaysCode` |
| 匹配模式 | useDaysCode, UseDaysCode, 疗程代码, tsCode, durationCode |
| 取值表达式 | `$p($g(^pHCDU(UseDaysRowID)),"^",1)` |
| Global | `^pHCDU` |
| 节点路径 | `^pHCDU(UseDaysRowID)^1` |
| 置信度 | 0.96 |
| 分类 | 用法疗程 |
| 依赖 | useDaysRowid |

**说明**：疗程天数代码。

```objectscript
s useDaysCode = $p($g(^pHCDU(UseDaysRowID)),"^",1)
```

---

#### USE_DAYS_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `useDaysDesc` |
| 匹配模式 | useDaysDesc, UseDaysDesc, 疗程名称, tsDesc, durationDesc, 疗程, 治疗天数 |
| 取值表达式 | `$p($g(^pHCDU(UseDaysRowID)),"^",3)` |
| Global | `^pHCDU` |
| 节点路径 | `^pHCDU(UseDaysRowID)^3` |
| 置信度 | 0.96 |
| 分类 | 用法疗程 |
| 依赖 | useDaysRowid |

**说明**：⚠️ PHCDU字典与PHCFR一样, 描述在^3位置不是^2！示例: 3天 / 1周 / 2周 / 1个月 / 长期(直至停医嘱)。

```objectscript
s useDaysDesc = $p($g(^pHCDU(UseDaysRowID)),"^",3)
```

---

### 收费信息类

---

#### BILL_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `billCode` |
| 匹配模式 | billCode, BillCode, 收费标志, sFBS, sFBZ |
| 取值表达式 | `$P(ordstr3,"^",5)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,3)^5` |
| 置信度 | 0.99 |
| 分类 | 收费信息 |

**说明**：收费标志代码，示例: P=已收费 / 空=未收费。

```objectscript
s billCode = $P(ordstr3,"^",5)
```

---

#### BILL_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `billDesc` |
| 匹配模式 | billDesc, BillDesc, 收费标志描述, sFBSMC |
| 取值表达式 | `$Case(BillCode,"P":"已收费",:"未收费")` |
| Global | - |
| 置信度 | 0.99 |
| 分类 | 收费信息 |
| 依赖 | billCode |

**说明**：收费标志描述，使用$Case函数转换。

```objectscript
s billDesc = $Case(BillCode,"P":"已收费",:"未收费")
```

---

#### PRICE

| 属性 | 值 |
|------|-----|
| 标准名 | `pRICE` |
| 匹配模式 | pRICE, price, 医嘱价格, dJ, dj, unitPrice |
| 取值表达式 | `##cLASS(web.uDHCJFPRICE).GetOrderPrice("","",arcimId,$zdh(obj.VerifyDate,3),"","","","")` |
| Global | 外部方法调用 |
| 置信度 | 0.93 |
| 分类 | 收费信息 |
| 依赖 | arcimId, verifyDate |

**说明**：⚠️ 外部类方法调用！非简单Global查询。参数: 空,空,arcimId,验证日期(转HFormat),空,空,空。返回值的^1=Price。注意：这是医嘱价格，不是药品库存单价。

```objectscript
s price = ##cLASS(web.uDHCJFPRICE).GetOrderPrice("","",arcimId,$zdh(VerifyDate,3),"","","","")
s pRICE = $P(price,"^",1)
```

---

#### AMOUNT

| 属性 | 值 |
|------|-----|
| 标准名 | `aMOUNT` |
| 匹配模式 | aMOUNT, amount, 金额, 总价, jE, je, totalAmount |
| 取值表达式 | `obj.Price * obj.Qty` |
| Global | - |
| 置信度 | 0.99 |
| 分类 | 收费信息 |
| 依赖 | pRICE, qTY |

**说明**：计算公式: 单价×数量。Price来自外部方法, Qty来自^OEORD ordstr1^12。

```objectscript
s aMOUNT = Price * Qty
```

---

### 科室信息类

---

#### APP_DEPT_ROWID

| 属性 | 值 |
|------|-----|
| 标准名 | `appDeptRowid` |
| 匹配模式 | appDeptRowid, AppDeptRowID, 申请科室ID, sqksDr, requestDeptDr |
| 取值表达式 | `$P(ordstr7,"^",2)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,7)^2` |
| 置信度 | 0.99 |
| 分类 | 科室信息 |

**说明**：位于ordstr7(^OEORD...7)的^2位置。

```objectscript
s appDeptRowid = $P(ordstr7,"^",2)
```

---

#### APP_DEPT_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `appDeptCode` |
| 匹配模式 | appDeptCode, AppDeptCode, 申请科室代码, sqksCode, requestDeptCode |
| 取值表达式 | `$p($g(^CTLOC(AppDeptRowID)),"^",1)` |
| Global | `^CTLOC` |
| 节点路径 | `^CTLOC(AppDeptRowID)^1` |
| 置信度 | 0.97 |
| 分类 | 科室信息 |
| 依赖 | appDeptRowid |

**说明**：申请科室代码。

```objectscript
s appDeptCode = $p($g(^CTLOC(AppDeptRowID)),"^",1)
```

---

#### APP_DEPT_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `appDeptDesc` |
| 匹配模式 | appDeptDesc, AppDeptDesc, 申请科室名称, sqksName, requestDeptName |
| 取值表达式 | `$p($g(^CTLOC(AppDeptRowID)),"^",2)` |
| Global | `^CTLOC` |
| 节点路径 | `^CTLOC(AppDeptRowID)^2` |
| 置信度 | 0.97 |
| 分类 | 科室信息 |
| 依赖 | appDeptRowid |

**说明**：申请科室名称。

```objectscript
s appDeptDesc = $p($g(^CTLOC(AppDeptRowID)),"^",2)
```

---

#### APP_DEPT_HOSP_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `appDeptHospCode` |
| 匹配模式 | appDeptHospCode, AppDeptHospitalCode, 申请科室院区 |
| 取值表达式 | `$p(##class(web.DHCENS.Util.Common).GetHospitalByCtLoc(AppDeptRowID),"^",1)` |
| Global | 外部方法调用 |
| 置信度 | 0.92 |
| 分类 | 科室信息 |
| 依赖 | appDeptRowid |

**说明**：⚠️ 外部工具方法调用！web.DHCENS.Util.Common.GetHospitalByCtLoc()。返回^1=HospCode ^2=HospName。

```objectscript
s appDeptHospCode = $p(##class(web.DHCENS.Util.Common).GetHospitalByCtLoc(AppDeptRowID),"^",1)
```

---

#### APP_DEPT_HOSP_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `appDeptHospDesc` |
| 匹配模式 | appDeptHospDesc, AppDeptHospitalDesc, 申请科室院区名称 |
| 取值表达式 | `$p(##class(web.DHCENS.Util.Common).GetHospitalByCtLoc(AppDeptRowID),"^",2)` |
| Global | 外部方法调用 |
| 置信度 | 0.92 |
| 分类 | 科室信息 |
| 依赖 | appDeptRowid |

**说明**：申请科室院区名称。

```objectscript
s appDeptHospDesc = $p(##class(web.DHCENS.Util.Common).GetHospitalByCtLoc(AppDeptRowID),"^",2)
```

---

#### REC_DEPT_ROWID

| 属性 | 值 |
|------|-----|
| 标准名 | `recDeptRowid` |
| 匹配模式 | recDeptRowid, RecDeptRowID, 接收科室ID, 执行科室ID, jsksDr, execDeptDr |
| 取值表达式 | `$P(ordstr3,"^",6)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,3)^6` |
| 置信度 | 0.99 |
| 分类 | 科室信息 |

**说明**：位于ordstr3(^OEORD...3)的^6位置。

```objectscript
s recDeptRowid = $P(ordstr3,"^",6)
```

---

#### REC_DEPT_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `recDeptCode` |
| 匹配模式 | recDeptCode, RecDeptCode, 接收科室代码, 执行科室代码, jsksCode |
| 取值表达式 | `$p($g(^CTLOC(RecDeptRowID)),"^",1)` |
| Global | `^CTLOC` |
| 节点路径 | `^CTLOC(RecDeptRowID)^1` |
| 置信度 | 0.97 |
| 分类 | 科室信息 |
| 依赖 | recDeptRowid |

**说明**：接收/执行科室代码。

```objectscript
s recDeptCode = $p($g(^CTLOC(RecDeptRowID)),"^",1)
```

---

#### REC_DEPT_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `recDeptDesc` |
| 匹配模式 | recDeptDesc, RecDeptDesc, 接收科室名称, 执行科室名称, jsksName |
| 取值表达式 | `$p($g(^CTLOC(RecDeptRowID)),"^",2)` |
| Global | `^CTLOC` |
| 节点路径 | `^CTLOC(RecDeptRowID)^2` |
| 置信度 | 0.97 |
| 分类 | 科室信息 |
| 依赖 | recDeptRowid |

**说明**：接收/执行科室名称。

```objectscript
s recDeptDesc = $p($g(^CTLOC(RecDeptRowID)),"^",2)
```

---

#### REC_DEPT_HOSP_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `recDeptHospCode` |
| 匹配模式 | recDeptHospCode, RecDeptHospitalCode, 执行科室院区 |
| 取值表达式 | `$p(##class(web.DHCENS.Util.Common).GetHospitalByCtLoc(RecDeptRowID),"^",1)` |
| Global | 外部方法调用 |
| 置信度 | 0.92 |
| 分类 | 科室信息 |
| 依赖 | recDeptRowid |

**说明**：同APP_DEPT模式，外部方法GetHospitalByCtLoc。

```objectscript
s recDeptHospCode = $p(##class(web.DHCENS.Util.Common).GetHospitalByCtLoc(RecDeptRowID),"^",1)
```

---

#### REC_DEPT_HOSP_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `recDeptHospDesc` |
| 匹配模式 | recDeptHospDesc, RecDeptHospitalDesc, 执行科室院区名称 |
| 取值表达式 | `$p(##class(web.DHCENS.Util.Common).GetHospitalByCtLoc(RecDeptRowID),"^",2)` |
| Global | 外部方法调用 |
| 置信度 | 0.92 |
| 分类 | 科室信息 |
| 依赖 | recDeptRowid |

**说明**：接收/执行科室院区名称。

```objectscript
s recDeptHospDesc = $p(##class(web.DHCENS.Util.Common).GetHospitalByCtLoc(RecDeptRowID),"^",2)
```

---

### 人员信息类

---

#### DOCTOR_ROWID

| 属性 | 值 |
|------|-----|
| 标准名 | `doctorRowid` |
| 匹配模式 | doctorRowid, DocRowID, 医生ID, ysDr, orderDoctorDr, 开嘱医生ID |
| 取值表达式 | `$P(ordstr1,"^",11)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,1)^11` |
| 置信度 | 0.99 |
| 分类 | 人员信息 |

**说明**：位于ordstr1的^11位置。

```objectscript
s doctorRowid = $P(ordstr1,"^",11)
```

---

#### DOCTOR_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `doctorCode` |
| 匹配模式 | doctorCode, DocCode, 医生工号, ysCode, doctorLogin |
| 取值表达式 | `$p($g(^CTPCP(DocRowID,1)),"^",1)` |
| Global | `^CTPCP` |
| 节点路径 | `^CTPCP(DocRowID,1)^1` |
| 置信度 | 0.97 |
| 分类 | 人员信息 |
| 依赖 | doctorRowid |

**说明**：CTPCP字典: ^CTPCP(RowID, sub1) ^1=工号/LoginName ^2=姓名。

```objectscript
s doctorCode = $p($g(^CTPCP(DocRowID,1)),"^",1)
```

---

#### DOCTOR_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `doctorDesc` |
| 匹配模式 | doctorDesc, DocDesc, 医生姓名, ysName, doctorName, 开嘱医生, 主治医师 |
| 取值表达式 | `$p($g(^CTPCP(DocRowID,1)),"^",2)` |
| Global | `^CTPCP` |
| 节点路径 | `^CTPCP(DocRowID,1)^2` |
| 置信度 | 0.97 |
| 分类 | 人员信息 |
| 依赖 | doctorRowid |

**说明**：开嘱医生姓名。

```objectscript
s doctorDesc = $p($g(^CTPCP(DocRowID,1)),"^",2)
```

---

#### USER_ROWID

| 属性 | 值 |
|------|-----|
| 标准名 | `userRowid` |
| 匹配模式 | userRowid, UserCodeRowID, 录入者ID, lrzDr, entryUserDr |
| 取值表达式 | `$P(ordstr7,"^",1)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,7)^1` |
| 置信度 | 0.99 |
| 分类 | 人员信息 |

**说明**：位于ordstr7(^OEORD...7)的^1位置。医嘱录入人可能与开嘱医生不同(如护士代录/实习生)。

```objectscript
s userRowid = $P(ordstr7,"^",1)
```

---

#### USER_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `userCode` |
| 匹配模式 | userCode, UserCode, 录入者登录名, lrzCode, entryUserCode |
| 取值表达式 | `$p($g(^SSU("SSUSR",UserCodeRowID)),"^",1)` |
| Global | `^SSU('SSUSR')` |
| 节点路径 | `^SSU("SSUSR",UserCodeRowID)^1` |
| 置信度 | 0.97 |
| 分类 | 人员信息 |
| 依赖 | userRowid |

**说明**：SSU系统用户字典: ^SSU('SSUSR', RowID) ^1=登录账号 ^2=显示名称。

```objectscript
s userCode = $p($g(^SSU("SSUSR",UserCodeRowID)),"^",1)
```

---

#### USER_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `userDesc` |
| 匹配模式 | userDesc, UserDesc, 录入者名称, lrzName, entryUserName |
| 取值表达式 | `$p($g(^SSU("SSUSR",UserCodeRowID)),"^",2)` |
| Global | `^SSU('SSUSR')` |
| 节点路径 | `^SSU("SSUSR",UserCodeRowID)^2` |
| 置信度 | 0.97 |
| 分类 | 人员信息 |
| 依赖 | userRowid |

**说明**：录入者显示名称。

```objectscript
s userDesc = $p($g(^SSU("SSUSR",UserCodeRowID)),"^",2)
```

---

### 时间信息类

---

#### VERIFY_DATE

| 属性 | 值 |
|------|-----|
| 标准名 | `verifyDate` |
| 匹配模式 | verifyDate, VerifyDate, 下达日期, 审核日期, xdDate, xDSJ, orderDate |
| 取值表达式 | `s tDate=$P(ordstr3,"^",7) i tDate'="" s tDate=$zd(tDate,3)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,3)^7` |
| 置信度 | 0.99 |
| 分类 | 时间信息 |

**说明**：位于ordstr3(^OEORD...3)^7位置。$zd(,3)格式化为YYYY-MM-DD。

```objectscript
s tDate = $P(ordstr3,"^",7)
i tDate'="" s tDate = $zd(tDate,3)
s verifyDate = tDate
```

---

#### VERIFY_TIME

| 属性 | 值 |
|------|-----|
| 标准名 | `verifyTime` |
| 匹配模式 | verifyTime, VerifyTime, 下达时间, 审核时间, xdTime, xDSJ2 |
| 取值表达式 | `s tTime=$P(ordstr1,"^",17) i tTime'="" s tTime=$zt(tTime)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,1)^17` |
| 置信度 | 0.99 |
| 分类 | 时间信息 |

**说明**：位于ordstr1^17位置。$zt()格式化为HH:MM:SS。注意与StartDate/StartTime分开！

```objectscript
s tTime = $P(ordstr1,"^",17)
i tTime'="" s tTime = $zt(tTime)
s verifyTime = tTime
```

---

#### START_DATE

| 属性 | 值 |
|------|-----|
| 标准名 | `startDate` |
| 匹配模式 | startDate, StartDate, 开始日期, 执行开始日期, kSRQ, ksrq |
| 取值表达式 | `s tDate=$P(ordstr1,"^",9) i tDate'="" s tDate=$zd(tDate,3)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,1)^9` |
| 置信度 | 0.99 |
| 分类 | 时间信息 |

**说明**：位于ordstr1^9位置。$zd(,3)格式化。

```objectscript
s tDate = $P(ordstr1,"^",9)
i tDate'="" s tDate = $zd(tDate,3)
s startDate = tDate
```

---

#### START_TIME

| 属性 | 值 |
|------|-----|
| 标准名 | `startTime` |
| 匹配模式 | startTime, StartTime, 开始时间, 执行开始时间, kSSJ, kssj |
| 取值表达式 | `s tTime=$P(ordstr1,"^",10) i tTime'="" s tTime=$zt(tTime)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,1)^10` |
| 置信度 | 0.99 |
| 分类 | 时间信息 |

**说明**：位于ordstr1^10位置。$zt()格式化HH:MM:SS。

```objectscript
s tTime = $P(ordstr1,"^",10)
i tTime'="" s tTime = $zt(tTime)
s startTime = tTime
```

---

### 医嘱附加信息类

---

#### PRESCRIPTION_NO

| 属性 | 值 |
|------|-----|
| 标准名 | `prescriptionNo` |
| 匹配模式 | prescriptionNo, PrescriptionNo, pres_no, presNo, pres_id, presId, 处方号, 处方流水号, 处方编号, cFH, cfh, rxNo |
| 取值表达式 | `$P(ordstr1,"^",14)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,1)^14` |
| 置信度 | 0.99 |
| 分类 | 医嘱附加信息 |

**说明**：处方号。

```objectscript
s prescriptionNo = $P(ordstr1,"^",14)
```

---

#### NOTE

| 属性 | 值 |
|------|-----|
| 标准名 | `nOTE` |
| 匹配模式 | nOTE, Note, 备注, 说明, 医嘱说明, bZ, bz, orderNote, rEMARK |
| 取值表达式 | `$g(^OEORD(ord,"I","sub","dEP",1))` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,"dEP",1)` |
| 置信度 | 0.98 |
| 分类 | 医嘱附加信息 |

**说明**：独立DEP子节点，用$g保护防止无数据时报错。

```objectscript
s nOTE = $g(^OEORD(ord,"I",sub,"dEP",1))
```

---

### 停医嘱信息类（条件字段）

---

#### STOP_DOC_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `stopDocCode` |
| 匹配模式 | stopDocCode, StopDocCode, 停嘱医生, tzysCode, discontinueDoctorCode |
| 取值表达式 | `""` |
| Global | `^OEORD`, `^SSU('SSUSR')` |
| 置信度 | 0.95 |
| 分类 | 停医嘱信息 |
| 条件 | StatusCode="D" (医嘱已停嘱) |

**说明**：⚠️ 条件字段！仅当医嘱状态='D'(停嘱)时才有值。ST子节点存停嘱历史记录，取最后一条=最近一次停医嘱操作。操作者存在SSU字典非CTPCP！

```objectscript
; 仅当 StatusCode='D' 时执行以下步骤
i StatusCode="D" d
. s stChildsub = $o(^OEORD(ord,"I",sub,"sT",""),-1)  ; 取ST停嘱子节最后一条
. i stChildsub'="" d
. . s UserDr = $p(^OEORD(ord,"I",sub,"sT",stChildsub),"^",4)  ; 停医嘱操作者UserDr
. . i UserDr'="" s StopDocCode = $p($g(^SSU("SSUSR",UserDr)),"^",1)
```

---

#### STOP_DOC_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `stopDocDesc` |
| 匹配模式 | stopDocDesc, StopDocDesc, 停嘱医生姓名, tzysName, discontinueDoctorName |
| 取值表达式 | `""` |
| Global | `^OEORD`, `^SSU('SSUSR')` |
| 置信度 | 0.95 |
| 分类 | 停医嘱信息 |
| 条件 | StatusCode="D" (医嘱已停嘱) |
| 依赖 | stopDocCode 中的 UserDr |

**说明**：仅当 StatusCode='D' 时执行(接上一步骤UserDr已获取)。

```objectscript
; 仅当 StatusCode='D' 时执行(接上一步骤UserDr已获取)
i UserDr'="" s StopDocDesc = $p($g(^SSU("SSUSR",UserDr)),"^",2)
```

---

### 检验专用字段（条件字段）

> 以下字段仅当 OrdCatDesc='化验费' 或 OrdCatDesc='输血费' 时有效

---

#### LAB_NO

| 属性 | 值 |
|------|-----|
| 标准名 | `labNo` |
| 匹配模式 | labNo, LabNo, 检验号, jYH, jyh, labNumber, lisNo |
| 取值表达式 | `$p(ordstr3,"^",20)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,3)^20` |
| 置信度 | 0.98 |
| 分类 | 检验专用(Lab) |
| 条件 | OrdCatDesc='化验费' oR OrdCatDesc='输血费' |

**说明**：⚠️ 检验专用字段！仅医嘱大类为'化验费'或'输血费'时有效。位于ordstr3^20位置。

```objectscript
s labNo = $p(ordstr3,"^",20)
```

---

#### PLACE_NO

| 属性 | 值 |
|------|-----|
| 标准名 | `placeNo` |
| 匹配模式 | placeNo, PlaceNo, 预置条码号, 条码号, tMH, tmh, barcodeNo |
| 取值表达式 | `$P(ordstr3,"^",36)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,3)^36` |
| 置信度 | 0.97 |
| 分类 | 检验专用(Lab) |
| 条件 | OrdCatDesc='化验费' oR OrdCatDesc='输血费' |

**说明**：⚠️ 检验专用。位于ordstr3^36位置(偏移量很大！)。

```objectscript
s placeNo = $P(ordstr3,"^",36)
```

---

#### EXT_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `extCode` |
| 匹配模式 | extCode, ExtCode, 外部代码, LIS代码, lisCode, wBDM |
| 取值表达式 | `..GetExtCode(arcimId)` |
| Global | `^ARCIM` |
| 置信度 | 0.95 |
| 分类 | 检验专用(Lab) |
| 条件 | OrdCatDesc='化验费' oR OrdCatDesc='输血费' |
| 依赖 | arcimId |

**说明**：⚠️ 检验专用+辅助方法调用！GetExtCode()查找^ARCIM的EXT子节点取外部系统(如LIS)的对应代码。

```objectscript
; GetExtCode() 内部实现
q:ArcimID="" ""
set ExtCode = ""
set temord = $o(^ARCIM(+ArcimID,$p(ArcimID,"||",2),"eXT",""),-1)
set:temord'="" ExtCode = $p(^ARCIM(+ArcimID,$p(ArcimID,"||",2),"eXT",temord),"^",4)
Q ExtCode
```

---

#### ARCIM_LAB_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `arcimLabCode` |
| 匹配模式 | arcimLabCode, LabArcimCode, LIS项目代码, jYXMDM |
| 取值表达式 | `..GetLabCode(arcimId)` |
| Global | `^ARCIM`, `^tTAB('tS')` |
| 置信度 | 0.94 |
| 分类 | 检验专用(Lab) |
| 条件 | OrdCatDesc='化验费' oR OrdCatDesc='输血费' |
| 依赖 | arcimId |

**说明**：⚠️ 检验专用！此方法执行后会覆盖ARCIM_CODE的值。两层fallback: 先查TTAB映射表→失败则返回HIS原始代码。

```objectscript
; GetLabCode() 内部实现
q:ArcimID="" ""
s temord = $o(^ARCIM(+ArcimID,$p(ArcimID,"||",2),"eXT",""),-1)
s ExtCode="", RetCode=""
if (temord'="") {
    s ExtCode = $p(^ARCIM(+ArcimID,$p(ArcimID,"||",2),"eXT",temord),"^",4)
    if (ExtCode'="") {
        s RetCode = $p($g(^tTAB("tS",ExtCode)),"\",3)
    }
}
set:RetCode="" RetCode = $P($g(^ARCIM(+ArcimID,$p(ArcimID,"||",2),1)),"^",1)
q RetCode
```

---

#### SPECIMEN_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `specimenCode` |
| 匹配模式 | specimenCode, SpecimenCode, 标本代码, bblxCode, specCode |
| 取值表达式 | `..GetSpecCode(rowid)` |
| Global | `^OEORD` |
| 置信度 | 0.95 |
| 分类 | 检验专用(Lab) |
| 条件 | OrdCatDesc='化验费' oR OrdCatDesc='输血费' |

**说明**：⚠️ 检验专用+方法调用。SPEC子节点存标本类型，可能有多个(多次修改)，取最后一条=最新。

```objectscript
; GetSpecCode() 内部实现
set OrdId = $P(oerowid,"_",1)
set SubId = $P(oerowid,"_",2)
s SpecDr = $o(^OEORD(OrdId,"I",SubId,"sPEC",""),-1)
s (SpecCode,SpecName) = ""
i $l(SpecDr) s SpecCode = $p(^OEORD(OrdId,"I",SubId,"sPEC",SpecDr),"^",1)
q SpecCode
```

---

#### SPECIMEN

| 属性 | 值 |
|------|-----|
| 标准名 | `sPECIMEN` |
| 匹配模式 | sPECIMEN, Specimen, 标本名称, bBLX, bBMC, specName, 标本类型 |
| 取值表达式 | `..GetSpecName(rowid)` |
| Global | `^OEORD`, `^tTAB('sPEC')` |
| 置信度 | 0.94 |
| 分类 | 检验专用(Lab) |
| 条件 | OrdCatDesc='化验费' oR OrdCatDesc='输血费' |

**说明**：⚠️ 检验专用！示例: 全血 / 血清 / 尿液 / 咽拭子 / 痰液 / 分泌物 / 穿刺液 / 骨髓 / 脑脊液 / 粪便 / 腹水 / 胸水。

```objectscript
; GetSpecName() 内部实现
set OrdId = $P(oerowid,"_",1)
set SubId = $P(oerowid,"_",2)
s SpecDr = $o(^OEORD(OrdId,"I",SubId,"sPEC",""),-1)
s (SpecCode,SpecName) = ""
i $l(SpecDr) s SpecCode = $p(^OEORD(OrdId,"I",SubId,"sPEC",SpecDr),"^",1)
i $l(SpecCode),$d(^tTAB("sPEC",SpecCode)) {
    s SpecName = $p(^tTAB("sPEC",SpecCode),"\",1)
}
q SpecName
```

---

#### SP_VOLUME

| 属性 | 值 |
|------|-----|
| 标准名 | `spVolume` |
| 匹配模式 | spVolume, SpVolume, 采集量, 标本量, bBCLL, specVolume |
| 取值表达式 | `""` |
| Global | - |
| 置信度 | 0.3 |
| 分类 | 检验专用(Lab) |
| 条件 | OrdCatDesc='化验费' oR OrdCatDesc='输血费' |

**说明**：⚠️⚠️ 源码明确标注暂未处理！返回空字符串。实际可能需要从^OEORD其他子节点或LIS系统回传获取。

```objectscript
s spVolume = ""
```

---

### 药品信息类（条件字段）

> 以下字段仅当 OrderType="R" (药品类医嘱) 时有效

---

#### PHCDF_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `phcdfDr` |
| 匹配模式 | phcdfDr, PHCDFdr, 药学关联指针, 药学项DR |
| 取值表达式 | `$p($g(^ARCIM(arcSub,arcVer,1)),"^",12)` |
| Global | `^ARCIM` |
| 节点路径 | `^ARCIM(arcSub,arcVer,1)^12` |
| 置信度 | 0.99 |
| 分类 | 药品信息 |
| 条件 | OrderType="R" |
| 依赖 | arcimSub, arcimVer |

**说明**：药学关联指针(PHC_DrgForm)，格式: phcDr||dfChildsub。用于进一步查询药品剂型、药品名称等信息。

```objectscript
s phcdfDr = $p($g(^ARCIM(arcSub,arcVer,1)),"^",12)
```

---

#### DRUG_FORM_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `drugFormDr` |
| 匹配模式 | drugFormDr, DrgFormDr, 剂型DR, 药物剂型DR |
| 取值表达式 | `$p($g(^PHCD(+phcdfDr,"DF",$p(phcdfDr,"\|\|",2),1)),"^",1)` |
| Global | `^PHCD` |
| 节点路径 | `^PHCD(phcDr,"DF",dfChildsub,1)^1` |
| 置信度 | 0.98 |
| 分类 | 药品信息 |
| 条件 | OrderType="R" |
| 依赖 | phcdfDr |

**说明**：从PHCD的DF子节点获取剂型DR，用于查^PHCF剂型字典。

```objectscript
s drugFormDr = $p($g(^PHCD(+phcdfDr,"DF",$p(phcdfDr,"||",2),1)),"^",1)
```

---

#### DRUG_FORM_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `drugFormCode` |
| 匹配模式 | drugFormCode, PHCFormCode, 剂型代码, 药物剂型编码 |
| 取值表达式 | `$p($g(^PHCF(drugFormDr)),"^",1)` |
| Global | `^PHCF` |
| 节点路径 | `^PHCF(drugFormDr)^1` |
| 置信度 | 0.97 |
| 分类 | 药品信息 |
| 条件 | OrderType="R" |
| 依赖 | drugFormDr |

**说明**：药物剂型代码，示例: 片剂/胶囊/注射液/颗粒/口服液/软膏/滴眼液。

```objectscript
s drugFormCode = $p($g(^PHCF(drugFormDr)),"^",1)
```

---

#### DRUG_FORM_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `drugFormDesc` |
| 匹配模式 | drugFormDesc, PHCFormName, 剂型名称, 药物剂型名称, YPJXMC |
| 取值表达式 | `$p($g(^PHCF(drugFormDr)),"^",2)` |
| Global | `^PHCF` |
| 节点路径 | `^PHCF(drugFormDr)^2` |
| 置信度 | 0.97 |
| 分类 | 药品信息 |
| 条件 | OrderType="R" |
| 依赖 | drugFormDr |

**说明**：药物剂型名称。

```objectscript
s drugFormDesc = $p($g(^PHCF(drugFormDr)),"^",2)
```

---

#### DRUG_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `drugCode` |
| 匹配模式 | drugCode, DrugCode, 药品编码, 药学项编码, OrderMedCode |
| 取值表达式 | `$p($g(^PHCD(+phcdfDr,1)),"^",1)` |
| Global | `^PHCD` |
| 节点路径 | `^PHCD(phcDr,1)^1` |
| 置信度 | 0.97 |
| 分类 | 药品信息 |
| 条件 | OrderType="R" |
| 依赖 | phcdfDr |

**说明**：药品通用名编码，从PHCD主节点获取。

```objectscript
s drugCode = $p($g(^PHCD(+phcdfDr,1)),"^",1)
```

---

#### DRUG_NAME

| 属性 | 值 |
|------|-----|
| 标准名 | `drugName` |
| 匹配模式 | drugName, DrugName, 药品通用名, 药学项名称, OrderMedName |
| 取值表达式 | `$p($g(^PHCD(+phcdfDr,1)),"^",2)` |
| Global | `^PHCD` |
| 节点路径 | `^PHCD(phcDr,1)^2` |
| 置信度 | 0.97 |
| 分类 | 药品信息 |
| 条件 | OrderType="R" |
| 依赖 | phcdfDr |

**说明**：药品通用名（从PHCD获取），注意与INCI_Desc（库存项描述）不同。

```objectscript
s drugName = $p($g(^PHCD(+phcdfDr,1)),"^",2)
```

---

#### DRUG_SPEC

| 属性 | 值 |
|------|-----|
| 标准名 | `drugSpec` |
| 匹配模式 | drugSpec, OrderSpec, 药品规格, YPGG |
| 取值表达式 | `##class(web.dHCST.Common.DrugInfoCommon).GetSpec("",incItmDr)` |
| Global | 外部方法调用 |
| 置信度 | 0.90 |
| 分类 | 药品信息 |
| 条件 | OrderType="R" |

**说明**：⚠️ 外部方法调用！需要先通过医嘱项代码查找^INCI库存项DR，再调用GetSpec获取规格。

```objectscript
s incItmDr = $o(^INCI(0,"Code",arcimCode,0))
i incItmDr'="" s drugSpec = ##class(web.DHCSTCOMMONSRV).getBarcode(incItmDr)
```

---

#### TOTAL_DOSE

| 属性 | 值 |
|------|-----|
| 标准名 | `totalDose` |
| 匹配模式 | totalDose, OrderTotalDose, 总剂量, PackQty |
| 取值表达式 | `$p($g(^OEORD(ordId,"I",ordItm,9)),"^",4)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ordId,"I",ordItm,9)^4` |
| 置信度 | 0.98 |
| 分类 | 药品信息 |

**说明**：总剂量/包装数量，位于OEORD第9节点^4位置。

```objectscript
s totalDose = $p($g(^OEORD(ordId,"I",ordItm,9)),"^",4)
```

---

### 医嘱执行类

---

#### OEORI_LONG_SHORT_FLAG

| 属性 | 值 |
|------|-----|
| 标准名 | `oeoriLongShortFlag` |
| 匹配模式 | oeoriLongShortFlag, CQLSBZ, 长期临时标志, longShortFlag |
| 取值表达式 | `$case($P($g(^OECPR(OrdTypeRowID)),"^",1),"R":"长期","S":"临时",:"")` |
| Global | `^OECPR` |
| 节点路径 | `^OECPR(OrdTypeRowID)^1` |
| 置信度 | 0.98 |
| 分类 | 医嘱属性 |
| 依赖 | OrdTypeRowID |

**说明**：长期/临时医嘱标志，根据医嘱类型代码判断。R=长期医嘱, S=临时医嘱, sT=术前医嘱, T=术后医嘱, pRN=必要时。依赖OrdTypeRowID（从ordstr1^8获取）。

```objectscript
s oeoriLongShortFlag = $case($P($g(^OECPR(OrdTypeRowID)),"^",1),"R":"长期","S":"临时",:"")
```

---

#### ANTI_DRUG_FLAG

| 属性 | 值 |
|------|-----|
| 标准名 | `antiDrugFlag` |
| 匹配模式 | antiDrugFlag, KJYW, 抗菌药物标志, 抗生素标志, isAntiDrug |
| 取值表达式 | `$case($p($g(^OEORD(ordId,"I",ordItm,"X",1)),"^",14),"Y":"1",:"0")` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ordId,"I",ordItm,"X",1)^14` |
| 置信度 | 0.98 |
| 分类 | 医嘱执行 |

**说明**：是否抗菌药物标志，位于执行记录子节点X(1)^14位置。Y=是抗菌药物, 其他=否。

```objectscript
s antiDrugFlag = $case($p($g(^OEORD(ordId,"I",ordItm,"X",1)),"^",14),"Y":"1",:"0")
```

---

#### COL_DATE

| 属性 | 值 |
|------|-----|
| 标准名 | `colDate` |
| 匹配模式 | colDate, ColDate, 采集日期, bbCjRq, collectDate |
| 取值表达式 | `s CollectDate=$p($g(^OEORD(ord,"I","sub","X",1,"NUR")),"^",11) i $l(CollectDate) s CollectDate=$zd(CollectDate,3)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,"X",1,"NUR")^11` |
| 置信度 | 0.95 |
| 分类 | 检验专用(Lab) |
| 条件 | OrdCatDesc='化验费' oR OrdCatDesc='输血费' |

**说明**：⚠️ 检验专用！X子节点=执行记录，'NUR'=护理站执行记录。^11=采集日期。

```objectscript
s CollectDate = $p($g(^OEORD(ord,"I",sub,"X",1,"NUR")),"^",11)
i $l(CollectDate) s CollectDate = $zd(CollectDate,3)
s colDate = CollectDate
```

---

#### COL_TIME

| 属性 | 值 |
|------|-----|
| 标准名 | `colTime` |
| 匹配模式 | colTime, ColTime, 采集时间, bbCjSj, collectTime |
| 取值表达式 | `s CollectTime=$p($g(^OEORD(ord,"I","sub","X",1,"NUR")),"^",12) i $l(CollectTime) s CollectTime=$zt(CollectTime,2)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,"X",1,"NUR")^12` |
| 置信度 | 0.95 |
| 分类 | 检验专用(Lab) |
| 条件 | OrdCatDesc='化验费' oR OrdCatDesc='输血费' |

**说明**：⚠️ 检验专用！同上X/NUR节点。^12=采集时间。$zt(,2)格式化注意是2号参数不是默认。

```objectscript
s CollectTime = $p($g(^OEORD(ord,"I",sub,"X",1,"NUR")),"^",12)
i $l(CollectTime) s CollectTime = $zt(CollectTime,2)
s colTime = CollectTime
```

---

#### COL_USER_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `colUserCode` |
| 匹配模式 | colUserCode, ColUserCode, 采集人, bbCjr, collectorCode |
| 取值表达式 | `s UserRowId=$p($g(^OEORD(ord,"I","sub","X",1,"NUR")),"^",10) i UserRowId'="" s ColUserCode=$p($g(^SSU("SSUSR",UserRowId)),"^",1)` |
| Global | `^OEORD`, `^SSU('SSUSR')` |
| 节点路径 | `^OEORD(ord,"I",sub,"X",1,"NUR")^10` → `^SSU("SSUSR",UserRowId)^1` |
| 置信度 | 0.93 |
| 分类 | 检验专用(Lab) |
| 条件 | OrdCatDesc='化验费' oR OrdCatDesc='输血费' |

**说明**：⚠️ 检验专用！X/NUR节点^10=采集人UserRowID → SSU字典查登录名。采集人与开嘱医生/录入者都可能是不同的人。

```objectscript
s UserRowId = $p($g(^OEORD(ord,"I",sub,"X",1,"NUR")),"^",10)
i UserRowId'="" s ColUserCode = $p($g(^SSU("SSUSR",UserRowId)),"^",1)
s colUserCode = ColUserCode
```

---

## 别名映射表

| 标准名 | 别名列表 |
|--------|---------|
| ordRowid | oeRowid, oeRowid, oEORE, oeore, OrdRowID, 医嘱ID, 医嘱序号, 医嘱号 |
| arcimCode | arcimCode, yPDM, ypdm, orderItemCode, 药品代码, 医嘱项代码, 项目编码, 收费项编码 |
| arcimName | arcimDesc, arcimDesc, yPMC, ypmc, orderItemName, 药品名称, 医嘱项名称, 项目名称 |
| dosageQty | dOSE, dose, yL, yl, dOSAGE, 剂量, 用量, 每次用量 |
| freqCode | fREQ, freq, pC, pc, fREQUENCY, 频次代码, 频次编码, yPFS, ypfs |
| usageCode | 用法代码, yfCode, instructionCode, 给药途径 |
| startDate | 开始日期, kSRQ, ksrq, 执行开始日期 |
| startTime | startTime, kSSJ, kssj, 开始时间, 开嘱时间 |
| statusCode | oeStatus, yZZT, yzzt, 医嘱状态 |
| doctorDesc | doctorName, ysName, 医生姓名, 开嘱医生, 主治医师, 医师 |

## 踩坑提示

### ⚠️ 非标字段位置

| 字典 | 标准位置 | 实际位置 | 说明 |
|------|---------|---------|------|
| ^pHCFR (频次) | ^2=描述 | **^3=描述** | 与大多数CT字典不同！ |
| ^pHCDU (疗程) | ^2=描述 | **^3=描述** | 与PHCFR同模式 |
| ^OECPR (类型/优先级) | 独立字段 | **同一位置(ordstr1^8)** | OrdType和Priority复用同一字段 |

### ⚠️ 条件字段

| 字段 | 条件 | 说明 |
|------|------|------|
| stopDocCode/DESC | StatusCode="D" | 仅停嘱状态有效 |
| labNo | OrdCatDesc='化验费'或'输血费' | 检验专用 |
| placeNo | 同上 | 检验专用 |
| extCode | 同上 | 检验专用 |
| arcimLabCode | 同上 | 执行后覆盖ARCIM_CODE |
| specimenCode/NAME | 同上 | 检验专用 |
| colDate/tIME | 同上 | 采集时间 |
| colUserCode | 同上 | 采集人 |

### ⚠️ 外部方法调用

| 字段 | 方法 | 说明 |
|------|------|------|
| pRICE | web.uDHCJFPRICE.GetOrderPrice() | 获取医嘱价格 |
| aPP/recDeptHospCode/DESC | web.DHCENS.Util.Common.GetHospitalByCtLoc() | 获取院区信息 |
| arcimName (bwcode部分) | web.DHCRisApplicationBill.GetBodyPartByOrditem() | 获取放射部位 |

## 规则统计

| 分类 | 规则数 | 说明 |
|------|--------|------|
| 医嘱标识 | 4 | ordRowid, arcimId/sUB/vER |
| 医嘱项信息 | 3 | arcimCode/NAME, itmMastService |
| 医嘱分类 | 6 | 子类/大类 RowID/Code/Desc |
| 医嘱属性 | 6 | 类型/优先级 RowID/Code/Desc |
| 医嘱状态 | 3 | sTATUS RowID/Code/Desc |
| 剂量数量 | 4 | dosageQty, qTY, 单位 |
| 频次信息 | 4 | fREQ RowID/Code/Desc, occTime |
| 用法疗程 | 6 | 用法/疗程 RowID/Code/Desc |
| 收费信息 | 4 | billCode/DESC, pRICE, aMOUNT |
| 科室信息 | 10 | 申请/接收科室 + 院区 |
| 人员信息 | 6 | 医生/录入者 |
| 时间信息 | 4 | 审核/开始日期时间 |
| 附加信息 | 2 | 处方号, 备注 |
| 停医嘱信息 | 2 | 条件字段 |
| 检验专用 | 11 | 条件字段 |
| 药品信息 | 8 | 剂型/药品名称/规格/总剂量 |
| 医嘱执行 | 12 | 执行记录/状态/时间/人员/数量 |
| **合计** | **95** | 含条件字段和辅助方法 |

---

### 医嘱执行类 (OEOrdExec)

> 以下字段从医嘱执行子表 `^OEORD(ord,"I",sub,"X",execSub)` 获取

---

#### EXEC_ROW_ID

| 属性 | 值 |
|------|-----|
| 标准名 | `execRowId` |
| 匹配模式 | execRowId, ExecRowID, 执行ID, 执行记录ID |
| 取值表达式 | `ordId_"||"_ordItm_"||"_execSub` |
| Global | `^OEORD` |
| 置信度 | 0.95 |
| 分类 | 医嘱执行 |

**说明**：执行记录主键，格式: ordId||ordItm||execSub

```objectscript
s execRowId = ordId_"||"_ordItm_"||"_execSub
```

---

#### EXEC_EX_ST_DATE

| 属性 | 值 |
|------|-----|
| 标准名 | `execExStDate` |
| 匹配模式 | execExStDate, ExecExStDate, 执行开始日期, 执行日期 |
| 取值表达式 | `$zd($p(execData,"^",1),3)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,"X",execSub)^1` |
| 置信度 | 0.95 |
| 分类 | 医嘱执行 |

**说明**：OEORE_ExStDate 执行开始日期

```objectscript
s execExStDate = $zd($p(execData,"^",1),3)
```

---

#### EXEC_EX_ST_TIME

| 属性 | 值 |
|------|-----|
| 标准名 | `execExStTime` |
| 匹配模式 | execExStTime, ExecExStTime, 执行开始时间, 执行时间 |
| 取值表达式 | `$zt($p(execData,"^",2))` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,"X",execSub)^2` |
| 置信度 | 0.95 |
| 分类 | 医嘱执行 |

**说明**：OEORE_ExStTime 执行开始时间

```objectscript
s execExStTime = $zt($p(execData,"^",2))
```

---

#### EXEC_QTY_ADMIN

| 属性 | 值 |
|------|-----|
| 标准名 | `execQtyAdmin` |
| 匹配模式 | execQtyAdmin, ExecQtyAdmin, 执行数量, 给药数量 |
| 取值表达式 | `$p(execData,"^",5)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,"X",execSub)^5` |
| 置信度 | 0.95 |
| 分类 | 医嘱执行 |

**说明**：OEORE_QtyAdmin 执行/给药数量

```objectscript
s execQtyAdmin = $p(execData,"^",5)
```

---

#### EXEC_BILLED

| 属性 | 值 |
|------|-----|
| 标准名 | `execBilled` |
| 匹配模式 | execBilled, ExecBilled, 执行计费标志 |
| 取值表达式 | `$p(execData,"^",6)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,"X",execSub)^6` |
| 置信度 | 0.95 |
| 分类 | 医嘱执行 |
| 值域 | B=已计费, TB=待计费, I=忽略, R=退费, P=已支付 |

**说明**：OEORE_Billed 计费标志

```objectscript
s execBilled = $p(execData,"^",6)
```

---

#### EXEC_CTPCP_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `execCtcpDR` |
| 匹配模式 | execCtcpDR, ExecCtcpDR, 执行医护人员DR |
| 取值表达式 | `$p(execData,"^",15)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,"X",execSub)^15` |
| 置信度 | 0.95 |
| 分类 | 医嘱执行 |

**说明**：OEORE_CTPCP_DR 执行医护人员指针 -> CTCareProv

```objectscript
s execCtcpDR = $p(execData,"^",15)
```

---

#### EXEC_ORDER_STATUS_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `execOrderStatusDR` |
| 匹配模式 | execOrderStatusDR, ExecOrderStatusDR, 执行状态DR |
| 取值表达式 | `$p(execData,"^",16)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,"X",execSub)^16` |
| 置信度 | 0.95 |
| 分类 | 医嘱执行 |

**说明**：OEORE_Order_Status_DR 执行状态指针 -> OECOrderAdminStatus

```objectscript
s execOrderStatusDR = $p(execData,"^",16)
```

---

#### EXEC_DATE_EXECUTED

| 属性 | 值 |
|------|-----|
| 标准名 | `execDateExecuted` |
| 匹配模式 | execDateExecuted, ExecDateExecuted, 实际执行日期 |
| 取值表达式 | `$zd($p(execData,"^",19),3)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,"X",execSub)^19` |
| 置信度 | 0.95 |
| 分类 | 医嘱执行 |

**说明**：OEORE_DateExecuted 实际执行日期

```objectscript
s execDateExecuted = $zd($p(execData,"^",19),3)
```

---

#### EXEC_TIME_EXECUTED

| 属性 | 值 |
|------|-----|
| 标准名 | `execTimeExecuted` |
| 匹配模式 | execTimeExecuted, ExecTimeExecuted, 实际执行时间 |
| 取值表达式 | `$zt($p(execData,"^",20))` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,"X",execSub)^20` |
| 置信度 | 0.95 |
| 分类 | 医嘱执行 |

**说明**：OEORE_TimeExecuted 实际执行时间

```objectscript
s execTimeExecuted = $zt($p(execData,"^",20))
```

---

#### EXEC_X_DATE (停止日期)

| 属性 | 值 |
|------|-----|
| 标准名 | `execXDate` |
| 匹配模式 | execXDate, ExecXDate, 执行停止日期 |
| 取值表达式 | `$zd($p(execData,"^",25),3)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,"X",execSub)^25` |
| 置信度 | 0.95 |
| 分类 | 医嘱执行 |

**说明**：OEORE_XDate 执行停止日期

```objectscript
s execXDate = $zd($p(execData,"^",25),3)
```

---

#### EXEC_X_TIME (停止时间)

| 属性 | 值 |
|------|-----|
| 标准名 | `execXTime` |
| 匹配模式 | execXTime, ExecXTime, 执行停止时间 |
| 取值表达式 | `$zt($p(execData,"^",26))` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,"X",execSub)^26` |
| 置信度 | 0.95 |
| 分类 | 医嘱执行 |

**说明**：OEORE_XTime 执行停止时间

```objectscript
s execXTime = $zt($p(execData,"^",26))
```

---

#### EXEC_NOTES (执行备注)

| 属性 | 值 |
|------|-----|
| 标准名 | `execNotes` |
| 匹配模式 | execNotes, ExecNotes, 执行备注 |
| 取值表达式 | `$p(execData,"^",44)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,"X",execSub)^44` |
| 置信度 | 0.90 |
| 分类 | 医嘱执行 |

**说明**：OEORE_Notes 执行备注

```objectscript
s execNotes = $p(execData,"^",44)
```

---

#### EXEC_COVER_MAIN_INS (医保标志)

| 属性 | 值 |
|------|-----|
| 标准名 | `execCoverMainIns` |
| 匹配模式 | execCoverMainIns, ExecCoverMainIns, 执行医保标志 |
| 取值表达式 | `$p(execData,"^",49)` |
| Global | `^OEORD` |
| 节点路径 | `^OEORD(ord,"I",sub,"X",execSub)^49` |
| 置信度 | 0.90 |
| 分类 | 医嘱执行 |
| 值域 | Y=是, N=否 |

**说明**：OEORE_CoverMainIns 医保标志

```objectscript
s execCoverMainIns = $p(execData,"^",49)
```
