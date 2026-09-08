/// Description：进销存上传记录查询接口类(将已经上传的数据从医保平台拉下来展示，比记录的上传日志更准确)
/// Creator:     WangYaJun
/// CreateDate:  2024-08-27
/// d $system.OBJ.MakeClassDeployed("PHA.FACE.TPS.INSUTE.UpQuery")
Class PHA.FACE.TPS.INSUTE.UpQuery Extends Format
{

/// Description：查询接口入口
/// Creator:     WangYaJun
/// CreateDate:  2024-08-27	
/// Input：      院区ID^接口代码^用户ID^库存项ID^业务批次流水号^开始日期^截止日期^医保对接方^结算ID^就诊ID^药品追溯码^医疗目录编码^人员姓名
/// return：     失败：-1^错误信息
/// 			 成功：JSON字符串
/// w ##class(PHA.FACE.TPS.INSUTE.UpQuery).GetFaceData("2^3513^1^600049^26032310010159^2026-06-02^2026-06-02^1^4^1711503845^84128800369619874784^ZA16EAN0073020203884")
ClassMethod GetFaceData(Input As %String = "", LogFlag = "N")
{
	s hospId = $p(Input,"^",1)
	q:(##class(PHA.FACE.TPS.INSUTE.Data).CheckHosp(hospId) = 0) ..Error(-1,"GetFaceData:接口授权失败")
	s faceCode = $p(Input,"^",2)
	s userId = $p(Input,"^",3)
	s inciCode = $p(Input,"^",4)
	s batNo = $p(Input,"^",5)
	s mdtrtId = $p(Input,"^",10)
	q:(inciCode = "")&&(batNo = "")&&(mdtrtId = "") ..Error(-1,"GetFaceData:批次流水号、药品和就诊ID不能同时为空")
	s inci = ""
	s:inciCode'="" inci = $o(^INCI(0,"Code",$$ALPHAUP^SSUTIL4(inciCode),""),-1)
	s startDate = $p(Input,"^",6)
	s startDateH = ##class(websys.Conversions).DateHtmlToLogical(startDate)
	s startDate = $zd(startDateH,3)
	s endDate = $p(Input,"^",7)
	s endDateH = ##class(websys.Conversions).DateHtmlToLogical(endDate)
	s endDate = $zd(endDateH,3)
	s insuManf = $p(Input,"^",8)
	s selId = $p(Input,"^",9)
	s traceCode = $p(Input,"^",11)
	s medListCode = $p(Input,"^",12)
	// 未传医疗目录编码时，按库存项解析国家医保编码作为医疗目录编码(参照PHA.FACE.TPS.INSUTE.Com.GetInsuData)
	if ((medListCode = "")&&(inci'="")) {
		s medListCode = $p(##class(PHA.FACE.TPS.INSUTE.Com).GetInsuData(inci, hospId), "^", 1)
	}
	s psnName = $p(Input,"^",13)
	s comJson = ##class(PHA.COM.Object).%New()
	if (faceCode = "3513") {
		d comJson.Set("fixmedins_code",..GetInsuDictVal("InsuHospCode",hospId))
		d comJson.Set("medins_list_codg",medListCode)
		d comJson.Set("med_list_codg",medListCode)
		d comJson.Set("fixmedins_bchno",batNo)
		d comJson.Set("begndate",startDate)
		d comJson.Set("enddate",endDate)
		d comJson.Set("mdtrt_id",mdtrtId)
		d comJson.Set("psn_name",psnName)
		d comJson.Set("drug_trac_codg",traceCode)
	}else {
		d comJson.Set("fixmedins_code",..GetInsuDictVal("InsuHospCode",hospId))
		d comJson.Set("medins_list_codg",medListCode)
		d comJson.Set("med_list_codg",medListCode)
		d comJson.Set("fixmedins_bchno",batNo)
		d comJson.Set("begndate",startDate)
		d comJson.Set("enddate",endDate)
		d:selId'="" comJson.Set("setl_id",selId)
	}
	s inputObj = ##class(PHA.COM.Object).%New()
	s inputObj.data = comJson
	s inputJson = ..CreateInputJson(inputObj,hospId,faceCode,userId)
	q:($p(inputJson,"^",1) < 0) inputJson
	if (LogFlag = "Y") {
		s logStr = $lb(traceCode,"",inci,0)
		s insertRet = ##class(LogSave).SaveLog("Method"_faceCode, (inputJson.%ToJSON()), logStr, hospId, insuManf)
	}
	s retObj = ##class(PHA.FACE.TPS.INSUTE.Data).SendToInsuFace(inputJson, hospId, insuManf)
	if '$IsObject(retObj) {
		s errorRet = ..Error(-1,"医保接口INSUAPI:" _ $p(retObj,"^",2))
		if (LogFlag = "Y") {
			d ##class(LogSave).UpdateLog("Method"_faceCode, errorRet, traceCode, 0, "N", insuManf)
		}
		q errorRet
	}
	if 'retObj.%IsA("PHA.COM.Object") {
		s errorRet = ..Error(-1,"Request:出参JSON格式错误")
		if (LogFlag = "Y") {
			d ##class(LogSave).UpdateLog("Method"_faceCode, errorRet, traceCode, 0, "N", insuManf)
		}
		q errorRet
	}
	s infcode = retObj.infcode
	s retJsonStr = retObj.%ToJSON() 
	if (LogFlag = "Y") {
		d ##class(LogSave).UpdateLog("Method"_faceCode, retJsonStr, traceCode, 0, "Y", insuManf)
	}
	q:(infcode = 0) retJsonStr
	s errMsg = retObj."err_msg"
	q ..Error(-5,"接口提示:" _ errMsg)
}

/// Description：商品信息删除接口(3507)，根据批次流水号和进销存数据类型删除对应交易数据
/// Creator:     WangYaJun
/// CreateDate:  2026-09-01
/// Input：      院区ID^用户ID^批次流水号^进销存数据类型^医保对接方
/// return：     失败：-1^错误信息
/// 			 成功：JSON字符串(infcode=0时，含result节点：retRslt/msgRslt)
/// w ##class(PHA.FACE.TPS.INSUTE.UpQuery).DelFaceData("2^1^26032310010159^1^1")
ClassMethod DelFaceData(Input As %String = "")
{
	s hospId = $p(Input,"^",1)
	q:(##class(PHA.FACE.TPS.INSUTE.Data).CheckHosp(hospId) = 0) ..Error(-1,"DelFaceData:接口授权失败")
	s userId = $p(Input,"^",2)
	s batNo = $p(Input,"^",3)
	s invDataType = $p(Input,"^",4)
	s insuManf = $p(Input,"^",5)
	q:(batNo = "") ..Error(-1,"DelFaceData:批次流水号不能为空")
	q:(invDataType = "") ..Error(-1,"DelFaceData:进销存数据类型不能为空")
	s comJson = ##class(PHA.COM.Object).%New()
	d comJson.Set("fixmedins_bchno",batNo)
	d comJson.Set("inv_data_type",invDataType)
	s inputObj = ##class(PHA.COM.Object).%New()
	s inputObj.data = comJson
	s inputJson = ..CreateInputJson(inputObj,hospId,"3507",userId)
	q:($p(inputJson,"^",1) < 0) inputJson
	s retObj = ##class(PHA.FACE.TPS.INSUTE.Data).SendToInsuFace(inputJson, hospId, insuManf)
	if '$IsObject(retObj) {
		s errorRet = ..Error(-1,"医保接口INSUAPI:" _ $p(retObj,"^",2))
		q errorRet
	}
	if 'retObj.%IsA("PHA.COM.Object") {
		s errorRet = ..Error(-1,"Request:出参JSON格式错误")
		q errorRet
	}
	s infcode = retObj.infcode
	s retJsonStr = retObj.%ToJSON() 
	q:(infcode = 0) retJsonStr
	s errMsg = retObj."err_msg"
	q ..Error(-5,"接口提示:" _ errMsg)
}

/// ////////////////////// ////////////////////// ////////////////////// ///////////////////
/// ///////////////////上面为接口方法,下面为过程函数,请按此规则/////////////////////////////
/// ////////////////////// ////////////////////// ////////////////////// ///////////////////
/// Description：创建接口请求JSON
/// Creator:     WangYaJun
/// CreateDate:  2024-08-27
/// Input:       InputJson-各接口请求JSON数据
/// w ##class(PHA.FACE.TPS.INSUTE.UpQuery).CreateInputJson(##class(PHA.COM.Object).%New(),2,"3508",1)
ClassMethod CreateInputJson(InputJson As PHA.COM.Object, HospId, FaceCode, UserId, InsuManf = "1")
{
    q:'$IsObject(InputJson) ..Error(-1,"CreateHead:入参类型错误")
    q:'InputJson.%IsA("PHA.COM.Object") ..Error(-1,"CreateHead:入参类型错误") 
    s jsonObj = ##class(PHA.COM.Object).%New()
	s insuTypeCode = ..#InsuTypeCode
    d ..SetTitleData(jsonObj, UserId, HospId, InsuManf)
    d jsonObj.Set("infno",FaceCode)
    d jsonObj.Set("input",InputJson)
    q jsonObj
}

/// Description：获取日期初始化值，格式统一
ClassMethod GetDefDate()
{
    s startDate = ##class(websys.Conversions).DateLogicalToHtml(+$h)
    s endDate = ##class(websys.Conversions).DateLogicalToHtml(+$h)
    q startDate _"^"_ endDate
}

}
