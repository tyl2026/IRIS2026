# 数据源遍历配置规范

> 本文件定义了规则库中 `traversal` 配置的标准格式

## 配置结构

在每个业务域规则文件的 frontmatter 中，添加 `traversal` 配置：

```yaml
---
domain: "10-registration"
name: "挂号域"
# ... 其他配置 ...

# 数据源遍历配置（供代码生成器使用）
traversal:
  # 数据源类型标识（用于代码生成器判断）
  type: "rEG"

  # 视图名称匹配规则（用于自动选择遍历配置）
  # 当接口视图名称包含列表中的关键词时，自动匹配到此域的遍历配置
  # 匹配策略：遍历所有域的 viewMatchers，关键词越长优先级越高
  viewMatchers: ["register", "挂号", "regist"]
  
  # 入参说明
  inputParam:
    name: "admRowId"
    type: "%String"
    description: "就诊ID"
  
  # 前置变量（从入参派生）
  preVariables:
    - name: "patDR"
      expression: "$p($g(^PAADM(admRowId)),\"^\",1)"
      description: "患者DR"
    - name: "visitNo"
      expression: "admRowId"
      description: "就诊流水号(就是就诊ID)"
  
  # 索引遍历配置
  index:
    global: "^User.DHCRegistrationFeeI"
    name: "ADM"
    keys: ["admRowId", "rowId"]
    expression: '$o(^User.DHCRegistrationFeeI("ADM",admRowId,rowId))'
  
  # 数据读取配置
  data:
    global: "^User.DHCRegistrationFeeD"
    variable: "data"
    format: "lg"  # lg=$lg()格式, p=$p()格式
    expression: "$g(^User.DHCRegistrationFeeD(rowId))"
  
  # 遍历代码模板（ObjectScript）
  template: |
    s rowId=""
    f  s rowId=$o(^User.DHCRegistrationFeeI("ADM",admRowId,rowId)) q:rowId=""  d
    .s data=$g(^User.DHCRegistrationFeeD(rowId))
    .i (data="") q
---
```

## 多模式遍历配置（modes）

当一个域支持多种遍历索引时（如就诊域按入院日期/出院日期），使用 `modes` 字典定义：

```yaml
traversal:
  type: "PAADM"
  viewMatchers: ["admission", "discharge", "入院", "出院"]  # 主级匹配（兜底）
  modes:
    admDate:
      viewMatchers: ["admission", "入院"]  # 模式级匹配
      description: "按入院日期遍历"
      index:
        global: "^PAADMi"
        name: "PAADM_AdmDate"
        # ...
      template: |
        f date=pStartDate:1:pEndDate d
        .s admRowId=""
        .f  s admRowId=$o(^PAADMi("PAADM_AdmDate",date,admRowId)) q:admRowId=""  d
    disDate:
      viewMatchers: ["discharge", "出院"]
      description: "按出院日期遍历"
      index:
        global: "^PAADMi"
        name: "PAADM_DischgDate"
        # ...
      template: |
        f date=pStartDate:1:pEndDate d
        .s admRowId=""
        .f  s admRowId=$o(^PAADMi("PAADM_DischgDate",date,admRowId)) q:admRowId=""  d
```

匹配逻辑：
1. 遍历所有域的 modes，检查 mode 级 viewMatchers 是否匹配
2. 若匹配，使用该 mode 的 index 和 template
3. 若无 mode 匹配，使用主级 template（兜底）

## 支持的数据格式

| format | 说明 | 示例 |
|--------|------|------|
| `lg` | $lg() 列表格式 | `$lg(data,1)` |
| `p` | $p() 分隔格式 | `$p(data,"^",1)` |
| `lg` | $lg() JSON列表格式 | `$lg(data,1)` |

## 遍历模板变量

模板中可用的变量：
- `{inputParam}` - 入参名称
- `{preVariables}` - 前置变量定义
- `{indexGlobal}` - 索引Global
- `{indexName}` - 索引名称
- `{indexKeys}` - 索引键
- `{dataGlobal}` - 数据Global
- `{dataVar}` - 数据变量名
- `{dataFormat}` - 数据格式

## 示例：诊断域配置

```yaml
traversal:
  type: "MRDIA"
  inputParam:
    name: "admRowId"
    type: "%String"
    description: "就诊ID"
  preVariables:
    - name: "patDR"
      expression: "$p($g(^PAADM(admRowId)),\"^\",1)"
    - name: "mradm"
      expression: "$p($g(^PAADM(admRowId)),\"^\",61)"
      description: "病案号"
      validation: |
        i (mradm="") {
            d stream.Write("{""code"":1,""msg"":""未找到病案号"",""data"":[]}")
            q stream
        }
  index:
    global: "^MR"
    name: "DIA"
    keys: ["mradm", "sub"]
    expression: '$o(^MR(mradm,"DIA",sub))'
  data:
    global: "^MR"
    variable: "diaData"
    format: "p"
    expression: '$g(^MR(mradm,"DIA",sub))'
  template: |
    s sub=""
    f  s sub=$o(^MR(mradm,"DIA",sub)) q:sub=""  d
    .s diaData=$g(^MR(mradm,"DIA",sub))
    .i (diaData="") q
    .s icdDr=$p(diaData,"^",1)
    .q:icdDr=""
```

## 示例：医嘱域配置

```yaml
traversal:
  type: "OEORD"
  inputParam:
    name: "admRowId"
    type: "%String"
    description: "就诊ID"
  preVariables:
    - name: "patDR"
      expression: "$p($g(^PAADM(admRowId)),\"^\",1)"
    - name: "visitNo"
      expression: "admRowId"
      description: "就诊流水号(就是就诊ID)"
  index:
    global: "^OEORD"
    name: "Adm"
    keys: ["visitNo", "ordId"]
    expression: '$o(^OEORD(0,"Adm",visitNo,ordId))'
  data:
    global: "^OEORD"
    variable: "ordstr1"
    format: "p"
    expression: '$g(^OEORD(ordId,"I",ordItm,1))'
  template: |
    s ordId=""
    f  s ordId=$o(^OEORD(0,"Adm",visitNo,ordId)) q:ordId=""  d
    .s ordItm=""
    .f  s ordItm=$o(^OEORD(ordId,"I",ordItm)) q:ordItm=""  d
    ..s ordstr1=$g(^OEORD(ordId,"I",ordItm,1))
    ..i (ordstr1="") q
```

## 示例：费用域配置

```yaml
traversal:
  type: "DHCPB"
  inputParam:
    name: "admRowId"
    type: "%String"
    description: "就诊ID"
  preVariables:
    - name: "patDR"
      expression: "$p($g(^PAADM(admRowId)),\"^\",1)"
  index:
    global: "^DHCPB"
    name: "ADM"
    keys: ["admRowId", "pbId"]
    expression: '$o(^DHCPB(0,"ADM",admRowId,pbId))'
  data:
    global: "^DHCPB"
    variable: "pbData"
    format: "p"
    expression: "$g(^DHCPB(pbId))"
  template: |
    s pbId=""
    f  s pbId=$o(^DHCPB(0,"ADM",admRowId,pbId)) q:pbId=""  d
    .s pbData=$g(^DHCPB(pbId))
    .i (pbData="") q
```
