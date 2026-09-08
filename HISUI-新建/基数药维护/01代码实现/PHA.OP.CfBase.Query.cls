/// Description:门诊药房基数药维护查询
/// Creator: 	hulihua
/// CreateDate: 2019-05-20
Class PHA.OP.CfBase.Query Extends %Library.RegisteredObject [ ProcedureBlock ]
{

/// w ##class(%ResultSet).RunQuery("PHA.OP.CfBase.Query","LocBaseMed")
Query LocBaseMed(InputStr = "", HospId = "") As websys.Query(ROWSPEC = "Tarcitm:%String,Tinst:%String,Tdocloc:%String,Tuseloc:%String,Tphbr:%String,Tnote:%String,Tinstrowid:%String,Tdoclocdr:%String,Tuselocdr:%String,Tarcdr:%String,Tinci:%String") [ SqlProc ]
{
}

ClassMethod LocBaseMedExecute(ByRef QHandle As %Binary, InputStr = "", HospId = "") As %Status
{
	q:InputStr=""
	s BaseType=$p(InputStr,"^",1)
 	Set repid=$I(^CacheTemp)
	s ind=1
	s phbr=""
	f  s phbr=$o(^DHCPHBMED(phbr)) q:phbr=""  d
	.q:+phbr=0
	.s DHCPHBMED=^DHCPHBMED(phbr)
	.q:BaseType'=$p(DHCPHBMED,"^",6)
	.s arc=$p(DHCPHBMED,"^",1)
	.s arcitm=$p(^ARCIM($p(arc,"||",1),$p(arc,"||",2),1),"^",2)
	.s inst=""
	.s instdr=$p(DHCPHBMED,"^",2)
	.s:instdr'="" inst=$p(^PHCIN(instdr),"^",2)
	.s doclocdr=$p(DHCPHBMED,"^",3)
	.s docloc=$p(^CTLOC(doclocdr),"^",2)
	.q:(HospId'="")&&($p($g(^CTLOC(doclocdr)),"^",22)'=HospId)
	.s uselocdr=$p(DHCPHBMED,"^",4)
	.s useloc=$p(^CTLOC(uselocdr),"^",2)
	.q:(HospId'="")&&($p($g(^CTLOC(uselocdr)),"^",22)'=HospId)
	.s note=$p(DHCPHBMED,"^",5)
	.s inci=$o(^INCI(0,"ARCIM_DR",+arc,""))
 	.Do OutputLocRow
 	Set QHandle=$lb(0,repid,0)
	Quit $$$OK
	
OutputLocRow
	set Data=$lb(arcitm,inst,docloc,useloc,phbr,note,instdr,doclocdr,uselocdr,arc,inci)
 	Set ^CacheTemp(repid,ind)=Data	
 	Set ind=ind+1
	quit
}

/// d ##class(%ResultSet).RunQuery("PHA.OP.CfBase.Query","QueryLocBaseMed")
Query QueryLocBaseMed(pJsonStr = "{}") As websys.Query(ROWSPEC = "baseMedRowId,baseMedType:%String,baseMedTypeDesc:%String,arcItmRowId:%String,arcItmCode:%String,arcItmDesc:%String,instRowId:%String,instCode:%String,instDesc:%String,docLocRowId:%String,docLocCode:%String,docLocDesc:%String,useLocRowId:%String,useLocCode:%String,useLocDesc:%String,remarks:%String,exeLocRowId:%String,exeLocCode:%String,exeLocDesc:%String") [ SqlProc ]
{
}

ClassMethod QueryLocBaseMedExecute(ByRef QHandle As %Binary, pJsonStr = "{}") As %Status
{
 	Set repid=$I(^CacheTemp)
	Set ind=1
	Set QHandle=$lb(0,repid,0)
	s pJson = ##class(PHA.COM.Json).Parse(pJsonStr)
	q:'$IsObject(pJson) $$$OK
	s hospId= pJson.hospId
	s bmType= pJson.baseMedType
	;q:hospId="" $$$OK

	s phbmId=""
	f  s phbmId=$o(^DHCPHBMED(phbmId)) q:phbmId=""  d
	.q:+phbmId=0
	.s bmData=^DHCPHBMED(phbmId)
	.s baseMedType=$p(bmData,"^",6)
	.q:(bmType'="")&&(bmType'=baseMedType)
	.s baseMedTypeDesc=""
	.i baseMedType="O" s baseMedTypeDesc="门诊"
	.i baseMedType="I" s baseMedTypeDesc="住院"
	.s arcItmRowId=$p(bmData,"^",1)
	.s arcItmCode=$p(^ARCIM($p(arcItmRowId,"||",1),$p(arcItmRowId,"||",2),1),"^",1)
	.s arcItmDesc=$p(^ARCIM($p(arcItmRowId,"||",1),$p(arcItmRowId,"||",2),1),"^",2)
	.s instDesc=""
	.s instCode=""
	.s instDr=$p(bmData,"^",2)
	.s:instDr'="" instDesc=$p(^PHCIN(instDr),"^",2)
	.s:instDr'="" instCode=$p(^PHCIN(instDr),"^",1)
	.s docLocDr=$p(bmData,"^",3)
	.s docLocCode=$p(^CTLOC(docLocDr),"^",1)
	.s docLocDesc=$p(^CTLOC(docLocDr),"^",2)
	.q:(hospId'="")&&($p($g(^CTLOC(docLocDr)),"^",22)'=hospId)
	.s useLocDr=$p(bmData,"^",4)
	.s useLocCode=$p(^CTLOC(useLocDr),"^",1)
	.s useLocDesc=$p(^CTLOC(useLocDr),"^",2)
	.q:(hospId'="")&&($p($g(^CTLOC(useLocDr)),"^",22)'=hospId)
	.s remarks=$p(bmData,"^",5)
	.s exeLocDr=$p(bmData,"^",7)
	.s exeLocCode=$p($g(^CTLOC(+exeLocDr)),"^",1)
	.s exeLocDesc=$p($g(^CTLOC(+exeLocDr)),"^",2)
	.set Data=$lb(phbmId,baseMedType,baseMedTypeDesc,arcItmRowId,arcItmCode,arcItmDesc,instDr,instCode,instDesc,docLocDr,docLocCode,docLocDesc,useLocDr,useLocCode,useLocDesc,remarks,exeLocDr,exeLocCode,exeLocDesc)

	.s BaseMedArr($this,baseMedType,phbmId)=Data
	
	s firstIndex=""
	f  s firstIndex=$o(BaseMedArr($this,firstIndex)) q:firstIndex=""  d
	.s secondIndex=""
	.f  s secondIndex=$o(BaseMedArr($this,firstIndex,secondIndex)) q:secondIndex=""  d
	..s Data=$g(BaseMedArr($this,firstIndex,secondIndex))
 	..Set ^CacheTemp(repid,ind)=Data	
 	..Set ind=ind+1
 	
	Quit $$$OK
}

}
