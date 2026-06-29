# HIS 关键 Global 速查

> 本文档记录 HIS 系统的关键 Global 结构及业务含义。新增 Global 知识时在此更新。

## 患者与就诊（Patient & Admission）

| Global | 存储内容 | 字段说明 |
|--------|----------|----------|
| `^PAPER(patId,"ALL")` | 患者主索引 | 姓名^1, 性别^2, 出生日期^3, 身份证号^9 |
| `^PAPER(patId,"PAT",1)` | 患者登记号 | 登记号^1, 住院号^2, 门诊号^22 |
| `^PAPER(patId,"PER",1)` | 患者扩展信息 | 费别类别、联系电话 |
| `^PAADM(admId)` | 就诊记录 | 患者ID^1, 就诊类型^2(O/I/E/H), 科室^4, 日期^6, 时间^7, 医生^9, 出院情况DR^17, 状态^20, MRADM_DR^81 |
| `^PAADMi("PAADM_AdmDate",date,admId)` | 就诊日期索引 | 按日期遍历门诊/住院就诊 |
| `^PAADMi("PAPMI",patId,admId)` | 患者→就诊索引 | 查某患者所有就诊 |
| `^PAPERdr(patId,"ADM",type,admId)` | 患者就诊索引 | 按就诊类型(O/E/I/H)索引 |
| `^PAPERi("PAPMI_PatNo",$$ALPHAUP(regNo),patId)` | 登记号→PatID | 登记号必须大写 |
| `^PAPERDR(patId,"RB_Appt",status,...)` | 患者预约索引 | 按状态索引预约记录 |

## 医嘱与收费（Orders & Billing）

| Global | 存储内容 | 字段说明 |
|--------|----------|----------|
| `^OEORD(ord,"I",sub,1)` | 医嘱项目 | arcim^2, 开始日期^3, 状态^4 |
| `^OEORD(ord,"I",sub,"X",ore)` | 医嘱执行记录 | 执行日期、执行状态(1=已执行) |
| `^OEORD(0,"Adm",admId)` | 就诊→医嘱索引 | 检查就诊是否有医嘱 |
| `^ARCIM(sub,ver,1)` | 医嘱项目目录 | 项目代码、项目名称 |
| `^DHCTARI(tarId)` | 收费项目目录 | 收费代码、收费名称 |
| `^DHCWorkLoad(wlId)` | 工作量/计费明细 | 接收科室、医嘱项目、数量、单价、金额、就诊ID、患者ID、账单号、收费项目ID |
| `^DHCWorkLoad(0,"ORDDATE",date,wlId)` | 工作量日期索引 | |
| `^DHCWorkLoad(0,"PAADM",admId,wlId)` | 工作量就诊索引 | |
| `^DHCPB(billId)` | 患者账单 | 支付状态(P=已付/B=部分付)、退款标志 |
| `^DHCPB(billId,"O",...,"D",...)` | 账单明细 | 计费日期、计费时间 |

## 预约与排班（Appointment & Schedule）

| Global | 存储内容 | 字段说明 |
|--------|----------|----------|
| `^RB("RES",resId)` | 医生资源 | 科室ID、医生ID |
| `^RBAS(resId,asChild)` | 排班记录 | 日期、号源限额、开始时间、预约起始号 |
| `^RBAS(resId,asChild,"APPT",apptChild)` | 预约记录 | 预约类型、患者ID、状态(I/A/X/J)、就诊ID |
| `^RBAS(resId,asChild,"DHC")` | 排班扩展 | 号串($C(1)分隔)、停正号标志、时段标志 |
| `^RBAS(resId,asChild,"AQ",aqSub)` | 预约限额 | 预约方式ID、保留号数、最大号数 |
| `^RBAS(resId,asChild,"ASTR",astrSub)` | 分时段配置 | 时段起止时间、号数、时段号串 |

**状态码**: 预约 I/A/X/J | 号源 0-5 | 号串格式 `QueueNo:Status[:MethodId]`

## 医保（Insurance）

| Global | 存储内容 | 字段说明 |
|--------|----------|----------|
| `^DHCINADM(inadmId)` | 医保就诊记录 | 中心ID、激活标志、医疗类别、医保类型 |
| `^DHCINDIV(inpayId)` | 医保结算记录 | 支付标志(I=已结算)、医保就诊ID |
| `^DHCBCI(0,"Bill",billId)` | 账单-医保交叉索引 | 发票ID |

险种: `310`=职工 `390`=城乡 | 中心ID前4位: `4311`=永州 `43xx`=省内异地 其他=跨省异地

## 诊断与病历（Diagnosis & Medical Record）

| Global | 存储内容 | 字段说明 |
|--------|----------|----------|
| `^MR(mrRowId)` | 病历主记录 | 体重、身高、血压、发病日期 |
| `^MR(mrRowId,"DIA",sub)` | 诊断明细 | ICD编码、诊断医生、日期、描述、主诊断标志 |
| `^MRADM` | 就诊病历关联 | PAADM_MainMRADM_DR 指向 ^MR |
| `^MRi("Date",date,MRRowId)` | 病历日期索引 | |
| `^MRC("ID",icdId)` | ICD 诊断字典 | ^2=描述 |
| `^MRC("ID",0,"ICD",{ICD9CM_Code},{RowId})` | ICD编码索引 | 按 ICD-9-CM 编码查 RowId |
| `^MRC("ID",0,"Cancer",{Cancer},{RowId})` | 肿瘤索引 | |
| `^MRC("ID",0,"TypeDR",{TypeDR},{RowId})` | 诊断类型索引 | |
| `^MRC("ID",0,"SerCode",$$ALPHAUP({Code})_"Z",{RowId})` | 严重疾病代码索引 | |
| `^MRC("DTYP",typeId)` | 诊断类型字典 | ^2=类型描述 |

## 病案首页 (DHCMRInfo)

`^DHCMRInfo(rowId)` — 病案首页数据，`^` 分隔字符串，~600字段，对应 SQL 表 `User.DHCMRInfo`。

**关键字段 Piece 速查**（基于 `DHCMRInfo-props.csv`）：

| Piece | 字段 | 说明 |
|-------|------|------|
| 7 | MR_ADM | 就诊 ID → ^PAADM(admId) |
| 36 | MR_RYKB | 入院科室 DR → ^CTLOC |
| 39 | MR_RYRQ | 入院日期 (%Date) |
| 40 | MR_CYRQ | 出院日期 (%Date) |
| 42 | MR_SJZYTS | 实际住院天数 |
| 46 | MR_LYFS | 离院方式 (5=死亡) |
| 52 | MR_CYZYZD | 主要诊断 ICD 编码 (如 C50.900x011) |
| 53 | MR_CYZYZDMC | 主要诊断名称 |
| 55 | MR_CYZYZDZLJG | 主要诊断治疗结果 |
| 231 | MR_ZYZFF | 住院总费用 |
| 232 | MR_ZFJE | 自付金额（非总费用） |

**可用索引**：

| 索引 | 路径 |
|------|------|
| 出院日期 | `^DHCMRInfo(0,"MR_DIS_DATE",dateH,rowId)` |
| 入院日期 | `^DHCMRInfo(0,"MR_ADM_DATE",dateH,rowId)` |
| 入院科室 | `^DHCMRInfo(0,"MR_ADM_DEPT_DR",deptDr,rowId)` |
| 就诊ID | `^DHCMRInfo(0,"MR_PAADM_DR",admId,rowId)` |

## 出院情况字典 (DISCON)

`^DISCON(disconRowId)` — `^PAADM(admId)` piece 17 (`PAADM_DischCond_DR`) 指向此字典。

| DISCON_Code | DISCON_Desc |
|-------------|-------------|
| 1 | 治愈 |
| 2 | 好转 |
| 3 | 稳定 |
| 4 | 恶化 |
| 5 | 死亡 |
| 6 | 未愈 |
| 9 | 其他 |

## EMR 实例系统

| Global / 类 | 说明 |
|-------------|------|
| `^DHCEMRI.InstanceDataI("IdxModifyDate",date,recId,sub)` | 按修改日期遍历 EMR 实例 |
| `^DHCEMRI.InstanceDataI("IdxEpisodeStatusHappenDateTime",Adm," SAVE",date,time,recId,sub)` | 按就诊+状态遍历 |
| `EMRinstance.InstanceData.%OpenId("recId||sub")` | 实例对象: `.EpisodeID.%Id()` `.Title` `.Status` `.CreateUser` `.CreateDate` `.HappenDate` `.HappenTime` |
| `EMRservice.BL.BLScatterData.GetNewStdDataByGlossaryCategory(Adm,"HDSD00.03.01")` | 门诊病历结构化段落 |

**门诊病历 HDSD00.03.01 常用术语代码**:

| 字段 | 代码 |
|------|------|
| 主诉 | `HDSD00.03.057` |
| 现病史 | `HDSD00.03.038` |
| 体格检查 | `HDSD00.03.037` |
| 诊断列表 | `HDSD00.03.005` |
| 既往史 | `HDSD00.03.021` |
| 家族史 | `HDSD00.03.210` |
| 中医病名 | `HDSD00.03.007` |
| 中医证候 | `HDSD00.03.009` |

## 字典表（Foundation）

| Global | 存储内容 |
|--------|----------|
| `^CTLOC(locId)` | 科室: 代码^1, 名称^2 |
| `^CTLOC(0,"Code",code)` | 科室代码索引 |
| `^CTPCP(cpId,1)` | 医护人员: 姓名^2, 科室^3 |
| `^SSU("SSUSR",userId)` | 系统用户: 姓名^2 |
| `^RBC("APTM",methodId)` | 预约方式 (TEL/WIN/...) |
| `^RBC("AT",typeId)` | 预约类型 (NORN/APP/DOC/...) |
| `^DHCTimeRange(trId)` | 时段定义 |
| `^PAC("ADMREA",reasonId)` | 费别(就诊原因) |
| `^PHCFR(freqId)` | 用药频次 (QD/BID/TID/...) |
| `^DHCPatType(id)` | 特殊患者类型: Code^1, 描述^2, 执行码^3 |
| `^CD.PHA.IN.STAT(type)` | 药品分类 |

## 会话变量

| 变量 | 含义 |
|------|------|
| `%session.Get("LOGON.USERID")` | 用户 ID |
| `%session.Get("LOGON.USERNAME")` | 用户名 |
| `%session.Get("LOGON.GROUPID")` | 安全组 ID |
| `%session.Get("LOGON.CTLOCID")` | 登录科室 ID |
| `%session.Get("LOGON.HOSPID")` | 登录院区 ID |
| `%session.Get("LOGON.WARDID")` | 登录病区 ID |

## 医嘱明细字段 (^OEORD(ord,"I",sub))

| ^位置 | 字段 | 说明 |
|------|------|------|
| ^2 | OEORI_ItmMast_DR | ARC_ItmMast 医嘱项目 |
| ^3 | OEORI_SttDat | 开始日期 |
| ^4 | OEORI_SttTim | 开始时间 |
| ^5 | OEORI_Doctor_DR | 开嘱医生 |
| ^7 | OEORI_ItemStat_DR | 医嘱状态 (U=未审核 V=核实 E=执行 D=停止) |
| ^8 | OEORI_PrescNo | 处方号 |
| ^9 | OEORI_DoseQty | 单次剂量 |
| ^11 | OEORI_PHFreq_DR | 频次 |
| ^13 | OEORI_Instr_DR | 用法 |
| ^16 | OEORI_RecDep_DR | 接收科室 |
| ^40 | OEORI_Billed | 计费标志 (TB=未计费 B=已计费) |
| ^41 | OEORI_PhQtyOrd | 基本单位数量 |

## 账单与收费

| Global | 说明 |
|--------|------|
| `^DHCPB(billId)` | 账单主表: 总金额、支付状态(P/B)、退款标志 |
| `^DHCPB(billId,"O",sub)` | 医嘱账单: 收费项^3, 医嘱^4, 数量^5, 金额^8 |
| `^DHCPB(billId,"O",sub,"D",dsub)` | 计费明细: 收费项^3, 单价^4, 数量^5, 金额^7 |
| `^DHCPB(0,"ADM",admId)` | 就诊→账单索引 |
| `^DHCBCI(0,"Bill",billId)` | 账单→发票索引 |
| `^DHCOLT(id)` | 医嘱-收费关联: ARCIM^1, TarItem^2 |

**DHC_WorkLoad 多维度索引**: `PAADM` `PAPMI` `ORDDATE` `OEORI` `RECDEP` `RESDOC` `TarIC` 等 20+ 个索引

## 住院费用类别

| icate | 类别 |
|-------|------|
| 3 | 材料费 |
| 11 | 化验费 |
| 13 | 检查费 |
| 16 | 手术费 |
| 19 | 西药费 |
| 21 | 治疗费 |
| 25 | 中草药费 |
| 26 | 中成药费 |

## 药学/药品

| Global | 说明 |
|--------|------|
| `^ARCIM(sub,ver,1)` | 医嘱项目: 代码^1 名称^2 子类^10 |
| `^ARCIM(0,"Code",code)` | 代码→ARCIM 索引 |
| `^PHCDF(sub)` | 药品剂型 |
| `^PHCGE(sub)` | 药品通用名 |
| `^DHCPHDISP(id)` | 门诊发药主表 |
| `^DHCPHDI(id,"PHDI",sub)` | 发药明细: 数量^4 医嘱项^5 |
| `^DHCPHDISPi("FYDATE",date)` | 发药日期索引 |
| `^DHCOEDISQTY(0,"OEORI",oeoriId)` | 配药记录按医嘱索引 |

## 排班/预约

| Global | 说明 |
|--------|------|
| `^RB("RES",resId)` | 科室资源: 科室^1 医生^2 |
| `^RBAS(resId,asChild)` | 排班: 日期、号源、时段 |
| `^RBAS(resId,asChild,"APPT",sub)` | 预约: 类型、患者ID、状态(I/A/X/J) |
| `^RBAS(resId,asChild,"DHC")` | 排班扩展: 号串($C(1)分隔) |
| `^RBC("APTM",id)` | 预约方式 (TEL/WIN/...) |
| `^User.DHCRegistrationFeeD(id)` | 挂号流水 |
| `^User.DHCRegistrationFeeI("RegDate",date)` | 挂号日期索引 |

## 科室/用户字典

| Global | 字段 |
|--------|------|
| `^CTLOC(id)` | 代码^1 名称^2 类型^15(E=执行/W=病区/D=发药) |
| `^CTLOC(id,"LINK",sub)` | 关联子科室 |
| `^CTPCP(id,1)` | 姓名^2 类型^3 |
| `^SSU("SSUSR",id)` | 姓名^2 默认科室^4 安全组^5 CTPCP^8 |
| `^SSU("SSUSR",0,"CTPCP",cpId)` | 医护→用户反向索引 |
| `^PAWARD(wardId)` | 病区: 科室DR^5 |
| `^PAWARD(wardId,"BED",sub)` | 床位: 代码^1 类型^2 |
| `^CT("CTPM",id)` | 支付方式 |
| `^CT("SEX",id)` | 性别字典 |
| `^CT("NAT",id)` | 民族字典 |

## 常用索引遍历

| 场景 | Global 路径 |
|------|------------|
| 就诊日期遍历 | `^PAADMi("PAADM_AdmDate", dateH, admId)` |
| 医嘱按日期 | `^OEORDi(0,"StDt", dateH, ordId, sub)` |
| 病历按日期 | `^MRi("Date", dateH, MRId)` |
| 工作量按日期 | `^DHCWorkLoad(0,"ORDDATE", dateH, wlId)` |
| 挂号按日期 | `^User.DHCRegistrationFeeI("RegDate", dateH, id)` |
| 发药按日期 | `^DHCPHDISPi("FYDATE", dateH, ...)` |
| 在院患者 | `^PAADMi("NotCompl","I", LocId, admId)` |
| 就诊→医嘱 | `^OEORD(0,"Adm", admId, ordId)` |
| 医嘱→执行 | `^OEORD(ord,"I",sub,"X",ore)` |
| 医嘱→配药 | `^DHCOEDISQTY(0,"OEORI", oeoriId)` |
| 账单→发票 | `^DHCBCI(0,"Bill", billId)` |
