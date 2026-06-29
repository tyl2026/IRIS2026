# 规则库完善工作进度

> 最后更新：2026-05-30（Session 14 — **MCP驱动规则库扩充: Phase1补充+Phase2新增2域**）

## 当前状态总览

||| 指标 | 值 |
|||------|-----|
||| **规则库版本** | v2.5.0 |
||| **域文件总数** | **18 个** (+ 2个辅助域 z0-common / zz-custom) |
||| **已完成(SOP标准)** | **18 域** (含新增A3-card-account域, 10-registration合并升级) |
||| **骨架版(待IRIS补全)** | **0 域** 全部升级完成! ||
||| **未完成(全新)** | **0 个域** 全部完成! |||
||| **总进度** | **~100%** (18/18域, ~818+条规则) |

## 域完成情况详表

|||| 域ID | 名称 | 规则数 | 状态 | SOP等级 | 版本 | 最后更新 | 来源类/学习材料 |||
|||------|------|--------|--------|------|---------|------|---------|-------------|||
||| 0 | `00-dictionary` | 字典域(核心基础) | **36** | ✅ 完成 | ✅ SOP标准版 | v1.0.0 | 2026-05-11 | CTLOC/CTPCP/SSUser/PACWard/PACBed/ARCItmMast (6大类) |||
||| 1 | `01-user` | 用户/员工域 | 39 | ✅ 完成 | ✅ 完整版 | v2.2.0 | 2026-05-11 | SSUser/SSU/CTPCP/CTLOC/RB |||
||| 2 | `10-patient` | 患者主索引域 | **64** | ✅ 完成 | ✅ MCP增强版 | **v2.3.0** | **2026-05-30** | PAPatMas+PAPerson/^PAPER; MCP补充PER,1/PER,2/NOK节点9条 |||
||| 3 | `20-visit` | 就诊/入院域 | **63** | ✅ 完成 | ✅ MCP增强版 | **v2.3.0** | **2026-05-30** | PAAdm/^PAADM; MCP补充AdmCategory/Specialty/AdmSrc/RefDoc/DischDoctor/CreateDate/User 7条 |||
||| 4 | `30-diagnosis` | 诊断域 | 24+ | ✅ 完成 | ✅ 最高成熟度 | v3.2.0 | 2026-05-11 | MRAdm/MRDiagnos + AdmInfo.GetDiagnoses |||
||| 5 | `40-order` | 医嘱域 | 95 | ✅ 完成 | ✅ 完整版 | v2.4.0 | 2026-05-30 | OEOrder/^OEORD + OEOrdExec执行表 + OrderInfo.cls |||
||| 6 | `70-nursing` | EMR护理文书域 | 50 | ✅ 完成 | ✅ SOP标准版 | v2.0.0 | 2026-05-11 | BLScatterData术语集网关 + XY/ZYEMRData.cls |||
||| 7 | `d0-pharmacy` | 药品/药房域 | 161 | ✅ 完成 | ✅ SOP完整版 | v2.0.0 | 2026-05-11 | DrugInfo.cls (5Query+15Method) |||
||| 8 | `z0-common` | 跨域通用字段 | 7 | ✅ 完成 | ✅ SOP标准版 | v2.0.0 | 2026-05-11 | 跨域抽象(dataRowId位序) |||
||| 9 | `zz-custom` | 实战回流自定义规则 | 19 | ✅ 完成 | ✅ SOP增强版 | v2.0.0 | 2026-05-11 | InNonDrugOrder V4.0编译通过版 |||
||| 10 | `a0-fee-settlement` | 费用结算域(计费) | **57** | ✅ 完成 | ✅ MCP修正版 | **v2.2.0** | **2026-05-30** | DHCPatBillDetails+MCP修正3处字段错误+新增8条高频字段(PayorShare/AmountPaid/BillType等) |||
||| 11 | `50-lab-exam` | 检验检查域(LIS/平台组) | **95** | ✅ 完成 | ✅ SOP完整版(IRIS验证) | v2.1.0 | 2026-05-11 | GetLabReport.cls+EnsLIS*(149+34属性SQLStorage验证)+LabReport.cls生产源码IRIS验证 |||
||| 12 | `55-exam-report` | 影像检查报告域(RIS/PACS) | **67** | ✅ 完成 | ✅ SOP完整版 | v2.0.0 | 2026-05-11 | IRIS XML导出+GetPacsInfo QryRepByID双验证(67属性全确认) |||
||| 13 | **`60-surgery`** | **手术及麻醉操作域(CIS/ENS组)** | **58** | **✅ 完成** | **✅ 完整版** | **v1.0.0** | **2026-05-12** | **IPMethod.cls生产源码309行全析: OdsInpatientSurgeryRecords+GetOperSchedule(~50属性DynamicObject), 双版本CIS.AN新版+DHCANOP旧版, 28ROWSPEC字段精确追踪, 58条取值规则(G1-G10)** |||
||| 14 | `90-medical-record` | 病案首页域(EMR/CDA) | **85** | ✅ 完成 | ✅ SOP完整版 | v2.0.0 | 2026-05-12 | ZYEMRData.cls(8224行43Query)+ZYEMRDataCLZ.cls(175行C0009)源码全析; 44Query全部字段映射; 入院记录/病程记录/知情同意书完整取值表达式; 18个踩坑点 |||
||| 15 | **`A1-outpatient-invoice`** | **门诊发票/支付方式域** | **35** | **✅ 完成** | **✅ SOP标准版** | **v1.1.0** | **2026-05-30** | **User.DHCINVPRT.xml+User.DHCINVPayMode+User.DHCBillConINV类定义; 发票主表49字段+支付方式子表17字段+票据连接中间表; ^DHCINVPRT(0,"Date")日期索引遍历; ^DHCBCI(0,"INV"/"Bill"/"ADM")三维度索引; CT("PMT")支付方式字典+CMC("BANK")银行字典关联; 35条取值规则** |||
||| 16 | **`A2-insurance`** | **医保域** | **42** | **✅ 完成** | **✅ SOP标准版** | **v1.0.0** | **2026-05-30** | **User.INSUAdmInfo.xml+User.INSUDivide.xml类定义; 医保就诊登记52字段+医保费用分解71字段; ^DHCINADM(0,"ADM"/"ADMDate"/"CardNo")多索引; ^DHCINDIV(0,"Paadm")按就诊遍历; 统筹/大病/救助/账户四维支付; 42条取值规则** |||
||| 17 | **`10-registration`** | **挂号预约域(合并升级)** | **23** | **✅ 完成** | **✅ MCP增强版** | **v2.0.0** | **2026-05-30** | **合并排班预约(RB_Resource/RB_ApptSchedule/RB_Appointment/DHCQueue)+挂号费(DHCRegistrationFee); 全流程覆盖** |||
||| 18 | **`A3-card-account`** | **卡账户域(新增)** | **18** | **✅ 完成** | **✅ MCP提取版** | **v1.0.0** | **2026-05-30** | **MCP iris_doc提取: DHCCardRef(10条)+DHCAccManager(8条); ^DHCCARD/^DHCACD两表; 就诊卡/账户/预交金** |||

## 进度可视化

```
================================================================
  HIS接口取值规则库 — 17/17 域 SOP标准版 v2.5.0 ~777条规则
================================================================

已完成SOP标准版(17域):
█████████████████ 00-dictionary    v1.0.0  ✅ SOP标准版     36条
█████████████████ 01-user          v2.2.0  ✅ 完整版        39条
█████████████████ 10-patient       v2.2.0  ✅ 完整版        55条
█████████████████ 20-visit         v2.2.0  ✅ 完整版        56条
██████████████████████████████ 30-diagnosis      v3.2.0  ✅ 最高成熟度    24+条
█████████████████████ 40-order         v2.4.0  ✅ 完整版        95条
████████████████████ 70-nursing       v2.0.0  ✅ SOP版         50条
████████████████████████████████████ d0-pharmacy      v2.0.0  ✅ SOP完整版    161条
████████████ z0-common        v2.0.0  ✅ SOP版          7条
█████████████████████████████████████ zz-custom       v2.0.0  ✅ SOP增强版     19条
█████████████████████████████████████ a0-fee-settle   v1.0.0  ✅ SOP标准版    70+条
████████████████████████████████████████████ 55-exam-report   v2.0.0  ✅ SOP完整版    67条
████████████████████████████████████████████ 60-surgery      v1.0.0  ✅ 完整版        58条
████████████████████████████████████████ 50-lab-exam     v2.1.0  ✅ SOP完整版(IRIS验证) 95条
████████████████████████████████████████ 90-medical-rec   v2.0.0  ✅ SOP完整版    85条
████████████ A1-outpatient-inv  v1.1.0  ✅ SOP标准版        35条
████████████ A2-insurance       v1.0.0  ✅ SOP标准版 ★最新 42条

辅助域:
████ z0-common + zz-custom = 26条通用+自定义规则
================================================================
```

## 更新历史记录

### Session 10 (2026-05-12) — 收官之战!

||| 时间 | 操作 | 详情 |
|||------|------|------|
||| Session 9→10 | `90-medical-record.md` 新建 v1.0.0 骨架 | XYEMRData.xml IRIS导出完整分析(492KB/8723行/44Query); 确认架构%RegisteredObject Query类; 术语集HDSD00.03~16分类体系; C0001(88)/C0009(58)/C0016(107)三大巨型表映射; 公共21字段组识别; 41条上报规则骨架; 10个踩坑点 |
||| **Session 10** | **`60-surgery.md` 新建 v1.0.0 完整版 ★最后一个域!** | **IPMethod.cls OdsInpatientSurgeryRecords生产源码309行完整分析; 双版本架构(CIS.AN新版OperSchedule+Anaesthesia+OperationList + ^DHCANOP旧版); GetOperSchedule~50属性DynamicObject完整映射(10大类); ROWSPEC 28输出字段精确来源追踪; 标准编码转换链(GetStdCode/GetStd/ALPHAUP^SSUTIL4); NHS医保映射(GetOperConInfo); 关键Global清单11个; CIS.AN类继承体系5层图; 字典翻译方法6种; 58条取值规则(G1-G10); 10个踩坑点(索引空格/硬编码/$lgvs$p等); 与C0009对比分析(58vs28)** |

### Session 1~8 (2026-05-11) — 主体建设期

||| 时间 | 操作 | 详情 |
|||------|------|------|
||| Session 1 | `d0-pharmacy.md` v1→v2 重构 | DrugInfo.cls 生产源码, 161条实际规则, 1838行 |
||| Session 2 | `z0-common.md` v1→v2 SOP重构 | 7个通用字段补全dataRowId位序速查, 338行 |
||| Session 3 | `zz-custom.md` v1.1→v2 SOP增强 | 19条规则增补依赖关系DAG+15个踩坑+6条编码规范, 943行 |
||| Session 4 | `CLAUDE.md` + progress同步 | 统计快照9域/~317条; IRIS命名前缀映射表 |
||| Session 5 | `00-dictionary.md` 新建 v1.0.0 | MCP学习6大核心字典类, 36条取值规则 |
||| Session 6 | `A0-fee-settlement.md` 新建 v1.0.0 | IPMethod住院费用+DHCPatBillDetails 28属性; 三层嵌套PB→PBO→PBD; 70+条 |
||| Session 7 | `50-lab-exam.md` v1→v2 升级 | EnsLIS*(149+34) SQLStorage定义; LabReport/LabDetails双接口验证; 95条 |
||| Session 8a | `55-exam-report.md` 新建 v1.0.0 | GetPacsInfo.cls逆向; 12lg映射确认; 17条有效上报规则 |
||| Session 8b | `55-exam-report.md` v1→v2 升级 | IRIS XML导出67属性(47+11+7)全验证; SQLStorage Piece精确映射; 修正7处推测错误 |

### Session 9 (2026-05-11) — 病案首页域

||| 时间 | 操作 | 详情 |
|||------|------|------|
||| Session 9 | `90-medical-record.md` 新建 v1.0.0 骨架 | XYEMRData.xml 44Query完整提取; EMR散装数据引擎术语集体系; HDSD00.03~16十类术语集前缀 |

---

## SOP格式升级要点

本次将旧版全面升级为SOP标准版:

||| 升级项 | 说明 |
|||--------|------|
||| YAML Frontmatter | sourceClass(含methods列表)/entityGlobals/relatedDicts/totalRules |
||| Global速查表 | 每个关键Global的下标位置和含义 |
||| 数据流架构图 | ASCII art展示从入口Global到各子表的遍历链路 |
||| 规则依赖关系DAG |上下游关系图 |
||| 踩坑提示分级 | 高频 / 中频 / 低频 三级分类 |
||| 别名映射扩展表 | 含编号/关联字段/依赖方向 |

## 版本历史

||| 日期 | 版本 | 变更 |
|||------|------|------|
||| 2026-05-12 | **v2.3.0** | **90-medical-record骨架→完整版v2.0.0升级**: ZYEMRData.cls(8224行)+ZYEMRDataCLZ.cls(175行)源码全析, 44Query全部字段映射, 补充12个核心G类Query(C0034-C0045)详细取值表达式, 新增8个踩坑点; **智慧病房接口首次实战生成**(7接口); **CLAUDE.md优化**(343行→100行); 规则查找优先级修正(domains/ > common/ > custom/); 15/15域SOP标准版, ~680+条规则 |
||| 2026-05-12 | **v2.2.0** | **🎉 60-surgery 手术及麻醉操作域 v1.0.0 完整版: IPMethod.cls 309行源码全析, 双版本架构(CIS.AN新版+DHCANOP旧版), GetOperSchedule ~50属性DynamicObject, 28ROWSPEC精确追踪, 58条取值规则(G1-G10); 15/15域全部完成! 100%! 总计~658条规则** |
||| 2026-05-11 | v2.1.0 | 新增90-medical-record病案首页域v1.0.0骨架: XYEMRData.xml 44Query/492KB/8723行分析, %RegisteredObject Query类, EMR术语集体系HDSD00.03~16, 1200+字段; 总进度14/15域(~93%) |
||| 2026-05-11 | v2.0.0 | 55-exam-report影像检查报告域v1.0→v2.0完整升级: IRIS XML导出67属性全验证, SQLStorage Piece精确映射, GetPacsInfo 12lg映射100%吻合; 总进度13/15域(~90%) |
||| 2026-05-11 | v1.9.0 | 新增55-exam-report v1.0.0骨架 + 50-lab-exam升级v2.0标记; 总进度13/15域(~85%) |
||| 2026-05-11 | v1.8.0 | 新增A0-fee-settlement费用结算域v1.0.0(70+条); 总进度11/15域(~80%) |
||| 2026-05-11 | v1.5.0 | 新增00-dictionary字典域v1.0.0(36条); 总进度10/15域(~67%) |
||| 2026-05-11 | v1.4.0 | nursing/pharmacy/common/custom 4域升级SOP标准版; CLAUDE.md重写 |
||| 2026-05-11 | v1.3.0 | 30-diagnosis v3.2.0 (诊断域第4次迭代) |
||| 2026-05-11 | v1.2.0 | 新增40-order医嘱域(75条, OrderInfo.cls) |
||| 2026-05-10 | v1.1.0 | JSON转Markdown, 初始转换8域242条; P0/P1红线规则 |
||| 2026-04-30 | v1.0.0 | 初始版本527条JSON格式(15域全覆盖, 深度不足) |
