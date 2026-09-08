/**
 * 模块:     药品追溯码拆零查询
 * 编写日期: 2024-10-26
 * 编写人:   chengshuo
 */
var SessionLoc = session['LOGON.CTLOCID'];
var SessionUser = session['LOGON.USERID'];
var SessionHosp = session['LOGON.HOSPID'];
$(function () {
    InitDict();
    InitGridTraceCode();
    InitGridPrescDetail()
    BtnEvent();
    $('#txtTraceCode').focus();
});

// 初始化字典
function InitDict() {
    $('#comCodeType').combobox({
        width: 200,
        valueField: 'RowId',
        textField: 'Description',
        url: $URL + '?ResultSetType=Array&ClassName=PHA.DTC.COM.Store&QueryName=GetTraceCodeType',
        onLoadSuccess: function () {
            var data = $(this).combobox('getData');
            $(this).combobox('setValue', data[0].RowId);
        }
    });

    // 使用状态下拉: All-全部(默认)、1-未使用、2-使用中、3-已使用 (口径与后端GetBarCodeData的Status一致)
    $('#cmbStatus').combobox({
        width: 100,
        valueField: 'RowId',
        textField: 'Description',
        data: [{
            'RowId': 'All',
            'Description': '全部'
        }, {
            'RowId': '1',
            'Description': '未使用'
        }, {
            'RowId': '2',
            'Description': '使用中'
        }, {
            'RowId': '3',
            'Description': '已使用'
        }],
        onLoadSuccess: function () {
            $(this).combobox('setValue', 'All');
        }
    });

    //药品名称lookup
    $("#cmbgridInci").lookup({
        mode: 'remote',
        panelWidth: '1000px',
        url: $URL,
        pagination: true,
        queryParams: {
            ClassName: "PHA.STORE.Drug",
            QueryName: "INCItm"
        },
        onBeforeLoad: function (param) {
            param.QText = param.q;
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
                width: 250
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

// 绑定按钮事件
function BtnEvent() {
    $('#btnFind').on('click', Query);
    $('#btnClean').on('click', Clear);
    $('#btnExport').on('click', ExportExcel);
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
                field: 'locDesc',
                title: '当前科室',
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
                field: 'useStatus',
                title: '使用状态',
                align: 'center',
                width: 80,
                formatter: function (value, row, index) {
                    return GetUseStatusText(row);
                }
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
        toolbar: "#gridTraceCodeBar", //保持不改变高度
        pageNumber: 1,
        pageSize: 100,
        pageList: [100, 300, 500, 1000],
        pagination: true,
        fitColumns: false,
        fit: true,
        rownumbers: true,
        columns: columns,
        onClickRow: function (rowIndex, rowData) {

        },
        onSelect: function (index, row) {
            if (row) {
                QueryDetail(row);
            }

        },
        singleSelect: true,
        selectOnCheck: true,
        checkOnSelect: true,
        onLoadSuccess: function () { }
    };
    $('#gridTraceCode').datagrid(dataGridOption);
}
function InitGridPrescDetail() {
    var columns = [
        [{
            field: "codeSubId",
            title: 'codeSubId',
            width: 350,
            halign: 'center',
            align: 'left',
            hidden: true
        }, {
            field: "type",
            title: 'type',
            width: 80,
            halign: 'center',
            align: 'center',
            hidden: true
        }, {
            field: "typeDesc",
            title: '业务',
            width: 80,
            halign: 'center',
            align: 'center'
        }, {
            field: 'locDesc',
            title: '操作科室',
            align: 'center',
            width: 120
        }, {
            field: "pointer",
            title: '指针',
            width: 80,
            halign: 'center',
            align: 'center',
            hidden: true
        }, {
            field: "operDate",
            title: '操作日期',
            width: 90,
            halign: 'center',
            align: 'center'
        }, {
            field: "operTime",
            title: '操作时间',
            width: 80,
            halign: 'center',
            align: 'center'
        }, {
            field: "userName",
            title: '操作人',
            width: 80,
            halign: 'center',
            align: 'center'
        }, {
            field: "oeori",
            title: '医嘱id',
            width: 80,
            halign: 'center',
            align: 'center'
        }, {
            field: "PatNo",
            title: '登记号',
            width: 120,
            halign: 'center',
            align: 'center'
        }, {
            field: "PatName",
            title: '姓名',
            width: 120,
            halign: 'center',
            align: 'center'
        }, {
            field: "qty",
            title: '数量',
            width: 80,
            halign: 'center',
            align: 'center'
        }, {
            field: "resQty",
            title: '剩余数量',
            width: 80,
            halign: 'center',
            align: 'center'
        }, {
            field: "ingrNo",
            title: '入库单号',
            width: 120,
            halign: 'center',
            align: 'center'
        }, {
            field: "ingrMoveMent",
            title: '入库时间',
            width: 120,
            halign: 'center',
            align: 'center'
        }, {
            field: "approvalNO",
            title: '批次流水号',
            width: 80,
            halign: 'center',
            align: 'center'
        }, {
            field: "apcVendor",
            title: '供应商',
            width: 80,
            halign: 'center',
            align: 'center'
        }
        ]
    ];
    var dataGridOption = {
        pageNumber: 1,
        pageSize: 100,
        pageList: [100, 300, 500, 1000],
        pagination: true,
        fitColumns: false,
        fit: true,
        rownumbers: true,
        columns: columns,
        onLoadSuccess: function () { }
    };
    $('#gridTraceCodeDetail').datagrid(dataGridOption);
}
function Query() {
    $('#gridTraceCode').datagrid('clear');
    var typeDr = $('#comCodeType').combobox('getValue') || '';
    if (typeDr == "") {
        $.messager.alert('提示', "请选择码类型", 'warning', Clear);
        return;
    }
    var status = $('#cmbStatus').combobox('getValue') || 'All';
    var incidesc = $.trim($('#cmbgridInci').lookup('getText')) || '';
    var traceCode = $.trim($("#txtTraceCode").val()) || '';
    if ((incidesc == "") && (traceCode == "")) {
        $.messager.alert('提示', "药品名称和追溯码不能同时为空!", 'warning', Clear);
        return;
    }


    $('#gridTraceCode').datagrid({
        url: $URL,
        queryParams: {
            ClassName: 'PHA.DTC.Trans.Query',
            MethodName: 'GetBarCodeData',
            rows: 9999,
            TraceCode: traceCode,
            LocId: SessionLoc,
            CodeTypeId: typeDr,
            InciDesc: incidesc,
            Status: status,
            ResultSetType: 'array'
        }
    });

}
/// 查询
function QueryDetail(row) {
    if (row == undefined) {
        // 获取选中的业务信息
        var row = $('#gridTraceCode').datagrid('getSelected');
    }
    if (!row) {
        return;
    }
    var codeId = row.codeId;

    $('#gridTraceCodeDetail').datagrid({
        url: $URL,
        queryParams: {
            ClassName: 'PHA.DTC.Trans.Query',
            MethodName: 'GetBarCodeItmData',
            rows: 9999,
            LocId: SessionLoc,
            codeId: codeId,
            ResultSetType: 'array'
        }
    });
}

// 清空追溯码内容并重新定位
function Clear() {
    $("#txtTraceCode").val("");
    $("#cmbgridInci").val("");
    InitDict();
    $('#gridTraceCode').datagrid('loadData', []);
    $('#gridTraceCodeDetail').datagrid('loadData', []);
    $('#txtTraceCode').focus();
}

// 计算行数据的使用状态文本(与后端过滤口径一致: 未使用-已用数量=0, 使用中-0<已用数量<拆零数量, 已使用-已用数量>=拆零数量)
function GetUseStatusText(row) {
    var total = Number(row.barQty) || 0;
    var used = Number(row.usedQty) || 0;
    if (used <= 0) {
        return '未使用';
    }
    if ((total > 0) && (used < total)) {
        return '使用中';
    }
    return '已使用';
}

// 导出Excel(.xls): 复用标准组件 DHCExcelExport（通用组件库 DHCExcelExport.js，部署至 csp/scripts_lib/DHCExcelExport.js）
function ExportExcel() {
    if (typeof DHCExcelExport === 'undefined') {
        $.messager.alert('提示', '缺少Excel导出组件 DHCExcelExport.js,请先部署 scripts_lib/DHCExcelExport.js!', 'warning');
        return;
    }
    var columns = [{
        field: 'typeDesc',
        title: '码类型'
    }, {
        field: 'traceCode',
        title: '追溯码',
        text: true
    }, {
        field: 'inciCode',
        title: '药品代码',
        text: true
    }, {
        field: 'locDesc',
        title: '当前科室'
    }, {
        field: 'inciDesc',
        title: '药品名称'
    }, {
        field: 'inciSpec',
        title: '规格'
    }, {
        field: 'manfName',
        title: '生产企业'
    }, {
        field: 'barQty',
        title: '拆零数量'
    }, {
        field: 'usedQty',
        title: '已使用数量'
    }, {
        field: 'resQty',
        title: '可使用数量'
    }, {
        title: '使用状态',
        getValue: function (row) {
            return GetUseStatusText(row);
        }
    }, {
        field: 'uomDesc',
        title: '单位'
    }, {
        field: 'serialNo',
        title: '拆零流水号',
        text: true
    }];
    DHCExcelExport.exportDataGrid({
        gridId: 'gridTraceCode',
        columns: columns,
        fileName: '追溯码台账查询_' + DHCExcelExport.timestamp()
    });
}
