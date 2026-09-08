/// Description:统计发退药的扫码上传情况
/// Creator:    chenghsuo
/// CreatDate:  2025-07-08
Class PHA.DTC.Query.DispScan Extends %RegisteredObject
{

/// Creator:    chenghsuo
/// CreatDate:  2025-07-08
/// Table:      
/// Input:      
/// Output:     
/// Return:     返回值
/// Others:     其他补充
/// Debug:      d ##class(%ResultSet).RunQuery("PHA.DTC.Stat.DispScanQuery","GetDrugScanInfo","2025-07-16^2025-07-16^A^^2^^O^Y^^^^^^^Disp")
Query GetDrugScanInfo(inputStr = "") As websys.Query(ROWSPEC = "logId,type,intr,inText,checkFlag,insuCode,insuDesc,traceCodeInfo,patNo,patName,setlId,mdtrtSn,admTypeDesc,trdnFlag,setlTypeDesc,intrTypeDesc,scanFlag,outText,oeore") [ SqlProc ]
{
}

ClassMethod GetDrugScanInfoExecute(ByRef qHandle As %Binary, inputStr = "") As %Status
{
    set repid=$I(^CacheTemp)
    set qHandle=$lb(0,repid,0)
    set ind=1 
    s pStartDate = $p(inputStr,"^",1)   
    s pEndDate = $p(inputStr,"^",2)
    q:((pStartDate = "") || (pEndDate = "")) $$$OK
    
    s statType = $p(inputStr,"^",15)
    if (statType = "Disp") {
        s pid = ..GetDrugScanInfoByDisp(inputStr)   
    }
    if (statType = "Settle") {
        s pid = ..GetDrugScanInfoBySettle(inputStr) 
    }
    
    q:pid="" $$$OK
    q:'$d(^||TMP("PHA", $CLASSNAME(), "GetDrugScanInfo", pid)) $$$OK
    
    s count = 0
    for {
        s count = $o(^||TMP("PHA", $CLASSNAME(), "GetDrugScanInfo", pid, count))  q:count=""
        s data = ^||TMP("PHA", $CLASSNAME(), "GetDrugScanInfo", pid, count)
        set ^CacheTemp(repid,ind)=data
        set ind=ind+1
    }
    k ^||TMP("PHA", $CLASSNAME(), "GetDrugScanInfo", pid)
    Set qHandle=$lb(0,repid,0)
    Quit $$$OK
}

ClassMethod GetDrugScanInfoByDisp(inputStr = "") As %String
{
    s pid = ..NewPid()
    k ^||TMP("PHA", $CLASSNAME(), "GetDrugScanInfo", pid)
    s pStartDate = $p(inputStr,"^",1)   
    s pEndDate = $p(inputStr,"^",2)
    if ($$$comMemberDefined("PHA.FACE.IN.Com", "m", "DateHtmlToLogical")) {
        s pStartDate = ##class(PHA.FACE.IN.Com).DateHtmlToLogical(pStartDate)
        s pEndDate = ##class(PHA.FACE.IN.Com).DateHtmlToLogical(pEndDate)
    } elseif ($$$comMemberDefined("web.DHCSTInterfaceFromElse", "m", "DateHtmlToLogical")) {
        s pStartDate = ##class(web.DHCSTInterfaceFromElse).DateHtmlToLogical(pStartDate)
        s pEndDate = ##class(web.DHCSTInterfaceFromElse).DateHtmlToLogical(pEndDate)
    } else {
        if (pStartDate [ "-") {
            s pStartDate = $zdh(pStartDate,3)
        } elseif (pStartDate [ "/") {
            s pStartDate = $zdh(pStartDate,4)
        }
        if (pEndDate [ "-") {
            s pEndDate = $zdh(pEndDate,3)
        } elseif (pEndDate [ "/") {
            s pEndDate = $zdh(pEndDate,4)
        }
    }
    s pChFlag = $p(inputStr,"^",3)
    s pBatchno = $p(inputStr,"^",4)
    s pHospId = $p(inputStr,"^",5)
    s pSelType = $p(inputStr,"^",6)
    s pAdmType = $p(inputStr,"^",7)
    s pScanStatus = $p(inputStr,"^",8)
    s pPhaLocId = $p(inputStr, "^", 9)
    s pIncidesc = $p(inputStr, "^", 10)
    s pPatNo = $p(inputStr, "^", 11)
    s pIntrType = $p(inputStr, "^", 12)
    s pMdtrtSn = $p(inputStr, "^", 13)
    s pSetlId = $p(inputStr, "^", 14)
    s pArcItmCat = $p(inputStr, "^", 17)
  
    s hospCode = ##class(PHA.FACE.TPS.INSUTE.Com).GetInsuDictVal("InsuHospCode", pHospId)
    s hospName = ##class(PHA.FACE.TPS.INSUTE.Com).GetInsuDictVal("InsuHospName", pHospId)
    s typeStr="F^H^P^Y" // 中草药暂时不统计了吧
    if pIntrType'=""  s typeStr = pIntrType
    
    s count = 0
    s cnt=$l(typeStr,"^")
    for i=1:1:cnt {
        s type=$p(typeStr,"^",i)
        for date=pStartDate:1:pEndDate {
            s intr=""
            for  {
                s intr=$o(^DHCINTR(0,"TypeDate",type,date,intr)) q:intr=""  
                s intrData = ^DHCINTR(intr)
                s inclb=$p(^DHCINTR(intr),"^",7)
                continue:inclb=""
                s loc=$p($g(^INCI(+inclb,"IL",+$p(inclb,"||",2))),"^",1)
                continue:(pPhaLocId '= "")&&(pPhaLocId '= loc)
                continue:(pHospId'="")&&(pHospId'=$p($g(^CTLOC(+loc)),"^",22))
                s inci = +inclb
                s inciDesc = $p($g(^INCI(+inci,1)),"^",2)
                continue:(pIncidesc '= "")&&(pIncidesc '= inciDesc)
                s arcItmCatId = $p(##class(web.DHCST.Common.DrugInfoCommon).GetArcItemCat(inci),"^",1)
                continue:(pArcItmCat '= "")&&(pArcItmCat '= arcItmCatId)
                S scgStr =##class(web.DHCST.Common.DrugInfoCommon).GetIncStkCatGrp(inci)
                continue:$p(scgStr,"^",3)'="G"
                continue:$p(scgStr,"^",2)["草药"
                s pointer=$p(^DHCINTR(intr),"^",9)  
                s oeori=##class(PHA.DTC.COM.Method).GetTransOrdItem(intr)
                continue:oeori=""
                s admId = $p(^OEORD(+oeori), "^", 1)
                s papmi = $p($g(^PAADM(admId)),"^", 1)
                s patNo = $p($g(^PAPER(+papmi, "PAT", 1)), "^", 2)  
                continue:(pPatNo '= "")&&(patNo '= pPatNo)
                s admType = $p($g(^PAADM(+admId)), "^", 2)
                continue:(pAdmType '= "")&&(pAdmType '= admType)
                s admTypeDesc = $case(admType, "I" : "住院", "O" : "门诊", "E" : "急诊", "H" : "体检", : "")
                s insuStr = ##class(PHA.FACE.TPS.INSUTE.Com).GetInsuSetlData(oeori) // 医保费用结算类型^结算ID^就医流水号^人员编号
                s setlId = $p(insuStr,"^",2)
                s mdtrtSn = $p(insuStr,"^",3)
                continue:(pMdtrtSn '= "")&&(pMdtrtSn '= mdtrtSn)
                continue:(pSetlId '= "")&&(pSetlId '= setlId)
                s tQty = $p(intrData, "^", 6)
                s:tQty<0 tQty = tQty * (-1)
                s intrUomId = $p(intrData, "^", 10) //台账单位
                s bUomId = $p(^INCI(inci,1), "^", 10)
                s intrFac = ##class(web.DHCST.Common.UtilCommon).UOMFac(intrUomId,bUomId)
                s tQty = tQty * intrFac
                s pUomId = $p(^INCI(inci,1), "^", 17)
                if (pUomId = "") {
                    s pUomId = $p(^INCI(inci,3), "^", 6)
                }
                s oeore = ..GetTransOeore(intr)
                s inciFac = ##class(web.DHCST.Common.UtilCommon).UOMFac(pUomId, bUomId) 
                s needNum = tQty / inciFac      // 需扫数量,按小码计算
                s:needNum["." needNum=$p(needNum,".",1)+1  // 如果除不尽要+1 散的也需要一个码
                s acBQty = ##class(PHA.DTC.COM.Method).GetRecordBQty(intr,type) //已绑定的基本单位数量
                s acNum = acBQty / inciFac // 实扫数量,按小码计算
                s:acNum["." acNum=$p(acNum,".",1)+1
                s upNum = 0
                s:(type="F")||(type="P") methodType=" METHOD3505"
                s:(type="H")||(type="Y") methodType=" METHOD3506"
                s (logId, inText, checkFlag, setlType,setlTypeDesc,outText) = ""
                s traceCodeArr = []
                s traceCodeObj = {}
                s logId = $o(^BS.PHA.IN.InsuDataLogI("TypePointerManf",methodType," "_intr," 1",""),-1)
                if (logId '= "") {
                    s insuLogData = ^BS.PHA.IN.InsuDataLogD(logId)
                    s inText = $lg(insuLogData, 5) 
                    s checkFlag = $lg(insuLogData,7)
                    s outText = $lg(insuLogData, 11) 
                    s setlType = $lg(insuLogData, 3)
                    if checkFlag="Y" {
                        s text = inText
                        s text = ##class(PHA.COM.JSONUtils).ToObject(text)
                        s upTraceCodeArr = text.input.selinfo.drugtracinfo
                        if upTraceCodeArr'="" {
                            s upNum = upTraceCodeArr.%Size()  // 兼容老版
                        }
                        
                    }
                } else {
	                s setlType = ##class(PHA.FACE.TPS.INSUTE.Com).GetSetlType(oeori, oeore)                
	            }
	            continue:(pSelType '= "")&&(pSelType '= setlType)
                s setlTypeDesc = $case(setlType, 1 : "医保结算", 2 : "自费结算", : "")
                s equalFlag = 0
                if ((needNum=acNum)&&(upNum=acNum)) { // 应扫数量=实扫=上传
                    s equalFlag = 1 
                }
                continue:(pChFlag'="A")&&(pChFlag'=checkFlag)
                s scanFlag = 0
                continue:(pScanStatus="Y")&&(acNum=0)
                continue:(pScanStatus="N")&&(acNum>0)
                continue:(pScanStatus="N")&&(equalFlag=1)
                
                s patName = $p($g(^PAPER(+papmi, "ALL")), "^", 1)
                s insuData = ##class(PHA.FACE.TPS.INSUTE.Com).GetInsuData(inci, pHospId)
                s insuCode = $p(insuData,"^",1)
                s insuDesc = $p(insuData,"^",2)
                s traceCode = "",trdnFlag=""
                if (+acNum=0) {
                    if ((acBQty # inciFac) '= 0 ) {
                        s trdnFlag =1   
                    }
                    s traceCodeObj.trdnFlag = trdnFlag
                } else {
                    s tbpId = ""
                    for {
                        s tbpId = $o(^INCTBPi("TypePointer",type,intr,tbpId))  q:(tbpId = "")
                        continue:('$d(^INCTBP(tbpId)))
                        s traceCode = $p(^INCTBP(tbpId),"^",9)
                        s trdnFlag = $p(^INCTBP(tbpId),"^",12)
                        // 扫码情况以实际绑定追溯码为准,上传状态由上方"成功标志"按日志过滤
                        s traceCodeObj.trdnFlag = trdnFlag
                        d traceCodeArr.%Push(traceCode)
                        s scanFlag = 1
                    }
                }
                s traceCodeObj."drugtracinfo" = traceCodeArr
                s traceCodeInfo = traceCodeObj.%ToJSON()
                s count = count + 1
                s intrTypeDesc = $case(type, "F" : "门诊发药", "H" : "门诊退药", "P" : "住院发药", "Y" : "住院退药", : "")
                s data1 = $lb(logId, type, intr, inText, checkFlag)
                s data2 = $lb(insuCode,insuDesc, traceCodeInfo, patNo, patName)
                s data3 = $lb(setlId, mdtrtSn, admTypeDesc, trdnFlag, setlTypeDesc)
                s data4 = $lb(intrTypeDesc, scanFlag, outText, oeore)
                
                s ^||TMP("PHA", $CLASSNAME(), "GetDrugScanInfo", pid, count) = data1_data2_data3_data4
                  
            }
        }
    }
    
    q pid
}

/// Description:按结算日期统计药品的未上传情况
/// Creator:    chenghsuo
/// CreatDate:  2025-07-08
/// Table:      
/// Input:      startDate(开始时间),endDate(结束时间)，pHospId(院区id)
/// Output:     应扫数量、实扫数量、上传数量，业务类型，药房科室
/// Return:     返回值
/// Others:     其他补充
/// Debug:      d ##class(PHA.DTC.Stat.DispScanQuery).GetDrugScanInfoBySettle("2024-09-05^2025-09-05^A^^2^^^^^^^^^^Settle^A")
ClassMethod GetDrugScanInfoBySettle(inputStr = "") As %String
{
    s pid = ..NewPid()
    k ^||TMP("PHA", $CLASSNAME(), "GetDrugScanInfo", pid)
    s pStartDate = $p(inputStr,"^",1)   
    s pEndDate = $p(inputStr,"^",2)
    
    q:pStartDate="" ""
    q:pEndDate="" ""
    if ($$$comMemberDefined("PHA.FACE.IN.Com", "m", "DateHtmlToLogical")) {
        s pStartDate = ##class(PHA.FACE.IN.Com).DateHtmlToLogical(pStartDate)
        s pEndDate = ##class(PHA.FACE.IN.Com).DateHtmlToLogical(pEndDate)
    } elseif ($$$comMemberDefined("web.DHCSTInterfaceFromElse", "m", "DateHtmlToLogical")) {
        s pStartDate = ##class(web.DHCSTInterfaceFromElse).DateHtmlToLogical(pStartDate)
        s pEndDate = ##class(web.DHCSTInterfaceFromElse).DateHtmlToLogical(pEndDate)
    } else {
        if (pStartDate [ "-") {
            s pStartDate = $zdh(pStartDate,3)
        } elseif (pStartDate [ "/") {
            s pStartDate = $zdh(pStartDate,4)
        }
        if (pEndDate [ "-") {
            s pEndDate = $zdh(pEndDate,3)
        } elseif (pEndDate [ "/") {
            s pEndDate = $zdh(pEndDate,4)
        }
    }
    s pChFlag = $p(inputStr,"^",3)
    s pBatchno = $p(inputStr,"^",4)
    s pHospId = $p(inputStr,"^",5)
    s pSelType = $p(inputStr,"^",6)
    s pAdmType = $p(inputStr,"^",7)
    s pScanStatus = $p(inputStr,"^",8)
    s pPhaLocId = $p(inputStr, "^", 9)
    s pIncidesc = $p(inputStr, "^", 10)
    s pPatNo = $p(inputStr, "^", 11)
    s pIntrType = $p(inputStr, "^", 12)
    s pMdtrtSn = $p(inputStr, "^", 13)
    s pSetlId = $p(inputStr, "^", 14)
    s PDspStatus = $p(inputStr, "^", 16)
    s pArcItmCat = $p(inputStr, "^", 17)
    
    s hospCode = ##class(PHA.FACE.TPS.INSUTE.Com).GetInsuDictVal("InsuHospCode", pHospId)
    s hospName = ##class(PHA.FACE.TPS.INSUTE.Com).GetInsuDictVal("InsuHospName", pHospId)
    s hospArea = "" // 定点归属医保区划
    s insuArea = "" // 参保人参保区划
    s count = 0
    
    
    s rs = ##class(%ResultSet).%New()
    s rs.ClassName = "INSU.BL.Interface.DataRpUp"
    s rs.QueryName = "InvOEORDInfoQry"
    d rs.Execute(pStartDate, pEndDate, pAdmType, pHospId)
    while (rs.Next()) {
        s invInsType = rs.%Get("InvInsType") 
        s admId = rs.%Get("AdmRowid") 
        s oeori = rs.%Get("OEORIRowid") 
        s oeore = rs.%Get("OrdExecRowid") 
        
        if oeore'="" {
            s ordId = +oeore
            s ordItm = $p(oeore, "||", 2)
            s dspId = ""
            for {
                s dspId = $o(^DHCOEDISQTY(0,"OEORE",oeore,dspId))  q:(dspId = "")
                continue:('$d(^DHCOEDISQTY(dspId)))
                d GetDspData    
            }
        }else {
            s dspId = ""
            s ordId = +oeori
            s ordItm = $p(oeori, "||", 2)
            for {
                s dspId = $o(^DHCOEDISQTY(0,"OEORI",oeori,dspId))   q:(dspId = "")
                continue:('$d(^DHCOEDISQTY(dspId)))
                d GetDspData
            }   
        }
    }
    q pid
    
GetDspData
    s arcItm = $p(^OEORD(ordId, "I", ordItm, 1), "^", 2) 
    s arcVer = $p(arcItm, "||", 1)
    s arcSub = $p(arcItm, "||", 2)
    // 过滤-不存在库存项
    s inci = $o(^INCI(0, "ARCIM_DR", arcVer, "")) 
    q:(inci = "") 
    s arcItmCatId = $p($g(^ARCIM(arcVer, arcSub, 1)), "^", 10)
    q:(pArcItmCat '= "")&&(pArcItmCat '= arcItmCatId)
    s inciDesc = $p($g(^INCI(+inci,1)),"^",2)
    q:(pIncidesc '= "")&&(pIncidesc '= inciDesc)
    s scgStr =##class(web.DHCST.Common.DrugInfoCommon).GetIncStkCatGrp(inci)
    q:$p(scgStr,"^",3)'="G"
    q:$p(scgStr,"^",2)["草药"
    // 过滤非药品的医嘱子类(R-药品)
    q:($p($g(^ARC("IC", +arcItmCatId)), "^", 7) '= "R")
    s dspData = $g(^DHCOEDISQTY(dspId))
    s dspStatus = $p(dspData, "^", 7)
    q:(PDspStatus = "TC")&&(dspStatus '= "TC")
    q:(PDspStatus = "C")&&(dspStatus = "TC")
    s recLocId = $p(dspData, "^", 24)
	if recLocId = "" {
		s recLocId = $p(^OEORD(ordId, "I", ordItm, 3), "^", 6)  //退药记录没存科室
	}
    q:(pPhaLocId '= "")&&(pPhaLocId '= recLocId)
    s hospId = $p(^CTLOC(recLocId), "^", 22)
    q:(pHospId '= "")&&(pHospId '= hospId)
    s dspPointer = $p(dspData, "^", 14)
    s dspType = $p(dspData, "^", 13)
    q:(pIntrType '= "")&&(pIntrType '= dspType)
    s admType = $p(^PAADM(admId),"^",2)
    s papmi = $p($g(^PAADM(admId)),"^", 1)
    s patNo = $p($g(^PAPER(+papmi, "PAT", 1)), "^", 2)  
    q:(pPatNo '= "")&&(patNo '= pPatNo)
    s insuStr = ##class(PHA.FACE.TPS.INSUTE.Com).GetInsuSetlData(oeori) // 医保费用结算类型^结算ID^就医流水号^人员编号
    s setlId = $p(insuStr,"^",2)
    s mdtrtSn = $p(insuStr,"^",3)
    q:(pMdtrtSn '= "")&&(pMdtrtSn '= mdtrtSn)
    q:(pSetlId '= "")&&(pSetlId '= setlId)
    s insuData = ##class(PHA.FACE.TPS.INSUTE.Com).GetInsuData(inci, pHospId)
    s insuCode = $p(insuData,"^",1)
    s insuDesc = $p(insuData,"^",2)
    s admTypeDesc = $case(admType, "I" : "住院", "O" : "门诊", "E" : "急诊", "H" : "体检", : "")
    s patName = $p($g(^PAPER(+papmi, "ALL")), "^", 1)
    s intrId = ""
    if dspStatus = "TC" {
        // 未发药的只要把结算信息查出来就行？
        s (logId, dspType, intrId, inText, checkFlag) = ""
        s (traceCodeInfo, trdnFlag, setlTypeDesc) = ""
        s (intrTypeDesc, scanFlag, outText) = "" 
        d SetData
    }
    else {
        if (dspType = "PH") {
            s phbdId = +dspPointer
            s phbdCh = $p(dspPointer, "||", 2)
            s phbdSub = ""
            for {
                s phbdSub = $o(^BS.PHA.HERB.DISPEND(phbdId, "I", phbdCh, "B", phbdSub)) 
                q:(phbdSub="")
                continue:('$d(^BS.PHA.HERB.DISPEND(phbdId, "I", phbdCh, "B", phbdSub)))
                s intrPointer = phbdId_"||"_phbdCh_"||"_phbdSub 
                s intrId = ""
                for {
                    s intrId = $o(^DHCINTR(0, "TypePointer", "PH", intrPointer, intrId))
                    q:(intrId = "")
                    continue:('$d(^DHCINTR(intrId)))
                    s intrData = $g(^DHCINTR(intrId))
                    s indexId = intrId
                    s inclb = $p(intrData, "^", 7)
                    d SetData
                }
            }
        }elseif (dspType = "P") {
            s phacId = +dspPointer
            s phacCh = $p(dspPointer, "||", 2)
            s phacSub = ""
            for {
                s phacSub = $o(^DHCPHAC(phacId, "I", phacCh, "B", phacSub))
                q:(phacSub = "")
                continue:'$d(^DHCPHAC(phacId, "I", phacCh, "B", phacSub))
                s intrPointer = phacId_"||"_phacCh_"||"_phacSub 
                s intrId = ""
                for {
                    s intrId = $o(^DHCINTR(0, "TypePointer", "P", intrPointer, intrId))
                    q:(intrId = "")
                    continue:('$d(^DHCINTR(intrId)))
                    s intrData = $g(^DHCINTR(intrId))
                    s indexId = intrId
                    s inclb = $p(intrData, "^", 7)
                    d SetData
                }
            }
        }elseif (dspType = "YH") {
            s phbrId = +dspPointer
            s dspSub = 0
            for {
                s dspSub = $o(^DHCOEDISQTY(dspId, "I", dspSub))  q:(dspSub = "")
                continue:('$d(^DHCOEDISQTY(dspId, "I", dspSub)))
                s dspBatId = dspId_"||"_dspSub
                s phbrCh = ""
                for {
                    s phbrCh = $o(^BS.PHA.HERB.RETURNI("DSPB", dspBatId, phbrId, phbrCh))
                    q:(phbrCh = "")
                    continue:('$d(^BS.PHA.HERB.RETURND(phbrId, "I", phbrCh)))
                    s phbrItmData = $g(^BS.PHA.HERB.RETURND(phbrId, "I", phbrCh))   
                    s intrPointer = phbrId_"||"_phbrCh
                    s intrId = ""
                    for {
                        s intrId = $o(^DHCINTR(0, "TypePointer", "YH", intrPointer, intrId))
                        q:(intrId = "")
                        continue:('$d(^DHCINTR(intrId)))
                        s intrData = $g(^DHCINTR(intrId))
                        s indexId = intrId
                        s inclb = $p(intrData, "^", 7)
                        d SetData
                    }
                }
                
            }
        }elseif (dspType = "Y") {
            if (dspPointer '[ "||") {
                s dspSub = 0
                for {
                    s dspSub = $o(^DHCOEDISQTY(dspId, "I", dspSub))
                    q:(dspSub = "")
                    continue:('$d(^DHCOEDISQTY(dspId, "I", dspSub)))
                    s dspBatId = dspId_"||"_dspSub
                    s pharId = +dspPointer
                    s pharCh = ""
                    for {
                        s pharCh = $o(^PHARETi("DSPB", dspBatId, pharId, pharCh))
                        q:(pharCh = "")
                        s pharSub = ""
                        for {
                            s pharSub = $o(^PHARETi("DSPB", dspBatId, pharId, pharCh, pharSub))
                            q:(pharSub = "")
                            continue:('$d(^PHARET(pharId, "I", pharCh, "B", pharSub)))
                            s intrPointer = pharId_"||"_pharCh_"||"_pharSub 
                            s intrId = ""
                            for {
                                s intrId = $o(^DHCINTR(0, "TypePointer", "Y", intrPointer, intrId))
                                q:(intrId = "")
                                continue:('$d(^DHCINTR(intrId)))
                                s intrData = $g(^DHCINTR(intrId))
                                s indexId = intrId
                                s inclb = $p(intrData, "^", 7)
                                d SetData
                            }
                        }
                    }
                }
            } else {
                s pharId = +dspPointer
                s pharCh = $p(dspPointer, "||", 2)
                q:('$d(^PHARET(pharId, "I", pharCh)))
                s pharSub = ""
                for {
                    s pharSub = $o(^PHARET(pharId, "I", pharCh, "B", pharSub))
                    q:(pharSub = "")
                    continue:('$d(^PHARET(pharId, "I", pharCh, "B", pharSub)))
                    s intrPointer = pharId_"||"_pharCh_"||"_pharSub 
                    s intrId = ""
                    for {
                        s intrId = $o(^DHCINTR(0, "TypePointer", "Y", intrPointer, intrId))
                        q:(intrId = "")
                        continue:('$d(^DHCINTR(intrId)))
                        s intrData = $g(^DHCINTR(intrId))
                        s indexId = intrId
                        s inclb = $p(intrData, "^", 7)
                        d SetData
                    }
                }
            }
        }elseif (dspType = "F") {                       
            s phdId = +dspPointer
            s phdCh = $p(dspPointer, "||", 2)
            s phdSub = ""
            for {
                s phdSub = $o(^DHCPHDI(phdId,"PHDI",phdCh,"INCLB",phdSub))  q:(phdSub = "")
                continue:'$d(^DHCPHDI(phdId,"PHDI",phdCh,"INCLB",phdSub))
                s intrPointer = phdId_"||"_phdCh_"||"_phdSub 
                s intrId = ""
                for {
                    s intrId = $o(^DHCINTR(0, "TypePointer", "F", intrPointer, intrId))  q:(intrId = "")
                    continue:('$d(^DHCINTR(intrId)))
                    s intrData = $g(^DHCINTR(intrId))
                    s inclb = $p(intrData, "^", 7)
                    d SetData
                }
            }
        }elseif (dspType = "H") {
            s retId = +dspPointer
            s retItm = $p(dspPointer, "||", 2)
            s phacSub = ""
            s intrPointer = dspPointer
            s intrId = ""
            for {
                s intrId = $o(^DHCINTR(0, "TypePointer", "H", intrPointer, intrId))
                q:(intrId = "")
                continue:('$d(^DHCINTR(intrId)))
                s intrData = $g(^DHCINTR(intrId))
                s indexId = intrId
                s inclb = $p(intrData, "^", 7)
                d SetData
            }
        }
    }
    q
        
SetData 
    if (intrId '= "" ) {
        s inci = +inclb
        s pointer=$p(^DHCINTR(intrId),"^",9)  
        s admId = $p(^OEORD(+oeori), "^", 1)
        s tQty = $p(intrData, "^", 6)
        s:tQty<0 tQty = tQty * (-1)
        s intrUomId = $p(intrData, "^", 10) //台账单位
        s bUomId = $p(^INCI(inci,1), "^", 10)
        s intrFac = ##class(web.DHCST.Common.UtilCommon).UOMFac(intrUomId,bUomId)
        s tQty = tQty * intrFac
        s pUomId = $p(^INCI(inci,1), "^", 17)
        if (pUomId = "") {
            s pUomId = $p(^INCI(inci,3), "^", 6)
        }
        s inciFac = ##class(web.DHCST.Common.UtilCommon).UOMFac(pUomId, bUomId) 
        s needNum = tQty / inciFac      // 需扫数量,按小码计算
        s:needNum["." needNum=$p(needNum,".",1)+1  // 如果除不尽要+1 散的也需要一个码
        s acBQty = ##class(PHA.DTC.COM.Method).GetRecordBQty(intrId,dspType) //已绑定的基本单位数量
        s acNum = acBQty / inciFac // 实扫数量,按小码计算
        s:acNum["." acNum=$p(acNum,".",1)+1
        s upNum = 0
        s:(dspType="F")||(dspType="P") methodType=" METHOD3505"
        s:(dspType="H")||(dspType="Y") methodType=" METHOD3506"
        s (logId, inText, checkFlag, setlType,setlTypeDesc) = ""
        s traceCodeArr = []
        s traceCodeObj = {}
        s logId = $o(^BS.PHA.IN.InsuDataLogI("TypePointerManf",methodType," "_intrId," 1",""))
        if (logId '= "") {
            s insuLogData = ^BS.PHA.IN.InsuDataLogD(logId)
            s inText = $lg(insuLogData, 5) 
            s outText = $lg(insuLogData, 11) 
            s checkFlag = $lg(insuLogData,7)
            q:(pChFlag'="A")&&(pChFlag'=checkFlag)
            s setlType = $lg(insuLogData, 3)
            if checkFlag="Y" {
                s text = inText
                s text = ##class(PHA.COM.JSONUtils).ToObject(text)
                s upTraceCodeArr = text.input.selinfo.drugtracinfo
                if upTraceCodeArr'="" {
                    s upNum = upTraceCodeArr.%Size()  // 兼容老版
                }
                
            }
        } else {
            s setlType = ##class(PHA.FACE.TPS.INSUTE.Com).GetSetlType(oeori, oeore)                
        }
        q:(pSelType '= "")&&(pSelType '= setlType)
        s equalFlag = 0
        if ((needNum=acNum)&&(upNum=acNum)) {
            s equalFlag = 1 
        }
        q:(pScanStatus="Y")&&(acNum=0)
        q:(pScanStatus="N")&&(equalFlag=1)
        q:(pScanStatus="N")&&(acNum>0)
        q:(pChFlag'="A")&&(pChFlag'=checkFlag)
        s scanFlag = 0
        s traceCode = "",trdnFlag=""
        if (+acNum=0) {
            if ((acBQty # inciFac) '= 0 ) {
                s trdnFlag =1   
            }
            s traceCodeObj.trdnFlag = trdnFlag
        } else {
            s tbpId = ""
            for {
                s tbpId = $o(^INCTBPi("TypePointer",dspType,intrId,tbpId))  q:(tbpId = "")
                continue:('$d(^INCTBP(tbpId)))
                s traceCode = $p(^INCTBP(tbpId),"^",9)
                s trdnFlag = $p(^INCTBP(tbpId),"^",12)
                // 扫码情况以实际绑定追溯码为准,上传状态由上方"成功标志"按日志过滤
                s traceCodeObj.trdnFlag = trdnFlag
                d traceCodeArr.%Push(traceCode)
                s scanFlag = 1
            }
        }
        s traceCodeObj."drugtracinfo" = traceCodeArr
        s traceCodeInfo = traceCodeObj.%ToJSON()
    } else {
        s setlType = ##class(PHA.FACE.TPS.INSUTE.Com).GetSetlType(oeori, oeore)
        q:(pSelType '= "")&&(pSelType '= setlType)                
        q:(pChFlag'="A")&&(pChFlag'=checkFlag)
    }
    s setlTypeDesc = $case(setlType, 1 : "医保结算", 2 : "自费结算", : "")
    s count = count + 1
    s intrTypeDesc = $case(dspType, "F" : "门诊发药", "H" : "门诊退药", "P" : "住院发药", "Y" : "住院退药", : "")
    
    s data1 = $lb(logId, dspType, intrId, inText, checkFlag)
    s data2 = $lb(insuCode,insuDesc, traceCodeInfo, patNo, patName)
    s data3 = $lb(setlId, mdtrtSn, admTypeDesc, trdnFlag, setlTypeDesc)
    s data4 = $lb(intrTypeDesc, scanFlag, outText, oeore)
    
    s ^||TMP("PHA", $CLASSNAME(), "GetDrugScanInfo", pid, count) = data1_data2_data3_data4
    q
}

/// 获取台帐中的执行记录ID
ClassMethod GetTransOeore(intr) As %String
{
    q:(intr = "") ""
	s type = $p(^DHCINTR(intr),"^",1)
    s pointer = $p(^DHCINTR(intr),"^",9)
    if (type = "P") {
		s dspIdStr = $p(^DHCPHAC(+pointer, "I", $p(pointer,"||",2)),"^",13)
		s dspId = $p(dspIdStr,",",1)
	}elseif (type = "Y") {
		s dspId = $p(^PHARET(+pointer, "I", $p(pointer,"||",2)),"^",13)
	}elseif (type = "F") {
		s oeori = $p(^DHCPHDI(+pointer,"PHDI",$p(pointer,"||",2)),"^",5)
		s dspId = $o(^DHCOEDISQTY(0,"OEORI",oeori,""))
	}elseif (type = "H") {
		s oeori = $p(^DHCPHRTI(+pointer,"RTI",$p(pointer,"||",2)),"^",2)
		s dspId = $o(^DHCOEDISQTY(0,"OEORI",oeori,""))
	}else{
		s dspId = ""
	}
	q:(dspId = "") ""
	s oeore = $p(^DHCOEDISQTY(dspId),"^",3)
	q oeore
}

/// Description:新建临时global的计数器
/// Creator:    hulihua
/// CreateDate: 2016-06-05
/// Table:      
/// Input:      
/// Output:     
/// Return：
/// w ##class(PHA.DTC.Stat.ScanRatio).NewPid()
ClassMethod NewPid() As %String
{
    Q $I(^PHAPID("PHA",$CLASSNAME()))
}

/// Description: 3563调用：根据当前行上传日志入参中的配送批次流水号(fixmedins_bchno),调用3563接口获取配送明细
/// Creator:    AI
/// CreateDate: 2026-08-23
/// Table:      BS_PHA_IN.InsuDataLog / SQLUser.DHC_InsuDelivery / DHC_INTRANS
/// Input:      logId-上传日志ID, HospId-院区ID, LocId-科室ID, UserId-操作员ID
/// Output:     
/// Return:     成功 {"code":0,"serialNo":"..","vendorName":"..","rows":[{VendorName,SerialNo,InsuCode,InsuName,IngrDate}...]}
///             失败 {"code":-1,"msg":".."}
/// Others:     展示按 医保码+药品名称 去重; 入库时间取HIS入库单入库日期
/// Debug:      w ##class(PHA.DTC.Query.DispScan).Get3563DlvData("1100256","2","244","1")
ClassMethod Get3563DlvData(logId As %String, HospId As %String = "", LocId As %String = "", UserId As %String = "") As %String
{
    s rtn = {}
    s rtn.code = 0
    q:(logId = "") ..DlvErr(rtn, "上传日志ID不能为空！")
    q:'$d(^BS.PHA.IN.InsuDataLogD(logId)) ..DlvErr(rtn, "上传日志不存在！")
    s insuLogData = ^BS.PHA.IN.InsuDataLogD(logId)
    s inText = $lg(insuLogData, 5)
    q:(inText = "") ..DlvErr(rtn, "上传日志入参为空，无法获取配送批次流水号！")
    // 从入参取配送批次流水号(fixmedins_bchno), 3505用selinfo, 3505A/退药用selinfoDetail
    s inObj = ##class(PHA.COM.JSONUtils).ToObject(inText)
    q:'$isobject(inObj) ..DlvErr(rtn, "上传日志入参解析失败！")
    s selObj = ""
    s tmpObj = inObj.%Get("input")
    if ($isobject(tmpObj)) {
        if ($isobject(tmpObj.%Get("selinfo"))) {
            s selObj = tmpObj.%Get("selinfo")
        }
        if ($isobject(tmpObj.%Get("selinfoDetail"))) {
            s selObj = tmpObj.%Get("selinfoDetail")
        }
    }
    q:'$isobject(selObj) ..DlvErr(rtn, "入参中未找到销售信息节点！")
    s serialNo = ""
    s hisInsuCode = ""
    s hisInsuName = ""
    if ($isobject(selObj)) {
        s serialNo = selObj.%Get("fixmedins_bchno")
        s hisInsuCode = selObj.%Get("fixmedins_hilist_id")
        s hisInsuName = selObj.%Get("fixmedins_hilist_name")
    }
    s:serialNo'="" serialNo = $zstrip(serialNo, "<>")
    s:hisInsuCode'="" hisInsuCode = $zstrip(hisInsuCode, "<>")
    s:hisInsuName'="" hisInsuName = $zstrip(hisInsuName, "<>")
    q:(serialNo = "") ..DlvErr(rtn, "入参中未找到配送批次流水号(fixmedins_bchno)！")
    // 按配送批次流水号查供应商(优先3563配送下载落库表DHC_InsuDelivery,表不存在或无数据时兜底HIS入库单)
    s vendorId = "", vendorName = ""
    if ($d(^User.DHCInsuDeliveryD)) {
        s stmt = ##class(%SQL.Statement).%New()
        s sc = stmt.%Prepare("SELECT TOP 1 DLV_VendorId, DLV_VendorName FROM SQLUser.DHC_InsuDelivery WHERE DLV_BatchSerialNo = ? ORDER BY DLV_Rowid DESC")
        if ($$$ISOK(sc)) {
            s rset = stmt.%Execute(serialNo)
            if (rset.%Next()) {
                s vendorId = rset.%Get("DLV_VendorId")
                s vendorName = rset.%Get("DLV_VendorName")
            }
        }
    }
    // 兜底: 遍历HIS入库单,按配送批次流水号(^46=approvalNo)匹配取供应商
    if (vendorId = "") {
        s ingr = ""
        for {
            s ingr = $o(^DHCINGR(ingr))  q:(ingr = "")
            continue:('$d(^DHCINGR(ingr)))
            s ingrData = $g(^DHCINGR(ingr))
            s approvalNo = $p(ingrData, "^", 46)
            continue:(approvalNo '= serialNo)
            s vendorId = $p(ingrData, "^", 3)
            s vendorName = $p($g(^APC("APCVM", +vendorId)), "^", 3)
            q:(vendorId '= "")
        }
    }
    q:(vendorId = "") ..DlvErr(rtn, "未找到该配送批次的供应商信息，请先完成3563配送下载！")
    // 调用3563接口下载该配送批次明细(下载+校验不入库)
    s $zt = "Dlv3563Error"
    s ret = ##class(PHA.FACE.TPS.INSUTE.Download2).ValidateOnly(serialNo, vendorId, LocId, "Y", HospId, UserId)
    s retObj = {}
    if (ret '= "") {
        s retObj = {}.%FromJSON(ret)
    }
    if ('$isobject(retObj)) {
        s rtn.code = -2
        s rtn.msg = "3563接口返回解析失败！"
        q rtn.%ToJSON()
    }
    if (retObj.%Get("code") '= 0) {
        s rtn.code = -2
        s rtn.msg = retObj.%Get("msg")
        q rtn.%ToJSON()
    }
    // 入库时间取HIS入库单入库日期(按 供应商+配送批次流水号 反查入库单)
    s ingr = $o(^DHCINGR(0,"APCVMApprovalNo",vendorId,serialNo,""),-1)
    s ingrDate = ""
    if (ingr '= "") {
        s ingrDate = $p($g(^DHCINGR(ingr)), "^", 14)
        if (ingrDate '= "") {
            s ingrDate = $zd(ingrDate, 3)
        }
    }
    // 按 医保码+药品名称 去重后组装返回
    s rows = retObj.%Get("rows")
    s dlvRows = []
    k dlvKey
    if ($isobject(rows)) {
        for i = 0:1:(rows.%Size() - 1) {
            s row = rows.%Get(i)
            s insuCode = $zstrip(row.%Get("insuCode"), "<>")
            s insuName = $zstrip(row.%Get("insuName"), "<>")
            s insuSpec = $zstrip(row.%Get("spec"), "<>")
            s key = insuCode_"^"_insuName
            continue:$d(dlvKey(key))
            s dlvKey(key) = ""
            s rowObj = {}
            s rowObj.VendorName = vendorName
            s rowObj.SerialNo = serialNo
            s rowObj.InsuCode = insuCode
            s rowObj.InsuName = insuName
            s rowObj.InsuSpec = insuSpec
            s rowObj.IngrDate = ingrDate
            // HIS上传医保码固定显示当前行药品入参的fixmedins_hilist_id(每行都显示); NameSame/CodeSame 仅用于前端标色
            s rowObj.HisInsuCode = ""
            s rowObj.NameSame = 0
            s rowObj.CodeSame = 0
            if (hisInsuCode '= "") {
                s rowObj.HisInsuCode = hisInsuCode
                s rowObj.HisInsuName = hisInsuName
                if (insuCode = hisInsuCode) {
                    s rowObj.CodeSame = 1
                }
                if ((hisInsuName '= "")&&(insuName '= "")) {
                    if ((insuName = hisInsuName)||($f(insuName, hisInsuName) > 0)||($f(hisInsuName, insuName) > 0)) {
                        s rowObj.NameSame = 1
                    }
                }
            }
            d dlvRows.%Push(rowObj)
        }
    }
    // 删除3563接口下载的临时文件(数据已解析返回,文件不再需要)
    s dlvPath = retObj.%Get("path")
    if (dlvPath '= "") {
        d ##class(%File).Delete(dlvPath)
    }
    s rtn.code = 0
    s rtn.serialNo = serialNo
    s rtn.vendorName = vendorName
    s rtn.rows = dlvRows
    q rtn.%ToJSON()
Dlv3563Error
    s $zt = ""
    s rtn.code = -3
    s rtn.msg = "调用3563接口异常："_$ze
    q rtn.%ToJSON()
}

/// 组装3563调用失败返回
ClassMethod DlvErr(rtn As %DynamicObject, msg As %String) As %String
{
    s rtn.code = -1
    s rtn.msg = msg
    q rtn.%ToJSON()
}

}
