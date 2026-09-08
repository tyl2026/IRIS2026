/// Description:追溯码台账-查询
/// Creator:    Yanbingli
/// CreatDate:  2025-05-12
Class PHA.DTC.Trans.Query Extends %RegisteredObject
{

/// Description:通过追溯码获取对应药品信息
/// Creator:    Yanbingli
/// CreateDate: 2025-05-12
/// Table:      
/// Input:      LocId-科室ID、TraceCode-追溯码、CodeTypeId-码类型ID、InciDesc-药品名称、Status-使用状态(空/All-全部、1-未使用、2-使用中、3-已使用)
/// Output:        
/// Return：    追溯码对应药品信息
/// Others:     
/// Debug:      w ##class(PHA.DTC.Trans.Query).GetBarCodeData("1","","13","维生素B2片[5mg*100]","All")
ClassMethod GetBarCodeData(LocId = "", TraceCode, CodeTypeId, InciDesc = "", Status = "All") As %String
{
	s ^YanblTMP("GetBarCodeData")=$LB(LocId,TraceCode,CodeTypeId,InciDesc,Status)
    q:CodeTypeId="" "-1^码类型不能为空"
    s ret = ##class(PHA.COM.Array).%New()
    s typeCode = $p($g(^DHCSTSCDI(+CodeTypeId)), "^", 1)
    q:typeCode="" "-1"
    s typeDesc = $p($g(^DHCSTSCDI(+CodeTypeId)), "^", 2)
    s Inci = ""
    if (InciDesc '= "") {
        s Inci = $o(^INCI(0,"Desc",$$ALPHAUP^SSUTIL4(InciDesc),""))
        q:(Inci = "") "-1^您输入的药品不存在！"
    }
   
    if (TraceCode'=""){
        s bc = $o(^BS.PHA.IN.BarCodeI("BarCode",TraceCode,""))
        q:bc="" "-1^无使用记录！"
        s bcData = $g(^BS.PHA.IN.BarCodeD(bc))
        s SplitFlag = $lg(bcData,19)
        s bcTypeCode = $lg(bcData,2)
        s traceCode = $lg(bcData,3)
        s locId =  $lg(bcData,12)
        s locDesc = $p(^CTLOC(locId),"^",2)
        q:(typeCode'=bcTypeCode) "-2^没有查询到符合条件的记录！"  // 码类型不一致
        s bcInci = $lg(bcData,14)
        q:(Inci'="")&&(Inci'=bcInci) "-3^该药品没有此追溯码的拆零记录！"  // 药品不一致
        d GetInciData
    
    } elseif (Inci'="") {
        s bc = 0
        for {
            s bc = $o(^BS.PHA.IN.BarCodeI("TypeInci", typeCode, Inci, bc))  q:bc=""
            s bcData = $g(^BS.PHA.IN.BarCodeD(bc))
            s SplitFlag = $lg(bcData,19)
            s bcTypeCode = $lg(bcData,2)
            s traceCode = $lg(bcData,3)
            s bcInci = $lg(bcData,14)
            s locId =  $lg(bcData,12)
       		s locDesc = $p(^CTLOC(locId),"^",2)
            d GetInciData
        }
       
    }
    q ret.%ToJSON()
    
GetInciData
    s inciCode = $p(^INCI(bcInci,1),"^",1)
    s inciDesc = $p(^INCI(bcInci,1),"^",2)
    s inciSpec = ##class(web.DHCST.Common.DrugInfoCommon).GetSpec("", bcInci)
    s manfName = $p(##class(web.DHCST.Common.DrugInfoCommon).GetManf(bcInci), "^", 3)
    s bUomId = $p(^INCI(bcInci,1),"^",10)
    s pUomId = $p(^INCI(bcInci,1), "^", 17)
    if (pUomId = "") {
        s pUomId = $p(^INCI(bcInci,3), "^", 6)
    }
    s inciFac = ##class(web.DHCST.Common.UtilCommon).UOMFac(pUomId,bUomId)
    s bUomDesc = $p($g(^CT("UOM",+bUomId)),"^",2)
    s bcData = $g(^BS.PHA.IN.BarCodeD(bc))
    s resQty = $lg(bcData,17)
    s bQty = $lg(bcData,7)
    s usedQty = bQty - resQty
    // 使用状态过滤: Status=空/All-全部、1-未使用(已用数量=0)、2-使用中(0<已用数量<拆零数量)、3-已使用(已用数量>=拆零数量)
    q:(Status="1")&&(usedQty'=0)
    q:(Status="2")&&((usedQty<1)||(usedQty'<bQty))
    q:(Status="3")&&(usedQty<bQty)
    s serialNo = $lg(bcData,18)
    s codeObj = ##class(PHA.COM.Object).%New()
    d codeObj.%Set("codeId", bc)
    d codeObj.%Set("inciId", bcInci)
    d codeObj.%Set("typeDesc", typeDesc)
    d codeObj.%Set("locDesc", locDesc)
    d codeObj.%Set("traceCode", traceCode)
    d codeObj.%Set("typeDr", CodeTypeId)
    d codeObj.%Set("inciCode", inciCode)
    d codeObj.%Set("inciDesc", inciDesc)
    d codeObj.%Set("inciSpec", inciSpec)
    d codeObj.%Set("manfName", manfName)
    d codeObj.%Set("barQty", bQty)
    d codeObj.%Set("uomDesc", bUomDesc)
    d codeObj.%Set("uomId", bUomId)
    d codeObj.%Set("usedQty", usedQty)
    d codeObj.%Set("resQty", resQty)
    d codeObj.%Set("serialNo", serialNo)    
    d ret.%Push(codeObj)
    q
}

/// Description:通过追溯码获取追溯码业务明细
/// Creator:    yanbingli
/// CreateDate: 2025-05-06
/// Table:      
/// Input:      LocId-科室Id、codeId-追溯码
/// Output:        
/// Return：    追溯码对应药品信息
/// Others:     
/// Debug:      w ##class(PHA.DTC.Trans.Query).GetBarCodeData("73","","1","","1")
ClassMethod GetBarCodeItmData(LocId = "", codeId) As %String
{
	// s ^YanblTMP("GetBarCodeItmData")=$LB(LocId,codeId)
    q:codeId="" "-1^追溯码不能为空"
    s ret = ##class(PHA.COM.Array).%New()

    s codeItm = ""
    for {
        s codeItm = $o(^BS.PHA.IN.BarCodeD(codeId,"BCBI",codeItm)) 
        q:(codeItm = "")
        s ItmData = $g(^BS.PHA.IN.BarCodeD(codeId,"BCBI",codeItm)) 
        s locId = $lg(ItmData,7)
        s locDesc = $p(^CTLOC(locId),"^",2)
        s type = $lg(ItmData,2)
        s typeDesc = 
			$CASE(type,
	              "F"  :  "门诊发药",   // 门诊发药
	              "H"  :  "门诊退药",   // 门诊退药
	              "P"  :  "住院发药",   // 住院发药
	              "Y"  :  "住院退药",   // 住院退药
	              "G"  :  "入库",   	// 入库
	              "R"  :  "退货",   	// 退货
	              "A"  :  "库存调整",   // 库存调整
	              "AT" :  "盘点",  		// 盘点       
	              :"0"
	        )
        s pointer = $lg(ItmData,3)
        s intrId = $o(^DHCINTR(0,"TypePointer", type, pointer, ""))
        s oeori = ..GetTransOrdItem(intrId)
        s (PatNo,PatName)=""
        if (oeori'=""){
	     	s admId=$p(^OEORD(+oeori),"^",1)
        	s papmi=$p(^PAADM(admId),"^",1)
			s papmi=+papmi
			s admType=$p(^PAADM(admId),"^",2)
			s PatNo=$p(^PAPER(papmi,"PAT",1),"^",2)															//登记号
    		s PatName=$p(^PAPER(papmi,"ALL"),"^",1)	
	    }
		/// 入库信息
		s (ingrNo,ingrMoveMent,apcVendor,approvalNO) = ""
        s inclb = $p(^DHCINTR(intrId),"^",7)
        s incib = $p(^INCI(+inclb,"IL",$p(inclb,"||",2),"LB",$p(inclb,"||",3)),"^",1)
        if (incib '= "") {
        	s ingr = $o(^DHCINGR(0,"GRI_INCIB",incib,""),-1)
        	if (ingr '= "") {
	        	s ingrData = $g(^DHCINGR(ingr))
	        	s ingrNo = $p(ingrData,"^",1)
	        	s ingrDate = $p(ingrData,"^",4)
	        	s:ingrDate'="" ingrDate = ##class(web.DHCSTInterfaceFromElse).DateLogicalToHtml(ingrDate)
	        	s ingrTime = $p(ingrData,"^",9)
	        	s:ingrTime'="" ingrTime = ##class(web.DHCSTInterfaceFromElse).TimeLogicalToHtml(ingrTime)
	        	s ingrMoveMent = ingrDate _" "_ ingrTime
	        	s apcVendor = $p(ingrData,"^",3)
	        	s:apcVendor'="" apcVendor = $p(^APC("APCVM",apcVendor),"^",3)
	        	s approvalNO = $p(ingrData,"^",46)
	        }
        }
        s qty =  $lg(ItmData,4)
		s operDate = $lg(ItmData, 5)
		if (operDate '= "") {
			s operDate = $zd(operDate, 3)
		} 
		s operTime = $lg(ItmData, 6)
		if (operTime '= "") {
			s operTime = $zt(operTime, 1)
		}
		s userId =  $lg(ItmData,8)
		if (userId '= "") {
			s userName = $p($g(^SSU("SSUSR", +userId)), "^", 2)
		}
  		s resQty =  $lg(ItmData,9)
        d GetTransData
        
    }   
    

    q ret.%ToJSON()
    
GetTransData
	s codeSubId = codeId_"||"_codeItm
    s codeObj = ##class(PHA.COM.Object).%New()
    d codeObj.%Set("codeSubId", codeSubId)
    d codeObj.%Set("type", type)
    d codeObj.%Set("typeDesc", typeDesc)
    d codeObj.%Set("locDesc", locDesc)
    d codeObj.%Set("pointer", pointer)
    d codeObj.%Set("oeori", oeori)
    d codeObj.%Set("PatNo", PatNo)
    d codeObj.%Set("PatName", PatName)
    d codeObj.%Set("operDate", operDate)
    d codeObj.%Set("operTime", operTime)
    d codeObj.%Set("qty", qty)
    d codeObj.%Set("userName", $g(userName))
    d codeObj.%Set("resQty", resQty)  
    d codeObj.%Set("ingrNo", ingrNo)
    d codeObj.%Set("ingrMoveMent", ingrMoveMent)
    d codeObj.%Set("apcVendor", $g(apcVendor))
    d codeObj.%Set("approvalNO", approvalNO)  
     
    d ret.%Push(codeObj)
    q
}

/// 获取台帐中的医嘱ID
ClassMethod GetTransOrdItem(intr) As %String
{
	s orditm=""
	s type=$p(^DHCINTR(intr),"^",1)
	s pointer=$p(^DHCINTR(intr),"^",9)
	if ($$$comMemberDefined("PHA.IN.STAT.Com", "m", "GetOeoriByTans")) {
		s orditm = ##class(PHA.IN.STAT.Com).GetOeoriByTans(pointer, type)
	} elseif ($$$comMemberDefined("web.DHCST.ReportForms.ReportCommon", "m", "GetOeoriByTans")) {
		s orditm = ##class(web.DHCST.ReportForms.ReportCommon).GetOeoriByTans(pointer, type)
	} else {
		s rowID = +pointer 
		s sub = +$p(pointer, "||", 2)
		q:(rowID = 0)||(sub = 0) ""
		s orditm = $case(type,
			"P":$p($g(^DHCPHAC(rowID, "I", sub)), "^", 7),
			"Y":$s($d(^PHARET(rowID, "I")) : $p($g(^PHARET(rowID, "I", sub)), "^", 1), 1 : $p($g(^PHARET(rowID)), "^", 5)),
			"F":$p($g(^DHCPHDI(rowID, "PHDI", sub)), "^", 5),
			"H":$p($g(^DHCPHRTI(rowID, "RTI", sub)), "^", 2),
			:""
		)
	}
	q orditm
}

}
