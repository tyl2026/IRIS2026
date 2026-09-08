//此代码由程序自动通过.cs转换生成，用于兼容DotNetFrameWork的网站，改逻辑请改.cs
<%@ WebHandler Language="C#" Class="ashTATMulResultByTestCodeGroup" %>
using System;
using LIS.Model.Bussiness;
using System.Data;
using LIS.BLL.TATVisitNumberManager;
using Newtonsoft.Json.Linq;
using LIS.DAL.DataAccess;
using NPOI;
using System.Collections.Generic;

public class ashTATMulResultByTestCodeGroup : BaseHttpHandler
{
    ITATVisitNumberManagerService TVM = Helper.GetObject<ITATVisitNumberManagerService>();
    
    public string QryTATMulResultByTestCodeGroup()
    {
        string PageSize = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"rows"), "20");
        string PageIndex = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"page"), "1");
    
        string SttDate = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"SttDate")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"SttDate").Replace("-", "");
        string EndDate = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EndDate")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EndDate").Replace("-", "");
        string FTestCodeGroupDR = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"FTestCodeGroupDR")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"FTestCodeGroupDR");
        string Location = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Location"), "");
        string EpisodeNo = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EpisodeNo"), "");
        string WorkGroupDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"WorkGroupDR"), "");
        string WorkGroupMachineDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"WorkGroupMachineDR"), "");
        string TestSetDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"TestSetDR"), "");
        string IsDisplayCount = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"IsDisplayCount"), "1");
        string SortField = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"sort"), "");
        string OrderType = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"order"), "");
        string SttTime = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"SttTime"), "");
        string EndTime = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EndTime"), "");
        string TimeType = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"TimeType"), "");
    
        string isStrSortField = "";  //排序的字段是否为字符串（1是）
        if (SortField == "VisitNumber")
        {
            isStrSortField = "1";
        }
        string logInfo = UserLogin.UserDR + "^" + UserLogin.WorkGroupDR + "^" + UserLogin.LocationDR + "^" + UserLogin.WorkGroupDR + "^" + UserLogin.HospitalDR + "^^JSON^" + SortField + "^" + OrderType + "^" + isStrSortField;
        string strJSON = "";
        bool DisplayCount = true;
        if (IsDisplayCount == "0")
        {
            DisplayCount = false;
            PageSize = "-1";
            PageIndex = "-1";
        }
    
        int rowCount;
        Parameters Param = new Parameters();
        Param.P0 = SttDate + "^" + SttTime;
        Param.P1 = EndDate + "^" + EndTime;
        Param.P2 = FTestCodeGroupDR;
        Param.P3 = Location;
        Param.P4 = EpisodeNo;
        Param.P5 = WorkGroupMachineDR;
        Param.P6 = TestSetDR;
        Param.P7 = WorkGroupDR;
        Param.P8 = TimeType;
    
        Param.P12 = PageSize;
        Param.P13 = PageIndex;
        try
        {
            //调用方法
            strJSON = WebManager.GetDataJSON("LIS.WS.BLL.DHCTATMulResultByTestCodeGroup", "QryTATMulResultByTestCodeGroup", Param, logInfo, DisplayCount, out rowCount, out this.Err);
        }
        catch (Exception ex)
        {
            return Helper.Error(ex.Message);
        }
        //返回结果
        return strJSON;
        //return TVM.QryTATMulResultByTestCodeGroup(Param, this.UserLogin, DisplayCount, out rowCount, out this.Err);
    
    }
    public string QryTATMulResultConditionMTHD()
    {
    
        string FTestCodeGroupDR = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"FTestCodeGroupDR")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"FTestCodeGroupDR");
    
        int rowCount;
        Parameters Param = new Parameters();
    
        Param.P0 = FTestCodeGroupDR;
    
        return TVM.QryTATMulResultConditionMTHD(Param, this.UserLogin, true, out rowCount, out this.Err);
    }
    
    /// <summary>
    ///导出EXCEL
    /// </summary>
    /// <returns></returns>
    public string Export2Excel()
    {
        //获取前台数据
    
        string SttDate = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"SttDate")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"SttDate").Replace("-", "");
        string EndDate = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EndDate")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EndDate").Replace("-", "");
        string FTestCodeGroupDR = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"FTestCodeGroupDR")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"FTestCodeGroupDR");
        string ItemsNames = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ItemsNames"), "");
        string Items = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Items"), "");
        string Location = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Location"), "");
        string EpisodeNo = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EpisodeNo"), "");
        string WorkGroupDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"WorkGroupDR"), "");
        string WorkGroupMachineDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"WorkGroupMachineDR"), "");
        string TestSetDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"TestSetDR"), "");
        string TimeType = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"TimeType"), "");
        int rowCount;
        string SortField = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"SortName"), "");
        string OrderType = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"SortOrder"), "");
        string SttTime = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"SttTime"), "");
        string EndTime = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EndTime"), "");
        string isStrSortField = "";  //排序的字段是否为字符串（1是）
        if (SortField == "VisitNumber")
        {
            isStrSortField = "1";
        }
        string logInfo = this.UserLogin.UserDR + "^" + this.UserLogin.WorkGroupDR + "^" + this.UserLogin.LocationDR + "^" + this.UserLogin.WorkGroupDR + "^" + this.UserLogin.HospitalDR + "^^JSON^" + SortField + "^" + OrderType + "^" + isStrSortField;
    
        Parameters Param = new Parameters();
    
        Param.P0 = SttDate + "^" + SttTime;
        Param.P1 = EndDate + "^" + EndTime;
        Param.P2 = FTestCodeGroupDR;
        Param.P3 = Location;
        Param.P4 = EpisodeNo;
        Param.P5 = WorkGroupMachineDR;
        Param.P6 = TestSetDR;
        Param.P7 = WorkGroupDR;
        Param.P8 = TimeType;
        Param.P12 = "-1";
        Param.P13 = "-1";
    
        try
        {
            //调用方法
            string strJSON = WebManager.GetDataJSON("LIS.WS.BLL.DHCTATMulResultByTestCodeGroup", "QryTATMulResultByTestCodeGroup", Param, logInfo, false, out rowCount, out this.Err);
    
            //处理返回json串
            JArray jsonArray = (Newtonsoft.Json.Linq.JArray)Newtonsoft.Json.JsonConvert.DeserializeObject(strJSON);
    
            NPOI.HSSF.UserModel.HSSFWorkbook book = new NPOI.HSSF.UserModel.HSSFWorkbook();
            NPOI.SS.UserModel.ISheet sheet = book.CreateSheet("sheet1");
    
            string[] ItemsArray = Items.Split(',');
            NPOI.SS.UserModel.IRow row = sheet.CreateRow(0);
            int i = 0;
            for (i = 0; i < ItemsArray.Length; i++)
            {
                row.CreateCell(i).SetCellValue(ItemsNames.Split(',')[i]);
            }
    
            int index = 1;
    
            foreach (var oneItem in jsonArray)  //查找某个字段与值
            {
                row = sheet.CreateRow(index);
                for (i = 0; i < ItemsArray.Length; i++)
                {
                    string value = "";
                    if (oneItem[ItemsArray[i]] != null)
                    {
                        value = oneItem[ItemsArray[i]].ToString();
                    }
                    else {
                        value = "";
                    }
                    NPOI.SS.UserModel.ICell cell = row.CreateCell(i);
                    cell.SetCellValue(value);
                }
                index++;
            }

        //汇总行：统计每个 TestCodeList* 列非空行数
        row = sheet.CreateRow(index);
        for (i = 0; i < ItemsArray.Length; i++)
        {
            if (ItemsArray[i].Contains("TestCodeList"))
            {
                int cnt = 0;
                foreach (var oneItem2 in jsonArray)
                {
                    string val = "";
                    if (oneItem2[ItemsArray[i]] != null)
                    {
                        val = oneItem2[ItemsArray[i]].ToString();
                    }
                    if (!string.IsNullOrEmpty(val))
                    {
                        cnt++;
                    }
                }
                row.CreateCell(i).SetCellValue(cnt.ToString());
            }
            else if (i == 0)
            {
                row.CreateCell(i).SetCellValue("汇总（不为空数）");
            }
            else
            {
                row.CreateCell(i).SetCellValue("");
            }
        }

        // 写入到客户端
            System.IO.MemoryStream ms = new System.IO.MemoryStream();
            book.Write(ms);
          //return DateTime.Now.ToString(SttDate + "至" + EndDate + "统计.xls");
            LIS.Core.MultiPlatform.LISWebFile.DownLoadFile(Response, ms.ToArray(), SttDate + "至" + EndDate + "统计.xls");
            //Response.AddHeader("Content-Disposition", string.Format("attachment; filename={0}.xls", DateTime.Now.ToString(SttDate + "至" + EndDate + "统计")));
            //Response.BinaryWrite(ms.ToArray());
            book = null;
            ms.Close();
            ms.Dispose();
        }
        catch (Exception ex)
        {
            return Helper.Error(ex.Message);
        }
        return Helper.Success();
    }
    
    /// <summary>
    ///导出EXCEL
    /// </summary>
    /// <returns></returns>
    public string Export2ExcelSingle()
    {
        //获取前台数据
    
        string SttDate = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"SttDate")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"SttDate").Replace("-", "");
        string EndDate = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EndDate")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EndDate").Replace("-", "");
        string FTestCodeGroupDR = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"FTestCodeGroupDR")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"FTestCodeGroupDR");
        string ItemsNames = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ItemsNames"), "");
        string Items = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Items"), "");
        string Location = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Location"), "");
        string EpisodeNo = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EpisodeNo"), "");
        string WorkGroupDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"WorkGroupDR"), "");
        string WorkGroupMachineDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"WorkGroupMachineDR"), "");
        string TestSetDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"TestSetDR"), "");
        string TimeType = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"TimeType"), "");
        int rowCount;
        string SortField = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"SortName"), "");
        string OrderType = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"SortOrder"), "");
        string SttTime = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"SttTime"), "");
        string EndTime = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EndTime"), "");
        string isStrSortField = "";  //排序的字段是否为字符串（1是）
        if (SortField == "VisitNumber")
        {
            isStrSortField = "1";
        }
        string logInfo = this.UserLogin.UserDR + "^" + this.UserLogin.WorkGroupDR + "^" + this.UserLogin.LocationDR + "^" + this.UserLogin.WorkGroupDR + "^" + this.UserLogin.HospitalDR + "^^JSON^" + SortField + "^" + OrderType + "^" + isStrSortField;
    
        Parameters Param = new Parameters();
    
        Param.P0 = SttDate + "^" + SttTime;
        Param.P1 = EndDate + "^" + EndTime;
        Param.P2 = FTestCodeGroupDR;
        Param.P3 = Location;
        Param.P4 = EpisodeNo;
        Param.P5 = WorkGroupMachineDR;
        Param.P6 = TestSetDR;
        Param.P7 = WorkGroupDR;
        Param.P8 = TimeType;
        Param.P12 = "-1";
        Param.P13 = "-1";
    
        try
        {
            //调用方法
            string strJSON = WebManager.GetDataJSON("LIS.WS.BLL.DHCTATMulResultByTestCodeGroup", "QryTATMulResultByTestCodeGroup", Param, logInfo, false, out rowCount, out this.Err);
    
            //处理返回json串
            JArray jsonArray = (Newtonsoft.Json.Linq.JArray)Newtonsoft.Json.JsonConvert.DeserializeObject(strJSON);
    
            NPOI.HSSF.UserModel.HSSFWorkbook book = new NPOI.HSSF.UserModel.HSSFWorkbook();
            NPOI.SS.UserModel.ISheet sheet = book.CreateSheet("sheet1");
    
            string[] ItemsArray = Items.Split(',');
            List<int> TestCodeIndexList = new List<int>();
    
            //输出第一行标题
            NPOI.SS.UserModel.IRow row = sheet.CreateRow(0);
            int i=0,skipCount = 0;
            for (i = 0; i < ItemsArray.Length; i++)
            {
                if (ItemsArray[i].Contains("TestCodeList"))
                {
                    TestCodeIndexList.Add(i);
                    skipCount++;
                    continue;
                }
                row.CreateCell(i-skipCount).SetCellValue(ItemsNames.Split(',')[i]);
            }
            row.CreateCell(i-skipCount).SetCellValue("检验项目");
            row.CreateCell(i-skipCount+1).SetCellValue("检验结果");
    
            //输出结果行
            int index = 1;
            foreach (var oneItem in jsonArray)  //查找某个字段与值
            {
    
                foreach (var itemIndex in TestCodeIndexList)
                {
                    string itemName = "";
                    string itemValue = "";
    
                    itemName = ItemsNames.Split(',')[itemIndex];
                    itemValue = oneItem[ItemsArray[itemIndex]].ToString();
                    if (string.IsNullOrEmpty(itemValue))
                    {
                        //结果为空的情况下不写入excel
                        continue;
                    }
    
                    row = sheet.CreateRow(index);
                    //先输出报告信息
                    skipCount = 0;
                    for (i = 0; i < ItemsArray.Length; i++)
                    {
                        if (ItemsArray[i].Contains("TestCodeList"))
                        {
                            skipCount ++;
                            continue;
                        }
                        string value = "";
                        if (oneItem[ItemsArray[i]] != null)
                        {
                            value = oneItem[ItemsArray[i]].ToString();
                        }
                        else {
                            value = "";
                        }
                        NPOI.SS.UserModel.ICell cell = row.CreateCell(i-skipCount);
                        cell.SetCellValue(value);
                    }
                    //再输出项目名称 和 结果值
                    row.CreateCell(i-skipCount).SetCellValue(itemName); //项目名称
                    row.CreateCell(i-skipCount+1).SetCellValue(itemValue); //项目结果
                    index++;
                }
            }

        //汇总行：统计每个检验项目非空行数（逐项输出一行）
        int nonTestColCount = ItemsArray.Length - TestCodeIndexList.Count;
        foreach (var itemIdx in TestCodeIndexList)
        {
            string itemName = ItemsNames.Split(',')[itemIdx];
            string itemField = ItemsArray[itemIdx];
            int cnt = 0;
            foreach (var oneItem2 in jsonArray)
            {
                if (oneItem2[itemField] != null && !string.IsNullOrEmpty(oneItem2[itemField].ToString()))
                {
                    cnt++;
                }
            }
            row = sheet.CreateRow(index);
            //报告信息列留空，第一列显示汇总标签（仅首行）
            if (itemIdx == TestCodeIndexList[0])
                row.CreateCell(0).SetCellValue("汇总：检验项目不为空计数");
            row.CreateCell(nonTestColCount).SetCellValue(itemName);
            row.CreateCell(nonTestColCount + 1).SetCellValue(cnt.ToString());
            index++;
        }

        // 写入到客户端
        System.IO.MemoryStream ms = new System.IO.MemoryStream();
        book.Write(ms);
        LIS.Core.MultiPlatform.LISWebFile.DownLoadFile(Response, ms.ToArray(), DateTime.Now.ToString(SttDate + "至" + EndDate + "统计.xls"));
            book = null;
            ms.Close();
            ms.Dispose();
        }
        catch (Exception ex)
        {
            return Helper.Error(ex.Message);
        }
        return Helper.Success();
    }
    
    /// <summary>
    /// 获取打印数据
    /// </summary>
    /// <returns></returns>
    public string GetPrintData()
    {
        string SttDate = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"SttDate")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"SttDate").Replace("-", "");
        string EndDate = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EndDate")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EndDate").Replace("-", "");
        string FTestCodeGroupDR = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"FTestCodeGroupDR")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"FTestCodeGroupDR");
        string Location = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Location"), "");
        string EpisodeNo = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EpisodeNo"), "");
        string Items = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Items"), "");
        string ItemNames = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ItemNames"), "");
        string TimeType = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"TimeType"), "");
    
        int rowCount;
        Parameters Param = new Parameters();
    
        Param.P0 = SttDate;
        Param.P1 = EndDate;
        Param.P2 = FTestCodeGroupDR;
        Param.P3 = Location;
        Param.P4 = EpisodeNo;
        Param.P7 = TimeType;
        Param.P12 = "-1";
        Param.P13 = "-1";
    
        string RetStr = TVM.QryTATMulResultByTestCodeGroup(Param, this.UserLogin, false, out rowCount, out this.Err);
    
        //处理返回json串
        JArray jsonArray = (Newtonsoft.Json.Linq.JArray)Newtonsoft.Json.JsonConvert.DeserializeObject(RetStr);
    
        //要返回的json数组对象
        JArray retJArray = new JArray();
    
        string[] ItemsArray = Items.Split(',');
        string[] ItemNamesArray = ItemNames.Split(',');
    
        DataTable dt = new DataTable();
    
        //3.给表加行，标题:
        DataRow row = dt.NewRow();
        int i = 0;
        for (i = 0; i < ItemsArray.Length; i++)
        {
            dt.Columns.Add("filed" + (i + 1), typeof(System.String));
            row["filed" + (i + 1)] = ItemNamesArray[i];
        }
        dt.Rows.Add(row);
    
        foreach (var oneItem in jsonArray)  //查找某个字段与值
        {
            row = dt.NewRow();
            for (i = 0; i < ItemsArray.Length; i++)
            {
                row["filed" + (i + 1)] = oneItem[ItemsArray[i]];
            }
            dt.Rows.Add(row);
        }
        return Newtonsoft.Json.JsonConvert.SerializeObject(dt);
    }
}
