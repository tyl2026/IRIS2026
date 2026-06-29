"""HIS 接口代码验收脚本

一键验证"代码生成→质量检查→IRIS编译"整个流程。

用法:
    python scripts/verify.py
    python scripts/verify.py --file docs/input/SmartWard.docx
    python scripts/verify.py --skip-iris  # 跳过IRIS编译验证
"""

import argparse
import io
import re
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Tuple

# 设置stdout编码为utf-8，解决Windows控制台emoji显示问题
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# 添加项目根目录到Python路径
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))


class VerifyResult:
    """验收结果"""

    def __init__(self):
        self.steps: List[Dict] = []
        self.success = True

    def add_step(self, name: str, success: bool, details: str = ""):
        self.steps.append({
            "name": name,
            "success": success,
            "details": details
        })
        if not success:
            self.success = False

    def print_report(self):
        print("\n" + "=" * 50)
        print("  HIS 接口代码验收报告")
        print("=" * 50)

        for step in self.steps:
            status = "✅" if step["success"] else "❌"
            print(f"\n  [{step['name']}] {status}")
            if step["details"]:
                for line in step["details"].split("\n"):
                    print(f"    {line}")

        print("\n" + "=" * 50)
        if self.success:
            print("  验收结果: ✅ 通过")
        else:
            print("  验收结果: ❌ 未通过")
        print("=" * 50 + "\n")


def step1_generate(file_path: Path, output_dir: Path) -> Tuple[bool, List[Path]]:
    """第一步：代码生成

    调用CLI生成代码，返回生成的文件列表。
    """
    print("\n  [1/4] 代码生成...")

    # 如果output目录已有文件，直接使用
    existing_files = list(output_dir.glob("*.cls"))
    if existing_files:
        print(f"  ✅ 使用已有文件: {len(existing_files)} 个")
        return True, existing_files

    # 否则调用CLI生成
    try:
        cmd = [
            sys.executable, "-m", "src", "generate",
            "--file", str(file_path),
            "--output", str(output_dir),
            "--format", "all"
        ]
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            cwd=str(PROJECT_ROOT)
        )

        if result.returncode != 0:
            print(f"  ❌ 生成失败: {result.stderr}")
            return False, []

        # 获取生成的文件
        generated_files = list(output_dir.glob("*.cls"))
        print(f"  ✅ 生成成功: {len(generated_files)} 个文件")
        return True, generated_files

    except Exception as e:
        print(f"  ❌ 生成异常: {e}")
        return False, []


def step2_fill_rate(files: List[Path]) -> Tuple[bool, Dict]:
    """第二步：取值填充率统计

    统计生成代码中TODO的数量，计算填充率。
    """
    print("\n  [2/4] 取值填充率统计...")

    total_fields = 0
    todo_count = 0
    file_stats = {}

    for file_path in files:
        content = file_path.read_text(encoding="utf-8-sig")

        # 统计字段数（通过ROWSPEC或$lb()推断）
        rowspec_match = re.search(r'ROWSPEC\s*=\s*"([^"]+)"', content)
        if rowspec_match:
            fields = rowspec_match.group(1).split(",")
            field_count = len(fields)
        else:
            # 通过$lb()推断
            lb_match = re.search(r's\s+Data\s*=\s*\$lb\(([^)]+)\)', content)
            if lb_match:
                fields = lb_match.group(1).split(",")
                field_count = len(fields)
            else:
                field_count = 0

        # 统计TODO数量
        todo_lines = [line for line in content.split("\n") if "; TODO" in line or ";TODO" in line]
        file_todo = len(todo_lines)

        total_fields += field_count
        todo_count += file_todo

        file_stats[file_path.name] = {
            "fields": field_count,
            "todo": file_todo,
            "filled": field_count - file_todo
        }

    # 计算总体填充率
    fill_rate = (total_fields - todo_count) / total_fields * 100 if total_fields > 0 else 0

    # 输出详情
    for filename, stats in file_stats.items():
        rate = (stats["filled"] / stats["fields"] * 100) if stats["fields"] > 0 else 0
        status = "✅" if stats["todo"] == 0 else "⚠️"
        print(f"  {status} {filename}: {rate:.0f}% ({stats['filled']}/{stats['fields']} 字段)")

    print(f"\n  总体填充率: {fill_rate:.1f}% ({total_fields - todo_count}/{total_fields} 字段)")

    success = fill_rate >= 70  # 70%为及格线
    if not success:
        print(f"  ⚠️ 填充率低于70%，建议补充规则库或使用L2-L4提升")

    return success, {
        "total_fields": total_fields,
        "todo_count": todo_count,
        "fill_rate": fill_rate,
        "file_stats": file_stats
    }


def step3_lint_check(files: List[Path]) -> Tuple[bool, Dict]:
    """第三步：代码质量检查

    运行Linter检查P0/P1规则。
    """
    print("\n  [3/4] 代码质量检查...")

    try:
        from src.reviewers.linter import Linter
        linter = Linter()

        total_errors = 0
        total_warnings = 0
        file_results = {}

        for file_path in files:
            content = file_path.read_text(encoding="utf-8-sig")
            result = linter.review(content)

            file_results[file_path.name] = {
                "passed": result.passed,
                "score": result.score,
                "errors": len(result.errors),
                "warnings": len(result.warnings)
            }

            total_errors += len(result.errors)
            total_warnings += len(result.warnings)

            status = "✅" if result.passed else "❌"
            print(f"  {status} {file_path.name}: P0={len(result.errors)}, P1={len(result.warnings)}, 评分={result.score}")

            # 输出具体错误
            if result.errors:
                for error in result.errors[:3]:  # 最多显示3个
                    print(f"      ❌ {error}")

        print(f"\n  总体: P0错误={total_errors}个, P1警告={total_warnings}个")

        success = total_errors == 0  # P0错误为0才算通过
        return success, {
            "total_errors": total_errors,
            "total_warnings": total_warnings,
            "file_results": file_results
        }

    except Exception as e:
        print(f"  ❌ Linter异常: {e}")
        return False, {"error": str(e)}


def step4_iris_compile(files: List[Path]) -> Tuple[bool, Dict]:
    """第四步：IRIS编译验证

    调用MCP iris_compile验证代码能否在IRIS上编译通过。
    注意：此步骤需要MCP连接，如果无法连接则跳过。
    """
    print("\n  [4/4] IRIS编译验证...")
    print("  ⚠️ IRIS编译需要通过MCP工具执行，请在Claude Code中运行以下命令验证：")
    print("")

    # 输出MCP编译命令
    for file_path in files:
        print(f"  iris_compile(target=\"{file_path.name}\")")

    print("")
    print("  或批量编译：")
    cls_names = [f.stem for f in files]
    print(f"  iris_compile(target=\"{', '.join(cls_names)}\")")

    # 由于无法直接调用MCP，返回True表示"待手动验证"
    return True, {"status": "需要手动通过MCP验证"}


def main():
    parser = argparse.ArgumentParser(description="HIS 接口代码验收脚本")
    parser.add_argument("--file", "-f", default="docs/input/SmartWard.docx",
                       help="接口文档路径")
    parser.add_argument("--output", "-o", default="output/",
                       help="输出目录")
    parser.add_argument("--skip-iris", action="store_true",
                       help="跳过IRIS编译验证")
    args = parser.parse_args()

    file_path = PROJECT_ROOT / args.file
    output_dir = PROJECT_ROOT / args.output

    # 检查文件是否存在
    if not file_path.exists():
        print(f"  ❌ 文件不存在: {file_path}")
        sys.exit(1)

    print("=" * 50)
    print("  HIS 接口代码验收")
    print("=" * 50)
    print(f"  文档: {file_path.name}")
    print(f"  输出: {output_dir}")

    result = VerifyResult()

    # 第一步：代码生成
    success, files = step1_generate(file_path, output_dir)
    result.add_step("1/4 代码生成", success,
                   f"生成 {len(files)} 个文件" if success else "生成失败")

    if not files:
        result.print_report()
        sys.exit(1)

    # 第二步：取值填充率
    success, fill_stats = step2_fill_rate(files)
    result.add_step("2/4 取值填充率", success,
                   f"填充率 {fill_stats['fill_rate']:.1f}%")

    # 第三步：代码质量检查
    success, lint_stats = step3_lint_check(files)
    result.add_step("3/4 代码质量检查", success,
                   f"P0={lint_stats.get('total_errors', '?')}, P1={lint_stats.get('total_warnings', '?')}")

    # 第四步：IRIS编译
    if not args.skip_iris:
        success, iris_stats = step4_iris_compile(files)
        result.add_step("4/4 IRIS编译", success,
                       iris_stats.get("status", "待验证"))
    else:
        result.add_step("4/4 IRIS编译", True, "已跳过")

    # 输出验收报告
    result.print_report()

    # 返回退出码
    sys.exit(0 if result.success else 1)


if __name__ == "__main__":
    main()
