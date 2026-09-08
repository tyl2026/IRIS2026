/**
 * pha/tracecode/v2/api.js
 * 药品追溯码扫描,内容Load csp,如进入系统已经加载过,则之后不会重复加载
 */

try {
    if (top.$("#PHA_TraceCode_V2_Main").length > 0) {
        top.$("#PHA_TraceCode_V2_Main").window("destroy");
    }
} catch (e) { }

function ShowTraceCodeModal(paramOpts) {
    var locId = paramOpts.BsLocId || "";
    if (locId == "") {
        locId = session['LOGON.CTLOCID'];
    }
    var inputStr = session['LOGON.GROUPID'] + '^' + locId + '^^' + session['LOGON.HOSPID'];
    var apiSetStr = tkMakeServerCall('PHA.DTC.COM.Method', 'GetParamProp', inputStr);
    var apiSetArr = apiSetStr.split("^");
    var traceCodeFlag = apiSetArr[0];
    var BsReScan = paramOpts.BsReScan || "";
    if (traceCodeFlag != "Y") {
        if (BsReScan === "Y") {
            alert('该科室未开启追溯码业务，无需补追溯码!');
        }
        return;
    }
    var reasonURL = ChangeCspPathToAll("pha.tracecode.v2.main.csp");
    var BsId = paramOpts.BsId || "";
    var BsType = paramOpts.BsType || "";
    var BsOeoreStr = paramOpts.BsOeoreStr || "";

    var BsCodeType = apiSetArr[1];
    var BsShowFlag = apiSetArr[2];
    var BsAutoUpFlag = apiSetArr[3];
    if (BsShowFlag === "Y") {
        //如果所有业务单据的库存项信息中都没有维护标识码，将不展示界面
        var traceCodeFlag = tkMakeServerCall("PHA.DTC.Scan.Query", "ChkBsTypePrefix", BsId, BsType, BsCodeType, BsOeoreStr);
        if (traceCodeFlag != "1") {
            if (BsReScan === "Y") {
                alert('该业务单据中的药品都未维护标识码！');
            }
            return;
        }
    }
    var BsAutoGatherFlag = apiSetArr[4];
    if (top.$("#PHA_TraceCode_V2_Main").html() != undefined) {
        top.$("#PHA_TraceCode_V2_Main").window("open");
        // 如果不是重新加载,则重新修改内容
        var reasonFrm;
        var frms = top.frames;
        for (var i = frms.length - 1; i >= 0; i--) {
            if (frms[i].TRELOADPAGE == "pha.tracecode.v2.main.csp") {
                reasonFrm = frms[i];
                break;
            }
        }
        reasonFrm.PRA_BsId = BsId;
        reasonFrm.PRA_BsType = BsType;
        reasonFrm.PRA_BsShowFlag = BsShowFlag;
        reasonFrm.PRA_BsCodeType = BsCodeType;
        reasonFrm.PRA_BsAutoUpFlag = BsAutoUpFlag;
        reasonFrm.PRA_BsAutoGatherFlag = BsAutoGatherFlag;
        reasonFrm.PRA_BsOeoreStr = BsOeoreStr;
        reasonFrm.QueryBsInfo();
        return;
    } else {
        //入参比较长时这么处理可以避免 执行记录传递用
        if (BsOeoreStr != "") {
            var OeoreStrkey = 'OeoreStrKey_' + session['LOGON.USERID'] + Date.now();
            localStorage.setItem(OeoreStrkey, BsOeoreStr);
            BsOeoreStr = OeoreStrkey;
        }
    }

    var urlStr1 = "BsId=" + BsId + "&BsType=" + BsType + "&BsShowFlag=" + BsShowFlag + "&BsCodeType=" + BsCodeType + "&BsAutoUpFlag=" + BsAutoUpFlag;
    var urlStr2 = "BsAutoGatherFlag=" + BsAutoGatherFlag + "&BsOeoreStr=" + BsOeoreStr;
    websys_showModal({
        id: "PHA_TraceCode_V2_Main",
        url: reasonURL + "?" + urlStr1 + "&" + urlStr2,
        title: "药品追溯码录入<span style='color:red;'>&nbsp快捷键：ESC->关闭页面，F2->上传数据，F3->重载，F4->拆零匹配，F7->取码</span>",
        iconCls: "icon-w-list",
        width: "90%",
        height: "90%",
        closable: true,
        onClose: function () {
            //数据清除
            if (OeoreStrkey) {
                localStorage.removeItem(OeoreStrkey)
            }
            if (paramOpts.CloseFn) {
                paramOpts.CloseFn();
            }
            Setfocus();
        }
    });
}

/// 修改csp路径为完整路径
function ChangeCspPathToAll(pathcsp) {
    var pathname = window.location.pathname;
    pathname = pathname.split("/csp/")[0];
    pathcsp = pathname + "/csp/" + pathcsp;
    return pathcsp;
}
