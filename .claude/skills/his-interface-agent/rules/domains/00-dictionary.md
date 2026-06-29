---
domain: "00-dictionary"
name: "字典域(核心基础)"
version: "1.2.0"
description: "HIS系统核心字典类的取值规则集.包含科室(CTLOC)、医护人员(CTPCP)、系统用户(SSUser)、病区(PACWard)、床位(PACBed)、医嘱项(ARCIM)、收费项目(DHCTarItem)七大核心字典. MCP验证修正版."

sourceClass:
  - name: "User.CTLoc (CTLOC,7)"
    description: "科室地点字典.全局使用最频繁的字典之一."
    keyProperties: "CTLOC_Code/Desc/Type/HospitalDR/ActiveFlag/Floor"
    indexes: "IndexCode/IndexDesc/IndexType(IndexHosp/IndexCategory)"
  - name: "User.CTCareProv (CTPCP,111)"
    description: "医护专业人员字典.含基本信息(sub1)/地址(sub2)/资质与配置(sub3)三节点."
    keyProperties: "CTPCP_Code/Desc/CarPrvTpDR/SpecialistYN/Surgeon/Anaesthetist"
    specialFlags: "Surgeon/Anaesthetist/Radiologist/MentalFlag(精神类药物处方权)"
  - name: "User.SSUser (SSUSR,321)"
    description: "系统用户字典.HIS登录用户,关联CTPCP(医护人员身份)和CTLOC(默认科室)."
    keyProperties: "SSUSR_Name/Initials/LoginID/Active/DoctorFlag/NurseFlag/DefaultDeptDR/cTPCPDR"
  - name: "User.PACWard (wARD,154)"
    description: "病区字典.物理空间层级:医院→科室→病区→房间→床位."
    keyProperties: "WARD_Code/Desc/LocationDR(CTLoc)/Active/SingleRoom/RoomDR"
  - name: "User.PACBed (BED,153)"
    description: "床位字典.父表=PACWard(通过BEDWARDParRef关联)."
    keyProperties: "BED_Code/StatusDR/BedTypeDR/Available(computed)/Isolated/Sex/Sequence"
  - name: "User.ARCItmMast (ARCIM,115)"
    description: "医嘱项/收费项/物品主字典.★复合主键(Subscript+Version).关联频次/剂型/计费子类等众多下游字典."
    keyProperties: "ARCIM_Code/Desc/ItemCatDR(→oRCAT)/pHCDFDR(→处方剂量)/BillSubDR/uOMDR/RMFrequencyDR/GenericDR"
  - name: "User.DHCTarItem (DHCTari,77)"
    description: "★收费项目/物价字典.计费系统的核心!含77个属性(医保/物价/税务/高值耗材/自付比例等).Global=^DHCTARI,15+索引."
    keyProperties: "TARICode/TARIDesc/tARIUOM/TARIPrice/TARIExternalCode/TARIInsuCode/TARIPayType/TARIChargeBasis"
    indexes: "INDEXCode/INDEXDesc/INDEXExternalCode/INDEXInsuName/INDEXIPCate(iNPAT)/INDEXOPCate(oUTPAT)/INDEXPriceCode"

entityGlobals:
  - global: "^CTLOC(ctlocRowId)"
    description: "★科室字典(最高频!). ctlocRowId自增.几乎每个接口都需要查科室名称"
    structure: "^1=代码(Code) ^2=名称(Desc) ^3=glcccDr(成本中心) ^5=WardFlag(病区标识Y/N) ^13=Type(类型:W/E/dI/D/C/O/oP/eM/dS/MR/oR/cL/ADM) ^14=ActiveFlag(Y/N) ^19=HospitalDR(所属医院) ^22=Floor(楼层) ^27=MedicalRecordActive"
    index: "^CTLOC(0,'Code',AlphaUp(Code),RowId) / ^CTLOC(0,'Desc',...) / ^CTLOC(0,'LocType',Type,...)"
  - global: "^CTPCP(ctpcpRowId)"
    description: "★医护人员字典. 三节点结构: sub1=基本/sub2=地址/sub3=资质配置"
    structure: |
      sub1: ^1=Code(工号/编码) ^2=Desc(姓名!) ^3=Id(证件号) ^4=Category(类别) ^6=SMCNo(SMC号) ^7=CarPrvTpDR(人员类型DR→CTCarPrvTp)
      sub2: ^5=AddrTypeDR ^9=CityDR ^10=StateDR ^11=ZipDR ^1=TelO(办公电话) ^3=TelH(家庭电话) ^8=Unit(门牌单元号) [StName→'Add'子节点]
      sub3: ^1=CPGroupDR(分组) ^2=RespUnitDR ^3=CTLOCDR(所属科室DR) ^5=DOB ^14=Radiologist ^33=MentalFlag
      sub1: ^4=CarPrvTpDR(人员类型DR) ^9=ActiveFlag(Y/N) ^10=SpecDR(专科) ^11=SubSpecDR(亚专科) ^16=SpecialistYN
      专业标识: Node1^16=SpecialistYN / Node2^18=Surgeon(Y/N手术医) / Node2^19=Anaesthetist(Y/N麻醉师) / Node3^14=Radiologist(Y/N放射科) / Node3^33=MentalFlag(精神类药物处方权)
      联系方式: ^6=MobilePhone ^7=Fax ^9=Email ^10=PrefConMethod ^25=BestContactTime
      姓名: ^27=FirstName(名) ^28=OtherName(中间名) ^30=Surname(姓) ^49=Title(头衔) ^74=TitleDR
    index: "^CTPCP(0,'Code',Code,RowId) / ^CTPCP(0,'Desc',Desc,...) / ^CTPCP(0,'ID',Id,Desc,...)"
  - global: "^SSU('SSUSR', ssusrRowId)"
    description: "系统用户字典. HIS登录账号,不是医护人员(用CTPCP). 通过CTPCPDR关联到医护人员实体."
    structure: "^1=Initials(缩写) ^2=Name(全名) ^3=Password ^4=DefaultDeptDR(默认科室→CTLoc) ^7=IsThisDoctor(是否医生Y/N) ^9=cTPCPDR(→cTCPP) ^11=Group(安全组→SSGroup) ^14=cTLANDR(语言) ^16=CareProvDR(→CTCareProv) ^19=Active(Y/N) ^78=DoctorFlag ^79=NurseFlag ^81=LoginID(登录账号)"
    index: "^SSU('SSUSR',0,'Name',$$aLPHAUP(Name),RowId) / ^SSU('SSUSR',0,'Initials',...)"
  - global: "^PAWARD(wardRowId)"
    description: "病区字典. 物理空间层级的第二级(科室→病区). 注意: 床位也存放在此Global!"
    structure: "^1=Code(病区编码) ^2=Desc(病区名称) ^3=RoomDR(房间→PACRoom) ^4=SingleRoom(单间Y/N) ^5=LocationDR(所属科室→CTLoc) ^6=Active(Y/N)"
    index: "^PAWARD(0,'wardCode',$$aLPHAUP(Code),RowId) / ^PAWARD(0,'wardDesc',...)"
  - global: "^PAWARD(wardRowId, 'BED', bedChildsub)"
    description: "床位字典. ★注意: 父表是PACWard(BEDWARDParRef),存储在同一个^PAWARD Global中!"
    structure: "^1=Code(床号如'001') ^3=RoomDR(房间→PACRoom) ^5=StatusDR(状态→PACBedStatus) ^6=BedTypeDR(床类型→PACBedType) ^10=Isolated(隔离Y/N) ^23=Sex(M/F) ^24=Sequence(排序序号) ^27=ExtNo(扩展号)"
    computed: "Available = $$cO18^at153(RowId) — 实时计算是否可用(考虑隔离/在院患者等)"
    parentKey: "wardRowId = PAC_Ward.WARD_RowID (必须先有病区才能建床位)"
  - global: "^ARCIM(arcimSubscript, arcimVersion)"
    description: "★医嘱项/收费项/物品主字典. 复合主键! Subscript=自增ID, Version=版本号(通常=1). 所有收费项/药品/非药品/材料的源头!"
    structure: |
      Node1(核心): ^1=Code(项目编码!) ^2=Desc(项目名称!) ^3=Abbrev(缩写,自动取Desc前20字) ^4=uOMDR(基本单位→cTUOM) ^9=ItemCatDR(大类别→ARCItemCat→^OEC('oRCAT')) ^10=ChgCost(单位成本) ^47=BillSubDR(计费子类→ARCBillSub)
      Node1扩展: ^12=pHCDFDR(处方剂量形式→PHCDrgForm) ^50=DoseType(O=单次D=日剂量U=单位) ^76=ServMaterial(S=服务/M=材料) ^179=OwnPayFlag(自费标志)
      Node2(价格): ^1=ChgUnitFact(计价单位因子,默认1) ^8=ChgPostFlg(计费时机:O=开嘱时E=执行时) ^9=ChgDispFlg(I=输入D=显示) ^10=TimeDepFlg(时效性Y/N)
      Node3-4(时段价格): p1-P4四组 ChgFact/StdAddAmt/TypAAddAmt/TypBAddAmt
      Node7(控制): ^11=AllowOrderWOStockCheck(无库存可开嘱?) ^84=VisibleInOrderList(医嘱列表可见?)
      Node8(关联): ^4=ConsultDept(会诊科室→CTLoc) ^14=BillingUOMDR(计价单位→cTUOM) ^16=RMDurationDR(疗程→PHCDuration) ^17=RMFrequencyDR(频次→PHCFreq) ^20=GenericDR(通用药→PHCGeneric) ^22=DefPriorityDR(默认优先级→OECPriority) ^42=AllowInputFreq(允许录入频次)
      版本管理: ^54=Version(版本号) ^58=EffDate(生效日期) ^59=EffTime(生效时间) ^73=EffDateTo(失效日期) ^55=CurVersDR(当前版DR) [Transient]
    index: "^ARCIM(0,'Code',Code,Sub,Vers) / ^ARCIM(0,'Desc',Desc,...) / ^ARCIM(0,'Alias',ShortDesc,...)"
  - global: "^DHCTARI(tariRowId)"
    description: "★收费项目/物价字典. 计费核心! MCP验证78属性(Piece 1~83). ⚠️旧版Piece编号与当前IRIS不一致,以下为MCP验证值."
    structure: |
      ★ MCP验证Piece位置(2026-05-30):
      基础: ^1=Code ^2=Desc ^3=UOM ^4=SubCateDR ^5=AcctCateDR ^6=MRCate(旧病案) ^7=ActiveFlag ^8=Price
            ^9=AlterPrice1 ^10=AlterPrice2 ^11=StartDate ^12=EndDate ^13=ExternalCode ^14=InpatCate
            ^15=OutpatCate ^16=EMCCate ^17=SpecialFlag
      编码: ^18=InsuName ^19=EngName ^20=ChargeBasis ^21=CreateUser ^22=CreateDate ^23=CreateTime
            ^24=MCNew(新病案) ^26=ItemCatDR ^27=Connote ^28=Remark ^29=Exclude ^30=Taxcode ^31=Taxrate
            ^35=FixedPriceFlag ^36=InsuranceMaxPice ^37=PriceCodeBJ ^38=MDMCode ^39=Delivery
            ^40=DelivMedInsureCode ^41=EquipmentCode
      医保: ^42=InsuIPProportion ^43=InsuOPProportion ^44=InsuDJSign ^45=PriceCode
            ^46=StateHVMFlag ^47=ProvHVMFlag ^48=TotalLimitedPrice ^49=ExcessiveType ^50=PriceDesc
      扩展: ^51=ChargeType ^53=SpecialProcurementFlag ^54=InsuCode(国家医保!) ^58=HospHVMFlag
            ^59=PriceRemark ^63=RepeatedChargeFlag ^64=ManufactorType ^65=Spec ^66=AtOwnExpenseFlag
            ^71=HospCode ^72=HospDesc ^73=RegistrationNo ^77=PayType(F/O/P/C) ^78=TodayChargeOnce
            ^81=OPERCategoryDR
    index: "^DHCTARI(0,'Code',Code,RowId) / ^DHCTARI(0,'Desc',Desc,RowId) / ^DHCTARI(0,'ASC',ExtCode,RowId) / ^DHCTARI(0,'InsuName',...)"
    sqlTable: "DHC_TarItem"

relatedDicts:
  - name: "cTUOM (计量单位)"
    global: "^CT('UOM', uomDr)"
    usage: "ARCIM.uOMDR(基本单位) + ARCIM.BillingUOMDR(计价单位) → ^2=单位描述(ml/mg/片/次/袋)"
  - name: "OEC.oRCAT (医嘱大类别)"
    global: "^OEC('oRCAT', catRowId)"
    usage: "ARCIM.ItemCatDR → 此字典 → ^1=类别编码 ^2=类别名称 (药品/非药品/检查/检验/治疗/手术/护理)"
  - name: "CTCarPrvTp (人员类型)"
    global: "^CT('CarPrvTp', dr)"
    usage: "CTPCP.CarPrvTpDR → 医生/护士/技师/药师 等人员类型分类"
  - name: "PHCDrgForm (处方剂量形式)"
    global: "^pHCD(phcdrId, 'dF', phcdfSub)"
    usage: "ARCIM.pHCDFDR → 处方剂量形式(片/粒/支/袋/瓶/盒/口服液/注射液...)"
  - name: "PHCFreq (频次)"
    global: "^pHCF(freqDr)"
    usage: "ARCIM.RMFrequencyDR → 频次字典(qD/tID/qOD/qW/qOD...)"
  - name: "PHCDuration (疗程)"
    global: "^pHCD(durDr)"
    usage: "ARCIM.RMDurationDR → 疗程字典"
  - name: "OECPriority (医嘱优先级/长期临时)"
    global: "^oECP(prfDr)"
    usage: "ARCIM.DefPriorityDR → 默认长期/临时映射"
  - name: "ARCBillSub (计费子类)"
    global: "^aRCSG(billSubDr)"
    usage: "ARCIM.BillSubDR → 计费分类子类"
  - name: "CTHospital (医院机构)"
    global: "^CT('HOSP', hospDr)"
    usage: "CTLOC.HospitalDR → ^7=yLJGDM(医疗机构组织机构代码)"
  - name: "PACBedStatus (床位状态)"
    global: "→PACBedStatus字典"
    usage: "PACBed.StatusDR → 空闲/占用/维修/清理..."
  - name: "PACBedType (床类型)"
    global: "→PACBedType字典"
    usage: "PACBed.BedTypeDR → 普通床/重症床/儿科床/产科床..."
  # ★ 费用分类字典体系 — 共享 Global ^DHCTarC，子类下标区分
  # 所有子类字典结构相同: ^1=Code ^2=Desc ^3=父类DR
  - name: "DHCTarCate (收费大类)"
    global: "^DHCTarC(\"TC\",rowId)"
    usage: "顶层分类，子类通过^3关联"
  - name: "DHCTarSubCate (收费子类)"
    global: "^DHCTarC(\"SC\",rowId)"
    usage: "DHCTarItem.^4=SubCateDR → 收费项目子分类"
  - name: "DHCTarAcctCate (会计子类)"
    global: "^DHCTarC(\"AC\",rowId)"
    usage: "DHCTarItem.^5=AcctCateDR → 会计科目分类"
  - name: "DHCTarAC (会计大类)"
    global: "^DHCTarC(\"TAC\",rowId)"
    usage: "AcctCate的父类"
  - name: "DHCTarOutpatCate (门诊费用子类)"
    global: "^DHCTarC(\"OC\",rowId)"
    usage: "DHCTarItem.^6=OutpatCate → 门诊费用分类"
  - name: "DHCTarOC (门诊大类)"
    global: "^DHCTarC(\"TOC\",rowId)"
    usage: "OutpatCate的父类"
  - name: "DHCTarEMCCate (核算子类)"
    global: "^DHCTarC(\"EC\",rowId)"
    usage: "DHCTarItem.^7=EMCCate → 经济核算分类"
  - name: "DHCTarEC (核算大类)"
    global: "^DHCTarC(\"TEC\",rowId)"
    usage: "EMCCate的父类"
  - name: "DHCTarMRCate (病案子类)"
    global: "^DHCTarC(\"MC\",rowId)"
    usage: "DHCTarItem.^8=MRCate → 病案首页费用分类(旧)"
  - name: "DHCTarMC (病案大类)"
    global: "^DHCTarC(\"TMC\",rowId)"
    usage: "MRCate的父类"
  - name: "DHCTarInpatCate (住院费用子类)"
    global: "^DHCTarC(\"IC\",rowId)"
    usage: "DHCTarItem.^18=InpatCate → 住院费用分类(病案首页用)"
  - name: "DHCTarIC (住院大类)"
    global: "^DHCTarC(\"TIC\",rowId)"
    usage: "InpatCate的父类"
  - name: "ORCOperationCategory (手术级别)"
    global: "ORCOperationCategory"
    usage: "DHCTarItem.TARIOPERCategoryDR → 收费项关联的手术级别"
  - name: "BDPItemCategory (科目类别)"
    global: "User.BDPItemCategory"
    usage: "DHCTarItem.TARIItemCatDR → 科目大类分类"

totalRules: 36
lastUpdated: "2026-05-30"
relatedGlobals:
  - "^CTLOC ★ 科室字典 — 最高频,几乎所有接口用到"
  - "^CTPCP ★ 医护人员 — sub1/sub2/sub3三节点结构,专业标识字段丰富"
  - "^SSU('SSUSR') ★ 系统用户 — 登录账号,通过CTPCPDR桥接到医护人员"
  - "^PAWARD(ward) 病区 — 物理空间,科室下属"
  - "^PAWARD(ward,'BED',sub) 床位 — 父表PACWARD,同一Global嵌套"
  - "^ARCIM(sub,ver) ★ 物品主字典 — 复合主键!所有收费项源头,关联频次/剂型/计费等"
  - "^DHCTARI(tariRowId) ★ 收费项目/物价字典 — 计费核心!77属性,医保/物价/税务/高值耗材/自付比例"
  - "^DHCTarC ★ 费用分类字典体系 — 共享Global,子类下标: SC=收费子类/AC=会计子类/OC=门诊子类/EC=核算子类/MC=病案子类/IC=住院子类"
---

# 字典域 v1.0.0

## 元信息

|| 属性 | 值 ||
|------|-----|
| 域ID | `00-dictionary` |
| 版本 | 1.1.0 |
| 规则数 | 52 (7大字典的核心高频字段) |
| 核心来源 | 7个Persistent类源码(通过iris_doc从IRIS读取) |
| 数据特点 | 全部为字典类(Global直接读取,无复杂链路) |
| 适用范围 | **所有业务域的基础依赖** (01~70 + d0/a0 全部引用) |
| 更新时间 | 2026-05-11 |

## 描述

**HIS系统核心字典类的取值规则集**。本域是整个规则库的"地基"——几乎所有其他域的字段最终都要查这些字典来获取名称、编码或属性。

### 设计原则

1. **字典优先**: 能从字典取的值绝不硬编码
2. **Dr→Name两步走**: 先拿Dr(RowId),再查字典取Desc(名称),这是HIS的标准模式
3. **复合主键警惕**: `^ARCIM` 是唯一一个复合主键字典(Subscript+Version),遍历时需注意
4. **父子嵌套**: PACBed嵌套在PACWard下(共享^PAWARD Global),遍历床位数要先选病区
5. **双视角区分**: ARCIM(医嘱项) vs DHCTarItem(收费项) — 前者关注"怎么开"(频次/剂量/用法),后者关注"怎么收"(价格/医保/物价/税务). 通过ExternalCode关联

---

## 字典关系总览图

```
                    ┌─────────────────────────────────────┐
                    │          CTLOC (科室字典)           │
                    │  Code / Desc / Type / HospitalDR   │
                    └──────┬──────────┬──────────┬────────┘
                           │          │          │
              ┌────────────┘          │          └──────────┐
              ▼                       ▼                     ▼
     ┌─────────────┐        ┌──────────────┐     ┌──────────────┐
     │ CTCareProv   │        │ PACWard       │     │ SSUser       │
     │ (医护人员)   │        │ (病区)        │     │ (系统用户)    │
     │ sub1/2/3三节点│        │ LocationDR───┼────►│ cTPCPDR─────┼┐
     │ Surgeon等标识 │        │ RoomDR       │     │ DefaultDeptDR├┤
     └──────┬────────┘        └──────┬───────┘     └──────────────┘│
            │                        │                              │
            ▼                        ▼                              │
     (被OEORD引用)             ┌──────────┐                      │
     医嘱中的                  │ PACBed   │                      │
     docDr/cpDr               │ (床位)   │◄───── Parent=PACWard     │
                             │ Code     │                      │
                             │ Sex/M    │                      │
                             └──────────┘                      │
                                                              │
     ┌──────────────────────────────────────────────────────────┘
     │
     ▼
     ┌─────────────────┐
 │ ARCItmMast      │ ← ★ 复合主键 (Subscript + Version)
 │ (医嘱项/物品)   │
 │                 │
 │ ItemCatDR ──────┼──► ^OEC("oRCAT") 大类别字典
 │ pHCDFDR ────────┼──► ^pHCD 处方剂量形式字典
 │ RMFrequencyDR ──┼──► ^pHCF 频次字典
 │ RMDurationDR ───┼──► ^pHCD 疗程字典
 │ BillSubDR ──────┼──► ^aRCSG 计费子类字典
 │ uOMDR/Billing..┼──► ^CT("UOM") 单位字典
 │ GenericDR ──────┼──► ^PHCGeneric 通用药字典
 │ DefPriorityDR ──┼──► ^oECP 优先级字典
 │                 │
 └─────────────────┘

     ┌───────────────────────────────┐
     │ DHCTarItem (收费项目/物价字典) │ ← ★计费核心! 77属性
     │ Global: ^DHCTARI              │
     │                               │
     │ tARIUOM ──────────────────────┼──► ^CT("UOM") 单位
     │ TARISubCate ──────────────────┼──► User.DHCTarSubCate 子类
     │ TARIInpatCate/OutpatCate ─────┼──► 住院/门诊费用子类
     │ TARIOPERCategoryDR ───────────┼──► ORCOperationCategory 手术级别
     │ TARIItemCatDR ────────────────┼──► BDPItemCategory 科目类别
     │                               │
     │ 与ARCIM关系:                   │
     │ ARCIM=医嘱开立视角             │
     │ DHCTarItem=收费计价视角        │
     │ 通过ExternalCode做关联映射      │
     └───────────────────────────────┘
```


### Template E: DHCTarItem收费项目遍历(含医保信息)

```objectscript
s tariRowId = ""
f  s tariRowId = $o(^DHCTARI(tariRowId)) q:tariRowId=""  d
|. s active = $p($g(^DHCTARI(tariRowId)), "^", 11)
|. i active'="Y" q
|. s code    = $p($g(^DHCTARI(tariRowId)), "^", 1)
|. s desc    = $p($g(^DHCTARI(tariRowId)), "^", 2)
|. s price   = $p($g(^DHCTARI(tariRowId)), "^", 8)
|. s extCode = $p($g(^DHCTARI(tariRowId)), "^", 13)
|. s insuCode= $p($g(^DHCTARI(tariRowId)), "^", 54)
|. s ipRatio = $p($g(^DHCTARI(tariRowId)), "^", 42)
|. s payType = $p($g(^DHCTARI(tariRowId)), "^", 77)
|. s inpatCate = $p($g(^DHCTARI(tariRowId)), "^", 14)
```

### Template F: 通过ExternalCode反向查找收费项

```objectscript
s targetExtCode = "440101"
s findRowId = ""
s findRowId = $o(^DHCTARI(0,"aSC",targetExtCode,findRowId))
i findRowId="" d
|. w !, "Not found: "_targetExtCode
|. q
s foundCode = $p($g(^DHCTARI(findRowId)), "^", 1)
s foundDesc = $p($g(^DHCTARI(findRowId)), "^", 2)
w !, "Found RowId="_findRowId_" Code="_foundCode_" Desc="_foundDesc
```
---

## 字段映射规则

### 一、CTLOC 科室字典

#### LOC-001: CTLOC_CODE (科室代码)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `ctlocCode` |
| 匹配模式 | | 标准名 | `ctlocCode` |, | 标准名 | `ctlocCode` |, | 标准名 | `ctloc_code` | |
| 取值表达式 | `$p($g(^CTLOC(locDr)), "^", 1)` |
| Global | `^CTLOC(locDr)` |
| 下标路径 | `^CTLOC(locDr)^1` |
| 置信度 | 0.99 |
| 来源 | `User.CTLoc.cls` |

```objectscript
s locCode = $p($g(^CTLOC(locDr)), "^", 1)
; 例: locDr=123 → "oUTP201" 或 "iNP301"
```

#### LOC-002: CTLOC_DESC (科室名称)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `ctlocDesc` |
| 匹配模式 | | 标准名 | `ctlocDesc` |, | 标准名 | `ctlocDesc` |, | 标准名 | `ctloc_desc` | |
| 取值表达式 | `$p($g(^CTLOC(locDr)), "^", 2)` |
| Global | `^CTLOC(locDr)^2` |
| 置信度 | 0.99 |

```objectscript
s locDesc = $p($g(^CTLOC(locDr)), "^", 2)
; 例: "门诊内科" / "住院部心内科一病区"
```

#### LOC-003: CTLOC_TYPE (科室类型)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `ctlocType` |
| 匹配模式 | | 标准名 | `ctlocType` |, | 标准名 | `ctlocType` |, | 标准名 | `ctloc_type` | |
| 取值表达式 | `$p($g(^CTLOC(locDr)), "^", 13)` |
| 枚举值 | `W=病区 / E=执行 / dI=注射 / D=发药 / C=收银 / O=其他 / oP=手术室 / eM=急诊 / dS=日间手术 / MR=病案 / oR=门诊诊室 / cL=诊所 / ADM=入院登记处` |
| Global | `^CTLOC(locDr)^13` |
| 置信度 | 0.95 |

```objectscript
s locType = $p($g(^CTLOC(locDr)), "^", 13)
; ⚠️ 这是VALUELIST枚举,不是自由文本!
; 最常用判断: W=住院病区类 / E=执行科室(检验/检查) / oR=门诊诊室
```

#### LOC-004: CTLOC_HOSPITAL_DR (所属医院)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `ctlocHospitalDr` |
| 匹配模式 | | 标准名 | `ctlocHospitalDr` |, | 标准名 | `ctlocHospitalDr` |, | 标准名 | `ctloc_hospital_dr` | |
| 取值表达式 | `$p($g(^CTLOC(locDr)),"^",22)` |
| 下游 | `^CT("HOSP", hospDr)^7` → yLJGDM(医疗机构组织机构代码) |
| Global | `^CTLOC(locDr)^22` |
| 置信度 | 0.99 |
| MCP验证 | ✅ Piece 22 = CTLOC_Hospital_DR (2026-05-30 MCP确认) |

```objectscript
s locHospitalDr = $p($g(^CTLOC(locDr)), "^", 22)
s yLJGDM = $p($g(^CT("HOSP", locHospitalDr)), "^", 7)  ; 机构代码
```

#### LOC-005: CTLOC_ACTIVE_FLAG (科室有效标识)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `ctlocActiveFlag` |
| 匹配模式 | | 标准名 | `ctlocActiveFlag` |, | 标准名 | `ctlocActiveFlag` |, | 标准名 | `ctloc_active_flag` | |
| 取值表达式 | `$p($g(^CTLOC(locDr)), "^", 14)` |
| 枚举值 | `Y=有效 / N=无效` |
| Global | `^CTLOC(locDr)^14` |
| 置信度 | 0.95 |

```objectscript
s locActive = $p($g(^CTLOC(locDr)), "^", 14)
i locActive="N" q  ; 无效科室跳过
```

#### LOC-006: CTLOC_FLOOR (楼层)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `ctlocFloor` |
| 匹配模式 | | 标准名 | `ctlocFloor` |, | 标准名 | `ctlocFloor` |, | 标准名 | `ctloc_floor` | |
| 取值表达式 | `$p($g(^CTLOC(locDr)), "^", 16)` |
| Global | `^CTLOC(locDr)^16` |
| 置信度 | 0.85 |

```objectscript
s locFloor = $p($g(^CTLOC(locDr)), "^", 16)
; 例: "3F" / "10楼" / "B1地下室"
```

#### LOC-007: CTLOC_WARD_FLAG (病区标识)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `ctlocWardFlag` |
| 匹配模式 | | 标准名 | `ctlocWardFlag` |, | 标准名 | `ctlocWardFlag` |, | 标准名 | `ctloc_ward_flag` | |
| 取值表达式 | `$p($g(^CTLOC(locDr)), "^", 5)` |
| 用途 | 区分"科室"还是"病区"(W=Y的是病区) |
| Global | `^CTLOC(locDr)^5` |
| 置信度 | 0.88 |

```objectscript
s isWard = $p($g(^CTLOC(locDr)), "^", 5")
; W=Y → 这是一个病区(有床位管理)
; W=N 或空 → 普通科室(无床位)
```

---

### 二、CTPCP 医护人员字典

> **⚠️ 重要**: CTPCP有三个数据节点(sub1/sub2/sub3)! 不同信息分布在不同节点!

#### CP-001: CTPCP_CODE (人员工号/编码)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `ctpcpCode` |
| 匹配模式 | | 标准名 | `ctpcpCode` |, | 标准名 | `ctpcpCode` |, | 标准名 | `ctpcp_code` | |
| 取值表达式 | `$p($g(^CTPCP(cpDr)), "^", 1)` |
| Global | `^CTPCP(cpDr)` → **Node 1** |
| 下标路径 | `^CTPCP(cpDr)^1` |
| 置信度 | 0.98 |

```objectscript
s cpCode = $p($g(^CTPCP(cpDr)), "^", 1)
; 例: "dOC001" / "nUR088"
```

#### CP-002: CTPCP_DESC (人员姓名 ★最重要)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `ctpcpDesc` |
| 匹配模式 | | 标准名 | `ctpcpDesc` |, | 标准名 | `ctpcpDesc` |, | 标准名 | `ctpcp_desc` | |
| 别名 | docName, 医生姓名, 护士姓名, 操作人姓名 |
| 取值表达式 | `$p($g(^CTPCP(cpDr)), "^", 2)` |
| Global | `^CTPCP(cpDr)^2` (Node 1) |
| 置信度 | **0.99** (最高频之一) |

```objectscript
s cpName = $p($g(^CTPCP(cpDr)), "^", 2)
; ★ 这是最常用的取值! 医嘱中的docDr → CTPCP → ^2 = 姓名
```

#### CP-003: CTPCP_CarPrvTpDR (人员类型)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `CTPCP_CarPrvTpDR` |
| 匹配模式 | | 标准名 | `CTPCP_CarPrvTpDR` |, | 标准名 | `ctpcpCarprvtpdr` |, | 标准名 | `ctpcp_carprvtpdr` | |
| 取值表达式 | `$p($g(^CTPCP(cpDr)),"^",4)` |
| 节点 | **Node 1** (MCP确认: Piece 4 = CTPCP_CarPrvTp_DR) |
| 下游 | `^CT("CarPrvTp", dr)` → 医生/护士/技师/药师... |
| Global | `^CTPCP(cpDr,1)^4` |
| 置信度 | 0.99 |
| MCP验证 | ✅ Node1 Piece 4 (2026-05-30确认) |

```objectscript
s cpTypeDr = $p($g(^CTPCP(cpDr)), "^", 4)
s cpTypeDesc = $p($g(^CT("CarPrvTp",cpTypeDr)),"^",2)
; 返回: "Doctor" / "Nurse" / "Tech" / "Pharmacist" ...
```

#### CP-004: CTPCP_CTLOCDR (所属科室)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `ctpcpCtlocdr` |
| 匹配模式 | | 标准名 | `ctpcpCtlocdr` |, | 标准名 | `ctpcpCtlocdr` |, | 标准名 | `ctpcp_ctlocdr` | |
| 取值表达式 | `$p($g(^CTPCP(cpDr, 3)), "^", 3)` |
| 注意 | **Node 3!** 不是Node 1也不是Node 2 |
| Global | `^CTPCP(cpDr, 3)^3` |
| 置信度 | 0.94 |

```objectscript
s cpDeptDr = $p($g(^CTPCP(cpDr, 3)), "^", 3)
s cpDeptName = $p($g(^CTLOC(cpDeptDr)), "^", 2)  ; 科室名称
```

#### CP-005: CTPCP_Surgeon (手术医标识)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `ctpcpSurgeonFlag` |
| 匹配模式 | | 标准名 | `ctpcpSurgeonFlag` |, | 标准名 | `ctpcpSurgeonFlag` |, | 标准名 | `ctpcp_surgeon_flag` | |
| 取值表达式 | `$p($g(^CTPCP(cpDr, 2)), "^", 18)` |
| 节点 | **Node 2** |
| 枚举值 | `Y=是手术医 / N=否` |
| Global | `^CTPCP(cpDr, 2)^18` |
| 置信度 | 0.90 |
| 业务场景 | 手术域(60-surgery)排班/权限控制 |

```objectscript
s isSurgeon = $p($g(^CTPCP(cpDr, 2)), "^", 18)
i isSurgeon="Y" d  .  ; 可以安排手术
```

#### CP-006: CTPCP_Anaesthetist (麻醉师标识)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `ctpcpAnaesthetistFlag` |
| 匹配模式 | | 标准名 | `ctpcpAnaesthetistFlag` |, | 标准名 | `ctpcpAnaesthetistFlag` |, | 标准名 | `ctpcp_anaesthetist_flag` | |
| 取值表达式 | `$p($g(^CTPCP(cpDr,3)),"^",14)` |
| 节点 | **Node 3** (MCP确认: Node3 Piece 14 = CTPCP_Radiologist) |
| Global | `^CTPCP(cpDr,3)^14` |
| 置信度 | 0.99 |
| MCP验证 | ✅ Node3 Piece 14 (2026-05-30确认) |

#### CP-007: CTPCP_Radiologist (放射科标识)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `ctpcpRadiologistFlag` |
| 匹配模式 | | 标准名 | `ctpcpRadiologistFlag` |, | 标准名 | `ctpcpRadiologistFlag` |, | 标准名 | `ctpcp_radiologist_flag` | |
| 取值表达式 | `$p($g(^CTPCP(cpDr, 3)), "^", 14)` |
| 节点 | **Node 3** |
| Global | `^CTPCP(cpDr, 3)^14` |
| 置信度 | 0.88 |

#### CP-008: CTPCP_MentalFlag (精神类药物处方权)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `ctpcpMentalFlag` |
| 匹配模式 | | 标准名 | `ctpcpMentalFlag` |, | 标准名 | `ctpcpMentalFlag` |, | 标准名 | `ctpcp_mental_flag` | |
| 取值表达式 | `$p($g(^CTPCP(cpDr, 3)), "^", 33)` |
| 节点 | Node 3 |
| Global | `^CTPCP(cpDr, 3)^33` |
| 置信度 | 0.85 |
| 业务场景 | 特殊药品(精一/精二/麻精)开嘱权限校验 |

#### CP-009: CTPCP_PrescriberNumber (处方权编号)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `ctpcpPrescriberNo` |
| 匹配模式 | | 标准名 | `ctpcpPrescriberNo` |, | 标准名 | `ctpcpPrescriberNo` |, | 标准名 | `ctpcp_prescriber_no` | |
| 取值表达式 | `$p($g(^CTPCP(cpDr, 2)), "^", 20)` |
| 节点 | Node 2 |
| Global | `^CTPCP(cpDr, 2)^20` |
| 置信度 | 0.90 |
| 说明 | 卫健委备案的处方权/执业资格证编号 |

#### CP-010: CTPCP_ActiveFlag (有效标识)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `ctpcpActiveFlag` |
| 匹配模式 | | 标准名 | `ctpcpActiveFlag` |, | 标准名 | `ctpcpActiveFlag` |, | 标准名 | `ctpcp_active_flag` | |
| 取值表达式 | `$p($g(^CTPCP(cpDr)),"^",9)` |
| 节点 | **Node 1** (MCP确认: Node1 Piece 9 = CTPCP_ActiveFlag) |
| Global | `^CTPCP(cpDr,1)^9` |
| 置信度 | 0.99 |
| MCP验证 | ✅ Node1 Piece 9 (2026-05-30确认) |
| 枚举 | `Y=在职有效 / N=已离职停用` |

#### CP-011: CTPCP_SpecDR (专科DR)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `ctpcpSpecDr` |
| 匹配模式 | | 标准名 | `ctpcpSpecDr` |, | 标准名 | `ctpcpSpecDr` |, | 标准名 | `ctpcp_spec_dr` | |
| 取值表达式 | `$p($g(^CTPCP(cpDr, 1)), "^", 10)` |
| 节点 | Node 1 |
| 下游 | `^CTSpec(specDr)` → 内科/外科/妇产科/儿科... |
| Global | `^CTPCP(cpDr, 1)^10` |
| 置信度 | 0.91 |

#### CP-012: CTPCP_SubSpecDR (亚专科DR)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `ctpcpSubspecDr` |
| 匹配模式 | | 标准名 | `ctpcpSubspecDr` |, | 标准名 | `ctpcpSubspecDr` |, | 标准名 | `ctpcp_subspec_dr` | |
| 取值表达式 | `$p($g(^CTPCP(cpDr, 1)), "^", 11)` |
| 节点 | Node 1 |
| 下游 | `^CTSpec` (同一字典,亚专科级别) |
| Global | `^CTPCP(cpDr, 1)^11` |
| 置信度 | 0.89 |

---

### 三、SSUser 系统用户字典

#### SU-001: SSUSR_NAME (用户姓名)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `ssusrName` |
| 匹配模式 | | 标准名 | `ssusrName` |, | 标准名 | `ssusrName` |, | 标准名 | `ssusr_name` | |
| 取值表达式 | `$p($g(^SSU("SSUSR", userDr)), "^", 2)` |
| Global | `^SSU("SSUSR", userDr)^2` |
| 置信度 | 0.97 |

```objectscript
s userName = $p($g(^SSU("SSUSR", userDr)), "^", 2)
```

#### SU-002: SSUSR_LOGIN_ID (登录账号)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `ssusrLoginId` |
| 匹配模式 | | 标准名 | `ssusrLoginId` |, | 标准名 | `ssusrLoginId` |, | 标准名 | `ssusr_login_id` | |
| 取值表达式 | `$p($g(^SSU("SSUSR", userDr)), "^", 81)` |
| Global | `^SSU("SSUSR", userDr)^81` |
| 置信度 | 0.96 |

```objectscript
s loginId = $p($g(^SSU("SSUSR", userDr)), "^", 81)
; 例: "admin" / "zhangsan" / "lisi"
```

#### SU-003: SSUSR_CTPCPDR (关联医护人员)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `ssusrCtpcpDr` |
| 匹配模式 | | 标准名 | `ssusrCtpcpDr` |, | 标准名 | `ssusrCtpcpDr` |, | 标准名 | `ssusr_ctpcp_dr` | |
| 取值表达式 | `$p($g(^SSU("SSUSR", userDr)), "^", 9)` |
| 下游 | `→ ^CTPCP(dr)^2` 获取真实姓名 |
| Global | `^SSU("SSUSR", userDr)^9` |
| 置信度 | 0.93 |
| 说明 | **关键桥梁字段**! SSUser本身不存姓名细节,要通过此Dr查CTPCP |

```objectscript
s userCpDr = $p($g(^SSU("SSUSR", userDr)), "^", 9)
s realName = $g(^CTPCP(userCpDr))^2  ; 桥接到CTPCP取姓名
```

#### SU-004: SSUSR_DEFAULTDEPT_DR (默认科室)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `ssusrDefaultDeptDr` |
| 匹配模式 | | 标准名 | `ssusrDefaultDeptDr` |, | 标准名 | `ssusrDefaultDeptDr` |, | 标准名 | `ssusr_default_dept_dr` | |
| 取值表达式 | `$p($g(^SSU("SSUSR", userDr)), "^", 4)` |
| 下游 | `→ ^CTLOC(dr)^2` 科室名称 |
| Global | `^SSU("SSUSR", userDr)^4` |
| 置信度 | 0.91 |

#### SU-005: SSUSR_DOCTOR_FLAG (医生标识)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `ssusrDoctorFlag` |
| 匹配模式 | | 标准名 | `ssusrDoctorFlag` |, | 标准名 | `ssusrDoctorFlag` |, | 标准名 | `ssusr_doctor_flag` | |
| 取值表达式 | `$p($g(^SSU("SSUSR", userDr)), "^", 78)` |
| 枚举 | `Y=医生 / N=非医生` |
| Global | `^SSU("SSUSR", userDr)^78` |
| 置信度 | 0.92 |

#### SU-006: SSUSR_NURSE_FLAG (护士标识)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `ssusrNurseFlag` |
| 匹配模式 | | 标准名 | `ssusrNurseFlag` |, | 标准名 | `ssusrNurseFlag` |, | 标准名 | `ssusr_nurse_flag` | |
| 取值表达式 | `$p($g(^SSU("SSUSR", userDr)), "^", 79)` |
| 枚举 | `Y=护士 / N=非护士` |
| Global | `^SSU("SSUSR", userDr)^79` |
| 置信度 | 0.92 |

#### SU-007: SSUSR_ACTIVE (用户有效)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `ssusrActive` |
| 匹配模式 | | 标准名 | `ssusrActive` |, | 标准名 | `ssusrActive` |, | 标准名 | `ssusr_active` | |
| 取值表达式 | `$p($g(^SSU("SSUSR", userDr)), "^", 19)` |
| Global | `^SSU("SSUSR", userDr)^19` |
| 置信度 | 0.96 |

---

### 四、PACWard 病区字典

#### WD-001: WARD_CODE (病区代码)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `wardCode` |
| 匹配模式 | | 标准名 | `wardCode` |, | 标准名 | `wardCode` |, | 标准名 | `ward_code` | |
| 取值表达式 | `$p($g(^PAWARD($p($g(^PAADM(admId)),"^",70))),"^",1)` |
| Global | `^PAWARD(wardDr)^1` |
| 置信度 | 0.98 |

```objectscript
s wardCode = $p($g(^PAWARD(wardDr)), "^", 1)
; 例: "iCU01" / "cARDIO01" / "rESP01"
```

#### WD-002: WARD_DESC (病区名称)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `wardDesc` |
| 匹配模式 | | 标准名 | `wardDesc` |, | 标准名 | `wardDesc` |, | 标准名 | `ward_desc` | |
| 取值表达式 | `$p($g(^PAWARD(wardDr)), "^", 2)` |
| Global | `^PAWARD(wardDr)^2` |
| 置信度 | 0.98 |

```objectscript
s wardDesc = $p($g(^PAWARD(wardDr)), "^", 2)
; 例: "重症监护室(iCU)" / "心血管内科一病区"
```

#### WD-003: WARD_LOCATION_DR (所属科室)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `wardLocationDr` |
| 匹配模式 | | 标准名 | `wardLocationDr` |, | 标准名 | `wardLocationDr` |, | 标准名 | `ward_location_dr` | |
| 取值表达式 | `$p($g(^PAWARD(wardDr)), "^", 5)` |
| 下游 | `→ ^CTLOC(dr)^2` 科室名称 |
| Global | `^PAWARD(wardDr)^5` |
| 置信度 | 0.95 |
| 说明 | **病区归属科室** — 一个科室可以有多个病区 |

#### WD-004: WARD_ACTIVE (病区有效)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `wardActive` |
| 匹配模式 | | 标准名 | `wardActive` |, | 标准名 | `wardActive` |, | 标准名 | `ward_active` | |
| 取值表达式 | `$p($g(^PAWARD(wardDr)), "^", 6)` |
| Global | `^PAWARD(wardDr)^6` |
| 置信度 | 0.95 |

#### WD-005: WARD_SINGLE_ROOM (单间病区)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `wardSingleRoom` |
| 匹配模式 | | 标准名 | `wardSingleRoom` |, | 标准名 | `wardSingleRoom` |, | 标准名 | `ward_single_room` | |
| 取值表达式 | `$p($g(^PAWARD(wardDr)), "^", 4)` |
| 枚举 | `Y=单间 / N=多人间`(默认) |
| Global | `^PAWARD(wardDr)^4` |
| 置信度 | 0.87 |
| 场景 | 收费/隐私保护/特殊感染隔离 |

---

### 五、PACBed 床位字典

> **⚠️ 特殊结构**: PACBed 的父表是 PACWard,共享 `^PAWARD` Global!

#### BED-001: BED_CODE (床号)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `bedCode` |
| 匹配模式 | | 标准名 | `bedCode` |, | 标准名 | `bedCode` |, | 标准名 | `bed_code` | |
| 取值表达式 | `$p($g(^pAWARDBED($p($g(^PAADM(admId)),"^",73))),"^",1)` |
| Global | `^PAWARD(wardDr, "BED", bedSub)^1` |
| 双主键 | `wardDr`(来自父表PACWard) + `bedSub`(床位自增ID) |
| 置信度 | 0.98 |

```objectscript
s bedCode = $p($g(^PAWARD(wardDr, "BED", bedSub)), "^", 1)
; 例: "001" "002" "003" ... 通常3位数字
; wardDr = PAC_Ward.WARD_RowID (必须先选定病区!)
```

#### BED-002: BED_STATUS_DR (床位状态)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `bedStatusDr` |
| 匹配模式 | | 标准名 | `bedStatusDr` |, | 标准名 | `bedStatusDr` |, | 标准名 | `bed_status_dr` | |
| 取值表达式 | `$p($g(^PAWARD(wardDr, "BED", bedSub)), "^", 5)` |
| 下游 | `→ PACBedStatus` 字典 (空闲/占用/维修/清理/隔离) |
| Global | `^PAWARD(wardDr, "BED", bedSub)^5` |
| 置信度 | 0.95 |

#### BED-003: BED_BEDTYPE_DR (床类型)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `bedBedtypeDr` |
| 匹配模式 | | 标准名 | `bedBedtypeDr` |, | 标准名 | `bedBedtypeDr` |, | 标准名 | `bed_bedtype_dr` | |
| 取值表达式 | `$p($g(^PAWARD(wardDr, "BED", bedSub)), "^", 2)` |
| 下游 | `→ PACBedType` 字典 (普床/重症床/儿科床/产床/烧伤悬浮床...) |
| Global | `^PAWARD(wardDr, "BED", bedSub)^2` |
| 置信度 | 0.90 |

#### BED-004: BED_ISOLATED (隔离标识)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `bedIsolated` |
| 匹配模式 | | 标准名 | `bedIsolated` |, | 标准名 | `bedIsolated` |, | 标准名 | `bed_isolated` | |
| 取值表达式 | `$p($g(^PAWARD(wardDr, "BED", bedSub)), "^", 6)` |
| 枚举 | `Y=隔离 / N=正常` |
| Global | `^PAWARD(wardDr, "BED", bedSub)^6` |
| 置信度 | 0.90 |
| 扩展 | 如Y则还有 IsolatedDateFrom/To 和 IsolatedTimeFrom/To |

#### BED-005: BED_SEX (适用性别)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `bedSex` |
| 匹配模式 | | 标准名 | `bedSex` |, | 标准名 | `bedSex` |, | 标准名 | `bed_sex` | |
| 取值表达式 | `$p($g(^PAWARD(wardDr, "BED", bedSub)), "^", 23)` |
| 枚举 | `M=男 / F=女` |
| Global | `^PAWARD(wardDr, "BED", bedSub)^23` |
| 置信度 | 0.88 |
| 说明 | 2020年新增,用于性别分床管理 |

#### BED-006: BED_AVAILABLE (可用性 ★计算字段)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `bedAvailable` |
| 匹配模式 | | 标准名 | `bedAvailable` |, | 标准名 | `bedAvailable` |, | 标准名 | `bed_available` | |
| 取值表达式 | `$$cO18^at153(bedRowId)` (SQL Computed, Transient) |
| 说明 | **实时计算**! 不是简单存储值,而是综合考虑隔离/在院患者/清洁状态的动态结果 |
| Global | `-` (计算得出) |
| 置信度 | 0.85 |
| ⚠️ | ObjectScript中不能直接赋值此字段,它是只读计算列 |

---

### 六、ARCItmMast 医嘱项/物品主字典

> **⚠️⚠️⚠️ 最特殊的字典!** 复合主键 `(Subscript, Version)`! 遍历和查询时务必注意!

#### IM-001: ARCIM_CODE (项目编码)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `arcimCode` |
| 匹配模式 | | 标准名 | `arcimCode` |, | 标准名 | `arcimCode` |, | 标准名 | `arcim_code` | |
| 别名 | orderItemCode, yPDM, 项目编码, 收费编码 |
| 取值表达式 | `$p($g(^ARCIM(imSub, imVer, 1)), "^", 1)` |
| Global | `^ARCIM(imSub, imVer, 1)^1` (**Node 1**) |
| 双主键 | `imSub`(自增Subscript) + `imVer`(版本号,通常=1) |
| 置信度 | **0.99** (核心中的核心) |

```objectscript
; ★ 典型用法(从ordData1解析):
s tArcimStr = $p(ordData1,"^",2)   ; 格式: main||ver
s arcimMain = $p(tArcimStr,"||",1)
s arcimVer  = $p(tArcimStr,"||",2)
s imCode = $p($g(^ARCIM(arcimMain, arcimVer, 1)), "^", 1)
```

#### IM-002: ARCIM_DESC (项目名称)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `arcimDesc` |
| 匹配模式 | | 标准名 | `arcimDesc` |, | 标准名 | `arcimDesc` |, | 标准名 | `arcim_desc` | |
| 别名 | orderItemName, yPMC, 项目名称, 收费项名称 |
| 取值表达式 | `$p($g(^ARCIM(imSub, imVer, 1)), "^", 2)` |
| Global | `^ARCIM(imSub, imVer, 1)^2` (Node 1) |
| 置信度 | **0.99** |

#### IM-003: ARCIM_UOM_DR (基本单位)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `arcimUomDr` |
| 匹配模式 | | 标准名 | `arcimUomDr` |, | 标准名 | `arcimUomDr` |, | 标准名 | `arcim_uom_dr` | |
| 取值表达式 | `$p($g(^ARCIM(imSub, imVer, 1)), "^", 4)` |
| 下游 | `^CT("UOM", uomDr)^2` → 单位描述(ml/mg/g/片/支/次/袋/瓶/盒...) |
| Global | `^ARCIM(..., 1)^4` (Node 1) |
| 置信度 | 0.96 |

#### IM-004: ARCIM_ITEMCAT_DR (大类别→ORCAT)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `arcimItemcatDr` |
| 匹配模式 | | 标准名 | `arcimItemcatDr` |, | 标准名 | `arcimItemcatDr` |, | 标准名 | `arcim_itemcat_dr` | |
| 取值表达式 | `$p($g(^ARCIM(imSub, imVer, 1)), "^", 10)` |
| 下游 | `^OEC("oRCAT", catDr)` → ^1=编码 ^2=名称 (药品/非药品/检查/检验/治疗/手术/护理/其他) |
| Global | `^ARCIM(..., 1)^10` (Node 1) |
| 置信度 | 0.95 |
| 说明 | zz-custom zZ-009/zZ-010 就是用这个字段 |

#### IM-005: ARCIM_CHG_COST (单位成本)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `arcimChgCost` |
| 匹配模式 | | 标准名 | `arcimChgCost` |, | 标准名 | `arcimChgCost` |, | 标准名 | `arcim_chg_cost` | |
| 取值表达式 | `$p($g(^ARCIM(imSub, imVer, 2)), "^", 2)` |
| 注意 | **Node 2!** 价格相关字段在第二个节点 |
| Global | `^ARCIM(imSub, imVer, 2)^2` |
| 置信度 | 0.93 |
| 类型 | `%Float` 数值型(金额) |

#### IM-006: ARCIM_PHCDF_DR (处方剂量形式)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `arcimPhcdfDr` |
| 匹配模式 | | 标准名 | `arcimPhcdfDr` |, | 标准名 | `arcimPhcdfDr` |, | 标准名 | `arcim_phcdf_dr` | |
| 取值表达式 | `$p($g(^ARCIM(imSub, imVer, 1)), "^", 12)` |
| 下游 | `^pHCD(phcdrId, "dF", phcdfSub)` → 剂量形式(片/粒/支/袋/瓶/盒/口服液/注射液/软膏/滴眼液/栓剂...) |
| Global | `^ARCIM(..., 1)^12` (Node 1) |
| 置信度 | 0.94 |
| 关联 | d0-pharmacy域的 GetEqUomStr() 方法依赖于此 |

#### IM-007: ARCIM_BILL_SUB_DR (计费子类)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `arcimBillSubDr` |
| 匹配模式 | | 标准名 | `arcimBillSubDr` |, | 标准名 | `arcimBillSubDr` |, | 标准名 | `arcim_bill_sub_dr` | |
| 取值表达式 | `$p($g(^ARCIM(imSub, imVer, 1)), "^", 9)` |
| 下游 | `^aRCSG(billSubDr)` → 计费分类子类 |
| Global | `^ARCIM(..., 1)^9` (Node 1) |
| 置信度 | 0.92 |

#### IM-008: ARCIM_DoseType (剂量类型)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `arcimDoseType` |
| 匹配模式 | | 标准名 | `arcimDoseType` |, | 标准名 | `arcimDoseType` |, | 标准名 | `arcim_dose_type` | |
| 取值表达式 | `$p($g(^ARCIM(imSub, imVer, 1)), "^", 5)` |
| 枚举 | `O=One Dose(单次) / D=Daily Dose(日剂量) / U=Unit Dose(单位剂量)` |
| Global | `^ARCIM(..., 1)^5` (Node 1) |
| 置信度 | 0.90 |
| 影响 | 决定医嘱录入时的用量含义解释 |

#### IM-009: ARCIM_SERV_MATERIAL (服务/材料标识)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `arcimServMaterial` |
| 匹配模式 | | 标准名 | `arcimServMaterial` |, | 标准名 | `arcimServMaterial` |, | 标准名 | `arcim_serv_material` | |
| 取值表达式 | `$p($g(^ARCIM(imSub, imVer, 7)), "^", 6)` |
| 枚举 | `S=Service(服务类) / M=Material(材料类)` |
| 节点 | **Node 7** |
| Global | `^ARCIM(..., 7)^6` |
| 置信度 | 0.91 |
| 说明 | 区分"医疗服务"和"实物材料"——影响计费和库存管理策略 |

#### IM-010: ARCIM_BILLING_UOM_DR (计价单位)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `arcimBillingUomDr` |
| 匹配模式 | | 标准名 | `arcimBillingUomDr` |, | 标准名 | `arcimBillingUomDr` |, | 标准名 | `arcim_billing_uom_dr` | |
| 取值表达式 | `$p($g(^ARCIM(imSub, imVer, 8)), "^", 14)` |
| 节点 | **Node 8** |
| 下游 | `^CT("UOM", uomDr)^2` |
| Global | `^ARCIM(..., 8)^14` |
| 置信度 | 0.90 |
| 说明 | 可能与UOM_DR(基本单位)不同! 例如基本单位="片",计价单位="盒" |

#### IM-011: ARCIM_RM_FREQUENCY_DR (频次)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `arcimRmFrequencyDr` |
| 匹配模式 | | 标准名 | `arcimRmFrequencyDr` |, | 标准名 | `arcimRmFrequencyDr` |, | 标准名 | `arcim_rm_frequency_dr` | |
| 取值表达式 | `$p($g(^ARCIM(imSub, imVer, 8)), "^", 17)` |
| 节点 | Node 8 |
| 下游 | `^PHCFreq(freqDr)` → qD/tID/qOD/qW/qOD/q1H/q4H/q8H/St/... |
| Global | `^ARCIM(..., 8)^17` |
| 置信度 | 0.93 |
| 说明 | 医嘱频次字典关联,用于展开长期医嘱的执行计划 |

#### IM-012: ARCIM_RM_DURATION_DR (疗程)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `arcimRmDurationDr` |
| 匹配模式 | | 标准名 | `arcimRmDurationDr` |, | 标准名 | `arcimRmDurationDr` |, | 标准名 | `arcim_rm_duration_dr` | |
| 取值表达式 | `$p($g(^ARCIM(imSub, imVer, 8)), "^", 16)` |
| 节点 | Node 8 |
| 下游 | `^PHCDuration(durDr)` → 疗程天数描述 |
| Global | `^ARCIM(..., 8)^16` |
| 置信度 | 0.91 |

#### IM-013: ARCIM_GENERIC_DR (通用药)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `arcimGenericDr` |
| 匹配模式 | | 标准名 | `arcimGenericDr` |, | 标准名 | `arcimGenericDr` |, | 标准名 | `arcim_generic_dr` | |
| 取值表达式 | `$p($g(^ARCIM(imSub, imVer, 8)), "^", 20)` |
| 节点 | Node 8 |
| 下游 | `^PHCGeneric(genDr)` → 通用名/商品名(如"阿莫西林"/"布洛芬") |
| Global | `^ARCIM(..., 8)^20` |
| 置信度 | 0.89 |
| 说明 | 用于仿制药/通用名替换场景,dIP/DRG分组可能需要 |

#### IM-014: ARCIM_DEF_PRIORITY_DR (默认优先级)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `arcimDefPriorityDr` |
| 匹配模式 | | 标准名 | `arcimDefPriorityDr` |, | 标准名 | `arcimDefPriorityDr` |, | 标准名 | `arcim_def_priority_dr` | |
| 取值表达式 | `$p($g(^ARCIM(imSub, imVer, 8)), "^", 22)` |
| 节点 | Node 8 |
| 下游 | `^oECP(prfDr)` → 长期/临时 |
| Global | `^ARCIM(..., 8)^22` |
| 置信度 | 0.90 |
| 说明 | 新开医嘱时的默认长期/临时属性 |

#### IM-015: ARCIM_OWN_PAY_FLAG (自费标志)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `arcimOwnPayFlag` |
| 匹配模式 | | 标准名 | `arcimOwnPayFlag` |, | 标准名 | `arcimOwnPayFlag` |, | 标准名 | `arcim_own_pay_flag` | |
| 取值表达式 | `$p($g(^ARCIM(imSub, imVer, 8)), "^", 23)` |
| 节点 | Node 8 |
| 枚举 | `Y=自费项目 / N=医保报销` |
| Global | `^ARCIM(..., 8)^23` |
| 置信度 | 0.90 |
| 说明 | 2022年新增,医保合规重要字段 |

#### IM-016: ARCIM_ALLOW_INPUT_FREQ (允许录入频次)

|| 属性 | 值 ||
|------|-----|
| 标准名 | `arcimAllowInputFreq` |
| 匹配模式 | | 标准名 | `arcimAllowInputFreq` |, | 标准名 | `arcimAllowInputFreq` |, | 标准名 | `arcim_allow_input_freq` | |
| 取值表达式 | `$p($g(^ARCIM(imSub, imVer, 9)), "^", 42)` |
| 节点 | **Node 9** |
| 枚举 | `Y=允许手工录入频次 / N=只能选预定义频次` |
| Global | `^ARCIM(..., 9)^42` |
| 置信度 | 0.86 |
| 说明 | 2020年新增,控制医嘱录入界面行为 |

---

### 七、DHCTarItem 收费项目/物价字典

> **★计费系统核心字典!** Global=`^DHCTARI`, 77属性(Piece 1~83), 15+索引.
> 与ARCIM(医嘱项)的关系: **ARCIM=医嘱开立视角(频次/剂量/用法), DHCTarItem=收费计价视角(价格/医保/物价/税务)**.
> 很多场景下两者通过ExternalCode或TARI_Code做关联映射.

#### TARI-001: TARI_CODE (收费项代码)

| | 属性 | 值 |
|------|-----|
| 标准名 | `tariCode` |
| 匹配模式 | | 标准名 | `tariCode` |, | 标准名 | `tariCode` |, | 标准名 | `tari_code` | |
| 别名 | 收费项编码 / 物价代码 / 项目代码 / sFXM / ChargeItemCode |
| 取值表达式 | `$p($g(^DHCTARI($p($g(^DHCPB(pbId,"O",pboChild,"D",pbdChild)),"^",3))),"^",1)` |
| Global | `^DHCTARI(tariRowId)^1` |
| 索引 | `^DHCTARI(0, "Code", Code, RowId)` — 可反向查找 |
| 置信度 | **0.99** |
| 类型 | `%String(mAXLEN=30), cOLLATION=Exact` |

```objectscript
s tariCode = $p($g(^DHCTARI(tariRowId)), "^", 1)
; 例: "lAB001" / "dRUG2024" / "sURG050" / "nURS003"
; ⚠️ 这是 Exact 匹配! 大小写敏感,查询时需注意
```

#### TARI-002: TARI_DESC (收费项名称)

| | 属性 | 值 |
|------|-----|
| 标准名 | `tariDesc` |
| 匹配模式 | | 标准名 | `tariDesc` |, | 标准名 | `tariDesc` |, | 标准名 | `tari_desc` | |
| 别名 | 收费项名称 / 项目名称 / sFXMMC / ChargeItemName |
| 取值表达式 | `$p($g(^DHCTARI(tariRowId)), "^", 2)` |
| Global | `^DHCTARI(tariRowId)^2` |
| 索引 | `^DHCTARI(0, "Desc", Desc, RowId)` — 名称反查 |
| 置信度 | **0.99** |
| 类型 | `%String(mAXLEN=150), cOLLATION=Exact` |

```objectscript
s tariDesc = $p($g(^DHCTARI(tariRowId)), "^", 2)
; 例: "血常规" / "CT平扫(头颅)" / "一级护理" / "住院诊查费"
```

#### TARI-003: TARI_UOM_DR (单位)

| | 属性 | 值 |
|------|-----|
| 标准名 | `tariUomDr` |
| 匹配模式 | | 标准名 | `tariUomDr` |, | 标准名 | `tariUomDr` |, | 标准名 | `tari_uom_dr` | |
| 取值表达式 | `$p($g(^DHCTARI(tariRowId)), "^", 3)` |
| 下游 | `^CT("UOM", uomDr)^2` → 单位描述(次/项/日/盒/片/ml...) |
| Global | `^DHCTARI(...)^3` → User.cTUOM 字典 |
| 置信度 | 0.97 |

#### TARI-004: TARI_PRICE (标准价格)

| | 属性 | 值 |
|------|-----|
| 标准名 | `tariPrice` |
| 匹配模式 | | 标准名 | `tariPrice` |, | 标准名 | `tariPrice` |, | 标准名 | `tari_price` | |
| 别名 | 单价 / 标准价格 / Price / dJ |
| 取值表达式 | `$p($g(^DHCTARI(tariRowId)), "^", 8)` |
| Global | `^DHCTARI(...)^8` |
| 置信度 | **0.98** |
| 类型 | `%Float` 数值型(金额) |
| 说明 | **基准单价**. 实际计费可能受AlterPrice1/2、医保限价、加收编码等影响 |

```objectscript
s price = $p($g(^DHCTARI(tariRowId)), "^", 8)
; 例: 15.50 (血常规) / 280.00 (CT平扫) / 14.00 (一级护理/日)
```

#### TARI-005: TARI_EXTERNAL_CODE (外部编码/医保对照码)

| | 属性 | 值 |
|------|-----|
| 标准名 | `tariExternalCode` |
| 匹配模式 | | 标准名 | `tariExternalCode` |, | 标准名 | `tariExternalCode` |, | 标准名 | `tari_external_code` | |
| 别名 | 医保对照码 / 外部代码 / ExternalCode / InsuMappingCode |
| 取值表达式 | `$p($g(^DHCTARI(tariRowId)), "^", 13)` |
| Global | `^DHCTARI(...)^13` |
| 索引 | `^DHCTARI(0, "aSC", ExtCode, RowId)` — ★可反向按外部编码查找 |
| 置信度 | **0.97** |
| 类型 | `%String(mAXLEN=300)` |
| 关键作用 | **医保上报接口的核心映射字段!** 如果收费项已做过医保对照,填同一类的外部代码即可跳过再次对照 |

```objectscript
; 用法1: 从收费项取外部编码
s extCode = $p($g(^DHCTARI(tariRowId)), "^", 13)

; 用法2: 反向查找 — 已知外部编码找收费项
s findRowId = $o(@("^DHCTARI(0,"""_"""aSC"""","""_extCode_""","""")")) ; 注意引号嵌套
i findRowId'="" d
 . s tariCode = $p($g(^DHCTARI(findRowId)), "^", 1)
 . s tariDesc = $p($g(^DHCTARI(findRowId)), "^", 2)
```

#### TARI-006: TARI_INSU_CODE (国家医保编码)

| | 属性 | 值 |
|------|-----|
| 标准名 | `tariInsuCode` |
| 匹配模式 | | 标准名 | `tariInsuCode` |, | 标准名 | `tariInsuCode` |, | 标准名 | `tari_insu_code` | |
| 别名 | 国家医保编码 / 医保项目编码 / NationalInsuCode |
| 取值表达式 | `$p($g(^DHCTARI(tariRowId)),"^",54)` |
| Global | `^DHCTARI(tariRowId)^54` |
| 置信度 | **0.99** |
| MCP验证 | ✅ Piece 54 = TARI_InsuCode (2026-05-30确认, 旧文件^59错误) |
| 类型 | `%String(mAXLEN=100)` |
| 新增时间 | 2021-02-22 (^59) |
| 说明 | **国家医保局统一编码**, 互联互通/dIP/dRG 上报时必传. 与ExternalCode区别: ExternalCode=院内自定义对照, InsuCode=国家标准编码 |

#### TARI-007: TARI_INSU_IP_PROPORTION (住院自付比例)

| | 属性 | 值 |
|------|-----|
| 标准名 | `tariInsuIpProportion` |
| 匹配模式 | | 标准名 | `tariInsuIpProportion` |, | 标准名 | `tariInsuIpProportion` |, | 标准名 | `tari_insu_ip_proportion` | |
| 取值表达式 | `$p($g(^DHCTARI(tariRowId)),"^",42)` |
| 配对字段 | `tariInsuOpProportion(^48)` — 门诊自付比例 |
| Global | `^DHCTARI(...)^47` |
| 置信度 | 0.95 |
| 说明 | 百分比数值. 用于计算医保报销金额: 自付额=单价×数量×自付比例 |

```objectscript
s ipRatio = $p($g(^DHCTARI(tariRowId)), "^", 47)
s opRatio = $p($g(^DHCTARI(tariRowId)), "^", 48")
; ipRatio=0.10 表示住院自付10%(医保报销90%)
```

#### TARI-008: TARI_PAY_TYPE (付费类型)

| | 属性 | 值 |
|------|-----|
| 标准名 | `tariPayType` |
| 匹配模式 | | 标准名 | `tariPayType` |, | 标准名 | `tariPayType` |, | 标准名 | `tari_pay_type` | |
| 取值表达式 | `$p($g(^DHCTARI(tariRowId)),"^",77)` |
| 枚举 | `F=Free(公费) / O=Own(自费) / P=Partial(部分自费) / C=Contional(条件自费)` |
| Global | `^DHCTARI(...)^82` |
| 置信度 | 0.95 |
| 新增时间 | 较新字段 (^82) |
| 影响 | 决定该收费项是否纳入医保结算范围 |

#### TARI-009: TARI_PRICE_CODE (物价编码)

| | 属性 | 值 |
|------|-----|
| 标准名 | `tariPriceCode` |
| 匹配模式 | | 标准名 | `tariPriceCode` |, | 标准名 | `tariPriceCode` |, | 标准名 | `tari_price_code` | |
| 别名 | 物价编码 / 价格编码 / PriceCode / wJBM |
| 取值表达式 | `$p($g(^DHCTARI(tariRowId)),"^",45)` |
| Global | `^DHCTARI(...)^50` |
| 置信度 | 0.94 |
| 类型 | `%String(mAXLEN=220)` |
| 说明 | 当地物价局核定的收费项目编码. 各省市不同,用于费用审核和合规检查 |

#### TARI-010: TARI_INPAT_CATE (住院费用子类)

| | 属性 | 值 |
|------|-----|
| 标准名 | `tariInpatCate` |
| 匹配模式 | | 标准名 | `tariInpatCate` |, | 标准名 | `tariInpatCate` |, | 标准名 | `tari_inpat_cate` | |
| 取值表达式 | `$p($g(^DHCTARI(tariRowId)),"^",14)` |
| 下游 | `User.DHCTarInpatCate` 字典 → 子类名称 |
| 索引 | `^DHCTARI(0,"IC",InpatCate,RowId)` — 可反查同子类下所有项目 |
| Global | `^DHCTARI(tariRowId)^14` |
| 置信度 | 0.99 |
| MCP验证 | ✅ Piece 14 = TARI_InpatCate (2026-05-30确认, 旧文件^18错误) |
| 配对字段 | `tariOutpatCate(^15)` — 门诊费用子类 |
| 说明 | **病案首页费用分类的关键依据!** 住院费用按此子类归集(治疗费/护理费/药费/检查费/手术费等) |

#### TARI-011: TARI_OUTPAT_CATE (门诊费用子类)

| | 属性 | 值 |
|------|-----|
| 标准名 | `tariOutpatCate` |
| 匹配模式 | | 标准名 | `tariOutpatCate` |, | 标准名 | `tariOutpatCate` |, | 标准名 | `tari_outpat_cate` | |
| 取值表达式 | `$p($g(^DHCTARI(tariRowId)),"^",15)` |
| 下游 | `User.DHCTarOutpatCate` 字典 |
| 索引 | `^DHCTARI(0,"OC",OutpatCate,RowId)` |
| Global | `^DHCTARI(tariRowId)^15` |
| 置信度 | 0.99 |
| MCP验证 | ✅ Piece 15 = TARI_OutpatCate (2026-05-30确认) |

#### TARI-012: TARI_ACTIVE_FLAG (有效标志)

| | 属性 | 值 |
|------|-----|
| 标准名 | `tariActiveFlag` |
| 匹配模式 | | 标准名 | `tariActiveFlag` |, | 标准名 | `tariActiveFlag` |, | 标准名 | `tari_active_flag` | |
| 取值表达式 | `$p($g(^DHCTARI(tariRowId)),"^",7)` |
| 枚举 | `Y=Yes(有效) / N=No(停用)` |
| 默认值 | 无默认(必须显式设置) |
| Global | `^DHCTARI(...)^11` |
| 置信度 | **0.99** |
| 说明 | **遍历过滤必查!** 类似CTLOC的ActiveFlag,只处理Y的项目. 结合StartDate/EndDate判断时效 |

```objectscript
; 遍历所有有效收费项
s tariDr = ""
f  s tariDr = $o(^DHCTARI(tariDr)) q:tariDr=""  d
|. s active = $p($g(^DHCTARI(tariDr)), "^", 11)
|. i active="Y" d
|.. s code = $p($g(^DHCTARI(tariDr)), "^", 1)
|.. s desc = $p($g(^DHCTARI(tariDr)), "^", 2)
|.. s price = $p($g(^DHCTARI(tariDr)), "^", 8)
```

#### TARI-013: TARI_SPECIAL_FLAG (特殊项目标识)

| | 属性 | 值 |
|------|-----|
| 标准名 | `tariSpecialFlag` |
| 匹配模式 | | 标准名 | `tariSpecialFlag` |, | 标准名 | `tariSpecialFlag` |, | 标准名 | `tari_special_flag` | |
| 取值表达式 | `$p($g(^DHCTARI(tariRowId)),"^",10)` |
| 枚举 | `Y=Yes(特殊) / N=No(普通)` |
| 默认值 | `"N"` |
| Global | `^DHCTARI(...)^17` |
| 置信度 | 0.92 |
| 说明 | 标记特殊收费项目(如特需服务/自费项目/高值耗材). 影响计费逻辑和报表展示 |

#### TARI-014: TARI_INSU_NAME (医保名称)

| | 属性 | 值 |
|------|-----|
| 标准名 | `tariInsuName` |
| 匹配模式 | | 标准名 | `tariInsuName` |, | 标准名 | `tariInsuName` |, | 标准名 | `tari_insu_name` | |
| 别名 | 医保显示名称 / 医保项目名 |
| 取值表达式 | `$p($g(^DHCTARI(tariRowId)), "^", 19)` |
| 索引 | `^DHCTARI(0, "InsuName", InsuName, RowId)` — 可按医保名反查 |
| Global | `^DHCTARI(...)^19` |
| 置信度 | 0.94 |
| 类型 | `%String(mAXLEN=100)` |
| 说明 | 医保报销凭证上显示的项目名称,可能与TARI_DESC(院内名称)不同 |

#### TARI-015: TARI_CHARGE_BASIS (收费依据)

| | 属性 | 值 |
|------|-----|
| 标准名 | `tariChargeBasis` |
| 匹配模式 | | 标准名 | `tariChargeBasis` |, | 标准名 | `tariChargeBasis` |, | 标准名 | `tari_charge_basis` | |
| 别名 | 收费说明 / 计价依据 / 收费文件号 |
| 取值表达式 | `$p($g(^DHCTARI(tariRowId)), "^", 20)` |
| 索引 | `^DHCTARI(0, "ChargeBasis", $$aLPHAUP(ChargeBasis), RowId)` |
| Global | `^DHCTARI(...)^20` |
| 置信度 | 0.91 |
| 说明 | 引用的物价文件编号或政策依据(如"某市医保〔2023〕xx号文") |

#### TARI-016: TARI_STATE_HVM_FLAG (国家监控高值耗材标志)

| | 属性 | 值 |
|------|-----|
| 标准名 | `tariStateHvmFlag` |
| 匹配模式 | | 标准名 | `tariStateHvmFlag` |, | 标准名 | `tariStateHvmFlag` |, | 标准名 | `tari_state_hvm_flag` | |
| 取值表达式 | `$p($g(^DHCTARI(tariRowId)),"^",46)` |
| 枚举 | `Y=Yes / N=No` |
| 配对字段 | `tariProvHvmFlag(^52)`省级 / `tariHospHvmFlag(^63)`院内 |
| Global | `^DHCTARI(...)^51` |
| 置信度 | 0.92 |
| 说明 | **三级监控体系**: 国>省>院. Y表示属于国家卫健委重点监控的高值医用耗材 |

#### TARI-017: TARI_AT_OWN_EXPENSE_FLAG (自费标志)

| | 属性 | 值 |
|------|-----|
| 标准名 | `tariAtOwnExpenseFlag` |
| 匹配模式 | | 标准名 | `tariAtOwnExpenseFlag` |, | 标准名 | `tariAtOwnExpenseFlag` |, | 标准名 | `tari_at_own_expense_flag` | |
| 取值表达式 | `$p($g(^DHCTARI(tariRowId)),"^",66)` |
| 枚举 | `Y=自费项目 / N=非自费(默认N)` |
| 默认值 | `"N"` |
| Global | `^DHCTARI(...)^71` |
| 置信度 | 0.93 |
| 说明 | 与PayType互补. 此标志更直接——标记完全自费项目(不进入医保结算) |

---

## 遍历模板

### Template A: 按科室遍历所有有效用户

```objectscript
; 遍历CTLOC获取所有有效科室
s locDr = ""
f  s locDr = $o(^CTLOC(locDr)) q:locDr=""  d
. s locActive = $p($g(^CTLOC(locDr)), "^", 14)
. i locActive="Y" d  .  ; 只处理有效科室
. . s locCode = $p($g(^CTLOC(locDr)), "^", 1)
. . s locDesc = $p($g(^CTLOC(locDr)), "^", 2)
. . s locType = $p($g(^CTLOC(locDr)), "^", 13)
. . ; ... 处理科室逻辑
```

### Template B: 按病区→床位遍历

```objectscript
; 先遍历病区,再遍历该病区下的所有床位
s wardDr = ""
f  s wardDr = $o(^PAWARD(wardDr)) q:wardDr=""  d
. s wardActive = $p($g(^PAWARD(wardDr)), "^", 6)
. i wardActive="Y" d
. . s wardCode = $p($g(^PAWARD(wardDr)), "^", 1)
. . s wardDesc = $p($g(^PAWARD(wardDr)), "^", 2)
. . ; 遍历该病区的床位 (注意: ^PAWARD(wardDr, "BED", ...))
. . s bedSub = ""
. . f  s bedSub = $o(^PAWARD(wardDr, "BED", bedSub)) q:bedSub=""  d
. . . s bedCode = $p($g(^PAWARD(wardDr, "BED", bedSub)), "^", 1)
. . . s bedStatusDR = $p($g(^PAWARD(wardDr, "BED", bedSub)), "^", 5)
. . . ; ... 处理床位逻辑
```

### Template C: 查询ARCIM(复合主键!)

```objectscript
; ⚠️ 必须同时知道 Subscript 和 Version!
; 方式1: 从ordData1解析(最常见)
s tArcimStr = $p(ordData1, "^", 2)   ; "main||ver"
s arcimMain = $p(tArcimStr, "||", 1)
s arcimVer  = $p(tArcimStr, "||", 2)
s itemData = $g(^ARCIM(arcimMain, arcimVer, 1))

; 方式2: 按Code索引查找(反查)
s code = "阿莫西林胶囊"
s findSub = ""
f  s findSub = $o(^ARCIM(0, "AliasAllItems", 0, 0, code, code, findSub)) q:findSub=""  d
. s foundMain = $p($g(^ARCIM(findSub, 1)), "^", 1)   ; Code
. s foundVer  = $p($g(^ARCIM(findSub, 1)), "^", 54)  ; Version
```

### Template D: 通过SSUser桥接CTPCP获取操作人姓名

```objectscript
; 已知 userDr(来自session/日志等), 需要获取真实姓名
s userName = $p($g(^SSU("SSUSR", userDr)), "^", 2)         ; 尝试直接取
i userName="" d
. s cpDr = $p($g(^SSU("SSUSR", userDr)), "^", 9)           ; 桥接到CTPCP
. i cpDr="" d
. . q  ; 既没有名字也没关联CTCPCP,无法获取
. s userName = $p($g(^CTPCP(cpDr)), "^", 2)                ; 从CTCPP取姓名
```

---

## 踩坑提示

### 🔴 高频踩坑

| # | 坑点 | 影响 | 解决方案 |
|---|------|------|---------|
| d1 | **CTPCP三节点搞混** | 取姓名拿到地址或资质 | 牢记: sub1=基础(Code/Name/Type) / sub2=地址(Tel/Addr) / sub3=资质(Config/Flags) |
| d2 | **ARCIM复合主键遗忘** | 查错版本或查到空数据 | `^ARCIM(sub, ver, node)` — 必须同时提供sub和ver, ver通常=1但不可假设 |
| d3 | **PACBed父表依赖** | 直接遍历^PAWARD找不到床位数 | 必须 `^PAWARD(wardDr, "BED", bedSub)` — 缺少中间层"BED"和wardDr |
| d4 | **SSUser vs CTCPP混淆** | 用户名 vs 医护姓名 | SSUser=登录账号(可能叫"admin"), cTCP=真实医护姓名. 用SSUSR_CTPCPDR桥接 |
| d5 | **CTLOC Type枚举值误判** | 把"E"当急诊其实可能是执行科室 | TYPE值是固定VALUELIST,参考完整枚举列表,不要猜 |
| d6 | **CTLOC 位置13 vs 22** | 拿Type拿到HospitalDr | ^13=Type(字符串W/E/dI...), ^22=HospitalDR(数字Dr), Piece编号差很多! |
| d7 | **DHCTARI属性超多(Piece 1~83)** | 找字段时数错Piece编号 | 77个属性! 建议对照源码Storage Map确认,不要凭记忆. 常用集中在^1-8, ^11, ^13, ^15, ^18-20, ^47-50, ^59 |
| d8 | **ExternalCode vs InsuCode混淆** | 上报时填错编码 | ExternalCode(^13)=院内自定义医保对照, InsuCode(^59)=国家医保局标准编码. 互联互通上报用InsuCode |
| d9 | **TARI价格非唯一** | 只取Price但实际计价不同 | 有AlterPrice1/2(^9-10)备选价+InsuranceMaxPice(^39)医保限价+加收编码(特需/儿童/住院/门诊). 计费逻辑可能选其中之一 |
| d10 | **CTPCP联系方式在Node3非Node2** | MobilePhone/Fax/Email取到地址信息 | MCP验证: MobilePhone=Node3^6, Fax=Node3^7, Email=Node3^9. 不是Node2! |
| d11 | **CTPCP Radiologist在Node3非Node2** | 放射科标识取错节点 | MCP验证: Radiologist=Node3^14, 不是Node2^19 |
| d12 | **CTLoc Hospital_DR是^22非^19** | 取院区DR取到别的字段 | MCP验证: CTLOC_Hospital_DR=Piece 22. ^19是CTLOC_Dep_DR(部门组) |
| d13 | **🔴 DHCTarItem Piece位置系统性偏差!** | 大量字段取错值 | MCP验证: 旧版Piece编号与当前IRIS Storage差5位左右! 如InsuCode旧^59→实际^54, PriceCode旧^50→实际^45. 必须以MCP的Storage Map为准! |

### 🟡 中频注意

| # | 要点 | 说明 |
|---|------|------|
| m1 | **CTPCP ActiveFlag在Node1^9** | 不在sub3! sub1^9才是ActiveFlag |
| m2 | **ARCIM Node编号跳跃大** | Node1→Node2中间跳了很多(Node 1有15个Piece,Node 2从^1重新开始) |
| m3 | **PACWard SqlIdExpression不同** | PACWard用`$i(^PAC("pACWD",0))`, CTLOC用`$i(^CTLOC(0))` |
| m4 | **SSUser索引格式** | `^SSU("SSUSR", 0, "Name", ...)` — 有个"SSUSR"中间层 |
| m5 | **ARCIM Abbrev是Computed** | 自动取Desc前20字符,不要手动赋值 |
| m6 | **dHCTARI ActiveFlag无默认值** | 遍历漏过滤停用项 | 不像TARI_SpecialFlag默认"N", ActiveFlag必须显式判断. 停用项目仍存在于Global中! |
| m7 | **DHCTARI索引前缀区分** | 反查用错索引节点 | Code→"Code", Desc→"Desc", ExternalCode→"aSC", InpatCate→"iC", OutpatCate→"oC". 索引名和字段名不完全一致! |
| m8 | **TARI高值耗材三级标志** | 只查一级漏掉其他 | StateHVM(^51) / ProvHVM(^52) / HospHVM(^63) 三级独立. 任何一个Y都应标记为高值耗材 |

### 🟢 低频备忘

| # | 要点 | 说明 |
|---|------|------|
| l1 | **CTPCP MentalFlag在Node3^33** | 精神类药物处方权,不在基础信息里 |
| l2 | **BED Available是Computed列** | Transient只读,ObjectScript中无法SET |
| l3 | **ARCIM OwnPayFlag在Node8^23** | 自费标志,较新字段(2022) |
| l4 | **CTLOC ClinicType(新增)** | 接收就诊类型 O/E/I/H, 较新字段 |
| l5 | **dHCTARI ManufactorType枚举** | iM=进口/hM=国产/jM=合资/uM=未分类. 不是Y/N! |
| l6 | **dHCTARI PayType枚举** | F=公费/O=自费/P=部分自费/C=条件自费. 与AtOwnExpenseFlag含义重叠但粒度更细 |
| l7 | **dHCTARI ChildDHCTarItemPrice** | Relationship子表! 收费项可能有多个价格版本(不同时段/不同医保类型). 通过Child关系访问 |

---

## IRIS包名→业务域导航图 (用户提供)

> **老板提供的知识沉淀,小老弟整理成表供快速查阅**

| 包名前缀 | 业务域 | 代表性Global/类 | 关键字示例 |
|----------|--------|------------------|-----------|
| **CT*** | 字典类 | `^CTLOC` / `^CTPCP` / `^CT("UOM")` / `^CT("HOSP")` / `^CT("CarPrvTp")` | 科室/人员/单位/医院/人员类型 |
| **pA*** | 就诊/患者/空间 | `^PAADM` / `^PAPER` / `^PAWARD` / `^PAC`* | 就诊记录/患者档案/病区/床位/房间 |
| **oE*** | 医嘱域 | `^OEORD` / `^oEORI` / `^OECPR` / `^OEC("oRCAT")` / `^OEC("OSTAT")` | 医嘱头/执行/优先级/大类别/状态 |
| **ARC*** | 医嘱项/收费项 | `^ARCIM` / `^ARC("iC")` | 物品主字典/IC卡 |
| **dOC*** | 医生站 | web.dOC*.cls / Doc* | 医生工作站相关功能类 |
| **Nur*** | 护理 | *Nur*.cls / NurseEmr* / ^MR(体温单) | 护理病历/生命体征/文书 |
| **pHA*** | 药房 | `^DHCPHDISP` / `^DHCPHRET` / `^DHCPHAC` / `^pHARET` / `^INCI` / `^DHCINGR` | 发药/退药/入库/库存/批号 |
| **dHCBILL/uDHC*** | 计费/费用 | `^uDHC`* / `^DHCBILL`* / uDBCCI* | 费用/结算/医保/物价 |
| **DHC*** (TarItem) | 收费项目字典 | `^DHCTARI` / User.DHCTarItem | ★收费项/物价(77属性:价格/医保编码/自付比例/高值耗材) |
| **eNS*** | 平台/总线 | web.DHCENS.bLL.* | 全民健康上报平台封装层(我们的接口类都在这里!) |
| **DHC*** | 东华HIS核心 | `^DHCITMINFO` / `^DHCPHPER` / `^DHCINGR` | 东华特有扩展表/药房人员/入库记录 |

### 记忆口诀

> **"CT字典PA就诊, OE医嘱ARC项, DOC医生Nur护理, PHA药房BILL计费, ENS平台总线管"**

---

## 别名映射速查

|| 标准名 || 最常用别名 |
| 匹配模式 | || 标准名 || 最常用别名 | | 所属字典 |
|---------|---------------|---------|
| 科室代码/名称 | `ctlocCode` / `ctlocDesc` | kSDM / kSMC / deptCode / deptName / LocDr / LocName |
| 人员姓名 | `ctpcpDesc` | docName / ySMC / doctorName / 操作人 / 开立医生 |
| 人员工号 | `ctpcpCode` | docCode / ySBH / staffCode |
| 用户姓名 | `ssusrName` | userName / loginName / operatorName |
| 项目编码/名称 | `arcimCode` / `arcimDesc` | yPDM / yPMC / itemCode / itemName / arcimCode |
| 病区代码/名称 | `wardCode` / `wardDesc` | bQDM / bQMC / wardCode / wardName |
| 床号 | `bedCode` | bedNo / bedCode / cH / 床位号 |
| 单位 | `arcimUomDr` / `CT("UOM")` | UOM / unit / dW / yLDW / doseUnit |
| 收费项代码 | `tariCode` | sFXM / ChargeItemCode / priceItemCode / 物价编码 / 项目代码 |
| 收费项名称 | `tariDesc` | sFXMMC / ChargeItemName / priceItemName / 项目名称 / 收费名称 |
| 标准价格 | `tariPrice` | Price / dJ / unitPrice / 单价 / 标准价格 |
| 外部编码(医保) | `tariExternalCode` | ExternalCode / InsuMappingCode / 医保对照码 / 映射编码 |
| 国家医保编码 | `tariInsuCode` | NationalInsuCode / 国家医保项目编码 / 医保统一编码 |
| 住院/门诊子类 | `tariInpatCate` / `tariOutpatCate` | InpatCate / OutpatCate / 费用分类 / fYFL |
| 自付比例 | `tariInsuIp/opProportion` | InsuProportion / selfPayRatio / 自付比 / zZBL |
