Class ApacheII.Model.Assessment Extends %Persistent [ DdlAllowed ]
{

/*
  Apache II 评分评估记录表 — 持久化类
  ============================================
  导入: 管理门户 → Classes → Import
  编译: do $system.OBJ.Compile("ApacheII.Model.Assessment","ck")
*/

// ===== 患者信息 =====
/// 患者姓名
Property PatientName  As %String(MAXLEN = 50);
/// 住院号
Property AdmissionNo  As %String(MAXLEN = 30);
/// 床号
Property BedNo        As %String(MAXLEN = 20);

/// 评估日期
Property AssessmentDate As %Date [ Required ];

// ===== 12 项生理指标 =====

/// 体温 (℃)
Property Temperature      As %Double;
/// 体温评分
Property TempScore        As %SmallInt;

/// 平均动脉压 (mmHg)
Property MAP              As %Double;
/// 平均动脉压评分
Property MAPScore         As %SmallInt;

/// 心率 (/min)
Property HeartRate        As %Double;
/// 心率评分
Property HRScore          As %SmallInt;

/// 呼吸频率 (/min)
Property RespiratoryRate  As %Double;
/// 呼吸频率评分
Property RRScore          As %SmallInt;

/// 氧合模式 (FiO2<0.5 或 FiO2>=0.5)
Property FiO2Mode         As %String(MAXLEN = 10);
/// PaO2 (mmHg)
Property PaO2             As %Double;
/// (A-a)DO2 (mmHg)
Property AaDO2            As %Double;
/// 氧合评分
Property OxyScore         As %SmallInt;

/// 动脉血 pH
Property ArterialpH       As %Double;
/// 动脉血 pH 评分
Property pHScore          As %SmallInt;

/// 血清钠 (mmol/L)
Property SerumSodium      As %Double;
/// 血清钠评分
Property SodiumScore      As %SmallInt;

/// 血清钾 (mmol/L)
Property SerumPotassium   As %Double;
/// 血清钾评分
Property PotassiumScore   As %SmallInt;

/// 血清肌酐 (mg/dL)
Property SerumCreatinine  As %Double;
/// 血清肌酐评分
Property CreatinineScore  As %SmallInt;
/// 急性肾功能衰竭 (Y/N)
Property AcuteRenalFailure As %String(MAXLEN = 1) [ InitialExpression = "N" ];

/// 红细胞比容 (%)
Property Hematocrit       As %Double;
/// 红细胞比容评分
Property HCTScore         As %SmallInt;

/// 白细胞计数 (x10^3/mm^3)
Property WBC              As %Double;
/// 白细胞计数评分
Property WBCScore         As %SmallInt;

/// GCS 昏迷评分 (3-15)
Property GCS              As %SmallInt;
/// GCS 评分
Property GCSScore         As %SmallInt;

// ===== 年龄 & 慢性健康 =====
/// 年龄分组
Property AgeGroup         As %String(MAXLEN = 20);
/// 年龄评分
Property AgeScore         As %SmallInt;

/// 慢性健康状态
Property ChronicHealth    As %String(MAXLEN = 30);
/// 慢性健康评分
Property ChronicScore     As %SmallInt;

// ===== 汇总 =====
/// Apache II 总分 (0-71)
Property TotalScore        As %SmallInt;
/// 预估死亡率 (%)
Property MortalityEstimate As %SmallInt;

/// 创建时间
Property CreatedAt As %TimeStamp [ InitialExpression = {$zdatetime($ztimestamp,3,1,3)} ];

// ===== 索引 =====
Index DateIdx   On AssessmentDate;
Index ScoreIdx  On TotalScore;
Index PatIdx    On PatientName;
Index AdmIdx    On AdmissionNo;

Storage Default
{
<Data name="AssessmentDefaultData">
<Value name="1"><Value>%%CLASSNAME</Value></Value>
<Value name="2"><Value>PatientName</Value></Value>
<Value name="3"><Value>AdmissionNo</Value></Value>
<Value name="4"><Value>BedNo</Value></Value>
<Value name="5"><Value>AssessmentDate</Value></Value>
<Value name="6"><Value>Temperature</Value></Value>
<Value name="7"><Value>TempScore</Value></Value>
<Value name="8"><Value>MAP</Value></Value>
<Value name="9"><Value>MAPScore</Value></Value>
<Value name="10"><Value>HeartRate</Value></Value>
<Value name="11"><Value>HRScore</Value></Value>
<Value name="12"><Value>RespiratoryRate</Value></Value>
<Value name="13"><Value>RRScore</Value></Value>
<Value name="14"><Value>FiO2Mode</Value></Value>
<Value name="15"><Value>PaO2</Value></Value>
<Value name="16"><Value>AaDO2</Value></Value>
<Value name="17"><Value>OxyScore</Value></Value>
<Value name="18"><Value>ArterialpH</Value></Value>
<Value name="19"><Value>pHScore</Value></Value>
<Value name="20"><Value>SerumSodium</Value></Value>
<Value name="21"><Value>SodiumScore</Value></Value>
<Value name="22"><Value>SerumPotassium</Value></Value>
<Value name="23"><Value>PotassiumScore</Value></Value>
<Value name="24"><Value>SerumCreatinine</Value></Value>
<Value name="25"><Value>CreatinineScore</Value></Value>
<Value name="26"><Value>AcuteRenalFailure</Value></Value>
<Value name="27"><Value>Hematocrit</Value></Value>
<Value name="28"><Value>HCTScore</Value></Value>
<Value name="29"><Value>WBC</Value></Value>
<Value name="30"><Value>WBCScore</Value></Value>
<Value name="31"><Value>GCS</Value></Value>
<Value name="32"><Value>GCSScore</Value></Value>
<Value name="33"><Value>AgeGroup</Value></Value>
<Value name="34"><Value>AgeScore</Value></Value>
<Value name="35"><Value>ChronicHealth</Value></Value>
<Value name="36"><Value>ChronicScore</Value></Value>
<Value name="37"><Value>TotalScore</Value></Value>
<Value name="38"><Value>MortalityEstimate</Value></Value>
<Value name="39"><Value>CreatedAt</Value></Value>
</Data>
<DataLocation>^ApacheII.Model.AssessmentD</DataLocation>
<DefaultData>AssessmentDefaultData</DefaultData>
<IdLocation>^ApacheII.Model.AssessmentD</IdLocation>
<IndexLocation>^ApacheII.Model.AssessmentI</IndexLocation>
<StreamLocation>^ApacheII.Model.AssessmentS</StreamLocation>
<Type>%Storage.Persistent</Type>
}

}