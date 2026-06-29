"""
imedway-pptx-template 设计系统测试脚本。

策略：用 python-pptx 新建 16:9 演示文稿，按 references/style_contract.md 与
structure_contract.md 重建 11 张关键页面类型（封面/目录/章节/递进/形式统一/总分/
架构图/点标题/图表/表格/结尾），最后断言关键不变量（白底、品牌元素、字体、
字号、每类页型专属不变量）。

用法:
    .venv/Scripts/python.exe .claude/skills/imedway-pptx-template/scripts/build_test_pptx.py
"""
from __future__ import annotations

from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.util import Cm, Emu, Pt

# ── 路径 ───────────────────────────────────────────────────
SKILL_DIR = Path(__file__).parent.parent
TEMPLATE = SKILL_DIR / "assets" / "template.pptx"
BUILD = SKILL_DIR / "build"
OUTPUT = BUILD / "_test_output.pptx"

# ── 设计系统常量（来自 references/style_contract.md） ──────
COLOR_PRIMARY       = RGBColor(0x00, 0x47, 0x9D)  # 深蓝 主色
COLOR_SECONDARY_1   = RGBColor(0x00, 0xA9, 0xE4)  # 浅蓝
COLOR_SECONDARY_2   = RGBColor(0xF8, 0xB6, 0x2D)  # 黄色
COLOR_ACCENT_GREEN  = RGBColor(0x13, 0xAE, 0x67)  # 绿色
COLOR_ACCENT_ORANGE = RGBColor(0xED, 0x7D, 0x31)  # 橙色
COLOR_BG_WHITE      = RGBColor(0xFF, 0xFF, 0xFF)
COLOR_TEXT_DARK     = RGBColor(0x26, 0x26, 0x26)
COLOR_NEUTRAL_GRAY  = RGBColor(0xF2, 0xF2, 0xF2)

FONT_CJK = "思源黑体"

# 内容页左下 6 块品牌标识（顺序: 绿黄绿蓝蓝蓝）
BRAND_SQUARES = [
    COLOR_ACCENT_GREEN, COLOR_SECONDARY_2, COLOR_ACCENT_GREEN,
    COLOR_SECONDARY_1, COLOR_SECONDARY_1, COLOR_SECONDARY_1,
]
BRAND_SQUARES_GAP = Cm(0.15)
BRAND_SQUARE_SIZE = Cm(0.6)

# 右上 iMEDWAY logo 下方彩块（顺序: 浅蓝×3 + 绿 + 黄 + 绿）
LOGO_BAR_COLORS = [COLOR_SECONDARY_1] * 3 + [COLOR_ACCENT_GREEN, COLOR_SECONDARY_2, COLOR_ACCENT_GREEN]


def _ensure_cover_logo() -> Path | None:
    """从模板封面抽 iMEDWAY logo 图片到 build/_cover_logo.png。返回路径。"""
    out = BUILD / "_cover_logo.png"
    if out.exists():
        return out
    if not TEMPLATE.exists():
        return None
    prs = Presentation(str(TEMPLATE))
    if not prs.slides:
        return None
    for shape in prs.slides[0].shapes:
        if shape.shape_type and "PICTURE" in str(shape.shape_type):
            img = shape.image
            out.write_bytes(img.blob)
            return out
    return None


# ── 辅助函数 ───────────────────────────────────────────────

def _fill_solid(shape, rgb: RGBColor) -> None:
    shape.fill.solid()
    shape.fill.fore_color.rgb = rgb
    shape.line.fill.background()


def _set_text(tf, text: str, *, size: int, bold: bool = False,
              color: RGBColor = COLOR_PRIMARY, align=None) -> None:
    tf.text = text
    p = tf.paragraphs[0]
    if align is not None:
        p.alignment = align
    run = p.runs[0]
    run.font.name = FONT_CJK
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color


def _ensure_white_bg(slide) -> None:
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = COLOR_BG_WHITE


def _add_brand_marker(slide) -> None:
    """左下角 6 块品牌标识方块（所有内容页必备）"""
    left = Cm(1.0)
    top = Cm(15.8)
    x = left
    for rgb in BRAND_SQUARES:
        s = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, top,
                                   BRAND_SQUARE_SIZE, BRAND_SQUARE_SIZE)
        _fill_solid(s, rgb)
        s.adjustments[0] = 0.2
        x += BRAND_SQUARE_SIZE + BRAND_SQUARES_GAP


def _add_logo_topright(slide) -> None:
    """右上角 iMEDWAY 文字 + 6 色彩块"""
    tb = slide.shapes.add_textbox(Cm(25.5), Cm(0.6), Cm(7), Cm(1.2))
    _set_text(tb.text_frame, "iMEDWAY", size=18, bold=True, color=COLOR_PRIMARY)

    left = Cm(25.5)
    top = Cm(1.6)
    for rgb in LOGO_BAR_COLORS:
        s = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, Cm(0.5), Cm(0.18))
        _fill_solid(s, rgb)
        left += Cm(0.55)


def _add_title_bar(slide, text: str) -> None:
    """左上「章.节 标题」30pt Bold"""
    tb = slide.shapes.add_textbox(Cm(1.0), Cm(1.5), Cm(20), Cm(1.2))
    _set_text(tb.text_frame, text, size=30, bold=True, color=COLOR_PRIMARY)


# ── 页型构造器 ─────────────────────────────────────────────

def make_cover(prs, layout) -> None:
    slide = prs.slides.add_slide(layout)
    _ensure_white_bg(slide)

    # iMEDWAY logo 图片（从模板封面原样复用）
    logo = _ensure_cover_logo()
    if logo:
        # 模板原坐标: (3.08, 2.61) cm, 7.94 x 1.17 cm
        slide.shapes.add_picture(str(logo), Cm(3.08), Cm(2.61),
                                 width=Cm(7.94), height=Cm(1.17))

    # 主标题（模板原坐标: 2.56, 6.11, 18.28 x 2.27 cm, 46pt Bold 深蓝）
    tb = slide.shapes.add_textbox(Cm(2.56), Cm(6.11), Cm(18.28), Cm(2.27))
    _set_text(tb.text_frame, "iMEDWAY 设计系统测试", size=46, bold=True, color=COLOR_PRIMARY)

    # 副标题（模板原坐标: 2.68, 8.48, 10.13 x 1.37 cm, 26pt Regular 深蓝）
    tb = slide.shapes.add_textbox(Cm(2.68), Cm(8.48), Cm(10.13), Cm(1.37))
    _set_text(tb.text_frame, "白色版 PPT 模板验证", size=26, color=COLOR_PRIMARY)

    # 提报人/时间（模板原坐标: 2.68, 14.26, 5.48 x 2.2 cm）
    tb = slide.shapes.add_textbox(Cm(2.68), Cm(14.26), Cm(5.48), Cm(2.2))
    _set_text(tb.text_frame, "提报人：测试  提报时间：2026/06", size=14, color=COLOR_TEXT_DARK)


def make_toc(prs, layout) -> None:
    slide = prs.slides.add_slide(layout)
    _ensure_white_bg(slide)
    _add_brand_marker(slide)
    _add_logo_topright(slide)

    # 左列：目录标题
    tb = slide.shapes.add_textbox(Cm(2.0), Cm(5.0), Cm(6), Cm(4))
    _set_text(tb.text_frame, "目 录", size=60, bold=True, color=COLOR_PRIMARY)
    tb2 = slide.shapes.add_textbox(Cm(2.0), Cm(9.5), Cm(6), Cm(1.0))
    _set_text(tb2.text_frame, "CONTENTS", size=18, color=COLOR_PRIMARY)

    # 右列：4 大节条目
    items = [
        "01/ 基础样式模板",
        "02/ 架构图模板样式",
        "03/ 图表模板样式",
        "04/ 图片模板样式",
    ]
    top = Cm(4.5)
    for it in items:
        tb = slide.shapes.add_textbox(Cm(10.0), top, Cm(20), Cm(1.2))
        _set_text(tb.text_frame, it, size=24, bold=True, color=COLOR_PRIMARY)
        top += Cm(1.8)


def make_chapter_divider(prs, layout) -> None:
    slide = prs.slides.add_slide(layout)
    _ensure_white_bg(slide)
    # 章节页不放 6 块品牌方块（左下放装饰阶梯；右边放方块列）
    # 阶梯：3 行 3 列彩色方块（左下）
    left = Cm(1.0)
    top = Cm(13.0)
    colors_stair = [
        COLOR_SECONDARY_1,
        COLOR_SECONDARY_1, COLOR_SECONDARY_2,
        COLOR_SECONDARY_1, COLOR_SECONDARY_2, COLOR_ACCENT_GREEN,
    ]
    for i, rgb in enumerate(colors_stair):
        row, col = divmod(i, 3)
        x = left + Cm(0.7) * col
        y = top + Cm(0.7) * row
        s = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y,
                                   Cm(0.6), Cm(0.6))
        _fill_solid(s, rgb)
        s.adjustments[0] = 0.2
    # 右边竖直方块列
    bar_colors = [COLOR_SECONDARY_1, COLOR_SECONDARY_2, COLOR_SECONDARY_1,
                  COLOR_SECONDARY_2, COLOR_SECONDARY_1, COLOR_ACCENT_GREEN,
                  COLOR_SECONDARY_2, COLOR_ACCENT_GREEN]
    right = Cm(33.0)
    y = Cm(3.0)
    for rgb in bar_colors:
        s = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, right, y, Cm(0.5), Cm(0.5))
        _fill_solid(s, rgb)
        y += Cm(0.7)

    # 节号 + 斜杠 + 标题 居中
    tb = slide.shapes.add_textbox(Cm(8.0), Cm(8.5), Cm(18), Cm(2))
    _set_text(tb.text_frame, "01 / 基础样式模板", size=60, bold=True,
              color=COLOR_PRIMARY, align=2)  # 2 = CENTER


def make_progressive(prs, layout) -> None:
    """递进关系（1.1）: 左 5 梯形 + 右 5 文字块（带竖条）"""
    slide = prs.slides.add_slide(layout)
    _ensure_white_bg(slide)
    _add_brand_marker(slide)
    _add_logo_topright(slide)
    _add_title_bar(slide, "1.1 有递进关系的内容展示")

    # 5 个梯形（金字塔）
    bar_colors = [COLOR_PRIMARY, COLOR_SECONDARY_1, COLOR_SECONDARY_2,
                  COLOR_ACCENT_GREEN, COLOR_PRIMARY]
    widths = [Cm(3), Cm(5), Cm(7), Cm(9), Cm(11)]
    y = Cm(4.5)
    for w, rgb in zip(widths, bar_colors):
        x = Cm(8.0) - w / 2  # 居中
        s = slide.shapes.add_shape(MSO_SHAPE.TRAPEZOID, x, y, w, Cm(1.8))
        _fill_solid(s, rgb)
        y += Cm(2.0)

    # 右 5 文字块（带竖条）
    y = Cm(4.5)
    for i, rgb in enumerate(bar_colors):
        # 竖条
        s = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Cm(15.5), y, Cm(0.1), Cm(1.8))
        _fill_solid(s, rgb)
        # 标题
        tb = slide.shapes.add_textbox(Cm(16.0), y, Cm(15), Cm(0.5))
        _set_text(tb.text_frame, f"第 {i+1} 层标题", size=18, bold=True, color=COLOR_PRIMARY)
        # 描述
        tb2 = slide.shapes.add_textbox(Cm(16.0), y + Cm(0.6), Cm(15), Cm(1.2))
        _set_text(tb2.text_frame, f"第 {i+1} 层描述说明文字", size=14, color=COLOR_TEXT_DARK)
        y += Cm(2.0)


def make_unified_form(prs, layout) -> None:
    """形式统一（1.2）: 2x2 网格（修正旧版 2x3 错误）"""
    slide = prs.slides.add_slide(layout)
    _ensure_white_bg(slide)
    _add_brand_marker(slide)
    _add_logo_topright(slide)
    _add_title_bar(slide, "1.2 形式统一样式")

    # 2x2 = 4 象限（每象限 13.5x6.5cm 卡片）
    quadrants = [
        (Cm(1.0), Cm(3.5), "象限 1", "默认深蓝标题"),
        (Cm(15.5), Cm(3.5), "象限 2", "提醒黄色 #F8B62D"),
        (Cm(1.0), Cm(10.5), "象限 3", "默认深蓝标题"),
        (Cm(15.5), Cm(10.5), "象限 4", "警示橙色 #ED7D31"),
    ]
    title_colors = [COLOR_PRIMARY, COLOR_SECONDARY_2, COLOR_PRIMARY, COLOR_ACCENT_ORANGE]
    for (x, y, title, desc), tc in zip(quadrants, title_colors):
        # 卡片底（白底细灰边）
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Cm(13.5), Cm(6.5))
        _fill_solid(card, COLOR_BG_WHITE)
        # 圆形图标
        icon = slide.shapes.add_shape(MSO_SHAPE.OVAL, x + Cm(0.5), y + Cm(0.5),
                                      Cm(0.8), Cm(0.8))
        _fill_solid(icon, COLOR_SECONDARY_1)
        # 标题
        tb = slide.shapes.add_textbox(x + Cm(1.6), y + Cm(0.5), Cm(11), Cm(0.8))
        _set_text(tb.text_frame, title, size=20, bold=True, color=tc)
        # 描述
        tb2 = slide.shapes.add_textbox(x + Cm(0.5), y + Cm(2.0), Cm(12.5), Cm(4))
        _set_text(tb2.text_frame, desc, size=14, color=COLOR_TEXT_DARK)


def make_summary_detail(prs, layout) -> None:
    """总分样式（1.3）变体 1: 左总结 + 右 2x2 详情"""
    slide = prs.slides.add_slide(layout)
    _ensure_white_bg(slide)
    _add_brand_marker(slide)
    _add_logo_topright(slide)
    _add_title_bar(slide, "1.3 总分样式")

    # 左：总结区
    box = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Cm(1.0), Cm(3.5),
                                 Cm(12), Cm(11))
    _fill_solid(box, COLOR_BG_WHITE)
    # 顶部深蓝标题条
    bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Cm(1.0), Cm(3.5),
                                 Cm(12), Cm(1.5))
    _fill_solid(bar, COLOR_PRIMARY)
    tb = slide.shapes.add_textbox(Cm(1.5), Cm(3.7), Cm(11), Cm(1.2))
    _set_text(tb.text_frame, "二级标题", size=24, bold=True, color=COLOR_BG_WHITE)
    # 正文段
    tb2 = slide.shapes.add_textbox(Cm(1.5), Cm(5.5), Cm(11), Cm(8))
    _set_text(tb2.text_frame, "三级样式，单击此处输入您的正文。文字是您思想的提炼，"
                              "为了最终演示发布的良好效果，请尽量言简意赅的阐述观点。",
              size=18, color=COLOR_TEXT_DARK)

    # 右：2x2 详情卡（每张 5.85x5.85cm）
    detail_titles = ["小标题 1", "小标题 2", "小标题 3", "小标题 4"]
    for i, t in enumerate(detail_titles):
        col, row = i % 2, i // 2
        x = Cm(15.0) + Cm(7.5) * col
        y = Cm(3.5) + Cm(6.0) * row
        s = slide.shapes.add_shape(MSO_SHAPE.OVAL, x, y, Cm(5.85), Cm(5.85))
        _fill_solid(s, COLOR_NEUTRAL_GRAY)
        tb = slide.shapes.add_textbox(x + Cm(0.2), y + Cm(0.2), Cm(5.4), Cm(0.8))
        _set_text(tb.text_frame, t, size=18, bold=True, color=COLOR_PRIMARY)
        tb2 = slide.shapes.add_textbox(x + Cm(0.2), y + Cm(1.2), Cm(5.4), Cm(4))
        _set_text(tb2.text_frame, f"{t}正文", size=14, color=COLOR_TEXT_DARK)


def make_architecture(prs, layout) -> None:
    """架构图（2.1）: 顶层 3 类 + 中层 4 类 + 底层 4 项 + 右栏 9 项"""
    slide = prs.slides.add_slide(layout)
    _ensure_white_bg(slide)
    _add_brand_marker(slide)
    _add_logo_topright(slide)
    _add_title_bar(slide, "2.1 架构图")

    # 顶层 3 类别盒
    top_ys = [Cm(3.5), Cm(5.0)]
    top_xs = [Cm(3.5), Cm(13.0), Cm(22.5)]
    for tx in top_xs:
        for ty in top_ys:
            s = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, tx, ty,
                                       Cm(8.5), Cm(0.9))
            _fill_solid(s, COLOR_PRIMARY)
            tb = slide.shapes.add_textbox(tx, ty, Cm(8.5), Cm(0.9))
            _set_text(tb.text_frame, "添加内容", size=14, bold=True, color=COLOR_BG_WHITE,
                      align=2)

    # 中层 4 类别盒
    mid_xs = [Cm(3.5), Cm(8.0), Cm(16.5), Cm(21.5)]
    for mx in mid_xs:
        for y_off in range(3):
            s = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, mx,
                                       Cm(8.0) + Cm(1.0) * y_off,
                                       Cm(3.5), Cm(0.9))
            _fill_solid(s, COLOR_SECONDARY_1)
            tb = slide.shapes.add_textbox(mx, Cm(8.0) + Cm(1.0) * y_off,
                                          Cm(3.5), Cm(0.9))
            _set_text(tb.text_frame, "内容", size=12, color=COLOR_BG_WHITE, align=2)

    # 底层 4 项
    bottom_xs = [Cm(3.5), Cm(8.0), Cm(16.5), Cm(21.5)]
    for bx in bottom_xs:
        s = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, bx, Cm(13.5),
                                   Cm(3.5), Cm(0.9))
        _fill_solid(s, COLOR_NEUTRAL_GRAY)
        tb = slide.shapes.add_textbox(bx, Cm(13.5), Cm(3.5), Cm(0.9))
        _set_text(tb.text_frame, "内容内容", size=12, color=COLOR_TEXT_DARK, align=2)

    # 右栏 9 项
    for i in range(9):
        s = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE,
                                   Cm(27.5), Cm(3.0) + Cm(1.0) * i,
                                   Cm(3.9), Cm(0.8))
        _fill_solid(s, COLOR_NEUTRAL_GRAY)
        tb = slide.shapes.add_textbox(Cm(27.5), Cm(3.0) + Cm(1.0) * i,
                                      Cm(3.9), Cm(0.8))
        _set_text(tb.text_frame, "内容内容", size=12, color=COLOR_TEXT_DARK, align=2)


def make_point_title(prs, layout) -> None:
    """点标题样式（2.3）: 3 列（深蓝/浅蓝/黄头）+ 底部 2x3 胶囊"""
    slide = prs.slides.add_slide(layout)
    _ensure_white_bg(slide)
    _add_brand_marker(slide)
    _add_logo_topright(slide)
    _add_title_bar(slide, "2.3 点标题样式")

    # 3 列（每列 ~10cm 宽）
    cols = [
        (Cm(1.0), Cm(3.5), Cm(9.5), COLOR_PRIMARY, "大标题·左"),
        (Cm(11.5), Cm(3.5), Cm(9.5), COLOR_SECONDARY_1, "大标题·中"),
        (Cm(22.0), Cm(3.5), Cm(9.5), COLOR_SECONDARY_2, "大标题·右"),
    ]
    for x, y, w, color, label in cols:
        # 色头
        head = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, w, Cm(1.2))
        _fill_solid(head, color)
        tb = slide.shapes.add_textbox(x, y, w, Cm(1.2))
        _set_text(tb.text_frame, label, size=18, bold=True, color=COLOR_BG_WHITE,
                  align=2)
        # 列体（极淡底）
        body = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y + Cm(1.2), w, Cm(9))
        _fill_solid(body, COLOR_BG_WHITE)

    # 左列: 点标题+内容（5 项）
    y = Cm(5.0)
    for i in range(5):
        tb = slide.shapes.add_textbox(Cm(1.0), y, Cm(9.5), Cm(0.7))
        _set_text(tb.text_frame, f"点标题：内容 {i+1}", size=14, color=COLOR_TEXT_DARK)
        y += Cm(1.5)

    # 中列: 圆角矩形点标题 + 段落（3 项）
    y = Cm(5.0)
    for i in range(3):
        pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE,
                                      Cm(11.5), y, Cm(3.0), Cm(0.8))
        _fill_solid(pill, COLOR_PRIMARY)
        pill.adjustments[0] = 0.4
        tb = slide.shapes.add_textbox(Cm(11.5), y, Cm(3.0), Cm(0.8))
        _set_text(tb.text_frame, f"点标题 {i+1}", size=14, bold=True,
                  color=COLOR_BG_WHITE, align=2)
        y += Cm(2.5)

    # 右列: 描边方框（4 项）
    y = Cm(5.0)
    for i in range(4):
        box = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE,
                                     Cm(22.0), y, Cm(9.5), Cm(1.2))
        _fill_solid(box, COLOR_BG_WHITE)
        tb = slide.shapes.add_textbox(Cm(22.0), y, Cm(9.5), Cm(1.2))
        _set_text(tb.text_frame, f"点标题：内容 {i+1}", size=14, color=COLOR_TEXT_DARK)
        y += Cm(1.4)

    # 底部 2x3 胶囊网格
    grid_xs = [Cm(1.0), Cm(5.5), Cm(10.0)]
    for j, gx in enumerate(grid_xs):
        for i in range(2):
            pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE,
                                          gx, Cm(13.0) + Cm(1.2) * i,
                                          Cm(3.5), Cm(0.9))
            _fill_solid(pill, COLOR_BG_WHITE)
            pill.line.color.rgb = COLOR_SECONDARY_1
            pill.adjustments[0] = 0.3
            tb = slide.shapes.add_textbox(gx, Cm(13.0) + Cm(1.2) * i,
                                          Cm(3.5), Cm(0.9))
            _set_text(tb.text_frame, f"胶囊 {j}-{i}", size=12, color=COLOR_PRIMARY,
                      align=2)


def make_chart(prs, layout) -> None:
    """正式场合图表（3.1）: 2x2 图表占位"""
    slide = prs.slides.add_slide(layout)
    _ensure_white_bg(slide)
    _add_brand_marker(slide)
    _add_logo_topright(slide)
    _add_title_bar(slide, "3.1 正式场合使用")

    # 用表格占位代表图表（python-pptx 不易直接生成 chart 元素）
    # 4 象限: 左上横条/右上折线/左下柱形/右下饼图
    quadrants = [
        (Cm(1.0), Cm(3.5), Cm(15), Cm(6.5), "横向条形", "蓝调单色"),
        (Cm(17.0), Cm(3.5), Cm(15), Cm(6.5), "折线带标记", "蓝调单色"),
        (Cm(1.0), Cm(10.5), Cm(15), Cm(6.5), "柱形", "蓝调单色"),
        (Cm(17.0), Cm(10.5), Cm(15), Cm(6.5), "饼图", "蓝调单色"),
    ]
    for x, y, w, h, title, sub in quadrants:
        # 图表面板
        panel = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, w, h)
        _fill_solid(panel, COLOR_BG_WHITE)
        panel.line.color.rgb = COLOR_NEUTRAL_GRAY
        # 标题居中
        tb = slide.shapes.add_textbox(x, y + Cm(0.3), w, Cm(0.7))
        _set_text(tb.text_frame, title, size=16, bold=True, color=COLOR_PRIMARY,
                  align=2)
        # 副标题
        tb2 = slide.shapes.add_textbox(x, y + Cm(1.2), w, Cm(0.5))
        _set_text(tb2.text_frame, sub, size=12, color=COLOR_TEXT_DARK, align=2)


def make_table(prs, layout) -> None:
    """表格样式（3.3）"""
    slide = prs.slides.add_slide(layout)
    _ensure_white_bg(slide)
    _add_brand_marker(slide)
    _add_logo_topright(slide)
    _add_title_bar(slide, "3.3 表格样式")

    headers = ["维度", "色值", "用途", "占比"]
    rows = [
        ["Primary",     "#00479D", "标题/表头",  "60%"],
        ["Secondary-1", "#00A9E4", "次要元素",  "—"],
        ["Secondary-2", "#F8B62D", "提醒/高亮", "—"],
        ["Accent-1",    "#13AE67", "成功状态",  "—"],
        ["Accent-2",    "#ED7D31", "警告/强调", "10%"],
    ]
    rows_count = 1 + len(rows)
    cols_count = len(headers)
    left = Cm(2.0)
    top = Cm(4.5)
    width = Cm(28)
    height = Cm(9)
    table_shape = slide.shapes.add_table(rows_count, cols_count, left, top, width, height)
    table = table_shape.table

    # 表头
    for c, h in enumerate(headers):
        cell = table.cell(0, c)
        cell.fill.solid()
        cell.fill.fore_color.rgb = COLOR_PRIMARY
        tf = cell.text_frame
        _set_text(tf, h, size=16, bold=True, color=COLOR_BG_WHITE)

    # 数据行
    for r, row in enumerate(rows, start=1):
        for c, val in enumerate(row):
            cell = table.cell(r, c)
            cell.fill.solid()
            cell.fill.fore_color.rgb = COLOR_BG_WHITE if r % 2 == 1 else COLOR_NEUTRAL_GRAY
            tf = cell.text_frame
            _set_text(tf, val, size=14, color=COLOR_TEXT_DARK)


def make_closing(prs, layout) -> None:
    """结尾页"""
    slide = prs.slides.add_slide(layout)
    _ensure_white_bg(slide)

    # 左: THANKS
    tb = slide.shapes.add_textbox(Cm(2.0), Cm(6.0), Cm(12), Cm(3))
    _set_text(tb.text_frame, "THANKS", size=72, bold=True, color=COLOR_TEXT_DARK)

    # 6 彩块
    left = Cm(2.0)
    top = Cm(10.0)
    for rgb in [COLOR_SECONDARY_1] * 3 + [COLOR_ACCENT_GREEN,
                                            COLOR_SECONDARY_2, COLOR_ACCENT_GREEN]:
        s = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, Cm(0.8), Cm(0.25))
        _fill_solid(s, rgb)
        left += Cm(0.85)

    tb = slide.shapes.add_textbox(Cm(2.0), Cm(11.0), Cm(15), Cm(1.0))
    _set_text(tb.text_frame, "iMedical® HOS/CMOS/All in one with AI",
              size=14, color=COLOR_TEXT_DARK)

    # 右: 公司信息
    tb = slide.shapes.add_textbox(Cm(18.0), Cm(5.0), Cm(14), Cm(8))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.text = "医为使命 iMEDWAY MISSION\n科技呵护健康  孪生助力成功"
    for p in tf.paragraphs:
        for r in p.runs:
            r.font.name = FONT_CJK
            r.font.size = Pt(18)
            r.font.color.rgb = COLOR_PRIMARY

    tb = slide.shapes.add_textbox(Cm(18.0), Cm(15.0), Cm(14), Cm(1.0))
    _set_text(tb.text_frame, "东华医为科技有限公司", size=14, color=COLOR_TEXT_DARK)


# ── 不变量验证 ─────────────────────────────────────────────

@dataclass
class PageTypeCheck:
    name: str
    expect_white_bg: bool = True
    expect_brand_marker: bool = False  # 内容页必备
    expect_logo_topright: bool = False  # 内容页必备
    extra: Callable = field(default=lambda s: [])


def _shape_kind(shape) -> str:
    """返回 shape 的具体类型。

    顶层 type 已是 PICTURE/TABLE/CHART/LINE/FREEFORM/TEXT_BOX 等非 auto-shape 时
    直接返回；AUTO_SHAPE 要下钻到 auto_shape_type 拿原始 MSO_SHAPE
    （如 ROUNDED_RECTANGLE/TRAPEZOID/OVAL/RECTANGLE）。
    """
    top = shape.shape_type.name if shape.shape_type else ""
    if top in ("PICTURE", "TABLE", "CHART", "LINE", "FREEFORM", "TEXT_BOX"):
        return top
    if top == "AUTO_SHAPE":
        try:
            return shape.auto_shape_type.name
        except (ValueError, AttributeError):
            return top
    return top


def _check_progressive(slide) -> list[str]:
    """递进关系: 至少 5 个梯形"""
    trapezoids = [s for s in slide.shapes if _shape_kind(s) == "TRAPEZOID"]
    if len(trapezoids) < 3:
        return [f"递进关系: 梯形数 {len(trapezoids)} < 3"]
    return []


def _check_unified_form(slide) -> list[str]:
    """形式统一: 恰好 2x2 = 4 象限（4 个 ROUNDED_RECTANGLE 大卡片）"""
    cards = [s for s in slide.shapes
             if _shape_kind(s) == "ROUNDED_RECTANGLE"
             and s.width > Cm(10) and s.height > Cm(5)]
    if len(cards) < 4:
        return [f"形式统一: 2x2 卡片数 {len(cards)} != 4"]
    return []


def _check_summary_detail(slide) -> list[str]:
    """总分样式: 左大块 + 至少 4 个圆"""
    circles = [s for s in slide.shapes if _shape_kind(s) == "OVAL"]
    if len(circles) < 4:
        return [f"总分样式: 圆形详情卡 {len(circles)} < 4"]
    return []


def _check_architecture(slide) -> list[str]:
    """架构图: 至少 15 个 ROUNDED_RECTANGLE（顶 3+中 4+底 4+右 9=20+）"""
    rects = [s for s in slide.shapes if _shape_kind(s) == "ROUNDED_RECTANGLE"]
    if len(rects) < 15:
        return [f"架构图: 圆角矩形数 {len(rects)} < 15（顶层+中层+底层+右栏）"]
    return []


def _check_point_title(slide) -> list[str]:
    """点标题: 3 列大色头 + 底部 6 胶囊"""
    heads = [s for s in slide.shapes
             if _shape_kind(s) == "RECTANGLE"
             and Cm(9) < s.width < Cm(11)
             and s.height < Cm(2)]
    if len(heads) < 3:
        return [f"点标题: 列头数 {len(heads)} < 3"]
    return []


def _check_chart(slide) -> list[str]:
    """图表: 4 个面板（每个有标题文本）"""
    panels = [s for s in slide.shapes
              if _shape_kind(s) == "RECTANGLE"
              and s.width > Cm(14) and s.height > Cm(6)]
    if len(panels) < 4:
        return [f"图表: 2x2 面板数 {len(panels)} < 4"]
    return []


def _check_table(slide) -> list[str]:
    """表格: 至少 1 个 TABLE"""
    tables = [s for s in slide.shapes if s.has_table]
    if not tables:
        return ["表格: 缺 TABLE 元素"]
    return []


def _check_chapter(slide) -> list[str]:
    """章节页: 至少 8 个装饰方块（阶梯+边列）"""
    small_rects = [s for s in slide.shapes
                   if _shape_kind(s) in ("RECTANGLE", "ROUNDED_RECTANGLE")
                   and s.width < Cm(1.0) and s.height < Cm(1.0)]
    if len(small_rects) < 8:
        return [f"章节页: 装饰方块 {len(small_rects)} < 8"]
    return []


def _check_closing(slide) -> list[str]:
    """结尾: 包含 'THANKS' 文本"""
    text = " ".join(
        p.text for s in slide.shapes
        if s.has_text_frame
        for p in s.text_frame.paragraphs
    )
    if "THANKS" not in text:
        return ["结尾: 缺 'THANKS' 文字"]
    return []


def _check_cover(slide) -> list[str]:
    """封面: 1 PICTURE + 3 TEXT_BOX + 主标题 46pt"""
    errors = []
    pictures = [s for s in slide.shapes if _shape_kind(s) == "PICTURE"]
    text_boxes = [s for s in slide.shapes if _shape_kind(s) == "TEXT_BOX"]

    if len(pictures) != 1:
        errors.append(f"封面: PICTURE 数 {len(pictures)} != 1（必须复用模板 logo 图）")
    if len(text_boxes) != 3:
        errors.append(f"封面: TEXT_BOX 数 {len(text_boxes)} != 3（标题/副标题/提报人）")

    # 主标题 ≥ 40pt
    has_46 = False
    for s in text_boxes:
        if s.has_text_frame:
            for p in s.text_frame.paragraphs:
                for r in p.runs:
                    if r.font.size and r.font.size.pt >= 40:
                        has_46 = True
    if not has_46:
        errors.append("封面: 缺 ≥40pt 主标题")
    return errors


# 每页专属检查器
PAGE_CHECKS = {
    "cover": PageTypeCheck("cover", expect_white_bg=True, extra=_check_cover),
    "toc": PageTypeCheck("toc", expect_white_bg=True,
                         expect_brand_marker=True, expect_logo_topright=True),
    "chapter": PageTypeCheck("chapter", expect_white_bg=True, extra=_check_chapter),
    "progressive": PageTypeCheck("progressive", expect_white_bg=True,
                                 expect_brand_marker=True, expect_logo_topright=True,
                                 extra=_check_progressive),
    "unified_form": PageTypeCheck("unified_form", expect_white_bg=True,
                                  expect_brand_marker=True, expect_logo_topright=True,
                                  extra=_check_unified_form),
    "summary_detail": PageTypeCheck("summary_detail", expect_white_bg=True,
                                    expect_brand_marker=True, expect_logo_topright=True,
                                    extra=_check_summary_detail),
    "architecture": PageTypeCheck("architecture", expect_white_bg=True,
                                  expect_brand_marker=True, expect_logo_topright=True,
                                  extra=_check_architecture),
    "point_title": PageTypeCheck("point_title", expect_white_bg=True,
                                 expect_brand_marker=True, expect_logo_topright=True,
                                 extra=_check_point_title),
    "chart": PageTypeCheck("chart", expect_white_bg=True,
                           expect_brand_marker=True, expect_logo_topright=True,
                           extra=_check_chart),
    "table": PageTypeCheck("table", expect_white_bg=True,
                           expect_brand_marker=True, expect_logo_topright=True,
                           extra=_check_table),
    "closing": PageTypeCheck("closing", expect_white_bg=True, extra=_check_closing),
}


def _count_brand_markers(slide) -> int:
    """左下 6 块品牌标识（绿/黄/绿/蓝/蓝/蓝）的数量 — 尺寸 < 1cm 的圆角矩形"""
    found = 0
    for s in slide.shapes:
        if _shape_kind(s) != "ROUNDED_RECTANGLE":
            continue
        # 品牌方块典型 0.6x0.6cm；内容卡通常 > 5cm
        if s.width > Cm(2) or s.height > Cm(2):
            continue
        try:
            rgb = s.fill.fore_color.rgb
            if rgb in BRAND_SQUARES:
                found += 1
        except Exception:
            pass
    return found


def assert_invariants(prs, page_types: list[str]) -> list[str]:
    """验证关键设计不变量；返回违规列表（空 = 全部通过）"""
    errors = []
    if len(prs.slides) != len(page_types):
        errors.append(f"slide 数 {len(prs.slides)} != 预期 {len(page_types)}")
        return errors

    for i, (slide, ptype) in enumerate(zip(prs.slides, page_types)):
        check = PAGE_CHECKS[ptype]
        prefix = f"slide[{i}/{ptype}]"

        # 1. 背景白底
        if check.expect_white_bg:
            try:
                bg_rgb = slide.background.fill.fore_color.rgb
                if bg_rgb != COLOR_BG_WHITE:
                    errors.append(f"{prefix}: 背景 {bg_rgb} != #FFFFFF")
            except Exception as e:
                errors.append(f"{prefix}: 背景读取失败 {e}")

        # 2. 6 块品牌方块（仅小尺寸角方块）
        if check.expect_brand_marker:
            n = _count_brand_markers(slide)
            if n < 6:
                errors.append(f"{prefix}: 品牌方块 {n} < 6（应为绿黄绿蓝蓝蓝）")

        # 3. 右上 logo 文字 iMEDWAY
        if check.expect_logo_topright:
            has_logo = False
            for s in slide.shapes:
                if s.has_text_frame:
                    text = " ".join(p.text for p in s.text_frame.paragraphs)
                    if "iMEDWAY" in text:
                        has_logo = True
                        break
            if not has_logo:
                errors.append(f"{prefix}: 缺 iMEDWAY 文字标")

        # 4. 字体（用思源黑体或回退链）
        fonts = []
        for s in slide.shapes:
            if s.has_text_frame:
                for p in s.text_frame.paragraphs:
                    for r in p.runs:
                        if r.font.name:
                            fonts.append(r.font.name)
        if fonts and not any(f in (FONT_CJK, "Microsoft YaHei", "SimHei",
                                    "PingFang SC", "Source Han Sans SC") for f in fonts):
            counter = Counter(fonts)
            errors.append(f"{prefix}: 字体不合规 {dict(counter.most_common(3))}")

        # 5. 专属不变量
        errors.extend(check.extra(slide))

    return errors


# ── 主流程 ────────────────────────────────────────────────

PAGE_BUILDERS = [
    ("cover",         make_cover),
    ("toc",           make_toc),
    ("chapter",       make_chapter_divider),
    ("progressive",   make_progressive),
    ("unified_form",  make_unified_form),
    ("summary_detail", make_summary_detail),
    ("architecture",  make_architecture),
    ("point_title",   make_point_title),
    ("chart",         make_chart),
    ("table",         make_table),
    ("closing",       make_closing),
]


def main() -> None:
    if not TEMPLATE.exists():
        raise FileNotFoundError(f"模板缺失: {TEMPLATE}")
    BUILD.mkdir(parents=True, exist_ok=True)

    prs = Presentation()
    prs.slide_width = Emu(12192000)   # 13.33 in
    prs.slide_height = Emu(6858000)   # 7.50 in
    blank = prs.slide_layouts[6]

    page_types = [name for name, _ in PAGE_BUILDERS]
    for _, builder in PAGE_BUILDERS:
        builder(prs, blank)

    prs.save(str(OUTPUT))
    print(f"OK saved: {OUTPUT}  ({len(prs.slides)} slides, types: {page_types})")

    prs2 = Presentation(str(OUTPUT))
    errors = assert_invariants(prs2, page_types)
    if errors:
        print("FAIL 不变量检查：")
        for e in errors:
            print(f"  - {e}")
        raise SystemExit(1)
    print(f"PASS {len(page_types)} 张页型不变量检查（白底 + 品牌元素 + 字体 + 专属）")


if __name__ == "__main__":
    main()
