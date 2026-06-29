"""生成代码并检查残留问题"""
import sys
sys.path.insert(0, ".")
from src.parsers.factory import DocumentParser
from src.value_engine.engine import ValueEngine
from src.generators.query_generator import QueryGenerator, ViewDefinition, FieldInfo
from src.utils.name_utils import sanitize_name
import os

doc_path = r"docs/input/四川省智慧健康数据采集API接口规范（试行）-20260331版.docx"
parser = DocumentParser()
result = parser.parse(doc_path)
views = [v for v in result.views if v.fields]
engine = ValueEngine()
engine.load_rules()
v = views[0]

fields = []
value_results = []
for pf in v.fields:
    fields.append(FieldInfo(name=pf.name, code=pf.code, field_type=pf.field_type or "String", length=pf.length or 50, required=pf.required))
    vr = engine.resolve_multi_round(pf.code, pf.name or "", "", pf.description or "")
    value_results.append(vr)

view_def = ViewDefinition(view_code=sanitize_name(v.view_code, "View0"), view_name=v.view_name, fields=fields, description=v.description)
code = QueryGenerator().generate(view=view_def, value_results=value_results, system_name="", sub_path="")

# 检查残留问题
for i, line in enumerate(code.splitlines(), 1):
    issues = []
    if ".." in line and not line.strip().startswith(".."):
        issues.append("dot-syntax issue")
    if "`" in line:
        issues.append("backtick in code")
    if "OrganizCode" in line:
        issues.append("undefined Parameter")
    if "##class(UtilMethod)" in line:
        issues.append("nonexistent class")
    if any(ch in line for ch in ["子节点遍历", "节点遍历"]):
        issues.append("Chinese text in code")
    if issues:
        print(f"ISSUE line {i}: {line.strip()[:100]}")

out_path = "output/sichuan_test/DataCollection_Query.cls"
os.makedirs("output/sichuan_test", exist_ok=True)
with open(out_path, "w", encoding="utf-8-sig") as f:
    f.write(code)
print(f"Generated: {out_path} ({len(code)} chars)")
