# Style Contract - iMEDWAY Small-Header Template

Reference: 小页眉_Word模板（简版）东华医为2025.06.16.doc
Verified by: Direct XML extraction from template (2026-05-28)

## CRITICAL: Font Rule

**ALL text in the document uses 宋体 (SimSun) — no exceptions.**

Template instruction: "文档统一使用宋体，通篇使用的各个层级的编号保持一致"

This includes body text, headings (levels 1-5), tables, header/footer, document title, captions, list items.
Do NOT use 黑体 (SimHei) for headings. Use bold weight on 宋体 instead.

## Page Layout

| Property | Value | Unit |
|----------|-------|------|
| Paper size | A4 (210×297mm) | 7560310×10692130 EMU |
| Left margin | 1.00 in (2.54 cm) | 914400 EMU |
| Right margin | 1.00 in (2.54 cm) | 914400 EMU |
| Top margin | 1.25 in (3.17 cm) | 1141095 EMU |
| Bottom margin | 1.00 in (2.54 cm) | 914400 EMU |
| Header distance | 0.35 in | 323850 EMU |
| Footer distance | 0.32 in | 288290 EMU |

## Normal Style (root)

- **Font**: 宋体 (SimSun) inherited for eastAsia
- **Size**: 12pt (sz=24, szCs=24)
- **Spacing**: after=156 EMU, afterLines=50
- All custom styles inherit from Normal either directly or via Normal Indent

## Typography System

### `5 文档标题` — Document Title
- **Font**: 宋体 (SimSun), 22pt (sz=44), Bold
- **Alignment**: Centered
- **Spacing**: after=0
- **BasedOn**: Normal

### `2 正文` — Body Text
- **Font**: 宋体 (SimSun) for eastAsia, 12pt (szCs=24)
- **Alignment**: Left
- **First-line indent**: 480 twips = 304800 EMU (2 Chinese characters at 12pt)
  - Template instruction: "首行缩进 2字符"
  - Style XML: firstLine=200 twips (127000 EMU), but template paragraphs override to 480 twips (304800 EMU)
  - **Use 304800 EMU** to match "2 characters" as stated in the template
- **Line spacing**: 1.25x (line=300, lineRule=auto)
- **Paragraph spacing**: before=100, after=100 (auto spacing)
- **BasedOn**: Normal Indent

### `1 标题 1` — Level 1 Heading ("1.", "2.", ...)
- **Font**: 宋体 (SimSun), Bold, 12pt
- **Alignment**: Justified (both)
- **Hanging indent**: 424 twips first-line (hangingChars=176), 424 twips left
- **Numbering**: Inherited from heading 1 → numId=1, ilvl=0 → abstractNum 3 → format `%1.`
- **BasedOn**: heading 1

### `1 标题 2` — Level 2 Heading ("1.1.", "1.2.", ...)
- **Font**: 宋体 (SimSun), Bold, 12pt
- **Alignment**: Justified (both)
- **Numbering**: Inherited from heading 2 → numId=1, ilvl=1 → abstractNum 3 → format `%1.%2.`
- **BasedOn**: heading 2

### `1 标题 3` — Level 3 Heading ("1.1.1.", "1.1.2.", ...)
- **Font**: 宋体 (SimSun), Bold, 12pt
- **Alignment**: Justified (both)
- **Numbering**: Inherited from heading 3 → numId=1, ilvl=2 → abstractNum 3 → format `%1.%2.%3.`
- **BasedOn**: heading 3

### `1 标题 4` — Bracket Heading ("1）", "2）", ...)
- **Font**: 宋体 (SimSun), Bold, 12pt
- **Alignment**: Justified (both)
- **Line spacing**: 1.25x (line=300, lineRule=auto)
- **Paragraph spacing**: before=100, after=100 (auto spacing)
- **Hanging indent**: 425 twips first-line, 425 twips left
- **Numbering**: numId=3 → abstractNum 1 → format `%1)`
- **BasedOn**: 4 标题

### `1 标题 5` — Sub-Content Under Bracket ("(1)", "(2)", ...)
- **Font**: 宋体 (SimSun), 12pt
- **Line spacing**: 1.25x (line=300, lineRule=auto)
- **Paragraph spacing**: before=100, after=100 (auto spacing)
- **Numbering**: numId=4 → abstractNum 22 → format `(%1)`
- **BasedOn**: Normal Indent

### `3 标题 6` — Bullet Level 1 (■)
- **Font**: 宋体 (SimSun), 12pt
- **Line spacing**: 1.25x (line=300, lineRule=auto)
- **Paragraph spacing**: before=100, after=100 (auto spacing)
- **Hanging indent**: 125 twips first-line, 1259 twips left
- **Bullet**: numId=2, ilvl=1 → abstractNum 9 → bullet character ■
- **BasedOn**: Normal Indent

### `3 标题 7` — Bullet Level 2 (□)
- **Hanging indent**: 461 twips first-line, 2100 twips left
- **Paragraph spacing**: after=120
- **Bullet**: numId=22 → abstractNum 17 → bullet character □
- **BasedOn**: 3 标题 6

### `3 标题 8` — Bullet Level 3 (●)
- **Hanging indent**: 396 twips first-line, 2520 twips left
- **Paragraph spacing**: after=120
- **Bullet**: numId=23 → abstractNum 14 → bullet character ●
- **BasedOn**: 3 标题 6

### `3 标题 9` — Bullet Level 4 (○)
- **Hanging indent**: 388 twips first-line, 2940 twips left
- **Paragraph spacing**: after=120
- **Bullet**: numId=24 → abstractNum 4 → bullet character ○
- **BasedOn**: 3 标题 6

## Header

Three-paragraph structure:

### Paragraph 1 (Logo)
- Contains iMEDWAY logo image (image1.png, 38KB)
- Font: 华文楷体 7.5pt (sz=15)
- Spacing: before=0, after=120 EMU

### Paragraph 2 (Document name + horizontal line)
- Font: 楷体 9pt (sz=18)
- Tab stops: left at 1980 twips, right at 9026 twips
- Content: placeholder "这里放置文档名称" right-aligned via tabs
- Horizontal line: positioned drawing (line shape) behind text

### Paragraph 3 (Separator)
- Font: 仿宋 10.5pt (sz=21)
- Thin full-width horizontal line (positioned drawing)
- Spacing: before=0, after=120 EMU

## Footer

### Paragraph 1 (Page number)
- Font: 楷体 9pt (sz=18)
- Format: "第 N 页 /共 M 页"
- Uses Word field codes: PAGE and NUMPAGES

### Signature area (positioned text boxes)
- Font: 楷体 7.5pt (sz=15)
- Content: "乙方签字或手印：" inside dashed-border rectangles

## Table Styling

### `4 表格标题` — Table Caption
- **Font**: 宋体 (SimSun), 10.5pt (sz=21, szCs=21)
- **Alignment**: Right
- **Right indent**: 255 twips
- **Spacing**: after=50
- **Format**: "-Caption text-"

### `4 表格表头` — Table Header
- **Font**: 宋体 (SimSun), Bold, szCs=10.5pt
- **Alignment**: Centered
- **Spacing**: after=0
- **Borders**: single black lines

### `4 表格内容` — Table Body
- **Font**: 宋体 (SimSun), szCs=12pt
- **Alignment**: Left
- **Spacing**: after=0
- **Borders**: single black lines

### Standard Table Format
- Default: 7 columns (栏目1–栏目7), header row + 4 data rows
- Borders: all sides, single black, sz=4 half-points

## Closing Block (`声明日期` style)

End of document, three lines:
1. "东华医为科技有限公司" — 宋体 14pt Bold
2. "部门名称" — 宋体 14pt Bold
3. "XXXX年X月X日" — 宋体 14pt Bold

- Style definition: Arial Bold Centered (14pt applied via direct formatting on paragraphs)
- Alignment: Centered
- Paragraph spacing: before=100, after=100 (auto spacing)

## Numbering Systems

### Dot-Numbered Hierarchy (numId=1, abstractNum 3)
- ilvl=0: `%1.` (1., 2., 3., ...) — heading 1 → 1 标题 1
- ilvl=1: `%1.%2.` (1.1., 1.2., ...) — heading 2 → 1 标题 2
- ilvl=2: `%1.%2.%3.` (1.1.1., 1.1.2., ...) — heading 3 → 1 标题 3
- Indent per level: left=425, hanging=425 (twips)

### Bracket-Numbered (numId=3, abstractNum 1)
- ilvl=0: `%1)` (1）, 2）, 3）, ...) — 1 标题 4

### Parenthesized (numId=4, abstractNum 22)
- ilvl=0: `(%1)` ((1), (2), (3), ...) — 1 标题 5

### Bullet Lists
| Level | numId | abstractNum | Character | Style |
|-------|-------|-------------|-----------|-------|
| L1 ■  | 2     | 9           | ■         | 3 标题 6 |
| L2 □  | 22    | 17          | □         | 3 标题 7 |
| L3 ●  | 23    | 14          | ●         | 3 标题 8 |
| L4 ○  | 24    | 4           | ○         | 3 标题 9 |

## Color Palette

| Role | Color | Usage |
|------|-------|-------|
| Text | #000000 | All body text, headings, table content |
| Brand Blue | #005BAC | "MED" in logo, footer slogan |
| Brand Green | #00A651 | "WAY" in logo |
| Gray | #333333 | "i" in logo |
| Border | #808080 | Header line, table borders |
