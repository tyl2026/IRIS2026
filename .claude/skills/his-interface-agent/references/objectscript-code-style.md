# ObjectScript 代码风格详细规范

> 本文档是 CLAUDE.md 中代码风格规范的详细说明，供代码生成和审查时参考。

---

## 一、取值赋值分离原则

**规则**：从Global/字典取值和赋值到JSON/XML结构必须分两步写。

```objectscript
; ❌ 错误写法（混合）
d dataObj.%Set("serial_number", $p($g(^PAADM(admRowId)),"^",81))

; ✅ 正确写法（分离）
s serialNumber=$p($g(^PAADM(admRowId)),"^",81)
d dataObj.%Set("serial_number",serialNumber)  ; 就诊流水号
```

**适用规则**：
- 简单常量/变量可直接赋值：`d obj.%Set("code",0)`
- 函数调用（$p/$lg/$case等）必须先赋值给变量

---

## 二、for循环使用花括号

**规则**：for循环体推荐使用 `{}` 花括号写法。

```objectscript
; 花括号写法（推荐）
for {
    set rowId = $order(^DHCPB(0,"ADM",admId,rowId))
    quit:rowId=""
    s data=$g(^DHCPB(rowId))
    s xxx=$lg(data,1)
}

; 点号写法（可用，但不推荐）
f  s rowId=$o(^DHCPB(0,"ADM",admId,rowId)) q:rowId=""  d
.s data=$g(^DHCPB(rowId))
.s xxx=$lg(data,1)
```

### ⚠️ 点号写法和花括号写法中 `q` 的重大区别

> 这是两种写法最易混淆的关键差异，必须严格区分。

| 写法 | `.i (data="") q` / `i (data="") q` | 行为 |
|------|--------------------------------------|------|
| **点号** | `.i (data="") q` | **跳过当前迭代**（等价于 continue），循环自动继续下一轮 |
| **花括号** | `i (data="") q` | **退出整个循环**（等价于 break），不再继续任何迭代 |

**原因**：点号写法中，循环体由缩进自动界定，`q` 只结束当前迭代的剩余代码。花括号写法中，`q` 是显式的 Quit，退出当前所在的 for 循环。

**正确转换**：

```objectscript
; 点号写法 — q 等于跳过当前迭代
f  s rowId=$o(^Global(rowId)) q:rowId=""  d
.s data=$g(^Global(rowId))
.i (data="") q          ; ← 跳过空数据，继续下一个 rowId
.s xxx=$lg(data,1)

; 花括号写法 — 必须用 Continue 而非 Quit
for {
    s rowId=$o(^Global(rowId))
    Quit:rowId=""
    s data=$g(^Global(rowId))
    Continue:data=""     ; ✅ 跳过空数据，继续下一个 rowId
    ; If (data="") { Quit }  ← ❌ 错误！会退出整个循环
    s xxx=$lg(data,1)
}
```

**生成器规则**：模板中的 `.i (cond) q` 在转换为花括号时，必须变为 `Continue:cond`。

---

## 三、命令和函数缩写规范

### 3.1 生成器输出规范（花括号+全写命令）

> 代码生成器自动输出花括号写法，命令使用全写形式。

| 命令 | 写法 | 说明 |
|------|------|------|
| Set | Set | 赋值（全写） |
| Do | Do | 执行（全写） |
| Quit | Quit | 返回/退出（全写） |
| If | If | 条件判断（全写，缩写会编译报错） |
| Else | Else | 否则（全写，缩写会编译报错） |
| For | For | 循环（全写） |
| Kill | Kill | 删除（全写） |

### 3.2 手写代码兼容（点号缩进+缩写）

> 手写代码时可使用点号缩进+缩写，但生成器不输出此格式。

| 全写 | 缩写 | 说明 |
|------|------|------|
| Set | s | 赋值 |
| Do | d | 执行 |
| Quit | q | 返回/退出 |
| If | i | 条件判断 |
| For | f | 循环 |
| Kill | k | 删除 |

### 3.3 函数缩写

| 全写 | 缩写 | 说明 |
|------|------|------|
| $piece | $p | 取分隔串字段 |
| $listget | $lg | 安全取列表元素 |
| $list | $li | 取列表元素（越界报错） |
| $get | $g | 安全取值 |
| $extract | $e | 取子串 |
| $order | $o | 遍历索引 |
| $data | $d | 判断节点是否存在 |
| $zdate | $zd | 日期格式化 |
| $ztime | $zt | 时间格式化 |
| $zdatetime | $zdt | 日期时间格式化 |

---

## 四、操作符空格规范

**规则**：赋值（=）、比较（=、'=、>、<）、命令条件（:）、参数调用两边**禁止空格**。

```objectscript
; ❌ 错误写法
s x = 1
i x = 1 q
s data = $g(^GLOBAL)

; ✅ 正确写法
s x=1
i x=1 q
s data=$g(^GLOBAL)
```

**例外**：
- Parameter 定义允许空格：`Parameter OrgCode = "HOSPCODE"`
- 方法签名允许空格：`ClassMethod test(pParam As %String)`

---

## 五、变量命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 类名 | 大驼峰 PascalCase | PatientInfo |
| 方法名 | 小驼峰 lowerCamelCase | getPatientList |
| 属性名 | 大驼峰 PascalCase | HospName |
| 参数名 | p前缀 + 小驼峰 | pWardNo, pStDate |
| 变量名 | 小驼峰（禁止下划线） | tPatDR, admRowId |
| ROWSPEC | 可用下划线（%Query豁免） | ROW_ID, PATIENT_NAME |

**禁止下划线**：所有标识符（变量名、方法名、参数名）禁止使用下划线，外部类属性含下划线必须双引号包裹。

```objectscript
; ❌ 错误
s patient_name="张三"
s obj.DEPT_CODE="101"

; ✅ 正确
s patientName="张三"
s obj."DEPT_CODE"="101"
```

---

## 六、注释规范

### 6.1 方法注释

```objectscript
/// desc: 获取患者信息
/// params: pAdmRowId - 就诊ID
/// return: %GlobalCharacterStream (JSON格式)
/// debug: w ##class(web.DHCENS.BLL.OP.PatientInfo).GetPatientInfo("123").Read()
ClassMethod GetPatientInfo(pAdmRowId As %String) As %GlobalCharacterStream
```

### 6.2 代码行注释

```objectscript
s patDR=$p(admData,"^",1)    ; 患者DR
s admDate=$p(admData,"^",6)  ; 入院日期
```

**规则**：每个字段取值行必须有中文注释，说明字段含义。

---

## 七、$lg vs $li 选择

| 函数 | 行为 | 推荐场景 |
|------|------|---------|
| $lg() | 越界返回空字符串 | **默认使用**，安全 |
| $li() | 越界报错 | 确定索引有效时使用 |

```objectscript
; 推荐：安全取值
s name=$lg(data,1)

; 仅在确定有效时使用
s name=$li(data,1)  ; 已确认data非空且有第1个元素
```

---

## 八、错误处理模式

```objectscript
ClassMethod test() As %GlobalCharacterStream
{
    s stream=##class(%GlobalCharacterStream).%New()
    s $zt="err"

    ; 业务逻辑...
    q stream

err
    s $zt=""  ; 防死循环，必须第一行
    ; 错误处理...
    q stream
}
```

**关键**：err标签后第一行必须 `s $zt=""` 清除陷阱，防止死循环。

---

## 九、单行条件过滤规范

**规则**：花括号循环中，单行条件过滤使用 `continue:condition` 格式，不使用多行 if 块。

```objectscript
; ❌ 错误写法（多行）
i status="C" {
    continue
}

; ✅ 正确写法（单行）
continue:status="C"
```

**适用场景**：
- 跳过不符合条件的记录：`continue:status="C"`
- 跳过空数据：`continue:ordstr1=""`
- 跳过非目标院区：`continue:hospDr'=pHospitalId`

**注意**：
- 多行条件块（如需要先取值再判断）仍使用 `if {}` 格式
- 点号循环中使用 `.i (cond) q` 格式（参见第二节）

---

## 十、标签代码块抽离规范

**规则**：当循环层级过多时，将字段赋值逻辑抽离到标签代码块中，提高可读性。

```objectscript
; ❌ 错误写法（循环层级过深）
f {
    f {
        f {
            ; 取值赋值代码...
            d OutRow
        }
    }
}

; ✅ 正确写法（抽离到标签）
f {
    f {
        f {
            continue:ordstr1=""
            d GetOrdDetail
        }
    }
}
q $$$OK

GetOrdDetail
    ; 取值赋值代码...
    d OutRow
    q

OutRow
    s Data=$lb(...)
    s ^CacheTemp(repid,ind)=Data
    s ind=ind+1
    q
```

**适用场景**：
- 循环嵌套超过2层
- 字段赋值逻辑超过10行
- 需要复用的取值逻辑

**标签命名规范**：
- 主逻辑标签：`Get{DomainName}Detail`（如 `GetOrdDetail`、`GetDiagDetail`）
- 输出标签：`OutRow`（固定）
- 错误标签：`err`（固定）
