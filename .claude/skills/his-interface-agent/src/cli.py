"""HIS 接口自动开发 Agent — 命令行入口

用法：
    python -m src parse --file doc.docx
    python -m src rule lookup --field "患者姓名"
    python -m src rule list-domains
    python -m src generate --file doc.docx --view V_NIS_PatientBasicInfo --format query
    python -m src generate --file doc.docx --format json --output output/
    python -m src review --file output/xxx.cls
"""

import argparse
import sys
from pathlib import Path
from typing import List, Optional

from .config.loader import get_config
from .generators.json_generator import JsonGenerator
from .generators.query_generator import FieldInfo, QueryGenerator, ViewDefinition
from .generators.xml_generator import XmlGenerator
from .parsers.base_parser import ParsedView
from .parsers.factory import DocumentParser
from .reviewers.linter import Linter
from .utils.name_utils import sanitize_name
from .value_engine.engine import ValueEngine


def create_parser() -> argparse.ArgumentParser:
    """创建命令行参数解析器"""
    parser = argparse.ArgumentParser(
        prog="his-interface-agent",
        description="HIS 接口自动开发 Agent"
    )

    subparsers = parser.add_subparsers(dest="command", help="子命令")

    # ========== parse 子命令 ==========
    parse_parser = subparsers.add_parser("parse", help="解析接口文档")
    parse_parser.add_argument("--file", "-f", required=True, help="接口文档路径(.docx/.pdf/.xlsx/.doc)")
    parse_parser.add_argument("--view", "-v", help="只显示指定视图的详情")

    # ========== rule 子命令 ==========
    rule_parser = subparsers.add_parser("rule", help="规则操作")
    rule_subparsers = rule_parser.add_subparsers(dest="rule_command")

    # rule lookup
    lookup_parser = rule_subparsers.add_parser("lookup", help="查询字段取值规则")
    lookup_parser.add_argument("--field", "-f", required=True, help="字段名")
    lookup_parser.add_argument("--domain", "-d", help="指定域ID")
    lookup_parser.add_argument("--top", "-t", type=int, default=5, help="返回前N个结果")

    # rule list-domains
    rule_subparsers.add_parser("list-domains", help="列出所有域")

    # rule show-domain
    show_parser = rule_subparsers.add_parser("show-domain", help="显示域详情")
    show_parser.add_argument("domain_id", help="域ID")

    # rule quality
    rule_subparsers.add_parser("quality", help="规则库质量报告")

    # rule stats
    stats_parser = rule_subparsers.add_parser("stats", help="域规则统计")
    stats_parser.add_argument("domain_id", nargs="?", default="", help="域ID(为空则显示所有域)")

    # rule conflicts
    rule_subparsers.add_parser("conflicts", help="检查别名冲突")

    # ========== generate 子命令 ==========
    gen_parser = subparsers.add_parser("generate", help="从接口文档生成代码")
    gen_parser.add_argument("--file", "-f", required=True, help="接口文档路径(.docx/.pdf/.xlsx/.doc)")
    gen_parser.add_argument("--view", "-v", help="只生成指定视图(如 V_NIS_PatientBasicInfo)")
    gen_parser.add_argument("--format", "-fmt", default="query",
                           choices=["query", "json", "xml", "all"],
                           help="输出格式(默认query)")
    gen_parser.add_argument("--output", "-o", default="output/", help="输出目录")
    gen_parser.add_argument("--system", "-s", default="", help="系统名(用于包路径)")
    gen_parser.add_argument("--subpath", default="", help="子路径(OP/IP/Common)")
    gen_parser.add_argument("--domain", "-d", default="", help="指定业务域(如 d1-drug-dict)")
    gen_parser.add_argument("--dry-run", action="store_true", help="只预览不生成文件")
    gen_parser.add_argument("--diagnose", action="store_true", help="输出字段匹配诊断报告")
    gen_parser.add_argument("--diagnose-format", default="table",
                           choices=["table", "json", "csv"],
                           help="诊断报告格式(默认table)")
    gen_parser.add_argument("--auto-l4", action="store_true",
                           help="自动接受低于阈值的最佳匹配作为推测值")
    gen_parser.add_argument("--l3-prompt", action="store_true",
                           help="为未匹配字段输出 L3 AI 推理 prompt")

    # ========== review 子命令 ==========
    review_parser = subparsers.add_parser("review", help="审查代码")
    review_parser.add_argument("--file", "-f", required=True, help="要审查的 .cls 文件")

    # ========== feedback 子命令 ==========
    fb_parser = subparsers.add_parser("feedback", help="记录字段取值反馈（回流到别名库）")
    fb_parser.add_argument("--field", "-f", required=True, help="字段代码")
    fb_parser.add_argument("--name", "-n", default="", help="字段中文名")
    fb_parser.add_argument("--expr", "-e", required=True, help="取值表达式")
    fb_parser.add_argument("--global", "-g", default="", help="使用的Global")
    fb_parser.add_argument("--domain", "-d", default="", help="域ID(如 10-patient)")
    fb_parser.add_argument("--standard", "-s", default="", help="标准字段名")
    fb_parser.add_argument("--dry-run", action="store_true", help="仅预览不写入")

    return parser


# ========== parse 命令 ==========

def cmd_parse(args, engine: ValueEngine):
    """解析接口文档并显示结果"""
    file_path = args.file
    view_filter = args.view

    print(f"正在解析: {file_path}")
    parser = DocumentParser()
    result = parser.parse(file_path)

    if not result.success:
        print(f"解析失败:")
        for err in result.errors:
            print(f"  错误: {err}")
        return

    print(f"\n解析成功! 共 {result.view_count} 个视图, {result.total_fields} 个字段\n")

    for view in result.views:
        # 如果指定了视图过滤
        if view_filter and view.view_code != view_filter:
            continue

        fields_info = f"{view.field_count}字段" if view.fields else "无字段定义"
        print(f"  {view.view_code:35s} | {view.view_name:15s} | {view.source_system:8s} | {fields_info}")

        # 如果指定了视图，显示字段详情和L1匹配
        if view_filter and view.view_code == view_filter and view.fields:
            print(f"\n  字段详情 ({view.field_count}个):")
            print(f"  {'字段代码':25s} | {'中文名':15s} | {'L1匹配结果'}")
            print(f"  {'-'*25} | {'-'*15} | {'-'*40}")

            matched = 0
            for f in view.fields:
                match_result = engine.resolve(f.code, {"domain": "10-patient"})
                if match_result:
                    matched += 1
                    match_info = f"[Y] {match_result.standard_name} ({match_result.confidence:.2f})"
                else:
                    match_info = "[N] 未匹配"
                print(f"  {f.code:25s} | {f.name:15s} | {match_info}")

            print(f"\n  匹配率: {matched}/{view.field_count} ({matched/view.field_count*100:.0f}%)")


# ========== rule 命令 ==========

def cmd_rule_lookup(args, engine: ValueEngine):
    """执行 rule lookup 命令"""
    field_name = args.field
    domain = args.domain
    top_n = args.top

    results = engine.search_rules(field_name, domain)

    if not results:
        print(f"未找到匹配规则: {field_name}")
        return

    print(f"匹配结果 (字段: {field_name}):")
    print("-" * 60)
    for i, result in enumerate(results[:top_n], 1):
        print(f"{i}. {result.standard_name}")
        print(f"   分数: {result.score:.2f} | 类型: {result.match_type}")
        print(f"   取值: {result.value_expression}")
        print(f"   Global: {result.global_used}")
        print(f"   域: {result.rule.domain}")
        print()


def cmd_rule_list_domains(args, engine: ValueEngine):
    """执行 rule list-domains 命令"""
    domains = engine.list_domains()
    print(f"已加载 {len(domains)} 个域:")
    print("-" * 40)
    for domain_id in domains:
        rules = engine.get_domain_rules(domain_id)
        print(f"  {domain_id}: {len(rules)} 条规则")


def cmd_rule_show_domain(args, engine: ValueEngine):
    """执行 rule show-domain 命令"""
    domain_id = args.domain_id
    rules = engine.get_domain_rules(domain_id)

    if not rules:
        print(f"未找到域: {domain_id}")
        return

    print(f"域: {domain_id}")
    print(f"规则数: {len(rules)}")
    print("-" * 60)
    for rule in rules:
        print(f"  {rule.standard_name}")
        print(f"    匹配: {', '.join(rule.match_keywords[:5])}")
        print(f"    取值: {rule.value_expression}")
        print()


# ========== rule quality/stats/conflicts ==========

def cmd_rule_quality(args):
    """规则库质量报告"""
    from .value_engine.rule_quality import RuleQualityAnalyzer
    analyzer = RuleQualityAnalyzer()
    report = analyzer.generate_quality_report()
    print(report)


def cmd_rule_stats(args):
    """域规则统计"""
    from .value_engine.rule_quality import RuleQualityAnalyzer
    analyzer = RuleQualityAnalyzer()

    if args.domain_id:
        result = analyzer.analyze_domain(args.domain_id)
        if "error" in result:
            print(f"[ERROR] {result['error']}")
            return
        print(f"\n  域: {result['domain']} — {result.get('name', '')}")
        print(f"  总规则: {result['total_rules']}")
        print(f"  有表达式: {result['with_expression']}")
        print(f"  缺表达式: {result['without_expression']}")
        print(f"  空关键词: {result['empty_keywords']}")
        print(f"  覆盖率: {result['coverage_rate']:.0%}")
        if result['never_matched_count'] > 0:
            print(f"  从未匹配: {result['never_matched_count']} 条")
            for name in result['never_matched'][:10]:
                print(f"    - {name}")
    else:
        results = analyzer.list_all_domains_stats()
        print(f"\n  {'域ID':20s} | {'名称':12s} | {'规则数':>5s} | {'覆盖率':>6s} | {'从未匹配':>5s}")
        print(f"  {'-'*20} | {'-'*12} | {'-'*5} | {'-'*6} | {'-'*5}")
        for r in results:
            if "error" in r:
                print(f"  {r['domain']:20s} | {'ERROR':12s}")
            else:
                print(f"  {r['domain']:20s} | {r.get('name', '')[:12]:12s} | "
                      f"{r['total_rules']:5d} | {r['coverage_rate']:5.0%} | "
                      f"{r['never_matched_count']:5d}")


def cmd_rule_conflicts(args):
    """检查别名冲突"""
    from .value_engine.rule_quality import RuleQualityAnalyzer
    analyzer = RuleQualityAnalyzer()
    conflicts = analyzer.find_conflicts()

    if not conflicts:
        print("[OK] 未发现别名冲突（同一关键词指向多个规则标准名）")
        return

    print(f"\n[!] 发现 {len(conflicts)} 个别名冲突:\n")
    for c in conflicts:
        print(f"  关键词 '{c['keyword']}' → {', '.join(c['standard_names'])}")


# ========== generate 命令 ==========

def cmd_generate(args, engine: ValueEngine, config):
    """从接口文档生成 ObjectScript 代码

    完整流程：解析文档 → L1规则匹配 → 代码生成 → 输出文件
    """
    file_path = Path(args.file)
    view_filter = args.view
    output_format = args.format
    output_dir = Path(args.output)
    system_name = args.system
    sub_path = args.subpath
    domain_hint = args.domain  # 新增：指定业务域
    dry_run = args.dry_run
    diagnose = getattr(args, 'diagnose', False)
    diagnose_format = getattr(args, 'diagnose_format', 'table')
    auto_l4 = getattr(args, 'auto_l4', False)
    l3_prompt = getattr(args, 'l3_prompt', False)

    # ========== 第一步：解析文档 ==========
    print(f"[1/3] 解析文档: {file_path}")
    doc_parser = DocumentParser()
    parse_result = doc_parser.parse(str(file_path))

    if not parse_result.success:
        print("解析失败:")
        for err in parse_result.errors:
            print(f"  错误: {err}")
        return

    # 过滤出有字段定义的视图
    views_with_fields = [v for v in parse_result.views if v.fields]

    if view_filter:
        # ★ 支持模糊匹配：优先精确匹配，其次包含匹配
        exact_matches = [v for v in views_with_fields if v.view_code == view_filter]
        if exact_matches:
            views_with_fields = exact_matches
        else:
            # 包含匹配：view_code 包含 view_filter，或 view_filter 包含 view_code
            fuzzy_matches = [v for v in views_with_fields
                            if view_filter in v.view_code or v.view_code in view_filter]
            if fuzzy_matches:
                views_with_fields = fuzzy_matches
            else:
                print(f"未找到视图: {view_filter}")
                return

    if not views_with_fields:
        print("没有可生成的视图（所有视图都缺少字段定义）")
        return

    print(f"  找到 {len(views_with_fields)} 个可生成的视图\n")

    # ========== 第二步+三步：匹配 + 生成 ==========
    generators = {
        "query": QueryGenerator(config=config),
        "json": JsonGenerator(config=config),
        "xml": XmlGenerator(config=config),
    }

    formats_to_gen = [output_format] if output_format != "all" else ["query", "json", "xml"]

    for view in views_with_fields:
        # 类名/字段名严禁中文，统一清理
        safe_view_code = sanitize_name(view.view_code, system_name)
        print(f"[2/3] L1规则匹配: {view.view_code} ({view.field_count}字段)")

        # 将 ParsedField 转换为生成器需要的格式
        fields = []
        value_results = []

        for i, pf in enumerate(view.fields):
            safe_field_code = sanitize_name(pf.code, f"FIELD_{i+1}")
            field_info = FieldInfo(
                name=pf.name,
                code=safe_field_code,
                field_type=pf.field_type or "String",
                length=pf.length or 50,
                required=pf.required,
            )
            fields.append(field_info)

            # 多轮重试匹配：code → code.upper → 去分隔符 → name → code+domain → name+domain → description
            vr = engine.resolve_multi_round(
                field_code=pf.code,
                field_name_cn=pf.name or "",
                domain_hint=domain_hint,
                description=pf.description or "",
            )
            value_results.append(vr)

        resolved = sum(1 for vr in value_results if vr is not None and vr.is_resolved)
        identified = sum(1 for vr in value_results if vr is not None and not vr.is_resolved)
        unmatched = sum(1 for vr in value_results if vr is None)
        total = view.field_count
        print(f"  匹配率: {resolved}+{identified}/{total} "
              f"(已解析{resolved}/{total}={(resolved/total*100):.0f}%, "
              f"已识别{identified}/{total}={(identified/total*100):.0f}%, "
              f"未匹配{unmatched}/{total}={(unmatched/total*100):.0f}%)")

        # 诊断报告
        if diagnose:
            # 使用指定的域提示或从视图推断
            effective_domain = domain_hint
            if not effective_domain and hasattr(view, 'source_system') and view.source_system:
                effective_domain = view.source_system
            report = engine.build_match_report(
                [(pf.code, pf.name, pf.description or "") for pf in view.fields],
                domain_hint=domain_hint,
            )
            report.view_code = view.view_code
            report.view_name = view.view_name

            # 为未匹配字段生成 L2 MCP 搜索建议
            unmatched_diags = [d for d in report.diagnostics if d.status == "unmatched"]
            if unmatched_diags:
                report.l2_suggestions = [
                    engine.l2_engine.generate_mcp_search_prompt(
                        d.field_code, d.field_name_cn, domain_hint
                    )
                    for d in unmatched_diags
                ]

            if diagnose_format == "json":
                print(report.format_json())
            elif diagnose_format == "csv":
                print(report.format_csv())
            else:
                print(report.format_table())

            # --auto-l4: 自动推测
            if auto_l4 and unmatched > 0:
                unmatched_dicts = [
                    {
                        "code": d.field_code,
                        "name_cn": d.field_name_cn,
                        "best_guess": {
                            "name": d.best_attempt.candidate_name if d.best_attempt else "",
                            "score": d.best_attempt.score if d.best_attempt else 0,
                            "expression": "",
                        },
                        "suggestion": d.suggestion,
                    }
                    for d in unmatched_diags
                ]
                auto_results = engine.l4_handler.auto_fill(unmatched_dicts)
                # 对推测结果标记到 value_results
                for ar in auto_results:
                    if ar.get("value_expression"):
                        # 找到对应索引
                        for i, d in enumerate(unmatched_diags):
                            if d.field_code == ar["field_code"]:
                                import re
                                # 找到原始 value_results 中对应的 None 位置并替换
                                for j, vr in enumerate(value_results):
                                    if vr is None and j < len(view.fields):
                                        pf = view.fields[j]
                                        if pf.code == ar["field_code"] or sanitize_name(pf.code) == ar["field_code"]:
                                            from .value_engine.engine import ValueResult
                                            value_results[j] = ValueResult(
                                                field_name=pf.code,
                                                standard_name=ar.get("field_code", ""),
                                                value_expression=ar["value_expression"],
                                                global_used=ar.get("global_used", ""),
                                                confidence=ar.get("confidence", 0.3),
                                                source="L4-auto",
                                                resolution_status="partial",
                                            )
                                            break
                print(f"\n  [L4-auto] {len(auto_results)} 个字段已自动推测")

            # --l3-prompt: 输出 L3 AI 推理 prompt
            if l3_prompt and unmatched > 0:
                unmatched_for_l3 = [
                    {
                        "code": d.field_code,
                        "name_cn": d.field_name_cn,
                        "description": "",
                    }
                    for d in unmatched_diags
                ]
                matched_for_context = [
                    {
                        "code": d.field_code,
                        "name_cn": d.field_name_cn,
                        "expression": d.match_result.value_expression if d.match_result else "",
                        "global": d.match_result.global_used if d.match_result else "",
                    }
                    for d in report.diagnostics if d.status == "resolved"
                ]
                l3_output = engine.get_l3_prompts_for_unmatched(
                    unmatched_fields=unmatched_for_l3,
                    view_context={"matched": matched_for_context},
                    domain_hint=domain_hint,
                )
                print(f"\n{'='*70}")
                print(l3_output)
                print(f"{'='*70}\n")

        # 记录匹配历史（用于规则库质量分析）
        try:
            from .value_engine.rule_quality import MatchHistoryDB
            history_db = MatchHistoryDB()
            history_entries = []
            for i, pf in enumerate(view.fields):
                vr = value_results[i] if i < len(value_results) else None
                if vr and vr.is_resolved:
                    status = "resolved"
                elif vr and vr.standard_name:
                    status = "identified"
                else:
                    status = "unmatched"
                history_entries.append({
                    "field_code": pf.code,
                    "field_name_cn": pf.name,
                    "match_status": status,
                    "matched_rule": vr.standard_name if vr else "",
                    "match_type": vr.extra.get("matchType", "") if vr and vr.extra else "",
                    "confidence": vr.confidence if vr else 0.0,
                    "source": vr.source if vr else "",
                    "domain": domain_hint if diagnose else "",
                })
            history_db.log_batch(history_entries, view_code=view.view_code,
                                document_file=str(file_path))
        except Exception:
            pass  # 历史记录失败不影响主流程

        # 生成代码
        for fmt in formats_to_gen:
            print(f"[3/3] 生成 {fmt.upper()} 代码...")

            gen = generators[fmt]

            if fmt == "query":
                # Query 生成器使用 ViewDefinition
                view_def = ViewDefinition(
                    view_code=safe_view_code,
                    view_name=view.view_name,
                    fields=fields,
                    description=view.description,
                    original_view_code=view.view_code,  # 保留原始view_code用于包路径匹配
                )
                code = gen.generate(
                    view=view_def,
                    value_results=value_results,
                    system_name=system_name,
                    sub_path=sub_path,
                    engine=engine,
                )
            else:
                # JSON/XML 生成器使用 dict 格式
                field_dicts = [{"name": f.name, "code": f.code} for f in fields]
                code = gen.generate(
                    view_code=safe_view_code,
                    view_name=view.view_name,
                    fields=field_dicts,
                    value_results=value_results,
                    system_name=system_name,
                    sub_path=sub_path,
                    engine=engine,
                )

            if dry_run:
                print(f"\n{'='*60}")
                print(f"  预览: {view.view_code} ({fmt})")
                print(f"{'='*60}")
                print(code[:2000])
                if len(code) > 2000:
                    print(f"\n... (共 {len(code)} 字符，已截断)")
            else:
                # 写入文件（类名不能含中文，自动清理）
                # 如果有多个视图，添加索引避免覆盖
                safe_code = sanitize_name(view.view_code, system_name)
                if len(views_with_fields) > 1:
                    view_idx = views_with_fields.index(view) + 1
                    file_name = f"{safe_code}_{view_idx}_{fmt}.cls"
                else:
                    file_name = f"{safe_code}_{fmt}.cls"
                out_path = output_dir / file_name
                out_path.parent.mkdir(parents=True, exist_ok=True)

                with open(out_path, 'w', encoding='utf-8-sig') as f:
                    f.write(code)

                # 自动审查
                linter = Linter()
                result = linter.review(code)
                if result.errors:
                    print(f"  [FAIL] {out_path} — P0违规{len(result.errors)}项:")
                    for err in result.errors:
                        print(f"         {err}")
                elif result.warnings:
                    print(f"  [WARN] {out_path} — P1警告{len(result.warnings)}项:")
                    for warn in result.warnings:
                        print(f"         {warn}")
                else:
                    print(f"  [OK] 已生成: {out_path}")

        print()


# ========== feedback 命令 ==========

def cmd_feedback(args):
    """记录字段取值反馈，回流到别名库"""
    from .value_engine.feedback import FeedbackCollector

    collector = FeedbackCollector()
    result = collector.record(
        field_code=args.field,
        field_name_cn=args.name,
        value_expression=args.expr,
        global_used=getattr(args, 'global', ''),
        domain=args.domain,
        standard_name=args.standard,
        dry_run=args.dry_run,
    )

    if result["status"] == "error":
        print(f"[ERROR] {result['message']}")
    elif args.dry_run:
        print(f"[DRY RUN] {result['message']}")
        if "preview" in result:
            import json
            print(json.dumps(result["preview"], ensure_ascii=False, indent=2))
    else:
        print(f"[OK] {result['message']}")
        print(f"  文件: {result['file']}")


# ========== review 命令 ==========

def cmd_review(args):
    """执行 review 命令"""
    file_path = Path(args.file)
    if not file_path.exists():
        print(f"文件不存在: {file_path}")
        return

    with open(file_path, 'r', encoding='utf-8-sig') as f:
        code = f.read()

    linter = Linter()
    result = linter.review(code)

    print(f"审查结果: {file_path}")
    print(f"评分: {result.score}/100")
    print(f"状态: {'通过' if result.passed else '未通过'}")
    print()

    if result.errors:
        print(f"P0 错误 ({len(result.errors)}):")
        for error in result.errors:
            print(f"  {error}")
        print()

    if result.warnings:
        print(f"P1 警告 ({len(result.warnings)}):")
        for warning in result.warnings:
            print(f"  {warning}")
        print()

    if result.passed and not result.warnings:
        print("代码审查通过，无违规项。")


# ========== 主入口 ==========

def main(args: Optional[List[str]] = None):
    """主入口"""
    arg_parser = create_parser()
    parsed_args = arg_parser.parse_args(args)

    if not parsed_args.command:
        arg_parser.print_help()
        return

    # 初始化配置和引擎
    config = get_config()
    engine = ValueEngine(
        config=config.value_engine,
        rules_dir=config.domains_dir
    )

    # 加载规则
    count = engine.load_rules()
    print(f"已加载 {count} 条规则\n")

    # 分发命令
    if parsed_args.command == "parse":
        cmd_parse(parsed_args, engine)

    elif parsed_args.command == "rule":
        if parsed_args.rule_command == "lookup":
            cmd_rule_lookup(parsed_args, engine)
        elif parsed_args.rule_command == "list-domains":
            cmd_rule_list_domains(parsed_args, engine)
        elif parsed_args.rule_command == "show-domain":
            cmd_rule_show_domain(parsed_args, engine)
        elif parsed_args.rule_command == "quality":
            cmd_rule_quality(parsed_args)
        elif parsed_args.rule_command == "stats":
            cmd_rule_stats(parsed_args)
        elif parsed_args.rule_command == "conflicts":
            cmd_rule_conflicts(parsed_args)
        else:
            arg_parser.print_help()

    elif parsed_args.command == "feedback":
        cmd_feedback(parsed_args)

    elif parsed_args.command == "generate":
        cmd_generate(parsed_args, engine, config.config if hasattr(config, 'config') else {})

    elif parsed_args.command == "review":
        cmd_review(parsed_args)

    else:
        arg_parser.print_help()


if __name__ == "__main__":
    main()
