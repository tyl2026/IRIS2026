/*******************************************************
* 功能介绍：配血计划管理公共代码
* 创建人： 曾文天
* 创建日期：2015/12/15
**********************************************************/
var UkeyNoArray = [];
var UserDR = "";
var InformFlag = "";  //flag 1表示发通知0表示已经发过通知，取消取血通知 
var contentDetilc="";
//页面初始化
function pageInitCommon() {
    $.extend($.fn.datagrid.methods, {
        fixRownumber: function (jq) {
            return jq.each(function () {
                var panel = $(this).datagrid("getPanel");
                var view1 = panel.find('div.datagrid-view1');
                var view = panel.find('div.datagrid-view2');
                var tr1 = view1.find('.datagrid-body tr');
                var tr = view.find('.datagrid-body tr');

                for (var i = 0; i < tr1.length; i++) {
                    var height = 0;
                    for (var j = i; j < tr.length; j++) {
                        if (tr[j].className.trim() != "datagrid-row") {
                            continue;
                        }
                        height = tr[j].clientHeight;
                        break;
                    }
                    var id = tr1[i].id;
                    $("#" + id, panel).height(height);
                }
                //修改之后,需要对容器进行重新计算,所以调用resize///
                $(this).datagrid("resize");
            });
        }

    });
    //csp登录
    CSPLogin();
    me.ReqFormGrid = $('#ReqFormData');
    me.XMPlanGrid = $('#XMPlanData');
    var curDate = GetCurentDate();
    var sttDate = DateFormatter(DateParser("d-2"));
    $('#dt_SttDate').datebox({
        required: true,
        value: sttDate,
        onChange: function (newValue, oldValue) {
            if (newValue != oldValue) {
                RefreshReqForm();
            }
        }
    });

    $('#dt_EndDate').datebox({
        required: true,
        value: curDate,
        onChange: function (newValue, oldValue) {
            if (newValue != oldValue) {
                RefreshReqForm();
            }
        }
    });
    if (me.IsCheckUserSame == "N") {
       // $('#btn_XMTest_Check').linkbutton('disable');
    }
    else {
        $('#btn_XMTest_Check').linkbutton('enable');
    }
    ///血液产品对照码
    LIS.Cache.GetCacheData("BBBloodProductSupplier", false, true);
    me.BBBloodProductSupplier = LIS.Data.BBBloodProductSupplier;

    //获取初始数据
    ///ABO
    me.BTABOBG = LIS.Cache.GetCacheData("BTABOBG");
    me.BTABOBG = LIS.Data.BTABOBG;
    ///RH
    me.BTRHBG = LIS.Cache.GetCacheData("BTRHBG");
    me.BTRHBG = LIS.Data.BTRHBG;
    ///输血成分
    me.BBReqProduct = LIS.Cache.GetCacheData("BBReqProduct", true, true);
    me.BBReqProduct = LIS.Data.BBReqProduct;
    ///申请血型
    me.BBBloodGroup = LIS.Cache.GetCacheData("BBBloodGroup", false, true);
    me.BBBloodGroup = LIS.Data.BBBloodGroup;
    ///申请类型 
    //me.BBReqType= LIS.Cache.GetCacheData("BBReqType", false, true);
    //me.BBReqType = LIS.Data.BBReqType;
     $.ajax({
                type: "post",
                dataType: "json", //text, json, xml
                cache: false, //
                async: true, //为true时，异步，不等待后台返回值，为false时强制等待；-asir
               // url: "../../newcodetable/ashx/ashCodeTable.ashx?Model=BBReqType&GlobalParam=Active:true&Method=QueryView&sort=SeqNum&order=asc&pagination=false",
                url:"../../cts/ashx/ashReqForm.ashx?method=QryBBReqType",
                success: function (returnData) {
                  me.BBReqType=returnData;
                } 
     });
    
    me.IsVerify = "N";
    me.VerifyDatagridData = [];
    if (me.ShowMedicalType != "1") {
        $(".medicalType").hide();
    }
    else {
        //初始化医保类型 
        //医保类型
        var PaymentType = LIS.Cache.GetCacheData("BTPaymentType", false, true);
        $('#cmbPayMentType').combobox({
            data: PaymentType,
            valueField: 'RowID',
            textField: 'CName',
            panelHeight: 'auto',
            editable: true

        });
        $('input[type=radio][name=rdMedicalInsuranceType]').change(function () {
            var MedicalInsuranceType = $(this).val();   //$("input[name='rdMedicalInsuranceType']:checked").val();
            if (MedicalInsuranceType == "0") {
                $('#cmbPayMentType').combobox('disable');
                $('#cmbPayMentType').combobox('setValue', "");
            } else {
                $('#cmbPayMentType').combobox('enable');
            }
        });
    }

    $.ajax({
        type: "post",
        dataType: "json", //text, json, xml
        cache: false, //
        async: false, //为true时，异步，不等待后台返回值，为false时强制等待；-asir
        url: me.actionUrl + '?Method=QryXMDepictResRule',
        success: function (returnData) {
            me.XMDepictResRule = returnData.rows;
        }
    });
    $.ajax({
        type: "post",
        dataType: "json", //text, json, xml
        cache: false, //
        async: false, //为true时，异步，不等待后台返回值，为false时强制等待；-asir
        url: me.actionUrl + '?Method=QryXMResultRule',
        success: function (returnData) {
            me.XMResultRule = returnData.rows;
        }
    });
    GetEntryLoginInfo();
    me.DefaultXMTest = { 'XMPlanNo': "请选择配血计划", 'PackBarcode': '' };

    $('#com_Minor_BBXMResult').combobox({
        onSelect: function (record) {
            if (record.CName == "不合") {
                $('#textarea_Remark').val('次侧结果不合，必要时请少量、慢速输血，并密切观察，如发生输血反应，应立即停止输注！！');
            }
            else {
                $('#textarea_Remark').val('');
            }
        }
    });
    $('#tt').tabs({
        onSelect: function (title, index) {
            if (index == "1") {
                LoadXMPlanHistory(me.AdmId);
            }
            if (index == "2") {
                ShowHistoryTestSet(me.RegNo);
            }
            if (index == "3") {
                LoadIsDifficult();
            }
            

        }
    });

    $('#dg_PackMoreMatch').datagrid({
        method: 'get',
        idField: 'RowID',
        fitColumns: false,
        fit: true,
        remoteSort: false,
        singleSelect: true,
        nowrap: false,  //折行
        border: false,
        columns: [[
            { field: 'PackBarcode', title: '献血码', width: 120, align: 'left' },
            {
                field: 'BDType', title: '血型(RH)', width: 90, align: 'left', sortable: true,
                formatter: function (value, rowData, rowIndex) {
                    var BloodGroup = rowData.Pack.BloodGroup;
                    var color = GetBdTypeColor(BloodGroup.ABO, BloodGroup.RH);
                    return '<span style="font-size:14px;font-weight:bolder;background:' + color.BackGroundColor + ';color:' + color.FontColor + '" >' + BloodGroup.CName + '</span>';
                }
            },
            {
                field: 'PackVolume', title: '血量', width: 60, align: 'left',
                formatter: function (value, rowData, rowIndex) {
                    return rowData.Pack.PackVolume + rowData.Pack.BloodProduct.Units;
                }
            },
            {
                field: 'XMResultStr', title: '结果', width: 40, sortable: true, align: 'center',
                formatter: function (value, rowData, rowIndex) {
                    if (rowData.MajorXMResult.Code == "XMR1" && rowData.MinorXMResult.Code == "XMR1") {
                        return "<i class=\'fa fa-check-circle-o\' style='font-size:20px;color:blue;' id='ShowResultNoes' ></i>";
                    }
                    else if (rowData.MajorXMResult.Code == "XMR2") {
                        return "<i class=\'fa fa-times-circle\'  style='font-size:20px;color:red;' id='ShowResultNoes'></i>";
                    }
                    else if (rowData.MajorXMResult.Code == "XMR1" && rowData.MinorXMResult.Code == "XMR2") {
                        return "<i class=\'fa fa-exclamation-circle\' style='font-size:20px;color:yellow;' id='ShowResultNoes'></i>";
                    }
                }
            },
            {
                field: 'RegNo', title: '登记号', width: 80, align: 'left',
                formatter: function (value, rowData, rowIndex) {
                    return rowData.ReqForm.RegNo;
                }
            },
            {
                field: 'MedicalRecordNo', title: '病案号', width: 60, align: 'left',
                formatter: function (value, rowData, rowIndex) {
                    return rowData.ReqForm.MedicalRecordNo;
                }
            },
            {
                field: 'PatName', title: '姓名', width: 60, align: 'left',
                formatter: function (value, rowData, rowIndex) {
                    return rowData.ReqForm.SurName;
                }
            },
            {
                field: 'patSex', title: '性别', width: 60, align: 'left',
                formatter: function (value, rowData, rowIndex) {
                    return rowData.ReqForm.Species.CName;
                }
            },
            {
                field: 'PatAge', title: '年龄', width: 60, align: 'left',
                formatter: function (value, rowData, rowIndex) {
                    return rowData.ReqForm.Age + rowData.ReqForm.AgeUnit.CName;
                }
            },
            {
                field: 'LocationDesc', title: '科室', width: 110, align: 'left',
                formatter: function (value, rowData, rowIndex) {
                    if (rowData.ReqForm.Location.CName.split('-').length == 2) {
                        return rowData.ReqForm.Location.CName.split('-')[1];
                    }
                    return rowData.ReqForm.Location.CName;
                }
            },
            {
                field: 'WardDesc', title: '病区', width: 90, align: 'left',
                formatter: function (value, rowData, rowIndex) {
                    if (rowData.ReqForm.Ward.CName.split('-').length == 2) {
                        return rowData.ReqForm.Ward.CName.split('-')[1];
                    }
                    return rowData.ReqForm.Ward.CName;
                }
            },
            {
                field: 'BedNo', title: '床号', width: 60, align: 'left',
                formatter: function (value, rowData, rowIndex) {
                    return rowData.ReqForm.BedNo;
                }
            },
             {
                 field: 'XMCheckDate', title: '配血审核时间', width: 130, sortable: true, align: 'center',
                 formatter: function (value, rowData, rowIndex) {
                     return ConvertDate(rowData.XMCheckDate, 1) + " " + ConvertTime(rowData.XMCheckTime);
                 }
             }
        ]],
        rowStyler: function (index, row) {
            if (row.RHType == "N") {
                return 'color:red';
            }
        },
        onBeforeLoad: function (param) {

        }
    });
    $('#txt_FindFast').keydown(function (event) {
        if (event.keyCode == "13") {
            RefreshReqForm();
        }
    });

    $('#txt_PackID').keydown(function (event) {
        if (event.keyCode == "13") {
            $('#txt_PackID').val(GetPackNo($('#txt_PackID').val(), me.PackIdLength));
            var packs = $('#dgMachineXMPlan').datagrid('getRows');
            for (var i = 0; i < packs.length; i++) {
                if ($('#txt_PackID').val() == packs[i].PackID) {
                    $('#dgMachineXMPlan').datagrid('selectRow', i);
                }
            }
            $('#txt_ProductBarCode').focus();
        }
    });
    $('#txt_ProductBarCode').keydown(function (event) {
        if (event.keyCode == "13") {
            var productbarcode = GetProductBarCode($('#txt_ProductBarCode').val());
            //if(productbarcode=="") return;
            QueryPlanPackByPackBarcodeDo($('#txt_PackID').val(), productbarcode);
            $('#txt_PackID').focus();
            return true;
        }
    });

    $('#dgMachineXMPlan').datagrid({
        method: 'get',
        fitColumns: false,
        fit: true,
        remoteSort: false,
        singleSelect: true,
        nowrap: false,  //折行
        border: false,
        columns: [[
            { field: 'RowID', title: 'RowID', hidden: true },
            { field: 'PackID', title: '献血码', width: 120, align: 'left' },
            { field: 'ProductBarcode', title: '产品码', width: 70, align: 'left' },
            { field: 'ProductName', title: '血产品', width: 120, align: 'left' },
            { field: 'BloodGroupName', title: '血型(RH)', width: 90, align: 'left', sortable: true },
            { field: 'SampleNo', title: '标本号', width: 100, align: 'left' },
            {
                field: 'MachineParameter', title: '配血仪器', width: 100, align: 'left',
                formatter: function (value, rowData, rowIndex) {
                    return $('#com_UploadMachineParameter').combobox('getText');
                }
            }
        ]]
    });
    $('#dgPackDetails').datagrid({
        method: 'get',
        fitColumns: false,  //列少设为true,列多设为false
        collapsible: true,
        rownumbers: true,
        pagination: false,
        pageSize: 20,
        pageList: [20, 40, 80, 100],
        singleSelect: false,
        //nowwarp: false,  //折行
        striped: true,
        border: true,
        fit: true,
        columns: [[
              { field: 'RowID', title: 'ID', width: 40, hidden: true, align: 'center ' },
              { field: 'PackID', title: '献血码', width: 100, align: 'left' },
              { field: 'ProductName', title: '血液成分', width: 100, align: 'left' },
              { field: 'BloodGroupName', title: '血型(RH)', width: 80, align: 'left' },
              { field: 'PackVolume', title: '血量', width: 50, sortable: true, align: 'center' },
              {
                  field: 'ExpiredDate', title: '失效时间', width: 120, sortable: true, align: 'center',
                  formatter: function (value, rowData, rowIndex) {
                      return rowData.ExpiredDate + " " + rowData.ExpiredTime;

                  }
              }
        ]]
    });
    $('#cmb_ReqType').combogrid({
        data: me.BBReqType,
        panelWidth: 180,
        fit: true,
        editable: true,
        fitColumns: true,  //列少设为true,列多设为false
        idField: 'RowID',
        textField: 'CName',
        columns: [[
					{ field: 'RowID', title: 'ID', width: 40, hidden: true, align: 'center' },
					{ field: 'Code', title: '代码', width: 70, sortable: true, align: 'center' },
					{ field: 'CName', title: '名称', width: 150, sortable: true, align: 'left' }
        ]]
    });
    //QryBDSupervise();
    InitVerifyKeyEvent();
    //setInterval(QryBDSupervise, 1000 * 60 * 60);
    $('#txt_TakeRecordNo').keydown(function (event) {
        if (event.keyCode == "13") { 
            $.ajax({
                url: "../../sys/ashx/ashCodeTable.ashx?Model=BDTakeRecord&pagination=false&GlobalParam=RecordNo:" + $('#txt_TakeRecordNo').val() + "&Method=Query",
                success: function (returnData) {
                    if (returnData.length > 0) {
                        if (returnData[0].Status != 35) {
                            $.messager.alert("操作提示","该取血单号还未接收不能发血", "info", function () {
                                $('#txt_TakeRecordNo').focus();
                                $('#txt_TakeRecordNo').select(); 
                            }); 
                            return;
                        }
                        me.CurrentTakeRecordDR = returnData[0].RowID;
                        $('#btn_takeSave').focus();
                    }
                    else {
                        $.messager.alert("操作提示", "未查询到该取血单号", "info", function () {
                            $('#txt_TakeRecordNo').focus();
                            $('#txt_TakeRecordNo').select();
                        });  
                    }
                }
            });
        }
    });
}

function SearchStockPack() {
    var filteredData = [];
    if ($('#txt_AddPack').val().length > 0) {
        var packBarcode = GetPackNo($('#txt_AddPack').val(), me.PackIdLength);
        var packs = me.PackData.rows;
        for (var i = 0; i < packs.length; i++) {
            if (ContainSearch(packs[i].PackBarcode, packBarcode)) {
                filteredData.push(packs[i]);
            }
        }
        me.PackGrid.datagrid('loadData', filteredData);
    }
    else {
        me.PackGrid.datagrid('reload');
    }

}

function GetTakeUserName() {
    $('#edit_window').window('open');
    $('#btn_edit_cancel').click(function () { $('#edit_window').window('close'); });
}

function CheckTakeUserName() {
    var TakeUserName = $("#txt_edit_TakeUserName").val();
    $("#hiddenTakeUserName").val(TakeUserName);
    if (TakeUserName == "") {
        return;
    } else {
        $('#edit_window').window('close');
        $("#txt_edit_TakeUserName").val("");
        checkUser();
    }
}

function checkUser() {
    $.ajax({
        type: "GET",
        dataType: "json", //text, json, xml
        cache: false, //
        async: true, //为true时，异步，不等待后台返回值，为false时强制等待；-asir
        url: '../ashx/ashBdXMPlan.ashx' + '?Method=checkUser&Code=' + $("#hiddenTakeUserName").val(),
        success: function (result, status) {
            if (Object.keys(result).length == 0) {
                showInfo("系统无此人！");
                return;
            } else { 
                $("#hiddenTakeUserName").val(result[0]["CName"]);
                CheckShowPackCost();
            }
        }
    });
}

//切换查询
function ToggleShow(o) {
    var display = $('#AdvanceSearch').css('display');
    if (display != 'none') {
        $(o).text("高级查询");
        //还原选择值
        //        $("#comb_OperateType").combobox('setValue', "");
        //        $("#comb_Creator,#comb_Checker,#comb_Canceller,#comb_Purchaser,#comb_Supplier,#comb_BillType,#comb_FromReagentGroup").combobox('setValue', 0);
        //        $('input[name=status]').each(function (i, e) {
        //            if (e.value == '') {
        //                e.checked = true;
        //            } else {
        //                e.checked = false;
        //            }
        //        });
        $('#AdvanceSearch').hide();
    } else {
        $(o).text("简单查询");
        $('#AdvanceSearch').show();
    }
    //开启刷新功能
    RefreshReqForm();
}

//加载仪器数据
function LoadMachineParameter() {
    $.ajax({
        url: me.actionUrl + '?Method=QueryMachineByGroup',
        method: 'get',
        async: false,
        success: function (r) {
            me.BTMIMachineParameter = r.rows;
            GetDefaultMachineParameter();
        }
    });
}

//加载仪器默认值
function GetDefaultMachineParameter() {
    $.ajax({
        url: me.actionUrl + '?Method=GetDefaultMachineParameter',
        method: 'get',
        async: false,
        success: function (r) {
            for (var i = 0; i < me.BTMIMachineParameter.length; i++) {
                var mp = me.BTMIMachineParameter[i];
                if (mp.RowID == r) {
                    mp.IsDefault = true;
                } else {
                    mp.IsDefault = false;
                }
            }
        }
    });
}

function LoadBBXMMethod() {
    var BBXMMethod = SetSelectedByIsDefault(ObjClone(me.BBXMMethod)); 
    me.DefaultXMTest.XMMethodDR = GetDefaultItem(me.BBXMMethod, true);
    $('#com_BBXMMethod').combobox({
        width: 120,
        data: BBXMMethod,
        valueField: 'RowID',
        textField: 'CName',
        panelHeight: 'auto',
        editable: false,
        onSelect: function (record) {
            if ($('#com_BBXMMethod').combobox('getText') == "微柱凝胶法") {
                //$("#BBXMMethodInfo tr:eq(1) td")[0].setAttribute("colspan", 4);
                // for (var i = 1; i < 3; i++) {
                $("#BBXMResultInfo tr").find('td:eq(4)').hide();
                // }
            }
            else {
                // $("#BBXMMethodInfo tr:eq(1) td")[0].setAttribute("colspan", 4);
                // for (var i = 1; i < 3; i++) {
                $("#BBXMResultInfo tr").find('td:eq(4)').show();
                // }
            }
        }
    });
}

function LoadBTMIMachineParameter() {
    var BTMIMachineParameter =SetSelectedByIsDefault(ObjClone(me.BTMIMachineParameter));
    me.DefaultXMTest.MachineParameterDR = GetDefaultItem(me.BTMIMachineParameter, true);
    $('#com_BTMIMachineParameter').combobox({
        width: 120,
        data: BTMIMachineParameter,
        valueField: 'RowID',
        textField: 'CName',
        panelHeight: 'auto',
        editable: true
    });
}

function LoadPackBTMIMachineParameter() {
    var BTMIMachineParameter = ObjClone(me.BTMIMachineParameter);
    $('#com_BTMIMachineParameter_pack').combobox({
        width: 120,
        data: BTMIMachineParameter,
        valueField: 'RowID',
        textField: 'CName',
        panelHeight: 'auto',
        editable: true
    });

}

function LoadMajorBBXMDepict() {
    var MajorBBXMDepict = SetSelectedByIsDefault(ObjClone(me.BBXMDepict));
    me.DefaultXMTest.MajorXMDepictDR = me.DefaultXMTest.MinorXMDepictDR = GetDefaultItem(me.BBXMDepict, true);
    $('#com_Major_BBXMDepict').combobox({
        width: 100,
        data: MajorBBXMDepict,
        valueField: 'RowID',
        textField: 'CName',
        panelHeight: 'auto',
        editable: false,
        onHidePanel: function () {
            var selectId = $('#com_Major_BBXMDepict').combobox("getValue");
            for (var i = 0; i < me.XMDepictResRule.length; i++) {
                var objDepictResRule = me.XMDepictResRule[i];
                if (objDepictResRule.XMDepictDR == selectId) {
                    if (objDepictResRule.XMResultDR != "") {
                        $('#com_Major_BBXMResult').combobox('setValue', objDepictResRule.XMResultDR);
                    }
                    if (objDepictResRule.XMConclusionDR != "") {
                        $('#com_Major_BBXMConclusion').combobox('setValue', objDepictResRule.XMConclusionDR);
                    }
                }
            }

        }
    });
}

function LoadMinorBBXMDepict() {
    var MinorBBXMDepict = SetSelectedByIsDefault(ObjClone(me.BBXMDepict));
    $('#com_Minor_BBXMDepict').combobox({
        width: 100,
        data: MinorBBXMDepict,
        valueField: 'RowID',
        textField: 'CName',
        panelHeight: 'auto',
        editable: false,
        onHidePanel: function () {
            var selectId = $('#com_Minor_BBXMDepict').combobox("getValue");
            for (var i = 0; i < me.XMDepictResRule.length; i++) {
                var objDepictResRule = me.XMDepictResRule[i];
                if (objDepictResRule.XMDepictDR == selectId) {
                    if (objDepictResRule.XMResultDR != "") {
                        $('#com_Minor_BBXMResult').combobox('setValue', objDepictResRule.XMResultDR);
                    }
                    if (objDepictResRule.XMConclusionDR != "") {
                        $('#com_Minor_BBXMConclusion').combobox('setValue', objDepictResRule.XMConclusionDR);
                        for (var i = 0; i < me.XMResultRule.length; i++) {
                            var objResultRule = me.XMResultRule[i];
                            if (objResultRule.MajorXMConclusionDR == $('#com_Major_BBXMConclusion').combobox('getValue') && objResultRule.MinorXMConclusionDR == $('#com_Minor_BBXMConclusion').combobox('getValue')) {
                                $('#com_BBXMLastResult').combobox('setValue', objResultRule.XMLastResultDR);
                            }
                        }
                    }

                }
            }
        }
    });
}

function LoadMajorBBXMConclusion() {
    var MajorBBXMConclusion = SetSelectedByIsDefault(ObjClone(me.BBXMConclusion));
    me.DefaultXMTest.MajorXMConclusionDR = me.DefaultXMTest.MinorXMConclusionDR = GetDefaultItem(me.BBXMConclusion, true);
    $('#com_Major_BBXMConclusion').combobox({
        width: 70,
        data: MajorBBXMConclusion,
        valueField: 'RowID',
        textField: 'CName',
        panelHeight: 'auto',
        editable: false
    });
}

function LoadMinorBBXMConclusion() {
    var MinorBBXMConclusion = SetSelectedByIsDefault(ObjClone(me.BBXMConclusion));
    $('#com_Minor_BBXMConclusion').combobox({
        width: 70,
        data: MinorBBXMConclusion,
        valueField: 'RowID',
        textField: 'CName',
        panelHeight: 'auto',
        editable: false
    });
}

function LoadMajorBBXMResult() {
    var MajorBBXMResult = SetSelectedByIsDefault(ObjClone(me.BBXMResult));
    me.DefaultXMTest.MajorXMResultDR = me.DefaultXMTest.MajorXMResultDR = GetDefaultItem(me.BBXMResult, true);
    $('#com_Major_BBXMResult').combobox({
        width: 50,
        data: MajorBBXMResult,
        valueField: 'RowID',
        textField: 'CName',
        panelHeight: 'auto',
        editable: false
    });
}

function LoadMinorBBXMResult() {
    var MinorBBXMResult = SetSelectedByIsDefault(ObjClone(me.BBXMResult));
    me.DefaultXMTest.MinorXMResultDR = me.DefaultXMTest.MinorXMResultDR = GetDefaultItem(me.BBXMResult, true);
    $('#com_Minor_BBXMResult').combobox({
        width: 50,
        data: MinorBBXMResult,
        valueField: 'RowID',
        textField: 'CName',
        panelHeight: 'auto',
        editable: false
    });
}

function LoadBBXMLastResult() {
    SetSelectedByIsDefault(me.BBXMLastResult);
    me.DefaultXMTest.XMLastResultDR = GetDefaultItem(me.BBXMLastResult, true);
    $('#com_BBXMLastResult').combobox({
        width: 50,
        data: me.BBXMLastResult,
        valueField: 'RowID',
        textField: 'CName',
        panelHeight: 'auto',
        editable: false
    });
}
////加载费用
function LoadCostItem() {
    var rows = me.XMPlanGrid.datagrid('getRows');
    var fees = GenerateCostTypeHash(rows);
    me.CostItems = fees;
    var total = 0;
    var html = '<table><tr><td>计费（单位：元）:</td>';
    var feeIndex = 0;
    var chargestatus = "";
    for (fee in fees) {
        feeType = fees[fee];
        feeIndex++;
        var feeGenus = fee;
        if (!fee) {
            feeGenus = "em";
        }
        if (chargestatus != "0") {
            var data = feeType.items;
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                //10创建 Create，20执行 Execute,30取消 Cancel
                if (item.ItemStatus == '30') {
                    continue;
                }
                if (item.Price == "0") {
                    continue;
                }

                if (item.AdmType != "I") {
                    if (item.HISOrderStatus != "1") {
                        chargestatus = "0";
                    }
                }
            }
        }
        total += feeType.total;
        html += '<td>';
        html += '<span id="ShowFee_' + feeIndex + '" InitFlag="0" onmouseenter="ShowFee(\'' + feeGenus + '\',\'ShowFee_' + feeIndex + '\');">' + GetReqFormCostItemCostType(feeGenus) + ':' + feeType.total.toFixed(2) + '</span>';
        html += '</td>';
    }
    var remark = "";
    if (chargestatus == "0") {
        remark = "<span style='color:red'>此病人为门急诊病人,有未交费用</span>";
    }
    html += '<td>';
    html += remark;
    html += '</td>';
    if (total > 0) {
        html += '<td>总计';
        html += total.toFixed(2);
        html += '</td>';
    }
    html += '</tr></table>';
    $('#div_costItems').html(html);
}

function ShowFee(fee, containerID) {
    if (fee == "em") fee = "";
    feeType = me.CostItems[fee];
    ShowFeeDetails(fee, feeType.items, containerID, true);
    $("#" + containerID).attr('InitFlag', 1);
}

//将价格按BTCostItem中的类型进行汇总
function GenerateCostTypeHash(rows) {
    var fees = {};
    var reqforminfo = me.ReqFormGrid.datagrid('getSelected');
    for (var j = 0; j < rows.length; j++) {
        var costItemsInfo = rows[j].CostItemInfo;
        if (costItemsInfo == "") continue;
        var costItems = costItemsInfo.split('^');
        for (var i = 0; i < costItems.length; i++) {
            var costItem = costItems[i];
            //10创建 Create，20执行 Execute,30取消 Cancel

            //        var type = item.CostType;
            //        var total = item.Price * item.Quantity;
            var type = costItem.split('@')[0];
            var CostItemName = costItem.split('@')[1];
            var total = costItem.split('@')[2] * costItem.split('@')[3];
            var ItemStatus = costItem.split('@')[5];
            var flag = false;
            var item = {};
            item.type = type;
            item.CostItemName = CostItemName;
            item.Price = costItem.split('@')[2];
            item.Quantity = costItem.split('@')[3];
            item.HISOrderStatus = costItem.split('@')[4];
            item.AdmType = reqforminfo.AdmType;
            item.ItemStatus = ItemStatus;
            if (item.ItemStatus == '30') {
                continue;
            }
            for (fee in fees) {
                if (fee == type) {
                    flag = true;
                    feeType = fees[type];
                    feeType.items.push(item);
                    feeType.total += total;
                }
            }
            if (!flag) {
                feeType = {};
                feeType.items = [];
                feeType.items.push(item);
                feeType.total = total;
                fees[type] = feeType;
            }
        }
    }
    return fees;
}

//将价格按BTCostItem中的类型进行汇总
function GenerateCostTypeHash2(costItems) {
    var fees = {};
    for (var i = 0; i < costItems.length; i++) {
        var item = costItems[i];
        //10创建 Create，20执行 Execute,30取消 Cancel
        if (item.ItemStatus == '30') {
            continue;
        }
        var type = item.CostItem.ItemType;
        var total = item.Price * item.Quantity;

        var flag = false;
        for (fee in fees) {
            if (fee == type) {
                flag = true;
                feeType = fees[type];
                feeType.items.push(item);
                feeType.total += total;
            }
        }
        if (!flag) {
            feeType = {};
            feeType.items = [];
            feeType.items.push(item);
            feeType.total = total;
            fees[type] = feeType;
        }
    }
    return fees;
}

//将发血血量进行分类汇总
function StateIssueComponentsVol(costItems) {
    // var rows = me.XMPlanGrid.datagrid('getRows');
    var fees = {};
    var bldComponentsDRList = [];
    for (var i = 0; i < costItems.length; i++) {
        var item = costItems[i];
        //10创建 Create，20执行 Execute,30取消 Cancel
        if (item.ItemStatus == '30') {
            continue;
        }
        if (item.CostType != '15') {
            continue;
        }
        var index = $.inArray(item.PackDR, bldComponentsDRList);
        if (index != "-1") {
            continue;
        }
        bldComponentsDRList.push(item.PackDR);
        var type = item.Pack.BloodProduct.BloodComponents.RowID;
        var PackVolume = item.Pack.PackVolume;
        var flag = false;
        for (fee in fees) {
            if (fee == type) {
                flag = true;
                feeType = fees[type];
                feeType.PackVolume += PackVolume;
            }
        }
        if (!flag) {
            feeType = {};
            feeType.items = {};
            feeType.items = item.Pack.BloodProduct.BloodComponents;
            feeType.items.Units = item.Pack.BloodProduct.Units;
            feeType.PackVolume = PackVolume;
            fees[type] = feeType;
        }
    }
    return fees;
}

//加载已接收的输血申请单
function LoadReqForm() {
    me.ReqFormGrid.datagrid({
        //url: me.actionUrl + '?Method=QueryReqForm',
        method: 'get',
        setGrid: true,
        idField: 'RowID',
        sortName: 'TimeReceive',
        sortOrder: "desc",
        fitColumns: false,
        fit: true,
        remoteSort: false,
        singleSelect: true,
        nowrap: false,  //折行
        border: false,
        //remoteSort:false,
        onRowContextMenu: dgReqFormMenu,   //Others_Plans_IsXMPlaned,Others_Plans_IsIssued
        columns: [[  //血成分，血量，申请单号，姓名，ABO血型，RH血型
                      { field: 'RowID', title: 'RowID', hidden: true },
                      {
                          field: 'PatName', title: '姓名', width: 65, sortable: true, align: 'center',
                          formatter: function (value, rowData, rowIndex) {
							  var htmstr=""
                              var htmstr= value + "<span class='sp_PromatFlag'  title='查看电子病历'><img class='icon-PatientInfo' style='width:12px;height:12px'   onmouseover=\"this.style.cursor='pointer'\"   onclick=\"ViewEMR('" + rowData.AdmNo + "');\"/></span>&nbsp;"
                              if (rowData.IsBldDifficultFlag == "1") {
								   htmstr = htmstr + getIconHtml("疑", "", "#D02090", "", "");
							  }
							   return htmstr;

						 }
                      },
                      {
                          field: 'ManualAccount', title: '费', sortable: true, width: 25, align: 'center',
                          formatter: function (value, rowData, rowIndex) {
                              return '<img src="../../resource/common/images/manualaccount.png" onClick="ManualAccount(\'' + rowIndex + '\');" class="easyui-tooltip" title="手工计费"/>';
                          }
                      },
                       {
                           field: 'ReqFormNo', title: '申请单号', width: 150, sortable: true, align: 'center',
                           formatter: function (value, rowData, rowIndex) {
                               // var htm = '<a href="../../cts/form/frmQueryReqForm.aspx?ReqFormDR=' + rowData.RowID + '" target="_blank">' + value + '</a>'; 
                               var htm = value + '&nbsp;<i title="点击查看申请单详细信息" onclick="showReqFormInfo(' + rowData.RowID + ');" class="fa fa-file-text-o"></i>';
                               htm = htm + '&nbsp;<i title="申请单追踪" onclick="showReqFormTrace(' + rowData.ReqFormNo + ');" class="packtrack"></i>';
                               if (rowData.IsLocked == "1") {
                                   htm = htm + '&nbsp;<i title="申请单锁定"  class="fa fa-lock"></i>';
                               }
                               return htm;
                           }
                       },
					   { field: 'EpisodeNo', title: '流水号', width: 50, sortable: true, align: 'center' },
                       { field: 'SampleNo', title: '配血检验号', width: 80, sortable: true, align: 'center' },
					   { field: 'Location', title: '科室', width: 80, sortable: true, align: 'center' },
                       
                       { field: 'AcceptDate', title: '核收日期', width: 100, sortable: true, align: 'center' },
                       {
                           field: 'ProductList', title: '申请成分', width: 150, sortable: true, align: 'left',
                           styler: function (value, row, index) {
                               if (row.ReqTypeColor != "") { return 'color:' + row.ReqTypeColor; }
                           }
                       },
					   { field: 'IssuePackInfo', title: '发血成分', width: 100, sortable: true, align: 'center' },
					    { field: 'iIssueDateTimes', title: '发血日期', width: 100, sortable: true, align: 'left' },
					   { field: 'PXXMPlanNoS', title: '配血单号', width: 100, sortable: true, align: 'left' },
                       { field: 'ReqTypeName', title: '类型', width: 80, sortable: true, align: 'center' },
                      {
                          field: 'IsXMPlaned', title: '配血', width: 30, sortable: true, align: 'center',
                          formatter: function (value, rowData, rowIndex) {
                              return IsXMPlanedWithColor(rowData.IsXMPlaned);
                              //return rowData.IsXMPlaned;
                          }
                      },
                       {
                           field: 'IsPlanIssued', title: '发血', width: 30, sortable: true, align: 'center',
                           formatter: function (value, rowData, rowIndex) {
                               return IsIssuedWithColor(rowData.IsPlanIssued, rowData.IsPlanNotIssued,rowData.IsChaoliang);
                           }
                       },

                     {
                           field: 'Issueforms', title: '发血单号', width: 30, sortable: true, align: 'center',showTip:true,tipWidth:450,tipTrackMouse:true
                          
                       },
                      { field: 'ABO', title: 'ABO', width: 34, sortable: true, align: 'center' },
                      { field: 'RH', title: 'RH', width: 50, sortable: true, align: 'center' },
                    { field: 'MedicalRecordNo', title: '病案号', width: 80, sortable: true, align: 'center' },
                    { field: 'RegNo', title: '登记号', width: 80, sortable: true, align: 'center' },
                    { field: 'AdmNo', title: '就诊号', width: 80, sortable: true, align: 'center' },
                    { field: 'Remark', title: '备注说明', width: 80, sortable: true, align: 'left' },
                    { field: 'TimeReceive', title: '接收日期', width: 150, sortable: true, align: 'center' }
        ]],
        toolbar: '#ReqFormToolBar',
        //        onBeforeLoad: function (param) {
        //            var validate = $('#searchFrom').form('validate');
        //            if (!validate) {
        //                return false;
        //            }
        //            param.DateStart = $('#dt_SttDate').datebox("getValue");
        //            param.DateEnd = $('#dt_EndDate').datebox("getValue");
        //            //js控制查询日期为半年以内
        //            var distance = daysBetween(param.DateStart, param.DateEnd);
        //            if (Math.abs(distance) > 30) {
        //                showSlide("最多只能查询30天内的申请单，请调整查询日期间隔！", 3000);
        //                return false;
        //            }
        //            var ReqFormNo = "";
        //            var RegNo = "";
        //            var MedicalRecordNo = "";
        //            var UseSampleNo="";
        //            var TakeRecordNo="";
        //            var FindTxt = $('#txt_FindFast').val();
        //            var queryType = me.queryType;
        //            switch (queryType) {
        //                case "MedicalRecordNo":
        //                    MedicalRecordNo = FindTxt;
        //                    break;
        //                case "RegNo":
        //                    RegNo = FindTxt;
        //                    break;
        //                case "UseSampleNo":
        //                    UseSampleNo = FindTxt;
        //                    break;
        //                case "TakeRecordNo":
        //                    TakeRecordNo = FindTxt;
        //                    break; 
        //                default:
        //                    ReqFormNo = FindTxt;
        //                    break;
        //            }
        //            param.ReqFormNo = ReqFormNo;
        //            param.RegNo = RegNo; 
        //            param.MedicalRecordNo = MedicalRecordNo;
        //            param.UseSampleNo=UseSampleNo;
        //            param.TimeLimit = $('input:checkbox[name=chkTimeLimit]')[0].checked;
        //            param.TakeRecordNo=TakeRecordNo;
        //            me.ReqFormData = null;
        //            me.statisticFlag = false;
        //        },
        onLoadSuccess: function (data) {
            $('.packtrack').linkbutton({ plain: true, iconCls: 'icon-track' });
            //if (me.ReqFormData == null) {
            if (!me.statisticFlag) {
                me.ReqFormData = data;
                StatisticByType();
                me.statisticFlag = true;
            }
            // } 
            if (!data || data.total != "1") {
                //清空所有数据
                ClearAll();
                //进行数据统计 
                return;
            }
            if (data.total == "1") {
                AutoSelect(me.ReqFormGrid, 0);
            }

            //自动选中行，如果上次选中的行在当前数据列表中存在，则仍选中该行，否则选中第一行
            //AutoSelect(me.ReqFormGrid, me.CurrentReqFormDR);
            //进行数据统计
            //if (!me.statisticFlag) {
            //    StatisticByType();
            //    me.statisticFlag = true;
            //}
        },
        onSelect: function (rowIndex, rowData) {
            if (!rowData) {
                return;
            }
            //ID
            me.CurrentReqFormDR = rowData.RowID;
            me.RegNo = rowData.RegNo;
            me.ReqFormNo = rowData.ReqFormNo;
	    // 20210130 未开临床标本时取手工登记标本条码
	    if(rowData.SampleNo == ""){
	    	me.Labno = rowData.UseSampleNo;
	    }else{
	        me.Labno = rowData.SampleNo;
	    }            
            me.CurrentTakeRecordDR = rowData.TakeRecordDR;

            me.XMPlanGrid.datagrid('clearChecked');
            me.XMPlanGrid.datagrid('clearSelections');
            me.XMPlanGrid.datagrid('loadData', []);

            //展示申请单详情 
            LoadReqFormDetail(rowData);
            //加载配血计划 
            RefreshXMPlan(); 
            QryPatInfoByAdmNo(rowData.AdmNo);
            getPatDiffMatchRecord("1");
            LoadXMPlanHistory(rowData.AdmNo);
            var tab = $('#tt').tabs('getSelected');
            var index = $('#tt').tabs('getTabIndex', tab);
            if (index == 2) {
                ShowHistoryTestSet(me.RegNo);
            }
            if (index == "3") {
                LoadIsDifficult();
            }
            me.AdmId = rowData.AdmNo;
            $('#dgMachineXMPlan').datagrid('loadData', []);
			QueryIssuePack(rowData);

        },
        rowStyler: function (index, rowData) {
            if (rowData.machinePlaned == "1") {
                return 'font-weight:bold';
            }
        }

    });
}


function LoadXMPlanHistory(admno) {
    var tab = $('#tt').tabs('getSelected');
    var index = $('#tt').tabs('getTabIndex', tab);
    if (index == 1) {
        $('#dgXMPlanHistory').datagrid({
            url: me.actionUrl + '?Method=QueryXMPlanHistory',
            method: 'get',
            idField: 'RowID',
            sortName: 'RowID',
            sortOrder: "desc",
            fitColumns: false,
            fit: true,
            remoteSort: false,
            singleSelect: true,
            checkOnSelect: false,
            selectOnCheck: false,
            nowrap: false,  //折行
            border: false,
            columns: [[
                    { field: 'RowID', title: 'RowID', hidden: true },
                    {
                        field: 'AddDate', title: '配血时间', width: 180, sortable: true, align: 'center',
                        formatter: function (value, rowData, rowIndex) {
                            return value + " " + rowData.AddTime;
                        }
                    },
                { field: 'RegNo', title: '登记号', width: 90, sortable: true, align: 'center' },
                    { field: 'PackBarcode', title: '献血码', width: 120, sortable: true, align: 'center' },
                    { field: 'ProductBarCode', title: '产品码', width: 70, sortable: true, align: 'center'},
                    {
                        field: 'BloodProductName', title: '血液产品', width: 150, sortable: true, align: 'center'},
                    {
                        field: 'BloodGroupName', title: '血型', width: 120, sortable: true, align: 'center',
                        formatter: function (value, rowData, rowIndex) { 
                            var color = GetBdTypeColor(rowData.ABO, rowData.RH);
                            return '<span style="font-weight:bolder;background:' + color.BackGroundColor + ';color:' + color.FontColor + '" >' + value + '</span>';
                        }
                    },
                    {
                        field: 'PackVolume', title: '血量', width: 60, sortable: true, align: 'center'},
                    {
                        field: 'SurName', title: '姓名', width: 60, sortable: true, align: 'center'},
                   {
                       field: 'AgeDesc', title: '年龄', width: 40, sortable: true, align: 'center'},
                   {field: 'LocationDesc', title: '科室', width: 80, sortable: true, align: 'center'},
				    {field: 'XMAddUser', title: '配血人', width: 60, sortable: true, align: 'center'},
				   {field: 'XMCheckUser', title: '配血审核人', width: 60, sortable: true, align: 'center'},
				   {field: 'IssueUser', title: '发血人', width: 60, sortable: true, align: 'center'},
                   {field: 'Diagnosis', title: '诊断', width: 300, sortable: true, align: 'center'}
            ]],
            onBeforeLoad: function (param) {
                if (!admno) {
                    return false;
                }
                param.admNo = admno;
            }
        });
    }
}

function formatOper(PackDR) {
    return '<a  class="packtrack" title="血液追踪" onclick="showpacktransWin(' + PackDR + ')"></a>';
}
function Print() {
	ExportGridToExcel("配血收明细导出", $('#ReqFormData'));
   
}
///加载配血计划
function LoadXMPlan() {
    me.XMPlanGrid.datagrid({
        //url: me.actionUrl + '?Method=QueryXMPlan',
        method: 'get',
        //setGrid: true,
        idField: 'RowID',
        sortName: 'RowID',
        sortOrder: "desc",
        fitColumns: false,
        fit: true,
        rownumbers: true,
        remoteSort: false,
        singleSelect: true,
        checkOnSelect: false,
        selectOnCheck: false,
        nowrap: false,  //折行
        border: false,
        columns: [[
                    { field: 'RowID', title: 'ID', checkbox: true },
                    {
                        field: 'operate', title: '操作', width: 30, align: 'left',
                        formatter: function (value, row, index) {
                            if (row.CostItemInfo.length > 0 || row.IsFinished == "1") {
                                return "";
                            }
                            return '<img src="../../resource/easyui/themes/icons/delete.png" onclick="DeleteXMPlan(' + JSON.stringify(row).replace(/"/g, "'") + ');" />';
                        }
                    },
                    {
                        field: 'PackID', title: '献血码', width: 200, sortable: true, align: 'center',
                        formatter: function (value, rowData, rowIndex) {
                            var retValue = ""
                            if (rowData.moreMatch == "1") {
                                retValue = retValue + getIconHtml("多", "", "", "QryPackMoreMatch(" + rowData.PackDR + ")", "一血多配");
                            }
                            if (rowData.IsNoticed == "1") {
                                retValue = retValue + getIconHtml("通", "", "#BBE260", "", "");
                            }
                            if (rowData.IsBldDifficult == "1") {
                                retValue = retValue + getIconHtml("疑", "", "#D02090", "", "");
                            }
                            if (rowData.IsVerified == "1") {
                                retValue = retValue + getIconHtml("校", "", "#66CCCC", "", "");
                            }
                            return value + " " + retValue + formatOper(rowData.PackDR);

                        }
                    },
                    { field: 'ProductBarcode', title: '产品码', width: 80, sortable: true, align: 'center' },
                    { field: 'BloodProductName', title: '血液产品', width: 140, sortable: true, align: 'center' },
                    {
                        field: 'BloodGroupName', title: '血型组', width: 100, sortable: true, align: 'center',
                        formatter: function (value, rowData, rowIndex) {
                            //var BloodGroup = rowData.Plan.Pack.BloodGroup;
                            var color = GetBdTypeColor(rowData.ABO, rowData.RH);
                            return '<span style="font-size:14px;font-weight:bolder;background:' + color.BackGroundColor + ';color:' + color.FontColor + '" >' + value + '</span>';
                        }
                    },
                    { field: 'PackVolume', title: '血量', width: 50, sortable: true, align: 'center' },
                     {
                         field: 'XMResultStr', title: '结果', width: 40, sortable: true, align: 'center',
                         formatter: function (value, rowData, rowIndex) {
                             if (rowData.MajorXMResultCode == "") {
                                 return "";
                             }
                             if (rowData.MajorXMResultCode == "XMR1" && rowData.MinorXMResultCode == "XMR1") {
                                 return "<i class=\'fa fa-check-circle-o\' style='font-size:20px;color:blue;' onmouseenter='getResultNoes(1)'></i>";
                             }
                             else if (rowData.MajorXMResultCode == "XMR2") {
                                 return "<i class=\'fa fa-times-circle\'  style='font-size:20px;color:red;' onmouseenter='getResultNoes(3)'></i>";
                             }
                             else if (rowData.MajorXMResultCode == "XMR1" && rowData.MinorXMResultCode == "XMR2") {
                                 return "<i class=\'fa fa-exclamation-circle\' style='font-size:20px;color:yellow;' onmouseenter='getResultNoes(2)'></i>";
                             }
                         }
                     },
                    {
                        field: 'TransactionDR', title: '状态', width: 60, sortable: true, align: 'center',
                        styler: function (value, row, index) {
                            var color = "";
                            if (row.TransactionCode == "BloodMatchFail") {
                                color = "#f06d4f";
                            }
                            if (row.TransactionCode == "CancelIssueXMPlan") {
                                color = "#f06d4f";
                            }
                            if (row.TransactionCode == "UnCheckXMPlan") {
                                color = "#f06d4f";
                            }
                            if (row.TransactionCode == "CheckXMPlan") {
                                color = "#3db7cd";
                            }
                            if (row.TransactionCode == "IssueXMPlan") {
                                color = "#9bba5e";
                            }
                            return 'background-color:' + color;
                        },
                        formatter: function (value, rowData, rowIndex) {
                            //血袋状态
                            // var status = GetPropertyValue(rowData.Plan.Pack, "PackStatus");  
                            return rowData.TransactionName;
                        }
                    },
                    {
                        field: 'CostItems', title: '费用', width: 260, sortable: true, align: 'center',
                        formatter: function (value, rowData, rowIndex) {
                            var items = rowData.CostItemInfo;
                            if (items.length <= 0) {
                                return 0;
                            }
                            var html = '<table><tr>';
                            var feeIndex = 0;
                            var rows = [];
                            rows.push(rowData);
                            var fees = GenerateCostTypeHash(rows);
                            for (fee in fees) {
                                feeType = fees[fee];
                                feeIndex++;
                                var feeGenus = fee;
                                if (!fee) {
                                    feeGenus = "em";
                                }
                                html += '<td>';
                                html += '<span id="ShowXMPlanFee_' + rowData.RowID + '_' + feeIndex + '" InitFlag="0" onmouseenter="ShowXMPlanFee(\'' + rowData.CostItemInfo + '\',\'ShowXMPlanFee_' + rowData.RowID + '_' + feeIndex + '\');">' + GetReqFormCostItemCostType(fee) + ':' + feeType.total.toFixed(2) + '</span>';
                                html += '</td>';
                            }
                            html += '</tr></table>';
                            return html;
                        }
                    },
                   {
                       field: 'ExpiredDate', title: '失效时间', width: 145, sortable: true, align: 'center',
                       formatter: function (value, rowData, rowIndex) {
                           return value + " " + rowData.ExpiredTime;
                       }
                   },
                    {
                        field: 'PackStatusName', title: '血液状态', width: 50, sortable: true, align: 'center',
                        formatter: function (value, rowData, rowIndex) {
                            //血袋状态
                            //                            var status = GetPropertyValue(rowData.Plan.Pack, "PackStatus");
                            //                            if (status) {
                            return '<strong style="color:' + rowData.PackStatusColor + ';">' + value + '</strong>';
                            //                            } 
                        }
                    },
                     {
                         field: 'AddDate', title: '配血时间', width: 145, sortable: true, align: 'center',
                         formatter: function (value, rowData, rowIndex) {
                             return value + " " + rowData.AddTime;
                         }
                     },
                    { field: 'AddUser', title: '配血用户', width: 60, sortable: true, align: 'center' },
                     {
                         field: 'XMCheckDate', title: '审核时间', width: 140, sortable: true, align: 'center',
                         formatter: function (value, rowData, rowIndex) {
                             return value + " " + rowData.XMCheckTime;
                         }
                     },
                    { field: 'XMCheckUser', title: '审核用户', width: 60, sortable: true, align: 'center' },
                     { field: 'XMPlanNo', title: '配血单号', width: 120, sortable: true, align: 'center' }
        ]],
        toolbar: '#XMPlanToolBar',
        //        onBeforeLoad: function (param) {
        //            param.ReqFormDR = me.CurrentReqFormDR;
        //            if (!param.ReqFormDR || param.ReqFormDR < 1) {
        //                return false;
        //            }
        //            var rows = me.XMPlanGrid.datagrid('getRows');
        //            DeleteRows(me.XMPlanGrid, rows);
        //            me.XMPlanData = null;
        //            $('#SpecialProduct').html('');
        //            $('#spanXMatchInfo').html('');
        //            //清空所有的配血实验数据
        //            LoadXMPlanTest(me.DefaultXMTest);

        //        },
        onResizeColumn: function (field, width) {
            me.XMPlanGrid.datagrid("fixRownumber");
        },
        onDblClickRow: function (index, row) {
            // showpacktransWin(row.PackDR);
        },
        onLoadSuccess: function (data) {
            if (me.XMPlanData == null) {
                me.XMPlanData = data;
            }
            var rows = data.rows;
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                if (row.IsSpecial == "1") {
                    $('#SpecialProduct').html('特').css('font-weight', 'bolder').css('color', 'red').css('font-size', '15px');
                }
                if (row.BloodGroupDR != me.CompositeBloodGroup.RowID) {
                    $('#spanXMatchInfo').html('异型配血').css('font-weight', 'bolder').css('color', 'red').css('font-size', '20px');
                }
            }
            $('.packtrack').linkbutton({ plain: true, iconCls: 'icon-track' });
            //if(data.total>0)
            // {
            //加载费用
            LoadCostItem();
            // }
            //             var componentsVols = StateIssueComponentsVol();
            //             for (index in componentsVols) {
            //                  componentsVols = componentsVols[index];
            //             }
            //自动选中行，如果上次选中的行在当前数据列表中存在，则仍选中该行，否则选中第一行
            //AutoSelect(me.XMPlanGrid, 0);  
            me.XMPlanGrid.datagrid("fixRownumber");
        },
        onSelect: function (rowIndex, rowData) {
            if (!rowData) {
                return;
            }
            me.CurrentXMPlanDR = rowData.RowID;
            LoadXMPlanTest(rowData);
            if (rowData.XMLastResultDR == "" && rowData.IsXMatchProduct == "1") {
                LoadProductDefXMMethod(rowData.ProductBarcode);
                LoadProductDefMinorXMResult(rowData.ProductBarcode);
                LoadProductDefMajorXMResult(rowData.ProductBarcode);
                LoadXMPlanTest(me.DefaultXMTest, true);
            }
            ChangeBtnStateByPlan(rowData.Plan);

            if (document.getElementById('com_Minor_BBXMResult') != null && $('#com_Minor_BBXMResult').combobox('getText') == "不合" && rowData.Remark == "") {
                $('#textarea_Remark').val('次侧结果不合，必要时请少量、慢速输血，并密切观察，如发生输血反应，应立即停止输注！！');
            }
            else {
                $('#textarea_Remark').val(rowData.Remark);
            }

        },
        onCheck: function (index, rowData) {
//            if (rowData.IsNoticed == "1") {
//                InformFlag = "0";
//                $('#btn_XMPlan_Inform').linkbutton({ text: '取消通知' });
//            }
//            else {
//                InformFlag = "1";
//                $('#btn_XMPlan_Inform').linkbutton({ text: '通知取血' });
//            }
        },
        onUncheck: function (index, rowData) {
//            var rows = me.XMPlanGrid.datagrid("getChecked");
//            for (var id = 0; i < rows.length; i++) {
//                var row = rows[i];
//                if (row.IsNoticed == "1") {
//                    InformFlag = "0";
//                    $('#btn_XMPlan_Inform').linkbutton({ text: '取消通知' });
//                }
//                else {
//                    InformFlag = "1";
//                    $('#btn_XMPlan_Inform').linkbutton({ text: '通知取血' });
//                    break;
//                }
//            }
        },
        rowStyler: function (index, rowData) {
            if (rowData.RowID == "") {//条件                    
                return 'display:none';
            }
			if (rowData.BloodGroupDR != me.CompositeBloodGroup.RowID){
			    return 'background-color:#9966FF;color:#fff;';
		    }
            if (rowData.TransactionCode == "MachineXMPlan") {
                return 'font-weight:bold';
            }
        }
    });
}

function QueryIssuePack(rowData){
	var params = {};
    params.AdmNo = rowData.AdmNo;
	params.RegNo = rowData.RegNo;
	$.ajax({
        url: me.actionUrl + '?Method=QryIssuePack',
        method: 'post',
        data: params,
        success: function (returnData) {
            
				var PackVolume=returnData.rows;
				var PackStr=""
				for (var i = 0; i < PackVolume.length; i++) {
					if (PackStr == "") PackStr = "发血成分汇总：" + PackVolume[i].BDComponentCName + ":" + PackVolume[i].PackVolume;
					else PackStr=PackStr + "," + PackVolume[i].BDComponentCName + ":" + PackVolume[i].PackVolume;
				}
				$("#div_IssuePack").html(PackStr);
            
        }
    });
}

///显示配血计划费用
function ShowXMPlanFee(geners, containerID) {
    //    var rows = me.XMPlanGrid.datagrid('getRows');
    //    var rowID = containerID.split('_')[1]; 
    var reqforminfo = me.ReqFormGrid.datagrid('getSelected');
    var rows = geners.split('^');
    var data = [];
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        //if (row.RowID == rowID) {
        //data = row.CostItems; 
        var item = {};
        item.CostItemName = row.split('@')[1];
        item.Price = row.split('@')[2];
        item.Quantity = row.split('@')[3];
        item.HISOrderStatus = row.split('@')[4];
        item.ItemStatus = row.split('@')[5];
        item.AdmType = reqforminfo.AdmType;
        data.push(item);
        // }
    }
    ShowFeeDetails(geners, data, containerID);
}


///加载配血实验结果
function LoadXMPlanTest(rowData, isNotLoadPack) {
    if (!isNotLoadPack) {
        $('#txt_XMPlan_SelectPack').val(rowData.PackBarcode);
        // LoadPackInfo(rowData.Pack);
        if (rowData.PackBarcode != "") {
            var htm = "";
            htm += '<span style="font-weight:bolder;">' + rowData.PackBarcode + '</span>&nbsp;&nbsp;&nbsp;&nbsp;';
            //血液产品
            htm += rowData.BloodProductName + '&nbsp;&nbsp;&nbsp;&nbsp;';
            //血型组 
            var color = GetBdTypeColor(rowData.ABO, rowData.RH);
            htm += '<span  style="font-size:14px;font-weight:bolder;background-color:' + color.BackGroundColor + ';color:' + color.FontColor + '">' + rowData.BloodGroupName + '</span>&nbsp;&nbsp;&nbsp;&nbsp;';
            //血量
            htm += rowData.PackVolume + '&nbsp;&nbsp;&nbsp;&nbsp;';
            //有效日期
            //  htm += ConvertDate(pack.ExpiredDate, 1) + " " + ConvertTime(pack.ExpiredTime) + '&nbsp;&nbsp;&nbsp;&nbsp;';
            //是否交叉配血
            if (rowData.IsXMatchProduct == "1") {
                //htm += "需要进行交叉配血实验";
                $('#IsXMatchProduct').val(1);
                $('#btn_XMPlan_history').linkbutton('enable');

            } else {
                $('#IsXMatchProduct').val("");
                $('#btn_XMPlan_history').linkbutton('disable');
            }
            $('#currentPack').html(htm);
            $('#currentPackDR').val(rowData.PackDR);
            $('#currentPackBarcode').val(rowData.PackBarcode);
        }
        else {
            $('#currentPackDR').val(rowData.PackDR);
            $('#currentPackBarcode').val("");
            $('#IsXMatchProduct').val("");
            $('#currentPack').html("");
        }
    }
    // if (rowData.Pack && !rowData.Pack.BloodProduct.IsXMatchProduct) {

    $('#com_BBXMMethod').combobox('setValue', rowData.XMMethodDR);
    $('#com_BTMIMachineParameter').combobox('setValue', rowData.MachineParameterDR);

    $('#com_Major_BBXMDepict').combobox('setValue', rowData.MajorXMDepictDR);
    $('#com_Major_BBXMConclusion').combobox('setValue', rowData.MajorXMConclusionDR);
    $('#com_Major_BBXMResult').combobox('setValue', rowData.MajorXMResultDR);

    $('#com_Minor_BBXMDepict').combobox('setValue', rowData.MinorXMDepictDR);
    $('#com_Minor_BBXMConclusion').combobox('setValue', rowData.MinorXMConclusionDR);
    $('#com_Minor_BBXMResult').combobox('setValue', rowData.MinorXMResultDR);

    $('#com_BBXMLastResult').combobox('setValue', rowData.XMLastResultDR);
    $('#textarea_Remark').val(rowData.Remark);
    //    if (rowData.PackBarcode!="") {
    //        LoadXMPlanTestDisableCof(rowData.IsXMatchProduct=="1"?true:false);
    //    }
    LoadXMPlanTestDisableCof($('#IsXMatchProduct').val());
}

///根据是否需要进行交叉配血来控制配血实验的结果的填写情况
function LoadXMPlanTestDisableCof(IsXMatchProduct) {
    if (!IsXMatchProduct) {
        $('#com_BBXMMethod').combobox('disable');
        $('#com_BTMIMachineParameter').combobox('disable');
        $('#com_Major_BBXMDepict').combobox('disable');
        $('#com_Major_BBXMConclusion').combobox('disable');
        $('#com_Major_BBXMResult').combobox('disable');
        $('#com_Minor_BBXMDepict').combobox('disable');
        $('#com_Minor_BBXMConclusion').combobox('disable');
        $('#com_Minor_BBXMResult').combobox('disable');
        $('#com_BBXMLastResult').combobox('disable');
    } else {
        $('#com_BBXMMethod').combobox('enable');
        $('#com_BTMIMachineParameter').combobox('enable');
        $('#com_Major_BBXMDepict').combobox('enable');
        $('#com_Major_BBXMConclusion').combobox('enable');
        $('#com_Major_BBXMResult').combobox('enable');
        $('#com_Minor_BBXMDepict').combobox('enable');
        $('#com_Minor_BBXMConclusion').combobox('enable');
        $('#com_Minor_BBXMResult').combobox('enable');
        $('#com_BBXMLastResult').combobox('enable');
    }
}

//加载血袋信息
function LoadPackInfo(pack, IsBldDifficult) {
    var htm = '';
    me.IsCanCreatePlan = "Y";
    me.NotCreatePlanMessage = "";
    if (pack) {
        //血袋条码
        htm += '<span style="font-weight:bolder;">' + pack.PackBarcode + '</span>&nbsp;&nbsp;&nbsp;&nbsp;';
        //血液产品
        htm += pack.BloodProductName + '&nbsp;&nbsp;&nbsp;&nbsp;';
        //血型组 
        var color = GetBdTypeColor(pack.ABO, pack.RH);
        htm += '<span  style="font-size:14px;font-weight:bolder;background-color:' + color.BackGroundColor + ';color:' + color.FontColor + '">' + pack.BloodGroupName + '</span>&nbsp;&nbsp;&nbsp;&nbsp;';
        //血量
        htm += pack.PackVolume + pack.Units + '&nbsp;&nbsp;&nbsp;&nbsp;';
        //有效日期
        //  htm += ConvertDate(pack.ExpiredDate, 1) + " " + ConvertTime(pack.ExpiredTime) + '&nbsp;&nbsp;&nbsp;&nbsp;';
        //是否交叉配血
        if (pack.IsXMatchProduct == "1") {
            //htm += "需要进行交叉配血实验";
            $('#IsXMatchProduct').val(1);
        } else {
            $('#IsXMatchProduct').val("");
        }
        $('#IsBGChecked').val(pack.IsBGChecked);
        var packCheckABORes = ""; packCheckABOCode = ""; packCheckRHRes = ""; packCheckRHCode = "";
        /*
       if(pack.Others.packTestRes)
       {
         if(pack.Others.packTestRes.length>0)
         { 
           for(var i=0;i<pack.Others.packTestRes.length;i++)
           {
             if(pack.Others.packTestRes[i].TestCode.SCode.toUpperCase()=="ABO")
             {
               packCheckABORes=pack.Others.packTestRes[i].Result;
               packCheckABOCode=pack.Others.packTestRes[i].ResNotes.split("^")[0];
             }
              if(pack.Others.packTestRes[i].TestCode.SCode.toUpperCase()=="RH")
             {
               packCheckRHRes=pack.Others.packTestRes[i].Result;
               packCheckRHCode=pack.Others.packTestRes[i].ResNotes.split("^")[0];
             }
             if(pack.Others.packTestRes[i].ResNotes.split("^").length>1)
             {
                if(pack.Others.packTestRes[i].ResNotes.split("^")[1]!="N"&& pack.Others.packTestRes[i].ResNotes.split("^")[1]!="")
               {
                 me.IsCanCreatePlan="N";
                 if(me.NotCreatePlanMessage=="")
                 {
                   me.NotCreatePlanMessage="检测项目["+pack.Others.packTestRes[i].TestCode.CName +"],";
                 }
                 else 
                 {
                   me.NotCreatePlanMessage+="["+pack.Others.packTestRes[i].TestCode.CName +"],";
                 }
               }
             }  
           } 
           if(me.NotCreatePlanMessage.length>0)
           {
            me.NotCreatePlanMessage+="结果异常,";
           }
         }
         color = GetBdTypeColor(packCheckABOCode, packCheckRHCode);
         if(color)
         {
          htm += '<span  style="font-size:14px;font-weight:bolder;background-color:' + color.BackGroundColor + ';color:' + color.FontColor + '">' + packCheckABORes+packCheckRHRes + '</span>&nbsp;&nbsp;&nbsp;&nbsp;';
         } 
         if(packCheckABOCode!=""&& packCheckRHCode !="")
          {
            if(packCheckABOCode!=pack.BloodGroup.ABO||packCheckRHCode!=pack.BloodGroup.RH)
            {
              me.IsCanCreatePlan="N";
              me.NotCreatePlanMessage+="血液检测结果与血液入库结果不一致,";
            } 
          }
        }
        */
        htm += '<img src="../../resource/common/images/menus/laborder.ico" onclick="SaveBdPackTestRes(' + pack.RowID + ');" title="血液复检" height="15" width="15" />';
        if (IsBldDifficult) {
            $('#BldcurrentPackDR').val(pack.RowID);
            $('#BldcurrentPackBarcode').val(pack.PackBarcode);
            $('#txt_XMPlan_BldSelectPack').val(pack.PackBarcode);
        } else {
            $('#currentPackDR').val(pack.RowID);
            $('#currentPackBarcode').val(pack.PackBarcode);
            $('#txt_XMPlan_SelectPack').val(pack.PackBarcode);
        }
    } else {
        if (IsBldDifficult) {
            $('#BldcurrentPackDR').val("");
            $('#BldcurrentPackBarcode').val("");
            $('#BldIsXMatchProduct').val("");
        }
        else {
            $('#currentPackDR').val("");
            $('#currentPackBarcode').val("");
            $('#IsXMatchProduct').val("");
        }
    }
    if (IsBldDifficult) {
        $('#BldcurrentPack').html(htm);
    }
    else {
        $('#currentPack').html(htm);
        if ($('#IsXMatchProduct').val() != "1") {
            $('#btn_XMPlan_history').linkbutton('disable');
        }
        else {
            $('#btn_XMPlan_history').linkbutton('enable');
        }
    }

}

///创建配血计划
function SaveXMPlan() {
    var packs_tmp = me.PackGrid.datagrid('getChecked');
    if (packs_tmp.length < 1) {
        showInfo("请勾选血袋！");
        return;
    }
    //过滤掉已经创建了配血计划的血袋
    //todo
    var XMatchPack = "";
    var packs = [];
    var pack_NoBGCheck = [];
    var plans = me.XMPlanGrid.datagrid('getRows');
    for (var j = 0; j < packs_tmp.length; j++) {
        var t_pack = packs_tmp[j];
        var isExist = false;
        if (t_pack.IsBGChecked != "1") {
            pack_NoBGCheck.push(t_pack.PackID);
        }
        for (var i = 0; i < plans.length; i++) {
            var t_plan = plans[i];
            if (t_pack.RowID == t_plan.PackDR) {
                isExist = true;
                break;
            }
        }
        if (!isExist) {
            var item = {};
            item.RowID = t_pack.RowID;
            packs.push(item);
            if (t_pack.BloodGroupDR != me.CompositeBloodGroup.RowID) {
                XMatchPack = "1";
            }
        }
    }

    if (packs.length < 1) {
        showInfo("请勾选没有创建过配血计划的血袋！");
        return;
    }
    if (pack_NoBGCheck.length > 0) {
        showInfo("您选择的配血计划（血袋条码“" + pack_NoBGCheck.join(',') + "”）还没有进行血型复查！");
        return;
    }

    var matchpackissue = "";
    if (XMatchPack == "1") {
        $.messager.confirm('提示信息', '患者血型与供者血型不符，是否继续配血？', function (isClickedOk) {
            if (isClickedOk) {
                matchpackissue = "1";
                if (bloodissue == "1" && sasissue == "1") {
                    showwin("#win_EntryLogin", "", "../form/frmCancelIssueLogin.aspx?funcode=XMatchPack&Packs=" + JSON.stringify(packs), 420, 300, true);
                    $('#win_EntryLogin').parent().css("background", "#FFFFFF");
                    $('#win_EntryLogin').attr("class", "easyui-window panel-body panel-body-noheader panel-body-noborder");

                    matchpackissue = "0";
                }
            }
            else {
                matchpackissue = "0";
            }
        });
    }
    else {
        matchpackissue = "1";
    }

    var sasissue = "";
    if (me.PatientBloodSAS) {
        if (me.PatientBloodSAS.AbFlag == "A" || me.PatientBloodSAS.AbFlag == "S") {
            $.messager.confirm('提示信息', '患者抗筛结果异常，是否继续配血？', function (isClickedOk) {
                if (isClickedOk) {
                    sasissue = "1";
                    if (bloodissue == "1" && matchpackissue == "1") {
                        SaveXMPlanDo(packs, "");
                        sasissue = "0";
                    }
                }
                else {
                    sasissue = "0";
                }
            });
        }
        else {
            sasissue = "1";
        }
    }
    else {
        sasissue = "1";
    }
    var bloodissue = "";
    if (me.CompositeBloodGroup.RH == "N") {
        $.messager.confirm('提示信息', '患者为阴性血，是否继续配血？', function (isClickedOk) {
            if (isClickedOk) {
                bloodissue = "1";
                if (sasissue == "1" && matchpackissue == "1") {
                    SaveXMPlanDo(packs, "");
                    bloodissue == "0";
                };
            }
            else {
                bloodissue = "0";
            }
        });
    }
    else {
        bloodissue = "1";
        if (sasissue == "1" && matchpackissue == "1") {
            SaveXMPlanDo(packs, "");
            bloodissue = "0";
        };
    }
}

function SaveXMPlanDo(packs, planAddUserDR) {
    var PackDRs = "";
    for (var i = 0; i < packs.length; i++) {
        PackDRs += packs[i].RowID + "^";
    }
    if (PackDRs != "") {
        PackDRs = PackDRs.substring(0, PackDRs.length - 1);
    }

    var params = {};
    var plan = {};
    plan.P0 = PackDRs;
    plan.P1 = ($('#com_BBXMMethod').combobox('getValue') == "" ? me.DefaultXMTest.XMMethodDR : $('#com_BBXMMethod').combobox('getValue'));
    plan.P2 = $('#com_BTMIMachineParameter_pack').combobox('getValue');
    //   plan.P3=Plan.MajorXMDepictDR+"^"+Plan.MajorXMDepictStr;
    //   plan.P4=Plan.MajorXMResultDR+"^"+Plan.MajorXMResultStr;
    //   plan.P5=Plan.MajorXMConclusionDR+"^"+Plan.MajorXMConclusionStr;
    //   plan.P6=Plan.MinorXMDepictDR+"^"+Plan.MinorXMDepictStr;
    //   plan.P7=Plan.MinorXMResultDR+"^"+Plan.MinorXMResultStr;
    //   plan.P8=Plan.MinorXMConclusionDR+"^"+Plan.MinorXMConclusionStr;
    //   plan.P9=Plan.XMLastResultDR+"^"+Plan.XMLastResultStr;
    plan.P10 = me.CompositeBloodGroup.CName;
    plan.P11 = $('#patientBloodSAS').html();
    plan.P12 = $('#patientPhenotype').html();
    plan.P13 = $('#textarea_Remark').val();
    params.Plan = JSON.stringify(plan);
    params.ReqFormDR = me.CurrentReqFormDR;
    var e = e || window.event;
    openLoading("btn_XMPlan_save", e);
    $('#btn_XMPlan_save').linkbutton('disable');

    $.ajax({
        url: me.actionUrl + '?Method=SaveXMPlan',
        method: 'post',
        data: params,
        success: function (r) {
            if (r.IsOk) {
                showSlide(r.Message, 3000);
                RefreshXMPlan();
                //取消选定
                me.PackGrid.datagrid('clearChecked');
                DeleteRows(me.PackGrid, packs);
            } else {
                showError(r.Message);
            }
        },
        //在ajax发送之前禁止按钮，并且给出“正在处理”的提示
        //beforeSend: function (XMLHttpRequest) {
          
        //},
        //在ajax成功返回之后释放按钮，并且隐藏提示
        complete: function (XMLHttpRequest, textStatus) {
            closeLoading("btn_XMPlan_save");
            $('#btn_XMPlan_save').linkbutton('enable');
        }
    });
}

function LoadPatVisitnum() {
    $('#com_PatVisitNum').combogrid({
        url: me.actionUrl + '?Method=QryPatVisitNum',
        method: 'post',
        idField: 'RowID',
        fitColumns: true,
        fit: true,
        remoteSort: false,
        singleSelect: false,
        nowrap: false,  //折行
        border: false,
        columns: [[///血袋条码,血制品条码,血液产品,血量,血型组,有效日期,
                    { field: 'RowID', title: 'ID', hidden: true },
                    { field: 'VisitNumber', title: '检验号', width: 100, sortable: true, align: 'center' },
                    { field: 'ReceiveDate', title: '接收日期', width: 80, sortable: true, align: 'center' },
                    { field: 'ReceiveTime', title: '接收时间', width: 70, sortable: true, align: 'center' }

        ]],
        onBeforeLoad: function (param) {
            param.ReqFormDR = me.CurrentReqFormDR;
            if (!param.ReqFormDR || param.ReqFormDR < 1) {
                return false;
            }
            var reqFormDto = GetObjectByID(me.ReqFormData.rows, me.CurrentReqFormDR);
            param.RegNo = reqFormDto.RegNo;
        }
    });
}

///加载匹配血袋
function LoadPack(packBarCode) {
    me.PackGrid.datagrid({
        url: me.actionUrl + '?Method=QueryPack',
        method: 'post',
        idField: 'RowID',
        //        sortName: 'ExpiredDate',
        //        sortOrder: "asc",
        fitColumns: false,
        fit: true,
        remoteSort: false,
        singleSelect: false,
        nowrap: false,  //折行
        border: false,
        columns: [[///血袋条码,血制品条码,血液产品,血量,血型组,有效日期,
                    { field: 'RowID', title: 'ID', checkbox: true, width: 30, sortable: true, align: 'center' },
                    {
                        field: 'operate', title: '操作', width: 30, align: 'left',
                        formatter: function (value, row, index) {
                            if (row.IsBGChecked == "1") {
                                return "";
                            }
                            return '<img src="../../resource/easyui/themes/icons/accept.png" onclick="UpdatePackBGCheckInfo(' + row.RowID + ');" />';
                        }
                    },
                    { field: 'PackBarcode', title: '献血码', width: 145, sortable: true, align: 'center' },
                    { field: 'ProductBarcode', title: '产品码', width: 95, sortable: true, align: 'center' },
                    { field: 'ProductName', title: '血液产品', width: 140, sortable: true, align: 'center' },
                    { field: 'BloodGroupName', title: '血型组', width: 110, sortable: true, align: 'center' },
                    { field: 'PackVolume', title: '血量', width: 40, sortable: true, align: 'center' },
                    {
                        field: 'ExpiredDate', title: '失效时间', width: 120, sortable: true, align: 'center',
                        formatter: function (value, rowData, rowIndex) {
                            return rowData.ExpiredDate + " " + rowData.ExpiredTime;
                        }
                    },
                    {
                        field: 'IsXMatchProduct', title: '是否交叉配血', width: 50, sortable: true, align: 'center',
                        formatter: function (value, rowData, rowIndex) {
                            if (rowData.IsXMatchProduct == "1") {
                                return "是";
                            }
                            return "否";
                        }
                    },
                    {
                        field: 'IsBGChecked', title: '血型是否复查', width: 50, sortable: true, align: 'center',
                        formatter: function (value, rowData, rowIndex) {
                            if (rowData.IsBGChecked == "1") {
                                return "是";
                            }
                            return "否";
                        }
                    },
                    { field: 'Phenotype', title: 'RH表型', width: 50, sortable: true, align: 'center' },
                    { field: 'PackPositionName', title: '血液位置', width: 70, sortable: true, align: 'center' },
                    { field: 'SpecimenRackName', title: '标本位置', width: 70, sortable: true, align: 'center' },
                    {
                        field: 'PlanDate', title: '预配时间', width: 120, sortable: true, align: 'center',
                        formatter: function (value, rowData, rowIndex) {
                            return rowData.PlanDate + " " + rowData.PlanTime;
                        }
                    },
                    { field: 'SpecimenNo1', title: '血标本1', width: 60, sortable: true, align: 'center' },
                    { field: 'SpecimenNo2', title: '血标本2', width: 60, sortable: true, align: 'center' },
                    { field: 'SpecimenNo3', title: '血标本3', width: 60, sortable: true, align: 'center' }
        ]],
        toolbar: '#PackToolBar',
        onBeforeLoad: function (param) {
            param.ReqFormDR = me.CurrentReqFormDR;
            if (!param.ReqFormDR || param.ReqFormDR < 1) {
                return false;
            }
            me.PackGrid.datagrid('clearChecked');
            var reqFormDto = GetObjectByID(me.ReqFormData.rows, me.CurrentReqFormDR);
            var products = reqFormDto.ReqProductInfo.split('^');
            //var Product = products[0];
            param.RegNo = reqFormDto.RegNo;
            param.ReqProductDRs = [];
            param.ReqVolumns = [];
            for (var i = 0; i < products.length; i++) {
                param.ReqProductDRs.push(products[i].split('@')[0]);
                param.ReqVolumns.push(products[i].split('@')[6]);
            }

            param.BloodGroupDR = me.CompositeBloodGroup.RowID;
            param.LisBloodGroupDR = me.PatientBloodGroup.RowID;
            //param.Volumn = Product.Volumn;
            ///根据当前的CurrentReqFormDR获取当前的ReqForm的相关信息
            $.each($('input:radio[name=XMType]'), function (i, e) {
                if (e.checked) {
                    param.XMType = $(e).val();
                }
            });
            param.IsVolumnFit = $('input:checkbox[name=IsVolumnFit]')[0].checked;
            param.sortType = "";
            //            if($('input:checkbox[name=phoType]')[0].checked)
            //            {
            //              param.sortType="phoType";
            //            }
            $('#txt_AddPack').val(packBarCode)
            param.packBarCode = $('#txt_AddPack').val();
            param.Phenotype = $('#patientPhenotype').html();
            packBarCode = "";
            me.PackData = null;
        },
        onLoadError: function (resp) {
            showSlide(resp.responseText);
            me.PackData == null;
            me.PackGrid.datagrid('loadData', []);
            return;
        },
        onLoadSuccess: function (data) {
            if (me.PackData == null) {
                me.PackData = data;
            }
        },
        onCheck: function (index, row) {
            var rows = $(this).datagrid('getChecked');
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].IsBGChecked != "1") {
                    $('#PackBGCheck').linkbutton('enable');
                    return;
                }
            }
            $('#PackBGCheck').linkbutton('disable');
        },
        onUncheck: function (index, row) {
            var rows = $(this).datagrid('getChecked');
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].IsBGChecked != "1") {
                    $('#PackBGCheck').linkbutton('enable');
                    return;
                }
            }
            $('#PackBGCheck').linkbutton('disable');
        },
        onCheckAll: function (rows) {
            var rows = $(this).datagrid('getChecked');
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].IsBGChecked != "1") {
                    $('#PackBGCheck').linkbutton('enable');
                    return;
                }
            }
            $('#PackBGCheck').linkbutton('disable');
        },
        onUncheckAll: function (rows) {
            var rows = $(this).datagrid('getChecked');
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].IsBGChecked != "1") {
                    $('#PackBGCheck').linkbutton('enable');
                    return;
                }
            }
            $('#PackBGCheck').linkbutton('disable');
        }
    });
}

//扫描血袋进行配血计划
function CheckPack() {
    var PackBarcode = $('#txt_AddPack').val();
    if (PackBarcode == "") {
        showError('请输入血袋条码！');
      //  return false;
    }
	var filteredData = me.PackGrid.datagrid('getChecked');
	var packBarcode = GetPackNo($('#txt_AddPack').val(), me.PackIdLength);
    var packs = me.PackData.rows; 
    for(var i=0;i<packs.length;i++)
    {
		if (ContainSearch(packs[i].PackBarcode,packBarcode)) {
			filteredData.push(packs[i]);
        } 
    }
    me.PackGrid.datagrid('loadData', filteredData); 
    
	
    PackBarcode = GetPackNo(PackBarcode, me.PackIdLength);
    $('#txt_AddPack').val(PackBarcode);
    //var packs = me.PackData.rows;
    var packs1 = me.PackGrid.datagrid('getRows');
    Checkedflag = false;
    for (var i = 0; i < packs1.length; i++) {
        var p = packs1[i];
        if (p.PackBarcode == PackBarcode) {
            me.PackGrid.datagrid('checkRow', i);
            Checkedflag = true;
            break;
        }
    }
    if (!Checkedflag) {
        showError('您输入的血袋条码在当前数据中不存在！');
        return false;
    }
    return true;
}


var xmplandr = 0;
var Checkedflag = false;
//扫描血袋进行配血实验
function XMPlanSelectPack() {
    var PackBarcode = $('#txt_XMPlan_SelectPack').val();
    if (PackBarcode == "") {
        //        showInfo('请输入血袋条码！');
        //加载血袋信息
        LoadPackInfo(null);
        return false;
    }
    PackBarcode = GetPackNo(PackBarcode, me.PackIdLength);
    $('#txt_XMPlan_SelectPack').val(PackBarcode);
    var ProductBarCode = GetProductBarCode($('#txt_XMPlan_ProductBarcode').val());

    var packs = me.XMPlanData.rows;
    Checkedflag = false;
    for (var i = 0; i < packs.length; i++) {
        var p = packs[i];
        if (p.PackBarcode == PackBarcode) {
            me.XMPlanGrid.datagrid('checkRow', i);
            me.XMPlanGrid.datagrid('selectRow', i);
            Checkedflag = true;
            xmplandr = p.RowID;
            // trace(p.PackDR);
            // break; 
        }
    }
    if (!Checkedflag) {
        //进行后台匹配，检测同型同成分，检查成功后加载血袋信息
        QueryPackByPackBarcodeDo(PackBarcode, ProductBarCode);
    }
    return true;
}

//function GetProductDR(iptCode) {
//    if (iptCode == "" || iptCode == undefined)
//        return "";
//    var isExist = false;
//    for (var i = 0; i < me.BBBloodProductSupplier.length; i++) {
//        var groupCode = me.BBBloodProductSupplier[i];
//        var iptCode_ = iptCode.replace(groupCode.SpecialChar, '');
//        var pos = groupCode.Positions.split(',');
//        if (pos.length == 2) {
//            iptCode_ = iptCode_.substring(pos[0], pos[1]);
//        }
//        if (iptCode_ == groupCode.BarCode) {
//            isExist = true;
//            var BloodProductDR = groupCode.BloodProductDR;
//            $('#txt_XMPlan_ProductBarcode').val(iptCode_);
//            return BloodProductDR;
//        }
//    }
//    if (!isExist) {
//        showSlide("未找到条码对应的血液产品！！");
//    }
//} 

function GetProductBarCode(iptCode) {
    if (iptCode == "" || iptCode == undefined)
        return "";
    var isExist = false;
    for (var i = 0; i < me.BBBloodProductSupplier.length; i++) {
        var groupCode = me.BBBloodProductSupplier[i];
        var iptCode_ = iptCode.replace(groupCode.SpecialChar, '');
        var pos = groupCode.Positions.split(',');
        if (pos.length == 2) {
            iptCode_ = iptCode_.substring(pos[0], pos[1]);
        }
        if (iptCode_ == groupCode.BarCode) {
            isExist = true;
            return groupCode.BarCode;
        }
    }
    if (!isExist) {
        showSlide("未找到条码对应的血液产品！！");
        return "";
    }
}

//根据血袋条码，加载血袋信息
function QueryPackByPackBarcodeDo(PackBarcode, BloodProductDR) {
    //血型一致性检测
    var reqFormDto = GetObjectByID(me.ReqFormData.rows, me.CurrentReqFormDR);
    //var Products = reqFormDto.Others['Products'];
    var Products = reqFormDto.ReqProductInfo.split("^");
    var param = {};
    param.PackBarcode = PackBarcode;
    param.SampleNo = reqFormDto.SampleNo;
    param.RegNo = reqFormDto.RegNo;
    param.ReqFormDR = reqFormDto.RowID;
    param.IsEmergencyCheckProduct = me.IsEmergencyCheckProduct;
    //param.ReqTypeCode = reqFormDto.ReqType.Code;
    param.ReqTypeCode = reqFormDto.ReqTypeCode;
    param.ReqProductDRs = [];
    for (var i = 0; i < Products.length; i++) {
        if (param.ReqProductDRs.indexOf(Products[i].split('@')[0]) == -1) {
            param.ReqProductDRs.push(Products[i].split('@')[0]);
        }
    }
    param.BloodGroupDR = me.CompositeBloodGroup.RowID;
    param.ProductBarcode = BloodProductDR;
    param.LisBloodGroupDR = me.PatientBloodGroup.RowID;
    var e = e || window.event;
    openLoading("txt_XMPlan_SelectPack", e);
    $('#txt_XMPlan_SelectPack').attr('readonly', 'readonly');
    $('#btn_XMTest_Save').linkbutton('disable');

    $.ajax({
        url: me.actionUrl + '?Method=QueryPackByPackBarcode',
        method: 'post',
        data: param,
        success: function (r) {
            var rows = r.rows;
            if (rows.length == 0) {
                showError("未查询到献血码对应的血液信息!");
                return;
            }
            var data = [];
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].IsCan == "1") {
                    data.push(rows[i]);
                }
            }
            r = data;
            if (r.length && r.length >= 1) {
                if (r.length == 1) {
                    //取消配血计划的选中
                    me.XMPlanGrid.datagrid('unselectAll');
                    var pack = r[0];
                    //加载血袋信息
                    LoadPackInfo(r[0]);
                    //非交叉配血，则清空配血实验默认值
                    if (pack.IsXMatchProduct != "1") {
                        var plan = {};
                        plan.Pack = pack;
                        LoadXMPlanTest(pack, true);
                    } else {
                        // LoadXMPlanTest(me.DefaultXMTest, true);
                        LoadProductDefMinorXMResult(pack.ProductBarcode);
                        LoadProductDefMajorXMResult(pack.ProductBarcode);
                        LoadProductDefXMMethod(pack.ProductBarcode);
                        LoadXMPlanTest(me.DefaultXMTest, true);
                    }
                    $('#btn_XMTest_Save').focus(); //扫描条码后，聚焦在“保存”按钮
                } else if (r.length > 1) {
                    ///弹出血袋查询框
                    QueryPack(true, PackBarcode);
                }
            } else {
                ///弹出血袋查询框
                //QueryPack(true);
                showError(rows[0].OutInfo);
            }
        },
        //在ajax发送之前禁止按钮，并且给出“正在处理”的提示
         
        //在ajax成功返回之后释放按钮，并且隐藏提示
        complete: function (XMLHttpRequest, textStatus) {
            closeLoading("txt_XMPlan_SelectPack");
            $('#txt_XMPlan_SelectPack').removeAttr('readonly');
            $('#btn_XMTest_Save').linkbutton('enable');
        }
    });
}

function LoadProductDefMinorXMResult(ProductBarcode) {
    me.DefaultXMTest.MinorXMResultDR = GetDefaultItem(me.BBXMResult, true);
    for (var i = 0; i < me.ProductMinorXMResult.length; i++) {
        if (ProductBarcode + "MinorXMResult" == me.ProductMinorXMResult[i].Code) {
            for (var j = 0; j < me.BBXMResult.length; j++) {
                if (me.BBXMResult[j].Code == me.ProductMinorXMResult[i].ParaValue) {
                    me.DefaultXMTest.MinorXMResultDR = me.BBXMResult[j].RowID;
                    break;
                }
            }
            break;
        }
    }
}

function LoadProductDefMajorXMResult(ProductBarcode) {
    me.DefaultXMTest.MajorXMResultDR = GetDefaultItem(me.BBXMResult, true);
	me.DefaultXMTest.MajorXMDepictDR=GetDefaultItem(me.BBXMDepict, true);
	me.DefaultXMTest.MajorXMConclusionDR=GetDefaultItem(me.BBXMConclusion, true);
     
    for (var i = 0; i < me.ProductMinorXMResult.length; i++) {
        if (ProductBarcode + "MajorXMResult" == me.ProductMinorXMResult[i].Code) { 
		    var  arrXMRes= me.ProductMinorXMResult[i].ParaValue.split("^");
		    
            for (var j = 0; j < me.BBXMDepict.length; j++) {  
			     
                if (me.BBXMDepict[j].Code == arrXMRes[0]) {
                    me.DefaultXMTest.MajorXMDepictDR = me.BBXMDepict[j].RowID;
                    break;
                }
            }
			 for (var j = 0; j < me.BBXMResult.length; j++) {  
			     if(arrXMRes.length==1) break;
                if (me.BBXMResult[j].Code == arrXMRes[1]) {
                    me.DefaultXMTest.MajorXMResultDR = me.BBXMResult[j].RowID;
                    break;
                }
            }
			 for (var j = 0; j < me.BBXMConclusion.length; j++) {  
			     if(arrXMRes.length==2) break;
                if (me.BBXMConclusion[j].Code == arrXMRes[2]) { 
					me.DefaultXMTest.MajorXMConclusionDR =me.BBXMConclusion[j].RowID;
                    //me.DefaultXMTest.XMLastResultDR =me.BBXMLastResult[j].RowID;
                    break;
                }
            }
            break;
        }
    }
}

function LoadProductDefXMMethod(ProductBarcode) {
    me.DefaultXMTest.XMMethodDR = GetDefaultItem(me.BBXMMethod, true);
    for (var i = 0; i < me.ProductXMMethod.length; i++) {
        if (hospitalDR + ProductBarcode + "XMMethod" == me.ProductXMMethod[i].Code) {
            for (var j = 0; j < me.BBXMMethod.length; j++) {
                if (me.BBXMMethod[j].Code == me.ProductXMMethod[i].ParaValue) {
                    me.DefaultXMTest.XMMethodDR = me.BBXMMethod[j].RowID;
                    break;
                }
            }
            break;
        }
    }
}

//展示申请单详情 载入患者信息
function LoadReqFormDetail(data) {
    if (!data || data == undefined) {
        return;
    }
    var patient = data;
    // var products = data.Others['Products']; 
    LoadPatBdInfoByReq(patient.RowID, patient.RegNo);
    if (me.ShowMedicalType == "1") {
        if (patient.MedicalInsuranceType == "1") {
            $("input[type='radio'][name='rdMedicalInsuranceType'][value='0']").attr("checked", false);
            $("input[type='radio'][name='rdMedicalInsuranceType'][value='1']").prop("checked", "checked");
            $('#cmbPayMentType').combobox('setValue', patient.PaymentTypeDR);
            //20200929
            $('#cmbPayMentType').combobox('enable');
        } else {
            $("input[type='radio'][name='rdMedicalInsuranceType'][value='1']").attr("checked", false);
            $("input[type='radio'][name='rdMedicalInsuranceType'][value='0']").prop("checked", "checked");
            $('#cmbPayMentType').combobox('setValue', "");
            //20200929
            $('#cmbPayMentType').combobox('disable');
        }
    }

    $("#td_RecordNo").html("<b>" + patient.MedicalRecordNo + "</b>");
    $("#td_RegNo").html("<b>" + patient.RegNo + "</b>");
    // $("#td_AdmNo").html("<b>"+patient.AdmNo+"</b>"); 
    var patientInfo = "<div><b>";
    patientInfo += patient.PatName + "&nbsp&nbsp&nbsp";
    patientInfo += patient.SpeciesName + "&nbsp&nbsp&nbsp";
    patientInfo += patient.AgeDesc + "&nbsp&nbsp&nbsp";
    patientInfo += patient.Ethnicity + "&nbsp&nbsp&nbsp<br>";
    if (patient.Location.indexOf('-') > 0) {
        patient.Location = patient.Location.split('-')[1];
    }
    patientInfo += patient.Location + "&nbsp&nbsp&nbsp";
    if (patient.Ward.indexOf('-') > 0) {
        patient.Ward = patient.Ward.split('-')[1];
    }
    patientInfo += patient.Ward + "&nbsp&nbsp&nbsp";
    patientInfo += patient.BedNo + "&nbsp&nbsp&nbsp";
    if (patient.NativePlace == "1") {
        patientInfo += "本市" + "&nbsp&nbsp&nbsp";
    }
    if (patient.NativePlace == "2") {
        patientInfo += "外埠" + "&nbsp&nbsp&nbsp";
    }
    patientInfo += "</b></div>";
    $('#td_PatientInfo').html(patientInfo);
    $('#td_AdmInTime').html("<b>" + patient.PAAdmDate + "</b>");
    $('#td_Diagnosis').html("<b>" + patient.Diagnosis + "</b>");
    $('#td_reqFormNo').html(patient.ReqFormNo);
    var purpose = "";

    $('#td_Purpose').html(patient.PurposeList);
    $('#td_ReqType').html(patient.ReqTypeName);
    //$('#td_BookDate').html(ConvertDate(patient.BookDate, 1));
    $('#td_BookDate').html(patient.BookDate);
    $('#td_BookDate').append("&nbsp<b>输血次数:</b>" + patient.IssueTimes);
    $('#ReqFormVisitNum').html(patient.UseSampleNo);
    $('#VisitNumTimeInfo').html("采集时间：" + patient.CollectDate + " " + patient.CollectTime +",剩余有效："+ patient.LeftDate+" <br>接收时间：" + patient.VReceiveDate + " " + patient.VReceiveTime);
    //products 申请血型
    var htmStr = '';
    var color = "blue";
    //var takecomponents = data.Others["takecomponents"];
    $('#td_TestItem').html('');
    var products = patient.ReqProductInfo.split('^');
    me.Products = products;
    for (i = 0; i < products.length; i++) {
        var product = products[i];
        //var product = me.BBReqProduct[i]
        // var product = products[i];
        if (htmStr.length > 0) {
            htmStr += '+';
        }

        var Volumn = product.split('@')[6];
        //        if (me.IsShowTakeComponentsVol == "Y") {
        //            if (takecomponents.length > 0) {
        //                Volumn = "";
        //                for (var j = 0; j < takecomponents.length; j++) {
        //                    if (product.ReqProduct.BloodComponentsDR == takecomponents[j].BloodComponentsDR) {
        //                        Volumn = takecomponents[j].Volume;
        //                        break;
        //                    }
        //                }
        //                if (Volumn == "") {
        //                    continue;
        //                }
        //            }
        //        }
        var color = GetBdTypeColor(product.split('@')[4], product.split('@')[5]);
        htmStr = product.split('@')[3] + "[" + product.split('@')[1] + "]" + "(" + Volumn + product.split('@')[7] + ")<br>";
        $('#td_TestItem').append(htmStr).css('font-weight', 'bolder').css('color', color.FontColor).css('background-color', color.BackGroundColor);
    }
    //$('#td_TestItem').html(htmStr).css('font-weight', 'bolder').css('color',color).css('font-size', '16px');

    if (patient.Isdiscrepancy == "1") {
        $('#td_Isdiscrepancy').html(patient.discrepancy + "&nbsp;&nbsp;&nbsp;&nbsp;" + getIconHtml("非", "", "", "SaveBDPatDiscrepancyLog(0)", "非疑难配血"));
    }
    else {
        $('#td_Isdiscrepancy').html(patient.discrepancy + "&nbsp;&nbsp;&nbsp;&nbsp;" + getIconHtml("疑", "", "", "SaveBDPatDiscrepancyLog(1)", "疑难配血"));
    }
}
var xhrPatBd = "";
///加载血型
function LoadPatBdInfoByReq(ReqFormDR, RegNo) {
    me.PatientBloodGroup = { "RowID": 0, "Code": "", "CName": "" };
    me.CompositeBloodGroup = { "RowID": 0, "Code": "", "CName": "" };
    me.PatientBloodSAS = null;
    $('#patientBloodGroup').html("未知").css('font-weight', 'bolder').css('color', "red").css('font-size', '18px');
    $('#compositeBloodGroup').html("未知").css('font-weight', 'bolder').css('color', "red").css('font-size', '18px');
    $('#LisReportAuthTime').html("");
    $('#BldReportAuthTime').html("");
    $('#patientBloodSAS').html("");
    $('#patientPhenotype').html("");
    //var params = {};
    // params.ReqFormDR = ReqFormDR;
    //params.RegNo=RegNo;
    if (xhrPatBd != "") {
        xhrPatBd.abort();
    }
    xhrPatBd = $.ajax({
        url: LISGetDBURL(""),
        dataType: "text", //text, json, xml
        method: 'get',
        async: false,
        data: {
            ClassName: "BLD.WS.BLL.DHCBDXMTest",
            QueryName: "GetPatBloodInfoMTHD",
            FunModul: "MTHD",
            P0: RegNo,
            P1: ReqFormDR,
            P14: SessionStr
        },
        success: function (r) {
            xhrPatBd = "";
            if (r) {
                var r = r.split('@');
                if (r[0]) {
                    var RowID = r[0].split('^')[0];
                    if (RowID > 0) {
                        var ABO = r[0].split('^')[3];
                        var RH = r[0].split('^')[4];
                        var Code = r[0].split('^')[1];
                        var CName = r[0].split('^')[2];
                        var AuthDate = r[0].split('^')[8];
                        var AuthTime = r[0].split('^')[9];
                        var color = GetBdTypeColor(ABO, RH);

                        me.PatientBloodGroup = { "RowID": RowID, "Code": Code, "CName": CName, "ABO": ABO, "RH": RH };
                        $('#patientBloodGroup').html(CName).css('font-weight', 'bolder').css('color', color.FontColor).css('background-color', color.BackGroundColor).css('font-size', '18px');
                        $('#LisReportAuthTime').html(AuthDate + " " + AuthTime);
                    }
                }
                if (r[1]) {
                    var RowID = r[1].split('^')[0];
                    if (RowID > 0) {
                        var ABO = r[1].split('^')[3];
                        var RH = r[1].split('^')[4];
                        var Code = r[1].split('^')[1];
                        var CName = r[1].split('^')[2];
                        var AuthDate = r[1].split('^')[8];
                        var AuthTime = r[1].split('^')[9];
                        var color = GetBdTypeColor(ABO, RH);
                        me.CompositeBloodGroup = { "RowID": RowID, "Code": Code, "CName": CName, "ABO": ABO, "RH": RH };
                        $('#compositeBloodGroup').html(CName).css('font-weight', 'bolder').css('color', color.FontColor).css('background-color', color.BackGroundColor).css('font-size', '18px');
                        $('#BldReportAuthTime').html(AuthDate + " " + AuthTime);
                    }
                }
                if (r[2]) {
                    //me.PatientBloodSAS=r[2]; 
                    var color = "";
                    var CName = r[2].split('^')[2];
                    var AbFlag = r[2].split('^')[10];
                    me.PatientBloodSAS = { "CName": CName, "AbFlag": AbFlag };
                    if (AbFlag == "A" || AbFlag == "S") {
                        color = "red";
                    }
					 if (CName == "阳性(+)" ) {
                        color = "red";
                    }
                    $('#patientBloodSAS').html(CName).css('font-weight', 'bolder').css('color', color).css('font-size', '16px');
                }
                if (r[3]) {
                    var CName = r[3].split('^')[2];
                    $('#patientPhenotype').html(CName);
                }
            }
        }
    });
}
function GetNewAdmIdByRegNo(RegNo) {
    var params = {};
    params.regNo = RegNo;
    $.ajax({
        url: me.actionUrl + '?Method=GetNewAdmIdByRegNo',
        method: 'get',
        data: params,
        success: function (r) {
            if (r && r.total > 0) {
                me.NewAdmId = r.rows[0].admId;
            }

        }
    });
}
///刷新申请单列表
function RefreshReqForm() {
    var validate = $('#searchFrom').form('validate');
    if (!validate) {
        return false;
    }
    var DateStart = $('#dt_SttDate').datebox("getValue");
    var DateEnd = $('#dt_EndDate').datebox("getValue");
    //js控制查询日期为半年以内
    var distance = daysBetween(DateStart, DateEnd);
	/*
    if (Math.abs(distance) > 30) {  
        showSlide("最多只能查询30天内的申请单，请调整查询日期间隔！", 3000);
        return false;
    }
	*/
    var ReqFormNo = "";
    var RegNo = "";
    var MedicalRecordNo = "";
    var UseSampleNo = "";
    var TakeRecordNo = "";
	var PatName="";
    var FindTxt = $('#txt_FindFast').val();
    var queryType = me.queryType;
    var TimeLimit = $('input:checkbox[name=chkTimeLimit]')[0].checked;
    switch (queryType) {
        case "MedicalRecordNo":
            MedicalRecordNo = FindTxt;
            break;
        case "RegNo":
            RegNo = FindTxt;
            break;
        case "UseSampleNo":
            UseSampleNo = FindTxt;
            break;
        case "TakeRecordNo":
            TakeRecordNo = FindTxt;
            break;
		case "PatName":
			PatName = FindTxt;
			break;
        default:
            ReqFormNo = FindTxt;
            break;
    }
    //if (ReqFormNo=="") {
    //    ReqFormNo = msgReqFormNo;
    //    msgReqFormNo = "";
    //}
    ajaxLoading(false);
    $.ajax({
        url: LISGetDBURL(""),
        data: {
            ClassName: "BLD.WS.BLL.DHCBDXMTest",
            QueryName: "QryBdReqFormReceiveList",
            FunModul: "JSON",
            P0: DateStart,
            P1: DateEnd,
            P2: ReqFormNo,
            P3: PatName,
            P4: MedicalRecordNo,
            P5: RegNo,
            P6: "",
            P7: UseSampleNo,
            P8: TimeLimit,
            P9: TakeRecordNo,
            P14: SessionStr
        },
        success: function (data) {
            ajaxLoadEnd();
            me.statisticFlag = false;
            me.ReqFormGrid.datagrid('loadData', data);
        }
    })
}
var xhrPlan = "";
///刷新配血计划
function RefreshXMPlan() {
    me.XMPlanGrid.datagrid('clearChecked');
    me.XMPlanGrid.datagrid('clearSelections');
    me.XMPlanGrid.datagrid('loadData', []);
    // var param = {};
    //param.ReqFormDR = me.CurrentReqFormDR;
    if (!me.CurrentReqFormDR || me.CurrentReqFormDR < 1) {
        return false;
    }
    var rows = me.XMPlanGrid.datagrid('getRows');
    DeleteRows(me.XMPlanGrid, rows);
    me.XMPlanData = null;
    //清空所有的配血实验数据
    LoadXMPlanTest(me.DefaultXMTest);
    $('#SpecialProduct').html('');
    $('#spanXMatchInfo').html('');
    if (xhrPlan != "") {
        xhrPlan.abort();
    }
    xhrPlan = $.ajax({
        url: LISGetDBURL(""),
        method: 'get',
        data: {
            ClassName: "BLD.WS.BLL.DHCBDXMTest",
            QueryName: "QryXMPlanByReqForm",
            FunModul: "JSON",
            P0: me.CurrentReqFormDR,
            P14: SessionStr
        },
        success: function (result) {
            xhrPlan = "";
            me.XMPlanGrid.datagrid('loadData', result);
        },
        beforeSend: function (XMLHttpRequest) {
            var msg = "正在处理，请稍等...";
            var id = "XMPlanData";
            var left = $('#div_costItems').offset().left + $('#div_costItems').width() / 2 + 60;
            var top = $('#div_costItems').offset().top - 120; //offsetLeft
            var html = '<div id="' + id + '_loadingIconShow" style="position:fixed;left:' + left + 'px;top:' + top + 'px;z-index:10000;">';
            html += '<span class="icon-loading">&nbsp;&nbsp;&nbsp;&nbsp;</span>';
            html += msg;
            html += '</div>';
            $("body").append(html);
        },
        //在ajax成功返回之后释放按钮，并且隐藏提示
        complete: function (XMLHttpRequest, textStatus) {
            closeLoading("XMPlanData");
        }
    });
}

///刷新申请单列表
function RefreshPack() {
    me.PackGrid.datagrid('clearChecked');
    me.PackGrid.datagrid('reload');
}

///删除配血计划
function DeleteXMPlan(row) {
    //    var row = me.XMPlanGrid.datagrid("getSelected");
    //    if (!row || row.length < 1) {
    //        showError('请选择一条记录进行操作!');
    //        return;
    //    }
    $.messager.confirm('确认', '确定删除血袋条码为“' + row.PackBarcode + '”的配血计划?', function (r) {
        if (r) {
            var e = e || window.event;
            openLoading("btn_XMPlan_Delete", e);
            $('#btn_XMPlan_Delete').linkbutton('disable');

            $.ajax({
                url: me.actionUrl + '?Method=DeleteXMPlan',
                method: 'post',
                data: { XMPlanDR: row.RowID },
                success: function (r) {
                    if (r.IsOk) {
                        showSlide(r.Message, 3000);
                        DeleteXMPlanGrid(row);
                        //UpdateReqFormByDeleteXMPlan(row);
                        //清空血袋信息
                        $('#txt_XMPlan_SelectPack').val('');
                        LoadPackInfo(null);
                    } else {
                        showError(r.Message);
                    }
                },
                //在ajax发送之前禁止按钮，并且给出“正在处理”的提示
                //beforeSend: function (XMLHttpRequest) {
                   
                //},
                //在ajax成功返回之后释放按钮，并且隐藏提示
                complete: function (XMLHttpRequest, textStatus) {
                    closeLoading("btn_XMPlan_Delete");
                    $('#btn_XMPlan_Delete').linkbutton('enable');
                }
            });
        }
    });
}

///去掉XMPlanGrid中对应行数据
function DeleteXMPlanGrid(row) {
    DeleteRow(me.XMPlanGrid, row.RowID);
}

///根据删除的行来更新ReqForm中的数据行
function UpdateReqFormByDeleteXMPlan(row) {
    var plan = row.Plan;
    var ReqFormDto = null;
    var rows = me.ReqFormGrid.datagrid('getRows');
    for (var i = 0; i < rows.length; i++) {
        if (rows[i].RowID == plan.ReqFormDR) {
            ReqFormDto = rows[i];
            var plans = ReqFormDto.Others['Plans'];
            for (var j = 0; j < plans.length; j++) {
                if (plans[j].RowID == plan.RowID) {
                    plans.splice(j, 1);
                    me.ReqFormGrid.datagrid('updateRow', { index: i, row: ReqFormDto });
                    return;
                }
            }
        }
    }
}

//查找输血申请单
function SearchReqForm(searchVal, filterType) {
    if (!filterType) {
        me.statisticFlag = false;
    }
    searchVal = $.trim(searchVal);
    if (searchVal.length > 0) {
        var filteredData = [];
        for (var i = 0; i < me.ReqFormData.rows.length; i++) {
            var data = me.ReqFormData.rows[i];
            if (SearchReqForm_IsContained(data, searchVal, filterType)) {
                filteredData.push(data);
            }
        }
        me.ReqFormGrid.datagrid('loadData', filteredData);
    } else {
        me.ReqFormGrid.datagrid('loadData', me.ReqFormData);
    }
    // $('#ss').searchbox('textbox').val('');
}

//查找输血申请单，根据前台行数据模糊匹配
function SearchReqForm_IsContained(rowData, searchVal, filterType) {
    if (filterType == 'ReqType') {
        if (rowData.ReqTypeDR == searchVal) {
            return true;
        }
        return false;
    }
    if (filterType == 'ABO') {
        if (rowData.ABODR == searchVal) {
            return true;
        }
        return false;
    }

    if (filterType == 'RH') {
        if (rowData.RHDR == searchVal) {
            return true;
        }
        return false;
    }
    var products = rowData.ReqProductInfo.split('^');
    // var products = rowData.Others['Products'];
    if (filterType == 'ReqProduct') {
        for (var i = 0; i < products.length; i++) {
            var Product = products[i];
            if (Product.split('@')[0] == searchVal) {
                return true;
            }
        }
        return false;
    }

    if (filterType == 'BloodGroup') {
        for (var i = 0; i < products.length; i++) {
            var Product = products[i];
            if (Product.split('@')[2] == searchVal) {
                return true;
            }
        }
        return false;
    }

    //var Plans = rowData.Others['Plans'];
    if (filterType == 'XMPlanStatus') {
        var vals = searchVal.split('_');
        filterType = vals[0];
        searchVal = vals[1];
        if (filterType == 'IsXMPlan') {
            if (searchVal == 'yes') {
                //if (Plans.length > 0) {
                if (rowData.IsXMPlaned == "1") {
                    return true;
                }
                return false;
            } else {
                // if (Plans.length > 0) {
                if (rowData.IsXMPlaned == "1") {
                    return false;
                }
                return true;
            }
        }

        //        if (filterType == 'IsFinished') {
        //            var isFinishedFlag = false;
        //           
        //            if (searchVal == 'yes') {
        //                if (isFinishedFlag) {
        //                    return true;
        //                }
        //                return false;
        //            } else {
        //                if (isFinishedFlag) {
        //                    return false;
        //                }
        //                return true;
        //            }
        //        }

        if (filterType == 'IsIssued') {

            if (rowData.IsPlanIssued == "0") {
                return false;
            }

            if (searchVal == 'yes') {//部分发血
                if (rowData.IsPlanNotIssued == "1") {
                    return true;
                }
                return false;
            } else {//全部发血
                if (rowData.IsPlanNotIssued == "1") {
                    return false;
                }
                return true;
            }
        }
    }


    if (ContainSearch(rowData.ReqFormNo, searchVal) ||
        ContainSearch(rowData.PatName, searchVal) ||
        ContainSearch(rowData.ABO, searchVal) ||
        ContainSearch(rowData.Remark, searchVal) ||
        //ContainSearch(rowData.ReceiveUser.CName, searchVal) ||
        ContainSearch(rowData.MedicalRecordNo, searchVal) ||
        ContainSearch(rowData.RegNo, searchVal) ||
        // ContainSearch(rowData.AdmNo, searchVal) ||
        ContainSearch(rowData.RH, searchVal) ||
        ContainSearch(rowData.UseSampleNo, searchVal)
    ) {
        return true;
    }

    for (var i = 0; i < products.length; i++) {
        var Product = products[i];
        if (
            ContainSearch(Product.split('@')[1], searchVal) ||
            // ContainSearch(Product.split('@')[2], searchVal) ||
            ContainSearch(Product.split('@')[3], searchVal)
            //ContainSearch(Product.ReqBloodGroup.Code, searchVal) ||
            // ContainSearch(Product.Volumn, searchVal) ||
            // ContainSearch(Product.SpecialNeed, searchVal) ||
            // ContainSearch(Product.Remark, searchVal)
        ) {
            return true;
        }
    }
    return false;
}

//检测血型一致性
function CheckBloodGroup() {
    var res = { IsOk: true, Message: "" };
    if (!me.PatientBloodGroup || me.PatientBloodGroup.RowID < 1) {
        res.IsOk = false;
        res.Message = "鉴定血型不存在";
        return res;
    }
    if (!me.CompositeBloodGroup || me.CompositeBloodGroup.RowID < 1) {
        res.IsOk = false;
        res.Message = "复检血型不存在";
        return res;
    }
    if (me.PatientBloodGroup.RowID != me.CompositeBloodGroup.RowID) {
        res.IsOk = false;
        res.Message = "鉴定血型“" + me.PatientBloodGroup.CName + "”与复检血型“" + me.CompositeBloodGroup.CName + "”不一致";
        return res;
    }

    ///申请血型 存在多个
    for (var i = 0; i < me.Products.length; i++) {
        // var ReqBloodGroup = me.Products[i].ReqBloodGroup;
        var ReqBloodGroupDR = me.Products[i].split('@')[2];
        if (ReqBloodGroupDR != me.CompositeBloodGroup.RowID) {
            res.IsOk = false;
            res.Message = "存在申请血型“" + me.Products[i].split('@')[3] + "”与复检血型“" + me.CompositeBloodGroup.CName + "”不一致";
            return res;
        }
        if (me.PatientBloodGroup.RowID != ReqBloodGroupDR) {
            res.IsOk = false;
            res.Message = "存在申请血型“" + me.Products[i].split('@')[3] + "”与鉴定血型“" + me.PatientBloodGroup.CName + "”不一致";
            return res;
        }
    }
    return res;
}

///查找血袋
function QueryPack(unConfirmFlag, packBarCode) {
    $('#PackWarn').text('');
    $('#txt_AddPack').val('');
    //检测血型一致性
    if (me.CurrentReqFormDR == "-1") {
        showError("请选择病人申请单！！");
        return;
    }
    var res = CheckBloodGroup();
    if (!unConfirmFlag && !res.IsOk) {
        $.messager.confirm('确认', res.Message + '！是否继续?', function (r) {
            if (r) {
                $('#PackWarn').text(res.Message + '！当前以“复检血型”为准进行血袋匹配');
                LoadPack(packBarCode);
                LoadPatVisitnum();
                $('#div_Pack').dialog('open');
            }
            return;
        });
    } else {
        if (!res.IsOk) {
            $('#PackWarn').text(res.Message + '！当前以“复检血型”为准进行血袋匹配');
        }
        LoadPack(packBarCode);
        LoadPatVisitnum();
        $('#div_Pack').dialog('open');
    }
}

//快速日期范围选择
function mnuDateTypeClick(value) {
    var curDate = GetCurentDate();
    if (value == "1") {
        $('#dt_SttDate').datebox('setValue', curDate);
        $('#dt_EndDate').datebox('setValue', curDate);
        $('#btn_ThisDay').linkbutton('select');
        $('#btn_7Day').linkbutton('unselect');
        $('#btn_3Day').linkbutton('unselect');

    } else if (value == "7") {
        sttDate = DateParser("d-6");
        $('#dt_SttDate').datebox('setValue', DateFormatter(sttDate));
        $('#dt_EndDate').datebox('setValue', curDate);
        $('#btn_ThisDay').linkbutton('unselect');
        $('#btn_7Day').linkbutton('select');
        $('#btn_3Day').linkbutton('unselect');
    } else if (value == "3") {
        sttDate = DateParser("d-2");
        $('#dt_SttDate').datebox('setValue', DateFormatter(sttDate));
        $('#dt_EndDate').datebox('setValue', curDate);
        $('#btn_7Day').linkbutton('unselect');
        $('#btn_ThisDay').linkbutton('unselect');
        $('#btn_3Day').linkbutton('select');
    }
    //RefreshReqForm();
}

//进行数据统计
function StatisticByType() {
    var datas = me.ReqFormGrid.datagrid('getRows');
    var total = datas.length;

    ///申请类型
    var BB_ReqType = me.BBReqType;
    var html = "";
    var filterType = "ReqType";
    html += '<span style="margin-right:6px;cursor: pointer;background-color:#DFF5F7;" id="' + filterType + '_"  onclick="FilterReqForm(\'' + filterType + '\',\'\')">';
    html += "所有:" + total;
    html += '</span>';
    for (var i = 0; i < BB_ReqType.length; i++) {
        var num = StatisticByReqType(datas, BB_ReqType[i].RowID);
        if (me.filterShowPartFlag && num <= 0) {
            continue;
        }
        html += '<span style="color:' + BB_ReqType[i].Color + ';margin-right:6px;cursor: pointer;background-color:#DFF5F7;" id="' + filterType + '_' + BB_ReqType[i].RowID + '" onclick="FilterReqForm(\'' + filterType + '\',\'' + BB_ReqType[i].RowID + '\')">';
        html += BB_ReqType[i].CName + ':' + num;
        html += '</span>';
    }
    $('#ReqType_FOption').html(html);

    ///ABO
    var BT_ABO = me.BTABOBG;
    var html = "";
    var filterType = "ABO";
    html += '<span style="margin-right:6px;cursor: pointer;background-color:#DFF5F7;" id="' + filterType + '_"  onclick="FilterReqForm(\'' + filterType + '\',\'\')">';
    html += "所有:" + total;
    html += '</span>';
    for (var i = 0; i < BT_ABO.length; i++) {
        var num = StatisticByABO(datas, BT_ABO[i].RowID);
        //        if (me.filterShowPartFlag && num <= 0) {
        //            continue;
        //        }
        html += '<span style="margin-right:6px;cursor: pointer;background-color:#DFF5F7;" id="' + filterType + '_' + BT_ABO[i].RowID + '" onclick="FilterReqForm(\'' + filterType + '\',\'' + BT_ABO[i].RowID + '\')">';
        html += BT_ABO[i].Code + ':' + num;
        html += '</span>';
    }
    $('#ABO_FOption').html(html);

    ///RH
    var BT_RH = me.BTRHBG;
    var html = "";
    var filterType = "RH";
    html += '<span style="margin-right:6px;cursor: pointer;background-color:#DFF5F7;" id="' + filterType + '_"  onclick="FilterReqForm(\'' + filterType + '\',\'\')">';
    html += "所有:" + total;
    html += '</span>';
    for (var i = 0; i < BT_RH.length; i++) {
        var num = StatisticByRH(datas, BT_RH[i].RowID);
        //        if (me.filterShowPartFlag && num <= 0) {
        //            continue;
        //        }
        html += '<span style="margin-right:6px;cursor: pointer;background-color:#DFF5F7;" id="' + filterType + '_' + BT_RH[i].RowID + '" onclick="FilterReqForm(\'' + filterType + '\',\'' + BT_RH[i].RowID + '\')">';
        html += BT_RH[i].Code + ':' + num;
        html += '</span>';
    }
    $('#RH_FOption').html(html);

    ///BBReqProduct
    var BB_ReqProduct = me.BBReqProduct;
    var html = "";
    var filterType = "ReqProduct";
    html += '<span style="margin-right:6px;cursor: pointer;background-color:#DFF5F7;" id="' + filterType + '_"  onclick="FilterReqForm(\'' + filterType + '\',\'\')">';
    html += "所有:" + total;
    html += '</span>';
    for (var i = 0; i < BB_ReqProduct.length; i++) {
        var num = StatisticByReqProduct(datas, BB_ReqProduct[i].RowID);
        if (me.filterShowPartFlag && num <= 0) {
            continue;
        }
        html += '<span style="margin-right:6px;cursor: pointer;background-color:#DFF5F7;" id="' + filterType + '_' + BB_ReqProduct[i].RowID + '" onclick="FilterReqForm(\'' + filterType + '\',\'' + BB_ReqProduct[i].RowID + '\')">';
        html += BB_ReqProduct[i].Code + ':' + num;
        html += '</span>';
    }
    $('#ReqProduct_FOption').html(html);

    ///BBBloodGroup
    var BB_BloodGroup = me.BBBloodGroup;
    var html = "";
    var filterType = "BloodGroup";
    html += '<span style="margin-right:6px;cursor: pointer;background-color:#DFF5F7;" id="' + filterType + '_"  onclick="FilterReqForm(\'' + filterType + '\',\'\')">';
    html += "所有:" + total;
    html += '</span>';
    for (var i = 0; i < BB_BloodGroup.length; i++) {
        var innerData = BB_BloodGroup[i];
        var num = StatisticByBloodGroup(datas, innerData.RowID);
        if (me.filterShowPartFlag && num <= 0) {
            continue;
        }
        if (!me.filterShowPartFlag) {
            if (innerData.Code.indexOf("U") > -1) {
                continue;
            }
        }
        html += '<span style="margin-right:6px;cursor: pointer;background-color:#DFF5F7;" id="' + filterType + '_' + innerData.RowID + '" onclick="FilterReqForm(\'' + filterType + '\',\'' + innerData.RowID + '\')">';
        html += innerData.Code + ':' + num;
        html += '</span>';
    }
    $('#BloodGroup_FOption').html(html);

    ///配血发血状态：所有，未配血，已配血（未审核+已审核），部分发血，已发血 XMPlanStatus_FOption
    var html = "";
    var filterType = "XMPlanStatus";
    var filterVal = "IsXMPlan";
    html += '<span style="margin-right:6px;cursor: pointer;background-color:#37E3F3;" id="' + filterType + '_"  onclick="FilterReqForm(\'' + filterType + '\',\'\')">';
    html += "所有:" + total;
    html += '</span>';

    html += '<span style="color:' + BD.ReqFormXMPlanStatusColor.UNXM + ';margin-right:6px;cursor: pointer;background-color:#DFF5F7;" id="' + filterType + '_' + filterVal + '_no" onclick="FilterReqForm(\'' + filterType + '\',\'' + filterVal + '_no\')">';
    html += '未配血:' + StatisticByIsXMPlan(false, datas);
    html += '</span>';

    html += '<span style="color:' + BD.ReqFormXMPlanStatusColor.XM + ';margin-right:6px;cursor: pointer;background-color:#DFF5F7;" id="' + filterType + '_' + filterVal + '_yes" onclick="FilterReqForm(\'' + filterType + '\',\'' + filterVal + '_yes\')">';
    html += '已配血:' + StatisticByIsXMPlan(true, datas);
    html += '</span>';

    filterVal = "IsIssued";
    html += '<span style="color:' + BD.ReqFormXMPlanStatusColor.ISSUEED_PART + ';margin-right:6px;cursor: pointer;background-color:#DFF5F7;" id="' + filterType + '_' + filterVal + '_yes" onclick="FilterReqForm(\'' + filterType + '\',\'' + filterVal + '_yes\')">';
    html += '部分发血:' + StatisticByIsIssued(true, datas);
    html += '</span>';

    html += '<span style="color:' + BD.ReqFormXMPlanStatusColor.ISSUEED_ALL + ';margin-right:6px;cursor: pointer;background-color:#DFF5F7;" id="' + filterType + '_' + filterVal + '_no" onclick="FilterReqForm(\'' + filterType + '\',\'' + filterVal + '_no\')">';
    html += '全部发血:' + StatisticByIsIssued(false, datas);
    html += '</span>&nbsp&nbsp&nbsp;';

    $('#XMPlanStatus_FOption').html(html);
}

///将申请单按类型进行统计
function StatisticByReqType(datas, genre) {
    var count = 0;
    for (var i = 0; i < datas.length; i++) {
        var ReqTypeDR = datas[i].ReqTypeDR
        if (ReqTypeDR == genre) {
            count++;
        }
    }
    return count;
}

///将申请单按ABO血型进行统计
function StatisticByABO(datas, genre) {
    var count = 0;
    for (var i = 0; i < datas.length; i++) {
        var reqForm_ABODR = datas[i].ABODR
        if (reqForm_ABODR == genre) {
            count++;
        }
    }
    return count;
}

///将申请单按RH血型进行统计
function StatisticByRH(datas, genre) {
    var count = 0;
    for (var i = 0; i < datas.length; i++) {
        var reqForm_RHDR = datas[i].RHDR
        if (reqForm_RHDR == genre) {
            count++;
        }
    }
    return count;
}

///将申请单按输血成分进行统计
function StatisticByReqProduct(datas, genre) {
    var count = 0;
    for (var i = 0; i < datas.length; i++) {
        // var products = datas[i].Others['Products'];
        var products = datas[i].ReqProductInfo.split('^');
        for (var j = 0; j < products.length; j++) {
            if (products[j].split('@')[0] == genre) {
                count++;
            }
        }
    }
    return count;
}

///将申请单按申请血型进行统计
function StatisticByBloodGroup(datas, genre) {
    var count = 0;
    for (var i = 0; i < datas.length; i++) {
        var products = datas[i].ReqProductInfo.split('^');
        for (var j = 0; j < products.length; j++) {
            if (products[j].split('@')[2] == genre) {
                count++;
            }
        }
    }
    return count;
}

///将申请单按是否进行了配血计划进行统计
function StatisticByIsXMPlan(isXMPlan, datas) {
    var count = 0;
    for (var i = 0; i < datas.length; i++) {
        if (datas[i].IsXMPlaned == "1") {
            if (isXMPlan) {
                count++;
            }
        } else {
            if (!isXMPlan) {
                count++;
            }
        }
    }
    return count;
}

///将申请单按是否进行了审核配血计划进行统计
function StatisticByIsFinished(IsFinished, datas) {
    var count = 0;
    for (var i = 0; i < datas.length; i++) {
        var isFinishedflag = false;
        var plans = datas[i].Others['Plans'];
        if (plans.length > 0) {
            for (var j = 0; j < plans.length; j++) {
                if (plans[j].IsFinished) {
                    isFinishedflag = true;
                    break;  //只要有一个，则标记为已审核
                }
            }
        }

        if (IsFinished) {
            if (isFinishedflag) {
                count++;
            }
        } else {
            if (!isFinishedflag) {
                count++;
            }
        }
    }
    return count;
}

///将申请单按是否已发血进行统计
function StatisticByIsIssued(isIssuedPart, datas) {
    var count = 0;
    for (var i = 0; i < datas.length; i++) {
        var isIssuedflag = false;
        var isIssuedPartflag = false;
        var row = datas[i];
        //var plans = datas[i].Others['Plans'];
        //        if (plans.length > 0) {
        //            for (var j = 0; j < plans.length; j++) {
        //                if (plans[j].IsIssued) {
        //                    isIssuedflag = true;
        //                } else {
        //                    isIssuedPartflag = true;
        //                }
        //            } 
        if (row.IsPlanIssued == "0") {
            continue;
        }
        //部分发血
        if (isIssuedPart) {
            if (row.IsPlanNotIssued == "1") {
                count++;
            }
        } else
            //全部发血
        {
            if (row.IsPlanIssued == "1" && row.IsPlanNotIssued == "0") {
                count++;
            }
        }
    }
    return count;
}

///对申请单进行数据过滤
function FilterReqForm(filterType, val) {
    FilterReqFormChangeStyle(filterType, val);
    SearchReqForm(val, filterType);
}

////对申请单进行数据过滤条件进行样式变换
function FilterReqFormChangeStyle(filterType, val) {
    var ReqType = "ReqType";
    var spans = $('#' + ReqType + '_FOption').find('span');
    $.each(spans, function (i, e) {
        $(e).css('background-color', '#DFF5F7');
    });
    ReqType = "ABO";
    spans = $('#' + ReqType + '_FOption').find('span');
    $.each(spans, function (i, e) {
        $(e).css('background-color', '#DFF5F7');
    });
    ReqType = "RH";
    spans = $('#' + ReqType + '_FOption').find('span');
    $.each(spans, function (i, e) {
        $(e).css('background-color', '#DFF5F7');
    });
    ReqType = "ReqProduct";
    spans = $('#' + ReqType + '_FOption').find('span');
    $.each(spans, function (i, e) {
        $(e).css('background-color', '#DFF5F7');
    });

    ReqType = "BloodGroup";
    spans = $('#' + ReqType + '_FOption').find('span');
    $.each(spans, function (i, e) {
        $(e).css('background-color', '#DFF5F7');
    });

    ReqType = "XMPlanStatus";
    spans = $('#' + ReqType + '_FOption').find('span');
    $.each(spans, function (i, e) {
        $(e).css('background-color', '#DFF5F7');
    });
    $('#' + filterType + '_' + val).css('background-color', '#37E3F3');
}

//清空明细
function RemoveAllReags() {
    me.XMPlanGrid.datagrid('loadData', []);
}

///清空所有界面数据
function ClearAll() {
    me.CurrentReqFormDR = -1;
    // me.XMPlanGrid.datagrid("loadData", []);
    //清空明细
    $('#patientBloodGroup').html('');
    $('#compositeBloodGroup').html('');
    $('#LisReportAuthTime').html('');
    $('#BldReportAuthTime').html('');
    $('#patientBloodSAS').html('');
    $('#td_RecordNo').html('');
    $('#td_RegNo').html('');
    $('#td_PatientInfo').html('');
    $('#td_Diagnosis').html('');
    $('#td_reqFormNo').html('');
    $('#td_Purpose').html('');
    $('#td_ReqType').html('');
    $('#td_BookDate').html('');
    $('#td_TestItem').html('');
    $('#ReqFormVisitNum').html('');
    $('#VisitNumTimeInfo').html('');
    //清空费用
    $('#div_costItems').html('');
    $('#td_AdmInTime').html('');
    //清空所有的配血实验数据
    LoadXMPlanTest(me.DefaultXMTest);

}


///根据配血计划选中行构建基本的配血计划
function GeneratePlanFromRow(row) {
    var Plan = {};
    Plan.RowID = row.RowID;
    Plan.ReqFormDR = row.ReqFormDR;
    Plan.PackDR = row.PackDR;
    Plan.SampleNo = row.SampleNo;
    Plan.PackBarcode = row.PackBarcode;
    Plan.XMPlanNo = row.XMPlanNo;

    Plan.XMMethodDR = $('#com_BBXMMethod').combobox('getValue');

    Plan.MachineParameterDR = $('#com_BTMIMachineParameter').combobox('getValue');

    Plan.MajorXMDepictDR = $('#com_Major_BBXMDepict').combobox('getValue');
    Plan.MajorXMDepictStr = $('#com_Major_BBXMDepict').combobox('getText');

    Plan.MajorXMConclusionDR = $('#com_Major_BBXMConclusion').combobox('getValue');
    Plan.MajorXMConclusionStr = $('#com_Major_BBXMConclusion').combobox('getText');

    Plan.MajorXMResultDR = $('#com_Major_BBXMResult').combobox('getValue');
    Plan.MajorXMResultStr = $('#com_Major_BBXMResult').combobox('getText');

    Plan.MinorXMDepictDR = $('#com_Minor_BBXMDepict').combobox('getValue');
    Plan.MinorXMDepictStr = $('#com_Minor_BBXMDepict').combobox('getText');

    Plan.MinorXMConclusionDR = $('#com_Minor_BBXMConclusion').combobox('getValue');
    Plan.MinorXMConclusionStr = $('#com_Minor_BBXMConclusion').combobox('getText');

    Plan.MinorXMResultDR = $('#com_Minor_BBXMResult').combobox('getValue');
    Plan.MinorXMResultStr = $('#com_Minor_BBXMResult').combobox('getText');

    Plan.XMLastResultDR = $('#com_BBXMLastResult').combobox('getValue');
    Plan.XMLastResultStr = $('#com_BBXMLastResult').combobox('getText');
    Plan.CheckBloodGroupRes = me.CompositeBloodGroup.CName;
    Plan.AntibodyScreenRes = $('#patientBloodSAS').html();
    Plan.CheckBloodPhenotype = $('#patientPhenotype').html();

    //var MedicalInsuranceType = $("input[name='rdMedicalInsuranceType']:checked").val();
    //Plan.MedicalInsuranceType=medicalType;

    if ($('#IsXMatchProduct').val()) {
        if (Plan.XMMethodDR < 1) {
            showInfo("请选择配血方法！");
            return;
        }
        if (Plan.MajorXMDepictDR < 1) {
            showInfo("请选择主侧现象！");
            return;
        }
        if ($('#com_BBXMMethod').combobox('getText') != "微柱凝胶法") {
            if (Plan.MajorXMConclusionDR < 1) {
                showInfo("请选择主侧结论！");
                return;
            }
        }
        if (Plan.MajorXMResultDR < 1) {
            showInfo("请选择主侧结果！");
            return;
        }
        if (Plan.MinorXMDepictDR < 1) {
            showInfo("请选择次侧现象！");
            return;
        }
        if ($('#com_BBXMMethod').combobox('getText') != "微柱凝胶法") {
            if (Plan.MinorXMConclusionDR < 1) {
                showInfo("请选择次侧结论！");
                return;
            }
        }
        if (Plan.MinorXMResultDR < 1) {
            showInfo("请选择次侧结果！");
            return;
        }
        if (Plan.XMLastResultDR < 1) {
            showInfo("请选择交叉配血最终结果！");
            return;
        }
    }

    Plan.Remark = $('#textarea_Remark').val();
    return Plan;
}

///保存配血实验
function SaveTest() {
    var rowData = me.XMPlanGrid.datagrid('getSelected');
    if (rowData) {
        //修改
        var row = rowData;
    } else {
        var currentPack = $('#currentPackDR').val();
        if (!currentPack) {
            showInfo("请扫描血袋或者选中配血计划！");
            return;
        }
        if (me.IsNeedSASRes == "Y") {
            if ($('#patientBloodSAS').html() == "") {
                showInfo("抗筛结果不能为空！");
                return;
            }
        }
        if (!$('#IsBGChecked').val()) {
            showInfo("该血液还没有进行血型复查！");
            return;
        }
        //新增
        var reqFormDto = GetObjectByID(me.ReqFormData.rows, me.CurrentReqFormDR);
        var row = {
            RowID: 0,
            ReqFormDR: me.CurrentReqFormDR,
            PackDR: currentPack,
            SampleNo: reqFormDto.SampleNo,
            PackBarcode: $('#currentPackBarcode').val()
        };
    }
    //if(me.IsCanCreatePlan=="N")
    // {
    // showInfo(me.NotCreatePlanMessage +"不能进行配血！");
    // return;
    // }


    var Plan = GeneratePlanFromRow(row);
    if (!Plan) {
        return;
    }

    var sasissue = "";
    if (me.PatientBloodSAS) {
        if (me.PatientBloodSAS.AbFlag == "A" || me.PatientBloodSAS.AbFlag == "S") {
            $.messager.confirm('提示信息', '患者抗筛结果异常，是否继续配血？', function (isClickedOk) {
                if (isClickedOk) {
                    sasissue = "1";
                    if (bloodissue == "1") {
                        //ConfirmPatientPrtQuota(Plan, row);
                        SaveTestDo(Plan, row);
                    };
                }
                else {
                    sasissue = "0";
                }
            });
        }
        else {
            sasissue = "1";
        }
    }
    else {
        sasissue = "1";
    }
    var bloodissue = "";
    if (me.CompositeBloodGroup.RH == "N") {
        $.messager.confirm('提示信息', '患者为阴性血，是否继续配血？', function (isClickedOk) {
            if (isClickedOk) {
                bloodissue = "1";
                if (sasissue == "1") {
                    //ConfirmPatientPrtQuota(Plan, row);
                    SaveTestDo(Plan, row);
                };
            }
            else {
                bloodissue = "0";
            }
        });
    }
    else {
        bloodissue = "1";
        if (sasissue == "1") {
            //ConfirmPatientPrtQuota(Plan, row);
            SaveTestDo(Plan, row);
        };
    }

}

function ConfirmPatientPrtQuota(Plan, row) {
    $.ajax({
        url: '../../cts/ashx/ashReqFormReceive.ashx?Method=QryPatientPrtQuota&RegNo=' + me.RegNo,
        success: function (data) {
            if (data.IsOk) {
                if (data.Message.split("^")[0].length > 0) {
                    $.messager.confirm('提示信息', '该患者为' + data.Message.split("^")[0] + ",是否继续接收？", function (isClickedOk) {
                        if (!isClickedOk) {
                            return;
                        }
                        SaveTestDo(Plan, row);
                    });
                }
                else {
                    SaveTestDo(Plan, row);
                }
            } else {
                showError(data.Message.replace("-1^", ""));
            }
        }
    });
}

function SaveTestDo(Plan, row) {
    var params = {};
    var plan = {};
    plan.P0 = Plan.PackDR;
    plan.P1 = Plan.XMMethodDR;
    plan.P2 = Plan.MachineParameterDR;
    plan.P3 = Plan.MajorXMDepictDR + "^" + Plan.MajorXMDepictStr;
    plan.P4 = Plan.MajorXMResultDR + "^" + Plan.MajorXMResultStr;
    plan.P5 = Plan.MajorXMConclusionDR + "^" + Plan.MajorXMConclusionStr;
    plan.P6 = Plan.MinorXMDepictDR + "^" + Plan.MinorXMDepictStr;
    plan.P7 = Plan.MinorXMResultDR + "^" + Plan.MinorXMResultStr;
    plan.P8 = Plan.MinorXMConclusionDR + "^" + Plan.MinorXMConclusionStr;
    plan.P9 = Plan.XMLastResultDR + "^" + Plan.XMLastResultStr;
    plan.P10 = Plan.CheckBloodGroupRes;
    plan.P11 = Plan.AntibodyScreenRes;
    plan.P12 = Plan.CheckBloodPhenotype;
    plan.P13 = $('#textarea_Remark').val();

    params.Plan = JSON.stringify(plan);
    params.RowID = Plan.RowID;
    params.ReqFormDR = me.CurrentReqFormDR;
    var e = e || window.event;
    openLoading("btn_XMTest_Save", e);
    $('#btn_XMTest_Save').linkbutton('disable');

    $.ajax({
        url: me.actionUrl + '?Method=SaveXMPlanTest',
        method: 'post',
        data: params,
        success: function (r) {
            if (r.IsOk) {
                showSlide(r.Message, 3000);
                //更新配血结果
                row.XMLastResultDR = Plan.XMLastResultDR;
                row.XMLastResultStr = Plan.XMLastResultStr;

                row.MajorXMDepictDR = Plan.MajorXMDepictDR;
                row.MajorXMDepictStr = Plan.MajorXMDepictStr;
                row.MajorXMResultDR = Plan.MajorXMResultDR;
                row.MajorXMResultStr = Plan.MajorXMResultStr;
                row.MajorXMConclusionDR = Plan.MajorXMConclusionDR;
                row.MajorXMConclusionStr = Plan.MajorXMConclusionStr;

                row.MinorXMDepictDR = Plan.MinorXMDepictDR;
                row.MinorXMDepictStr = Plan.MinorXMDepictStr;
                row.MinorXMResultDR = Plan.MinorXMResultDR;
                row.MinorXMResultStr = Plan.MinorXMResultStr;
                row.MinorXMConclusionDR = Plan.MinorXMConclusionDR;
                row.MinorXMConclusionStr = Plan.MinorXMConclusionStr;

                row.Remark = Plan.Remark;
                row.MachineParameterDR = Plan.MachineParameterDR;
                row.XMMethodDR = Plan.XMMethodDR;
                row.XMMethod = GetObjectByID(me.BBXMMethod, row.XMMethodDR);
                row.MajorXMResult = GetObjectByID(me.BBXMResult, row.MajorXMResultDR);
                if (row.MajorXMResult) {
                    row.MajorXMResultCode = row.MajorXMResult.Code;
                }
                row.MinorXMResult = GetObjectByID(me.BBXMResult, row.MinorXMResultDR);
                if (row.MinorXMResult) {
                    row.MinorXMResultCode = row.MinorXMResult.Code;
                }

                if (Plan.RowID > 0) {
                    UpdateRow(me.XMPlanGrid, row.RowID, row);
                    $('.packtrack').linkbutton({ plain: true, iconCls: 'icon-track' });
                    closeLoading("btn_XMTest_Save");
                    $('#btn_XMTest_Save').linkbutton('enable');
                } else {
                    //加载新增的行
                    LoadAddedXMPlan(row);
                }
            } else {
                showError(r.Message);
                closeLoading("btn_XMTest_Save");
                $('#btn_XMTest_Save').linkbutton('enable');
            }
        },
        //在ajax发送之前禁止按钮，并且给出“正在处理”的提示
        //beforeSend: function (XMLHttpRequest) {
           
        //},
        //在ajax成功返回之后释放按钮，并且隐藏提示
        complete: function (XMLHttpRequest, textStatus) {

            //            ChangeBtnStateByPlan(row);
        }
    });
}

//加载新增的行
function LoadAddedXMPlan(row) {
    $.ajax({
        url: me.actionUrl + '?Method=LoadXMPlanByPack',
        method: 'post',
        data: { PackDR: row.PackDR, ReqFormDR: row.ReqFormDR },
        success: function (reuslt) {
            r = reuslt.rows[0];
            //me.XMPlanGrid.datagrid('appendRow', r);
            me.XMPlanGrid.datagrid('insertRow', {
                index: 0, // 索引从0开始
                row: r
            });
            me.XMPlanGrid.datagrid("fixRownumber");
            //勾选中
            var index = GetIndexByRowID(me.XMPlanGrid, r.RowID);
            me.XMPlanGrid.datagrid('selectRow', index);
            me.XMPlanGrid.datagrid('checkRow', index);
            //审核按钮聚焦
            // $('#btn_XMTest_Check').focus();
            ////清空 血袋条码输入框
            $('#txt_XMPlan_SelectPack').val('');
            $('#txt_XMPlan_ProductBarcode').val('');
            $('#txt_XMPlan_SelectPack').focus();
        },
        //在ajax成功返回之后释放按钮，并且隐藏提示
        complete: function (XMLHttpRequest, textStatus) {
            closeLoading("btn_XMTest_Save");
            $('#btn_XMTest_Save').linkbutton('enable');
            //            ChangeBtnStateByPlan(row);
        }
    });
}

function UpdatePatNewAdmNo() {
    var params = {};
    params.ReqFormDR = me.CurrentReqFormDR;
    params.AdmNo = me.NewAdmId;
    $.ajax({
        url: me.actionUrl + '?Method=UpdatePatNewAdmNo',
        method: 'get',
        data: params,
        success: function (r) {
            if (!r.IsOk) {
                showError(r.Message);
            }
            else {
                me.AdmId = me.NewAdmId;
            }
        }
    });
}

///审核配血实验检查
function CheckTestCheck(Plan) {
    if (Plan.IsXMatchProduct != "1") {
        return true;
    }
    var msg = "请先“保存”配血实验结果后再进行“审核”！";
    if (!Plan.MajorXMDepictDR || Plan.MajorXMDepictDR < 1) {
        showInfo("配血计划（血袋条码“" + Plan.PackBarcode + "”）主侧现象为空！" + msg);
        return false;
    }
    //    if (Plan.XMMethod.CName != "微柱凝胶法") {
    //        if (!Plan.MajorXMConclusionDR || Plan.MajorXMConclusionDR < 1) {
    //            showInfo("配血计划（血袋条码“" + Plan.PackBarcode + "”）主侧结论为空！" + msg);
    //            return false;
    //        }
    //    }
    if (!Plan.MajorXMResultDR || Plan.MajorXMResultDR < 1) {
        showInfo("配血计划（血袋条码“" + Plan.PackBarcode + "”）主侧结果为空！" + msg);
        return false;
    }
    if (!Plan.MinorXMDepictDR || Plan.MinorXMDepictDR < 1) {
        showInfo("配血计划（血袋条码“" + Plan.PackBarcode + "”）次侧现象为空！" + msg);
        return false;
    }
    //    if (Plan.XMMethod.CName != "微柱凝胶法") {
    //        if (!Plan.MinorXMConclusionDR || Plan.MinorXMConclusionDR < 1) {
    //            showInfo("配血计划（血袋条码“" + Plan.PackBarcode + "”）次侧结论为空！" + msg);
    //            return false;
    //        }
    //    }
    if (!Plan.MinorXMResultDR || Plan.MinorXMResultDR < 1) {
        showInfo("配血计划（血袋条码“" + Plan.PackBarcode + "”）次侧结果为空！" + msg);
        return false;
    }

    if (!Plan.XMLastResultDR || Plan.XMLastResultDR < 1) {
        showInfo("配血计划（血袋条码“" + Plan.PackBarcode + "”）交叉配血最终结果为空！" + msg);
        return false;
    }
    return true;
}

///审核配血实验
function CheckTest(e) {
    var rows = me.XMPlanGrid.datagrid('getChecked');
    if (rows.length < 1) {
        showInfo("请勾选配血计划！");
        return;
    }

    var PlanDRs = "";
    var Plans = [];
    var finished_Plans = [];
    var XMatchProductflag = "";
    for (var i = 0; i < rows.length; i++) {
        var plan = rows[i];
        if (plan.IsFinished == "1") {
            finished_Plans.push(plan.PackBarcode);
        }
        var flag = CheckTestCheck(plan);
        if (!flag) {
            return;
        }
        if (plan.IsXMatchProduct == "1") {
            XMatchProductflag = "1";
        }

        PlanDRs += plan.RowID + "^";
    }

    if (finished_Plans.length > 0) {
        showInfo("您选择的配血计划（血袋条码“" + finished_Plans.join(',') + "”）已经被审核！");
        return;
    }
    if (PlanDRs == "") {
        showInfo("没有需要审核的配血计划！");
        return;
    }

    PlanDRs = PlanDRs.substring(0, PlanDRs.length - 1);
    var params = {};
    params.PlanDRs = PlanDRs;
    params.XMCheckUserDR = me.PlanCheckUserDR;
    if (me.CheckXMPLanLogin == "Y") {
        if (XMatchProductflag == "1") {
            showwin("#win_EntryLogin", "", "../form/frmCancelIssueLogin.aspx?funcode=CheckXMPlan&params=" + JSON.stringify(params) + "&XMatchProductflag=" + XMatchProductflag, 420, 300, true);
            $('#win_EntryLogin').parent().css("background", "#FFFFFF");
            $('#win_EntryLogin').attr("class", "easyui-window panel-body panel-body-noheader panel-body-noborder");
        }
        else {
            CheckXMPlanDo(params, XMatchProductflag);
        }
    }
    else {
        CheckXMPlanDo(params, XMatchProductflag);
    }
}
function CheckXMPlanDo(params, XMatchProductflag) {
    $.ajax({
        dataType: "text", //text, json, xml
        method: 'post',
        data: params,
        url: me.actionUrl + '?Method=PromptIssuePack',
        success: function (result) {
            if (result != "1") {
                var flag = result.split("^")[0];
                var message = result.split("^")[1];
                if (flag == "-1") {
                    showError(message + "，不能配血!");
                } else {
                    $.messager.confirm('提示信息', message + "，是否继续配血?", function (isClickedOk) {
                        if (isClickedOk) {
                            CheckXMPlanDos(params, XMatchProductflag)
                        }

                    });
                }
            }
            else {
                CheckXMPlanDos(params, XMatchProductflag)
            }

        }
    });

}

function CheckXMPlanDos(params, XMatchProductflag) {
    var rows = me.XMPlanGrid.datagrid('getChecked');
    //判断电子签名
    if (CA_Config_Open == "1" && WorkGroup_CA_Open == "1") {
        UserDR = params.XMCheckUserDR;
        if (UserDR.length == 0) UserDR = SessionUserDR;
        if (XMatchProductflag == "1") {
            if (UkeyNoArray[UserDR] == undefined || UkeyNoArray[UserDR] == "") {
                showwin("#win_CAUserLogin", "", "../../ca/form/frmCALogin.aspx?UserDR=" + UserDR + "&funCode=CheckXMPlan", 420, 330, true);
                return;
            }
        }
    }
    if (params == "") {
            var PlanDRs = ""
            for (var i = 0; i < rows.length; i++) {
                var plan = rows[i];
                if (plan.IsFinished == "1") {
                    finished_Plans.push(plan.PackBarcode);
                }
                PlanDRs += plan.RowID + "^";
            }
            PlanDRs = PlanDRs.substring(0, PlanDRs.length - 1);
            var params = {};
            params.PlanDRs = PlanDRs;
            params.XMCheckUserDR = UserDR;
     } 

    var e = e || window.event;
    openLoading("btn_XMTest_Check", e);
    $('#btn_XMTest_Check').linkbutton('disable');

    $.ajax({
        url: me.actionUrl + '?Method=CheckXMPlan',
        type: 'post',
        data: params,
        success: function (r) {
            if (r.IsOk) {
                //RefreshXMPlan();
                //配血计划审核，后保持勾选中（不刷新datagrid）
                ReloadXMPlanRows(rows, true);
                //加载费用
                // LoadCostItem();
                //审核之后，焦点保持在“发血”按钮
                $('#btn_XMPlan_IssuePack').focus();
                showSlide(r.Message);

                //给审核成功的配血计划电子签名
                if (CA_Config_Open == "1" && WorkGroup_CA_Open == "1") {
                    var this_strClientCertID = AuthLogin_strClientCertID.lenth > 0 ? AuthLogin_strClientCertID : strClientCertID;
                    var this_strClientCert = AuthLogin_strClientCert.length > 0 ? AuthLogin_strClientCert : strClientCert;
                    for (var i = 0; i < rows.length; i++) {
                        if (rows[i]["RowID"] != undefined && rows[i]["RowID"].length > 0) {
                            //SignXMPlan(this_strClientCertID, this_strClientCert, Plans[i]["RowID"]);
                            SignData(CA_Config_Company, WebServicAddress, UkeyNoArray[UserDR], "XMPlan", rows[i]["RowID"], UserDR);
                        }
                    }
                }
            } else {
                showError(r.Message);
            }
        },
        //在ajax发送之前禁止按钮，并且给出“正在处理”的提示
        //beforeSend: function (XMLHttpRequest) {
           
        //},
        //在ajax成功返回之后释放按钮，并且隐藏提示
        complete: function (XMLHttpRequest, textStatus) {
            closeLoading("btn_XMTest_Check");
            $('#btn_XMTest_Check').linkbutton('enable');
            //            ChangeBtnStateByPlan(row);
        }
    });
}

//从后台更新指定的字段信息
function ReloadXMPlanRows(rows, printxmmethod) {
    var params = {};
    params.Packs = [];
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        params.Packs.push(row.PackDR);
    }
    //params.Packs = JSON.stringify(packs);
    params.ReqFormDR = me.CurrentReqFormDR;

    $.ajax({
        url: me.actionUrl + '?Method=ReloadXMPlanRows',
        method: 'post',
        data: params,
        success: function (r) {
            for (var i = 0; i < r.total; i++) {
                var rowDatas = me.XMPlanGrid.datagrid('getRows');
                for (var j = 0; j < rowDatas.length; j++) {
                    if (r.rows[i].RowID == rowDatas[j].RowID) {
                        me.XMPlanGrid.datagrid('updateRow', { index: j, row: r.rows[i] });
                    }
                }
            }
            if (printxmmethod) {
                PrintXMMethod(rows[0]);
            }
        }
    });
}

function PrintXMMethod(row, printflag) {
    if (!row) {
        var row = me.XMPlanGrid.datagrid('getSelected');
    }
    if (!row) {
        showInfo("请选择配血计划！");
        return;
    }
    if (row.IsFinished == "0") {
        showInfo("配血计划还没有审核，不能进行打印！");
        return;
    }
    if (printflag == "1") {
        printXMMethodByHos(row.XMPlanNo + "^" + me.CurrentReqFormDR);
    }
    else {
        if (me.IsAutoPrintXMMethod == "Y") {
            printXMMethodByHos(row.XMPlanNo + "^" + me.CurrentReqFormDR);
        }
    }

}

//配血计划已配血
//申请单已配血
function UpdateRowByCheck(row, Plan) {
    row.IsFinished = true;
    //更新配血结果
    row.XMLastResultDR = Plan.XMLastResultDR;
    row.XMLastResultStr = Plan.XMLastResultStr;

    row.MajorXMDepictDR = Plan.MajorXMDepictDR;
    row.MajorXMDepictStr = Plan.MajorXMDepictStr;
    row.MajorXMResultDR = Plan.MajorXMResultDR;
    row.MajorXMResultStr = Plan.MajorXMResultStr;
    row.MajorXMConclusionDR = Plan.MajorXMConclusionDR;
    row.MajorXMConclusionStr = Plan.MajorXMConclusionStr;

    row.MinorXMDepictDR = Plan.MinorXMDepictDR;
    row.MinorXMDepictStr = Plan.MinorXMDepictStr;
    row.MinorXMResultDR = Plan.MinorXMResultDR;
    row.MinorXMResultStr = Plan.MinorXMResultStr;
    row.MinorXMConclusionDR = Plan.MinorXMConclusionDR;
    row.MinorXMConclusionStr = Plan.MinorXMConclusionStr;

    row.Remark = Plan.Remark;
    row.MachineParameterDR = Plan.MachineParameterDR;
    row.XMMethodDR = Plan.XMMethodDR;

    //配血日期  配血用户  TODO
    //    UpdateRow(me.XMPlanGrid, row.RowID, row);

    //申请单已发血
    var Req_rows = me.ReqFormGrid.datagrid('getRows');
    for (var i = 0; i < Req_rows.length; i++) {
        var req = Req_rows[i];
        if (req.RowID == row.ReqFormDR) {
            var plans = req.Others['Plans'];
            for (var j = 0; j < plans.length; j++) {
                if (plans[j].RowID == row.RowID) {
                    plans[j].IsFinished = true;
                    break;
                }
            }

            me.ReqFormGrid.datagrid('updateRow', { index: i, row: req });
            me.ReqFormGrid.datagrid('selectRow', i);
            return;
        }
    }
}

//配血计划已配血
//申请单已配血
function UpdateRowByUnCheck(row) {
    row.IsFinished = false;
    row.XMCheckDate = '';
    row.XMCheckTime = '';
    row.XMCheckUser = {};
    row.XMCheckUserDR = '';
    //配血日期  配血用户  TODO
    //    UpdateRow(me.XMPlanGrid, row.RowID, row);

    //申请单已发血
    var Req_rows = me.ReqFormGrid.datagrid('getRows');
    for (var i = 0; i < Req_rows.length; i++) {
        var req = Req_rows[i];
        if (req.RowID == row.ReqFormDR) {
            me.ReqFormGrid.datagrid('selectRow', i);
            return;
        }
    }
}

///加载取消审核原因
function LoadCancelReason() {
    ///加载预计需要采购的试剂
    me.CancelReasonsGrid.datagrid({
        url: me.actionUrl + '?Method=QueryCancelReasons',
        method: 'post',
        idField: 'RowID',
        sortName: 'RowID',
        sortOrder: "asc",
        fitColumns: true,
        fit: false,
        remoteSort: false,
        singleSelect: true,
        nowrap: false,  //折行
        border: false,
        columns: [[
                    { field: 'RowID', title: 'RowID', hidden: true },
                    { field: 'CName', title: '双击备选原因', width: 300, sortable: true, align: 'left' }
        ]],
        toolbar: '#CancelReasonsGridToolBar',
        onBeforeLoad: function (param) {
            me.CancelReasonsData = null;
        },
        onDblClickRow: function (rowIndex, rowData) {
            //将原因填写到输入框中
            var text = $('#CancelReason').val();
            $('#CancelReason').val(text + rowData.CName + ";");
        },
        onLoadSuccess: function (data) {
            if (me.CancelReasonsData == null) {
                me.CancelReasonsData = data;
            }
        }
    });
}


///加载取消审核原因
function LoadCancelIssueReason() {
    ///加载预计需要采购的试剂
    me.CancelIssueReasonsGrid.datagrid({
        url: me.actionUrl + '?Method=QueryCancelReasons',
        method: 'post',
        idField: 'RowID',
        sortName: 'RowID',
        sortOrder: "asc",
        fitColumns: true,
        fit: false,
        remoteSort: false,
        singleSelect: true,
        nowrap: false,  //折行
        border: false,
        columns: [[
                    { field: 'RowID', title: 'RowID', hidden: true },
                    { field: 'CName', title: '双击备选原因', width: 300, sortable: true, align: 'left' }
        ]],
        toolbar: '#CancelIssueReasonsGridToolBar',
        onBeforeLoad: function (param) {
            me.CancelIssueReasonsData = null;
        },
        onDblClickRow: function (rowIndex, rowData) {
            //将原因填写到输入框中
            var text = $('#CancelIssueReason').val();
            $('#CancelIssueReason').val(text + rowData.CName + ";");
        },
        onLoadSuccess: function (data) {
            if (me.CancelIssueReasonsData == null) {
                me.CancelIssueReasonsData = data;
            }
        }
    });
}
//取消审核
function CancelDialogShow() {
    //    var rowData = me.XMPlanGrid.datagrid('getSelected');
    //    if (!rowData) {
    //        showInfo("请选择配血计划！");
    //        return;
    //    }
    var rows = me.XMPlanGrid.datagrid('getChecked');
    if (rows.length < 1) {
        showInfo("请勾选配血计划！");
        return;
    }
    var PackBarcodes = '';
    var Plans = [];
    var row = null;
    var packDRs = "";
    for (var i = 0; i < rows.length; i++) {
        row = rows[i];
        if (row.IsFinished != "1") {
            showInfo("您选择的配血计划（血袋条码“" + row.PackBarcode + "”）还未被审核！");
            return;
        }
        if (row.IsIssued == "1") {
            showInfo("您选择的配血计划（血袋条码“" + row.PackBarcode + "”）已经发血,请先取消发血！");
            return;
        }
        PackBarcodes += row.PackBarcode;
        if (i < rows.length - 1) {
            PackBarcodes += ",";
        }

        //  var Plan = {};
        // Plan.RowID = row.RowID;
        //Plans.push(Plan);
        packDRs += row.PackDR + "^";
    }
    packDRs = packDRs.substring(0, packDRs.length - 1);
    // var params = {};
    // params.Plans = JSON.stringify(Plans);
    //  var row = rowData.Plan;

    if (me.IsUnCheckUserSame == "Y") {
        if (row.XMCheckUserDR != me.SessionUserDR) {
            showSlide('取消审核者必须和审核者一致!');
            return;
        }
    }
    $.messager.confirm('确认', '确定取消审核配血计划（血袋条码“' + PackBarcodes + '”）?', function (r) {
        if (r) {
            //显示取消审核原因窗口
            $('#CancelReason').val('');
            //清除数据
            $('#div_CancelReason').dialog('open');
            getPlanCheckCost(packDRs);
        }
    });
}
//取消发血
function CancelIssueDialogShow() {
    var rows = me.XMPlanGrid.datagrid('getChecked');
    if (!rows || rows.length < 1) {
        showInfo("请勾选配血计划！");
        return;
    }
    var PackBarcodes = "";
    var packDRs = "";
    for (var i = 0; i < rows.length; i++) {
        row = rows[i];
        if (row.IsFinished != "1") {
            showInfo("您选择的配血计划（血袋条码“" + row.PackBarcode + "”）还未被审核！");
            return;
        }
        if (row.CallbackDate != "") {
            showInfo("血袋条码“" + row.PackBarcode + "”已经回收，不能取消发血！");
            return;
        }
        if (row.IsIssued != "1") {
            showInfo("您选择的配血计划（血袋条码“" + row.PackBarcode + "”）还未发血！");
            return;
        }


        PackBarcodes += row.PackBarcode;
        if (i < rows.length - 1) {
            PackBarcodes += ",";
        }
        packDRs += row.PackDR + "^";
    }
    packDRs = packDRs.substring(0, packDRs.length - 1);


    //$('#divPackCost').dialog('open');
    $.messager.confirm('确认', '确定取消发血（血袋条码“' + PackBarcodes + '”）?', function (r) {
        if (r) {
            //显示取消审核原因窗口
            $('#CancelIssueReason').val('');
            //清除数据
            $('#div_CancelIssueReason').dialog('open');
            getPackCost(packDRs);
        }
    });
}

//取消审核
function CancelCheck() {
    //    var rowData = me.XMPlanGrid.datagrid('getSelected');
    //    if (!rowData) {
    //        showInfo("请选择配血计划！");
    //        return;
    //    }
    //  var row = rowData.Plan;
    var reason = $('#CancelReason').val();
    if (!reason) {
        showSlide('请输入取消原因!');
        return;
    }
    //得到界面选中数据
    //var rows = $('#dgXMPlanCost').datagrid("getChecked");
    var rows = $('#dgXMPlanCost').datagrid("getData").rows;

    //判断数据
    if (!rows || rows.length < 1) {
        UnCheckXMPlanDo(reason);
        return;
    }
    var ReqCostIDs = "";
    //遍历组成医嘱串
    for (var i = 0; i < rows.length; i++) {
        var cost = rows[i];
        if (cost.ItemStatus == 30) {
            $.messager.alert('提示', "“" + cost.CostItemName + '”已经为退费状态，不能够重复退费！', 'info');
            return;
        }
        ReqCostIDs += cost.RowID + ",";
    }
    if (ReqCostIDs == "") {
        $.messager.alert('提示', '没有需要退费的血液！', 'info');
        return;
    }
    ReqCostIDs = ReqCostIDs.substring(0, ReqCostIDs.length - 1);
    $.ajax({
        type: "post",
        url: "../ashx/ashBdManualAccount.ashx" + '?Method=CancelHisCost',
        data: { ReqFormDR: me.CurrentReqFormDR, ReqCostIDs: ReqCostIDs },
        success: function (result) {
            if (result.IsOk) {
                UnCheckXMPlanDo(reason);
            }
            else {
                $.messager.confirm('提示', "退费取消失败，" + result.Message + ",是否继续取消审核操作?", function (r) {
                    if (r) {
                        UnCheckXMPlanDo(reason);
                    }
                });
            }
        }
    });
}

function UnCheckXMPlanDo(reason) {
    var rows = me.XMPlanGrid.datagrid('getChecked');
    if (rows.length < 1) {
        showInfo("请勾选配血计划！");
        return;
    }
    var PlanDRs = "";
    var Plans = [];
    var row = null;
    var PackDRs = "";
    for (var i = 0; i < rows.length; i++) {
        row = rows[i];
        PlanDRs += row.RowID + "^";

    }
    PlanDRs = PlanDRs.substring(0, PlanDRs.length - 1);
    var params = {};
    params.PlanDRs = PlanDRs;
    params.Reason = reason;
    var e = e || window.event;
    openLoading("btn_Cancel_Conform", e);
    $('#btn_Cancel_Conform').linkbutton('disable');
    $.ajax({
        url: me.actionUrl + '?Method=UnCheckXMPlan',
        method: 'post',
        data: params,
        success: function (r) {
            if (r.IsOk) {
                showSlide(r.Message, 3000);
                ReloadXMPlanRows(rows);
                // UpdateRowByUnCheck(row);
                //刷新状态
                $('#currentStatus').text("未审核");
                $('#currentStatus').css("color", BD.IsXMPlanedColor.NO);

                //关闭窗口
                $('#div_CancelReason').dialog('close');
            } else {
                showError(r.Message);
            }
        },
        //在ajax发送之前禁止按钮，并且给出“正在处理”的提示
        //beforeSend: function (XMLHttpRequest) {
          
        //},
        //在ajax成功返回之后释放按钮，并且隐藏提示
        complete: function (XMLHttpRequest, textStatus) {
            closeLoading("btn_Cancel_Conform");
            $('#btn_Cancel_Conform').linkbutton('enable');
            ChangeBtnStateByPlan(row);
        }
    });
}

//通知取血
function InformXMPlan(e) {
    //if (InformFlag == "1") {
        InformXMPlanDo();
   // }
   // else {
       // CancelInformXMPlan();
   // }

}
//通知取血
function InformXMPlanDo() {
    var rows = me.XMPlanGrid.datagrid("getChecked");
    if (rows.length == 0) {
        $.messager.alert("提示", "请选择需要发送取血通知的血袋！");
        return;
    }
    var tips = "";  // 警告提示
    var infoXMPlanDRs = "";
    var tipsReq = ""; // 必要提示
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var IsVerify = row.IsVerify;

        if (IsVerify == "0" || IsVerify == "") {
            infoXMPlanDRs = infoXMPlanDRs + "^" + row.RowID;
        } else if (IsVerify == "2") {
            // IsVerify = 2 校对提示
            infoXMPlanDRs = infoXMPlanDRs + "^" + row.RowID;
            if (row.IsVerified != "1") {
                tips = tips + "," + row.PackID;
            }
        } else {
            // IsVerify = 1 强制校对
            if (row.IsVerified != "1") {
                tipsReq = tipsReq + "," + row.PackID;
            } else {
                infoXMPlanDRs = infoXMPlanDRs + "^" + row.RowID;
            }
        }
    }
    tipsReq = tipsReq.substring(1);
    infoXMPlanDRs = infoXMPlanDRs.substring(1);
    if (tipsReq != "") {
        $.messager.alert("提示", "血袋 " + tipsReq + " 需要进行核对才能发送取血通知！");
        return;
    }
    tips=tips.substring(1);
    if (tips != "") {
        $.messager.confirm('确认', "血袋 " + tips + " 尚未校对，是否继续发送通知", function (r) {
            if (r) {
                InformXMPlanDoGo(infoXMPlanDRs,rows);
            }
        })
    } else {
        InformXMPlanDoGo(infoXMPlanDRs,rows);
    }

}

function InformXMPlanDoGo(infoXMPlanDRs,rows) {
    $.ajax({
        url: me.actionUrl + '?Method=InformXMPlan',
        method: 'get',
        data: { ReqFormDR: me.CurrentReqFormDR, infoXMPlanDRs: infoXMPlanDRs },
        success: function (r) {
            if (r.IsOk) {
                showSlide(r.Message, 3000);
                ReloadXMPlanRows(rows);
                // UpdateRowByCheck(row, Plan);
                //刷新状态
                // $('#currentStatus').text("已审核");
                //$('#currentStatus').css("color", BD.IsXMPlanedColor.YES);
            } else {
                showError(r.Message);
            }
        }
    });
}
///是否做了配血計劃
function IsXMPlan(Plans) {
    if (Plans.length > 0) {
        for (var i = 0; i < Plans.length; i++) {
            if (Plans[i].IsFinished) {
                return true;
            }
        }
    }
    return false;
}

///是否已发血
function IsIssued(Plans) {
    var isIssuedFlag = false;
    if (Plans.length > 0) {
        var plans = Plans;
        for (var j = 0; j < plans.length; j++) {
            if (plans[j].IsIssued) {
                isIssuedFlag = true;
                break;
            }
        }
    }
    if (isIssuedFlag) {
        return true;
    }
    return false;
}

////返回带格式（颜色、加粗）的状态
//function IsXMPlanedWithColor(rowData) {
//    var color = BD.IsXMPlanedColor.NO;
//    var text = "未";
//    //如果已发血
//    if (IsXMPlan(rowData)) {
//        text = "已";
//        color = BD.IsXMPlanedColor.YES;
//    }
//    return '<strong  style="color:' + color + ';font-size:14px;">' + text + '</strong>';
//}


//返回带格式（颜色、加粗）的状态
function IsXMPlanedWithColor(IsXMPlaned) {
    var color = BD.IsXMPlanedColor.NO;
    var text = "未";
    //如果已发血
    if (IsXMPlaned == "1") {
        text = "已";
        color = BD.IsXMPlanedColor.YES;
    }
    return '<strong  style="color:' + color + ';font-size:14px;">' + text + '</strong>';
}


//返回带格式（颜色、加粗）的状态(默认为订单状态)
function IsIssuedWithColor(IsPlanIssued, IsPlanNotIssued,IsChaoliang) {
    var color = BD.IsIssuedColor.NO;
    var text = "未";
    var isIssuedflag = false;
    var isNotIssueFlag = false;


    if (IsPlanIssued == "0") {
        color = BD.IsIssuedColor.NO;
        text = "未";
    }

        //部分发血
    else if (IsPlanIssued == "1" && IsPlanNotIssued == "1") {
        color = BD.IsIssuedColor.PART;
        text = "部";
    }

    else
        //全部发血
        if (IsPlanNotIssued == "0") {
            color = BD.IsIssuedColor.ALL;
            text = "全";
        }
		
	if(IsChaoliang=="1"){
		text="超";
		color="#FF6100";
	}
    return '<strong style="color:' + color + ';font-size:14px;">' + text + '</strong>';
}


//根据当前选择的配血计划设定按钮状态（是否可用）
function ChangeBtnStateByPlan(rowData) {

}

/************************** Issue **********************************************************/



//发血
/**
配血计划： 是否发血	IsIssued
血袋：
血袋状态	PackStatusDR
血袋库存状态	StatusStock
**/
function IssueXMPlan() { 
    if (!IssueXMPlanCheck()) {
        return;
    }
    $.ajax({
        url: me.actionUrl + '?Method=QryVisitNumberReportByAdm&AdmNo=' + me.AdmId,
        dataType: "text", //text, json, xml
        async:false,
        success: function (result) {
            if (result!="1"){
                showError(result);
                return;
            }
            if (me.IsBindTakeRec == "Y") {
                ShowTakRecordWin();
            }
            else {
                if (me.IsTakeUserName == "Y") {
                    GetTakeUserName();
                }
                else {
                    CheckShowPackCost();
                }
            }
        }
    });
    
}

function ShowTakRecordWin() {
    $('#txt_TakeRecordNo').val('');
    $('#takeRec_window').window("open");
}
function IssueXMPlanByTakRec() {
    if (me.CurrentTakeRecordDR == "") {
        showError("请扫描正确的取血单号!");
        return;
    }
    $('#takeRec_window').window("close");
    if (me.IsTakeUserName == "Y") {
        GetTakeUserName();
    }
    else {
        CheckShowPackCost();
    }
}

function CheckShowPackCost() {

    if (me.IsShowPackCost == "Y") {
        var rows = me.XMPlanGrid.datagrid('getChecked');
        var packDRs = "";
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            packDRs += row.PackDR + "^";
        }
        packDRs = packDRs.substring(0, packDRs.length - 1);
        StatPackCost(packDRs);
        $('#div_statPackCost').dialog('open');
        $('#btn_Issue').focus();
    }
    else {
        IssueLogin();
    }
}
function IssueLogin() {
    if (me.IssueLogin == "Y") {
        showwin("#win_EntryLogin", "", "../form/frmCancelIssueLogin.aspx?typeCode=checkLogin&funcode=Issue", 420, 330, true);
        $('#win_EntryLogin').parent().css("background", "#FFFFFF");
        $('#win_EntryLogin').attr("class", "easyui-window panel-body panel-body-noheader panel-body-noborder");
    }
    else {
        StateIssueXMPlan("0");
    }
}

function StateIssueXMPlan(IssueUserDR) { 
    //var showinfo =PromptIssuePackVol();
    var showinfo = "";
    //判断电子签名
    if (CA_Config_Open == "1" && WorkGroup_CA_Open == "1") {
        if (UkeyNoArray[UserDR] == undefined || UkeyNoArray[UserDR] == "") {
            if (IssueUserDR != "0") UserDR = IssueUserDR;
            if (UserDR.length == 0) UserDR = SessionUserDR;
            showwin("#win_CAUserLogin", "", "../../ca/form/frmCALogin.aspx?UserDR=" + UserDR + "&funCode=IssueXMPlan", 420, 330, true);
            return;
        }
    }
    if (me.IsVerify == "Y") {
        me.VerifyDatagridData = me.XMPlanGrid.datagrid('getChecked');
        VerifyIssueXMPlan(IssueUserDR);
        return;
    }
    var rows = me.XMPlanGrid.datagrid('getChecked');
    var PackBarcodes = '';
    var Plans = [];
    var row = null;
    var packDRs = "";
    var planDRs = "";
    var isNegativePack = "";
    for (var i = 0; i < rows.length; i++) {
        row = rows[i];
        PackBarcodes += row.PackBarcode;
        if (i < rows.length - 1) {
            PackBarcodes += ",";
        }
        if (row.RH == "N") {
            isNegativePack = "1";
        }
        var Plan = {};
        Plan.RowID = row.RowID;
        Plan.ReqFormDR = row.ReqFormDR;
        Plan.PackDR = row.PackDR;
        // Plan.SampleNo = row.SampleNo;
        Plan.SampleNo = me.Labno;
        Plan.PackBarcode = row.PackBarcode;
        Plan.XMPlanNo = row.XMPlanNo;
        Plans.push(Plan);
        packDRs += row.PackDR + "^";
        planDRs += row.RowID + "^";
    }
    packDRs = packDRs.substring(0, packDRs.length - 1);
    planDRs = planDRs.substring(0, planDRs.length - 1);

    var params = {};
    params.Plans = JSON.stringify(Plans);
    params.IssueUserDR = IssueUserDR;
    params.TakeRecordDR = me.CurrentTakeRecordDR;
    params.planDRs = planDRs;
    params.TakeUserName = $("#hiddenTakeUserName").val();
    $.messager.confirm('确认', showinfo + '确定发血（血袋条码“' + PackBarcodes + '”）?', function (r) {
        if (r) {
            $.ajax({
                dataType: "text", //text, json, xml
                method: 'post',
                data: params,
                url: me.actionUrl + '?Method=PromptIssuePack',
                success: function (result) {
                    if (result != "1") {
                        var flag = result.split("^")[0];
                        var message = result.split("^")[1];
                        if (flag == "-1") {
                            showError(message + ",不能发血!");
                        } else {
                            $.messager.confirm('提示信息', message + ',是否继续发血?', function (isClickedOk) {
                                if (isClickedOk) {
                                    params.positiveFee = false;
                                    IssueXMPlanDo(params, rows);
                                }

                            });
                        }
                    }
                    else {
                        params.positiveFee = false;
                        IssueXMPlanDo(params, rows);
                    }

                }
            });
        } 
    }); 
} 
function IssueXMPlanDo(params, rows) { 
    var e = e || window.event;
    openLoading("btn_XMPlan_IssuePack", e);
    $('#btn_XMPlan_IssuePack').linkbutton('disable');
    $.ajax({
        url: me.actionUrl + '?Method=IssueXMPlan',
        type: 'post',
        data: params,
        success: function (r) {
            if (r.IsOk) {
                if (me.IsShowPackCost == "Y") {
                    $('#div_statPackCost').dialog('close');
                }
                if (me.IsVerify == "Y") {
                    $("#win_VerifyIssuePack").window('close');
                }
                ReloadXMPlanRows(rows);
                var row = null;
                var PackDRs = ""
                for (var i = 0; i < rows.length; i++) {
                    row = rows[i];
                    PackDRs = PackDRs + "^" + row.PackDR + "@" + row.RowID;
                }
                //InsertCancelInfo(PackDRs);
                //加载费用
                //LoadCostItem();
                //进行电子签名
                //var retForDigitalData = returnData.Message.substr(2, returnData.Message.length - 2);
                //审核的话如果登录CA提交CA数据
                if (WorkGroup_CA_Open == "1" && CA_Config_Open == "1") {
                    var retData = r.Message;
                    var DataRowID = retData.split("^")[0];
                    var OriData = retData.replace(DataRowID + "^", "");
                    SignData(CA_Config_Company, WebServicAddress, UkeyNoArray[UserDR], "Issue", DataRowID, UserDR);
                }
                //配血计划已发血
                //申请单已发血
                // UpdateReqFormByIssue(rows);
                //打印发血单
                PrintIssue(r.Code);
                //InserIssInfo(r.Code);
                //showInfo(r.Message + "！当前正在打印发血单...");
            } else {
                showError(r.Message);
            }
        },
        //在ajax发送之前禁止按钮，并且给出“正在处理”的提示
       
        //在ajax成功返回之后释放按钮，并且隐藏提示
        complete: function (XMLHttpRequest, textStatus) {
            closeLoading("btn_XMPlan_IssuePack");
            $('#btn_XMPlan_IssuePack').linkbutton('enable');
        }
    });
}

function PromptIssuePackVol() {
    var row = me.ReqFormGrid.datagrid('getSelected');
    var products = row.ReqProductInfo.split('^');
    var productList = [];
    var bldComponentsDRList = [];
    for (var i = 0; i < products.length; i++) {
        var Product = products[i];
        var bldComponentsDR = Product.split('@')[8];
        var index = $.inArray(bldComponentsDR, bldComponentsDRList);
        if (index == "-1") {
            var productInfo = {};
            bldComponentsDRList.push(bldComponentsDR);
            productInfo.BloodComponentsName = Product.split('@')[1];
            productInfo.PackVolume = Product.split('@')[6];
            productList.push(productInfo);
        }
        else {
            productList[index].PackVolume += Product.split('@')[6];
        }
    }
    var plans = me.XMPlanGrid.datagrid('getData');
    var issueplans = me.XMPlanGrid.datagrid('getChecked');
    var issuepackDRList = [];
    for (var i = 0; i < issueplans.length; i++) {
        issuepackDRList.push(issueplans[i].RowID);
    }
    var packsList = [];
    var packComponentsDRList = [];
    for (var j = 0; j < plans.rows.length; j++) {
        var plan = plans.rows[j];
        var packindex = $.inArray(plan.RowID, issuepackDRList);
        if (packindex == "-1" && plan.PackStatusCode != "OUT") {
            continue;
        }
        var packComponentsDR = plan.BloodComponentsDR;
        var index = $.inArray(packComponentsDR, packComponentsDRList);
        if (index == "-1") {
            var packsInfo = {};
            packComponentsDRList.push(packComponentsDR);
            packsInfo.PackVolume = plan.PackVolume;
            packsList.push(packsInfo);
        }
        else {
            packsList[index].PackVolume += plan.PackVolume;
        }
    }
    var BloodComponentsNames = "", showinfo = "";
    for (var i = 0; i < bldComponentsDRList.length; i++) {
        for (var j = 0; j < packComponentsDRList.length; j++) {
            if (bldComponentsDRList[i] == packComponentsDRList[j]) {
                if (productList[i].PackVolume < parseFloat(packsList[j].PackVolume)) {
                    BloodComponentsNames += productList[i].BloodComponentsName + ","
                    // showInfo(productList[i].BloodComponentsName +":发血数量大于取血数量");
                }
            }
        }
    }
    if (BloodComponentsNames.length > 0) {
        showinfo = "[" + BloodComponentsNames.substring(0, BloodComponentsNames.length - 1) + "发血血量大于申请血量]";
    }
    return showinfo;
}



//配血计划已发血
//申请单已发血
function UpdateReqFormByIssue(rows) {
    var row = null;
    for (var i = 0; i < rows.length; i++) {
        row = rows[i].Plan;
        //配血计划已发血
        row.IsIssued = true;
    }

    //申请单已发血
    var Req_rows = me.ReqFormGrid.datagrid('getRows');
    for (var i = 0; i < Req_rows.length; i++) {
        var req = Req_rows[i];
        if (req.RowID == row.ReqFormDR) {
            var plans = req.Others['Plans'];

            for (var z = 0; z < rows.length; z++) {
                for (var j = 0; j < plans.length; j++) {
                    if (plans[j].RowID == rows[z].RowID) {
                        plans[j].IsIssued = true;
                        break;
                    }
                }
            }

            me.ReqFormGrid.datagrid('updateRow', { index: i, row: req });
            return;
        }
    }
}


///发血前检查
function IssueXMPlanCheck(row) {
    var rows = me.XMPlanGrid.datagrid('getChecked');
    if (!rows || rows.length < 1) {
        showInfo("请勾选配血计划！");
        return false;
    }
    var isIssuePackBarcodes = '';
    var unCheckPackBarcodes = '';
    var cannotIssuePackBarcodes = '';
    var bloodmatchfail = '';
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (row.IsFinished != "1") {
            unCheckPackBarcodes += row.PackBarcode + ",";
        }
        if (row.IsIssued == "1") {
            isIssuePackBarcodes += row.PackBarcode + ",";
        }
        if (row.TransactionCode == "BloodMatchFail") {
            bloodmatchfail += row.PackBarcode + ",";
        }
    }
    if (isIssuePackBarcodes.length > 2) {
        isIssuePackBarcodes = isIssuePackBarcodes.substr(0, isIssuePackBarcodes.length - 1);
    }
    if (isIssuePackBarcodes.length > 1) {
        showInfo("血袋(" + isIssuePackBarcodes + ")已为发血状态，不能重复发血！");
        return false;
    }
    if (unCheckPackBarcodes.length > 2) {
        unCheckPackBarcodes = unCheckPackBarcodes.substr(0, unCheckPackBarcodes.length - 1);
    }
    if (unCheckPackBarcodes.length > 1) {
        showInfo("血袋(" + unCheckPackBarcodes + ")未完成配血实验，不能进行发血！");
        return false;
    }
    if (bloodmatchfail.length > 2) {
        bloodmatchfail = bloodmatchfail.substr(0, bloodmatchfail.length - 1);
    }
    if (bloodmatchfail.length > 1) {
        showInfo("血袋(" + bloodmatchfail + ")配血失败，不能进行发血！");
        return false;
    }
    return true;
}


//取消发血
/**
配血计划： 是否发血	IsIssued
血袋：
血袋状态	PackStatusDR
血袋库存状态	StatusStock
**/
function CancelIssueXMPlan() {
    var rows = me.XMPlanGrid.datagrid('getChecked');
    if (!rows || rows.length < 1) {
        showInfo("请选择配血计划！");
        return false;
    }
    var reason = $('#CancelIssueReason').val();
    if (!reason) {
        showSlide('请输入取消原因!');
        return;
    }
    if (me.CancelIssueLogin == "Y") {
        showwin("#win_EntryLogin", "", "../form/frmCancelIssueLogin.aspx?typeCode=checkLogin&funcode=CancelIssue", 420, 330, true);
        $('#win_EntryLogin').parent().css("background", "#FFFFFF");
        $('#win_EntryLogin').attr("class", "easyui-window panel-body panel-body-noheader panel-body-noborder");
    }
    else {
        UnCharge("0");
    }
}


//配血计划取消已发血
//申请单取消已发血显示
function UpdateRowsByCancelIssue(row) {
    //配血计划取消已发血
    row.IsIssued = false;

    //申请单已发血
    var Req_rows = me.ReqFormGrid.datagrid('getRows');
    for (var i = 0; i < Req_rows.length; i++) {
        var req = Req_rows[i];
        if (req.RowID == row.ReqFormDR) {
            var plans = req.Others['Plans'];
            for (var j = 0; j < plans.length; j++) {
                if (plans[j].RowID == row.RowID) {
                    plans[j].IsIssued = false;
                    break;
                }
            }
            me.ReqFormGrid.datagrid('updateRow', { index: i, row: req });
            return;
        }
    }
}

//根据当前选择的配血计划设定按钮状态（是否可用）
//function ChangeBtnStateByPlan(rowData) {
//    ChangeBtnToUnable();
//    if (rowData.IsFinished && !rowData.IsIssued) {
//        $('#btn_XMPlan_IssuePack').linkbutton('enable');
//    }
//    if (rowData.IsIssued) {
//        $('#btn_XMPlan_CancelIssuePack').linkbutton('enable');
//    }
//}

////将按钮设置为不可用
//function ChangeBtnToUnable() {
//    $('#btn_XMPlan_IssuePack').linkbutton('disable');
//    $('#btn_XMPlan_CancelIssuePack').linkbutton('disable');
//}

//通过配血计划找到发血单，然后调用打印
function QryIssueRecord() {
    if (me.CurrentReqFormDR) {
        showwin("#div_IssueRecord", "发血单信息", "../form/frmQryBdPackIssue.aspx?ReqFormDR=" + me.CurrentReqFormDR, 950, 560, true);
    } else {
        showError("索引为空：reqFormDR:" + reqFormDR + "！");
    }
}

//打印发血单
function PrintIssue(IssueDR) {
    printIssueByHos("", IssueDR);
}


//手工计费
function ManualAccount(rowIndex) {
    if (rowIndex) {
        row = me.ReqFormGrid.datagrid('getRows')[rowIndex];
        if (row.AdmType == "A") {
            showError("手工申请单不能进行手工计费！");
            return;
        }
        showwin("#win_ManualAccount", "手工计费", "./frmBdManualAccount.aspx?ReqFormNo=" + row.ReqFormNo + "&funUnCharge=" + me.funUnCharge, 860, 560, true);
    } else {
        showError("索引为空：rowIndex:" + rowIndex + "！");
    }
}

//设置默认值
function SetDefault() {
    var flag = $('#IsXMatchProduct').val();
    if (flag) {
        LoadXMPlanTest(me.DefaultXMTest, true);
    }
}

/********************审核********************************/

///显示初审登录窗口// 
function EntryLogin() {
    showwin("#win_EntryLogin", "", "../form/frmEntryUserLogin.aspx?typeCode=checkLogin&IsCheckUserSame=" + me.IsCheckUserSame + "&IsCheckAuthUserPassword=" + me.IsCheckAuthUserPassword + "&UserCode" + UserCode, 420, 330, true);
    $('#win_EntryLogin').parent().css("background", "#FFFFFF");
    $('#win_EntryLogin').attr("class", "easyui-window panel-body panel-body-noheader panel-body-noborder");
    return;
}


///获取初审登录信息
function GetEntryLoginInfo() {
    if (IsKeepAuth == "True") {
        var AuthInfo = sessionStorage.getItem("PlanCheckInfo");
        if (AuthInfo == null) return;
        me.PlanCheckUserDR = AuthInfo.split("^")[0];
        me.IsEntryLogon = "Y";
        $('#btn_XMTest_Check').linkbutton('enable');
        $("#btn_EntryLogin").linkbutton({
            iconCls: '',
            text: "[<span id='sp_AuthLoginUserName' style='color:red'>" + AuthInfo.split("^")[1] + "</span>]审核"
        });
    }
}


function getPackCost(packDR) {
    $('#dgPackCost').datagrid({
        url: me.actionUrl + '?Method=QryBdPackCost',
        method: "get",
        fitColumns: false,  //列少设为true,列多设为false
        fit: true,
        singleSelect: true,
        nowrap: false,  //折行
        border: false,
        rownumber: true,
        singleSelect: false,
        striped: true,
        idField: 'RowID',
        sortName: 'RowID',
        sortOrder: "asc",
        toolbar: "#UnChargeItemToolBar",
        rowStyler: function (index, row) {
            if (!row || !row.ItemStatus) return;
            return 'color:' + BD.ReqFormCostItemItemStatus[row.ItemStatus].Color + ';';
        },
        onBeforeLoad: function (param) {
            $('#dgPackCost').datagrid('clearChecked');
            if (!packDR) {
                return false;
            }
            param.packDRs = packDR;
            param.reqFormDR = me.CurrentReqFormDR;
            param.costType = "15";
        },
        onLoadSuccess: function (data) {
            if (data.total == 0) {
            }
            else {
                $("#dgPackCost tr[datagrid-row-index='0']").css({ "visibility": "visible" });
                $.each(data.rows, function (index, item) {
                    if (item.CostType == 15 || item.CostType == 20) {
                        $('#dgPackCost').datagrid('checkRow', index);
                    }
                });
            }
        },
        columns: [[
                  { field: 'RowID', title: '主键', checkbox: true, align: 'center', hidden: true },
                   {
                       field: 'AddDate', title: '创建时间', width: 140, sortable: true, align: 'center',
                       formatter: function (value, rowData, rowIndex) {
                           return value + " " + rowData.AddTime;
                       }
                   },
                  { field: 'CostItemName', title: '收费项目', width: 180, sortable: true, align: 'left' },
                  { field: 'Quantity', title: '数量', width: 40, sortable: true, align: 'center' },
                  { field: 'Price', title: '单价', width: 40, sortable: true, align: 'center' },
                  {
                      field: 'PriceNum', title: '总价', width: 60, sortable: true, align: 'center',
                      formatter: function (value, rowData, rowIndex) {
                          return rowData.Price * rowData.Quantity;
                      }
                  },
                  {
                      field: 'CostType', title: '费用类型', width: 80, sortable: true, align: 'center',
                      formatter: function (value, rowData, rowIndex) {
                          return GetReqFormCostItemCostType(value);
                      }
                  },
                  {
                      field: 'ItemStatus', title: '项目状态', width: 80, sortable: true, align: 'center',
                      formatter: function (value, rowData, rowIndex) {
                          if (!rowData || !rowData.ItemStatus) return;
                          return BD.ReqFormCostItemItemStatus[value].CName;
                      }
                  },
                  { field: 'AddUserName', title: '创建用户', width: 80, sortable: true, align: 'center' },
                  { field: 'ExecUserName', title: '执行用户', width: 80, sortable: true, align: 'center' },
                  {
                      field: 'ExecDate', title: '执行时间', width: 140, sortable: true, align: 'center',
                      formatter: function (value, rowData, rowIndex) {
                          return value + " " + rowData.ExecTime;
                      }
                  },
                   { field: 'CancelUserName', title: '取消用户', width: 80, sortable: true, align: 'center' },
                  {
                      field: 'CancelDate', title: '取消时间', width: 140, sortable: true, align: 'center',
                      formatter: function (value, rowData, rowIndex) {
                          return value + " " + rowData.CancelTime;
                      }
                  },
                  { field: 'HISOrderID', title: 'HISOrderID', width: 80, sortable: true, align: 'center' }
        ]]
    });
}

//退费
function UnCharge(checkUserDR) {
    var reason = $('#CancelIssueReason').val();
    //得到界面选中数据
    //var rows = $('#dgPackCost').datagrid("getChecked");
    var rows = $('#dgPackCost').datagrid("getData").rows;
    //判断数据
    if (!rows || rows.length < 1) {
        CancelIssueXMPlanDo(reason, checkUserDR);
        return;
    }
    var ReqCostIDs = "";
    //遍历组成医嘱串
    for (var i = 0; i < rows.length; i++) {
        var cost = rows[i];
        if (cost.ItemStatus == 30) {
            $.messager.alert('提示', "“" + cost.CostItemName + '”已经为退费状态，不能够重复退费！', 'info');
            return;
        }
        ReqCostIDs += cost.RowID + ",";
    }
    if (ReqCostIDs == "") {
        $.messager.alert('提示', '没有需要退费的血液！', 'info');
        return;
    }
    ReqCostIDs = ReqCostIDs.substring(0, ReqCostIDs.length - 1);
    $.ajax({
        type: "post",
        url: "../ashx/ashBdManualAccount.ashx" + '?Method=CancelHisCost',
        data: { ReqFormDR: me.CurrentReqFormDR, ReqCostIDs: ReqCostIDs },
        success: function (result) {
            if (result.IsOk) {
                CancelIssueXMPlanDo(reason, checkUserDR);
            }
            else {
                $.messager.confirm('提示', "退费取消失败，" + result.Message + ",是否继续取消发血操作?", function (r) {
                    if (r) {
                        CancelIssueXMPlanDo(reason, checkUserDR);
                    }
                });
            }
        }
    });
}

function CancelIssueXMPlanDo(reason, checkUserDR) {
    var params = {};
    var XMPlanDRs = [];
    var IssueRecordDRs = "";
    var rows = me.XMPlanGrid.datagrid("getChecked");
    for (var i = 0; i < rows.length; i++) {
        XMPlanDRs.push(rows[i].RowID);
        IssueRecordDRs += rows[i].IssueRecordDR+",";
    }
    if (IssueRecordDRs.length > 0) {
        IssueRecordDRs = IssueRecordDRs.substring(0, IssueRecordDRs.length - 1);
    }
    params.XMPlanDRs = JSON.stringify(XMPlanDRs);
    params.Reason = reason;
    params.checkUserDR = checkUserDR;
    params.IssueRecordDRs = IssueRecordDRs;
    var e = e || window.event;
    openLoading("btn_XMPlan_CancelIssuePack", e);
    $('#btn_XMPlan_CancelIssuePack').linkbutton('disable');
    $.ajax({
        url: me.actionUrl + '?Method=CancelIssueXMPlan',
        method: 'post',
        data: params,
        success: function (r) {
            if (r.IsOk) {
                showSlide(r.Message, 3000);
                ReloadXMPlanRows(rows);
                //UpdateRowsByCancelIssue(row);
                //关闭窗口
                $('#div_CancelIssueReason').dialog('close');
            } else {
                showError(r.Message);
            }
        },
        //在ajax发送之前禁止按钮，并且给出“正在处理”的提示
        
        //在ajax成功返回之后释放按钮，并且隐藏提示
        complete: function (XMLHttpRequest, textStatus) {
            closeLoading("btn_XMPlan_CancelIssuePack");
            //                    ChangeBtnStateByPlan(row);
            $('#btn_XMPlan_CancelIssuePack').linkbutton('enable');
        }
    });
}

function SaveCompositeBld() {
    showwin("#win_ManualAccount", "复检血型", "frmSaveBdRes.aspx?RegNo=" + me.RegNo + "&reqFormNo=" + me.ReqFormNo + "&reqFormDR=" + me.CurrentReqFormDR + "&Labno=" + (me.Labno == "" ? "-1" : me.Labno), 860, 460, true);
}

function loadPlanCostGrid() {
    $('#dgXMPlanCost').datagrid({
        method: "get",
        fitColumns: false,  //列少设为true,列多设为false
        fit: true,
        singleSelect: true,
        nowrap: false,  //折行
        border: false,
        rownumber: true,
        singleSelect: false,
        striped: true,
        idField: 'RowID',
        sortName: 'RowID',
        sortOrder: "asc",
        toolbar: "#UnXMPlanToolBar",
        rowStyler: function (index, row) {
            if (!row || !row.ItemStatus) return;
            return 'color:' + BD.ReqFormCostItemItemStatus[row.ItemStatus].Color + ';';
        },
        onLoadSuccess: function (data) {
            $("#dgXMPlanCost tr[datagrid-row-index='0']").css({ "visibility": "visible" });
            $.each(data.rows, function (index, item) {
                if (item.CostType == 10) {
                    $('#dgXMPlanCost').datagrid('checkRow', index);
                }
            });
        },
        columns: [[
                  { field: 'RowID', title: '主键', checkbox: true, align: 'center', hidden: true },
                   {
                       field: 'AddDate', title: '创建时间', width: 140, sortable: true, align: 'center',
                       formatter: function (value, rowData, rowIndex) {
                           return value + " " + rowData.AddTime;
                       }
                   },
                  { field: 'CostItemName', title: '收费项目', width: 180, sortable: true, align: 'left' },
                  { field: 'Quantity', title: '数量', width: 40, sortable: true, align: 'center' },
                  { field: 'Price', title: '单价', width: 40, sortable: true, align: 'center' },
                  {
                      field: 'PriceNum', title: '总价', width: 60, sortable: true, align: 'center',
                      formatter: function (value, rowData, rowIndex) {
                          return rowData.Price * rowData.Quantity;
                      }
                  },
                  {
                      field: 'CostType', title: '费用类型', width: 80, sortable: true, align: 'center',
                      formatter: function (value, rowData, rowIndex) {
                          return GetReqFormCostItemCostType(value);
                      }
                  },
                  {
                      field: 'ItemStatus', title: '项目状态', width: 80, sortable: true, align: 'center',
                      formatter: function (value, rowData, rowIndex) {
                          if (!rowData || !rowData.ItemStatus) return;
                          return BD.ReqFormCostItemItemStatus[value].CName;
                      }
                  },
                  { field: 'AddUserName', title: '创建用户', width: 80, sortable: true, align: 'center' },
                  { field: 'ExecUserName', title: '执行用户', width: 80, sortable: true, align: 'center' },
                  {
                      field: 'ExecDate', title: '执行时间', width: 140, sortable: true, align: 'center',
                      formatter: function (value, rowData, rowIndex) {
                          return value + " " + rowData.ExecTime;
                      }
                  },
                   { field: 'CancelUserName', title: '取消用户', width: 80, sortable: true, align: 'center' },
                  {
                      field: 'CancelDate', title: '取消时间', width: 140, sortable: true, align: 'center',
                      formatter: function (value, rowData, rowIndex) {
                          return value + " " + rowData.CancelTime;
                      }
                  },
                  { field: 'HISOrderID', title: 'HISOrderID', width: 80, sortable: true, align: 'center' }
        ]]
    });
}

function getPlanCheckCost(packDRs) {
    $('#dgXMPlanCost').datagrid({
        url: me.actionUrl + '?Method=QryBdPackCost',
        onBeforeLoad: function (param) {
            $('#dgXMPlanCost').datagrid('clearChecked');
            if (!packDRs) {
                return false;
            }
            param.packDRs = packDRs;
            param.reqFormDR = me.CurrentReqFormDR;
            param.costType = "10";
        }
    });
}

//手工计费
function showReqFormInfo(reqFormDR) {
    if (reqFormDR) {
        showwin("#div_ReqFormInfo", "申请单信息", "../../cts/form/frmQueryReqForm.aspx?ReqFormDR=" + reqFormDR, 900, 560, true);
    } else {
        showError("索引为空：reqFormDR:" + reqFormDR + "！");
    }
}
// 申请单追踪
function showReqFormTrace(ReqFormNo) {
    if (ReqFormNo) {
        showwin("#div_ReqFormInfo", "申请单追踪", "../form/frmReqFormTrace.aspx?ReqFormNo=" + ReqFormNo, 1200, 500, true);
    } else {
        showError("索引为空：ReqFormNo:" + ReqFormNo + "！");
    }
}

function QryPlanHistory() {
    if (me.CurrentReqFormDR != "-1") {
        var reqFormDto = GetObjectByID(me.ReqFormData.rows, me.CurrentReqFormDR);
        var SampleNo = reqFormDto.SampleNo;
        var currentPack = $('#currentPackDR').val();
        var rowData = me.XMPlanGrid.datagrid('getSelected');
        var rowid;
        if (rowData) {
            rowid = rowData.RowID;
        }
        else {
            rowid = xmplandr;
        }
        if (!currentPack) {
            showInfo("请扫描血袋或者选中配血计划！！");
            return;
        }
        showwin("#div_PlanHistory", "配血记录", "frmBdXMPlanHistory.aspx?ReqFormDR=" + me.CurrentReqFormDR + "&SampleNo=" + SampleNo + "&PackDR=" + currentPack + "&XMPlanDR=" + rowid, 960, 560, true);
    } else {
        showError("索引为空：reqFormDR:" + me.CurrentReqFormDR + "！");
    }
}


function StatPackCost(packDRs) {
    $('#dgStatPackCost').datagrid({
        url: me.actionUrl + '?Method=StatPackCost',
        fitColumns: false,  //列少设为true,列多设为false
        singleSelect: true,
        nowrap: false,  //折行
        border: false,
        singleSelect: true,
        striped: true,
        columns: [[
                  { field: 'CostItemName', title: '收费项目', width: 250, sortable: true, align: 'left' },
                  { field: 'Quantity', title: '数量', width: 50, sortable: true, align: 'center' },
                  { field: 'Price', title: '单价', width: 50, sortable: true, align: 'center' },
                  { field: 'Amount', title: '总价', width: 80, sortable: true, align: 'center' }
        ]],
        onBeforeLoad: function (param) {
            if (!packDRs) {
                return false;
            }
            param.packDRs = packDRs;
            param.ReqformDR = me.CurrentReqFormDR;
        }
    });
}

function SaveBdPackTestRes(packDR) {
    showwin("#win_ManualAccount", "血液复检", "../form/frmBdPackTestRes.aspx?packDR=" + packDR, 860, 460, true);
}

function QryPackMoreMatch(packDR) {
    $('#div_PackMoreMatch').dialog('open');
    $('#dg_PackMoreMatch').datagrid({
        url: me.actionUrl + '?Method=QryPackMoreMatch&PackDR=' + packDR,
    });
}
///血液追踪
function showpacktransWin(PackDR) {
    if (PackDR == "0000") {
        var PackDR = me.packcode;
        if (me.packcode == "") {
            alert("请先选择要查询的血袋！");

        } else {
            showwin("#win_packtranstry", "血液追踪", "frmPacktranstry.aspx?PackDR=" + PackDR, 800, 600, true);
        }
    } else {
        showwin("#win_packtranstry", "血液追踪", "frmPacktranstry.aspx?PackDR=" + PackDR, 800, 600, true);
    }
}
///显示工作列表
function ShowHistoryTestSet(RegNo) {
    $('#dg_HistoryTestSet').datagrid({
        url: me.actionUrlReportQuery + '?Method=QueryReportList&RegNo=' + RegNo,
        iconCls: 'icon-save',
        method: 'get',
        fit: true,
        fitColumns: false,
        idField: 'ReportDR',
        pagination: true,
        nowrap: true,
        pageSize: 20,
        pageList: [20, 50, 100, 200],
        singleSelect: true,
        checkOnSelect: false,
        selectOnCheck: false,
        rownumbers: false,
        remoteSort: false,
        border: false,
        columns: [[
                    { field: 'StatusDesc', title: '状态', sortable: true, width: 38, align: 'left' },
                    { field: 'AuthDate', title: '审核日期', sortable: true, width: 90, align: 'left' },
                    { field: 'AuthTime', title: '审核时间', sortable: true, width: 60, align: 'left' },
                    { field: 'TestSetDesc', title: '医嘱名称', sortable: true, width: 150, align: 'left', formatter: ReportIconPrompt },
                    { field: 'WorkGroupMachine', title: '工作小组', sortable: true, width: 90, align: 'left' },
                    { field: 'EpisodeNo', title: '流水号', sortable: true, sorter: GridColSorter, width: 50, align: 'left' },
                    { field: 'Labno', title: '检验号', sortable: true, sorter: GridColSorter, width: 60, align: 'left' },
                    { field: 'ResultPrompt', title: '结果', sortable: true, width: 40, align: 'center', formatter: ResultIconPrompt },
                    { field: 'RegNo', title: '登记号', sortable: true, width: 90, align: 'left' },
                    { field: 'RecordNo', title: '病案号', sortable: true, width: 90, align: 'left' },
                    { field: 'PatName', title: '病人姓名', sortable: true, width: 60, align: 'left' },
                    { field: 'PatSex', title: '性别', sortable: true, width: 50, align: 'left' },
                    { field: 'PatAge', title: '年龄', sortable: true, width: 50, align: 'left' },
                    {
                        field: 'Printed', title: '打印', sortable: true, width: 50, align: 'left',
                        formatter: function (value) {
                            if (value == "1") {
                                return "已打印"
                            }
                        }
                    },
                    { field: 'AdmType', title: '类型', sortable: true, width: 50, align: 'left' },
                    { field: 'Location', title: '科室', sortable: true, width: 50, align: 'left' },
                    { field: 'AcceptDate', title: '核收日期', sortable: true, width: 90, align: 'left' },
                    { field: 'AcceptTime', title: '核收时间', sortable: true, width: 90, align: 'left' },
                    { field: 'ReceiveDate', title: '接收日期', sortable: true, width: 90, align: 'left' },
                    { field: 'ReceiveTime', title: '接收时间', sortable: true, width: 90, align: 'left' },
                    { field: 'CollectDate', title: '采集日期', sortable: true, width: 90, align: 'left' },
                    { field: 'CollectTime', title: '采集时间', sortable: true, width: 90, align: 'left' },
                    { field: 'ReportDR', title: 'ReportDR', hidden: true, width: 50, align: 'left' }
        ]],
        onLoadSuccess: function (data) {
            $('#dg_HistoryTestSet').datagrid('clearSelections');   ///清除选择
            if ($('#dgReportItem').css("display") == "none") $('#dgReportItem').datagrid('loadData', { total: 0, rows: [] });
        },
        rowStyler: function (index, rowData) {
            ///结果标记
            if (rowData.Status == "1") {
                return "color:#00CCFF;"
            }
            //初审
            if (rowData.Status == "2") {
                return "color:green;"
            }
            //审核
            //if (rowData.Status == "3") {
            //    return "color:blue;"
            //}
            //取消
            if (rowData.Status == "5") {
                return "color:red;"
            }
            if (rowData.ColStyler != "") {
                return rowData.ColStyler;
            }
        }, onSelect: function (rowIndex, rowData) {
            if (rowData.ReportDR.length > 0) {
                ShowReportResultInfo(rowData.ReportDR);
            }

        }
    });
    var pager = $('#dg_HistoryTestSet').datagrid('getPager');
    pager.pagination({
        pageSize: 20,
        links: 6,
        layout: ['', 'sep', 'first', '', '', 'links', 'last', '', '', 'sep', '', 'info'],
        beforePageText: "",
        afterPageText: "",
        displayMsg: '当前 {from} - {to} 条 共 {total} 条',
        showPageList: false,
    });
}; ///ShowHistroyTestSet

///显示报告项目
function ShowReportResultInfo(ReportDR) {
    $('#dgReportItem').datagrid({
        url: me.actionUrlVisitNumberReport + '?Method=QryTSInfoA&ReportDR=' + ReportDR,
        iconCls: 'icon-save',
        method: 'get',
        fit: true,
        fitColumns: false,
        pagination: false,
        singleSelect: true,
        rownumbers: true,
        border: true,
        columns: [[
            { field: 'TestCodeDR', title: 'TestCodeDR', hidden: true, width: 50, align: 'left' },
            { field: 'Sequence', title: 'Sequence', hidden: true, width: 50, align: 'left' },
            { field: 'ResultFormat', title: 'ResultFormat', hidden: true, width: 20, align: 'left' },
            { field: 'Synonym', title: '缩写', width: 55, align: 'left' },
            { field: 'CName', title: '项目名称', width: 140, align: 'left' },
            {
                field: 'TextRes', title: '结果', width: 80, align: 'right',
                styler: function (value, rowData, rowIndex) {
                    var colStyle = "";
                    if (rowData.AbFlag == "L") { colStyle = 'background-color:#E0ECFF;color:blue;' };
                    if (rowData.AbFlag == "H") { colStyle = 'background-color:#E0ECFF;color:red;' };
                    if (rowData.AbFlag == "A") { colStyle = 'background-color:#E0ECFF;color:red;' };
                    if (rowData.AbFlag == "S") { colStyle = 'background-color:red;color:#ffee00;' };
                    if (rowData.AbFlag == "PL") { colStyle = 'background-color:red;color:blue;' };
                    if (rowData.AbFlag == "PH") { colStyle = 'background-color:red;color:#ffee00;' };
                    if (rowData.AbFlag == "UL") { colStyle = 'background-color:red;color:blue;' };
                    if (rowData.AbFlag == "UH") { colStyle = 'background-color:red;color:#ffee00;' };
                    colStyle = "font-weight: bold;" + colStyle;
                    return colStyle;
                }
            },
            { field: 'Result', title: '结果ID', hidden: true, width: 30, align: 'left' },
            { field: 'ExtraRes', title: '扩展结果', hidden: true, width: 100, align: 'left' },
            { field: 'OtherRes', title: '其它结果', hidden: true, width: 100, align: 'left' },
            { field: 'AbFlag', title: '提示', width: 30, align: 'center' },
            { field: 'Units', title: '单位', width: 55, align: 'center' },
            { field: 'RefRanges', title: '参考范围', width: 90, align: 'center' },
            {
                field: 'PreResult', title: '前次结果', width: 70, align: 'right', formatter: HistoryIconPrompt,
                styler: function (value, rowData, rowIndex) {
                    var colStyle = "";
                    if (rowData.PreAbFlag == "L") { colStyle = 'background-color:#E0ECFF;color:blue;' };
                    if (rowData.PreAbFlag == "H") { colStyle = 'background-color:#E0ECFF;color:red;' };
                    if (rowData.PreAbFlag == "A") { colStyle = 'background-color:#E0ECFF;color:red;' };
                    if (rowData.PreAbFlag == "S") { colStyle = 'background-color:red;color:#ffee00;' };
                    if (rowData.PreAbFlag == "PL") { colStyle = 'background-color:red;color:blue;' };
                    if (rowData.PreAbFlag == "PH") { colStyle = 'background-color:red;color:#ffee00;' };
                    if (rowData.PreAbFlag == "UL") { colStyle = 'background-color:red;color:blue;' };
                    if (rowData.PreAbFlag == "UH") { colStyle = 'background-color:red;color:#ffee00;' };
                    return colStyle;
                }
            },
            { field: 'ReAssayNumber', title: '复查号', width: 50, align: 'center' },
            { field: 'MachineParameterDesc', title: '检验仪器', width: 100, align: 'center' },
            { field: 'ResNoes', title: '结果说明', hidden: true, width: 100, align: 'left' }
        ]],
        onLoadSuccess: function (data) {
            if (data.total > 0) {
                $(this).datagrid("clearSelections");
            }
        }
    });
};

///工作列表图标
function ReportIconPrompt(value, rowData, rowIndex) {
    var a = [];
    if (rowData.InfectFlag == "1") {
        a.push("<a style='text-decoration:none;' href=\"javascript:void(ShowUrgentInfo('", rowData.InfectAlert, "'));\"><span class='icon-bug_delete' title='传染病警告：" + rowData.InfectAlert + "'>&nbsp;&nbsp;&nbsp;&nbsp;</span></a>&nbsp;");
    }
    if (rowData.Urgent == "1") {
        a.push("<a style='text-decoration:none;' href=\"javascript:void(ShowUrgentInfo('", rowData.ReportDR, "'));\"><span class='icon-urgent'  title='加急'>&nbsp;&nbsp;&nbsp;&nbsp;</span></a>&nbsp;");
    }
    if (rowData.IsPanic == "1") {
        a.push("<span   title='危急值'><img src='../../resource/easyui/themes/icons/Panic1.png' /></span>&nbsp;");
    }
    else if (rowData.IsPanic == "2") { //已处理危急值图标，待定
        a.push("<span   title='危急值'><img src='../../resource/easyui/themes/icons/Panicblue.png' /></span>&nbsp;");
    }
    if (rowData.IsUnAccept == "1") {
        a.push("<span   title='荒诞值'><img src='../../resource/easyui/themes/icons/Unaccept2.png' /></span>&nbsp;");
    }
    if (rowData.SplitStatus == "1") {
        a.push("<span  title='已拆分'><img src='../../resource/easyui/themes/icons/SplitStatus.png' /></span>&nbsp;");
    }
    if (rowData.SplitStatus == "2") {
        a.push("<span  title='已拆分'><img src='../../resource/easyui/themes/icons/SplitStatus.png' /></span>&nbsp;");
    }
    a.push("<span title=" + value + ">" + value + "</span>");
    return a.join("");
}

///结果标记提示
function ResultIconPrompt(value, rowData, rowIndex) {
    var a = [];
    if (rowData.Status == "3") {
        a.push("<a style='text-decoration:none;' href=\"javascript:void(ReportView('", rowData.ReportDR, "'));\"><span class='icon-doctorreportresults'  title='检验报告浏览'>&nbsp;&nbsp;&nbsp;&nbsp;</span></a>&nbsp;");
    }
    return a.join("");
}

//报告浏览
function ReportView(ReportDR) {
    showwin("#win_ReportResultView", "检验报告", "../../sample/form/frmReportResultView.aspx?ReportDR=" + ReportDR, 900, 530, true);
}
function ShowUrgentInfo(id) {
    // alert(id);
    //showwin("#win", "详细信息", "../Dispatch/UIDispatchTaskDetail.aspx?dtid=" + id1 + "&rrid=" + id2, 830, 400);
}
///历史结果图标
function HistoryIconPrompt(value, rowData, rowIndex) {
    var a = [];
    if (value != null && value != "") {
        value = ' <span  title="' + value.split("^")[3] + '">' + value.split("^")[0] + "<span />";
        a.push(value + "&nbsp;<a style='text-decoration:none;' href=\"javascript:void(ShowHistoryResult(", rowData.TestCodeDR, "," + rowData.Precision + "));\"><span class='icon-chart_curve' title='结果曲线图'>&nbsp;&nbsp;&nbsp;&nbsp;</span></a>&nbsp;");
    }
    return a.join("");
}

///结果曲线图
function ShowHistoryResult(TestCodeDR, Precision, Multiple) {
    var ReportDR = $('#dg_HistoryTestSet').datagrid('getSelected').ReportDR;
    if (Multiple == undefined) {
        $('#win_ResultCharts').window('open');
    }
    if (Multiple == undefined) Multiple = 1;//默认参考范围展示
    
    if (ReportDR.length == 0) { return; };

    $('#h_ResultCharts').text("结果曲线图");
    var t = $(this);
    if (this.timer) {
        clearTimeout(this.timer);
    }
    this.timer = setTimeout(function () {
        $.ajax({
            url: '../../lis/ashx/ashReportQuery.ashx?Method=QueryHistoryReportList&ReportDR=' + ReportDR + '&TestCodeDR=' + TestCodeDR,
            error: function (data) {

            },
            success: function (data) {
                if (!FilterBackData(data)) {
                    return;
                }
                if (typeof (data) != "undefined") {
                    var rowData = data.rows[0];
                    var row = data.dataHead[0];
                    var xAxisArr = new Array();
                    var GridDate = new Array();
                    var GridResult = new Array();
                    $.each(row, function (i, v) {
                        if (i.indexOf("Col") >= 0) {
                            //如果非数值类型的
                            if (rowData["ResultFormat"] != "N") {
                                //组合datagrid数据
                                GridDate.push(v);
                            } else {
                                xAxisArr.push(v.split(' ')[0]); //图形显示的x轴
                            }
                        }
                    });
                    var lineData = new Array();
                    var max = '';
                    var min = '';
                    $.each(rowData, function (i, v) {
                        if (i.indexOf("Col") >= 0) {
                            //判断是否为数值型的(N)
                            if (rowData["ResultFormat"] != "N") {
                                //不是数值类型的表格显示
                                GridResult.push(v);
                            } else {
                                lineData.push(parseFloat(v.replace(/<?>?/g, "")));
                            }
                        }
                        if (i == 'RefRanges1' && v.length > 0) {
                            max = parseFloat(v.split('-')[1]);
                            min = parseFloat(v.split('-')[0]);
                        }
                    });
                    //载入表格数据
                    if (rowData["ResultFormat"] != "N") {
                        var DatagridData = new Array();
                        for (var i = 0; i < GridDate.length; i++) {
                            var row = {};
                            row["Date"] = GridDate[i];
                            row["Result"] = GridResult[i];
                            DatagridData.push(row);
                        }
                        $("#div_ResultCharts").html("<table id='dg_historyResultList'></table>");
                        $("#dg_historyResultList").datagrid({
                            fit: true,
                            fitColumns: true,
                            columns: [[
                                { field: 'Date', title: '时间', width: 100, align: "center" },
                                { field: 'Result', title: '结果', width: 300, align: "center" },
                            ]]
                        });
                        $("#dg_historyResultList").datagrid("loadData", DatagridData)
                        return;
                    }
                    if ($("#dg_historyResultList").length > 0) {
                        $("#div_ResultCharts").empty();
                    }
                    var unit = rowData.Units;
                    var legenData = [rowData.TestCodeName];
                    if (lineData.length == 0) return;
                    $("#div_ResultCharts").removeAttr("_echarts_instance_");//释放上一次echarts图形
                    if (Multiple == "2") {
                        Multiple = true;
                    }
                    else {
                        Multiple = false;
                    }
                    lineCharts('div_ResultCharts', rowData.TestCodeName, unit, xAxisArr, lineData, legenData, max, min, Precision, Multiple);
                }
            }
        });
    }, 0);
}

function UpdatePackBGCheckInfo() {
    var rows = me.PackGrid.datagrid('getChecked');
    var packs = [];
    var checkids = ""; //可审核的血袋ids
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (row.IsBGChecked != "1") {
            var item = {};
            item.RowID = row.RowID;
            packs.push(item);
            checkids += row.RowID + "@";
        }
    }
    
    if (checkids == "") {
        showInfo("请勾选需要审核的血液！");
        return;
    }
    checkids = checkids.substring(0, checkids.length - 1);
    var params = {};
    //params.packs = JSON.stringify(packs);
    params.packDRs = checkids;
    var e = e || window.event;
    openLoading("btn_XMPlan_save", e);
    $('#btn_XMPlan_save').linkbutton('disable');
    $.ajax({
        url: me.actionUrl + '?Method=UpdatePackBGCheckInfo',
        method: 'post',
        data: params,
        success: function (r) {
            if (r.IsOk) {
                for (var i = 0; i < rows.length; i++) {
                    var rowData = rows[i];
                    var rowIndex = me.PackGrid.datagrid('getRowIndex', rowData);
                    rowData.IsBGChecked = "1";
                    me.PackGrid.datagrid('updateRow', { index: rowIndex, row: rowData });
                }
                //showSlide(r.Message);  
            } else {
                showError(r.Message);
            }
        },
        //在ajax发送之前禁止按钮，并且给出“正在处理”的提示
       
        //在ajax成功返回之后释放按钮，并且隐藏提示
        complete: function (XMLHttpRequest, textStatus) {
            $('#btn_XMPlan_save').linkbutton('enable');
            closeLoading("btn_XMPlan_save");
            // ChangeBtnStateByPlan(row);
        }
    });
}
function OpenReqFormSampleNoWin() {
    LoadPatVisitnum();
    $('#divReqFormVisit').window('open');
}

function LoadPatVisitnum() {
    $('#com_PatVisitNum').combogrid({
        url: me.actionUrl + '?Method=QryPatVisitNum',
        method: 'post',
        idField: 'VisitNumber',
        textField: 'VisitNumber',
        fitColumns: true,
        panelWidth: 280,
        fit: true,
        remoteSort: false,
        singleSelect: false,
        nowrap: false,  //折行
        border: false,
        columns: [[///血袋条码,血制品条码,血液产品,血量,血型组,有效日期, 
                    { field: 'VisitNumber', title: '检验号', width: 100, sortable: true, align: 'center' },
                    { field: 'ReceiveDate', title: '接收日期', width: 100, sortable: true, align: 'center' },
                    { field: 'ReceiveTime', title: '接收时间', width: 70, sortable: true, align: 'center' }

        ]],
        onBeforeLoad: function (param) {
            param.RegNo = me.RegNo;
        }
    });
}
function UpdateReqFormSampleNo() {
    var reqform = {};
    reqform.RowID = me.CurrentReqFormDR;
    reqform.UseSampleNo = $('#com_PatVisitNum').combogrid('getValue');
    var selectedRow = $('#com_PatVisitNum').combogrid('grid').datagrid('getSelected');
    if (!selectedRow) {
        return;
    }
    //patient.RequestDate+" "+ patient.RequestTime+ " <br>审核时间："+patient.AuthDate+" "+patient.AuthTime
    reqform.CollectDate = selectedRow.CollectDate;
    reqform.CollectTime = selectedRow.CollectTime;
    reqform.AuthDate = selectedRow.AuthDate;
    reqform.AuthTime = selectedRow.AuthTime;
    $.ajax({
        type: 'POST',
        url: me.actionUrl + '?Method=UpdateReqFormSampleNo',
        data: {
            reqform: JSON.stringify(reqform)
        },
        cache: false,
        async: false,   ///异步执行
        success: function (returnData) {
            if (returnData) {
                if (returnData.IsOk) {
                    $('#ReqFormVisitNum').html(reqform.UseSampleNo);
                    $('#VisitNumTimeInfo').html("采集时间：" + reqform.CollectDate + " " + reqform.CollectTime + " <br>接收时间：" + reqform.VReceiveDate + " " + reqform.VReceiveTime);
                    var reqFormDto = GetObjectByID(me.ReqFormData.rows, me.CurrentReqFormDR);
                    reqFormDto.UseSampleNo = reqform.UseSampleNo;
                    reqFormDto.CollectDate = reqform.CollectDate;
                    reqFormDto.CollectTime = reqform.CollectTime;
                    reqFormDto.AuthDate = reqform.AuthDate;
                    reqFormDto.AuthTime = reqform.AuthTime;
                    UpdateRow(me.ReqFormGrid, reqFormDto.RowID, reqFormDto);
                    $('#divReqFormVisit').window('close');
                }
                else {
                    showSlide(returnData.Message, 3000);
                }
            }
        }
    });
}

//快速查询选择
function mnuFindFastClick(value, icon, name) {
    me.queryType = value;
    $('#mnu_FindFast').menubutton({ menu: '#mnu_FindFastType', iconCls: icon, text: name });
    $('#txt_FindFast').focus();
    $('#txt_FindFast').select();
}

function SavePackSpecimen() {
    var row = me.PackGrid.datagrid('getSelected');
    if (!row) {
        showInfo("请选择需要关联血标本的血液！");
        return;
    }
    var params = {};
    params.packDR = row.RowID;
    params.specimenNo = $('#SpecimenNo').val();
    $.ajax({
        url: me.actionUrl + '?Method=QryPackSpcimen',
        method: 'post',
        data: params,
        success: function (res) {
            if (res.IsOk) {
                SavePackSpecimenDo(params);
            }
            else {
                if (me.IsMultiPackSpcimen == "N") {
                    showError(res.Message);
                }
                else {
                    $.messager.confirm('提示信息', res.Message + ",是否继续？", function (isClickedOk) {
                        if (!isClickedOk) {
                            return;
                        }
                        SavePackSpecimenDo();
                    });
                }
            }
        }
    });
}

function SavePackSpecimenDo(params) {
    $.ajax({
        url: me.actionUrl + '?Method=SavePackSpcimen',
        method: 'post',
        data: params,
        success: function (r) {
            if (r.IsOk) {
                me.PackGrid.datagrid('reload');
            } else {
                showError(r.Message);
            }
        }
    });
}

function OpenCreatePlanWin() {
    $('#div_CreatePlan').dialog('open');
}


//根据血袋条码，加载血袋信息
function QueryPlanPackByPackBarcodeDo(PackBarcode, ProductBarCode) {
    if (me.CurrentReqFormDR == "-1") {
        showInfo("请选择病人申请单");
        return;
    }
    var param = {};
    param.ReqFormDR = me.CurrentReqFormDR;
    if (!param.ReqFormDR || param.ReqFormDR < 1) {
        return false;
    }
    var reqFormDto = GetObjectByID(me.ReqFormData.rows, me.CurrentReqFormDR);
    var products = reqFormDto.ReqProductInfo.split('^');
    param.RegNo = reqFormDto.RegNo;
    param.ReqProductDRs = [];
    param.ReqVolumns = [];
    for (var i = 0; i < products.length; i++) {
        param.ReqProductDRs.push(products[i].split('@')[0]);
        param.ReqVolumns.push(products[i].split('@')[6]);
    }
    param.BloodGroupDR = me.CompositeBloodGroup.RowID;
    param.LisBloodGroupDR = me.PatientBloodGroup.RowID;
    ///根据当前的CurrentReqFormDR获取当前的ReqForm的相关信息
    $.each($('input:radio[name=PlanXMType]'), function (i, e) {
        if (e.checked) {
            param.XMType = $(e).val();
        }
    });
    param.packBarCode = $('#txt_PackID').val();
    param.ProductBarCode = GetProductBarCode($('#txt_ProductBarCode').val());
    var e = e || window.event;
    openLoading("txt_PackID", e);
    $('#btn_XMPlan_Add').linkbutton('disable');

    $.ajax({
        url: me.actionUrl + '?Method=QueryPack',
        method: 'post',
        data: param,
        success: function (r) {
            if (r.total && r.total >= 1) {
                if (r.total == 1) {
                    //取消配血计划的选中  
                    var pack = r.rows[0];
                    var planrows = me.XMPlanGrid.datagrid('getRows');
                    for (var i = 0; i < planrows.length; i++) {
                        if (planrows[i].PackDR == pack.RowID) {
                            $('#txt_PackID').select();
                            me.XMPlanGrid.datagrid('selectRow', i);
                            return;
                        }
                    }
                    var packs = $('#dgMachineXMPlan').datagrid('getRows');
                    for (var i = 0; i < packs.length; i++) {
                        if (pack.RowID == packs[i].RowID) {
                            $('#txt_PackID').select();
                            $('#dgMachineXMPlan').datagrid('selectRow', i);
                            return;
                        }
                    }
                    pack.SampleNo = $('#ReqFormVisitNum').html();
                    pack.UploadMachineParameterDR = $('#com_UploadMachineParameter').combobox('getValue');
                    if (pack.SampleNo == "") {
                        showError("受血者标本号不能为空！！");
                        return;
                    }
                    if (pack.UploadMachineParameterDR == "") {
                        showError("上传仪器不能为空！！");
                        return;
                    }
                    $('#dgMachineXMPlan').datagrid('insertRow', {
                        index: 0, // 索引从0开始
                        row: pack
                    });
                    $('#txt_PackID').val('');
                    $('#txt_ProductBarCode').val('');

                } else if (r.total > 1) {
                    ///弹出血袋查询框
                    $('#packinfo_window').window('open');
                    var packs = [];
                    for (var i = 0; i < r.total; i++) {
                        packs.push(r.rows[i]);
                    }
                    $('#dgPackDetails').datagrid('loadData', packs);
                }
            } else {
                ///弹出血袋查询框
                //QueryPack(true);
                showError("未找到血液信息！！");
            }
        },
        //在ajax发送之前禁止按钮，并且给出“正在处理”的提示
       
        //在ajax成功返回之后释放按钮，并且隐藏提示
        complete: function (XMLHttpRequest, textStatus) {
            closeLoading("txt_PackID");
            $('#btn_XMPlan_Add').linkbutton('enable');
        }
    });
}

function AddPackInfo() {
    var pack = $('#dgPackDetails').datagrid('getSelected');
    var packs = $('#dgMachineXMPlan').datagrid('getRows');
    for (var i = 0; i < packs.length; i++) {
        if (pack.RowID == packs[i].RowID) {
            $('#dgMachineXMPlan').datagrid('selectRow', i);
            return;
        }
    }
    var planrows = me.XMPlanGrid.datagrid('getRows');
    for (var i = 0; i < planrows.length; i++) {
        if (planrows[i].PackDR == pack.RowID) {
            me.XMPlanGrid.datagrid('selectRow', i);
            return;
        }
    }
    pack.SampleNo = $('#ReqFormVisitNum').html();
    pack.UploadMachineParameterDR = $('#com_UploadMachineParameter').combobox('getValue');
    if (pack.SampleNo == "") {
        showError("受血者标本号不能为空！！");
        return;
    }
    if (pack.UploadMachineParameterDR == "") {
        showError("上传仪器不能为空！！");
        return;
    }
    $('#dgMachineXMPlan').datagrid('insertRow', {
        index: 0, // 索引从0开始
        row: pack
    });
    $('#txt_PackID').val('');
    $('#txt_ProductBarCode').val('');
}



function LoadUploadMachineParameter() {
    var BTMIPlanMachineParameter = ObjClone(me.BTMIMachineParameter);
    $('#com_UploadMachineParameter').combobox({
        width: 120,
        data: BTMIPlanMachineParameter,
        valueField: 'RowID',
        textField: 'CName',
        panelHeight: 'auto',
        editable: true
    });
}


function LoadReUploadMachineParameter() {
    var BTMIPlanMachineParameter = ObjClone(me.BTMIMachineParameter);
    $('#com_MachineXMParameter').combobox({
        width: 120,
        data: BTMIPlanMachineParameter,
        valueField: 'RowID',
        textField: 'CName',
        panelHeight: 'auto',
        editable: true
    });
}

function SaveXMPlanList() {
    var params = {};
    params.plans = [];
    //var plans=[];
    var rows = $('#dgMachineXMPlan').datagrid('getRows');
    if (rows.length < 1) {
        showInfo("请选择配血血液");
        return;
    }
    for (var i = 0; i < rows.length; i++) {
        var plan = {};
        plan.ReqFormDR = me.CurrentReqFormDR;
        plan.PackDR = rows[i].RowID;
        plan.SampleNo = rows[i].SampleNo;
        plan.PackBarcode = rows[i].PackID;
        //plan.UploadMachineParameterDR=rows[i].UploadMachineParameterDR;
        plan.CheckBloodGroupRes = me.CompositeBloodGroup.CName;
        plan.AntibodyScreenRes = $('#patientBloodSAS').html();
        params.plans.push(plan);

    }
    params.plans = JSON.stringify(params.plans);
    var e = e || window.event;
    openLoading("btn_XMPlan_Add", e);
    $('#btn_XMPlan_Add').linkbutton('disable');
    $.ajax({
        url: me.actionUrl + '?Method=SaveXMPlanList',
        type: 'post',
        data: params,
        success: function (r) {
            if (r.IsOk) {
                showSlide(r.Message, 3000);
                $('#dgMachineXMPlan').datagrid('loadData', []);
                $('#div_CreatePlan').dialog('close');
                RefreshXMPlan();
            } else {
                showError(r.Message);
            }
        },
        //在ajax发送之前禁止按钮，并且给出“正在处理”的提示
     
        //在ajax成功返回之后释放按钮，并且隐藏提示
        complete: function (XMLHttpRequest, textStatus) {
            closeLoading("btn_XMPlan_Add");
            $('#btn_XMPlan_Add').linkbutton('enable');
        }
    });
}

function DelPlan() {
    var row = $('#dgMachineXMPlan').datagrid('getSelected');
    var index = $('#dgMachineXMPlan').datagrid('getRowIndex', row);
    $('#dgMachineXMPlan').datagrid('deleteRow', index);
}

function ViewEMR(admNo) {
    $.ajax({
        url: me.actionUrlVisitNumberReport + '?Method=GetEMRUrl&LabNo=&admNo=' + admNo,
        dataType: "text", //text, json, xml
        success: function (retData) {
            if (retData.length > 0) {
               // var Param = "IEView@" + retData;
			
                var Param = "StartConfEXE@EMRViewExePath@" + retData;                
                LISBasePrint(Param);
            } else {
                showInfo("无电子病历信息！");
            }
        }
    })
}
function SaveBDPatDiscrepancyLog(Isdiscrepancy) {
    $.ajax({
        url: me.actionUrl + '?Method=SaveBDPatDiscrepancyLog&Isdiscrepancy=' + Isdiscrepancy + '&RegNo=' + me.RegNo,
        dataType: "json", //text, json, xml
        success: function (retData) {
            if (retData.IsOk) {
                if (Isdiscrepancy == "1") {
                    $('#td_Isdiscrepancy').html("是&nbsp;&nbsp;&nbsp;&nbsp;" + getIconHtml("非", "", "", "SaveBDPatDiscrepancyLog(0)", "非疑难配血"));

                }
                else {
                    $('#td_Isdiscrepancy').html("否&nbsp;&nbsp;&nbsp;&nbsp;" + getIconHtml("疑", "", "", "SaveBDPatDiscrepancyLog(1)", "疑难配血"));
                }
                UpdateReqFormDiscrepancy(Isdiscrepancy);
                showSlide("保存疑难配血成功", 3000);
            } else {
                showInfo("保存疑难配血失败！");
            }
        }
    })

}


//配血计划已发血
//申请单已发血
function UpdateReqFormDiscrepancy(Isdiscrepancy) {
    //申请单已发血
    var Req_rows = me.ReqFormGrid.datagrid('getRows');
    var discrepancy = "";
    if (Isdiscrepancy == "1") {
        discrepancy = "是";
    }
    else {
        discrepancy = "否";
    }
    for (var i = 0; i < Req_rows.length; i++) {
        var req = Req_rows[i];
        if (req.RegNo == me.RegNo) {
            req.discrepancy = discrepancy;
            req.Isdiscrepancy = Isdiscrepancy;
            me.ReqFormGrid.datagrid('updateRow', { index: i, row: req });
        }

    }
}


function ReSaveXMPlanList() {
    var params = {};
    var rows = me.XMPlanGrid.datagrid("getChecked");
    var machinexms = [];
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (row.StatusStock == "10") {
            var machinexm = {};
            machinexm.ReqFormDR = me.CurrentReqFormDR;
            machinexm.SampleNo = $('#ReqFormVisitNum').html();
            machinexm.PackDR = row.PackDR;
            machinexm.MachineParameterDR = $('#com_MachineXMParameter').combobox('getValue');
            machinexms.push(machinexm);
        }
    }
    if (machinexms.length < 1) {
        showError("没有需要重新上传仪器的血液");
        return;
    }
    params.machinexms = JSON.stringify(machinexms);
    var e = e || window.event;
    openLoading("btn_XMTest_Save", e);
    $('#btn_XMTest_Save').linkbutton('disable');
    $.ajax({
        url: me.actionUrl + '?Method=ReSaveXMPlan',
        method: 'post',
        data: params,
        success: function (r) {
            if (r.IsOk) {
                showSlide(r.Message, 3000);
                $('#div_ReMachineXM').dialog('close');
            } else {
                showError(r.Message);
            }
        },
       
        //在ajax成功返回之后释放按钮，并且隐藏提示
        complete: function (XMLHttpRequest, textStatus) {
            closeLoading("btn_XMTest_Save");
            $('#btn_XMTest_Save').linkbutton('enable');
        }
    });
}

function OpenReUploadMachine() {
    $('#div_ReMachineXM').dialog('open');
}

//库存页面创建仪器配血计划
function PackStockSaveXMPlan() {
    var params = {};
    params.plans = [];
    params.machinexms = [];
    //var plans=[];
    var rows = me.PackGrid.datagrid('getChecked');
    if (rows.length < 1) {
        showInfo("请选择配血血液");
        return;
    }
    if ($('#com_BTMIMachineParameter_pack').combobox('getValue') == "") {
        showInfo("请选择配血仪器");
        return;
    }
    if ($('#ReqFormVisitNum').html() == "") {
        showInfo("病人标本号不能为空！");
        return;
    }
    for (var i = 0; i < rows.length; i++) {
        if (rows[i].IsXMatchProduct == "0") {
            showInfo("血液[" + rows[i].PackID + "]不需要进行交叉配血");
            return;
        }
        if (rows[i].SpecimenNo1 == "") {
            showInfo("血液[" + rows[i].PackID + "]没有进行血标本关联");
            return;
        }
        var plan = {};
        plan.ReqFormDR = me.CurrentReqFormDR;
        plan.PackDR = rows[i].RowID;
        plan.SampleNo = $('#ReqFormVisitNum').html();
        plan.PackBarcode = rows[i].PackID;
        //plan.UploadMachineParameterDR=$('#com_BTMIMachineParameter_pack').combobox('getValue');
        plan.CheckBloodGroupRes = me.CompositeBloodGroup.CName;
        plan.AntibodyScreenRes = $('#patientBloodSAS').html();
        params.plans.push(plan);
        var machinexm = {};
        machinexm.MachineParameterDR = $('#com_BTMIMachineParameter_pack').combobox('getValue');
        machinexm.PackDR = rows[i].RowID;
        machinexm.ReqFormDR = me.CurrentReqFormDR;
        machinexm.SampleNo = $('#ReqFormVisitNum').html();
        machinexm.SpecimenNo = rows[i].SpecimenNo1;
        params.machinexms.push(machinexm);
    }
    params.plans = JSON.stringify(params.plans);
    params.machinexms = JSON.stringify(params.machinexms);
    var e = e || window.event;
    openLoading("btn_MachineXMPlan_Save", e);
    $('#btn_MachineXMPlan_Save').linkbutton('disable');
    $.ajax({
        url: me.actionUrl + '?Method=SaveXMPlanList',
        method: 'post',
        data: params,
        success: function (r) {
            if (r.IsOk) {
                showSlide(r.Message, 3000);
                //取消选定
                me.PackGrid.datagrid('clearChecked');
                $('#div_CreatePlan').dialog('close');
                RefreshXMPlan();
            } else {
                showError(r.Message);
            }
        },
        //在ajax发送之前禁止按钮，并且给出“正在处理”的提示
     
        //在ajax成功返回之后释放按钮，并且隐藏提示
        complete: function (XMLHttpRequest, textStatus) {
            closeLoading("btn_MachineXMPlan_Save");
            $('#btn_MachineXMPlan_Save').linkbutton('enable');
        }
    });
}


function PrintPositionInfo() {

    var rows = me.XMPlanGrid.datagrid('getChecked');
    if (rows.length < 1) {
        showInfo("请选择打印血液信息");
        return;
    }
    var xmplandrs = "";
    for (var i = 0; i < rows.length; i++) {
        xmplandrs = xmplandrs + rows[i].RowID + "@";
    }
    var xmplandrs = xmplandrs.substring(0, xmplandrs.length - 1);
    printPositionInfo(xmplandrs);
}


///刷新配血计划
function QryPatInfoByAdmNo(AdmNo) {
    if (!me.CurrentReqFormDR || me.CurrentReqFormDR < 1) {
        return false;
    }
    $('#td_AdmId').combobox('loadData', {});
    $.ajax({
        url: LISGetDBURL(""),
        method: 'get',
        data: {
            ClassName: "BLD.WS.BLL.DHCBDXMTest",
            QueryName: "QryPatInfoByAdmNo",
            FunModul: "JSON",
            P0: AdmNo,
            P14: SessionStr
        },
        success: function (result) {
            result = result[0];
            $('#td_AdmInTime').html("<b>" + result.PAAdmDate + "</b>");
            var inpat = result.admInpat;
            if (inpat == "") return;
            var patInfoarr = [];
            var inpatarr = inpat.split('^');
            for (var i = 0; i < inpatarr.length; i++) {
                var item = {};
                item.id = inpatarr[i].split(',')[0];
                item.text = inpatarr[i].split(',').slice(1);
                patInfoarr.push(item);
            }
            $('#td_AdmId').combobox({
                data: eval(patInfoarr),
                editable: false,
                valueField: 'id',
                textField: 'text'
            });
        }
    });
}

function ChangeReqAdm() {
    var selectReq = me.ReqFormGrid.datagrid('getSelected');
    var rowIndex = me.ReqFormGrid.datagrid('getRowIndex', selectReq);
    var newAdmID = $('#td_AdmId').combobox('getValue');
    if (newAdmID == "") {
        showError("请选择绑定的住院记录!");
        return;
    }
    if (selectReq.AdmType == "I") {
        showError("已经绑定住院记录!");
        return;
    }
    $.ajax({
        url: me.actionUrl + '?Method=ChangeReqAdm&ReqFormDR=' + selectReq.RowID + "&AdmNo=" + newAdmID + "&ReqAdmNo=" + selectReq.AdmNo,
        method: 'post',
        success: function (r) {
            if (r.IsOk) {
                selectReq.AdmNo = newAdmID;
                selectReq.AdmType = "I";
                me.ReqFormGrid.datagrid('updateRow', { index: rowIndex, row: selectReq });
                showSlide(r.Message, 3000);
            } else {
                showError(r.Message);
            }
        }
    });
}


function getResultNoes(XMResultCode) {
    var flow = '<div id="ReportTraceDiv" style="padding:4px 10px 24px 10px;width:400px;">';
    flow += '<table>';
    flow += '</tr>';
    flow += '</td>';
    flow += '<td>';
    flow += '</tr>';
    flow += '</table>';
    flow += '</div>';
    var dominfo = "";
    if (XMResultCode == "1") {
        var dominfo = "<i class='fa fa-check-circle-o' style='font-size:20px;color:blue;'></i>主侧次侧相合";
    }
    if (XMResultCode == "2") {
        var dominfo = "<i class='fa fa-exclamation-circle' style='font-size:20px;color:yellow;'></i>主侧相合,次侧不合";
    }
    if (XMResultCode == "3") {
        var dominfo = "<i class='fa fa-times-circle' style='font-size:20px;color:red;'></i>主侧不合";
    }
    var html = ShowFeeDetails("1", dominfo, "ShowResultNoes", false);
    return html;
}
///type:1选中申请单调用 否则其他菜单调用
function getPatDiffMatchRecord(type) {
    $("#dg_PatDiffMatchRecord").datagrid({
        url: me.actionUrl + '?Method=QryPatDiffMatchRecord&RegNo=' + me.RegNo,
        method: 'get',
        fit: true,
        fitColumns: false,
        pagination: false,
        singleSelect: true,
        rownumbers: true,
        border: true,
        columns: [[
           {
               field: 'AddDate', title: '报告时间', width: 130, align: 'left',
               formatter: function (value, row, index) {
                   return value + " " + row.AddTime;
               }
           },
            { field: 'AddUser', title: '报告者', width: 70, align: 'left' },
            { field: 'SurName', title: '患者姓名', width: 70, align: 'left' },
             { field: 'Species', title: '性别', width: 50, align: 'left' },
            { field: 'AgeDesc', title: '年龄', width: 70, align: 'left' },
            { field: 'Location', title: '科室', width: 110, align: 'left' },
            { field: 'RegNo', title: '登记号', width: 90, align: 'left' },
            { field: 'Description', title: '结果', width: 150, align: 'left' },
            { field: 'PreDescription', title: '更新结果', width: 150, align: 'left' },
            {
                field: 'ModifyDate', title: '更新时间', width: 145, align: 'left',
                formatter: function (value, row, index) {
                    return value + " " + row.ModifyTime;
                }
            },
            { field: 'ModifyUser', title: '更新人', width: 90, align: 'left' }
        ]],
        onLoadSuccess: function (data) {
            if (data.total > 0) {
                $(this).datagrid("clearSelections");
                if (type == "1") {
                    var html = "";
                    for (var i = 0; i < data.total; i++) {
                        var row = data.rows[i];
                        var seq = i + 1;
                        var spearat = "</br>";
                        if (i == 0) spearat = "";
                        html += (spearat + seq + ".该患者在" + row.AddDate + " " + row.AddTime + "有疑难信息:" + row.Description);
                    }
                    $('#sp_PatDiffMsg').html(html);
                    $('#div_PatDiffMsg').window('open');
                }

            }
        }
    });
}
var OperateType = "";
function OpenDMRecord(Type) {
    OperateType = Type;
    if (Type == "Delete") {
        var PatDiffMatchRecord = $("#dg_PatDiffMatchRecord").datagrid('getSelected');
        if (!PatDiffMatchRecord) {
            showError("请选择需要修改的疑难配血记录");
            return;
        }
        $.messager.confirm('提示信息', "是否要删除该条疑难记录？", function (isClickedOk) {
            if (!isClickedOk) {
                return;
            }
            SavePatDiffMatch();
        });
    }
    else {
        $('#DMRecord_window').window('open');
    }
}

function SavePatDiffMatch() {
    var PatDMRecordDR = "";
    var funName = "SavePatDiffMatch";
    if (OperateType == "Update") {
        var PatDiffMatchRecord = $("#dg_PatDiffMatchRecord").datagrid('getSelected');
        if (!PatDiffMatchRecord) {
            showError("请选择需要修改的疑难配血记录");
            return;
        }
        PatDMRecordDR = PatDiffMatchRecord.PatDMRecordDR;
    }
    if (OperateType == "Delete") {
        var PatDiffMatchRecord = $("#dg_PatDiffMatchRecord").datagrid('getSelected');
        if (!PatDiffMatchRecord) {
            showError("请选择需要删除的疑难配血记录");
            return;
        }
        PatDMRecordDR = PatDiffMatchRecord.PatDMRecordDR;
        funName = "DelPatDiffMatch";
    }
    var DifficultMatchDR = $('#cmb_DMRecord').combogrid('getValue');
    var Remark = $('#DMRecordRemark').val();
    var param = {};
    param.ReqFormDR = me.CurrentReqFormDR;
    param.RegNo = me.RegNo;
    param.PatDMRecordDR = PatDMRecordDR;
    param.DifficultMatchDR = DifficultMatchDR;
    param.Remark = Remark;
    $.ajax({
        url: me.actionUrl + '?Method=' + funName,
        method: 'post',
        data: param,
        success: function (r) {
            if (r.IsOk) {
                getPatDiffMatchRecord();
                showSlide(r.Message, 3000);
            } else {
                showError(r.Message);
            }
        }
    });
}

//添加工作列表右击菜单内容
function dgReqFormMenu(e, rowIndex, rowData) {
    ////选中当前行
    var selectRow = me.ReqFormGrid.datagrid('getSelected');
    if (selectRow) {
        var selectedIndex = me.ReqFormGrid.datagrid('getRowIndex', selectRow);
        if (selectedIndex != rowIndex) {
            me.ReqFormGrid.datagrid("selectRow", rowIndex);
        }
    }
    e.preventDefault();
    $('#mnu_ReqForm').menu('show', {
        left: e.pageX,
        top: e.pageY
    });
}

///右键菜单功能
function menuHandler(item) {
    if (item.name == "PatDiffMatch") {
        WinPatDiffMatchOpen();
    }
    if (item.name == "LockReqForm") {
        LockReqForm(me.CurrentReqFormDR, "1");
    }
    if (item.name == "UnLockReqForm") {
        LockReqForm(me.CurrentReqFormDR, "");
    }
}

function WinPatDiffMatchOpen() {
    $('#cmb_DMRecord').combogrid({
        url: "../../sys/ashx/ashCodeTable.ashx?Model=BBDifficultMatch&GlobalParam=Active:1&sort=SeqNum&order=asc&pagination=false&Method=Query",
        panelWidth: 300,
        fit: true,
        editable: false,
        fitColumns: true,  //列少设为true,列多设为false
        idField: 'RowID',
        textField: 'CName',
        columns: [[
            { field: 'RowID', title: 'ID', width: 40, hidden: true, align: 'center' },
            { field: 'Code', title: '代码', width: 70, sortable: true, align: 'center' },
            { field: 'Description', title: '描述', width: 150, sortable: true, align: 'left' }
        ]],
        onSelect: function (index, row) {
            $('#DMRecordDes').val(row.Description);
        },
        keyHandler: {
            up: function (event) { keyHandlerUp(event, $(this)); },
            down: function (event) { keyHandlerDown(event, $(this)); },
            enter: function (event) { keyHandlerEnter(event, $(this), $('#txt_PackInNo')); },
            query: function (q, event) { }
        }
    });
    getPatDiffMatchRecord();
    $('#DMPatRecord_window').window('open');
}

function LockReqForm(ReqFormDR, Islocked) {
    var selectReq = me.ReqFormGrid.datagrid('getSelected');
    var rowIndex = me.ReqFormGrid.datagrid('getRowIndex', selectReq);
    var params = {};
    params.ReqFormDR = ReqFormDR;
    params.IsLocked = Islocked;
    $.ajax({
        url: me.actionUrl + '?Method=LockReqForm',
        method: 'post',
        data: params,
        success: function (r) {
            if (r.IsOk) {
                if (Islocked == "1") {
                    selectReq.IsLocked = "1";
                }
                else {
                    selectReq.IsLocked = "";
                }
                me.ReqFormGrid.datagrid('updateRow', { index: rowIndex, row: selectReq });
                showSlide(r.Message, 3000); 
            } else {
                showError(r.Message);
            }
        }
    });
}

function QryBDSupervise() {
    $("#dg_NoIssuePlan").datagrid({
        method: 'get',
        fit: true,
        fitColumns: false,
        pagination: false,
        singleSelect: true,
        rownumbers: true,
        border: true,
        columns: [[
           {
               field: 'XMCheckDate', title: '预留时间', width: 135, align: 'left',
               formatter: function (value, row, index) {
                   return value + " " + row.XMCheckTime;
               }
           },
            { field: 'PackID', title: '血袋编号', width: 110, align: 'left' },
            { field: 'BloodProductName', title: '血液品种', width: 70, align: 'left' },
            { field: 'SurName', title: '姓名', width: 90, align: 'left' },
             { field: 'Species', title: '性别', width: 50, align: 'left' },
            { field: 'AgeDesc', title: '年龄', width: 70, align: 'left' },
            { field: 'RegNo', title: '登记号', width: 90, align: 'left' },
             { field: 'LISBdGroup', title: '患者血型', width: 90, align: 'left' },
            { field: 'UseSampleNo', title: '检验号', width: 110, align: 'left' },
            { field: 'CostItemName', title: '医嘱名称', width: 150, align: 'left' },
            { field: 'CheckHours', title: '时限(小时)', width: 90, align: 'left' }
        ]]
    });
    $("#dg_NoXMPlan").datagrid({
        method: 'get',
        fit: true,
        fitColumns: false,
        pagination: false,
        singleSelect: true,
        rownumbers: true,
        border: true,
        columns: [[
           {
               field: 'ReceiveDate', title: '接收时间', width: 135, align: 'left',
               formatter: function (value, row, index) {
                   return value + " " + row.ReceiveTime;
               }
           },
            { field: 'ReceiveUser', title: '接收者', width: 70, align: 'left' },
            { field: 'SurName', title: '姓名', width: 70, align: 'left' },
             { field: 'Species', title: '性别', width: 50, align: 'left' },
            { field: 'AgeDesc', title: '年龄', width: 70, align: 'left' },
             { field: 'LocationDesc', title: '科室', width: 90, align: 'left' },
              { field: 'WardDesc', title: '病区', width: 110, align: 'left' },
            { field: 'RegNo', title: '登记号', width: 90, align: 'left' },
             { field: 'LISBdGroup', title: '患者血型', width: 90, align: 'left' },
            { field: 'UseSampleNo', title: '检验号', width: 110, align: 'left' },
            { field: 'CostItemName', title: '医嘱名称', width: 150, align: 'left' },
            { field: 'ReceiveHours', title: '时限(小时)', width: 90, align: 'left' }
        ]]
    });
    var fReqTypeDR = $('#cmb_ReqType').combogrid('getValue');
    var fCheckHours = $('#txtLimitHous').val();
    $.ajax({
        url: LISGetDBURL(""),
        method: 'get',
        data: {
            ClassName: "BLD.WS.BLL.DHCBDXMTest",
            QueryName: "QryBDSupervise",
            FunModul: "MTHD",
            P2: fReqTypeDR,
            P3: fCheckHours,
            P14: SessionStr
        },
        success: function (result) {
            if (result["NoIssueInfo"].length > 0 || result["NoXMPlanInfo"].length > 0) {
                $('#div_Supervise').window('open');
                $('#dg_NoIssuePlan').datagrid('loadData', result["NoIssueInfo"]);
                $('#dg_NoXMPlan').datagrid('loadData', result["NoXMPlanInfo"]);
            }
        }
    });
}

function RefreshBDSupervise() {
    var fReqTypeDR = $('#cmb_ReqType').combogrid('getValue');
    var fCheckHours = $('#txtLimitHous').val();
    $.ajax({
        url: LISGetDBURL(""),
        method: 'get',
        data: {
            ClassName: "BLD.WS.BLL.DHCBDXMTest",
            QueryName: "QryBDSupervise",
            FunModul: "MTHD",
            P2: fReqTypeDR,
            P3: fCheckHours,
            P14: SessionStr
        },
        success: function (result) {
            $('#dg_NoIssuePlan').datagrid('loadData', result["NoIssueInfo"]);
            $('#dg_NoXMPlan').datagrid('loadData', result["NoXMPlanInfo"]);

        }
    });
}

//通知取血
function CancelInformXMPlan() {
    var params = {};
    var rows = me.XMPlanGrid.datagrid("getChecked");
    var XMPlanDRs = "";
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (row.IsNoticed != "1") continue;
        XMPlanDRs = XMPlanDRs + row.RowID + ",";
    }
    if (XMPlanDRs == "") {
        showError("请选择需要取消取消通知的配血计划!");
    }
    XMPlanDRs = XMPlanDRs.substring(0, XMPlanDRs.length - 1);
    params.XMPlanDRs = XMPlanDRs;
    params.AdmNo = me.AdmId;
    $.ajax({
        url: me.actionUrl + '?Method=CancelInformXMPlan',
        method: 'post',
        data: params,
        success: function (r) {
            if (r.IsOk) {
                showSlide(r.Message, 3000);
                ReloadXMPlanRows(rows);
            } else {
                showError(r.Message);
            }
        }
    });
}

function changePayment() {
    var MedicalInsuranceType = $("input[name='rdMedicalInsuranceType']:checked").val();
    var PayMentType = $('#cmbPayMentType').combobox('getValue');
    if (MedicalInsuranceType == undefined || MedicalInsuranceType == "") {
        $.messager.alert('错误提示', '请勾选费用类型！');
        return;
    }
    if (MedicalInsuranceType == "1") {
        if (PayMentType == "" || PayMentType == undefined) {
            $.messager.alert('错误提示', '当前费用类型为医保，请选择具体医保类型！');
            $('#btn_save').linkbutton('enable');
            if (me.ReqFormDR.length) {
                $('#btn_check').linkbutton('enable');
            }
            return;
        }
    }
    $.messager.confirm('确认', '请确认是否修改该申请单下医嘱医保类型，是否继续？', function (r) {
        if (r) {
            $.ajax({
                type: "GET",
                dataType: "text", //text, json, xml
                async: false, //为true时，异步，不等待后台返回值，为false时强制等待；-asir
                url: me.actionUrl + "?method=UpdataPayMentType&ReqFormDR=" + me.CurrentReqFormDR + "&MedicalInsuranceType=" + MedicalInsuranceType + "&PayMentType=" + PayMentType,
                success: function (data) {
                    if (data == 1) {
                        $.messager.show({
                            title: '操作提示',
                            msg: '修改成功！',
                            timeout: 2000,
                            showType: 'slide'
                        });
                    } else {
                        $.messager.alert("错误提示", "修改医保类型失败，请联系管理员！");
                        return;
                    }
                }
            })
        }
    })
}

function VerifyDataGrid() {
    $("#dg_VerifyPack").datagrid({
        url: me.actionUrl + "?Method=QueryXMPlan&ReqFormDR=" + me.CurrentReqFormDR + "&IsVerify=0",
        method: 'get',
        idField: 'RowID',
        sortName: 'RowID',
        sortOrder: "desc",
        fitColumns: false,
        fit: true,
        rownumbers: false,
        remoteSort: false,
        singleSelect: true,
        checkOnSelect: false,
        selectOnCheck: false,
        nowrap: false,  //折行
        border: false,
        columns: [[
                    { field: 'RowID', title: 'ID', checkbox: true },
                    { field: 'PackID', title: '献血码', width: 120, sortable: true, align: 'center' },
                    { field: 'ProductBarcode', title: '产品码', width: 80, sortable: true, align: 'center' },
                    { field: 'BloodProductName', title: '血液产品', width: 140, sortable: true, align: 'center' },
                    {
                        field: 'BloodGroupName', title: '血型组', width: 100, sortable: true, align: 'center',
                        formatter: function (value, rowData, rowIndex) {
                            var color = GetBdTypeColor(rowData.ABO, rowData.RH);
                            return '<span style="font-size:14px;font-weight:bolder;background:' + color.BackGroundColor + ';color:' + color.FontColor + '" >' + value + '</span>';
                        }
                    },
                    { field: 'PackVolume', title: '血量', width: 50, sortable: true, align: 'center' },
                     {
                         field: 'XMResultStr', title: '结果', width: 40, sortable: true, align: 'center',
                         formatter: function (value, rowData, rowIndex) {
                             if (rowData.MajorXMResultCode == "") {
                                 return "";
                             }
                             if (rowData.MajorXMResultCode == "XMR1" && rowData.MinorXMResultCode == "XMR1") {
                                 return "<i class=\'fa fa-check-circle-o\' style='font-size:20px;color:blue;' onmouseenter='getResultNoes(1)'></i>";
                             }
                             else if (rowData.MajorXMResultCode == "XMR2") {
                                 return "<i class=\'fa fa-times-circle\'  style='font-size:20px;color:red;' onmouseenter='getResultNoes(3)'></i>";
                             }
                             else if (rowData.MajorXMResultCode == "XMR1" && rowData.MinorXMResultCode == "XMR2") {
                                 return "<i class=\'fa fa-exclamation-circle\' style='font-size:20px;color:yellow;' onmouseenter='getResultNoes(2)'></i>";
                             }
                         }
                     },
                    {
                        field: 'TransactionDR', title: '状态', width: 60, sortable: true, align: 'center',
                        styler: function (value, row, index) {
                            var color = "";
                            if (row.TransactionCode == "BloodMatchFail") {
                                color = "#f06d4f";
                            }
                            if (row.TransactionCode == "CancelIssueXMPlan") {
                                color = "#f06d4f";
                            }
                            if (row.TransactionCode == "UnCheckXMPlan") {
                                color = "#f06d4f";
                            }
                            if (row.TransactionCode == "CheckXMPlan") {
                                color = "#3db7cd";
                            }
                            if (row.TransactionCode == "IssueXMPlan") {
                                color = "#9bba5e";
                            }
                            return 'background-color:' + color;
                        },
                        formatter: function (value, rowData, rowIndex) {
                            return rowData.TransactionName;
                        }
                    },
                   {
                       field: 'ExpiredDate', title: '失效时间', width: 145, sortable: true, align: 'center',
                       formatter: function (value, rowData, rowIndex) {
                           return value + " " + rowData.ExpiredTime;
                       }
                   },
                    {
                        field: 'PackStatusName', title: '血液状态', width: 50, sortable: true, align: 'center',
                        formatter: function (value, rowData, rowIndex) {
                            return '<strong style="color:' + rowData.PackStatusColor + ';">' + value + '</strong>';
                        }
                    },
                     {
                         field: 'AddDate', title: '配血时间', width: 145, sortable: true, align: 'center',
                         formatter: function (value, rowData, rowIndex) {
                             return value + " " + rowData.AddTime;
                         }
                     },
                    { field: 'AddUser', title: '配血用户', width: 60, sortable: true, align: 'center' },
                     {
                         field: 'XMCheckDate', title: '审核时间', width: 140, sortable: true, align: 'center',
                         formatter: function (value, rowData, rowIndex) {
                             return value + " " + rowData.XMCheckTime;
                         }
                     },
                    { field: 'XMCheckUser', title: '审核用户', width: 60, sortable: true, align: 'center' },
                    { field: 'XMPlanNo', title: '配血单号', width: 130, sortable: true, align: 'center' }
        ]],
        onLoadSuccess: function (data) {
            //$("#.datagrid-header-check").html("");
            $("#dg_VerifyPack").parent().find("div .datagrid-header-check").children("input[type=\"checkbox\"]").eq(0).attr("style", "display:none;");
            $("#dg_VerifyPack").datagrid("clearChecked");
            
        },
        onClickRow: function (rowIndex, rowData) {
   
        },
        onSelect: function (rowIndex, rowData) {

        },
        onCheck: function (index, row) {
            if (me.CheckRowIndex == "") {
                $("#dg_VerifyPack").datagrid('uncheckRow', index);
            } 
        }
    });
}

/// 发血时弹出校验框,查询已经审核的血袋
function VerifyIssueDataGrid() {
    $("#dg_IssueXMPack").datagrid({
        //url: me.actionUrl + "?Method=QueryXMPlan&ReqFormDR=" + me.CurrentReqFormDR + "&IsFinished=1",
        data:me.VerifyDatagridData,
        method: 'get',
        idField: 'RowID',
        sortName: 'RowID',
        sortOrder: "desc",
        fitColumns: false,
        fit: true,
        rownumbers: false,
        remoteSort: false,
        singleSelect: true,
        checkOnSelect: false,
        selectOnCheck: false,
        nowrap: false,  //折行
        border: false,
        columns: [[
                    { field: 'RowID', title: 'ID', checkbox: true },
                    {
                        field: 'PackID', title: '献血码', width: 150, sortable: true, align: 'center',
                            formatter: function (value, rowData, rowIndex) {
                                var retValue = ""
                                if (rowData.IsVerified == "1") {
                                    retValue = retValue + getIconHtml("校", "", "#66CCCC", "", "");
                                }
                                return value + " " + retValue ;

                            }
                    },
                    { field: 'ProductBarcode', title: '产品码', width: 80, sortable: true, align: 'center' },
                    { field: 'BloodProductName', title: '血液产品', width: 140, sortable: true, align: 'center' },
                    {
                        field: 'BloodGroupName', title: '血型组', width: 100, sortable: true, align: 'center',
                        formatter: function (value, rowData, rowIndex) {
                            var color = GetBdTypeColor(rowData.ABO, rowData.RH);
                            return '<span style="font-size:14px;font-weight:bolder;background:' + color.BackGroundColor + ';color:' + color.FontColor + '" >' + value + '</span>';
                        }
                    },
                    { field: 'PackVolume', title: '血量', width: 50, sortable: true, align: 'center' },
                     {
                         field: 'XMResultStr', title: '结果', width: 40, sortable: true, align: 'center',
                         formatter: function (value, rowData, rowIndex) {
                             if (rowData.MajorXMResultCode == "") {
                                 return "";
                             }
                             if (rowData.MajorXMResultCode == "XMR1" && rowData.MinorXMResultCode == "XMR1") {
                                 return "<i class=\'fa fa-check-circle-o\' style='font-size:20px;color:blue;' onmouseenter='getResultNoes(1)'></i>";
                             }
                             else if (rowData.MajorXMResultCode == "XMR2") {
                                 return "<i class=\'fa fa-times-circle\'  style='font-size:20px;color:red;' onmouseenter='getResultNoes(3)'></i>";
                             }
                             else if (rowData.MajorXMResultCode == "XMR1" && rowData.MinorXMResultCode == "XMR2") {
                                 return "<i class=\'fa fa-exclamation-circle\' style='font-size:20px;color:yellow;' onmouseenter='getResultNoes(2)'></i>";
                             }
                         }
                     },
                    {
                        field: 'TransactionDR', title: '状态', width: 60, sortable: true, align: 'center',
                        styler: function (value, row, index) {
                            var color = "";
                            if (row.TransactionCode == "BloodMatchFail") {
                                color = "#f06d4f";
                            }
                            if (row.TransactionCode == "CancelIssueXMPlan") {
                                color = "#f06d4f";
                            }
                            if (row.TransactionCode == "UnCheckXMPlan") {
                                color = "#f06d4f";
                            }
                            if (row.TransactionCode == "CheckXMPlan") {
                                color = "#3db7cd";
                            }
                            if (row.TransactionCode == "IssueXMPlan") {
                                color = "#9bba5e";
                            }
                            return 'background-color:' + color;
                        },
                        formatter: function (value, rowData, rowIndex) {
                            return rowData.TransactionName;
                        }
                    },
                   {
                       field: 'ExpiredDate', title: '失效时间', width: 145, sortable: true, align: 'center',
                       formatter: function (value, rowData, rowIndex) {
                           return value + " " + rowData.ExpiredTime;
                       }
                   },
                    {
                        field: 'PackStatusName', title: '血液状态', width: 50, sortable: true, align: 'center',
                        formatter: function (value, rowData, rowIndex) {
                            return '<strong style="color:' + rowData.PackStatusColor + ';">' + value + '</strong>';
                        }
                    },
                     {
                         field: 'AddDate', title: '配血时间', width: 145, sortable: true, align: 'center',
                         formatter: function (value, rowData, rowIndex) {
                             return value + " " + rowData.AddTime;
                         }
                     },
                    { field: 'AddUser', title: '配血用户', width: 60, sortable: true, align: 'center' },
                     {
                         field: 'XMCheckDate', title: '审核时间', width: 140, sortable: true, align: 'center',
                         formatter: function (value, rowData, rowIndex) {
                             return value + " " + rowData.XMCheckTime;
                         }
                     },
                    { field: 'XMCheckUser', title: '审核用户', width: 60, sortable: true, align: 'center' },
                    { field: 'XMPlanNo', title: '配血单号', width: 130, sortable: true, align: 'center' }
        ]],
        onLoadSuccess: function (data) {
            //$("#.datagrid-header-check").html("");
            $("#dg_IssueXMPack").parent().find("div .datagrid-header-check").children("input[type=\"checkbox\"]").eq(0).attr("style", "display:none;");
            $("#dg_IssueXMPack").datagrid("clearChecked");

        },
        onClickRow: function (rowIndex, rowData) {

        },
        onSelect: function (rowIndex, rowData) {

        },
        onCheck: function (index, row) {
            if (me.CheckRowIndex == "") {
                $("#dg_IssueXMPack").datagrid('uncheckRow', index);
            }
        }
    });
}


function Verify() {
    VerifyDataGrid();
    $("#txt_VerifyLabNo").val("");
    $("#txt_VerifyPackID").val("");
    $("#txt_VerifyProductCode").val("");
    me.IsMatch = 0;
    $("#win_VerifyPack").window("open");
    $("#txt_VerifyLabNo").focus();
    
}
function VerifyCancel() {
    $("#win_VerifyPack").window("close");
}

function InitVerifyKeyEvent() {
    me.CheckRowIndex = 0;
    me.IsMatch = 0;
    $('#txt_VerifyLabNo').keydown(function (event) {
        if (event.keyCode == "13") {
            // 验证是否为本人标本
            var labNo=$('#txt_VerifyLabNo').val();
            if(labNo==""||labNo.length==0) return ;
            $.ajax({
                type: "post",
                dataType: "text", //text, json, xml
                cache: false, //
                async: false, //为true时，异步，不等待后台返回值，为false时强制等待；-asir
                url: me.actionUrl + '?Method=GetIsOwnLabNo&LabNo=' + labNo + "&ReqFormDR=" + me.CurrentReqFormDR,
                success: function (result) {
                    if (result == "1") {
                        me.IsMatch = 1;
                        $("#txt_VerifyPackID").focus();
                    }
                    else {
                        $.messager.alert("错误", result,'info',ErrorLabnoNext);
                        return;
                    }
                }
            });
        }
    });
    $("#txt_VerifyPackID").keydown(function (event) {
        if (event.keyCode == "13") {
            // 勾选
            var packID = GetPackNo($('#txt_VerifyPackID').val());
            if (packID == "" || packID.length == 0) return;
            $("#txt_VerifyPackID").val(packID);
            var rows = $("#dg_VerifyPack").datagrid("getRows");
            var count = 0;
            var tmprow;
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                if (packID == "" || packID.length == 0) return;
                if (row.PackID == packID) {
                    count = count + 1;
                    tmprow = row;
                }
            }
            if (count==1) {
                var index = $("#dg_VerifyPack").datagrid("getRowIndex", tmprow);
                me.CheckRowIndex = 1;
                $("#dg_VerifyPack").datagrid("checkRow", index);
                $("#txt_VerifyPackID").val("");
                 me.CheckRowIndex = 0;
            } else if (count == 0) {
                $.messager.alert("提示", "未查询到该献血码，请核实", 'info', ErrorIssuePackIDNext);
                return;
            } else {
                $("#txt_VerifyProductCode").focus();
            }
        }
    });
    $("#txt_VerifyProductCode").keydown(function (event) {
        if (event.keyCode == "13") {
            // 勾选
            var packBarcode = $('#txt_VerifyProductCode').val();
            var pattern = new RegExp("[@*=|]");
            var barcode = "";
            for (var i = 0; i < packBarcode.length; i++) {
                barcode = barcode + src.substr(i, 1).replace(pattern, '');
            }
            if (barcode == "" || barcode.length == 0) return;
            var rows = $("#dg_VerifyPack").datagrid("getRows");
            var packID = $("#txt_VerifyPackID").val();
            var flag = false; // 标记是否找到对应的血袋
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                if (row.PackID == packID && row.ProductBarcode == barcode) {
                    var index = $("#dg_VerifyPack").datagrid("getRowIndex", row);
                    me.CheckRowIndex = 1;
                    $("#dg_VerifyPack").datagrid("checkRow", index);
                    $("#txt_VerifyPackID").val("");
                    $("#txt_VerifyProductCode").val("");
                    me.CheckRowIndex = 0;
                    flag=true;
                }
            }
            if (!flag) {
                $.messager.alert("提示", "未查到该血袋，请核实", "info", ErrorBarCodeNext);
                return;
            }
        }
    });
    $("#txt_VerifyIssuePackID").keydown(function (event) {
        if (event.keyCode == "13") {
            // 勾选
            var packID = GetPackNo($('#txt_VerifyIssuePackID').val());
            if (packID == "" || packID.length == 0) return;
            $("#txt_VerifyIssuePackID").val(packID);
            var rows = $("#dg_IssueXMPack").datagrid("getRows");
            var count = 0;
            var tmprow;
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                if (packID == "" || packID.length == 0) return;
                if (row.PackID == packID) {
                    count = count + 1;
                    tmprow = row;
                }
            }
            if (count == 1) {
                if (tmprow.IsVerify == "1" && row.IsVerified != "1") {
                    $.messager.alert("提示", "血液未进行校验，不能勾选发血！",'info',IssuePackNext);
                    return;
                }
                if (tmprow.IsVerify == "1" && row.IsVerified != "1") {
                    $.messager.confirm('提示', '该血袋尚未进行核对，是否继续勾选？', function (r) {
                        if (r) {
                            var index = $("#dg_IssueXMPack").datagrid("getRowIndex", tmprow);
                            me.CheckRowIndex = 1;
                            $("#dg_IssueXMPack").datagrid("checkRow", index);
                            $("#txt_VerifyIssuePackID").val("");
                            me.CheckRowIndex = 0;
                        }
                    });
                }
                else {
                    var index = $("#dg_IssueXMPack").datagrid("getRowIndex", tmprow);
                    me.CheckRowIndex = 1;
                    $("#dg_IssueXMPack").datagrid("checkRow", index);
                    $("#txt_VerifyIssuePackID").val("");
                    me.CheckRowIndex = 0;
                }
                
            } else if (count == 0) {
                $.messager.alert("提示", "未查询到该献血码，请核实", 'info', ErrorPackIDNext);
                return;
            } else {
                $("#txt_VerifyIssueProductCode").focus();
            }
        }
    });

    $("#txt_VerifyIssueProductCode").keydown(function (event) {
        if (event.keyCode == "13") {
            // 勾选
            var packBarcode = $("#txt_VerifyIssueProductCode").val();
            var pattern = new RegExp("[@*=|]");
            var barcode = "";
            for (var i = 0; i < packBarcode.length; i++) {
                barcode = barcode + src.substr(i, 1).replace(pattern, '');
            }
            if (barcode == "" || barcode.length == 0) return;
            if (barcode == "" || barcode.length == 0) return;
            var packID = $("#txt_VerifyIssuePackID").val();
            var flag = false; // 标记是否找到对应的血袋
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                if (row.PackID == packID && row.ProductBarcode == barcode) {
                    var index = $("#dg_IssueXMPack").datagrid("getRowIndex", row);
                    me.CheckRowIndex = 1;
                    $("#dg_IssueXMPack").datagrid("checkRow", index);
                    $("#txt_VerifyIssuePackID").val("");
                    $("#txt_VerifyIssueProductCode").val("");
                    me.CheckRowIndex = 0;
                    flag = true;
                }
            }
            if (!flag) {
                $.messager.alert("提示", "未查到该血袋，请核实", "info", ErrorIssueBarCodeNext);
                return;
            }
        }
    });
}
/// 保存校验信息
function VerifySave() {
    if (me.IsMatch != 1) {
        $.messager.alert("提示", "尚未核对标本信息，请核对！", 'info', ErrorLabnoNext)
        return;
    }
    var rows = $("#dg_VerifyPack").datagrid("getChecked");
    var xmPlanDRs = "";
    for (var i = 0; i < rows.length; i++) {
        var xmPlanDR = rows[i].RowID;
        if (xmPlanDRs == "") {
            xmPlanDRs = xmPlanDR;
        } else {
            xmPlanDRs = xmPlanDRs + "^" + xmPlanDR;
        }
    }
    if (xmPlanDRs == "") {
        $.messager.alert("提示", "请勾选需要校对的血袋")
        return;
    }
    $.ajax({
        type: "post",
        dataType: "text", //text, json, xml
        cache: false, //
        async: false, //为true时，异步，不等待后台返回值，为false时强制等待；-asir
        url: me.actionUrl + '?Method=VerifySave&xmPlanDRs=' + xmPlanDRs ,
        success: function (result) {
            if (result == "1") {
                showSlide("校验成功！", 3000);
                $("#win_VerifyPack").window("close");
                RefreshXMPlan();
            }
            else {
                $.messager.alert("错误", result);
                return;
            }
        }
    });
}
function VerifyIssueXMPlan() {
    // 发血弹框
    //$.messager.alert("提示", "发血弹框开始");
    VerifyIssueDataGrid();
    $("#txt_VerifyIssuePackID").val("");
    $("#txt_VerifyIssueProductCode").val("");
    $('#div_statPackCost').dialog('close'); // 关闭收费窗口
    $("#win_VerifyIssuePack").window("open");
}
// 发血确认开始
function VerifyIssueXMPlanDo()
{
    var IssueUserDR = "0";
    var rows = $("#dg_IssueXMPack").datagrid('getChecked');
    var PackBarcodes = '';
    var Plans = [];
    var row = null;
    var packDRs = "";
    var planDRs = "";
    var isNegativePack = "";
    for (var i = 0; i < rows.length; i++) {
        row = rows[i];
        PackBarcodes += row.PackBarcode;
        if (i < rows.length - 1) {
            PackBarcodes += ",";
        }
        if (row.RH == "N") {
            isNegativePack = "1";
        }
        var Plan = {};
        Plan.RowID = row.RowID;
        Plan.ReqFormDR = row.ReqFormDR;
        Plan.PackDR = row.PackDR;
        // Plan.SampleNo = row.SampleNo;
        Plan.SampleNo = me.Labno;
        Plan.PackBarcode = row.PackBarcode;
        Plan.XMPlanNo = row.XMPlanNo;
        Plans.push(Plan);
        packDRs += row.PackDR + "^";
        planDRs += row.RowID + "^";
    }
    packDRs = packDRs.substring(0, packDRs.length - 1);
    planDRs = planDRs.substring(0, planDRs.length - 1);

    var params = {};
    params.Plans = JSON.stringify(Plans);
    params.IssueUserDR = IssueUserDR;
    params.TakeRecordDR = me.CurrentTakeRecordDR;
    params.planDRs = planDRs;
    params.TakeUserName = $("#hiddenTakeUserName").val();
    $.messager.confirm('确认',  '确定发血（血袋条码“' + PackBarcodes + '”）?', function (r) {

        if (r) {
            $.ajax({
                dataType: "text", //text, json, xml
                method: 'post',
                data: params,
                url: me.actionUrl + '?Method=PromptIssuePack',
                success: function (result) {
                    if (result != "1") {
                        var flag = result.split("^")[0];
                        var message = result.split("^")[1];
                        if (flag == "-1") {
                            showError(message + ",不能发血!");
                        } else {
                            $.messager.confirm('提示信息', message + ',是否继续发血?', function (isClickedOk) {
                                if (isClickedOk) {
                                    params.positiveFee = false;
                                    IssueXMPlanDo(params, rows);
                                }

                            });
                        }
                    }
                    else {
                        params.positiveFee = false;
                        IssueXMPlanDo(params, rows);
                    }

                }
            });
        }


    });
}
function ErrorLabnoNext() {
    $('#txt_VerifyLabNo').val("");
    $('#txt_VerifyLabNo').focus();
}
function ErrorPackIDNext() {
    $("#txt_VerifyPackID").val("");
    $("#txt_VerifyPackID").focus();
}
function ErrorIssuePackIDNext()
{
    $("#txt_VerifyIssuePackID").val("");
    $("#txt_VerifyIssuePackID").focus();
}
function ErrorBarCodeNext() {
    $("#txt_VerifyProductCode").val("");
    $("#txt_VerifyPackID").val("");
    $('#txt_VerifyPackID').focus();
}
function VerifyIssueCancel()
{
    $("#win_VerifyIssuePack").window("close");

}
function IssuePackNext()
{
    $("#txt_VerifyIssuePackID").val("");
    $("#txt_VerifyIssuePackID").focus();
}
function ErrorIssueBarCodeNext()
{
    $("#txt_VerifyIssuePackID").val("");
    $("#txt_VerifyIssueProductCode").val("");
    $("#txt_VerifyIssuePackID").focus();
}

function Model() {
	$("#div_content").empty();
	$.ajax({
		url:me.actionUrl +'?Method=QueryMode',
		success: function (data) {
			var htmlstr = "";
			for (var i = 0; i < data.rows.length; i++) {
				htmlstr += '<div  class="panelList" style="padding:10px 5px 5px 5px;position:relative;width:170px;border-bottom: 1px solid #ddd;cursor:pointer;" data-options="tools:\'#toolbarCancle\'">';
				htmlstr += '<input type="hidden" name="contentDetil" value="' + data.rows[i]["CName"] + '" />';
				htmlstr += '<input type="hidden" name="Tile" value="' + data.rows[i]["Code"] + '" />';
				htmlstr += '<div style="font-weight:bold">';
				htmlstr += data.rows[i]["Code"];
				htmlstr += '</div>';
				htmlstr += '</div>';

			}
			$("#div_TitleList").html(htmlstr);
			$(".panelList").click(function () {
				//$(this).child()
				var contentDetil = $(this).children('input[name="contentDetil"]').val();
			  
				for (var i = 0; i < $(".panelList").length; i++) {
					$(".panelList").eq(i).css("background-color", "#FFFFFF");
				}
				$(this).css("background-color", "rgb(184, 233, 241)");
				$("#div_content").html(contentDetil);
				contentDetilc = contentDetil;
				//me.Tile = $(this).children('input[name="Tile"]').val();
			});


			$(".panelList").dblclick(function () {
			   
				var contentDetil = $(this).children('input[name="contentDetil"]').val();
				var Tile = $(this).children('input[name="Tile"]').val();

				$("#textarea_BldRemark").val(contentDetil);
				$("#div_Model").window("close");
			});

		   


		}



   })


	$("#div_Model").window("open");

}

function SaveModeInfo(){
	
	$("#textarea_BldRemark").val(contentDetilc);
	$("#div_Model").window("close");
	
	
	
}
