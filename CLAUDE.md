# CLAUDE.md — IRIS HIS 项目开发规范

## 项目概述

基于 InterSystems IRIS for Health 2021.1 的医院信息系统（HIS），覆盖门诊、住院、护理、药房、收费、医保、预约挂号等核心业务域。
数据库版本：IRIS 2021.1.2（UNIX），端口 52773。

> **全局约束**:
>
> - **任何情况下都不得修改"原文件"**（`00原文件/`、`原文件/` 等目录内文件，以及项目根目录下的原始参考文件），只能读取分析
> - 需要修改文件时，**必须先复制一份副本（附件）再改**：修改一律在副本上进行，禁止在原文件位置直接改动
> - 所有修改/新增文件默认输出到专门的输出文件夹（如 `01优化中/`、`01代码实现/`），同一批次的修改副本集中存放于该文件夹，并用 `diff` 与原文件对比验证
> - 名称包含"原文件"的文件夹（如 `HISUI-优化/00原文件/`）内文件为原始参考，**禁止修改、更新、删除**，仅可读取分析
> - 所有修改/新增文件默认输出到"优化中"文件夹（如 `HISUI-优化/01优化中/`），不得直接覆盖原文件，除非用户明确指定路径
> - 生成新 CLS 类**必须用 `.cls` 源码格式**，禁止生成 `.xml` 导出格式
> - **代码修改原则**：修改已有文件时，必须基于 `00原文件/` 中的原始副本进行**最小化精确编辑**，只改需求涉及的行，其余代码一字不动。修改完成后用 `diff` 对比原文件验证
> - **先确认，不臆断**：动手前必须确认参考文件的**实际内容**，参考文件为空或异常时先告知用户确认，**不得臆断内容后直接新建**
> - `HISUI-新建/` 下每个项目的产出代码（.cls/.csp/.js/.html 等）统一放入 `01代码实现/` 子目录；需求文档、数据样例、XML 等参考资料放在项目根目录

#### 数据验证约束 — 未确认不得修改

**以下情况必须先与用户确认，不得直接修改代码或文件：**

| 场景 | 正确做法 | 错误做法 |
|------|---------|---------|
| Global 名/索引名不确定 | 查找 `HISUI-工具表/` 下的 XML/CSV 验证，无文件则请用户提供或终端测试 | 凭经验猜测 |
| 字段 Piece 位置不确定 | 读取 `HISUI-工具表/` 下 CSV 的 `propertyPiece` 字段确认 | 用 SQL 列号、凭记忆推测 |
| 数据链路不明确 | 终端 `zw` 逐层验证，贴输出给用户确认 | 直接改代码"试试看" |
| 需求理解有歧义 | 列出方案让用户确认后再动手 | 直接按自己理解写代码 |
| 编译/运行报错 | 先定位行号 → 读上下文 → 分析根因 → 确认后单点修改 | 盲目试改、批量替换 |

> **核心原则**：只修改用户要求修改的内容，不扩展范围；发现问题立即反馈；用最简单的代码逻辑实现需求。

## 需求分析要点

新需求按以下思路分析：

1. **数据来源** — 所需数据在哪个 Global？索引是否覆盖查询场景？参考 `references/HIS_Global结构速查.md` 和 `references/HIS_数据模型.md`
2. **业务域归属** — 属于哪个业务模块？是否与现有类功能重叠？参考 `references/HIS_数据模型.md` 业务域模块表
3. **就诊类型区分** — 门诊(O)/住院(I)/急诊(E)/体检(H) 流程不同
4. **多院区支持** — 几乎所有方法都传 `HospitalID`
5. **并发安全** — 共享资源必须用 `lock +^XXX:n` 加固，设超时
6. **事务边界** — 写操作涉及多表时用 `ts`/`tc`/`tro`，控制在单方法内
7. **医保适配** — 考虑险种类型(职工/城乡)、异地就医标记

## 技术栈

| 技术 | 用途 | 文件扩展名 |
|------|------|-----------|
| ObjectScript | IRIS 后端 | `.cls` |
| CSP | 服务端页面（混合 HTML + ObjectScript） | `.csp` |
| HTML/CSS/JavaScript | 前端，原生无框架 | `.html` / `.js` |
| HISUI | 新版 HIS 前端组件库 | `hisui-*` 类前缀 |
| jQuery 1.11+ | DOM 操作 | `.js` |

## 项目结构

```
IRIS/
├── CLAUDE.md                          # 本文档 — 核心规范
├── references/                        # 详细参考文档（按需查阅）
│   ├── HIS_数据模型.md                # 核心 Global / SQL 表 / 业务域模块
│   ├── HIS_Global结构速查.md          # Global piece 位置 / 索引 / 字典表
│   ├── HIS_数据访问模式.md            # $cm() / ResultSetType / 前后端交互
│   ├── HIS_UI风格规范.md              # 页面模板 / 颜色 / 按钮 / HISUI 组件
│   ├── HIS_接口对接.md                # 集成平台 / 外部接口 / REST API
│   ├── HIS_前端避坑指南.md            # IE11 兼容 / HISUI 陷阱 / CSP 代理
│   └── HIS_编码模式.md                # ObjectScript 模式 / 分页 / CSV 导出
├── HIS_base_skill/                    # HIS 标准 UI 参考样本
├── HISUI-新建/                        # 新项目（参考数据 + 01代码实现/）
├── HISUI-优化/                        # 优化项目（00原文件/ + 01优化中/）
└── skills/                            # Claude Code Skills
```

## 架构

### 三层架构

1. **数据层** — `%Persistent` 类或直接操作 Global
2. **API/业务层** — `%CSP.REST` 处理器或 ClassMethod
3. **展示层** — CSP 页面 + HISUI 组件 + JavaScript

### 基类继承链

大部分业务类继承 `DHCDoc.Util.RegisteredObject`，提供工具方法：

- `..%SysDate()` / `..%SysTime()` — 当前日期/时间
- `..%ZDH(dateStr)` / `..%ZD(dateH)` — 日期转换
- `..%ZTH(timeStr)` / `..%ZT(timeH)` — 时间转换

## 代码规范

### ObjectScript 关键速记

- 变量 `lowerCamelCase`，方法 `UpperCamelCase`，布尔用 `Flag` 后缀
- 命令统一小写：`for`/`while`/`if` 全拼，其余缩写（`s`/`d`/`q`/`k`/`n`）
- 系统函数缩写：`$e`/`$p`/`$l`/`$o`/`$g`/`$d`
- 锁带 `+`/`-` 和超时，事务 `ts`/`tc`/`tro` 不离屏
- 字符串拼接用 `_` 不用 `+`
- 详细规则见 `skills/iris-code-formatter/SKILL.md`

### IRIS 编译陷阱 (CLS 生成必检)

**① 后置表达式运算符两侧不能有空格**

```objectscript
#; 错误 — = 两侧空格导致编译报错
q:admId = ""
#; 正确 — = 紧贴两边的操作数
q:admId=""
#; 也可加括号来包容空格
q:(admId = "")
```

**② `)` `(` 之间绝对不能加空格（`&&`/`||` 连接多个条件时）**

```objectscript
#; 错误 — )&&( 之间不能有空格
continue:(LocID '= "") && (LocID '= CTLocDR)
#; 正确
continue:(LocID'="")&&(LocID'=CTLocDR)
```

**③ `'[` 是不包含运算符，内部不能有空格**

```objectscript
#; 错误
continue:(curBatNo ' [ batchNo)
#; 正确
continue:(curBatNo '[ batchNo)
```

**④ `elseif` 必须全拼**，禁止 `eI` / `e i` 缩写

**⑤ 块级控制结构全拼**：`if`/`for`/`while` 带 `{}` 时不能缩写为 `i`/`f`/`w`

**⑥ 点语法内嵌块用 `d`（do）承接，禁止 `{ }`**

```objectscript
#; 正确 — 点循环内嵌 if/else 用 d 承接
...if (flag = "sfx") d
....s XmDr = $p(WlData, "^", 22)
...else  d
....s XmDr = ItemOrd
```

**⑦ 混合算术表达式（`-` 与 `*` 等）必须加括号或分步计算**

IRIS 中 `a - b * c` 的求值顺序与常见语言假设不同（IRIS 2021 实测为 `(a-b) * c` 而非 `a - (b*c)`），依赖优先级会导致分页等计算结果越界、返回异常。**禁止依赖优先级，一律显式括号或分步计算**。

```objectscript
#; 错误 — 依赖优先级，IRIS 实测解析为 (total-(page-1))*rows，startIdx 越界
s startIdx = total - (page - 1) * rows
#; 正确 — 分步计算
s offset = (page - 1) * rows
s startIdx = total - offset
#; 或显式括号
s startIdx = total - ((page - 1) * rows)
```

`+`/`*` 混合同理：`s sum = sum + x * w` 会解析成 `((sum + x) * w)`，累加值每轮被 w 放大，校验和恒错。必须先算乘积再加：
```objectscript
#; 错误 — 每轮 ((sum+digit)*weight)，累加爆炸
s sum = sum + digit * weight
#; 正确 — 先算乘积
s prod = digit * weight
s sum = sum + prod
```

**⑧ 日期比较必须转数字（$H）格式**

禁止直接用 `YYYY-MM-DD` 字符串比较日期（未补零时字典序会错序、部分环境行为不可靠）。日期比较一律先用 `$zdh(dateStr,3)` 转成 $H 数字后数值比较，查询/存储日期同样先转数字。已封装通用方法 `..ToHDate()`（`web.YZSY.DHCTraceCodeRel`）可直接复用。

```objectscript
#; 错误 — 字符串直接比较，未补零日期(2026-1-1)会错序
continue:(dateStr<startDate)||(dateStr>endDate)
#; 正确 — 先转 $H 数字再比较
s dateNum = ..ToHDate(Date)
s startDate = ..ToHDate($p(data,"^",3))
continue:(dateNum<startDate)||(dateNum>endDate)
```


**⑨ 循环(for/while)与 TRY/CATCH 块内禁止 `QUIT` 带参数**
错误：for/while 体内 `q x`、try/catch 体内 `q "{json}"`。应先把结果赋给变量，块结束后统一 `q 变量`。

**⑩ `$e()` 的第二/三参数是“起止位置”，不是长度；且须 起≤止**
错误：`s m = +$e(base,5,2)`（想取第5、6位，实际 start>end 返回空）。应写 `$e(base,5,6)`。

**⑪ COS 表达式从左到右求值，比较与算术混用必须整体加括号**
错误：`if c16 < b12 - 86400` 实际解析为 `(c16 < b12) - 86400`（0/1 减 86400）恒真。
正确：`if c16 < (b12 - 86400)`。

**⑫ `$get()` 参数必须是左值（变量/下标引用），不能包函数调用**
错误：`s v = $g($li(list,i))`（`$li()` 不是左值）。list 已取到时应直接 `s v = $li(list,i)`。

**⑬ 带 `^` 前缀的全局名变量用 `@g@(...)` 引用；`$o` 第3参对“仅有子节点、自身无值”的节点不赋值**
错误：`g="^web.X"` 时写 `^(g,...)`、`$o(@g@("Batch",id),1,info)`（(Batch,id) 自身无值时 info 不被赋值）。
正确：写 `s x = @g@("Batch",id,...)`；枚举时先 `$o` 取 id 再 `s info=$g(@g@(...,"Info"))` 读值。

**⑭ 手工拼接 JSON 的收尾引号易错，优先用动态对象 `%ToJSON()` 返回**
手拼 `"…"""}"""` 这类结尾字面量经常多/少引号导致 JSON 解析失败，能改用 `s o={} … q o.%ToJSON()` 的一律用对象方式。

**⑮ IRIS 单字符串上限（`<MAXSTRING>`，约 3.6M 字符）：大数据/全量返回必踩，用"页内切片"结构规避**
- 上限作用于**任何单个字符串**：手拼 JSON、`$lb` 大列表、`$cm`/方法返回体（最终必须序列化成"一个字符串"回前端）。全表行 × 全列先收集再拼串（如几千行 × 数百列 JSON）必然 `<MAXSTRING>`，且常表现为 Code=5/Name 被吞，易误判为 SQL 列数上限、缓存 SQL 类等。
- 排查铁律：异常先打 `Name=`（catch 里拼 `qex.Name`/`qex.DisplayString()`，或打印 `Code=`+`stage=`），别被裸数字 Code 带偏；把复现写成类内 `test()` 一行自测。
- 正确结构（参照 病案数据自定义查询 `web.YZSY.DHCMRCustomQuery.QueryData`）：
  1. 枚举只**收集命中行 ID**（`%DynamicArray`/局部数组均可），有条件才逐行取数过滤，可设 20 万行截断；
  2. 分页切片时**只拼当前页** rows（行为数组、少带 key），配合 try/catch 返回可读错误；
  3. 需要超大数据导出时**分批拉取**（前端按批调小接口并本地 `Blob` 组装）或**服务端流式逐行写文件**；
  4. 单次返回行数设上限（如 ≤500）兜底；页大小/批次由列数动态决定。
- 认知要点：`%DynamicObject/%DynamicArray` 只在**内部收集**阶段不拼大串；`%ToJSON()`/回前端仍是一串，所以"改成 JSON 对象返回"不能绕开上限，**控制单次规模才是根本**。


## CLS 自测方法写法（终端一键自测，必检项）

业务类建议提供 `ClassMethod test()`，头部注释直接给出终端调用方式，方便编译后立刻验证：
```objectscript
/// w ##class(web.YZSY.DHCMRInfoHQMSImport).test()
ClassMethod test()
{
	s b=##class(web.YZSY.DHCMRInfoHQMSImport).ToHSeconds("2026-07-30 13:07:00")
	s c=##class(web.YZSY.DHCMRInfoHQMSImport).ToHSeconds("2026-08-04")
	w "b=",b," c=",c," b-1day=",(b-86400)," 早判断(应为0)=",(c<(b-86400)),!
	w ##class(web.YZSY.DHCMRInfoHQMSImport).RowCrossMsg(8,1,811),!
}
```
约定：
1. 注释行 `/// w ##class(包.类).test()` 写在该方法上方，直接复制到终端即可运行；
2. 测试用**具体样例值**并输出“期望/实际”可判读结果（如 `早判断(应为0)=`）；
3. `test()` 不得改库/清数据；确需写测试数据须注释说明；
4. 排障排查问题（如换算/校验/规则）优先先写/跑此类最小自测，再改业务代码。

## 文件编码与格式

| 文件类型 | 编码 | BOM | 命名规则 |
|----------|------|-----|---------|
| `.csp` | UTF-8 | **必须有** `utf-8-sig` | 小写无分隔符 |
| `.js` | UTF-8 | **必须有** `utf-8-sig` | 小写无分隔符 |
| `.cls` | UTF-8 | **无** `utf-8` | 类名 UpperCamelCase |
| `.csv` | UTF-8 | **必须有** `utf-8-sig` | 导出兼容 Excel |

> CSP/JS/CSV 缺 BOM 会导致 IRIS 编译后中文乱码。CLS 文件带 BOM 会导致导入失败。

## CLS 类命名规范

| 类型 | 包路径 | 示例 |
|------|--------|------|
| 普通业务类 | `web.YZSY.xxx` | `web.YZSY.DHCEmrCompleteness.cls` |
| 持久化类 | `User.xxx` | `User.DHCSpecPat.cls` |

## Python 脚本注意事项（Windows 环境）

```python
# CSP/JS/CSV 写入必须带 BOM
with open(path, 'w', encoding='utf-8-sig', newline='') as f:
    f.write(content)

# CLS 写入不带 BOM
with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(content)
```

> `newline=None` 会将 `\n`→`\r\n` 破坏转义序列。


## HISUI 弹窗写法（已验证，参考 病案数据自定义查询/dhcmrcustomquery）

**不要**在弹窗里放 datagrid，也不要依赖 JS `init` + `buttons` 选项；直接：
1. 弹窗容器用 `class="hisui-dialog"` + `data-options="closed:true,title:'标题',width:1020,height:660,modal:true,…"`（HISUI 自动初始化）；
2. 内容为纯 HTML，往容器内的内容 div 填即可（如校验详情=HTML 表格、字段编辑=分组多列输入）；
3. 按钮放在内容区底部：`<a class="hisui-linkbutton" onclick="xx()">保存</a>`、关闭用 `onclick="$('#dlgX').dialog('close')"`；
4. 打开用 `$('#dlgX').dialog('open')`；行号等临时状态用 `$('#dlgX').data('rowNo', n)` 挂载；
5. 长内容给内容 div 设 `max-height` + `overflow:auto`，避免撑出弹窗。

参考样例：`HISUI-新建/20260705病案数据自定义查询/01代码实现/dhcmrcustomquery.csp/.js`、本项目 `yzsyhqmsimport.csp/.js`（dlgEdit/dlgVali）。

## HISUI datagrid 现场适配铁律（已验证，参考 通用采集字典对照/sanyidictmap.csp/.js）

> 现场 HISUI fork 与官方手册存在差异，以下规则均为现网实测结论。做任何含 datagrid 的页面先读本节。

1. **绝不包裹/替换原生 `$.fn.datagrid`/`$.fn.pagination`**。原生插件内部会访问 `$.fn.datagrid.parseOptions/defaults/methods`，一旦被本页包装函数覆盖：初始化报 `parseOptions is not a function`，方法调用报 `Cannot read property 'loadData' of undefined`。自绘垫片只能在"插件完全缺失"时整段安装并直接赋值，**不要做运行时分发/委派包装**。
2. **后置 API 不可靠，不要依赖**。实测 fork 中 `datagrid('resize')` 会把高度按 options 初值还原/按内容高度重排（空数据时压成"表头+分页条"），`datagrid('options'/'getPanel')` 抛异常（如 `nodeName`）。**高度调整一律纯 DOM 操作**，禁止用这些方法改尺寸。
3. **`fit:true` 只认初始化时的容器高度**：隐藏容器里 init `fit:true` → 高度 0（列表只剩一条线），且事后 resize 无法恢复。需要铺满的网格用"延迟初始化"（参照 HQMS 数据导入页 `ensureGrid` 模式：首次切到该页签、容器可见且有高度时才建表）+ 显式实测高度 `height: h`。
4. **tabs 的 `onSelect` 可能不触发**（点击页签无回调）。页签驱动逻辑用轮询代替：每 400ms 用"各页签锚点元素向上找 `.tabWrap`，`offsetParent !== null && offsetHeight > 0` 者即激活页签"，对激活页签执行 铺满/延迟建表/取数。
5. **原 `<table id="X">` 是隐藏占位**：fork 会把它置为 `display:none`，真实可见表体在 `.datagrid-view1/.datagrid-view2 > .datagrid-body` 里。DOM 补高必须按类名直达 `.datagrid-view/.datagrid-view1/.datagrid-view2/.datagrid-body` 四层（`body = 容器高 − 分页条高 − 表头高`），沿原 table 祖先链只补得到外层 view。
6. **空数据会压缩面板**（fork 按内容高度排版）。`loadData` 后需多轮 DOM 补高（0/150/400/900ms，覆盖异步重排），且补高期间及之后**不得再对这些网格调 `datagrid('resize')`**（会把补高打回原形）。补高写值加 2px 容差防抖。
7. **铺满页签的容器链三层必须齐全**：`tabWrap(flex 纵向 + JS 定像素高) → .grow(flex:1, min-height:0) → 网格`。缺一层（如 tabWrap 没定高）`.grow` 就跟随内容塌陷，补高基准错误。站内标准写法：`<div class="grow"><table class="hisui-datagrid"></table></div>`（HQMS 数据导入页同款）。
8. **布局只在"页面加载 / 窗口尺寸变化(150ms 防抖)"两个时机计算，杜绝循环测量反馈（高度棘轮根治）**。轮询里反复"测量容器 `offsetTop` → 写高 → fork 内容驱动重排 → 下次测得更小"会形成棘轮：部分页签显示区逐步变矮、其余被挤出变高；窗口最大化/还原动画的密集 resize 事件会加速该循环。正确做法（参考 `sanyidictmap.js` 的 `applyLayout`）：统一布局入口只在加载与防抖后的 resize 时执行——一次性测量（标题条高/页签头条高/当前可见容器顶）后，一次套用 `mainTabs` 高度、**面板本体高度**（纯 DOM 定住，防 fork 面板与内容互相拉扯）、所有页签容器（含隐藏态）高度，再做网格 DOM 补高；**周期性轮询只做网格纯 DOM 补高（幂等），绝不测量/写容器高度**；不调 fork 的 `tabs('resize')`。所有高度赋值加 2px 容差防抖。
9. **调试姿势**：HIS 应用跑在外壳页（`dhc.logon.csp`）的 iframe 里，F12 Console 要先切换上下文到应用 frame；页面 JS 头部打版本日志（如 `console.log('[页面名] JS 加载 vN ...')`）并在关键步骤（页签切换/建表/补高）打日志，用 `document.getElementById` 探测代替插件方法探测，避免"部署没生效/跑的是旧文件"反复空转。**布局问题加遥测兜底**：每秒快照关键布局值（标题条高/页签头条高/`mainTabs` top与高/可见容器 top与高），任一项漂移 >2px 才打 `[页面名][telemetry] drift ...`——布局仍被外部（插件自身）改动时，日志直接指出漂移的是哪一项，避免反复盲试。
10. **窄容器工具条自动换行**：paneHead/miniBar 等工具条加 `flex-wrap: wrap`（配合 `min-height` 代替固定 `height`），按钮在窄块内自动折行显示，不会被裁切或横向溢出。

## 项目 Skills

| Skill | 用途 | 触发 |
|-------|------|------|
| `iris-code-formatter` | ObjectScript 代码格式化/审查 | 代码审查时激活 |
| `his-class-query` | HIS Class Query 编写 | 写查询/封装接口 |
| `his-sql-select` | HIS SQL SELECT 编写 | 查数据/报表查询 |
| `frontend-design` | 前端界面设计 | UI/页面设计时激活 |
| `ai-requirement-generator` | AI 需求生成/拆分/提交协同网 | 生成需求、提交需求时默认调用（见下方专节） |

## AI 需求生成与提交（默认调用）

> **默认规则**：凡用户提出"生成需求 / 生成AI需求 / 拆分需求 / 整理需求 / 导出需求 / 输出需求文档 / 提交需求到协同网"等需求类请求时，**必须默认加载并执行** `.claude/skills/ai-requirement-generator/SKILL.md`（skill 目录：`.claude/skills/ai-requirement-generator/`），按其规范执行，不得自行简化或另起格式。

执行要点（完整流程见 SKILL.md）：

1. **读 skill 前置**：动手前先完整读取 `SKILL.md`，按其输入来源、输出规范、拆分规则执行
2. **模块匹配**：必须先读取 `assets/模块清单.txt`（标准字典，只读不可修改），按页面/菜单名匹配产品模块、产品线、产品组；未匹配到时列出候选让用户确认，不得自行新增模块
3. **输出文件**：`NNN_YYYYMMDD_模块名称_AI需求.txt`，保存到 `项目根目录/AI需求/`（序号取目录最大序号+1，日期格式 YYYYMMDD）
4. **内容格式**：每条需求含 模块/产品线/产品组/现状（含安全组、科室、菜单）/需求 五要素；面向非信息专业医护人员，禁止技术术语（Global、CLS、JS 等）；需求正文默认 ≤50 字
5. **需求总表**：生成后必须把新模块条目**追加**到 `AI需求/需求总表.txt`（只追加，不覆盖已有内容）
6. **提交协同网**：生成完成后询问用户是否提交；确认后运行 `python .claude/skills/ai-requirement-generator/scripts/submit_ai_requirement.py`，自动选最小未提交序号文件、打开 Chromium 扫码登录、逐条提交、成功后重命名 `_已提交`（下次跳过）
7. **需求配图**：`AI需求/需求附件/N.png` 按序号对应需求（N-M.png 对应需求M），提交时自动转 base64 内联，不作为附件上传

## 参考文件索引

| 文件 | 内容 | 何时查阅 |
|------|------|----------|
| `references/HIS_数据模型.md` | 核心 Global / SQL 表 / 业务域模块 | 需求分析、数据建模 |
| `references/HIS_Global结构速查.md` | Global piece 位置 / 索引 / 字典 | 涉及 Global 读写 |
| `references/HIS_数据访问模式.md` | `$cm()` API / ResultSetType / 前后端交互 | 前端调用后端 |
| `references/HIS_UI风格规范.md` | 页面模板 / 颜色 / 按钮 / HISUI 组件 | 开发前端页面 |
| `references/HIS_接口对接.md` | 集成平台 / 外部接口 / REST API | 对接外部系统 |
| `references/HIS_前端避坑指南.md` | IE11 兼容 / HISUI 陷阱 / CSP Method 代理 | JS 报错排查 |
| `references/HIS_编码模式.md` | ObjectScript 模式 / 分页 / CSV 导出 | 写后端逻辑 |
