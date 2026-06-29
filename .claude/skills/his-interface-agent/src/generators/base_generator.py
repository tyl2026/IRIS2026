"""代码生成器公共基类

提供三个生成器（Query/JSON/XML）共享的核心能力：
1. 业务域自动推断（从L1匹配结果）
2. 按域加载遍历配置
3. 域特定中间变量库
4. 域变量推断规则
5. 变量名映射
6. 模板点号→空格转换 + 缩写命令展开

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
from collections import Counter
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from ..value_engine.engine import ValueResult
from .traversal_loader import TraversalConfig, TraversalLoader, get_traversal_loader


class VarRegistry:
    """变量注册表 — 追踪代码生成过程中所有已定义的变量

    解决核心问题：变量先使用后定义。
    通过维护一个动态的"已定义变量"集合，在生成每行代码前检查依赖是否可用。

    使用流程：
    1. 初始化时注册参数和基础变量
    2. 模板生成后注册模板赋值的变量
    3. 每个中间变量输出前检查依赖，注册自身
    4. 每个字段取值表达式输出前检查依赖
    """

    # ObjectScript 内置函数/命令/操作符（不作为变量检查）
    OS_BUILTINS = {
        # 函数
        'g', 'p', 'lg', 'lb', 'zd', 'zt', 'zdh', 'zdt', 'zdth',
        'replace', 'tr', 'e', 'length', 'find', 'extract', 'piece',
        'list', 'listget', 'listlength', 'listfind', 'listnext',
        'data', 'order', 'o', 'd', 'get', 'increment', 'lock',
        'case', 'select', 'justify', 'translate', 'char', 'ascii',
        'text', 'fnumber', 'random', 'horolog', 'now', 'timestamp',
        'classname', 'parameter', 'classmethod', 'method', 'property',
        'isvaliddouble', 'isvalidnum', 'normalize', 'number',
        'qcompile', 's', 'stack', 'io', 'job', 'system', 'version',
        'zsearch', 'zutil', 'zf', 'zh',
        # 命令
        'set', 'do', 'if', 'for', 'quit', 'write', 'read', 'kill',
        'new', 'merge', 'open', 'close', 'use', 'hang', 'job',
        'lock', 'unlock', 'tstart', 'tcommit', 'trollback',
        'break', 'continue', 'goto', 'halt', 'return', 'throw',
        'try', 'catch', 'while', 'until', 'else',
        # 缩写命令
        's', 'd', 'i', 'f', 'q', 'w', 'r', 'k', 'n', 'm',
        'o', 'c', 'u', 'h', 'j', 'l', 'b', 'g', 'e', 't',
        # 其他
        'stream', 'String', 'Status', 'Get', 'Set', 'AtEnd',
        'Class', 'ClassMethod', 'Method', 'Property', 'Parameter',
        'qHandle', 'repid', 'ind', 'Data', 'Row',
        'TRUE', 'FALSE', 'NULL', 'null',
    }

    # Global 名称（不作为变量检查）
    GLOBAL_NAMES = {
        'PAADM', 'PAADMi', 'PAPER', 'CTLOC', 'CTPCP', 'OEORD', 'OEORDi',
        'OECPR', 'OEC', 'ARC', 'ARCIM', 'INCI', 'MR', 'MRC', 'PAC',
        'ORC', 'NUR', 'TCLAB', 'TEPI', 'DHC', 'DHCTarC', 'DHCBill',
        'DHCBTarItem', 'DHCTARI', 'DHCPB', 'SSU', 'SSUSR',
        'Busi', 'ENS', 'EnsRISReportResultD', 'EnsRISReportResultI',
        'EnsLISReportResultD', 'EnsLISReportResultI',
        'EnsRISItemResultD', 'EnsRISItemResultI',
        'EnsLISItemResultD', 'EnsLISItemResultI',
        'EnsRISExamReportD', 'EnsRISExamReportI',
        'CacheTemp', 'BLScatterData', 'DHCDocOrderCommon',
        'UtilMethod', 'Nur', 'NIS', 'CIS', 'AN',
        'User', 'DHCRegistrationFee', 'DHCRegistrationFeeD', 'DHCRegistrationFeeI',
        'MRC', 'DHCINICT',
        'HOSP', 'ADM', 'SEX', 'BED', 'DIA', 'EPR', 'CARD',
        'ALL', 'PAT', 'PER', 'IC', 'ORCAT', 'OSTAT', 'DEP',
        'I', 'X', 'DF', 'UOM', 'DR', 'SESS',
        'TCLAB', 'SPEC',
    }

    # 字典类变量名前缀（非业务变量，排除）
    DICT_PREFIXES = {
        'admRowId', 'patDR', 'admData', 'dataObj', 'dataArr',
        'retObj', 'stream', 'rowId', 'date',
    }

    def __init__(self):
        self._defined: Dict[str, str] = {}

    def register(self, name: str, source: str = "manual"):
        """注册一个已定义的变量"""
        self._defined[name] = source

    def register_batch(self, names, source: str = "manual"):
        """批量注册变量"""
        for n in names:
            self._defined[n] = source

    def is_defined(self, name: str) -> bool:
        """检查变量是否已定义"""
        return name in self._defined

    def get_defined_set(self) -> set:
        """获取所有已定义变量名"""
        return set(self._defined.keys())

    def is_non_var(self, name: str) -> bool:
        """判断是否是非变量标识符（Global名、函数名、内置命令等）"""
        return (name in self.OS_BUILTINS or
                name in self.GLOBAL_NAMES or
                name[0] == '^' or name[0] == '"' or name[0].isdigit() or
                len(name) <= 1)

    def check_expression(self, expr: str) -> List[str]:
        """检查表达式中引用了哪些未定义的变量

        返回未定义变量列表。空列表表示所有依赖都已满足。
        """
        if not expr:
            return []
        undefined = []
        # 去除字符串内容
        clean = re.sub(r'"[^"]*"', '""', expr)
        # ★ 去除 Global 引用（^GLOBALNAME...），避免全局名被拆分为子串
        # 支持带点号的 Global 名称，如 ^CIS.AN.AnaesthesiaD
        clean = re.sub(r'\^[A-Za-z][A-Za-z0-9.]+', '', clean)
        # ★ 去除类方法调用（..MethodName），避免方法名被当作变量
        clean = re.sub(r'\.\.[A-Za-z]\w*', '', clean)
        # ★ 去除 ##class() 调用
        clean = re.sub(r'##class\([^)]+\)', '', clean)
        for var in re.findall(r'\b([A-Za-z_][A-Za-z0-9_]*)\b', clean):
            if self.is_non_var(var) or self.is_defined(var):
                continue
            if var not in undefined:
                undefined.append(var)
        return undefined

    def __repr__(self):
        return f"VarRegistry({len(self._defined)} vars)"


class TraversalStrategy:
    """遍历策略：描述从哪张表、用哪个索引、如何遍历"""

    def __init__(self, primary: str, indexes: list, composites: list,
                 template: str = "", input_param: str = "pStartDate",
                 data_var: str = "data", data_format: str = "p"):
        self.primary = primary           # 主表 Global（如 "^DHCINVPRT"）
        self.indexes = indexes           # 可用索引列表
        self.composites = composites     # 复合遍历（子表）
        self.template = template         # 遍历代码模板
        self.input_param = input_param   # 输入参数名
        self.data_var = data_var         # 数据变量名
        self.data_format = data_format   # 数据格式（p=$p, lg=$lg）


class TraversalStrategySelector:
    """业务语义驱动的遍历策略选择器

    根据接口的字段来源分析，自动选择最优的遍历路线。
    核心逻辑：
    1. 分析 L1 匹配结果中字段引用的 Global（来源表）
    2. 统计各表的引用频率
    3. 选择覆盖最多字段的表作为主遍历表
    4. 根据输入参数选择最佳索引
    5. 如果涉及多张表，构建复合遍历
    """

    # 业务语义→遍历策略映射表
    # 基于字段来源表自动选择，不依赖 viewMatchers 关键词匹配
    _SEMANTIC_STRATEGIES = {
        # 支付方式：发票表为主，关联支付方式子表
        "DHCINVPRT": {
            "primary": "^DHCINVPRT",
            "indexes": [
                {"name": "Date", "global": '^DHCINVPRT(0,"Date",date,rowId)',
                 "params": ["date", "rowId"], "input": "pStartDate",
                 "desc": "按收费日期遍历"},
                {"name": "ADM", "global": '^DHCINVPRT(0,"ADM",admRowId,rowId)',
                 "params": ["admRowId", "rowId"], "input": "admRowId",
                 "desc": "按就诊遍历"},
            ],
            "composites": [
                {"parent": "rowId", "child": '^DHCINVPRT(rowId,"P",sub)',
                 "var": "payData", "desc": "支付方式子表"},
            ],
            "data_var": "prtData",
            "filter": ('prtFlag', '^', 8, '"N"', "只取正常收费"),
        },
        # 账单：DHCPB 为主
        "DHCPB": {
            "primary": "^DHCPB",
            "indexes": [
                {"name": "ADM", "global": '^DHCPB(0,"ADM",admRowId,pbId)',
                 "params": ["admRowId", "pbId"], "input": "admRowId",
                 "desc": "按就诊遍历账单"},
            ],
            "composites": [
                {"parent": "pbId", "child": '^DHCPB(pbId,"O",pboChild)',
                 "var": "pboData", "desc": "账单医嘱子表"},
                {"parent": "pbId,pboChild",
                 "child": '^DHCPB(pbId,"O",pboChild,"D",pbdChild)',
                 "var": "pbdData", "desc": "账单明细子表"},
            ],
            "data_var": "pbData",
        },
        # 医嘱：OEORD 为主
        "OEORD": {
            "primary": "^OEORD",
            "indexes": [
                {"name": "ADM", "global": '^OEORD(0,"Adm",admRowId,ordId)',
                 "params": ["admRowId", "ordId"], "input": "admRowId",
                 "desc": "按就诊遍历医嘱"},
            ],
            "composites": [
                {"parent": "ordId", "child": '^OEORD(ordId,"I",ordItm)',
                 "var": "ordstr1", "desc": "医嘱项目子表"},
            ],
            "data_var": "ordData",
        },
        # 挂号：DHCRegistrationFee 为主
        "REG": {
            "primary": "^User.DHCRegistrationFee",
            "indexes": [
                {"name": "RegDate",
                 "global": '^User.DHCRegistrationFeeI("RegDate",date,rowId)',
                 "params": ["date", "rowId"], "input": "pStartDate",
                 "desc": "按挂号日期遍历"},
                {"name": "ADM",
                 "global": '^User.DHCRegistrationFeeI("ADM",admRowId,rowId)',
                 "params": ["admRowId", "rowId"], "input": "admRowId",
                 "desc": "按就诊遍历"},
            ],
            "composites": [],
            "data_var": "data",
            "data_format": "lg",
        },
        # 就诊：PAADM 为主
        "PAADM": {
            "primary": "^PAADM",
            "indexes": [
                {"name": "PAADM_AdmDate",
                 "global": '^PAADMi("PAADM_AdmDate",date,admRowId)',
                 "params": ["date", "admRowId"], "input": "pStartDate",
                 "desc": "按入院日期遍历"},
                {"name": "PAADM_DischgDate",
                 "global": '^PAADMi("PAADM_DischgDate",date,admRowId)',
                 "params": ["date", "admRowId"], "input": "pStartDate",
                 "desc": "按出院日期遍历"},
            ],
            "composites": [],
            "data_var": "admData",
        },
    }

    @classmethod
    def analyze_source_tables(cls, value_results: list) -> Counter:
        """分析字段表达式中的来源表引用频率

        从 L1 匹配结果的 value_expression 中提取 ^GlobalName，
        统计各表被引用的次数。
        """
        table_counts = Counter()
        if not value_results:
            return table_counts
        for vr in value_results:
            if vr and vr.value_expression:
                globals = re.findall(r'\^([A-Z][A-Za-z]+)', vr.value_expression)
                for g in globals:
                    # 标准化表名（去掉可能的子表标识）
                    base = g.split('(')[0]
                    table_counts[base] += 1
        return table_counts

    # 接口名称语义→策略类型映射（优先级最高）
    # 基于接口名称中的业务关键词选择遍历路线，不依赖L1匹配结果
    _VIEW_CODE_SEMANTICS = [
        # (关键词列表, 策略类型, 说明)
        (["register", "挂号", "regist"], "REG", "挂号预约"),
        (["payment_method", "支付方式", "paymode"], "DHCINVPRT", "支付方式"),
        (["invoice", "发票"], "DHCINVPRT", "门诊发票"),
        (["expense_record_info", "费用明细", "fee_detail"], "DHCPB", "费用明细"),
        (["expense_record", "费用记录", "fee_record", "费用结算"], "DHCPB", "费用记录"),
        (["order", "医嘱", "presc", "nonmedication", "drugorder"], "OEORD", "医嘱"),
        (["diagnosis", "诊断"], "MRDIA", "诊断"),
        (["admission", "discharge", "入院", "出院", "outpatient", "门诊"], "PAADM", "就诊"),
        (["lab", "检验"], "OEORD", "检验"),
        (["exam", "检查", "影像"], "OEORD", "检查"),
        (["surgery", "手术", "oper"], "OEORD", "手术"),
        (["nursing", "护理"], "PAADM", "护理"),
    ]

    @classmethod
    def _match_view_semantic(cls, view_code: str) -> Optional[str]:
        """从接口名称中提取业务语义，返回策略类型

        优先级：精确匹配 > 长关键词 > 短关键词
        """
        view_lower = view_code.lower()
        best_match = None
        best_len = 0

        for keywords, strategy_type, _ in cls._VIEW_CODE_SEMANTICS:
            for kw in keywords:
                if kw in view_lower and len(kw) > best_len:
                    best_match = strategy_type
                    best_len = len(kw)

        return best_match

    @classmethod
    def select_strategy(cls, view_code: str, value_results: list,
                        traversal_config: Optional[TraversalConfig] = None
                        ) -> Optional[TraversalStrategy]:
        """根据业务语义选择最优遍历策略

        决策优先级（从高到低）：
        1. 接口名称语义匹配（如 "register" → REG，"payment_method" → DHCINVPRT）
        2. traversal_config 的 type（规则库 viewMatchers 已匹配的域）
        3. 字段来源表分析（L1 表达式中引用最多的 Global）
        """
        # === 优先级1：接口名称语义 ===
        strategy_type = cls._match_view_semantic(view_code)

        # === 优先级2：traversal_config 的 type ===
        if not strategy_type and traversal_config:
            strategy_type = traversal_config.type

        # === 优先级3：字段来源表分析 ===
        if not strategy_type:
            table_counts = cls.analyze_source_tables(value_results)
            if table_counts:
                most_common_table = table_counts.most_common(1)[0][0]
                _TABLE_TO_STRATEGY = {
                    "DHCINVPRT": "DHCINVPRT", "DHCBCI": "DHCINVPRT",
                    "DHCPB": "DHCPB",
                    "OEORD": "OEORD", "OEORDi": "OEORD",
                    "DHCRegistrationFee": "REG", "DHCRegistrationFeeI": "REG",
                    "DHCRegistrationFeeD": "REG",
                    "PAADM": "PAADM", "PAADMi": "PAADM",
                }
                strategy_type = _TABLE_TO_STRATEGY.get(most_common_table)

        if not strategy_type:
            return None

        strategy_def = cls._SEMANTIC_STRATEGIES.get(strategy_type)
        if not strategy_def:
            return None

        # 构建 TraversalStrategy
        return TraversalStrategy(
            primary=strategy_def["primary"],
            indexes=strategy_def.get("indexes", []),
            composites=strategy_def.get("composites", []),
            input_param=strategy_def.get("indexes", [{}])[0].get("input", "pStartDate") if strategy_def.get("indexes") else "pStartDate",
            data_var=strategy_def.get("data_var", "data"),
            data_format=strategy_def.get("data_format", "p"),
        )


class BaseGenerator:
    """代码生成器公共基类"""

    # === 跨域通用中间变量 ===
    # 注意：使用 adm 而不是 admRowId，因为在 PAADMi 遍历中实际使用的是 adm
    _COMMON_INTERMEDIATES = {
        'rowId': ('$g(adm)', '当前行ID'),
        'patDR': ('$p($g(^PAADM(adm)),"^",1)', '患者DR'),
        'ctlocDr': ('$p($g(^PAADM(adm)),"^",4)', '科室DR'),
        'hospDr': ('$p($g(^CTLOC($p($g(^PAADM(adm)),"^",4))),"^",22)', '院区DR(科室→院区)'),
        'ctpcpDr': ('$p($g(^PAADM(adm)),"^",9)', '主管医生DR'),
        'userDr': ('$p($g(^PAADM(adm)),"^",14)', '操作员DR'),
    }

    # === 按域隔离的中间变量 ===
    _DOMAIN_INTERMEDIATES = {
        "40-order": {
            # === 基础节点（模板或遍历提供） ===
            'hospDr': ('$p($g(^CTLOC($p($g(^PAADM(adm)),"^",4))),"^",22)', '科室→院区DR'),
            'patDR': ('$p($g(^PAADM(adm)),"^",1)', '患者DR'),
            'ctlocDr': ('$p($g(^PAADM(adm)),"^",4)', '科室DR'),
            'ctpcpDr': ('$p($g(^PAADM(adm)),"^",9)', '医护人员DR(→CT_CareProv)'),
            'docDr': ('$p($g(^PAADM(adm)),"^",9)', '开诊医生DR(=ctpcpDr)'),
            'mradm': ('$p($g(^PAADM(adm)),"^",61)', '病案DR(→MR_Adm)'),
            'wardDr': ('$p($g(^PAADM(adm)),"^",70)', '病区DR(→PAC_Ward)'),
            'ordstr1': ('$g(^OEORD(ordId,"I",ordItm,1))', '医嘱主节点'),
            'ordstr2': ('$g(^OEORD(ordId,"I",ordItm,2))', '医嘱项目节点'),
            'ordstr3': ('$g(^OEORD(ordId,"I",ordItm,3))', '医嘱收费科室节点'),
            # === 从 ordstr 派生的 DR 指针（来源: his-data-flow.md 1.2 医嘱链路） ===
            'OrdTypeRowID': ('$p(ordstr1,"^",8)', '医嘱类型DR(→OEC_Priority/OEC_OrderType)'),
            'AppDeptRowID': ('$p(ordstr3,"^",6)', '接收科室DR(→CT_Loc)'),
            'specDr': ('$p(ordstr3,"^",20)', '标本DR(→TEPI)'),
            'ordDocDr': ('$p(ordstr1,"^",11)', '开医嘱医生DR(→CT_CareProv)'),
            'statusDr': ('$p(ordstr1,"^",13)', '医嘱状态DR(→OEC_OrderStatus)'),
            'StatusRowID': ('$p(ordstr1,"^",13)', '医嘱状态DR(→OEC_OrderStatus)'),
            # === 从 ARC_ItmMast 派生（来源: his-data-flow.md ARC 链路） ===
            'arcimDr': ('$p(ordstr2,"^",1)', '医嘱项ARCIM_DR(→ARC_ItmMast)'),
            'arcSub': ('$p(arcimDr,"||",1)', '医嘱项子表ID'),
            'arcVer': ('$p(arcimDr,"||",2)', '医嘱项版本'),
            'ordTypeRowID': ('$p($g(^ARC("Item",arcimDr)),"^",12)', '医嘱类型DR(从ARCItem派生)'),
            'typeDr': ('$p($g(^ARC("Item",arcimDr)),"^",12)', '医嘱类型DR(从ARCItem派生)'),
            'phcdfDr': ('$p($g(^ARCIM(arcSub,arcVer,1)),"^",12)', '药学关联指针(→PHC_DrgForm)'),
            # === 从 ARC_ItmMast→INCI 派生（来源: his-data-flow.md 库存链路） ===
            'inci': ('$p($g(^ARCIM(arcSub,arcVer,8)),"^",10)', '库存项DR(→INC_Itm)'),
            # === 从 ordstr2 派生（剂量/频次/用法/疗程） ===
            'usageRowID': ('$p(ordstr2,"^",7)', '用法DR(→PHC_Instruc)'),
            'freqRowID': ('$p(ordstr2,"^",4)', '频次DR(→PHC_Freq)'),
            'freqDr': ('$p(ordstr2,"^",4)', '频次DR(→PHC_Freq)'),
            'dosageUnitRowID': ('$p(ordstr2,"^",3)', '剂量单位DR(→CT_UOM)'),
            'useDaysRowID': ('$p(ordstr2,"^",6)', '疗程DR(→PHC_Duration)'),
            'useDaysDr': ('$p(ordstr2,"^",6)', '疗程DR(→PHC_Duration)'),
            # === 跨表取值（已知 DR 链路的最终取值） ===
            'statusCode': ('$p($g(^OEC("OSTAT",statusDr)),"^",1)', '医嘱状态代码(来源:his-data-flow.md)'),
            # === 分步取值：使用中间变量避免嵌套表达式 ===
            'OrdSubCatRowID': ('$p($g(^ARCIM(arcSub,arcVer,1)),"^",10)', '医嘱子类DR'),
            'OrdCatRowID': ('$p($g(^ARC("IC",OrdSubCatRowID)),"^",8)', '医嘱大类DR(依赖OrdSubCatRowID)'),
            'orderCatCode': ('$p($g(^ARC("IC",OrdSubCatRowID)),"^",8)', '医嘱大类代码(使用中间变量OrdSubCatRowID)'),
            # === 规则库 Piece 编号修正（原表达式 ^? 缺失 Piece） ===
            'orderTime': ('$p(ordstr1,"^",10)', '医嘱开立时间(ordstr1^10=开始时间,来源:规则库节点定义)'),
        },
        "30-diagnosis": {
            'hospDr': ('$p($g(^CTLOC($p($g(^PAADM(adm)),"^",4))),"^",22)', '科室→院区DR'),
            'mradm': ('$p($g(^PAADM(adm)),"^",61)', '病案号'),
        },
        "70-nursing": {
            'hospDr': ('$p($g(^CTLOC($p($g(^PAADM(adm)),"^",4))),"^",22)', '科室→院区DR'),
            'mradm': ('$p($g(^PAADM(adm)),"^",61)', '病案号'),
        },
        "50-lab-exam": {
            'hospDr': ('$p($g(^CTLOC($p($g(^PAADM(adm)),"^",4))),"^",22)', '科室→院区DR'),
            'visitNo': ('adm', '就诊流水号(就是就诊ID)'),
        },
        "55-exam-report": {
            'hospDr': ('$p($g(^CTLOC($p($g(^PAADM(adm)),"^",4))),"^",22)', '科室→院区DR'),
            'visitNo': ('adm', '就诊流水号(就是就诊ID)'),
        },
        "10-registration": {
            'admRowId': ('$lg(data,1)', '挂号费表→就诊ID(RegfeeAdmDr)'),
            'patDR': ('$p($g(^PAADM(admRowId)),"^",1)', '患者DR'),
            'deptDr': ('$p($g(^PAADM(admRowId)),"^",4)', '科室DR'),
            'hospDr': ('$p($g(^CTLOC(deptDr)),"^",22)', '科室→院区DR'),
        },
        "a0-fee-settlement": {
            # === 基础就诊信息（从PAADM获取） ===
            'patDR': ('$p($g(^PAADM(adm)),"^",1)', '患者DR'),
            'ctlocDr': ('$p($g(^PAADM(adm)),"^",4)', '科室DR'),
            'hospDr': ('$p($g(^CTLOC(ctlocDr)),"^",22)', '科室→院区DR'),
            'admDate': ('$p($g(^PAADM(adm)),"^",6)', '入院日期'),
            'admTime': ('$p($g(^PAADM(adm)),"^",7)', '入院时间'),
            'disDate': ('$p($g(^PAADM(adm)),"^",17)', '出院日期'),
            'disTime': ('$p($g(^PAADM(adm)),"^",18)', '出院时间'),
            'admissionDeptDr': ('$p($g(^PAADM(adm)),"^",4)', '入院科室DR(=ctlocDr)'),
            'dischargeDeptDr': ('$p($g(^PAADM(adm)),"^",4)', '出院科室DR(=ctlocDr)'),
            # === 就诊→患者链路（来源: his-data-flow.md 1.1） ===
            'paperDr': ('$p($g(^PAADM(adm)),"^",1)', '患者DR(=patDR)'),
            'docDr': ('$p($g(^PAADM(adm)),"^",9)', '开诊医生DR(→CT_CareProv)'),
            'ctpcpDr': ('$p($g(^PAADM(adm)),"^",9)', '医护人员DR(=docDr)'),
            'mradm': ('$p($g(^PAADM(adm)),"^",61)', '病案DR(→MR_Adm)'),
            'wardDr': ('$p($g(^PAADM(adm)),"^",70)', '病区DR(→PAC_Ward)'),
            # === 就诊→医嘱链路（来源: his-data-flow.md 1.2） ===
            # 通过 ^OEORD(0,"Adm",adm,ordId) 直接关联，不需要通过账单表
            'ordId': ('$o(^OEORD(0,"Adm",adm,0))', '首个医嘱ID'),
            'ordItm': ('$o(^OEORD(ordId,"I",0))', '首个医嘱项目'),
            'arcimDr': ('$p($g(^OEORD(ordId,"I",ordItm,2)),"^",1)', '医嘱项DR(→ARC_ItmMast)'),
            'ordstr1': ('$g(^OEORD(ordId,"I",ordItm,1))', '医嘱主节点'),
            'ordstr2': ('$g(^OEORD(ordId,"I",ordItm,2))', '医嘱项目节点'),
            'ordstr3': ('$g(^OEORD(ordId,"I",ordItm,3))', '医嘱收费科室节点'),
            'AppDeptRowID': ('$p(ordstr3,"^",6)', '接收科室DR(→CT_Loc)'),
            'ordDocDr': ('$p(ordstr1,"^",11)', '开医嘱医生DR(→CT_CareProv)'),
            'OrdTypeRowID': ('$p(ordstr1,"^",8)', '医嘱类型DR(→OEC_Priority)'),
            # === 费用结算链路（从DHCPB获取） ===
            'pbAdmDr': ('$p($g(^DHCPB(pbId)),"^",1)', '账单就诊DR'),
            'pbDate': ('$p($g(^DHCPB(pbId)),"^",2)', '账单日期'),
            'pbDisDate': ('$p($g(^DHCPB(pbId)),"^",3)', '账单出院日期'),
            'pbTotalAmount': ('+$p($g(^DHCPB(pbId)),"^",9)', '账单总费用'),
            'pbPatientShare': ('+$p($g(^DHCPB(pbId)),"^",12)', '患者自付金额'),
            'pbPayorShare': ('+$p($g(^DHCPB(pbId)),"^",11)', '医保支付金额'),
            'pbAmountPaid': ('+$p($g(^DHCPB(pbId)),"^",13)', '已付金额'),
            'pbRefundFlag': ('$p($g(^DHCPB(pbId)),"^",17)', '退费标志(R=退费)'),
            # === DHCPB→OEORD 跨域链路（来源: his-data-flow.md 1.4 计费链路） ===
            # PBOOEORIDR 在 ^DHCPB(pbId,"O",pboChild) 的 ^3 位置
            'oeoriDr': ('$p(pboData,"^",3)', '账单医嘱DR(PBOOEORIDR,→OE_OrdItem)'),
            'ordItm': ('$p(pboData,"^",3)', '医嘱项目DR(从账单医嘱子表获取,PBOOEORIDR)'),
            # ordId 从 ordItm 派生（ordItm格式如 "123||456"，+ordItm=123）
            'ordId': ('+ordItm', '医嘱主表ID(从ordItm派生)'),
            'ordSub': ('$p(ordItm,"||",2)', '医嘱子表ID(从ordItm派生)'),
            # === 医嘱项链路（从ordstr2派生，避免重复访问Global） ===
            'arcimDr': ('$p(ordstr2,"^",1)', '医嘱项DR(→ARC_ItmMast,从ordstr2^1获取)'),
            'arcSub': ('$p(arcimDr,"||",1)', '医嘱项子表ID'),
            'arcVer': ('$p(arcimDr,"||",2)', '医嘱项版本'),
            'ordDocDr': ('$p(ordstr1,"^",11)', '开医嘱医生DR(→CT_CareProv)'),
            'AppDeptRowID': ('$p(ordstr3,"^",6)', '接收科室DR(→CT_Loc)'),
            # === ARC 链路 ===
            'OrdSubCatRowID': ('$p($g(^ARCIM(arcSub,arcVer,1)),"^",10)', '医嘱子类DR'),
            'OrdCatRowID': ('$p($g(^ARC("IC",OrdSubCatRowID)),"^",8)', '医嘱大类DR'),
            # === DHCPB→DHC_TarItem 跨域链路（来源: his-data-flow.md 计费明细） ===
            'tariDr': ('$p(pbdData,"^",3)', '收费项DR(→DHC_TarItem,PBD_TARI_DR)'),
            'tariCode': ('$p($g(^DHCTARI(tariDr)),"^",1)', '收费项代码'),
            'tariDesc': ('$p($g(^DHCTARI(tariDr)),"^",2)', '收费项名称'),
            'itemCode': ('$p($g(^DHCTARI(tariDr)),"^",54)', '医保项目代码(TARI_InsuCode)'),
            'itemName': ('$p($g(^DHCTARI(tariDr)),"^",55)', '医保项目名称(TARI_InsuName)'),
            'isHv': ('$p($g(^DHCTARI(tariDr)),"^",151)', '是否高值耗材(TARI_StateHvmFlag)'),
        },
        "a1-outpatient-invoice": {
            'patDR': ('$p($g(^PAADM(adm)),"^",1)', '患者DR'),
            'hospDr': ('$p($g(^CTLOC($p($g(^PAADM(adm)),"^",4))),"^",22)', '科室→院区DR'),
        },
        "60-surgery": {
            # === 手术域中间变量（来源: 60-surgery.md 规则库） ===
            'anaData': ('$g(^CIS.AN.AnaesthesiaD(opsId))', '麻醉数据(从OperSchedule关联)'),
            'opListData': ('$g(^CIS.AN.OperationListD(opsId))', '手术操作列表数据'),
            'anaId': ('$lg(data,20)', '麻醉ID(OperSchedule.lg20=Anaesthesia)'),
            'operDr': ('$lg(opListData,3)', '手术操作DR(→ORC_Operation)'),
            'surgeonDr': ('$lg(data,18)', '术者DR(OperSchedule.lg18=AppCareProvID)'),
            'assistDr': ('$lg(opListData,9)', '一助DR(OperationList.lg9=Assistant)'),
            'anesDr': ('$lg(anaData,5)', '麻醉医师DR(Anaesthesia.lg5=Anesthesiologist)'),
            'anesMethodDr': ('$lg(anaData,3)', '麻醉方式DR(Anaesthesia.lg3=AnaMethod)'),
        },
    }

    # === 按域隔离的变量推断规则 ===
    _DOMAIN_VAR_INFERENCE = {
        "40-order": {
            'ordId': ('$o(^OEORD(0,"Adm",adm,0))', '取首个医嘱ID'),
            'ordItm': ('$o(^OEORD(0,"Adm",adm,ordId,0))', '取首个医嘱项目'),
            'arcimDr': ('$p(ordstr2,"^",1)', '医嘱项ARCIM_DR'),
            'arcSub': ('$p(arcimDr,"||",1)', '医嘱项RowID'),
            'arcVer': ('$p(arcimDr,"||",2)', '医嘱项版本'),
            'OrdSubCatRowID': ('$p($g(^ARCIM(arcSub,arcVer,1)),"^",10)', '医嘱子类DR'),
            'OrdCatRowID': ('$p($g(^ARC("IC",OrdSubCatRowID)),"^",8)', '医嘱大类DR'),
            'phcdfDr': ('$p($g(^ARCIM(arcSub,arcVer,1)),"^",12)', '药学关联指针'),
            'drugFormDr': ('$p($g(^PHCD(+phcdfDr,"DF",$p(phcdfDr,"||",2),1)),"^",1)', '药物剂型DR'),
            'OrdTypeRowID': ('$P(ordstr1,"^",8)', '医嘱类型DR(→OEC_Priority)'),
            'FreqRowID': ('$P(ordstr2,"^",4)', '频次DR(→PHC_Freq)'),
            'usageRowID': ('$P(ordstr2,"^",6)', '用法DR(→PHC_Instruc)'),
        },
        "30-diagnosis": {
            'mradm': ('$p($g(^PAADM(adm)),"^",61)', '病案号'),
        },
        "50-lab-exam": {},
        "55-exam-report": {},
        "10-registration": {
            'admRowId': ('$lg(data,1)', '挂号费表→就诊ID'),
            'patDR': ('$p($g(^PAADM(admRowId)),"^",1)', '患者DR'),
        },
        "a0-fee-settlement": {},
        "60-surgery": {},
    }

    # === 变量名映射（通用→标准化） ===
    _VAR_MAPPING = {
        'tPatDR': 'patDR', 'PatRowID': 'patDR', 'PapmiDR': 'patDR',
        'patRowId': 'patDR', 'papmiDR': 'patDR', 'PatientDR': 'patDR',
        # adm 和 admRowId 是不同的变量：adm 是遍历模板中的就诊ID，admRowId 是方法参数
        # 在模式1中 adm=admRowId，在模式2中 adm 从遍历模板获取
        'PaadmRowid': 'admRowId', 'AdmNo': 'admRowId',
        'AdmId': 'admRowId', 'admId': 'admRowId', 'PAADM_RowID': 'admRowId',
        'EpisodeID': 'admRowId',
        'OrdRowID': 'ordId', 'ordId': 'ordId', 'OEORD_RowID': 'ordId',
        'ord': 'ordId',  # OEORD 主表 rowId 别名
        'ordItm': 'ordItm', 'OrdItemID': 'ordItm',
        'arcimSub': 'arcSub', 'ArcSub': 'arcSub', 'imSub': 'arcSub',  # 医嘱项子表ID别名
        'arcimVer': 'arcVer', 'ArcVer': 'arcVer', 'imVer': 'arcVer',  # 医嘱项版本别名
        'arcimId': 'arcimDr', 'ArcimDR': 'arcimDr', 'arcimDR': 'arcimDr',  # 医嘱项DR别名
        'locDr': 'ctlocDr', 'locDR': 'ctlocDr', 'CTLOC_RowID': 'ctlocDr',  # 科室DR别名
        'userDr': 'userDr', 'SSUSR_RowID': 'userDr',
        'CTPCP_DR': 'ctpcpDr', 'doctorDr': 'ctpcpDr', 'careProvDr': 'ctpcpDr',
        'DOC_CODE_DR': 'ordDocDr',  # 医嘱开立医生DR → 从ordstr1派生
        'OrdTypeCode': 'statusCode',  # 医嘱状态代码别名
        'OrdCatRowID': 'orderCatCode',  # 医嘱大类别名
        'OrderStatusDr': 'statusDr',  # 医嘱状态DR别名
        'StatusRowID': 'statusDr',  # 医嘱状态DR别名
        'typeDr': 'OrdTypeRowID',  # 医嘱类型DR别名
        'freqDr': 'freqRowID',  # 频次DR别名
        'useDaysDr': 'useDaysRowID',  # 疗程DR别名
        'hospDr': 'hospDr', 'HospRowID': 'hospDr',
        'hospId': 'hospDr', 'HospDR': 'hospDr', 'hospDR': 'hospDr',  # 院区DR别名
        'wardDr': 'wardDr', 'WardDr': 'wardDr',
        'patDR': 'patDR',
        'admRowId': 'admRowId',
        'admReasonDr': 'admReasonDr', 'AdmReasonDR': 'admReasonDr',  # 就诊原因DR
        'admTypeCode': 'admTypeCode', 'AdmTypeCode': 'admTypeCode',  # 就诊类型代码
        'mradm': 'mradm', 'MRADM': 'mradm',  # 病案号
    }

    def __init__(self, config: Optional[Dict[str, Any]] = None, rules_dir: Optional[Path] = None):
        self.config = config or {}
        self.author = self.config.get("project", {}).get("author", "CodeBuddy")
        self.traversal_loader = get_traversal_loader(rules_dir)

    # ==================== 核心能力方法 ====================

    def detect_domain(self, value_results: Optional[List[Optional[ValueResult]]]) -> Optional[str]:
        """从L1匹配结果推断主业务域ID

        统计各域的匹配字段数，返回最多匹配的域ID。
        """
        if not value_results:
            return None

        counts = {}
        for result in value_results:
            if result and hasattr(result, 'rule') and result.rule:
                domain = getattr(result.rule, 'domain', None)
                if domain:
                    counts[domain] = counts.get(domain, 0) + 1

        if not counts:
            return None

        # ★ 排除非业务域（common、zz-custom等）
        non_business_domains = {'common', 'zz-custom'}
        business_counts = {k: v for k, v in counts.items() if k not in non_business_domains}

        # 如果有业务域，选择业务域中匹配数最多的
        if business_counts:
            return max(business_counts, key=business_counts.get)

        # 如果没有业务域，选择匹配数最多的域
        return max(counts, key=counts.get)

    def load_traversal_config(self, domain_id: Optional[str] = None,
                               view_code: str = "") -> Optional[TraversalConfig]:
        """加载遍历配置

        优先按视图名称匹配（viewMatchers关键词匹配，更精确），
        回退到按域ID加载（L1规则计数推断，可能不准）。

        如果配置有modes，根据视图名称选择合适的mode。
        """
        # 优先：按视图名称匹配（如 "register" → 10-registration 域）
        config = None
        if view_code:
            config = self.traversal_loader.get_config_by_view_name(view_code)

        # 回退：按域ID加载
        if not config and domain_id:
            config = self.traversal_loader.get_config_by_domain(domain_id)

        if not config:
            return None

        # 如果配置有modes，根据视图名称选择合适的mode
        if config.modes and view_code:
            # ★ 对于医嘱域的批量接口（如 DBZ_ 开头），优先选择日期范围模式
            prefer_date_range = False
            if domain_id == "40-order" and view_code.upper().startswith("DBZ_"):
                prefer_date_range = True

            selected_mode = self._select_mode(config.modes, view_code, prefer_date_range)
            if selected_mode:
                # 创建一个新的配置，使用选中的mode的index和template
                mode_data = config.modes[selected_mode]
                new_data = {
                    "type": config.type,
                    "inputParam": config.input_param,
                    "preVariables": config.pre_variables,
                    "index": mode_data.get("index", config.index),
                    "data": config.data,
                    "template": mode_data.get("template", config.template),
                    "viewMatchers": config.view_matchers,
                    "_selectedMode": selected_mode,
                }
                return TraversalConfig(new_data)

        return config

    def _select_mode(self, modes: Dict[str, Any], view_code: str,
                     prefer_date_range: bool = False) -> Optional[str]:
        """根据视图名称选择合适的mode

        遍历所有modes的viewMatchers，找到匹配的mode。
        支持模糊匹配和关键词匹配。

        Args:
            modes: 模式配置字典
            view_code: 视图代码
            prefer_date_range: 是否优先选择日期范围模式
        """
        view_code_lower = view_code.lower()

        # 如果优先选择日期范围模式，直接返回
        if prefer_date_range and "dateRange" in modes:
            return "dateRange"

        # 首先尝试精确匹配
        for mode_name, mode_config in modes.items():
            view_matchers = mode_config.get("viewMatchers", [])
            for matcher in view_matchers:
                if matcher.lower() in view_code_lower or view_code_lower in matcher.lower():
                    return mode_name

        # 然后尝试关键词匹配
        # 从view_code中提取关键词（去除数字和下划线）
        import re
        keywords = re.findall(r'[a-zA-Z]+', view_code)
        keywords = [kw.lower() for kw in keywords if len(kw) > 2]

        for mode_name, mode_config in modes.items():
            view_matchers = mode_config.get("viewMatchers", [])
            for matcher in view_matchers:
                matcher_lower = matcher.lower()
                for keyword in keywords:
                    if keyword in matcher_lower or matcher_lower in keyword:
                        return mode_name

        # ★ 如果没有匹配到，尝试根据主级 viewMatchers 推断 mode
        # 例如：如果主级匹配到 "expense_record"，则选择包含 "费用" 的 mode
        # 这是一个启发式规则，用于处理中英文混合的情况
        if len(modes) > 0:
            # 默认选择第一个 mode（通常是 dateRange）
            return list(modes.keys())[0]

        return None

    def get_domain_intermediates(self, domain_id: Optional[str]) -> Dict[str, tuple]:
        """获取域特定的中间变量（合并通用+域特定）"""
        intermediates = dict(self._COMMON_INTERMEDIATES)
        if domain_id:
            domain_im = self._DOMAIN_INTERMEDIATES.get(domain_id, {})
            intermediates.update(domain_im)
        return intermediates

    def get_domain_var_inference(self, domain_id: Optional[str]) -> Dict[str, tuple]:
        """获取域特定的变量推断规则"""
        if not domain_id:
            return {}
        return dict(self._DOMAIN_VAR_INFERENCE.get(domain_id, {}))

    # === 按域隔离的遍历循环变量 ===
    # 遍历循环变量：在遍历模板循环内部已赋值，标签代码块中不需要重新定义
    _DOMAIN_LOOP_VARS = {
        # 通用基础变量（所有域都可能有）
        '_common': {'admRowId', 'adm', 'admData', 'admInfo', 'patDR', 'date',
                    'rowId', 'data', 'visitNo', 'status', 'checkDate', 'checkTime'},
        # 医嘱域特有循环变量
        '40-order': {'ordId', 'ordItm', 'ordstr1', 'ordstr2', 'ordstr3', 'arcimDr',
                     'arcSub', 'arcVer', 'execSub', 'execData'},
        # 费用结算域特有
        'a0-fee-settlement': {'pbId', 'pboChild', 'pbdChild', 'pbData', 'pboData', 'pbdData',
                              'prtRowId', 'paySub', 'payData'},
        # 发票域特有
        'a1-outpatient-invoice': {'prtRowId', 'paySub', 'payData'},
        # 检验域特有
        '50-lab-exam': {'reportId', 'itemCode', 'itemRowId', 'itemData'},
        # 检查域特有
        '55-exam-report': {'reportId', 'itemCode', 'itemRowId', 'itemData'},
        # 手术域特有
        '60-surgery': {'opsId', 'anaData', 'opListData'},
        # 库存域特有
        'd0-pharmacy': {'inci', 'inciData', 'notUseFlag'},
    }

    def get_domain_loop_vars(self, domain_id: Optional[str]) -> set:
        """获取指定域的遍历循环变量集合

        遍历循环变量是在遍历模板循环内部已赋值的变量，
        标签代码块中不需要重新定义。
        """
        loop_vars = set(self._DOMAIN_LOOP_VARS.get('_common', {}))
        if domain_id:
            loop_vars.update(self._DOMAIN_LOOP_VARS.get(domain_id, {}))
        return loop_vars

    def validate_expression_vars(self, expr: str, defined_vars: set) -> List[str]:
        """检查表达式中引用了哪些未定义的变量

        返回未定义变量列表。空列表表示所有依赖都已满足。
        """
        if not expr:
            return []
        undefined = []
        clean = re.sub(r'"[^"]*"', '""', expr)
        clean = re.sub(r'\^[A-Za-z][A-Za-z0-9.]+', '', clean)
        clean = re.sub(r'\.\.[A-Za-z]\w*', '', clean)
        clean = re.sub(r'##class\([^)]+\)', '', clean)
        for var in re.findall(r'\b([A-Za-z_][A-Za-z0-9_]*)\b', clean):
            if len(var) <= 1 or var in VarRegistry.OS_BUILTINS or var in VarRegistry.GLOBAL_NAMES:
                continue
            if var not in defined_vars and var not in undefined:
                undefined.append(var)
        return undefined

    def collect_intermediate_vars(self, value_results: Optional[List[Optional[ValueResult]]],
                                    domain_id: Optional[str],
                                    engine=None) -> Dict[str, tuple]:
        """从字段表达式中收集需要的中间变量

        扫描所有取值表达式，找出引用了但未定义的变量，
        从域中间变量库和变量推断规则中查找定义。

        ★ 重要：加载所有域的中间变量库（不仅仅是主域），
        因为一个接口可能涉及多个域的字段。
        """
        # 加载主域的中间变量
        intermediates = self.get_domain_intermediates(domain_id)
        var_inference = self.get_domain_var_inference(domain_id)

        # ★ 加载所有域的中间变量（跨域查找）
        all_domain_intermediates = {}
        all_domain_var_inference = {}
        for d_id in self._DOMAIN_INTERMEDIATES:
            if d_id != domain_id:
                all_domain_intermediates.update(self._DOMAIN_INTERMEDIATES[d_id])
        for d_id in self._DOMAIN_VAR_INFERENCE:
            if d_id != domain_id:
                all_domain_var_inference.update(self._DOMAIN_VAR_INFERENCE[d_id])

        all_expressions = []
        if value_results:
            for result in value_results:
                if result and result.value_expression:
                    all_expressions.append(result.value_expression)

        # 非变量标识符（Global名、函数名等）
        non_vars = {
            'PAPER', 'PAADM', 'PAADMi', 'PAWARD', 'OEORD', 'OEORDi', 'OECPR',
            'CT', 'CTLOC', 'CTPCP', 'SSU', 'SSUSR', 'ARCIM', 'ARC', 'INCI',
            'MR', 'MRC', 'PAC', 'OEC', 'ORC', 'NUR', 'TCLAB', 'TEPI', 'DHC',
            'DHCTarC', 'DHCBill', 'DHCBTarItem', 'DHCTARI', 'DHCPB',
            'ALL', 'PAT', 'PER', 'BED', 'DIA', 'ADM', 'SEX', 'HOSP',
            'DISCON', 'ADMREA', 'ANMET', 'OSTAT', 'UOM', 'DT', 'DXT',
            'ID', 'CODE', 'NAME', 'DESC', 'TEXT', 'DATA', 'ROW', 'VAL',
            'String', 'Status', 'Get', 'Set', 'GetDataByGlossaryNew',
            'getFirstItemValue', 'GetStdName', 'UtilMethod',
            'EMRservice', 'BL', 'BLScatterData', 'OrganizCode',
            'rowId', 'RowId', 'RowID',
            'date',
            'g', 'p', 'zt', 'zd', 'zdh', 'lg', 'lb', 'o', 'i', 'f', 'd',
            'q', 's', 'qHandle', 'repid', 'ind', 'Data', 'Row', 'AtEnd',
            'Class', 'ClassMethod', 'Method',
        }

        intermediate_vars = {}

        for expr in all_expressions:
            expr_clean = re.sub(r'"[^"]*"', '""', expr)
            for var in re.findall(r'\b([A-Za-z_][A-Za-z0-9_]*)\b', expr_clean):
                if len(var) <= 1 or var in non_vars:
                    continue
                if var in self._VAR_MAPPING:
                    continue
                if var in intermediate_vars:
                    continue
                # 从域变量推断规则中查找（主域优先）
                if var in var_inference:
                    ve, vd = var_inference[var]
                    if var not in intermediate_vars:
                        intermediate_vars[var] = (ve, vd)
                # 从域中间变量库中查找（主域优先）
                elif var in intermediates:
                    if var not in intermediate_vars:
                        intermediate_vars[var] = intermediates[var]
                # ★ 从所有域的中间变量库中查找（跨域查找）
                # 但如果当前域的 var_inference 已有定义，优先使用当前域的定义
                elif var in all_domain_intermediates:
                    if var not in intermediate_vars:
                        if var in var_inference:
                            # 当前域的 var_inference 优先级高于其他域的 intermediates
                            intermediate_vars[var] = var_inference[var]
                        else:
                            intermediate_vars[var] = all_domain_intermediates[var]
                elif var in all_domain_var_inference:
                    if var not in intermediate_vars:
                        if var in var_inference:
                            # 当前域的 var_inference 优先级高于其他域的 var_inference
                            intermediate_vars[var] = var_inference[var]
                        else:
                            ve, vd = all_domain_var_inference[var]
                            intermediate_vars[var] = (ve, vd)

            # 也检查映射后的变量名
            for orig_var, mapped_var in self._VAR_MAPPING.items():
                if re.search(r'\b' + re.escape(orig_var) + r'\b', expr):
                    if mapped_var in intermediates and mapped_var not in intermediate_vars:
                        intermediate_vars[mapped_var] = intermediates[mapped_var]
                    elif mapped_var in all_domain_intermediates and mapped_var not in intermediate_vars:
                        # 当前域的 var_inference 优先级高于其他域的 intermediates
                        if mapped_var in var_inference:
                            intermediate_vars[mapped_var] = var_inference[mapped_var]
                        else:
                            intermediate_vars[mapped_var] = all_domain_intermediates[mapped_var]

        # 递归扫描：新建的中间变量表达式可能引用其他未定义变量
        changed = True
        scan_pass = 0
        while changed and scan_pass < 5:
            changed = False
            scan_pass += 1
            for var_name in list(intermediate_vars.keys()):
                ve, vd = intermediate_vars[var_name]
                ve_clean = re.sub(r'"[^"]*"', '""', ve)
                for dep_var in re.findall(r'\b([A-Za-z_][A-Za-z0-9_]*)\b', ve_clean):
                    if dep_var in non_vars or dep_var in intermediate_vars:
                        continue
                    if dep_var in var_inference:
                        dv, dd = var_inference[dep_var]
                        intermediate_vars[dep_var] = (dv, dd)
                        changed = True
                    elif dep_var in intermediates:
                        intermediate_vars[dep_var] = intermediates[dep_var]
                        changed = True
                    # ★ 从所有域的中间变量库中查找（跨域查找）
                    elif dep_var in all_domain_var_inference:
                        dv, dd = all_domain_var_inference[dep_var]
                        intermediate_vars[dep_var] = (dv, dd)
                        changed = True
                    elif dep_var in all_domain_intermediates:
                        intermediate_vars[dep_var] = all_domain_intermediates[dep_var]
                        changed = True

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

        return intermediate_vars

    def process_pre_variables(self, traversal_config: TraversalConfig,
                                var_mapping: Optional[Dict[str, str]] = None) -> List[str]:
        """处理遍历配置中的前置变量

        生成 Set varName=expression 的代码行。
        """
        if not traversal_config or not traversal_config.pre_variables:
            return []

        if var_mapping is None:
            var_mapping = dict(self._VAR_MAPPING)

        outer_defined = {'admRowId', 'patDR', 'status'}
        lines = []

        for pv in traversal_config.pre_variables:
            pn = pv.get('name', '')
            pe = pv.get('expression', '')
            pd = pv.get('description', '')
            if pn and pe and pn not in outer_defined:
                v = self._to_camel_case(pn)
                lines.append(f'Set {v}={pe}  ; {pd}')

        return lines

    def convert_template(self, template: str, base_indent: str = "") -> Tuple[List[str], int]:
        """将模板内容转换为标准花括号写法

        规则库模板使用点号缩进表示循环体，需要转换为花括号写法。

        支持两种For循环模式：
        1. $o()遍历模式（稀疏索引）：
          f  s rowId=$o(^Global(...)) q:rowId=""  d
          →  for {
                 s rowId=$o(^Global(...))
                 Quit:rowId=""

        2. 日期范围模式（连续遍历）：
          f date=pStartDate:1:pEndDate d
          →  for date=pStartDate:1:pEndDate {

        === 编码规范 ===
        1. 单行条件过滤使用 continue:condition 格式（花括号循环内）
           - 正确: continue:status="C"
           - 错误: i status="C" { continue }
        2. 多行条件块使用 if {} 格式
        3. 标签代码块（如 GetOrdDetail）用于抽离字段赋值逻辑，减少循环嵌套层级

        Returns:
            (lines, for_depth): 转换后的行数和当前 For 循环嵌套深度
            for_depth > 0 表示还有未关闭的 For 循环，调用者需要手动关闭
        """
        if not template:
            return [], 0

        raw_lines = template.strip().split('\n')
        result_lines = []
        for_depth = 0  # 跟踪 For 循环嵌套层级

        for i, line in enumerate(raw_lines):
            # 计算点号缩进层级
            stripped = line.lstrip('.')
            dots = len(line) - len(stripped)

            # 展开缩写命令
            expanded = self._expand_os_commands_single(stripped)

            # 模式1：For循环 - $o()遍历（f  s var=$o(...) q:cond  d）
            for_match = re.match(r'^f\s\s+(.+?)\s+q:(\S+)\s\s+d\s*$', stripped)

            # 模式2：For循环 - 范围遍历（f var=expr:expr:expr d）
            for_range_match = re.match(r'^f\s+(\w+=[^:]+:[^:]+:[^\s]+)\s+d\s*$', stripped)

            if for_match:
                # $o()遍历模式
                body = for_match.group(1)
                quit_cond = for_match.group(2)
                indent = base_indent + '    ' * dots
                result_lines.append(f'{indent}for {{')
                result_lines.append(f'{indent}    {body}')
                result_lines.append(f'{indent}    Quit:{quit_cond}')
                for_depth += 1
            elif for_depth > 0 and re.match(r'^i\s*\(.+\)\s*q\s*$', stripped):
                # ⚠️ 循环体内的 i (cond) q → Continue:cond（单行过滤）
                cond = re.match(r'^i\s*\((.+)\)\s*q\s*$', stripped).group(1)
                indent = base_indent + '    ' * dots
                result_lines.append(f'{indent}Continue:{cond}')
            elif for_depth > 0 and re.match(r"^i\s+(\w+)'=(\S+)\s+q", stripped):
                # ⚠️ 循环体内的 i var'="val" q → continue:var'="val"（单行过滤，不等于）
                m = re.match(r"^i\s+(\w+)'=(\S+)\s+q", stripped)
                var_name = m.group(1)
                val = m.group(2)
                indent = base_indent + '    ' * dots
                result_lines.append(f"{indent}continue:{var_name}'={val}")
            elif for_depth > 0 and re.match(r'^i\s+(\w+)=(\S+)\s+q\s*$', stripped):
                # ⚠️ 循环体内的 i var="val" q → continue:var="val"（单行过滤）
                m = re.match(r'^i\s+(\w+)=(\S+)\s+q\s*$', stripped)
                var_name = m.group(1)
                val = m.group(2)
                indent = base_indent + '    ' * dots
                result_lines.append(f'{indent}continue:{var_name}={val}')
            elif for_depth > 0 and re.match(r'^q:(.+)$', stripped):
                # ⚠️ 循环体内的 q:cond → continue:cond（点号写法转花括号写法）
                cond = re.match(r'^q:(.+)$', stripped).group(1)
                indent = base_indent + '    ' * dots
                result_lines.append(f'{indent}continue:{cond}')
            elif for_depth > 0 and re.match(r'^i\s+(\w+)=(\S+)\s+\{', stripped):
                # 单行条件判断：i var="val" { continue } → continue:var="val"
                m = re.match(r'^i\s+(\w+)=(\S+)\s+\{', stripped)
                var_name = m.group(1)
                val = m.group(2)
                indent = base_indent + '    ' * dots
                result_lines.append(f'{indent}continue:{var_name}={val}')
            elif for_range_match:
                # 范围遍历模式：直接转为花括号for
                range_expr = for_range_match.group(1)
                indent = base_indent + '    ' * dots
                result_lines.append(f'{indent}for {range_expr} {{')
                for_depth += 1
            else:
                indent = base_indent + '    ' * dots
                result_lines.append(f'{indent}{expanded}')

        # 不关闭 For 循环，由调用者在插入字段赋值代码后手动关闭
        return result_lines, for_depth

    def _expand_os_commands_single(self, line: str) -> str:
        """处理单行 ObjectScript 命令

        规则：花括号语法 If{} / Else{} 中的关键字必须全写，不能缩写成 i{} / e{}。
        但行内缩写是允许的（s/q/i/f/d/k 等），不做展开。
        """
        # 只处理花括号语法中的关键字全写问题
        # 如果行内有 If{ 或 Else{ 确保是全写
        result = line
        result = re.sub(r'\bi\{', 'If{', result)
        result = re.sub(r'\be\{', 'Else{', result)
        return result

    # ==================== 表达式处理 ====================

    def adapt_expression(self, expr: str) -> str:
        """统一的表达式适配流程

        1. 变量名映射（规则库变量→上下文变量）
        2. Global子脚本规范化（统一大小写）
        3. 外部类属性双引号包裹
        4. 操作符空格修复
        """
        if not expr:
            return expr
        result = self._replace_vars(expr, self._VAR_MAPPING)
        result = self._normalize_global_subscripts(result)
        result = self._quote_external_properties(result)
        result = self._fix_operator_spaces(result)
        return result

    # Global 子脚本标准大小写映射（来源：实体类 Storage 定义）
    _GLOBAL_SUBSCRIPT_CASE = {
        'iC': 'IC',    # ARC Item Category
        'dF': 'DF',    # PHCD Drug Form
        'dEP': 'DEP',  # OEORD 备注
        'oRCAT': 'ORCAT',  # OEC Order Category
        'oRCAT': 'ORCAT',
        'oSTAT': 'OSTAT',  # OEC Order Status
        'sPEC': 'SPEC',    # 标本
        'eXT': 'EXT',      # 外部代码
        'aSC': 'ASC',      # 外部代码标识
        'oC': 'OC',        # Outpat Category
        'bLDTP': 'BLDTP',  # 手术切口类型
        'aNMET': 'ANMET',  # 麻醉方式
    }

    @staticmethod
    def _normalize_global_subscripts(expr: str) -> str:
        """规范化 Global 子脚本为标准大小写

        确保 ^GLOBAL("subscript",...) 中的子脚本使用 IRIS 实体类规范的大小写。
        例如 ^ARC("iC") → ^ARC("IC")
        """
        if not expr:
            return expr
        result = expr
        for wrong, correct in BaseGenerator._GLOBAL_SUBSCRIPT_CASE.items():
            # 只替换被引号包裹的子脚本
            result = re.sub(
                r'"' + re.escape(wrong) + r'"',
                '"' + correct + '"',
                result
            )
        return result

    @staticmethod
    def _normalize_global_names(expr: str) -> str:
        """规范化 Global 名称为标准大小写

        确保 ^GlobalName 中的 Global 名称使用 IRIS 实体类规范的大小写。
        例如 ^cIS.aN → ^CIS.AN
        """
        if not expr:
            return expr

        # Global 名称大小写映射（完整路径）
        _GLOBAL_NAME_CASE = {
            '^cIS.aN': '^CIS.AN',
            '^oRC': '^ORC',
            '^cTLOC': '^CTLOC',
            '^cTPCP': '^CTPCP',
            '^pAADM': '^PAADM',
            '^oEORD': '^OEORD',
            '^aRCIM': '^ARCIM',
            '^pAPER': '^PAPER',
            '^sSU': '^SSU',
            '^iNCI': '^INCI',
            '^mR': '^MR',
            '^oEC': '^OEC',
            '^pHC': '^PHC',
            # User 类 Global（小写形式）
            '^user.dHCRegistrationFeeI': '^User.DHCRegistrationFeeI',
            '^user.dHCRegistrationFeeD': '^User.DHCRegistrationFeeD',
            '^user.dHCQueueD': '^User.DHCQueueD',
            '^user.dHCQueueI': '^User.DHCQueueI',
        }

        # 额外的 Global 名称映射（处理已经被转为小写的情况）
        _GLOBAL_NAME_CASE_EXTRA = {
            '^user.dhcregistrationfeei': '^User.DHCRegistrationFeeI',
            '^user.dhcregistrationfeed': '^User.DHCRegistrationFeeD',
            '^user.dhcqueued': '^User.DHCQueueD',
            '^user.dhcqueuei': '^User.DHCQueueI',
            '^user.DHCRegistrationFeeI': '^User.DHCRegistrationFeeI',
            '^user.DHCRegistrationFeeD': '^User.DHCRegistrationFeeD',
            '^user.DHCQueueD': '^User.DHCQueueD',
            '^user.DHCQueueI': '^User.DHCQueueI',
            # 通用 User 类 Global 前缀
            '^user.': '^User.',
        }

        # 类名大小写映射
        _CLASS_NAME_CASE = {
            'web.dHCST': 'web.DHCST',
            'uDHCJFPRICE': 'UDHCJFPRICE',
            'web.dHCDoc': 'web.DHCDoc',
            'web.dHCENS': 'web.DHCENS',
        }

        # EMR域API调用映射（确保使用正确的##class()语法）
        _EMR_API_CALLS = {
            'GetDataByGlossaryNew': '##Class(EMRservice.bL.BLScatterData).GetDataByGlossaryNew',
            'GetNewStdDataByGlossary': '##Class(EMRservice.bL.BLScatterData).GetNewStdDataByGlossary',
            'GetScatterData': '##Class(EMRservice.bL.BLScatterData).GetScatterData',
        }

        result = expr
        # 先保护字符串内容
        strings = []
        def _save_str(m):
            strings.append(m.group(0))
            return f'\x00STR{len(strings)-1}\x00'
        result = re.sub(r'"[^"]*"', _save_str, result)

        # 替换 Global 名称
        for wrong, correct in _GLOBAL_NAME_CASE.items():
            # 精确匹配 ^wrong（不使用 IGNORECASE）
            result = result.replace(wrong, correct)

        # 替换类名
        for wrong, correct in _CLASS_NAME_CASE.items():
            result = result.replace(wrong, correct)

        # 替换EMR域API调用（确保使用正确的##class()语法）
        for wrong, correct in _EMR_API_CALLS.items():
            # 只替换不在##Class()中的调用
            if wrong in result and f'##Class(EMRservice.bL.BLScatterData).{wrong}' not in result:
                result = result.replace(wrong, correct)

        # 替换已经被转为小写的 Global 名称
        for wrong, correct in _GLOBAL_NAME_CASE_EXTRA.items():
            result = result.replace(wrong, correct)

        # 恢复字符串
        for idx, s in enumerate(strings):
            result = result.replace(f'\x00STR{idx}\x00', s)

        return result

    @staticmethod
    def _fix_operator_spaces(expr: str) -> str:
        """修复操作符空格

        赋值(=)、比较(=/'/=/>/<)两边禁止空格。
        排除字符串内容和注释。
        """
        if not expr:
            return expr

        # 保护字符串内容
        strings = []
        def _save_str(m):
            strings.append(m.group(0))
            return f'\x00STR{len(strings)-1}\x00'
        result = re.sub(r'"[^"]*"', _save_str, expr)

        # 赋值：Set var = val → Set var=val
        result = re.sub(r'(\bSet\s+\w+)\s+=\s+', r'\1=', result)
        # 缩写兼容：s var = val → s var=val
        result = re.sub(r'(\bs\s+\w+)\s+=\s+', r'\1=', result)

        # 比较操作符（不在Set赋值行中的独立比较）
        # ≠:  var ' = val → var'=val
        result = re.sub(r"\s*'=\s*", "'=", result)
        # >:  去除两边空格
        result = re.sub(r'\s*>\s*', '>', result)
        # <:  去除两边空格
        result = re.sub(r'\s*<\s*', '<', result)

        # 恢复字符串
        for idx, s in enumerate(strings):
            result = result.replace(f'\x00STR{idx}\x00', s)

        return result

    @staticmethod
    def _quote_external_properties(expr: str) -> str:
        """外部类属性双引号包裹

        检测 node.PROPERTY_NAME 模式（大写+含下划线），
        自动转为 node."PROPERTY_NAME"。

        ★ 安全约束：
        - 属性名必须含至少一个下划线（排除 Global 子脚本如 AN/IC/DF）
        - 对象名前不能是 ^（排除 ^CIS.AN 等 Global 引用）
        """
        if not expr:
            return expr

        # 保护字符串内容
        strings = []
        def _save_str(m):
            strings.append(m.group(0))
            return f'\x00STR{len(strings)-1}\x00'
        result = re.sub(r'"[^"]*"', _save_str, expr)

        # 匹配 obj.PROPERTY_NAME（含下划线的属性访问）
        # ★ 要求属性名至少含一个下划线，避免误伤 Global 子脚本（AN/IC/DF等）
        # ★ 负向回顾确保对象名前不是 ^（^CIS.AN 是 Global 引用，不是属性访问）
        def _quote_prop(m):
            obj = m.group(1)
            prop = m.group(2)
            return f'{obj}."{prop}"'

        result = re.sub(
            r'(?<!\^)(\b[a-zA-Z_]\w*)\.([A-Za-z][A-Za-z0-9]*_[A-Za-z0-9_]+)\b',
            _quote_prop, result
        )

        # 恢复字符串
        for idx, s in enumerate(strings):
            result = result.replace(f'\x00STR{idx}\x00', s)

        return result

    # ==================== 分步取值 ====================

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
            return final_expr

        # 模式2：$p($g(^GLOBAL($p($g(^GLOBAL(...)),"^",N))),"^",M) - 双重Global嵌套
        # 栈匹配括号，找到最内层 $p($g(^...)) 子表达式并拆解
        def _find_matching_paren(s, start):
            count = 0
            for i in range(start, len(s)):
                if s[i] == '(':
                    count += 1
                elif s[i] == ')':
                    count -= 1
                    if count == 0:
                        return i
            return -1

        def _find_all_pg_patterns(s):
            """找到所有 $p($g(^ 开头的子表达式及其精确范围"""
            results = []
            idx = 0
            while idx < len(s):
                pos = s.find('$p($g(^', idx)
                if pos == -1:
                    break
                paren_start = pos + 2  # $p( 的位置
                end = _find_matching_paren(s, paren_start)
                if end != -1:
                    sub = s[pos:end + 1]
                    depth = sub.count('$p($g(^')
                    results.append({'start': pos, 'end': end, 'expr': sub, 'depth': depth})
                idx = pos + 1
            return results

        patterns = _find_all_pg_patterns(expr)
        innermost = [p for p in patterns if p['depth'] == 1]

        if innermost:
            inner = innermost[0]
            # 解析内层：$p($g(^GLOBAL(subscript)),"^",N)
            m = re.match(r'\$p\(\$g\(\^([A-Z.]+)\((.+?)\)\),"([^"]+)",(\d+)\)', inner['expr'])
            if m:
                global_name = m.group(1)
                subscript = m.group(2)
                sep = m.group(3)
                num = m.group(4)

                # 生成中间变量名
                step_var_name = f"{global_name.lower().replace('.', '')}Dr"

                # 第一步：取内层表达式的值
                step_desc = f"{desc}DR"
                lines.append(f'{indent}s {step_var_name}={inner["expr"]}  ; {step_desc}')
                if registry:
                    registry.register(step_var_name, "step")

                # 替换内层表达式为中间变量，添加非空判断
                final_expr = expr[:inner['start']] + step_var_name + expr[inner['end'] + 1:]
                # 添加非空判断
                lines.append(f'{indent}i {step_var_name}\'="" {{')
                return final_expr, step_var_name

        # 无法识别的模式，返回原表达式
        return expr, None

    # ==================== P0 验证 ====================

    def validate_generated_code(self, code: str, fields: list, view_name: str = "") -> list:
        """P0 验证检查清单（生成后自动运行）

        返回警告列表，空列表表示通过。
        """
        warnings = []

        # 1. 操作符空格检查
        for i, line in enumerate(code.split('\n'), 1):
            stripped = line.strip()
            if stripped.startswith(';') or stripped.startswith('//'):
                continue
            # 检查 Set 赋值两边空格
            if re.search(r'\bSet\s+\w+\s+=\s', line):
                warnings.append(f"L{i}: 操作符空格: {stripped[:60]}")
            # 检查比较操作符空格（排除字符串）
            clean = re.sub(r'"[^"]*"', '""', line)
            if re.search(r'\w\s+=\s+\w', clean) and 'Set' not in line and 'set' not in line:
                warnings.append(f"L{i}: 比较操作符空格: {stripped[:60]}")

        # 2. 中文注释完整性检查（字段赋值行必须有注释）
        set_lines = [l for l in code.split('\n') if 'Do dataObj.%Set(' in l or 'd dataObj.%Set(' in l]
        for i, line in enumerate(set_lines, 1):
            if ';' not in line and '//' not in line:
                warnings.append(f"字段赋值缺少中文注释: {line.strip()[:60]}")

        # 3. 未定义变量检查
        undefined = [r'\btDate\b', r'\btTime\b', r'\btDateTime\b']
        for pattern in undefined:
            if re.search(pattern, code):
                warnings.append(f"使用未定义变量: {pattern}")

        # 4. ★ 数据流链残留检查（→符号不应出现在生成代码中）
        for i, line in enumerate(code.split('\n'), 1):
            stripped = line.strip()
            if stripped.startswith(';') or stripped.startswith('//'):
                continue
            if '→' in stripped:
                warnings.append(f"L{i}: 数据流链残留(→): {stripped[:80]}")

        # 5. ★ Global引号误伤检查（^GLOBAL."subscript" 是错误语法）
        for i, line in enumerate(code.split('\n'), 1):
            stripped = line.strip()
            if stripped.startswith(';') or stripped.startswith('//'):
                continue
            clean = re.sub(r'"[^"]*"', '""', stripped)
            if re.search(r'\^[A-Z]+\."', clean):
                warnings.append(f"L{i}: Global引号误伤: {stripped[:80]}")

        return warnings

    # ==================== 工具方法 ====================

    @staticmethod
    def _sort_vars_by_dependency(intermediate_vars: Dict[str, tuple]) -> List[str]:
        """按依赖关系对中间变量拓扑排序

        确保被依赖的变量先定义。例如：
        - arcSub/arcVer 不依赖其他变量 → 排在前面
        - ordSubCatRowID 依赖 arcSub/arcVer → 排在中间
        - ordCatRowID 依赖 ordSubCatRowID → 排在后面
        """
        deps = {}
        all_var_names = set(intermediate_vars.keys())

        for var_name, (expr, _desc) in intermediate_vars.items():
            expr_vars = set(re.findall(r'\b([a-zA-Z_]\w+)\b', expr))
            deps[var_name] = expr_vars & all_var_names

        sorted_vars = []
        visited = set()
        visiting = set()

        def dfs(var):
            if var in visited:
                return
            if var in visiting:
                return  # 循环依赖，跳过
            visiting.add(var)
            for dep in deps.get(var, set()):
                dfs(dep)
            visiting.remove(var)
            visited.add(var)
            sorted_vars.append(var)

        for var in intermediate_vars:
            dfs(var)

        return sorted_vars

    # 常用中文→英文变量名片段映射（按拼音首字母排序）
    _CN_VAR_MAP = {
        '医保': 'insu', '编码': 'code', '编号': 'code', '标识': 'flag',
        '标记': 'flag', '标准': 'standard', '病历': 'mr', '病案': 'mr',
        '科室': 'dept', '名称': 'name', '备注': 'note', '操作': 'oper',
        '操作人': 'operator', '处方': 'presc', '处置': 'treatment',
        '采集': 'collect', '出院': 'discharge', '次数': 'count',
        '地址': 'addr', '电话': 'tel', '登记': 'reg', '订单': 'order',
        '诊断': 'diag', '诊疗': 'treat', '类型': 'type', '类别': 'category',
        '费用': 'fee', '收费': 'charge', '付费': 'pay', '支付': 'pay',
        '金额': 'amount', '符号': 'sign', '工号': 'jobNo', '挂': 'reg',
        '挂号': 'reg', '过敏': 'allergy', '号': 'no', '患者': 'pat',
        '机构': 'org', '记录': 'record', '就诊': 'visit', '开始': 'start',
        '结束': 'end', '开单': 'order', '流水': 'serial', '麻醉': 'anesth',
        '密码': 'pwd', '模式': 'mode', '目的': 'purpose', '频率': 'freq',
        '评价': 'assess', '其他': 'other', '区域': 'region', '日期': 'date',
        '时间': 'time', '人员': 'staff', '入院': 'admit', '设备': 'device',
        '审核': 'verify', '身份证': 'idcard', '事件': 'event', '手术': 'oper',
        '数据': 'data', '数量': 'qty', '说明': 'desc', '特需': 'special',
        '外地': 'remote', '项目': 'item', '途径': 'channel', '退': 'refund',
        '退号': 'refund', '退费': 'refund', '外': 'ext', '位置': 'pos',
        '文件': 'file', '问题': 'question', '物质': 'substance',
        '西药': 'westMed', '药物': 'drug', '药品': 'drug', '医嘱': 'ord',
        '医生': 'doctor', '医疗': 'medical', '医院': 'hosp', '医学': 'med',
        '医学处置': 'medTreatment', '用药': 'medication', '有效': 'valid',
        '原因': 'reason', '诊断': 'diag', '证件': 'cert', '值': 'value',
        '执行': 'exec', '执业': 'license', '住院': 'ip', '住院号': 'ipNo',
        '住院诊断': 'ipDiag', '状态': 'status', '总': 'total',
        '总费用': 'totalFee', '组织': 'org', '住院天数': 'los',
        '咨询': 'consult', '收费项目': 'tarItem', '耗材': 'consumable',
        '高值': 'highValue', '归类': 'classify', '收入': 'income',
        '康复': 'rehab', '评估': 'assess', '健康': 'health',
        '核心': 'core', '数据集': 'dataset', '活动': 'activity',
        '服务': 'service', '疾病': 'disease', '传染病': 'infect',
        '传染病EMR': 'infectEmr', '三医监管': 'medMon',
    }

    @staticmethod
    def _sanitize_var_name(name: str) -> str:
        """将变量名中的中文转为英文，确保输出有效的ObjectScript标识符

        处理策略：
        1. 纯英文+数字+下划线 → 直接走驼峰转换
        2. 含中文 → 逐字/逐词匹配映射表，拼接为英文变量名
        3. 无法映射 → 用 fieldN (N=hash序号) 兜底
        """
        if not name:
            return "unknownField"

        # 纯英文/数字/下划线，直接走驼峰
        if all(c.isascii() or c == '_' for c in name):
            return BaseGenerator._to_camel_case(name)

        # 含中文：按映射表逐词替换
        result = name
        # 按映射key长度降序匹配（优先匹配长词，如"传染病EMR"优先于"传染病"）
        for cn, en in sorted(BaseGenerator._CN_VAR_MAP.items(), key=lambda x: len(x[0]), reverse=True):
            result = result.replace(cn, en)

        # 清理残留的非ASCII字符
        clean = ""
        for ch in result:
            if ch.isascii() and (ch.isalnum() or ch == '_'):
                clean += ch
            elif not ch.isascii():
                # 残留中文字符 → 跳过
                continue

        # 去重连续下划线 + 首尾清理
        clean = re.sub(r'_+', '_', clean).strip('_')

        if not clean:
            # 完全无法映射，用hash兜底
            clean = "field" + str(abs(hash(name)) % 10000)

        # 确保首字符是字母
        if clean and clean[0].isdigit():
            clean = "f" + clean

        # 驼峰化
        parts = clean.split('_')
        result = parts[0].lower()
        for part in parts[1:]:
            if part:
                result += part[0].upper() + part[1:].lower()
        return result

    @staticmethod
    def _to_camel_case(name: str) -> str:
        """将变量名转为驼峰命名（含中文清理）"""
        if not name:
            return "unknownField"
        # 含中文时先清理
        if not all(c.isascii() or c == '_' for c in name):
            return BaseGenerator._sanitize_var_name(name)
        if '_' not in name and name[0].islower():
            return name
        parts = name.split('_')
        if len(parts) > 1:
            result = parts[0].lower()
            for part in parts[1:]:
                if part:
                    result += part.capitalize()
            return result
        return name[0].lower() + name[1:]

    @staticmethod
    def _ensure_english_code(field_code: str, field_name: str = "", standard_code: str = "") -> str:
        """确保字段代码是有效的英文标识符（用于JSON key / ROWSPEC列名）

        处理策略（优先级从高到低）：
        1. field_code 已是纯英文 → 原样返回
        2. standard_code 可用 → 转小写下划线返回
        3. field_code 含中文 → 用 _sanitize_var_name 转英文
        4. 都不行 → 用 hash 兜底

        Args:
            field_code: 字段代码（可能是中文）
            field_name: 字段中文名（用于辅助生成）
            standard_code: 标准代码（如 ORG_CODE）
        """
        if not field_code:
            if standard_code:
                return standard_code.lower()
            return "field" + str(abs(hash(field_name)) % 10000)

        # 纯英文+数字+下划线 → 直接返回
        if all(c.isascii() and (c.isalnum() or c == '_') for c in field_code):
            return field_code

        # 含中文 → 优先用 standard_code
        if standard_code:
            return standard_code.lower()

        # 用 _sanitize_var_name 转英文（返回驼峰，再转下划线）
        camel = BaseGenerator._sanitize_var_name(field_code)
        # 驼峰转下划线：orgCode → org_code
        snake = re.sub(r'([A-Z])', r'_\1', camel).lower().strip('_')
        return snake

    @staticmethod
    def _replace_vars(expr: str, var_mapping: Dict[str, str]) -> str:
        """替换表达式中的变量名"""
        result = expr
        for old_var, new_var in var_mapping.items():
            result = re.sub(r'\b' + re.escape(old_var) + r'\b', new_var, result)
        return result

    @staticmethod
    def _expand_os_commands(line: str) -> str:
        """展开 ObjectScript 缩写命令为全写"""
        protected = line
        strings = []
        def _save_str(m):
            strings.append(m.group(0))
            return f'\x00STR{len(strings)-1}\x00'
        protected = re.sub(r'"[^"]*"', _save_str, protected)

        m = re.match(r'^(\s*)f\s\s+(.+?)\s+q:(\S+)\s\s+d\s*$', protected)
        if m:
            indent = m.group(1)
            body = m.group(2)
            quit_cond = m.group(3)
            body = re.sub(r'\bs\s+(\w)', r'Set \1', body)
            lines = [
                f'{indent}for {{',
                f'{indent}    {body}',
                f'{indent}    Quit:{quit_cond}',
                f'{indent}}}'
            ]
            result = '\n'.join(lines)
        else:
            result = protected
            result = re.sub(r'^(\s*)Set\s', r'\1Set ', result)
            result = re.sub(r'^(\s*)Quit\s', r'\1Quit ', result)
            result = re.sub(r'^(\s*)Kill\s', r'\1Kill ', result)
            result = re.sub(r'^(\s*)For\s', r'\1For ', result)
            result = re.sub(r'^(\s*)If\s', r'\1If ', result)
            result = re.sub(r'^(\s*)Do\s', r'\1Do ', result)
            result = re.sub(r'^(\s*)s\s+(\w)', r'\1Set \2', result)
            result = re.sub(r'^(\s*)q\b', r'\1Quit', result)
            result = re.sub(r'^(\s*)k\s+(\^)', r'\1Kill \2', result)
            result = re.sub(r'^(\s*)f\s\s', r'\1For ', result)
            result = re.sub(r'^(\s*)i\s+(\()', r'\1If \2', result)
            result = re.sub(r'^(\s*)d\s+(?!\.)', r'\1Do ', result)
            result = re.sub(r'\bq:(\w)', r'Quit:\1', result)
            result = re.sub(r'\bi\s+(\w)', r'If \1', result)

        for idx, s in enumerate(strings):
            result = result.replace(f'\x00STR{idx}\x00', s)

        return result

    @staticmethod
    def _is_simple_expr(expr: str) -> bool:
        """判断是否是简单表达式（可直接赋值）"""
        expr = expr.strip()
        if expr.startswith('Set ') or expr.startswith('Set\t'):
            return False
        if expr.startswith('s ') or expr.startswith('s\t'):
            return False
        if re.search(r'\bIf\b', expr) or re.search(r'\bi\b', expr):
            return False
        if re.search(r'\bSet\b', expr[4:]):
            return False
        if ' s ' in expr:
            return False
        return True

    @staticmethod
    def _parse_view_code(view_code: str) -> tuple:
        """从视图代码解析系统名和类名"""
        if view_code.startswith("ext_"):
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

    @staticmethod
    def _build_package_path(system_name: str, sub_path: str, class_name: str) -> str:
        """构建完整包路径"""
        prefix = "web.DHCENS.BLL"
        parts = [prefix]
        if system_name:
            parts.append(system_name)
        if sub_path:
            parts.append(sub_path)
        parts.append(class_name)
        return ".".join(parts)

    def _find_dependency_rule(self, dep_name: str, engine) -> Optional:
        """查找依赖变量对应的规则"""
        if not engine:
            return None
        search_names = [dep_name, dep_name.upper(), dep_name.lower()]
        for name in search_names:
            results = engine.search_rules(name)
            if results:
                return results[0].rule
        return None
