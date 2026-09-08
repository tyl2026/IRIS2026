# HIS 核心数据模型参考

> 本文档是 `CLAUDE.md` 第 5 章「数据模型速查」的详细补充，融合了 `his-class-query` skill 中的表结构知识。开发涉及 Global 读写或 SQL 查询时查阅。

> ⚠️ **致命陷阱**：Global 名不可根据类名推测！`DHC_PHACollected` → `^DHCPHAC`（非 `^DHCPHACOLLECT`）、`DHC_PHDISPEN` → `^DHCPHDISP`（非 `^DHCPHDISPEN`）、`DHC_PhaReturn` → `^PHARET`（非 `^DHCPHARETURN`）。任何 Global 引用必须经 XML Storage 或 CSV 工具表验证。详见 [§6](#6-发药与退药) 和 [§18](#18-️-关键踩坑提醒)。

## 1. 患者与就诊

### 1.1 表结构

| SQL 表名 | Global | 存储内容 | 关键字段/指针 |
|----------|--------|----------|---------------|
| `PA_PatMas` | `^PAPER(patId,"ALL")` | 患者主索引 | `PAPMI_Name`（姓名）、`PAPMI_Sex_DR` → CT_Sex、`PAPMI_DVAnumber`（身份证） |
| `PA_Person` | `^PAPER(patId,"PAT",1)` 等 | 患者个人信息（与 PA_PatMas 同 RowId） | `PAPER_TelH`（电话）、`PAPER_SocialStatus_DR` → CT_SocialStatus、`PAPER_Nation_DR` → CT_Nation |
| `PA_Adm` | `^PAADM(admId)` | 就诊记录 | `PAADM_PAPMI_DR` → PA_PatMas、`PAADM_Type`（O/E/I/H）、`PAADM_VisitStatus`（A=在院/C=取消/D=出院） |
| `PA_AdmTransaction` | — | 出入转记录 | 转科、出院等 |
| `DHC_CardRef` | — | 就诊卡 | `CF_CardNo`（卡号）、`CF_PAPMI_DR` → PA_PatMas |
| `MR_Adm` | `^MR(admId)` | 诊断主表 | 关联 PA_Adm |
| `MR_Diagnos` | `^MR(admId,"DIA",sub)` | 诊断明细（MR_Adm 子表） | `MRDIA_ICDCode_DR` → MRC_ICDDx |

### 1.2 关系链

```
PA_PatMas ← PA_Person（同 RowId，兄弟表）
PA_PatMas → PA_Adm（PAADM_PAPMI_DR）
PA_PatMas → DHC_CardRef（CF_PAPMI_DR）
PA_Adm → MR_Adm（PAADM_MainMRAdm_DR）
MR_Adm → MR_Diagnos（子表）
MR_Diagnos → MRC_ICDDx（MRDIA_ICDCode_DR）
MR_Diagnos → CT_CareProv（MRDIA_DocCode_DR，诊断医生）
```

### 1.3 常用索引遍历

```objectscript
// 按患者查就诊
^PAPERdr(PAPMIDR,"ADM", AdmType, AdmRowId)

// 在院住院患者
^PAADMi("NotCompl","I", LocId, AdmId)

// 按日期查诊断
^MRi("Date", Date, MRRowId) → ^MR(MRRowId,"DIA",DiaSub)
```

## 2. 医嘱

### 2.1 表结构

| SQL 表名 | Global | 存储内容 | 关键字段/指针 |
|----------|--------|----------|---------------|
| `OE_Order` | `^OEORD(ord)` | 医嘱主表 | `OEORD_Adm_DR` → PA_Adm |
| `OE_OrdItem` | `^OEORD(ord,"I",sub)` | 医嘱明细（OE_Order 子表） | `OEORI_ItmMast_DR` → ARC_ItmMast、`OEORI_ItemStat_DR` → OEC_OrderStatus、`OEORI_Doctor_DR` → CT_CareProv |
| `OE_OrdExec` | `^OEORD(ord,"I",sub,"X",ore)` | 医嘱执行记录（OE_OrdItem 孙表） | `OEORE_Order_Status_DR` → OEC_OrderAdminStatus、`OEORE_DateExecuted` |
| `OE_OrdItemExt` | — | 医嘱扩展表 | `OEORI_SeeType`（加急/普通） |
| `DHC_OE_OrdItem` | — | 医嘱项 HIS 扩展 | — |

### 2.2 关系链

```
PA_Adm → OE_Order（OEORD_Adm_DR）
OE_Order → OE_OrdItem（子表，RowId 格式 "OrderId||Sub"）
OE_OrdItem → ARC_ItmMast（OEORI_ItmMast_DR）
OE_OrdItem → CT_Loc（OEORI_RecDep_DR，接收科室）
OE_OrdItem → CT_CareProv（OEORI_Doctor_DR，开嘱医生）
OE_OrdItem → OE_OrdExec（孙表）
OE_OrdExec → OEC_OrderAdminStatus（OEORE_Order_Status_DR，执行状态）
```

### 2.3 常用索引遍历

```objectscript
// 按就诊查医嘱
^OEORD(0,"Adm", AdmId, OrderRowId)

// 按日期查医嘱
^OEORDi(0,"StDt", Date, OERowId, OEORIsub)

// 遍历医嘱项及执行记录
s Sub=0 f  s Sub=$o(^OEORD(OrderRowId,"I",Sub)) q:Sub=""  d
.s ORE="" f  s ORE=$o(^OEORD(OrderRowId,"I",Sub,"X",ORE)) q:ORE=""  d

// 按医嘱查发药执行记录
^DHCOEDISQTY(0,"OEORI", OEORIRowId, DSPRowId)
```

## 3. 计费

### 3.1 表结构

| SQL 表名 | Global | 存储内容 | 关键字段/指针 |
|----------|--------|----------|---------------|
| `DHC_PatientBill` | `^DHCPB(billId)` | 账单主表 | `PB_Adm_DR` → PA_Adm、`PB_TotalAmount`、`PB_PayedFlag`（P=已付/B=部分付） |
| `DHC_PatBillOrder` | `^DHCPB(billId,"O",sub)` | 医嘱账单（子表） | `PBO_OEORI_DR` → OE_OrdItem、`PBO_ARCIM_DR` → ARC_ItmMast |
| `DHC_PatBillDetails` | `^DHCPB(billId,"O",sub,"D",det)` | 计费明细（孙表） | `PBD_TARI_DR` → DHC_TarItem、`PBD_TotalAmount` |
| `DHC_INVPRTZY` | — | 住院发票 | `PRT_Adm`、`PRT_Date`、`PRT_Acount`（总费用） |
| `DHC_INVPRT` | — | 门诊发票 | — |
| `DHC_BillConINV` | — | 门诊账单-发票连接 | `DHCBCI_ADMDR` → PA_Adm |
| `DHC_WorkLoad` | `^DHCWorkLoad(wlId)` | 工作量/计费明细 | 接收科室、医嘱项目、数量、单价、金额、就诊ID |
| `DHC_TarItem` | `^DHCTARI(tarId)` | 收费项目 | `TARI_Desc`、`TARI_Code` |
| `DHC_OrderLinkTar` | `^DHCOLT` | 医嘱项-收费项对照 | — |

### 3.2 关系链

```
PA_Adm → DHC_PatientBill（PB_Adm_DR）
DHC_PatientBill → DHC_PatBillOrder（子表）
DHC_PatBillOrder → OE_OrdItem（PBO_OEORI_DR）
DHC_PatBillOrder → DHC_PatBillDetails（孙表）
DHC_PatBillDetails → DHC_TarItem（PBD_TARI_DR）
```

### 3.3 WorkLoad 索引链

```
^DHCWorkLoad(0,"ORDDATE",date,wlId)                  — 按日期
  → ^DHCWorkLoad(0,"DateItemOrd",date,arcimId,wlId)  — 按日期+医嘱项
  → ^DHCWorkLoad(0,"TARITEM",tarId,wlId)             — 按收费项
  → ^DHCWorkLoad(0,"PAADM",admId,wlId)               — 按就诊
```

### 3.4 常用索引遍历

```objectscript
// 遍历账单明细
f  s OrdSub=$o(^DHCPB(BillId,"O",OrdSub)) q:OrdSub=""  d
.f  s DetSub=$o(^DHCPB(BillId,"O",OrdSub,"D",DetSub)) q:DetSub=""  d
```

## 4. 预约与排班

### 4.1 表结构

| SQL 表名 | Global | 存储内容 | 关键字段/指针 |
|----------|--------|----------|---------------|
| `RB_Resource` | `^RB("RES",resId)` | 医生/设备资源 | `RES_CTLOC_DR` → CT_Loc、`RES_CTPCP_DR` → CT_CareProv |
| `RB_ResEffDate` | — | 班次表（RB_Resource 子表） | — |
| `RB_ApptSchedule` | `^RBAS(resId,asChild)` | 排班记录 | 日期、号源限额、开始时间 |
| `DHC_RBApptSchedule` | `^RBAS(resId,asChild,"DHC")` | 排班扩展（号源明细） | 号串（`$C(1)` 分隔正号/加号）、时段标志 |
| `RB_Appointment` | `^RBAS(resId,asChild,"APPT",apptChild)` | 预约记录 | 预约类型、患者ID、状态（I/A/X/J） |

### 4.2 号串格式

```
"QueueNo:Status[:MethodId],..."
```
- 正号串与加号串用 `$C(1)` 分隔
- 号源状态: `0`=可用 `1`=现场已挂 `2`=已预约 `3`=预约取号 `4`=退号 `5`=诊间加号
- 预约状态: `I`=已预约 `A`=已取号 `X`=已取消 `J`=爽约

## 5. 药品与库存

### 5.1 表结构

| SQL 表名 | Global | 存储内容 | 关键字段/指针 |
|----------|--------|----------|---------------|
| `ARC_ItmMast` | `^ARCIM(sub,ver)` | 医嘱项主表 | `ARCIM_Code`、`ARCIM_Desc`、`ARCIM_ItemCat_DR` → ARC_ItemCat |
| `PHC_DrgMast` | — | 药学项主表 | `PHCD_Name`、`PHCD_PHCSC_DR` → PHC_SubCat |
| `PHC_DrgForm` | — | 药学项子表（剂型关联） | 指向 PHC_DrgMast |
| `PHC_Generic` | — | 药品通用名 | — |
| `INC_Itm` | — | 库存项 | `INCI_ARCIM_DR` → ARC_ItmMast、`INCI_Desc` |
| `PHC_Freq` | `^PHCFR(freqId)` | 用药频次 | QD/BID/TID... |
| `PHC_Instruc` | — | 用药途径（用法） | — |

### 5.2 关系链

```
ARC_ItmMast → ARC_ItemCat（医嘱子类）
ARC_ItmMast → PHC_DrgForm（药学形态）
PHC_DrgMast → PHC_DrgForm（子表）
PHC_DrgMast → PHC_Generic（通用名）
ARC_ItmMast → INC_Itm（INCI_ARCIM_DR，库存项关联）
```

## 6. 发药与退药

> ⚠️ **致命陷阱**：以下 4 张表的 Global 名均不可根据类名推测，必须通过 XML Storage 验证。
> `DHC_PHACollected` → `^DHCPHAC`（非 `^DHCPHACOLLECT`）
> `DHC_PHDISPEN` → `^DHCPHDISP`（非 `^DHCPHDISPEN`）
> `DHC_PhaReturn` → `^PHARET`（非 `^DHCPHARETURN`）
> `DHC_PHRET` → `^DHCPHRET` ✅（唯一与类名一致）

### 6.1 住院发药

| SQL 表名 | Global | 存储内容 | 关键字段 |
|----------|--------|----------|----------|
| `DHC_PHACollected` | `^DHCPHAC(colId)` | 住院发药主表 | p1=`DHC_PHALoc_DR`（药房）、p4=`DHC_PHAWard_DR`（病区） |
| `DHC_PHACollectItm` | `^DHCPHAC(colId,"I",itmSub)` | 住院发药明细（子表） | p3=`PHACI_Adm_DR` → PA_Adm、p5=`PHACI_PrescNo`（处方号）、p7=`PHACI_OEDIS_DR` → OE_OrdItem |
| `DHC_PhaCollectItmLB` | `^DHCPHAC(colId,"I",itmSub,"LB",lbSub)` | 住院发药批次消耗（孙表） | 指向 INC_ItmLcBt |

药品名称链路：`DHC_PHACollectItm → OE_OrdItem → ARC_ItmMast.ARCIM_Desc`
患者信息链路：`DHC_PHACollectItm.PHACI_Adm_DR → PA_Adm.PAADM_PAPMI_DR → PA_PatMas.PAPMI_Name`

> ⚠️ `^DHCPHAC(colId,1)` 的 p1 为空！患者和处方数据在子表 `^DHCPHAC(colId,"I",itmSub)` 中。

### 6.2 门诊发药

| SQL 表名 | Global | 存储内容 | 关键字段 |
|----------|--------|----------|----------|
| `DHC_PHDISPEN` | `^DHCPHDISP(disId)` | 门诊发药主表 | p7=`PHD_PAPMI_DR` → PA_PatMas、Node2 p1=`PHDPrescNo`（处方号） |
| `DHC_PHDISITEM` | `^DHCPHDI(disId\|\|itmSub)` ⚠️ **独立Global** | 门诊发药明细 | p5=`PHDI_OEORI_DR` → OE_OrdItem、p15=`PHDI_PRT_DR` → DHC_INVPRT |
| `DHC_PHDISITMCLB` | 批次消耗子表 | 门诊发药批次消耗 | 指向 INC_ItmLcBt |

药品名称链路：`DHC_PHDISITEM.PHDI_OEORI_DR → OE_OrdItem.OEORI_ItmMast_DR → ARC_ItmMast.ARCIM_Desc`

> ⚠️ **DHC_PHDISITEM 不是** `^DHCPHDISP(disId,"I",...)` 的子节点，而是**独立 Global** `^DHCPHDI(disId||itmSub)`。按子节点遍历会取到空数据。
> ⚠️ `^DHCPHDISP(disId,1)` p18（科室）不可靠。获取科室应走：`prescNo → ^OEORD(0,"PrescNo") → ADM p4 → CT_Loc`。

```objectscript
// 按发药日期索引
^DHCPHDISPi("FYDATE", Date, PHLDR, ROWID)
```

### 6.3 住院退药

| SQL 表名 | Global | 存储内容 | 关键字段 |
|----------|--------|----------|----------|
| `DHC_PhaReturn` | `^PHARET(retId)` | 住院退药主表 | p6=`PHAR_DeptLoc_DR`（科室） |
| `DHCPhaReturnItm` | `^PHARET(retId,"I",itmSub)` | 住院退药明细（子表） | p1=`PHARI_OEDIS_DR` → OE_OrdItem、p14=`PHARI_DeptLoc_DR`（科室） |
| `DHC_PhaReturnItmLB` | 批次消耗子表 | 住院退药批次消耗 | 指向 INC_ItmLcBt |

### 6.4 门诊退药

| SQL 表名 | Global | 存储内容 | 关键字段 |
|----------|--------|----------|----------|
| `DHC_PHRET` | `^DHCPHRET(retId)` | 门诊退药主表 | p5=`PHRET_PAADM_DR` → PA_Adm、p6=`PHRET_PHD_DR` → DHC_PHDISPEN |
| `DHC_PHRETITM` | 门诊退药明细 | 门诊退药明细 | — |

---

## 7. 库存变动日志（DHC_INTRANS）

### 7.1 表结构

**DHC_INTRANS** (`^DHCINTR(intrId)`) 记录所有库存变动的统一日志。

| Piece | 字段 | 说明 |
|--------|------|------|
| 1 | INTR_Type | P=住院发药, F=门诊发药, Y=住院退药, H=门诊退药, G=入库 |
| 2 | INTR_Date | 交易日期（$H 格式） |
| 6 | INTR_Qty | 数量（消费为负，入库为正） |
| 7 | INTR_INCLB_DR | → INC_ItmLcBt（科室批次库存） |
| 9 | INTR_Pointer | 指向发药/退药子表的批次消耗行（格式见 7.2） |
| 11 | INTR_SSUSR_DR | 操作人 → SS_User |
| 16 | INTR_Rp | 单价 |
| 17 | INTR_RpAmt | 总金额 |

**已验证索引：**
```objectscript
^DHCINTR(0,"TypeDate",Type,Date,RowId)        // 按类型+日期查库存变动 ✅
^DHCINTR(0,"TypePointer",Type,Pointer,RowId)   // 按类型+指针查库存变动 ✅
^DHCINTR(0,"INCLB",INCLB,Date,RowId)           // 按批次库存+日期查库存变动 ✅
```

### 7.2 INTR_Pointer 格式（按 INTR_Type 区分）

| Type | 指向表 | RowId 格式 | 主ID提取方式 |
|------|--------|-----------|-------------|
| **P** (住院发药) | DHC_PhaCollectItmLB | `colId\|\|itmSub\|\|lbSub` | `$p(ptr,"\|\|",1)` = colId |
| **F** (门诊发药) | DHC_PHDISITMCLB | `disId\|\|itmSub\|\|lbSub` | `$p(ptr,"\|\|",1)` = disId |
| **Y** (住院退药) | DHC_PhaReturnItmLB | `retId\|\|itmSub\|\|lbSub` | `$p(ptr,"\|\|",1)` = retId |
| **H** (门诊退药) | DHC_PHRETITM | `retId\|\|itmSub\|\|lbSub` | `$p(ptr,"\|\|",1)` = retId |

### 7.3 从 INTR_Pointer 出发的数据链路

```
INTR_Pointer (p9)
  └─ 提取主ID → 发药/退药子表 → 患者 / 处方号 / 医嘱项
       ├─ Type P: ^DHCPHAC(colId,"I",itmSub) → p3=患者, p5=处方号, p7=医嘱项
       ├─ Type F: ^DHCPHDI(disId||itmSub)    → p5=医嘱项
       ├─ Type Y: ^PHARET(retId,"I",itmSub)  → p1=医嘱项, p14=科室
       └─ Type H: DHC_PHRETITM               → 医嘱项
```

---

## 8. 入库

| SQL 表名 | Global | 存储内容 | 关键字段 |
|----------|--------|----------|----------|
| `DHC_INGdRec` | `^DHCINGR(ingrId)` | 入库单主表 | p1=`INGR_No`（入库单号）、p3=`INGR_APCVM_DR`（供应商）、p4=`INGR_Date`（审核日期）、p14=`INGR_CreateDate`（建单日期）、p46=`INGR_ApprovalNO`（供应商批次流水号） |
| `DHC_INGdRecItm` | `^DHCINGR(ingrId,"GRI",griSub)` | 入库单明细（子表） | p4=`INGRI_RecQty`（入库数量）、p9=`INGRI_ExpDate`（效期）、p13=`INGRI_BatchNo`（批号）、p25=`initm_INCI_DR`（药品 → INC_Itm） |

### 8.1 入库批次数据链路

```
DHC_INGdRec → DHC_INGdRecItm (子表)
  ├─ ingri INCI_DR  → INC_Itm (库存项)
  ├─ ingri BatchNo  → INC_ItmBat.INCIB_No (批号匹配)
  └─ ingri ExpDate  → INC_ItmBat.INCIB_ExpDate (效期匹配)
```

---

## 9. 批次与库存

### 9.1 表结构

| SQL 表名 | Global | 存储内容 | 关键字段 |
|----------|--------|----------|----------|
| `INC_ItmBat` | `^INCI(inci,"IB",ibSub)` | 批次主表（RowId = `inci\|\|ibSub`） | p1=`INCIB_No`（批号）、p2=`INCIB_ExpDate`（效期） |
| `DHC_IncItmBat` | `^DHCINCIB(batId)` | 批次扩展表（RowId 自增） | p1=`INCIB_INCIB_Dr` → INC_ItmBat、p3=`INCIB_Rp`（进价）、p7=`INCIB_PHMNF_Dr`（厂商）、p8=`INCIB_APCVM_Dr`（供应商）、p9=`INCIB_INGRI_Dr` → DHC_INGdRecItm |
| `INC_ItmLcBt` | `^INCI(inci,"IL",ilSub,"LB",lbSub)` | 科室批次库存（RowId = `inci\|\|ilSub\|\|lbSub`） | p1=`INCLB_INCIB_DR` → INC_ItmBat、p2=`INCLB_PhyQty`（物理库存） |
| `INC_ItmLoc` | `^INCI(inci,"IL",ilSub)` | 科室库存汇总 | p1=`INCIL_CTLOC_DR`（科室） |

**已验证索引：**
```objectscript
^DHCINCIB(0,"INCIB",incibDr,RowId)    // 按INC_ItmBat查批次扩展 ✅
```

### 9.2 ⚠️ INCLB_INCIB_DR 格式陷阱

`INCLB_INCIB_DR`（INC_ItmLcBt → INC_ItmBat 外键）可能只存 `ibSub`（纯数字），而非完整 `inci||ibSub`。匹配时必须双重尝试：

```objectscript
s fullKey = inci_"||"_ibSub
if (lbIncib = fullKey) || (lbIncib = ibSub) { ... }
```

### 9.3 库存变动完整数据链路

```
DHC_INTRANS (^DHCINTR)
  ├─ p7  INTR_INCLB_DR  → INC_ItmLcBt → p1 → INC_ItmBat / p2 → 物理库存
  └─ p9  INTR_Pointer   → 发药/退药子表批次行 → 患者 / 处方号 / 医嘱项
       ├─ p1  INTR_Type → 区分发药/退药/入库
       └─ p2  INTR_Date → 按日期范围过滤
```

## 10. 医保

| SQL 表名 | Global | 存储内容 | 关键字段 |
|----------|--------|----------|---------------|
| `INSU_AdmInfo` | `^DHCINADM(inadmId)` | 医保就诊记录 | 中心ID、激活标志、医疗类别、险种类型（310/390） |
| `INSU_Divide` | `^DHCINDIV(inpayId)` | 医保结算主单 | `INPAY_AdmDr` → PA_Adm、`INPAY_Flag`（I=住院/O=门诊） |
| `INSU_DivideSub` | — | 医保结算明细 | `INDIS_DivideDr` → INSU_Divide、`INDIS_Amount`（金额）、`INDIS_Demo2`（医保支付）、`INDIS_Demo3`（自付） |
| `INSU_TarItems` | — | 医保三大目录字典 | 药品、诊疗、服务设施 |
| `INSU_TarContrast` | — | 医保三大目录对照 | HIS项目→医保项目 |

地区识别：中心ID前4位 — `4311`=永州，`43xx`=省内异地，其他=跨省异地

## 11. 科室与人员

| SQL 表名 | Global | 存储内容 | 关键字段 |
|----------|--------|----------|----------|
| `CT_Hospital` | — | 医院信息 | — |
| `CT_Loc` | `^CTLOC(locId)` | 科室 | `CTLOC_Desc`、`CTLOC_Type`（W=病区/E=执行科室/D=药房/OP=手术室/EM=急诊） |
| `CT_CareProv` | `^CTPCP(cpId,1)` | 医护人员 | `CTPCP_Desc`、`CTPCP_CarPrvTp_DR`（DOCTOR/NURSE） |
| `SS_User` | `^SSU("SSUSR",userId)` | 系统用户 | `SSUSR_Name`、`SSUSR_Group` → SS_Group、`SSUSR_CareProv` → CT_CareProv |
| `PAC_Ward` | `^PAWARD(wardId)` | 病区 | `WARD_LocationDR` → CT_Loc |
| `PAC_Bed` | `^PAWARD(wardId,"BED",bedSub)` | 床位（PAC_Ward 子表） | `BED_Room_DR` → PAC_Room、`BED_Available` |

### 11.1 关系链

```
CT_Loc → RBC_DepartmentGroup（CTLOC_Dep_DR，科室部门组）
CT_Loc → CT_Hospital（CTLOC_Hospital_DR）
CT_CareProv → CT_CarPrvTp（CTPCP_CarPrvTp_DR）
SS_User → SS_Group（安全组）
SS_User → CT_CareProv（SSUSR_CareProv）
PAC_Ward → CT_Loc（WARD_LocationDR）
PAC_Bed → PAC_Ward（BED_Ward_ParRef）
```

### 11.2 常用索引遍历

```objectscript
// 遍历病区→床位
f  s WardId=$o(^PAWARD(WardId)) q:+WardId=0  d
.s BedSub="" f  s BedSub=$o(^PAWARD(WardId,"BED",BedSub)) q:BedSub=""  d
```

## 12. 基础数据字典

| SQL 表名 | Global | 存储内容 |
|----------|--------|----------|
| `CT_Sex` | `^CT("SEX")` | 性别 |
| `CT_Nation` | `^CT("NAT")` | 民族 |
| `CT_Marital` | — | 婚姻状况 |
| `CT_Education` | `^CT("EDU")` | 教育水平 |
| `CT_Occupation` | `^CT("OCC")` | 职业 |
| `CT_SocialStatus` | — | 患者身份 |
| `CT_PayMode` | `^CT("CTPM")` | 支付方式 |
| `CT_UOM` | — | 单位 |
| `PAC_AdmReason` | `^PAC("ADMREA",reasonId)` | 费别（就诊原因） |
| `PAC_BloodType` | `^PAC("BLDT")` | 血型 |
| `RBC_AppointMethod` | `^RBC("APTM",methodId)` | 预约方式（TEL/WIN/...） |
| `RBC_SessionType` | `^RBC("AT",typeId)` | 预约类型/出诊级别 |
| `MRC_ICDDx` | `^MRC("ID",icdId)` | ICD 诊断编码（`^2`=描述） |
| `OEC_OrderCategory` | `^OEC("ORCAT")` | 医嘱大类 |
| `OEC_OrderStatus` | `^OEC("OSTAT")` | 医嘱状态 |
| `OEC_Priority` | — | 医嘱优先级（长期/临时） |
| `DHC_TimeRange` | `^DHCTimeRange(trId)` | 出诊时段（上午/下午） |
| `^CD.PHA.IN.STAT(type)` | — | 药品分类 |

## 13. 检验

| SQL 表名 | 环境 | 说明 |
|----------|------|------|
| `RP_VisitNumberReport` | IRIS | 检验报告主表 |
| `RP_VisitNumberReportResult` | IRIS | 检验结果明细 |
| `BT_TestCode` | IRIS | 检验项目代码 |
| `dbo.BT_TestCode` | SQL Server | LIS 检验项目（含单位、参考范围） |
| `dbo.V_BT_TestSet` | SQL Server | LIS 检验医嘱视图（含标本、容器） |
| `dbo.BT_TestCodeRanges` | SQL Server | LIS 检验项目参考范围 |
| `dbo.BT_TestCodePanic` | SQL Server | LIS 检验项目危急值 |

> **LIS 环境注意**：`dbo.` 开头的表位于 SQL Server，SQL 语法为 T-SQL（`LEFT OUTER JOIN`、`WHERE EXISTS`），不使用 IRIS 的 Arrow 语法。

## 14. 手术

| SQL 表名 | 说明 |
|----------|------|
| `OR_Anaest_Operation` | 手术记录 |
| `OR_Anaesthesia` | 麻醉记录 |
| `DHC_AN_OPArrange` | 手术安排（`^DHCANOPArrange`） |

## 15. 常用 Global 取值模式

| 需求 | 代码 |
|------|------|
| 取就诊信息 | `s PAADMData=$g(^PAADM(AdmId))` → `s AdmType=$p(PAADMData,"^",2)`, `s VisitStatus=$p(PAADMData,"^",20)` |
| 取病人姓名 | `s PAPMIDR=$p(PAADMData,"^",1)` → `s Name=$p($g(^PAPER(PAPMIDR,"ALL")),"^",1)` |
| 取科室名称 | `s LocDR=$p(PAADMData,"^",4)` → `s LocDesc=$p($g(^CTLOC(LocDR)),"^",2)` |
| 取医生姓名 | `s DocDR=$p(PAADMData,"^",9)` → `s DocName=$p($g(^CTPCP(DocDR,1)),"^",2)` |
| 取医嘱名称 | `s ARCIMSub=$p(ItemMastDR,"\|\|",2)` → `s Desc=$p($g(^ARCIM(+ItemMastDR,ARCIMSub,1)),"^",2)` |
| 取诊断描述 | `s ICDDR=$p($g(^MR(Adm,"DIA",sub)),"^",1)` → `s DiagDesc=$p($g(^MRC("ID",ICDDR)),"^",2)` |
| 取收费项目 | `s TarName=$p($g(^DHCTARI(TarItemDR)),"^",2)` |
| 取用户姓名 | `s UserName=$p($g(^SSU("SSUSR",UserDR)),"^",2)` |
| 取年龄 | `s Age=##class(EMRservice.HISInterface.PatientInfoAssist).Age(PapmiDR,AdmID,"","")` |
| 就诊状态 | `Status=$p(PAADMData,"^",20)` — A=在院, C=取消, D=出院 |
| 就诊类型 | `Type=$p(PAADMData,"^",2)` — O=门诊, E=急诊, I=住院 |

## 16. 枚举值汇总

| 枚举 | 值 | 含义 |
|------|-----|------|
| **就诊类型** | `O` `E` `I` `H` | 门诊、急诊、住院、体检 |
| **就诊状态** | `A` `C` `D` | 在院/正常、取消、出院 |
| **预约状态** | `I` `A` `X` `J` | 已预约、已取号、已取消、爽约 |
| **号源状态** | `0` `1` `2` `3` `4` `5` | 可用、现场挂、已预约、取号、退号、加号 |
| **险种类型** | `310` `390` | 职工医保、城乡医保 |
| **支付状态** | `P` `B` | 已付、部分付 |
| **医嘱执行** | `1` | 已执行 |
| **科室类型** | `W` `E` `D` `OP` `EM` | 病区、执行科室、药房、手术室、急诊 |
| **医护类型** | `DOCTOR` `NURSE` | 医生、护士 |
| **记账状态** | `TB` `B` | 未账单、已账单 |

## 17. 已验证索引清单

以下索引已通过 XML Storage 文件或终端验证确认存在：

| 索引 | 所属表/Global | 用途 | 验证方式 |
|------|--------------|------|---------|
| `^DHCINTR(0,"TypeDate",Type,Date,RowId)` | DHC_INTRANS | 按类型+日期查库存变动 | XML ✅ |
| `^DHCINTR(0,"TypePointer",Type,Pointer,RowId)` | DHC_INTRANS | 按类型+指针查库存变动 | XML ✅ |
| `^DHCINTR(0,"INCLB",INCLB,Date,RowId)` | DHC_INTRANS | 按批次库存查库存变动 | XML ✅ |
| `^DHCINCIB(0,"INCIB",incibDr,RowId)` | DHC_IncItmBat | 按INC_ItmBat查批次扩展 | XML ✅ |
| `^OEORD(0,"PrescNo",prescNo,ord,chl)` | OE_OrdItem | 按处方号查医嘱 | XML ✅ |
| `^PAADMi("NotCompl","I",LocId,AdmId)` | PA_Adm | 在院住院患者 | 代码 ✅ |
| `^DHCPHDISPi("FYDATE",Date,PHLDR,ROWID)` | DHC_PHDISPEN | 门诊发药按日期 | 代码 ✅ |
| `^DHCWorkLoad(0,"ORDDATE",date,wlId)` | DHC_WorkLoad | 工作量按日期 | 代码 ✅ |
| `^DHCWorkLoad(0,"DateItemOrd",date,arcimId,wlId)` | DHC_WorkLoad | 工作量按日期+医嘱项 | 代码 ✅ |
| `^DHCWorkLoad(0,"TARITEM",tarId,wlId)` | DHC_WorkLoad | 工作量按收费项 | 代码 ✅ |
| `^DHCWorkLoad(0,"PAADM",admId,wlId)` | DHC_WorkLoad | 工作量按就诊 | 代码 ✅ |
| `^MRi("Date",Date,MRRowId)` | MR_Adm | 按日期查诊断 | 代码 ✅ |

## 18. ⚠️ 关键踩坑提醒

### 18.1 Global 名 ≠ 类名（最致命陷阱）

**绝不能根据类名推测 Global 名**，必须通过 XML Storage 文件或 CSV 工具表验证：

| 类名 | ❌ 错误推测 | ✅ 真实 Global | 验证来源 |
|------|-----------|-----------|---------|
| `DHC_PHACollected` | `^DHCPHACOLLECT` | **`^DHCPHAC`** | DHCPHACollected.xml |
| `DHC_PHDISPEN` | `^DHCPHDISPEN` | **`^DHCPHDISP`** | DHCPHDISPEN.xml |
| `DHC_PhaReturn` | `^DHCPHARETURN` | **`^PHARET`** | DHCPhaReturn.xml |
| `DHC_PHRET` | `^DHCPHRET` | **`^DHCPHRET`** ✅ | 唯一与类名一致的 |

### 18.2 子表可能不是子节点

`DHC_PHDISITEM`（门诊发药明细）**不是** `^DHCPHDISP(disId,"I",...)` 的子节点，而是**独立 Global** `^DHCPHDI(disId||itmSub)`。直接按子节点遍历会取到空数据。

### 18.3 Piece 位置 ≠ SQL 列号

CSV 工具表中 `propertyColumn` 是 SQL 列号，`propertyPiece` 才是 `$p(..., "^", N)` 的 N 值。两者完全不同，混淆会导致取错字段。

### 18.4 INCLB_INCIB_DR 格式不统一

`INC_ItmLcBt` 的 `INCLB_INCIB_DR` 字段（指向 `INC_ItmBat`）可能只存 `ibSub`（纯数字），而非完整 `inci||ibSub`。匹配时必须同时尝试两种格式：
```objectscript
s fullKey = inci_"||"_ibSub
if (lbIncib = fullKey) || (lbIncib = ibSub) { ... }
```

### 18.5 ^DHCPHAC(colId,1) p1 为空

Type P（住院发药）通过 `INTR_Pointer` 找到 `colId` 后，`^DHCPHAC(colId,1)` 的 p1 不可靠。真正数据在子表 `^DHCPHAC(colId,"I",itmSub)`：
- p3 = PHACI_Adm_DR → PA_Adm（患者链路入口）
- p5 = PHACI_PrescNo（处方号）
- p7 = PHACI_OEDIS_DR → OE_OrdItem

### 18.6 ^DHCPHDISP(disId,1) p18 不可靠

Type F（门诊发药）的科室信息不直接从发药表取，应走：`prescNo → ^OEORD(0,"PrescNo") → ADM p4 → CT_Loc`。

### 18.7 CSP 默认 50 条上限

CSP `ClassName`/`QueryName` 处理器默认上限 50 条。URL 加 `&rows=999999` 可突破。使用 `MethodName` 绕过的方案因字符转义问题不可行。

### 18.8 嵌套循环性能陷阱

遍历 INCLB × 日期范围时，O(N × D) 嵌套循环性能极差。改用两阶段架构：
```
Phase 1: 构建 INCLB 集合（O(N)）
Phase 2: 统一日期扫描 + 集合匹配（O(D)）
总复杂度 O(N + D) 替代 O(N × D)
```

### 18.9 索引使用前必须验证

新索引必须先通过 XML Storage 文件或 CSV 工具表确认存在后再使用。凭空推测的索引名大概率不存在或效率极差。

## 19. 病案编目数据 (User.DHCMRInfo)

> 工具表路径：`HISUI-工具表/DHCMRInfo.xml`、`DHCMRInfo-props.csv`、`DHCMRInfo样例数据.txt`

### 表结构

| SQL 表名 | Global | 存储内容 | 字段数 |
|----------|--------|----------|--------|
| `User.DHCMRInfo` | `^DHCMRInfo(rowId)` | 病案首页数据 | ~596 字段 |

### 存储格式

`^` 分隔符，`$p(data, "^", piece)` 取值。每条记录包含患者基本信息、住院信息、诊断信息、手术信息、费用信息、人员信息、护理质量等完整病案首页数据。

### 关键字段索引

| 索引 | 路径 | 用途 |
|------|------|------|
| 出院日期 | `^DHCMRInfo(0,"MR_DIS_DATE",dateH,rowId)` | 按出院日期查 |
| 入院日期 | `^DHCMRInfo(0,"MR_ADM_DATE",dateH,rowId)` | 按入院日期查 |
| 入院科室 | `^DHCMRInfo(0,"MR_ADM_DEPT_DR",deptDr,rowId)` | 按入院科室查 |
| 就诊ID | `^DHCMRInfo(0,"MR_PAADM_DR",admId,rowId)` | 按就诊ID查 |

### 完整 Piece 位置 → [HIS_Global结构速查.md § 病案首页](HIS_Global结构速查.md)

### 遍历模式

```objectscript
// 全量遍历（查询场景）
s id = 0
for {
    s id = $o(^DHCMRInfo(id))
    q:id=""
    s data = $g(^DHCMRInfo(id))
    s val = $p(data, "^", piece)    // 按 piece 取值
}
```

### 关联关系

```
^DHCMRInfo(rowId)
  ├─ p7  → ^PAADM(admId)       （就诊记录）
  ├─ p4  → 病案号               （唯一标识）
  ├─ p36 → ^CTLOC(locId)       （入院科室）
  ├─ p40 → ^CTLOC(locId)       （出院科室）
  ├─ p52 → ICD-10 编码          （主要诊断）
  └─ p231-258 → 各类费用         （共 28 个费用字段）
```
