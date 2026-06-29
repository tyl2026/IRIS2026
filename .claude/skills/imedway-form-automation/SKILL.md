---
name: imedway-form-automation
description: >
  iMEDWAY（东华医为）协同网表单自动填写 Skill 工厂。当用户需要在协同网上自动化填写
  新类型的表单时触发——包括但不限于："帮我做一个XX填写skill"、"自动化XX填报"、
  "给协同网XX页面写个自动填写脚本"、"帮我把XX流程自动化"等。也用于修改、增强
  现有协同网自动化 skill。提供标准化的表单分析→脚本编写→测试→打包全流程指导，
  包含 Playwright + easyUI 的成熟代码模板。
---

# iMEDWAY 协同网表单自动化 Skill 工厂

指导快速创建新的协同网表单自动化 skill。基于已验证的日报/周报/项目周报三大 skill 经验。

## 工作流（4 阶段）

### 阶段 1：探查表单

目标：获取页面 URL 和字段结构。

#### 1.1 获取页面 URL（第一步）

**优先让用户提供页面框架源码**——这是最可靠的方式，不需要猜测 URL。

告诉用户：
> 请在目标页面右键 → 查看框架源代码 / 按 Ctrl+S 保存网页 → 把 HTML 源码发给我

拿到 HTML 后，按以下优先级提取 URL：

```
1. <form action="./Page.aspx">              → 表单提交地址
2. location.href = "../Path/Page.aspx?x=y"  → JS 跳转目标
3. $.ajax({ url: "api.ashx?OperationType=X" }) → API 端点
4. <script src="../jquery-easyui/...">      → 推断目录层级
```

从相对路径拼接完整 URL 示例：
```
HTML 中: location.href = "../WeekReport/UIWeeklyReport.aspx?modefiytime=" + date
当前页: ylxt/WeekReport/UISaleWeeklyReportPatchDate.aspx
       → ylxt/WeekReport/UIWeeklyReport.aspx?modefiytime={date} ✅
```

**备用方案**（用户无法提供 HTML 时）：
- 读取 Chrome Session 文件：`%LocalAppData%\Google\Chrome\User Data\Default\Sessions\Tabs_*`
- 用 Playwright 登录后，从已知补交页面追踪跳转

#### 1.2 分析字段和流程

**从 HTML 中提取：**
- 表单 ID（`#form1`, `#formadd`）
- 输入字段：`<input>`, `<textarea>`, easyUI 组件（`class="easyui-datebox"` 等）
- 按钮：`<a class="easyui-linkbutton">` 及其 `id`、`onclick`
- 弹窗/iframe：`<iframe>` 内的子表单
- API 调用：AJAX URL、参数、`OperationType`

**必问用户：**
- 操作流程是什么？（几步？什么顺序？）
- 每一步后有什么弹框？（成功/失败/确认）
- 是否有补交截止日期？（几号？上月还是当月？）
- 有没有项目阶段/分类等下拉选项？默认选什么？

### 阶段 2：编写脚本

使用 `templates/playwright_template.py` 作为起点。

**核心模式速查：**

```python
# 登录
await page.goto(LOGIN_URL, wait_until="networkidle")
if "Login" in page.url:
    for i in range(120):  # 等扫码
        await asyncio.sleep(1)
        if "Login" not in page.url: break

# easyUI datebox
$('#x').datebox('setValue', '2026-06-01')

# easyUI textbox ⚠️ 必须用 textbox API
$('#x').textbox('setValue', 'content')

# easyUI combobox/combogrid
$('#x').combobox('setValue', val)
$('#x').combogrid('setValue', id)

# 读取 easyUI datagrid
$('#x').datagrid('getData')  # → {rows: [...], total: N}

# iframe 内表单
for f in page.frames:
    has = await f.evaluate('() => !!document.getElementById("target")')
    if has: await f.evaluate('() => { /* 在 iframe 内操作 */ }')

# 弹框关闭
await page.evaluate('''() => {
    var m = document.querySelector(".messager-window");
    if (m) m.querySelector(".messager-button a.l-btn").click();
}''')

# AJAX 预检（不导航）
result = await page.evaluate('''() => {
    return new Promise((resolve) => {
        $.ajax({type:'post', url:'api.ashx', data:{}, success: resolve});
    });
}''')

# 异步等待 easyUI 组件加载
await page.evaluate('''() => {
    return new Promise((resolve) => {
        var n=0; function check() { n++;
            var d = $('#grid').datagrid('getData');
            if (d && d.rows && d.rows.length>0) { resolve(d.rows); return; }
            if (n>60) resolve([]); else setTimeout(check, 200);
        } check();
    });
}''')
```

### 阶段 3：测试迭代

**测试顺序：**
1. 先测单步：能否成功点击按钮？弹框是否正确关闭？
2. 再测单条：填写一条数据，不保存/不提交
3. 最后全流程：多条数据 + 保存 + 提交

**关键验证点：**
- 内容是否正确填入（在浏览器中肉眼确认）
- 弹框是否正确关闭（生成成功/保存成功/提交成功）
- 日期格式是否正确（`yyyy-mm-dd`）
- 日志是否正确记录

**测试脚本模板：**
```python
# test_single.py — 只测一条，不提交
async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        # 登录 → 导航 → 操作一步 → 截图 → 关闭
```

### 阶段 4：打包 Skill

```bash
cp test_script.py .claude/skills/<skill-name>/scripts/
```

SKILL.md 结构：
```yaml
---
name: imedical-xxx
description: >
  触发词列表 + 一句话描述。pushy style：覆盖各种口语表达。
---
## 工作流
## 运行
## 关键页面和按钮
## 日志
## 依赖
```

参考 `references/经验总结.md` 获取三个已上线 skill 的完整对比。

## 易错清单

| 问题 | 原因 | 解决 |
|------|------|------|
| 内容填入无效 | textarea 被 easyUI textbox 包裹 | `$('#x').textbox('setValue', v)` |
| Bash `#` 注释 | `$("#x")` 被 shell 当成注释 | 写成 `.py` 文件运行 |
| iframe 元素找不到 | 元素在 iframe 内 | 遍历 `page.frames` |
| 弹框关不掉 | `offsetParent` 为 null | 检查可见性用 `offsetParent !== null` |
| 重复提交 | 无日志记录 | 用 JSON 文件记录 `{done: {date: true}}` |
| 中文乱码 | Windows GBK | 保存文件用 UTF-8，读取用 `encoding='utf-8'` |
| 日期格式错 | `202604021`(9位) | `raw[:6] + raw[7:]` 修正 |

## 参考资源

- `references/经验总结.md` — 三大 skill 完整对比 + 所有 easyUI 组件操作表
- `templates/playwright_template.py` — 可复用的 Playwright 脚本模板（登录、iframe、弹框、日志）
