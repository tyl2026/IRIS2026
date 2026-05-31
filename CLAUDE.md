# CLAUDE.md — IRIS HIS 项目开发规范

## 项目概述

基于 InterSystems IRIS for Health 2021.1 的医院信息系统（HIS），覆盖门诊、住院、护理、药房、收费、医保、预约挂号等核心业务域。项目包含：
- **APACHE II 评分系统** — ICU 患者急性生理与慢性健康评估，计算预测死亡率
- **HIS 基础 UI 组件参考** — `HIS_base_skill/` 目录下收录了 HIS 系统的标准页面样本
- **ECO 业务模块** — 费用统计、预约管理、诊断录入等生产级业务代码参考

数据库版本：IRIS 2021.1.2（UNIX），端口 52773

## 技术栈

| 技术 | 用途 | 文件扩展名 |
|------|------|-----------|
| ObjectScript | IRIS 后端语言 | `.cls` |
| CSP | 服务端页面（混合 HTML + ObjectScript） | `.csp` |
| HTML/CSS/JavaScript | 前端，原生无框架 | — |
| HISUI | 新版 HIS 前端组件库 | 引入 `hisui.min.css` |
| Bootstrap 3.0.3 | 登录页/部分页面布局 | — |
| jQuery | DOM 操作 | — |
| Font Awesome | 图标 | — |

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

| Global | 存储内容 | 关键字段 |
|--------|----------|----------|
| `^PAPER(patId,"ALL")` | 患者主索引 | 姓名、性别、出生日期、身份证号 |
| `^PAPER(patId,"PAT",1)` | 患者登记号 | 登记号(REGNO)、住院号(medno) |
| `^PAPER(patId,"PER",1)` | 患者扩展信息 | 费别类别、联系电话 |
| `^PAADM(admId)` | 就诊记录 | 患者ID、就诊类型(I/O/E/H)、就诊科室、就诊日期、状态、出院日期 |
| `^PAPERDR(patId,"RB_Appt",status,...)` | 患者预约索引 | 按状态索引患者的预约记录 |

**就诊类型**: `I`=住院 `O`=门诊 `E`=急诊 `H`=体检

#### 医嘱与收费（Orders & Billing）

| Global | 存储内容 | 关键字段 |
|--------|----------|----------|
| `^OEORD(ord,"I",sub,1)` | 医嘱项目 | arcim项目ID、开始日期时间、状态 |
| `^OEORD(ord,"I",sub,"X",ore)` | 医嘱执行记录 | 执行日期、执行状态(1=已执行) |
| `^ARCIM(sub,ver,1)` | 医嘱项目目录 | 项目代码、项目名称 |
| `^DHCTARI(tarId)` | 收费项目目录 | 收费代码、收费名称 |
| `^DHCWorkLoad(wlId)` | 工作量/计费明细 | 接收科室、医嘱项目、数量、单价、金额、就诊ID、患者ID、账单号、收费项目ID |
| `^DHCPB(billId)` | 患者账单 | 支付状态(P=已付/B=部分付)、退款标志 |
| `^DHCPB(billId,"O",...,"D",...)` | 账单明细 | 计费日期、计费时间 |

**WorkLoad 表索引链**: `^DHCWorkLoad(0,"ORDDATE",date,wlId)` — 按日期查询 > `^DHCWorkLoad(0,"DateItemOrd",date,arcimId,wlId)` — 按日期+医嘱项 > `^DHCWorkLoad(0,"TARITEM",tarId,wlId)` — 按收费项 > `^DHCWorkLoad(0,"PAADM",admId,wlId)` — 按就诊

#### 预约与排班（Appointment & Schedule）

| Global | 存储内容 | 关键字段 |
|--------|----------|----------|
| `^RB("RES",resId)` | 医生资源 | 科室ID、医生ID |
| `^RBAS(resId,asChild)` | 排班记录 | 日期、号源限额、开始时间、预约起始号、号串(DHC节点) |
| `^RBAS(resId,asChild,"APPT",apptChild)` | 预约记录 | 预约类型、患者ID、状态(I/A/X/J)、就诊ID、诊号 |
| `^RBAS(resId,asChild,"DHC")` | 排班扩展 | 号串(`$C(1)`分隔正号/加号)、停正号标志、时段标志、状态 |
| `^RBAS(resId,asChild,"AQ",aqSub)` | 预约限额配置 | 预约方式ID、保留号数、最大号数 |
| `^RBAS(resId,asChild,"ASTR",astrSub)` | 分时段配置 | 时段起止时间、号数、时段号串 |

**预约状态**: `I`=已预约 `A`=已取号 `X`=已取消 `J`=爽约
**号源状态**: `0`=可用 `1`=现场已挂 `2`=已预约 `3`=预约取号 `4`=退号 `5`=诊间加号
**号串格式**: `"QueueNo:Status[:MethodId],..."` — 正号串与加号串用 `$C(1)` 分隔

#### 医保（Insurance）

| Global | 存储内容 | 关键字段 |
|--------|----------|----------|
| `^DHCINADM(inadmId)` | 医保就诊记录 | 中心ID、激活标志、医疗类别、医保类型(00A=职工医保)、险种类型(310/390) |
| `^DHCINDIV(inpayId)` | 医保结算记录 | 支付标志(I=已结算)、医保就诊ID |
| `^DHCBCI(0,"Bill",billId)` | 账单-医保交叉索引 | 发票ID |

险种类型: `310`=职工 `390`=城乡 | 地区识别: 通过中心ID前4位(`4311`=永州, `43xx`=省内异地, 其他=跨省异地)

#### 基础数据（Foundation）

| Global | 存储内容 |
|--------|----------|
| `^CTLOC(locId)` | 科室 — 代码、名称、医院ID、预约回归时间 |
| `^CTPCP(cpId,1)` | 医护人员 — 姓名、职称 |
| `^SSU("SSUSR",userId)` | 系统用户 — 姓名、安全组、默认科室 |
| `^RBC("APTM",methodId)` | 预约方式 — 代码(TEL/WIN/...)、名称、当天预约标志 |
| `^RBC("AT",typeId)` | 预约类型(NORN/APP/DOC/...) |
| `^MRC("ID",icdId)` | ICD 诊断编码 |
| `^DHCTimeRange(trId)` | 时段定义 — 名称、回归时间阈值 |
| `^PAC("ADMREA",reasonId)` | 费别(就诊原因) |
| `^PHCFR(freqId)` | 用药频次(QD/BID/TID...) |
| `^CD.PHA.IN.STAT(type)` | 药品分类 |

### 业务域模块

| 域 | 核心类 | 功能范围 |
|----|--------|----------|
| **预约挂号** | `web.DHCRBAppointment`, `web.DHCRBApptSchedule`, `web.DHCRBResource` | 预约→取号→退约→爽约→恢复 全生命周期，号源分配与限额管理 |
| **门诊医嘱** | `web.DHCDocOrderEntry`, `oeorder.oplistcustom.new.csp` | 门诊医嘱录入、药品/检查/检验项目选择 |
| **诊断录入** | `web.DHCDocDiagnosEntryV8`, `diagnosentry.v8.csp` | ICD 诊断编码录入（西医/中医/证型） |
| **护理执行** | `web.DHCEMNurExe`, `dhcem.nur.exec.hisui.csp` | 护理任务执行、观察记录、评估表 |
| **费用统计** | `web.DHCWLfeeSum`, `DHCWLfeeSum.csp` | 按时间/科室/医嘱/药品分类等多维度统计收入 |
| **医保结算** | `DHCINADM`, `DHCINDIV`, `web.INSUDicDataCom` | 医保登记、费用上传、结算、异地就医识别 |
| **ICU 评分** | `ApacheII.Model.Assessment`, `ApacheII.API.Handler` | APACHE II 急性生理评分 + 预测死亡率 |

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

| ActionCode | 触发时机 | 说明 |
|------------|----------|------|
| `SENDTAKEAPPTSCHEDULEINFO` | 预约创建成功(`Insert`) | 向集成平台推送预约挂号信息 |
| `SENDCANCELAPPTSCHEDULEINFO` | 预约取消(`CancelAppointment`) | 向集成平台推送取消预约信息 |

**调用模式**:
```objectscript
s rtn = ##class(web.DHCENS.EnsHISService).DHCHisInterface("SENDTAKEAPPTSCHEDULEINFO", RBAppId)
```

### 外部系统接口

| 接口类 | 方法 | 用途 | 触发条件 |
|--------|------|------|----------|
| `dhcinterface.TeleClient` | `notifyGetNumber(RBASRowId)` | 通知 114 电话预约平台已取号 | 预约方式为 `TEL` 且 `IFTeleAppStart=1` |
| `dhcinterface.DoctorApptScheClient` | `SetScreenDisplayMsg(RBASId,FullFlag)` | 刷新大屏号别状态 | `IFScreenStart=1`，爽约/取消时触发 |

### 配置驱动功能开关

系统通过 `##class(web.DHCOPRegConfig).GetSpecConfigNode(ConfigKey, HospitalID)` 统一管理功能开关：

| 配置键 | 功能 | 取值 |
|--------|------|------|
| `IFTeleAppStart` | 启用 114 电话预约对接 | 1=启用 |
| `IFScreenStart` | 启用大屏号别显示 | 1=启用 |
| `AppReturnNotAllowRegAdd` | 预约回归不释放号源且增号 | 1=启用 |
| `ReturnNotAllowAdd` | 退号不释放资源且增加资源数 | 1=启用 |
| `AppStartTime` | 预约开放时间 | 时间字符串 |
| `AddStartTime` | 加号开放时间 | 时间字符串 |
| `AppBreakLimit` | 爽约次数限制 | 数字 |
| `AdvanceAppAdm` | 是否可提前取预约号 | 1=启用 |

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

| 系统 | 地址/类 | 用途 |
|------|---------|------|
| 湖南省医保平台 | `dps.hun.hsip.gov.cn` | 医保登记、结算、异地就医 |
| 药品信息查询 | `192.168.90.235/LCYY/interface/YPXX.aspx` | 药品目录同步 |
| CA 数字签名 | `CA.DigitalSignatureService`, `websys.CAInterface` | 电子签名认证 |
| 临床决策支持(CDSS) | `DHCDSS.js` | 辅助诊疗建议 |
| Portal 门户 | `DtPortal.Doctor.DHCDocComService` | 医生站门户数据推送 |

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
- 后置表达式：括号内空格，括号间无空格 — `q:(a = "")&&(b = "")`
- 注释 `#;`/`//`，方法头 `///`

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

| 用途 | 色值 | 说明 |
|------|------|------|
| 主色调 | `#017bce` | 菜单栏背景 |
| 标题文字 | `#15428b` | 深蓝 |
| 主边框 | `#95B8E7` | 输入框、面板边框 |
| 面板背景 | `#F9FBFF` | 表单区、表格容器 |
| 标题栏背景 | `#E4F0FF` | `.maintitle` / `.formtitle` |
| 页面底色 | `#cee4ff` | BODY 背景 |
| Focus 高亮 | `#ffe48d` | 输入框获焦背景 |
| Focus 边框 | `#6b9cde` | 输入框获焦边框 |
| 禁用背景 | `#dddddd` | 只读/禁用字段 |
| 选中行 | `#FFE48D` | 表格选中行 |
| 悬停行 | `#eaf2ff` | 表格 hover |
| 高亮橙 | `#fd7201` | 菜单 hover、特殊提示 |
| 链接蓝 | `#40A2DE` | 超链接 |
| 辅助灰 | `#666666` | 次要文字 |

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
<div class="hisui-datagrid" data-options="url:'...',columns:[...]"></div>

<!-- 手风琴 -->
<div class="hisui-accordion">
  <div title="标题" data-options="iconCls:'icon-w-update',selected:true">内容</div>
</div>
```

**字体**：全局 `"Microsoft Yahei"`，基础 14px，紧凑 12px，分页 13px。

**通用约定**：全局字体 `"Microsoft Yahei"`；CSV 导出带 BOM 兼容 Excel UTF-8；命名空间运行时切换到 `DHC-APP`；ObjectScript 字符串拼接用 `_` 不用 `+`。

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
    q:$d(^||TEMPFilter)&&'$d(^||TEMPFilter(sub))
    ; 处理
}
```

## 项目 Skills

| Skill | 用途 | 触发方式 |
|-------|------|----------|
| `iris-code-formatter` | ObjectScript 代码格式化/审查 | 提到代码格式化/审查/规范时自动激活 |
| `skill-creator` | 创建/优化 Skill | `/skill-creator` 或直接说出需求 |
| `frontend-design` | 生产级前端界面设计 | 提到 UI/前端/页面设计时自动激活 |
| `karpathy-guidelines` | LLM 编码行为准则（简洁/精准/可验证） | 编码时自动应用 |

### 程序完成后的 Skill 调取规则

**每次完成文件生成/修改后，根据文件类型提示用户是否调用对应 skill：**

| 文件类型 | 完成后提示调用的 Skill | 提示语 |
|----------|----------------------|--------|
| `.html` `.csp` `.js` `.css` | `frontend-design` | "是否调用 frontend-design skill 检查 UI 设计质量？" |
| `.cls` `.mac` `.int` | `iris-code-formatter` + `karpathy-guidelines` | "是否调用 iris-code-formatter 和 karpathy-guidelines skill 审查代码？" |

> 规则：完成上述类型文件修改后，必须主动询问用户是否调用对应 skill，不得静默跳过。
