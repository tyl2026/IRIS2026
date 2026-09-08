/// Description:追溯码发退药-按结算日期统计扫码上传情况(独立查询入口)
/// Creator:    chenghsuo
/// CreatDate:  2025-08-18
/// Others:     独立页面专用查询,复用原有 PHA.DTC.Query.DispScan.GetDrugScanInfoBySettle 查询逻辑,固定按结算日期统计
/// Debug:      d ##class(%ResultSet).RunQuery("PHA.DTC.Query.DispScanSettle","GetSettleScanInfo","2025-07-16^2025-07-16^A^^2^^O^^^")
Class PHA.DTC.Query.DispScanSettle Extends %RegisteredObject
{

Query GetSettleScanInfo(inputStr = "") As websys.Query(ROWSPEC = "logId,type,intr,inText,checkFlag,insuCode,insuDesc,traceCodeInfo,patNo,patName,setlId,mdtrtSn,admTypeDesc,trdnFlag,setlTypeDesc,intrTypeDesc,scanFlag,outText,oeore") [ SqlProc ]
{
}

ClassMethod GetSettleScanInfoExecute(ByRef qHandle As %Binary, inputStr = "") As %Status
{
    set repid=$I(^CacheTemp)
    set qHandle=$lb(0,repid,0)
    set ind=1 
    s pStartDate = $p(inputStr,"^",1)   
    s pEndDate = $p(inputStr,"^",2)
    q:((pStartDate = "") || (pEndDate = "")) $$$OK
    
    // 复用原有按结算查询逻辑(入参布局与发退药查询一致:^15 传 Settle 按结算)
    s pid = ##class(PHA.DTC.Query.DispScan).GetDrugScanInfoBySettle(inputStr)
    q:pid="" $$$OK
    q:'$d(^||TMP("PHA", "PHA.DTC.Query.DispScan", "GetDrugScanInfo", pid)) $$$OK
    
    s count = 0
    for {
        s count = $o(^||TMP("PHA", "PHA.DTC.Query.DispScan", "GetDrugScanInfo", pid, count))  q:count=""
        s data = ^||TMP("PHA", "PHA.DTC.Query.DispScan", "GetDrugScanInfo", pid, count)
        set ^CacheTemp(repid,ind)=data
        set ind=ind+1
    }
    k ^||TMP("PHA", "PHA.DTC.Query.DispScan", "GetDrugScanInfo", pid)
    Set qHandle=$lb(0,repid,0)
    Quit $$$OK
}

}
