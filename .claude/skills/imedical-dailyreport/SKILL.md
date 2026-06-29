---
name: imedical-dailyreport
description: >
  iMEDWAY（东华医为）协同网工作日报/周报自动填写。用户说"需提交日报"、"提交日报"、"填写日报"、
  "帮我填日报"、"日报填报"、"日报提交"、"工作日报"、"补交周报"、"周报补交"、"提交周报"、
  "周报填写"等口语表达时触发。读取日报内容文件自动完成协同网日报填写和周报补交。
  也可用于日报查询验证、日报内容文件格式检查等场景。
---
  自动完成协同网日报填写：解析内容、预检已填日期、跳过重复、逐日填写保存。
  也可用于日报查询验证、日报内容文件格式检查等场景。
---

# iMEDWAY 日报自动填写

## 工作流

### 第一步：确认内容来源

检查用户是否提供了日报内容。优先级：

1. **本地文件** — `HISUI-新建/日报提交/日报内容.txt`（默认路径）
2. **有道云笔记链接** — 用户提供 `share.note.youdao.com/s/xxx` 时，用 Playwright 提取内容
3. **直接粘贴** — 用户在对话中直接贴出内容

```
格式示例：
20260331
1.精毒麻预警全流程预警部署完成
2.护理管理排班积假问题沟通
20260401
1.三甲模块需求调研文档整理学习
2.项目日常需求推进
...
```

内容要求：
- 日期行：8位数字 `yyyymmdd`（支持9位容错，如 `202604021` → `20260421`）
- 内容行：`数字.工作内容`（标记符缺失可容错）
- 支持每天不同数量的工作项（1~N 条）

### 第二步：解析内容

读取文件后，自动：
- 修正常见日期错误（`2024xxxx` → `2026xxxx`，9位截断）
- 识别办公地点：含"出差/途中" → `出差途中`，含"年假/休假" → `在家办公`，其余 → `现场办公`
- 输出解析摘要：总天数、日期范围、特殊标记（出差日、年假日、超多条目日）

### 第三步：运行自动填写

使用 `scripts/playwright_fill.py` 执行：

```bash
python scripts/playwright_fill.py
```

脚本流程：
1. 打开 Playwright Chromium → 导航到协同网登录页
2. **提示用户扫码登录**（在对话中说"请扫码登录"）
3. 登录成功 → 导航到日报填写页
4. **预检**：对每个日期调用 `findtasksave` API 检查是否已填
5. 跳过已填 → 仅填写未填日期
6. 每填一天输出结果 → 全部完成后报告

### 第四步：报告结果

```
Pre-check: 54 dates total, 3 filled → SKIP
填写: 51/51 OK, 0 failures
```

### 第五步（可选）：验证

使用 `scripts/verify_query.py` 打开查询页面确认。

```bash
python scripts/verify_query.py
```

## 协同网页面信息

- **地址**: `https://xt.imedway.com/ylxt/`
- **登录页**: `Login.aspx`（需扫码）
- **填写页**: `ProGroupWeek/UIProGroupAcitvewrite.aspx`
- **查询页**: `ProGroupWeek/UIProdGroupActivityList.aspx`
- **预检API**: `UIProGroupAcitvewrite.ashx?OperationType=findtasksave` (POST `{date}`)

页面详细结构见 `references/page-structure.md`。

## 关键约束

- 用户登录用扫码，必须在对话中提示
- 周末日期系统会隐藏工作日时段，脚本自动强制显示
- 固定工作时段：08:30-10:00, 10:00-12:00, 13:00-15:00, 15:00-17:30 + 动态行 17:30-18:30
- 工作类型固定选第一项"需求处理"
- 5个时段按公式 `int(slot_index * item_count / 5)` 分配工作项
- 超过5条时，第5+条合并到动态行
- 保存用直接 AJAX 绕过页面跳转

## 脚本依赖

- Python 3.8+
- `playwright` (已安装 chromium)
- 网络访问 `xt.imedway.com`

## 周报补交

### 触发
用户说"补交周报"、"周报补交"、"提交周报"时执行。

### 原理
周报从日报自动生成。先确保日报已填写，再补交周报：
1. 从日报内容文件推导需要补交的周（每周一）
2. 逐周访问 `WeekReport/UIWeeklyReport.aspx?modefiytime={日期}`
3. 如果"生成周报"按钮可见 → 点击生成 → 关闭成功弹框 → 等数据加载
4. 如果"重新生成周报"按钮可见 → 已生成过
5. 点击"提交周报" → 关闭成功弹框 → 关闭审批弹框
6. 每月10号截止补交上月周报，当前周不能补交

### 运行
```bash
python scripts/weekly_backfill.py
```

页面详细结构见 `references/page-structure.md`。
- 周报表单: `WeekReport/UIWeeklyReport.aspx`
- 按钮: `#BtnCreat`(生成), `#BtnReCreat`(重新生成), `#BtnSubmit`(提交)
- 生成API: `CreatReport()`, 提交API: `SubmitReport()`
- 表格: `#ListTable` easyui-datagrid

### 关键约束
- 生成成功弹框需确认 → 自动点击关闭
- 提交周报弹出审批确认 → 自动点击确认
- 数据加载到表格后才能提交 → 轮询等待 rows > 0
- 已生成的周报需跳过生成步骤
