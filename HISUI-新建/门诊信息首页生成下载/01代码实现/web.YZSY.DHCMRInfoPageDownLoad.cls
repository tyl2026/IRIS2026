Class web.YZSY.DHCMRInfoPageDownLoad Extends DHCDoc.Util.RegisteredObject
{

/// 固定参数
Parameter QUERYCLASS = "EMRservice.HISInterface.OEPInfoPageInterface";
Parameter QUERYNAME = "GetOutpatientList";
Parameter OUTPUTDIR = "/tmp/excel/";
Parameter FILEPREFIX = "门诊信息首页_";

/// ExcelTitle — 字段码表头
Parameter EXCELTITLE = "MA50^MA11^MA12C^MA13^MA21C^MA15C^MA19C^MA20N^MA20^MA26^MA35^MA51C^MA52^MA53C^MA54^MA02^MB39^MB41^MB42^MB46^MB47C^MB49N^MB50C^MB44C^MB43C^MB54C^MB45C^MB51C^MB52C^MB53^MC51^MC01C^MC02N^MC52x01C^MC52x01N^MC52x02C^MC52x02N^MC52x03C^MC52x03N^MC52x04C^MC52x04N^MC52x05C^MC52x05N^MC52x06C^MC52x06N^MC52x07C^MC52x07N^MC52x08C^MC52x08N^MC52x09C^MC52x09N^MC52x10C^MC52x10N^MC16x01^MC16x02^MC16x03^MC16x04^MC16x05^MC15x01N^MC15x02N^MC15x03N^MC15x04N^MC15x05N^MC14x01C^MC14x02C^MC14x03C^MC14x04C^MC14x05C^MC18x01N^MC18x02N^MC18x03N^MC18x04N^MC18x05N^MC22x01C^MC22x02C^MC22x03C^MC22x04C^MC22x05C^MC23x01^MC23x02^MC23x03^MC23x04^MC23x05^MC17x01^MC17x02^MC17x03^MC17x04^MC17x05^MD01^MD09^MD11^MD12^MD13^MD14^MD15^MD16^MD17^MD18^MD19^MD19x01^MD20^MD20x01^MD20x02^MD21^MD22^MD23^MD23x01^MD24^MD25^MD26^MD27^MD28^MD29^MD30^MD31^MD32^MD33^MD34";

/// 根据年月生成CSV文件
/// 入参 YearMonth: "2026-06" 格式
/// 返回 JSON: {"success":true,"fileName":"门诊信息首页_2026-06.csv","msg":""}
ClassMethod GenerateCSV(YearMonth As %String) As %String
{
	s tmpspl = $c(94)

	s OutDir = ..#OUTPUTDIR
	s FilePrefix = ..#FILEPREFIX
	s ExcelTitle = ..#EXCELTITLE

	; 解析年月
	s year = $p(YearMonth, "-", 1)
	s month = $p(YearMonth, "-", 2)
	if (year="")||(month="") q "{""success"":false,""msg"":""年月格式错误，请传 YYYY-MM""}"

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

	; 生成文件名
	s FileName = FilePrefix _ YearMonth _ ".csv"

	; 确保输出目录存在
	if '##class(%File).DirectoryExists(OutDir) {
		s dirOk = ##class(%File).CreateDirectoryChain(OutDir)
		i 'dirOk q "{""success"":false,""msg"":""无法创建输出目录 "_OutDir _ """}"
	}

	s FullPath = OutDir _ FileName

	; 打开文件
	s File = ##class(%File).%New(FullPath)
	d File.Open("NWRS")

	; 执行 Query
	s ClassName = ..#QUERYCLASS
	s QueryName = ..#QUERYNAME
	s rs = ##class(%ResultSet).%New(ClassName _ ":" _ QueryName)
	s sc = rs.Execute(SDate, EDate)
	if $$$ISERR(sc) {
		d File.Close()
		q "{""success"":false,""msg"":""Query 执行失败: "_SDate_" ~ "_EDate_"""}"
	}
	s Columns = rs.GetColumnCount()

	; 写入表头 (tab 分隔)
	d File.WriteLine($tr(ExcelTitle, tmpspl, $c(9)))

	; 写入数据行
	for {
		s sc = rs.Next(.sc)
		q:sc = 0
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
	i $$$ISERR(sc) d File.Close() q "{""success"":false,""msg"":""数据读取异常""}"

	d File.Flush()
	d File.%Save()
	d File.Close()

	q "{""success"":true,""fileName"":""" _ FileName _ """}"
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

	; 遍历目录
	s rs = ##class(%ResultSet).%New("%File:FileSet")
	s sc = rs.Execute(OutDir, FilePrefix _ "*.csv", "Name", 1)
	i $$$ISERR(sc) q "[]"

	for {
		s ok = rs.Next(.sc)
		q:ok = 0
		i '$$$ISOK(sc) q

		s name = rs.Get("Name")
		s fullPath = OutDir _ name

		; 文件大小 (KB)
		s sizeBytes = ##class(%File).GetFileSize(fullPath)
		s sizeKB = sizeBytes \ 1024
		if sizeKB >= 1024 {
			s sizeStr = (sizeKB \ 1024) _ "." _ (sizeKB # 1024 * 100 \ 1024) _ " MB"
		} else {
			s sizeStr = sizeKB _ " KB"
		}

		; 修改时间
		s dateModified = ##class(%File).GetFileDateModified(fullPath, 1)
		s dateStr = $s(dateModified '= "": $zdt(dateModified, 3, 1), 1: "")

		s:'first json = json _ ","
		s first = 0
		s json = json _ "{""name"":""" _ name _ """,""size"":""" _ sizeStr _ """,""date"":""" _ dateStr _ """}"
	}

	q json _ "]"
}

/// 下载文件 — 返回文件原始内容（前端通过 Blob 下载）
/// 返回文件文本内容（CSV 为文本文件）
ClassMethod DownloadFile(fileName As %String) As %String
{
	s OutDir = ..#OUTPUTDIR
	s fullPath = OutDir _ fileName

	; 安全检查：防止路径穿越
	i fileName [ "/" q ""
	i fileName [ "\" q ""
	i fileName [ ".." q ""
	i '##class(%File).Exists(fullPath) q ""

	s file = ##class(%File).%New(fullPath)
	s sc = file.Open("R")
	i $$$ISERR(sc) q ""

	s content = ""
	for {
		s line = file.ReadLine(.sc)
		q:sc = -1
		s content = content _ line _ $c(13, 10)
	}

	d file.Close()

	q content
}

}
