---
domain: "zz-custom"
name: "用户自定义规则（实战回流）"
version: "2.0.0"
description: "从已验证通过的编译版接口类中反提的取值规则集.优先级最高(高于自动生成规则),永不自动覆盖.当前来源:InNonDrugOrder(住院非药品医嘱)v4.0编译通过版,涵盖机构/就诊/医嘱/科室/项目/医生/时间/用量/状态/上报等19个核心字段及其完整Global链路."

sourceClass:
  - name: "web.qMJK.InNonDrugOrder (v4.0)"
    description: "深圳全民健康平台-住院非药品医嘱上报接口(编译通过版).本文件所有规则均从此类的生产代码反提验证."
    methods:
      - "主查询方法(隐含) — 遍历^OEORD医嘱表,逐条提取非药品医嘱数据并组装上报JSON"
    verifiedStatus: "✅ 编译通过,已用于生产环境数据上报"

entityGlobals:
  - global: "^OEORD(ordId,\"I\",ordItm)"
    description: "★医嘱明细主表(核心入口!). ordId=医嘱头ID, ordItm=医嘱子项ID. 子节点1/2/3分别存储不同维度的医嘱属性"
    structure: "sub1→^1=arcim(||分割) ^2=duratId ^6=ctloc(科室DR) ^8=oeoriPrfDR(长期临时) ^11=docDR(医生) ^12=dose(用量) ^13=statDR(状态) ^9=startDate ^10=startTime; sub2→^3=uomDR ^15=stopTime; sub3→^34=xDate(停嘱日期)"
    index: "^OEORD(0,\"Date\",mDate,ordId) — 按日期索引遍历医嘱头"
  - global: "^PAADM(admRowId)"
    description: "★就诊记录表(通过ordId关联). admRowId=+$g(^OEORD(ordId))"
    structure: "^1=papmiNo(就诊流水号/住院号) ^2=admType(O/E/I类型) ^81=AdmNo(就诊号)"
  - global: "^ARCIM(arcimMain,arcimVer,1)"
    description: "物品/医嘱项主表(通过ordData1^2解析arcimMain||arcimVer定位). 存储所有收费项(药品/非药品/材料等)的基础信息"
    structure: "^1=代码(CODE) ^2=名称(NAME) ^10=ItemCatRowId(大类别DR→指向^OEC('oRCAT'))"
  - global: "^CTLOC(ctlocCode)"
    description: "科室字典. 通过医嘱sub1^6(ctloc DR)取科室代码和名称"
    structure: "^1=科室代码 ^2=科室名称 ^13=LocType ^22=医院机构DR"
  - global: "^CTPCP(docRowId)"
    description: "人员字典(医生/护士). 通过医嘱sub1^11(开立医生DR)定位. sub1=基本信息 sub3=资质信息"
    structure: "sub1^2=姓名 / sub3^11=执业证书编号"
  - global: "^CT(\"UOM\",uomDr)"
    description: "计量单位字典. 通过医嘱sub2^3(uom DR)定位"
    structure: "^2=单位描述(如'ml','mg','次','袋')"
  - global: "^OEC(\"oRCAT\",catRowId)"
    description: "医嘱大类别字典. 通过^ARCIM^10(ItemCatRowId)定位"
    structure: "^1=类别编码 ^2=类别名称"
  - global: "^OECPR(prfDr)"
    description: "医嘱优先级/长期临时字典. 通过医嘱sub1^8(oeoriPrfDR)定位"
    structure: "^2=描述(长期医嘱/临时医嘱)"
  - global: "^OEC(\"OSTAT\",statDr)"
    description: "医嘱状态字典. 通过医嘱sub1^13(statDR)定位"
    structure: "^2=状态描述(执行/核实/停止/作废)"

relatedDicts:
  - name: "CTLOC(科室)"
    global: "^CTLOC"
    usage: "orderDeptCode/orderDeptName — 科室代码+名称"
  - name: "CTPCP(人员)"
    global: "^CTPCP"
    usage: "docCertificateNo/docName — 医生证书号+姓名"
  - name: "CT(UOM)(单位)"
    global: "^CT(\"UOM\")"
    usage: "orderNumUnit — 用量单位名称"
  - name: "OECPR(医嘱优先级)"
    global: "^OECPR"
    usage: "orderClass — 长期/临时映射"
  - name: "OEC.oRCAT(大类别)"
    global: "^OEC(\"oRCAT\")"
    usage: "orderCategoryCode/orderCategoryName — 大类别编码+名称"
  - name: "OEC.OSTAT(医嘱状态)"
    global: "^OEC(\"OSTAT\")"
    usage: "orderStatus — 执行/核实状态映射"

totalRules: 19
lastUpdated: "2026-05-11"
relatedGlobals:
  - "^OEORD — ★医嘱明细主表,遍历入口,含sub1/sub2/sub3三个子节点"
  - "^PAADM — ★就诊记录,通过ordId关联,取住院号/就诊类型"
  - "^ARCIM — 物品/医嘱项字典,通过arcimMain||arcimVer定位,取代码/名称/大类别"
  - "^CTLOC — 科室字典,取科室代码+名称"
  - "^CTPCP — 人员字典,取医生姓名+执业证书号"
  - "^CT('UOM') — 单位字典,取用量单位名称"
  - "^OEC('oRCAT') — 医嘱大类别字典,取类别编码+名称"
  - "^OECPR — 医嘱优先级字典,长期/临时映射"
  - "^OEC('OSTAT') — 医嘱状态字典,执行/核实映射"
---

# 用户自定义规则（实战回流 v2.0.0）

## 元信息

|| 属性 | 值 ||
|------|-----|
| 域ID | `zz-custom` |
| 版本 | 2.0.0 |
| 规则数 | 19 (机构1 + 就诊1 + 医嘱3 + 科室2 + 项目2 + 大类别2 + 医生2 + 时间2 + 用量2 + 状态2 + 执行1 + 上报1) |
| 核心来源 | web.qMJK.InNonDrugOrder (v4.0 编译通过版) |
| 验证状态 | ✅ 已编译通过,生产环境验证 |
| 优先级 | **最高** — 永不自动覆盖,手动维护 |
| 覆盖业务 | 住院非药品医嘱上报(InNonDrugOrder) |
| 更新时间 | 2026-05-11 |

## 描述

**实战回流的用户自定义规则集**。所有规则均从 `InNonDrugOrder v4.0` 的**编译通过版**生产代码中反提提取,每一条都经过实际数据上报验证。

### 核心设计原则

1. **永不自动覆盖** — 本文件由人工维护,自动生成脚本不得修改
2. **优先级最高** — 当与其他域规则冲突时,以本文件为准
3. **持续回流** — 每完成一个新接口的开发和验证,将新发现的规则追加到此文件
4. **来源可追溯** — 每条规则标注来源类名,方便排查问题

### 数据流架构

```
┌─────────────────────────────────────────────────────────────┐
│                    InNonDrugOrder 数据流                     │
│                                                             │
│  遍历入口                                                    │
│  ^OEORD(0,"Date", mDate, ordId)                             │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────┐   admRowId=+$g(^OEORD(ordId))                  │
│  │ ^OEORD  │──────────────────► ^PAADM(admRowId)            │
│  │ (ordId, │                    ^1=inpatientNo             │
│  │  "I",   │                                               │
│  │  ordItm)│   ordData1=^(...,...,1)                        │
│  │         │──────────────────► ^ARCIM(arcim)               │
│  │ sub1    │   arcim=$p(^2,"||")   ^1=itemCode             │
│  │ sub2    │                     ^2=itemName              │
│  │ sub3    │                     ^10→^OEC("oRCAT")          │
│  └─────────┘        │                                       │
│       │              ▼                                      │
│       │       ┌──────────────┐                              │
│       │       │  ^CTLOC      │◄── sub1^6 → deptCode/NAME  │
│       │       │  ^CTPCP      │◄── sub1^11 → DOC_*/cERT     │
│       │       │  ^CT("UOM")  │◄── sub2^3  → numUnit       │
│       │       │  ^OECPR      │◄── sub1^8  → cLASS(lT/sT)   │
│       │       │  ^OEC("OSTAT")│◄── sub1^13 → sTATUS        │
│       │       └──────────────┘                              │
│       │                                                     │
│       ▼                                                     │
│  输出: $lb(organizCode, inpatientNo, orderId, ...)        │
└─────────────────────────────────────────────────────────────┘
```

---

## 字段映射规则

### ORGANIZ_CODE [ZZ-001]

|| 属性 | 值 ||
|------|-----|------|
| 标准名 | `organizCode` |
| 匹配模式 | organizCode, organizCode, oRGCODE, 机构代码, 组织编码, 统一社会信用代码 |
| 描述关键词 | 机构代码, 组织编码, 统一社会信用代码, 组织机构代码 |
| 取值表达式 | `hospPublicObj.GetAt("organiz_code")` | 数据**上报/采集**时的服务器时间 | `$h`(系统当前时间) | 空格分隔 |
| orderStartTime | 医嘱**开立**的时间 | ordData1^9+^10 | 下划线分隔 |

---

## 规则依赖关系图

```
zZ-001 organizCode ────────────────── 独立(Parameter)
  │
  ├─ zZ-002 inpatientNo ────── 需要 ordId → ^OEORD → ^PAADM
  │
  ├─ zZ-003 orderId ────────── 需要 ordId + ordItm
  │    │
  │    ├─ zZ-004 deptCode ─── 需要 ordData1^6
  │    │    └─ zZ-005 deptName ── 依赖 zZ-004 → ^CTLOC
  │    │
  │    ├─ zZ-006 cLASS ──────── 需要 ordData1^8 → ^OECPR → $case
  │    │
  │    ├─ zZ-007 itemCode ──── 需要 ordData1^2(parse ||) → ^ARCIM
  │    │    ├─ zZ-008 itemName ──── 依赖 zZ-007 (同源^2)
  │    │    ├─ zZ-009 catCode ──── 依赖 zZ-007 (^10) → ^OEC("oRCAT")
  │    │    └─ zZ-010 catName ──── 依赖 zZ-009 (同源^2)
  │    │
  │    ├─ zZ-011 docCert ────── 需要 ordData1^11 → ^CTPCP(sub3)
  │    │    └─ zZ-012 docName ──── 依赖 zZ-011 → ^CTPCP(sub1)
  │    │
  │    ├─ zZ-013 startTime ──── 需要 ordData1^9 + ^10
  │    │
  │    ├─ zZ-015 nUM ─────────── 需要 ordData1^12
  │    │    └─ zZ-016 numUnit ──── 需要 ordData2^3 → ^CT("UOM")
  │    │
  │    ├─ zZ-017 sTATUS ──────── 需要 ordData1^13 → ^OEC("OSTAT") → $case
  │    │
  │    ├─ zZ-018 execStatus ─── 外部方法调用(独立)
  │    │
  │    └─ zZ-014 endTime ────── ⚠️ 需要 ordData2^15 + ordData3^34
  │
  └─ zZ-019 reportDatetime ── 独立($h系统时间)
```

---

## 别名映射表

|| 标准名 | 别名列表 | ZZ编号 | 关联字段 ||
|--------|----------|--------|--------|---------|
| `organizCode` | organizCode, oRGCODE, 机构代码, 组织编码, 统一社会信用代码 | zZ-001 | 独立 |
| `inpatientNo` | inpatientNo, zYH, zyh, admNo, admNo, 住院号, 住院流水号, 就诊流水号 | zZ-002 | 依赖^OEORD→^PAADM |
| `orderId` | orderId, yZID, yzid, oeRowid, oeRowId, 医嘱ID, 医嘱行号, 医嘱序号 | zZ-003 | 独立(ordId||ordItm) |
| `orderDeptCode` | orderDeptCode, kSDM, ksdm, deptCode, deptCode, 科室代码, 医嘱科室代码 | zZ-004 | → zZ-005 |
| `orderDeptName` | orderDeptName, kSMC, ksmc, deptName, deptName, 科室名称 | zZ-005 | ← zZ-004 |
| `orderClass` | orderClass, yZLB, yzlb, 医嘱类别, 长期临时标识 | zZ-006 | 独立(→^OECPR) |
| `orderItemCode` | orderItemCode, yPDM, ypdm, arcimCode, arcimCode, 医嘱项代码, 项目编码 | zZ-007 | → zZ-008/009/010 |
| `orderItemName` | orderItemName, yPMC, ypmc, arcimDesc, arcimDesc, 医嘱项名称, 项目名称 | zZ-008 | ← zZ-007 |
| `orderCategoryCode` | orderCategoryCode, yFLBDM, yflbdm, 大类别编码, orcatCode | zZ-009 | → zZ-010 |
| `orderCategoryName` | orderCategoryName, yFLBMC, yflbmc, 大类别名称, orcatName | zZ-010 | ← zZ-009 |
| `docCertificateNo` | docCertificateNo, ySZSH, yszsh, 医生证书编号, 执业证书编号 | zZ-011 | → zZ-012 |
| `docName` | docName, ySMC, ysmc, doctorName, doctorName, 医生姓名, 开立医生 | zZ-012 | ← zZ-011 |
| `orderStartTime` | orderStartTime, kSSJ, kssj, 开始时间, 开嘱时间, startDatetime | zZ-013 | 独立(sub1^9+^10) |
| `orderEndTime` | orderEndTime, tWSJ, twsj, 停止时间, 停嘱时间, endDatetime | zZ-014 | ⚠️跨sub2+sub3 |
| `orderNum` | orderNum, yL, yl, dOSE, dose, 用量, 剂量, 处方量 | zZ-015 | → zZ-016 |
| `orderNumUnit` | orderNumUnit, yLDW, yldw, doseUnit, doseUnit, 用量单位, UOM | zZ-016 | ← zZ-015 |
| `orderStatus` | orderStatus, yZZT, yzt, 医嘱状态, itemStatus | zZ-017 | 独立(→^OEC OSTAT) |
| `execStatus` | execStatus, zTZT, zttz, 执行状态, orderExecStatus | zZ-018 | 外部方法调用 |
| `reportDatetime` | reportDatetime, sBSJ, sbsj, 上报时间, reportTime | zZ-019 | 独立($h) |

---

## 踩坑提示

### 🔴 高频踩坑(遇到率 > 60%)

| # | 坑点 | 影响 | 解决方案 |
|---|------|------|---------|
| c1 | **ordData1/2/3搞混** | 字段取值全错 | 牢记: sub1=基础(科室/医生/日期/用量), **sub2=单位+停止时间**, **sub3=停嘱日期** |
| c2 | **arcimStr的\|\|分割** | 查不到ARCIM | ordData1^2格式是 `main\|\|ver`,必须用 `$p(str,"\|\|",1/2)` 拆分 |
| c3 | **ORDER_END_TIME跨子表** | 只拿到时间缺日期(或反之) | 日期在**sub3^34**,时间在**sub2^15**,必须读两个节点 |
| c4 | **$case匹配中文描述** | 新增状态类型漏掉 | 用`:default`兜底,如 `"临时":2,"长期":1,:9` |
| c5 | **CTPCP的sub1 vs sub3** | 医生名字拿到证书号 | sub1^2=姓名, sub3^11=证书号,节点号别搞混 |
| c6 | **+$g()的类型转换** | admRowId变成空串 | `+$g()` 强制数值,不加`+`可能是空字符串导致后续$g失败 |

### 🟡 中频注意(遇到率 30~60%)

| # | 要点 | 说明 |
|---|------|------|
| m1 | **EXEC_STATUS外部依赖** | UtilMethod类必须在命名空间存在且编译通过,否则运行时报错 |
| m2 | **$zd/$zt格式约定** | 上报平台对日期格式敏感,统一用 `$zd(,3)`+`$zt(,1)` |
| m3 | **reportDatetime vs startTime** | 前者=采集时刻($h),后者=医嘱开立时刻(ordData1),语义不同 |
| m4 | **Parameter不可硬编码** | ORGANIZ_CODE必须走`..#Parameter`,禁止写死 |
| m5 | **OSTAT归一化** | "执行"和"核实"都算有效(=1),其余都是无效(=2),不是一对一映射 |

### 🟢 低频备忘(< 30%)

| # | 要点 | 说明 |
|---|------|------|
| l1 | **^OEORD索引遍历** | 用 `^OEORD(0,"Date",mDate,ordId)` 按日期遍历,不要全表扫描 |
| l2 | **$g()防null** | 所有用`$g()`取Global值的地方,结果可能为空,下游要做防空处理 |
| l3 | **ORDER_ID双段式** | `ordId\|\|ordItm`是唯一标识,不能只用ordId(一个医嘱头可能有多个子项) |
| l4 | **ORCAT大类别可选** | 部分ARCIM记录的^10可能为空,需防空: `$g(^OEC("oRCAT",ItemCatRowId))` |

### 📐 编码规范总结

| # | 规范 | 来源 |
|---|------|------|
| e1 | **Parameter抽离** | zZ-001: 固定值必须抽象为Parameter |
| e2 | **成对原则** | *_CODE + *_NAME 总是一起出现,共享同一个Dr源 |
| e3 | **描述优于ID** | zZ-006/zZ-017: 用字典描述文字$case映射,不直接用数字ID |
| e4 | **子表意识** | ^OEORD有sub1/sub2/sub3三个数据节点,不同字段分布在不同节点 |
| e5 | **外部方法隔离** | zZ-018: 调用外部方法需明确标注依赖和返回值契约 |
| e6 | **防空第一** | 所有$g()、$p()结果都要假设可能为空 |
