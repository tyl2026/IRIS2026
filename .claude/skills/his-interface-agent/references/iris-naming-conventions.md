# IRIS HIS 命名约定

> 最后更新：2026-05-30（MCP验证+002文档对照补充）

## 一、SQL表前缀 → 业务域（完整版）

> 来源：002基本表结构文档 + MCP实体类验证

| 前缀 | 英文全称 | 业务域 | 典型表/Global | 典型类名 |
|------|---------|--------|--------------|---------|
| `APC_` | Accounts Payable Code Tables | 供应业务 | APC_Vendor(供应商) | User.APCVendor |
| `ARC_` | Accounts Receivable Code Tables | 接收业务(预约规则/计费) | ARC_ItmMast(医嘱项), ARC_ItemCat(医嘱子类) | User.ARCItmMast |
| `CF_` | Configuration Code Tables | 系统配置数据 | 系统级配置 | — |
| `CT_` | Common Code Tables | 基础数据字典 | CT_Loc(科室), CT_CareProv(人员), CT_Sex(性别) | User.CTLoc, User.CTCareProv |
| `DHC_` | DataHospital Code | 东华HIS自定义扩展 | DHC_PatientBill(账单), DHC_TarItem(收费项), DHC_CardRef(就诊卡) | User.DHCPatientBill |
| `IN_` | Inventory System | 库存系统 | INC_Itm(库存项), INC_ItmLoc(科室库存), IN_AdjSalePrice(调价) | User.INCItm |
| `MR_` | Medical Records | 电子诊疗数据 | MR_Adm(病案主表), MR_Diagnos(诊断子表) | User.MRAdm |
| `MRC_` | Medical Records Code Tables | 电子诊疗基础数据(字典) | MRC_ICDDx(ICD诊断), MRC_DiagnosType(诊断类型) | User.MRCICDDx |
| `OE_` | Order Entry | 医嘱 | OE_Order(医嘱主表), OE_OrdItem(医嘱明细), OE_OrdExec(执行) | User.OEOrdItem |
| `OR_` | Operating Room | 手术室 | OR_Anaesthesia(麻醉), ORC_Operation(手术数据) | User.ORAnaesthesia |
| `PA_` | Patient | 患者/就诊 | PA_PatMas(患者主表), PA_Adm(就诊表), PA_Allergy(过敏) | User.PAPatMas, User.PAAdm |
| `PAC_` | Patient Administration Code Tables | 患者管理字典 | PAC_AdmReason(费别), PAC_Ward(病区), PAC_Bed(床位), PAC_DischargeCondition(转归) | User.PACAdmReason |
| `RB_` | Resource Booking | 资源预约 | RB_Resource(资源), RB_ApptSchedule(排班), RB_Appointment(预约) | User.RBApptSchedule |
| `SS_` | Security System | 安全系统/用户权限 | SS_User(用户), SS_Group(安全组) | User.SSUser |

## 二、Global 前缀 → 业务域

| 前缀 | 业务域 | 典型 Global | 说明 |
|------|--------|------------|------|
| `^CT*` | 字典类 | ^CTLOC(科室), ^CTPCP(人员), ^CT("SEX"), ^CT("HOSP"), ^CT("SS")(身份类型) | 最高频，几乎所有接口用到 |
| `^PA*` | 就诊/患者 | ^PAPER(患者), ^PAADM(就诊), ^PAWARD(病区), ^PAROOM(房间) | 患者主索引+就诊记录 |
| `^OE*` | 医嘱 | ^OEORD(医嘱), ^OEC("ORCAT")(医嘱大类), ^OEC("OSTAT")(医嘱状态) | 医嘱全流程 |
| `^ARC*` | 医嘱项 | ^ARCIM(医嘱项/物品), ^ARC("IC")(医嘱子类) | 复合主键(Sub+Ver) |
| `^PAC*` | 患者管理字典 | ^PAC("ADMREA")(费别), ^PAC("DISCON")(转归), ^PAC("ADMLOC")(就诊位置) | 就诊管理类字典 |
| `^MR*` | 病案/诊断 | ^MR(病案), ^MRC("ID")(ICD码), ^MRC("DTYP")(诊断类型) | 诊断数据 |
| `^SS*` | 系统用户 | ^SSU("SSUSR")(用户), ^SSU("SSGRP")(安全组) | 登录账号管理 |
| `^OE*` | 医嘱执行 | ^OEORD(ord,"I",sub,"X",execSub) | 医嘱执行记录 |
| `^DHCPB` | 计费账单 | ^DHCPB(账单三层嵌套), ^DHCTARI(收费项目/物价) | 计费核心 |
| `^DHCTarC` | 费用分类字典 | ^DHCTarC("SC"/"AC"/"OC"/"EC"/"MC"/"IC") | 共享Global，子类下标区分 |
| `^DHCINTR` | 药房台账 | ^DHCINTR(0,"TypeDate",type,date,intr) | 药房发药/退药统一入口 |
| `^DHCCARD` | 就诊卡 | ^DHCCARD("CF",cfId), ^DHCCARDi(索引) | 就诊卡+账户管理 |
| `^DHCACD` | 账户管理 | ^DHCACD("AccM",accmId) | 预交金/账户余额 |
| `^INCI*` | 库存 | ^INCI(inci) | 药品库存项 |
| `^RB*` | 资源预约 | ^RB("RES",resId)(资源), ^RBAS(resId,asSub)(排班/预约) | 挂号排班 |
| `^DHC*` | 东华自定义 | ^DHCITMINFO(物品扩展), ^DHCPHPER(药房人员) | 东华特有扩展 |

## 三、类/包前缀 → 产品线

| 前缀 | 产品线 | 说明 |
|------|--------|------|
| `web.DOC*` / `DOC*` | 医生站 | 医生工作站相关类 |
| `web.Nur*` / `Nur*` | 护理 | 护理工作站相关类 |
| `web.PHA*` / `PHA*` | 药房 | 药房/药品管理相关类 |
| `web.DHCBILL*` / `web.UDHC*` | 计费 | 计费/结算/发票相关类 |
| `*DHCENS*` | 平台/总线 | 数据交换平台/互联互通相关类 |
| `**Ris*` | 影像 RIS | 放射信息系统相关 |
| `*LIS*` | 检验 LIS | 实验室信息系统相关 |
| `*DHCMR*` | 病案 | 病案首页/病历相关 |
| `web.QMJK*` | 全民健康 | 全民健康平台接口 |
| `*DHCDoc*` | 医生站扩展 | 医生工作站DHC扩展 |
| `*Nur*` | 护理扩展 | 护理工作站DHC扩展 |

## 四、按业务流程划分（来自002文档）

### 4.1 基础数据字典表

| 分类 | 核心表 | 说明 |
|------|--------|------|
| 用户/安全组/医院 | SS_User, SS_GROUP, CT_Hospital | 系统基础 |
| 科室/病区/房间/床位 | CT_Loc, PAC_Ward, PAC_WardRoom, PAC_Bed | 物理空间层级 |
| 医护人员 | CT_CareProv, CT_CarPrvTp | 人员资质 |
| 诊断基础 | MRC_ICDDx, MRC_DiagnosType | ICD码/诊断类型 |
| 医嘱项 | ARC_ItmMast, ARC_ItemCat, OEC_OrderCategory | 三大项之首 |
| 药学项 | PHC_DrgMast, PHC_DrgForm, PHC_Freq, PHC_Instruc | 药品字典 |
| 库存项 | INC_Itm, INC_ItmLoc | 药品库存 |
| 检验基础 | CT_Specimen, CT_TestCode, CT_TestSet | LIS字典 |
| 检查基础 | RBC_Equipment | RIS字典 |
| 手术基础 | ORC_Operation, ORC_AnaestMethod, ORC_BladeType | 手术字典 |
| 计费基础 | DHC_TarItem, DHC_OrderLinkTar, DHC_TarItemPrice | 收费项目+医嘱关联 |

### 4.2 门诊业务表

| 环节 | 核心表 | 说明 |
|------|--------|------|
| 病人建档 | PA_PatMas, PA_Person, DHC_CardRef | 患者主索引+就诊卡 |
| 挂号分诊 | RB_Resource, RB_ApptSchedule, RB_Appointment, DHCQueue | 排班→预约→队列 |
| 就诊 | PA_Adm, MR_Diagnos, OE_OrdItem, PA_Allergy | 就诊→诊断→医嘱 |
| 检查申请 | DHCRB_ApplicationBill | 检查申请单 |
| 发药 | DHC_PHDISPEN, DHC_PHDISITEM | 门诊发药 |
| 收费 | DHC_INVPRT, DHC_INVPayMode, DHC_BillConINV | 门诊发票 |
| 医保 | INSU_AdmInfo, INSU_Divide | 医保登记+分解 |

### 4.3 住院业务表

| 环节 | 核心表 | 说明 |
|------|--------|------|
| 住院登记 | PA_AdmTransaction | 转科换床记录 |
| 住院计费 | DHC_PatientBill → DHC_PatBillOrder → DHC_PatBillDetails | 三层嵌套 |
| 住院发票 | DHC_InvprtZY | 住院发票 |
| 住院发药 | DHC_PHACollected, DHC_PHACollectItm | 住院发药主从表 |
| 退药 | DHC_PhaReturn, DHC_PhaReturnItm | 退药记录 |
| 手术麻醉 | DHC_AN_Arrange, DHC_AN_Order | 手术排班 |

### 4.4 统计/报表表

| 表 | 说明 |
|------|------|
| DHC_WorkLoad | 收入数据表 |
| DHCWorkRegReport | 挂号基础数据 |
| DHCMRIPDay | 工作量基础数据 |
| DHC_MRIPDetail | 工作量明细 |
| DHC_MRBed | 床位维护 |

## 五、使用场景

1. **找实体表**：知道业务域后，按 Global 前缀缩小搜索范围
2. **找接口类**：知道产品线后，按包前缀定位相关接口程序
3. **新域建规则**：先按前缀确认实体表，再用 MCP `iris_doc` 读取 cls
4. **排查问题**：根据 Global 前缀快速判断数据属于哪个业务域
5. **MCP 查询**：用 `iris_symbols(query="User.DHCTar*")` 按前缀搜索类

## 六、记忆口诀

> **"CT字典PA就诊, OE医嘱ARC项, MR病案PAC管, SS用户RB预约, OE手术IN库存, DHC东华自扩展"**
