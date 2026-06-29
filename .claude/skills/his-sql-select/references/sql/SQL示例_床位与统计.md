# SQL 查询示例 — 床位与统计

> 来源：`../SQL查询示例汇总_按表归类.md`。按业务域拆分后的 RAG 知识库文件。仅允许 SELECT。

---

## 一、床位与病区管理相关表

### 1. PAC_Ward（病区表）

**查询病区信息：**
```sql
SELECT * FROM PAC_Ward WHERE WARD_RowId = 71
```

---

### 2. PAC_Bed（床位表）

**按病区查询床位：**
```sql
SELECT * FROM PAC_Bed WHERE BED_WARD_ParRef = 71
```

**可用床位查询（按床位类型+标识）：**
```sql
SELECT BED_RcFlag, * FROM PAC_Bed
WHERE BED_BedType_DR = '37' AND BED_RcFlag = "Y" AND BED_Available = "Y"
```

---

### 3. PAC_BEDADM / PAC_BedAdm（床位入住记录表）

**按床位Rowid查询入住记录：**
```sql
SELECT * FROM PAC_BEDADM WHERE ADM_ParRef = '80||39'
```

**床位入住及就诊状态查询：**
```sql
SELECT b.BED_Code, b.BED_WARD_ParRef->WARD_Code,
       a.ADM_PAADM_DR->PAADM_VisitStatus, a.*
FROM PAC_BedAdm a, PAC_Bed b
WHERE a.ADM_ParRef = b.BED_RowID
AND a.ADM_PAADM_DR->PAADM_VisitStatus = "C"
ORDER BY b.BED_Code
```

---

### 4. PAC_WardAdm（病区入住记录表）

**按就诊Rowid查询病区入住：**
```sql
SELECT * FROM pac_wardadm WHERE WADM_PAADM_DR = 5401056
-- 查询这两个表的数据，核实病人是否出院，出院的话再delete掉
```

---

### 5. PAC_WardRoom（病房信息表）

**按病区Rowid查询病房：**
```sql
SELECT * FROM PAC_WardRoom WHERE ROOM_ParRef = 71
```

---

## 二、工作量统计相关表

### 6. DHCMRIPDay（病区日报表）

**按病区+日期查询日报：**
```sql
SELECT * FROM DHCMRIPDay
WHERE MRIP_WARD = "96" AND MRIP_date = "2018-06-15"
-- 96为病区id，PAC_Ward的Rowid；取到这个表的ROWID
```

---

### 7. DHC_MRIPDetail（病区明细表）

**关联日报表Rowid查询明细：**
```sql
SELECT * FROM DHC_MRIPDetail WHERE IPDE_MRIPDay_Dr = 491054
-- IPDE_MRIPDay_Dr = DHCMRIPDay表的Rowid
-- type是类型，PAADMDR是就诊记录的Rowid
```

---

> **说明：**
> - 所有日期查询需使用格式：`2017-08-08 0:00:00`
> - `->` 为 IRIS 箭头语法，用于对象引用关联
> - `||` 为 IRIS 子表 Rowid 分隔符
> - SQL 仅允许 SELECT 语句，禁止 INSERT/UPDATE/DELETE/DROP
