//此代码由程序自动通过.cs转换生成，用于兼容DotNetFrameWork的网站，改逻辑请改.cs
<%@ WebHandler Language="C#" Class="ashReportQuery" %>
using System;
using System.Web;
using System.Reflection;
using System.Text;
using System.Data;
using System.Collections;
using System.Collections.Generic;
using Newtonsoft.Json;
using System.Linq;
using Newtonsoft.Json.Linq;
using LIS.Model.Bussiness;
using LIS.Model.Entity;
using LIS.BLL.Base;
using LIS.BLL.VisitNumberReportManager;
using LIS.Common;
using LIS.DAL.ORM.EntityManager;
using LIS.DAL.DataAccess;


public class ashReportQuery : BaseHttpHandler
{
    IVisitNumberReportManagerService vrm = Helper.GetObject<IVisitNumberReportManagerService>();
    
    /// <summary>
    /// 报告查询(这是个公共方法修改的时候需要谨慎)
    /// </summary>
    public string QueryReportList()
    {
    
        string PrintFlag = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PrintFlag"), "0");
        int PageSize = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"rows"), 50);
        int PageIndex = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"page"), 1);
        if (PrintFlag == "1")
        {
            PageSize = -1;
            PageIndex = -1;
        }
        string DateType = "";
        string TestSetQueryGroupDR = "";
        string ReportStatus = "";
        string SttDate = "";
        string EndDate = "";
        string Labno = "";
        string EpisNoList = "";
        string PatName = "";
        string DiagnoseDR = "";
        string RegNo = "";
        string MedicalRecordNo = "";
        string PatType = "";
        string Location = "";
        string DoctorDR = "";
        string SortField = "";
        string OrderType = "";
        string VisitNumberAddType = "";
        string TestSetDR = "";
        string CarryUser = "";
        string ReceiveUser = "";
        string AcceptUser = "";
        string AuthUser = "";
        string CardNo = "";
        string Urgnet = "";
        string ReportFormula = "";
        string BedNo = "";
    
    
        DateType = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"DateType")) ? ReportStatus : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"DateType");
        TestSetQueryGroupDR = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"TestSetQueryGroupDR")) ? TestSetQueryGroupDR : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"TestSetQueryGroupDR");
        ReportStatus = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReportStatus")) ? ReportStatus : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReportStatus");
        SttDate = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"SttDate")) ? SttDate : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"SttDate");
        EndDate = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EndDate")) ? EndDate : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EndDate");
        Labno = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Labno")) ? Labno : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Labno");
        EpisNoList = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EpisNoList")) ? EpisNoList : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EpisNoList");
        PatName = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PatName")) ? PatName : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PatName");
        DiagnoseDR = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"DiagnoseDR")) ? DiagnoseDR : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"DiagnoseDR");
        RegNo = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"RegNo")) ? RegNo : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"RegNo");
        MedicalRecordNo = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"MedicalRecordNo")) ? MedicalRecordNo : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"MedicalRecordNo");
        Location = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Location")) ? Location : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Location");
        DoctorDR=string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"DoctorDR")) ? DoctorDR : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"DoctorDR");
        PatType = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PatType")) ? PatType : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PatType");
        string WorkGroupDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"WorkGroupDR"), "");
        string WorkGroupMachineDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"WorkGroupMachineDR"), "");
        string SpecimenDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"SpecimenDR"), "");
        CardNo = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"CardNo")) ? CardNo : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"CardNo");
        VisitNumberAddType =  string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"VisitNumberAddType")) ? VisitNumberAddType : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"VisitNumberAddType");
        TestSetDR =  string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"TestSetDR")) ? TestSetDR : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"TestSetDR");
        CarryUser=  string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"CarryUser")) ? CarryUser : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"CarryUser");
        ReceiveUser =  string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReceiveUser")) ? ReceiveUser : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReceiveUser");
        AcceptUser =  string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"AcceptUser")) ? AcceptUser : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"AcceptUser");
        AuthUser =  string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"AuthUser")) ? AuthUser : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"AuthUser");
        SortField = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"sort")) ? SortField : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"sort");
        OrderType = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"order")) ? OrderType : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"order");
        Urgnet = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Urgnet")) ? Urgnet : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Urgnet");
        ReportFormula = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReportFormula")) ? ReportFormula : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReportFormula");
        BedNo = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"BedNo")) ? BedNo : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"BedNo");
    
        int rowCount;
        Parameters Param = new Parameters();
        Param.P0 = DateType;
        Param.P1 = ReportStatus+"^"+TestSetQueryGroupDR+"^"+VisitNumberAddType;
        Param.P2 = SttDate;
        Param.P3 = EndDate;
        Param.P4 = Labno;
        Param.P5 = EpisNoList;
        Param.P6 = PatName+"^"+DiagnoseDR+"^"+TestSetDR+"^"+Urgnet+"^"+ReportFormula+"^"+BedNo;
        Param.P7 = RegNo;
        Param.P8 = MedicalRecordNo+"^"+CardNo;
        Param.P9 = Location+"^"+DoctorDR+"^"+AuthUser+"^"+AcceptUser+"^"+ReceiveUser+"^"+CarryUser;   //第二位是申请医生
        Param.P10 = PatType; // 原来加的排序字段和排序类型，现在加到session里面
        Param.P11 = WorkGroupMachineDR + "^" + SpecimenDR + "^" + WorkGroupDR;
        Param.P12 = PageSize.ToString();
        Param.P13 = PageIndex.ToString();
        Sessions sesObj = this.UserLogin;
        //调用类名
        string className = "LIS.WS.BLL.DHCRPQueryReport";
        //调用方法名
        string funcName = "QryReportList";  //去掉ABC，统一使用这个方法
        string strJSON = "";
        string RequestUniqueKey = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"RequestUniqueKey"), "");
        //登录信息
        string logInfo = "";
        if (WorkGroupDR == "")
        {
            logInfo = sesObj.UserDR + "^" + sesObj.WorkGroupDR + "^" + sesObj.LocationDR + "^" + sesObj.GroupDR + "^" + sesObj.HospitalDR + "^^JSON^" + SortField + "^" + OrderType+"^^"+RequestUniqueKey;
        }
        else
        {
            logInfo = sesObj.UserDR + "^" + WorkGroupDR + "^" + sesObj.LocationDR + "^" + sesObj.GroupDR + "^" + sesObj.HospitalDR + "^^JSON^" + SortField + "^" + OrderType+"^^"+RequestUniqueKey;
        }
        try
        {
            //调用方法
            strJSON = WebManager.GetDataJSON(className, funcName, Param, logInfo, true, out rowCount, out this.Err);
        }
        catch (Exception ex)
        {
            return Helper.Error(ex.Message);
        }
        //返回结果
        return strJSON;
    }
    
    /// <summary>
    /// 报告查询(接收明细查询)
    /// </summary>
    public string QueryReportListC()
    {
    
        int PageSize = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"rows"), 20);
        int PageIndex = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"page"), 1);
        string SttDate = "";
        string EndDate = "";
        string Labno = "";
        string PatName = "";
        string RegNo = "";
        string PatType = "";
        string Location = "";
        string SortField = "";
        string OrderType = "";
        string TestSetDR = "";
        string CarryUser = "";
        string ReceiveUser = "";
    
        SttDate = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"SttDate")) ? SttDate : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"SttDate");
        EndDate = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EndDate")) ? EndDate : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EndDate");
        Labno = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Labno")) ? Labno : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Labno");
        PatName = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PatName")) ? PatName : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PatName");
        RegNo = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"RegNo")) ? RegNo : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"RegNo");
        Location = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Location")) ? Location : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Location");
        PatType = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PatType")) ? PatType : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PatType");
        string WorkGroupDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"WorkGroupDR"), "");
        string SpecimenDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"SpecimenDR"), "");
        string Urgent = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Urgent"), "");
        TestSetDR = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"TestSetDR")) ? TestSetDR : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"TestSetDR");
        CarryUser = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"CarryUser")) ? CarryUser : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"CarryUser");
        ReceiveUser = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReceiveUser")) ? ReceiveUser : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReceiveUser");
        SortField = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"sort")) ? SortField : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"sort");
        OrderType = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"order")) ? OrderType : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"order");
    
        int rowCount;
        Parameters Param = new Parameters();
        Param.P0 = SttDate;
        Param.P1 = EndDate;
        Param.P2 = Labno;
        Param.P3 = RegNo;
        Param.P4 = PatName;
        Param.P5 = WorkGroupDR;
        Param.P6 = Location + "^" + ReceiveUser + "^" + CarryUser;
        Param.P7 = PatType;
        Param.P8 = TestSetDR;
        Param.P9 = SpecimenDR;
        Param.P10 = Urgent; // 原来加的排序字段和排序类型，现在加到session里面
        Param.P11 = "";
        Param.P12 = PageSize.ToString();
        Param.P13 = PageIndex.ToString();
        Sessions sesObj = this.UserLogin;
        //调用类名
        string className = "LIS.WS.BLL.DHCRPQueryReport";
        //调用方法名
        string funcName = "QryReportListC";  //去掉ABC，统一使用这个方法
        string strJSON = "";
    
        //登录信息
        string logInfo = "";
        if (WorkGroupDR == "")
        {
            logInfo = sesObj.UserDR + "^" + sesObj.WorkGroupDR + "^" + sesObj.LocationDR + "^" + sesObj.GroupDR + "^" + sesObj.HospitalDR + "^^JSON^" + SortField + "^" + OrderType;
        }
        else
        {
            logInfo = sesObj.UserDR + "^" + WorkGroupDR + "^" + sesObj.LocationDR + "^" + sesObj.GroupDR + "^" + sesObj.HospitalDR + "^^JSON^" + SortField + "^" + OrderType;
        }
        try
        {
            //调用方法
            strJSON = WebManager.GetDataJSON(className, funcName, Param, logInfo, true, out rowCount, out this.Err);
        }
        catch (Exception ex)
        {
            return Helper.Error(ex.Message);
        }
        //返回结果
        return strJSON;
    }
    
    /// <summary>
    /// 报告查询(核收明细)
    /// </summary>
    public string QueryReportListD()
    {
    
        string PrintFlag = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PrintFlag"), "0");
        int PageSize = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"rows"), 20);
        int PageIndex = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"page"), 1);
        if (PrintFlag == "1")
        {
            PageSize = -1;
            PageIndex = -1;
        }
        string DateType = "";
        string ReportStatus = "";
        string SttDate = "";
        string EndDate = "";
        string Labno = "";
        string EpisNoList = "";
        string PatName = "";
        string RegNo = "";
        string MedicalRecordNo = "";
        string PatType = "";
        string Location = "";
        string SortField = "";
        string OrderType = "";
        string TestSetDR = "";
        string ReceiveUser = "";
        string AcceptUser = "";
        string AuthUser = "";
    
        DateType = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"DateType")) ? ReportStatus : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"DateType");
        ReportStatus = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReportStatus")) ? ReportStatus : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReportStatus");
        SttDate = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"SttDate")) ? SttDate : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"SttDate");
        EndDate = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EndDate")) ? EndDate : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EndDate");
        Labno = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Labno")) ? Labno : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Labno");
        EpisNoList = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EpisNoList")) ? EpisNoList : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EpisNoList");
        PatName = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PatName")) ? PatName : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PatName");
        RegNo = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"RegNo")) ? RegNo : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"RegNo");
        MedicalRecordNo = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"MedicalRecordNo")) ? MedicalRecordNo : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"MedicalRecordNo");
        Location = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Location")) ? Location : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Location");
        PatType = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PatType")) ? PatType : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PatType");
        string WorkGroupDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"WorkGroupDR"), "");
        string WorkGroupMachineDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"WorkGroupMachineDR"), "");
        string Urgent = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Urgent"), "");
        TestSetDR = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"TestSetDR")) ? TestSetDR : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"TestSetDR");
        ReceiveUser = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReceiveUser")) ? ReceiveUser : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReceiveUser");
        AcceptUser = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"AcceptUser")) ? AcceptUser : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"AcceptUser");
        AuthUser = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"AuthUser")) ? AuthUser : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"AuthUser");
        SortField = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"sort")) ? SortField : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"sort");
        OrderType = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"order")) ? OrderType : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"order");
    
        int rowCount;
        Parameters Param = new Parameters();
        Param.P0 = DateType;
        Param.P1 = ReportStatus;
        Param.P2 = SttDate;
        Param.P3 = EndDate;
        Param.P4 = Labno;
        Param.P5 = EpisNoList;
        Param.P6 = PatName + "^" + TestSetDR;
        Param.P7 = RegNo;
        Param.P8 = MedicalRecordNo;
        Param.P9 = Location + "^" + AuthUser + "^" + AcceptUser + "^" + ReceiveUser;   //第二位是申请医生
        Param.P10 = PatType; // 原来加的排序字段和排序类型，现在加到session里面
        Param.P11 = WorkGroupMachineDR + "^" + WorkGroupDR + "^" + Urgent;
        Param.P12 = PageSize.ToString();
        Param.P13 = PageIndex.ToString();
        Sessions sesObj = this.UserLogin;
        //调用类名
        string className = "LIS.WS.BLL.DHCRPQueryReport";
        //调用方法名
        string funcName = "QryReportListD";  //去掉ABC，统一使用这个方法
        string strJSON = "";
    
        //登录信息
        string logInfo = "";
        if (WorkGroupDR == "")
        {
            logInfo = sesObj.UserDR + "^" + sesObj.WorkGroupDR + "^" + sesObj.LocationDR + "^" + sesObj.GroupDR + "^" + sesObj.HospitalDR + "^^JSON^" + SortField + "^" + OrderType;
        }
        else
        {
            logInfo = sesObj.UserDR + "^" + WorkGroupDR + "^" + sesObj.LocationDR + "^" + sesObj.GroupDR + "^" + sesObj.HospitalDR + "^^JSON^" + SortField + "^" + OrderType;
        }
        try
        {
            //调用方法
            strJSON = WebManager.GetDataJSON(className, funcName, Param, logInfo, true, out rowCount, out this.Err);
        }
        catch (Exception ex)
        {
            return Helper.Error(ex.Message);
        }
        //返回结果
        return strJSON;
    }
    
    /// <summary>
    /// 报告查询
    /// </summary>
    public string QueryReportListA() // 
    {
    
        string PrintFlag = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PrintFlag"), "0");
        int PageSize = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"rows"), 20);
        int PageIndex = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"page"), 1);
        if (PrintFlag == "1")
        {
            PageSize = -1;
            PageIndex = -1;
        }
        string DateType = "";
        string ReportStatus = "";
        string SttDate = "";
        string EndDate = "";
        string Labno = "";
        string EpisNoList = "";
        string PatName = "";
        string RegNo = "";
        string MedicalRecordNo = "";
        string CardNo = "";
        string PatType = "";
        string Location = "";
        string SortField = "";
        string OrderType = "";
        string VisitNumberAddType = "";
        string TestSetDR = "";
        string ReceiveUser = "";
        string AcceptUser = "";
        string AuthUser = "";
    
        DateType = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"DateType")) ? DateType : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"DateType");
        ReportStatus = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReportStatus")) ? ReportStatus : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReportStatus");
        SttDate = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"SttDate")) ? SttDate : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"SttDate");
        EndDate = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EndDate")) ? EndDate : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EndDate");
        Labno = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Labno")) ? Labno : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Labno");
        EpisNoList = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EpisNoList")) ? EpisNoList : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EpisNoList");
        PatName = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PatName")) ? PatName : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PatName");
        RegNo = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"RegNo")) ? RegNo : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"RegNo");
        MedicalRecordNo = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"MedicalRecordNo")) ? MedicalRecordNo : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"MedicalRecordNo");
        CardNo = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"CardNo")) ? CardNo : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"CardNo");
        Location = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Location")) ? Location : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Location");
        PatType = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PatType")) ? PatType : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PatType");
        VisitNumberAddType =  string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"VisitNumberAddType")) ? VisitNumberAddType : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"VisitNumberAddType");
        TestSetDR =  string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"TestSetDR")) ? TestSetDR : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"TestSetDR");
        ReceiveUser =  string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReceiveUser")) ? ReceiveUser : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReceiveUser");
        AcceptUser =  string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"AcceptUser")) ? AcceptUser : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"AcceptUser");
        AuthUser =  string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"AuthUser")) ? AuthUser : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"AuthUser");
        SortField = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"sort")) ? SortField : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"sort");
        OrderType = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"order")) ? OrderType : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"order");
    
        string WorkGroupDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"WorkGroupDR"), "");
        string WorkGroupMachineDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"WorkGroupMachineDR"), "");
        string SpecimenDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"SpecimenDR"), "");
    
    
        int rowCount = 0;
        string err = "";
    
        Parameters Param = new Parameters();
        Param.P0 = DateType;
        Param.P1 = ReportStatus+"^^"+VisitNumberAddType;  //第二位是TestSetQueryGroupDR
        Param.P2 = SttDate;
        Param.P3 = EndDate;
        Param.P4 = Labno;
        Param.P5 = EpisNoList;
        Param.P6 = PatName+"^^"+TestSetDR;  //第二位是患者诊断
        Param.P7 = RegNo;
        Param.P8 = MedicalRecordNo+"^"+CardNo;
        Param.P9 = Location+"^^"+AuthUser+"^"+AcceptUser+"^"+ReceiveUser;   //第二位是申请医生
        Param.P10 = PatType; // 原来加的排序字段和排序类型，现在加到session里面
        Param.P11 = WorkGroupMachineDR + "^" + SpecimenDR + "^" + WorkGroupDR;
        Param.P12 = PageSize.ToString();
        Param.P13 = PageIndex.ToString();
        Sessions sesObj = this.UserLogin;
        //调用类名
        string className = "LIS.WS.BLL.DHCRPQueryReport";
        //调用方法名
        string funcName = "QryReportList";  //去掉ABC，统一使用这个方法
        string strJSON = "";
    
        //登录信息
        string logInfo = "";
        if (WorkGroupDR == "")
        {
            logInfo = sesObj.UserDR + "^" + sesObj.WorkGroupDR + "^" + sesObj.LocationDR + "^" + sesObj.GroupDR + "^" + sesObj.HospitalDR + "^^JSON^" + SortField + "^" + OrderType;
        }
        else
        {
            logInfo = sesObj.UserDR + "^" + WorkGroupDR + "^" + sesObj.LocationDR + "^" + sesObj.GroupDR + "^" + sesObj.HospitalDR + "^^JSON^" + SortField + "^" + OrderType;
        }
        try
        {
            //调用方法
            //strJSON = WebManager.GetDataJSON(className, funcName, Param, logInfo, true, out rowCount, out this.Err);  
            strJSON = WebManager.GetDataJSON(className, funcName, Param, logInfo, true, out rowCount, out err);
        }
        catch (Exception ex)
        {
            return Helper.Error(ex.Message);
        }
        //返回结果
        return strJSON;
    
    }
    
    /// <summary>
    /// 报告查询
    /// </summary>
    public string QueryReportListContainHIS() // 
    {
        string PrintFlag = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PrintFlag"), "0");
        int PageSize = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"rows"), 20);
        int PageIndex = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"page"), 1);
        if (PrintFlag == "1")
        {
            PageSize = -1;
            PageIndex = -1;
        }
        string DateType = "";
        string ReportStatus = "";
        string SttDate = "";
        string EndDate = "";
        string Labno = "";
        string EpisNoList = "";
        string PatName = "";
        string RegNo = "";
        string MedRecordNo = "";
        string CardNo = "";
        string PatType = "";
        string Location = "";
        string UnReceive = "";
    
        DateType = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"DateType")) ? ReportStatus : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"DateType");
        ReportStatus = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReportStatus")) ? ReportStatus : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReportStatus");
        SttDate = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"SttDate")) ? SttDate : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"SttDate");
        EndDate = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EndDate")) ? EndDate : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EndDate");
        Labno = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Labno")) ? Labno : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Labno");
        EpisNoList = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EpisNoList")) ? EpisNoList : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EpisNoList");
        PatName = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PatName")) ? PatName : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PatName");
        RegNo = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"RegNo")) ? RegNo : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"RegNo");
        MedRecordNo = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"MedRecordNo")) ? MedRecordNo : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"MedRecordNo");
        CardNo = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"CardNo")) ? CardNo : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"CardNo");
        Location = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Location")) ? Location : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Location");
        PatType = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PatType")) ? PatType : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PatType");
        string WorkGroupDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"WorkGroupDR"), "");
        string WorkGroupMachineDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"WorkGroupMachineDR"), "");
        string SpecimenDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"SpecimenDR"), "");
        UnReceive = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"UnReceive"), "");
    
        int rowCount;
        Parameters Param = new Parameters();
        Param.P0 = DateType;
        Param.P1 = ReportStatus;
        Param.P2 = SttDate;
        Param.P3 = EndDate;
        Param.P4 = Labno;
        Param.P5 = EpisNoList;
        Param.P6 = PatName;
        Param.P7 = RegNo;
        Param.P8 = MedRecordNo+"^"+CardNo;
        Param.P9 = Location;
        Param.P10 = PatType+"^"+UnReceive;
        Param.P11 = WorkGroupMachineDR;
        Param.P12 = PageSize.ToString();
        Param.P13 = PageIndex.ToString();
        Sessions sesObj = this.UserLogin;
        //调用类名
        string className = "LIS.WS.BLL.DHCRPQueryReport";
        //调用方法名
        string funcName = "QryReportListB";
        string strJSON = "";
    
        //登录信息
        string logInfo = "";
        if (WorkGroupDR == "")
        {
            logInfo = sesObj.UserDR + "^" + sesObj.WorkGroupDR + "^" + sesObj.LocationDR + "^" + sesObj.GroupDR + "^" + sesObj.HospitalDR + "^" + SpecimenDR;
        }
        else
        {
            logInfo = sesObj.UserDR + "^" + WorkGroupDR + "^" + sesObj.LocationDR + "^" + sesObj.GroupDR + "^" + sesObj.HospitalDR + "^" + SpecimenDR;
        }
        try
        {
            //调用方法
            strJSON = WebManager.GetDataJSON(className, funcName, Param, logInfo, true, out rowCount, out this.Err);
        }
        catch (Exception ex)
        {
            return Helper.Error(ex.Message);
        }
        //返回结果
        return strJSON;
    }
    
    //历史报告查询
    public string QueryHistoryReportList() //
    {
        try
        {
            IEntityManager entityManager = EntityManagerFactory.CreateEntityManager();
            string TestCodeDR = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"TestCodeDR")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"TestCodeDR");
            string ReportDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReportDR"),"");
    
            int rowCount;
            Parameters Param = new Parameters();
            Param.P0 = ReportDR;
            Param.P1 = TestCodeDR;
            Param.P2 = "";
            Param.P3 = "";
            string retStr = vrm.QryHistoryResult(Param, this.UserLogin, true, out rowCount, out this.Err);
    
            JObject jo = JObject.Parse(retStr);
            string rows = Convert.ToString(jo["rows"]);
    
            var mJObj = JArray.Parse(rows);
            int index = 0;
            string dataHead = "";
            string rowsStr = "";
            foreach (var row in mJObj )  //查找某个字段与值
            {
                string rowStr = Convert.ToString(row);
                JObject jo2 = JObject.Parse(rowStr);
                string[] values = jo2.Properties().Select(item => item.Value.ToString()).ToArray();
    
                string rowValueStr = values[0];
    
                if (index == 0)
                {
                    dataHead = rowValueStr;
                }
                else
                {
                    rowsStr = rowsStr + rowValueStr + ",";
                }
                index++;
    
            }
            rowsStr = rowsStr.Substring(0, rowsStr.Length - 1);
            retStr = "{\"dataHead\":"+dataHead+",\"rows\":[" + rowsStr + "]}";
    
            return retStr;
        }
        catch (Exception ex)
        {
            return "";
        }
    }
    /// <summary>
    /// 报告查询
    /// </summary>
    public string QueryOGTTResult() // 
    {
    
        string ReportDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReportDR"), "");
    
        int rowCount;
        Parameters Param = new Parameters();
        Param.P0 = ReportDR;
    
        Sessions sesObj = this.UserLogin;
        //调用类名
        string className = "LIS.WS.BLL.DHCRPVisitNumberReportResult";
        //调用方法名
        string funcName = "QryOGTTResult";
        //登录信息
        string logInfo = logInfo = sesObj.UserDR + "^" + sesObj.WorkGroupDR + "^" + sesObj.LocationDR + "^" + sesObj.GroupDR + "^" + sesObj.HospitalDR ;
        string  strJSON = WebManager.GetDataJSON(className, funcName, Param, logInfo, true, out rowCount, out this.Err);
    
        return strJSON;
    }
    #region 微生物报告打印需要的方法
    
    /// <summary>
    /// 获取报告结果布局信息
    /// param.P0 报告RowID
    /// </summary>
    /// <returns>结果布局信息</returns>
    public string FindReportItemInfo()
    {
        //参数
        Parameters param = new Parameters();
        //行数
        int rowCount;
        //报告主键
        string ReportDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReportDR"), "");
        //报告主键为空，返回空数组
        if (ReportDR == string.Empty)
        {
            return ("[]");
        }
        //测试项目主键
        string TestCodeRowID = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"TestCodeRowID"), "");
        //填入参数
        param.P0 = ReportDR;
        param.P1 = TestCodeRowID;
        LIS.BLL.MicReportManager.IMicReportManagerService service = this.GetObject<LIS.BLL.MicReportManager.IMicReportManagerService>();
        //查询布局信息
        return service.FindReportItemInfo(param, this.UserLogin, false, out rowCount, out this.Err);
    }
    
    /// <summary>
    /// 查询药敏结果数据
    /// </summary>
    /// <returns></returns>
    public string QuerySensitivity()
    {
        //查询条件哈希表
        Hashtable hs = new Hashtable();
        //获取前台传入的页面大小数据
        int pageSize = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"rows"), -1);
        //获取前台传入的页码数据
        int pageIndex = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"page"), -1);
        //获得前台传入的排序字段
        string sort = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"sort"), "RowID");
        //获取前台传入的排序
        string order = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"order"), "desc");
    
        //获得前台传入的编码
        string Code = LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Code");
        //获得前台传入的名称
        string CName = LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"CName");
        //获得前台传入的是否激活
        string Active = LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Active");
        //编码不为空，加入查询条件
        if ((Code != null) && (Code.Length > 0))
        {
            hs.Add("Code", Code);
        }
        //名称不为空，加入查询条件
        if ((CName != null) && (CName.Length > 0))
        {
            hs.Add("CName", CName);
        }
        //激活状态为空，默认为激活的数据
        if (Active == null)
        {
            hs.Add("Active", true);
        }
        else
        {
            if (Active == "1")
            {
                hs.Add("Active", true);
            }
            else if (Active == "0")
            {
                hs.Add("Active", false);
            }
        }
        //获得是否显示行数数据
        bool isDisplayCount = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"DisplayCount"), false);
        //执行查询，得到数据串
        string result = CodeTable.SelectAll<BTSensitivity>(hs, "", isDisplayCount, pageSize, pageIndex, out this.Err);
        //如果错误信息不为空，抛出错误信息
        if (!string.IsNullOrEmpty(this.Err))
        {
            //写出错误信息
            return Helper.Error(this.Err);
        }
        //返回查询结果
        return result;
    }
    
    /// <summary>
    /// 获取打印报告数据
    /// </summary>
    /// <returns></returns>
    public string PrintReport()
    {
        string ReportDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReportDR"), "");
        int rowCount = 0;
        Sessions session = new Sessions();
        Parameters param = new Parameters();
        param.P0 = ReportDR;
        LIS.BLL.MicReportManager.IMicReportManagerService service = this.GetObject<LIS.BLL.MicReportManager.IMicReportManagerService>();
        return service.GetReportInfo(param, session, false, out rowCount, out this.Err);
    }
    
    /// <summary>
    /// 根据报告结果主键获取报告结果的药敏结果信息
    /// param.P0 报告RowID
    /// </summary>
    /// <returns>结果布局信息</returns>
    public string FindReportResultSen()
    {
        //参数
        Parameters param = new Parameters();
        //行数
        int rowCount;
        //报告结果主键
        string ReportResultDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReportResultDR"), "");
        //报告结果主键为空，返回空数组
        if (ReportResultDR == string.Empty)
        {
            return ("[]");
        }
        //填入参数
        param.P0 = ReportResultDR;
        LIS.BLL.MicReportManager.IMicReportManagerService service = this.GetObject<LIS.BLL.MicReportManager.IMicReportManagerService>();
        //查询药敏结果信息
        return service.FindReportResultSen(param, this.UserLogin, false, out rowCount, out this.Err);
    }
    
    /// <summary>
    /// 根据报告结果主键获取报告结果的耐药分析结果信息
    /// param.P0 报告RowID
    /// </summary>
    /// <returns>结果布局信息</returns>
    public string FindReportResultRst()
    {
        //参数
        Parameters param = new Parameters();
        //行数
        int rowCount;
        //报告结果主键
        string ReportResultDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReportResultDR"), "");
        //报告结果主键为空，返回空数组
        if (ReportResultDR == string.Empty)
        {
            return ("[]");
        }
        //填入参数
        param.P0 = ReportResultDR;
        LIS.BLL.MicReportManager.IMicReportManagerService service = this.GetObject<LIS.BLL.MicReportManager.IMicReportManagerService>();
        //查询药敏结果信息
        return service.FindReportResultRst(param, this.UserLogin, false, out rowCount, out this.Err);
    }
    
    /// <summary>
    /// 根据仪器结果和抗生素查询仪器药敏结果。参数仪器结果主键，抗生素主键（可传）
    /// </summary>
    public string QueryMachineResultAnt()
    {
        //行数
        int rowCount;
        //参数
        Parameters param = new Parameters();
        //仪器结果主键
        param.P0 = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"MachineResultDR"), "");
        //抗生素主键
        param.P1 = string.Empty;
        LIS.BLL.MicReportManager.IMicReportManagerService service = this.GetObject<LIS.BLL.MicReportManager.IMicReportManagerService>();
        //查询工作列表
        return service.QueryMachineResultAnt(param, this.UserLogin, false, out rowCount, out this.Err);
    }
    
    /// <summary>
    /// 查询耐药项目数据
    /// </summary>
    /// <returns></returns>
    public string QueryBTMCResistanceItem()
    {
        //查询条件哈希表
        Hashtable hs = new Hashtable();
        //获取前台传入的页面大小数据
        int pageSize = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"rows"), -1);
        //获取前台传入的页码数据
        int pageIndex = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"page"), -1);
        //获得前台传入的排序字段
        string sort = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"sort"), "RowID");
        //获取前台传入的排序
        string order = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"order"), "desc");
    
        //获得前台传入的编码
        string Code = LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Code");
        //获得前台传入的名称
        string CName = LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"CName");
        //获得前台传入的是否激活
        string Active = LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Active");
        //编码不为空，加入查询条件
        if ((Code != null) && (Code.Length > 0))
        {
            hs.Add("Code", Code);
        }
        //名称不为空，加入查询条件
        if ((CName != null) && (CName.Length > 0))
        {
            hs.Add("CName", CName);
        }
        //激活状态为空，默认为激活的数据
        if (Active == null)
        {
            hs.Add("Active", true);
        }
        else
        {
            if (Active == "1")
            {
                hs.Add("Active", true);
            }
            else if (Active == "0")
            {
                hs.Add("Active", false);
            }
        }
        //获得是否显示行数数据
        bool isDisplayCount = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"DisplayCount"), false);
        //执行查询，得到数据串
        string result = CodeTable.SelectAll<BTMCResistanceItem>(hs, "", isDisplayCount, pageSize, pageIndex, out this.Err);
        //如果错误信息不为空，抛出错误信息
        if (!string.IsNullOrEmpty(this.Err))
        {
            //写出错误信息
            return Helper.Error(this.Err);
        }
        //返回查询结果
        return result;
    }
    
    /// <summary>
    /// 更改自助打印状态
    /// Input：VisitNumberReportDR:报告RowID
    /// <returns>0:成功 其它:失败</returns>
    /// </summary>
    public string SetSelfReportPrintState()
    {
        string ReportDRs = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReportDRs"), "");
        if (ReportDRs == "")
        {
            return Helper.Error("没有传入报告主键！");
        }
        //调用类名
        string className = "LIS.WS.BLL.DHCSelfPrint";
        //调用方法名
        string funcName = "SetReportPrintStateMTHD";
        //存返回的json
        string strJSON = string.Empty;
        //行数
        int rowCount = 0;
        Sessions sesObj = this.UserLogin;
        Parameters param = new Parameters();
        param.P0 = ReportDRs;
    
        //登录信息
        string logInfo = sesObj.UserDR + "^" + sesObj.WorkGroupDR + "^" + sesObj.LocationDR + "^" + sesObj.GroupDR + "^" + sesObj.HospitalDR;
        try
        {
            //调用方法
            strJSON = WebManager.GetDataJSON(className, funcName, param, logInfo, false, out rowCount, out this.Err);
        }
        catch (Exception ex)
        {
            //错误信息
            this.Err = ex.Message;
        }
        return Helper.Success("");
    }
    
    
    /// <summary>
    /// 取消自助打印状态
    /// Input：VisitNumberReportDR:报告RowID
    /// <returns>0:成功 其它:失败</returns>
    /// </summary>
    public string CancelSelfPrint()
    {
        string ReportDRs = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReportDRs"), "");
        if (ReportDRs == "")
        {
            return Helper.Error("没有传入报告主键！");
        }
        //调用类名
        string className = "LIS.WS.BLL.DHCSelfPrint";
        //调用方法名
        string funcName = "CancelSelfPrintMTHD";
        //存返回的json
        string strJSON = string.Empty;
        //行数
        int rowCount = 0;
        Sessions sesObj = this.UserLogin;
        Parameters param = new Parameters();
        param.P0 = ReportDRs;
    
        //登录信息
        string logInfo = sesObj.UserDR + "^" + sesObj.WorkGroupDR + "^" + sesObj.LocationDR + "^" + sesObj.GroupDR + "^" + sesObj.HospitalDR;
        try
        {
            //调用方法
            strJSON = WebManager.GetDataJSON(className, funcName, param, logInfo, false, out rowCount, out this.Err);
        }
        catch (Exception ex)
        {
            //错误信息
            this.Err = ex.Message;
        }
        return Helper.Success("");
    }
    
    #endregion
}
