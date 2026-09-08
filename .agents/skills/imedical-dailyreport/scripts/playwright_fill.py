# -*- coding: utf-8 -*-
"""
日报自动填写 - Playwright
流程: 读取内容文件 -> 查询已填 -> 跳过已填 -> 填写剩余
"""
import asyncio, os, re
from playwright.async_api import async_playwright

FILL_URL = "https://xt.imedway.com/ylxt/ProGroupWeek/UIProGroupAcitvewrite.aspx"
LOGIN_URL = "https://xt.imedway.com/ylxt/Login.aspx"
# 自动检测项目根目录（向上查找 CLAUDE.md）
_script_dir = os.path.dirname(os.path.abspath(__file__))
_project_root = _script_dir
for _ in range(10):
    if os.path.exists(os.path.join(_project_root, "CLAUDE.md")):
        break
    _project_root = os.path.dirname(_project_root)
_DEFAULT_CONTENT = os.path.join(_project_root, "日报提交", "日报内容.txt")
CONTENT_FILE = os.environ.get("DAILY_REPORT_CONTENT", _DEFAULT_CONTENT)


def parse_content(filepath):
    """解析日报内容文件，返回 {date: {workplace, items}} """
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    reports = {}
    current_date = None
    current_items = []

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # 匹配日期行: 8-9位数字 (9位是输入错误，如202604021→20260421)
        date_match = re.match(r'^(\d{8,9})$', line)
        if date_match:
            # 保存上一个日期
            if current_date and current_items:
                reports[current_date] = _build_entry(current_items)
            # 新日期
            raw = date_match.group(1)
            current_date = _fix_date(raw)
            current_items = []
        else:
            # 匹配内容行: 数字.内容 或 数字内容(格式容错)
            item_match = re.match(r'^(\d+)[\.\s、]?(.+)', line)
            if item_match and current_date:
                current_items.append(item_match.group(2).strip())

    # 保存最后一个
    if current_date and current_items:
        reports[current_date] = _build_entry(current_items)

    return reports


def _fix_date(raw):
    """修正常见日期格式错误"""
    # 20240408 -> 20260408 (年份typo: 2024→2026)
    if raw.startswith('2024') and len(raw) == 8:
        raw = '2026' + raw[4:]
    # 202604021 -> 20260421 (多打一个0: 跳过第7位)
    if len(raw) == 9 and raw.startswith('2026'):
        raw = raw[:6] + raw[7:]
    return f"{raw[:4]}-{raw[4:6]}-{raw[6:8]}"


def _build_entry(items):
    """根据内容构建条目，自动识别办公地点"""
    text = ' '.join(items)
    if '出差' in text or '途中' in text:
        wp = '出差途中'
    elif '年假' in text or '休假' in text:
        wp = '在家办公'
    else:
        wp = '现场办公'
    return {"workplace": wp, "items": items}


# 加载内容文件
REPORTS = parse_content(CONTENT_FILE)
print(f"Loaded {len(REPORTS)} dates from content file")


async def wait_for_login(page):
    """等待登录"""
    for i in range(120):
        await asyncio.sleep(1)
        url = page.url
        if "Login" not in url and "login" not in url.lower():
            return True
    return False


async def check_date_filled(page, date):
    """用 findtasksave API 快速检查单个日期是否已填（在填写页调用）"""
    result = await page.evaluate(f"""() => {{
        return new Promise((resolve) => {{
            $.ajax({{
                type: 'post',
                data: {{ date: '{date}' }},
                url: 'UIProGroupAcitvewrite.ashx?OperationType=findtasksave',
                success: function(data) {{
                    var obj = typeof data === 'string' ? JSON.parse(data) : data;
                    resolve(obj.IsSuccess === true);
                }},
                error: function() {{ resolve(false); }}
            }});
        }});
    }}""")
    return result


async def fill_one_day(page, date, data):
    """填写一天日报，自动适配不同数量的工作项"""
    items = data['items']
    n = len(items)
    print(f"\n[{date}] ({n} items)")

    # 1. 设日期
    await page.evaluate(f"() => {{ $('#TxtPlanDate').datebox('setValue', '{date}'); }}")
    await page.wait_for_timeout(1500)

    # 2. 强制工作日
    await page.evaluate("""() => {
        document.querySelectorAll('.workTr').forEach(el => { el.style.display = ''; });
        if (typeof initWorkType === 'function') initWorkType();
    }""")
    await page.wait_for_timeout(500)

    # 3. 等工作类型
    work_types = await page.evaluate("""() => {
        return new Promise((resolve) => {
            var n = 0;
            function check() {
                n++;
                try {
                    var g = $('.workDay').first().combogrid('grid');
                    if (g && g.length > 0) {
                        var d = g.datagrid('getData');
                        if (d && d.rows && d.rows.length > 0) {
                            resolve(d.rows.map(r => ({id: r.WTD_ID, name: r.WTD_Type})));
                            return;
                        }
                    }
                } catch(e) {}
                if (n > 75) resolve([]);
                else setTimeout(check, 200);
            }
            check();
        });
    }""")
    if not work_types:
        print("  FAIL: worktype")
        return False
    fid = work_types[0]['id']
    print(f"  type={work_types[0]['name']} wp={data['workplace']}")

    # 4. 办公地点
    wp = data['workplace']
    await page.evaluate(f"""() => {{
        document.querySelectorAll('input[name="workPlace"]').forEach(function(r) {{
            r.checked = (r.value === '{wp}');
        }});
    }}""")

    # 5. 任务类型
    await page.evaluate("() => { $('#TaskTypes').combobox('setValue', 3); }")

    # 6. 计算 5 个时段分配 (4固定 + 1动态)
    # 每个时段分配的内容索引: int(i * n / 5)
    def safe_str(s):
        return s.replace("\\", "\\\\").replace("'", "\\'")

    # 固定 4 时段
    for i in range(4):
        idx = int(i * n / 5) if n <= 5 else (i if i < n else n - 1)
        if idx >= n:
            idx = n - 1
        content = safe_str(items[idx])
        await page.evaluate(f"""() => {{
            $('.workDay').eq({i}).combogrid('setValue', '{fid}');
            $('.workDayContent').eq({i}).val('{content}');
        }}""")

    # 7. 动态行
    if n > 4:
        # 有超过4项，第5项及以上放入动态行
        extra = items[4:]
        # 第一条动态行: 第5项 (或合并第5+项)
        if n <= 5:
            dyn_content = safe_str(extra[0])
        else:
            dyn_content = safe_str("\n".join(extra))

        print(f"    dynamic: {len(extra)} items -> 1 row")
    else:
        # n <= 4: 第5时段复用最后一项
        dyn_content = safe_str(items[-1])

    # 清除旧动态行 + 添加新行
    new_id = await page.evaluate("""() => {
        document.querySelectorAll('.AddTr').forEach(el => el.remove());
        if (typeof Cache_Data !== 'undefined') Cache_Data.length = 0;
        AddInfo();
        return new Promise((resolve) => {
            setTimeout(() => {
                var id = -1;
                if (typeof Cache_Data !== 'undefined' && Cache_Data.length > 0)
                    id = Cache_Data[Cache_Data.length - 1];
                else {
                    var rows = document.querySelectorAll('.AddTr');
                    if (rows.length > 0) {
                        var m = rows[rows.length - 1].className.match(/WorkInfo_(\\d+)/);
                        if (m) id = parseInt(m[1]);
                    }
                }
                resolve(id);
            }, 500);
        });
    }""")

    # 等动态 combogrid
    await page.evaluate(f"""(nid) => {{
        return new Promise((resolve) => {{
            var n = 0;
            function check() {{
                n++;
                try {{
                    var g = $('#workType_' + nid).combogrid('grid');
                    if (g && g.length > 0 && g.datagrid('getData').rows.length > 0) {{
                        resolve(); return;
                    }}
                }} catch(e) {{}}
                if (n > 75) resolve();
                else setTimeout(check, 200);
            }}
            check();
        }});
    }}""", new_id)
    await page.wait_for_timeout(200)

    await page.evaluate("""(arg) => {
        $('#start_' + arg.n).timespinner('setValue', '17:30');
        $('#end_' + arg.n).timespinner('setValue', '18:30');
        $('#workType_' + arg.n).combogrid('setValue', arg.f);
        $('#content_' + arg.n).val(arg.c);
    }""", {"n": new_id, "f": fid, "c": dyn_content})

    # 8. 保存
    result = await page.evaluate("""() => {
        return new Promise((resolve) => {
            $.ajax({
                type: 'post',
                data: $('#form1').serialize(),
                url: $('#url').val(),
                success: function(msg) {
                    try { var o = JSON.parse(msg); resolve({ok: o.IsSuccess === true, msg: o.Msg || ''}); }
                    catch(e) { resolve({ok: false, msg: msg.substring(0, 200)}); }
                },
                error: function(x,s) { resolve({ok: false, msg: s}); }
            });
        });
    }""")

    if result['ok']:
        print(f"  OK")
        return True
    else:
        print(f"  FAIL: {result['msg']}")
        return False


async def main():
    print("Daily Report Auto-Fill")
    print("=" * 35)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={"width": 1280, "height": 900})
        page = await context.new_page()

        # ======== 登录 ========
        print(f"Goto: {LOGIN_URL}")
        await page.goto(LOGIN_URL, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(1000)

        if "Login" in page.url or "login" in page.url.lower():
            if not await wait_for_login(page):
                print("Login timeout!")
                await browser.close()
                return
            await page.wait_for_timeout(2000)

        # ======== 先到填写页 ========
        print(f"\nGoto fill page: {FILL_URL}")
        await page.goto(FILL_URL, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(1500)

        for i in range(30):
            if "UIProGroupAcitvewrite" in page.url:
                break
            await asyncio.sleep(1)

        await page.wait_for_selector('#form1', timeout=15000)
        await page.wait_for_timeout(1000)

        # ======== 预检：逐日调用 findtasksave API ========
        all_dates = sorted(REPORTS.keys())
        print(f"\nPre-check: {len(all_dates)} dates total")
        filled = []
        empty = []
        for i, date in enumerate(all_dates):
            is_filled = await check_date_filled(page, date)
            if is_filled:
                filled.append(date)
            else:
                empty.append(date)
            # 每10个输出一次进度
            if (i + 1) % 10 == 0 or i == len(all_dates) - 1:
                print(f"  checked {i+1}/{len(all_dates)}: {len(filled)} filled, {len(empty)} empty")

        todo = {d: REPORTS[d] for d in empty}
        skip = filled

        if skip:
            print(f"  SKIP {len(skip)} already filled")
        if not todo:
            print("\nAll dates already filled! Done.")
            await asyncio.sleep(10)
            await browser.close()
            return
        print(f"  TODO: {len(todo)} dates to fill")

        # ======== 填写 ========
        dates = list(todo.keys())
        ok = 0
        for i, date in enumerate(dates):
            if await fill_one_day(page, date, todo[date]):
                ok += 1
            if i < len(dates) - 1:
                await page.wait_for_timeout(800)

        print(f"\nDone: filled {ok}/{len(todo)}, skipped {len(skip)} already filled")
        print("Browser stays open for 30s...")
        await asyncio.sleep(30)
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
