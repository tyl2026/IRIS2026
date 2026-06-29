Class web.YZSY.DHCMRTop10Disease Extends DHCDoc.Util.RegisteredObject
{

/// 报表2.1：前十病种分布（按ICD-10四位亚目）
/// d ##class(%ResultSet).RunQuery("web.YZSY.DHCMRTop10Disease","QryTop10Disease","2026-01-01","2026-06-30")
Query QryTop10Disease(SttDate As %String, EndDate As %String, LocID As %String = "") As %Query(ROWSPEC = "Rank:%Integer,ICD4Code:%String,DiseaseName:%String,DisCount:%Integer,DisPct:%String,AvgLOS:%String,AvgCost:%String,MortalityRate:%String,CureRate:%String,YoYChange:%String") [ SqlProc ]
{
}

ClassMethod QryTop10DiseaseExecute(ByRef qHandle As %Binary, SttDate As %String, EndDate As %String, LocID As %String = "") As %Status
{
	s repid=$I(^CacheTemp)
	s ind=1
	s qHandle=$lb(0,repid,0)

	q:(SttDate="")||(EndDate="") $$$OK

	s sttH=..%ZDH(SttDate)
	s endH=..%ZDH(EndDate)

	; same period last year
	s priorSttH=sttH-365
	s priorEndH=endH-365

	; === Pass 1: current period aggregation ===
	s totalCur=0
	f dateH=sttH:1:endH {
		s rowId=""
		f {
			s rowId=$o(^DHCMRInfo(0,"MR_DIS_DATE",dateH,rowId))
			q:rowId=""
			s data=$g(^DHCMRInfo(rowId))
			continue:data=""

			s rykb=$p(data,"^",36)
			continue:(LocID'="")&&(LocID'=rykb)

			; ICD-10 4-digit subcategory
			s icd=$p(data,"^",52)
			continue:icd=""
			s icd4=..ExtractICD4(icd)
			continue:icd4=""

			; admission ID for discharge condition lookup
			s adm=$p(data,"^",6)
			s dischCode=..GetDischCondCode(adm)

			; aggregate counts
			s ^||TempTop10($j,"CUR",icd4,"CNT")=$g(^||TempTop10($j,"CUR",icd4,"CNT"))+1
			s totalCur=totalCur+1

			s los=+$p(data,"^",42)
			s ^||TempTop10($j,"CUR",icd4,"LOS")=$g(^||TempTop10($j,"CUR",icd4,"LOS"))+los

			s cost=+$p(data,"^",231)
			s ^||TempTop10($j,"CUR",icd4,"COST")=$g(^||TempTop10($j,"CUR",icd4,"COST"))+cost

			; death: DISCON_Code=5 or discharge method=5
			i (dischCode=5)||($p(data,"^",46)=5) {
				s ^||TempTop10($j,"CUR",icd4,"DEATH")=$g(^||TempTop10($j,"CUR",icd4,"DEATH"))+1
			}

			; cured/improved: DISCON_Code=1 or 2
			i (dischCode=1)||(dischCode=2) {
				s ^||TempTop10($j,"CUR",icd4,"CURE")=$g(^||TempTop10($j,"CUR",icd4,"CURE"))+1
			}

			; store disease name from first record
			i $g(^||TempTop10($j,"CUR",icd4,"NAME"))="" {
				s ^||TempTop10($j,"CUR",icd4,"NAME")=$p(data,"^",53)
			}
		}
	}

	; === Pass 2: prior year aggregation ===
	i priorSttH>0 {
		f dateH=priorSttH:1:priorEndH {
			s rowId=""
			f {
				s rowId=$o(^DHCMRInfo(0,"MR_DIS_DATE",dateH,rowId))
				q:rowId=""
				s data=$g(^DHCMRInfo(rowId))
				continue:data=""
				s rykb=$p(data,"^",36)
				continue:(LocID'="")&&(LocID'=rykb)
				s icd=$p(data,"^",52)
				continue:icd=""
				s icd4=..ExtractICD4(icd)
				continue:icd4=""
				s ^||TempTop10($j,"PRIOR",icd4,"CNT")=$g(^||TempTop10($j,"PRIOR",icd4,"CNT"))+1
			}
		}
	}

	; === sort by count desc, top 10 ===
	s icd4=""
	f {
		s icd4=$o(^||TempTop10($j,"CUR",icd4))
		q:icd4=""
		s cnt=$g(^||TempTop10($j,"CUR",icd4,"CNT"))
		s ^||TempSort($j,cnt,icd4)=""
	}

	s topN=0
	s cnt=""
	f {
		s cnt=$o(^||TempSort($j,cnt),-1)
		q:cnt=""
		s icd4=""
		f {
			s icd4=$o(^||TempSort($j,cnt,icd4))
			q:icd4=""
			s topN=topN+1
			q:topN>10

			s disCount=$g(^||TempTop10($j,"CUR",icd4,"CNT"))
			s disPct=..FmtPct(disCount,totalCur)
			s avgLOS=..FmtNum($g(^||TempTop10($j,"CUR",icd4,"LOS"))/disCount,1)
			s avgCost=..FmtNum($g(^||TempTop10($j,"CUR",icd4,"COST"))/disCount,2)
			s deathCnt=$g(^||TempTop10($j,"CUR",icd4,"DEATH"))
			s cureCnt=$g(^||TempTop10($j,"CUR",icd4,"CURE"))
			s mortalityRate=..FmtPct(deathCnt,disCount)
			s cureRate=..FmtPct(cureCnt,disCount)

			; disease name: prefer ICD dict, fallback to DHCMRInfo
			s diseaseName=..GetICDDesc(icd4)
			i diseaseName="" s diseaseName=$g(^||TempTop10($j,"CUR",icd4,"NAME"))

			; YoY change
			s priorCnt=$g(^||TempTop10($j,"PRIOR",icd4,"CNT"))
			s yoyChange="-"
			i priorCnt>0 {
				s yoyPct=((disCount-priorCnt)/priorCnt)*100
				s sign=$s(yoyPct>=0:"+",1:"")
				s yoyChange=sign_..FmtNum(yoyPct,1)_"%"
			}

			s ^CacheTemp(repid,ind)=$lb(topN,icd4,diseaseName,disCount,disPct,avgLOS,avgCost,mortalityRate,cureRate,yoyChange)
			s ind=ind+1
		}
		q:topN>10
	}

	k ^||TempTop10($j)
	k ^||TempSort($j)

	q $$$OK
}

ClassMethod QryTop10DiseaseFetch(ByRef qHandle As %Binary, ByRef Row As %List, ByRef AtEnd As %Integer = 0) As %Status [ PlaceAfter = QryTop10DiseaseExecute ]
{
	s AtEnd=$li(qHandle,1)
	s repid=$li(qHandle,2)
	s ind=$li(qHandle,3)
	s ind=$o(^CacheTemp(repid,ind))
	i ind="" {
		s AtEnd=1
		s Row=""
		q $$$OK
	}
	s Row=^CacheTemp(repid,ind)
	s qHandle=$lb(AtEnd,repid,ind)
	q $$$OK
}

ClassMethod QryTop10DiseaseClose(ByRef qHandle As %Binary) As %Status [ PlaceAfter = QryTop10DiseaseExecute ]
{
	s repid=$li(qHandle,2)
	k ^CacheTemp(repid)
	q $$$OK
}

/// 报表2.2：前十病种趋势分析（按月份展开）
/// d ##class(%ResultSet).RunQuery("web.YZSY.DHCMRTop10Disease","QryTop10Trend","2026-01-01","2026-12-31")
Query QryTop10Trend(SttDate As %String, EndDate As %String, LocID As %String = "") As %Query(ROWSPEC = "ICD4Code:%String,DiseaseName:%String,M1:%Integer,M2:%Integer,M3:%Integer,M4:%Integer,M5:%Integer,M6:%Integer,M7:%Integer,M8:%Integer,M9:%Integer,M10:%Integer,M11:%Integer,M12:%Integer,YearTotal:%Integer,AvgMonth:%String,YoYChange:%String") [ SqlProc ]
{
}

ClassMethod QryTop10TrendExecute(ByRef qHandle As %Binary, SttDate As %String, EndDate As %String, LocID As %String = "") As %Status
{
	s repid=$I(^CacheTemp)
	s ind=1
	s qHandle=$lb(0,repid,0)

	q:(SttDate="")||(EndDate="") $$$OK

	s sttH=..%ZDH(SttDate)
	s endH=..%ZDH(EndDate)

	; === current year: aggregate by (month, icd4) ===
	f dateH=sttH:1:endH {
		s rowId=""
		f {
			s rowId=$o(^DHCMRInfo(0,"MR_DIS_DATE",dateH,rowId))
			q:rowId=""
			s data=$g(^DHCMRInfo(rowId))
			continue:data=""
			s rykb=$p(data,"^",36)
			continue:(LocID'="")&&(LocID'=rykb)
			s icd=$p(data,"^",52)
			continue:icd=""
			s icd4=..ExtractICD4(icd)
			continue:icd4=""

			s month=$e($zd(dateH,3),6,7)
			i $e(month)=0 s month=$e(month,2)

			s ^||TempTrend($j,"CUR",icd4,month)=$g(^||TempTrend($j,"CUR",icd4,month))+1
			s ^||TempTrend($j,"CUR",icd4,"TOTAL")=$g(^||TempTrend($j,"CUR",icd4,"TOTAL"))+1

			i $g(^||TempTrend($j,"CUR",icd4,"NAME"))="" {
				s ^||TempTrend($j,"CUR",icd4,"NAME")=$p(data,"^",53)
			}
		}
	}

	; === prior year ===
	s priorSttH=sttH-365
	s priorEndH=endH-365
	i priorSttH>0 {
		f dateH=priorSttH:1:priorEndH {
			s rowId=""
			f {
				s rowId=$o(^DHCMRInfo(0,"MR_DIS_DATE",dateH,rowId))
				q:rowId=""
				s data=$g(^DHCMRInfo(rowId))
				continue:data=""
				s rykb=$p(data,"^",36)
				continue:(LocID'="")&&(LocID'=rykb)
				s icd=$p(data,"^",52)
				continue:icd=""
				s icd4=..ExtractICD4(icd)
				continue:icd4=""
				s ^||TempTrend($j,"PRIOR",icd4,"TOTAL")=$g(^||TempTrend($j,"PRIOR",icd4,"TOTAL"))+1
			}
		}
	}

	; === sort by year total desc, top 10 ===
	s icd4=""
	f {
		s icd4=$o(^||TempTrend($j,"CUR",icd4))
		q:icd4=""
		s total=$g(^||TempTrend($j,"CUR",icd4,"TOTAL"))
		s ^||TempSort2($j,total,icd4)=""
	}

	s topN=0
	s total=""
	f {
		s total=$o(^||TempSort2($j,total),-1)
		q:total=""
		s icd4=""
		f {
			s icd4=$o(^||TempSort2($j,total,icd4))
			q:icd4=""
			s topN=topN+1
			q:topN>10

			s diseaseName=..GetICDDesc(icd4)
			i diseaseName="" s diseaseName=$g(^||TempTrend($j,"CUR",icd4,"NAME"))

			s M1=$g(^||TempTrend($j,"CUR",icd4,1))
			s M2=$g(^||TempTrend($j,"CUR",icd4,2))
			s M3=$g(^||TempTrend($j,"CUR",icd4,3))
			s M4=$g(^||TempTrend($j,"CUR",icd4,4))
			s M5=$g(^||TempTrend($j,"CUR",icd4,5))
			s M6=$g(^||TempTrend($j,"CUR",icd4,6))
			s M7=$g(^||TempTrend($j,"CUR",icd4,7))
			s M8=$g(^||TempTrend($j,"CUR",icd4,8))
			s M9=$g(^||TempTrend($j,"CUR",icd4,9))
			s M10=$g(^||TempTrend($j,"CUR",icd4,10))
			s M11=$g(^||TempTrend($j,"CUR",icd4,11))
			s M12=$g(^||TempTrend($j,"CUR",icd4,12))

			s yearTotal=total
			s avgMonth=..FmtNum(yearTotal/12,1)

			s priorTotal=$g(^||TempTrend($j,"PRIOR",icd4,"TOTAL"))
			s yoyChange="-"
			i priorTotal>0 {
				s yoyPct=((yearTotal-priorTotal)/priorTotal)*100
				s sign=$s(yoyPct>=0:"+",1:"")
				s yoyChange=sign_..FmtNum(yoyPct,1)_"%"
			}

			s ^CacheTemp(repid,ind)=$lb(icd4,diseaseName,M1,M2,M3,M4,M5,M6,M7,M8,M9,M10,M11,M12,yearTotal,avgMonth,yoyChange)
			s ind=ind+1
		}
		q:topN>10
	}

	k ^||TempTrend($j)
	k ^||TempSort2($j)

	q $$$OK
}

ClassMethod QryTop10TrendFetch(ByRef qHandle As %Binary, ByRef Row As %List, ByRef AtEnd As %Integer = 0) As %Status [ PlaceAfter = QryTop10TrendExecute ]
{
	s AtEnd=$li(qHandle,1)
	s repid=$li(qHandle,2)
	s ind=$li(qHandle,3)
	s ind=$o(^CacheTemp(repid,ind))
	i ind="" {
		s AtEnd=1
		s Row=""
		q $$$OK
	}
	s Row=^CacheTemp(repid,ind)
	s qHandle=$lb(AtEnd,repid,ind)
	q $$$OK
}

ClassMethod QryTop10TrendClose(ByRef qHandle As %Binary) As %Status [ PlaceAfter = QryTop10TrendExecute ]
{
	s repid=$li(qHandle,2)
	k ^CacheTemp(repid)
	q $$$OK
}

/// Extract ICD-10 4-digit subcategory: C50.900x011 → C50.9, I10.x00x002 → I10.x
ClassMethod ExtractICD4(icd As %String) As %String
{
	q:icd="" ""
	q:icd'["." icd
	s pre=$p(icd,".")
	s post=$p(icd,".",2)
	s post4=$e(post)
	q pre_"."_post4
}

/// Get discharge condition code: ^PAADM(adm) piece 17 → ^DISCON(dr) piece 2
ClassMethod GetDischCondCode(adm As %String) As %String
{
	q:adm="" ""
	s dischCondDr=$p($g(^PAADM(adm)),"^",17)
	q:dischCondDr="" ""
	q $p($g(^DISCON(dischCondDr)),"^",2)
}

/// ICD dict lookup: ^MRC("ID",0,"ICD",icdCode,rowId) → ^MRC("ID",rowId) piece 2
ClassMethod GetICDDesc(icdCode As %String) As %String
{
	q:icdCode="" ""
	s rowId=$o(^MRC("ID",0,"ICD",icdCode,""))
	q:rowId="" ""
	q $p($g(^MRC("ID",rowId)),"^",2)
}

/// Format percentage
ClassMethod FmtPct(part As %Float, total As %Float) As %String
{
	q:total=0 "-"
	s pct=(part/total)*100
	q ..FmtNum(pct,1)_"%"
}

/// Format number to given decimal places
ClassMethod FmtNum(num As %Float, decimals As %Integer) As %String
{
	s factor=10**decimals
	s rounded=$zabs(+num)
	s rounded=(rounded*factor+0.5)\1/factor
	s sign=$s(num<0:"-",1:"")
	s intPart=rounded\1
	s fracPart=(rounded-intPart)*factor+0.5\1
	s fracStr=$e(fracPart+factor,2,decimals+1)
	q:decimals>0 sign_intPart_"."_fracStr
	q sign_intPart
}

/// 病种明细下钻：按 ICD-4 亚目查看患者明细
/// d ##class(%ResultSet).RunQuery("web.YZSY.DHCMRTop10Disease","QryDiseaseDetail","2026-01-01","2026-06-30","","C50.9")
Query QryDiseaseDetail(SttDate As %String, EndDate As %String, LocID As %String = "", ICD4Code As %String = "") As %Query(ROWSPEC = "PatName:%String,MedRecNo:%String,MainDiag:%String,AdmDate:%String,DisDate:%String,DeptName:%String,LOS:%Integer,TotalCost:%String,DischCond:%String") [ SqlProc ]
{
}

ClassMethod QryDiseaseDetailExecute(ByRef qHandle As %Binary, SttDate As %String, EndDate As %String, LocID As %String = "", ICD4Code As %String = "") As %Status
{
	s repid=$I(^CacheTemp)
	s ind=1
	s qHandle=$lb(0,repid,0)

	q:(SttDate="")||(EndDate="") $$$OK

	s sttH=..%ZDH(SttDate)
	s endH=..%ZDH(EndDate)

	f dateH=sttH:1:endH {
		s rowId=""
		f {
			s rowId=$o(^DHCMRInfo(0,"MR_DIS_DATE",dateH,rowId))
			q:rowId=""
			s data=$g(^DHCMRInfo(rowId))
			continue:data=""

			s rykb=$p(data,"^",36)
			continue:(LocID'="")&&(LocID'=rykb)

			s icd=$p(data,"^",52)
			continue:icd=""
			s icd4=..ExtractICD4(icd)
			continue:(ICD4Code'="")&&('$lf($lfs(ICD4Code,","),icd4))

			s adm=$p(data,"^",6)
			s deptDr=$p(data,"^",36)
			s deptName=""
			i deptDr'="" s deptName=$p($g(^CTLOC(deptDr)),"^",2)

			s ^CacheTemp(repid,ind)=$lb(
				$p(data,"^",8),		; PatName (MR_XM)
				$p(data,"^",4),		; MedRecNo (MR_BAH 病案号)
				$p(data,"^",53),	; MainDiag (MR_CYZYZDMC)
				$zd($p(data,"^",36),3),	; AdmDate (MR_RYRQ)
				$zd($p(data,"^",40),3),	; DisDate (MR_CYRQ)
				deptName,		; DeptName
				$p(data,"^",42),	; LOS (MR_SJZYTS)
				$p(data,"^",231),	; TotalCost (MR_ZYZFF)
				..GetDischCondDesc($p(data,"^",6),$p(data,"^",46))	; DischCond
			)
			s ind=ind+1
		}
	}

	q $$$OK
}

ClassMethod QryDiseaseDetailFetch(ByRef qHandle As %Binary, ByRef Row As %List, ByRef AtEnd As %Integer = 0) As %Status [ PlaceAfter = QryDiseaseDetailExecute ]
{
	s AtEnd=$li(qHandle,1)
	s repid=$li(qHandle,2)
	s ind=$li(qHandle,3)
	s ind=$o(^CacheTemp(repid,ind))
	i ind="" {
		s AtEnd=1
		s Row=""
		q $$$OK
	}
	s Row=^CacheTemp(repid,ind)
	s qHandle=$lb(AtEnd,repid,ind)
	q $$$OK
}

ClassMethod QryDiseaseDetailClose(ByRef qHandle As %Binary) As %Status [ PlaceAfter = QryDiseaseDetailExecute ]
{
	s repid=$li(qHandle,2)
	k ^CacheTemp(repid)
	q $$$OK
}

/// Get discharge condition description: ^PAADM(adm) → DISCON → Desc
/// 全院出院总人数
/// d ##class(%ResultSet).RunQuery("web.YZSY.DHCMRTop10Disease","QryDisTotal","2026-01-01","2026-06-30")
Query QryDisTotal(SttDate As %String, EndDate As %String, LocID As %String = "") As %Query(ROWSPEC = "TotalDis:%Integer") [ SqlProc ]
{
}

ClassMethod QryDisTotalExecute(ByRef qHandle As %Binary, SttDate As %String, EndDate As %String, LocID As %String = "") As %Status
{
	s repid=$I(^CacheTemp)
	s qHandle=$lb(0,repid,0)

	q:(SttDate="")||(EndDate="") $$$OK

	s sttH=..%ZDH(SttDate)
	s endH=..%ZDH(EndDate)
	s total=0

	f dateH=sttH:1:endH {
		s rowId=""
		f {
			s rowId=$o(^DHCMRInfo(0,"MR_DIS_DATE",dateH,rowId))
			q:rowId=""
			s data=$g(^DHCMRInfo(rowId))
			continue:data=""
			s rykb=$p(data,"^",36)
			continue:(LocID'="")&&(LocID'=rykb)
			s total=total+1
		}
	}

	s ^CacheTemp(repid,1)=$lb(total)
	q $$$OK
}

ClassMethod QryDisTotalFetch(ByRef qHandle As %Binary, ByRef Row As %List, ByRef AtEnd As %Integer = 0) As %Status [ PlaceAfter = QryDisTotalExecute ]
{
	s AtEnd=$li(qHandle,1)
	s repid=$li(qHandle,2)
	i AtEnd {
		s Row=""
		q $$$OK
	}
	s Row=^CacheTemp(repid,1)
	s AtEnd=1
	q $$$OK
}

ClassMethod QryDisTotalClose(ByRef qHandle As %Binary) As %Status [ PlaceAfter = QryDisTotalExecute ]
{
	s repid=$li(qHandle,2)
	k ^CacheTemp(repid)
	q $$$OK
}

ClassMethod GetDischCondDesc(adm As %String, lyfs As %String = "") As %String
{
	; Try PAADM → DISCON first
	i adm'="" {
		s dischCondDr=$p($g(^PAADM(adm)),"^",17)
		i dischCondDr'="" {
			s desc=$p($g(^DISCON(dischCondDr)),"^",2)
			q:desc'="" desc
		}
	}
	; Fallback: MR_LYFS mapping
	i lyfs=1 q "治愈"
	i lyfs=2 q "好转"
	i lyfs=3 q "稳定"
	i lyfs=4 q "恶化"
	i lyfs=5 q "死亡"
	i lyfs=6 q "未愈"
	i lyfs=9 q "其他"
	q ""
}

}
