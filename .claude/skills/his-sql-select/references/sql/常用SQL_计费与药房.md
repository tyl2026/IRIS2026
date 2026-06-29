# 常用 SQL 速查 — 计费与药房

> 来源：`常用SQL.txt`。本文档为格式整理版，SQL 语句保持原样（包括原文中可能存在的笔误），仅补齐标点与小标题。

## 目录

1. [计费 & 医保](#计费--医保)
2. [药房 & 药库 & 物资](#药房--药库--物资)

---

## 计费 & 医保

### 医保结算

```sql
SELECT * FROM INSU_Divide WHERE INPAY_Flag  INPAY_AdmDr ='40476'
```

- `INPAY_Flag`：`I` 结算 / `D` 预结算 / `B`/`S` 红冲/撤销结算（就诊号）

```sql
SELECT * FROM INSU_AdmInfo WHERE INADM_AdmDr ='37407'
```

- `INADM_ActiveFlag`：`A` 撤销登记（就诊号）

### 微信公众号收款额

```sql
SELECT sum(PRT_PatientShare) FROM Dhc_invprt WHERE PRT_Date='2021-01-11 00:00:00' AND (PRT_Usr ="12137")
```

### 病人费别查询

```sql
SELECT PAADM_AdmReason_DR,* FROM PA_Adm WHERE PAADM_AdmReason_DR=76
```

（精准扶贫）

```sql
SELECT PAADM_AdmReason_DR,* FROM PA_Adm WHERE PAADM_RowID="  "
```

（费别）

### 门诊发票类型

```sql
SELECT PRT_FairType,* FROM  DHC_INVPRT WHERE PRT_inv = "917477707"
```

返回值示例：`F`。

### 账单三表

```sql
-- `pb_payedflag`：记账；`pb_refundflag`：红冲；`pb_originalbill_dr`：原账单
SELECT * FROM dhc_patientbill WHERE pb_adm_dr = '...'
SELECT * FROM DHC_PatBillOrder WHERE pbo_pb_parref = '...'
SELECT * FROM dhc_patbilldetails WHERE pbd_pbo_parref = '...'
```

---

## 药房 & 药库 & 物资

### 住院中成药医嘱数量

```sql
SELECT COUNT(*) FROM OE_OrdItem WHERE (OEORI_ItmMast_DR IN (SELECT ARCIM_RowId FROM ARC_ItmMast WHERE ARCIM_ItemCat_DR BETWEEN "51" AND "60")) AND (OEORI_OrdDept_DR BETWEEN "42" AND "52") AND OEORI_ItemStat_DR IN (1,4) AND (OEORI_SttDat BETWEEN "2020-06-17 00:00:00" AND "2021-01-22 00:00:00")
```

### 药房 & 物资转移表

```sql
SELECT * FROM DHC_INGdRec WHERE INGR_No = "MPT20210708001"
SELECT * FROM APC_Vendor WHERE APCVM_Name ="四川南充科伦医药贸易有限公司"
SELECT * FROM DHC_INGdRec WHERE INGR_No = "MIP20210707020"   --入库单
SELECT * FROM DHC_INGdRec WHERE INGR_No = "MIP20210708005"
SELECT * FROM DHC_INGDRET WHERE INGRT_NO ='MPT20210708001'    --退货单
SELECT * FROM DHC_INGRTITM WHERE INGRTI_INGRT_Parref ="17"        ---退货单子表
SELECT * FROM DHC_INGdRecItm WHERE INGRI_INGR_ParRef="2644"    --入库单子表
SELECT * FROM CT_Loc WHERE CTLOC_RowID IN ("127","57","124","174")
SELECT TOP 10 * FROM DHC_PHACollectItm
```

### 库存变动通用表

```sql
-- 药房/药库/物资变动均涉及：DHC_INTRANS(台帐)、INC_ItmLoc(科室库存)、INC_ItmLcBt(科室批次)、DHC_LocDailyTotal、DHC_LocBTDailyTotal
SELECT * FROM DHC_INTRANS WHERE ...
SELECT * FROM INC_ItmLoc WHERE ...
SELECT * FROM INC_ItmLcBt WHERE ...
```
