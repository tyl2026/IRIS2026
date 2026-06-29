"""Query 格式代码生成器

基于 Jinja2 模板引擎，生成 ObjectScript Query 代码。
生成标准 Query 结构：
- 类定义
- Query 声明（含 ROWSPEC）
- Execute 方法（含数据遍历逻辑）
- Fetch/Close 方法

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
from typing import Any, Dict, List, Optional, Tuple

from ..value_engine.engine import ValueResult
from .base_generator import BaseGenerator
from .traversal_loader import TraversalConfig, TraversalLoader, get_traversal_loader


class FieldInfo:
    """字段信息"""

    def __init__(self, name: str, code: str, field_type: str = "String",
                 length: int = 50, required: bool = True,
                 value_result: Optional[ValueResult] = None):
        self.name = name          # 字段中文名
        self.code = code          # 字段代码（英文，ROWSPEC 用）
        self.field_type = field_type  # 字段类型
        self.length = length      # 长度
        self.required = required  # 是否必填
        self.value_result = value_result  # 取值结果

    @property
    def var_name(self) -> str:
        """ObjectScript 变量名（小驼峰，无下划线，中文转英文）

        ObjectScript 标识符严禁下划线。
        Patient_Id → patientId
        Birth_Date → birthDate
        Name → name
        医疗机构代码 → orgCode
        """
        from .base_generator import BaseGenerator
        return BaseGenerator._to_camel_case(self.code)

    @property
    def iris_type(self) -> str:
        """IRIS 数据类型"""
        type_map = {
            "String": "%String",
            "字符型": "%String",
            "Numeric": "%Numeric",
            "数字型": "%Numeric",
            "Date": "%Date",
            "日期型": "%Date",
            "Time": "%Time",
            "时间型": "%Time",
        }
        return type_map.get(self.field_type, "%String")

    @property
    def rowspec_type(self) -> str:
        """ROWSPEC 类型"""
        if "Numeric" in self.field_type or "数字" in self.field_type:
            return "%Numeric"
        return "%String"


class ViewDefinition:
    """视图定义"""

    def __init__(self, view_code: str, view_name: str,
                 fields: List[FieldInfo], description: str = "",
                 original_view_code: str = ""):
        self.view_code = view_code      # 视图代码（清理后），如 ods_outpatient_info
        self.view_name = view_name      # 视图名称
        self.fields = fields            # 字段列表
        self.description = description  # 描述
        self.original_view_code = original_view_code or view_code  # 原始视图代码（可能含中文）


class QueryGenerator(BaseGenerator):
    """Query 格式代码生成器（继承公共基类）"""

    def __init__(self, config: Optional[Dict[str, Any]] = None, rules_dir: Optional[Path] = None):
        super().__init__(config, rules_dir)
        self.package_prefix = self.config.get("project", {}).get(
            "packagePrefix", "web.DHCENS.BLL"
        )
        self.traversal_loader = get_traversal_loader(rules_dir)
        # 加载包路径映射配置
        self._package_mapping = self._load_package_mapping()

    def _collect_dependencies(self, var_name: str, intermediates: Dict[str, tuple],
                              collected: set, depth: int = 0):
        """递归收集变量的所有依赖变量

        Args:
            var_name: 变量名
            intermediates: 中间变量字典 {name: (expr, desc)}
            collected: 已收集的变量集合
            depth: 当前递归深度（防止无限递归）
        """
        if depth > 10:  # 防止无限递归
            return

        if var_name not in intermediates:
            return

        expr, _ = intermediates[var_name]
        if not expr:
            return

        # 提取表达式中的变量引用
        import re
        clean = re.sub(r'"[^"]*"', '""', expr)
        clean = re.sub(r'\^[A-Za-z][A-Za-z0-9]+', '', clean)

        for dep_var in re.findall(r'\b([A-Za-z_][A-Za-z0-9_]*)\b', clean):
            if dep_var in collected:
                continue
            if dep_var in intermediates:
                collected.add(dep_var)
                self._collect_dependencies(dep_var, intermediates, collected, depth + 1)

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

    def _get_package_path(self, view_code: str, view_name: str, class_name: str,
                          system_name: str = "", sub_path: str = "",
                          original_view_code: str = "") -> str:
        """根据映射配置获取包路径

        优先级：
        1. 映射配置中的 original_view_code 匹配（原始视图代码，可能含中文）
        2. 映射配置中的 view_code 匹配（清理后的视图代码）
        3. 使用传入的 system_name 和 sub_path 构建路径
        4. 默认路径 web.DHCENS.BLL.{类名}

        规范：web.DHCENS.BLL.{系统名}.{OP|IP|Common}.{类名}
        """
        mappings = self._package_mapping.get("mappings", {})

        # 遍历映射配置，查找匹配的视图
        for doc_name, doc_config in mappings.items():
            package_path = doc_config.get("packagePath", "")
            views = doc_config.get("views", {})

            # 优先使用原始view_code匹配（保留中文前缀）
            if original_view_code and original_view_code in views:
                mapped_sub = views[original_view_code]
                if mapped_sub:
                    return f"{package_path}.{mapped_sub}"
                else:
                    return package_path

            # 再尝试清理后的view_code匹配
            if view_code in views:
                mapped_sub = views[view_code]
                if mapped_sub:
                    return f"{package_path}.{mapped_sub}"
                else:
                    return package_path

        # 使用传入的 system_name 和 sub_path
        if system_name:
            parts = [self.package_prefix, system_name]
            if sub_path:
                parts.append(sub_path)
            parts.append(class_name)
            return ".".join(parts)

        # 默认路径
        return f"{self.package_prefix}.{class_name}"

    def generate(self, view: ViewDefinition,
                 value_results: Optional[List[Optional[ValueResult]]] = None,
                 system_name: str = "",
                 sub_path: str = "",
                 engine=None) -> str:
        """生成 Query 格式的 ObjectScript 代码

        Args:
            view: 视图定义
            value_results: 取值结果列表（与 view.fields 一一对应）
            system_name: 系统名
            sub_path: 子路径（OP/IP/Common）
            engine: 取值引擎（用于查找中间变量的取值表达式）

        Returns:
            ObjectScript 代码字符串
        """
        # 从视图代码解析系统名和类名
        # V_NIS_PatientBasicInfo → system=NIS, class=PatientBasicInfo
        parsed_system, class_name = self._parse_view_code(view.view_code)

        # 优先使用调用方传入的 system_name，否则用解析结果
        effective_system = system_name or parsed_system

        # 构建包路径：优先使用映射配置
        # 使用view.original_view_code进行匹配（保留中文前缀）
        package_path = self._get_package_path(view.view_code, view.view_name, class_name,
                                               effective_system, sub_path,
                                               original_view_code=view.original_view_code)

        # 构建 ROWSPEC
        rowspec = self._build_rowspec(view.fields)

        # 构建变量名列表（用于 $lb()）
        field_vars = ','.join(f.var_name for f in view.fields)

        # 构建方法体（传入 engine 用于依赖解析）
        method_body, tag_block = self._build_method_body(view.fields, value_results, engine, view.view_code)

        # 获取域ID（用于判断是否是字典类接口）
        domain_id = self._detect_domain(value_results)

        # 收集配置参数字段（fieldType="parameter"）
        parameter_fields = []
        if value_results:
            for i, vr in enumerate(value_results):
                if vr and vr.field_type == 'parameter':
                    field = view.fields[i] if i < len(view.fields) else None
                    if field:
                        parameter_fields.append({
                            'name': field.var_name,
                            'code': field.code,
                            'default': vr.default_value or '',
                            'description': vr.extra.get('description', '')
                        })

        # 构建完整代码
        code = self._render_code(
            package_path=package_path,
            view=view,
            rowspec=rowspec,
            method_body=method_body,
            field_vars=field_vars,
            tag_block=tag_block,
            domain_id=domain_id,
            parameter_fields=parameter_fields
        )

        # P0红线检查
        import logging
        logger = logging.getLogger(__name__)
        errors = self._validate_code(code)
        if errors:
            for error in errors:
                logger.warning(f"P0检查警告 [{view.view_code}]: {error}")

        return code

    @staticmethod
    def _parse_view_code(view_code: str) -> tuple:
        """从视图代码解析系统名和类名

        规范: V_{SYSTEM}_{ClassName}
        示例:
            V_NIS_PatientBasicInfo → ("NIS", "PatientBasicInfo")
            V_NIS_Office → ("NIS", "Office")
            V_NIS_Transfer → ("NIS", "Transfer")
        """
        parts = view_code.split("_")
        if len(parts) >= 3 and parts[0] == "V":
            # V_NIS_PatientBasicInfo → system=NIS, class=PatientBasicInfo
            system = parts[1]
            class_name = "".join(parts[2:])  # 去掉下划线，拼为驼峰
            return system, class_name
        elif len(parts) >= 2:
            # 兜底：取第一段为系统，其余为类名
            return parts[0], "".join(parts[1:])
        else:
            return "", view_code

    @staticmethod
    def _build_package_path(system_name: str, sub_path: str,
                            class_name: str) -> str:
        """构建完整包路径

        规范: web.DHCENS.BLL.{系统名}.{类名}
        """
        prefix = "web.DHCENS.BLL"
        parts = [prefix]
        if system_name:
            parts.append(system_name)
        if sub_path:
            parts.append(sub_path)
        parts.append(class_name)
        return ".".join(parts)

    def _build_rowspec(self, fields: List[FieldInfo]) -> str:
        """构建 ROWSPEC 字符串"""
        parts = []
        for field in fields:
            ir_type = field.rowspec_type
            parts.append(f"{field.code}:{ir_type}")
        return ",".join(parts)

    def _build_method_body(self, fields: List[FieldInfo],
                           value_results: Optional[List[Optional[ValueResult]]],
                           engine=None, view_code: str = "") -> str:
        """构建 Execute 方法体

        核心流程：
        1. 从value_results推断业务域
        2. 按域加载遍历配置（替代关键词猜测）
        3. 加载域特定的中间变量（替代全局共享，消除跨域污染）
        4. PAADMi外层 + 域遍历内层
        5. 只有医嘱域才需要医嘱循环
        """
        lines = []

        # 创建变量注册表
        from .base_generator import VarRegistry
        registry = VarRegistry()

        # === 1. 从匹配结果推断业务域 ===
        domain_id = self._detect_domain(value_results)

        # === 1.5 根据业务域生成标签名 ===
        tag_name = self._get_tag_name(domain_id, view_code)

        # === 2. 按域加载遍历配置 ===
        # 使用load_traversal_config方法，支持根据view_code选择合适的mode
        traversal_config = self.load_traversal_config(domain_id, view_code)

        # ★ 从遍历模板中提取标签名（优先使用模板定义的标签名）
        if traversal_config and traversal_config.template:
            import re as _re
            _tag_match = _re.search(r'd\s+([A-Za-z]\w+)', traversal_config.template)
            if _tag_match:
                _template_tag = _tag_match.group(1)
                if _template_tag != tag_name:
                    tag_name = _template_tag  # 使用模板中的标签名

        # === 3. 加载域感知的变量库 ===
        intermediates = self.get_domain_intermediates(domain_id)
        var_inference = self.get_domain_var_inference(domain_id)
        needs_orders = (domain_id == "40-order")

        # ★ 加载所有域的中间变量（跨域查找）
        all_domain_intermediates = {}
        all_domain_var_inference = {}
        for d_id in self._DOMAIN_INTERMEDIATES:
            if d_id != domain_id:
                all_domain_intermediates.update(self._DOMAIN_INTERMEDIATES[d_id])
        for d_id in self._DOMAIN_VAR_INFERENCE:
            if d_id != domain_id:
                all_domain_var_inference.update(self._DOMAIN_VAR_INFERENCE[d_id])

        # === 4. 变量名映射 ===
        var_mapping = {
            'tPatDR': 'patDR', 'PatRowID': 'patDR', 'PapmiDR': 'patDR',
            'patRowId': 'patDR', 'papmiDR': 'patDR', 'PatientDR': 'patDR',
            'RowID': 'patDR', 'RowId': 'patDR', 'PAPMI_RowID': 'patDR',  # 患者RowID
            'admRowId': 'adm', 'PaadmRowid': 'adm', 'AdmNo': 'adm',
            'AdmId': 'adm', 'admId': 'adm', 'PAADM_RowID': 'adm',
            'EpisodeID': 'adm',
            'OrdRowID': 'ordId', 'ordId': 'ordId', 'OEORD_RowID': 'ordId',
            'ordItm': 'ordItm', 'OrdItemID': 'ordItm',
            'arcimDR': 'arcimDr', 'arcimId': 'arcimDr', 'ArcimDR': 'arcimDr',  # 医嘱项DR别名
            'arcimSub': 'arcSub', 'arcimVer': 'arcVer',  # 医嘱项子表/版本别名
            'locDr': 'ctlocDr', 'locDR': 'ctlocDr', 'deptDr': 'ctlocDr', 'CTLOC_RowID': 'ctlocDr',
            'userDr': 'patDR', 'SSUSR_RowID': 'patDR',  # 用户DR映射到患者DR
            'CTPCP_DR': 'ctpcpDr', 'doctorDr': 'ctpcpDr', 'careProvDr': 'ctpcpDr',
            'hospDr': 'hospDr', 'HospRowID': 'hospDr',
            'hospId': 'hospDr', 'HospDR': 'hospDr', 'hospDR': 'hospDr',
            'wardDr': 'wardDr', 'WardDr': 'wardDr',
            'patDR': 'patDR',
            'mradm': 'mradm', 'MRADM': 'mradm',
            'inci': 'inci', 'INCI_RowID': 'inci',  # 库存项DR
        }

        # === 5. 遍历数据源 ===
        # 根据遍历配置决定遍历方式
        # 如果遍历配置的模板中不包含 adm/admRowId，则不需要 PAADMi 外层循环
        # 判断是否是字典类接口（不需要日期范围和就诊遍历）
        is_dict_domain = domain_id in ['d1-drug-dict', 'd0-pharmacy', '00-dictionary']

        needs_paadm = True  # 默认需要 PAADMi 遍历
        if traversal_config and traversal_config.template:
            needs_paadm = traversal_config.needs_paadm

        # 字典类接口不需要 PAADMi 遍历
        if is_dict_domain:
            needs_paadm = False

        # ★ 动态判断是否需要PAADMi遍历
        # 如果traversal配置的模板中已经包含了完整的遍历逻辑（包括日期循环），则不需要PAADMi
        if traversal_config and traversal_config.template:
            template = traversal_config.template
            # 如果模板中已经包含了日期循环（pDateFrom/pDateTo），则不需要PAADMi
            if 'pDateFrom' in template or 'pDateTo' in template:
                needs_paadm = False
            # 如果模板中已经包含了PAADMi遍历，也不需要再添加一层
            elif 'PAADM_AdmDate' in template or 'PAADMi' in template:
                needs_paadm = False

        # 调试输出
        print(f"[DEBUG] domain={domain_id}, needs_paadm={needs_paadm}, is_dict={is_dict_domain}, has_template={bool(traversal_config and traversal_config.template)}")

        if needs_paadm:
            # 需要 PAADMi 遍历（按就诊遍历）
            # 根据业务域动态生成遍历代码
            lines.append('    // 按日期范围遍历')
            lines.append('    for date=pDateFrom:1:pDateTo {')
            lines.append('        s adm=""')
            lines.append('        f {')
            lines.append('            s adm=$o(^PAADMi("PAADM_AdmDate",date,adm))')
            lines.append('            Continue:adm=""')
            lines.append('            s admInfo=$g(^PAADM(adm))')
            lines.append('            Continue:admInfo=""')
            lines.append('            // 过滤')
            lines.append('            s status=$p(admInfo,"^",20)')
            lines.append('            Continue:status="C"')
            lines.append('            i pHospitalId\'="" {')
            lines.append('                s hospDr=$p($g(^CTLOC($p(admInfo,"^",4))),"^",22)')
            lines.append('                Continue:hospDr\'=pHospitalId')
            lines.append('            }')
            lines.append('            // 患者基本信息')
            lines.append('            s patDR=$p(admInfo,"^",1)')
            lines.append('            s ctlocDr=$p(admInfo,"^",4)')
            lines.append('            s ctpcpDr=$p(admInfo,"^",9)')
            lines.append('            s admDate=$p(admInfo,"^",6)')
            lines.append('            s admTime=$p(admInfo,"^",7)')
            lines.append('            s disDate=$p(admInfo,"^",17)')
            lines.append('            s disTime=$p(admInfo,"^",18)')
            lines.append('            s mradm=$p(admInfo,"^",61)')
            # 根据业务域动态添加遍历代码
            if domain_id == '60-surgery':
                # 手术域：从手术表的日期索引遍历
                lines.append('            ; 手术域：从手术表的日期索引遍历')
                lines.append('            s opsId=""')
                lines.append('            f {')
                lines.append('                s opsId=$o(^CIS.AN.OperScheduleI("OperDate",date,opsId))')
                lines.append('                Quit:opsId=""')
                lines.append('                s data=$g(^CIS.AN.OperScheduleD(opsId))')
                lines.append('                Continue:data=""')
                lines.append('                s admRowId=$lg(data,2)')
                lines.append('                i admRowId\'="" {')
                lines.append('                    s admData=$g(^PAADM(admRowId))')
                lines.append('                    i admData\'="" {')
                lines.append('                        s patDR=$p(admData,"^",1)')
                lines.append('                    }')
                lines.append('                }')
                lines.append('                d GetOrdDetail')
                lines.append('            }')
            elif domain_id == '30-diagnosis':
                # 诊断域：从诊断表的就诊ID索引遍历
                lines.append('            ; 诊断域：从诊断表的就诊ID索引遍历')
                lines.append('            s sub=""')
                lines.append('            f {')
                lines.append('                s sub=$o(^MR(mradm,"DIA",sub))')
                lines.append('                Quit:sub=""')
                lines.append('                s diaData=$g(^MR(mradm,"DIA",sub))')
                lines.append('                Continue:diaData=""')
                lines.append('                s icdDr=$p(diaData,"^",1)')
                lines.append('                q:icdDr=""')
                lines.append('                d GetOrdDetail')
                lines.append('            }')
            else:
                # 其他域：从医嘱表遍历
                lines.append('            // 医嘱信息')
                lines.append('            s ordId=$o(^OEORD(0,"Adm",adm,0))')
                lines.append('            i ordId\'="" {')
                lines.append('                s ordItm=$o(^OEORD(ordId,"I",0))')
                lines.append('                i ordItm\'="" {')
                lines.append('                    s arcimDr=$p($g(^OEORD(ordId,"I",ordItm,2)),"^",1)')
                lines.append('                    s ordstr1=$g(^OEORD(ordId,"I",ordItm,1))')
                lines.append('                    s ordstr2=$g(^OEORD(ordId,"I",ordItm,2))')
                lines.append('                    s ordstr3=$g(^OEORD(ordId,"I",ordItm,3))')
                lines.append('                    s arcSub=$p(arcimDr,"||",1)')
                lines.append('                    s arcVer=$p(arcimDr,"||",2)')
                lines.append('                    s inci=$p($g(^ARCIM(arcSub,arcVer,8)),"^",10)')
                lines.append('                }')
                lines.append('            }')
        else:
            # 不需要 PAADMi 遍历（如字典类接口全量遍历）
            lines.append('    // 全量遍历')

        # 域遍历模板
        if traversal_config and traversal_config.template:
            template = traversal_config.template.replace('admRowId', 'adm')
            # ★ 替换模板中的日期变量为方法参数
            template = template.replace('pStartDate', 'pDateFrom')
            template = template.replace('pEndDate', 'pDateTo')

            # ★ 添加参数校验和查询模式判断
            if not is_dict_domain:
                lines.append('    // ========== 参数校验和查询模式判断 ==========')
                lines.append('    if (pAdmRowId="")&&(pDateFrom="") {')
                lines.append('        q $$$OK  ; 无有效查询条件')
                lines.append('    }')
                lines.append('    // 日期格式转换')
                lines.append('    if pDateFrom\'="" {')
                lines.append('        if pDateFrom["-" { s pDateFrom=$zdh(pDateFrom,3) }')
                lines.append('        if pDateTo["-" { s pDateTo=$zdh(pDateTo,3) }')
                lines.append('    }')
                lines.append('')
                # 按就诊ID查询模式
                lines.append('    // ========== 根据入参选择查询模式 ==========')
                lines.append('    if (pAdmRowId\'="") {')
                lines.append('        // 模式1：按就诊ID查询')
                lines.append('        s adm=pAdmRowId')

                # 根据业务域选择正确的遍历逻辑
                if domain_id in ['50-lab-exam', '55-exam-report']:
                    # ENS 平台表的数据（检验报告、检查报告）
                    # 使用 ENS 平台表的就诊ID索引
                    if domain_id == '50-lab-exam':
                        # 检验报告：使用 LISRRVisitNumberIndex 索引
                        lines.append('        ; 按就诊ID查询检验报告')
                        lines.append('        s rowId=""')
                        lines.append('        f  s rowId=$o(^Busi.ENS.EnsLISReportResultI("LISRRVisitNumberIndex",adm,rowId)) q:rowId=""  d')
                        lines.append('        .s data=$g(^Busi.ENS.EnsLISReportResultD(rowId))')
                        lines.append('        .q:data=""')
                        lines.append('        .s patDR=$lg(data,3)')
                        lines.append(f'        .d {tag_name}')
                    elif domain_id == '55-exam-report':
                        # 检查报告：使用 RISRVisitNumberIndex 索引
                        lines.append('        ; 按就诊ID查询检查报告')
                        lines.append('        s rowId=""')
                        lines.append('        f  s rowId=$o(^Busi.ENS.EnsRISReportResultI("RISRVisitNumberIndex",adm,rowId)) q:rowId=""  d')
                        lines.append('        .s data=$g(^Busi.ENS.EnsRISReportResultD(rowId))')
                        lines.append('        .q:data=""')
                        lines.append('        .s patDR=$lg(data,5)')
                        lines.append(f'        .d {tag_name}')
                elif domain_id in ['a0-fee-settlement', 'a1-outpatient-invoice']:
                    # ★ 费用结算域：按就诊ID遍历账单表
                    lines.append('        ; 按就诊ID遍历账单表')
                    lines.append('        s admInfo=$g(^PAADM(adm))')
                    lines.append('        if admInfo\'="" {')
                    lines.append('            s patDR=$p(admInfo,"^",1)')
                    lines.append('            s pbId=""')
                    lines.append('            f  s pbId=$o(^DHCPB(0,"ADM",adm,pbId)) q:pbId=""  d')
                    lines.append('            .s pbData=$g(^DHCPB(pbId))')
                    lines.append('            .q:pbData=""')
                    lines.append('            .s pboChild=""')
                    lines.append('            .f  s pboChild=$o(^DHCPB(pbId,"O",pboChild)) q:pboChild=""  d')
                    lines.append('            ..s pboData=$g(^DHCPB(pbId,"O",pboChild))')
                    lines.append('            ..s pbdChild=""')
                    lines.append('            ..f  s pbdChild=$o(^DHCPB(pbId,"O",pboChild,"D",pbdChild)) q:pbdChild=""  d')
                    lines.append('            ...s pbdData=$g(^DHCPB(pbId,"O",pboChild,"D",pbdChild))')
                    lines.append(f'            ...d {tag_name}')
                    lines.append('        }')
                else:
                    # 医嘱域的数据
                    lines.append('        s admInfo=$g(^PAADM(adm))')
                    lines.append('        if admInfo\'="" {')
                    lines.append('            s patDR=$p(admInfo,"^",1)')
                    lines.append('            s ctlocDr=$p(admInfo,"^",4)')
                    lines.append('            s ctpcpDr=$p(admInfo,"^",9)')
                    lines.append('            s admDate=$p(admInfo,"^",6)')
                    lines.append('            s admTime=$p(admInfo,"^",7)')
                    lines.append('            s disDate=$p(admInfo,"^",17)')
                    lines.append('            s disTime=$p(admInfo,"^",18)')
                    lines.append('            s mradm=$p(admInfo,"^",61)')
                    lines.append('            ; 直接遍历该就诊的医嘱')
                    lines.append('            s ordId=""')
                    lines.append('            f  s ordId=$o(^OEORD(0,"Adm",adm,ordId)) q:ordId=""  d')
                    lines.append('            .s ordItm=""')
                    lines.append('            .f  s ordItm=$o(^OEORD(ordId,"I",ordItm)) q:ordItm=""  d')
                    lines.append('            ..s ordstr1=$g(^OEORD(ordId,"I",ordItm,1))')
                    lines.append('            ..q:ordstr1=""')
                    lines.append('            ..s ordstr2=$g(^OEORD(ordId,"I",ordItm,2))')
                    lines.append('            ..s arcimDr=$p(ordstr2,"^",1)')
                    lines.append(f'            ..d {tag_name}')
                    lines.append('        }')

                lines.append('    } else {')
                lines.append('        // 模式2：按日期范围遍历')

            if traversal_config.pre_variables:
                outer_defined = {'adm', 'patDR', 'status'}
                pv_lines = []
                for pv in traversal_config.pre_variables:
                    pn = pv.get('name', '')
                    pe = pv.get('expression', '')
                    pd = pv.get('description', '')
                    # ★ 替换表达式中的 admRowId 为 adm
                    if pe:
                        pe = pe.replace('admRowId', 'adm')
                    if pn and pe and pn not in outer_defined:
                        pv_lines.append(f'            s {pn}={pe}  ; {pd}')
                if pv_lines:
                    lines.append('            ; 前置变量')
                    lines.extend(pv_lines)

            lines.append('            ; 域数据源')
            template_lines, for_depth = self.convert_template(template, "            ")
            lines.extend(template_lines)

            # 检查模板中是否已经包含了任何 d xxx 标签调用
            # 如果已经包含了，就不再添加（模板中可能是其他标签名，如 d GetOrdDetail）
            import re as _re
            has_tag_call = any(_re.search(r'\bd\s+[A-Z]\w+', line) for line in template_lines)
            if not has_tag_call:
                # 在最内层循环中调用标签
                lines.append(f'{"            " + "    " * for_depth}d {tag_name}')

            # 关闭模板的 For 循环（从内到外）
            for i in range(for_depth):
                indent = "            " + "    " * (for_depth - i - 1)
                lines.append(f'{indent}}}')

        # 关闭 PAADMi 循环（仅在需要时）
        if needs_paadm:
            # ★ 如果没有遍历模板，需要在PAADMi循环内添加标签调用
            if not (traversal_config and traversal_config.template):
                lines.append(f'            d {tag_name}')
            lines.append('        }')
            lines.append('    }')

        # ★ 关闭日期范围查询模式的括号
        if not is_dict_domain and traversal_config and traversal_config.template:
            lines.append('    }  ; end if pAdmRowId')
            lines.append('')

        # 确定字段取值代码的缩进级别
        if needs_paadm:
            code_level = '            '  # 12空格 - PAADMi adm循环内
        else:
            # 字典类接口：字段取值代码在遍历循环内部
            # 根据遍历模板的深度确定缩进
            if traversal_config and traversal_config.template:
                # 遍历模板有循环，字段取值代码在循环内部
                code_level = '    '  # 4空格 - 遍历循环内
            else:
                code_level = '    '  # 4空格

        # === 7. 提取模板中已定义的变量（避免中间变量重复输出） ===
        template_defined = set()
        if traversal_config and traversal_config.template:
            for line in traversal_config.template.strip().split('\n'):
                # ★ 处理点号缩进格式（.s var=...）和标准格式（Set/s var=...）
                stripped = line.lstrip('.')
                m = re.search(r'\b(?:Set|s)\s+(\w+)\s*=', stripped)
                if m:
                    template_defined.add(m.group(1))

        # === 8. 收集字段表达式 ===
        all_expressions = []
        if value_results:
            for result in value_results:
                if result and result.value_expression:
                    all_expressions.append(result.value_expression)

        # === 9. 未定义变量检测（域特定推断） ===
        _NON_VARIABLES = {
            'PAPER', 'PAADM', 'PAADMi', 'PAWARD', 'OEORD', 'OEORDi', 'OECPR',
            'CT', 'CTLOC', 'CTPCP', 'SSU', 'SSUSR', 'ARCIM', 'ARC', 'INCI',
            'MR', 'MRC', 'PAC', 'OEC', 'ORC', 'NUR', 'TCLAB', 'TEPI', 'DHC',
            'DHCTarC', 'DHCBill', 'DHCBTarItem', 'DHCTARI', 'DHCPB',
            'ALL', 'PAT', 'PER', 'BED', 'DIA', 'ADM', 'SEX', 'HOSP',
            'DISCON', 'ADMREA', 'ANMET', 'OSTAT', 'UOM', 'DT', 'DXT',
            'ID', 'CODE', 'NAME', 'DESC', 'TEXT', 'DATA', 'ROW', 'VAL',
            'String', 'Status', 'Get', 'Set', 'GetDataByGlossaryNew',
            'getFirstItemValue', 'GetStdName', 'UtilMethod',
            'GetOrderPrice', 'GetPublicDataForHosp',
            'EMRservice', 'BL', 'BLScatterData', 'OrganizCode',
            'rowId', 'RowId', 'RowID',
            'adm', 'patDR', 'date',
            # 外部类/方法名（不应被当作变量）
            'web', 'uDHCJFPRICE', 'cLASS', 'CLASS', 'class',
            'DrugInfoCommon', 'Common', 'dHCST',
            'replace', 'tr', 'length', 'find', 'extract',
            'OperScheduleD', 'OperationListD', 'AnaesthesiaD',
            'CIS', 'AN', 'obj', 'scatterId',
            'Price', 'Qty', 'GetSpecCode', 'GetSpecName', 'GetSpec',
            'GetAt', 'bwcode', '_bwcode',
            'VerifyDate', 'GetOrderPrice', 'arcimId',
            'data', 'prtData',  # 通用数据变量（模板中已定义）
            'tTime', 'tDate', 'tDateTime',  # 时间变量
            'locDR', 'arcimDR', 'arcimSub', 'arcimVer',  # 已映射的变量别名
            'g', 'p', 'zt', 'zd', 'zdh', 'lg', 'lb', 'o', 'i', 'f', 'd',
            'q', 's', 'qHandle', 'repid', 'ind', 'Data', 'Row', 'AtEnd', 'case',
            'Class', 'ClassMethod', 'Method',
            'systolicBloodPressure', 'diastolicBloodPressure', 'temperature',
            'abdominalCircumference',
            # Global 名称（作为下标引用，如 ^PHCD(...) ^PHCF(...) ^PHCIN(...)）
            'PHCD', 'PHCF', 'PHCIN', 'PHCFR', 'PHCDU', 'ARCIC', 'OECOR',
            'ORCAT', 'IC', 'DF', 'DR', 'WardDr', 'WardDR',
            'Nur', 'NIS', 'Base', 'Patient', 'Service',
        }

        undefined_vars = {}     # {var: [引用该变量的字段中文名]}
        intermediate_vars = {}

        for i, expr in enumerate(all_expressions):
            # 找到当前表达式对应的字段中文名
            field_cn = ""
            if value_results and i < len(value_results) and value_results[i]:
                field_cn = fields[i].name if i < len(fields) else ""

            expr_clean = re.sub(r'"[^"]*"', '""', expr)
            for var in re.findall(r'\b([A-Za-z_][A-Za-z0-9_]*)\b', expr_clean):
                if len(var) <= 1 or var in _NON_VARIABLES:
                    continue
                if var in var_mapping or var in intermediates:
                    continue
                if var in intermediate_vars:
                    continue
                if var in var_inference:
                    ve, vd = var_inference[var]
                    if var not in intermediate_vars and var not in template_defined:
                        intermediate_vars[var] = (ve, vd)
                # ★ 从所有域的中间变量库中查找（跨域查找）
                elif var in all_domain_intermediates:
                    if var not in intermediate_vars and var not in template_defined:
                        intermediate_vars[var] = all_domain_intermediates[var]
                elif var in all_domain_var_inference:
                    ve, vd = all_domain_var_inference[var]
                    if var not in intermediate_vars and var not in template_defined:
                        intermediate_vars[var] = (ve, vd)
                else:
                    if var not in undefined_vars:
                        undefined_vars[var] = []
                    if field_cn and field_cn not in undefined_vars[var]:
                        undefined_vars[var].append(field_cn)

        # 递归扫描：新加入的中间变量可能引用其他未定义变量
        changed = True
        scan_pass = 0
        while changed and scan_pass < 5:
            changed = False
            scan_pass += 1
            current_keys = list(intermediate_vars.keys())
            for var_name in current_keys:
                ve, vd = intermediate_vars[var_name]
                ve_clean = re.sub(r'"[^"]*"', '""', ve)
                for dep_var in re.findall(r'\b([A-Za-z_][A-Za-z0-9_]*)\b', ve_clean):
                    if dep_var in _NON_VARIABLES or dep_var in intermediate_vars or dep_var in var_mapping:
                        continue
                    # 如果在 intermediates（全局中间变量）或 var_inference 中有定义，自动加入
                    if dep_var in intermediates and dep_var not in intermediate_vars:
                        intermediate_vars[dep_var] = intermediates[dep_var]
                        changed = True
                        continue
                    if dep_var in var_inference:
                        dv, dd = var_inference[dep_var]
                        if dep_var not in intermediate_vars:
                            intermediate_vars[dep_var] = (dv, dd)
                            changed = True
                    # ★ 从所有域的中间变量库中查找（跨域查找）
                    elif dep_var in all_domain_intermediates and dep_var not in intermediate_vars:
                        intermediate_vars[dep_var] = all_domain_intermediates[dep_var]
                        changed = True
                    elif dep_var in all_domain_var_inference and dep_var not in intermediate_vars:
                        dv, dd = all_domain_var_inference[dep_var]
                        intermediate_vars[dep_var] = (dv, dd)
                        changed = True
                    elif dep_var not in undefined_vars and len(dep_var) > 1:
                        undefined_vars[dep_var] = []
                        if var_name and var_name not in undefined_vars[dep_var]:
                            undefined_vars[dep_var].append(var_name)

        # ★ 修复：template_defined 中被其他中间变量依赖的变量需要保留
        # 问题：arcSub/arcVer 从 arcimDr 递归推导加入 template_defined，
        #       但 phcdfDr 依赖它们，template_defined 过滤会移除它们，
        #       导致 phcdfDr 的表达式引用未定义的变量。
        # 解决：如果 intermediate_vars 中有变量依赖了 template_defined 中的变量，
        #       则将这些被依赖的变量从 template_defined 中移除，让它们保留在 intermediate_vars 中。
        if template_defined and intermediate_vars:
            deps_to_restore = set()
            for var_name, (ve, vd) in intermediate_vars.items():
                ve_clean = re.sub(r'"[^"]*"', '""', ve)
                for dep_var in re.findall(r'\b([A-Za-z_][A-Za-z0-9_]*)\b', ve_clean):
                    if dep_var in template_defined:
                        deps_to_restore.add(dep_var)
            for dep in deps_to_restore:
                template_defined.discard(dep)

        # 遍历模板已定义的变量去重
        if traversal_config:
            tv = traversal_config.data_variable
            if tv:
                undefined_vars.pop(tv, None)
                intermediate_vars.pop(tv, None)

        # === 确定代码缩进级别 ===
        # 花括号写法：用空格缩进，每个嵌套层级=4空格
        # 计算循环体内缩进
        # PAADMi: 2层 For (4sp, 8sp)，域模板紧跟在第2层内(12sp基础缩进)
        if needs_orders and traversal_config and traversal_config.template:
            # template在 PAADMi 第2层内(12sp) + for_depth层
            code_level = "            " + "    " * for_depth
        elif traversal_config and traversal_config.template:
            code_level = "            " + "    " * for_depth  # 动态计算
        else:
            code_level = '            '          # 12空格 - PAADMi adm循环内

        # 过滤来自其他域的变量（L1跨域匹配污染，不应出现在当前接口）
        _foreign_vars = set()
        if domain_id:
            all_intermediates = self.get_domain_intermediates(None)  # 获取所有域的
            for d_im_key, d_im_val in self._DOMAIN_INTERMEDIATES.items():
                if d_im_key != domain_id:
                    _foreign_vars.update(d_im_val.keys())

        # 过滤 undefined_vars 中的外部域变量
        if undefined_vars:
            local_undefined = {k: v for k, v in undefined_vars.items() if k not in _foreign_vars}
            undefined_vars = local_undefined

        # === 10. 扫描表达式引用的中间变量 ===
        reverse_im = {}
        for orig_var, ctx_var in var_mapping.items():
            if ctx_var in intermediates:
                reverse_im[orig_var] = intermediates[ctx_var]

        for expr in all_expressions:
            for var_name, (ve, vd) in intermediates.items():
                if re.search(r'\b' + re.escape(var_name) + r'\b', expr):
                    if var_name not in intermediate_vars and var_name not in template_defined:
                        intermediate_vars[var_name] = (ve, vd)
            for orig_var, (ve, vd) in reverse_im.items():
                if re.search(r'\b' + re.escape(orig_var) + r'\b', expr):
                    cv = var_mapping.get(orig_var, orig_var)
                    if cv not in intermediate_vars and cv not in template_defined:
                        intermediate_vars[cv] = (ve, vd)

        # ★ 费用结算域特殊处理：当 ordItm 被引用时，自动添加其派生变量
        # ordItm 从 pboData 获取，但 ordId/ordSub/ordstr1/ordstr2/ordstr3 需要从 ordItm 派生
        if 'ordItm' in intermediate_vars and domain_id in ('a0-fee-settlement', 'a1-outpatient-invoice'):
            order_derived_vars = {
                'ordId': ('+ordItm', '医嘱主表ID(从ordItm派生)'),
                'ordSub': ('$p(ordItm,"||",2)', '医嘱子表ID(从ordItm派生)'),
                'ordstr1': ('$g(^OEORD(ordId,"I",ordSub,1))', '医嘱主节点'),
                'ordstr2': ('$g(^OEORD(ordId,"I",ordSub,2))', '医嘱项目节点'),
                'ordstr3': ('$g(^OEORD(ordId,"I",ordSub,3))', '医嘱收费科室节点'),
                'arcimDr': ('$p(ordstr2,"^",1)', '医嘱项DR(→ARC_ItmMast,从ordstr2^1获取)'),
                'arcSub': ('$p(arcimDr,"||",1)', '医嘱项子表ID'),
                'arcVer': ('$p(arcimDr,"||",2)', '医嘱项版本'),
                'ordDocDr': ('$p(ordstr1,"^",11)', '开医嘱医生DR(→CT_CareProv)'),
                'AppDeptRowID': ('$p(ordstr3,"^",6)', '接收科室DR(→CT_Loc)'),
                'OrdSubCatRowID': ('$p($g(^ARCIM(arcSub,arcVer,1)),"^",10)', '医嘱子类DR'),
                'OrdCatRowID': ('$p($g(^ARC("IC",OrdSubCatRowID)),"^",8)', '医嘱大类DR'),
            }
            for var_name, (expr, desc) in order_derived_vars.items():
                if var_name not in intermediate_vars:
                    intermediate_vars[var_name] = (expr, desc)

        # 按依赖关系排序中间变量，并判断作用域
        # 通过拓扑排序自动处理依赖链：OrdCatRowID→OrdSubCatRowID→arcSub/arcVer→arcimDr→ordstr2
        sorted_vars = self._sort_vars_by_dependency(intermediate_vars) if intermediate_vars else []
        ord_im = {}
        adm_im = {}
        ops_im = {}
        # 医嘱域变量名集合（用于按变量名判断级别）
        ord_var_names = {'ordId', 'ordItm', 'ordSub', 'ordstr1', 'ordstr2', 'ordstr3',
                         'arcimDr', 'arcSub', 'arcVer', 'ordDocDr', 'AppDeptRowID',
                         'OrdSubCatRowID', 'OrdCatRowID', 'OrdTypeRowID'}
        for var_name in sorted_vars:
            if var_name in intermediate_vars:
                expr, desc = intermediate_vars[var_name]
                # 优先按变量名判断级别
                if var_name in ord_var_names:
                    ord_im[var_name] = (expr, desc)
                else:
                    level = self._get_expr_level(expr)
                    if level == 'ord':
                        ord_im[var_name] = (expr, desc)
                    elif level == 'ops':
                        ops_im[var_name] = (expr, desc)
                    else:
                        adm_im[var_name] = (expr, desc)

        # === 10. 生成公共变量 ===
        # dateBatch模式或不需要PAADMi时，跳过PAADM依赖的变量
        use_date_batch = traversal_config.has_date_batch if traversal_config else False
        # ★ 公共变量不添加到 lines 中，而是添加到 tag_block 中
        # 这样公共变量会在 GetOrdDetail 标签内部，而不是在循环外部

        # === 11. 字段取值（支持按中间变量分组+空判断保护） ===
        # 循环变量、入参、已在循环条件中判断过的变量不需要空判断
        # 这些变量如果为空，循环根本不会执行到这一步
        skip_vars = {
            "admRowId", "adm", "rowId", "date",  # 循环变量
            "inci", "inciData", "opsId", "data",  # 药品/手术域循环变量
            "pbId", "pboChild", "pbdChild", "pbData", "pboData", "pbdData",  # 费用结算子表循环变量
            "prtRowId", "paySub", "payData",  # 发票支付子表循环变量
        }
        # ★ 将模板定义的变量也加入 skip_vars（防止被误判断为未定义）
        skip_vars.update(template_defined)

        def _find_primary_iv(expr, iv_set):
            """找出表达式引用的主中间变量（最内层依赖）"""
            if not expr:
                return None
            # 按长度降序匹配，避免部分匹配（排除已判断过的变量）
            for iv in sorted(iv_set, key=len, reverse=True):
                if iv in skip_vars:
                    continue  # 跳过已判断过的变量
                if re.search(r'\b' + re.escape(iv) + r'\b', expr):
                    return iv
            return None

        def _gen_fields(indent, data_var='data'):
            """生成字段取值代码

            Args:
                indent: 缩进字符串
                data_var: 数据变量名，默认为'data'，子表遍历时为'itemData'
            """
            flines = []
            # 收集所有字段的表达式和中间变量依赖
            field_exprs = []
            todo_vars = []  # 收集需要初始化为空字符串的变量
            # ★ 循环变量和模板定义的变量不应该被初始化为空字符串
            loop_vars = self.get_domain_loop_vars(domain_id)
            # ★ 将模板定义的变量也加入循环变量（防止被误初始化为空）
            loop_vars.update(template_defined)
            for i, field in enumerate(fields):
                cn = field.name
                vr = value_results[i] if value_results and i < len(value_results) else None
                expr_raw = vr.value_expression if vr else ""
                expr = self._replace_vars(expr_raw, var_mapping) if expr_raw else ""
                expr = self._quote_external_properties(expr)
                expr = self._fix_operator_spaces(expr)
                iv = _find_primary_iv(expr, set(ord_im.keys()))
                field_exprs.append((field, expr, vr, cn, iv))

                # 判断是否需要初始化为空字符串（排除循环变量）
                if field.var_name not in loop_vars:
                    if not expr or not self._is_valid_os_expr(expr) or (vr and hasattr(vr, 'resolution_status') and vr.resolution_status in ("identified", "unmatched")):
                        todo_vars.append(field.var_name)

            # 添加 undefined_vars 中的变量（这些变量被字段引用但未定义取值）
            # ★ 排除循环变量和模板定义的变量（它们在循环体内已有值，不能被覆盖为空）
            if undefined_vars:
                for var in sorted(undefined_vars.keys()):
                    if var in loop_vars:
                        continue  # 跳过循环变量和模板变量
                    v = self._to_camel_case(var)
                    if v not in todo_vars and v not in loop_vars:
                        todo_vars.append(v)

            # 批量初始化变量
            # 规则：2个变量用 s var1="",var2=""；3-5个用 s (var1,var2,...)=""；超过5个分多行
            if todo_vars:
                if len(todo_vars) == 2:
                    # 2个变量：s var1="",var2=""
                    flines.append(f'{indent}s {todo_vars[0]}="",{todo_vars[1]}=""  ; 初始化变量')
                elif len(todo_vars) <= 5:
                    # 3-5个变量：s (var1,var2,...)=""
                    vars_str = ",".join(todo_vars)
                    flines.append(f'{indent}s ({vars_str})=""  ; 初始化变量')
                else:
                    # 超过5个变量：分多行，每行最多5个
                    chunk_size = 5
                    for j in range(0, len(todo_vars), chunk_size):
                        chunk = todo_vars[j:j+chunk_size]
                        if len(chunk) == 2:
                            flines.append(f'{indent}s {chunk[0]}="",{chunk[1]}=""  ; 初始化变量')
                        else:
                            vars_str = ",".join(chunk)
                            flines.append(f'{indent}s ({vars_str})=""  ; 初始化变量')

            # 按主中间变量分组
            from collections import OrderedDict
            groups = OrderedDict()  # iv -> [(field, expr, vr, cn)]
            for item in field_exprs:
                field, expr, vr, cn, iv = item
                groups.setdefault(iv, []).append(item)

            # 逐组输出
            for iv, items in groups.items():
                if iv and iv in ord_im and iv not in skip_vars:
                    # 有中间变量依赖，加空判断（排除已判断过的变量）
                    flines.append(f'{indent}if ({iv}\'="") {{')
                    for item in items:
                        field, expr, vr, cn, _ = item
                        flines.extend(_gen_one_field(f'{indent}    ', field, expr, vr, cn, is_todo=field.var_name in todo_vars))
                    flines.append(f'{indent}}}')
                else:
                    # 无中间变量依赖，直接输出
                    for item in items:
                        field, expr, vr, cn, _ = item
                        flines.extend(_gen_one_field(indent, field, expr, vr, cn, is_todo=field.var_name in todo_vars, loop_vars=loop_vars, template_defined=template_defined, data_var=data_var))
            return flines

        def _gen_one_field(indent, field, expr, vr, cn, is_todo=False, loop_vars=None, template_defined=None, data_var='data'):
            """生成单个字段的取值代码

            Args:
                indent: 缩进字符串
                field: 字段信息
                expr: 取值表达式
                vr: 取值结果
                cn: 字段中文名
                is_todo: 是否是TODO变量
                loop_vars: 循环变量集合
                template_defined: 模板定义的变量集合
                data_var: 数据变量名，默认为'data'，子表遍历时为'itemData'
            """
            flines = []
            loop_vars = loop_vars or set()
            template_defined = template_defined or set()

            # ★ 配置参数字段：使用..#ParameterName引用
            if vr and vr.field_type == 'parameter':
                param_name = field.var_name
                # 转换为Parameter命名规范（首字母大写）
                param_name_upper = param_name[0].upper() + param_name[1:] if param_name else ''
                flines.append(f'{indent}Set {field.var_name}=..#{param_name_upper}  ; {cn}（配置参数）')
                return flines

            # ★ 检查表达式中的变量是否在当前接口中有定义
            # 如果变量不在 template_defined 中，说明未定义
            # data 变量是动态的，需要在当前域的模板中定义
            if expr and f'$lg({data_var},' in expr:
                # data 变量需要在模板中定义，否则标记为 TODO
                if data_var not in template_defined:
                    flines.append(f'{indent}Set {field.var_name}=""  ; {cn}（TODO: {data_var}变量未定义，需补充数据源）')
                    return flines
            # 检查其他可能来自其他域的变量
            if expr and re.search(r'\$lg\((data|anaData|opListData|itemData),', expr):
                var_match = re.search(r'\$lg\((\w+),', expr)
                if var_match:
                    var_name = var_match.group(1)
                    if var_name not in template_defined:
                        flines.append(f'{indent}Set {field.var_name}=""  ; {cn}（TODO: {var_name}变量未定义，需补充数据源）')
                        return flines

            if expr:
                # ★ 子表遍历时，将表达式中的 data 变量替换为 data_var
                if data_var != 'data':
                    expr = expr.replace('$lg(data,', f'$lg({data_var},')
                    expr = expr.replace('data=', f'{data_var}=')
                    expr = expr.replace('(data)', f'({data_var})')
                expr = self._normalize_global_subscripts(expr)
                expr = self._normalize_global_names(expr)

                # ★ 时间/日期字段自动转换为使用 FormatDT 方法
                # 检测模式：$zd(...,3)_" "_$zt(...) 或 $zd(...,3) 或 $zt(...)
                # 转换为：..FormatDT(日期, 时间)
                # 使用括号平衡匹配提取参数，避免嵌套括号截断问题
                def _extract_func_args(s, func_name):
                    """提取函数参数（支持嵌套括号）

                    Args:
                        s: 表达式字符串
                        func_name: 函数名（如 "$zd" 或 "$zt"）

                    Returns:
                        (参数列表, 匹配结束位置) 或 (None, -1)
                    """
                    pattern = func_name + '('
                    start = s.find(pattern)
                    if start == -1:
                        return None, -1
                    # 从函数名后的 '(' 开始计数括号
                    i = start + len(pattern)
                    depth = 1
                    args_start = i
                    while i < len(s) and depth > 0:
                        if s[i] == '(':
                            depth += 1
                        elif s[i] == ')':
                            depth -= 1
                        i += 1
                    if depth != 0:
                        return None, -1
                    # 提取参数字符串（不含外层括号）
                    args_str = s[args_start:i-1]
                    # 按逗号分割参数
                    # 关键：需要跟踪括号深度，只有在深度为0时才按逗号分割
                    args = []
                    current = []
                    in_quote = False
                    paren_depth = 0  # 括号深度
                    for ch in args_str:
                        if ch == '"':
                            in_quote = not in_quote
                            current.append(ch)
                        elif ch == '(' and not in_quote:
                            paren_depth += 1
                            current.append(ch)
                        elif ch == ')' and not in_quote:
                            paren_depth -= 1
                            current.append(ch)
                        elif ch == ',' and not in_quote and paren_depth == 0:
                            # 只有在引号外且括号深度为0时才分割
                            args.append(''.join(current).strip())
                            current = []
                        else:
                            current.append(ch)
                    if current:
                        args.append(''.join(current).strip())
                    return args, i

                # 尝试提取 $zd 和 $zt 函数
                zd_args, zd_end = _extract_func_args(expr, '$zd')
                zt_args, zt_end = _extract_func_args(expr, '$zt')

                if '_" "_' in expr and zd_args and zt_args:
                    # 日期+时间组合模式
                    date_expr = zd_args[0]  # $zd 的第一个参数
                    time_expr = zt_args[0]  # $zt 的第一个参数
                    expr = f'..FormatDT({date_expr},{time_expr})'
                elif zd_args:
                    # 仅日期模式
                    date_expr = zd_args[0]
                    expr = f'..FormatDT({date_expr},"")'
                elif zt_args:
                    # 仅时间模式
                    time_expr = zt_args[0]
                    expr = f'..FormatDT("",{time_expr})'

                # ★ 变量名大小写规范化
                # 将大写的变量名替换为小写（如 AdmTypeCode → admTypeCode）
                # 但保留 Global 名称和函数名的大小写
                def normalize_var_case(match):
                    var = match.group(0)
                    # 跳过 Global 名称
                    if var.startswith('^'):
                        return var
                    # 跳过函数名
                    if var.startswith('$'):
                        return var
                    # 跳过已知的非变量标识符
                    if var in {'PAPER', 'PAADM', 'PAADMi', 'PAWARD', 'OEORD', 'OEORDi', 'OECPR',
                               'CT', 'CTLOC', 'CTPCP', 'SSU', 'SSUSR', 'ARCIM', 'ARC', 'INCI',
                               'MR', 'MRC', 'PAC', 'OEC', 'ORC', 'NUR', 'TCLAB', 'TEPI', 'DHC',
                               'DHCTarC', 'DHCBill', 'DHCBTarItem', 'DHCTARI', 'DHCPB',
                               'ALL', 'PAT', 'PER', 'BED', 'DIA', 'ADM', 'SEX', 'HOSP',
                               'DISCON', 'ADMREA', 'ANMET', 'OSTAT', 'UOM', 'DT', 'DXT',
                               'ID', 'CODE', 'NAME', 'DESC', 'TEXT', 'DATA', 'ROW', 'VAL',
                               'String', 'Status', 'Get', 'Set', 'GetDataByGlossaryNew',
                               'getFirstItemValue', 'GetStdName', 'UtilMethod',
                               'GetOrderPrice', 'GetPublicDataForHosp',
                               'EMRservice', 'BL', 'BLScatterData', 'OrganizCode',
                               'Quit', 'If', 'Else', 'For', 'Do', 'Kill', 'Set',
                               # CT字典节点标识（不应被转为驼峰）
                               'MAR', 'NAT', 'OCC', 'COU', 'PROV', 'CIT', 'RLT',
                               'SS', 'TTL', 'CTRLT', 'HOSP', 'LOC', 'PCP',
                               # 其他字典节点标识
                               'SEX', 'ADMREA', 'DISCON', 'ANMET', 'OSTAT', 'UOM',
                               'DT', 'DXT', 'IC', 'DF', 'DEP', 'ORCAT', 'SPEC',
                               'EXT', 'ASC', 'OC', 'DR', 'SESS', 'EPR', 'CARD',
                               'PHCD', 'PHCF', 'PHCIN', 'PHCFR', 'PHCDU', 'OECOR', 'ARCIC',
                               # User 类 Global 名称（不应被转为驼峰）
                               'DHCRegistrationFeeI', 'DHCRegistrationFeeD',
                               'DHCQueueD', 'DHCQueueI', 'DHCQueue',
                               # User 类名（不应被转为驼峰）
                               'User',
                               # 通用方法名（不应被转为驼峰）
                               'FormatDT', 'FormatDateTime', 'FormatDate', 'FormatTime',
                               # 中间变量名（不应被转为驼峰，保留原始大小写）
                               'OrdTypeRowID', 'OrdSubCatRowID', 'OrdCatRowID', 'OrdRowID',
                               'PatRowID', 'AppDeptRowID', 'HospRowID', 'StatusRowID',
                               'FreqRowID', 'UsageRowID', 'UseDaysRowID', 'DosageUnitRowID'}:
                        return var
                    # 将首字母大写的变量名转为小写
                    if var[0].isupper() and len(var) > 1:
                        return var[0].lower() + var[1:]
                    return var
                expr = re.sub(r'\b[A-Za-z_][A-Za-z0-9_]*\b', normalize_var_case, expr)

                # ★ 检测外部方法调用（##class(...) 或 ..Method()）
                # 外部方法调用是有效的ObjectScript表达式，应直接使用
                has_external_call = bool(re.search(r'##class\(|\.\.[A-Za-z]', expr))

                # 检查表达式是否引用了未定义的变量
                # 如果引用了当前域未定义的变量，跳过
                undefined_in_expr = set()
                expr_clean = re.sub(r'"[^"]*"', '""', expr)
                # ★ 去除 ##class(...) 中的包路径变量（避免误判为未定义）
                expr_clean = re.sub(r'##class\([^)]+\)', '', expr_clean)

                # 当前域中已定义的循环变量（含模板定义的变量）
                loop_vars = self.get_domain_loop_vars(domain_id)
                loop_vars.update(template_defined)

                # ★ 检测表达式中的多行语句（跨域取值场景）
                # 如果表达式包含多行，说明是跨域取值，应该保留原样
                if '\n' in expr:
                    # 多行表达式，直接使用，不做未定义变量检测
                    lines = expr.split('\n')
                    base_indent = indent
                    current_indent = base_indent
                    for k, line in enumerate(lines):
                        line = line.strip()
                        if not line:
                            continue
                        # 处理花括号缩进
                        if line.startswith('}'):
                            # 闭合花括号，减少缩进
                            current_indent = current_indent[4:] if len(current_indent) > len(base_indent) else base_indent
                            flines.append(f'{current_indent}{line}')
                        elif '{' in line:
                            # 开开花括号，当前行使用当前缩进，下一行增加缩进
                            flines.append(f'{current_indent}{line}')
                            current_indent = current_indent + '    '
                        else:
                            # 普通行，使用当前缩进
                            flines.append(f'{current_indent}{line}')
                    # 添加注释
                    if flines:
                        flines[-1] = flines[-1] + f'  ; {cn}'
                    return flines

                # ObjectScript 命令缩写和函数（不应被当作变量）
                _OS_COMMANDS = {'s', 'd', 'k', 'i', 'f', 'q', 'w', 'r', 'n', 'g',
                                'j', 'h', 't', 'x', 'o', 'c', 'u', 'l', 'e',
                                'set', 'do', 'kill', 'if', 'for', 'quit', 'write', 'read',
                                'new', 'goto', 'halt', 'try', 'catch', 'throw',
                                'continue', 'break', 'return', 'else', 'elseif'}
                _OS_FUNCTIONS = {'lg', 'lb', 'li', 'p', 'g', 'd', 'o', 'f', 'e',
                                 'length', 'extract', 'find', 'piece', 'list',
                                 'ascii', 'char', 'translate', 'replace', 'reverse',
                                 'zdh', 'zdt', 'zd', 'zt', 'zts', 'h', 'now',
                                 'case', 'select', 'classname', 'classmethod'}

                for var in re.findall(r'\b([A-Za-z_][A-Za-z0-9_]*)\b', expr_clean):
                    if var in var_mapping or var in intermediates:
                        continue
                    # 跳过 ObjectScript 命令缩写和函数
                    if var.lower() in _OS_COMMANDS or var.lower() in _OS_FUNCTIONS:
                        continue
                    # 检查变量是否在当前域中定义
                    if var in skip_vars:
                        # skip_vars 中的变量在当前域可能未定义
                        # 如果不在遍历模板中定义，也不在循环变量中，则视为未定义
                        if var not in template_defined and var not in loop_vars:
                            undefined_in_expr.add(var)
                    elif var in undefined_vars:
                        undefined_in_expr.add(var)

                if undefined_in_expr and not has_external_call:
                    # 表达式引用了未定义的变量，初始化为空字符串
                    # ★ 但如果表达式包含外部方法调用，保留原表达式
                    # ★ 跨域取值表达式（包含多个语句）应该保留
                    if ';' in expr or expr.count(' s ') > 0 or '\n' in expr:
                        # 多语句表达式，需要正确处理缩进
                        lines = expr.split('\n')
                        base_indent = indent
                        current_indent = base_indent
                        for k, line in enumerate(lines):
                            line = line.strip()
                            if not line:
                                continue
                            # 处理花括号缩进
                            if line.startswith('}'):
                                # 闭合花括号，减少缩进
                                current_indent = current_indent[4:] if len(current_indent) > len(base_indent) else base_indent
                                flines.append(f'{current_indent}{line}')
                            elif '{' in line:
                                # 开开花括号，当前行使用当前缩进，下一行增加缩进
                                flines.append(f'{current_indent}{line}')
                                current_indent = current_indent + '    '
                            else:
                                # 普通行，使用当前缩进
                                flines.append(f'{current_indent}{line}')
                        # 添加注释
                        if flines:
                            flines[-1] = flines[-1] + f'  ; {cn}'
                    elif not is_todo:
                        flines.append(f'{indent}Set {field.var_name}=""  ; {cn}（引用了未定义变量: {", ".join(undefined_in_expr)}）')
                elif undefined_in_expr and has_external_call:
                    # 外部方法调用，保留原表达式（变量作为参数传入）
                    flines.append(f'{indent}Set {field.var_name}={expr}  ; {cn}')
                elif not self._is_valid_os_expr(expr):
                    # 已在批量初始化中处理，跳过重复初始化
                    if not is_todo:
                        flines.append(f'{indent}Set {field.var_name}=""  ; {cn}（TODO: 表达式含伪代码）')
                elif self._is_simple_expr(expr):
                    # ★ 检查是否需要分步取值
                    if self._needs_step_by_step(expr):
                        # 分步取值：将复杂嵌套表达式拆分为多步
                        result = self._generate_step_by_step(
                            field.var_name, expr, cn,
                            registry, intermediates, var_inference, var_mapping, set(), flines, indent
                        )
                        if isinstance(result, tuple):
                            final_expr, step_var = result
                            # ★ 花括号内的代码需要增加缩进
                            flines.append(f'{indent}    Set {field.var_name}={final_expr}  ; {cn}')
                            flines.append(f'{indent}}}')
                        else:
                            flines.append(f'{indent}Set {field.var_name}={result}  ; {cn}')
                    else:
                        flines.append(f'{indent}Set {field.var_name}={expr}  ; {cn}')
                else:
                    lv = self._extract_last_assigned_var(expr)
                    if lv:
                        cv = self._to_camel_case(lv)
                        flines.append(f'{indent}{expr}  ; → {field.var_name}（{cn}）')
                        flines.append(f'{indent}Set {field.var_name}={cv}  ; {cn}')
                    else:
                        # 已在批量初始化中处理，跳过重复初始化
                        if not is_todo:
                            flines.append(f'{indent}Set {field.var_name}=""  ; {cn}（TODO: 表达式解析失败）')
            else:
                # 已在批量初始化中处理，跳过重复初始化
                if not is_todo:
                    if vr and hasattr(vr, 'resolution_status') and vr.resolution_status == "identified":
                        flines.append(f'{indent}Set {field.var_name}=""  ; {cn}（IDENTIFIED: {vr.standard_name}）')
                    else:
                        flines.append(f'{indent}Set {field.var_name}=""  ; {cn}（TODO: 待实现）')
            return flines

        # 字段取值
        tag_block = None  # 标签代码块
        if traversal_config and traversal_config.template:
            # 有遍历配置：定义标签代码块
            # 注意：标签代码块放在方法体之外，由 _render_code 处理

            # ★ 收集所有字段表达式中引用的变量，用于按需定义
            referenced_vars = set()
            if value_results:
                for vr in value_results:
                    if vr and vr.value_expression:
                        # 提取表达式中的变量名
                        expr_clean = re.sub(r'"[^"]*"', '""', vr.value_expression)
                        for var in re.findall(r'\b([A-Za-z_][A-Za-z0-9_]*)\b', expr_clean):
                            if len(var) > 1 and var not in _NON_VARIABLES:
                                referenced_vars.add(var)

            # ★ 过滤掉不属于当前域的中间变量（防止跨域污染）
            # 例如：费用结算域不应该使用医嘱域的 ordId、ordItm 等变量
            _domain_specific_vars = {
                '40-order': {'ordId', 'ordItm', 'arcimDr', 'arcSub', 'arcVer', 'ordstr1', 'ordstr2', 'ordstr3'},
                '60-surgery': {'opsId', 'anaData', 'opListData', 'operDr', 'surgeonDr'},
                'a0-fee-settlement': {'ordItm', 'ordId', 'ordSub', 'ordstr1', 'ordstr2', 'ordstr3',
                                      'arcimDr', 'arcSub', 'arcVer', 'ordDocDr', 'AppDeptRowID',
                                      'OrdSubCatRowID', 'OrdCatRowID',
                                      'prtRowId', 'prtData', 'payData', 'paySub'},  # 费用结算域通过发票表和PBOOEORIDR访问
                'a1-outpatient-invoice': {'prtRowId', 'prtData', 'payData', 'paySub'},  # 门诊发票域专属变量
            }
            # 获取当前域的专属变量
            current_domain_vars = _domain_specific_vars.get(domain_id, set())
            # 获取其他域的专属变量
            other_domain_vars = set()
            for d_id, d_vars in _domain_specific_vars.items():
                if d_id != domain_id:
                    other_domain_vars.update(d_vars)

            # 构建标签代码块内容（由 _render_code 放在 q $$$OK 之后）
            tag_lines = []
            tag_lines.append('')
            tag_lines.append(tag_name)
            tag_lines.append('    ; 获取字段值')

            # ★ 费用结算域：从账单医嘱子表获取医嘱信息
            # PBOOEORIDR字段（^3）指向医嘱明细表，通过它可以获取医嘱相关信息
            if domain_id in ['a0-fee-settlement', 'a1-outpatient-invoice']:
                # 检查是否有字段引用了医嘱变量（包括间接依赖）
                order_vars = {'ordItm', 'ordId', 'ordSub', 'ordstr1', 'ordstr2', 'ordstr3',
                              'arcimDr', 'arcSub', 'arcVer', 'OrdSubCatRowID', 'OrdCatRowID',
                              'ordDocDr', 'AppDeptRowID', 'OrdTypeRowID'}
                needs_order_info = bool(referenced_vars & order_vars)
                if needs_order_info:
                    tag_lines.append('    ; 从账单医嘱子表获取医嘱信息')
                    tag_lines.append('    s ordItm=$p(pboData,"^",3)  ; 医嘱DR(PBOOEORIDR)')
                    tag_lines.append('    if ordItm\'="" {')
                    tag_lines.append('        s ordId=+ordItm  ; 医嘱主表ID')
                    tag_lines.append('        s ordSub=$p(ordItm,"||",2)  ; 医嘱子表ID')
                    tag_lines.append('        s ordstr1=$g(^OEORD(ordId,"I",ordSub,1))  ; 医嘱主节点')
                    tag_lines.append('        s ordstr2=$g(^OEORD(ordId,"I",ordSub,2))  ; 医嘱项目节点')
                    tag_lines.append('        s ordstr3=$g(^OEORD(ordId,"I",ordSub,3))  ; 医嘱收费科室节点')
                    tag_lines.append('    }')
                    tag_lines.append('')

            # ★ 基础变量定义（按需：只有被引用时才定义）
            # patDR 从 adm 获取（如果模板中未定义且被引用）
            if 'patDR' not in template_defined and 'patDR' in referenced_vars:
                tag_lines.append('    s patDR=$p($g(^PAADM(adm)),"^",1)  ; 患者DR')
            # hospDr 从就诊信息的科室DR获取院区DR
            if 'hospDr' in referenced_vars and 'hospDr' not in template_defined:
                tag_lines.append('    s ctlocDr=$p($g(^PAADM(adm)),"^",4)  ; 科室DR')
                tag_lines.append('    s hospDr=$p($g(^CTLOC(ctlocDr)),"^",22)  ; 院区DR')
            # AppDeptRowID 从 pboData 获取接收科室DR
            if 'AppDeptRowID' in referenced_vars and 'AppDeptRowID' not in template_defined:
                tag_lines.append('    s AppDeptRowID=$p(pboData,"^",3)  ; 接收科室DR')
            # ★ 公共变量（按需：只有被引用时才定义，且不属于其他域）
            if adm_im and not use_date_batch and needs_paadm:
                for var_name in list(adm_im.keys()):
                    # 只有被字段表达式引用的变量才定义
                    if var_name not in referenced_vars:
                        continue
                    # 跳过其他域的专属变量
                    if var_name in other_domain_vars:
                        continue
                    expr, desc = adm_im[var_name]
                    if expr:
                        expr = self._replace_vars(expr, var_mapping)
                        expr = self._quote_external_properties(expr)
                        expr = self._fix_operator_spaces(expr)
                        expr = self._normalize_global_subscripts(expr)
                        expr = self._normalize_global_names(expr)
                        tag_lines.append(f'    s {var_name}={expr}  ; {desc}')
                if tag_lines and not tag_lines[-1].strip() == '':
                    tag_lines.append('')
            # 中间变量（手术域，按需，且当前域是手术域）
            if ops_im and domain_id == '60-surgery':
                for var_name in list(ops_im.keys()):
                    if var_name not in referenced_vars:
                        continue
                    expr, desc = ops_im[var_name]
                    if expr:
                        expr = self._replace_vars(expr, var_mapping)
                        expr = self._quote_external_properties(expr)
                        expr = self._fix_operator_spaces(expr)
                        expr = self._normalize_global_subscripts(expr)
                        expr = self._normalize_global_names(expr)
                        tag_lines.append(f'    s {var_name}={expr}  ; {desc}')
                if tag_lines and not tag_lines[-1].strip() == '':
                    tag_lines.append('')
            # 中间变量（医嘱域，按需，且当前域是医嘱域）
            if ord_im and domain_id == '40-order':
                loop_vars = self.get_domain_loop_vars(domain_id)
                # ★ 修复：检查 ord_im 中变量依赖的 loop_vars 变量
                # arcSub/arcVer 在 loop_vars 中被跳过，但 phcdfDr 依赖它们
                # 需要将被依赖的 loop_vars 变量也输出到标签代码块中
                loop_deps_needed = set()
                for var_name, (expr, desc) in ord_im.items():
                    expr_clean = re.sub(r'"[^"]*"', '""', expr)
                    for dep_var in re.findall(r'\b([A-Za-z_][A-Za-z0-9_]*)\b', expr_clean):
                        if dep_var in loop_vars and dep_var not in ord_im:
                            loop_deps_needed.add(dep_var)
                # 输出被依赖的 loop_vars 变量
                for dep_var in sorted(loop_deps_needed):
                    if dep_var in intermediates:
                        dep_expr, dep_desc = intermediates[dep_var]
                        if dep_expr:
                            dep_expr = self._replace_vars(dep_expr, var_mapping)
                            dep_expr = self._quote_external_properties(dep_expr)
                            dep_expr = self._fix_operator_spaces(dep_expr)
                            dep_expr = self._normalize_global_subscripts(dep_expr)
                            dep_expr = self._normalize_global_names(dep_expr)
                            tag_lines.append(f'    s {dep_var}={dep_expr}  ; {dep_desc}')
                # ★ 收集 ord_im 中被其他变量依赖的变量名（不仅限于 referenced_vars）
                ord_im_deps = set()
                for var_name, (expr, desc) in ord_im.items():
                    expr_clean = re.sub(r'"[^"]*"', '""', expr)
                    for dep_var in re.findall(r'\b([A-Za-z_][A-Za-z0-9_]*)\b', expr_clean):
                        if dep_var in ord_im:
                            ord_im_deps.add(dep_var)
                effective_referenced = referenced_vars | ord_im_deps | loop_deps_needed
                for var_name in list(ord_im.keys()):
                    if var_name not in effective_referenced:
                        continue
                    expr, desc = ord_im[var_name]
                    if expr:
                        expr = self._replace_vars(expr, var_mapping)
                        expr = self._quote_external_properties(expr)
                        expr = self._fix_operator_spaces(expr)
                        expr = self._normalize_global_subscripts(expr)
                        expr = self._normalize_global_names(expr)
                        tag_lines.append(f'    s {var_name}={expr}  ; {desc}')
                if tag_lines and not tag_lines[-1].strip() == '':
                    tag_lines.append('')
            # ★ 中间变量（费用结算域，按需）— 包含医嘱链路变量
            if ord_im and domain_id == 'a0-fee-settlement':
                # 收集需要生成的变量（包括依赖变量）
                # 只要 ord_im 中有任何变量被引用，就生成所有 ord_im 变量
                # 因为 ord_im 中的变量是相互依赖的链路
                vars_to_generate = set()
                has_referenced = False
                for var_name in list(ord_im.keys()):
                    if var_name in referenced_vars:
                        has_referenced = True
                        break

                # 如果有任何 ord_im 变量被引用，生成所有 ord_im 变量
                if has_referenced:
                    vars_to_generate = set(ord_im.keys())

                # 按依赖顺序生成变量
                for var_name in self._sort_vars_by_dependency(ord_im):
                    if var_name not in vars_to_generate:
                        continue
                    # 跳过已在医嘱信息块中定义的基础变量
                    if var_name in ('ordId', 'ordSub', 'ordItm', 'ordstr1', 'ordstr2', 'ordstr3'):
                        continue
                    expr, desc = ord_im[var_name]
                    if expr:
                        expr = self._replace_vars(expr, var_mapping)
                        expr = self._quote_external_properties(expr)
                        expr = self._fix_operator_spaces(expr)
                        expr = self._normalize_global_subscripts(expr)
                        expr = self._normalize_global_names(expr)
                        tag_lines.append(f'    s {var_name}={expr}  ; {desc}')
                if tag_lines and not tag_lines[-1].strip() == '':
                    tag_lines.append('')

            # ★ 子表遍历支持
            # 检查当前视图是否需要子表遍历
            need_subtable = False
            subtable_config = None
            print(f"[DEBUG] Checking subtable: view_code={view_code}, has_subtable={bool(traversal_config.subtable)}")
            if traversal_config.subtable:
                subtable_config = traversal_config.subtable
                print(f"[DEBUG] Subtable matchers: {subtable_config.view_matchers}")
                # 检查 view_code 是否匹配子表的 viewMatchers
                view_lower = view_code.lower()
                for matcher in subtable_config.view_matchers:
                    if matcher.lower() in view_lower:
                        need_subtable = True
                        print(f"[DEBUG] Subtable matched: {matcher}")
                        break

            if need_subtable and subtable_config and subtable_config.template:
                # 生成子表遍历代码
                # 子表字段取值在子表循环内部
                tag_lines.append('    ; 子表遍历（检验细项）')
                # 从主表data中提取关联键（通常是ReportID）
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
                    # 处理点号缩进格式（转换为花括号格式）
                    if line.startswith('...'):
                        tag_lines.append('            ' + line[3:])
                    elif line.startswith('..'):
                        tag_lines.append('        ' + line[2:])
                    elif line.startswith('.'):
                        tag_lines.append('    ' + line[1:])
                    else:
                        tag_lines.append('    ' + line)

                # ★ 主标签代码块必须以 q 结尾，防止继续执行到子表标签
                tag_lines.append('    q')
                tag_lines.append('')

                # 添加子表字段取值标签
                tag_lines.append('GetItemDetail')
                tag_lines.append('    ; 获取子表字段值')
                # 子表字段取值（使用 itemData 变量）
                fl = _gen_fields('    ', data_var='itemData')
                tag_lines.extend(fl)
                tag_lines.append('    d OutRow')
                tag_lines.append('    q')
            else:
                # 无子表遍历：普通字段取值
                fl = _gen_fields('    ')
                tag_lines.extend(fl)
                tag_lines.append('    d OutRow')
                tag_lines.append('    q')
            tag_block = '\n'.join(tag_lines)
        else:
            # 无遍历配置：字段取值在循环内
            # ★ 当 needs_paadm=True 时，取值代码应该在 PAADMi 循环内部
            # 但由于 tag_block 是 None，取值代码会被添加到 lines 中
            # 而 lines 的内容在 PAADMi 循环外部
            # 解决方案：创建标签代码块
            tag_lines = []
            tag_lines.append('')
            tag_lines.append(tag_name)
            tag_lines.append('    ; 获取字段值')
            fl = _gen_fields('    ')
            tag_lines.extend(fl)
            tag_lines.append('    d OutRow')
            tag_lines.append('    q')
            tag_block = '\n'.join(tag_lines)

        return '\n'.join(lines), tag_block

    def _get_tag_name(self, domain_id: Optional[str], view_code: str = "") -> str:
        """根据业务域生成标签名

        规则：
        - 就诊/入院域 (20-visit): GetVisitInfo
        - 诊断域 (30-diagnosis): GetDiagnosisInfo
        - 医嘱域 (40-order): GetOrderInfo
        - 手术域 (60-surgery): GetSurgeryInfo
        - 费用结算域 (a0-fee-settlement): GetFeeInfo
        - 药品域 (d0-pharmacy, d1-drug-dict): GetDrugInfo
        - 护理域 (70-nursing): GetNursingInfo
        - 病历域 (90-medical-record): GetRecordInfo
        - 检验域 (50-lab-exam): GetLabInfo
        - 检查域 (55-exam-report): GetExamInfo
        - 默认: GetDataRow
        """
        tag_map = {
            '20-visit': 'GetVisitInfo',
            '30-diagnosis': 'GetDiagnosisInfo',
            '40-order': 'GetOrderInfo',
            '60-surgery': 'GetSurgeryInfo',
            'a0-fee-settlement': 'GetFeeInfo',
            'd0-pharmacy': 'GetDrugInfo',
            'd1-drug-dict': 'GetDrugInfo',
            '70-nursing': 'GetNursingInfo',
            '90-medical-record': 'GetRecordInfo',
            '50-lab-exam': 'GetLabInfo',
            '55-exam-report': 'GetExamInfo',
        }
        if domain_id and domain_id in tag_map:
            return tag_map[domain_id]
        return 'GetDataRow'

    def _detect_domain(self, value_results) -> Optional[str]:
        """从L1匹配结果推断主业务域ID

        统计各域的匹配字段数，返回最多匹配的域ID。
        未匹配到任何域时返回 None。

        优先级规则：当 40-order 匹配数最多时，检查是否有更具体的域（如 d0-pharmacy, d1-drug-dict）
        有匹配，优先选择更具体的域。
        """
        import logging
        logger = logging.getLogger(__name__)

        if not value_results:
            logger.debug("_detect_domain: value_results为空")
            return None

        counts = {}
        for result in value_results:
            if result and hasattr(result, 'rule') and result.rule:
                domain = getattr(result.rule, 'domain', None)
                if domain:
                    counts[domain] = counts.get(domain, 0) + 1

        logger.debug(f"_detect_domain: 域统计 {counts}")

        if not counts:
            return None

        # ★ 排除非业务域（common、zz-custom、z0-common等）
        # 这些域不是真正的业务域，不应该被选为检测结果
        non_business_domains = {'common', 'zz-custom', 'z0-common'}
        business_counts = {k: v for k, v in counts.items() if k not in non_business_domains}

        # 如果有业务域，选择业务域中匹配数最多的
        if business_counts:
            detected = max(business_counts, key=business_counts.get)
            logger.debug(f"_detect_domain: 检测到业务域 {detected} (匹配数={business_counts[detected]})")
        else:
            # 如果没有业务域，选择匹配数最多的域
            detected = max(counts, key=counts.get)
            logger.debug(f"_detect_domain: 检测到域 {detected} (匹配数={counts[detected]})")
        return detected

    def _find_dependency_rule(self, dep_name: str, engine) -> Optional:
        """查找依赖变量对应的规则

        Args:
            dep_name: 依赖变量名（如 SexRowID）
            engine: 取值引擎

        Returns:
            匹配的规则，未找到返回 None
        """
        if not engine:
            return None

        # 在规则库中搜索
        # 尝试多种变体
        search_names = [
            dep_name,
            dep_name.upper(),
            dep_name.lower(),
            dep_name.replace('RowID', '_ROWID').replace('rowid', '_ROWID'),
        ]

        for name in search_names:
            results = engine.search_rules(name)
            if results:
                return results[0].rule

        return None

    @staticmethod
    def _is_valid_os_expr(expr: str) -> bool:
        """验证表达式是否为有效ObjectScript代码

        检测伪代码/描述性文字：
        - → 箭头（链路描述）
        - 中文文字（描述性注释）
        - 反引号对（Markdown代码引用）
        - `或` 分隔符（多选一描述）
        - Global引用格式错误

        Returns:
            True 如果表达式看起来是有效的ObjectScript
        """
        if not expr or not expr.strip():
            return False
        # 箭头伪代码
        if re.search(r'[→]', expr):
            return False
        # 中文文字（在引号外的）
        cleaned = re.sub(r'"[^"]*"', '""', expr)
        if re.search(r'[一-鿿]', cleaned):
            return False
        # 反引号（Markdown残留）
        if '`' in expr:
            return False
        # 或分隔符
        if re.search(r'\b或\b', expr):
            return False
        # Global标签引用 ^xxx.^NNN 格式（伪代码）
        if re.search(r'\^\w+\.\^\d+', expr):
            return False
        return True

    @staticmethod
    def _get_expr_level(expr: str) -> str:
        """判断表达式使用的变量作用域级别

        Returns:
            'adm' — adm级别(外层)
            'ord' — 医嘱级别(需要ordId/ordItm循环)
            'bed' — 床位级别(需要wardDr/bedDr循环)
            'ops' — 手术级别(需要opsId循环)
        """
        if not expr:
            return 'adm'
        if re.search(r'\b(wardDr|bedDr|BedSub|bedSub)\b', expr):
            return 'bed'
        # 手术域中间变量：直接引用opsId的，或者依赖手术域中间变量的
        if re.search(r'\b(opsId|anaData|opListData|anaId|operDr|surgeonDr|assistDr|anesDr|anesMethodDr)\b', expr):
            return 'ops'
        # 医嘱域中间变量：直接引用ordId/ordItm的，或者依赖其他中间变量的
        if re.search(r'\b(ordId|ordItm|arcimDr|arcSub|arcVer|ordstr[123]|'
                     r'OrdTypeRowID|ordTypeRowID|OrdSubCatRowID|OrdCatRowID|'
                     r'ordSubCatRowID|ordCatRowID|phcdfDr|drugFormDr)\b', expr):
            return 'ord'
        return 'adm'

    @staticmethod
    def _is_simple_expr(expr: str) -> bool:
        """判断是否是简单表达式（可直接赋值）

        简单表达式：$p(...)、$g(...)、变量名、常量等
        多语句表达式：Set tDate=... If tDate'="" Set tDate=$zd(tDate,3)

        Returns:
            True 表示可用 Set varName=expr 赋值
            False 表示是多语句，需要特殊处理
        """
        expr = expr.strip()
        # 以 Set/s 开头的是赋值语句（多语句）
        if expr.startswith('Set ') or expr.startswith('Set\t'):
            return False
        if expr.startswith('s ') or expr.startswith('s\t'):
            return False
        # 包含条件语句
        if re.search(r'\bIf\b', expr) or re.search(r'\bi\b', expr):
            return False
        # 包含多个赋值语句
        if re.search(r'\bSet\b', expr[4:]):  # 跳过开头
            return False
        if ' s ' in expr:
            return False
        return True

    @staticmethod
    def _extract_last_assigned_var(expr: str) -> Optional[str]:
        """从多语句表达式中提取最后一个赋值的变量名

        例如：Set tDate=$p(...) If tDate'="" Set tDate=$zd(tDate,3)
        返回：tDate

        Args:
            expr: 多语句表达式

        Returns:
            最后一个赋值的变量名，未找到返回 None
        """
        # 找到最后一个 Set varName= 或 s varName= 的模式
        matches = re.findall(r'(?:Set|s)\s+([A-Za-z_][A-Za-z0-9_]*)\s*=', expr)
        if matches:
            return matches[-1]
        return None

    @staticmethod
    def _expand_os_commands(line: str) -> str:
        """处理 ObjectScript 命令

        规则：花括号语法 If{} / Else{} 中的关键字必须全写，不能缩写成 i{} / e{}。
        但行内缩写是允许的（s/q/i/f/d/k 等），不做展开。
        """
        # 只处理花括号语法中的关键字全写问题
        result = line
        result = re.sub(r'\bi\{', 'If{', result)
        result = re.sub(r'\be\{', 'Else{', result)
        return result

    @staticmethod
    def _to_camel_case(name: str) -> str:
        """将变量名转为驼峰命名（含中文清理，委托基类实现）

        SexRowID -> sexRowId
        SEX_ROWID -> sexRowId
        医疗机构代码 -> orgCode
        """
        from .base_generator import BaseGenerator
        return BaseGenerator._to_camel_case(name)

    @staticmethod
    def _quote_external_properties(expr: str) -> str:
        """外部类属性双引号包裹"""
        if not expr:
            return expr
        strings = []
        def _save_str(m):
            strings.append(m.group(0))
            return f'\x00STR{len(strings)-1}\x00'
        result = re.sub(r'"[^"]*"', _save_str, expr)
        def _quote_prop(m):
            return f'{m.group(1)}."{m.group(2)}"'
        result = re.sub(r'(\b[a-zA-Z_]\w*)\.([A-Z][A-Z0-9_]*[A-Z0-9])\b', _quote_prop, result)
        for idx, s in enumerate(strings):
            result = result.replace(f'\x00STR{idx}\x00', s)
        return result

    @staticmethod
    def _fix_operator_spaces(expr: str) -> str:
        """修复操作符空格"""
        if not expr:
            return expr
        strings = []
        def _save_str(m):
            strings.append(m.group(0))
            return f'\x00STR{len(strings)-1}\x00'
        result = re.sub(r'"[^"]*"', _save_str, expr)
        result = re.sub(r'(\bSet\s+\w+)\s+=\s+', r'\1=', result)
        result = re.sub(r'(\bs\s+\w+)\s+=\s+', r'\1=', result)
        result = re.sub(r"\s*'=\s*", "'=", result)
        result = re.sub(r'\s*>\s*', '>', result)
        result = re.sub(r'\s*<\s*', '<', result)
        for idx, s in enumerate(strings):
            result = result.replace(f'\x00STR{idx}\x00', s)
        return result

    @staticmethod
    def _replace_vars(expr: str, var_mapping: Dict[str, str]) -> str:
        """替换表达式中的变量名

        Args:
            expr: 取值表达式
            var_mapping: 变量名映射字典

        Returns:
            替换后的表达式
        """
        result = expr
        for old_var, new_var in var_mapping.items():
            # 使用单词边界匹配，避免部分匹配
            # 例如 patDR 不会匹配 patDRCode
            result = re.sub(r'\b' + re.escape(old_var) + r'\b', new_var, result)

        # 对表达式中剩余的带下划线变量进行规范化
        # 匹配大写带下划线的变量名（如 ICD_CODE_DR、DOC_CODE_DR）
        def normalize_var(match):
            var = match.group(0)
            # 跳过Global名、函数名等
            if var.startswith('^') or var.startswith('$'):
                return var
            # 跳过已知的非变量标识符（Global名+下标+函数+关键字）
            if var in {'PAPER', 'PAADM', 'PAADMi', 'PAWARD', 'OEORD', 'OEORDi', 'OECPR',
                       'CT', 'CTLOC', 'CTPCP', 'SSU', 'SSUSR', 'ARCIM', 'ARC', 'INCI',
                       'MR', 'MRC', 'PAC', 'OEC', 'ORC', 'NUR', 'TCLAB', 'TEPI', 'DHC',
                       'DHCTarC', 'DHCBill', 'DHCBTarItem', 'DHCTARI', 'DHCPB',
                       'ALL', 'PAT', 'PER', 'BED', 'DIA', 'ADM', 'SEX', 'HOSP',
                       'DISCON', 'ADMREA', 'ANMET', 'OSTAT', 'UOM', 'DT', 'DXT',
                       'ID', 'CODE', 'NAME', 'DESC', 'TEXT', 'DATA', 'ROW', 'VAL',
                       # Global 子脚本（不应被转为驼峰）
                       'IC', 'DF', 'DEP', 'ORCAT', 'OSTAT', 'SPEC', 'EXT', 'ASC',
                       'OC', 'DR', 'NUR', 'SESS', 'UOM', 'EPR', 'CARD',
                       'PHCD', 'PHCF', 'PHCIN', 'PHCFR', 'PHCDU', 'OECOR', 'ARCIC',
                       # CT字典节点标识（不应被转为驼峰）
                       'MAR', 'NAT', 'OCC', 'COU', 'PROV', 'CIT', 'RLT', 'SEX',
                       'SS', 'TTL', 'CTRLT', 'HOSP', 'LOC', 'PCP'}:
                return var
            # 转为驼峰
            return QueryGenerator._to_camel_case(var)

        # 匹配所有大写带下划线的变量名
        result = re.sub(r'\b([A-Z][A-Z0-9_]*[A-Z0-9])\b', normalize_var, result)
        return result

    def _validate_code(self, code: str) -> List[str]:
        """验证生成的代码是否符合P0红线

        Returns:
            错误列表，空列表表示通过
        """
        errors = []

        # 检查1：变量名禁止下划线
        # 匹配 Set var_name= 或 s var_name= 模式（排除ROWSPEC、注释等）
        underscore_vars = re.findall(r'^\s+(?:Set|s)\s+([A-Za-z]*_[A-Za-z]*)\s*=', code, re.MULTILINE)
        for var in underscore_vars:
            if not var.startswith('ROWSPEC'):  # ROWSPEC豁免
                errors.append(f"变量名带下划线: {var}")

        # 检查2：中文占位符
        if '（待补充）' in code:
            errors.append("包含中文占位符: （待补充）")

        # 检查3：未定义变量使用
        undefined_patterns = [r'\btDate\b', r'\btTime\b', r'\btDateTime\b']
        for pattern in undefined_patterns:
            if re.search(pattern, code):
                errors.append(f"使用未定义变量: {pattern}")

        # 检查4：操作符空格（Set赋值行）
        for i, line in enumerate(code.split('\n'), 1):
            if re.search(r'\bSet\s+\w+\s+=\s', line):
                errors.append(f"L{i}: 操作符空格: {line.strip()[:60]}")

        # 检查5：外部类属性未双引号（obj.PROPERTY_NAME 模式）
        # 排除：包路径(web.DHCENS)、Global(^CIS.AN)、Class声明、Parameter引用
        _SKIP_PATTERNS = re.compile(
            r'(web\.|Class\s|Extends\s|Parameter\s|^\s*[sd]\s.*\^|^\s*Set\s.*\^)'
        )
        for i, line in enumerate(code.split('\n'), 1):
            if line.strip().startswith(';') or line.strip().startswith('//'):
                continue
            if _SKIP_PATTERNS.search(line):
                continue
            clean = re.sub(r'"[^"]*"', '""', line)
            if re.search(r'\b[a-zA-Z_]\w*\.[A-Z][A-Z0-9_]*[A-Z0-9]\b', clean):
                if '."' not in line:  # 已经双引号的跳过
                    errors.append(f"L{i}: 外部类属性需双引号: {line.strip()[:60]}")

        return errors

    def _render_code(self, package_path: str, view: ViewDefinition,
                     rowspec: str, method_body: str, field_vars: str,
                     tag_block: str = None, domain_id: str = None,
                     parameter_fields: list = None) -> str:
        """渲染完整代码（标准模板）

        Query 接口支持两种查询模式：
        - 模式1：按就诊ID查询：pAdmRowId（就诊ID）
        - 模式2：按日期范围查询：pDateFrom（开始日期）, pDateTo（结束日期）, pHospitalId（院区ID，可选）

        对于字典类接口（如 d1-drug-dict），使用不同的参数：
        - 入参：pHospitalId（院区ID，可选）
        """
        now = datetime.now().strftime("%Y-%m-%d")
        # 从包路径提取类名（已是无下划线格式）
        class_name = package_path.split(".")[-1]
        query_name = f"Get{class_name}"
        author = self.author

        # 判断是否是字典类接口
        is_dict_domain = domain_id in ['d1-drug-dict', 'd0-pharmacy', '00-dictionary']

        if is_dict_domain:
            # 字典类接口：不需要日期范围，只需要院区ID（可选）
            param_decl = "pHospitalId As %String = \"\""
            param_comment = "pHospitalId: 院区ID (默认为空)"
            debug_params = '("")'
            execute_params = "pHospitalId"
        else:
            # 业务类接口：支持就诊ID或日期范围+院区
            param_decl = "pAdmRowId As %String = \"\", pDateFrom As %String = \"\", pDateTo As %String = \"\", pHospitalId As %String = \"\""
            param_comment = "pAdmRowId: 就诊ID (与日期范围二选一), pDateFrom: 开始日期, pDateTo: 结束日期, pHospitalId: 院区ID"
            debug_params = '("123","","","")'
            execute_params = "pAdmRowId, pDateFrom, pDateTo, pHospitalId"

        # 标签代码块（放在 q $$$OK 之后）
        tag_section = tag_block if tag_block else ""

        # 生成配置参数定义
        parameter_section = ""
        if parameter_fields:
            parameter_section = "\n/// ========== 配置参数（需手动配置） ==========\n"
            for pf in parameter_fields:
                param_name = pf['name']
                # 转换为Parameter命名规范（首字母大写）
                param_name_upper = param_name[0].upper() + param_name[1:] if param_name else ''
                default_val = pf['default'] if pf['default'] else '""'
                desc = pf['description'] if pf['description'] else f'{pf["code"]}，需手动配置'
                parameter_section += f'    /// {desc}\n'
                parameter_section += f'    Parameter {param_name_upper} = {default_val};\n'

        code = f"""Class {package_path} Extends %RegisteredObject
{{

/// ======================================================================
/// {package_path}
/// 功能描述：{view.view_name}
///
/// 数据来源: DHC HIS 系统 Global 结构说明
///
/// Package:   {package_path}
/// Author:    {author}
/// Date:      {now}
/// ======================================================================
{parameter_section}
/// 方法说明：获取{view.view_name}
/// 输入参数: {param_comment}
/// 输出: {view.view_name}数据集
/// ROWSPEC: {rowspec}
/// === 调试命令 ===
/// [终端/Portal运行]:
///     d ##class({package_path}).{query_name}{debug_params}
/// [数据库软件SQL调用]:
///     CALL {package_path.replace('.', '_')}_{query_name}{debug_params}
Query {query_name}({param_decl}) As %Query(ROWSPEC = "{rowspec}") [ SqlProc ]
{{
}}

/// 方法说明：Execute 方法，遍历数据源并填充结果集
ClassMethod {query_name}Execute(ByRef qHandle As %Binary, {param_decl}) As %Status
{{
    s repid=$i(^CacheTemp)
    s qHandle=$lb(0,repid,0)
    s ind=1

    // ========== 业务逻辑开始 ==========
{method_body}
    // ========== 业务逻辑结束 ==========

    q $$$OK
{tag_section}
OutRow
    s Data=$lb({field_vars})
    s ^CacheTemp(repid,ind)=Data
    s ind=ind+1
    q
}}

/// 方法说明：Fetch 方法，逐条返回结果集数据
ClassMethod {query_name}Fetch(ByRef qHandle As %Binary, ByRef Row As %List, ByRef AtEnd As %Integer = 0) As %Status [ PlaceAfter = {query_name}Execute ]
{{
    s AtEnd=$li(qHandle,1)
    s repid=$li(qHandle,2)
    s ind=$li(qHandle,3)

    s ind=$o(^CacheTemp(repid,ind))
    i ind="" {{
        s AtEnd=1
        s Row=""
    }} else {{
        s Row=^CacheTemp(repid,ind)
    }}

    s qHandle=$lb(AtEnd,repid,ind)
    q $$$OK
}}

/// 方法说明：Close 方法，清理临时数据
ClassMethod {query_name}Close(ByRef qHandle As %Binary) As %Status [ PlaceAfter = {query_name}Execute ]
{{
    s repid=$li(qHandle,2)
    k ^CacheTemp(repid)
    q $$$OK
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

    def generate_file(self, view: ViewDefinition,
                      value_results: Optional[List[Optional[ValueResult]]] = None,
                      output_dir: Optional[Path] = None,
                      system_name: str = "",
                      sub_path: str = "",
                      engine=None) -> Path:
        """生成代码文件

        Args:
            view: 视图定义
            value_results: 取值结果列表
            output_dir: 输出目录
            system_name: 系统名
            sub_path: 子路径
            engine: 取值引擎（用于依赖解析）

        Returns:
            生成的文件路径
        """
        code = self.generate(view, value_results, system_name, sub_path, engine)

        # 构建文件名
        class_name = self._build_class_name(view, system_name)
        file_name = f"{class_name.replace('.', '_')}.cls"

        # 输出目录
        if output_dir is None:
            output_dir = Path.cwd() / "output"
        output_dir.mkdir(parents=True, exist_ok=True)

        file_path = output_dir / file_name
        with open(file_path, 'w', encoding='utf-8-sig') as f:
            f.write(code)

        return file_path
