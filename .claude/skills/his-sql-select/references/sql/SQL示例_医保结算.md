# SQL 查询示例 — 医保结算

> 来源：`住院结算主单.txt` + `住院结算明细.txt` + `门诊结算主单.txt` + `门诊结算明细.txt`
> 环境：InterSystems IRIS for Health，使用箭头语法和 `{fn concat}` 等 IRIS 特有语法
> 用途：导出医保结算主单/明细上传到医保系统

---

## 住院结算主单

```sql
SELECT
    A.PRT_Adm brige_id,
    a.PRT_Rowid hisid,
    a.PRT_Hospital_DR->HOSP_Code hospital_id,
    a.PRT_Hospital_DR->HOSP_Desc hospital_name,
    '' p_level,
    b.INPAY_AdmInfoDr->INADM_States bmi_area_id,
    '' bmi_area_name,
    A.PRT_Date bill_date,
    A.PRT_Date year,
    a.PRT_Date month,
    a.PRT_Adm->PAADM_ADMNo zyh,
    a.PRT_Adm->PAADM_PAPMI_DR patient_id,
    A.PRT_Adm->PAADM_PAPMI_DR->PAPMI_DVAnumber social_id,
    A.PRT_Adm->PAADM_PAPMI_DR->PAPMI_Medicare medical_record_id,
    A.PRT_Adm->PAADM_AdmReason_DR->REA_Desc benefit_type,
    b.INPAY_AdmInfoDr->INADM_PatType benefit_group_id,
    b.INPAY_AdmInfoDr->INADM_DeptDesc admission_dept_name,
    '' transfer_dept_name,
    a.PRT_Adm->PAADM_DepCode_DR->CTLOC_Desc discharge_dept_name,
    '' doctor_id,
    '' doctor_name,
    a.PRT_Adm->PAADM_PAPMI_DR->PAPMI_Name patient_name,
    a.PRT_Adm->PAADM_PAPMI_DR->PAPMI_Sex_DR->CTSEX_Desc patient_gender,
    A.PRT_Adm->PAADM_PAPMI_DR->PAPMI_DOB patient_birthday,
    c.PAPER_AgeYr patient_age,
    b.INPAY_AdmInfoDr->INADM_Company patient_company,
    c.PAPER_StName patient_address,
    '' bedid,
    '' nb_type,
    '' nb_birth_weight,
    '' nb_inpatient_weight,
    '' claim_type,
    '' if_local_flag,
    a.PRT_Adm->PAADM_AdmDate,
    a.PRT_Adm->PAADM_AdmTime admission_date,
    A.PRT_Adm->PAADM_DischgDate,
    a.PRT_Adm->PAADM_DischgTime discharge_date,
    A.PRT_Adm->PAADM_DischgDate - a.PRT_Adm->PAADM_AdmDate zyts,
    '' discharge_status,
    '' pre_admission_date,
    '' days31_re_admission,
    a.PRT_Acount total_amount,
    b.INPAY_jjzfe0 bmi_pay_amount,
    b.INPAY_InsuPay2 dbbx,
    b.INPAY_InsuPay4 yljz,
    b.INPAY_InsuPay3 gwybz,
    '' debc,
    b.INPAY_InsuPay6 qybc,
    b.INPAY_grzfe0 cash,
    sum(b.INPAY_zhzfe0) self_pay_amount,
    '' self_pay_in,
    b.INPAY_Zstr12 self_pay_out,
    b.INPAY_Zstr26 bmi_convered_amount,
    b.INPAY_AdmInfoDr->INADM_XString1 admission_disease_id,
    b.INPAY_AdmInfoDr->INADM_XString2 admission_disease_name,
    '' discharge_disease_id_main,
    %exact(TYP_ParRef->MRDIA_MRADM_ParRef),
    LIST(TYP_ParRef->MRDIA_ICDCode_DR->MRCID_Desc %foreach(TYP_ParRef->MRDIA_MRADM_ParRef)) discharge_disease_name_main,
    '' yb_pay_type,
    '' drgs_code,
    '' drgs_name
FROM DHC_INVPRTZY A, INSU_Divide B, PA_Person C, MR_DiagType D
WHERE A.PRT_Adm = B.INPAY_AdmDr
  AND A.PRT_Adm->PAADM_PAPMI_DR = C.PAPER_RowId
  AND A.PRT_Adm->PAADM_MainMRADM_DR = D.TYP_ParRef->MRDIA_MRADM_ParRef
  AND A.PRT_Date BETWEEN "2024-1-1" AND "2024-1-31"
  AND A.PRT_Flag = "N"
  AND B.INPAY_Flag = "I"
  AND D.TYP_MRCDiagTyp = "1"
GROUP BY A.PRT_Adm
```

---

## 住院结算明细

```sql
SELECT
    a.PRT_Rowid hisid,
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
    {fn concat({fn concat(to_char(a.PRT_Adm->PAADM_DischgDate, 'YYYY-MM-DD'), ' ')}, TO_CHAR(a.PRT_Adm->PAADM_DischgTime, 'HH:MM:SS'))} bill_date,
    to_char(a.PRT_Adm->PAADM_DischgDate, "YYYY") year,
    to_char(a.PRT_Adm->PAADM_DischgDate, "MM") month,
    B.INDIS_OEORI_Dr->OEORI_Priority_DR->OECPR_Code Discharge_medication,
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
    '' p_type,
    '' p_type_pct
FROM DHC_INVPRTZY a, INSU_DivideSub b, OE_OrdExec c
WHERE a.PRT_Adm = b.INDIS_DivideDr->INPAY_AdmDr
  AND b.INDIS_ExecDr = c.OEORE_RowId
  AND a.PRT_Rowid = 4851
  AND a.PRT_Date BETWEEN "2024-1-1" AND "2024-1-31"
  AND A.PRT_Flag = "N"
  AND b.INDIS_DivideDr->INPAY_Flag = "I"
```

---

## 门诊结算主单

```sql
SELECT
    A.DHCBCI_INVDR brige_id,
    A.DHCBCI_INVDR->PRT_Rowid hisid,
    a.PRT_Hospital_DR->HOSP_Code hospital_id,
    a.PRT_Hospital_DR->HOSP_Desc hospital_name,
    '' p_level,
    b.INPAY_AdmInfoDr->INADM_States bmi_area_id,
    '' bmi_area_name,
    A.DHCBCI_INVDR->PRT_Date bill_date,
    A.DHCBCI_INVDR->PRT_Date year,
    A.DHCBCI_INVDR->PRT_Date month,
    a.PRT_Adm->PAADM_ADMNo mzh,
    A.DHCBCI_ADMDR->PAADM_PAPMI_DR patient_id,
    A.DHCBCI_ADMDR->PAADM_PAPMI_DR->PAPMI_DVAnumber social_id,
    A.DHCBCI_ADMDR->PAADM_AdmReason_DR->REA_Desc benefit_type,
    b.INPAY_AdmInfoDr->INADM_PatType benefit_group_id,
    b.INPAY_AdmInfoDr->INADM_DeptDesc admission_dept_name,
    '' doctor_id,
    '' doctor_name,
    A.DHCBCI_ADMDR->PAADM_PAPMI_DR->PAPMI_Name patient_name,
    A.DHCBCI_ADMDR->PAADM_PAPMI_DR->PAPMI_Sex_DR->CTSEX_Desc patient_gender,
    A.DHCBCI_ADMDR->PAADM_PAPMI_DR->PAPMI_DOB patient_birthday,
    c.PAPER_AgeYr patient_age,
    b.INPAY_AdmInfoDr->INADM_AdmType claim_type,
    b.INPAY_AdmInfoDr->INADM_States if_local_flag,
    b.INPAY_AdmInfoDr->INADM_XString1 admission_disease_id,
    b.INPAY_AdmInfoDr->INADM_XString2 admission_disease_name,
    A.DHCBCI_INVDR->PRT_Acount total_amount,
    b.INPAY_jjzfe0 bmi_pay_amount,
    b.INPAY_grzfe0 cash,
    sum(b.INPAY_zhzfe0) self_pay_amount,
    b.INPAY_Zstr26 bmi_convered_amount
FROM DHC_BillConINV A, INSU_Divide B, PA_Person C
WHERE A.DHCBCI_ADMDR = B.INPAY_AdmDr
  AND A.DHCBCI_ADMDR->PAADM_PAPMI_DR = C.PAPER_RowId
  AND A.DHCBCI_INVDR->PRT_Date BETWEEN "2024-1-1" AND "2024-1-31"
  AND A.DHCBCI_INVDR->PRT_Flag = "N"
  AND B.INPAY_Flag = "I"
GROUP BY A.DHCBCI_ADMDR
```

---

## 门诊结算明细

```sql
SELECT
    A.DHCBCI_INVDR->PRT_Rowid hisid,
    A.DHCBCI_ADMDR->PAADM_PAPMI_DR patient_id,
    A.DHCBCI_ADMDR->PAADM_PAPMI_DR->PAPMI_Name patient_name,
    A.DHCBCI_INVDR->PRT_Hospital_DR->HOSP_Code hospital_id,
    a.PRT_Hospital_DR->HOSP_Desc hospital_name,
    '' Discharge_dept_id,
    B.INDIS_DivideDr->INPAY_AdmInfoDr->INADM_DeptDesc admission_dept_name,
    b.INDIS_OEORI_Dr->OEORI_Doctor_DR->CTPCP_Code doctor_id,
    b.INDIS_OEORI_Dr->OEORI_Doctor_DR->CTPCP_Desc doctor_name,
    B.INDIS_DivideDr->INPAY_AdmInfoDr->INADM_XString2 admission_disease_name_main,
    A.DHCBCI_INVDR->PRT_Date bill_date,
    A.DHCBCI_INVDR->PRT_Date year,
    A.DHCBCI_INVDR->PRT_Date month,
    B.INDIS_OEORI_Dr->OEORI_PrescNo prescription,
    b.INDIS_TarItmDr->TARI_InpatCate->TARIC_Desc p_category,
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
    '' p_type,
    '' p_type_pct
FROM DHC_BillConINV A, INSU_DivideSub B, PA_Person C, OE_OrdExec D
WHERE A.DHCBCI_ADMDR = B.INDIS_DivideDr->INPAY_AdmDr
  AND A.DHCBCI_ADMDR->PAADM_PAPMI_DR = C.PAPER_RowId
  AND B.INDIS_ExecDr = D.OEORE_RowId
  AND A.DHCBCI_INVDR->PRT_Date BETWEEN "2024-1-1" AND "2024-1-10"
  AND A.DHCBCI_INVDR->PRT_Flag = "N"
  AND B.INDIS_DivideDr->INPAY_Flag = "I"
GROUP BY A.DHCBCI_ADMDR
```

---

## 涉及的核心表

| 表名 | 说明 |
|------|------|
| `DHC_INVPRTZY` | 住院发票主表 |
| `DHC_BillConINV` | 门诊发票主表 |
| `INSU_Divide` | 医保结算主单 |
| `INSU_DivideSub` | 医保结算明细 |
| `PA_Person` | 病人个人信息 |
| `PA_Adm` | 病人就诊记录 |
| `OE_OrdItem` | 医嘱项表 |
| `OE_OrdExec` | 医嘱执行表 |
| `MR_DiagType` | 诊断类型表（出院诊断） |
