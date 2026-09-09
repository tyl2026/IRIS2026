/**
 * 模块:    发退药扫码上传查询
 * 编写日期: 2025-08-18
 * 编写人:  chengshuo
 */
var SessionLoc = session['LOGON.CTLOCID'];
var HospId = session['LOGON.HOSPID'];
var SessionUser = session['LOGON.USERID'];
$(function () {
    InitDict();
    InitGridInsu();
    $HUI.linkbutton('#btn-find', {
        onClick: function () {
            Query();
        }
    });
    $HUI.linkbutton('#btn-scancode', {
        onClick: function () {
            RepairCode();
        }
    });
    $HUI.linkbutton('#btn-clear', {
        onClick: function () {
            Clear();
        }
    });

    // 登记号回车事件
    $('#txtPatNo').on('keypress', function (event) {
        if (window.event.keyCode == '13') {
            var patNo = $.trim($('#txtPatNo').val());
            if (patNo != '') {
                patNo = tkMakeServerCall('PHA.DTC.COM.Method', 'FullPatNo', patNo);
                $('#txtPatNo').val(patNo);
                Query();
            }
        }
    });
    InitDlvGrid();
});



function InitDict() {
    var retDate = tkMakeServerCall('PHA.FACE.TPS.INSUTE.LogQuery', 'GetDate');
    $('#StartDate, #EndDate').datebox('setValue', retDate);
    
    $HUI.combobox('#cmbChFlag', {
        panelHeight: 'auto',
        data: [{
                value: 'A',
                text: '全部',
                'selected': true
            }, {
                value: '',
                text: '未上传',
                
            }, {
                value: 'Y',
                text: '上传成功'
            },
            {
                value: 'N',
                text: '上传失败',
                
            },
        ],
        valueField: 'value',
        textField: 'text',
        onSelect: function (data) {
            //Query();
        }
    });
    $HUI.combobox('#cmbIntrType', {
        panelHeight: 'auto',
        data: [{
                value: '',
                text: '全部',
                'selected': true
            }, {
                value: 'F',
                text: '门诊发药'
            }, {
                value: 'H',
                text: '门诊退药'
            }, {
                value: 'P',
                text: '住院发药'
            }, {
                value: 'Y',
                text: '住院退药'
            }
        ],
        valueField: 'value',
        textField: 'text',
        onSelect: function (data) {
            //Query();
        }
    });

    $HUI.combobox('#cmbHospital', {
        panelHeight: 'auto',
        url: $URL + '?ResultSetType=Array&ClassName=PHA.STORE.Org&QueryName=CTHospital',
        valueField: 'RowId',
        textField: 'Description',
        onSelect: function (data) {
            //Query();
        },
        onLoadSuccess: function (row) {
            $(this).combobox("setValue", HospId);
        }
    });

    $HUI.combobox('#cmbTypeManf', {
        panelHeight: 'auto',
        data: [{
                value: '',
                text: '全部',
                'selected': true
            }, {
                value: '1',
                text: '国家医保'
            }
        ],
        valueField: 'value',
        textField: 'text',
        onSelect: function (data) {
            //Query();
        }
    });

    $HUI.combobox('#cmbSelType', {
        panelHeight: 'auto',
        data: [{
                value: '1',
                text: '医保结算'
            }, {
                value: '2',
                text: '自费结算'
            }
        ],
        valueField: 'value',
        textField: 'text',
        onSelect: function (data) {
            //Query();
        }
    });

    $HUI.combobox('#cmbScanStatus', {
        panelHeight: 'auto',
        data: [{
                value: 'Y',
                text: '已扫码'
            }, {
                value: 'N',
                text: '未扫码'
            }, {
                value: 'C',
                text: '无码药品'
            }
        ],
        valueField: 'value',
        textField: 'text',
        onSelect: function (data) {
            //Query();
        }
    });

    $HUI.combobox('#cmbAdmType', {
        panelHeight: 'auto',
        data: [{
                value: 'O',
                text: '门诊'
            }, {
                value: 'E',
                text: '急诊'
            }, {
                value: 'I',
                text: '住院'
            }, {
                value: 'H',
                text: '其它'
            }
        ],
        valueField: 'value',
        textField: 'text',
        onSelect: function (data) {
            //Query();
        }
    });
    
	$HUI.combobox('#cmbStatType', {
        panelHeight: 'auto',
        data: [{
                value: 'Disp',
                text: '按发药',
                'selected': true
            }, {
                value: 'Settle',
                text: '按结算'
            }
        ],
        valueField: 'value',
        textField: 'text',
        onSelect: function (data) {
            // Query();
        }
    });
    
    $HUI.combobox('#cmbDspStatus', {
        panelHeight: 'auto',
        data: [{
                value: 'A',
                text: '全部',
                'selected': true
            }, {
                value: 'C',
                text: '已发药'
            },  {
                value: 'TC',
                text: '未发药'
            }
        ],
        valueField: 'value',
        textField: 'text',
        onSelect: function (data) {
            //Query();
        }
    });
    
    
    $HUI.combobox('#cmbPhaLocId', {
        panelHeight: 'auto',
        url: $URL + '?ResultSetType=Array&ClassName=PHA.STORE.Org&QueryName=Pharmacy&HospId=' + HospId,
        valueField: 'RowId',
        textField: 'Description',
        onSelect: function (data) {
            //Query();
        }
    });

    //医嘱子类
    $HUI.combobox('#cmbArcItmCat', {
        panelHeight: 'auto',
        url: $URL + '?ResultSetType=Array&ClassName=PHA.DTC.COM.Store&QueryName=ArcCat',
        valueField: 'RowId',
        textField: 'Description',
        onSelect: function (data) {
            //Query();
        }
    });

    //药品名称lookup
    $("#cmbgridInci").lookup({
        mode: 'remote',
        panelWidth: '600',
        url: $URL,
        pagination: true,
        queryParams: {
            ClassName: "PHA.STORE.Drug",
            QueryName: "INCItm"
        },
        onBeforeLoad: function (param) {
            param.QText = param.q;
        },
        onSelect: function (rowIndex, rowData) {},
        idField: "inciId",
        textField: "inciDesc",
        columns: [
            [{
                    field: "inciCode",
                    title: "代码",
                    width: 150
                }, {
                    field: "inciDesc",
                    title: "名称",
                    width: 428
                }, {
                    field: "inciId",
                    title: "inciId",
                    width: 50,
                    hidden: true
                }
            ]
        ]
    });
}

// todo
function InitGridInsu() {
    var columns = [
        [ {
            field: "logId",
            title: '日志ID',
            width: 100,
            halign: 'center',
            align: 'center',
            hidden:true
        }, {
            field: "type",
            title: 'intr',
            width: 80,
            halign: 'center',
            align: 'center',
            hidden:true
        },{
            field: "intrTypeDesc",
            title: '业务类型',
            width: 80,
            halign: 'center',
            align: 'center',
        }, {
            field: "intr",
            title: '台账id',
            width: 120,
            halign: 'center',
            align: 'center'
        }, {
            field: "inText",
            title: '入参',
            width: 120,
            align: 'center',
            formatter: setInputInfoFormatter
        },{
            field: 'outText',
            title: '出参',
            width: 120,
            align: 'center',
            formatter: setOutputInfoFormatter
        }, {
            field: "checkFlag",
            title: 'HIS上传状态',
            width: 100,
            halign: 'center',
            align: 'center',
            formatter: function(value, row, index) {
                if (value == "Y") {
                    return '<span style="color:green">成功</span>';
                }else if (value == "N") {
                    return '<span style="color:red">失败</span>';
                } else {
                    return '<span style="">未上传</span>';
                }
            }
        }, {
            field: "insuCode",
            title: '医保编码',
            width: 120,
            halign: 'center',
            align: 'center'
        }, {
            field: "insuDesc",
            title: '医保名称',
            width: 150,
            halign: 'center',
            align: 'left'
        }, {
            field: "scanFlag",
            title: '扫码情况',
            width: 100,
            halign: 'center',
            align: 'left',
            formatter: function (value, row, index) {
                if (value == "0") {
                    text = "未扫码";
                    bgcolor = "#FF6565";
                } else if (value == "1") {
                    text = "已扫码";
                    bgcolor = "#90EE90";
                } else if (value == "C") {
                    text = "无码药品";
                    bgcolor = "#A020F0";
                } else {
                    text = "";
                    bgcolor = "";
                }
                return ColStateHtml(bgcolor, text)
            }
        },{
            field: "traceCodeInfo",
            title: '追溯码信息',
            width: 200,
            halign: 'center',
            align: 'left',
            hidden: true
        }, {
            field: "patNo",
            title: '登记号',
            width: 120,
            halign: 'center',
            align: 'center'
        }, {
            field: "patName",
            title: '患者姓名',
            width: 100,
            halign: 'center',
            align: 'center'
        }, {
            field: "setlId",
            title: '结算ID',
            width: 200,
            halign: 'center',
            align: 'center'
        }, {
            field: "mdtrtSn",
            title: '就医流水号',
            width: 240,
            halign: 'center',
            align: 'center'
        }, {
            field: "admTypeDesc",
            title: '就诊类型',
            width: 100,
            halign: 'center',
            align: 'center'
        }, {
            field: "trdnFlag",
            title: '拆零标志',
            width: 80,
            halign: 'center',
            align: 'center',
            formatter: function(value) {
                return value == "Y" ? "是" : "否";
            }
        }, {
            field: "setlTypeDesc",
            title: '结算类型',
            width: 100,
            halign: 'center',
            align: 'center'
        }, {
            field: "dlvCall",
            title: '供应商上传医保码',
            width: 130,
            halign: 'center',
            align: 'center',
            formatter: function (value, row, index) {
                return "<a href='javascript:void(0)' style='display:inline-block;margin:2px 4px;padding:4px 14px;color:#fff;background:#1E90FF;border-radius:3px;text-decoration:none;font-size:12px;line-height:1.2;white-space:nowrap;letter-spacing:1px;' onmouseover=\"this.style.background='#409EFF'\" onmouseout=\"this.style.background='#1E90FF'\" onclick='Call3563(" + index + ")'>3563调用</a>";
            }
        }, {
            field: "oeore",
            title: 'oeore',
            width: 100,
            halign: 'center',
            align: 'center',
            hidden:true
        }
    ]
    ];
    var dataGridOption = {
        url: $URL,
        queryParams: {
            ClassName: "PHA.DTC.Query.DispScan",
            QueryName: "GetDrugScanInfo"
        },
        toolbar: "#gridIncItmBar", //保持不改变高度
        pageNumber: 1,
        pageSize: 100,
        pageList: [100, 300, 500, 1000],
        fitColumns: false,
        fit: true,
        rownumbers: true,
        columns: columns,
        onClickRow: function (rowIndex, rowData) {},
        singleSelect: true,
        onLoadSuccess: function () {}
    };
    DHCPHA_HUI_COM.Grid.Init("gridInsuData", dataGridOption);
}

//工具函数-以HTML的形式显示扫描状态
function ColStateHtml(bgcolor, text) {
    var stateHtml = "<div style='padding:1px;background-color:" + bgcolor + ";border-radius:3px;text-align:center;'>";
    stateHtml += "	<label style='color:white;font-weight:600;'>" + text + "</label>";
    stateHtml += "</div>";
    return stateHtml;
}

/// 查询
function Query() {
    var startDate = $('#StartDate').datebox('getValue');
    var endDate = $('#EndDate').datebox('getValue');
    var chFlag = $('#cmbChFlag').combobox('getValue');
    var batchno = $('#txtbatchno').val().trim();
    var hospId = $('#cmbHospital').combobox('getValue');
    var selType = $('#cmbSelType').combobox('getValue') || '';
    var admType = $('#cmbAdmType').combobox('getValue') || '';
    var scanStatus = $('#cmbScanStatus').combobox('getValue') || '';
    var phaLocId = $('#cmbPhaLocId').combobox('getValue') || '';
    var incidesc = $.trim($('#cmbgridInci').lookup('getText')) || '';
    var patNo = $('#txtPatNo').val();
    var intrType = $('#cmbIntrType').combobox('getValue') || ''; // 业务类型
    var mdtrtSn = $('#txtMdtrtSn').val().trim(); // 就医流水号
    var setlId = $('#txtSetld').val().trim(); // 结算ID
    var statType = $('#cmbStatType').combobox('getValue') || ''; // 日期类型 发药/结算
    var dspStatus = $('#cmbDspStatus').combobox('getValue') || '';
    var arcItmCat = $('#cmbArcItmCat').combobox('getValue') || ''; // 医嘱子类
    
    var params = startDate + '^' + endDate + '^' + chFlag + '^' + batchno + '^' + hospId +
    		 '^' + selType + '^' + admType + '^' + scanStatus + '^' + phaLocId + '^' + incidesc + 
    		 '^' + patNo + '^' + intrType + '^' + mdtrtSn + '^' + setlId + '^' + statType + 
    		 '^' + dspStatus + '^' + arcItmCat ;
        
    $('#gridInsuData').datagrid('query', {
        inputStr: params
    });
}




/// 清屏
function Clear() {
   var retDate = tkMakeServerCall('PHA.FACE.TPS.INSUTE.LogQuery', 'GetDate');
    $('#StartDate, #EndDate').datebox('setValue', retDate);
    $('#cmbHospital').combobox('setValue', HospId);
    $('#cmbPhaLocId').combobox('setValue', '');
    $('#cmbArcItmCat').combobox('setValue', '');
    $('#cmbSelType').combobox('setValue', '');
    $('#cmbIntrType').combobox('setValue', ''); 
    $('#cmbScanStatus').combobox('setValue', '');
    $('#cmbAdmType').combobox('setValue', '');
    $('#cmbChFlag').combobox('setValue', 'N');
    $('#txtbatchno').val('');
    $('#txtMdtrtSn').val(''); 
    $('#txtSetld').val(''); 
    $('#cmbgridInci').lookup('setText', '');
    $('#cmbgridInci').lookup('clear');
    $('#txtPatNo').val('');
    $('#gridInsuData').datagrid('loadData', []);
    $('#cmbStatType').combobox('setValue', 'Disp');
    $('#cmbDspStatus').combobox('setValue', 'A');
}

function setInputInfoFormatter(value, row, index) {
    var nfhml = "<span class='linkinfo' onclick='showInputJson(" + index + ")'>入参详情</span>";
    return nfhml;
}

function setOutputInfoFormatter(value, row, index) {
    var nfhml = "<span class='linkinfo' onclick='showOutJson(" + index + ")'>出参详情</span>";
    return nfhml;
}

function showInputJson(index) {
    $("#info").html("");
    var rowData = $('#gridInsuData').datagrid('getRows')[index];
    var logId = rowData.logId;
    if (logId == '') {
		$.messager.alert("温馨提示", "未在HIS上传，没有入参", 'info');  
		return;  
	} else {
	    var value = tkMakeServerCall('PHA.FACE.TPS.INSUTE.LogQuery', 'GetLogInText', logId);
	    try {
	        var ret = JSON.stringify(JSON.parse(value), null, 4);
	    } catch (ex) {
	        var ret = rowData.Text;
	    }
    }
    $("#info").html("<pre id='copyInfo'>" + ret + "</pre>");
    $('#InfoWin').dialog("setTitle", "入参");
    $('#InfoWin').dialog("open");
}

function showOutJson(index) {
    $("#info").html("");
    var rowData = $('#gridInsuData').datagrid('getRows')[index];
    var value = rowData.outText;
    try {
        var ret = JSON.stringify(JSON.parse(value), null, 4);
    } catch (ex) {
        var ret = value;
    }
    $("#info").html("<pre id='copyInfo'>" + ret + "</pre>");
    $('#InfoWin').dialog("setTitle", "出参");
    $('#InfoWin').dialog("open");
}

function RepairCode() {
	var gridSel = $("#gridInsuData").datagrid("getSelected") || "";
    if (gridSel == "") {
        $.messager.alert("温馨提示", "请选择数据", 'info');
        return;
    }
    
	
	ShowTraceCodeModal({
		BsId: '',   //业务主键ID，如果是多个业务主键可以用^拼接
		BsType: gridSel.type,   			  //业务类型，同步台账业务类型
		BsReScan: 'Y',			  //是否为补追溯码弹框,
		CloseFn:''	,			 //窗口关闭回调函数
		BsOeoreStr: gridSel.oeore,	   //执行记录ID串，多个业务执行记录用^拼接
		BsLocId: session['LOGON.CTLOCID']				// 科室ID，用以取非session科室的参数设置
	})
	
}

/// 3563配送明细弹窗表格初始化
function InitDlvGrid() {
    // csp 未包含弹窗时跳过,不影响主页面功能
    if ($('#gridDlvData').length == 0) {
        return;
    }
    var columns = [
        [{
            field: "VendorName",
            title: '供应商',
            width: 220,
            halign: 'center',
            align: 'left'
        }, {
            field: "SerialNo",
            title: '配送批次流水号',
            width: 140,
            halign: 'center',
            align: 'center'
        }, {
            field: "InsuCode",
            title: '医保码',
            width: 200,
            halign: 'center',
            align: 'center',
            formatter: function (value, row, index) {
                // 四档颜色: 一致+同一药品浅绿 / 一致+非同一药品浅黄 / 同一药品不一致浅红 / 其他无色
                var bg = '';
                var tip = '';
                if (row.NameSame == 1 && row.CodeSame == 1) {
                    bg = '#CCFFCC';
                    tip = '医保码一致且同一药品';
                } else if (row.NameSame == 0 && row.CodeSame == 1) {
                    bg = '#FFFFCC';
                    tip = '医保码一致但非同一药品';
                } else if (row.NameSame == 1 && row.CodeSame == 0) {
                    bg = '#FFCCCC';
                    tip = '同一药品但医保码不一致';
                }
                if (bg != '') {
                    return "<span style='background-color:" + bg + ";padding:1px 4px;border-radius:2px;' title='" + tip + "'>" + value + "</span>";
                }
                return value;
            }
        }, {
            field: "HisInsuCode",
            title: 'HIS上传医保码',
            width: 200,
            halign: 'center',
            align: 'center',
            formatter: function (value, row, index) {
                // 四档颜色(与医保码列一致)
                var bg = '';
                var tip = '';
                if (row.NameSame == 1 && row.CodeSame == 1) {
                    bg = '#CCFFCC';
                    tip = '医保码一致且同一药品';
                } else if (row.NameSame == 0 && row.CodeSame == 1) {
                    bg = '#FFFFCC';
                    tip = '医保码一致但非同一药品';
                } else if (row.NameSame == 1 && row.CodeSame == 0) {
                    bg = '#FFCCCC';
                    tip = '同一药品但医保码不一致';
                }
                if (bg != '') {
                    return "<span style='background-color:" + bg + ";padding:1px 4px;border-radius:2px;' title='" + tip + "'>" + value + "</span>";
                }
                return value;
            }
        }, {
            field: "HisInsuName",
            title: 'HIS医保名称',
            width: 260,
            halign: 'center',
            align: 'left'
        }, {
            field: "InsuName",
            title: '药品名称',
            width: 260,
            halign: 'center',
            align: 'left'
        }, {
            field: "InsuSpec",
            title: '规格',
            width: 150,
            halign: 'center',
            align: 'left'
        }, {
            field: "IngrDate",
            title: '入库时间',
            width: 120,
            halign: 'center',
            align: 'center'
        }
    ]
    ];
    var dataGridOption = {
        fit: true,
        fitColumns: false,
        rownumbers: true,
        singleSelect: true,
        columns: columns
    };
    $('#gridDlvData').datagrid(dataGridOption);
}

/// 3563弹窗列宽按内容自适应(中文按2字符宽估算)
function AutoFitDlvWidth() {
    var grid = $('#gridDlvData');
    if (grid.length == 0) {
        return;
    }
    var cols = grid.datagrid('options').columns[0];
    var rows = grid.datagrid('getRows');
    for (var i = 0; i < cols.length; i++) {
        var col = cols[i];
        var maxLen = (col.title || '').length;
        for (var j = 0; j < rows.length; j++) {
            var v = rows[j][col.field];
            if (v == null) {
                v = '';
            }
            v = String(v);
            var len = 0;
            for (var k = 0; k < v.length; k++) {
                len += v.charCodeAt(k) > 255 ? 2 : 1;
            }
            if (len > maxLen) {
                maxLen = len;
            }
        }
        var w = maxLen * 8 + 24;
        if (w < 70) {
            w = 70;
        }
        if (w > 350) {
            w = 350;
        }
        col.width = w;
    }
    grid.datagrid('resize');
}

/// 3563调用：取当前行上传日志入参中的配送批次流水号,调用3563接口获取配送明细并弹窗展示(去重后)
function Call3563(index) {
    var rowData = $('#gridInsuData').datagrid('getRows')[index];
    var logId = rowData.logId || '';
    if (logId == '') {
        $.messager.alert("温馨提示", "该记录无上传日志，无法获取配送批次流水号，不能调用3563！", 'info');
        return;
    }
    var ret = tkMakeServerCall('PHA.DTC.Query.DispScan', 'Get3563DlvData', logId, HospId, SessionLoc, SessionUser);
    var retObj = null;
    try {
        retObj = JSON.parse(ret);
    } catch (ex) {
        $.messager.alert("提示", "3563接口返回解析失败！", 'error');
        return;
    }
    if (retObj.code != 0) {
        $.messager.alert("提示", retObj.msg || "调用3563失败！", 'error');
        return;
    }
    $('#gridDlvData').datagrid('loadData', retObj.rows || []);
    AutoFitDlvWidth();
    $('#DlvWin').dialog('setTitle', '3563配送信息（配送批次流水号：' + retObj.serialNo + '）');
    $('#DlvWin').dialog('open');
}