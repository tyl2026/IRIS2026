Class web.YZSY.DHCMRInfoHQMSImport Extends DHCDoc.Util.RegisteredObject
{

/// 暂存批次 Global 根
Parameter GLOBAL = "^web.YZSY.DHCMRInfoHQMSImp";

/// 列表/编辑常用展示字段（码），界面核对与行编辑默认展示
Parameter CORE = "A01^A02^A48^A49^A20^A11^A12C^A13^A21C^A19C^B12^B15^B11C^B13C^B16C^B20^C01C^C02N^C03C^C04N^C05C^C14x01C^C15x01N^C16x01^C24C^C25^C26C^C27C^D01";

/// 控制列（不允许作为映射目标）
Parameter CTRL = "BatchNo^SrcRowNo^SrcFileName^ImpUser^ImpDate^ImpTime";

/// 不做字典校验的值域（本地码/层级码与接口文档键格式不一致）
Parameter NOCHECKDIC = "RC013^RC015^RC023^RC036";

/// 必填且不允许为"-"的核心字段（按接口文档必填①从紧控制）
Parameter REQUIRED = "A11^A12C^A13^A48^A49^A20^B12^B15^C01C^C02N^C03C^C04N";

/// 必填但允许填"-"的字段（A20 证件号码：无有效证件时允许填"-"，见接口文档说明）
Parameter DASHOK = "A20";

/// 原始文件归档目录
Parameter ARCHIVEDIR = "/tmp/hqms/archive/";

/// 单行最大字符数（行宽防护，接近 IRIS 单节点上限前拦截）
Parameter MAXROWSIZE = 28000;

/// 查找同指纹批次，返回 "批次号^状态^创建时间^文件名" 或 ""
ClassMethod FindDupBatch(fp As %String) As %String
{
	q:fp="" ""
	s g = ..#GLOBAL
	s id = ""
	s dup = ""
	for {
		s id = $o(@g@("Batch",id))
		q:id=""
		s info = $g(@g@("Batch",id,"Info"))
		if $p(info,"^",8) = fp {
			s stTxt = $s($p(info,"^",4) = "1":"已导入", 1:"待导入")
			s dup = id_"^"_stTxt_"^"_$p(info,"^",6)_" "_$p(info,"^",7)_"^"_$p(info,"^",1)
		}
	}
	q dup
}

/// 前端本地解析后提交（参照基数药维护导入模式）：不走上传页，直接收 JSON
/// dataJSON: {"headers":["A01",...],"rows":[["值",...],...]}
ClassMethod ImportFileFromJS(fileName As %String, dataJSON As %String) As %String
{
	s g = ..#GLOBAL
	s fnErr = ..CheckFileName(fileName)
	if fnErr '= "" q "{""success"":0,""msg"":""文件命名不符合要求("_fnErr_")，文件名须为年月，例如 202601.csv""}"
	if dataJSON = "" q "{""success"":0,""msg"":""提交数据为空""}"

	; 指纹（基于提交内容，防重复导入）
	s fp = ..FingerprintStr(dataJSON)
	s dup = ..FindDupBatch(fp)
	if dup '= "" q "{""success"":0,""dup"":1,""msg"":""该文件已导入过(批次 "_$p(dup,"^",1)_"，"_$p(dup,"^",2)_"，"_$p(dup,"^",3)_")。如需重新导入，请先对该批次执行【删除导入数据】后再上传。""}"

	s errTxt = ""
	s batchId = 0
	s rowNo = 0
	s badCount = 0
	s colCount = 0
	try {
		s obj = [].%FromJSON(dataJSON)
		s hdr = obj.headers
		s rows = obj.rows
		s colCount = hdr.%Size()
		if colCount = 0 { s errTxt = "表头为空" }
		else {
			s batchId = $g(@g@("Seq")) + 1
	s @g@("Seq") = batchId
			s @g@("Batch",batchId,"Info") = fileName_"^0^"_colCount_"^0^"_..GetUserName()_"^"_$zd(+$h,3)_"^"_$zt($p($h,",",2),1)_"^"_fp
			for i = 0:1:colCount - 1 {
				s code = hdr.%Get(i)
				s @g@("Batch",batchId,"Header",i + 1) = code
			}
			s rc = rows.%Size()
			for i = 0:1:rc - 1 {
				s arr = rows.%Get(i)
				if arr.%Size() '= colCount {
					s badCount = badCount + 1
					continue
				}
				s rowNo = rowNo + 1
				s list = ""
				for j = 0:1:colCount - 1 {
					s list = list _ $lb(arr.%Get(j))
				}
				s @g@("Batch",batchId,"Data",rowNo) = list
				s @g@("Batch",batchId,"Audit",rowNo) = "0"
			}
			; 未知码统计
			s unknownCount = 0
			s unknownList = ""
			for i = 1:1:colCount {
				s code = $g(@g@("Batch",batchId,"Header",i))
				if '..IsValidCol(code) {
					s unknownCount = unknownCount + 1
					s unknownList = unknownList _ $lb(code)
				}
			}
			s @g@("Batch",batchId,"Info") = fileName_"^"_rowNo_"^"_colCount_"^0^"_..GetUserName()_"^"_$zd(+$h,3)_"^"_$zt($p($h,",",2),1)_"^"_fp
			s @g@("Batch",batchId,"Ukn") = unknownCount_"^"_$lts(unknownList," ")
		}
	} catch ex {
		s errTxt = ex.DisplayString()
	}
	if errTxt '= "" {
		if batchId '= 0 { k @g@("Batch",batchId) }
		q "{""success"":0,""msg"":"""_..EscapeJSON(errTxt)_"""}"
	}
	s ukn = $g(@g@("Batch",batchId,"Ukn"))
	s ret = {}
	s ret.success = 1
	s ret.batchId = batchId
	s ret.fileName = fileName
	s ret.rowCount = rowNo
	s ret.colCount = colCount
	s ret.badCount = badCount
	s ret.unknownCount = +$p(ukn,"^",1)
	s ret.unknown = $p(ukn,"^",2)
	q ret.%ToJSON()
}

/// 字符串指纹（滚动求和，用于内容级查重）
ClassMethod FingerprintStr(data As %String) As %String
{
	s c = 0
	s n = 0
	s len = $l(data)
	for i = 1:1:len {
		s c = c + $a(data, i) * (i + n)
		s n = n + 1
	}
	q $e("0000000000000" _ (c # 9007199254740991), -13, 99999999999999) _ "_" _ n
}

/// ============ 批次列表/元数据 ============

ClassMethod ListBatches() As %String
{
	s g = ..#GLOBAL
	s j = "["
	s first = 1
	s id = ""
	for {
		s id = $o(@g@("Batch",id))
		q:id=""
		s info = $g(@g@("Batch",id,"Info"))
		; 孤儿节点（无 Info）跳过
		if info = "" { continue }
		s rowCount = +$p(info,"^",2)
		s colCount = +$p(info,"^",3)
		s status = $p(info,"^",4)
		s audited = 0
		s passed = 0
		s rn = ""
		for {
			s rn = $o(@g@("Batch",id,"Audit",rn),1,st)
			q:rn=""
			if +$p(st,"^",1) '= 0 { s audited = audited + 1 }
			if +$p(st,"^",1) = 1 { s passed = passed + 1 }
		}
		s statusTxt = $s(status = "1":"已导入", 1:"待导入")
		s:'first j = j _ ","
		s first = 0
		s j = j _ "{""batchId"":"""_id_""",""fileName"":"""_..EscapeJSON($p(info,"^",1))_""",""rowCount"":"_rowCount_",""colCount"":"_colCount_",""status"":"""_statusTxt_""",""audited"":"_audited_",""passed"":"_passed_",""createUser"":"""_..EscapeJSON($p(info,"^",5))_""",""createDate"":"""_..EscapeJSON($p(info,"^",6))_""",""createTime"":"""_..EscapeJSON($p(info,"^",7))_"""}"
	}
	q j _ "]"
}

ClassMethod GetBatchMeta(batchId As %String) As %String
{
	s g = ..#GLOBAL
	if '$d(@g@("Batch",batchId)) q "{""success"":0,""msg"":""批次不存在""}"
	s info = $g(@g@("Batch",batchId,"Info"))
	s colCount = +$p(info,"^",3)

	s colJson = "["
	s first = 1
	for i = 1:1:colCount {
		s code = $g(@g@("Batch",batchId,"Header",i))
		s title = code
		s type = "S"
		s mt = ..GetMetaList()
		for k = 1:1:$ll(mt) {
			s item = $lg(mt,k)
			if $p(item,"^",1) = code {
				s title = $p(item,"^",2)
				s type = $p(item,"^",3)
			}
		}
		s target = $g(@g@("Batch",batchId,"MapOv",code))
		if target = "" { s target = code }
		s canImp = 1
		if '..IsValidCol(code) { s canImp = 0 }
		s:'first colJson = colJson _ ","
		s first = 0
		s colJson = colJson _ "{""col"":"""_code_""",""title"":"""_..EscapeJSON(title)_""",""target"":"""_target_""",""type"":"""_type_""",""canImp"":"_canImp_"}"
	}

	s sem = ""
	s semDef = ..GetSemanticList()
	for k = 1:1:$l(semDef,$c(1)) {
		s item = $p(semDef,$c(1),k)
		s semCol = $p(item,"^",1)
		s semTitle = $p(item,"^",2)
		s src = $g(@g@("Batch",batchId,"Sem",semCol))
		if src = "" { s src = $p(item,"^",3) }
		s sem = sem _ $lb("{""col"":"""_semCol_""",""title"":"""_semTitle_""",""source"":"""_src_"""}")
	}

	q "{""success"":1,""batchId"":"""_batchId_""",""fileName"":"""_..EscapeJSON($p(info,"^",1))_""",""rowCount"":"_$p(info,"^",2)_",""colCount"":"_colCount_",""cols"":"_colJson_"],""semantic"":["_$lts(sem,",")_"]}"
}

ClassMethod SaveBatchCfg(batchId As %String, overridesJSON As %String, semanticJSON As %String) As %String
{
	s g = ..#GLOBAL
	if '$d(@g@("Batch",batchId)) q "{""success"":0,""msg"":""批次不存在""}"
	try {
		s arr = [].%FromJSON(overridesJSON)
		for i = 0:1:arr.%Size()-1 {
			s it = arr.%Get(i)
			s c = it.col
			s t = it.target
			if (c '= "") && (t '= "") && (..IsValidTarget(t)) {
				s @g@("Batch",batchId,"MapOv",c) = t
			} else {
				k @g@("Batch",batchId,"MapOv",c)
			}
		}
		s arr2 = [].%FromJSON(semanticJSON)
		for i = 0:1:arr2.%Size()-1 {
			s it = arr2.%Get(i)
			s c = it.col
			s s2 = it.source
			if (c '= "") && (s2 '= "") {
				s @g@("Batch",batchId,"Sem",c) = s2
			} else {
				k @g@("Batch",batchId,"Sem",c)
			}
		}
		; 映射/语义变化影响校验结果，清校验缓存
		k @g@("Batch",batchId,"Vali")
	} catch ex {
		s errTxt = ex.DisplayString()
	}
	if $g(errTxt) '= "" q "{""success"":0,""msg"":"""_..EscapeJSON(errTxt)_"""}"
	q "{""success"":1}"
}

/// ============ 记录列表/编辑 ============

ClassMethod ListRecords(batchId As %String, page As %Integer = 1, rows As %Integer = 20, auditFilter As %String = "", valiFilter As %String = "") As %String
{
	s g = ..#GLOBAL
	if '$d(@g@("Batch",batchId)) q "{""success"":0,""msg"":""批次不存在""}"
	s info = $g(@g@("Batch",batchId,"Info"))
	s colCount = +$p(info,"^",3)

	s colIdx = ""
	for i = 1:1:colCount {
		s code = $g(@g@("Batch",batchId,"Header",i))
		if code '= "" { s colIdx(code) = i }
	}

	s allRows = ""
	s rn = ""
	for {
		s rn = $o(@g@("Batch",batchId,"Audit",rn),1,st)
		q:rn=""
		s f = +$p(st,"^",1)
		; 状态筛选（审核状态）
		s okA = 0
		if auditFilter="" { s okA = 1 }
		elseif (auditFilter="0")&&(f=0) { s okA = 1 }
		elseif (auditFilter="1")&&(f=1) { s okA = 1 }
		elseif (auditFilter="2")&&(f=2) { s okA = 1 }
		continue:okA=0
		; 校验结果筛选：0=未校验 1=通过 2=不通过（与列表列同规则）
		if valiFilter '= "" {
			s vv = $g(@g@("Batch",batchId,"Vali",rn))
			s vs = 0
			if $d(@g@("Batch",batchId,"Vali",rn)) {
				if vv = "" { s vs = 1 } else { s vs = 2 }
			}
			continue:vs'=+valiFilter
		}
		s allRows = allRows _ $lb(rn)
	}
	s fTotal = $ll(allRows)
	if page < 1 { s page = 1 }
	if rows < 1 { s rows = 20 }
	s offset = (page - 1) * rows
	s startIdx = offset + 1
	s endIdx = offset + rows
	if endIdx > fTotal { s endIdx = fTotal }

	s coreList = ..#CORE
	s coreCnt = $l(coreList, "^")
	s semDef = ..GetSemanticList()
	s semCnt = $l(semDef, $c(1))

	s j = "{""total"":"_fTotal_",""rows"":["
	s firstRow = 1
	for idx = startIdx:1:endIdx {
		s rno = $li(allRows, idx)
		s list = $g(@g@("Batch",batchId,"Data",rno))
		s st = $g(@g@("Batch",batchId,"Audit",rno))
		s status = +$p(st,"^",1)

		; 校验三态：0=未校验(Vali节点不存在) 1=通过(节点存在且为空) 2=不通过(有提示)
		s valiV = $g(@g@("Batch",batchId,"Vali",rno))
		s vstat = 0
		if $d(@g@("Batch",batchId,"Vali",rno)) {
			if valiV = "" { s vstat = 1 } else { s vstat = 2 }
		}
		s robj = "{""rowNo"":"_rno_",""status"":"_status_",""auditUser"":"""_..EscapeJSON($p(st,"^",2))_""",""vstat"":"_vstat_",""vmsg"":"""_..EscapeJSON(valiV)_""""
		for k = 1:1:coreCnt {
			s code = $p(coreList,"^",k)
			s ci = $g(colIdx(code))
			s v = ""
			if ci '= "" { s v = $li(list,ci) }
			s robj = robj _ ","""_code_""":"""_..EscapeJSON(v)_""""
		}
		for k = 1:1:semCnt {
			s item = $p(semDef,$c(1),k)
			s semCol = $p(item,"^",1)
			s srcCode = $g(@g@("Batch",batchId,"Sem",semCol))
			if srcCode = "" { s srcCode = $p(item,"^",3) }
			s ci = $g(colIdx(srcCode))
			s sv = ""
			if ci '= "" { s sv = $li(list,ci) }
			s robj = robj _ ","""_semCol_""":"""_..EscapeJSON(sv)_""""
		}
		s robj = robj _ "}"
		s:'firstRow j = j _ ","
		s firstRow = 0
		s j = j _ robj
	}
	q j _ "]}"
}

ClassMethod GetRecord(batchId As %String, rowNo As %String) As %String
{
	s g = ..#GLOBAL
	if '$d(@g@("Batch",batchId,"Data",rowNo)) q "{""success"":0,""msg"":""记录不存在""}"
	s info = $g(@g@("Batch",batchId,"Info"))
	s colCount = +$p(info,"^",3)
	s list = $g(@g@("Batch",batchId,"Data",rowNo))
	s mt = ..GetMetaList()

	s items = ""
	for i = 1:1:colCount {
		s code = $g(@g@("Batch",batchId,"Header",i))
		s v = $li(list,i)
		continue:v=""
		s title = code
		for k = 1:1:$ll(mt) {
			s it = $lg(mt,k)
			if $p(it,"^",1) = code { s title = $p(it,"^",2) }
		}
		s items = items _ $lb("{""col"":"""_code_""",""title"":"""_..EscapeJSON(title)_""",""value"":"""_..EscapeJSON(v)_"""}")
	}
	s st = $g(@g@("Batch",batchId,"Audit",rowNo))
	q "{""success"":1,""rowNo"":"_rowNo_",""status"":"_+$p(st,"^",1)_",""fields"":["_$lts(items,",")_"]}"
}

ClassMethod SaveRecord(batchId As %String, rowNo As %String, editsJSON As %String) As %String
{
	s g = ..#GLOBAL
	if '$d(@g@("Batch",batchId,"Data",rowNo)) q "{""success"":0,""msg"":""记录不存在""}"
	if +$p($g(@g@("Batch",batchId,"Audit",rowNo)),"^",1) = 3 q "{""success"":0,""msg"":""该行已导入，不可再修改""}"
	s info = $g(@g@("Batch",batchId,"Info"))
	s colCount = +$p(info,"^",3)
	s list = $g(@g@("Batch",batchId,"Data",rowNo))
	try {
		s arr = [].%FromJSON(editsJSON)
		for i = 0:1:arr.%Size()-1 {
			s it = arr.%Get(i)
			s code = it.col
			s v = it.value
			for ci = 1:1:colCount {
				if $g(@g@("Batch",batchId,"Header",ci)) = code {
					s $li(list,ci) = v
				}
			}
		}
		s @g@("Batch",batchId,"Data",rowNo) = list
	} catch ex {
		s errTxt = ex.DisplayString()
	}
	if $g(errTxt) '= "" q "{""success"":0,""msg"":"""_..EscapeJSON(errTxt)_"""}"
	; 保存后仅对该行重新校验并回填 Vali（不再整批重跑字典校验）
	s nv = ""
	try {
		d ..EnsureDic()
		s (bMap,iMap) = ""
		d ..LoadDicMaps(.bMap,.iMap)
		s nv = ..RowInvalidMsg(batchId, rowNo, colCount, .bMap, .iMap)
	} catch exv {
		s nv = "校验异常:" _ $e(exv.DisplayString(),1,200)
	}
	s @g@("Batch",batchId,"Vali",rowNo) = nv
	; 改后校验不通过的行：若原为"已通过"(status=1)则退回待审核，保证未通过行不能保持通过
	if nv '= "" {
		s curSt = +$p($g(@g@("Batch",batchId,"Audit",rowNo)),"^",1)
		if curSt = 1 { s @g@("Batch",batchId,"Audit",rowNo) = "0" }
	}
	q "{""success"":1}"
}

/// 本批已有校验结果的行数（Vali 节点数），前端据此判断是否还需自动整批校验
ClassMethod BatchValiCount(batchId As %String) As %String
{
	s g = ..#GLOBAL
	if '$d(@g@("Batch",batchId)) q "{""success"":0,""msg"":""批次不存在""}"
	s cnt = 0
	s rn = ""
	for {
		s rn = $o(@g@("Batch",batchId,"Vali",rn))
		q:rn=""
		s cnt = cnt + 1
	}
	s total = +$p($g(@g@("Batch",batchId,"Info")),"^",2)
	q "{""success"":1,""count"":"_cnt_",""total"":"_total_"}"
}

ClassMethod AuditRows(batchId As %String, rowsJSON As %String, pass As %Integer) As %String
{
	s g = ..#GLOBAL
	if '$d(@g@("Batch",batchId)) q "{""success"":0,""msg"":""批次不存在""}"
	s blocked = 0
	s blockedRows = ""
	try {
		s arr = [].%FromJSON(rowsJSON)
		s u = ..GetUserName()
		for i = 0:1:arr.%Size()-1 {
			s rno = arr.%Get(i)
			if '$d(@g@("Batch",batchId,"Audit",rno)) { continue }
			if +$p($g(@g@("Batch",batchId,"Audit",rno)),"^",1) = 3 { continue }
			; 校验不通过(Vali非空)的行不允许"审核通过"(pass=1)
			if (pass = 1) && $d(@g@("Batch",batchId,"Vali",rno)) && ($g(@g@("Batch",batchId,"Vali",rno)) '= "") {
				s blocked = blocked + 1
				if $l(blockedRows) < 400 { s blockedRows = blockedRows _ "第" _ rno _ "行;" }
				continue
			}
			s @g@("Batch",batchId,"Audit",rno) = pass_"^"_u_"^"_$zd(+$h,3)_"^"_$zt($p($h,",",2),1)
		}
	} catch ex {
		s errTxt = ex.DisplayString()
	}
	if $g(errTxt) '= "" q "{""success"":0,""msg"":"""_..EscapeJSON(errTxt)_"""}"
	q "{""success"":1,""blocked"":"_blocked_",""blockedRows"":"""_..EscapeJSON(blockedRows)_"""}"
}

/// 整批审核（未导入行全部置 pass：1通过 2驳回；校验不通过的行不会被"通过"）
ClassMethod AuditAll(batchId As %String, pass As %Integer) As %String
{
	s g = ..#GLOBAL
	if '$d(@g@("Batch",batchId)) q "{""success"":0,""msg"":""批次不存在""}"
	s u = ..GetUserName()
	s blocked = 0
	s blockedRows = ""
	s rn = ""
	for {
		s rn = $o(@g@("Batch",batchId,"Audit",rn),1,st)
		q:rn=""
		if +$p(st,"^",1) = 3 { continue }
		; 校验不通过(Vali非空)的行不允许"审核通过"(pass=1)
		if (pass = 1) && $d(@g@("Batch",batchId,"Vali",rn)) && ($g(@g@("Batch",batchId,"Vali",rn)) '= "") {
			s blocked = blocked + 1
			if $l(blockedRows) < 400 { s blockedRows = blockedRows _ "第" _ rn _ "行;" }
			continue
		}
		s @g@("Batch",batchId,"Audit",rn) = pass_"^"_u_"^"_$zd(+$h,3)_"^"_$zt($p($h,",",2),1)
	}
	q "{""success"":1,""blocked"":"_blocked_",""blockedRows"":"""_..EscapeJSON(blockedRows)_"""}"
}

/// ============ 导入 ============

/// 行导入校验结果：Vali 缓存存在直接用缓存（校验通过的行导入时不再重复校验），
/// 从未校验过的行实时算一次并回填缓存
ClassMethod RowImportMsg(batchId As %String, rowNo As %String, colCount As %Integer, ByRef bMap, ByRef iMap) As %String
{
	s g = ..#GLOBAL
	if $d(@g@("Batch",batchId,"Vali",rowNo)) { q $g(@g@("Batch",batchId,"Vali",rowNo)) }
	s m = ..RowInvalidMsg(batchId, rowNo, colCount, .bMap, .iMap)
	s @g@("Batch",batchId,"Vali",rowNo) = m
	q m
}

/// 导入前预览：统计将导入行数与其中字典/格式校验不通过行
ClassMethod GetImportPreview(batchId As %String) As %String
{
	s g = ..#GLOBAL
	if '$d(@g@("Batch",batchId)) q "{""success"":0,""msg"":""批次不存在""}"
	s info = $g(@g@("Batch",batchId,"Info"))
	s colCount = +$p(info,"^",3)
	d ..EnsureDic()
	s (bMap,iMap) = ""
	d ..LoadDicMaps(.bMap,.iMap)
	s pass = 0
	s invalid = 0
	s invRows = ""
	s rn = ""
	for {
		s rn = $o(@g@("Batch",batchId,"Audit",rn),1,st)
		q:rn=""
		if +$p(st,"^",1) '= 1 { continue }
		s pass = pass + 1
		s msg = ..RowImportMsg(batchId, rn, colCount, .bMap, .iMap)
		if msg '= "" {
			s invalid = invalid + 1
			if $l(invRows) < 1200 { s invRows = invRows _ "第" _ rn _ "行;" }
		}
	}
	q "{""success"":1,""pass"":"_pass_",""invalid"":"_invalid_",""invRows"":"""_..EscapeJSON(invRows)_""",""imported"":"_$s($p(info,"^",4) = "1":"1",1:"0")_"}"
}

ClassMethod ImportBatch(batchId As %String) As %String
{
	s g = ..#GLOBAL
	if '$d(@g@("Batch",batchId)) q "{""success"":0,""msg"":""批次不存在""}"
	if $p($g(@g@("Batch",batchId,"Info")),"^",4) = "1" q "{""success"":0,""msg"":""批次已导入，禁止重复导入（如需重导请先执行【删除导入数据】）""}"

	s info = $g(@g@("Batch",batchId,"Info"))
	s fileName = $p(info,"^",1)
	s colCount = +$p(info,"^",3)
	s u = ..GetUserName()

	; 同文件名(月份文件)防重：表内已有同 SrcFileName 数据时拒绝导入，避免历史残留造成重复
	s oldCnt = 0
	&sql(select count(*) into :oldCnt from SQLUser.YZSYHQMSData where HQMS_SrcFileName = :fileName)
	if oldCnt > 0 q "{""success"":0,""msg"":""User.YZSYHQMSData 已存在该文件("_fileName_")导入的数据 "_oldCnt_" 行，禁止重复导入。如需重新导入，请先对该文件对应批次执行【删除导入数据】后重传导入。""}"

	s colIdx = ""
	for i = 1:1:colCount {
		s code = $g(@g@("Batch",batchId,"Header",i))
		if code '= "" { s colIdx(code) = i }
	}
	s semDef = ..GetSemanticList()
	s semCnt = $l(semDef,$c(1))

	d ..EnsureDic()
	s (bMap,iMap) = ""
	d ..LoadDicMaps(.bMap,.iMap)

	s passList = ""
	s rn = ""
	for {
		s rn = $o(@g@("Batch",batchId,"Audit",rn),1,st)
		q:rn=""
		if +$p(st,"^",1) = 1 { s passList = passList _ $lb(rn) }
	}
	s passRows = $ll(passList)
	if passRows = 0 q "{""success"":0,""msg"":""没有审核通过的行可导入""}"

	s total = 0
	s succ = 0
	s fail = 0
	s failMsgs = ""

	s log = ##class(User.DHCMRInfoHQMSLog).%New()
	s log.BatchNo = batchId
	s log.FileName = fileName
	s log.TotalRows = passRows
	s log.ImpUser = u
	s log.ImpDate = +$h
	s log.ImpTime = $zt($p($h,",",2),1)
	s log.Status = "1"
	s log.ErrMsg = ""
	s log.PassRows = passRows
	s log.SuccRows = 0
	s log.FailRows = 0
	s log.AddRows = 0
	s log.UpdateRows = 0
	s sc = log.%Save()
	if $$$ISERR(sc) q "{""success"":0,""msg"":""日志创建失败:"""_..EscapeJSON($system.Status.GetErrorText(sc))_"""}"
	s logId = log.%Id()

	for idx = 1:1:passRows {
		s rno = $li(passList, idx)
		s list = $g(@g@("Batch",batchId,"Data",rno))
		s total = total + 1
		s errMsg = ""
		s vmsg = ..RowImportMsg(batchId, rno, colCount, .bMap, .iMap)
		if vmsg '= "" {
			s errMsg = "校验不通过：" _ vmsg
		} else {
			; 行宽防护
			s sumLen = 0
			for i = 1:1:colCount { s sumLen = sumLen + $l($li(list,i)) }
			if sumLen > ..#MAXROWSIZE {
				s errMsg = "行内容过长("_sumLen_"字符)，超过单行上限 " _ ..#MAXROWSIZE _ "，无法入库"
			}
		}
		if errMsg = "" {
			s obj = ##class(User.YZSYHQMSData).%New()
			try {
				for ci = 1:1:colCount {
					s code = $g(@g@("Batch",batchId,"Header",ci))
					s v = $li(list,ci)
					continue:v=""
					s target = $g(@g@("Batch",batchId,"MapOv",code))
					if target = "" { s target = code }
					if '..IsValidTarget(target) { continue }
					s $property(obj, target) = v
				}
				for k = 1:1:semCnt {
					s item = $p(semDef,$c(1),k)
					s semCol = $p(item,"^",1)
					s srcCode = $g(@g@("Batch",batchId,"Sem",semCol))
					if srcCode = "" { s srcCode = $p(item,"^",3) }
					s ci = $g(colIdx(srcCode))
					s sv = ""
					if ci '= "" { s sv = $li(list,ci) }
					if (semCol = "RYRQ") || (semCol = "CYRQ") { s sv = ..ToHDate(sv) }
					s $property(obj, semCol) = sv
				}
				s obj.BatchNo = batchId
				s obj.SrcRowNo = rno
				s obj.SrcFileName = fileName
				s obj.ImpUser = u
				s obj.ImpDate = +$h
				s obj.ImpTime = $zt($p($h,",",2),1)
				s sc2 = obj.%Save()
				if $$$ISERR(sc2) {
					s errMsg = $system.Status.GetErrorText(sc2)
				} else {
					s succ = succ + 1
					s @g@("Batch",batchId,"Audit",rno) = "3^"_u_"^"_$zd(+$h,3)_"^"_$zt($p($h,",",2),1)
					s itm = ##class(User.DHCMRInfoHQMSLogItem).%New()
					s itm.LogID = logId
					s itm.RowNo = rno
					s itm.Result = "1"
					s itm.TargetRowID = obj.%Id()
					s itm.Msg = "新增"
					d itm.%Save()
				}
			} catch ex {
				s errMsg = ex.DisplayString()
			}
		}
		if errMsg '= "" {
			s fail = fail + 1
			s itm = ##class(User.DHCMRInfoHQMSLogItem).%New()
			s itm.LogID = logId
			s itm.RowNo = rno
			s itm.Result = "3"
			s itm.TargetRowID = ""
			s itm.Msg = $e(errMsg,1,500)
			d itm.%Save()
			if $l(failMsgs) < 3000 {
				s failMsgs = failMsgs _ "第" _ rno _ "行:" _ $e(errMsg,1,120) _ ";"
			}
		}
	}

	s log.SuccRows = succ
	s log.FailRows = fail
	s log.AddRows = succ
	s log.Status = $s(fail = 0:"1", succ = 0:"3", 1:"2")
	s log.ErrMsg = $e(failMsgs,1,900)
	d log.%Save()

	; 失败行重置为待审核
	if fail > 0 {
		for idx = 1:1:passRows {
			s rno = $li(passList, idx)
			s st = $g(@g@("Batch",batchId,"Audit",rno))
			if +$p(st,"^",1) = 1 { s @g@("Batch",batchId,"Audit",rno) = "0" }
		}
	} else {
		s info = $g(@g@("Batch",batchId,"Info"))
		s $p(info,"^",4) = "1"
		s @g@("Batch",batchId,"Info") = info
	}

	q "{""success"":1,""logId"":"""_logId_""",""total"":"_total_",""succ"":"_succ_",""fail"":"_fail_",""passRows"":"_passRows_",""failMsgs"":"""_..EscapeJSON(failMsgs)_"""}"
}

/// 整批字典/格式校验：结果缓存到 ^...("Batch",batchId,"Vali",rowNo)，供界面展示
ClassMethod ValidateBatch(batchId As %String) As %String
{
	s g = ..#GLOBAL
	if '$d(@g@("Batch",batchId)) q "{""success"":0,""msg"":""批次不存在""}"
	d ..EnsureDic()
	s cnt = 0
	&sql(select count(*) into :cnt from SQLUser.YZSYHQMSDataDic)
	if cnt = 0 q "{""success"":0,""msg"":""字典表(User.YZSYHQMSDataDic)无数据，请先执行 ##class(web.YZSY.HQMSDicInit).EnsureSeed()""}"
	s (bMap,iMap) = ""
	d ..LoadDicMaps(.bMap,.iMap)
	s info = $g(@g@("Batch",batchId,"Info"))
	s colCount = +$p(info,"^",3)
	k @g@("Batch",batchId,"Vali")
	s invalid = 0
	s total = 0
	s head = ""
	s rn = ""
	for {
		s rn = $o(@g@("Batch",batchId,"Data",rn),1,list)
		q:rn=""
		s total = total + 1
		s msg = ..RowInvalidMsg(batchId, rn, colCount, .bMap, .iMap)
		if msg '= "" {
			s invalid = invalid + 1
			s @g@("Batch",batchId,"Vali",rn) = msg
			if $l(head) < 2000 {
				s head = head _ "第" _ rn _ "行：" _ msg _ ";"
			}
		} else {
			s @g@("Batch",batchId,"Vali",rn) = ""
		}
	}
	q "{""success"":1,""total"":"_total_",""invalid"":"_invalid_",""head"":"""_..EscapeJSON(head)_"""}"
}

/// ============ 批次/数据删除 ============

/// 删除待导入批次的暂存数据（已导入批次请用 RemoveImported）
/// 含：该批次已入库的残留行（导入部分失败时成功行已写入表）一并清理，防止同文件重传重导产生重复数据
ClassMethod RemoveBatch(batchId As %String) As %String
{
	s g = ..#GLOBAL
	if '$d(@g@("Batch",batchId)) q "{""success"":0,""msg"":""批次不存在""}"
	if $p($g(@g@("Batch",batchId,"Info")),"^",4) = "1" q "{""success"":0,""msg"":""批次已导入，请使用【删除导入数据】""}"
	; 部分导入残留行（HQMS_BatchNo=本批）一并删除
	s dataCnt = 0
	&sql(delete from SQLUser.YZSYHQMSData where HQMS_BatchNo = :batchId)
	if SQLCODE = 0 { s dataCnt = %ROWCOUNT }
	; 删除日志（主+明细）
	s logId = ""
	&sql(select ID into :logId from SQLUser.DHCMRInfoHQMSLog where LOG_BatchNo = :batchId)
	if logId '= "" {
		&sql(delete from SQLUser.DHCMRInfoHQMSLogItem where ITEM_LogID = :logId)
		&sql(delete from SQLUser.DHCMRInfoHQMSLog where ID = :logId)
	}
	; 清理归档文件与批次暂存
	s arch = $p($g(@g@("Batch",batchId,"Info")),"^",9)
	if arch '= "" { d ##class(%File).Delete(..#ARCHIVEDIR _ arch) }
	k @g@("Batch",batchId)
	q "{""success"":1,""dataDeleted"":"_dataCnt_"}"
}

/// 删除已导入数据：YZSYHQMSData 该批次行 + 导入日志 + 批次暂存 + 归档文件（用于“先删除再重新导入”）
ClassMethod RemoveImported(batchId As %String) As %String
{
	s g = ..#GLOBAL
	if '$d(@g@("Batch",batchId)) q "{""success"":0,""msg"":""批次不存在""}"
	if $p($g(@g@("Batch",batchId,"Info")),"^",4) '= "1" q "{""success"":0,""msg"":""该批次尚未导入""}"

	s dataCnt = 0
	&sql(delete from SQLUser.YZSYHQMSData where HQMS_BatchNo = :batchId)
	if SQLCODE = 0 { s dataCnt = %ROWCOUNT }

	; 删除日志（主+明细）
	s logId = ""
	&sql(select ID into :logId from SQLUser.DHCMRInfoHQMSLog where LOG_BatchNo = :batchId)
	if logId '= "" {
		&sql(delete from SQLUser.DHCMRInfoHQMSLogItem where ITEM_LogID = :logId)
		&sql(delete from SQLUser.DHCMRInfoHQMSLog where ID = :logId)
	}

	; 清理归档文件与批次暂存
	s arch = $p($g(@g@("Batch",batchId,"Info")),"^",9)
	if arch '= "" { d ##class(%File).Delete(..#ARCHIVEDIR _ arch) }
	k @g@("Batch",batchId)

	q "{""success"":1,""dataDeleted"":"_dataCnt_",""msg"":""已删除导入数据 "_dataCnt_" 行及对应日志，可重新上传导入""}"
}

/// ============ 日志 ============

ClassMethod ListLogs(SDate As %String = "", EDate As %String = "") As %String
{
	s fromH = ..ToHDate(SDate)
	s toH = ..ToHDate(EDate)
	s j = "["
	s first = 1
	&sql(declare cur cursor for select ID, LOG_BatchNo, LOG_FileName, LOG_TotalRows, LOG_SuccRows, LOG_FailRows, LOG_AddRows, LOG_ImpUser, LOG_ImpDate, LOG_Status, LOG_ErrMsg from SQLUser.DHCMRInfoHQMSLog)
	&sql(open cur)
	for {
		&sql(fetch cur into :id, :bno, :fname, :trows, :srows, :frows, :arows, :iuser, :idate, :st, :emsg)
		q:SQLCODE'=0
		continue:((fromH '= "")&&(idate < fromH))
		continue:((toH '= "")&&(idate > toH))
		s:'first j = j _ ","
		s first = 0
		s statusTxt = $s(st = "1":"导入完成", st = "2":"部分失败", st = "3":"失败", 1:"")
		s j = j _ "{""logId"":"""_id_""",""batchNo"":"""_bno_""",""fileName"":"""_..EscapeJSON(fname)_""",""total"":"_trows_",""succ"":"_srows_",""fail"":"_frows_",""add"":"_arows_",""user"":"""_iuser_""",""date"":"""_$s(idate'="":$zd(idate,3),1:"")_""",""status"":"""_statusTxt_""",""errMsg"":"""_..EscapeJSON(emsg)_"""}"
	}
	&sql(close cur)
	q j _ "]"
}

/// 日志明细（分页）：返回 {total, rows:[{rowNo,result,target,msg}...]}
ClassMethod ListLogItems(logId As %String, page As %Integer = 1, rows As %Integer = 20) As %String
{
	s total = 0
	&sql(select count(*) into :total from SQLUser.DHCMRInfoHQMSLogItem where ITEM_LogID = :logId)
	if page < 1 { s page = 1 }
	if rows < 1 { s rows = 20 }
	s startIdx = (page - 1) * rows + 1
	s endIdx = startIdx + rows - 1
	if endIdx > total { s endIdx = total }
	s ret = {}
	s ret.success = 1
	s ret.total = total
	s ret.page = page
	s arr = []
	&sql(declare lcur2 cursor for select ITEM_RowNo, ITEM_Result, ITEM_TargetRowID, ITEM_Msg from SQLUser.DHCMRInfoHQMSLogItem where ITEM_LogID = :logId order by ITEM_RowNo)
	&sql(open lcur2)
	s idx = 0
	for {
		&sql(fetch lcur2 into :rno, :res, :tid, :msg)
		q:SQLCODE'=0
		s idx = idx + 1
		continue:idx<startIdx
		q:idx>endIdx
		s restxt = $s(res = "1":"新增", res = "2":"更新", res = "3":"失败", res = "4":"跳过", 1:"")
		s o = {}
		s o.rowNo = rno
		s o.result = restxt
		s o.target = tid
		s o.msg = msg
		d arr.%Push(o)
	}
	&sql(close lcur2)
	s ret.rows = arr
	q ret.%ToJSON()
}

/// ============ 字典校验 ============

ClassMethod EnsureDic() As %String
{
	s cnt = 0
	&sql(select count(*) into :cnt from SQLUser.YZSYHQMSDataDic)
	if cnt > 0 q "{""success"":1}"
	q ##class(web.YZSY.HQMSDicInit).EnsureSeed()
}

ClassMethod LoadDicMaps(ByRef bMap, ByRef iMap) As %Status
{
	d ..EnsureDic()
	&sql(declare dcur cursor for select DIC_FldCode, DIC_DicNo, DIC_ItemValue from SQLUser.YZSYHQMSDataDic)
	&sql(open dcur)
	for {
		&sql(fetch dcur into :fld, :dic, :val)
		q:SQLCODE'=0
		if val = "" {
			if fld '= "*" { s bMap(fld) = dic }
		} else {
			s iMap(dic, val) = 1
		}
	}
	&sql(close dcur)
	q $$$OK
}

/// 单行逐字段校验明细：返回 $lb( $lb(col,title,value,reason), ... )
ClassMethod RowIssues(batchId As %String, rowNo As %String, colCount As %Integer, ByRef bMap, ByRef iMap) As %String
{
	s g = ..#GLOBAL
	s list = $g(@g@("Batch",batchId,"Data",rowNo))
	s items = ""
	s vv = ""
	d ..EnsureMetaSub()
	for i = 1:1:colCount {
		s code = $g(@g@("Batch",batchId,"Header",i))
		s v = $li(list,i)
		s vv(code) = v
		s title = code
		s type = "S"
		if $d(@g@("_mt",code)) { s title = $p(@g@("_mt",code),"^",1) s type = $p(@g@("_mt",code),"^",2) }
		s isReq = 0
		s isNoDash = 0
		for r = 1:1:$l(..#REQUIRED,"^") {
			if $p(..#REQUIRED,"^",r) = code { s isReq = 1 s isNoDash = 1 }
		}
		if (isReq = 1) && (v = "") {
			s items = items _ $lb($lb(code,title,v,"必填缺失"))
			continue
		}
		continue:v=""
		if (isNoDash = 1) && (v = "-") {
			; 在 DASHOK 白名单内的字段允许"-"（如 A20 证件号码），其余必填字段不允许
			s isDashOk = 0
			for d = 1:1:$l(..#DASHOK,"^") {
				if $p(..#DASHOK,"^",d) = code { s isDashOk = 1 }
			}
			if isDashOk = 0 {
				s items = items _ $lb($lb(code,title,v,"不允许为-"))
				continue
			}
		}
		continue:v="-"
		s dic = $g(bMap(code))
		if dic '= "" {
			s skip = 0
			for c = 1:1:$l(..#NOCHECKDIC,"^") {
				if $p(..#NOCHECKDIC,"^",c) = dic { s skip = 1 }
			}
			if (skip = 0) && '$d(iMap(dic,v)) {
				s items = items _ $lb($lb(code,title,v,"不在" _ dic,dic))
			}
		}
		if type = "N" {
			if '$isvalidnum(v) {
				s items = items _ $lb($lb(code,title,v,"应为数字"))
			}
		} elseif (type = "D") || (type = "DT") {
			if ..ToHDate(v) = "" {
				s items = items _ $lb($lb(code,title,v,"日期格式错误"))
			}
		}
	}
	; 身份证专项（证件类别 A20N 为空或=1时校验）
	s sfzh = $g(vv("A20"))
	s zjlx = $g(vv("A20N"))
	if (sfzh '= "") && (sfzh '= "-") && ((zjlx = "") || (zjlx = "1")) {
		if '..CheckIDCard(sfzh) {
			s tA20 = "A20"
			if $d(@g@("_mt","A20")) { s tA20 = $p(@g@("_mt","A20"),"^",1) }
			s items = items _ $lb($lb("A20",tA20,sfzh,"格式或校验位错误"))
		}
	}
	; 跨字段规则（每条拆分，尽量定位到首个字段码）
	s cross = ..RowCrossMsg(batchId, rowNo, colCount)
	if cross '= "" {
		for p = 1:1:$l(cross,";") {
			s seg = $p(cross,";",p)
			continue:seg=""
			s ccol = ""
			s ci = $f(seg,"(")
			if ci > 0 {
				s ccol = $p($e(seg,ci,$l(seg)),")",1)
			}
			s ctitle = ccol
			if (ccol '= "") && $d(@g@("_mt",ccol)) { s ctitle = $p(@g@("_mt",ccol),"^",1) }
			s items = items _ $lb($lb(ccol,ctitle,$g(vv(ccol)),seg))
		}
	}
	q items
}

/// 单行综合校验汇总（供列表列显示）
ClassMethod RowInvalidMsg(batchId As %String, rowNo As %String, colCount As %Integer, ByRef bMap, ByRef iMap) As %String
{
	s its = ..RowIssues(batchId, rowNo, colCount, .bMap, .iMap)
	s cnt = $ll(its)
	if cnt = 0 q ""
	s parts = ""
	for k = 1:1:cnt {
		s it = $lg(its,k)
		s parts = parts _ $s(parts="":"",1:";") _ $lg(it,4)
	}
	q $e("共" _ cnt _ "处:" _ parts, 1, 600)
}

/// 校验明细（弹框）：返回 {success,rowNo,count,fields:[{col,title,value,reason}...]}
ClassMethod GetRecordValidate(batchId As %String, rowNo As %String) As %String
{
	s g = ..#GLOBAL
	if '$d(@g@("Batch",batchId,"Data",rowNo)) q "{""success"":0,""msg"":""记录不存在""}"
	d ..EnsureDic()
	s (bMap,iMap) = ""
	d ..LoadDicMaps(.bMap,.iMap)
	s colCount = +$p($g(@g@("Batch",batchId,"Info")),"^",3)
	s its = ..RowIssues(batchId, rowNo, colCount, .bMap, .iMap)
	s ret = {}
	s ret.success = 1
	s ret.rowNo = rowNo
	s ret.count = $ll(its)
	s arr = []
	for k = 1:1:$ll(its) {
		s it = $lg(its,k)
		s o = {}
		s o.col = $lg(it,1)
		s o.title = $lg(it,2)
		s val = $lg(it,3)
		if $l(val) > 60 { s val = $e(val,1,60) _ "…" }
		s o.value = val
		s o.reason = $lg(it,4)
		if $lg(it,5) '= "" { s o.dic = $lg(it,5) }
		d arr.%Push(o)
	}
	s ret.fields = arr
	q ret.%ToJSON()
}

/// 取值域内容（查字典）：返回 {success,dic,items:[{val,desc}...]}
ClassMethod GetDicItems(dicNo As %String) As %String
{
	if dicNo = "" q "{""success"":0,""msg"":""字典号为空""}"
	s ret = {}
	s ret.success = 1
	s ret.dic = dicNo
	s arr = []
	&sql(declare diccur cursor for select DIC_ItemValue, DIC_ItemDesc from SQLUser.YZSYHQMSDataDic where DIC_DicNo = :dicNo and DIC_ItemValue is not null and DIC_ItemValue <> '' order by DIC_ItemValue)
	&sql(open diccur)
	for {
		&sql(fetch diccur into :iv, :ids)
		q:SQLCODE'=0
		s o = {}
		s o.val = iv
		s o.desc = ids
		d arr.%Push(o)
	}
	&sql(close diccur)
	s ret.items = arr
	q ret.%ToJSON()
}

/// 跨字段业务规则（接口文档 TABLE30 核心：error8 时间先后、error9 诊断ICD码范围）
ClassMethod RowCrossMsg(batchId As %String, rowNo As %String, colCount As %Integer) As %String
{
	s g = ..#GLOBAL
	s list = $g(@g@("Batch",batchId,"Data",rowNo))
	s vv = ""
	for i = 1:1:colCount {
		s code = $g(@g@("Batch",batchId,"Header",i))
		if code '= "" { s vv(code) = $li(list,i) }
	}
	s res = ""
	s b12 = ..ToHSeconds($g(vv("B12")))
	s b15 = ..ToHSeconds($g(vv("B15")))
	if (b12 '= "") && (b15 '= "") && (b12 > b15) {
		s res = res _ "入院时间(B12)晚于出院时间(B15);"
	}
	s c16 = ..ToHSeconds($g(vv("C16x01")))
	; 注意 COS 从左到右求值：必须 (b12 - 86400) 整体加括号
	if (c16 '= "") && (b12 '= "") && (c16 < (b12 - 86400)) {
		s res = res _ "主要手术日期(C16x01=" _ $g(vv("C16x01")) _ ")早于入院(B12=" _ $g(vv("B12")) _ ")前1天;"
	}
	if (c16 '= "") && (b15 '= "") && (c16 > b15) {
		s res = res _ "主要手术日期(C16x01=" _ $g(vv("C16x01")) _ ")晚于出院(B15=" _ $g(vv("B15")) _ ");"
	}
	; error9: 诊断编码 ICD 首字母应 A~U 或 Z。
	; 空值/"-"一律不校验（主要C03C、门急诊C01C的必填与"-"禁止在 RowIssues 处理；其它诊断码留空或为-均放行）
	s diagCodes = ""
	s c1 = $g(vv("C01C"))
	if (c1 '= "") && (c1 '= "-") { s diagCodes = diagCodes _ $lb(c1) }
	s c2 = $g(vv("C03C"))
	if (c2 '= "") && (c2 '= "-") { s diagCodes = diagCodes _ $lb(c2) }
	s c3 = $g(vv("F02C"))
	if (c3 '= "") && (c3 '= "-") { s diagCodes = diagCodes _ $lb(c3) }
	for n = 1:1:40 {
		s nn = $s(n < 10:"0" _ n, 1:n)
		s cv = $g(vv("C06x" _ nn _ "C"))
		if (cv '= "") && (cv '= "-") { s diagCodes = diagCodes _ $lb(cv) }
	}
	for i = 1:1:$ll(diagCodes) {
		s d = $li(diagCodes, i)
		s d0 = $zcvt($e(d, 1, 1), "U")
		if d0 '= "" {
			s a = $a(d0)
			if ((a < 65) || (a > 90)) || ((a >= 86) && (a <= 89)) {
				s res = res _ "诊断编码" _ d _ "范围不符(应A~U或Z开头);"
			}
		}
	}
	q res
}

/// 身份证校验（15位旧证全数字；18位含校验位）
ClassMethod CheckIDCard(id As %String) As %Boolean
{
	if id = "" q 0
	if $l(id) = 15 {
		q (id?15N)
	}
	if $l(id) '= 18 q 0
	; 18 位：前17位数字
	if $e(id,1,17)'?17N q 0
	s w = "7 9 10 5 8 4 2 1 6 3 7 9 10 5 8 4 2"
	s sum = 0
	; 注意：COS 从左到右求值，"sum + x * w" 会先算 (sum+x) 再乘 w，必须先把乘积算出来再加
	for i = 1:1:17 {
		s prod = ($a(id,i) - 48) * $p(w," ",i)
		s sum = sum + prod
	}
	s m = sum # 11
	s map = "10X98765432"
	s exp = $e(map, m + 1, m + 1)
	q ($zcvt($e(id,18,18),"U") = exp)
}

/// 日期时间字符串 -> 秒数（yyyy-MM-dd[ HH:mm:ss]）；非法返回 ""
/// 注意：COS 从左到右求值，时间换算必须分步/加括号，禁止 secs+hh*3600+... 连写
ClassMethod ToHSeconds(val As %String) As %String
{
	if val = "" q ""
	s h = ..ToHDate(val)
	if h = "" q ""
	s secs = h * 86400
	s tpart = $p(val, " ", 2)
	if tpart '= "" {
		s hh = $p(tpart, ":", 1)
		s mm = $p(tpart, ":", 2)
		s ss = $p(tpart, ":", 3)
		if $isvalidnum(hh) && $isvalidnum(mm) && $isvalidnum(ss) {
			s tSecs = (hh * 3600) + (mm * 60) + ss
			s secs = secs + tSecs
		}
	}
	q secs
}

/// ============ 元数据/字典工具 ============


/// 构建 码->title^type 下标缓存（供校验/列表高频使用，只建一次）
ClassMethod EnsureMetaSub()
{
	s g = ..#GLOBAL
	if $d(@g@("_mt","__")) { q }
	s mt = ..GetMetaList()
	for k = 1:1:$ll(mt) {
		s it = $lg(mt,k)
		s @g@("_mt",$p(it,"^",1)) = $p(it,"^",2)_"^"_$p(it,"^",3)
	}
	s @g@("_mt","__") = 1
}
ClassMethod GetMetaList() As %String
{
	s g = ..#GLOBAL
	s cached = $g(@g@("_MetaList"))
	if cached '= "" { q cached }
	s j = ##class(web.YZSY.HQMSFieldMeta).GetMeta()
	s arr = [].%FromJSON(j)
	s out = ""
	for i = 0:1:arr.%Size()-1 {
		s it = arr.%Get(i)
		s out = out _ $lb(it.code_"^"_it.title_"^"_it.type)
	}
	s @g@("_MetaList") = out
	q out
}

ClassMethod GetValidCols() As %String
{
	s g = ..#GLOBAL
	s cached = $g(@g@("_ValidCols"))
	if cached '= "" { q cached }
	s mt = ..GetMetaList()
	s out = ""
	for k = 1:1:$ll(mt) {
		s code = $p($lg(mt,k),"^",1)
		s isCtl = 0
		for c = 1:1:$l(..#CTRL,"^") {
			if $p(..#CTRL,"^",c) = code { s isCtl = 1 }
		}
		if 'isCtl { s out = out _ $lb(code) }
	}
	s @g@("_ValidCols") = out
	q out
}

ClassMethod IsValidCol(code As %String) As %Boolean
{
	q:code="" 0
	s vc = ..GetValidCols()
	q ($lf(vc, code) '= 0)
}

ClassMethod IsValidTarget(code As %String) As %Boolean
{
	q ..IsValidCol(code)
}

ClassMethod GetSemanticList() As %String
{
	q ##class(web.YZSY.HQMSFieldMeta).GetSemanticDefaults()
}

ClassMethod GetMetaJSON() As %String
{
	q ##class(web.YZSY.HQMSFieldMeta).GetMeta()
}

ClassMethod GetMRDictJSON() As %String
{
	q ##class(web.YZSY.DHCMRInfoHQMSDict).GetMRDict()
}

/// ============ 工具 ============

ClassMethod ToHDate(val As %String) As %String
{
	if val = "" q ""
	s v = $p(val, " ", 1)
	s y = $p(v, "-", 1)
	s m = $p(v, "-", 2)
	s d = $p(v, "-", 3)
	if (y = "") || (m = "") || (d = "") q ""
	if ($l(m) = 1) { s m = "0" _ m }
	if ($l(d) = 1) { s d = "0" _ d }
	s h = ""
	try {
		s h = $zdh(y _ "-" _ m _ "-" _ d, 3)
	} catch ex {
		s h = ""
	}
	q h
}

/// 上传文件名校验：须为6位年月，如 202601 或 202601.csv；返回 ""=合法，否则返回原因
ClassMethod CheckFileName(fileName As %String) As %String
{
	; 先去首尾空白（空格/Tab/换行等），兼容个别文件名带尾随空格
	s fileName = $zstrip(fileName, "<>W")
	s fileName = $replace(fileName, $c(12288), "")   ; 全角空格 U+3000
	s fileName = $zstrip(fileName, "<>W")
	if fileName = "" q "文件名为空"
	; 去除可能误带的成对引号
	if ($e(fileName,1,1) = """") && ($e(fileName,$l(fileName),$l(fileName)) = """") {
		s fileName = $e(fileName, 2, $l(fileName) - 1)
	}
	s base = fileName
	s dotIdx = $l(fileName, ".")
	if dotIdx > 1 {
		s ext = $zcvt($p(fileName, ".", dotIdx), "L")
		s base = $p(fileName, ".", 1, dotIdx - 1)
		if (ext '= "csv") && (ext '= "cvs") q "扩展名须为.csv(收到文件名:" _ fileName _ ")"
	}
	if ($l(base) '= 6) || (base '? 6N) q "须为6位年月(如202601)(收到文件名:" _ fileName _ "，解析=""" _ base _ """)"
	s y = +$e(base, 1, 4)
	s m = +$e(base, 5, 6)
	if (y < 2000) || (y > 2099) q "年份超出范围(收到文件名:" _ fileName _ "，解析年月="_ y _ "-" _ m _ ")"
	if (m < 1) || (m > 12) q "月份须在01-12之间(收到文件名:" _ fileName _ "，解析年月="_ y _ "-" _ m _ ")"
	q ""
}

ClassMethod GetUserName() As %String
{
	s uid = $g(%session.Data("LOGON.USERID"))
	q:uid="" ""
	s name = ""
	&sql(select SSUSR_Name into :name from SQLUser.SS_User where SSUSR_RowID = :uid)
	q $s(name '= "":name, 1:uid)
}
ClassMethod EscapeJSON(val As %String) As %String
{
	if val = "" q ""
	s val = $replace(val, "\", "\\")
	s val = $replace(val, """", "\""")
	s val = $replace(val, $c(13), "\r")
	s val = $replace(val, $c(10), "\n")
	s val = $replace(val, $c(9), "\t")
	q val
}

ClassMethod IsUTF8(data As %String) As %Boolean
{
	q ##class(web.YZSY.DHCMRInfoHQMSDict).IsUTF8(data)
}

}
