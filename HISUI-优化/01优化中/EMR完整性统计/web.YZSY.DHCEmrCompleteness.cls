Class web.YZSY.DHCEmrCompleteness Extends DHCDoc.Util.RegisteredObject
{

/// 门诊电子病历书写完整率统计
/// d ##class(%ResultSet).RunQuery("web.YZSY.DHCEmrCompleteness","FindOPEmrCompleteness","2026-01-01","2026-06-30")
/// d ##class(%ResultSet).RunQuery("web.YZSY.DHCEmrCompleteness","FindOPEmrCompleteness","","","","","0002590109")
Query FindOPEmrCompleteness(SttDate As %String, EndDate As %String, LocID As %String = "", DocID As %String = "", RegNo As %String = "", ChiefKey As %String = "", HistoryKey As %String = "", TreatmentKey As %String = "", DiagKey As %String = "") As %Query(ROWSPEC = "AdmID:%String,PatName:%String,Sex:%String,Age:%String,RegNo:%String,LocDesc:%String,DocName:%String,AdmDate:%String,ChiefComplaint:%String,CurrentMedHistory:%String,Treatment:%String,Diagnosis:%String,Orders:%String,DoctorSign:%String,ChiefFlag:%String,MedHistoryFlag:%String,TreatmentFlag:%String,DiagFlag:%String,OrderFlag:%String,SignFlag:%String")
{
}

ClassMethod FindOPEmrCompletenessExecute(ByRef qHandle As %Binary, SttDate As %String, EndDate As %String, LocID As %String = "", DocID As %String = "", RegNo As %String = "", ChiefKey As %String = "", HistoryKey As %String = "", TreatmentKey As %String = "", DiagKey As %String = "") As %Status
{
	Set repid=$I(^CacheTemp)
	If $g(ind)="" Set ind=1
	Set qHandle=$lb(0,repid,0)

	if (RegNo = "") {
		if (SttDate = "") || (EndDate = "") {
			Quit $$$OK
		}
		s StartDate = ..%ZDH(SttDate)
		s EndDate = ..%ZDH(EndDate)

		For iDate = StartDate:1:EndDate {
			s TheECRecord = ""
			for {
				s TheECRecord = $o(^DHCEMRI.InstanceDataI("IdxModifyDate",iDate,TheECRecord))
				q:(TheECRecord = "")

				s Sub = ""
				for {
					s Sub = $o(^DHCEMRI.InstanceDataI("IdxModifyDate",iDate,TheECRecord,Sub))
					q:(Sub = "")

					s InstanceID = TheECRecord_"||"_Sub
					s obj = ##class(EMRinstance.InstanceData).%OpenId(InstanceID)
					if ('$IsObject(obj)) {
						continue
					}
					s status = obj.Status
					continue:(status '= "Save")
					s Adm = obj.EpisodeID.%Id()
					s Title = obj.Title
					//continue:(Title '["门诊病历")
					s AdmType = $p(^PAADM(Adm),"^",2)
					continue:((AdmType '= "O") && (AdmType '= "E"))

					do ProcessRecord
				}
			}
		}
	}
	else {
		s PatID = $o(^PAPERi("PAPMI_PatNo",$$ALPHAUP^SSUTIL4(RegNo),""))
		if (PatID = "") {
			Quit $$$OK
		}
	s AdmType = ""
	for {
		
		s AdmType = $o(^PAPERdr(PatID,"ADM",AdmType))
		q:(AdmType = "")
		continue:((AdmType'="O")&&(AdmType'="E"))
		
		s Adm = ""
		for {
			s Adm = $o(^PAPERdr(PatID,"ADM",AdmType,Adm))
			q:(Adm = "")

				s tmpDate = ""
				for {
					s tmpDate = $o(^DHCEMRI.InstanceDataI("IdxEpisodeStatusHappenDateTime",Adm," SAVE",tmpDate))
					q:tmpDate=""
					s tmpTime = ""
					for {
						s tmpTime = $o(^DHCEMRI.InstanceDataI("IdxEpisodeStatusHappenDateTime",Adm," SAVE",tmpDate,tmpTime))
						q:(tmpTime = "")
						b ;2
						s tmpRecId = ""
						for {
							s tmpRecId = $o(^DHCEMRI.InstanceDataI("IdxEpisodeStatusHappenDateTime",Adm," SAVE",tmpDate,tmpTime,tmpRecId))
							q:(tmpRecId = "")
							b ;;3
							s tmpSub = ""
							for {
								s tmpSub = $o(^DHCEMRI.InstanceDataI("IdxEpisodeStatusHappenDateTime",Adm," SAVE",tmpDate,tmpTime,tmpRecId,tmpSub))
								q:(tmpSub = "")

								s InstanceID = tmpRecId_"||"_tmpSub
								s obj = ##class(EMRinstance.InstanceData).%OpenId(InstanceID)
								if ('$IsObject(obj)) {
									continue
								}
								b ;4
								s Title = obj.Title
								//continue:(Title '["门诊病历")

								//s Found = 1
								do ProcessRecord
							}
						}
					}
				}
				}
				
			}
	}

	Quit $$$OK

ProcessRecord
	s PapmiDR = $p(^PAADM(Adm),"^",1)
	s PatName = $p(^PAPER(PapmiDR,"ALL"),"^",1)
	s SexDR = $p(^PAPER(PapmiDR,"ALL"),"^",2)
	s Sex = $s(SexDR = 1: "男", SexDR = 2: "女", 1: "")
	s DOB = $p(^PAPER(PapmiDR,"ALL"),"^",3)
	s Age = ""
	if (DOB '= "") {
		s Age = (+$h - DOB)\365
	}

	s CTLocDR = $p(^PAADM(Adm),"^",4)
	s LocDesc = ""
	if (CTLocDR '= "") {
		s LocDesc = $p(^CTLOC(CTLocDR),"^",2)
	}
	q:(LocID'="")&&(LocID'=CTLocDR)

	s DocDR = $p(^PAADM(Adm),"^",9)
	s DocName = ""
	if (DocDR '= "") {
		s DocName = $p(^CTPCP(DocDR,1),"^",2)
	}
	q:(DocID'="")&&(DocID'=DocDR)

	s AdmDateH = $p(^PAADM(Adm),"^",6)
	s AdmDate = ""
	if (AdmDateH '= "") {
		s AdmDate = ..%ZD(AdmDateH)
	}

	s PatRegNo = $p(^PAPER(PapmiDR,"PAT",1),"^",1)
	s (ChiefComplaint,CurrentMedHistory,Treatment,Diagnosis,Orders,DoctorSign) = ""
	if (InstanceID '= "") {
		s arr = ##class(EMRservice.BL.BLScatterData).GetNewStdDataByGlossaryCategory(Adm,"HDSD00.03.01")
		s ChiefComplaint = arr.GetAt("HDSD00.03.057")
		s CurrentMedHistory = arr.GetAt("HDSD00.03.038")
		s Treatment = arr.GetAt("HDSD00.03.037")
		s Diagnosis = arr.GetAt("HDSD00.03.005")

		s CreateUserDR = obj.CreateUser
		if (CreateUserDR '= "") {
			s DoctorSign = $p(^SSU("SSUSR",CreateUserDR),"^",2)
		}
	}
	q:(ChiefKey'="")&&(ChiefComplaint'[ChiefKey)
	q:(HistoryKey'="")&&(CurrentMedHistory'[HistoryKey)
	q:(TreatmentKey'="")&&(Treatment'[TreatmentKey)
	q:(DiagKey'="")&&(Diagnosis'[DiagKey)

	if (InstanceID '= "") {
		if ($o(^OEORD(0,"Adm",Adm,"")) '= "") {
			s Orders = "已开具"
		}
	}

	s ChiefFlag = $s(ChiefComplaint '= "": 1, 1: 0)
	s MedHistoryFlag = $s(CurrentMedHistory '= "": 1, 1: 0)
	s TreatmentFlag = $s(Treatment '= "": 1, 1: 0)
	s DiagFlag = $s(Diagnosis '= "": 1, 1: 0)
	s OrderFlag = $s(Orders '= "": 1, 1: 0)
	s SignFlag = $s(DoctorSign '= "": 1, 1: 0)

	s Data = $lb(Adm,PatName,Sex,Age,PatRegNo,LocDesc,DocName,AdmDate,ChiefComplaint,CurrentMedHistory,Treatment,Diagnosis,Orders,DoctorSign,ChiefFlag,MedHistoryFlag,TreatmentFlag,DiagFlag,OrderFlag,SignFlag)
	s ^CacheTemp(repid,ind) = Data
	s ind = ind + 1
	q
}

ClassMethod FindOPEmrCompletenessFetch(ByRef qHandle As %Binary, ByRef Row As %List, ByRef AtEnd As %Integer = 0) As %Status [ PlaceAfter = FindOPEmrCompletenessExecute ]
{
	Set AtEnd=$LIST(qHandle,1)
	Set repid=$LIST(qHandle,2)
	Set ind=$LIST(qHandle,3)
	Set ind=$o(^CacheTemp(repid,ind))
	If ind="" {
		Set AtEnd=1
		Set Row=""
	}Else{
		Set Row=^CacheTemp(repid,ind)
	}
	s qHandle=$lb(AtEnd,repid,ind)
	Quit $$$OK
}

ClassMethod FindOPEmrCompletenessClose(ByRef qHandle As %Binary) As %Status [ PlaceAfter = FindOPEmrCompletenessExecute ]
{
	Set repid=$LIST(qHandle,2)
	Kill ^CacheTemp(repid)
	Quit $$$OK
}

/// 医生列表查询
/// d ##class(%ResultSet).RunQuery("web.YZSY.DHCEmrCompleteness","FindDoctor")
Query FindDoctor(LocID As %String = "") As %Query(ROWSPEC = "RowID:%String,Name:%String,LocDesc:%String")
{
}

ClassMethod FindDoctorExecute(ByRef qHandle As %Binary, LocID As %String = "") As %Status
{
	Set repid=$I(^CacheTemp)
	If $g(ind)="" Set ind=1
	s id=0
	for {
		s id=$o(^CTPCP(id))
		q:id=""
		s name=$p(^CTPCP(id,1),"^",2)
		continue:(name="")
		s locdr=$p(^CTPCP(id,1),"^",3)
		continue:(LocID'="")&&(LocID'=locdr)
		s locdesc=""
		if (locdr'="") {
			s locdesc=$p(^CTLOC(locdr),"^",2)
		}
		s Data=$lb(id,name,locdesc)
		s ^CacheTemp(repid,ind)=Data
		s ind=ind+1
	}
	Set qHandle=$lb(0,repid,0)
	Quit $$$OK
}

ClassMethod FindDoctorFetch(ByRef qHandle As %Binary, ByRef Row As %List, ByRef AtEnd As %Integer = 0) As %Status [ PlaceAfter = FindDoctorExecute ]
{
	Set AtEnd=$LIST(qHandle,1)
	Set repid=$LIST(qHandle,2)
	Set ind=$LIST(qHandle,3)
	Set ind=$o(^CacheTemp(repid,ind))
	If ind="" {
		Set AtEnd=1
		Set Row=""
	}Else{
		Set Row=^CacheTemp(repid,ind)
	}
	s qHandle=$lb(AtEnd,repid,ind)
	Quit $$$OK
}

ClassMethod FindDoctorClose(ByRef qHandle As %Binary) As %Status [ PlaceAfter = FindDoctorExecute ]
{
	Set repid=$LIST(qHandle,2)
	Kill ^CacheTemp(repid)
	Quit $$$OK
}

}
