# Structure Contract - iMEDWAY Small-Header Template

Reference: 小页眉_Word模板（简版）东华医为2025.06.16.doc
Verified by: Direct XML extraction (2026-05-28)

## Document Section Hierarchy

```
Document
├── Header (repeating every page, 3 paragraphs)
│   ├── P1: iMEDWAY logo image (image1.png)
│   ├── P2: Horizontal line + "这里放置文档名称" (楷体 9pt, right-aligned)
│   └── P3: Thin separator line
├── Body
│   ├── Document Title ("5 文档标题", centered, 22pt bold, e.g. "简版")
│   ├── Body Paragraphs ("2 正文", first-line indent 2 chars)
│   ├── Level 1 Heading ("1 标题 1", "1.")
│   │   ├── Level 2 Heading ("1 标题 2", "1.1.")
│   │   │   ├── Level 3 Heading ("1 标题 3", "1.1.1.")
│   │   │   └── Body Paragraphs
│   │   └── Body Paragraphs
│   ├── Bracket Heading ("1 标题 4", "1）")
│   │   ├── Sub-Content ("1 标题 5", "(1)")
│   │   └── Sub-Content
│   ├── Bullet Lists
│   │   ├── Level 1 ("3 标题 6", ■)
│   │   ├── Level 2 ("3 标题 7", □)
│   │   ├── Level 3 ("3 标题 8", ●)
│   │   └── Level 4 ("3 标题 9", ○)
│   ├── Tables
│   │   ├── Table Caption ("4 表格标题", "-Caption-")
│   │   ├── Header Row ("4 表格表头", centered bold)
│   │   └── Data Rows ("4 表格内容")
│   └── Closing Block ("声明日期")
│       ├── "东华医为科技有限公司" (14pt bold)
│       ├── "部门名称" (14pt bold)
│       └── "XXXX年X月X日" (14pt bold)
└── Footer (repeating every page)
    ├── P1: "第 N 页 /共 M 页" (楷体 9pt, PAGE/NUMPAGES fields)
    └── Signature: "乙方签字或手印：" (楷体 7.5pt, dashed-border box)
```

## Style Inheritance (Exact from Template XML)

```
Normal (12pt, spaceAfter=156)
│
├── Normal Indent (ae)
│   ├── 2 正文 (21) [firstLine=200twips, line=300/auto, alignment=left]
│   ├── 1 标题 5 (15) [numId=4 "(1)", line=300/auto]
│   └── 3 标题 6 (36) [■ bullet, numId=2/ilvl=1, hanging=125twips, left=1259twips]
│       ├── 3 标题 7 (37) [□ bullet, numId=22, hanging=461twips, left=2100twips]
│       ├── 3 标题 8 (38) [● bullet, numId=23, hanging=396twips, left=2520twips]
│       └── 3 标题 9 (39) [○ bullet, numId=24, hanging=388twips, left=2940twips]
│
├── heading 1 (1) [12pt Bold, numId=1/ilvl=0 "1."]
│   └── 1 标题 1 (110) [justified, hanging=424twips]
│
├── heading 2 (2) [12pt Bold, numId=1/ilvl=1 "1.1."]
│   └── 1 标题 2 (120) [justified]
│
├── heading 3 (3) [12pt Bold, numId=1/ilvl=2 "1.1.1."]
│   └── 1 标题 3 (13) [justified]
│
├── 4 标题 (4) [12pt, numId=21 "1)"]
│   └── 1 标题 4 (14) [justified, hanging=425twips, numId=3 "1）"]
│
├── 4 表格表头 (44) [Bold, Centered]
├── 4 表格内容 (41) [Left]
├── 4 表格标题 (45) [10.5pt, Right]
├── 5 文档标题 (52) [22pt Bold, Centered]
└── 声明日期 (afc) [Arial Bold, Centered — content gets 宋体 14pt via direct formatting]
```

Style IDs in parentheses are the w:styleId values from the XML.

## Numbering Definitions

### Dot-Numbered Hierarchy (numId=1, abstractNum=3)
- ilvl=0: `%1.` → 1., 2., 3.
- ilvl=1: `%1.%2.` → 1.1., 1.2.
- ilvl=2: `%1.%2.%3.` → 1.1.1., 1.1.2.
- All levels: indent left=425twips, hanging=425twips

### Bracket (numId=3, abstractNum=1)
- ilvl=0: `%1)` → 1）, 2）, 3）
- Additional levels exist (lowerLetter, lowerRoman, decimal...) but unused in this template

### Parenthesized (numId=4, abstractNum=22)
- ilvl=0: `(%1)` → (1), (2), (3)

### Bullet Systems
Each bullet level has its own independent numId:

| Level | numId | abstractNum | Char | hanging (twips) | left (twips) |
|-------|-------|-------------|------|-----------------|--------------|
| ■ L1  | 2     | 9           | ■    | 125             | 1259         |
| □ L2  | 22    | 17          | □    | 461             | 2100         |
| ● L3  | 23    | 14          | ●    | 396             | 2520         |
| ○ L4  | 24    | 4           | ○    | 388             | 2940         |

## Table Structure

Default template table:
- 7 columns: 栏目1–栏目7 (replace with actual field names)
- 5 rows: 1 header + 4 data
- All cells: single black borders (sz=4 half-points)
- Header: "4 表格表头" style (宋体 Bold Centered)
- Data: "4 表格内容" style (宋体 Left)
- Caption: "4 表格标题" style, format "-表格标题-", right-aligned

## Page Breaks

- No explicit section breaks in the basic template
- Header/footer repeat on every page automatically
- Document title appears centered on first page

## Adaptation Checklist

When creating a new document:
1. Replace "这里放置文档名称" in header P2 with actual document name
2. Replace document title ("5 文档标题" style) with actual title
3. Use custom styles (1 标题 N, 2 正文, etc.) — NOT built-in Heading/Normal
4. Replace table headers (栏目1–7) with actual column names
5. Replace closing block: department name and date
6. Signature block in footer can be omitted for internal documents
7. **Always use 宋体 for ALL text** — never 黑体
