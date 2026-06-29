# 踩坑经验积累

> 项目实践中积累的坑点，按需查阅。

## Global 遍历

| 坑点 | 场景 |
|------|------|
| CIS.AN索引空格 | `^CIS.AN.OperScheduleI("Adm"," "_admId)` 多一空格! |
| ENS索引大写 | `^Busi.ENS.EnsLISItemResultI("IndexReportItem", $zcvt(id,"U"), ...)` 不转大写返回空! |

## 数据格式

| 坑点 | 场景 |
|------|------|
| $lg() vs $p() | CIS.AN用$lg(List),旧版用$p(Global,"^") |
| 短关键词误匹配 | `dosage` 匹配到 `AGE` → 关键词必须足够长 |
| 中文混入表达式 | 取值表达式必须是可执行ObjectScript代码，不能写中文 |
