# -*- coding: utf-8 -*-
"""
项目周报生成器
从日报内容自动生成项目周报：本周已完成、本周未完成、下周计划
"""
import re, os, sys
from collections import defaultdict
from datetime import date, timedelta

# 自动检测项目根目录
_script_dir = os.path.dirname(os.path.abspath(__file__))
_project_root = _script_dir
for _ in range(10):
    if os.path.exists(os.path.join(_project_root, "CLAUDE.md")):
        break
    _project_root = os.path.dirname(_project_root)
CONTENT_FILE = os.path.join(_project_root, "日报提交", "日报内容.txt")

# ============ 下周工作计划（手动维护） ============
NEXT_WEEK_PLANS = [
    "追溯码申报问题排查处理",
    "医保智能审核部署联调",
    "传染病监测数据质量提升",
    "工伤医保升级",
    "三医数据采集质量提升",
]


def parse_daily_reports(filepath):
    """解析日报内容文件"""
    reports = {}
    current_date = None
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line: continue
            m = re.match(r'^(\d{8,9})$', line)
            if m:
                raw = m.group(1)
                if len(raw) == 9 and raw.startswith('2026'): raw = raw[:6] + raw[7:]
                elif raw.startswith('2024') and len(raw) == 8: raw = '2026' + raw[4:]
                current_date = f'{raw[:4]}-{raw[4:6]}-{raw[6:8]}'
                continue
            m = re.match(r'^(\d+)[.\s、]?(.+)', line)
            if m and current_date:
                reports.setdefault(current_date, []).append(m.group(2).strip())
    return reports


def classify_item(item):
    """分类工作项到项目模块"""
    cats = [
        ('医保智能审核', ['医保智能', '医保审核', '3101', '3102', '3103']),
        ('医保对账', ['医保对账', '大额支付']),
        ('医保飞检', ['医保飞检', '飞检']),
        ('医保电子处方', ['电子处方', '处方流转']),
        ('医保', ['医保']),
        ('信用支付', ['信用支付', '线上信用']),
        ('检验检查互认', ['检验检查互认', '互认']),
        ('三医数据', ['三医数据', '三医']),
        ('传染病监测', ['传染病监测', '传染病']),
        ('工伤医保', ['工伤']),
        ('药品追溯码', ['追溯码', '追溯']),
        ('门诊结算', ['门诊结算', '门诊退费', '门诊收费']),
        ('收入报表', ['收入', '统计', '报表']),
        ('超声报告', ['超声报告', '超声']),
        ('排班管理', ['排班']),
        ('体检', ['体检']),
        ('综合查询', ['综合查询']),
        ('输血管理', ['输血', '用血', '血库']),
        ('病案管理', ['病案', '首页']),
        ('产科', ['产科', '婴儿', '生育']),
        ('护理', ['护理', '血栓', 'VTE', '安宁疗护']),
        ('CDR/数据中心', ['CDR', '数据中心', '全息视图', '患者360']),
        ('平台数据', ['平台数据', '省平台', '市平台']),
        ('需求质控', ['需求质控', '质控小组']),
        ('PACS', ['PACS', 'pacs']),
        ('康复', ['康复']),
        ('药品管理', ['药品', '药库', '药房']),
        ('培训会议', ['培训', '会议', '出差']),
        ('服务器运维', ['服务器', '磁盘', 'DB ', 'mirror', 'journal']),
        ('设备连接', ['仪器', '血气', '摄像头']),
        ('系统UI', ['登录界面', '背景图片']),
        ('叫号系统', ['叫号']),
        ('分级诊疗', ['分级诊疗', '双向转诊']),
        ('微信公众号', ['微信', '公众号']),
        ('主数据管理', ['主数据', 'MDM', 'mdm']),
        ('医师资质', ['医师资质', '资质系统']),
    ]
    for cat, keywords in cats:
        for kw in keywords:
            if kw in item:
                return cat
    return '其他'


def is_completed(item):
    """判断工作项是否已完成"""
    ongoing_markers = ['处理中', '进行中', '调试中', '排查中', '配置中',
                       '测试中', '核对中', '制作中', '沟通中', '升级中',
                       '推进中', '对接中', '重传中', '提取中', '联调中',
                       '调试中', '升级中']
    pending_markers = ['待更新', '待处理', '待提交', '待测试']
    for m in ongoing_markers:
        if m in item: return False
    for m in pending_markers:
        if m in item: return False
    if re.search(r'已完成|已处理|已上线|已部署|已修复|已解决|已优化|处理了|已更新', item):
        return True
    return True  # 无标记默认已完成


def generate_report(reports, monday, sunday, next_plans):
    """生成项目周报"""
    # 收集本周数据
    projects = defaultdict(lambda: {'completed': [], 'ongoing': [], 'pending': []})
    all_dates = sorted(reports.keys())
    for d_str in all_dates:
        d = date.fromisoformat(d_str)
        if monday <= d <= sunday:
            for item in reports[d_str]:
                proj = classify_item(item)
                if is_completed(item):
                    projects[proj]['completed'].append((d_str, item))
                elif any(m in item for m in ['待更新', '待处理', '待提交']):
                    projects[proj]['pending'].append((d_str, item))
                else:
                    projects[proj]['ongoing'].append((d_str, item))

    # 输出
    lines = []
    lines.append(f"项目周报 ({monday} ~ {sunday})")
    lines.append("=" * 50)
    lines.append("")
    lines.append("一、本周项目组工作内容")
    lines.append("")

    # 去重
    def dedup(items):
        seen = set(); unique = []
        for d, item in items:
            core = re.sub(r'[（(][^)）]*[)）]', '', item).strip()
            if core not in seen: seen.add(core); unique.append((d, item))
        return unique

    # 本周已完成
    lines.append("【本周已完成】")
    for proj in sorted(projects.keys()):
        items = dedup(projects[proj]['completed'])
        if items:
            lines.append(f"■ {proj}")
            for d, item in items:
                lines.append(f"  · {item}")
    lines.append("")

    # 本周未完成
    lines.append("【本周计划内未完成】")
    has_ongoing = False
    for proj in sorted(projects.keys()):
        items = dedup(projects[proj]['ongoing'] + projects[proj]['pending'])
        if items:
            has_ongoing = True
            lines.append(f"■ {proj}")
            for d, item in items:
                status = ''
                for m in ['处理中', '调试中', '排查中', '配置中', '测试中', '核对中', '制作中', '沟通中', '待更新']:
                    if m in item: status = f' [{m}]'; break
                lines.append(f"  · {item}{status}")
    if not has_ongoing:
        lines.append("  无")
    lines.append("")

    # 下周计划 = 手动计划 + 本周未完成但未在计划中体现的项
    lines.append("二、下周工作内容")
    for plan in next_plans:
        lines.append(f"  · {plan}")
    # 收集未完成项
    ongoing_flat = set()
    for proj in sorted(projects.keys()):
        for d, item in projects[proj]['ongoing'] + projects[proj]['pending']:
            core = re.sub(r'[（(][^)）]*[)）]', '', item).strip()
            ongoing_flat.add(core)
    # 排除与手动计划同分类的
    def overlaps(item_text):
        item_cat = classify_item(item_text)
        for plan in next_plans:
            if classify_item(plan) == item_cat:
                return True
        return False
    extra = [i for i in ongoing_flat if not overlaps(i)]
    if extra:
        lines.append("")
        lines.append("【本周未完成跟进】")
        for item in sorted(extra):
            lines.append(f"  · {item}")
    lines.append("")

    return '\n'.join(lines)


def main():
    if not os.path.exists(CONTENT_FILE):
        print(f"日报内容文件不存在: {CONTENT_FILE}")
        return

    reports = parse_daily_reports(CONTENT_FILE)
    all_dates = sorted(reports.keys())

    # 确定周范围
    if len(sys.argv) >= 2:
        # 指定周一日期: python gen_weekly_report.py 2026-06-01
        monday = date.fromisoformat(sys.argv[1])
    else:
        # 默认最近一周
        latest = date.fromisoformat(all_dates[-1])
        monday = latest - timedelta(days=latest.weekday())
    sunday = monday + timedelta(days=6)

    report = generate_report(reports, monday, sunday, NEXT_WEEK_PLANS)

    # 保存
    output_dir = os.path.dirname(os.path.abspath(__file__))
    output_file = os.path.join(output_dir, f"weekly_report_{monday}.txt")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(report)
    print(report)
    print(f"\n已保存: {output_file}")


if __name__ == "__main__":
    main()
