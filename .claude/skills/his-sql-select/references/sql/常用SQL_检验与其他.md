# 常用 SQL 速查 — 检验与其他

> 来源：`常用SQL.txt`。本文档为格式整理版，SQL 语句保持原样（包括原文中可能存在的笔误），仅补齐标点与小标题。

## 目录

1. [体检](#体检)
2. [检验](#检验)
3. [用户密码查询](#用户密码查询)
4. [其他](#其他)

---

## 体检

### 体检站点信息查询

```sql
SELECT * FROM DHC_PE_Station
```

---

## 检验

### 检验输血权限

- `PositionTitleDR`：1 普通医师 / 2 主治医生 / 3 副主任 / 4 主任

```sql
SELECT PositionTitleDR,* FROM dbo.sys_user WHERE Code="0470"
SELECT PositionTitleDR,* FROM dbo.sys_user   -- 29 临床护士
```

### 血型查询

```sql
SELECT * FROM SQLUser.PAC_BloodType
INSERT INTO SQLUser.PAC_BloodType (BLDT_Code,BLDT_Desc) VALUES("HYZ","化验中")
```

### 检验结果查询

```sql
SELECT * FROM dbo.RP_VisitNumberReportResult WHERE VisitNumberReportDR="39347"
SELECT * FROM dbo.RP_VisitNumberReport WHERE RowID="39347"
SELECT * FROM dbo.BT_TestCode WHERE RowID>261 AND RowID<278 OR RowID="244"
```

---

## 用户密码查询

### 高县

```
d ##class(%ResultSet).RunQuery("web.QueryGetPassWord","QueryUserPassWordInfo","1184","")
```

### 蓬安

```
d ##class(%ResultSet).RunQuery("web.test5","Find","demo")
```

### 眉山妇幼

```
d ##class(%ResultSet).RunQuery("web.GetUserPassWord","Find","4065")
```

---

## 其他

### 病案归档信息

```sql
SELECT * FROM DHCWMR_SS.Volume WHERE SVMainDr->S
```

### 报表日期

```sql
SELECT WorkLoad_FlagDate,* FROM DHC_WorkLoad WHERE WorkLoad_PAADM_DR=59188
```

### 手术申请表

```sql
SELECT * FROM DHC_AN_OPArrange WHERE OPA_RowId = "652"
```

### 手术麻醉链
```sql
-- DHC_AN_OPArrange(手术安排) → OR_Anaest_Operation(所行手术) → OR_An_Oper_Assistant(助手) / OR_Anaesthesia(麻醉)
SELECT * FROM OR_Anaest_Operation WHERE ...
SELECT * FROM OR_An_Oper_Assistant WHERE ...
SELECT * FROM OR_Anaesthesia WHERE ...
```
