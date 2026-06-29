# ObjectScript 后端编码规范

> 生成 ObjectScript 接口代码时必须遵循的规范。整合自 his-interface-agent 与 doc-Agent，以 doc-Agent 为准裁决冲突。

---

## 一、命名规范

### 1.1 类名 — UpperCamelCase（大驼峰）

```objectscript
// ✅ 正确
Class web.DHCENS.BLL.SmartWard.IP.PatientInfo Extends %RegisteredObject
Class GetPatientInfo Extends %RegisteredObject

// ❌ 错误
Class web.DHCENS.BLL.SmartWard.IP.patient_info Extends %RegisteredObject
Class get_patient_info Extends %RegisteredObject
```

### 1.2 方法名 — lowerCamelCase（小驼峰）

```objectscript
// ✅ 正确
ClassMethod getPatientInfo() As %Status
ClassMethod buildResponse() As %String

// ❌ 错误
ClassMethod GetPatientInfo() As %Status    ; 大驼峰已废弃
ClassMethod get_patient_info() As %Status  ; 禁止下划线
```

**Query 方法命名**：Query 框架方法跟随 Query 名，用小驼峰：
```objectscript
Query getBG0003(...) As %Query(ROWSPEC = "...") [ SqlProc ] { }

ClassMethod getBG0003Execute(...) As %Status
ClassMethod getBG0003Close(...) As %Status
ClassMethod getBG0003Fetch(...) As %Status
```

### 1.3 属性名 — UpperCamelCase（大驼峰）

```objectscript
// ✅ 正确
Property HospName As %String;
Property StartDate As %Date;

// ❌ 错误
Property hosp_name As %String;
```

### 1.4 变量名 — lowerCamelCase（小驼峰），禁止下划线

```objectscript
// ✅ 正确
s patientName=$p($g(^PAPER(patDR,"ALL")),"^",1)
s regNo=$p($g(^PAPER(patDR,"PAT",1)),"^",1)
s sexCode=$p($g(^CT("SEX",sexRowID)),"^",1)
s tPatDR=patDR
s admRowId=adm

// ❌ 错误
s PATIENT_NAME=$p($g(^PAPER(patDR,"ALL")),"^",1)  ; 禁止下划线
s Reg_No=$p($g(^PAPER(patDR,"PAT",1)),"^",1)      ; 禁止下划线
```

**豁免**：ROWSPEC 中的字段名可以有下划线（这是 %Query 规范）：
```objectscript
Query getBG0003(...) As %Query(ROWSPEC = "PATIENT_NAME:%String,REG_NO:%String") [ SqlProc ]
```

### 1.5 参数名 — p 前缀 + lowerCamelCase

```objectscript
// ✅ 正确
ClassMethod getInfo(pDateFrom As %String, pDateTo As %String) As %Status
ClassMethod getPatient(pWardNo As %String, pStDate As %String) As %Status

// ❌ 错误
ClassMethod getInfo(dateFrom As %String, date_to As %String) As %Status  ; 缺p前缀
```

### 1.6 例程名 — 大写+下划线（.mac 文件）

```objectscript
// ✅ 正确
ROUTINE PATIENT_UTILS [Type = MAC]
ROUTINE ORDER_HELPER [Type = MAC]

// ❌ 错误
ROUTINE PatientUtils [Type = MAC]
```

### 1.7 标签名 — 大写

```objectscript
// ✅ 正确
Main
    s $zt="Error"
    q

Error
    s $zt=""
    q

OutRow
    s Data=$lb(...)
    q
```

---

## 二、ObjectScript 语法规范

> ⚠️ **核心原则：所有操作符周围都不能有空格**，这与大多数现代编程语言不同。

### 2.1 系统命令 — 使用缩写

使用缩写（`for` 除外）：

| 缩写 ✅ | 全写 ❌ | 说明 |
|---------|---------|------|
| `s` | `set` | 赋值 |
| `d` | `do` | 调用 |
| `q` | `quit` | 退出/返回 |
| `i` | `if` | 条件 |
| `f` | `for` | 循环（`for` 本身也是缩写，可用） |
| `w` | `write` | 输出 |

```objectscript
// ✅ 正确
s patientName=$p($g(^PAPER(patDR,"ALL")),"^",1)
d dataObj.%Set("Name",patientName)
q stream

// ❌ 错误
Set patientName=$p($g(^PAPER(patDR,"ALL")),"^",1)
Do dataObj.%Set("Name",patientName)
Quit stream
```

### 2.2 系统函数 — 使用缩写

| 缩写 ✅ | 全写 ❌ |
|---------|---------|
| `$e` | `$extract` |
| `$p` | `$piece` |
| `$l` | `$length` |
| `$o` | `$order` |
| `$g` | `$get` |
| `$d` | `$data` |
| `$lb` | `$listbuild` |
| `$lg` | `$listget` |
| `$li` | `$list` |
| `$zd` | `$zdate` |
| `$zdh` | `$zdateh` |
| `$zt` | `$ztrap` |

```objectscript
// ✅ 正确
s name=$p($g(^PAPER(id,"ALL")),"^",1)
s len=$l(name)
s date=$zd(+$p(data,"^",3),3)

// ❌ 错误
s name=$piece($get(^PAPER(id,"ALL")),"^",1)
s len=$length(name)
s date=$zdate(+$piece(data,"^",3),3)
```

### 2.3 缩进 — 4 个空格

```objectscript
// ✅ 正确
ClassMethod getPatient(pAdmId As %String) As %Status
{
    s patDR=$p($g(^PAADM(pAdmId)),"^",1)
    i patDR'="" {
        s name=$p($g(^PAPER(patDR,"ALL")),"^",1)
    }
    q $$$OK
}
```

### 2.4 大括号 — 方法大括号换行显示

```objectscript
// ✅ 正确
ClassMethod getPatient() As %Status
{
    s a=1
    i a=1 {
        s b=2
    }
    q $$$OK
}

// ❌ 错误（类和方法级别的大括号必须换行）
ClassMethod getPatient() As %Status {
    s a=1
    q $$$OK
}
```

### 2.5 命令条件判断 — 命令和条件之间不能有空格

```objectscript
// ✅ 正确
q:changeId=""
continue:CFActiveFlag'="N"
s:+startDate<1 startDate=""
q:((date="")||(date>endDate))
continue:((startDate'="")&&(logDate<startDate))

// ❌ 错误（会导致编译失败）
q: changeId = ""
continue: CFActiveFlag '= "N"
s: +startDate < 1 startDate = ""
```

### 2.6 变量赋值 — 赋值操作符两边不能有空格

```objectscript
// ✅ 正确
s startDate=..%ZDH(param.startDate)
s rowNo=rowNo+1
s patientNo=$p(^PAPER(patientId,"PAT",1),"^",2)

// ❌ 错误
s startDate = ..%ZDH(param.startDate)
s rowNo = rowNo + 1
s patientNo = $p(^PAPER(patientId,"PAT",1),"^",2)
```

### 2.7 比较操作符 — 两边不能有空格

```objectscript
// ✅ 正确
i (oldName="") {
    q
}
continue:((startDate'="")&&(logDate<startDate))
q:((date="")||(date>endDate))

// ❌ 错误
i (oldName = "") {
    q
}
continue: ((startDate '= "") && (logDate < startDate))
```

### 2.8 函数/方法调用参数 — 参数之间不能有空格

```objectscript
// ✅ 正确
d ..getChangeLogByPatientId(patientId,startDate,endDate,oldName,newName,cardNo)
d result.rows.%Push(rowObj)
s data=$lb(field1,field2,field3)

// ❌ 错误
d ..getChangeLogByPatientId(patientId, startDate, endDate, oldName, newName, cardNo)
d result.rows.%Push(rowObj)
s data = $lb(field1, field2, field3)
```

---

## 三、Query 接口标准结构

### 3.1 Fetch 方法 — If/Else 必须大写

```objectscript
// ✅ 正确
ClassMethod getBG0003Fetch(ByRef qHandle As %Binary, ByRef Row As %List, ByRef AtEnd As %Integer = 0) As %Status [ PlaceAfter = getBG0003Execute ]
{
    s AtEnd=$li(qHandle,1)
    s repid=$li(qHandle,2)
    s ind=$li(qHandle,3)
    s ind=$o(^CacheTemp(repid,ind))
    If ind="" {
        s AtEnd=1
        s Row=""
    }
    Else {
        s Row=^CacheTemp(repid,ind)
    }
    s qHandle=$lb(AtEnd,repid,ind)
    q $$$OK
}
```

### 3.2 Execute 方法 — OutRow 标签在 Quit $$$OK 之后

```objectscript
ClassMethod getBG0003Execute(ByRef qHandle As %Binary,...) As %Status
{
    s repid=$i(^CacheTemp)
    s qHandle=$lb(0,repid,0)
    s ind=1

    // 业务逻辑...
    s date="" f  s date=$o(^PAADMi("PAADM_AdmDate",date)) q:date=""  d
    .s adm="" f  s adm=$o(^PAADMi("PAADM_AdmDate",date,adm)) q:adm=""  d
    ..; 取值逻辑...
    ..d OutRow

    q $$$OK       // 必须在 OutRow 之前

OutRow
    s Data=$lb(field1,field2,field3)   // $lb()必须单行
    s ^CacheTemp(repid,ind)=Data
    s ind=ind+1
    q
}
```

### 3.3 $lb() 必须单行

```objectscript
// ✅ 正确
s Data=$lb(patientName,regNo,sexCode)

// ❌ 错误（多行会导致语法错误）
s Data=$lb(
    patientName,
    regNo,
    sexCode
)
```

### 3.4 点循环用 q 禁 continue

```objectscript
// ✅ 正确
.s adm="" f  s adm=$o(^PAADMi("...",adm)) q:adm=""  d

// ❌ 错误
.s adm="" f  s adm=$o(^PAADMi("...",adm)) continue:adm=""  d
```

---

## 四、变量映射规范

### 4.1 规则库变量 → 上下文变量

规则库中的取值表达式使用原始代码的变量名，生成代码时必须替换为当前上下文的变量名。

| 规则库变量 | 上下文变量 | 说明 |
|-----------|-----------|------|
| `tPatDR` | `patDR` | 患者DR |
| `patRowID` | `patDR` | 患者DR |
| `papmiDR` | `patDR` | 患者DR |
| `admRowId` | `adm` | 就诊DR |
| `paadmRowid` | `adm` | 就诊DR |

### 4.2 中间变量 — 先取值再使用

```objectscript
// ✅ 正确（先取中间变量）
s patDR=$p($g(^PAADM(adm)),"^",1)
s sexRowID=$p($g(^PAPER(patDR,"ALL")),"^",7)  ; 先取性别RowID
s sexCode=$p($g(^CT("SEX",sexRowID)),"^",2)   ; 再用RowID查字典

// ❌ 错误（sexRowID 未定义）
s patDR=$p($g(^PAADM(adm)),"^",1)
s sexCode=$p($g(^CT("SEX",sexRowID)),"^",2)   ; sexRowID 从哪来？
```

**常见中间变量**：

| 变量 | 取值表达式 | 说明 |
|------|-----------|------|
| `sexRowID` | `$p($g(^PAPER(patDR,"ALL")),"^",7)` | 性别RowID |
| `birthDay` | `$p($g(^PAPER(patDR,"ALL")),"^",6)` | 出生日期原始值 |

---

## 五、代码结构规范

### 5.1 类头注释格式

```objectscript
/// ======================================================================
/// 包路径.类名
/// 功能描述：一句话说明接口用途
///
/// 数据来源: DHC HIS 系统 Global 结构说明
///
/// Package:   包路径
/// Author:    开发者
/// Date:      日期
/// ======================================================================
```

### 5.2 方法注释格式

```objectscript
/// desc: 方法说明
/// params: 参数说明
/// return: 返回值说明
/// debug: w ##class(包路径.类名).方法名(参数)
ClassMethod getPatientInfo(pInput As %DynamicObject) As %DynamicObject
{
    s obj={}
    q obj
}
```

Query 方法注释含调试命令：
```objectscript
/// 方法说明：获取患者信息
/// 输入参数: pDateFrom: 开始日期 (默认为空), pDateTo: 结束日期 (默认为空)
/// 输出: 患者信息数据集
/// ROWSPEC: PATIENT_NAME,REG_NO,SEX_CODE,BIRTH_DATE
/// === 调试命令 ===
/// [终端/Portal运行]:
///     d ##class(web.DHCENS.BLL.OP.BG0003).getBG0003("","")
/// [数据库软件SQL调用]:
///     CALL web_DHCENS_BLL_OP_BG0003_GetBG0003("","")
```

### 5.3 字段中文注释

每个变量赋值行尾必须有中文注释：

```objectscript
s patDR=$p($g(^PAADM(adm)),"^",1)               ; 患者DR
s sexRowID=$p($g(^PAPER(patDR,"ALL")),"^",7)    ; 性别RowID
s patientName=$p($g(^PAPER(patDR,"ALL")),"^",1) ; 患者姓名
d dataObj.%Set("PATIENT_NAME",patientName)      ; 患者姓名
```

### 5.4 固定值抽离为 Parameter

机构信息、默认值、配置类硬编码值必须抽象为 `Parameter`：

```objectscript
Class ClassName Extends %RegisteredObject
{
    /// 统一社会信用代码/组织机构代码
    Parameter OrganizCode [ Constraint = "必填，9位/18位" ] = "440000000";
    /// 医疗机构名称
    Parameter OrganizName [ Constraint = "必填" ] = "XX医院";

    // ... Query ...

OutRow
    s Data=$lb(..#OrganizCode,..#OrganizName,...)
}
```

---

## 六、外部类属性访问规范

### 6.1 带下划线的外部属性 — 双引号包裹

访问外部类（PHA.*、web.* 等）的**带下划线属性**时，必须用双引号包裹属性名：

```objectscript
// ✅ 正确
s node=##class(PHA.COM.XML).%New("DEPT")
s node."DEPT_CODE"=deptCode
s node."DEPT_NAME"=deptName

// ❌ 错误（编译错误）
s node=##class(PHA.COM.XML).%New("DEPT")
s node.DEPT_CODE=deptCode
s node.DEPT_NAME=deptName
```

### 6.2 通用规则

所有访问外部类的带下划线属性时，都必须用双引号：
```objectscript
s obj."FIELD_NAME"=value      ; ✅ 正确
s obj.FIELD_NAME=value        ; ❌ 错误
```

---

## 七、接口字段完整性规范

### 7.1 核心原则

**文档要求多少字段，代码就输出多少字段，一个不能少。**

```objectscript
// ✅ 正确：全部输出，不会取值的置空
s node."DEPT_CODE"=deptCode    ; 科室代码
s node."DEPT_NAME"=deptName    ; 科室名称
s node."DEPT_TYPE"=""          ; 科室类型（待评估数据源）
s node."DEPT_DESC"=""          ; 科室描述（当前系统无对应数据）
```

### 7.2 未知字段处理

| 情况 | 处理方式 |
|------|----------|
| 知道数据源 | 正常取值 |
| 不知道数据源 | 置空 `=""`，加注释 `; 待评估数据源` |
| 数据源不存在 | 置空 `=""`，加注释 `; 该字段在当前系统无对应数据` |

### 7.3 字段名一致性

字段名必须与接口文档**完全一致**，不能自作主张改名：

```objectscript
s node."CTW_Remarks"=""       ; ✅ 正确（与文档一致）
s node."REMARKS"=""           ; ❌ 错误（擅自改名）
s node."remarks"=""           ; ❌ 错误（大小写不一致）
```

---

## 八、常见错误对照表

| 错误写法 | 正确写法 | 说明 |
|----------|----------|------|
| `s patient_name=...` | `s patientName=...` | 变量名禁止下划线 |
| `s name = $p(...)` | `s name=$p(...)` | 赋值操作符两边不能有空格 |
| `Set name=...` | `s name=...` | 系统命令必须缩写 |
| `$piece(...)` | `$p(...)` | 系统函数必须缩写 |
| `i ind="" { ... } e { ... }` | `If ind="" { ... } Else { ... }` | Fetch 方法 If/Else 大写 |
| `s Data=$lb(\n  a,\n  b\n)` | `s Data=$lb(a,b)` | $lb() 必须单行 |
| `Fetch() As %Integer` | `Fetch() As %Status` | 返回类型必须是 %Status |
| 循环内 `continue` | 循环内 `q` | 点循环用 quit 禁止 continue |
| `Quit $$$OK` 在 OutRow 后 | `q $$$OK` 在 OutRow 前 | OutRow 标签位置 |
| `node.DEPT_CODE=val` | `node."DEPT_CODE"=val` | 外部类带下划线属性必须双引号 |
| `MethodName() As %Status {` | `MethodName() As %Status\n{` | 方法大括号必须换行 |
| `s x=y+z` | `s x=y+z`（无空格） | 算符两边不能有空格 |
| `q:((a="")` | `q:((a="")`（无空格） | 比较操作符两边不能有空格 |
| `d method(a, b, c)` | `d method(a,b,c)` | 参数之间不能有空格 |

---

## 参考文件

- Query 标准模板：`references/interfaces/query-standard.md`
- JSON 标准模板：`references/interfaces/json-standard.md`
- XML 标准模板：`references/interfaces/xml-standard.md`
- IRIS 命名约定：`references/iris-naming-conventions.md`
- 踩坑经验：`references/his-pitfalls.md`
