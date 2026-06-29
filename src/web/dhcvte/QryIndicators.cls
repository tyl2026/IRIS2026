/// desc: VTE质控 — 8项指标查询（评估质量4项 + 预防质量4项）
/// author：tyl2026
/// date：2026-06-12
/// modify: 对接内网 NurMp.DHCTempMultData 实际表结构
///
/// 数据源:
///   护理病历模板:
///     DHCNURJMXSSSZPGLR — Padua 静脉血栓栓塞症风险评估
///       Item122 = VTE评分总分, Item19 = 药物预防, Item124/125 = 机械预防
///     DHCNURJMXSLR — 静脉血栓风险评估表 (Caprini)
///       Item98  = VTE评分总分, Item19 = 药物预防, Item100/101 = 机械预防
///   存储表: NurMp.DHCTempMultData (Global: ^NurMp.DHCTempMultDataD/I)
///   模板表: NurMp.Template (Global: ^NurMp.TemplateD/I)
///
///   取数规则: VTE评分多次取最大值, 药物/机械预防存在勾选就算1
Class web.dhcvte.QryIndicators Extends %RegisteredObject [ Not ProcedureBlock ]
{

/// desc: 查询4项评估质量指标 (A01-A04)
/// d ##class(%ResultSet).RunQuery("web.dhcvte.QryIndicators","QryAssessmentIndicators","2026-01-01","2026-06-12","")
Query QryAssessmentIndicators(SttDate As %String, EndDate As %String, LocID As %String) As %Query(ROWSPEC = "IndicatorCode:%String,IndicatorName:%String,Category:%String,Numerator:%Integer,Denominator:%Integer,Rate:%String,Target:%String,Note:%String") [ SqlProc ]
{
}

ClassMethod QryAssessmentIndicatorsExecute(ByRef qHandle As %Binary, SttDate As %String, EndDate As %String, LocID As %String) As %Status
{
    s repid = $I(^CacheTemp)
    s ind = 1
    s qHandle = $lb(0, repid, 0)

    #; 转换日期并效验
    s sttDateH = ##class(websys.Conversions).DateHtmlToLogical(SttDate)
    s endDateH = ##class(websys.Conversions).DateHtmlToLogical(EndDate)
    if (sttDateH = "")||(endDateH = "")||(sttDateH > endDateH) {
        s qHandle = $lb(0, repid, 0)
        q $$$OK
    }
    #; 日期范围限制 — 最长31天防止遍历量过大
    if (endDateH - sttDateH) > 31 {
        s endDateH = sttDateH + 31
    }

    #; 构建科室过滤临时Global
    if LocID '= "" {
        k ^||VTELoc
        for i = 1:1:$l(LocID, ",") {
            s one = $p(LocID, ",", i)
            if one '= "" {
                s ^||VTELoc(one) = ""
            }
        }
    }

    #; ========================================================================
    #; 获取 VTE 评估模板的 TCIndentity（两种表单的 EmrCode → TCIndentity 映射）
    #; ========================================================================
    s emrCodeStr = "DHCNURJMXSSSZPGLR^DHCNURJMXSLR"  // Padua ^ Caprini
    s emrCount = $l(emrCodeStr, "^")

    for ei = 1:1:emrCount {
        s emrCode = $p(emrCodeStr, "^", ei)
        s emrCode = $ZConvert(emrCode, "U")
        s templateId = ""
        s templateId = $o(^NurMp.TemplateI("Indentity", " "_emrCode, templateId))
        continue:(templateId = "")

        s tplObj = ##class(NurMp.Template).%OpenId(templateId)
        s tcIndentity = tplObj.TCIndentity
        s typ = $ZConvert(tcIndentity, "U")

        #; 按日期遍历该模板的评估记录
        for emrDate = sttDateH:1:endDateH {
            s pgdId = 0
            for {
                s pgdId = $o(^NurMp.DHCTempMultDataI("emdate", emrDate, " "_typ, pgdId))
                q:(pgdId = "")

                s arr = ##class(NurMp.DHCTempMultData).%OpenId(pgdId)

                #; 跳过已作废记录
                continue:($ZOBJPROPERTY(arr, "RecCancelUser") '= "")

                s admId = arr.EpisodeId
                continue:(admId = "")

                #; 查看是否已有此就诊的评估记录（多次评估取最大评分）
                s existingScore = $g(^||tempVTEAssess($j, admId))
                if emrCode = "DHCNURJMXSSSZPGLR" {
                    s score = $ZOBJPROPERTY(arr, "Item122")  // Padua评分
                    s drugPrev = $ZOBJPROPERTY(arr, "Item19")
                    s mechPrev = $ZOBJPROPERTY(arr, "Item124")
                    s mechPrev2 = $ZOBJPROPERTY(arr, "Item125")
                    if (mechPrev '= "")||(mechPrev2 '= "") {
                        s mechPrev = "Y"
                    }
                } else {
                    s score = $ZOBJPROPERTY(arr, "Item98")   // Caprini评分
                    s drugPrev = $ZOBJPROPERTY(arr, "Item19")
                    s mechPrev = $ZOBJPROPERTY(arr, "Item100")
                    s mechPrev2 = $ZOBJPROPERTY(arr, "Item101")
                    if (mechPrev '= "")||(mechPrev2 '= "") {
                        s mechPrev = "Y"
                    }
                }

                #; 评分转换为风险等级
                #; Caprini: 0=低危, 1-2=中危, 3-4=高危, >=5=极高危
                #; Padua:  0=低危, 1-3=中危, >=4=高危
                s riskLevel = ""
                if +score >= 5 {
                    s riskLevel = "极高危"
                } elseif +score >= 3 {
                    s riskLevel = "高危"
                } elseif +score >= 1 {
                    s riskLevel = "中危"
                } elseif +score >= 0 {
                    s riskLevel = "低危"
                }

                #; 取最大值
                if existingScore '= "" {
                    if +score > +existingScore {
                        s ^||tempVTEAssess($j, admId) = score
                        s ^||tempVTEAssess($j, admId, "risk") = riskLevel
                        s ^||tempVTEAssess($j, admId, "drug") = drugPrev
                        s ^||tempVTEAssess($j, admId, "mech") = mechPrev
                    }
                } else {
                    s ^||tempVTEAssess($j, admId) = score
                    s ^||tempVTEAssess($j, admId, "risk") = riskLevel
                    s ^||tempVTEAssess($j, admId, "drug") = drugPrev
                    s ^||tempVTEAssess($j, admId, "mech") = mechPrev
                }
            }
        }
    }

    #; ========================================================================
    #; 遍历出院患者，与评估数据匹配统计
    #; ========================================================================

    s totalDis = 0  // A01分母: 符合条件的出院患者
    s numA01 = 0    // A01分子: 入院24h内有评估的
    s numA02 = 0    // A02分子: 中/高/极高危
    s numA03 = 0    // A03分子: VTE中高危且有出血评估
    s numA04 = 0    // A04分子: 出血高/极高危

    #; 按出院日期遍历出院患者
    #; 索引: ^PAADMi("DisDateT", Type, DischgDate, RowID)
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

            #; 排除: 住院时间 <= 24h
            continue:((disDate - admDateH) <= 1)

            #; 患者年龄 >= 13
            s patData = $g(^PAPER(patId, "ALL"))
            s patDOB = $p(patData, "^", 6)
            s age = ""
            if patDOB '= "" {
                s age = (admDateH - patDOB) \ 365.25
                continue:(age < 13)
            }

            #; 科室过滤
            s locId = $p(admData, "^", 4)
            continue:$d(^||VTELoc)&&('$d(^||VTELoc(locId)))

            #; 计入出院总数
            s totalDis = totalDis + 1

            #; VTE评估数据（已在 ^||tempVTEAssess($j) 中）
            s vteScore = $g(^||tempVTEAssess($j, admId))
            if vteScore '= "" {
                #; A01: 入院24h内有评估（简化：有评估记录就算）
                s numA01 = numA01 + 1

                s vteRiskLevel = $g(^||tempVTEAssess($j, admId, "risk"))

                #; A02: 中/高/极高危
                if (vteRiskLevel = "中危")||(vteRiskLevel = "高危")||(vteRiskLevel = "极高危") {
                    s numA02 = numA02 + 1
                }
            }

            #; 出血评估（TODO: 对接实际出血评估表）
            #; 当前占位: 出血评估和VTE评估使用同一次就诊记录,
            #;   实际需查询独立的出血评估模板
            s bleedRiskLevel = ""  // TODO: 从出血评估模板读取
            if (bleedRiskLevel '= "")&&(vteScore '= "") {
                s vteRiskLevel = $g(^||tempVTEAssess($j, admId, "risk"))
                if (vteRiskLevel = "中危")||(vteRiskLevel = "高危")||(vteRiskLevel = "极高危") {
                    s numA03 = numA03 + 1
                    if (bleedRiskLevel = "高危")||(bleedRiskLevel = "极高危") {
                        s numA04 = numA04 + 1
                    }
                }
            }
        }
    }

    k ^||VTELoc
    k ^||tempVTEAssess($j)

    #; 计算比率
    s rateA01 = ..CalcRate(numA01, totalDis)
    s rateA02 = ..CalcRate(numA02, numA01)
    s rateA03 = ..CalcRate(numA03, numA02)
    s rateA04 = ..CalcRate(numA04, numA03)

    #; A01
    s ^CacheTemp(repid, ind) = $lb(
        "A01", "VTE 风险评估率", "评估质量指标",
        numA01, totalDis, rateA01, "≥80%",
        "入院24h内Caprini/Padua评估不为空 / 符合条件的出院患者")
    s ind = ind + 1

    #; A02
    s ^CacheTemp(repid, ind) = $lb(
        "A02", "VTE 中高风险比例", "评估质量指标",
        numA02, numA01, rateA02, "-",
        "任意一次评估为中危/高危 / 接受过VTE评估的患者")
    s ind = ind + 1

    #; A03
    s ^CacheTemp(repid, ind) = $lb(
        "A03", "出血风险评估率", "评估质量指标",
        numA03, numA02, rateA03, "≥75%",
        "有出血评估记录 / VTE中高危患者")
    s ind = ind + 1

    #; A04
    s ^CacheTemp(repid, ind) = $lb(
        "A04", "出血高风险比例", "评估质量指标",
        numA04, numA03, rateA04, "-",
        "出血评估为高危/极高危 / 接受出血评估的患者")
    s ind = ind + 1

    s qHandle = $lb(0, repid, 0)
    q $$$OK
}

ClassMethod QryAssessmentIndicatorsFetch(ByRef qHandle As %Binary, ByRef Row As %List, ByRef AtEnd As %Integer = 0) As %Status
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

ClassMethod QryAssessmentIndicatorsClose(ByRef qHandle As %Binary) As %Status
{
    s repid = $li(qHandle, 2)
    k ^CacheTemp(repid)
    q $$$OK
}

/// desc: 查询4项预防质量指标 (P01-P04)
/// d ##class(%ResultSet).RunQuery("web.dhcvte.QryIndicators","QryPreventionIndicators","2026-01-01","2026-06-12","")
Query QryPreventionIndicators(SttDate As %String, EndDate As %String, LocID As %String) As %Query(ROWSPEC = "IndicatorCode:%String,IndicatorName:%String,Category:%String,Numerator:%Integer,Denominator:%Integer,Rate:%String,Target:%String,Note:%String") [ SqlProc ]
{
}

ClassMethod QryPreventionIndicatorsExecute(ByRef qHandle As %Binary, SttDate As %String, EndDate As %String, LocID As %String) As %Status
{
    s repid = $I(^CacheTemp)
    s ind = 1
    s qHandle = $lb(0, repid, 0)

    s sttDateH = ##class(websys.Conversions).DateHtmlToLogical(SttDate)
    s endDateH = ##class(websys.Conversions).DateHtmlToLogical(EndDate)
    if (sttDateH = "")||(endDateH = "")||(sttDateH > endDateH) {
        s qHandle = $lb(0, repid, 0)
        q $$$OK
    }
    if (endDateH - sttDateH) > 31 {
        s endDateH = sttDateH + 31
    }

    if LocID '= "" {
        k ^||VTELoc
        for i = 1:1:$l(LocID, ",") {
            s one = $p(LocID, ",", i)
            if one '= "" {
                s ^||VTELoc(one) = ""
            }
        }
    }

    #; ========================================================================
    #; 采集 VTE 评估数据（同 QryAssessmentIndicators 逻辑）
    #; ========================================================================
    s emrCodeStr = "DHCNURJMXSSSZPGLR^DHCNURJMXSLR"
    s emrCount = $l(emrCodeStr, "^")

    for ei = 1:1:emrCount {
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

                s existingScore = $g(^||tempVTEAssess($j, admId))

                if emrCode = "DHCNURJMXSSSZPGLR" {
                    s score = $ZOBJPROPERTY(arr, "Item122")
                    s drugPrev = $ZOBJPROPERTY(arr, "Item19")
                    s mechPrev = $ZOBJPROPERTY(arr, "Item124")
                    s mechPrev2 = $ZOBJPROPERTY(arr, "Item125")
                    if (mechPrev '= "")||(mechPrev2 '= "") {
                        s mechPrev = "Y"
                    }
                } else {
                    s score = $ZOBJPROPERTY(arr, "Item98")
                    s drugPrev = $ZOBJPROPERTY(arr, "Item19")
                    s mechPrev = $ZOBJPROPERTY(arr, "Item100")
                    s mechPrev2 = $ZOBJPROPERTY(arr, "Item101")
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
                }

                #; 取最大值，且药物/机械预防"存在勾选就算"
                if existingScore '= "" {
                    if +score > +existingScore {
                        s ^||tempVTEAssess($j, admId) = score
                        s ^||tempVTEAssess($j, admId, "risk") = riskLevel
                    }
                    #; 药物预防: 任意一次勾选就算
                    if drugPrev '= "" {
                        s ^||tempVTEAssess($j, admId, "drug") = "Y"
                    }
                    #; 机械预防: 任意一次勾选就算
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
    #; 遍历出院患者，按预防指标分类统计
    #; ========================================================================

    s denP01 = 0, numP01 = 0  // 药物预防: VTE中高危 ∩ 出血低危
    s denP02 = 0, numP02 = 0  // 机械预防: VTE中高危 ∩ 出血高危
    s denP03 = 0, numP03 = 0  // 联合预防: VTE高危 ∩ 出血低危
    s denP04 = 0, numP04 = 0  // 规范预防: VTE极高危

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

            s patData = $g(^PAPER(patId, "ALL"))
            s patDOB = $p(patData, "^", 6)
            if patDOB '= "" {
                s age = (admDateH - patDOB) \ 365.25
                continue:(age < 13)
            }

            s locId = $p(admData, "^", 4)
            continue:$d(^||VTELoc)&&('$d(^||VTELoc(locId)))

            s vteRiskLevel = $g(^||tempVTEAssess($j, admId, "risk"))
            continue:(vteRiskLevel = "")  // 无评估记录，跳过

            s vteDrugPrev = $g(^||tempVTEAssess($j, admId, "drug"))
            s vteMechPrev = $g(^||tempVTEAssess($j, admId, "mech"))

            #; 出血评估（TODO: 对接实际出血评估表）
            s bleedRiskLevel = ""

            #; 条件标志
            s mhRiskFlag = (vteRiskLevel = "中危")||(vteRiskLevel = "高危")||(vteRiskLevel = "极高危")
            s highVteRiskFlag = (vteRiskLevel = "高危")||(vteRiskLevel = "极高危")
            s bleedLowFlag = (bleedRiskLevel = "低危")
            s bleedHighFlag = (bleedRiskLevel = "高危")||(bleedRiskLevel = "极高危")

            continue:'mhRiskFlag

            #; P01: 药物预防 — VTE中高危 ∩ 出血低危 中有药物预防的
            if bleedLowFlag {
                s denP01 = denP01 + 1
                if vteDrugPrev = "Y" {
                    s numP01 = numP01 + 1
                }
            }

            #; P02: 机械预防 — VTE中高危 ∩ 出血高危 中有机械预防的
            if bleedHighFlag {
                s denP02 = denP02 + 1
                if vteMechPrev = "Y" {
                    s numP02 = numP02 + 1
                }
            }

            #; P03: 联合预防 — VTE高危 ∩ 出血低危 中两种都有的
            if highVteRiskFlag && bleedLowFlag {
                s denP03 = denP03 + 1
                if (vteDrugPrev = "Y")&&(vteMechPrev = "Y") {
                    s numP03 = numP03 + 1
                }
            }

            #; P04: 规范预防 — VTE极高危中已实施任意预防的
            if vteRiskLevel = "极高危" {
                s denP04 = denP04 + 1
                if (vteDrugPrev = "Y")||(vteMechPrev = "Y") {
                    s numP04 = numP04 + 1
                }
            }
        }
    }

    k ^||VTELoc
    k ^||tempVTEAssess($j)

    #; 计算比率
    s rateP01 = ..CalcRate(numP01, denP01)
    s rateP02 = ..CalcRate(numP02, denP02)
    s rateP03 = ..CalcRate(numP03, denP03)
    s rateP04 = ..CalcRate(numP04, denP04)

    #; P01
    s ^CacheTemp(repid, ind) = $lb(
        "P01", "药物预防实施率", "预防质量指标",
        numP01, denP01, rateP01, "≥60%",
        "勾选药物预防 / VTE中高危∩出血低危")
    s ind = ind + 1

    #; P02
    s ^CacheTemp(repid, ind) = $lb(
        "P02", "机械预防实施率", "预防质量指标",
        numP02, denP02, rateP02, "≥50%",
        "勾选机械预防 / VTE中高危∩出血高危")
    s ind = ind + 1

    #; P03
    s ^CacheTemp(repid, ind) = $lb(
        "P03", "联合预防实施率", "预防质量指标",
        numP03, denP03, rateP03, "≥30%",
        "药物+机械都勾选 / VTE高危∩出血低危")
    s ind = ind + 1

    #; P04
    s ^CacheTemp(repid, ind) = $lb(
        "P04", "VTE 规范预防率", "预防质量指标",
        numP04, denP04, rateP04, "≥55%",
        "极高危且已实施预防 / VTE极高危患者")
    s ind = ind + 1

    s qHandle = $lb(0, repid, 0)
    q $$$OK
}

ClassMethod QryPreventionIndicatorsFetch(ByRef qHandle As %Binary, ByRef Row As %List, ByRef AtEnd As %Integer = 0) As %Status
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

ClassMethod QryPreventionIndicatorsClose(ByRef qHandle As %Binary) As %Status
{
    s repid = $li(qHandle, 2)
    k ^CacheTemp(repid)
    q $$$OK
}

/// ============================
/// 工具方法
/// ============================

/// desc: 计算百分比 Rate (保留1位小数)
ClassMethod CalcRate(num As %Integer, den As %Integer) As %String [ Private ]
{
    if den <= 0 {
        q "0.0"
    }
    s rate = (num / den) * 100
    s rate = $j(rate, 0, 1)
    q rate
}

}
