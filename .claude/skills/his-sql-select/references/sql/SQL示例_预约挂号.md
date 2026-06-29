# SQL 查询示例 — 预约挂号

> 来源：`../SQL查询示例汇总_按表归类.md`。按业务域拆分后的 RAG 知识库文件。仅允许 SELECT。

---

## 一、预约挂号相关表

### 1. DHC_RBApptSchedule（号源表/医生坐诊信息）

**按Rowid查询号源：**
```sql
SELECT * FROM DHC_RBApptSchedule WHERE AS_Rowid = '7685||1'
```

---

### 2. DHCRegistrationFee（病人挂号表）

**按号源关联查询挂号：**
```sql
SELECT * FROM DHCRegistrationFee WHERE RegfeeRBASDr = '7685||1'
-- 关联 DHC_RBApptSchedule
```

---

### 3. CT_LockSchedule（锁号表）

**按排班关联查询锁号：**
```sql
SELECT * FROM CT_LockSchedule WHERE CT_Schedule = '8609||743'
```

---

### 4. RB_Appointment（预约表）

**查询预约未取号记录：**
```sql
SELECT TOP 1000 e.RES_Desc, b.PAPER_TelH, C.CF_CardNo, A.*
FROM (
    SELECT TOP 1000 APPT_PAPMI_DR->PAPMI_NO, APPT_PAPMI_DR->PAPMI_NAME,
           APPT_TransDate, APPT_DateComp, APPT_PAPMI_DR, APPT_AS_ParRef
    FROM RB_Appointment
    WHERE APPT_Adm_DR IS NULL
    AND APPT_Status = "I"  -- I是预约状态，X是取消预约，A是已取号
    AND APPT_DateComp BETWEEN "2019-03-14" AND "2019-04-15"
) A, PA_Person b, DHC_CardRef C, DHC_RBApptSchedule d, RB_Resource e
WHERE a.APPT_PAPMI_DR = b.PAPER_RowId
AND a.APPT_PAPMI_DR = C.CF_PAPMI_DR
AND c.CF_ActiveFlag = "N"
AND a.APPT_AS_ParRef = d.AS_Rowid
AND d.AS_RES_ParRef = e.RES_RowId1
```

---

### 5. RB_Resource（预约资源表）

**按代码查询资源：**
```sql
SELECT * FROM RB_Resource WHERE RES_Code = "00121"
```

---

### 6. RB_ApptSchedule（排班表）

**按资源和日期查询排班：**
```sql
SELECT * FROM RB_ApptSchedule
WHERE AS_RES_ParRef = '6209'
AND AS_Date = '2020-05-22'
ORDER BY AS_ChildSub desc
```

---

### 7. DHC_RBApptScheduleAppQty（排班子表/预约资源数量）

**按排班查询可预约数量：**
```sql
SELECT * FROM DHC_RBApptScheduleAppQty WHERE ASQASParRef = '6209||251'
```

---

### 8. RBC_AppointMethod（预约方式表）

**查询所有预约方式：**
```sql
SELECT * FROM RBC_AppointMethod
```

---

> **说明：**
> - 所有日期查询需使用格式：`2017-08-08 0:00:00`
> - `->` 为 IRIS 箭头语法，用于对象引用关联
> - `||` 为 IRIS 子表 Rowid 分隔符
> - SQL 仅允许 SELECT 语句，禁止 INSERT/UPDATE/DELETE/DROP
