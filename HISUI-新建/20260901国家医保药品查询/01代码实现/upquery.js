/**
 * 模块:     国家医保上报数据查询
 * 编写日期: 2024-08-27
 * 编写人:   WangYaJun
 */
var hospId = session['LOGON.HOSPID'];
var userId = session['LOGON.USERID'];
var defDateStr = tkMakeServerCall("PHA.FACE.TPS.INSUTE.UpQuery", "GetDefDate");
// 各页签查询结果全量数据（分页/导出使用）
var gvGridData = {
    "3508": { rows: [] },
    "3509": { rows: [] },
    "3510": { rows: [] },
    "3511": { rows: [] },
    "3512": { rows: [] },
    "3513": { rows: [] }
};
$(function () {
    InitDict();
    InitGrid3508();
    InitGrid3509();
    InitGrid3510();
    InitGrid3511();
    InitGrid3512();
    InitGrid3513();
    InitEvent();
    ToggleTabControls('3507');
});
///初始化表单
function InitDict() {
    SetDefDate();
    //药品名称lookup
    $("#cmbgridInci").lookup({
        mode: 'remote',
        url: $URL,
        //width:300,
        panelWidth: 500,
        pagination: true,
        queryParams: {
            ClassName: "PHA.STORE.Drug",
            QueryName: "INCItm"
        },
        onBeforeLoad: function (param) {
            param.QText = param.q;
        },
        onSelect: function (rowIndex, rowData) {},
        panelWidth: 400,
        idField: "inciId",
        textField: "inciCode",
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
    //医院
    $HUI.combobox('#cmbHospital', {
        panelHeight: 'auto',
        url: $URL + '?ResultSetType=Array&ClassName=PHA.STORE.Org&QueryName=CTHospital',
        width: 200,
        valueField: 'RowId',
        textField: 'Description',
        onSelect: function (data) {},
        onLoadSuccess: function (row) {
            $(this).combobox("setValue", hospId);
        }
    });

    // 医保对接方
    $HUI.combobox('#cmbTypeManf', {
        panelHeight: 'auto',
        data: [{
                value: '1',
                text: '国家医保'
            }
        ],
        valueField: 'value',
        textField: 'text',
        onLoadSuccess: function (row) {
            $(this).combobox('setValue', '1');
        },
        onSelect: function (data) {
            Query();
        }
    });

    // 进销存数据类型(3507删除)
    $HUI.combobox('#cmbDelType', {
        panelHeight: 'auto',
        data: [{
                value: '1',
                text: '1-盘存信息'
            }, {
                value: '2',
                text: '2-库存变更信息'
            }, {
                value: '3',
                text: '3-采购信息'
            }, {
                value: '4',
                text: '4-销售信息'
            }
        ],
        valueField: 'value',
        textField: 'text',
        filter: function (q, row) {
            return (row.text.indexOf(q) > -1);
        }
    });

}
//事件初始化
function InitEvent() {
    $("#btnFind").on("click", Query);
    $("#btnClear").on("click", Clear);
    $("#btnExport").on("click", ExportCurTab);
    $("#btnDel").on("click", Del3507);
    // 页签切换时联动3513专用筛选项与导出按钮显隐
    Bind3513TabSwitch();
}

///页签切换联动3513筛选项与导出按钮显隐（双机制保障，不依赖HISUI内部DOM类名）
function Bind3513TabSwitch() {
    // 机制1：包装tabs的select方法，任何选中变化(含编程式选中)都刷新显隐
    try {
        if (($.fn.tabs) && ($.fn.tabs.methods) && ($.fn.tabs.methods.select)) {
            var _tabsSelect = $.fn.tabs.methods.select;
            $.fn.tabs.methods.select = function (jq, title) {
                var _result = _tabsSelect(jq, title);
                jq.each(function () {
                    var _sel = $(this).tabs('getSelected');
                    if ((_sel) && ($(_sel).attr('id'))) {
                        ToggleTabControls($(_sel).attr('id'));
                    }
                });
                return _result;
            };
        }
    } catch (e) {}
    // 机制2：捕获阶段监听页签区域点击，等选中完成后读取当前页签（捕获阶段不受stopPropagation影响）
    var _tabsEl = document.getElementById('mainTabs');
    if (_tabsEl) {
        _tabsEl.addEventListener('click', function () {
            setTimeout(function () {
                var _sel = $('#mainTabs').tabs('getSelected');
                if (_sel) {
                    ToggleTabControls($(_sel).attr('id'));
                }
            }, 0);
        }, true);
    }
}
//初始化表格
function InitGrid3508() {
    var columns = [
        [{
                field: "expyEnd",
                title: '有效期止',
                align: 'center'
            }, {
                field: "medListCodg",
                title: '医疗目录编码',
                align: 'center'
            }, {
                field: "poolareaNo",
                title: '统筹区编号',
                align: 'center'
            }, {
                field: "crteOptinsNo",
                title: '创建机构编号',
                align: 'center'
            }, {
                field: "invCnt",
                title: '库存数量',
                align: 'center'
            }, {
                field: "medinsListCodg",
                title: '医药机构目录编码',
                align: 'center'
            }, {
                field: "memo",
                title: '备注',
                align: 'center'
            }, {
                field: "updtTime",
                title: '数据更新时间',
                align: 'center',
                formatter: FormatDateTime
            }, {
                field: "manuDate",
                title: '生产日期',
                align: 'center'
            }, {
                field: "opterName",
                title: '经办人姓名',
                align: 'center'
            }, {
                field: "rid",
                title: '数据唯一记录号',
                align: 'center'
            }, {
                field: "crteTime",
                title: '数据创建时间',
                align: 'center',
                formatter: FormatDateTime
            }, {
                field: "invdate",
                title: '库存日期',
                align: 'center'
            }, {
                field: "valiFlag",
                title: '有效标志',
                align: 'center'
            }, {
                field: "fixmedinsCode",
                title: '定点医药机构编号',
                align: 'center'
            }, {
                field: "rxFlag",
                title: '处方药标志',
                align: 'center'
            }, {
                field: "listSpItemFlag",
                title: '目录特项标志',
                align: 'center'
            }, {
                field: "fixmedinsBchno",
                title: '定点医药机构批次流水号',
                align: 'center'
            }, {
                field: "optTime",
                title: '经办时间',
                align: 'center'
            }, {
                field: "opterId",
                title: '经办人ID',
                align: 'center'
            }, {
                field: "manuLotnum",
                title: '生产批号',
                align: 'center'
            }, {
                field: "medinsListName",
                title: '医药机构目录名称',
                align: 'center'
            }, {
                field: "crterName",
                title: '创建人姓名',
                align: 'center'
            }, {
                field: "medinsProdInvNo",
                title: '定点医药机构商品库存流水号',
                align: 'center'
            }, {
                field: "crterId",
                title: '创建人ID',
                align: 'center'
            }, {
                field: "optinsNo",
                title: '经办机构编号',
                align: 'center'
            }, {
                field: "trdnFlag",
                title: '拆零标志',
                align: 'center'
            }
        ]
    ]
    var dataGridOption = {
        url: "",
        height: $(window).height() - 150,
        rownumbers: true,
        columns: columns,
        singleSelect: true,
        striped: false,
        pagination: true,
        pageSize: 30,
        pageList: [30, 50, 100],
        // 客户端分页：loadData(数组)时按页切片显示，全量数据存gvGridData["3508"].rows
        loadFilter: MakeLoadFilter('3508')
    };
    $("#gridInsu3508").datagrid(dataGridOption);
}
//初始化表格
function InitGrid3509() {
    var columns = [
        [{
                field: "invChgTime",
                title: '库存变更时间',
                align: 'center'
            }, {
                field: "medListCodg",
                title: '医疗目录编码',
                align: 'center'
            }, {
                field: "poolareaNo",
                title: '统筹区编号',
                align: 'center'
            }, {
                field: "invChgOpterName",
                title: '库存变更经办人姓名',
                align: 'center'
            }, {
                field: "crteOptinsNo",
                title: '创建机构编号',
                align: 'center'
            }, {
                field: "medinsListCodg",
                title: '医药机构目录编码',
                align: 'center'
            }, {
                field: "memo",
                title: '备注',
                align: 'center'
            }, {
                field: "updtTime",
                title: '数据更新时间',
                align: 'center',
                formatter: FormatDateTime
            }, {
                field: "opterName",
                title: '经办人姓名',
                align: 'center'
            }, {
                field: "rid",
                title: '数据唯一记录号',
                align: 'center'
            }, {
                field: "crteTime",
                title: '数据创建时间',
                align: 'center',
                formatter: FormatDateTime
            }, {
                field: "valiFlag",
                title: '有效标志',
                align: 'center'
            }, {
                field: "fixmedinsCode",
                title: '定点医药机构编号',
                align: 'center'
            }, {
                field: "invChgType",
                title: '库存变更类型',
                align: 'center'
            }, {
                field: "rxFlag",
                title: '处方药标志',
                align: 'center'
            }, {
                field: "medinsProdInvChgNo",
                title: '定点医药机构商品库存变更流水号',
                align: 'center'
            }, {
                field: "listSpItemFlag",
                title: '目录特项标志',
                align: 'center'
            }, {
                field: "fixmedinsBchno",
                title: '定点医药机构批次流水号',
                align: 'center'
            }, {
                field: "optTime",
                title: '经办时间',
                align: 'center'
            }, {
                field: "opterId",
                title: '经办人ID',
                align: 'center'
            }, {
                field: "medinsListName",
                title: '医药机构目录名称',
                align: 'center'
            }, {
                field: "cnt",
                title: '数量',
                align: 'center'
            }, {
                field: "pric",
                title: '单价',
                align: 'center'
            }, {
                field: "crterName",
                title: '创建人姓名',
                align: 'center'
            }, {
                field: "crterId",
                title: '创建人ID',
                align: 'center'
            }, {
                field: "optinsNo",
                title: '经办机构编号',
                align: 'center'
            }, {
                field: "trdnFlag",
                title: '拆零标志',
                align: 'center'
            }
        ]
    ]
    var dataGridOption = {
        url: "",
        height: $(window).height() - 150,
        rownumbers: true,
        columns: columns,
        singleSelect: true,
        striped: false,
        pagination: true,
        pageSize: 30,
        pageList: [30, 50, 100],
        // 客户端分页：loadData(数组)时按页切片显示，全量数据存gvGridData["3509"].rows
        loadFilter: MakeLoadFilter('3509')
    };
    $("#gridInsu3509").datagrid(dataGridOption);
}
//初始化表格
function InitGrid3510() {
    var columns = [
        [{
                field: "expyEnd",
                title: "有效期止",
                align: "center"
            }, {
                field: "medListCodg",
                title: "医疗目录编码",
                align: "center"
            }, {
                field: "poolareaNo",
                title: "统筹区编号",
                align: "center"
            }, {
                field: "crteOptinsNo",
                title: "创建机构编号",
                align: "center"
            }, {
                field: "medinsListCodg",
                title: "医药机构目录编码",
                align: "center"
            }, {
                field: "memo",
                title: "备注",
                align: "center"
            }, {
                field: "prodRetnFlag",
                title: "商品退货标志",
                align: "center"
            }, {
                field: "updtTime",
                title: "数据更新时间",
                align: "center",
                formatter: FormatDateTime
            }, {
                field: "manuDate",
                title: "生产日期",
                align: "center"
            }, {
                field: "opterName",
                title: "经办人姓名",
                align: "center"
            }, {
                field: "rid",
                title: "数据唯一记录号",
                align: "center"
            }, {
                field: "crteTime",
                title: "数据创建时间",
                align: "center",
                formatter: FormatDateTime
            }, {
                field: "prodentpName",
                title: "生产企业名称",
                align: "center"
            }, {
                field: "valiFlag",
                title: "有效标志",
                align: "center"
            }, {
                field: "aprvno",
                title: "批准文号",
                align: "center"
            }, {
                field: "fixmedinsCode",
                title: "定点医药机构编号",
                align: "center"
            }, {
                field: "medinsProdPurcNo",
                title: "定点医药机构商品采购流水号",
                align: "center"
            }, {
                field: "rxFlag",
                title: "处方药标志",
                align: "center"
            }, {
                field: "listSpItemFlag",
                title: "目录特项标志",
                align: "center"
            }, {
                field: "purcInvoNo",
                title: "采购发票号",
                align: "center"
            }, {
                field: "fixmedinsBchno",
                title: "定点医药机构批次流水号",
                align: "center"
            }, {
                field: "optTime",
                title: "经办时间",
                align: "center"
            }, {
                field: "opterId",
                title: "经办人ID",
                align: "center"
            }, {
                field: "purcRetnStoinTime",
                title: "采购/退货入库时间",
                align: "center"
            }, {
                field: "manuLotnum",
                title: "生产批号",
                align: "center"
            }, {
                field: "medinsListName",
                title: "医药机构目录名称",
                align: "center"
            }, {
                field: "splerName",
                title: "供货商名称",
                align: "center"
            }, {
                field: "prodGeayFlag",
                title: "商品赠送标志",
                align: "center"
            }, {
                field: "purcRetnOpterName",
                title: "采购/退货经办人姓名",
                align: "center"
            }, {
                field: "purcInvoCodg",
                title: "采购发票编码",
                align: "center"
            }, {
                field: "crterName",
                title: "创建人姓名",
                align: "center"
            }, {
                field: "crterId",
                title: "创建人ID",
                align: "center"
            }, {
                field: "optinsNo",
                title: "经办机构编号",
                align: "center"
            }, {
                field: "splerPmtno",
                title: "供应商许可证号",
                align: "center"
            }, {
                field: "finlTrnsPric",
                title: "最终成交单价",
                align: "center"
            }, {
                field: "purcRetnCnt",
                title: "采购/退货数量",
                align: "center"
            }, {
                field: "dyntNo",
                title: "随货单号",
                align: "center"
            }
        ]
    ]
    var dataGridOption = {
        url: "",
        height: $(window).height() - 150,
        rownumbers: true,
        columns: columns,
        singleSelect: true,
        striped: false,
        pagination: true,
        pageSize: 30,
        pageList: [30, 50, 100],
        // 客户端分页：loadData(数组)时按页切片显示，全量数据存gvGridData["3510"].rows
        loadFilter: MakeLoadFilter('3510')
    };
    $("#gridInsu3510").datagrid(dataGridOption);
}
//初始化表格
function InitGrid3511() {
    var columns = [
        [{
                field: "expyEnd",
                title: "有效期止",
                align: "center"
            }, {
                field: "pharCertType",
                title: "药师证件类型",
                align: "center"
            }, {
                field: "selRetnOpterName",
                title: "销售/退货经办人姓名",
                align: "center"
            }, {
                field: "medListCodg",
                title: "医疗目录编码",
                align: "center"
            }, {
                field: "poolareaNo",
                title: "统筹区编号",
                align: "center"
            }, {
                field: "setlId",
                title: "结算ID",
                align: "center"
            }, {
                field: "crteOptinsNo",
                title: "创建机构编号",
                align: "center"
            }, {
                field: "medinsListCodg",
                title: "医药机构目录编码",
                align: "center"
            }, {
                field: "memo",
                title: "备注",
                align: "center"
            }, {
                field: "updtTime",
                title: "数据更新时间",
                align: "center",
                formatter: FormatDateTime
            }, {
                field: "hiFeesetlType",
                title: "医保费用结算类型",
                align: "center"
            }, {
                field: "manuDate",
                title: "生产日期",
                align: "center"
            }, {
                field: "opterName",
                title: "经办人姓名",
                align: "center"
            }, {
                field: "psnNo",
                title: "人员编号",
                align: "center"
            }, {
                field: "rid",
                title: "数据唯一记录号",
                align: "center"
            }, {
                field: "crteTime",
                title: "数据创建时间",
                align: "center",
                formatter: FormatDateTime
            }, {
                field: "pharCertno",
                title: "药师证件号码",
                align: "center"
            }, {
                field: "valiFlag",
                title: "有效标志",
                align: "center"
            }, {
                field: "certno",
                title: "证件号码",
                align: "center"
            }, {
                field: "fixmedinsCode",
                title: "定点医药机构编号",
                align: "center"
            }, {
                field: "rxFlag",
                title: "处方药标志",
                align: "center"
            }, {
                field: "pharPracCertNo",
                title: "药师执业资格证号",
                align: "center"
            }, {
                field: "listSpItemFlag",
                title: "目录特项标志",
                align: "center"
            }, {
                field: "fixmedinsBchno",
                title: "定点医药机构批次流水号",
                align: "center"
            }, {
                field: "optTime",
                title: "经办时间",
                align: "center"
            }, {
                field: "psnName",
                title: "人员姓名",
                align: "center"
            }, {
                field: "elecSupnCodg",
                title: "电子监管编码",
                align: "center"
            }, {
                field: "bilgDrName",
                title: "开单医师姓名",
                align: "center"
            }, {
                field: "opterId",
                title: "经办人ID",
                align: "center"
            }, {
                field: "manuLotnum",
                title: "生产批号",
                align: "center"
            }, {
                field: "medinsListName",
                title: "医药机构目录名称",
                align: "center"
            }, {
                field: "psnCertType",
                title: "人员证件类型",
                align: "center"
            }, {
                field: "selRetnTime",
                title: "销售/退货时间",
                align: "center"
            }, {
                field: "selRetnCnt",
                title: "销售/退货数量",
                align: "center"
            }, {
                field: "crterName",
                title: "创建人姓名",
                align: "center"
            }, {
                field: "pharName",
                title: "药师姓名",
                align: "center"
            }, {
                field: "prscDrCertType",
                title: "开单医师证件类型",
                align: "center"
            }, {
                field: "crterId",
                title: "创建人ID",
                align: "center"
            }, {
                field: "prscDrCertno",
                title: "开单医师证件号码",
                align: "center"
            }, {
                field: "optinsNo",
                title: "经办机构编号",
                align: "center"
            }, {
                field: "trdnFlag",
                title: "拆零标志",
                align: "center"
            }, {
                field: "finlTrnsPric",
                title: "最终成交单价",
                align: "center"
            }, {
                field: "medinsProdSelNo",
                title: "定点医药机构商品销售流水号",
                align: "center"
            }
        ]
    ]
    var dataGridOption = {
        url: "",
        height: $(window).height() - 150,
        rownumbers: true,
        columns: columns,
        singleSelect: true,
        striped: false,
        pagination: true,
        pageSize: 30,
        pageList: [30, 50, 100],
        // 客户端分页：loadData(数组)时按页切片显示，全量数据存gvGridData["3511"].rows
        loadFilter: MakeLoadFilter('3511')
    };
    $("#gridInsu3511").datagrid(dataGridOption);
}
//初始化表格
function InitGrid3512() {
    var columns = [
        [{
                field: "fixmedinsCode",
                title: "定点医药机构编号",
                align: "center"
            }, {
                field: "medinsListCodg",
                title: "医药机构目录编码",
                align: "center"
            }, {
                field: "fixmedinsBchno",
                title: "定点医药机构批次流水号",
                align: "center"
            }, {
                field: "medinsListCodg",
                title: "医药机构目录编码",
                align: "center"
            }, {
                field: "medListCodg",
                title: "医疗目录编码",
                align: "center"
            }, {
                field: "medinsListName",
                title: "医药机构目录名称",
                align: "center"
            }, {
                field: "drugTracCodg",
                title: "药品追溯码",
                align: "center"
            }, {
                field: "valiFlag",
                title: "有效标志",
                align: "center"
            }, {
                field: "opterId",
                title: "经办人ID",
                align: "center"
            }, {
                field: "crterName",
                title: "创建人姓名",
                align: "center"
            }, {
                field: "crterId",
                title: "创建人ID",
                align: "center"
            }, {
                field: "optinsNo",
                title: "经办机构编号",
                align: "center"
            }, {
                field: "fixBlngAdmdvs",
                title: "定点归属医保区划",
                align: "center"
            }
        ]
    ]
    var dataGridOption = {
        url: "",
        height: $(window).height() - 150,
        rownumbers: true,
        columns: columns,
        singleSelect: true,
        striped: false,
        pagination: true,
        pageSize: 30,
        pageList: [30, 50, 100],
        // 客户端分页：loadData(数组)时按页切片显示，全量数据存gvGridData["3512"].rows
        loadFilter: MakeLoadFilter('3512')
    };
    $("#gridInsu3512").datagrid(dataGridOption);
}
//初始化表格
function InitGrid3513() {
    var columns = [
        [{
                field: "fixmedinsCode",
                title: "定点医药机构编号",
                align: "center"
            }, {
                field: "medListCodg",
                title: "医疗目录编码",
                align: "center"
            }, {
                field: "medinsListCodg",
                title: "医药机构目录编码",
                align: "center"
            }, {
                field: "medinsListName",
                title: "医药机构目录名称",
                align: "center"
            }, {
                field: "fixmedinsBchno",
                title: "定点医药机构批次流水号",
                align: "center"
            }, {
                field: "mdtrtId",
                title: "就诊ID",
                align: "center"
            }, {
                field: "mdtrtSetlType",
                title: "就诊结算类型",
                align: "center"
            }, {
                field: "bkkpSn",
                title: "记账流水号",
                align: "center"
            }, {
                field: "drugTracCodg",
                title: "药品追溯码",
                align: "center"
            }, {
                field: "psnNo",
                title: "人员编号",
                align: "center"
            }, {
                field: "psnCertType",
                title: "人员证件类型",
                align: "center"
            }, {
                field: "certno",
                title: "证件号码",
                align: "center"
            }, {
                field: "psnName",
                title: "人员姓名",
                align: "center"
            }, {
                field: "memo",
                title: "备注",
                align: "center"
            }, {
                field: "trdnFlag",
                title: "拆零标志",
                align: "center"
            }, {
                field: "updtTime",
                title: "数据更新时间",
                align: "center",
                formatter: FormatDateTime
            }, {
                field: "opterName",
                title: "经办人姓名",
                align: "center"
            }, {
                field: "rid",
                title: "数据唯一记录号",
                align: "center"
            }, {
                field: "crteTime",
                title: "数据创建时间",
                align: "center",
                formatter: FormatDateTime
            }, {
                field: "optTime",
                title: "经办时间",
                align: "center"
            }, {
                field: "opterId",
                title: "经办人ID",
                align: "center"
            }, {
                field: "crterName",
                title: "创建人姓名",
                align: "center"
            }, {
                field: "crterId",
                title: "创建人ID",
                align: "center"
            }, {
                field: "optinsNo",
                title: "经办机构编号",
                align: "center"
            }, {
                field: "fixBlngAdmdvs",
                title: "定点归属医保区划",
                align: "center"
            }
        ]
    ]
    var dataGridOption = {
        url: "",
        height: $(window).height() - 150,
        rownumbers: true,
        columns: columns,
        singleSelect: true,
        striped: false,
        pagination: true,
        pageSize: 30,
        pageList: [30, 50, 100],
        // 客户端分页：loadData(数组)时按页切片显示，全量数据存gvGridData["3513"].rows
        loadFilter: MakeLoadFilter('3513')
    };
    $("#gridInsu3513").datagrid(dataGridOption);
}
///查询发药汇总数据
function Query() {
    var selTabs = $('#mainTabs').tabs('getSelected');
    var tabId = selTabs.attr('id');
    if (tabId == "3507") {
        $.messager.alert("提示", "商品信息删除页签请填写批次流水号和进销存数据类型后点击删除！", "warning");
        return;
    }
    var is3513 = (tabId == "3513");
    ToggleTabControls(tabId);
    var inciCode = $.trim($('#cmbgridInci').lookup('getText')) || '';
    var batNo = $.trim($("#batNo").val());
    var mdtrtId = $.trim($("#mdtrtId").val());
    if (is3513) {
        // 3513接口要求：医疗目录编码、医药机构目录编码、批次流水号、就诊ID、证件号码中必须传其中一个
        if ((inciCode == "") && (batNo == "") && (mdtrtId == "")) {
            $.messager.alert("失败", "批次流水号、药品代码和就诊ID不能同时为空！", "warning");
            return;
        }
    } else if ((inciCode == "") && (batNo == "")) {
        // 3508-3512接口要求:医药机构目录编码、批次流水号中必须传其中一个；药品代码经后端GetInsuData解析为国家医保编码后作为查询条件
        $.messager.alert("失败", "批次流水号和药品代码不能同时为空！", "warning");
        return;
    }
    var startDate = $("#startDate").datebox("getValue");
    if (startDate == "") {
        $.messager.alert("失败", "开始日期不能为空！", "warning");
        return;
    }
    var endDate = $("#endDate").datebox("getValue");
    if (endDate == "") {
        $.messager.alert("失败", "截止日期不能为空！", "warning");
        return;
    }
    var selHospId = $("#cmbHospital").combobox("getValue");
    if (selHospId == "") {
        $.messager.alert("失败", "院区不能为空！", "warning");
        return;
    }
    var typeManf = $('#cmbTypeManf').combobox('getValue');
    var input = selHospId + "^" + tabId + "^" + userId + "^" + inciCode + "^" + batNo + "^" + startDate + "^" + endDate + "^" + typeManf;
    if (is3513) {
        // 3513接口入参：第9位结算ID留空^第10位就诊ID^第11位追溯码留空^第12位目录编码留空^第13位人员姓名
        var psnName = $.trim($("#psnName").val());
        input = input + "^^" + mdtrtId + "^^^" + psnName;
    } else if (tabId == "3511") {
        // 3511接口入参：第9位结算ID
        var selId = $.trim($("#selId").val());
        input = input + "^" + selId;
    }
    gvGridData[tabId].rows = [];
    $("#gridInsu" + tabId).datagrid("loadData", []);
    $("#gridInsu" + tabId).datagrid("loading");
    $("#gridInsu" + tabId).datagrid("options").url = $URL;
    $m({
        ClassName: "PHA.FACE.TPS.INSUTE.UpQuery",
        MethodName: "GetFaceData",
        Input: input
    }, function (ret) {
        if (ret != "") {
            var retVal = ret.split("^")[0];
            if (retVal < 0) {
                var msg = ret.split("^")[1];
                $.messager.alert("失败", msg, "error");
            } else {
                var retObj = JSON.parse(ret);
                var retData = retObj.output;
                if ((retData == null) || (retData == "")) {
                    $.messager.popover({
                        msg: '没有满足条件的数据',
                        type: 'error'
                    })
                } else if (retData == "null") {
                    $.messager.alert("提示", "请咨询医保中心，其返回值为空", "warning")
                } else {
                    if (is3513) {
                        retData = Filter3513ByName(retData, $.trim($("#psnName").val()));
                    }
                    gvGridData[tabId].rows = retData;
                    $("#gridInsu" + tabId).datagrid("loadData", retData);
                }
            }
            $("#gridInsu" + tabId).datagrid("loaded");
        }

    })
}

function SetDefDate() {
    if ((defDateStr) && (defDateStr != "")) {
        var defDateArr = defDateStr.split("^");
        var defStDate = defDateArr[0];
        var defEndDate = defDateArr[1];
        $("#startDate").datebox("setValue", defStDate);
        $("#endDate").datebox("setValue", defEndDate);
        $("#cmbTypeManf").combobox('setValue', '1');
    }
}

///界面清除
function Clear() {
    SetDefDate();
    $('#cmbgridInci').lookup('setText', '');
    $('#cmbgridInci').lookup('clear');
    $("#mdtrtId").val('');
    $("#psnName").val('');
    $("#selId").val('');
    $("#delBatNo").val('');
    var tabs = $('#mainTabs').tabs("tabs");
    for (i = 0; i < tabs.length; i++) {
        var tabId = tabs[i].attr('id');
        if (gvGridData[tabId]) gvGridData[tabId].rows = [];
        $("#gridInsu" + tabId).datagrid("loadData", [])
    }
}

///页签切换联动：就诊ID/姓名筛选仅3513显示，导出按钮除3507删除页签外均显示
function ToggleTabControls(tabId) {
    var show3513 = (tabId == "3513");
    if (show3513) {
        $("#tdMdtrtId").show();
        $("#tdMdtrtIdInput").show();
        $("#tdPsnName").show();
        $("#tdPsnNameInput").show();
    } else {
        $("#tdMdtrtId").hide();
        $("#tdMdtrtIdInput").hide();
        $("#tdPsnName").hide();
        $("#tdPsnNameInput").hide();
    }
    // 结算ID筛选仅3511销售信息查询页签显示
    if (tabId == "3511") {
        $("#tdSelId").show();
        $("#tdSelIdInput").show();
    } else {
        $("#tdSelId").hide();
        $("#tdSelIdInput").hide();
    }
    if (tabId == "3507") {
        $("#tdBtnExport").hide();
    } else {
        $("#tdBtnExport").show();
    }
}

///按姓名过滤3513查询结果（接口按psn_name查询，前端按包含匹配兜底）
function Filter3513ByName(rows, psnName) {
    if (!psnName) return rows;
    var result = [];
    for (var i = 0; i < rows.length; i++) {
        var name = rows[i].psnName;
        if ((name != null) && (String(name).indexOf(psnName) > -1)) {
            result.push(rows[i]);
        }
    }
    return result;
}

///客户端分页loadFilter工厂：全量数据存gvGridData[tabId]，分页切片显示
function MakeLoadFilter(tabId) {
    var gridSel = '#gridInsu' + tabId;
    return function (data) {
        if (data && (data.total != null)) return data;
        var rows = gvGridData[tabId].rows;
        var p = $(this).datagrid('getPager');
        var ps = 30;
        if ((p) && (p.length > 0)) {
            var pgOpts = p.pagination('options');
            if ((pgOpts) && (pgOpts.pageSize)) ps = pgOpts.pageSize;
            p.pagination({
                total: rows.length,
                pageSize: ps,
                onSelectPage: function (pageNumber, pageSize) {
                    var start = (pageNumber - 1) * pageSize;
                    $(gridSel).datagrid('loadData', {
                        total: rows.length,
                        rows: rows.slice(start, start + pageSize)
                    });
                }
            });
        }
        return { total: rows.length, rows: rows.slice(0, ps) };
    };
}

///导出当前选中页签查询结果，按查询全量数据导出，不受分页影响
function ExportCurTab() {
    var selTabs = $('#mainTabs').tabs('getSelected');
    if (!selTabs) return;
    var tabId = selTabs.attr('id');
    if (tabId == "3507") return; // 删除页签无数据可导出
    ExportGrid(tabId);
}

///导出指定页签查询结果（CSV）
function ExportGrid(tabId) {
    var rows = gvGridData[tabId].rows;
    if (rows.length == 0) {
        $.messager.alert("提示", "没有可导出的数据！", "warning");
        return;
    }
    var cols = $('#gridInsu' + tabId).datagrid('options').columns[0];
    var csv = '\uFEFF'; // UTF-8 BOM，Excel打开中文不乱码
    var hdrs = [];
    var fields = [];
    for (var i = 0; i < cols.length; i++) {
        if (cols[i].hidden) continue;
        hdrs.push(cols[i].title);
        fields.push(cols[i].field);
    }
    csv += hdrs.join(',') + '\r\n';
    for (var r = 0; r < rows.length; r++) {
        var cells = [];
        for (var c = 0; c < fields.length; c++) {
            var v = rows[r][fields[c]];
            if (v == null) v = '';
            v = String(v);
            // 长数字加\t前缀防Excel科学计数法
            if ((/^\d+$/.test(v)) && (v.length > 11)) v = '\t' + v;
            if ((v.indexOf(',') > -1) || (v.indexOf('"') > -1) || (v.indexOf('\n') > -1)) {
                v = '"' + v.replace(/"/g, '""') + '"';
            }
            cells.push(v);
        }
        csv += cells.join(',') + '\r\n';
    }
    var fileName = tabId + '查询结果.csv';
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
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
}

///时间戳(毫秒)转 yyyy-MM-dd HH:mm:ss；已是日期字符串的原样返回
function FormatDateTime(val) {
    if ((val == null) || (val == "")) return "";
    var str = String(val);
    var num = 0;
    if (/^\d{10}$/.test(str)) {
        num = Number(str) * 1000; // 秒
    } else if (/^\d{13}$/.test(str)) {
        num = Number(str); // 毫秒
    } else {
        return val; // 非时间戳(如已是 yyyy-MM-dd HH:mm:ss)原样返回
    }
    var d = new Date(num);
    if (isNaN(d.getTime())) return val;
    var y = d.getFullYear();
    var m = ('0' + (d.getMonth() + 1)).slice(-2);
    var day = ('0' + d.getDate()).slice(-2);
    var h = ('0' + d.getHours()).slice(-2);
    var min = ('0' + d.getMinutes()).slice(-2);
    var sec = ('0' + d.getSeconds()).slice(-2);
    return y + '-' + m + '-' + day + ' ' + h + ':' + min + ':' + sec;
}

///商品信息删除(3507)
function Del3507() {
    var delBatNo = $.trim($("#delBatNo").val());
    var delType = $('#cmbDelType').combobox('getValue');
    if (delBatNo == "") {
        $.messager.alert("失败", "批次流水号不能为空！", "warning");
        return;
    }
    if (delType == "") {
        $.messager.alert("失败", "进销存数据类型不能为空！", "warning");
        return;
    }
    var selHospId = $("#cmbHospital").combobox("getValue");
    if (selHospId == "") {
        $.messager.alert("失败", "院区不能为空！", "warning");
        return;
    }
    var typeManf = $('#cmbTypeManf').combobox('getValue');
    $.messager.confirm("确认", "确定删除该批次商品信息？删除后不可恢复！", function (r) {
        if (r) {
            var input = selHospId + "^" + userId + "^" + delBatNo + "^" + delType + "^" + typeManf;
            $m({
                ClassName: "PHA.FACE.TPS.INSUTE.UpQuery",
                MethodName: "DelFaceData",
                Input: input
            }, function (ret) {
                if (ret == "") return;
                var retVal = ret.split("^")[0];
                if (retVal < 0) {
                    var msg = ret.split("^")[1];
                    $.messager.alert("失败", msg, "error");
                } else {
                    var retObj = JSON.parse(ret);
                    var res = retObj.result;
                    if ((res == null) || (res == "")) res = retObj.output;
                    if ((res == null) || (res == "")) {
                        $.messager.alert("提示", "接口返回异常，请查看日志！", "warning");
                        return;
                    }
                    var retRslt = res.retRslt;
                    var msgRslt = res.msgRslt;
                    if (retRslt == "1") {
                        $.messager.alert("成功", "删除成功！", "info");
                        $("#delBatNo").val('');
                    } else {
                        $.messager.alert("失败", "删除失败：" + ((msgRslt) ? msgRslt : ""), "error");
                    }
                }
            });
        }
    });
}
