function InitBPRepWinEvent(obj) {
	obj.LoadEvent = function () {
		//搜索框[字典类别]事件
		$('#searchboxT').searchbox({
			searcher: function (value, name) {
				InitPatWin(value);
			}
		});
		// 按钮点击事件
		$('#btnSubmit').click(function (e) {
			if (!obj.CheckInputData(2)) {
				return;
			}
			if (obj.Save()) {
				InitPatWin(2);
				$.messager.popover({ msg: $g('提交成功！'), type: 'success', timeout: 2000 });
				$('#searchboxT').searchbox('setValue', '');
			} else {
				$.messager.alert($g("提示"), $g('提交失败！'), 'info');
			};
		});
		$('#btnCheck').click(function (e) {
			if (!obj.CheckInputData(3)) {
				return;
			}
			if (obj.Save()) {
				InitPatWin(2);
				$.messager.popover({ msg: $g('审核成功！'), type: 'success', timeout: 2000 });
			} else {
				$.messager.alert($g("提示"), $g('审核失败！'), 'info');
			};
		});
		$('#btnDelete').click(function (e) {
			if (obj.SaveStatus(4)) {
				$.messager.popover({ msg: $g('删除成功！'), type: 'success', timeout: 2000 });
			} else {
				$.messager.alert($g("提示"), $g('删除失败！'), 'info');
			};
		});
		$('#btnReturn').click(function (e) {
			if (obj.SaveStatus(5)) {
				$.messager.popover({ msg: $g('退回成功！'), type: 'success', timeout: 2000 });
			} else {
				$.messager.alert($g("提示"), $g('退回失败！'), 'info');
			};
		});
		$('#btnUnCheck').click(function (e) {
			if (obj.SaveStatus(6)) {
				$.messager.popover({ msg: $g('取消审核成功！'), type: 'success', timeout: 2000 });
			} else {
				$.messager.alert($g("提示"), $g('取消审核失败！'), 'info');
			};
		});
		$('#btnClose').click(function (e) {
			websys_showModal('close');
		});
		$('#btnExport').click(function (e) {
			obj.ExportReport();
		});
		$('#btnExportAll').click(function (e) {
			obj.ExportAll();
		});
	}
	obj.InitButtons = function () {
		if (obj.AdminPower == 1) {
			obj.InitButtons = function () {
				$('.CSSButton').hide();
				$('#btnExportAll').show();
				//管理员
				switch (obj.RepStatusCode) {
					case '2':       // 提交
						$('#btnDelete').show();
						$('#btnSubmit').show();
						$('#btnExport').show();
						$('#btnCheck').show();
						//$('#btnReturn').show();
						$('#btnDelete').show();
						break;
					case '3':       // 审核
						$('#btnExport').show();
						$('#btnUnCheck').show();
						break;
					case '6':       // 取消审核
						$('#btnSubmit').show();
						$('#btnDelete').show();
						$('#btnCheck').show();
						//$('#btnReturn').show();
						break;
					case '4':       // 删除
						$('#btnSubmit').show();
						break;
					case '5':       // 退回
						$('#btnSubmit').show();
						$('#btnDelete').show();
						break;
					default:
						$('#btnSubmit').show();
						break;
				}
			}
		} else {
			obj.InitButtons = function () {
				//临床
				$('.CSSButton').hide();
				$('#btnExportAll').show();
				switch (obj.RepStatusCode) {
					case '2':       // 提交
						$('#btnDelete').show();
						$('#btnSubmit').show();
						$('#btnExport').show();
						break;
					case '3':       // 审核
						$('#btnExport').show();
						break;
					case '6':       // 取消审核
						$('#btnSubmit').show();
						$('#btnDelete').show();
						break;
					case '4':       // 删除
						$('#btnSubmit').show();
						break;
					case '5':       // 退回
						$('#btnSubmit').show();
						$('#btnDelete').show();
						break;
					default:
						$('#btnSubmit').show();
						break;
				}
			}
		}
		//首次加载
		obj.InitButtons();
	}
	obj.refreshReportInfo = function(){
		// 初始化报告主表信息
		obj.RepInfo = $cm({
			ClassName:"DHCHAI.IRS.BPSurverySrv",
			QueryName:"QryAdmInfo",		
			aBPRegID: ReportID,
			aSurvNumber:SurvNumber
		},false);
		if (obj.RepInfo.total>0) {
			var RepInfo = obj.RepInfo.rows[0];
			$('#txtBPRegDate').val(RepInfo.BPRegDate);
			$('#txtBPRegLocDesc').val(RepInfo.BPRegLocDesc);
			$('#txtBPRegUserDesc').val(RepInfo.BPRegUserDesc);
			$('#txtRepStatus').val(RepInfo.RepStatus);
			
			obj.RepStatusCode = RepInfo.RepStatusCode;
		}else{
			$('#txtBPRegDate').val("");
			$('#txtBPRegLocDesc').val("");
			$('#txtBPRegUserDesc').val("");
			$('#txtRepStatus').val("");
		}
	}
	// 数据完整性验证
	obj.CheckInputData = function (statusCode) {
		obj.RepInfo   = obj.Rep_Save(statusCode);	   // 报告主表信息
		obj.RegComRep = obj.RegExt_Save();             // 获取模板报告信息
		obj.RepLog    = obj.RepLog_Save(statusCode);   // 日志
		if (obj.RepInfo == '') {
			return false;
		}
		if (obj.RegComRep == '') {
			return false;
		}
		return true;
	}
	
	// 保存报告内容+状态
	obj.Save = function () {
        var ret = $m({
			ClassName: 'DHCHAI.IRS.BPSurverySrv',
			MethodName: 'SaveBPReport',
			aRepInfo: obj.RepInfo,
			aRegComRep: obj.RegComRep,
			aRepLog: obj.RepLog
		}, false);
		if (parseInt(ret) > 0) {
			ReportID = parseInt(ret);
			InitBase();
			obj.refreshReportInfo();
			obj.InitButtons();
			return true;
		} else {
			return false;
		}
	}
	
	// 保存报告状态
	obj.SaveStatus = function (statusCode) {
		var InputRepLog = obj.RepLog_Save(statusCode);	// 日志
		var ret = $m({
			ClassName: "DHCHAI.IRS.BPSurverySrv",
			MethodName: "SaveReportStatus",
			aRepLog: InputRepLog,
			separete: CHR_1
		}, false)
		if (parseInt(ret) > 0) {
			obj.refreshReportInfo();
			obj.InitButtons();
			InitPatWin(2);
			return true;
		} else {
			return false;
		}
	}
	obj.Rep_Save = function (statusCode){
		var RepDate = '';
		var RepTime = '';
		var RepLoc  = $.LOGON.LOCID;
		var RepUser = $.LOGON.USERID;
		var BPPatNo = $('#txtBPRegID').val();
		if (obj.AdminPower==1){  //管理员 不修改 报告科室、报告人、报告日期、报告时间 采用报告数据
			if ((obj.RepInfo)&&(obj.RepInfo.total>0)) { 
				RepDate = obj.RepInfo.rows[0].BPRegDate;
				RepTime = obj.RepInfo.rows[0].BPRegTime;
				RepLoc  = obj.RepInfo.rows[0].BPRegLocDr;
				RepUser = obj.RepInfo.rows[0].BPRegUserDr;
			}
		}

		var InputRep = ReportID;
		InputRep = InputRep + CHR_1 + RegTypeID;
		InputRep = InputRep + CHR_1 + BPRegID;
		InputRep = InputRep + CHR_1 + obj.PAEpisodeID;
		InputRep = InputRep + CHR_1 + SurvNumber;
		InputRep = InputRep + CHR_1 + RepDate;
		InputRep = InputRep + CHR_1 + RepTime;
		InputRep = InputRep + CHR_1 + RepLoc;
		InputRep = InputRep + CHR_1 + RepUser;
		InputRep = InputRep + CHR_1 + statusCode;	  // 状态
		InputRep = InputRep + CHR_1 + BPPatNo;        // 病人编号
    	return InputRep;
	}
	
	obj.RepLog_Save = function(statusCode){
		var Opinion = arguments[1];
		if (typeof(Opinion)=='undefined'){
			Opinion='';
		}
		var InputRepLog = ReportID;
		InputRepLog = InputRepLog + CHR_1 + "";
		InputRepLog = InputRepLog + CHR_1 + statusCode;		//状态
		InputRepLog = InputRepLog + CHR_1 + Opinion;
		InputRepLog = InputRepLog + CHR_1 + $.LOGON.USERID;      //session['LOGON.USERID'];
    	return InputRepLog;
	}
	
	// 导出界面内容（患者信息 + 报告全部字段）为 CSV：标题行 + 数据行
	obj.ExportReport = function () {
		var headers = [];
		var values = [];
		// 患者基本信息
		var baseMap = [
			['患者姓名', '#txtPatName'], ['性别', '#Sex'], ['年龄', '#Age'],
			['个案登记号', '#txtBPRegID'], ['住院号', '#txtMrNo'], ['入院日期', '#txtPARegDate'],
			['入院诊断', '#txtPADiagnosis'], ['主管医生', '#txtPAAdmDoc'],
			['登记日期', '#txtBPRegDate'], ['登记科室', '#txtBPRegLocDesc'],
			['登记人', '#txtBPRegUserDesc'], ['报告状态', '#txtRepStatus']
		];
		for (var i = 0; i < baseMap.length; i++) {
			headers.push(baseMap[i][0]);
			values.push($.trim($(baseMap[i][1]).val() || ''));
		}
		// 报告模板字段（与 RegExt_Save 相同的模板结构）
		var RegTypeList = $cm({
			ClassName: "DHCHAI.IRS.ComTemplateDefSrv",
			QueryName: "QryExpRegType",
			aRegTypeID: RegTypeID,
			rows: 999
		}, false);
		if (RegTypeList && RegTypeList.total > 0) {
			for (var ind = 0; ind < RegTypeList.total; ind++) {
				var RegType = RegTypeList.rows[ind];
				var DicID = RegType.TypeID;
				var RegExtList = $cm({
					ClassName: "DHCHAI.IRS.ComTemplateDefSrv",
					QueryName: "QryComTempTypeExt",
					aTypeID: RegTypeID,
					aExtTypeID: DicID,
					rows: 999
				}, false);
				if (!RegExtList || RegExtList.total == 0) {
					continue;
				}
				for (var jnd = 0; jnd < RegExtList.total; jnd++) {
					var rd = RegExtList.rows[jnd];
					headers.push(rd.Desc || '');
					values.push(GetFieldDisplayValue(parseInt(rd.Code), parseInt(rd.Code), rd.DatCode));
				}
			}
		}
		// 生成 CSV（标题行 + 数据行，UTF-8 BOM）
		var csv = '\ufeff';
		csv += CsvLine(headers) + '\r\n';
		csv += CsvLine(values) + '\r\n';
		var fname = '血透个案登记表_' + ($('#txtPatName').val() || '') + '_' + BPTodayStr() + '.csv';
		var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
		if (navigator.msSaveBlob) {
			navigator.msSaveBlob(blob, fname);
		} else {
			var a = document.createElement('a');
			a.href = URL.createObjectURL(blob);
			a.download = fname;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		}
		$.messager.popover({ msg: $g('导出成功！'), type: 'success', timeout: 2000 });
		return true;
	}
	
	// 导出病人列表所有病人的报告数据（标题行 + 每病人一行，读后端已保存数据）
	obj.ExportAll = function () {
		// 表头：患者基本信息（字段取 QryAdmInfo 列）
		var headers = [];
		var baseMap = [
			['患者姓名', 'PAPatName'], ['性别', 'PAPatSex'], ['年龄', 'PAPatAge'],
			['个案登记号', 'BPRegID'], ['住院号', 'PAMrNo'], ['入院日期', 'PARegDate'],
			['入院诊断', 'PADiagnosis'], ['主管医生', 'PAAdmDoc'],
			['登记日期', 'BPRegDate'], ['登记科室', 'BPRegLocDesc'],
			['登记人', 'BPRegUserDesc'], ['报告状态', 'RepStatus']
		];
		var fieldDefs = [];
		for (var i = 0; i < baseMap.length; i++) {
			headers.push(baseMap[i][0]);
		}
		// 表头：报告模板字段
		var RegTypeList = $cm({
			ClassName: "DHCHAI.IRS.ComTemplateDefSrv",
			QueryName: "QryExpRegType",
			aRegTypeID: RegTypeID,
			rows: 999
		}, false);
		if (RegTypeList && RegTypeList.total > 0) {
			for (var ind = 0; ind < RegTypeList.total; ind++) {
				var RegType = RegTypeList.rows[ind];
				var RegExtList = $cm({
					ClassName: "DHCHAI.IRS.ComTemplateDefSrv",
					QueryName: "QryComTempTypeExt",
					aTypeID: RegTypeID,
					aExtTypeID: RegType.TypeID,
					rows: 999
				}, false);
				if (!RegExtList || RegExtList.total == 0) {
					continue;
				}
				for (var jnd = 0; jnd < RegExtList.total; jnd++) {
					var rd = RegExtList.rows[jnd];
					headers.push(rd.Desc || '');
					fieldDefs.push({ code: parseInt(rd.Code), datatype: rd.DatCode });
				}
			}
		}
		// 病人列表（与界面左侧列表同查询）
		$.messager.progress({ title: $g('提示'), msg: $g('正在查询病人列表...') });
		var PatList = $cm({
			ClassName: "DHCHAI.IRS.BPSurverySrv",
			QueryName: "QryBPPatList",
			aIntputs: inputParams + RepStatus,
			aSearch: "2",
			page: 1,
			rows: 9999
		}, false);
		if (!PatList || !PatList.rows || PatList.rows.length == 0) {
			$.messager.progress('close');
			$.messager.alert($g("提示"), $g('没有可导出的病人数据！'), 'info');
			return false;
		}
		$.messager.progress({ title: $g('提示'), msg: $g('正在导出 ' + PatList.rows.length + ' 个病人...') });
		// 逐病人组装数据行
		var dataRows = [];
		for (var p = 0; p < PatList.rows.length; p++) {
			var pat = PatList.rows[p];
			var rowValues = [];
			// 患者基本信息（QryBPPatList 行直接携带全部字段，无需逐个查询）
			for (var i = 0; i < baseMap.length; i++) {
				rowValues.push(pat[baseMap[i][1]] || '');
			}
			// 报告模板字段值（读已保存数据）
			var ext = $cm({
				ClassName: "DHCHAI.IRS.ComTempRepSrv",
				QueryName: "QryExpExtInfo",
				aRepID: pat.BPSurvID,
				rows: 999
			}, false);
			var extMap = {};
			if (ext && ext.rows) {
				for (var e = 0; e < ext.rows.length; e++) {
					extMap[parseInt(ext.rows[e].Code)] = ext.rows[e];
				}
			}
			for (var f = 0; f < fieldDefs.length; f++) {
				var rec = extMap[fieldDefs[f].code];
				rowValues.push(rec ? GetSavedValue(rec) : '');
			}
			dataRows.push(rowValues);
		}
		$.messager.progress('close');
		// 生成 CSV（标题行 + 每病人一行）
		var csv = '\ufeff';
		csv += CsvLine(headers) + '\r\n';
		for (var r = 0; r < dataRows.length; r++) {
			csv += CsvLine(dataRows[r]) + '\r\n';
		}
		var fname = '血透个案登记表_全部病人_' + BPTodayStr() + '.csv';
		var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
		if (navigator.msSaveBlob) {
			navigator.msSaveBlob(blob, fname);
		} else {
			var a = document.createElement('a');
			a.href = URL.createObjectURL(blob);
			a.download = fname;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		}
		$.messager.popover({ msg: $g('导出成功！') + '（' + dataRows.length + '人）', type: 'success', timeout: 2000 });
		return true;
	}
}

// ============ 导出辅助函数 ============
// 按数据类型取模板字段的显示值
function GetFieldDisplayValue(itemId, itemCode, dataType) {
	try {
		// 文本/长文本/大文本/数值
		if ((dataType == 'T') || (dataType == 'TL') || (dataType == 'TB') || (dataType == 'N0') || (dataType == 'N1')) {
			return $.trim($('#' + itemId).val() || '');
		}
		// 日期
		if (dataType == 'DD') {
			return $.trim($('#' + itemId).datebox('getValue') || '');
		}
		// 下拉
		if (dataType == 'S') {
			return $.trim($('#' + itemId).combobox('getText') || '');
		}
		// 单选字典/长字典/是否/有无
		if ((dataType == 'DS') || (dataType == 'DSL') || (dataType == 'B1') || (dataType == 'B2')) {
			return GetCheckedDisplay(itemCode, false);
		}
		// 单选+自定义文本
		if (dataType == 'DST') {
			return GetCheckedDisplay(itemCode, true);
		}
		// 多选字典/长字典
		if ((dataType == 'DB') || (dataType == 'DBL')) {
			return GetCheckedDisplay(itemCode, false);
		}
	} catch (e) {}
	return '';
}

// 取勾选项的显示文本（取不到时回退为选项值，多项用、连接）
function GetCheckedDisplay(itemCode, withExt) {
	// 策略1: name 用原始代码
	var val = readCheckedInputs("input[name='" + itemCode + "']:checked", withExt);
	if (val != '') { return val; }
	// 策略2: name 用整数代码（页面保存逻辑同款）
	var intCode = parseInt(itemCode);
	if (String(intCode) != itemCode) {
		val = readCheckedInputs("input[name='" + intCode + "']:checked", withExt);
		if (val != '') { return val; }
	}
	// 策略3: 按 id 前缀兼容（HUI radio id = 项目码+字典ID）
	val = readCheckedInputs("input[type='radio'][id^='" + intCode + "']:checked", withExt);
	return val;
}

function readCheckedInputs(selector, withExt) {
	var val = '';
	$(selector).each(function () {
		var t = $.trim($(this).next().text());
		var piece = (t != '') ? t : $(this).val();
		if (withExt) {
			var ext = $.trim($(this).next().next().val() || '');
			if (ext != '') { piece = piece + ' ' + ext; }
		}
		val = val + (val == '' ? '' : '、') + piece;
	});
	return val;
}

// CSV 行（单元格双引号包裹 + 转义）
function CsvLine(arr) {
	var line = [];
	for (var i = 0; i < arr.length; i++) {
		var v = arr[i] == null ? '' : String(arr[i]);
		line.push('"' + v.replace(/"/g, '""') + '"');
	}
	return line.join(',');
}

// 取后端已保存值的显示文本（优先描述）
function GetSavedValue(rec) {
	if (rec.ResultDesc) { return rec.ResultDesc; }
	if (rec.ResultTxt) { return rec.ResultTxt; }
	if (rec.ResultList) { return rec.ResultList; }
	if (rec.ResultCode) { return rec.ResultCode; }
	if (rec.ResultID) { return rec.ResultID; }
	return '';
}

// 文件名日期 yyyyMMdd
function BPTodayStr() {
	var d = new Date();
	var m = d.getMonth() + 1;
	var day = d.getDate();
	return '' + d.getFullYear() + (m < 10 ? '0' + m : '' + m) + (day < 10 ? '0' + day : '' + day);
}

