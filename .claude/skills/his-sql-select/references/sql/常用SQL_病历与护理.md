# 常用 SQL 速查 — 病历与护理

> 来源：`常用SQL.txt`。本文档为格式整理版，SQL 语句保持原样（包括原文中可能存在的笔误），仅补齐标点与小标题。

## 目录

1. [电子病历](#电子病历)
2. [护理病历](#护理病历)
3. [会诊](#会诊)
4. [体温单](#体温单)

---

## 电子病历

### 电子病历指向模板

```sql
SELECT * FROM emrinstance.ecrecord WHERE EpisodeID='38014'
SELECT * FROM emrinstance.instancedata WHERE EpisodeID='38014'
SELECT * FROM EMRmeta.EMRTemplate WHERE ID=428
SELECT * FROM EMRmeta.EMRTemplateCategory WHERE ID='756'
```

### 电子病历 ID 查找导入导出

```sql
SELECT * FROM emrinstance.instancedata WHERE EpisodeID='45100'
```

- 病历导出：`w ##Class(EMRservice.Tools.DaiworkTool).GetDocument("18737||1")`
- 病历导入：`w ##Class(EMRservice.Tools.DaiworkTool).SaveDocument("18735||2")`
- 存储位置：`165\D\dhcc\out(in)`

---

## 护理病历

### 护理病历填写记录

- `EmrCode`：护理病历的文档属性中查看
- `c7e9a81d40c04d598d60c24818f21121`：护理记录通用

```sql
SELECT * FROM NurMp.DHCTempMultData WHERE EmrCode='c7e9a81d40c04d598d60c24818f21121' AND EpisodeId='120794'
```

（就诊号）

### 护理病历模板全部重新发布

```sql
update nurmp.config set UpgradeStatus=1
```

---

## 会诊

### 修改会诊申请时间和完成时间

查会诊主表：

```sql
SELECT * FROM DHC_EmConsult WHERE EC_Adm_Dr = "10099"
```

通过主表查子表，再在子表改会诊申请时间：

```sql
SELECT * FROM DHC_EmConsultitm WHERE EC_ParRef_Dr = "511"
```

修改会诊完成时间：

```sql
SELECT * FROM DHC_EmConsultlog WHERE ECL_Cst_Ref = '511||1'
```

### 修改会诊申请状态值

```
W ##Class(web.DHCEMConsult).InsCsItemStat("2827||1","14904","11")
```

---

## 体温单

### 修改体温单上的过敏药物时间

```sql
SELECT * FROM PA_PatMas WHERE PAPMI_No = "0000700360"
SELECT ALG_Comments,* FROM PA_Allergy WHERE ALG_PAPMI_ParRef = "370398"
```

### 体征项

- `MRC_ObservationItem`：体征项目表
- `MR_Observations`：体征数据表
- 添加空白栏的时候可以复制特殊值

```sql
SELECT * FROM MRC_ObservationItem
```

查询患者体征项数据：

```sql
SELECT * FROM MR_Observations WHERE OBS_ParRef=""
```

### 患者事件

修改患者事件表：

```sql
SELECT * FROM DHC_ADMQTREC WHERE QTREC_ADM_DR="5506"
```

（就诊号）

体温单事件：（这是查询啥不知道）

```sql
SELECT * FROM CT_CareProv WHERE CTPCP_RowId1 =49
SELECT * FROM SS_User WHERE SSUSR_RowId =49
```
