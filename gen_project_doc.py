# -*- coding: utf-8 -*-
"""病案编目数据自定义查询系统 — 需求->方案->实施->落地 全流程文档"""
import sys
sys.path.insert(0, r"d:\claude code\IRIS\.claude\skills\imedway-docx\references")
from python_docx_chapter_template import ImedwayChapterDoc

OUTPUT = r"d:\claude code\IRIS\项目经验分享_temp.docx"
DESKTOP = r"C:\Users\Admin\Desktop\IRIS_HIS病案编目自定义查询_v2.docx"

doc = ImedwayChapterDoc(
    output_path=OUTPUT,
    title_lines=["病案编目数据", "自定义查询系统"],
    author="信息中心 / HIS 开发组",
    date="2026年7月",
    header_name="病案编目数据自定义查询系统 项目经验分享",
)

def img(text):
    doc.add_body("[ 图片占位：" + text + " ]")

# ###############################################################
#  第1章 需求分析
# ###############################################################
doc.add_heading_1("需求分析")

doc.add_heading_2("背景")
doc.add_body("病案编目数据存储于 ^DHCMRInfo Global（596字段），是医院统计、质控、医保上报核心数据源。传统查询需开发人员手写 ObjectScript 代码遍历 Global，病案室无法自助操作，响应周期长。")

doc.add_heading_2("需求拆解（7条）")
doc.add_bullet("需求1：自由选择输出列 — 349字段按10大分组展示，支持搜索和拖拽排序", level=1)
doc.add_bullet("需求2：动态查询条件 — AND/OR条件组，类型自动决定运算符和输入控件", level=1)
doc.add_bullet("需求3：查询执行与导出 — 分页浏览+footer费用合计+CSV导出（日期/科室/性别自动转可读格式）", level=1)
doc.add_bullet("需求4：模板保存与引用 — 个人/通用范围，一键加载列配置和条件", level=1)
doc.add_bullet("需求5：模板管理 — 编辑/禁用/默认/权限控制", level=1)
doc.add_bullet("需求6：聚合字段 — 所有诊断/所有手术等4个虚拟字段", level=1)
doc.add_bullet("需求7：默认输出列预设 — 11个常用列开箱即用", level=1)

doc.add_heading_2("需求文档")
doc.add_body("AI需求文档已生成至 D:\\AI需求\\20260703_病案编目自定义查询_AI需求.txt，7条需求均按背景+环境+目标标准格式拆分，面向医护人员视角，无技术术语。")

img("AI需求文档截图")


# ###############################################################
#  第2章 可视化方案
# ###############################################################
doc.add_heading_1("可视化方案")

doc.add_heading_2("方案一：界面布局原型")
doc.add_body("使用 Agent-Native Plan 创建可交互界面原型，包含 5 个核心界面：查询主界面、字段选择器弹窗、查询条件配置详情、模板悬浮弹框、模板管理页面。各界面间通过点击跳转，完整展示用户操作路径。")

img("界面原型全景图 — 5个界面交互关系")

doc.add_heading_2("方案二：模板悬浮弹框设计")
doc.add_body("模板面板经历三轮迭代：v1顶部折叠面板 -> v2右侧East面板 -> v3右上角fixed悬浮弹框（最终方案）。v3方案不占用页面布局空间，点击外部自动关闭，引用模板后自动折叠。")

img("模板面板三轮迭代对比图")

doc.add_heading_2("方案三：查询引擎数据流")
doc.add_body("设计查询引擎的完整数据流：前端JSON -> $.cm() -> 后端解析 -> Global遍历 -> MatchValue逐条件匹配 -> 分页切片 -> 类型转换 -> JSON返回 -> 前端渲染。定义 MatchValue 的输入输出签名和处理逻辑。")

img("查询引擎数据流图")

doc.add_heading_2("方案四：模板存储架构")
doc.add_body("模板采用 Global $lb + %Persistent 持久类 SQL 双通道方案。显式 Storage 定义精确映射 piece->属性，实现 Global 直写与 SQL SELECT 同时可用。")

img("模板存储架构图")

doc.add_heading_2("可视化方案链接")
doc.add_bullet("界面原型 Plan：https://plan.agent-native.com/plans/plan-d5670a96870a4ead", level=1)
doc.add_bullet("布局方案 Plan：https://plan.agent-native.com/plans/plan-fb70381d5d0343c1", level=1)
doc.add_bullet("需求方案 Plan：https://plan.agent-native.com/plans/plan-18cb90131b494b3a", level=1)


# ###############################################################
#  第3章 实施过程
# ###############################################################
doc.add_heading_1("实施过程")

doc.add_heading_2("技术栈选型")
doc.add_bullet("后端：IRIS 2021.1 ObjectScript，.cls 源码格式，12 个 ClassMethod", level=1)
doc.add_bullet("前端：CSP + HISUI(EasyUI) + jQuery 1.11，全部 IE11 ES5 兼容", level=1)
doc.add_bullet("数据：^DHCMRInfo Global + ^User.DHCMRQueryTemplateD($lb) + 持久类(SQL)", level=1)
doc.add_bullet("交互：$.cm() 标准模式，后端返回 JSON", level=1)

doc.add_heading_2("核心模块实现")
doc.add_bullet("模块1：字段选择器（buildSelectedList + HTML5 Drag API + FIELD_META兜底）", level=1)
doc.add_bullet("模块2：条件引擎（collectConditions + MatchValue 10种运算符 + 5种类型预处理）", level=1)
doc.add_bullet("模块3：查询执行（Global $o遍历 + 分组匹配 + 200K保护 + 手动分页）", level=1)
doc.add_bullet("模块4：模板系统（SaveTemplate $lb写入 + GetTemplateDetail + restoreConditions时序级联）", level=1)
doc.add_bullet("模块5：类型转换链（Date $zd / CTLoc ^CTLOC / Gender 1->男 / MultiPiece拼接）", level=1)

doc.add_heading_2("代码规模")
doc.add_body("后端 ~1100行（12方法），前端 ~1700行 JS（2页面），持久类 1个，CSP页面 2个。总计 ~2800行。")

img("代码结构文件树截图")

doc.add_heading_2("典型问题与解决")

doc.add_heading_3("问题1：出院日期显示原始数字67661")
doc.add_body("DEFAULT_FIELDS缺type属性 -> f.type=undefined -> \"String\" -> $zd转换被跳过。修复：DEFAULT_FIELDS补type + buildColumnsWithType始终查FIELD_META兜底。")

doc.add_heading_3("问题2：SQL查询报<LIST>致命错误")
doc.add_body("$p($h,\\\",\\\",2)返回字符串写入$lb -> %Time属性类型不匹配 -> <LIST>。修复：+$p强制转数字 + kill ^Global(0)清理旧计数器。")

doc.add_heading_3("问题3：模板编辑保存后配置清空")
doc.add_body("GetTemplateList不返回JSON列 -> saveEdit取row.ColumnsJSON=undefined -> 写入[]。修复：openEdit调GetTemplateDetail + 缓存变量editingColsJSON。")

img("问题处理流程图")


# ###############################################################
#  第4章 落地成果
# ###############################################################
doc.add_heading_1("落地成果")

doc.add_heading_2("交付物清单")
doc.add_bullet("后端类：web.YZSY.DHCMRCustomQuery.cls（1100行，12方法）", level=1)
doc.add_bullet("持久类：User.DHCMRQueryTemplate.cls（显式Storage，SQL双通道）", level=1)
doc.add_bullet("查询主界面：dhcmrcustomquery.csp + dhcmrcustomquery.js（1700行）", level=1)
doc.add_bullet("模板管理：dhcmrcustomquerytmpl.csp + dhcmrcustomquerytmpl.js", level=1)
doc.add_bullet("AI需求文档：7条（D:\\AI需求\\）", level=1)
doc.add_bullet("经验分享PPT：25页", level=1)
doc.add_bullet("项目经验文档：本文档", level=1)

doc.add_heading_2("核心指标")
doc.add_bullet("支持字段：349个 / 10大分组 / 6种数据类型", level=1)
doc.add_bullet("运算符：10种（contains/eq/neq/gt/lt/gte/lte/between/startswith/notcontains）", level=1)
doc.add_bullet("查询上限：20万条 / 手动分页（10/20/50/100条每页）", level=1)
doc.add_bullet("模板存储：Global $lb 10位 + SQL双通道", level=1)
doc.add_bullet("IE11兼容：0个ES6+语法，全部var+function", level=1)

img("查询主界面完整截图")

doc.add_heading_2("可复用组件")
doc.add_bullet("动态字段选择器（分组+搜索+拖拽）— 任何大量字段选择场景", level=1)
doc.add_bullet("动态条件引擎（类型->运算符+控件）— 任何灵活查询报表", level=1)
doc.add_bullet("MatchValue通用比较器 — 任何数据匹配需求", level=1)
doc.add_bullet("模板系统（Global+SQL双通道+权限）— 任何用户配置保存模块", level=1)
doc.add_bullet("类型转换链（Date/CTLoc/Gender/MultiPiece）— 任何Global数据展示", level=1)

img("字段选择器弹窗截图")
img("模板管理界面截图")
img("模板悬浮弹框截图")

import shutil, os
doc.save()
shutil.copy(OUTPUT, DESKTOP)
os.remove(OUTPUT)
print(f"DOCX saved: {DESKTOP}")
