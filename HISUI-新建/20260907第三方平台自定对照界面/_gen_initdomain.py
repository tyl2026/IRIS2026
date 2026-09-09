# -*- coding: utf-8 -*-
"""由 通用值域清单.csv 生成 CLS 的 InitDomain() 方法，并注入 web.YZSY.DHCSYDictMap.cls。
生成的赋值保留已有的 HIS 字典表绑定(piece2)，可重复执行。
"""
import csv, io, re

BASE = r"D:\claude code\IRIS\HISUI-新建\第三方平台自定对照界面"
CSV = BASE + r"\通用值域清单.csv"
CLS = BASE + r"\01代码实现\web.YZSY.DHCSYDictMap.cls"


def esc(s):
    """COS 字符串字面量内转义：^ 会破坏 piece 分隔，替换为全角；" 双写"""
    s = (s or "").replace("^", "＾").replace('"', '""')
    s = s.replace("\r", "").replace("\n", "")
    return s


def main():
    rows = list(csv.DictReader(open(CSV, encoding="utf-8-sig")))
    lines = []
    lines.append("/// 值域定义初始化(由 4.2通用数据采集标准(值域代码分册)_v1.6.docx 解析生成)")
    lines.append("/// 赋值保留已有的 HIS 字典表绑定(piece2), 可重复执行")
    lines.append("/// d ##class(web.YZSY.DHCSYDictMap).InitDomain()")
    lines.append("ClassMethod InitDomain() As %String")
    lines.append("{")
    lines.append("\ts g=..G()")
    n = 0
    for r in rows:
        code = (r["值域代码"] or "").strip()
        name = (r["值域名称"] or "").strip()
        chap = (r["章名"] or "").strip()
        if not code:
            continue
        n += 1
        lines.append('\ts def=$g(@g@("Domain","SY","%s"))' % esc(code))
        lines.append('\ts $p(def,"^",1)="%s" s $p(def,"^",3)="%s" s $p(def,"^",5)="Y" s @g@("Domain","SY","%s")=def'
                     % (esc(name), esc(chap), esc(code)))
    lines.append('\tq "值域初始化完成,共%d个"' % n)
    lines.append("}")
    block = "\n".join(lines)

    src = open(CLS, encoding="utf-8").read()
    # 替换已存在的 InitDomain 方法块（若有），否则插到 test() 之前
    pat = re.compile(
        r"\n/// 值域定义初始化.*?\nClassMethod InitDomain\(\) As %String\n\{.*?\n\}\n",
        re.S)
    if pat.search(src):
        src = pat.sub("\n" + block + "\n", src, count=1)
    else:
        anchor = "/// 自测(只读, 不改库)"
        idx = src.index(anchor)
        # 回退到注释行开头
        start = src.rindex("\n", 0, idx) + 1
        src = src[:start] + block + "\n\n" + src[start:]

    with open(CLS, "w", encoding="utf-8", newline="") as f:
        f.write(src)
    print("domains=%d" % n)
    print("cls size=%d bytes" % len(src.encode("utf-8")))


if __name__ == "__main__":
    main()
