"""共享命名工具

提供中文→拼音转换、名称清理等通用功能。
"""
import hashlib
import re as _re

# 中文名→英文类名映射表（长的先匹配）
CN_NAME_MAP = {
    "检验报告明细": "LabReportDetail",
    "麻醉方式代码": "AnmethCode",
    "麻醉方式描述": "AnmethDesc",
    "麻醉方式类型": "AnmethType",
    "麻醉方式": "AnestMethod",
    "检查报告": "ExamReport",
    "检验报告": "LabReport",
    "医嘱记录": "OrderRecord",
    "患者信息": "PatientInfo",
    "就诊记录": "VisitRecord",
    "手术记录": "OperationRecord",
    "挂号": "Registration",
    "收费": "Charge",
    "药品": "Pharmacy",
    "字典": "Dictionary",
}


def cn_to_pinyin_initials(text: str) -> str:
    """将中文转为拼音首字母缩写（如 麻醉方式 → MZFS）"""
    _PINYIN = {
        "麻": "M", "醉": "Z", "方": "F", "式": "S",
        "检": "J", "查": "C", "验": "Y", "报": "B", "告": "G",
        "明": "M", "细": "X", "医": "Y", "嘱": "Z", "记": "J", "录": "L",
        "患": "H", "者": "Z", "信": "X", "息": "X",
        "就": "J", "诊": "Z", "手": "S", "术": "S",
        "挂": "G", "号": "H", "收": "S", "费": "F", "药": "Y", "品": "P",
        "字": "Z", "典": "D", "门": "M", "急": "J", "住": "Z", "院": "Y",
        "病": "B", "历": "L", "护": "H", "理": "L", "申": "S", "请": "Q",
        "结": "J", "算": "S", "登": "D", "出": "C", "转": "Z",
        "科": "K", "室": "S", "类": "L", "别": "B", "型": "X",
        "编": "B", "码": "M", "名": "M", "称": "C", "描": "M", "述": "S",
        "数": "S", "据": "J", "日": "R", "期": "Q", "时": "S", "间": "J",
        "开": "K", "始": "S", "结": "J", "束": "S", "有": "Y", "效": "X",
        "状": "Z", "态": "T", "标": "B", "志": "Z",
        "是": "S", "否": "F",
    }
    result = []
    for ch in text:
        if ch in _PINYIN:
            result.append(_PINYIN[ch])
    return "".join(result) if result else ""


def sanitize_name(name: str, fallback: str = "") -> str:
    """清理名称，去除中文字符，返回有意义的英文标识符

    优先级: 英文原文 > 中文映射表 > 拼音缩写 > 英文fallback > 默认名
    """
    if _re.match(r'^[A-Za-z0-9_]+$', name):
        return name

    english_parts = _re.findall(r'[A-Za-z0-9_]+', name)
    if english_parts:
        meaningful = [p for p in english_parts if len(p) > 1]
        if meaningful:
            return '_'.join(meaningful)

    for cn_key, en_name in sorted(CN_NAME_MAP.items(), key=lambda x: -len(x[0])):
        if cn_key in name:
            return en_name

    pinyin = cn_to_pinyin_initials(name)
    if pinyin:
        return pinyin

    if fallback and _re.match(r'^[A-Za-z0-9_]+$', fallback):
        return fallback

    hash_suffix = hashlib.md5(name.encode()).hexdigest()[:4].upper()
    return f"Output_{hash_suffix}"
