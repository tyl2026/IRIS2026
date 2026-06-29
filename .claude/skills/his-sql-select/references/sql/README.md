# SQL 速查目录

> 按业务域拆分的 RAG 知识库文件。原始来源：`../常用SQL.txt` + `../SQL查询示例汇总_按表归类.md`。

---

## 一、常用 SQL 速查（运维场景）

> 来源：`常用SQL.txt`。包含 SQL 查询、UPDATE、Caché 方法调用、值枚举等，适合运维排错。

| 文件 | 覆盖业务 | 核心表 |
|---|---|---|
| [常用SQL_医嘱与出入转.md](常用SQL_医嘱与出入转.md) | 医嘱查询/修改、出入院、床位 | `OE_OrdItem`、`OE_OrdExec`、`PA_Adm`、`PA_AdmTransaction`、`PAC_Bed` |
| [常用SQL_计费与药房.md](常用SQL_计费与药房.md) | 医保结算、发票、账单、药房药库 | `INSU_Divide`、`DHC_INVPRT`、`dhc_patientbill`、`DHC_OEDispensing`、`DHC_INGdRec` |
| [常用SQL_病历与护理.md](常用SQL_病历与护理.md) | 电子病历、护理病历、会诊、体温单 | `emrinstance.*`、`NurMp.DHCTempMultData`、`DHC_EmConsult`、`PA_Allergy` |
| [常用SQL_检验与其他.md](常用SQL_检验与其他.md) | 体检、检验、密码查询、手术麻醉 | `DHC_PE_Station`、`RP_VisitNumberReport`、`DHC_AN_OPArrange`、`OR_Anaest_Operation` |

---

## 二、SQL 查询示例汇总（开发/报表场景）

> 来源：`SQL查询示例汇总_按表归类.md`。仅 SELECT，含多表关联、子查询、IRIS 箭头语法等，适合报表开发参考。

| 文件 | 覆盖业务 | 核心表 |
|---|---|---|
| [SQL示例_病人就诊与基础.md](SQL示例_病人就诊与基础.md) | 病人主索引、就诊记录、急诊状态、账户 | `PA_PatMas`、`PA_Person`、`PA_Adm`、`DHC_ADMVisitStatus` |
| [SQL示例_医嘱与收费.md](SQL示例_医嘱与收费.md) | 医嘱查询、发票、账单、预缴金、医保明细 | `OE_OrdItem`、`OE_OrdExec`、`DHC_INVPRTZY`、`DHC_CardRef`、`INSU_DivideSub` |
| [SQL示例_药品库存与诊断.md](SQL示例_药品库存与诊断.md) | 发药、库存、批次、调价、ICD诊断 | `DHC_pHDISPEN`、`DHC_OEDispensing`、`INC_Itm`、`MR_Adm`、`MRC_ICDDx` |
| [SQL示例_床位与统计.md](SQL示例_床位与统计.md) | 病区、床位入住、病区日报 | `PAC_Ward`、`PAC_Bed`、`PAC_BedAdm`、`DHCMRIPDay`、`DHC_MRIPDetail` |
| [SQL示例_预约挂号.md](SQL示例_预约挂号.md) | 排班、号源、预约、锁号 | `DHC_RBApptSchedule`、`RB_Appointment`、`RB_Resource`、`RB_ApptSchedule` |
| [SQL示例_设备与其他.md](SQL示例_设备与其他.md) | 设备台账、设备日志 | `EQ_Equip`、`EQ_EquipLog` |
| [SQL示例_医保结算.md](SQL示例_医保结算.md) | 医保结算主单/明细上传（住院+门诊） | `DHC_INVPRTZY`、`DHC_BillConINV`、`INSU_Divide`、`INSU_DivideSub` |
| [SQL示例_LIS数据迁移.md](SQL示例_LIS数据迁移.md) | LIS 8.3→9.0 数据迁移导出 | `BT_TestCode`、`V_BT_TestSet`、`V_BT_Specimen`、`ARC_ItemExternalCodes` |

---

## 关键词索引

| 关键词 | 常用SQL文件 | 示例文件 |
|---|---|---|
| 医嘱状态/修改/执行 | 常用SQL_医嘱与出入转 | SQL示例_医嘱与收费 |
| 计费/医保/发票/账单 | 常用SQL_计费与药房 | SQL示例_医嘱与收费 |
| 药房/库存/发药/退药 | 常用SQL_计费与药房 | SQL示例_药品库存与诊断 |
| 电子病历/护理/会诊 | 常用SQL_病历与护理 | — |
| 检验/体检/密码 | 常用SQL_检验与其他 | — |
| 手术/麻醉 | 常用SQL_检验与其他 | — |
| 就诊/入院/出院/转科 | 常用SQL_医嘱与出入转 | SQL示例_病人就诊与基础 |
| 床位/病区 | 常用SQL_医嘱与出入转 | SQL示例_床位与统计 |
| 预约/挂号/排班/号源 | — | SQL示例_预约挂号 |
| 诊断/ICD/病案 | — | SQL示例_药品库存与诊断 |
| 设备 | — | SQL示例_设备与其他 |

---

## 语法说明

> 适用于所有文件

- `->` 为 IRIS 箭头语法，用于对象引用关联（如 `PAADM_PAPMI_DR->PAPMI_Name`）
- `||` 为 IRIS 子表 Rowid 分隔符（如 `2649355||44`）
- 所有日期查询需使用格式：`2017-08-08 0:00:00`
- 「常用 SQL 速查」文件允许 UPDATE/INSERT/方法调用（运维专用）
- 「SQL 查询示例汇总」文件仅允许 SELECT，禁止 INSERT/UPDATE/DELETE/DROP
