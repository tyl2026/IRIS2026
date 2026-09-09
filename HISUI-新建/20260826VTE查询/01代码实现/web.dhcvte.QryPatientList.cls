/// desc: VTE质控 — 按指标代码查询患者明细列表
/// author：tyl2026
/// date：2026-06-12
/// modify: 对接内网 NurMp.DHCTempMultData 实际表结构
/// modify: 增加在院/出院明细查询切换 (QueryType: I=在院全量, D=出院按出院日期, 默认)
/// 
/// 数据源:
///   NurMp.DHCTempMultData — 护理评估记录表
///   ^PAADM                — 就诊记录
///   ^PAPER                — 患者主索引
///   ^CTLOC                — 科室
Class web.dhcvte.QryPatientList Extends %RegisteredObject [ Not ProcedureBlock ]
{

/// desc: 按指标代码查询患者明细列表（分页）
/// d ##class(%ResultSet).RunQuery("web.dhcvte.QryPatientList","QryByIndicator","2026-01-01","2026-06-12","","A01","D")
Query QryByIndicator(SttDate As %String, EndDate As %String, LocID As %String, IndicatorCode As %String, QueryType As %String = "D") As %Query(ROWSPEC = "RegNo:%String,PatName:%String,Sex:%String,Age:%String,LocDesc:%String,WardDesc:%String,AdmDate:%String,DisDate:%String,VTERiskLevel:%String,BleedRiskLevel:%String,Diag:%String,VTEScore:%Integer,DrugPrev:%String,MechPrev:%String") [ SqlProc ]
{
}

ClassMethod QryByIndicatorExecute(ByRef qHandle As %Binary, SttDate As %String, EndDate As %String, LocID As %String, IndicatorCode As %String, QueryType As %String = "D") As %Status
{
    s repid = $I(^CacheTemp)
    s ind = 1
    s qHandle = $lb(0, repid, 0)

    if IndicatorCode = "" {
        s qHandle = $lb(0, repid, 0)
        q $$$OK
    }

    s sttDateH = ##class(websys.Conversions).DateHtmlToLogical(SttDate)
    s endDateH = ##class(websys.Conversions).DateHtmlToLogical(EndDate)
    if (sttDateH = "")||(endDateH = "")||(sttDateH > endDateH) {
        s qHandle = $lb(0, repid, 0)
        q $$$OK
    }
    if (endDateH - sttDateH) > 31 {
        s endDateH = sttDateH + 31
    }

    #; 统计范围: I=在院(当前在院患者全量, 日期不参与筛选), D=出院(按出院日期, 默认)
    if QueryType '= "I" {
        s QueryType = "D"
    }

    #; 构建科室过滤
    if LocID '= "" {
        k ^||TEMPVTELoc($J)
        for i = 1:1:$l(LocID, ",") {
            s one = $p(LocID, ",", i)
            if one '= "" {
                s ^||TEMPVTELoc($J,one) = ""
            }
        }
    }

    #; ========================================================================
    #; 采集 VTE 评估数据（两种表单，多次评估取最大评分）
    #; ========================================================================
    s emrCodeStr = "DHCNURJMXSSSZPGLR^DHCNURJMXSLR^DHCNURJMXSSSZPGLR^DHCNURCHPGLR"
    for ei = 1:1:$l(emrCodeStr, "^") {
        s emrCode = $p(emrCodeStr, "^", ei)
        s emrCode = $ZConvert(emrCode, "U")
        s templateId = ""
        s templateId = $o(^NurMp.TemplateI("Indentity", " "_emrCode, templateId))
        continue:(templateId = "")

        s tplObj = ##class(NurMp.Template).%OpenId(templateId)
        s typ = $ZConvert(tplObj.TCIndentity, "U")

        for emrDate = sttDateH:1:endDateH {
            s pgdId = 0
            for {
                s pgdId = $o(^NurMp.DHCTempMultDataI("emdate", emrDate, " "_typ, pgdId))
                q:(pgdId = "")

                s arr = ##class(NurMp.DHCTempMultData).%OpenId(pgdId)
                continue:($ZOBJPROPERTY(arr, "RecCancelUser") '= "")

                s admId = arr.EpisodeId
                continue:(admId = "")

                #; 读取字段
                if emrCode = "DHCNURJMXSSSZPGLR" {
                    s score = $ZOBJPROPERTY(arr, "Item122")
                    s drugPrev =..formatValueNew($ZOBJPROPERTY(arr, "Item19"))
                    s mechPrev = ..formatValueNew($ZOBJPROPERTY(arr, "Item124"))
                    s mechPrev2 = ..formatValueNew($ZOBJPROPERTY(arr, "Item125"))
                    if (mechPrev '= "")||(mechPrev2 '= "") {
                        s mechPrev = "Y"
                    }
                }
                elseif emrCode = "DHCNURCQFXPGLR" {
                    s score = $ZOBJPROPERTY(arr, "Item15")
                    s drugPrev = ..formatValueNew($ZOBJPROPERTY(arr, "Item38"))
                    s mechPrev = ..formatValueNew($ZOBJPROPERTY(arr, "Item45"))
                    s mechPrev2 = ..formatValueNew($ZOBJPROPERTY(arr, "Item46"))
                    if (mechPrev '= "")||(mechPrev2 '= "") {
                        s mechPrev = "Y"
                    }
                }elseif emrCode = "DHCNURCHPGLR" {
                    s score = $ZOBJPROPERTY(arr, "Item15")
                    s drugPrev = ..formatValueNew($ZOBJPROPERTY(arr, "Item38"))
                    s mechPrev = ..formatValueNew($ZOBJPROPERTY(arr, "Item52"))
                    s mechPrev2 = ..formatValueNew($ZOBJPROPERTY(arr, "Item53"))
                    if (mechPrev '= "")||(mechPrev2 '= "") {
                        s mechPrev = "Y"
                    }
                }  else {
                    s score = $ZOBJPROPERTY(arr, "Item98")
                    s drugPrev = ..formatValueNew($ZOBJPROPERTY(arr, "Item19"))
                    s mechPrev = ..formatValueNew($ZOBJPROPERTY(arr, "Item100"))
                    s mechPrev2 = ..formatValueNew($ZOBJPROPERTY(arr, "Item101"))
                    if (mechPrev '= "")||(mechPrev2 '= "") {
                        s mechPrev = "Y"
                    }
                }

                #; 评分 → 风险等级
                if +score >= 5 {
                    s riskLevel = "极高危"
                } elseif +score >= 3 {
                    s riskLevel = "高危"
                } elseif +score >= 1 {
                    s riskLevel = "中危"
                } elseif +score >= 0 {
                    s riskLevel = "低危"
                } else {
                    s riskLevel = ""
                }

                #; 多次评估取最大评分
                s existingScore = $g(^||tempVTEAssess($j, admId))
                if existingScore '= "" {
                    if +score > +existingScore {
                        s ^||tempVTEAssess($j, admId) = score
                        s ^||tempVTEAssess($j, admId, "risk") = riskLevel
                    }
                    if drugPrev '= "" {
                        s ^||tempVTEAssess($j, admId, "drug") = "Y"
                    }
                    if mechPrev = "Y" {
                        s ^||tempVTEAssess($j, admId, "mech") = "Y"
                    }
                } else {
                    s ^||tempVTEAssess($j, admId) = score
                    s ^||tempVTEAssess($j, admId, "risk") = riskLevel
                    s ^||tempVTEAssess($j, admId, "drug") = $s(drugPrev '= "":"Y", 1:"N")
                    s ^||tempVTEAssess($j, admId, "mech") = $s(mechPrev = "Y":"Y", 1:"N")
                }
            }
        }
    }

    #; ========================================================================
    #; 在院模式: 遍历当前在院患者，按指标代码过滤并输出
    #; 患者来源: ^PAADMi("AdmTypeCurr","I",admId) — 当前在院住院患者(状态A,类型I)
    #; ========================================================================
    if QueryType = "I" {
        s admId = ""
        for {
            s admId = $o(^PAADMi("AdmTypeCurr", "I", admId))
            q:(admId = "")

            s admData = $g(^PAADM(admId))
            continue:(admData = "")

            s patId = $p(admData, "^", 1)
            continue:(patId = "")

            s admDateH = $p(admData, "^", 6)
            continue:(admDateH = "")

            #; 排除: 住院时间 <= 24h（以当天为基准）
            continue:((+$h - admDateH) <= 1)

            #; 患者基本信息
            s patData = $g(^PAPER(patId, "ALL"))
            s patName = $p(patData, "^", 1)
            s patSex = $p(patData, "^", 7)
            s patDOB = $p(patData, "^", 6)

            s age = ""
            if patDOB '= "" {
                s age = (admDateH - patDOB) \ 365.25
                continue:(age < 13)
            }

            #; 科室过滤
            s locId = $p(admData, "^", 4)
            continue:$d(^||VTELoc)&&('$d(^||VTELoc(locId)))

            #; 科室名称
            s locDesc = ""
            if locId '= "" {
                s locData = $g(^CTLOC(locId))
                s locDesc = $p(locData, "^", 2)
                if $e(locDesc, 1) = "-" {
                    s locDesc = $e(locDesc, 2, $l(locDesc))
                }
            }

            #; 病区
            s wardId = $p(admData, "^", 70)  // ^PAADM 病区字段
            s wardDesc = ""
            if wardId '= "" {
                s wardData = $g(^PAWARD(wardId))
                s wardDesc = $p(wardData, "^", 2)
            }

            #; 登记号
            s regData = $g(^PAPER(patId, "PAT", 1))
            s regNo = $p(regData, "^", 1)

            #; 诊断
            #; 调用公用方法获取初步诊断描述
            s diagStr = ##class(web.DHCENS.BLL.WSJ.Tool.AdmInfo).GetDiagnoses(admId)
            s diag = $p(diagStr, "^", 5)

            #; 格式化日期（在院患者无出院日期）
            s admDateStr = $zd(admDateH, 3)
            s disDateStr = ""

            #; VTE 评估数据
            s vteRiskLevel = $g(^||tempVTEAssess($j, admId, "risk"))
            s vteScore = +$g(^||tempVTEAssess($j, admId))
            s vteDrugPrev = $g(^||tempVTEAssess($j, admId, "drug"))
            s vteMechPrev = $g(^||tempVTEAssess($j, admId, "mech"))
            if vteDrugPrev = "" { s vteDrugPrev = "N" }
            if vteMechPrev = "" { s vteMechPrev = "N" }

            #; 出血评估（与 QryIndicators 统计口径一致）
            s bleedRiskLevel = ##class(web.HNYZDHCTYL9).GetCXFXLEVEL(admId)

            #; ========================================================================
            #; 按指标代码过滤（按各指标"分母"人群，与 QryIndicators 统计口径一致）
            #; ========================================================================
            s assessFlag = ($g(^||tempVTEAssess($j, admId)) '= "")
            s mhRiskFlag = (vteRiskLevel = "中危")||(vteRiskLevel = "高危")||(vteRiskLevel = "极高危")
            s highVteRiskFlag = (vteRiskLevel = "高危")||(vteRiskLevel = "极高危")
            s bleedAssessFlag = (bleedRiskLevel '= "")
            s bleedHighFlag = (bleedRiskLevel = "高危")||(bleedRiskLevel = "极高危")
            s bleedLowFlag = (bleedRiskLevel = "低危")

            #; 各指标分母: A01=全部符合条件患者, A02=有评估记录, A03=VTE中/高/极高危,
            #; A04=VTE中高危∩有出血评估, P01=VTE中高危∩出血低危, P02=VTE中高危∩出血高危,
            #; P03=VTE高危/极高危∩出血低危, P04=VTE极高危
            s matchFlag = 0
            if IndicatorCode = "A01" {
                s matchFlag = 1
            } elseif IndicatorCode = "A02" {
                s matchFlag = assessFlag
            } elseif IndicatorCode = "A03" {
                s matchFlag = assessFlag && mhRiskFlag
            } elseif IndicatorCode = "A04" {
                s matchFlag = assessFlag && mhRiskFlag && bleedAssessFlag
            } elseif IndicatorCode = "P01" {
                s matchFlag = assessFlag && mhRiskFlag && bleedLowFlag
            } elseif IndicatorCode = "P02" {
                s matchFlag = assessFlag && mhRiskFlag && bleedHighFlag
            } elseif IndicatorCode = "P03" {
                s matchFlag = assessFlag && highVteRiskFlag && bleedLowFlag
            } elseif IndicatorCode = "P04" {
                s matchFlag = assessFlag && (vteRiskLevel = "极高危")
            }

            continue:'matchFlag

            #; 输出行
            s ^CacheTemp(repid, ind) = $lb(
                regNo, patName, patSex, age,
                locDesc, wardDesc, admDateStr, disDateStr,
                vteRiskLevel, bleedRiskLevel,
                diag, vteScore,
                vteDrugPrev, vteMechPrev)
            s ind = ind + 1
        }
    } else {
        #; ========================================================================
        #; 遍历出院患者，按指标代码过滤并输出
        #; ========================================================================

        for disDate = sttDateH:1:endDateH {
        s admId = ""
        for {
            s admId = $o(^PAADMi("DisDateT", "I", disDate, admId))
            q:(admId = "")

            s admData = $g(^PAADM(admId))
            continue:(admData = "")

            s patId = $p(admData, "^", 1)
            continue:(patId = "")

            s admDateH = $p(admData, "^", 6)
            continue:(admDateH = "")
            continue:((disDate - admDateH) <= 1)

            #; 患者基本信息
            s patData = $g(^PAPER(patId, "ALL"))
            s patName = $p(patData, "^", 1)
            s patSex = $p(patData, "^", 7)
            s patDOB = $p(patData, "^", 6)

            s age = ""
            if patDOB '= "" {
                s age = (admDateH - patDOB) \ 365.25
                continue:(age < 13)
            }

            #; 科室过滤
            s locId = $p(admData, "^", 4)
            continue:$d(^||VTELoc)&&('$d(^||VTELoc(locId)))

            #; 科室名称
            s locDesc = ""
            if locId '= "" {
                s locData = $g(^CTLOC(locId))
                s locDesc = $p(locData, "^", 2)
                if $e(locDesc, 1) = "-" {
                    s locDesc = $e(locDesc, 2, $l(locDesc))
                }
            }

            #; 病区
            s wardId = $p(admData, "^", 70)  // ^PAADM 病区字段
            s wardDesc = ""
            if wardId '= "" {
                s wardData = $g(^PAWARD(wardId))
                s wardDesc = $p(wardData, "^", 2)
            }

            #; 登记号
            s regData = $g(^PAPER(patId, "PAT", 1))
            s regNo = $p(regData, "^", 1)

            #; 诊断
            #; 调用公用方法获取初步诊断描述
            s diagStr = ##class(web.DHCENS.BLL.WSJ.Tool.AdmInfo).GetDiagnoses(admId)
            s diag = $p(diagStr, "^", 5)

            #; 格式化日期
            s admDateStr = $zd(admDateH, 3)
            s disDateStr = $zd(disDate, 3)

            #; VTE 评估数据
            s vteRiskLevel = $g(^||tempVTEAssess($j, admId, "risk"))
            s vteScore = +$g(^||tempVTEAssess($j, admId))
            s vteDrugPrev = $g(^||tempVTEAssess($j, admId, "drug"))
            s vteMechPrev = $g(^||tempVTEAssess($j, admId, "mech"))
            if vteDrugPrev = "" { s vteDrugPrev = "N" }
            if vteMechPrev = "" { s vteMechPrev = "N" }

            #; 出血评估（与 QryIndicators 统计口径一致）
            s bleedRiskLevel = ##class(web.HNYZDHCTYL9).GetCXFXLEVEL(admId)

            #; ========================================================================
            #; 按指标代码过滤（按各指标"分母"人群，与 QryIndicators 统计口径一致）
            #; ========================================================================
            s assessFlag = ($g(^||tempVTEAssess($j, admId)) '= "")
            s mhRiskFlag = (vteRiskLevel = "中危")||(vteRiskLevel = "高危")||(vteRiskLevel = "极高危")
            s highVteRiskFlag = (vteRiskLevel = "高危")||(vteRiskLevel = "极高危")
            s bleedAssessFlag = (bleedRiskLevel '= "")
            s bleedHighFlag = (bleedRiskLevel = "高危")||(bleedRiskLevel = "极高危")
            s bleedLowFlag = (bleedRiskLevel = "低危")

            #; 各指标分母: A01=全部符合条件患者, A02=有评估记录, A03=VTE中/高/极高危,
            #; A04=VTE中高危∩有出血评估, P01=VTE中高危∩出血低危, P02=VTE中高危∩出血高危,
            #; P03=VTE高危/极高危∩出血低危, P04=VTE极高危
            s matchFlag = 0
            if IndicatorCode = "A01" {
                s matchFlag = 1
            } elseif IndicatorCode = "A02" {
                s matchFlag = assessFlag
            } elseif IndicatorCode = "A03" {
                s matchFlag = assessFlag && mhRiskFlag
            } elseif IndicatorCode = "A04" {
                s matchFlag = assessFlag && mhRiskFlag && bleedAssessFlag
            } elseif IndicatorCode = "P01" {
                s matchFlag = assessFlag && mhRiskFlag && bleedLowFlag
            } elseif IndicatorCode = "P02" {
                s matchFlag = assessFlag && mhRiskFlag && bleedHighFlag
            } elseif IndicatorCode = "P03" {
                s matchFlag = assessFlag && highVteRiskFlag && bleedLowFlag
            } elseif IndicatorCode = "P04" {
                s matchFlag = assessFlag && (vteRiskLevel = "极高危")
            }

            continue:'matchFlag

            #; 输出行
            s ^CacheTemp(repid, ind) = $lb(
                regNo, patName, patSex, age,
                locDesc, wardDesc, admDateStr, disDateStr,
                vteRiskLevel, bleedRiskLevel,
                diag, vteScore,
                vteDrugPrev, vteMechPrev)
            s ind = ind + 1
        }
    }
    }

    k ^||VTELoc
    k ^||tempVTEAssess($j)

    s qHandle = $lb(0, repid, 0)
    q $$$OK
}

ClassMethod QryByIndicatorFetch(ByRef qHandle As %Binary, ByRef Row As %List, ByRef AtEnd As %Integer = 0) As %Status
{
    s AtEnd = $li(qHandle, 1)
    s repid = $li(qHandle, 2)
    s ind = $li(qHandle, 3)
    s ind = ind + 1
    if $d(^CacheTemp(repid, ind)) {
        s Row = ^CacheTemp(repid, ind)
        s qHandle = $lb(0, repid, ind)
    } else {
        s AtEnd = 1
        s Row = ""
    }
    q $$$OK
}

ClassMethod QryByIndicatorClose(ByRef qHandle As %Binary) As %Status
{
    s repid = $li(qHandle, 2)
    k ^CacheTemp(repid)
    q $$$OK
}

/// 转换护理病历中单选和多选的值
ClassMethod formatValueNew(value, type = "Text")
{
	s rtnVal=""
    i value["[{" d
	.s rtnObj=##class(Nur.JSON).Decode(value)
	.f index=1:1:rtnObj.Count() d
	..s currentObj=rtnObj.GetAt(index)
	..s rtnVal=$case(rtnVal,"":currentObj.GetAt(type),:rtnVal_","_currentObj.GetAt(type))
	e  s rtnVal=value
	s:rtnVal="[]" rtnVal=""
	q rtnVal
}

}
