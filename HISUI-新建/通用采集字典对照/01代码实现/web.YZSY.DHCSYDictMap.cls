/// Description: 第三方平台(通用数据采集标准)字典与 HIS 字典对照维护
/// 存储结构(全部挂 ^YZSY("SYDictMap")):
///   ("Platform",平台代码)                         = 平台名称^版本^启用标志^备注
///   ("HisDict",字典代码)                          = 字典名称^类型(S/E)^启用标志^备注^创建人^创建时间^修改人^修改时间
///   ("HisDictSQL",字典代码)                       = SQL文本(须返回 id,code,desc 三列)
///   ("HisDictEnum",字典代码,n)                    = code^desc (枚举方式逐行维护)
///   ("Domain",平台代码,值域代码)                  = 值域名称^HIS字典代码^章节^备注^启用标志
///   ("Item",平台代码,值域代码,条目代码)            = 条目名称^说明
///   ("Rel",平台代码,值域代码,条目代码,HIS代码)     = HIS描述^状态(Y/N)^创建人^创建时间^修改人^修改时间^备注
///   ("IdxRel",平台代码,值域代码,HIS代码,条目代码) = ""   反查索引(防同一HIS码重复对照)
/// HIS 字典表注册方式:
///   S=SQL语句  维护一条 SELECT 语句, 查询结果须返回 id,code,desc 三列(例: SELECT CTLOC_RowID,CTLOC_Code,CTLOC_Desc FROM CT_Loc)
///   E=枚举维护  直接逐行维护字典值(每行 code,desc), 用于 HIS 没有现成字典表的情况
/// 工作流: 采集值域先维护(注册)对应的 HIS 字典表(SQL或枚举), 再将其与值域绑定, 之后在值域条目与 HIS 字典条目之间建立对照。
/// 注意: SQL/枚举字典新增后务必先点【探测】确认可取数, 再用于对照。
/// Creator:    AI
/// CreateDate: 20260905
Class web.YZSY.DHCSYDictMap Extends DHCDoc.Util.RegisteredObject
{

/// 存储根节点
ClassMethod G() As %String
{
	q "^YZSY(""SYDictMap"")"
}

/// 当前操作人
ClassMethod GetUser() As %String
{
	s user=""
	try {
		s user=%session.Get("LOGON.USERID")
	} catch {
		s user=""
	}
	s:user="" user="system"
	q user
}

/// 当前时间 yyyy-mm-dd hh:mm:ss
ClassMethod Now() As %String
{
	q $zdt($h,3)_" "_$zt($p($h,",",2),1)
}

/// 取 SQL 结果集列数(兼容不同 IRIS 版本取法; 探测失败返回 0, 调用方回退按3列处理)
ClassMethod SqlColCount(rs As %SQL.StatementResult) As %Integer
{
	s n=0
	try {
		s n=rs.%GetMetadata().%GetColumnCount()
	} catch ex {
		try {
			s n=rs.%GetColumnCount()
		} catch ex2 {
			s n=0
		}
	}
	q n
}

/// JSON 字符串值转义
ClassMethod J(str As %String) As %String
{
	s str=$g(str)
	s str=$replace(str,"\","\\")
	s str=$replace(str,"""","\""")
	s str=$replace(str,$c(13),"")
	s str=$replace(str,$c(10),"")
	s str=$replace(str,$c(9)," ")
	q str
}

/// JSON 字符串值转义(保留换行, 供 SQL/枚举文本往返使用):
/// 换行转成 \n 字面量, JSON.parse 后还原为真实换行, 编辑弹窗/表格可原样回显
ClassMethod JN(str As %String) As %String
{
	s str=$g(str)
	s str=$replace(str,"\","\\")
	s str=$replace(str,"""","\""")
	s str=$replace(str,$c(13),"")
	s str=$replace(str,$c(10),"\n")
	s str=$replace(str,$c(9),"\t")
	q str
}

/// 关键字匹配失败返回 1(空关键字不过滤)
ClassMethod MatchFail(code As %String, desc As %String, kw As %String) As %Boolean
{
	q:kw="" 0
	s kw=$zconvert(kw,"U")
	q:($zconvert($g(code),"U")[kw) 0
	q:($zconvert($g(desc),"U")[kw) 0
	q 1
}

/// 从返回 JSON 中取数字字段(导入累加用)
ClassMethod JsonNum(json As %String, key As %String) As %Integer
{
	s node=$p(json,""""_key_""":",2)
	q +$p(node,",",1)
}

/// 是否首批次(决定是否清库)
ClassMethod PickClear(First As %Integer, ClearFlag As %String) As %String
{
	q:(First=1) ClearFlag
	q "N"
}

/// 清洗入参: 去掉换行, 把 ^ 换成全角(^ 是本模块的 piece 分隔符, 内容中禁止出现)
ClassMethod Clean(str As %String) As %String
{
	s str=$g(str)
	s str=$replace(str,$c(13),"")
	s str=$replace(str,$c(10),"")
	s str=$replace(str,"^","＾")
	q str
}

/* ============================ 通用分页 ============================ */
/// 统一分页 JSON 组装(数据源 ^||CacheTemp("SYDictMap","Q",pid,idx))
/// kind: Platform / HisDict / Domain / Item / Rel / HisDictItem
ClassMethod PageJson(pid As %Integer, total As %Integer, Page As %String, Rows As %String, kind As %String) As %String
{
	s page=+$g(Page)
	s rows=+$g(Rows)
	s:page<1 page=1
	s:rows<0 rows=0
	s:rows>500 rows=500
	s json="{""total"":"_total_",""rows"":["
	s first=1
	if (rows>0) {
		s offset=(page-1)*rows
		s startIdx=total-offset
		s:startIdx<1 startIdx=1
		s endIdx=(startIdx-rows)+1
		s:endIdx<1 endIdx=1
		for i=startIdx:-1:endIdx {
			s line=$g(^||CacheTemp("SYDictMap","Q",pid,i))
			continue:line=""
			s row=..BuildRow(kind,$p(line,"^",1),$p(line,"^",2,99))
			s:'first json=json_","
			s first=0
			s json=json_row
		}
	} else {
		for i=total:-1:1 {
			s line=$g(^||CacheTemp("SYDictMap","Q",pid,i))
			continue:line=""
			s row=..BuildRow(kind,$p(line,"^",1),$p(line,"^",2,99))
			s:'first json=json_","
			s first=0
			s json=json_row
		}
	}
	s json=json_"]}"
	q json
}

/// 行组装分发(各类在 Q 行中的分片约定见各 Build*Row 注释)
ClassMethod BuildRow(kind As %String, key As %String, data As %String) As %String
{
	if (kind="Platform") {
		q ..BuildPlatformRow(key,data)
	} elseif (kind="HisDict") {
		q ..BuildHisDictRow(key,data)
	} elseif (kind="Domain") {
		/* Q行(平台在数据前): 键 ^ 平台代码 ^ 值域数据; 数据段数不齐也不影响取平台 */
		q ..BuildDomainRow(key,$p(data,"^",2,99),$p(data,"^",1))
	} elseif (kind="Item") {
		q ..BuildItemRow(key,$p(data,"^",1,2),$p(data,"^",3,99))
	} elseif (kind="Rel") {
		q ..BuildRelRow(key,$p(data,"^",1,7),$p(data,"^",8,99))
	} elseif (kind="HisDictItem") {
		q ..BuildHisItemRow(key,data)
	}
	q "{}"
}

/// Q行: 平台代码 ^ 平台数据
ClassMethod BuildPlatformRow(platCode As %String, data As %String) As %String
{
	s g=..G()
	s domCnt=0
	s itemCnt=0
	s relCnt=0
	s dc=""
	for {
		s dc=$o(^YZSY("SYDictMap","Domain",platCode,dc))
		q:dc=""
		s domCnt=domCnt+1
		s ic=""
		for {
			s ic=$o(^YZSY("SYDictMap","Item",platCode,dc,ic))
			q:ic=""
			s itemCnt=itemCnt+1
			s hc=""
			for {
				s hc=$o(^YZSY("SYDictMap","Rel",platCode,dc,ic,hc))
				q:hc=""
				s relCnt=relCnt+1
			}
		}
	}
	s json="{""PlatCode"":"""_..J(platCode)_""""
	s json=json_",""PlatName"":"""_..J($p(data,"^",1))_""""
	s json=json_",""Version"":"""_..J($p(data,"^",2))_""""
	s json=json_",""ActiveFlag"":"""_..J($p(data,"^",3))_""""
	s json=json_",""Memo"":"""_..J($p(data,"^",4))_""""
	s json=json_",""DomainCnt"":"_domCnt
	s json=json_",""ItemCnt"":"_itemCnt
	s json=json_",""RelCnt"":"_relCnt_"}"
	q json
}

/// Q行: 字典代码 ^ 字典定义(8 piece) ^ SQL/枚举内容(供列表显示与编辑回填)
ClassMethod BuildHisDictRow(dictCode As %String, data As %String) As %String
{
	s g=..G()
	s type=$p(data,"^",2)
	s content=""
	if (type="S") {
		s content=$g(^YZSY("SYDictMap","HisDictSQL",dictCode))
	} elseif (type="E") {
		s i=""
		for {
			s i=$o(^YZSY("SYDictMap","HisDictEnum",dictCode,i))
			q:i=""
			s rec=$g(^YZSY("SYDictMap","HisDictEnum",dictCode,i))
			continue:rec=""
			s:content'="" content=content_$c(10)
			s content=content_$p(rec,"^",1)_"="_$p(rec,"^",2)
		}
	}
	s json="{""DictCode"":"""_..J(dictCode)_""""
	s json=json_",""DictName"":"""_..J($p(data,"^",1))_""""
	s json=json_",""Type"":"""_..J(type)_""""
	s json=json_",""Mode"":"""_..J(type)_""""
	s json=json_",""SqlText"":"""_..JN(content)_""""
	s json=json_",""ActiveFlag"":"""_..J($p(data,"^",3))_""""
	s json=json_",""Memo"":"""_..J($p(data,"^",4))_""""
	s json=json_",""CreateUser"":"""_..J($p(data,"^",5))_""""
	s json=json_",""CreateTime"":"""_..J($p(data,"^",6))_""""
	s json=json_",""UpdateUser"":"""_..J($p(data,"^",7))_""""
	s json=json_",""UpdateTime"":"""_..J($p(data,"^",8))_"""}"
	q json
}

/// 入参: domCode=值域代码, data=值域数据(名称^HIS字典^章节^备注^启用, 段数可不齐), extra=平台代码
ClassMethod BuildDomainRow(domCode As %String, data As %String, extra As %String) As %String
{
	s g=..G()
	s plat=$p(extra,"^",1)
	s hisDict=$p(data,"^",2)
	/* 未绑定 HIS 字典(空)时不得读 HisDict("") 空下标节点(本环境会抛 <SUBSCRIPT>) */
	s hisName=""
	if (hisDict'="") {
		s hisName=$p($g(^YZSY("SYDictMap","HisDict",hisDict)),"^",1)
	}
	s itemCnt=0
	s mappedCnt=0
	s relCnt=0
	s ic=""
	for {
		s ic=$o(^YZSY("SYDictMap","Item",plat,domCode,ic))
		q:ic=""
		s itemCnt=itemCnt+1
		s hc=$o(^YZSY("SYDictMap","Rel",plat,domCode,ic,""))
		continue:hc=""
		s mappedCnt=mappedCnt+1
		s hc2=""
		for {
			s hc2=$o(^YZSY("SYDictMap","Rel",plat,domCode,ic,hc2))
			q:hc2=""
			s relCnt=relCnt+1
		}
	}
	s json="{""DomainCode"":"""_..J(domCode)_""""
	s json=json_",""DomainName"":"""_..J($p(data,"^",1))_""""
	s json=json_",""Chapter"":"""_..J($p(data,"^",3))_""""
	s json=json_",""HisDictCode"":"""_..J(hisDict)_""""
	s json=json_",""HisDictName"":"""_..J(hisName)_""""
	s json=json_",""MapMode"":"""_$s(hisDict'="":"D",1:"M")_""""
	s json=json_",""ActiveFlag"":"""_..J($p(data,"^",5))_""""
	s json=json_",""Memo"":"""_..J($p(data,"^",4))_""""
	s json=json_",""ItemCnt"":"_itemCnt
	s json=json_",""MappedCnt"":"_mappedCnt
	s json=json_",""RelCnt"":"_relCnt_"}"
	q json
}

/// Q行: 条目代码 ^ 条目数据(2 piece) ^ 平台代码 ^ 值域代码
ClassMethod BuildItemRow(itemCode As %String, data As %String, extra As %String) As %String
{
	s g=..G()
	s plat=$p(extra,"^",1)
	s domCode=$p(extra,"^",2)
	s relCnt=0
	s codes=""
	s descs=""
	s hc=""
	for {
		s hc=$o(^YZSY("SYDictMap","Rel",plat,domCode,itemCode,hc))
		q:hc=""
		s relCnt=relCnt+1
		s:codes'="" codes=codes_"/"
		s codes=codes_hc
		s:descs'="" descs=descs_"/"
		s descs=descs_$p($g(^YZSY("SYDictMap","Rel",plat,domCode,itemCode,hc)),"^",1)
	}
	s json="{""ItemCode"":"""_..J(itemCode)_""""
	s json=json_",""ItemName"":"""_..J($p(data,"^",1))_""""
	s json=json_",""Memo"":"""_..J($p(data,"^",2))_""""
	s json=json_",""RelCnt"":"_relCnt
	s json=json_",""RelCodes"":"""_..J(codes)_""""
	s json=json_",""RelDescs"":"""_..J(descs)_"""}"
	q json
}

/// Q行: HIS代码 ^ 对照数据(7 piece) ^ 值域代码 ^ 条目代码 ^ 平台代码
ClassMethod BuildRelRow(hisCode As %String, data As %String, extra As %String) As %String
{
	s g=..G()
	s domCode=$p(extra,"^",1)
	s itemCode=$p(extra,"^",2)
	s plat=$p(extra,"^",3)
	s domDef=$g(^YZSY("SYDictMap","Domain",plat,domCode))
	s hisDict=$p(domDef,"^",2)
	s json="{""PlatCode"":"""_..J(plat)_""""
	s json=json_",""DomainCode"":"""_..J(domCode)_""""
	s json=json_",""DomainName"":"""_..J($p(domDef,"^",1))_""""
	s json=json_",""ItemCode"":"""_..J(itemCode)_""""
	s json=json_",""ItemName"":"""_..J($p($g(^YZSY("SYDictMap","Item",plat,domCode,itemCode)),"^",1))_""""
	s json=json_",""HisCode"":"""_..J(hisCode)_""""
	s json=json_",""HisDesc"":"""_..J($p(data,"^",1))_""""
	s json=json_",""ActiveFlag"":"""_..J($p(data,"^",2))_""""
	s json=json_",""CreateUser"":"""_..J($p(data,"^",3))_""""
	s json=json_",""CreateTime"":"""_..J($p(data,"^",4))_""""
	s json=json_",""UpdateUser"":"""_..J($p(data,"^",5))_""""
	s json=json_",""UpdateTime"":"""_..J($p(data,"^",6))_""""
	s json=json_",""Memo"":"""_..J($p(data,"^",7))_""""
	s json=json_",""HisDictCode"":"""_..J(hisDict)_""""
	s json=json_",""HisDictName"":"""_..J($p($g(^YZSY("SYDictMap","HisDict",hisDict)),"^",1))_""""
	s json=json_",""MapMode"":"""_$s(hisDict'="":"D",1:"M")_"""}"
	q json
}

/// Q行: HIS代码 ^ HIS描述 ^ isMapped(0/1)
ClassMethod BuildHisItemRow(code As %String, data As %String) As %String
{
	s desc=$p(data,"^",1)
	s isMapped=$p(data,"^",2)
	s:(isMapped'="1") isMapped="0"
	s json="{""Code"":"""_..J(code)_""",""Desc"":"""_..J(desc)_""",""isMapped"":"_isMapped_"}"
	q json
}

/* ============================ 一、平台(采集字典)维护 ============================ */
/// 查询平台列表
/// w ##class(web.YZSY.DHCSYDictMap).QueryPlatform("","",1,20)
ClassMethod QueryPlatform(Keyword As %String, ActiveFlag As %String, Page As %Integer = 1, Rows As %Integer = 20) As %String
{
	s g=..G()
	s pid=$i(^||CacheTemp("SYDictMap","PID"))
	k ^||CacheTemp("SYDictMap","Q",pid)
	s key=""
	s idx=0
	for {
		s key=$o(^YZSY("SYDictMap","Platform",key))
		q:key=""
		s data=$g(^YZSY("SYDictMap","Platform",key))
		continue:(Keyword'="")&&(key'[Keyword)&&(data'[Keyword)
		s flag=$p(data,"^",3)
		continue:(ActiveFlag'="")&&(flag'=ActiveFlag)
		s idx=idx+1
		s ^||CacheTemp("SYDictMap","Q",pid,idx)=key_"^"_data
	}
	s json=..PageJson(pid,idx,Page,Rows,"Platform")
	k ^||CacheTemp("SYDictMap","Q",pid)
	q json
}

/// 保存平台(新增/修改)
/// w ##class(web.YZSY.DHCSYDictMap).SavePlatform("SY","通用数据采集标准","v1.6","Y","")
ClassMethod SavePlatform(PlatCode As %String, PlatName As %String, Version As %String, ActiveFlag As %String, Memo As %String) As %String
{
	s g=..G()
	s platCode=$zstrip(PlatCode,"<>w")
	q:platCode="" "{""success"":false,""msg"":""平台代码不能为空""}"
	q:PlatName="" "{""success"":false,""msg"":""平台名称不能为空""}"
	s flag=$zconvert(ActiveFlag,"U")
	s:flag'="N" flag="Y"
	l +^YZSY("SYDictMapLock","Platform",platCode):10
	else  q "{""success"":false,""msg"":""系统繁忙,请稍后重试""}"
	s ^YZSY("SYDictMap","Platform",platCode)=PlatName_"^"_Version_"^"_flag_"^"_Memo
	l -^YZSY("SYDictMapLock","Platform",platCode)
	q "{""success"":true,""msg"":""保存成功""}"
}

/// 删除平台(连带删除该平台下值域/条目/对照关系)
/// w ##class(web.YZSY.DHCSYDictMap).DeletePlatform("TEST")
ClassMethod DeletePlatform(PlatCode As %String) As %String
{
	s g=..G()
	s platCode=$zstrip(PlatCode,"<>w")
	q:platCode="" "{""success"":false,""msg"":""平台代码不能为空""}"
	q:'$d(^YZSY("SYDictMap","Platform",platCode)) "{""success"":false,""msg"":""平台不存在""}"
	l +^YZSY("SYDictMapLock","Platform",platCode):10
	else  q "{""success"":false,""msg"":""系统繁忙,请稍后重试""}"
	k ^YZSY("SYDictMap","Platform",platCode)
	k ^YZSY("SYDictMap","Domain",platCode)
	k ^YZSY("SYDictMap","Item",platCode)
	k ^YZSY("SYDictMap","Rel",platCode)
	k ^YZSY("SYDictMap","IdxRel",platCode)
	/* 反向快照索引(用于按 HIS 代码反查条目)一并清掉 */
	k ^YZSY("SYDictMap","RelByHis",platCode)
	l -^YZSY("SYDictMapLock","Platform",platCode)
	q "{""success"":true,""msg"":""删除成功""}"
}

/* ============================== 反向快照索引 ==============================
   设计: 对每个 Rel 关系, 在 RelByHis(plat,dom,hc,ic) 缓存一条快照
         = relAll ^ itemName ^ itemMemo ^ createTime ^ updateUser ^ updateTime
         其中 relAll = hisDesc^flag^createUser^createTime  (与 ^YZSY("SYDictMap","Rel",...) 原始值一致)
   这让 QueryRelByHis 通过 (plat,dom,hc) 一次 $o + $g 命中, 不必再去联动
   ^YZSY("SYDictMap","Rel",...) 和 ^YZSY("SYDictMap","Item"/"DomainItem",...)
   所有写 Rel 的方法都必须在维护 Rel / IdxRel 之后同步维护此索引 */

/* 从 Rel + 采集条目取真值, 拼成快照写入 RelByHis(plat,dom,hc,ic).
   若 Rel 已删除则连带清掉快照
   快照统一为 9 字段(全部 ..J() 转义, 可直接拼 JSON 不必再 escape):
     $p(1)=hisDesc   $p(2)=flag   $p(3)=createUser   $p(4)=createTime
     $p(5)=updateUser $p(6)=updateTime $p(7)=memo
     $p(8)=itemName $p(9)=itemMemo
   注: 字段顺序与 Rel 原始值兼容, 但 Rel 原始是"未转义"
        这里全部走 ..J(), 消费方使用时无需再次 escape */
ClassMethod UpdateRelByHisIndex(platCode As %String, domCode As %String, ic As %String, hc As %String)
{
	q:(platCode="")||(domCode="")||(ic="")||(hc="")
	s g=..G()
	s rel=$g(^YZSY("SYDictMap","Rel",platCode,domCode,ic,hc))
	i rel="" {
		k ^YZSY("SYDictMap","RelByHis",platCode,domCode,hc,ic)
		q
	}
	s hisDesc=$p(rel,"^",1), flag=$p(rel,"^",2), createUser=$p(rel,"^",3), createTime=$p(rel,"^",4)
	s updateUser=$p(rel,"^",5), updateTime=$p(rel,"^",6), memo=$p(rel,"^",7)
	/* 兼容两套键 Item(本类) 与 DomainItem */
	s itemStr=$g(^YZSY("SYDictMap","Item",platCode,domCode,ic)) _ $g(^YZSY("SYDictMap","DomainItem",platCode,domCode,ic))
	s itemName=$p(itemStr,"^",1), itemMemo=$p(itemStr,"^",2)
	/* itemStr 为空时 DomainItem 可能不存; 取 itemMemo 备用 */
	i itemMemo="" s itemMemo=$p(itemStr,"^",2,$l(itemStr,"^"))
	s ^YZSY("SYDictMap","RelByHis",platCode,domCode,hc,ic)=..J(hisDesc)_"^"_..J(flag)_"^"_..J(createUser)_"^"_..J(createTime)_"^"_..J(updateUser)_"^"_..J(updateTime)_"^"_..J(memo)_"^"_..J(itemName)_"^"_..J(itemMemo)
}

/* ============================ 二、HIS 字典表注册 ============================ */
/// 查询 HIS 字典表注册表
/// w ##class(web.YZSY.DHCSYDictMap).QueryHisDict("","",1,50)
ClassMethod QueryHisDict(Keyword As %String, ActiveFlag As %String, Page As %Integer = 1, Rows As %Integer = 50) As %String
{
	s g=..G()
	s pid=$i(^||CacheTemp("SYDictMap","PID"))
	k ^||CacheTemp("SYDictMap","Q",pid)
	s key=""
	s idx=0
	for {
		s key=$o(^YZSY("SYDictMap","HisDict",key))
		q:key=""
		s data=$g(^YZSY("SYDictMap","HisDict",key))
		continue:(Keyword'="")&&(key'[Keyword)&&($p(data,"^",1)'[Keyword)&&($p(data,"^",2)'[Keyword)
		s flag=$p(data,"^",3)
		continue:(ActiveFlag'="")&&(flag'=ActiveFlag)
		s idx=idx+1
		s ^||CacheTemp("SYDictMap","Q",pid,idx)=key_"^"_data
	}
	s json=..PageJson(pid,idx,Page,Rows,"HisDict")
	k ^||CacheTemp("SYDictMap","Q",pid)
	q json
}

/// 保存 HIS 字典表注册(新增/修改)
/// Mode: S=SQL语句(须返回 code,desc 列)  E=枚举维护(逐行 code=名称)
/// SqlText: Mode=S 时为 SQL 语句, Mode=E 时为枚举文本(每行一条 code=名称;
///          兼容 制表符/逗号/^ 分隔; 空行与 # 开头行忽略)
/// w ##class(web.YZSY.DHCSYDictMap).SaveHisDict("CTLOC","科室字典","S","SELECT CTLOC_RowID,CTLOC_Code,CTLOC_Desc FROM CT_Loc","Y","")
ClassMethod SaveHisDict(DictCode As %String, DictName As %String, Mode As %String, SqlText As %String, ActiveFlag As %String, Memo As %String) As %String
{
	s g=..G()
	s dictCode=$zstrip(DictCode,"<>w")
	q:dictCode="" "{""success"":false,""msg"":""字典代码不能为空""}"
	q:DictName="" "{""success"":false,""msg"":""字典名称不能为空""}"
	s mode=$zconvert(Mode,"U")
	q:(mode'="S")&&(mode'="E") "{""success"":false,""msg"":""类型只能为S(SQL)或E(枚举)""}"
	s content=$g(SqlText)
	q:content="" "{""success"":false,""msg"":""SQL语句/枚举内容不能为空""}"
	s flag=$zconvert(ActiveFlag,"U")
	s:flag'="N" flag="Y"
	s user=..GetUser()
	s now=..Now()
	l +^YZSY("SYDictMapLock","HisDict",dictCode):10
	else  q "{""success"":false,""msg"":""系统繁忙,请稍后重试""}"
	s ^YZSY("SYDictMap","HisDict",dictCode)=DictName_"^"_mode_"^"_flag_"^"_Memo_"^"_user_"^"_now_"^"_user_"^"_now
	if (mode="S") {
		s ^YZSY("SYDictMap","HisDictSQL",dictCode)=content
		k ^YZSY("SYDictMap","HisDictEnum",dictCode)
	} else {
		k ^YZSY("SYDictMap","HisDictSQL",dictCode)
		k ^YZSY("SYDictMap","HisDictEnum",dictCode)
		s n=0
		for l=1:1:$l(content,$c(10)) {
			s line=$zstrip($p(content,$c(10),l),"<>w")
			continue:line=""
			continue:$e(line,1)="#"
			s sep=$s($f(line,"="):"=", $f(line,$c(9)):$c(9), $f(line,","):",", $f(line,"^"):"^", 1:"")
			continue:sep=""
			s code=$zstrip($p(line,sep),"<>w")
			s desc=$zstrip($p(line,sep,2,$l(line,sep)),"<>w")
			continue:code=""
			s n=n+1
			s ^YZSY("SYDictMap","HisDictEnum",dictCode,n)=code_"^"_desc
		}
		/* 计数节点必须最后写, 中间写会被后续循环覆盖为 0, 导致枚举内容"保存后丢失" */
		s ^YZSY("SYDictMap","HisDictEnum",dictCode)=n
	}
	l -^YZSY("SYDictMapLock","HisDict",dictCode)
	q "{""success"":true,""msg"":""保存成功""}"
}

/// 删除 HIS 字典表注册(被值域引用时禁止删除)
/// w ##class(web.YZSY.DHCSYDictMap).DeleteHisDict("CTLOC")
ClassMethod DeleteHisDict(DictCode As %String) As %String
{
	s g=..G()
	s dictCode=$zstrip(DictCode,"<>w")
	q:dictCode="" "{""success"":false,""msg"":""字典代码不能为空""}"
	q:'$d(^YZSY("SYDictMap","HisDict",dictCode)) "{""success"":false,""msg"":""字典表不存在""}"
	s inUse=""
	s plat=""
	for {
		s plat=$o(^YZSY("SYDictMap","Domain",plat))
		q:plat=""
		s dc=""
		for {
			s dc=$o(^YZSY("SYDictMap","Domain",plat,dc))
			q:dc=""
			s:($p($g(^YZSY("SYDictMap","Domain",plat,dc)),"^",2)=dictCode) inUse=plat_"/"_dc
		}
	}
	q:inUse'="" "{""success"":false,""msg"":""该字典表已被值域["_..J(inUse)_"]引用,不能删除""}"
	l +^YZSY("SYDictMapLock","HisDict",dictCode):10
	else  q "{""success"":false,""msg"":""系统繁忙,请稍后重试""}"
	k ^YZSY("SYDictMap","HisDict",dictCode)
	k ^YZSY("SYDictMap","HisDictSQL",dictCode)
	k ^YZSY("SYDictMap","HisDictEnum",dictCode)
	l -^YZSY("SYDictMapLock","HisDict",dictCode)
	q "{""success"":true,""msg"":""删除成功""}"
}

/// 探测 HIS 字典表: 返回前5条原始样本, 用于确认代码/描述字段位置
/// w ##class(web.YZSY.DHCSYDictMap).ProbeHisDict("CTLOC")
ClassMethod ProbeHisDict(DictCode As %String) As %String
{
	s g=..G()
	s dictCode=$zstrip(DictCode,"<>w")
	q:dictCode="" "{""success"":false,""msg"":""字典代码不能为空""}"
	s def=$g(^YZSY("SYDictMap","HisDict",dictCode))
	q:def="" "{""success"":false,""msg"":""字典表未注册""}"
	s type=$p(def,"^",2)
	s json="{""success"":true,""DictCode"":"""_..J(dictCode)_""",""Mode"":"""_..J(type)_""",""samples"":["
	s first=1
	s errMsg=""
	if (type="S") {
		s sql=$g(^YZSY("SYDictMap","HisDictSQL",dictCode))
		try {
			s st=##class(%SQL.Statement).%New()
			if (st.%Prepare(sql)=1) {
				s rs=st.%Execute()
				/* 兼容2列(code,desc)与3列(id,code,desc): id 可选 */
				s colCnt=..SqlColCount(rs)
				s:colCnt<1 colCnt=3
				s idI=0
				s codeI=1
				s descI=1
				if (colCnt>=2) { s descI=2 }
				if (colCnt>=3) { s idI=1 s codeI=2 s descI=3 }
				s cnt=0
				while (rs.%Next()) {
					s code=rs.%GetData(codeI)
					s desc=rs.%GetData(descI)
					s id=$s(idI:rs.%GetData(idI),1:code)
					s:'first json=json_","
					s first=0
					s json=json_"{""id"":"""_..J(id)_""",""code"":"""_..J(code)_""",""desc"":"""_..J(desc)_""",""raw"":"""_..J(id_"^"_code_"^"_desc)_"""}"
					s cnt=cnt+1
					q:cnt>=5
				}
				s:cnt=0 errMsg="SQL未返回数据,请检查语句(须返回 id,code,desc 三列)"
			} else {
				s errMsg="SQL预编译失败,请检查语句语法"
			}
		} catch ex {
			s errMsg="SQL执行异常: "_ex.Name
		}
	} else {
		s i=""
		s cnt=0
		for {
			s i=$o(^YZSY("SYDictMap","HisDictEnum",dictCode,i))
			q:i=""
			s rec=$g(^YZSY("SYDictMap","HisDictEnum",dictCode,i))
			continue:rec=""
			s code=$p(rec,"^",1)
			s desc=$p(rec,"^",2)
			s:'first json=json_","
			s first=0
			s json=json_"{""id"":"""_..J(code)_""",""code"":"""_..J(code)_""",""desc"":"""_..J(desc)_""",""raw"":"""_..J(rec)_"""}"
			s cnt=cnt+1
			q:cnt>=5
		}
		s:cnt=0 errMsg="枚举字典暂无数据"
	}
	s:errMsg'="" json=json_$s(first:"",1:",")_"{""id"":"""",""code"":"""",""desc"":"""_..J(errMsg)_""",""raw"":""""}"
	s json=json_"]}"
	q json
}

/// 通用读取 HIS 字典条目(服务端分页, Rows<=0 返回全部)
/// MappedFilter: 空/A=全部, N=仅未对照(默认), M=仅已对照
/// 用 ^YZSY("IdxRel",PlatCode,DomainCode,HisCode) 反查该值域下哪些 HIS 代码已被任一采集条目对照
/// w ##class(web.YZSY.DHCSYDictMap).QueryHisDictItem("SY","GB/T 3304-1991","CT_NATION","",1,50,"N")
ClassMethod QueryHisDictItem(PlatCode As %String, DomainCode As %String, DictCode As %String, Keyword As %String, Page As %Integer = 1, Rows As %Integer = 50, MappedFilter As %String = "") As %String
{
	s g=..G()
	s platCode=$zstrip(PlatCode,"<>w"), domCode=$zstrip(DomainCode,"<>w"), dictCode=$zstrip(DictCode,"<>w")
	s mf=$s(MappedFilter="M":"M",MappedFilter="A":"A",1:"N")
	q:dictCode="" "{""success"":false,""total"":0,""rows"":[],""msg"":""字典代码不能为空""}"
	s def=$g(^YZSY("SYDictMap","HisDict",dictCode))
	q:def="" "{""success"":false,""total"":0,""rows"":[],""msg"":""字典表未注册""}"
	s type=$p(def,"^",2)
	s pid=$i(^||CacheTemp("SYDictMap","PID"))
	k ^||CacheTemp("SYDictMap","Q",pid), ^||CacheTemp("SYDictMap","Mapped",pid)
	s idx=0
	s errMsg=""
	/* 先把该值域下已被任何条目对照过的 HIS 代码装到集合里, 便于 O(1) 判断 */
	s mappedCnt=0
	if (platCode'="") && domCode'="" {
		s hisCode=""
		for {
			s hisCode=$o(^YZSY("SYDictMap","IdxRel",platCode,domCode,hisCode))
			q:hisCode=""
			s ^||CacheTemp("SYDictMap","Mapped",pid,hisCode)=""
			s mappedCnt=mappedCnt+1
		}
	}
	if (type="S") {
		s sql=$g(^YZSY("SYDictMap","HisDictSQL",dictCode))
		try {
			s st=##class(%SQL.Statement).%New()
			if (st.%Prepare(sql)=1) {
				s rs=st.%Execute()
				/* 兼容2列(code,desc)与3列(id,code,desc) */
				s colCnt=..SqlColCount(rs)
				s:colCnt<1 colCnt=3
				s codeI=1
				s descI=1
				if (colCnt>=2) { s descI=2 }
				if (colCnt>=3) { s codeI=2 s descI=3 }
				while (rs.%Next()) {
					s code=rs.%GetData(codeI)
					s desc=rs.%GetData(descI)
					continue:..MatchFail(code,desc,Keyword)
					s isMapped=$d(^||CacheTemp("SYDictMap","Mapped",pid,code))>0
					/* MappedFilter 过滤 */
					if (mf="N") && isMapped continue
					if (mf="M") && 'isMapped continue
					s idx=idx+1
					s ^||CacheTemp("SYDictMap","Q",pid,idx)=code_"^"_desc_"^"_isMapped
					continue:idx>=50000
				}
			} else {
				s errMsg="SQL预编译失败,请检查语句"
			}
		} catch ex {
			s errMsg="SQL执行异常: "_ex.Name
		}
	} else {
		s i=""
		for {
			s i=$o(^YZSY("SYDictMap","HisDictEnum",dictCode,i))
			q:i=""
			s rec=$g(^YZSY("SYDictMap","HisDictEnum",dictCode,i))
			continue:rec=""
			s code=$p(rec,"^",1)
			s desc=$p(rec,"^",2)
			continue:..MatchFail(code,desc,Keyword)
			s isMapped=$d(^||CacheTemp("SYDictMap","Mapped",pid,code))>0
			if (mf="N") && isMapped continue
			if (mf="M") && 'isMapped continue
			s idx=idx+1
			s ^||CacheTemp("SYDictMap","Q",pid,idx)=code_"^"_desc_"^"_isMapped
		}
	}
	k ^||CacheTemp("SYDictMap","Mapped",pid)
	s json=..PageJson(pid,idx,Page,Rows,"HisDictItem")
	k ^||CacheTemp("SYDictMap","Q",pid)
	s json="{""success"":true,""msg"":"""_..J(errMsg)_""",""mappedCnt"":"_mappedCnt_","_$e(json,2,$l(json))
	q json
}

/// 按 HIS 字典取单个描述(保存对照时存快照)
/// w ##class(web.YZSY.DHCSYDictMap).GetHisDesc("CTLOC","1")
ClassMethod GetHisDesc(DictCode As %String, HisCode As %String) As %String
{
	q:DictCode="" ""
	q:HisCode="" ""
	s g=..G()
	s def=$g(^YZSY("SYDictMap","HisDict",DictCode))
	q:def="" ""
	s type=$p(def,"^",2)
	s desc=""
	try {
		if (type="S") {
			s sql=$g(^YZSY("SYDictMap","HisDictSQL",DictCode))
			s st=##class(%SQL.Statement).%New()
			if (st.%Prepare(sql)=1) {
				s rs=st.%Execute()
				s colCnt=..SqlColCount(rs)
				s:colCnt<1 colCnt=3
				s codeI=1
				s descI=1
				if (colCnt>=2) { s descI=2 }
				if (colCnt>=3) { s codeI=2 s descI=3 }
				while (rs.%Next()) {
					if (rs.%GetData(codeI)=HisCode) { s desc=rs.%GetData(descI) q }
				}
			}
		} else {
			s i=""
			for {
				s i=$o(^YZSY("SYDictMap","HisDictEnum",DictCode,i))
				q:i=""
				s rec=$g(^YZSY("SYDictMap","HisDictEnum",DictCode,i))
				if ($p(rec,"^",1)=HisCode) { s desc=$p(rec,"^",2) q }
			}
		}
	} catch ex {
		s desc=""
	}
	q desc
}

/* ============================ 三、值域(采集字典)维护 ============================ */
/// 查询值域列表(含条目数/已对照数/对照条数统计)
/// MapFlag: ""=全部 D=已维护HIS字典 M=未维护(手工录入)
/// w ##class(web.YZSY.DHCSYDictMap).QueryDomain("SY","","",1,50)
ClassMethod QueryDomain(PlatCode As %String, Keyword As %String, MapFlag As %String, Page As %Integer = 1, Rows As %Integer = 50) As %String
{
	s g=..G()
	q:PlatCode="" "{""total"":0,""rows"":[]}"
	s pid=$i(^||CacheTemp("SYDictMap","PID"))
	k ^||CacheTemp("SYDictMap","Q",pid)
	s key=""
	s idx=0
	for {
		s key=$o(^YZSY("SYDictMap","Domain",PlatCode,key))
		q:key=""
		s data=$g(^YZSY("SYDictMap","Domain",PlatCode,key))
		continue:(Keyword'="")&&(key'[Keyword)&&(data'[Keyword)
		s hisDict=$p(data,"^",2)
		if (MapFlag="D") {
			continue:hisDict=""
		} elseif (MapFlag="M") {
			continue:hisDict'=""
		}
		s idx=idx+1
		/* Q行固定: 键 ^ 平台代码 ^ 值域数据 —— 平台放第2段, 与值域节点段数无关 */
		s ^||CacheTemp("SYDictMap","Q",pid,idx)=key_"^"_PlatCode_"^"_data
	}
	s json=..PageJson(pid,idx,Page,Rows,"Domain")
	k ^||CacheTemp("SYDictMap","Q",pid)
	q json
}

/// 维护值域对应的 HIS 字典表(传空表示解除绑定, 退回"需先维护HIS字典"状态)
/// ClearMappings: Y=若 HIS 字典发生变更, 清空该值域下所有原对照数据 (Rel / IdxRel)
/// w ##class(web.YZSY.DHCSYDictMap).SaveDomainHisDict("SY","CV02.00.101","CTNAT","N")
ClassMethod SaveDomainHisDict(PlatCode As %String, DomainCode As %String, HisDictCode As %String, ClearMappings As %String = "N") As %String
{
	s g=..G()
	q:PlatCode="" "{""success"":false,""msg"":""平台不能为空""}"
	s domCode=$zstrip(DomainCode,"<>w")
	q:domCode="" "{""success"":false,""msg"":""值域不能为空""}"
	q:'$d(^YZSY("SYDictMap","Domain",PlatCode,domCode)) "{""success"":false,""msg"":""值域不存在""}"
	s hisDict=$zstrip(HisDictCode,"<>w")
	if (hisDict'="") {
		q:'$d(^YZSY("SYDictMap","HisDict",hisDict)) "{""success"":false,""msg"":""HIS字典表["_..J(hisDict)_"]未注册,请先在【字典导入维护】中注册""}"
	}
	s oldHis=$p($g(^YZSY("SYDictMap","Domain",PlatCode,domCode)),"^",2)
	s oldHis=$zstrip(oldHis,"<>w")
	s changed=(oldHis'=hisDict)
	/* 加锁: 同时锁定 Domain 与 Rel 两个子节点, 避免与 SaveDictRel 并发 */
	l +^YZSY("SYDictMapLock","Domain",PlatCode,domCode):10
	else  q "{""success"":false,""msg"":""系统繁忙,请稍后重试""}"
	l +^YZSY("SYDictMapLock","RelAll",PlatCode,domCode):10
	else  l -^YZSY("SYDictMapLock","Domain",PlatCode,domCode) q "{""success"":false,""msg"":""系统繁忙,请稍后重试""}"
	s data=$g(^YZSY("SYDictMap","Domain",PlatCode,domCode))
	s $p(data,"^",2)=hisDict
	s ^YZSY("SYDictMap","Domain",PlatCode,domCode)=data
	s cleared=0
	if (changed) {
		/* 解绑 (hisDict="") 或 切换到新 HIS 字典 时, 视请求决定是否清空原对照 */
		if ($zstrip(ClearMappings,"<>w")'="N") {
			s itm=""
			for {
				s itm=$o(^YZSY("SYDictMap","Rel",PlatCode,domCode,itm)) q:itm=""
				s hc=""
				for {
					s hc=$o(^YZSY("SYDictMap","Rel",PlatCode,domCode,itm,hc)) q:hc=""
					k ^YZSY("SYDictMap","Rel",PlatCode,domCode,itm,hc)
					k ^YZSY("SYDictMap","IdxRel",PlatCode,domCode,hc,itm)
					k ^YZSY("SYDictMap","RelByHis",PlatCode,domCode,hc,itm)
					s cleared=cleared+1
				}
			}
		}
	}
	l -^YZSY("SYDictMapLock","RelAll",PlatCode,domCode)
	l -^YZSY("SYDictMapLock","Domain",PlatCode,domCode)
	q "{""success"":true,""msg"":""保存成功"",""changed"":""_changed_"",""cleared"":""_cleared_""}"
}

/// 取 HIS 字典完整定义(含 SQL 文本 / 枚举内容), 供编辑弹窗回填
/// w ##class(web.YZSY.DHCSYDictMap).GetHisDict("CTLOC")
ClassMethod GetHisDict(DictCode As %String) As %String
{
	s g=..G()
	s dictCode=$zstrip(DictCode,"<>w")
	q:dictCode="" "{""success"":false}"
	s def=$g(^YZSY("SYDictMap","HisDict",dictCode))
	q:def="" "{""success"":false}"
	s sql=""
	s enum=""
	s type=$p(def,"^",2)
	if (type="S") {
		s sql=$g(^YZSY("SYDictMap","HisDictSQL",dictCode))
	} else {
		s i=""
		for {
			s i=$o(^YZSY("SYDictMap","HisDictEnum",dictCode,i))
			q:i=""
			s rec=$g(^YZSY("SYDictMap","HisDictEnum",dictCode,i))
			continue:rec=""
			s enum=enum_$s(enum'="":$c(10),1:"")_$p(rec,"^",1)_","_$p(rec,"^",2)
		}
	}
	s json="{""success"":true"
	s json=json_",""DictCode"":"""_..J(dictCode)_""""
	s json=json_",""DictName"":"""_..J($p(def,"^",1))_""""
	s json=json_",""Type"":"""_..J(type)_""""
	s json=json_",""ActiveFlag"":"""_..J($p(def,"^",3))_""""
	s json=json_",""Memo"":"""_..J($p(def,"^",4))_""""
	s json=json_",""SqlText"":"""_..J(sql)_""""
	s json=json_",""EnumText"":"""_..J(enum)_"""}"
	q json
}

/// 查询值域下的采集字典条目
/// MapFlag: ""=全部 Y=已对照 N=未对照
/// w ##class(web.YZSY.DHCSYDictMap).QueryDomainItem("SY","CV02.00.101","","",1,50)
ClassMethod QueryDomainItem(PlatCode As %String, DomainCode As %String, Keyword As %String, MapFlag As %String, Page As %Integer = 1, Rows As %Integer = 50) As %String
{
	s g=..G()
	q:PlatCode="" "{""total"":0,""rows"":[]}"
	q:DomainCode="" "{""total"":0,""rows"":[]}"
	s pid=$i(^||CacheTemp("SYDictMap","PID"))
	k ^||CacheTemp("SYDictMap","Q",pid)
	s key=""
	s idx=0
	for {
		s key=$o(^YZSY("SYDictMap","Item",PlatCode,DomainCode,key))
		q:key=""
		s data=$g(^YZSY("SYDictMap","Item",PlatCode,DomainCode,key))
		continue:(Keyword'="")&&(key'[Keyword)&&(data'[Keyword)
		s hc=$o(^YZSY("SYDictMap","Rel",PlatCode,DomainCode,key,""))
		if (MapFlag="Y") {
			continue:hc=""
		} elseif (MapFlag="N") {
			continue:hc'=""
		}
		s idx=idx+1
		s ^||CacheTemp("SYDictMap","Q",pid,idx)=key_"^"_data_"^"_PlatCode_"^"_DomainCode
	}
	s json=..PageJson(pid,idx,Page,Rows,"Item")
	k ^||CacheTemp("SYDictMap","Q",pid)
	q json
}

/* ============================ 四、对照关系维护 ============================ */
/// 保存字典对照(HIS 字典多选后保存)
/// HisCodes 用 ^ 分隔; Mode: O=覆盖(默认) A=追加
/// 同一值域内一个 HIS 代码只能对照到一个采集条目, 冲突项自动跳过并回报
/// w ##class(web.YZSY.DHCSYDictMap).SaveDictRel("SY","CV02.00.101","01","1^2","O")
ClassMethod SaveDictRel(PlatCode As %String, DomainCode As %String, ItemCode As %String, HisCodes As %String, Mode As %String) As %String
{
	s g=..G()
	q:PlatCode="" "{""success"":false,""msg"":""平台不能为空""}"
	s domCode=$zstrip(DomainCode,"<>w")
	s itemCode=$zstrip(ItemCode,"<>w")
	q:domCode="" "{""success"":false,""msg"":""值域代码不能为空""}"
	q:itemCode="" "{""success"":false,""msg"":""请先选择左侧采集字典条目""}"
	s hisDict=$p($g(^YZSY("SYDictMap","Domain",PlatCode,domCode)),"^",2)
	q:hisDict="" "{""success"":false,""msg"":""该值域尚未维护HIS字典表,请先在【维护HIS字典】中注册并绑定""}"
	q:'$d(^YZSY("SYDictMap","Item",PlatCode,domCode,itemCode)) "{""success"":false,""msg"":""采集字典条目不存在""}"
	s user=..GetUser()
	s now=..Now()
	s mode=$zconvert(Mode,"U")
	s:mode'="A" mode="O"
	l +^YZSY("SYDictMapLock","Rel",PlatCode,domCode,itemCode):10
	else  q "{""success"":false,""msg"":""系统繁忙,请稍后重试""}"
	if (mode="O") {
		/* 覆盖模式: 先清掉该 (plat,dom,item) 下所有旧 Rel, 同步反向快照 */
		s ohc=""
		for {
			s ohc=$o(^YZSY("SYDictMap","Rel",PlatCode,domCode,itemCode,ohc))
			q:ohc=""
			k ^YZSY("SYDictMap","Rel",PlatCode,domCode,itemCode,ohc)
			k ^YZSY("SYDictMap","IdxRel",PlatCode,domCode,ohc,itemCode)
			k ^YZSY("SYDictMap","RelByHis",PlatCode,domCode,ohc,itemCode)
		}
	}
	s addCnt=0
	s skipCnt=0
	s conflict=""
	for i=1:1:$l(HisCodes,"^") {
		s hc=$zstrip($p(HisCodes,"^",i),"<>w")
		continue:hc=""
		s other=$o(^YZSY("SYDictMap","IdxRel",PlatCode,domCode,hc,""))
		if (other'="")&&(other'=itemCode) {
			s skipCnt=skipCnt+1
			s:conflict'="" conflict=conflict_";"
			s conflict=conflict_hc_"(已被条目"_other_"对照)"
			continue
		}
		s desc=..Clean(..GetHisDesc(hisDict,hc))
		s ^YZSY("SYDictMap","Rel",PlatCode,domCode,itemCode,hc)=desc_"^Y^"_user_"^"_now_"^"_user_"^"_now_"^"
		s ^YZSY("SYDictMap","IdxRel",PlatCode,domCode,hc,itemCode)=""
		/* 反向快照: 一次 $g 即取齐 ItemName / ItemMemo 等 */
		d ..UpdateRelByHisIndex(PlatCode, domCode, itemCode, hc)
		s addCnt=addCnt+1
	}
	l -^YZSY("SYDictMapLock","Rel",PlatCode,domCode,itemCode)
	s msg="保存成功"_addCnt_"条"
	s:skipCnt>0 msg=msg_", 跳过"_skipCnt_"条: "_conflict
	q "{""success"":true,""add"":"_addCnt_",""skip"":"_skipCnt_",""msg"":"""_..J(msg)_"""}"
}

/// 修改对照关系(描述/状态/备注)
/// w ##class(web.YZSY.DHCSYDictMap).UpdateRel("SY","LY.00.1","01","MSG01","消息类型A","Y","备注")
ClassMethod UpdateRel(PlatCode As %String, DomainCode As %String, ItemCode As %String, HisCode As %String, HisDesc As %String, ActiveFlag As %String, Memo As %String) As %String
{
	s g=..G()
	s itemCode=$zstrip(ItemCode,"<>w")
	s hisCode=$zstrip(HisCode,"<>w")
	q:hisCode="" "{""success"":false,""msg"":""对照代码不能为空""}"
	s old=$g(^YZSY("SYDictMap","Rel",PlatCode,DomainCode,itemCode,hisCode))
	q:old="" "{""success"":false,""msg"":""对照记录不存在""}"
	s flag=$zconvert(ActiveFlag,"U")
	s:flag'="N" flag="Y"
	s user=..GetUser()
	s now=..Now()
	l +^YZSY("SYDictMapLock","Rel",PlatCode,DomainCode,itemCode):10
	else  q "{""success"":false,""msg"":""系统繁忙,请稍后重试""}"
	s ^YZSY("SYDictMap","Rel",PlatCode,DomainCode,itemCode,hisCode)=HisDesc_"^"_flag_"^"_$p(old,"^",3)_"^"_$p(old,"^",4)_"^"_user_"^"_now_"^"_Memo
	d ..UpdateRelByHisIndex(PlatCode, DomainCode, itemCode, hisCode)
	l -^YZSY("SYDictMapLock","Rel",PlatCode,DomainCode,itemCode)
	q "{""success"":true,""msg"":""保存成功""}"
}

/// 删除对照关系
/// w ##class(web.YZSY.DHCSYDictMap).DeleteRel("SY","LY.00.1","01","MSG01")
ClassMethod DeleteRel(PlatCode As %String, DomainCode As %String, ItemCode As %String, HisCode As %String) As %String
{
	s g=..G()
	s itemCode=$zstrip(ItemCode,"<>w")
	s hisCode=$zstrip(HisCode,"<>w")
	q:hisCode="" "{""success"":false,""msg"":""对照代码不能为空""}"
	q:'$d(^YZSY("SYDictMap","Rel",PlatCode,DomainCode,itemCode,hisCode)) "{""success"":false,""msg"":""对照记录不存在""}"
	l +^YZSY("SYDictMapLock","Rel",PlatCode,DomainCode,itemCode):10
	else  q "{""success"":false,""msg"":""系统繁忙,请稍后重试""}"
	k ^YZSY("SYDictMap","Rel",PlatCode,DomainCode,itemCode,hisCode)
	k ^YZSY("SYDictMap","IdxRel",PlatCode,DomainCode,hisCode,itemCode)
	k ^YZSY("SYDictMap","RelByHis",PlatCode,DomainCode,hisCode,itemCode)
	l -^YZSY("SYDictMapLock","Rel",PlatCode,DomainCode,itemCode)
	q "{""success"":true,""msg"":""删除成功""}"
}

/// 清空某个采集条目下的全部对照
/// w ##class(web.YZSY.DHCSYDictMap).ClearRel("SY","CV02.00.101","01")
ClassMethod ClearRel(PlatCode As %String, DomainCode As %String, ItemCode As %String) As %String
{
	s g=..G()
	s itemCode=$zstrip(ItemCode,"<>w")
	q:itemCode="" "{""success"":false,""msg"":""请先选择采集字典条目""}"
	l +^YZSY("SYDictMapLock","Rel",PlatCode,DomainCode,itemCode):10
	else  q "{""success"":false,""msg"":""系统繁忙,请稍后重试""}"
	s cnt=0
	s hc=""
	for {
		s hc=$o(^YZSY("SYDictMap","Rel",PlatCode,DomainCode,itemCode,hc))
		q:hc=""
		k ^YZSY("SYDictMap","Rel",PlatCode,DomainCode,itemCode,hc)
		k ^YZSY("SYDictMap","IdxRel",PlatCode,DomainCode,hc,itemCode)
		k ^YZSY("SYDictMap","RelByHis",PlatCode,DomainCode,hc,itemCode)
		s cnt=cnt+1
	}
	l -^YZSY("SYDictMapLock","Rel",PlatCode,DomainCode,itemCode)
	q "{""success"":true,""msg"":""已清空"_cnt_"条对照""}"
}

/// 批量清空多个采集条目下的全部对照(同一平台+同一值域)
/// ItemList: 条目代码用 ^ 分隔
/// w ##class(web.YZSY.DHCSYDictMap).ClearRelBatch("SY","CV02.00.101","01^02^03")
ClassMethod ClearRelBatch(PlatCode As %String, DomainCode As %String, ItemList As %String) As %String
{
	s g=..G()
	q:PlatCode="" "{""success"":false,""msg"":""平台不能为空""}"
	q:$zstrip(DomainCode,"<>w")="" "{""success"":false,""msg"":""值域不能为空""}"
	q:ItemList="" "{""success"":false,""msg"":""请先勾选要清除的条目""}"
	s okCnt=0,total=0
	s n=$l(ItemList,"^")
	for i=1:1:n {
		s itemCode=$zstrip($p(ItemList,"^",i),"<>w")
		continue:itemCode=""
		/* 锁本条目, 防止与单条 ClearRel 并发 */
		l +^YZSY("SYDictMapLock","Rel",PlatCode,DomainCode,itemCode):10
		continue:'$t
		s hc=""
		for {
			s hc=$o(^YZSY("SYDictMap","Rel",PlatCode,DomainCode,itemCode,hc))
			q:hc=""
			k ^YZSY("SYDictMap","Rel",PlatCode,DomainCode,itemCode,hc)
			k ^YZSY("SYDictMap","IdxRel",PlatCode,DomainCode,hc,itemCode)
			k ^YZSY("SYDictMap","RelByHis",PlatCode,DomainCode,hc,itemCode)
			s okCnt=okCnt+1
		}
		l -^YZSY("SYDictMapLock","Rel",PlatCode,DomainCode,itemCode)
		s total=total+1
	}
	q "{""success"":true,""msg"":""已处理"_total_"个条目,共清空"_okCnt_"条对照"",""items"":"_total_",""rels"":"_okCnt_"}"
}

/// 批量启停对照关系, IdList 元素格式 值域代码|条目代码|HIS代码, 元素间用 ^ 分隔
/// w ##class(web.YZSY.DHCSYDictMap).SetRelFlagBatch("SY","CV02.00.101|01|1","N")
ClassMethod SetRelFlagBatch(PlatCode As %String, IdList As %String, ActiveFlag As %String) As %String
{
	s g=..G()
	q:IdList="" "{""success"":false,""msg"":""请先勾选要操作的记录""}"
	s flag=$zconvert(ActiveFlag,"U")
	q:(flag'="Y")&&(flag'="N") "{""success"":false,""msg"":""标志只能为Y或N""}"
	s user=..GetUser()
	s now=..Now()
	s okCnt=0
	s errCnt=0
	for i=1:1:$l(IdList,"^") {
		s one=$p(IdList,"^",i)
		continue:one=""
		s domCode=$p(one,"|",1)
		s itemCode=$p(one,"|",2)
		s hisCode=$p(one,"|",3)
		continue:hisCode=""
		s old=$g(^YZSY("SYDictMap","Rel",PlatCode,domCode,itemCode,hisCode))
		if (old="") {
			s errCnt=errCnt+1
		} else {
			s $p(old,"^",2)=flag
			s $p(old,"^",5)=user
			s $p(old,"^",6)=now
			s ^YZSY("SYDictMap","Rel",PlatCode,domCode,itemCode,hisCode)=old
			/* 同步反向快照(仅 flag / 时间变更, 字段 2/5/6) */
			d ..UpdateRelByHisIndex(PlatCode, domCode, itemCode, hisCode)
			s okCnt=okCnt+1
		}
	}
	q "{""success"":true,""ok"":"_okCnt_",""err"":"_errCnt_",""msg"":""共处理"_okCnt_"条,失败"_errCnt_"条""}"
}

/// 刷新对照关系的 HIS 描述快照(按当前 HIS 字典重新取)
/// w ##class(web.YZSY.DHCSYDictMap).RefreshRelDesc("SY","CV02.00.101")
ClassMethod RefreshRelDesc(PlatCode As %String, DomainCode As %String) As %String
{
	s g=..G()
	q:PlatCode="" "{""success"":false,""msg"":""平台不能为空""}"
	s hisDict=$p($g(^YZSY("SYDictMap","Domain",PlatCode,DomainCode)),"^",2)
	q:hisDict="" "{""success"":false,""msg"":""该值域未维护HIS字典表,无需刷新""}"
	s updCnt=0
	s missCnt=0
	s ic=""
	for {
		s ic=$o(^YZSY("SYDictMap","Rel",PlatCode,DomainCode,ic))
		q:ic=""
		s hc=""
		for {
			s hc=$o(^YZSY("SYDictMap","Rel",PlatCode,DomainCode,ic,hc))
			q:hc=""
			s old=$g(^YZSY("SYDictMap","Rel",PlatCode,DomainCode,ic,hc))
			s desc=..GetHisDesc(hisDict,hc)
			if (desc="") {
				s missCnt=missCnt+1
			} else {
				s $p(old,"^",1)=desc
				s ^YZSY("SYDictMap","Rel",PlatCode,DomainCode,ic,hc)=old
				d ..UpdateRelByHisIndex(PlatCode, DomainCode, ic, hc)
				s updCnt=updCnt+1
			}
		}
	}
	q "{""success"":true,""upd"":"_updCnt_",""miss"":"_missCnt_",""msg"":""刷新"_updCnt_"条,字典中已不存在"_missCnt_"条""}"
}

/// 查询对照关系(增删改查中的"查")
/// MapMode: ""=全部 D=字典对照 M=手工录入
/// w ##class(web.YZSY.DHCSYDictMap).QueryRel("SY","","","","","",1,50)
ClassMethod QueryRel(PlatCode As %String, DomainCode As %String, ItemKeyword As %String, HisKeyword As %String, ActiveFlag As %String, MapMode As %String, Page As %Integer = 1, Rows As %Integer = 50) As %String
{
	s g=..G()
	q:PlatCode="" "{""total"":0,""rows"":[]}"
	s pid=$i(^||CacheTemp("SYDictMap","PID"))
	k ^||CacheTemp("SYDictMap","Q",pid)
	s idx=0
	s dc=""
	for {
		s dc=$o(^YZSY("SYDictMap","Rel",PlatCode,dc))
		q:dc=""
		continue:(DomainCode'="")&&(dc'=DomainCode)
		s hisDict=$p($g(^YZSY("SYDictMap","Domain",PlatCode,dc)),"^",2)
		if (MapMode="D") {
			continue:hisDict=""
		} elseif (MapMode="M") {
			continue:hisDict'=""
		}
		s ic=""
		for {
			s ic=$o(^YZSY("SYDictMap","Rel",PlatCode,dc,ic))
			q:ic=""
			s itemName=$p($g(^YZSY("SYDictMap","Item",PlatCode,dc,ic)),"^",1)
			continue:(ItemKeyword'="")&&(ic'[ItemKeyword)&&(itemName'[ItemKeyword)
			s hc=""
			for {
				s hc=$o(^YZSY("SYDictMap","Rel",PlatCode,dc,ic,hc))
				q:hc=""
				s rel=$g(^YZSY("SYDictMap","Rel",PlatCode,dc,ic,hc))
				s desc=$p(rel,"^",1)
				continue:(HisKeyword'="")&&(hc'[HisKeyword)&&(desc'[HisKeyword)
				s flag=$p(rel,"^",2)
				continue:(ActiveFlag'="")&&(flag'=ActiveFlag)
				s idx=idx+1
				s ^||CacheTemp("SYDictMap","Q",pid,idx)=hc_"^"_rel_"^"_dc_"^"_ic_"^"_PlatCode
			}
		}
	}
	s json=..PageJson(pid,idx,Page,Rows,"Rel")
	k ^||CacheTemp("SYDictMap","Q",pid)
	q json
}

/// 查询某个采集条目下的对照关系(分页, 供对照维护界面展示"当前对照")
/// w ##class(web.YZSY.DHCSYDictMap).QueryItemRel("SY","CV02.00.101","01",1,20)
ClassMethod QueryItemRel(PlatCode As %String, DomainCode As %String, ItemCode As %String, Page As %Integer = 1, Rows As %Integer = 50) As %String
{
	s g=..G()
	s itemCode=$zstrip(ItemCode,"<>w")
	q:itemCode="" "{""total"":0,""rows"":[]}"
	/* 走 Q行 + PageJson 通用分页, 复用 BuildRelRow 行组装 */
	s pid=$i(^||CacheTemp("SYDictMap","PID"))
	k ^||CacheTemp("SYDictMap","Q",pid)
	s idx=0
	s hc=""
	for {
		s hc=$o(^YZSY("SYDictMap","Rel",PlatCode,DomainCode,itemCode,hc))
		q:hc=""
		s rel=$g(^YZSY("SYDictMap","Rel",PlatCode,DomainCode,itemCode,hc))
		s idx=idx+1
		s ^||CacheTemp("SYDictMap","Q",pid,idx)=hc_"^"_rel_"^"_DomainCode_"^"_itemCode_"^"_PlatCode
	}
	s json=..PageJson(pid,idx,Page,Rows,"Rel")
	k ^||CacheTemp("SYDictMap","Q",pid)
	q json
}

/// 查询某个值域下已被任意条目对照过的 HIS 代码集合(^ 分隔)
/// 用于在 HIS 字典加载后, 给当前值域下"已对照"的 HIS 行加浅绿底色
/// w ##class(web.YZSY.DHCSYDictMap).QueryDomainHisCodes("SY","GB/T 3304-1991")
ClassMethod QueryDomainHisCodes(PlatCode As %String, DomainCode As %String) As %String
{
	s g=..G()
	q:PlatCode="" "{""success"":false,""HisCodes"":""}"
	q:DomainCode="" "{""success"":false,""HisCodes"":""}"
	s list="", hc=""
	for {
		s hc=$o(^YZSY("SYDictMap","IdxRel",PlatCode,DomainCode,hc))
		q:hc=""
		s:list'="" list=list_"^"
		s list=list_hc
	}
	q "{""success"":true,""PlatCode"":"""_..J(PlatCode)_""",""DomainCode"":"""_..J(DomainCode)_""",""HisCodes"":"""_..J(list)_""",""count"":"_$l(list,"^")_"}"
}

/// 对照覆盖查询: 按 HIS 字典反查 (平台[, 值域]) 下, 该字典的所有 HIS 条目
/// 每行说明: 这个 HIS 代码 已被该 (平台/值域) 下的 哪些采集条目 对照
/// 用于 Tab2 的「对照覆盖查询」面板:
///   - 一行 = HIS 字典中的一个条目
///   - 已对照/未对照状态 + 对应平台条目(代码 + 名称)
///   - 顶部统计: total/mapped/unmapped/coverage%
/// Filter: ''=全部  'M'=只看已对照  'U'=只看未对照
/// DomainCode 可空: 为空时, 全平台内只要有这个 HIS 代码被某条采集条目对照就算已对照
/// w ##class(web.YZSY.DHCSYDictMap).QueryRelCoverage("SY","GB/T 3304-1991","CT_SEX","",1,50,"")
/// w ##class(web.YZSY.DHCSYDictMap).QueryRelCoverage("SY","","CT_SEX","",1,50,"U")
ClassMethod QueryRelCoverage(PlatCode As %String, DomainCode As %String, DictCode As %String, Filter As %String = "", Page As %Integer = 1, Rows As %Integer = 50) As %String
{
	s g=..G()
	s platCode=$zstrip(PlatCode,"<>w"), domCode=$zstrip(DomainCode,"<>w"), dictCode=$zstrip(DictCode,"<>w")
	s fl=$s(Filter="U":"U",Filter="M":"M",1:"")
	q:(platCode="")||(dictCode="") "{""success"":false,""total"":0,""mapped"":0,""unmapped"":0,""rows"":[],""msg"":""平台和 HIS 字典不能为空""}"
	s def=$g(^YZSY("SYDictMap","HisDict",dictCode))
	q:def="" "{""success"":false,""total"":0,""mapped"":0,""unmapped"":0,""rows"":[],""msg"":""字典表未注册""}"
	s dictName=$p(def,"^",1)
	s type=$p(def,"^",2)

	/* 阶段1: 装 「HIS 代码 -> Item 列表」 索引到进程暂存
	   注意: IdxRel 索引下 DomCode 可空过滤, 无 DomCode 时取该平台下所有值域下对照过此 HIS 的条目 */
	s pid=$i(^||CacheTemp("SYDictMap","PID"))
	k ^||CacheTemp("SYDictMap","CovMap",pid)
	s ^||CacheTemp("SYDictMap","CovMeta",pid)=$lb(platCode,domCode)

	if (platCode'="") {
		if (domCode'="") {
			/* 限定平台 + 值域: 查 IdxRel(platCode, domCode, hc) */
			s hc=""
			for {
				s hc=$o(^YZSY("SYDictMap","IdxRel",platCode,domCode,hc))
				q:hc=""
				s ic=""
				for {
					s ic=$o(^YZSY("SYDictMap","IdxRel",platCode,domCode,hc,ic))
					q:ic=""
					/* CovMap(hc,ic)=所属值域代码, 供取条目名称用 */
					s ^||CacheTemp("SYDictMap","CovMap",pid,hc,ic)=domCode
				}
			}
		} else {
			/* 限定平台, 跨所有值域 */
			s dom2=""
			for {
				s dom2=$o(^YZSY("SYDictMap","Domain",platCode,dom2))
				q:dom2=""
				s hc=""
				for {
					s hc=$o(^YZSY("SYDictMap","IdxRel",platCode,dom2,hc))
					q:hc=""
					s ic=""
					for {
						s ic=$o(^YZSY("SYDictMap","IdxRel",platCode,dom2,hc,ic))
						q:ic=""
						/* CovMap(hc,ic)=所属值域代码(跨值域时也能取到条目名称) */
						s ^||CacheTemp("SYDictMap","CovMap",pid,hc,ic)=dom2
					}
				}
			}
		}
	}

	/* 阶段2: 列出 HIS 字典所有条目, 对照是否被映射 */
	s rows="", mapped=0, unmapped=0, idx=0
	if (type="S") {
		s sql=$g(^YZSY("SYDictMap","HisDictSQL",dictCode))
		try {
			s st=##class(%SQL.Statement).%New()
			if (st.%Prepare(sql)=1) {
				s rs=st.%Execute()
				s colCnt=..SqlColCount(rs)
				s:colCnt<1 colCnt=3
				s codeI=1
				s descI=1
				if (colCnt>=2) { s descI=2 }
				if (colCnt>=3) { s codeI=2 s descI=3 }
				while (rs.%Next()) {
					s code=$zstrip(rs.%GetData(codeI),"<>W")
					continue:code=""
					s desc=$zstrip(rs.%GetData(descI),"<>W")
					s isMapped=($d(^||CacheTemp("SYDictMap","CovMap",pid,code))>0)
					if (fl="U") && isMapped continue
					if (fl="M") && 'isMapped continue
					s icList="", inList="", cnt=0
					if isMapped {
						s ic=""
						for {
							s ic=$o(^||CacheTemp("SYDictMap","CovMap",pid,code,ic))
							q:ic=""
							/* CovMap 值=条目所属值域; 条目名存在 Item 节点(勿用 DomainItem, 该节点不存在) */
							s domOf=$g(^||CacheTemp("SYDictMap","CovMap",pid,code,ic))
							s iName=""
							if (domOf'="") { s iName=$p($g(^YZSY("SYDictMap","Item",platCode,domOf,ic)),"^",1) }
							s:cnt>0 icList=icList_" / "
							s:cnt>0 inList=inList_" / "
							s icList=icList_ic
							s inList=inList_..J(iName)
							s cnt=cnt+1
							continue:cnt>=5
						}
					}
					s:isMapped mapped=mapped+1
					s:'isMapped unmapped=unmapped+1
					s idx=idx+1
					s row="{""HisCode"":"""_..J(code)_""",""HisDesc"":"""_..J(desc)_""",""MappedFlag"":"""_$s(isMapped:"Y",1:"N")_""",""ItemCode"":"""_..J(icList)_""",""ItemName"":"""_..J(inList)_""",""ItemCount"":"_cnt_"}"
					s:rows'="" rows=rows_","
					s rows=rows_row
				}
			}
		} catch ex {}
	} else {
		/* Enum: HisDictEnum(dictCode, i) = code^desc */
		s i=""
		for {
			s i=$o(^YZSY("SYDictMap","HisDictEnum",dictCode,i))
			q:i=""
			s rec=$g(^YZSY("SYDictMap","HisDictEnum",dictCode,i))
			continue:rec=""
			s code=$p(rec,"^",1)
			continue:code=""
			s desc=$p(rec,"^",2)
			s isMapped=($d(^||CacheTemp("SYDictMap","CovMap",pid,code))>0)
			if (fl="U") && isMapped continue
			if (fl="M") && 'isMapped continue
			s icList="", inList="", cnt=0
			if isMapped {
				s ic=""
				for {
					s ic=$o(^||CacheTemp("SYDictMap","CovMap",pid,code,ic))
					q:ic=""
					/* CovMap 值=条目所属值域; 条目名存在 Item 节点(勿用 DomainItem, 该节点不存在) */
					s domOf=$g(^||CacheTemp("SYDictMap","CovMap",pid,code,ic))
					s iName=""
					if (domOf'="") { s iName=$p($g(^YZSY("SYDictMap","Item",platCode,domOf,ic)),"^",1) }
					s:cnt>0 icList=icList_" / "
					s:cnt>0 inList=inList_" / "
					s icList=icList_ic
					s inList=inList_..J(iName)
					s cnt=cnt+1
					continue:cnt>=5
				}
			}
			s:isMapped mapped=mapped+1
			s:'isMapped unmapped=unmapped+1
			s idx=idx+1
			s row="{""HisCode"":"""_..J(code)_""",""HisDesc"":"""_..J(desc)_""",""MappedFlag"":"""_$s(isMapped:"Y",1:"N")_""",""ItemCode"":"""_..J(icList)_""",""ItemName"":"""_..J(inList)_""",""ItemCount"":"_cnt_"}"
			s:rows'="" rows=rows_","
			s rows=rows_row
		}
	}

	k ^||CacheTemp("SYDictMap","CovMap",pid)
	q "{""success"":true,""PlatCode"":"""_..J(platCode)_""",""DomainCode"":"""_..J(domCode)_""",""DictCode"":"""_..J(dictCode)_""",""DictName"":"""_..J(dictName)_""",""total"":"_idx_",""mapped"":"_mapped_",""unmapped"":"_unmapped_",""rows"":["_rows_"]}"
}

/// 反查接口: 通过 (平台代码, 值域代码, HIS代码) 获取该 HIS 码对应的所有 采集条目代码 + 条目名
/// 主要用途: 第三方平台(医保/CDC/医联体 等)推送 HIS 业务数据时, 根据 HIS 端码值回查 采集标准码
/// 返回:
///   success=true, found=true(命中)/false(未命中),
///   count, rows:[{ItemCode, ItemName, HisCode, ActiveFlag, HisDesc, Memo, UpdateTime}]
/// 返回空 rows 时也会附 found=false 与 msg 提示
/// w ##class(web.YZSY.DHCSYDictMap).QueryRelByHis("SY","GB/T 3304-1991","01")
ClassMethod QueryRelByHis(PlatCode As %String, DomainCode As %String, HisCode As %String) As %String
{
	s g=..G()
	q:PlatCode="" "{""success"":false,""found"":false,""count"":0,""rows"":[],""msg"":""平台代码不能为空""}"
	q:DomainCode="" "{""success"":false,""found"":false,""count"":0,""rows"":[],""msg"":""值域代码不能为空""}"
	q:HisCode="" "{""success"":false,""found"":false,""count"":0,""rows"":[],""msg"":""HIS代码不能为空""}"
	q:'$d(^YZSY("SYDictMap","Domain",PlatCode,DomainCode)) "{""success"":false,""found"":false,""count"":0,""rows"":[],""msg"":""值域["_..J(PlatCode)_"/"_..J(DomainCode)_"]不存在""}"
	s domName=$p($g(^YZSY("SYDictMap","Domain",PlatCode,DomainCode)),"^",1)
	s hisDict=$p($g(^YZSY("SYDictMap","Domain",PlatCode,DomainCode)),"^",2)
	/* 反向快照索引 RelByHis(plat,dom,hc,ic) 一次 $g 取出所有字段, 无需再联动 Rel/Item.
	   快照 9 字段已全部 ..J() 转义, 可直接拼 JSON */
	s ic="", rows="", cnt=0
	for {
		s ic=$o(^YZSY("SYDictMap","RelByHis",PlatCode,DomainCode,HisCode,ic))
		q:ic=""
		s snap=$g(^YZSY("SYDictMap","RelByHis",PlatCode,DomainCode,HisCode,ic))
		continue:snap=""
		s row="{""ItemCode"":"""_ic_""""
		s row=row_",""ItemName"":"""_$p(snap,"^",8)_""""
		s row=row_",""HisCode"":"""_..J(HisCode)_""""
		s row=row_",""HisDesc"":"""_$p(snap,"^",1)_""""
		s row=row_",""ActiveFlag"":"""_$p(snap,"^",2)_""""
		s row=row_",""Memo"":"""_$p(snap,"^",7)_""""
		s row=row_",""CreateUser"":"""_$p(snap,"^",3)_""""
		s row=row_",""CreateTime"":"""_$p(snap,"^",4)_""""
		s row=row_",""UpdateUser"":"""_$p(snap,"^",5)_""""
		s row=row_",""UpdateTime"":"""_$p(snap,"^",6)_"""}"
		s:rows'="" rows=rows_","
		s rows=rows_row
		s cnt=cnt+1
		continue:cnt>=500
	}
	s found=(cnt>0)
	s msg=$s(found:cnt_"个采集条目匹配",1:"HIS码["_..J(HisCode)_"]在值域["_..J(DomainCode)_"]下尚未建立对照")
	q "{""success"":true,""found"":"_$s(found:"true",1:"false")_",""PlatCode"":"""_..J(PlatCode)_""",""DomainCode"":"""_..J(DomainCode)_""",""DomainName"":"""_..J(domName)_""",""HisDictCode"":"""_..J(hisDict)_""",""HisCode"":"""_..J(HisCode)_""",""count"":"_cnt_",""rows"":["_rows_"],""msg"":"""_..J(msg)_""",""source"":""RelByHis""}"
}

/// 反查简化版: 按 (平台, 值域, HIS码) 返回匹配的采集条目, 每行 "条目代码^条目名称"($c(10) 分隔)
/// 用途: 第三方平台(医保/CDC/医联体等)按 HIS 码回查采集标准码/名, 免去 JSON 解析
/// 说明: 名称取反向快照第8段(条目名称); 如需条目"说明"列请改用 $p(snap,"^",9)
/// 无匹配或参数缺失返回空串
/// w ##class(web.YZSY.DHCSYDictMap).QueryItemLineByHis("SYPT","CS03.01.026","1")
ClassMethod QueryItemLineByHis(PlatCode As %String, DomainCode As %String, HisCode As %String) As %String
{
	q:PlatCode="" ""
	q:DomainCode="" ""
	q:HisCode="" ""
	s ic=""
	s out=""
	s cnt=0
	for {
		s ic=$o(^YZSY("SYDictMap","RelByHis",PlatCode,DomainCode,HisCode,ic))
		q:ic=""
		s snap=$g(^YZSY("SYDictMap","RelByHis",PlatCode,DomainCode,HisCode,ic))
		continue:snap=""
		s:cnt>0 out=out_$c(10)
		s out=out_ic_"^"_$p(snap,"^",8)
		s cnt=cnt+1
		q:cnt>=500
	}
	q out
}

/// 批量删除对照关系, IdList 元素格式 值域代码|条目代码|HIS代码, 元素间用 ^ 分隔
/// w ##class(web.YZSY.DHCSYDictMap).DeleteRelBatch("SY","CV02.00.101|01|1^CV02.00.101|01|2")
ClassMethod DeleteRelBatch(PlatCode As %String, IdList As %String) As %String
{
	s g=..G()
	q:IdList="" "{""success"":false,""msg"":""请先勾选要删除的记录""}"
	s okCnt=0
	s errCnt=0
	for i=1:1:$l(IdList,"^") {
		s one=$p(IdList,"^",i)
		continue:one=""
		s domCode=$p(one,"|",1)
		s itemCode=$p(one,"|",2)
		s hisCode=$p(one,"|",3)
		continue:hisCode=""
		if ($d(^YZSY("SYDictMap","Rel",PlatCode,domCode,itemCode,hisCode))) {
			k ^YZSY("SYDictMap","Rel",PlatCode,domCode,itemCode,hisCode)
			k ^YZSY("SYDictMap","IdxRel",PlatCode,domCode,hisCode,itemCode)
			k ^YZSY("SYDictMap","RelByHis",PlatCode,domCode,hisCode,itemCode)
			s okCnt=okCnt+1
		} else {
			s errCnt=errCnt+1
		}
	}
	q "{""success"":true,""ok"":"_okCnt_",""err"":"_errCnt_",""msg"":""删除"_okCnt_"条,失败"_errCnt_"条""}"
}

/* ============================ 五、导入导出 ============================ */
/// 按 CSV 规则把一行拆成字段数组(支持双引号包裹含逗号/制表符的字段)
/// 结果写入 ByRef arr(1..n), 返回字段数; 双引号内 "" 视为一个 "
/// w ##class(web.YZSY.DHCSYDictMap).CsvFields("a,""b,c"",d",",",.arr)
ClassMethod CsvFields(line As %String, delim As %String, ByRef arr) As %Integer
{
	s n=0
	s fld=""
	s i=1
	s len=$l(line)
	s inQ=0
	s q=$c(34)
	while (i<=len) {
		s c=$e(line,i)
		if (inQ) {
			if (c=q) {
				if ($e(line,i+1)=q) {
					s fld=fld _ q
					s i=i+2
				} else {
					s inQ=0
					s i=i+1
				}
			} else {
				s fld=fld _ c
				s i=i+1
			}
		} elseif (c=q) {
			s inQ=1
			s i=i+1
		} elseif (c=delim) {
			s n=n+1
			s arr(n)=fld
			s fld=""
			s i=i+1
		} else {
			s fld=fld _ c
			s i=i+1
		}
	}
	s n=n+1
	s arr(n)=fld
	q n
}

/// 导入值域+条目 CSV(列: 值域代码,值域名称,代码,名称,说明; 支持逗号或Tab分隔, 首行为表头)
/// ClearFlag=Y 时先清空该平台下值域/条目/对照
/// w ##class(web.YZSY.DHCSYDictMap).ImportDomainCSV("SY","头,民族,01,汉族,","N")
ClassMethod ImportDomainCSV(PlatCode As %String, CsvText As %String, ClearFlag As %String) As %String
{
	s g=..G()
	q:PlatCode="" "{""success"":false,""msg"":""平台不能为空""}"
	q:'$d(^YZSY("SYDictMap","Platform",PlatCode)) "{""success"":false,""msg"":""平台不存在,请先维护平台""}"
	q:CsvText="" "{""success"":false,""msg"":""导入内容为空""}"
	if (ClearFlag="Y") {
		k ^YZSY("SYDictMap","Domain",PlatCode)
		k ^YZSY("SYDictMap","Item",PlatCode)
		k ^YZSY("SYDictMap","Rel",PlatCode)
		k ^YZSY("SYDictMap","IdxRel",PlatCode)
		/* 反向快照一并清空(ImportDomainCSV ClearFlag=Y 的全量替换) */
		k ^YZSY("SYDictMap","RelByHis",PlatCode)
	}
	s delim=","
	s firstLine=$p(CsvText,$c(10),1)
	s:$l(firstLine,$c(9))>$l(firstLine,",") delim=$c(9)
	s okCnt=0
	s domCnt=0
	s n=$l(CsvText,$c(10))
	for i=1:1:n {
		s line=$p(CsvText,$c(10),i)
		s line=$replace(line,$c(13),"")
		continue:$zstrip(line,"<>w")=""
		continue:i=1
		/* 用 CSV 规则拆分, 兼容 "软化剂,润滑药" 这类含分隔符的引号字段 */
		k f
		s fc=..CsvFields(line,delim,.f)
		s domCode=$zstrip($g(f(1)),"<>w")
		s domName=$zstrip($g(f(2)),"<>w")
		s itemCode=$zstrip($g(f(3)),"<>w")
		s itemName=$zstrip($g(f(4)),"<>w")
		s memo=$zstrip($g(f(5)),"<>w")
		/* 第5列之后的残段(非常规)并入说明 */
		for j=6:1:fc {
			s:memo'="" memo=memo _ delim
			s memo=memo _ $zstrip($g(f(j)),"<>w")
		}
		continue:domCode=""
		s def=$g(^YZSY("SYDictMap","Domain",PlatCode,domCode))
		if (def="") {
			s $p(def,"^",1)=domName
			s ^YZSY("SYDictMap","Domain",PlatCode,domCode)=def
			s domCnt=domCnt+1
		} else {
			s:domName'="" $p(def,"^",1)=domName
			s ^YZSY("SYDictMap","Domain",PlatCode,domCode)=def
		}
		continue:itemCode=""
		s ^YZSY("SYDictMap","Item",PlatCode,domCode,itemCode)=itemName_"^"_memo
		s okCnt=okCnt+1
	}
	q "{""success"":true,""item"":"_okCnt_",""domain"":"_domCnt_",""msg"":""导入完成: 值域"_domCnt_"个, 条目"_okCnt_"条""}"
}

/// 前端解析后按行导入(参照 基数药维护 模式: JSON 行数组单参数, 不传多行文本, 规避传输差异)
/// JsonText = [{"domCode":"..","domName":"..","itemCode":"..","itemName":"..","memo":".."}, ...]
/// 返回 {"success":true,"item":N,"domain":N,"err":N,"msg":"..."}
/// w ##class(web.YZSY.DHCSYDictMap).ImportDomainRows("SYPT","[{""domCode"":""ZZT1"",""domName"":""测试域A"",""itemCode"":""01"",""itemName"":""测试项A"",""memo"":""""}]","N")
ClassMethod ImportDomainRows(PlatCode As %String, JsonText As %String, ClearFlag As %String) As %String
{
	s g=..G()
	q:PlatCode="" "{""success"":false,""msg"":""平台不能为空""}"
	q:'$d(^YZSY("SYDictMap","Platform",PlatCode)) "{""success"":false,""msg"":""平台不存在,请先维护平台""}"
	q:JsonText="" "{""success"":false,""msg"":""导入内容为空""}"
	s domCnt=0
	s okCnt=0
	s errCnt=0
	if (ClearFlag="Y") {
		k ^YZSY("SYDictMap","Domain",PlatCode)
		k ^YZSY("SYDictMap","Item",PlatCode)
		k ^YZSY("SYDictMap","Rel",PlatCode)
		k ^YZSY("SYDictMap","IdxRel",PlatCode)
		k ^YZSY("SYDictMap","RelByHis",PlatCode)
	}
	s arr=""
	s parseErr=""
	try {
		s arr=[].%FromJSON(JsonText)
	} catch ex {
		s parseErr="JSON解析失败: "_ex.Name
	}
	q:parseErr'="" "{""success"":false,""msg"":"""_..J(parseErr)_"""}"
	q:'$isobject(arr) "{""success"":false,""msg"":""JSON内容不是数组""}"
	s n=arr.%Size()
	for i=0:1:(n-1) {
		try {
			s o=arr.%Get(i)
			continue:'$isobject(o)
			s domCode=$zstrip(o.%Get("domCode"),"<>w")
			s domName=$zstrip(o.%Get("domName"),"<>w")
			s itemCode=$zstrip(o.%Get("itemCode"),"<>w")
			s itemName=$zstrip(o.%Get("itemName"),"<>w")
			s memo=$zstrip(o.%Get("memo"),"<>w")
			continue:domCode=""
			s def=$g(^YZSY("SYDictMap","Domain",PlatCode,domCode))
			if (def="") {
				s $p(def,"^",1)=domName
				s ^YZSY("SYDictMap","Domain",PlatCode,domCode)=def
				s domCnt=domCnt+1
			} else {
				s:domName'="" $p(def,"^",1)=domName
				s ^YZSY("SYDictMap","Domain",PlatCode,domCode)=def
			}
			continue:itemCode=""
			s ^YZSY("SYDictMap","Item",PlatCode,domCode,itemCode)=itemName_"^"_memo
			s okCnt=okCnt+1
		} catch rowEx {
			s errCnt=errCnt+1
		}
	}
	q "{""success"":true,""item"":"_okCnt_",""domain"":"_domCnt_",""err"":"_errCnt_",""msg"":""导入完成: 值域"_domCnt_"个, 条目"_okCnt_"条, 跳过"_errCnt_"行""}"
}

/// 从服务器文件导入值域 CSV(运维把文件放到服务器后调用, 每 1000 行一批)
/// 说明: ImportDomainCSV 每批都把首行当表头跳过, 因此这里把文件真正的表头
///       读出来并拼到每一个批次的最前面, 避免批次2+丢失首条数据行
/// w ##class(web.YZSY.DHCSYDictMap).ImportDomainFile("SY","/data/sanyi.csv","Y")
ClassMethod ImportDomainFile(PlatCode As %String, FilePath As %String, ClearFlag As %String) As %String
{
	q:FilePath="" "{""success"":false,""msg"":""文件路径不能为空""}"
	s okCnt=0
	s domCnt=0
	s errMsg=""
	try {
		s f=##class(%File).%New(FilePath)
		if ('f.Open("RS")) {
			s errMsg="文件打开失败"
		} else {
			/* 先读出真正表头(第一行) */
			s header=f.ReadLine()
			s header=$replace(header,$c(13),"")
			s batch=""
			s lines=0
			s first=1
			while ('f.AtEnd) {
				s line=$replace(f.ReadLine(),$c(13),"")
				continue:$zstrip(line,"<>w")=""
				/* 每个批次开头都放表头 */
				s:lines=0 batch=header_$c(10)
				s batch=batch_line_$c(10)
				s lines=lines+1
				if (lines>=1000) {
					s rs=..ImportDomainCSV(PlatCode,batch,..PickClear(first,ClearFlag))
					s okCnt=okCnt+..JsonNum(rs,"item")
					s domCnt=domCnt+..JsonNum(rs,"domain")
					s batch=""
					s lines=0
					s first=0
				}
			}
			if (lines>0) {
				s rs=..ImportDomainCSV(PlatCode,batch,..PickClear(first,ClearFlag))
				s okCnt=okCnt+..JsonNum(rs,"item")
				s domCnt=domCnt+..JsonNum(rs,"domain")
			}
			d f.Close()
		}
	} catch ex {
		s errMsg="导入异常: "_ex.Name
	}
	q:errMsg'="" "{""success"":false,""msg"":"""_..J(errMsg)_"""}"
	q "{""success"":true,""item"":"_okCnt_",""domain"":"_domCnt_",""msg"":""导入完成: 值域"_domCnt_"个, 条目"_okCnt_"条""}"
}

/// 导出对照关系 CSV 文本(上限 20000 行)
/// w w ##class(web.YZSY.DHCSYDictMap).ExportRel("SY","")
ClassMethod ExportRel(PlatCode As %String, DomainCode As %String) As %String
{
	s g=..G()
	q:PlatCode="" ""
	s csv="平台代码,值域代码,值域名称,采集代码,采集名称,HIS代码,HIS描述,状态,录入方式,修改人,修改时间,备注"_$c(10)
	s cnt=0
	s dc=""
	for {
		s dc=$o(^YZSY("SYDictMap","Rel",PlatCode,dc))
		q:dc=""
		continue:(DomainCode'="")&&(dc'=DomainCode)
		q:cnt>=20000
		s domName=$p($g(^YZSY("SYDictMap","Domain",PlatCode,dc)),"^",1)
		s hisDict=$p($g(^YZSY("SYDictMap","Domain",PlatCode,dc)),"^",2)
		s mapMode=$s(hisDict'="":"字典对照",1:"手工录入")
		s ic=""
		for {
			s ic=$o(^YZSY("SYDictMap","Rel",PlatCode,dc,ic))
			q:ic=""
			q:cnt>=20000
			s itemName=$p($g(^YZSY("SYDictMap","Item",PlatCode,dc,ic)),"^",1)
			s hc=""
			for {
				s hc=$o(^YZSY("SYDictMap","Rel",PlatCode,dc,ic,hc))
				q:hc=""
				q:cnt>=20000
				s rel=$g(^YZSY("SYDictMap","Rel",PlatCode,dc,ic,hc))
				s line=PlatCode_","_dc_","_domName_","_ic_","_itemName_","_hc_","_$p(rel,"^",1)_","_$p(rel,"^",2)_","_mapMode_","_$p(rel,"^",5)_","_$p(rel,"^",6)_","_$p(rel,"^",7)
				s line=$replace(line,$c(10),"")
				s line=$replace(line,$c(13),"")
				s csv=csv_line_$c(10)
				s cnt=cnt+1
			}
		}
	}
	q csv
}

/* ============================ 六、初始化与自测 ============================ */
/// 初始化: 平台 + HIS字典表注册 + 值域定义(可重复执行, upsert)
/// d ##class(web.YZSY.DHCSYDictMap).InitData()
ClassMethod InitData() As %String
{
	s g=..G()
	; ---- 平台(预留其他采集字典接入入口) ----
	s ^YZSY("SYDictMap","Platform","SY")="通用数据采集标准^v1.6^Y^通用平台字典(支持任意第三方采集标准接入)"
	s ^YZSY("SYDictMap","Platform","HQMS")="HQMS医院质量监测系统^^N^预留接入"
	s ^YZSY("SYDictMap","Platform","YL6")="六医联动平台^^N^预留接入"
	; ---- HIS 字典表注册(示例, 默认未启用, 请按本机环境【探测】确认后启用) ----
	; 类型 S=SQL语句(须返回 id,code,desc 三列)   E=枚举维护(直接逐行维护 code,desc)
	s cu="system", ct=..Now()
	s name="科室字典" s ^YZSY("SYDictMap","HisDict","CTLOC")=name_"^S^N^示例SQL,请按本机CT_Loc表结构核对^"_cu_"^"_ct_"^"_cu_"^"_ct
	s ^YZSY("SYDictMap","HisDictSQL","CTLOC")="SELECT CTLOC_RowID,CTLOC_Code,CTLOC_Desc FROM CT_Loc"
	s name="民族字典" s ^YZSY("SYDictMap","HisDict","CTNAT")=name_"^S^N^示例SQL^"_cu_"^"_ct_"^"_cu_"^"_ct
	s ^YZSY("SYDictMap","HisDictSQL","CTNAT")="SELECT CTNAT_RowID,CTNAT_Code,CTNAT_Desc FROM CT_Nat"
	s name="性别字典" s ^YZSY("SYDictMap","HisDict","CTSEX")=name_"^S^N^示例SQL^"_cu_"^"_ct_"^"_cu_"^"_ct
	s ^YZSY("SYDictMap","HisDictSQL","CTSEX")="SELECT CTSEX_RowID,CTSEX_Code,CTSEX_Desc FROM CT_Sex"
	s name="婚姻状况字典" s ^YZSY("SYDictMap","HisDict","MARRY")=name_"^E^N^枚举示例^"_cu_"^"_ct_"^"_cu_"^"_ct
	k ^YZSY("SYDictMap","HisDictEnum","MARRY") s n=0
	s n=n+1 s ^YZSY("SYDictMap","HisDictEnum","MARRY",n)="10^未婚"
	s n=n+1 s ^YZSY("SYDictMap","HisDictEnum","MARRY",n)="20^已婚"
	s n=n+1 s ^YZSY("SYDictMap","HisDictEnum","MARRY",n)="30^丧偶"
	s n=n+1 s ^YZSY("SYDictMap","HisDictEnum","MARRY",n)="40^离婚"
	s n=n+1 s ^YZSY("SYDictMap","HisDictEnum","MARRY",n)="90^不详"
	s ^YZSY("SYDictMap","HisDictEnum","MARRY")=n
	; ---- 值域定义(由 4.2通用数据采集标准(值域代码分册)_v1.6.docx 解析生成) ----
	d ..InitDomain()
	q "初始化完成"
}

/// 值域定义初始化(由 4.2通用数据采集标准(值域代码分册)_v1.6.docx 解析生成)
/// 赋值保留已有的 HIS 字典表绑定(piece2), 可重复执行
/// d ##class(web.YZSY.DHCSYDictMap).InitDomain()
ClassMethod InitDomain() As %String
{
	s g=..G()
	s def=$g(^YZSY("SYDictMap","Domain","SY","GB/T 3304-1991"))
	s $p(def,"^",1)="中国各民族名称罗马字母拼音写法和代码" s $p(def,"^",3)="国家标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","GB/T 3304-1991")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","GB/T 16835-1997"))
	s $p(def,"^",1)="高等学校本科、专科专业名称代码" s $p(def,"^",3)="国家标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","GB/T 16835-1997")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","GB/T 2261.1-2003"))
	s $p(def,"^",1)="性别代码" s $p(def,"^",3)="国家标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","GB/T 2261.1-2003")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","GB/T 2261.2-2003"))
	s $p(def,"^",1)="婚姻状况类别代码" s $p(def,"^",3)="国家标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","GB/T 2261.2-2003")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","GB/T 2659-2000"))
	s $p(def,"^",1)="国籍代码" s $p(def,"^",3)="国家标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","GB/T 2659-2000")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","GB/T 4658-2006"))
	s $p(def,"^",1)="学历代码" s $p(def,"^",3)="国家标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","GB/T 4658-2006")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","GB/T 8561-2001"))
	s $p(def,"^",1)="专业技术职务代码" s $p(def,"^",3)="国家标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","GB/T 8561-2001")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","GB/T 12407-2008"))
	s $p(def,"^",1)="职务级别代码" s $p(def,"^",3)="国家标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","GB/T 12407-2008")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","GB/T 2260-2007"))
	s $p(def,"^",1)="行政区划代码" s $p(def,"^",3)="国家标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","GB/T 2260-2007")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","GB/T 4761-2008"))
	s $p(def,"^",1)="联系人关系" s $p(def,"^",3)="国家标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","GB/T 4761-2008")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","GB/T 12404-1997"))
	s $p(def,"^",1)="单位隶属关系代码" s $p(def,"^",3)="国家标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","GB/T 12404-1997")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","GBT6864_2003"))
	s $p(def,"^",1)="学位代码" s $p(def,"^",3)="国家标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","GBT6864_2003")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","GB/T 16751.3-2023"))
	s $p(def,"^",1)="中医临床诊疗术语 第3部分：治法" s $p(def,"^",3)="国家标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","GB/T 16751.3-2023")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","GB/T 6565-2015"))
	s $p(def,"^",1)="职业类别代码" s $p(def,"^",3)="国家标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","GB/T 6565-2015")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CS03.01.026"))
	s $p(def,"^",1)="剂型代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CS03.01.026")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV02.01.202"))
	s $p(def,"^",1)="患者职业代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV02.01.202")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV05.10.012"))
	s $p(def,"^",1)="随访评价结果代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV05.10.012")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV06.00.207"))
	s $p(def,"^",1)="随访方式代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV06.00.207")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV09.00.404"))
	s $p(def,"^",1)="患者类型代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV09.00.404")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.01.007"))
	s $p(def,"^",1)="疑似结核患者症状代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.01.007")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.01.009"))
	s $p(def,"^",1)="精神症状代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.01.009")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.10.015"))
	s $p(def,"^",1)="足背动脉搏动代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.10.015")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV07.10.003"))
	s $p(def,"^",1)="医疗费用支付方式" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV07.10.003")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV05.10.001"))
	s $p(def,"^",1)="残疾情况代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV05.10.001")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV5101.27"))
	s $p(def,"^",1)="症状代码(健康检查)" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV5101.27")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.01.013"))
	s $p(def,"^",1)="老年人健康状态自我评估代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.01.013")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.01.014"))
	s $p(def,"^",1)="老年人生活自理能力自我评估代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.01.014")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV06.00.101"))
	s $p(def,"^",1)="中药使用类别代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV06.00.101")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","WS 218-2002"))
	s $p(def,"^",1)="卫生机构（组织）分类与代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","WS 218-2002")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV03.00.107"))
	s $p(def,"^",1)="饮食习惯代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV03.00.107")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV06.00.226"))
	s $p(def,"^",1)="离院方式代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV06.00.226")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV03.00.105"))
	s $p(def,"^",1)="饮酒种类代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV03.00.105")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.10.007"))
	s $p(def,"^",1)="口唇外观代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.10.007")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.10.010"))
	s $p(def,"^",1)="齿列类别代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.10.010")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.10.004"))
	s $p(def,"^",1)="皮肤检查结果代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.10.004")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.10.006"))
	s $p(def,"^",1)="巩膜检查结果代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.10.006")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.10.011"))
	s $p(def,"^",1)="淋巴结检查结果代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.10.011")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.10.014"))
	s $p(def,"^",1)="下肢水肿检查结果代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.10.014")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.10.013"))
	s $p(def,"^",1)="肛门指诊检查结果代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.10.013")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.10.012"))
	s $p(def,"^",1)="乳腺检查结果代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.10.012")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.50.005"))
	s $p(def,"^",1)="ABO血型代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.50.005")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV03.00.301"))
	s $p(def,"^",1)="环境危险因素暴露类别代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV03.00.301")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV06.00.229"))
	s $p(def,"^",1)="医嘱项目类型代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV06.00.229")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV05.10.022"))
	s $p(def,"^",1)="手术切口类别代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV05.10.022")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV05.10.010"))
	s $p(def,"^",1)="病情转归代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV05.10.010")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV06.00.227"))
	s $p(def,"^",1)="操作部位代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV06.00.227")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV06.00.103"))
	s $p(def,"^",1)="麻醉方法代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV06.00.103")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV02.01.102"))
	s $p(def,"^",1)="出生(分娩)地点类别代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV02.01.102")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV02.01.201"))
	s $p(def,"^",1)="血缘关系代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV02.01.201")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV5501.14"))
	s $p(def,"^",1)="手术切口愈合等级" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV5501.14")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.50.019"))
	s $p(def,"^",1)="阴道分泌物检查结果代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.50.019")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.50.010"))
	s $p(def,"^",1)="阴道分泌物清洁度代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.50.010")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV05.10.006"))
	s $p(def,"^",1)="儿童生长发育评价结果代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV05.10.006")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.10.021"))
	s $p(def,"^",1)="可疑佝偻病症状代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.10.021")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV06.00.217"))
	s $p(def,"^",1)="儿童健康指导类别代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV06.00.217")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.50.006"))
	s $p(def,"^",1)="采血方式代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.50.006")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.50.007"))
	s $p(def,"^",1)="采血部位代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.50.007")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.50.009"))
	s $p(def,"^",1)="新生儿疾病筛查方法代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.50.009")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV09.00.301"))
	s $p(def,"^",1)="检查结果通知形式代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV09.00.301")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV05.01.039"))
	s $p(def,"^",1)="5岁以下儿童死因分类代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV05.01.039")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV5502.20"))
	s $p(def,"^",1)="疾病诊断类别代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV5502.20")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV5502.21"))
	s $p(def,"^",1)="中医疾病诊断类别代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV5502.21")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV08.10.004"))
	s $p(def,"^",1)="主要致死疾病的最高诊断机构级别代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV08.10.004")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV05.10.015"))
	s $p(def,"^",1)="5岁以下儿童未治疗或未就医原因代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV05.10.015")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV05.01.037"))
	s $p(def,"^",1)="死亡最高诊断依据类别代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV05.01.037")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.10.001"))
	s $p(def,"^",1)="附件检查结果代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.10.001")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.10.003"))
	s $p(def,"^",1)="妇科检查方式代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.10.003")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV05.10.005"))
	s $p(def,"^",1)="婚前医学检查结果代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV05.10.005")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV06.00.210"))
	s $p(def,"^",1)="婚检医学意见代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV06.00.210")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV02.10.002"))
	s $p(def,"^",1)="妊娠终止方式代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV02.10.002")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.01.001"))
	s $p(def,"^",1)="妇科及乳腺不适症状代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.01.001")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV06.00.104"))
	s $p(def,"^",1)="宫内节育器放置时期代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV06.00.104")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV08.50.101"))
	s $p(def,"^",1)="宫内节育器种类代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV08.50.101")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV06.00.105"))
	s $p(def,"^",1)="皮下埋植剂埋植时期代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV06.00.105")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV06.00.106"))
	s $p(def,"^",1)="输卵管结扎手术方式代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV06.00.106")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV06.00.107"))
	s $p(def,"^",1)="输卵管结扎部位代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV06.00.107")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.10.002"))
	s $p(def,"^",1)="子宫大小代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.10.002")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV02.10.005"))
	s $p(def,"^",1)="既往常见疾病种类代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV02.10.005")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV03.00.403"))
	s $p(def,"^",1)="接触有害因素类别代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV03.00.403")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV05.01.007"))
	s $p(def,"^",1)="胎方位代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV05.01.007")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.50.015"))
	s $p(def,"^",1)="尿实验室定性检测结果代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.50.015")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV06.00.219"))
	s $p(def,"^",1)="孕产妇健康指导类别代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV06.00.219")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV05.01.010"))
	s $p(def,"^",1)="会阴裂伤情况代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV05.01.010")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV05.01.009"))
	s $p(def,"^",1)="产时并发症代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV05.01.009")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV06.00.108"))
	s $p(def,"^",1)="新生儿抢救方法代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV06.00.108")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV05.01.013"))
	s $p(def,"^",1)="新生儿并发症代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV05.01.013")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV05.01.011"))
	s $p(def,"^",1)="伤口愈合状况代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV05.01.011")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.50.008"))
	s $p(def,"^",1)="新生儿疾病筛查项目代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.50.008")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.01.012"))
	s $p(def,"^",1)="儿童大便性状代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.01.012")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.10.008"))
	s $p(def,"^",1)="儿童面色代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.10.008")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.10.009"))
	s $p(def,"^",1)="黄疸部位代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.10.009")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.10.018"))
	s $p(def,"^",1)="前囱张力代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.10.018")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.10.019"))
	s $p(def,"^",1)="脐带检查结果代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.10.019")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV03.00.401"))
	s $p(def,"^",1)="孕早期服药类别代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV03.00.401")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV02.10.001"))
	s $p(def,"^",1)="家族近亲婚配者与本人关系代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV02.10.001")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV08.30.004"))
	s $p(def,"^",1)="助产人员类别代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV08.30.004")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV05.10.016"))
	s $p(def,"^",1)="影响孕产妇死亡的主要因素代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV05.10.016")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV06.00.211"))
	s $p(def,"^",1)="避孕方式代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV06.00.211")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV03.00.104"))
	s $p(def,"^",1)="饮酒频率代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV03.00.104")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV08.50.001"))
	s $p(def,"^",1)="疫苗名称代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV08.50.001")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV02.10.003"))
	s $p(def,"^",1)="分娩方式代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV02.10.003")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV02.10.004"))
	s $p(def,"^",1)="出生缺陷儿结局代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV02.10.004")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV05.01.014"))
	s $p(def,"^",1)="出生缺陷诊断依据代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV05.01.014")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV05.01.015"))
	s $p(def,"^",1)="出生缺陷确诊时间类别代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV05.01.015")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV05.01.016"))
	s $p(def,"^",1)="出生缺陷类别代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV05.01.016")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV05.01.005"))
	s $p(def,"^",1)="中医体质分类代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV05.01.005")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.50.011"))
	s $p(def,"^",1)="阴道细胞学诊断结果代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.50.011")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.10.020"))
	s $p(def,"^",1)="儿童体格发育评价代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.10.020")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.10.022"))
	s $p(def,"^",1)="可疑佝偻病体征代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.10.022")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV05.10.007"))
	s $p(def,"^",1)="儿童体弱原因类别代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV05.10.007")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV02.01.212"))
	s $p(def,"^",1)="户籍类型代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV02.01.212")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV03.00.402"))
	s $p(def,"^",1)="孕产期高危因素代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV03.00.402")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV02.01.203"))
	s $p(def,"^",1)="家庭年人均收入代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV02.01.203")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV05.01.006"))
	s $p(def,"^",1)="孕产妇死亡根本死因分类代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV05.01.006")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV04.30.109"))
	s $p(def,"^",1)="宫颈组织病理学检查结果代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV04.30.109")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV5301.06"))
	s $p(def,"^",1)="药物类型代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV5301.06")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV05.01.026"))
	s $p(def,"^",1)="肿瘤临床分期代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV05.01.026")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","CV06.00.223"))
	s $p(def,"^",1)="手术体位代码" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","CV06.00.223")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","WS 445.5-2014"))
	s $p(def,"^",1)="美国麻醉医师学会(ASA)分级标准代码表" s $p(def,"^",3)="行业标准代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","WS 445.5-2014")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.1"))
	s $p(def,"^",1)="消息类型" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.1")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.2"))
	s $p(def,"^",1)="发货类型" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.2")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.3"))
	s $p(def,"^",1)="药品分类代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.3")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.4"))
	s $p(def,"^",1)="监测点类型" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.4")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.5"))
	s $p(def,"^",1)="特殊药品标志" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.5")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.6"))
	s $p(def,"^",1)="收货类型" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.6")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.12"))
	s $p(def,"^",1)="中医药健康指导代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.12")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.17"))
	s $p(def,"^",1)="危害行为代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.17")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.19"))
	s $p(def,"^",1)="随访类型代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.19")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.20"))
	s $p(def,"^",1)="高危因素代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.20")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.26"))
	s $p(def,"^",1)="死亡原因" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.26")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.31"))
	s $p(def,"^",1)="本次随访分类编码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.31")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.36"))
	s $p(def,"^",1)="妊娠期患病情况代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.36")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.37"))
	s $p(def,"^",1)="治疗效果" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.37")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.38"))
	s $p(def,"^",1)="出生地点" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.38")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.39"))
	s $p(def,"^",1)="医保区划数据来源" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.39")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.40"))
	s $p(def,"^",1)="公务员等级" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.40")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.41"))
	s $p(def,"^",1)="手术级别" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.41")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.42"))
	s $p(def,"^",1)="药物过敏史代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.42")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.46"))
	s $p(def,"^",1)="隶属关系" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.46")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.47"))
	s $p(def,"^",1)="所属行业" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.47")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.48"))
	s $p(def,"^",1)="计划生育类别" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.48")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.49"))
	s $p(def,"^",1)="生育类别" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.49")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.50"))
	s $p(def,"^",1)="药物使用频次代码表" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.50")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.51"))
	s $p(def,"^",1)="卫生监督诊疗科目代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.51")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.52"))
	s $p(def,"^",1)="二级清算类别" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.52")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.53"))
	s $p(def,"^",1)="药品剂型" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.53")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.54"))
	s $p(def,"^",1)="医疗收费项目类别" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.54")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.55"))
	s $p(def,"^",1)="医疗类别" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.55")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.57"))
	s $p(def,"^",1)="特殊人员类型等级" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.57")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.58"))
	s $p(def,"^",1)="包装材质" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.58")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.59"))
	s $p(def,"^",1)="包装规格" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.59")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.60"))
	s $p(def,"^",1)="医保人员类别" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.60")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.61"))
	s $p(def,"^",1)="药理分类" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.61")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.62"))
	s $p(def,"^",1)="基金支付类型" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.62")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.63"))
	s $p(def,"^",1)="险种类型" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.63")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.64"))
	s $p(def,"^",1)="最小包装单位" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.64")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.65"))
	s $p(def,"^",1)="最小计量单位" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.65")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.66"))
	s $p(def,"^",1)="服务项目类别" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.66")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.67"))
	s $p(def,"^",1)="医院等级" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.67")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.68"))
	s $p(def,"^",1)="经济类型" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.68")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.69"))
	s $p(def,"^",1)="单位管理类型" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.69")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.70"))
	s $p(def,"^",1)="医保单位类型" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.70")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.71"))
	s $p(def,"^",1)="院内人员类别" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.71")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.72"))
	s $p(def,"^",1)="目录特项标志" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.72")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.73"))
	s $p(def,"^",1)="目录类别" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.73")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.75"))
	s $p(def,"^",1)="医保区划级别" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.75")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.76"))
	s $p(def,"^",1)="代办人关系" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.76")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.77"))
	s $p(def,"^",1)="复核标志" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.77")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.78"))
	s $p(def,"^",1)="异地安置类别" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.78")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.79"))
	s $p(def,"^",1)="给药途径" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.79")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.80"))
	s $p(def,"^",1)="支付地点类别" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.80")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.81"))
	s $p(def,"^",1)="支付结果分类" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.81")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.82"))
	s $p(def,"^",1)="医疗机构等级" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.82")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.83"))
	s $p(def,"^",1)="信用等级" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.83")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.84"))
	s $p(def,"^",1)="申报来源" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.84")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.85"))
	s $p(def,"^",1)="起付线医院等级" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.85")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.86"))
	s $p(def,"^",1)="医保诊断类别" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.86")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.87"))
	s $p(def,"^",1)="病种类型代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.87")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.88"))
	s $p(def,"^",1)="企业性质" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.88")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.89"))
	s $p(def,"^",1)="企业类型" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.89")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.90"))
	s $p(def,"^",1)="医疗机构的机构性质" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.90")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.91"))
	s $p(def,"^",1)="医疗服务机构类型" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.91")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.92"))
	s $p(def,"^",1)="医师执业类别" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.92")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.93"))
	s $p(def,"^",1)="药师执业类别" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.93")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.95"))
	s $p(def,"^",1)="医师执业范围" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.95")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.96"))
	s $p(def,"^",1)="药师执业范围" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.96")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.97"))
	s $p(def,"^",1)="人员证件类型" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.97")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.98"))
	s $p(def,"^",1)="支付方式" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.98")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.99"))
	s $p(def,"^",1)="个人结算方式" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.99")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.100"))
	s $p(def,"^",1)="清算方式" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.100")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.101"))
	s $p(def,"^",1)="清算类别" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.101")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.102"))
	s $p(def,"^",1)="零星报销原因" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.102")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.103"))
	s $p(def,"^",1)="学校类型" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.103")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.104"))
	s $p(def,"^",1)="学校性质" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.104")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.105"))
	s $p(def,"^",1)="结算类型" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.105")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.106"))
	s $p(def,"^",1)="生产地类别" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.106")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.107"))
	s $p(def,"^",1)="检查类型" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.107")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.108"))
	s $p(def,"^",1)="医院医疗专业设备编码目录" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.108")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.109"))
	s $p(def,"^",1)="医嘱大类" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.109")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.110"))
	s $p(def,"^",1)="医嘱子类" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.110")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.117"))
	s $p(def,"^",1)="入院途径" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.117")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.120"))
	s $p(def,"^",1)="预约途径" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.120")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.125"))
	s $p(def,"^",1)="手术类型" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.125")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.126"))
	s $p(def,"^",1)="症状代码2" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.126")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.133"))
	s $p(def,"^",1)="治疗类别" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.133")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.135"))
	s $p(def,"^",1)="体质辨识情况" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.135")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.144"))
	s $p(def,"^",1)="肿块（右）大小编码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.144")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.146"))
	s $p(def,"^",1)="肿块（右）活动度编码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.146")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.152"))
	s $p(def,"^",1)="子宫临床表现代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.152")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.153"))
	s $p(def,"^",1)="组织病理学诊断代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.153")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.154"))
	s $p(def,"^",1)="调动情况代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.154")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.156"))
	s $p(def,"^",1)="行政/业务管理职务代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.156")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.161"))
	s $p(def,"^",1)="标本类型" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.161")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.166"))
	s $p(def,"^",1)="处方类别" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.166")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.181"))
	s $p(def,"^",1)="就诊类型" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.181")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.182"))
	s $p(def,"^",1)="就诊类型标志（用于区分就诊业务）" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.182")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.183"))
	s $p(def,"^",1)="就诊类型标志（用于区分住院就诊业务类型）" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.183")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.198"))
	s $p(def,"^",1)="妊娠结局类别代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.198")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.200"))
	s $p(def,"^",1)="压力类别代码表" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.200")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.201"))
	s $p(def,"^",1)="男科疾病类别代码表" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.201")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.202"))
	s $p(def,"^",1)="智力异常类别代码表" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.202")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.203"))
	s $p(def,"^",1)="睾丸检查结果类别代码表" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.203")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.204"))
	s $p(def,"^",1)="服用叶酸开始时间类别代码表" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.204")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.205"))
	s $p(def,"^",1)="停经后患有具体症状或疾病类别代码表" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.205")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.206"))
	s $p(def,"^",1)="确认早孕结果的机构类别代码表" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.206")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.207"))
	s $p(def,"^",1)="尿妊娠试验和B超检查结果类别代码表" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.207")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.208"))
	s $p(def,"^",1)="婴儿 42 天存活状况类别代码表" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.208")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.209"))
	s $p(def,"^",1)="孕早期患病情况类别代码表" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.209")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.210"))
	s $p(def,"^",1)="诊断出生缺陷儿级别的类别代码表" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.210")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.211"))
	s $p(def,"^",1)="麻醉精神类药品标志" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.211")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.231"))
	s $p(def,"^",1)="用药依从性代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.231")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.233"))
	s $p(def,"^",1)="糖尿病症状编码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.233")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.234"))
	s $p(def,"^",1)="传染病代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.234")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.235"))
	s $p(def,"^",1)="处方类型" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.235")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.236"))
	s $p(def,"^",1)="标本代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.236")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.237"))
	s $p(def,"^",1)="报告单类别代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.237")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.238"))
	s $p(def,"^",1)="检查部位代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.238")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.239"))
	s $p(def,"^",1)="检验结果代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.239")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.240"))
	s $p(def,"^",1)="检验检查异常提示代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.240")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.241"))
	s $p(def,"^",1)="检验检查就诊卡类型代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.241")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.242"))
	s $p(def,"^",1)="外地标志" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.242")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.243"))
	s $p(def,"^",1)="急诊分级" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.243")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.244"))
	s $p(def,"^",1)="儿童营养性疾病因素类别代码表" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.244")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.245"))
	s $p(def,"^",1)="医疗卡类型" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.245")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.246"))
	s $p(def,"^",1)="急诊患者去向" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.246")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.247"))
	s $p(def,"^",1)="医学影像检查结果互认项目" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.247")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.248"))
	s $p(def,"^",1)="医院性质" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.248")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.249"))
	s $p(def,"^",1)="传染病疾病编码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.249")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.250"))
	s $p(def,"^",1)="Rh血型" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.250")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.252"))
	s $p(def,"^",1)="法定传染病分类" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.252")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.253"))
	s $p(def,"^",1)="实施DRGs管理" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.253")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.254"))
	s $p(def,"^",1)="入院病情代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.254")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.255"))
	s $p(def,"^",1)="病例首页费用分类" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.255")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.256"))
	s $p(def,"^",1)="处方类型代码表" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.256")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.257"))
	s $p(def,"^",1)="医嘱项目类别代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.257")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.258"))
	s $p(def,"^",1)="中药煎煮法代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.258")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.259"))
	s $p(def,"^",1)="患者就诊来源" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.259")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.260"))
	s $p(def,"^",1)="医嘱状态代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.260")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.261"))
	s $p(def,"^",1)="执行周期时间单位代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.261")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.262"))
	s $p(def,"^",1)="药物分类代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.262")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.263"))
	s $p(def,"^",1)="不良事件类别代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.263")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.264"))
	s $p(def,"^",1)="事件发生等级代码（不良事件)" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.264")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.265"))
	s $p(def,"^",1)="临床研究分类代码（不良事件）" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.265")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.266"))
	s $p(def,"^",1)="SAE情况代码（不良事件）" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.266")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.267"))
	s $p(def,"^",1)="对试验用药采取的措施代码（不良事件）" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.267")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.268"))
	s $p(def,"^",1)="SAE与实验药的关系代码（不良事件）" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.268")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.269"))
	s $p(def,"^",1)="事件发生场所代码（不良事件）" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.269")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.270"))
	s $p(def,"^",1)="不良事件结果代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.270")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.271"))
	s $p(def,"^",1)="停药或减量后反应状态代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.271")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.272"))
	s $p(def,"^",1)="生产企业信息来源代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.272")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.273"))
	s $p(def,"^",1)="出入库方式" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.273")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.274"))
	s $p(def,"^",1)="处方点评状态" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.274")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.275"))
	s $p(def,"^",1)="挂号类别" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.275")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.276"))
	s $p(def,"^",1)="重症标识" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.276")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.277"))
	s $p(def,"^",1)="药物剂量单位代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.277")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.278"))
	s $p(def,"^",1)="检验定性结果" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.278")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.279"))
	s $p(def,"^",1)="密级" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.279")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.280"))
	s $p(def,"^",1)="预约状态" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.280")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.281"))
	s $p(def,"^",1)="支付状态" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.281")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.282"))
	s $p(def,"^",1)="麻醉反应标志" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.282")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.283"))
	s $p(def,"^",1)="治疗类型" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.283")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.284"))
	s $p(def,"^",1)="治疗状态" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.284")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.285"))
	s $p(def,"^",1)="治疗效果" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.285")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.286"))
	s $p(def,"^",1)="评估状态" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.286")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.287"))
	s $p(def,"^",1)="卒中治疗类型" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.287")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.288"))
	s $p(def,"^",1)="静脉溶栓药物" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.288")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.289"))
	s $p(def,"^",1)="溶栓并发症" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.289")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.290"))
	s $p(def,"^",1)="血管内开通方法" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.290")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.291"))
	s $p(def,"^",1)="血管内开通治疗手术并发症" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.291")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.292"))
	s $p(def,"^",1)="未溶栓原因" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.292")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.293"))
	s $p(def,"^",1)="开始静脉溶栓场所" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.293")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.294"))
	s $p(def,"^",1)="院前意识" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.294")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.295"))
	s $p(def,"^",1)="卒中出血部位" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.295")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.296"))
	s $p(def,"^",1)="来院方式" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.296")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.297"))
	s $p(def,"^",1)="胸痛-病情评估-详情" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.297")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.298"))
	s $p(def,"^",1)="护理等级" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.298")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.299"))
	s $p(def,"^",1)="饮食指导" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.299")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.300"))
	s $p(def,"^",1)="隔离种类" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.300")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.301"))
	s $p(def,"^",1)="输血品种代码" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.301")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.302"))
	s $p(def,"^",1)="输血反应类型" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.302")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.303"))
	s $p(def,"^",1)="发生区域" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.303")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.304"))
	s $p(def,"^",1)="相关因素类别" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.304")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.305"))
	s $p(def,"^",1)="分娩方式" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.305")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.306"))
	s $p(def,"^",1)="手术指征" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.306")=def
	s def=$g(^YZSY("SYDictMap","Domain","SY","LY.00.307"))
	s $p(def,"^",1)="分娩结局" s $p(def,"^",3)="自定义值域代码" s $p(def,"^",5)="Y" s ^YZSY("SYDictMap","Domain","SY","LY.00.307")=def
	q "值域初始化完成,共305个"
}

/// 自测(只读, 不改库)
/// w ##class(web.YZSY.DHCSYDictMap).test()
ClassMethod test()
{
	s g=..G()
	w "G="_..G(),!
	w "user="_..GetUser(),!
	w "now="_..Now(),!
	w "MatchFail(空关键字,应0)="_..MatchFail("1","汉族",""),!
	w "MatchFail(命中'汉',应0)="_..MatchFail("1","汉族","汉"),!
	w "MatchFail(未命中'XY',应1)="_..MatchFail("1","汉族","XY"),!
	w "JsonNum(item,应12)="_..JsonNum("{""item"":12,""domain"":3}","item"),!
	w "JsonNum(domain,应3)="_..JsonNum("{""item"":12,""domain"":3}","domain"),!
	w "平台数="_..CountPlatform(),!
	w "字典表数="_..CountHisDict(),!
	w "值域数(SY)="_..CountDomain("SY"),!
	q ""
}

/// 平台数量(自测/统计用)
ClassMethod CountPlatform() As %Integer
{
	s g=..G()
	s cnt=0
	s k=""
	for {
		s k=$o(^YZSY("SYDictMap","Platform",k))
		q:k=""
		s cnt=cnt+1
	}
	q cnt
}

/// 字典表数量(自测/统计用)
ClassMethod CountHisDict() As %Integer
{
	s g=..G()
	s cnt=0
	s k=""
	for {
		s k=$o(^YZSY("SYDictMap","HisDict",k))
		q:k=""
		s cnt=cnt+1
	}
	q cnt
}

/// 值域数量(自测/统计用)
ClassMethod CountDomain(PlatCode As %String) As %Integer
{
	s g=..G()
	s cnt=0
	s k=""
	for {
		s k=$o(^YZSY("SYDictMap","Domain",PlatCode,k))
		q:k=""
		s cnt=cnt+1
	}
	q cnt
}

}
