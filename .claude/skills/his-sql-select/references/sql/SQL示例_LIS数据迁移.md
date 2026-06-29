# SQL 查询示例 — LIS 数据迁移（8.3 → 9.0）

> 来源：`excel-duibi/说明.md` + `excel-duibi/docs/LIS数据迁移操作手册.md`
> 环境：SQL Server，院区 `HospitalDR = 19`，HIS 院区 `HOSP_Hospital_DR = 95`

---

## 基础查询

```sql
SELECT * FROM dbo.BT_Hospital

SELECT * FROM DBO.BT_TestCode WHERE HospitalDR = 19

SELECT * FROM DBO.BT_TestSet WHERE HospitalDR = 19
```

---

## 01-检验科室

```sql
SELECT
    RowID,
    Code        科室代码,
    CName       科室名称,
    HospitalCode 医院代码,
    HospitalName 医院名称
FROM dbo.V_BT_Department
WHERE HospitalDR = 19;
```

---

## 02-工作组

```sql
SELECT
    RowID,
    Code            工作组代码,
    CName           工作组名称,
    DepartmentCode  科室代码,
    DepartmentName  科室名称
FROM dbo.V_bt_workgroup;
```

---

## 03-工作小组

```sql
SELECT
    RowID,
    Code              工作小组代码,
    CName             工作小组名称,
    WorkGroupCode     工作组代码,
    WorkGroupName     工作组名称
FROM dbo.V_BT_WorkGroupMachine
WHERE WorkGroupCode = 'BJTK';
```

---

## 04-标本类型

```sql
SELECT
    RowID,
    Code          标本代码,
    IName         标本名称,
    wcode         whone码,
    ename         英文名称,
    HospitalCode  医院代码,
    HospitalName  医院名称
FROM dbo.V_BT_Specimen
WHERE HospitalDR = 19;
```

---

## 05-采集容器

```sql
SELECT
    RowID,
    Code          容器代码,
    CName         容器名称,
    Volumn        容量,
    Color         管帽颜色,
    Remark        条码打印缩写,
    HospitalCode  医院代码,
    HospitalName  医院名称
FROM dbo.V_BT_Container
WHERE HospitalDR = 19;
```

---

## 06-检验项目

```sql
SELECT
    t.RowID,
    t.Code          代码,
    t.CName         名称,
    t.Synonym       缩写,
    t.Units         单位,
    t.Precision     精确度,
    t.ResultFormat  数据格式,
    r.SpeciesDR     性别,
    r.AgeLow        年龄低,
    r.AgeHigh       年龄高,
    r.ValueLow      低值,
    r.ValueHigh     高值,
    t.RefRanges     显示参考范围,
    p.ValueLow      危急低值,
    p.ValueHigh     危急高值,
    c.Code          结果代码,
    c.CName         结果名称,
    c.AbFlag        显示标记异常,
    t.Scode         标准码
FROM dbo.BT_TestCode t
LEFT OUTER JOIN dbo.BT_TestCodeRanges r    ON r.TestCodeDR = t.RowID
LEFT OUTER JOIN dbo.BT_TestCodePanic p     ON p.TestCodeDR = t.RowID
LEFT OUTER JOIN dbo.BT_TestCodeComments c  ON c.TestCodeDR = t.RowID
WHERE t.HospitalDR = 19;
```

### 检测范围

```sql
SELECT
    r.*,
    t.RowID  AS TestCode_RowID,
    t.Code   AS TestCode_Code,
    t.CName  AS TestCode_CName
FROM DBO.BT_TestCodeRanges AS r
INNER JOIN DBO.BT_TestCode AS t ON r.TestCodeDR = t.RowID
WHERE t.HospitalDR = 19;

SELECT r.*
FROM DBO.BT_TestCodeRanges AS r
WHERE EXISTS (
    SELECT 1 FROM DBO.BT_TestCode AS t
    WHERE t.RowID = r.TestCodeDR AND t.HospitalDR = 19
);
```

### 危急范围

```sql
SELECT r.*
FROM DBO.BT_TestCodePanic AS r
WHERE EXISTS (
    SELECT 1 FROM DBO.BT_TestCode AS t
    WHERE t.RowID = r.TestCodeDR AND t.HospitalDR = 19
);
```

### 项目标准备注

```sql
SELECT r.*
FROM DBO.BT_TestCodeComments AS r
WHERE EXISTS (
    SELECT 1 FROM DBO.BT_TestCode AS t
    WHERE t.RowID = r.TestCodeDR AND t.HospitalDR = 19
);
```

---

## 07-检验医嘱（不含项目）

```sql
SELECT
    t.RowID,
    t.Code                       AS 代码,
    t.CName                      AS 医嘱名称,
    t.WorkGroupMachineCode       AS 工作小组代码,
    m.CName                      AS 工作小组名称,
    t.SpecimenCode               AS 标本代码,
    s.IName                      AS 标本名称,
    t.ContainerCode              AS 容器代码,
    c.CName                      AS 容器名称,
    t.HospitalCode               AS 医院代码,
    t.HospitalName               AS 医院名称
FROM dbo.V_BT_TestSet AS t
LEFT JOIN dbo.V_BT_WorkGroupMachine AS m ON m.RowID = t.WorkGroupMachineDR
LEFT JOIN dbo.V_BT_Specimen AS s         ON s.RowID = t.SpecimenDR
LEFT JOIN dbo.V_BT_Container AS c        ON c.RowID = t.ContainerDR
WHERE t.HospitalDR = 19;
```

## 07-检验医嘱（含项目）

```sql
SELECT
    t.RowID,
    t.Code                       AS 代码,
    t.CName                      AS 医嘱名称,
    t.WorkGroupMachineCode       AS 工作小组代码,
    m.CName                      AS 工作小组名称,
    l.TestCodeCode               AS 项目代码,
    l.TestCodeName               AS 项目名称,
    t.SpecimenCode               AS 标本代码,
    s.IName                      AS 标本名称,
    t.ContainerCode              AS 容器代码,
    c.CName                      AS 容器名称,
    t.HospitalCode               AS 医院代码,
    t.HospitalName               AS 医院名称
FROM dbo.V_BT_TestSet AS t
LEFT JOIN dbo.V_BT_TestSetLayout AS l    ON l.TestSetDR = t.RowID
LEFT JOIN dbo.V_BT_WorkGroupMachine AS m ON m.RowID = t.WorkGroupMachineDR
LEFT JOIN dbo.V_BT_Specimen AS s         ON s.RowID = t.SpecimenDR
LEFT JOIN dbo.V_BT_Container AS c        ON c.RowID = t.ContainerDR
WHERE t.HospitalDR = 19;
```

---

## 09-医嘱多标本

```sql
SELECT
    t.RowID,
    t.Code            AS 医嘱代码,
    t.CName           AS 医嘱名称,
    s.SpecimenCode    AS 标本代码,
    s.SpecimenIName   AS 标本名称,
    s.ContainerCode   AS 容器代码,
    s.ContainerName   AS 容器名称,
    s.MergeType       AS 条码数量,
    s.IsDefault       AS 是否默认,
    s.Sequence        AS 序号,
    t.HospitalCode    AS 医院代码,
    t.HospitalName    AS 医院名称
FROM dbo.V_BT_TestSet t
LEFT JOIN dbo.V_BT_TestSetSpecimen s ON s.TestSetDR = t.RowID
WHERE HospitalDR = 19;
```

---

## 10-医嘱外部代码（HIS 库，IRIS 箭头语法）

```sql
SELECT
    EXT_ParRef->ARCIM_Code  医嘱代码,
    EXT_ParRef->ARCIM_Desc  医嘱名称,
    EXT_Code                检验代码,
    EXT_Desc                检验名称,
    EXT_DateTo              截止日期
FROM ARC_ItemExternalCodes
WHERE EXT_ParRef IN (
    SELECT HOSP_ParRef FROM ARC_ItemHosp WHERE HOSP_Hospital_DR = 95
);
```

### 9.0 医嘱项目（用于筛选）

```sql
SELECT
    t.Code   AS 医嘱代码,
    t.CName  AS 医嘱名称
FROM dbo.V_BT_TestSet AS t
WHERE t.HospitalDR = 19;
```

---

## 通道号

```sql
SELECT * FROM dbo.BTMI_MachineTestCode WHERE MachineParameterDR = 219

SELECT * FROM dbo.BTMI_MachineParameter WHERE Code = 'M1000'
```

---

## 分管维护

```sql
SELECT
    bg.RowID,
    bg.Code,
    bg.CName,
    bt.Code,
    bt.CName,
    bw.CName
FROM dbo.BT_TestSetGroup bg
LEFT JOIN dbo.BT_TestSetGroupLinks bl ON bl.TestSetGroupDR = bg.RowID
LEFT JOIN dbo.BT_TestSet bt ON bl.TestSetDR = bt.RowID
LEFT JOIN dbo.BT_WorkGroupMachine bw ON bt.WorkGroupMachineDR = bw.RowID
```
