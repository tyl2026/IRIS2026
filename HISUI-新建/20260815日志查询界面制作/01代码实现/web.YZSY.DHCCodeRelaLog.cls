/// Description: 入库3563追溯码下载异常日志查询界面后端
/// 数据来源: ^YZSY("SaveCodeRelaBy3563Excel",ingr)=tarId_"^"_ingrNo_"^"_approvalNo_"^"_insuCode_"^"_保存日期
/// Creator:    AI
/// CreateDate: 20260814
Class web.YZSY.DHCCodeRelaLog Extends DHCDoc.Util.RegisteredObject
{

/// 查询入库3563追溯码下载异常日志（服务端分页，Rows<=0 时返回全部，供导出）
/// w ##class(web.YZSY.DHCCodeRelaLog).QueryLog("","","","","",1,20)
ClassMethod QueryLog(StartDate As %String, EndDate As %String, IngrNo As %String, ApprovalNo As %String, InsuCode As %String, Page As %Integer = 1, Rows As %Integer = 20, TarName As %String = "", TarCode As %String = "") As %String
{
	s pid = $i(^||CacheTemp("DHCCodeRelaLog","PID"))
	k ^||CacheTemp("DHCCodeRelaLog","Query",pid)
	; 字符串日期转数字日期（内部 $H 格式）后才能正确比较
	if (StartDate["-") s StartDate = $zdh(StartDate,3)
	if (EndDate["-") s EndDate = $zdh(EndDate,3)
	s idx = 0
	s ingr = ""
	f {
		s ingr = $o(^YZSY("SaveCodeRelaBy3563Excel",ingr))
		q:ingr=""
		s data = $g(^YZSY("SaveCodeRelaBy3563Excel",ingr))
		continue:data=""
		s tarId = $p(data,"^",1)
		s ingrNoV = $p(data,"^",2)
		s approvalNoV = $p(data,"^",3)
		s insuCodeV = $p(data,"^",4)
		s saveDate = $zdh($p(data,"^",5),3)
		s tarNameV = $p($g(^DHCTARI(tarId)),"^",2)
		s tarCodeV = $p($g(^DHCTARI(tarId)),"^",1)
		continue:(StartDate'="")&&(saveDate<StartDate)
		continue:(EndDate'="")&&(saveDate>EndDate)
		continue:(IngrNo'="")&&(ingrNoV'[IngrNo)
		continue:(ApprovalNo'="")&&(approvalNoV'[ApprovalNo)
		continue:(InsuCode'="")&&(insuCodeV'[InsuCode)
		continue:(TarName'="")&&(tarNameV'[TarName)
		continue:(TarCode'="")&&(tarCodeV'[TarCode)
		s idx = idx + 1
		s ^||CacheTemp("DHCCodeRelaLog","Query",pid,idx) = ingr_"^"_data
	}
	s total = idx
	s page = +$g(Page)
	s rows = +$g(Rows)
	s:page<1 page = 1
	s:rows<0 rows = 0
	s json = "{""total"":" _ total _ ",""rows"":["
	s first = 1
	if (rows > 0) {
		s offset = (page - 1) * rows
		s startIdx = total - offset
		s:startIdx<1 startIdx = 1
		s endIdx = (startIdx - rows) + 1
		s:endIdx<1 endIdx = 1
		f i = startIdx:-1:endIdx {
			s line = $g(^||CacheTemp("DHCCodeRelaLog","Query",pid,i))
			continue:line=""
			s:'first json = json _ ","
			s first = 0
			s json = json _ ..BuildRow($p(line,"^",1),$p(line,"^",2,99))
		}
	} else {
		f i = total:-1:1 {
			s line = $g(^||CacheTemp("DHCCodeRelaLog","Query",pid,i))
			continue:line=""
			s:'first json = json _ ","
			s first = 0
			s json = json _ ..BuildRow($p(line,"^",1),$p(line,"^",2,99))
		}
	}
	s json = json _ "]}"
	k ^||CacheTemp("DHCCodeRelaLog","Query",pid)
	q json
}

/// 组装一行日志 JSON
ClassMethod BuildRow(ingrId As %String, data As %String) As %String
{
	s tarId = $p(data,"^",1)
	s ingrNoV = $p(data,"^",2)
	s approvalNoV = $p(data,"^",3)
	s insuCodeV = $p(data,"^",4)
	s saveDate = $p(data,"^",5)
	s tarCode = $p($g(^DHCTARI(tarId)),"^",1)
	s tarName = $p($g(^DHCTARI(tarId)),"^",2)
	s tarConRaw = ..GetTarConRaw(tarId)
	s insuConInfo = ..FormatInsuCon(tarConRaw)
	s insuConMatch = ..InsuConMatched(tarConRaw, insuCodeV)
	s ingrDate = ""
	s vendorName = ""
	if ($d(^DHCINGR(ingrId))) {
		s ingrData = ^DHCINGR(ingrId)
		s ingrDate = $p(ingrData,"^",14)
		s vendorName = $p($g(^APC("APCVM",$p(ingrData,"^",3))),"^",3)
	}
	s ingrDateV = ..FmtDate(ingrDate)
	s json = "{""IngrId"":""" _ ..JsonEsc(ingrId) _ """"
	s json = json _ ",""TarId"":""" _ ..JsonEsc(tarId) _ """"
	s json = json _ ",""TarCode"":""" _ ..JsonEsc(tarCode) _ """"
	s json = json _ ",""TarName"":""" _ ..JsonEsc(tarName) _ """"
	s json = json _ ",""IngrNo"":""" _ ..JsonEsc(ingrNoV) _ """"
	s json = json _ ",""VendorName"":""" _ ..JsonEsc(vendorName) _ """"
	s json = json _ ",""ApprovalNo"":""" _ ..JsonEsc(approvalNoV) _ """"
	s json = json _ ",""InsuCode"":""" _ ..JsonEsc(insuCodeV) _ """"
	s json = json _ ",""InsuConInfo"":""" _ ..JsonEsc(insuConInfo) _ """"
	s json = json _ ",""InsuConMatch"":""" _ insuConMatch _ """"
	s json = json _ ",""SaveDate"":""" _ ..JsonEsc(saveDate) _ """"
	s json = json _ ",""IngrDate"":""" _ ..JsonEsc(ingrDateV) _ """}"
	q json
}

/// 根据收费项ID获取HIS医保对照原始返回
/// 调 web.DHCINSUPort.GetTarConUpFlag(TarDr,"00A",2)
/// 返回格式: 每条=状态^医保Rowid^医保编码^医保描述，多条用!分割
ClassMethod GetTarConRaw(TarDr As %String) As %String
{
	q:TarDr="" ""
	q ##class(web.DHCINSUPort).GetTarConUpFlag(TarDr, "00A", 2)
}

/// 原始对照信息转可读文本
/// 状态: -1未对照 0对照未上穿 1目录上传医保中 2目录中心已审核 3目录中心审核不通过
ClassMethod FormatInsuCon(ret As %String) As %String
{
	q:ret="" "未对照"
	s out = ""
	for i = 1:1:$l(ret, "!") {
		s seg = $p(ret, "!", i)
		continue:seg=""
		s flag = $p(seg, "^", 1)
		s code = $p(seg, "^", 3)
		s desc = $p(seg, "^", 4)
		s flagText = $case(flag,
			"-1":"未对照", "0":"对照未上穿", "1":"目录上传医保中",
			"2":"目录中心已审核", "3":"目录中心审核不通过",
			:"状态"_flag)
		s segOut = flagText
		s:code'="" segOut = segOut _ " " _ code
		s:desc'="" segOut = segOut _ " " _ desc
		s:out'="" out = out _ "；"
		s out = out _ segOut
	}
	q out
}

/// 对照医保编码是否与日志医保编码一致（一致返回1）
ClassMethod InsuConMatched(ret As %String, insuCode As %String) As %Integer
{
	s matchFlag = 0
	if (insuCode = "") {
		q matchFlag
	}
	if (ret = "") {
		q matchFlag
	}
	s cnt = $l(ret, "!")
	for i = 1:1:cnt {
		s seg = $p(ret, "!", i)
		if (seg '= "") {
			if ($p(seg, "^", 3) = insuCode) {
				s matchFlag = 1
			}
		}
	}
	q matchFlag
}

/// 入库单主档+明细（点击入库单号下钻弹窗）
/// w ##class(web.YZSY.DHCCodeRelaLog).GetIngrDetail(123)
ClassMethod GetIngrDetail(IngrId As %String) As %String
{
	q:IngrId="" "{""main"":{},""items"":[]}"
	q:'$d(^DHCINGR(IngrId)) "{""main"":{},""items"":[]}"
	s ingrData = $g(^DHCINGR(IngrId))
	s ingrNo = $p(ingrData,"^",1)
	s vendorId = $p(ingrData,"^",3)
	s vendorName = $p($g(^APC("APCVM",vendorId)),"^",3)
	s doDate = $p(ingrData,"^",4)
	s locId = $p(ingrData,"^",13)
	s locName = $p($g(^CTLOC(locId)),"^",2)
	s createDate = $p(ingrData,"^",14)
	s createTime = $p(ingrData,"^",15)
	s createUser = $p(ingrData,"^",16)
	s userName = $p($g(^SSU("SSUSR",createUser)),"^",2)
	s approvalNo = $p(ingrData,"^",46)
	s main = "{""IngrId"":""" _ ..JsonEsc(IngrId) _ """"
	s main = main _ ",""IngrNo"":""" _ ..JsonEsc(ingrNo) _ """"
	s main = main _ ",""VendorId"":""" _ ..JsonEsc(vendorId) _ """"
	s main = main _ ",""VendorName"":""" _ ..JsonEsc(vendorName) _ """"
	s main = main _ ",""LocName"":""" _ ..JsonEsc(locName) _ """"
	s main = main _ ",""CreateDate"":""" _ ..FmtDate(createDate) _ """"
	s main = main _ ",""CreateTime"":""" _ ..FmtTime(createTime) _ """"
	s main = main _ ",""UserName"":""" _ ..JsonEsc(userName) _ """"
	s main = main _ ",""ApprovalNo"":""" _ ..JsonEsc(approvalNo) _ """"
	s main = main _ ",""DoDate"":""" _ ..FmtDate(doDate) _ """}"
	s json = "{""main"":" _ main _ ",""items"":["
	s first = 1
	s sub = 0
	f {
		s sub = $o(^DHCINGR(IngrId,"GRI",sub))
		q:sub=""
		s itm = $g(^DHCINGR(IngrId,"GRI",sub))
		s inci = $p(itm,"^",25)
		s inciCode = $p($g(^INCI(inci,1)),"^",1)
		s inciDesc = $p($g(^INCI(inci,1)),"^",2)
		s stkDesc = $p(itm,"^",2)
		s:stkDesc'="" inciDesc = stkDesc
		s batNo = $p(itm,"^",13)
		s expDate = $p(itm,"^",9)
		s qty = $p(itm,"^",4)
		s uomId = $p(itm,"^",10)
		s uomDesc = $p($g(^CT("UOM",uomId)),"^",2)
		s rp = $p(itm,"^",30)
		s amt = $p(itm,"^",11)
		s:'first json = json _ ","
		s first = 0
		s json = json _ "{""Sub"":""" _ sub _ """"
		s json = json _ ",""InciCode"":""" _ ..JsonEsc(inciCode) _ """"
		s json = json _ ",""InciDesc"":""" _ ..JsonEsc(inciDesc) _ """"
		s json = json _ ",""BatNo"":""" _ ..JsonEsc(batNo) _ """"
		s json = json _ ",""ExpDate"":""" _ ..FmtDate(expDate) _ """"
		s json = json _ ",""Qty"":""" _ ..JsonEsc(qty) _ """"
		s json = json _ ",""UomDesc"":""" _ ..JsonEsc(uomDesc) _ """"
		s json = json _ ",""Rp"":""" _ ..JsonEsc(rp) _ """"
		s json = json _ ",""Amt"":""" _ ..JsonEsc(amt) _ """}"
	}
	s json = json _ "]}"
	q json
}

/// JSON 字符串值转义（反斜杠/双引号/控制字符）
ClassMethod JsonEsc(str As %String) As %String
{
	s str = $replace(str,"\","\\")
	s str = $replace(str,"""","\""")
	s str = $replace(str,$c(13),"")
	s str = $replace(str,$c(10),"")
	q str
}

/// 日期转显示格式 yyyy-MM-dd
ClassMethod FmtDate(dateVal As %String) As %String
{
	q:dateVal="" ""
	q:$isvalidnum(dateVal)&&(dateVal>0) $zd(dateVal,3)
	q dateVal
}

/// 时间转显示格式 HH:mm:ss
ClassMethod FmtTime(timeVal As %String) As %String
{
	q:timeVal="" ""
	q:$isvalidnum(timeVal) $zt(timeVal,1)
	q timeVal
}

}
