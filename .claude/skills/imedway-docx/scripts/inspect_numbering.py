"""提取 base.docx 中每个示例段落的完整 XML，定位编号是如何挂在段落上的。"""
import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from pathlib import Path
from docx import Document
from lxml import etree

BASE = Path(__file__).parent.parent / "assets" / "base.docx"
doc = Document(str(BASE))

# 关键段落：列出 style/numPr/ind
print("段落级 numPr 与样式继承关系")
print("=" * 80)
for i, p in enumerate(doc.paragraphs):
    pPr = p._element.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}pPr')
    style_name = p.style.name
    text = (p.text or "")[:30]
    numId = ilvl = None
    if pPr is not None:
        numPr = pPr.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}numPr')
        if numPr is not None:
            n = numPr.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}numId')
            il = numPr.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}ilvl')
            if n is not None: numId = n.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val')
            if il is not None: ilvl = il.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val')
    print(f"[{i:2d}] style={style_name:12s} numId={str(numId):4s} ilvl={str(ilvl):4s} text={text!r}")

print()
print("=" * 80)
print("样式定义级的 numPr (来自 styles.xml)")
print("=" * 80)

styles_xml = doc.styles.element.xml
# 提取每个 style 的 numId
for style_id_match in re.finditer(r'<w:style[^>]*?w:styleId="([^"]+)"[^>]*?>.*?</w:style>', styles_xml, re.DOTALL):
    body = style_id_match.group(0)
    sid = style_id_match.group(1)
    name_m = re.search(r'<w:name w:val="([^"]+)"', body)
    name = name_m.group(1) if name_m else "?"
    numId_m = re.search(r'<w:numId w:val="(\d+)"', body)
    ilvl_m = re.search(r'<w:ilvl w:val="(\d+)"', body)
    if numId_m:
        print(f"  styleId={sid!r:8s} name={name!r:15s} numId={numId_m.group(1)} ilvl={ilvl_m.group(1) if ilvl_m else '-'}")
