---
title: "PACS4.0 数据库表设计报告修订版本"
source: "document"
source_file: "PACS RIS表结构/PACS4.0 数据库表设计报告修订版本.doc"
created: "2026-05-13T06:22:03Z"
---

DHC PACS/RIS V4.0			数据库设计报告						（医疗事业部）																																			文件编号：	PACS4.0-03			文件版次：	0.2			 										文档编号		版本号	0.1			分册名称		第 1 册/共 1 册			总页数	40	正文	39	附录				编制	张晓宇	审批		生效日期	2008.10.						北京东华合创

修改记录				版本号	变更控制报告

编号	更改条款及内容	更改人	审批人	更改日期		0.1	1	 创建数据库表结构设计	张晓宇		2008-10-15		0.2	2	 修改科室表、增加耗材表、修改规档表	张晓宇		2008-10-23		0.3	3	修改 用户表、呼叫参数表、设备表、检查表	张晓宇		2008-11-03		0.4	4	 增加日志表等	张晓宇		2008-11-04		0.5	5	 	张晓宇		2008-11-06		0.6	6	 增加结构化基本单元表和报告与结构化单元对应表

乔治国		2009-03-05		0.7	7	 增加就诊记录表，和 表关键字表	龚平		2009-03-17		0.8	8	 增加预约表和修改资源计划表	龚平		2009-03-20		0.9	9	 医嘱项目维护和预约增加备注 和增加科室参数修改、以及增加资源使用表	龚平		2009-03-21		1.0	1.0	修改检查信息表（增加检查技术和拍摄体位、优先级别）

增加 检查技术表、拍摄体位表、优先级表、缓检信息表

张晓宇		2009-07-07		1.1	1.1 	 增加 DICOM 四张表	龚平		2009-08-28		1．2	1．2	 增加民族、国家、职业表	龚平		2009-09-09		1．3	1．3	 增加部位科室对应，检查状态科室对应	龚平		2009-09-10		1．4	1．4	 增加费用补录，检查项目和收费项目表	龚平				1.5	1.5	 增加卡类型，检查项目执行检查组对应表	龚平													在如下表中增加字段：

User. CLIENTPARAM	CPCutInfo

User. MEASURESCHEME	SSC_ID

User. SYSTEMPARAM	SP_PATIDLENGTH

User. LOC	        LOC_AUTOFILLPATID

SQLUser. MEASUREDIR	MEASUREDIR

SQLUser. MEASUREBASE	MD_CODE	姚波、林清				1.6 	1.6	修改 HISAPPINFO , APPBILL 表 ，增加报告报告表检查项目字段 	龚平		2009-09-16		1.7	1.7	增加 SMOKEHISTORY，GLASS，GLASS2LOC 表，并在 STUDYINFO 表 中增加字段 GN_NO	龚平		2011-01-10		1.7	1.7	增加 TPLCAT2LOC，STRUCTIONBASE2LOC，MEASURESCHEME2LOC 表	龚平		2011-02-12		1.8	1.8	病人信息表（PATIENTINFO）和申请信息表（HISAPPINFO）增加病人外部 ID 字段：PAT_GPATIENTID	林清		2011-4-12		1.9	1.9	修改字段 NUMBERRULE 表 RULE-(RULEDESC	龚平		2011-4-13									1.10	1.10	修改卡表 CARDREF 增加 PAT_GPATIENTID	龚平				1.11	1.11	增加 CAMERAPARAM 摄像头视频参数表	林清		2011-04-20									1.12	1.12	科室参数表增加以下字段

LOC_SAVERPTSERVICE

（报告保存后调用 HIS 服务）

LOC_PRINTRPTSERVICE

（报告打印后调用 HIS 服务）

LOC_COMMRPTSERVICE

（报告提交后调用 HIS 服务）

LOC_ARCHRPTSERVICE

（报告终审后调用 HIS 服务）

将 LOC_MDVRPTLENGTH 由“报告审核几小时后不能再修改”改为“报告保存几天后不能再修改”	乔治国		2011-5-5		1.13	1.13	视图“STUDYANDREPORTINFO”增加“PAT_GPATIENTID”字段	林清		2011-5-31		1.14	1.14	报告信息表（REPORPINFO）增加以下字段：

RPT_CMTDT（报告提交时间）

CRUSER_ID（报告提交的接受人）	林清		2011-8-4		1.15	1.15	检中信息表（STUDYRECORD）增加以下字段：

SRE_PREPHYSIC（术前用药）

SRE_ANESTSTUDY（麻醉检查）

SRE_ANESTPHYSIC（麻醉用药）

报告信息表（REPORPINFO）增加以下字段：

RPT_ADVISE（建议）

RPT_SENDDT（送检日期）

RPT_RECEIVEDT	（接收日期）

RPT_SENDER（送检医生）	林清		2011-8-26		1.16	1.16	科室信息表（LOC）增加字段：

LOC_RPTRETURNPAGE（报告关闭后返回页面）	林清		2011-8-29		1.17	1.17	检中信息表（STUDYRECORD）修改字段：

SRE_HP（Hp 检查值）由 VCHAR(8)－> VCHAR(32)

术中用药模板（STUDYOPSPHYSIC）修改字段：

SPP_DESC（药品名称）由 VCHAR(32)－>VCHAR(128)	林清		2011-9-1		1.18	1.18	科室信息表（LOC）增加字段：

LOC_CALLLISTCOUNT（叫号屏幕列表显示患者数量）	林清		2011-9-21		1.19	  1.19	区域 RIS 增加科室代码 SP_HOSPCODE

CLIENTPARAM, LOC, MEDIC，MODEANDSSC

PositionImage，TPLSHORTCUT，USERS，SYSTEMPARAM

龚平		2011-10-08		1.20	1.20	  修改卡标志的含义

0	Normal   正常

1	Suspend 挂起

2	Reclaim 回收

3	Depose  作废	龚平		2011-10-12		1.21	1.21	增加 HP 检查值表（HP）	林清		2011-10-12		1.22	1.22	申请单 增加停止人，日期，时间，状态	龚平		2011-10-13		1.23	1.23	视图“STUDYANDREPORTINFO”增加“ST_IMAGECOUNT、ST_OUTFILM”字段	林清		2011-10-18		1.24	1.24	检查信息表（STUDYINFO）增加以下字段：

ST_CLEANTIME（镜子清洗时间）

ST_DISINFECTTIME（镜子消毒时间）

报告信息表（REPORTINFO）增加以下字段：

RPT_REJECTDT	（报告驳回时间）

RUSER_ID（执行驳回的医生）

RPT_REJECTREASON	（驳回理由）

IMAG_MASSDT（影像评级时间）

IMUSER_ID（影像评级医生）

检查日志表（STUDYLOG）增加以下字段：

RPT_REJECTDT	（报告驳回时间）

RUSER_ID（执行驳回的医生）

IMAG_MASSDT（影像评级时间）

IMUSER_ID（影像评级医生）	林清		2011-11-7		1.25	1.25	用户日志内容表（USERLOGCONTENT）修改字段：

ST_ID（检查状态）由 CHAR（8）－> VCHAR(16)

视图“STUDYANDREPORTINFO”增加“ST_WARD、ST_SICKROOM、ST_BEDNO、

SPRI_ID、ST_FILMCOUNT、

ST_EXPOSURECOUNT”字段	林清		2011-11-14		1.26	1.26	科室代码维护表（LOC）增加字段：

LOC_EMRURL（调阅电子病历 URL）

LOC_EMRPARAM（调阅电子病历的参数组合）

LOC_ISPATIDTRIM（登记号是否去零）

LOC_INPUTFEEURL（调用费用补录 URL）

LOC_INPUTFEEPARAM（调用费用补录的参数组合）

检查信息表（STUDYINFO）增加字段：

ST_FILMSIZE（胶片尺寸）	林清		2011-12-8		1.27	1.27	设备表（MODALITY）增加字段：

MDL_VPXTYPE（设备调用 VPX 的方式）	林清		2011-12-11		1.28	1.28	检查信息表（STUDYINFO）增加字段：

ST_STUDYFEE（检查费用）

ST_MATERIALFEE（材料费用）

检查日志表（STUDYLOG）增加以下字段：

ST_STUDYFEE（检查费用）

ST_MATERIALFEE（材料费用）	林清		2011-12-29		1.29	1.29	病人信息表（PATIENTINFO）中

PAT_CASEID	（病案号）、PT_ID（患者类型）移到检查信息表（STUDYINFO）

检查信息表（STUDYINFO）中

ST_OEORD（医嘱号）由 VCHAR(16)－> VCHAR(128)	林清		2012-1-16		1.30	1.30	科室代码维护表（LOC）增加字段：

LOC_LINKPROIP（linkpro ip 地址）

LOC_LINKPROPORT（linkpro 端口号）	王锋		2012-2-13		1.31	1.31	检查项目值表（STUDYITEMVALUE）增加字段：

STV_NUMBER（检查项目数量）

HIS_APPID（申请单号）	林清		2012-2-23		1.32	1.32	科室代码维护表（LOC）增加字段：

LOC_WEBVPXIP	（Web VPX IP 地址）

LOC_WEBVPXUSER	（Web VPX 登录用户）

LOC_WEBVPXPWD	（Web VPX 登录密码）

检查项目表（STUDYITEM）增加字段：

SI_ISINPUTFEE	（是否需要补录费用）	林清		2012-3-19		1.33	1.33	检查信息表(STUDYINFO)

增加字段：

ST_CONSULTATION（会诊状态）

ST_CONSULTSTARTTIME（会诊申请时间）

ST_CONSULTENDTIME（会诊结束时间）

增加索引：

STCONSULTATIONIndex

编码生成规则表(NUMBERRULE)

增加字段： SSC_ID（检查子类）

增加索引： SSCIDIndex

增加外键： SSCIDFK	乔治国		2012-3-29		1.34	1.34	视图“STUDYINFOVIEW”、

“STUDYANDREPORTINFO”增加字段：

SRE_OPSDOC、SRE_OPSA、CAQ_STATUS                                                        	林清		2012-3-30		1.35	1.35	增加活检部位表（BIOPSYPART）、

活检记录表（STUDYBIOPSY）增加字段：

活检部位 ID（BOP_ID）	林清		2012-4-11		1.36	1.36	增加 WORKLIST 表	林清		2012-5-10		1.36	1.36	诊断模板大类表 User. TPLCAT 增加字段 TC_TYPE /// 类型 ：0-模板 1-用户短语

诊断模板内容表 TPLCONTENT 中的字段 TCTNAME 长度改为 64	乔治国		2012-05-25		1.37	1.37	增加设备 WorkList 表（MODALITYWORKLIST）

增加 SCP、SCU 表	林清

2012-6-5		1.38	1.38	取消检查表（CANCELSTUDY）增加字段：

CS_TYPE（取消检查类型）	林清		2012-7-16		1.39	1.39	科室代码维护表（LOC）增加字段：

LOC_INVOKERIS3STUDY（相关检查调用 RIS3.0 的检查信息）	林清		2012-7-25		1.40	1.40	检查信息表（STUDYINFO）和检查日志表（STUDYLOG）增加字段：

ST_MEDICINEFEE（药费）

检查项目表（STUDYITEM）增加字段：

SI_ISENHANCED（是否增强检查）

SI_SERVICE（服务标识）修改为：

1：检查项目；2：材料；3：药品	林清		2012-7-30		1.41	1.41	检查部位表（BODYPART）增加字段：

BP_EWEIGHT（编辑报告权重）

BP_VWEIGHT（审核报告权重）	林清		2012-8-28		1.42	1.42	科室代码维护表（LOC）增加字段：

LOC_ISPOPTIP（报告操作是否弹出提示）

LOC_ISSRETURN（报告保存后是否返回）

LOC_ISPRETURN（报告打印后是否返回）

LOC_ISCRETURN（报告提交后是否返回）

LOC_ISVRETURN（报告审核后是否返回）

LOC_ISRRETURN（报告驳回后是否返回）

LOC_ISFRETURN（报告终审后是否返回）	李智华		2012-10-26		1.43	1.43	病人申请信息表(HISAPPINFO)增加字段

HIS_STUDYFEE   （检查费）

HIS_MATERIALFEE   （材料费）

HIS_MEDICINEFEE    （药费） 	李智华		2012-12-07		1.43	1.43	科室代码维护表（LOC）增加字段

LOC_SelectMDType（选择设备的方式）

LOC_IsCompatibleOldReport（是否兼容旧版本）

LOC_INPReservation（住院病人能否手工预约）

LOC_OPReservation（门诊病人能否手工预约）

LOC_EPReservation（急诊病人是否要求手工录入时费用为 0）

LOC_FiltStrPat（只筛选指定字符串开头的登记号的病人）

LOC_IS3Dbuild（是否使用 3D 构建功能）	李智华		2012-12-07		1.43	1.43	设备表（MODALITY）增加字段

SUPPORTWORKLIST（是否调用 worklist）

SUPPORTCHINAESE（是否支持中文）

SUPPROTSEXAGE（是否支持姓名中带有性别和年龄）	李智华		2012-12-07		 1.43	1.43	 增加中文字段

APPBILL：

AB_ENITEMDESC  检查项目英文描述

CHARGEITEM:

CGI_ENDESC   收费项目英文名称

HISAPPINFO:

HIS_ITEMENDESC  查项目描述（英文描述）LOC:

LOC_ENDESC	科室英文描述名称

MODALITY:

MDL_ENDESC	英文描述

STUDYCAT:

SC_ENDESC	检查项目大类英文名称

STUDYSUBCAT:

SSC_ENDESC	检查项目子类英文名称

STUDYITEM:

SI_ENDESC	检查项目英文名称

STUDYINFO:

ST_ENITEMDESC	检查项目英文描

STUDYSTATUS:

ST_ENDESC	英文描述

REPORTMODE

MODE_LTYPE  样式的语言类型

龚平		2013-01-10		1.44	1.44	结构化基本单元表(STRUCTIONBASE)增加字段：

USER_ID（用户 ID）	林清		2013-4-1		1.44	1.44	科室表（LOC）增加字段

LOC_ISMustSelPositive

（阳性阴性是否是必选项）	乔治国		2013-4-8		1.44	1.44	科室表(LOC)增加字段

/// 临床能看到报告时的报告状态

/// R- 报告 V-审核 F-终审

LOC_ClintRptStatus

/// 报告能被临床查看的延迟时间（分钟）

LOC_ClintRptDelayAfter 	乔治国		2013-4-9		1.44	1.44	复查随访信息表(CALLBACK)增加字段

/// 申请回访医生

CB_APPUSERID 	乔治国		2013-4-9		1.44	1.44	检查信息表（STUDYINFO）增加字段

///胶片是否已打印

ST_PRINTEDFILM	乔治国		2013-4-9		1.44	1.44	检查记录信息表(STUDYRECORD ) 增加字段

///护师（护士）

SRE_NURSE

检查日志表(STUDYLOG)增加字段：

///护师（护士）

SRE_NURSE	乔治国		2013-4-9		1.45	1.45	呼叫队列表(CALLQUEUE)增加字段：

CAQ_LOCKMDL（呼叫时锁定的设备）	林清		2013-4-15		1.46	1.46	科室表（LOC）增加字段：

LOC_RPTEDITABLESTATUS（可编辑报告的检查状态）

报告信息表（REPORTINFO）增加字段：

RPT_REMARK（备注）	林清		2013-5-6		1.46	1.46	科室表（LOC）增加字段：

LOC_AutoCloseRptTime（ 用户离开多长时间自动关闭未保存的报告）	乔治国		2013-5-10		1.47	1.47	检查信息表(STUDYINFO)增加字段：

ST_WARDDESC（病区）

原 ST_WARD（病区）不再使用

增加质量评定等级表（MASSRATING）	林清		2013-5-14		1.48	1.48	结构化基本单元表 STRUCTIONBASE

USER_ID 去掉 必须限制	乔治国		2013/5/16		1.49	1.49	科室表 Loc

增加 LOC_EXPCountIsEnable

（曝光次数是否能够修改  0：否  1：是）	乔治国		2013/5/16		1.50	1.50	病人信息表（PATIENTINFO）增加字段：

PAT_STATUS（病人状态）	林清		2013-5-16		1.51	1.51	资源计划表（RESOURCEPLAN）增加字段：

RP_EXTRANUM（额外增加数量）

科室表（LOC）增加字段：

LOC_SEQUENCENOTYPE	（生成流水号方式）

LOC_CREATECALLQUEUETIME（生成呼叫队列的时间）

LOC_NAMEPYCASE	（患者姓名大小写）

LOC_ISLOCKWAITPAT （叫号时是否锁定等候患者）

LOC_EPUNPAIDALLOWSTUDY （急诊病人没有收费是否允许做检查）

病人申请信息表（HISAPPINFO）增加字段：

HIS_PRIORITY	（病人检查优先级）		林清		2013-06-21		1.52	1.52	报告信息表（REPORTINFO）增加字段：

RPT_METHOD （检查方法）

RPT_ DESCRIBE	（检查所见）

RPT_DIAGNOSE	（诊断意见）	林清		2013-06-26		1.53	1.53	资源使用情况表（APPRESOURCE）增加字段：

APS_ACTUALMAX （实际最大就诊数）

APS_ACTUALEXTRANUM （实际额外增加数）

APS_MAXSEQUENCENO	（当前生成的最大流水号）

APS_RELEASEDNO	（释放的流水号）	林清		2013-06-28		1.54	1.54	检查信息表（STUDYINFO）增加字段：

LOC_NUMBERDESC	（科室流水号）

SG_NUMBERDESC	（检查组流水号）

ROOM_ NUMBERDESC	（诊间流水号）	林清		2013-07-02		1.55	1.55	呼叫队列表（CALLQUEUE）增加字段：

CAQ_NUMBERDESC	（呼叫流水号）	林清		2013-07-04		1.56	1.56	增加 REPORTCONTENT 报告内容表（仅供统计），原 REPORTINFO 表中增加的检查方法、检查所见和诊断意见三字段删除	林清		2013-07-10		1.57	1.57	用户设置参数表（USERPARAM）增加字段：

UP_UICONFIG（界面显示控件的配置）

UP_ASSIGNSTUDYSUBCAT（自动分配任务时检索的检查子类）

UP_ASSIGNBODYPART（自动分配任务时检索的检查部位）

角色表（ROLE1）增加字段：

ROLE_SHOWTABITEM（登录后默认显示页签）

科室代码维护表（LOC）增加字段：

LOC_ASSIGNSTUDYSTATUS（自动分配任务时检索的检查状态）

LOC_ASSIGNSTARTDAY	（自动分配任务时检索前几天）

LOC_ASSIGNENDDAY	（自动分配任务时检索后几天）

LOC_ASSIGNHASIMG	（自动分配任务时是否有图像后再分配）

LOC_ASSIGNCOUNT	（自动分配任务的数量）

LOC_NEEDCOMMIT	（报告是否需要提交）

LOC_ISMUTISTUDYSAMECALLNO	（同一病人的多条检查是否使用同一呼叫序号）

LOC_ISRPTRESULTSAMEFONTSIZE	（报告结果是否同步调整字体大小）

增加质量评审值表（STUDYQUALITYVALUE）	林清		2013-07-26		1.58	1.58	报告归档表（RPTARCHIVE）增加字段：

SI_ID（检查项目 ID）

报告信息表（REPORTINFO）修改字段：

IMAG_MASS，长度由 VCHAR(4)-> VCHAR(64)	林清		2013-08-12		1.59	1.59	科室表（LOC）增加字段：

LOC_IMGSERVERINFO（影像服务器的信息）	林清		2013-09-06		1.60	1.60	呼叫队列表（CALLQUEUE）增加字段：

CAQ_STARTTIME（开始时间）

CAQ_ENDTIME	（结束时间）

病人申请信息表（HISAPPINFO）增加字段：

HIS_HASSCANFILE（是否有申请单扫描文件）	林清		2013-09-11		1.61	1.61	检查信息表（STUDYINFO）增加字段：

ST_CONSULTLOC（会诊请求科室）

检查日志表（STUDYLOG）增加字段：

ST_ENDDATETIME	检查结束日期	林清		2013-10-11		1.62	1.62	LOC ：LOC_CA 开启 CA 功能	龚平		2013-10-14		1.64	1.64	CRITICALVALUE 危急值字典表 （不用）

LOC_CV 科室对应的危急值（不用）

CRITICALPATIENT 危急病人列表 （不用）

DOCTORRECORD 临床大夫处理记录 【阅读，评价，驳回，处理】	龚平		2013-10-14		1.65	1.65	USERSIGNATUREINFO 存储用户证书的相关信息

DIGITALSIGNATURE 存储签字的信息

龚平		2013-10-16		1.66	1.66	科室表（LOC）增加字段：

LOC_ERPTSELVDOC	  保存报告时是否可选择审核医生	林清		2013-10-16		1.67	1.67	增加 LOC, USERPARAM , STUDYINFO, STUDYLOG

HISAPPINFO,

REPORTCONTENT

等扩展字段	龚平		2013-10-17		1.68	1.68	检查记录信息表（STUDYRECORD）和检查日志表（STUDYLOG）增加字段：

SRE_INTERVENTIONDOC（介入手术医生）

SRE_INTERVENTIONA	（介入手术助手）

SRE_INTERVENTIONNURSE	（介入手术护师）	林清		2013-10-22		1.69	1.69	在 BODYPART2STUDYITEM 部位检查项目对应表

增加医院代码	龚平		2013-11-04		1.70	1.70	资源计划表（RESOURCEPLAN）增加字段：

RP_NOTITLE（该时段流水号的字头）	林清		2013-11-29		1.71	1.71	增加设备与检查组的关联表（MODALITY2GROUP）	林清		2013-12-02		1.72	1.72	检查记录信息表（STUDYRECORD）增加字段：

SRE_CHECKNURSE	（核对护师）	林清		2013-12-05		1.73	1.73	增加 MEASUREBASEEXT 检查测值单元扩展表	林清		2014-01-07		4.5.0.7	1.74	增加英文字段：

CARDTYPE：CT_ENDESC	卡类型英文描述

FEETYPE：FT_ENDESC	费用类型英文描述

GLASS：GN_ENDESC	镜子英文描述

HP：HP_ENDESC	HP 值英文描述

PositionImageDesc：OID_ENDESC	定位图英文描述

PATIENTTYPE：PT_ENDESC	患者类型英文描述

ROOM：ROOM_ENDESC	诊间英文名称

RPTARCHIVEBASE：RPTAB_ENDESC	归档单元英文描述

STUDYGROUP：SG_ENDESC	检查组英文名称

STATE：ST_ENDESC	英文描述

NATION：NT_ENDESC	民族英文描述

Occupation：OP_ENDESC	职业英文描述

STUDYPRIORITY：SPRI_ENDESC	优先级英文名称	林清		2014-03-11		4.5.0.8	1.75	科室代码维护表（LOC）

LOC_RPTMODETYPE（报告样式类型）

LOC_IMGMAGNIFYTIMES（网页报告中图像放大倍数）

并增加部分扩展字段	林清		2014-03-17		4.5.0.8	1.76	修改 PATIENTINFO、WORKLIST 表中字段：

PAT_NAME 长度由 16 位改成 64 位；

PAT_NAMEPY 长度由 32 位改成 128 位；

修改 HISAPPINFO 表中字段：

HIS_NAME 长度由 16 位改成 64 位；

HIS_NAMEPY 长度由 32 位改成 128 位；	林清		2014-04-01		4.5.0.9	1.77	增加 SMARTTYPE（智能提醒类别表）、SMARTKEY（智能提醒条件及关键字表）	林清		2014-04-14		4.5.0.9	1.78	增加 MASSRATINGREASON（质量评级原因表）

RATINGREASON2MDLS（质量评级原因与设备大类对应表）

IMAGERATINGVALUE（影像评级值表）	林清		2014-05-05		4.5.0.11	1.79	检中信息记录（STUDYRECORD）增加字段：

SRE_INTERVENTIONANESTDOC （介入麻醉医生）

SRE_INTERVENTIONA2	（介入手术助手 2）

以及一些备用字段

MODALITYWORKLIST 增加字段：

MWL_PATIENT_AGE（年龄）	林清		2014-06-17				设备和检查组的对应关系（MODALITY2GROUP）增加字段：MG_PRIORITY（检查组优先级）					4.5.1.3	1.80	增加 PROCESSTIMECONTROL  流程时间控制表

增加 PROCESSTIMECONTROL2ROLE  流程时间控制与角色对应表	林清		2014-07-31		4.5.1.4	1.81	增加 USERSEXT  （用户扩展表）

增加 MEASUREREFERENCE （检查测值参考标准表）

增加 SYSTEMPARAMEXT （系统设置扩展表）	林清		2014-09-16		4.5.1.4	1.82	增加 FILELOG  （文件日志表）	林清		2014-11-14		4.5.1.4	1.83	快捷诊断模板表（TPLSHORTCUT）增加字段：

TSHC_ASSOCIATED（是否关联）	林清		2014-11-26		4.5.1.5	1.84	检查测值单元扩展表（MEASUREBASEEXT）增加字段：

MBE_ISFOETUS	（是否应用于胎儿）

增加检查测值单元范围表（MEASUREBASERANGE）

增加测值方案与检查项目对应表

（MEASURESCHEME2SITEM）	林清		2015-01-04		4.5.1.5	1.85	增加 PATIENTLEVEL （患者级别表）、

PATCONFIDENTIALLEVEL （患者保密级别表）

病人申请信息表（HISAPPINFO）增加字段：

HIS_PATIENTLEVEL	（患者级别）

HIS_PATCONFIDENTIALLEVEL（患者保密级别）及部分备用字段

检查信息表（STUDYINFO）增加字段：

PL_ID	（患者级别 ID）

PCL_ID	（患者保密级别 ID）及部分备用字段	林清		2015-01-15		4.5.1.5	1.86	增加 LESIONDESCRIPTION  （病变描述表）	林清		2015-06-15		4.5.1.5	1.87	增加 FILECOMMAND（文件处理指令表）、

FILECOMMANDDETAILS（待处理的文件明细表）

存储服务器信息表（SERVERINFO）增加字段：

SR_FTPPORT	 （FTP 端口）	林清		2015-07-13		4.5.2.1	1.88	原有的表 ST_ACCNUM 是 16 位，有的是 32 位，现将其统一为 32 位	林清		2015-08-04		4.5.2.2	1.89	镜子信息表（GLASS）增加字段：

GN_TRIMSIZE（对应的裁剪尺寸）	林清		2015-12-11		4.5.2.4	1.90	增加 REPORTMODEIMAGE（报告样式使用的图片表）	林清		2016-01-12		4.5.2.4	1.91	检查组表（STUDYGROUP）增加字段：

SG_ISRPTDOUBLESIGN（报告是否需要双签）	林清		2016-01-20		4.5.2.6	1.92	检查信息表（STUDYINFO）

ST_AGEUNIT（年龄单位）由 VCHAR(2)改为 VCHAR(16)

申请信息表（HISAPPINFO）

HIS_AGE（年龄）由 CHAR(8)改为 CHAR(16)	林清		2016-03-15		4.5.3.4	1.93	申请单医嘱项目表（APPBILL）增加字段：

AB_BODYPARTCODE（部位代码）

AB_BODYPARTDESC	（部位描述）

AB_FEESTATUS	（收费状态）

AB_STUDYFEE   	（检查费）

AB_MATERIALFEE	（材料费）

AB_MEDICINEFEE	（药费）

ST_ACCNUM	（检查号）

患者检查部位表（STUDYBODAYPARTVALUE）增加字段：

SBV_BPSTATUS	（部位状态）

HIS_APPID	（申请单号）

增加 BODYPARTCAT （检查部位大类表）

检查部位表（BODYPART）增加字段：

BC_ID（部位大类 ID）	林清		2016-06-22		4.5.3.4	1.94	科室代码维护表（LOC）增加字段：

LOC_SITEMADDBODYPART（检查项目描述是否加上检查部位）

并增加部分备用字段	林清		2016-07-06		4.5.3.7	1.95	增加 TPLDIR2BODYPARTCAT （诊断模板目录与部位大类对应表）	林清		2016-11-15		4.5.3.7	1.96	增加 SPECIALTYGROUP （影像专业组）

患者检查部位表（STUDYBODAYPARTVALUE）增加字段：

BC_ID （部位大类 ID）	林清		2016-11-22		4.5.3.8	1.97	编号码生成规则表（NUMBERRULE）增加字段

SPG_ID	（影像专业组 ID	）	林清		2016-12-29		4.5.3.8	1.98	增加 STUDYBODYPARTWEIGHT （检查项目部位权重表）  	林清		2017-01-04		4.5.3.8	1.99	用户日志内容（USERLOGCONTENT）增加字段：

LOGC_OPER	（用户操作）	林清		2017-01-06		4.5.3.9	2.00	图像（文件）信息表（IMAGEINFO）增加字段：

IMG_ARCHIVE	（是否归档）

IMG_PRINTED	（图像是否打印）

检查部位表（BODYPART）

BP_CODE（部位代码）由 VCHAR(16)改为 VCHAR(64)

待处理的文件明细表（FILECOMMANDDETAILS）增加字段：

FCDF_RPTSTATUS（报告状态）	林清		2017-02-22		4.5.4.1	2.01	检查项目表（STUDYITEM）增加字段：

SI_WEIGHT2	（检查项目权重 2）

增加 RESOURCETIME2STUDY  （资源时间段跟检查关联表）	林清		2017-03-27		4.5.4.3	2.02	资源计划表（RESOURCEPLAN）增加字段：

RP_HINT（预约提示信息）	林清		2017-05-08		4.5.4.4	2.03	增加 SELFREPORTEDMACHINEINFO （自助报道机信息表）	林清		2017-06-22		4.5.4.4	2.04	资源时间段跟检查关联表（RESOURCETIME2STUDY）增加字段：

RTS_STATUS	（当前状态）

RTS_LOCKUSER	（锁定号源不可用的用户）

RTS_SELECTEDUSER	（选中号源的用户）	林清		2017-06-28		4.5.5.1	2.05	用户日志内容（USERLOGCONTENT）增加字段：

HIS_APPID	（HIS 申请单号）	林清		2017-12-20		4.5.5.2	2.06	检查信息表（STUDYINFO）修改字段：

ST_UID 由 VCHAR(32)-> VCHAR(128)

自助报道机信息表（SELFREPORTEDMACHINEINFO）增加字段：

SRM_CALLPATINTERFACE（是否调用叫号组接口）

SRM_BSREGSTERINTERFACE（是否调用 BS 预约平台接口）

并增加部分备用字段	林清		2017-12-29		4.5.5.3	2.07	检查部位表（BODYPART）增加字段：

BP_PYALIAS	（部位拼音别名）	林清		2018-01-08		4.5.5.4	2.08	申请单医嘱项目表（APPBILL）增加字段：

AB_SPOSCODE	（体位代码）

AB_SPOSDESC	（体位名称）

患者检查部位表（STUDYBODAYPARTVALUE）增加字段：

SBV_SPOS 	（拍摄体位）		林清		2018-01-23

是否使用强密码策略

目  录

TOC \o "1-3" \h \z \u HYPERLINK \l "_Toc212531821"0	报告编制要求	 PAGEREF _Toc212531821 \h 3

HYPERLINK \l "_Toc212531822"1	引言	 PAGEREF _Toc212531822 \h 3

HYPERLINK \l "_Toc212531823"1.1	文档编制目的	 PAGEREF _Toc212531823 \h 3

HYPERLINK \l "_Toc212531824"1.2 	词汇表	 PAGEREF _Toc212531824 \h 4

HYPERLINK \l "_Toc212531825"1.4	 参考资料	 PAGEREF _Toc212531825 \h 4

HYPERLINK \l "_Toc212531826"2	总体设计	 PAGEREF _Toc212531826 \h 4

HYPERLINK \l "_Toc212531827"2.2.1	数据库版本描述	 PAGEREF _Toc212531827 \h 4

HYPERLINK \l "_Toc212531828"2.2.2	数据库表结构描述	 PAGEREF _Toc212531828 \h 4

报告编制要求

这里列出本系统设计报告编制的经验性要求，须由系统设计人员参照其进行裁剪以确定本次报告编制的相关规定。

序号	要求		1	表结构		2	表名、表字段 都为大写		3	字段长度简写不要超过 5 个字符 0000000		4	日期时间字段名称：DATETIME  日期+时间、DATE 只有日期、TIME 只记录时间		5			6			7			8			9						1	引言

1.1	文档编制目的

规范软件的功能，指导开发人员的开发工作，开发人员要充分了解 DHC PACS/RIS V3.2 版的功能。

1.2 	词汇表

列出本系统设计说明书中专门术语的定义、英文缩写词的原词组和意义、项目组内达成一致意见的专用词汇，同时要求继承全部的先前过程中定义过的词汇。

词汇名称	词汇含义	备注		检查号	患者在 PACS/RIS 系统中当此检查的唯一编号			ACR	放射科 解剖病理代码			SI_ID	检查项目 ID			ST_ID	检查状态 ID			ST_ACCNUM	检查号			USER_ID	用户 ID			LOC_ID	科室 ID			PT_ID	患者类型 ID			PAT_ID	登记号			CP_ID	客户端 ID			UP_ID	用户参数 ID							备注中注明该词汇的来源，或有其他更详细的解释的文档位置；以及对该词汇的其他叫法。

1.4		参考资料

DHC PACS/RIS v3.2 系统设计报告

2	总体设计

hi2.2.1	数据库版本描述

DB2 v9.5：

Cache V5.15

数据库表结构描述

基础数据维护表、Cache 建立 PACS 表空间，DB2  建立 PACS  Schema

ACRCODEANATOMICAL  ACR 解剖代码

字段名称	含义	类型	不为空	外键	说明		AID	解剖代码 ID	INTEGER	是				DESCRIPTION	描述	VCHAR(128)					DESCRIPTIONEN	英文描述	VCHAR(128)

ACRCODEPATHOLOGICAL  ACR 病理代码

字段名称	含义	类型	不为空	外键	说明		PID	病理代码 ID	INTEGER	是				AID	解剖代码 ID	INTEGER	是	是			DESCRIPTION	描述	VCHAR(128)					DESCRIPTION EN	英文描述	VCHAR(128)

ACRCODESUBANATOMICAL  ACR 解剖子代码

字段名称	含义	类型	不为空	外键	说明		SID	解剖代码子 ID	INTEGER	是				AID	解剖代码 ID	INTEGER	是	是			DESCRIPTION	描述	VCHAR(128)					DESCRIPTIONEN	英文描述	VCHAR(128)

ACRCODESUBPATHOLOGICAL  ACR 病理子代码

字段名称	含义	类型	不为空	外键	说明		PID	病理代码 ID	INTEGER	是				AID	解剖代码 ID	INTEGER	是	是			SID	解剖代码子 ID	INTEGER	是				DESCRIPTION	描述	VCHAR(128)					DESCRIPTIONEN	英文描述	VCHAR(128)

APPBILL 申请单医嘱项目表

字段名称	含义	类型	不为空	外键	索引	说明		AB_ID	申请单项目 ID	INTEGER	是		是	主键		HIS_ID	申请信息 ID	INTEGER	是	是				PA_OEORD	医嘱号	VCHAR(64)			是	HIS 医嘱 ROWID		AB_ITEMCODE	医嘱项目代码	VCHAR(32)				在登记匹配的 时候可以按检查项目 CODE 匹配，匹配不成功，可以按照检查项目的名称匹配。		AB_ITEMDESC

检查项目描述（医嘱名称）	VCHAR(128)						ABENITEMDESC

检查项目英文表述描述	VCHAR(64)						AB_PRICE	单价	FLOAT						AB_NUMBER	数量	INTEGER						AB_STATUS	申请单项目状态	VCHAR(2)				申请：A

停止：S

执行 ：E		AB_ITEMNO	检查项目序号	VCHAR(8)				返回给 HIS 需要		AB_BODYPARTCODE	部位代码	VCHAR(32)				一个部位对应一条记录		AB_BODYPARTDESC	部位描述	VCHAR(64)						AB_FEESTATUS	收费状态	CHAR(8)				P：表示已经收费

TB , B 或者空的表示未收费		AB_STUDYFEE   	检查费	VCHAR(16)						AB_MATERIALFEE	材料费	VCHAR(16)						AB_MEDICINEFEE	药费	VCHAR(16)						ST_ACCNUM	检查号	VCHAR(32)						BC_ID	部位大类 ID	BC_ID		Y	Y			AB_SPOSCODE	体位代码	VCHAR(64)				多个体位用“、”分隔		AB_SPOSDESC	体位名称	VCHAR(64)				多个体位用“、”分隔		RIS 提供 WCF 服务，插入申请单信息表

完成预约登记的时候，插入登记号和检查号，便于方便查询

申请单含有多个检查项目（医嘱项目）

APPRESOURCE 资源使用情况表

字段名称	含义	类型	不为空	外键	索引	说明		APS_ID	ID	INTEGER	是		是	主键		RP_ID	资源计划 ID	INTEGER		是	是	RESOURCEPLAN /RP_ID		LOC_ID	科室 ID	INTEGER		是	是			MODALITY_ID

设备 ID	INTEGER		是	是			USER_ID	用户 ID	INTEGER		是	是			APS_DATE	日期	DATE			是			APS_MAX	当前使用的最大数	INTEGER				当前已使用的数量		APS_LAST STUDYNO	上个病人的检查号	VCHAR（32）				在个病人做预约的时候要查看上个病人做检查项目的时间，方便为本次安排预约时间。		APS_SID	检查组 ID 	INTEGER			是			APS_ACTUALMAX	实际最大就诊数	INTEGER				默认为资源计划中配置的数量，可结合每天的情况进行修改		APS_ACTUALEXTRANUM	实际额外增加数量	INTEGER						APS_MAXSEQUENCENO	当前生成的最大流水号	INTEGER						APS_RELEASEDNO	释放的流水号	VCHAR（64）				修改或取消预约后释放出来的流水号，多个流水号用“^”分开		说明：当前资源的使用情况表，预约有两种情况。

一种是根据资源计划，在一段时间大概做多少人，预约不能超过这个人数。

还有一种情况特别在核磁科室，对于每种检查做的时间都差不多固定，让护士根据病人的检查项目和上个病人的预约情况，手工安排预约时间。这种是顺序预约。

BIOPSYPART 活检部位表

字段名称	含义	类型	不为空	外键	索引	说明		BOP_ID	活检部位 ID	INTEGER	是		Y	主键		BOP _CODE	活检部位代码	VCHAR(16)			Y	拼音码		BOP _DESC	活检部位名称	VCHAR(64)						BOP _ENABLE	是否可用	SMALLINT				Default 1

BODYPARTCAT 检查部位大类表

字段名称	含义	类型	不为空	外键	索引	说明		BC_ID	部位大类 ID	INTEGER	是		Y	主键		BC_CODE	部位大类代码	VCHAR(32)			Y			BC_DESC	部位大类名称	VCHAR(32)

BODYPART 检查部位表

字段名称	含义	类型	不为空	外键	索引	说明		BP_ID	部位 ID	INTEGER	是		Y	主键		BP_CODE	部位代码	VCHAR(64)			Y			BP_DESC	部位名称	VCHAR(64)						BP_ENABLE	部位是否可用	SMALLINT				Default 1		BP_EWEIGHT	编辑报告权重	FLOAT				在统计工作量时，编辑报告的权重		BP_VWEIGHT	审核报告权重	FLOAT				在统计工作量时，审核报告的权重		BC_ID	部位大类 ID	INTEGER		Y	Y			BP_PYALIAS	部位拼音别名	VCHAR(64)			Y			胸部，上肢，下肢，腹部，手部

BODYPART2LOC 科室部位对应表

字段名称	含义	类型	不为空	外键	索引	说明		BP_ID	部位 ID	INTEGER	是	是		BODYPART 表		LOC_ID	科室 ID	INTEGER	是	是	是

BODYPART2STUDYITEM 部位检查项目对应表

字段名称	含义	类型	不为空	外键	索引	说明		BP_ID	部位 ID	INTEGER	是	是	Y			SI_ID	检查项目	INTEGER		是	Y			SP_HOSPCODE	医院 CODE	VCHAR(32)			Y	满足多家医院的需求，同一检查项目在不同医院对应不同的部位

CALLBACK  复查随访信息表 （检后信息记录）主要给内镜和超声用

字段名称	含义	类型	不为空	外键	索引	说明		CB_ID	复查记录 ID	INTEGER	是					ST_ACCNUM	检查号	VCHAR(32)	是	是	Y			CB_BACKDT	复查日期	DATETIME						CB_REMINDLENGTH	提前提醒天数	VCHAR(16)						CB _ REMINDDAY	提醒日期	DATETIME			Y			CB_NEEDREMIND	是否需要提醒	SMALLINT						CB _REMARK	备注	VCHAR(256)						USER_ID	回访医生 ID	INTEGER			Y			LOC_ID	回访科室 ID

INTEGER			Y			CB_STATUS	回访状态

VCHAR(16)			Y	已回访： Y

未回访： N		CB_RESULT	回访结论	VCHAR(256)						CB_APPUSERID	申请回访医生 ID	INTEGER														CALLPARAM  呼叫参数配置表（对应到科室、检查组、诊间、设备 根据实际情况配置）

字段名称	含义	类型	不为空	外键	索引	说明		CAP_ID	呼叫参数配 ID	INTEGER	是			自增长列 主键		LOC_ID	所属科室 ID	INTEGER	是	是	是			SG_ID	检查组 ID	INTEGER		是	是			ROOM_ID	诊间 ID	INTEGER		是	是			MDL_ID	设备 ID	INTEGER		是	是			CAP_FORMAT	呼叫参数格式	VCHAR(64)				与数据库字段名一致		CAP_FILE	呼叫文件存放目录	VCHAR(128)						CAP_QUEUE	呼叫队列	VCHAR(64)				检查组关联		CAP_TTYPE	呼叫类型	INTEGER			索引	一次呼叫（诊间呼叫）

二次呼叫（前台呼叫）		一次呼叫（诊间呼叫） CAP_TTYPE=1

二次呼叫（前台呼叫） CAP_TTYPE=2

CALLQUEUE  呼叫队列表

字段名称	含义	类型	不为空	外键	索引	说明		CAQ_ID	呼叫文件 ID	INTEGER	是		Y	自增长列		ST_ACCNUM	检查号	VCHAR(32)	是					LOC_ID	所属科室 ID	INTEGER	是		Y			SG_ID	检查组 ID	INTEGER			Y			ROOM_ID	诊间 ID	INTEGER			Y			MDL_ID	设备 ID	INTEGER			Y			CAQ_CONTENT	呼叫文件内容	VCHAR(128)						CAQ_FILE	呼叫文件存放路径	VCHAR(128)						CAQ_QUEUE	呼叫队列	VCHAR(64)						CAQ_STATUS	呼叫状态	VCHAR(16)				未呼叫（UnCalled）、已呼叫(Called)、过号(Passed)、等待(Waiting)		CAQ_DATE	日期	DATE			Y			CAQ_NUMBER	流水号 	INTEGER						CAQ_LOCKMDL	呼叫时锁定的设备	INTEGER		Y	Y			CAQ_NUMBERDESC	呼叫流水号	VCHAR(16)				加字头		CAQ_STARTTIME	开始时间	TIME				当一天的各时间段各用一个呼叫队列时，呼叫列表得按时间段区分		CAQ_ENDTIME	结束时间	TIME

CALLPACSIMAGERIS 调阅 PACS 图像表

字段名称	含义	类型	不为空	外键	索引	说明		CPI_PATIENTID	RIS 登记号	VCHAR(16)	是		Y			CPI_ACCNUM	RIS 检查号	VCHAR(16)	是		Y	主键		CPI_PPATIENTID	PACS 病人 ID 	VCHAR(16)	是		Y	PACS 信息		CPI_P ACCNUM	PACS 病人检查号	VCHAR(16)			Y	PACS 信息		CPI _PNAME	姓名	VCHAR(16)				PACS 信息		CPI _PSEX	性别					PACS 信息		CPI _PDOB	生日					PACS 信息		CPI _PDATE	日期					PACS 信息		CPI _PTIME	时间					PACS 信息		CPI _MODALITY	设备					PACS 信息		CPI _IMAGECOUNT	图像数					PACS 信息		CPI _SERIESCOUNT	序列数					PACS 信息		CPI _UPDATEDOC	更新医生					PACS 信息		CPI _UPDATEDATE	更新日期					PACS 信息		CPI _UPDATETIME	更新时间					PACS 信息

CAMERAPARAM 摄像头视频参数表

字段名称	含义	类型	不为空	外键	索引	说明		CRP_ID	摄像头 ID	VARCHAR(32)	是		Y			CRP_BRIGHT 	亮度	INTEGER						CRP_CONTRAST	对比度	INTEGER						CRP_SATURATION	饱和度	INTEGER						CRP_HUE	色调	INTEGER

CARDTYPE 卡类型基本表

字段名称	含义	类型	不为空	外键	索引	说明		CT_ID	ID	INTEGER	是		Y	主键		CT_DESC	卡类型描述	VARCHAR(32)	是					CT_ENDESC	卡类型英文描述	VARCHAR(64)						CARDREF 病人卡信息表

字段名称	含义	类型	不为空	外键	索引	说明		CF_ID	ID 		是		不为空			PAT_GPATIENTID	外部患者 ID	VCHAR(16)	是		患者登记号	Y		CF_CARDID	卡号	VCHAR(20)	是					CT_ID	卡类型 ID	INTEGER	是		Y	主键		CF_ACTIVEFLAG	是否激活	INTEGER				Normal

正常

Suspend 挂起

Reclaim 回收

Depose

作废		CF_IDCardNo	身份证	VCHAR(20)

CHARGEITEM	收费项目表

字段名称	含义	类型	不为空	外键	索引	说明		CGI_ID	收费 ID	INTEGER	是		Y			CGI_DESC	收费项目名称	VCHAR(30)	是					CGI_ENDESC	收费项目英文名称	VCHAR(128)	是													CGI_PRICE	收费项目价格	FLOAT	是					CGI_ AVAILABLE	是否可用	BOOL 						CGI_CAT_ID	收费子类	INTEGER		Y	Y			CGI_CODE	收费项目代码	VCHAR(8)						CGI_INPUTCODE	输入拼音代码	VCHAR(10)			Y			CGI_TYPE	费用类型	VCHAR(10)				医保、自费、公费		CGI_SPEC	规格	VCHAR(10)						CGI_UNIT	单位	VCHAR(10)						CHARGEITEMCAT	收费子类

字段名称	含义	类型	不为空	外键	索引	说明		CGC_ID	收费类别 ID	INTEGER	是		Y	主键		CGC_DESC	收费类别名称	VCHAR(16)	是					CGC_ AVAILABLE	是否可用	BOOL 						CGC_CODE 	收费类别代码	VCHAR(8)	是

CHARGEITEMCAT2LOC	收费子类与科室的对应关系

字段名称	含义	类型	不为空	外键	索引	说明		CGC_ID	收费类别 ID	INTEGER	是		Y	主键		LOC_ID	科室 ID	INTEGER		Y	Y			CLIENTPARAM  客户端参数表（IP、连接设备）

字段名称	含义	类型	不为空	外键	索引	说明		CP_ID	ClientParam ID	INTEGER	是		Y	主键		CP_IP	客户端 IP	VCHAR(16)			Y			CP_HOSTNAME	客户端机器名	VCHAR(32)			Y			LOC_ID

默认登陆科室 ID	INTEGER						MDL_ID	设备 ID	INTEGER				可根据设备关联到诊间、呼叫参数		MDLS_ID	设备大类 ID	CHAR(4)				如果设备 ID 为空，则需要填写默认处理的设备是什么。		CP_AUTOLISTIEN	是否自动监听	SMALLINT						CP_AE	客户端 Dicom 服务 AE	VCHAR(32)						CP_PORT	客户端 Dicom 服务监听端口	INTEGER						CP_LOCALSTOREPATH	客户端文件储路径	VCHAR(128)						CP_LOCALSTORETERM	客户端文件储期限	INTEGER				自动删除从当日起 N 天前的数据		CP_COMPORT	客户端监听 Com 口	INTEGER				连接脚踏板		CP_UPLOADAVI	avi 动态图像是否上传	SMALLINT						SUBSYS_ID	子系统 ID	INTEGER				默认登陆的子系统		CP_CutInfo	裁剪区域	String						SG_ID	检查组	INTEGER						CP_SGLOCK	检查组是否锁定	SMALLINT						CP_CAPOPENREPORT	打开图像采集同时打开	SMALLINT						CP_REPORTOPENCAP	打开报告同时采集图像	SMALLINT						SP_HOSPCODE	医院 CODE	VCHAR(32)						CS 程序安装后，第一启动需要完善 客户端参数配置。如果用户不配置科室和默认的设备大类、设备则为灵活策略。如果配置了科室和设备大类则为相对稳定策略。

采用灵活策略：系统运行时需要用户输入登陆代码和登陆科室。系统根据登陆科室和用户权限加载模板大类、报告样式、词条等。

相对稳定策略：系统运行时弹出用户的头像，用户点击他的头像后录入登陆秘密。根据初始化参数加载报告模板、报告样式、词条等。

配置了初始化参数后更新程序不需要再配置。如果用户需要修改参数，可以在客户端修改，也可以在 bs 管理中心修改。如果用户修改 ip 等参数登陆后需要提示用户更新客户端参数。

DICOMPATIENT   DICOM 病人信息表

字段名称	含义	类型	不为空	外键	索引	说明		DP_ID	ID	INTEGER	是		Y			DP_PATIENTID	病人 ID	VCHAR(16)	是	是	Y			DP_PATIENTNAME	姓名	VCHAR（20）						DP_SEX	性别	VCHAR（2）						DP_DOB	生日	DATE						DP_WEIGHT	体重	FLOAT						DP_HEIGHT	身高	FLOAT						DICOMSTUDY     DICOM 检查信息表

字段名称	含义	类型	不为空	外键	索引	说明		DS_ID	ID	INTEGER	是		Y	主建		DP_ID	DICOMPATIENT  ID	INTEGER			Y	外键		DS_ACCNUM	检查号	VCHAR(32)	是	是	Y			DS_STUDYID	STUDY ID	VCHAR(16)						DS_DATETIME	检查日期时间	DATE			Y			DS_STUDY UID 	检查 UID	VCHAR(64)						DS_STUDYDESC	检查描述	VCHAR(64)						DS_REFDOCTOR	接诊医生	VCHAR(16)						DS_REFDEPARTMENT	接诊科室	VCHAR(16)						DS_RADIOLOGIST	放射技师	VCHAR(16)														DICOMSERIES 序列信息表

字段名称	含义	类型	不为空	外键	索引	说明		DSS_ID	ID	INTEGER	是		Y			DP_ID	DICOM 病人信息表 ID

INTEGER	是		Y	外键		DS_ID	DICOMSTUDY ID	INTEGER	是		Y	外键		DSS_UID	SeriesInstance UID	VCHAR(32)	是		Y	主键		DSS_MODALITY	设备	VCHAR(16)			Y			DSS_BODYPART	部位	VCHAR（16）						DSS_NUMBER	SER_NUMBER	INTEGER						DSS_REMARK	备注							DICOMIMAGE     DICOM 图像信息表

字段名称	含义	类型	不为空	外键	索引	说明		DI_ID	ID	INTEGER	是		Y	主键		DP_ID	DICOM PATIENT ID 		是	是	Y			DSS_ID	DICOMSERIES ID		是	是	Y			IMG_ID	图象（文件表）ID		是	是		IMAGEINFO		DS_ID	DICOM STUDY ID	VCHAR(16)	是	是	Y			DI_TYPE	图像类型	VCHAR(8)				SR, IMAGE 		DI_SOPUID	SOP INSTANCE UID 	VCHAR(128)			Y			DI_CLASSUID	SOP CLASS UID 	VCHAR(128)			Y			DI_INSTANCENUMBER	Instance Number	INTEGER						DI_SRCONTENT	结构化报告的内容	STREAM																						FEETYPE	费用类型表

字段名称	含义	类型	不为空	外键	索引	说明		FT_ID	费用类型 ID	INTEGER	是		Y			FT_DESC	费用类型描述	VCHAR(16)	是					FT_ENDESC	费用类型英文描述	VCHAR(64)						该表说明病人的类型，是自费病人，医保病人，还其他的费用的病人。

FILELOG  文件日志表

字段名称	含义	类型	不为空	外键	索引	说明		LOG_ID	文件日志 ID	INTEGER	是		Y			LOG_DATE	日志日期	DATE			Y			LOG_TIME	日志时间	TIME						USER_ID	操作者	INTEGER		Y	Y			LOG_IP	客户端 IP	VCHAR(16)			Y			LOG_MODE	操作模块	VCHAR(32)			Y			ST_ACCNUM	患者检查号	VCHAR(32)			Y			LOG_TYPE	日志类型	SMALLINT			Y	1：ERROR

2：INFO		LOG_FILECOMMAND	文件操作类型	SMALLINT			Y	1：上传

2：下载

3：删除		LOG_CONTENT	日志内容	VCHAR(512)						LOG_FILENAME	文件名	VCHAR(128)

FILECOMMAND 文件处理指令表

字段名称	含义	类型	不为空	外键	索引	说明		FCD_ID	ID	INTEGER	是		Y	主键		FCD_COMMAND	指令类型	VCHAR(16)				Upload/Download/Delete/CStore/CFind		FCD_STUDYNO	检查号	VCHAR(32)						LOC_ID	科室	INTEGER		Y				FCD_LOCALSTOREPATH	文件存储路径	VCHAR(128)						FCD_DATE	日期	DATE			Y			FCD_TIME	时间	TIME						USER_ID	操作者	INTEGER		Y	Y			FCD_IP	客户端 IP	VCHAR(16)			Y

FILECOMMANDDETAILS 待处理的文件明细表

字段名称	含义	类型	不为空	外键	索引	说明		FCDF_ID	ID	INTEGER	是		Y	主键		FCD_ID	指令 ID	INTEGER	是	Y	Y			FCDF_FILENAME	文件名称	VCHAR(64)						FCDF_FILEPATH	文件路径	VCHAR(128)				相对路径

FCDF_STATUS	当前执行状态	VCHAR(16)				Y  正在执行

N  未执行

NoFile：文件不存在

NoServer：未找到服务器信息

NoDelete		FCDF_FILETYPE	文件类型	VCHAR(8)				XPS：报告， DWT：定位图， IMG：图像， AUD：语音报告， MOV：视频，SYSDWT 系统定位图		FCDF_FILEDESC	文件描述	VCHAR(128)						FCDF_PRINTED	是否打印	INTEGER				1：已打印，2：未打印		FCDF_TASKID	任务处理标志	INTEGER						FCDF_DELETEFLAG 	删除标记	INTEGER				删除指定位置的文件，

0：本地

1：远程（包括数据库记录）

2：全部文件（包括数据库记录）		FCDF_RPTSTATUS	报告状态	VCHAR(16)				S：已发布

US：未发布		任务处理标志：1	我的工作台批量打印	---批量下载报告

2	我的工作台浏览报告	---下载报告

3	报告界面		---上传或下载报告

4	报告界面图像列表	---上传或下载图像

5	报告界面历史报告图像列表 ---下载图像

6	图像采集		---上传或下载图像

7	查看报告界面		---下载图像

8	临床看报告		---下载报告

9	临床看图像		---下载图像

GLASS 镜子信息表

字段名称	含义	类型	不为空	外键	索引	说明		GN_ID	主键 ID	INTEGER						GN_NO	镜子编号	VCHAR(32)	是		Y			GN_DESC	镜子描述	VCHAR(32)						GN_MANUFACTURER 	厂家	VCHAR(16)						GN_ PURCHASEDDATE	购买日期	Date						GN_ CONTACT	联系人	VCHAR(8)						GN_ CONTACTTEL	联系电话	VCHAR(16)						GN_ENDESC	镜子英文描述	VCHAR(64)						GN_TRIMSIZE	对应的裁剪尺寸	VCHAR(32)

GLASS2LOC 镜子编号与科室对应关系

字段名称	含义	类型	不为空	外键	索引	说明		LOC_ID	科室 ID	INTEGER	是		Y			GN_ID	镜子编号 ID	INTEGER

HISAPPINFO 病人申请信息表（HIS 传输过来的信息）

字段名称	含义	类型	不为空	外键	索引	说明		HIS_ID	申请信息 ID	INTEGER	是		Y	主键		HIS_PATIENTID	登记号	VCHAR(16)	是		Y			HIS_OUTPATID	门诊号	VCHAR(16)						HIS_INPATID	住院号	VCHAR(16)						HIS_CASEID	病案号	VCHAR(16)						HIS_EPSODID	就诊号	VCHAR(16)						HIS_NAME	姓名	VCHAR(64)	是		Y			HIS_NAMEPY	姓名拼音	VCHAR(128)						HIS_DOB	生日	DATE						HIS_AGE	年龄	CHAR(16)						HIS_SEX	性别	CHAR(8)						HIS_HEIGHT	身高	CHAR(8)						HIS_WEIGHT	体重	CHAR(8)						HIS_VOCATION	职业	VCHAR(32)						HIS_FOLK	民族	VCHAR(16)						HIS_NATION	国籍	VCHAR(16)						HIS_ADDRESS	地址	VCHAR(64)						HIS_PHONE	电话	VCHAR(32)						HIS_MOBILE	移动电话	VCHAR(32)						HIS_IDNUMBER	身份证号	VCHAR(32)						HIS_CARDID	磁卡号	VCHAR(32)			Y			HIS_BARCODE	条形码	VCHAR(32)						HIS_SOCIETYID	社会保险号	VCHAR(32)						HIS_PATTYPE	病人类型	VCHAR(16)			Y			HIS_ITEMDESC

检查项目描述（医嘱名称）	VCHAR(512)				如果 HIS 一个申请单要做多个检查项目，用逗号分开		HIS_ITEMENDESC

检查项目描述（英文描述）	VCHAR(64)				如果 HIS 一个申请单要做多个检查项目，用逗号分开		HIS_OEORDDATE	下医嘱日期	DATETIME			Y			HIS_HOPEDATE	期望执行日期	DATE 						HIS_EXELOCID	执行科室 CODE	VCHAR(16)			Y	HIS 与 RIS 应该一致，否则 接受不到		HIS_APPLOC	申请科室 CODE	VCHAR(16)						HIS_APPDOC

申请医生	VCHAR(16)						HIS_WARD	病区	VCHAR(32)						HIS_SICKROOM	病房	VCHAR(16)						HIS_BEDNO	床号	VCHAR(16)						HIS_ISBEDOEORD	床旁医嘱	SMALLINT						HIS_AIM	检查目的	VCHAR(128)						HIS_CLINIC	临床诊断	VCHAR(256)						HIS_TOTALFEE	费用	CHAR(16)						HIS_FEETYPE	费用类别							HIS_FEESTATUS	收费状态	CHAR(8)				P：表示已经收费

TB , B 或者空的表示未收费		HIS_REMARK	备注	VCHAR(256)						ST_ACCNUM	检查号	VCHAR(32)						RPT_ID	报告号	INEGER		外键		REPORTINFO		HIS_APPID	HIS 申请单号	VCHAR(64)			Y			IMAGE_ID	申请单文件 ID	INTEGER		外建		扫描申请单存放文件		HIS_CONTENT	申请单内容	Stream

HIS_VISITDATE	就诊日期	DATE						HIS_VISITCOUNT	住院次数	INTEGER						SG_ID	执行检查组 ID	INTEGER		外键				HIS_VISITNO	就诊序号	CHAR(12)				住院病人就诊号：PatientID + 住院次数

门诊病人就诊号：

PatientID + 就诊日期 + 就诊序号		HIS_SUBCLASS 	检查子类	CHAR(16)				HIS 发送申请单的检查类别，用于统计		HIS_CLASS	检查大类	CHAR(16)				HIS 发送申请单的检查大类，用于统计		PAT_GPATIENTID	病人外部 ID	VCHAR(16)			Y			HIS_STATUS	申请单状态	CHAR(8)				申请：A

停止：S

执行 ：E		HIS_STOPDATE	停止日期	DATE						HIS_STOPTIME	停止时间	TIME						HIS_STOPDOC	停止人	VCHAR(16)						HIS_STUDYFEE   	检查费	VCHAR(16)						HIS_MATERIALFEE	材料费	VCHAR(16)						HIS_MEDICINEFEE	药费	VCHAR(16)						HIS_PRIORITY	病人检查优先级	VCHAR(16)				HIS 中的加急标识		HIS_HASSCANFILE	是否有申请单扫描文件	SMALLINT				0：没有

1：有		HIS_CONDITION1	是否手术病人	SMALLINT				0：不是

1：是		HIS_CONDITION2	是否临床路径病人	SMALLINT				临床路径病人：对于某种病有一套规范的治疗流程

0：不是   1：是		HIS_INFO1	是否老系统病人	INTEGER				0：不是

1：是		HIS_INFO2	新版申请单同一医嘱多部位必须一起预约登记	INTEGER				1：是		HIS_NOTE1	病人标志	VCHAR(16)				EO：急诊留观

GC：绿色通道

DC：出院病人

OS：老系统病人（江西南大二附院）		HIS_NOTE2	原接收科室	VCHAR(16)				转诊前的接收科室		HIS_NOTE3	检查部位 	VCHAR(32)				检查部位，格式为：部位 ID1，部位 ID2，部位 ID3		HIS_NOTE4	检验结果	VCHAR(32)						HIS_NOTE5	病史及临床所见（临床症状）	VCHAR(128)						HIS_NOTE6	牙位图信息	VCHAR(1024)						HIS_NOTE7	备注 7	VCHAR(1024)				扩展用		HIS_PATIENTLEVEL	患者级别	VCHAR(32)				级别描述		HIS_PATCONFIDENTIALLEVEL	患者保密级别	VCHAR(32)				保密级别特殊字符		HIS_NOTE8	处方通道类别	VCHAR(16)				婚检、孕检、特检、健康体检、家庭通道、慢病免费、自费、普通医保、生育保险等		HIS_NOTE9	备注 9	VCHAR(16)						HIS_NOTE10	支付方式	VCHAR(32)						HIS_NOTE11	备注 11	VCHAR(32)						HIS_NOTE12	备注 12	VCHAR(32)						HIS_NOTE13	备注 13	VCHAR(64)						HIS_NOTE14	备注 14	VCHAR(128)						 这张表是用来和 HIS 交互的。我们的 WebService 接收到 HIS 消息后，将数据分插到这张表中。登记医生从这张表中获取数据，如果登记了，则把检查号填写进来。WebServic

调用 his 服务，更改病人的医嘱状态。注意，PACS 如果取消登记，需要更新这张。此表是一个申请单对应一条记录，如果申请单有多个检查项目，就放在 申请单子表（APPBILL）里面。HIS  调用我们的报告和图像时，也查询这张表。HIS 传过来医嘱号就可以，根据医嘱号查询我们的 ST_ACCNUM 和 RPT_ID。

HL7MESSAGE 生成 HL7 消息表

字段名称	含义	类型	不为空	外键	索引	说明		HLM_ID	ID	INTEGER	是		Y	主键		HLM_MESSAGEID	消息 ID	VCHAR(16)				唯一		HLM_CREATEDATE	消息生成日期	DATE						HLM_CREATETIME	消息生成时间	TIME 						HLM_MESSAGE	消息内容	STREAM						SUBSYS_ID	子系统 ID 	INTEGER				生成消息子系统 ID , HL7 消息根据子系统来判断用那个 HL7 客户端来发送		HLM_EVENT	消息事件	VCHAR(10)				如 ORM^O01^SC

HL7MESSAGESENT  HL7 消息发送表

字段名称	含义	类型	不为空	外键	索引	说明		HLMS_ID	申请信息 ID	INTEGER	是		Y	主键		HLM_MESSAGEID	消息 ID 	VCHAR(16)	是		Y	唯一		HLMS_SENTTIME	消息发送时间	TIME						HLMS_MESSAGE	消息内容	STREAM						SUBSYS_ID	子系统 ID 	INTEGER				生成消息子系统 ID , HL7 消息根据子系统来判断用那个 HL7 客户端来发送		HLM_EVENT	消息事件	VCHAR(10)				如 ORM^O01^SC		HLMS_SENTCOUNTS	消息发送次数	INTEGER				消息发送次数		HLMS_DELETEFLAG	消息删除标记	SHORT				：删除

0 ：未删除		HLMS_SENTDATE	消息发送日期	DATE						HLMS_PATIENTID	病人 ID	VCHAR(16)						HLMS_PATIENTNAME	姓名	VCHAR(16)						HLMS_VISITNUMBER	就诊号	VCHAR(16)						HLMS_ORDITEMID	检查项目 ID	VCHAR(20)						HLMS_STUDYNO	检查号	VCHAR(20)

HL7SCUCONFIG  HL7 SCU 的配置信息

字段名称	含义	类型	不为空	外键	索引	说明		HLSCC_ID	ID	INTEGER	是		Y	主键		HLSCC_SERVERNAME	HL7 SCU 的名称	VCHAR(16)						HLSCC_SERVERIP	HL7 SCU 的名称	VCHAR(16)						HLSCC_PORT	HL7 SCU 的 PORT	INTEGER

HL7SCPCONFIG  HL7 SCP 的配置信息

字段名称	含义	类型	不为空	外键	索引	说明		HLSCP_ID	ID	INTEGER	是		Y	主键		HLSCP_NAME	SCP 应用实体的名称	VCHAR(16)						HLSCP_IP	SCP IP 地址	VCHAR(16)						HLSCP_PORT	SCP 端口号	INTEGER

HP  HP 检查值表

字段名称	含义	类型	不为空	外键	索引	说明		HP_ID	 ID	INTEGER	是		Y	主键		HP_DESC	HP 值描述	VCHAR(32)						HP_ENDESC	HP 值英文描述	VCHAR(64)

ICDX  ICD 诊断词汇表

字段名称	含义	类型	不为空	外键	索引	说明		ICD_ID	ICD ID	INTEGER	是		Y	主键		ICD_CODE	ICD 诊断代码	VCHAR(16)			Y			ICD_DESC	ICD 诊断描述	VCHAR(128)						ICD_SHORTDESC	ICD 简短描述	VCHAR(64)			Y			ICD_INSDESC

ICD 描述							IMAGEINFO 图像（文件）信息表

字段名称	含义	类型	不为空	外键	索引	说明		IMAGE_ID	图像序号	INTEGER	是		Y			ST_ACCNUM	检查号	VCHAR(32)	是	是	Y			IMG_TYPE	图像类型	VCHAR(16)			Y	BMP, JPG, DCM, PDF，语音文件(avi)		IMG_PATH	图像存储路径	VCHAR(128)				相对与介质的图像的路径		MI_ID	介质 ID	INTEGER		是	Y	当前正在使用的介质		IMG_DESC	图像描述	VCHAR(64)						IMG_SIZE	图像大小	FLOAT						IMG_ARCHIVE	是否归档	SMALLINT				0：报告已发布、文件已上传

1：报告已发布、文件未上传

2：报告未发布、文件已上传

3：报告未发布、文件未上传		IMG_PRINTED	图象是否打印	SMALLINT				1 打印，0 表示未打印		此表来实现 RIS/PACS 中所有的文件集中存储，图象文件，DCM 文件，扫描文件，定位图 ，PDF 文件 等等

IMAGEMLOCATION 图像所在位置

字段名称	含义	类型	不为空	外键	索引	说明		IMAGE_ID	图像序号	INTEGER	是		Y			SOP_UID	图像实例	VCHAR(128)						MI_ID	介质 ID	INTEGER	是	是	Y	备份的介质 ID

图像存储说明：图像存储位置=服务器 IP 地址+介质所在路径+介质名称+图像存储的路径名称。图像

MASSRATING  质量评定等级表

字段名称	含义	类型	不为空	外键	索引	说明		MR_ID	等级 ID	CHAR(16)	是		Y			MR_DESC	等级描述	CHAR(16)						MR_ENDESC	英文描述	VCHAR（32）

LEMMA 词条表（xml）

字段名称	含义	类型	不为空	外键	索引	说明		LEMMA_ID	词条 ID	INTEGER	是		Y			MDLS_ID	设备大类 ID	CHAR(4)		是	Y			LOC_ID	科室 ID	INTEGER		是	Y			USER_ID	用户 ID	INTEGER			Y	如果有值则表示私有		LEMMA_CONTENT	词条内容 	VCHAR(1024) /XML						常用的短语、如果有 USER_ID 则为私有，没有则为公有。可以按照设备大类导入导出

LOC 科室代码维护表（需要加科室类别 如 1 申请科室  2 病区  3 检查科室）

字段名称	含义	类型	不为空	外键	索引	说明		LOC_ID	科室 ID	INTEGER	是		Y			LOC_CODE	科室代码	VCHAR(16)			Y	关键字 唯一，和 his 统一		LOC_INDEX	科室拼音检索	VCHAR(32)			Y			LOC_DESC	科室名称	VCHAR(32)						LOC_ENDESC	科室英文描述名称	VCHAR(32)						LOC_PHONE	科室电话	VCHAR(32)						LOC_ADDRESS	科室地址	VCHAR(32)						LOC_TYPE	科室类型	CHAR(4)			Y	E: 执行科室

A: 申请科室

B: 病区

O: 其它		SR_SGID	报告存储服务器 ID	INTEGER		是		科室对应的报告存储服务器		SR_IMID	IM 服务器 ID			是				LOC_MDVRPTLENGTH	报告保存几天后就不能再修改	INTEGER				报告设置		LOC_ERPTLENGTH	急诊报告几小时内必须出报告	INTEGER						LOC_NEEDVRIFY	报告是否需要审核	SMALLINT				超声科一般不需要审核、放射科需要审核		LOC_NEEDFINAL	报告是否需要终审	SMALLINT						LOC_VMIP	VMIP 地址	VCHAR(32)				视频监控服务器地址		LOC_VMPORT	VM 端口	INTEGER				视频监控服务器端口		LOC_VMUSER	VM 用户	VCHAR(16)				视频监控服务器登录用户		LOC_VMPWD	VM 登录密码	VCHAR(16)				视频监控服务器登录密码		LOC_INVOKEBOOKSERVICE	预约调用 HIS 服务	SMALLINT				Y：表示调用

N：不调用		LOC_INVOKEARRIVESERVICE	到达调用 HIS 服务	SMALLINT				HIS 服务

LOC_INVOKEBILLSERVICE	划价后调用 HIS 服务	SMALLINT						LOC_INVOKEWRITEREPORTSERVICE	报告审核后调用 HIS 服务	SMALLINT						LOC_ISMUTIAPPDISPLAYONE	同一病人的多条申请是否自动勾选	SMALLINT				0：不勾选

1：自动勾选		LOC_FIELDSET	预约登记字段显示设置	VCHAR(4096)						LOC_ISTOIPSAN	是否需要存储到 IPSAN	SMALLINT						LOC_ CREATESEQUENCENOTIME	产生流水号时间	SMALLINT				0：预约的时间

1 ：到达的时间		LOC_STUDYEXETIME	检查执行点，涉及到 HIS 的计费确认，一旦费用确认后 HIS 不能随便、取消费用

BOOK：预约

ARRIVE 到达

HAVEIMG 已有图像

HAVERPT

已写报告

VERIFY

审核报告

LOC_UNPAIDALLOWSTUDY	门诊病人没有收费是否允许做检查	SMALLINT						LOC_REPORTURL	查看报告路径 URL	VCHAR(256)						LOC_APPSENDHL7	是否在预约的发送 HL7 消息	SMALLINT						LOC_ARRIVESENDHL7	是否到达的时候发送 H7 消息	SMALLINT						LOC_ AUDITIINGSENDHL7	是否在审核的时候发送消息	SMALLINT						LOC_AUTOFILLPATID	查询时是否自动填充登记号	SMALLINT						LOC_SAVERPTSERVICE	报告保存后调用 HIS 服务	SMALLINT						LOC_PRINTRPTSERVICE	报告打印后调用 HIS 服务	SMALLINT						LOC_COMMRPTSERVICE	报告提交后调用 HIS 服务	SMALLINT						LOC_ARCHRPTSERVICE	报告终审后调用 HIS 服务	SMALLINT						LOC_RPTRETURNPAGE	报告关闭后返回页面	SMALLINT				0：首页

1：采集界面

2：不返回		LOC_CALLLISTCOUNT	叫号屏幕列表显示患者数量	INTEGER						SP_HOSPCODE	医院 CODE	VCHAR(32)						LOC_EMRURL	调阅电子病历 URL	VCHAR(512)						LOC_EMRPARAM	调阅电子病历的参数组合	VCHAR(64)				各参数间用“,”或者“^”间隔，这些参数必须与 HISAPPINFO 中字段一致		LOC_ISPATIDTRIM	调阅电子病历的参数中登记号是否去零	SMALLINT				传递的参数中，若有登记号，登记号是否去掉前面的 0

1：去掉

0：不去掉		LOC_INPUTFEEURL	调用费用补录 URL	VCHAR(256)						LOC_INPUTFEEPARAM	调用费用补录的参数组合 	VCHAR(64)				各参数间用“,”或者“^”间隔，这些参数必须与 HISAPPINFO 中字段一致		LOC_LINKPROIP	linkpro ip 地址	VCHAR(32)						LOC_LINKPROPORT	linkpro 端口号	INTEGER						LOC_WEBVPXIP	Web VPX IP 地址	VCHAR(32)						LOC_WEBVPXUSER	Web VPX 登录用户	VCHAR(32)						LOC_WEBVPXPWD	Web VPX 登录密码	VCHAR(32)						LOC_INVOKERIS3STUDY	相关检查调用 RIS3.0 的检查信息	SMALLINT						LOC_ISPOPTIP	报告操作是否弹出提示	SMALLINT				0：不提示

1：提示		LOC_ISSRETURN	报告保存后是否返回	SMALLINT				0：不返回

1：返回		LOC_ISPRETURN	报告打印后是否返回	SMALLINT				0：不返回

1：返回		LOC_ISCRETURN	报告提交后是否返回	SMALLINT				0：不返回

1：返回		LOC_ISVRETURN	报告审核后是否返回	SMALLINT				0：不返回

1：返回		LOC_ISRRETURN	报告驳回后是否返回	SMALLINT				0：不返回

1：返回		LOC_ISFRETURN	报告终审后是否返回	SMALLINT				0：不返回

1：返回		LOC_SelectMDType	设备选择方式	SMALLINT				0：选择空闲设备 1：选择上次默认设备 2：选择第一个设备和检查组（即预约时不指定设备和检查组，而是在叫号的时候来区分）		LOC_IsCompatibleOldReport	是否兼容旧模版	SMALLINT				0：不兼容

1：兼容		LOC_INPReservation	住院病人能否手工预约	SMALLINT				0 ：不能

1：能		LOC_OPReservation	门诊病人能否手工预约	SMALLINT				0 ：不能

1：能		LOC_EPReservation	急诊病人是否要求手工录入时费用为 0	SMALLINT				0 ：要求

1：不要求		LOC_FiltStrPat	只筛选指定字符串开头的登记号的病人	VCHAR（32						LOC_IS3Dbuild	是否使用 3D 构建功能	SMALLINT				0：否 1：是		LOC_ISMustSelPositive	阳性阴性是否是必选项	SMALLINT				0：否 1：是		LOC_ClintRptStatus 	临床能看到报告时的报告状态	VCHAR(16)				R-报告 V-审核 F-终审		LOC_ClintRptDelayAfter	报告能被临床查看的延迟时间（分钟）	INTEGER						LOC_RPTEDITABLESTATUS	可编辑报告的检查状态	CHAR（32）				BOOK：预约

ARRIVE：到达

HAVEIMG：已有图像

STUDYING：正在检查

STUDYED：检查完成

默认是预约状态		LOC_EXPCountIsEnable	曝光次数能否修改	SMALLINT				0：不能修改

1：可以修改		LOC_SEQUENCENOTYPE	生成流水号方式	SMALLINT				0：按天生成

1：按时间段生成		LOC_CREATECALLQUEUETIME	生成呼叫队列的时间	SMALLINT				0：预约

1 ：到达		LOC_NAMEPYCASE	患者姓名大小写	SMALLINT				0：小写

1：大写		LOC_ISLOCKWAITPAT	叫号时是否锁定等候患者	SMALLINT				0：锁定（默认）

1：不锁定		LOC_EPUNPAIDALLOWSTUDY	急诊病人没有收费是否允许做检查	SMALLINT				0：允许

1：不允许		LOC_ASSIGNSTUDYSTATUS	自动分配任务时检索的检查状态	CHAR（64）				可包括“BOOK\ARRIVE\HAVEIMG\STUDYED\STUDYING”，多个状态之间用“^”分开		LOC_ASSIGNSTARTDAY	自动分配任务时检索前几天	INTEGER						LOC_ASSIGNENDDAY	自动分配任务时检索后几天	INTEGER						LOC_ASSIGNHASIMG	自动分配任务时是否有图像后再分配	SMALLINT				0：否

1：是		LOC_ASSIGNCOUNT	自动分配任务的数量	INTEGER				也是允许一个医生报告未完成的数量，若报告需要提交，已录入报告状态也认为是未完成		LOC_NEEDCOMMIT	报告是否需要提交	SMALLINT						LOC_ISMUTISTUDYSAMECALLNO	同一病人的多条检查是否使用同一呼叫序号	SMALLINT						LOC_ISRPTRESULTSAMEFONTSIZE	报告结果是否同步调整字体大小	SMALLINT						LOC_IMGSERVERINFO	PACS 浏览器信息	CHAR（128）				具体说明见下文		LOC_CA	开启 CA 	SMALLINT				1。开启 CA

0. 关闭		LOC_ERPTSELVDOC	保存报告时是否可选择审核医生	SMALLINT				0：否 1：是		LOC_CONDITION1	呼叫列表默认检索条件	SMALLINT				呼叫列表默认检索条件：0：设备 1：检查组		LOC_CONDITION2	选择多条申请是否预约成多条检查	SMALLINT				选择多条申请是否预约成多条检查

0：否（一条检查）

1：是		LOC_CONDITION3	临床浏览的报告是否增加水印	SMALLINT				0：否 1：是		LOC_CONDITION4	是否启用后台采集	SMALLINT				0：否 1：是		LOC_CONDITION5	申请单扫描文件保存方式	SMALLINT				0：JPG 上传至文件服务器

1：Dicom 上传至 PACS 服务器		LOC_CONDITION6	阴性阳性默认选项	SMALLINT				0：不默认

1：阴性

2：阳性		LOC_CONDITION7	急诊病人是否不优先检查	SMALLINT				0：默认优先检查

1：不优先		LOC_NOTE1	数字签名时间点	VCHAR(32)				数字签名时间点：保存(S)、打印(P)、提交(C)、审核(V)、终审(F)，可多选，用”&”分隔，例如：

S&P&C&V&F		LOC_NOTE2	CA 类型	VCHAR(32)				如 BJCA		LOC_NOTE3	UKkey 类型	VCHAR(128)				如：2.16.840.1.113732.2		LOC_NOTE4	影像辅助系统配置（类型&影像系统地址&上传报告内容地址）	VCHAR(128)				影像辅助系统配置（类型&影像系统地址&上传报告内容地址）		LOC_NOTE5	备注 5	VCHAR(256)				扩展用		LOC_INFO	多少天前报告未审核要提醒	INTEGER						LOC_INFO1	图像存储服务器	INTEGER				科室对应的图像存储服务器		LOC_INFO2	临床超过多长时间未处理危急值信息提醒	INTEGER				默认 20 分钟		LOC_RPTMODETYPE	报告样式类型	SMALLINT				0：XML

1：HTML		LOC_IMGMAGNIFYTIMES	网页报告中图像放大倍数	FLOAT						LOC_CONDITION8	图像存储方式 	SMALLINT				0：JPG

1：Dicom		LOC_CONDITION9	取消到达是否直接变申请	SMALLINT						LOC_CONDITION10	临床超时未处理危急值信息是否提醒	SMALLINT						LOC_CONDITION11	呼叫列表中未呼叫病人是否显示病人检查信息	SMALLINT				包括性别、年龄、检查项目和费用		LOC_CONDITION12	急诊病人能否手工预约	SMALLINT				0 ：不能

1：能		LOC_NOTE6	备注 6	VCHAR(32)				扩展用		LOC_NOTE7	备注 7	VCHAR(32)				扩展用		LOC_NOTE8	检验项目标准码	VCHAR(64)				由项目人员根据检验配置维护，用逗号分隔		LOC_INFO3	用于其它信息	FLOAT				扩展用		LOC_INFO4	用于其它信息	FLOAT				扩展用		LOC_SITEMADDBODYPART	检查项目描述是否加上检查部位	SMALLINT				0：否 1：是		LOC_CONDITION13	预约时间段选择方式	SMALLINT				0：选择资源计划的时间段（默认）

1：选择具体时间段（影院选票模式）		LOC_CONDITION14	是否允许挂起其他用户编写的报告	SMALLINT				0 不允许，1 允许		LOC_CONDITION15	是否需要影像评级	SMALLINT				0 不要，1 要		LOC_CONDITION16	条件 16	SMALLINT				扩展用		LOC_CONDITION17	条件 17	SMALLINT				扩展用		LOC_INFO5	用于其它信息	INTEGER				扩展用		LOC_INFO6	用于其它信息	INTEGER				扩展用		LOC_INFO7	用于其它信息	INTEGER				扩展用																										SP_EMRURL ：调阅电子病历的 URL，参数依次用{0}、{1}等代替。例如：

HYPERLINK "http://10.10.6.37/dthealth/web/csp/epr. newfw. episodelistbrowser. csp? PatientID={0}" http://10.10.6.37/dthealth/web/csp/epr. newfw. episodelistbrowser. csp? PatientID={0}

若门诊、住院病人调阅电子病历的路径不一样，可设置为：

病人类型 1@电子病历 URL 1#病人类型 2@电子病历 URL2……；同时参数设置也相应为：病人类型 1@参数 1^参数 2^参数 3#病人类型 2@参数 1……

例如：

电子病历的 URL：

INP@http://10.10.50.11/dthealth/web/csp/epr. newfw. episodelistbrowser. csp? EpisodeID={0}&USERNAME={1}&PASSWORD={2}#OP@ HYPERLINK "http://192.168.2.12:9080/htemr2/emrrr? moduleid=57&reqType=showPatientInfo&mrid={0}" http://192.168.2.12:9080/htemr2/emrrr? moduleid=57&reqType=showPatientInfo&mrid={0}

参数：INP@HIS_EPSODID^USERNAME^PASSWORD#OP@PAT_GPATIENTID

LOC_IMGSERVERINFO: PACS 浏览器的设置，内容以“&”分割：

ftpIP& ftpUser & ftpPWD & ViewType & ServerIP & AETitle & Port

其中各参数说明如下：

ftpIP		存放 ICPACSView 程序的 FTP 服务器地址

ftpUser 	    存放 ICPACSView 程序的 FTP 服务器地址的用户名

ftpPWD    存放 ICPACSView 程序的 FTP 服务器地址的密码

ViewType	PACSView 的类型：R--Rogan 服务器；I--ICPACSServer；W--WCF 服务以文件传输的方式获取图像。D--Dicom C-MOVE；F-方正 PACSServer

更改为：I-ICPACSView；F-方正客户端；V-VPX

ServerIP 	PACS 服务器的 IP 。如果是远程会诊，该参数是提供 WCF 服务的 IP 地址。

AETitle 	PACS 服务器的 AETitle

Port 		PACS 服务器的 Port

其它设置在以后开发中完善

LOCMESSAGE 科室消息表

字段名称	含义	类型	不为空	外键	索引	说明		MSG_ID	消息 ID	INTEGER	是		Y	主键		LOC_ID	科室 ID	INTEGER		Y	Y			USER_ID	用户 ID	INTEGER		Y	Y	发布消息用户		MSG_DT	消息发布时间	DATETIME						MSG_ENDDT	消息发布结束日期	INTEGER						MSG_TITLE	消息标题	VCHAR(32)						MSG_DESC	消息内容	VCHAR(512)						显示模块：

消息编辑模块：

科室消息发布，在科室公告中滚动显示在有效期内的科室消息。

科室消息，需要有权限的管理员（如科室主任或者分配给其权限的人可编辑科室消息）

MATERIALBASE 耗材项

字段名称	含义	类型	不为空	外键	索引	说明		MTB_ID	耗材项 ID	INTEGER	是		Y	主键		MDLS_ID	设备大类 ID	CHAR(4)		Y	Y			LOC_ID	科室 ID	INTEGER		Y	Y			MTB_AB	耗材项简写	VCHAR（16）						MTB_DESC	耗材项名称	VCHAR（32）						MTB_UNIT	单位	CHAR（8）						MTB_ENABLE	是否可用	SMALLINT				Default 1

MATERIALSCHEME 耗材方案表

字段名称	含义	类型	不为空	外键	索引	说明		MTS_ID	耗材配置 ID	INTEGER	是			主键		MDLS_ID	设备大类 ID	CHAR(4)		Y	Y			LOC_ID	科室 ID	INTEGER		Y	Y			MTS_SCHEME	耗材方案	VCHAR(1024) /XML				XML		MTS_ENABLE	是否可用	SMALLINT				Default 1

MATERIALVALUE 耗材内容表 （需要月统计耗材）

字段名称	含义	类型	不为空	外键	索引	说明		MTV_ID	耗材 ID	INTEGER	是			主键		ST_ACCNUM	检查号	VCHAR(32)	是	是	Y			MTV_VALUE	耗材值	VCHAR(1024) /XML	是			XML 文本

MEASUREBASE  检查测值单元

字段名称	含义	类型	不为空	外键	说明		MB_ID	测值单元 ID	INTEGER	是				MDLS_ID	设备大类 ID	CHAR(4)	是				LOC_ID	科室 ID	INTEGER					BP_ID	部位 ID	INTEGER					MB_AB	测值单元简写	VCHAR（32）	是				MB_DESC	测值单元名称	VCHAR（64）	是				MB_UNIT	测值单元单位	CHAR（8）					MB_DCIMAL	单位小数点位数	INTEGER					MB_UNITPRINT

单位是否打印	SMALLINT			Default 1		MB_MMAX	成人男最大值	Float					MB_MMIN	成人男最小值	Float					MB_FMAX	成人女最大值	Float					MB_FMIN	成人女最小值	Float					MB_YMAX	儿童最大值	Float					MB_YMIN	儿童最小值	Float					MB_MAXDESC	超上线描述	VCHAR（64）					MB_MINDESC	超下线描述	VCHAR（64）					MB_SCHEME	模式	VCHAR（32）					MB_GCODE	应该国际标准代码	VCHAR（16）					MB_CODE	基础测值项代码	VCHAR（16）			DicomTag		MB_ENABLE	是否可用	SMALLINT			Default 1		在导入导出测值可按设备大类导

MEASUREBASEEXT 检查测值单元扩展表

字段名称	含义	类型	不为空	外键	索引	说明		MBE_ID	ID	INTEGER	是		Y	主键		MB_ID	测值单元 ID	INTEGER	是	Y	Y			MBE_DEFAULTOPTIONS	默认选项	VCHAR（256）				各选项之间以“;”分隔		MBE_NOTE1	备注 1	VCHAR(32)				扩展用		MBE_NOTE2	备注 2	VCHAR(128)				扩展用		MBE_INFO	扩展信息	INTEGER				扩展用		MBE_ISFOETUS	是否应用于胎儿	SMALLINT

MEASUREBASERANGE 检查测值单元范围表

字段名称	含义	类型	不为空	外键	索引	说明		MBR_ID	测值范围 ID	INTEGER	是		Y			MB_ID	测值单元 ID	INTEGER	是	Y	Y			MBR_STARTAGE	起始年龄	INTEGER						MBR_ENDAGE	结束年龄	INTEGER						MBR_AGEUNIT	年龄单位	VCHAR(8)				岁、月、孕周		MBR_SEX	性别	VCHAR(8)			Y	男、女		MBR_NMAX	正常最大值	Float						MBR_NMIN	正常最小值	Float						MBR_CMAX	危急最大值	Float						MBR_CMIN	危急最小值	Float						MBR_NOTE1	备注 1	VCHAR(32)				扩展用		MBR_NOTE2	备注 1	VCHAR(32)				扩展用		MBR_INFO1	扩展信息	INTEGER						MBR_INFO2	扩展信息	INTEGER						MBR_INFO3	扩展信息	Float						MBR_INFO4	扩展信息	Float

MEASUREREFERENCE 检查测值参考标准表

字段名称	含义	类型	不为空	外键	索引	说明		MUR_ID	ID	INTEGER	是		Y	主键		MUR_REFERCODE	参照的测值单元代码	VCHAR（16）	是		Y			MUR_AVERAGEVALUE	测值平均值	Float						MUR_MAXVALUE	最大值	Float						MUR_MINVALUE	最小值	Float						MUR_RESULTCODE	结果测值单元代码	VCHAR（16）			Y			MUR_RESULTVALUE	结果值	Float						MUR_RESULTUNIT	结果单位	CHAR（8）						MUR_NOTE1	备注 1	VCHAR(32)				扩展用		MUR_NOTE2	备注 2	VCHAR(128)				扩展用		MUR_INFO1	信息 1	INTEGER				扩展用		MUR_INFO2	信息 2	Float				扩展用

MEASURESCHEME 测值方案 （xml 结构 考虑是否还需要 MEASUREBASE ）

字段名称	含义	类型	不为空	外键	索引	说明		MDLS_ID	设备大类 ID	CHAR(4)		是	Y	不用		LOC_ID	科室 ID	INTEGER		是	Y	不用		BP_ID	部位 ID	INTEGER		是	Y	不用		SSC_ID	检查项目子类 ID	INTEGER		是	Y	不用		MUS_ID	测值方案 ID	INTEGER	是			主键		MUS_SCHEME	测值方案	VCHAR(1024) /XML				XML 文本		MUS_EXPRESSION	测值公式	VCHAR(1024)						MUS_ENABLE	是否可用	SMALLINT				Default 1

MUS_NAME

测值方案名称	VCHAR(20)				新增		MEASURESCHEME2LOC（新增）

字段名称	含义	类型	不为空	外键	索引	说明		MLC_ID	ROWID 	INTEGER				主键		LOC_ID	科室 ID	INTEGER		是	Y			BP_ID	部位 ID	INTEGER		是	Y			SSC_ID	检查项目子类 ID	INTEGER		是	Y			MDLS_ID	设备大类 ID	CHAR(4)		是	Y			MUS_ID	测值方案 ID	INTEGER	是

MEASURESCHEME2SITEM 测值方案与检查项目对应表

字段名称	含义	类型	不为空	外键	索引	说明		MUS_ID	测值方案 ID	INTEGER	是	是	Y			SI_ID	检查项目 ID	INTEGER	是	是	Y

MEASUREVALUE 测值表 （xml）业务表

字段名称	含义	类型	不为空	外键	说明	索引		MV_ID	测值 ID	INTEGER	是		主键	Y		ST_ACCNUM	检查号 ID	VCHAR(16)	是	是	对应到本次检查，或许是 AccessionNum	Y		MV_VALUE

测值	VCHAR(1024) /XML			XML 文本	流字段

MEASUREVALUEITEM 测值项目表 （xml）业务表

字段名称	含义	类型	不为空	外键	说明	索引		MVI_ID	ROWID	INTEGER	是		主键	Y		ST_ACCNUM	检查号 ID	VCHAR(32)	是	是	对应到本次检查，或许是 AccessionNum	Y		MVI_CODE	测值代码	VCHAR(16)				Y		MVI_NAME	测值名称	VCHAR(20)				Y		MVI_VALUE	测值	VCHAR(30) 			内容			MVI_FETUSID	胎儿 ID	VCHAR(8)			多胞胎的索引			此表用于统计检查测值的内容

MEDIC   实习生表 （一般为录入者，报告中的录入者记录姓名，不记 userid）

字段名称	含义	类型	不为空	外键	索引	说明		MEDIC_ID	实习生 ID	INTEGER	是		Y	主键		MEDIC_NAME	实习生姓名	VCHAR(32)						USER_CODE	实习生对应用户 Code	VCHAR(32)			Y	实习生登录科室代码		MEDIC_SEX	性别	CHAR(4)						MEDIC_AGE

年龄	INTEGER						MEDIC_CLASS	班级	VCHAR(32)				包括医院、学院		MEDIC_MOBILE	移动电话	VCHAR(32)						MEDIC _PHONE	工作电话	VCHAR(32)						MEDIC_MAILE	邮件	VCHAR(32)						MEDIC_STDATE	开始实习日期	DATE						MEDIC_ENDDATE	结束实习日期	DATE						MEDIC_ENABLE	是否可用	SMALLINT				Default 1		SP_HOSPCODE	医院 CODE	VCHAR(32)			医院 Code										实习生在 BS 系统中注册个人信息、提交后科室管理员审核通过后，将 User_Code 值赋给他，表示实习生开始工作可以登陆系统。

MEDIUMINFO 存储介质信息表

字段名称	含义	类型	不为空	外键	索引	说明		MI_ID	介质 ID	INTEGER	是		Y			MI_NAME	介质名称	VCHAR(16)	是					MI_PATH	介质路径所在的路径	VCHAR(32)						MI_ISFULL	介质是否已满	SMALLINT				Default 0		MI_ISONLINE	介质是否在线	SMALLINT				Default 1		MI_SIZE	介质初始大小	Float						MI_REMINESIZE	介质剩余大小	Float						MI_ENABLE

是否可用	SMALLINT				Default 1		MI_TYPE	介质类型	VCHAR(2)				磁盘归档、光盘归档，磁盘		MI_ServerID	存储服务器 ID			Y	Y

MODALITIES  设备类型表（CR, CT, MR, NM, US, RF, SC, VL）

字段名称	含义	类型	不为空	外键	索引	说明		MDLS_ID	设备类型 ID	CHAR(4)	是					MDLS_DESCEN	设备类型英文描述	VCHAR(32)						MDLS _DESCCH	设备类型中文描述	VCHAR(32)				核磁、超声、		LOC_ID 	所属科室 ID	INTERGE			Y	在参数设置，科室管理员只能维护本科室的设备大类（删除）		MODALITIES2LOC  科室与设备类型 的对应关系

字段名称	含义	类型	不为空	外键	索引	说明		LOC_ID	科室 ID	INTERGER	是					MDLS_ID	设备类型 ID	CHAR(4)	是

MODALITY  设备表

字段名称	含义	类型	不为空	外键	索引	说明		MDL_ID	设备 ID	INTEGER	是					MDL_CODE	设备编号	VCHAR(32)						MDLS_ID	设备类型 ID	CHAR(4)	是	是	Y			LOC_ID	所属科室 ID	INTEGER	是	是	Y			ROOM_ID	所属诊间 ID	INTEGER		是	Y			MDL_DESC	设备名称	VCHAR(32)						MDL_ENDESC	英文描述	VCHAR(64)						MDL_AE

设备 Dicom AE	VCHAR(32)						MDL_IP	设备 IP 地址	VCHAR(32)						MDL_PORT	设备 监听端口	INTEGER						MDL_STDATE	设备开始使用日期	DATE						MDL_MANUFACTURER	设备厂商	VCHAR(32)						MDL_MFPHONE	设备厂商电话	VCHAR(32)						SG_ID	检查组 ID	INTEGER		Y	Y	设备所属于哪个资源组		CAMERA_ID	设备摄像机 ID	VCHAR(32)				此 ID 由 H3C 产生设备作为一个摄像头邦定到编码器

，需要和 H3C 的系统绑定		MDL_ENABLE	设备是否可用	SMALLINT				Default 1		MDL_VPXTYPE	设备调用 VPX 的方式	VCHAR(32)				Accession Number：检查号

STUDY_ID：检查编号		SUPPORTWORKLIST	是否调用 worklist	SMALLINT				0：不支持

1：支持		SUPPORTCHINAESE	是否支持中文	SMALLINT				0：不支持

1：支持		SUPPROTSEXAGE	是否支持姓名中带有性别和年龄	SMALLINT				0：不支持

1：支持		MODALITY2GROUP 设备和检查组的对应关系

字段名称	含义	类型	不为空	外键	索引	说明		MDL_ID	设备 ID	INTEGER	是	是	是			SG_ID	检查组 ID	INTEGER	是	是	是			MG_PRIORITY	检查组优先级	INTEGER			是	数字越大，优先级越高

MODEANDSSC  样式和检查子类关联表

字段名称	含义	类型	不为空	外键	索引	说明		MODESSC_ID	关联 ID	INTEGER	是			主键		MODE_ID	报告样式 ID	INTEGER	是	是	Y			SSC_ID	检查子类 ID	INTEGER	是	是	Y			SP_HOSPCODE	医院 CODE	VCHAR(32)						MODULE2FUNCTIONKEY  组件包含的功能点

字段名称	含义	类型	不为空	外键	索引	说明		PM_ID	组件 ID	INTEGER	是	Y	Y	联合主键		FC_ID	功能点 ID	INTEGER	是	Y	Y											NATION 民族

字段名称	含义	类型	ࠀࠊࠌࠐࠒࠞࡀࡄࡆࡔࡖࡘ࡚࡞ࡠ࡮ࡲࢴࢾࣀࣲࣦࣔࣚࣤ࣬ࣴईऐऒऔचजढदनरऴ़ी�𣏕색﫶華馧軺螴軺螴苺軺箴뒎둮軺躴 dᘒ譨扝䌀ᡊ伀ъ倀ъᘙ譨扝䌀ᡊ伀ъ倀ъ儀͊漀Ĩᘍ譨扝䬀Ɉ漀(ᘉ譨扝漀Ĩᘍ譨扝䌀ᡊ漀Ĩᘕ譨扝䌀ᡊ伀ъ倀ъ漀Ĩᘚ譨扝䌀⑊伀ъ倀ъ儀͊愀⁊ᘙ譨扝䌀⑊伀ъ倀ъ愀⁊漀Ĩᘖ譨扝䌀ᡊ伀ъ倀ъ儀͊ᘑ譨扝䬀Ɉ儀 J 漀（ᘎ譨扝䬀Ɉ儀 Jᘚ譨扝䌀䡊伀ъ倀ъ儀͊愀䡊ᘙ譨扝䌀䡊伀ъ倀ъ愀䡊漀Ĩᘒ譨扝䌀ᡊ伀͊儀͊ᘆ譨扝ᘊ譨扝䌀ᡊ✀ࠀࠂࠄࠆࠈࠊࠌࠎࠐࠒࠔù豈ù豈ù豈ñ똀ù豈；欀 dᘀĤ晉⑋䰁Ĥ鐇Ļ혈蠀耄蠆＄￿￿￿￿￿￿￿ᓿǶᨀӖ￿￿혛＄￿᳿Ӗ￿￿혝＄￿㏿ۖĀ̏혴༁愀϶܀␖䤁ɦ䬀ĤᘀĤ晉਀ࠔࠖ࠘ࠚU 伀 OᘀĤ晉ª欀橤ᘀĤ␗䤁Ŧ̀Ĵ鐇Ļ혈	搀ఉ됎尒Зꄠ搆）￿￿￿ÿЀ耀꠆＄￿ӿ＀￿￿￿胿꠆＄￿￿￿￿￿￿￿胿꠆＄￿￿￿￿￿￿￿胿꠆＄￿￿￿￿￿￿￿ÿ�＄￿￿￿￿￿￿￿胿쀆＄￿￿￿￿￿￿￿ᓿǶᨀ᳖￿￿￿￿￿￿￿￿￿￿￿￿￿￿혛＜￿ÿ￿￿￿￿￿￿￿￿￿￿᳿᳖＀￿￿￿￿￿￿￿￿￿￿￿￿혝￿￿￿￿￿￿￿￿￿￿￿￿㓿ۖĀ̏昀Ĵ̀ࠚࠜࠞࡂࡄࡆࡖ´글¥娀®䤀ကMꐓꐔ␖㄁$䐹晉⑛尀$K 欀剤ᘀĤ␗䤁Ŧ̀Ĵ鐇΢혈0 搀ꄉꀥ搆	＀￿ÿЀ耀㴆＜￿ӿ＀￿￿￿ᓿǶᨀࣖ＀￿￿혛（￿ÿ᳿ࣖ＀￿￿혝￿￿㓿ۖĀ̏昀Ĵ	̀Ĥ␖䤁Ŧ愀ĤᘀĤ晉 K 欀魤ᘀĤ␗䤁Ŧ̀Ĵ鐇৘혈0 搀ꄉꀥ搆	＀￿￿￿ӿ耀㴆＜￿ӿ＀￿￿￿ᓿǶᨀࣖ＀￿￿혛（￿ÿ᳿ࣖ￿￿￿￿혝￿￿㓿ۖĀ̏昀Ĵ؀ࡖࡘ࡚࡜࡞ࡠࡰ´글¥娀®ꔀK 欀ꑤᘀĤ␗䤁Ŧ̀Ĵ鐇α혈0 搀ꄉꀥ搆	＀￿￿￿ӿ耀㴆＜￿ӿ＀￿￿￿ᓿǶᨀࣖ＀￿￿혛（￿ÿ᳿ࣖ￿￿￿￿혝￿￿㓿ۖĀ̏昀Ĵ	̀Ĥ␖䤁Ŧ愀ĤᘀĤ晉 K 欀ﭤᘀĤ␗䤁Ŧ̀Ĵ鐇΢혈0 搀ꄉꀥ搆	＀￿ÿЀ耀㴆＜￿ӿ＀￿￿￿ᓿǶᨀࣖ＀￿￿혛（￿ÿ᳿ࣖ＀￿￿혝￿￿㓿ۖĀ̏昀Ĵ؀ࡰࡲࡴࡶࡸࡺࡼ´글®挀®글K 欀ѤᘀĤ␗䤁Ŧ̀Ĵ鐇Ļ혈0 搀ꄉꀥ搆	＀￿ÿЀ㴆＜￿ӿ＀￿ᓿǶᨀࣖ＀￿￿혛（￿ÿ᳿ࣖ＀＀혝￿￿㓿ۖĀ̏昀ĴᘀĤ晉 K 欀孤ᘀĤ␗䤁Ŧ̀Ĵ鐇ƕ혈0 搀ꄉꀥ搆	＀￿ÿЀ耀㴆＜￿ӿ＀￿￿￿ᓿǶᨀࣖ＀￿￿혛（￿ÿ᳿ࣖ＀￿￿혝￿￿㓿ۖĀ̏昀Ĵ؀ࡼࡾࢀࢂࢄࢆ࢈´글®挀®글K 欀恤ᘀĤ␗䤁Ŧ̀Ĵ鐇Ļ혈0 搀ꄉꀥ搆	＀￿ÿЀꀀ㴆Ѐ＀￿ᓿǶᨀࣖ＀＀혛（￿ÿ᳿ࣖ＀＀혝￿￿㓿ۖĀ̏昀ĴᘀĤ晉 K 欀뉤ᘀĤ␗䤁Ŧ̀Ĵ鐇Ļ혈0 搀ꄉꀥ搆	＀￿ÿЀꀀ㴆Ѐ＀￿ᓿǶᨀࣖ＀＀혛（￿ÿ᳿ࣖ＀＀혝￿￿㓿ۖĀ̏昀Ĵ؀࢈ࢊࢌࢎ࢐࢒࢔´글®挀®글K 欀뱤	ᘀĤ␗䤁Ŧ̀Ĵ鐇Ļ혈0 搀ꄉꀥ搆	＀￿ÿЀꀀ㴆Ѐ＀￿ᓿǶᨀࣖ＀＀혛（￿ÿ᳿ࣖ＀＀혝￿￿㓿ۖĀ̏昀ĴᘀĤ晉 K 欀๤	ᘀĤ␗䤁Ŧ̀Ĵ鐇Ļ혈0 搀ꄉꀥ搆	＀￿ÿЀꀀ㴆Ѐ＀￿ᓿǶᨀࣖ＀＀혛（￿ÿ᳿ࣖ＀＀혝￿￿㓿ۖĀ̏昀Ĵ؀࢔࢖࢚࢘࢜࢞ࢠ´글®挀®글K 欀ᡤ	ᘀĤ␗䤁Ŧ̀Ĵ鐇Ļ혈0 搀ꄉꀥ搆	＀￿ÿЀꀀ㴆Ѐ＀￿ᓿǶᨀࣖ＀＀혛（￿ÿ᳿ࣖ＀＀혝￿￿㓿ۖĀ̏昀ĴᘀĤ晉 K 欀橤ᘀĤ␗䤁Ŧ̀Ĵ鐇Ļ혈0 搀ꄉꀥ搆	＀￿ÿЀꀀ㴆Ѐ＀￿ᓿǶᨀࣖ＀＀혛（￿ÿ᳿ࣖ＀＀혝￿￿㓿ۖĀ̏昀Ĵ؀ࢠࢢࢤࢦࢨࢪࢬ´글®挀®글K 欀瑤

ᘀĤ␗䤁Ŧ̀Ĵ鐇Ļ혈0 搀ꄉꀥ搆	＀￿ÿЀꀀ㴆Ѐ＀￿ᓿǶᨀࣖ＀＀혛（￿ÿ᳿ࣖ＀＀혝￿￿㓿ۖĀ̏昀ĴᘀĤ晉 K 欀왤	ᘀĤ␗䤁Ŧ̀Ĵ鐇Ļ혈0 搀ꄉꀥ搆	＀￿ÿЀꀀ㴆Ѐ＀￿ᓿǶᨀࣖ＀＀혛（￿ÿ᳿ࣖ＀＀혝￿￿㓿ۖĀ̏昀Ĵ؀ࢬࢮࢰࢲࢴࣀࣖࣘ´글®挀®글®K 欀큤

ᘀĤ␗䤁Ŧ̀Ĵ鐇Ļ혈0 搀ꄉꀥ搆	＀￿￿￿ӿꀀ㴆Ѐ＀￿ᓿǶᨀࣖ＀＀혛（￿ÿ᳿ࣖ￿￿＀혝￿￿㓿ۖĀ̏昀ĴᘀĤ晉 K 欀≤

ᘀĤ␗䤁Ŧ̀Ĵ鐇Ļ혈0 搀ꄉꀥ搆	＀￿ÿЀꀀ㴆Ѐ＀￿ᓿǶᨀࣖ＀＀혛（￿ÿ᳿ࣖ＀＀혝￿￿㓿ۖĀ̏昀Ĵ܀ࣰࣲࣦ࣮ࣶࣘࣚ¡鬀鬀=鬀^欀䭤

ᘀĤ␗䤁Ŧ̀Ĵ鐇Ļ혈F뀀搄ꄉ耥뀆＄￿￿￿￿￿￿￿胿됆＄￿￿￿￿￿ӿꀀ㴆Ѐ＀￿ᓿǶᨀೖ￿￿￿￿＀혛，￿￿￿ÿ᳿ೖ￿￿￿￿＀혝，￿ÿ￿￿㓿ۖĀ̏昀ĴᘀĤ晉^欀繤

ᘀĤ␗䤁Ŧ̀Ĵ鐇Ļ혈F뀀搄ꄉ耥뀆＄￿￿￿￿￿￿￿胿됆＄￿￿￿￿￿ӿꀀ㴆Ѐ＀￿ᓿǶᨀೖ￿￿￿￿＀혛，￿￿￿ÿ᳿ೖ￿￿￿￿＀혝，￿ÿ￿￿㓿ۖĀ̏昀Ĵ؀ࣶࣺࣸࣼࣾऀंऄù글ù豈 c 豈ùK 欀왤ᘀĤ␗䤁Ŧ̀Ĵ鐇Ļ혈0 搀ꄉꀥ搆	＀￿ÿЀꀀ㴆Ѐ＀￿ᓿǶᨀࣖ＀＀혛（￿ÿ᳿ࣖ＀＀혝￿￿㓿ۖĀ̏昀ĴK 欀ᡤᘀĤ␗䤁Ŧ̀Ĵ鐇Ļ혈0 搀ꄉ搆）￿￿￿ÿЀꀀ㴆Ѐ＀￿ᓿǶᨀࣖ￿￿＀혛（￿ÿ᳿ࣖ＀＀혝￿￿㓿ۖĀ̏昀ĴᘀĤ晉܀ऄआईऒऔजत´글¥谀¥ꔀ┙ጀ¤᐀¤ᘀĤ搥␱㤀ф䤀Ŧ伀ࣆ＀⑛尀$	̀Ĥ␖䤁Ŧ愀ĤᘀĤ晉K欀瑤ᘀĤ␗䤁Ŧ̀Ĵ鐇Ļ혈0搀ꄉꀥ搆	＀￿ÿЀꀀ㴆Ѐ＀￿￿￿ᓿǶᨀࣖ＀＀혛（￿ÿ᳿ࣖ＀￿￿혝￿￿㓿ۖĀ̏昀Ĵ؀तदनलऴॆ{甀l氀l	̀Ĥ␖䤁Ŧ愀ĤᘀĤ晉欀≤ᘀĤ␗䤁Ŧ̀Ĵ鐇Ļ혈r搀ఉЎꄠꀥ搆	＀￿ÿЀ耀꠆ЄЀЀЀ耀Ѝ＀￿ӿЀā耀�Є＀￿ӿЀ耀쀆Є＀￿ӿЀ᐀Ƕᨀᓖ＀＀＀＀＀혛４￿ÿ￿￿￿￿￿￿᳿ᓖ＀＀＀＀＀혝ÿÿÿ㓿ۖĀ̏昀ĴԀीूॄैॊॐ॒ॖक़ड़फ़ॢ।२४॰ॴॶॼॾং঄আ঎ঐঠবস঺়ূৄৌ৐৔৚ড়২৪৮ৰ৾਀ਆਈ਎ਐਘਜ񇫴񄛴񄛴퇞񇫴�색�꾼�躘蚘躘躘躘躘躘ᘎ譨扝䌀ᡊ伀͊ᘒ譨扝䌀ᡊ伀͊儀͊ᘑ譨扝䌀ᡊ伀͊漀Ĩᘚ譨扝䌀⑊伀ъ倀ъ儀͊愀⑊ᘙ譨扝䌀⑊伀ъ倀ъ愀⑊漀Ĩᘆ譨扝ᘑ譨扝䬀Ɉ儀J漀(ᘎ譨扝䬀Ɉ儀Jᘍ譨扝䌀ᡊ漀Ĩᘊ譨扝䌀ᡊᘖ譨扝䌀ᡊ伀ъ倀ъ儀͊ᘒ譨扝䌀ᡊ伀ъ倀ъᘕ譨扝䌀ᡊ伀ъ倀ъ漀Ĩ　ॆैॊ॒क़फ़।४६蠀缀缀缀	̀Ĥ␖䤁Ŧ愀ĤᘀĤ晉q欀䕤ᘀĤ␗䤁Ŧ̀Ĵ鐇Ļ혈\搀ఉЎꄜꀥ搆	＀￿ÿЀ耀꠆＄￿ӿЀЀ耀Ѝ＀￿ӿЀā耀鴆Љ＀￿ӿЀā᐀Ƕᨀზ＀￿￿＀＀혛０￿ÿ￿￿￿￿᳿ზ＀＀＀＀혝ÿÿ㐀ۖĀ̏昀Ĵࠀ६८॰ॶॾ঄আঐঢU伀F䘀F䘀F䘀	̀Ĥ␖䤁Ŧ愀ĤᘀĤ晉ª欀䑤ᘀĤ␗䤁Ŧ̀Ĵ鐇Ļ혈	搀ఉ됎尒Зꄠꀥ搆	＀￿ÿЀ耀꠆＄￿ӿЀЀ耀꠆＄￿￿￿ӿЀ耀꠆＄￿￿￿ӿЀ耀꠆＄￿￿￿ӿЀ耀�＄￿￿￿ӿЀ耀쀆＄￿￿￿ӿЀ᐀Ƕᨀ᳖＀￿￿￿￿￿￿￿￿￿￿￿￿혛＜￿ÿ￿￿￿￿￿￿￿￿￿￿᳿᳖＀＀＀＀＀＀＀혝ÿÿÿÿÿÿ㓿ۖĀ̏昀ĴࠀঢতদনU伀OᘀĤ晉ª欀䵤ᘀĤ␗䤁Ŧ̀Ĵ鐇Ļ혈	搀ఉ됎尒Зꄠꀥ搆	＀￿ÿЀ耀꠆＄￿ӿЀЀ耀꠆＄￿￿￿ӿЀ耀꠆＄￿￿￿ӿЀ耀꠆＄￿￿￿ӿЀ耀�＄￿￿￿ӿЀ耀쀆＄￿￿￿ӿЀ᐀Ƕᨀ᳖＀￿￿￿￿￿￿￿￿￿￿￿￿혛＜￿ÿ￿￿￿￿￿￿￿￿￿￿᳿᳖＀＀＀＀＀＀＀혝ÿÿÿÿÿÿ㓿ۖĀ̏昀Ĵ̀নপব঺়াী´글䨀®글K欀､ᘀĤ␗䤁Ŧ̀Ĵ鐇Ļ혈0搀ꄉꀥ搆	＀￿ÿЀ耀㴆＜￿ӿ＀￿￿￿ᓿǶᨀࣖ＀￿￿혛（￿ÿ᳿ࣖ＀￿￿혝￿￿㓿ۖĀ̏昀Ĵ┙ጀ¤᐀¤ᘀĤ搥␱㤀ф䤀Ŧ伀ࣆ＀⑛尀$ᘀĤ晉 K 欀噤ᘀĤ␗䤁Ŧ̀Ĵ鐇Ļ혈0 搀ꄉꀥ搆	＀￿ÿЀ耀㴆＜￿ӿ＀￿￿￿ᓿǶᨀࣖ＀￿￿혛（￿ÿ᳿ࣖ＀￿￿혝￿￿㓿ۖĀ̏昀Ĵ؀ীূৄৎ৐৒´눀©开©J 欀彤ᘀĤ␗䤁Ŧ܀슔ࠁ᫖Ā▧ڀ▧￿￿￿￿￿￿￿￿혉ሁ૖＀￿ÿ퐃᜵϶ⴃᨐӖ￿￿혛＄￿᳿Ӗ￿￿혝＄￿㓿ۖĀ̏瀀૖＀￿ÿ瑹爤©	̀Ĥ␖䤁Ŧ愀ĤĀK 欀ꡤᘀĤ␗䤁Ŧ̀Ĵ鐇Ļ혈0 搀ꄉꀥ搆	＀￿￿￿ӿ耀㴆＜￿ӿ＀￿￿￿ᓿǶᨀࣖ＀￿￿혛（￿ÿ᳿ࣖ￿￿￿￿혝￿￿㓿ۖĀ̏昀ĴԀ৒৔ড়৪ৰ਀ਈਐਚ²꤀©꤀©꤀©꤀	̀Ĥ␖䤁Ŧ愀ĤM 欀ᘀĤ␗䤁Ŧ̀Ĵ鐇Ŋ혈꜀耥꜆Ｅ￿￿￿೿＀￿৿˖Ā혒

￿￿᐀϶㗔᠀϶ိ혚＄￿᯿Ӗ￿￿혜᷿Ӗ￿￿혴༁愀϶㑦瀁૖＀￿ÿ瑹爤©ࠀਚਜਤᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀荤ᘀĤ␗䤁Ŧ܀䦔ࠂ裖؀ύߞᲶẨ⃃▧ڀύČČČĄڀБČ￿￿ČĄڀᓘČ￿￿ČĄڀǲČ￿￿ČĄڀțČ￿￿ČĄڀӤČ￿￿ČČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ＀＀＀＀＀＀혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁਜਢਤਦਨਾੀ੆ਗ਼ਫ਼੢੨੪੬੮઒ઔચમલશ઼ાીૂ૪૬૲ଂ଄ଆଊ଎ଔଖଘଚନପର଴ୈୌ୒୔ୖ୘୚ଡ଼ୢ୦୺୾஄ஆஈஊ஌ஐஸ�����뗋ᔲᙨ朚ᘀ譨扝㔀脈䩃䩏䩑䩡䡭Љ䡮ࠄ⡯猁ै琄шᔪᙨ朚ᘀ譨扝 ᙊ㔀脈䩡䡭Љ䡮ࠄ⡯猁ै琄шᔣᙨ朚ᘀ譨扝 ᙊ洀ै渄ш漈Ĩ䡳Љ䡴ࠄᘊ譨扝 ᙊᘍ譨扝 ᙊ漀Ĩᘒ譨扝䌀ᡊ伀͊儀͊ᘕ譨扝䌀ᡊ伀͊儀͊漀Ĩ㬀ਤਨੀੈ੊੠öööᘀĤ晉	̀Ĥ␖䤁Ŧ愀ĤԀ੠੢੪ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀ⵤᘀĤ␗䤁Ŧ܀㮔ࠁ裖؀ύߞᲶẨ⃃▧ڀύČČĄĄڀБČ￿￿ĄĄڀᓘČ￿￿ĄĄڀǲČ￿￿ĄĄڀțČ￿￿ĄĄڀӤČ￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ＀＀＀＀＀＀혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ੪੮ઔજઞ઴öööᘀĤ晉	̀Ĥ␖䤁Ŧ愀ĤԀ઴શાᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀흤ᘀĤ␗䤁Ŧ܀ᶔࠁ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄڀᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁાૂ૬૴૶ଌöööᘀĤ晉	̀Ĥ␖䤁Ŧ愀ĤԀଌ଎ଖᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀腤ᘀĤ␗䤁Ŧ܀ᶔࠁ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄڀᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁଖଚପଲ଴୊öööᘀĤ晉	̀Ĥ␖䤁Ŧ愀ĤԀ୊ୌ୔ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀⭤ᘀĤ␗䤁Ŧ܀ᶔࠁ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄڀᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ୔୘ଡ଼୤୦୼öööᘀĤ晉	̀Ĥ␖䤁Ŧ愀ĤԀ୼୾ஆᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀핤ᘀĤ␗䤁Ŧ܀ᶔࠁ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄڀᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁஆஊ஺஼௄ெ௜öêöᘀĤ晉ІᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥ؀ஸ஺஼ூெ௚௞௤௦௨௪ఊఌఐఔనబలఴశస౔ౖౚ౞౲౶౼౾ಀಂೆೈೌ೐೤೨೮೰೶೸പബ൞ൢ൨൬඀඄ඊඌඔඖථධපම෌ැූෘෞ෠෸෺෾ขถบภยศส๎๐๔๘๬๰쳖쳖쳖쳖쳖쳖쳖쳖쳖쳖쳖쳖쳖쳖쳖쳖쳖쳖쳖쳖쳖쳖쳖쳖쳖쳖쳖쳖쳖쳖ᘍ譨扝 ᙊ漀Ĩᘒ譨扝䌀ᡊ伀͊儀͊ᘕ譨扝䌀ᡊ伀͊儀͊漀Ĩᘊ譨扝 ᙊᔯᙨ朚ᘀ譨扝㔀脈䩃䩏䩑䩡䡭Љ䡮ࠄ䡳Љ䡴ࠄ一௜௞௦ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀罤！ᘀĤ␗䤁Ŧ܀ᶔࠁ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄڀᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ௦௪ఌఒఔపöööᘀĤ晉	̀Ĥ␖䤁Ŧ愀ĤԀపబఴᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀⥤#ᘀĤ␗䤁Ŧ܀ᶔࠁ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄڀᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁఴసౖ౜౞౴öööᘀĤ晉	̀Ĥ␖䤁Ŧ愀ĤԀ౴౶౾ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀퍤$ᘀĤ␗䤁Ŧ܀ᶔࠁ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄڀᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ౾ಂೈ೎೐೦öööᘀĤ晉	̀Ĥ␖䤁Ŧ愀ĤԀ೦೨೰ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀絤&ᘀĤ␗䤁Ŧ܀ᶔࠁ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄڀᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ೰೸ബൠൢ൪൬ංöðööᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥ܀ං඄ඌᤀᘀĤ晉à欀❤(ᘀĤ␗䤁Ŧ܀ᶔࠁ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄڀᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁඌඖධබම෎öööᘀĤ晉	̀Ĥ␖䤁Ŧ愀ĤԀ෎ැෘᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀텤)ᘀĤ␗䤁Ŧ܀ᶔࠁ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄڀᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁෘ෠෺฀ขธöööᘀĤ晉	̀Ĥ␖䤁Ŧ愀ĤԀธบยᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀筤+ᘀĤ␗䤁Ŧ܀ᶔࠁ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄڀᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁยส๐๖๘๮öööᘀĤ晉	̀Ĥ␖䤁Ŧ愀ĤԀ๮๰๸ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀╤-ᘀĤ␗䤁Ŧ܀ᶔࠁ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄڀᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ๰๶๸๾຀຤຦ສາ຺ຸເໂ໨໪໮໺໼༈༜ႄႎ႖႞ႠႦႨჶჸჼᄀᄔᄘᄞᄠᄦᄨᄬᅄᅮᆀᆒᆞᆢᆦᆺᆾᇄᇆᇌᇎᇒᇦᇪሌሎሰሴሶሺሾቒቖቜ቞ቤቦቲኈኘኬዄዠዢዦዪዼጀጆገጎጐጚጼ��������������Øᘉ譨扝漀Ĩᘊ譨扝 ᙊᘍ譨扝 ᙊ漀Ĩᘒ譨扝䌀ᡊ伀͊儀͊ᘕ譨扝䌀ᡊ伀͊儀͊漀Ĩ匀๸຀຦ຬຮະöööᘀĤ晉	̀Ĥ␖䤁Ŧ愀ĤԀະາ຺ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀콤.ᘀĤ␗䤁Ŧ܀ᶔࠁ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄڀᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ຺ໂ໪໰໲໴öööᘀĤ晉	̀Ĥ␖䤁Ŧ愀ĤԀ໴໶໸ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀祤 0ᘀĤ␗䤁Ŧ܀Ⲕࠁ裖؀ύߞᲶẨ⃃▧ڀύ￿￿Č￿￿ĄڀБ￿￿￿￿￿￿Ąڀᓘ￿￿￿￿￿￿Ąڀǲ￿￿￿￿￿￿Ąڀț￿￿￿￿￿￿ĄڀӤ￿￿￿￿￿￿Č혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ￿￿￿￿￿￿￿￿￿￿￿￿혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ໸໺໼໾ༀ༂öööᘀĤ晉	̀Ĥ␖䤁Ŧ愀ĤԀ༂༄༆ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀⍤2ᘀĤ␗䤁Ŧ܀ᶔࠁ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄڀᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ༆༈༞བྊ࿊တ၌ႄ႐႒႔öðððööᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥ଀႔႖Ⴀᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀쵤3ᘀĤ␗䤁Ŧ܀ᶔࠁ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄڀᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©ȀႠႨჸჾᄀᄖöööᘀĤ晉	̀Ĥ␖䤁Ŧ愀ĤԀᄖᄘᄠᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀睤 5ᘀĤ␗䤁Ŧ܀ᶔࠁ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄڀᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©ȀᄠᄨᆞᆤᆦᆼöööᘀĤ晉	̀Ĥ␖䤁Ŧ愀ĤԀᆼᆾᇆᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀Ⅴ7ᘀĤ␗䤁Ŧ܀ᶔࠁ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄڀᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©ȀᇆᇎሶሼሾቔöööᘀĤ晉	̀Ĥ␖䤁Ŧ愀ĤԀቔቖ቞ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀쭤8ᘀĤ␗䤁Ŧ܀ᶔࠁ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄڀᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ቞ቦዢየዪዾöööᘀĤ晉	̀Ĥ␖䤁Ŧ愀ĤԀዾጀገᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀畤：ᘀĤ␗䤁Ŧ܀ᶔࠁ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄڀᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁገጐፐፖፘ፬öööᘀĤ晉	̀Ĥ␖䤁Ŧ愀ĤԀጼጾፎፐፔፘ፪፲፴፼ᎄᎆᎎ᎐ᎮᏊᏌᏐᏘᏠᏢᏪᏬᐘᐚᐞᐾᑀᑈᑐᑒᑚᑜᑲᑴᒘᒚᒜᒴᒶᒸᓞᓠᓢᓺᓼᓾᔢᔤᔦᔾᕀᕂᕦᕨᕪᖂᖄᖆᖨᗨᗪᗰᗴ���틤컴컴뿴컴컴뿴컴컴뿴컴컴뿴컴뛴뾮äᘎ譨扝䌀ቊ愀ቊᘑ譨扝䌀ቊ愀ቊ漀Ĩᘝ譨扝䌀ቊ伀Ɋ儀Ɋ帀Ɋ愀ቊ漀Ĩᘆ譨扝ᘍ譨扝 ᙊ漀Ĩᘕ譨扝䌀ᡊ伀͊儀͊漀Ĩᘒ譨扝䌀ᡊ伀͊儀͊ᘊ譨扝 ᙊᘉ譨扝漀Ĩऌժᛰ譨扝㼀፬፮፰ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀ὤ<ᘀĤ␗䤁Ŧ܀Ⲕࠁ裖؀ύߞᲶẨ⃃▧ڀύ￿￿Č￿￿ĄڀБ￿￿￿￿￿￿Ąڀᓘ￿￿￿￿￿￿Ąڀǲ￿￿￿￿￿￿Ąڀț￿￿￿￿￿￿ĄڀӤ￿￿￿￿￿￿Č혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ￿￿￿￿￿￿￿￿￿￿￿￿혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ፰፲፴፶፸፺öööᘀĤ晉	̀Ĥ␖䤁Ŧ愀ĤԀ፺፼ᎆᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀쥤=ᘀĤ␗䤁Ŧ܀ᶔࠁ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄڀᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁᎆ᎐ᏌᏒᏔᏖöööᘀĤ晉	̀Ĥ␖䤁Ŧ愀ĤԀᏖᏘᏢᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀獤？ᘀĤ␗䤁Ŧ܀ᶔࠁ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄڀᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©ȀᏢᏬᐚᐠᐢᐸöööᘀĤ晉	̀Ĥ␖䤁Ŧ愀ĤԀᐸᐺᐼᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀ᵤAᘀĤ␗䤁Ŧ܀Ⲕࠁ裖؀ύߞᲶẨ⃃▧ڀύ￿￿Č￿￿ĄڀБ￿￿￿￿￿￿Ąڀᓘ￿￿￿￿￿￿Ąڀǲ￿￿￿￿￿￿Ąڀț￿￿￿￿￿￿ĄڀӤ￿￿￿￿￿￿Č혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ￿￿￿￿￿￿￿￿￿￿￿￿혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©ȀᐼᐾᑀᑂᑄᑆöööᘀĤ晉	̀Ĥ␖䤁Ŧ愀ĤԀᑆᑈᑒᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀읤BᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄڀᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©ȀᑒᑜᑴᒚᒸᓠᓾᔤᕂᕨᖆᗪᗲᗴᘆöðððððöᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥ฀ᗴᘄᘈᘐᘒᘚᘜᘢᙆᙎᙪᙰᙲᙶᙺᚌᚐᚘᚚᚢᚤᛔᛖᛸᜌᜠᜢᜦᜪ᜺᜾ᝆᝈᝐᝒងឆឬឮ៖៘᠂᠄ᠴᠶᡒᡔᡴᡶᢞᢠᣀᣂᣆᣊᣜᣠᣨᣪᣲᣴᤒᤔ᥌᥎ᥒᥬᥴ᥶싎뻎뺹뺹뺹뺹뺹뺹뺹뺹뺹뺹뺹뺹슬슬ᘙ譨扝伀Ɋ儀Ɋ帀Ɋ愀ᕊ漀Ĩᘉ譨扝漀Ĩᘆ譨扝ᘖ譨扝伀Ɋ儀Ɋ帀Ɋ愀ᕊᘝ譨扝䌀ቊ伀Ɋ儀Ɋ帀Ɋ愀ቊ漀Ĩᘕ譨扝䌀ᡊ伀͊儀͊漀Ĩᘒ譨扝䌀ᡊ伀͊儀͊ᘚ譨扝䌀ቊ伀Ɋ儀Ɋ帀Ɋ愀ቊ䐀ᘆᘈᘒᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀煤 DᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©ȀᘒᘜᙲᙸᙺᚎöööᘀĤ晉	̀Ĥ␖䤁Ŧ愀ĤԀᚎᚐᚚᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀ⅤFᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁᚚᚤᛖ᛺ᜢᜨᜪ᜼öðööᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥ܀᜼᜾ᝈᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀텤GᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁᝈᝒឆឮ៘᠄ᠶᡔᡶᢠᣂᣈᣊᣞöððððööᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥഀᣞᣠᣪᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀腤 IᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁᣪᣴᤔ᥎ᥔᥖᥪöðöᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥ؀ᥪᥬ᥶ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀ㅤKᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ᥶᥾ᦀ᦮ᦰᦼ᧎᧶᧸ᨮᨰᩀ᩸᩺᩾᪖᪞᪠᪨᪪᫊᫈ᬈᬊᬎᬨᬰᬲᬾᭀ᭚᭰᭲᮶᮸ᮺᯈᯔᯪᰎᰒᰖᰚᰮᰲ᰺᰼᱄᱆ᱚ쓓뎻뮳곪겦쓪钜폥폥ᘙ譨扝伀Ɋ儀Ɋ帀Ɋ愀ᕊ漀Ĩᘏ譨扝䈀Ī桰ᘒ譨扝䈀Ī⡯瀁 hᘊ譨扝愀ᕊᘍ譨扝愀ᕊ漀Ĩᘎ譨扝䌀ቊ愀ቊᘑ譨扝䌀ቊ愀ቊ漀Ĩᘝ譨扝䌀ቊ伀Ɋ儀Ɋ帀Ɋ愀ቊ漀Ĩᘚ譨扝䌀ቊ伀Ɋ儀Ɋ帀Ɋ愀ቊᘆ譨扝ᘉ譨扝漀Ĩᘒ譨扝䌀ᡊ伀͊儀͊ᘕ譨扝䌀ᡊ伀͊儀͊漀Ĩ㄀᥶ᦀᦰ᧸ᨰ᩺᪀᪂᪔öððöᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥࠀ᪔᪖᪠ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀LᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ᪠᪪᫊ᬊᬐᬒᬦöðöᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥ؀ᬦᬨᬲጀ

ᄀ碄ᘀĤ晉䑗 2 葠 xà欀酤 NᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁᬲᭀ᭲᮸ᰐᰒᰘᰚᰰù豈ù豈ùð	̀Ĥ␖䤁Ŧ愀ĤᘀĤ晉ࠀᰰᰲ᰼ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀䅤 PᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ᰼᱆ᱜᱸᲒᲬ᳆᳌᳎᳤öððööᘀĤ晉	̀Ĥ␖䤁Ŧ愀ĤऀᱚᱬᱶᱸᲐᲒᲪ᲼᳄᳆᳊᳌᳎᳢᳦᳠ᳮᳰ᳸ᳺ᳾ᴒᴔᴘᴮᴰᴴᴼᴾᵆᵈᵬᵮᵲᵴᵶᶈᶊᶎᶖᶘᶠᶢᶨ᷌ᷔᷰḄḊḌḐḬḴ�죎뎾돴뎾ꂮ뺳뺳뺳뺳鲮ꂍ뺜ꂳ뺳뺳蛧蚮돴뎾ᘍ譨扝愀ᕊ漀Ĩᘝ譨扝䌀ቊ伀Ɋ儀Ɋ帀Ɋ愀ቊ漀Ĩᘆ譨扝ᘚ譨扝䌀ቊ伀Ɋ儀Ɋ帀Ɋ愀ቊᘉ譨扝漀Ĩᘕ譨扝䌀ᡊ伀͊儀͊漀Ĩᘒ譨扝䌀ᡊ伀͊儀͊ᘊ譨扝愀ᕊᘖ譨扝䌀ᡊ伀Ɋ儀Ɋ帀Ɋᘙ譨扝䌀ᡊ伀Ɋ儀Ɋ帀Ɋ漀Ĩᘙ譨扝伀Ɋ儀Ɋ帀Ɋ愀ᕊ漀Ĩᘖ譨扝伀Ɋ儀Ɋ帀Ɋ愀ᕊ㐀᳤᳦ᳰᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀QᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄ؀ǲ￿￿￿￿ĄĄ؀ț￿￿￿￿ĄĄ؀Ӥ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©ȀᳰᳺᴔᴚᴜᴲöööᘀĤ晉	̀Ĥ␖䤁Ŧ愀ĤԀᴲᴴᴾᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀魤 SᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©ȀᴾᵈᵮᵴᵶᶌöððᘀĤ晉	̀Ĥ␖䤁Ŧ愀ĤԀᶌᶎᶘᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀䭤 UᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄ؀ǲ￿￿￿￿ĄĄ؀ț￿￿￿￿ĄĄ؀Ӥ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©ȀᶘᶢḌḒḔḪöööᘀĤ晉	̀Ĥ␖䤁Ŧ愀ĤԀḪḬḶᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀VᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©ȀḴḶḾṀṌṞṮṰẘẚỊỌỘỬỼỾἨἪἼὊὌ὎ὼ὾ᾤᾸῈῊῶῸ•․‶⁄⁆⁈⁮₂ₒₔₘ₲₺₼⃄⃆⃾℀℘ℾ⅀ⅆⅪⅲↀↂ↘↚↪↬↼↾⇖⇘⇺∀∂∆∢∪∬∴∶������������������췶췉룀틞틞틞틞틞틞틞틞ᘎ譨扝䌀ቊ愀ቊᘑ譨扝䌀ቊ愀ቊ漀Ĩᘆ譨扝ᘉ譨扝漀Ĩᘖ譨扝伀Ɋ儀Ɋ帀Ɋ愀ᕊᘙ譨扝伀Ɋ儀Ɋ帀Ɋ愀ᕊ漀Ĩᘕ譨扝䌀ᡊ伀͊儀͊漀Ĩᘒ譨扝䌀ᡊ伀͊儀͊䠀ḶṀṰẚỌỾἪ὎὾ᾦῊῸ․⁈⁰ₔₚₜ₰öäðääðääö

ᄀꒄᘁĤ晉䑗È葠ƤᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥሀ₰₲₼ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀ꕤXᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ₼⃆℀⅀↮⇚∂∈∊∠öððööᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥऀ∠∢∬ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀啤 ZᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ∬∶≚⊆⊺⋬⌢⍠⎌⎴⎺⎼⏐öäääðö

ᄀ튄ᘀĤ晉䑗 d 葠ÒᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥఀ∶≆≌≘≮⊄⊞⊸⋘⋪⌊⌠⍄⍞⍠⎊⎌⎲⎴⎸⏌⏎⏒⏚⏜⏤⏦␊␌␾⑀⑄①⑨⑪⑲⑴⒀⒒⒞⒠ⓆⓈ⓴⓶┢┤╊╌╸╺╾▂▖▚▢▤▬▮◔◖◪☞☰☲☴♀♒♖♘♴⚠퇛퇛퇛퇛퇛퇛퇛퇛퇛퇛퇛뷦´ᘑ譨扝䌀ቊ愀ቊ漀Ĩᘝ譨扝䌀ቊ伀Ɋ儀Ɋ帀Ɋ愀ቊ漀Ĩᘉ譨扝漀Ĩᘒ譨扝䌀ᡊ伀͊儀͊ᘕ譨扝䌀ᡊ伀͊儀͊漀Ĩᘖ譨扝伀Ɋ儀Ɋ帀Ɋ愀ᕊᘙ譨扝伀Ɋ儀Ɋ帀Ɋ愀ᕊ漀Ĩ䜀⏐⏒⏜ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀դ\ᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ⏜⏦␌⑀⑆⑈⑞öðöᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥ؀⑞①⑪ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀땤]ᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ⑪⑴⒠Ⓢ⓶┤╌╺▀▂▘öðððöᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥ਀▘▚▤ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀敤_ᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ▤▮◖☴♘⚢⚨⚪⚾öððöᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥࠀ⚠⚢⚦⛀⛈⛊⛒⛔⛤⛪⛶✒✔✬✮❎❨❪❮❲➄➈➐➒➚➜⟒⟔⟨⟸⠌⠘⠚⠞⠸⡀⡂⡊⡌⡮⡰⢦⢨⣠⣢⤘⤚⥄⥆⥶⥸⥼⦖⦞⦠⦨⦪⧊⧌⧖⧘⧜⧞⧶⨂⨈⨊⨪⨺⩀⩂⩞⩮틟틴틴틴틴췟������럁럁럁럁럁럁ᘒ譨扝䈀Ī⡯瀁 hᘏ譨扝䈀Ī桰ᘆ譨扝ᘉ譨扝漀Ĩᘙ譨扝伀Ɋ儀Ɋ帀Ɋ愀ᕊ漀Ĩᘒ譨扝䌀ᡊ伀͊儀͊ᘕ譨扝䌀ᡊ伀͊儀͊漀Ĩᘖ譨扝伀Ɋ儀Ɋ帀Ɋ愀ᕊ䠀⚾⛀⛊ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀ᕤaᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ⛊⛔⛸✰❪❰❲➆öðööᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥ܀➆➈➒ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀앤bᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ➒➜⟔⟺⠚⠠⠢⠶öðööᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥ܀⠶⠸⡂ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀畤 dᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ⡂⡌⡰⢨⣢⤚⥆⥸⥾⦀⦔öðððöᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥ਀⦔⦖⦠ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀╤fᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ⦠⦪⧌⧘⨄⨼⩰⩼⪤⪦⫎⫴⬔⬰⬸⬺⭎öððððððöᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥက⩮⩰⩺⪦⪶⫊⫌⫎⫚⫠⫢⫦⫲⫴⫾⬔⬞⬰⬶⭐⭘⭚⭢⭤⮈⮊⮌⮰⮼⯒⯔⯤⯦ⱬⱰⱴⲆⲊⲒⲔⲜⲞⲮⳂⳆⳈⳔ⳪⳶⳸ⴆⴒⴔⴖⴚⴴⴼⴾⵆⵈⵠⵢⵦⶀⶈⶊⶒⶔⶤ탷탆탆맆릭릭릭릭킭탆탆탆맆릭릭릭릭릭킭탆탆맆킭탆탆맆ᘖ譨扝伀Ɋ儀Ɋ帀Ɋ愀ᕊᘙ譨扝伀Ɋ儀Ɋ帀Ɋ愀ᕊ漀Ĩᘒ譨扝䌀ᡊ伀͊儀͊ᘕ譨扝䌀ᡊ伀͊儀͊漀Ĩᘏ譨扝䈀प桰ᘒ譨扝䈀प⡯瀁 h 耀ᘒ譨扝䈀Ī⡯瀁 hᘏ譨扝䈀Ī桰䐀⭎⭐⭚ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀핤gᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ⭚⭤⮊⮾ⱬⱲⱴⲈöðööᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥ܀ⲈⲊⲔᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀蕤 iᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©ȀⲔⲞⳈ⳸ⴖⴜⴞⴲöðööᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥ܀ⴲⴴⴾᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀㕤 kᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁⴾⵈⵢ⵨⵪⵾öööᘀĤ晉	̀Ĥ␖䤁Ŧ愀ĤԀ⵾ⶀⶊᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀lᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁⶊⶔⷼ⹆⹎⹐⹦öðöᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥ؀ⶤⶺⷄⷈⷊⷒⷺⷼ⸌⸠⸪⸸⹄⹆⹌⹨⹰⹲⹺⹼⺘⺺⺼⻐⻒⻖⻰⻸⻺⼂⼄⼲⼴⽒⽔⽘⽜⽮⽲⽺⽼⾄⾆⾖⾜⾨⾪⿸⿺⿾〘〠〢〪〬〸おずなぶへ゜ゞオゼトナヴㄊㄞㄠㅀㅂㅆㅠㅨㅪㅲㅴㆀ���짍짍틜틜틜짍짍틜틜틜틜틜틜틜틜틜틜çᘆ譨扝ᘉ譨扝漀Ĩᘒ譨扝䌀ᡊ伀͊儀͊ᘕ譨扝䌀ᡊ伀͊儀͊漀Ĩᘙ譨扝伀Ɋ儀Ɋ帀Ɋ愀ᕊ漀Ĩᘖ譨扝伀Ɋ儀Ɋ帀Ɋ愀ᕊ伀⹦⹨⹲ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀镤 nᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ⹲⹼⺼⻒⻘⻚⻜⻮öðööᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥ܀⻮⻰⻺ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀䕤 pᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ⻺⼄⼴⽔⽚⽜⽰öðöᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥ؀⽰⽲⽼ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀qᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ⽼⾆⾪⿺ 。〖öðöᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥ؀〖〘〢ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀ꕤsᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ〢〬へゞナヶㄠㅂㅈㅊㅞöääØö

ᄀ�ᘂĤ晉䑗Ş葠˟

ᄀꒄᘁĤ晉䑗È葠ƤᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥ਀ㅞㅠㅪᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀啤 uᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁㅪㅴ㆞㇄㇪ㇰㇲ㈆öäöö

ᄀꒄᘁĤ晉䑗È葠ƤᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥ܀ㆀ㆐㆜ㆲ㇂㇘㇨㇪㇮㈈㈐㈒㈚㈜㈾㉀㉰㉲㊢㊤㋔㋖㌆㌈㌸㌺㍪㍬㎜㎞㎤㎲㎼㏀㏈㏊㏒㏔㐂㐄㐬㐮㑜㑞㒐㒒㒘㒜㒰㒴㒼㒾㓆㓈㓨㓪㔊㔜㔞㕐㕢㕤㖈㖊���췒췉췉췉췉췉췉췉����췒����쇴꾷럁솯¥ᘒ譨扝䈀ପ⡯瀁 hᘏ譨扝䈀Ī桰ᘒ譨扝䈀Ī⡯瀁 hᘏ譨扝䈀ପ桰耀ᘆ譨扝ᘉ譨扝漀Ĩᘒ譨扝䌀ᡊ伀͊儀͊ᘕ譨扝䌀ᡊ伀͊儀͊漀Ĩᘙ譨扝伀Ɋ儀Ɋ帀Ɋ愀ᕊ漀Ĩᘖ譨扝伀Ɋ儀Ɋ帀Ɋ愀ᕊ㼀㈆㈈㈒ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀դwᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ㈒㈜㉀㉲㊤㋖㌈㌺㍬㎞㎦㎨㎾öððððöᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥఀ㎾㏀㏊ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀땤xᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ㏊㏔㐄㐮㑞㒒㒚㒜㒲öððöᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥࠀ㒲㒴㒾ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀敤 zᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ㒾㓈㓪㔞㕤㖢㗞㘨㙬㚠㚨㚪㛀öððððöᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥఀ㖊㖞㖠㗄㗆㗚㗜㘀㘂㘤㘦㙄㙆㙨㙪㚆㚈㚜㚞㚠㚦㚪㚾㛂㛊㛌㛔㛖㛼㛾㜸㜺㝘㝨㞄㞤㞦㞬㞰㟄㟈㟒㟔㟜㟞㟬㟮㠀㠂㠰㡈㡊㡌㡶㡸㡺㢔㣊㣔㣼㤐㤒컙컄컄컄뿄뾻뎻뎩�쓎쓎쓎쓎��������ᘙ譨扝伀Ɋ儀Ɋ帀Ɋ愀ᕊ漀Ĩᘒ譨扝䈀Ī⡯瀁 hᘏ譨扝䈀Ī桰ᘆ譨扝ᘉ譨扝漀Ĩᘒ譨扝䌀ᡊ伀͊儀͊ᘕ譨扝䌀ᡊ伀͊儀͊漀Ĩᘖ譨扝伀Ɋ儀Ɋ帀Ɋ愀ᕊᘏ譨扝䈀ପ桰耀ᘒ譨扝䈀ପ⡯瀁 hᘏ譨扝䈀प桰㴀㛀㛂㛌ᘀ	̀Ĥ␖䤁Ŧ愀Ĥà欀ᕤ|ᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ㛌㛖㛾㜺㝪㞦㞮㞰㟆öððöᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥࠀ㟆㟈㟔ᤀᘀĤ晉à欀앤}ᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ㟔㟞㟮㠂㠲㠴㡌㡸㡼㢔㣔㣾㤀㤔㤶㤸㥌㥸㥺㦔㧀㧂㧘㧾㨀㨖㩄㩆㩠öðððððððððððððᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥᰀ㤒㤔㤴㥈㥊㥌㥶㦐㦒㦔㦾㧔㧖㧘㧼㨒㨔㨖㩂㩜㩞㩠㩾㪂㪖㪘㫀㫄㫈㫌㫠㫤㫬㫮㫶㫸㬊㬤㬰㬺㬼㭀㭌㭎㭒㭪㭲㭴㭼㭾㮖㮘㮞㮠㯄㯜㯞㯤㯼㰄㰆㰎㰐㰨㰲�틴틈틈틈쏈쎿쎿쎿튿틈틈뗈궿궣뿃죒죒죒뿃ᘒ譨扝䈀Ī⡯瀁 hᘏ譨扝䈀Ī桰ᘒ譨扝䈀प⡯瀁 h 耀ᘆ譨扝ᘉ譨扝漀Ĩᘒ譨扝䌀ᡊ伀͊儀͊ᘕ譨扝䌀ᡊ伀͊儀͊漀Ĩᘒ譨扝䈀പ⡯瀁顨وᘙ譨扝伀Ɋ儀Ɋ帀Ɋ愀ᕊ漀Ĩᘖ譨扝伀Ɋ儀Ɋ帀Ɋ愀ᕊ䀀㩠㪀㪂㪘㫂㫄㫊㫌㫢ù豈ù豈ùð豈	̀Ĥ␖䤁Ŧ愀ĤᘀĤ晉ࠀ㫢㫤㫮ᤀᘀĤ晉à欀畤ᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ㫮㫸㬲㭎㭔㭖㭨öðöᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥ؀㭨㭪㭴ᤀᘀĤ晉à欀╤ᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ㭴㭾㯄㯞㯦㯨㯺öðöᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥ؀㯺㯼㰆ᤀᘀĤ晉à欀핤ᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ㰆㰐㰪㱎㳊㳺㴂㴄㴖öððöᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥࠀ㰲㱌㱎㱴㱼㱾㲦㳈㳺㴀㴘㴠㴢㴪㴬㵖㵘㵠㵬㵮㶈㶊㶐㶨㶰㶲㶺㶼㷤㷦㷺㷼㸀㸂㸘㸚㸠㸸㹀㹂㹊㹌㺀㺂㺔㺖㺜㺞㺪㻒㻔㻦㻨㻮㻰㻼㼂㼚㼢㼤㼬㼮㽘㽚㾄㾆㾊㾤㾬㾮㾶㾸쿙쟙﫡﫶뿶뾵﫡﫶뿶뾵떿﫡뗶áᘒ譨扝䈀Ī⡯瀁 hᘏ譨扝䈀Ī桰ᘏ譨扝䈀ପ桰耀ᘒ譨扝䈀प⡯瀁 h 耀ᘏ譨扝䈀प桰ᘒ譨扝䌀ᡊ伀͊儀͊ᘕ譨扝䌀ᡊ伀͊儀͊漀Ĩᘆ譨扝ᘉ譨扝漀Ĩ䜀㴖㴘㴢ᤀᘀĤ晉à欀蕤ᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ㴢㴬㵘㵮㶊㶒㶔㶦öðöðᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥ܀㶦㶨㶲ᤀᘀĤ晉à欀㕤ᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ㶲㶼㷦㷼㸚㸢㸤㸶öðöðᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥ܀㸶㸸㹂ᤀᘀĤ晉à欀ᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ㹂㹌㺂㺖㺪㻔㻨㻼㼄㼆㼘öðððöᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥ਀㼘㼚㼤ᤀᘀĤ晉à欀镤ᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ㼤㼮㽚㾆㾌㾎㾢öðöᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥ؀㾢㾤㾮ᤀᘀĤ晉à欀䕤ᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ㾮㾸㿔䀘䁆䁤䁪䁬䁾öððöᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥࠀ㾸㿀㿆㿒㿔䀖䀘䀤䀸䁄䁆䁢䁤䁨䂀䂈䂊䂒䂔䂜䂢䂮䃘䃚䄀䄂䄄䄊䄌䄤䄬䄮䄶䄸䅄䅖䅢䅺䆂䆄䆆䆔䆤䆦䇐䇒䇖䇘䇰䇸䇺䈂䈄䈖䈲䉀䉐䉒䉘䉲䉺䉼䊄䊆䊒䊔䊘䋂䋮䋰䋶䌐䌘䌚䌢쿗ퟡퟏퟏퟏퟏퟏ뷅﫶﫡﫶﫶ᘏ譨扝䈀प桰ᘒ譨扝䈀प⡯瀁 h 耀ᘏ譨扝䈀Ī桰ᘒ譨扝䈀Ī⡯瀁 hᘒ譨扝䌀ᡊ伀͊儀͊ᘕ譨扝䌀ᡊ伀͊儀͊漀Ĩᘆ譨扝ᘉ譨扝漀Ĩ䨀䁾䂀䂊ᤀᘀĤ晉à欀ᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄڀǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ䂊䂔䂰䄄䄌䄎䄢öðöᘀĤ晉	̀Ĥ␖䤁Ŧ愀Ĥ؀䄢䄤䄮ᤀᘀĤ晉à欀ꕤᘀĤ␗䤁Ŧ܀螔ࠀ裖؀ύߞᲶẨ⃃▧ڀύ￿￿ČĄĄڀБ￿￿￿￿ĄĄ؀ᓘ￿￿￿￿ĄĄ؀ǲ￿￿￿￿ĄĄڀț￿￿￿￿ĄĄڀӤ￿￿￿￿ĄČ혉

ሁ㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ퐃᜵϶ⴃᨐᣖ￿￿￿￿￿￿￿￿￿￿￿￿혛￿￿￿￿￿￿￿￿￿￿᳿ᣖ＀＀＀＀＀＀혝ÿÿÿÿÿ㓿ۖĀ̏瀀㳖＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ＀￿ÿ瑹爤©Ȁ䄮䄸䅤䆄䆦䇒䇘䇚䇮öððö
