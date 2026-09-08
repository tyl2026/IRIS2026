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

**字段来源**：`HISUI-工具表/DHCMRInfo-props.csv` — 含 propertyName / propertyPiece / propertyType / propertyField 等列。

### 基本信息

| Piece | 字段 | 类型 | 说明 |
|-------|------|------|------|
| 1 | MR_YLFFFS | String | 医疗付费方式 |
| 2 | MR_JKKH | String | 健康卡号 |
| 3 | MR_ZYCS | String | 住院次数 |
| 4 | MR_BAH | String | 病案号 |
| 5 | MR_ZYH | String | 住院号 |
| 8 | MR_XM | String | 姓名 |
| 9 | MR_XB | String | 性别（1=男 2=女） |
| 10 | MR_CSRQ | Date | 出生日期 |
| 11 | MR_NN | String | 年龄 |
| 12 | MR_GJ | String | 国籍 |
| 13 | MR_BZZSNN | String | 年龄不足一周岁年龄 |
| 14 | MR_XSECSTZ | String | 新生儿出生体重 |
| 15 | MR_XSERYTZ | String | 新生儿入院体重 |
| 16 | MR_CSD | String | 出生地 |
| 17 | MR_JG | String | 籍贯 |
| 18 | MR_MZ | String | 民族 |
| 19 | MR_SFZH | String | 身份证号 |
| 20 | MR_ZY | String | 职业 |
| 21 | MR_HY | String | 婚姻 |
| 22 | MR_XZZ | String | 现住址 |
| 23 | MR_XZZDH | String | 现住址电话 |
| 24 | MR_XZZYB | String | 现住址邮编 |
| 25 | MR_HKDZ | String | 户口地址 |
| 26 | MR_HKYB | String | 户口邮编 |
| 27 | MR_GZDWDZ | String | 工作单位地址 |
| 28 | MR_GZDWDH | String | 工作单位电话 |
| 29 | MR_GZDWYB | String | 工作单位邮编 |
| 30 | MR_LXRXM | String | 联系人姓名 |
| 31 | MR_LXRGX | String | 联系人关系 |
| 32 | MR_LXRDZ | String | 联系人地址 |
| 33 | MR_LXRDH | String | 联系人电话 |

### 住院信息

| Piece | 字段 | 类型 | 说明 |
|-------|------|------|------|
| 34 | MR_RYTJ | String | 入院途径 |
| 35 | MR_RYRQ | Date | 入院日期 |
| 36 | MR_RYKB | String | 入院科别 DR → ^CTLOC |
| 37 | MR_RYBF | String | 入院病房 |
| 38 | MR_ZKKB | String | 转科科别 |
| 39 | MR_CYRQ | Date | 出院日期 |
| 40 | MR_CYKB | String | 出院科别 DR → ^CTLOC |
| 41 | MR_CYBF | String | 出院病房 |
| 42 | MR_SJZYTS | String | 实际住院天数 |
| 45 | MR_RYBQ | String | 入院病情 |
| 46 | MR_LYFS | String | 离院方式（5=死亡） |
| 47 | MR_LYFSYLJSJGMC | String | 离院转入机构名称 |
| 51 | MR_RYHQZRQ | Date | 入院后确诊日期 |

### 诊断信息

| Piece | 字段 | 类型 | 说明 |
|-------|------|------|------|
| 43 | MR_MJZZDMC | String | 门急诊诊断名称 |
| 44 | MR_MJZZDJBBM | String | 门急诊疾病编码 |
| 48 | MR_RYZD | String | 入院诊断 |
| 49 | MR_RYZDMC | String | 入院诊断名称 |
| 50 | MR_RYZDRYBQ | String | 入院诊断入院病情 |
| 52 | MR_CYZYZD | String | 出院主要诊断 ICD 编码 |
| 53 | MR_CYZYZDMC | String | 出院主要诊断名称 |
| 54 | MR_CYZYZDRYBQ | String | 出院主要诊断入院病情 |
| 55 | MR_CYZYZDZLJG | String | 出院主要诊断治疗结果 |
| 56-115 | MR_CYQTZD1~15 | String | 出院其他诊断 1~15（每组 4 字段：编码/名称/入院病情/治疗结果） |
| 116 | MR_YYGRMCBM | String | 医院感染名称编码 |
| 117 | MR_YYGRZDQK | String | 医院感染诊断情况 |
| 118 | MR_YYGRZDMC | String | 医院感染诊断名称 |
| 259 | MR_SSZDDWBYS | String | 损伤中毒外部因素 |
| 260 | MR_SSZDDJBBM | String | 损伤中毒疾病编码 |
| 261 | MR_BLZD | String | 病理诊断 |
| 262 | MR_BLZDBM | String | 病理诊断编码 |
| 263 | MR_BLH | String | 病理号 |
| 264 | MR_YWGMBZ | String | 药物过敏标志 |
| 265 | MR_YWGMW | String | 药物过敏物 |
| 266 | MR_SWHZSJ | String | 死亡患者是否尸检 |
| 267 | MR_XX | String | 血型 |
| 268 | MR_RH | String | RH |
| 304 | MR_ZLFQ | String | 肿瘤分期 |

### 手术信息（1~10 组，每组 10 字段）

| Piece | 字段 | 类型 | 说明 |
|-------|------|------|------|
| 119-129 | MR_SSBM1/MR_SSJB1/MR_SSRQ1/... | — | 手术编码1/级别1/日期1/名称1/操作医师1/I助1/II助1/麻醉1/切口1/麻醉医师1/择期1 |
| 130-140 | MR_SSBM2~... | — | 手术组 2 |
| ... | ... | — | 手术组 3~10（每组间隔 11 piece） |
| 218-228 | MR_SSBM10~... | — | 手术组 10 |
| 229 | MR_QJCS | String | 抢救次数 |
| 230 | MR_QJCGCS | String | 抢救成功次数 |

### 费用信息

| Piece | 字段 | 类型 | 说明 |
|-------|------|------|------|
| 231 | MR_ZYZFF | Number | 住院总费用 |
| 232 | MR_ZFJE | Number | 自付金额 |
| 233 | MR_YBYLFWF | Number | 一般医疗服务费 |
| 234 | MR_YBYLCZF | Number | 一般医疗操作费 |
| 235 | MR_HLF | Number | 护理费 |
| 236 | MR_QTFY | Number | 其他费用 |
| 237 | MR_BLZDF | Number | 病理诊断费 |
| 238 | MR_SYSZDF | Number | 实验室诊断费 |
| 239 | MR_YXXZDF | Number | 影像学诊断费 |
| 240 | MR_LCZDXMF | Number | 临床诊断项目费 |
| 241 | MR_FSSZLXMF | Number | 非手术治疗项目费 |
| 242 | MR_LCWLZLF | Number | 临床物理治疗费 |
| 243 | MR_SSZLF | Number | 手术治疗费 |
| 244 | MR_MZF | Number | 麻醉费 |
| 245 | MR_SSF | Number | 手术费 |
| 246 | MR_KFF | Number | 康复费 |
| 247 | MR_ZYZLF | Number | 中医治疗费 |
| 248 | MR_XYF | Number | 西药费 |
| 249 | MR_KJYWFY | Number | 抗菌药物费用 |
| 250 | MR_ZCHENGYF | Number | 中成药费 |
| 251 | MR_ZCAOYF | Number | 中草药费 |
| 252 | MR_XF | Number | 血费 |
| 253 | MR_BDBLZPF | Number | 白蛋白类制品费 |
| 254 | MR_QDBLZPF | Number | 球蛋白类制品费 |
| 255 | MR_JCYYCXYYCLF | Number | 检查用一次性医用材料费 |
| 256 | MR_ZLYYCXYYCLF | Number | 治疗用一次性医用材料费 |
| 257 | MR_SSYYCXYYCLF | Number | 手术用一次性医用材料费 |
| 258 | MR_QTF | Number | 其他费 |

### 人员信息

| Piece | 字段 | 说明 |
|-------|------|------|
| 269 | MR_KZR | 科主任 |
| 270 | MR_ZRYS | 主（副主）任医师 |
| 271 | MR_ZZYS | 主治医师 |
| 272 | MR_ZYYS | 住院医师 |
| 273 | MR_ZRHS | 责任护士 |
| 274 | MR_JXYS | 进修医师 |
| 275 | MR_XXYS | 实习医师 |
| 276 | MR_BMY | 编码员 |
| 278 | MR_ZKYS | 质控医师 |
| 279 | MR_ZKHS | 质控护士 |
| 280 | MR_ZKRQ | 质控日期（Date） |

### 护理与质量

| Piece | 字段 | 说明 |
|-------|------|------|
| 277 | MR_BAZL | 病案质量 |
| 281 | MR_MRDate | 取数日期 |
| 284 | MR_SFTBZZZY | 是否同病种再住院 |
| 285-290 | MR_LNSSRYQHMSJT~ | 颅脑损伤入院前后昏迷天/小时/分钟 |
| 291 | MR_BAFX | 病案分型 |
| 292 | MR_SFSSZZJH | 是否实施重症监护 |
| 293 | MR_JHSJRRQSJ | 监护室进入日期时间 |
| 294 | MR_JHSTCRQSJ | 监护室退出日期时间 |
| 295 | MR_SFDBZGL | 是否单病种管理 |
| 296 | MR_SFSSLCLJGL | 是否实施临床路径管理 |
| 297 | MR_SFSSDGL | 是否实施DRGs管理 |
| 298-302 | MR_SFSYKSS~ | 抗生素使用相关 |
| 303 | MR_SFFDCRB | 是否法定传染病 |
| 305 | MR_XSEAPF | 新生儿Apgar评分 |
| 306-309 | MR_HXB~MR_QX | 血液制品（红细胞/血小板/血浆/全血） |
| 310 | MR_SFFSRC | 是否发生褥疮 |
| 311 | MR_SFFSYLSG | 是否发生医疗事故 |
| 312 | MR_SFFSYLCC | 是否发生医疗差错 |
| 313-316 | MR_SFSZ~MR_SZSJZ | 随诊及时间 |
| 317-320 | MR_TSHLTS~MR_SJHLTS | 特级/一级/二级/三级护理天数 |
| 321 | MR_WZBRQJBZ | 危重病人抢救标志 |
| 322-326 | MR_SFSX~MR_SYFY | 输血/输液及反应 |
| 327-328 | MR_XSECS/MR_CFCS | 新生儿/产妇产伤 |
| 329-332 | MR_YYCUSW~MR_YYXYWCCLS | 医疗不良事件 |
| 333 | MR_BYXJC | 病原学检查 |
| 334-335 | MR_SSBFZ/MR_SSBFZMC | 手术并发症 |
| 336 | MR_SWSFFSZWSSQN | 死亡是否在围手术期内 |
| 337 | MR_SFYNFSDDHZCSJ | 是否院内跌倒坠床 |
| 338 | MR_SHCD | 伤害程度 |
| 339-344 | MR_MZRYZDFHQK~MR_SSBDSLBLZDFH | 各类诊断符合情况 |
| 345-350 | MR_SEXZLSQSHZDFH~MR_JCEXZLSQSHZDFH | 各类肿瘤手术前后诊断符合 |
| 351 | MR_LXYZLZPF | 凝血因子类制品费 |
| 352 | MR_XBYZLZPF | 细胞因子类制品费 |

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
