# 测试数据发现策略

> Phase 2 功能测试中，如何从生产库自动获取真实有效的测试入参数据。
> 核心原则：**不编造数据，从真实业务表中提取**。

---

## 一、入参类型识别

解析接口方法的参数签名，推断每个参数的语义类型：

| 参数名模式 | 推断类型 | 示例 |
|-----------|---------|------|
| `pDateFrom` / `pStartDate` / `pBeginDate` | 起始日期 | `pDateFrom As %String` |
| `pDateTo` / `pEndDate` / `pStopDate` | 结束日期 | `pDateTo As %String` |
| `pAdmId` / `pAdmNo` / `pVisitId` / `pEpisodeId` | 就诊号/流水号 | `pAdmId As %String` |
| `pPatId` / `pPatientId` / `pPAPMI` | 患者ID | `pPatId As %String` |
| `pDeptCode` / `pLocCode` / `pWardCode` | 科室/病区代码 | `pDeptCode As %String` |
| `pDocCode` / `pDoctorCode` | 医生代码 | `pDocCode As %String` |
| `pOrderId` / `pOrdId` | 医嘱ID | `pOrderId As %String` |
| `pRegNo` / `pInpatNo` | 住院号/登记号 | `pRegNo As %String` |
| `pLsh` / `pSerialNo` | 流水号 | `pLsh As %String` |
| `pType` / `pStatus` / `pFlag` | 类型/状态标识 | 查字典或文档说明 |

---

## 二、三类入参的数据获取 SQL

### 2.1 日期范围入参

取最近有数据的日期范围：

```sql
-- 查询最近有就诊记录的日期（取最近30天内的某一天）
SELECT TOP 1 CONVERT(VARCHAR, AdmDate, 23) AS DateStr
FROM PA_Adm
WHERE AdmDate >= DATEADD(DAY, -30, GETDATE())
  AND AdmDate IS NOT NULL
ORDER BY AdmDate DESC
```

如果接口需要日期范围（起止两个参数），构造：
- `pDateFrom` = 上述日期
- `pDateTo` = `pDateFrom` 或 `DATEADD(DAY, 7, pDateFrom)`（一周范围）

**通过 MCP 执行**：
```
iris_query(query="SELECT TOP 1 ...", namespace="DHC-APP")
```

### 2.2 编码/字典入参

查询字典表获取有效代码：

```sql
-- 科室代码
SELECT TOP 1 CTLOC_Code FROM CT_Loc WHERE CTLOC_DateActiveTo IS NULL

-- 医生代码
SELECT TOP 1 CTPCP_Code FROM CT_CareProv WHERE CTPCP_DateActiveTo IS NULL

-- 病区代码
SELECT TOP 1 WARD_Code FROM PAC_Ward WHERE WARD_DateActiveTo IS NULL

-- 医嘱项代码
SELECT TOP 1 ARCIM_Code FROM ARC_ItmMast WHERE ARCIM_DateTo IS NULL
```

### 2.3 主键/ID 入参

查询主事务表获取有效主键：

```sql
-- 就诊ID（最近的一条）
SELECT TOP 1 PAADM_RowID FROM PA_Adm ORDER BY PAADM_RowID DESC

-- 患者ID
SELECT TOP 1 PAPMI_RowID FROM PA_PatMas ORDER BY PAPMI_RowID DESC

-- 医嘱ID
SELECT TOP 1 OEORD_RowId FROM OE_Order ORDER BY OEORD_RowId DESC

-- 住院登记号（通过 PAPER 索引）
SELECT TOP 1 PAPMI_No FROM PA_PatMas WHERE PAPMI_No IS NOT NULL
```

**通用取数模式**：按主键倒序取最近一条，确保数据存在且表不空。

---

## 三、从接口注释提取调试命令

生成的接口代码中，每个方法注释都包含调试命令：

```objectscript
/// === 调试命令 ===
/// [终端/Portal运行]:
///     d ##class(web.DHCENS.BLL.OP.BG0003).getBG0003("","")
/// [数据库软件SQL调用]:
///     CALL web_DHCENS_BLL_OP_BG0003_getBG0003("","")
```

**提取规则**：
1. 搜索 `///     d ##class(` 模式
2. 提取完整的方法调用：`d ##class(Package.Class).method(params)`
3. 将 `params` 中的空字符串 `""` 替换为真实数据

**替换策略**：
```
原始: d ##class(Package.Class).getBG0003("","")
替换: d ##class(Package.Class).getBG0003("2026-01-01","2026-06-01")
执行: iris_execute(code="w ##class(Package.Class).getBG0003(""2026-01-01"",""2026-06-01"").Read()", namespace="DHC-APP")
```

注意 ObjectScript 字符串引号在 iris_execute 中的转义（双引号 `""`）。

---

## 四、测试数据优先级

获取测试入参的优先级：

1. **Query 入参直接留空** — 如果接口方法有空参保护（`s:pParam=$c(0) pParam=""`），优先用空参测试（等价于"查全部"）
2. **字典表取有效代码** — 通过 CT_* 表取一个有效代码
3. **主表取最近主键** — 通过 PA_Adm/PA_PatMas/OE_Order 等取最近记录
4. **文档说明的固定值** — 如果文档的"输入参数说明"部分有示例值，直接用

**原则**：先简后繁。空参能跑通就先不填，跑不通再逐步填充真实数据。

---

## 五、测试结果验证标准

| 返回类型 | 通过标准 | 失败标准 |
|---------|---------|---------|
| Query | `$li(Row,1)` 非空，或 `AtEnd=0` | 报错、返回空（可能数据问题） |
| JSON Stream | `.Read()` 返回合法 JSON，`code=0` | JSON 解析失败、code 为错误码 |
| XML Stream | `.Read()` 返回合法 XML，无 `<Code>-1` | XML 解析失败、错误码 |
| 通用 | 执行无报错，返回值非空 | `<UNDEFINED>`、`<SUBSCRIPT>`、`<PROTECT>` 等运行时错误 |

---

## 参考

- 接口测试工作流：`tests/workflow.md`
- 编码规范：`references/objectscript-coding-standards.md`
