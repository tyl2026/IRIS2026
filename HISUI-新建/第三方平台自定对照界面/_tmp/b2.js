
/* ---------- 极简 jQuery 兜底（无网络时） ---------- */
if (typeof jQuery === 'undefined') {
    document.documentElement.innerHTML = '<body style="padding:40px;font-family:Microsoft Yahei">'
        + '<h2 style="color:#15428b">离线预览需要 jQuery</h2>'
        + '<p>请联网后刷新本页（会自动从 CDN 加载 jQuery 1.11），或把 jquery-1.11.3.min.js 放到本目录并修改预览页引用。</p></body>';
    throw new Error('jQuery missing');
}

/* ---------- 模拟后端数据 ---------- */
var MOCK = {"domains": [{"code": "GB/T 3304-1991", "name": "中国各民族名称罗马字母拼音写法和代码", "chap": "国家标准代码", "cnt": 58}, {"code": "GB/T 16835-1997", "name": "高等学校本科、专科专业名称代码", "chap": "国家标准代码", "cnt": 30}, {"code": "GB/T 2261.1-2003", "name": "性别代码", "chap": "国家标准代码", "cnt": 4}, {"code": "GB/T 2261.2-2003", "name": "婚姻状况类别代码", "chap": "国家标准代码", "cnt": 8}, {"code": "GB/T 2659-2000", "name": "国籍代码", "chap": "国家标准代码", "cnt": 239}, {"code": "GB/T 4658-2006", "name": "学历代码", "chap": "国家标准代码", "cnt": 40}, {"code": "GB/T 8561-2001", "name": "专业技术职务代码", "chap": "国家标准代码", "cnt": 295}, {"code": "GB/T 12407-2008", "name": "职务级别代码", "chap": "国家标准代码", "cnt": 35}, {"code": "GB/T 2260-2007", "name": "行政区划代码", "chap": "国家标准代码", "cnt": 3236}, {"code": "GB/T 4761-2008", "name": "联系人关系", "chap": "国家标准代码", "cnt": 9}, {"code": "GB/T 12404-1997", "name": "单位隶属关系代码", "chap": "国家标准代码", "cnt": 12}, {"code": "GBT6864_2003", "name": "学位代码", "chap": "国家标准代码", "cnt": 56}, {"code": "GB/T 16751.3-2023", "name": "中医临床诊疗术语 第3部分：治法", "chap": "国家标准代码", "cnt": 1168}, {"code": "GB/T 6565-2015", "name": "职业类别代码", "chap": "国家标准代码", "cnt": 511}, {"code": "CS03.01.026", "name": "剂型代码表", "chap": "行业标准代码", "cnt": 79}, {"code": "CV02.01.202", "name": "患者职业代码表", "chap": "行业标准代码", "cnt": 18}, {"code": "CV05.10.012", "name": "随访评价结果代码", "chap": "行业标准代码", "cnt": 4}, {"code": "CV06.00.207", "name": "随访方式代码", "chap": "行业标准代码", "cnt": 6}, {"code": "CV09.00.404", "name": "患者类型代码表", "chap": "行业标准代码", "cnt": 4}, {"code": "CV04.01.007", "name": "疑似结核患者症状代码表", "chap": "行业标准代码", "cnt": 4}, {"code": "CV04.01.009", "name": "精神症状代码表", "chap": "行业标准代码", "cnt": 12}, {"code": "CV04.10.015", "name": "足背动脉搏动代码表", "chap": "行业标准代码", "cnt": 4}, {"code": "CV07.10.003", "name": "医疗费用支付方式", "chap": "行业标准代码", "cnt": 13}, {"code": "CV05.10.001", "name": "残疾情况代码表", "chap": "行业标准代码", "cnt": 8}, {"code": "CV5101.27", "name": "症状代码(健康检查)", "chap": "行业标准代码", "cnt": 27}, {"code": "CV04.01.013", "name": "老年人健康状态自我评估代码表", "chap": "行业标准代码", "cnt": 5}, {"code": "CV04.01.014", "name": "老年人生活自理能力自我评估代码表", "chap": "行业标准代码", "cnt": 4}, {"code": "CV06.00.101", "name": "中药使用类别代码表", "chap": "行业标准代码", "cnt": 4}, {"code": "WS 218-2002", "name": "卫生机构（组织）分类与代码", "chap": "行业标准代码", "cnt": 257}, {"code": "CV03.00.107", "name": "饮食习惯代码表", "chap": "行业标准代码", "cnt": 6}, {"code": "CV06.00.226", "name": "离院方式代码表", "chap": "行业标准代码", "cnt": 6}, {"code": "CV03.00.105", "name": "饮酒种类代码表", "chap": "行业标准代码", "cnt": 7}, {"code": "CV04.10.007", "name": "口唇外观代码表", "chap": "行业标准代码", "cnt": 6}, {"code": "CV04.10.010", "name": "齿列类别代码表", "chap": "行业标准代码", "cnt": 4}, {"code": "CV04.10.004", "name": "皮肤检查结果代码表", "chap": "行业标准代码", "cnt": 9}, {"code": "CV04.10.006", "name": "巩膜检查结果代码", "chap": "行业标准代码", "cnt": 4}, {"code": "CV04.10.011", "name": "淋巴结检查结果代码", "chap": "行业标准代码", "cnt": 4}, {"code": "CV04.10.014", "name": "下肢水肿检查结果代码", "chap": "行业标准代码", "cnt": 4}, {"code": "CV04.10.013", "name": "肛门指诊检查结果代码表", "chap": "行业标准代码", "cnt": 5}, {"code": "CV04.10.012", "name": "乳腺检查结果代码表", "chap": "行业标准代码", "cnt": 7}, {"code": "CV04.50.005", "name": "ABO血型代码", "chap": "行业标准代码", "cnt": 6}, {"code": "CV03.00.301", "name": "环境危险因素暴露类别代码表", "chap": "行业标准代码", "cnt": 6}, {"code": "CV06.00.229", "name": "医嘱项目类型代码", "chap": "行业标准代码", "cnt": 9}, {"code": "CV05.10.022", "name": "手术切口类别代码", "chap": "行业标准代码", "cnt": 4}, {"code": "CV05.10.010", "name": "病情转归代码表", "chap": "行业标准代码", "cnt": 9}, {"code": "CV06.00.227", "name": "操作部位代码表", "chap": "行业标准代码", "cnt": 49}, {"code": "CV06.00.103", "name": "麻醉方法代码表", "chap": "行业标准代码", "cnt": 26}, {"code": "CV02.01.102", "name": "出生(分娩)地点类别代码", "chap": "行业标准代码", "cnt": 9}, {"code": "CV02.01.201", "name": "血缘关系代码", "chap": "行业标准代码", "cnt": 6}, {"code": "CV5501.14", "name": "手术切口愈合等级", "chap": "行业标准代码", "cnt": 17}, {"code": "CV04.50.019", "name": "阴道分泌物检查结果代码表", "chap": "行业标准代码", "cnt": 4}, {"code": "CV04.50.010", "name": "阴道分泌物清洁度代码", "chap": "行业标准代码", "cnt": 4}, {"code": "CV05.10.006", "name": "儿童生长发育评价结果代码", "chap": "行业标准代码", "cnt": 7}, {"code": "CV04.10.021", "name": "可疑佝偻病症状代码", "chap": "行业标准代码", "cnt": 5}, {"code": "CV06.00.217", "name": "儿童健康指导类别代码", "chap": "行业标准代码", "cnt": 7}, {"code": "CV04.50.006", "name": "采血方式代码", "chap": "行业标准代码", "cnt": 5}, {"code": "CV04.50.007", "name": "采血部位代码", "chap": "行业标准代码", "cnt": 7}, {"code": "CV04.50.009", "name": "新生儿疾病筛查方法代码", "chap": "行业标准代码", "cnt": 7}, {"code": "CV09.00.301", "name": "检查结果通知形式代码表", "chap": "行业标准代码", "cnt": 6}, {"code": "CV05.01.039", "name": "5岁以下儿童死因分类代码", "chap": "行业标准代码", "cnt": 35}, {"code": "CV5502.20", "name": "疾病诊断类别代码", "chap": "行业标准代码", "cnt": 14}, {"code": "CV5502.21", "name": "中医疾病诊断类别代码", "chap": "行业标准代码", "cnt": 6}, {"code": "CV08.10.004", "name": "主要致死疾病的最高诊断机构级别代码", "chap": "行业标准代码", "cnt": 8}, {"code": "CV05.10.015", "name": "5岁以下儿童未治疗或未就医原因代码表", "chap": "行业标准代码", "cnt": 6}, {"code": "CV05.01.037", "name": "死亡最高诊断依据类别代码", "chap": "行业标准代码", "cnt": 7}, {"code": "CV04.10.001", "name": "附件检查结果代码", "chap": "行业标准代码", "cnt": 6}, {"code": "CV04.10.003", "name": "妇科检查方式代码", "chap": "行业标准代码", "cnt": 6}, {"code": "CV05.10.005", "name": "婚前医学检查结果代码", "chap": "行业标准代码", "cnt": 5}, {"code": "CV06.00.210", "name": "婚检医学意见代码", "chap": "行业标准代码", "cnt": 5}, {"code": "CV02.10.002", "name": "妊娠终止方式代码", "chap": "行业标准代码", "cnt": 17}, {"code": "CV04.01.001", "name": "妇科及乳腺不适症状代码", "chap": "行业标准代码", "cnt": 16}, {"code": "CV06.00.104", "name": "宫内节育器放置时期代码", "chap": "行业标准代码", "cnt": 10}, {"code": "CV08.50.101", "name": "宫内节育器种类代码", "chap": "行业标准代码", "cnt": 9}, {"code": "CV06.00.105", "name": "皮下埋植剂埋植时期代码", "chap": "行业标准代码", "cnt": 4}, {"code": "CV06.00.106", "name": "输卵管结扎手术方式代码", "chap": "行业标准代码", "cnt": 4}, {"code": "CV06.00.107", "name": "输卵管结扎部位代码", "chap": "行业标准代码", "cnt": 5}, {"code": "CV04.10.002", "name": "子宫大小代码", "chap": "行业标准代码", "cnt": 4}, {"code": "CV02.10.005", "name": "既往常见疾病种类代码表", "chap": "行业标准代码", "cnt": 20}, {"code": "CV03.00.403", "name": "接触有害因素类别代码表", "chap": "行业标准代码", "cnt": 12}, {"code": "CV05.01.007", "name": "胎方位代码表", "chap": "行业标准代码", "cnt": 23}, {"code": "CV04.50.015", "name": "尿实验室定性检测结果代码", "chap": "行业标准代码", "cnt": 7}, {"code": "CV06.00.219", "name": "孕产妇健康指导类别代码", "chap": "行业标准代码", "cnt": 14}, {"code": "CV05.01.010", "name": "会阴裂伤情况代码表", "chap": "行业标准代码", "cnt": 5}, {"code": "CV05.01.009", "name": "产时并发症代码表", "chap": "行业标准代码", "cnt": 11}, {"code": "CV06.00.108", "name": "新生儿抢救方法代码", "chap": "行业标准代码", "cnt": 7}, {"code": "CV05.01.013", "name": "新生儿并发症代码表", "chap": "行业标准代码", "cnt": 14}, {"code": "CV05.01.011", "name": "伤口愈合状况代码表", "chap": "行业标准代码", "cnt": 4}, {"code": "CV04.50.008", "name": "新生儿疾病筛查项目代码", "chap": "行业标准代码", "cnt": 7}, {"code": "CV04.01.012", "name": "儿童大便性状代码", "chap": "行业标准代码", "cnt": 13}, {"code": "CV04.10.008", "name": "儿童面色代码", "chap": "行业标准代码", "cnt": 6}, {"code": "CV04.10.009", "name": "黄疸部位代码", "chap": "行业标准代码", "cnt": 6}, {"code": "CV04.10.018", "name": "前囱张力代码表", "chap": "行业标准代码", "cnt": 4}, {"code": "CV04.10.019", "name": "脐带检查结果代码", "chap": "行业标准代码", "cnt": 4}, {"code": "CV03.00.401", "name": "孕早期服药类别代码", "chap": "行业标准代码", "cnt": 5}, {"code": "CV02.10.001", "name": "家族近亲婚配者与本人关系代码", "chap": "行业标准代码", "cnt": 4}, {"code": "CV08.30.004", "name": "助产人员类别代码表", "chap": "行业标准代码", "cnt": 4}, {"code": "CV05.10.016", "name": "影响孕产妇死亡的主要因素代码表", "chap": "行业标准代码", "cnt": 22}, {"code": "CV06.00.211", "name": "避孕方式代码", "chap": "行业标准代码", "cnt": 9}, {"code": "CV03.00.104", "name": "饮酒频率代码表", "chap": "行业标准代码", "cnt": 9}, {"code": "CV08.50.001", "name": "疫苗名称代码表", "chap": "行业标准代码", "cnt": 49}, {"code": "CV02.10.003", "name": "分娩方式代码", "chap": "行业标准代码", "cnt": 12}, {"code": "CV02.10.004", "name": "出生缺陷儿结局代码", "chap": "行业标准代码", "cnt": 7}, {"code": "CV05.01.014", "name": "出生缺陷诊断依据代码表", "chap": "行业标准代码", "cnt": 9}, {"code": "CV05.01.015", "name": "出生缺陷确诊时间类别代码表", "chap": "行业标准代码", "cnt": 5}, {"code": "CV05.01.016", "name": "出生缺陷类别代码表", "chap": "行业标准代码", "cnt": 39}, {"code": "CV05.01.005", "name": "中医体质分类代码表", "chap": "行业标准代码", "cnt": 10}, {"code": "CV04.50.011", "name": "阴道细胞学诊断结果代码表", "chap": "行业标准代码", "cnt": 22}, {"code": "CV04.10.020", "name": "儿童体格发育评价代码表", "chap": "行业标准代码", "cnt": 6}, {"code": "CV04.10.022", "name": "可疑佝偻病体征代码", "chap": "行业标准代码", "cnt": 10}, {"code": "CV05.10.007", "name": "儿童体弱原因类别代码表", "chap": "行业标准代码", "cnt": 8}, {"code": "CV02.01.212", "name": "户籍类型代码表", "chap": "行业标准代码", "cnt": 4}, {"code": "CV03.00.402", "name": "孕产期高危因素代码表", "chap": "行业标准代码", "cnt": 66}, {"code": "CV02.01.203", "name": "家庭年人均收入代码表", "chap": "行业标准代码", "cnt": 5}, {"code": "CV05.01.006", "name": "孕产妇死亡根本死因分类代码表", "chap": "行业标准代码", "cnt": 44}, {"code": "CV04.30.109", "name": "宫颈组织病理学检查结果代码表", "chap": "行业标准代码", "cnt": 12}, {"code": "CV5301.06", "name": "药物类型代码", "chap": "行业标准代码", "cnt": 182}, {"code": "CV05.01.026", "name": "肿瘤临床分期代码表", "chap": "行业标准代码", "cnt": 6}, {"code": "CV06.00.223", "name": "手术体位代码", "chap": "行业标准代码", "cnt": 7}, {"code": "WS 445.5-2014", "name": "美国麻醉医师学会(ASA)分级标准代码表", "chap": "行业标准代码", "cnt": 5}, {"code": "LY.00.1", "name": "消息类型", "chap": "自定义值域代码", "cnt": 5}, {"code": "LY.00.2", "name": "发货类型", "chap": "自定义值域代码", "cnt": 13}, {"code": "LY.00.3", "name": "药品分类代码", "chap": "自定义值域代码", "cnt": 8}, {"code": "LY.00.4", "name": "监测点类型", "chap": "自定义值域代码", "cnt": 5}, {"code": "LY.00.5", "name": "特殊药品标志", "chap": "自定义值域代码", "cnt": 7}, {"code": "LY.00.6", "name": "收货类型", "chap": "自定义值域代码", "cnt": 9}, {"code": "LY.00.12", "name": "中医药健康指导代码", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.17", "name": "危害行为代码", "chap": "自定义值域代码", "cnt": 7}, {"code": "LY.00.19", "name": "随访类型代码", "chap": "自定义值域代码", "cnt": 12}, {"code": "LY.00.20", "name": "高危因素代码", "chap": "自定义值域代码", "cnt": 73}, {"code": "LY.00.26", "name": "死亡原因", "chap": "自定义值域代码", "cnt": 14}, {"code": "LY.00.31", "name": "本次随访分类编码", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.36", "name": "妊娠期患病情况代码", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.37", "name": "治疗效果", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.38", "name": "出生地点", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.39", "name": "医保区划数据来源", "chap": "自定义值域代码", "cnt": 5}, {"code": "LY.00.40", "name": "公务员等级", "chap": "自定义值域代码", "cnt": 12}, {"code": "LY.00.41", "name": "手术级别", "chap": "自定义值域代码", "cnt": 6}, {"code": "LY.00.42", "name": "药物过敏史代码", "chap": "自定义值域代码", "cnt": 5}, {"code": "LY.00.46", "name": "隶属关系", "chap": "自定义值域代码", "cnt": 15}, {"code": "LY.00.47", "name": "所属行业", "chap": "自定义值域代码", "cnt": 114}, {"code": "LY.00.48", "name": "计划生育类别", "chap": "自定义值域代码", "cnt": 150}, {"code": "LY.00.49", "name": "生育类别", "chap": "自定义值域代码", "cnt": 26}, {"code": "LY.00.50", "name": "药物使用频次代码表", "chap": "自定义值域代码", "cnt": 34}, {"code": "LY.00.51", "name": "卫生监督诊疗科目代码", "chap": "自定义值域代码", "cnt": 225}, {"code": "LY.00.52", "name": "二级清算类别", "chap": "自定义值域代码", "cnt": 219}, {"code": "LY.00.53", "name": "药品剂型", "chap": "自定义值域代码", "cnt": 289}, {"code": "LY.00.54", "name": "医疗收费项目类别", "chap": "自定义值域代码", "cnt": 137}, {"code": "LY.00.55", "name": "医疗类别", "chap": "自定义值域代码", "cnt": 107}, {"code": "LY.00.57", "name": "特殊人员类型等级", "chap": "自定义值域代码", "cnt": 9}, {"code": "LY.00.58", "name": "包装材质", "chap": "自定义值域代码", "cnt": 114}, {"code": "LY.00.59", "name": "包装规格", "chap": "自定义值域代码", "cnt": 35}, {"code": "LY.00.60", "name": "医保人员类别", "chap": "自定义值域代码", "cnt": 57}, {"code": "LY.00.61", "name": "药理分类", "chap": "自定义值域代码", "cnt": 1309}, {"code": "LY.00.62", "name": "基金支付类型", "chap": "自定义值域代码", "cnt": 81}, {"code": "LY.00.63", "name": "险种类型", "chap": "自定义值域代码", "cnt": 20}, {"code": "LY.00.64", "name": "最小包装单位", "chap": "自定义值域代码", "cnt": 19}, {"code": "LY.00.65", "name": "最小计量单位", "chap": "自定义值域代码", "cnt": 18}, {"code": "LY.00.66", "name": "服务项目类别", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.67", "name": "医院等级", "chap": "自定义值域代码", "cnt": 14}, {"code": "LY.00.68", "name": "经济类型", "chap": "自定义值域代码", "cnt": 34}, {"code": "LY.00.69", "name": "单位管理类型", "chap": "自定义值域代码", "cnt": 31}, {"code": "LY.00.70", "name": "医保单位类型", "chap": "自定义值域代码", "cnt": 66}, {"code": "LY.00.71", "name": "院内人员类别", "chap": "自定义值域代码", "cnt": 6}, {"code": "LY.00.72", "name": "目录特项标志", "chap": "自定义值域代码", "cnt": 18}, {"code": "LY.00.73", "name": "目录类别", "chap": "自定义值域代码", "cnt": 9}, {"code": "LY.00.75", "name": "医保区划级别", "chap": "自定义值域代码", "cnt": 7}, {"code": "LY.00.76", "name": "代办人关系", "chap": "自定义值域代码", "cnt": 8}, {"code": "LY.00.77", "name": "复核标志", "chap": "自定义值域代码", "cnt": 14}, {"code": "LY.00.78", "name": "异地安置类别", "chap": "自定义值域代码", "cnt": 7}, {"code": "LY.00.79", "name": "给药途径", "chap": "自定义值域代码", "cnt": 26}, {"code": "LY.00.80", "name": "支付地点类别", "chap": "自定义值域代码", "cnt": 6}, {"code": "LY.00.81", "name": "支付结果分类", "chap": "自定义值域代码", "cnt": 5}, {"code": "LY.00.82", "name": "医疗机构等级", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.83", "name": "信用等级", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.84", "name": "申报来源", "chap": "自定义值域代码", "cnt": 9}, {"code": "LY.00.85", "name": "起付线医院等级", "chap": "自定义值域代码", "cnt": 6}, {"code": "LY.00.86", "name": "医保诊断类别", "chap": "自定义值域代码", "cnt": 5}, {"code": "LY.00.87", "name": "病种类型代码", "chap": "自定义值域代码", "cnt": 9}, {"code": "LY.00.88", "name": "企业性质", "chap": "自定义值域代码", "cnt": 9}, {"code": "LY.00.89", "name": "企业类型", "chap": "自定义值域代码", "cnt": 7}, {"code": "LY.00.90", "name": "医疗机构的机构性质", "chap": "自定义值域代码", "cnt": 6}, {"code": "LY.00.91", "name": "医疗服务机构类型", "chap": "自定义值域代码", "cnt": 258}, {"code": "LY.00.92", "name": "医师执业类别", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.93", "name": "药师执业类别", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.95", "name": "医师执业范围", "chap": "自定义值域代码", "cnt": 28}, {"code": "LY.00.96", "name": "药师执业范围", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.97", "name": "人员证件类型", "chap": "自定义值域代码", "cnt": 22}, {"code": "LY.00.98", "name": "支付方式", "chap": "自定义值域代码", "cnt": 5}, {"code": "LY.00.99", "name": "个人结算方式", "chap": "自定义值域代码", "cnt": 14}, {"code": "LY.00.100", "name": "清算方式", "chap": "自定义值域代码", "cnt": 43}, {"code": "LY.00.101", "name": "清算类别", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.102", "name": "零星报销原因", "chap": "自定义值域代码", "cnt": 31}, {"code": "LY.00.103", "name": "学校类型", "chap": "自定义值域代码", "cnt": 23}, {"code": "LY.00.104", "name": "学校性质", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.105", "name": "结算类型", "chap": "自定义值域代码", "cnt": 6}, {"code": "LY.00.106", "name": "生产地类别", "chap": "自定义值域代码", "cnt": 2}, {"code": "LY.00.107", "name": "检查类型", "chap": "自定义值域代码", "cnt": 10}, {"code": "LY.00.108", "name": "医院医疗专业设备编码目录", "chap": "自定义值域代码", "cnt": 39}, {"code": "LY.00.109", "name": "医嘱大类", "chap": "自定义值域代码", "cnt": 28}, {"code": "LY.00.110", "name": "医嘱子类", "chap": "自定义值域代码", "cnt": 235}, {"code": "LY.00.117", "name": "入院途径", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.120", "name": "预约途径", "chap": "自定义值域代码", "cnt": 6}, {"code": "LY.00.125", "name": "手术类型", "chap": "自定义值域代码", "cnt": 6}, {"code": "LY.00.126", "name": "症状代码2", "chap": "自定义值域代码", "cnt": 7}, {"code": "LY.00.133", "name": "治疗类别", "chap": "自定义值域代码", "cnt": 5}, {"code": "LY.00.135", "name": "体质辨识情况", "chap": "自定义值域代码", "cnt": 5}, {"code": "LY.00.144", "name": "肿块（右）大小编码", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.146", "name": "肿块（右）活动度编码", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.152", "name": "子宫临床表现代码", "chap": "自定义值域代码", "cnt": 13}, {"code": "LY.00.153", "name": "组织病理学诊断代码", "chap": "自定义值域代码", "cnt": 8}, {"code": "LY.00.154", "name": "调动情况代码", "chap": "自定义值域代码", "cnt": 14}, {"code": "LY.00.156", "name": "行政/业务管理职务代码", "chap": "自定义值域代码", "cnt": 6}, {"code": "LY.00.161", "name": "标本类型", "chap": "自定义值域代码", "cnt": 157}, {"code": "LY.00.166", "name": "处方类别", "chap": "自定义值域代码", "cnt": 6}, {"code": "LY.00.181", "name": "就诊类型", "chap": "自定义值域代码", "cnt": 6}, {"code": "LY.00.182", "name": "就诊类型标志（用于区分就诊业务）", "chap": "自定义值域代码", "cnt": 9}, {"code": "LY.00.183", "name": "就诊类型标志（用于区分住院就诊业务类型）", "chap": "自定义值域代码", "cnt": 5}, {"code": "LY.00.198", "name": "妊娠结局类别代码", "chap": "自定义值域代码", "cnt": 9}, {"code": "LY.00.200", "name": "压力类别代码表", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.201", "name": "男科疾病类别代码表", "chap": "自定义值域代码", "cnt": 5}, {"code": "LY.00.202", "name": "智力异常类别代码表", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.203", "name": "睾丸检查结果类别代码表", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.204", "name": "服用叶酸开始时间类别代码表", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.205", "name": "停经后患有具体症状或疾病类别代码表", "chap": "自定义值域代码", "cnt": 7}, {"code": "LY.00.206", "name": "确认早孕结果的机构类别代码表", "chap": "自定义值域代码", "cnt": 8}, {"code": "LY.00.207", "name": "尿妊娠试验和B超检查结果类别代码表", "chap": "自定义值域代码", "cnt": 5}, {"code": "LY.00.208", "name": "婴儿 42 天存活状况类别代码表", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.209", "name": "孕早期患病情况类别代码表", "chap": "自定义值域代码", "cnt": 5}, {"code": "LY.00.210", "name": "诊断出生缺陷儿级别的类别代码表", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.211", "name": "麻醉精神类药品标志", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.231", "name": "用药依从性代码", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.233", "name": "糖尿病症状编码", "chap": "自定义值域代码", "cnt": 10}, {"code": "LY.00.234", "name": "传染病代码", "chap": "自定义值域代码", "cnt": 55}, {"code": "LY.00.235", "name": "处方类型", "chap": "自定义值域代码", "cnt": 5}, {"code": "LY.00.236", "name": "标本代码", "chap": "自定义值域代码", "cnt": 47}, {"code": "LY.00.237", "name": "报告单类别代码", "chap": "自定义值域代码", "cnt": 8}, {"code": "LY.00.238", "name": "检查部位代码", "chap": "自定义值域代码", "cnt": 9}, {"code": "LY.00.239", "name": "检验结果代码", "chap": "自定义值域代码", "cnt": 6}, {"code": "LY.00.240", "name": "检验检查异常提示代码", "chap": "自定义值域代码", "cnt": 9}, {"code": "LY.00.241", "name": "检验检查就诊卡类型代码", "chap": "自定义值域代码", "cnt": 6}, {"code": "LY.00.242", "name": "外地标志", "chap": "自定义值域代码", "cnt": 5}, {"code": "LY.00.243", "name": "急诊分级", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.244", "name": "儿童营养性疾病因素类别代码表", "chap": "自定义值域代码", "cnt": 5}, {"code": "LY.00.245", "name": "医疗卡类型", "chap": "自定义值域代码", "cnt": 10}, {"code": "LY.00.246", "name": "急诊患者去向", "chap": "自定义值域代码", "cnt": 8}, {"code": "LY.00.247", "name": "医学影像检查结果互认项目", "chap": "自定义值域代码", "cnt": 100}, {"code": "LY.00.248", "name": "医院性质", "chap": "自定义值域代码", "cnt": 6}, {"code": "LY.00.249", "name": "传染病疾病编码", "chap": "自定义值域代码", "cnt": 187}, {"code": "LY.00.250", "name": "Rh血型", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.252", "name": "法定传染病分类", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.253", "name": "实施DRGs管理", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.254", "name": "入院病情代码", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.255", "name": "病例首页费用分类", "chap": "自定义值域代码", "cnt": 28}, {"code": "LY.00.256", "name": "处方类型代码表", "chap": "自定义值域代码", "cnt": 10}, {"code": "LY.00.257", "name": "医嘱项目类别代码", "chap": "自定义值域代码", "cnt": 22}, {"code": "LY.00.258", "name": "中药煎煮法代码", "chap": "自定义值域代码", "cnt": 8}, {"code": "LY.00.259", "name": "患者就诊来源", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.260", "name": "医嘱状态代码", "chap": "自定义值域代码", "cnt": 7}, {"code": "LY.00.261", "name": "执行周期时间单位代码", "chap": "自定义值域代码", "cnt": 6}, {"code": "LY.00.262", "name": "药物分类代码", "chap": "自定义值域代码", "cnt": 6}, {"code": "LY.00.263", "name": "不良事件类别代码", "chap": "自定义值域代码", "cnt": 51}, {"code": "LY.00.264", "name": "事件发生等级代码（不良事件)", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.265", "name": "临床研究分类代码（不良事件）", "chap": "自定义值域代码", "cnt": 6}, {"code": "LY.00.266", "name": "SAE情况代码（不良事件）", "chap": "自定义值域代码", "cnt": 8}, {"code": "LY.00.267", "name": "对试验用药采取的措施代码（不良事件）", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.268", "name": "SAE与实验药的关系代码（不良事件）", "chap": "自定义值域代码", "cnt": 5}, {"code": "LY.00.269", "name": "事件发生场所代码（不良事件）", "chap": "自定义值域代码", "cnt": 6}, {"code": "LY.00.270", "name": "不良事件结果代码", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.271", "name": "停药或减量后反应状态代码", "chap": "自定义值域代码", "cnt": 5}, {"code": "LY.00.272", "name": "生产企业信息来源代码", "chap": "自定义值域代码", "cnt": 6}, {"code": "LY.00.273", "name": "出入库方式", "chap": "自定义值域代码", "cnt": 8}, {"code": "LY.00.274", "name": "处方点评状态", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.275", "name": "挂号类别", "chap": "自定义值域代码", "cnt": 6}, {"code": "LY.00.276", "name": "重症标识", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.277", "name": "药物剂量单位代码", "chap": "自定义值域代码", "cnt": 9}, {"code": "LY.00.278", "name": "检验定性结果", "chap": "自定义值域代码", "cnt": 20}, {"code": "LY.00.279", "name": "密级", "chap": "自定义值域代码", "cnt": 12}, {"code": "LY.00.280", "name": "预约状态", "chap": "自定义值域代码", "cnt": 6}, {"code": "LY.00.281", "name": "支付状态", "chap": "自定义值域代码", "cnt": 7}, {"code": "LY.00.282", "name": "麻醉反应标志", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.283", "name": "治疗类型", "chap": "自定义值域代码", "cnt": 5}, {"code": "LY.00.284", "name": "治疗状态", "chap": "自定义值域代码", "cnt": 5}, {"code": "LY.00.285", "name": "治疗效果", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.286", "name": "评估状态", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.287", "name": "卒中治疗类型", "chap": "自定义值域代码", "cnt": 5}, {"code": "LY.00.288", "name": "静脉溶栓药物", "chap": "自定义值域代码", "cnt": 7}, {"code": "LY.00.289", "name": "溶栓并发症", "chap": "自定义值域代码", "cnt": 6}, {"code": "LY.00.290", "name": "血管内开通方法", "chap": "自定义值域代码", "cnt": 6}, {"code": "LY.00.291", "name": "血管内开通治疗手术并发症", "chap": "自定义值域代码", "cnt": 9}, {"code": "LY.00.292", "name": "未溶栓原因", "chap": "自定义值域代码", "cnt": 5}, {"code": "LY.00.293", "name": "开始静脉溶栓场所", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.294", "name": "院前意识", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.295", "name": "卒中出血部位", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.296", "name": "来院方式", "chap": "自定义值域代码", "cnt": 8}, {"code": "LY.00.297", "name": "胸痛-病情评估-详情", "chap": "自定义值域代码", "cnt": 15}, {"code": "LY.00.298", "name": "护理等级", "chap": "自定义值域代码", "cnt": 4}, {"code": "LY.00.299", "name": "饮食指导", "chap": "自定义值域代码", "cnt": 10}, {"code": "LY.00.300", "name": "隔离种类", "chap": "自定义值域代码", "cnt": 7}, {"code": "LY.00.301", "name": "输血品种代码", "chap": "自定义值域代码", "cnt": 28}, {"code": "LY.00.302", "name": "输血反应类型", "chap": "自定义值域代码", "cnt": 6}, {"code": "LY.00.303", "name": "发生区域", "chap": "自定义值域代码", "cnt": 9}, {"code": "LY.00.304", "name": "相关因素类别", "chap": "自定义值域代码", "cnt": 6}, {"code": "LY.00.305", "name": "分娩方式", "chap": "自定义值域代码", "cnt": 6}, {"code": "LY.00.306", "name": "手术指征", "chap": "自定义值域代码", "cnt": 20}, {"code": "LY.00.307", "name": "分娩结局", "chap": "自定义值域代码", "cnt": 5}], "items": {"GB/T 3304-1991": [{"code": "01", "name": "汉族", "memo": ""}, {"code": "02", "name": "蒙古族", "memo": ""}, {"code": "03", "name": "回族", "memo": ""}, {"code": "04", "name": "藏族", "memo": ""}, {"code": "05", "name": "维吾尔族", "memo": ""}, {"code": "06", "name": "苗族", "memo": ""}, {"code": "07", "name": "彝族", "memo": ""}, {"code": "08", "name": "壮族", "memo": ""}, {"code": "09", "name": "布依族", "memo": ""}, {"code": "10", "name": "朝鲜族", "memo": ""}, {"code": "11", "name": "满族", "memo": ""}, {"code": "12", "name": "侗族", "memo": ""}, {"code": "13", "name": "瑶族", "memo": ""}, {"code": "14", "name": "白族", "memo": ""}, {"code": "15", "name": "土家族", "memo": ""}, {"code": "16", "name": "哈尼族", "memo": ""}, {"code": "17", "name": "哈萨克族", "memo": ""}, {"code": "18", "name": "傣族", "memo": ""}, {"code": "19", "name": "黎族", "memo": ""}, {"code": "20", "name": "傈僳族", "memo": ""}, {"code": "21", "name": "佤族", "memo": ""}, {"code": "22", "name": "畲族", "memo": ""}, {"code": "23", "name": "高山族", "memo": ""}, {"code": "24", "name": "拉祜族", "memo": ""}, {"code": "25", "name": "水族", "memo": ""}, {"code": "26", "name": "东乡族", "memo": ""}, {"code": "27", "name": "纳西族", "memo": ""}, {"code": "28", "name": "景颇族", "memo": ""}, {"code": "29", "name": "柯尔克孜族", "memo": ""}, {"code": "30", "name": "土族", "memo": ""}, {"code": "31", "name": "达斡尔族", "memo": ""}, {"code": "32", "name": "仫佬族", "memo": ""}, {"code": "33", "name": "羌族", "memo": ""}, {"code": "34", "name": "布朗族", "memo": ""}, {"code": "35", "name": "撒拉族", "memo": ""}, {"code": "36", "name": "毛南族", "memo": ""}, {"code": "37", "name": "仡佬族", "memo": ""}, {"code": "38", "name": "锡伯族", "memo": ""}, {"code": "39", "name": "阿昌族", "memo": ""}, {"code": "40", "name": "普米族", "memo": ""}, {"code": "41", "name": "塔吉克族", "memo": ""}, {"code": "42", "name": "怒族", "memo": ""}, {"code": "43", "name": "乌孜别克族", "memo": ""}, {"code": "44", "name": "俄罗斯族", "memo": ""}, {"code": "45", "name": "鄂温克族", "memo": ""}, {"code": "46", "name": "德昂族", "memo": ""}, {"code": "47", "name": "保安族", "memo": ""}, {"code": "48", "name": "裕固族", "memo": ""}, {"code": "49", "name": "京族", "memo": ""}, {"code": "50", "name": "塔塔尔族", "memo": ""}, {"code": "51", "name": "独龙族", "memo": ""}, {"code": "52", "name": "鄂伦春族", "memo": ""}, {"code": "53", "name": "赫哲族", "memo": ""}, {"code": "54", "name": "门巴族", "memo": ""}, {"code": "55", "name": "珞巴族", "memo": ""}, {"code": "56", "name": "基诺族", "memo": ""}, {"code": "99", "name": "未说明", "memo": ""}, {"code": "66", "name": "外籍人士", "memo": ""}], "GB/T 2261.1-2003": [{"code": "0", "name": "未知的性别", "memo": ""}, {"code": "1", "name": "男性", "memo": ""}, {"code": "2", "name": "女性", "memo": ""}, {"code": "9", "name": "未说明的性别", "memo": ""}], "GB/T 2261.2-2003": [{"code": "10", "name": "未婚", "memo": ""}, {"code": "20", "name": "已婚", "memo": ""}, {"code": "21", "name": "初婚", "memo": ""}, {"code": "22", "name": "再婚", "memo": ""}, {"code": "23", "name": "复婚", "memo": ""}, {"code": "30", "name": "丧偶", "memo": ""}, {"code": "40", "name": "离婚", "memo": ""}, {"code": "90", "name": "未说明的婚姻状况", "memo": ""}], "GB/T 4658-2006": [{"code": "10", "name": "研究生教育", "memo": ""}, {"code": "11", "name": "博士研究生毕业", "memo": ""}, {"code": "12", "name": "博士研究生结业", "memo": ""}, {"code": "13", "name": "博士研究生肄业", "memo": ""}, {"code": "14", "name": "硕士研究生毕业", "memo": ""}, {"code": "15", "name": "硕士研究生结业", "memo": ""}, {"code": "16", "name": "硕士研究生肄业", "memo": ""}, {"code": "17", "name": "研究生班毕业", "memo": ""}, {"code": "18", "name": "研究生班结业", "memo": ""}, {"code": "19", "name": "研究生班肄业", "memo": ""}, {"code": "20", "name": "大学本科", "memo": ""}, {"code": "21", "name": "大学本科毕业", "memo": ""}, {"code": "22", "name": "大学本科结业", "memo": ""}, {"code": "23", "name": "大学本科肄业", "memo": ""}, {"code": "28", "name": "大学普通班毕业", "memo": ""}, {"code": "30", "name": "专科教育", "memo": ""}, {"code": "31", "name": "大学专科毕业", "memo": ""}, {"code": "32", "name": "大学专科结业", "memo": ""}, {"code": "33", "name": "大学专科肄业", "memo": ""}, {"code": "40", "name": "中等职业教育", "memo": ""}, {"code": "41", "name": "中等专科毕业", "memo": ""}, {"code": "42", "name": "中等专科结业", "memo": ""}, {"code": "43", "name": "中等专科肄业", "memo": ""}, {"code": "44", "name": "职业高中毕业", "memo": ""}, {"code": "45", "name": "职业高中结业", "memo": ""}, {"code": "46", "name": "职业高中肄业", "memo": ""}, {"code": "47", "name": "技工学校毕业", "memo": ""}, {"code": "48", "name": "技工学校结业", "memo": ""}, {"code": "49", "name": "技工学校肄业", "memo": ""}, {"code": "60", "name": "普通高级中学教育", "memo": ""}, {"code": "61", "name": "普通高中毕业", "memo": ""}, {"code": "62", "name": "普通高中结业", "memo": ""}, {"code": "63", "name": "普通高中肄业", "memo": ""}, {"code": "70", "name": "初级中学教育", "memo": ""}, {"code": "71", "name": "初中毕业", "memo": ""}, {"code": "73", "name": "初中肄业", "memo": ""}, {"code": "80", "name": "小学教育", "memo": ""}, {"code": "81", "name": "小学毕业", "memo": ""}, {"code": "83", "name": "小学肄业", "memo": ""}, {"code": "90", "name": "其他", "memo": ""}], "CV02.01.202": [{"code": "1", "name": "幼托儿童", "memo": ""}, {"code": "2", "name": "散居儿童", "memo": ""}, {"code": "3", "name": "学生(大中小学)", "memo": ""}, {"code": "4", "name": "教室", "memo": ""}, {"code": "5", "name": "保育员及保姆", "memo": ""}, {"code": "6", "name": "餐饮食品业", "memo": ""}, {"code": "7", "name": "商业服务", "memo": ""}, {"code": "8", "name": "医务人员", "memo": ""}, {"code": "9", "name": "工人", "memo": ""}, {"code": "10", "name": "民工", "memo": ""}, {"code": "11", "name": "农民", "memo": ""}, {"code": "12", "name": "牧民", "memo": ""}, {"code": "13", "name": "渔（船）民", "memo": ""}, {"code": "14", "name": "干部职员", "memo": ""}, {"code": "15", "name": "离退人员", "memo": ""}, {"code": "16", "name": "家务及待业", "memo": ""}, {"code": "17", "name": "不详", "memo": ""}, {"code": "99", "name": "其他", "memo": ""}], "CV06.00.226": [{"code": "1", "name": "医嘱离院", "memo": ""}, {"code": "2", "name": "医嘱转院", "memo": ""}, {"code": "3", "name": "医嘱转社区卫生服务机构/乡镇卫生院", "memo": ""}, {"code": "4", "name": "非医嘱离院", "memo": ""}, {"code": "5", "name": "死亡", "memo": ""}, {"code": "9", "name": "其他", "memo": ""}], "CV05.10.022": [{"code": "1", "name": "0类切口", "memo": "有手术，但体表无切口或腔镜手术切口"}, {"code": "2", "name": "Ⅰ类切口", "memo": "无菌切口"}, {"code": "3", "name": "Ⅱ类切口", "memo": "沾染切口"}, {"code": "4", "name": "Ⅲ类切口", "memo": "感染切口"}], "CV06.00.217": [{"code": "1", "name": "科学喂养", "memo": "WS 364.12—2011"}, {"code": "2", "name": "合理膳食", "memo": "WS 364.12—2011"}, {"code": "3", "name": "生长发育", "memo": "WS 364.12—2011"}, {"code": "4", "name": "疾病预防", "memo": "WS 364.12—2011"}, {"code": "5", "name": "预防意外伤害", "memo": "WS 364.12—2011"}, {"code": "6", "name": "口腔保健", "memo": "WS 364.12—2011"}, {"code": "9", "name": "其他", "memo": "WS 364.12—2011"}], "LY.00.1": [{"code": "01", "name": "出库", "memo": ""}, {"code": "02", "name": "入库", "memo": ""}, {"code": "03", "name": "库存", "memo": ""}, {"code": "04", "name": "仓储", "memo": ""}, {"code": "05", "name": "冷链车/保温箱", "memo": ""}], "LY.00.2": [{"code": "01", "name": "销售出库", "memo": ""}, {"code": "02", "name": "供应出库", "memo": ""}, {"code": "03", "name": "盘亏出库", "memo": ""}, {"code": "04", "name": "退货出库", "memo": ""}, {"code": "05", "name": "抽检出库", "memo": ""}, {"code": "06", "name": "调拨出库", "memo": ""}, {"code": "07", "name": "销毁出库", "memo": ""}, {"code": "08", "name": "赠品出库", "memo": ""}, {"code": "09", "name": "使用出库", "memo": ""}, {"code": "10", "name": "召回出库", "memo": ""}, {"code": "11", "name": "损坏出库", "memo": ""}, {"code": "12", "name": "报废出库", "memo": ""}, {"code": "99", "name": "其他", "memo": ""}], "LY.00.41": [{"code": "01", "name": "一级", "memo": ""}, {"code": "02", "name": "二级", "memo": ""}, {"code": "03", "name": "三级", "memo": ""}, {"code": "04", "name": "四级", "memo": ""}, {"code": "05", "name": "未分级", "memo": ""}, {"code": "06", "name": "其它", "memo": ""}], "LY.00.63": [{"code": "3701", "name": "企业事业单位补充医疗保险", "memo": ""}, {"code": "39915", "name": "医疗照顾人员补充保险", "memo": ""}, {"code": "31001", "name": "城镇职工门诊基本医疗保险", "memo": ""}, {"code": "39001", "name": "城乡居民门诊基本医疗保险", "memo": ""}, {"code": "399", "name": "意外伤害医疗保险", "memo": ""}, {"code": "370", "name": "企业补充保险", "memo": ""}, {"code": "410", "name": "长期护理保险", "memo": ""}, {"code": "310", "name": "职工基本医疗保险", "memo": ""}, {"code": "320", "name": "公务员医疗补助", "memo": ""}, {"code": "330", "name": "大额医疗费用补助", "memo": ""}, {"code": "340", "name": "离休人员医疗保障", "memo": ""}, {"code": "350", "name": "一至六级残疾军人医疗补助", "memo": ""}, {"code": "390", "name": "城乡居民基本医疗保险", "memo": ""}, {"code": "510", "name": "生育保险", "memo": ""}, {"code": "610", "name": "贫困救助", "memo": "全民健康平台"}, {"code": "710", "name": "商业医疗保险", "memo": "全民健康平台"}, {"code": "810", "name": "全公费", "memo": "全民健康平台"}, {"code": "820", "name": "全自费", "memo": "全民健康平台"}, {"code": "99", "name": "其他", "memo": "全民健康平台"}, {"code": "39002", "name": "城乡居民大病医疗保险", "memo": "三医联动"}], "LY.00.181": [{"code": "1", "name": "急诊", "memo": ""}, {"code": "2", "name": "普通门诊", "memo": ""}, {"code": "3", "name": "特需门诊", "memo": ""}, {"code": "4", "name": "互联网诊疗", "memo": ""}, {"code": "5", "name": "MDT门诊", "memo": ""}, {"code": "9", "name": "其他", "memo": ""}], "LY.00.298": [{"code": "1", "name": "特级护理", "memo": ""}, {"code": "2", "name": "一级护理", "memo": ""}, {"code": "3", "name": "二级护理", "memo": ""}, {"code": "4", "name": "三级护理", "memo": ""}]}, "bound": {"GB/T 3304-1991": "CT_NATION", "LY.00.298": "CT_LOC", "LY.00.41": "CT_LOC", "LY.00.181": "CT_SEX"}};

/* 内存库：模拟 ^YZSY("SYDictMap") */
var DB = { Platform: {}, HisDict: {}, Domain: {}, Item: {}, Rel: {} };

(function initMock() {
    DB.Platform['SY']   = { name: '三医数据采集标准', ver: 'v1.6', flag: 'Y', memo: '4.2值域代码分册(演示数据)' };
    DB.Platform['HQMS'] = { name: 'HQMS医院质量监测系统', ver: '', flag: 'N', memo: '预留接入' };
    DB.Platform['YL6']  = { name: '六医联动平台', ver: '', flag: 'N', memo: '预留接入' };

    /* HIS 字典表种子:
     *   mode='S' 时 sql 为 SQL 文本(含 FROM 子句, FROM 后面的标识符对应 window.HISDATA 的 key)
     *   mode='E' 时 sql 为枚举文本(每行 code=desc)
     * 演示用字典种子: CT_LOC(SQL) / CT_NATION(SQL) / CT_SEX(枚举) / CUSTOM_DEMO(枚举)
     */
    DB.HisDict['CT_LOC'] = {
        name: '科室字典',
        mode: 'S',
        sql:  "SELECT TOP 20 CTLOC_RowID AS id, CTLOC_Code AS code, CTLOC_Desc AS desc FROM CT_Loc ORDER BY CTLOC_Code",
        flag: 'Y',
        memo: '演示: SQL 模式 → 通过 FROM CT_Loc 拿到 HISDATA[CT_Loc]'
    };
    DB.HisDict['CT_NATION'] = {
        name: '民族字典',
        mode: 'S',
        sql:  "SELECT CTNAT_Code AS code, CTNAT_Desc AS desc FROM CT_Nation",
        flag: 'Y',
        memo: '演示: SQL 模式 → 通过 FROM CT_Nation 拿到 HISDATA[CT_Nation]'
    };
    DB.HisDict['CT_SEX'] = {
        name: '性别字典',
        mode: 'E',
        sql:  "1=男\n2=女\n9=未说明",
        flag: 'Y',
        memo: '演示: 枚举模式 → 直接列出 code=desc'
    };

    for (var i = 0; i < MOCK.domains.length; i++) {
        var d = MOCK.domains[i];
        DB.Domain[d.code] = { name: d.name, his: MOCK.bound[d.code] || '', chap: d.chap, memo: '', flag: 'Y' };
        var its = MOCK.items[d.code] || [];
        DB.Item[d.code] = {};
        for (var j = 0; j < its.length; j++) { DB.Item[d.code][its[j].code] = { name: its[j].name, memo: its[j].memo }; }
    }
    /* HIS 字典内容按 mode 区分存储:
     *   mode='S' -> HISDATA[Code] 提供结构化数据(SQL 该字段对应的"虚拟表名", 以 FROM 子句定位)
     *   mode='E' -> ENUMDATA[Code] 直接存枚举文本(每行 code=desc)
     */
    window.HISDATA = {
        /* ---- 以下是演示"SQL 取数"的虚拟表名映射(与 HISDATA.key 对应 FROM 子句) ---- */
        'CT_LOC': [
            ['1001', '心血管内科'], ['1002', '呼吸内科'], ['1003', '消化内科'], ['1004', '神经内科'],
            ['1005', '普通外科'], ['1006', '骨科'], ['1007', '妇科'], ['1008', '儿科'],
            ['1009', '急诊医学科'], ['1010', '重症医学科'], ['1011', '麻醉科'], ['1012', '医学影像科'],
            ['1013', '医学检验科'], ['1014', '药剂科'], ['1015', '中医科'], ['1016', '康复医学科'],
            ['1017', '眼科'], ['1018', '耳鼻咽喉科'], ['1019', '口腔科'], ['1020', '皮肤科']
        ],
        'CT_NATION': [
            ['01', '汉族'], ['02', '蒙古族'], ['03', '回族'], ['04', '藏族'], ['05', '维吾尔族'],
            ['06', '苗族'], ['07', '彝族'], ['08', '壮族'], ['09', '布依族'], ['10', '朝鲜族'],
            ['11', '满族'], ['12', '侗族'], ['13', '瑶族'], ['14', '白族'], ['15', '土家族']
        ],
        'DHCTARI': [
            ['110100001', '挂号费'], ['110200001', '普通门诊诊查费'], ['110200002', '专家门诊诊查费'],
            ['120100001', '重症监护'], ['120400001', '氧气吸入'], ['210101001', 'X线摄影'],
            ['220201001', 'B型超声检查'], ['250101001', '血常规'], ['250301001', '尿常规'],
            ['330100001', '局部麻醉'], ['330701001', '扁桃体切除术'], ['410000001', '针灸']
        ],
        'MRC_ID': [['J00', '急性鼻咽炎(普通感冒)'], ['I10', '原发性高血压'], ['E11', '2型糖尿病']]
    };
    window.ENUMDATA = {};  /* 枚举字典临时内容, 由 SaveHisDict 时写入 */
    /* 预置几条对照，便于演示回显（LY.00.298 按真实首条 item 代码挂接，避免与采样顺序错位） */
    DB.Rel['GB/T 3304-1991'] = { '01': { '01': { desc: '汉族', flag: 'Y' } }, '02': { '02': { desc: '蒙古族', flag: 'Y' } } };
    (function () {
        var its = DB.Item['LY.00.298'] ? Object.keys(DB.Item['LY.00.298']) : [];
        if (its.length) {
            DB.Rel['LY.00.298'] = {};
            DB.Rel['LY.00.298'][its[0]] = { '1001': { desc: '心血管内科', flag: 'Y' }, '1009': { desc: '急诊医学科', flag: 'Y' } };
        }
    })();
})();

function nowStr() {
    var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
}
function ok(msg) { return '{"success":true,"msg":"' + (msg || '操作成功') + '"}'; }
function err(msg) { return '{"success":false,"msg":"' + (msg || '操作失败') + '"}'; }
function esc(s) { return String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/"/g, '\\"'); }
function itemCount(code) {
    var o = DB.Item[code] || {}, n = 0, k;
    for (k in o) { if (o.hasOwnProperty(k)) { n++; } }
    return n;
}
function relStat(code) {
    var o = DB.Item[code] || {}, mapped = 0, rels = 0, k;
    for (k in o) {
        if (!o.hasOwnProperty(k)) { continue; }
        var r = (DB.Rel[code] || {})[k] || {}, h, c = 0;
        for (h in r) { if (r.hasOwnProperty(h)) { c++; } }
        if (c > 0) { mapped++; rels += c; }
    }
    return { mapped: mapped, rels: rels };
}

/* ---------- 模拟 SQL/枚举取数 ---------- */
/* 从 SELECT 语句中提取第一个 FROM 子句后的"虚拟表名", 用作 window.HISDATA 的 key */
function pickTable(sql) {
    var s = sql || '', m = s.match(/FROM\s+([A-Za-z_][\w.]*)/i);
    return m ? m[1] : '';
}
/* "1=男\n2=女" -> [{c:'1',d:'男'},{c:'2',d:'女'}] */
function parseEnum(text) {
    var out = [], lines = String(text || '').split(/\r?\n/), i, kv;
    for (i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (!line || /^\s*#/.test(line)) { continue; }
        kv = line.split('=');
        if (kv.length < 2) { continue; }
        out.push({ c: String(kv.shift()).trim(), d: kv.join('=').trim() });
    }
    return out;
}
/* 返回 [{Code,Desc}] 数组(可能附 msg 说明) */
function dictItems(dictCode, kw) {
    var hd = DB.HisDict[dictCode];
    if (!hd) { return { rows: [], msg: '字典表【' + dictCode + '】未注册' }; }
    kw = String(kw || '').toLowerCase();
    var all = [], i, r;
    if (hd.mode === 'S') {
        var t = pickTable(hd.sql || '');
        var src = window.HISDATA[t] || [];
        for (i = 0; i < src.length; i++) { all.push({ Code: src[i][0], Desc: src[i][1] }); }
    } else {
        var parsed = parseEnum(hd.sql || '');
        for (i = 0; i < parsed.length; i++) { all.push({ Code: parsed[i].c, Desc: parsed[i].d }); }
    }
    var rows = [];
    for (i = 0; i < all.length; i++) {
        r = all[i];
        if (kw && String(r.Code).toLowerCase().indexOf(kw) < 0 && String(r.Desc).toLowerCase().indexOf(kw) < 0) { continue; }
        rows.push(r);
    }
    return { rows: rows, msg: '' };
}

/* ---------- 模拟 $m 后端分发 ---------- */
window.$m = function (data, cb) {
    setTimeout(function () {
        var m = data.MethodName, out = '', g = window.gPlatForMock || 'SY';
        try {
            if (m === 'QueryPlatform') {
                var arr = [], k;
                for (k in DB.Platform) {
                    if (!DB.Platform.hasOwnProperty(k)) { continue; }
                    var p = DB.Platform[k], dc = 0, ic = 0, rc = 0, d2;
                    for (d2 in DB.Domain) { if (DB.Domain.hasOwnProperty(d2)) { dc++; ic += itemCount(d2); rc += relStat(d2).rels; } }
                    arr.push('{"PlatCode":"' + esc(k) + '","PlatName":"' + esc(p.name) + '","Version":"' + esc(p.ver) + '","ActiveFlag":"' + p.flag + '","Memo":"' + esc(p.memo) + '","DomainCnt":' + dc + ',"ItemCnt":' + ic + ',"RelCnt":' + rc + '}');
                }
                out = '{"total":' + arr.length + ',"rows":[' + arr.join(',') + ']}';
            } else if (m === 'QueryDomain') {
                var rows = [], key, kw = data.Keyword || '', mf = data.MapFlag || '';
                for (key in DB.Domain) {
                    if (!DB.Domain.hasOwnProperty(key)) { continue; }
                    var dd = DB.Domain[key];
                    if (kw && key.indexOf(kw) < 0 && dd.name.indexOf(kw) < 0) { continue; }
                    if (mf === 'D' && !dd.his) { continue; }
                    if (mf === 'M' && dd.his) { continue; }
                    var st = relStat(key);
                    rows.push('{"DomainCode":"' + esc(key) + '","DomainName":"' + esc(dd.name) + '","Chapter":"' + esc(dd.chap) + '","HisDictCode":"' + esc(dd.his) + '","HisDictName":"' + esc((DB.HisDict[dd.his] || {}).name || '') + '","MapMode":"' + (dd.his ? 'D' : 'M') + '","ActiveFlag":"' + dd.flag + '","Memo":"","ItemCnt":' + itemCount(key) + ',"MappedCnt":' + st.mapped + ',"RelCnt":' + st.rels + '}');
                }
                out = page(rows, data.Page, data.Rows);
            } else if (m === 'QueryDomainItem') {
                var it = DB.Item[data.DomainCode] || {}, r2 = [], k2, kw2 = data.Keyword || '', mfl = data.MapFlag || '';
                for (k2 in it) {
                    if (!it.hasOwnProperty(k2)) { continue; }
                    if (kw2 && k2.indexOf(kw2) < 0 && it[k2].name.indexOf(kw2) < 0) { continue; }
                    var rr = (DB.Rel[data.DomainCode] || {})[k2] || {}, hs = [], ds = [], h, cnt = 0;
                    for (h in rr) { if (rr.hasOwnProperty(h)) { cnt++; hs.push(h); ds.push(rr[h].desc); } }
                    if (mfl === 'Y' && cnt === 0) { continue; }
                    if (mfl === 'N' && cnt > 0) { continue; }
                    r2.push('{"ItemCode":"' + esc(k2) + '","ItemName":"' + esc(it[k2].name) + '","Memo":"' + esc(it[k2].memo) + '","RelCnt":' + cnt + ',"RelCodes":"' + esc(hs.join('/')) + '","RelDescs":"' + esc(ds.join('/')) + '"}');
                }
                out = page(r2, data.Page, data.Rows);
            } else if (m === 'QueryHisDictItem') {
                var r3 = [], i3;
                var di = dictItems(data.DictCode, data.Keyword || '');
                for (i3 = 0; i3 < di.rows.length; i3++) {
                    r3.push('{"Code":"' + esc(di.rows[i3].Code) + '","Desc":"' + esc(di.rows[i3].Desc) + '"}');
                }
                out = '{"success":true,"msg":"' + esc(di.msg || '') + '",' + page(r3, data.Page, data.Rows).substr(1);
            } else if (m === 'QueryItemRel') {
                var rr2 = (DB.Rel[data.DomainCode] || {})[data.ItemCode] || {}, r4 = [], h4;
                for (h4 in rr2) {
                    if (!rr2.hasOwnProperty(h4)) { continue; }
                    r4.push('{"HisCode":"' + esc(h4) + '","HisDesc":"' + esc(rr2[h4].desc) + '","ActiveFlag":"' + rr2[h4].flag + '","CreateUser":"demo","CreateTime":"2026-09-05 09:00","UpdateUser":"demo","UpdateTime":"' + nowStr() + '","Memo":""}');
                }
                out = '{"total":' + r4.length + ',"rows":[' + r4.join(',') + ']}';
            } else if (m === 'QueryRel') {
                var r5 = [], d5, i5, h5;
                for (d5 in DB.Rel) {
                    if (!DB.Rel.hasOwnProperty(d5)) { continue; }
                    if (data.DomainCode && d5 !== data.DomainCode) { continue; }
                    if (data.ItemKeyword && d5.indexOf(data.ItemKeyword) < 0) { continue; }
                    for (i5 in DB.Rel[d5]) {
                        if (!DB.Rel[d5].hasOwnProperty(i5)) { continue; }
                        for (h5 in DB.Rel[d5][i5]) {
                            if (!DB.Rel[d5][i5].hasOwnProperty(h5)) { continue; }
                            var o5 = DB.Rel[d5][i5][h5];
                            if (data.HisKeyword && h5.indexOf(data.HisKeyword) < 0 && o5.desc.indexOf(data.HisKeyword) < 0) { continue; }
                            if (data.ActiveFlag && o5.flag !== data.ActiveFlag) { continue; }
                            var his5 = DB.Domain[d5] ? DB.Domain[d5].his : '';
                            if (data.MapMode === 'D' && !his5) { continue; }
                            if (data.MapMode === 'M' && his5) { continue; }
                            r5.push('{"PlatCode":"' + g + '","DomainCode":"' + esc(d5) + '","DomainName":"' + esc((DB.Domain[d5] || {}).name || '') + '","ItemCode":"' + esc(i5) + '","ItemName":"' + esc(((DB.Item[d5] || {})[i5] || {}).name || '') + '","HisCode":"' + esc(h5) + '","HisDesc":"' + esc(o5.desc) + '","ActiveFlag":"' + o5.flag + '","CreateUser":"demo","CreateTime":"2026-09-05 09:00","UpdateUser":"demo","UpdateTime":"' + nowStr() + '","Memo":"","HisDictCode":"' + esc(his5) + '","HisDictName":"' + esc((DB.HisDict[his5] || {}).name || '') + '","MapMode":"' + (his5 ? 'D' : 'M') + '"}');
                        }
                    }
                }
                out = page(r5, data.Page, data.Rows);
            } else if (m === 'QueryHisDict') {
                var r6 = [], k6;
                for (k6 in DB.HisDict) {
                    if (!DB.HisDict.hasOwnProperty(k6)) { continue; }
                    if (data.ActiveFlag && DB.HisDict[k6].flag !== data.ActiveFlag) { continue; }
                    var v6 = DB.HisDict[k6];
                    r6.push('{"DictCode":"' + esc(k6) + '","DictName":"' + esc(v6.name) + '","Mode":"' + v6.mode + '","SqlText":"' + esc(v6.sql || '') + '","ActiveFlag":"' + v6.flag + '","Memo":"' + esc(v6.memo || '') + '"}');
                }
                out = '{"total":' + r6.length + ',"rows":[' + r6.join(',') + ']}';
            } else if (m === 'SaveDictRel') {
                var dom = data.DomainCode, itm = data.ItemCode;
                DB.Rel[dom] = DB.Rel[dom] || {};
                if ((data.Mode || 'O') === 'O') { DB.Rel[dom][itm] = {}; }
                DB.Rel[dom][itm] = DB.Rel[dom][itm] || {};
                var codes = (data.HisCodes || '').split('^'), add = 0, i7;
                for (i7 = 0; i7 < codes.length; i7++) {
                    if (!codes[i7]) { continue; }
                    var desc7 = '';
                    /* 从该值域绑定的字典取真实描述 */
                    var his7 = (DB.Domain[dom] || {}).his || '';
                    if (his7) {
                        var di7 = dictItems(his7, codes[i7]);
                        for (var q = 0; q < di7.rows.length; q++) {
                            if (String(di7.rows[q].Code) === String(codes[i7])) { desc7 = di7.rows[q].Desc; }
                        }
                    }
                    DB.Rel[dom][itm][codes[i7]] = { desc: desc7 || codes[i7], flag: 'Y' };
                    add++;
                }
                out = '{"success":true,"add":' + add + ',"skip":0,"msg":"保存成功' + add + '条"}';
            } else if (m === 'UpdateRel') {
                var o = ((DB.Rel[data.DomainCode] || {})[data.ItemCode] || {})[data.HisCode];
                if (!o) { out = err('对照记录不存在'); }
                else { o.desc = data.HisDesc; o.flag = data.ActiveFlag; out = ok('保存成功'); }
            } else if (m === 'DeleteRel') {
                var rm = (DB.Rel[data.DomainCode] || {})[data.ItemCode];
                if (!rm || !rm[data.HisCode]) { out = err('对照记录不存在'); }
                else { delete rm[data.HisCode]; out = ok('删除成功'); }
            } else if (m === 'ClearRel') {
                DB.Rel[data.DomainCode] = DB.Rel[data.DomainCode] || {};
                DB.Rel[data.DomainCode][data.ItemCode] = {};
                out = ok('已清空对照');
            } else if (m === 'RefreshRelDesc') {
                out = '{"success":true,"upd":0,"miss":0,"msg":"刷新0条"}';
            } else if (m === 'SaveDomainHisDict') {
                if (!DB.Domain[data.DomainCode]) { out = err('值域不存在'); }
                else { DB.Domain[data.DomainCode].his = data.HisDictCode || ''; out = ok('保存成功'); }
            } else if (m === 'SaveHisDict') {
                /* 新签名: DictCode/DictName/Mode/SqlText/ActiveFlag/Memo */
                if (!data.DictCode) { out = err('字典代码不能为空'); }
                else {
                    var mode = (data.Mode || 'S');
                    if (mode !== 'S' && mode !== 'E') { mode = 'S'; }
                    DB.HisDict[data.DictCode] = {
                        name: data.DictName || data.DictCode,
                        mode: mode,
                        sql:  data.SqlText || '',
                        flag: data.ActiveFlag || 'N',
                        memo: data.Memo || ''
                    };
                    out = ok('保存成功');
                }
            } else if (m === 'DeleteHisDict') {
                /* 已被值域绑定时不允许删除 */
                var boundBy = [];
                for (var bd in DB.Domain) {
                    if (!DB.Domain.hasOwnProperty(bd) || !DB.Domain[bd]) { continue; }
                    if (DB.Domain[bd].his === data.DictCode) { boundBy.push(bd); }
                }
                if (boundBy.length) { out = err('已被【' + boundBy.join(',') + '】绑定，无法删除'); }
                else { delete DB.HisDict[data.DictCode]; out = ok('删除成功'); }
            } else if (m === 'GetHisDict') {
                var hd = DB.HisDict[data.DictCode] || {};
                out = '{"success":true,"row":{"DictCode":"' + esc(data.DictCode) + '","DictName":"' + esc(hd.name || '')
                    + '","Mode":"' + (hd.mode || 'S') + '","SqlText":"' + esc(hd.sql || '') + '","ActiveFlag":"' + (hd.flag || 'N')
                    + '","Memo":"' + esc(hd.memo || '') + '"}}';
            } else if (m === 'SavePlatform') {
                DB.Platform[data.PlatCode] = { name: data.PlatName, ver: data.Version, flag: data.ActiveFlag, memo: data.Memo };
                out = ok('保存成功');
            } else if (m === 'DeletePlatform') {
                delete DB.Platform[data.PlatCode]; out = ok('删除成功');
            } else if (m === 'SetRelFlagBatch') {
                var ids = (data.IdList || '').split('^'), n8 = 0, i8;
                for (i8 = 0; i8 < ids.length; i8++) {
                    var pp = ids[i8].split('|');
                    var o8 = ((DB.Rel[pp[0]] || {})[pp[1]] || {})[pp[2]];
                    if (o8) { o8.flag = data.ActiveFlag; n8++; }
                }
                out = '{"success":true,"ok":' + n8 + ',"err":0,"msg":"共处理' + n8 + '条"}';
            } else if (m === 'DeleteRelBatch') {
                var idl = (data.IdList || '').split('^'), n9 = 0, i9;
                for (i9 = 0; i9 < idl.length; i9++) {
                    var p9 = idl[i9].split('|');
                    var o9 = (DB.Rel[p9[0]] || {})[p9[1]];
                    if (o9 && o9[p9[2]]) { delete o9[p9[2]]; n9++; }
                }
                out = '{"success":true,"ok":' + n9 + ',"err":0,"msg":"删除' + n9 + '条"}';
            } else if (m === 'ProbeHisDict') {
                var di9 = dictItems(data.DictCode, ''), smp = [], ix;
                for (ix = 0; ix < di9.rows.length && ix < 5; ix++) {
                    var preview = (di9.rows[ix].Code || '') + ' = ' + (di9.rows[ix].Desc || '');
                    smp.push('{"code":"' + esc(di9.rows[ix].Code) + '","desc":"' + esc(di9.rows[ix].Desc) + '","raw":"' + esc(preview) + '"}');
                }
                var dd9 = DB.HisDict[data.DictCode] || {};
                var sqlShort = (dd9.sql || '');
                if (sqlShort.length > 80) { sqlShort = sqlShort.substring(0, 80) + ' ...'; }
                out = '{"success":true,"DictCode":"' + esc(data.DictCode) + '","Mode":"' + (dd9.mode || '')
                    + '","CodeField":"code","DescField":"desc","SqlText":"' + esc(sqlShort)
                    + '","samples":[' + smp.join(',') + '],"msg":"' + esc(di9.msg || '') + '"}';
            } else if (m === 'ImportDomainCSV') {
                var lines = (data.CsvText || '').split('\n'), nA = 0, nD = 0, ia;
                for (ia = 1; ia < lines.length; ia++) {
                    var ln = lines[ia];
                    if (!ln || !ln.replace(/\s/g, '')) { continue; }
                    var f = ln.split(',');
                    if (!f[0]) { continue; }
                    if (!DB.Domain[f[0]]) { DB.Domain[f[0]] = { name: f[1] || f[0], his: '', chap: '', memo: '', flag: 'Y' }; nD++; }
                    if (f[2]) { DB.Item[f[0]] = DB.Item[f[0]] || {}; DB.Item[f[0]][f[2]] = { name: f[3] || '', memo: f[4] || '' }; nA++; }
                }
                out = '{"success":true,"item":' + nA + ',"domain":' + nD + ',"msg":"导入完成: 值域' + nD + '个, 条目' + nA + '条"}';
            } else if (m === 'ExportRel') {
                var csv = '平台代码,值域代码,值域名称,三医代码,三医名称,HIS代码,HIS描述,状态\n', da, ib, hb;
                for (da in DB.Rel) {
                    if (!DB.Rel.hasOwnProperty(da)) { continue; }
                    for (ib in DB.Rel[da]) {
                        if (!DB.Rel[da].hasOwnProperty(ib)) { continue; }
                        for (hb in DB.Rel[da][ib]) {
                            if (!DB.Rel[da][ib].hasOwnProperty(hb)) { continue; }
                            csv += 'SY,' + da + ',' + (DB.Domain[da] || {}).name + ',' + ib + ',' + ((DB.Item[da] || {})[ib] || {}).name + ',' + hb + ',' + DB.Rel[da][ib][hb].desc + ',' + DB.Rel[da][ib][hb].flag + '\n';
                        }
                    }
                }
                out = csv;
            } else {
                out = err('预览模式未实现的方法: ' + m);
            }
        } catch (ex) {
            out = err(String(ex));
        }
        if (cb) { cb(out); }
    }, 60);
};

function page(rows, p, r) {
    p = parseInt(p || 1, 10); r = parseInt(r || 20, 10);
    if (r <= 0) { return '{"total":' + rows.length + ',"rows":[' + rows.join(',') + ']}'; }
    var total = rows.length;
    var start = (p - 1) * r;
    var end = Math.min(start + r, total);
    var sel = [];
    for (var i = start; i < end; i++) { if (rows[i] != null) { sel.push(rows[i]); } }
    return '{"total":' + total + ',"rows":[' + sel.join(',') + ']}';
}
window.gPlatForMock = 'SY';
var _origVal = null;

/* ======================= datagrid / pagination / dialog 垫片 ======================= */
(function ($) {
    function renderGrid($t) {
        var st = $t.data('dgState');
        if (!st) { return; }
        var o = st.opts, data = st.data || { total: 0, rows: [] };
        var cols = (o.columns && o.columns[0]) || [];
        var hasCk = false, i;
        for (i = 0; i < cols.length; i++) { if (cols[i].checkbox) { hasCk = true; } }
        var w = $t.closest('.paneBody');
        var host = w.length ? w : $t.parent();
        var box = host.children('.dg-wrap');
        if (!box.length) {
            box = $('<div class="dg-wrap"></div>');
            var pager = $('<div class="dg-pager"></div>');
            host.append(box).append(pager);
            $t.hide();
        }
        var h = '<table class="dg"><thead><tr>';
        if (hasCk) { h += '<th class="ck"><input type="checkbox" class="dg-ckall"></th>'; }
        for (i = 0; i < cols.length; i++) {
            if (cols[i].checkbox) { continue; }
            h += '<th style="width:' + (cols[i].width || 100) + 'px">' + (cols[i].title || cols[i].field || '') + '</th>';
        }
        h += '</tr></thead><tbody>';
        if (!data.rows.length) {
            h += '<tr><td colspan="' + (cols.length) + '"><div class="dg-empty">暂无数据</div></td></tr>';
        }
        for (i = 0; i < data.rows.length; i++) {
            var row = data.rows[i];
            var cls = (i % 2 === 1 ? 'even' : '') + (st.sel && st.sel[i] ? ' sel' : '');
            h += '<tr class="' + cls + '" data-i="' + i + '">';
            if (hasCk) { h += '<td class="ck"><input type="checkbox" class="dg-ck"' + (st.sel && st.sel[i] ? ' checked' : '') + '></td>'; }
            for (var j = 0; j < cols.length; j++) {
                if (cols[j].checkbox) { continue; }
                var v = row[cols[j].field];
                var txt = cols[j].formatter ? cols[j].formatter(v, row, i) : (v == null ? '' : String(v));
                h += '<td>' + txt + '</td>';
            }
            h += '</tr>';
        }
        h += '</tbody></table>';
        box.html(h);
        var ph = host.children('.dg-pager');
        $t.data('dgPagerEl', ph);
        if (o.pagination) {
            ph.show().html('<span>共 ' + (data.total || 0) + ' 条</span>'
                + '<button class="pg-prev">上一页</button><span class="pg-no">' + (st.page || 1) + '</span>'
                + '<button class="pg-next">下一页</button><span>每页 ' + (o.pageSize || 20) + '</span>');
            ph.find('.pg-prev').off('click').on('click', function () {
                var st2 = $t.data('dgState'); st2.page = Math.max(1, (st2.page || 1) - 1);
                if (st2.onPage) { st2.onPage(st2.page); }
            });
            ph.find('.pg-next').off('click').on('click', function () {
                var st2 = $t.data('dgState'); st2.page = (st2.page || 1) + 1;
                if (st2.onPage) { st2.onPage(st2.page); }
            });
        } else { ph.hide(); }
        /* 事件 */
        box.find('.dg-ck').off('change').on('change', function () {
            var tr = $(this).closest('tr'), idx = parseInt(tr.attr('data-i'), 10);
            var st3 = $t.data('dgState');
            st3.sel = st3.sel || [];
            st3.sel[idx] = this.checked;
            tr.toggleClass('sel', this.checked);
            updateSel($t);
        });
        box.find('.dg-ckall').off('change').on('change', function () {
            var st4 = $t.data('dgState'), on = this.checked;
            st4.sel = st4.sel || [];
            for (var k = 0; k < st4.data.rows.length; k++) { st4.sel[k] = on; }
            renderGrid($t);
            updateSel($t);
        });
        if (!o.singleSelect) { return; }
        box.find('tbody tr').off('click').on('click', function (e) {
            if ($(e.target).is('input')) { return; }
            var idx = parseInt($(this).attr('data-i'), 10);
            var st5 = $t.data('dgState');
            box.find('tbody tr').removeClass('sel');
            $(this).addClass('sel');
            if (o.onSelect) { o.onSelect(idx, st5.data.rows[idx]); }
        });
    }
    function updateSel($t) {
        var st = $t.data('dgState');
        if (st && st.opts.onSelect) { /* 多选回调由页面 updateSelTip 处理 */ }
        try { if (typeof updateSelTip === 'function') { updateSelTip(); } } catch (e) {}
    }

    $.fn.datagrid = function (arg) {
        if (typeof arg === 'string') {
            var a = Array.prototype.slice.call(arguments, 1);
            var $t = this, st = $t.data('dgState');
            if (arg === 'loadData') {
                st.data = a[0] || { total: 0, rows: [] };
                st.sel = [];
                $t.data('dgState', st);
                renderGrid($t);
                if (st.opts.onLoadSuccess) { st.opts.onLoadSuccess(st.data); }
                return $t;
            } else if (arg === 'getRows') {
                return (st && st.data) ? st.data.rows : [];
            } else if (arg === 'getSelections') {
                var out = [], rows = (st && st.data) ? st.data.rows : [], i;
                for (i = 0; i < rows.length; i++) { if (st.sel && st.sel[i]) { out.push(rows[i]); } }
                return out;
            } else if (arg === 'checkRow') {
                st.sel = st.sel || []; st.sel[a[0]] = true;
                $t.data('dgState', st);
                var pb = $t.closest('.paneBody');
                if (!pb.length) { pb = $t.parent(); }
                var tr = pb.find('.dg-wrap tbody tr[data-i=' + a[0] + ']');
                tr.addClass('sel').find('.dg-ck').prop('checked', true);
                return $t;
            } else if (arg === 'clearSelections') {
                st.sel = []; $t.data('dgState', st); renderGrid($t); return $t;
            } else if (arg === 'selectRow') {
                st.sel = st.sel || []; st.sel[a[0]] = true;
                $t.data('dgState', st); renderGrid($t);
                if (st.opts.onSelect) { st.opts.onSelect(a[0], st.data.rows[a[0]]); }
                return $t;
            } else if (arg === 'getPager') {
                var pg = $t.data('dgPagerEl');
                if (!pg) { pg = $('<div></div>'); $t.data('dgPagerEl', pg); }
                return pg;
            } else if (arg === 'options') {
                return st.opts;
            }
            return $t;
        }
        return this.each(function () {
            var $t = $(this);
            var st = { opts: arg, data: { total: 0, rows: [] }, sel: [], page: 1, onPage: null };
            $t.data('dgState', st);
            renderGrid($t);
        });
    };
    $.fn.pagination = function (arg) {
        if (arg && arg.onSelectPage) {
            var $host = this.closest('.paneBody');
            var $tbl = $host.children('table').first();
            if (!$tbl.length) {
                var $p = this.parent();
                $tbl = $p.children('table').first();
            }
            var st = $tbl.data('dgState');
            if (st) { st.onPage = function (p) { arg.onSelectPage(p, st.opts.pageSize); }; $tbl.data('dgState', st); }
        }
        return this;
    };
    $.fn.dialog = function (arg) {
        if (typeof arg === 'string') {
            if (arg === 'close') { this.hide(); $('.win-mask').remove(); return this; }
            if (arg === 'open') { this.show(); return this; }
            return this;
        }
        var $d = this;
        $('.win-mask').remove();
        $('<div class="win-mask"></div>').appendTo('body');
        var title = arg.title || '';
        var w = arg.width || 520;
        var btns = arg.buttons || [];
        var bh = '';
        for (var i = 0; i < btns.length; i++) { bh += '<a class="lb" data-i="' + i + '">' + btns[i].text + '</a> '; }
        $d.addClass('win').css({ width: w + 'px', left: Math.max(20, (window.innerWidth - w) / 2) + 'px', top: arg.top || 70 });
        $d.html('<div class="win-head">' + title + '</div><div class="win-body">' + $d.html() + '</div><div class="win-btns">' + bh + '</div>');
        $d.show();
        $d.find('.win-btns .lb').each(function () {
            var i2 = parseInt($(this).attr('data-i'), 10);
            $(this).on('click', function () { btns[i2].handler(); });
        });
        $d.find('.win-body').css({ padding: '12px', maxHeight: '440px', overflow: 'auto' });
        return this;
    };
    $.fn.linkbutton = function () { return this.addClass('lb'); };
    $.fn.combobox = function () { return this; };
    $.fn.textbox = function () { return this; };
})(jQuery);

/* tabs 垫片 */
$(function () {
    var $tabs = $('#mainTabs');
    if (!$tabs.length) { return; }
    var $panels = $tabs.children('div[title]');
    var head = $('<div class="tabs-head"></div>');
    var body = $('<div class="tabs-body"></div>');
    $panels.each(function (i) {
        var t = $(this).attr('title');
        head.append($('<div class="t' + (i === 0 ? ' on' : '') + '"></div>').text(t).attr('data-i', i));
        $(this).addClass('tp' + (i === 0 ? ' on' : '')).attr('data-i', i);
        body.append(this);
    });
    $tabs.empty().append(head).append(body);
    head.on('click', '.t', function () {
        var i = $(this).attr('data-i');
        head.children('.t').removeClass('on');
        $(this).addClass('on');
        body.children('.tp').removeClass('on');
        body.children('.tp[data-i=' + i + ']').addClass('on');
        $(window).resize();
    });
});
