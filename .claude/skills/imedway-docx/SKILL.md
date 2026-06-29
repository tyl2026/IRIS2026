---
name: imedway-docx
version: 5.0.0
description: |
  Generate formal corporate documents in the iMEDWAY (东华医为) small-header DOCX template style.
  Two modes: 简版 (ImedwayDoc, no cover/TOC) and 章节版 (ImedwayChapterDoc, cover + TOC + section page numbering).
  Uses Base-Replace strategy: copies the original .docx template as the output base (preserving
  styles, numbering, header logo, footer fields byte-for-byte), then appends body content using
  the template's built-in style names. Do NOT try to rebuild styles from scratch — python-docx
  cannot reproduce the template's logo image, signature drawings, or numbering definitions.
  Triggers on: creating Word docs in 东华医为/iMEDWAY style, 小页眉 模板, 东华医为字 红头文件 风格.
allowed-tools:
  - read_file
  - write_file
  - search
  - list_tree
  - run_command
---

# iMEDWAY DOCX Skill (Base-Replace 模式)

生成 iMEDWAY（东华医为科技有限公司）小页眉模板风格的 Word 文档。

模板底文件位于本 skill 的 `assets/` 目录：
- `assets/base.docx` — 简版
- `assets/base_chapter.docx` — 章节版（含封面+TOC+分节页码）
- `assets/slogan.png` — 章节版 footer slogan 图片（从 `base_chapter.docx` 提取）

## 核心策略：Base-Replace

**不要从零重建样式。** python-docx 没法精确还原模板的：
- header 里的 iMEDWAY logo 图片（"i" 灰 / "MED" 蓝 / "WAY" 绿）
- footer 里的 "iMedical® HOS/CMOS/All in one with AI" slogan 绘图
- 多级编号定义
- 表格边框、缩进、行距等细节属性

**正确做法**：把模板的 .docx 复制一份作为输出底，清空 body 内容（但保留 `<w:sectPr>`），然后用模板自带样式名追加内容。所有外观元素（页眉/页脚/样式/编号定义）都从底文件继承。

## 两种模板模式

| 特性 | 简版 (ImedwayDoc) | 章节版 (ImedwayChapterDoc) |
|------|-------------------|---------------------------|
| 底文件 | `assets/base.docx` | `assets/base_chapter.docx` |
| 封面 | 无 | 有（标题+公司+署名+日期）|
| 目录 | 无 | 有（TOC 域，打开时自动更新）|
| 分节 | 单节 | 3节（封面/目录/正文）|
| 页码 | 全文连续 | 正文从第1页开始 |
| 标题编号 | 需手动 `_attach_numbering()` | 样式继承自动编号（第X章/X.Y./X.Y.Z.）|
| 适用场景 | 短文档、通知、备忘录 | 正式报告、调研文档、方案书 |

### 简版工作流程 (ImedwayDoc)

```python
from references.python_docx_template import ImedwayDoc

doc = ImedwayDoc(
    output_path="output.docx",
    header_name="<文档名>",     # 替换 header 占位符
    title="<文档名>",           # 自动作为文档第一行标题
    author="<署名>",
)

doc.add_heading_1("引言")           # 1.
doc.add_heading_2("调研背景")        # 1.1.
doc.add_heading_3("范围界定")        # 1.1.1.
doc.add_body("正文段落…")            # 首行缩进 2 字符

doc.add_bracket_heading("赛道分布")  # 1）
doc.add_sub_content("物流为主。")    # (1)
doc.add_bullet("要点 A", level=1)    # ■
doc.add_bullet("要点 B", level=2)    # □  (level: 1=■ 2=□ 3=● 4=○)

doc.add_table(
    headers=["列1", "列2"],
    rows=[["a", "b"]],
    caption="示例表",                # 渲染为右对齐 "-示例表-"
)

doc.add_closing(
    company="东华医为科技有限公司",
    dept="<署名>",
    date="<日期>",
)

doc.save()
```

### 章节版工作流程 (ImedwayChapterDoc)

```python
from references.python_docx_chapter_template import ImedwayChapterDoc

doc = ImedwayChapterDoc(
    output_path="output.docx",
    title_lines=["<封面标题第一行>", "<封面标题第二行（可空）>"],
    author="<署名>",
    date="<日期>",
    header_name="<文档名>",
)

# 封面+目录已自动生成，直接写正文
doc.add_heading_1("第一章标题")        # 第1章
doc.add_heading_2("1.1 小节")         # 1.1.
doc.add_heading_3("1.1.1 子节")       # 1.1.1.
doc.add_body("正文段落…")              # 首行缩进 2 字符

doc.add_bullet("要点 A", level=1)      # ■
doc.add_bullet("子要点", level=2)      # 子内容

doc.add_table(
    headers=["列1", "列2"],
    rows=[["a", "b"]],
)

doc.save()
```

## 关键技术点（修改 helper 前必读）

### 1. 编号机制：简版需显式 numPr，章节版靠样式继承

**简版** (`base.docx`)：LibreOffice .doc→.docx 转换后，样式级的 `numPr` 不会自动激活编号渲染。必须在每个标题/列表段落上**显式添加段落级 numPr 覆盖**，否则 "1."、"1.1."、"■" 等编号不显示。

**章节版** (`base_chapter.docx`)：样式已正确继承 `Heading 1/2/3` 的编号定义（numId=1），无需段落级 numPr。直接 `doc.add_paragraph(text, style='1 标题 1')` 即可渲染 "第1章"。

> ⚠️ 注意：下表 numId 是 LibreOffice .doc→.docx 转换后分配的值，与 `style_contract.md` / `structure_contract.md` 中记录的原始 .doc numId 不同。换 base.docx 后必须跑 `scripts/inspect_numbering.py` 重新提取。

#### 简版编号映射（base.docx）

| 样式 | numId | ilvl | 渲染 |
|------|-------|------|------|
| `1 标题 1` | 5 | 0 | 1. |
| `1 标题 2` | 5 | 1 | 1.1. |
| `1 标题 3` | 5 | 2 | 1.1.1. |
| `1 标题 4` | 3 | 0 | 1） |
| `1 标题 5` | 11 | 0 | (1) |
| `3 标题 6` | 8 | 1 | ■ |
| `3 标题 7` | 10 | 1 | □ |
| `3 标题 8` | 9 | 1 | ● |
| `3 标题 9` | 6 | 1 | ○ |

#### 章节版样式名（base_chapter.docx）

章节版使用不同的项目符号样式名（`3 点标题 N` 而非 `3 标题 N`）：

| 样式 | 渲染 | 说明 |
|------|------|------|
| `1 标题 1` | 第X章 | 一级标题 |
| `1 标题 2` | X.Y. | 二级标题 |
| `1 标题 3` | X.Y.Z. | 三级标题 |
| `2 正文` | — | 首行缩进 2 字符 |
| `3 点标题 1` | ■ | level=1 |
| `3 点标题 2` | 子内容 | level=2 |
| `3 点标题 3` | ● | level=3 |
| `3 点标题 4` | ○ | level=4 |
| `3 点标题 5` | — | level=5 |
| `3 点标题 6` | — | level=6 |

### 2. 清空 body 时必须保留 sectPr

`<w:sectPr>` 保存页面尺寸、页边距、header/footer 引用——是 Base-Replace 模式赖以继承外观的根。清空逻辑：

```python
body = doc.element.body
sectPr = body.find(qn("w:sectPr"))
for child in list(body):
    if child is not sectPr:
        body.remove(child)
```

章节版稍有不同：只清除段落索引 20 之后的内容（封面段落 0-19 需保留）。

### 3. header 占位符替换需逐 run 处理

header P2 中的 "这里放置文档名称" 占位符在一个具体的 `<w:r>` 内（带有字体格式）。直接改 paragraph.text 会清掉字体格式。必须遍历 runs，只替换包含占位符的那一个 run 的 text。

### 4. 表格必须额外加边框

LibreOffice 转换后 `<w:tblBorders>` 可能丢失。`add_table()` 内部用 `_add_table_borders()` 显式添加 6 边单线黑色边框（top/left/bottom/right/insideH/insideV，sz=4 半磅）。

### 5. 章节版封面结构（固定段落索引）

`base_chapter.docx` 封面区段落的固定索引（修改封面时参照）：

| 索引 | 内容 | 用途 |
|------|------|------|
| 3 | "此处输入文档" | 标题第一行 |
| 4 | "的名称" | 标题第二行（可留空） |
| 16 | "东华医为科技有限公司" | 公司名称 |
| 17 | "XXX部门" | 署名 |
| 18 | "XXXX年X月X日" | 日期 |
| 19 | — | 分节符（next page） |
| 20+ | 版本历史+正文 | 全部清除后重建 |

### 6. 章节版 TOC 域与分节

- TOC 域需显式指定样式：`\t "1 标题 1,1,1 标题 2,2,1 标题 3,3"` 确保 Word 识别自定义样式名
- `updateFields=true`：Word 打开时弹出"是否更新域"提示，点"是"即生成目录
- 正文节（Section 2）通过 `pgNumType.start=1` 重置页码，正文 footer 独立构建（"第N页" + slogan 图片）
- **footer 持久化策略**：
  - python-docx 的 OxmlElement XML 追加在 save 序列化时会被丢弃——只有 python-docx 高层 API（Paragraph/Run）的内容才能持久化
  - 页码文字用 `paragraph.add_run()` + `_add_field()` 写入
  - slogan 图片用 `run.add_picture()` 写入（从 `assets/slogan.png` 读取）
- **目录/封面页脚消除**（ZIP 后处理）：
  - LibreOffice 不尊重空 footer 内容——即使 footer XML 里只有空段落，仍会渲染页码
  - `save()` 后通过 `_remove_footer_refs_from_toc()` ZIP 后处理，从 sectPr 中彻底移除目录节和封面节的 default/even footerReference
  - 封面节保留 first footer（空），移除 default+even → 封面无页脚
  - 目录节移除全部 footerReference → 目录无页脚（LibreOffice 无法继承上游节的页脚）
- 不使用 NUMPAGES（计全文总页数含封面/目录）或 SECTIONPAGES（LibreOffice 不支持），正文只显示"第N页"

## 文件结构

```
.claude/skills/imedway-docx-template/
├── SKILL.md                              # 本文件
├── assets/
│   ├── base.docx                         # 简版模板底文件
│   ├── base_chapter.docx                 # 章节版模板底文件（含封面+TOC结构）
│   └── slogan.png                        # 模板 footer slogan 图片（从 base_chapter.docx 提取）
├── references/
│   ├── python_docx_template.py           # ImedwayDoc 类（简版入口）
│   ├── python_docx_chapter_template.py   # ImedwayChapterDoc 类（章节版入口）
│   ├── style_contract.md                 # 模板样式定义参考（仅查阅）
│   └── structure_contract.md             # 模板结构参考（仅查阅）
├── scripts/
│   ├── inspect_base.py                   # 检查 base.docx 完整性
│   └── inspect_numbering.py              # 提取段落-numId 映射（重新生成 base 时用）
└── build/                                # 输出目录（gitignored，写入 .docx/.pdf）
```

## 输出验证

生成 .docx 后转 PDF 视觉比对原模板：

```bash
"/c/Program Files/LibreOffice/program/soffice.exe" \
    --headless --convert-to pdf \
    --outdir /tmp output.docx
```

逐项核对：
- header iMEDWAY logo + 文档名称 + 分隔线
- 简版 footer "第N页 /共M页" + slogan；章节版正文 footer "第N页" + slogan
- 章节版封面和目录页无页脚
- 章节版正文页码从第1页开始
- 文档标题 22pt Bold Centered
- 标题编号链（简版: 1./1.1./1.1.1.、1）、(1)；章节版: 第X章/X.Y./X.Y.Z.）
- bullet ■/□/●/○
- 表格单线边框、表头加粗居中
- 正文首行缩进 2 字符
- 结尾/封面 "公司/署名/日期" 14pt Bold Centered

## 常见错误

### 简版 + 章节版通用

- **症状：header logo 丢失** → 误用 `Document()` 新建而非复制 base.docx/base_chapter.docx。
- **症状：占位符还在右上角** → `header_name` 没传或与默认 "这里放置文档名称" 相同。
- **症状：表格边框没了** → 没调 `_add_table_borders()`，或用 `python-docx` 直接 `doc.add_table()` 而非 helper 的 `add_table()`。
- **症状：文字非宋体** → base.docx 的 Normal 样式默认就是宋体。如果在 run 级别设 `run.font.name = "其它字体"` 会覆盖。除非需要特殊字体，否则不要在 run 级别设字体。

### 仅简版

- **症状：编号不显示** → 忘了 `_attach_numbering()`。直接 `doc.add_paragraph(text, style='1 标题 1')` 不够；必须再 `_attach_numbering(p, 5, 0)`。

### 仅章节版

- **症状：封面标题没变** → `title_lines` 参数未传，或传了单行但模板期望两行（第二行可传空字符串 `""`）。
- **症状：目录为空** → Word 打开后需点"是"更新域；或 TOC 域的 `\t` 参数中样式名拼写错误。
- **症状：正文页码不从1开始** → Section 2 的 `pgNumType.start` 未设为 "1"，或未设置到 inline sectPr（仅设 body-end sectPr 不够，LibreOffice 读 inline sectPr）。
- **症状：目录页显示了页脚** → ZIP 后处理未执行或未能正确识别目录节。`_remove_footer_refs_from_toc()` 依赖"找到 default footer 为空的 sectPr"来识别目录节。如果 python-docx 未正确清空目录节 footer，ZIP 后处理不会移除其 footerReference。
- **症状：正文 footer 无 slogan 图片** → `assets/slogan.png` 缺失（从 base_chapter.docx 的 media/image3.png 提取）。需重新提取：`python -c "import zipfile; z=zipfile.ZipFile('assets/base_chapter.docx'); open('assets/slogan.png','wb').write(z.read('word/media/image3.png'))"`。
- **症状：ZIP 后处理损坏 docx** → `_remove_footer_refs_from_toc()` 使用 tmp 文件替换原文件，确保写入过程中不中断。如果中断可能导致 .tmp 文件残留。

## Company Branding

- **Company**: 东华医为科技有限公司
- **English**: iMEDWAY
- **Slogan**: iMedical® HOS/CMOS/All in one with AI
- **Colors**: brand blue #005BAC（"MED"）、brand green #00A651（"WAY"）、gray #333333（"i"）
- **Font**: 宋体（SimSun）全文统一
