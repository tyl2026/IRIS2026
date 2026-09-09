//根据医院调用不同打印函数
//hosCode:医院编码，IssueDR：发血单DR
var printFlag = "0";       ///0:打印所有报告 1:循环打印每一份报告
var printType = "PrintPreview";    ///PrintOut:打印  PrintPreview打印预览
var paramList = "1";               ///1:报告处理打印 2:自助打印 3:医生打印
var funName = "QueryPrintData"; 

function printIssueByHos(hosCode, IssueDR,reprintFlag) { 
    switch (hosCode) {
        case 'YGRHYY': //阳光融合医院
            var claName = "HIS.DHCReportPrintXM";
           // var funName = "QueryPrintData";
//            var printFlag = "0";       ///0:打印所有报告 1:循环打印每一份报告
//            var printType = "PrintPreview";    ///PrintOut:打印  PrintPreview打印预览
//            var paramList = "1";               ///1:报告处理打印 2:自助打印 3:医生打印
            ExePrint(IssueDR, claName, funName, printFlag, printType, paramList);
            claName = "HIS.DHCReportPrintXM2";
            ExePrint(IssueDR, claName, funName, printFlag, printType, paramList);
            break;
        default:
            var claName = "HIS.DHCReportPrintXM";
            ExePrint(IssueDR, claName, funName, printFlag, printType, paramList);
            if (me.IsAutoPrintPackBarCode == "Y") {
                if (reprintFlag != "1") {
                    PrintPackBarCode(IssueDR);
                }
            }
            break;
    }
} 
function PrintPackBarCode(IssueDR) {
    claName = "HIS.DHCReportPrintBdPack";
    ExePrint(IssueDR, claName, funName, printFlag, printType, paramList);
}
function printXMMethodByHos(XMPlanNo) {
    var claName = "HIS.DHCReportPrintXMMethod";
    ExePrint(XMPlanNo, claName, funName, printFlag, printType, paramList);
//  switch (hosCode) {
//      case 'XNRMYY': //阳光融合医院
//          var claName = "HIS.DHCReportPrintXMMethodReport";
//          ExePrint(XMPlanNo, claName, funName, printFlag, printType, paramList);
//          break; 
//      default:
//          break;
//    }
}

function printPositionInfo(xmplandrs) {
    claName = "HIS.DHCReportPrintPackPosition";
    ExePrint(xmplandrs, claName, funName, printFlag, printType, paramList);
}

function PrintAGPack(AGPack) {
    var claName = "HIS.DHCReportPrintAGPack";
    ExePrint(AGPack, claName, funName, printFlag, printType, paramList);
}
 
