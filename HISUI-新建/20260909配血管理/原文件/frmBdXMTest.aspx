
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>
    <title>配血实验</title>
    <script type="text/javascript"> 
        //权限控制 
        //已审核登录的证书
        var AuthLogin_strClientCert = "";
        //审核登录的证书ID
        var AuthLogin_strClientCertID = ""; 
    </script>
    <link rel="shortcut icon" href="../../resource/common/images/favicon.ico" />
    <script type="text/javascript">
    </script>
    <script src="../../resource/common/js/easyuicss.js" type="text/javascript"></script>
    <link href="../../resource/easyui/themes/icon.css" rel="stylesheet" type="text/css" />
    <link href="../../resource/common/css/FormStyle.css" rel="stylesheet" type="text/css" />
    <link href="../css/cssBd.css" rel="stylesheet" type="text/css" />
    <link href="../../resource/plug/font-awesome-4.3.0/css/font-awesome.min.css" rel="stylesheet" />
    <script src="../../resource/common/js/lis-common.js?version=0.11" type="text/javascript"></script>
    <script language="javascript" type="text/javascript">
        LISSYSPageCommonInfo.Init();
        var BasePath = '';
        var ResourcePath = '';
        var UserDR = LISSYSPageCommonInfo.Data.Sesssion.UserDR;
        var FunSave = LISSYSPageCommonInfo.Data.Function.Save == 'True' ? true : false;
        var FunDelete = LISSYSPageCommonInfo.Data.Function.Delete == 'True' ? true : false;
        var FunCreate = LISSYSPageCommonInfo.Data.Function.Create == 'True' ? true : false;
        var FunCheck = LISSYSPageCommonInfo.Data.Function.Auth == 'True' ? true : false;
        var FunUnCheck = LISSYSPageCommonInfo.Data.Function.AuthUndo == 'True' ? true : false;
        var FunIssue = LISSYSPageCommonInfo.Data.Function.Issue == 'True' ? true : false;
        var FunUnIssue = LISSYSPageCommonInfo.Data.Function.UnIssue == 'True' ? true : false;
        var FunPrint = LISSYSPageCommonInfo.Data.Function.Print == 'True' ? true : false;
        var FunIssueOver = LISSYSPageCommonInfo.Data.Function.IssueOver == 'True' ? true : false;
        var CheckLogin = LISSYSPageCommonInfo.Data.Function.CheckLogin == 'True' ? true : false;
        var XMPlanLog = LISSYSPageCommonInfo.Data.Function.XMPlanLog == 'True' ? true : false;
        var FunPrintXMMethod = LISSYSPageCommonInfo.Data.Function.PrintMetho == 'True' ? true : false;
        var FunXMatch = LISSYSPageCommonInfo.Data.Function.XMatch == 'True' ? true : false;
	    var IsFunDifficult = LISSYSPageCommonInfo.Data.Function.IsBldDifficult == 'True' ? true : false;
        var IsKeepAuth=LISSYSPageCommonInfo.Data.Function.IsKeepAuth  ///是否保持审核登录信息
        var FunUnCharge = LISSYSPageCommonInfo.Data.Function.UnCharge == 'True' ? true : false;
        var CSPAddress = LISSYSPageCommonInfo.Data.CSPAddress;
        var UserDR = LISSYSPageCommonInfo.Data.Sesssion.UserDR;
        var FunUpdate= LISSYSPageCommonInfo.Data.Function.Update == 'True' ? true : false;
             //是否开启CA
        var CA_Config_Open = LISSYSPageCommonInfo.Data.CA_Config_Open;
            //CA公司
       var CA_Config_Company = LISSYSPageCommonInfo.Data.CA_Config_Company;
            //已登录的证书
      var IsMobileCA = LISSYSPageCommonInfo.Data.IsMobileCA;
        var UserCode = LISSYSPageCommonInfo.Data.Sesssion.UserCode;
            //登录的 证书ID
        var SessionUserDR = LISSYSPageCommonInfo.Data.Sesssion.UserDR;
            //工作组是否开启CA
        var WorkGroupDR = LISSYSPageCommonInfo.Data.Sesssion.WorkGroupDR;
            //WebService地址
        var WebServicAddress = LISSYSPageCommonInfo.Data.WebServicAddress;
        var sysTheme = LISSYSPageCommonInfo.Data.Sesssion.Theme;
       var hospitalDR = LISSYSPageCommonInfo.Data.Sesssion.HospitalDR;
       var SessionStr=UserDR+ "^" + WorkGroupDR + "^^^" + hospitalDR;
      var WorkGroup_CA_Open = localStorage.getItem("WGCAConfig" + WorkGroupDR);
   if (CA_Config_Open == "1" && WorkGroup_CA_Open == "1") {
             document.write('<script src="../../CA/BJCA/XTXSuite.js"><\/script>');
             document.write('<script src="../../CA/BJCA/common.js"><\/script>');
         } else if (CA_Config_Open == "1" && WorkGroup_CA_Open == "1") {
             document.write('<script src="../../CA/js/common.js"><\/script>');
         }

    </script>
    <script src="../js/jsBdCommon.js?version=0.14" type="text/javascript"></script>
    <script src="../js/jsBdXMCommon.js?version=1.37" type="text/javascript"></script>
    <script src="../js/jsBdXMTest.js?version=0.19" type="text/javascript"></script>
    <script src="../js/jsCostDetail.js?version=0.11" type="text/javascript"></script>
    <script src="../js/jsPrint.js?version=0.21" type="text/javascript"></script>
    <script src="../../lisprint/js/LisPrint.js" type="text/javascript"></script>
	 <script src="../../lisprint/js/ExportToExcel.js" type="text/javascript"></script>
    <script src="../js/jsIsBldDifficult.js?version=0.13" type="text/javascript"></script>
    <script type="text/jscript">
        $.ajaxSetup({
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            }
        })
    </script>
    <style>
        .model_morematch
        {
            width: 20px;
            height: 20px;
            background: #C0FF3E;
            color: white;
        }
        .circle
        {
            background-color: green;
        }
    </style>
</head>
<body class="easyui-layout">
    <noscript>
        <div style="position: absolute; z-index: 100000; height: 2046px; top: 0px; left: 0px;
            width: 100%; text-align: center;">
            <img src="../../resource/common/images/noscript.gif" alt='抱歉，请开启脚本支持！' />
        </div>
    </noscript>
    <div data-options="region:'east',split:true" title="输血申请<div id='XMPlanStatus_FOption' style='width:85%;float:right;white-space:nowrap'></div>"
        style="width: 450px;">
        <div id="ReqFormToolBar" class="ToolBarPadding">
            <form id="searchFrom">
            <div>
                <table>
                    <tr>
                        <td colspan="3">
                            <a href="javascript:void(0);" id="btn_ThisDay" title="当天" class="easyui-linkbutton"
                                data-options="toggle:false,plain:true,iconCls:'icon-calendar_view_day'" onclick="mnuDateTypeClick('1')">
                                1天</a> <a href="javascript:void(0);" id="btn_3Day" title="最近3天" class="easyui-linkbutton"
                                    data-options="toggle:false,plain:true,iconCls:'icon-calendar_view_month',selected:true"
                                    onclick="mnuDateTypeClick('3')">3天</a> <a href="javascript:void(0);" id="btn_7Day"
                                        title="最近7天" class="easyui-linkbutton" data-options="toggle:false,plain:true,iconCls:'icon-calendar_view_week'"
                                        onclick="mnuDateTypeClick('7')">7天</a>
                            <input id="dt_SttDate" style="width: 96px" />
                            -
                            <input id="dt_EndDate" style="width: 96px" />
                            <input type="checkbox" name="chkTimeLimit" checked="checked" title="登记号病案号日期是否有效" />
                        </td>
                    </tr>
                    <tr>
                        <td style="width: 90px;">
                            <a href="#" id="mnu_FindFast" class="easyui-menubutton" data-options="menu:'#mnu_FindFastType',iconCls:'icon-text_padding_left'">
                                申请单</a>
                        </td>
                        <td style="width: 122px;">
                            <input class="easyui-validatebox" id='txt_FindFast' name="FindFast" style="width: 120px" />
                        </td>
                        <td>
                            <a class="searchLink" href="javascript:void(0);" onclick="ToggleShow(this);">高级查询</a>
                            <a id="btn_ReqForm_Refresh" href="javascript:void(0);" class="easyui-linkbutton"
                                data-options="iconCls:'icon-arrow_refresh'" onclick="RefreshReqForm();" plain="true">
                                刷新</a>
							<a href="javascript:void(0)" id="btn_Print"  class="easyui-linkbutton easyui-tooltip" icon="icon-search" onclick="Print();">
                                            导出</a>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="4">
                            <div id="AdvanceSearch" style="display: none;">
                                <table style="white-space: nowrap; margin-left: 10px">
                                    <tbody>
                                        <tr>
                                            <td>
                                                类型
                                            </td>
                                            <td>
                                                <div id="ReqType_FOption">
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="width: 80px;">
                                                ABO
                                            </td>
                                            <td>
                                                <div id="ABO_FOption">
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                RH
                                            </td>
                                            <td>
                                                <div id="RH_FOption">
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                血成分
                                            </td>
                                            <td>
                                                <div id="ReqProduct_FOption">
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                申请血型
                                            </td>
                                            <td>
                                                <div id="BloodGroup_FOption">
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
            </form>
        </div>
        <div class="easyui-layout" data-options="fit:true">
            <div data-options="region:'center'">
                <table id="ReqFormData">
                </table>
            </div>
        </div>
    </div>
    <div data-options="region:'center'">
        <div class="easyui-layout" fit="true">
            <div data-options="region:'north',split:true, border:false" style="height: 235px;">
                <div class="easyui-layout" fit="true">
                    <div data-options="region:'west',split:false,title:'<i class=\'fa fa-user-md\'></i>&nbsp病人信息',collapsible:false,border:true"
                        style="width: 290px; border-width: 2px;">
                        <table>
                            <tr>
                                <td style="text-align: right; width: 60px">
                                    <b>病案号:</b>
                                </td>
                                <td id="td_RecordNo" style="text-align: left">
                                </td>
                            </tr>
                            <tr>
                                <td style="text-align: right;">
                                    <b>登记号:</b>
                                </td>
                                <td id="td_RegNo" style="text-align: left">
                                </td>
                            </tr>
                            <tr>
                                <td style="text-align: right; vertical-align: top">
                                    <b>基本信息:</b>
                                </td>
                                <td id="td_PatientInfo" style="text-align: left">
                                </td>
                            </tr>
                            <tr>
                                <td style="text-align: right; vertical-align: top">
                                    <b>入院时间:</b>
                                </td>
                                <td id="td_AdmInTime" style="text-align: left">
                                </td>
                            </tr>
                            <tr>
                                <td style="text-align: right; vertical-align: top">
                                    <b>临床诊断:</b>
                                </td>
                                <td id="td_Diagnosis" style="text-align: left">
                                </td>
                            </tr>
                           <tr> 
                                 <td style="text-align: right;">
                                    <b>转住院:</b>
                                </td>
                                <td style="text-align: left">
                                    <input id="td_AdmId"  style="width: 158px" class="easyui-combobox" />
                                    <a id="A4" href="javascript:void(0);" class="easyui-linkbutton" onclick="ChangeReqAdm(event);">
                                        绑定</a>
                                </td>
                            </tr>
                            <tr class="medicalType">
                                <td style="text-align: right; width: 60px">
                                    <b>费用类型:</b>
                                </td>
                                <td>
                                    <input id="rdMedF" name="rdMedicalInsuranceType" type="radio" value="1" />医保
                                    <input id="rdMedS" name="rdMedicalInsuranceType" type="radio" value="0" />自费
                                </td>
                            </tr>
                            <tr class="medicalType">
                                <td>
                                </td>
                                <td>
                                    <input id="cmbPayMentType" name="PayMentType" style="width: 130px" class="easyui-combobox" />
                                    <a id="changePayment" href="javascript:void(0);" class="easyui-linkbutton" onclick="changePayment(event);">
                                        修改</a>
                                </td>
                            </tr>
                        </table>
                    </div>
                    <div data-options="region:'center',split:false,title:'<i class=\'fa fa-truck\'></i>&nbsp申请信息',collapsible:false,border:true"
                        style="border-width: 2px;">
                        <table>
                            <tr>
                                <td style="text-align: left; width: 60px; vertical-align: top;">
                                    <b>申请单号:</b>
                                </td>
                                <td id="td_reqFormNo" style="text-align: left; font-weight: bolder">
                                </td>
                            </tr>
                            <tr>
                                <td style="text-align: left; vertical-align: top;">
                                    <b>输血目的:</b>
                                </td>
                                <td id="td_Purpose" style="text-align: left;">
                                </td>
                            </tr>
                            <tr>
                                <td style="text-align: left;">
                                    <b>申请类型:</b>
                                </td>
                                <td id="td_ReqType" style="text-align: left;">
                                </td>
                            </tr>
                            <tr>
                                <td style="text-align: left;">
                                    <b>输血日期:</b>
                                </td>
                                <td id="td_BookDate" style="text-align: left">
                                </td>
                            </tr>
                            <tr>
                                <td style="text-align: left; vertical-align: top;">
                                    <b>申请成分:</b>
                                </td>
                                <td id="td_TestItem" style="text-align: left">
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2" style="height: 50px; text-align: center; vertical-align: bottom">
                                    <span id="SpecialProduct"></span>&nbsp;&nbsp;&nbsp;&nbsp;<span id="spanXMatchInfo"></span>
                                </td>
                            </tr>
                        </table>
                    </div>
                    <div data-options="region:'east',split:false,title:'<i class=\'fa fa-tint\'></i>病人血型',collapsible:false,border:true"
                        style="width: 320px; border-width: 2px;">
                        <table>
                            <tr>
                                <td style="text-align: left;" colspan="2">
                                    <b>鉴定血型：</b> <span id="patientBloodGroup"></span>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2" style="text-align: right;">
                                    <span id="LisReportAuthTime"></span>
                                </td>
                            </tr>
                            <tr>
                                <td style="text-align: left; width: 220px;">
                                    <b>复检血型：</b> <span id="compositeBloodGroup"></span>&nbsp;&nbsp;<span id="patientPhenotype"></span>
                                </td>
                                <td>
                                    <a id="A2" href="javascript:void(0);">
                                        <img src="../../resource/common/images/menus/laborder.ico" onclick="SaveCompositeBld();"
                                            title="复检" height="20" width="20" /></a>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2" style="text-align: right;">
                                    <span id="BldReportAuthTime"></span>
                                </td>
                            </tr>
                            <tr>
                                <td style="text-align: left;" colspan="2">
                                    <b>抗体筛查：</b> <span id="patientBloodSAS"></span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <b>关联标本：</b><span id="ReqFormVisitNum"></span>
                                </td>
                                <td>
                                    <a id="A3" href="javascript:void(0);">
                                        <img src="../../resource/common/images/menus/Specimen.ico" onclick="OpenReqFormSampleNoWin();"
                                            title="关联标本" height="15" width="15" /></a>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2" style="text-align: left;">
                                    <span id="VisitNumTimeInfo"></span>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
            <div data-options="region:'center',split:true">
                <div id="tt" class="easyui-tabs" data-options="fit:true,border:false,tools:'#p-tools'">
                    <div data-options="region:'center',split:true,title:'配血计划'">
                        <div id="XMPlanToolBar" data-options="region:'north'" style="height: 140px;">
                            <div style="width: 350px; float: left;margin-top: 5px;">
                                &nbsp;扫描血袋：
                                <input type="text" id="txt_XMPlan_SelectPack" class="PackScan" title="输入请按回车" />
                                <a id="btn_XMPlan_QueryPack" href="javascript:void(0);" class="easyui-linkbutton"
                                    data-options="iconCls:'icon-search'" onclick="QueryPack();" plain="true"></a>
                                <a href="javascript:void(0);" id="A6" class="easyui-linkbutton" plain="true" iconcls="icon-redo"
                                    onclick="OpenReUploadMachine()" title="重传"></a>
                         </div>
                             <div style="float: left; margin-top: 5px;">
                             <span id="currentPack"  style="margin-left: -30px; font-size: 14px;"></span>
                                <input type="hidden" id="currentPackDR" />
                                <input type="hidden" id="currentPackBarcode" />
                                <input type="hidden" id="IsXMatchProduct" />
                                <input type="hidden" id="IsBGChecked" />
                            </div>
                           <div style=" height: 70px; margin-top: 35px; border: 1px solid rgb(174, 208, 234)">
                              <div style="float:left;">  
                                                <table id="BBXMMethodInfo">
                                                    <tr>
                                                        <td>
                                                            <table id="BBXMResultInfo">
                                                                <tr>
                                                                    <td>
                                                                        配血方法:
                                                                    </td>
                                                                    <td style="width: 130px">
                                                                        <input id="com_BBXMMethod" />
                                                                    </td>
                                                                    <td>
                                                                        主侧
                                                                    </td>
                                                                    <td>
                                                                        <input id="com_Major_BBXMDepict" />
                                                                    </td>
                                                                    <td>
                                                                        <input id="com_Major_BBXMResult" />
                                                                    </td>
                                                                    <td>
                                                                        <input id="com_Major_BBXMConclusion" />
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td style="text-align: right;">
                                                                        配血仪器
                                                                    </td>
                                                                    <td>
                                                                        <input id="com_BTMIMachineParameter" />
                                                                    </td>
                                                                    <td>
                                                                        次侧
                                                                    </td>
                                                                    <td>
                                                                        <input id="com_Minor_BBXMDepict" />
                                                                    </td>
                                                                    <td>
                                                                        <input id="com_Minor_BBXMResult" />
                                                                    </td>
                                                                    <td>
                                                                        <input id="com_Minor_BBXMConclusion" />
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                        <td>
                                                            =>
                                                        </td>
                                                        <td>
                                                            <input id="com_BBXMLastResult" />
                                                        </td>
                                                    </tr>
                                                </table> 
                                </div>
                               <div style="float: left;margin-left:600px;margin-top:-60px;">
                                    说明
                                    <textarea id="textarea_Remark" cols="20" rows="2" style="margin: 0px; width: 180px;
                                        height: 40px;"></textarea>
                                </div>
                            </div>
                         <div style="width: 800px;  margin-top: 5px;">
                                <a id="btn_XMTest_Save" href="javascript:void(0);" class="easyui-linkbutton" data-options="iconCls:'icon-save'"
                                    onclick="SaveTest(event);">配血</a>
                                <a id="btn_XMTest_Check" href="javascript:void(0);" class="easyui-linkbutton" data-options="iconCls:'icon-check'"
                                    onclick="CheckTest(event);" title="请勾选">审核</a>
                                <a id="btn_XMTest_" href="javascript:void(0);" class="easyui-linkbutton" data-options="iconCls:'icon-application_form_edit'" onclick="Verify();" title="校对血袋与血标本是否一致" style="display:none">校对</a>
                                <a id="btn_XMTest_UnCheck" href="javascript:void(0);" class="easyui-linkbutton" data-options="iconCls:'icon-cross'" onclick="CancelDialogShow();"> 取消审核</a>
                                <a id="btn_XMPlan_IssuePack" href="javascript:void(0);" class="easyui-linkbutton"
                                    data-options="iconCls:'icon-basket_put'" onclick="IssueXMPlan(event);" title="请勾选">
                                    发血</a> <a id="btn_XMPlan_CancelIssuePack" href="javascript:void(0);" class="easyui-linkbutton"
                                        data-options="iconCls:'icon-redo'" onclick="CancelIssueDialogShow(event);">取消发血</a>
                                <a id="btn_XMPlan_IssuePrint" href="javascript:void(0);" class="easyui-linkbutton"
                                    data-options="iconCls:'icon-search'" onclick="QryIssueRecord();">发血单查询</a>
                                <a id="btn_XMPlan_history" href="javascript:void(0);" class="easyui-linkbutton" data-options="iconCls:'icon-history'"
                                    onclick="QryPlanHistory();">多配血方法</a> <a id="btn_Print_XMMethod" href="javascript:void(0);"
                                        class="easyui-linkbutton" data-options="iconCls:'icon-print'" onclick="PrintXMMethod('','1');">
                                        配血单补打</a><a id="btn_XMPlan_Refresh" href="javascript:void(0);" class="easyui-linkbutton"
                                            data-options="iconCls:'icon-arrow_refresh'" onclick="RefreshXMPlan();"> 刷新</a>
                            </div>
                        </div>
                        <table id="XMPlanData">
                        </table>
                    </div>
                    <div title="配血历史">
                        <table id="dgXMPlanHistory">
                        </table>
                    </div>
                    <div title="历次医嘱" style="padding: 5px; overflow: hidden;" border="false">
                        <div id="Div1" class="easyui-layout" data-options="fit:true">
                            <div data-options="region:'center',title:'医嘱列表',split:true">
                                <table id="dg_HistoryTestSet">
                                </table>
                            </div>
                            <div data-options="region:'east',title:'报告结果'" style="width: 350px;">
                                <table id="dgReportItem">
                                </table>
                            </div>
                        </div>
                    </div>
                    <div data-options="region:'center',split:true,title:'疑难配血'">
                        <div id="div_XMPlanToolBar" data-options="region:'north'" style="height: 135px;">
                            <div style="width: 330px; float: left; margin-top: 5px;">
                                &nbsp;献血码：
                                <input type="text" id="txt_XMPlan_BldSelectPack" class="PackScan" title="输入请按回车" />
                            </div>
                            <div style="float: left; margin-top: 5px;">
                                <span id="BldcurrentPack" style="margin-left: -30px; font-size: 14px;"></span>
                                <input type="hidden" id="BldcurrentPackDR" />
                                <input type="hidden" id="BldcurrentPackBarcode" />
                                <input type="hidden" id="BldIsXMatchProduct" />
                                <input type="hidden" id="BldIsBGChecked" />
                            </div>
                            <div style=" height: 70px; margin-top: 30px; border: 1px solid rgb(174, 208, 234)">
                                <table>
                                    <tr>
                                        <td>
                                            <table id="tab_BBXMMethodInfo">
                                                <tr>
                                                    <td>
                                                        <table id="tab_BBXMResultInfo">
                                                            <tr>
                                                                <td>
                                                                    配血方法:
                                                                </td>
                                                                <td style="width: 130px">
                                                                    <input id="cmb_BBXMMethod" />
                                                                </td>
                                                                <td>
                                                                    主侧
                                                                </td>
                                                                <td>
                                                                    <input id="cmb_Major_BBXMDepict" />
                                                                </td>
                                                                <td>
                                                                    <input id="cmb_Major_BBXMResult" />
                                                                </td>
                                                                <td>
                                                                    <input id="cmb_Major_BBXMConclusion" />
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style="text-align: right;">
                                                                    配血仪器
                                                                </td>
                                                                <td>
                                                                    <input id="cmb_BTMIMachineParameter" />
                                                                </td>
                                                                <td>
                                                                    次侧
                                                                </td>
                                                                <td>
                                                                    <input id="cmb_Minor_BBXMDepict" />
                                                                </td>
                                                                <td>
                                                                    <input id="cmb_Minor_BBXMResult" />
                                                                </td>
                                                                <td>
                                                                    <input id="cmb_Minor_BBXMConclusion" />
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                    <td>
                                                        =>
                                                    </td>
                                                    <td>
                                                        <input id="cmb_BBXMLastResult" />
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                        <td>
                                            <div id="div_IsSned">
                                                <input id="BldDifficultSend" style="width: 60px;" />
                                            </div>
                                            <div id="div_medicalType" style="display: none">
                                                是否医保:<input id="BldmedicalType" style="width: 60px;" />
                                            </div>
                                        </td>
                                        <td style="width: 200px;">
                                            <div>
                                                说明
                                                <textarea id="textarea_BldRemark" cols="20" rows="2" style="margin: 0px; width: 180px;
                                                    height: 40px;" ondblclick="Model();" title="双击模板"></textarea>
													
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            <div style="width: 1000px; float: left; margin-top: 5px;">
                                <a id="btn_XMTest_BldSave" href="javascript:void(0);" class="easyui-linkbutton" data-options="iconCls:'icon-save'"
                                    onclick="SaveBldTest(event);">保存</a> <a id="btn_XMTest_BldCheck" href="javascript:void(0);"
                                        class="easyui-linkbutton" data-options="iconCls:'icon-check'" onclick="CheckTestBld(event);"
                                        title="请勾选">审核</a>
                            </div>
                        </div>
                        <table id="XMBldPlanData">
                        </table>
                    </div>
                </div>
            </div>
            <div data-options="region:'south',split:true" style="height: 40px;">
                <div id="div_costItems" style="float: left;">
                </div>
				<div id="div_IssuePack" style="float: right;padding-right:20px;padding-top:5px">
                </div>
            </div>
        </div>
    </div>
    <div id="div_Pack" class="easyui-dialog" title="匹配血袋" style="width: 950px; height: 600px;
        text-align: center;" data-options="modal:true,closed: true">
        <div id="PackToolBar">
            <table width="100%">
                <tr>
                    <td style="width: 80%">
                        <div>
                            <label>
                                <input type="radio" value="XAutologous" name="XMType" />自体血</label>
                            <label>
                                <input type="radio" value="XSame" name="XMType" checked="checked" />同型同成分</label>
                            <label>
                                <input type="radio" value="XSameGroup" name="XMType" />同型跨成分</label>
                            <label id="lblXMatch">
                                <input type="radio" value="XMatch" name="XMType" />配血规则(异型配血)</label>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            <label>
                                <input type="checkbox" name="IsVolumnFit" checked="checked" />血量最合适</label>
                            <a href="javascript:void(0);" class="easyui-linkbutton" data-options="iconCls:'icon-search'"
                                onclick="me.PackGrid.datagrid('reload');" plain="true">查询</a>
                            <br />
                            扫描：
                            <input type="text" id="txt_AddPack" class="PackScan" title="输入请按回车" />
                            <a href="javascript:void(0);" id="btn_AddPack" class="easyui-linkbutton" plain="true"
                                iconcls="icon-add">增加</a>
                            配血仪器<input id="com_BTMIMachineParameter_pack" />
                        </div>
                        <div>
                            <a id="PackBGCheck" href="javascript:void(0);" class="easyui-linkbutton" data-options="iconCls:'icon-accept'"
                                onclick="UpdatePackBGCheckInfo();" plain="true">血型审核</a> <a id="btn_XMPlan_save"
                                    href="javascript:void(0);" class="easyui-linkbutton" data-options="iconCls:'icon-save'"
                                    onclick="SaveXMPlan();" plain="true">创建配血计划</a> <a id="btn_MachineXMPlan_Save" href="javascript:void(0);"
                                        class="easyui-linkbutton" data-options="iconCls:'icon-save'" onclick="PackStockSaveXMPlan();"
                                        plain="true">仪器配血</a><a href="javascript:void(0);" class="easyui-linkbutton" data-options="iconCls:'icon-cancel'"
                                            onclick="$('#div_Pack').dialog('close');" plain="true">返回</a>
                        </div>
                    </td>
                    <td>
                        <span id="PackWarn" class="warn"></span>
                    </td>
                </tr>
            </table>
        </div>
        <table style="width: 580px; height: 160px" id="PackGrid">
        </table>
    </div>
    <div id="div_CancelReason" class="easyui-dialog" title="取消备血原因" style="width: 600px;
        height: 550px; text-align: center;" data-options="modal:true,closed: true">
        <table style="width: 580px; height: 140px" id="CancelReasonsGrid">
        </table>
        <textarea id="CancelReason" style="width: 580px; height: 50px;"></textarea>
        <br />
        <div style="width: 580px; height: 250px">
            <table id="dgXMPlanCost" title="配血审核收费项目">
            </table>
        </div>
        <a id="btn_Cancel_Conform" href="javascript:void(0);" class="easyui-linkbutton" data-options="iconCls:'icon-ok'"
            onclick="CancelCheck();">确定</a> <a href="javascript:void(0);" class="easyui-linkbutton"
                data-options="iconCls:'icon-cancel'" onclick="$('#div_CancelReason').dialog('close');">
                返回</a>
    </div>
    <div id="div_CancelIssueReason" class="easyui-dialog" title="取消发血原因" style="width: 700px;
        height: 550px;" data-options="modal:true,closed: true">
        <div id="CancelIssueReasonsGridToolBar">
            <a href="javascript:void(0);" class="easyui-linkbutton" data-options="iconCls:'icon-arrow_refresh'"
                onclick="me.CancelIssueReasonsGrid.datagrid('reload');" plain="true">刷新</a>
        </div>
        <table style="width: 580px; height: 140px" id="CancelIssueReasonsGrid">
        </table>
        <textarea id="CancelIssueReason" style="width: 580px; height: 50px;"></textarea>
        <br />
        <div style="width: 580px; height: 250px">
            <div id="UnChargeItemToolBar" class="ToolBarPadding">
                <a id="btnUnChargeRefresh" href="javascript:void(0);" class="easyui-linkbutton" data-options="iconCls:'icon-arrow_refresh'"
                    onclick="$('#dgPackCost').datagrid('reload');" plain="true">刷新</a>
            </div>
            <table id="dgPackCost" title="血液关联收费项目">
            </table>
        </div>
        <div style="width: 580px; text-align: center">
            <a id="A1" href="javascript:void(0);" class="easyui-linkbutton" data-options="iconCls:'icon-ok'"
                onclick="CancelIssueXMPlan();">确定</a> <a href="javascript:void(0);" class="easyui-linkbutton"
                    data-options="iconCls:'icon-cancel'" onclick="$('#div_CancelIssueReason').dialog('close');">
                    返回</a></div>
    </div>
    <div id="div_statPackCost" class="easyui-dialog" title="血液收费项目" style="width: 620px;
        height: 450px;" data-options="modal:true,closed: true">
        <table id="dgStatPackCost">
        </table>
        <div style="margin-left: 150px; margin-top: 5px;">
            <a id="btn_Issue" href="javascript:void(0);" class="easyui-linkbutton" data-options="iconCls:'icon-ok'"
                plain="true">确定</a> <a href="javascript:void(0);" class="easyui-linkbutton" data-options="iconCls:'icon-cancel'"
                    onclick="$('#div_statPackCost').dialog('close');" plain="true">返回</a>
        </div>
    </div>
    <div id="win_ManualAccount" title="手工计费">
    </div>
    <div id="win_EntryLogin" title="" style="background: #FFFFFF; overflow: hidden;">
    </div>
    <div id="div_BldRes" title="血型复查结果">
    </div>
    <div id="p-tools" style="font-size: 14px;">
        <table>
            <tr>
                <td>
                    <a id="btn_XMPlan_Inform" href="javascript:void(0);" class="easyui-linkbutton" data-options="iconCls:'icon-note_go'"
                        style="margin-top: -8px;" onclick="InformXMPlan(event);">通知取血</a>&nbsp;&nbsp;<a href="javascript:void(0)"
                            id="btn_EntryLogin" class="easyui-linkbutton" style="margin-top: -8px;" title="审核登录"
                            icon="icon-login" onclick="EntryLogin();">审核登录</a>&nbsp;&nbsp;
                </td>
            </tr>
        </table>
    </div>
    <div id="div_ReqFormInfo" title="申请单信息">
    </div>
    <div id="div_IssueRecord" title="发血单查询">
    </div>
    <div id="div_PlanHistory" title="配血记录">
    </div>
    <div id="div_PackMoreMatch" title="一血多配" class="easyui-dialog" style="width: 720px;
        height: 450px;" data-options="modal:true,closed: true">
        <table id="dg_PackMoreMatch">
        </table>
    </div>
    <div id="div_CreatePlan" title="创建配血计划" class="easyui-dialog" style="width: 900px;
        height: 650px;" data-options="modal:true,closed: true">
        <div class="easyui-layout" data-options="fit:true">
            <div data-options="region:'north',split:true" style="height: 70px;">
                <table width="100%">
                    <tr>
                        <td style="width: 80%">
                            <div>
                                <label>
                                    <input type="radio" value="XAutologous" name="PlanXMType" />自体血</label>
                                <label>
                                    <input type="radio" value="XSame" name="PlanXMType" checked="checked" />同型同成分</label>
                                <label>
                                    <input type="radio" value="XSameGroup" name="PlanXMType" />同型跨成分</label>
                                <label>
                                    <input type="radio" value="XMatch" name="PlanXMType" />配血规则</label>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                <br />
                                <label>
                                    配血仪器<input id="com_UploadMachineParameter" />&nbsp;&nbsp; 条 码：<input type="text"
                                        id="txt_PackID" class="form-control" placeholder="请输入献血码或血标本条码" /></label>
                                产品码：<input id="txt_ProductBarCode" style="width: 80px" /><a id="btn_XMPlan_Add" href="javascript:void(0);"
                                    class="easyui-linkbutton" data-options="plain:true,iconCls:'icon-save'" onclick="SaveXMPlanList()">保存</a><a
                                        id="A5" href="javascript:void(0);" class="easyui-linkbutton" data-options="iconCls:'icon-remove'"
                                        onclick="DelPlan();">移除</a>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
            <div data-options="region:'center',title:'配血计划',split:true">
                <table id="dgMachineXMPlan">
                </table>
            </div>
        </div>
    </div>
    <div id="win_packtranstry" style="overflow: hidden">
    </div>
    <div id="divReqFormVisit" class="easyui-window" closed="true" title="关联标本号" style="width: 450px;
        height: 200px; padding: 5px;">
        <div class="easyui-layout" fit="true">
            <div region="center" border="false" style="padding: 10px; background: #fff; border: 1px solid #ccc;">
                <form id="Form2" name="reqformVisit_form" method="post">
                <table>
                    <tr>
                        <th height="25" width="25%" align="right">
                            关联标本号：
                        </th>
                        <td height="25" width="*" align="left">
                           
                           <input class="easyui-validatebox" name="com_PatVisitNum" id="com_PatVisitNum" style="width: 120px;" />
                        </td>
                    </tr>
                </table>
                </form>
            </div>
            <div region="south" border="false" style="text-align: center; height: 30px; line-height: 30px;">
                <a id="btn_reqformVisitOk" icon="icon-save" class="easyui-linkbutton" href="javascript:void(0)">
                    确定</a> <a id="btn_reqformVisitCancel" class="easyui-linkbutton" icon="icon-cancel"
                        href="javascript:void(0)">关闭</a>
            </div>
        </div>
    </div>
    <div id="mnu_FindFastType" style="width: 80px;">
        <div onclick="mnuFindFastClick('ReqFormNo','icon-text_padding_left','申请单')" data-options="iconCls:'icon-text_padding_left'">
            申请单
        </div>
        <div onclick="mnuFindFastClick('UseSampleNo','icon-text_list_numbers','检验号')" data-options="iconCls:'icon-text_list_numbers'">
            检验号
        </div>
        <div onclick="mnuFindFastClick('RegNo','icon-newspaper','登记号')" data-options="iconCls:'icon-newspaper'">
            登记号
        </div>
        <div onclick="mnuFindFastClick('MedicalRecordNo','icon-server','病案号')" data-options="iconCls:'icon-server'">
            病案号
        </div>
        <div onclick="mnuFindFastClick('TakeRecordNo','icon-status_online','取血单')" data-options="iconCls:'icon-status_online'">
            取血单
        </div>
		<div onclick="mnuFindFastClick('PatName','icon-text_padding_left','姓名')" data-options="iconCls:'icon-text_padding_left'">
            姓名
        </div>
    </div>
    <div id="packinfo_window" class="easyui-window" closed="true" title="血液信息" style="width: 950px;
        height: 550px;">
        <table cellpadding="1" cellspacing="1">
            <tr>
                <td>
                    &nbsp&nbsp<a href="javascript:void(0)" id="btnAdd" class="easyui-linkbutton" icon="icon-add"
                        onclick="AddPackInfo();">增加</a>&nbsp;<a href="javascript:void(0)" id="btnclose" class="easyui-linkbutton"
                            icon="icon-cancel" onclick="$('#packinfo_window').window('close');">关闭</a>
                </td>
            </tr>
        </table>
        <div border="false" region="center" style="height: 450px; border: 1px solid #ccc;">
            <table id="dgPackDetails">
            </table>
        </div>
    </div>
    <div id="div_ReMachineXM" class="easyui-window" closed="true" title="仪器重传" style="width: 450px;
        height: 200px; padding: 5px;">
        <div class="easyui-layout" fit="true">
            <div region="center" border="false" style="padding: 10px; background: #fff; border: 1px solid #ccc;">
                <form id="Form1" name="ReMachine_form" method="post">
                <table>
                    <tr>
                        <th height="25" width="25%" align="right">
                            上传仪器：
                        </th>
                        <td height="25" width="*" align="left">
                            <input class="easyui-validatebox" name="com_MachineXMParameter" id="com_MachineXMParameter"
                                style="width: 120px;" />
                        </td>
                    </tr>
                </table>
                </form>
            </div>
            <div region="south" border="false" style="text-align: center; height: 30px; line-height: 30px;">
                <a id="A7" icon="icon-save" class="easyui-linkbutton" href="javascript:void(0)" onclick="ReSaveXMPlanList()">
                    确定</a> <a id="A8" class="easyui-linkbutton" icon="icon-cancel" href="javascript:void(0)"
                        onclick="$('#div_ReMachineXM').dialog('close');">关闭</a>
            </div>
        </div>
    </div>
    <div id="edit_window" class="easyui-window" closed="true" title="取血人信息" style="width: 270px; height: 190px; padding: 0px;">
        <div class="easyui-layout" fit="true">
            <div region="center" border="false" fit="true" style="padding: 0px; background: #fff; border: 0px;">
                <form id="edit_form" name="edit_form" method="post">
                <div title="隐藏参数">
                    <input type="hidden" id="hiddenTakeUserName" name="hiddenTakeUserName" value="" />
                </div>
                <table width="100%" cellspacing="1" cellpadding="0" border="0" class="form_table">
                    <tr>
                        <th style="text-align: right">
                            取血人：
                        </th>
                        <td>
                            <input id="txt_edit_TakeUserName" name="TakeUserName" class="easyui-validatebox"
                                data-options="required:true" style="width: 150px" />
                        </td>
                    </tr>
                </table>
                </form>
            </div>
            <div region="south" border="false" style="text-align: center; height: 35px; line-height: 10px;">
                <a id="btn_edit_ok" icon="icon-save" class="easyui-linkbutton" href="javascript:void(0)"
                    onclick="CheckTakeUserName();">确定</a> <a id="btn_edit_cancel" class="easyui-linkbutton"
                        icon="icon-cancel" href="javascript:void(0)">关闭</a>
            </div>
        </div>
    </div>
    <div id="DMPatRecord_window" class="easyui-window" closed="true" title="疑难记录" style="width: 1000px;
        height: 590px;">
        <div id="PatDiffMatchRecordToolBar">
            <a href="javascript:void(0);" class="easyui-linkbutton" data-options="iconCls:'icon-add'"
                plain="true" onclick="OpenDMRecord('Save')">新增</a><a id="PatDiffEdit" href="javascript:void(0);"
                    class="easyui-linkbutton" data-options="iconCls:'icon-edit'" plain="true" onclick="OpenDMRecord('Update')">修改</a><a
                        id="PatDiffDel" href="javascript:void(0);" class="easyui-linkbutton" data-options="iconCls:'icon-delete'"
                        plain="true" onclick="OpenDMRecord('Delete')">删除</a>
        </div>
       <div style="width:98%;height:90%">
          <table id="dg_PatDiffMatchRecord" >
          </table> 
        </div>
    </div>
    <div id="DMRecord_window" class="easyui-window" closed="true" title="疑难记录" style="width: 400px;
        height: 290px;">
        <div class="easyui-layout" fit="true">
            <div region="center" border="false" fit="true" style="padding: 0px; background: #fff;
                border: 0px;">
                <form id="Form4" name="edit_form" method="post">
                <table width="100%" cellspacing="1" cellpadding="0" border="0" class="form_table">
                    <tr>
                        <th style="text-align: right">
                            疑难类型：
                        </th>
                        <td>
                            <select name="DMRecord" id="cmb_DMRecord" style="width: 300px;" required="true" />
                        </td>
                    </tr>
                    <tr>
                        <th style="text-align: right">
                            描述：
                        </th>
                        <td>
                            <textarea id="DMRecordDes" readonly="readonly" cols="20" rows="2" style="width: 200px;
                                height: 50px;">
                          </textarea>
                        </td>
                    </tr>
                    <tr>
                        <th style="text-align: right">
                            备注：
                        </th>
                        <td>
                            <textarea id="DMRecordRemark" cols="20" rows="2" style="width: 200px; height: 50px;">
                          </textarea>
                        </td>
                    </tr>
                </table>
                </form>
            </div>
            <div region="south" border="false" style="text-align: center; height: 35px; line-height: 10px;">
                <a id="A10" icon="icon-save" class="easyui-linkbutton" href="javascript:void(0)"
                    onclick="SavePatDiffMatch();">确定</a> <a id="A11" class="easyui-linkbutton" icon="icon-cancel"
                        href="javascript:void(0)" onclick="$('#DMRecord_window').window('close');">关闭</a>
            </div>
        </div>
    </div>
    <div id="win_CAUserLogin" title="" style="background: #FFFFFF; overflow: hidden;">
    </div>
    <div id="win_ReportResultView" title="检验报告浏览" style="overflow: hidden;">
    </div>
    <div id="mnu_ReqForm" class="easyui-menu" data-options="onClick:menuHandler" style="width: 120px;">
        <div id='mnu_PatDiffMatch' data-options="name:'PatDiffMatch',iconCls:'icon-table_lightning'">
            疑难记录
        </div>
        <div id='mnu_LockReqForm' data-options="name:'LockReqForm',iconCls:'icon-lock'">
            锁定申请单
        </div>
        <div id='mnu_UnLockReqForm' data-options="name:'UnLockReqForm',iconCls:'icon-unlock'">
            解锁申请单
        </div>
    </div>
    <div id="div_PatDiffMsg" title="疑难记录" class="easyui-window" closed="true" style="width: 470px;
        height: 190px; padding: 0px;">
        <div id="sp_PatDiffMsg">
        </div>
    </div>
    <div id="div_Supervise" class="easyui-window" closed="true" title="督办提醒" style="width: 670px;
        height: 650px; padding: 0px;">
        <div class="easyui-layout" fit="true">
            <div data-options="region:'north',split:true" style="height: 200px;" title="预留超时提醒">
                <table id="dg_NoIssuePlan">
                </table>
            </div>
            <div region="center" title="备血未处理提醒">
                <table id="dg_NoXMPlan">
                </table>
            </div>
            <div region="south" border="false" style="text-align: center; height: 75px; line-height: 10px;">
                <table>
                    <tr>
                        <th style="padding-left: 10px;">
                            预留时间段:
                        </th>
                        <td style="padding-left: 10px;">
                            <input type="text" id="txtLimitHous" class="form-control" style="width: 70px;" />
                            格式(5-9)
                        </td>
                        <th style="padding-left: 10px;">
                            申请单类型:
                        </th>
                        <td style="padding-left: 10px;">
                            <select name="ReqType" id="cmb_ReqType" style="width: 100px;" />
                        </td>
                        <td style="padding-left: 10px;">
                            <a id="A13" icon="icon-search" class="easyui-linkbutton" href="javascript:void(0)"
                                onclick="RefreshBDSupervise();">查询</a><a id="A14" class="easyui-linkbutton" icon="icon-cancel"
                                    href="javascript:void(0)" style="margin-left: 10px;" onclick="$('#div_Supervise').window('close');">关闭</a>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
    <div id="win_VerifyPack" class="easyui-window" closed="true" title="交叉配血-->献血品标本核对" style="height:350px;width:680px;padding:0" >
        <div class="easyui-layout" fit="true">
            <div region="center" style="" title="">
                <table id="dg_VerifyPack"></table>
            </div>
            <div region="south" border="false" style=" height: 100px;">
                <table style="padding-top:10px;padding-left:10px;width:100%">
                    <tr>
                        <td>患者标本</td>
                        <td colspan="2" style="float:left"><input type="text" id="txt_VerifyLabNo" style="width:150px;" placeholder="请扫入患者标本"/></td>
                    </tr>
                    <tr>
                        <td>血袋编码</td>
                        <td style="float:left"><input type="text" id="txt_VerifyPackID" style="width:150px;" placeholder="扫描血袋献血码"/>&nbsp;
                            <input type="text" id="txt_VerifyProductCode" style="width:150px;" placeholder="请扫描血袋产品码"/>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="3" style="text-align:center;line-height:30px;">
                            <a id="btn_verify_ok" icon="icon-save" class="easyui-linkbutton" href="javascript:void(0)" onclick="VerifySave();">校对</a> 
                            <a id="btn_verify_cancel" class="easyui-linkbutton" icon="icon-cancel" href="javascript:void(0)" onclick="VerifyCancel();">关闭</a>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
    <div id="win_VerifyIssuePack" class="easyui-window" closed="true" title="发血-->发血核对" style="height:350px;width:680px;padding:0" >
        <div class="easyui-layout" fit="true">
            <div region="center" style="" title="">
                <table id="dg_IssueXMPack"></table>
            </div>
            <div region="south" border="false" style=" height: 100px;">
                <table style="padding-top:10px;padding-left:10px;width:100%">
                    <tr>
                        <td>血袋编码</td>
                        <td style="float:left"><input type="text" id="txt_VerifyIssuePackID" style="width:150px;" placeholder="扫描血袋献血码"/>&nbsp;
                            <input type="text" id="txt_VerifyIssueProductCode" style="width:150px;" placeholder="请扫描血袋产品码"/>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="3" style="text-align:center;line-height:30px;">
                            <a id="btn_verifyIssue_ok" icon="icon-save" class="easyui-linkbutton" href="javascript:void(0)" onclick="VerifyIssueXMPlanDo();">发血</a> 
                            <a id="btn_verifyIssue_cancel" class="easyui-linkbutton" icon="icon-cancel" href="javascript:void(0)" onclick="VerifyIssueCancel();">关闭</a>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </div>

     <div id="win_ResultCharts" class="easyui-window" title="结果曲线图" style="width: 900px;
        height: 400px; background: #FFFFFF" data-options="modal:true,closed:true">
        <div style="width: 100%; height: auto">
            纵坐标范围:<select style="width: 100px;" class="easyui-combobox" id="cmb_RangeMultiple">
                <option value="1" selected="selected">原始纵坐标</option>
                <option value="2">参考范围坐标</option>
            </select>
        </div>
        <div id="div_ResultCharts" style="width: 880px; height: 350px; background: #FFFFFF">
        </div>
    </div>
	 <div  id="div_Model" class="easyui-window" title="常用说明模板"  style="width: 720px; height: 450px;" data-options="closed:true,tools:'#toolbar'"> 
        <div  class="easyui-layout" style="width:700px;height:400px;">   
 
             
             <div data-options="region:'west',title:'代码',collapsible:false" style="width:200px;">
                  <div id="div_TitleList"></div>

            </div>   
             <div data-options="region:'center',title:'内容'" style="padding:5px;">

                 <div id="div_content"></div>
             </div>  
             <div data-options="region:'south'" style="height: 50px;width:100%;background:#F4F4F4">
                   <div style="text-align:center">
                            <a href="javascript:void(0)" id="btn_SaveModeInfo" class="easyui-linkbutton" icon="icon-save"
                               onclick="SaveModeInfo();">确认</a>

                        </div>
             </div>
           
        </div>   
       
    </div> 
     <script src="../../resource/plug/echarts/echarts.js" type="text/javascript"></script>
    <script src="../../resource/plug/echarts/myEcharts.js" type="text/javascript"></script>
</body>
</html>

