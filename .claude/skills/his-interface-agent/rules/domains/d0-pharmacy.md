---
domain: "d0-pharmacy"
name: "药品/药房域(完整版)"
version: "2.2.0"
description: "HIS药房业务全量取值规则集,基于web.qMJK.pHA.DrugInfo.cls生产代码+住院/门诊药房数据结构说明.覆盖四大业务类型:F=门诊发药/H=门诊退药/P=住院发药/Y=住院退药.含发药条件规则+退药流程+索引遍历模板."

# 数据源遍历配置（供代码生成器使用）
# 注意：药品域使用按类型+日期索引遍历
traversal:
  type: "pHARMACY"
  viewMatchers: ["pharm", "dispens", "dispensing", "进销存", "库存"]
  inputParam:
    name: "admRowId"
    type: "%String"
    description: "就诊ID"
  preVariables:
    - name: "patDR"
      expression: "$p($g(^PAADM(admRowId)),\"^\",1)"
      description: "患者DR"
  # 药品域使用按类型+日期索引遍历
  index:
    global: "^DHCINTR"
    name: "TypeDate"
    keys: ["type", "date", "intr"]
    expression: '$o(^DHCINTR(0,"TypeDate",type,date,intr))'
  data:
    global: "^DHCINTR"
    variable: "intrData"
    format: "p"
    expression: "$g(^DHCINTR(intr))"
  template: |
    // 药品域需要指定业务类型和日期范围
    // 示例：按类型+日期遍历
    s type="F"  // F=门诊发药/H=门诊退药/P=住院发药/Y=住院退药
    s date=startDate
    f  s date=$o(^DHCINTR(0,"TypeDate",type,date)) q:(date="")!(date>endDate)  d
    .s intr=""
    .f  s intr=$o(^DHCINTR(0,"TypeDate",type,date,intr)) q:intr=""  d
    ..s intrData=$g(^DHCINTR(intr))
    ..i (intrData="") q

# 核心源类（数据逻辑来源）
sourceClass:
  - name: "web.qMJK.pHA.DrugInfo"
    description: "深圳全民健康平台-药房数据上报核心类,继承web.qMJK.Util"
    methods:
      - "tBPMDISPENSING(stDate,endDate,HospitalID) — 11.2.7 药房发药明细(41字段)"
      - "tBPMWAREHOUSESTORAGE(HospitalID) — 11.2.3 药库库存监控(21字段)"
      - "tBPMDRUGROOMSTORAGE(HospitalID) — 11.2.6 药房库存监控(35字段)"
      - "tBMEDMANAGEAEDAES(stDate,endDate) — 11.5.2 不良事件_药品不良事件(~55字段)"
      - "tBTJSJLSCHZ(stDate,endDate) — 11.1.1 业务数据统计报告(9字段)"
    utilityMethods:
      - "GetOeoriByIntr(pointer,type) — 按F/H/P/Y分发获取医嘱ID"
      - "OeoriDateTime(oeori) / OeoriEndDateTime(oeori) / OeoriStopDateTime(oeori) — 医嘱时间计算"
      - "GetORI/GetRetORI/GetPHPORI/GetPHYORI — 各业务类型的医嘱获取"
      - "GetIncPackUom(inci) — 大包装单位"
      - "GetEqUomStr(inci) — 等效单位信息"
      - "GetDrugTypeInfo(inci) — 药品类型(化学药/生物制剂/中成药等9类)"
      - "GetBasicFlag(inci) — 基药属性(国基=1/省基=2/非基=9)"

# 实体表/Global（数据存储来源）
entityGlobals:
  - global: "^DHCINTR(intr)"
    description: "★药房台账主表(核心入口!). 四种业务类型(F/H/P/Y)统一通过此表遍历"
    structure: "^1=时间 ^2=操作人DR ^3=intrTime ^4=spAmt ^6=qty ^7=inclb ^8=uom ^9=pointer(指向单据ID) ^10=Sp(售价) ^13=intrNo ^14=Sp ^16=Rp ^17=RpAmt"
    index: "^DHCINTR(0,\"TypeDate\",Type,Date,intr) — 按类型+日期索引遍历"
  - global: "^DHCPHDISP(pha)"
    description: "门诊发药主表(Type=F时pointer指向此表). pha=dhcPhdisp RowId"
    subscripts: "^1 → 配药/发药人工号(^2/^3), ^2 → 处方号(intrNo/prescno)"
  - global: "^DHCPHRET(phretdr)"
    description: "门诊退药主表(Type=H时pointer指向此表)"
    subscripts: "^18 → 退药审核人工号; RTI子节点 → 退药明细"
  - global: "^DHCPHAC(phretdr,\"I\",phretisub)"
    description: "住院发药明细表(Type=P时pointer指向此表)"
    subscripts: "^5 → 配药人工号, ^7 → oeori(医嘱ID), ^13 → 发药人工号, ^14(I子节点) → 处方号"
  - global: "^pHARET(phretdr)"
    description: "住院退药主表(Type=Y时pointer指向此表)"
    subscripts: "^11 → 退药人工号; I子节点 → 退药明细(^1→oeori)"
  - global: "^INCI(inci)"
    description: "★药品库存项主表(药品字典! 所有药品信息的源头)"
    subscripts: "^1 → ^1=代码 ^2=名称 ^10=buom(基本单位); ^2→^2=StkCatId ^9=NotUseFlag; ^3→^6=puom(药库单位); IB节点→批号/有效期"
  - global: "^INCI(\"ilLoc\",ctloc,Inci)"
    description: "药品-科室-库存项关联索引"
  - global: "^INCI(Inci,\"iL\",iL,\"lB\",lB)"
    description: "库存批次明细(^1=Inclb库存批次串 || Chl批号下标)"
  - global: "^INCI(Inci,\"iB\",Chl)"
    description: "药品批号信息(^1=生产批号BatNo, ^2=有效期ExpDate)"
  - global: "^DHCINCIL(dhcincil)"
    description: "库存批次锁标志表(^1=LockFlag, Y=锁定跳过)"
  - global: "^DHCINGR(Ingd)"
    description: "入库记录表(^1=入库单号RecNo, ^4=入库日期, ^9=入库时间)"
  - global: "^OEORD(ordId,\"I\",ordItm)"
    description: "医嘱明细表(^1→admId(就诊ID), ^2→duratId(疗程), ^3→^7=开嘱日期, ^15=停嘱时间, ^17=开嘱时间, ^34=XDate停嘱日期, ^9→^9=EndDate ^10=EndTime)"
  - global: "^PAADM(admId)"
    description: "就诊记录表(^1=papmi(患者档案RowId), ^81=AdmNo就诊号)"
  - global: "^PAPER(papmi,\"PAT\",1)"
    description: "患者档案表(^1=卡号KH)"

# 关联字典
relatedDicts:
  - name: "CTLOC"
    global: "^CTLOC(ctloc)"
    description: "科室字典(^1=代码, ^2=名称, ^13=LocType, ^22=医院机构DR)"
  - name: "UOM"
    global: "^CT(\"UOM\",uomDr)"
    description: "计量单位字典(^2=单位描述)"
  - name: "HOSP"
    global: "^CT(\"HOSP\",hosdr)"
    description: "医院机构字典(^7=医疗机构组织机构代码YLJGDM)"
  - name: "dHCPHPER"
    global: "^DHCPHPER(userCode)"
    description: "★门诊药房人员字典(仅F/H类型用! ^2=姓名)"
  - name: "SSUSR"
    global: "^SSU(\"SSUSR\",userCode)"
    description: "用户字典(仅P/Y类型用! ^N=姓名)"
  - name: "dHCITMINFO"
    global: "^DHCITMINFO(infoRowId)"
    description: "物品信息扩展表(^4=CountryBasicFlag国基标志, ^40=ProvinceBasicFlag省基标志, ^51=PackUomDr, ^52=PackFac)"
  - name: "ARCIM"
    global: "^ARCIM(arcVer,arcSub,1)"
    description: "基础物品字典(^12→phcdfRowId→PHCD处方剂量)"
  - name: "pHCD"
    global: "^pHCD(phcdId,\"dF\",phcdSub)"
    description: "药品处方剂量表(^4=bUomId, EQ子节点→等效单位)"
  - name: "incSc"
    global: "^iNC(\"sC\",StkCatId)"
    description: "库存类别字典(^2=类别描述, 用于判断药品类型)"
  - name: "dHCSCG"
    global: "^DHCSCG(StkGrpid)"
    description: "采购组类别表(^1=代码, ^2=描述, ^3=StkGrpType(G=药品))"
  - name: "DHCPHARi/dHCPHARW/dHCINVPRT"
    global: "^DHCPHARi(\"pRESCNO\",prescno) → ^DHCPHARW(rowId)^1=pRTDR → ^DHCINVPRT(pRTDR)^14=invno"
    description: "发票链路: 处方号→发票行→发票打印→发票号"

totalRules: 161
lastUpdated: "2026-05-30"
relatedGlobals:
  - "^DHCINTR — ★台账主表,四种业务(F/H/P/Y)统一入口,按Type+Date索引遍历"
  - "^DHCPHDISP — 门诊发药表(F类型:pointer=pha)"
  - "^DHCPHRET — 门诊退药表(H类型:pointer=phretdr, RTI子节点取明细)"
  - "^DHCPHAC — 住院发药表(P类型:pointer^||isub, I子节点)"
  - "^pHARET — 住院退药表(Y类型:pointer, I子节点取oeori)"
  - "^INCI — ★药品库存项主表(所有药品信息的源头, inci=药品RowId)"
  - "^DHCINCIL — 库存批次锁标志(LockFlag=Y跳过)"
  - "^DHCINGR — 入库记录表(RecNo/RecDate/RecTime)"
  - "^OEORD — 医嘱明细表(admId/duratId/开嘱日期/停嘱日期)"
  - "^PAADM — 就诊记录(papmi/AdmNo/HospitalGroup)"
  - "^PAPER — 患者档案(卡号KH)"
  - "^CTLOC — 科室字典(代码/名称/类型/所属医院)"
  - "^CT('UOM') — 单位字典(buom基本单位/puom药库单位)"
  - "^CT('HOSP') — 机构字典(YLJGDM医疗机构代码)"
  - "^DHCPHPER — 门诊药房人员(仅F/H用! 非SSU)"
  - "^SSU('SSUSR') — 系统用户字典(仅P/Y用!)"
  - "^DHCITMINFO — 物品扩展信息(基药标志/包装单位)"
  - "^ARCIM/pHCD — 基础物品/处方剂量(等效单位)"
---

# 药品/药房域(完整版 v2.0.0)

## 元信息

|| 属性 | 值 |
|------|-----|
| 域ID | `d0-pharmacy` |
| 版本 | 2.0.0 |
| 规则数 | 161 (发药明细41 + 药库库存21 + 药房库存35 + 不良事件~55 + 统计9 + 工具方法若干) |
| 核心源类 | web.qMJK.pHA.DrugInfo (继承 web.qMJK.Util) |
| 业务类型 | F=门诊发药 / H=门诊退药 / P=住院发药 / Y=住院退药 |
| 数据来源 | ^DHCINTR台账主表 → 分流至各业务子表 |
| 更新时间 | 2026-05-11 |

## 描述

**HIS药房业务全量取值规则集**。基于 `web.qMJK.pHA.DrugInfo.cls` 生产代码完整提取,覆盖深圳全民健康互联互通标准化要求的五大上报业务表。

### 核心架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                    药房业务数据流架构 (v2.0.0)                        │
│                                                                     │
│  ┌───────────┐                                                       │
│  │ 上报触发   │  按日期范围(stDate~endDate)或全量                      │
│  └─────┬─────┘                                                       │
│        ▼                                                             │
│  ══════════════════════════════════════════════════════════════     │
│  ★ ^DHCINTR 台账主表 (统一入口!)                                     │
│  ══════════════════════════════════════════════════════════════     │
│  索引: ^DHCINTR(0,"TypeDate", Type, Date, intr)                     │
│                                                                     │
│  Type="F" ──→ 门诊发药 ──→ ^DHCPHDISP(pha)                         │
│              ├ prescno=^DHCPHDISP(pha,2)^1                          │
│              ├ 配药人=^DHCPHDISP(pha,1)^3 → ^DHCPHPER(dr)^2         │
│              ├ 发药人=^DHCPHDISP(pha,1)^2 → ^DHCPHPER(dr)^2         │
│              └ 发票链: prescno→^DHCPHARi→^DHCPHARW→^DHCINVPRT^14    │
│                                                                     │
│  Type="H" ──→ 门诊退药 ──→ ^DHCPHRET(phretdr)                       │
│              ├ 审核人=^DHCPHRET(phretdr)^18 → ^DHCPHPER(dr)^2       │
│              ├ 关联发药=^DHCPHRTI(rTI)^11 → ^DHCPHDISP(pha)          │
│              └ intrNo前缀加"R"标识退药                                │
│                                                                     │
│  Type="P" ──→ 住院发药 ──→ ^DHCPHAC(mmm,"I",ddd)                    │
│              ├ prescno=^DHCPHAC^I^5                                 │
│              ├ 配药人=^DHCPHAC^5 → ^SSU("SSUSR")^N                  │
│              ├ 发药人=^DHCPHAC^13 → ^SSU("SSUSR")^N                 │
│              └ oeori=^DHCPHAC^I^7 (医嘱ID)                           │
│                                                                     │
│  Type="Y" ──→ 住院退药 ──→ ^pHARET(phretdr)                         │
│              ├ 退药人=^pHARET^11 → ^SSU("SSUSR")^N                  │
│              └ oeori=^pHARET"I"^1 → ^OEORD^14 → prescno             │
│                                                                     │
│  ══════════════════════════════════════════════════════════════     │
│  共享下游处理 (所有Type汇合后):                                      │
│  ══════════════════════════════════════════════════════════════     │
│                                                                     │
│  inclb = ^DHCINTR(intr)^7  → inci=+inclb                            │
│       ↓                                                             │
│  ^INCI(inci,1) → yPBM(代码)/yPMC(名称)/buom(基本单位)               │
│  ^INCI(inci,"iB",Chl) → sCPH(批号)/yXQ(有效期)                     │
│  ^CTLOC(ctloc) → 科室/药房分类(LocType:1西/2中/3急)                │
│  ^CT("HOSP",hosdr) → yLJGDM(医疗机构代码)                           │
│  GetOeoriByIntr(pointer,Type) → oeori                               │
│       ↓                                                             │
│  OeoriDateTime(oeori) → yYKSSJ(用药开始时间)                         │
│  OeoriEndDateTime(oeori) → dYYJSSJ(用药结束时间)                     │
│                                                                     │
│  最终输出: $lb(41个字段) → ^CacheTemp(repid,ind)                    │
└─────────────────────────────────────────────────────────────────────┘
```

### 四业务类型差异对照

| 维度 | F=门诊发药 | H=门诊退药 | P=住院发药 | Y=住院退药 |
|------|----------|----------|----------|----------|
| **主表** | `^DHCPHDISP(pha)` | `^DHCPHRET(phretdr)` | `^DHCPHAC(mmm,"I",ddd)` | `^pHARET(phretdr)` |
| **人员字典** | `^DHCPHPER`(药房人员) | `^DHCPHPER`(药房人员) | `^SSU("SSUSR")`(系统用户) | `^SSU("SSUSR")`(系统用户) |
| **处方号来源** | `^DHCPHDISP(pha,2)^1` | 同左(关联原始发药) | `^DHCPHAC^I^5` | `^OEORD^14` |
| **发票号** | ✅ 有(通过发票链路) | ✅ 有 | ❌ 无(`""`) | ❌ 无 |
| **业务类别YWLB** | `"1"`(门诊) | `"1"`(门诊) | `"2"`(住院) | `"2"`(住院) |
| **发退标志FTYBZ** | `"1"`(发药) | `"2"`(退药) | `"1"`(发药) | `"2"`(退药) |
| **intrNo前缀** | 原始处方号 | `"R"_原处方号 | 无特殊 | 无特殊 |
| **配药人fallback** | 空→用发药人替代 | - | 空→用发药人替代 | - |
| **医嘱获取方法** | `GetORI(pointer)` | `GetRetORI(pointer)` | `GetPHPORI(pointer)` | `GetPHYORI(pointer)` |

---

# 第一章: TB_PM_DISPENSING 药房发药明细 (11.2.7)

> **Query**: `tBPMDISPENSING(stDate, endDate, HospitalID)`  
> **输出字段数**: 41 (+ 2预留YLYL1/yLYL2)  
> **数据源**: `^DHCINTR` → 按 Type∈{F,H,P,Y} 分流 → 各自业务表 → `^INCI`/`^CTLOC`/`^OEORD`

## 1.1 YLJGDM — 医疗机构组织机构代码

|| 属性 | 值 |
|------|-----|
#### YLJGDM

| 标准名 | `yLJGDM` |
| 匹配模式 | yLJGDM |
术语编码 | - |
| 取值表达式 | `$p(^CT("HOSP", hosdr), "^", 7)` |
| 来源链路 | `admId=$p(^OEORD(ordId),"^",1)` → `hosdr=##class(web.UDHCHospitalGroup).GetHospitalByAdm(admId)` → `^CT("HOSP",hosdr)^7` |
| Global | `^CT("HOSP",hosdr)` |
| 类型 | 字符串(22位), 必填, 复合主键 |
| 置信度 | 0.99 |

```objectscript
s admId = $p(^OEORD(ordId), "^", 1)
s hosdr = ##class(web.UDHCHospitalGroup).GetHospitalByAdm(admId)
s yLJGDM = $p(^CT("HOSP", hosdr), "^", 7)
```

---

## 1.2 FYMXLSH — 发药明细流水号

|| 属性 | 值 |
|------|-----|
#### FYMXLSH

| 标准名 | `fYMXLSH` |
| 匹配模式 | fYMXLSH |
取值表达式 | `pointer` (即 `^DHCINTR(intr)^9`, 直接使用台账的指针字段) |
| 说明 | 复合主键, 标识唯一一条发药明细记录 |
| 格式 | 字符串50位 |
| 置信度 | 1.0 |

```objectscript
s pointer = $p(intrData, "^", 9)  ; dHCINTR^9 = pointer(指向单据ID)
s fYMXLSH = pointer
```

> ⚠️ **pointer格式因业务类型而异**:
> - F类型: 纯数字(=pha, dHCPHDISP RowId)
> - H类型: `phretdr\|\|phretisub` 格式(dHCPHRET RowId \|\| RTI子节点)
> - P类型: `mmm\|\|ddd\|\|1` 格式(dHCPHAC RowId \|\| I子节点 \|\| 固定1)
> - Y类型: `phretdr\|\|phretisub` 格式(pHARET RowId \|\| I子节点)

---

## 1.3 FTYBZ — 发退药标志

|| 属性 | 值 |
|------|-----|
#### FTYBZ

| 标准名 | `fTYBZ` |
| 匹配模式 | fTYBZ |
取值表达式 | `$select((Type="F")||(Type="P"): "1", 1: "2")` |
| 编码含义 | `1`=发药, `2`=退药 |
| 判断逻辑 | F/P → "1"(发), H/Y → "2"(退) |
| 类型 | 字符1位, 必填 |
| 置信度 | 1.0 |

```objectscript
s UpLoadFlag = ""
i ((Type="F")||(Type="P")) s UpLoadFlag = "1"     ; 发药
i ((Type="Y")||(Type="H")) s UpLoadFlag = "2"     ; 退药
s fTYBZ = UpLoadFlag
```

---

## 1.4 YWLB — 业务类别

|| 属性 | 值 |
|------|-----|
#### YWLB

| 标准名 | `yWLB` |
| 匹配模式 | yWLB |
取值表达式 | `$select(prescno["I": "2", 1: "1")` |
| 编码含义 | `1`=门诊, `2`=住院 |
| 判断依据 | 处方号包含字母`"I"`→住院, 否则→门诊 |
| 类型 | 字符1位, 必填 |
| 置信度 | 0.98 |
| ⚠️注意 | 通过prescno推断而非直接用Type! 因为处方号是更可靠的业务标识 |

```objectscript
s UpLoadType = "1"           ; 默认门诊
i prescno["I"] s UpLoadType = "2"  ; 处方号含"I"→住院
s yWLB = UpLoadType
```

---

## 1.5 KH — 卡号

|| 属性 | 值 |
|------|-----|
#### KH

| 标准名 | `kH` |
| 匹配模式 | kH |
取值表达式 | `$p(^PAPER(papmi, "PAT", 1), "^", 1)` |
| 来源链路 | `papmi = $p(^PAADM(admId), "^", 1)` → `^PAPER(papmi,"PAT",1)^1` |
| Global | `^PAPER` |
| 类型 | 字符串64位, 必填 |
| 置信度 | 0.99 |

```objectscript
s papmi = $p(^PAADM(admId), "^", 1)
s kH = $p(^PAPER(papmi, "PAT", 1), "^", 1")
```

---

## 1.6 KLX — 卡类型

|| 属性 | 值 |
|------|-----|
#### KLX

| 标准名 | `kLX` |
| 匹配模式 | kLX |
取值表达式 | **固定值 `"3"`** |
| 说明 | 参照 sZ02.02.002 就诊卡类型代码表 |
| 类型 | 字符串16位, 必填 |
| 置信度 | 0.95 |
| ⚠️注意 | 当前实现写死为`"3"`, 如系统有多种卡类型需动态化 |

```objectscript
s kLX = "3"  ; 固定卡类型
```

---

## 1.7 JZLSH — 就诊流水号

|| 属性 | 值 |
|------|-----|
#### JZLSH

| 标准名 | `jZLSH` |
| 匹配模式 | jZLSH |
取值表达式 | `admId` (即 `$p(^OEORD(ordId), "^", 1)`) |
| 说明 | 门诊对应门诊流水号, 住院对应住院流水号 |
| 关联 | 与 PAADM 的 admRowId 一致 |
| 类型 | 字符串50位, 必填 |
| 置信度 | 0.99 |

```objectscript
s admId = $p(^OEORD(ordId), "^", 1)
s jZLSH = admId
```

---

## 1.8 CFH — 处方号

|| 属性 | 值 |
|------|-----|
#### CFH

| 标准名 | `cFH` |
| 匹配模式 | cFH |
取值表达式 | `prescno` (各类型获取路径不同, 见下方) |
| 门诊(F/H) | `^DHCPHDISP(pha, 2)^1` |
| 住院(P) | `^DHCPHAC(phretdr, "I", phretisub)^5` |
| 住院退(Y) | `^OEORD(Oeorid)^14` → 从医嘱反推 |
| 类型 | 字符串64位, 必填 |
| 置信度 | 0.97 |

```objectscript
; ===== 各业务类型的处方号获取 =====

; F: 门诊发药
i Type="F" d
 . s pha = +pointer
 . s prescno = $p(^DHCPHDISP(pha, 2), "^", 1)

; H: 门诊退药(先找到关联的发药记录再取处方号)
i Type="H" d
 . s phretdr = +pointer, phretisub = $p(pointer, "||", 2)
 . s phdlb = $p(^DHCPHRTI(phretdr, "rTI", phretisub), "^", 11)
 . s pha = +phdlb
 . s prescno = $p(^DHCPHDISP(pha, 2), "^", 1)
 . s intrNo = "R"_intrNo  ; 退药前缀加R

; P: 住院发药
i Type="P" d
 . s phretdr = +pointer, phretisub = $p(pointer, "||", 2)
 . s prescno = $p(^DHCPHAC(phretdr, "I", phretisub), "^", 5)

; Y: 住院退药(从医嘱反推处方号)
i Type="Y" d
 . s phretdr = +pointer, phretisub = $p(pointer, "||", 2)
 . s Oeorid = $p(^pHARET(phretdr, "I", phretisub), "^", 1)
 . s prescno = $p(^OEORD(+Oeorid, "I", $p(Oeorid, "||", 2), 1), "^", 14)

s cFH = prescno
```

---

## 1.9 SFMXID — 收费明细流水号(发票号)

|| 属性 | 值 |
|------|-----|
#### SFMXID

| 标准名 | `sFMXID` |
| 匹配模式 | sFMXID |
取值表达式 | `invno` (从发票链路获取) |
| 门诊(F/H) | `prescno` → `^DHCPHARi("pRESCNO", prescno)` → `^DHCPHARW(pHAROWID)^1` → `^DHCINVPRT(pRTDR)^14` |
| 住院(P/Y) | **空字符串 `""`** (住院无发票) |
| 类型 | 字符串50位, 有则必填 |
| 置信度 | 0.95 |

```objectscript
; ★ 仅门诊(F/H)有发票号, 住院(P/Y)无!
i (Type="F")||(Type="H") d
 . s pHAROWID = "", pRTDR = "", invno = ""
 . f  s pHAROWID = $o(^DHCPHARi("pRESCNO", prescno, pHAROWID)) q:pHAROWID=""  d
 . . s pRTDR = $p(^DHCPHARW(pHAROWID), "^", 1)   ; 发票ID
 . . q:pRTDR=""
 . s invno = $p($g(^DHCINVPRT(pRTDR)), "^", 14)    ; 发票号
e  d
 . s invno = ""  ; 住院无发票

s sFMXID = invno
```

---

## 1.10 CFMXH — 处方项目明细号码

|| 属性 | 值 |
|------|-----|
#### CFMXH

| 标准名 | `cFMXH` |
| 匹配模式 | cFMXH |
取值表达式 | **当前固定为空 `""`** |
| 说明 | 门诊应填处方项目明细号码, 住院应填医嘱流水号 |
| 类型 | 字符串64位, 必填 |
| 置信度 | 0.80 |
| ⚠️注意 | 生产代码中该字段未赋值(留空), 可能需要后续补充 |

```objectscript
s cFMXH = ""  ; tODO: 待补充实际取值逻辑
```

---

## 1.11 CFYSGH / CFYSXM — 处方医师工号/姓名

|| 属性 | 值 |
|------|-----|
#### CFYSGH

| 标准名 | `cFYSGH` / `cFYSXM` |
| 匹配模式 | cFYSGH |
| 取值表达式 | 当前均为空 `""` |
| 说明 | 应从医嘱记录(^OEORD)或处方表中获取开具医生信息 |
| 类型 | cFYSGH:18位 / cFYSXM:100位, 有则必填 |
| 置信度 | 0.70 |
| ⚠️注意 | 生产代码未实现此字段的赋值! 可从`^OEORD(ordId,"I",ordItm)^4`或类似位置获取 |

```objectscript
s cFYSGH = ""   ; tODO: 待补充
s cFYSXM = ""   ; tODO: 待补充
; 可能的实现方向:
; s docDr = $p($g(^OEORD(ordId, "I", ordItm)), "^", N)
; s cFYSGH = docDr
; s:docDr'="" s cFYSXM = $p($g(^CTPCP(docDr)), "^", 2)
```

---

## 1.12 CFKSDM / CFKSMC — 处方科室代码/名称

|| 属性 | 值 |
|------|-----|
#### CFKSDM

| 标准名 | `cFKSDM` / `cFKSMC` |
| 匹配模式 | cFKSDM |
| 取值表达式 | 当前均为空 `""` |
| 置信度 | 0.70 |
| ⚠️注意 | 与CFYSGH/CFYSXM相同, 生产代码未实现 |

---

## 1.13 YFFL — 药房分类

|| 属性 | 值 |
|------|-----|
#### YFFL

| 标准名 | `yFFL` |
| 匹配模式 | yFFL |
取值表达式 | `LocType` (从科室描述推断) |
| 编码映射 | `1`=西药房 / `2`=中药房 / `3`=急诊药房 |
| 推断逻辑 | `LocDesc["西药房"→1` / `["中药房"→2` / `["急诊药房"→3` |
| 来源 | `ctloc = $p(^INCI(inci,"iL",iL),"^",1)` → `^CTLOC(ctloc)^2=LocDesc` |
| Global | `^INCI` → `^CTLOC` |
| 类型 | 字符1位, 必填 |
| 置信度 | 0.98 |

```objectscript
s inci = +inclb, iL = $p(inclb, "||", 2), lB = $p(inclb, "||", 3)
q:(inci="")||(iL="")||(lB="")
s phloc = $p($g(^INCI(inci, "iL", iL)), "^", 1)
s LocCode = $p($g(^CTLOC(phloc)), "^", 1)
s LocDesc = $p($g(^CTLOC(phloc)), "^", 2)
s LocType = ""
i LocDesc["西药房" s LocType = 1
e  i LocDesc["中药房" s LocType = 2
e  i LocDesc["急诊药房" s LocType = 3
q:LocType=""
s yFFL = LocType
```

---

## 1.14 FYYFDM / FYYFMC — 发药药房代码/名称

|| 属性 | 值 |
|------|-----|
#### FYYFDM

| 标准名 | `fYYFDM` / `fYYFMC` |
| 匹配模式 | fYYFDM |
| 取值表达式 | 当前均为空 `""` |
| 说明 | 应填写具体发药的药房窗口/部门信息 |
| 类型 | 各50位, 有则必填 |
| 置信度 | 0.70 |

---

## 1.15 FYCKBH — 发药窗口编号

|| 属性 | 值 |
|------|-----|
#### FYCKBH

| 标准名 | `fYCKBH` |
| 匹配模式 | fYCKBH |
取值表达式 | 当前为空 `""` |
| 类型 | 字符串100位, 有则必填 |
| 置信度 | 0.70 |

---

## 1.16 LYRGH / LYRXM — 领药人工号/姓名

|| 属性 | 值 |
|------|-----|
#### LYRGH

| 标准名 | `lYRGH` / `lYRXM` |
| 匹配模式 | lYRGH |
| 取值表达式 | 当前均为空 `""` |
| 说明 | 门诊病人领药人为患者本人(填0), 住院为护士或患者本人 |
| 类型 | lYRGH:18位 / lYRXM:100位, 有则必填 |
| 置信度 | 0.70 |

---

## 1.17 PYRGH / PYRXM — 配(退)药人工号/姓名

|| 属性 | 值 |
|------|-----|
#### PYRGH

| 标准名 | `pYRGH` / `pYRXM` |
| 匹配模式 | pYRGH |
| 取值表达式 | 见下方分类型逻辑 |
| F(门诊发药) | `pyUserCode=$p(^DHCPHDISP(pha,1)^3)` → `pyUserName=^DHCPHPER(pyUserCode)^2`; fallback: 用fyUserCode/fyUserName |
| H(门诊退药) | `pyUserCode=$p(^DHCPHRET(phretdr)^18)` → `pyUserName=^DHCPHPER(pyUserCode)^2` |
| P(住院发药) | `pyUserCode=$p(^DHCPHAC(phretdr)^5)` → `pyUserName=^SSU("SSUSR",pyUserCode)^N`; fallback: 用fyUserInfo |
| Y(住院退药) | `pyUserCode=$p(^pHARET(phretdr)^11)` → `pyUserName=^SSU("SSUSR",pyUserCode)^N` |
| 默认值 | 空时填 `"-"` |
| Global(F/H) | **`^DHCPHPER`**(门诊药房人员字典!) |
| Global(P/Y) | **`^SSU("SSUSR")`**(系统用户字典!) |
| 置信度 | 0.97 |
| ⚠️注意 | **F/H和P/Y用的字典不同! 这是最常见的坑!** |

```objectscript
; ===== F: 门诊发药 =====
i Type="F" d
 . s pha = +pointer
 . s pyUserCode = $p(^DHCPHDISP(pha, 1), "^", 3)   ; 配药人工号
 . i pyUserCode'="" s pyUserName = $p(^DHCPHPER(pyUserCode), "^", 2)  ; ★ 用DHCPHPER!
 . s fyUserCode = $p(^DHCPHDISP(pha, 1), "^", 2)   ; 发药人工号
 . i fyUserCode'="" s fyUserName = $p(^DHCPHPER(fyUserCode), "^", 2)
 . s pyUserCode = $s((pyUserCode=""):fyUserCode, 1:pyUserCode)      ; fallback
 . s pyUserName = $s((pyUserName=""):fyUserName, 1:pyUserName)

; ===== H: 门诊退药 =====
i Type="H" d
 . s pyUserCode = $p(^DHCPHRET(phretdr), "^", 18)   ; 退药审核人工号
 . i pyUserCode'="" s pyUserName = $p(^DHCPHPER(pyUserCode), "^", 2)  ; ★ dHCPHPER!

; ===== P: 住院发药 =====
i Type="P" d
 . s pyUserCode = $p(^DHCPHAC(phretdr), "^", 5)     ; 配药人工号
 . i pyUserCode'="" s pyUserName = $p(^SSU("SSUSR", pyUserCode), "^", N)  ; ★ SSU!
 . s fyUserCode = $p(^DHCPHAC(phretdr), "^", 13)    ; 发药人工号
 . i fyUserCode'="" s fyUserName = $p(^SSU("SSUSR", fyUserCode), "^", N)
 . s pyUserName = $s((pyUserName=""):fyUserName, 1:pyUserName)

; ===== Y: 住院退药 =====
i Type="Y" d
 . s pyUserCode = $p(^pHARET(phretdr), "^", 11)     ; 退药人工号
 . i pyUserCode'="" s pyUserName = $p(^SSU("SSUSR", pyUserCode), "^", N)  ; ★ SSU!

; ===== 输出(带默认值) =====
s pYRGH = $s(pyUserCode'="":pyUserCode, 1:"-")
s pYRXM = $s(pyUserName'="":pyUserName, 1:"-")
```

---

## 1.18 HFRGH / HFRXM — 核发人工号/姓名

|| 属性 | 值 |
|------|-----|
#### HFRGH

| 标准名 | `hFRGH` / `hFRXM` |
| 匹配模式 | hFRGH |
| 取值表达式 | `fyUserCode` / `fyUserName` (与1.17同源) |
| 默认值 | 空时填 `"-"` |
| 字典选择 | F/H→`^DHCPHPER`, P/Y→`^SSU("SSUSR")` |
| 置信度 | 0.97 |

```objectscript
s hFRGH = $s(fyUserCode'="":fyUserCode, 1:"-")
s hFRXM = $s(fyUserName'="":fyUserName, 1:"-")
```

---

## 1.19 YPBM — 药品代码(院内)

|| 属性 | 值 |
|------|-----|
#### YPBM

| 标准名 | `yPBM` |
| 匹配模式 | yPBM |
取值表达式 | `$p($g(^INCI(inci, 1)), "^", 1)` |
| 说明 | 院内药品代码, 与药品目录字典外键关联 |
| Global | `^INCI(inci, 1)` — 药品库存项主表第1位 |
| 类型 | 字符串32位, 必填 |
| 置信度 | 1.0 |

```objectscript
s yPBM = $p($g(^INCI(inci, 1)), "^", 1)  ; 院内药品代码
```

---

## 1.20 YPMC — 药品名称(院内)

|| 属性 | 值 |
|------|-----|
#### YPMC

| 标准名 | `yPMC` |
| 匹配模式 | yPMC |
取值表达式 | `$p($g(^INCI(inci, 1)), "^", 2)` |
| Global | `^INCI(inci, 1)^2` |
| 类型 | 字符串512位, 必填 |
| 置信度 | 1.0 |

```objectscript
s yPMC = $p($g(^INCI(inci, 1)), "^", 2)  ; 院内药品名称
```

---

## 1.21 YPZSM — 药品追溯码

|| 属性 | 值 |
|------|-----|
#### YPZSM

| 标准名 | `yPZSM` |
| 匹配模式 | yPZSM |
取值表达式 | **空 `""`** |
| 说明 | 药品追溯码(国家药品追溯体系), 当前系统可能未对接 |
| 类型 | 字符串32位, 有则必填 |
| 置信度 | 0.60 |

---

## 1.22 YPGG — 药品规格

|| 属性 | 值 |
|------|-----|
#### YPGG

| 标准名 | `yPGG` |
| 匹配模式 | yPGG |
取值表达式 | `##class(web.dHCST.Common.DrugInfoCommon).GetSpec("", inci)` |
| 说明 | 调用公共方法获取药品规格描述(如"5mg*12片/盒") |
| 方法归属 | `web.dHCST.Common.DrugInfoCommon` |
| 类型 | 字符串64位, 必填 |
| 置信度 | 0.99 |

```objectscript
s Spec = ##class(web.dHCST.Common.DrugInfoCommon).GetSpec("", inci)
s yPGG = Spec
```

---

## 1.23 FYDM — 发药单位

|| 属性 | 值 |
|------|-----|
#### FYDM

| 标准名 | `fYDM` |
| 匹配模式 | fYDM |
取值表达式 | `buomdesc` (基本单位描述) |
| 计算链路 | `buom = $p(^INCI(inci,1),"^",10)` → `buomdesc = $p($g(^CT("UOM",buom)),"^",2)` |
| Global | `^INCI` → `^CT("UOM")` |
| 类型 | 字符串70位, 必填 |
| 置信度 | 0.99 |

```objectscript
s buomdesc = ""
s buom = $p(^INCI(inci, 1), "^", 10)
i buom'="" s buomdesc = $p($g(^CT("UOM", buom)), "^", 2)
s fYDM = buomdesc
```

---

## 1.24 JCDW — 基础单位

|| 属性 | 值 |
|------|-----|
#### JCDW

| 标准名 | `jCDW` |
| 匹配模式 | jCDW |
取值表达式 | 当前为空 `""` |
| 说明 | 应与FYDM一致(基本单位), 或单独标注最小单位 |
| 类型 | 字符串64位, 有则必填 |
| 置信度 | 0.70 |

---

## 1.25 FYDWXS — 发药单位系数

|| 属性 | 值 |
|------|-----|
#### FYDWXS

| 标准名 | `fYDWXS` |
| 匹配模式 | fYDWXS |
取值表达式 | 当前为空 `""` |
| 公式概念 | `发药单位 = 基础单位 * 发药单位系数` |
| 类型 | 数字8位, 有则必填 |
| 置信度 | 0.70 |

---

## 1.26 DAYS — 用药天数

|| 属性 | 值 |
|------|-----|
#### DAYS

| 标准名 | `dAYS` |
| 匹配模式 | dAYS |
取值表达式 | **固定 `"1"`** |
| 说明 | 当前写死为1天. 实际应从医嘱疗程(duration)计算 |
| 类型 | 数字8位, 必填 |
| 置信度 | 0.85 |
| ⚠️注意 | 生产代码`s duration=1`硬编码, 可优化为读取`^pHCD(duratId)^2`的真实疗程天数 |

```objectscript
s duration = 1  ; 当前硬编码, 建议改为从医嘱读取
s dAYS = duration
```

---

## 1.27 YYCS — 用药次数

|| 属性 | 值 |
|------|-----|
#### YYCS

| 标准名 | `yYCS` |
| 匹配模式 | yYCS |
取值表达式 | **固定 `"1"`** |
| 说明 | 单位: 次/日. 当前硬编码 |
| 类型 | 数字8位, 必填 |
| 置信度 | 0.85 |
| ⚠️注意 | 与DAYS相同, 应从医嘱频率(freq)动态获取 |

```objectscript
s freq = "1"
s yYCS = freq
```

---

## 1.28 YYKSSJ — 用药开始日期时间

|| 属性 | 值 |
|------|-----|
#### YYKSSJ

| 标准名 | `yYKSSJ` |
| 匹配模式 | yYKSSJ |
取值表达式 | `..OeoriDateTime(oeori)` |
| 方法说明 | 解析`^OEORD(ordId,"I",ordItm,3)^7`(开嘱日期) + `^...1^17`(开嘱时间), 拼接为 `YYYYMMDDThhmmss` 格式 |
| 格式 | dATETIME 15位, `YYYYMMDDThhmmss` |
| 前置条件 | 需要 `oeori = ..GetOeoriByIntr(pointer, Type)` 先获取医嘱ID |
| 置信度 | 0.98 |

```objectscript
s oeori = ..GetOeoriByIntr(pointer, Type)
q:oeori=""
s oeoriDateStr = ..OeoriDateTime(oeori)
s yYKSSJ = oeoriDateStr

; OeoriDateTime 内部实现:
; s oeoriDate = $p($g(^OEORD(+oeori, "I", +$p(oeori, "||", 2), 3)), "^", 7)
; s:oeoriDate'="" s oeoriDate = $zd(oeoriDate, 8)
; s oeoriTime = $p($g(^OEORD(+oeori, "I", +$p(oeori, "||", 2), 1)), "^", 17)
; s oeoriTime = $tr($zt(oeoriTime), " :", "")
; q oeoriDate_"_"_oeoriTime
```

---

## 1.29 DYYJSSJ — 用药结束日期时间

|| 属性 | 值 |
|------|-----|
#### DYYJSSJ

| 标准名 | `dYYJSSJ` |
| 匹配模式 | dYYJSSJ |
取值表达式 | `..OeoriEndDateTime(oeori)` |
| 方法说明 | 复杂的时间计算: 开嘱日期+疗程 vs 停嘱日期 vs 预停日期, 三者取最合理值 |
| 决策逻辑 | ①优先取停嘱日期(XDate/XTime) ②否则开嘱日期+duration ③如果开嘱+duration < 停嘱日期 → 用前者 |
| 格式 | `YYYYMMDDThhmmss` |
| 置信度 | 0.96 |

```objectscript
s oeoriEndDateStr = ..OeoriEndDateTime(oeori)
s dYYJSSJ = oeoriEndDateStr

; OeoriEndDateTime 核心逻辑:
; TStopDate = ^OEORD(...,3)^34  (XDate - 停嘱日期)
; TStopTime = ^OEORD(...,2)^15   (XTime - 停嘱时间)
; TExEndDate = ^OEORD(...,9)^9    (OEORI_EndDate)
; TExEndTime = ^OEORD(...,9)^10   (OEORI_EndTime)
; TStopDate = $s(TStopDate="":TExEndDate, 1:TStopDate)
; TStopTime = $s(TStopTime="":TExEndTime, 1:TStopTime)
;
; i TStopDate="" → ordEndDate=oeoriDate+duration
; e  i (oeoriDate+duration)<TStopDate → ordEndDate=oeoriDate+duration
; e  → ordEndDate=TStopDate
```

---

## 1.30 SL — 数量(发药总数量)

|| 属性 | 值 |
|------|-----|
#### SL

| 标准名 | `sL` |
| 匹配模式 | sL |
取值表达式 | `totalQty = qty * uomfac` |
| 计算过程 | ① `qty = $p(^DHCINTR(intr), "^", 6)` (台账原始数量) ② `uom = $p(^DHCINTR(intr), "^", 10)` (台账单位) ③ `uomfac = ##Class(web.dHCSTCOMMONSRV).UOMFac(uom, buom)` (单位换算系数) ④ `totalQty = qty * uomfac` |
| 格式化 | 含小数时保留2位: `$fn(totalQty, "", 2)` |
| 单位 | 基本单位(已换算) |
| 类型 | 数字8位, 必填 |
| 置信度 | 0.99 |

```objectscript
s qty = $p(intrData, "^", 6)        ; dHCINTR^6 = 数量
s uom = $p(intrData, "^", 10)        ; dHCINTR^10 = 单位
s uomfac = ##Class(web.dHCSTCOMMONSRV).UOMFac(uom, buom)  ; 单位转换系数
s totalQty = qty * uomfac
i totalQty["." s totalQty = $fn(totalQty, "", 2)  ; 保留2位小数
s sL = totalQty
```

---

## 1.31 JE — 金额

|| 属性 | 值 |
|------|-----|
#### JE

| 标准名 | `jE` |
| 匹配模式 | jE |
取值表达式 | `totalSpAmt` (= `SpAmt`, 来自台账) |
| 来源 | `SpAmt = $p(^DHCINTR(intr), "^", 8)` |
| 单位 | 元(人民币) |
| 类型 | 数字15位4位小数, 必填 |
| 置信度 | 0.99 |

```objectscript
s SpAmt = $p(intrData, "^", 8)   ; dHCINTR^8 = 售价金额
s totalSpAmt = SpAmt
s jE = totalSpAmt
```

---

## 1.32 YYPLJGSJ / YYPLJGSJDW — 用药频率间隔时间/单位

|| 属性 | 值 |
|------|-----|
#### YYPLJGSJ

| 标准名 | `yYPLJGSJ` / `yYPLJGSJDW` |
| 匹配模式 | yYPLJGSJ |
| 取值表达式 | 均为空 `""` |
| 说明 | 应从医嘱频率配置获取(如 qD=bID=tID 等) |
| 编码参照 | sZ02.02.001 用药频率间隔时间单位代码表 (D=日/H=小时/M=分钟/S=秒) |
| 置信度 | 0.60 |

---

## 1.33 FTYSJ — 发(退)药日期时间

|| 属性 | 值 |
|------|-----|
#### FTYSJ

| 标准名 | `fTYSJ` |
| 匹配模式 | fTYSJ |
取值表达式 | `oeoriDateStr` (复用医嘱开立时间) |
| 格式 | `YYYYMMDDThhmmss` |
| 说明 | 使用医嘱开立时间作为发药时间的近似值 |
| 类型 | dATETIME 15位, 必填 |
| 置信度 | 0.92 |
| ⚠️注意 | 理论上应使用 `^DHCINTR(intr)^3`(intrTime) 作为实际发药时间, 但当前代码用了oeoriDateStr |

```objectscript
s fTYSJ = oeoriDateStr  ; = OeoriDateTime的结果
```

---

## 1.34 XGBZ — 修改标志

|| 属性 | 值 |
|------|-----|
#### XGBZ

| 标准名 | `xGBZ` |
| 匹配模式 | xGBZ |
取值表达式 | **固定 `"0"`** |
| 编码含义 | `0`=正常(新增/更新), `1`=撤销 |
| 类型 | 字符1位, 必填 |
| 置信度 | 1.0 |

```objectscript
s xGBZ = "0"  ; 正常状态
```

---

## 1.35 YWSCSJ — 数据生成日期时间

|| 属性 | 值 |
|------|-----|
#### YWSCSJ

| 标准名 | `yWSCSJ` |
| 匹配模式 | yWSCSJ |
取值表达式 | `oeoriDateStr` (复用医嘱开立时间) |
| 格式 | `YYYYMMDDThhmmss` |
| 类型 | dATETIME 15位, 必填 |
| 置信度 | 0.92 |

---

## 1.36 SJSCSJ — 数据上传日期时间

|| 属性 | 值 |
|------|-----|
#### SJSCSJ

| 标准名 | `sJSCSJ` |
| 匹配模式 | sJSCSJ |
取值表达式 | `$tr($zdt($h, 8, 1), " :", "")` |
| 说明 | 当前系统时间戳, 即数据执行上传的时刻 |
| 格式 | `YYYYMMDDThhmmss` |
| 类型 | dATETIME 15位, 必填 |
| 置信度 | 1.0 |

```objectscript
s sJSCSJ = $tr($zdt($h, 8, 1), " :", "")  ; 当前时间, 去掉冒号和空格
```

---

## 1.37 AdmNo — 就诊号(内部辅助字段)

|| 属性 | 值 |
|------|-----|
#### AdmNo

| 标准名 | `AdmNo` (非上报字段, 但在代码中用到) |
| 匹配模式 | AdmNo |
| 取值表达式 | `$p(^PAADM(admId), "^", 81)` |
| 说明 | 医院内部就诊号(非上报字段, 用于内部关联) |
| Global | `^PAADM(admId)^81` |
| 置信度 | 0.99 |

```objectscript
s AdmNo = $p(^PAADM(admId), "^", 81)
```

---

## 1.38 RecNo / InitDetatilNo — 入库单号/出库明细流水号

|| 属性 | 值 |
|------|-----|
#### RecNo

| 标准名 | `RecNo` / `InitDetatilNo` (内部辅助字段) |
| 匹配模式 | RecNo |
| 取值表达式 | `RecNo = $p(^DHCINGR(Ingd), "^", 1)`; `InitDetatilNo = RecNo_"_"_LastIngditm` |
| 链路 | `LastIngditm = ##class(web.dHCST.Common.DrugStkCommon).GetClbDHCIngr(inclb)` → `Ingd = +LastIngditm` → `^DHCINGR(Ingd)` |
| Global | `^DHCINGR` |
| 置信度 | 0.95 |

```objectscript
s LastIngditm = ##class(web.dHCST.Common.DrugStkCommon).GetClbDHCIngr(inclb)
i LastIngditm'=""  d
 . s Ingd = +LastIngditm
 . s RecData = $g(^DHCINGR(Ingd))
 . q:RecData=""
 . s RecNo = $p(RecData, "^", 1)            ; 入库单号
 . s InitDetatilNo = RecNo_"_"_LastIngditm   ; 出库明细流水号
```

---

# 第二章: TB_PM_WAREHOUSE_STORAGE 药库库存监控 (11.2.3)

> **Query**: `tBPMWAREHOUSESTORAGE(HospitalID)` — 全量扫描, 无日期参数  
> **输出字段数**: 21 (+ 2预留)  
> **数据源**: `^INCI("ilLoc", ctloc, Inci)` → 遍历所有药库科室的所有药品  

## 2.0 架构概览

```
药库库存查询流程:

^INCI("ilLoc",ctloc)  ← 遍历所有有库存项的科室
    │
    ├─ 过滤: ^CTLOC(ctloc)^22 = Thosp (匹配HospitalID)
    ├─ 过滤: ^CTLOC(ctloc)^2 [包含"药库"]
    │
    └─ ^INCI("ilLoc",ctloc,Inci)  ← 该科室下的每个药品
        │
        ├─ InciCode = ^INCI(Inci,1)^1  (药品代码)
        ├─ InciDesc = ^INCI(Inci,1)^2  (药品名称)
        ├─ NotUseFlag = ^INCI(Inci,2)^9  (Y=不可用,跳过!)
        │
        └─ ^INCI(Inci,"iL",iL,"lB",lB)  ← 该药品的每个批次
            │
            ├─ Inclb = Inci_"||"IL_"||"_LB (库存批次串)
            ├─ Incib → Chl (批号下标)
            │
            ├─ ^INCI(Inci,"iB",Chl) → BatNo(批号) / ExpDate(有效期)
            ├─ IncQty = QtyINCLB(Inclb, ssdate)  (实时库存数量)
            ├─ BRp = GetInciLRp(Inci, "", Thosp)  (进货价)
            ├─ BSp = GetPriceElse(Inci, +$h, buom, Thosp) (零售价)
            │
            └─ Manf = GetManf(Inci) → ^3 (生产厂家)
                │
                └─ LastIngditm = GetClbDHCIngr(Inclb)
                    └─ ^DHCINGR(Ingd) → RecNo / RecDate / RecTime
```

## 2.1 ~ 2.21 字段速查表

| # | 标准名 | 取值表达式 |
类型 | 说明 | 置信度 |
|---|--------|----------|------|------|--------|
| 2.1 | `yLJGDM` | `$p(^CT("HOSP",Thosp),"^",7)` | c22 | 医疗机构组织机构代码 | 0.99 |
| 2.2 | `yPKCMXLSJ` | `index` (=Inclb) | c50 | 药品库存明细流水号(复合主键) | 0.99 |
| 2.3 | `kCJKSJ` | `RecDateStr` (=入库日期+时间) | dT15 | 库存统计日期时间 | 0.95 |
| 2.4 | `kSDMYN` | `$p(^CTLOC(ctloc),"^",1)` | c36 | 科室代码(院内) | 0.99 |
| 2.5 | `kSMCYN` | `LocDesc` | c50 | 院内科室名称 | 0.99 |
| 2.6 | `xMLXDM` | `StkGrpTypeCode` | c1 | 药品类别代码(sZ09.04.003) | 0.95 |
| 2.7 | `xMLXMC` | `StkGrpTypeDesc` | c20 | 药品类别名称 | 0.95 |
| 2.8 | `xMDMYN` | `InciCode` | c32 | 项目代码(院内)=yPBM | 0.99 |
| 2.9 | `xMMCYN` | `InciDesc` | c512 | 项目名称(院内)=yPMC | 0.99 |
| 2.10 | `gG` | `Spec`(=GetSpec("",Inci)) | c200 | 规格YPGG | 0.99 |
| 2.11 | `jYSX` | `BasicFlag`(=GetBasicFlag(Inci)) | c1 | 药物基药属性(1国/2省/9非) | 0.97 |
| 2.12 | `yXQ` | `ExpDateMonth` | d8 | 有效期(月数差→YYYYMMDD) | 0.93 |
| 2.13 | `zXDW` | `buomdesc` | c64 | 最小单位=fYDM | 0.99 |
| 2.14 | `yFCFXS` | `""`(空) | n8 | 药房拆分系数(药库场景不适用?) | 0.70 |
| 2.15 | `yKDW` | `puomdesc` | c64 | 药库单位 | 0.99 |
| 2.16 | `yPLXDM` | `DrugTypeCode` | c1 | 药品类型代码(sZ09.04.007) | 0.95 |
| 2.17 | `yPLXMC` | `DrugTypeDesc` | c64 | 药品类型名称 | 0.95 |
| 2.18 | `kCSL` | `IncQty`(=QtyINCLB) | n8 | 库存数量(基本单位) | 0.98 |
| 2.19 | `jHJG` | `BRp`(=GetInciLRp) | n15.4 | 进货价格(元) | 0.97 |
| 2.20 | `lSJ` | `BSp`(=GetPriceElse) | n15.4 | 销售价格(元) | 0.97 |
| 2.21 | `kCJE` | `SpAmt`(=BRp*IncQty) | n15.4 | 库存金额(元) | 0.97 |
| 2.22 | `sCCS` | `Manf`(=GetManf^3) | c70 | 生产厂家 | 0.95 |
| 2.23 | `xGBZ` | `"0"` | c1 | 修改标志(0正常) | 1.0 |
| 2.24 | `sJSCSJ` | `$tr($zdt($h,8,1)," :","")` | dT15 | 数据上传时间 | 1.0 |

---

## 2.25 药品类别获取(XMLXDM/XMLXMC)

|| 属性 | 值 ||
|------|-----||
#### StkGrpTypeCode

| 标准名 | `StkGrpTypeCode` / `StkGrpTypeDesc` ||
| 匹配模式 | StkGrpTypeCode |
| 方法调用 | `StkCatGrpInfo = ##class(web.dHCST.Common.DrugInfoCommon).GetIncStkCatGrp(Inci)` ||
| 过滤条件 | `StkType = $p(StkCatGrpInfo,"^",3)` → 仅处理 `StkType="G"` (药品类) ||
| 下级查询 | `StkGrpid = $p(StkCatGrpInfo,"^",5)` → `..GetStkGrpTypeById(StkGrpid)` ||
| 返回值 | `code_^desc` 格式, code∈{0非药品,1西药,2中成药,3中草药,9其他中药} ||
| 置信度 | 0.95 ||

```objectscript
s StkCatGrpInfo = ##class(web.dHCST.Common.DrugInfoCommon).GetIncStkCatGrp(Inci)
s StkType = $p(StkCatGrpInfo, "^", 3)
q:StkType'="G"   ; 非药品跳过
s StkGrpid = $p(StkCatGrpInfo, "^", 5)
s StkGrpTypeInfo = ..GetStkGrpTypeById(StkGrpid)
s xMLXDM = $p(StkGrpTypeInfo, "^", 1)
s xMLXMC = $p(StkGrpTypeInfo, "^", 2)
```

---

## 2.26 药品类型获取(YPLXDM/YPLXMC)

|| 属性 | 值 ||
|------|-----||
#### DrugTypeCode

| 标准名 | `DrugTypeCode` / `DrugTypeDesc` ||
| 匹配模式 | DrugTypeCode |
| 方法调用 | `DrugTypeInfo = ..GetDrugTypeInfo(inci)` ||
| 编码表 | 1=化学药 / 2=生物制剂 / 3=中成药 / 4=中药材 / 5=中药饮 / 6=中药配方颗粒 / 7=中药超微饮片 / 8=中药超微配方颗粒 / 9=其他 ||
| 判断链路 | `^INCI(inci,2)^2=StkCatId` → `^iNC("sC",StkCatId)^2=StkCatDesc` → 包含匹配 ||
| 默认值 | `9^其他` (inci为空或无^INCI数据时) ||
| 置信度 | 0.97 ||

```objectscript
; GetDrugTypeInfo 内部实现:
s DrugTypeInfo = "9^其他"  ; 默认
q:inci="" DrugTypeInfo
q:'$d(^INCI(inci,2)) DrugTypeInfo
s StkCatId = $p(^INCI(inci, 2), "^", 2)
i StkCatId'="" d
 . s StkCatDesc = $p(^iNC("sC", StkCatId), "^", 2)
 . i StkCatDesc["中成药"  s DrugTypeCode=3,DrugTypeDesc="中成药"
 . e  i StkCatDesc["生物制剂"  s DrugTypeCode=2,DrugTypeDesc="生物制剂"
 . e  i StkCatDesc["中草药饮片"  s DrugTypeCode=5,DrugTypeDesc="中药饮"
 . e  i StkCatDesc["配方颗粒"  s DrugTypeCode=6,DrugTypeDesc="中药配方颗粒"
 . e  i StkCatDesc["超微饮片"  s DrugTypeCode=7,DrugTypeDesc="中药超微饮片"
 . e  i StkCatDesc["超微配方颗粒"  s DrugTypeCode=9,DrugTypeDesc="中药超微配方颗粒"
 . e  i StkCatDesc["中药"  s DrugTypeCode=4,DrugTypeDesc="中药材"
 . e  i StkCatDesc["化学药"  s DrugTypeCode=1,DrugTypeDesc="化学药"
 . e  s DrugTypeCode=9,DrugTypeDesc="其他"
q DrugTypeInfo
```

---

## 2.27 基药属性(JYSX)

|| 属性 | 值 ||
|------|-----||
#### BasicFlag

| 标准名 | `BasicFlag` (jYSX) ||
| 匹配模式 | BasicFlag |
| 方法调用 | `BasicFlag = ..GetBasicFlag(inci)` ||
| 编码含义 | 1=国基药 / 2=省基药 / 9=非基药 ||
| 数据来源 | `^DHCITMINFO(Info)^4=CountryBasicFlag`(Y/N) / `^40=ProvinceBasicFlag`(Y/N) ||
| 优先级 | 国基优先 > 省基 > 非基(默认) ||
| 置信度 | 0.97 ||

```objectscript
; GetBasicFlag 内部实现:
s BasicFlag = 9  ; 默认非基药
q:inci="" BasicFlag
q:'$d(^INCI(inci,2)) BasicFlag
s Info = $o(^DHCITMINFO(0, "INCI", inci, 0))
q:Info="" BasicFlag
s CountryBasicFlag = $p($g(^DHCITMINFO(Info)), "^", 4)
s ProvinceBasicFlag = $p($g(^DHCITMINFO(Info)), "^", 40)
i CountryBasicFlag="Y" s BasicFlag=1      ; 国基药
e  i ProvinceBasicFlag="Y" s BasicFlag=2  ; 省基药
q BasicFlag
```

---

## 2.28 有效期(YXQ) — 月数差算法

|| 属性 | 值 ||
|------|-----||
#### ExpDateMonth

| 标准名 | `ExpDateMonth` (yXQ) ||
| 匹配模式 | ExpDateMonth |
| 计算方法 | `GetDiffMonth(ExpDate, +$h)` = `(Year2-Year1)*12+(Month2-Month1)` 的绝对值 ||
| ExpDate来源 | `+$p($g(^INCI(Inci,"iB",Chl)),"^",2)` (失效期, $H格式) ||
| 过滤 | 已过期(ExpDate<+$h且≠0)的批次直接跳过! ||
| 格式化 | 最终输出为 YYYYMMDD 日期格式(非纯月数) ||
| 置信度 | 0.93 ||

```objectscript
s ExpDate = +$p($g(^INCI(Inci, "iB", Chl)), "^", 2)
q:(ExpDate'=0)&&(ExpDate<+$h)  ; 已过期跳过
i ExpDate'=0  d
 . s ExpDateMonth = ..GetDiffMonth(ExpDate, +$h)
s Expire = ""
i ExpDate'="" s Expire = $zd(ExpDate, 8)
s yXQ = Expire  ; 或 ExpDateMonth(取决于上报要求)
```

---

# 第三章: TB_PM_DRUGROOM_STORAGE 药房库存监控 (11.2.6)

> **Query**: `tBPMDRUGROOMSTORAGE(HospitalID)` — 全量扫描药房(非药库!)  
> **输出字段数**: 35 (+ 2预留)  
> **与药库库存的区别**: 科室过滤条件为 `LocDesc["药房"` (非"药库"), 且多了 `sCPH/bZBS/bZDW/yPCD/dLFLDM/dLFLMC/yPLBDM/yPLBMC/yPGG/yPJL` 等特有字段

## 3.0 与药库库存的核心差异

| 维度 | 药库库存(Ch2) | 药房库存(Ch3) |
|------|-------------|-------------|
| **科室过滤** | `LocDesc["药库"` | `LocDesc["药房"` |
| **流水号名** | `yPKCMXLSH` | `lSH` |
| **特有字段** | 无 | `sCPH(批号)/bZBS(包装倍数)/bZDW(包装单位)/yPCD(产地)/dLFLDM(毒理分类)/dLFLMC(毒理名称)/yPLBDM(一般病历编码)/yPLBMC(一般病历名称)/yPGG(规格)/yPJL(剂量)` |
| **共通字段** | kCSL/jHG/lSJ/kCJE/yXQ/jYSX 等 | 相同 |
| **价格精度** | BRp原精度 | `$fn(BRp,"",3)` 保留3位小数 |

## 3.1 ~ 3.35 字段速查表

| # | 标准名 | 取值表达式 |
特殊说明 |
|---|--------|----------|---------|
| 3.1 | `yLJGDM` | `$p(^CT("HOSP",Thosp),"^",7)` | 同上 |
| 3.2 | `lSH` | `index`(=Inclb) | 药房库存流水号(复合主键) |
| 3.3 | `kCJKSJ` | `RecDateStr` | 库存统计日期时间 |
| 3.4 | `kSDMYN` | `$p(^CTLOC(ctloc),"^",1)` | 科室代码 |
| 3.5 | `kSMCYN` | `LocDesc` | 科室名称 |
| 3.6 | `xMLXDM` | `StkGrpTypeCode` | 药品类别代码 |
| 3.7 | `xMLXMC` | `StkGrpTypeDesc` | 药品类别名称 |
| 3.8 | `xMDMYN` | `InciCode` | 药品代码=yPBM |
| 3.9 | `xMMCYN` | `InciDesc` | 药品名称=yPMC |
| 3.10 | `yPGG` | `Spec` | 规格(独立字段,药库版本嵌在GG里) |
| 3.11 | `jYSX` | `BasicFlag` | 基药属性 |
| 3.12 | `zXDW` | `buomdesc` | 最小单位 |
| 3.13 | `yFCFXS` | `""` | 药房拆分系数 |
| 3.14 | `kCDW` | `puomdesc` | **药房库存单位**(药库用YKDW) |
| 3.15 | `yPLXDM` | `DrugTypeCode` | 药品类型代码 |
| 3.16 | `yPLXMC` | `DrugTypeDesc` | 药品类型名称 |
| 3.17 | `sCPH` | `BatNo` | **★生产批号**(药库版本没有独立输出!) |
| 3.18 | `kCSL` | `IncQty` | 库存数量 |
| 3.19 | `cKSL` | `""`(空) | 当日出库数量(待实现) |
| 3.20 | `rKSL` | `""`(空) | 当日入库数量(待实现) |
| 3.21 | `jHG` | `BRp`(保留3位小数) | 进货价格 |
| 3.22 | `lSJ` | `BSp` | 销售价格 |
| 3.23 | `kCJE` | `SpAmt` | 库存金额(有则必填) |
| 3.24 | `yXQ` | `ExpDateMonth` | 有效期 |
| 3.25 | `bZBS` | `""`(空) | **药品包装倍数**(待从PackFac填充) |
| 3.26 | `bZDW` | `""`(空) | **药品包装单位**(待从PackUomDesc填充) |
| 3.27 | `yPCD` | `""`(空) | **药品产地**(待从Manf填充) |
| 3.28 | `dLFLDM` | `""`(空) | **药品毒理分类代码**(待实现) |
| 3.29 | `dLFLMC` | `""`(空) | **药品毒理分类名称**(待实现) |
| 3.30 | `yPLBDM` | `""`(空) | 一般病历代码(待实现) |
| 3.31 | `yPLBMC` | `""`(空) | 一般病历名称(待实现) |
| 3.32 | `yPJJ` | `eqQty`(=GetEqUomStr^1) | **★等效单位剂量** |
| 3.33 | `xGBZ` | `"0"` | 修改标志 |
| 3.34 | `yWSCSJ` | `kCJKSJ` | 数据生成时间 |
| 3.35 | `sJSCSJ` | `$tr($zdt($h,8,1)," :","")` | 上传时间 |

---

## 3.36 包装单位信息(GetIncPackUom)

|| 属性 | 值 ||
|------|-----||
| 方法名 | `GetIncPackUom(inci)` ||
| 返回格式 | `PackUomDr_^PackUomDesc_^PackFac` ||
| 数据来源 | `^DHCITMINFO(Info)^51=PackUomDr` / `^52=PackFac` → `^CT("UOM",PackUomDr)^2=PackUomDesc` ||
| 用途 | bZBS=PackFac / bZDW=PackUomDesc ||
| 置信度 | 0.95 ||

```objectscript
s PackUomInfo = ..GetIncPackUom(Inci)
s PackUomDesc = $p(PackUomInfo, "^", 2)   ; 包装单位描述
s PackFac = $p(PackUomInfo, "^", 3)       ; 包装倍数
; 注意: 当前代码中BZBS/BZDW未赋值, 但PackUomInfo已计算好了
```

---

## 3.37 等效单位剂量(YPJJ — GetEqUomStr)

|| 属性 | 值 ||
|------|-----||
| 方法名 | `GetEqUomStr(inci)` ||
| 返回格式 | `eqUomStr_^eqQtyStr` ||
| 数据链路 | `^INCI(inci,1)^3=arcItm` → `arcItm^1=arcVer / ^2=arcSub` → `^ARCIM(arcVer,arcSub,1)^12=phcdfRowId` → `phcdId/phcdSub` → `^pHCD(phcdId,"dF",phcdSub,2)^4=bUomId` → `EQ子节点` 遍历等效单位 ||
| 输出格式 | 多组时用逗号分隔: `"mg^10,ml^5"` ||
| 置信度 | 0.90 ||

```objectscript
s EqUomInfo = ..GetEqUomStr(inci)
s eqUomStr = $p(EqUomInfo, "^", 1)   ; 等效单位字符串
s eqQtyStr = $p(EqUomInfo, "^", 2)   ; 对应数量字符串
s eqQty = eqQtyStr_eqUomStr          ; 拼接到一起
s yPJL = eqQty                       ; 药品的剂量
```

---

# 第四章: TB_MEDMANAGE_AE_DAES 药品不良事件 (11.5.2)

> **Query**: `tBMEDMANAGEAEDAES(stDate, endDate)`  
> **输出字段数**: ~55 个  
> **⚠️特殊**: 这是一个**框架模板**, 目前只初始化变量但**没有实际数据填充逻辑**! 所有字段均为空字符串.

## 4.0 重要说明

> **此Query当前为框架代码!** `GetTBMEDMANAGEAEDAES` 标签内只做变量声明和初始赋空, 没有 `d OutputTBMEDMANAGEAEDAES` 的调用. 
> 
> 意味着当前系统中**药品不良事件数据尚未接入**或**数据来源待确定**. 
>
> 以下列出全部55个字段的定义规范(来自全民健康互联互通标准), 供后续开发参考.

## 4.1 ~ 4.55 字段完整定义

| # | 标准名 | 当前值 |
类型 | 必填 | 编码标准 | 说明 |
|---|--------|--------|------|------|---------|------|
| 4.1 | `yLJGDM` | `""` | c22 | ✅ | - | 医疗机构组织机构代码 |
| 4.2 | `jLBH` | `""` | c64 | ✅ | - | 记录编号(复合主键) |
| 4.3 | `jZLSH` | `""` | c50 | 🔲 | - | 就诊流水号(关联门/住) |
| 4.4 | `hZDAH` | `""` | c64 | ✅ | - | 患者档案号(院内唯一) |
| 4.5 | `mZZYBZ` | `""` | c1 | ✅ | sZ02.02.008 | 门诊/住院标志 |
| 4.6 | `bGRQ` | `""` | d8 | ✅ | - | 报告日期(YYYYMMDD) |
| 4.7 | `bLFYSFSJ` | `""` | dT15 | ✅ | - | 不良反应发生日期时间 |
| 4.8 | `bLSJBGLBDM` | `""` | c3 | 🔲 | cT01.00.015 | 不良事件报告类别代码 |
| 4.9 | `bLSJBGLBMC` | `""` | c50 | 🔲 | - | 报告类别名称 |
| 4.10 | `bLSJBGLXDM` | `""` | c2 | 🔲 | cT01.00.008 | 报告类型代码 |
| 4.11 | `bLSJBGLXMC` | `""` | c10 | 🔲 | - | 报告类型名称 |
| 4.12 | `bLSJHZYJBDM` | `""` | c64 | 🔲 | - | 患者原疾病诊断代码 |
| 4.13 | `bLSJHZYJBMC` | `""` | c2000 | ✅ | - | 患者原疾病诊断名称 |
| 4.14 | `hZXM` | `""` | c100 | ✅ | - | 患者姓名 |
| 4.15 | `xBDM` | `""` | c1 | ✅ | gB/t2261.1 | 性别代码(0未知/1男/2女/9未说明) |
| 4.16 | `cSRQ` | `""` | d8 | 🔲 | - | 出生日期 |
| 4.17 | `nLS` | `""` | n3 | 🔲 | - | 年龄(岁, <1岁填0) |
| 4.18 | `nLY` | `""` | c16 | 🔲 | - | 年龄(月, <2周岁必填, 分数格式如3#3/30) |
| 4.19 | `mZDM` | `""` | c2 | 🔲 | gB3304-1991 | 民族代码 |
| 4.20 | `mZMC` | `""` | c20 | 🔲 | - | 民族名称 |
| 4.21 | `tZ` | `""` | n6.2 | 🔲 | - | 体重(kG, 精度≤2) |
| 4.22 | `gRLXDH` | `""` | c20 | 🔲 | - | 个人联系电话 |
| 4.23 | `hZJWYPBLFYBZ` | `""` | c1 | 🔲 | T/F | 既往药品不良反应标志(0否/1是) |
| 4.24 | `hZJZJWYPBLFYBZ` | `""` | c1 | 🔲 | T/F | 家族药品不良反应标志(0否/1是) |
| 4.25 | `bLSJHZJWSDM` | `""` | c30 | 🔲 | cV02.10.005 | 既往史代码(多选用;分隔) |
| 4.26 | `bLSJHZJWSMS` | `""` | c100 | 🔲 | - | 其他既往史描述 |
| 4.27 | `bLSJHZGMSMS` | `""` | c100 | 🔲 | - | 过敏史描述 |
| 4.28 | `bLFYSJMC` | `""` | c100 | ✅ | - | 不良反应事件名称 |
| 4.29 | `bLFYYPFLDM` | `""` | c2 | ✅ | cT01.00.009 | 不良反应药品分类代码 |
| 4.30 | `bLFYYPFLMC` | `""` | c100 | 🔲 | - | 药品分类名称 |
| 4.31 | `yWDMYN` | `""` | c32 | 🔲 | - | 药物代码(院内) |
| 4.32 | `rKDH` | `""` | c50 | 🔲 | - | 入库单号 |
| 4.33 | `pZWH` | `""` | c100 | 🔲 | - | 批准文号 |
| 4.34 | `sPM` | `""` | c100 | 🔲 | - | 商品名 |
| 4.35 | `cPTYM` | `""` | c100 | ✅ | - | 产品通用名 |
| 4.36 | `cPSCCJ` | `""` | c70 | 🔲 | - | 产品生产厂家 |
| 4.37 | `yPSCPH` | `""` | c32 | 🔲 | - | 药品生产批号 |
| 4.38 | `sYPJDM` | `""` | c4 | 🔲 | cV06.00.102 | 药物使用途径代码 |
| 4.39 | `sYTJMC` | `""` | c64 | 🔲 | - | 使用途径名称 |
| 4.40 | `yWSYCJL` | `""` | n15.4 | 🔲 | - | 药物使用次剂量 |
| 4.41 | `yWSYJLDW` | `""` | c64 | 🔲 | - | 剂量单位 |
| 4.42 | `yWSYPL` | `""` | c32 | 🔲 | - | 药物使用频率 |
| 4.43 | `yYKSRQ` | `""` | d8 | ✅ | - | 用药开始日期 |
| 4.44 | `yYJSRQ` | `""` | d8 | 🔲 | - | 用药停止日期 |
| 4.45 | `YYYY` | `""` | c2000 | 🔲 | - | 用药原因 |
| 4.46 | `bLSJGCMS` | `""` | c4000 | 🔲 | - | 不良事件过程描述 |
| 4.47 | `bLSJJGDM` | `""` | c2 | ✅ | cT05.10.016 | 不良事件结果代码 |
| 4.48 | `bLSJJGMC` | `""` | c10 | 🔲 | - | 结果名称 |
| 4.49 | `hYZBZ` | `""` | c1 | 🔲 | T/F | 后遗症标志(0否/1是) |
| 4.50 | `hYZBX` | `""` | c100 | 🔲 | - | 后遗症表现 |
| 4.51 | `sWBZ` | `""` | c1 | 🔲 | T/F | 死亡标志(0否/1是) |
| 4.52 | `zJSY` | `""` | c1000 | 🔲 | - | 直接死因 |
| 4.53 | `sWRQSJ` | `""` | dT15 | 🔲 | - | 死亡日期时间 |
| 4.54 | `tYJLFYZT` | `""` | c2 | 🔲 | cT05.01.006 | 停药/减量后反应状态 |
| 4.55 | `zCSYTYFYBZ` | `""` | c1 | 🔲 | T/F | 再次用药同样反应标志 |
| 4.56 | `yHBYXBZ` | `""` | c2000 | 🔲 | - | 对原患病的影响 |
| 4.57 | `bLSJBGRPJ` | `""` | c2000 | 🔲 | - | 报告人评价 |
| 4.58 | `bLSJBGDWPJ` | `""` | c2000 | 🔲 | - | 报告单位评价 |
| 4.59 | `sCQYXXLY` | `""` | c2 | 🔲 | cT02.01.004 | 生产企业信息来源代码 |
| 4.60 | `bZSM` | `""` | c1000 | 🔲 | - | 备注说明 |
| 4.61 | `bGYSGH` | `""` | c18 | ✅ | - | 报告医师工号 |
| 4.62 | `bGYSXM` | `""` | c100 | ✅ | - | 报告医师姓名 |
| 4.63 | `xGBZ` | `""` | c1 | ✅ | - | 修改标志(0正常/1撤销) |
| 4.64 | `yWSCSJ` | `""` | dT15 | ✅ | - | 数据生成时间 |
| 4.65 | `sJSCSJ` | `""` | dT15 | ✅ | - | 数据上传时间 |

---

# 第五章: TB_TJ_SJL_SCHZ 业务数据统计报告 (11.1.1)

> **Query**: `tBTJSJLSCHZ(stDate, endDate)`  
> **输出字段数**: 9  
> **⚠️同样是框架模板!** 只有变量声明, 没有实际数据填充逻辑.

## 5.1 ~ 5.9 字段定义

| # | 标准名 | 当前值 |
类型 | 必填 | 说明 |
|---|--------|--------|------|------|------|
| 5.1 | `yLJGDM` | `""` | c22 | ✅ | 医疗机构组织机构代码 |
| 5.2 | `sCBM` | `""` | c100 | ✅ | 上传表名(大写, 复合主键) |
| 5.3 | `yWKSSJ` | `""` | c16 | ✅ | 业务开始时间(YYYY-MM-DD 00:00:00) |
| 5.4 | `yCZSL` | `""` | c10 | ✅ | 应传总数量 |
| 5.5 | `yWJSSJ` | `""` | c16 | ✅ | 业务结束时间(YYYY-MM-DD 23:59:59) |
| 5.6 | `mXSJSCBZ` | `""` | c1 | ✅ | 明细数据上传标志(0未上传/1已完成) |
| 5.7 | `sJSHCSJ` | `""` | dT15 | ✅ | 数据生成时间 |
| 5.8 | `sJSCSJ` | `""` | dT15 | ✅ | 数据上传时间 |
| 5.9 | `xGBZ` | `""` | c1 | ✅ | 修改标志(0正常/1撤销) |

---

# 第六章: 工具方法详解 (Utility Methods)

## 6.1 GetOeoriByIntr(pointer, type) — 医嘱ID获取分发器

|| 属性 | 值 ||
|------|-----||
| 功能 | 根据业务指针和类型分发到对应的医嘱获取方法 ||
| 参数 | `pointer`=台账指针, `type`∈{"F","H","P","Y"} ||
| 分发逻辑 | `F→GetORI / H→GetRetORI / P→GetPHPORI / Y→GetPHYORI` ||
| 返回 | `oeori` 字符串(格式: `ordId\|\|ordItm`) 或空 ||
| 置信度 | 0.99 ||

```objectscript
ClassMethod GetOeoriByIntr(pointer, type)
{
 q:(pointer="")||(type="") ""
 s oeori=""
 if type="F"  {
   s oeori = ..GetORI(pointer)
 }elseif type="H" {
   s oeori = ..GetRetORI(pointer)
 }elseif type="P" {
   s oeori = ..GetPHPORI(pointer)
 }elseif type="Y" {
   s oeori = ..GetPHYORI(pointer)
 }
 q oeori
}
```

---

## 6.2 GetORI(PHDISPEN) — 门诊发药医嘱ID

|| 属性 | 值 ||
|------|-----||
| 适用 | Type=F (门诊发药) ||
| 参数 | `pHDISPEN` = pointer(门诊发药RowId) ||
| 数据表 | `^DHCPHDI(mmm,"pHDI",ddd)` — 门诊发药明细 ||
| 取值 | `^DHCPHDI(mmm,"pHDI",ddd)^5` = oeori ||
| 解析 | `mmm=$p(pHDISPEN,"\|\|",1)`, `ddd=$p(pHDISPEN,"\|\|",2)` ||

```objectscript
ClassMethod GetORI(pHDISPEN) As %String
{
 q:pHDISPEN="" ""
 s mmm = $p(pHDISPEN, "||", 1), ddd = $p(pHDISPEN, "||", 2)
 q:'$d(^DHCPHDI(mmm, "pHDI", ddd)) ""
 s oeori = $p(^DHCPHDI(mmm, "pHDI", ddd), "^", 5)
 q oeori
}
```

---

## 6.3 GetRetORI(PHRetI) — 门诊退药医嘱ID

|| 属性 | 值 ||
|------|-----||
| 适用 | Type=H (门诊退药) ||
| 数据表 | `^DHCPHRTI(mmm,"rTI",ddd)` — 门诊退药明细 ||
| 取值 | `^DHCPHRTI(mmm,"rTI",ddd)^2` = oeori ||

```objectscript
ClassMethod GetRetORI(PHRetI) As %String
{
 q:PHRetI="" ""
 s mmm = $p(PHRetI, "||", 1), ddd = $p(PHRetI, "||", 2)
 q:'$d(^DHCPHRTI(mmm, "rTI", ddd)) ""
 s oeori = $p(^DHCPHRTI(mmm, "rTI", ddd), "^", 2)
 q oeori
}
```

---

## 6.4 GetPHPORI(PHDISPEN) — 住院发药医嘱ID

|| 属性 | 值 ||
|------|-----||
| 适用 | Type=P (住院发药) ||
| 数据表 | `^DHCPHAC(mmm,"I",ddd)` — 住院发药明细 ||
| 取值 | `^DHCPHAC(mmm,"I",ddd)^7` = oeori ||
| 参数格式 | `mmm\|\|ddd\|\|1`(第三段固定为1) ||

```objectscript
ClassMethod GetPHPORI(pHDISPEN) As %String
{
 q:pHDISPEN=""
 s mmm = $p(pHDISPEN, "||", 1), ddd = $p(pHDISPEN, "||", 2)
 q:ddd="" ""
 q:'$d(^DHCPHAC(mmm, "I", ddd)) ""
 s oeori = $p(^DHCPHAC(mmm, "I", ddd), "^", 7)
 q oeori
}
```

---

## 6.5 GetPHYORI(PHRetI) — 住院退药医嘱ID

|| 属性 | 值 ||
|------|-----||
| 适用 | Type=Y (住院退药) ||
| 数据表 | `^pHARET(mmm,"I",ddd)` — 住院退药明细 ||
| 取值 | `^pHARET(mmm,"I",ddd)^1` = oeori (注意这里是^1不是^7!) ||
| 后续 | oeori可进一步用于查^OEORD获取处方号等 ||

```objectscript
ClassMethod GetPHYORI(PHRetI) As %String
{
 q:PHRetI="" ""
 s mmm = $p(PHRetI, "||", 1), ddd = $p(PHRetI, "||", 2)
 q:'$d(^pHARET(mmm, "I", ddd)) ""
 s oeori = $p(^pHARET(mmm, "I", ddd), "^", 1)
 q oeori
}
```

---

## 6.6 OeoriDateTime / OeoriEndDateTime / OeoriStopDateTime — 医嘱时间三剑客

| 方法 | 功能 | 核心数据点 | 返回格式 |
|------|------|-----------|---------|
| `OeoriDateTime(oeori)` | 开医嘱时间 | `^OEORD(...,3)^7`(日期) + `^...1^17`(时间) | `YYYYMMDDThhmmss` |
| `OeoriEndDateTime(oeori)` | 用药结束时间 | 开嘱日期+duration vs XDate vs EndDate 三者决策 | `YYYYMMDDThhmmss` |
| `OeoriStopDateTime(oeori)` | 停医嘱时间 | `^...3^34`(XDate) + `^...2^15`(XTime) | `Date_\^_Time_\^_DateStr_\^_TimeStr` |

### OeoriEndDateTime 决策树(最复杂!)

```
输入: oeori = ordId||ordItm
  │
  ├─ 提取关键时间点:
  │   oeoriDate = ^OEORD(ordId,"I",ordItm,3)^7   (开嘱日期)
  │   oeoriTime = ^OEORD(ordId,"I",ordItm,1)^17   (开嘱时间)
  │   duration  = ^pHCD(duratId)^2                 (疗程天数, 默认1)
  │   TStopDate = ^OEORD(...,3)^34                  (停医嘱日期XDate)
  │   TStopTime = ^OEORD(...,2)^15                  (停医嘱时间XTime)
  │   TExEndDate = ^OEORD(...,9)^9                  (预停日期)
  │   TExEndTime = ^OEORD(...,9)^10                 (预停时间)
  │
  ├─ 兜底策略:
  │   TStopDate = $s(TStopDate="":TExEndDate, 1:TStopDate)
  │   TStopTime = $s(TStopTime="":TExEndTime, 1:TStopTime)
  │
  └─ 最终决策:
      if TStopDate == "" → ordEndDate = oeoriDate + duration
      else if (oeoriDate+duration) < TStopDate → ordEndDate = oeoriDate + duration
      else → ordEndDate = TStopDate
```

---

## 6.7 GetTranQty — 台账业务数量汇总

|| 属性 | 值 ||
|------|-----||
| 功能 | 按日期范围+业务类型+库存批次统计业务总量 ||
| 参数 | `StaDate, EndDate, Type, TInclb` (可选, 为空则不过滤特定批次) ||
| 核心 | 遍历`^DHCINTR(0,"TypeDate",Type,Date,intr)`, 累加`qty*uomfac` ||
| 用途 | 统计某药品在指定时间段内的出入库总量 ||
| 置信度 | 0.97 ||

```objectscript
ClassMethod GetTranQty(StaDate, EndDate, Type, TInclb = "")
{
 q:(StaDate="")||(EndDate="")||(Type="") ""
 s StaDate = ..DateHtmlToLogical(StaDate)
 s EndDate = ..DateHtmlToLogical(EndDate)
 s TInci = +TInclb, tIL = $p(TInclb, "||", 2), tLB = $p(TInclb, "||", 3)
 s PhLoc = ""
 i (TInci'="")&&(tIL'="") s PhLoc = $p(^INCI(TInci, "iL", tIL), "^", 1)
 s QtySum = 0
 s Date = 0
 f Date=StaDate:1:EndDate  d
 . s intr=""
 . f  s intr=$o(^DHCINTR(0, "TypeDate", Type, Date, intr)) q:intr=""  d
 .. s IntrData = ^DHCINTR(intr)
 .. s Inclb = $p(IntrData, "^", 7)
 .. q:(TInclb'="")&&(TInclb'=Inclb)
 .. s Inci = $p(IntrData, "^", 15)
 .. q:(TInci'="")&&(TInci'=Inci)
 .. s ctloc = $$lOC^sT01(Inclb)
 .. q:(PhLoc'="")&&(PhLoc'=ctloc)
 .. s IntrQty = $p(IntrData, "^", 6)
 .. s IntrUom = $p(IntrData, "^", 10)
 .. s buom = $p(^INCI(Inci, 1), "^", 10)
 .. s fac = ##class(web.dHCST.Common.UtilCommon).UOMFac(IntrUom, buom)
 .. s IntrQty = IntrQty*fac
 .. s QtySum = QtySum + IntrQty
 q QtySum
}
```

---

# 第七章: 常用遍历模板

## 模板A: 发药明细完整查询(推荐)

```objectscript
; ============================================================
; 模板A: 药房发药明细完整查询 (tBPMDISPENSING)
; 用途: 获取指定日期范围内所有发药/退药记录(门诊+住院)
; 调用: d ##class(%ResultSet).RunQuery("web.qMJK.pHA.DrugInfo",
;       "tBPMDISPENSING", "2025-08-01", "2025-08-10", "")
; ============================================================

s stDate = "2025-08-01"
s endDate = "2025-08-10"
s HospitalID = ""  ; 空表示全部医院

; 执行查询(内部自动遍历F/H/P/Y四种类型)
d ##class(%ResultSet).RunQuery("web.qMJK.pHA.DrugInfo", "tBPMDISPENSING", stDate, endDate, HospitalID)

; 结果在 ^CacheTemp(repid, ind) 中, 格式为 $lb(41个字段)
; 字段顺序: yLJGDM,fYMXLSH,fTYBZ,yWLB,kH,kLX,jZLSH,cFH,sFMXID,
;           cFMXH,cFYSGH,cFYSXM,cFKSDM,cFKSMC,yFFL,fYYFDM,fYYFMC,
;           fYCKBH,lYRGH,lYRXM,pYRGH,pYRXM,hFRGH,hFRXM,yPBM,yPMC,
;           yPZSM,yPGG,fYDM,jCDW,fYDWXS,dAYS,yYCS,yYKSSJ,dYYJSSJ,
;           sL,jE,yYPLJGSJ,yYPLJGSJDW,fTYSJ,xGBZ,yWSCSJ,sJSCSJ,yLYL1,yLYL2
```

---

## 模板B: 手动遍历台账(灵活控制)

```objectscript
; ============================================================
; 模板B: 手动遍历 ^DHCINTR 台账 (灵活控制每种类型)
; 用途: 只需要特定业务类型或自定义过滤逻辑
; ============================================================

s stDate = ##class(websys.Conversions).DateHtmlToLogical("2025-08-01")
s endDate = ##class(websys.Conversions).DateHtmlToLogical("2025-08-10")

; 只遍历门诊发药(F)
f Date=stDate:1:endDate  d
 . s intr = ""
 . f  s intr=$o(^DHCINTR(0, "TypeDate", "F", Date, intr)) q:intr=""  d
 . . s intrData = $g(^DHCINTR(intr))
 . . q:intrData=""
 . .
 . . ; 在这里处理每条门诊发药记录
 . . s pointer = $p(intrData, "^", 9)
 . . s qty = $p(intrData, "^", 6)
 . . s inclb = $p(intrData, "^", 7)
 . .
 . . s pha = +pointer
 . . s prescno = $p(^DHCPHDISP(pha, 2), "^", 1)
 . . w "门诊发药: 处方号=", prescno, " 数量=", qty, !
```

---

## 模板C: 药库库存全量扫描

```objectscript
; ============================================================
; 模板C: 药库库存全量扫描 (tBPMWAREHOUSESTORAGE)
; 用途: 获取指定医院所有药库的全部药品库存
; 调用: d ##class(%ResultSet).RunQuery("web.qMJK.pHA.DrugInfo",
;       "tBPMWAREHOUSESTORAGE", HospitalID)
; ============================================================

s HospitalID = "2"  ; 医院DR
d ##class(%ResultSet).RunQuery("web.qMJK.pHA.DrugInfo", "tBPMWAREHOUSESTORAGE", HospitalID)

; 结果字段: yLJGDM,yPKCMXLSH,kCJKSJ,kSDMYN,kSMCYN,xMLXDM,xMLXMC,
;           xMDMYN,xMMCYN,gG,jYSX,yXQ,zXDW,yFCFXS,yKDW,yPLXDM,
;           yPLXMC,kCSL,jHJG,lSJ,kCJE,sCCS,xGBZ,yWSCSJ,sJSCSJ
```

---

## 模板D: 药房库存全量扫描

```objectscript
; ============================================================
; 模板D: 药房库存全量扫描 (tBPMDRUGROOMSTORAGE)
; 用途: 获取所有药房(非药库)的全部药品库存
; ============================================================

s HospitalID = ""
d ##class(%ResultSet).RunQuery("web.qMJK.pHA.DrugInfo", "tBPMDRUGROOMSTORAGE", HospitalID)

; 结果比药库库存多: sCPH(批号), cKSL/rKSL(出/入数量),
;                   bZBS/bZDW(包装), yPCD(产地),
;                   dLFLDM/dLFLMC(毒理), yPJL(剂量)
```

---

## 模板E: 按药品查业务量(GetTranQty)

```objectscript
; ============================================================
; 模板E: 指定药品在指定时间段的业务量统计
; 用途: 统计某药品的日/周/月出库总量
; ============================================================

s inci = 1468        ; INCI RowId (药品ID)
s iL = 1             ; IL子节点
s lB = 1             ; LB批次
s TInclb = inci_"||"_IL_"||"_LB

; 查门诊发药总量(F)
s FQty = ##class(web.qMJK.pHA.DrugInfo).GetTranQty("2025-08-01", "2025-08-10", "F", TInclb)

; 查门诊退药总量(H) — 退货为负数概念
s HQty = ##class(web.qMJK.pHA.DrugInfo).GetTranQty("2025-08-01", "2025-08-10", "H", TInclw)

w "药品", inci, " 期间发药量=", FQty, " 退药量=", HQty, " 净发药=", FQty-HQty, !
```

---

# 第八章: 踩坑提示

## ⚠️⭐⭐ 高频坑(必读)

| # | 坑点 | 说明 | 解决方案 |
|---|------|------|---------|
| 1 | **人员字典选错(F/H用DHCPHPER, P/Y用SSU)** | 门诊药房操作(F/H类型)的人员信息走`^DHCPHPER`字典, 住院操作(P/Y)走`^SSU("SSUSR")`. 两个字典结构完全不同! 用错会取不到姓名或取错人 | 写死判断: `if Type="F"\|\|Type="H" use ^DHCPHPER else use ^SSU` |
| 2 | **pointer格式因类型而异** | F=`pha`(纯数字), H=`phretdr\|\|rtisub`, P=`phac\|\|isub\|\|1`, Y=`pharet\|\|isub`. 用`$p(pointer,"\|\|",N)`取子段时必须考虑类型 | 先分解: `mmm=+pointer, isub=$p(pointer,"\|\|",2)`, 再按类型决定后续逻辑 |
| 3 | **住院无发票号** | F/H类型有完整的发票链路(prescno→DHCPHARi→dHCPHARW→dHCINVPRT), P/Y类型`invno=""`固定为空 | 输出前判断类型, 住院的不走发票链路 |
| 4 | **配药人fallback逻辑** | F类型中配药人(`^DHCPHDISP^1^3`)为空时会fallback到发药人(`^...^1^2`). P类型同理 | `pyUserCode = $s((pyUserCode=""):fyUserCode, 1:pyUserCode)` |
| 5 | **dHCINCIL LockFlag=Y跳过** | 药房/药库库存扫描时遇到`^DHCINCIL(dhcincil)^1="Y"`的批次必须跳过(锁定状态) | `q:LockFlag="Y"` 放在循环第一行 |
| 6 | **已过期批次跳过** | `^INCI(Inci,"iB",Chl)^2`(有效期ExpDate)不为0且 `< +$h` 时跳过 | `q:(ExpDate'=0)&&(ExpDate<+$h)` |

## ⚠️⭐ 中频坑

| # | 坑点 | 说明 | 解决方案 |
|---|------|------|---------|
| 7 | **dAYS/YYCS硬编码为1** | 发药明细中的用药天数和次数当前写死为1, 未从医嘱实际读取 | 可优化: `duratId=$p(^OEORD(...,2)^6)` → `duration=$p(^pHCD(duratId)^2)` |
| 8 | **多个字段留空未实现** | cFMXH/cFYSGH/cFYSXM/cFKSDM/cFKSMC/fYYFDM/fYYFMC/fYCKBH/lYRGH/lYRXM/jCDW/fYDWXS/yYPLJGSJ 等字段在生产代码中均为空 | 这些字段需要在后续迭代中补充实际的取值逻辑 |
| 9 | **不良事件/统计报告是空框架** | tBMEDMANAGEAEDAES 和 tBTJSJLSCHZ 两个Query只有变量声明, 无实际数据填充 | 需要确认数据来源后再实现 |
| 10 | **YWLB用prescno推断而非Type** | 业务类别不是直接用Type判断, 而是`prescno["I"]`来判断是否为住院 | 两者结果通常一致, 但prescno是更贴近业务的标识 |
| 11 | **OeoriEndDateTime多级兜底** | 结束时间的计算涉及4个时间点的比较(开嘱+duration / XDate / XTime / EndDate), 是整个类中最复杂的时间计算 | 不要自己重写, 直接调用方法即可 |

## ⚠️ 低频坑

| # | 坑点 | 说明 |
|---|------|------|
| 12 | KLX卡类型写死为"3" | 如果系统支持多种卡类型(IC卡/社保卡/身份证等), 需要动态化 |
| 13 | 药房库存的JHG保留3位小数 | 药房库存进货价用`$fn(BRp,"",3)`, 而药库库存保持原精度. 两处不一致 |
| 14 | GetEqUomStr依赖多层级Global链路 | INCI→ARCIM→pHCD→eQ, 任一环断链都返回空. 新药品可能还没建好PHCD剂量配置 |
| 15 | GetStkGrpTypeById默认归为西药 | 无法识别的类别统一归为"西药"(code=1), 可能导致统计偏差 |

---

# 第九章: 别名映射表

## 9.1 发药明细 (TB_PM_DISPENSING)

| 序号 | 标准名 | 英文别名 |
中文别名 | 所属分类 |
|------|--------|---------|---------|---------|
| 1 | yLJGDM | orgCode | 医疗机构代码 | 机构 |
| 2 | fYMXLSH | dispDetailSeq | 发药明细流水号 | 主键 |
| 3 | fTYBZ | dispFlag | 发退药标志(1发/2退) | 分类 |
| 4 | yWLB | bizType | 业务类别(1门诊/2住院) | 分类 |
| 5 | kH | cardNo | 卡号 | 患者 |
| 6 | kLX | cardType | 卡类型 | 患者 |
| 7 | jZLSH | visitId | 就诊流水号 | 就诊 |
| 8 | cFH | prescriptionNo | 处方号 | 医嘱 |
| 9 | sFMXID | chargeDetailId | 收费明细ID(发票号) | 收费 |
| 10 | cFMXH | prescriptionItemId | 处方项目明细号码 | 医嘱 |
| 11 | cFYSGH | doctorCode | 处方医师工号 | 医生 |
| 12 | cFYSXM | doctorName | 处方医师姓名 | 医生 |
| 13 | cFKSDM | deptCode | 处方科室代码 | 科室 |
| 14 | cFKSMC | deptName | 处方科室名称 | 科室 |
| 15 | yFFL | pharmCategory | 药房分类(1西/2中/3急) | 药房 |
| 16 | fYYFDM | pharmDeptCode | 发药药房代码 | 药房 |
| 17 | fYYFMC | pharmDeptName | 发药药房名称 | 药房 |
| 18 | fYCKBH | windowNo | 发药窗口编号 | 药房 |
| 19 | lYRGH | receiverCode | 领药人工号 | 人员 |
| 20 | lYRXM | receiverName | 领药人姓名 | 人员 |
| 21 | pYRGH | pharmacistCode | 配(退)药人工号 | 人员 |
| 22 | pYRXM | pharmacistName | 配(退)药人姓名 | 人员 |
| 23 | hFRGH | verifierCode | 核发人工号 | 人员 |
| 24 | hFRXM | verifierName | 核发人姓名 | 人员 |
| 25 | yPBM | drugCode | 药品代码(院内) | 药品 |
| 26 | yPMC | drugName | 药品名称(院内) | 药品 |
| 27 | yPZSM | traceCode | 药品追溯码 | 药品 |
| 28 | yPGG | spec | 药品规格 | 药品 |
| 29 | fYDM | dispUnit | 发药单位 | 计量 |
| 30 | jCDW | baseUnit | 基础单位 | 计量 |
| 31 | fYDWXS | unitFactor | 发药单位系数 | 计量 |
| 32 | dAYS | days | 用药天数 | 医嘱 |
| 33 | yYCS | frequency | 用药次数 | 医嘱 |
| 34 | yYKSSJ | startDT | 用药开始时间 | 时间 |
| 35 | dYYJSSJ | endDT | 用药结束时间 | 时间 |
| 36 | sL | quantity | 数量 | 金额 |
| 37 | jE | amount | 金额(元) | 金额 |
| 38 | yYPLJGSJ | freqInterval | 用药频率间隔时间 | 医嘱 |
| 39 | yYPLJGSJDW | freqIntervalUnit | 频率间隔时间单位 | 医嘱 |
| 40 | fTYSJ | dispDateTime | 发(退)药时间 | 时间 |
| 41 | xGBZ | modifyFlag | 修改标志 | 状态 |
| 42 | yWSCSJ | dataGenDT | 数据生成时间 | 时间 |
| 43 | sJSCSJ | uploadDT | 数据上传时间 | 时间 |

## 9.2 药库/药房库存共用字段

#### 英文别名

| 标准名 | 英文别名 |
| 匹配模式 | 英文别名 |
中文别名 | 药库 | 药房(额外) |
|--------|---------|---------|------|------------|
| yLJGDM | orgCode | 医疗机构代码 | ✅ | ✅ |
| lSH/yPKCMXLSH | stockSeq | 库存流水号 | yPKCMXLSH | lSH |
| kCJKSJ | statDT | 库存统计时间 | ✅ | ✅ |
| kSDMYN | locCode | 科室代码 | ✅ | ✅ |
| kSMCYN | locName | 科室名称 | ✅ | ✅ |
| xMLXDM | drugCatCode | 药品类别代码 | ✅ | ✅ |
| xMLXMC | drugCatName | 药品类别名称 | ✅ | ✅ |
| xMDMYN | itemCode | 项目代码=yPBM | ✅ | ✅ |
| xMMCYN | itemName | 项目名称=yPMC | ✅ | ✅ |
| gG/yPGG | spec | 规格 | gG | yPGG(独立) |
| jYSX | basicDrugFlag | 基药属性 | ✅ | ✅ |
| yXQ | expiryDate | 有效期 | ✅ | ✅ |
| zXDW | minUnit | 最小单位 | ✅ | ✅ |
| yFCFXS | splitFac | 拆分系数 | ✅ | ✅ |
| yKDW/kCDW | whUnit | 库存/药房单位 | yKDW | kCDW |
| yPLXDM | drugTypeCode | 药品类型代码 | ✅ | ✅ |
| yPLXMC | drugTypeName | 药品类型名称 | ✅ | ✅ |
| **sCPH** | **batchNo** | **生产批号** | ❌ | **✅药房独有** |
| kCSL | stockQty | 库存数量 | ✅ | ✅ |
| cKSL | outQty | 当日出库量 | ❌ | ✅(空) |
| rKSL | inQty | 当日入库量 | ❌ | ✅(空) |
| jHG | purchasePrice | 进货价格 | ✅ | ✅(3位小数) |
| lSJ | retailPrice | 零售价格 | ✅ | ✅ |
| kCJE | stockAmount | 库存金额 | ✅ | ✅(有则必填) |
| **bZBS** | **packFactor** | **包装倍数** | ❌ | **✅药房独有** |
| **bZDW** | **packUnit** | **包装单位** | ❌ | **✅药房独有** |
| **yPCD** | **origin** | **产地** | ❌ | **✅药房独有** |
| **dLFLDM/dLFLMC** | **toxicCode/toxicName** | **毒理分类** | ❌ | **✅药房独有(空)** |
| **yPJL** | **dose** | **等效剂量** | ❌ | **✅药房独有** |
| sCCS | manufacturer | 生产厂家 | ✅ | ❌(药房用YPCD) |
| xGBZ | modifyFlag | 修改标志 | ✅ | ✅ |
| yWSCSJ | dataGenDT | 数据生成时间 | ✅ | ✅ |
| sJSCSJ | uploadDT | 上传时间 | ✅ | ✅ |

---

# 附录: 规则统计

## 按业务表分布

| 业务表 | Query名 | 字段数 | 数据源 | 实现状态 |
|--------|---------|--------|--------|---------|
| 药房发药明细(11.2.7) | tBPMDISPENSING | 43 | ^DHCINTR→F/H/P/Y分流 | ✅ 完整实现(部分字段待补) |
| 药库库存(11.2.3) | tBPMWAREHOUSESTORAGE | 24 | ^INCI(ilLoc)→药库科室 | ✅ 完整实现 |
| 药房库存(11.2.6) | tBPMDRUGROOMSTORAGE | 37 | ^INCI(ilLoc)→药房科室 | ✅ 完整实现(部分字段待补) |
| 不良事件(11.5.2) | tBMEDMANAGEAEDAES | ~65 | 待定 | ⚠️ 空框架 |
| 统计报告(11.1.1) | tBTJSJLSCHZ | 9 | 待定 | ⚠️ 空框架 |
| **合计** | **5个Query** | **~178** | - | - |

## 按数据来源分布

| 数据源 | 涉及字段数 | 占比 | 说明 |
|--------|-----------|------|------|
| ^DHCINTR (台账主表) | ~15 | 8% | 四业务统一入口, 提供pointer/inclb/qty/uom/SpAmt |
| ^DHCPHDISP (门诊发药) | ~8 | 4% | F类型专用 |
| ^DHCPHRET (门诊退药) | ~3 | 2% | H类型专用 |
| ^DHCPHAC (住院发药) | ~6 | 3% | P类型专用 |
| ^pHARET (住院退药) | ~3 | 2% | Y类型专用 |
| ^INCI (药品字典) | ~25 | 14% | 所有业务共享, 药品信息源头 |
| ^CTLOC (科室字典) | ~8 | 4% | 科室/药房分类 |
| ^OEORD (医嘱表) | ~8 | 4% | 医嘱时间/就诊关联 |
| ^PAADM/PAPER (患者) | ~4 | 2% | 就诊号/卡号 |
| ^DHCPHPER (药房人员) | ~6 | 3% | 仅F/H |
| ^SSU/SSUSR (系统用户) | ~6 | 3% | 仅P/Y |
| 工具方法返回值 | ~20 | 11% | GetSpec/GetBasicFlag/GetDrugTypeInfo等 |
| 空字段(待实现) | ~66 | 37% | 不良事件全量 + 发药明细部分 |

## 涉及Global完整清单 (18个)

| # | Global | 主用途 | 查询模式 |
|---|--------|--------|---------|
| 1 | `^DHCINTR` | 台账主表 | Type+Date索引遍历 |
| 2 | `^DHCPHDISP` | 门诊发药 | RowId直接访问 |
| 3 | `^DHCPHRET` | 门诊退药 | RowId+RTI子节点 |
| 4 | `^DHCPHAC` | 住院发药 | RowId+"I"+子节点 |
| 5 | `^pHARET` | 住院退药 | RowId+"I"+子节点 |
| 6 | `^DHCPHDI` | 门诊发药明细 | RowId+"pHDI"+子节点(GetORI) |
| 7 | `^DHCPHRTI` | 门诊退药明细 | RowId+"rTI"+子节点(GetRetORI) |
| 8 | `^INCI` | 药品库存项主表 | RowId多维子节点 |
| 9 | `^DHCINCIL` | 库存批次锁 | INCIL索引查找 |
| 10 | `^DHCINGR` | 入库记录 | RowId直接 |
| 11 | `^OEORD` | 医嘱明细 | RowId+"I"+子节点 |
| 12 | `^PAADM` | 就诊记录 | RowId直接 |
| 13 | `^PAPER` | 患者档案 | RowId+"PAT"+子节点 |
| 14 | `^CTLOC` | 科室字典 | RowId直接 |
| 15 | `^CT("UOM")` | 单位字典 | RowId直接 |
| 16 | `^CT("HOSP")` | 机构字典 | RowId直接 |
| 17 | `^DHCPHPER` | 药房人员 | RowId直接 |
| 18 | `^SSU("SSUSR")` | 系统用户 | 双下标 |

---

## 附录A: 住院发药条件规则（来源：住院药房数据结构说明）

> 待发药记录从 DHC_OEDispensing 取得，满足 DSP_Status="TC"，且需符合以下条件：

### 按病区发药条件

| # | 条件 | 字段 | 说明 |
|---|------|------|------|
| 1 | 仅长期医嘱 | OECPR_Code="S" | 选择"仅长期医嘱"时过滤 |
| 2 | 出院带药 | OECPR_Code="OUT" | 选择"出院带药"时只取OUT；未选择时排除OUT |
| 3 | 仅临时医嘱 | OECPR_Code≠"S"且≠"OUT" | 临时医嘱时排除S和OUT |
| 4 | 皮试检查 | OEORI_AdministerSkinTest=Y | 要求皮试时，OEORI_Abnormal必须=N(阴性) |
| 5 | 审核检查 | — | 未审核的医嘱不能发药 |
| 6 | 科室过滤 | CT_LocLinkLocation | 检查医生科室是否在发药科室的关联列表中 |

### 按病区发药 vs 按病人发药

- 按病区：检索指定病区的所有待发药记录
- 按病人：除指定患者外，其他条件同按病区发药

---

## 附录B: 住院退药条件规则

### 退药申请条件

待退记录从 DHC_OEDispensing 取得，满足 DSP_Status="C"(已发药) 且 DSP_Qty≠0，且：

| # | 条件 | 说明 |
|---|------|------|
| 1 | 界面指定条件 | 用户指定的病区/患者/日期等 |
| 2 | 未出院 | PAADM_VisitStatus ≠ "D" |
| 3 | 医嘱已停 | OEORI_ItemStat_DR → STAT_Code = "D" |

### 退药两种模式

| 模式 | 流程 | 说明 |
|------|------|------|
| **申请单退药** | 查 RETRQ_Status="Prove" → 执行退药 | 退药后 RETRQ_Status→"Execute" |
| **直接退药** | 查 DSP_Status="C" → 直接退药 | PHAR_DeptLoc_DR 从 OE_OrdItem 取当前病区 |

**注意**：申请单一单可录入 N 个登记号。如果先填申请单再直接退药，按直退进行，但申请单仍在。

---

## 附录C: 打包表 DHC_OEDispensing 索引遍历模板

> Global: ^DHCOEDISQTY

### 按执行记录查打包

```objectscript
s dspId = "" f  s dspId = $o(^DHCOEDISQTY(0,"OEORE",oeoreDr,dspId)) q:dspId=""  d
. s status = $p($g(^DHCOEDISQTY(dspId)),"^",?)
. ; 处理打包记录
```

### 按医嘱明细查打包

```objectscript
s dspId = "" f  s dspId = $o(^DHCOEDISQTY(0,"OEORI",oeoriDr,dspId)) q:dspId=""  d
. ; 处理打包记录
```

### 按接收科室+日期+状态查待发药

```objectscript
s date = startDate f  s date = $o(^DHCOEDISQTY(0,"REC",recLocDr,date)) q:(date="")!(date>endDate)  d
. s status = "" f  s status = $o(^DHCOEDISQTY(0,"REC",recLocDr,date,status)) q:status=""  d
. . q:status'="TC"  ; 只取未发药
. . s dspId = "" f  s dspId = $o(^DHCOEDISQTY(0,"REC",recLocDr,date,status,dspId)) q:dspId=""  d
. . . ; 处理待发药记录
```

### 按就诊+状态查打包

```objectscript
s dspId = "" f  s dspId = $o(^DHCOEDISQTY(0,"ADM",recLocDr,date,status,admDr,dspId)) q:dspId=""  d
. ; 处理打包记录
```

---

## 附录D: 住院发药表索引遍历模板

> Global: ^DHCPHAC

### 按药房+日期查发药记录

```objectscript
s date = startDate f  s date = $o(^DHCPHAC(0,"PHA",phaLocDr,date)) q:(date="")!(date>endDate)  d
. s phacId = "" f  s phacId = $o(^DHCPHAC(0,"PHA",phaLocDr,date,phacId)) q:phacId=""  d
. ; 处理发药主表记录
```

### 按处方号查发药记录

```objectscript
s phacId = $o(^DHCPHACi("PRESCNO",prescNo,""))
```

### 按发药子表的医嘱打包查发药

```objectscript
s phacId = "" f  s phacId = $o(^DHCPHAC(0,"PHADSP",dspDr,dateDosing,phacId)) q:phacId=""  d
. ; dspDr = DHC_OEDispensing 的 RowId
```

---

## 附录E: 退药申请表索引遍历模板

> Global: ^RETRQ

### 按接收科室+状态+申请科室查

```objectscript
s retrqId = "" f  s retrqId = $o(^RETRQ(0,"RECSTDEPT",recLocDr,status,deptDr,retrqId)) q:retrqId=""  d
. q:status'="Prove"  ; 只取待退
. ; 处理退药申请
```

### 按接收科室+患者查

```objectscript
s retrqId = "" f  s retrqId = $o(^RETRQ(0,"PAPMI",recLocDr,patDr,deptDr,retrqId)) q:retrqId=""  d
. ; 处理退药申请
```

---

## 附录F: 门诊发药表索引遍历模板

> Global: ^DHCPHDISP

### 按处方号查发药记录

```objectscript
s phdId = $o(^DHCPHDISPi("PRESCNO",prescNo,""))
```

### 按患者查发药记录

```objectscript
s phdId = "" f  s phdId = $o(^DHCPHDISPi("PAPMI",patDr,phdId)) q:phdId=""  d
. ; 处理发药记录
```

### 按配药日期+药房查

```objectscript
s date = startDate f  s date = $o(^DHCPHDISPi(date,phaLocDr)) q:(date="")!(date>endDate)  d
. s phdId = "" f  s phdId = $o(^DHCPHDISPi(date,phaLocDr,phdId)) q:phdId=""  d
. ; 处理发药记录
```

### 按发票号查发药记录

```objectscript
s phdId = "" f  s phdId = $o(^DHCPHDISPi("PRT",phaLocDr,prtDr,phdId)) q:phdId=""  d
. ; 处理发药记录
```
