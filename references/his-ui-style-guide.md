# HIS UI 风格一致性规范

开发新页面时必须遵循以下规范，以保持与 HIS 系统的视觉一致性。

## 页面模板

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

## 1. 字体

- 全局字体：`"Microsoft Yahei"`（微软雅黑）
- 基础字号：`14px`（默认）、`12px`（紧凑场景）、`13px`（小字/分页）

## 2. 颜色体系

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

## 3. 按钮 (`.i-btn`)

- 宽度：`110px`，居中文字，`border-radius: 5px`
- 渐变背景：`linear-gradient(to bottom, #ffffff 0, #eeeeee 100%)`
- Hover：`linear-gradient(to bottom, #CDCDCD 0, #ECECEC 100%)`
- 边框：`1px solid #bbb`
- 禁用态：文字 `#c8c8c8`，保持原渐变

HISUI 按钮使用 `hisui-linkbutton`，图标用 `iconCls`（如 `icon-search`、`icon-w-export`）。

## 4. 输入框

- 边框：`1px solid #95B8E7`，高度 `24px`
- Focus：`border-color: #6b9cde`，`box-shadow: 0 0 3px 0 #95B8E7`，背景 `#ffe48d`
- 禁用态：`.disabledField` — 背景 `#dddddd`
- HISUI 控件：`hisui-datebox`、`hisui-validatebox`、`hisui-combobox`

## 5. 表格 (`.tblList`)

- 表头：`background: linear-gradient(to bottom, #F9F9F9 0, #efefef 100%)`，高度 `25px`
- 表头边框：上 `#95B8E7`，右虚线 `#CCCCCC`，下实线 `#CCCCCC`
- 奇数行 `#ffffff`，偶数行 `#FAFAFA`
- 悬停行 `#eaf2ff`，选中行 `#FFE48D`
- 固定列宽 `120px`，`word-break: break-all`
- HISUI 表格使用 `hisui-datagrid`

## 6. 标题栏 (`.maintitle` / `.formtitle` / `.listtitle`)

- 字号 `14px`，颜色 `#15428b`，加粗
- 背景 `#E4F0FF`，`padding-left: 28px`（留图标位）
- 边框 `1px #95B8E7 solid`，高度 `23px`

## 7. Tab 标签 (`.tabstitle`)

- 上圆角 `5px`，背景渐变 `#EFF5FF → #E0ECFF`
- 文字颜色 `#0E2D5F`，高度 `26px`
- 激活态：`#F6F9FF → #FFFFFF`，加粗

## 8. 分页栏 (`.pagebg`)

- 背景 `#F4F4F4`，边框 `1px solid #dddddd`，高度 `28px`
- Hover：背景 `#eaf2ff`，边框 `#b7d2ff`

## 9. 状态行颜色

| 状态 | 颜色 | 说明 |
|------|------|------|
| `TR.UnPaid` | `#d0ffff` | 未收费 |
| `TR.Immediate` | `#ffb90e` | 紧急 |
| `TR.SkinTest` | `#e00000` | 皮试 |
| `TR.Discontinue` | `deepskyblue` | 停止 |
| `TR.Temp` | `#ffffc0` | 临时 |
| `TR.LongNew` | `#ffc0c0` | 新长嘱 |

## 10. HISUI 常用组件

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

<!-- 单选 -->
<input class="hisui-radio" type="radio" label="汇总" name="type" value="1">

<!-- 数据表格 -->
<div class="hisui-datagrid" data-options="url:'...',columns:[...]"></div>

<!-- 手风琴 -->
<div class="hisui-accordion">
  <div title="标题" data-options="iconCls:'icon-w-update',selected:true">内容</div>
</div>
```

## 11. 通用约定

- CSS Reset：`margin: 0; padding: 0`（所有块元素）
- 列表 `list-style: none`
- 链接 `text-decoration: none`，颜色 `#0033cc`
- 中文界面，CSV 导出带 BOM 兼容 Excel UTF-8
- 命名空间运行时切换到 `DHC-APP`
- REST API 路径：`/api/apache2`
- ObjectScript 字符串拼接用 `_`，不用 `+`
- `$system.OBJ.Compile` 编译类，`%SQL.Statement` 执行 SQL
