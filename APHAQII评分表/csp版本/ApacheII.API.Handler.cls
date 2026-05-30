Class ApacheII.API.Handler Extends %CSP.REST
{

/*
  Apache II 评分 REST API — M/ObjectScript 原生实现
  =====================================================
  Web Application 配置：
    管理门户 → System Administration → Security → Applications → Web Applications
    新建 /api/apache2 → Dispatch Class: ApacheII.API.Handler → 启用 REST + CORS

  接口：
    POST /api/apache2/save     — 保存评估记录（含患者信息）
    GET  /api/apache2/records  — 查询所有记录
    GET  /api/apache2/health   — 健康检查
*/

Parameter HandleCorsRequest = 1;

XData UrlMap [ XMLNamespace = "http://www.intersystems.com/urlmap" ]
{
<Routes>
  <Route Url="/save"    Method="POST"  Call="SaveAssessment"  Cors="true" />
  <Route Url="/records" Method="GET"   Call="ListRecords"     Cors="true" />
  <Route Url="/health"  Method="GET"   Call="HealthCheck"     Cors="true" />
</Routes>
}

// ===== 健康检查 =====
ClassMethod HealthCheck() As %Status
{
  Set %response.ContentType = "application/json; charset=UTF-8"
  Set %response.CharSet    = "UTF-8"
  Set obj = {
    "status":       "ok",
    "iris_version": ($zv),
    "namespace":    ($namespace),
    "time":         ($zdatetime($ztimestamp,3,1,3))
  }
  Write obj.%ToJSON()
  Quit $$$OK
}

// ===== 保存评估记录 =====
ClassMethod SaveAssessment() As %Status
{
  Set %response.ContentType = "application/json; charset=UTF-8"
  Set %response.CharSet    = "UTF-8"

  Set raw  = %request.Content.Read()
  Set data = {}.%FromJSON(raw)

  If '$isobject(data) {
    Set %response.Status = 400
    Write {"success": false, "message": "请求体为空或 JSON 格式错误"}.%ToJSON()
    Quit $$$OK
  }

  // 必填字段校验 — 使用 %Get() 替代点号访问，避免 <UNDEFINED>
  Set assessDate = data.%Get("assessment_date", "")
  If assessDate = "" {
    Set %response.Status = 400
    Write {"success": false, "message": "缺少评估日期"}.%ToJSON()
    Quit $$$OK
  }

  Set patientName = data.%Get("patient_name", "")
  If patientName = "" {
    Set %response.Status = 400
    Write {"success": false, "message": "缺少患者姓名"}.%ToJSON()
    Quit $$$OK
  }

  // 创建持久化对象
  Set rec = ##class(ApacheII.Model.Assessment).%New()

  // —— 患者信息 ——
  Set rec.PatientName     = $zcvt(data.%Get("patient_name",""),"I","UTF8")
  Set rec.AdmissionNo     = $zcvt(data.%Get("admission_no",""),"I","UTF8")
  Set rec.BedNo           = $zcvt(data.%Get("bed_no",""),"I","UTF8")
  Set rec.AssessmentDate  = $zdateh(assessDate, 3)

  // —— 12 项生理指标 ——
  If data.%IsDefined("temperature")       { Set rec.Temperature       = data.%Get("temperature") }
  If data.%IsDefined("temp_score")        { Set rec.TempScore         = data.%Get("temp_score") }
  If data.%IsDefined("map")               { Set rec.MAP               = data.%Get("map") }
  If data.%IsDefined("map_score")         { Set rec.MAPScore          = data.%Get("map_score") }
  If data.%IsDefined("heart_rate")        { Set rec.HeartRate         = data.%Get("heart_rate") }
  If data.%IsDefined("hr_score")          { Set rec.HRScore           = data.%Get("hr_score") }
  If data.%IsDefined("respiratory_rate")  { Set rec.RespiratoryRate   = data.%Get("respiratory_rate") }
  If data.%IsDefined("rr_score")          { Set rec.RRScore           = data.%Get("rr_score") }
  If data.%IsDefined("fio2_mode")         { Set rec.FiO2Mode          = data.%Get("fio2_mode") }
  If data.%IsDefined("pao2")              { Set rec.PaO2              = data.%Get("pao2") }
  If data.%IsDefined("aado2")             { Set rec.AaDO2             = data.%Get("aado2") }
  If data.%IsDefined("oxy_score")         { Set rec.OxyScore          = data.%Get("oxy_score") }
  If data.%IsDefined("arterial_ph")       { Set rec.ArterialpH        = data.%Get("arterial_ph") }
  If data.%IsDefined("ph_score")          { Set rec.pHScore           = data.%Get("ph_score") }
  If data.%IsDefined("serum_sodium")      { Set rec.SerumSodium       = data.%Get("serum_sodium") }
  If data.%IsDefined("sodium_score")      { Set rec.SodiumScore       = data.%Get("sodium_score") }
  If data.%IsDefined("serum_potassium")   { Set rec.SerumPotassium    = data.%Get("serum_potassium") }
  If data.%IsDefined("potassium_score")   { Set rec.PotassiumScore    = data.%Get("potassium_score") }
  If data.%IsDefined("serum_creatinine")  { Set rec.SerumCreatinine   = data.%Get("serum_creatinine") }
  If data.%IsDefined("creatinine_score")  { Set rec.CreatinineScore   = data.%Get("creatinine_score") }
  If data.%IsDefined("acute_renal_failure") { Set rec.AcuteRenalFailure = data.%Get("acute_renal_failure") }
  If data.%IsDefined("hematocrit")        { Set rec.Hematocrit        = data.%Get("hematocrit") }
  If data.%IsDefined("hct_score")         { Set rec.HCTScore          = data.%Get("hct_score") }
  If data.%IsDefined("wbc")               { Set rec.WBC               = data.%Get("wbc") }
  If data.%IsDefined("wbc_score")         { Set rec.WBCScore          = data.%Get("wbc_score") }
  If data.%IsDefined("gcs")               { Set rec.GCS               = data.%Get("gcs") }
  If data.%IsDefined("gcs_score")         { Set rec.GCSScore          = data.%Get("gcs_score") }

  // —— 年龄 & 慢性健康 ——
  If data.%IsDefined("age_group")         { Set rec.AgeGroup          = $zcvt(data.%Get("age_group"),"I","UTF8") }
  If data.%IsDefined("age_score")         { Set rec.AgeScore          = data.%Get("age_score") }
  If data.%IsDefined("chronic_health")    { Set rec.ChronicHealth     = $zcvt(data.%Get("chronic_health"),"I","UTF8") }
  If data.%IsDefined("chronic_score")     { Set rec.ChronicScore      = data.%Get("chronic_score") }

  // —— 汇总 ——
  If data.%IsDefined("total_score")       { Set rec.TotalScore        = data.%Get("total_score") }
  If data.%IsDefined("mortality_estimate") { Set rec.MortalityEstimate = data.%Get("mortality_estimate") }

  // 保存到 IRIS 数据库
  Set sc = rec.%Save()
  If $$$ISERR(sc) {
    Set %response.Status = 500
    Set msg = $system.Status.GetErrorText(sc)
    Write {"success": false, "message": ("保存失败: "_msg)}.%ToJSON()
    Quit $$$OK
  }

  Set id    = rec.%Id()
  Set score = rec.TotalScore
  Write {
    "success":    true,
    "message":    ("已保存 — 患者: "_rec.PatientName_" | 总分: "_score_" | ID: "_id),
    "record_id":  (id)
  }.%ToJSON()

  Quit $$$OK
}

// ===== 查询记录列表 =====
ClassMethod ListRecords() As %Status
{
  Set %response.ContentType = "application/json; charset=UTF-8"
  Set %response.CharSet    = "UTF-8"

  Set sql = "SELECT ID, PatientName, AdmissionNo, BedNo, "
          _ "AssessmentDate, TotalScore, MortalityEstimate, CreatedAt "
          _ "FROM ApacheII_Model.Assessment "
          _ "ORDER BY AssessmentDate DESC, ID DESC"

  Set rs = ##class(%SQL.Statement).%ExecDirect(, sql)
  If rs.%SQLCODE < 0 {
    Set %response.Status = 500
    Write {"success": false, "message": ("查询失败: "_rs.%Message)}.%ToJSON()
    Quit $$$OK
  }

  Set list = []
  While rs.%Next() {
    Set item = {
      "id":           (rs.%Get("ID")),
      "patient_name": (rs.%Get("PatientName")),
      "admission_no": (rs.%Get("AdmissionNo")),
      "bed_no":       (rs.%Get("BedNo")),
      "date":         ($zdate(rs.%Get("AssessmentDate"), 3)),
      "total_score":  (rs.%Get("TotalScore")),
      "mortality":    (rs.%Get("MortalityEstimate")),
      "created_at":   (rs.%Get("CreatedAt"))
    }
    Do list.%Push(item)
  }

  Write {
    "success": true,
    "count":   (list.%Size()),
    "records": (list)
  }.%ToJSON()

  Quit $$$OK
}

// ===== CORS 预检 =====
ClassMethod OnPreHTTP() As %Boolean [ ServerOnly = 1 ]
{
  If $get(%request.CgiEnvs("REQUEST_METHOD")) = "OPTIONS" {
    Set %response.Status = 200
    Do %response.SetHeader("Access-Control-Allow-Origin", "*")
    Do %response.SetHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    Do %response.SetHeader("Access-Control-Allow-Headers", "Content-Type")
    Quit 0
  }
  Quit 1
}

}
