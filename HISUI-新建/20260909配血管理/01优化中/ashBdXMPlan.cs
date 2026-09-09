using System;
using System.Web;
using System.Collections.Generic;
using LIS.Frame.Dto;
using LIS.Entity;
using LIS.Entity.Enum;
using LIS.BLL.BDXMManager;
using LIS.Entity.Const;
using LIS.Frame.Util;
using iMedicalLIS;

///<summary  NoteObject="Class">
/// [功能描述:配血计划] <para/>
/// [创建者:] 曾文天<para/>
/// [创建时间:2015年11月18日] <para/>
///<说明>
///  [说明:配血计划]<para/>
///</说明>
///</summary>
namespace UI.tis.ashx
{
    public class ashBdXMPlan : BaseHttpHandler
    {
        /// <summary>
        /// 配血服务
        /// </summary>
        private IBDXMPlanManagerService service;
    
        /// <summary>
        /// 获取配血服务实现
        /// </summary>
        public IBDXMPlanManagerService ServiceImp
        {
            get
            {
                if (service == null)
                {
                    service = Helper.GetObject<IBDXMPlanManagerService>(this.UserSession);
                }
                return service;
            }
        }
    
        /// <summary>
        /// 发血服务
        /// </summary>
        private IBDXMPlanIssueService issueService;
    
        /// <summary>
        /// 获取发血服务实现
        /// </summary>
        public IBDXMPlanIssueService IssueServiceImp
        {
            get
            {
                if (issueService == null)
                {
                    issueService = Helper.GetObject<IBDXMPlanIssueService>(this.UserSession);
                }
                return issueService;
            }
        }
    
        /// <summary>
        /// 获取收费项目
        /// </summary>
        /// <returns></returns>
        public string QueryCostItem()
        {
            int ReqFormDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReqFormDR"), 0);
            List<BDReqFormCostItem> items = ServiceImp.QueryCostItem(ReqFormDR);
            return Helper.Object2Json(items);
        }
        /// <summary>
        /// 获取血型组
        /// </summary>
        /// <returns></returns>
        public string GetBloodGroup()
        {
            int ReqFormDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReqFormDR"), 0);
            string BldType = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"BldType"), "");
            BBBloodGroup BloodGroup = ServiceImp.GetBloodGroup(ReqFormDR, BldType);
            return Helper.Object2Json(BloodGroup);
        }
    
        ///// <summary>
        ///// 获取抗筛结果
        ///// </summary>
        ///// <returns></returns>
        //public string GetBloodSASRes()
        //{
        //    int ReqFormDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReqFormDR"), 0);
        //    string BldType = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"BldType"), "");
        //    string result = ServiceImp.GetBloodSASRes(ReqFormDR, BldType);
        //    return Helper.Object2Json(result);
        //}
    
    
    
        /// <summary>
        /// 查询所有已接收的申请单（接收工作组是本组）
        /// </summary>
        /// <returns>申请单集合</returns>
        public string QueryReqForm()
        {
            string DateStart = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"DateStart"), "");
            string DateEnd = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"DateEnd"), "");
            string ReqFormNo = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReqFormNo"), "");
            string MedicalNo = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"MedicalRecordNo"), "");
            string RegNo = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"RegNo"), "");
            string UseSampleNo=Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"UseSampleNo"), "");
            string TimeLimit = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"TimeLimit"), "true");
            string TakeRecordNo=Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"TakeRecordNo"), "");
            int WorkGroupDR = Convert.ToInt32(this.UserSession.WorkGroupDR);
            if (WorkGroupDR <= 0)
            {
                return "[]";
            }
            Param15Dto param = new Param15Dto();
            param.P0 = DateStart;
            param.P1 = DateEnd;
            param.P2 = ReqFormNo;
            param.P4 = MedicalNo;
            param.P5 = RegNo;
            param.P7 = UseSampleNo;
            param.P8 = TimeLimit;
            param.P9= TakeRecordNo;
    
            int rowCount;
    
            string className = "BLD.WS.BLL.DHCBDXMTest";
            string funcName = "QryBdReqFormReceiveList";
            string logInfo = this.UserSession.UserDR + "^" + this.UserSession.WorkGroupDR + "^" + this.UserSession.LocationDR + "^" + this.UserSession.GroupDR + "^" + this.UserSession.HospitalDR;
            string strJSON = "";
            string err = "";
            try
            {
                strJSON = DalManager.GetDataJSON(className, funcName, param, logInfo, true, out rowCount, out err);
            }
            catch (Exception ex)
            {
                err = ex.Message;
            }
    
            return strJSON;
        }
    
        /// <summary>
        /// 检查用户是否存在
        /// </summary>
        /// <returns></returns>
        public string checkUser()
        {
            string Code = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Code")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Code");
            Param15Dto Param = new Param15Dto();
            int rowCount = 0;
            Param.P0 = Code;
    
            string className = "BLD.WS.BLL.DHCBDXMTest";
            string funcName = "QryCheckUser";
            string logInfo = this.UserLogin.UserDR + "^" + this.UserLogin.WorkGroupDR + "^" + this.UserLogin.LocationDR + "^" + this.UserLogin.GroupDR + "^" + this.UserLogin.HospitalDR;
            string strJSON = "";
            string err = "";
            try
            {
                strJSON = DalManager.GetDataJSON(className, funcName, Param, logInfo, false, out rowCount, out err);
            }
            catch (Exception ex)
            {
                Err = ex.Message;
                return Helper.Error();
            }
    
            return strJSON;
        }
    
        /// <summary>
        /// 查询所有已接收的申请单（接收工作组是本组）
        /// </summary>
        /// <returns>申请单集合</returns>
        public string QueryReqFormByDateType()
        {
            string DateType = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"DateType"), "");
            string DateStart = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"DateStart"), "");
            string DateEnd = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"DateEnd"), "");
            int WorkGroupDR = Convert.ToInt32(this.UserSession.WorkGroupDR);
            if (WorkGroupDR <= 0)
            {
                return "[]";
            }
            List<BDReqForm> results = ServiceImp.QueryReqForm(DateType, ReqFormStatus.Receive, WorkGroupDR, DateStart, DateEnd);
            return Helper.Object2Json(results);
        }
    
        /// <summary>
        /// 查找配血计划
        /// </summary>
        /// <returns>配血计划</returns>
        public string QueryXMPlan()
        {
            //int ReqFormDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReqFormDR"), 0); 
            //List<BDXMPlanDto> results = ServiceImp.QueryXMPlan(ReqFormDR);
            //return Helper.Object2Json(results);
            int ReqFormDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReqFormDR"), 0);
            string IsVerify = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"IsVerify"), "");
            string IsFinished = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"IsFinished"), "");
            if (ReqFormDR <= 0)
            {
                return "[]";
            }
            Param15Dto param = new Param15Dto();
            param.P0 = ReqFormDR.ToString();
            param.P3 = IsVerify;
            param.P4 = IsFinished;
            int rowCount;
            string className = "BLD.WS.BLL.DHCBDXMTest";
            string funcName = "QryXMPlanByReqForm";
            string logInfo = this.UserSession.UserDR + "^" + this.UserSession.WorkGroupDR + "^" + this.UserSession.LocationDR + "^" + this.UserSession.GroupDR + "^" + this.UserSession.HospitalDR;
            string strJSON = "";
            string err = "";
            try
            {
                strJSON = DalManager.GetDataJSON(className, funcName, param, logInfo, true, out rowCount, out err);
            }
            catch (Exception ex)
            {
                err = ex.Message;
            }
    
            return strJSON;
        }
    
    
        /// <summary>
        /// 查找配血计划
        /// </summary>
        /// <returns>配血计划</returns>
        public string QueryPack()
        {
            string XMType = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"XMType"), "XSame");
            string RegNo = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"RegNo"), "");
            string ReqProductDRs_str = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReqProductDRs[]"), "");
            string  BloodGroupDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"BloodGroupDR"), "0");
            string LisBloodGroupDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"LisBloodGroupDR"), "0");
            string IsVolumnFit = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"IsVolumnFit"), "false");
            //float Volumn = Helper.ValidParamFloat(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Volumn"), 0);
            string Volumn_str = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReqVolumns[]"), "");
            int ReqFormDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReqFormDR"), 0);
            int WorkGroupDR = Convert.ToInt32(this.UserSession.WorkGroupDR);
            if (WorkGroupDR <= 0)
            {
                return "[]";
            }
            string packBarCode = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"packBarCode"), "");
            string Phenotype = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Phenotype"), "");
            string sortType = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"sortType"), "");
            string ProductBarcode = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ProductBarcode"), "");
    
            Param15Dto param = new Param15Dto();
            param.P0 = RegNo;
            param.P1 = XMType;
            param.P2 = ReqProductDRs_str;
            param.P3 = BloodGroupDR;
            param.P4 = IsVolumnFit;
            param.P5 = Volumn_str;
            param.P6 = ReqFormDR.ToString();
            param.P7 = LisBloodGroupDR;
            param.P8 = packBarCode;
            param.P9 = Phenotype;
            param.P10 = sortType;
            param.P11 = ProductBarcode;
    
            int rowCount;
            string className = "BLD.WS.BLL.DHCBDXMTest";
            string funcName = "QryXMPlanPack";
            string logInfo = this.UserSession.UserDR + "^" + this.UserSession.WorkGroupDR + "^" + this.UserSession.LocationDR + "^" + this.UserSession.GroupDR + "^" + this.UserSession.HospitalDR;
            string strJSON = "";
            string err = "";
            try
            {
                strJSON = DalManager.GetDataJSON(className, funcName, param, logInfo, true, out rowCount, out err);
            }
            catch (Exception ex)
            {
                err = ex.Message;
            }
    
            return strJSON;
        }
    
        /// <summary>
        /// 创建配血计划
        /// </summary>
        /// <returns></returns>
        public string SaveXMPlan()
        {
            string ReqFormDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReqFormDR"), "");
            string Plan = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Plan"), "");
            Param15Dto param = Helper.Json2Object<Param15Dto>(Plan);
            Result res = null;
            // string planAddUserDR = Session["BldEntryUserID"] == null ? "" : Session["BldEntryUserID"].ToString();
            string err = "";
            // 修复：创建配血计划操作人必须为当前登录用户（不依赖框架注入的Sessions，避免被审核登录残留串号）
            string retStr = DalManager.SaveByProc<Param15Dto>(param, ReqFormDR + "^" + this.UserLogin.UserDR, "BLDSP.DHCBDXMPlanService_BatchSaveXMPlan", out err);
            if (retStr != "1")
            {
                res = new Result(false, Result.ERROR_CODE, "批量创建配血计划失败：" + retStr + "！" + err);
                return Helper.Object2Json(res);
            }
            res = new Result(true, Result.SUCCESS_CODE, "批量创建配血计划成功");
            return Helper.Object2Json(res);
        }
    
        /// <summary>
        /// 删除配血计划
        /// </summary>
        /// <returns></returns>
        public string DeleteXMPlan()
        {
            int XMPlanDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"XMPlanDR"), 0);
            Result res = ServiceImp.DeleteXMPlan(XMPlanDR);
            return Helper.Object2Json(res);
        }
    
        /// <summary>
        /// 保存配血实验
        /// </summary>
        /// <returns></returns>
        public string SaveXMPlanTest()
        {
            string RowID = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"RowID"), "0");
            string ReqFormDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReqFormDR"), "");
            string Plan = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Plan"), "");
            Param15Dto param = Helper.Json2Object<Param15Dto>(Plan);
            Result res = null;
            // string planAddUserDR = Session["BldEntryUserID"] == null ? "" : Session["BldEntryUserID"].ToString();
            string err = "";
            // 修复：配血保存操作人必须为当前登录用户（不再依赖框架注入的Sessions，避免被审核登录残留串号）
            ReqFormDR = ReqFormDR + "^" + RowID + "^" + this.UserLogin.UserDR;
            string retStr = DalManager.SaveByProc<Param15Dto>(param, ReqFormDR, "BLDSP.DHCBDXMPlanService_SaveXMPlan", out err);
            if (retStr != "1")
            {
                res = new Result(false, Result.ERROR_CODE, "配血保存失败：" + retStr + "！" + err);
                return Helper.Object2Json(res);
            }
            res = new Result(true, Result.SUCCESS_CODE, "配血保存成功");
            return Helper.Object2Json(res);
        }
    
        /// <summary>
        /// 审核配血计划
        /// </summary>
        /// <returns></returns>
        public string CheckXMPlan()
        {
            string PlanDRs = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PlanDRs"), "");
            string XMCheckUserDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"XMCheckUserDR"), "0");
            // 修复：未显式传入审核人时，审核人=当前登录操作人（不依赖IRIS端Sessions，避免被审核登录残留串号）
            if (XMCheckUserDR == "0" || XMCheckUserDR == "")
            {
                XMCheckUserDR = this.UserLogin.UserDR;
            }
            // int medicalType = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"medicalType"), 0); 
            Result res =null;
            Param15Dto param = new Param15Dto();
            param.P0 = PlanDRs;
            string err = "";
            string retStr = DalManager.SaveByProc<Param15Dto>(param, XMCheckUserDR, "BLDSP.DHCBDXMPlanService_BatchCheckXMPlan", out err);
            if (retStr != "1")
            {
                res = new Result(false, Result.ERROR_CODE, "审核失败：" + retStr + "！" + err);
                return Helper.Object2Json(res);
            }
            res = new Result(true, Result.SUCCESS_CODE, "审核成功");
            return Helper.Object2Json(res);
        }
    
        /// <summary>
        /// 取消审核配血计划
        /// </summary>
        /// <returns></returns>
        public string UnCheckXMPlan()
        {
            string PlanDRs = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PlanDRs"), "");
            string Reason = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Reason"), "");
            string UnCheckUserDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"UnCheckUserDR"),"0");
            Result res = null;
            Param15Dto param = new Param15Dto();
            param.P0 = PlanDRs;
            param.P1 = Reason;
            string err = "";
            string retStr = DalManager.SaveByProc<Param15Dto>(param, UnCheckUserDR, "BLDSP.DHCBDXMPlanService_UnCheckXMPlan", out err);
            if (retStr != "1")
            {
                res = new Result(false, Result.ERROR_CODE, "取消审核失败：" + retStr + "！" + err);
                return Helper.Object2Json(res);
            }
            res = new Result(true, Result.SUCCESS_CODE, "取消审核成功");
            return Helper.Object2Json(res);
        }
    
        /// <summary>
        /// 取消审核配血计划原因
        /// </summary>
        /// <returns></returns>
        public string QueryCancelReasons()
        {
            List<BTBaseTable> res = ServiceImp.QueryBaseTableByTableTypeCode("XMCancel");
            List<BTBaseTable> reason = new List<BTBaseTable>();
            for (int i = 0; i < res.Count; i++)
            {
                var item = res[i];
                if (item.Active==true)
                {
                    reason.Add(item);
                }
            }
            return Helper.Object2Json(reason);
        }
    
        /// <summary>
        /// 发血
        /// </summary>
        /// <returns></returns>
        public string IssueXMPlan()
        {
            //string str = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Plans"), "");
            //bool positiveFee = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"positiveFee"),false);
            //int medicalInsuranceType = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"medicalType"), 0);
            //List<BDXMPlan> plans = Helper.Json2Object<List<BDXMPlan>>(str);
            //int IssueUserDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"IssueUserDR"), 0);
            // int TakeRecordDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"TakeRecordDR"), 0);  
            //Result res = IssueServiceImp.IssueXMPlan(plans, positiveFee, medicalInsuranceType, IssueUserDR,TakeRecordDR);
    
            string planDRs = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"planDRs"), "");
            string positiveFee = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"positiveFee"),"false");
            string medicalInsuranceType = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"medicalType"), "");
            string IssueUserDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"IssueUserDR"), "0");
            string TakeRecordDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"TakeRecordDR"), "");
            string TakeUserName = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"TakeUserName"), "");
            Param15Dto param = new Param15Dto();
            param.P0 = medicalInsuranceType;
            param.P1 = (IssueUserDR == "0" ? this.UserLogin.UserDR : IssueUserDR);
            param.P2 = TakeRecordDR;
            param.P3 = positiveFee;
            param.P4 = planDRs;
            param.P5 = TakeUserName;
    
            Result res = null;
            string err = "";
            string retStr = DalManager.SaveByProc<Param15Dto>(param, planDRs, "BLDSP.DHCBDIssueService_IssueXMPlan", out err);
            if (retStr.Split('^')[0] != "1")
            {
                res = new Result(false,Result.ERROR_CODE, "发血失败：" + retStr + "！" + err);
                return Helper.Object2Json(res);
            }
            res = new Result(true,Convert.ToInt32(retStr.Split('^')[1]), "发血成功");
    
            //根据返回生成的记录返回电子签名
            string SignData = "";
            if (res.IsOk && LIS.Core.MultiPlatform.LISContext.GetSession<string>(Session,"WorkGroupCAOpen_"+this.UserLogin.WorkGroupDR.ToString()) == "1")
            {
                int IssueRecordDR = res.Code;
                SignData = GetIssueRecordMTHD(Convert.ToString(IssueRecordDR));
                res.Message = Convert.ToString(IssueRecordDR) + "^" + SignData;
    
            }
    
            return Helper.Object2Json(res);
        }
    
    
        /// <summary>
        /// 取消发血
        /// </summary>
        /// <returns></returns>
        public string CancelIssueXMPlan()
        {
            //int XMPlanDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"XMPlanDR"), 0);
            string XMPlanDRs = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"XMPlanDRs"), "");
            List<int> planDRs = Helper.Json2Object<List<int>>(XMPlanDRs);
            string Reason = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Reason"), "");
            int checkUserDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"checkUserDR"), 0);
            string IssueRecordDRs=Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"IssueRecordDRs"), "");
            Result res = IssueServiceImp.CancelIssueXMPlan(planDRs, Reason,checkUserDR);
            if (res.IsOk)
            {
                SaveCancelIssOTMsgStock(XMPlanDRs+"^"+IssueRecordDRs);
            }
            return Helper.Object2Json(res);
        }
    
        public string SaveCancelIssOTMsgStock(string planDRs)
        {
            //调用类名
            string className = "BLD.Common.OTMsgStock";
            //调用方法名
            string funcName = "SaveOTMsgStockMTHD";
            //存返回的json
            string strJSON = string.Empty;
            //行数
            int rowCount = 0;
            //错误信息
            Param15Dto param = new Param15Dto();
            param.P0 = planDRs;
            param.P1 = "BLDCTransfusion";
            param.P2 = this.UserLogin.UserDR;
            string err = "";
    
            //登录信息
            string logInfo = this.UserLogin.UserDR + "^" + this.UserLogin.WorkGroupDR + "^" + this.UserLogin.LocationDR + "^" + this.UserLogin.GroupDR + "^" + this.UserLogin.HospitalDR;
            try
            {
                //调用方法
    
                strJSON = DalManager.GetDataJSON(className, funcName, param, logInfo, false, out rowCount, out err);
            }
            catch (Exception ex)
            {
                //错误信息
                strJSON = ex.Message;
            }
    
            return strJSON;
    
        }
    
        /// <summary>
        /// 查询所有发血单
        /// </summary>
        /// <returns>申请单集合</returns>
        public string QueryIssueRecord()
        {
            string DateType = "IssueDate";
            string DateStart = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"DateStart"), "");
            string DateEnd = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"DateEnd"), "");
            List<BDIssueRecord> results = IssueServiceImp.QueryIssueRecord(DateType, "", DateStart, DateEnd);
            return Helper.Object2Json(results);
        }
    
        /// <summary>
        /// 查找发血记录单明细
        /// </summary>
        /// <returns>发血记录单明细</returns>
        public string QueryIssueRecordItems()
        {
            int IssueRecordDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"IssueRecordDR"), 0);
            List<BDIssueRecordItems> results = IssueServiceImp.QueryIssueRecordItems(IssueRecordDR);
            return Helper.Object2Json(results);
        }
    
        /// <summary>
        /// 扫描血袋，自动创建配血计划
        /// </summary>
        /// <returns>创建配血计划</returns>
        public string CreateXMPlanByScanPack()
        {
            string PackBarcode = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PackBarcode"), "");
            string SampleNo = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"SampleNo"), "");
            int ReqFormDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReqFormDR"), 0);
            int ReqProductDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReqProductDR"), 0);
            int BloodGroupDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"BloodGroupDR"), 0);
            Result result = ServiceImp.CreateXMPlanByScanPack(ReqFormDR, ReqProductDR, BloodGroupDR, SampleNo, PackBarcode);
            return Helper.Object2Json(result);
        }
    
        /// <summary>
        /// 根据血袋条码，加载血袋信息
        /// </summary>
        /// <returns>血袋信息</returns>
        public string QueryPackByPackBarcode()
        {
            string PackBarcode = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PackBarcode"), "");
            string ProductBarcode = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ProductBarcode"), "");
            string RegNo = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"RegNo"), "");
            string  BloodGroupDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"BloodGroupDR"), "0");
            string LisBloodGroupDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"LisBloodGroupDR"), "0");
            string IsEmergencyCheckProduct = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"IsEmergencyCheckProduct"), "");
            string ReqFormDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReqFormDR"), "0");
            string IsBldDifficult = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"IsBldDifficult"), "0");
            string info = string.Empty;
            Result res = new Result();
            string ReqProductDRs_str = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReqProductDRs[]"), "");
    
    
            Param15Dto param = new Param15Dto();
            param.P0 = RegNo;
            param.P1 = PackBarcode;
            param.P2 = ReqProductDRs_str;
            param.P3 = BloodGroupDR;
            param.P4 = ProductBarcode;
            param.P5 = ReqFormDR;
            param.P6 = LisBloodGroupDR;
            param.P7 = IsBldDifficult;
    
            int rowCount;
            string className = "BLD.WS.BLL.DHCBDXMTest";
            string funcName = "QryPackInfoByBarCode";
            string logInfo = this.UserSession.UserDR + "^" + this.UserSession.WorkGroupDR + "^" + this.UserSession.LocationDR + "^" + this.UserSession.GroupDR + "^" + this.UserSession.HospitalDR;
            string strJSON = "";
            string err = "";
            try
            {
                strJSON = DalManager.GetDataJSON(className, funcName, param, logInfo, true, out rowCount, out err);
            }
            catch (Exception ex)
            {
                err = ex.Message;
            }
            return  strJSON;
    
        }
    
    
        /// <summary>
        /// 从后台更新指定的字段信息
        /// </summary>
        /// <returns>信息</returns>
        public string ReloadXMPlanRows()
        {
            string Packs = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Packs[]"), "");
            int ReqFormDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReqFormDR"), 0);
            if (ReqFormDR <= 0)
            {
                return "[]";
            }
            Param15Dto param = new Param15Dto();
            param.P0 = ReqFormDR.ToString();
            param.P1 =Packs;
            int rowCount;
            string className = "BLD.WS.BLL.DHCBDXMTest";
            string funcName = "QryXMPlanByReqForm";
            string logInfo = this.UserSession.UserDR + "^" + this.UserSession.WorkGroupDR + "^" + this.UserSession.LocationDR + "^" + this.UserSession.GroupDR + "^" + this.UserSession.HospitalDR;
            string strJSON = "";
            string err = "";
            try
            {
                strJSON = DalManager.GetDataJSON(className, funcName, param, logInfo, true, out rowCount, out err);
            }
            catch (Exception ex)
            {
                err = ex.Message;
            }
    
            return strJSON;
        }
    
        /// <summary>
        /// 根据指定血袋加载配血计划
        /// </summary>
        /// <returns>配血计划</returns>
        public string LoadXMPlanByPack()
        {
            int packDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PackDR"), 0);
            int ReqFormDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReqFormDR"), 0);
            //BDXMPlanDto res = ServiceImp.LoadXMPlanByPack(packDR, ReqFormDR);
            //return Helper.Object2Json(res); 
    
            if (ReqFormDR <= 0)
            {
                return "[]";
            }
            Param15Dto param = new Param15Dto();
            param.P0 = ReqFormDR.ToString();
            param.P1 = packDR.ToString();
            int rowCount;
            string className = "BLD.WS.BLL.DHCBDXMTest";
            string funcName = "QryXMPlanByReqForm";
            string logInfo = this.UserSession.UserDR + "^" + this.UserSession.WorkGroupDR + "^" + this.UserSession.LocationDR + "^" + this.UserSession.GroupDR + "^" + this.UserSession.HospitalDR;
            string strJSON = "";
            string err = "";
            try
            {
                strJSON = DalManager.GetDataJSON(className, funcName, param, logInfo, true, out rowCount, out err);
            }
            catch (Exception ex)
            {
                err = ex.Message;
            }
    
            return strJSON;
        }
    
        /// <summary>
        /// 获取工作组下面的所有仪器
        /// </summary>
        /// <returns>仪器</returns>
        public string QueryMachineByGroup()
        {
            Param15Dto param = new Param15Dto();
    
            int rowCount;
            string className = "BLD.WS.BLL.DHCBDXMTest";
            string funcName = "QueryMachineByGroup";
            string logInfo = this.UserSession.UserDR + "^" + this.UserSession.WorkGroupDR + "^" + this.UserSession.LocationDR + "^" + this.UserSession.GroupDR + "^" + this.UserSession.HospitalDR;
            string strJSON = "";
            string err = "";
            try
            {
                strJSON = DalManager.GetDataJSON(className, funcName, param, logInfo, true, out rowCount, out err);
            }
            catch (Exception ex)
            {
                err = ex.Message;
            }
    
            return strJSON;
        }
    
        /// <summary>
        /// 获取默认的仪器
        /// </summary>
        /// <returns></returns>
        public string GetDefaultMachineParameter()
        {
            SYSParameter parm = ServiceImp.GetSystemParameter("BDXMPlanMachineParameterDefault", SYSParameterType.WG, this.UserLogin.WorkGroupDR);
            if (parm == null)
            {
                return "";
            }
            return parm.ParaValue;
            // return ServiceImp.GetSystemStringParameter("BDXMPlanMachineParameterDefault",SYSParameterType.WG,this.UserLogin.WorkGroupDR);
        }
    
        /// <summary>
        /// 获取发血单
        /// </summary>
        /// <returns></returns>
        public string QueryRecordIDs()
        {
            string plans_str = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Plans[]"), "");
            List<string> plans = StrUtil.Split(plans_str, ",");
    
            List<int> plans_int = new List<int>();
            foreach (string plan in plans)
            {
                int rowId = Convert.ToInt32(plan);
    
                plans_int.Add(rowId);
            }
            List<int> records = IssueServiceImp.QueryRecordIDs(plans_int);
            return Helper.Object2Json(records);
        }
    
        /// <summary>
        /// 获取设置系统参数
        /// </summary>
        /// <returns></returns>
        public string SaveSysParamter()
        {
            List<SYSParameter> sysps = new List<SYSParameter>();
            Result res = null;
            int susNum = 0;
            ///仪器
            string val = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"BDXMPlanMachineParameterDefault"), "");
            SYSParameter parm = ServiceImp.GetSystemParameter("BDXMPlanMachineParameterDefault",SYSParameterType.WG,this.UserLogin.WorkGroupDR);
            if (parm == null)
            {
                parm = new SYSParameter();
                parm.Code = "BDXMPlanMachineParameterDefault";
                parm.ParaValue = val;
                parm.ParaType = "WG";
                parm.ParaTypeCode = this.UserLogin.WorkGroupDR;
                parm.Description = "默认的配血仪器";
                sysps.Add(parm);
            }
            else
            {
                parm.ParaValue = val;
                susNum = DalManager.Update<SYSParameter>(parm, "ParaValue");
            }
    
            if (sysps.Count > 0)
            {
                susNum = DalManager.AddBatch<SYSParameter>(sysps);
            }
            if (susNum > 0)
            {
                res = new Result(true, Result.SUCCESS_CODE, "保存配置成功");
            }
            else
            {
                res = new Result(false, Result.ERROR_CODE, "保存配置失败");
            }
            return Helper.Object2Json(res);
        }
    
    
        public string GetWaringDays()
        {
            List<SYSParameter> sysps = new List<SYSParameter>();
            List<BBBloodComponents> listBldComponents = DalManager.Query<BBBloodComponents>();
            for (int i = 0; i < listBldComponents.Count; i++)
            {
                SYSParameter sys = DalManager.GetByCode<SYSParameter>("WarningDays" + listBldComponents[i].Code);
                if (sys == null)
                {
                    sys = new SYSParameter();
                    sys.Code = "WarningDays" + listBldComponents[i].Code;
                    sys.ParaValue = "";
                    sys.ParaType = "BLD";
                    sys.ParaTypeCode = "BLD";
                    sys.Description = listBldComponents[i].CName;
                    sys.RowID = 0;
                }
                sysps.Add(sys);
            }
            return Helper.Object2Json(sysps);
        }
        /// <summary>
        /// 获取设置系统参数
        /// </summary>
        /// <returns></returns>
        public string SaveWarningDays()
        {
            List<SYSParameter> sysps = new List<SYSParameter>();
            Result res = null;
            int susNum = 0;
            //预警天数
            string WarningDays = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"WarningDays"), "");
    
            //SYSParameter parm = ServiceImp.GetSystemParameter("WarningDays");
            List<SYSParameter> listparm = Helper.Json2Object<List<SYSParameter>>(WarningDays);
            SYSParameter parm;
            for (int i = 0; i < listparm.Count; i++)
            {
                parm = listparm[i];
                //SYSParameter sys = DalManager.GetByCode<SYSParameter>(parm.Code);
                List<SYSParameter> sysparas= DalManager.QueryWhere<SYSParameter>("WHERE Code=? and ParaType='WG' and ParaTypeCode=?", "Code,ParaTypeCode", new string[] { parm.Code,this.UserLogin.WorkGroupDR });
                //List<SYSParameter> paramModelList = this.EntityManager.FindAll<SYSParameter>(hs, "", -1, -1); 
                if (sysparas.Count>0)
                {
                    SYSParameter sys = sysparas[0];
                    sys.ParaValue = parm.ParaValue;
                    susNum = DalManager.Update<SYSParameter>(sys, "ParaValue");
                }
                else
                {
                    parm.ParaType = "WG";
                    parm.ParaTypeCode = this.UserLogin.WorkGroupDR;
                    sysps.Add(parm);
                }
            }
    
            if (sysps.Count > 0)
            {
                susNum = DalManager.AddBatch<SYSParameter>(sysps);
            }
            if (susNum > 0)
            {
                res = new Result(true, Result.SUCCESS_CODE, "保存配置成功");
            }
            else
            {
                res = new Result(false, Result.ERROR_CODE, "保存配置失败");
            }
            return Helper.Object2Json(res);
        }
    
        public string InformXMPlan()
        {
            string  ReqFormDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReqFormDR"), "0");
            string MsgContent = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"MsgContent"), "");
            string infoXMPlanDRs = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"infoXMPlanDRs"), "");
            //调用类名
            string className = "BLD.WS.BLL.DHCBDXMTest";
            //调用方法名
            string funcName = "InformXMPlanMTHD";
            //存返回的json
            string strJSON = string.Empty;
            //行数
            int rowCount = 0;
            //错误信息
            Param15Dto param = new Param15Dto();
            param.P0 = MsgContent;
            param.P1 = ReqFormDR;
            param.P2 = infoXMPlanDRs;
            string err = "";
    
            //登录信息
            string logInfo = this.UserLogin.UserDR + "^" + this.UserLogin.WorkGroupDR + "^" + this.UserLogin.LocationDR + "^" + this.UserLogin.GroupDR + "^" + this.UserLogin.HospitalDR;
            try
            {
                //调用方法
    
                strJSON = DalManager.GetDataJSON(className, funcName, param, logInfo, false, out rowCount, out err);
            }
            catch (Exception ex)
            {
                //错误信息
                strJSON = ex.Message;
            }
            Result res = null;
            if (strJSON == "1")
            {
                res = new Result(true, Result.SUCCESS_CODE, "发送取血通知成功");
                return Helper.Object2Json(res);
            }
            res = new Result(false, Result.ERROR_CODE, strJSON);
            return Helper.Object2Json(res);
        }
    
        public string QueryComponentsByIssue()
        {
            int Issuedr = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"IssueDR"), 0);
            List<int> records = IssueServiceImp.QueryComponentsByIssue(Issuedr);
            return Helper.Object2Json(records);
        }
    
        public string QryHisBLDData()
        {
            string className = "DHCLIS.DHCDataUtil";
            string funcName = "QryHisBLDData";
            ///string logInfo = this.Session.UserDR + "^" + this.Session.WorkGroupDR + "^" + this.Session.LocationDR + "^" + this.Session.GroupDR + "^" + this.Session.HospitalDR;
            string strJSON = "";
            string err = "";
            int rowCount = 0;
            Param15Dto Param = new Param15Dto();
            try
            {
                strJSON = DalManager.GetDataJSON(className, funcName, Param, "", true, out rowCount, out err);
            }
            catch (Exception ex)
            {
                err = ex.Message;
            }
    
            return strJSON;
        }
    
    
        public string QryPackTrace()
        {
            string className = "BLD.WS.BLL.DHCBDPackQuery";
            string funcName = "QryPackTrace";
            string PackDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PackDR"), "");
            ///string logInfo = this.Session.UserDR + "^" + this.Session.WorkGroupDR + "^" + this.Session.LocationDR + "^" + this.Session.GroupDR + "^" + this.Session.HospitalDR;
            string strJSON = "";
            string err = "";
            int rowCount = 0;
            Param15Dto Param = new Param15Dto();
            Param.P0 = PackDR;
            try
            {
                strJSON = DalManager.GetDataJSON(className, funcName, Param, "", true, out rowCount, out err);
            }
            catch (Exception ex)
            {
                err = ex.Message;
            }
    
            return strJSON;
        }
    
    
        /// <summary>
        /// 初审用户登录
        /// </summary>
        /// <returns></returns>
        public string EntryLogin()
        {
            //获得用户名称
            string userCode = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"UserCode"), "");
            //获得用户密码
            string password = Helper.GetMd5Hash(Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Password"), ""));
            //获得有效时长
            string effectiveTime = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"EffectiveTime"), "");
            //审核登陆用户是否可以一致 
            string IsCheckUserSame = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"IsCheckUserSame"), "");
    
            //获取登录时间
            DateTime dt = DateTime.Now;
            string thisDate = dt.ToString("yyyy-MM-dd HH:mm:ss").Split(' ')[0];
            string thisTime = dt.ToString("yyyy-MM-dd HH:mm:ss").Split(' ')[1];
    
            //初审不能为超级用户
            if (userCode == DHCC)
            {
                return Helper.Error("审核用户不能为超级用户！");
            }
            if (IsCheckUserSame == "N")
            {
                if (userCode == this.UserLogin.UserCode)
                {
                    return Helper.Error("审核用户和登录用户不能一致！！");
                }
            }
            //按用户名查询用户
            //Hashtable hs = new Hashtable();
            //hs.Add("Code", userCode);
            //查询用户
            // List<SYSUser> lstUser = CodeTable.FindAll<SYSUser>(hs, "", out this.Err);
            SYSUser lstUser = DalManager.GetByCode<SYSUser>(userCode);
    
            //如果没找到用户
            if (lstUser == null || lstUser.RowID < 1)
            {
                //写登录日志
                LIS.BLL.Support.SysUserLog.SysUserLogUtil.SaveUserLog(null, "登录", "", "用户编码：" + userCode + "尝试登录-不存在");
                return Helper.Error("用户“" + userCode + "”不存在！");
            }
            //如果用户没激活，抛出锁定信息
            if (lstUser.Active == false)
            {
                //写登录日志
                LIS.BLL.Support.SysUserLog.SysUserLogUtil.SaveUserLog(null, "登录", "", "用户编码：" + userCode + "尝试登录-已锁定");
                return Helper.Error("用户“" + userCode + "”已经被锁定！");
            }
            //比较密码
            if (lstUser.Password != password)
            {
                //密码错误
                //写登录日志
                LIS.BLL.Support.SysUserLog.SysUserLogUtil.SaveUserLog(null, "审核登录", "", "用户编码：" + userCode + "尝试登录-密码错误");
                return Helper.Error("审核用户登录密码错误！");
            }
    
            //清除登录错误记录
            LIS.Core.MultiPlatform.LISContext.RemoveSession(Session,"BldLoginError");
    
            //数据存入session
            LIS.Core.MultiPlatform.LISContext.SetSession<string>(Session,"BldEntryUserID",lstUser.RowID.ToString());   //审核用户id
            LIS.Core.MultiPlatform.LISContext.SetSession<string>(Session, "BldEntryUserName", lstUser.CName); //审核用户名字
            LIS.Core.MultiPlatform.LISContext.SetSession<string>(Session, "BldEntryUserCode", lstUser.Code);  //审核用户code
            LIS.Core.MultiPlatform.LISContext.SetSession<string>(Session, "BldEffectiveTime", effectiveTime);    //审核有效时长
            LIS.Core.MultiPlatform.LISContext.SetSession<string>(Session, "BldEntryStartDate", thisDate);        //审核时长开始日期
            LIS.Core.MultiPlatform.LISContext.SetSession<string>(Session, "BldEntryStartTime", thisTime);        //审核时长开始时间
    
            //返回用户主键和用户名称
            return Helper.Object2Json(new { UserID = lstUser.RowID.ToString(), UserName = lstUser.CName });
        }
    
        /// <summary>
        /// 获取初审登录信息
        /// </summary>
        /// <returns></returns>
        public string GetEntryLoginInfo()
        {
            try
            {
                string entryUserID = LIS.Core.MultiPlatform.LISContext.GetSession<string>(Session,"BldEntryUserID") == null ? null : LIS.Core.MultiPlatform.LISContext.GetSession<string>(Session,"BldEntryUserID");
                string entryUserName = LIS.Core.MultiPlatform.LISContext.GetSession<string>(Session,"BldEntryUserName") == null ? null : LIS.Core.MultiPlatform.LISContext.GetSession<string>(Session,"BldEntryUserName");
                string entryUserCode = LIS.Core.MultiPlatform.LISContext.GetSession<string>(Session,"BldEntryUserCode") == null ? null : LIS.Core.MultiPlatform.LISContext.GetSession<string>(Session,"BldEntryUserCode");
                string effectiveTime = LIS.Core.MultiPlatform.LISContext.GetSession<string>(Session,"BldEffectiveTime") == null ? null : LIS.Core.MultiPlatform.LISContext.GetSession<string>(Session,"BldEffectiveTime");
                string entryStartDate = LIS.Core.MultiPlatform.LISContext.GetSession<string>(Session,"BldEntryStartDate") == null ? null : LIS.Core.MultiPlatform.LISContext.GetSession<string>(Session,"BldEntryStartDate");
                string entryStartTime = LIS.Core.MultiPlatform.LISContext.GetSession<string>(Session,"BldEntryStartTime") == null ? null : LIS.Core.MultiPlatform.LISContext.GetSession<string>(Session,"BldEntryStartTime");
                return Helper.Object2Json(new { UserID = entryUserID, UserName = entryUserName, effectiveTime = effectiveTime, entryStartDate = entryStartDate, entryStartTime = entryStartTime });
            }
            catch (Exception ex)
            {
                return Helper.Error(ex.Message);
            }
        }
    
        /// <summary>
        /// 初审登录退出
        /// </summary>
        /// <returns></returns>
        public string EntryLogout()
        {
    
            try
            {
                //清除相应的session字段
                Session.Remove("BldEntryUserID");   //初审用户id
                Session.Remove("BldEntryUserName"); //初审用户名字
                Session.Remove("BldEntryUserCode");  //初审用户code
                Session.Remove("BldEffectiveTime");    //初审有效时长
                Session.Remove("BldEntryStartDate");        //初审时长开始日期
                Session.Remove("BldEntryStartTime");        //初审时长开始时间
    
                return Helper.Success();
            }
            catch (Exception ex)
            {
                return Helper.Error(ex.Message);
    
            }
        }
    
        /// <summary>
        /// 获得审核的数据，为做签名使用
        /// </summary>
        /// <returns></returns>
        public string GetIssueRecordMTHD(string IssueRecordDR)
        {
            //调用类名
            string className = "CA.DataDeal";
            //调用方法名
            string funcName = "GetIssueRecordDataMTHD";
            //存返回的json
            string strJSON = string.Empty;
            //行数
            int rowCount = 0;
            //错误信息
            Param15Dto param = new Param15Dto();
            param.P0 = IssueRecordDR;
            string err = "";
    
            //登录信息
            string logInfo = this.UserLogin.UserDR + "^" + this.UserLogin.WorkGroupDR + "^" + this.UserLogin.LocationDR + "^" + this.UserLogin.GroupDR + "^" + this.UserLogin.HospitalDR;
            try
            {
                //调用方法
    
                strJSON = DalManager.GetDataJSON(className, funcName, param, logInfo, false, out rowCount, out err);
            }
            catch (Exception ex)
            {
                //错误信息
                err = ex.Message;
            }
            //返回结果
            return strJSON;
        }
    
        /// <summary>
        /// 查询血液计费信息
        /// </summary>
        /// <returns></returns>
        public string QryBdPackCost()
        {
            string packDRs = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"packDRs")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"packDRs");
            string reqFormDR = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"reqFormDR")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"reqFormDR");
            string costType = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"costType")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"costType");
    
            int rowCount;
            Param15Dto Param = new Param15Dto();
            Param.P0 = packDRs;
            Param.P1 = reqFormDR;
            Param.P2 = costType;
            string className = "BLD.WS.BLL.DHCBDPackQuery";
            string funcName = "QryBdPackCost";
            ///string logInfo = this.Session.UserDR + "^" + this.Session.WorkGroupDR + "^" + this.Session.LocationDR + "^" + this.Session.GroupDR + "^" + this.Session.HospitalDR;
            string strJSON = "";
            string err = "";
            try
            {
                strJSON = DalManager.GetDataJSON(className, funcName, Param, "", true, out rowCount, out err);
            }
            catch (Exception ex)
            {
                err = ex.Message;
            }
    
            return strJSON;
        }
    
        /// <summary>
        /// 查询血液需要收费汇总信息
        /// </summary>
        /// <returns></returns>
        public string StatPackCost()
        {
            string packDRs = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"packDRs")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"packDRs");
            string ReqformDR = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request, "ReqformDR")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request, "ReqformDR");
            int rowCount;
            Param15Dto Param = new Param15Dto();
            Param.P0 = packDRs;
            Param.P1 = ReqformDR;
            string className = "BLD.WS.BLL.DHCBDPackQuery";
            string funcName = "StatPackCost";
            string logInfo = this.UserLogin.UserDR + "^" + this.UserLogin.WorkGroupDR + "^" + this.UserLogin.LocationDR + "^" + this.UserLogin.GroupDR + "^" + this.UserLogin.HospitalDR;
            string strJSON = "";
            string err = "";
            try
            {
                strJSON = DalManager.GetDataJSON(className, funcName, Param, logInfo, true, out rowCount, out err);
            }
            catch (Exception ex)
            {
                err = ex.Message;
            }
    
            return strJSON;
        }
    
        /// 获取配血历史
        /// </summary>
        /// <returns></returns>
        public string QueryXMPlanHistory()
        {
            string admNo = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"admNo"), "");
            int rowCount;
            Param15Dto Param = new Param15Dto();
            Param.P0 = admNo;
            string className = "BLD.WS.BLL.DHCBDXMTest";
            string funcName = "QueryXMPHistoryByAdm";
            string strJSON = "";
            string err = "";
            try
            {
                strJSON = DalManager.GetDataJSON(className, funcName, Param, "", true, out rowCount, out err);
            }
            catch (Exception ex)
            {
                err = ex.Message;
            }

            return strJSON;
        }
    
        public string GetNewAdmIdByRegNo()
        {
            string regNo = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"regNo")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"regNo");
            int rowCount;
            Param15Dto Param = new Param15Dto();
            Param.P0 = regNo;
            string className = "BLD.WS.BLL.DHCBDPackQuery";
            string funcName = "QryNewAdmIdByRegNo";
            string strJSON = "";
            string err = "";
            try
            {
                strJSON = DalManager.GetDataJSON(className, funcName, Param, "", true, out rowCount, out err);
            }
            catch (Exception ex)
            {
                err = ex.Message;
            }
    
            return strJSON;
    
        }
    
        public string UpdatePatNewAdmNo()
        {
            int reqFormDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReqFormDR"), 0);
            string admNo = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"AdmNo"), "");
            Result result = ServiceImp.UpdatePatNewAdmNo(reqFormDR, admNo);
            return Helper.Object2Json(result);
        }
        public string GetBloodInfo()
        {
            string  ReqFormDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReqFormDR"), "");
            string RegNo = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"RegNo"), "");
            Param15Dto PatBloodGroupLis = GetBloodGroup(RegNo, "LIS", ReqFormDR);
            Param15Dto PatBloodGroupBld = GetBloodGroup(RegNo, "BLD", ReqFormDR);
            BBBloodGroup bdGroupLis = new BBBloodGroup();
            BBBloodGroup bdGroupBld = new BBBloodGroup();
            if (PatBloodGroupLis != null)
            {
                if(PatBloodGroupLis.P0 !="")
                {
                    bdGroupLis.RowID = Convert.ToInt32(PatBloodGroupLis.P0);
                    bdGroupLis.Code = PatBloodGroupLis.P1;
                    bdGroupLis.CName = PatBloodGroupLis.P2;
                    bdGroupLis.ABO = PatBloodGroupLis.P3;
                    bdGroupLis.RH = PatBloodGroupLis.P4;
                    bdGroupLis.Others.Add("AuthDate", PatBloodGroupLis.P8);
                    bdGroupLis.Others.Add("AuthTime", PatBloodGroupLis.P9);
                }
            }
            if (PatBloodGroupBld != null)
            {
                if (PatBloodGroupBld.P0 != "")
                {
                    bdGroupBld.RowID = Convert.ToInt32(PatBloodGroupBld.P0);
                    bdGroupBld.Code = PatBloodGroupBld.P1;
                    bdGroupBld.CName = PatBloodGroupBld.P2;
                    bdGroupBld.ABO = PatBloodGroupBld.P3;
                    bdGroupBld.RH = PatBloodGroupBld.P4;
                    bdGroupBld.Others.Add("AuthDate", PatBloodGroupBld.P8);
                    bdGroupBld.Others.Add("AuthTime", PatBloodGroupBld.P9);
                }
            }
            SYSParameter SASparameter = DalManager.GetByCode<SYSParameter>("SASScode");
            var SASScode="SAS";
            if (SASparameter != null)
            {
                SASScode = SASparameter.ParaValue;
            }
            BBBloodGroup bdGroupSas = GetTestItemResByScode(RegNo, ReqFormDR,SASScode);
            SYSParameter PHTparameter = DalManager.GetByCode<SYSParameter>("PHTScode");
            var PHTScode = "PHT";
            if (PHTparameter != null)
            {
                PHTScode = PHTparameter.ParaValue;
            }
            BBBloodGroup bdPhenotype = GetTestItemResByScode(RegNo, ReqFormDR, PHTScode);
    
            List<BBBloodGroup> listbdGroup = new List<BBBloodGroup>();
            listbdGroup.Add(bdGroupLis);
            listbdGroup.Add(bdGroupBld);
            listbdGroup.Add(bdGroupSas);
            listbdGroup.Add(bdPhenotype);
            return Helper.Object2Json(listbdGroup);
        }
    
    
        /// <summary>
        /// 获取鉴定血型，或者复合血型
        /// </summary>
        /// <param name="isByReg">是否按登记号</param>
        /// <param name="idNo">号子</param>
        /// <param name="TCSync">ABO,RH</param>
        /// <param name="BldType">LIS 鉴定血型，或者BLD复合血型</param>
        /// <returns></returns>
        private Param15Dto GetBloodGroup(string RegNo,string BldType, string ReqFormDR)
        {
            string className = "BLD.WS.BLL.DHCBDXMTest";
            string funcName = "QryPatBloodGroupMTHD";
    
            string logInfo = this.UserLogin.UserDR + "^" + this.UserLogin.WorkGroupDR + "^" + this.UserLogin.LocationDR + "^" + this.UserLogin.GroupDR + "^" + this.UserLogin.HospitalDR;
            string strJSON = "";
            int rowCount = 0;
            string err = "";
    
            Param15Dto objParam = new Param15Dto();
            objParam.P0 = RegNo;
            objParam.P1 = BldType;
            objParam.P2 = ReqFormDR;
    
            try
            {
                strJSON = DalManager.GetDataJSON(className, funcName, objParam, logInfo, false, out rowCount, out err);
                //LogUtil.WriteDebugLog("result:" + strJSON);
                return JsonUtil.JsonToObject<Param15Dto>(strJSON);
            }
            catch (Exception e)
            {
                LogUtil.WriteExceptionLog(e.Message, e);
                throw e;
            }
        }
    
        /// <summary>
        /// 获取病人的项目结果
        /// </summary>
        /// <param name="ReqFormDR">申请单</param>
        /// <param name="BldType">需要查询的血型类型</param>
        /// <returns>血型组结果</returns>
        public BBBloodGroup GetTestItemResByScode(string RegNo,string ReqFormDR, string Scode)
        {
            BBBloodGroup group = new BBBloodGroup();
    
            string className = "BLD.WS.BLL.DHCTCResult";
            string funcName = "GetTCResultByRegNoMTHD";
    
            string logInfo = this.UserLogin.UserDR + "^" + this.UserLogin.WorkGroupDR + "^" + this.UserLogin.LocationDR + "^" + this.UserLogin.GroupDR + "^" + this.UserLogin.HospitalDR;
            string strJSON = "";
            int rowCount = 0;
            string err = "";
    
            Param15Dto objParam = new Param15Dto();
            objParam.P0 = RegNo;
            objParam.P1 = Scode;
            objParam.P3 = ReqFormDR;
    
            try
            {
                strJSON = DalManager.GetDataJSON(className, funcName, objParam, logInfo, false, out rowCount, out err);
                Param15Dto ParamRes= JsonUtil.JsonToObject<Param15Dto>(strJSON);
                if (ParamRes != null)
                {
                    group.CName = ParamRes.P5;
                    group.Others.Add("AbFlag", ParamRes.P10);
                }
    
            }
            catch (Exception e)
            {
                LogUtil.WriteExceptionLog(e.Message, e);
                throw e;
            }
    
            return group;
        }
    
        /// <summary>
        /// 查询血液配血记录
        /// </summary>
        /// <returns></returns>
        public string QueryBDXMPlanLog()
        {
            int XMPlanDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"XMPlanDR"), 0);
            List<BDXMPlanHistory> planHistory= ServiceImp.QueryBDXMPlanLog(XMPlanDR);
            return Helper.Object2Json(planHistory);
        }
    
        /// <summary>
        /// 根据id查询血液信息
        /// </summary>
        /// <returns></returns>
        public string QryPackInfoById()
        {
            int packDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"packDR"), 0);
            BDPack pack = ServiceImp.QryPackInfoById(packDR);
            return Helper.Object2Json(pack);
        }
    
        /// <summary>
        /// 保存配血历史
        /// </summary>
        /// <returns></returns>
        public string SaveXMPlanHistory()
        {
            
			//string strPlanHistory = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PlanHistory"), "");
            //string strPlan = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Plan"), "");
            //List<BDXMPlanHistory> planHistory = Helper.Json2Object<List<BDXMPlanHistory>>(strPlanHistory);
            //BDXMPlan plan=Helper.Json2Object<BDXMPlan>(strPlan);
            //Result res = ServiceImp.SaveXMPlanHistory(planHistory, plan);
            //return Helper.Object2Json(res);
			string strPlanHistory = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PlanHistory"), "");
            string strPlan = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Plan"), "");
            string ReqFormDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request, "ReqFormDR"), "");
            string err = "";
            Result res = null;
            //插入his医嘱
            Param15Dto param = new Param15Dto();
            param.P0 = strPlanHistory;
            param.P1 = strPlan;
            string retStr = DalManager.SaveByProc<Param15Dto>(param, ReqFormDR, "BLDSP.DHCBDXMPlanService_SaveXMPlanHistory", out err);

            if (retStr.Split('^')[0] != "1")
            {
                res = new Result(false, Result.ERROR_CODE, "保存失败：" + retStr.Split('^')[1] + "！" + err);
                return Helper.Object2Json(res);
            }
            res = new Result(true, Result.SUCCESS_CODE, retStr.Split('^')[1]);

            return Helper.Object2Json(res);
        }
    
        /// <summary>
        /// 根据发血单查询血液血产品
        /// </summary>
        /// <returns></returns>
        public string QueryProductsByIssue()
        {
            int Issuedr = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"IssueDR"), 0);
            List<BBBloodProduct> records = IssueServiceImp.QueryProductsByIssue(Issuedr);
            return Helper.Object2Json(records);
    
        }
    
        /// <summary>
        /// 查询血液复查结果
        /// </summary>
        /// <returns></returns>
        public string QryPackTestRes()
        {
            int PackDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PackDR"), 0);
            List<BDPackTestResult> packTestRes = ServiceImp.QryPackTestRes(PackDR);
            return Helper.Object2Json(packTestRes);
        }
        /// <summary>
        /// 保存血液复查结果
        /// </summary>
        /// <returns></returns>
        public string SaveBdPackTestRes()
        {
            string packTestRes = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"packTestRes"), "");
            List<BDPackTestResult> listpackTestRes = Helper.Json2Object<List<BDPackTestResult>>(packTestRes);
            Result res = ServiceImp.SaveBdPackTestRes(listpackTestRes);
            return Helper.Object2Json(res);
        }
    
        public string QryPackMoreMatch()
        {
            int PackDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PackDR"), 0);
            List<BDXMPlan> plans=ServiceImp.QryMoreMatchByPack(PackDR);
            return Helper.Object2Json(plans);
        }
        public string CheckPackIssueRecords()
        {
            int Issuedr = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"IssueDR"), 0);
            string ArriveUserDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ArriveUserDR"), "");
            Result res = IssueServiceImp.CheckPackIssueRecords(Issuedr, ArriveUserDR);
            return Helper.Object2Json(res);
        }
    
        public string UpdatePackBGCheckInfo()
        {
            string packDRs = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"packDRs"), "");
            string checkUserDR = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"checkUserDR")) ? "0" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"checkUserDR");
            Result result = null;
            Param15Dto Param = new Param15Dto();
            Param.P0 = checkUserDR;
            Param.P1 = packDRs;
            string err = "";
            string retStr = DalManager.SaveByProc<Param15Dto>(Param, checkUserDR, "BLDSP.DHCBDPackIn_BatchPackBGCheckInfo", out err);
            if (retStr != "1")
            {
                result = new Result(false, Result.ERROR_CODE, retStr);
                return Helper.Object2Json(result);
            }
            result = new Result(true, Result.SUCCESS_CODE, "");
            return Helper.Object2Json(result);
        }
    
        /// <summary>
        /// 查找配血计划
        /// </summary>
        /// <returns>配血计划</returns>
        public string QryPatVisitNum()
        {
            string RegNo = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"RegNo"), "");
            Param15Dto param = new Param15Dto();
            param.P0 = RegNo;
            int rowCount;
            string className = "BLD.WS.BLL.DHCBDXMTest";
            string funcName = "QryPatVisitNum";
            string logInfo = this.UserSession.UserDR + "^" + this.UserSession.WorkGroupDR + "^" + this.UserSession.LocationDR + "^" + this.UserSession.GroupDR + "^" + this.UserSession.HospitalDR;
            string strJSON = "";
            string err = "";
            try
            {
                strJSON = DalManager.GetDataJSON(className, funcName, param, logInfo, true, out rowCount, out err);
            }
            catch (Exception ex)
            {
                err = ex.Message;
            }
    
            return strJSON;
        }
    
        /// <summary>
        /// 申请单标本号修改
        /// </summary>
        /// <returns></returns>
        public string UpdateReqFormSampleNo()
        {
            BDSYSModifyLog BDModifyLog = new BDSYSModifyLog();
            BDModifyLog.TableName = "dbo.BDReqForm";
            BDModifyLog.ModifyItem = "UseSampleNo";
            BDModifyLog.AddDate = TimeUtil.GetNowDate();
            BDModifyLog.AddTime = TimeUtil.GetNowTime();
            BDModifyLog.AddUserDR = Convert.ToInt32(this.UserLogin.UserDR);
            BDModifyLog.WorkGroupDR = Convert.ToInt32(this.UserLogin.WorkGroupDR);
            BDModifyLog.ClientIP = System.Net.Dns.GetHostName();
            string reqformstr= Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"reqform"), "");
            BDReqForm reqform = Helper.Json2Object<BDReqForm>(reqformstr);
            BDReqForm preReqForm = DalManager.GetById<BDReqForm>(reqform.RowID);
            BDModifyLog.TableRowID = reqform.RowID.ToString();
            BDModifyLog.PreContent = preReqForm.UseSampleNo;
            BDModifyLog.AfterContent = reqform.UseSampleNo;
            int i = DalManager.Update<BDReqForm>(reqform, "UseSampleNo");
            Result res = null;
            if (i > 0)
            {
                res= new Result(true, Result.SUCCESS_CODE, "申请单标本号修改成功");
                DalManager.Add<BDSYSModifyLog>(BDModifyLog);
                return Helper.Object2Json(res);
            }
    
    
            res = new Result(false, Result.ERROR_CODE, "申请单标本号修改失败");
            return Helper.Object2Json(res);
        }
    
        public string QryPackSpcimen()
        {
            string specimenNo = LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"specimenNo");//从页面获取查询参数 
            string packDR = LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"packDR");//从页面获取查询参数
            List<BDPackSpecimen> packspecimensspecimen = DalManager.QueryViewByCol<BDPackSpecimen>("SpecimenNo", specimenNo);
            Result res = new Result(true, Result.SUCCESS_CODE, "");
            if (packspecimensspecimen.Count > 0)
            {
                res= new Result(false, Result.ERROR_CODE, "血标本[" + specimenNo + "]已经关联血液编号[" + packspecimensspecimen[0].Pack.PackID + "]");
                // return Helper.Error("错误:血标本[" + specimenNo + "]已经关联血液编号[" + packspecimensspecimen[0].Pack.PackID + "]");
            }
            List<BDPackSpecimen> packspecimenspack = DalManager.QueryViewByCol<BDPackSpecimen>("PackDR", packDR);
            if (packspecimenspack.Count > 0)
            {
                res= new Result(false, Result.ERROR_CODE, "献血码[" + packspecimenspack[0].Pack.PackID + "]已经关联血标本[" + packspecimenspack[0].SpecimenNo + "]");
                //return Helper.Error("错误:献血码[" + packspecimenspack[0].Pack.PackID + "]已经关联血标本[" + packspecimenspack[0].SpecimenNo + "]");
            }
            return Helper.Object2Json(res);
        }
    
        /// <summary>
        /// 保存血液标本信息
        /// </summary>
        /// <returns></returns>
        public string SavePackSpcimen()
        {
            try
            {
                string specimenNo = LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"specimenNo");//从页面获取查询参数 
                string packDR = LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"packDR");//从页面获取查询参数
                BDPackSpecStorage packspecstorage = DalManager.GetByCol<BDPackSpecStorage>("PackSpecNo", specimenNo);
                if (packspecstorage == null)
                {
                    return Helper.Error("错误：未查询到血标本信息");
                }
                List<BDPackSpecimen> packspecimensspecimen= DalManager.QueryViewByCol<BDPackSpecimen>("SpecimenNo", specimenNo);
                if (packspecimensspecimen.Count > 0)
                {
                    //return Helper.Error("错误:血标本[" + specimenNo + "]已经关联血液编号[" + packspecimensspecimen[0].Pack.PackID + "]");
                }
                List<BDPackSpecimen> packspecimenspack = DalManager.QueryViewByCol<BDPackSpecimen>("PackDR", packDR);
                if (packspecimenspack.Count > 0)
                {
                    //   return Helper.Error("错误:献血码[" + packspecimenspack[0].Pack.PackID + "]已经关联血标本[" + packspecimenspack[0].SpecimenNo + "]");
                }
    
                BDPackSpecimen packspecimen = new BDPackSpecimen();
                packspecimen.PackDR = Convert.ToInt32(packDR);
                packspecimen.SpecimenNo = specimenNo;
                packspecimen.AddDate = TimeUtil.GetNowDate();
                packspecimen.AddTime = TimeUtil.GetNowTime();
                packspecimen.AddUserDR = this.UserSession.UserDR;
                int result = DalManager.Add<BDPackSpecimen>(packspecimen);
                if (result > 0)
                {
                    return Helper.Success("保存成功");
                }
                else
                {
                    return Helper.Error("错误：保存错误");
                }
            }
            catch (Exception e)
            {
                throw new Exception(e.Message.ToString());
            }
        }
    
        public string SaveXMPlanList()
        {
            string plans_str= Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"plans"), "");
            List<BDXMPlan> plans = Helper.Json2Object<List<BDXMPlan>>(plans_str);
            string machinexms_str = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"machinexms"), "");
            List<BDMachineXM> machinexms = Helper.Json2Object<List<BDMachineXM>>(machinexms_str);
    
            Result res = ServiceImp.SaveXMPlan(plans,machinexms);
            return Helper.Object2Json(res);
        }
    
        public string ReSaveXMPlan()
        {
            string machinexms_str = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"machinexms"), "");
            List<BDMachineXM> machinexms = Helper.Json2Object<List<BDMachineXM>>(machinexms_str);
            Result res = ServiceImp.ReSaveXMPlan(machinexms);
            return Helper.Object2Json(res);
        }
    
    
        /// <summary>
        /// 查找配血计划
        /// </summary>
        /// <returns>配血计划</returns>
        public string QueryXMPlanByIssue()
        {
            //int ReqFormDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReqFormDR"), 0); 
            //List<BDXMPlanDto> results = ServiceImp.QueryXMPlan(ReqFormDR);
            //return Helper.Object2Json(results);
            int ReqFormDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReqFormDR"), 0);
            string isIssued = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"isIssued"), "");
            if (ReqFormDR <= 0)
            {
                return "[]";
            }
            Param15Dto param = new Param15Dto();
            param.P0 = ReqFormDR.ToString();
            param.P2 = isIssued;
            int rowCount;
            string className = "BLD.WS.BLL.DHCBDXMTest";
            string funcName = "QryXMPlanByReqForm";
            string logInfo = this.UserSession.UserDR + "^" + this.UserSession.WorkGroupDR + "^" + this.UserSession.LocationDR + "^" + this.UserSession.GroupDR + "^" + this.UserSession.HospitalDR;
            string strJSON = "";
            string err = "";
            try
            {
                strJSON = DalManager.GetDataJSON(className, funcName, param, logInfo, true, out rowCount, out err);
            }
            catch (Exception ex)
            {
                err = ex.Message;
            }
    
            return strJSON;
        }
    
        public string QryIssuePackByRegNo()
        {
            string RegNo = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"RegNo"), "");
            string AdmNo = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"AdmNo"), "");
    
            Param15Dto param = new Param15Dto();
            param.P0 = RegNo;
            param.P1 = AdmNo;
    
            int rowCount;
            string className = "BLD.WS.BLL.DHCBDXMTest";
            string funcName = "QryIssuePackByRegNo";
            string logInfo = this.UserSession.UserDR + "^" + this.UserSession.WorkGroupDR + "^" + this.UserSession.LocationDR + "^" + this.UserSession.GroupDR + "^" + this.UserSession.HospitalDR;
            string strJSON = "";
            string err = "";
            try
            {
                strJSON = DalManager.GetDataJSON(className, funcName, param, logInfo, true, out rowCount, out err);
            }
            catch (Exception ex)
            {
                err = ex.Message;
            }
    
            return strJSON;
        }
    
        /// <summary>
        /// 保存病人疑难配血记录
        /// </summary>
        /// <returns></returns>
        public string  SaveBDPatDiscrepancyLog()
        {
            string RegNo = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"RegNo"), "");
            string Isdiscrepancy = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Isdiscrepancy"), "");
            BDPatInfoExtend patInfoExtend = DalManager.GetByCol<BDPatInfoExtend>("RegNo", RegNo);
            string precontent = "";
            if (patInfoExtend == null)
            {
                patInfoExtend = new BDPatInfoExtend();
                patInfoExtend.RegNo = RegNo;
            }
    
            if (Isdiscrepancy != "")
            {
                precontent = patInfoExtend.Isdiscrepancy.ToString();
                patInfoExtend.Isdiscrepancy = Convert.ToBoolean(Convert.ToInt32(Isdiscrepancy));
            }
            int rowID;
            int result;
    
            if (patInfoExtend.RowID>0)
            {
                result = DalManager.Update<BDPatInfoExtend>(patInfoExtend, "Isdiscrepancy");
                rowID = patInfoExtend.RowID;
            }
            else
            {
                result = DalManager.Add<BDPatInfoExtend>(patInfoExtend, out rowID);
            }
            Result res = null;
            if (result > 0)
            {
                res = new Result(true, Result.SUCCESS_CODE, "");
            }
            else
            {
                res= new Result(false, Result.ERROR_CODE, "");
                return Helper.Object2Json(res);
            }
            BDSYSModifyLog sysModifyLog = new BDSYSModifyLog();
            sysModifyLog.TableName = "dbo.BDPatInfoExtend";
            sysModifyLog.TableRowID = rowID.ToString();
            sysModifyLog.ModifyItem = "Isdiscrepancy";
            sysModifyLog.AddUserDR = Convert.ToInt32(this.UserLogin.UserDR);
            sysModifyLog.AddDate = TimeUtil.GetNowDate();
            sysModifyLog.AddTime = TimeUtil.GetNowTime();
            sysModifyLog.WorkGroupDR = Convert.ToInt32(this.UserLogin.WorkGroupDR);
            sysModifyLog.PreContent = precontent;
            sysModifyLog.AfterContent = Isdiscrepancy;
            DalManager.Add<BDSYSModifyLog>(sysModifyLog);
            return Helper.Object2Json(res);
        }
    
        public string ChangeReqAdm()
        {
            int ReqFormDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReqFormDR"), 0);
            string AdmNo=Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"AdmNo"),"");
            string ReqAdmNo = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReqAdmNo"), "");
            BDReqForm reqForm = DalManager.GetById<BDReqForm>(ReqFormDR);
            Result res = null;
            if (reqForm.AdmType == "I")
            {
                res = new Result(true, Result.SUCCESS_CODE, "绑定成功");
                return Helper.Object2Json(res);
    
            }
            try
            {
                DalManager.OpenTransaction();
                reqForm.ReqAdmNo = ReqAdmNo;
                reqForm.AdmNo = AdmNo;
                reqForm.AdmType = "I";
                int rowid = DalManager.Update<BDReqForm>(reqForm, "ReqAdmNo,AdmNo,AdmType");
                BDSYSModifyLog sysModifyLog = new BDSYSModifyLog();
                sysModifyLog.TableName = "dbo.BDReqForm";
                sysModifyLog.TableRowID = ReqFormDR.ToString();
                sysModifyLog.ModifyItem = "ReqAdmNo";
                sysModifyLog.AddUserDR = Convert.ToInt32(this.UserLogin.UserDR);
                sysModifyLog.AddDate = TimeUtil.GetNowDate();
                sysModifyLog.AddTime = TimeUtil.GetNowTime();
                sysModifyLog.WorkGroupDR = Convert.ToInt32(this.UserLogin.WorkGroupDR);
                sysModifyLog.PreContent = ReqAdmNo;
                sysModifyLog.AfterContent = AdmNo;
                DalManager.Add<BDSYSModifyLog>(sysModifyLog);
                if (rowid > 0)
                {
                    DalManager.CommitTransaction();
                    res = new Result(true, Result.SUCCESS_CODE, "绑定成功");
                }
                else
                {
                    DalManager.RollBackTransaction();
                    res = new Result(false, Result.ERROR_CODE, "绑定失败");
                }
            }
            catch (Exception e)
            {
                DalManager.RollBackTransaction();
                LogUtil.WriteExceptionLog(e.Message, e);
            }
            return Helper.Object2Json(res);
    
        }
    
        /// <summary>
        ///上传配血信息
        /// </summary>
        /// <returns></returns>
        public string UpLoadXMPlanInfo()
        {
    
    
            string XMtype = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"XMtype"), "");
            string PlanStr = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PlanStr"), "");
            Param15Dto param = new Param15Dto();
            param.P0 = XMtype;
            param.P1 = PlanStr;
    
            int rowCount;
    
            string className = "BLD.WS.BLL.DHCBDPackBindRFID";
            string funcName = "UpLoadXMPlanInfoMTHD";
            string logInfo = this.UserSession.UserDR + "^" + this.UserSession.WorkGroupDR + "^" + this.UserSession.LocationDR + "^" + this.UserSession.GroupDR + "^" + this.UserSession.HospitalDR;
            string strJSON = "";
            string err = "";
            try
            {
                strJSON = DalManager.GetDataJSON(className, funcName, param, logInfo, true, out rowCount, out err);
            }
            catch (Exception ex)
            {
                err = ex.Message;
            }
    
            return strJSON;
        }
    
        public string QryXMDepictResRule()
        {
            Param15Dto param = new Param15Dto();
            int rowCount;
            string className = "BLD.WS.BLL.DHCBDXMTest";
            string funcName = "QryXMDepictResRule";
            string logInfo = this.UserSession.UserDR + "^" + this.UserSession.WorkGroupDR + "^" + this.UserSession.LocationDR + "^" + this.UserSession.GroupDR + "^" + this.UserSession.HospitalDR;
            string strJSON = "";
            string err = "";
            try
            {
                strJSON = DalManager.GetDataJSON(className, funcName, param, logInfo, true, out rowCount, out err);
            }
            catch (Exception ex)
            {
                err = ex.Message;
            }
    
            return strJSON;
        }
    
        public string QryXMResultRule()
        {
    
            Param15Dto param = new Param15Dto();
            int rowCount;
            string className = "BLD.WS.BLL.DHCBDXMTest";
            string funcName = "QryXMResultRule";
            string logInfo = this.UserSession.UserDR + "^" + this.UserSession.WorkGroupDR + "^" + this.UserSession.LocationDR + "^" + this.UserSession.GroupDR + "^" + this.UserSession.HospitalDR;
            string strJSON = "";
            string err = "";
            try
            {
                strJSON = DalManager.GetDataJSON(className, funcName, param, logInfo, true, out rowCount, out err);
            }
            catch (Exception ex)
            {
                err = ex.Message;
            }
    
            return strJSON;
        }
        /// <summary>
        /// 记录消息信息  消息类型 “IssBldInfo” 发血                                  
        /// </summary>
        /// <returns></returns>
        public string SaveIssRecord()
        {
            string BllID = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"BllID")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"BllID");
            string BllType = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"BllType")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"BllType");
            int rowCount;
            Param15Dto Param = new Param15Dto();
            Param.P0 = BllID;
            Param.P1 = BllType;
    
            string className = "BLDProxy.Supplier.BLL.SaveRecordMsg";
            string funcName = "SaveIssRecordMsgMTHD";
            string strJSON = "";
            string err = "";
            string logInfo = this.UserSession.UserDR + "^" + this.UserSession.WorkGroupDR + "^" + this.UserSession.LocationDR + "^" + this.UserSession.GroupDR + "^" + this.UserSession.HospitalDR;
            try
            {
                strJSON = DalManager.GetDataJSON(className, funcName, Param, logInfo, true, out rowCount, out err);
            }
            catch (Exception ex)
            {
                err = ex.Message;
            }
    
            return strJSON;
        }
    
    
        /// <summary>
        /// 获取血型鉴定医嘱
        /// </summary>
        /// <returns></returns>
        public string PromptIssuePack()
        {
            string className = "BLD.WS.BLL.DHCBDXMTest";
            string funcName = "PromptIssuePackMTHD";
            string planDRs = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"planDRs")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"planDRs");
            Param15Dto Param = new Param15Dto();
            Param.P0 = planDRs;
    
            //登录信息
            string logInfo = this.UserLogin.UserDR + "^" + this.UserLogin.WorkGroupDR + "^" + this.UserLogin.LocationDR + "^" + this.UserLogin.GroupDR + "^" + this.UserLogin.HospitalDR;
            int retVal = 0;
            string strJSON = "";
            string errstr = string.Empty;
    
            try
            {
                strJSON = this.DalManager.GetDataJSON(className, funcName, Param
                    , logInfo, false, out retVal, out errstr);
            }
            catch (Exception e)
            {
                errstr += e.Message;
                return errstr;
            }
    
            return strJSON;
        }
    
        /// <summary>
        /// 获取血型鉴定医嘱
        /// </summary>
        /// <returns></returns>
        public string SaveBDIssueCA()
        {
            string RecordNo = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"RecordNo")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"RecordNo");
            string StrImage = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"StrImage")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"StrImage");
            //调用类名
            string className = "CA.DataDeal";
            //调用方法名
            string funcName = "UpdateIssSignFileNameMTHD";
            //存返回的json
            string strJSON = string.Empty;
            //行数
            int rowCount = 0;
            //错误信息
            Param15Dto param = new Param15Dto();
            param.P0 = RecordNo;
            param.P0 = StrImage;
    
            string err = "";
    
            //登录信息
            string logInfo = this.UserLogin.UserDR + "^" + this.UserLogin.WorkGroupDR + "^" + this.UserLogin.LocationDR + "^" + this.UserLogin.GroupDR + "^" + this.UserLogin.HospitalDR;
            try
            {
                //调用方法
    
                strJSON = DalManager.GetDataJSON(className, funcName, param, logInfo, false, out rowCount, out err);
            }
            catch (Exception ex)
            {
                //错误信息
                err = ex.Message;
            }
            //返回结果
            return strJSON;
        }
    
        /// <summary>
        /// 疑难配血记录操作
        /// </summary>
        /// <returns></returns>
        public string SavePatDiffMatch()
        {
            string ReqFormDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReqFormDR"), "");
            string RegNo = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"RegNo"), "");
            string PatDMRecordDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PatDMRecordDR"), "");
            string DifficultMatchDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"DifficultMatchDR"), "");
            string Remark = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Remark"), "");
            Param15Dto param = new Param15Dto();
            param.P0 = PatDMRecordDR;
            param.P1 = DifficultMatchDR;
            param.P2= ReqFormDR;
            param.P3 = Remark;
            Result res = null;
            string err = "";
            string retStr = DalManager.SaveByProc<Param15Dto>(param, RegNo, "BLDSP.BISPatDiffMatch_SavePatDiffMatch", out err);
            if (retStr != "1")
            {
                res = new Result(false, Result.ERROR_CODE, "疑难配血记录操作失败：" + retStr + "！" + err);
                return Helper.Object2Json(res);
            }
            res = new Result(true, Result.SUCCESS_CODE, "疑难配血记录操作成功");
            return Helper.Object2Json(res);
        }
    
        /// <summary>
        /// 疑难配血删除操作
        /// </summary>
        /// <returns></returns>
        public string DelPatDiffMatch()
        {
            string ReqFormDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReqFormDR"), "");
            string RegNo = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"RegNo"), "");
            string PatDMRecordDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PatDMRecordDR"), "");
            Param15Dto param = new Param15Dto();
            param.P0 = PatDMRecordDR;
            param.P2 = ReqFormDR;
            Result res = null;
            string err = "";
            string retStr = DalManager.SaveByProc<Param15Dto>(param, RegNo, "BLDSP.BISPatDiffMatch_DelPatDiffMatch", out err);
            if (retStr != "1")
            {
                res = new Result(false, Result.ERROR_CODE, "疑难配血记录删除失败：" + retStr + "！" + err);
                return Helper.Object2Json(res);
            }
            res = new Result(true, Result.SUCCESS_CODE, "疑难配血删除操作成功");
            return Helper.Object2Json(res);
        }
    
        public string QryPatDiffMatchRecord()
        {
            string RegNo = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"RegNo")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"RegNo");
            //调用类名
            string className = "BLD.WS.BLL.DHCBDPatDiffMatch";
            //调用方法名
            string funcName = "QryPatDiffMatchRecord";
            //存返回的json
            string strJSON = string.Empty;
            //行数
            int rowCount = 0;
            //错误信息
            Param15Dto param = new Param15Dto();
            param.P0 = RegNo;
            string err = "";
            //登录信息
            string logInfo = this.UserLogin.UserDR + "^" + this.UserLogin.WorkGroupDR + "^" + this.UserLogin.LocationDR + "^" + this.UserLogin.GroupDR + "^" + this.UserLogin.HospitalDR;
            try
            {
                //调用方法
    
                strJSON = DalManager.GetDataJSON(className, funcName, param, logInfo, false, out rowCount, out err);
            }
            catch (Exception ex)
            {
                //错误信息
                err = ex.Message;
            }
            //返回结果
            return strJSON;
        }
    
        public string CancelInformXMPlan()
        {
            string XMPlanDRs = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"XMPlanDRs"), "");
            string AdmNo = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"AdmNo"), "");
            //调用类名
            string className = "BLD.WS.BLL.DHCBDXMTest";
            //调用方法名
            string funcName = "CancelInformXMPlanMTHD";
            //存返回的json
            string strJSON = string.Empty;
            //行数
            int rowCount = 0;
            //错误信息
            Param15Dto param = new Param15Dto();
            param.P0 = XMPlanDRs;
            param.P1 = AdmNo;
            string err = "";
    
            //登录信息
            string logInfo = this.UserLogin.UserDR + "^" + this.UserLogin.WorkGroupDR + "^" + this.UserLogin.LocationDR + "^" + this.UserLogin.GroupDR + "^" + this.UserLogin.HospitalDR;
            try
            {
                //调用方法
    
                strJSON = DalManager.GetDataJSON(className, funcName, param, logInfo, false, out rowCount, out err);
            }
            catch (Exception ex)
            {
                //错误信息
                strJSON = ex.Message;
            }
            Result res = null;
            if (strJSON == "1")
            {
                res = new Result(true, Result.SUCCESS_CODE, "取消取血通知成功");
                return Helper.Object2Json(res);
            }
            res = new Result(false, Result.ERROR_CODE, strJSON+err);
            return Helper.Object2Json(res);
        }
    
        /// <summary>
        ///修改医保类型
        /// </summary>
        /// <returns></returns>
        public string UpdataPayMentType()
        {
            string className = "BLD.WS.BLL.DHCBDXMTest";
            string funcName = "UpdataPayMentTypeMTHD";
            string ReqFormDR = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReqFormDR")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReqFormDR");
            string MedicalInsuranceType = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"MedicalInsuranceType")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"MedicalInsuranceType");
            string PayMentType = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PayMentType")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PayMentType");
            Param15Dto Param = new Param15Dto();
            Param.P0 = ReqFormDR;
            Param.P1 = MedicalInsuranceType;
            Param.P2 = PayMentType;
    
            //登录信息
            string logInfo = this.UserLogin.UserDR + "^" + this.UserLogin.WorkGroupDR + "^" + this.UserLogin.LocationDR + "^" + this.UserLogin.GroupDR + "^" + this.UserLogin.HospitalDR;
            int retVal = 0;
            string strJSON = "";
            string errstr = string.Empty;
    
            try
            {
                strJSON = this.DalManager.GetDataJSON(className, funcName, Param
                    , logInfo, false, out retVal, out errstr);
            }
            catch (Exception e)
            {
                errstr += e.Message;
                return errstr;
            }
    
            return strJSON;
        }
        /// <summary>
        /// 核对申请单与标本信息
        /// </summary>
        /// <returns></returns>
        public string GetIsOwnLabNo()
        {
            string ReqFormDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReqFormDR"), "");
            string labNo = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"LabNo"), "");
    
            string className = "BLD.WS.BLL.BIS.VerifyPack";
            string funcName = "GetIsOwnLabNoMTHD";
    
            Param15Dto Param = new Param15Dto();
            Param.P0 = labNo;
            Param.P1 = ReqFormDR;
    
            //登录信息
            string logInfo = this.UserLogin.UserDR + "^" + this.UserLogin.WorkGroupDR + "^" + this.UserLogin.LocationDR + "^" + this.UserLogin.GroupDR + "^" + this.UserLogin.HospitalDR;
            int retVal = 0;
            string strJSON = "";
            string errstr = string.Empty;
    
            try
            {
                strJSON = this.DalManager.GetDataJSON(className, funcName, Param
                    , logInfo, false, out retVal, out errstr);
            }
            catch (Exception e)
            {
                errstr += e.Message;
                return errstr;
            }
    
            return strJSON;
        }
        /// <summary>
        /// 保存校验信息
        /// </summary>
        /// <returns></returns>
        public string VerifySave()
        {
            string xmPlanDRs = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"xmPlanDRs"), "");
    
    
            string className = "BLD.WS.BLL.BIS.VerifyPack";
            string funcName = "VerifySaveMTHD";
    
            Param15Dto Param = new Param15Dto();
            Param.P0 = xmPlanDRs;
            //登录信息
            string logInfo = this.UserLogin.UserDR + "^" + this.UserLogin.WorkGroupDR + "^" + this.UserLogin.LocationDR + "^" + this.UserLogin.GroupDR + "^" + this.UserLogin.HospitalDR;
            int retVal = 0;
            string strJSON = "";
            string errstr = string.Empty;
    
            try
            {
                strJSON = this.DalManager.GetDataJSON(className, funcName, Param , logInfo, false, out retVal, out errstr);
            }
            catch (Exception e)
            {
                errstr += e.Message;
                return errstr;
            }
    
            return strJSON;
        }
        /// 疑难配血记录操作
        /// </summary>
        /// <returns></returns>
        public string LockReqForm()
        {
            string ReqFormDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ReqFormDR"), "");
            string IsLocked = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"IsLocked"), "");
            Param15Dto param = new Param15Dto();
            param.P0= IsLocked;
            Result res = null;
            string err = "";
            string retStr = "";
            if (IsLocked == "1")
            {
                retStr = DalManager.SaveByProc<Param15Dto>(param, ReqFormDR, "BLDSP.CTSReqForm_LockReqForm", out err);
            }
            else
            {
                retStr = DalManager.SaveByProc<Param15Dto>(param, ReqFormDR, "BLDSP.CTSReqForm_UnLockReqForm", out err);
            }
            if (retStr != "1")
            {
                res = new Result(false, Result.ERROR_CODE, "锁定申请单失败：" + retStr + "！" + err);
                return Helper.Object2Json(res);
            }
            res = new Result(true, Result.SUCCESS_CODE, "锁定申请单成功");
            return Helper.Object2Json(res);
        }
    
        /// <summary>
        /// 发血前查询配置的医嘱报告是否审核
        /// </summary>
        /// <returns></returns>
        public string QryVisitNumberReportByAdm()
        {
            string AdmNo = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"AdmNo"), "");
            string className = "BLD.WS.BLL.BIS.RPVisitNumberReportQry";
            string funcName = "QryVisitNumberReportMTHD";
            Param15Dto Param = new Param15Dto();
            Param.P0 = AdmNo;
            //登录信息
            string logInfo = this.UserLogin.UserDR + "^" + this.UserLogin.WorkGroupDR + "^" + this.UserLogin.LocationDR + "^" + this.UserLogin.GroupDR + "^" + this.UserLogin.HospitalDR;
            int retVal = 0;
            string strJSON = "";
            string errstr = string.Empty;
    
            try
            {
                strJSON = this.DalManager.GetDataJSON(className, funcName, Param , logInfo, false, out retVal, out errstr);
            }
            catch (Exception e)
            {
                errstr += e.Message;
                return errstr;
            }
    
            return strJSON;
        }
    
        public string CheckExtIssueRecord()
        {
    
            string PlanDRs = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"PlanDRs"), "");
            string XMCheckUserDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"XMCheckUserDR"), "0");
            string ExtRecordNo=Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ExtRecordNo"), "");
            string ftpPath = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"Ftp"), "");
            string ExtInstitution=Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ExtInstitution"), "");
            List<LIS.Core.MultiPlatform.FileCollection> files = LIS.Core.MultiPlatform.LISWebFile.GetFiles(Request);
            Result res =null;
            Param15Dto param = new Param15Dto();
            param.P0 = PlanDRs;
            param.P1 = XMCheckUserDR;
            string err = "";
            string retStr = DalManager.SaveByProc<Param15Dto>(param, XMCheckUserDR, "BLDSP.BISExtIssRecordService_BatchExtIssRecord", out err);
            if (retStr.Split('^')[0] != "1")
            {
    
                res = new Result(false, Result.ERROR_CODE, "发血失败：" + retStr + "！" + err);
                return Helper.Object2Json(res);
            }
            UpImageFile(retStr.Split('^')[1], ExtRecordNo, ftpPath, ExtInstitution, files);
            res = new Result(true, Result.SUCCESS_CODE, "发血成功");
            return Helper.Object2Json(res);
        }
    
        /// <summary>
        /// 上传图片文件
        /// </summary>
        /// <returns></returns>
        public string UpImageFile(string IssueRecordDR,string ExtRecordNo,string ftpPath,string ExtInstitution, List<LIS.Core.MultiPlatform.FileCollection> files)
        {
            //LIS.Model.Entity.BDIssueRecord IssueRecord= EntityManager.GetById<LIS.Model.Entity.BDIssueRecord>(IssueRecordDR);
            //string IssueRecordCode = IssueRecord.RecordNo;
            string retVal = "";
            //string fileFullName = "";
            //if (ftpPath == "")
            //{
            //    fileFullName = files[0].FileName;
            //}
            //else
            //{
            //    fileFullName = ftpPath;
            //}
            //if (files.Count > 0 || ftpPath != "")
            //{
            //    Hashtable hs = new Hashtable();
            //    hs.Add("Code", "BISReportImageFTP");
            //    hs.Add("ParaType", "HOS");
            //    //获得ftp配置参数
            //    List<LIS.Model.Entity.SYSParameter> ftps = EntityManager.FindAll<LIS.Model.Entity.SYSParameter>(hs);
            //    if (ftps.Count > 0)
            //    {
    
            //        string newName = DateTime.Now.ToString("yyMMddhhmmssffff") + "-" + IssueRecordCode + "-" + this.UserLogin.UserDR + fileFullName.Substring(fileFullName.LastIndexOf('.')); ;
            //        string reAddr = "/BISImage/";
            //        if (ftps[0].ParaValue[ftps[0].ParaValue.Length - 1] == '/')
            //        {
            //            reAddr = "BISImage/";
            //        }
            //        //创建目录
            //        // MakeDir(ftps[0].ParaValue + reAddr);
            //        LIS.File.Core.FileService fileService = new LIS.File.Core.FileService();
            //        if (ftpPath == "")
            //        {
            //            //上传图片到ftp
            //            fileService.Upload(ftps[0].ParaValue, files[0].InputStream, newName, reAddr);
            //            //Upload(ftps[0].ParaValue + reAddr, files[0].InputStream, newName);
            //        }
            //        else
            //        {
            //            // ReName(ftpPath, "../LISImage/" + newName);
    
            //            fileService.ReName(ftps[0].ParaValue, ftpPath.Substring(ftpPath.LastIndexOf("/") + 1), newName, reAddr);
            //            fileService.Move(ftpPath, ftps[0].ParaValue + reAddr + newName);
            //        }
            //        //保存图片数据
            //        LIS.Model.Entity.BDArchiveFile repImage = new LIS.Model.Entity.BDArchiveFile();
            //        repImage.RecordNo= IssueRecordCode;
            //        repImage.RecordType = "ISS";
            //        repImage.FileSource = "OUT";
            //        repImage.FileType = fileFullName.Substring(fileFullName.LastIndexOf('.')+1);
            //        repImage.ExtRecordNo = IssueRecordCode;
            //        repImage.ExtRecordNo = ExtRecordNo;
            //        repImage.ExtInstitution = ExtInstitution;
            //        repImage.FileName = reAddr + newName;
            //        repImage.LocationID =Convert.ToInt32(this.UserLogin.WorkGroupDR);
            //        repImage.AddDate=Convert.ToInt32(DateTime.Now.ToString("yyyyMMdd")); ;
            //        repImage.AddTime = Convert.ToInt32(System.DateTime.Now.TimeOfDay.TotalSeconds);
            //        repImage.AddUserDR = Convert.ToInt32(this.UserLogin.UserDR);
            //        string key = "";
            //        EntityManager.Save< LIS.Model.Entity.BDArchiveFile>(repImage, out key, out retVal);
            //    }
            //    else
            //    {
            //        retVal = "没有配置编码为BISReportImageFTP，级别为HOS的FTP参数！";
            //    }
            //}
            //if (retVal != "")  return retVal;
    
            retVal = "1";
            return retVal;
        }
    
        public string DelXMPlanHistory()
        {
            int RowID = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"RowID"), 0);
            int ret= DalManager.Delete<BDXMPlanHistory>(RowID);
            Result res =null;
            if (ret > 0)
            {
               res = new Result(true, Result.SUCCESS_CODE, "删除成功：");
                return Helper.Object2Json(res);
            }
            res = new Result(false, Result.ERROR_CODE, "删除失败：");
            return Helper.Object2Json(res);
    
        }
		 public string QueryMode()
        {
           // string packDRs = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"packDRs")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"packDRs");
           // string ReqformDR = string.IsNullOrEmpty(LIS.Core.MultiPlatform.LISContext.GetRequest(Request, "ReqformDR")) ? "" : LIS.Core.MultiPlatform.LISContext.GetRequest(Request, "ReqformDR");
            int rowCount;
            Param15Dto Param = new Param15Dto();
            Param.P0 = "13";
           // Param.P1 = ReqformDR;
            string className = "BLDSP.SYSBBRemark";
            string funcName = "QueryBBRemark";
            string logInfo = this.UserLogin.UserDR + "^" + this.UserLogin.WorkGroupDR + "^" + this.UserLogin.LocationDR + "^" + this.UserLogin.GroupDR + "^" + this.UserLogin.HospitalDR;
            string strJSON = "";
            string err = "";
            try
            {
                strJSON = DalManager.GetDataJSON(className, funcName, Param, logInfo, true, out rowCount, out err);
            }
            catch (Exception ex)
            {
                err = ex.Message;
            }
    
            return strJSON;
        }
		
		public string QryIssuePack()
        {

            string AdmNo = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request, "AdmNo"), "");
            string ReqFormDR = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request, "ReqFormDR"), "");
            string RegNo = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request, "RegNo"), "");
            Param15Dto param = new Param15Dto();
            param.P0 = ReqFormDR;
            param.P1 = AdmNo;
            param.P2 = RegNo;
            string logInfo = this.UserLogin.UserDR + "^" + this.UserLogin.WorkGroupDR + "^" + this.UserLogin.LocationDR + "^" + this.UserLogin.GroupDR + "^" + this.UserLogin.HospitalDR;

            int rowCount;
            string className = "BLD.WS.BLL.DHCBDXMTest";
            string funcName = "QryIssuePack";
            // string logInfo = this.UserSession.UserDR + "^" + this.UserSession.WorkGroupDR + "^" + this.UserSession.LocationDR + "^" + this.UserSession.GroupDR + "^" + this.UserSession.HospitalDR;
            string strJSON = "";
            string err = "";
            try
            {
                strJSON = DalManager.GetDataJSON(className, funcName, param, logInfo, true, out rowCount, out err);

            }
            catch (Exception ex)
            {
                err = ex.Message;
            }

            return strJSON;
        }
		
		/// <summary>
        /// 查询基础数据
        /// </summary>
        /// <returns></returns>
        public string QryBBTable()
        {
	        string ActiveFlag = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"ActiveFlag"), "");
	        string funcName = Helper.ValidParam(LIS.Core.MultiPlatform.LISContext.GetRequest(Request,"funcName"), "");
            string className = "BLD.Common.Dict";
            string logInfo = this.UserSession.UserDR + "^" + this.UserSession.WorkGroupDR + "^" + this.UserSession.LocationDR + "^" + this.UserSession.GroupDR + "^" + this.UserSession.HospitalDR;
            int rowCount;
            Param15Dto Param = new Param15Dto();
            Param.P0 = ActiveFlag;
            
            string strJSON = "";
            string err = "";
            try
            {
                strJSON = DalManager.GetDataJSON(className, funcName, Param, logInfo, true, out rowCount, out err);
            }
            catch (Exception ex)
            {
                err = ex.Message;
            }
        
            return strJSON;
        }
    
    }
}
