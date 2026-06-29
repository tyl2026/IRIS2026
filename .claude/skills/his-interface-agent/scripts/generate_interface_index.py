# -*- coding: utf-8 -*-
"""
从接口注册对照信息Excel生成全量接口索引文件
用法: python scripts/generate_interface_index.py
输出: references/interface-index/all-interfaces.md
"""

import os
from collections import defaultdict
from datetime import datetime

def main():
    import openpyxl

    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    output_path = os.path.join(project_dir, 'references', 'interface-index', 'all-interfaces.md')

    # 读取Excel
    excel_path = os.path.join(os.path.expanduser('~'), 'Desktop', '接口注册对照信息.xlsx')
    wb = openpyxl.load_workbook(excel_path, read_only=True)
    ws = wb['Sheet1']

    # 按类名分组
    class_methods = defaultdict(list)
    for row in ws.iter_rows(min_row=2, values_only=True):
        cls = str(row[5]) if row[5] else ''
        method = str(row[6]) if row[6] else ''
        desc = str(row[2]) if row[2] else ''
        code = str(row[1]) if row[1] else ''
        status = str(row[3]) if row[3] else ''
        class_methods[cls].append({
            'code': code, 'method': method, 'desc': desc, 'status': status
        })
    wb.close()

    # 生成合并文件
    today = datetime.now().strftime('%Y-%m-%d')
    lines = []
    lines.append('# 全量接口索引')
    lines.append('')
    lines.append(f'> 数据来源: 接口注册对照信息.xlsx')
    lines.append(f'> 最后更新: {today}')
    lines.append(f'> 接口总数: {sum(len(v) for v in class_methods.values())} 个方法, {len(class_methods)} 个类')
    lines.append('')
    lines.append('---')
    lines.append('')

    for cls_name in sorted(class_methods.keys()):
        methods = class_methods[cls_name]
        lines.append(f'## {cls_name}')
        lines.append('')
        lines.append('### 方法清单')
        lines.append('')
        lines.append('| 接口编码 | 方法名 | 功能描述 | 状态 |')
        lines.append('|----------|--------|----------|:---:|')
        for m in methods:
            lines.append(f'| `{m["code"]}` | `{m["method"]}` | {m["desc"]} | {m["status"]} |')
        lines.append('')

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

    print(f'Generated: {output_path}')
    print(f'  Classes: {len(class_methods)}')
    print(f'  Methods: {sum(len(v) for v in class_methods.values())}')


if __name__ == '__main__':
    main()
