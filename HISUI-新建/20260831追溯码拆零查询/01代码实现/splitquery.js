/**
 * 模块:     药品追溯码拆零查询
 * 编写日期: 2024-10-26
 * 编写人:   chengshuo
 */
var SessionLoc = session['LOGON.CTLOCID'];
var SessionUser = session['LOGON.USERID'];
var SessionHosp = session['LOGON.HOSPID'];
// 待转移的拆零码记录ID串(^分隔),点击拆零转移时暂存
var gTransferCodeIds = '';
$(function () {
    InitDict();
    InitGridTraceCode();
    BtnEvent();
    $('#txtTraceCode').focus();
});

// 初始化字典
function InitDict() {
    $('#comCodeType').combobox({
        width: 150,
        valueField: 'RowId',
        textField: 'Description',
        url: $URL + '?ResultSetType=Array&ClassName=PHA.DTC.COM.Store&QueryName=GetTraceCodeType',
        onLoadSuccess: function () {
            var data = $(this).combobox('getData');
            $(this).combobox('setValue', data[0].RowId);
        }
    });

    //药品名称lookup
    $("#cmbgridInci").combogrid({
        mode: 'remote',
        panelWidth: 500,
        url: $URL,
        pagination: true,
        queryParams: {
            ClassName: "PHA.STORE.Drug",
            QueryName: "INCItm"
        },
        onBeforeLoad: function (param) {
            param.QText = param.q;
            param.Hosp = SessionHosp;
        },
        onSelect: function (rowIndex, rowData) { },
        idField: "inciId",
        textField: "inciDesc",
        columns: [
            [{
                field: "inciCode",
                title: "代码",
                width: 100
            }, {
                field: "inciDesc",
                title: "名称",
                width: 400
            }, {
                field: "inciId",
                title: "inciId",
                width: 50,
                hidden: true
            }
            ]
        ]
    });

    $('#cmbStatus').combobox({
        width: 100,
        valueField: 'RowId',
        textField: 'Description',
        data: [{
            'RowId': '1',
            'Description': '未使用'
        }, {
            'RowId': '2',
            'Description': '部分使用'
        }, {
            'RowId': 'All',
            'Description': '全部'
        }
        ],
        onLoadSuccess: function () {
            var data = $(this).combobox('getData');
            $(this).combobox('setValue', 'All');
        }
    });

    $('#cmbSplitType').combobox({
        width: 100,
        valueField: 'RowId',
        textField: 'Description',
        data: [{
            'RowId': '1',
            'Description': '集中拆零'
        }, {
            'RowId': '2',
            'Description': '业务拆零'
        }
        ],
        onLoadSuccess: function () {

        }
    });

    //拆零科室(默认本科室,可选择其他药房)
    $('#cmbLocId').combobox({
        width: 130,
        valueField: 'RowId',
        textField: 'Description',
        url: $URL + '?ResultSetType=Array&ClassName=PHA.STORE.Org&QueryName=Pharmacy&HospId=' + SessionHosp,
        onLoadSuccess: function () {
            $(this).combobox('setValue', SessionLoc);
        }
    });

    //拆零转移-药房科室
    $('#cmbTransLoc').combobox({
        width: 220,
        valueField: 'RowId',
        textField: 'Description',
        url: $URL + '?ResultSetType=Array&ClassName=PHA.STORE.Org&QueryName=Pharmacy&HospId=' + SessionHosp
    });
}

// 绑定按钮事件
function BtnEvent() {
    $('#btnFind').on('click', Query);
    $('#btnClean').on('click', Clear);
    $('#btnDet').on('click', CancelSplit);
    $('#btnTrans').on('click', TransferSplit);
    $('#txtTraceCode').on('keypress', function (event) {
        if (window.event.keyCode == "13") {
            Query();
        }
    });
}

// 追溯码信息列表
function InitGridTraceCode() {
    var columns = [
        [
            {
                field: 'itmChk',
                checkbox: true
            }, {
                field: 'codeId',
                title: 'codeId',
                align: 'center',
                width: 60,
                hidden: true
            },
            {
                field: 'inciId',
                title: 'inciId',
                align: 'center',
                width: 60,
                hidden: true
            }, {
                field: 'typeDesc',
                title: '码类型',
                align: 'center',
                width: 120
            }, {
                field: 'traceCode',
                title: '追溯码',
                align: 'center',
                width: 180
            }, {
                field: 'typeDr',
                title: 'typeDr',
                width: 150,
                hidden: true
            }, {
                field: 'inciCode',
                title: '药品代码',
                align: 'center',
                width: 120
            }, {
                field: 'inciDesc',
                title: '药品名称',
                align: 'left',
                width: 310
            }, {
                field: 'inciSpec',
                title: '规格',
                align: 'center',
                width: 160
            }, {
                field: 'manfName',
                title: '生产企业',
                align: 'left',
                width: 200
            }, {
                field: 'barQty',
                title: '拆零数量',
                align: 'center',
                width: 100
            }, {
                field: 'usedQty',
                title: '已使用数量',
                align: 'center',
                width: 100
            }, {
                field: 'resQty',
                title: '可使用数量',
                align: 'center',
                width: 100
            }, {
                field: 'uomDesc',
                title: '单位',
                align: 'center',
                width: 80
            }, {
                field: 'uomId',
                title: '单位',
                align: 'center',
                width: 60,
                hidden: true
            }, {
                field: 'serialNo',
                title: '拆零流水号',
                align: 'center',
                width: 160
            }
        ]
    ];
    var dataGridOption = {
        url: $URL,
        queryParams: {
            ClassName: 'PHA.DTC.Split.Query',
            QueryName: 'SplitQuery'
        },
        pagination: true,
        pageSize: 100,
        pageList: [100, 300, 500],
        fitColumns: false,
        singleSelect: false,
        // 可转移(BC_ResQty等于BC_Qty,未使用)的数据浅绿色标识
        rowStyler: function (index, row) {
            if (row.resQty == row.barQty) {
                return 'background-color:#CCFFCC;';
            }
        },
        fit: true,
        columns: columns,
        toolbar: '#gridTraceCodeBar',
        rownumbers: true
    };
    $('#gridTraceCode').datagrid(dataGridOption);
}

function Query() {
    $('#gridTraceCode').datagrid('clear');
    var typeDr = $('#comCodeType').combobox('getValue') || '';
    if (typeDr == "") {
        $.messager.alert('提示', "请选择码类型", 'warning', Clear);
        return;
    }

    var status = $('#cmbStatus').combobox('getValue') || '';
    var inciId = $('#cmbgridInci').combogrid('getValue') || '';
    var traceCode = $.trim($("#txtTraceCode").val()) || '';
    var splitType = $('#cmbSplitType').combobox('getValue') || '';
    var locId = $('#cmbLocId').combobox('getValue') || SessionLoc;
    $('#gridTraceCode').datagrid({
        url: $URL,
        queryParams: {
            ClassName: 'PHA.DTC.Split.Query',
            QueryName: 'SplitQuery',
            rows: 100,
            TraceCode: traceCode,
            LocId: locId,
            CodeTypeId: typeDr,
            InciId: inciId,
            Status: status,
            SplitType: splitType
        }
    });

}
//取消拆零
function CancelSplit() {
    if ($('#gridTraceCode').datagrid('getRows').length === 0) {
        $.messager.alert('提示', '没有需要删除的数据！', 'info');
        return;
    }

    var gridChked = $('#gridTraceCode').datagrid('getChecked') || '';
    if (gridChked.length === 0) {
        $.messager.alert('提示', '请先勾选需要取消拆零的数据！', 'info');
        return;
    }
    var codeIdArr = [];
    for (var i = 0; i < gridChked.length; i++) {
        var usedQty = gridChked[i].usedQty;
        var traceCode = gridChked[i].traceCode;
        if (usedQty > 0) {
            $.messager.popover({
                msg: '追溯码' + traceCode + '已经使用，不允许再取消拆零！',
                type: 'info'
            });
            continue;
        }
        var codeId = gridChked[i].codeId;
        if (codeId == "") {
            continue;
        }
        codeIdArr.push(codeId);
    }
    if (codeIdArr.length === 0) {
        $.messager.alert('提示', '您勾选的数据都不符合取消拆零的条件！', 'warning');
        return;
    }
    $.messager.confirm('确认', '确定对选中数据取消拆零吗？', function (r) {
        if (r) {

            var ret = $.cm({
                ClassName: 'PHA.DTC.Scan.Save',
                MethodName: 'CancelSplit',
                CodeIdStr: codeIdArr.join("^"),
                dataType: 'text'
            }, false);
            if (ret == 0) {
                $.messager.popover({
                    msg: '取消成功',
                    type: 'success'
                });

                Query();
            } else {
                $.messager.alert('提示', '操作失败:' + ret.split('^')[1], 'warning');
                return;
            }
        }
    });
}

// 拆零转移-弹出药房科室选择
function TransferSplit() {
    if ($('#gridTraceCode').datagrid('getRows').length === 0) {
        $.messager.alert('提示', '没有需要转移的数据！', 'info');
        return;
    }

    var gridChked = $('#gridTraceCode').datagrid('getChecked') || '';
    if (gridChked.length === 0) {
        $.messager.alert('提示', '请先勾选需要转移的拆零数据！', 'info');
        return;
    }
    var codeIdArr = [];
    for (var i = 0; i < gridChked.length; i++) {
        var traceCode = gridChked[i].traceCode;
        var resQty = gridChked[i].resQty;
        var barQty = gridChked[i].barQty;
        // BC_ResQty须等于BC_Qty(未使用)才允许转移
        if (resQty != barQty) {
            $.messager.popover({
                msg: '追溯码' + traceCode + '已经使用，不允许转移！',
                type: 'info'
            });
            continue;
        }
        var codeId = gridChked[i].codeId;
        if (codeId == "") {
            continue;
        }
        codeIdArr.push(codeId);
    }
    if (codeIdArr.length === 0) {
        $.messager.alert('提示', '您勾选的数据都无法转移！', 'warning');
        return;
    }
    gTransferCodeIds = codeIdArr.join('^');
    $('#cmbTransLoc').combobox('setValue', '');
    $('#dlgTransfer').dialog('open');
}

// 执行拆零转移
function DoTransfer() {
    var locId = $('#cmbTransLoc').combobox('getValue') || '';
    if (locId == '') {
        $.messager.alert('提示', '请选择转移的药房科室！', 'warning');
        return;
    }

    var ret = $.cm({
        ClassName: 'PHA.DTC.Split.Query',
        MethodName: 'TransferLoc',
        CodeIdStr: gTransferCodeIds,
        LocId: locId,
        dataType: 'text'
    }, false);
    if (ret == 0) {
        $.messager.popover({
            msg: '转移成功',
            type: 'success'
        });
        $('#dlgTransfer').dialog('close');
        Query();
    } else {
        $.messager.alert('提示', '操作失败:' + ret.split('^')[1], 'warning');
        return;
    }
}

// 清空追溯码内容并重新定位
function Clear() {
    $("#txtTraceCode").val("");
    $("#cmbgridInci").val("");
    InitDict();
    $('#gridTraceCode').datagrid('loadData', []);
    $('#txtTraceCode').focus();
}
