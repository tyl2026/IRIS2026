# HIS 业务数据流转参考

> 来源：00-HIS业务主体表数据流转图V2.2.pdf + 9张基础表图谱(2014) + MCP验证 | 2026-05-30
> 用途：接口程序生成时的业务逻辑参考，DR 指针链路、状态机、多表遍历模板

## 使用场景

1. **生成多表关联接口**：需要从 A 表跳到 B 表时，查 DR 指针速查表
2. **生成退费/退药接口**：查状态机和负记录逻辑
3. **设计遍历链路**：查数据流图确定入口表和遍历路径
4. **理解业务规则**：查各业务环节的联动规则

---

## 一、DR 指针速查表

> 接口程序中最常用的跨表跳转链路。格式：`表名.字段 → 目标表.取值字段`

### 1.1 就诊核心链路

```
PA_Adm^1    → PA_PatMas (患者DR)              → ^PAPER(patDR,"ALL")^1 = 姓名
PA_Adm^4    → CT_Loc (科室DR)                  → ^CTLOC(deptDR)^1/^2 = 科室代码/名称
PA_Adm^9    → CT_CareProv (开诊医生DR)          → ^CTPCP(docDR,1)^1/^2 = 工号/姓名
PA_Adm^19   → CT_CareProv (出院医生DR)
PA_Adm^20   → 就诊状态 (A/C/D/P，直接存储)
PA_Adm^49   → PAC_DischargeCondition (转归DR)   → ^PAC("DISCON")^1/^2
PA_Adm^61   → MR_Adm (病案DR)                   → ^MR(mradm,"DIA",sub) = 诊断
PA_Adm^70   → PAC_Ward (病区DR)                 → ^PAWARD(wardDR)^1/^2
PA_Adm^73   → PAC_Bed (床位DR，格式Ward||Sub)
PA_Adm(1)^7 → PAC_AdmReason (费别DR)            → ^PAC("ADMREA")^1/^2
```

### 1.2 医嘱链路

```
OE_Order^1        → PA_Adm (就诊DR)
OE_OrdItem^2      → ARC_ItmMast (医嘱项DR，格式main||ver)
OE_OrdItem^4      → CT_UOM (剂量单位DR)
OE_OrdItem^5      → OEC_Priority (优先级DR)
OE_OrdItem^13     → PHC_Freq (频次DR)
OE_OrdItem^17     → PHC_Instruc (用法DR)
OE_OrdItem^31     → OEC_OrderStatus (医嘱状态DR) → ^OEC("OSTAT")^1=Code
OE_OrdItem^39     → CT_CareProv (开单医生DR)
OE_OrdItem^44     → CT_Loc (接收科室DR)
OE_OrdItem^62     → CT_Loc (开医嘱科室DR)

ARC_ItmMast(sub,1)^1  → 项目代码
ARC_ItmMast(sub,1)^2  → 项目名称
ARC_ItmMast(sub,1)^10 → ARC_ItemCat (医嘱子类DR) → ^OEC("ORCAT") 大类
ARC_ItmMast(sub,1)^12 → PHC_DrgForm (处方剂量DR，药品专用)
```

### 1.3 药房打包链路（药品医嘱→发药）

```
DHC_OEDispensing:
  DSP_OEORI_DR   → OE_OrdItem (医嘱明细DR)
  DSP_OEORE_DR   → OE_OrdExec (执行记录DR)
  DSP_Pointer     → 根据 DSP_Type 不同指向不同表：
                     F=门诊发药子表DHC_PHDISITEM
                     P=住院发药子表DHC_PHACollectItm
                     Y=住院退药表DHC_PhaReturn
                     H=门诊退药子表DHC_PHRETITM
  DSP_Status      → TC=未发药, C=已发药, R=退药
  DSP_Type        → F=门诊发药, P=住院发药, H=门诊退药, Y=住院退药
  DSP_AdmDR       → PA_Adm (就诊DR)
```

### 1.4 计费链路（账单三层嵌套）

```
DHC_PatientBill:
  PB_Adm_Dr        → PA_Adm (就诊DR)
  PB_PatInsType_DR → PAC_AdmReason (费别DR)
  PB_TotalAmount   → 总费用
  PB_PatientShare  → 患者自付
  PB_PayorShare    → 医保支付
  PB_PayedFlag     → B=未结算, P=已结算
  PB_RefundFlag    → R=退费(新负账单), B=被退费(原账单)
  PB_OriginalBill_DR → 退费时指向对方账单(双向指针)

DHC_PatBillOrder (子表):
  PBO_OEORI_DR     → OE_OrdItem (医嘱DR)
  PBO_OrdExec_Dr   → OE_OrdExec (执行记录DR，住院有值)
  PBO_ARCIM_DR     → ARC_ItmMast (医嘱项DR)
  PBO_BillStatus   → B=已缴费, 空=未缴费(门诊)
  PBO_TotalAmount  → 总价

DHC_PatBillDetails (孙表):
  PBD_TARI_DR      → DHC_TarItem (收费项DR)
  PBD_UnitPrice    → 基本单位单价
  PBD_BillQty      → 基本单位数量
  PBD_TotalAmount  → 总价
  PBD_DSPB_DR      → DHC_OEDispBatch (药房打包批次DR)
```

### 1.5 发票链路

```
DHC_INVPRT (门诊发票):
  PRT_PAPMI_DR     → PA_PatMas (患者DR)
  PRT_AdmDR        → PA_Adm (就诊DR)
  PRT_InsType_DR   → PAC_AdmReason (费别DR)
  PRT_Acount       → 发票金额
  PRT_Flag         → N=正常, A=作废, S=红冲
  PRT_InsDiv_DR    → INSU_Divide (医保结算DR)
  PRT_FairType     → F=结算发票, R=挂号发票

DHC_INVPayMode (支付方式子表):
  IPM_PayMode_DR   → CT_PayMode (支付方式DR)
  IPM_Amt          → 金额

DHC_BillConINV (账单-发票连接):
  DHCBCI_ADMDR     → PA_Adm (就诊DR)
  DHCBCI_INVDR     → DHC_INVPRT (发票DR)
  DHCBCI_PatBillDR → DHC_PatientBill (账单DR)
```

### 1.6 医保链路

```
INSU_AdmInfo:
  INADM_AdmDr      → PA_Adm (就诊DR)
  INADM_ActiveFlag → 有效标志

INSU_Divide:
  INPAY_AdmDr        → PA_Adm (就诊DR)
  INPAY_AdmInfoDr    → INSU_AdmInfo (医保登记DR)
  INPAY_DhcInvPrtDr  → DHC_INVPRT (门诊发票DR)
  INPAY_DHCpblDr     → DHC_PatientBill (账单号，住院有值)
  INPAY_Flag         → D=预结算, I=结算, B=作废, S=红冲

INSU_DivideSub (收费项分解):
  INDIS_ArcimDr    → ARC_ItmMast (医嘱项DR)
  INDIS_TarItmDr   → DHC_TarItem (收费项DR)
  INDIS_OEORI_Dr   → OE_OrdItem (医嘱明细DR)
  INDIS_PB_Dr      → DHC_PatientBill (账单DR)
  INDIS_PBD_Dr     → DHC_PatBillDetails (账单明细DR)
  INDIS_INSUItmDr  → INSU_TarItems (医保目录DR)
```

### 1.7 就诊卡/账户链路

```
DHC_CardRef:
  CF_PAPMI_DR      → PA_PatMas (患者DR)
  CF_AccNo_DR      → DHC_AccManager (账户DR)
  CF_CardType_DR   → DHC_CardTypeDef (卡类型DR)
  CF_ActiveFlag    → N=正常, S=挂起, R=回收, D=作废, UA=未激活

DHC_AccManager:
  AccM_PAPMI_DR    → PA_PatMas (患者DR)
  AccM_Balance     → 账户余额
  AccM_AccStatus   → N=正常, F=已结算, S=挂起

DHC_AccPreDeposit (预交金子表):
  AccPD_Type       → P=充值, F=退款
  AccPD_PreSum     → 充值/退款金额
  AccPD_Left       → 账户余额

DHC_AccPayList (消费明细子表):
  AccPL_PAPMI_DR   → PA_PatMas (患者DR)
  AccPL_InvPrt_DR  → DHC_INVPRT (门诊发票DR)
  AccPL_PayNum     → 消费金额
  AccPL_Left       → 消费后余额

DHC_AccPayINV (一卡通集中打印发票表):  ^DHCINVPRTAP(rowId)
  ^1  = API_Amount       → 发票金额
  ^2  = API_Flag         → 票据状态(N正常/A作废/S红冲)
  ^3  = API_Date         → 日期
  ^4  = API_Time         → 时间
  ^5  = API_PUser_DR     → 票据打印人 → SS_User
  ^6  = API_INVNo        → 发票号
  ^10 = API_PayINV_DR    → 作废时指向原发票DR
  ^11 = API_PAPMI_DR     → PA_PatMas (患者DR)
  ^12 = API_AccMan_DR    → DHC_AccManager (账户DR)
  ^13 = API_PatientShare → 患者自付
  ^14 = API_DiscAmount   → 折扣金额
  ^15 = API_PayorShare   → 医保支付
  ^16 = API_SelfPatPay   → 卡支付金额
  ^17 = API_SelfYBPay    → 自费医保金额
  ^18 = API_RefundSum    → 退费金额
  ^19 = API_InsDiv_DR    → INSU_Divide (医保分解DR)
  ^22 = API_OldAPINV_DR  → 退费时指向原发票DR
  ^30 = API_Hospital_DR  → CTHospital (医院DR)
  ^31 = API_InsType_DR   → PAC_AdmReason (患者医保类型)
  ^34 = API_Handin       → 交款标志(Y/N)
  子表: ChildDHCAccPayINVMode → User.DHCAccPayINVMode
  索引: IndexPapmi(患者), IndexDate(日期), IndexINVNo(发票号), IndexUserDate(操作员+日期)

DHC_AccPayINVMode (集中打印发票支付方式子表):
  APM_API_ParRef   → DHC_AccPayINV (父表)
  APM_PayMode_DR   → CT_PayMode (支付方式DR)
  APM_CMBankDR     → CMC_BankMas (银行DR)
  APM_Amt          → 金额

DHC_AccPrePayMode (预交金支付方式子表):
  APPM_ACCPD_ParRef → DHC_AccPreDeposit (父表)
  APPM_PayMode_DR   → CT_PayMode (支付方式DR)
  APPM_Amt          → 金额

DHC_BillConINV (账单-发票关联表):  ^DHCBCI(rowId)
  ^1 = DHCBCI_INVDR     → DHC_INVPRT (门诊发票DR)
  ^2 = DHCBCI_PatBillDR → DHC_PatientBill (账单DR)
  ^3 = DHCBCI_ADMDR     → PA_Adm (就诊DR)
  索引: indexinv(发票DR), indexbill(账单DR), indexadm(就诊DR)
```

### 1.8 挂号/预约链路

```
RB_Resource:
  RES_CTLOC_DR     → CT_Loc (科室DR)
  RES_CTPCP_DR     → CT_CareProv (医护人员DR)

RB_ApptSchedule (排班，RB_Resource子表):
  AS_RES_ParRef    → RB_Resource (资源DR，格式 resId)
  AS_Date          → 排班日期
  AS_Load          → 号源总数

RB_Appointment (预约，排班子表):
  AS_PAPMI_DR      → PA_PatMas (患者DR)
  AS_Status         → I=已插入, A=已就诊, X=已取消, N=未到
  AS_Adm_DR        → PA_Adm (就诊DR)
  AS_Method_DR     → RBC_AppointMethod (预约方式DR)

DHCRegistrationFee:
  RegfeeAdmDr      → PA_Adm (就诊DR)
  RegfeeRBASDr     → RB_ApptSchedule (排班DR)

DHCQueue:
  QuePaadmDr       → PA_Adm (就诊DR)
  QueDepDr         → CT_Loc (科室DR)
  QueDocDr         → CT_CareProv (呼叫医生DR)
  QueStateDr       → DHC_PerState (队列状态DR)
```

### 1.9 三大项关联链路（医嘱项↔计费项↔库存项）

> 来源：图谱2、三大项等数据表简要图谱 | HIS 核心三角关系

```
┌─────────────────┐      DHC_OrderLinkTar       ┌─────────────────┐
│  ARC_ItmMast    │ ←─────────────────────────→  │  DHC_TarItem    │
│  (医嘱项表)     │   OLT_ARCIM_DR → 医嘱项DR    │  (计费项表)     │
│                 │   OLT_Tariff_DR → 计费项DR   │                 │
│  ^ARCIM(sub,1)  │   OLT_Qty → 对应数量         │  ^TARI(rowId)   │
└────────┬────────┘                              └────────┬────────┘
         │ ARCIM_Generic_DR                               │ tari_subcate → 收费子分类
         ↓                                                │ tari_acctcate → 会计子分类
┌─────────────────┐                                       │ tari_outpatcate → 门诊子分类
│  PHC_Generic    │                                       │ tari_inpatcate → 住院子分类
│  (通用名表)     │                                       │ tari_emccate → 核算子分类
└─────────────────┘                                       │ tari_mrcate → 病案子分类
                                                          │ tari_uom → 计价单位(非药品)
                                                          ↓
                                                 DHC_TarItemPrice (计费项价格子表)
                                                   TP_TARI_ParRef → DHC_TarItem (父表)
                                                   TP_PatInsType → 患者医保类型(一般自费)
                                                   TP_StartDate → 价格开始日期
                                                   TP_Price → 计费项价格

┌─────────────────┐
│  INC_ITM        │
│  (库存项表)     │   INCI_OriginalARCIM_DR → ARC_ItmMast (医嘱项DR)
│  ^INCI(rowId)   │   INCI_CTUOM_DR → CT_UOM (基本单位)
│                 │   INCI_CTUOM_Purch_DR → CT_UOM (采购单位)
│                 │   INCI_InCTG_DR → INC_StkTkGp (盘点分类)
│                 │   INCI_InCSC_DR → INC_StkCat (库存分类)
│                 │   INCI_FinalVendor_DR → APC_Vendor (供应商)
└─────────────────┘
```

**ARC_ItmMast 医嘱项核心指针：**
```
ARC_ItmMast(sub,1)^1   → 项目代码
ARC_ItmMast(sub,1)^2   → 项目名称
ARC_ItmMast(sub,1)^10  → ARC_ItemCat (医嘱子类DR) → OEC_OrderCategory (医嘱大类)
ARC_ItmMast(sub,1)^12  → PHC_DrgForm (药学剂型DR，药品专用)
ARCIM_BillSub_DR       → ARC_BillSub (账单子类DR) → ARC_BillGrp (账单大类)
ARCIM_BillingUOM_DR    → CT_UOM (计价单位)
ARCIM_Generic_DR       → PHC_Generic (通用名)
ARCIM_PHCDF_DR         → PHC_DrgForm (药学剂型)
ARCIM_OrderOnItsOwn    → 是否独立医嘱(Y/N)
ARCIM_AllowOrderWOStockCheck → 无库存医嘱(Y/N)
```

**关联查询典型场景：**
| 场景 | 链路 |
|------|------|
| 医嘱项→计费项 | OE_OrdItem → ARC_ItmMast → DHC_OrderLinkTar → DHC_TarItem |
| 医嘱项→库存项 | ARC_ItmMast ← INCI_OriginalARCIM_DR → INC_ITM |
| 计费项→价格 | DHC_TarItem → DHC_TarItemPrice (按医保类型+日期取价格) |
| 医嘱项→别名 | ARC_ItmMast ← alias_arcim_dr → ARC_Alias (alias_text=别名) |
| 医嘱项→医嘱套 | ARC_Alias (alias_arcos_dr → ARC_OrdSets) |

### 1.10 药房辅助链路

> 来源：图谱8/9、门诊/住院药房涉及表简要图谱 | 补充发药/退药辅助表

```
DHC_PHARWIN (门诊药房业务入口表，药品收费时同步写入):  ^DHCPHARW(rowId), 索引 ^DHCPHARi
  ^1  = PHA_PRT_DR       → DHC_INVPRT (发票DR)
  ^2  = PHA_DATE         → 日期
  ^3  = PHA_PHL_DR       → DHC_PHLOC (药房DR)
  ^4  = PHA_PHW_DR       → DHC_PHWINDOW (发药窗口DR)
  ^6  = PHA_FINFLAG      → 结束标志
  ^8  = PHA_PRINTFLAG    → 打印标志
  ^13 = PHA_RETFLAG      → 退药标志
  ^15 = Pha_phpy_dr      → DHC_PHPYWIN (配药窗口DR)
  ^16 = Pha_PrescNo      → 处方号
  ^17 = PHA_PRINTUSER_DR → DHC_PHPERSON (打印人DR)
  ^19 = PHA_PAPMI_DR     → PA_PatMas (患者DR)
  ^35 = PHA_Status       → 配发状态
  ^36 = PHA_StartPyFlag  → 配药标志(10=可配, 20=已配)

DHC_PHPYWIN (配药窗口表，父表):
  PHPY_PHL_DR      → DHC_PHLOC (药房DR)
  PHPY_DoFlag      → 在用标志

dhc_phpywinsub (药房与配药窗口对照子表):
  PHPYS_PHPY_ParRef → DHC_PHPYWIN (父表)
  PHPYS_PHW_DR     → DHC_PHWINDOW (发药窗口DR)

DHC_PHWINDOW (发药窗口表):
DHC_PHLOC (药房表):
DHC_PHPERSON (药房人员表):
  PHP_PHL_DR       → DHC_PHLOC (药房DR)
  PHP_SSUSR_DR     → SS_User (用户DR)
  PHP_PYFlag       → 配药标志
  PHP_FYFlag       → 发药标志
  PHP_UseFlag      → 在用标志

DHC_PHWPER (药房与发药窗口对照表):
  PHWP_PHW_DR      → DHC_PHWINDOW (窗口DR)
  PHWP_PHL_DR      → DHC_PHLOC (药房DR)
  PHWP_DoFlag      → 在用标志

DHC_PhaRetRequest (退药申请表):  ^RETRQ(rowId)
  ^1  = RETRQ_ReqNo       → 退药申请单号
  ^2  = RETRQ_RecLoc_DR   → CT_Loc (药房DR)
  ^3  = RETRQ_Papmi_DR    → PA_PatMas (患者DR)
  ^5  = RETRQ_PAADM_DR    → PA_Adm (就诊DR)
  ^6  = RETRQ_Doctor_DR   → CT_CareProv (申请医生DR)
  ^7  = RETRQ_Dept_DR     → CT_Loc (申请科室DR，病区退药存病区，特殊科室退药存医生科室)
  ^8  = RETRQ_Bed_DR      → PAC_Bed (床号DR)
  ^14 = RETRQ_Status      → 申请单状态(Prove待退/Execute已退/Ignore取消/Refuse拒绝)
  ^15 = RETRQ_OperUser_DR → SS_User (操作人DR)
  ^16 = RETRQ_OperDate    → 操作日期
  ^17 = RETRQ_OperTime    → 操作时间
  ^18 = RETRQ_UpdateUser_DR → SS_User (修改人DR)
  ^21 = RETRQ_WardLoc_DR  → CT_Loc (病区科室DR，支持病区退特殊科室药)
  ^22 = RETRQ_SendFlag    → 发送标志(Y/N)
  ^23 = RETRQ_AuditFlag   → 审核标志(Y/N)
  ^24 = RETRQ_AuditUser   → SS_User (审核人)
  ^27 = RETRQ_PrintFlag   → 打印标志(Y/N)
  子表: ChildDHCPhaRetRequestItm → User.DHCPhaRetRequestItm
  索引: IndexRecStatusDept(药房+状态+科室), IndexNO(申请单号), IndexDate(操作日期)

DHC_PhaCollectOutDrug (出院带药表，父表):
  PCOD_Ward_DR     → PAC_Ward (病区DR)
  PCOD_Adm_DR      → PA_Adm (就诊DR)
  PCOD_SSUSR_DR    → SS_User (操作人DR)
  PCOD_PHALoc_DR   → DHC_PHLOC (药房DR)

DHC_PhaCollectOutDrugDet (出院带药明细子表):
  PCODL_PHAC_ParRef → DHC_PhaCollectOutDrug (父表)
  PCODL_PHACI_DR   → DHC_PHACollectItm (住院发药子表DR)

DHC_STDRUGREFUSE (住院药房拒发药表):
  STDF_OEDI_DR     → OE_OrdItem (医嘱DR)
  STDF_User_DR     → SS_User (操作人DR)
  STDF_Loc_DR      → CT_Loc (科室DR)
  STDF_RefReason_DR → DHC_STRefuseReason (拒发药原因DR)
  STDF_DOIDS_DR    → DHC_OEDispensing (打包表DR)

DHC_STRefuseReason (拒发药原因表):
```

---

## 二、业务数据流图

### 2.1 门诊全流程

```
患者建档(PA_PatMas) → 挂号(RB_Appointment/DHCRegistrationFee) → 分诊(DHCQueue)
    ↓
就诊(PA_Adm) → 开医嘱(OE_OrdItem) → 执行(OE_OrdExec)
    ↓                    ↓
    ↓              打包(DHC_OEDispensing)
    ↓                    ↓
    ↓         ┌─ 药品 → 门诊发药(DHC_PHDISPEN → DHC_PHDISITEM)
    ↓         └─ 非药品 → 直接计费
    ↓
收费时生成账单(DHC_PatientBill → PBO → PBD)
    ↓
缴费 → 发票(DHC_INVPRT) → 支付方式(DHC_INVPayMode)
    ↓
医保结算(INSU_Divide) → 账单-发票关联(DHC_BillConINV)
```

### 2.2 住院全流程

```
住院登记(PA_Adm, Type=I) → 入院科室 → 转科(PA_AdmTransaction)
    ↓
开医嘱(OE_OrdItem) → 执行(OE_OrdExec) → 打包(DHC_OEDispensing)
    ↓                                         ↓
    ↓                              住院发药(DHC_PHACollected → DHC_PHACollectItm)
    ↓                              发药批次(DHC_PhaCollectItmLB → INC_ItmLcBt)
    ↓
交押金(AR_Receipts → AR_RcptAlloc → AR_RcptPayMode)
    ↓
出院结算:
  1. 生成账单(DHC_PatientBill → PBO → PBD)
  2. 医保结算(INSU_Divide)
  3. 押金抵扣(更新 AR_RcptAlloc.ARAL_ARPBIL_DR)
  4. 退押金(AR_Receipts 插入负记录)
  5. 住院发票(DHC_INVPRTZY)
```

### 2.3 门诊退费流程

```
1. 停医嘱(OE_OrdItem 状态→D)
2. 生成负账单:
   - 原账单: PB_RefundFlag = "B"(被退费), PB_OriginalBill_DR → 新账单
   - 新账单: PB_RefundFlag = "R"(退费), PB_OriginalBill_DR → 原账单
   - PBO: 插入负记录
3. 退费发票(DHC_INVPRT, PRT_Flag="S"红冲)
4. 退费后原发票: PRT_Flag="A"作废
```

### 2.4 住院退药流程

```
退药申请(DHC_PhaRetRequest):
  - 条件: DSP_Status="C"(已发药) + 医嘱已停(STAT_Code="D") + 未出院
  - RETRQI_OEDIS_DR → DHC_OEDispensing (打包表)
  - RETRQI_Qty → 退药数量
  - RETRQ_Status → Prove(待退)/Execute(已退)/Ignore(取消)

退药执行(DHC_PhaReturn → DHC_PhaReturnItm):
  - 有申请单: 从 DHC_PhaRetRequest 查找 RETRQ_Status="Prove"
  - 直接退药: 从 DHC_OEDispensing 查找 DSP_Status="C"
  - 退药后: 打包表 DSP_Status→R, 插入新 DSP 记录(Type=Y)
  - 库存退回: 批次表+科室库存表+台账 更新
```

### 2.5 门诊发药流程

```
入口: DHC_PHARWIN (药房业务入口表)
  ↓
药品收费时 → 打包(DHC_OEDispensing, DSP_Type=F)
  ↓
配药 → 门诊发药主表(DHC_PHDISPEN)
  PHD_PRT_DR → 发票指针
  PHD_PHP_PYDR → 配药人(DHC_PHPERSON)
  PHD_PHP_FYDR → 发药人(DHC_PHPERSON)
  PHD_PrescNo → 处方号
  ↓
发药明细 → DHC_PHDISITEM
  PHDI_OEORI_DR → 医嘱指针
  ↓
发药批次 → DHC_PHDISITMCLB
  PHDIC_INCLB_DR → 科室批次库存
  PHDIC_DSPB_DR → 打包批次
```

### 2.6 库存变动流程

```
入库(DHC_INGdRec → DHC_INGdRecItm):
  INGRI_INCLB_DR → 科室批次库存
  INGRI_INCIB_DR → 库存项批次
  → 更新科室库存表(DHC_LocDailyTotal)
  → 写入台账(DHC_Intrans, Type=G)

退货(DHC_INGdRet):
  → 更新科室库存
  → 写入台账(Type=R)

转移(DHC_InIsTrf → DHC_InIsTrfItm):
  → 更新双方科室库存
  → 写入台账(Type=T转出/K转入)

发药:
  → 更新科室库存
  → 写入台账(Type=P住院发药/F门诊发药)

退药:
  → 退回科室库存
  → 写入台账(Type=Y住院退药/H门诊退药)
```

---

## 三、关键状态机

### 3.1 医嘱状态 (OEC_OrderStatus)

```
新开(V) → 核实(V) → 执行(E) → 停止(D)
                ↘ 撤销(U)
```

### 3.2 打包状态 (DHC_OEDispensing.DSP_Status)

```
TC(未发药) → C(已发药) → R(退药)
```

### 3.3 账单状态

```
PB_PayedFlag: B(未结算) → P(已结算)
PB_RefundFlag: 空(正常) → R(退费新账单) / B(被退费原账单)
PBO_BillStatus: 空(未缴费) → B(已缴费)
```

### 3.4 发票状态 (DHC_INVPRT.PRT_Flag)

```
N(正常) → A(作废) / S(红冲)
```

### 3.5 医保结算状态 (INSU_Divide.INPAY_Flag)

```
D(预结算) → I(结算) → B(作废) / S(红冲)
```

### 3.6 预约状态 (RB_Appointment.APPT_Status)

```
I(已插入) → A(已就诊) / X(已取消) / N(未到) / D(已离开)
```

### 3.7 队列状态 (DHC_PerState)

```
等候 → 到达/报到 → 就诊中 → 完成 / 过号
```

### 3.8 发药退药状态 (DHC_PHACollected.DHC_PHACollectStatus)

```
Print(已打印) → Collect(已发药)
```

---

## 四、关键业务规则

### 4.1 账单生成规则

| 场景 | 规则 |
|------|------|
| 门诊 | 开医嘱时不生成账单，收费刷卡时根据就诊医嘱生成 |
| 住院 | 医嘱执行后自动生成账单 |
| 每次缴费 | 生成新的账单(同一就诊可有多个账单) |
| 药品账单 | 从 DHC_OEDispensing 取数据 |
| 非药品账单 | 从 OE_OrdItem 取数据 |

### 4.2 退费规则

| 步骤 | 操作 |
|------|------|
| 1 | 停医嘱(OE_OrdItem 状态→D) |
| 2 | 原账单: PB_RefundFlag="B", PB_OriginalBill_DR→新账单 |
| 3 | 新增负账单: PB_RefundFlag="R", PB_OriginalBill_DR→原账单 |
| 4 | PBO 插入负记录 |
| 5 | 部分退费: 再插入正记录(不退部分) |

### 4.3 发药取数据规则

| 类型 | 待发药来源 | 已发药来源 |
|------|-----------|-----------|
| 门诊发药 | DHC_OEDispensing, DSP_Status="TC" | DHC_PHDISPEN |
| 住院发药 | DHC_OEDispensing, DSP_Status="TC" | DHC_PHACollected |
| 门诊退药 | DHC_PHDISPEN + DHC_PHDISITEM | DHC_PHRETURN |
| 住院退药 | DHC_OEDispensing, DSP_Status="C" + 医嘱已停 | DHC_PhaReturn |

### 4.4 住院押金结算规则

```
交押金:
  → dhc_sfprintdetail (流水记录)
  → AR_Receipts (押金主表)
  → AR_RcptAlloc (押金明细)
  → AR_RcptPayMode (支付方式)

出院结算:
  → 更新 dhc_sfprintdetail.prt_paidflag = "Y"
  → AR_Receipts 插入负记录(退押金)
  → AR_RcptAlloc 插入负记录 + 更新 ARAL_ARPBIL_DR(账单号)
```

### 4.5 台账类型编码 (DHC_Intrans.INTR_Type)

| 编码 | 含义 |
|------|------|
| G | 入库 |
| T | 转出 |
| K | 转入 |
| A | 调整 |
| R | 退货 |
| C | 消耗 |
| D | 报损 |
| P | 住院发药 |
| Y | 住院退药 |
| F | 门诊发药 |
| H | 门诊退药 |
| S | 非正常门诊发药 |
| Z | 非正常门诊退药 |

### 4.6 住院发药条件规则

> 待发药记录从 DHC_OEDispensing 取得，DSP_Status="TC"，还需满足：

| # | 条件 | 字段 | 说明 |
|---|------|------|------|
| 1 | 仅长期医嘱 | OECPR_Code="S" | 选择时过滤，不选时排除 |
| 2 | 出院带药 | OECPR_Code="OUT" | 选择时只取OUT，未选时排除OUT |
| 3 | 仅临时医嘱 | OECPR_Code≠"S"且≠"OUT" | 排除S和OUT |
| 4 | 皮试检查 | OEORI_AdministerSkinTest=Y | 要求皮试时，Abnormal必须=N |
| 5 | 审核检查 | — | 未审核的医嘱不能发药 |
| 6 | 科室过滤 | CT_LocLinkLocation | 检查医生科室是否在发药科室关联列表 |

### 4.7 住院退药条件规则

待退记录：DSP_Status="C" + DSP_Qty≠0 + 未出院(VistStatus≠"D") + 医嘱已停(STAT_Code="D")

| 模式 | 流程 |
|------|------|
| 申请单退药 | 查 RETRQ_Status="Prove" → 执行 → 状态→"Execute" |
| 直接退药 | 查 DSP_Status="C" → 直接退药 |

### 4.8 门诊发药条件规则

| 条件 | 说明 |
|------|------|
| DSP_Status="TC" | 未发药的打包记录 |
| 皮试 | 要求皮试时结果必须正常 |
| 审核 | 未审核的医嘱不能发药 |
| 发药权限 | 药房人员发药权限校验(PHAOP_DispLimit) |

---

## 五、索引选择决策指南

> 当接口入参为日期范围时，入口表和索引的选择直接影响性能、数据完整性和代码复杂度。

> **⚠️ 固定规则**：日期范围查询必须带院区ID参数，按输出格式区分入参方式：Query → `pHospitalId As %String=""`；JSON → 入参JSON加 `hospitalId` 节点；XML → 入参XML加 `<HospitalId>` 节点。默认空（兼容单院区），有传入时按 `Hospital_DR` 过滤。（P0 #12）

### 5.1 决策四原则

按优先级从高到低：

| 优先级 | 原则 | 说明 |
|:------:|------|------|
| **1** | **文档约束** | 接口文档明确指定了入参语义时（如"按就诊日期查"），**必须遵循文档要求**选择入口表，即使这不是技术最优解 |
| **2** | **数据主权** | 文档未指定时，接口输出谁的数据就从谁出发。发票数据→DHC_INVPRT，就诊数据→PA_Adm，医嘱数据→OE_OrdItem |
| **3** | **过滤效率** | 选择能最大程度缩小遍历范围的索引。组合索引(日期+状态) > 单字段索引(日期) > 全表遍历 |
| **4** | **关联路径** | 从入口到目标数据的跳转次数越少越好。每多一跳 = 多一层性能损耗 + 出错风险 |

### 5.2 决策流程图

```
接口文档对入参有明确语义要求吗？
  ├─ 有（如"按就诊日期"）→ 必须按文档要求选择入口表 + 对应索引
  └─ 无明确要求 ↓
接口输出的主体数据是什么？（数据主权原则）
  ↓
确定"主权表" → 检查主权表是否有日期索引？
  ├─ 有 → 用主权表日期索引（最优）
  └─ 无 → 从有日期索引的关联表出发，跳转到主权表
  ↓
是否有更精确的组合索引？（过滤效率原则）
  ├─ 有(日期+状态/日期+科室) → 优先用组合索引
  └─ 无 → 用单字段日期索引 + 代码中过滤
```

### 5.3 核心表索引速查（MCP 验证）

#### DHC_INVPRT（门诊发票）^DHCINVPRT

| 索引名 | Global 结构 | 适用场景 |
|--------|-----------|---------|
| indexDate | ^DHCINVPRT(0,"Date",date,rowId) | **按收费日期遍历**（最常用） |
| IndexUserDate | ^DHCINVPRT(0,"UserDate",usr,date,rowId) | 按收费员+日期 |
| indexDatePapmi | ^DHCINVPRT(0,"DatePAPMI",date,papmi,rowId) | 按日期+患者 |
| IndexHandinDate | ^DHCINVPRT(0,"HandDate",handinDate,rowId) | 按交款日期 |
| IndexPapmi | ^DHCINVPRT(0,"PAPMI",papmi,rowId) | 按患者查所有发票 |
| indexDateInsType | ^DHCINVPRT(0,"DateInsType",date,insType,rowId) | 按日期+费别 |

#### PA_Adm（就诊记录）^PAADM

| 索引名 | Global 结构 | 适用场景 |
|--------|-----------|---------|
| PAADMDepCodeDR | ^PAADM(0,"DepCode",deptDR,date,rowId) | **按科室+就诊日期**（门诊常用） |
| PAADMDate | ^PAADM(0,"PAADM_AdmDate",date,rowId) | 按就诊日期遍历 |
| PAADMPAPMIDR | ^PAADM(0,"PAPMI",papmi,rowId) | 按患者查所有就诊 |
| PAADMType | ^PAADM(0,"Type",type,rowId) | 按就诊类型(O/I/E/H) |

#### OE_OrdItem（医嘱明细）^OEORD

| 索引名 | Global 结构 | 适用场景 |
|--------|-----------|---------|
| OEORIItmMastDR | ^OEORDi(0,"ARCIM",arcim,date,rowId,childSub) | 按医嘱项+日期 |
| OEORIDepProcNotes | ^OEORDi(0,"RecDepStatDate",recDep,status,date,...) | 按接收科室+状态+日期 |
| OEORISttDat | ^OEORDi(0,"StDt",date,ordId,childSub) | 按医嘱开始日期 |

#### DHC_PatientBill（账单）^DHCPB

| 索引名 | Global 结构 | 适用场景 |
|--------|-----------|---------|
| indexAdmDate | ^DHCPB(0,"AdmDate",date,rowId) | **按就诊日期**（与PA_Adm关联） |
| INDEXUpdateDate | ^DHCPB(0,"Date",updateDate,rowId) | 按账单更新日期 |
| INDEXPAAdm | ^DHCPB(0,"ADM",admDR,rowId) | 按就诊ID |
| INDEXPayedFlag | ^DHCPB(0,"PayedFlag",flag,rowId) | 按结算状态 |

#### DHC_OEDispensing（打包表）^DHCOEDISQTY

| 索引名 | Global 结构 | 适用场景 |
|--------|-----------|---------|
| INDEXRecDep | ^DHCOEDISQTY(0,"REC",recDep,dateDosing,status,...) | **按接收科室+配药日期+状态**（发药主查询） |
| INDEXRecDepAdm | ^DHCOEDISQTY(0,"ADM",recDep,dateDosing,status,adm,...) | 按科室+就诊 |
| INDEXOEORI | ^DHCOEDISQTY(0,"OEORI",oeori,rowId) | 按医嘱明细 |

#### DHC_PHDISPEN（门诊发药）^DHCPHDISPN

| 索引名 | Global 结构 | 适用场景 |
|--------|-----------|---------|
| PHDDate | ^DHCPHDISPN(0,"DatePhl",date,phl,rowId) | **按日期+药房**（门诊发药主查询） |

#### DHC_PHACollected（住院发药）^DHCPHACOL

| 索引名 | Global 结构 | 适用场景 |
|--------|-----------|---------|
| PHACDate | ^DHCPHACOL(0,"DatePhlLoc",date,phlLoc,rowId) | **按日期+药房科室**（住院发药主查询） |

### 5.4 典型场景决策示例

#### 场景1：门诊患者结算收费信息（文档未指定入参语义）

**入参**：startDate, endDate
**输出**：发票号、金额、患者、科室、支付方式

```
✅ 正确：从 DHC_INVPRT 出发
  索引：indexDate → ^DHCINVPRT(0,"Date",date)
  过滤：PRT_FairType="F"(收费发票), PRT_Flag="N"(正常)
  跳转：DHC_INVPRT → PA_Adm(取患者/科室) → DHC_INVPayMode(取支付方式)
  优势：遍历量小，天然过滤未收费/挂号/作废发票

❌ 错误：从 PA_Adm 出发
  索引：PAADMDate → ^PAADM(0,"PAADM_AdmDate",date)
  问题：大量就诊没有发票，遍历浪费；就诊日期≠收费日期
```

#### 场景2：某日期就诊患者的结算收费记录（文档指定"按就诊日期"）

**入参**：startDate, endDate（就诊日期）
**输出**：患者、就诊信息、发票号、金额

```
✅ 正确：从 PA_Adm 出发（遵循文档约束）
  索引：PAADMDate → ^PAADM(0,"PAADM_AdmDate",date)
  过滤：PAADM_Type="O"(门诊), PAADM_VisitStatus="A"(正常)
  跳转：PA_Adm → DHC_BillConINV → DHC_INVPRT → DHC_INVPayMode
  说明：虽然从发票表出发效率更高，但文档要求"按就诊日期"，必须遵循
```

#### 场景3：住院患者医嘱执行信息（文档未指定）

**入参**：startDate, endDate
**输出**：医嘱名称、执行时间、执行人、患者

```
✅ 正确：从 OE_OrdExec 出发
  索引：按执行日期
  跳转：OE_OrdExec → OE_OrdItem(取医嘱) → PA_Adm(取患者)
  优势：直接拿到执行记录，天然过滤未执行医嘱

❌ 错误：从 PA_Adm → OE_Order → OE_OrdItem → OE_OrdExec
  问题：4跳，遍历大量未执行医嘱
```

#### 场景4：按患者ID查结算信息

**入参**：patientId
**输出**：发票、账单、支付方式

```
✅ 正确：从 DHC_INVPRT 出发
  索引：IndexPapmi → ^DHCINVPRT(0,"PAPMI",papmi)
  优势：直接按患者定位，无需遍历日期

✅ 也可：从 PA_Adm 出发
  索引：PAADMPAPMIDR → ^PAADM(0,"PAPMI",papmi)
  然后：PA_Adm → DHC_BillConINV → DHC_INVPRT
```

### 5.5 特殊情况处理

| 情况 | 处理方案 |
|------|---------|
| 主权表没有日期索引 | 从有日期索引的关联表出发跳转；或用组合索引中的日期字段 |
| 文档入参与最佳索引冲突 | **文档优先**，遵循文档指定的入参语义 |
| 日期遍历量仍然很大 | 增加过滤条件（科室/收费员/状态），利用组合索引缩小范围 |
| 同时输出多维度数据 | 以最主要维度的主权表为入口，其他维度通过关联获取 |
| 需要输出"未发生"的数据（如未收费就诊） | 必须从"主表"出发（PA_Adm），不能从"子表"出发（DHC_INVPRT） |

---

## 六、Agent 使用指引

> 查表流程需结合第五章索引选择指南，确定入口表后再执行以下步骤。

### 生成接口代码时的查表流程

```
1. 确定接口需要哪些字段
   ↓
2. 查 his-table-moc.md 找到主表和类名
   ↓
3. 查本文档 DR 指针速查表，确定是否需要跨表取值
   ↓
4. 查本文档业务数据流图，确定遍历链路
   ↓
5. 查本文档状态机，确定状态过滤条件
   ↓
6. 查本文档业务规则，确定特殊逻辑(退费/退药/押金等)
   ↓
7. 使用 MCP iris_doc 读取实体类，获取精确字段位置
   ↓
8. 生成代码
```

### 关联文件

| 文件 | 用途 |
|------|------|
| `his-table-moc.md` | 表名→类名→Global 索引 |
| `his-data-flow.md` | 本文档，DR指针+数据流+状态机+业务规则 |
| `iris-naming-conventions.md` | 命名约定+Global前缀 |
| `rules/domains/*.md` | 各域取值规则(含具体Piece位置) |
