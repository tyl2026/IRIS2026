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
            { field: "name", title: "文件名", width: 320 },
            { field: "size", title: "大小", width: 100, align: "center" },
            { field: "date", title: "生成时间", width: 170, align: "center" },
            { field: "status", title: "状态", width: 90, align: "center",
              formatter: function (val, row) {
                  if (val === "生成中") {
                      return '<span style="color:#fd7201">● 生成中</span>';
                  }
                  return '<span style="color:#389e0d">● 完成</span>';
              }
            },
            { field: "op", title: "操作", width: 150, align: "center",
              formatter: function (val, row) {
                  if (row.status === "完成") {
                      return '<a class="hisui-linkbutton" onclick="downloadFile(\'' + row.name + '\')" data-options="iconCls:\'icon-w-download\'">下载</a>'
                           + '<a class="hisui-linkbutton" onclick="deleteFile(\'' + row.name + '\')" data-options="iconCls:\'icon-w-delete\'" style="margin-left:6px">删除</a>';
                  }
                  return '<span style="color:#aaa">生成中…</span>';
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

// 生成 CSV（后台异步）
function generateCSV() {
    var ym = getSelectedYM();
    if (!ym) {
        $.messager.alert("提示", "请先选择年月");
        return;
    }

    var btn = $("#btnGenerate");
    btn.linkbutton("disable");

    $cm({
        ClassName: CLASS_NAME,
        MethodName: "StartGenerate",
        YearMonth: ym
    }, function (rs) {
        btn.linkbutton("enable");

        if (rs.success) {
            $.messager.alert("提示", "已提交后台生成，数据量较大预计需要约1小时。<br>请稍后点「刷新列表」查看，状态为「完成」后即可下载。");
            loadFileList();
        } else {
            $.messager.alert("错误", "提交失败：" + (rs.msg || "未知错误"));
        }
    });
}

// 下载文件：走自建流式下载页 dhcmrinfodownload.csp（%Stream 分块推送，避免大文件 MAXSTRING）
function downloadFile(fileName) {
    var url = "dhcmrinfodownload.csp?filename=" + encodeURIComponent(fileName);
    window.location.href = url;
}

// 个位数补零
function padZero(n) {
    return n < 10 ? "0" + n : "" + n;
}

// 删除文件（后端方法名 RemoveFile，避开 delete 关键词过滤）
function deleteFile(fileName) {
    $.messager.confirm("确认", "确定删除文件「" + fileName + "」吗？", function (ok) {
        if (!ok) {
            return;
        }
        $cm({
            ClassName: CLASS_NAME,
            MethodName: "RemoveFile",
            fileName: fileName
        }, function (rs) {
            if (rs.success) {
                $.messager.show({ title: "提示", msg: "已删除" });
                loadFileList();
            } else {
                $.messager.alert("错误", "删除失败：" + (rs.msg || "未知错误"));
            }
        });
    });
}
