# -*- coding: utf-8 -*-
from pptx import Presentation
from pptx.util import Inches, Cm, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

DEEP_BLUE = RGBColor(0x00, 0x47, 0x9D)
LIGHT_BLUE = RGBColor(0x00, 0xA9, 0xE4)
YELLOW = RGBColor(0xF8, 0xB6, 0x2D)
GREEN = RGBColor(0x13, 0xAE, 0x67)
ORANGE = RGBColor(0xED, 0x7D, 0x31)
DARK_GRAY = RGBColor(0x26, 0x26, 0x26)
LIGHT_GRAY = RGBColor(0xF2, 0xF2, 0xF2)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)

prs = Presentation()
prs.slide_width = Cm(33.867)
prs.slide_height = Cm(19.05)

def add_brand_blocks(slide):
    colors = [GREEN, YELLOW, GREEN, LIGHT_BLUE, LIGHT_BLUE, LIGHT_BLUE]
    x_start = Cm(1.93)
    y = Cm(17.8)
    size = Cm(0.6)
    gap = Cm(0.75)
    for i, c in enumerate(colors):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x_start + i * gap, y, size, size)
        shape.fill.solid()
        shape.fill.fore_color.rgb = c
        shape.line.fill.background()

def add_logo(slide):
    txBox = slide.shapes.add_textbox(Cm(22), Cm(0.5), Cm(10), Cm(1.2))
    tf = txBox.text_frame
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.RIGHT
    run1 = p.add_run()
    run1.text = "iMED"
    run1.font.size = Pt(16)
    run1.font.color.rgb = DEEP_BLUE
    run1.font.bold = True
    run2 = p.add_run()
    run2.text = "WAY"
    run2.font.size = Pt(16)
    run2.font.color.rgb = YELLOW
    run2.font.bold = True

def add_page_title(slide, title_text):
    txBox = slide.shapes.add_textbox(Cm(1.93), Cm(1.5), Cm(28), Cm(1.5))
    tf = txBox.text_frame
    p = tf.paragraphs[0]
    run = p.add_run()
    run.text = title_text
    run.font.size = Pt(30)
    run.font.bold = True
    run.font.color.rgb = DEEP_BLUE

def add_card(slide, left, top, width, height, title, items, color=DEEP_BLUE):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(left), Cm(top), Cm(width), Cm(height))
    shape.fill.solid()
    shape.fill.fore_color.rgb = WHITE
    shape.line.color.rgb = color
    shape.line.width = Pt(1)
    bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Cm(left), Cm(top), Cm(0.15), Cm(height))
    bar.fill.solid()
    bar.fill.fore_color.rgb = color
    bar.line.fill.background()
    txBox = slide.shapes.add_textbox(Cm(left + 0.5), Cm(top + 0.2), Cm(width - 0.7), Cm(1))
    tf = txBox.text_frame
    p = tf.paragraphs[0]
    run = p.add_run()
    run.text = title
    run.font.size = Pt(20)
    run.font.bold = True
    run.font.color.rgb = color
    txBox2 = slide.shapes.add_textbox(Cm(left + 0.5), Cm(top + 1.3), Cm(width - 0.7), Cm(height - 1.5))
    tf2 = txBox2.text_frame
    tf2.word_wrap = True
    for i, item in enumerate(items):
        if i == 0:
            p2 = tf2.paragraphs[0]
        else:
            p2 = tf2.add_paragraph()
        p2.space_after = Pt(4)
        run2 = p2.add_run()
        run2.text = u"• " + item
        run2.font.size = Pt(14)
        run2.font.color.rgb = DARK_GRAY

# =====================================================
# Slide 1: Cover
# =====================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])

txBox = slide.shapes.add_textbox(Cm(3.08), Cm(2.61), Cm(8), Cm(1.2))
tf = txBox.text_frame
p = tf.paragraphs[0]
run1 = p.add_run()
run1.text = "iMED"
run1.font.size = Pt(36)
run1.font.color.rgb = DEEP_BLUE
run1.font.bold = True
run2 = p.add_run()
run2.text = "WAY"
run2.font.size = Pt(36)
run2.font.color.rgb = YELLOW
run2.font.bold = True
p2 = tf.add_paragraph()
run3 = p2.add_run()
run3.text = "东华医为"
run3.font.size = Pt(14)
run3.font.color.rgb = DARK_GRAY

txBox = slide.shapes.add_textbox(Cm(2.56), Cm(6.11), Cm(18), Cm(2.5))
tf = txBox.text_frame
p = tf.paragraphs[0]
run = p.add_run()
run.text = "IRIS HIS"
run.font.size = Pt(46)
run.font.bold = True
run.font.color.rgb = DEEP_BLUE
p2 = tf.add_paragraph()
run2 = p2.add_run()
run2.text = "病案编目数据自定义查询系统"
run2.font.size = Pt(46)
run2.font.bold = True
run2.font.color.rgb = DEEP_BLUE

txBox = slide.shapes.add_textbox(Cm(2.68), Cm(9), Cm(10), Cm(1.5))
tf = txBox.text_frame
p = tf.paragraphs[0]
run = p.add_run()
run.text = "开发经验分享"
run.font.size = Pt(26)
run.font.color.rgb = DEEP_BLUE

txBox = slide.shapes.add_textbox(Cm(2.68), Cm(14.5), Cm(6), Cm(2.2))
tf = txBox.text_frame
p = tf.paragraphs[0]
run = p.add_run()
run.text = "2026年7月"
run.font.size = Pt(14)
run.font.color.rgb = DARK_GRAY

decos = [(Cm(24), Cm(3), LIGHT_BLUE), (Cm(27), Cm(2), DEEP_BLUE), (Cm(26), Cm(6), GREEN),
         (Cm(28.5), Cm(4.5), YELLOW), (Cm(23.5), Cm(7), LIGHT_BLUE), (Cm(25.5), Cm(9.5), DEEP_BLUE)]
for x, y, c in decos:
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Cm(1.2), Cm(1.2))
    shape.fill.solid()
    shape.fill.fore_color.rgb = c
    shape.line.fill.background()

# =====================================================
# Slide 2: TOC
# =====================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])

txBox = slide.shapes.add_textbox(Cm(1.93), Cm(1), Cm(8), Cm(1.5))
tf = txBox.text_frame
p = tf.paragraphs[0]
run = p.add_run()
run.text = "目录"
run.font.size = Pt(30)
run.font.bold = True
run.font.color.rgb = DEEP_BLUE
p2 = tf.add_paragraph()
run2 = p2.add_run()
run2.text = "CONTENTS"
run2.font.size = Pt(14)
run2.font.color.rgb = LIGHT_BLUE

toc = [("01", "项目背景与需求分析"), ("02", "系统架构设计"),
       ("03", "关键技术实现"), ("04", "经验总结与最佳实践")]
for i, (num, title) in enumerate(toc):
    y = Cm(4 + i * 3.2)
    txBox = slide.shapes.add_textbox(Cm(3), y, Cm(3), Cm(2))
    tf = txBox.text_frame
    p = tf.paragraphs[0]
    run = p.add_run()
    run.text = num
    run.font.size = Pt(40)
    run.font.bold = True
    run.font.color.rgb = DEEP_BLUE
    txBox2 = slide.shapes.add_textbox(Cm(6), y, Cm(22), Cm(1.2))
    tf2 = txBox2.text_frame
    p2 = tf2.paragraphs[0]
    run2 = p2.add_run()
    run2.text = title
    run2.font.size = Pt(24)
    run2.font.bold = True
    run2.font.color.rgb = DARK_GRAY
    if i < 3:
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Cm(6), y + Cm(2.8), Cm(24), Cm(0.02))
        line.fill.solid()
        line.fill.fore_color.rgb = LIGHT_GRAY
        line.line.fill.background()

# =====================================================
# Slide 3: 01 Background
# =====================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_page_title(slide, "01 / 项目背景与需求分析")
add_brand_blocks(slide)
add_logo(slide)

add_card(slide, 1.93, 3.8, 14, 6.5, "项目背景", [
    "HIS 病案编目数据存储在 ^DHCMRInfo Global",
    "596个字段覆盖基本信息/住院/诊断/手术/费用",
    "传统查询方式需要写 ObjectScript 代码",
    "非技术人员无法自助查询"
], DEEP_BLUE)

add_card(slide, 17.5, 3.8, 14, 6.5, "核心需求", [
    "自由选择输出列（349个有中文说明的字段）",
    "动态查询条件（AND/OR + 条件组）",
    "查询模板保存/复用（通用/个人范围）",
    "结果导出CSV、手动分页、费用合计",
    "IE11 兼容"
], LIGHT_BLUE)

add_card(slide, 1.93, 11, 29.5, 4, "技术约束", [
    "IRIS 2021.1.2 + ObjectScript + CSP + HISUI(EasyUI) + jQuery 1.11",
    "前端 IE11 兼容：var + function，无 ES6+ (let/const/Promise)",
    "后端 Global 遍历，JSON 用 %DynamicArray.%FromJSON()"
], GREEN)

# =====================================================
# Slide 4: 1.1 Data Model
# =====================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_page_title(slide, "1.1 / 数据模型与字段体系")
add_brand_blocks(slide)
add_logo(slide)

add_card(slide, 1.93, 3.8, 14, 12, "^DHCMRInfo Global 结构", [
    "^DHCMRInfo(id) = 字段1 ^ 字段2 ^ ... ^ 字段N",
    "349 可用字段，piece 位置固定",
    "元数据：field / title / type / piece / group",
    "类型体系：String / Date / Number / CTLoc / Gender / MultiPiece",
    "10 大分组：住院信息/诊断信息/手术信息/费用信息等"
], DEEP_BLUE)

add_card(slide, 17.5, 3.8, 14, 12, "349 个字段分布", [
    "住院信息: 122 (入院/出院/病案/颅脑等)",
    "手术信息: 81 (手术编码/医师/麻醉/切口)",
    "诊断信息: 75 (各类诊断/病理/感染/符合情况)",
    "费用信息: 31 | 基本信息: 28",
    "不良事件: 13 护理信息: 9 其他: 34",
    "聚合字段(4): 所有诊断/手术 应对模糊搜索"
], LIGHT_BLUE)

# =====================================================
# Slide 5: 02 Architecture
# =====================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_page_title(slide, "02 / 系统架构设计")
add_brand_blocks(slide)
add_logo(slide)

layers = [
    (3.8, "展示层", "CSP + HISUI + JS / IE11兼容 / $.cm()调用", DEEP_BLUE),
    (9.5, "API/业务层", "web.YZSY.DHCMRCustomQuery / GetFieldMeta / QueryData / MatchValue / 模板CRUD", LIGHT_BLUE),
    (15, "数据层", "^DHCMRInfo Global + ^User.DHCMRQueryTemplateD + User.DHCMRQueryTemplate(持久类/SQL双通)", GREEN),
]
for y, name, desc, color in layers:
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(4), Cm(y), Cm(25), Cm(4.5))
    shape.fill.solid()
    shape.fill.fore_color.rgb = WHITE
    shape.line.color.rgb = color
    shape.line.width = Pt(2)
    tag = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(4.3), Cm(y + 0.3), Cm(4), Cm(1))
    tag.fill.solid()
    tag.fill.fore_color.rgb = color
    tag.line.fill.background()
    tf = tag.text_frame
    tf.paragraphs[0].alignment = PP_ALIGN.CENTER
    run = tf.paragraphs[0].add_run()
    run.text = name
    run.font.size = Pt(16)
    run.font.bold = True
    run.font.color.rgb = WHITE
    txBox = slide.shapes.add_textbox(Cm(9.5), Cm(y + 1.2), Cm(18), Cm(2.5))
    tf2 = txBox.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    run = p.add_run()
    run.text = desc
    run.font.size = Pt(14)
    run.font.color.rgb = DARK_GRAY

# =====================================================
# Slide 6: 2.1 Interaction
# =====================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_page_title(slide, "2.1 / 前后端交互与关键设计")
add_brand_blocks(slide)
add_logo(slide)

add_card(slide, 1.93, 3.8, 14, 6, "$.cm() 标准调用模式", [
    "$.cm({ClassName, MethodName, params..., wantreturnval:1})",
    "后端 ClassMethod 返回 JSON 字符串",
    "前端 callback(data) 解析 data.rows / data.total",
    "所有接口走此模式，无 REST API"
], DEEP_BLUE)

add_card(slide, 17.5, 3.8, 14, 6, "查询完整流程", [
    "1. 前端 collectConditions() 收集条件JSON",
    "2. $.cm() QueryData(columns, conditions, page, rows)",
    "3. 后端解析 %DynamicArray, 遍历 ^DHCMRInfo",
    "4. MatchValue 逐条件比对 -> 分页切片 -> 返回JSON"
], LIGHT_BLUE)

add_card(slide, 1.93, 10.5, 29.5, 5.5, "关键设计决策", [
    "列元数据内置 GetFieldMeta() CLS方法中(349条JSON) -- 避免额外数据库查询",
    "条件引擎：组内 AND，组间 OR -- 分组匹配后任意一组通过即命中",
    "手动分页：全量匹配 -> 内存分页(200K条限制保护)",
    "模板存储：Global $lb 10位格式 + User.DHCMRQueryTemplate 持久类(SQL双通道)"
], GREEN)

# =====================================================
# Slide 7: 03 Key Tech
# =====================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_page_title(slide, "03 / 关键技术实现")
add_brand_blocks(slide)
add_logo(slide)

add_card(slide, 1.93, 3.8, 14, 6, "动态字段选择器", [
    "349 字段 · 10 分组 tabs 切换 · 关键词搜索",
    "HTML5 Drag API 拖拽排序 (IE11 draggable/ondragstart)",
    "DEFAULT_FIELDS 预设 11 常用默认列",
    "FIELD_META 兜底补全 type (兼容旧模板)"
], DEEP_BLUE)

add_card(slide, 17.5, 3.8, 14, 6, "动态条件引擎", [
    "字段类型决定运算符 (Date->区间, String->包含)",
    "CTLoc: ID自动转 ^CTLOC 描述后再匹配",
    "Gender: 1->男 2->女 自动转换",
    "MultiPiece: 负 piece 拼接多字段后再比较"
], LIGHT_BLUE)

add_card(slide, 1.93, 11, 14, 6, "模板系统 (Global + SQL)", [
    "Global $lb 10位存储 + %Persistent SQL 双通道",
    "模板管理独立页面 (编辑/禁用/默认/展开详情)",
    "编辑弹窗实时预览列配置和条件明细",
    "模板加载: setTimeout 级联恢复 datebox/combobox"
], GREEN)

add_card(slide, 17.5, 11, 14, 6, "数据转换与类型安全", [
    "Date: $zd(+val,3) -> 2026-04-01",
    "CTLoc: $p(^CTLOC(id),'^',2) -> 科室名",
    "time 字段 +$p 强制数字防 SQL 报错",
    "buildColumnsWithType() 始终查 FIELD_META"
], ORANGE)

# =====================================================
# Slide 8: 3.1 MatchValue
# =====================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_page_title(slide, "3.1 / 条件匹配引擎详解")
add_brand_blocks(slide)
add_logo(slide)

add_card(slide, 1.93, 3.8, 13, 13, "MatchValue 核心逻辑", [
    "contains: $find(actualVal, condVal) > 0",
    "startswith: $e(actualVal, 1, $l(condVal))",
    "eq/neq/gt/lt/gte/lte: 直接比较",
    "between: $p(~)拆分为 v1/v2 -> 区间判断",
    "Date: condVal 先 $zdh(,3) 再比较",
    "CTLoc: actualVal 先 $p(^CTLOC) 转描述再比较",
    "MultiPiece: negative piece -> BuildMultiPiece 拼接16-20个piece"
], DEEP_BLUE)

add_card(slide, 16.5, 3.8, 15.5, 6, "Global 遍历 + 分组匹配", [
    "s id=0 for { s id=$o(^DHCMRInfo(id)) q:id=\"\"",
    "每组内逐条件 MatchValue (组内 AND)",
    "任一组全通过 -> groupMatch=1 (组间 OR)",
    "匹配行收集到数组 -> 手动分页切片",
    "200K 上限保护，超限返回 error"
], LIGHT_BLUE)

add_card(slide, 16.5, 10.5, 15.5, 6, "前端条件收集 collectConditions()", [
    "遍历 #condContainer 下所有 .cond-group",
    "combobox(\"getValue\") 读字段选择",
    "datebox(\"getValue\") 读日期输入",
    "收集 field/piece/type/op/value/logic/groupId",
    "JSON.stringify -> 后端 %DynamicArray.FromJSON"
], GREEN)

# =====================================================
# Slide 9: 04 Lessons Learned
# =====================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_page_title(slide, "04 / 经验总结与最佳实践")
add_brand_blocks(slide)
add_logo(slide)

lessons = [
    (DEEP_BLUE, "IRIS 编译陷阱", [
        "for 内 quit 带返回值 -> 编译报错 (改用标志变量+循环外判断)",
        "&&/|| 两侧不能有空格: )&&( 正确, ) && ( 错误",
        "$find 必须全拼, $lg/$li 位置从 1 开始 (含%%CLASSNAME)",
        "elseif 不能用于内联单行, 需独立 if 或块结构"
    ]),
    (LIGHT_BLUE, "持久类 SQL 双通道", [
        "%Persistent 需显式 Storage 定义 + Data 段映射 piece->属性",
        "IdLocation 计数器在 root 不是 (0): $i(^Global) 不是 $i(^Global(0))",
        "直接写 Global 不触发 SQL 投影, 需 %Save() 或显式 Storage",
        "SqlColumnNumber + SqlFieldName 让 SELECT 可用"
    ]),
    (GREEN, "前端 IE11 兼容", [
        "全部 var + function, 无 ES6+ (let/const/Promise/=>)",
        "classList -> className.indexOf(), dataset -> getAttribute()",
        "combobox('getValue') / datebox('getValue') 读 HISUI 组件值",
        "$.parser.parse() 初始化动态DOM, setTimeout 级联恢复"
    ]),
    (ORANGE, "数据类型安全", [
        "$p 返回值是字符串, $zd/$zdh 需 +val 强制转数字",
        "DEFAULT_FIELDS 必带 type, buildColumnsWithType 从 FIELD_META 兜底",
        "模板保存时 time 字段 +$p($h,\",\",2) 防字符串写入 (SQL <LIST> 致命错误)",
        "JSON 通过 $lb 安全存储, 不受特殊字符影响"
    ]),
]
for i, (color, title, items) in enumerate(lessons):
    left = 1.93 + (i % 2) * 16
    top = 3.8 + (i // 2) * 7.2
    add_card(slide, left, top, 15, 6.8, title, items, color)

# =====================================================
# Slide 10: Closing
# =====================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])

txBox = slide.shapes.add_textbox(Cm(5), Cm(5), Cm(24), Cm(3))
tf = txBox.text_frame
p = tf.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
run = p.add_run()
run.text = "THANKS"
run.font.size = Pt(52)
run.font.bold = True
run.font.color.rgb = DEEP_BLUE

txBox2 = slide.shapes.add_textbox(Cm(5), Cm(8.5), Cm(24), Cm(2))
tf2 = txBox2.text_frame
p2 = tf2.paragraphs[0]
p2.alignment = PP_ALIGN.CENTER
run2 = p2.add_run()
run2.text = "IRIS HIS 病案编目数据自定义查询系统"
run2.font.size = Pt(22)
run2.font.color.rgb = DARK_GRAY

txBox3 = slide.shapes.add_textbox(Cm(5), Cm(11), Cm(24), Cm(2))
tf3 = txBox3.text_frame
p3 = tf3.paragraphs[0]
p3.alignment = PP_ALIGN.CENTER
run3 = p3.add_run()
run3.text = "2026年7月"
run3.font.size = Pt(16)
run3.font.color.rgb = DARK_GRAY

colors_blocks = [GREEN, YELLOW, GREEN, LIGHT_BLUE, LIGHT_BLUE, LIGHT_BLUE]
x_start = Cm(12.5)
for i, c in enumerate(colors_blocks):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x_start + i * Cm(1.2), Cm(14.5), Cm(0.8), Cm(0.8))
    shape.fill.solid()
    shape.fill.fore_color.rgb = c
    shape.line.fill.background()

txBox4 = slide.shapes.add_textbox(Cm(5), Cm(16.5), Cm(24), Cm(1.5))
tf4 = txBox4.text_frame
p4 = tf4.paragraphs[0]
p4.alignment = PP_ALIGN.CENTER
run4 = p4.add_run()
run4.text = "科技呵护健康  孪生助力成功"
run4.font.size = Pt(14)
run4.font.color.rgb = LIGHT_BLUE

# =====================================================
# Slide 2.5: Visual Plan - Layout
# =====================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_page_title(slide, "可视化方案 / 模板列表悬浮弹框")
add_brand_blocks(slide)
add_logo(slide)

add_card(slide, 1.93, 3.8, 14, 6, "方案概述", [
    "模板列表从顶部折叠面板 -> 悬浮弹框 (固定右上角图标触发)",
    "position:fixed 图标始终可见，点击弹出模板列表",
    "弹框跟随图标定位，三角箭头指向触发按钮",
    "点击外部/引用模板后自动关闭"
], DEEP_BLUE)

add_card(slide, 17.5, 3.8, 14, 6, "交互流程", [
    "点击 右上角图标 -> 弹框 toggle 显示/隐藏",
    "弹框内: 当前模板指示器 + 模板列表 + 底部操作",
    "引用模板: 加载列+条件 -> 弹框自动关闭",
    "4种关闭方式: 再次点击/外部点击/引用模板/ESC"
], LIGHT_BLUE)

add_card(slide, 1.93, 10.5, 29.5, 5.5, "关键代码片段", [
    "document.addEventListener('click', fn) -- 点击外部关闭弹框",
    "toggleTplPopup() -- 弹框显示/隐藏 toggle, hideTplPopup() 折叠",
    "renderTemplateList(rows) -- 渲染模板列表至 #popTplItems",
    "showCurrentTemplate() -- 更新弹框顶部指示器 + 图标红点标记"
], GREEN)

# =====================================================
# Slide 2.6: Visual Plan - UI Mockup
# =====================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_page_title(slide, "可视化方案 / 页面布局对比")
add_brand_blocks(slide)
add_logo(slide)

# Before
add_card(slide, 1.93, 3.8, 14, 5.5, "改造前: 顶部折叠面板", [
    "模板面板 (#tplPanel) 嵌入页面顶部",
    "占据主内容区上方空间，挤压查询结果",
    "展开/折叠切换与标题栏耦合",
    "问题: 空间浪费, 交互不够直观"
], LIGHT_GRAY)

# After
add_card(slide, 17.5, 3.8, 14, 5.5, "改造后: 悬浮弹框", [
    "右上角图标 (position:fixed) 触发悬浮弹框",
    "弹框浮动显示，不占用页面布局空间",
    "主内容区 (查询条件+结果表格) 满屏显示",
    "优势: 空间利用率高, 交互清晰"
], DEEP_BLUE)

# Layout ascii art
txBox = slide.shapes.add_textbox(Cm(1.93), Cm(10), Cm(30), Cm(6.5))
tf = txBox.text_frame
tf.word_wrap = True

lines = [
    ("页面布局结构", True, DEEP_BLUE, Pt(16)),
    ("", False, DARK_GRAY, Pt(12)),
    ("+-- 标题栏 -------- [模板管理] ------------------------------+", False, DARK_GRAY, Pt(11)),
    ("+-- 输出列芯片 + 条件组 + 按钮区 ------------------------------+", False, DARK_GRAY, Pt(11)),
    ("+-- 查询结果 Datagrid (flex:1) -------------------------------+", False, DARK_GRAY, Pt(11)),
    ("                                                                 右上角: [icon]", False, LIGHT_BLUE, Pt(10)),
    ("                                                                 点击弹出悬浮框", False, LIGHT_BLUE, Pt(10)),
]
for i, (text, bold, color, size) in enumerate(lines):
    if i == 0:
        p = tf.paragraphs[0]
    else:
        p = tf.add_paragraph()
    run = p.add_run()
    run.text = text
    run.font.size = size
    run.font.bold = bold
    run.font.color.rgb = color

# =====================================================
# Slide 5.5: Screenshot Placeholders
# =====================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_page_title(slide, "系统截图 / 功能介绍")
add_brand_blocks(slide)
add_logo(slide)

screens = [
    ("查询主界面", "输出列选择 + 动态条件 + 查询结果 datagrid + 费用 footer", DEEP_BLUE),
    ("字段选择器弹窗", "分组 tabs + 搜索过滤 + 已选列拖拽排序 + 全选/反选", LIGHT_BLUE),
    ("模板管理界面", "模板列表 + 编辑弹窗(实时预览列/条件) + 启用/禁用/默认", GREEN),
    ("模板悬浮弹框", "右上角图标触发 + 模板列表 + 当前模板指示器 + 引用/明细", ORANGE),
]
for i, (name, desc, color) in enumerate(screens):
    left = 1.93 + (i % 2) * 16
    top = 3.8 + (i // 2) * 7.2
    # Placeholder frame
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(left), Cm(top), Cm(15), Cm(5.5))
    shape.fill.solid()
    shape.fill.fore_color.rgb = LIGHT_GRAY
    shape.line.color.rgb = color
    shape.line.width = Pt(1.5)
    shape.line.dash_style = 2  # dashed
    # Label
    txBox = slide.shapes.add_textbox(Cm(left + 1), Cm(top + 1.5), Cm(13), Cm(3))
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    run = p.add_run()
    run.text = u"[ 截图 ]"
    run.font.size = Pt(20)
    run.font.bold = True
    run.font.color.rgb = color
    p2 = tf.add_paragraph()
    p2.alignment = PP_ALIGN.CENTER
    run2 = p2.add_run()
    run2.text = name
    run2.font.size = Pt(18)
    run2.font.bold = True
    run2.font.color.rgb = DEEP_BLUE
    p3 = tf.add_paragraph()
    p3.alignment = PP_ALIGN.CENTER
    run3 = p3.add_run()
    run3.text = desc
    run3.font.size = Pt(12)
    run3.font.color.rgb = DARK_GRAY

# =====================================================
# Slide: API Design
# =====================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_page_title(slide, "后端 API 接口设计")
add_brand_blocks(slide)
add_logo(slide)

apis = [
    ("QueryData", "columns/conditions/page/rows", "遍历 ^DHCMRInfo + 分组匹配 + 分页切片 + footer合计"),
    ("GetFieldMeta", "", "返回 349 字段 JSON (含分组/类型/piece)"),
    ("SaveTemplate", "Name/Scope/Columns/Conditions", "Global $lb 存储 + 重复名称校验"),
    ("GetTemplateList", "UserID/IsActive", "按 Scope 过滤: 通用或本人"),
    ("GetTemplateDetail", "ID", "返回完整 ColumnsJSON + ConditionsJSON"),
    ("DeleteTemplate", "ID/UserID", "仅创建者可删除"),
    ("ToggleDefault/ToggleActive", "ID", "设置/取消默认, 启用/禁用"),
    ("GetFieldPiece", "field", "字段名 -> piece 位置映射 (349条)"),
]
y = Cm(3.8)
for name, params, desc in apis:
    txBox = slide.shapes.add_textbox(Cm(1.93), y, Cm(6), Cm(1.2))
    tf = txBox.text_frame
    p = tf.paragraphs[0]
    run = p.add_run()
    run.text = name
    run.font.size = Pt(14)
    run.font.bold = True
    run.font.color.rgb = DEEP_BLUE
    txBox2 = slide.shapes.add_textbox(Cm(8), y, Cm(12), Cm(1.2))
    tf2 = txBox2.text_frame
    p2 = tf2.paragraphs[0]
    run2 = p2.add_run()
    run2.text = params if params else "(no params)"
    run2.font.size = Pt(11)
    run2.font.color.rgb = DARK_GRAY
    txBox3 = slide.shapes.add_textbox(Cm(20), y, Cm(13), Cm(1.2))
    tf3 = txBox3.text_frame
    tf3.word_wrap = True
    p3 = tf3.paragraphs[0]
    run3 = p3.add_run()
    run3.text = desc
    run3.font.size = Pt(11)
    run3.font.color.rgb = DARK_GRAY
    y += Cm(1.6)

# =====================================================
# Slide: 界面功能介绍
# =====================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_page_title(slide, "查询主界面 / 功能模块介绍")
add_brand_blocks(slide)
add_logo(slide)

ui_modules = [
    (1.93, 3.8, 9, 5.5, "1. 输出列配置", [
        "点击 [选择列...] 打开字段选择器",
        "10 大分组 tabs 切换 + 关键词搜索",
        "已选列拖拽排序 (HTML5 Drag API)",
        "预设 11 常用默认列",
        "已选列以芯片形式展示"
    ], DEEP_BLUE),
    (11.5, 3.8, 9, 5.5, "2. 查询条件区域", [
        "动态条件行: 字段 + 运算符 + 值",
        "条件组: 组内 AND, 组间 OR",
        "字段类型决定运算符和输入控件",
        "Date -> datebox, CTLoc -> 文本框",
        "聚合字段: 所有诊断/手术名称"
    ], LIGHT_BLUE),
    (21.5, 3.8, 10.5, 5.5, "3. 结果数据表格", [
        "HISUI datagrid 动态列",
        "手动分页 (20/50/100)",
        "Footer 费用合计行",
        "右键导出 Excel (CSV BOM)",
        "200K 行上限保护"
    ], GREEN),
    (1.93, 10, 9, 6.5, "4. 模板系统", [
        "右上角图标 -> 悬浮弹框",
        "保存/引用/新增模板",
        "当前模板指示器 + 红点标记",
        "模板管理独立页面",
        "编辑预览列配置和条件",
        "通用/个人范围 + 启用/禁用"
    ], ORANGE),
    (11.5, 10, 9, 6.5, "5. 字段选择器弹窗", [
        "左: 分组树 + 搜索框",
        "右: 已选列拖拽排序面板",
        "全选 / 反选 / 确认",
        "checkbox 勾选即时同步",
        "关闭弹窗立即刷新表头"
    ], LIGHT_BLUE),
    (21.5, 10, 10.5, 6.5, "6. 条件输入控件", [
        "String: 文本框 + 包含/不包含/左匹配",
        "Date: 日期框 + 等于/区间/大于小于",
        "Number: 文本框 + 等于/区间/大于小于",
        "CTLoc: 文本框 + 描述匹配",
        "Gender: 文本框 + 字符串匹配"
    ], DEEP_BLUE),
]

for left, top, w, h, title, items, color in ui_modules:
    add_card(slide, left, top, w, h, title, items, color)

# =====================================================
# Slide: 避坑指南
# =====================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_page_title(slide, u"避坑指南 / IRIS HIS 开发常见陷阱")
add_brand_blocks(slide)
add_logo(slide)

pitfalls = [
    (DEEP_BLUE, u"坑1: for 循环内 quit 带返回值", [
        u"错误: for{... if match q \"result\"}",
        u"正确: for{... if match {s result=\"x\" q}} if $d(result) q result",
        u"原理: IRIS 编译器不允许循环内 quit 带参数",
        u"影响: 编译直接报错，必须重构循环逻辑"
    ]),
    (LIGHT_BLUE, u"坑2: 持久类 Global 直接写入 SQL 不可见", [
        u"错误: 直接 $i(^GlobalD(0)) + $lb 写入",
        u"正确: 显式 Storage 定义 Data 段映射 piece->属性",
        u"关键: IdLocation 计数器在 root 不是 (0)",
        u"影响: SELECT 表不存在或 <LIST> 致命错误"
    ]),
    (GREEN, u"坑3: $p 返回值是字符串不是数字", [
        u"错误: $p($h,\",\",2) -> \"81923\" 字符串写入 $lb",
        u"正确: +$p($h,\",\",2) -> 81923 数字",
        u"影响: SQL %Time 字段读取时触发 <LIST> 错误",
        u"教训: $zd/$zdh 同样需要 +val 强制转数字"
    ]),
    (ORANGE, u"坑4: &&/|| 运算符空格 → 编译报错", [
        u"错误: (a = 1) && (b = 2)  -- 有空格",
        u"正确: (a=1)&&(b=2)  -- 无空格",
        u"同理: '[ 不包含运算符内部不能有空格",
        u"elseif 不能内联单行: 用独立 if 或块结构"
    ]),
    (DEEP_BLUE, u"坑5: DEFAULT_FIELDS 缺少 type", [
        u"错误: {field:\"MR_CYRQ\", title:\"出院日期\", piece:39}",
        u"正确: 必须加 type:\"Date\"",
        u"后果: buildColumnsWithType() 发送 type:\"String\"",
        u"后果: 后端 $zd 转换被跳过，显示原始数字"
    ]),
    (LIGHT_BLUE, u"坑6: IE11 兼容陷阱", [
        u"禁用: let/const/Promise/箭头函数/模板字符串",
        u"classList -> className.indexOf('cls') !== -1",
        u"dataset -> getAttribute('data-xxx')",
        u"combobox/datebox 必须用 .'getValue()' 读值"
    ]),
    (GREEN, u"坑7: 模板加载数据丢失", [
        u"问题: columns JSON 不包含 columnsJSON 列 -> undefined",
        u"修复: GetTemplateDetail 异步获取 + 缓存变量",
        u"问题: restoreConditions 时序: setTimeout 级联",
        u"150ms 字段 -> 350ms 运算符 -> 600ms 值"
    ]),
    (ORANGE, u"坑8: Global 节点 (0) 导致 <LIST>", [
        u"问题: $i(^Global(0)) 在 subscript 0 存数字",
        u"SQL 遍历时读到非 $lb 节点 -> <LIST>",
        u"修复: kill ^Global(0) + $i(^Global) 用 root",
        u"修复: set ^Global=$o(^Global(\"\"),-1) 修正计数器"
    ]),
]

for i, (color, title, items) in enumerate(pitfalls):
    left = 1.93 + (i % 4) * 8
    top = 3.8 + (i // 4) * 7.5
    add_card(slide, left, top, 7.5, 7, title, items, color)

output_path = "d:/claude code/IRIS/病案编目自定义查询系统_开发经验分享.pptx"
prs.save(output_path)
print(f"PPT saved to: {output_path}")
print(f"Slides: {len(prs.slides)}")
