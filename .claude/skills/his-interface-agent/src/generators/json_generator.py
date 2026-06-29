"""JSON 格式代码生成器

生成 ObjectScript JSON 接口代码，使用 IRIS 内置 JSON 处理。
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
from .base_generator import BaseGenerator, TraversalStrategySelector, TraversalStrategy, VarRegistry
from .traversal_loader import TraversalConfig


class JsonGenerator(BaseGenerator):
    """JSON 格式代码生成器（继承公共基类）

    所有索引遍历配置由规则库 frontmatter 中的 traversal 字段驱动，
    生成器代码不包含任何硬编码的业务索引配置。
    """

    # 基础已定义变量（方法参数 + 常用变量）
    BASE_DEFINED_VARS = {
        # 方法参数
        'pAdmRowId', 'pDateFrom', 'pDateTo', 'pHospitalId',
        'admRowId', 'startDate', 'endDate', 'hospitalId',
        # Query 基础变量
        'qHandle', 'repid', 'ind', 'Data', 'Row', 'AtEnd',
        # 通用变量
        'adm', 'admData', 'admInfo', 'status',
        'date', 'dataObj', 'dataArr', 'retObj',
    }

    # 模板类型特有的变量
    TEMPLATE_VARS = {
        'OEORD': {'ordId', 'ordItm', 'ordstr1', 'ordstr2', 'ordstr3', 'arcimDr', 'arcSub', 'arcVer'},
        'PAADM': {'adm', 'patDR', 'ctlocDr', 'ctpcpDr', 'admDate', 'admTime', 'disDate', 'disTime', 'mradm'},
        'DHCPB': {'pbId', 'pboChild', 'pbdChild', 'pbData', 'pboData', 'pbdData'},
        'DHCINVPRT': {'prtRowId', 'paySub', 'payData'},
        'MRDIA': {'mradm', 'sub', 'diaData', 'icdDr'},
    }

    # Global 引用中的名称（不作为变量检查）
    GLOBAL_NAMES = {
        "PAADM", "PAPER", "CTLOC", "CTPCP", "OEORD", "OEC", "ARC", "ARCIM",
        "Busi", "ENS", "EnsRISReportResultD", "EnsRISReportResultI",
        "EnsLISReportResultD", "EnsLISReportResultI",
        "EnsRISItemResultD", "EnsRISItemResultI",
        "EnsLISItemResultD", "EnsLISItemResultI",
        "EnsRISExamReportD", "EnsRISExamReportI",
        "SSU", "SSUSR", "MR", "ORC", "PAC", "CT", "SEX", "HOSP",
        "CacheTemp", "BLScatterData", "DHC", "DHCDocOrderCommon",
        "UtilMethod", "Nur", "NIS",
        # 挂号域 Global
        "User", "DHCRegistrationFee", "DHCRegistrationFeeD", "DHCRegistrationFeeI",
        # 诊断域 Global
        "MRC", "DHCINICT",
        # 费用域 Global
        "DHCPB", "DHCTARI",
        # Global 下标（引号内的字符串常量）
        "ALL", "PAT", "PER", "IC", "ORCAT", "OSTAT", "ADM",
        "I", "X", "NUR", "DEP", "DIA", "EPR", "CARD",
        "OECPR", "SESS", "DF", "UOM", "HOSP", "DR",
    }

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
        """生成 JSON 格式的 ObjectScript 代码

        自动流程：
        1. 标准化字段代码（中文→英文）
        2. 从L1匹配结果推断业务域
        3. 按域加载遍历配置
        4. 收集域特定中间变量
        5. 生成域特定代码
        """
        # === 标准化字段代码：确保 JSON key 和变量名都是英文 ===
        # 规范：field["code"] = 英文标识符（JSON key + 变量名）
        #       field["name"] = 中文描述（注释用）
        #       field["standard_code"] = 标准代码（备用）
        normalized_fields = []
        for field in fields:
            raw_code = field.get("code", "")
            raw_name = field.get("name", "")
            std_code = field.get("standard_code", "")

            # code 已是纯英文 → 直接使用
            if raw_code and all(c.isascii() and (c.isalnum() or c == '_') for c in raw_code):
                eng_code = raw_code
            else:
                # code 含中文或为空 → 用 standard_code 兜底，再不行用 _ensure_english_code
                eng_code = self._ensure_english_code(raw_code, raw_name, std_code)

            normalized_fields.append({
                "code": eng_code,       # 英文代码（JSON key + 变量名）
                "name": raw_name,       # 中文描述（注释用）
                "type": field.get("type", "String"),
                "raw_code": raw_code,   # 原始代码（保留供调试）
            })
        fields = normalized_fields

        # === 中文名二次匹配：L1未命中的字段用中文名重试 ===
        if engine and value_results:
            for i, field in enumerate(fields):
                vr = value_results[i] if i < len(value_results) else None
                # 已匹配到有效表达式 → 跳过
                if vr and vr.value_expression:
                    continue
                cn_name = field.get("name", "")
                if not cn_name:
                    continue
                # 用中文名做多轮匹配
                new_vr = engine.resolve_multi_round(
                    field["code"], field_name_cn=cn_name,
                    domain_hint=view_code
                )
                if new_vr and new_vr.value_expression:
                    if i < len(value_results):
                        value_results[i] = new_vr

        parsed_system, class_name = self._parse_view_code(view_code)
        effective_system = system_name or parsed_system
        package_path = self._build_package_path(effective_system, sub_path, class_name)
        method_name = f"Get{class_name}"

        # 核心：自动推断业务域（基于L1规则计数）
        domain_id = self.detect_domain(value_results)

        # 按域加载遍历配置（优先 viewMatchers 匹配）
        traversal_config = self.load_traversal_config(domain_id, view_code)

        # 遍历配置的类型→域ID映射（用于加载正确的中间变量）
        _TYPE_TO_DOMAIN = {
            'rEG': '10-registration', 'REG': '10-registration',
            'PAADM': '20-visit',
            'OEORD': '40-order',
            'DHCPB': 'a0-fee-settlement',
            'DHCINVPRT': 'a1-outpatient-invoice',
            'MRDIA': '30-diagnosis',
        }
        # 用遍历配置的域加载中间变量（比 detect_domain 更准确）
        effective_domain = domain_id
        if traversal_config and traversal_config.type:
            effective_domain = _TYPE_TO_DOMAIN.get(traversal_config.type, domain_id)

        # 收集域特定中间变量（用 effective_domain）
        intermediate_vars = self.collect_intermediate_vars(value_results, effective_domain, engine)

        # 分析表达式，确定需要哪些数据源（兼容旧逻辑）
        deps = self._analyze_dependencies(fields, value_results, view_code)
        if traversal_config:
            deps["traversalConfig"] = traversal_config
            deps["needsData"] = True
            if domain_id:
                deps["ensType"] = domain_id

        # 构建方法体
        method_body, tag_block = self._build_method_body(
            fields, value_results, deps, intermediate_vars, domain_id, view_code
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

    def _analyze_dependencies(self, fields: List[Dict[str, str]],
                               value_results: Optional[List[Optional[ValueResult]]],
                               view_code: str = "") -> Dict[str, Any]:
        """分析字段表达式，确定所需数据源和变量依赖

        Args:
            fields: 字段列表
            value_results: 取值结果列表
            view_code: 视图代码（用于判断数据源类型）

        Returns:
            {
                "needsData": bool,          # 是否需要数据源遍历
                "needsAdm": bool,           # 是否需要就诊信息 (^PAADM)
                "needsPatDR": bool,         # 是否需要患者 DR
                "ensType": "RIS" | "LIS" | "REG" | "MRDIA" | "DHCPB",  # 数据类型
                "needsOrdId": bool,         # 是否需要医嘱 ID (ordId/ordItm)
                "needsExSeq": bool,         # 是否需要执行序号
                "needsMradm": bool,         # 是否需要病案号 (mradm)
                "traversalConfig": TraversalConfig | None,  # 遍历配置
            }
        """
        deps = {
            "needsData": False,
            "needsAdm": False,
            "needsPatDR": False,
            "ensType": "RIS",
            "needsOrdId": False,
            "needsExSeq": False,
            "needsMradm": False,
            "traversalConfig": None,
        }

        # 首先尝试从规则库加载遍历配置
        traversal_config = None
        if view_code:
            traversal_config = self.traversal_loader.get_config_by_view_name(view_code)

        if traversal_config:
            # 使用规则库中的遍历配置
            deps["ensType"] = traversal_config.type
            deps["needsData"] = True
            deps["traversalConfig"] = traversal_config

            # 根据配置设置前置变量需求
            for pre_var in traversal_config.pre_variables:
                if pre_var.get("name") == "mradm":
                    deps["needsMradm"] = True
                elif pre_var.get("name") == "patDR":
                    deps["needsPatDR"] = True

            return deps

        # 如果规则库中没有配置，则使用硬编码的判断逻辑（向后兼容）
        # 根据视图名称判断数据源类型
        if view_code:
            view_code_lower = view_code.lower()
            if "register" in view_code_lower or "挂号" in view_code_lower:
                deps["ensType"] = "REG"
                deps["needsData"] = True
                return deps
            elif "outpatient" in view_code_lower or "diagnosis" in view_code_lower or "诊断" in view_code_lower:
                deps["ensType"] = "MRDIA"
                deps["needsData"] = True
                deps["needsMradm"] = True
                return deps
            elif "order" in view_code_lower or "医嘱" in view_code_lower:
                deps["ensType"] = "OEORD"
                deps["needsData"] = True
                return deps
            elif "expense" in view_code_lower or "fee" in view_code_lower or "费用" in view_code_lower:
                deps["ensType"] = "DHCPB"
                deps["needsData"] = True
                return deps

        # 如果视图名称无法判断，则根据表达式判断
        all_exprs = []
        if value_results:
            for vr in value_results:
                if vr and vr.value_expression:
                    all_exprs.append(vr.value_expression)

        has_oeord = False
        has_reg = False
        has_mrdia = False
        has_dhcpb = False

        for expr in all_exprs:
            if "$lg(" in expr:
                deps["needsData"] = True
                # $lg() 表达式优先判定为 ENS 数据源
                if deps["ensType"] == "RIS":  # 默认值，未被覆盖过
                    if "EnsLIS" in expr:
                        deps["ensType"] = "LIS"
            if "$g(^PAADM" in expr:
                deps["needsAdm"] = True
            if "patDR" in expr or "PatRowId" in expr:
                deps["needsPatDR"] = True
            if "ordId" in expr or "ordItm" in expr:
                deps["needsOrdId"] = True
            if "exSeq" in expr:
                deps["needsExSeq"] = True
            # OEORD 数据源检测
            if "OEORD" in expr or "ordstr1" in expr:
                has_oeord = True
            # 挂号域检测
            if "DHCRegistrationFee" in expr or "$lg(data," in expr:
                has_reg = True
            # 诊断域检测
            if "^MR(" in expr and "DIA" in expr:
                has_mrdia = True
                deps["needsMradm"] = True
            if "mradm" in expr:
                deps["needsMradm"] = True
            # 费用域检测
            if "^DHCPB" in expr:
                has_dhcpb = True

        # 按优先级判断数据源类型
        if has_oeord:
            deps["ensType"] = "OEORD"
            deps["needsData"] = True
        elif has_mrdia:
            deps["ensType"] = "MRDIA"
            deps["needsData"] = True
        elif has_reg:
            deps["ensType"] = "REG"
            deps["needsData"] = True
        elif has_dhcpb:
            deps["ensType"] = "DHCPB"
            deps["needsData"] = True

        return deps

    @staticmethod
    def _parse_view_code(view_code: str) -> tuple:
        """从视图代码解析系统名和类名"""
        # ext_开头的表名（数据采集表）- 作为整体类名
        if view_code.startswith("ext_"):
            # 转换为大驼峰: ext_out_register_info -> ExtOutRegisterInfo
            parts = view_code.split("_")
            class_name = "".join(p.capitalize() for p in parts)
            return "", class_name

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
                           deps: Dict[str, Any],
                           intermediate_vars: Optional[Dict[str, tuple]] = None,
                           domain_id: Optional[str] = None,
                           view_code: str = "") -> tuple:
        """构建方法体

        支持双模式查询（与Query生成器一致）：
        - 模式1：按就诊ID查询（admRowId有值）
        - 模式2：按日期范围查询（startDate/endDate有值）

        对于字典类接口，不需要双模式。

        Returns:
            (method_body, tag_block): 方法体和标签代码块
        """
        lines = []
        ens_type = deps.get("ensType", "RIS")
        traversal_config = deps.get("traversalConfig")
        traversal_for_depth = 0  # 初始化遍历深度

        # 判断是否为字典类接口
        is_dict_domain = domain_id in ['d1-drug-dict', 'd0-pharmacy', '00-dictionary']

        # 判断是否支持日期范围遍历（模板中引用了 pDateFrom/pDateTo）
        has_date_range = False
        if traversal_config and traversal_config.template:
            tmpl = traversal_config.template
            if "pDateFrom" in tmpl or "pDateTo" in tmpl:
                has_date_range = True

        # ===== 1. 参数校验和查询模式判断 =====
        if not is_dict_domain:
            lines.append('    // ========== 参数校验和查询模式判断 ==========')
            lines.append('    if (admRowId="")&&(startDate="") {')
            lines.append('        d stream.Write("{""code"":1,""msg"":""参数错误:就诊ID和日期范围不能同时为空"",""data"":[]}")')
            lines.append('        Quit stream')
            lines.append('    }')
            lines.append('    // 日期格式转换')
            lines.append('    if startDate\'="" {')
            lines.append('        s pDateFrom=startDate')
            lines.append('        s pDateTo=endDate')
            lines.append('        if pDateFrom["-" { s pDateFrom=$zdh(pDateFrom,3) }')
            lines.append('        if pDateTo["-" { s pDateTo=$zdh(pDateTo,3) }')
            lines.append('    }')
            lines.append('')
        else:
            # 字典类接口：不需要日期范围和就诊ID
            lines.append('    // ========== 字典类接口 ==========')
            lines.append('')

        # ===== 2. 初始化响应结构 =====
        lines.append('    // ========== 初始化响应结构 ==========')
        lines.append('    Set retObj={}')
        lines.append('    d retObj.%Set("code", 0)')
        lines.append('    d retObj.%Set("msg", "请求成功")')
        lines.append('')
        lines.append('    Set dataArr=[]')
        lines.append('')

        # ★ 初始化变量注册表（所有代码路径共享）
        registry = VarRegistry()
        registry.register_batch(self.BASE_DEFINED_VARS, "base")
        registry.register_batch({"_bwcode"}, "optional_suffix")

        # ===== 3. 根据入参选择查询模式 =====
        # 从规则库模板中提取标签名（用于模式1遍历）
        tag_name = self._get_tag_name(domain_id, view_code)
        # 如果规则库模板中有标签调用（d GetXXX），使用模板中的标签名
        if traversal_config and traversal_config.template:
            import re as _re
            _tag_match = _re.search(r'd\s+([A-Za-z]\w+)', traversal_config.template)
            if _tag_match:
                tag_name = _tag_match.group(1)

        if not is_dict_domain:
            lines.append('    // ========== 根据入参选择查询模式 ==========')
            lines.append('    if (admRowId\'="") {')
            lines.append('        // 模式1：按就诊ID查询')
            lines.append('        s adm=admRowId')

            # 根据业务域选择正确的遍历逻辑
            if domain_id in ['50-lab-exam', '55-exam-report']:
                # ENS 平台表的数据（检验报告、检查报告）
                # 使用 ENS 平台表的就诊ID索引
                if domain_id == '50-lab-exam':
                    # 检验报告：使用 LISRRVisitNumberIndex 索引
                    lines.append('        ; 按就诊ID查询检验报告')
                    lines.append('        s rowId=""')
                    lines.append('        for {')
                    lines.append('            s rowId=$o(^Busi.ENS.EnsLISReportResultI("LISRRVisitNumberIndex",adm,rowId))')
                    lines.append('            Quit:rowId=""')
                    lines.append('            s data=$g(^Busi.ENS.EnsLISReportResultD(rowId))')
                    lines.append('            continue:data=""')
                    lines.append('            s patDR=$lg(data,3)')
                    lines.append(f'            d {tag_name}')
                    lines.append('        }')
                elif domain_id == '55-exam-report':
                    # 检查报告：使用 RISRVisitNumberIndex 索引
                    lines.append('        ; 按就诊ID查询检查报告')
                    lines.append('        s rowId=""')
                    lines.append('        for {')
                    lines.append('            s rowId=$o(^Busi.ENS.EnsRISReportResultI("RISRVisitNumberIndex",adm,rowId))')
                    lines.append('            Quit:rowId=""')
                    lines.append('            s data=$g(^Busi.ENS.EnsRISReportResultD(rowId))')
                    lines.append('            continue:data=""')
                    lines.append('            s patDR=$lg(data,5)')
                    lines.append(f'            d {tag_name}')
                    lines.append('        }')
            elif domain_id in ['a0-fee-settlement', 'a1-outpatient-invoice']:
                # ★ 费用结算域：按就诊ID遍历账单表
                lines.append('        ; 按就诊ID遍历账单表')
                lines.append('        s admInfo=$g(^PAADM(adm))')
                lines.append('        if admInfo\'="" {')
                lines.append('            s pbId=""')
                lines.append('            for {')
                lines.append('                s pbId=$o(^DHCPB(0,"ADM",adm,pbId))')
                lines.append('                Quit:pbId=""')
                lines.append('                s pbData=$g(^DHCPB(pbId))')
                lines.append('                continue:pbData=""')
                lines.append('                s pboChild=""')
                lines.append('                for {')
                lines.append('                    s pboChild=$o(^DHCPB(pbId,"O",pboChild))')
                lines.append('                    Quit:pboChild=""')
                lines.append('                    s pboData=$g(^DHCPB(pbId,"O",pboChild))')
                lines.append('                    s pbdChild=""')
                lines.append('                    for {')
                lines.append('                        s pbdChild=$o(^DHCPB(pbId,"O",pboChild,"D",pbdChild))')
                lines.append('                        Quit:pbdChild=""')
                lines.append('                        s pbdData=$g(^DHCPB(pbId,"O",pboChild,"D",pbdChild))')
                lines.append(f'                        d {tag_name}')
                lines.append('                    }')
                lines.append('                }')
                lines.append('            }')
                lines.append('        }')
            else:
                # 医嘱域的数据
                lines.append('        s admInfo=$g(^PAADM(adm))')
                lines.append('        if admInfo\'="" {')
                lines.append('            // 遍历该就诊的医嘱')
                lines.append('            s ordId=""')
                lines.append('            for {')
                lines.append('                s ordId=$o(^OEORD(0,"Adm",adm,ordId))')
                lines.append('                Quit:ordId=""')
                lines.append('                s ordItm=""')
                lines.append('                for {')
                lines.append('                    s ordItm=$o(^OEORD(ordId,"I",ordItm))')
                lines.append('                    Quit:ordItm=""')
                lines.append('                    s ordstr1=$g(^OEORD(ordId,"I",ordItm,1))')
                lines.append('                    continue:ordstr1=""')
                lines.append('                    s ordstr2=$g(^OEORD(ordId,"I",ordItm,2))')
                lines.append('                    s arcimDr=$p(ordstr2,"^",1)')
                lines.append(f'                    d {tag_name}')
                lines.append('                }')
                lines.append('            }')
                lines.append('        }')

            lines.append('    } else {')
            lines.append('        // 模式2：按日期范围遍历')
            lines.append('')

        # ===== 4. 按日期范围遍历（模式2） =====
        indent_prefix = '        ' if not is_dict_domain else '    '

        # === 智能遍历：根据字段来源表自动选择最优遍历路线 ===
        smart_lines = self.build_smart_traversal(
            view_code, value_results, traversal_config,
            intermediate_vars, fields, domain_id, tag_name
        )
        if smart_lines:
            # 智能遍历代码需要增加缩进
            for smart_line in smart_lines:
                lines.append(f'{indent_prefix}{smart_line}')
        elif traversal_config and traversal_config.template:
            # 使用遍历配置中的模板（域推断+自动加载）
            # 前置变量处理
            pre_var_lines = self.process_pre_variables(traversal_config)
            for pv_line in pre_var_lines:
                lines.append(f'{indent_prefix}{pv_line}')

            # 模板内容（点号→花括号语法 + 缩写全写）
            # ★ 替换模板中的日期变量为方法参数
            template_text = traversal_config.template.replace('pStartDate', 'pDateFrom').replace('pEndDate', 'pDateTo')
            template_lines, traversal_for_depth = self.convert_template(template_text, indent_prefix)
            lines.extend(template_lines)

            # ★ 补充注册模板类型特有的变量
            registry.register_batch(self.TEMPLATE_VARS.get(ens_type, set()), "template_type")

            # ★ 提取模板中循环变量和赋值变量，注册到注册表
            template_loop_vars = self._extract_template_loop_vars(traversal_config.template)
            template_assigned_vars = self._extract_template_assigned_vars(traversal_config.template)
            # ★ 从生成的模板代码中提取实际循环变量（convert_template 可能重命名）
            actual_loop_vars = set()
            for tl in template_lines:
                m = re.search(r's\s+(\w+)\s*=\s*\$o\(', tl)
                if m:
                    actual_loop_vars.add(m.group(1))
            # ★ 构建模板→实际循环变量映射
            tmpl_var_map = dict(self._VAR_MAPPING)
            tmpl_to_actual = dict(zip(sorted(template_loop_vars), sorted(actual_loop_vars)))
            for tmpl_var, actual_var in tmpl_to_actual.items():
                if tmpl_var != actual_var:
                    tmpl_var_map[tmpl_var] = actual_var
            registry.register_batch(template_loop_vars, "loop")
            registry.register_batch(actual_loop_vars, "actual_loop")
            registry.register_batch(template_assigned_vars, "template")

            # ★ 从中间变量中排除模板已定义的（循环变量 + 模板赋值变量）
            template_covered = template_loop_vars | template_assigned_vars
            if intermediate_vars and template_covered:
                intermediate_vars = {
                    k: v for k, v in intermediate_vars.items()
                    if k not in template_covered
                }
        else:
            # 无 traversal 配置匹配（不应发生，所有域都应有 traversal 配置）
            lines.append(f'{indent_prefix}// WARNING: 未找到域 {ens_type} 的遍历配置，请检查规则库 traversal 定义')

        # ===== 5. 字段取值和JSON赋值（标签代码块） =====
        # 使用与模式1遍历相同的标签名
        tag_lines = []
        tag_lines.append('')
        tag_lines.append(tag_name)
        tag_lines.append('    ; 获取字段值')
        prefix = '    '
        tag_lines.append(f'{prefix}Set dataObj={{}}')

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

        # ★ 费用结算域特殊处理：当 ordItm 被引用时，自动添加其派生变量
        # ordItm 从 pboData 获取，但 ordId/ordSub/ordstr1/ordstr2/ordstr3 需要从 ordItm 派生
        order_derived_var_names = set()
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
                order_derived_var_names.add(var_name)

        # ★ 费用/发票域：始终需要 patDR 和 hospDr（遍历模板中只有 prtData/etc，无这些基础变量）
        if domain_id in ['a0-fee-settlement', 'a1-outpatient-invoice']:
            tag_lines.append(f'{prefix}s patDR=$p($g(^PAADM(adm)),"^",1)  ; 患者DR')
            tag_lines.append(f'{prefix}s ctlocDr=$p($g(^PAADM(adm)),"^",4)  ; 科室DR')
            tag_lines.append(f'{prefix}s hospDr=$p($g(^CTLOC(ctlocDr)),"^",22)  ; 院区DR')
        else:
            # 其他域：按需定义 patDR
            if 'patDR' in referenced_vars and 'patDR' not in template_defined:
                tag_lines.append(f'{prefix}s patDR=$p($g(^PAADM(adm)),"^",1)  ; 患者DR')
            # 按需定义 hospDr
            if 'hospDr' in referenced_vars and 'hospDr' not in template_defined:
                tag_lines.append(f'{prefix}s ctlocDr=$p($g(^PAADM(adm)),"^",4)  ; 科室DR')
                tag_lines.append(f'{prefix}s hospDr=$p($g(^CTLOC(ctlocDr)),"^",22)  ; 院区DR')

        # 公共参数映射（使用类属性，跳过取值代码生成）
        common_params = {
            "YBJGJGDM": "..#OrganizCode",
            "YBJGJGMC": "..#OrganizName",
            "YLFWHDLXDM": "..#ServiceTypeCode",
        }

        # ★ 收集所有字段的表达式，使用 VarRegistry 检查依赖
        field_data = []
        todo_vars = []  # 收集需要初始化为空字符串的变量
        tmpl_var_map = dict(self._VAR_MAPPING)  # 默认变量映射

        # ★ 过滤中间变量：只保留当前接口实际使用的中间变量
        # 从遍历模板中提取已定义的循环变量
        template_defined = set()
        if traversal_config and traversal_config.template:
            template_defined = self._extract_template_assigned_vars(traversal_config.template)
            template_defined.update(self._extract_template_loop_vars(traversal_config.template))
        # 添加模式1遍历中定义的变量
        mode1_defined = {'adm', 'admInfo', 'patDR', 'rowId', 'data', 'visitNo', 'admRowId'}
        all_defined = template_defined | mode1_defined

        # 过滤中间变量：只保留在当前接口中实际被引用的变量
        # 1. 收集所有字段表达式中引用的变量
        all_expr_vars = set()
        if value_results:
            for vr in value_results:
                if vr and vr.value_expression:
                    for var in re.findall(r'\b([a-zA-Z_]\w+)\b', vr.value_expression):
                        all_expr_vars.add(var)

        # 2. 过滤中间变量：只保留被字段表达式引用的变量
        # 递归检查依赖：如果中间变量A依赖于中间变量B，且B被字段引用，则A也应该被保留
        filtered_intermediate_vars = {}
        if intermediate_vars:
            # 首先找出直接被字段引用的中间变量
            for var_name, (expr, desc) in intermediate_vars.items():
                if var_name in all_expr_vars:
                    filtered_intermediate_vars[var_name] = (expr, desc)

            # ★ 费用结算域特殊处理：将 ordItm 的派生变量也添加到 filtered_intermediate_vars 中
            if domain_id in ('a0-fee-settlement', 'a1-outpatient-invoice'):
                for var_name in order_derived_var_names:
                    if var_name in intermediate_vars and var_name not in filtered_intermediate_vars:
                        filtered_intermediate_vars[var_name] = intermediate_vars[var_name]

            # 递归检查依赖
            changed = True
            while changed:
                changed = False
                for var_name, (expr, desc) in intermediate_vars.items():
                    if var_name in filtered_intermediate_vars:
                        continue
                    # 检查这个中间变量是否被已保留的中间变量引用
                    for kept_var in list(filtered_intermediate_vars.keys()):
                        kept_expr = filtered_intermediate_vars[kept_var][0]
                        if var_name in kept_expr:
                            filtered_intermediate_vars[var_name] = (expr, desc)
                            changed = True
                            break

        # ★ 进一步过滤：只保留在当前接口中实际可用的中间变量
        # 如果中间变量依赖的变量不在 all_defined 中，则过滤掉
        # Global 名称集合（不作为变量检查）
        _GLOBAL_NAMES = {
            'PAADM', 'PAADMi', 'OEORD', 'OEORDi', 'OECPR', 'CTLOC', 'CTPCP',
            'ARCIM', 'ARC', 'INCI', 'MR', 'MRC', 'PAC', 'OEC', 'ORC',
            'DHCPB', 'DHCTARI', 'DHCTarC', 'DHCINVPRT', 'DHCBCI',
            'SSU', 'SSUSR', 'NUR', 'TCLAB', 'TEPI', 'DHC',
            'HOSP', 'ADM', 'SEX', 'BED', 'DIA', 'EPR', 'CARD',
            'IC', 'DF', 'DR', 'ORCAT', 'OSTAT', 'UOM',
        }
        final_filtered_vars = {}
        if filtered_intermediate_vars:
            for var_name, (expr, desc) in filtered_intermediate_vars.items():
                # 检查这个中间变量的表达式是否引用了未定义的变量
                expr_vars = re.findall(r'\b([a-zA-Z_]\w+)\b', expr)
                has_undefined_dep = False
                for ev in expr_vars:
                    # 跳过函数名和Global名
                    if ev.startswith('$') or ev.startswith('^'):
                        continue
                    # 跳过已知的Global名称
                    if ev in _GLOBAL_NAMES:
                        continue
                    # 如果变量不在 all_defined 中，且不是中间变量本身
                    if ev != var_name and ev not in all_defined and ev not in filtered_intermediate_vars:
                        has_undefined_dep = True
                        break
                if not has_undefined_dep:
                    final_filtered_vars[var_name] = (expr, desc)

        for i, field in enumerate(fields):
            field_name = field.get("name", "")
            field_code = field.get("code", "")
            comment = field_name if field_name else field_code
            var_name = self._to_camel_case(field_code)

            # 公共参数跳过取值代码生成
            if field_code in common_params:
                continue

            raw_expr = ""
            if value_results and i < len(value_results) and value_results[i]:
                raw_expr = value_results[i].value_expression or ""

            expr = self._extract_valid_expression(raw_expr)
            # ★ 过滤 $lg(data,N) — data 变量未注册时无效
            if expr and "$lg(data" in expr and not registry.is_defined("data"):
                expr = ""

            expr_clean = self._adapt_expression(expr, ens_type) if expr else ""
            expr_clean = self._replace_vars(expr_clean, tmpl_var_map) if expr_clean else ""
            # ★ Global名称规范化
            if expr_clean:
                expr_clean = self._normalize_global_subscripts(expr_clean)
                expr_clean = self._normalize_global_names(expr_clean)
            # ★ 时间/日期字段自动转换为使用 FormatDT 方法
            if expr_clean:
                # 检测模式：$zd(...,3)_" "_$zt(...) 或 $zd(...,3) 或 $zt(...)
                # 转换为：..FormatDT(日期, 时间)
                if '_" "_' in expr_clean:
                    # 日期+时间组合模式
                    parts = expr_clean.split('_" "_')
                    if len(parts) == 2:
                        date_part = parts[0]
                        time_part = parts[1]
                        # 提取日期表达式
                        if date_part.startswith('$zd(') and date_part.endswith(',3)'):
                            date_expr = date_part[4:-3]
                            # 提取时间表达式
                            if time_part.startswith('$zt(') and time_part.endswith(')'):
                                time_expr = time_part[4:-1]
                                expr_clean = f'..FormatDT({date_expr},{time_expr})'
                elif expr_clean.startswith('$zd(') and expr_clean.endswith(',3)'):
                    # 仅日期模式
                    date_expr = expr_clean[4:-3]
                    expr_clean = f'..FormatDT({date_expr},"")'
                elif expr_clean.startswith('$zt(') and expr_clean.endswith(')'):
                    # 仅时间模式
                    time_expr = expr_clean[4:-1]
                    expr_clean = f'..FormatDT("",{time_expr})'
                # ★ 检测字段名称中的时间/日期关键词，自动转换 $lg(data,N) 格式
                elif '$lg(data,' in expr_clean and expr_clean.endswith(')'):
                    # 检查字段名称是否包含时间/日期关键词
                    time_keywords = ['时间', 'Time', 'Sj', 'sj', 'Rq', 'rq', 'Date', 'date']
                    field_name = field.get("name", "")
                    is_time_field = any(kw in field_name for kw in time_keywords)
                    if is_time_field:
                        # 提取 $lg(data,N) 表达式
                        lg_match = re.search(r'\$lg\(data,(\d+)\)', expr_clean)
                        if lg_match:
                            lg_expr = lg_match.group(0)
                            # 根据字段名称判断是日期还是时间
                            date_keywords = ['日期', 'Date', 'Rq', 'rq']
                            is_date_field = any(kw in field_name for kw in date_keywords)
                            if is_date_field:
                                expr_clean = f'..FormatDT({lg_expr},"")'
                            else:
                                expr_clean = f'..FormatDT("",{lg_expr})'
            # ★ 分步取值：拆分复杂嵌套表达式
            if expr_clean and self._needs_step_by_step(expr_clean):
                result = self._generate_step_by_step(
                    var_name, expr_clean, comment,
                    registry, None, None, tmpl_var_map, set(), tag_lines, prefix
                )
                if isinstance(result, tuple):
                    expr_clean, step_var = result
                else:
                    expr_clean = result
            # ★ 尝试自动派生表达式中的未定义依赖
            if expr_clean:
                domain_im = self.get_domain_intermediates(domain_id)
                domain_vi = self.get_domain_var_inference(domain_id)
                self._ensure_dependencies(
                    expr_clean, registry, domain_im, domain_vi,
                    tmpl_var_map, set(), tag_lines, prefix
                )
            # ★ 使用 VarRegistry 检查表达式中的未定义变量
            missing_deps = registry.check_expression(expr_clean) if expr_clean else []
            has_undefined = len(missing_deps) > 0
            vr = value_results[i] if value_results and i < len(value_results) else None

            # 找出主中间变量（表达式中引用的最长中间变量名）
            iv = None
            if expr_clean and intermediate_vars:
                for iv_name in sorted(intermediate_vars.keys(), key=len, reverse=True):
                    if re.search(r'\b' + re.escape(iv_name) + r'\b', expr_clean):
                        iv = iv_name
                        break

            field_data.append((field_code, var_name, comment, expr_clean, has_undefined, vr, iv, missing_deps))

            # 判断是否需要初始化为空字符串
            if (not expr_clean or has_undefined):
                todo_vars.append(var_name)

        # 批量初始化变量
        # 规则：2个变量用 s var1="",var2=""；3-5个用 s (var1,var2,...)=""；超过5个分多行
        if todo_vars:
            if len(todo_vars) == 2:
                # 2个变量：s var1="",var2=""
                tag_lines.append(f'{prefix}s {todo_vars[0]}="",{todo_vars[1]}=""  ; 初始化变量')
            elif len(todo_vars) <= 5:
                # 3-5个变量：s (var1,var2,...)=""
                vars_str = ",".join(todo_vars)
                tag_lines.append(f'{prefix}s ({vars_str})=""  ; 初始化变量')
            else:
                # 超过5个变量：分多行，每行最多5个
                chunk_size = 5
                for j in range(0, len(todo_vars), chunk_size):
                    chunk = todo_vars[j:j+chunk_size]
                    if len(chunk) == 2:
                        tag_lines.append(f'{prefix}s {chunk[0]}="",{chunk[1]}=""  ; 初始化变量')
                    else:
                        vars_str = ",".join(chunk)
                        tag_lines.append(f'{prefix}s ({vars_str})=""  ; 初始化变量')

        # ★ 按主中间变量分组输出取值
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
                iv = item[6]
                groups.setdefault(iv, []).append(item)

            # 逐组输出取值
            for iv, items in groups.items():
                if iv and iv in (final_filtered_vars or {}):
                    # 有中间变量依赖，加空判断
                    tag_lines.append(f'{prefix}if ({iv}\'="") {{')
                    for item in items:
                        fc, vn, cm, ec, hu, vr, _, missing = item
                        if ec and not hu:
                            tag_lines.append(f'{prefix}    Set {vn}={ec}  ; {cm}')
                        elif vn not in todo_vars:
                            tag_lines.append(f'{prefix}    Set {vn}=""  ; {cm} TODO')
                    registry.register(vn, "field")
                    tag_lines.append(f'{prefix}}}')
                else:
                    for item in items:
                        fc, vn, cm, ec, hu, vr, _, missing = item
                        if ec and not hu:
                            # ★ 再次检查依赖（考虑同组中前面字段可能已定义的变量）
                            recheck = registry.check_expression(ec)
                            if recheck:
                                tag_lines.append(f'{prefix}Set {vn}=""  ; {cm} TODO: 缺少 {",".join(recheck)}')
                            else:
                                tag_lines.append(f'{prefix}Set {vn}={ec}  ; {cm}')
                        elif vn not in todo_vars:
                            if vr and hasattr(vr, 'resolution_status') and vr.resolution_status == "identified":
                                tag_lines.append(f'{prefix}Set {vn}=""  ; {cm} (已识别)')
                            else:
                                tag_lines.append(f'{prefix}Set {vn}=""  ; {cm} TODO')
                        registry.register(vn, "field")

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
            # 子表字段取值在子表循环内部
            tag_lines.append(f'{prefix}; 子表遍历（检验细项）')
            # 从主表data中提取关联键（通常是ReportID）
            parent_key_expr = subtable_config.parent_key_expression
            if parent_key_expr:
                tag_lines.append(f'{prefix}s reportId={parent_key_expr}  ; 主表报告ID')

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
            tag_lines.append(f'{prefix}q')
            tag_lines.append('')

            # 添加子表字段取值标签
            tag_lines.append('GetItemDetail')
            tag_lines.append('    ; 获取子表字段值')
            tag_lines.append(f'{prefix}Set dataObj={{}}')

            # 子表字段取值（使用 itemData 变量）
            # 注意：子表字段的位置与主表不同，需要重新匹配
            # 对于子表字段，使用 itemData 变量，并保持原始字段位置
            for item in field_data:
                fc, vn, cm, ec, hu, vr, _, missing = item
                # 将 data 替换为 itemData
                if ec:
                    ec_item = ec.replace('$lg(data,', '$lg(itemData,')
                    ec_item = ec_item.replace('$p(data,', '$p(itemData,')
                else:
                    ec_item = ec
                if ec_item and not hu:
                    tag_lines.append(f'{prefix}Set {vn}={ec_item}  ; {cm}')
                elif vn not in todo_vars:
                    tag_lines.append(f'{prefix}Set {vn}=""  ; {cm} TODO')

            # 子表赋值到JSON对象
            tag_lines.append('')
            tag_lines.append(f'{prefix}// 赋值到JSON对象')
            for i, field in enumerate(fields):
                field_code = field.get("code", "")
                field_name = field.get("name", "")
                comment = field_name if field_name else field_code
                var_name = self._to_camel_case(field_code)
                if field_code in common_params:
                    tag_lines.append(f'{prefix}d dataObj.%Set("{field_code}",{common_params[field_code]})  ; {comment}')
                else:
                    tag_lines.append(f'{prefix}d dataObj.%Set("{field_code}",{var_name})  ; {comment}')

            tag_lines.append('')
            tag_lines.append(f'{prefix}d dataArr.%Push(dataObj)')
            tag_lines.append(f'{prefix}q')
        else:
            # 无子表遍历：普通字段取值
            # 赋值到JSON对象
            tag_lines.append('')
            tag_lines.append(f'{prefix}// 赋值到JSON对象')
            for i, field in enumerate(fields):
                field_code = field.get("code", "")
                field_name = field.get("name", "")
                comment = field_name if field_name else field_code
                var_name = self._to_camel_case(field_code)
                # 公共参数使用类属性
                if field_code in common_params:
                    tag_lines.append(f'{prefix}d dataObj.%Set("{field_code}",{common_params[field_code]})  ; {comment}')
                else:
                    tag_lines.append(f'{prefix}d dataObj.%Set("{field_code}",{var_name})  ; {comment}')

            tag_lines.append('')
            tag_lines.append(f'{prefix}d dataArr.%Push(dataObj)')
            tag_lines.append(f'{prefix}q')

        # 关闭 For 循环
        if traversal_config and traversal_config.template:
            # 模板模式：关闭 convert_template 中未关闭的 For 循环
            # 从内到外逐层关闭，缩进逐层减少
            # indent_prefix 是最外层的缩进（如 '        ' = 8sp）
            # 最内层的缩进 = indent_prefix + '    ' * (traversal_for_depth - 1)
            # 每关闭一层，缩进减少4个空格
            base_indent_len = len(indent_prefix)
            for i in range(traversal_for_depth):
                # 从内到外：第0次关闭最内层，第1次关闭次内层，...
                # 最内层缩进 = base_indent_len + 4 * (traversal_for_depth - 1)
                # 第i次关闭的缩进 = base_indent_len + 4 * (traversal_for_depth - 1 - i)
                indent_len = base_indent_len + 4 * (traversal_for_depth - 1 - i)
                close_indent = ' ' * indent_len
                lines.append(f'{close_indent}}}')
        else:
            # 非模板模式：关闭手动生成的 For 循环
            lines.append(f'{indent_prefix}}}')
            if ens_type == "OEORD":
                lines.append(f'{indent_prefix}}}')


        # 关闭双模式括号
        if not is_dict_domain:
            lines.append('    }  ; end if admRowId')
            lines.append('')

        # ===== 6. 输出JSON响应 =====
        lines.append('')
        lines.append(f'{prefix}d retObj.%Set("data", dataArr)')
        lines.append(f'{prefix}d stream.Write(retObj.%ToJSON())')
        lines.append(f'{prefix}Quit stream')
        lines.append('')

        # 生成标签代码块
        tag_block = '\n'.join(tag_lines)

        return '\n'.join(lines), tag_block

    def _is_valid_expression(self, expr: str) -> bool:
        """检查表达式是否有效（过滤无效表达式）

        无效表达式包括：
        1. 纯中文描述（如"待补充"、"见条件逻辑"）
        2. 包含中文注释的表达式（需要提取有效部分）
        3. 包含反引号包裹的中文描述
        4. 语法明显错误
        """
        if not expr:
            return False

        # 清理表达式
        clean = expr.strip().strip('`')

        # 纯中文描述
        if re.match(r'^[一-龥\s（）()、，。]+$', clean):
            return False

        # 包含"输入参数"等描述
        if '输入参数' in clean or '待补充' in clean or '见条件' in clean:
            return False

        # 包含中文的反引号描述（如 `admRowId` (输入参数)`）
        if re.search(r'[一-龥]', clean) and '`' in expr:
            return False

        return True

    def _extract_valid_expression(self, expr: str) -> str:
        """从表达式中提取有效部分

        处理情况：
        1. 包含分号注释：提取分号前的部分
        2. 包含反引号描述：提取反引号外的部分
        3. 纯中文描述：返回空字符串
        4. 包含中文字符串常量的有效表达式：保留
        5. 含→的数据流链描述：返回空字符串（不是ObjectScript代码）
        6. 含?占位符的待补充表达式：返回空字符串
        """
        if not expr:
            return ""

        # 清理反引号
        clean = expr.strip().strip('`')

        # 检查是否是纯中文描述（没有ObjectScript语法）
        if re.match(r'^[一-龥\s（）()、，。]+$', clean):
            return ""

        # ★ 过滤数据流链描述：含→符号的是文档描述，不是可执行的ObjectScript代码
        # 例如: ^INCI(inci,1)^3 → arcSub||arcVer → ^ARCIM(arcSub,arcVer,1)^9
        if '→' in clean:
            return ""

        # ★ 过滤含?占位符的表达式（如 $p(...,"^",?) 或纯?描述）
        # ? 表示规则库中 Piece 编号未知，生成的代码无法编译
        if '?' in clean:
            return ""

        # 提取分号前的部分（去除中文注释）
        if ';' in clean:
            expr_part = clean.split(';')[0].strip()
            if expr_part and not re.match(r'^[一-龥]', expr_part):
                return expr_part

        # 包含中文的表达式（如 $case(...,"门诊",...,"住院",...)）
        # 这类表达式是有效的，保留
        if re.search(r'[一-龥]', clean):
            # 检查是否是有效的ObjectScript表达式（$开头的函数调用）
            if re.match(r'^\$[a-zA-Z]+\(', clean):
                return clean
            # 检查是否是包含$函数的复杂表达式
            if re.search(r'\$[a-zA-Z]+\(', clean):
                return clean
            # 其他包含中文的表达式，返回空
            return ""

        return clean

    @staticmethod
    def _extract_template_loop_vars(template: str) -> set:
        """从遍历模板中提取循环变量名

        模板中的 For 循环变量（如 ordItm、sub、execSub）由模板自身定义，
        不应被中间变量推断规则重新生成，否则会覆盖循环逻辑。

        匹配模式（模板用点号缩进，需先去除）：
        - f  s varName=$o(...) q:varName=""  d  → 提取 varName
        - f varName=expr:expr:expr d           → 提取 varName
        """
        loop_vars = set()
        if not template:
            return loop_vars

        for line in template.strip().split('\n'):
            # 去除点号缩进和前后空格
            stripped = line.lstrip(' .').strip()
            # 模式1: f  s varName=$o(...) q:varName=""  d
            m = re.match(r'^f\s+s\s+(\w+)\s*=\s*\$o\(', stripped)
            if m:
                loop_vars.add(m.group(1))
            # 模式2: f varName=expr:expr:expr d
            m = re.match(r'^f\s+(\w+)=', stripped)
            if m:
                loop_vars.add(m.group(1))

        return loop_vars

    @staticmethod
    def _extract_template_assigned_vars(template: str) -> set:
        """从遍历模板中提取所有被赋值的变量名

        模板中 `s varName=...` 或 `Set varName=...` 的行表示该变量由模板赋值，
        中间变量不应重复定义这些变量。

        匹配模式（模板用点号缩进，需先去除）：
        - s ordstr1=$g(...)   → 提取 ordstr1
        - Set ordstr2=$g(...) → 提取 ordstr2
        - s data=$g(...)      → 提取 data
        """
        assigned = set()
        if not template:
            return assigned

        for line in template.strip().split('\n'):
            stripped = line.lstrip(' .').strip()
            # 匹配 s/Set 变量赋值（排除 for 循环行）
            if re.match(r'^f\s', stripped):
                continue
            m = re.match(r'^[sS](?:et)?\s+(\w+)\s*=', stripped)
            if m:
                assigned.add(m.group(1))

        return assigned

    def _needs_step_by_step(self, expr: str) -> bool:
        """判断表达式是否需要分步取值

        需要分步取值的条件：
        1. 包含多层嵌套的 $p($g(^GLOBAL(...))) 模式
        2. 包含 $p($g(^GLOBAL($lg(...))) 模式（Global内使用$lg取值）
        3. 嵌套层数 >= 2

        Args:
            expr: 表达式

        Returns:
            True 如果需要分步取值
        """
        if not expr:
            return False

        # 模式1：统计 $p($g(^ 开头的嵌套层数
        nested_count = len(re.findall(r'\$p\(\$g\(\^', expr))
        if nested_count >= 2:
            return True

        # 模式2：$p($g(^GLOBAL($lg(...))) - Global内使用$lg取值
        # 例如：$p($g(^CTLOC($lg(data,12))),"^",2)
        if re.search(r'\$p\(\$g\(\^[A-Z]+\(\$lg\(', expr):
            return True

        # 模式3：$p($g(^GLOBAL($p(...))) - Global内使用$p取值
        # 例如：$p($g(^CTLOC($p($g(^PAADM(adm)),"^",4))),"^",2)
        if re.search(r'\$p\(\$g\(\^[A-Z]+\(\$p\(', expr):
            return True

        return False

    def _auto_resolve_field(self, var_name: str, registry, domain_intermediates: dict,
                            domain_var_inference: dict, var_map: dict,
                            derived_vars_generated: set, lines: list, indent: str) -> Optional[str]:
        """自动派生未匹配字段：从域中间变量库查找取值链路

        当 L1 规则库未命中时，尝试：
        1. 在 _DOMAIN_INTERMEDIATES 中查找变量定义
        2. 递归解析依赖链，生成所有中间变量
        3. 返回最终表达式

        Args:
            var_name: 字段变量名
            registry: 变量注册表
            domain_intermediates: 域中间变量库
            domain_var_inference: 域变量推断规则
            var_map: 变量名映射
            derived_vars_generated: 已生成的派生变量集合
            lines: 输出代码行列表
            indent: 缩进

        Returns:
            取值表达式字符串，无法解析返回 None
        """
        # 查找变量定义（优先 intermediates，回退 var_inference）
        var_def = domain_intermediates.get(var_name) or domain_var_inference.get(var_name)
        if not var_def:
            return None

        expr, desc = var_def
        expr = self._replace_vars(expr, var_map)

        # 递锥解析依赖：确保表达式中的所有变量都已定义
        self._ensure_dependencies(
            expr, registry, domain_intermediates, domain_var_inference,
            var_map, derived_vars_generated, lines, indent
        )

        # 检查是否所有依赖都满足
        missing = registry.check_expression(expr)
        if missing:
            return None

        return expr

    def _generate_step_by_step(self, var_name: str, expr: str, desc: str,
                               registry, domain_intermediates: dict,
                               domain_var_inference: dict, var_map: dict,
                               derived_vars_generated: set, lines: list, indent: str) -> str:
        """分步取值：将复杂嵌套表达式拆分为多步，每步添加空判断

        支持的模式：
        1. $p($g(^GLOBAL($p($g(^GLOBAL(...)),"^",N))),"^",M) - 双重Global嵌套
        2. $p($g(^GLOBAL($lg(data,N))),"^",M) - Global内使用$lg取值

        例如：
        Set jcbgSqks=$p($g(^CTLOC($lg(data,12))),"^",2)

        拆分为：
        Set deptDr=$lg(data,12)  ; 申请科室DR
        if (deptDr'="") {
            Set jcbgSqks=$p($g(^CTLOC(deptDr)),"^",2)  ; 申请科室名称
        }

        Args:
            var_name: 目标变量名
            expr: 原始表达式
            desc: 变量描述
            registry: 变量注册表
            domain_intermediates: 域中间变量库
            domain_var_inference: 域变量推断规则
            var_map: 变量名映射
            derived_vars_generated: 已生成的派生变量集合
            lines: 输出代码行列表
            indent: 缩进

        Returns:
            最终取值表达式（简化后的）
        """
        import logging
        logger = logging.getLogger(__name__)
        logger.debug(f"[_generate_step_by_step] Processing: {var_name} = {expr}")

        # 模式1：$p($g(^GLOBAL($lg(data,N))),"^",M) - Global内使用$lg取值
        # 例如：$p($g(^CTLOC($lg(data,12))),"^",2)
        lg_pattern = r'\$p\(\$g\(\^([A-Z]+)\(\$lg\((\w+),(\d+)\)\)\),"([^"]+)",(\d+)\)'
        lg_match = re.search(lg_pattern, expr)

        if lg_match:
            global_name = lg_match.group(1)      # Global 名（如 CTLOC）
            data_var = lg_match.group(2)          # 数据变量（如 data）
            list_idx = lg_match.group(3)          # 列表索引（如 12）
            sep = lg_match.group(4)               # 分隔符
            piece_num = lg_match.group(5)         # Piece 编号

            # 生成中间变量名（如 deptDr）
            step_var_name = f"{global_name.lower()}Dr"

            # 第一步：取 $lg(data,N) 的值
            inner_expr = f'$lg({data_var},{list_idx})'
            step_desc = f"{desc}DR"
            lines.append(f'{indent}Set {step_var_name}={inner_expr}  ; {step_desc}')
            registry.register(step_var_name, "step")

            # 返回带空判断的最终表达式
            # 注意：空判断在分组输出时已经处理，这里只返回表达式
            final_expr = f'$p($g(^{global_name}({step_var_name})),"{sep}",{piece_num})'
            logger.debug(f"[_generate_step_by_step] Generated: Set {step_var_name}={inner_expr}")
            logger.debug(f"[_generate_step_by_step] Final expr: {final_expr}")
            return final_expr

        # 模式2：$p($g(^GLOBAL($p($g(^GLOBAL(...)),"^",N))),"^",M) - 双重Global嵌套
        inner_pattern = r'\$p\(\$g\(\^([A-Z]+)\(([^)]+)\)\),"([^"]+)",(\d+)\)'
        matches = list(re.finditer(inner_pattern, expr))

        if len(matches) >= 2:
            # 最内层匹配
            inner_match = matches[0]
            inner_global = inner_match.group(1)
            inner_subscript = inner_match.group(2)
            inner_sep = inner_match.group(3)
            inner_num = inner_match.group(4)

            # 外层匹配
            outer_match = matches[-1]
            outer_global = outer_match.group(1)
            outer_sep = outer_match.group(3)
            outer_num = outer_match.group(4)

            # 生成中间变量名
            step_var_name = f"{inner_global.lower()}SubCatRowID"

            # 第一步：取内层表达式的值
            inner_expr = f'$p($g(^{inner_global}({inner_subscript})),"{inner_sep}",{inner_num})'
            step_desc = f"{desc}中间步骤"
            lines.append(f'{indent}Set {step_var_name}={inner_expr}  ; {step_desc}')
            registry.register(step_var_name, "step")

            # 返回最终表达式
            final_expr = f'$p($g(^{outer_global}({step_var_name})),"{outer_sep}",{outer_num})'
            logger.debug(f"[_generate_step_by_step] Generated: Set {step_var_name}={inner_expr}")
            logger.debug(f"[_generate_step_by_step] Final expr: {final_expr}")
            return final_expr

        # 无法识别的模式，返回原表达式
        logger.debug(f"[_generate_step_by_step] Unknown pattern, returning original")
        return expr

    def _ensure_dependencies(self, expr: str, registry, domain_intermediates: dict,
                              domain_var_inference: dict, var_map: dict,
                              derived_vars_generated: set, lines: list, indent: str):
        """递锥确保表达式中的所有依赖变量都已定义

        对于每个未定义的依赖变量：
        1. 在域中间变量库中查找定义
        2. 递锥解析其自身的依赖
        3. 生成取值代码并注册
        """
        if not expr:
            return

        # 去除字符串和 Global 名
        clean = re.sub(r'"[^"]*"', '""', expr)
        clean = re.sub(r'\^[A-Za-z][A-Za-z0-9]+', '', clean)

        for dep_var in re.findall(r'\b([A-Za-z_][A-Za-z0-9_]*)\b', clean):
            if registry.is_non_var(dep_var) or registry.is_defined(dep_var):
                continue
            if dep_var in derived_vars_generated:
                continue

            # 查找依赖变量的定义
            dep_def = domain_intermediates.get(dep_var) or domain_var_inference.get(dep_var)
            if not dep_def:
                continue

            dep_expr, dep_desc = dep_def
            dep_expr = self._replace_vars(dep_expr, var_map)

            # 递锥：先确保依赖的依赖
            derived_vars_generated.add(dep_var)
            self._ensure_dependencies(
                dep_expr, registry, domain_intermediates, domain_var_inference,
                var_map, derived_vars_generated, lines, indent
            )

            # 生成依赖变量的取值代码
            dep_missing = registry.check_expression(dep_expr)
            if not dep_missing:
                lines.append(f'{indent}Set {dep_var}={dep_expr}  ; {dep_desc}')
                registry.register(dep_var, "auto_derived")

    def _adapt_expression(self, expr: str, ens_type: str = "RIS") -> str:
        """适配表达式到方法体上下文

        替换规则库中的通用变量名为当前上下文的变量名。
        包含：变量映射 + 外部类属性双引号 + 操作符空格修复。
        """
        # 变量映射：规则库中的变量名 -> 方法体中的变量名
        var_map = {
            "AdmNo": "admRowId",
            "admRowId": "admRowId",
            "admId": "admRowId",
            "PatRowId": "patDR",
            "PatRowID": "patDR",
            "patRowId": "patDR",
            "tPatDR": "patDR",
            "PapmiDR": "patDR",
            # 挂号域变量
            "regId": "rowId",
            "RegId": "rowId",
            # 诊断域变量
            "MRADM": "mradm",
            "mradm": "mradm",
            "DIA_SUB": "sub",
            "diaSub": "sub",
            "ICD_CODE_DR": "icdDr",
            "icdDr": "icdDr",
            # 费用域变量
            "PBID": "pbId",
            "pbId": "pbId",
        }

        result = expr
        for old_var, new_var in var_map.items():
            result = re.sub(r'\b' + re.escape(old_var) + r'\b', new_var, result)

        # 挂号域特殊处理：将通用的 deptDr 替换为 $lg(data,12)
        if ens_type == "REG":
            # 将 deptDr 替换为 $lg(data,12)
            result = re.sub(r'\bdeptDr\b', '$lg(data,12)', result)
            # 将 docDr 替换为 $lg(data,13)
            result = re.sub(r'\bdocDr\b', '$lg(data,13)', result)
            # 将 sessionTypeDr 替换为 $lg(data,18)
            result = re.sub(r'\bsessionTypeDr\b', '$lg(data,18)', result)
            # 将 hospDr 替换为 $p($g(^CTLOC($lg(data,12))),"^",22)
            result = re.sub(r'\bhospDr\b', '$p($g(^CTLOC($lg(data,12))),"^",22)', result)

        # 应用P0规则：外部类属性双引号 + 操作符空格修复
        result = self._quote_external_properties(result)
        result = self._fix_operator_spaces(result)
        return result

    def build_smart_traversal(self, view_code: str, value_results: list,
                               traversal_config, intermediate_vars: dict,
                               fields: list, domain_id: str, tag_name: str = "GetDataRow") -> Optional[list]:
        """智能遍历构建：根据业务语义自动选择最优遍历路线

        核心逻辑：
        1. 分析字段来源表（从L1表达式中提取引用的Global）
        2. 选择覆盖最多字段的表作为主遍历表
        3. 构建遍历代码（支持复合遍历）

        Returns:
            遍历代码行列表，或 None（无法确定策略时回退到模板）
        """
        # ★ 如果遍历配置已经选择了 dateRange 模式，直接返回 None 使用规则库模板
        # 因为 dateRange 模式需要三层循环（日期→就诊→医嘱），智能遍历只支持两层
        if traversal_config and traversal_config._selected_mode == "dateRange":
            return None

        strategy = TraversalStrategySelector.select_strategy(
            view_code, value_results, traversal_config
        )
        if not strategy:
            return None

        lines = []
        # 支持 pDateFrom 和 pStartDate 两种日期参数名
        is_date_range = any(idx.get("input") in ("pDateFrom", "pStartDate") for idx in strategy.indexes)

        # ★ 医嘱域（40-order）的日期范围遍历需要三层循环（日期→就诊→医嘱）
        # 智能遍历只支持两层，因此返回 None 让系统使用规则库模板
        if domain_id == "40-order" and is_date_range:
            return None

        # 选择最佳索引（优先日期范围索引，回退到就诊索引）
        best_index = None
        if is_date_range:
            for idx in strategy.indexes:
                if idx.get("input") in ("pDateFrom", "pStartDate"):
                    best_index = idx
                    break
        if not best_index and strategy.indexes:
            best_index = strategy.indexes[0]

        if not best_index:
            return None

        # 构建外层循环
        if is_date_range:
            lines.append(f'    // 按日期遍历 {strategy.primary}')
            lines.append(f'    for date=pDateFrom:1:pDateTo {{')
            loop_var = best_index["params"][1] if len(best_index["params"]) > 1 else "rowId"
            lines.append(f'        s {loop_var}=""')
            lines.append(f'        for {{')
            lines.append(f'            s {loop_var}=$o({best_index["global"]})')
            lines.append(f'            Quit:{loop_var}=""')
            indent = "            "
        else:
            loop_var = best_index["params"][1] if len(best_index["params"]) > 1 else "rowId"
            lines.append(f'    // 按就诊遍历 {strategy.primary}')
            lines.append(f'    s {loop_var}=""')
            lines.append(f'    for {{')
            lines.append(f'        s {loop_var}=$o({best_index["global"]})')
            lines.append(f'        Quit:{loop_var}=""')
            indent = "        "

        # 读取主表数据
        data_expr = f'$g({strategy.primary}({loop_var}))'
        # 根据表名调整数据读取表达式
        if strategy.primary == "^PAADM":
            data_expr = f'$g(^PAADM({loop_var}))'
        elif strategy.primary == "^DHCPB":
            data_expr = f'$g(^DHCPB({loop_var}))'
        elif strategy.primary == "^OEORD":
            data_expr = f'$g(^OEORD({loop_var}))'
        elif "DHCRegistrationFee" in strategy.primary:
            data_expr = f'$g(^User.DHCRegistrationFeeD({loop_var}))'

        lines.append(f'{indent}s {strategy.data_var}={data_expr}')
        lines.append(f'{indent}Continue:{strategy.data_var}=""')

        # 关联就诊信息（如果需要）
        if strategy.primary != "^PAADM":
            # 从主表获取就诊DR
            adm_expr = self._get_adm_from_table(strategy.primary, loop_var, strategy.data_var)
            if adm_expr:
                lines.append(f'{indent}s adm={adm_expr}')
                lines.append(f'{indent}s admData=$g(^PAADM(adm))')

        # 复合遍历（子表）— 每层使用各自的循环变量
        composites = strategy.composites or []
        for comp in composites:
            child_global = comp.get("child", "")
            child_var = comp.get("var", "data")
            # ★ 从 child 表达式中提取循环变量（最内层 subscript）
            # ^DHCPB(pbId,"O",pboChild) → pboChild
            # ^OEORD(ordId,"I",ordItm) → ordItm
            inner_var_match = re.search(r',\s*(\w+)\)', child_global)
            loop_var_name = inner_var_match.group(1) if inner_var_match else "sub"
            lines.append(f'')
            lines.append(f'{indent}// 遍历子表: {child_global}')
            lines.append(f'{indent}s {loop_var_name}=""')
            lines.append(f'{indent}for {{')
            lines.append(f'{indent}    s {loop_var_name}=$o({child_global})')
            lines.append(f'{indent}    Quit:{loop_var_name}=""')
            lines.append(f'{indent}    s {child_var}=$g({child_global})')
            lines.append(f'{indent}    Continue:{child_var}=""')
            indent = indent + "    "

        # === 以下代码在最内层循环体中 ===

        # ★ 调用标签代码块（复用公共取值逻辑）
        lines.append(f'{indent}d {tag_name}')

        # 关闭所有循环（从最内层到最外层）
        for comp in composites:
            child_global = comp.get("child", "")
            inner_var_match = re.search(r',\s*(\w+)\)', child_global)
            loop_var_name = inner_var_match.group(1) if inner_var_match else "sub"
            indent = indent[:-4]
            lines.append(f'{indent}}}  ; for {loop_var_name}')

        if is_date_range:
            lines.append(f'        }}  ; for {loop_var}')
            lines.append(f'    }}  ; for date')
        else:
            lines.append(f'    }}  ; for {loop_var}')

        return lines

    @staticmethod
    def _get_adm_from_table(table_global: str, row_var: str, data_var: str) -> str:
        """从主表数据中获取就诊DR的表达式"""
        _TABLE_ADM_MAP = {
            "^DHCINVPRT": f'$p({data_var},"^",44)',     # PRT_Adm_DR → PAADM (^44=就诊DR)
            "^DHCPB": f'$p({data_var},"^",1)',           # PB_Adm_DR → PAADM
            "^OEORD": f'$p($g(^OEORD({row_var})),"^",1)',  # OEORD_Adm_DR
            "^User.DHCRegistrationFee": f'$lg({data_var},1)',  # RegfeeAdmDr
        }
        return _TABLE_ADM_MAP.get(table_global, "")

    def _has_undefined_vars(self, expr: str, ens_type: str = "RIS",
                            intermediate_vars: dict = None) -> bool:
        """检查表达式中是否有方法体未定义的变量"""
        defined = self.BASE_DEFINED_VARS | self.TEMPLATE_VARS.get(ens_type, set())
        if intermediate_vars:
            defined |= set(intermediate_vars.keys())
        vars_in_expr = set(re.findall(r'\b([a-zA-Z_]\w+)\b', expr))
        for v in list(vars_in_expr):
            if (v in defined or
                v in self.GLOBAL_NAMES or
                v in self.OS_FUNCTIONS or
                v[0] == '^' or v[0] == '"' or v[0].isdigit() or
                (v.isupper() and len(v) > 2 and '_' not in v)):
                vars_in_expr.discard(v)
        return len(vars_in_expr) > 0

    def _build_payment_method_traversal(self, fields, value_results,
                                         intermediate_vars, domain_id) -> list:
        """构建支付方式接口的 DHCINVPRT→PayMode 两层遍历代码

        直接使用 ^DHCINVPRT(0,"Date",date) 日期索引遍历发票，
        再遍历每张发票的支付方式子表。简洁高效。

        两层遍历：
        1. DHCINVPRT 按日期索引遍历发票
        2. DHCINVPRT(prtRowId,"P",sub) 遍历发票的支付方式
        """
        lines = []
        prefix = "                "  # 最内层循环体缩进（16空格）

        # 外层：DHCINVPRT 按日期索引遍历
        lines.append('    // 外层：按日期遍历发票')
        lines.append('    for date=pDateFrom:1:pDateTo {')
        lines.append('        s prtRowId=""')
        lines.append('        for {')
        lines.append('            s prtRowId=$o(^DHCINVPRT(0,"Date",date,prtRowId))')
        lines.append('            Quit:prtRowId=""')
        lines.append('            s prtData=$g(^DHCINVPRT(prtRowId))')
        lines.append('            Continue:prtData=""')
        lines.append('            s prtFlag=$p(prtData,"^",8)')
        lines.append('            Continue:prtFlag\'="N"  ; 只取正常收费(N=Normal)')
        lines.append('')

        # 关联就诊信息（从发票获取就诊ID）
        lines.append('            // 从发票关联就诊信息')
        lines.append('            s admRowId=$p(prtData,"^",3)  ; 发票→就诊DR')
        lines.append('            s admData=$g(^PAADM(admRowId))')
        lines.append('            Continue:admData=""')
        lines.append('')

        # 内层：遍历发票的支付方式
        lines.append('            // 内层：遍历发票的支付方式')
        lines.append('            s paySub=""')
        lines.append('            for {')
        lines.append('                s paySub=$o(^DHCINVPRT(prtRowId,"P",paySub))')
        lines.append('                Quit:paySub=""')
        lines.append('                s payData=$g(^DHCINVPRT(prtRowId,"P",paySub))')
        lines.append('                Continue:payData=""')
        lines.append('')

        # 中间变量
        lines.append(f'{prefix}// 中间变量')
        if intermediate_vars:
            sorted_vars = self._sort_vars_by_dependency(intermediate_vars)
            for var_name in sorted_vars:
                expr, desc = intermediate_vars[var_name]
                expr = self._replace_vars(expr, self._VAR_MAPPING)
                lines.append(f'{prefix}Set {var_name}={expr}  ; {desc}')
        lines.append('')

        # 字段取值
        lines.append(f'{prefix}Set dataObj={{}}')
        lines.append(f'{prefix}// 字段取值')

        # 批量初始化未匹配变量
        todo_vars = []
        for i, field in enumerate(fields):
            field_code = field.get("code", "")
            var_name = self._to_camel_case(field_code)
            vr = value_results[i] if i < len(value_results) else None
            raw_expr = vr.value_expression if vr and vr.value_expression else ""
            if not raw_expr:
                todo_vars.append(var_name)

        if todo_vars:
            if len(todo_vars) <= 5:
                lines.append(f'{prefix}s ({",".join(todo_vars)})=""  ; 初始化变量')
            else:
                for j in range(0, len(todo_vars), 5):
                    chunk = todo_vars[j:j+5]
                    lines.append(f'{prefix}s ({",".join(chunk)})=""  ; 初始化变量')

        # 逐字段取值
        for i, field in enumerate(fields):
            field_code = field.get("code", "")
            field_name = field.get("name", "")
            var_name = self._to_camel_case(field_code)
            comment = field_name or field_code
            vr = value_results[i] if i < len(value_results) else None
            raw_expr = vr.value_expression if vr and vr.value_expression else ""
            expr = self._extract_valid_expression(raw_expr) if raw_expr else ""
            if expr:
                expr_clean = self._adapt_expression(expr, domain_id)
                lines.append(f'{prefix}Set {var_name}={expr_clean}  ; {comment}')

        # 赋值到 JSON 对象
        lines.append('')
        lines.append(f'{prefix}// 赋值到JSON对象')
        for field in fields:
            field_code = field.get("code", "")
            field_name = field.get("name", "")
            var_name = self._to_camel_case(field_code)
            comment = field_name or field_code
            lines.append(f'{prefix}d dataObj.%Set("{field_code}",{var_name})  ; {comment}')

        lines.append('')
        lines.append(f'{prefix}d dataArr.%Push(dataObj)')

        # 关闭两层循环
        lines.append('            }  ; for paySub')
        lines.append('        }  ; for prtRowId')
        lines.append('    }  ; for date')

        return lines

    def _render_code(self, package_path: str, view_code: str,
                     view_name: str, method_name: str,
                     method_body: str, tag_block: str = None) -> str:
        """渲染完整代码

        JSON接口统一入参格式：input As %String（JSON字符串）
        入参JSON格式：
        - 按日期范围查询: {"startDate":"2025-01-01","endDate":"2025-01-31","hospitalId":"1"}
        - 按就诊ID查询: {"admRowId":"123"}
        """
        now = datetime.now().strftime("%Y-%m-%d")
        author = self.author

        # 标签代码块
        tag_section = tag_block if tag_block else ""

        # 检测是否为日期范围模式
        is_date_range = 'pDateFrom' in method_body and 'pDateTo' in method_body

        if is_date_range:
            input_example = '{{"startDate":"2025-01-01","endDate":"2025-01-31","hospitalId":"1"}}'
        else:
            input_example = '{{"admRowId":"123"}}'

        code = f"""Class {package_path} Extends %RegisteredObject
{{

/// ======================================================================
/// {package_path}
/// 接口说明：{view_name}（JSON格式）
///
/// 数据来源: DHC HIS 系统 Global 结构说明
///
/// Package:   {package_path}
/// Author:    {author}
/// Date:      {now}
/// ======================================================================

/// desc: 获取{view_name}
/// params: input: JSON格式入参字符串
/// return: %GlobalCharacterStream (JSON格式)
/// === 调试命令 ===
/// [终端/Portal运行]:
///     w ##class({package_path}).{method_name}("{input_example}").Read()
ClassMethod {method_name}(input As %String) As %GlobalCharacterStream
{{
    s stream=##class(%GlobalCharacterStream).%New()
    s $zt="err"

    // ========== 解析JSON入参 ==========
    s inputObj={{}}.%FromJSON(input)
    // 提取通用参数
    s admRowId=inputObj.%Get("admRowId","")
    s startDate=inputObj.%Get("startDate","")
    s endDate=inputObj.%Get("endDate","")
    s hospitalId=inputObj.%Get("hospitalId","")
    // 兼容遍历模板中的变量名
    s pHospitalId=hospitalId

{method_body}

{tag_section}
err
    s $zt=""
    s retObj={{}}
    d retObj.%Set("code",99)
    d retObj.%Set("msg","系统错误:"_$ze)
    d retObj.%Set("data",[])
    d stream.Write(retObj.%ToJSON())
    q stream
}}

/// ========== 公共工具方法 ==========
/// 日期格式化：H格式 -> YYYY-MM-DD
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
