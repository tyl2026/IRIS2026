---
name: imedway-pptx
description: Create professional presentation slides (PPTX) following the iMEDWAY (东华医为) corporate design system — a WHITE-background template with bright, clean, playful aesthetic. Use when users request to create, replicate, or generate PPT presentations that should follow the iMEDWAY brand style with white background, deep blue primary color, colorful rounded-square decorations, iMEDWAY logo, structured layouts including cover pages, table of contents, chapter dividers, content pages, architecture diagrams, chart pages, and table pages. Also use when users upload or reference the iMEDWAY PPT template files (PPT白色版 or PPT设计规范), or ask to replicate its theme style and typography. Supports Chinese/CJK content with Source Han Sans (思源黑体) typography.
---

# iMEDWAY PPT Design System

Corporate presentation design system for iMEDWAY (东华医为) — a **WHITE version** (白色版) template with bright, clean, open aesthetic, colorful geometric decorations, and consistent iMEDWAY branding. 来源：PPT 设计规范 2025-12 + PPT 白色版模板 2026-02。

## CRITICAL Style Rules (Must Follow)

1. **所有页面背景必须白底 #FFFFFF** — 这是「白色版」模板，无例外
2. **iMEDWAY logo** 在内容页右上角（**非**封面/目录/章节）
3. **6 块品牌方块**（绿黄绿蓝蓝蓝）在内容页**左下角**
4. **开放白底布局** — 禁止灰底卡片或深色卡片
5. **整篇 2-3 种颜色**，主色深蓝占 60%

## Reference Source

- **Type**: Uploaded PPTX artifacts (template + design specification)
- **Reference Artifact Type**: PPTX
- **Reference File Type**: PPTX
- **Supported Outputs**: PPTX
- **Default Output**: PPTX

## Workflow

1. **明确设计方向**（style_contract 7.1）: 阅读型 vs 演讲型？受众？场景？决定配色方案
2. **确定章节结构**（structure_contract 1）: 4 大节（01-04）= 基础/架构/图表/图片
3. **按页型选模板**（structure_contract 2-15）: 封面 → 目录 → 章节页 → 内容 → 结尾
4. **应用样式合同**（style_contract 1-6）: 颜色、字体、字号、行距、段距、装饰
5. **遵守注意事项**（style_contract 7）: 文本规范、动画、图标、图片版权、水印

## 4 大章节内容地图

| 章节 | 子节 | 页型 |
|------|------|------|
| 01 基础样式模板 | 1.1 / 1.2 / 1.3 | 递进关系 / 形式统一 / 总分样式 |
| 02 架构图模板样式 | 2.1 / 2.2 / 2.3 | 架构图 / 架构图+内容 / 点标题样式 |
| 03 图表模板样式 | 3.1 / 3.2 / 3.3 | 正式场合 / 活泼型 / 表格样式 |
| 04 图片模板样式 | 4.1 / 4.2 / 4.3 | 图片+内容 / 图片+总结+内容 / 系统图片页 |

## Style Contract Summary

### 配色（6 色 + 60:30:10 分布）

| 角色 | 颜色 | Hex | 用途 |
|------|------|-----|------|
| 主色 | 深蓝 | #00479D | 标题、表头、主题色块、图表主系列（**60%**） |
| 第一辅色-1 | 浅蓝 | #00A9E4 | 辅色首位、流程箭头、装饰方块 |
| 第一辅色-2 | 黄色 | #F8B62D | 提醒、装饰方块、警示 |
| 第二辅色 | 绿色 | #13AE67 | 安全/确定状态、装饰方块 |
| 中性 | 浅灰 | #F2F2F2 | 浅色填充/分隔线 — **禁作背景** |
| 强调 | 橙色 | #ED7D31 | 强调/警示/关键提醒 |
| 正文 | 深灰 | #262626 | 全文正文 |
| 背景 | 白 | #FFFFFF | **所有页面** |

**60:30:10 分档（必读，避免色档错置）**:
- **60%** — 主色（深蓝 #00479D）
- **30%** — 第一阶梯辅色（浅蓝 #00A9E4 + 黄色 #F8B62D）
- **10%** — 第二阶梯辅色 + 强调（绿 #13AE67 + 橙 #ED7D31）
- 整篇 2-3 种颜色，主色占 60%；**绿/橙属 10% 强调档，不可错置 30% 辅色组**

### 字号规范

| 元素 | 字号 | 字重 |
|------|------|------|
| 封面主标题 | 46pt | Bold |
| 封面副标题 | 26pt | Regular |
| 一级标题（页面标题） | 30pt | Bold |
| 二级标题 | 24pt | Medium |
| 三级标题 | 20pt | Medium |
| 正文 | 18pt | Regular |
| 注释/小标签 | 14-16pt | Light |

**字体（必填三件套）**:
- 首选字体: **思源黑体**（Source Han Sans / Noto Sans CJK）
- **BOS 路径**: `文档-公共文档-管理文档-UI 管理文档-05 通用文件`
- **回退链**: Source Han Sans SC > Microsoft YaHei > PingFang SC > SimHei > sans-serif
- **顺序固定，不得打乱** — 缺失时按链左→右逐项尝试；重排或跳级会破坏 CJK 渲染一致性

> 三件套缺一不可 — 用户最常忘记的是 BOS 路径，引用字体时务必连路径一起写。

### 间距规则

- **行距**: 整篇 1.5 倍（统一）；版面过满 1.2-1.3 倍
- **段距 > 行距**: 段距必须大于行距（如段距 = 2 × 行距）
- **对齐**: 直线对齐 / 曲线对齐 / 视觉补齐 / 居中对齐（章节页）
- **定界框**: 内容必须落在 (1.93, 3.32) 起 30.0×13.4cm 框内；超框则**提取关键信息**，不要缩字号

### Logo & 品牌元素

**iMEDWAY Logo**（内容页**右上**）:
- 「iMEDWAY」文字（iMED 深蓝，WAY 黄/橙）
- 下方 6 小方块: 浅蓝×3 + 绿 + 黄 + 绿
- 尺寸 12-15% 幻灯片宽

**左下 6 块品牌方块**（**所有内容页必备**）:
- 顺序: 绿、黄、绿、蓝、蓝、蓝
- 每块 2-3% 幻灯片宽，圆角矩形
- 品牌一致性标记 + 翻页节奏

**封面 Logo**: 左上大字号

**Slogan**: 封面右下「科技呵护健康  孪生助力成功」

## Structure Contract Summary

### 页型速查

| 页型 | 用途 | 关键视觉 |
|------|------|----------|
| 封面 | 标题/副标题/提报 | **4 元素**（复用模板 logo 图 + 3 文字占位）— 详见 structure_contract §2 |
| 目录 | 章节列表 | 「目录」+「CONTENTS」 + 编号条目 + 角方块 |
| 章节页 | 章号分隔 | 大号「01/」+ 标题 + 阶梯装饰 + 边方块列 |
| 递进关系 | 金字塔/层级 | 左梯形 + 右文字块（带竖条） |
| 形式统一 | 多个并列项 | **2×2** 网格（4 象限，每象限带图标+标题+内容） |
| 总分样式 | 总结+细节 | 变体 1: 左总结+右 2×2 详情；变体 2: 顶总结+底流程图 |
| 架构图 | 多层系统 | 顶层 3 类 + 中层 4 类 + 底层 4 项 + 右栏 9 项 + 左标签列 |
| 架构图+内容 | 架构+说明 | 左 5 圆节点流 + 中 3 类别盒 + 右 4 子类别 |
| 点标题样式 | 分类内容 | 3 列（深蓝/浅蓝/黄头），底部 2×3 胶囊网格 |
| 正式图表 | 商务 2×2 | 横条/折线/柱形/饼图，蓝调单色 |
| 活泼图表 | 汇报 2×2 | 同上但全品牌色 |
| 表格样式 | 数据表 | 深蓝表头 + 白/灰交替行 + 居中 |
| 图片+内容 | 图+文 | 左 2 块内容（带竖色条）+ 右大图 |
| 图片+总结+内容 | 图+总结 | 2×2 网格 + 底部 banner |
| 系统图片页 | 多图错位 | 3 张错位图片（0.5cm 步进）+ 底部总结 |
| 结尾 | 致谢 | 「THANKS」+ 6 彩块 + 使命/愿景/价值观 |

### 编号规则

- 目录: 01, 02, 03...
- 幻灯片: 1.1, 1.2, 1.3...
- **变体**（同内容多张）: 1.1 系统截图 1、1.1 系统截图 2
- 内容一级: 1. 2. 3.
- 内容二级: 1) 2) 3)
- 内容三级: (1) (2) (3)

### 对齐规则

- 同页保持一致对齐（左/中）
- 章节页: 写完「节号+斜杠+标题」再整体**居中**
- 元素沿直线排列，避免视觉错位

## 注意事项（设计规范 2.x 沉淀 — 来源：PPT 设计规范 2025-12）

生成或评审 PPT 时必须检查：

| 检查项 | 来源 | 关键规则 |
|--------|------|----------|
| PPT 类型选择 | 2.1 | 阅读型/演讲型 + 受众 + 场景 |
| 文本规范 | 2.2 | 无错别字 + 标点不断行首 + 词组不断开（**东华医为/iMEDWAY 品牌词不拆行**） |
| 动画 | 2.3 | 默认无；用了限 4-7 个/整篇 + 速度匹配演讲 + **同类型页面动画一致** |
| 图标 | 2.4 | 善用 + 风格统一 + 含义匹配 |
| 图片 | 2.5 | 高清 + 不拉伸 + 单图居中 + 多图错位 + 版权 |
| 水印 | 2.6 | 匹配背景（白底用浅灰） + **位置低调（中央/角落）** |

## 动画与图像

- **动画**: 4-7 个/整篇，非每张；速度与演讲匹配
- **图片**: 高清；单图居中；多图错位排版（0.5cm 步进）+ 可加点击动画
- **水印**: 白色版用浅灰水印

## Asset Reference

- `assets/template.pptx` — 完整白色版模板（24 页）
- `assets/design_spec.pptx` — 设计规范正文（PPT 设计规范 2025-12）

## CJK Typography Strategy

本系统为 CJK 内容优化：
- 全文使用同一种 CJK 无衬线字体（思源黑体首选）
- 不可用仅拉丁字体
- 图表/表格/形状内的 CJK 文字同字体
- 最小可读字号 12pt
- 标点不出现在行首
- 词组不要在行内被拆开

## 增强封面建议（可选 — 默认不做）

模板封面只提供 4 元素（logo 图 + 标题 + 副标题 + 提报人块）。如需「白皮书/对外宣传」级封面，可**自行添加**以下元素（与品牌规范保持一致）：

| 增强项 | 做法 |
|--------|------|
| 右侧照片拼贴 | 4-6 个交叠圆角矩形（蓝色调医学照片），尺寸自定 |
| Slogan | 「科技呵护健康  孪生助力成功」— 通常放在图片区右下 |
| 6 彩块 | 与 logo 下方彩块同款（同 6 色 6 块模式） |

**前提**: 自行添加的元素要：
- 符合尺寸/间距/颜色规范
- 不破坏「白底」「左 55% / 右 45%」分区的整体比例
- 字体保持思源黑体

## 文件结构

```
.claude/skills/imedway-pptx-template/
├── SKILL.md              ← 当前文件
├── references/
│   ├── style_contract.md   ← 颜色/字体/间距/装饰/图表/注意事项
│   └── structure_contract.md ← 16 种页型布局 + 编号 + 图像规则
├── scripts/
│   └── build_test_pptx.py  ← 11 页类型测试 + 不变量验证
├── assets/
│   ├── template.pptx       ← 完整模板
│   └── design_spec.pptx    ← 设计规范
└── build/                  ← 测试输出（gitignore）
```
