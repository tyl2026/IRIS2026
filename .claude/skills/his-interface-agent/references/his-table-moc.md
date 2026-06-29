# HIS 业务表 MOC (Map of Content)

> 来源：002 基本表结构(修订).docx | MCP iris_doc 验证 | 2026-05-30
> 用途：Agent 探测新业务域时，按关键字检索→定位实体表→MCP 读取 cls→生成规则

## 使用方法

1. **按业务关键字搜索**：`grep -i "挂号\|预约\|排班" references/his-table-moc.md`
2. **按表名前缀搜索**：`grep "^| RB_\|^| DHC_Card" references/his-table-moc.md`
3. **按类名搜索**：`grep "User.RBResource\|User.DHCCardRef" references/his-table-moc.md`
4. **找到表名后**：用 MCP `iris_doc(get, "User.XXX.cls")` 读取实体类定义

---

## 一、基础数据字典（1.1~1.11）

### 1.1 用户/安全组/医院

| 表名 | 类名 | Global | 说明 | 规则域 |
|------|------|--------|------|--------|
| CT_Hospital | User.CTHospital | ^CT("HOSP") | 医院信息 | 00-dictionary |
| SS_User | User.SSUser | ^SSU("SSUSR") | 系统用户 | 00-dictionary |
| SS_GROUP | User.SSGroup | ^SSU("SSGRP") | 安全组 | — |
| SS_UserOtherLogonLoc | User.SSUserOtherLogonLoc | — | 用户多科室登录 | — |

### 1.2 科室/病区/房间/床位

| 表名 | 类名 | Global | 说明 | 规则域 |
|------|------|--------|------|--------|
| CT_Loc | User.CTLoc | ^CTLOC | 科室(最高频字典之一) | 00-dictionary |
| PAC_Ward | User.PACWard | ^PAWARD | 病区 | 00-dictionary |
| PAC_WardRoom | User.PACWardRoom | ^PAWARD(ward,"ROOM") | 病区房间(子表) | — |
| PAC_Bed | User.PACBed | ^PAWARD(ward,"BED") | 床位(子表) | 00-dictionary |
| PAC_BedType | User.PACBedType | — | 床位类型 | 00-dictionary |
| PAC_RoomType | User.PACRoomType | — | 病房类型 | — |
| PAC_WardBedAllocation | User.PACWardBedAllocation | — | 科室与病区对照 | — |

### 1.3 医护人员

| 表名 | 类名 | Global | 说明 | 规则域 |
|------|------|--------|------|--------|
| CT_CareProv | User.CTCareProv | ^CTPCP | 医护人员(三节点结构) | 00-dictionary |
| CT_CarPrvTp | User.CTCarPrvTp | ^CT("CarPrvTp") | 人员类型(医生/护士/技师) | 00-dictionary |

### 1.4 诊断基础数据

| 表名 | 类名 | Global | 说明 | 规则域 |
|------|------|--------|------|--------|
| MRC_ICDDx | User.MRCICDDx | ^MRC("ID") | ICD诊断字典 | 30-diagnosis |
| MRC_DiagnosType | User.MRCDiagnosType | — | 诊断类型(入院/出院/主诊断) | 30-diagnosis |
| MRC_ICDAlias | User.MRCICDAlias | — | ICD别名 | — |

### 1.5 三大项基础信息

#### 医嘱项

| 表名 | 类名 | Global | 说明 | 规则域 |
|------|------|--------|------|--------|
| ARC_ItmMast | User.ARCItmMast | ^ARCIM(sub,ver) | 医嘱项/物品主字典(复合主键!) | 00-dictionary |
| ARC_ItemCat | User.ARCItemCat | ^ARC("IC") | 医嘱子分类 | 00-dictionary |
| OEC_OrderCategory | User.OECOrderCategory | ^OEC("ORCAT") | 医嘱大类 | 00-dictionary |
| OEC_OrderType | User.OECOrderType | — | 医嘱类型 | — |
| OEC_OrderStatus | User.OECOrderStatus | ^OEC("OSTAT") | 医嘱状态 | 40-order |
| OEC_Priority | User.OECPriority | ^OECPR | 医嘱优先级(长期/临时) | 40-order |
| ARC_OrdSets | User.ARCOrdSets | — | 医嘱套 | — |
| ARC_BillGrp | User.ARCBillGrp | — | 帐单类 | — |
| ARC_BillSub | User.ARCBillSub | ^aRCSG | 帐单子类 | 00-dictionary |

#### 药学项

| 表名 | 类名 | Global | 说明 | 规则域 |
|------|------|--------|------|--------|
| PHC_DrgMast | User.PHCDrgMast | ^PHCD | 药学项主表 | d0-pharmacy |
| PHC_DrgForm | User.PHCDrgForm | ^PHCD(id,"DF") | 药学项子表(处方剂量) | d0-pharmacy |
| PHC_DrgGeneric | User.PHCDrgGeneric | — | 药品通用名(子表) | — |
| PHC_Form | User.PHCForm | ^PHC("DF") | 剂型(颗粒/胶囊/注射液) | d0-pharmacy |
| PHC_Generic | User.PHCGeneric | ^PHCGeneric | 通用名表 | — |
| PHC_Freq | User.PHCFreq | ^PHCF | 频次(qD/tID/qOD) | 00-dictionary |
| PHC_Instruc | User.PHCInstruc | — | 用药途径 | d0-pharmacy |
| PHC_Duration | User.PHCDuration | ^PHCD | 疗程 | 00-dictionary |
| PHC_Poison | User.PHCPoison | — | 管制分类(精一/精二/麻精) | — |
| PHC_Cat | User.PHCCat | — | 药(理)学大类 | — |
| PHC_SubCat | User.PHCSubCat | — | 药(理)学子类 | — |
| CT_UOM | User.CTUOM | ^CT("UOM") | 计量单位 | 00-dictionary |
| CT_ConFac | User.CTConFac | — | 单位转换系数 | — |

#### 库存项

| 表名 | 类名 | Global | 说明 | 规则域 |
|------|------|--------|------|--------|
| INC_Itm | User.INCItm | ^INCI | 库存项主表 | d0-pharmacy |
| INC_ItmLoc | User.INCItmLoc | ^INCI(id,"IL") | 科室库存(子表) | — |
| INC_StkCat | — | ^INC("SC") | 库存分类 | — |
| APC_VENDOR | — | ^APC("VEN") | 供应商 | — |
| PH_Manufacturer | — | — | 产地 | — |

### 1.6 检验基础数据

| 表名 | 类名 | Global | 说明 | 规则域 |
|------|------|--------|------|--------|
| CT_Specimen | User.CTSpecimen | ^TTAB | 检验标本 | 50-lab-exam |
| CT_TestCode | User.CTTestCode | — | 检验项目 | 50-lab-exam |
| CT_TestSet | — | — | 检验医嘱 | 50-lab-exam |

### 1.7 检查基础数据

| 表名 | 类名 | Global | 说明 | 规则域 |
|------|------|--------|------|--------|
| RBC_Equipment | User.RBCEquipment | — | 检查设备 | 55-exam-report |
| DHCRBC_ReportStatus | User.DHCRBCReportStatus | — | 检查状态(I/R/O/V/S) | 55-exam-report |

### 1.8 过敏源

| 表名 | 类名 | Global | 说明 | 规则域 |
|------|------|--------|------|--------|
| PAC_Allergy | User.PACAllergy | — | 过敏源字典 | — |

### 1.9 手术基础数据

| 表名 | 类名 | Global | 说明 | 规则域 |
|------|------|--------|------|--------|
| ORC_Operation | User.ORCOperation | — | 手术数据表 | 60-surgery |
| ORC_AnaestMethod | User.ORCAnaestMethod | — | 麻醉方式 | 60-surgery |
| ORC_OperPosition | User.ORCOperPosition | — | 体位(平卧/侧位) | — |
| ORC_OperationCategory | User.ORCOperationCategory | — | 手术分类(一/二/三类) | 60-surgery |
| ORC_BladeType | User.ORCBladeType | — | 手术切口等级 | — |
| OEC_BodySite | User.OECBodySite | — | 身体部位 | — |

### 1.10 计费基础信息

| 表名 | 类名 | Global | 说明 | 规则域 |
|------|------|--------|------|--------|
| DHC_TarItem | User.DHCTarItem | ^DHCTARI | 收费项目/物价字典(78属性!) | 00-dictionary |
| DHC_TarItemPrice | — | ^DHCTARI(id,"P") | 收费项价格(子表) | — |
| DHC_TarItemAlias | — | ^DHCTARAL | 收费项别名 | — |
| DHC_OrderLinkTar | — | ^DHCOLT | 医嘱-收费关联(4级匹配) | — |
| DHC_TarFactor | — | — | 折扣/记账系数 | — |
| DHC_TarCate | — | ^DHCTarC("TC") | 收费大类 | 00-dictionary |
| DHC_TarSubCate | User.DHCTarSubCate | ^DHCTarC("SC") | 收费子类 | 00-dictionary |
| DHC_TarAcctCate | User.DHCTarAcctCate | ^DHCTarC("AC") | 会计子类 | 00-dictionary |
| DHC_TarAC | — | ^DHCTarC("TAC") | 会计大类 | 00-dictionary |
| DHC_TarEMCCate | User.DHCTarEMCCate | ^DHCTarC("EC") | 核算子类 | 00-dictionary |
| DHC_TarEC | — | ^DHCTarC("TEC") | 核算大类 | 00-dictionary |
| DHC_TarInpatCate | User.DHCTarInpatCate | ^DHCTarC("IC") | 住院费用子类 | 00-dictionary |
| DHC_TarIC | — | ^DHCTarC("TIC") | 住院大类 | 00-dictionary |
| DHC_TarOutpatCate | User.DHCTarOutpatCate | ^DHCTarC("OC") | 门诊费用子类 | 00-dictionary |
| DHC_TarOC | — | ^DHCTarC("TOC") | 门诊大类 | 00-dictionary |
| DHC_TarMRCate | User.DHCTarMRCate | ^DHCTarC("MC") | 病案子类 | 00-dictionary |
| DHC_TarMC | — | ^DHCTarC("TMC") | 病案大类 | 00-dictionary |
| CT_PayMode | User.CTPayMode | ^CT("CTPM") | 支付方式 | A1-outpatient-invoice |
| PAC_AdmReason | User.PACAdmReason | ^PAC("ADMREA") | 费别(患者入院类型) | 20-visit |
| CMC_BankMas | — | ^CMC("CMCBM") | 银行字典 | A1-outpatient-invoice |
| ARC_DepType | — | — | 预交金类型 | — |
| ARC_DisretOutstType | — | ^ARC("DOUTS") | 欠费类别 | — |

### 1.11 其他基础数据

| 表名 | 类名 | Global | 说明 | 规则域 |
|------|------|--------|------|--------|
| CT_Sex | User.CTSex | ^CT("SEX") | 性别 | 10-patient |
| CT_Marital | — | ^CT("mAR") | 婚姻状况 | 10-patient |
| CT_Nation | — | ^CT("nAT") | 民族 | 10-patient |
| CT_Occupation | — | ^CT("oCC") | 职业 | 10-patient |
| CT_Education | — | ^CT("EDU") | 教育水平 | 10-patient |
| CT_Country | — | ^CT("cOU") | 国家 | 10-patient |
| CT_Province | — | ^CT("pROV") | 省份 | 10-patient |
| CT_City | — | ^CT("cIT") | 城市 | 10-patient |
| CT_CityArea | — | ^CT("cITAREA") | 区县 | 10-patient |
| CT_SocialStatus | — | ^CT("SS") | 患者身份类型 | 10-patient |
| CT_Relation | — | ^CT("rLT") | 联系人关系 | 10-patient |
| PAC_BloodType | — | ^PAC("BLDT") | 血型 | — |
| MRC_BodyParts | — | ^MRC("BODP") | 身体部位 | — |

---

## 二、门诊业务（2.1）

### 2.1.1 病人建档

| 表名 | 类名 | Global | 说明 | 规则域 |
|------|------|--------|------|--------|
| PA_PatMas | User.PAPatMas | ^PAPER(patDR) | 患者主表(多节点ALL/PAT/PER) | 10-patient |
| PA_Person | User.PAPerson | ^PAPER(patDR) | 个人信息(与PatMas同Global) | 10-patient |
| DHC_CardTypeDef | User.DHCCardTypeDef | — | 卡类型 | A3-card-account |
| DHC_CardRef | User.DHCCardRef | ^DHCCARD("CF") | 就诊卡 | A3-card-account |
| DHC_CardStatusChange | User.DHCCardStatusChange | — | 卡状态变更(子表) | — |

### 2.1.2 挂号分诊

| 表名 | 类名 | Global | 说明 | 规则域 |
|------|------|--------|------|--------|
| RB_Resource | User.RBResource | ^RB("RES") | 资源(医生/设备) | 10-registration |
| RB_ResEffDate | User.RBResEffDate | — | 班次 | — |
| RB_ResEffDateSession | User.RBResEffDateSession | — | 排班模板 | — |
| RB_ApptSchedule | User.RBApptSchedule | ^RBAS(resId,sub) | 排班表 | 10-registration |
| DHC_RBApptSchedule | User.DHCRBApptSchedule | — | 排班扩展表 | — |
| RBC_SessionType | User.RBCSessionType | ^RBC("SESS") | 出诊级别 | 10-registration |
| RBC_AppointMethod | User.RBCAppointMethod | ^RBC("APTM") | 预约方式 | — |
| RB_Appointment | User.RBAppointment | ^RBAS(...,"APPT") | 预约表 | 10-registration |
| DHC_RBAppointment | User.DHCRBCAppointment | — | 预约扩展表 | — |
| DHCQueue | User.DHCQueue | ^User.DHCQueueD | 挂号队列 | 10-registration |
| DHCExaBorough | User.DHCExaBorough | — | 分诊区 | — |
| DHCExaBorDep | User.DHCExaBorDep | — | 分诊区科室对照 | — |
| DHCExaRoom | User.DHCExaRoom | — | 诊室 | — |
| DHCFirstCode | User.DHCFirstCode | — | 分诊优先状态 | — |
| DHCPerState | User.DHCPerState | — | 分诊状态(等候/过号/到达) | — |
| DHCRegAdd | User.DHCRegAdd | ^DHCRegAdd | 加号记录 | — |
| DHC_RBCASStatus | User.DHCRBCASStatus | ^DHCRBCASStatus | 排班状态(正常/停诊) | — |
| DHC_TimeRange | User.DHCTimeRange | ^DHCTimeRange | 出诊时段(上午/下午) | — |
| DHC_LocSpec | — | ^DHCLocSpec | 科室专业对照 | — |
| DHC_ExaBorRoom | — | ^DHCExaBorRoom | 诊区诊室对照 | — |
| DHC_ClinicDiagnosSign | — | ^DHCClinicDSS | 亚专业症状对照 | — |

### 2.1.3 病人就诊

| 表名 | 类名 | Global | 说明 | 规则域 |
|------|------|--------|------|--------|
| PA_Adm | User.PAAdm | ^PAADM(admId) | 就诊表(核心!) | 20-visit |
| MR_Adm | — | ^MR(mradm) | 诊断主表 | 30-diagnosis |
| MR_Diagnos | User.MRDiagnos | ^MR(mradm,"DIA") | 诊断子表 | 30-diagnosis |
| MR_DiagType | User.MRDiagType | — | 诊断类型(子表) | 30-diagnosis |
| OE_Order | User.OEOrder | ^OEORD(ordId) | 医嘱主表 | 40-order |
| OE_OrdItem | User.OEOrdItem | ^OEORD(ord,"I",sub) | 医嘱明细(子表) | 40-order |
| OE_OrdExec | User.OEOrdExec | ^OEORD(...,"X",sub) | 医嘱执行(孙表) | 40-order |
| OEC_OrderStatus | User.OECOrderStatus | ^OEC("OSTAT") | 医嘱状态 | 40-order |
| DHC_OE_OrdItem | User.DHCOEOrdItem | — | 医嘱扩展表 | — |
| DHC_OE_OrdExec | User.DHCOEOrdExec | — | 医嘱执行扩展 | — |
| PA_Allergy | — | ^PAPER(pat,"ALLERGY") | 过敏记录 | — |
| DHCRB_ApplicationBill | User.DHCRBApplicationBill | — | 检查申请单 | — |
| DHCDocIPBooking | User.DHCDocIPBooking | — | 住院证 | — |

### 2.1.4 药房配置

| 表名 | 类名 | Global | 说明 | 规则域 |
|------|------|--------|------|--------|
| DHC_PHLOC | — | ^DHCPHLOC | 药房科室定义(发药设置主表) | d0-pharmacy |
| DHC_PhaLocDisType | — | ^DHCPHLOC(id,"DIS",sub) | 发药设置子表(发药类别配置) | — |
| DHC_PHPYWIN | — | ^DHCPHPY | 配药窗口表 | d0-pharmacy |
| DHC_PHPYWINSUB | — | ^DHCPHPY(id,"PHW",sub) | 配发窗口关联表(多对多) | — |
| DHC_PHWINDOW | — | ^DHCPHWIN | 发药窗口表 | d0-pharmacy |
| DHC_PHWINLOC | — | ^DHCPHWINL(id,"I",sub) | 发药窗口子表(科室指定) | — |
| DHC_PHPERSON | — | ^DHCPHPER | 药房人员定义 | d0-pharmacy |
| DHC_PHWPER | — | — | 窗口与发药人员对照 | — |
| DHCStkDrugGroup | — | ^DHCSTDRUGGRP | 发药类别定义 | — |
| DHCStkDrugGrpItm | — | ^DHCSTDRUGGRP(id,"I",sub) | 发药类别-医嘱子类关联 | — |
| DHC_PhaPriority | — | ^DHCPPRIOR | 医嘱优先级设置(发药用) | — |
| DHC_STRefuseReason | — | ^DHCRFREASON | 拒绝发药原因 | — |
| DHC_PHBaseMedicine | — | ^DHCPHBMED | 门诊基数药品 | — |
| PHAOP_DispLimit | — | ^CF.PHA.OP.DispLimit | 药房人员发药权限 | — |

### 2.1.5 门诊发药/退药

| 表名 | 类名 | Global | 说明 | 规则域 |
|------|------|--------|------|--------|
| DHC_PHARWIN | — | ^DHCPHARW | 门诊计费药房中间表(业务入口) | d0-pharmacy |
| DHC_PHDISPEN | — | ^DHCPHDISP | 门诊配/发药主表 | d0-pharmacy |
| DHC_PHDISITEM | — | ^DHCPHDI(id,"PHDI",sub) | 门诊配/发药子表 | d0-pharmacy |
| DHC_PHDISITMCLB | — | ^DHCPHDI(id,"PHDI",sub,"INCLB",lb) | 门诊配/发药孙表(批次) | d0-pharmacy |
| DHC_PhReturn | — | ^DHCPHRET | 门诊退药主表 | d0-pharmacy |
| DHC_PhRetItm | — | ^DHCPHRTI(id,sub) | 门诊退药子表 | d0-pharmacy |
| DHC_PHOweList | — | ^DHCPHOW | 门诊欠药单主表 | — |
| DHC_PHUNDISPEN | — | ^DHCPHUND | 门诊非正常发药主表 | — |
| DHC_PHUNDISPITM | — | ^DHCPHUND(id,"I",sub) | 门诊非正常发药子表 | — |
| DHC_PHINPERSON | — | ^DHCPHINP | 门诊非正常发退药患者 | — |
| DHC_PHWINQUEUE | — | ^DHCPHWQU | 报到机排号表 | — |
| DHC_PHCURRWINSUM | — | ^DHCPHCWS | 药房窗口发处方数量 | — |
| PA_QUE1 | — | ^PAQUE1 | 处方表 | — |

### 2.1.6 住院发药/退药

| 表名 | 类名 | Global | 说明 | 规则域 |
|------|------|--------|------|--------|
| DHC_OEDispensing | User.DHCOEDispensing | ^DHCOEDISQTY | 医嘱打包表(发药入口) | d0-pharmacy |
| DHC_OEDispBatch | — | ^DHCOEDISQTY(id,"B",sub) | 打包子表(批次) | — |
| DHC_PHACollected | User.DHCPHACollected | ^DHCPHAC | 住院发药主表 | d0-pharmacy |
| DHC_PHACollectItm | User.DHCPHACollectItm | ^DHCPHAC(id,"I",sub) | 住院发药子表 | d0-pharmacy |
| DHC_PhaCollectItmLB | — | ^DHCPHAC(id,"I",sub,"B",lb) | 住院发药孙表(批次) | — |
| DHC_PhaCollectOutDrug | — | ^DHCPCOD | 出院带药主表 | — |
| DHC_PhaCollectOutDrugDet | — | ^DHCPCOD(id,"L",sub) | 出院带药子表 | — |
| DHC_STDRUGREFUSE | User.DHCSTDRUGREFUSE | ^STDF | 住院拒绝发药表 | d0-pharmacy |
| DHC_PhaRetRequest | — | ^RETRQ | 退药申请主表(V7+) | d0-pharmacy |
| DHC_PhaRetRequestItm | — | ^RETRQ(id,"I",sub) | 退药申请子表 | — |
| DHC_PhaReturn | — | ^PHARET | 退药记录主表 | d0-pharmacy |
| DHC_PhaReturnItm | — | ^PHARET(id,"I",sub) | 退药记录子表 | — |
| DHC_PhaReturnItmLB | — | ^PHARET(id,"I",sub,"LB",lb) | 退药记录孙表(批次) | — |

### 2.1.7 处方审核

| 表名 | 类名 | Global | 说明 | 规则域 |
|------|------|--------|------|--------|
| DHC_PHAORDMONITOR | — | — | 处方审核/拒绝发药主表 | — |
| DHC_PHAORDMONITORLIST | — | — | 处方审核子表 | — |
| DHC_PHCNTSREASON | — | ^DHCPCREASON | 审核拒绝原因 | — |
| DHC_PHCNTSWAY | — | ^DHCPCWAY | 处方点评方式 | — |
| DHC_PHCNTSWAYITM | — | ^DHCPCWAY(id,"I",sub) | 点评方式安全组配置 | — |

### 2.1.5 门诊收费

| 表名 | 类名 | Global | 说明 | 规则域 |
|------|------|--------|------|--------|
| DHC_INVPRT | — | ^DHCINVPRT | 门诊发票主表 | A1-outpatient-invoice |
| DHC_INVPayMode | — | — | 发票支付方式(子表) | A1-outpatient-invoice |
| DHC_BillConINV | — | ^DHCBCI | 账单-发票连接表 | A1-outpatient-invoice |

### 2.1.6 医保

| 表名 | 类名 | Global | 说明 | 规则域 |
|------|------|--------|------|--------|
| INSU_AdmInfo | User.INSUAdmInfo | ^DHCINADM | 医保就诊登记 | A2-insurance |
| INSU_Divide | User.INSUDivide | ^DHCINDIV | 医保费用分解 | A2-insurance |
| INSU_DivideSub | User.INSUDivideSub | — | 医保收费项分解 | A2-insurance |
| INSU_DicData | User.INSUDicData | — | 医保字典 | A2-insurance |
| INSU_TarItems | User.INSUTarItems | — | 医保三大目录 | A2-insurance |
| INSU_TarContrast | User.INSUTarContrast | — | 医保目录对照 | A2-insurance |

---

## 三、住院业务（2.2）

### 3.1 住院登记/就诊

| 表名 | 类名 | Global | 说明 | 规则域 |
|------|------|--------|------|--------|
| PA_AdmTransaction | User.PAAdmTransaction | ^PAADM(adm,"TRANS") | 转科换床记录 | 20-visit |
| PAC_EpisodeSubType | — | — | 就诊子类型(绿色通道) | — |
| PAC_AdmCategory | — | — | 许可分类 | — |

### 3.2 住院计费

| 表名 | 类名 | Global | 说明 | 规则域 |
|------|------|--------|------|--------|
| DHC_PatientBill | User.DHCPatientBill | ^DHCPB(pbId) | 账单主表 | a0-fee-settlement |
| DHC_PatBillOrder | User.DHCPatBillOrder | ^DHCPB(pb,"O",sub) | 账单医嘱子表 | a0-fee-settlement |
| DHC_PatBillDetails | User.DHCPatBillDetails | ^DHCPB(pb,"O",pbo,"D") | 账单明细孙表 | a0-fee-settlement |
| DHC_InvprtZY | — | — | 住院发票 | — |
| dhc_sfprintdetail | — | — | 押金/预交金明细 | — |
| AR_Receipts | — | ^ARRCP | 病人支付记录 | — |
| AR_RcptAlloc | — | — | 支付分配 | — |
| AR_RcptPayMode | — | — | 支付方式 | — |
| DHC_BillCondition | — | — | 计费点设定 | — |

### 3.3 住院发药

| 表名 | 类名 | Global | 说明 | 规则域 |
|------|------|--------|------|--------|
| DHC_PHACollected | User.DHCPHACollected | ^DHCPHAC | 住院发药主表 | d0-pharmacy |
| DHC_PHACollectItm | User.DHCPHACollectItm | ^DHCPHAC(id,"I") | 住院发药从表 | d0-pharmacy |
| DHC_PhaReturn | — | ^pHARET | 退药主表 | d0-pharmacy |
| DHC_PhaReturnItm | — | ^pHARET(id,"I") | 退药子表 | d0-pharmacy |
| DHC_PhaRetRequest | — | — | 退药申请单 | — |
| DHC_STDRUGREFUSE | User.DHCSTDRUGREFUSE | — | 拒绝发药 | — |
| IN_AdjSalePrice | User.INAdjSalePrice | — | 调价表 | — |

### 3.4 手术麻醉

| 表名 | 类名 | Global | 说明 | 规则域 |
|------|------|--------|------|--------|
| DHC_AN_Arrange | User.DHCANArrange | — | 手术排班 | 60-surgery |
| DHC_ANC_OperRoom | — | — | 手术间 | — |
| DHC_AN_Order | User.DHCANOrder | — | 术中医嘱 | 60-surgery |
| DHC_AN_VitalSign | User.DHCANVitalSign | — | 生命体征 | — |

---

## 四、卡账户管理（3.2.10）

| 表名 | 类名 | Global | 说明 | 规则域 |
|------|------|--------|------|--------|
| DHC_CardTypeDef | User.DHCCardTypeDef | — | 卡类型 | A3-card-account |
| DHC_CardRef | User.DHCCardRef | ^DHCCARD("CF") | 就诊卡 | A3-card-account |
| DHC_CardStatusChange | User.DHCCardStatusChange | — | 卡状态变更 | — |
| DHC_AccManager | User.DHCAccManager | ^DHCACD("AccM") | 账户管理 | A3-card-account |
| DHC_AccPreDeposit | User.DHCAccPreDeposit | ^DHCACD("AccM",id,"AccPD") | 预交金流水 | — |
| DHC_AccPayList | User.DHCAccPayList | ^DHCACD("AccM",id,"AccPL") | 消费流水 | — |
| DHC_AccPayINV | User.DHCAccPayINV | ^DHCINVPRTAP | 一卡通集中打印发票 | A3-card-account |
| DHC_AccPayINVMode | User.DHCAccPayINVMode | ^DHCINVPRTAP(id,"Mode",sub) | 集中打印发票支付方式 | — |
| DHC_AccPrePayMode | User.DHCAccPrePayMode | ^DHCACD("AccM",id,"AccPD",sub,"P") | 预交金支付方式 | — |
| DHC_AccPFoot | — | ^DHCACD("AccPF") | 结算对账 | — |
| DHC_AccStatusChange | — | — | 账户状态变更 | — |

---

## 五、统计/报表（3.2.8）

| 表名 | 类名 | Global | 说明 | 规则域 |
|------|------|--------|------|--------|
| DHC_WorkLoad | — | ^DHCWorkLoad | 收入数据(含10+索引: PAADM/PAPMI/OrdDate/BillSub等) | — |
| DHCWorkRegReport | — | — | 挂号统计 | — |
| DHCMRIPDay | — | — | 工作量基础 | — |
| DHC_MRIPDetail | — | — | 工作量明细 | — |
| DHC_MRBed | — | — | 床位维护 | — |

## 六、药库管理（10）

| 表名 | 类名 | Global | 说明 | 规则域 |
|------|------|--------|------|--------|
| DHC_PublicBiddingList | — | ^DHCPBLIST | 招标轮次表 | — |
| DHC_PublicBiddingListItm | — | ^DHCPBLIST(id,"I") | 中标项目子表 | — |
| DHC_ItmVen | — | ^DHCIV | 中标项目表(供应商-项目关联) | — |
| DHC_OperateType | — | ^DHCOPTYPE | 出入库类型表 | — |
| DHC_PlanPoTar | — | ^DHCPPTR | 采购计划-订单对照 | — |
| DHC_PlanPoItmTar | — | ^DHCPPI | 计划明细-订单明细对照 | — |
| DHC_MarkType | — | ^DHCINMT | 定价类型 | — |
| DHC_MarkRule | — | ^DHCINMR | 定价规则 | — |
| DHC_StkMon | — | ^DHCStkMon | 月报主表 | — |
| DHC_StkMonReport | — | ^DHCStkMonReport | 月报子表 | — |
| DHC_InStkTk | — | ^DHCInStkTk | 盘点主表 | — |
| DHC_InIsTrf | — | ^DHCInIsTrf | 库存转移主表 | — |
| DHC_INGdRec | — | ^DHCINGR | 入库主表 | — |
| DHC_INGdRet | — | ^DHCINGRt | 退货主表 | — |

| 表名 | 类名 | Global | 说明 | 规则域 |
|------|------|--------|------|--------|
| DHC_WorkLoad | — | ^DHCWorkLoad | 收入数据(统计核心) | — |
| DHCWorkRegReport | — | — | 挂号统计 | — |
| DHCMRIPDay | — | — | 工作量基础 | — |
| DHC_MRIPDetail | — | — | 工作量明细 | — |
| DHC_MRBed | — | — | 床位维护 | — |

---

## 七、关键字索引（供 grep 搜索）

### 按业务场景

| 关键字 | 相关表 | 规则域 |
|--------|--------|--------|
| 挂号/预约/排班 | RB_Resource, RB_ApptSchedule, RB_Appointment, DHCQueue | 10-registration |
| 就诊/入院/出院 | PA_Adm, PA_AdmTransaction | 20-visit |
| 诊断/ICD | MR_Adm, MR_Diagnos, MRC_ICDDx | 30-diagnosis |
| 医嘱/开嘱 | OE_Order, OE_OrdItem, OE_OrdExec, ARC_ItmMast | 40-order |
| 发药/退药/配药 | DHC_PHDISPEN, DHC_PHACollected, DHC_PhaReturn, DHC_PhaRetRequest | d0-pharmacy |
| 药房配置/窗口/人员 | DHC_PHLOC, DHC_PHWINDOW, DHC_PHPERSON, DHCStkDrugGroup | d0-pharmacy |
| 处方审核/点评 | DHC_PHAORDMONITOR, DHC_PHCNTSREASON, DHC_PHCNTSWAY | — |
| 打包/分发 | DHC_OEDispensing, DHC_OEDispBatch | d0-pharmacy |
| 收费/计费/账单 | DHC_PatientBill, DHC_PatBillDetails, DHC_TarItem | a0-fee-settlement |
| 发票/收据 | DHC_INVPRT, DHC_InvprtZY, DHC_BillConINV | A1-outpatient-invoice |
| 医保/统筹 | INSU_AdmInfo, INSU_Divide | A2-insurance |
| 就诊卡/账户/预交金 | DHC_CardRef, DHC_AccManager, DHC_AccPreDeposit, DHC_AccPayINV | A3-card-account |
| 手术/麻醉 | DHC_AN_Arrange, ORC_Operation | 60-surgery |
| 检验/标本 | CT_Specimen, CT_TestCode | 50-lab-exam |
| 检查/影像/报告 | RBC_Equipment | 55-exam-report |
| 病案/首页 | ZYEMRData | 90-medical-record |
| 科室/病区/床位 | CT_Loc, PAC_Ward, PAC_Bed | 00-dictionary |
| 药品/药学/库存 | PHC_DrgMast, INC_Itm | d0-pharmacy |
| 收费项/物价 | DHC_TarItem, DHC_TarSubCate | 00-dictionary |
| 费别/入院类型 | PAC_AdmReason | 20-visit |
| 转归/出院转归 | PAC_DischargeCondition | 20-visit |
| 药库/入库/退货/调价/盘点 | DHC_INGdRec, DHC_INGdRet, DHC_InStkTk, DHC_InIsTrf, DHC_WorkLoad | — |
| 招标/中标/采购计划 | DHC_PublicBiddingList, DHC_ItmVen, DHC_PlanPoTar | — |
| 药房人员/窗口/科室 | DHC_PHPERSON, DHC_PHWINDOW, DHC_PHLOC | d0-pharmacy |

### 按 Global 前缀

| 前缀 | 包含的表 | 规则域 |
|------|---------|--------|
| ^PAPER | PA_PatMas, PA_Person | 10-patient |
| ^PAADM | PA_Adm, PA_AdmTransaction | 20-visit |
| ^OEORD | OE_Order, OE_OrdItem, OE_OrdExec | 40-order |
| ^ARCIM | ARC_ItmMast | 00-dictionary |
| ^CTLOC | CT_Loc | 00-dictionary |
| ^CTPCP | CT_CareProv | 00-dictionary |
| ^PAWARD | PAC_Ward, PAC_Bed | 00-dictionary |
| ^MR | MR_Adm, MR_Diagnos | 30-diagnosis |
| ^DHCPB | DHC_PatientBill, DHC_PatBillOrder, DHC_PatBillDetails | a0-fee-settlement |
| ^DHCTARI | DHC_TarItem | 00-dictionary |
| ^DHCTarC | DHC_TarSubCate 等费用分类 | 00-dictionary |
| ^DHCCARD | DHC_CardRef | A3-card-account |
| ^DHCACD | DHC_AccManager, DHC_AccPreDeposit, DHC_AccPayList | A3-card-account |
| ^DHCINVPRTAP | DHC_AccPayINV, DHC_AccPayINVMode | A3-card-account |
| ^DHCBCI | DHC_BillConINV | A1-outpatient-invoice |
| ^DHCINTR | 药房台账(发药/退药) | d0-pharmacy |
| ^RBAS | RB_ApptSchedule, RB_Appointment | 10-registration |
| ^DHCINADM | INSU_AdmInfo | A2-insurance |
| ^DHCINDIV | INSU_Divide | A2-insurance |
| ^DHCINVPRT | DHC_INVPRT | A1-outpatient-invoice |

---

## 八、Agent 使用流程

```
新接口文档中出现未知业务术语
  ↓
grep 关键字 → his-table-moc.md
  ↓
找到表名 → 类名 → Global
  ↓
iris_doc(get, "User.XXX.cls") 读取实体类
  ↓
提取 Storage SQLStorage → Node/Piece 映射
  ↓
检查 rules/domains/ 是否已有对应域
  ├─ 有 → 补充缺失字段
  └─ 无 → 按 SOP 创建新域规则
  ↓
markdown_parser.py 验证解析
```
