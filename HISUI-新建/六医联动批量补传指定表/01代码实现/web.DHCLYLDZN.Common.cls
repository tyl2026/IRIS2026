Class web.DHCLYLDZN.Common Extends %RegisteredObject
{

/// 批次号=医疗机构代码-填报日期(YYYYMMDD,今天)-当天批次(两位递增)-上传类型(1新增;2重传)
/// 幂等:同一填报日内,同一数据日期(Date)重复调用返回同一批次号
/// Date:数据日期(horolog);UpType:上传类型 1新增/2重传,默认1(补传用1)
/// w ##class(web.DHCLYLDZN.Common).GetorgbatchnoByDateNew(67758)
ClassMethod GetorgbatchnoByDateNew(Date, UpType = "1") As %String
{
	s orgcode="H43130200027"
	s:UpType="" UpType="1"
	s dqDate=$zd(+$h,8)   //填报日期=今天 YYYYMMDD
	;当天批次:该数据日期今天已分配过则复用,否则取当天下一个递增流水号(幂等)
	s pc=$g(^TOrgbatchnoByDate("dateandpc",+$h,Date))
	i pc="" d
	.s pc=$g(^TOrgbatchnoByDate("pcseq",+$h))+1
	.s ^TOrgbatchnoByDate("pcseq",+$h)=pc
	.s ^TOrgbatchnoByDate("dateandpc",+$h,Date)=pc
	s pcstr=$e("0"_pc,*-1,*)   //当天批次补零到两位
	s orgbatchno=orgcode_"-"_dqDate_"-"_pcstr_"-"_UpType
	s ^TOrgbatchnoByDate("pcanddata",orgbatchno)=Date   //反查:批次号→数据日期(GetTBLBATCHESNew等依赖)
	q orgbatchno
}

/// 补传聚合(低风险):逐日期跑目标 query 收集行到一个结果集,一次调用返回各日期行数之和(如 3+4=7)
/// 数据行的列来自目标 query 本身(%PrepareClassQuery+%ResultColumnCount,不写死);声明 ROWSPEC 取自目标 query 定义
/// 每次补传:改 ClsName、QueryName、DateList;换表时 ROWSPEC 同步换成目标 query 的列
/// d ##class(%ResultSet).RunQuery("web.DHCLYLDZN.Common","ReUploadByDates")
/// call web_DHCLYLDZN.ReUploadByDates()
Query ReUploadByDates() As %Query(ROWSPEC = "org_code,org_name,hospital_dept_code,hospital_dept_name,biz_time,outpatient_visits,emergency_visits,admissions,discharges,discharge_settlements,current_inpatients,authorized_beds,actual_beds,occupied_beds,available_beds,op_er_medical_costs,ipt_medical_costs,op_er_drug_costs,ipt_drug_costs,op_er_medicare_medical,ipt_medicare_medical,op_er_medicare_drug,ipt_medicare_drug,ipt_actual_costs,stat_field1,stat_field2,stat_field3,stat_field4,stat_field5,stat_field6,stat_field7,stat_field8,security_level,vali_flag,create_time,update_time,org_batch_no") [ SqlName = ReUploadByDates, SqlProc ]
{
}

ClassMethod ReUploadByDatesExecute(ByRef qHandle As %Binary) As %Status
{
	Set repid=$I(^CacheTemp)
	Set qHandle=$lb(0,repid,0)
	Set ind=1
	;===== 每次补传只改这三行(换表时 ROWSPEC 同步换成目标query的列) =====
	Set ClsName="web.DHCLYLDZN.Method.Tools"
	Set QueryName="GetTBLBUSINESSMETRICS"
	Set DateList="2026-03-03,2026-03-15"
	;===============================================
	Set stmt=##class(%SQL.Statement).%New()
	Set sc=stmt.%PrepareClassQuery(ClsName,QueryName)
	Quit:$$$ISERR(sc) sc
	For di=1:1:$Length(DateList,",") {
		Set DateStr=$Piece(DateList,",",di)
		Continue:DateStr=""
		Set ^OrgbatchnoByDate(+$H)=##class(web.DHCLYLDZN.Common).GetorgbatchnoByDateNew($zdh(DateStr,3))
		Set rs=stmt.%Execute(DateStr,DateStr)
		While rs.%Next() {
			Set row=""
			For c=1:1:rs.%ResultColumnCount {
				Set row=row_$lb(rs.%GetData(c))
			}
			Set ^CacheTemp(repid,ind)=row
			Set ind=ind+1
		}
	}
	Quit $$$OK
}

ClassMethod ReUploadByDatesClose(ByRef qHandle As %Binary) As %Status [ PlaceAfter = ReUploadByDatesExecute ]
{
	Set repid=$LIST(qHandle,2)
	Kill ^CacheTemp(repid)
	Quit $$$OK
}

ClassMethod ReUploadByDatesFetch(ByRef qHandle As %Binary, ByRef Row As %List, ByRef AtEnd As %Integer = 0) As %Status [ PlaceAfter = ReUploadByDatesExecute ]
{
	Set AtEnd=$LIST(qHandle,1)
	Set repid=$LIST(qHandle,2)
	Set ind=$LIST(qHandle,3)
	Set ind=$o(^CacheTemp(repid,ind))
	If ind="" {
		Set AtEnd=1
		Set Row=""
	}
	Else      {
		Set Row=^CacheTemp(repid,ind)
	}
	Set qHandle=$lb(AtEnd,repid,ind)
	Quit $$$OK
}

/// 4.1.3 批次表(TBL_BATCHES)
Query GetTBLBATCHESNew() As %Query(ROWSPEC = "org_code,table_name,org_batch_no,report_date,upload_date,batches_status") [ SqlName = GetTBLBATCHESNew, SqlProc ]
{
}

ClassMethod GetTBLBATCHESNewExecute(ByRef qHandle As %Binary) As %Status
{
	///D ##class(%ResultSet).RunQuery("web.DHCLYLDZN.Common","GetTBLBATCHESNew")
	Set repid=$I(^CacheTemp)
	Set qHandle=$lb(0,repid,0)
	Set ind=1



	s orgcode="H43130200027"

	i '$d(^OrgbatchnoByDate(+$h)) d
	.s ^OrgbatchnoByDate(+$h)="H43130200027-"_$zd(+$h,8)_"-01"_"-1"

	s orgbatchno="" f  s orgbatchno=$o(^TOrgbatchnoByDate(+$h,orgbatchno)) q:orgbatchno=""  d

    .s tablename=""
    .f  s tablename=$o(^TOrgbatchnoByDate(+$h,orgbatchno,tablename)) q:tablename=""  d
    ..s pcdate=$g(^TOrgbatchnoByDate("pcanddata",orgbatchno))
    ..s:pcdate="" pcdate=+$h-1

    ..s uploaddate=$zd(pcdate,3)_" "_$zt($p($h,",",2),1)
    ..q:uploaddate=""
    ..s reportdate=$zd(+$h,3)_" "_$zt($p($h,",",2),1)
    ..s batchesstatus=1
	..d OutputRow


	Quit $$$OK
OutputRow
    s ^TOrgbatchnoByDate(+$h,orgbatchno,"TBL_BATCHES","TNum")=ind
    s ^TOrgbatchnoByDate(+$h,orgbatchno,"TBL_BATCHES","St")=$zd(+$h,3)_" 00:00:01"
	s ^TOrgbatchnoByDate(+$h,orgbatchno,"TBL_BATCHES","Et")=$zd(+$h,3)_" 23:59:59"

	s data=$lb(orgcode,tablename,orgbatchno,reportdate,uploaddate,batchesstatus)
    s ^CacheTemp(repid,ind)=data
	s ind=ind+1

	q
}

ClassMethod GetTBLBATCHESNewClose(ByRef qHandle As %Binary) As %Status [ PlaceAfter = GetTBLBATCHESNewExecute ]
{
	Set repid=$LIST(qHandle,2)
	Kill ^CacheTemp(repid)
	Quit $$$OK
}

ClassMethod GetTBLBATCHESNewFetch(ByRef qHandle As %Binary, ByRef Row As %List, ByRef AtEnd As %Integer = 0) As %Status [ PlaceAfter = GetTBLBATCHESNewExecute ]
{
	Set AtEnd=$LIST(qHandle,1)
	Set repid=$LIST(qHandle,2)
	Set ind=$LIST(qHandle,3)
	Set ind=$o(^CacheTemp(repid,ind))
	If ind="" {
		Set AtEnd=1
		Set Row=""
	}
	Else      {
		Set Row=^CacheTemp(repid,ind)
	}
	s qHandle=$lb(AtEnd,repid,ind)
	;b
	Quit $$$OK
}

/// 4.1.2 数据量记录汇总表(TBL_DATA_VOLUME_STATS)
Query GetTBLDATAVOLUMESTATSNew() As %Query(ROWSPEC = "org_code,platform_table_name,process_start_time,process_end_time,expected_total_count,actual_upload_count,detail_upload_flag,statistics_flag,security_level,vali_flag,create_time,update_time,org_batch_no") [ SqlName = GetTBLDATAVOLUMESTATSNew, SqlProc ]
{
}

ClassMethod GetTBLDATAVOLUMESTATSNewExecute(ByRef qHandle As %Binary) As %Status
{
	///D ##class(%ResultSet).RunQuery("web.UDHCWJWDZBLOne","GetTBLDATAVOLUMESTATSNew")
	Set repid=$I(^CacheTemp)
	Set qHandle=$lb(0,repid,0)
	Set ind=1


	s orgcode="H43130200027"


	s orgbatchno="" f  s orgbatchno=$o(^TOrgbatchnoByDate(+$h,orgbatchno)) q:orgbatchno=""  d
	.s TNum=0
    .s platformtablename=""
    .f  s platformtablename=$o(^TOrgbatchnoByDate(+$h,orgbatchno,platformtablename)) q:platformtablename=""  d

    ..s processstarttime=$g(^TOrgbatchnoByDate(+$h,orgbatchno,platformtablename,"St"))

    ..q:processstarttime=""
    ..s processendtime=$g(^TOrgbatchnoByDate(+$h,orgbatchno,platformtablename,"Et"))
    ..s expectedtotalcount=+$g(^TOrgbatchnoByDate(+$h,orgbatchno,platformtablename,"TNum"))
    ..s actualuploadcount=expectedtotalcount
    ..s detailuploadflag=1
    ..s statisticsflag=2
    ..s securitylevel="000"
    ..s valiflag=1
    ..s pcdate=$g(^TOrgbatchnoByDate("pcanddata",orgbatchno))
    ..s:pcdate="" pcdate=+$h-1

    ..s createtime=$zd(+$h,3)_" "_$zt($p($h,",",2),1)

    ..;s createtime=$zd(+$h,3)_" "_$zt($p($h,",",2),1)
    ..s updatetime=$zd(+$h,3)_" "_$zt($p($h,",",2),1)
	..d OutputRow

	Quit $$$OK
OutputRow
	s ^TOrgbatchnoByDate(+$h,orgbatchno,"TBL_DATA_VOLUME_STATS","St")=$zd(+$h,3)_" 00:00:01"
	s ^TOrgbatchnoByDate(+$h,orgbatchno,"TBL_DATA_VOLUME_STATS","Et")=$zd(+$h,3)_" 23:59:59"
	s TNum=TNum+1
    s ^TOrgbatchnoByDate(+$h,orgbatchno,"TBL_DATA_VOLUME_STATS","TNum")=TNum
    s ^TOrgbatchnoByDate(+$h,orgbatchno,"TBL_DATA_VOLUME_STATS","UPTime")=$zd(+$h,3)_" "_$zt($p($h,",",2),1)
	s data=$lb(orgcode,platformtablename,processstarttime,processendtime,expectedtotalcount,actualuploadcount,detailuploadflag,statisticsflag,securitylevel,valiflag,createtime,updatetime,orgbatchno)
    s ^CacheTemp(repid,ind)=data
	s ind=ind+1

	q
}

ClassMethod GetTBLDATAVOLUMESTATSNewClose(ByRef qHandle As %Binary) As %Status [ PlaceAfter = GetTBLDATAVOLUMESTATSNewExecute ]
{
	Set repid=$LIST(qHandle,2)
	Kill ^CacheTemp(repid)
	Quit $$$OK
}

ClassMethod GetTBLDATAVOLUMESTATSNewFetch(ByRef qHandle As %Binary, ByRef Row As %List, ByRef AtEnd As %Integer = 0) As %Status [ PlaceAfter = GetTBLDATAVOLUMESTATSNewExecute ]
{
	Set AtEnd=$LIST(qHandle,1)
	Set repid=$LIST(qHandle,2)
	Set ind=$LIST(qHandle,3)
	Set ind=$o(^CacheTemp(repid,ind))
	If ind="" {
		Set AtEnd=1
		Set Row=""
	}
	Else      {
		Set Row=^CacheTemp(repid,ind)
	}
	s qHandle=$lb(AtEnd,repid,ind)
	;b
	Quit $$$OK
}

}
