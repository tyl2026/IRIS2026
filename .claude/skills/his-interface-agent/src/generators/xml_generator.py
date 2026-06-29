"""XML 格式代码生成器

生成 ObjectScript XML 接口代码，使用 PHA.COM.XML 工具类。
自动检测业务域、加载遍历配置、生成域特定代码。

=== 编码原则（生成代码时必须遵循） ===

1. 公共方法抽离原则：
   - 使用频率高 + 功能复杂 → 必须抽离成类方法
   - 使用频率低 或 功能简单 → 直接内联（如 $zd/$zt/$p 等简单操作）

2. 公共参数抽离原则：
   - 个性化配置参数（如机构代码、机构名称）→ 定义为类 Parameter
   - 使用方式：..#ParameterName
   - 核心思想：修改一处即可全局生效，保证数据来源统一性

3. 变量初始化简洁写法：
   - 2个变量：s var1="",var2=""
   - 3-5个变量：s (var1,var2,...)=""
   - 超过5个：分多行，每行最多5个
"""

import re
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from ..value_engine.engine import ValueResult
from .base_generator import BaseGenerator
from .traversal_loader import TraversalConfig


class XmlGenerator(BaseGenerator):
    """XML 格式代码生成器（继承公共基类）"""

    def __init__(self, config: Optional[Dict[str, Any]] = None, rules_dir: Optional[Path] = None):
        super().__init__(config, rules_dir)
        self.package_prefix = self.config.get("project", {}).get(
            "packagePrefix", "web.DHCENS.BLL"
        )
        # 加载包路径映射配置
        self._package_mapping = self._load_package_mapping()

    def _load_package_mapping(self) -> Dict[str, Any]:
        """加载包路径映射配置"""
        mapping_file = Path(__file__).parent.parent.parent / "config" / "package_mapping.json"
        if mapping_file.exists():
            try:
                import json
                with open(mapping_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception:
                pass
        return {}

    def _get_package_path(self, view_code: str, view_name: str, class_name: str) -> str:
        """根据映射配置获取包路径"""
        mappings = self._package_mapping.get("mappings", {})

        for doc_name, doc_config in mappings.items():
            package_path = doc_config.get("packagePath", "")
            views = doc_config.get("views", {})

            if view_code in views:
                sub_path = views[view_code]
                if sub_path:
                    return f"{package_path}.{sub_path}"
                else:
                    return package_path

        return f"web.DHCENS.BLL.{class_name}"

    def generate(self, view_code: str, view_name: str,
                 fields: List[Dict[str, str]],
                 value_results: Optional[List[Optional[ValueResult]]] = None,
                 system_name: str = "",
                 sub_path: str = "",
                 engine=None) -> str:
        """生成 XML 格式的 ObjectScript 代码

        自动流程：
        1. 从L1匹配结果推断业务域
        2. 按域加载遍历配置
        3. 收集域特定中间变量
        4. 生成域特定代码
        """
        parsed_system, class_name = self._parse_view_code(view_code)
        effective_system = system_name or parsed_system
        # 优先使用映射配置
        package_path = self._get_package_path(view_code, view_name, class_name)
        method_name = f"Get{class_name}"

        # 核心：自动推断业务域
        domain_id = self.detect_domain(value_results)

        # 按域加载遍历配置（优先域ID，回退视图名称）
        traversal_config = self.load_traversal_config(domain_id, view_code)

        # 收集域特定中间变量
        intermediate_vars = self.collect_intermediate_vars(value_results, domain_id, engine)

        # 构建方法体
        method_body, tag_block = self._build_method_body(
            fields, value_results, self._VAR_MAPPING, intermediate_vars, view_name,
            traversal_config, domain_id, view_code
        )

        # 渲染代码
        code = self._render_code(
            package_path=package_path,
            view_code=view_code,
            view_name=view_name,
            method_name=method_name,
            method_body=method_body,
            tag_block=tag_block
        )

        return code

    @staticmethod
    def _parse_view_code(view_code: str) -> tuple:
        """从视图代码解析系统名和类名"""
        parts = view_code.split("_")
        if len(parts) >= 3 and parts[0] == "V":
            return parts[1], "".join(parts[2:])
        elif len(parts) >= 2:
            return parts[0], "".join(parts[1:])
        else:
            return "", view_code

    def _build_package_path(self, system_name: str, sub_path: str,
                            class_name: str) -> str:
        """构建完整包路径"""
        prefix = "web.DHCENS.BLL"
        parts = [prefix]
        if system_name:
            parts.append(system_name)
        if sub_path:
            parts.append(sub_path)
        parts.append(class_name)
        return ".".join(parts)

    def _get_tag_name(self, domain_id: Optional[str], view_code: str = "") -> str:
        """根据业务域生成标签名

        规则：
        - 检验域 (50-lab-exam): GetLabReport (主表) / GetLabItem (子表)
        - 检查域 (55-exam-report): GetExamReport
        - 医嘱域 (40-order): GetOrderInfo
        - 就诊域 (20-visit): GetVisitInfo
        - 诊断域 (30-diagnosis): GetDiagnosisInfo
        - 手术域 (60-surgery): GetSurgeryInfo
        - 费用域 (a0-fee-settlement): GetFeeInfo
        - 默认: GetDataRow
        """
        # 特殊处理：检验明细接口使用子表标签名
        if view_code and ('JYBGMX' in view_code.upper() or '检验明细' in view_code or '检验细项' in view_code):
            return 'GetLabItem'

        tag_map = {
            '50-lab-exam': 'GetLabReport',
            '55-exam-report': 'GetExamReport',
            '40-order': 'GetOrderInfo',
            '20-visit': 'GetVisitInfo',
            '30-diagnosis': 'GetDiagnosisInfo',
            '60-surgery': 'GetSurgeryInfo',
            'a0-fee-settlement': 'GetFeeInfo',
            'd0-pharmacy': 'GetDrugInfo',
            'd1-drug-dict': 'GetDrugInfo',
            '70-nursing': 'GetNursingInfo',
            '90-medical-record': 'GetRecordInfo',
        }
        if domain_id and domain_id in tag_map:
            return tag_map[domain_id]
        return 'GetDataRow'

    def _build_method_body(self, fields: List[Dict[str, str]],
                           value_results: Optional[List[Optional[ValueResult]]],
                           var_mapping: Dict[str, str],
                           intermediate_vars: Dict[str, tuple],
                           view_name: str,
                           traversal_config=None,
                           domain_id: Optional[str] = None,
                           view_code: str = "") -> tuple:
        """构建方法体

        支持双模式查询（与Query/JSON生成器一致）：
        - 模式1：按就诊ID查询（admRowId有值）
        - 模式2：按日期范围查询（startDate/endDate有值）

        对于字典类接口，不需要双模式。

        Returns:
            (method_body, tag_block): 方法体和标签代码块
        """
        lines = []

        # 判断是否为字典类接口
        is_dict_domain = domain_id in ['d1-drug-dict', 'd0-pharmacy', '00-dictionary']

        # 判断是否支持日期范围遍历（模板中引用了 pDateFrom/pDateTo）
        has_date_range = (traversal_config and traversal_config.template and
                         ("pDateFrom" in traversal_config.template or "pDateTo" in traversal_config.template))

        # ===== 1. 参数校验和查询模式判断 =====
        if not is_dict_domain:
            lines.append('        // ========== 参数校验和查询模式判断 ==========')
            lines.append('        If (admRowId="")&&(startDate="") {')
            lines.append('            Set xmlStr="<Response><Code>-1</Code><Message>参数错误:就诊ID和日期范围不能同时为空</Message></Response>"')
            lines.append('            d stream.Write(xmlStr)')
            lines.append('            Quit stream')
            lines.append('        }')
            lines.append('        // 日期格式转换')
            lines.append('        If startDate\'="" {')
            lines.append('            Set pDateFrom=startDate')
            lines.append('            Set pDateTo=endDate')
            lines.append('            If pDateFrom["-" { Set pDateFrom=$zdh(pDateFrom,3) }')
            lines.append('            If pDateTo["-" { Set pDateTo=$zdh(pDateTo,3) }')
            lines.append('        }')
            lines.append('')
        else:
            # 字典类接口：不需要日期范围和就诊ID
            lines.append('        // ========== 字典类接口 ==========')
            lines.append('')

        # 创建 XML 根节点（循环外）
        lines.append('        // ========== 构建XML根节点 ==========')
        lines.append('        Set root=##class(PHA.COM.XML).%New("Response")')
        lines.append('        Set root.Code="0"')
        lines.append('        Set root.Message="成功"')
        lines.append('')

        # ===== 2. 根据入参选择查询模式 =====
        # 从规则库模板中提取标签名（用于模式1遍历）
        tag_name = 'GetDataRow'  # 默认标签名
        if traversal_config and traversal_config.template:
            import re as _re
            _tag_match = _re.search(r'd\s+([A-Za-z]\w+)', traversal_config.template)
            if _tag_match:
                tag_name = _tag_match.group(1)

        if not is_dict_domain:
            lines.append('        // ========== 根据入参选择查询模式 ==========')
            lines.append('        If (admRowId\'="") {')
            lines.append('            // 模式1：按就诊ID查询')
            lines.append('            Set adm=admRowId')

            # 根据业务域选择正确的遍历逻辑
            if domain_id in ['50-lab-exam', '55-exam-report']:
                # ENS 平台表的数据（检验报告、检查报告）
                if domain_id == '50-lab-exam':
                    lines.append('            ; 按就诊ID查询检验报告')
                    lines.append('            Set rowId=""')
                    lines.append('            for {')
                    lines.append('                Set rowId=$o(^Busi.ENS.EnsLISReportResultI("LISRRVisitNumberIndex",adm,rowId))')
                    lines.append('                Quit:rowId=""')
                    lines.append('                Set data=$g(^Busi.ENS.EnsLISReportResultD(rowId))')
                    lines.append('                continue:data=""')
                    lines.append('                Set patDR=$lg(data,3)')
                    lines.append(f'                d {tag_name}')
                    lines.append('            }')
                elif domain_id == '55-exam-report':
                    lines.append('            ; 按就诊ID查询检查报告')
                    lines.append('            Set rowId=""')
                    lines.append('            for {')
                    lines.append('                Set rowId=$o(^Busi.ENS.EnsRISReportResultI("RISRVisitNumberIndex",adm,rowId))')
                    lines.append('                Quit:rowId=""')
                    lines.append('                Set data=$g(^Busi.ENS.EnsRISReportResultD(rowId))')
                    lines.append('                continue:data=""')
                    lines.append('                Set patDR=$lg(data,5)')
                    lines.append(f'                d {tag_name}')
                    lines.append('            }')
            elif domain_id in ['a0-fee-settlement', 'a1-outpatient-invoice']:
                # ★ 费用结算域：按就诊ID遍历账单表
                lines.append('            ; 按就诊ID遍历账单表')
                lines.append('            Set admInfo=$g(^PAADM(adm))')
                lines.append('            If admInfo\'="" {')
                lines.append('                Set pbId=""')
                lines.append('                for {')
                lines.append('                    Set pbId=$o(^DHCPB(0,"ADM",adm,pbId))')
                lines.append('                    Quit:pbId=""')
                lines.append('                    Set pbData=$g(^DHCPB(pbId))')
                lines.append('                    continue:pbData=""')
                lines.append('                    Set pboChild=""')
                lines.append('                    for {')
                lines.append('                        Set pboChild=$o(^DHCPB(pbId,"O",pboChild))')
                lines.append('                        Quit:pboChild=""')
                lines.append('                        Set pboData=$g(^DHCPB(pbId,"O",pboChild))')
                lines.append('                        Set pbdChild=""')
                lines.append('                        for {')
                lines.append('                            Set pbdChild=$o(^DHCPB(pbId,"O",pboChild,"D",pbdChild))')
                lines.append('                            Quit:pbdChild=""')
                lines.append('                            Set pbdData=$g(^DHCPB(pbId,"O",pboChild,"D",pbdChild))')
                lines.append(f'                            d {tag_name}')
                lines.append('                        }')
                lines.append('                    }')
                lines.append('                }')
                lines.append('            }')
            else:
                # 医嘱域的数据
                lines.append('            Set admInfo=$g(^PAADM(adm))')
                lines.append('            If admInfo\'="" {')
                lines.append('                // 遍历该就诊的医嘱')
                lines.append('                Set ordId=""')
                lines.append('                for {')
                lines.append('                    Set ordId=$o(^OEORD(0,"Adm",adm,ordId))')
                lines.append('                    Quit:ordId=""')
                lines.append('                    Set ordItm=""')
                lines.append('                    for {')
                lines.append('                        Set ordItm=$o(^OEORD(ordId,"I",ordItm))')
                lines.append('                        Quit:ordItm=""')
                lines.append('                        Set ordstr1=$g(^OEORD(ordId,"I",ordItm,1))')
                lines.append('                        continue:ordstr1=""')
                lines.append('                        Set ordstr2=$g(^OEORD(ordId,"I",ordItm,2))')
                lines.append('                        Set arcimDr=$p(ordstr2,"^",1)')
                lines.append(f'                        d {tag_name}')
                lines.append('                    }')
                lines.append('                }')
                lines.append('            }')

            lines.append('        } Else {')
            lines.append('            // 模式2：按日期范围遍历')
            lines.append('')

        # 如果有遍历配置，添加遍历代码（域推断+自动加载）
        if traversal_config and traversal_config.template:
            lines.append('        // ========== 遍历数据源（从规则库加载）==========')

            # 前置变量处理
            pre_var_lines = self.process_pre_variables(traversal_config)
            for pv_line in pre_var_lines:
                lines.append(f'        {pv_line}')

            # 模板内容（点号→空格 + 缩写展开）
            # ★ 替换模板中的日期变量为方法参数
            template_text = traversal_config.template.replace('pStartDate', 'pDateFrom').replace('pEndDate', 'pDateTo')
            template_lines, for_depth = self.convert_template(template_text, "        ")
            lines.extend(template_lines)

            # 关闭未关闭的 For 循环（从内到外逐层关闭，缩进逐层减少）
            base_indent_len = 8  # '        ' 的长度
            for i in range(for_depth):
                indent_len = base_indent_len + 4 * (for_depth - 1 - i)
                close_indent = ' ' * indent_len
                lines.append(f'{close_indent}}}')

            # 循环外：输出 XML
            lines.append('')
            lines.append('        // ========== 输出XML ==========')
            lines.append('        Set xmlStr=root.ToXML()')
            lines.append('        d stream.Write(xmlStr)')
            lines.append('        Quit stream')
        else:
            # 无遍历配置，直接生成
            lines.append(f'        Set data=##class(PHA.COM.XML).%New("{view_code}")')

            # ★ 中间变量（按依赖顺序排列）
            if intermediate_vars:
                lines.append('        // ========== 中间变量 ==========')
                sorted_vars = self._sort_vars_by_dependency(intermediate_vars)
                for var_name in sorted_vars:
                    if var_name not in intermediate_vars:
                        continue
                    expr, desc = intermediate_vars[var_name]
                    expr = self._replace_vars(expr, var_mapping)
                    expr = self._normalize_global_subscripts(expr)
                    expr = self._normalize_global_names(expr)
                    expr = self._quote_external_properties(expr)
                    expr = self._fix_operator_spaces(expr)
                    lines.append(f'        Set {var_name}={expr}  ; {desc}')
                    var_mapping[var_name] = var_name
                lines.append('')

            # 字段取值（先取值到变量，再赋值到data节点）
            lines.append('        // 字段取值')

            # 批量初始化变量：s (var1,var2,...)=""
            todo_vars = []
            for i, field in enumerate(fields):
                var_name = self._to_camel_case(field["code"])
                if value_results and i < len(value_results) and value_results[i]:
                    result = value_results[i]
                    expr = result.value_expression
                    if not expr:
                        todo_vars.append(var_name)
                else:
                    todo_vars.append(var_name)
            if todo_vars:
                # 规则：2个变量用 s var1="",var2=""；3-5个用 s (var1,var2,...)=""；超过5个分多行
                if len(todo_vars) == 2:
                    # 2个变量：s var1="",var2=""
                    lines.append(f'        s {todo_vars[0]}="",{todo_vars[1]}=""  ; 初始化变量')
                elif len(todo_vars) <= 5:
                    # 3-5个变量：s (var1,var2,...)=""
                    vars_str = ",".join(todo_vars)
                    lines.append(f'        s ({vars_str})=""  ; 初始化变量')
                else:
                    # 超过5个变量：分多行，每行最多5个
                    chunk_size = 5
                    for j in range(0, len(todo_vars), chunk_size):
                        chunk = todo_vars[j:j+chunk_size]
                        if len(chunk) == 2:
                            lines.append(f'        s {chunk[0]}="",{chunk[1]}=""  ; 初始化变量')
                        else:
                            vars_str = ",".join(chunk)
                            lines.append(f'        s ({vars_str})=""  ; 初始化变量')

            for i, field in enumerate(fields):
                var_name = self._to_camel_case(field["code"])
                comment = field["name"] if field.get("name") else field["code"]
                if value_results and i < len(value_results) and value_results[i]:
                    result = value_results[i]
                    expr = result.value_expression
                    if expr:
                        expr = self._replace_vars(expr, var_mapping)
                        expr = self._normalize_global_subscripts(expr)
                        expr = self._quote_external_properties(expr)
                        expr = self._fix_operator_spaces(expr)
                        lines.append(f'        Set {var_name}={expr}  ; {comment}')
                    else:
                        # 已在批量初始化中处理，跳过
                        pass
                else:
                    # 已在批量初始化中处理，跳过
                    pass

            # 赋值到data节点
            lines.append('')
            lines.append('        // 赋值到XML节点')
            for i, field in enumerate(fields):
                var_name = self._to_camel_case(field["code"])
                comment = field["name"] if field.get("name") else field["code"]
                lines.append(f'        Set data.{var_name}={var_name}  ; {comment}')

            lines.append('')
            lines.append('        d root.Insert(data)')
            lines.append('')
            lines.append('        // 输出XML')
            lines.append('        Set xmlStr=root.ToXML()')
            lines.append('        d stream.Write(xmlStr)')
            lines.append('        Quit stream')

        # 关闭双模式括号
        if not is_dict_domain:
            lines.append('        }  ; end if admRowId')

        # ===== 生成标签代码块 =====
        # 使用与模式1遍历相同的标签名
        tag_lines = []
        tag_lines.append('')
        tag_lines.append(tag_name)
        tag_lines.append('    ; 获取字段值')
        tag_lines.append(f'    Set data=##class(PHA.COM.XML).%New("{view_code}")')

        # ★ 基础变量定义（按需：只有被引用时才定义）
        # 收集所有字段表达式中引用的变量
        referenced_vars = set()
        if value_results:
            for vr in value_results:
                if vr and vr.value_expression:
                    expr_clean = re.sub(r'"[^"]*"', '""', vr.value_expression)
                    for var in re.findall(r'\b([A-Za-z_][A-Za-z0-9_]*)\b', expr_clean):
                        if len(var) > 1:
                            referenced_vars.add(var)

        # ★ 检查中间变量中的变量引用
        if intermediate_vars:
            for var_name, (expr, desc) in intermediate_vars.items():
                if expr:
                    expr_clean = re.sub(r'"[^"]*"', '""', expr)
                    for var in re.findall(r'\b([A-Za-z_][A-Za-z0-9_]*)\b', expr_clean):
                        if len(var) > 1:
                            referenced_vars.add(var)

        # ★ 费用/发票域：始终需要 patDR 和 hospDr（遍历模板中只有 prtData/etc，无这些基础变量）
        if domain_id in ['a0-fee-settlement', 'a1-outpatient-invoice']:
            tag_lines.append('    s patDR=$p($g(^PAADM(adm)),"^",1)  ; 患者DR')
            tag_lines.append('    s ctlocDr=$p($g(^PAADM(adm)),"^",4)  ; 科室DR')
            tag_lines.append('    s hospDr=$p($g(^CTLOC(ctlocDr)),"^",22)  ; 院区DR')
        else:
            # 其他域：按需定义
            if 'patDR' in referenced_vars and 'patDR' not in loop_vars:
                tag_lines.append('    s patDR=$p($g(^PAADM(adm)),"^",1)  ; 患者DR')
            if 'hospDr' in referenced_vars and 'hospDr' not in loop_vars:
                tag_lines.append('    s ctlocDr=$p($g(^PAADM(adm)),"^",4)  ; 科室DR')
                tag_lines.append('    s hospDr=$p($g(^CTLOC(ctlocDr)),"^",22)  ; 院区DR')

        # 中间变量（过滤掉遍历循环变量）
        # 遍历循环变量：这些变量在遍历循环中已经定义，不需要在标签代码块中重新定义
        loop_vars = self.get_domain_loop_vars(domain_id)
        # ★ 修复：检查 loop_vars 中哪些变量被其他中间变量依赖
        # arcSub/arcVer 在 loop_vars 中被跳过，但 phcdfDr 依赖它们
        # 需要将被依赖的 loop_vars 变量也输出到标签代码块中
        loop_deps_needed = set()
        if intermediate_vars:
            for var_name, (expr, desc) in intermediate_vars.items():
                if var_name in loop_vars:
                    continue
                expr_clean = re.sub(r'"[^"]*"', '""', expr)
                for dep_var in re.findall(r'\b([A-Za-z_][A-Za-z0-9_]*)\b', expr_clean):
                    if dep_var in loop_vars and dep_var not in intermediate_vars:
                        loop_deps_needed.add(dep_var)
        if intermediate_vars:
            tag_lines.append('    // ========== 中间变量 ==========')
            # ★ 收集所有被其他中间变量依赖的 loop_vars 变量
            all_loop_deps_needed = set()
            for var_name, (expr, desc) in intermediate_vars.items():
                expr_clean = re.sub(r'"[^"]*"', '""', expr)
                for dep_var in re.findall(r'\b([A-Za-z_][A-Za-z0-9_]*)\b', expr_clean):
                    if dep_var in loop_vars:
                        all_loop_deps_needed.add(dep_var)
            sorted_vars = self._sort_vars_by_dependency(intermediate_vars)
            for var_name in sorted_vars:
                if var_name not in intermediate_vars:
                    continue
                # 跳过遍历循环变量（除非被其他中间变量依赖）
                if var_name in loop_vars and var_name not in all_loop_deps_needed:
                    continue
                expr, desc = intermediate_vars[var_name]
                expr = self._replace_vars(expr, var_mapping)
                expr = self._normalize_global_subscripts(expr)
                expr = self._normalize_global_names(expr)
                expr = self._quote_external_properties(expr)
                expr = self._fix_operator_spaces(expr)
                tag_lines.append(f'    Set {var_name}={expr}  ; {desc}')
                var_mapping[var_name] = var_name
            tag_lines.append('')

        # ★ 过滤中间变量：只保留当前接口实际使用的中间变量
        # 收集所有字段表达式中引用的变量
        all_expr_vars = set()
        if value_results:
            for vr in value_results:
                if vr and vr.value_expression:
                    for var in re.findall(r'\b([a-zA-Z_]\w+)\b', vr.value_expression):
                        all_expr_vars.add(var)

        # 过滤中间变量：只保留被字段表达式引用的变量
        filtered_intermediate_vars = {}
        if intermediate_vars:
            for var_name, (expr, desc) in intermediate_vars.items():
                if var_name in all_expr_vars:
                    filtered_intermediate_vars[var_name] = (expr, desc)

            # 递归检查依赖
            changed = True
            while changed:
                changed = False
                for var_name, (expr, desc) in intermediate_vars.items():
                    if var_name in filtered_intermediate_vars:
                        continue
                    for kept_var in list(filtered_intermediate_vars.keys()):
                        kept_expr = filtered_intermediate_vars[kept_var][0]
                        if var_name in kept_expr:
                            filtered_intermediate_vars[var_name] = (expr, desc)
                            changed = True
                            break

        # 字段取值
        tag_lines.append('    // 字段取值')

        # ★ 构建已定义变量集（用于表达式变量验证）
        defined_vars = loop_vars.copy()
        defined_vars.add('data')
        if intermediate_vars:
            defined_vars.update(intermediate_vars.keys())

        # 收集所有字段的表达式和中间变量依赖
        field_data = []
        for i, field in enumerate(fields):
            var_name = self._to_camel_case(field["code"])
            comment = field["name"] if field.get("name") else field["code"]
            expr = ""
            vr = value_results[i] if value_results and i < len(value_results) else None
            if vr:
                expr = vr.value_expression or ""
            if expr:
                expr = self._replace_vars(expr, var_mapping)
                expr = self._normalize_global_subscripts(expr)
                expr = self._normalize_global_names(expr)
                expr = self._quote_external_properties(expr)
                expr = self._fix_operator_spaces(expr)

                # ★ 表达式变量验证：检查引用的变量是否在当前上下文中已定义
                undefined = self.validate_expression_vars(expr, defined_vars)
                if undefined:
                    import logging
                    logging.warning(f"字段 '{comment}' 表达式引用了未定义变量 {undefined}，"
                                    f"已降级为TODO。表达式: {expr[:80]}")
                    expr = ""

            # ★ 时间/日期字段自动转换为使用 FormatDT 方法
            if expr:
                if '_" "_' in expr:
                    parts = expr.split('_" "_')
                    if len(parts) == 2:
                        date_part = parts[0]
                        time_part = parts[1]
                        if date_part.startswith('$zd(') and date_part.endswith(',3)'):
                            date_expr = date_part[4:-3]
                            if time_part.startswith('$zt(') and time_part.endswith(')'):
                                time_expr = time_part[4:-1]
                                expr = f'..FormatDT({date_expr},{time_expr})'
                elif expr.startswith('$zd(') and expr.endswith(',3)'):
                    date_expr = expr[4:-3]
                    expr = f'..FormatDT({date_expr},"")'
                elif expr.startswith('$zt(') and expr.endswith(')'):
                    time_expr = expr[4:-1]
                    expr = f'..FormatDT("",{time_expr})'
                elif '$lg(data,' in expr and expr.endswith(')'):
                    time_keywords = ['时间', 'Time', 'Sj', 'sj', 'Rq', 'rq', 'Date', 'date']
                    field_name = field.get("name", "")
                    is_time_field = any(kw in field_name for kw in time_keywords)
                    if is_time_field:
                        import re as _re
                        lg_match = _re.search(r'\$lg\(data,(\d+)\)', expr)
                        if lg_match:
                            lg_expr = lg_match.group(0)
                            date_keywords = ['日期', 'Date', 'Rq', 'rq']
                            is_date_field = any(kw in field_name for kw in date_keywords)
                            if is_date_field:
                                expr = f'..FormatDT({lg_expr},"")'
                            else:
                                expr = f'..FormatDT("",{lg_expr})'

            # 找出主中间变量（只在 filtered_intermediate_vars 中查找）
            iv = None
            if expr and filtered_intermediate_vars:
                for iv_name in sorted(filtered_intermediate_vars.keys(), key=len, reverse=True):
                    if re.search(r'\b' + re.escape(iv_name) + r'\b', expr):
                        iv = iv_name
                        break

            field_data.append((var_name, comment, expr, vr, iv))

        # 批量初始化变量
        todo_vars = []
        for item in field_data:
            vn, cm, ex, vr, iv = item
            if not ex or (vr and hasattr(vr, 'resolution_status') and vr.resolution_status in ("identified", "unmatched")):
                todo_vars.append(vn)
        if todo_vars:
            if len(todo_vars) == 2:
                tag_lines.append(f'    s {todo_vars[0]}="",{todo_vars[1]}=""  ; 初始化变量')
            elif len(todo_vars) <= 5:
                vars_str = ",".join(todo_vars)
                tag_lines.append(f'    s ({vars_str})=""  ; 初始化变量')
            else:
                chunk_size = 5
                for j in range(0, len(todo_vars), chunk_size):
                    chunk = todo_vars[j:j+chunk_size]
                    if len(chunk) == 2:
                        tag_lines.append(f'    s {chunk[0]}="",{chunk[1]}=""  ; 初始化变量')
                    else:
                        vars_str = ",".join(chunk)
                        tag_lines.append(f'    s ({vars_str})=""  ; 初始化变量')

        # 按主中间变量分组
        # 注意：当 need_subtable=True 时，跳过主表字段取值
        # 因为子表视图（如 DBZ_JYBGMX）的字段应该从子表 itemData 取值，而不是主表 data
        need_subtable_check = False
        subtable_config_check = None
        if traversal_config and traversal_config.subtable:
            subtable_config_check = traversal_config.subtable
            view_lower_check = view_code.lower()
            for matcher in subtable_config_check.view_matchers:
                if matcher.lower() in view_lower_check:
                    need_subtable_check = True
                    break

        if not need_subtable_check:
            from collections import OrderedDict
            groups = OrderedDict()
            for item in field_data:
                iv = item[4]
                groups.setdefault(iv, []).append(item)

            # 逐组输出取值
            for iv, items in groups.items():
                if iv and iv in (filtered_intermediate_vars or {}):
                    tag_lines.append(f'    if ({iv}\'="") {{')
                    for item in items:
                        vn, cm, ex, vr, _ = item
                        if ex:
                            tag_lines.append(f'        Set {vn}={ex}  ; {cm}')
                        elif vn not in todo_vars:
                            tag_lines.append(f'        Set {vn}=""  ; {cm} TODO')
                    tag_lines.append(f'    }}')
                else:
                    for item in items:
                        vn, cm, ex, vr, _ = item
                        if ex:
                            tag_lines.append(f'    Set {vn}={ex}  ; {cm}')
                        elif vn not in todo_vars:
                            tag_lines.append(f'    Set {vn}=""  ; {cm} TODO')

        # ★ 子表遍历支持
        # 检查当前视图是否需要子表遍历
        need_subtable = False
        subtable_config = None
        if traversal_config and traversal_config.subtable:
            subtable_config = traversal_config.subtable
            # 检查 view_code 是否匹配子表的 viewMatchers
            view_lower = view_code.lower()
            for matcher in subtable_config.view_matchers:
                if matcher.lower() in view_lower:
                    need_subtable = True
                    break

        if need_subtable and subtable_config and subtable_config.template:
            # 生成子表遍历代码
            tag_lines.append('    ; 子表遍历（检验细项）')
            # 从主表data中提取关联键
            parent_key_expr = subtable_config.parent_key_expression
            if parent_key_expr:
                tag_lines.append(f'    s reportId={parent_key_expr}  ; 主表报告ID')

            # 解析子表模板，生成遍历代码
            subtable_template = subtable_config.template
            subtable_lines = subtable_template.strip().split('\n')
            for line in subtable_lines:
                line = line.rstrip()
                if not line:
                    continue
                if line.startswith('...'):
                    tag_lines.append('            ' + line[3:])
                elif line.startswith('..'):
                    tag_lines.append('        ' + line[2:])
                elif line.startswith('.'):
                    tag_lines.append('    ' + line[1:])
                else:
                    tag_lines.append('    ' + line)

            # 主标签代码块以 q 结尾
            tag_lines.append('    q')
            tag_lines.append('')

            # 添加子表字段取值标签
            tag_lines.append('GetItemDetail')
            tag_lines.append('    ; 获取子表字段值')
            tag_lines.append(f'    Set data=##class(PHA.COM.XML).%New("{view_code}")')

            # 子表字段取值（使用 itemData 变量）
            for item in field_data:
                vn, cm, ex, vr, _ = item
                if ex:
                    ec_item = ex.replace('$lg(data,', '$lg(itemData,')
                    ec_item = ec_item.replace('$p(data,', '$p(itemData,')
                else:
                    ec_item = ex
                if ec_item:
                    tag_lines.append(f'    Set {vn}={ec_item}  ; {cm}')
                elif vn not in todo_vars:
                    tag_lines.append(f'    Set {vn}=""  ; {cm} TODO')

            # 子表赋值到XML节点
            tag_lines.append('')
            tag_lines.append('    // 赋值到XML节点')
            for i, field in enumerate(fields):
                var_name = self._to_camel_case(field["code"])
                comment = field["name"] if field.get("name") else field["code"]
                tag_lines.append(f'    Set data.{var_name}={var_name}  ; {comment}')

            tag_lines.append('')
            tag_lines.append('    d root.Insert(data)')
            tag_lines.append('    q')
        else:
            # 无子表遍历：普通字段取值
            # 赋值到data节点
            tag_lines.append('')
            tag_lines.append('    // 赋值到XML节点')
            for i, field in enumerate(fields):
                var_name = self._to_camel_case(field["code"])
                comment = field["name"] if field.get("name") else field["code"]
                tag_lines.append(f'    Set data.{var_name}={var_name}  ; {comment}')

            # 添加数据节点到根节点
            tag_lines.append('')
            tag_lines.append('    d root.Insert(data)')
            tag_lines.append('    q')

        tag_block = '\n'.join(tag_lines)

        return '\n'.join(lines), tag_block

    def _render_code(self, package_path: str, view_code: str,
                     view_name: str, method_name: str,
                     method_body: str, tag_block: str = None) -> str:
        """渲染完整代码

        XML接口统一入参格式：input As %String（XML字符串）
        入参XML格式（使用PHA.COM.XML.FromXML解析，无需模型类）：
        - 按日期范围查询: <Request><StartDate>2025-01-01</StartDate><EndDate>2025-01-31</EndDate><HospitalId>1</HospitalId></Request>
        - 按就诊ID查询: <Request><AdmRowId>123</AdmRowId></Request>
        """
        now = datetime.now().strftime("%Y-%m-%d")
        author = self.author

        # 标签代码块
        tag_section = tag_block if tag_block else ""

        code = f"""Class {package_path} Extends %RegisteredObject
{{

/// ======================================================================
/// {package_path}
/// 功能描述：{view_name}（XML格式）
///
/// 数据来源: DHC HIS 系统 Global 结构说明
///
/// Package:   {package_path}
/// Author:    {author}
/// Date:      {now}
/// ======================================================================

/// 方法说明：获取{view_name}
/// 输入参数: input: XML格式入参字符串
/// 输出: %GlobalCharacterStream (XML格式)
/// === 调试命令 ===
/// [终端/Portal运行]:
///     按就诊ID查询:
///     w ##class({package_path}).{method_name}("<Request><AdmRowId>123</AdmRowId></Request>").Read()
///     按日期范围查询:
///     w ##class({package_path}).{method_name}("<Request><StartDate>2025-01-01</StartDate><EndDate>2025-01-31</EndDate><HospitalId>1</HospitalId></Request>").Read()
ClassMethod {method_name}(input As %String) As %GlobalCharacterStream
{{
    s stream=##class(%GlobalCharacterStream).%New()
    s $zt="err"

    // ========== 使用PHA.COM.XML.FromXML解析入参 ==========
    s inputXml=##class(PHA.COM.XML).FromXML(input)
    s admRowId=inputXml.Get("AdmRowId")
    s startDate=inputXml.Get("StartDate")
    s endDate=inputXml.Get("EndDate")
    s hospitalId=inputXml.Get("HospitalId")
    // 兼容遍历模板中的变量名
    s pHospitalId=hospitalId

{method_body}

{tag_section}
err
    s $zt=""
    s root=##class(PHA.COM.XML).%New("Response")
    s root."Code"="99"
    s root."Message"="系统错误:"_$ze
    s xmlStr=root.ToXML()
    d stream.Write(xmlStr)
    q stream
}}

/// 方法说明：格式化日期时间（$H格式转为显示格式，自动处理空值）
/// 输入参数: pDate: $H格式日期(可为空), pTime: $H格式时间(可为空)
/// 输出: "YYYY-MM-DD HH:MM:SS" 或 "YYYY-MM-DD" 或 ""(空值)
/// 示例: d ##class({package_path}).FormatDT(66543,3600) 返回 "2023-01-01 01:00:00"
///        d ##class({package_path}).FormatDT(66543,"") 返回 "2023-01-01"
///        d ##class({package_path}).FormatDT("",3600) 返回 "01:00:00"
///        d ##class({package_path}).FormatDT("","") 返回 ""
ClassMethod FormatDT(pDate As %String = "", pTime As %String = "") As %String
{{
    s result=""
    i pDate'="" {{
        s result=$zd(pDate,3)
    }}
    i pTime'="" {{
        i result'="" {{
            s result=result_" "_$zt(pTime,1)
        }} else {{
            s result=$zt(pTime,1)
        }}
    }}
    q result
}}

}}
"""
        return code

    # _to_camel_case, _expand_os_commands, _replace_vars, _is_simple_expr,
    # _parse_view_code, _build_package_path, _find_dependency_rule
    # 均继承自 BaseGenerator

    @staticmethod
    def _replace_vars(expr: str, var_mapping: Dict[str, str]) -> str:
        """替换表达式中的变量名"""
        result = expr
        for old_var, new_var in var_mapping.items():
            result = re.sub(r'\b' + re.escape(old_var) + r'\b', new_var, result)
        return result

    @staticmethod
    def _to_camel_case(name: str) -> str:
        """将变量名转为驼峰命名（含中文清理，委托基类实现）"""
        from .base_generator import BaseGenerator
        return BaseGenerator._to_camel_case(name)
