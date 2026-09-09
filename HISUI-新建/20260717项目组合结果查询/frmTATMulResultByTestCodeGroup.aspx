
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>
    <title>项目组结果查询</title>
    <link rel="shortcut icon" href="../../resource/common/images/favicon.ico" />
    <script src="../../resource/common/js/easyuicss.js" type="text/javascript"></script>
    <link rel="stylesheet" type="text/css" href="../../resource/easyui/themes/icon.css" />
    <script src="../../resource/common/js/lis-common.js" type="text/javascript"></script>
    <script language="javascript" type="text/javascript">
        LISSYSPageCommonInfo.Init();

    </script>
    <script language="javascript" type="text/javascript">
        LISSYSPageCommonInfo.Init();
        var BasePath = '';
        var ResourcePath = '';
        var sysTheme = LISSYSPageCommonInfo.Data.Sesssion.Theme;
        //ConfigTCG = LISSYSPageCommonInfo.Data.Function.Config
        var ConfigTCG = LISSYSPageCommonInfo.GetFunction("Config"); 
        
    </script>
    <link href="../css/FormStyle.css" rel="stylesheet" type="text/css" />
    <script src="../../resource/common/js/BaseShortcuts.js" type="text/javascript"></script>
    <script type="text/javascript" src="../../resource/easyui/datagrid-groupview.js"></script>
    <script src="../../resource/plug/echarts/echarts.js" type="text/javascript"></script>
    <script src="../../resource/plug/echarts/myEcharts.js" type="text/javascript"></script>
    <script src="../../LisPrint/js/LisPrint.js" type="text/javascript"></script>
	<script src="../../stat/js/jsQSICommon.js" type="text/javascript">
    <script src="../../lisprint/js/ExportToExcel.js" type="text/javascript"></script>
	 <script src="../../lisprint/js/ExportToExcel.js" type="text/javascript"></script>
    <script type="text/javascript">
        CurrentWorkGroup = LISSYSPageCommonInfo.Data.Sesssion.WorkGroupDR;
    </script>
    <script type="text/javascript">
        var me = {
            ConfigTCG: ConfigTCG,
            CurrentWorkGroup: CurrentWorkGroup,
            AccWorkGroupDR:"",
            dgOrderDetails: null,
            dgVisitNumbers: null,
            DateType: null,
            actionUrlLocation: '../../sys/ashx/ashBTLocation.ashx',
            actionUrlAdmission: '../../sys/ashx/ashBTAdmissionType.ashx',
            actionUrlTATMulResultByTestCodeGroup: '../ashx/ashTATMulResultByTestCodeGroup.ashx',
            actionUrlWorkGroup: '../../sys/ashx/ashBTWorkGroup.ashx',
            actionUrlTestCodeGroup: '../../sys/ashx/ashBTTATTestCodeGroup.ashx',
            actionUrlWorkGroupMachine: '../../sys/ashx/ashBTWorkGroupMachine.ashx',
            actionStatUrl: '../ashx/ashStatResultTestCode.ashx',
            actionUrl: '../../stat/ashx/ashQSICommon.ashx',
            actionUrlBaseLocation: '../../sys/ashx/ashBTBasicPublicQuery.ashx',
            findflag: null,
            VisitNumberdata: new Array(),
            StatTyPedata: new Array(),
            Pricedata: new Array(),
            VisitPricedata: new Array(),
            VisitStatTyPedata: new Array(),
            StatType: 1,
            findType: 0,
            Printdata: null,
            Displaydata: new Array(),
            GroupIndex: 0,
            Displayflag: 1,
            SpecimenSum: 0,
            title: null,
            StatType: null,
            columns: []
        };

        $(function () {

            pageInit();

        });

        //页面初始化
        function pageInit() {

            var ShowType = "1";
            ////是否显示配置
            //if(me.ConfigTCG){
            //    $('#btnWorkGroupConnectHisDepSet').show();
            //}else{                
            //    $('#btnWorkGroupConnectHisDepSet').hide();
            //}

            ///初始化查询日期
            var curDate = GetCurentDate();
			$('#dt_FindSttDate').datebox({
                onSelect: function () {
                    //求结束日期和开始日期的差
                    var days = daysBetween($('#dt_FindEndDate').datebox("getValue"), $('#dt_FindSttDate').datebox("getValue"));
                    if (days < 0) {
                        $('#dt_FindEndDate').datebox("setValue", $('#dt_FindSttDate').datebox("getValue"));
                    }
                }
            });
            $('#dt_FindEndDate').datebox({
                onSelect: function () {
                    //求结束日期和开始日期的差
                    var days = daysBetween($('#dt_FindEndDate').datebox("getValue"), $('#dt_FindSttDate').datebox("getValue"));
                    if (days < 0) {
                        $('#dt_FindSttDate').datebox("setValue", $('#dt_FindEndDate').datebox("getValue"));
                    }
                }
            });
            $('#dt_FindSttDate').datebox('setValue', curDate);
            $('#dt_FindEndDate').datebox('setValue', curDate);
            var myDate = new Date();
            var startYear = myDate.getFullYear() - 50; //起始年份 
            var endYear = myDate.getFullYear(); //结束年份 
            for (var Year = endYear; Year > startYear; Year--) {
                $("#StatYear").append("<option value='" + Year + "'>" + Year + "</option>");
            }
            $("#StatYear").combobox({}); //转换为combobox样式
            //隐匿年统计、季度、月统计，显示日期统计
            $(".td_Year").hide();
            $(".td_Season").hide();
            $(".td_date").show();
            $(".td_Month").hide();
            $('#div_Complex').hide();
           
            //检验项目组---加载能访问到的工作组和工作组维护为空的项目组
            $('#cmb_timedifference').combogrid({
                panelWidth: 270,
                idField: 'RowID',
                textField: 'CName',
                editable: false,
                required: true,
                fit: true,
                singleSelect: true,
                nowrap: false,  //折行
                border: false,
                columns: [[
				 { field: 'Code', title: '代码', width: 100, sortable: true, align: 'center' },
                   { field: 'CName', title: '名称', width: 150, sortable: true, align: 'left' },
                   { field: 'GroupType', title: '类型', width: 100, hidden: true, sortable: true, align: 'center' },
                   { field: 'Sequence', title: '序号', width: 100, hidden: true, sortable: true, align: 'center' },
                   { field: 'PatientInfoJson', title: '病人基本信息', width: 100, hidden: true, sortable: true, align: 'center' }
                  ]],
                onSelect: function (rowIndex, rowData) {
                    
                        ShowStatVisitNumDetails();

                    
                },
                onLoadSuccess: function (Data) {
                    if (Data && Data.rows.length > 0) {
                        $('#cmb_timedifference').combogrid('setValue', Data.rows[0].RowID);
                    }else{
                      //没有维护项目组时，什么内容也不显示
                      $('#StatVisitNumDetails').datagrid({                    
                            toolbar: '#tb'
                      });
                    }
                }
            });

            //科室
            $('#cmb_Location').combogrid({
                url: me.actionUrlLocation + '?method=Find',
                panelWidth: 270,
                multiple: true,
                idField: 'RowID',
                textField: 'CName',
                columns: [[
                    { field: 'ck', checkbox: true },
					{ field: 'RowID', title: 'ID', width: 40, sortable: true, align: 'center', hidden: true },
					{ field: 'Code', title: '代码', width: 70, sortable: true, align: 'left' },
					{ field: 'CName', title: '名称', width: 150, sortable: true, align: 'left' }
                ]]
            });

            //工作组
            $('#cmb_WorkGroup').combogrid({
                url: me.actionUrlBaseLocation + '?method=FindWorkGroup',
                panelWidth: 270,
                multiple: true,
                idField: 'RowID',
                textField: 'CName',
                checkOnSelect: true,
                columns: [[
                    { field: 'ck', checkbox: true },
					{ field: 'RowID', title: 'ID', width: 70, hidden: true, sortable: true, align: 'center' },
                    { field: 'Code', title: '代码', width: 70, sortable: true, align: 'center' },
					{ field: 'CName', title: '名称', width: 150, sortable: true, align: 'left' }

                ]],
                onLoadSuccess: function (data) {
                    for (var i = 0; i < data.rows.length; i++) {
                        if (me.AccWorkGroupDR =="")
                            me.AccWorkGroupDR = data.rows[i].RowID;
                        else
                            me.AccWorkGroupDR = me.AccWorkGroupDR + "," + data.rows[i].RowID;
                    }
                    $('#cmb_timedifference').combogrid({
                        method:'post',
                        url: me.actionUrlTestCodeGroup + '?method=QryBTTATTestCodeGroup&WorkGroupDR=' + me.AccWorkGroupDR
                    });

                    },
                onChange: function (newValue, oldValue) {
                    $('#cmb_WorkGroupMachine').combogrid("setValue", "");
                    $('#cmb_WorkGroupMachine').combogrid("grid").datagrid({
                        url: me.actionUrlBaseLocation + '?method=FindWorkGroupMachine&WorkGroupDR=' + $('#cmb_WorkGroup').combogrid("getValues").toString()
                    });
                }
            });

            //工作小组
            $('#cmb_WorkGroupMachine').combogrid({
                url: me.actionUrlBaseLocation + '?method=FindWorkGroupMachine',
                panelWidth: 270,
                multiple: true,
                idField: 'RowID',
                textField: 'CName',
                columns: [[
				{ field: 'ck', checkbox: true },
					{ field: 'RowID', title: 'ID', width: 40, sortable: true, align: 'center', hidden: true },
					{ field: 'Code', title: '代码', width: 70, sortable: true, align: 'center' },
					{ field: 'CName', title: '名称', width: 150, sortable: true, align: 'left' }
                ]],
                onChange: function (newValue, oldValue) {
                    $('#cmb_TestSet').combogrid("setValue", "");
                    $('#cmb_TestSet').combogrid("grid").datagrid({
                        url: me.actionUrlBaseLocation + '?method=FindTestSet&WorkGroupDR=' + $('#cmb_WorkGroup').combogrid("getValues").toString() + '&WorkGroupMachineDR=' + $('#cmb_WorkGroupMachine').combogrid("getValues").toString()
                    });
                }
            });
            //医嘱
            $('#cmb_TestSet').combogrid({
                url: me.actionUrlBaseLocation + '?method=FindTestSet',
                panelWidth: 270,
                multiple: true,
                idField: 'RowID',
                textField: 'CName',
                columns: [[
				    { field: 'ck', checkbox: true },
					{ field: 'RowID', title: 'ID', width: 40, hidden: true, sortable: true, align: 'center' },
					{ field: 'Code', title: '代码', width: 70, sortable: true, align: 'center' },
					{ field: 'CName', title: '名称', width: 150, sortable: true, align: 'left' }
				]]
            });

            $('#btnWorkGroupConnectHisDepSet').bind('click', function () {
                var readOnly = 1;//无项目组编辑权限时，只能查看配置
                if (me.ConfigTCG =="True") {  
                    readOnly = 0;
                }
                var selectTCGroupDR = $('#cmb_timedifference').combobox('getValue');
                showwin("#winWorkGroupConnectHisDepSet", "项目组配置", '../../sys/form/frmBTTATTestCodeGroup.aspx?readOnly=' + readOnly + "&selectTCGroupDR=" + selectTCGroupDR, document.body.clientWidth - 40, 600, true);
            });

            //开始时间
            $('#dtFindSttTime').timespinner({
                showSeconds: true
            });

            //结束时间
            $('#dtFindEndTime').timespinner({
                showSeconds: true
            });

            //$('#dtFindSttTime').numberspinner('disable');
            //$('#dtFindEndTime').numberspinner('disable');

            $('#cmb_TimeType').combobox({
                onSelect: function (record) {
                    if (record.value == 0) {
                        $('#dtFindSttTime').numberspinner('enable');
                        $('#dtFindEndTime').numberspinner('enable');
                    }
                    else
                    {
                        $('#dtFindSttTime').numberspinner('disable');
                        $('#dtFindEndTime').numberspinner('disable'); 
                    }
					
                }
            });       
        } 

        //加载标本的grid
        function ShowStatVisitNumDetails() {
            var FTestCodeGroupDR = $('#cmb_timedifference').combobox('getValue');
            $.ajax({
                type: "GET",
                dataType: "json", //text, json, xml
                cache: false, //
                async: false, //为true时，异步，不等待后台返回值，为false时强制等待；-asir
                url: me.actionUrlTATMulResultByTestCodeGroup + '?Method=QryTATMulResultConditionMTHD&FTestCodeGroupDR=' + FTestCodeGroupDR,
                success: function (result, status) {
                    //先清空me.columns中的值
                    me.columns = [];
                    var resultInfo = [];
                    var PatientInfoJson = result[0].PatientInfoJson;

                    for (var i = 0; i < PatientInfoJson.length; i++) {
                        var obj = new Object();
                        obj.field = PatientInfoJson[i].ExportCode;
                        obj.title = PatientInfoJson[i].ExportCodeName;
                        if (PatientInfoJson[i].Description !=undefined)
                        {
                            if (PatientInfoJson[i].Description != "" && PatientInfoJson[i].Description != null)
                            {
                                obj.title = PatientInfoJson[i].Description;
                            }
                            
                        }
                        obj.sortable = true;
                        obj.width = parseInt(PatientInfoJson[i].width);
                        obj.align = 'left';
                        if (PatientInfoJson[i].ExportCode.indexOf('Date') > 0) {
                            obj.align = 'center';
                        }
                        if (PatientInfoJson[i].ExportCode.indexOf('Time') > 0) {
                            obj.align = 'center';
                        }
                        obj.sequence = PatientInfoJson[i].sequence;
                        obj.Frozen = true;
                        resultInfo.push(obj);
                    }
                   
                    if (result[0].Descriptionstring.length > 0) {
                        var strArray = new Array();
                        strArray = result[0].Descriptionstring.split('@');
                        for (var key in strArray) {
                            var TitelDesc = strArray[key];
                            TitelDesc = TitelDesc.split("|")[0];
                            var width = 90;
                            var sequence = "9999"; if (strArray[key].indexOf("||") > -1) sequence = parseInt(strArray[key].split("||")[1]);
                            var obj = new Object();
                            obj.field = 'TestCodeList' + key;
                            obj.title = TitelDesc;
                            obj.sortable = true;
                            
                            obj.width = width;
                            obj.align = 'left';
                            obj.sequence = sequence;
                            resultInfo.push(obj);
                        }
                    }
                    ArraySort(resultInfo);
                    me.columns = resultInfo;

                    $('#StatVisitNumDetails').datagrid({
                        method: 'post',
                        fit: true,
                        fitColumns: false,
                        collapsible: true,
                        rownumbers: true,
                        singleSelect: true,
                        selectOnCheck: true,
                        checkOnSelect: false,
                        nowrap: true,  //折行
                        toolbar: '#tb',
                        pagination: 20,
                        pageList: [20, 50, 100, 200, 500],
                        border: true,
                        remoteSort: true,
                        showFooter: true,
                        onLoadSuccess: function (data) {
                            var dg = $(this);
                            var opts = dg.datagrid('options');
                            if (!opts.url) return; //初始loadData跳过
                            var allParams = $.extend({}, opts.queryParams, { page: 1, rows: 99999 });
                            $.ajax({
                                url: opts.url, type: 'POST', data: allParams, dataType: 'json',
                                success: function (fullData) {
                                    if (fullData && fullData.rows) {
                                        dg.datagrid('reloadFooter', buildFooter(fullData.rows));
                                    }
                                }
                            });
                        },
                        columns: [me.columns]
                    });
                    $('#StatVisitNumDetails').datagrid('loadData', []);
                    Search();
                }
            });
        };

        function ArraySort(array) {

            var temp = "";
            for (var i = 0; i < array.length; i++) {
                for (var j = i + 1; j < array.length; j++) {
                    if (parseInt(array[i].sequence) > parseInt(array[j].sequence)) {
                        temp = array[j];
                        array[j] = array[i];
                        array[i] = temp;
                    }
                }
            }
        }

        //隐藏与显示年季度统计与日期统计
        function Hidden(flag) {
            switch (flag) {
                case 0:
                    $(".td_Year").show();
                    $(".td_date").hide();
                    $(".td_Season").hide();
                    $(".td_Month").hide();
                    me.Displayflag = 1;
                    var MyDate = new Date();
                    $('#StatYear').combobox('setValue', MyDate.getFullYear());
                    $('#Statseason').combobox('setValue', "");
                    $('#td_SttMonth').combobox('setValue', "");
                    Search();
                    break;
                case 1:
                    $(".td_Year").show();
                    $(".td_Season").show();
                    $(".td_date").hide();
                    $(".td_Month").hide();
                    me.Displayflag = 1;
                    var MyDate = new Date();
                    $('#StatYear').combobox('setValue', MyDate.getFullYear());
                    $('#td_SttMonth').combobox('setValue', "");
                    var Month = MyDate.getMonth();
                    if ((0 <= Month) && (Month <= 2)) {
                        $('#Statseason').combobox('setValue', 1);
                    }
                    if ((3 <= Month) && (Month <= 5)) {
                        $('#Statseason').combobox('setValue', 2);
                    }
                    if ((6 <= Month) && (Month <= 8)) {
                        $('#Statseason').combobox('setValue', 3);
                    }
                    if ((9 <= Month) && (Month <= 11)) {
                        $('#Statseason').combobox('setValue', 4);
                    }
                    Search();
                    break;
                case 2:
                    $(".td_Year").show();
                    $(".td_Month").show();
                    $(".td_Season").hide();
                    $(".td_date").hide();
                    me.Displayflag = 1;
                    var MyDate = new Date();
                    $('#StatYear').combobox('setValue', MyDate.getFullYear());
                    $('#Statseason').combobox('setValue', "");
                    var NowMonth = MyDate.getMonth() + 1;
                    $('#td_SttMonth').combobox('setValue', NowMonth);
                    Search();
                    break;
                case 3:
                    $(".td_Year").hide();
                    $(".td_date").show();
                    $(".td_Season").hide();
                    $(".td_Month").hide();
                    me.Displayflag = 1;
                    $('#StatYear').combobox('setValue', "");
                    $('#Statseason').combobox('setValue', "");
                    $('#td_SttMonth').combobox('setValue', "");
                    Search();
                    break;

            }
        }
		///项目组结果条件查询
        function Reject() {
            showwin("#win_RejectSample", "结果条件", "frmResultCondition.aspx?", 590, 300, true);
        }


        ///构建footer汇总行（基于全量数据）
        function buildFooter(rows) {
            var footerRow = {};
            var tcFields = [];
            for (var c = 0; c < me.columns.length; c++) {
                var fld = me.columns[c].field;
                if (fld.indexOf('TestCodeList') === 0) tcFields.push(fld);
            }
            if (me.columns.length > 0) {
                footerRow[me.columns[0].field] = '汇总（不为空数）';
            }
            //统计每个TestCodeList*列非空行数
            for (var t = 0; t < tcFields.length; t++) {
                var fld = tcFields[t], cnt = 0;
                for (var r = 0; r < rows.length; r++) {
                    var v = rows[r][fld];
                    if (v !== null && v !== undefined && v !== '') cnt++;
                }
                footerRow[fld] = cnt;
            }
            return [footerRow];
        }

        //查询
        function Search() {
			var internalDays=30;
			var sysValue=GetSYSParameter("STATTIMED","SYS","SYS");
			if(sysValue.length>0&&parseInt(sysValue)>0)
			{
				internalDays=parseInt(sysValue);
			}
			var FTestCodeGroupDR = $('#cmb_timedifference').combobox('getValue');
			if (FTestCodeGroupDR.length <= 0)
			    return;
            var SttDate = $('#dt_FindSttDate').datebox('getValue');
            var EndDate = $('#dt_FindEndDate').datebox('getValue');
            var StatYear = $('#StatYear').combobox('getValue');
            var Statseason = $('#Statseason').combobox('getValue');
            var SttMonth = $('#td_SttMonth').combobox('getValue');
            var Location = $('#cmb_Location').combobox('getValues').toString();
            var EpisodeNo = $("#EpisodeNo").val();
            var WorkGroupDR = $('#cmb_WorkGroup').combobox('getValues').toString();
            var WorkGroupMachineDR = $('#cmb_WorkGroupMachine').combobox('getValues').toString();
            var TestSetDR = $('#cmb_TestSet').combobox('getValues').toString();
            var TimeType = $('#cmb_TimeType').combobox('getValue');


            var SttTime = "";
            var EndTime = "";
            if (TimeType == 0)
            {
                SttTime = $("#dtFindSttTime").timespinner('getValue');
                EndTime = $("#dtFindEndTime").timespinner('getValue');
            }

            var StatType = me.StatType;
            if (StatYear.length > 0) {
                if (Statseason.length) {
                    switch (Statseason) {
                        case '1':
                            var SttDate = StatYear + '-' + '01' + '-' + '01';
                            var EndDate = StatYear + '-' + '03' + '-' + getLastDay(StatYear, 3);
                            break;
                        case '2':
                            var SttDate = StatYear + '-' + '04' + '-' + '01';
                            var EndDate = StatYear + '-' + '06' + '-' + getLastDay(StatYear, 6);
                            break;
                        case '3':
                            var SttDate = StatYear + '-' + '07' + '-' + '01';
                            var EndDate = StatYear + '-' + '09' + '-' + getLastDay(StatYear, 9);
                            break;
                        case '4':
                            var SttDate = StatYear + '-' + '10' + '-' + '01';
                            var EndDate = StatYear + '-' + '12' + '-' + getLastDay(StatYear, 12); ;
                            break;
                    }
                }
                if (SttMonth.length) {

                    if (SttMonth.length == 1) {

                        var SttDate = StatYear + '-' + '0' + SttMonth + '-' + '01';
                        var EndDate = StatYear + '-' + '0' + SttMonth + '-' + getLastDay(StatYear, SttMonth);
                    } else {

                        var SttDate = StatYear + '-' + SttMonth + '-' + '01';
                        var EndDate = StatYear + '-' + SttMonth + '-' + getLastDay(StatYear, SttMonth);

                    }

                }
                if ((Statseason.length == 0) && (SttMonth.length == 0)) {
                    var SttDate = StatYear + '-' + '01' + '-' + '01';
                    var EndDate = StatYear + '-' + '12' + '-' + getLastDay(StatYear, 12);
                }
            }
			if(daysBetween($('#dt_FindEndDate').datebox("getValue"), $('#dt_FindSttDate').datebox("getValue"))>internalDays){
				$.messager.confirm('操作确认', '您查询单天数过长超过维护的' + internalDays+ "天。查询时间过长，是否继续查询？", b = function (r) {
				if (r) {
						 $('#StatVisitNumDetails').datagrid({
						     url: me.actionUrlTATMulResultByTestCodeGroup + '?Method=QryTATMulResultByTestCodeGroup',
						queryParams: { SttDate: SttDate, EndDate: EndDate, FTestCodeGroupDR: FTestCodeGroupDR, Location: Location, EpisodeNo: EpisodeNo, WorkGroupDR: WorkGroupDR, WorkGroupMachineDR: WorkGroupMachineDR, TestSetDR: TestSetDR, SttTime: SttTime, EndTime: EndTime, TimeType: TimeType }
						});
					}
				});
			}
			else{
			$('#StatVisitNumDetails').datagrid({
			    url: me.actionUrlTATMulResultByTestCodeGroup + '?Method=QryTATMulResultByTestCodeGroup',
                queryParams: { SttDate: SttDate, EndDate: EndDate, FTestCodeGroupDR: FTestCodeGroupDR, Location: Location, EpisodeNo: EpisodeNo, WorkGroupDR: WorkGroupDR, WorkGroupMachineDR: WorkGroupMachineDR, TestSetDR: TestSetDR, SttTime: SttTime, EndTime: EndTime, TimeType: TimeType }
				});
			}
           

        }
        // 导出全量数据：AJAX 取 JSON → 客户端生成 CSV（BOM + UTF-8）
        function doExport() {
            var rows = $('#StatVisitNumDetails').datagrid('getRows');
            if (rows.length == 0) {
                $.messager.alert('提示', '请先查询数据后再导出！');
                return;
            }
            $.messager.progress({ title: '请稍候', msg: '正在导出数据...' });
            var opts = $('#StatVisitNumDetails').datagrid('options');
            var params = $.extend({}, opts.queryParams, { page: 1, rows: 99999 });
            $.ajax({
                url: opts.url, type: 'POST', data: params, dataType: 'json',
                success: function (data) {
                    $.messager.progress('close');
                    if (data.rows && data.rows.length > 0) {
                        var headers = [], fields = [];
                        for (var c = 0; c < me.columns.length; c++) {
                            if (me.columns[c].hidden) continue;
                            headers.push(me.columns[c].title);
                            fields.push(me.columns[c].field);
                        }
                        var csv = '﻿' + headers.join(',') + '\n';
                        for (var r = 0; r < data.rows.length; r++) {
                            var row = [];
                            for (var f = 0; f < fields.length; f++) {
                                var v = data.rows[r][fields[f]];
                                v = (v != null) ? String(v).replace(/"/g, '""') : '';
                                if (v.indexOf(',') > -1 || v.indexOf('"') > -1 || v.indexOf('\n') > -1) {
                                    v = '"' + v + '"';
                                }
                                row.push(v);
                            }
                            csv += row.join(',') + '\n';
                        }
                        //汇总行：统计每个 TestCodeList* 列非空行数
                        var summaryRow = [];
                        for (var f2 = 0; f2 < fields.length; f2++) {
                            if (fields[f2].indexOf('TestCodeList') === 0) {
                                var cnt = 0;
                                for (var r2 = 0; r2 < data.rows.length; r2++) {
                                    var v2 = data.rows[r2][fields[f2]];
                                    if (v2 !== null && v2 !== undefined && v2 !== '') cnt++;
                                }
                                summaryRow.push(cnt);
                            } else if (f2 === 0) {
                                summaryRow.push('汇总（不为空数）');
                            } else {
                                summaryRow.push('');
                            }
                        }
                        csv += summaryRow.join(',') + '\n';
                        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
                        var link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = '项目组结果查询.csv';
                        link.click();
                    } else {
                        $.messager.alert('提示', '没有数据可以导出！');
                    }
                },
                error: function () {
                    $.messager.progress('close');
                    $.messager.alert('错误', '导出失败，请重试！');
                }
            });
        }
        function ExportExcel() { doExport(); }
        //打印
        function Print() {
            var FTestCodeGroupDR = $('#cmb_timedifference').combobox('getValue');
            var SttDate = $('#dt_FindSttDate').datebox('getValue');
            var EndDate = $('#dt_FindEndDate').datebox('getValue');
            var StatYear = $('#StatYear').combobox('getValue');
            var Statseason = $('#Statseason').combobox('getValue');
            var SttMonth = $('#td_SttMonth').combobox('getValue');
            var Location = $('#cmb_Location').combobox('getValues').toString();
            var EpisodeNo = $("#EpisodeNo").val();
            var WorkGroupMachineDR = $('#cmb_WorkGroupMachine').combobox('getValues').toString();
            var TestSetDR = $('#cmb_TestSet').combobox('getValues').toString();
            var StatType = me.StatType;
            if (StatYear.length > 0) {
                if (Statseason.length) {
                    switch (Statseason) {
                        case '1':
                            var SttDate = StatYear + '-' + '01' + '-' + '01';
                            var EndDate = StatYear + '-' + '03' + '-' + getLastDay(StatYear, 3);
                            break;
                        case '2':
                            var SttDate = StatYear + '-' + '04' + '-' + '01';
                            var EndDate = StatYear + '-' + '06' + '-' + getLastDay(StatYear, 6);
                            break;
                        case '3':
                            var SttDate = StatYear + '-' + '07' + '-' + '01';
                            var EndDate = StatYear + '-' + '09' + '-' + getLastDay(StatYear, 9);
                            break;
                        case '4':
                            var SttDate = StatYear + '-' + '10' + '-' + '01';
                            var EndDate = StatYear + '-' + '12' + '-' + getLastDay(StatYear, 12); ;
                            break;
                    }
                }
                if (SttMonth.length) {

                    if (SttMonth.length == 1) {

                        var SttDate = StatYear + '-' + '0' + SttMonth + '-' + '01';
                        var EndDate = StatYear + '-' + '0' + SttMonth + '-' + getLastDay(StatYear, SttMonth);
                    } else {

                        var SttDate = StatYear + '-' + SttMonth + '-' + '01';
                        var EndDate = StatYear + '-' + SttMonth + '-' + getLastDay(StatYear, SttMonth);

                    }

                }
                if ((Statseason.length == 0) && (SttMonth.length == 0)) {
                    var SttDate = StatYear + '-' + '01' + '-' + '01';
                    var EndDate = StatYear + '-' + '12' + '-' + getLastDay(StatYear, 12);
                }
            }

            //遍历表头数据，打印第一行
            var HeadArray = [];
            var HeadNameArray = [];
            var PrintFeild = [];
            var TextAligh = [];
            var TotalWidth = 0;
            for (var j = 0; j < me.columns.length; j++) {
                HeadArray.push(me.columns[j]["field"]);
                HeadNameArray.push(me.columns[j]["title"]);
                PrintFeild.push("filed" + (j + 1).toString());
                TextAligh.push("left");
                TotalWidth = parseInt(me.columns[j]["width"]) + TotalWidth;
            }
            var colRates = [];
            for (var j = 0; j < me.columns.length; j++) {
                colRates.push((parseInt(me.columns[j]["width"]) / TotalWidth) * 100);
            }
            //请求查询数据
            $.ajax({
                url: me.actionUrlTATMulResultByTestCodeGroup + '?Method=GetPrintData',
                data: { SttDate: SttDate, EndDate: EndDate, FTestCodeGroupDR: FTestCodeGroupDR, Location: Location, EpisodeNo: EpisodeNo, IsDisplayCount: "0", Items: HeadArray.toString(), ItemNames: HeadNameArray.toString(), WorkGroupMachineDR: WorkGroupMachineDR, TestSetDR: TestSetDR },
                success: function (data) {
                    if (data.length > 0) {
                        PrintWidget.Init();
                        //TemplatePrint("项目组结果打印", [{ "tableData": data}], "XMZJGDY", true);
                        PrintWidget.AddGrid(data, PrintFeild, colRates, TextAligh, 800, 10, 30, null, null, 15, null, 10, null, 1168);
                        PrintWidget.PrintOut()
                    }
                }
            })
        }
    </script>
</head>
<body class="easyui-layout" id="ids">
    <div id="div_Find" iconcls="icon-reload" split="false" style="height: 70px;" data-options="region:'north',border:'false',noheader:'true'"
        style="padding: 5px; background: #eee;">
        <div id="div_Simple" style="white-space: nowrap;">
            <table>
                <tr>
                    <td colspan="2" align="left">
                        <div class="easyui-panel" style="padding: 2px;">
                            <a href="#" class="easyui-linkbutton" data-options="toggle:true,group:'g2',plain:true,selected:true"
                                onclick="Hidden(3);">日统计</a> <a href="#" class="easyui-linkbutton" data-options="toggle:true,group:'g2',plain:true"
                                    onclick="Hidden(2);">月统计</a><a href="#" class="easyui-linkbutton" data-options="toggle:true,group:'g2',plain:true"
                                        onclick="Hidden(1);">季统计</a> <a href="#" class="easyui-linkbutton" data-options="toggle:true,group:'g2',plain:true"
                                            onclick="Hidden(0);">年统计</a>
						</div>
					</td>
                    <th height="25" width="70px" align="right" class="td_Year">
                        统计年份
                    </th>
                    <td height="25"  align="left" class="td_Year">
                        <select id="StatYear" name="StatYear" style="width: 150px;">
                            <option value="" selected="true"></option>
                        </select>
                    </td>
                    <th height="25" width="70px" align="right" class="td_Season">
                       统计季度
                    </th>
                    <td height="25"  align="left" class="td_Season">
                        <select class="easyui-combobox" name="Statseason" id="Statseason" panelheight="100px"
                            style="width: 150px;">
                            <option value="" selected="true"></option>
                            <option value="1">第一季度</option>
                            <option value="2">第二季度</option>
                            <option value="3">第三季度</option>
                            <option value="4">第四季度</option>
                        </select>
                    </td>
                    <th height="25" width="70px" align="right" class="td_Month">
                        统计月份
                    </th>
                    <td height="25" align="left" class="td_Month">
                        <select class="easyui-combobox" id="td_SttMonth" name="Month" style="width: 150px;">
                            <option value="" selected="true"></option>
                            <option value="1">1月</option>
                            <option value="2">2月</option>
                            <option value="3">3月</option>
                            <option value="4">4月</option>
                            <option value="5">5月</option>
                            <option value="6">6月</option>
                            <option value="7">7月</option>
                            <option value="8">8月</option>
                            <option value="9">9月</option>
                            <option value="10">10月</option>
                            <option value="11">11月</option>
                            <option value="12">12月</option>
                        </select>
                    </td>
                    <th height="25" width="70px" align="right" class="td_date">
                        开始日期
                    </th>
                    <td height="25"  align="left" class="td_date">
                        <input class="easyui-datebox" name="dtFindSttDate" id="dt_FindSttDate" data-options="formatter:DateFormatter,parser:DateParser"
                            style="width: 150px;" />
                    </td>
                    <th height="25" width="70px" align="right" class="td_date">
                        结束日期
                    </th>
                    <td height="25" align="left" class="td_date">
                        <input class="easyui-datebox" name="dtFindEndDate" id="dt_FindEndDate" data-options="formatter:DateFormatter,parser:DateParser"
                            style="width: 150px;" />
                    </td>
                    <th align="right">
                         &nbsp;&nbsp;申请科室 
                    </th>
                    <td align="left">
                        <select class="easyui-validatebox" name="Location" id="cmb_Location" style="width: 120px;" />
                    </td>
                    <th align="right">
                        &nbsp;&nbsp;流水号 
                    </th>
                    <td align="left">
                        <input type="text" id="EpisodeNo" placeholder="号段以'-'分割" style="width: 120px" />
                    </td>
                    <th align="right" style="padding: 2px;">&nbsp;&nbsp;工作组
                    </th>
                    <td align="left">
                        <select class="easyui-validatebox" name="WorkGroupDR" id="cmb_WorkGroup"
                            style="width: 120px;" />
                    </td>
                </tr>
                <tr>
                    <th align="right">
                        &nbsp;&nbsp;工作小组 
                    </th>
                    <td align="left">
                        <select class="easyui-validatebox" name="WorkGroupMachine" id="cmb_WorkGroupMachine"
                            style="width: 150px;" />
                    </td>
                    <th align="right">
                        &nbsp;&nbsp;医嘱名称
                    </th>
                    <td align="left">
                        <select name="TestSet" id="cmb_TestSet" style="width: 150px;"  />
                    </td>
                    <th align="center" >
                        &nbsp;&nbsp;时间类型
                    </th>
                    <td align="center">
                        <select class="easyui-combobox" id="cmb_TimeType" name="TimeType" panelheight="auto" style="width: 150px;">
                            <option value="0">时间段</option>
                            <option value="1">白班</option>
                            <option value="2">夜班</option>
                        </select>
                    </td>
                    <th align="right">                      
                        &nbsp;&nbsp;开始时间
                    </th>
                    <td align="left">
                        <input class="easyui-timespinner" id="dtFindSttTime" name="SttTime" data-options="formatter:DateFormatter,parser:DateParser" style="width: 120px;" />
                    </td>
                   <th align="right">
                        &nbsp;&nbsp;结束时间
                    </th>
                    <td align="left">
                        <input class="easyui-timespinner" id="dtFindEndTime" name="EndTime" data-options="formatter:DateFormatter,parser:DateParser" style="width: 125px;" />
                    </td>
                    <td colspan="2" align="left">
                            &nbsp;<a href="javascript:void(0)" id="btn_find" class="easyui-linkbutton" icon="icon-search"
                            onclick="Search();">查询</a> 
							 &nbsp;<a href="javascript:void(0)" id="btn_Export" class="easyui-linkbutton"
                                icon="icon-table_link" onclick="ExportExcel(1);">导出</a>			
                </tr>
            </table>
        </div>
    </div>
    <div id="tabOrder"  data-options="region:'center',border:'true'" style="padding: 2px;">
        <table id="StatVisitNumDetails">
        </table>
    </div>
	 <div id="win_RejectSample">
    </div>
    <iframe id="if_download"></iframe>
    <div id="winWorkGroupConnectHisDepSet" title="医嘱项组配置" style="overflow: hidden;">
    </div>
    <div id="tb">
        <div>
            <table cellpadding="0" cellspacing="0">
                <tr>
                    <td align="right">
                        &nbsp;结果列表&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    </td> 
                     <td align="right">
                        &nbsp;
                    </td>   
                     <td align="right">
                        &nbsp;
                    </td>                 
                    <th  align="right">
                        项目组&nbsp;
                    </th>
                    <td  align="left">
                        <select class="easyui-validatebox" name="timedifference" id="cmb_timedifference" style="width: 170px;" />
                    </td>
                    <td align="left">
                        &nbsp;&nbsp;<a href="#" id="btnWorkGroupConnectHisDepSet" class="easyui-linkbutton" iconcls="icon-application";" >项目组配置</a>
                    </td>
                </tr>
            </table>
        </div>
     </div>

</body>
</html>

