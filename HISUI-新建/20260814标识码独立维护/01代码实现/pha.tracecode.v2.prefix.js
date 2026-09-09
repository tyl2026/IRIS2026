/**
 * 模块:     标识码独立维护
 * 编写日期: 2024-08-10
 * 编写人:   suiguoyang
 */
var SessionLoc = session['LOGON.CTLOCID'];
var SessionUser = session['LOGON.USERID'];
var SessionHosp = session['LOGON.HOSPID'];
var DefCodeTypeId = ""; //默认选中的码类型
$(function () {
    InitGridInci(); //初始化药品表格
    InitGridTraceCodePrefix(); //初始化标识码表格
    InitDict(); //初始化菜单列表
    InitDictINCItm();
    BtnEvent(); //绑定按钮事件
    $('#txtIncPY').focus();
});
window.onload = function () {
    setTimeout("QueryInci();", 500)
}

//初始化菜单列表
function InitDict() {
    $('#cmbTypeList').combobox({
        width: 359,
        valueField: 'RowId',
        textField: 'Description',
        url: $URL + '?ResultSetType=Array&ClassName=PHA.DTC.COM.Store&QueryName=GetTraceCodeType',
        onLoadSuccess: function () {
            var loadData = $(this).combobox("getData");
            for (var i = 0; i < loadData.length; i++) {
                var desc = loadData[i].Description;
                if (desc.indexOf("小码") != -1) {
                    $(this).combobox("setValue", loadData[i].RowId);
                    DefCodeTypeId = loadData[i].RowId;
                    break;
                }
            }
        }
    })

    $('#cmbHosp').combobox({
        valueField: 'RowId',
        textField: 'Description',
        url: $URL + "?ResultSetType=Array&" + "ClassName=PHA.DTC.COM.Store&QueryName=CTHospital",
        onLoadSuccess: function () {
            $(this).combobox("setValue", SessionHosp);
        }
    })
    //科室类组
    $('#conLocStkGrp').combobox({
        width: 200,
        valueField: 'RowId',
        textField: 'Description',
        multiple: true,
        rowStyle: 'checkbox',
        url: $URL + '?ResultSetType=Array&ClassName=PHA.DTC.COM.Store&QueryName=LocStkCatGroup&Loc=' + SessionLoc,
        onLoadSuccess: function () {
            //默认全选
            var loadData = $(this).combobox("getData");
            var rowIdArr = []
            for (var i = 0; i < loadData.length; i++) {
                rowIdArr.push(loadData[i].RowId)
            }
            $(this).combobox("setValues", rowIdArr)
        },
        onChange: function (newValue, oldValue) {
            QueryInci();
        }
    })
    
    //医嘱子类
    $('#conArcCat').combobox({
        width: 200,
        valueField: 'RowId',
        textField: 'Description',
        multiple: true,
        rowStyle: 'checkbox',
        url: $URL + '?ResultSetType=Array&ClassName=PHA.DTC.COM.Store&QueryName=ArcCat',
        onLoadSuccess: function () {
            //默认全选
            var loadData = $(this).combobox("getData");
            var rowIdArr = []
            for (var i = 0; i < loadData.length; i++) {
                rowIdArr.push(loadData[i].RowId)
            }
            $(this).combobox("setValues", rowIdArr)
        },
        onChange: function (newValue, oldValue) {
            QueryInci();
        }
    })

    //维护状态
    $('#coMaintenState').combobox({
        width: 288,
        valueField: 'RowId',
        textField: 'Description',
        data: [{
                Description: '全部',
                RowId: 0,
                DefFlag: 'Y'
            }, {
                Description: '已维护小码',
                RowId: 1,
                DefFlag: 'N'
            }, {
                Description: '未维护小码',
                RowId: 2,
                DefFlag: 'N'
            }, {
                Description: '已维护中码',
                RowId: 3,
                DefFlag: 'N'
            }, {
                Description: '未维护中码',
                RowId: 4,
                DefFlag: 'N'
            }, {
                Description: '已维护大码',
                RowId: 5,
                DefFlag: 'N'
            }, {
                Description: '未维护大码',
                RowId: 6,
                DefFlag: 'N'
            }
        ],
        onLoadSuccess: function () {
            var loadData = $(this).combobox("getData");
            for (var i = 0; i < loadData.length; i++) {
                var defFlag = loadData[i].DefFlag;
                if (defFlag === 'Y') {
                    //设置默认
                    $(this).combobox("setValue", loadData[i].RowId);
                    break;
                }
            }
        },
        onChange: function (newValue, oldValue) {
            QueryInci();
        }
    })
}

/**
 * @description 初始化库存项相关字典
 */
function InitDictINCItm() {
    // 选基本单位后,其他单位才能出现下拉数据
    $('#inciBUom').combobox({
        valueField: 'RowId',
        textField: 'Description',
        url: $URL + '?ResultSetType=Array&' + 'ClassName=PHA.DTC.COM.Store&QueryName=CTUOM&HospId=' + SessionHosp,
        width: 320,
        onChange: function (newValue, oldValue) {
            var newUrl = $URL + '?ResultSetType=Array&' + 'ClassName=PHA.DTC.COM.Store&QueryName=CTUOM&ToUomId=' + newValue + '&HospId=' + SessionHosp;
            $('#inciPackUnit').combobox('reload', newUrl).combobox('clear');
        }
    });
    $("#inciBUom").combobox("readonly", true);

    $('#inciPackUnit').combobox({
        valueField: 'RowId',
        textField: 'Description',
        width: 320,
    });
    $('#inciPackUomM').combobox({
        valueField: 'RowId',
        textField: 'Description',
        url: $URL + '?ResultSetType=Array&' + 'ClassName=PHA.DTC.COM.Store&QueryName=CTUOM&HospId=' + SessionHosp,
        width: 100,
    });
    $('#inciPackUomMFac').numberbox({
        width: 108,
        min: 0
    });
    $('#inciPackUom').combobox({
        valueField: 'RowId',
        textField: 'Description',
        url: $URL + '?ResultSetType=Array&' + 'ClassName=PHA.DTC.COM.Store&QueryName=CTUOM&HospId=' + SessionHosp,
        width: 100,
    });
    $('#inciPackUomFac').numberbox({
        width: 108,
        min: 0
    })

    $('#inciMinTCodeLev').combobox({
        valueField: 'RowId',
        textField: 'Description',
        url: $URL + '?ResultSetType=Array&' + 'ClassName=PHA.STORE.Drug&QueryName=StkComDictionary&ScdType=CodeType',
        width: 320
    });
    $("#inciCode").attr('readonly', true);
    $("#inciDesc").attr('readonly', true);
}
//绑定按钮事件
function BtnEvent() {
    $('#btnFindInci').on('click', QueryInci);
    $('#btnAdd').on('click', function () {
        ShowTraceCodeDiag("insert")
    });
    $('#btnUpdate').on('click', function () {
        ShowTraceCodeDiag("update")
    });
    $('#btnDelete').on('click', function () {
        Delete();
    });
    //文本框回车事件绑定
    $('#txtIncPY').on('keydown', function (e) {
        if (e.keyCode === 13) {
            QueryInci();
        }
    })
    $('#txtIDCode').on('keydown', function (e) {
        if (e.keyCode === 13) {
            QueryInci();
        }
    })
    $('#SaveInc').on('click', function () {
        SaveInc();
    });
}

//查询药品信息
function QueryInci() {
    $('#gridTraceCodePrefix').datagrid('clear');
    $('#gridInci').datagrid('options').url = $URL;
    var inciPY = $.trim($('#txtIncPY').val());
    var idCode = $.trim($('#txtIDCode').val());
    var stkGrpId = $('#conLocStkGrp').combobox("getValues").join(",") || "";
    var arcCatId = $('#conArcCat').combobox("getValues").join(",") || "";
    var maintenState = $('#coMaintenState').combobox("getValue") || '';
    $('#gridInci').datagrid('query', {
        QText: inciPY,
        HospId: $('#cmbHosp').combobox('getValue') || '',
        StkGrpId: stkGrpId,
        MaintenState: maintenState,
        ArcCatId:arcCatId,
        IDCode: idCode
    });
    $('#txtIncPY').val("");
    $('#txtIDCode').val("");
}
//查询标识码
function QueryTraceCodePrefix() {
    var gridSelect = $('#gridInci').datagrid('getSelected') || '';
    var inci = '';
    if (gridSelect)
        inci = gridSelect.inci;
    if (inci == '') {
        clearTraceCodePrefix()
        return;
    }
    $('#gridTraceCodePrefix').datagrid('query', {
        InciId: inci
    });
}

/**
 * @description 查询右侧明细
 */
function QueryINCItmDetail() {
    var gridSelect = $('#gridInci').datagrid('getSelected') || '';
    var inci = '';
    if (gridSelect)
        inci = gridSelect.inci;
    if (inci == '') {
        return;
    }
    $.cm({
        ClassName: 'PHA.DTC.IDCode.Query',
        MethodName: 'SelectINCItm',
        InciId: inci,
        ResultSetType: 'Array'
    }, function (arrData) {
        if (arrData.msg) {
            alert(arrData.msg);
        } else {
            var gObj = arrData[0];
            $('#inciCode').val(gObj.inciCode);
            $('#inciDesc').val(gObj.inciDesc);
            $('#inciBUom').combobox('setValue', gObj.inciBUom);
            $('#inciPackUnit').combobox('setValue', gObj.inciPackUnit);
            $('#inciPackUomM').combobox('setValue', gObj.inciPackUomM);
            $('#inciPackUom').combobox('setValue', gObj.inciPackUom);
            $('#inciPackUomMFac').numberbox('setValue', gObj.inciPackUomMFac);
            $('#inciPackUomFac').numberbox('setValue', gObj.inciPackUomFac);
            $('#inciMinTCodeLev').combobox('setValue', gObj.inciMinTCodeLev);
            var domVal = gObj.inciNoTraceCodeFlag
                var boolVal = domVal == 'Y' || domVal == '1';
            $('#inciNoTraceCodeFlag').checkbox('setValue', boolVal);
        }
    }, function () {})
}
function InitGridInci() {
    var columns = [
        [{
                field: 'inci',
                title: 'inci',
                width: 80,
                hidden: true
            }, {
                field: 'inciCode',
                title: '药品代码',
                width: 120
            }, {
                field: 'inciDesc',
                title: '药品名称',
                width: 260
            }, {
                field: 'manfName',
                title: '生产企业',
                width: 260
            }, {
                field: 'remarks',
                title: '批准文号',
                width: 180
            }, {
                field: 'bUomDesc',
                title: '基本单位',
                width: 100
            }, {
                field: 'pUomDesc',
                title: '包装单位',
                width: 100
            }, {
                field: 'IDCodeStr',
                title: '标识码',
                width: 220
            }

        ]
    ];
    var dataGridOption = {
        url: '',
        queryParams: {
            ClassName: 'PHA.DTC.IDCode.Query',
            QueryName: 'QueryInci'
        },
        fitColumns: true,
        fit: true,
        columns: columns,
        singleSelect: true,
        striped: false,
        pagination: true,
        pageSize: 100,
        pageList: [100, 300, 500],
        toolbar: '#gridProcessBar',
        onClickRow: function (rowIndex, rowData) {
            QueryTraceCodePrefix();
            QueryINCItmDetail();
        }
    };
    $('#gridInci').datagrid(dataGridOption);

}

function InitGridTraceCodePrefix() {
    var columns = [
        [{
                field: 'incIDCId',
                title: 'incIDCId',
                align: 'center',
                width: 100,
                hidden: true
            }, {
                field: 'idCode',
                title: '标识码',
                align: 'center',
                width: 150
            }, {
                field: 'typeDesc',
                title: '标识类型描述',
                align: 'center',
                width: 130
            }, {
                field: 'typeDr',
                title: 'typeDr',
                width: 50,
                hidden: true
            }, {
                field: 'activeFlag',
                title: '启用标志',
                align: 'center',
                width: 100
            }, {
                field: 'createDT',
                title: '创建日期',
                align: 'center',
                width: 140
            }, {
                field: 'creator',
                title: '创建人',
                align: 'center',
                width: 100
            }, {
                field: 'idRemark',
                title: '备注',
                align: 'left',
                width: 200
            }
        ],
    ];
    var dataGridOption = {
        url: $URL,
        queryParams: {
            ClassName: 'PHA.DTC.IDCode.Query',
            QueryName: 'InciIDCode',
            InciId: ''
        },
        //fitColumns: true,
        singleSelect: true,
        fit: true,
        columns: columns,
        toolbar: '#gridTraceCodePrefixBar',
        onDblClickRow: function (rowIndex, rowData) {
            ShowTraceCodeDiag("update");
        }

    };
    //PHA.Grid('gridTraceCodePrefix', dataGridOption);
    $('#gridTraceCodePrefix').datagrid(dataGridOption);
}
//展示追溯码维护框
function ShowTraceCodeDiag(insertOrUpdateFlag) {
    var gridSelect = $('#gridInci').datagrid('getSelected') || '';
    var inci = '';
    if (gridSelect) {
        inci = gridSelect.inci;
    }

    if (inci == '') {
        $.messager.alert('提示', "请选择药品", 'warning');
        return;
    }
    $('#txtInci').val(inci);

    if (insertOrUpdateFlag == "update") {

        var gridSelect = $('#gridTraceCodePrefix').datagrid('getSelected') || '';
        if (gridSelect) {
            var incIDCId = gridSelect.incIDCId;
            if (incIDCId == "") {
                $.messager.alert('提示', "请选择需修改的记录", 'warning');
                return;
            }
            $('#txtIncIDCId').val(incIDCId);
            var idCode = gridSelect.idCode;
            $('#txtIdCode').val(idCode);
            var typeDr = gridSelect.typeDr;
            $('#cmbTypeList').combobox('setValue', typeDr);
            var activeFlag = gridSelect.activeFlag;
            if (activeFlag == "1") {
                $('#ckActiveFlag').prop('checked', true);
            } else {
                $('#ckActiveFlag').prop('checked', false);
            }
        } else {
            $.messager.alert('提示', "请选择需修改的记录", 'warning');
            return;
        }
    }
    $('#diagSaveTraceCode').dialog({
        modal: true
    }).dialog('open');
    $('#txtIdCode').removeAttr("disabled");
    $('#cmbTypeList').combobox('enable');
    if (insertOrUpdateFlag == "update") {
        $('#diagProp_btnAdd').hide();
        //$('#txtIdCode').prop('disabled', "true");
        //$('#cmbTypeList').combobox('disable');
    }
}
//保存标识码
function SaveIDCode(type) {
    var inci = $.trim($('#txtInci').val());
    if (inci == "") {
        $.messager.alert('提示', "请选择药品", 'warning');
        return;
    }

    var incIDCId = $.trim($('#txtIncIDCId').val());

    var idCode = $.trim($('#txtIdCode').val());
    if (idCode == "") {
        $.messager.alert('提示', "请输入标识码", 'warning');
        return;
    }

    var typeDr = $('#cmbTypeList').combobox('getValue') || '';
    if (typeDr == "") {
        $.messager.alert('提示', "请选择标识码类型", 'warning');
        return;
    }

    var activeFlag = $('#ckActiveFlag').is(':checked');
    if (activeFlag === true) {
        activeFlag = 1;
    } else {
        activeFlag = 0;
    }

    var paramsStr = incIDCId + "^" + idCode + "^" + typeDr + "^" + activeFlag + "^" + SessionUser;
    $.cm({
        ClassName: 'PHA.DTC.IDCode.Save',
        MethodName: 'SaveMulti',
        InciId: inci,
        MultiDataStr: paramsStr,
        HospId: $('#cmbHosp').combobox('getValue') || '',
        dataType: 'text'
    },
        function (retData) {
        if (retData == 0) {
            $.messager.popover({
                msg: '保存成功！',
                type: 'success',
                timeout: 2000, //0不自动关闭。3000s
                showType: 'slide' //show,fade,slide
            });
            ClearForm(type); //清空表单控件
            QueryTraceCodePrefix(); //查询标识码数据
            if (type != "1") {
                $('#diagSaveTraceCode').dialog('close'); //非继续新增时关闭录入框
            }
        } else {
            $.messager.alert('提示', "保存失败,失败原因：" + retData.split("^")[1], 'warning');
        }
    });
}
//清空表单数据，type表示继续新增的时候不进行清空的数据
function ClearForm(type) {
    $('#txtIncIDCId').val("");
    $('#txtIdCode').val("");

    if (type != "1") { //继续新增时，这些数据不需要清空
        $('#txtInci').val("");
        $('#cmbTypeList').combobox('setValue', DefCodeTypeId || '');
        $('#ckActiveFlag').prop('checked', true);
    }
}
//删除标识码
function Delete() {
    var gridSelect = $('#gridTraceCodePrefix').datagrid('getSelected') || '';
    if (!gridSelect) {
        $.messager.alert('提示', "请选择需要删除的记录", 'warning');
        return;
    }
    $.messager.confirm('确认对话框', '您确认删除该标识码吗？', function (r) {
        if (r) {
            var incIDCId = gridSelect.incIDCId;
            var retData = $.cm({
                ClassName: 'PHA.DTC.IDCode.Save',
                MethodName: 'Delete',
                RowID: incIDCId,
                dataType: 'text'
            }, false);
            if (retData == 0) {
                $.messager.popover({
                    msg: '删除成功！',
                    type: 'success',
                    timeout: 2000, //0不自动关闭。3000s
                    showType: 'slide' //show,fade,slide
                });
                QueryTraceCodePrefix(); //查询标识码数据
            } else {
                $.messager.alert('提示', "删除失败,失败原因：" + retData.split("^")[1], 'warning');
            }
        }
    })
}
function clearTraceCodePrefix() {
    $('#gridTraceCodePrefix').datagrid('clear');
    $('#gridTraceCodePrefix').datagrid('clearSelections');
}
//保存药品信息
function SaveInc() {
    var gridSelect = $('#gridInci').datagrid('getSelected') || '';
    var inci = '';
    if (gridSelect) {
        inci = gridSelect.inci;
    }
    if (inci == "") {
        $.messager.alert('提示', "请选择药品", 'warning');
        return;
    }

    var inciPackUnit = $('#inciPackUnit').combobox('getValue');
    var inciPackUom = $('#inciPackUom').combobox('getValue');
    var inciPackUomFac = $('#inciPackUomFac').numberbox('getValue');
    var inciPackUomM = $('#inciPackUomM').combobox('getValue');
    var inciPackUomMFac = $('#inciPackUomMFac').numberbox('getValue');
    var inciMinTCodeLev = $('#inciMinTCodeLev').combobox('getValue');
    var inciNoTraceCodeFlag = $('#inciNoTraceCodeFlag').checkbox('getValue');
    if (inciNoTraceCodeFlag) {
        var inciNoTraceCodeFlag = "Y"
    } else {
        var inciNoTraceCodeFlag = "N"
    }

    var SaveDate = {
        inciPackUnit: inciPackUnit,
        inciPackUom: inciPackUom,
        inciPackUomFac: inciPackUomFac,
        inciPackUomM: inciPackUomM,
        inciPackUomMFac: inciPackUomMFac,
        inciMinTCodeLev: inciMinTCodeLev,
        inciNoTraceCodeFlag: inciNoTraceCodeFlag,
    };
    var JsonDataStr = JSON.stringify(SaveDate)
        var saveRet = $.cm({
        ClassName: 'PHA.DTC.IDCode.Save',
        MethodName: 'SaveInci',
        InciId: inci,
        JsonDataStr: JsonDataStr,
        dataType: 'text'
    }, false);

    if (saveRet.indexOf("msg") >= 0) {
        $.messager.alert('提示', "保存失败,失败原因：" + saveRet, 'warning');
        return;
    } else {
        $.messager.popover({
            msg: '保存成功！',
            type: 'success',
            timeout: 2000, //0不自动关闭。3000s
            showType: 'slide' //show,fade,slide
        });
        QueryINCItmDetail();
    }
}
