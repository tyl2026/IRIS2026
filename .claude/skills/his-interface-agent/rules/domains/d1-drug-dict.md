---
domain: "d1-drug-dict"
name: "药品字典/基础信息域"
version: "1.0.0"
description: "药品主数据规则集，覆盖药品库存项(INCI)、医嘱项(ARCIM)、通用名(gENERIC)、剂型(dOSGEFORM)、医嘱分类(ARCItemCat/OECOrderCategory)的静态属性。区别于 d0-pharmacy 的流通视角，本域专注'药品是什么'。"

# 数据源遍历配置（供代码生成器使用）
# 药品字典是全量遍历，不需要日期范围
traversal:
  type: "DRUG_DICT"
  viewMatchers: ["药品基本信息", "药品字典", "drug", "medicine", "pharmacy"]
  inputParam:
    name: "inci"
    type: "%String"
    description: "药品库存项RowId"
  # 药品字典使用全量遍历 ^INCI
  index:
    global: "^INCI"
    name: "INCI"
    keys: ["inci"]
    expression: '$o(^INCI(inci))'
  data:
    global: "^INCI"
    variable: "inciData"
    format: "p"
    expression: "$g(^INCI(inci,1))"
  template: |
    // 药品字典全量遍历
    s inci=""
    f  s inci=$o(^INCI(inci)) q:inci=""  d
    .s inciData=$g(^INCI(inci,1))
    .q:inciData=""
    .; 跳过停用药品
    .s notUseFlag=$p($g(^INCI(inci,2)),"^",9)
    .q:notUseFlag="Y"

sourceClass:
  - name: "User.INCItm"
    description: "药品库存项主表。Global=^INCI，RowId自增。每一个库存项=一种药品/材料在库存系统中的记录"
    global: "^INCI"
    storageType: "SQLStorage"
    primaryKey: "INCI_RowId"
  - name: "User.ARCItmMast"
    description: "医嘱项主表。Global=^ARCIM，复合主键(Subscript+Version)。所有可开医嘱/收费的物品源头"
    global: "^ARCIM"
    primaryKey: "ARCIM_Subscript || ARCIM_Version"
  - name: "User.PHCGeneric"
    description: "通用名字典。Global=^PHCGeneric"
    global: "^PHCGeneric"
  - name: "User.ARCItemCat"
    description: "医嘱子类别。Global=^ARC(\"iC\")"
    global: "^ARC(\"iC\")"
  - name: "User.OECOrderCategory"
    description: "医嘱大类别。Global=^OEC(\"oRCAT\")"
    global: "^OEC(\"oRCAT\")"
  - name: "User.cTUOM"
    description: "计量单位字典。Global=^CT(\"UOM\")"
    global: "^CT(\"UOM\")"
  - name: "User.DHCItmAddionInfo"
    description: "物品扩展信息。Global=^DHCITMINFO。非标准实体类，DHC自定义扩展"
    global: "^DHCITMINFO"

entityGlobals:
  - global: "^INCI(inci)"
    description: "★药品库存项主表。inci自增RowId。Node1=基础信息(Code/Desc/UnitCost/UOM等13字段)，Node2=控制信息(NotUseFlag/仓库/库存类别等14字段)，Node3=扩展信息(更新日期/条码/供应商等15字段)"
    structure: |
      Node1 (delimited by ^):
        ^1  = INCI_Code           (药品代码, SQL#44, AlphaUp)
        ^2  = INCI_Desc           (药品名称, SQL#45, AlphaUp)
        ^3  = INCI_OriginalARCIM_DR (关联ARCIM!, SQL#50, 格式 arcSub||arcVer)
        ^4  = INCI_LogQty         (逻辑库存量, SQL#16)
        ^5  = INCI_UnitCost       (单位成本, SQL#28)
        ^6  = INCI_MinQty         (安全库存下限)
        ^7  = INCI_MaxQty         (库存上限)
        ^8  = INCI_ReordLevel     (再订购点)
        ^9  = INCI_ReordQty       (再订购量)
        ^10 = inciCtuomDr       (基本单位 Dr→cTUOM, SQL#13)
        ^11 = INCI_DirtyQty       (脏库存量)
        ^12 = INCI_CTUOM_OutPat_DR (门诊最小发药单位 Dr, SQL#71)
        ^13 = INCI_CTUOM_InPat_DR  (住院最小发药单位 Dr, SQL#72)
      Node2 (delimited by ^):
        ^1  = inciCtlocDr       (主仓库 Dr→CTLOC)
        ^2  = inciIncscDr       (库存类别 Dr→INCStkCat)
        ^9  = INCI_NotUseFlag     (停用标志! Y=停用 N=启用, SQL#38)
        ^10 = INCI_BatchReq       (批号要求: R=必须 O=可选 N=不要)
        ^11 = INCI_ExpReq         (效期要求: R=必须 O=可选 N=不要)
      Node3 (delimited by ^):
        ^1  = INCI_UpdateDate     (最后更新日期, $H格式)
        ^2  = INCI_UpdateTime     (最后更新时间)
        ^3  = INCI_UpdateUser     (更新人 Dr→SSUser)
        ^9  = INCI_BarCode        (条码)
        ^13 = INCI_PrefVendor_DR  (首选供应商)
        ^14 = INCI_PackInstr_DR   (包装说明)
    indexes:
      - "IndexINCICode: ^INCI(0,\"Code\",$$aLPHAUP(Code),RowId)"
      - "IndexINCIDesc: ^INCI(0,\"Desc\",$$aLPHAUP(Desc),RowId)"
      - "IndexARCIMDR: ^INCI(0,\"arcimDr\",+arcSub,RowId) — 条件索引(仅当 OriginalARCIM_DR 非空)"
      - "IndexStockCateg: ^INCI(0,\"StkCat\",incscDr,RowId)"
      - "IndexUpdate: ^INCI(0,\"Update\",UpdateDate,RowId)"
      - "IndexBarCode: ^INCI(0,\"BarCode\",$$aLPHAUP(BarCode),RowId)"
      - "IndexMainStore: ^INCI(0,\"MainStore\",ctlocDr,RowId)"
      - "IndexPOType: ^INCI(0,\"POType\",incpoDr,RowId)"

  - global: "^ARCIM(arcSub,arcVer)"
    description: "医嘱项主表。复合主键(Subscript+Version)。"
    structure: |
      Node1: ^1=Code ^2=Desc ^3=Abbrev ^4=EffDate(生效日期) ^5=EffDateTo(失效日期) ^6=? ^7=? ^8=? ^9=ItemCatDR ^10=? ^12=pHCDFDR(剂型Dr)
      Node8: ^20=GenericDR(通用名Dr→PHCGeneric)
    indexes:
      - "^ARCIM(0,\"Code\",$$aLPHAUP(Code),Sub,Ver)"
      - "^ARCIM(0,\"Desc\",$$aLPHAUP(Desc),Sub,Ver)"

  - global: "^PHCGeneric(dr)"
    description: "通用名字典"
    structure: "^2=通用名"

  - global: "^ARC(\"iC\",dr)"
    description: "医嘱子类别字典"
    structure: "^1=Code ^2=Desc ^8=OrdCatDR(→OEC(\"oRCAT\"))"

  - global: "^OEC(\"oRCAT\",dr)"
    description: "医嘱大类别字典"
    structure: "^1=Code ^2=Desc"

  - global: "^CT(\"UOM\",dr)"
    description: "计量单位字典"
    structure: "^1=Code ^2=Desc"

relatedDicts:
  - name: "INCStkCat"
    global: "^iNC(\"sC\",dr)"
    description: "库存类别字典(^2=类别描述)"
  - name: "DHCItmAddionInfo"
    global: "^DHCITMINFO(infoRowId)"
    description: "物品扩展信息(DHC自定义,非标准实体类). ^4=CountryBasicFlag ^40=ProvinceBasicFlag ^51=PackUomDr ^52=PackFac"

totalRules: 0
lastUpdated: "2026-05-15"
relatedGlobals:
  - "^INCI — ★药品库存项主表(所有药品信息的源头, inci自增)"
  - "^ARCIM — 医嘱项主表(复合主键, 版本管理, 关联ItemCat/Generic/剂型)"
  - "^PHCGeneric — 通用名字典"
  - "^pHCD — 处方剂量(剂型描述在DF子节点)"
  - "^ARC(\"iC\") — 医嘱子类别(桥接到OEC(\"oRCAT\"))"
  - "^OEC(\"oRCAT\") — 医嘱大类别"
  - "^CT(\"UOM\") — 计量单位"
  - "^DHCITMINFO — 物品扩展信息(基药/包装)"
  - "^iNC(\"sC\") — 库存类别"
  - "^CTLOC — 科室/仓库"
---

# 药品字典/基础信息域 (v1.0.0)

## 元信息

| 属性 | 值 |
|------|-----|
| 域ID | `d1-drug-dict` |
| 版本 | 1.0.0 |
| 实体类来源 | User.INCItm (mCP iris_doc 反射), User.ARCItmMast (00-dictionary.md) |
| 数据视角 | **静态字典** — 药品是什么（区别于 d0-pharmacy 的流通视角） |
| 更新时间 | 2026-05-15 |

## 描述

**药品主数据（字典/基础信息）规则集**。覆盖从 `^INCI`（库存项）和 `^ARCIM`（医嘱项）两个主表中提取药品静态属性的取值逻辑。

与 `d0-pharmacy.md` 的关系：
- `d0-pharmacy` 覆盖 **药品流通**：发药/退药 F/H/P/Y → ^DHCINTR台账 → 各业务子表
- `d1-drug-dict` 覆盖 **药品主数据**：^INCI/^ARCIM 字典 → 药品代码/名称/规格/分类/通用名/剂型

---

## ⚠️ 核心认知：INCI 是 ARCIM 的库存视图

```
User.INCItm.INCI_OriginalARCIM_DR  ←→  User.ARCItmMast (arcSub||arcVer)
     (^INCI(inci,1)^3)                     (^ARCIM(arcSub,arcVer))
```

**INCI 不独立存在**——每个库存项都关联一个 ARCIM 医嘱项。获取药品完整信息需要两表联查：

```
^INCI(inci,1)^1 → Code (药品代码)
^INCI(inci,1)^2 → Desc (药品名称)
^INCI(inci,1)^3 → OriginalARCIM_DR → 拆分为 arcSub||arcVer → ^ARCIM(arcSub,arcVer)
                    ├── Node1^9  → ItemCatDR → ^ARC("iC") → ^OEC("oRCAT") [医嘱分类]
                    ├── Node1^12 → pHCDFDR → ^pHCD("dF") [剂型]
                    └── Node8^20 → GenericDR → ^PHCGeneric [通用名]
```

---

## 字段映射规则

### CTMM_Code — 药品代码

| 属性 | 值 |
|------|-----|
| 标准名 | `CTMM_Code` |
| 匹配模式 | CTMM_Code, 药品代码, yPBM, InciCode, ARCIM_Code |
| 取值表达式 | `$p($g(^INCI(inci,1)),"^",1)` |
| Global | `^INCI(inci,1)^1` |
| 实体属性 | `User.INCItm.INCICode` (SQL#44, AlphaUp) |
| 来源 | `User.INCItm` Storage: Node1 Piece1 |
| 置信度 | 1.0 |

---

### CTMM_Desc — 药品名称

| 属性 | 值 |
|------|-----|
| 标准名 | `CTMM_Desc` |
| 匹配模式 | CTMM_Desc, 药品名称, yPMC, InciDesc, ARCIM_Desc |
| 取值表达式 | `$p($g(^INCI(inci,1)),"^",2)` |
| Global | `^INCI(inci,1)^2` |
| 实体属性 | `User.INCItm.INCIDesc` (SQL#45, AlphaUp) |
| 来源 | `User.INCItm` Storage: Node1 Piece2 |
| 置信度 | 1.0 |

---

### CTMM_StatusCode — 状态标志

| 属性 | 值 |
|------|-----|
| 标准名 | `CTMM_StatusCode` |
| 匹配模式 | CTMM_StatusCode, StatusCode, 状态标志, NotUseFlag |
| 取值表达式 | `$s($p($g(^INCI(inci,2)),"^",9)="Y":"1",1:"0")` |
| Global | `^INCI(inci,2)^9` |
| 实体属性 | `User.INCItm.INCINotUseFlag` (SQL#38, vALUELIST=",Y,N") |
| 来源 | `User.INCItm` Storage: Node2 Piece9 |
| 备注 | Y=停用→"1" N=启用→"0"（与接口文档约定一致） |
| 置信度 | 1.0 |

---

### CTMM_UnitPrice — 单价

| 属性 | 值 |
|------|-----|
| 标准名 | `CTMM_UnitPrice` |
| 匹配模式 | CTMM_UnitPrice, UnitPrice, 单价, UnitCost |
| 取值表达式 | `$p($g(^INCI(inci,1)),"^",5)` |
| Global | `^INCI(inci,1)^5` |
| 实体属性 | `User.INCItm.INCIUnitCost` (SQL#28) |
| 来源 | `User.INCItm` Storage: Node1 Piece5 |
| 备注 | 此为单位成本，零售价需查物价表 `^DHCTARI` |
| 置信度 | 0.85 |

---

### CTMM_DosUom — 剂量单位

| 属性 | 值 |
|------|-----|
| 标准名 | `CTMM_DosUom` |
| 匹配模式 | CTMM_DosUom, DosUom, 剂量单位, 发药单位 |
| 取值表达式 | `$p($g(^CT("UOM",$p($g(^INCI(inci,1)),"^",10))),"^",2)` |
| Global | `^INCI(inci,1)^10` → `^CT("UOM")` |
| 实体属性 | `User.INCItm.incictuomDr` (基本/SQL#13) |
| 来源 | `User.INCItm` Storage: Node1 Piece10 |
| 备注 | 优先使用住院发药单位(^12)，其次门诊发药单位(^11)，最后基本单位(^10) |
| 置信度 | 0.95 |

---

### CTMM_OrderCategory / CTMM_OrderChildCategory — 医嘱分类

| 属性 | 值 |
|------|-----|
| 标准名 | `CTMM_OrderCategory` / `CTMM_OrderChildCategory` |
| 匹配模式 | OrderCategory, 医嘱大类/子类, OrdCatCode, OrdSubCatCode |
| 取值表达式 | `s arcimDR=$p($g(^INCI(inci,1)),"^",3) s arcSub=$p(arcimDR,"||",1) s arcVer=$p(arcimDR,"||",2) s itemCatDR=$p($g(^ARCIM(arcSub,arcVer,1)),"^",9) s ordSubCatCode=$p($g(^ARC("IC",itemCatDR)),"^",1) s ordCatDR=$p($g(^ARC("IC",itemCatDR)),"^",8) s ordCatCode=$p($g(^OEC("ORCAT",ordCatDR)),"^",1)` |
| 链路 | INCI.OriginalARCIM_DR → ARCIM.ItemCatDR → ARCItemCat → OECOrderCategory |
| 来源 | `User.INCItm` + `User.ARCItmMast` + `User.ARCItemCat` + `User.OECOrderCategory` |
| 置信度 | 0.95 |

---

### CTMM_GenericName — 通用名

| 属性 | 值 |
|------|-----|
| 标准名 | `CTMM_GenericName` |
| 匹配模式 | CTMM_GenericName, GenericName, 通用名 |
| 取值表达式 | `s arcimDR=$p($g(^INCI(inci,1)),"^",3) s arcSub=$p(arcimDR,"||",1) s arcVer=$p(arcimDR,"||",2) s genericDR=$p($g(^ARCIM(arcSub,arcVer,8)),"^",20) s genericName="" i genericDR'="" s genericName=$p($g(^PHCGeneric(genericDR)),"^",2)` |
| 链路 | INCI → ARCIM.Node8^20 → PHCGeneric |
| 来源 | `User.INCItm` + `User.ARCItmMast` + `User.PHCGeneric` |
| 置信度 | 0.90 |

---

### CTMM_DosageFormDesc — 剂型描述

| 属性 | 值 |
|------|-----|
| 标准名 | `CTMM_DosageFormDesc` |
| 匹配模式 | CTMM_DosageFormDesc, DosageFormDesc, 剂型描述 |
| 取值表达式 | `s arcimDR=$p($g(^INCI(inci,1)),"^",3) s arcSub=$p(arcimDR,"||",1) s arcVer=$p(arcimDR,"||",2) s pHCDFDR=$p($g(^ARCIM(arcSub,arcVer,1)),"^",12) s dosageFormDesc="" i pHCDFDR'="" s dosageFormDesc=$p($g(^PHCD(+pHCDFDR,"DF",$p(pHCDFDR,"||",2))),"^",1)` |
| 链路 | INCI → ARCIM.Node1^12 → PHCDrgForm |
| 来源 | `User.INCItm` + `User.ARCItmMast` + `User.PHCDrgForm` |
| 置信度 | 0.85 |

---

### CTMM_StartDate / CTMM_EndDate — 启用/停用日期

| 属性 | 值 |
|------|-----|
| 标准名 | `CTMM_StartDate` / `CTMM_EndDate` |
| 匹配模式 | CTMM_StartDate, StartDate, 启用日期 / CTMM_EndDate, EndDate, 停用日期 |
| 取值表达式 | `s arcimDR=$p($g(^INCI(inci,1)),"^",3) s arcSub=$p(arcimDR,"||",1) s arcVer=$p(arcimDR,"||",2) s startDate=$p($g(^ARCIM(arcSub,arcVer,1)),"^",4) s endDate=$p($g(^ARCIM(arcSub,arcVer,1)),"^",5) i startDate'="" s startDate=$zd(startDate,3) i endDate'="" s endDate=$zd(endDate,3)` |
| Global | `^ARCIM(arcSub,arcVer,1)^4,^5` |
| 来源 | `User.ARCItmMast` EffDate/EffDateTo |
| 置信度 | 0.80 |

---

### CTMM_EssentialMedicine — 国家基本药物

| 属性 | 值 |
|------|-----|
| 标准名 | `CTMM_EssentialMedicine` |
| 匹配模式 | EssentialMedicine, 国家基本药物, BasicFlag, 基药标志 |
| 取值表达式 | `s infoDR=$o(^DHCITMINFO(0,"INCI",inci,0)) s basicFlag="9" i infoDR'="" d .s countryBasicFlag=$p($g(^DHCITMINFO(infoDR)),"^",4) .s provinceBasicFlag=$p($g(^DHCITMINFO(infoDR)),"^",40) .i countryBasicFlag="Y" s basicFlag="1" .e  i provinceBasicFlag="Y" s basicFlag="2"` |
| Global | `^DHCITMINFO(infoDR)^4,^40` |
| 备注 | 非标准实体类，DHC自定义扩展。关联: ^DHCITMINFO(0,"INCI",inci,infoDR) |
| 置信度 | 0.75 |

---

### CTMM_PackingUnit / CTMM_PackingCoefficient — 包装单位/系数

| 属性 | 值 |
|------|-----|
| 标准名 | `CTMM_PackingUnit` / `CTMM_PackingCoefficient` |
| 匹配模式 | PackingUnit, 整包装单位 / PackingCoefficient, 整包转换系数 |
| 取值表达式 | `s infoDR=$o(^DHCITMINFO(0,"INCI",inci,0)) s packUomDr="" s packFac="" i infoDR'="" d .s packUomDr=$p($g(^DHCITMINFO(infoDR)),"^",51) .s packFac=$p($g(^DHCITMINFO(infoDR)),"^",52) s packUomDesc="" i packUomDr'="" s packUomDesc=$p($g(^CT("UOM",packUomDr)),"^",2)` |
| Global | `^DHCITMINFO(infoDR)^51,^52` |
| 置信度 | 0.75 |

---

### CTMM_Spec — 药品规格

| 属性 | 值 |
|------|-----|
| 标准名 | `CTMM_Spec` |
| 匹配模式 | CTMM_Spec, Spec, 药品规格, 规格, YPGG |
| 取值表达式 | `##class(web.dHCST.Common.DrugInfoCommon).GetSpec("",inci)` |
| Global | 外部方法调用 |
| 来源 | `web.dHCST.Common.DrugInfoCommon.GetSpec()` |
| 备注 | 外部方法调用，返回药品规格描述（如"5mg*12片/盒"） |
| 置信度 | 0.90 |

---

### CTMM_Manufacturer — 厂商/生产厂家

| 属性 | 值 |
|------|-----|
| 标准名 | `CTMM_Manufacturer` |
| 匹配模式 | CTMM_Manufacturer, Manufacturer, 厂商, 生产厂家, 制造商 |
| 取值表达式 | `##class(web.dHCST.Common.DrugInfoCommon).GetManf(inci)` |
| Global | 外部方法调用 |
| 来源 | `web.dHCST.Common.DrugInfoCommon.GetManf()` |
| 备注 | 外部方法调用，返回生产厂家名称。也可通过^INCI(inci,3)^13(PrefVendor_DR)→^APC("VEN")获取供应商 |
| 置信度 | 0.85 |

---

### CTMM_BarCode — 条码

| 属性 | 值 |
|------|-----|
| 标准名 | `CTMM_BarCode` |
| 匹配模式 | CTMM_BarCode, BarCode, 条码, 药品条码 |
| 取值表达式 | `$p($g(^INCI(inci,3)),"^",9)` |
| Global | `^INCI(inci,3)^9` |
| 实体属性 | `User.INCItm.INCIBarCode` (SQL#64, AlphaUp) |
| 来源 | `User.INCItm` Storage: Node3 Piece9 |
| 置信度 | 0.90 |

---

### CTMM_UpdateDate — 更新日期

| 属性 | 值 |
|------|-----|
| 标准名 | `CTMM_UpdateDate` |
| 匹配模式 | CTMM_UpdateDate, UpdateDate, 更新日期, 最后更新日期 |
| 取值表达式 | `$p($g(^INCI(inci,3)),"^",1)` |
| Global | `^INCI(inci,3)^1` |
| 实体属性 | `User.INCItm.INCIUpdateDate` (SQL#55) |
| 来源 | `User.INCItm` Storage: Node3 Piece1 |
| 备注 | $H格式日期，需用$zd()转换 |
| 置信度 | 0.90 |

---

## 🔴 高频踩坑

| # | 坑点 | 错误 | 正确 |
|---|------|------|------|
| d1 | **^INCI(inci,1)^3 不是日期** | `s startDate=$p(inci1,"^",3)` | 它是 `OriginalARCIM_DR`！日期在 ^3=UpdateDate |
| d2 | **^INCI 和 ^ARCIM 的联系** | 通过 Code 索引查 ARCIM(`^ARCIM(0,"Code",...)`) | 直接用 `^INCI(inci,1)^3` = `OriginalARCIM_DR` |
| d3 | **NotUseFlag 语义** | Y=启用 | Y=**停用**！vALUELIST=",Y,N" → Y=Yes(停用) N=No(启用) |
| d4 | **单位优先级** | 直接用基本单位 | 住院发药单位(^13) > 门诊发药单位(^12) > 基本单位(^10) |

---

## 索引速查

| 索引名 | Global路径 | 用途 |
|--------|-----------|------|
| IndexINCICode | `^INCI(0,"Code",$$aLPHAUP(code),inci)` | 按代码定位药品 |
| IndexINCIDesc | `^INCI(0,"Desc",$$aLPHAUP(desc),inci)` | 按名称搜索药品 |
| IndexARCIMDR | `^INCI(0,"arcimDr",+arcSub,inci)` | 按ARCIM项反查INCI |
| IndexStockCateg | `^INCI(0,"StkCat",stkCatDR,inci)` | 按库存类别过滤 |
| IndexUpdate | `^INCI(0,"Update",updateDate,inci)` | 按更新日期过滤 |
| IndexBarCode | `^INCI(0,"BarCode",$$aLPHAUP(barcode),inci)` | 按条码查找 |
| IndexMainStore | `^INCI(0,"MainStore",ctlocDR,inci)` | 按主仓库过滤 |
