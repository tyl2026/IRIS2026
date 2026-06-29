# query/ — ObjectScript Class Query 参考库

为 `his-class-query` 技能提供参考资料。包含 InterSystems Class Query 语法指南和按业务域分类的示例。

## 目录结构

```
query/
├── README.md                  # 本文件
├── class-query-guide.md       # Class Query 语法指南（InterSystems 官方文档）
├── 示例_门诊与挂号.md          # 门诊人次、缴费、挂号、诊断（5 个示例）
├── 示例_住院与计费.md          # 欠费、医嘱费用、出院费用、床位（5 个示例）
├── 示例_药房与其他.md          # 发药、药房未发、输血、排班、建卡（5 个示例）
└── 示例/                      # 原始 .txt 文件（归档，以 .md 为准）
```

## 使用方式

### 语法参考

查阅 `class-query-guide.md` 了解：
- Class Query 的两种类型（`%SQLQuery` 基本查询 vs `%Query` 自定义查询）
- `ROWSPEC` / `CONTAINID` 参数定义
- Execute / Fetch / Close 三方法模式
- 调用方式（`%SQL.Statement` + `%PrepareClassQuery`）

### 示例参考

按业务域查阅对应的 `示例_*.md` 文件，每个示例包含：
- 调用方式（`d ##class(%ResultSet).RunQuery(...)`）
- 关键 Global 节点及其字段含义
- 核心逻辑代码片段
- ROWSPEC 输出定义

### 业务域速查

| 业务域 | 参考文件 | 包含示例 |
|--------|---------|---------|
| 门诊/挂号 | `示例_门诊与挂号.md` | 门诊人次、缴费、诊断统计、挂号、诊断查询 |
| 住院/计费 | `示例_住院与计费.md` | 欠费、医嘱费用、出院费用分类、床位信息、床位费用 |
| 药房/其他 | `示例_药房与其他.md` | 发药、未发药医嘱、输血、排班、建卡 |
