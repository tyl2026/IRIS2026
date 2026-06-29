# CLAUDE.md — IRIS HIS 项目开发规范

## 项目概述

基于 InterSystems IRIS for Health 2021.1 的医院信息系统（HIS），覆盖门诊、住院、护理、药房、收费、医保、预约挂号等核心业务域。项目包含：

- **HIS 基础 UI 组件参考** — `HIS_base_skill/` 目录下收录了 HIS 系统的标准页面样本
- **ECO 业务模块** — 费用统计、预约管理、诊断录入等生产级业务代码参考

数据库版本：IRIS 2021.1.2（UNIX），端口 52773

> **全局约束**:
>
> - 名称包含"原文件"的文件夹（如 `HISUI-优化/00原文件/`）内文件为原始参考，**禁止修改、更新、删除**，仅可读取分析
> - 所有修改/新增文件默认输出到"优化中"文件夹（如 `HISUI-优化/01优化中/`），不得直接覆盖原文件，除非用户明确指定路径
> - 生成新 CLS 类**必须用 `.cls` 源码格式**，禁止生成 `.xml` 导出格式
> - **代码修改原则**：修改已有文件时，必须基于 `00原文件/` 中的原始副本进行**最小化精确编辑**，只改需求涉及的行，其余代码一字不动。修改完成后用 `diff` 对比原文件验证，确保变更精确可控
> - **先确认，不臆断**：动手前必须确认参考文件的**实际内容**（文件大小、完整度、是否占位），参考文件为空或异常时先告知用户确认，**不得臆断内容后直接新建**

#### 数据验证约束 — 未确认不得修改

**以下情况必须先与用户确认，不得直接修改代码或文件：**

| 场景                    | 正确做法                                                       | 错误做法                                         |
| ----------------------- | -------------------------------------------------------------- | ------------------------------------------------ |
| Global 名/索引名不确定  | 查找 XML/CSV 工具表验证，无文件则请用户提供或终端测试          | 凭经验猜测                                       |
| 字段 Piece 位置不确定   | 读取工具表 CSV 的`propertyPiece` 字段确认                    | 用 SQL 列号、凭记忆推测                          |
| 数据链路不明确          | 终端`zw` 逐层验证，贴输出给用户确认                          | 直接改代码"试试看"                               |
| 需求理解有歧义          | 列出方案让用户确认后再动手                                     | 直接按自己理解写代码                             |
| 子表/子节点结构未知     | 通过 XML Storage 或终端验证                                    | 假设下标名如`"I"` / `"ITEM"`                 |
| 业务逻辑不确定          | 问用户或看参考代码                                             | 臆断业务规则                                     |
| 终端输出为空/异常       | 把输出贴给用户分析                                             | 忽略异常继续改代码                               |
| **编译/运行报错** | **先定位行号 → 读上下文 → 分析根因 → 确认后单点修改** | **盲目试改、批量替换、未确认根因就动代码** |

> **核心原则**：
>
> 1. 数据、问题、需求、方案，凡未经工具表验证或用户确认的，一律不准修改代码。先问、先查、先验证，再动手。
> 2. **只修改用户要求修改的内容**，不顺手重构、不顺便优化、不扩展范围。用户说修 A 就只修 A，不动 B/C/D。
> 3. **发现问题立即反馈**，不隐瞒、不绕过、不自作主张修复。
> 4. **永远用最简单的代码逻辑实现需求**，不引入不必要的复杂度。能一行 `$o` + `while` 搞定的不写三阶段架构。

## 技术栈

| 技术                | 用途                                   | 文件扩展名            |
| ------------------- | -------------------------------------- | --------------------- |
| ObjectScript        | IRIS 后端语言                          | `.cls`              |
| CSP                 | 服务端页面（混合 HTML + ObjectScript） | `.csp`              |
| HTML/CSS/JavaScript | 前端，原生无框架                       | —                    |
| HISUI               | 新版 HIS 前端组件库                    | 引入`hisui.min.css` |
| Bootstrap 3.0.3     | 登录页/部分页面布局                    | —                    |
| jQuery              | DOM 操作                               | —                    |
| Font Awesome        | 图标                                   | —                    |

## 项目结构

```
IRIS/
├── CLAUDE.md
├── references/
│   └── his-ui-style-guide.md      # HIS UI 风格规范（颜色/按钮/表格/组件）
├── APHAQII评分表/
│   └── csp版本/
│       ├── ApacheII.Setup.cls     # 一键部署脚本
│       ├── ApacheII.Model.Assessment.cls  # 数据模型
│       ├── ApacheII.API.Handler.cls   # REST API 处理器
│       ├── apache2.csp            # 评分计算器页面
│       └── query.csp              # 数据查询页面
├── ECO/                           # 费用统计等业务模块
├── HIS_base_skill/                # HIS 标准 UI 参考样本
│   ├── websys.css / websys.js     # 核心样式/脚本
│   └── ...                        # 登录页、诊断录入、护理执行、医嘱列表等
└── skills/
    ├── iris-code-formatter/       # ObjectScript 代码格式化 skill
    └── skill-creator/             # Skill 创建/优化工具
```

## 架构

### 三层架构（通用模式）

1. **数据层** — `%Persistent` 类或直接操作 Global，定义索引和存储结构
2. **API/业务层** — `%CSP.REST` 处理器或 ClassMethod 业务逻辑类
3. **展示层** — CSP 页面 + HISUI 组件 + JavaScript

### 基类继承链

大部分业务类继承 `DHCDoc.Util.RegisteredObject`，提供工具方法：

- `..%SysDate()` / `..%SysTime()` — 当前日期/时间
- `..%ZDH(dateStr)` / `..%ZD(dateH)` — 日期转换
- `..%ZTH(timeStr)` / `..%ZT(timeH)` — 时间转换
- `..FormatDesc(desc)` — 去掉科室名称中的 "-" 前缀

---

## HIS 系统需求分析（基于 IRIS 2021 数据库）

### 核心数据模型

理解 HIS 的数据模型是需求分析的第一步。以下是关键 Global 及其业务含义：

#### 患者与就诊（Patient & Admission）

| Global                                   | 存储内容     | 关键字段                                                      |
| ---------------------------------------- | ------------ | ------------------------------------------------------------- |
| `^PAPER(patId,"ALL")`                  | 患者主索引   | 姓名、性别、出生日期、身份证号                                |
| `^PAPER(patId,"PAT",1)`                | 患者登记号   | 登记号(REGNO)、住院号(medno)                                  |
| `^PAPER(patId,"PER",1)`                | 患者扩展信息 | 费别类别、联系电话                                            |
| `^PAADM(admId)`                        | 就诊记录     | 患者ID、就诊类型(I/O/E/H)、就诊科室、就诊日期、状态、出院日期 |
| `^PAPERDR(patId,"RB_Appt",status,...)` | 患者预约索引 | 按状态索引患者的预约记录                                      |

**就诊类型**: `I`=住院 `O`=门诊 `E`=急诊 `H`=体检

#### 医嘱与收费（Orders & Billing）

| Global                             | 存储内容        | 关键字段                                                                 |
| ---------------------------------- | --------------- | ------------------------------------------------------------------------ |
| `^OEORD(ord,"I",sub,1)`          | 医嘱项目        | arcim项目ID、开始日期时间、状态                                          |
| `^OEORD(ord,"I",sub,"X",ore)`    | 医嘱执行记录    | 执行日期、执行状态(1=已执行)                                             |
| `^ARCIM(sub,ver,1)`              | 医嘱项目目录    | 项目代码、项目名称                                                       |
| `^DHCTARI(tarId)`                | 收费项目目录    | 收费代码、收费名称                                                       |
| `^DHCWorkLoad(wlId)`             | 工作量/计费明细 | 接收科室、医嘱项目、数量、单价、金额、就诊ID、患者ID、账单号、收费项目ID |
| `^DHCPB(billId)`                 | 患者账单        | 支付状态(P=已付/B=部分付)、退款标志                                      |
| `^DHCPB(billId,"O",...,"D",...)` | 账单明细        | 计费日期、计费时间                                                       |

**WorkLoad 表索引链**: `^DHCWorkLoad(0,"ORDDATE",date,wlId)` — 按日期查询 > `^DHCWorkLoad(0,"DateItemOrd",date,arcimId,wlId)` — 按日期+医嘱项 > `^DHCWorkLoad(0,"TARITEM",tarId,wlId)` — 按收费项 > `^DHCWorkLoad(0,"PAADM",admId,wlId)` — 按就诊

#### 预约与排班（Appointment & Schedule）

| Global                                    | 存储内容     | 关键字段                                                 |
| ----------------------------------------- | ------------ | -------------------------------------------------------- |
| `^RB("RES",resId)`                      | 医生资源     | 科室ID、医生ID                                           |
| `^RBAS(resId,asChild)`                  | 排班记录     | 日期、号源限额、开始时间、预约起始号、号串(DHC节点)      |
| `^RBAS(resId,asChild,"APPT",apptChild)` | 预约记录     | 预约类型、患者ID、状态(I/A/X/J)、就诊ID、诊号            |
| `^RBAS(resId,asChild,"DHC")`            | 排班扩展     | 号串(`$C(1)`分隔正号/加号)、停正号标志、时段标志、状态 |
| `^RBAS(resId,asChild,"AQ",aqSub)`       | 预约限额配置 | 预约方式ID、保留号数、最大号数                           |
| `^RBAS(resId,asChild,"ASTR",astrSub)`   | 分时段配置   | 时段起止时间、号数、时段号串                             |

**预约状态**: `I`=已预约 `A`=已取号 `X`=已取消 `J`=爽约
**号源状态**: `0`=可用 `1`=现场已挂 `2`=已预约 `3`=预约取号 `4`=退号 `5`=诊间加号
**号串格式**: `"QueueNo:Status[:MethodId],..."` — 正号串与加号串用 `$C(1)` 分隔

#### 医保（Insurance）

| Global                       | 存储内容          | 关键字段                                                              |
| ---------------------------- | ----------------- | --------------------------------------------------------------------- |
| `^DHCINADM(inadmId)`       | 医保就诊记录      | 中心ID、激活标志、医疗类别、医保类型(00A=职工医保)、险种类型(310/390) |
| `^DHCINDIV(inpayId)`       | 医保结算记录      | 支付标志(I=已结算)、医保就诊ID                                        |
| `^DHCBCI(0,"Bill",billId)` | 账单-医保交叉索引 | 发票ID                                                                |

险种类型: `310`=职工 `390`=城乡 | 地区识别: 通过中心ID前4位(`4311`=永州, `43xx`=省内异地, 其他=跨省异地)

#### 基础数据（Foundation）

| Global                      | 存储内容                                          |
| --------------------------- | ------------------------------------------------- |
| `^CTLOC(locId)`           | 科室 — 代码、名称、医院ID、预约回归时间          |
| `^CTPCP(cpId,1)`          | 医护人员 — 姓名、职称                            |
| `^SSU("SSUSR",userId)`    | 系统用户 — 姓名、安全组、默认科室                |
| `^RBC("APTM",methodId)`   | 预约方式 — 代码(TEL/WIN/...)、名称、当天预约标志 |
| `^RBC("AT",typeId)`       | 预约类型(NORN/APP/DOC/...)                        |
| `^MRC("ID",icdId)`        | ICD 诊断编码                                      |
| `^DHCTimeRange(trId)`     | 时段定义 — 名称、回归时间阈值                    |
| `^PAC("ADMREA",reasonId)` | 费别(就诊原因)                                    |
| `^PHCFR(freqId)`          | 用药频次(QD/BID/TID...)                           |
| `^CD.PHA.IN.STAT(type)`   | 药品分类                                          |

#### EMR 实例系统

| Global / 类                                                                         | 说明                                                                 |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `^DHCEMRI.InstanceDataI("IdxModifyDate",date,...)`                                | 按修改日期遍历 EMR 实例                                              |
| `^DHCEMRI.InstanceDataI("IdxEpisodeStatusHappenDateTime",Adm," SAVE",...)`        | 按就诊+状态遍历 EMR                                                  |
| `EMRinstance.InstanceData.%OpenId(id)`                                            | 实例对象:`.EpisodeID.%Id()` `.Title` `.Status` `.CreateUser` |
| `EMRservice.BL.BLScatterData.GetNewStdDataByGlossaryCategory(Adm,"HDSD00.03.01")` | 门诊病历结构化段落                                                   |

### 业务域模块

| 域                 | 核心类                                                                     | 功能范围                                                    |
| ------------------ | -------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **预约挂号** | `web.DHCRBAppointment`, `web.DHCRBApptSchedule`, `web.DHCRBResource` | 预约→取号→退约→爽约→恢复 全生命周期，号源分配与限额管理 |
| **门诊医嘱** | `web.DHCDocOrderEntry`, `oeorder.oplistcustom.new.csp`                 | 门诊医嘱录入、药品/检查/检验项目选择                        |
| **诊断录入** | `web.DHCDocDiagnosEntryV8`, `diagnosentry.v8.csp`                      | ICD 诊断编码录入（西医/中医/证型）                          |
| **护理执行** | `web.DHCEMNurExe`, `dhcem.nur.exec.hisui.csp`                          | 护理任务执行、观察记录、评估表                              |
| **费用统计** | `web.DHCWLfeeSum`, `DHCWLfeeSum.csp`                                   | 按时间/科室/医嘱/药品分类等多维度统计收入                   |
| **医保结算** | `DHCINADM`, `DHCINDIV`, `web.INSUDicDataCom`                         | 医保登记、费用上传、结算、异地就医识别                      |
| **ICU 评分** | `ApacheII.Model.Assessment`, `ApacheII.API.Handler`                    | APACHE II 急性生理评分 + 预测死亡率                         |

### 需求分析要点

在接到新需求时，按以下思路分析：

1. **数据来源** — 所需数据在哪个 Global 中？是否需要新建？索引是否已覆盖查询场景？
2. **业务域归属** — 属于哪个业务模块？是否与现有类功能重叠？
3. **就诊类型区分** — 门诊(O)/住院(I)/急诊(E)/体检(H) 流程不同，需分别考虑
4. **多院区支持** — 几乎所有方法都传 `HospitalID`，新功能需考虑院区隔离
5. **并发安全** — 号源等共享资源必须用 `lock +^XXX:n` 加固，设超时
6. **事务边界** — 写操作涉及多表时用 `ts`/`tc`/`tro`，控制在单方法内
7. **医保适配** — 费用相关功能需考虑险种类型(职工/城乡)、异地就医标记

---

## 接口对接

### 集成平台接口（Ensemble/集成平台）

主入口类 `web.DHCENS.EnsHISService`，方法 `DHCHisInterface(actionCode, data)`：

| ActionCode                     | 触发时机                        | 说明                       |
| ------------------------------ | ------------------------------- | -------------------------- |
| `SENDTAKEAPPTSCHEDULEINFO`   | 预约创建成功(`Insert`)        | 向集成平台推送预约挂号信息 |
| `SENDCANCELAPPTSCHEDULEINFO` | 预约取消(`CancelAppointment`) | 向集成平台推送取消预约信息 |

**调用模式**:

```objectscript
s rtn = ##class(web.DHCENS.EnsHISService).DHCHisInterface("SENDTAKEAPPTSCHEDULEINFO", RBAppId)
```

### 外部系统接口

| 接口类                                | 方法                                     | 用途                        | 触发条件                                  |
| ------------------------------------- | ---------------------------------------- | --------------------------- | ----------------------------------------- |
| `dhcinterface.TeleClient`           | `notifyGetNumber(RBASRowId)`           | 通知 114 电话预约平台已取号 | 预约方式为`TEL` 且 `IFTeleAppStart=1` |
| `dhcinterface.DoctorApptScheClient` | `SetScreenDisplayMsg(RBASId,FullFlag)` | 刷新大屏号别状态            | `IFScreenStart=1`，爽约/取消时触发      |

### 配置驱动功能开关

系统通过 `##class(web.DHCOPRegConfig).GetSpecConfigNode(ConfigKey, HospitalID)` 统一管理功能开关：

| 配置键                      | 功能                       | 取值       |
| --------------------------- | -------------------------- | ---------- |
| `IFTeleAppStart`          | 启用 114 电话预约对接      | 1=启用     |
| `IFScreenStart`           | 启用大屏号别显示           | 1=启用     |
| `AppReturnNotAllowRegAdd` | 预约回归不释放号源且增号   | 1=启用     |
| `ReturnNotAllowAdd`       | 退号不释放资源且增加资源数 | 1=启用     |
| `AppStartTime`            | 预约开放时间               | 时间字符串 |
| `AddStartTime`            | 加号开放时间               | 时间字符串 |
| `AppBreakLimit`           | 爽约次数限制               | 数字       |
| `AdvanceAppAdm`           | 是否可提前取预约号         | 1=启用     |

**配置使用模式**:

```objectscript
s AppStartTime = ##class(web.DHCOPRegConfig).GetSpecConfigNode("AppStartTime", HospitalID)
```

### REST API 模式

项目中 REST API 继承 `%CSP.REST`，通过 URL 路由分发：

```objectscript
Class ApacheII.API.Handler Extends %CSP.REST
{
XData UrlMap
{
<Routes>
  <Route Url="/save"    Method="POST" Call="SaveData"/>
  <Route Url="/records" Method="GET"  Call="GetRecords"/>
  <Route Url="/health"  Method="GET"  Call="HealthCheck"/>
</Routes>
}
```

### 会话与认证

登录认证通过 `websys.SessionLogon.Logon()` 完成，登录后设置 Session 变量：

- `%session.Get("LOGON.USERID")` — 用户 ID
- `%session.Get("LOGON.USERNAME")` — 用户名
- `%session.Get("LOGON.GROUPID")` — 安全组 ID
- `%session.Get("LOGON.CTLOCID")` — 登录科室 ID
- `%session.Get("LOGON.HOSPID")` — 登录院区 ID
- `%session.Get("LOGON.WARDID")` — 登录病区 ID

### 前端调用后端方法

前端通过加密调用防止参数篡改：

```javascript
// JavaScript 端
var encrypted = websys.Page.Encrypt($lb("web.DHCRBAppointment", "Insert", paramStr));
$.ajax({ url: $URL, data: { Encrypt: encrypted } });
```

```objectscript
// ObjectScript 端解密
Set decrypted = ##class(websys.Page).Decrypt(%request.Get("Encrypt"))
Set className = $lg(decrypted, 1)
Set methodName = $lg(decrypted, 2)
```

### 外部系统依赖

| 系统               | 地址/类                                                | 用途                     |
| ------------------ | ------------------------------------------------------ | ------------------------ |
| 湖南省医保平台     | `dps.hun.hsip.gov.cn`                                | 医保登记、结算、异地就医 |
| 药品信息查询       | `192.168.90.235/LCYY/interface/YPXX.aspx`            | 药品目录同步             |
| CA 数字签名        | `CA.DigitalSignatureService`, `websys.CAInterface` | 电子签名认证             |
| 临床决策支持(CDSS) | `DHCDSS.js`                                          | 辅助诊疗建议             |
| Portal 门户        | `DtPortal.Doctor.DHCDocComService`                   | 医生站门户数据推送       |

---

## 部署

```objectscript
do ##class(ApacheII.Setup).Run()
```

## 代码规范

### ObjectScript 代码

所有 ObjectScript 代码（`.cls`、`.csp`、`.mac`）必须遵循 **iris-code-formatter** skill 定义的编码规范。

代码审查、格式化、风格修正时该 skill 会自动激活，涵盖 8 个维度共 74 条规则：
变量命名、方法命名、锁、事务、陷阱、格式、空行、注释。

关键速记：

- 变量 `lowerCamelCase`，方法 `UpperCamelCase`，布尔用 `Flag` 后缀
- 命令统一小写：`for`/`while`/`if` 全拼，其余缩写（`s`/`d`/`q`/`k`/`n`）
- 系统函数缩写：`$e`/`$p`/`$l`/`$o`/`$g`/`$d`
- 锁带 `+`/`-` 和超时，事务 `ts`/`tc`/`tro` 不离屏
- 注释 `#;`/`//`，方法头 `///`

### IRIS 编译陷阱 (CLS 生成必检)

**①  后置条件运算符紧贴操作数，`)&&(` 不空格**

```objectscript
#; 错误 — 空格导致 #1012
continue:(LocID '= "")&&(LocID '= CTLocDR)
#; 正确
continue:(LocID'="")&&(LocID'=CTLocDR)
```

> 块级 `if`/`for` 内可正常空格。

**② 补充：`||` 替代 `!`，`)(` 之间绝对不能加空格**

所有后置命令（`q:` `s:` `i:` `continue:`）含 `&&`/`||` 时，多个条件必须用外层 `()` 包裹，且 `)(` 之间**绝对不能加空格**。

```objectscript
#; 错误 — #1027 Error in SET command
s:(a = "") && (b = c) val = 1
q:(a = "") && (b = c)

#; 正确
s:((a="")&&(b=c)) val = 1
q:((a="")&&(b=c))

#; 错误
q:disDateH = ""!(disDateH < sttDateH)

#; 正确 — 注意 )||( 之间绝对不加空格
q:(disDateH="")||(disDateH < sttDateH)
```

**③ `continue` 仅限循环内，子程序用 `q`**
`do` 调用的 label 退出用 `q`，`continue` 会穿透到外层循环。

**④ `elseif` 必须全拼**，禁止 `eI` / `e i` 缩写。

**⑤ 块级控制结构全拼**：`if`/`for`/`while`/`elseif` 带 `{}` 时不能缩写为 `i`/`f`/`w`。

**⑥ 点语法禁用 `{}` 块** — `.f` `.s` `.i` 等点语法内嵌 `if/else` 必须用 `d`（do）承接，严禁混用 `{ }` 块，否则编译报错 `#1054`。

```objectscript
#; 错误 — 点循环内嵌 {} 块
...if (flag = "sfx") {
....s XmDr = $p(WlData, "^", 22)
...} else {
....s XmDr = ItemOrd
...}

#; 正确 — 用 d 承接
...if (flag = "sfx") d
....s XmDr = $p(WlData, "^", 22)
...else  d
....s XmDr = ItemOrd
```

**⑦ `[` / `'[` 运算符禁止内部空格** — `'[`（不包含）是单个 token，`'` 和 `[` 之间不能有空格。且因 `[` 运算符外侧需空格，在后置式中必须用 `()` 包裹整个条件。

```objectscript
#; 错误 — ' 和 [ 之间有空格，报错 #1017 Invalid operator
continue:(curBatNo ' [ batchNo)

#; 正确 — '[ 是单个 token，无内部空格
continue:(curBatNo '[ batchNo)

#; 同样，[ (包含) 外侧需空格，后置式需括号包裹
continue:(curBatNo [ batchNo)
```

### 前端/UI 代码

开发新页面时必须遵循 HIS UI 风格规范（完整细节见 `references/his-ui-style-guide.md`）。

#### 页面模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>页面标题</title>
<EXTHEALTH:HEAD></EXTHEALTH:HEAD>
<HISUI></HISUI>
</head>
<body>
<!-- 页面内容 -->
</body>
</html>
```

#### 颜色体系

| 用途       | 色值        | 说明                            |
| ---------- | ----------- | ------------------------------- |
| 主色调     | `#017bce` | 菜单栏背景                      |
| 标题文字   | `#15428b` | 深蓝                            |
| 主边框     | `#95B8E7` | 输入框、面板边框                |
| 面板背景   | `#F9FBFF` | 表单区、表格容器                |
| 标题栏背景 | `#E4F0FF` | `.maintitle` / `.formtitle` |
| 页面底色   | `#cee4ff` | BODY 背景                       |
| Focus 高亮 | `#ffe48d` | 输入框获焦背景                  |
| Focus 边框 | `#6b9cde` | 输入框获焦边框                  |
| 禁用背景   | `#dddddd` | 只读/禁用字段                   |
| 选中行     | `#FFE48D` | 表格选中行                      |
| 悬停行     | `#eaf2ff` | 表格 hover                      |
| 高亮橙     | `#fd7201` | 菜单 hover、特殊提示            |
| 链接蓝     | `#40A2DE` | 超链接                          |
| 辅助灰     | `#666666` | 次要文字                        |

#### 关键样式

**按钮 (`.i-btn`)**：宽 110px，`border-radius: 5px`，渐变 `#fff → #eee`，边框 `1px solid #bbb`。HISUI 按钮用 `hisui-linkbutton`，图标 `iconCls`（`icon-search`、`icon-w-export`）。

**输入框**：边框 `1px solid #95B8E7`，高 24px。Focus：边框 `#6b9cde`，`box-shadow: 0 0 3px 0 #95B8E7`，背景 `#ffe48d`。禁用态 `.disabledField` 背景 `#dddddd`。

**表格（`.tblList`）**：表头渐变 `#F9F9F9 → #efefef` 高 25px，奇数行 `#fff`，偶数行 `#FAFAFA`，悬停 `#eaf2ff`，选中 `#FFE48D`。HISUI 表格用 `hisui-datagrid`。

**标题栏（`.maintitle`）**：字号 14px，颜色 `#15428b`，加粗，背景 `#E4F0FF`，`padding-left: 28px`，边框 `1px #95B8E7 solid`，高 23px。

#### HISUI 常用组件

```html
<!-- 布局 -->
<div class="hisui-layout" data-options="fit:true">
  <div data-options="region:'north'">...</div>
  <div data-options="region:'center'">...</div>
</div>

<!-- 表单控件 -->
<input class="hisui-datebox" style="width:140px">
<input class="hisui-validatebox textbox">
<input class="hisui-combobox">

<!-- 按钮 -->
<a class="hisui-linkbutton" data-options="iconCls:'icon-search'">查询</a>

<!-- 数据表格 -->
<table id="dg" class="hisui-datagrid"></table>

<!-- 手风琴 -->
<div class="hisui-accordion">
  <div title="标题" data-options="iconCls:'icon-w-update',selected:true">内容</div>
</div>
```

**字体**：全局 `"Microsoft Yahei"`，基础 14px，紧凑 12px，分页 13px。

**通用约定**：全局字体 `"Microsoft Yahei"`；CSV 导出带 BOM 兼容 Excel UTF-8；命名空间运行时切换到 `DHC-APP`；ObjectScript 字符串拼接用 `_` 不用 `+`。

#### CSP 页面结构规范

```html
<csp:content type="text/html" charset="utf-8">
<csp:method name="OnPreHTTP" arguments="" returntype="%Boolean">
    s %response.CharSet = "utf-8"
    q 1
</csp:method>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<title>页面标题</title>
<EXTHEALTH:HEAD></EXTHEALTH:HEAD>
<HISUI/>
<style>/* CSS */</style>
</head>
<body>
    <!-- 页面内容：用 hisui-* 类 + 内联 onclick -->
    <script type="text/javascript" src="../scripts/xxx.js"></script>
</body>
</html>
</csp:content>
```

**关键约束**：

- 组件用 `hisui-*` 类：`hisui-layout`、`hisui-datebox`、`hisui-combobox`、`hisui-linkbutton`、`hisui-datagrid`
- 事件用**内联 `onclick`**，不在 JS 中用 jQuery `.click()` 绑定
- **禁止** CSP 内嵌 `<script>` 逻辑块，所有 JS 放在外部文件
- 日期框/下拉框在 JS 中用 `$('#id').datebox('setValue', date)` / `.combobox({...})` 初始化
- 日期预设用 `datebox('setValue', Date对象)`，不用字符串；高亮按钮用 `querySelectorAll` + `window.event.target`

### HISUI 前后端数据交互

HISUI 框架通过 `$cm()` / `$m()` 封装前端到 IRIS 后台的调用，参数为**对象格式**。

| API | 用途 | 返回值 |
|-----|------|--------|
| `$cm(data, success, error)` | 调用后台 Method / Query | JSON 对象（自动 parse） |
| `$m(data, success, error)` | 调用后台方法 | 原始文本，不自动 parse |

**data 参数结构**：

```javascript
$cm({
    ClassName:     "web.YZSY.ClassName",   // 必填，包名.类名
    MethodName:    "MethodName",           // 与 QueryName 二选一（MethodName 优先）
    QueryName:     "QueryName",            // 与 MethodName 二选一
    wantreturnval: 1,                     // 1=有返回值(do) 0=无返回值(set) 默认1
    ResultSetType: "array",               // array: [{},{},{}] | 不配: {"rows":[...],"total":N}
    page:          1,                     // 分页页码
    rows:          20,                    // 每页条数
    // ... 其他自定义参数直接作为后台方法/Query 入参
})
```

**Query 入参映射**：前端参数名直接对应 Query 入参名。前端传 `{SttDate:"2026-01-01"}` → Query `SttDate As %String`。

**ResultSetType 决策**：

| 场景 | ResultSetType | 返回格式 |
|------|---------------|----------|
| datagrid / treegrid | 不配（默认） | `{"rows":[...],"total":N}` |
| combobox / combotree | `"array"` | `[{...},{...}]` |
| 导出 CSV | `"Excel"` | 下载链接 |

**调用模式**：

| 场景 | API | 说明 |
|------|-----|------|
| 后台方法，返回 JSON | `$cm()` | 自动 JSON.parse |
| 后台方法，返回非 JSON | `$m()` | 原始文本 |
| 写入操作 | `$cm({wantreturnval:0})` | set 方式，无返回值 |
| 后台 Query | `$cm()` | MethodName 不传 |
| 同步调用 | `$cm(data, false)` | 不推荐，阻塞 UI |

**关键约束**：
- 框架内置 XSS/SQL 注入关键词过滤（正则边界匹配，非简单包含）
- 依赖 jQuery + websys.jquery.js
- 数组入参：JS `["a","b"]` → 后台 `plist(1)="a", plist(2)="b"`

### 前端 JS 兼容性约束

HIS 客户端为 IE11 内核，**禁止 ES6+ API**：

| 禁用                                     | 替代                             |
| ---------------------------------------- | -------------------------------- |
| `let`/`const`                        | `var`                          |
| `() => {}` 箭头函数                    | `function() {}`                |
| `Promise`/`async`/`await`          | 回调函数                         |
| `padStart`/`startsWith`/`includes` | `indexOf`/手动补位             |
| `for...of`                             | `for (var i=0;...)`            |
| `Array.from()`                         | `Array.prototype.slice.call()` |
| `new Set()` / `new Map()`            | 用对象`{}` 替代                |

### HISUI JS 陷阱（避坑指南）

以下常见 HISUI 前端写法会报错或返回无效数据，必须用右侧替代：

| 禁用                                                                     | 原因                                                               | 替代                                                              |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `$(sel).textbox('setValue',v)` / `$(sel).textbox('getValue')`        | `hisui-validatebox` 未初始化时无 `.textbox()` 方法             | `$(sel).val(v)` / `$(sel).val()`                              |
| `$cm({...}, callback)` | 客户端 `$cm` 可能未定义                     | `$.ajax({url: $URL + '?ClassName=...&QueryName=...', ...})`      |                                                                   |
| `$lb(...)` / `websys.Page.Encrypt(...)` | 客户端 `$lb` 不可用      | CSP`OnPreHTTP` 加 Method 代理，JS 侧直接 `$URL?MethodName=...` |                                                                   |
| `.combobox({data:[], onSelect:fn})` 缺 `filter`                      | 下拉输入框无法检索                                                 | 必须加`filter: function(q,row){...}` 或改用服务端检索           |
| `<table data-options="columns:[[{..., formatter: function(){...}}]]">` | CSP 编译器`#5928` 解析错误                                       | 空`<table>` + JS 中 `$('#dg').datagrid({columns:...})`        |
| `.combobox('loadData', rows)` 单独调用                                 | 仅刷新数据，不补缺失选项                                           | 改用`.combobox({data:rows, filter:..., onSelect:...})` 完整重建 |

**服务端检索 combobox 模板**（大数据量下拉）：

```javascript
function loadSearchCombo(selector, queryName, onSelectFn) {
    $(selector).combobox({
        valueField: 'RowID', textField: 'Desc', data: [],
        onSelect: onSelectFn
    });
    var tb = $(selector).combobox('textbox');
    tb.off('keyup.search').on('keyup.search', function(e) {
        if (e.keyCode >= 37 && e.keyCode <= 40) return;
        if (e.keyCode === 13) return;
        var q = $(this).val();
        clearTimeout(tb.data('searchTimer'));
        tb.data('searchTimer', setTimeout(function() {
            $.ajax({
                url: $URL + '?ClassName=web.XXX&QueryName=FindXXX&searchKey=' + encodeURIComponent(q),
                type: 'GET', dataType: 'json',
                success: function(data) {
                    $(selector).combobox('loadData', data.rows || []);
                }
            });
        }, 250));
    });
}
```

**CSP Method 代理模板**（调用后端类方法）：

```html
<csp:method name="OnPreHTTP" arguments="" returntype="%Boolean">
    s %response.CharSet = "utf-8"
    if ($d(%request.Data("MethodName", 1))) {
        s cls = %request.Get("ClassName")
        s mtd = %request.Get("MethodName")
        w $classmethod(cls, mtd, %request.Get("paramName"))
        q 0
    }
    q 1
</csp:method>
```

JS 侧调用：`$.ajax({url: $URL + '?ClassName=...&MethodName=Save&paramName=...', type:'GET', ...})`

### 第三方 JS 库路径

| 库      | 路径                                        | 用途       |
| ------- | ------------------------------------------- | ---------- |
| SheetJS | `../scripts_lib/SheetJs/xlsx.full.min.js` | Excel 读写 |

新增库在 `irislib/scripts_lib/<库名>/` 存放，更新此表。

## ObjectScript 常用模式

```objectscript
; 创建持久化对象
Set obj = ##class(ClassName).%New()
Set obj.Property = value
Set sc = obj.%Save()

; SQL 查询
Set stmt = ##class(%SQL.Statement).%New()
Set sc = stmt.%Prepare("SELECT * FROM Table WHERE ...")
Set rs = stmt.%Execute(param)
While rs.%Next() { Write rs.%Get("Column") }

; REST API（继承 %CSP.REST）
ClassMethod SaveData() As %Status
{
    Set data = {}.%FromJSON(%request.Content)
    Write result.%ToJSON()
    Quit $$$OK
}

; 遍历 Global
Set key = "" For {
    Set key = $o(^Global(key))
    Quit:key = ""
}

; 日期/时间转换
s dateH = $zdh(dateStr, 3)    ; 字符串 → $H
s dateStr = $zd(dateH, 3)     ; $H → 字符串
s timeStr = $zt($zth(timeStr, 1), 1)

; 多条件 Filter 模式（在 Global 遍历中过滤）
s sub = "" f {
    s sub = $o(^Index(key, sub))
    q:sub = ""
    q:$d(^||TempFilter($j))&&'$d(^||TempFilter($j,sub))
    ; 处理
}
```

### 临时 Global 命名规范

Query 结果用标准 `^CacheTemp(repid, ind)`（Fetch/Close 模式）。中间计算临时 Global 统一：`^||TempXxx($j, ...)`

- `^||` 进程私有 + `Temp` + 大驼峰描述名（如 `TempTop10`、`TempSort`）
- 第一下标固定 `$j`（Job ID），防同一进程重入覆盖
- 用完 `k ^||TempXxx($j)` 清理

### EasyUI Datagrid 客户端分页规范

`loadData(array)` 不分页，需配合 `loadFilter` + `onSelectPage`：

```javascript
// 1. 全量数据存入全局变量
gv.detailRows = rs;

// 2. loadFilter 拦截首次加载，注入 onSelectPage
$('#dg').datagrid({
    pagination: true, pageSize: 30,
    loadFilter: function (data) {
        if (data.total != null) return data;  // 已是 {total, rows} 格式直接放行
        var p = $(this).datagrid('getPager');
        p.pagination({
            total: data.length, pageSize: 30,
            onSelectPage: function (pageNumber, pageSize) {
                var start = (pageNumber - 1) * pageSize;
                $('#dg').datagrid('loadData', {
                    total: gv.detailRows.length,
                    rows: gv.detailRows.slice(start, start + pageSize)
                });
            }
        });
        return { total: data.length, rows: data.slice(0, 30) };
    }
}).datagrid('loadData', rs);
```

> `getRows()` 只返回当前页数据，**导出必须用全量变量**（`gv.detailRows`），不能用 `getRows()`。

### CSV 导出规范

```javascript
function doExport() {
    var rows = gv.detailRows;  // 全量数据，非 getRows()
    if (!rows || !rows.length) return;
    var cols = $('#dg').datagrid('options').columns[0];
    var csv = '﻿' + '标题\n';  // BOM + 标题行
    // 表头
    var hdrs = [];
    for (var c = 0; c < cols.length; c++) hdrs.push(cols[c].title);
    csv += hdrs.join(',') + '\n';
    // 数据行
    for (var r = 0; r < rows.length; r++) {
        var cells = [];
        for (var c2 = 0; c2 < cols.length; c2++) {
            var v = rows[r][cols[c2].field];
            if (v == null) v = '';
            cells.push(String(v).replace(/"/g, '""'));
        }
        csv += cells.join(',') + '\n';
    }
    // 下载 (IE11 兼容)
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, '文件名.csv');
    } else {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = '文件名.csv';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    }
}
```

- CSV 首字符 `﻿`（BOM），否则 Excel 打开中文乱码
- 值含 `"` 时替换为 `""`
- IE11 用 `navigator.msSaveBlob`，现代浏览器用 `<a download>`

## 项目 Skills

| Skill                   | 用途                                        | 触发方式                           |
| ----------------------- | ------------------------------------------- | ---------------------------------- |
| `iris-code-formatter` | ObjectScript 代码格式化/审查                | 提到代码格式化/审查/规范时自动激活 |
| `skill-creator`       | 创建/优化 Skill                             | `/skill-creator` 或直接说出需求  |
| `frontend-design`     | 生产级前端界面设计                          | 提到 UI/前端/页面设计时自动激活    |
| `karpathy-guidelines` | LLM 编码行为准则（简洁/精准/可验证）        | 编码时自动应用                     |
| `coding-workflow`     | 全局代码工作流程 12 条规则                  | 所有编码任务自动应用               |
| `his-class-query`     | HIS Class Query 编写（Execute/Fetch/Close） | 写查询、封装接口、统计查询         |
| `his-sql-select`      | HIS SQL SELECT 编写                         | 查数据、报表查询、数据分析         |

### 程序完成后的 Skill 调取规则

**每次完成文件生成/修改后，根据文件类型提示用户是否调用对应 skill：**

| 文件类型                            | 完成后提示调用的 Skill                            | 提示语                                                                 |
| ----------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------- |
| `.html` `.csp` `.js` `.css` | `frontend-design`                               | "是否调用 frontend-design skill 检查 UI 设计质量？"                    |
| `.cls` `.mac` `.int`          | `iris-code-formatter` + `karpathy-guidelines` | "是否调用 iris-code-formatter 和 karpathy-guidelines skill 审查代码？" |

> 规则：完成上述类型文件修改后，必须主动询问用户是否调用对应 skill，不得静默跳过。

## 文件编码与格式

| 文件类型 | 编码  | BOM                            | 命名规则                                     |
| -------- | ----- | ------------------------------ | -------------------------------------------- |
| `.csp` | UTF-8 | **必须有** `utf-8-sig` | 小写无分隔符，如`vtequalityindicators.csp` |
| `.cls` | UTF-8 | **无** `utf-8`         | 类名 UpperCamelCase，文件名与类名一致        |
| `.js`  | UTF-8 | **必须有** `utf-8-sig` | 小写无分隔符，如`vtequalityindicators.js`  |
| `.csv` | UTF-8 | **必须有** `utf-8-sig` | 导出兼容 Excel                               |

> CSP/JS/CSV 缺 BOM 会导致 IRIS 编译后中文乱码。CLS 文件带 BOM 会导致导入失败。

## CLS 类命名规范

| 类型                 | 包路径           | 示例                                |
| -------------------- | ---------------- | ----------------------------------- |
| **普通业务类** | `web.YZSY.xxx` | `web.YZSY.DHCEmrCompleteness.cls` |
| **持久化类**   | `User.xxx`     | `User.DHCSpecPat.cls`             |

> 现有 `web.xxx` 包下的类保持不动，新类必须使用 `web.YZSY.xxx` 命名空间。

## Python 脚本注意事项（Windows 环境）

```python
# 正确写法
with open(path, 'r', encoding='utf-8', newline='') as f:
    content = f.read()

# CSP/JS/CSV 写入必须带 BOM
with open(path, 'w', encoding='utf-8-sig', newline='') as f:
    f.write(content)

# CLS 写入不带 BOM
with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(content)
```

> Windows 两大陷阱：① `newline=None` 将 `\n`→`\r\n` 破坏转义序列；② 缺 BOM 的 UTF-8 在 IRIS 中文乱码。

## 参考文件索引

| 文件                                   | 内容                                                | 何时查阅                  |
| -------------------------------------- | --------------------------------------------------- | ------------------------- |
| `references/his-ui-style-guide.md`   | UI 风格规范：颜色、按钮、表格、HISUI 组件、页面模板 | 开发前端页面/组件         |
| `references/his-global-reference.md` | Global 详细字段、索引链                             | 涉及 Global 读写/需求分析 |
