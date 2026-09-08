---
name: imedical-weeklyreport
description: >
  iMEDWAY（东华医为）协同网周报自动补交。用户说"补交周报"、"周报补交"、"提交周报"、
  "周报填写"、"补交上月周报"、"补交今年周报"等口语表达时触发。从日报自动生成周报内容，
  自动完成生成→提交→iframe审批提交→弹框确认全流程。支持补交上月或指定年份周报。
---

# iMEDWAY 周报自动补交

## 工作流

说"补交周报" → 自动补交上月。说"补交6月周报" → 补交指定月。说"补交6月22号那周" → 补交单周。

### 运行

```bash
# 默认补交上月
python scripts/weekly_backfill.py

# 补交单周（指定该周内任一天）
python scripts/weekly_backfill.py --date 2026-06-24

# 补交指定月份
python scripts/weekly_backfill.py --month 2026-06

# 补交指定年份
python scripts/weekly_backfill.py --year 2026
```

### 流程

1. 计算需要补交的周（每月周一）
2. 过滤日志中已提交的周 → 跳过
3. 登录协同网（提示用户扫码）
4. 逐周：导航到 `WeekReport/UIWeeklyReport.aspx?modefiytime={周一日期}`
5. 有"生成周报"按钮 → 点击生成 → 关闭成功弹框 → 等数据加载
6. 点"提交周报"(BtnSubmit) → 打开iframe审批弹窗
7. iframe内点"提交" → "不能修改"弹框点确定 → "提交完成"点确定
8. 记录到日志，下个周

## 关键页面

- 周报表单: `https://xt.imedway.com/ylxt/WeekReport/UIWeeklyReport.aspx?modefiytime={date}`
- 按钮: `#BtnCreat`(生成), `#BtnReCreat`(重新生成), `#BtnSubmit`(提交)
- 审批弹窗在 iframe 内，按钮和弹框需在 iframe 内查找
- 无按钮显示 → 已提交过 → 自动跳过

## 日志

`submit_log.json` 记录所有已提交的周，重复运行自动跳过。

## 依赖

- Python 3.8+
- `playwright` (已安装 chromium)
- `submit_log.py` (同目录)
- 网络访问 `xt.imedway.com`
