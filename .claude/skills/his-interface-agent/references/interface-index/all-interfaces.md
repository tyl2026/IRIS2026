# 本地静态接口索引

> 数据来源: IRIS `Ens_InterfaceMethod` 表（历史导出）
> 最后更新: 2026-06-03
> 接口总数: 644 个方法, 238 个类
>
> **注意**: 本文件为无MCP连接时的兜底数据源。当MCP连接可用时，优先从 `Ens_InterfaceMethod` 表实时获取最新数据。

---

## CIS.AN.SRV.WebService.SyncSurgenOperation

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W000MedSynOper` | `SaveSurgenOperation` | 医师资质手术授权同步 | Y |
| `W000MedOperQuery` | `OperationInquiry` | 医师资质手术记录同步 | Y |

## CIS.OPApp.SRV.DirectConn.Server.ForENS

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W000ANSAVEARR` | `SendOperArrangementList` | 同步手术排班数据 | Y |
| `W000ANSAVEREG` | `SendOperRegistrationList` | 同步手术登记数据 | Y |
| `W000ANSAVESTA` | `OnOperStatusChange` | 同步手术状态改变数据 | Y |
| `W000ANOPA` | `GetOperAppointment` | 手麻获取申请单信息 | Y |

## DHCAnt.Serve.ComOut

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000150` | `SaveKSSAuthByXML` | 医师资质抗菌药接口 | Y |

## DHCBILL.SelfPay.BLL.DHCIPBillPayExp

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000246` | `GetIPAdmInfo` | 自助机获取住院有效就诊记录 | Y |
| `W00000247` | `AddIPDeposit` | 自助机住院预交金充值 | Y |
| `W00000248` | `GetIPDepRecord` | 自助机住院预交金记录查询 | Y |
| `W00000249` | `GetIPTotalCost` | 自助机查询住院汇总费用信息 | Y |

## DHCBILL.SelfPay.BLL.DHCOPBillPayExp

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000347` | `GetChargeOrder` | 自助机获取病人就诊结算单 | Y |
| `W00000348` | `PreBillCharge` | 自助机HIS预结算 | Y |
| `W00000349` | `CompleteCharge` | 自助机收费确认完成 | Y |
| `W00000351` | `CancelCharge` | 自助机撤销预结算 | Y |
| `W00000350` | `CheckCharge` | 自助机扣费结果查证 | Y |
| `W00000366` | `getIUDdata` | 自助机获取已开电子发票 | Y |
| `W00000235` | `GetChargeOrder` | 获取待缴费结算单 | Y |
| `W00000240` | `PreBillCharge` | 预结算 | Y |
| `W00000241` | `CompleteCharge` | 确认收费完成 | Y |
| `W00000242` | `GetAdmByCardNo` | 自助机根据卡号及日期查询就诊记录 | Y |
| `W00000243` | `CancelCharge` | 取消预结算 | Y |
| `W00000244` | `GetPaidRecord` | 自助机查询已缴费记录 | Y |
| `W00000245` | `GetPaidRecordDetails` | 自助机查询已缴费记录明细 | Y |
| `W00000262` | `InvocieBillZZJ` | 自助电子票据开具接口 | Y |

## DHCDoc.Interface.Outside.DHCVISService.DHCVisInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000200` | `QueryPatList` | 叫号获取患者列表 | Y |

## DHCDoc.Interface.Outside.EMPI.Interface

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000446` | `EMPI101` | 4.3.1索引注册更新通知(EMPI101) | Y |
| `W00000447` | `EMPI102` | 4.3.2索引合并通知(EMPI102) | Y |
| `W00000448` | `EMPI103` | 4.3.3索引拆分通知(EMPI103) | Y |

## DHCExternalService.BillInterface.Service.DHCOPBillPaySOAP

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000093` | `ResetAccountPassword` | 院内账户密码重置(自助机) | Y |
| `W00000104` | `getZZJCash` | 自助机清仓取现调用，保存自助机工号及清仓日期时间，便于报表统计 | Y |
| `W00000109` | `UploadRechargeRecord` | 充值数据同步 | Y |
| `W00000115` | `RefundOPDeposit` | 自助机银行卡充值和退费 | Y |
| `W00000062` | `GetAdmByCardNo` | 自助机根据卡号及日期查询就诊记录 | Y |
| `W00000063` | `GetBillInfo` | 自助机获取病人就诊的医嘱信息 | Y |
| `W00000064` | `AutoOPBillCharge` | 自助机结算并保存交易信息 | Y |
| `W00000065` | `GetCompletedPayInfo` | 自助机已缴费记录查询 | Y |
| `W00000066` | `GetCompletedPayDetailInfo` | 自助机已缴费记录明细查询 | Y |
| `W00000067` | `GetOPPatientInfo` | 自助机通过卡号获取患者基本信息和院内账户信息 | Y |
| `W00000068` | `AddOPDeposit` | 自助机院内账户预交金充值 | Y |
| `W00000069` | `GetIPPatientInfo` | 自助机通过卡号获取患者基本信息和住院记录 | Y |
| `W00000070` | `AddIPDeposit` | 自助机住院预交金充值 | Y |
| `W00000071` | `GetPrepayRecord` | 自助机预交金查询（返回值需要调整） | Y |
| `W00000072` | `GetIPDailyBill` | 自助机住院费用每日清单查询 | Y |
| `W00000073` | `GetIPTotalCost` | 自助机住院费用汇总查询 | Y |
| `W00000074` | `GetIPDetailCost` | 自助机住院费用分类明细查询 | Y |
| `W00000077` | `CheckAccountPassword` | 院内账户密码校验 | Y |
| `W00000078` | `ChangeAccountPassword` | 院内账户密码修改 | Y |
| `W00000085` | `FindOPDepositDetails` | 患者院内账户预交金明细查询 | Y |

## DHCExternalService.CardInterface.Service.CardService

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000103` | `FindCardType` | 根据卡号获得对应的卡类型 | Y |
| `W00000045` | `FindPatientCard` | 自助机就诊卡查询 | Y |
| `W00000046` | `SavePatientCard` | 自助机发卡 | Y |
| `W00000047` | `PartientCardReissue` | 自助机补卡 | Y |

## DHCExternalService.DualReferInterface.MainQueryService

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000324` | `GetStickBedInfoService` | 双向转诊-查询可用床位信息 | Y |
| `W00000325` | `LockStickBedService` | 双向转诊-锁定床位 | Y |
| `W00000326` | `UnlockStickBedService` | 双向转诊-解锁床位 | Y |
| `W00000317` | `QueryPatientInfoService` | 双向转诊-查询患者个人基本信息 | Y |
| `W00000318` | `GetOrderNumInfoService` | 双向转诊-查询可预约号源信息 | Y |
| `W00000319` | `SubmitOrderByUserInfoService` | 双向转诊-提交预约所有相关信息（即预约单）以及用户信息 | Y |
| `W00000320` | `OrderCancelInfoService` | 双向转诊-取消预约，提交退号信息 | Y |
| `W00000321` | `GetOrderDetailInfoService` | 双向转诊-查询预约单详细信息 | Y |
| `W00000322` | `GetResourceDoctInfoService` | 双向转诊-开放预约时间范围内查询可预约医生信息 | Y |
| `W00000323` | `GetResourceOutPatInfoService` | 双向转诊-开放预约时间范围内查询可预约门诊信息 | Y |

## DHCExternalService.DualReferInterface.MainQueryService.MainQueryService

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000377` | `SubmitOrderByUserInfoService` | 双转-提交预约所有相关信息 | Y |
| `W00000378` | `OrderCancelInfoService` | 双转-取消预约，提交退号信息 | Y |
| `W00000379` | `GetOrderDetailInfoService` | 双转-查询预约单详细信息 | Y |
| `W00000380` | `GetResourceDoctInfoService` | 双转-开放预约时间范围内查询可预约医生信息 | Y |
| `W00000381` | `GetResourceOutPatInfoService` | 双转-开放预约时间范围内查询可预约门诊信息 | Y |
| `W00000382` | `GetStickBedInfoService` | 双转-查询可用床位信息 | Y |
| `W00000383` | `LockStickBedService` | 双转-锁定床位 | Y |
| `W00000384` | `UnlockStickBedService` | 双转-解锁床位 | Y |
| `W00000374` | `QueryPatientInfoService` | 双转-查询患者个人基本信息 | Y |
| `W00000375` | `GetOrderNumInfoService` | 双转-查询可预约号源信息 | Y |
| `W00000376` | `SubmitOrderByUserInfoService` | 双转-提交预约所有相关信息（即预约单）以及用户信息 | Y |

## DHCExternalService.QryInterface.BL.InvFeeInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000075` | `GetMedPrice` | 自助机查询药品价格 | Y |
| `W00000076` | `GetTarItemPrice` | 自助机查询非药品收费项目价格 | Y |

## DHCExternalService.RegInterface.Service.SelfRegService

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000373` | `PatArriveAgain` | 自助机-复诊报到 | Y |
| `W00000163` | `InputBookDataFromOSys` | 获取老系统推送的住院证数据 | Y |
| `W00000165` | `GetPatInfo` | 获取病人基本信息 | Y |
| `W00000166` | `GetPatBillType` | 获取患者社会地位对应的可挂号费别 | Y |
| `W00000167` | `QueryDepartmentGroup` | 得到一级科室列表 | Y |
| `W00000168` | `QueryDepartment` | 得到二级科室列表 | Y |
| `W00000169` | `QueryDoctor` | 自助机得到医生列表 | Y |
| `W00000170` | `QueryAdmSchedule` | 自助机查询排班记录 | Y |
| `W00000171` | `QueryScheduleTimeInfo` | 自助机医生号源分时信息查询 | Y |
| `W00000172` | `LockOrder` | 锁号 | Y |
| `W00000429` | `OPRegisterForSDZX` | 三大中心-挂号 | Y |
| `W00000430` | `SavePatientCardForSDZX` | 三大中心-无名氏建档 | Y |
| `W00000441` | `QueryAdmScheduleNew` | 互联网医院查询医生排班 | Y |
| `W00000173` | `UnLockOrder` | 取消锁号 | Y |
| `W00000174` | `QueryPatCard` | 患者就诊介质查询 | Y |
| `W00000175` | `OPRegister` | 挂号、提前挂号 | Y |
| `W00000176` | `GetOPRapidRegistAS` | 获取直接挂号的排班出诊信息(不受号源限制) | Y |
| `W00000177` | `OPRapidRegist` | 直接挂号(不受号源限制) | Y |
| `W00000178` | `QueryAdmOPReg` | 查询挂号记录 | Y |
| `W00000179` | `GetInsuRegPara` | 获取医保挂号HIS信息 | Y |
| `W00000180` | `OPRegReturn` | his退号 | Y |
| `W00000181` | `QueryPatAdmList` | 查询病人候诊排队信息 | Y |
| `W00000182` | `BookService` | 预约 | Y |
| `W00000183` | `QueryOrder` | 查询预约取号列表 | Y |
| `W00000184` | `OPAppArrive` | 预约取号 | Y |
| `W00000185` | `CancelOrder` | 预约挂号系统取消确定预约HIS中资源 | Y |
| `W00000186` | `QueryStopDoctorInfo` | 停诊医生信息查询 | Y |
| `W00000187` | `QueryRegStatus` | 预约挂号状态回查接口 | Y |
| `W00000188` | `ChangeRegFeeToInsu` | 实现自费挂号转医保挂号 | Y |
| `W00000189` | `FindPatientCard` | 病人发卡判断 | Y |
| `W00000190` | `SavePatientCard` | 发卡 | Y |
| `W00000191` | `UpdatePatInfo` | 更新病人信息 | Y |
| `W00000192` | `CardReissue` | 补卡接口 | Y |
| `W00000105` | `QueryDepartment` | 获取科室列表 | Y |
| `W00000106` | `QueryDoctor` | 得到医生列表 | Y |
| `W00000107` | `QueryScheduleFee` | 查询排班医院收费条目信息 | Y |
| `W00000108` | `UpdatePatInfo` | 病人基本信息更新 | Y |
| `W00000061` | `QueryDepByKeyWord` | 自助机根据关键字获取二级科室（返回值需要调整） | Y |
| `W00000048` | `GetPatInfo` | 自助机获取患者基本信息 | Y |
| `W00000049` | `LockOrder` | 自助机挂号锁号和取消锁号 | Y |
| `W00000050` | `GetInsuRegPara` | 自助机获取医保信息 | Y |
| `W00000051` | `OPRegister` | 自助机挂号-提前挂号 | Y |
| `W00000052` | `QueryAdmOPReg` | 自助机查询挂号记录 | Y |
| `W00000053` | `OPRegReturn` | 自助机退号(返回值需要调整) | Y |
| `W00000054` | `QueryStopDoctorInfo` | 自助机停诊医生信息查询 | Y |
| `W00000055` | `QueryRegStatus` | 自助机预约挂号状态回查接口 | Y |
| `W00000056` | `PrintRegInfo` | 自助机挂号条打印接口（返回值需要调整） | Y |
| `W00000057` | `BookService` | 自助机预约（返回值需要调整） | Y |
| `W00000058` | `QueryOrder` | 自助机查询患者预约记录（返回值需要调整） | Y |
| `W00000059` | `OPAppArrive` | 自助机病人取号确认（返回值需要调整） | Y |
| `W00000060` | `CancelOrder` | 自助机取消预约（返回值需要调整） | Y |

## DHCExternalServiceNew.RegInterface.Service.SelfRegService

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000420` | `GetMattersNeedingAttention` | 互联网医院-医嘱获取医嘱注意事项 | Y |
| `W00000421` | `GetCMPrescType` | 互联网医院-获取草药默认用法 | Y |
| `W00000435` | `CreateSchedule` | 互联网医院自主排班 | Y |
| `W00000436` | `UpdateSchedule` | 互联网医院-修改排班号源接口 | Y |
| `W00000437` | `QueryAdmScheduleNew` | 互联网医院-查询多天排班 | Y |

## DtPortal.Common.MessageInfoPortal

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000122` | `MessageInfoContent` | 获取Portal队列所需信息 | Y |

## DtPortal.Doctor.DHCDocComService

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000120` | `SendAppInfoPortal` | portal获取门诊信息 | Y |

## EMRservice.BL.opInterface

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000224` | `GetMedicalHistoryForYFWB` | 查询一段时间内的患者病历信息-利连院感 | Y |
| `W00000193` | `GetDisChargeRecord` | 根据就诊号查询患者出院小结(H155)-商保 | Y |
| `W00000194` | `GetDisCourse` | 根据就诊号查询患者患者病程信息(H150)-商保 | Y |
| `W00000195` | `GetMedicalHistory` | 查询一段时间内的出院患者病历信息(H160) | Y |

## EMRservice.InterfaceService.WebHospInterface

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000406` | `RegOPXml` | 互联网医院-保存门诊病历信息 | Y |
| `W00000407` | `GetOPXml` | 互联网医院-获取门诊病历信息 | Y |

## INSU.MI.NAT.ONPAY.SRV.DHCCWeb

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000164` | `API` | 东华医为医保接口服务:国标移动支付2.0 | Y |

## MA.IPMR.IOSrv.WebService.Server.ForMR

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W000EMADM` | `GetAdmInfo` | 病案查询就诊信息 | Y |
| `W000EMFP` | `GetFrontPage` | 病案查询病历数据 | Y |
| `W000EMUser` | `GetUser` | 病案查询用户信息 | Y |
| `W000EMDep` | `GetDepartment` | 病案查询科室信息 | Y |
| `W000EMHos` | `GetHospital` | 病案查询医院信息 | Y |
| `W000EMPat` | `GetPatInfo` | 病案查询患者信息 | Y |
| `W000EMRec` | `RecallAdmRecordStatus` | 病案撤销病历提交 | Y |
| `W000EMSM` | `SendMessage` | 病案发送消息 | Y |

## MHC.Store.ItemDef

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000112` | `generOperating` | 满意度调查(获取代码描述对照关系) | Y |
| `W00000113` | `generOperating` | 满意度调查(保存满意度调查) | Y |
| `W00000114` | `generOperating` | 满意度调查(获取评价信息) | Y |

## MyLYService.web.BedCard.webservice.Soap

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000205` | `operaList` | 获取病区手术列表-蔚壹床头屏 | Y |
| `W00000206` | `User` | 获取用户-蔚壹床头屏 | Y |
| `W00000207` | `Order` | 获取患者医嘱-蔚壹床头屏 | Y |
| `W00000208` | `cost` | 获取患者收费明细-蔚壹床头屏 | Y |
| `W00000209` | `WardInfo` | 综合信息展示-蔚壹床头屏 | Y |
| `W00000203` | `ward` | 获取病区-蔚壹床头屏 | Y |
| `W00000204` | `patientList` | 获取病区患者列表-蔚壹床头屏 | Y |

## MyLYService.web.KPIReport.soap

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000358` | `getData` | 微信日报就诊数据推送 | Y |

## MyLYService.web.ServicefoZYZWB.soap.getdata

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000226` | `GetEmpiInfo` | 获取患者主索引-治未病系统 | Y |
| `W00000227` | `GetHospital` | 获取医院信息-治未病系统 | Y |
| `W00000228` | `GetOutDepaList` | 获取治未病科室-治未病系统 | Y |
| `W00000229` | `GetPatTreatmentRecords` | 获取患者就诊记录-治未病系统 | Y |
| `W00000230` | `GetPatTreatmentMedicalHistory` | 获取患者病史-治未病系统 | Y |

## MyLYService.web.YiHui.soap.getpatient

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000258` | `Ward` | 获取科室信息-医会 | Y |
| `W00000259` | `WardPatient` | 根据病区id获取患者信息-医会 | Y |
| `W00000260` | `WardPatientbyRegNO` | 根据登记号获取患者信息-医会 | Y |
| `W00000261` | `WardPatientbyIPNO` | 根据住院号获取患者信息-医会 | Y |

## Nur.NIS.Service.VitalSign.BloodGlucoseV2

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000355` | `UpdateDataFromBPMeter` | 保存体征数据 | Y |

## PHA.FACE.TPS.SZSHCALL

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000267` | `SendToCallScreen` | 药房获取队列-神州视翰 | Y |

## RISService.InvokeRISService

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000157` | `InsertAppPACS` | PACS发送检查申请单 | Y |

## User.HWH.Interface.FirstParty

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000225` | `GetDisCourseNew` | 病例大段文字调用 | Y |
| `W00000232` | `GetZYJLCourseNew` | 入院记录-院感使用 | Y |
| `W00000233` | `GetCYJLCourseNew` | 出院记录-院感 | Y |
| `W00000234` | `GetSSJLCourseNew` | 手术记录-院感 | N |
| `W00000234` | `GetSSJLCourseNew` | 手术记录-院感-大段文本 | Y |

## User.HWH.Interface.ForthParty

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000264` | `GetDisCourseNew` | 京柏-住院患者信息 | Y |
| `W00000265` | `GetDisCourseNew1` | 京柏-患者医嘱信息 | Y |
| `W00000266` | `GetDisCourseNew2` | 京柏-医技信息 | Y |

## dhc.qm.udata.uPatInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000346` | `InsertVitalSignInfo` | 护理保存生命体征 | Y |

## iH.BL.Auto

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000251` | `createAutoPayUrl` | 生成支付链接地址(IH56607) | Y |
| `W00000253` | `autoScanCloseOrder` | 关闭订单(IH56619) | Y |
| `W00000254` | `RefundForAuto` | 退费接口【单边使用】(IH56610) | Y |

## iH.BL.FacePay

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000269` | `SmilePayInit` | 自助机支付宝刷脸支付初始化（IH56612） | Y |
| `W00000270` | `SmileLiveInit` | 自助机支付宝刷脸生活初始化（IH56613） | Y |
| `W00000271` | `SmileLiveUserId` | 自助机支付宝刷脸生活获取用户id（IH56614） | Y |
| `W00000272` | `GetAliUserInfo` | 自助机支付宝刷脸生活获取用户授权信息（IH56615） | Y |
| `W00000273` | `FacePayGetAuthInfo` | 自助机微信刷脸支付获取认证信息（IH56616） | Y |
| `W00000274` | `FacePayGetUserInfo` | 自助机微信刷脸获取患者信息（IH56617） | Y |
| `W00000268` | `SmilePay` | 自助机刷脸支付-扣费（IH56611） | Y |

## iH.BL.OPBill

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000256` | `GetTradeStatus` | 轮询订单状态(IH65012) | Y |

## iH.PublicService

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000250` | `RequestSubmitForPlat` | HIS接口集成平台代理(合并入参) | Y |

## iS.Api.PublicApi

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000434` | `CreateQrPayUrlNew` | 导诊单支付二维码链接 | Y |

## web.DHCBARM.LyjService.Method.SMTZMethod

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000215` | `CheckNurseLogin` | 验证护士登录接口-生命体征仪 | Y |
| `W00000216` | `GetMCSPatientInfo` | 获取病区所有患者信息-生命体征仪 | Y |
| `W00000217` | `GetUserDeptAndWards` | 获取对应护士的科室病区集合信息-生命体征仪 | Y |
| `W00000218` | `SavePatientVitalSignInfos` | 体征数据保存-生命体征仪 | Y |

## web.DHCBL.BDP.BDPInterface

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000356` | `SaveArcItemAndTarItem` | 物资系统-同步物料信息 | Y |
| `W00000443` | `SaveUserInfoForHRP` | HRP方同步用户 | Y |
| `W00000444` | `SaveLocInfoForHRP` | HRP方同步科室 | Y |
| `W00000148` | `SavePermission` | 医师资质精麻毒接口 | Y |
| `W00000149` | `SavePrescriptSet` | 医师资质处方权接口 | Y |

## web.DHCBL.CT.TemporaryData

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000445` | `MDM104` | 4.3.4床位变化消息通知(MDM104) | Y |

## web.DHCENS.BLL.APP.Method.Examine

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000425` | `QueryCheckReportNew` | 互联网医院-获取检查报告列表 | Y |
| `W00000426` | `GetCheckReport` | 互联网医院-检查报告结果详情 | Y |

## web.DHCENS.BLL.APP.Method.QueryLISReportNew

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000427` | `QueryLISReportListNew` | 互联网医院-检验报告列表 | Y |
| `W00000428` | `QueryLISReportDetail` | 互联网医院-检验结果明细项目（包含危急值） | Y |

## web.DHCENS.BLL.BloodDialysis.Method.LabDetails

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000388` | `GetLabDetails` | 血透-获取检验报告单明细结果 | Y |

## web.DHCENS.BLL.BloodDialysis.Method.LabReport

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000387` | `GetLabReport` | 血透-获取患者检验报告主表 | Y |

## web.DHCENS.BLL.BloodDialysis.Method.PatInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000386` | `GetPatInfo` | 血透-获取患者基本信息 | Y |

## web.DHCENS.BLL.BloodStation.Method.LISSpecimen

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000334` | `LibTestInfo` | 输血-获取患者检测信息 | Y |

## web.DHCENS.BLL.BloodStation.Method.PAADM

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000335` | `PAAdm` | 输血-查询患者信息 | Y |

## web.DHCENS.BLL.Cdo.HisService.Service

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000332` | `PatInfo` | 护理大屏-住院患者基本信息 | Y |
| `W00000333` | `PaadmInfo` | 护理大屏-住院患者就诊信息 | Y |
| `W00000336` | `住院患者诊断信息` | 护理大屏-住院患者诊断信息 | Y |
| `W00000337` | `PATrans` | 护理大屏-转移记录 | Y |
| `W00000338` | `PABillDetails` | 护理大屏-患者日清单 | Y |
| `W00000339` | `PANurs` | 护理大屏-护理记录单 | Y |
| `W00000340` | `Operation` | 护理大屏-手术记录 | Y |
| `W00000341` | `EMRRecords` | 护理大屏-电子病历记录 | Y |
| `W00000342` | `PARIS` | 护理大屏-检查报告 | Y |
| `W00000343` | `PARefuseDisp` | 护理大屏-拒发药品医嘱 | Y |
| `W00000344` | `PADepositDetails` | 护理大屏-住院缴费明细 | Y |

## web.DHCENS.BLL.Cdo.Service.ChindeoService

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000331` | `DictData` | 护理大屏-基础字典部分 | Y |

## web.DHCENS.BLL.Decoction.SaveAddress

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000231` | `SaveAddress` | 中药代煎更新患者邮寄地址信息 | Y |

## web.DHCENS.BLL.Dict.AnestMethod

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000461` | `GetData` | 获取麻醉方式字典 | Y |

## web.DHCENS.BLL.Dict.CTO

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000460` | `GetCTO` | 获取手术字典 | Y |

## web.DHCENS.BLL.Dict.CTWard

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000462` | `GetCTWard` | 获取病区关联科室字典 | Y |

## web.DHCENS.BLL.Dict.DrugBasicInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000463` | `GetDrugBasicInfo` | 获取药品字典分页查询 | Y |

## web.DHCENS.BLL.Drug.Method.OPDrugOrdInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `S00000008` | `DispenseOPDrugInfo` | 从第三方系统通过处方信息获取窗口号 | Y |

## web.DHCENS.BLL.Drug.Method.PharmaceutStatus

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `S00000009` | `PharmaceutStatus` | 药房组药品状态改变时调用（开始发药，结束发药） | Y |

## web.DHCENS.BLL.Drug.Method.SaveOrderItemsCM

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000424` | `SaveOrderItems` | 互联网医院-草药插入医嘱 | Y |

## web.DHCENS.BLL.Emergency.Data

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000433` | `GetRISReport` | 三大中心-获取患者检查结果信息 | Y |
| `W00000392` | `GetPatBaseInfo` | 三大中心-获取患者基本信息 | Y |
| `W00000393` | `GetPatIPAdmInfo` | 三大中心-获取患者住院记录 | Y |
| `W00000394` | `GetPatLabRepInfo` | 三大中心-获取患者检验结果信息 | Y |
| `W00000395` | `GetPatOrdInfo` | 三大中心-获取患者医嘱信息 | Y |
| `W00000396` | `GetPatMROperInfo` | 三大中心-获取患者病案系统手术记录 | Y |
| `W00000397` | `GetPatMRDiagInfo` | 三大中心-获取患者病案系统诊断记录 | Y |
| `W00000398` | `GetPatEMRListInfo` | 三大中心-获取患者病历类型列表 | Y |
| `W00000399` | `GetPatEMRDataDetail` | 三大中心-获取患者病历内容 | Y |

## web.DHCENS.BLL.FYDataMidPlat.Service

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000390` | `HIPService` | 中台取数据统一入口 | Y |

## web.DHCENS.BLL.GJCRBSB.Method.CRBService

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `WCRB00001` | `GetPatDTO` | 患者基本信息表数据操作 | Y |
| `WCRB00002` | `EMROutpatientObs` | 门（急）诊留观记录表数据操作 | Y |
| `WCRB00003` | `EMROutpatientRecord` | 门（急）诊病例表数据操作 | Y |
| `WCRB00004` | `GetDiagnoseDTO` | 诊断活动信息表数据操作 | Y |
| `WCRB00005` | `EMRDailyCourse` | 住院日常病程记录表数据 | Y |
| `WCRB00006` | `EMRAdmissionInfo` | 入院记录表数据操作 | Y |
| `WCRB00007` | `EMRDischargeInfo` | 出院记录表数据操作 | Y |
| `WCRB00008` | `EMRFirstCourse` | 住院首次病程记录表数据操作 | Y |
| `WCRB00009` | `GetEpdRepJson` | 传报卡信息表数据操作 | Y |
| `WCRB00010` | `GetPatOrder` | 医嘱信息表数据操作 | Y |
| `WCRB00011` | `GetPatorderitem` | 医嘱信息细表数据操作 | Y |
| `WCRB00012` | `EMRAdmissionRecord` | 住院病案首页表数据 | Y |
| `WCRB00013` | `GetSignRecJson` | 生命体征护理记录单 | Y |
| `WCRB00014` | `GetDthRepJson` | 传染病预警死亡证 | Y |
| `WCRB00015` | `DeleteEPByRepID` | 删除传报卡信息表数据操作 | Y |

## web.DHCENS.BLL.GaoTong.Dict

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000438` | `CTARCItmMast` | 查询医嘱项目字典(高通) | Y |
| `W00000439` | `CTLocInfo` | 查询科室字典(高通) | Y |
| `W00000440` | `CTSSUInfo` | 查询医护人员字典(高通) | Y |

## web.DHCENS.BLL.GaoTong.Interface

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000442` | `AddPisOrder` | 病理医嘱申请（高通） | Y |

## web.DHCENS.BLL.HLWYY.Method.DiagnoseInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000400` | `InsertDiagnose` | 互联网医院-插入诊断 | Y |
| `W00000402` | `DeleteMRDiagnose` | 互联网医院-删除诊断 | Y |
| `W00000403` | `GetDiagnoseInfo` | 互联网医院-查询诊断 | Y |

## web.DHCENS.BLL.HLWYY.Method.Dict

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000414` | `FreqDictInfo` | 互联网医院-频次查询接口 | Y |
| `W00000415` | `DurationDictInfo` | 互联网医院-疗程查询接口 | Y |
| `W00000416` | `InstrDictInfo` | 互联网医院-用法查询接口 | Y |
| `W00000417` | `AdmReasonDictInfo` | 互联网医院-患者费别查询接口 | Y |
| `W00000418` | `FormDoseEquivDictInfo` | 互联网医院-医嘱项等效单位查询接口 | Y |
| `W00000422` | `DosageDictInfo` | 互联网医院-一次用量字典查询接口 | Y |
| `W00000423` | `CMPrescTypeDictInfo` | 互联网医院-草药处方类型查询接口 | Y |
| `W00000401` | `DiagnosDictInfo` | 互联网医院-查询诊断字典（模糊查询） | Y |

## web.DHCENS.BLL.HLWYY.Method.DoctorLoginDepartment

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000404` | `CheckDoctorLoginDepartment` | 互联网医院-登录验证及获取默认登录科室信息 | Y |

## web.DHCENS.BLL.HLWYY.Method.GetOrderInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000413` | `OrderInfoNew` | 互联网医院-获取患者处方详情 | Y |

## web.DHCENS.BLL.HLWYY.Method.GetRecloc

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000411` | `GetRecloc` | 互联网医院-获取接收科室 | Y |

## web.DHCENS.BLL.HLWYY.Method.OrderListInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000412` | `GetOrdList` | 互联网医院-患者医嘱列表查询 | Y |

## web.DHCENS.BLL.HLWYY.Method.StopOrdItems

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000410` | `StopOEORDItemNew` | 互联网医院-停止医嘱 | Y |

## web.DHCENS.BLL.HX2Y.Method.GetAdmInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000238` | `GetInHopsitalInfo` | 160满意度-获取住院患者出院信息 | Y |
| `W00000239` | `GetAdmlInfo` | 160满意度-获取门急诊体检就诊信息 | Y |

## web.DHCENS.BLL.JUMPER.GetPregnantWomanInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000385` | `GetPatInfoByCardNo` | 胎监获取孕妇信息以及缴费状态-京柏医疗 | Y |

## web.DHCENS.BLL.JUMPER.Method.GetClinicInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000223` | `GetAdmByRegNo` | 妇幼通过登记号及时间获取就诊信息-京柏医疗 | Y |
| `W00000201` | `GetClinicInfoWeb` | 妇幼获取门诊患者挂号信息-京柏医疗 | Y |

## web.DHCENS.BLL.JUMPER.Method.SavePatBaseInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000202` | `SavePatBaseInfoWeb` | 妇幼保存门诊患者体征信息-京柏医疗 | Y |

## web.DHCENS.BLL.Lis.Method.GetPatInfoJY

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `S00000007` | `GetPatInfo` | 从第三方获取检验医嘱 | Y |

## web.DHCENS.BLL.Lis.Method.WeChatOA

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000431` | `GetWeChatReportInfo` | 微信公众号-获取检验报告提示信息 | Y |
| `W00000432` | `SendWeChatReportInfo` | 微信公众号-发送检验报告提示信息 | Y |

## web.DHCENS.BLL.MCall.Method.GetAdmInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000452` | `GetAdmInfo` | 口腔科-获取叫号信息 | Y |

## web.DHCENS.BLL.PE.Method.GetArcItmMast

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000367` | `GetArcItmMast` | 体检-获取项目 | Y |

## web.DHCENS.BLL.PE.Method.PERefundRequest

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000365` | `SendPERefundRequest` | 体检退费申请和作废医嘱 | Y |

## web.DHCENS.BLL.PE.Method.SendPEOrdInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000364` | `SendPEOrdMessageInfo` | 体检保存医嘱信息 | Y |

## web.DHCENS.BLL.PE.Method.SendPERegInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000363` | `SendPERegInfo` | 体检保存患者登记信息 | Y |

## web.DHCENS.BLL.Parking.FYInterface

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000359` | `GetPatInfoByRegNo` | 停车场调用获取患者就诊信息 | Y |

## web.DHCENS.BLL.PatBG.Common.Service

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000352` | `GetWardInAdm` | 获取病区患者信息 | Y |
| `W00000353` | `GetPatInAdm` | 获取在院信息 | Y |
| `W00000354` | `GetUserInfo` | 获取病区护士人员信息 | Y |

## web.DHCENS.BLL.PatBG.VivaCheck.Service

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000453` | `GetDeptInfo` | 血糖-获取科室病区信息 | Y |
| `W00000454` | `GetUserInfo` | 血糖-获取医护人员信息 | Y |
| `W00000455` | `GetWardInAdm` | 血糖-获取住院患者列表 | Y |
| `W00000456` | `GetPatInAdm` | 血糖-获取住院患者医嘱信息 | Y |

## web.DHCENS.BLL.SMS.Method.SMSServer

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000389` | `SendRisAppointment` | 医技预约-PACS系统推送微信公众号消息 | Y |
| `W00000327` | `SendSatisfaction` | 160满意度推送消息到微信公众号 | Y |
| `W00000210` | `GetSMSInfo` | 获取发送短信的json内容 | Y |

## web.DHCENS.BLL.SYDRG.Method.GetHosInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000308` | `GetLocList` | 康比特分组校验-2.1医院科室信息接口 | Y |
| `W00000309` | `GetCareProList` | 康比特分组校验-2.2医院人员信息接口 | Y |
| `W00000310` | `GetSettlePatInfo` | 康比特分组校验-2.3 结算患者信息查询接口 | Y |
| `W00000311` | `GetPatFeeListSum` | 康比特分组校验-2.4结算患者信息查询接口 | Y |
| `W00000312` | `GetPatFeeList` | 康比特分组校验-2.5病人收费汇总查询接口 | Y |
| `W00000313` | `GetDiagnosList` | 康比特分组校验-2.6患者诊断信息查询接口 | Y |
| `W00000314` | `GetOperationList` | 康比特分组校验-2.7患者操作信息查询接口 | Y |
| `W00000315` | `GetEncRecordCategory` | 康比特分组校验-2.8患者病历列表查询接口 | Y |
| `W00000316` | `GetEncRecordDetail` | 康比特分组校验-2.9患者病历详情查询接口 | Y |

## web.DHCENS.BLL.ShortMsg.Method.ShortMessageService

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000458` | `SendMessage3Party` | 第三方发送短信 | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBBed

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000283` | `GetWJYBBed` | 康比特-2.9医院床位字典 WJYB_Bed | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBDACharge

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000288` | `GetWJYBDACharge` | 康比特-2.14医嘱项目收费对照 WJYB_DACharge | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBDAClass

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000286` | `GetWJYBDAClass` | 康比特-2.12医嘱分类字典WJYB_DAClass | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBDAFreq

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000284` | `GetWJYBDAFreq` | 康比特-2.10医嘱频次字典WJYB_DAFreq | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBDAItem

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000287` | `GetWJYBDAItem` | 康比特-2.13医嘱项目字典 WJYB_DAItem | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBDAUSage

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000285` | `GetWJYBDAUSage` | 康比特-2.11医嘱用法字典WJYB_DAUSage | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBDept

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000275` | `GetWJYBDept` | 康比特-2.1医院科室信息WJYB_Dept | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBFeeType

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000279` | `GetWJYBFeeType` | 康比特-2.5医院费用（统计）分类字典字典 WJYB_FeeType | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBFinaType

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000278` | `GetWJYBFinaType` | 康比特-2.4医院费用财务分类 WJYB_FinaType | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBHospCharge

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000280` | `GetWJYBHospCharge` | 康比特-2.6医院医疗服务项目目录 WJYB_HospCharge | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBHospMate

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000282` | `GetWJYBHospMate` | 康比特-2.8医院收费材料目录 WJYB_HospMate | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBHospMedi

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000281` | `GetWJYBHospMedi` | 康比特-2.7医院药品目录WJYB_HospMedi | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBInpaAtDA

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000296` | `GetWJYBInpaAtDA` | 康比特-3.2.8在院医嘱WJYB_InpaAtDA | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBInpaAtDetail

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000292` | `GetWJYBInpaAtDetail` | 康比特-3.2.4在院费用明细WJYB_InpaAtDetail | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBInpaAtPat

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000289` | `GetWJYBInpaAtPat` | 康比特-3.2.1在院患者登记信息WJYB_InpaAtPati | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBInpaBed

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000299` | `GetWJYBInpaBed` | 康比特-3.2.11住院患者床位分配信息WJYB_InpaBed | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBInpaDA

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000297` | `GetWJYBInpaDA` | 康比特-3.2.9出院已结算医嘱WJYB_InpaDA | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBInpaDeposit

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000291` | `GetWJYBInpaDeposit` | 康比特-3.2.3住院预交金WJYB_InpaDeposit | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBInpaDetail

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000293` | `GetWJYBInpaDetail` | 康比特-3.2.5出院已结算费用明细WJYB_InpaDetail | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBInpaDiagnose

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000298` | `GetWJYBInpaDiagnose` | 康比特-3.2.10住院诊断信息WJYB_InpaDiagnose | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBInpaRefund

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000295` | `GetWJYBInpaRefund` | 康比特-3.2.7住院退费WJYB_InpaRefund | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBInpaSSPati

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000361` | `GetWJYBInpaSSPati` | 康比特-3.1手术患者信息记录表WJYB_InpaSSPati | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBInpaSettPat

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000290` | `GetWJYBInpaSettPat` | 康比特-3.2.2结算患者登记信息表WJYB_InpaSettPati | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBInpaSettle

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000294` | `GetWJYBInpaSettle` | 康比特-3.2.6住院结算WJYB_InpaSettle | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBInpaZFPati

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000360` | `GetWJYBInpaZFPati` | 康比特-2.2.1患者作废列表信息WJYB_InpaZFPati | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBLabExecute

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000307` | `GetWJYBLabExecute` | 康比特-7.1医技检验科室报告列表 WJYB_LabExecute | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBOperation

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000362` | `GetWJYBOperation` | 康比特-3.2实施手术信息表WJYB_Operation | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBOtpaCharge

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000302` | `GetWJYBOtpaCharge` | 康比特-4.2.3门诊患者收费表WJYB_OtpaCharge | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBOtpaDetail

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000303` | `GetWJYBOtpaDetail` | 康比特-4.2.4门诊费用明细WJYB_OtpaDetail | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBOtpaDiagnose

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000305` | `GetWJYBOtpaDiagnose` | 康比特-4.2.6门诊诊断信息WJYB_OtpaDiagnose | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBOtpaRecipel

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000368` | `GetWJYBOtpaRecipel` | 康比特-2.2.6获取门诊处方 | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBOtpaRefund

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000304` | `GetWJYBOtpaRefund` | 康比特-4.2.5门诊退费表 WJYB_OtpaRefund | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBOtpaRegister

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000300` | `GetWJYBOtpaRegister` | 康比特-4.2.1门诊挂号信息WJYB_OtpaRegister | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBOtpaUnRegister

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000301` | `GetWJYBOtpaUnRegister` | 康比特-4.2.2门诊退号WJYB_OtpaUnRegister | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBPatType

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000277` | `GetWJYBPatType` | 康比特-2.3医院病人类型 WJYB_PatiType | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBStaff

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000276` | `GetWJYBStaff` | 康比特-2.2医院人员信息 WJYB_Staff | Y |

## web.DHCENS.BLL.WJJXH.Method.GetWJYBYjExecute

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000306` | `GetWJYBYjExecute` | 康比特-6.1医技检查科室报告列表 WJYB_YjExecute | Y |

## web.DHCENS.BLL.Ward.Manage

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000391` | `GetPatientInfo` | 获取住院患者基本信息 | Y |

## web.DHCENS.BLL.YYKTPatSign.Interface

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000449` | `GetBaseInfo` | 医云康泰获取患者基本信息 | Y |
| `W00000450` | `GetTodayAdm` | 医云康泰获取当天所有有效就诊记录信息 | Y |
| `W00000451` | `SavePatSign` | 医云康泰保存患者体征数据 | Y |

## web.DHCENS.EnsWebServiceMethod

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000110` | `QuerySICompareDept` | 医保和院内科室对照 | Y |

## web.DHCENS.Method.Message

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000369` | `Send` | 发送消息 | Y |

## web.DHCENS.STBLL.BLOOD.METHOD.GetLISReportInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000197` | `LISTCReportInfo` | 获取检验标准码报告信息-输血系统 | Y |

## web.DHCENS.STBLL.BLOOD.METHOD.GetPatInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000198` | `GetPatAdmInfo` | 获取患者信息-输血系统 | Y |

## web.DHCENS.STBLL.BLOOD.METHOD.UpdateOrdersState

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000199` | `StopOrdItems` | 停医嘱-输血系统 | Y |

## web.DHCENS.STBLL.BOOKREG.METHOD.BookRegService

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000041` | `BookRegService` | 获取患者取号确认信息 | Y |

## web.DHCENS.STBLL.BOOKREG.METHOD.BookService

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000039` | `BookService` | 第三方系统向HIS预约就诊信息 | Y |
| `W00000040` | `CancelBookService` | 第三方系统向HIS取消预约就诊信息 | Y |

## web.DHCENS.STBLL.BOOKREG.METHOD.GetPatInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000043` | `GetPatInfo` | 第三方预约挂号系统查询患者基本信息 | Y |

## web.DHCENS.STBLL.BOOKREG.METHOD.ScheduleInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000121` | `GetOScheInfoPortal` | porta获取门诊排班信息 | Y |
| `W00000037` | `GetScheduleInfo` | 获取门诊排班信息 | Y |
| `W00000038` | `SynChangeScheduleStatusInfo` | 排班状态变更信息 | Y |

## web.DHCENS.STBLL.DICT.METHOD.CTARCItmMast

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `ARC_ItmMast` | `CTARCItmMast` | 获取医嘱项目字典信息 | Y |

## web.DHCENS.STBLL.DICT.METHOD.CTBed

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `PAC_Bed` | `CTBed` | 获取床位字典信息 | Y |

## web.DHCENS.STBLL.DICT.METHOD.CTBedType

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `PAC_BedType` | `CTBedType` | 获取床位类型字典信息 | Y |

## web.DHCENS.STBLL.DICT.METHOD.CTCareProv

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `SS_User` | `CTCareProv` | 获取用户信息 | Y |
| `W00000405` | `CTCareProvNew` | 互联网医院-获取医生基本信息 | Y |
| `W00000237` | `GetCTCareProv` | 160满意度-获取医护人员信息 | Y |

## web.DHCENS.STBLL.DICT.METHOD.CTCategory

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `OEC_OrderCategory` | `CTCategory` | 获取医嘱大类字典信息 | Y |

## web.DHCENS.STBLL.DICT.METHOD.CTChildCategory

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `ARC_ItemCat` | `CTChildCategory` | 获取医嘱子类字典信息 | Y |

## web.DHCENS.STBLL.DICT.METHOD.CTDept

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `CT_Loc` | `CTDept` | 获取科室字典信息 | Y |
| `W00000236` | `GetCTDept` | 160满意度-获取科室信息 | Y |

## web.DHCENS.STBLL.DICT.METHOD.CTDeptCareProv

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `RB_Resource` | `CTDeptCareProv` | 获取科室和医护人员关系 | Y |

## web.DHCENS.STBLL.DICT.METHOD.CTDiagnose

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `MRC_ICDDx` | `CTDiagnose` | 获取诊断信息 | Y |

## web.DHCENS.STBLL.DICT.METHOD.CTDiagnoseType

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `MRC_DiagnosType` | `CTDiagnoseType` | 获取诊断类型信息 | Y |

## web.DHCENS.STBLL.DICT.METHOD.CTDoseForms

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `PHC_Form` | `CTDoseForms` | 获取剂型字典信息 | Y |

## web.DHCENS.STBLL.DICT.METHOD.CTDoseUnit

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `CT_Uom` | `CTDoseUnit` | 获取剂量单位字典信息 | Y |

## web.DHCENS.STBLL.DICT.METHOD.CTDuration

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `PHC_Duration` | `CTDuration` | 获取疗程字典信息 | Y |

## web.DHCENS.STBLL.DICT.METHOD.CTFreq

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `PHC_Freq` | `CTFreq` | 获取频次字典信息 | Y |

## web.DHCENS.STBLL.DICT.METHOD.CTHospital

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `CT_Hospital` | `CTHospital` | 获取院区字典信息 | Y |

## web.DHCENS.STBLL.DICT.METHOD.CTInstr

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `PHC_Instruc` | `CTInstr` | 获取用药途径字典信息 | Y |

## web.DHCENS.STBLL.DICT.METHOD.CTOperation

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `ORC_Operation` | `CTOperation` | 获取手术名称字典信息 | Y |

## web.DHCENS.STBLL.DICT.METHOD.CTOrderStatus

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `OEC_OrderStatus` | `CTOrderStatus` | 获取医嘱状态字典信息 | Y |

## web.DHCENS.STBLL.DICT.METHOD.CTPatPosition

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `PAC_AdmReason` | `PatPosition` | 获取患者费别字典信息 | Y |

## web.DHCENS.STBLL.DICT.METHOD.CTPriority

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `OEC_Priority` | `CTPriority` | 获取医嘱类型字典信息 | Y |

## web.DHCENS.STBLL.DICT.METHOD.CTResultStatus

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `OEC_Order_AdminStatus` | `CTResultStatus` | 获取医嘱结果状态字典信息 | Y |

## web.DHCENS.STBLL.DICT.METHOD.CTRoom

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `PAC_Room` | `CTCTRoom` | 获取房间信息 | Y |

## web.DHCENS.STBLL.DICT.METHOD.CTTarCate

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `DHC_TarCate` | `CTTarCate` | 获取收费大类字典信息 | Y |

## web.DHCENS.STBLL.DICT.METHOD.CTTarItem

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `DHC_TarItem` | `CTTarItem` | 获取收费项目字典信息 | Y |

## web.DHCENS.STBLL.DICT.METHOD.CTTarSubCate

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `DHC_TarSubCate` | `CTTarSubCate` | 获取收费子类字典信息 | Y |

## web.DHCENS.STBLL.DICT.METHOD.CTWard

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `PAC_Ward` | `CTWard` | 获取病区字典信息 | Y |

## web.DHCENS.STBLL.DICT.METHOD.DictMessageInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000099` | `DictMessageInfo` | 获取HIS字典信息 | Y |

## web.DHCENS.STBLL.DICTNew.METHOD.DictMessageInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W0000DICTN` | `DictMessageInfo` | 获取HIS字典信息-json流 | Y |

## web.DHCENS.STBLL.DICTNew.METHOD.MainDataCommon

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000459` | `GetMainDictInfoNew` | 统一获取字典信息 | Y |

## web.DHCENS.STBLL.DOCU.METHOD.DocumentAccess

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `S00000045` | `DocumentAccess` | 文档调阅 | Y |
| `W00000211` | `DocumentAccess` | 文档调阅 | Y |

## web.DHCENS.STBLL.DOCU.METHOD.DocumentRetrieval

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `S00000044` | `DocuRetrieval` | 文档检索 | Y |
| `W00000196` | `DocuRetrieval` | 文档检索 | Y |

## web.DHCENS.STBLL.DOCU.METHOD.HOSDocument

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000117` | `HOSAbstractDocument` | 文档摘要信息获取 | Y |

## web.DHCENS.STBLL.DOCU.METHOD.HOSDocumentContent

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000118` | `DocumentContent` | 文档体信息获取 | Y |

## web.DHCENS.STBLL.DOCU.METHOD.SaveDocumentContent83

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000100` | `SaveXmlResult` | 文档注册 | Y |

## web.DHCENS.STBLL.DRUG.METHOD.DrugPackageLab

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000142` | `DrugPackageLab` | 获取住院药袋信息 | Y |

## web.DHCENS.STBLL.DRUG.METHOD.DrugStockAddress

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000079` | `DrugStockAddress` | 药品货位信息 | Y |

## web.DHCENS.STBLL.DRUG.METHOD.IPDrugOrdInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000086` | `GetIPDrugInfo` | 获取住院发药机发药信息 | Y |

## web.DHCENS.STBLL.DRUG.METHOD.Inventory

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000023` | `GetInventoryByDeptOrRowId` | 获取药品库存信息 | Y |

## web.DHCENS.STBLL.DRUG.METHOD.MedVerifyStatus

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000089` | `SaveMedVerifyStatus` | 接受合理用药审核结果 | Y |

## web.DHCENS.STBLL.DRUG.METHOD.OPDrugOrdInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000080` | `DispenseOPDrugInfo` | 获取门诊发药机发药信息 | Y |

## web.DHCENS.STBLL.DRUG.METHOD.PharmaceutStatus

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `StartStopDrugInfo` | `PharmaceutStatus` | HIS系统门诊发药电子处方（开始发药指令202）；HIS系统门诊发药电子处方（结束发药指令203） | Y |

## web.DHCENS.STBLL.DRUG.METHOD.PrescriptionInfor

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000090` | `SavePrescriptionInfor` | 接受退药信息 | Y |

## web.DHCENS.STBLL.DRUG.METHOD.UpdatePharmaceutStatus

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000146` | `UpdatePharmaceutStatus` | 保存配药信息（配药状态：301配药完成，302取消配药，303重分窗口） | Y |

## web.DHCENS.STBLL.EMPI.METHOD.GetVitalSignInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000091` | `SaveVitalSignInfo` | 查询生命体征信息 | Y |

## web.DHCENS.STBLL.EMPI.METHOD.PAAdm

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000002` | `IpPAAdm` | 获取患者住院登记信息 | Y |
| `W00000003` | `OpPAAdm` | 获取患者挂号信息 | Y |
| `W00000011` | `OpPAAdmCancel` | 获取退号信息 | Y |
| `W00000013` | `OutChargePAAdm` | 获取出院信息 | Y |
| `W00000012` | `IpPAAdmCancel` | 获取取消登记信息 | Y |
| `W00000014` | `OutChargePAAdmCancel` | 获取取消出院信息 | Y |

## web.DHCENS.STBLL.EMPI.METHOD.PAAllergy

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000111` | `PAAllergyInfo` | 获取过敏记录信息 | Y |

## web.DHCENS.STBLL.EMPI.METHOD.PADiagnose

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000329` | `DeleteDiagnoses` | 获取删除诊断信息 | Y |
| `W00000024` | `SaveDiagnoses` | 第三方系统录入诊断信息 | Y |
| `W00000036` | `GetDiagnoses` | 获取诊断信息 | Y |

## web.DHCENS.STBLL.EMPI.METHOD.PaCard

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000006` | `PaCard` | 获取卡信息 | Y |
| `W00000044` | `PaCardByRegNo` | 根据病人ID获取患者就诊卡信息 | Y |

## web.DHCENS.STBLL.EMPI.METHOD.PatTransAdm

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000017` | `TransDept` | 转科信息 | Y |

## web.DHCENS.STBLL.EMPI.METHOD.Patient

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000257` | `PAPatientByRegNo` | 获取患者基本信息(通过登记号) | Y |
| `W00000001` | `PAPatient` | 获取患者基本信息 | Y |
| `W00000042` | `PAPatientByRegNo` | 根据登记号获取病人基本信息 | Y |

## web.DHCENS.STBLL.EMPI.METHOD.SMSMessageInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000092` | `MessageInfo` | 获取短信信息 | Y |

## web.DHCENS.STBLL.HIGHMATERIAL.METHOD.ConsumablesBarcode

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000088` | `ConsumablesBarcode` | 接收高值耗材条码信息 | Y |

## web.DHCENS.STBLL.HIGHMATERIAL.METHOD.GetHighValueConsumOrd

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000087` | `HighValueOEOrder` | 根据医嘱号获取高值耗材医嘱 | Y |

## web.DHCENS.STBLL.LIS.METHOD.LinkLabNoWithOrdRowId

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000372` | `LaboratoryBarcodeALL` | 接收检验条码信息(同步) | Y |
| `W00000022` | `LaboratoryBarcode` | 接收检验条码信息 | Y |

## web.DHCENS.STBLL.LIS.METHOD.LisAccept

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000124` | `LisAccept` | 标本核收 | Y |

## web.DHCENS.STBLL.LIS.METHOD.LisCancelAccept

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000125` | `LisCancelAccept` | 取消核收 | Y |

## web.DHCENS.STBLL.LIS.METHOD.LisCriticalValues

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000330` | `SaveCriticalValues` | 检验危急值接收 | Y |
| `W00000020` | `SaveCriticalValues` | 保存危机值 | Y |
| `W00000035` | `SendCriValueStatus` | 检验危急值查看状态 | Y |

## web.DHCENS.STBLL.LIS.METHOD.OEOrderStatus

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000345` | `RejectInfo` | 检验标本拒收处理信息 | Y |
| `W00000009` | `ExecuteStatus` | 接收标本信息 | Y |
| `W00000010` | `RejectStatus` | 拒收标本信息 | Y |
| `W00000021` | `SpecimenRevocation` | 踢回标本 | Y |

## web.DHCENS.STBLL.LIS.METHOD.PatLisOrdInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000159` | `GetPatOrdListNew` | 根据就诊号获取检验申请单 | Y |
| `W00000161` | `GetPatOrdListFPlat` | 根据病区或者登记号获取检验申请单 | Y |
| `W00000123` | `GetPatOrdList` | 第三方获取检验申请单信息 | Y |
| `W00000018` | `SendLisInfoByOrdRowID` | 获取检验医嘱信息 | Y |

## web.DHCENS.STBLL.LIS.METHOD.ReportCancel

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000127` | `ReportCancel` | 取消检验报告 | Y |

## web.DHCENS.STBLL.LIS.METHOD.ReportVerify

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000126` | `ReportVerify` | 生成检验报告 | Y |

## web.DHCENS.STBLL.LIS.METHOD.SendOrderInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `SENDCOLLECTIONSPEC` | `SendPatOrder` | 采集检验标本 | Y |

## web.DHCENS.STBLL.LIS.METHOD.SpecimenStatus

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000357` | `SendSpecimenStatus` | 获取检验标本状态 | Y |

## web.DHCENS.STBLL.MANAGE.MergeInstance

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000158` | `GetOEORIInfoList` | 获取医嘱明细信息-公共接口 | Y |
| `W00000153` | `CheckArrears` | 判断病人是否欠费 | Y |
| `W00000154` | `GetMessageNotify` | 接收消息 | Y |
| `W00000155` | `CheckInHospital` | 判断病人是否在院 | Y |
| `W00000156` | `CheckIfHisUser` | 判断是否HIS用户 | Y |

## web.DHCENS.STBLL.MEDADE.METHOD.ADEInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W000MedAdeQuery` | `GetPatAdmInfo` | 患者（基本信息就诊信息）同步 | Y |
| `W000MedAdePrescInfo` | `SynPrescInfo` | 药品信息同步 | Y |
| `W000MedAdeInfusion` | `SynPatInfusionInfo` | 输血信息同步 | Y |
| `W000MedAdeNurInfo` | `SynchNurInfor` | 护理信息同步 | Y |

## web.DHCENS.STBLL.Method.PostReportInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `SendRISReport` | `RISReportInfo` | 推送检查、病理报告 | Y |
| `SendLISReport` | `LISReportInfo` | 推送检验报告 | Y |
| `QryLISRptIDByLabNo` | `QryLISRptIDByLabNo` | 根据检验号获取报告ID，针对部分报告，逗号分割多个 | Y |
| `GetHistoryResultMTHD` | `GetHistoryResultMTHD` | 标本历史结果查询 | Y |
| `GetLabInfo` | `GetLabInfo` | 根据医嘱号返回体检所需检验信息 | Y |
| `QryLISOrdIDByRpt` | `QryLISOrdIDByRpt` | 通过检验报告ID获取医嘱ID | Y |

## web.DHCENS.STBLL.Method.QueryReportByID

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000370` | `GetReportInfo` | 获取检查结果信息 | Y |
| `W00000371` | `GetLISReportInfo` | 获取检验结果信息 | Y |

## web.DHCENS.STBLL.Method.ReturnSystemStatus

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000147` | `ReturnSystemStatusCircle` | 闭环状态回传 | Y |

## web.DHCENS.STBLL.Method.SystemStatusInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `DeleteSystemStatus` | `DeleteSystemStatus` | 取消审核删除检验报告 | Y |
| `UpdateSystemStatus` | `UpdateSystemStatus` | 更新检验检查状态 | Y |
| `QuerySystemStatus` | `QuerySystemStatus` | 获取检验检查当前状态 | Y |
| `QuerySystemStatusLog` | `QuerySystemStatusLog` | 获取检验检查状态日志 | Y |

## web.DHCENS.STBLL.OPERATION.Method.CISANOperAppInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000145` | `SendOperApp` | 推送手术申请信息 | Y |

## web.DHCENS.STBLL.OPERATION.Method.GetOperationAppInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000219` | `GetOperation` | 获取手术记录-院感 | Y |
| `W00000220` | `GetDBTimes` | 获取大便登记次数-院感 | Y |
| `W00000221` | `GetBabyWeight` | 获取新生儿体重-院感 | Y |
| `W00000222` | `GetTemperature` | 获取体温-院感 | Y |
| `W00000015` | `SendOperApp` | 获取手术申请信息 | Y |

## web.DHCENS.STBLL.OPERATION.Method.OperationSchedule

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000119` | `OperationAppInfoPortal` | 获取portal所需的手术排班信息 | Y |

## web.DHCENS.STBLL.OPERATION.Method.OperationTimeline

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000143` | `EnterOperationTheatre` | 入手术间 | Y |
| `W00000144` | `LeaveOperationTheatre` | 出手术间 | Y |
| `W00000025` | `EnterOperationRoom` | 入手术室 | Y |
| `W00000026` | `OperationBegan` | 手术开始 | Y |
| `W00000027` | `AnesthesiaBegan` | 麻醉开始 | Y |
| `W00000028` | `AnesthesiaOver` | 麻醉结束 | Y |
| `W00000029` | `OperationOver` | 手术结束 | Y |
| `W00000030` | `LeaveOperationRoom` | 离开手术室 | Y |
| `W00000031` | `EnterRecoveryRoom` | 入恢复室 | Y |
| `W00000032` | `LeaveRecoveryRoom` | 离开恢复室 | Y |

## web.DHCENS.STBLL.OPERATION.Method.PostOperationRegister

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000033` | `SendPostOperRegInfo` | 术后登记 | Y |

## web.DHCENS.STBLL.ORDER.METHOD.AddOrdItems

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000409` | `AddOEOrder` | 互联网医院-插入医嘱 | Y |
| `W00000016` | `AddOEOrder` | 第三方补录医嘱信息 | Y |

## web.DHCENS.STBLL.ORDER.METHOD.OEOrder

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000004` | `OEOrder` | 获取患者医嘱信息 | Y |
| `W00000005` | `GetOrdersState` | 获取医嘱状态信息 | Y |

## web.DHCENS.STBLL.ORDER.METHOD.OEOrderResultStatus

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000095` | `InsertOEOrdResultObjWait` | 候诊中 | Y |
| `W00000096` | `InsertOEOrdResultObjCheck` | 检查中 | Y |
| `W00000097` | `InsertOEOrdResultObjPrint` | 打印完 | Y |
| `W00000098` | `InsertOEOrdResultObjDelete` | 已删除 | Y |

## web.DHCENS.STBLL.ORDER.METHOD.OrdersBillStatus

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000019` | `GetOrdersState` | 获取医嘱收费状态信息 | Y |

## web.DHCENS.STBLL.ORDER.METHOD.StopOrdItems

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000034` | `UpdateOrdersState` | 第三方系统修改医嘱状态 | Y |

## web.DHCENS.STBLL.PIS.METHOD.GetPisAppInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000139` | `GetPatOrdList` | 第三方获取病理申请单 | Y |

## web.DHCENS.STBLL.PIS.METHOD.GetPisAppListInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000007` | `SendAppBillNew` | 获取病理申请单 | Y |

## web.DHCENS.STBLL.PIS.METHOD.PisDoCancel

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000141` | `RisDoCancel` | 病理取消检查 | Y |

## web.DHCENS.STBLL.PIS.METHOD.PisInDiag

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000140` | `InDiag` | 诊断中 | Y |

## web.DHCENS.STBLL.PIS.METHOD.UpdateOrdersState

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000152` | `StopOrdItems` | 撤销医嘱 | Y |

## web.DHCENS.STBLL.RIS.METHOD.GetRisAppInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000162` | `GetPatRisAppByOrdDep` | 心电批量获取申请单 | Y |
| `W00000094` | `SendAppBillByStudyNoNew` | 获取检查申请单根据医嘱号 | Y |
| `W00000008` | `SendAppBillByStudyNo` | 获取检查申请单根据检查号 | Y |
| `W00000128` | `GetPatOrdList` | 第三方获取检查申请单信息 | Y |

## web.DHCENS.STBLL.RIS.METHOD.ReportCancel

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000137` | `ReportCancel` | 取消检查报告 | Y |

## web.DHCENS.STBLL.RIS.METHOD.ReportComplete

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000136` | `ReportComplete` | 生成检查报告 | Y |

## web.DHCENS.STBLL.RIS.METHOD.RisBook

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000129` | `RisBookInfo` | 检查预约 | Y |

## web.DHCENS.STBLL.RIS.METHOD.RisBookCancel

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000130` | `RisBookCancelInfo` | 取消检查预约 | Y |

## web.DHCENS.STBLL.RIS.METHOD.RisComplete

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000134` | `RisComplete` | 检查完成 | Y |

## web.DHCENS.STBLL.RIS.METHOD.RisCriticalValues

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000328` | `SendRISCriValueStatus` | 检查危急值查看状态 | Y |
| `W00000138` | `SaveCriticalValues` | 保存检查危急值 | Y |
| `W00000151` | `SendRISCriValueStatus` | 危急值处理信息 | Y |

## web.DHCENS.STBLL.RIS.METHOD.RisDoCancel

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000135` | `RisDoCancel` | 取消检查 | Y |

## web.DHCENS.STBLL.RIS.METHOD.RisImage

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000132` | `RisImage` | 检查图像 | Y |

## web.DHCENS.STBLL.RIS.METHOD.RisImageCancel

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000133` | `RisImageCancel` | 取消图像 | Y |

## web.DHCENS.STBLL.RIS.METHOD.RisRegistry

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000131` | `RisRegistry` | 检查登记 | Y |

## web.DHCENS.STBLL.RIS.METHOD.RisRegistryCancel

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000081` | `RisRegistryCancel` | 取消检查登记 | Y |

## web.DHCENS.STBLL.UTIL.EnsInterface

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `SENDCRB001` | `InsertEnsInterface` | 患者基本信息表数据操作 | Y |
| `SENDCRB002` | `InsertEnsInterface` | 门（急）诊留观记录表数据操作 | Y |
| `SENDCRB003` | `InsertEnsInterface` | 门（急）诊病例表数据操作 | Y |
| `SENDCRB004` | `InsertEnsInterface` | 诊断活动信息表数据操作 | Y |
| `SENDCRB005` | `InsertEnsInterface` | 住院日常病程记录表数据操作 | Y |
| `SENDCRB006` | `InsertEnsInterface` | 入院记录表数据操作 | Y |
| `SENDCRB007` | `InsertEnsInterface` | 出院记录表数据操作 | Y |
| `SENDCRB008` | `InsertEnsInterface` | 住院首次病程记录表数据操作 | Y |
| `SENDCRB009` | `InsertEnsInterface` | 传报卡信息表数据操作 | Y |
| `SENDCRB010` | `InsertEnsInterface` | 医嘱信息表数据操作 | Y |
| `SENDCRB011` | `InsertEnsInterface` | ?医嘱信息细表数据操作 | Y |
| `SENDCRB012` | `InsertEnsInterface` | 住院病案首页表数据操作 | Y |
| `SENDWJZINFO` | `InsertEnsInterface` | 危急值查看状态 | N |
| `S00000055` | `InsertEnsInterface` | 发送删除诊断信息 | Y |
| `SENDLISAPPBILLINFO` | `InsertEnsInterface` | 发送检验申请单 | Y |
| `SendRISReportStruc` | `InsertEnsInterface` | 发送检查结果信息 | Y |
| `SendLISReportStruc` | `InsertEnsInterface` | 发送检验结果信息 | Y |
| `SENDPERISAPPINFO` | `InsertEnsInterface` | 发送体检患者检查申请单 | Y |
| `SENDPEPISAPPINFO` | `InsertEnsInterface` | 发送体检患者病理申请单 | Y |
| `SENDPELISAPPINFO` | `InsertEnsInterface` | 发送体检患者检验申请单 | Y |
| `S00000043` | `InsertEnsInterface` | 发送短信信息给第三方短信平台系统 | Y |
| `SENDSMSINFO` | `InsertEnsInterface` | 获取发送短信的json内容 | Y |
| `SendWechatOAReport` | `InsertEnsInterface` | 发送报告信息至微信公众号 | Y |
| `SENDOEDTInfoToHQMS` | `InsertEnsInterface` | HQMSTS--获取门急诊诊疗信息 | Y |
| `SENDCRB013` | `InsertEnsInterface` | 生命体征护理记录单 | Y |
| `SENDCRB014` | `InsertEnsInterface` | 传染病预警死亡证 | Y |
| `SENDCRB015` | `InsertEnsInterface` | 删除传报卡信息表数据操作 | Y |
| `S00000047` | `InsertEnsInterface` | 顶级\一级科室信息修改 | Y |
| `S00000048` | `InsertEnsInterface` | 检验标本接收 | Y |
| `S00000049` | `InsertEnsInterface` | 检验标本拒收处理 | Y |
| `S00000046` | `InsertEnsInterface` | 检验报告回传 | Y |
| `S00000050` | `InsertEnsInterface` | 患者就诊到达（吉大三院） | Y |
| `S00000051` | `InsertEnsInterface` | 患者就诊结束（吉大三院） | Y |
| `S00000052` | `InsertEnsInterface` | 电子病历产生病历pdf文档 | Y |
| `S00000021` | `InsertEnsInterface` | 待审核抗菌药物（状态：申请、审核） | Y |
| `S00000018` | `InsertEnsInterface` | 传染病提示（状态：上报、审核、退回、删除） | Y |
| `S00000019` | `InsertEnsInterface` | 医院感染提示（状态：上报、审核、退回、删除） | Y |
| `S00000023` | `InsertEnsInterface` | 特殊患者（状态：标记、取消、终结） | Y |
| `S00000011` | `InsertEnsInterface` | 会诊申请（状态：完成、执行） | Y |
| `S00000012` | `InsertEnsInterface` | 生活能力评估完成 | Y |
| `S00000013` | `InsertEnsInterface` | 过敏记录填写完成 | Y |
| `S00000014` | `InsertEnsInterface` | 跌倒报告填写完成 | Y |
| `S00000015` | `InsertEnsInterface` | 压疮评估填写完成 | Y |
| `S00000024` | `InsertEnsInterface` | 药房拒绝发药 | Y |
| `S00000017` | `InsertEnsInterface` | 检验拒收检验标本 | Y |
| `S00000022` | `InsertEnsInterface` | 病历质控消息（状态：新增、回复） | Y |
| `SENDADMCANCELOUTINFO` | `InsertEnsInterface` | 病人取消出院（最终结算） | Y |
| `SENDFINANCIALSETTLEMENTINFO` | `InsertEnsInterface` | 财务结算 | Y |
| `SENDCANCELFINANCIALSETTLEMENTINFO` | `InsertEnsInterface` | 取消财务结算 | Y |
| `SENDOPERATIONAPPLYINFO` | `InsertEnsInterface` | 病人手术申请信息 | Y |
| `SENDCANCELAPPTSCHEDULEINFO` | `InsertEnsInterface` | 发送HIS取消挂号预约信息 | Y |
| `SENDTAKEAPPTSCHEDULEINFO` | `InsertEnsInterface` | 发送HIS已经取号信息 | Y |
| `STOPAPPTSCHEDULEINFO` | `InsertEnsInterface` | HIS排班资源信息更改（停诊） | Y |
| `CHANGEAPPTSCHEDULEINFO` | `InsertEnsInterface` | HIS排班资源信息更改（替诊） | Y |
| `STOPORDERITEMINFO` | `InsertEnsInterface` | 停医嘱 | Y |
| `SENDNURORDITEMINFO` | `InsertEnsInterface` | 护士执行医嘱 | Y |
| `SENDNURCANCELORDITEMINFO` | `InsertEnsInterface` | 护士撤销执行医嘱 | Y |
| `SENDDOCORDITEMINFO` | `InsertEnsInterface` | 医生发送病人医嘱信息 | Y |
| `SENDTRANSOUTDEPTINFO` | `InsertEnsInterface` | 发送病人转科信息 | Y |
| `SENDTRANSOUTBEDINFO` | `InsertEnsInterface` | 发送病人转床信息 | Y |
| `SENDEMERGENCYADMFIRSTPAGEINFO` | `InsertEnsInterface` | 发送急诊病人急诊首页信息 | Y |
| `SENDADDDRUGINFO` | `InsertEnsInterface` | 新增药品信息 | Y |
| `SENDUPDATEDRUGINFO` | `InsertEnsInterface` | 修改药品信息 | Y |
| `SENDPRINTLABINFO` | `InsertEnsInterface` | 打印检验条码 | Y |
| `S00000034` | `InsertEnsInterface` | 危重病人 | Y |
| `S00000035` | `InsertEnsInterface` | 检查取消报告 | Y |
| `S00000036` | `InsertEnsInterface` | 检验取消报告 | Y |
| `S00000037` | `InsertEnsInterface` | 电子病历产生病历图片 | Y |
| `S00000038` | `InsertEnsInterface` | 特殊患者标记 | Y |
| `SENDOPREGINFO` | `InsertEnsInterface` | 挂号 | Y |
| `SENDOPRREGINFO` | `InsertEnsInterface` | 退号 | Y |
| `SENDADMFIRSTCATALOGINFO` | `InsertEnsInterface` | 病案编目 | Y |
| `SENDADDACCMANAGERINFO` | `InsertEnsInterface` | 新建账户 | Y |
| `SENDADDCARDINFO` | `InsertEnsInterface` | 新建卡 | Y |
| `SENDUPDATECARDINFO` | `InsertEnsInterface` | 卡信息修改 | Y |
| `SENDLOSTCARDINFO` | `InsertEnsInterface` | 卡挂失 | Y |
| `SENDREADDCARDINFO` | `InsertEnsInterface` | 补卡 | Y |
| `S00000025` | `InsertEnsInterface` | 病人出院，主治医生签写病历后 | Y |
| `S00000026` | `InsertEnsInterface` | 病人出院，主治医生签写病历后，第二级签完字或第三级签完字 | Y |
| `S00000016` | `InsertEnsInterface` | 发送检查报告 | Y |
| `S00000029` | `InsertEnsInterface` | 欠费信息 | Y |
| `S00000027` | `InsertEnsInterface` | 护士录入体温时，体温超过37.2为体温异常，需调用平台组方法 | Y |
| `S00000028` | `InsertEnsInterface` | 待审核医嘱 | Y |
| `S00000030` | `InsertEnsInterface` | 未取药医嘱 | Y |
| `S00000031` | `InsertEnsInterface` | 待测体温 | Y |
| `S00000039` | `InsertEnsInterface` | HIS基础代码字典表修改 | Y |
| `S00000040` | `InsertEnsInterface` | 传染病漏报消息 | Y |
| `S00000041` | `InsertEnsInterface` | 医院感染漏报消息 | Y |
| `SENDACTIVECARDINFO` | `InsertEnsInterface` | 卡激活 | Y |
| `SENDRETREATCARDINFO` | `InsertEnsInterface` | 退卡 | Y |
| `SENDCHECKHEALOPCHARGEINFO` | `InsertEnsInterface` | 体检病人结算 | Y |
| `SENDCHECKHEALOPREFUNDCHARGEINFO` | `InsertEnsInterface` | 体检病人退费 | Y |
| `SENDOPERATIONSCHEDULEINFO` | `InsertEnsInterface` | 手术排班（新增） | Y |
| `S00000032` | `InsertEnsInterface` | 超时执行 | Y |
| `S00000033` | `InsertEnsInterface` | 未执行医嘱 | Y |
| `S00000001` | `InsertEnsInterface` | 物资状态变更 | Y |
| `S00000002` | `InsertEnsInterface` | 门诊预约 | Y |
| `S00000003` | `InsertEnsInterface` | HIS排班资源信息更改（新增） | Y |
| `S00000005` | `InsertEnsInterface` | RIS系统登记后发送检查申请信息 | Y |
| `S00000004` | `InsertEnsInterface` | 发送检验报告信息 | Y |
| `S00000006` | `InsertEnsInterface` | RIS系统取消登记后发送检查申请信息 | Y |
| `S00000042` | `InsertEnsInterface` | 住院病人发送病理申请单 | Y |
| `S00000010` | `InsertEnsInterface` | 发送患者诊断信息 | Y |
| `S00000020` | `InsertEnsInterface` | 危急值提示（状态：新增、确认） | Y |
| `S00000053` | `InsertEnsInterface` | 电子病历产生病历XML文档 | Y |
| `S00000054` | `InsertEnsInterface` | 护士领药审核和撤销审核 | Y |

## web.DHCjlzForQHD

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000408` | `GetIncilQtyList` | 互联网医院-可开药品查询 | Y |

## web.DHCzyrForQHD

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000419` | `GetOrdStatus` | 互联网医院-药品发药状态查询 | Y |

## web.HIPMessageServer

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000082` | `HIPCTDept` | his接收科室字典信息 | Y |
| `W00000083` | `HIPCTCareProv` | his接收人员字典信息 | Y |

## web.NurSensThirdInter

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000457` | `SavePerSta` | HRP-保存人员状态信息 | Y |

## web.SaveMaterialDataInfo

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000084` | `SaveManagerDataInfo` | his接收物资字典信息 | Y |

## web.ServiceforTCC

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000212` | `GetRegNo` | 根据手机号或者身份证号获取登记号列表串-停车 | Y |
| `W00000213` | `TCCService` | 根据登记号判断是否缴费-停车 | Y |
| `W00000214` | `SaveParkingFee` | 回传停车缴费减免信息-停车 | Y |

## web.UDHCOPINVPrtData12

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000263` | `getEleInvDataInfoSlefByPrt` | 获取门诊电子票据链接 | Y |

## web.VerifiacationEvent

### 方法清单

| 接口编码 | 方法名 | 功能描述 | 状态 |
|----------|--------|----------|:---:|
| `W00000101` | `CreateEventCodeApp` | 获取验证码 | Y |
| `W00000102` | `CheckEventCodeApp` | 验证码校验 | Y |
| `W00000116` | `CreateEventCardApp` | 自助机建卡时获取验证码 | Y |
