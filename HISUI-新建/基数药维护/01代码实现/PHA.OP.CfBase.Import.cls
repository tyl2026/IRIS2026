/// Description: 门诊药房基数药维护 - Excel数据导入
/// 数据表: ^DHCPHBMED(phbr) = 药品(ARCIM rowid)^用法(PHCIN)^开单科室(CTLOC)^取药科室(CTLOC)^备注^类型(O/I)^使用科室(CTLOC)
/// 匹配方式: 全部按代码匹配(药品=ARCIM代码, 科室=CTLOC代码, 用法=PHCIN代码/名称兜底)
/// 去重规则: 类型+药品+开单科室+取药科室 完全相同则跳过
/// Creator:   AI
/// CreateDate: 2026-08-22
Class PHA.OP.CfBase.Import Extends %Library.RegisteredObject [ ProcedureBlock ]
{

/// 导入基数药维护数据
/// 入参: pJsonStr = {"hospId":"院区ID", "rows":[{"baseMedType":"O/I/门诊/住院","arcItmCode":"药品代码","instCode":"用法代码","docLocCode":"开单科室代码","useLocCode":"取药科室代码","exeLocCode":"使用科室代码","remarks":"备注"}]}
/// 返回: {"success":"Y"/"N","ok":成功条数,"skip":跳过条数,"err":失败条数,"msg":"提示","errRows":[{"row":第几条,"msg":"失败原因"}]}
/// w ##class(PHA.OP.CfBase.Import).ImportBaseMed("{\"hospId\":\"\",\"rows\":[{\"baseMedType\":\"O\",\"arcItmCode\":\"XJ01XXW070A001010105001\",\"docLocCode\":\"36\",\"useLocCode\":\"38\"}]}")
ClassMethod ImportBaseMed(pJsonStr As %String) As %String
{
	s pJson=##class(PHA.COM.Json).Parse(pJsonStr)
	q:'$IsObject(pJson) ..Err("入参JSON解析失败")
	s rows=pJson.%Get("rows")
	q:'$IsObject(rows) ..Err("没有可导入的数据")
	s rowCnt=rows.%Size()
	q:rowCnt=0 ..Err("没有可导入的数据")
	s hospId=$zstrip(pJson.%Get("hospId"),"<>W")
	
	; ==== 1.预构建字典代码映射 ====
	; 药品代码 -> ARCIM rowid(sub||ver), 优先用索引, 索引无数据时兜底扫描
	s arcId=""
	f  s arcId=$o(^ARCIM(0,"Code",arcId)) q:arcId=""  d
	.s arcRowId=$g(^ARCIM(0,"Code",arcId))
	.q:arcRowId=""
	.s arcMap(arcId)=..NormArcRowId(arcRowId)
	if $d(arcMap)=0 {
		s sub=""
		f  s sub=$o(^ARCIM(sub)) q:sub=""  d
		.q:+sub=0
		.s ver=""
		.f  s ver=$o(^ARCIM(sub,ver)) q:ver=""  d
		..s code=$p($g(^ARCIM(sub,ver,1)),"^",1)
		..q:code=""
		..s arcMap(code)=sub_"||"_ver
	}
	; 科室代码 -> CTLOC rowid, 优先用索引, 索引无数据时兜底扫描
	s locId=""
	f  s locId=$o(^CTLOC(0,"Code",locId)) q:locId=""  d
	.s locRowId=$g(^CTLOC(0,"Code",locId))
	.q:locRowId=""
	.s locMap(locId)=locRowId
	if $d(locMap)=0 {
		s locId=""
		f  s locId=$o(^CTLOC(locId)) q:locId=""  d
		.q:+locId=0
		.s locCode=$p($g(^CTLOC(locId)),"^",1)
		.q:locCode=""
		.s locMap(locCode)=locId
	}
	; 用法代码 -> PHCIN rowid(^PHCIN(id)=代码^名称), 代码匹配不上时用名称兜底
	s instId=""
	f  s instId=$o(^PHCIN(instId)) q:instId=""  d
	.q:+instId=0
	.s instCode=$p($g(^PHCIN(instId)),"^",1)
	.s:instCode'="" instMap(instCode)=instId
	.s instDesc=$p($g(^PHCIN(instId)),"^",2)
	.s:instDesc'="" instDescMap(instDesc)=instId
	
	; ==== 2.已存在记录集合(类型^药品^开单科室^取药科室) ====
	s phbr=""
	f  s phbr=$o(^DHCPHBMED(phbr)) q:phbr=""  d
	.q:+phbr=0
	.s bmData=$g(^DHCPHBMED(phbr))
	.q:bmData=""
	.s existKey=$p(bmData,"^",6)_"^"_$p(bmData,"^",1)_"^"_$p(bmData,"^",3)_"^"_$p(bmData,"^",4)
	.s existSet(existKey)=""
	
	; ==== 3.逐行校验并写入 ====
	l +^DHCPHBMED:10
	else  q ..Err("系统繁忙,请稍后重试")
	s okCnt=0,skipCnt=0,errCnt=0
	s errRows=[]
	s errFlag=0
	s errMsg=""
	s nextId=+$o(^DHCPHBMED(""),-1)
	ts
	try {
		for i=0:1:(rowCnt-1) {
			s row=rows.%Get(i)
			s baseMedType=$zstrip(row.%Get("baseMedType"),"<>W")
			s arcItmCode=$zstrip(row.%Get("arcItmCode"),"<>W")
			s instCode=$zstrip(row.%Get("instCode"),"<>W")
			s docLocCode=$zstrip(row.%Get("docLocCode"),"<>W")
			s useLocCode=$zstrip(row.%Get("useLocCode"),"<>W")
			s exeLocCode=$zstrip(row.%Get("exeLocCode"),"<>W")
			s remarks=$zstrip(row.%Get("remarks"),"<>W")
			; 类型归一化: 门诊/住院 或 O/I
			s baseMedType=$case(baseMedType, "门诊":"O", "住院":"I", "O":"O", "I":"I", :"")
			; 校验必填与代码匹配
			s errTxt=""
			i baseMedType="" s errTxt=errTxt_"类型无效;"
			s arcItmRowId=$g(arcMap(arcItmCode))
			i arcItmRowId="" s errTxt=errTxt_"药品代码未匹配;"
			s docLocRowId=$g(locMap(docLocCode))
			i docLocRowId="" s errTxt=errTxt_"开单科室代码未匹配;"
			s useLocRowId=$g(locMap(useLocCode))
			i useLocRowId="" s errTxt=errTxt_"取药科室代码未匹配;"
			s exeLocRowId=$g(locMap(exeLocCode))
			i (exeLocCode'="")&&(exeLocRowId="") s errTxt=errTxt_"使用科室代码未匹配;"
			s instRowId=$g(instMap(instCode))
			i instRowId="" s instRowId=$g(instDescMap(instCode))
			i (instCode'="")&&(instRowId="") s errTxt=errTxt_"用法代码未匹配;"
			; 院区校验: 科室已挂院区且与当前院区不一致时提示(未挂院区不拦截)
			i (hospId'="")&&(docLocRowId'="")&&($p($g(^CTLOC(docLocRowId)),"^",22)'="")&&($p($g(^CTLOC(docLocRowId)),"^",22)'=hospId) s errTxt=errTxt_"开单科室不属于当前院区;"
			i (hospId'="")&&(useLocRowId'="")&&($p($g(^CTLOC(useLocRowId)),"^",22)'="")&&($p($g(^CTLOC(useLocRowId)),"^",22)'=hospId) s errTxt=errTxt_"取药科室不属于当前院区;"
			if errTxt'="" {
				s errCnt=errCnt+1
				d errRows.%Push({ "row": (i+1), "msg": (errTxt) })
				continue
			}
			; 去重: 类型+药品+开单科室+取药科室 已存在则跳过
			s existKey=baseMedType_"^"_arcItmRowId_"^"_docLocRowId_"^"_useLocRowId
			if $d(existSet(existKey)) {
				s skipCnt=skipCnt+1
				continue
			}
			s nextId=nextId+1
			s ^DHCPHBMED(nextId)=arcItmRowId_"^"_instRowId_"^"_docLocRowId_"^"_useLocRowId_"^"_remarks_"^"_baseMedType_"^"_exeLocRowId
			s existSet(existKey)=""
			s okCnt=okCnt+1
		}
		tc
	} catch ex {
		tro
		s errFlag=1
		s errMsg="导入失败:"_ex.Name_":"_ex.Data
	}
	l -^DHCPHBMED
	q:errFlag ..Err(errMsg)
	s result={}
	d result.%Set("success","Y")
	d result.%Set("ok",okCnt)
	d result.%Set("skip",skipCnt)
	d result.%Set("err",errCnt)
	d result.%Set("msg","导入完成:成功"_okCnt_"条,跳过"_skipCnt_"条,失败"_errCnt_"条")
	d result.%Set("errRows",errRows)
	q result.%ToJSON()
}

/// 归一化ARCIM rowid为 sub||ver 格式
/// 索引^ARCIM(0,"Code",code)的值可能是 sub||ver / sub^ver / sub
ClassMethod NormArcRowId(arcRowId As %String) As %String
{
	q:arcRowId="" ""
	i arcRowId["||" q arcRowId
	i arcRowId["^" q $p(arcRowId,"^",1)_"||"_$p(arcRowId,"^",2)
	q arcRowId_"||1"
}

/// 构造失败返回
ClassMethod Err(msg As %String) As %String
{
	s result={}
	d result.%Set("success","N")
	d result.%Set("msg",msg)
	q result.%ToJSON()
}

}
