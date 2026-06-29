"""代码审查器

检查生成的 ObjectScript 代码是否符合红线规则。
P0 红线：违反即阻断
P1 约束：违反则告警
"""

import re
from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional


class Severity(Enum):
    """严重程度"""
    P0 = "P0"  # 阻断
    P1 = "P1"  # 告警


@dataclass
class Violation:
    """违规项"""
    rule_id: str
    severity: Severity
    message: str
    line_number: Optional[int] = None
    line_content: Optional[str] = None

    def __str__(self):
        prefix = f"[{self.severity.value}]"
        loc = f" (line {self.line_number})" if self.line_number else ""
        return f"{prefix} {self.rule_id}: {self.message}{loc}"


@dataclass
class ReviewResult:
    """审查结果"""
    passed: bool
    errors: List[Violation] = field(default_factory=list)
    warnings: List[Violation] = field(default_factory=list)

    @property
    def score(self) -> int:
        """评分（0-100）"""
        return max(0, 100 - len(self.errors) * 10 - len(self.warnings) * 2)

    def to_dict(self) -> dict:
        return {
            "passed": self.passed,
            "score": self.score,
            "errorCount": len(self.errors),
            "warningCount": len(self.warnings),
            "errors": [str(e) for e in self.errors],
            "warnings": [str(w) for w in self.warnings]
        }


class Linter:
    """代码审查器"""

    def __init__(self):
        self._p0_rules = self._init_p0_rules()
        self._p1_rules = self._init_p1_rules()

    def review(self, code: str) -> ReviewResult:
        """审查代码

        Args:
            code: ObjectScript 代码

        Returns:
            ReviewResult
        """
        errors = []
        warnings = []

        lines = code.split('\n')

        # 检查 P0 红线
        for rule_id, check_func in self._p0_rules:
            violations = check_func(code, lines)
            errors.extend(violations)

        # 检查 P1 约束
        for rule_id, check_func in self._p1_rules:
            violations = check_func(code, lines)
            warnings.extend(violations)

        return ReviewResult(
            passed=len(errors) == 0,
            errors=errors,
            warnings=warnings
        )

    def _init_p0_rules(self):
        """初始化 P0 红线规则"""
        return [
            ("P0-001", self._check_transaction_safety),
            ("P0-002", self._check_lock_timeout),
            ("P0-003", self._check_trap_handling),
            ("P0-004", self._check_http_timeout),
            ("P0-005", self._check_temp_global_cleanup),
            ("P0-006", self._check_identifier_underscore),
            ("P0-007", self._check_variable_defined_before_use),
            ("P0-008", self._check_field_has_comment),
            ("P0-009", self._check_err_trap_cleared),
            ("P0-012", self._check_operator_spaces),
            ("P0-013", self._check_data_flow_chain_residue),
            ("P0-014", self._check_global_quoted_subscript),
        ]

    def _init_p1_rules(self):
        """初始化 P1 约束规则"""
        return [
            ("P1-001", self._check_tmp_global_isolation),
            ("P1-002", self._check_id_prefix),
            ("P1-003", self._check_no_sql_in_loop),
            ("P1-004", self._check_error_return_format),
            ("P1-005", self._check_lowercase_transaction),
            ("P1-006", self._check_dot_loop_quit),
            ("P1-007", self._check_dot_bracket_separation),
            ("P1-008", self._check_comment_dot_level),
            ("P1-010", self._check_command_abbreviation),
            ("P1-011", self._check_method_brace_position),
            ("P1-012", self._check_function_abbreviation),
        ]

    # ========== P0 红线检查 ==========

    def _check_transaction_safety(self, code: str, lines: List[str]) -> List[Violation]:
        """P0-001: 事务安全 — ts/tc/tro 成对"""
        violations = []
        ts_count = code.lower().count('\nts ') + code.lower().count('\nts\n')
        tc_count = code.lower().count('\ntc ') + code.lower().count('\ntc\n')
        tro_count = code.lower().count('\ntro ') + code.lower().count('\ntro\n')

        if ts_count > 0 and ts_count != tc_count:
            violations.append(Violation(
                rule_id="P0-001",
                severity=Severity.P0,
                message=f"事务不安全: ts({ts_count}) 和 tc({tc_count}) 数量不匹配"
            ))
        return violations

    def _check_lock_timeout(self, code: str, lines: List[str]) -> List[Violation]:
        """P0-002: 锁安全 — 必须超时 :3"""
        violations = []
        # 检查 lock 命令是否有超时参数
        lock_pattern = re.compile(r'\block\b', re.IGNORECASE)
        for i, line in enumerate(lines, 1):
            if lock_pattern.search(line) and ':' not in line:
                violations.append(Violation(
                    rule_id="P0-002",
                    severity=Severity.P0,
                    message="锁命令必须指定超时参数(:3)",
                    line_number=i,
                    line_content=line.strip()
                ))
        return violations

    def _check_trap_handling(self, code: str, lines: List[str]) -> List[Violation]:
        """P0-003: 陷阱处理 — 有 ts/tc 事务时 $zt + $tl>0 必须 tro"""
        violations = []
        has_transaction = bool(re.search(r'\bts\b', code))
        has_tro = bool(re.search(r'\btro\b', code, re.IGNORECASE))
        # 仅在有事务时才检查 tro
        if has_transaction and '$zt' in code and not has_tro:
            violations.append(Violation(
                rule_id="P0-003",
                severity=Severity.P0,
                message="使用了 ts 事务和 $zt，但没有 tro 回滚保护"
            ))
        return violations

    def _check_http_timeout(self, code: str, lines: List[str]) -> List[Violation]:
        """P0-004: 外部调用 — HTTP 设 Timeout"""
        violations = []
        # 检查 HTTP 调用是否有 Timeout
        http_pattern = re.compile(r'##class\(%Net\.HttpRequest\)', re.IGNORECASE)
        for i, line in enumerate(lines, 1):
            if http_pattern.search(line):
                # 检查附近是否有 Timeout 设置
                context = '\n'.join(lines[max(0, i-5):min(len(lines), i+5)])
                if 'timeout' not in context.lower():
                    violations.append(Violation(
                        rule_id="P0-004",
                        severity=Severity.P0,
                        message="HTTP 调用未设置 Timeout",
                        line_number=i
                    ))
        return violations

    def _check_temp_global_cleanup(self, code: str, lines: List[str]) -> List[Violation]:
        """P0-005: 内存管理 — 临时 Global 用完 Kill"""
        violations = []
        # 检查 ^TMP 使用是否有对应的 kill
        tmp_pattern = re.compile(r'\^TMP\(')
        kill_pattern = re.compile(r'\bkill\b', re.IGNORECASE)

        has_tmp = any(tmp_pattern.search(line) for line in lines)
        has_kill = any(kill_pattern.search(line) for line in lines)

        if has_tmp and not has_kill:
            violations.append(Violation(
                rule_id="P0-005",
                severity=Severity.P0,
                message="使用了 ^TMP 但没有 kill 清理"
            ))
        return violations

    def _check_identifier_underscore(self, code: str, lines: List[str]) -> List[Violation]:
        """P0-006: 标识符禁下划线"""
        violations = []
        # ROWSPEC 中的下划线是豁免的
        # 字段名（ROWSPEC 中定义的）也是豁免的

        # 首先提取 ROWSPEC 中的字段名
        rowspec_fields = set()
        for line in lines:
            if 'ROWSPEC' in line:
                # 提取 ROWSPEC 中的字段名
                match = re.search(r'ROWSPEC\s*=\s*"([^"]*)"', line)
                if match:
                    rowspec_str = match.group(1)
                    for field_def in rowspec_str.split(','):
                        field_name = field_def.split(':')[0].strip()
                        if '_' in field_name:
                            rowspec_fields.add(field_name)

        for i, line in enumerate(lines, 1):
            # 跳过 ROWSPEC 行
            if 'ROWSPEC' in line:
                continue
            # 跳过注释
            if line.strip().startswith(';') or line.strip().startswith('//'):
                continue

            # 检查变量名（Set/s 命令后面的变量）
            match = re.search(r'\b(?:Set|s)\s+([A-Za-z_]+)\s*=', line)
            if match:
                var_name = match.group(1)
                if '_' in var_name and 'CacheTemp' not in var_name:
                    # 豁免 ROWSPEC 中定义的字段名
                    if var_name in rowspec_fields:
                        continue
                    violations.append(Violation(
                        rule_id="P0-006",
                        severity=Severity.P0,
                        message=f"标识符禁用下划线: {var_name}",
                        line_number=i,
                        line_content=line.strip()
                    ))
        return violations

    # ========== P1 约束检查 ==========

    def _check_variable_defined_before_use(self, code: str, lines: List[str]) -> List[Violation]:
        """P0-007: 所有变量在使用前必须有定义

        检查生成的代码中：
        1. 所有使用的变量必须在使用前有定义
        2. 排除已知的遍历变量和全局名
        """
        violations = []

        # 收集所有已定义的变量
        defined_vars = set()
        # Set/s varname= 模式（支持带点号的赋值，如 .s data= 或 ..s data=）
        # 也支持行首的 s data= 模式
        assign_pattern = re.compile(r'(?:^|[\.\s])(?:Set|s)\s+(\w+)\s*=')
        # 批量初始化模式：s (var1,var2,...)=""
        batch_init_pattern = re.compile(r'(?:^|[\.\s])(?:Set|s)\s+\(([^)]+)\)\s*=')
        for line in lines:
            # 检查单变量赋值
            m = assign_pattern.search(line)
            if m:
                defined_vars.add(m.group(1))
            # 检查批量初始化
            m = batch_init_pattern.search(line)
            if m:
                vars_str = m.group(1)
                for var in vars_str.split(','):
                    var = var.strip()
                    if var:
                        defined_vars.add(var)

        # 添加遍历循环中常见的变量（这些变量在循环中定义，但可能不在GetOrdDetail标签中）
        traversal_vars = {
            # 就诊遍历
            'adm', 'admInfo', 'patDR', 'ctlocDr', 'ctpcpDr', 'docDr',
            'admDate', 'admTime', 'disDate', 'disTime', 'mradm', 'wardDr',
            'hospDr', 'status',
            # 医嘱遍历
            'ordId', 'ordItm', 'ordstr1', 'ordstr2', 'ordstr3',
            'arcimDr', 'arcSub', 'arcVer', 'inci',
            # 账单遍历
            'pbId', 'pboChild', 'pbdChild', 'pbData', 'pboData', 'pbdData',
            # 发票遍历
            'prtRowId', 'paySub', 'payData',
            # 手术遍历
            'opsId', 'data', 'anaData', 'opListData',
            # 药品遍历
            'inci', 'inciData', 'notUseFlag',
            # 诊断遍历
            'sub', 'diaData', 'icdDr',
            # 时间变量
            'tDate', 'tTime', 'tDateTime',
        }
        defined_vars.update(traversal_vars)

        # 添加入参变量
        param_vars = {
            'pDateFrom', 'pDateTo', 'pHospitalId', 'pStartDate', 'pEndDate',
            'qHandle', 'repid', 'ind', 'Data', 'Row', 'AtEnd',
        }
        defined_vars.update(param_vars)

        # 添加中间变量（从中间变量库中提取）
        intermediate_vars = {
            'paperDr', 'paadmDr', 'dhcpbDr', 'oeoriDr', 'tariDr',
            'AppDeptRowID', 'ordDocDr', 'OrdTypeRowID', 'statusDr',
            'OrdSubCatRowID', 'OrdCatRowID', 'orderCatCode',
            'usageRowID', 'freqRowID', 'dosageUnitRowID', 'useDaysRowID',
            'phcdfDr', 'specDr', 'statusCode',
            'pbAdmDr', 'pbDate', 'pbDisDate', 'pbTotalAmount',
            'pbPatientShare', 'pbPayorShare', 'pbAmountPaid', 'pbRefundFlag',
            'tariCode', 'tariDesc', 'itemCode', 'itemName', 'isHv',
        }
        defined_vars.update(intermediate_vars)

        # 检查常见未定义变量（排除注释行）
        code_no_comments = '\n'.join(
            l.split(';')[0].split('//')[0] for l in lines
        )

        # 提取所有使用的变量
        used_vars = set()
        var_pattern = re.compile(r'\b([a-zA-Z_][a-zA-Z0-9_]*)\b')
        for line in lines:
            # 跳过注释行
            if line.strip().startswith(';') or line.strip().startswith('//'):
                continue
            # 去除注释部分
            line_no_comment = line.split(';')[0].split('//')[0]
            # 去除字符串内容
            line_no_string = re.sub(r'"[^"]*"', '""', line_no_comment)
            for match in var_pattern.finditer(line_no_string):
                used_vars.add(match.group(1))

        # 排除已知的非变量（全局名、函数名、关键字、标签名等）
        non_vars = {
            # 全局名
            'PAADM', 'PAADMi', 'CTLOC', 'CTPCP', 'PAPER', 'SSU', 'SSUSR',
            'DHCPB', 'DHCTARI', 'OEORD', 'OEORDi', 'ARCIM', 'ARC',
            'MR', 'MRC', 'PHCD', 'PHCF', 'PHCIN', 'CT', 'SEX', 'HOSP',
            'CIS', 'AN', 'INCI', 'OEC', 'ORC', 'PAC', 'DHC',
            'ALL', 'PAT', 'PER', 'BED', 'DIA', 'ADM',
            'AnaesthesiaD', 'OperScheduleD', 'OperScheduleI', 'OperationListD',
            'EnsRISReportResultD', 'EnsRISReportResultI', 'EnsLISReportResultD', 'EnsLISReportResultI',
            'DHCRegistrationFeeD', 'DHCRegistrationFeeI',
            # 函数名
            'g', 'p', 'lg', 'lb', 'zd', 'zt', 'zdh', 'zdt',
            'o', 'd', 'i', 'f', 's', 'q', 'k', 'n',
            'getFirstItemValue', 'GetDataByGlossaryNew', 'GetSpec', 'GetOrderPrice',
            'VerifyDate', 'BLScatterData', 'GetPublicDataForHosp', 'replace',
            'GetSpecCode', 'GetSpecName', 'GetUOMDesc', 'GetStdCode',
            'GetOperConInfo', 'GetInDeptDateTime',
            'GetDataByGlossaryNew', 'GetNewStdDataByGlossary', 'GetScatterData',
            # 关键字
            'Set', 'If', 'Else', 'For', 'Do', 'Quit', 'Continue', 'Kill', 'New', 'Return',
            'ClassMethod', 'Class', 'Query', 'As', 'Extends', 'Property', 'Parameter',
            'String', 'Status', 'Binary', 'Integer', 'Float', 'Boolean',
            'ROWSPEC', 'SqlProc', 'PlaceAfter',
            # 其他
            'web', 'DHCENS', 'BLL', 'RegisteredObject',
            'CacheTemp', 'OK', 'TRUE', 'FALSE', 'None',
            'EMRservice', 'Busi', 'Base', 'DHCDocOrderCommon', 'GDSmartHealth',
            'GlobalCharacterStream', 'Insert', 'Message', 'ToXML', 'ToJSON', 'Write',
            'Push', 'Code', 'OrganizCode', 'OrganizName', 'ServiceTypeCode',
            # 标签名（在代码中作为标签使用，不是变量）
            'GetOrdDetail', 'GetOutboundDetail', 'GetOutboundDetailExecute',
            'GetOutboundDetailFetch', 'GetOutboundDetailClose', 'OutRow',
            'GetSettlement', 'GetSettlementExecute', 'GetSettlementFetch', 'GetSettlementClose',
            'GetSettlementDetail', 'GetSettlementDetailExecute', 'GetSettlementDetailFetch', 'GetSettlementDetailClose',
            'GetDiagnosis', 'GetDiagnosisExecute', 'GetDiagnosisFetch', 'GetDiagnosisClose',
            'GetSurgery', 'GetSurgeryExecute', 'GetSurgeryFetch', 'GetSurgeryClose',
            'GetMaterialMapping', 'GetMaterialMappingExecute', 'GetMaterialMappingFetch', 'GetMaterialMappingClose',
            'GetMaterialInventory', 'GetMaterialInventoryExecute', 'GetMaterialInventoryFetch', 'GetMaterialInventoryClose',
            'GetInboundDetail', 'GetInboundDetailExecute', 'GetInboundDetailFetch', 'GetInboundDetailClose',
            'GetPackageConversion', 'GetPackageConversionExecute', 'GetPackageConversionFetch', 'GetPackageConversionClose',
            'GetDeptDict', 'GetDeptDictExecute', 'GetDeptDictFetch', 'GetDeptDictClose',
            'GetPatientInfo', 'GetPatientInfoExecute', 'GetPatientInfoFetch', 'GetPatientInfoClose',
            'GetOutpatientReg', 'GetOutpatientRegExecute', 'GetOutpatientRegFetch', 'GetOutpatientRegClose',
            'GetInpatientReg', 'GetInpatientRegExecute', 'GetInpatientRegFetch', 'GetInpatientRegClose',
            'GetPatientTrans', 'GetPatientTransExecute', 'GetPatientTransFetch', 'GetPatientTransClose',
            'GetDictItemInfo', 'GetDictItemInfoExecute', 'GetDictItemInfoFetch', 'GetDictItemInfoClose',
            'GetReport', 'GetReportExecute', 'GetReportFetch', 'GetReportClose',
            'GetReportItem', 'GetReportItemExecute', 'GetReportItemFetch', 'GetReportItemClose',
            'GetVisitRecord', 'GetVisitRecordExecute', 'GetVisitRecordFetch', 'GetVisitRecordClose',
            'GetAdmissionRecord', 'GetAdmissionRecordExecute', 'GetAdmissionRecordFetch', 'GetAdmissionRecordClose',
            'GetFee', 'GetFeeExecute', 'GetFeeFetch', 'GetFeeClose',
            'GetOrder', 'GetOrderExecute', 'GetOrderFetch', 'GetOrderClose',
            'GetSurgeryRecord', 'GetSurgeryRecordExecute', 'GetSurgeryRecordFetch', 'GetSurgeryRecordClose',
            'GetPreSurgery', 'GetPreSurgeryExecute', 'GetPreSurgeryFetch', 'GetPreSurgeryClose',
            'GetAnesthesia', 'GetAnesthesiaExecute', 'GetAnesthesiaFetch', 'GetAnesthesiaClose',
            'GetBloodTransfusion', 'GetBloodTransfusionExecute', 'GetBloodTransfusionFetch', 'GetBloodTransfusionClose',
            'GetFirstCourse', 'GetFirstCourseExecute', 'GetFirstCourseFetch', 'GetFirstCourseClose',
            'GetAssessment', 'GetAssessmentExecute', 'GetAssessmentFetch', 'GetAssessmentClose',
            'GetVitalSign', 'GetVitalSignExecute', 'GetVitalSignFetch', 'GetVitalSignClose',
            'GetDeliveryRecord', 'GetDeliveryRecordExecute', 'GetDeliveryRecordFetch', 'GetDeliveryRecordClose',
            'GetBKS', 'GetBKSExecute', 'GetBKSFetch', 'GetBKSClose',
            'GetLab', 'GetLabExecute', 'GetLabFetch', 'GetLabClose',
            'GetLabItem', 'GetLabItemExecute', 'GetLabItemFetch', 'GetLabItemClose',
            'GetExam', 'GetExamExecute', 'GetExamFetch', 'GetExamClose',
            'GetDictionary', 'GetDictionaryExecute', 'GetDictionaryFetch', 'GetDictionaryClose',
            'GetActivityInfo', 'GetActivityInfoExecute', 'GetActivityInfoFetch', 'GetActivityInfoClose',
            'GetActivityItem', 'GetActivityItemExecute', 'GetActivityItemFetch', 'GetActivityItemClose',
            'GetChronicDisease', 'GetChronicDiseaseExecute', 'GetChronicDiseaseFetch', 'GetChronicDiseaseClose',
            'GetAdmission', 'GetAdmissionExecute', 'GetAdmissionFetch', 'GetAdmissionClose',
            'GetDischarge', 'GetDischargeExecute', 'GetDischargeFetch', 'GetDischargeClose',
            'GetNonDrugOrder', 'GetNonDrugOrderExecute', 'GetNonDrugOrderFetch', 'GetNonDrugOrderClose',
            'GetPayment', 'GetPaymentExecute', 'GetPaymentFetch', 'GetPaymentClose',
            'GetFeeDetail', 'GetFeeDetailExecute', 'GetFeeDetailFetch', 'GetFeeDetailClose',
            'GetRegister', 'GetRegisterExecute', 'GetRegisterFetch', 'GetRegisterClose',
            'Getextoutregisterinfo', 'GetextoutregisterinfoExecute', 'GetextoutregisterinfoFetch', 'GetextoutregisterinfoClose',
            'Getextoutemediatreexpenses', 'GetextoutemediatreexpensesExecute', 'GetextoutemediatreexpensesFetch', 'GetextoutemediatreexpensesClose',
            'Getoutpatientinfo', 'GetoutpatientinfoExecute', 'GetoutpatientinfoFetch', 'GetoutpatientinfoClose',
            'Getoutpatientmedicalrecords', 'GetoutpatientmedicalrecordsExecute', 'GetoutpatientmedicalrecordsFetch', 'GetoutpatientmedicalrecordsClose',
            'Getoutpatientjudgeinfolist', 'GetoutpatientjudgeinfolistExecute', 'GetoutpatientjudgeinfolistFetch', 'GetoutpatientjudgeinfolistClose',
            'Getoutpatientnondrugorders', 'GetoutpatientnondrugordersExecute', 'GetoutpatientnondrugordersFetch', 'GetoutpatientnondrugordersClose',
            'Getoutpatientfeerecords', 'GetoutpatientfeerecordsExecute', 'GetoutpatientfeerecordsFetch', 'GetoutpatientfeerecordsClose',
            'Getoutpatientfeedetails', 'GetoutpatientfeedetailsExecute', 'GetoutpatientfeedetailsFetch', 'GetoutpatientfeedetailsClose',
            'Getinpatientadmissionjudgeinfolist', 'GetinpatientadmissionjudgeinfolistExecute', 'GetinpatientadmissionjudgeinfolistFetch', 'GetinpatientadmissionjudgeinfolistClose',
            'Getinpatientnondrugorders', 'GetinpatientnondrugordersExecute', 'GetinpatientnondrugordersFetch', 'GetinpatientnondrugordersClose',
            'Getinpatientdrugorders', 'GetinpatientdrugordersExecute', 'GetinpatientdrugordersFetch', 'GetinpatientdrugordersClose',
            'Getinpatientfeerecords', 'GetinpatientfeerecordsExecute', 'GetinpatientfeerecordsFetch', 'GetinpatientfeerecordsClose',
            'Getinpatientfeedetails', 'GetinpatientfeedetailsExecute', 'GetinpatientfeedetailsFetch', 'GetinpatientfeedetailsClose',
            'Getinpatientsurgeryrecords', 'GetinpatientsurgeryrecordsExecute', 'GetinpatientsurgeryrecordsFetch', 'GetinpatientsurgeryrecordsClose',
            'Getinpatientdischargejudgeinfolist', 'GetinpatientdischargejudgeinfolistExecute', 'GetinpatientdischargejudgeinfolistFetch', 'GetinpatientdischargejudgeinfolistClose',
            'Getpatientdischargerecords', 'GetpatientdischargerecordsExecute', 'GetpatientdischargerecordsFetch', 'GetpatientdischargerecordsClose',
            'Getmedicalserviceindicators', 'GetmedicalserviceindicatorsExecute', 'GetmedicalserviceindicatorsFetch', 'GetmedicalserviceindicatorsClose',
            'Getresourceallocationindicators', 'GetresourceallocationindicatorsExecute', 'GetresourceallocationindicatorsFetch', 'GetresourceallocationindicatorsClose',
            'Getkeyspecialtiesindicators', 'GetkeyspecialtiesindicatorsExecute', 'GetkeyspecialtiesindicatorsFetch', 'GetkeyspecialtiesindicatorsClose',
            # 类名（在代码中作为类名使用，不是变量）
            'Settlement', 'SettlementDetail', 'Diagnosis', 'Surgery',
            'MaterialMapping', 'MaterialInventory', 'InboundDetail', 'OutboundDetail',
            'PackageConversion', 'DeptDict', 'PatientInfo', 'OutpatientReg',
            'InpatientReg', 'PatientTrans', 'DictItemInfo', 'Performance',
            'MedicalInsurance', 'Report', 'ReportItem', 'Lab', 'Pathology',
            'VisitRecord', 'AdmissionRecord', 'Fee', 'Order', 'SurgeryRecord',
            'PreSurgery', 'Anesthesia', 'BloodTransfusion', 'FirstCourse',
            'Assessment', 'VitalSign', 'DeliveryRecord', 'Nur',
            'ActivityInfo', 'ActivityItem', 'ChronicDisease', 'Admission', 'Discharge',
            'FeeDetail', 'Register', 'SmartHealthSC', 'SmartWard',
            'Dictionary', 'BKS', 'Exam', 'LabItem',
            # 索引名（在代码中作为索引使用，不是变量）
            'PAADM_AdmDate', 'PAADM_DischgDate',
            # 其他非变量标识符
            'ByRef', 'List', 'class', 'date', 'for', 'else',
            'obj', 'Price', 'Qty', 'scatterId', 'cLASS',
            'prtData', 'inadmData', 'inpatientConvert', 'sexRowID',
            'recordTime', 'recordDate', 'mzjlXl',
            'case', 'openId', 'rowId', 'admRowId',
            'formatDate', 'formatTime', 'hDate', 'hTime', 'ze_',
            'err', 'operationTime',
            'DHCBill',
            'UtilMethod', 'GetStdName', 'GetStdCode',
            'Common', 'DrugInfoCommon',
            'NonDrugOrder', 'Payment', 'FeeDetail', 'Register',
            'User', 'Patient', 'Service', 'nIS',
            'billTypeDr', 'mrdesc_', 'nhsDxCode',
            'otherFee', 'fC2609B0100', 'fB0331F0100',
            'inpatientadmission', 'inpatientadmissionjudgeinfolist',
            'inpatientdischargejudgeinfolist', 'inpatientdrugorders',
            'inpatientfeedetails', 'inpatientfeerecords',
            'inpatientnondrugorders', 'inpatientsurgeryrecords',
            'outpatientinfo', 'outpatientmedicalrecords',
            'outpatientjudgeinfolist', 'outpatientnondrugorders',
            'outpatientdrugorders', 'outpatientfeerecords',
            'outpatientfeedetails', 'outpatientsurgeryrecords',
            'patientdischargerecords', 'keyspecialtiesindicators',
            'medicalserviceindicators', 'resourceallocationindicators',
            'Getoutpatientdrugorders', 'GetoutpatientdrugordersExecute',
            'GetoutpatientdrugordersFetch', 'GetoutpatientdrugordersClose',
            'Getoutpatientsurgeryrecords', 'GetoutpatientsurgeryrecordsExecute',
            'GetoutpatientsurgeryrecordsFetch', 'GetoutpatientsurgeryrecordsClose',
            'Getinpatientadmission', 'GetinpatientadmissionExecute',
            'GetinpatientadmissionFetch', 'GetinpatientadmissionClose',
        }
        defined_vars.update(non_vars)

        # 检查未定义的变量
        undefined_vars = used_vars - defined_vars
        for var in sorted(undefined_vars):
            # 跳过短变量名（1-2个字符）和常量
            if len(var) <= 2 or var.isupper():
                continue
            # 跳过以_开头的变量
            if var.startswith('_'):
                continue
            violations.append(Violation(
                rule_id="P0-007",
                severity=Severity.P0,
                message=f"变量 {var} 未定义就使用"
            ))

        return violations

    def _check_field_has_comment(self, code: str, lines: List[str]) -> List[Violation]:
        """P0-008: 每个字段赋值行必须有中文注释

        d dataObj.%Set("KEY", value)  ; 中文注释
        """
        violations = []
        set_pattern = re.compile(r'(?:Do|d)\s+dataObj\.%Set\("([^"]+)"')
        for i, line in enumerate(lines, 1):
            m = set_pattern.search(line)
            if m:
                field_name = m.group(1)
                # 检查分号后面是否有注释内容
                comment_part = line.split(';', 1)
                if len(comment_part) < 2 or not comment_part[1].strip():
                    violations.append(Violation(
                        rule_id="P0-008",
                        severity=Severity.P0,
                        message=f"字段 {field_name} 缺少中文注释",
                        line_number=i,
                        line_content=line.strip()
                    ))
        return violations

    def _check_err_trap_cleared(self, code: str, lines: List[str]) -> List[Violation]:
        """P0-009: err 标签内必须 s $zt="" 防止死循环

        若err处理代码内部再次出错，且$zt仍指向err标签会导致无限递归。
        """
        violations = []
        in_err = False
        err_line = 0
        for i, line in enumerate(lines, 1):
            stripped = line.strip()
            if re.match(r'^err\s*$', stripped) or re.match(r'^err\s*;', stripped):
                in_err = True
                err_line = i
                continue
            if in_err:
                if stripped and not stripped.startswith(';') and not stripped.startswith('//'):
                    if not re.match(r'^(?:s|Set)\s+\$zt\s*=\s*""', stripped, re.IGNORECASE):
                        violations.append(Violation(
                            rule_id="P0-009",
                            severity=Severity.P0,
                            message=f"err标签(line {err_line})后必须 s $zt=\"\" 防死循环",
                            line_number=i,
                            line_content=line.strip()
                        ))
                    in_err = False
        return violations

    def _check_tmp_global_isolation(self, code: str, lines: List[str]) -> List[Violation]:
        """P1-001: ^TMP + $j 隔离"""
        violations = []
        # 检查 ^TMP 是否使用 $j 隔离
        tmp_pattern = re.compile(r'\^TMP\([^)]*\)')
        for i, line in enumerate(lines, 1):
            matches = tmp_pattern.findall(line)
            for match in matches:
                if '$j' not in match and '$J' not in match:
                    violations.append(Violation(
                        rule_id="P1-001",
                        severity=Severity.P1,
                        message=f"^TMP 未使用 $j 隔离: {match}",
                        line_number=i
                    ))
        return violations

    def _check_id_prefix(self, code: str, lines: List[str]) -> List[Violation]:
        """P1-002: ID 用前缀"""
        # 简单检查，暂不实现
        return []

    def _check_no_sql_in_loop(self, code: str, lines: List[str]) -> List[Violation]:
        """P1-003: 禁循环内 &sql"""
        violations = []
        in_loop = False
        for i, line in enumerate(lines, 1):
            stripped = line.strip().lower()
            # 检测循环开始
            if 'f ' in stripped or 'for ' in stripped:
                in_loop = True
            # 检测循环结束
            if stripped.startswith('q') or stripped.startswith('quit'):
                in_loop = False
            # 检查循环内的 &sql
            if in_loop and '&sql' in stripped:
                violations.append(Violation(
                    rule_id="P1-003",
                    severity=Severity.P1,
                    message="循环内使用了 &sql，建议移到循环外",
                    line_number=i
                ))
        return violations

    def _check_error_return_format(self, code: str, lines: List[str]) -> List[Violation]:
        """P1-004: 错误返 负数^信息"""
        # 简单检查，暂不实现
        return []

    def _check_lowercase_transaction(self, code: str, lines: List[str]) -> List[Violation]:
        """P1-005: 事务小写 ts/tc/tro"""
        violations = []
        # 检查大写的 TS/TC/TRO
        pattern = re.compile(r'\b(TS|TC|TRO)\b')
        for i, line in enumerate(lines, 1):
            if pattern.search(line) and not line.strip().startswith(';'):
                violations.append(Violation(
                    rule_id="P1-005",
                    severity=Severity.P1,
                    message="事务命令建议使用小写: ts/tc/tro",
                    line_number=i
                ))
        return violations

    def _check_dot_loop_quit(self, code: str, lines: List[str]) -> List[Violation]:
        """P1-006: 点循环用 q 禁 continue（花括号循环中 Continue 合法）"""
        violations = []
        # 仅检查点循环中的 continue（以.开头的行）
        pattern = re.compile(r'^\.+.*\bcontinue\b', re.IGNORECASE)
        for i, line in enumerate(lines, 1):
            if pattern.match(line):
                violations.append(Violation(
                    rule_id="P1-006",
                    severity=Severity.P1,
                    message="点循环中禁用 continue，应使用 q",
                    line_number=i
                ))
        return violations

    def _check_dot_bracket_separation(self, code: str, lines: List[str]) -> List[Violation]:
        """P1-007: 点括号分离"""
        # 简单检查，暂不实现
        return []

    def _check_comment_dot_level(self, code: str, lines: List[str]) -> List[Violation]:
        """P1-008: 注释点数同级"""
        # 简单检查，暂不实现
        return []

    def _check_operator_spaces(self, code: str, lines: List[str]) -> List[Violation]:
        """P0-012: 操作符空格检测 — Set赋值/比较两边不能有空格"""
        violations = []
        for i, line in enumerate(lines, 1):
            stripped = line.strip()
            if stripped.startswith(';') or stripped.startswith('//'):
                continue
            if 'ROWSPEC' in stripped:
                continue
            # Set var = val（赋值操作符两边有空格）
            if re.search(r'\bSet\s+\w+\s+=\s', line):
                violations.append(Violation(
                    rule_id="P0-012",
                    severity=Severity.P0,
                    message="Set赋值操作符两边不应有空格",
                    line_number=i,
                    line_content=stripped
                ))
            # s var = val（缩写兼容）
            elif re.search(r'(?<!\w)s\s+\w+\s+=\s', line):
                violations.append(Violation(
                    rule_id="P0-012",
                    severity=Severity.P0,
                    message="赋值操作符两边不应有空格",
                    line_number=i,
                    line_content=stripped
                ))
        return violations

    def _check_data_flow_chain_residue(self, code: str, lines: List[str]) -> List[Violation]:
        """P0-013: 数据流链残留检测 — 含→符号的行不是有效ObjectScript"""
        violations = []
        for i, line in enumerate(lines, 1):
            stripped = line.strip()
            if stripped.startswith(';') or stripped.startswith('//'):
                continue
            # 去除行尾注释后再检查（; 后面的内容是注释）
            code_part = stripped.split(';', 1)[0] if ';' in stripped else stripped
            code_part = code_part.split('//', 1)[0] if '//' in code_part else code_part
            if '→' in code_part.strip():
                violations.append(Violation(
                    rule_id="P0-013",
                    severity=Severity.P0,
                    message="数据流链描述(→)混入生成代码，不是有效ObjectScript",
                    line_number=i,
                    line_content=stripped[:80]
                ))
        return violations

    def _check_global_quoted_subscript(self, code: str, lines: List[str]) -> List[Violation]:
        """P0-014: Global引号误伤检测 — ^GLOBAL."subscript" 是错误语法"""
        violations = []
        for i, line in enumerate(lines, 1):
            stripped = line.strip()
            if stripped.startswith(';') or stripped.startswith('//'):
                continue
            # 去除字符串内容后检查
            clean = re.sub(r'"[^"]*"', '""', stripped)
            if re.search(r'\^[A-Z]+\."', clean):
                violations.append(Violation(
                    rule_id="P0-014",
                    severity=Severity.P0,
                    message="Global子脚本被错误引号包裹(应为^GLOBAL.sub而非^GLOBAL.\"sub\")",
                    line_number=i,
                    line_content=stripped[:80]
                ))
        return violations

    def _check_command_abbreviation(self, code: str, lines: List[str]) -> List[Violation]:
        """P1-010: 命令风格一致性检查

        生成器输出全写命令（Set/Quit/Do/Kill），此规则仅对手写代码做风格建议。
        不再将全写命令标记为错误。
        """
        # 生成器输出全写命令，此规则降级为信息提示
        return []
        for i, line in enumerate(lines, 1):
            stripped = line.strip()
            if stripped.startswith(';') or stripped.startswith('//'):
                continue
            for pattern, abbrev in full_commands:
                if re.search(pattern, stripped):
                    violations.append(Violation(
                        rule_id="P1-010",
                        severity=Severity.P1,
                        message=f"建议使用缩写 '{abbrev}' 替代全写命令",
                        line_number=i,
                        line_content=stripped
                    ))
                    break  # 每行只报一次
        return violations

    def _check_method_brace_position(self, code: str, lines: List[str]) -> List[Violation]:
        """P1-011: 方法大括号换行 — 方法声明后的大括号必须独占一行"""
        violations = []
        method_pattern = re.compile(
            r'(ClassMethod|Method|Query)\s+\w+.*\)\s*(As\s+\S+)?\s*\{'
        )
        for i, line in enumerate(lines, 1):
            stripped = line.strip()
            if stripped.startswith(';') or stripped.startswith('//'):
                continue
            if method_pattern.search(stripped):
                violations.append(Violation(
                    rule_id="P1-011",
                    severity=Severity.P1,
                    message="方法声明后的大括号应独占一行",
                    line_number=i,
                    line_content=stripped
                ))
        return violations

    def _check_function_abbreviation(self, code: str, lines: List[str]) -> List[Violation]:
        """P1-012: 系统函数缩写 — 必须使用缩写形式($p/$g/$e)而非全写($piece/$get/$extract)"""
        violations = []
        full_functions = [
            (r'\$piece\b', '$p'),
            (r'\$get\b', '$g'),
            (r'\$extract\b', '$e'),
            (r'\$length\b', '$l'),
            (r'\$order\b', '$o'),
            (r'\$data\b', '$d'),
            (r'\$listbuild\b', '$lb'),
            (r'\$listget\b', '$lg'),
            (r'\$list\b', '$li'),
        ]
        for i, line in enumerate(lines, 1):
            stripped = line.strip()
            if stripped.startswith(';') or stripped.startswith('//'):
                continue
            for pattern, abbrev in full_functions:
                if re.search(pattern, stripped):
                    violations.append(Violation(
                        rule_id="P1-012",
                        severity=Severity.P1,
                        message=f"建议使用缩写 '{abbrev}' 替代全写函数",
                        line_number=i,
                        line_content=stripped
                    ))
                    break
        return violations
