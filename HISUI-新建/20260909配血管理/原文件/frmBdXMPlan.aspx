
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>
    <title>配血计划</title> 
    <link rel="shortcut icon" href="../../resource/common/images/favicon.ico" />
    <script type="text/javascript">
    </script>
    <script src="../../resource/common/js/easyuicss.js" type="text/javascript"></script>
    <link href="../../resource/easyui/themes/icon.css" rel="stylesheet" type="text/css" />
    <link href="../../resource/common/css/FormStyle.css" rel="stylesheet" type="text/css" />
    <script src="../../resource/common/js/lis-common.js?version=0.11" type="text/javascript"></script>
    <script language="javascript" type="text/javascript">
        LISSYSPageCommonInfo.Init();
        var BasePath = '';
        var ResourcePath = '';
        var FunSave = LISSYSPageCommonInfo.Data.Function.Save == 'True' ? true : false;
        var FunDelete = LISSYSPageCommonInfo.Data.Function.Delete == 'True' ? true : false;
        var FunCreate = LISSYSPageCommonInfo.Data.Function.Create == 'True' ? true : false;
        var FunCheck = LISSYSPageCommonInfo.Data.Function.Check == 'True' ? true : false;
        var FunUnCheck = LISSYSPageCommonInfo.Data.Function.UnCheck == 'True' ? true : false;
        var sysTheme = LISSYSPageCommonInfo.Data.Sesssion.Theme;

    </script>
    <script src="../js/jsBdCommon.js?version=0.11" type="text/javascript"></script>
    <script src="../js/jsBdXMCommon.js?version=0.14" type="text/javascript"></script>
    <script src="../js/jsBdXMPlan.js?version=0.11" type="text/javascript"></script>
    <script src="../js/jsCostDetail.js?version=0.11" type="text/javascript"></script>
    <script src="../js/jsPackTrace.js?version=0.11" type="text/javascript"></script>
</head>
<body class="easyui-layout">
    <noscript>
        <div style="position: absolute; z-index: 100000; height: 2046px; top: 0px; left: 0px;
            width: 100%; text-align: center;">
            <img src="../../resource/common/images/noscript.gif" alt='抱歉，请开启脚本支持！' />
        </div>
    </noscript>

    <div data-options="region:'east',title:'输血申请【已接收】',split:true" style="width:420px;">
        <div id="ReqFormToolBar" class="ToolBarPadding">
            <form id="searchFrom" >
            <div>
                <table>
                    <tr>
                    <td colspan="2">
                         <a href="javascript:void(0);" id="btn_ThisDay" title="当天" class="easyui-linkbutton" 
                         data-options="toggle:false,plain:true,iconCls:'icon-calendar_view_day'"
                                onclick="mnuDateTypeClick('1')">1天</a>
                          <a href="javascript:void(0);" id="btn_3Day" title="最近3天" class="easyui-linkbutton" 
                         data-options="toggle:false,plain:true,iconCls:'icon-calendar_view_month',selected:true"
                                        onclick="mnuDateTypeClick('3')">3天</a>
                         <a href="javascript:void(0);" id="btn_7Day" title="最近7天" class="easyui-linkbutton"
                                    data-options="toggle:false,plain:true,iconCls:'icon-calendar_view_week'" 
                                    onclick="mnuDateTypeClick('7')">7天</a> 

                                <input id="dt_SttDate" style="width: 96px" />
                        —
                            <input id="dt_EndDate" style="width: 96px" />
    
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2">
                            <label><input class="easyui-searchbox" style="width: 186px" data-options="searcher:SearchReqForm,prompt:'请输入关键字'" /></label>
                            <a class="searchLink" href="javascript:void(0);" onclick="ToggleShow(this);">高级查询</a>
                            <a id="btn_ReqForm_Refresh" href="javascript:void(0);" class="easyui-linkbutton"  data-options="iconCls:'icon-arrow_refresh'" onclick="RefreshReqForm();" plain="true">刷新</a>
                        </td>
                    </tr>
                    <tr>
                    <td>
                        状态
                    </td>
                    <td>
                        <div id="XMPlanStatus_FOption"></div>
                    </td>
                    </tr>
                    <tr>
                         <td colspan="2">
                            <div id="AdvanceSearch" style="display: none;">
                                <table style="white-space: nowrap;margin-left:10px">
                                    <tbody>
                                        <tr>
                                            <td>
                                                类型
                                            </td>
                                            <td>
                                                <div id="ReqType_FOption"></div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="width:80px;">ABO</td>
                                            <td>
                                                <div id="ABO_FOption"></div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>RH</td>
                                            <td>
                                                <div id="RH_FOption"></div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>血成分</td>
                                            <td>
                                                <div id="ReqProduct_FOption"></div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>申请血型</td>
                                            <td>
                                                <div id="BloodGroup_FOption"></div>
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
        <table id="ReqFormData"></table>
    </div>

    <div data-options="region:'center'">
        <div class="easyui-layout"  fit="true">
            
            <div data-options="region:'north',title:'输血申请单基本信息',split:true" style="height:190px;">
                        <div>
                        <table>
                            <tr>
                                <td>
                                    <div id="div_patientInfo"></div>
                                </td>
                                <td style="vertical-align: top;">
                                    <div style="width: 160px;position:fixed;">
                                        <table style="width:100%;">
                                             <tr style="background-color: #F9E3F8;">
                                                <td>
                                                    鉴定：<span id="patientBloodGroup"></span>
                                                </td>
                                            </tr>
                                            <tr style="background-color: #E5B0F3;">
                                                <td>
                                                    复合：<span id="compositeBloodGroup"></span>
                                                </td>
                                            </tr>
                                         </table>
                                    </div>
                                </td>
                               
                            </tr>
                        </table>
                      </div>
            </div>

            <div data-options="region:'center',split:true,title:'配血计划'" style="">
                <div id="XMPlanToolBar" style="padding:2px 5px;">
                    <div>
                        <a id="btn_XMPlan_QueryPack" href="javascript:void(0);" class="easyui-linkbutton"  data-options="iconCls:'icon-search'" onclick="QueryPack();" plain="true">匹配血袋</a>
                        <a id="btn_XMPlan_Delete" href="javascript:void(0);" class="easyui-linkbutton"  data-options="iconCls:'icon-delete'" onclick="DeleteXMPlan(event);" plain="true">删除</a>
                        <a id="btn_XMPlan_Refresh" href="javascript:void(0);" class="easyui-linkbutton"  data-options="iconCls:'icon-arrow_refresh'" onclick="RefreshXMPlan();" plain="true">刷新</a>
                     </div>
                </div>
        
                <table id="XMPlanData"></table>
            </div>

        </div>
    </div>

    
      <div id="div_Pack" class="easyui-dialog" title="匹配血袋" style="width:900px;height:600px;text-align:center;" data-options="modal:true,closed: true">
                
        <div id="PackToolBar">
            <table width="100%">
                <tr>
                    <td style="width:60%">
                        <div>
                            <label><input type="radio" value="XAutologous" name="XMType"/>自体血</label>
                            <label><input type="radio" value="XSame" name="XMType" checked="checked"/>同型同成分</label>
                            <label><input type="radio" value="XSameGroup" name="XMType"/>同型跨成分</label>
                            <label><input type="radio" value="XMatch" name="XMType"/>配血规则</label>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            <label><input type="checkbox" name="IsVolumnFit"  checked="checked" />血量最合适</label>
                            <a href="javascript:void(0);" class="easyui-linkbutton"  data-options="iconCls:'icon-search'" onclick="me.PackGrid.datagrid('reload');" plain="true">查询</a>
                            <br />
                            扫描：
                            <input type="text" id="txt_AddPack" title="输入请按回车"/>
                           <a href="javascript:void(0);" id="btn_AddPack" class="easyui-linkbutton" plain="true" iconcls="icon-add">增加</a>
                           配血仪器<input id="com_BTMIMachineParameter_pack" />
                        </div>
                        <div>
                        <a id="btn_XMPlan_save" href="javascript:void(0);" class="easyui-linkbutton"  data-options="iconCls:'icon-save'" onclick="SaveXMPlan();" plain="true">创建配血计划</a>
                        <a href="javascript:void(0);" class="easyui-linkbutton"  data-options="iconCls:'icon-cancel'" onclick="$('#div_Pack').dialog('close');" plain="true">返回</a>
                        </div>
                    </td>
                    <td>
                        <span id="PackWarn" class="warn"></span>
                    </td>
                </tr>
            </table>
        </div>
        <table style="width:580px;height:160px" id="PackGrid"></table>
     </div>

     <div id="win_ManualAccount" title="手工计费"></div>
</body>
</html>

