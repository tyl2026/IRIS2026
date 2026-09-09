/*******************************************************
* 功能介绍：配血计划
* 创建人： 曾文天
* 创建日期：2015/11/17
**********************************************************/

//公共变量初始化
var me = {
    //全局数据
    ReqFormData: null,
    XMPlanData: null,
    BldXMPlanData: null,
    PackData: null,
    CancelReasonsData: null,
    CancelIssueReasonsData: null,

    //全局数据表
    ReqFormGrid: null,
    XMPlanGrid: null,
    PackGrid: null,
    CancelReasonsGrid: null,
    CancelIssueReasonsGrid: null,

    CurrentReqFormDR: -1,
    CurrentXMPlanDR: -1,
    CurrentTakeRecordDR: -1,

    PatientBloodGroup: null,
    CompositeBloodGroup: null,
    PatientBloodSAS: null,
    Products: null,
    CostItems: null,

    //权限
    funSave: FunSave,
    funDelete: FunDelete,
    funUpdate:FunUpdate,
    funCreate: FunCreate,
    funCheck: FunCheck,
    funUnCheck: FunUnCheck,
    funIssue: FunIssue,
    funUnIssue: FunUnIssue,
    funPrint: FunPrint,
    funIssueOver: FunIssueOver,
    CheckLogin: CheckLogin,
    XMPlanLog: XMPlanLog,
    funPrintXMMethod: FunPrintXMMethod,
    FunXMatch: FunXMatch,
    PackIdLength: "", //血袋编码长度（目前只支持一个血液条码长度）
    IsFunDifficult: IsFunDifficult,
    idFeild: 'RowID',
    //统计标志
    statisticFlag: false,
    //过滤显示标志,是否只显示有数据的过滤条件
    filterShowPartFlag: true,
    actionUrl: '../ashx/ashBdXMPlan.ashx',
    actionCodeTableUrl: '../../sys/ashx/ashCodeTable.ashx',
    actionUrlReportQuery: '../../lis/ashx/ashReportQuery.ashx',
    actionUrlVisitNumberReport: '../../lis/ashx/ashVisitNumberReport.ashx',
    actionUrlPackInStorage: "../ashx/ashBdPackIn.ashx",
    //标识审核按钮的timer
    EntryButtonTimer: "",
    //标识初审用户是否登录,Y代表登录,N代表未登录
    IsEntryLogon: "N",
    //审核用户是否可以一致  N不能一样,否则可以一样
    IsCheckUserSame: "Y",
    //取消审核人是否必须和审核人一致,Y取消审核必须和审核一致，否则可以不一致
    IsUnCheckUserSame: "N",
    SessionUserDR: SessionUserDR,
    //是否显示取血单血量
    IsShowTakeComponentsVol: "N",
    MachineParameterDR: "",
    RegNo: "",
    AdmId: "",
    NewAdmId: "",
    ReqFormNo: "",
    IsEmergencyCheckProduct: "Y", //急诊用血是否限制血产品 N不限制血成分，否则不限制
    Labno: "-1",
    IsAutoPrintPackBarCode: "N",  //是否自动打印血液标签,Y自动打印，否则默认不打印
    IsShowPackCost: "",  //发血前是否显示血液收费汇总Y显示费用汇总，否则不显示
    IsCanCreatePlan: "Y", //是否可以创建配血计划
    IsPromptIssuePackVol: "",
    IsNeedSASRes: "", //配血是否必须有抗筛结果
    NotCreatePlanMessage: "",
    IsAutoPrintXMMethod: "", //是否自动打印配血单，Y自动打印，否则不打印
    queryType: "",
    IsMultiPackSpcimen: "", //血液血标本是否可以多次关联
    CancelIssueLogin: "", //取消发血是否需要登录取消发血人，Y需要登录，否则不需要
    IssueLogin: "", //发血是否需要登录发血人，Y需要登录，否则不需要,
    PlanAddUserDR: "",  //配血用户
    ProductMinorXMResult: [],
    CheckXMPLanLogin: "",
    ShowMedicalType: "",
    ProductXMMethod: [],
    IsBldFreezer: "", //是否开启海尔冰箱
    IssueScanBarCode: "", //发血时是否扫码出库
    //配血审核用户
    PlanCheckUserDR: "",
    IsCheckAuthUserPassword:"1",  //1审核登录需要验证密码
    IsTakeUserName: "", //取血人验证是否开启
    funUnCharge: FunUnCharge,
    IsBindTakeRec:""
};

//页面加载
$(function () {
    getBdConfig(); //获取血库配置参数
    pageInitCommon();
    pageInit();
    loadGrid(); 
});

//页面初始化
function pageInit() {
    me.PackGrid = $('#PackGrid');
    me.CancelReasonsGrid = $('#CancelReasonsGrid');
    me.CancelIssueReasonsGrid = $('#CancelIssueReasonsGrid');
    //权限控制
    me.funDelete ? $('#PatDiffDel').show() : $('#PatDiffDel').hide();
    me.funUpdate ? $('#PatDiffEdit').show() : $('#PatDiffEdit').hide(); 
    me.funCreate ? $('#btn_XMPlan_save').show() : $('#btn_XMPlan_save').hide();
    me.funSave ? $('#btn_XMTest_Save').show() : $('#btn_XMTest_Save').hide();
    me.funCheck ? $('#btn_XMTest_Check').show() : $('#btn_XMTest_Check').hide();
    me.funUnCheck ? $('#btn_XMTest_UnCheck').show() : $('#btn_XMTest_UnCheck').hide();
    me.funIssue ? $('#btn_XMPlan_IssuePack').show() : $('#btn_XMPlan_IssuePack').hide();
    me.funUnIssue ? $('#btn_XMPlan_CancelIssuePack').show() : $('#btn_XMPlan_CancelIssuePack').hide();
    me.funPrint ? $('#btn_XMPlan_Print').show() : $('#btn_XMPlan_Print').hide();
    me.funIssueOver ? $('#btn_XMPlan_IssuePackOver').show() : $('#btn_XMPlan_IssuePackOver').hide();
    me.CheckLogin ? $('#btn_EntryLogin').show() : $('#btn_EntryLogin').hide();
    me.XMPlanLog ? $('#btn_XMPlan_history').show() : $('#btn_XMPlan_history').hide();
    me.funPrintXMMethod ? $('#btn_Print_XMMethod').show() : $('#btn_Print_XMMethod').hide();
    me.FunXMatch ? $("#lblXMatch").css("display", "") : $("#lblXMatch").css("display", "none");
     
    me.IsFunDifficult ? $('#tt').tabs('enableTab', 3) : $('#tt').tabs('disableTab', 3);
    $('#btn_AddPack').click(function () { CheckPack() });
    $('#btn_Issue').click(function () { IssueLogin() });

    $('#btn_reqformVisitOk').click(function () { UpdateReqFormSampleNo(); });
    $('#btn_reqformVisitCancel').click(function () { $('#divReqFormVisit').window('close'); });

    RegInterKeyCode('txt_AddPack', CheckPack);
    RegInterKeyCode('txt_XMPlan_SelectPack', XMPlanSelectPack);
    // add jc 10.24 19:18
    RegInterKeyCode('txt_XMPlan_BldSelectPack', LoadPackInfoBld);

    $('input:checkbox[name=chkTimeLimit]').click(function () {
        if ($('input:checkbox[name=chkTimeLimit]')[0].checked) {
            $('#dt_SttDate').datebox({ disabled: false });
            $('#dt_EndDate').datebox({ disabled: false });
        }
        else {
            $('#dt_SttDate').datebox({ disabled: true });
            $('#dt_EndDate').datebox({ disabled: true });
        }
    });
 

    $('#BldDifficultSend').combogrid({
        url: '../ashx/ashBdpackComm.ashx?Method=GetBBTransStatus&BBTransCode=PackDifficult',
        method: 'get',
        panelWidth: 60,
        idField: 'RowID',
        textField: 'CName',
        columns: [[
        //{ field: 'RowID', title: 'ID', width: 40, sortable: true, align: 'center' },
        //{ field: 'Code', title: '代码', width: 70, sortable: true, align: 'center' },
        {field: 'CName', title: '名称', width: 50, sortable: true, align: 'center' }
        ]],
        onLoadSuccess: function (data) {
            $('#BldDifficultSend').combogrid('setValue', data.rows[0].RowID);
        }

    });
   $('#medicalType').combobox({
        data: eval('[{"id":"1","text":"是"},{"id":"0","text":"否" }]'),
        valueField: 'id',
        textField: 'text'
   });
    //医院信息
    $.ajax({
        type: "post",
        dataType: "json", //text, json, xml
        cache: false, //
        async: false, //为true时，异步，不等待后台返回值，为false时强制等待；-asir
        url: me.actionCodeTableUrl + "?Model=BTHospital&GlobalParam=RowID:" + hospitalDR + "&Method=QueryView&pagination=false",
        success: function (returnData) {
            me.HospitalData = returnData.rows[0];
            if (me.HospitalData.BBHospitalDR == "") {
                ///配血方法
                me.BBXMMethod = LIS.Cache.GetCacheData("BBXMMethod", true, true);
                me.OrBBXMMethod = me.BBXMMethod;
                LoadBBXMMethod();
            }
            else {
                $.ajax({
                    type: "post",
                    dataType: "json", //text, json, xml
                    cache: false, //
                    async: false, //为true时，异步，不等待后台返回值，为false时强制等待；-asir
                    url: me.actionCodeTableUrl + "?Model=BBXMMethod&GlobalParam=Active:1,HospitalDR:" + me.HospitalData.BBHospitalDR + "&Method=QueryView&pagination=false",
                    success: function (returnData) {
                        returnData = returnData.rows;
                        me.BBXMMethod = returnData;
                        me.OrBBXMMethod = returnData;
                        LoadBBXMMethod();
                    }
                });
            }
        }
    });
    ///配血现象
    me.CmbBBXMDepict=me.BBXMDepict = LIS.Cache.GetCacheData("BBXMDepict", false, true);
    //me.CmbBBXMDepict = LIS.Cache.GetCacheData("BBXMDepict", false, true);
    
    ///配血结果
    me.CmbBBXMResult=me.BBXMResult = LIS.Cache.GetCacheData("BBXMResult", false, true);
    //me.CmbBBXMResult = LIS.Cache.GetCacheData("BBXMResult", false, true); 
    ///配血结论
    me.CmbBBXMConclusion =me.BBXMConclusion = LIS.Cache.GetCacheData("BBXMConclusion", false, true);
    //me.CmbBBXMConclusion = LIS.Cache.GetCacheData("BBXMConclusion", false, true);
     
    ///配血最终结果
    me.CmbBBXMLastResult = me.BBXMLastResult = LIS.Cache.GetCacheData("BBXMLastResult", false, true);
    //me.CmbBBXMLastResult = LIS.Cache.GetCacheData("BBXMLastResult", false, true);
       
    ///配血仪器
    LoadMachineParameter(); 
    //LoadBBXMMethod();
    LoadBTMIMachineParameter();
    LoadPackBTMIMachineParameter();
    LoadMajorBBXMDepict();
    LoadMinorBBXMDepict();
    LoadMajorBBXMConclusion();
    LoadMinorBBXMConclusion();
    LoadMajorBBXMResult();
    LoadMinorBBXMResult();
    LoadBBXMLastResult();
    LoadUploadMachineParameter();
    LoadReUploadMachineParameter();
    LoadIsDifficultBase();
}


//加载数据列表
function loadGrid() {
    ///加载已接收的输血申请单
    LoadReqForm();
    RefreshReqForm();
    ///加载配血计划
    LoadXMPlan();
    ///加载取消配血计划原因
    LoadCancelReason();
    ///加载取消发血原因
    LoadCancelIssueReason();
    //LoadXMPlanHistory();
    loadPlanCostGrid();
}

//根据当前选择的配血计划设定按钮状态（是否可用）
function ChangeBtnStateByPlan(rowData) {
    //    ChangeBtnToUnable();
    //    if (!rowData.IsFinished) {
    //        $('#btn_XMPlan_Delete').linkbutton('enable');
    //        $('#btn_XMTest_Save').linkbutton('enable');
    //        $('#btn_XMTest_Check').linkbutton('enable');
    //    } else {
    //        $('#btn_XMTest_UnCheck').linkbutton('enable');
    //        $('#btn_XMPlan_Inform').linkbutton('enable');
    //    }
}


//将按钮设置为不可用
function ChangeBtnToUnable() {
    $('#btn_XMTest_Save').linkbutton('disable');
    $('#btn_XMTest_Check').linkbutton('disable');
    $('#btn_XMTest_UnCheck').linkbutton('disable');
    $('#btn_XMPlan_Delete').linkbutton('disable');
    $('#btn_XMPlan_Inform').linkbutton('disable');
}


//打印配血计划
function PrintXMPlan(XMPlanDR) {
    var rowData = me.XMPlanGrid.datagrid('getSelected');
    if (!rowData) {
        showInfo("请选择配血计划！");
        return;
    }
    var XMPlanDR = rowData.Plan.RowID;

    showInfo("功能正在完善中...");
    return;

    var claName = "HIS.DHCReportPrintXM";
    var funName = "QueryPrintData";
    var printFlag = "0";       ///0:打印所有报告 1:循环打印每一份报告
    var printType = "PrintPreview";    ///PrintOut:打印  PrintPreview打印预览
    var paramList = "1";               ///1:报告处理打印 2:自助打印 3:医生打印
    ExePrint(XMPlanDR, claName, funName, printFlag, printType, paramList);
}
function getBdConfig() {
    $.ajax({
        type: "post",
        dataType: "json", //text, json, xml
        cache: false, //
        async: false, //为true时，异步，不等待后台返回值，为false时强制等待；-asir
        url: "../../sys/ashx/ashSYSBDParamters.ashx" + "?Method=FindByCode&ParaType=WG" + "&CodeString=IsAutoPrintPackBarCode^IsCheckUserSame^IsShowPackCost^IsEmergencyCheckProduct^IsUnCheckUserSame^IsPromptIssuePackVol^IsNeedSASRes^IsAutoPrintXMMethod^IsMultiPackSpcimen^CancelIssueLogin^IssueLogin^CheckXMPLanLogin^IssueScanBarCode^BldFreezer^IsTakeUserName&ParaList=ProductMinorXMResult^ProductXMMethod",
        success: function (returnData) {
            if (returnData.length > 0) {
                for (var i = 0; i < returnData.length; i++) {
                    if (returnData[i].Code == "IsAutoPrintPackBarCode" && returnData[i].RowID > 0) {
                        me.IsAutoPrintPackBarCode = returnData[i].ParaValue;
                    }
                    if (returnData[i].Code == "IsCheckUserSame" && returnData[i].RowID > 0) {
                        me.IsCheckUserSame = returnData[i].ParaValue;
                    }
                    if (returnData[i].Code == "IsShowPackCost" && returnData[i].RowID > 0) {
                        me.IsShowPackCost = returnData[i].ParaValue;
                    }
                    if (returnData[i].Code == "IsEmergencyCheckProduct" && returnData[i].RowID > 0) {
                        me.IsEmergencyCheckProduct = returnData[i].ParaValue;
                    }
                    if (returnData[i].Code == "IsUnCheckUserSame" && returnData[i].RowID > 0) {
                        me.IsUnCheckUserSame = returnData[i].ParaValue;
                    }
                    if (returnData[i].Code == "IsPromptIssuePackVol" && returnData[i].RowID > 0) {
                        me.IsPromptIssuePackVol = returnData[i].ParaValue;
                    }
                    if (returnData[i].Code == "IsNeedSASRes" && returnData[i].RowID > 0) {
                        me.IsNeedSASRes = returnData[i].ParaValue;
                    }
                    if (returnData[i].Code == "IsAutoPrintXMMethod" && returnData[i].RowID > 0) {
                        me.IsAutoPrintXMMethod = returnData[i].ParaValue;
                    }
                    if (returnData[i].Code == "IsMultiPackSpcimen" && returnData[i].RowID > 0) {
                        me.IsMultiPackSpcimen = returnData[i].ParaValue;
                    }
                    if (returnData[i].Code == "CancelIssueLogin" && returnData[i].RowID > 0) {
                        me.CancelIssueLogin = returnData[i].ParaValue;
                    }
                    if (returnData[i].Code == "IssueLogin" && returnData[i].RowID > 0) {
                        me.IssueLogin = returnData[i].ParaValue;
                    }
                    //if (returnData[i].ParaList == "ProductMinorXMResult" && returnData[i].RowID > 0) {
                        //me.ProductMinorXMResult.push(returnData[i]);
                    //}
                    if (returnData[i].Code == "CheckXMPLanLogin" && returnData[i].RowID > 0) {
                        me.CheckXMPLanLogin = returnData[i].ParaValue;
                    }
                    
                    if (returnData[i].ParaList == "ProductXMMethod" && returnData[i].RowID > 0) {
                        me.ProductXMMethod.push(returnData[i]);
                    }
                    if (returnData[i].Code == "IssueScanBarCode" && returnData[i].RowID > 0) {
                        me.IssueScanBarCode = returnData[i].ParaValue;
                    }
                    if (returnData[i].Code == "BldFreezer" && returnData[i].RowID > 0) {
                        me.IsBldFreezer = returnData[i].ParaValue;
                    }
                    if (returnData[i].Code == "IsTakeUserName" && returnData[i].RowID > 0) {
                        me.IsTakeUserName = returnData[i].ParaValue;
                    }
                    if (returnData[i].Code == "IsBindTakeRec" && returnData[i].RowID > 0) {
                        me.IsBindTakeRec = returnData[i].ParaValue;
                    }
                    
                }
            }
        }
    }); 
    $.ajax({
        type: "post",
        dataType: "json", //text, json, xml
        cache: false, //
        async: false, //为true时，异步，不等待后台返回值，为false时强制等待；-asir
        url: me.actionCodeTableUrl + "?Model=SYSParameter&GlobalParam=Code:ShowMedicalType,ParaType:HOS&Method=QueryView&sort=Sequence&order=asc&pagination=false",
        success: function (returnData) {
            if (returnData.length > 0) { 
                    me.ShowMedicalType = returnData[0].ParaValue;
                    if (me.ShowMedicalType != "1") {
                        $("#divmedicalType").attr("style", "display:none;");
                    } 
              }
                else {
                    $("#divmedicalType").attr("style", "display:none;");
                }
                 
        }
    });
	$.ajax({
        type: "post",
        dataType: "json", //text, json, xml
        cache: false, //
        async: false, //为true时，异步，不等待后台返回值，为false时强制等待；-asir
        url: me.actionCodeTableUrl + "?Model=SYSParameter&GlobalParam=ParaList:ProductMinorXMResult&Method=QueryView&sort=Sequence&order=asc&pagination=false",
        success: function (returnData) {
            if (returnData.rows.length > 0) { 
                    me.ProductMinorXMResult=returnData.rows;
              }     
        }
    });
}



