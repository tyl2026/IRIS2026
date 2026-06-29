"""规则库校验器 — 在规则加载时校验取值表达式合法性

功能：
1. 检测纯中文描述（如"子节点遍历"、"见条件逻辑"）
2. 检测包含中文注释的表达式（如"`sub ; 遍历变量`"）
3. 检测语法明显错误（如未闭合的引号、括号）

输出级别：WARNING（不阻断，只告警）
"""

import re
from dataclasses import dataclass
from typing import List, Optional


@dataclass
class ValidationIssue:
    """校验问题"""
    rule_name: str
    issue_type: str
    expression: str
    message: str
    severity: str = "WARNING"


class RuleValidator:
    """规则库校验器"""

    # 纯中文描述模式（不是有效的ObjectScript表达式）
    PURE_CHINESE_PATTERNS = [
        r'^[一-龥\s]+$',  # 纯中文+空格
        r'^[一-龥\s（）()、，。【】《》""·]+$',  # 中文+全角/半角标点
        r'^[（(][一-龥]+[）)]$',  # "（待补充）" / "(待补充)"
        r'^见[一-龥]+',  # "见xxx"
        r'^待补充',  # "待补充"
        r'^当前均为空',  # "当前均为空"
        r'^遍历',  # "遍历xxx"
        r'^从.*提取$',  # "从xxx提取"
        r'^需.*获取$',  # "需从xxx获取"
        r'^暂未',  # "暂未xxx"
    ]

    # 包含中文的表达式模式（表达式有效但包含中文注释）
    CHINESE_IN_EXPR_PATTERNS = [
        r'[一-龥]',  # 包含中文字符
    ]

    # 语法错误模式
    SYNTAX_ERROR_PATTERNS = [
        # 未闭合的引号：检查引号数量是否为奇数
        # 未闭合的括号：检查括号是否配对
    ]

    # 已知的无效表达式模式
    INVALID_PATTERNS = [
        (r'^\?$', '问号占位符'),
        (r'dataRowId', '未定义变量 dataRowId'),
        (r'子节点遍历', '中文描述误作表达式'),
        (r'见条件逻辑', '中文描述误作表达式'),
    ]

    def __init__(self):
        self.issues: List[ValidationIssue] = []

    def validate_expression(self, rule_name: str, expression: str) -> List[ValidationIssue]:
        """校验单个表达式

        Args:
            rule_name: 规则名称（用于报告）
            expression: 取值表达式

        Returns:
            校验问题列表
        """
        issues = []

        if not expression or expression.strip() == '""':
            return issues

        # 清理表达式（去除反引号包裹）
        clean_expr = expression.strip().strip('`')

        # 检查纯中文描述
        is_pure_chinese = False
        for pattern in self.PURE_CHINESE_PATTERNS:
            if re.match(pattern, clean_expr):
                issues.append(ValidationIssue(
                    rule_name=rule_name,
                    issue_type="PURE_CHINESE",
                    expression=expression,
                    message=f"纯中文描述误作取值表达式: {clean_expr[:30]}"
                ))
                is_pure_chinese = True
                break

        # 纯中文已标记 → 跳过后续检查
        if is_pure_chinese:
            return issues

        # 检查包含中文的表达式
        # 排除合法的中文字符串常量（被引号或反引号包裹的中文）
        for pattern in self.CHINESE_IN_EXPR_PATTERNS:
            if re.search(pattern, clean_expr):
                # 去除引号内的字符串内容后，检查是否还有中文
                no_strings = re.sub(r'"[^"]*"', '""', clean_expr)
                # 去除反引号包裹的描述（支持多段反引号）
                no_strings = re.sub(r'`[^`]*`', '', no_strings)
                # 去除行尾的中文注释（`后面跟中文的情况）
                no_strings = re.sub(r'`[^`]*[一-龥][^`]*', '', no_strings)
                if not re.search(r'[一-龥]', no_strings):
                    # 中文全在引号/反引号内 → 字符串常量或注释，合法，跳过
                    break

                # 提取有效表达式部分（分号前）
                if ';' in clean_expr:
                    expr_part = clean_expr.split(';')[0].strip()
                    if expr_part:
                        issues.append(ValidationIssue(
                            rule_name=rule_name,
                            issue_type="CHINESE_COMMENT",
                            expression=expression,
                            message=f"表达式包含中文注释，建议清理: {clean_expr[:50]}"
                        ))
                else:
                    issues.append(ValidationIssue(
                        rule_name=rule_name,
                        issue_type="CHINESE_IN_EXPR",
                        expression=expression,
                        message=f"表达式包含中文: {clean_expr[:50]}"
                    ))
                break

        # 检查语法错误（引号和括号配对）
        syntax_issues = self._check_syntax(clean_expr)
        for issue_msg in syntax_issues:
            issues.append(ValidationIssue(
                rule_name=rule_name,
                issue_type="SYNTAX_ERROR",
                expression=expression,
                message=f"语法错误: {issue_msg}"
            ))

        # 检查已知无效模式
        for pattern, desc in self.INVALID_PATTERNS:
            if re.search(pattern, clean_expr):
                issues.append(ValidationIssue(
                    rule_name=rule_name,
                    issue_type="INVALID_EXPR",
                    expression=expression,
                    message=f"无效表达式({desc}): {clean_expr[:50]}"
                ))

        return issues

    def _check_syntax(self, expr: str) -> List[str]:
        """检查表达式语法（引号和括号配对）

        Returns:
            问题描述列表，空列表表示无问题
        """
        issues = []

        # 检查双引号配对（排除转义的引号）
        # 简化处理：统计引号数量
        quote_count = expr.count('"') - expr.count('\\"')
        if quote_count % 2 != 0:
            issues.append("双引号未配对")

        # 检查括号配对
        paren_count = 0
        for char in expr:
            if char == '(':
                paren_count += 1
            elif char == ')':
                paren_count -= 1
            if paren_count < 0:
                issues.append("右括号多余")
                break
        if paren_count > 0:
            issues.append("左括号未闭合")

        return issues

    def validate_rule(self, rule_data: dict) -> List[ValidationIssue]:
        """校验单个规则

        Args:
            rule_data: 规则数据字典

        Returns:
            校验问题列表
        """
        rule_name = rule_data.get('ruleStandardName', rule_data.get('standardName', ''))
        expression = rule_data.get('valueExpression', '')

        if not expression:
            return []

        return self.validate_expression(rule_name, expression)

    def validate_batch(self, rules: List[dict]) -> List[ValidationIssue]:
        """批量校验规则

        Args:
            rules: 规则数据列表

        Returns:
            所有校验问题列表
        """
        all_issues = []
        for rule in rules:
            issues = self.validate_rule(rule)
            all_issues.extend(issues)
        return all_issues

    def print_report(self, issues: List[ValidationIssue]) -> None:
        """打印校验报告

        Args:
            issues: 校验问题列表
        """
        if not issues:
            print("规则库校验通过，无问题发现。")
            return

        print(f"\n{'='*60}")
        print(f"规则库校验报告: 发现 {len(issues)} 个问题")
        print(f"{'='*60}")

        # 按问题类型分组
        by_type = {}
        for issue in issues:
            by_type.setdefault(issue.issue_type, []).append(issue)

        for issue_type, type_issues in by_type.items():
            print(f"\n[{issue_type}] {len(type_issues)} 个:")
            for issue in type_issues[:5]:  # 每类最多显示5个
                print(f"  - {issue.rule_name}: {issue.message}")
            if len(type_issues) > 5:
                print(f"  ... 还有 {len(type_issues) - 5} 个")

        print(f"\n{'='*60}")


# 全局实例
_validator = RuleValidator()


def get_validator() -> RuleValidator:
    """获取全局校验器实例"""
    return _validator


def validate_expression(rule_name: str, expression: str) -> List[ValidationIssue]:
    """便捷函数：校验单个表达式"""
    return _validator.validate_expression(rule_name, expression)
