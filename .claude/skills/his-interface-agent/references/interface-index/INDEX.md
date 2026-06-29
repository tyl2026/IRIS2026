# 接口索引快速查找

> **数据来源优先级**：MCP连接可用时，优先从IRIS `Ens_InterfaceMethod`表实时查询；无MCP连接时，使用本地 [all-interfaces.md](all-interfaces.md)（238个类，644个方法）作为兜底。

---

## 按业务功能快速定位

| 用户描述关键词 | 推荐搜索关键词 | 说明 |
|---------------|--------------|------|
| 患者信息/挂号/就诊 | `RegInterface` / `EMPI` / `BOOKREG` | 预约挂号、患者主索引 |
| 医嘱/处方/用药 | `ORDER` / `Drug` / `DRUG` | 医嘱系统、药房发药 |
| 检验/化验/报告 | `LIS` / `LabReport` | 检验系统 |
| 检查/影像/放射 | `RIS` / `PACS` | 放射/影像系统 |
| 手术/麻醉 | `OPERATION` / `CIS.AN` | 手术系统 |
| 费用/账单/收费 | `DHCBILL` / `FYDataMidPlat` | 自助收费、费用中台 |
| 字典/科室/医生 | `Dict` / `DICT` | 字典接口 |
| 病历/病案 | `EMRservice` / `MA.IPMR` | 电子病历、病案管理 |
| 药房/发药 | `Drug` / `PHA` | 药房系统 |
| 血透/透析 | `BloodDialysis` | 血透系统 |
| 急诊 | `Emergency` | 急诊系统 |
| 互联网医院 | `HLWYY` | 互联网医院(好大夫等) |
| 传染病上报 | `GJCRBSB` | 传染病/疾病上报 |
| 医保/结算 | `INSU` | 医保接口 |
| 支付/聚合支付 | `iH` / `FacePay` | 聚合支付接口 |
| 短信/消息 | `SMS` / `ShortMsg` | 消息推送 |
| 双转/转诊 | `DualRefer` | 双向转诊 |
| 卫监绩效 | `WJJXH` / `WJYB` | 卫监绩效数据上报 |
| 手术排班 | `CIS.OPApp` | 手术预约排班 |
| 病理 | `PIS` | 病理系统 |
| 体检 | `PE` | 体检系统 |

---

## 按接口编码前缀定位

| 编码前缀 | 说明 | 示例 |
|---------|------|------|
| `W000xxx` | 标准业务接口 | W00000386 |
| `S000xxx` | 服务类接口 | S00000008 |
| `WCRBxxxx` | 传染病上报接口 | WCRB00001 |
| `SENDCRBxxx` | 传染病数据操作 | SENDCRB001 |

---

## 查找方式

### MCP连接可用时（首选）

1. **SQL搜索接口编码**：`iris_query("SELECT ... FROM Ens_InterfaceMethod WHERE Code='W00000386'")`
2. **SQL搜索方法名**：`iris_query("SELECT ... FROM Ens_InterfaceMethod WHERE ClassMethod LIKE '%GetPatInfo%'")`
3. **SQL搜索类名片段**：`iris_query("SELECT ... FROM Ens_InterfaceMethod WHERE ClassName LIKE '%BloodDialysis%'")`
4. **SQL搜索功能描述**：`iris_query("SELECT ... FROM Ens_InterfaceMethod WHERE Description LIKE '%血透%'")`

### 无MCP连接时（兜底）

1. **Grep 搜索接口编码**：`Grep "W00000386" references/interface-index/all-interfaces.md`
2. **Grep 搜索方法名**：`Grep "GetPatInfo" references/interface-index/all-interfaces.md`
3. **Grep 搜索类名片段**：`Grep "BloodDialysis" references/interface-index/all-interfaces.md`
4. **Grep 搜索功能描述**：`Grep "血透" references/interface-index/all-interfaces.md`
