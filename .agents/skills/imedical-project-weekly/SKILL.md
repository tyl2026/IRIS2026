---
name: imedical-project-weekly
description: >
  iMEDWAY（东华医为）协同网项目周报自动补交。用户说"补交项目周报"、"项目周报补交"、
  "提交项目周报"、"项目周报填写"、"补交上月项目周报"等口语表达时触发。
  从日报自动生成项目周报内容（本周已完成/未完成+下周计划），自动完成协同网全流程：
  新建周报→编辑项目阶段(运维阶段)→添加周报→填入内容(去重)→保存→提交。
  每月6号截止补交上月，日志防重复。
---

# iMEDWAY 项目周报自动补交

## 工作流

说"补交项目周报" → 自动补交上月。说"补交6月项目周报" → 指定月份。

### 运行

```bash
python scripts/project_weekly_submit.py                      # 默认上月
python scripts/project_weekly_submit.py --date 2026-06-24    # 指定单周
python scripts/project_weekly_submit.py --month 2026-06      # 指定月份
python scripts/project_weekly_submit.py --year 2026           # 全年
python scripts/project_weekly_submit.py --month 2026-06 --no-submit  # 只填不交
```

### 流程（5步）

1. **新建周报** — 点击 `#BtnCreat`，关闭成功弹框
2. **编辑项目阶段** — 点击 `#BtnStatus` → iframe 下拉 `#DroProType` 选"运维阶段" → 点 `#BtnWeeklyStatus`
3. **添加周报** — 点击 `#btnadd` → 打开 iframe 录入表单
4. **填写内容** — easyUI textbox `$('#txtThisContent').textbox('setValue')` + `$('#txtNextContent')` → 点 `#btnSave`
5. **提交周报** — 点击 `#BtnSubmit` → 关闭弹框

### 内容生成

- 从 `日报内容.txt` 解析日报，按周汇总
- 自动分类到项目模块（医保智能审核、三医数据、传染病监测...）
- 去重：相同核心内容只保留一条
- 下周计划 = 手动维护计划 + 本周未完成但不在计划中的项
- 手动计划在脚本顶部 `NEXT_WEEK_PLANS` 维护

### 关键配置

| 项目 | 值 |
|------|-----|
| 补交截止 | 每月6号 |
| 项目阶段 | 运维阶段 |
| 日志文件 | `proj_weekly_log.json` |
| 表单URL | `WeekReportPM/UIProjectReport.aspx?modefiytime={date}&bjType=bj` |

### 依赖

- Python 3.8+, playwright, jquery easyUI
- `日报内容.txt` 同目录
- 协同网 `xt.imedway.com`