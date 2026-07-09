// 门诊信息首页生成下载 — 前端 JS
// IE11 兼容：全部 var + function，无 ES6+

var CLASS_NAME = "web.YZSY.DHCMRInfoPageDownLoad";

// ========== 初始化 ==========
$(function () {
    initDateSelectors();
    initDatagrid();
    loadFileList();
});

// 初始化年月选择器
function initDateSelectors() {
    var now = new Date();
    var curYear = now.getFullYear();
    var curMonth = now.getMonth() + 1;

    // 年份下拉（最近5年）
    var yearData = [];
    for (var y = curYear; y >= curYear - 4; y--) {
        yearData.push({ value: y.toString(), text: y + "年" });
    }
    $("#selYear").combobox({
        data: yearData,
        valueField: "value",
        textField: "text",
        panelHeight: "auto",
        editable: false,
        onLoadSuccess: function () {
            $(this).combobox("setValue", curYear.toString());
        }
    });

    // 月份下拉
    var monthData = [];
    for (var m = 1; m <= 12; m++) {
        monthData.push({ value: padZero(m), text: m + "月" });
    }
    $("#selMonth").combobox({
        data: monthData,
        valueField: "value",
        textField: "text",
        panelHeight: "auto",
        editable: false,
        onLoadSuccess: function () {
            $(this).combobox("setValue", padZero(curMonth));
        }
    });
}

// 初始化文件列表 datagrid
function initDatagrid() {
    $("#dgFiles").datagrid({
        fit: true,
        border: false,
        rownumbers: true,
        singleSelect: true,
        pagination: false,
        columns: [[
            { field: "name", title: "文件名", width: 350 },
            { field: "size", title: "大小", width: 100, align: "center" },
            { field: "date", title: "生成时间", width: 180, align: "center" },
            { field: "op", title: "操作", width: 100, align: "center",
              formatter: function (val, row) {
                  return '<a class="hisui-linkbutton" onclick="downloadFile(\'' + row.name + '\')" data-options="iconCls:\'icon-w-download\'">下载</a>';
              }
            }
        ]]
    });
}

// 获取当前选中的年月值 "YYYY-MM"
function getSelectedYM() {
    var year = $("#selYear").combobox("getValue");
    var month = $("#selMonth").combobox("getValue");
    if (!year || !month) {
        return "";
    }
    return year + "-" + month;
}

// 年月变更回调（预留）
function onYearMonthChange() {
    // 切换年月时预留处理
}

// 加载文件列表
function loadFileList() {
    $cm({
        ClassName: CLASS_NAME,
        MethodName: "ListFiles"
    }, function (data) {
        $("#dgFiles").datagrid("loadData", data || []);
    });
}

// 生成 CSV
function generateCSV() {
    var ym = getSelectedYM();
    if (!ym) {
        $.messager.alert("提示", "请先选择年月");
        return;
    }

    var btn = $("#btnGenerate");
    btn.linkbutton("disable");

    $.messager.progress({ title: "请稍候", msg: "正在生成 CSV 文件..." });

    $cm({
        ClassName: CLASS_NAME,
        MethodName: "GenerateCSV",
        YearMonth: ym
    }, function (rs) {
        $.messager.progress("close");
        btn.linkbutton("enable");

        if (rs.success) {
            $.messager.alert("提示", "生成成功！<br>文件：" + rs.fileName);
            loadFileList();
        } else {
            $.messager.alert("错误", "生成失败：" + (rs.msg || "未知错误"));
        }
    });
}

// 下载文件
function downloadFile(fileName) {
    $.messager.progress({ title: "请稍候", msg: "正在下载..." });

    $m({
        ClassName: CLASS_NAME,
        MethodName: "DownloadFile",
        fileName: fileName
    }, function (content) {
        $.messager.progress("close");

        if (!content) {
            $.messager.alert("错误", "文件不存在或为空");
            return;
        }

        var bom = "﻿";
        var blob = new Blob([bom + content], { type: "text/csv;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

// 个位数补零
function padZero(n) {
    return n < 10 ? "0" + n : "" + n;
}
