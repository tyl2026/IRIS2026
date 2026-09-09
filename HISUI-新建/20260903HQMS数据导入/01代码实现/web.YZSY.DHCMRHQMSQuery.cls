Class web.YZSY.DHCMRHQMSQuery Extends DHCDoc.Util.RegisteredObject
{

/// 分组中文名
ClassMethod GroupName(g As %String) As %String
{
	q $s(g = "A":"患者基本信息", g = "B":"住院就诊信息", g = "C":"诊断手术信息", g = "D":"费用信息", g = "F":"其他信息", g = "X":"语义/控制列", 1:g)
}

/// HQMS 字段元数据 JSON（含分组中文名）
ClassMethod GetFieldMeta() As %String
{
	s meta = ##class(web.YZSY.HQMSFieldMeta).GetMeta()
	s arr = [].%FromJSON(meta)
	s j = "["
	s first = 1
	for i = 0:1:arr.%Size()-1 {
		s it = arr.%Get(i)
		s gname = ..GroupName(it.group)
		s:'first j = j _ ","
		s first = 0
		s j = j _ "{""code"":"""_it.code_""",""title"":"""_it.title_""",""type"":"""_it.type_""",""group"":"""_it.group_""",""groupName"":"""_gname_"""}"
	}
	q j _ "]"
}

/// 查询（内存过滤 + 分页）
/// columns: ["A11","A20",...]  conditions: [{"col":"A20","op":"eq","val":"431103199504217833"}]
/// op: eq 等于 neq 不等于 ct 包含 sw 开头是 gt 大于 ge 大于等于 lt 小于 le 小于等于
ClassMethod QueryData(columns As %String, conditions As %String, page As %Integer = 1, rows As %Integer = 20) As %String
{
	s metaArr = [].%FromJSON(##class(web.YZSY.HQMSFieldMeta).GetMeta())
	; 建立 码->元数据
	s metaMap = ""
	for i = 0:1:metaArr.%Size()-1 {
		s it = metaArr.%Get(i)
		s metaMap(it.code) = it
	}
	s colArr = [].%FromJSON(columns)
	s colCnt = colArr.%Size()
	; 校验列合法
	s useCols = ""
	s colList = $lb("%ID")
	for i = 0:1:colCnt-1 {
		s c = colArr.%Get(i)
		if c = "" { continue }
		if c '= "%ID" {
			s isV = 0
			if $d(metaMap(c)) { s isV = 1 }
			if 'isV { continue }
		}
		s useCols = useCols _ $lb(c)
	}
	; 字典映射：显示时把有字典字段的代码转成描述
	s (bindMap,descMap) = ""
	d ..LoadQueryDict(.bindMap,.descMap)

	; 条件解析
	s condArr = [].%FromJSON(conditions)
	s condCnt = condArr.%Size()
	s condList = ""
	for i = 0:1:condCnt-1 {
		s it = condArr.%Get(i)
		s c = it.col
		s op = it.op
		s v = it.val
		if (c = "") || (op = "") { continue }
		; 条件列必须存在且列值参与比较
		if '$d(metaMap(c)) { continue }
		s condList = condList _ $lb(c_"^"_op_"^"_v)
	}

	if page < 1 { s page = 1 }
	if rows < 1 { s rows = 20 }
	if rows > 500 { s rows = 500 }

	; 取数（参照 病案数据自定义查询 QueryData 逻辑）：仅收集命中行 ID，
	; 分页切片时再按 ID 取数拼当前页 JSON —— 不拼全量大串，规避 <MAXSTRING>
	s errMsg = ""
	s idsA = []
	s total = 0
	s dbg = "init"
	try {
		s dbg = "enum"
		s hasCond = ($ll(condList) > 0)
		s id = ""
		for {
			s id = $o(^User.YZSYHQMSDataD(id))
			q:id=""
			q:total'<200000
			s pass = 1
			if hasCond {
				s dbg = "open_" _ id
				s obj = ##class(User.YZSYHQMSData).%OpenId(id)
				continue:obj=""
				s dbg = "cond"
				for k = 1:1:$ll(condList) {
					s cond = $lg(condList, k)
					s cc = $p(cond, "^", 1)
					s cop = $p(cond, "^", 2)
					s cv = $p(cond, "^", 3)
					s pv = $property(obj, cc)
					if '..MatchValue(pv, cop, cv, metaMap(cc).type) { s pass = 0 }
				}
			}
			if pass {
				s dbg = "push"
				d idsA.%Push(id)
				s total = total + 1
			}
		}
	} catch qex {
		s errMsg = "查询执行异常:Code=" _ qex.Code _ ",Name=" _ qex.Name _ ":" _ qex.DisplayString()
		s stTxt = $system.Status.GetErrorText(qex.AsStatus())
		if stTxt '= "" { s errMsg = errMsg _ " | " _ stTxt }
		s errMsg = errMsg _ " (列数=" _ $ll(useCols) _ ",stage=" _ dbg _ ")"
	}
	if errMsg '= "" q "{""success"":0,""msg"":"""_..EscapeJSON(errMsg)_"""}"
	s offset = (page - 1) * rows
	s startIdx = offset + 1
	s endIdx = offset + rows
	if endIdx > total { s endIdx = total }

	s j = "{""success"":1,""total"":"_total_",""cols"":["
	s first = 1
	for i = 1:1:$ll(useCols) {
		s cc3 = $lg(useCols, i)
		s:'first j = j _ ","
		s first = 0
		s t = cc3
		if $d(metaMap(cc3)) { s t = metaMap(cc3).title }
		s j = j _ "{""code"":"""_cc3_""",""title"":"""_..EscapeJSON(t)_""",""group"":"""_$s($d(metaMap(cc3)):metaMap(cc3).group,1:"")_""",""type"":"""_$s($d(metaMap(cc3)):metaMap(cc3).type,1:"S")_"""}"
	}
	s j = j _ "],""rows"":["
	s firstRow = 1
	if endIdx >= startIdx {
		for w = (startIdx - 1):1:(endIdx - 1) {
			s rid = idsA.%Get(w)
			continue:rid=""
			s obj2 = ##class(User.YZSYHQMSData).%OpenId(rid)
			continue:obj2=""
			s j2 = "["
			s firstC = 1
			for i = 1:1:$ll(useCols) {
				s cc4 = $lg(useCols, i)
				s pv4 = $property(obj2, cc4)
				; 字典字段：代码转描述显示
				s dv = ..DicText(.bindMap,.descMap,cc4,pv4)
				s:'firstC j2 = j2 _ ","
				s firstC = 0
				s j2 = j2 _ """" _ ..EscapeJSON(dv) _ """"
			}
			s j2 = j2 _ "]"
			s:'firstRow j = j _ ","
			s firstRow = 0
			s j = j _ j2
		}
	}
	q j _ "]}"
}

/// 值匹配（actual 列原始值, op 操作, condVal 条件值, ftype S/N/D/DT）
ClassMethod MatchValue(actualVal As %String, op As %String, condVal As %String, ftype As %String) As %Boolean
{
	s a = $g(actualVal)
	s c = $g(condVal)
	if op = "eq" {
		q a = c
	}
	if op = "neq" {
		q a '= c
	}
	if op = "ct" {
		q a [ c
	}
	if op = "sw" {
		q $e(a,1,$l(c)) = c
	}
	; 大小比较：数字/日期按数值；其它按字符串
	s cmp = 0
	if (ftype = "N") {
		s an = +a
		s cn = +c
		if an > cn { s cmp = 1 }
		elseif an < cn { s cmp = -1 }
	} elseif (ftype = "D") || (ftype = "DT") {
		; 语义日期列(RYRQ/CYRQ)存 $H 数值；文档日期列存 yyyy-mm-dd 文本
		s an = ""
		if ($isvalidnum(a)) && (a '= "") { s an = +a }
		else { s an = ..ToHDate(a) }
		s ch2 = ..ToHDate(c)
		if (an '= "") && (ch2 '= "") {
			if an > ch2 { s cmp = 1 }
			elseif an < ch2 { s cmp = -1 }
		} else {
			; 无法解析按字符串
			if a > c { s cmp = 1 }
			elseif a < c { s cmp = -1 }
		}
	} else {
		if a > c { s cmp = 1 }
		elseif a < c { s cmp = -1 }
	}
	if op = "gt" { q cmp > 0 }
	if op = "ge" { q cmp >= 0 }
	if op = "lt" { q cmp < 0 }
	if op = "le" { q cmp <= 0 }
	q 0
}

/// 装载查询用字典：bindMap(字段码)=值域号；descMap(值域号,值)=描述（来自 User.YZSYHQMSDataDic）
ClassMethod LoadQueryDict(ByRef bindMap, ByRef descMap) As %Status
{
	&sql(declare qbind cursor for select DIC_FldCode, DIC_DicNo from SQLUser.YZSYHQMSDataDic where (DIC_ItemValue is null or DIC_ItemValue = '') and DIC_FldCode is not null and DIC_FldCode <> '' and DIC_FldCode <> '*')
	&sql(open qbind)
	for {
		&sql(fetch qbind into :qf, :qd)
		q:SQLCODE'=0
		s bindMap(qf) = qd
	}
	&sql(close qbind)
	&sql(declare qitem cursor for select DIC_DicNo, DIC_ItemValue, DIC_ItemDesc from SQLUser.YZSYHQMSDataDic where DIC_ItemValue is not null and DIC_ItemValue <> '' and (DIC_FldCode is null or DIC_FldCode = '' or DIC_FldCode = '*'))
	&sql(open qitem)
	for {
		&sql(fetch qitem into :qd2, :qv, :qdesc)
		q:SQLCODE'=0
		if qdesc = "" { s descMap(qd2, qv) = qv }
		else { s descMap(qd2, qv) = qdesc }
	}
	&sql(close qitem)
	q $$$OK
}

/// 字典代码转描述：无绑定/无匹配时原样返回（"-"、空不做转换）
ClassMethod DicText(ByRef bindMap, ByRef descMap, code As %String, val As %String) As %String
{
	if (val = "") || (val = "-") q val
	s dic = $g(bindMap(code))
	if dic = "" q val
	s d = $g(descMap(dic, val))
	if d = "" q val
	q d
}
/// 日期字符串转 $H（兼容 1995-4-21/带时间），非法返回空
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

/// JSON 字符串转义
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

/// 排障自测：全列读取/列数阈值二分/逐列定位异常字段（只读不改数据）
/// d ##class(web.YZSY.DHCMRHQMSQuery).test()
ClassMethod test()
{
	; 1) 总行数
	s id = ""
	s n = 0
	for {
		s id = $o(^User.YZSYHQMSDataD(id))
		q:id=""
		s n = n + 1
	}
	w "总行数=",n,!
	; 2) 第一行
	s id = ""
	s id = $o(^User.YZSYHQMSDataD(id))
	w "第一行ID=",id,!
	s obj = ##class(User.YZSYHQMSData).%OpenId(id)
	w "obj=",obj,!
	if obj = "" {
		w "无数据行，测试终止",!
		q
	}
	; 3) C 组码清单
	s meta = ##class(web.YZSY.HQMSFieldMeta).GetMeta()
	s arr = [].%FromJSON(meta)
	s cList = ""
	s cntC = 0
	for i = 0:1:arr.%Size()-1 {
		if arr.%Get(i).group = "C" {
			s cList = cList _ $lb(arr.%Get(i).code)
			s cntC = cntC + 1
		}
	}
	w "C组列数=",cntC,!
	; 4) 阈值二分（200/400/全部）
	d ..TryReadN(obj, cList, 200)
	d ..TryReadN(obj, cList, 400)
	d ..TryReadN(obj, cList, cntC)
	; 5) 逐列读取定位异常列
	w "逐列读取:",!
	s badIdx = ""
	try {
		for i = 1:1:$ll(cList) {
			s badIdx = i
			s c = $lg(cList, i)
			s v = $property(obj, c)
		}
		w "逐列读取全部成功",!
	} catch ex {
		w "逐列读取ERR Code=",ex.Code," Name=",ex.Name," :",ex.DisplayString(),!
		if badIdx '= "" {
			w "出错列索引=",badIdx," 列码=",$lg(cList, badIdx),!
		}
	}
	; 6) 直接调 QueryData（全部 C 列，不带条件，验证任意列数可用）
	s codes = []
	for i = 1:1:$ll(cList) {
		d codes.%Push($lg(cList, i))
	}
	w "QueryData(全C列): ", ##class(web.YZSY.DHCMRHQMSQuery).QueryData(codes.%ToJSON(), "[]", 1, 3),!
}

/// 读取前 n 列拼 $lb 行（排障用）
ClassMethod TryReadN(obj, cList As %String, n As %Integer)
{
	s row = ""
	try {
		for i = 1:1:n {
			s c = $lg(cList, i)
			s pv = $property(obj, c)
			s row = row _ $lb(pv)
		}
		w "TryReadN("_n_"列) OK 行元素数=",$ll(row),!
	} catch ex {
		w "TryReadN("_n_"列) ERR Code=",ex.Code," Name=",ex.Name," :",ex.DisplayString(),!
	}
}

}
