/**
 * 基数药维护
 * scripts/pha/op/v4/basemed.js
 * 2021-11-19 Huxt 修改
 * 2026-08-22 AI 增加: 分页、导出CSV、Excel导入
 */
var GridCmbInci = "";
var GridCmbInst = "";
var GridCmbDocLoc = "";
var GridCmbUseLoc = "";
var GridCmbExeLoc = "";
$(function () {
	InitHosp();
	InitDict();
	InitGridDict();
	InitEvent();
	InitBaseMedGrid();
	HelpInfo();
})
function InitDict() {
	PHA.ComboBox("conBaseType", {
		required: false,
		width: 150,
		panelHeight: 'auto',
		data: [{
				RowId: "",
				Description: "全部 "
			}, {
				RowId: "O",
				Description: "门诊 "
			}, {
				RowId: "I",
				Description: "住院"
			}
		]
	})
	$('#conBaseType').combobox('setValue', "");
}
function InitGridDict() {
	// 类型
	GridCmdType = PHA.EditGrid.ComboBox({
		required: true,
		width: 150,
		panelHeight: 'auto',
		data: [{
				RowId: "O",
				Description: "门诊 "
			}, {
				RowId: "I",
				Description: "住院"
			}
		]
	});
	// 医嘱项
	var options = {
		panelWidth: '500',
		required: true,
		onSelect: function (index, rowData) {
			var gridSelect = $('#gridBaseMed').datagrid('getSelected');
			gridSelect.arcItmRowId = rowData.arcItmRowId;
		},
		onBeforeLoad: function (param) {
			if (param.q == undefined) {
				param.q = $('#gridBaseMed').datagrid("getSelected").arcItmDesc;
			}
			param.QText = param.q;
			param.HospId = PHA_COM.Session.HOSPID;
		}
	};
	options = $.extend({}, PHAOP_STORE.ArcItm(), options);
	GridCmbArc = PHA.EditGrid.ComboGrid(options);
	
	// 用法
	GridCmbInst = PHA.EditGrid.ComboBox({
		required: false,
		tipPosition: 'top',
		width: 150,
		url: PHAOP_STORE.Instruction().url,
		defaultFilter: 5,
		mode: 'remote',
		onSelect: function (index, rowData) {
			var editIndex = $("#gridBaseMed").datagrid('options').editIndex;
			if (editIndex == undefined) {
				return;
			}
			var instId = $(this).combobox("getValue"); //当前combobox的值
			if ((instId == "") || (instId == null)) {
				return;
			}
			var gridSelect = $('#gridBaseMed').datagrid("getSelected");
			gridSelect.instRowId = instId;
		},
		onBeforeLoad: function (param) {
			if (param.q == undefined) {
				param.q = $('#gridBaseMed').datagrid("getSelected").instDesc;
			}
			param.QText = param.q;
			param.HospId = PHA_COM.Session.HOSPID;
		}
	});
	
	// 开单科室
	GridCmbDocLoc = PHA.EditGrid.ComboBox({
		required: true,
		tipPosition: 'top',
		url: PHAOP_STORE.CTLOC().url ,
		defaultFilter: 5,
		mode: 'remote',
		onSelect: function (index, rowData) {
			var editIndex = $("#gridBaseMed").datagrid('options').editIndex;
			if (editIndex == undefined) {
				return;
			}
			var docLocRowId = $(this).combobox("getValue"); //当前combobox的值
			if ((docLocRowId == "") || (docLocRowId == null)) {
				return;
			}
			var gridSelect = $('#gridBaseMed').datagrid("getSelected");
			gridSelect.docLocRowId = docLocRowId;
		},
		onBeforeLoad: function (param) {
			if (param.q == undefined) {
				param.q = $('#gridBaseMed').datagrid("getSelected").docLocDesc;
			}
			param.QText = param.q;
			param.HospId = PHA_COM.Session.HOSPID;
		}
	});
	// 取药科室(原使用科室)
	GridCmbUseLoc = PHA.EditGrid.ComboBox({
		required: true,
		tipPosition: 'top',
		url: PHAOP_STORE.CTLOC().url,
		defaultFilter: 5,
		mode: 'remote',
		onSelect: function (index, rowData) {
			var editIndex = $("#gridBaseMed").datagrid('options').editIndex;
			if (editIndex == undefined) {
				return;
			}
			var useLocRowId = $(this).combobox("getValue"); //当前combobox的值
			if ((useLocRowId == "") || (useLocRowId == null)) {
				return;
			}
			var gridSelect = $('#gridBaseMed').datagrid("getSelected");
			gridSelect.useLocRowId = useLocRowId;
		},
		onBeforeLoad: function (param) {
			if (param.q == undefined) {
				param.q = $('#gridBaseMed').datagrid("getSelected").useLocDesc;
			}
			param.QText = param.q;
			param.HospId = PHA_COM.Session.HOSPID;
		}
	});
	// 使用科室/执行科室
	GridCmbExeLoc = PHA.EditGrid.ComboBox({
		required: false,
		tipPosition: 'top',
		url: PHAOP_STORE.CTLOC().url,
		defaultFilter: 5,
		mode: 'remote',
		onSelect: function (index, rowData) {
			var editIndex = $("#gridBaseMed").datagrid('options').editIndex;
			if (editIndex == undefined) {
				return;
			}
			var exeLocRowId = $(this).combobox("getValue"); //当前combobox的值
			if ((exeLocRowId == "") || (exeLocRowId == null)) {
				return;
			}
			var gridSelect = $('#gridBaseMed').datagrid("getSelected");
			gridSelect.exeLocRowId = exeLocRowId;
		},
		onBeforeLoad: function (param) {
			if (param.q == undefined) {
				param.q = $('#gridBaseMed').datagrid("getSelected").exeLocDesc;
			}
			param.QText = param.q;
			param.HospId = PHA_COM.Session.HOSPID;
		}
	});
}

function InitEvent() {
	//基数药维护
	$('#btnFind').on('click', Query);
	$('#btnAdd').on('click', function () {
		$('#gridBaseMed').datagrid('addNewRow', {
			editField: 'baseMedType'
		});
	});
	$('#btnSave').on('click', SaveBaseMed);
	$('#btnDelete').on('click', DelBaseMed);
	$('#btnExport').on('click', ExportBaseMed);
	$('#btnImport').on('click', ImportBaseMed);
}

function InitBaseMedGrid() {
	var columns = [[{
				field: 'baseMedRowId',
				title: '门诊药房id',
				hidden: true,
				width: 100
			}, {
				field: 'baseMedType',
				title: '类型',
				descField: 'baseMedTypeDesc',
				width: 80,
				editor: GridCmdType,
				formatter: function (value, row, index) {
					return row.baseMedTypeDesc;
				}
			}, {
				field: 'baseMedTypeDesc',
				title: '类型',
				width: 150,
				hidden: true
			}, {
				field: 'arcItmDesc',
				title: '药品名称',
				descField: 'arcItmDesc',
				width: 250,
				editor: GridCmbArc,
				formatter: function (value, row, index) {
					return row.arcItmDesc;
				}
			}, {
				field: 'arcItmRowId',
				title: '药品名称',
				hidden: true,
				width: 250
			}, {
				field: 'instDesc',
				title: '用法',
				descField: 'instDesc',
				width: 150,
				editor: GridCmbInst,
				formatter: function (value, row, index) {
					return row.instDesc;
				}
			}, {
				field: 'instRowId',
				title: '用法描述id',
				hidden: true,
				width: 150
			}, {
				field: 'docLocDesc',
				title: '开单科室',
				descField: 'docLocDesc',
				width: 200,
				editor: GridCmbDocLoc,
				formatter: function (value, row, index) {
					return row.docLocDesc;
				}
			}, {
				field: 'docLocRowId',
				title: '开单科室id',
				hidden: true,
				width: 200
			}, {
				field: 'useLocDesc',
				title: '取药科室',
				descField: 'useLocDesc',
				width: 200,
				editor: GridCmbUseLoc,
				formatter: function (value, row, index) {
					return row.useLocDesc;
				}
			}, {
				field: 'useLocRowId',
				title: '取药科室Id',
				hidden: true,
				width: 200
			}, {
				field: 'exeLocDesc',
				title: '使用科室',
				descField: 'exeLocDesc',
				width: 200,
				editor: GridCmbExeLoc,
				formatter: function (value, row, index) {
					return row.exeLocDesc;
				}
			}, {
				field: 'exeLocRowId',
				title: '使用科室Id',
				hidden: true,
				width: 200
			}, {
				field: 'remarks',
				title: '备注',
				width: 200,
				editor: {
					type: 'validatebox'
				}
			}
		]
	];
	var dataGridOption = {
		url: $URL,
		queryParams: {
			ClassName: 'PHA.OP.CfBase.Query',
			QueryName: 'QueryLocBaseMed',
			pJsonStr: JSON.stringify({
				hospId: PHA_COM.Session.HOSPID
			})
		},
		pagination: true,
		pageNumber: 1,
		pageSize: 20,
		pageList: [20, 50, 100, 200],
		columns: columns,
		toolbar: '#gridBaseMedGridBar',
		enableDnd: false,
		fitColumns: false,
		rownumbers: true,
		exportXls: false,
		onClickRow: function (rowIndex, rowData) {
			$(this).datagrid('endEditing');
		},
		onDblClickRow: function (rowIndex, rowData) {
			if (rowData) {
				$(this).datagrid('beginEditRow', {
					rowIndex: rowIndex,
					editField: 'arcItmDesc'
				});
			}
		},
		onLoadSuccess: function (data) {}
	};
	// 翻页: 改用原生datagrid初始化, 确保分页器生效(PHA.Grid封装不透传分页选项, 参考标识码独立维护页面写法)
	$('#gridBaseMed').datagrid(dataGridOption);
}
function InitHosp() {
	var hospComp = GenHospComp('PHA-COM-BasicDrug', '', {
		width: 280
	});
	hospComp.options().onSelect = function (rowIndex, rowData) {
		PHA_COM.Session.HOSPID = rowData.HOSPRowId;
		Query();
	};
}
function Query() {
	var pJson = {};
	pJson.hospId = PHA_COM.Session.HOSPID;
	pJson.baseMedType = $('#conBaseType').combobox("getValue"); ;
	$("#gridBaseMed").datagrid("query", {
		pJsonStr: JSON.stringify(pJson),

	});
}
function SaveBaseMed() {
	var $grid = $('#gridBaseMed');
	if ($grid.datagrid('endEditing') == false) {
		PHA.Popover({
			msg: '请先完成必填项',
			type: 'alert'
		});
		return;
	}
	var dataArr = [];
	var gridChanges = $grid.datagrid('getChanges', "updated");
	var gridChangeLen = gridChanges.length;
	for (var i = 0; i < gridChangeLen; i++) {
		var rowData = gridChanges[i];
		var docLocRowId = rowData.docLocRowId || '';
		var useLocRowId = rowData.useLocRowId || '';
		if ((docLocRowId == "") || (useLocRowId == "")) {
			continue;
		}
		var instRowId = rowData.instRowId || '';
		var instDesc = rowData.instDesc || '';
		if (instDesc == "") {
			instRowId = "";
		}
		var exeLocRowId = rowData.exeLocRowId || '';
		
		var iJson = {
			baseMedRowId: rowData.baseMedRowId || '',
			baseMedType: rowData.baseMedType || '',
			arcItmRowId: rowData.arcItmRowId || '',
			instRowId: instRowId,
			docLocRowId: docLocRowId,
			useLocRowId: useLocRowId,
			remarks: rowData.remarks || '',
			exeLocRowId: exeLocRowId
		};
		dataArr.push(iJson);
	}
	var gridChanges = $grid.datagrid('getChanges', "inserted");
	var gridChangeLen = gridChanges.length;
	for (var i = 0; i < gridChangeLen; i++) {
		var rowData = gridChanges[i];
		var docLocRowId = rowData.docLocRowId || '';
		var useLocRowId = rowData.useLocRowId || '';
		if ((docLocRowId == "") || (useLocRowId == "")) {
			continue;
		}
		var instRowId = rowData.instRowId || '';
		var instDesc = rowData.instDesc || '';
		if (instDesc == "") {
			instRowId = "";
		}
		var exeLocRowId = rowData.exeLocRowId || '';
		
		var iJson = {
			baseMedRowId: rowData.baseMedRowId || '',
			baseMedType: rowData.baseMedType || '',
			arcItmRowId: rowData.arcItmRowId || '',
			instRowId: instRowId,
			docLocRowId: docLocRowId,
			useLocRowId: useLocRowId,
			remarks: rowData.remarks || '',
			exeLocRowId: exeLocRowId,
		};
		dataArr.push(iJson);
	}
	if (dataArr.length === 0) {
		PHA.Popover({
			msg: '没有需要保存的数据',
			type: 'alert'
		});
		return;
	}
	var retJson = $.cm({
		ClassName: 'PHA.OP.Data.Api',
		MethodName: 'HandleInOne',
		pClassName: 'PHA.OP.CfBase.OperTab',
		pMethodName: 'SaveBaseMed',
		pJsonStr: JSON.stringify(dataArr)
	}, false);

	if (retJson.success === 'N') {
		msg = PHAOP_COM.DataApi.Msg(retJson)
			PHA.Alert('提示', msg, 'warning');
		return;
	} else {
		PHA.Popover({
			msg: '保存成功',
			type: 'success'
		});
	}
	$grid.datagrid('reload');
}
function DelBaseMed() {
	var gridSelect = $('#gridBaseMed').datagrid('getSelected') || '';
	if (gridSelect == '') {
		PHA.Popover({
			msg: '请先选中需要删除的行',
			type: 'alert',
			timeout: 1000
		});
		return;
	}
	var baseMedRowId = gridSelect.baseMedRowId || '';
	if (baseMedRowId !== "") {
		var arcItmDesc = gridSelect.arcItmDesc || '';
		var dataArr = [];
		var iJson = {
			baseMedRowId: baseMedRowId,
			arcItmDesc: arcItmDesc
		};
		dataArr.push(iJson);
		var retJson = $.cm({
			ClassName: 'PHA.OP.Data.Api',
			MethodName: 'HandleInOne',
			pClassName: 'PHA.OP.CfBase.OperTab',
			pMethodName: 'DelPhBaseMed',
			pJsonStr: JSON.stringify(dataArr)
		}, false);
		if (retJson.success === 'N') {
			msg = PHAOP_COM.DataApi.Msg(retJson)
				PHA.Alert('提示', msg, 'warning');
			return;
		}
	}
	PHA.Popover({
		msg: '删除成功',
		type: 'success'
	});
	var rowIndex = $('#gridBaseMed').datagrid('getRowIndex', gridSelect);
	$('#gridBaseMed').datagrid('deleteRow', rowIndex);
}

/**
 * 导出: 按当前筛选条件(院区+类型)导出全部数据为CSV(带BOM,Excel可直接打开)
 * 含代码列(药品代码/用法代码/科室代码), 可直接修改后作为导入文件(导出->改代码->导入闭环)
 */
function ExportBaseMed() {
	var pJson = {};
	pJson.hospId = PHA_COM.Session.HOSPID;
	pJson.baseMedType = $('#conBaseType').combobox("getValue");
	$.cm({
		ClassName: 'PHA.OP.CfBase.Query',
		QueryName: 'QueryLocBaseMed',
		pJsonStr: JSON.stringify(pJson),
		ResultSetType: 'array',
		page: 1,
		rows: 999999
	}, function (rows) {
		if (!rows || rows.length === 0) {
			PHA.Popover({
				msg: '没有可导出的数据',
				type: 'alert',
				timeout: 1500
			});
			return;
		}
		var headers = ['类型', '药品代码', '药品名称', '用法代码', '用法', '开单科室代码', '开单科室', '取药科室代码', '取药科室', '使用科室代码', '使用科室', '备注'];
		var fields = ['baseMedTypeDesc', 'arcItmCode', 'arcItmDesc', 'instCode', 'instDesc', 'docLocCode', 'docLocDesc', 'useLocCode', 'useLocDesc', 'exeLocCode', 'exeLocDesc', 'remarks'];
		var BOM = '\ufeff';
		var csv = BOM + headers.join(',') + '\n';
		for (var i = 0; i < rows.length; i++) {
			var line = [];
			for (var j = 0; j < fields.length; j++) {
				var v = rows[i][fields[j]];
				if (v == null) {
					v = '';
				}
				line.push(csvEscape(v));
			}
			csv += line.join(',') + '\n';
		}
		var blob = new Blob([csv], {
			type: 'text/csv;charset=utf-8'
		});
		var d = new Date();
		var pad = function (n) {
			return (n < 10 ? '0' : '') + n;
		};
		var fileName = '基数药维护_' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '_' + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds()) + '.csv';
		if (navigator.msSaveBlob) {
			navigator.msSaveBlob(blob, fileName);
			return;
		}
		var a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	});
}

/**
 * 导入: 读取文件(.xls/.xlsx/.csv), 按代码匹配(药品代码/科室代码), 已存在记录跳过
 * 导出的CSV可直接修改后导入
 */
function ImportBaseMed() {
	var fileList = $('#impBaseMedFile').filebox('files');
	if (!fileList || fileList.length === 0) {
		PHA.Popover({
			msg: '请先选择导入文件(.xls/.xlsx/.csv)',
			type: 'alert',
			timeout: 1500
		});
		return;
	}
	var fileName = fileList[0].name || '';
	if (/\.csv$/i.test(fileName)) {
		ReadCsvJson(fileList[0], ImportRows);
	} else {
		if (typeof XLSX === 'undefined') {
			PHA.Popover({
				msg: '缺少Excel解析组件(xlsx.full.min.js)',
				type: 'alert',
				timeout: 1500
			});
			return;
		}
		ReadExcelJson(fileList[0], ImportRows);
	}
}

/**
 * 处理导入行(Excel/CSV解析结果统一入口)
 */
function ImportRows(excelArr) {
	if (!excelArr || excelArr.length === 0) {
		PHA.Popover({
			msg: '未读取到数据,请检查文件内容(首行为列名)',
			type: 'alert',
			timeout: 2000
		});
		return;
	}
	// 归一化列名(去首尾空格), 兼容Excel列名带空格的情况
	var normArr = [];
	for (var n = 0; n < excelArr.length; n++) {
		var src = excelArr[n];
		var dst = {};
		for (var key in src) {
			if (src.hasOwnProperty(key)) {
				dst[String(key).trim()] = src[key];
			}
		}
		normArr.push(dst);
	}
	excelArr = normArr;
	var rows = [];
	for (var i = 0; i < excelArr.length; i++) {
		var obj = excelArr[i];
		var row = {
			baseMedType: String(obj['类型'] == null ? '' : obj['类型']).trim(),
			arcItmCode: String(obj['药品代码'] == null ? '' : obj['药品代码']).trim(),
			instCode: String(obj['用法代码'] == null ? '' : obj['用法代码']).trim(),
			docLocCode: String(obj['开单科室代码'] == null ? '' : obj['开单科室代码']).trim(),
			useLocCode: String(obj['取药科室代码'] == null ? '' : obj['取药科室代码']).trim(),
			exeLocCode: String(obj['使用科室代码'] == null ? '' : obj['使用科室代码']).trim(),
			remarks: String(obj['备注'] == null ? '' : obj['备注']).trim()
		};
		// 跳过全空行(如CSV尾部空行)
		if ((row.baseMedType === '') && (row.arcItmCode === '') && (row.docLocCode === '') && (row.useLocCode === '')) {
			continue;
		}
		rows.push(row);
	}
	if (rows.length === 0) {
		// 诊断: 列出实际读到的列名, 帮助定位列名不匹配/编码问题
		var keys = [];
		var firstRow = excelArr[0] || {};
		for (var kk in firstRow) {
			if (firstRow.hasOwnProperty(kk)) {
				keys.push(kk);
			}
		}
		var hint = '文件中没有有效数据行';
		if (keys.length > 0) {
			hint += '，实际列名:[' + keys.join('|') + ']。';
		}
		hint += '请确认首行列名为:类型/药品代码/用法代码/开单科室代码/取药科室代码/使用科室代码/备注';
		hint += '（若用Excel另存过CSV，请选择"CSV UTF-8"格式另存后重试）';
		PHA.Alert('导入提示', hint, 'warning');
		return;
	}
	var pJson = {
		hospId: PHA_COM.Session.HOSPID,
		rows: rows
	};
	$.messager.progress({
		title: '提示',
		msg: '正在导入数据,请稍候...'
	});
	var retJson = $.cm({
		ClassName: 'PHA.OP.CfBase.Import',
		MethodName: 'ImportBaseMed',
		pJsonStr: JSON.stringify(pJson)
	}, false);
	$.messager.progress('close');
	if (!retJson || retJson.success === 'N') {
		PHA.Alert('导入失败', (retJson && retJson.msg) || '导入失败', 'warning');
		return;
	}
	var msgText = retJson.msg || '';
	var errRows = retJson.errRows || [];
	if (errRows.length > 0) {
		var showCnt = errRows.length > 5 ? 5 : errRows.length;
		for (var k = 0; k < showCnt; k++) {
			msgText += '<br>第' + errRows[k].row + '条:' + errRows[k].msg;
		}
		if (errRows.length > showCnt) {
			msgText += '<br>...等共' + errRows.length + '条失败,请修改后重新导入';
		}
	}
	PHA.Alert('导入结果', msgText, 'info');
	$('#impBaseMedFile').filebox('clear');
	Query();
}

/**
 * 读取Excel第一个工作表为JSON数组(首行为列名)
 */
function ReadExcelJson(file, cb) {
	var reader = new FileReader();
	reader.onload = function (e) {
		try {
			var data = new Uint8Array(e.target.result);
			var workbook = XLSX.read(data, {
				type: 'array'
			});
			var sheet = workbook.Sheets[workbook.SheetNames[0]];
			var jsonArr = XLSX.utils.sheet_to_json(sheet);
			cb(jsonArr);
		} catch (ex) {
			PHA.Popover({
				msg: '文件解析失败:' + (ex.message || ex),
				type: 'alert',
				timeout: 2000
			});
			cb([]);
		}
	};
	reader.readAsArrayBuffer(file);
}

/**
 * 读取CSV文件为JSON数组(首行为列名)
 * 策略: ①原生UTF-8解析(导出CSV即此编码) ②列名不匹配时按GBK再试(Excel另存CSV是GBK编码, XLSX/TextDecoder两种途径) ③兜底返回原生结果便于诊断
 */
function ReadCsvJson(file, cb) {
	var reader = new FileReader();
	reader.onload = function (e) {
		try {
			var bytes = new Uint8Array(e.target.result);
			// ① 原生UTF-8解析(确定性解析, 不依赖XLSX)
			var nativeResult = tableToObjects(parseCsv(utf8Decode(bytes)));
			var jsonArr = nativeResult;
			// ② 列名不匹配时按GBK再试(Excel另存的CSV是GBK编码)
			if (!hasExpectedHeaders(jsonArr)) {
				jsonArr = null;
				if (typeof XLSX !== 'undefined') {
					jsonArr = parseCsvByXlsx(bytes, {
						codepage: 936
					});
				}
				if (!hasExpectedHeaders(jsonArr)) {
					var gbkText = gbkDecode(bytes);
					if (gbkText) {
						jsonArr = tableToObjects(parseCsv(gbkText));
					}
				}
				if (!hasExpectedHeaders(jsonArr)) {
					// ③ 兜底: 返回原生解析结果(列名可能乱码, 便于诊断列名/编码问题)
					jsonArr = nativeResult;
				}
			}
			cb(jsonArr || []);
		} catch (ex) {
			PHA.Popover({
				msg: 'CSV文件解析失败:' + (ex.message || ex),
				type: 'alert',
				timeout: 2000
			});
			cb([]);
		}
	};
	reader.readAsArrayBuffer(file);
}

/**
 * 用XLSX按指定编码解析CSV字节
 */
function parseCsvByXlsx(bytes, opts) {
	try {
		var options = {
			type: 'array'
		};
		if (opts && opts.codepage) {
			options.codepage = opts.codepage;
		}
		var wb = XLSX.read(bytes, options);
		var sheet = wb.Sheets[wb.SheetNames[0]];
		return XLSX.utils.sheet_to_json(sheet, {
			defval: ''
		});
	} catch (e) {
		return null;
	}
}

/**
 * 判断解析结果是否含预期列(类型/药品代码/开单科室代码/取药科室代码 任一即可)
 */
function hasExpectedHeaders(jsonArr) {
	if (!jsonArr || jsonArr.length === 0) {
		return false;
	}
	var first = jsonArr[0];
	var expected = ['类型', '药品代码', '开单科室代码', '取药科室代码'];
	for (var k = 0; k < expected.length; k++) {
		for (var key in first) {
			if (first.hasOwnProperty(key) && (String(key).trim() === expected[k])) {
				return true;
			}
		}
	}
	return false;
}

/**
 * UTF-8字节解码(原生解析兜底用)
 */
function utf8Decode(bytes) {
	var out = '';
	var i = 0;
	var len = bytes.length;
	while (i < len) {
		var b = bytes[i];
		if (b < 0x80) {
			out += String.fromCharCode(b);
			i++;
		} else if ((b >> 5) === 0x6) {
			out += String.fromCharCode(((b & 0x1F) << 6) | (bytes[i + 1] & 0x3F));
			i += 2;
		} else if ((b >> 4) === 0xE) {
			out += String.fromCharCode(((b & 0x0F) << 12) | ((bytes[i + 1] & 0x3F) << 6) | (bytes[i + 2] & 0x3F));
			i += 3;
		} else {
			out += String.fromCharCode(b);
			i++;
		}
	}
	return out;
}

/**
 * CSV二维数组转对象数组(首行为列名, 列名去BOM/去首尾空格)
 */
function tableToObjects(table) {
	if (!table || table.length < 2) {
		return [];
	}
	var headers = table[0];
	var rows = [];
	for (var r = 1; r < table.length; r++) {
		var obj = {};
		for (var c = 0; c < headers.length; c++) {
			var h = String(headers[c] == null ? '' : headers[c]).replace(/^\ufeff/, '').trim();
			obj[h] = table[r][c] == null ? '' : table[r][c];
		}
		rows.push(obj);
	}
	return rows;
}

/**
 * GBK解码(现代浏览器TextDecoder, IE11不可用时返回空串)
 */
function gbkDecode(bytes) {
	if (typeof TextDecoder !== 'undefined') {
		try {
			return new TextDecoder('gbk').decode(bytes);
		} catch (e) {
			return '';
		}
	}
	return '';
}

/**
 * CSV文本解析(字符级, 支持引号内的逗号/换行, 自动去除UTF-8 BOM)
 */
function parseCsv(text) {
	var rows = [];
	var row = [];
	var cur = '';
	var inQuotes = false;
	var i = 0;
	var n = text.length;
	if (text.charCodeAt(0) === 0xFEFF) {
		i = 1;
	}
	while (i < n) {
		var ch = text.charAt(i);
		if (inQuotes) {
			if (ch === '"') {
				if (text.charAt(i + 1) === '"') {
					cur += '"';
					i += 2;
					continue;
				}
				inQuotes = false;
				i++;
				continue;
			}
			cur += ch;
			i++;
			continue;
		}
		if (ch === '"') {
			inQuotes = true;
			i++;
			continue;
		}
		if (ch === ',') {
			row.push(cur);
			cur = '';
			i++;
			continue;
		}
		if (ch === '\r') {
			i++;
			continue;
		}
		if (ch === '\n') {
			row.push(cur);
			cur = '';
			rows.push(row);
			row = [];
			i++;
			continue;
		}
		cur += ch;
		i++;
	}
	if ((cur !== '') || (row.length > 0)) {
		row.push(cur);
		rows.push(row);
	}
	return rows;
}

/**
 * CSV字段转义: 含逗号/引号/换行时加引号包裹
 */
function csvEscape(str) {
	str = String(str);
	if (/[",\n\r]/.test(str)) {
		return '"' + str.replace(/"/g, '""') + '"';
	}
	return str;
}

function HelpInfo() {
	$("#btnHelp").popover({
		title: '基数药维护解释',
		trigger: 'hover',
		padding: '10px',
		width: 650,
		content: '<div>'
		 + '基数药：药品在取药科室，发药在药房；取药科室定期补货。<br>'
		 + '<p class="pha-row">&emsp;&emsp;&emsp;&emsp;需满足已维护条件才可以，类型、药品、开单科室、取药科室必填</p >'
		 + '<div class="pha-row pha-line" ><a style="color:red">名词解释：</a></div>'
		 + '&emsp;&emsp;类型：住院--开单科室开立的药品在执行医嘱(医技)界面可以被取药科室查看并执行<br>'
		 + '<p class="pha-row">&emsp;&emsp;类型：门诊--下医嘱时开单科室在记录中存在则视为基数药，药房发药时向对应取药科室补货</p >'
		 + '<div class="pha-row pha-line" ><a style="color:red">操作说明：</a></div>'
		 + '&emsp;&emsp;翻页：列表分页显示，默认每页20条，可切换20/50/100/200条/页，按当前查询条件分页<br>'
		 + '&emsp;&emsp;新增：点击"新增"在列表末尾追加一行，双击行进入编辑；类型、药品、开单科室、取药科室为必填项<br>'
		 + '&emsp;&emsp;删除：选中行后点击"删除"<br>'
		 + '&emsp;&emsp;导出：按当前院区+类型筛选条件导出全部数据为CSV（UTF-8，Excel可直接打开），含药品代码/科室代码列<br>'
		 + '<p class="pha-row">&emsp;&emsp;导入：选择Excel(.xls/.xlsx)或CSV文件，药品/科室按代码匹配，已存在记录自动跳过；支持"导出→修改药品代码→导入"批量新增：导出的CSV可直接作为导入文件</p >'
		 + '</div>'
	});
}
