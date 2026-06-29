# ObjectScript 变量定义规范

> 本文档定义了ObjectScript代码中变量定义的标准规范，供代码生成和审查时参考。

---

## 一、变量定义原则

### 1.1 先定义后使用

**规则**：所有变量在使用前必须有定义。

```objectscript
; ❌ 错误写法（未定义就使用）
Set idCard=$p($g(^PAPER(patDR,"ALL")),"^",9)

; ✅ 正确写法（先定义后使用）
s patDR=$p($g(^PAADM(adm)),"^",1)
Set idCard=$p($g(^PAPER(patDR,"ALL")),"^",9)
```

### 1.2 变量初始化

**规则**：变量在使用前应该初始化为空字符串或默认值。

```objectscript
; 单个变量初始化
s varName=""

; 2个变量初始化
s var1="",var2=""

; 3-5个变量初始化
s (var1,var2,var3)=""

; 超过5个变量初始化（分多行，每行最多5个）
s (var1,var2,var3,var4,var5)=""
s (var6,var7,var8,var9,var10)=""
```

---

## 二、变量命名规范

### 2.1 命名风格

**规则**：变量名使用小驼峰命名（camelCase），禁止使用下划线。

```objectscript
; ❌ 错误写法（使用下划线）
s patient_id=patDR
s hospital_name=""

; ✅ 正确写法（小驼峰）
s patientId=patDR
s hospitalName=""
```

### 2.2 特殊变量命名

| 变量类型 | 命名规则 | 示例 |
|----------|----------|------|
| 患者DR | patDR | `s patDR=$p(admInfo,"^",1)` |
| 就诊ID | adm | `s adm=$o(^PAADMi(...))` |
| 科室DR | ctlocDr | `s ctlocDr=$p(admInfo,"^",4)` |
| 医生DR | ctpcpDr | `s ctpcpDr=$p(admInfo,"^",9)` |
| 病案号 | mradm | `s mradm=$p(admInfo,"^",61)` |
| 院区DR | hospDr | `s hospDr=$p(^CTLOC(ctlocDr),"^",22)` |
| 医嘱ID | ordId | `s ordId=$o(^OEORD(0,"Adm",adm,0))` |
| 医嘱项ID | ordItm | `s ordItm=$o(^OEORD(ordId,"I",0))` |
| 账单ID | pbId | `s pbId=$o(^DHCPB(0,"ADM",adm,pbId))` |

---

## 三、变量作用域规范

### 3.1 循环变量

**规则**：循环变量在循环开始前定义，在循环体内使用。

```objectscript
; 遍历循环变量
s adm=""
for {
    s adm=$o(^PAADMi("PAADM_AdmDate",date,adm))
    Quit:adm=""
    ; 使用 adm 变量
}
```

### 3.2 中间变量

**规则**：中间变量在GetOrdDetail标签内定义，在字段取值时使用。

```objectscript
GetOrdDetail
    ; 定义中间变量
    s ctlocDr=$p($g(^PAADM(adm)),"^",4)
    s patDR=$p($g(^PAADM(adm)),"^",1)
    
    ; 使用中间变量
    Set hospitalId=$p($g(^CTLOC(ctlocDr)),"^",22)
    Set patientName=$p($g(^PAPER(patDR,"ALL")),"^",1)
```

### 3.3 字段变量

**规则**：字段变量在GetOrdDetail标签内初始化，在OutRow标签中输出。

```objectscript
GetOrdDetail
    ; 初始化字段变量
    s (hospitalId,hospitalName,patientId,patientName)=""
    
    ; 取值
    Set hospitalId=$p($g(^CTLOC(ctlocDr)),"^",22)
    Set patientId=patDR
    
    ; 输出
    d OutRow
    q

OutRow
    s Data=$lb(hospitalId,hospitalName,patientId,patientName)
    s ^CacheTemp(repid,ind)=Data
    s ind=ind+1
    q
```

---

## 四、变量依赖规范

### 4.1 依赖链

**规则**：变量定义必须遵循依赖链，确保所有依赖变量在使用前已定义。

```objectscript
; 依赖链：adm → patDR → patientName
s patDR=$p($g(^PAADM(adm)),"^",1)  ; 依赖 adm
Set patientName=$p($g(^PAPER(patDR,"ALL")),"^",1)  ; 依赖 patDR
```

### 4.2 跨表依赖

**规则**：跨表取值时，必须确保关联变量已定义。

```objectscript
; 跨表依赖：adm → ctlocDr → hospitalId
s ctlocDr=$p($g(^PAADM(adm)),"^",4)  ; 就诊表 → 科室DR
Set hospitalId=$p($g(^CTLOC(ctlocDr)),"^",22)  ; 科室表 → 院区DR
```

---

## 五、常见错误和修复

### 5.1 未定义变量

**错误**：变量未定义就使用

```objectscript
; ❌ 错误
Set idCard=$p($g(^PAPER(patDR,"ALL")),"^",9)

; ✅ 修复
s patDR=$p($g(^PAADM(adm)),"^",1)
Set idCard=$p($g(^PAPER(patDR,"ALL")),"^",9)
```

### 5.2 变量名大小写错误

**错误**：变量名大小写不正确

```objectscript
; ❌ 错误
Set hospitalId=$p($g(^CTLOC(ctlocDr)),"^",22)

; ✅ 修复（确保变量名已定义）
s ctlocDr=$p($g(^PAADM(adm)),"^",4)
Set hospitalId=$p($g(^CTLOC(ctlocDr)),"^",22)
```

### 5.3 Global名称大小写错误

**错误**：Global名称大小写不正确

```objectscript
; ❌ 错误
s data=$g(^cis.an.operScheduleD(opsId))

; ✅ 修复
s data=$g(^CIS.AN.OperScheduleD(opsId))
```

---

## 六、代码审查检查项

### 6.1 P0红线检查

- [ ] 所有变量在使用前必须有定义
- [ ] 变量名使用小驼峰命名，禁止下划线
- [ ] Global名称使用正确的大小写
- [ ] 外部类属性使用双引号包裹

### 6.2 P1约束检查

- [ ] 变量初始化使用简洁写法
- [ ] 循环变量在循环开始前定义
- [ ] 中间变量在GetOrdDetail标签内定义
- [ ] 字段变量在GetOrdDetail标签内初始化

---

## 七、最佳实践

### 7.1 变量定义顺序

1. 循环变量（adm, date, pbId等）
2. 中间变量（patDR, ctlocDr, hospDr等）
3. 字段变量（hospitalId, patientName等）

### 7.2 变量初始化位置

- 循环变量：在循环开始前初始化
- 中间变量：在GetOrdDetail标签内定义
- 字段变量：在GetOrdDetail标签内初始化

### 7.3 变量使用位置

- 循环变量：在循环体内使用
- 中间变量：在字段取值时使用
- 字段变量：在OutRow标签中输出
