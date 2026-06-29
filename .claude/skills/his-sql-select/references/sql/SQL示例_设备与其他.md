# SQL 查询示例 — 设备与其他

> 来源：`../SQL查询示例汇总_按表归类.md`。按业务域拆分后的 RAG 知识库文件。仅允许 SELECT。

---

## 一、设备相关表

### 1. EQ_Equip（设备表）

**设备台账查询：**
```sql
SELECT * FROM EQ_Equip
```

---

### 2. EQ_EquipLog（设备日志表）

**设备日志查询：**
```sql
SELECT * FROM EQ_EquipLog
```

---

> **说明：**
> - 所有日期查询需使用格式：`2017-08-08 0:00:00`
> - `->` 为 IRIS 箭头语法，用于对象引用关联
> - `||` 为 IRIS 子表 Rowid 分隔符
> - SQL 仅允许 SELECT 语句，禁止 INSERT/UPDATE/DELETE/DROP
