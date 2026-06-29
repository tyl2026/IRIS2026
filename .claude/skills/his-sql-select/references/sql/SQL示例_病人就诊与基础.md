# SQL 查询示例 — 病人就诊与基础

> 来源：`../SQL查询示例汇总_按表归类.md`。按业务域拆分后的 RAG 知识库文件。仅允许 SELECT。

---

## 一、病人与就诊相关表

### 1. PA_PatMas（病人主索引表）

**查询病人基本信息：**
```sql
SELECT * FROM PA_PatMas WHERE PAPMI_No="0000600664"
```

---

### 2. PA_Person（病人信息表）

**预约记录关联查询（含电话）：**
```sql
SELECT TOP 1000 e.RES_Desc, b.PAPER_TelH, C.CF_CardNo, A.*
FROM (
    SELECT TOP 1000 APPT_PAPMI_DR->PAPMI_NO, APPT_PAPMI_DR->PAPMI_NAME,
           APPT_TransDate, APPT_DateComp, APPT_PAPMI_DR, APPT_AS_ParRef
    FROM RB_Appointment
    WHERE APPT_Adm_DR IS NULL
    AND APPT_Status="I"
    AND APPT_DateComp BETWEEN "2019-03-14" AND "2019-04-15"
) A, PA_Person b, DHC_CardRef C, DHC_RBApptSchedule d, RB_Resource e
WHERE a.APPT_PAPMI_DR = b.PAPER_RowId
AND a.APPT_PAPMI_DR = C.CF_PAPMI_DR
AND c.CF_ActiveFlag = "N"
AND a.APPT_AS_ParRef = d.AS_Rowid
AND d.AS_RES_ParRef = e.RES_RowId1
```

---

### 3. PA_Adm（就诊记录表）

**查询就诊记录详情：**
```sql
SELECT PAADM_VisitStatus, PAADM_PAPMI_DR->PAPMI_NO, PAADM_PAPMI_DR->PAPMI_NAME, *
FROM PA_Adm WHERE PAADM_RowID = 2030073
```

**按日期查住院就诊：**
```sql
SELECT * FROM PA_Adm WHERE PAADM_AdmDate = '2017-8-9 0:00:00' AND PAADM_Type = 'I'
```

**指向查询示例（A表字段指向B表rowid）：**
```sql
SELECT PAADM_PAPMI_DR->PAPMI_Name, * FROM SQLUser.PA_Adm WHERE PAADM_PAPMI_DR = 331066
-- A表：PA_Adm PAADM_PAPMI_DR  B表：PA_PatMas PAPMI_Rowid，查找出B表的数据
```

**门急诊人次统计（按科室区分门诊/急诊）：**
```sql
SELECT CTLOC_Desc,
       decode(PAADM_Type,'O',num,0) AS mz,
       decode(PAADM_Type,'E',num,0) AS jz,
       decode(PAADM_Type,'O',num,0) + decode(PAADM_Type,'E',num,0) AS mjz
FROM (
    SELECT PAADM_DepCode_DR->CTLOC_Desc, PAADM_Type, count(PAADM_ADMNo) AS num
    FROM PA_Adm
    WHERE PAADM_Type IN ('O','E')
    AND PAADM_VisitStatus = 'A'
    AND PAADM_AdmDate BETWEEN '2016-05-01' AND '2016-05-01'
    GROUP BY PAADM_DepCode_DR->CTLOC_Desc, PAADM_Type
)
```

**就诊状态核实查询：**
```sql
SELECT PAADM_VisitStatus, * FROM PA_Adm WHERE PAADM_RowID IN (4974651, 5096575)
```

**住院发票关联就诊查询：**
```sql
SELECT a.PRT_Rowid hisid, a.PRT_Adm->PAADM_PAPMI_DR patient_id,
       a.PRT_Adm->PAADM_ADMNo zyh,
       a.PRT_Adm->PAADM_PAPMI_DR->PAPMI_Name patient_name,
       a.PRT_Hospital_DR->HOSP_Code hospital_id,
       a.PRT_Hospital_DR->HOSP_Desc hospital_name
FROM DHC_INVPRTZY a
WHERE a.PRT_Rowid = 4851
AND a.PRT_Date BETWEEN "2024-1-1" AND "2024-1-31"
AND A.PRT_Flag = "N"
```

---

## 二、基础数据相关表

### 4. SS_User（用户表）

**按缩写查询用户：**
```sql
SELECT * FROM SS_User WHERE SSUSR_Initials = '99983'
```

---

### 5. CT_Loc（科室表）

**按Rowid查询科室：**
```sql
SELECT * FROM CT_Loc WHERE CTLOC_RowID = 796
```

---

## 三、急诊相关表

### 6. DHC_ADMVisitStatus（急诊患者表）

**按就诊Rowid查询急诊状态：**
```sql
SELECT * FROM DHC_ADMVisitStatus WHERE AVS_PAADM_DR = 5678540
-- AVS_VisitStatus->PVS_Desc 急诊状态
-- DHC_PACVisitStatus 急诊状态表
```

---

### 7. DHC_VIS_VoiceServer（语音服务器表）

**查询所有语音服务器：**
```sql
SELECT * FROM DHC_VIS_VoiceServer
```

---

## 四、微信接口相关表

### 8. CDYZone_Entity.IFPushConfig（推送消息配置表）

**查询推送消息配置：**
```sql
SELECT * FROM CDYZone_Entity.IFPushConfig
```

---

## 五、其他表

### 9. DHC_OEOrdItem（门诊收费/医保相关表）

**门诊医保费用查询：**
```sql
SELECT a.OEORI_Rowid, a.OEORI_Desc, b.INDIS_INSUCode, b.INDIS_INSUDesc,
       b.INDIS_Price, b.INDIS_Qty, b.INDIS_Amount
FROM OE_OrdItem a, INSU_DivideSub b
WHERE a.OEORI_RowId = b.INDIS_OEORI_Dr
AND a.OEORI_OEORD_ParRef->OEORD_Adm_DR = 5401056
```

---

> **说明：**
> - 所有日期查询需使用格式：`2017-08-08 0:00:00`
> - `->` 为 IRIS 箭头语法，用于对象引用关联
> - `||` 为 IRIS 子表 Rowid 分隔符
> - SQL 仅允许 SELECT 语句，禁止 INSERT/UPDATE/DELETE/DROP
