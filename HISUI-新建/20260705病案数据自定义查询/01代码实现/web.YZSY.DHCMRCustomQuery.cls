Class web.YZSY.DHCMRCustomQuery Extends %RegisteredObject
{

///w ##class(web.YZSY.DHCMRCustomQuery).GetFieldMeta()
ClassMethod GetFieldMeta() As %String [ Language = objectscript ]
{
    s json = "["
    s json = json _ "{""field"":""MR_ADM"",""title"":""就诊号"",""type"":""String"",""piece"":6,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_BAFX"",""title"":""病案分型"",""type"":""String"",""piece"":291,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_BAH"",""title"":""病案号"",""type"":""String"",""piece"":4,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_BAZL"",""title"":""病案质量"",""type"":""String"",""piece"":277,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_BDBLZPF"",""title"":""白蛋白类制品费"",""type"":""Number"",""piece"":253,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_BLH"",""title"":""病理号"",""type"":""String"",""piece"":263,""group"":""其他""},"
    s json = json _ "{""field"":""MR_BLZD"",""title"":""病理诊断"",""type"":""String"",""piece"":261,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_BLZDBM"",""title"":""病理诊断编码"",""type"":""String"",""piece"":262,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_BLZDF"",""title"":""病理诊断费"",""type"":""Number"",""piece"":237,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_BMY"",""title"":""编码员"",""type"":""String"",""piece"":276,""group"":""其他""},"
    s json = json _ "{""field"":""MR_BYXJC"",""title"":""病原学检查"",""type"":""String"",""piece"":333,""group"":""其他""},"
    s json = json _ "{""field"":""MR_BZZSNN"",""title"":""（年龄不足一周岁）年龄"",""type"":""String"",""piece"":13,""group"":""基本信息""},"
    s json = json _ "{""field"":""MR_CFCS"",""title"":""产妇产伤"",""type"":""String"",""piece"":328,""group"":""不良事件""},"
    s json = json _ "{""field"":""MR_CSD"",""title"":""出生地"",""type"":""String"",""piece"":16,""group"":""基本信息""},"
    s json = json _ "{""field"":""MR_CSRQ"",""title"":""出生日期"",""type"":""Date"",""piece"":10,""group"":""基本信息""},"
    s json = json _ "{""field"":""MR_CYBF"",""title"":""病房"",""type"":""String"",""piece"":41,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_CYKB"",""title"":""出院科别"",""type"":""CTLoc"",""piece"":40,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_CYQTZD1"",""title"":""出院其他诊断1"",""type"":""String"",""piece"":56,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZD10"",""title"":""出院其他诊断10"",""type"":""String"",""piece"":92,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZD11"",""title"":""出院其他诊断11"",""type"":""String"",""piece"":96,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZD12"",""title"":""出院其他诊断12"",""type"":""String"",""piece"":100,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZD13"",""title"":""出院其他诊断13"",""type"":""String"",""piece"":104,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZD14"",""title"":""出院其他诊断14"",""type"":""String"",""piece"":108,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZD15"",""title"":""出院其他诊断15"",""type"":""String"",""piece"":112,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZD2"",""title"":""出院其他诊断2"",""type"":""String"",""piece"":60,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZD3"",""title"":""出院其他诊断3"",""type"":""String"",""piece"":64,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZD4"",""title"":""出院其他诊断4"",""type"":""String"",""piece"":68,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZD5"",""title"":""出院其他诊断5"",""type"":""String"",""piece"":72,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZD6"",""title"":""出院其他诊断6"",""type"":""String"",""piece"":76,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZD7"",""title"":""出院其他诊断7"",""type"":""String"",""piece"":80,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZD8"",""title"":""出院其他诊断8"",""type"":""String"",""piece"":84,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZD9"",""title"":""出院其他诊断9"",""type"":""String"",""piece"":88,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDMC1"",""title"":""出院其他诊断名称1"",""type"":""String"",""piece"":57,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDMC10"",""title"":""出院其他诊断名称10"",""type"":""String"",""piece"":93,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDMC11"",""title"":""出院其他诊断名称11"",""type"":""String"",""piece"":97,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDMC12"",""title"":""出院其他诊断名称12"",""type"":""String"",""piece"":101,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDMC13"",""title"":""出院其他诊断名称13"",""type"":""String"",""piece"":105,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDMC14"",""title"":""出院其他诊断名称14"",""type"":""String"",""piece"":109,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDMC15"",""title"":""出院其他诊断名称15"",""type"":""String"",""piece"":113,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDMC2"",""title"":""出院其他诊断名称2"",""type"":""String"",""piece"":61,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDMC3"",""title"":""出院其他诊断名称3"",""type"":""String"",""piece"":65,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDMC4"",""title"":""出院其他诊断名称4"",""type"":""String"",""piece"":69,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDMC5"",""title"":""出院其他诊断名称5"",""type"":""String"",""piece"":73,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDMC6"",""title"":""出院其他诊断名称6"",""type"":""String"",""piece"":77,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDMC7"",""title"":""出院其他诊断名称7"",""type"":""String"",""piece"":81,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDMC8"",""title"":""出院其他诊断名称8"",""type"":""String"",""piece"":85,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDMC9"",""title"":""出院其他诊断名称9"",""type"":""String"",""piece"":89,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDRYBQ1"",""title"":""出院其他诊断入院病情1"",""type"":""String"",""piece"":58,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDRYBQ10"",""title"":""出院其他诊断入院病情10"",""type"":""String"",""piece"":94,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDRYBQ11"",""title"":""出院其他诊断入院病情11"",""type"":""String"",""piece"":98,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDRYBQ12"",""title"":""出院其他诊断入院病情12"",""type"":""String"",""piece"":102,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDRYBQ13"",""title"":""出院其他诊断入院病情13"",""type"":""String"",""piece"":106,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDRYBQ14"",""title"":""出院其他诊断入院病情14"",""type"":""String"",""piece"":110,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDRYBQ15"",""title"":""出院其他诊断入院病情15"",""type"":""String"",""piece"":114,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDRYBQ2"",""title"":""出院其他诊断入院病情2"",""type"":""String"",""piece"":62,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDRYBQ3"",""title"":""出院其他诊断入院病情3"",""type"":""String"",""piece"":66,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDRYBQ4"",""title"":""出院其他诊断入院病情4"",""type"":""String"",""piece"":70,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDRYBQ5"",""title"":""出院其他诊断入院病情5"",""type"":""String"",""piece"":74,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDRYBQ6"",""title"":""出院其他诊断入院病情6"",""type"":""String"",""piece"":78,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDRYBQ7"",""title"":""出院其他诊断入院病情7"",""type"":""String"",""piece"":82,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDRYBQ8"",""title"":""出院其他诊断入院病情8"",""type"":""String"",""piece"":86,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDRYBQ9"",""title"":""出院其他诊断入院病情9"",""type"":""String"",""piece"":90,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDZLJG10"",""title"":""出院其他诊断治疗结果10"",""type"":""String"",""piece"":95,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDZLJG11"",""title"":""出院其他诊断治疗结果11"",""type"":""String"",""piece"":99,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDZLJG12"",""title"":""出院其他诊断治疗结果12"",""type"":""String"",""piece"":103,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDZLJG13"",""title"":""出院其他诊断治疗结果13"",""type"":""String"",""piece"":107,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDZLJG14"",""title"":""出院其他诊断治疗结果14"",""type"":""String"",""piece"":111,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDZLJG15"",""title"":""出院其他诊断治疗结果15"",""type"":""String"",""piece"":115,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDZLJG2"",""title"":""出院其他诊断治疗结果2"",""type"":""String"",""piece"":63,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDZLJG3"",""title"":""出院其他诊断治疗结果3"",""type"":""String"",""piece"":67,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDZLJG4"",""title"":""出院其他诊断治疗结果4"",""type"":""String"",""piece"":71,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDZLJG6"",""title"":""出院其他诊断治疗结果6"",""type"":""String"",""piece"":79,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDZLJG7"",""title"":""出院其他诊断治疗结果7"",""type"":""String"",""piece"":83,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDZLJG8"",""title"":""出院其他诊断治疗结果8"",""type"":""String"",""piece"":87,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYQTZDZLJG9"",""title"":""出院其他诊断治疗结果9"",""type"":""String"",""piece"":91,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYRQ"",""title"":""出院日期"",""type"":""Date"",""piece"":39,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_CYZYZD"",""title"":""出院主要诊断"",""type"":""String"",""piece"":52,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYZYZDMC"",""title"":""出院主要诊断名称"",""type"":""String"",""piece"":53,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYZYZDRYBQ"",""title"":""出院主要诊断入院病情"",""type"":""String"",""piece"":54,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_CYZYZDZLJG"",""title"":""出院主要诊断治疗结果"",""type"":""String"",""piece"":55,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_EJHLTS"",""title"":""二级护理天数"",""type"":""Number"",""piece"":319,""group"":""护理信息""},"
    s json = json _ "{""field"":""MR_FEXZLSQSHZDFH"",""title"":""肺恶性肿瘤手术前诊断与术后病理诊断是否符合"",""type"":""String"",""piece"":347,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_FSBLZDFHQK"",""title"":""放射与病理诊断符合情况"",""type"":""String"",""piece"":343,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_FSSZLXMF"",""title"":""非手术治疗项目费"",""type"":""Number"",""piece"":241,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_GEXZLSQSHZDFH"",""title"":""肝恶性肿瘤手术前诊断与术后病理诊断是否符合"",""type"":""String"",""piece"":346,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_GJ"",""title"":""国籍"",""type"":""String"",""piece"":12,""group"":""基本信息""},"
    s json = json _ "{""field"":""MR_GZDWDH"",""title"":""电话"",""type"":""String"",""piece"":28,""group"":""基本信息""},"
    s json = json _ "{""field"":""MR_GZDWDZ"",""title"":""工作单位地址"",""type"":""String"",""piece"":27,""group"":""基本信息""},"
    s json = json _ "{""field"":""MR_GZDWYB"",""title"":""邮编"",""type"":""String"",""piece"":29,""group"":""基本信息""},"
    s json = json _ "{""field"":""MR_HKDZ"",""title"":""户口地址"",""type"":""String"",""piece"":25,""group"":""基本信息""},"
    s json = json _ "{""field"":""MR_HKYB"",""title"":""邮编"",""type"":""String"",""piece"":26,""group"":""基本信息""},"
    s json = json _ "{""field"":""MR_HLF"",""title"":""护理费"",""type"":""Number"",""piece"":235,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_HXB"",""title"":""红细胞"",""type"":""String"",""piece"":306,""group"":""其他""},"
    s json = json _ "{""field"":""MR_HY"",""title"":""婚姻"",""type"":""String"",""piece"":21,""group"":""基本信息""},"
    s json = json _ "{""field"":""MR_JCEXZLSQSHZDFH"",""title"":""结肠恶性肿瘤手术前诊断与术后病理诊断是否符合"",""type"":""String"",""piece"":350,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_JCYYCXYYCLF"",""title"":""检查用一次性医用材料费"",""type"":""Number"",""piece"":255,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_JG"",""title"":""籍贯"",""type"":""String"",""piece"":17,""group"":""基本信息""},"
    s json = json _ "{""field"":""MR_JHSJRRQSJ"",""title"":""监护室进入日期时间"",""type"":""Date"",""piece"":293,""group"":""护理信息""},"
    s json = json _ "{""field"":""MR_JHSTCRQSJ"",""title"":""监护室退出日期时间"",""type"":""Date"",""piece"":294,""group"":""护理信息""},"
    s json = json _ "{""field"":""MR_JKKH"",""title"":""健康卡号"",""type"":""String"",""piece"":2,""group"":""基本信息""},"
    s json = json _ "{""field"":""MR_JXYS"",""title"":""进修医师"",""type"":""String"",""piece"":274,""group"":""其他""},"
    s json = json _ "{""field"":""MR_KFF"",""title"":""康复费"",""type"":""Number"",""piece"":246,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_KJYWFY"",""title"":""抗菌药物费用"",""type"":""Number"",""piece"":249,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_KZR"",""title"":""科主任"",""type"":""String"",""piece"":269,""group"":""其他""},"
    s json = json _ "{""field"":""MR_LCBLZDFHQK"",""title"":""临床与病理诊断符合情况"",""type"":""String"",""piece"":342,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_LCWLZLF"",""title"":""临床物理治疗费"",""type"":""Number"",""piece"":242,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_LCZDXMF"",""title"":""临床诊断项目费"",""type"":""Number"",""piece"":240,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_LHSYKSSYW"",""title"":""联合使用抗生素药物"",""type"":""String"",""piece"":301,""group"":""其他""},"
    s json = json _ "{""field"":""MR_LNSSRYHHMSJF"",""title"":""颅脑损伤患者入院后昏迷分钟"",""type"":""String"",""piece"":290,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_LNSSRYHHMSJS"",""title"":""颅脑损伤患者入院后昏迷小时"",""type"":""String"",""piece"":289,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_LNSSRYHHMSJT"",""title"":""颅脑损伤患者入院后昏迷天"",""type"":""String"",""piece"":288,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_LNSSRYQHMSJF"",""title"":""颅脑损伤患者入院前昏迷分钟"",""type"":""String"",""piece"":287,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_LNSSRYQHMSJS"",""title"":""颅脑损伤患者入院前昏迷小时"",""type"":""String"",""piece"":286,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_LNSSRYQHMSJT"",""title"":""颅脑损伤患者入院前昏迷天"",""type"":""String"",""piece"":285,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_LXRDH"",""title"":""电话"",""type"":""String"",""piece"":33,""group"":""基本信息""},"
    s json = json _ "{""field"":""MR_LXRDZ"",""title"":""地址"",""type"":""String"",""piece"":32,""group"":""基本信息""},"
    s json = json _ "{""field"":""MR_LXRGX"",""title"":""关系"",""type"":""String"",""piece"":31,""group"":""其他""},"
    s json = json _ "{""field"":""MR_LXRXM"",""title"":""联系人姓名"",""type"":""String"",""piece"":30,""group"":""基本信息""},"
    s json = json _ "{""field"":""MR_LXYZLZPF"",""title"":""凝血因子类制品费"",""type"":""String"",""piece"":351,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_LYFS"",""title"":""离院方式"",""type"":""String"",""piece"":46,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_LYFSYLJSJGMC"",""title"":""医嘱转社区卫生服务机构/乡镇卫生院，接受医疗机构名称"",""type"":""String"",""piece"":47,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_MJZZDJBBM"",""title"":""门（急）诊疾病编码"",""type"":""String"",""piece"":44,""group"":""其他""},"
    s json = json _ "{""field"":""MR_MJZZDMC"",""title"":""门（急）诊诊断名称"",""type"":""String"",""piece"":43,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_MRDate"",""title"":""取数日期"",""type"":""Date"",""piece"":281,""group"":""其他""},"
    s json = json _ "{""field"":""MR_MZ"",""title"":""民族"",""type"":""String"",""piece"":18,""group"":""基本信息""},"
    s json = json _ "{""field"":""MR_MZF"",""title"":""麻醉费"",""type"":""Number"",""piece"":244,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_MZRYZDFHQK"",""title"":""门诊与入院诊断符合情况"",""type"":""String"",""piece"":339,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_NN"",""title"":""年龄"",""type"":""String"",""piece"":11,""group"":""基本信息""},"
    s json = json _ "{""field"":""MR_QDBLZPF"",""title"":""球蛋白类制品费"",""type"":""Number"",""piece"":254,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_QJCGCS"",""title"":""抢救成功次数"",""type"":""String"",""piece"":230,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_QJCS"",""title"":""抢救次数"",""type"":""String"",""piece"":229,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_QTF"",""title"":""其他费"",""type"":""Number"",""piece"":258,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_QTFY"",""title"":""其他费用"",""type"":""Number"",""piece"":236,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_QX"",""title"":""全血"",""type"":""String"",""piece"":309,""group"":""其他""},"
    s json = json _ "{""field"":""MR_RH"",""title"":""RH"",""type"":""String"",""piece"":268,""group"":""其他""},"
    s json = json _ "{""field"":""MR_RYBF"",""title"":""病房"",""type"":""String"",""piece"":37,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_RYBQ"",""title"":""入院病情"",""type"":""String"",""piece"":45,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_RYCYZDFHQK"",""title"":""入院与出院诊断符合情况"",""type"":""String"",""piece"":340,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_RYHQZRQ"",""title"":""入院后确诊日期"",""type"":""Date"",""piece"":51,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_RYKB"",""title"":""入院科别"",""type"":""CTLoc"",""piece"":36,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_RYRQ"",""title"":""入院日期"",""type"":""Date"",""piece"":35,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_RYTJ"",""title"":""入院途径"",""type"":""String"",""piece"":34,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_RYZD"",""title"":""入院诊断"",""type"":""String"",""piece"":48,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_RYZDMC"",""title"":""入院诊断名称"",""type"":""String"",""piece"":49,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_RYZDRYBQ"",""title"":""入院诊断入院病情"",""type"":""String"",""piece"":50,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_SEXZLSQSHZDFH"",""title"":""肾恶性肿瘤手术前诊断与术后病理诊断是否符合"",""type"":""String"",""piece"":345,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SFCFSSS"",""title"":""是否重返手术室"",""type"":""String"",""piece"":324,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SFDBZGL"",""title"":""是否单病种管理"",""type"":""String"",""piece"":295,""group"":""其他""},"
    s json = json _ "{""field"":""MR_SFFDCRB"",""title"":""是否法定传染病"",""type"":""String"",""piece"":303,""group"":""其他""},"
    s json = json _ "{""field"":""MR_SFFSRC"",""title"":""是否发生褥疮"",""type"":""String"",""piece"":310,""group"":""不良事件""},"
    s json = json _ "{""field"":""MR_SFFSYLCC"",""title"":""是否发生医疗差错"",""type"":""String"",""piece"":312,""group"":""不良事件""},"
    s json = json _ "{""field"":""MR_SFFSYLSG"",""title"":""是否发生医疗事故"",""type"":""String"",""piece"":311,""group"":""不良事件""},"
    s json = json _ "{""field"":""MR_SFLHSYKSS"",""title"":""是否联合使用抗生素"",""type"":""String"",""piece"":300,""group"":""其他""},"
    s json = json _ "{""field"":""MR_SFSSDGL"",""title"":""是否实施DRGs管理"",""type"":""String"",""piece"":297,""group"":""其他""},"
    s json = json _ "{""field"":""MR_SFSSLCLJGL"",""title"":""是否实施临床路径管理"",""type"":""String"",""piece"":296,""group"":""其他""},"
    s json = json _ "{""field"":""MR_SFSSZZJH"",""title"":""是否实施重症监护"",""type"":""String"",""piece"":292,""group"":""护理信息""},"
    s json = json _ "{""field"":""MR_SFSX"",""title"":""是否输血"",""type"":""String"",""piece"":322,""group"":""其他""},"
    s json = json _ "{""field"":""MR_SFSY"",""title"":""是否输液"",""type"":""String"",""piece"":325,""group"":""其他""},"
    s json = json _ "{""field"":""MR_SFSYKSS"",""title"":""是否使用抗生素"",""type"":""String"",""piece"":298,""group"":""其他""},"
    s json = json _ "{""field"":""MR_SFSZ"",""title"":""是否随诊"",""type"":""String"",""piece"":313,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_SFTBZZZY"",""title"":""是否同病种再住院"",""type"":""String"",""piece"":284,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_SFXJPYBBSJ"",""title"":""是否细菌培养标本送检"",""type"":""String"",""piece"":302,""group"":""其他""},"
    s json = json _ "{""field"":""MR_SFYNFSDDHZCSJ"",""title"":""是否院内发生跌倒或坠床事件"",""type"":""String"",""piece"":337,""group"":""不良事件""},"
    s json = json _ "{""field"":""MR_SFZH"",""title"":""身份证号"",""type"":""String"",""piece"":19,""group"":""基本信息""},"
    s json = json _ "{""field"":""MR_SHCD"",""title"":""伤害程度"",""type"":""String"",""piece"":338,""group"":""不良事件""},"
    s json = json _ "{""field"":""MR_SJHLTS"",""title"":""三级护理天数"",""type"":""Number"",""piece"":320,""group"":""护理信息""},"
    s json = json _ "{""field"":""MR_SJZYTS"",""title"":""实际住院天数"",""type"":""Number"",""piece"":42,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_SQSHZDFHQK"",""title"":""术前与术后诊断符合情况"",""type"":""String"",""piece"":341,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_SSBDSLBLZDFH"",""title"":""手术冰冻与石蜡病理诊断是否符合"",""type"":""String"",""piece"":344,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSBFZ"",""title"":""手术并发症"",""type"":""String"",""piece"":334,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSBFZMC"",""title"":""手术并发症名称"",""type"":""String"",""piece"":335,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSBM1"",""title"":""手术编码1"",""type"":""String"",""piece"":119,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSBM10"",""title"":""手术编码10"",""type"":""String"",""piece"":218,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSBM2"",""title"":""手术编码2"",""type"":""String"",""piece"":130,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSBM3"",""title"":""手术编码3"",""type"":""String"",""piece"":141,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSBM4"",""title"":""手术编码4"",""type"":""String"",""piece"":152,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSBM5"",""title"":""手术编码5"",""type"":""String"",""piece"":163,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSBM6"",""title"":""手术编码6"",""type"":""String"",""piece"":174,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSBM7"",""title"":""手术编码7"",""type"":""String"",""piece"":185,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSBM8"",""title"":""手术编码8"",""type"":""String"",""piece"":196,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSBM9"",""title"":""手术编码9"",""type"":""String"",""piece"":207,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSCZYS1"",""title"":""手术操作医师1"",""type"":""String"",""piece"":123,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSCZYS10"",""title"":""手术操作医师10"",""type"":""String"",""piece"":222,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSCZYS2"",""title"":""手术操作医师2"",""type"":""String"",""piece"":134,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSCZYS3"",""title"":""手术操作医师3"",""type"":""String"",""piece"":145,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSCZYS4"",""title"":""手术操作医师4"",""type"":""String"",""piece"":156,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSCZYS5"",""title"":""手术操作医师5"",""type"":""String"",""piece"":167,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSCZYS6"",""title"":""手术操作医师6"",""type"":""String"",""piece"":178,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSCZYS7"",""title"":""手术操作医师7"",""type"":""String"",""piece"":189,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSCZYS8"",""title"":""手术操作医师8"",""type"":""String"",""piece"":200,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSCZYS9"",""title"":""手术操作医师9"",""type"":""String"",""piece"":211,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSF"",""title"":""手术费"",""type"":""String"",""piece"":245,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_SSIIZ1"",""title"":""II助1"",""type"":""String"",""piece"":125,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSIIZ10"",""title"":""II助10"",""type"":""String"",""piece"":224,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSIIZ2"",""title"":""II助2"",""type"":""String"",""piece"":136,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSIIZ3"",""title"":""II助3"",""type"":""String"",""piece"":147,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSIIZ4"",""title"":""II助4"",""type"":""String"",""piece"":158,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSIIZ5"",""title"":""II助5"",""type"":""String"",""piece"":169,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSIIZ6"",""title"":""II助6"",""type"":""String"",""piece"":180,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSIIZ7"",""title"":""II助7"",""type"":""String"",""piece"":191,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSIIZ8"",""title"":""II助8"",""type"":""String"",""piece"":202,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSIIZ9"",""title"":""II助9"",""type"":""String"",""piece"":213,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSIZ1"",""title"":""I助1"",""type"":""String"",""piece"":124,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSIZ10"",""title"":""I助10"",""type"":""String"",""piece"":223,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSIZ2"",""title"":""I助2"",""type"":""String"",""piece"":135,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSIZ3"",""title"":""I助3"",""type"":""String"",""piece"":146,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSIZ4"",""title"":""I助4"",""type"":""String"",""piece"":157,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSIZ5"",""title"":""I助5"",""type"":""String"",""piece"":168,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSIZ6"",""title"":""I助6"",""type"":""String"",""piece"":179,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSIZ7"",""title"":""I助7"",""type"":""String"",""piece"":190,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSIZ8"",""title"":""I助8"",""type"":""String"",""piece"":201,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSIZ9"",""title"":""I助9"",""type"":""String"",""piece"":212,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSJB1"",""title"":""手术级别1"",""type"":""String"",""piece"":120,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSJB10"",""title"":""手术级别10"",""type"":""String"",""piece"":219,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSJB2"",""title"":""手术级别2"",""type"":""String"",""piece"":131,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSJB3"",""title"":""手术级别3"",""type"":""String"",""piece"":142,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSJB4"",""title"":""手术级别4"",""type"":""String"",""piece"":153,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSJB5"",""title"":""手术级别5"",""type"":""String"",""piece"":164,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSJB6"",""title"":""手术级别6"",""type"":""String"",""piece"":175,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSJB7"",""title"":""手术级别7"",""type"":""String"",""piece"":186,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSJB8"",""title"":""手术级别8"",""type"":""String"",""piece"":197,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSJB9"",""title"":""手术级别9"",""type"":""String"",""piece"":208,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSMC1"",""title"":""手术名称1"",""type"":""String"",""piece"":122,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSMC10"",""title"":""手术名称10"",""type"":""String"",""piece"":221,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSMC2"",""title"":""手术名称2"",""type"":""String"",""piece"":133,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSMC3"",""title"":""手术名称3"",""type"":""String"",""piece"":144,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSMC4"",""title"":""手术名称4"",""type"":""String"",""piece"":155,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSMC5"",""title"":""手术名称5"",""type"":""String"",""piece"":166,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSMC6"",""title"":""手术名称6"",""type"":""String"",""piece"":177,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSMC7"",""title"":""手术名称7"",""type"":""String"",""piece"":188,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSMC8"",""title"":""手术名称8"",""type"":""String"",""piece"":199,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSMC9"",""title"":""手术名称9"",""type"":""String"",""piece"":210,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSMZFS1"",""title"":""麻醉方式1/麻醉分级1"",""type"":""String"",""piece"":126,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSMZFS10"",""title"":""麻醉方式10/麻醉分级10"",""type"":""String"",""piece"":225,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSMZFS2"",""title"":""麻醉方式2/麻醉分级2"",""type"":""String"",""piece"":137,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSMZFS3"",""title"":""麻醉方式3/麻醉分级3"",""type"":""String"",""piece"":148,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSMZFS4"",""title"":""麻醉方式4/麻醉分级4"",""type"":""String"",""piece"":159,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSMZFS5"",""title"":""麻醉方式5/麻醉分级5"",""type"":""String"",""piece"":170,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSMZFS6"",""title"":""麻醉方式6/麻醉分级6"",""type"":""String"",""piece"":181,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSMZFS7"",""title"":""麻醉方式7/麻醉分级7"",""type"":""String"",""piece"":192,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSMZFS8"",""title"":""麻醉方式8/麻醉分级8"",""type"":""String"",""piece"":203,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSMZFS9"",""title"":""麻醉方式9/麻醉分级9"",""type"":""String"",""piece"":214,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSMZYS1"",""title"":""麻醉医师1"",""type"":""String"",""piece"":128,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSMZYS10"",""title"":""麻醉医师10"",""type"":""String"",""piece"":227,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSMZYS2"",""title"":""麻醉医师2"",""type"":""String"",""piece"":139,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSMZYS3"",""title"":""麻醉医师3"",""type"":""String"",""piece"":150,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSMZYS4"",""title"":""麻醉医师4"",""type"":""String"",""piece"":161,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSMZYS5"",""title"":""麻醉医师5"",""type"":""String"",""piece"":172,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSMZYS6"",""title"":""麻醉医师6"",""type"":""String"",""piece"":183,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSMZYS7"",""title"":""麻醉医师7"",""type"":""String"",""piece"":194,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSMZYS8"",""title"":""麻醉医师8"",""type"":""String"",""piece"":205,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSMZYS9"",""title"":""麻醉医师9"",""type"":""String"",""piece"":216,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSQKYHDJ1"",""title"":""切口愈合等级1"",""type"":""String"",""piece"":127,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSQKYHDJ10"",""title"":""切口愈合等级10"",""type"":""String"",""piece"":226,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSQKYHDJ2"",""title"":""切口愈合等级2"",""type"":""String"",""piece"":138,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSQKYHDJ3"",""title"":""切口愈合等级3"",""type"":""String"",""piece"":149,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSQKYHDJ4"",""title"":""切口愈合等级4"",""type"":""String"",""piece"":160,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSQKYHDJ5"",""title"":""切口愈合等级5"",""type"":""String"",""piece"":171,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSQKYHDJ6"",""title"":""切口愈合等级6"",""type"":""String"",""piece"":182,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSQKYHDJ7"",""title"":""切口愈合等级7"",""type"":""String"",""piece"":193,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSQKYHDJ8"",""title"":""切口愈合等级8"",""type"":""String"",""piece"":204,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSQKYHDJ9"",""title"":""切口愈合等级9"",""type"":""String"",""piece"":215,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSRQ1"",""title"":""手术日期1"",""type"":""Date"",""piece"":121,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSRQ10"",""title"":""手术日期10"",""type"":""Date"",""piece"":220,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSRQ2"",""title"":""手术日期2"",""type"":""Date"",""piece"":132,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSRQ3"",""title"":""手术日期3"",""type"":""Date"",""piece"":143,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSRQ4"",""title"":""手术日期4"",""type"":""Date"",""piece"":154,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSRQ5"",""title"":""手术日期5"",""type"":""Date"",""piece"":165,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSRQ6"",""title"":""手术日期6"",""type"":""Date"",""piece"":176,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSRQ7"",""title"":""手术日期7"",""type"":""Date"",""piece"":187,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSRQ8"",""title"":""手术日期8"",""type"":""Date"",""piece"":198,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSRQ9"",""title"":""手术日期9"",""type"":""Date"",""piece"":209,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSSFZQ1"",""title"":""手术是否择期1"",""type"":""String"",""piece"":129,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSSFZQ10"",""title"":""手术是否择期10"",""type"":""String"",""piece"":228,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSSFZQ2"",""title"":""手术是否择期2"",""type"":""String"",""piece"":140,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSSFZQ3"",""title"":""手术是否择期3"",""type"":""String"",""piece"":151,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSSFZQ4"",""title"":""手术是否择期4"",""type"":""String"",""piece"":162,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSSFZQ5"",""title"":""手术是否择期5"",""type"":""String"",""piece"":173,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSSFZQ6"",""title"":""手术是否择期6"",""type"":""String"",""piece"":184,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSSFZQ7"",""title"":""手术是否择期7"",""type"":""String"",""piece"":195,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSSFZQ8"",""title"":""手术是否择期8"",""type"":""String"",""piece"":206,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSSFZQ9"",""title"":""手术是否择期9"",""type"":""String"",""piece"":217,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSYWYL"",""title"":""手术异物遗留"",""type"":""String"",""piece"":330,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SSYYCXYYCLF"",""title"":""手术用一次性医用材料费"",""type"":""String"",""piece"":257,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_SSZDDJBBM"",""title"":""损伤中毒的疾病编码"",""type"":""String"",""piece"":260,""group"":""其他""},"
    s json = json _ "{""field"":""MR_SSZDDWBYS"",""title"":""损伤中毒的外部因素"",""type"":""String"",""piece"":259,""group"":""其他""},"
    s json = json _ "{""field"":""MR_SSZLF"",""title"":""手术治疗费"",""type"":""String"",""piece"":243,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_SWHZSJ"",""title"":""死亡患者是否尸检"",""type"":""String"",""piece"":266,""group"":""不良事件""},"
    s json = json _ "{""field"":""MR_SWSFFSZWSSQN"",""title"":""死亡是否发生在围手术期内"",""type"":""String"",""piece"":336,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_SXFY"",""title"":""输血反应"",""type"":""String"",""piece"":323,""group"":""不良事件""},"
    s json = json _ "{""field"":""MR_SYFY"",""title"":""输液反应"",""type"":""String"",""piece"":326,""group"":""不良事件""},"
    s json = json _ "{""field"":""MR_SYKSSYW"",""title"":""使用抗生素药物"",""type"":""String"",""piece"":299,""group"":""其他""},"
    s json = json _ "{""field"":""MR_SYSZDF"",""title"":""实验室诊断费"",""type"":""Number"",""piece"":238,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_SZSJN"",""title"":""随诊时间年"",""type"":""String"",""piece"":314,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_SZSJY"",""title"":""随诊时间月"",""type"":""String"",""piece"":315,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_SZSJZ"",""title"":""随诊时间周"",""type"":""String"",""piece"":316,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_TSHLTS"",""title"":""特殊护理天数"",""type"":""String"",""piece"":317,""group"":""护理信息""},"
    s json = json _ "{""field"":""MR_WEXZLSQSHZDFH"",""title"":""胃恶性肿瘤手术前诊断与术后病理诊断是否符合"",""type"":""String"",""piece"":348,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_WZBRQJBZ"",""title"":""危重病人抢救标志"",""type"":""Date"",""piece"":321,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_XB"",""title"":""性别"",""type"":""Gender"",""piece"":9,""group"":""基本信息""},"
    s json = json _ "{""field"":""MR_XBYZLZPF"",""title"":""细胞因子类制品费"",""type"":""String"",""piece"":352,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_XF"",""title"":""血费"",""type"":""Number"",""piece"":252,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_XJ"",""title"":""血浆"",""type"":""String"",""piece"":308,""group"":""其他""},"
    s json = json _ "{""field"":""MR_XM"",""title"":""姓名"",""type"":""String"",""piece"":8,""group"":""基本信息""},"
    s json = json _ "{""field"":""MR_XSEAPF"",""title"":""新生儿Apgar评分"",""type"":""String"",""piece"":305,""group"":""基本信息""},"
    s json = json _ "{""field"":""MR_XSECS"",""title"":""新生儿产伤"",""type"":""String"",""piece"":327,""group"":""不良事件""},"
    s json = json _ "{""field"":""MR_XSECSTZ"",""title"":""新生儿出生体重"",""type"":""String"",""piece"":14,""group"":""基本信息""},"
    s json = json _ "{""field"":""MR_XSERYTZ"",""title"":""新生儿入院体重"",""type"":""String"",""piece"":15,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_XX"",""title"":""血型"",""type"":""String"",""piece"":267,""group"":""其他""},"
    s json = json _ "{""field"":""MR_XXB"",""title"":""血小板"",""type"":""String"",""piece"":307,""group"":""其他""},"
    s json = json _ "{""field"":""MR_XXYS"",""title"":""实习医师"",""type"":""String"",""piece"":275,""group"":""其他""},"
    s json = json _ "{""field"":""MR_XYF"",""title"":""西药费"",""type"":""Number"",""piece"":248,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_XZZ"",""title"":""现住址"",""type"":""String"",""piece"":22,""group"":""基本信息""},"
    s json = json _ "{""field"":""MR_XZZDH"",""title"":""电话"",""type"":""String"",""piece"":23,""group"":""基本信息""},"
    s json = json _ "{""field"":""MR_XZZYB"",""title"":""邮编"",""type"":""String"",""piece"":24,""group"":""基本信息""},"
    s json = json _ "{""field"":""MR_YBYLCZF"",""title"":""一般医疗操作费"",""type"":""Number"",""piece"":234,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_YBYLFWF"",""title"":""一般医疗服务费"",""type"":""Number"",""piece"":233,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_YJHLTS"",""title"":""一级护理天数"",""type"":""Number"",""piece"":318,""group"":""护理信息""},"
    s json = json _ "{""field"":""MR_YLFFFS"",""title"":""医疗付费方式"",""type"":""String"",""piece"":1,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_YWGMBZ"",""title"":""药物过敏标志"",""type"":""String"",""piece"":264,""group"":""基本信息""},"
    s json = json _ "{""field"":""MR_YWGMW"",""title"":""药物过敏物"",""type"":""String"",""piece"":265,""group"":""基本信息""},"
    s json = json _ "{""field"":""MR_YXXZDF"",""title"":""影像学诊断费"",""type"":""Number"",""piece"":239,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_YYCUSW"",""title"":""用药错误死亡"",""type"":""String"",""piece"":329,""group"":""不良事件""},"
    s json = json _ "{""field"":""MR_YYGRMCBM"",""title"":""医院感染名称编码"",""type"":""String"",""piece"":116,""group"":""其他""},"
    s json = json _ "{""field"":""MR_YYGRZDMC"",""title"":""医院感染诊断名称"",""type"":""String"",""piece"":118,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_YYGRZDQK"",""title"":""医院感染诊断情况"",""type"":""String"",""piece"":117,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_YYXQX"",""title"":""医源性气胸"",""type"":""String"",""piece"":331,""group"":""不良事件""},"
    s json = json _ "{""field"":""MR_YYXYWCCLS"",""title"":""医源性意外穿刺裂伤"",""type"":""String"",""piece"":332,""group"":""不良事件""},"
    s json = json _ "{""field"":""MR_ZCAOYF"",""title"":""中草药费"",""type"":""Number"",""piece"":251,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_ZCEXZLSQSHZDFH"",""title"":""直肠恶性肿瘤手术前诊断与术后病理诊断是否符合"",""type"":""String"",""piece"":349,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_ZCHENGYF"",""title"":""中成药费"",""type"":""Number"",""piece"":250,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_ZFJE"",""title"":""自付金额"",""type"":""Number"",""piece"":232,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_ZKHS"",""title"":""质控护士"",""type"":""String"",""piece"":279,""group"":""护理信息""},"
    s json = json _ "{""field"":""MR_ZKKB"",""title"":""转科科别"",""type"":""String"",""piece"":38,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_ZKRQ"",""title"":""质控日期"",""type"":""Date"",""piece"":280,""group"":""其他""},"
    s json = json _ "{""field"":""MR_ZKYS"",""title"":""质控医师"",""type"":""String"",""piece"":278,""group"":""其他""},"
    s json = json _ "{""field"":""MR_ZLFQ"",""title"":""肿瘤分期"",""type"":""String"",""piece"":304,""group"":""其他""},"
    s json = json _ "{""field"":""MR_ZLYYCXYYCLF"",""title"":""治疗用一次性医用材料费"",""type"":""Number"",""piece"":256,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_ZRHS"",""title"":""责任护士"",""type"":""String"",""piece"":273,""group"":""护理信息""},"
    s json = json _ "{""field"":""MR_ZRYS"",""title"":""主（副主）任医师"",""type"":""String"",""piece"":270,""group"":""其他""},"
    s json = json _ "{""field"":""MR_ZY"",""title"":""职业"",""type"":""String"",""piece"":20,""group"":""基本信息""},"
    s json = json _ "{""field"":""MR_ZYCS"",""title"":""住院次数"",""type"":""String"",""piece"":3,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_ZYH"",""title"":""住院号"",""type"":""String"",""piece"":5,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_ZYYS"",""title"":""住院医师"",""type"":""String"",""piece"":272,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_ZYZFF"",""title"":""住院总费用"",""type"":""Number"",""piece"":231,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_ZYZLF"",""title"":""中医治疗费"",""type"":""Number"",""piece"":247,""group"":""费用信息""},"
    s json = json _ "{""field"":""MR_ZZYJH"",""title"":""是否有出院31天内再住院计划"",""type"":""String"",""piece"":282,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_ZZYMD"",""title"":""31内再住院目的"",""type"":""String"",""piece"":283,""group"":""住院信息""},"
    s json = json _ "{""field"":""MR_ZZYS"",""title"":""主治医师"",""type"":""String"",""piece"":271,""group"":""其他""},"
    s json = json _ "{""field"":""MR_ALLZD"",""title"":""所有诊断"",""type"":""String"",""piece"":-1,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_ALLZDMC"",""title"":""所有诊断名称"",""type"":""String"",""piece"":-2,""group"":""诊断信息""},"
    s json = json _ "{""field"":""MR_ALLSS"",""title"":""所有手术"",""type"":""String"",""piece"":-3,""group"":""手术信息""},"
    s json = json _ "{""field"":""MR_ALLSSMC"",""title"":""所有手术名称"",""type"":""String"",""piece"":-4,""group"":""手术信息""}"
    q json _ "]"
}

///w ##class(web.YZSY.DHCMRCustomQuery).QueryData(columns,conditions,page,rows)
ClassMethod QueryData(columns As %String, conditions As %String, page As %Integer = 1, rows As %Integer = 20) As %String [ Language = objectscript ]
{
    s colArr = ##class(%DynamicArray).%FromJSON(columns)
    s colCount = colArr.%Size()
    s condArr = ##class(%DynamicArray).%FromJSON(conditions)
    s condCount = condArr.%Size()
    s sep = $c(1)
    s groups = ""
    s groupList = ""
    for i = 0:1:(condCount-1) {
        s c = condArr.%Get(i)
        s gid = c.%Get("groupId")
        if gid = "" s gid = "0"
        if '$data(groups(gid)) {
            s groups(gid) = ""
            if groupList = "" s groupList = gid
            else  s groupList = groupList _ "," _ gid
        }
        s piece = c.%Get("piece")
        if piece = "" s piece = 0
        if groups(gid) = "" s groups(gid) = c.%Get("field") _ "|" _ c.%Get("op") _ "|" _ c.%Get("value") _ "|" _ piece _ "|" _ c.%Get("type")
        else  s groups(gid) = groups(gid) _ sep _ c.%Get("field") _ "|" _ c.%Get("op") _ "|" _ c.%Get("value") _ "|" _ piece _ "|" _ c.%Get("type")
    }
    s feeFields = "^MR_ZFJE^MR_XYF^MR_MZF^MR_SSF^MR_KFF^MR_HLF^MR_ZYZLF^"
    s matchedRows = ""
    s totalMatched = 0
    s maxRows = 200000
    s id = 0
    for {
        s id = $o(^DHCMRInfo(id))
        q:id=""
        q:totalMatched'<maxRows
        s data = $g(^DHCMRInfo(id))
        if data '= "" {
            s groupMatch = 0
            if groupList = "" {
                s groupMatch = 1
            }
            else {
            s groupCnt = $l(groupList, ",")
            for gi = 1:1:groupCnt {
                s gid = $p(groupList, ",", gi)
                s conds = groups(gid)
                s condCnt = $l(conds, sep)
                s allPass = 1
                for ci = 1:1:condCnt {
                    s condStr = $p(conds, sep, ci)
                    s field = $p(condStr, "|", 1)
                    s op = $p(condStr, "|", 2)
                    s value = $p(condStr, "|", 3)
                    s piece = +$p(condStr, "|", 4)
                    s ftype = $p(condStr, "|", 5)
                    if piece = 0 s piece = ..GetFieldPiece(field)
                    if piece = 0 s allPass = 0 continue
                    if piece < 0 {
                        s actualVal = ..BuildMultiPiece(data, piece)
                    } else {
                        s actualVal = $p(data, "^", piece)
                    }
                    if '..MatchValue(actualVal, op, value, ftype) s allPass = 0 continue
                }
                if allPass s groupMatch = 1 continue
            }
            }
            if groupMatch {
                s totalMatched = totalMatched + 1
                s matchedRows(totalMatched) = id
            }
        }
    }
    if totalMatched '< maxRows {
        q "{""ok"":false}"
    }
    s startIdx = (page - 1) * rows + 1
    s endIdx = startIdx + rows - 1
    if endIdx > totalMatched s endIdx = totalMatched
    s qt = $c(34)
    s resultRows = "["
    s footerSum = ""
    for idx = startIdx:1:endIdx {
        s rowId = matchedRows(idx)
        s rowData = $g(^DHCMRInfo(rowId))
        if idx > startIdx s resultRows = resultRows _ ","
        s resultRows = resultRows _ "{"
        for ci = 0:1:(colCount-1) {
            s col = colArr.%Get(ci)
            s piece = col.%Get("piece")
            s fld = col.%Get("field")
            if piece < 0 {
                s val = ..BuildMultiPiece(rowData, piece)
            } else {
                s val = $p(rowData, "^", piece)
            }
            if val = "" s val = "-"
            if col.%Get("type") = "Date" {
                if +val > 0 s val = $zd(+val, 3)
            }
            if col.%Get("type") = "CTLoc" {
                s locDesc = $p($g(^CTLOC(+val)), "^", 2)
                if locDesc '= "" s val = locDesc
            }
            if col.%Get("type") = "Gender" {
                if val = "1" s val = "男"
                if val = "2" s val = "女"
            }
            if ci > 0 s resultRows = resultRows _ ","
            s resultRows = resultRows _qt_ fld _qt_ ":" _qt_ ..EscapeJSON(val) _qt
            if $find(feeFields, "^" _ fld _ "^") {
                if '$data(footerSum(fld)) s footerSum(fld) = 0
                s footerSum(fld) = footerSum(fld) + val
            }
        }
        s resultRows = resultRows _ "}"
    }
    s resultRows = resultRows _ "]"
    s footerJSON = "{"
    s firstFld = 1
    s fld = $o(footerSum(""))
    while fld '= "" {
        if 'firstFld s footerJSON = footerJSON _ ","
        s firstFld = 0
        s footerJSON = footerJSON _qt_ fld _qt_ ":" _ footerSum(fld)
        s fld = $o(footerSum(fld))
    }
    s footerJSON = footerJSON _ "}"
    s result = "{""ok"":true,""total"":" _ totalMatched _ ",""rows"":" _ resultRows _ ",""footer"":" _ footerJSON _ "}"
    q result
}

///w ##class(web.YZSY.DHCMRCustomQuery).GetFieldPiece(field)
ClassMethod GetFieldPiece(field As %String) As %Integer [ Language = objectscript ]
{
    if field = "MR_ADM" q 6
    if field = "MR_BAFX" q 291
    if field = "MR_BAH" q 4
    if field = "MR_BAZL" q 277
    if field = "MR_BDBLZPF" q 253
    if field = "MR_BLH" q 263
    if field = "MR_BLZD" q 261
    if field = "MR_BLZDBM" q 262
    if field = "MR_BLZDF" q 237
    if field = "MR_BMY" q 276
    if field = "MR_BYXJC" q 333
    if field = "MR_BZZSNN" q 13
    if field = "MR_CFCS" q 328
    if field = "MR_CSD" q 16
    if field = "MR_CSRQ" q 10
    if field = "MR_CYBF" q 41
    if field = "MR_CYKB" q 40
    if field = "MR_CYQTZD1" q 56
    if field = "MR_CYQTZD10" q 92
    if field = "MR_CYQTZD11" q 96
    if field = "MR_CYQTZD12" q 100
    if field = "MR_CYQTZD13" q 104
    if field = "MR_CYQTZD14" q 108
    if field = "MR_CYQTZD15" q 112
    if field = "MR_CYQTZD2" q 60
    if field = "MR_CYQTZD3" q 64
    if field = "MR_CYQTZD4" q 68
    if field = "MR_CYQTZD5" q 72
    if field = "MR_CYQTZD6" q 76
    if field = "MR_CYQTZD7" q 80
    if field = "MR_CYQTZD8" q 84
    if field = "MR_CYQTZD9" q 88
    if field = "MR_CYQTZDMC1" q 57
    if field = "MR_CYQTZDMC10" q 93
    if field = "MR_CYQTZDMC11" q 97
    if field = "MR_CYQTZDMC12" q 101
    if field = "MR_CYQTZDMC13" q 105
    if field = "MR_CYQTZDMC14" q 109
    if field = "MR_CYQTZDMC15" q 113
    if field = "MR_CYQTZDMC2" q 61
    if field = "MR_CYQTZDMC3" q 65
    if field = "MR_CYQTZDMC4" q 69
    if field = "MR_CYQTZDMC5" q 73
    if field = "MR_CYQTZDMC6" q 77
    if field = "MR_CYQTZDMC7" q 81
    if field = "MR_CYQTZDMC8" q 85
    if field = "MR_CYQTZDMC9" q 89
    if field = "MR_CYQTZDRYBQ1" q 58
    if field = "MR_CYQTZDRYBQ10" q 94
    if field = "MR_CYQTZDRYBQ11" q 98
    if field = "MR_CYQTZDRYBQ12" q 102
    if field = "MR_CYQTZDRYBQ13" q 106
    if field = "MR_CYQTZDRYBQ14" q 110
    if field = "MR_CYQTZDRYBQ15" q 114
    if field = "MR_CYQTZDRYBQ2" q 62
    if field = "MR_CYQTZDRYBQ3" q 66
    if field = "MR_CYQTZDRYBQ4" q 70
    if field = "MR_CYQTZDRYBQ5" q 74
    if field = "MR_CYQTZDRYBQ6" q 78
    if field = "MR_CYQTZDRYBQ7" q 82
    if field = "MR_CYQTZDRYBQ8" q 86
    if field = "MR_CYQTZDRYBQ9" q 90
    if field = "MR_CYQTZDZLJG10" q 95
    if field = "MR_CYQTZDZLJG11" q 99
    if field = "MR_CYQTZDZLJG12" q 103
    if field = "MR_CYQTZDZLJG13" q 107
    if field = "MR_CYQTZDZLJG14" q 111
    if field = "MR_CYQTZDZLJG15" q 115
    if field = "MR_CYQTZDZLJG2" q 63
    if field = "MR_CYQTZDZLJG3" q 67
    if field = "MR_CYQTZDZLJG4" q 71
    if field = "MR_CYQTZDZLJG6" q 79
    if field = "MR_CYQTZDZLJG7" q 83
    if field = "MR_CYQTZDZLJG8" q 87
    if field = "MR_CYQTZDZLJG9" q 91
    if field = "MR_CYRQ" q 39
    if field = "MR_CYZYZD" q 52
    if field = "MR_CYZYZDMC" q 53
    if field = "MR_CYZYZDRYBQ" q 54
    if field = "MR_CYZYZDZLJG" q 55
    if field = "MR_EJHLTS" q 319
    if field = "MR_FEXZLSQSHZDFH" q 347
    if field = "MR_FSBLZDFHQK" q 343
    if field = "MR_FSSZLXMF" q 241
    if field = "MR_GEXZLSQSHZDFH" q 346
    if field = "MR_GJ" q 12
    if field = "MR_GZDWDH" q 28
    if field = "MR_GZDWDZ" q 27
    if field = "MR_GZDWYB" q 29
    if field = "MR_HKDZ" q 25
    if field = "MR_HKYB" q 26
    if field = "MR_HLF" q 235
    if field = "MR_HXB" q 306
    if field = "MR_HY" q 21
    if field = "MR_JCEXZLSQSHZDFH" q 350
    if field = "MR_JCYYCXYYCLF" q 255
    if field = "MR_JG" q 17
    if field = "MR_JHSJRRQSJ" q 293
    if field = "MR_JHSTCRQSJ" q 294
    if field = "MR_JKKH" q 2
    if field = "MR_JXYS" q 274
    if field = "MR_KFF" q 246
    if field = "MR_KJYWFY" q 249
    if field = "MR_KZR" q 269
    if field = "MR_LCBLZDFHQK" q 342
    if field = "MR_LCWLZLF" q 242
    if field = "MR_LCZDXMF" q 240
    if field = "MR_LHSYKSSYW" q 301
    if field = "MR_LNSSRYHHMSJF" q 290
    if field = "MR_LNSSRYHHMSJS" q 289
    if field = "MR_LNSSRYHHMSJT" q 288
    if field = "MR_LNSSRYQHMSJF" q 287
    if field = "MR_LNSSRYQHMSJS" q 286
    if field = "MR_LNSSRYQHMSJT" q 285
    if field = "MR_LXRDH" q 33
    if field = "MR_LXRDZ" q 32
    if field = "MR_LXRGX" q 31
    if field = "MR_LXRXM" q 30
    if field = "MR_LXYZLZPF" q 351
    if field = "MR_LYFS" q 46
    if field = "MR_LYFSYLJSJGMC" q 47
    if field = "MR_MJZZDJBBM" q 44
    if field = "MR_MJZZDMC" q 43
    if field = "MR_MRDate" q 281
    if field = "MR_MZ" q 18
    if field = "MR_MZF" q 244
    if field = "MR_MZRYZDFHQK" q 339
    if field = "MR_NN" q 11
    if field = "MR_QDBLZPF" q 254
    if field = "MR_QJCGCS" q 230
    if field = "MR_QJCS" q 229
    if field = "MR_QTF" q 258
    if field = "MR_QTFY" q 236
    if field = "MR_QX" q 309
    if field = "MR_RH" q 268
    if field = "MR_RYBF" q 37
    if field = "MR_RYBQ" q 45
    if field = "MR_RYCYZDFHQK" q 340
    if field = "MR_RYHQZRQ" q 51
    if field = "MR_RYKB" q 36
    if field = "MR_RYRQ" q 35
    if field = "MR_RYTJ" q 34
    if field = "MR_RYZD" q 48
    if field = "MR_RYZDMC" q 49
    if field = "MR_RYZDRYBQ" q 50
    if field = "MR_SEXZLSQSHZDFH" q 345
    if field = "MR_SFCFSSS" q 324
    if field = "MR_SFDBZGL" q 295
    if field = "MR_SFFDCRB" q 303
    if field = "MR_SFFSRC" q 310
    if field = "MR_SFFSYLCC" q 312
    if field = "MR_SFFSYLSG" q 311
    if field = "MR_SFLHSYKSS" q 300
    if field = "MR_SFSSDGL" q 297
    if field = "MR_SFSSLCLJGL" q 296
    if field = "MR_SFSSZZJH" q 292
    if field = "MR_SFSX" q 322
    if field = "MR_SFSY" q 325
    if field = "MR_SFSYKSS" q 298
    if field = "MR_SFSZ" q 313
    if field = "MR_SFTBZZZY" q 284
    if field = "MR_SFXJPYBBSJ" q 302
    if field = "MR_SFYNFSDDHZCSJ" q 337
    if field = "MR_SFZH" q 19
    if field = "MR_SHCD" q 338
    if field = "MR_SJHLTS" q 320
    if field = "MR_SJZYTS" q 42
    if field = "MR_SQSHZDFHQK" q 341
    if field = "MR_SSBDSLBLZDFH" q 344
    if field = "MR_SSBFZ" q 334
    if field = "MR_SSBFZMC" q 335
    if field = "MR_SSBM1" q 119
    if field = "MR_SSBM10" q 218
    if field = "MR_SSBM2" q 130
    if field = "MR_SSBM3" q 141
    if field = "MR_SSBM4" q 152
    if field = "MR_SSBM5" q 163
    if field = "MR_SSBM6" q 174
    if field = "MR_SSBM7" q 185
    if field = "MR_SSBM8" q 196
    if field = "MR_SSBM9" q 207
    if field = "MR_SSCZYS1" q 123
    if field = "MR_SSCZYS10" q 222
    if field = "MR_SSCZYS2" q 134
    if field = "MR_SSCZYS3" q 145
    if field = "MR_SSCZYS4" q 156
    if field = "MR_SSCZYS5" q 167
    if field = "MR_SSCZYS6" q 178
    if field = "MR_SSCZYS7" q 189
    if field = "MR_SSCZYS8" q 200
    if field = "MR_SSCZYS9" q 211
    if field = "MR_SSF" q 245
    if field = "MR_SSIIZ1" q 125
    if field = "MR_SSIIZ10" q 224
    if field = "MR_SSIIZ2" q 136
    if field = "MR_SSIIZ3" q 147
    if field = "MR_SSIIZ4" q 158
    if field = "MR_SSIIZ5" q 169
    if field = "MR_SSIIZ6" q 180
    if field = "MR_SSIIZ7" q 191
    if field = "MR_SSIIZ8" q 202
    if field = "MR_SSIIZ9" q 213
    if field = "MR_SSIZ1" q 124
    if field = "MR_SSIZ10" q 223
    if field = "MR_SSIZ2" q 135
    if field = "MR_SSIZ3" q 146
    if field = "MR_SSIZ4" q 157
    if field = "MR_SSIZ5" q 168
    if field = "MR_SSIZ6" q 179
    if field = "MR_SSIZ7" q 190
    if field = "MR_SSIZ8" q 201
    if field = "MR_SSIZ9" q 212
    if field = "MR_SSJB1" q 120
    if field = "MR_SSJB10" q 219
    if field = "MR_SSJB2" q 131
    if field = "MR_SSJB3" q 142
    if field = "MR_SSJB4" q 153
    if field = "MR_SSJB5" q 164
    if field = "MR_SSJB6" q 175
    if field = "MR_SSJB7" q 186
    if field = "MR_SSJB8" q 197
    if field = "MR_SSJB9" q 208
    if field = "MR_SSMC1" q 122
    if field = "MR_SSMC10" q 221
    if field = "MR_SSMC2" q 133
    if field = "MR_SSMC3" q 144
    if field = "MR_SSMC4" q 155
    if field = "MR_SSMC5" q 166
    if field = "MR_SSMC6" q 177
    if field = "MR_SSMC7" q 188
    if field = "MR_SSMC8" q 199
    if field = "MR_SSMC9" q 210
    if field = "MR_SSMZFS1" q 126
    if field = "MR_SSMZFS10" q 225
    if field = "MR_SSMZFS2" q 137
    if field = "MR_SSMZFS3" q 148
    if field = "MR_SSMZFS4" q 159
    if field = "MR_SSMZFS5" q 170
    if field = "MR_SSMZFS6" q 181
    if field = "MR_SSMZFS7" q 192
    if field = "MR_SSMZFS8" q 203
    if field = "MR_SSMZFS9" q 214
    if field = "MR_SSMZYS1" q 128
    if field = "MR_SSMZYS10" q 227
    if field = "MR_SSMZYS2" q 139
    if field = "MR_SSMZYS3" q 150
    if field = "MR_SSMZYS4" q 161
    if field = "MR_SSMZYS5" q 172
    if field = "MR_SSMZYS6" q 183
    if field = "MR_SSMZYS7" q 194
    if field = "MR_SSMZYS8" q 205
    if field = "MR_SSMZYS9" q 216
    if field = "MR_SSQKYHDJ1" q 127
    if field = "MR_SSQKYHDJ10" q 226
    if field = "MR_SSQKYHDJ2" q 138
    if field = "MR_SSQKYHDJ3" q 149
    if field = "MR_SSQKYHDJ4" q 160
    if field = "MR_SSQKYHDJ5" q 171
    if field = "MR_SSQKYHDJ6" q 182
    if field = "MR_SSQKYHDJ7" q 193
    if field = "MR_SSQKYHDJ8" q 204
    if field = "MR_SSQKYHDJ9" q 215
    if field = "MR_SSRQ1" q 121
    if field = "MR_SSRQ10" q 220
    if field = "MR_SSRQ2" q 132
    if field = "MR_SSRQ3" q 143
    if field = "MR_SSRQ4" q 154
    if field = "MR_SSRQ5" q 165
    if field = "MR_SSRQ6" q 176
    if field = "MR_SSRQ7" q 187
    if field = "MR_SSRQ8" q 198
    if field = "MR_SSRQ9" q 209
    if field = "MR_SSSFZQ1" q 129
    if field = "MR_SSSFZQ10" q 228
    if field = "MR_SSSFZQ2" q 140
    if field = "MR_SSSFZQ3" q 151
    if field = "MR_SSSFZQ4" q 162
    if field = "MR_SSSFZQ5" q 173
    if field = "MR_SSSFZQ6" q 184
    if field = "MR_SSSFZQ7" q 195
    if field = "MR_SSSFZQ8" q 206
    if field = "MR_SSSFZQ9" q 217
    if field = "MR_SSYWYL" q 330
    if field = "MR_SSYYCXYYCLF" q 257
    if field = "MR_SSZDDJBBM" q 260
    if field = "MR_SSZDDWBYS" q 259
    if field = "MR_SSZLF" q 243
    if field = "MR_SWHZSJ" q 266
    if field = "MR_SWSFFSZWSSQN" q 336
    if field = "MR_SXFY" q 323
    if field = "MR_SYFY" q 326
    if field = "MR_SYKSSYW" q 299
    if field = "MR_SYSZDF" q 238
    if field = "MR_SZSJN" q 314
    if field = "MR_SZSJY" q 315
    if field = "MR_SZSJZ" q 316
    if field = "MR_TSHLTS" q 317
    if field = "MR_WEXZLSQSHZDFH" q 348
    if field = "MR_WZBRQJBZ" q 321
    if field = "MR_XB" q 9
    if field = "MR_XBYZLZPF" q 352
    if field = "MR_XF" q 252
    if field = "MR_XJ" q 308
    if field = "MR_XM" q 8
    if field = "MR_XSEAPF" q 305
    if field = "MR_XSECS" q 327
    if field = "MR_XSECSTZ" q 14
    if field = "MR_XSERYTZ" q 15
    if field = "MR_XX" q 267
    if field = "MR_XXB" q 307
    if field = "MR_XXYS" q 275
    if field = "MR_XYF" q 248
    if field = "MR_XZZ" q 22
    if field = "MR_XZZDH" q 23
    if field = "MR_XZZYB" q 24
    if field = "MR_YBYLCZF" q 234
    if field = "MR_YBYLFWF" q 233
    if field = "MR_YJHLTS" q 318
    if field = "MR_YLFFFS" q 1
    if field = "MR_YWGMBZ" q 264
    if field = "MR_YWGMW" q 265
    if field = "MR_YXXZDF" q 239
    if field = "MR_YYCUSW" q 329
    if field = "MR_YYGRMCBM" q 116
    if field = "MR_YYGRZDMC" q 118
    if field = "MR_YYGRZDQK" q 117
    if field = "MR_YYXQX" q 331
    if field = "MR_YYXYWCCLS" q 332
    if field = "MR_ZCAOYF" q 251
    if field = "MR_ZCEXZLSQSHZDFH" q 349
    if field = "MR_ZCHENGYF" q 250
    if field = "MR_ZFJE" q 232
    if field = "MR_ZKHS" q 279
    if field = "MR_ZKKB" q 38
    if field = "MR_ZKRQ" q 280
    if field = "MR_ZKYS" q 278
    if field = "MR_ZLFQ" q 304
    if field = "MR_ZLYYCXYYCLF" q 256
    if field = "MR_ZRHS" q 273
    if field = "MR_ZRYS" q 270
    if field = "MR_ZY" q 20
    if field = "MR_ZYCS" q 3
    if field = "MR_ZYH" q 5
    if field = "MR_ZYYS" q 272
    if field = "MR_ZYZFF" q 231
    if field = "MR_ZYZLF" q 247
    if field = "MR_ZZYJH" q 282
    if field = "MR_ZZYMD" q 283
    if field = "MR_ZZYS" q 271
    if field = "MR_ALLZD" q -1
    if field = "MR_ALLZDMC" q -2
    if field = "MR_ALLSS" q -3
    if field = "MR_ALLSSMC" q -4
    q 0
}

/// 拼接多字段值
ClassMethod BuildMultiPiece(data As %String, piece As %Integer) As %String [ Language = objectscript ]
{
    s result = ""
    if piece = -1 {
        s result = result _ $p(data, "^", 52) _ " "
        s result = result _ $p(data, "^", 56) _ " "
        s result = result _ $p(data, "^", 60) _ " "
        s result = result _ $p(data, "^", 64) _ " "
        s result = result _ $p(data, "^", 68) _ " "
        s result = result _ $p(data, "^", 72) _ " "
        s result = result _ $p(data, "^", 76) _ " "
        s result = result _ $p(data, "^", 80) _ " "
        s result = result _ $p(data, "^", 84) _ " "
        s result = result _ $p(data, "^", 88) _ " "
        s result = result _ $p(data, "^", 92) _ " "
        s result = result _ $p(data, "^", 96) _ " "
        s result = result _ $p(data, "^", 100) _ " "
        s result = result _ $p(data, "^", 104) _ " "
        s result = result _ $p(data, "^", 108) _ " "
        s result = result _ $p(data, "^", 112) _ " "
        q $zstrip(result, "<>W")
    }
    if piece = -2 {
        s result = result _ $p(data, "^", 53) _ " "
        s result = result _ $p(data, "^", 57) _ " "
        s result = result _ $p(data, "^", 61) _ " "
        s result = result _ $p(data, "^", 65) _ " "
        s result = result _ $p(data, "^", 69) _ " "
        s result = result _ $p(data, "^", 73) _ " "
        s result = result _ $p(data, "^", 77) _ " "
        s result = result _ $p(data, "^", 81) _ " "
        s result = result _ $p(data, "^", 85) _ " "
        s result = result _ $p(data, "^", 89) _ " "
        s result = result _ $p(data, "^", 93) _ " "
        s result = result _ $p(data, "^", 97) _ " "
        s result = result _ $p(data, "^", 101) _ " "
        s result = result _ $p(data, "^", 105) _ " "
        s result = result _ $p(data, "^", 109) _ " "
        s result = result _ $p(data, "^", 113) _ " "
        q $zstrip(result, "<>W")
    }
    if piece = -3 {
        s result = result _ $p(data, "^", 119) _ " "
        s result = result _ $p(data, "^", 130) _ " "
        s result = result _ $p(data, "^", 141) _ " "
        s result = result _ $p(data, "^", 152) _ " "
        s result = result _ $p(data, "^", 163) _ " "
        s result = result _ $p(data, "^", 174) _ " "
        s result = result _ $p(data, "^", 185) _ " "
        s result = result _ $p(data, "^", 196) _ " "
        s result = result _ $p(data, "^", 207) _ " "
        s result = result _ $p(data, "^", 218) _ " "
        q $zstrip(result, "<>W")
    }
    if piece = -4 {
        s result = result _ $p(data, "^", 122) _ " "
        s result = result _ $p(data, "^", 133) _ " "
        s result = result _ $p(data, "^", 144) _ " "
        s result = result _ $p(data, "^", 155) _ " "
        s result = result _ $p(data, "^", 166) _ " "
        s result = result _ $p(data, "^", 177) _ " "
        s result = result _ $p(data, "^", 188) _ " "
        s result = result _ $p(data, "^", 199) _ " "
        s result = result _ $p(data, "^", 210) _ " "
        s result = result _ $p(data, "^", 221) _ " "
        q $zstrip(result, "<>W")
    }
    q result
}

///w ##class(web.YZSY.DHCMRCustomQuery).MatchValue(actualVal,op,condVal,ftype)
ClassMethod MatchValue(actualVal As %String, op As %String, condVal As %String, ftype As %String = "String") As %Boolean [ Language = objectscript ]
{
    // CTLoc 类型：ID 转描述后再比较
    if ftype = "CTLoc" s actualVal = $p($g(^CTLOC(+actualVal)), "^", 2)
    if op = "contains" q ($find(actualVal, condVal) > 0)
    if op = "notcontains" q ($find(actualVal, condVal) = 0)
    if op = "startswith" q ($e(actualVal, 1, $l(condVal)) = condVal)
    if op = "eq" {
        if ftype = "Date" { s condVal = $zdh(condVal,3) }
        q (actualVal = condVal)
    }
    if op = "neq" {
        if ftype = "Date" { s condVal = $zdh(condVal,3) }
        q (actualVal '= condVal)
    }
    if op = "gt" {
        if ftype = "Date" { s condVal = $zdh(condVal,3) }
        q (actualVal > condVal)
    }
    if op = "lt" {
        if ftype = "Date" { s condVal = $zdh(condVal,3) }
        q (actualVal < condVal)
    }
    if op = "gte" {
        if ftype = "Date" { s condVal = $zdh(condVal,3) }
        q (actualVal '< condVal)
    }
    if op = "lte" {
        if ftype = "Date" { s condVal = $zdh(condVal,3) }
        q (actualVal '> condVal)
    }
    if op = "between" {
        s v1 = $p(condVal, "~", 1)
        s v2 = $p(condVal, "~", 2)
        if ftype = "Date" {
            s v1 = $zdh(v1, 3)
            s v2 = $zdh(v2, 3)
        }
        q (actualVal '< v1)&&(actualVal '> v2)
    }
    q 1
}

///w ##class(web.YZSY.DHCMRCustomQuery).EscapeJSON(val)
ClassMethod EscapeJSON(val As %String) As %String [ Language = objectscript ]
{
    s val = $replace(val, $c(92), $c(92,92))
    s val = $replace(val, $c(34), $c(92,34))
    s val = $replace(val, $c(13,10), $c(92,110))
    s val = $replace(val, $c(10), $c(92,110))
    s val = $replace(val, $c(13), $c(92,110))
    s val = $replace(val, $c(9), $c(92,116))
    q val
}

///w ##class(web.YZSY.DHCMRCustomQuery).GetTemplateList(UserID)
ClassMethod GetTemplateList(UserID As %String, IsActive As %String = "") As %String [ Language = objectscript ]
{
    s rows = "["
    s first = 1
    s tId = 0
    for {
        s tId = $o(^User.DHCMRQueryTemplateD(tId))
        q:tId=""
        s td = $g(^User.DHCMRQueryTemplateD(tId))
        if IsActive = "1" { if $lg(td,8) '= 1 continue }
        if IsActive = "0" { if $lg(td,8) '= 0 continue }
        s sc = $lg(td,3)
        s cu = $lg(td,4)
        if (sc '= "G")&&(cu '= UserID) continue
        s cuName = $p($g(^SSU("SSUSR", cu)), "^", 2)
        if 'first s rows = rows _ ","
        s first = 0
        s rows = rows _ "{""ID"":" _ tId _ ",""Name"":""" _ ..EscapeJSON($lg(td,2)) _ """,""Scope"":""" _ sc _ """,""CreateUserID"":""" _ cu _ """,""CreateUserName"":""" _ ..EscapeJSON(cuName) _ """,""IsDefault"":""" _ $lg(td,7) _ """,""IsActive"":""" _ $lg(td,8) _ """,""CreateDate"":""" _ $zd($lg(td,9),3) _ """,""CreateTime"":""" _ $zt($lg(td,10),1) _ """}"
    }
    s rows = rows _ "]"
    q "{""rows"":" _ rows _ "}"
}

///w ##class(web.YZSY.DHCMRCustomQuery).SaveTemplate(ID,Name,Scope,UserID,ColumnsJSON,ConditionsJSON)
ClassMethod SaveTemplate(ID As %String = "", Name As %String, Scope As %String = "P", UserID As %String, ColumnsJSON As %String, ConditionsJSON As %String) As %String [ Language = objectscript ]
{
    if ID = "" s ID = 0
    s tId = 0
    s dupName = ""
    for {
        s tId = $o(^User.DHCMRQueryTemplateD(tId))
        q:tId=""
        s td = $g(^User.DHCMRQueryTemplateD(tId))
        continue:tId=ID
        if $lg(td,2) = Name { s dupName = Name q }
    }
    if dupName '= "" q "{""ok"":false,""error"":""模板名称已存在""}"
    if ID = 0 {
        s newId = $i(^User.DHCMRQueryTemplateD)
        s ^User.DHCMRQueryTemplateD(newId) = $lb("User.DHCMRQueryTemplate", Name, Scope, UserID, ColumnsJSON, ConditionsJSON, 0, 1, +$h, +$p($h,",",2))
        q "{""ok"":true,""id"":" _ newId _ "}"
    }
    s data = $g(^User.DHCMRQueryTemplateD(ID))
    if data = "" q "{""ok"":false,""error"":""template not found""}"
    s creator = $lg(data,4)
    // 非创建者不允许修改范围和名称，但允许修改列/条件配置
    if creator '= UserID {
        s Name = $lg(data,2)
        s Scope = $lg(data,3)
    }
    s ^User.DHCMRQueryTemplateD(ID) = $lb("User.DHCMRQueryTemplate", Name, Scope, UserID, ColumnsJSON, ConditionsJSON, $lg(data,7), $lg(data,8), $lg(data,9), $lg(data,10))
    q "{""ok"":true,""id"":" _ ID _ "}"
}

///w ##class(web.YZSY.DHCMRCustomQuery).DeleteTemplate(ID,UserID,CTLocDesc)
ClassMethod DeleteTemplate(ID As %String, UserID As %String, CTLocDesc As %String = "") As %String [ Language = objectscript ]
{
    s data = $g(^User.DHCMRQueryTemplateD(ID))
    if data = "" q "{""ok"":false,""error"":""not found""}"
    s creator = $lg(data,4)
    // 创建者本人 或 医务部/网络信息部 可删除
    if (creator '= UserID)&&(CTLocDesc '= "医务部")&&(CTLocDesc '= "网络信息部") {
        q "{""ok"":false,""error"":""仅创建者本人、医务部或网络信息部可删除""}"
    }
    k ^User.DHCMRQueryTemplateD(ID)
    q "{""ok"":true}"
}

///w ##class(web.YZSY.DHCMRCustomQuery).ToggleDefault(ID,IsDefault)
ClassMethod ToggleDefault(ID As %String, IsDefault As %String) As %String [ Language = objectscript ]
{
    if IsDefault = "1" {
        s tId = 0
        for {
            s tId = $o(^User.DHCMRQueryTemplateD(tId))
            q:tId=""
            s td = $g(^User.DHCMRQueryTemplateD(tId))
            if $lg(td,7) = 1 {
                s $li(^User.DHCMRQueryTemplateD(tId),7) = 0
            }
        }
        if $d(^User.DHCMRQueryTemplateD(ID)) {
            s $li(^User.DHCMRQueryTemplateD(ID),7) = 1
        }
    }
    else {
        if $d(^User.DHCMRQueryTemplateD(ID)) {
            s $li(^User.DHCMRQueryTemplateD(ID),7) = 0
        }
    }
    q "{""ok"":true}"
}

///w ##class(web.YZSY.DHCMRCustomQuery).ToggleActive(ID,IsActive)
ClassMethod ToggleActive(ID As %String, IsActive As %String) As %String [ Language = objectscript ]
{
    if $d(^User.DHCMRQueryTemplateD(ID)) {
        s $li(^User.DHCMRQueryTemplateD(ID),8) = IsActive
    }
    q "{""ok"":true}"
}

///w ##class(web.YZSY.DHCMRCustomQuery).GetDefaultTemplate(UserID)
ClassMethod GetDefaultTemplate(UserID As %String) As %String [ Language = objectscript ]
{
    s result = ""
    s qt = $c(34)
    s tId = 0
    for {
        s tId = $o(^User.DHCMRQueryTemplateD(tId))
        q:tId=""
        s td = $g(^User.DHCMRQueryTemplateD(tId))
        if $lg(td,8) '= 1 continue
        if $lg(td,7) '= 1 continue
        s sc = $lg(td,3)
        s cu = $lg(td,4)
        if (sc '= "G")&&(cu '= UserID) continue
        s result = "{""ID"":" _ tId _ ",""Name"":""" _ ..EscapeJSON($lg(td,2)) _ """,""Scope"":""" _ sc _ """,""ColumnsJSON"":" _qt_ ..EscapeJSON($lg(td,5)) _qt_ ",""ConditionsJSON"":" _qt_ ..EscapeJSON($lg(td,6)) _qt_ "}"
        q
    }
    if result '= "" q result
    q "{}"
}

///w ##class(web.YZSY.DHCMRCustomQuery).GetTemplateDetail(ID)
ClassMethod GetTemplateDetail(ID As %String) As %String [ Language = objectscript ]
{
    s td = $g(^User.DHCMRQueryTemplateD(ID))
    if td = "" q "{}"
    s qt = $c(34)
    q "{"
        _qt_"ID"_qt_":"_ID_","
        _qt_"Name"_qt_":"_qt_..EscapeJSON($lg(td,2))_qt_","
        _qt_"Scope"_qt_":"_qt_$lg(td,3)_qt_","
        _qt_"CreateUserID"_qt_":"_qt_$lg(td,4)_qt_","
        _qt_"ColumnsJSON"_qt_":"_qt_..EscapeJSON($lg(td,5))_qt_","
        _qt_"ConditionsJSON"_qt_":"_qt_..EscapeJSON($lg(td,6))_qt_","
        _qt_"IsDefault"_qt_":"_qt_$lg(td,7)_qt_","
        _qt_"IsActive"_qt_":"_qt_$lg(td,8)_qt_
        "}"
}

}
