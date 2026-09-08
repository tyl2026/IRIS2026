# -*- coding: utf-8 -*-
"""IRIS HIS 病案编目数据自定义查询系统 — 开发经验分享 PPT v2 (完整重构版)"""
from pptx import Presentation
from pptx.util import Cm, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

# ── 配色 ──
DEEP_BLUE  = RGBColor(0x00, 0x47, 0x9D)
LIGHT_BLUE = RGBColor(0x00, 0xA9, 0xE4)
YELLOW     = RGBColor(0xF8, 0xB6, 0x2D)
GREEN      = RGBColor(0x13, 0xAE, 0x67)
ORANGE     = RGBColor(0xED, 0x7D, 0x31)
DARK_GRAY  = RGBColor(0x26, 0x26, 0x26)
MID_GRAY   = RGBColor(0x66, 0x66, 0x66)
LIGHT_GRAY = RGBColor(0xF2, 0xF2, 0xF2)
WHITE      = RGBColor(0xFF, 0xFF, 0xFF)

prs = Presentation()
prs.slide_width  = Cm(33.867)
prs.slide_height = Cm(19.05)

# ── 工具函数 ──
def add_blocks(slide, x=Cm(1.93), y=Cm(17.8)):
    for i, c in enumerate([GREEN, YELLOW, GREEN, LIGHT_BLUE, LIGHT_BLUE, LIGHT_BLUE]):
        s = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x + i * Cm(0.75), y, Cm(0.6), Cm(0.6))
        s.fill.solid(); s.fill.fore_color.rgb = c; s.line.fill.background()

def add_logo(slide):
    tb = slide.shapes.add_textbox(Cm(23), Cm(0.4), Cm(10), Cm(1))
    tf = tb.text_frame; p = tf.paragraphs[0]; p.alignment = PP_ALIGN.RIGHT
    r = p.add_run(); r.text = "iMED"; r.font.size = Pt(14); r.font.color.rgb = DEEP_BLUE; r.font.bold = True
    r = p.add_run(); r.text = "WAY"; r.font.size = Pt(14); r.font.color.rgb = YELLOW; r.font.bold = True

def add_title(slide, text):
    tb = slide.shapes.add_textbox(Cm(1.93), Cm(1.2), Cm(28), Cm(1.5))
    r = tb.text_frame.paragraphs[0].add_run()
    r.text = text; r.font.size = Pt(30); r.font.bold = True; r.font.color.rgb = DEEP_BLUE

def add_card(slide, L, T, W, H, title, lines, color=DEEP_BLUE):
    """统一卡片：白色底 + 左边色条 + 标题 + 条目列表"""
    box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(L), Cm(T), Cm(W), Cm(H))
    box.fill.solid(); box.fill.fore_color.rgb = WHITE
    box.line.color.rgb = color; box.line.width = Pt(1)
    bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Cm(L), Cm(T), Cm(0.15), Cm(H))
    bar.fill.solid(); bar.fill.fore_color.rgb = color; bar.line.fill.background()
    # title
    tb = slide.shapes.add_textbox(Cm(L + 0.6), Cm(T + 0.3), Cm(W - 0.9), Cm(1))
    r = tb.text_frame.paragraphs[0].add_run()
    r.text = title; r.font.size = Pt(18); r.font.bold = True; r.font.color.rgb = color
    # lines
    tb2 = slide.shapes.add_textbox(Cm(L + 0.6), Cm(T + 1.6), Cm(W - 0.9), Cm(H - 2))
    tf = tb2.text_frame; tf.word_wrap = True
    for i, line in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.space_after = Pt(5)
        p.line_spacing = Pt(22)
        r = p.add_run()
        r.text = line[0] if isinstance(line, tuple) else u"· " + line
        r.font.size = Pt(13) if isinstance(line, tuple) else Pt(12)
        r.font.color.rgb = line[1] if isinstance(line, tuple) else DARK_GRAY
        r.font.bold = line[2] if isinstance(line, tuple) and len(line) > 2 else False

def add_chapter(slide, num, title):
    """章节分隔页"""
    # large number
    tb = slide.shapes.add_textbox(Cm(3), Cm(6.5), Cm(6), Cm(4))
    r = tb.text_frame.paragraphs[0].add_run()
    r.text = num; r.font.size = Pt(72); r.font.bold = True; r.font.color.rgb = DEEP_BLUE
    # slash
    tb2 = slide.shapes.add_textbox(Cm(9), Cm(7.5), Cm(2), Cm(2))
    r2 = tb2.text_frame.paragraphs[0].add_run()
    r2.text = "/"; r2.font.size = Pt(48); r2.font.color.rgb = LIGHT_BLUE
    # title
    tb3 = slide.shapes.add_textbox(Cm(11), Cm(7.5), Cm(18), Cm(2))
    r3 = tb3.text_frame.paragraphs[0].add_run()
    r3.text = title; r3.font.size = Pt(36); r3.font.bold = True; r3.font.color.rgb = DEEP_BLUE
    # right-side decorative blocks
    for i, (x, y, c) in enumerate([(Cm(26), Cm(3), LIGHT_BLUE), (Cm(28.5), Cm(5), YELLOW),
                                     (Cm(27), Cm(7), GREEN), (Cm(29), Cm(9), LIGHT_BLUE)]):
        s = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Cm(1), Cm(1))
        s.fill.solid(); s.fill.fore_color.rgb = c; s.line.fill.background()
    add_blocks(slide)

def add_two_col(slide, L, T, title1, lines1, title2, lines2, c1=DEEP_BLUE, c2=LIGHT_BLUE):
    add_card(slide, L, T, 14.5, 13, title1, lines1, c1)
    add_card(slide, L + 15.5, T, 14.5, 13, title2, lines2, c2)

def add_three_col(slide, L, T, items):
    """items = [(title, lines, color), ...] × 3"""
    for i, (title, lines, color) in enumerate(items):
        add_card(slide, L + i * 10.3, T, 9.5, 13, title, lines, color)


# ═══════════════════════════════════════
#  1. 封面
# ═══════════════════════════════════════
sl = prs.slides.add_slide(prs.slide_layouts[6])

tb = sl.shapes.add_textbox(Cm(3.08), Cm(2.61), Cm(8), Cm(1.2))
tf = tb.text_frame
r1 = tf.paragraphs[0].add_run(); r1.text = "iMED"; r1.font.size = Pt(36); r1.font.color.rgb = DEEP_BLUE; r1.font.bold = True
r2 = tf.paragraphs[0].add_run(); r2.text = "WAY"; r2.font.size = Pt(36); r2.font.color.rgb = YELLOW; r2.font.bold = True
p2 = tf.add_paragraph()
r3 = p2.add_run(); r3.text = u"东华医为"; r3.font.size = Pt(14); r3.font.color.rgb = DARK_GRAY

tb = sl.shapes.add_textbox(Cm(2.56), Cm(5.5), Cm(20), Cm(4))
tf = tb.text_frame
for i, txt in enumerate([u"IRIS HIS", u"病案编目数据自定义查询系统"]):
    p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
    r = p.add_run(); r.text = txt; r.font.size = Pt(44); r.font.bold = True; r.font.color.rgb = DEEP_BLUE

tb = sl.shapes.add_textbox(Cm(2.68), Cm(10.2), Cm(10), Cm(1.5))
r = tb.text_frame.paragraphs[0].add_run()
r.text = u"开发经验分享"; r.font.size = Pt(26); r.font.color.rgb = DEEP_BLUE

tb = sl.shapes.add_textbox(Cm(2.68), Cm(14.5), Cm(6), Cm(2))
r = tb.text_frame.paragraphs[0].add_run()
r.text = u"2026年7月"; r.font.size = Pt(14); r.font.color.rgb = DARK_GRAY

for x, y, c in [(Cm(24), Cm(3), LIGHT_BLUE), (Cm(27), Cm(2), DEEP_BLUE), (Cm(26), Cm(6), GREEN),
                (Cm(28.5), Cm(4.5), YELLOW), (Cm(23.5), Cm(7), LIGHT_BLUE), (Cm(25.5), Cm(9.5), DEEP_BLUE)]:
    s = sl.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Cm(1.2), Cm(1.2))
    s.fill.solid(); s.fill.fore_color.rgb = c; s.line.fill.background()


# ═══════════════════════════════════════
#  2. 目录
# ═══════════════════════════════════════
sl = prs.slides.add_slide(prs.slide_layouts[6])
tb = sl.shapes.add_textbox(Cm(1.93), Cm(1), Cm(8), Cm(1.5))
tf = tb.text_frame
r = tf.paragraphs[0].add_run(); r.text = u"目录"; r.font.size = Pt(30); r.font.bold = True; r.font.color.rgb = DEEP_BLUE
p2 = tf.add_paragraph()
r2 = p2.add_run(); r2.text = "CONTENTS"; r2.font.size = Pt(14); r2.font.color.rgb = LIGHT_BLUE

toc = [
    ("01", u"项目背景与需求分析", u"为什么要做自定义查询系统"),
    ("02", u"系统架构与接口设计", u"三层架构 + 前后端交互 + API 一览"),
    ("03", u"界面功能介绍", u"6 大功能模块详解"),
    ("04", u"关键技术实现", u"条件引擎 / 模板系统 / 数据转换"),
    ("05", u"避坑指南", u"IRIS ObjectScript 8 大常见陷阱"),
    ("06", u"经验总结", u"最佳实践与开发规范"),
]
for i, (num, title, desc) in enumerate(toc):
    y = Cm(3.5 + i * 2.4)
    tb = sl.shapes.add_textbox(Cm(3), y, Cm(3), Cm(1.5))
    r = tb.text_frame.paragraphs[0].add_run();
    r.text = num; r.font.size = Pt(32); r.font.bold = True; r.font.color.rgb = DEEP_BLUE
    tb2 = sl.shapes.add_textbox(Cm(5.5), y + Cm(0.05), Cm(18), Cm(1))
    r2 = tb2.text_frame.paragraphs[0].add_run()
    r2.text = title; r2.font.size = Pt(22); r2.font.bold = True; r2.font.color.rgb = DARK_GRAY
    tb3 = sl.shapes.add_textbox(Cm(5.5), y + Cm(1.1), Cm(18), Cm(0.8))
    r3 = tb3.text_frame.paragraphs[0].add_run()
    r3.text = desc; r3.font.size = Pt(12); r3.font.color.rgb = MID_GRAY
    if i < 5:
        ln = sl.shapes.add_shape(MSO_SHAPE.RECTANGLE, Cm(5.5), y + Cm(2.1), Cm(25), Cm(0.015))
        ln.fill.solid(); ln.fill.fore_color.rgb = LIGHT_GRAY; ln.line.fill.background()


# ═══════════════════════════════════════
#  01 章：项目背景与需求分析
# ═══════════════════════════════════════
add_chapter(prs.slides.add_slide(prs.slide_layouts[6]), "01", u"项目背景与需求分析")

# 1.1 背景 + 需求
sl = prs.slides.add_slide(prs.slide_layouts[6])
add_title(sl, u"1.1 / 项目背景与核心需求"); add_blocks(sl); add_logo(sl)
add_two_col(sl, 1.93, 3.8,
    u"项目背景",
    [u"HIS 病案编目数据存储在 ^DHCMRInfo Global (596字段)",
     u"传统查询需手写 ObjectScript 代码遍历 Global",
     u"非技术人员无法自助查询, 每次需求都需开发介入",
     u"字段多(349可用)、分组杂、缺乏灵活查询工具"],
    u"核心需求",
    [u"自由选择输出列 (支持搜索、分组、拖拽排序)",
     u"动态查询条件 (AND/OR + 条件组, 6种运算符)",
     u"查询模板保存/引用/管理 (通用/个人范围)",
     u"结果导出 CSV, 手动分页, footer 费用合计",
     u"IE11 兼容 (ES5 语法, 无 let/const/Promise)"])

# 1.2 数据模型
sl = prs.slides.add_slide(prs.slide_layouts[6])
add_title(sl, u"1.2 / 数据模型与字段体系"); add_blocks(sl); add_logo(sl)
add_two_col(sl, 1.93, 3.8,
    u"^DHCMRInfo Global 结构",
    [u"^DHCMRInfo(id) = 字段1 ^ 字段2 ^ ... ^ 字段N",
     u"349 可用字段, piece 位置固定 (1~352)",
     u"元数据: field / title / type / piece / group",
     u"类型: String, Date, Number, CTLoc, Gender",
     u"聚合: MR_ALLZD/ALLSS 等 MultiPiece 虚拟字段"],
    u"349 字段 / 10 大分组",
    [(u"住院信息(122)", DEEP_BLUE, True), (u"手术信息(81)", LIGHT_BLUE, True),
     (u"诊断信息(75)", GREEN, True), (u"费用信息(31)", ORANGE, True),
     (u"基本信息(28)", DEEP_BLUE, True), (u"其他(34)", MID_GRAY, True),
     (u"不良事件(13)", ORANGE, True), (u"护理信息(9)", GREEN, True)])


# ═══════════════════════════════════════
#  02 章：系统架构与接口设计
# ═══════════════════════════════════════
add_chapter(prs.slides.add_slide(prs.slide_layouts[6]), "02", u"系统架构与接口设计")

# 2.1 三层架构
sl = prs.slides.add_slide(prs.slide_layouts[6])
add_title(sl, u"2.1 / 三层架构"); add_blocks(sl); add_logo(sl)

for y, name, desc, color in [
    (Cm(3.8), u"展示层", u"CSP 页面 + HISUI 组件 (EasyUI) + JavaScript (IE11 ES5)", DEEP_BLUE),
    (Cm(9.5), u"API/业务层", u"web.YZSY.DHCMRCustomQuery (12 个 ClassMethod)", LIGHT_BLUE),
    (Cm(15.2), u"数据层", u"^DHCMRInfo Global + ^User.DHCMRQueryTemplateD + DHCMR_QueryTemplate SQL 表", GREEN),
]:
    box = sl.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(3), y, Cm(28), Cm(4.5))
    box.fill.solid(); box.fill.fore_color.rgb = WHITE; box.line.color.rgb = color; box.line.width = Pt(2)
    tag = sl.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(3.3), y + Cm(0.3), Cm(5), Cm(1))
    tag.fill.solid(); tag.fill.fore_color.rgb = color; tag.line.fill.background()
    tf = tag.text_frame; tf.paragraphs[0].alignment = PP_ALIGN.CENTER
    r = tf.paragraphs[0].add_run(); r.text = name; r.font.size = Pt(16); r.font.bold = True; r.font.color.rgb = WHITE
    tb = sl.shapes.add_textbox(Cm(9.5), y + Cm(1.2), Cm(20), Cm(2.5))
    r2 = tb.text_frame.paragraphs[0].add_run()
    r2.text = desc; r2.font.size = Pt(15); r2.font.color.rgb = DARK_GRAY

# 2.2 API 接口
sl = prs.slides.add_slide(prs.slide_layouts[6])
add_title(sl, u"2.2 / 后端 API 接口一览 (12 个 ClassMethod)"); add_blocks(sl); add_logo(sl)

apis = [
    (u"查询引擎", [u"QueryData(cols,conds,page,rows) -> 遍历+匹配+分页+footer",
                    u"GetFieldMeta() -> 349字段JSON (含分组/类型/piece)",
                    u"GetFieldPiece(field) -> 字段名转piece位置",
                    u"MatchValue(val,op,condVal,type) -> 条件匹配",
                    u"BuildMultiPiece(data,piece) -> 聚合字段拼接"]),
    (u"模板CRUD", [u"GetTemplateList(UserID,IsActive) -> 按Scope过滤",
                    u"SaveTemplate(ID,Name,Scope,...) -> 重复名校验",
                    u"DeleteTemplate(ID,UserID) -> 仅创建者可删",
                    u"GetTemplateDetail(ID) -> 完整JSON配置",
                    u"ToggleDefault(ID,val) / ToggleActive(ID,val)",
                    u"GetDefaultTemplate(UserID) -> 页面初始化加载"]),
    (u"交互模式", [u"前端 $.cm({ClassName, MethodName, param, wantreturnval:1})",
                    u"后端 ClassMethod 返回 JSON 字符串",
                    u"条件: JSON.stringify -> %DynamicArray.%FromJSON()",
                    u"分页: 全量匹配 -> 内存切片 (200K上限保护)"]),
]
for i, (title, lines) in enumerate(apis):
    add_card(sl, 1.93 + i * 10.5, Cm(3.8), 9.7, 11.5, title, lines,
             [DEEP_BLUE, LIGHT_BLUE, GREEN][i])


# ═══════════════════════════════════════
#  03 章：界面功能介绍
# ═══════════════════════════════════════
add_chapter(prs.slides.add_slide(prs.slide_layouts[6]), "03", u"界面功能介绍")

# 3.1 布局 + 字段选择器
sl = prs.slides.add_slide(prs.slide_layouts[6])
add_title(sl, u"3.1 / 查询主界面布局"); add_blocks(sl); add_logo(sl)
add_three_col(sl, 1.93, Cm(3.8), [
    (u"1. 输出列配置", [u"点击 [选择列...] 打开字段选择器弹窗",
                        u"分组 tabs 切换 + 关键词搜索过滤",
                        u"已选列拖拽排序 (HTML5 Drag API)",
                        u"预设 11 常用默认列 (姓名/病案号/...).",
                        u"列芯片展示 + 即时刷新表头"], DEEP_BLUE),
    (u"2. 查询条件区域", [u"动态条件行: 字段选择 + 运算符 + 值",
                          u"条件组概念: 组内 AND, 组间 OR",
                          u"字段类型决定运算符和输入控件",
                          u"Date -> datebox, CTLoc -> 文本框",
                          u"聚合字段: 所有诊断/所有手术名称"], LIGHT_BLUE),
    (u"3. 结果数据表格", [u"HISUI datagrid 动态列生成",
                          u"手动分页 (10/20/50/100条)",
                          u"Footer 行: 费用字段自动合计",
                          u"导出 Excel: CSV + BOM + Blob 下载",
                          u"200K 行上限, 超限提示缩小范围"], GREEN),
])

# 3.2 模板 + 字段选择器
sl = prs.slides.add_slide(prs.slide_layouts[6])
add_title(sl, u"3.2 / 模板系统 + 字段选择器"); add_blocks(sl); add_logo(sl)
add_two_col(sl, 1.93, Cm(3.8),
    u"4. 模板系统 (悬浮弹框)",
    [u"右上角图标 (position:fixed) 触发悬浮弹框",
     u"弹框内: 当前模板 + 列表 + [新增/管理]",
     u"保存/引用/新增模板 + 自动加载配置",
     u"模板管理独立页面 (编辑/禁用/默认)",
     u"编辑弹窗: 实时预览列配置 + 条件明细"],
    u"5. 字段选择器弹窗",
    [u"左: 分组树 + 搜索框, 右: 已选列面板",
     u"checkbox 勾选即时同步到已选列表",
     u"已选列支持拖拽排序 (HTML5 Drag API)",
     u"全选 / 反选 / 确认按钮",
     u"关闭弹窗立刻刷新 datagrid 表头"],
    ORANGE, DEEP_BLUE)

# 3.3 截图占位页
sl = prs.slides.add_slide(prs.slide_layouts[6])
add_title(sl, u"3.3 / 系统截图 (占位)"); add_blocks(sl); add_logo(sl)
screens = [
    (u"查询主界面", u"输出列芯片 + 条件组 + 结果表格 + footer"),
    (u"字段选择器", u"分组 tabs + 搜索 + 已选列拖拽"),
    (u"模板管理", u"列表 + 编辑弹窗(预览配置)"),
    (u"模板悬浮框", u"右上角图标 + 弹框列表 + 引用/明细"),
]
for i, (name, desc) in enumerate(screens):
    L = 1.93 + (i % 2) * 16; T = 3.8 + (i // 2) * 7.2
    box = sl.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(L), Cm(T), Cm(15), Cm(5.5))
    box.fill.solid(); box.fill.fore_color.rgb = LIGHT_GRAY
    box.line.color.rgb = DEEP_BLUE; box.line.width = Pt(1.5); box.line.dash_style = 2
    tb = sl.shapes.add_textbox(Cm(L + 1), Cm(T + 1.5), Cm(13), Cm(3))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
    r = p.add_run(); r.text = u"[ 截图: " + name + u" ]"; r.font.size = Pt(22); r.font.bold = True; r.font.color.rgb = DEEP_BLUE
    p2 = tf.add_paragraph(); p2.alignment = PP_ALIGN.CENTER
    r2 = p2.add_run(); r2.text = desc; r2.font.size = Pt(13); r2.font.color.rgb = DARK_GRAY


# ═══════════════════════════════════════
#  04 章：关键技术实现
# ═══════════════════════════════════════
add_chapter(prs.slides.add_slide(prs.slide_layouts[6]), "04", u"关键技术实现")

# 4.1 MatchValue 引擎
sl = prs.slides.add_slide(prs.slide_layouts[6])
add_title(sl, u"4.1 / 条件匹配引擎 (MatchValue + 分组逻辑)"); add_blocks(sl); add_logo(sl)

add_two_col(sl, 1.93, Cm(3.8),
    u"MatchValue 核心逻辑",
    [u"contains:    $find(actualVal, condVal) > 0",
     u"startswith:  $e(actualVal, 1, $l(condVal)) = condVal",
     u"eq/neq/gt/lt/gte/lte:  直接比较",
     u"between:      $p(~) 拆 v1/v2 -> 区间判断",
     u"Date 类型:    condVal 先 $zdh(,3) 再比较",
     u"CTLoc 类型:   actualVal 先 $p(^CTLOC) 转描述",
     u"Gender 类型:  1->男, 2->女"],
    u"Global 遍历 + 分组匹配流程",
    [u"1. 解析 columns/conditions JSON (%DynamicArray)",
     u"2. 按 groupId 分组条件, | 分隔条件字符串",
     u"3. s id=0 for { s id=$o(^DHCMRInfo(id)) q:id=\"\"",
     u"4. 每组内逐条件 MatchValue (组内 AND)",
     u"5. 任一组全通过 -> groupMatch=1 (组间 OR)",
     u"6. 匹配行收集到数组 -> 分页切片",
     u"7. 超 200K 立即中止, 返回 error"])

# 4.2 模板系统
sl = prs.slides.add_slide(prs.slide_layouts[6])
add_title(sl, u"4.2 / 模板系统实现"); add_blocks(sl); add_logo(sl)
add_two_col(sl, 1.93, Cm(3.8),
    u"存储方案",
    [u"Global $lb 10位: (%%CLASSNAME, Name, Scope,",
     u"  CreateUserID, ColumnsJSON, ConditionsJSON,",
     u"  IsDefault, IsActive, CreateDate, CreateTime)",
     u"持久类 User.DHCMRQueryTemplate 显式 Storage",
     u"Data 段精确映射 piece->属性 (SqlColumnNumber)",
     u"双通道: 后端直写 Global + SQL SELECT 可读"],
    u"前端加载/保存流程",
    [u"保存: selectedFields + collectConditions()",
     u"  -> JSON.stringify -> $.cm SaveTemplate",
     u"加载: GetTemplateDetail -> 解析 ColumnsJSON",
     u"  -> restoreConditions(conds) 恢复条件组",
     u"  -> setTimeout 级联: 150ms字段/350ms op/600ms值",
     u"编辑: 模板管理页 GetTemplateDetail 获取完整JSON"],
    DEEP_BLUE, GREEN)

# 4.3 数据转换
sl = prs.slides.add_slide(prs.slide_layouts[6])
add_title(sl, u"4.3 / 数据转换与类型安全"); add_blocks(sl); add_logo(sl)

add_three_col(sl, 1.93, Cm(3.8), [
    (u"输出列转换", [u"Date: $zd(+val, 3)  67661->2026-04-01",
                     u"CTLoc: $p(^CTLOC(id),'^',2)  35->内科",
                     u"Gender: 1->男, 2->女",
                     u"MultiPiece: BuildMultiPiece 拼接",
                     u"buildColumnsWithType() 始终查FIELD_META补全type"], DEEP_BLUE),
    (u"前端兜底机制", [u"模板旧数据无 type -> FIELD_META 自动补全",
                       u"combobox('getValue') 读字段值/类型",
                       u"datebox('getValue') 读取日期输入",
                       u"DEFAULT_FIELDS 必须包含 type 属性",
                       u"collectConditions() 收集完整元数据"], LIGHT_BLUE),
    (u"Critical Bug 修复", [u"$p($h,\",\",2) 返回字符串 -> +$p 强制数字",
                             u"$i(^Global(0)) -> $i(^Global) 计数器位置",
                             u"%Persistent Storage Data 段映射必须精确匹配 piece",
                             u"模板编辑 ColumnsJSON 为空 -> GetTemplateDetail 异步获取"], GREEN),
])


# ═══════════════════════════════════════
#  05 章：避坑指南
# ═══════════════════════════════════════
add_chapter(prs.slides.add_slide(prs.slide_layouts[6]), "05", u"避坑指南")

# 5.1 编译陷阱
sl = prs.slides.add_slide(prs.slide_layouts[6])
add_title(sl, u"5.1 / IRIS 编译陷阱 (4坑)"); add_blocks(sl); add_logo(sl)

add_two_col(sl, 1.93, Cm(3.8),
    u"坑1: for 内 quit 带返回值 -> 编译报错",
    [u"错误: for{... if match q \"result\"}",
     u"正确: for{... if match {s result=\"x\" q}}",
     u"  -> if $d(result) q result",
     u"原理: IRIS 编译器禁止循环内 quit 带参数",
     u"影响: QUIT with arguments not allowed here"],
    u"坑2: &&/||/=/elseif 语法陷阱",
    [u")&&( 不能写成 ) && (   -- 两侧不能有空格",
     u"'[ 不包含运算符内部不能有空格",
     u"postfix = 两侧不能空格: q:admId=\"\"",
     u"elseif 不能内联单行: 需独立 if 或块结构",
     u"for/while 块结构必须全拼, 不能缩写 f/w"],
    DEEP_BLUE, ORANGE)

# 5.2 持久类 + 数据
sl = prs.slides.add_slide(prs.slide_layouts[6])
add_title(sl, u"5.2 / 持久类与数据类型陷阱 (4坑)"); add_blocks(sl); add_logo(sl)

add_two_col(sl, 1.93, Cm(3.8),
    u"坑3: 持久类 Global 直写 SQL 不可见",
    [u"错误: 直写 ^Global 绕开 %Save() -> SQL 投影丢失",
     u"修复: 显式 Storage Data 段映射 piece->属性",
     u"关键: IdLocation 计数器在 root, 不在 (0)",
     u"修复旧数据: kill ^Global(0) + 修正 root 计数器",
     u"SqlColumnNumber + SqlFieldName 让 SELECT 可用"],
    u"坑4: 字符串 vs 数字类型错误 -> <LIST>",
    [u"$p 返回始终是字符串, 非数字",
     u"$p($h,\",\",2) -> \"81923\" 写入 $lb 10位",
     u"持久类 %Time 属性读取时触发 <LIST> 致命错误",
     u"修复: +$p($h,\",\",2) -> 81923 (数字)",
     u"同理: $zd(+val,3), $zdh(+val,3) 均需 +"],
    DEEP_BLUE, ORANGE)

# 5.3 前端
sl = prs.slides.add_slide(prs.slide_layouts[6])
add_title(sl, u"5.3 / 前端陷阱: IE11 + 模板加载 (4坑)"); add_blocks(sl); add_logo(sl)

add_two_col(sl, 1.93, Cm(3.8),
    u"坑5: IE11 兼容陷阱",
    [u"禁用: let/const/Promise/箭头函数/模板字符串",
     u"classList -> className.indexOf('cls') !== -1",
     u"dataset -> getAttribute('data-xxx')",
     u"Event: e = e || window.event (IE 无参数)",
     u"DnD: IE11 支持 draggable + dataTransfer.getData('text')"],
    u"坑6: 模板加载数据丢失",
    [u"问题: GetTemplateList 不返回 JSON 列",
     u"-> saveEdit() 取 row.ColumnsJSON = undefined -> '[]'",
     u"修复: 缓存变量 editingColsJSON / editingCondsJSON",
     u"修复: openEdit 调 GetTemplateDetail 获取完整数据",
     u"修复: restoreConditions 用 setTimeout 级联恢复"],
    DEEP_BLUE, ORANGE)

# 5.4 Default
sl = prs.slides.add_slide(prs.slide_layouts[6])
add_title(sl, u"5.4 / 默认字段 + 条件输入陷阱 (2坑)"); add_blocks(sl); add_logo(sl)

add_two_col(sl, 1.93, Cm(3.8),
    u"坑7: DEFAULT_FIELDS 缺少 type 属性",
    [u"错误: {field:\"MR_CYRQ\",title:\"出院日期\",piece:39}",
     u"正确: 必须加 type:\"Date\"",
     u"后果: f.type||\"String\" -> \"String\"",
     u"-> 后端 $zd 转换被跳过 -> 显示原始数字 67661",
     u"修复: 所有默认字段补齐 type + FIELD_META 兜底"],
    u"坑8: CTLoc/聚合字段条件输入不生效",
    [u"CTLoc: 数据存 ID(35), 用户输入描述(内科)",
     u"修复: MatchValue 中 actualVal 先 $p(^CTLOC) 转描述",
     u"聚合字段: 负 piece -> BuildMultiPiece 拼接16-20字段",
     u"Gender: 类型 String -> Gender, 加转换逻辑",
     u"前端运算符: CTLoc/Gender 用 String 组(包含/等于)"],
    DEEP_BLUE, ORANGE)


# ═══════════════════════════════════════
#  06 章：经验总结
# ═══════════════════════════════════════
add_chapter(prs.slides.add_slide(prs.slide_layouts[6]), "06", u"经验总结")

# 6.1 最佳实践
sl = prs.slides.add_slide(prs.slide_layouts[6])
add_title(sl, u"6.1 / 开发最佳实践"); add_blocks(sl); add_logo(sl)

add_three_col(sl, 1.93, Cm(3.8), [
    (u"后端开发规范", [u"先查 HISUI-工具表/ 确认 Global 结构和 piece",
                       u"数据验证: zw 逐层确认, 不确定的问用户",
                       u"modified files 仅改需求涉及行, 用 diff 验证",
                       u"编译前检查: for 内无 quit 带返回值",
                       u"CLS 无 BOM, CSP/JS/CSV 必带 BOM"], DEEP_BLUE),
    (u"持久类设计", [u"%Persistent 必须显式 Storage 定义",
                     u"Data 段精确映射 piece -> 属性 (SqlColumnNumber)",
                     u"IdLocation 用 root, 不用 (0) subscript",
                     u"$lb 位置 1 是 %%CLASSNAME, 属性从位置 2 开始",
                     u"Global + SQL 双通道: 直写 Global + SELECT 可查"], LIGHT_BLUE),
    (u"前端开发规范", [u"全部 var + function, 禁止 ES6+",
                       u"HISUI 组件值: combobox('getValue') / datebox('getValue')",
                       u"动态 DOM: $.parser.parse() 初始化 HISUI 控件",
                       u"FIELD_META 始终作为 type 兜底来源",
                       u"模板恢复: setTimeout 级联保证时序"], GREEN),
])

# 6.2 总结
sl = prs.slides.add_slide(prs.slide_layouts[6])
add_title(sl, u"6.2 / 项目总结"); add_blocks(sl); add_logo(sl)

add_two_col(sl, 1.93, Cm(3.8),
    u"成果",
    [u"完整自定义查询系统 (查询+模板+导出)",
     u"349 字段, 10 分组, 6 种类型, 4 聚合字段",
     u"8 种运算符 + AND/OR 条件组 + 手动分页",
     u"模板 CRUD (通用/个人) + SQL + Global 双通道",
     u"IE11 全兼容, 0 个 ES6+ 语法",
     u"输出列类型自动转换 (Date/CTLoc/Gender)"],
    u"技术栈",
    [u"后端: IRIS 2021.1.2 ObjectScript (12 方法, ~1000 行)",
     u"前端: CSP + HISUI (EasyUI) + jQuery 1.11 (~900 行 JS)",
     u"数据: ^DHCMRInfo Global + ^User.DHCMRQueryTemplateD",
     u"SQL: User.DHCMRQueryTemplate (显式 Storage)",
     u"交互: $.cm() 标准模式, 无 REST API",
     u"工具: Python 脚本生成 GetFieldMeta 元数据"],
    DEEP_BLUE, GREEN)


# ═══════════════════════════════════════
#  结尾
# ═══════════════════════════════════════
sl = prs.slides.add_slide(prs.slide_layouts[6])

tb = sl.shapes.add_textbox(Cm(5), Cm(5), Cm(24), Cm(3))
tf = tb.text_frame; p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
r = p.add_run()
r.text = "THANKS"; r.font.size = Pt(52); r.font.bold = True; r.font.color.rgb = DEEP_BLUE

tb = sl.shapes.add_textbox(Cm(5), Cm(8.5), Cm(24), Cm(2))
tf = tb.text_frame; p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
r = p.add_run()
r.text = u"IRIS HIS 病案编目数据自定义查询系统"; r.font.size = Pt(22); r.font.color.rgb = DARK_GRAY

tb = sl.shapes.add_textbox(Cm(5), Cm(11), Cm(24), Cm(2))
tf = tb.text_frame; p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
r = p.add_run(); r.text = u"2026年7月"; r.font.size = Pt(16); r.font.color.rgb = DARK_GRAY

# 6 块装饰
for i, c in enumerate([GREEN, YELLOW, GREEN, LIGHT_BLUE, LIGHT_BLUE, LIGHT_BLUE]):
    s = sl.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(12.5 + i * 1.2), Cm(14.5), Cm(0.8), Cm(0.8))
    s.fill.solid(); s.fill.fore_color.rgb = c; s.line.fill.background()

tb = sl.shapes.add_textbox(Cm(5), Cm(16.5), Cm(24), Cm(1.5))
tf = tb.text_frame; p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
r = p.add_run()
r.text = u"科技呵护健康  孪生助力成功"; r.font.size = Pt(14); r.font.color.rgb = LIGHT_BLUE

# ── 保存 ──
output_path = "d:/claude code/IRIS/病案编目自定义查询系统_开发经验分享.pptx"
prs.save(output_path)
print(f"PPT saved: {output_path}")
print(f"Slides: {len(prs.slides)}")
