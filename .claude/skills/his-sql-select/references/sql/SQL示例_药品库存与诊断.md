# SQL 查询示例 — 药品库存与诊断

> 来源：`../SQL查询示例汇总_按表归类.md`。按业务域拆分后的 RAG 知识库文件。仅允许 SELECT。

---

## 一、药品与库存相关表

### 1. DHC_pHDISPEN（发药记录表）

**按处方号查询发药记录：**
```sql
SELECT * FROM DHC_pHDISPEN WHERE PHD_PrescNo = "O18102801905" -- 发药记录表
```

---

### 2. DHC_PHREQUEST（门诊退药申请记录表）

**按发药记录关联查询退药申请：**
```sql
SELECT * FROM DHC_PHREQUEST WHERE PHReq_Phd_dr = 1758158
-- 也可按处方号：PHReq_Prescno = "O18102801895"
```

---

### 3. DHC_OEDispensing（领药审核/发药审核表）

**领药审核及审核人查询：**
```sql
SELECT DSP_User->SSUSR_Name, DSP_ConfirmUser->SSUSR_Name, *
FROM SQLUser.DHC_OEDispensing
WHERE DSP_OEORI_DR = "4115121||206"
-- DSP_ConfirmUser->SSUSR_Name 为领药审核人
```

**按执行记录查询发药：**
```sql
SELECT * FROM DHC_OEDispensing WHERE DSP_OEORE_DR = "4397791||27||3"
```

---

### 4. DHC_OEDispBatch（发药批次表）

**按发药记录查批次：**
```sql
SELECT * FROM DHC_OEDispBatch WHERE DSPB_DSP_ParRef = 22158854
```

---

### 5. INC_Itm（药品基础信息表）

**按代码查询药品信息：**
```sql
SELECT * FROM INC_Itm WHERE INCI_Code = "XYXR00001"
```

---

### 6. INC_ItmBat（药品批次表）

**修改药品效期-查询批次：**
```sql
SELECT * FROM INC_ItmBat
WHERE INCIB_INCI_ParRef IN (
    SELECT INCI_RowId FROM INC_Itm WHERE INCI_Code = "XWY000002"
)
```

**按Rowid查询批次详情：**
```sql
SELECT * FROM INC_ItmBat WHERE INCIB_RowId = '524||134'
```

---

### 7. INC_ItmLcBt（药品库位批次表）

**按Rowid查询库位批次：**
```sql
SELECT * FROM INC_ItmLcBt WHERE INCLB_RowId = '524||6||75'
```

---

### 8. INC_ItmLOC（药品库存位置表）

**按药品查询库存位置：**
```sql
SELECT * FROM INC_ItmLOC WHERE INCIL_INCI_ParRef = 524
```

---

### 9. IN_AdjPriceBatch（批次调价表）

**按批次查调价信息：**
```sql
SELECT * FROM IN_AdjPriceBatch WHERE INAPB_Incib_Dr = '524||134'
```

**按调价结果查批次：**
```sql
SELECT * FROM IN_AdjPriceBatch
WHERE INAPB_Incib_Dr LIKE "524||%" AND INAPB_ResultSpUom = "16.1"
```

---

### 10. DHC_LocBTDailyTotal（批次日结统计表）

**按批次和日期查询日结：**
```sql
SELECT * FROM DHC_LocBTDailyTotal
WHERE DayBT_Bat_DR = '524||6||76' AND DayBT_Date = "2019-10-18"
```

---

### 11. PHC_DrgFormExt（药品剂型扩展表/抗菌药物DDD值维护表）

**查询抗菌药物DDD值：**
```sql
SELECT a.PHCDF_DDD, * FROM PHC_DrgFormExt a
-- 存维护的抗菌药物DDD值的表
```

---

### 12. DHC_AntUsePurpose（抗菌药物使用目的表）

**查询所有抗菌药物使用目的：**
```sql
SELECT * FROM DHC_AntUsePurpose
-- 开抗菌药物医嘱都会往这个表里插入一条数据
```

---

## 二、诊断相关表

### 13. DHC_MRDiagnosMaster（诊断模板记录表）

**按科室查询诊断模板：**
```sql
SELECT * FROM DHC_MRDiagnosMaster WHERE DHCDIALOC = 831
```

---

### 14. DHC_MRDiagnosICD（诊断模板明细表）

**按主表Rowid查询模板明细：**
```sql
SELECT * FROM DHC_MRDiagnosICD WHERE DHCMRDiaICD_MASTERDR = 871
```

---

### 15. MR_Adm（病人诊断主表）

**按诊断Rowid查询病人诊断：**
```sql
SELECT * FROM MR_Adm WHERE MRADM_RowId = 1565885
-- 此id也是病人就诊id
```

---

### 16. MR_Diagnos（诊断子表）

**按主表关联查询诊断子表：**
```sql
SELECT * FROM MR_Diagnos WHERE MRDIA_MRADM_ParRef = 1565885
```

---

### 17. MRC_ICDDx（ICD名称表）

**按ICD Rowid查询：**
```sql
SELECT * FROM MRC_ICDDx WHERE MRCID_RowId = 1814
```

---

### 18. MRC_DiagnosType（诊断类型表）

**查询所有诊断类型：**
```sql
SELECT * FROM MRC_DiagnosType
```

---

> **说明：**
> - 所有日期查询需使用格式：`2017-08-08 0:00:00`
> - `->` 为 IRIS 箭头语法，用于对象引用关联
> - `||` 为 IRIS 子表 Rowid 分隔符
> - SQL 仅允许 SELECT 语句，禁止 INSERT/UPDATE/DELETE/DROP
