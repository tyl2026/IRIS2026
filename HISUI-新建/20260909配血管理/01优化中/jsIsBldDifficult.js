/// 加载配血计划列表
function LoadIsDifficult() {
    $("#XMBldPlanData").datagrid({
        url: me.actionUrl + '?Method=QueryXMPlan',
        method: 'get',
        setGrid: true,
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
                            return '<img src="../../resource/easyui/themes/icons/delete.png" onclick="DeleteXMPlanDifficult(' + JSON.stringify(row).replace(/"/g, "'") + ');" />';
                        }
                    },
                    {
                        field: 'PackID', title: '献血码', width: 190, sortable: true, align: 'left',
                        formatter: function (value, rowData, rowIndex) {
                            var retValue = ""
                            if (rowData.moreMatch == "1") {
                                retValue = retValue + getIconHtml("多", "", "", "QryPackMoreMatch(" + rowData.PackDR + ")", "一血多配");
                            }
                            if (rowData.IsBldDifficult == "1") {
                                retValue = retValue + getIconHtml("疑", "", "#D02090", "", "");
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
                                 return "<i class=\'fa fa-check-circle-o\' style='font-size:20px;color:blue;'></i>";
                             }
                             else if (rowData.MajorXMResultCode == "XMR2") {
                                 return "<i class=\'fa fa-times-circle\'  style='font-size:20px;color:red;'></i>";
                             }
                             else if (rowData.MajorXMResultCode == "XMR1" && rowData.MinorXMResultCode == "XMR2") {
                                 return "<i class=\'fa fa-exclamation-circle\' style='font-size:20px;color:yellow;'></i>";
                             }
                         }
                     },
                    {
                        field: 'PackPositionName', title: '血袋位置', width: 80, sortable: true, align: 'center',
                        formatter: function (value, row, index) {
                            return row.PackPositionName + " " + row.PackPositionCode;
                        }
                    },
                    { field: 'SpecimenRackName', title: '标本位置', width: 80, sortable: true, align: 'center' },
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
                            if (row.TransactionCode == "PackDifficult") {
                                color = "#D02090";
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
                                html += '<span id="ShowXMPlanFee_' + rowData.RowID + '_' + feeIndex + '" InitFlag="0" onmouseenter="ShowXMPlanFee(\'' + rowData.CostItemInfo + '\',\'ShowXMPlanFee_' + rowData.RowID + '_' + feeIndex + '\');">' + GetReqFormCostItemCostType(fee) + ':' + feeType.total + '</span>';
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
                     {
                         field: 'XMPlanNo', title: '配血单号', width: 120, sortable: true, align: 'center',
                         formatter: function (value, rowData, rowIndex) {
                             return rowData.XMPlanNo;
                         }
                     },
                     {
                         field: 'IsBldDifficult', title: '疑难', width: 60, sortable: true, align: 'center',
                         formatter: function (value, row, index) {
                             if (row.IsBldDifficult == "1") {
                                 return "是";
                             }
                             else {
                                 return "否";
                             }
                         }
                     }
        ]],
        toolbar: '#div_XMPlanToolBar',
        rowStyler: function (index, row) {
            if (row.listprice > 80) {
                return 'background-color:#6293BB;color:#fff;';
            }

        },
        onBeforeLoad: function (param) {
            param.ReqFormDR = me.CurrentReqFormDR;
            if (!param.ReqFormDR || param.ReqFormDR < 1) {
                return false;
            }
            var rows = $("#XMBldPlanData").datagrid('getRows');
            DeleteRows($("#XMBldPlanData"), rows);
            me.BldXMPlanData = null;
            //LoadXMPlanTest(me.DefaultXMTest);
        },
        onResizeColumn: function (field, width) {
            $("#XMBldPlanData").datagrid("fixRownumber");
        },
        onDblClickRow: function (index, row) {
        },
        onLoadSuccess: function (data) {
            if (me.BldXMPlanData == null) {
                me.BldXMPlanData = data;
            }
            $('.packtrack').linkbutton({ plain: true, iconCls: 'icon-track' });
            LoadCostItemDo();
            $("#XMBldPlanData").datagrid("fixRownumber");
        },
        onSelect: function (rowIndex, rowData) {
            if (!rowData) {
                return;
            }
            me.CurrentXMPlanDR = rowData.RowID;
            LoadXMPlanTestDo(rowData);
            if (rowData.XMLastResultDR == "" && rowData.IsXMatchProduct == "1") {

                //LoadProductDefMinorXMResult(rowData.ProductBarcode); 
                //LoadProductDefXMMethod(rowData.ProductBarcode);
                //LoadXMPlanTestDo(me.DefaultXMTest, true);
            }

        }

    });
}

/// 加载血袋信息
var xmplandr = 0;
var Checkedflag = false;
// 扫描献血码框回车事件
function LoadPackInfoBld() {
    var PackBarcode = $('#txt_XMPlan_BldSelectPack').val();
    if (PackBarcode == "") {
        //加载血袋信息
        LoadPackInfo(null, 1);
        return false;
    }
    PackBarcode = GetPackNo(PackBarcode, me.PackIdLength);
    $('#txt_XMPlan_BldSelectPack').val(PackBarcode);
    var ProductBarCode = GetProductBarCode($('#txt_XMPlan_BldProductBarcode').val());

    var packs = $("#XMBldPlanData").datagrid("getRows");
    Checkedflag = false;
    for (var i = 0; i < packs.length; i++) {
        var p = packs[i];
        if (p.PackBarcode == PackBarcode) {
            $("#XMBldPlanData").datagrid('checkRow', i);
            $("#XMBldPlanData").datagrid('selectRow', i);
            Checkedflag = true;
            xmplandr = p.RowID;
        }
    }
    if (!Checkedflag) {
        //进行后台匹配，检测同型同成分，检查成功后加载血袋信息
        QueryPackByPackBarcodeBldDo(PackBarcode, ProductBarCode);
    }
    return true;
}

//根据血袋条码，加载血袋信息
function QueryPackByPackBarcodeBldDo(PackBarcode, BloodProductDR) {
    //血型一致性检测
    var reqFormDto = GetObjectByID(me.ReqFormData.rows, me.CurrentReqFormDR);
    //var Products = reqFormDto.Others['Products'];
    // 申请血液成分
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
        param.ReqProductDRs.push(Products[i].split('@')[0]);
    }
    param.BloodGroupDR = me.CompositeBloodGroup.RowID;
    param.ProductBarcode = BloodProductDR;
    param.LisBloodGroupDR = me.PatientBloodGroup.RowID;
    param.IsBldDifficult = 1;

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
                    $("#XMBldPlanData").datagrid('unselectAll')
                    var pack = r[0];
                    //加载血袋信息
                    LoadPackInfo(r[0], 1);
                    //非交叉配血，则清空配血实验默认值
                    if (pack.IsXMatchProduct != "1") {
                        var plan = {};
                        plan.Pack = pack;
                        LoadXMPlanTestDo(pack, true);
                    } else {
                        //LoadProductDefMinorXMResult(pack.ProductBarcode);
                        //LoadProductDefXMMethod(pack.ProductBarcode);
                        //LoadXMPlanTestDo(me.DefaultXMTest, true);
                    }
                    $('#btn_XMTest_BldSave').focus(); //扫描条码后，聚焦在“保存”按钮
                } else if (r.length > 1) {
                    ///弹出血袋查询框
                    QueryPack(true, PackBarcode, 0);
                }
            } else {
                ///弹出血袋查询框
                //QueryPack(true);
                showError(rows[0].OutInfo);
            }
        },
        //在ajax发送之前禁止按钮，并且给出“正在处理”的提示
        beforeSend: function (XMLHttpRequest) {
            var e = e || window.event;
            //openLoading("txt_XMPlan_SelectPack", e);
            //$('#txt_XMPlan_SelectPack').attr('readonly', 'readonly');
            //$('#btn_XMTest_Save').linkbutton('disable');
        },
        //在ajax成功返回之后释放按钮，并且隐藏提示
        complete: function (XMLHttpRequest, textStatus) {
            closeLoading("txt_XMPlan_BldSelectPack");
            $('#txt_XMPlan_BldSelectPack').removeAttr('readonly');
            //$('#btn_XMTest_Save').linkbutton('enable');
        }
    });
}

///审核配血实验
function CheckTestBld(e) {
    var rows = $("#XMBldPlanData").datagrid('getChecked');
    if (rows.length < 1) {
        showInfo("请勾选配血计划！");
        return;
    }
    var PlanDRs = "";
    var Plans = [];
    var finished_Plans = [];
    var XMatchProductflag = "";
    //var medicalType = $('#BldmedicalType').combobox('getValue');
    for (var i = 0; i < rows.length; i++) {
        var plan = rows[i];
        if (plan.IsFinished == "1") {
            finished_Plans.push(plan.PackBarcode);
        }
        //var flag = CheckTestCheck(plan);
        //if (!flag) {
        //    return;
        //}
        if (plan.IsXMatchProduct == "1") {
            XMatchProductflag = "1";
        }

        var p = {};

        p.RowID = plan.RowID;
        p.Remark = $('#textarea_BldRemark').val();
        // p.MedicalInsuranceType=medicalType;
        Plans.push(p);
        PlanDRs += plan.RowID + "^";
    }

    if (finished_Plans.length > 0) {
        showInfo("您选择的配血计划（血袋条码“" + finished_Plans.join(',') + "”）已经被审核！");
        return;
    }
    var rowCom = $("#BldDifficultSend").combogrid('grid');
    var rowComgrid = rowCom.datagrid("getSelected")
    var StatusAfterDR = rowComgrid.StatusAfterDR;
    PlanDRs = PlanDRs.substring(0, PlanDRs.length - 1);
    var params = {};
    params.PlanDRs = PlanDRs;
    // 异型配血(XMatchProductflag=1)审核走强制换人登录弹窗，审核人由弹窗内登录人决定，原逻辑保留
	params.XMCheckUserDR=me.PlanCheckUserDR;
    //params.StatusAfterDR = StatusAfterDR;
    if (me.CheckXMPLanLogin == "Y") {
        if (XMatchProductflag == "1") {
            // 异型配血：保留强制换人登录（弹窗内登录人为审核人）
            showwin("#win_EntryLogin", "", "../form/frmCancelIssueLogin.aspx?funcode=CheckXMPlan&params=" + JSON.stringify(params), 420, 300, true);
            $('#win_EntryLogin').parent().css("background", "#FFFFFF");
            $('#win_EntryLogin').attr("class", "easyui-window panel-body panel-body-noheader panel-body-noborder");
        }
        else {
            // 修复：普通配血审核人=当前登录操作人，不使用审核登录残留身份
            params.XMCheckUserDR=SessionUserDR;
            CheckXMPlanBldDo(params);
        }
    }
    else {
        // 修复：普通配血审核人=当前登录操作人
        params.XMCheckUserDR=SessionUserDR;
        CheckXMPlanBldDo(params);
    }
}
function CheckXMPlanBldDo(params) {
    var rows = $("#XMBldPlanData").datagrid('getChecked');
    $.ajax({
        url: me.actionUrl + '?Method=CheckXMPlan',
        method: 'post',
        data: params,
        success: function (r) {
            if (r.IsOk) {
                //RefreshXMPlan();
                //配血计划审核，后保持勾选中（不刷新datagrid）
                ReloadXMPlanRowsDo(rows, true);

                //$('#btn_XMPlan_IssuePack').focus();
                showSlide(r.Message);

                //给审核成功的配血计划电子签名
                if (CA_Config_Open == "1" && WorkGroup_CA_Open == "1") {
                    var this_strClientCertID = AuthLogin_strClientCertID.lenth > 0 ? AuthLogin_strClientCertID : strClientCertID;
                    var this_strClientCert = AuthLogin_strClientCert.length > 0 ? AuthLogin_strClientCert : strClientCert;
                    var Plans = JSON.parse(params.Plans);
                    for (var i = 0; i < Plans.length; i++) {
                        if (Plans[i]["RowID"] != undefined && Plans[i]["RowID"].length > 0) {
                            SignXMPlan(this_strClientCertID, this_strClientCert, Plans[i]["RowID"]);
                        }
                    }
                }
            } else {
                showError(r.Message);
            }
        },
        //在ajax发送之前禁止按钮，并且给出“正在处理”的提示
        beforeSend: function (XMLHttpRequest) {
            var e = e || window.event;
            openLoading("btn_XMTest_BldCheck", e);
            $('#btn_XMTest_BldCheck').linkbutton('disable');
        },
        //在ajax成功返回之后释放按钮，并且隐藏提示
        complete: function (XMLHttpRequest, textStatus) {
            closeLoading("btn_XMTest_BldCheck");
            $('#btn_XMTest_BldCheck').linkbutton('enable');
            //            ChangeBtnStateByPlan(row);
        }
    });
}

//从后台更新指定的字段信息
function ReloadXMPlanRowsDo(rows, printxmmethod) {
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
                var rowDatas = $("#XMBldPlanData").datagrid('getRows');
                for (var j = 0; j < rowDatas.length; j++) {
                    if (r.rows[i].RowID == rowDatas[j].RowID) {
                        $("#XMBldPlanData").datagrid('updateRow', { index: j, row: r.rows[i] });
                    }
                }
            }
            if (printxmmethod) {
                PrintXMMethodDo(rows[0]);
            }
        }
    });
}


function PrintXMMethodDo(row, printflag) {
    if (!row) {
        var row = $("#XMBldPlanData").datagrid('getSelected');
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
        printXMMethodByHos(row.XMPlanNo);
    }
    else {
        if (me.IsAutoPrintXMMethod == "Y") {
            printXMMethodByHos(row.XMPlanNo);
        }
    }

}

//加载血袋信息 -------------------------------
function LoadPackInfoDo(pack) {
    var htm = '';
    me.IsCanCreatePlan = "Y";
    me.NotCreatePlanMessage = "";
    if (pack) {
        //血袋条码
        htm += '<span style="font-weight:bolder;">' + pack.PackBarcode + '</span>&nbsp;&nbsp;&nbsp;&nbsp;';
        //血液产品
        htm += pack.BloodProduct.CName + '&nbsp;&nbsp;&nbsp;&nbsp;';
        //血型组 
        var color = GetBdTypeColor(pack.BloodGroup.ABO, pack.BloodGroup.RH);
        htm += '<span  style="font-size:14px;font-weight:bolder;background-color:' + color.BackGroundColor + ';color:' + color.FontColor + '">' + pack.BloodGroup.CName + '</span>&nbsp;&nbsp;&nbsp;&nbsp;';
        //血量
        htm += pack.PackVolume + pack.BloodProduct.Units + '&nbsp;&nbsp;&nbsp;&nbsp;';
        //有效日期
        //  htm += ConvertDate(pack.ExpiredDate, 1) + " " + ConvertTime(pack.ExpiredTime) + '&nbsp;&nbsp;&nbsp;&nbsp;';
        //是否交叉配血
        if (pack.BloodProduct && pack.BloodProduct.IsXMatchProduct) {
            //htm += "需要进行交叉配血实验";
            $('#BldIsXMatchProduct').val(1);
        } else {
            $('#BldIsXMatchProduct').val("");
        }
        $('#BldIsBGChecked').val(pack.IsBGChecked);
        var packCheckABORes = ""; packCheckABOCode = ""; packCheckRHRes = ""; packCheckRHCode = "";
        if (pack.Others.packTestRes) {
            if (pack.Others.packTestRes.length > 0) {
                for (var i = 0; i < pack.Others.packTestRes.length; i++) {
                    if (pack.Others.packTestRes[i].TestCode.SCode.toUpperCase() == "ABO") {
                        packCheckABORes = pack.Others.packTestRes[i].Result;
                        packCheckABOCode = pack.Others.packTestRes[i].ResNotes.split("^")[0];
                    }
                    if (pack.Others.packTestRes[i].TestCode.SCode.toUpperCase() == "RH") {
                        packCheckRHRes = pack.Others.packTestRes[i].Result;
                        packCheckRHCode = pack.Others.packTestRes[i].ResNotes.split("^")[0];
                    }
                    if (pack.Others.packTestRes[i].ResNotes.split("^").length > 1) {
                        if (pack.Others.packTestRes[i].ResNotes.split("^")[1] != "N") {
                            me.IsCanCreatePlan = "N";
                            if (me.NotCreatePlanMessage == "") {
                                me.NotCreatePlanMessage = "检测项目[" + pack.Others.packTestRes[i].TestCode.CName + "],";
                            }
                            else {
                                me.NotCreatePlanMessage += "[" + pack.Others.packTestRes[i].TestCode.CName + "],";
                            }
                        }
                    }
                }
                if (me.NotCreatePlanMessage.length > 0) {
                    me.NotCreatePlanMessage += "结果异常,";
                }
            }
            color = GetBdTypeColor(packCheckABOCode, packCheckRHCode);
            if (color) {
                htm += '<span  style="font-size:14px;font-weight:bolder;background-color:' + color.BackGroundColor + ';color:' + color.FontColor + '">' + packCheckABORes + packCheckRHRes + '</span>&nbsp;&nbsp;&nbsp;&nbsp;';
            }
            if (packCheckABOCode != "" && packCheckRHCode != "") {
                if (packCheckABOCode != pack.BloodGroup.ABO || packCheckRHCode != pack.BloodGroup.RH) {
                    me.IsCanCreatePlan = "N";
                    me.NotCreatePlanMessage += "血液检测结果与血液入库结果不一致,";
                }
            }
        }
        //htm +='<img src="../../resource/common/images/menus/laborder.ico" onclick="SaveBdPackTestRes('+pack.RowID+');" title="血液复检" height="15" width="15" />';
        $('#BldcurrentPackDR').val(pack.RowID);
        $('#BldcurrentPackBarcode').val(pack.PackBarcode);
        $('#txt_XMPlan_BldSelectPack').val(pack.PackBarcode);
    } else {
        $('#BldcurrentPackDR').val("");
        $('#BldcurrentPackBarcode').val("");
        $('#BldIsXMatchProduct').val("");
    }
    $('#BldcurrentPack').html(htm);

}
///加载配血实验结果
//function LoadXMPlanTestDo(rowData, isNotLoadPack) {
//    if (!isNotLoadPack) {
//        $('#txt_XMPlan_BldSelectPack').val(rowData.PackBarcode);
//        // LoadPackInfo(rowData.Pack);
//        if (rowData.PackBarcode != "") {
//            var htm = "";
//            htm += '<span style="font-weight:bolder;">' + rowData.PackBarcode + '</span>&nbsp;&nbsp;&nbsp;&nbsp;';
//            //血液产品
//            htm += rowData.BloodProductName + '&nbsp;&nbsp;&nbsp;&nbsp;';
//            //血型组 
//            var color = GetBdTypeColor(rowData.ABO, rowData.RH);
//            htm += '<span  style="font-size:14px;font-weight:bolder;background-color:' + color.BackGroundColor + ';color:' + color.FontColor + '">' + rowData.BloodGroupName + '</span>&nbsp;&nbsp;&nbsp;&nbsp;';
//            //血量
//            htm += rowData.PackVolume + '&nbsp;&nbsp;&nbsp;&nbsp;';
//            //有效日期
//            //  htm += ConvertDate(pack.ExpiredDate, 1) + " " + ConvertTime(pack.ExpiredTime) + '&nbsp;&nbsp;&nbsp;&nbsp;';
//            //是否交叉配血
//            if (rowData.IsXMatchProduct == "1") {
//                //htm += "需要进行交叉配血实验";
//                $('#BldIsXMatchProduct').val(1);
//                //$('#btn_XMPlan_history').linkbutton('enable');

//            } else {
//                $('#BldIsXMatchProduct').val("");
//                //$('#btn_XMPlan_history').linkbutton('disable');
//            }
//            $('#BldcurrentPack').html(htm);
//            $('#BldcurrentPackDR').val(rowData.PackDR);
//            $('#BldcurrentPackBarcode').val(rowData.PackBarcode);
//        }
//        else {
//            $('#BldcurrentPackDR').val(rowData.PackDR);
//            $('#BldcurrentPackBarcode').val("");
//            $('#BldIsXMatchProduct').val("");
//            $('#BldcurrentPack').html("");
//        }
//    }
//     //if (rowData.Pack && !rowData.Pack.BloodProduct.IsXMatchProduct) {

//    $('#cmb_BBXMMethod').combobox('setValue', rowData.XMMethodDR);
//    $('#cmb_BTMIMachineParameter').combobox('setValue', rowData.MachineParameterDR);

//    $('#cmb_Major_BBXMDepict').combobox('setValue', rowData.MajorXMDepictDR);
//    $('#cmb_Major_BBXMConclusion').combobox('setValue', rowData.MajorXMConclusionDR);
//    $('#cmb_Major_BBXMResult').combobox('setValue', rowData.MajorXMResultDR);

//    $('#cmb_Minor_BBXMDepict').combobox('setValue', rowData.MinorXMDepictDR);
//    $('#cmb_Minor_BBXMConclusion').combobox('setValue', rowData.MinorXMConclusionDR);
//    $('#cmb_Minor_BBXMResult').combobox('setValue', rowData.MinorXMResultDR);

//    $('#cmb_BBXMLastResult').combobox('setValue', rowData.XMLastResultDR);
//    $('#textarea_BldRemark').val(rowData.BldDifficultDesc);
//    $('#BldDifficultSend').combogrid('setValue', rowData.TransactionDR);
//    LoadXMPlanTestDisableCofDo($('#BldIsXMatchProduct').val());
//}
///根据是否需要进行交叉配血来控制配血实验的结果的填写情况 TTTTT
function LoadXMPlanTestDisableCofDo(IsXMatchProduct) {
    if (!IsXMatchProduct) {
        $('#cmb_bbxmmethod').combobox('disable');
        $('#cmb_btmimachineparameter').combobox('disable');
        $('#cmb_major_bbxmdepict').combobox('disable');
        $('#cmb_major_bbxmconclusion').combobox('disable');
        $('#cmb_major_bbxmresult').combobox('disable');
        $('#cmb_minor_bbxmdepict').combobox('disable');
        $('#cmb_minor_bbxmconclusion').combobox('disable');
        $('#cmb_minor_bbxmresult').combobox('disable');
        $('#cmb_bbxmlastresult').combobox('disable');
    } else {
        $('#cmb_BBXMMethod').combobox('enable');
        $('#cmb_BTMIMachineParameter').combobox('enable');
        $('#cmb_Major_BBXMDepict').combobox('enable');
        $('#cmb_Major_BBXMConclusion').combobox('enable');
        $('#cmb_Major_BBXMResult').combobox('enable');
        $('#cmb_Minor_BBXMDepict').combobox('enable');
        $('#cmb_Minor_BBXMConclusion').combobox('enable');
        $('#cmb_Minor_BBXMResult').combobox('enable');
        $('#cmb_BBXMLastResult').combobox('enable');
    }
}
/// 保存配血计划
function SaveBldTest(event) {
    var rowData = $("#XMBldPlanData").datagrid('getSelected');
    if (rowData) {
        //修改
        var row = rowData;
    } else {
        var currentPack = $('#BldcurrentPackDR').val();
        if (!currentPack) {
            showInfo("请扫描血袋或者选中配血计划！");
            return;
        }
        //新增
        var reqFormDto = GetObjectByID(me.ReqFormData.rows, me.CurrentReqFormDR);
        var row = {
            RowID: 0,
            ReqFormDR: me.CurrentReqFormDR,
            PackDR: currentPack,
            SampleNo: reqFormDto.SampleNo,
            PackBarcode: $('#BldcurrentPackBarcode').val()
        };
    }
    //if (me.IsCanCreatePlan == "N") {
    //    showInfo(me.NotCreatePlanMessage + "不能进行配血！");
    //    return;
    //}
    var Plan = GeneratePlanFromRowDo(row);
    if (!Plan) {
        return;
    }
    SaveTestBldDo(Plan, row);
}

function SaveTestBldDo(Plan, row) {
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
    plan.P13 = Plan.BldDifficultDesc;
    plan.P14 = Plan.IsBldDifficult;

    params.Plan = JSON.stringify(plan);
    params.RowID = Plan.RowID;
    params.ReqFormDR = me.CurrentReqFormDR;
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
                // 疑难
                row.BldDifficultDesc = Plan.BldDifficultDesc;
                row.IsBldDifficult = Plan.IsBldDifficult;
                //
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
                    UpdateRow($("#XMBldPlanData"), row.RowID, row);
                    // 修复：保存成功后从服务端回读该行，刷新配血人(AddUser)/配血时间(AddDate)等字段，避免界面残留上次配血人
                    ReloadXMPlanRowsDo([row]);
                    $('.packtrack').linkbutton({ plain: true, iconCls: 'icon-track' });
                    closeLoading("btn_XMTest_BldSave");
                    $('#btn_XMTest_BldSave').linkbutton('enable');
                } else {
                    //加载新增的行
                    LoadAddedXMPlanDo(row);
                }
            } else {
                showError(r.Message);
                closeLoading("btn_XMTest_BldSave");
                $('#btn_XMTest_BldSave').linkbutton('enable');
            }
        },
        //在ajax发送之前禁止按钮，并且给出“正在处理”的提示
        beforeSend: function (XMLHttpRequest) {
            var e = e || window.event;
            //openLoading("btn_XMTest_BldSave", e);
            $('#btn_XMTest_BldSave').linkbutton('disable');
        },
        //在ajax成功返回之后释放按钮，并且隐藏提示
        complete: function (XMLHttpRequest, textStatus) {

            //            ChangeBtnStateByPlan(row);
        }
    });
}

///根据配血计划选中行构建基本的配血计划
function GeneratePlanFromRowDo(row) {
    var Plan = {};
    Plan.RowID = row.RowID;
    Plan.ReqFormDR = row.ReqFormDR;
    Plan.PackDR = row.PackDR;
    Plan.SampleNo = row.SampleNo;
    Plan.PackBarcode = row.PackBarcode;
    Plan.XMPlanNo = row.XMPlanNo;

    Plan.XMMethodDR = $('#cmb_BBXMMethod').combobox('getValue');

    Plan.MachineParameterDR = $('#cmb_BTMIMachineParameter').combobox('getValue');

    Plan.MajorXMDepictDR = $('#cmb_Major_BBXMDepict').combobox('getValue');
    Plan.MajorXMDepictStr = $('#cmb_Major_BBXMDepict').combobox('getText');

    Plan.MajorXMConclusionDR = $('#cmb_Major_BBXMConclusion').combobox('getValue');
    Plan.MajorXMConclusionStr = $('#cmb_Major_BBXMConclusion').combobox('getText');

    Plan.MajorXMResultDR = $('#cmb_Major_BBXMResult').combobox('getValue');
    Plan.MajorXMResultStr = $('#cmb_Major_BBXMResult').combobox('getText');

    Plan.MinorXMDepictDR = $('#cmb_Minor_BBXMDepict').combobox('getValue');
    Plan.MinorXMDepictStr = $('#cmb_Minor_BBXMDepict').combobox('getText');

    Plan.MinorXMConclusionDR = $('#cmb_Minor_BBXMConclusion').combobox('getValue');
    Plan.MinorXMConclusionStr = $('#cmb_Minor_BBXMConclusion').combobox('getText');

    Plan.MinorXMResultDR = $('#cmb_Minor_BBXMResult').combobox('getValue');
    Plan.MinorXMResultStr = $('#cmb_Minor_BBXMResult').combobox('getText');

    Plan.XMLastResultDR = $('#cmb_BBXMLastResult').combobox('getValue');
    Plan.XMLastResultStr = $('#cmb_BBXMLastResult').combobox('getText');
    Plan.CheckBloodGroupRes = me.CompositeBloodGroup.CName;
    Plan.AntibodyScreenRes = $('#patientBloodSAS').html();
    var medicalType = ""; //$('#BldmedicalType').combobox('getValue');
    Plan.MedicalInsuranceType = medicalType;  
    Plan.BldDifficultDesc = $('#textarea_BldRemark').val();
    Plan.IsBldDifficult = 1;

    return Plan;
}

//加载新增的行
function LoadAddedXMPlanDo(row) {
    $.ajax({
        url: me.actionUrl + '?Method=LoadXMPlanByPack',
        method: 'post',
        data: { PackDR: row.PackDR, ReqFormDR: row.ReqFormDR },
        success: function (reuslt) {
            r = reuslt.rows[0];
            //me.XMPlanGrid.datagrid('appendRow', r);
            $("#XMBldPlanData").datagrid('insertRow', {
                index: 0, // 索引从0开始
                row: r
            });
            $("#XMBldPlanData").datagrid("fixRownumber");
            //勾选中
            var index = GetIndexByRowID($("#XMBldPlanData"), r.RowID);
            $("#XMBldPlanData").datagrid('selectRow', index);
            $("#XMBldPlanData").datagrid('checkRow', index);
            //审核按钮聚焦
            // $('#btn_XMTest_Check').focus();
            ////清空 血袋条码输入框
            $('#txt_XMPlan_BldSelectPack').val('');
            $('#txt_XMPlan_ProductBarcode').val('');
            $('#txt_XMPlan_BldSelectPack').focus();
        },
        //在ajax成功返回之后释放按钮，并且隐藏提示
        complete: function (XMLHttpRequest, textStatus) {
            closeLoading("btn_XMTest_BldSave");
            $('#btn_XMTest_BldSave').linkbutton('enable');
        }
    });
}

////加载费用
function LoadCostItemDo() {
    var rows = $("#XMBldPlanData").datagrid('getRows');
    var ReqCost = [];
    if (rows.length > 0) {
        var row = rows[0];
        row.CostItemInfo = row.ReqCostItemInfo;
        ReqCost.push(rows[0]);
    }
    var fees = GenerateCostTypeHash(ReqCost);
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

///加载配血实验结果
function LoadXMPlanTestDo(rowData, isNotLoadPack) {
    if (!isNotLoadPack) {
        $('#txt_XMPlan_BldSelectPack').val(rowData.PackBarcode);
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
                $('#BldIsXMatchProduct').val(1);
                //$('#btn_XMPlan_history').linkbutton('enable');

            } else {
                $('#BldIsXMatchProduct').val("");
                //$('#btn_XMPlan_history').linkbutton('disable');
            }
            $('#BldcurrentPack').html(htm);
            $('#BldcurrentPackDR').val(rowData.PackDR);
            $('#BldcurrentPackBarcode').val(rowData.PackBarcode);
        }
        else {
            $('#BldcurrentPackDR').val(rowData.PackDR);
            $('#BldcurrentPackBarcode').val("");
            $('#BldIsXMatchProduct').val("");
            $('#BldcurrentPack').html("");
        }
    }
    // if (rowData.Pack && !rowData.Pack.BloodProduct.IsXMatchProduct) {

    $('#cmb_BBXMMethod').combobox('setValue', rowData.XMMethodDR);
    $('#cmb_BTMIMachineParameter').combobox('setValue', rowData.MachineParameterDR);

    $('#cmb_Major_BBXMDepict').combobox('setValue', rowData.MajorXMDepictDR);
    $('#cmb_Major_BBXMConclusion').combobox('setValue', rowData.MajorXMConclusionDR);
    $('#cmb_Major_BBXMResult').combobox('setValue', rowData.MajorXMResultDR);

    $('#cmb_Minor_BBXMDepict').combobox('setValue', rowData.MinorXMDepictDR);
    $('#cmb_Minor_BBXMConclusion').combobox('setValue', rowData.MinorXMConclusionDR);
    $('#cmb_Minor_BBXMResult').combobox('setValue', rowData.MinorXMResultDR);

    $('#cmb_BBXMLastResult').combobox('setValue', rowData.XMLastResultDR);
    $('#textarea_BldRemark').val(rowData.BldDifficultDesc);

    var data = $('#BldDifficultSend').combogrid('grid').datagrid('getRows');
    if (rowData.IsBldDifficult == "1" && rowData.PackStatusName == "库存") {
    }
    else {
        for (var i = 0; i < data.length; i++) {
            if (data[i].CName == rowData.PackStatusName) {
                $('#BldDifficultSend').combogrid('setValue', data[i].RowID);
            }
        }
    }

    LoadXMPlanTestDisableCofDo($('#BldIsXMatchProduct').val());
}


function LoadIsDifficultBase() {
    var OrBBXMMethod = ObjClone(me.OrBBXMMethod);
    $('#cmb_BBXMMethod').combobox({
        width: 120,
        data:OrBBXMMethod,
        valueField: 'RowID',
        textField: 'CName',
        panelHeight: 'auto',
        editable: false,
        onSelect: function (record) {
        }
    });
    var CmbBTMIMachineParameter = ObjClone(me.BTMIMachineParameter);
    $('#cmb_BTMIMachineParameter').combobox({
        width: 120,
        data: CmbBTMIMachineParameter,
        valueField: 'RowID',
        textField: 'CName',
        panelHeight: 'auto',
        editable: true
    });
    var MajorBBXMDepict = ObjClone(me.CmbBBXMDepict);
    $('#cmb_Major_BBXMDepict').combobox({
        width: 100,
        data: MajorBBXMDepict,
        valueField: 'RowID',
        textField: 'CName',
        panelHeight: 'auto',
        editable: false
    });
    var MinorBBXMDepict = SetSelectedByIsDefault(ObjClone(me.CmbBBXMDepict));
    $('#cmb_Minor_BBXMDepict').combobox({
        width: 100,
        data: MinorBBXMDepict,
        valueField: 'RowID',
        textField: 'CName',
        panelHeight: 'auto',
        editable: false
    });
    var MajorBBXMConclusion = ObjClone(me.CmbBBXMConclusion);
    $('#cmb_Major_BBXMConclusion').combobox({
        width: 70,
        data: MajorBBXMConclusion,
        valueField: 'RowID',
        textField: 'CName',
        panelHeight: 'auto',
        editable: false
    });
    var MinorBBXMDepict = SetSelectedByIsDefault(ObjClone(me.CmbBBXMConclusion));
    $('#cmb_Minor_BBXMConclusion').combobox({
        width: 70,
        data: MinorBBXMDepict,
        valueField: 'RowID',
        textField: 'CName',
        panelHeight: 'auto',
        editable: false
    });
    var MajorBBXMResult = ObjClone(me.CmbBBXMResult);
    $('#cmb_Major_BBXMResult').combobox({
        width: 50,
        data: MajorBBXMResult,
        valueField: 'RowID',
        textField: 'CName',
        panelHeight: 'auto',
        editable: false
    });
    var MinorBBXMResult = ObjClone(me.CmbBBXMResult);
    $('#cmb_Minor_BBXMResult').combobox({
        width: 50,
        data: MinorBBXMResult,
        valueField: 'RowID',
        textField: 'CName',
        panelHeight: 'auto',
        editable: false
    });
    var CmbBBXMLastResult = ObjClone(me.CmbBBXMLastResult);
    $('#cmb_BBXMLastResult').combobox({
        width: 50,
        data: CmbBBXMLastResult,
        valueField: 'RowID',
        textField: 'CName',
        panelHeight: 'auto',
        editable: false
    });
}

///删除配血计划
function DeleteXMPlanDifficult(row) {
    $.messager.confirm('确认', '确定删除血袋条码为“' + row.PackBarcode + '”的配血计划?', function (r) {
        if (r) {
            $.ajax({
                url: me.actionUrl + '?Method=DeleteXMPlan',
                method: 'post',
                data: { XMPlanDR: row.RowID },
                success: function (r) {
                    if (r.IsOk) {
                        showSlide(r.Message, 3000);
                        DeleteXMPlanGridD(row);
                        //UpdateReqFormByDeleteXMPlan(row);
                        //清空血袋信息
                        $('#txt_XMPlan_BldSelectPack').val('');
                        LoadPackInfoBld(null, 0);
                    } else {
                        showError(r.Message);
                    }
                },
                //在ajax发送之前禁止按钮，并且给出“正在处理”的提示
                beforeSend: function (XMLHttpRequest) {

                },
                //在ajax成功返回之后释放按钮，并且隐藏提示
                complete: function (XMLHttpRequest, textStatus) {

                }
            });
        }
    });
}

///去掉XMBldPlanData中对应行数据
function DeleteXMPlanGridD(row) {
    DeleteRow($("#XMBldPlanData"), row.RowID);
}
