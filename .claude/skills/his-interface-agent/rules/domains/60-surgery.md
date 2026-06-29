---
domain: "60-surgery"
name: "手术及麻醉操作域(cIS/ENS组)"
version: "2.2.0"
description: "基于CIS.aN.OperSchedule(106属性)+Anaesthesia(53属性)+OperationList(18属性). Global=^CIS.AN.OperScheduleD($lg格式). 25条规则. 支持按日期范围遍历."

# 数据源遍历配置（供代码生成器使用）
traversal:
  type: "aNOPER"
  viewMatchers: ["sur_", "oper_", "anesthesia", "ss_", "手术"]
  inputParam:
    name: "pDateFrom"
    type: "%String"
    description: "开始日期"
  preVariables:
    - name: "patDR"
      expression: "$p($g(^PAADM(admRowId)),\"^\",1)"
      description: "患者DR"
  # 按日期范围遍历模式
  modes:
    dateRange:
      viewMatchers: ["手术记录", "手术信息", "SurgeryRecord", "SSJL", "SSXX", "DBZ_SSJL", "DBZ_SSXX"]
      description: "按手术日期范围遍历（批量导出）"
      index:
        global: "^CIS.AN.OperScheduleI"
        name: "OperDate"
        keys: ["date", "opsId"]
        expression: '$o(^CIS.AN.OperScheduleI("OperDate",date,opsId))'
      template: |
        f date=pDateFrom:1:pDateTo d
        .s opsId=""
        .f  s opsId=$o(^CIS.AN.OperScheduleI("OperDate",date,opsId)) q:opsId=""  d
        ..s data=$g(^CIS.AN.OperScheduleD(opsId))
        ..i (data="") q
        ..s admRowId=$lg(data,2)
        ..i admRowId="" q
        ..s admData=$g(^PAADM(admRowId))
        ..i admData="" q
        ..s patDR=$p(admData,"^",1)
    admSingle:
      viewMatchers: ["手术详情", "单个手术"]
      description: "按就诊ID遍历（单条查询）"
      index:
        global: "^CIS.AN.OperScheduleI"
        name: "Adm"
        keys: ["admRowId", "opsId"]
        expression: '$o(^CIS.AN.OperScheduleI("Adm"," "_admRowId,opsId))'
      template: |
        s opsId=""
        f  s opsId=$o(^CIS.AN.OperScheduleI("Adm"," "_admRowId,opsId)) q:opsId=""  d
        .s data=$g(^CIS.AN.OperScheduleD(opsId))
        .i (data="") q
  # 默认配置（按就诊ID遍历，兼容旧逻辑）
  index:
    global: "^CIS.AN.OperScheduleI"
    name: "Adm"
    keys: ["admRowId", "opsId"]
    expression: '$o(^CIS.AN.OperScheduleI("Adm"," "_admRowId,opsId))'
  data:
    global: "^CIS.AN.OperScheduleD"
    variable: "data"
    format: "lg"
    expression: "$g(^CIS.AN.OperScheduleD(opsId))"
  template: |
    s opsId=""
    f  s opsId=$o(^CIS.AN.OperScheduleI("Adm"," "_admRowId,opsId)) q:opsId=""  d
    .s data=$g(^CIS.AN.OperScheduleD(opsId))
    .i (data="") q

sourceClass:
  - name: "CIS.AN.OperSchedule"
    description: "手术申请主表. SqlTableName=OperSchedule. Global=^CIS.AN.OperScheduleD. $lg()格式. 106属性."
    sqlTableName: "OperSchedule"
    global: "^CIS.AN.OperScheduleD"

  - name: "CIS.AN.Anaesthesia"
    description: "麻醉记录表. Global=^CIS.AN.AnaesthesiaD. $lg()格式. 53属性."
    sqlTableName: "Anaesthesia"
    global: "^CIS.AN.AnaesthesiaD"

  - name: "CIS.AN.OperationList"
    description: "手术操作列表. Global=^CIS.AN.OperationListD. $lg()格式. 18属性."
    sqlTableName: "OperationList"
    global: "^CIS.AN.OperationListD"

entityGlobals:
  - global: "^CIS.AN.OperScheduleD(opsId)"
    description: "手术申请数据"
    structure: "$lg(data,N)格式. lg2=EpisodeID/lg4=AppDeptID/lg5=OperDeptID/lg10=Status/lg13=AppDate/lg15=OperDate/lg16=OperTime/lg18=AppCareProvID/lg19=SourceType/lg20=Anaesthesia"

  - global: "^CIS.AN.AnaesthesiaD(anaId)"
    description: "麻醉数据"
    structure: "$lg(data,N)格式. lg2=OperSchedule(fK)/lg3=AnaMethod/lg5=Anesthesiologist/lg16=OperStartDT/lg17=OperFinishDT"

  - global: "^CIS.AN.OperationListD(opListId)"
    description: "手术操作列表"
    structure: "$lg(data,N)格式. lg2=OperCatalogue/lg3=Operation(fK->orcOper)/lg5=BladeType/lg8=Surgeon/lg9=Assistant"

totalRules: 25
lastUpdated: "2026-05-12"
---

# 手术及麻醉操作域 (60-surgery) 取值规则 v2.0

> cIS.AN新版架构 | $lg() List格式 | 106+53+18属性

## 架构总览

```
^CIS.AN.OperScheduleI("Adm"," "_admId, opsId)  -> 遍历入口
    |
    v
^CIS.AN.OperScheduleD(opsId)  -> $lg() 主表(106属性)
    |
    +-- ^CIS.AN.AnaesthesiaI(opsId,anaId) -> 麻醉子表(53属性)
    |       +-- ^CIS.AN.AnaesthesiaD(anaId)
    |
    +-- ^CIS.AN.OperationListI(opsId,opListId) -> 手术操作列表(18属性)
            +-- ^CIS.AN.OperationListD(opListId)
```

## 规则列表

#### OPER_NO

| 属性 | 值 |
|------|-----|
| 标准名 | `operNo` |
| 匹配模式 | operNo, oper_no, 手术申请单号 |
| 取值表达式 | `opsId` |
| Global | `^CIS.AN` |
| 置信度 | 0.95 |

**说明**：手术申请单号(=OperSchedule.RowId)

```objectscript
s oper_no = opsId
```

#### OPERATE_DEPT_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `operateDeptCode` |
| 匹配模式 | operateDeptCode, operate_dept_code, 手术操作科室编码 |
| 取值表达式 | `$p($g(^CTLOC($lg(^CIS.AN.OperScheduleD(opsId),5))),"^",1)` |
| Global | `^CIS.AN->^CTLOC` |
| 置信度 | 0.95 |

**说明**：OperDeptID(lg5)->CTLOC^1

```objectscript
s operate_dept_code = $p($g(^CTLOC($lg(^CIS.AN.OperScheduleD(opsId),5))),"^",1)
```

#### OPERATE_DEPT_NAME

| 属性 | 值 |
|------|-----|
| 标准名 | `operateDeptName` |
| 匹配模式 | operateDeptName, operate_dept_name, 手术操作科室名称 |
| 取值表达式 | `$p($g(^CTLOC($lg(^CIS.AN.OperScheduleD(opsId),5))),"^",2)` |
| Global | `^CIS.AN->^CTLOC` |
| 置信度 | 0.95 |

**说明**：OperDeptID(lg5)->CTLOC^2

```objectscript
s operate_dept_name = $p($g(^CTLOC($lg(^CIS.AN.OperScheduleD(opsId),5))),"^",2)
```

#### OP_START_TIME

| 属性 | 值 |
|------|-----|
| 标准名 | `opStartTime` |
| 匹配模式 | opStartTime, op_start_time, 手术开始时间 |
| 取值表达式 | `$zd($lg(^CIS.AN.OperScheduleD(opsId),15),3)_" "_$zt($lg(^CIS.AN.OperScheduleD(opsId),16),1)` |
| Global | `^CIS.AN` |
| 置信度 | 0.95 |

**说明**：OperDate(lg15)+OperTime(lg16)

```objectscript
s op_start_time = $zd($lg(^CIS.AN.OperScheduleD(opsId),15),3)_" "_$zt($lg(^CIS.AN.OperScheduleD(opsId),16),1)
```

#### OP_END_TIME

| 属性 | 值 |
|------|-----|
| 标准名 | `opEndTime` |
| 匹配模式 | opEndTime, op_end_time, 手术结束时间 |
| 取值表达式 | `$zd($lg(anaData,16),3)_" "_$zt($lg(anaData,16),1)` |
| Global | `^CIS.AN.Anaesthesia` |
| 置信度 | 0.95 |

**说明**：OperFinishDT(lg16)

```objectscript
s op_end_time = $zd($lg(anaData,16),3)_" "_$zt($lg(anaData,16),1)
```

#### LOCAL_PROCEDURE_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `localProcedureCode` |
| 匹配模式 | localProcedureCode, local_procedure_code, 机构内部手术编码 |
| 取值表达式 | `$p($g(^ORC("oPER",$lg(opListData,3))),"^",1)` |
| Global | `^CIS.AN.OperationList->^ORC("oPER")` |
| 置信度 | 0.95 |

**说明**：Operation(lg3)->ORC^1

```objectscript
s local_procedure_code = $p($g(^ORC("oPER",$lg(opListData,3))),"^",1)
```

#### LOCAL_PROCEDURE_NAME

| 属性 | 值 |
|------|-----|
| 标准名 | `localProcedureName` |
| 匹配模式 | localProcedureName, local_procedure_name, 机构内部手术名称 |
| 取值表达式 | `$p($g(^ORC("oPER",$lg(opListData,3))),"^",2)` |
| Global | `^CIS.AN.OperationList->^ORC("oPER")` |
| 置信度 | 0.95 |

**说明**：Operation(lg3)->ORC^2

```objectscript
s local_procedure_name = $p($g(^ORC("oPER",$lg(opListData,3))),"^",2)
```

#### PROCEDURE_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `procedureCode` |
| 匹配模式 | procedureCode, procedure_code, 手术及操作编码 |
| 取值表达式 | `$p($g(^ORC("oPER",$lg(opListData,3))),"^",21)` |
| Global | `^CIS.AN.OperationList->^ORC("oPER")` |
| 置信度 | 0.95 |

**说明**：Operation(lg3)->ORC^21(ICD编码)

```objectscript
s procedure_code = $p($g(^ORC("oPER",$lg(opListData,3))),"^",21)
```

#### PROCEDURE_NAME

| 属性 | 值 |
|------|-----|
| 标准名 | `procedureName` |
| 匹配模式 | procedureName, procedure_name, 手术及操作名称 |
| 取值表达式 | `$p($g(^ORC("oPER",$lg(opListData,3))),"^",2)` |
| Global | `^CIS.AN.OperationList->^ORC("oPER")` |
| 置信度 | 0.95 |

**说明**：Operation(lg3)->ORC^2

```objectscript
s procedure_name = $p($g(^ORC("oPER",$lg(opListData,3))),"^",2)
```

#### NHS_PROCEDURE_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `nhsProcedureCode` |
| 匹配模式 | nhsProcedureCode, nhs_procedure_code, 国家医保手术编码 |
| 取值表达式 | `##class(web.DHCENS.bLL.GDSmartHealth.UtilMethod).GetOperConInfo(localProcedureCode)` |
| Global | `^CIS.AN->编码转换` |
| 置信度 | 0.95 |

**说明**：需编码转换

```objectscript
s nhs_procedure_code = ##class(web.DHCENS.bLL.GDSmartHealth.UtilMethod).GetOperConInfo(localProcedureCode)
```

#### NHS_PROCEDURE_NAME

| 属性 | 值 |
|------|-----|
| 标准名 | `nhsProcedureName` |
| 匹配模式 | nhsProcedureName, nhs_procedure_name, 国家医保手术名称 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需编码转换

```objectscript
s nhs_procedure_name = ""  ; tODO: 待补充
```

#### OPERATE_TYPE

| 属性 | 值 |
|------|-----|
| 标准名 | `operateType` |
| 匹配模式 | operateType, operate_type, 手术类型 |
| 取值表达式 | `$lg(^CIS.AN.OperScheduleD(opsId),19)` |
| Global | `^CIS.AN` |
| 置信度 | 0.95 |

**说明**：SourceType(lg19): B=择期/E=急诊/D=日间

```objectscript
s operate_type = $lg(^CIS.AN.OperScheduleD(opsId),19)
```

#### SURGICAL_CLASS

| 属性 | 值 |
|------|-----|
| 标准名 | `surgicalClass` |
| 匹配模式 | surgicalClass, surgical_class, 手术切口等级 |
| 取值表达式 | `$lg(opListData,5)` |
| Global | `^CIS.AN.OperationList` |
| 置信度 | 0.95 |

**说明**：BladeType(lg5)

```objectscript
s surgical_class = $lg(opListData,5)
```

#### SURGICAL_HEALTH_CLASS

| 属性 | 值 |
|------|-----|
| 标准名 | `surgicalHealthClass` |
| 匹配模式 | surgicalHealthClass, surgical_health_class, 手术愈合等级 |
| 取值表达式 | （待补充） |
| Global | `` |
| 置信度 | 0.95 |

**说明**：需从其他表获取

```objectscript
s surgical_health_class = ""  ; tODO: 待补充
```

#### IS_MAIN_PROCEDURE

| 属性 | 值 |
|------|-----|
| 标准名 | `isMainProcedure` |
| 匹配模式 | isMainProcedure, is_main_procedure, 是否主要手术 |
| 取值表达式 | `$s($lg(opListData,2)="S":"1",1:"2")` |
| Global | `^CIS.AN.OperationList` |
| 置信度 | 0.95 |

**说明**：OperCatalogue(lg2): S=主手术

```objectscript
s is_main_procedure = $s($lg(opListData,2)="S":"1",1:"2")
```

#### ANESTHESIA

| 属性 | 值 |
|------|-----|
| 标准名 | `aNESTHESIA` |
| 匹配模式 | aNESTHESIA, anesthesia, 是否麻醉 |
| 取值表达式 | `$lg(^CIS.AN.OperScheduleD(opsId),20)` |
| Global | `^CIS.AN` |
| 置信度 | 0.95 |

**说明**：Anaesthesia(lg20): Y=是/N=否

```objectscript
s anesthesia = $lg(^CIS.AN.OperScheduleD(opsId),20)
```

#### ANESTH_METHOD_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `anesthMethodCode` |
| 匹配模式 | anesthMethodCode, anesth_method_code, 麻醉方式编码 |
| 取值表达式 | `$p($g(^ORC("ANMET",$lg(anaData,3))),"^",1)` |
| Global | `^CIS.AN.Anaesthesia->^ORC("ANMET")` |
| 置信度 | 0.95 |

**说明**：AnaMethod(lg3)->ORC^1

```objectscript
s anesth_method_code = $p($g(^ORC("ANMET",$lg(anaData,3))),"^",1)
```

#### ANESTH_METHOD_NAME

| 属性 | 值 |
|------|-----|
| 标准名 | `anesthMethodName` |
| 匹配模式 | anesthMethodName, anesth_method_name, 麻醉方式名称 |
| 取值表达式 | `$p($g(^ORC("ANMET",$lg(anaData,3))),"^",2)` |
| Global | `^CIS.AN.Anaesthesia->^ORC("ANMET")` |
| 置信度 | 0.95 |

**说明**：AnaMethod(lg3)->ORC^2

```objectscript
s anesth_method_name = $p($g(^ORC("ANMET",$lg(anaData,3))),"^",2)
```

#### ANESTH_DOC_NAME

| 属性 | 值 |
|------|-----|
| 标准名 | `anesthDocName` |
| 匹配模式 | anesthDocName, anesth_doc_name, 麻醉医师姓名 |
| 取值表达式 | `$p($g(^CTPCP($lg(anaData,5),1)),"^",2)` |
| Global | `^CIS.AN.Anaesthesia->^CTPCP` |
| 置信度 | 0.95 |

**说明**：Anesthesiologist(lg5)->CTPCP^2

```objectscript
s anesth_doc_name = $p($g(^CTPCP($lg(anaData,5),1)),"^",2)
```

#### ANESTH_DOC_CERTIFICATE_NO

| 属性 | 值 |
|------|-----|
| 标准名 | `anesthDocCertificateNo` |
| 匹配模式 | anesthDocCertificateNo, anesth_doc_certificate_no, 麻醉医师执业证书编号 |
| 取值表达式 | `$p($g(^CTPCP($lg(anaData,5),3)),"^",11)` |
| Global | `^CIS.AN.Anaesthesia->^CTPCP` |
| 置信度 | 0.95 |

**说明**：Anesthesiologist(lg5)->CTPCP^3:11

```objectscript
s anesth_doc_certificate_no = $p($g(^CTPCP($lg(anaData,5),3)),"^",11)
```

#### OPER_DOC_NAME

| 属性 | 值 |
|------|-----|
| 标准名 | `operDocName` |
| 匹配模式 | operDocName, oper_doc_name, 术者姓名 |
| 取值表达式 | `$p($g(^CTPCP($lg(^CIS.AN.OperScheduleD(opsId),18),1)),"^",2)` |
| Global | `^CIS.AN->^CTPCP` |
| 置信度 | 0.95 |

**说明**：AppCareProvID(lg18)->CTPCP^2

```objectscript
s oper_doc_name = $p($g(^CTPCP($lg(^CIS.AN.OperScheduleD(opsId),18),1)),"^",2)
```

#### OPER_CERTIFICATE_NO

| 属性 | 值 |
|------|-----|
| 标准名 | `operCertificateNo` |
| 匹配模式 | operCertificateNo, oper_certificate_no, 术者执业证书编号 |
| 取值表达式 | `$p($g(^CTPCP($lg(^CIS.AN.OperScheduleD(opsId),18),3)),"^",11)` |
| Global | `^CIS.AN->^CTPCP` |
| 置信度 | 0.95 |

**说明**：AppCareProvID(lg18)->CTPCP^3:11

```objectscript
s oper_certificate_no = $p($g(^CTPCP($lg(^CIS.AN.OperScheduleD(opsId),18),3)),"^",11)
```

#### FIRST_ASSIST_NAME

| 属性 | 值 |
|------|-----|
| 标准名 | `firstAssistName` |
| 匹配模式 | firstAssistName, first_assist_name, 一助医生姓名 |
| 取值表达式 | `$p($g(^CTPCP($lg(opListData,9),1)),"^",2)` |
| Global | `^CIS.AN.OperationList->^CTPCP` |
| 置信度 | 0.95 |

**说明**：Assistant(lg9)->CTPCP^2

```objectscript
s first_assist_name = $p($g(^CTPCP($lg(opListData,9),1)),"^",2)
```

#### FIRST_ASSIST_CERTIFICATE_NO

| 属性 | 值 |
|------|-----|
| 标准名 | `firstAssistCertificateNo` |
| 匹配模式 | firstAssistCertificateNo, first_assist_certificate_no, 一助执业证书编号 |
| 取值表达式 | `$p($g(^CTPCP($lg(opListData,9),3)),"^",11)` |
| Global | `^CIS.AN.OperationList->^CTPCP` |
| 置信度 | 0.95 |

**说明**：Assistant(lg9)->CTPCP^3:11

```objectscript
s first_assist_certificate_no = $p($g(^CTPCP($lg(opListData,9),3)),"^",11)
```

#### REPORT_DATETIME

| 属性 | 值 |
|------|-----|
| 标准名 | `reportDatetime` |
| 匹配模式 | reportDatetime, report_datetime, 数据上报时间 |
| 取值表达式 | `$zdt($h,3,1)` |
| Global | `` |
| 置信度 | 0.95 |

**说明**：当前系统时间

```objectscript
s report_datetime = $zdt($h,3,1)
```
