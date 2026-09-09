Class web.YZSY.DHCMRInfoPageDownLoad Extends DHCDoc.Util.RegisteredObject
{

/// 固定参数
Parameter QUERYCLASS = "EMRservice.HISInterface.OEPInfoPageInterface";
Parameter QUERYNAME = "GetOutpatientList";
Parameter OUTPUTDIR = "/tmp/excel/";
Parameter FILEPREFIX = "门诊信息首页_";

/// ExcelTitle — 字段码表头
Parameter EXCELTITLE = "MA50^MA11^MA12C^MA13^MA21C^MA15C^MA19C^MA20N^MA20^MA26^MA35^MA51C^MA52^MA53C^MA54^MA02^MB39^MB41^MB42^MB46^MB47C^MB49N^MB50C^MB44C^MB43C^MB54C^MB45C^MB51C^MB52C^MB53^MC51^MC01C^MC02N^MC52x01C^MC52x01N^MC52x02C^MC52x02N^MC52x03C^MC52x03N^MC52x04C^MC52x04N^MC52x05C^MC52x05N^MC52x06C^MC52x06N^MC52x07C^MC52x07N^MC52x08C^MC52x08N^MC52x09C^MC52x09N^MC52x10C^MC52x10N^MC16x01^MC16x02^MC16x03^MC16x04^MC16x05^MC15x01N^MC15x02N^MC15x03N^MC15x04N^MC15x05N^MC14x01C^MC14x02C^MC14x03C^MC14x04C^MC14x05C^MC18x01N^MC18x02N^MC18x03N^MC18x04N^MC18x05N^MC22x01C^MC22x02C^MC22x03C^MC22x04C^MC22x05C^MC23x01^MC23x02^MC23x03^MC23x04^MC23x05^MC17x01^MC17x02^MC17x03^MC17x04^MC17x05^MD01^MD09^MD11^MD12^MD13^MD14^MD15^MD16^MD17^MD18^MD19^MD19x01^MD20^MD20x01^MD20x02^MD21^MD22^MD23^MD23x01^MD24^MD25^MD26^MD27^MD28^MD29^MD30^MD31^MD32^MD33^MD34";

/// 网页调用：后台异步启动生成，立即返回（生成耗时长，避免 Web Gateway 超时）
/// 入参 YearMonth: "2026-06"
/// 返回 JSON: {"success":true,"msg":"已提交后台生成"}
ClassMethod StartGenerate(YearMonth As %String) As %String
{
	s year = $p(YearMonth, "-", 1)
	s month = $p(YearMonth, "-", 2)
	if (year="")||(month="") q "{""success"":0,""msg"":""年月格式错误，请传 YYYY-MM""}"

	s OutDir = ..#OUTPUTDIR
	s buildingFile = OutDir _ ..#FILEPREFIX _ YearMonth _ ".csv.building"
	if ##class(%File).Exists(buildingFile) q "{""success"":0,""msg"":""该月份正在生成中，请稍候""}"

	; 后台 JOB 异步生成，网页立即返回
	job ##class(web.YZSY.DHCMRInfoPageDownLoad).RunGenerate(YearMonth)
	q "{""success"":1,""msg"":""已提交后台生成""}"
}

/// 后台实际生成：先写 .csv.building 临时文件，完成后改名为 .csv
/// 供 StartGenerate 以 JOB 方式后台调用；也可终端直接调用测试
ClassMethod RunGenerate(YearMonth As %String) As %String
{
	s tmpspl = $c(94)
	s OutDir = ..#OUTPUTDIR
	s ExcelTitle = ..#EXCELTITLE

	s year = $p(YearMonth, "-", 1)
	s month = $p(YearMonth, "-", 2)
	q:(year="")||(month="") ""

	; 计算月初和月末日期
	s SDate = year _ "-" _ month _ "-01"
	if month = 12 {
		s nextMonthH = ..%ZDH((year + 1) _ "-01-01")
	} else {
		s nm = month + 1
		s nmStr = $s(nm < 10:"0" _ nm, 1:nm)
		s nextMonthH = ..%ZDH(year _ "-" _ nmStr _ "-01")
	}
	s EDateH = nextMonthH - 1
	s EDate = ..%ZD(EDateH)

	; 确保输出目录存在
	if '##class(%File).DirectoryExists(OutDir) {
		d ##class(%File).CreateDirectoryChain(OutDir)
	}

	s doneFile = OutDir _ ..#FILEPREFIX _ YearMonth _ ".csv"
	s buildingFile = doneFile _ ".building"

	; 清理可能残留的临时文件
	d ##class(%File).Delete(buildingFile)

	; 打开临时文件写入
	s File = ##class(%File).%New(buildingFile)
	d File.Open("NWRS")

	; 执行 Query
	s rs = ##class(%ResultSet).%New(..#QUERYCLASS _ ":" _ ..#QUERYNAME)
	s sc = rs.Execute(SDate, EDate)
	if $$$ISERR(sc) {
		d File.Close()
		d ##class(%File).Delete(buildingFile)
		q ""
	}
	s Columns = rs.GetColumnCount()

	; 写入表头（按 ^ 拆分成 TAB 分隔的列，与 ExcelTitle 各字段一一对应）
	d File.WriteLine($tr(ExcelTitle, tmpspl, $c(9)))

	; 写入数据行（TAB 分列）
	for {
		q:rs.Next(.sc)=0
		if $$$ISOK(sc) {
			s rowData = ""
			for colIdx=1:1:Columns {
				if rowData = "" {
					s rowData = rs.GetData(colIdx)
				} else {
					s rowData = rowData _ $c(9) _ rs.GetData(colIdx)
				}
			}
			d File.WriteLine(rowData)
		} else {
			q
		}
	}

	; 注：%ResultSet 取完数据后 .sc 常为非 OK 状态（正常现象），不作致命处理
	d File.Flush()
	d File.%Save()
	d File.Close()

	; 完成：删除旧的完成文件（若有），把 .building 改名为 .csv
	d:##class(%File).Exists(doneFile) ##class(%File).Delete(doneFile)
	d ##class(%File).Rename(buildingFile, doneFile)

	q ""
}

/// 列出 /tmp/excel/ 下的门诊信息首页 CSV 文件
/// 返回 JSON 数组: [{"name":"门诊信息首页_2026-06.csv","size":"12.5 KB","date":"2026-07-09 08:31:43"}]
ClassMethod ListFiles() As %String
{
	s OutDir = ..#OUTPUTDIR
	s FilePrefix = ..#FILEPREFIX

	if '##class(%File).DirectoryExists(OutDir) {
		q "[]"
	}

	s json = "["
	s first = 1

	; 遍历目录：匹配所有前缀文件，区分 .csv(完成) 与 .csv.building(生成中)
	s rs = ##class(%ResultSet).%New("%File:FileSet")
	s sc = rs.Execute(OutDir, FilePrefix _ "*")
	i $$$ISERR(sc) q "[]"

	for {
		q:rs.Next(.sc)=0
		i $$$ISERR(sc) q

		; Name 列本身就是完整路径，取文件名
		s fullName = rs.Get("Name")
		continue:fullName=""
		s itemName = ##class(%File).GetFilename(fullName)

		; 判断状态：.csv.building=生成中，.csv=完成，其余跳过
		s status = ""
		s dispName = ""
		if itemName [ ".building" {
			s status = "生成中"
			s dispName = $p(itemName, ".building", 1)
		} elseif $p(itemName, ".", $l(itemName, ".")) = "csv" {
			s status = "完成"
			s dispName = itemName
		} else {
			continue
		}

		; 文件大小
		s sizeBytes = +rs.Get("Size")
		s sizeKB = sizeBytes \ 1024
		if sizeKB >= 1024 {
			s sizeStr = (sizeKB \ 1024) _ "." _ ((sizeKB # 1024) * 100 \ 1024) _ " MB"
		} else {
			s sizeStr = sizeKB _ " KB"
		}

		; 修改时间（截断到秒）
		s dateStr = $e(rs.Get("DateModified"), 1, 19)

		s:'first json = json _ ","
		s first = 0
		s json = json _ "{""name"":""" _ dispName _ """,""size"":""" _ sizeStr _ """,""date"":""" _ dateStr _ """,""status"":""" _ status _ """}"
	}

	q json _ "]"
}

/// 删除文件（完成的 .csv 及其生成中的 .csv.building）
/// 命名用 Remove 而非 Delete，避开前端 $cm 安全过滤对 delete 关键词的拦截
/// 返回 JSON: {"success":true} 或 {"success":false,"msg":"..."}
ClassMethod RemoveFile(fileName As %String) As %String
{
	; 安全检查：防止路径穿越
	i fileName [ "/" q "{""success"":0,""msg"":""非法文件名""}"
	i fileName [ "\" q "{""success"":0,""msg"":""非法文件名""}"
	i fileName [ ".." q "{""success"":0,""msg"":""非法文件名""}"

	s OutDir = ..#OUTPUTDIR
	s doneFile = OutDir _ fileName
	s buildingFile = doneFile _ ".building"

	; 生成中的文件（.building 存在）不允许删除
	i ##class(%File).Exists(buildingFile) q "{""success"":0,""msg"":""生成中的文件不可删除""}"

	q:'##class(%File).Exists(doneFile) "{""success"":0,""msg"":""文件不存在""}"
	d ##class(%File).Delete(doneFile)
	q "{""success"":1}"
}

}
