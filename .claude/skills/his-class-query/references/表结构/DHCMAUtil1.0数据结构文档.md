---
title: "DHCMAUtil1.0数据结构文档"
source: "document"
source_file: "院感表结构/DHCMAUtil1.0数据结构文档.xlsx"
created: "2026-05-13T06:28:08Z"
---


## Sheet1

| # | | | 1.1 | 产品线表 DHCMA. Util. BT. Product |
| --- | --- | --- | --- | --- |
| 序号 | 字段名 | 字段描述 | 类型 | 备注 |
| 1 | ID | Stirng | | |
| 2 | ProCode | 产品代码 | String | |
| 3 | ProDesc | 产品名称 | String | |
| 4 | ProVersion | 版本号 | String | |
| 5 | ProIconClass | 图标样式 | String | |
| 6 | ProIndNo | 显示顺序号 | String | |
| 7 | ProIsActive | 是否有效 | Boolean | |
| 8 | ProResume | 备注 | String | |
| | | | | |
| 1.2 | 应用系统定义表 DHCMA. Util. BT. SYSTEM | | | |
| 序号 | 字段名 | 字段描述 | 类型 | 备注 |
| 1 | ID | Stirng | | |
| 2 | SYSCode | 系统代码 | String | |
| 3 | SYSDesc | 系统名称 | String | |
| 4 | SYSExCode | 系统外部码 | String | |
| 5 | SYSNote | 系统说明 | String | |
| | | | | |
| 1.3.1 | 字典分类表 DHCMA. Util. BT. DicType | | | |
| 序号 | 字段名 | 字段描述 | 类型 | 备注 |
| 1 | ID | Stirng | | |
| 2 | BTCode | 代码 | String | |
| 3 | BTDesc | 描述 | String | |
| 4 | BTProductDr | 产品线 | Dr | 指向表 DHCMA. Util. BT. Product |
| | | | | |
| 1.3.2 | 系统字典表 DHCMA. Util. BT. Dictionary | | | |
| 序号 | 字段名 | 字段描述 | 类型 | 备注 |
| 1 | ID | Stirng | | |
| 2 | BTCode | 代码 | String | |
| 3 | BTDesc | 描述 | String | |
| 4 | BTTypeDr | 字典分类 | Dr | 指向表 DHCMA. Util. BT. DicType |
| 5 | BTIndNo | 排序码 | Integer | |
| 6 | BTIsActive | 有效标志 | Boolean | |
| 7 | BTActDate | 处置日期 | Date | |
| 8 | BTActTime | 处置时间 | Time | |
| 9 | BTActUserID | 处置人 ID | String | 记录 DHCMA. Util. EP. SSUser. OID HIS 用户 ID，用于数据一致性 |
| | | | | |
| 1.4 | 医院分组表 DHCMA. Util. BT. HospGroup | | | |
| 序号 | 字段名 | 字段描述 | 类型 | 备注 |
| 1 | ID | Stirng | | |
| 2 | BTCode | 代码 | String | |
| 3 | BTDesc | 描述 | String | |
| | | | | |
| 1.5.1 | 系统模块定义 DHCMA. Util. BT. MdlDef | | | |
| 序号 | 字段名 | 字段描述 | 类型 | 备注 |
| 1 | ID | Stirng | | |
| 3 | BTCode | 模块代码 | String | |
| 4 | BTDesc | 模块名称 | String | |
| 5 | BTProductDr | 产品线 | Dr | 指向表 DHCMA. Util. BT. Product |
| | | | | |
| 1.5.1.1 | 系统模块角色表 DHCMA. Util. BT. MdlRole | | | |
| 序号 | 字段名 | 字段描述 | 类型 | 备注 |
| 1 | Parref | Dr | 指向表 DHCMA. Util. BT. MdlDef | |
| 2 | Childsub | String | | |
| 3 | BTCode | 角色代码 | String | |
| 4 | BTDesc | 角色名称 | String | |
| | | | | |
| 1.5.2 | 模块操作权限表 DHCMA. Util. BT. MdlPower | | | |
| 序号 | 字段名 | 字段描述 | 类型 | 备注 |
| 1 | ID | Stirng | | |
| 2 | BTGroupID | 指向安全组 | String | 记录 DHCMA. Util. BT. SSGroup. OID HIS 安全组 ID，用于数据一致性 |
| 3 | BTMdlDefDr | 系统模块定义 | Dr | 指向表 DHCMA. Util. BT. MdlDef |
| 4 | BTMdlRoleDr | 系统模块角色 | Dr | 指向表 DHCMA. Util. BT. MdlRole |
| 5 | BTIsActive | 有效标志 | Boolean | |
| 6 | BTActDate | 日期 | Date | |
| 7 | BTActTime | 时间 | Time | |
| 8 | BTActUserID | 操作人 ID | String | 记录 DHCMA. Util. EP. SSUser. OID HIS 用户 ID，用于数据一致性 |
| | | | | |
| 1.6 | 系统参数表 DHCMA. Util. BT. Config | | | |
| 序号 | 字段名 | 字段描述 | 类型 | 备注 |
| 1 | BTCode | 代码 | String | |
| 2 | BTDesc | 描述 | String | |
| 3 | BTValue | 配置值 | String | |
| 4 | BTHospID | 医院 | String | DHCMA. Util. EP. Hospital. OID |
| 5 | BTProductDr | 产品线 | Dr | DHCMA. Util. BT. Product |
| 6 | BTIsActive | 有效标志 | Boolean | |
| 7 | BTComments | 备注 | String | |
| 8 | BTActDate | 处置日期 | Date | |
| 9 | BTActTime | 处置时间 | Time | |
| 10 | BTActUserID | 处置人 ID | String | DHCMA. Util. EP. SSUser. OID |
| | | | | |
| 2.1 | HIS 医院列表 DHCMA. Util. EP. Hospital+DHCMA. Util. EPx. Hospital | | | |
| 序号 | 字段名 | 字段描述 | 类型 | 备注 |
| 1 | OID | 医院 ID | String | |
| 2 | BTCode | 组织机构代码 | String | |
| 3 | BTDesc | 医疗机构名称 | String | |
| 4 | BTDesc2 | 医院别名 | String | |
| 5 | BTGroupDr | 医院分组 | Date | DHCMA. Util. BT. HospGroup |
| 6 | BTRangeID | 值域 ID | String | DHCMA. Util. EP. Hospital. OID |
| 7 | BTIsActive | 有效标志 | Boolean | |
| 8 | BTActDate | 日期 | Date | |
| 9 | BTActTime | 时间 | Time | |
| 10 | BTActUserID | 操作人 ID | String | 记录 DHCMA. Util. EP. SSUser. OID HIS 用户 ID，用于数据一致性 |
| 11 | SYSDr | 系统指针 | Dr | 指向表 DHCMA. Util. BT. SYSTEM |
| 12 | SYSOID | 字典指针 | String | |
| | | | | |
| 2.2 | HIS 科室表 DHCMA. Util. EP. Location+DHCMA. Util. EPx. Location | | | |
| 序号 | 字段名 | 字段描述 | 类型 | 备注 |
| 1 | OID | 科室 ID | String | |
| 2 | BTCode | 科室代码 | String | |
| 3 | BTDesc | 科室名称 | String | |
| 4 | BTDesc2 | 科室别名 | String | |
| 5 | BTType | 科室类型 | Date | |
| 6 | BTHospID | 所属医院 ID | String | |
| 7 | BTRangeID | 值域 ID | String | DHCMA. Util. EP. Location. OID |
| 8 | BTIsActive | 有效标志 | Boolean | |
| 9 | BTActDate | 日期 | Date | |
| 10 | BTActTime | 时间 | Time | |
| 11 | BTActUserID | 操作人 ID | String | 记录 DHCMA. Util. EP. SSUser. OID HIS 用户 ID，用于数据一致性 |
| 12 | SYSDr | 系统指针 | Dr | 指向表 DHCMA. Util. BT. SYSTEM |
| 13 | SYSOID | 字典指针 | String | |
| | | | | |
| 2.3 | HIS 用户表 DHCMA. Util. EP. SSUser+DHCMA. Util. EPx. SSUser | | | |
| 序号 | 字段名 | 字段描述 | 类型 | 备注 |
| 1 | OID | 用户 ID | String | |
| 2 | BTCode | 用户代码 | String | |
| 3 | BTDesc | 用户名称 | String | |
| 4 | BTPassword | 用户密码 | String | |
| 5 | BTLocID | 用户科室 | String | |
| 6 | BTCareProvID | 指向医护人员 | String | |
| 7 | BTRangeID | 值域 ID | String | DHCMA. Util. EP. SSUser. OID |
| 8 | BTIsActive | 有效标志 | Boolean | |
| 9 | BTActDate | 日期 | Date | |
| 10 | BTActTime | 时间 | Time | |
| 11 | BTActUserID | 操作人 ID | String | 记录 DHCMA. Util. EP. SSUser. OID HIS 用户 ID，用于数据一致性 |
| 12 | SYSDr | 系统指针 | Dr | 指向表 DHCMA. Util. BT. SYSTEM |
| 13 | SYSOID | 字典指针 | String | |
| | | | | |
| 2.4 | HIS 安全组表 DHCMA. Util. EP. SSGroup+DHCMA. Util. EPx. SSGroup | | | |
| 序号 | 字段名 | 字段描述 | 类型 | 备注 |
| 1 | OID | 安全组 ID | String | |
| 2 | BTDesc | 安全组名称 | String | |
| 3 | BTIsActive | 有效标志 | Boolean | |
| 4 | BTActDate | 日期 | Date | |
| 5 | BTActTime | 时间 | Time | |
| 6 | BTActUserID | 操作人 ID | String | 指向 DHCMA. Util. EP. SSGroup. OID |
| 7 | SYSDr | 系统指针 | Dr | 指向表 DHCMA. Util. BT. SYSTEM |
| 8 | SYSOID | 字典指针 | String | |
| | | | | |
| 2.5 | HIS 医护人员表 DHCMA. Util. EP. CareProv+DHCMA. Util. EPx. CareProv | | | |
| 序号 | 字段名 | 字段描述 | 类型 | 备注 |
| 1 | OID | 人员 ID | String | |
| 2 | BTCode | 工号 | String | |
| 3 | BTDesc | 名称 | String | |
| 4 | BTType | 医护类型 | String | |
| 5 | BTRangeID | 值域 ID | String | DHCMA. Util. EP. CareProv. OID |
| 6 | BTIsActive | 有效标志 | Boolean | |
| 7 | BTActDate | 日+C: L 期 | Date | |
| 8 | BTActTime | 时间 | Time | |
| 9 | BTActUserID | 操作人 ID | String | 记录 DHCMA. Util. EP. SSUser. OID HIS 用户 ID，用于数据一致性 |
| 10 | SYSDr | 系统指针 | Dr | 指向表 DHCMA. Util. BT. SYSTEM |
| 11 | SYSOID | 字典指针 | String | |
| | | | | |
| 2.6 | HIS 基础字典表 DHCMA. Util. EP. Dictionary+DHCMA. Util. EPx. Dictionary | | | |
| 序号 | 字段名 | 字段描述 | 类型 | 备注 |
| 1 | OID | 基础字典 ID | String | |
| 2 | BTCode | 代码 | String | |
| 3 | BTDesc | 名称 | String | |
| 4 | BTTypeDr | 字典类型 | Dr | DHCMA. Util. BT. DicType |
| 5 | BTRangeID | 值域 ID | String | DHCMA. Util. EP. Dictionary. OID |
| 6 | BTIsActive | 有效标志 | Boolean | |
| 7 | BTActDate | 日期 | Date | |
| 8 | BTActTime | 时间 | Time | |
| 9 | BTActUserID | 操作人 ID | String | 记录 DHCMA. Util. EP. SSUser. OID HIS 用户 ID，用于数据一致性 |
| 10 | SYSDr | 系统指针 | Dr | 指向表 DHCMA. Util. BT. SYSTEM |
| 11 | SYSOID | 字典指针 | String | |
| | | | | |
| 2.7 | HIS 医嘱项表 DHCMA. Util. EP. OrdMast+DHCMA. Util. EPx. OrdMast | | | |
| 序号 | 字段名 | 字段描述 | 类型 | 备注 |
| 1 | OID | 医嘱 ID | String | |
| 2 | BTCode | 医嘱代码 | String | |
| 3 | BTDesc | 医嘱名称 | String | |
| 4 | BTCatDesc | 医嘱分类 | String | |
| 5 | BTType | 医嘱类型 | Date | |
| 6 | BTIsActive | 有效标志 | Boolean | |
| 7 | BTActDate | 日期 | Date | |
| 8 | BTActTime | 时间 | Time | |
| 9 | BTActUserID | 操作人 ID | String | 记录 DHCMA. Util. EP. SSUser. OID HIS 用户 ID，用于数据一致性 |
| 10 | SYSDr | 系统指针 | Dr | 指向表 DHCMA. Util. BT. SYSTEM |
| 11 | SYSOID | 字典指针 | String | |
| | | | | |
| 2.8.1 | HIS 送检标本表 DHCMA. Util. EP. Specimen+DHCMA. Util. EPx. Specimen | | | |
| 序号 | 字段名 | 字段描述 | 类型 | 备注 |
| 1 | OID | 标本 ID | String | |
| 2 | BTCode | 标本代码 | String | |
| 3 | BTDesc | 标本名称 | String | |
| 4 | BTIsActive | 有效标志 | Boolean | |
| 5 | BTActDate | 日期 | Date | |
| 6 | BTActTime | 时间 | Time | |
| 7 | BTActUserID | 操作人 ID | String | 记录 DHCMA. Util. EP. SSUser. OID HIS 用户 ID，用于数据一致性 |
| 8 | SYSDr | 系统指针 | Dr | 指向表 DHCMA. Util. BT. SYSTEM |
| 9 | SYSOID | 字典指针 | String | |
| | | | | |
| 2.8.2 | HIS 检验项目表 DHCMA. Util. EP. TestCode+DHCMA. Util. EPx. TestCode | | | |
| 序号 | 字段名 | 字段描述 | 类型 | 备注 |
| 1 | OID | 检验项目 ID | String | |
| 2 | BTCode | 检验项目代码 | String | |
| 3 | BTDesc | 检验项目名称 | String | |
| 4 | BTRstFormat | 结果类型 | String | |
| 5 | BTAbFlagS | 异常标志 | String | |
| 6 | BTClDiagnos | 临床意义 | String | |
| 7 | BTWCode | 正常参考值 | String | |
| 8 | BTIsActive | 缩写码 | String | |
| 9 | BTIsActive | 有效标志 | Boolean | |
| 10 | BTActDate | 日期 | Date | |
| 11 | BTActTime | 时间 | Time | |
| 12 | BTActUserID | 操作人 ID | String | 记录 DHCMA. Util. EP. SSUser. OID HIS 用户 ID，用于数据一致性 |
| 13 | SYSDr | 系统指针 | Dr | 指向表 DHCMA. Util. BT. SYSTEM |
| 14 | SYSOID | 字典指针 | String | |
| | | | | |
| 2.8.3 | HIS 检验医嘱表 DHCMA. Util. EP. TestSet+DHCMA. Util. EPx. TestSet | | | |
| 序号 | 字段名 | 字段描述 | 类型 | 备注 |
| 1 | OID | 检验医嘱 ID | String | |
| 2 | BTCode | 检验医嘱代码 | String | |
| 3 | BTDesc | 检验医嘱名称 | String | |
| 4 | BTCode2 | 医嘱代码 | String | |
| 5 | BTDesc2 | 医嘱名称 | String | |
| 6 | BTIsActive | 有效标志 | Boolean | |
| 7 | BTActDate | 日期 | Date | |
| 8 | BTActTime | 时间 | Time | |
| 9 | BTActUserID | 操作人 ID | String | 记录 DHCMA. Util. EP. SSUser. OID HIS 用户 ID，用于数据一致性 |
| 10 | SYSDr | 系统指针 | Dr | 指向表 DHCMA. Util. BT. SYSTEM |
| 11 | SYSOID | 字典指针 | String | |
| | | | | |
| 2.8.4 | 检验医嘱与检验项目关联表 DHCMA. Util. EPx. TestSetTC | | | |
| 序号 | 字段名 | 字段描述 | 类型 | 备注 |
| 1 | TestSetDr | 检验医嘱指针 | Dr | 执行表 DHCMA. Util. EPx. TestSet |
| 2 | TestCodeDr | 检验项目指针 | Dr | 指向表 DHCMA. Util. EPx. TestCode |
| | | | | |
| | | | | |
| 2.9.1 | HIS 就诊表 DHCMA. Util. EP. Episode+DHCMA. Util. EPx. Episode | | | |
| 序号 | 字段名 | 字段描述 | 类型 | 备注 |
| 1 | OID | 就诊 ID | String | |
| 2 | PAPatientID | 病人 ID | String | |
| 3 | PAAdmType | 就诊类型 | String | |
| 4 | PAVisitStatus | 就诊状态 | String | |
| 5 | PAAdmNo | 住院号 | String | |
| 6 | PAPapmiNo | 登记号 | String | |
| 7 | PAMrNo | 病案号 | String | |
| 8 | PAPatName | 姓名 | String | |
| 9 | PASex | 性别 | String | |
| 10 | PANation | 民族 | String | |
| 11 | PABirthday | 出生日期 | Date | |
| 12 | PAAge | 年龄 | String | |
| 13 | PAIdentityCode | 身份证号码 | String | |
| 14 | PAHomeAddress | 现住址 | String | |
| 15 | PACompany | 工作单位 | String | |
| 16 | PARelativeName | 联系人 | String | |
| 17 | PARelativeTel | 联系人电话 | String | |
| 18 | PAIsDeath | 死亡标志 | Boolean | |
| 19 | PADeathDate | 死亡日期 | Date | |
| 20 | PADeathTime | 死亡时间 | Time | |
| 21 | PAAdmTimes | 住院次数 | Integer | |
| 22 | PAAdmDate | 入院日期 | Date | |
| 23 | PAAdmTime | 入院时间 | Time | |
| 24 | PAAdmDateT | 入院日期时间 | String | |
| 25 | PAAdmLocID | 就诊科室 | String | |
| 26 | PAAdmLocDesc | 就诊科室 Desc | String | |
| 27 | PAAdmWardID | 就诊病区 | String | |
| 28 | PAAdmWardDesc | 就诊病区 Desc | String | |
| 29 | PAAdmRoom | 就诊房间 | String | |
| 30 | PAAdmBed | 就诊床位 | String | |
| 31 | PAAdmDocID | 主管医生 | String | |
| 32 | PAAdmDocName | 主管医生姓名 | String | |
| 33 | PADischDate | 出院日期 | Date | |
| 34 | PADischTime | 出院时间 | Time | |
| 35 | PADischDateT | 出院日期时间 | String | |
| 36 | PAAdmDays | 住院天数 | String | |
| 37 | PAIsNewBaby | 新生儿标志 | Boolean | |
| 38 | PABirthWeight | 新生儿出生体重（g）| String | |
| 39 | PAAdmitWeight | 新生儿入院体重（g）| String | |
| 40 | PAMotherDr | 母亲就诊指针 | String | |
| 41 | PAUpdateDate | 更新日期 | Date | |
| 42 | PAUpdateTime | 更新时间 | Time | |
| 43 | SYSDr | 系统指针 | Dr | 指向表 DHCMA. Util. BT. SYSTEM |
| 44 | SYSOID | 字典指针 | String | |
| | | | | |
| 2.9.2 | 就诊队列表 DHCMA. Util. EPx. EpisQueue | | | |
| 序号 | 字段名 | 字段描述 | 类型 | 备注 |
| 1 | EQType | 队列类型（允许自定义、默认：在院 Admit，出院 Disch，提交病历 Emr，编目完成 Coding）| Dr | 指向表 DHCMA. Util. BT. SYSTEM |
| 2 | EQEpisID | 队列就诊 ID | String | |
| 3 | EQEpisInfo | 队列就诊信息 | | |
| 4 | EQStatus | 队列状态（完成 1，未完成 0）| | |
| 5 | EQActDate | 队列日期 | | |
| 6 | EQActTime | 队列时间 | | |