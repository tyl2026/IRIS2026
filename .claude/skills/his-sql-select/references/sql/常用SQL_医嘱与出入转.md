# 常用 SQL 速查 — 医嘱与出入转

> 来源：`常用SQL.txt`。本文档为格式整理版，SQL 语句保持原样（包括原文中可能存在的笔误），仅补齐标点与小标题。

## 目录

1. [医嘱表相关](#医嘱表相关)
2. [出入转](#出入转)
3. [床位相关](#床位相关)

---

## 医嘱表相关

### 皮试

```sql
SELECT OEORI_Abnormal,* FROM OE_OrdItem WHERE OEORI_RowId ='10852||55'
```

### 改医嘱用法

```sql
SELECT OEORI_Instr_DR,* FROM OE_OrdItem  WHERE OEORI_RowId='56||586'
```

（29 为"皮试"）

### 医嘱时间

```sql
SELECT * FROM OE_OrdItem WHERE OEORI_RowId="71148||102"
```

### 医嘱要求执行时间

```sql
SELECT * FROM OE_OrdExec WHERE OEORE_OEORI_ParRef = "78549||88"
```

### 修改医嘱状态

- `OEORI_ItemStat_DR`：1 核实，2 作废，4 停止，6 执行；`oeori_billed`：TB/B（门诊）；`oeore_billed`：TB/B（住院）；父子链：`OE_Order`→`OE_OrdItem`→`OE_OrdExec`

```sql
SELECT OEORI_ItemStat_DR,* FROM OE_OrdItem WHERE OEORI_RowId = '10852||55'
```

### 医嘱拓展表（处理状态）

```sql
SELECT OEORI_SeeType,* FROM OE_OrdItemExt WHERE OEORI_RowId = "94979||23"
```

### 修改开医嘱时间

```sql
SELECT OEORI_TimeOrd,* FROM OE_OrdItem WHERE OEORI_RowId="5485||125"
```

### 医嘱执行记录

修改执行记录状态：

```sql
SELECT OEORE_Order_Status_DR,* FROM OE_OrdExec WHERE OEORE_OEORI_ParRef ="103925||82"
```

- `1`：已执行
- `2`：停止执行
- `null`：未执行；置空未处理

修改执行记录时间：

```sql
SELECT OEORE_DateExecuted,OEORE_TimeExecuted,* FROM OE_OrdExec WHERE OEORE_OEORI_ParRef ="103925||82"
```

```sql
SELECT * FROM OE_OrdItemExt WHERE OEORI_RowId = "44959||19"
```

### 医嘱条码打印标记

```sql
SELECT OEORE_Printed,* FROM OE_OrdExecExt WHERE OEORE_OEORI_ParRef ="136383||398"
```

### 医嘱打包表

```sql
SELECT * FROM DHC_OEDispensing WHERE DSP_OEORI_DR = "11332||26"
```

### 医嘱执行时间

```sql
SELECT * FROM OE_OrdExec WHERE OEORE_OEORI_ParRef = "50405||59"
```

### 医嘱单执行人签名

```sql
SELECT * FROM  OE_OrdExecStatus WHERE STCH_ParRef ='4801||27||1'
```

### 用户与项目辅助查询

> 原文档中此区块无小标题，按"允许补齐小标题"补充。

```sql
SELECT * FROM SS_User WHERE SSUSR_Initials =2010
SELECT * FROM ARC_ItmMast WHERE ARCIM_RowId ='18748||23'
SELECT * FROM CT_CareProv  WHERE CTPCP_RowId1 =600
SELECT * FROM CT_CareProv  WHERE CTPCP_Code =2010
```

---

## 出入转

### 入院时间

```sql
SELECT * FROM PA_AdmExt WHERE PAADM_RowId = '14096'
```

（`PAADM_AdmDate`；`PA_Adm`：`paadm_type` = O 门诊 / I 住院；`paadm_visitstatus` = A 正常 / C 取消 / D 出院）

### 出院时间

```sql
SELECT PAADM_DischgDate,PAADM_DischgTime,PAADM_EstimDischargeDate,PAADM_EstimDischargeTime,* FROM PA_Adm WHERE PAADM_RowID = "63459"
```

```sql
SELECT PAADM_DischargeDate,PAADM_DischargeTime,* FROM pa_admext WHERE PAADM_RowId = "63459"
```

### 转科表

```sql
SELECT * FROM PA_AdmTransaction WHERE TRANS_ParRef = "30681"
```

### 住院证查询

```sql
SELECT * FROM DHCDocIPBooking WHERE CreateUserID = '11950'
SELECT * FROM SS_User
```

---

## 床位相关

### 床号查询

```sql
SELECT * FROM PA_AdmTransaction WHERE TRANS_ParRef = '7991'
```

### 分床与入科

```sql
SELECT * FROM PA_AdmTransaction WHERE TRANS_ParRef = "1318"
SELECT * FROM PA_Adm WHERE PAADM_RowID = "1318"
```

### 清除床位占用

```sql
SELECT * FROM PAC_Room WHERE ROOM_Code = "儿科2"
SELECT * FROM PAC_Bed WHERE BED_Room_DR ="21"
```

```
w ##class(Nur.NIS.Service.Base.OrderHandle).judBedExistPat("8||4")
w ##class(Nur.NIS.Service.Base.Bed).IfBedAvailable("8||4")
```

### 修改管床医生

根据工号查询管床医生：

```sql
SELECT SSUSR_CareProv_DR, * FROM SS_User WHERE SSUSR_Initials="0266"
```

修改病人的管床医生：

```sql
SELECT PAADM_AdmDocCodeDR,* FROM  PA_Adm WHERE PAADM_RowID ="2603842"
```
