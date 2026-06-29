# SQL 查询示例 — 医嘱与收费

> 来源：`../SQL查询示例汇总_按表归类.md`。按业务域拆分后的 RAG 知识库文件。仅允许 SELECT。

---

## 一、医嘱相关表

### 1. OE_OrdItem（医嘱项表）

**查询医嘱日期相关字段：**
```sql
SELECT OEORI_SttDat, OEORI_SttTim, OEORI_InsertDate, OEORI_InsertTime,
       OEORI_XDate, OEORI_Date, OEORI_FinDate, *
FROM OE_OrdItem
WHERE OEORI_RowId = "2649355||44"
```

**根据处方号查病人信息：**
```sql
SELECT OEORD_Adm_DR->PAADM_AdmDate,
       OEORD_Adm_DR->PAADM_PAPMI_DR->PAPMI_NO,
       OEORD_Adm_DR->PAADM_PAPMI_DR->PAPMI_NAME,
       A.OEORI_PrescNo
FROM OE_OrdItem A, OE_ORDER B
WHERE A.OEORI_PrescNo = "O19032103278"
AND A.OEORI_OEORD_ParRef = B.OEORD_RowId1
```

**药品医嘱关联查询（计价单位、单价、基本单位）：**
```sql
SELECT ARCIM_BillingUOM_DR->CTUOM_Desc AS 计价单位,
       m.OLT_Tariff_DR,
       INCI_CTUOM_DR->CTUOM_Desc AS 基本单位,
       INCI_CTUOM_DR,
       P.TP_Price,
       T.*
FROM ARC_ItmMast T, DHC_OrderLinkTar m, DHC_TarItem n, DHC_TarItemPrice P, INC_Itm q
WHERE t.ARCIM_RowId = m.OLT_ARCIM_DR
AND m.OLT_Tariff_DR = n.TARI_RowId
AND T.ARCIM_RowId = q.INCI_ARCIM_DR
AND n.TARI_RowId = P.TP_TARI_ParRef
AND P.TP_EndDate IS NULL
AND T.ARCIM_Code = 'H01N001'
```

---

### 2. OE_OrdExec（医嘱执行表）

**住院结算明细关联查询：**
```sql
SELECT c.OEORE_ExStDate usage_date
FROM DHC_INVPRTZY a, INSU_DivideSub b, OE_OrdExec c
WHERE a.PRT_Adm = b.INDIS_DivideDr->INPAY_AdmDr
AND b.INDIS_ExecDr = c.OEORE_RowId
AND a.PRT_Rowid = 4851
AND a.PRT_Date BETWEEN "2024-1-1" AND "2024-1-31"
AND A.PRT_Flag = "N"
AND b.INDIS_DivideDr->INPAY_Flag = "I"
```

---

### 3. ARC_ItmMast（收费项目/医嘱项主表）

**药品医嘱关联查询：**（见 OE_OrdItem 中的多表关联查询）

---

### 4. OEC_ExecCateg（医嘱执行分类表）

**查询所有执行分类：**
```sql
SELECT * FROM OEC_ExecCateg
```

---

## 二、收费/发票相关表

### 5. DHC_INVPRT（发票打印记录表）

**按Rowid查询发票：**
```sql
SELECT * FROM DHC_INVPRT WHERE PRT_Rowid = 8991743
```

**按日期+用户+标志查询发票：**
```sql
SELECT * FROM DHC_INVPRT
WHERE PRT_Date > "2018-03-06" AND PRT_Date < "2018-04-10"
AND PRT_Usr = 7118 AND PRT_Flag = "TP"
```

---

### 6. DHC_INVPRTZY（住院发票表）

**住院结算明细完整查询：**
```sql
SELECT a.PRT_Rowid hisid,
       a.PRT_Adm->PAADM_PAPMI_DR patient_id,
       a.PRT_Adm->PAADM_ADMNo zyh,
       a.PRT_Adm->PAADM_PAPMI_DR->PAPMI_Name patient_name,
       a.PRT_Hospital_DR->HOSP_Code hospital_id,
       a.PRT_Hospital_DR->HOSP_Desc hospital_name,
       b.INDIS_OEORI_Dr->OEORI_OrdDept_DR->CTLOC_Code Billing_dept_id,
       b.INDIS_OEORI_Dr->OEORI_OrdDept_DR->CTLOC_Desc Billing_dept_name,
       b.INDIS_OEORI_Dr->OEORI_Doctor_DR->CTPCP_Code doctor_id,
       b.INDIS_OEORI_Dr->OEORI_Doctor_DR->CTPCP_Desc doctor_name,
       b.INDIS_DivideDr->INPAY_AdmInfoDr->INADM_XString2 admission_disease_name,
       '' discharge_disease_name_main,
       b.INDIS_TarItmDr->TARI_InpatCate->TARIC_Desc p_category,
       c.OEORE_ExStDate usage_date,
       {fn concat({fn concat(to_char(a.PRT_Adm->PAADM_DischgDate,'YYYY-MM-DD'),' ')},
       TO_CHAR(a.PRT_Adm->PAADM_DischgTime,'HH:MM:SS'))} bill_date,
       to_char(a.PRT_Adm->PAADM_DischgDate,"YYYY") year,
       to_char(a.PRT_Adm->PAADM_DischgDate,"MM") month,
       b.INDIS_TarItmDr->TARI_Code item_id_hosp,
       b.INDIS_TarItmDr->TARI_Desc item_name_hosp,
       b.INDIS_INSUCode item_id,
       b.INDIS_INSUDesc item_name,
       '' drug_spec,
       b.INDIS_ArcimDr->ARCIM_PHCDF_DR->PHCDF_PHCF_DR->PHCF_Desc dosage_form,
       b.INDIS_TarItmDr->TARI_UOM->CTUOM_Desc packge_unit,
       b.INDIS_Price unit_price,
       b.INDIS_Qty num,
       b.INDIS_Amount cost,
       b.INDIS_Demo3 self_pay_limit,
       b.INDIS_Demo2 bmi_convered_amount,
       '' p_type, '' p_type_pct
FROM DHC_INVPRTZY a, INSU_DivideSub b, OE_OrdExec c
WHERE a.PRT_Adm = b.INDIS_DivideDr->INPAY_AdmDr
AND b.INDIS_ExecDr = c.OEORE_RowId
AND a.PRT_Rowid = 4851
AND a.PRT_Date BETWEEN "2024-1-1" AND "2024-1-31"
AND A.PRT_Flag = "N"
AND b.INDIS_DivideDr->INPAY_Flag = "I"
```

---

### 7. DHC_OrderLinkTar（医嘱关联收费项目表）

**药品医嘱关联收费查询：**（见 OE_OrdItem 中的多表关联查询）

---

### 8. DHC_TarItem（收费项目表）

**药品医嘱关联收费查询：**（见 OE_OrdItem 中的多表关联查询）

---

### 9. DHC_TarItemPrice（收费项目价格表）

**药品医嘱关联价格查询：**（见 OE_OrdItem 中的多表关联查询）

---

## 三、账户与卡管理相关表

### 10. DHC_CardRef（卡信息表）

**查询重复卡号：**
```sql
SELECT CF_CardNo, count(CF_CardNo)
FROM DHC_CardRef
WHERE CF_ActiveFlag = "N"
GROUP BY CF_CardNo
HAVING count(CF_CardNo) > 1
```

**按病人查询卡信息：**
```sql
SELECT * FROM DHC_CardRef WHERE CF_PAPMI_DR = 486152
```

---

### 11. DHC_AccPayDeposit（预缴金记录表）

**按病人查预缴金：**
```sql
SELECT * FROM DHC_AccPayDeposit WHERE AccPD_PAPMI_DR = 331066
```

**按日期范围查预缴金：**
```sql
SELECT * FROM DHC_AccPayDeposit
WHERE AccPD_Date BETWEEN "2018-03-06" AND "2018-04-10"
AND AccPD_User_DR = 7118
```

---

### 12. DHC_AccManager（账户管理表）

**按病人查账户信息：**
```sql
SELECT * FROM DHC_AccManager WHERE AccM_PAPMI_DR = 331066
```

---

## 四、医保相关表

### 13. INSU_DivideSub（医保上传明细表）

**住院结算明细关联查询：**（见 DHC_INVPRTZY 中的完整SQL）

---

> **说明：**
> - 所有日期查询需使用格式：`2017-08-08 0:00:00`
> - `->` 为 IRIS 箭头语法，用于对象引用关联
> - `||` 为 IRIS 子表 Rowid 分隔符
> - SQL 仅允许 SELECT 语句，禁止 INSERT/UPDATE/DELETE/DROP
