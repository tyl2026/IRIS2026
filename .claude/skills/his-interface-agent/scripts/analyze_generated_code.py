"""分析生成代码的质量问题

自动检测生成代码中的系统性问题：
1. 代码结构问题（遍历代码和字段取值代码分离）
2. 变量依赖问题（表达式中的变量未定义）
3. 表达式质量问题（包含中文或无效字符）
"""

import re
import sys
from pathlib import Path
from typing import List, Dict, Tuple


class CodeAnalyzer:
    """代码质量分析器"""

    def __init__(self, code: str):
        self.code = code
        self.lines = code.split('\n')
        self.issues = []

    def analyze(self) -> List[Dict]:
        """分析代码质量问题"""
        self.issues = []

        # 检查代码结构
        self._check_code_structure()

        # 检查变量依赖
        self._check_variable_dependencies()

        # 检查表达式质量
        self._check_expression_quality()

        return self.issues

    def _check_code_structure(self):
        """检查代码结构问题"""
        # 查找遍历循环的结束位置
        loop_end_line = None
        for i, line in enumerate(self.lines):
            if 'q:adm=""' in line or 'Quit:adm=""' in line:
                loop_end_line = i
                break

        # 查找字段取值代码的开始位置
        field_assign_start = None
        for i, line in enumerate(self.lines):
            if 'Set ' in line and '=' in line and 'TODO' not in line:
                # 检查是否在循环外面
                if loop_end_line and i > loop_end_line:
                    field_assign_start = i
                    break

        # 如果字段取值代码在循环外面，报告问题
        if loop_end_line and field_assign_start and field_assign_start > loop_end_line:
            self.issues.append({
                'type': 'STRUCTURE',
                'severity': 'CRITICAL',
                'line': field_assign_start + 1,
                'message': '字段取值代码在遍历循环外面，不会被执行',
                'fix': '将字段取值代码移到循环内部'
            })

    def _check_variable_dependencies(self):
        """检查变量依赖问题"""
        # 收集所有定义的变量
        defined_vars = set()
        for line in self.lines:
            # 匹配 s varName=... 或 Set varName=...
            match = re.search(r'[sS]\s+(\w+)\s*=', line)
            if match:
                defined_vars.add(match.group(1))

        # 检查所有使用的变量
        for i, line in enumerate(self.lines):
            # 跳过注释
            if line.strip().startswith(';') or line.strip().startswith('//'):
                continue

            # 提取变量引用
            # 匹配 $lg(varName, N) 或 $p(varName, "^", N) 等
            var_refs = re.findall(r'\$lg\((\w+),', line)
            var_refs += re.findall(r'\$p\(\$(?:g\()?\^?\w+\((\w+)', line)

            for var in var_refs:
                if var not in defined_vars and var not in ['qHandle', 'repid', 'ind', 'Data', 'Row', 'AtEnd']:
                    self.issues.append({
                        'type': 'VARIABLE',
                        'severity': 'HIGH',
                        'line': i + 1,
                        'message': f'变量 {var} 未定义',
                        'fix': f'在使用前定义变量 {var}'
                    })

    def _check_expression_quality(self):
        """检查表达式质量问题"""
        for i, line in enumerate(self.lines):
            # 检查包含中文的表达式
            if 'Set ' in line and '=' in line:
                expr = line.split('=', 1)[1] if '=' in line else ''
                if re.search(r'[一-鿿]', expr):
                    self.issues.append({
                        'type': 'EXPRESSION',
                        'severity': 'MEDIUM',
                        'line': i + 1,
                        'message': '表达式包含中文',
                        'fix': '将中文描述移到注释中'
                    })

                # 检查包含无效字符的表达式
                if '→' in expr or '`' in expr:
                    self.issues.append({
                        'type': 'EXPRESSION',
                        'severity': 'HIGH',
                        'line': i + 1,
                        'message': '表达式包含无效字符（→或`）',
                        'fix': '将链路描述移到注释中，保留可执行代码'
                    })

    def print_report(self):
        """打印分析报告"""
        if not self.issues:
            print("[OK] 未发现代码质量问题")
            return

        print(f"发现 {len(self.issues)} 个代码质量问题：\n")

        # 按严重程度分组
        critical = [i for i in self.issues if i['severity'] == 'CRITICAL']
        high = [i for i in self.issues if i['severity'] == 'HIGH']
        medium = [i for i in self.issues if i['severity'] == 'MEDIUM']

        if critical:
            print("[CRITICAL] 严重问题（必须修复）：")
            for issue in critical:
                print(f"  行 {issue['line']}: {issue['message']}")
                print(f"    修复建议: {issue['fix']}")
            print()

        if high:
            print("[HIGH] 高优先级问题：")
            for issue in high:
                print(f"  行 {issue['line']}: {issue['message']}")
                print(f"    修复建议: {issue['fix']}")
            print()

        if medium:
            print("[MEDIUM] 中优先级问题：")
            for issue in medium:
                print(f"  行 {issue['line']}: {issue['message']}")
                print(f"    修复建议: {issue['fix']}")
            print()


def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("用法: python analyze_generated_code.py <代码文件路径>")
        sys.exit(1)

    file_path = Path(sys.argv[1])
    if not file_path.exists():
        print(f"文件不存在: {file_path}")
        sys.exit(1)

    code = file_path.read_text(encoding='utf-8')
    analyzer = CodeAnalyzer(code)
    analyzer.analyze()
    analyzer.print_report()


if __name__ == '__main__':
    main()
