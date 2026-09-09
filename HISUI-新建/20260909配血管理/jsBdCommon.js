/*******************************************************
* 功能介绍：血库管理系统公用js
* 创建人： 曾文天
* 创建日期：2015/11/20
**********************************************************/
//血库系统全局变量
var BD = {
    //颜色配置
    IsIssuedColor: {     //是否已发血状态颜色配置对象
        ALL: 'green',     //全部发血
        PART: 'blue',     //部分发血
        NO: 'red'         //未发血
    },
    IsXMPlanedColor: {     //是否已配血状态颜色配置对象
        YES: 'green',     //已配血
        NO: 'red'         //未配血
    },
    RHColor: {     //是否已配血状态颜色配置对象
        N: 'red',         //阴性
        P: 'blue'         //阳性
    },
    XMLastResultColor:{
        1: 'blue',
        2: 'red'
    },
    XMLastResultIssueControl: {//针对配血实验结果的发血控制
        1: true,    //true 允许发血
        2: false    //false 不允许发血
    },
    PackStatusColor: {     //血袋状态颜色配置对象
        CREATED: 'blue',        //未审核
        PRECHECKED: 'orange',   //已初审
        CHECKED_ALL: 'green',   //已审核
        CHECKED_PART: 'purple', //已审部分
        CANCELLED: '#DA5094',   //取消审核
        DISCARDED: 'red',       //作废
        CLOSED: 'yellow',       //已关闭
        REMOVED: 'gray'         //已删除
    },
    ReqFormXMPlanStatusColor: {    //申请单配血状态颜色配置对象
        UNXM: 'blue',               //未配血
        XM: 'orange',               //已配血
        ISSUEED_PART: 'purple',     //部分发血
        ISSUEED_ALL: 'green'        //全部发血
    },
    //配血计划状态：新建，审核，发血，退库
    XMPlanStatus: {
        "CREATED": { "CName": "新建", "Color": "purple" },
        "FINISHED":{"CName": "审核", "Color": "blue" },
        "ISSUED":{"CName": "发血", "Color": "green" },
        "RETURNED": { "CName": "退库", "Color": "red" }
        },
    KeyNumColor: {          //关键数字颜色配置对象
        MORE_ZERO: 'blue',  //大于0的字体颜色
        lESS_ZERO: 'red'    //小于0的字体颜色
    },
    CostItemType: { "": "未定义", "1": "统一", "2": "自定义" }, //BTCostItem ItemType
    ReqFormCostItemCostType: { "": "未定义", "0": "未定义", "5": "申请血产品", "6": "血型复检", "10": "交叉配血", "15": "血费", "20": "血液其他费用", "25": "手工计费", "30": "自体血费用" }, //BD_ReqFormCostItem  CostType
    ReqFormCostItemItemStatus: { "": { CName: "未定义", Color: "purple" }, "10": { CName: "创建", Color: "" }, "20": { CName: "执行", Color: "green" }, "30": { CName: "取消", Color: "#ccc" } },
    IssueRecordStatus: { "": "未定义", "1": "发血", "5": "取消" }, //BDIssueRecord  Status
    IssueRecordStatusColor: {          //关键数字颜色配置对象
        1: 'blue',  //大于0的字体颜色
        5: 'red'    //小于0的字体颜色
    },
    //申请单类型
    ReqFormType: {
        
    },
    ColumnBackColor: '#FF7F50', //可编辑单元格背景颜色
    //字体配置
    KeyNumSize: '18px',  //关键数字字体大小
    RH: [{ 'Name': '阳性', 'Code': 'P' }, { 'Name': '阴性', 'Code': 'N'}],   //RH血型
    Whether: [{ 'Name': '是', 'Value': true }, { 'Name': '否', 'Value': false }], //是否
    Pack_BillType: [{ 'Name': '按袋收', 'Value': 10 }, { 'Name': '按量收', 'Value': 20}],  //血袋联合费用医嘱项计费类型
    AdmType: [ //就诊类型 I住院,O门诊,H体检,E急诊,N新生儿,R科研,P药理,G其他(必填)
        { 'Name': 'I住院', 'Value': 'I' },
        { 'Name': 'O门诊', 'Value': 'O' },
        { 'Name': 'H体检', 'Value': 'H' },
        { 'Name': 'E急诊', 'Value': 'E' },
        { 'Name': 'N新生儿', 'Value': 'N' },
        { 'Name': 'R科研', 'Value': 'R' },
        { 'Name': 'P药理', 'Value': 'P' },
        { 'Name': 'G其他', 'Value': 'G' }
        ],
    BdTypeColor:{
      BdABColor:"",
      BdAColor:"",
      BdBColor:"",
      BdOColor:"",
      BdABBackGroundColor:"",
      BdABackGroundColor:"",
      BdBBackGroundColor:"",
      BdOBackGroundColor:"", 
      BdRHNColor:"",
      BdRHNBackGroundColor: "",
      BdRHPColor: "",
      BdRHPBackGroundColor:""
    },
   BdColor:{
    FontColor:"",
    BackGroundColor:""
   }
};
$(function () {
    //血袋状态
    $.ajax({
        type: "post",
        dataType: "json", //text, json, xml
        cache: false, //
        async: true, //为true时，异步，不等待后台返回值，为false时强制等待；-asir
       // url: "../../newcodetable/ashx/ashCodeTable.ashx?Model=SYSParameter&GlobalParam=ParaTypeCode:WG,&Method=QueryView&sort=Sequence&order=asc&pagination=false",
        url: "../../sys/ashx/ashSYSBDParamters.ashx" + "?Method=FindByCode&ParaType=WG" + "&CodeString=BdABColor^BdAColor^BdBColor^BdOColor^BdRHNColor^BdRHPColor",
        success: function (returnData) {
            for (var i = 0; i < returnData.length; i++) {
                if (returnData[i].Code == "BdABColor" && returnData[i].RowID > 0) {
                    BD.BdTypeColor.BdABColor = returnData[i].ParaValue;
                    BD.BdTypeColor.BdABBackGroundColor = returnData[i].ParaList;
                }
                if (returnData[i].Code == "BdAColor" && returnData[i].RowID > 0) {
                    BD.BdTypeColor.BdAColor = returnData[i].ParaValue;
                    BD.BdTypeColor.BdABackGroundColor = returnData[i].ParaList;
                }
                if (returnData[i].Code == "BdBColor" && returnData[i].RowID > 0) {
                    BD.BdTypeColor.BdBColor = returnData[i].ParaValue;
                    BD.BdTypeColor.BdBBackGroundColor = returnData[i].ParaList;
                }
                if (returnData[i].Code == "BdOColor" && returnData[i].RowID > 0) {
                    BD.BdTypeColor.BdOColor = returnData[i].ParaValue;
                    BD.BdTypeColor.BdOBackGroundColor = returnData[i].ParaList;
                }
                if (returnData[i].Code == "BdRHNColor" && returnData[i].RowID > 0) {
                    BD.BdTypeColor.BdRHNColor = returnData[i].ParaValue;
                    BD.BdTypeColor.BdRHNBackGroundColor = returnData[i].ParaList;
                }
                if (returnData[i].Code == "BdRHPColor" && returnData[i].RowID > 0) {
                    BD.BdTypeColor.BdRHPColor = returnData[i].ParaValue;
                    BD.BdTypeColor.BdRHPBackGroundColor = returnData[i].ParaList;
                }
            }
        }
    });
});
function GetAdmType(val) {
    for (var i = 0; i < BD.AdmType.length; i++) {
        var atype = BD.AdmType[i];
        if (atype.Value == val) {
            return atype;
        }
    }
    return null;
}

function GetRH() {
    return BD.RH;
}

function GetWhether() {
    return BD.Whether;
}

function GetPack_BillType() {
    return BD.Pack_BillType;
}

function GetIssueRecordStatus(value) {
    return BD.IssueRecordStatus[value];
}

function GetIssueRecordStatusColor(value) {
    return BD.IssueRecordStatusColor[value];
}

function GetCostItemType(CostItemTypeDR) {
    return BD.CostItemType[CostItemTypeDR];
}

function GetReqFormCostItemCostType(CostTypeDR) {
    return BD.ReqFormCostItemCostType[CostTypeDR];
}

//获取配血计划最后结果对应的颜色
function GetXMLastResultColor(ResultDR) {
    return BD.XMLastResultColor[ResultDR];
}

//获取配血计划最后结果对应的发血控制
function GetXMLastResultIssueControl(ResultDR) {
    return BD.XMLastResultIssueControl[ResultDR];
}


//自动选中行，如果上次选中的行在当前数据列表中存在，则仍选中该行，否则选中第一行
//grid:数据网格对象，jQuery对象
//preRowID:上次选中行的唯一键RowID
function AutoSelect(grid, preRowID) {
    var data = grid.datagrid("getData");
    var isExist = false;
    for (var i = 0; i < data.rows.length; i++) {
        //通过唯一键比对，获得上次选中行的当前索引值，以便再次选中它
        if (data.rows[i].RowID == preRowID) {
            isExist = true;
            grid.datagrid('selectRow', i);
            break;
        }
    }
    if (!isExist) {
        //默认选择第一行
        grid.datagrid("selectRow", 0);
    }
}

//从一个对象数组中获取制定ID的对象
function GetObjectByID(objects, rowID) {
    for (var i = 0; i < objects.length; i++) {
        if (objects[i].RowID == rowID) {
            return objects[i];
        }
    }
}

//动态去掉不需要的采购明细行
function DeleteRow(grid, rowID) {
    var rows = grid.datagrid('getRows');
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (row.RowID == rowID) {
            grid.datagrid('deleteRow', i);
            return;
        }
    }
}

//删除指定rows对应的数据行的数据
function DeleteRows(grid, rows) {
    //先将需要删除的数据进行克隆
    var tmpDatas = [];
    for (var i = 0; i < rows.length; i++) {
        var tmp = {};
        tmp.RowID = rows[i].RowID;
        tmpDatas.push(tmp);
    }
    //根据tmpDatas,删除对应行
    for (var i = 0; i < tmpDatas.length; i++) {
        DeleteRow(grid, tmpDatas[i].RowID) 
    }
}

//动态更新DataGrid的行数据
function UpdateRow(grid, rowID, rowData) {
    var i = GetIndexByRowID(grid, rowID);
    if (i >= 0) {
        grid.datagrid('updateRow', { index: i, row: rowData });
    }
}

//根据数据唯一ID来获取DataGrid中的索引
function GetIndexByRowID(grid, rowID) {
    var rows = grid.datagrid('getRows');
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (row.RowID == rowID) {
            return i;
        }
    }
}

//根据数据中的是否默认，设置选中
function SetSelectedByIsDefault(objs) {
    for (var i = 0; i < objs.length; i++) {
        var obj = objs[i];
        if (obj.IsDefault) {
            obj.selected = true;
        }
    }
    return objs;
}

//根据数据中的获取默认项
function GetDefaultItem(objs, isDR) {
    var res = null;
    for (var i = 0; i < objs.length; i++) {
        var obj = objs[i];
        if (obj.IsDefault) {
            res = obj;
            break;
        }
    }
    if (isDR && res) {
        return res.RowID;
    }
    return res;
}

//根据原始的血袋编号获取真实的血袋编号 =0010416075909  
function GetPackNo(src, packIdLength) {
//    if (!src || src.length < 13) {
//        return src;
    //    } 
    if (!src || src.length < 4) {
          return src;
     }
    var pattern = new RegExp("[@*=|]");
    var rs = "";
    for (var i = 0; i < src.length; i++) {
        rs = rs + src.substr(i, 1).replace(pattern, '');
    }
    var newPackNo = rs;
    if (parseInt(packIdLength) > 0) {
        newPackNo = rs.substring(0, packIdLength);
    }
    //var newPackNo = rs.substring(Number(Arr[0]), Number(Arr[1]));
    return newPackNo;
}
function GetBdTypeColor(ABO, RH) { 
    if (RH!=null&& RH.indexOf("N") > -1) {
       BD.BdColor.FontColor=BD.BdTypeColor.BdRHNColor;
       BD.BdColor.BackGroundColor= BD.BdTypeColor.BdRHNBackGroundColor;
   }
   else if (ABO != null && ABO.indexOf("AB") > -1)
  { 
       BD.BdColor.FontColor=BD.BdTypeColor.BdABColor;
       BD.BdColor.BackGroundColor= BD.BdTypeColor.BdABBackGroundColor; 
  }
   else if (ABO != null && ABO.indexOf("A") > -1)
  { 
       BD.BdColor.FontColor=BD.BdTypeColor.BdAColor;
       BD.BdColor.BackGroundColor= BD.BdTypeColor.BdABackGroundColor; 
  }
   else if (ABO != null && ABO.indexOf("B") > -1)
  { 
       BD.BdColor.FontColor=BD.BdTypeColor.BdBColor;
       BD.BdColor.BackGroundColor= BD.BdTypeColor.BdBBackGroundColor; 
  }
   else if (ABO != null && ABO.indexOf("O") > -1)
  {
       BD.BdColor.FontColor=BD.BdTypeColor.BdOColor;
       BD.BdColor.BackGroundColor= BD.BdTypeColor.BdOBackGroundColor; 
  }
   return BD.BdColor;
}
