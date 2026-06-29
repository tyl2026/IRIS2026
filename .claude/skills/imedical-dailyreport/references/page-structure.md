# 协同网日报填写页面结构

## URL 信息

| 页面 | URL |
|------|-----|
| 登录页 | `https://xt.imedway.com/ylxt/Login.aspx` |
| 填写页 | `https://xt.imedway.com/ylxt/ProGroupWeek/UIProGroupAcitvewrite.aspx` |
| 查询页 | `https://xt.imedway.com/ylxt/ProGroupWeek/UIProdGroupActivityList.aspx` |

## 填写页表单 (`#form1`)

### 核心字段

| 字段 | 选择器 | 类型 | 说明 |
|------|--------|------|------|
| 日期 | `#TxtPlanDate` | easyui-datebox | 设置日期触发生效 `iswork` AJAX |
| 日报类型 | `#DrpReportType` | select | 需求日报/开发日报/事务日报，默认"事务日报" |
| 办公地点 | `input[name="workPlace"]` | radio | 现场办公/出差途中/在家办公/外出开会或交流 |
| 项目组 | `#OverTimeGroup` | combogrid | 隐藏，交付中心可见，默认"湖南永州第三" |
| 任务类型 | `#TaskTypes` | combobox | 默认值 3="其他事务" |
| 保存按钮 | `#BtnCreat` | linkbutton | 调用 `SaveReport()` → `Save()` → AJAX POST |

### 工作详情表格 (`#WorkInfoTable`)

#### 4 个固定时段 (`.workTr`)

| 时段 | 开始 | 结束 | 选择器 |
|------|------|------|--------|
| 1 | 08:30 | 10:00 | `.workDayStart:eq(0)`, `.workDayEnd:eq(0)` |
| 2 | 10:00 | 12:00 | `.workDayStart:eq(1)`, `.workDayEnd:eq(1)` |
| 3 | 13:00 | 15:00 | `.workDayStart:eq(2)`, `.workDayEnd:eq(2)` |
| 4 | 15:00 | 17:30 | `.workDayStart:eq(3)`, `.workDayEnd:eq(3)` |

- 工作类型：`.workDay` combogrid → `WorkTypeDicAjaxNew.ashx?OperationType=list`
- 工作内容：`.workDayContent` textarea
- 时段 readonly，需 `$('.workTr').show()` + `initWorkType()`

#### 动态行 (AddInfo)

- 触发：`AddInfo()` → 生成 `<tr class="WorkInfo_{id} AddTr">`
- 时间：`#start_{id}` / `#end_{id}` timespinner
- 类型：`#workType_{id}` combogrid
- 内容：`#content_{id}` textarea
- ID 记录在 `window.Cache_Data` (var 全局变量)
- 多行需多次调用 `AddInfo()`

### 保存流程

```
SaveReport() → 表单验证 → isOverlap检查 → Save()
  → $.ajax POST → $('#url').val()
  → URL: UIProGroupAcitvewrite.ashx?OperationType=TaskSave
  → 成功: fnhref() 跳转(需拦截，否则刷新页面)
```

## 关键 API

### 预检：查找已填日报
```
POST UIProGroupAcitvewrite.ashx?OperationType=findtasksave
Data: { date: "2026-04-01" }
Response: { IsSuccess: true, Obj: { PGA_Content: "...", PGA_ID: "..." } }  // 已填
Response: { IsSuccess: false }  // 未填
```

### 工作日判断
```
POST WorkTypeDicAjax.ashx?OperationType=iswork
Data: { date: "2026-04-01" }
Response: { IsSuccess: true }  // 工作日 (dayType="W")
Response: { IsSuccess: false } // 非工作日 (dayType="H")
```

### 工作类型列表
```
GET WorkTypeDicAjaxNew.ashx?OperationType=list
Response: { rows: [{ WTD_ID: "...", WTD_Type: "需求处理", ... }, ...] }
// 固定选第一项
```

### 保存
```
POST UIProGroupAcitvewrite.ashx?OperationType=TaskSave
Data: $('#form1').serialize()
Response: { IsSuccess: true, Msg: "..." }
```

## 查询页验证

```
URL: UIProdGroupActivityList.aspx
表格: #ListTable (easyui-datagrid)
操作: 设 #start/#end → 点击 #btnQuery → 读 datagrid getData
```

## 注意事项

- 周末/节假日 `iswork=false` → `.workTr` 隐藏 → 脚本需强制 `.show()`
- 保存后 `fnhref()` 会跳转页面 → 脚本用直接 AJAX 绕过
- `Cache_Data` / `dayType` 是顶层 `var`，可通过 `window` 访问
- 工作类型 combogrid 异步加载，需轮询等待数据
- 表单含 `__VIEWSTATE` 隐藏字段，序列化时自动包含
