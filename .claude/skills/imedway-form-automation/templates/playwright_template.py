# -*- coding: utf-8 -*-
"""
iMEDWAY 协同网表单自动化 — Playwright 模板
复制此文件，填充 TODO 部分即可
"""
import asyncio, json, os, re
from datetime import date, timedelta
from playwright.async_api import async_playwright

# ============ TODO: 配置 ============
LOGIN_URL = "https://xt.imedway.com/ylxt/Login.aspx"
FORM_URL = "https://xt.imedway.com/ylxt/CHANGE_ME.aspx"  # ← 目标页面 URL
LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "CHANGE_ME_log.json")


# ============ 通用工具函数 ============

async def wait_for_login(page, timeout=120):
    """等待用户扫码登录"""
    for i in range(timeout):
        await asyncio.sleep(1)
        if "Login" not in page.url and "login" not in page.url.lower():
            return True
    return False


async def handle_messager(page, timeout=3):
    """关闭 easyUI messager 弹框"""
    for i in range(timeout * 2):
        result = await page.evaluate("""() => {
            var msgs = document.querySelectorAll('.messager-window');
            for (var i = 0; i < msgs.length; i++) {
                var m = msgs[i];
                if (m.offsetParent === null) continue;
                var btns = m.querySelectorAll('.messager-button a.l-btn');
                if (btns.length > 0) { btns[0].click(); return 'ok'; }
            }
            return 'none';
        }""")
        if result != 'none': return
        await asyncio.sleep(0.5)


async def find_iframe_with(page, element_id):
    """查找包含指定元素的 iframe"""
    for f in page.frames:
        try:
            has = await f.evaluate(f"() => {{ return !!document.getElementById('{element_id}'); }}")
            if has: return f
        except: pass
    return None


def load_log():
    """加载操作日志，防止重复提交"""
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"done": {}}


def save_log(log):
    """保存操作日志"""
    with open(LOG_FILE, 'w', encoding='utf-8') as f:
        json.dump(log, f, ensure_ascii=False, indent=2)


# ============ TODO: 业务逻辑 ============

async def fill_one_item(page, item_data):
    """填写单个条目 — 根据实际表单修改"""
    # 示例：设置日期
    # await page.evaluate(f"() => {{ $('#datePicker').datebox('setValue', '{item_data['date']}'); }}")

    # 示例：点击按钮
    # await page.evaluate("() => { document.getElementById('BtnSave').click(); }")

    # 示例：iframe 内操作
    # frame = await find_iframe_with(page, 'txtContent')
    # if frame:
    #     await frame.evaluate('''(data) => {
    #         $('#txtContent').textbox('setValue', data.content);
    #     }''', {'content': 'hello'})
    pass


def generate_data():
    """生成需要填写的条目 — 根据实际需求修改"""
    # 从文件读取或动态生成
    return []


# ============ 主流程 ============

async def main():
    items = generate_data()
    if not items:
        print("No items to process")
        return

    log = load_log()
    pending = [i for i in items if i.get('key') not in log.get('done', {})]
    print(f"Total: {len(items)}, Done: {len(items)-len(pending)}, Todo: {len(pending)}")

    if not pending:
        print("All done!")
        return

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        ctx = await browser.new_context(viewport={"width": 1280, "height": 900})
        page = await ctx.new_page()

        # 登录
        await page.goto(LOGIN_URL, wait_until="networkidle", timeout=30000)
        if "Login" in page.url or "login" in page.url.lower():
            print("Please scan QR to login...")
            if not await wait_for_login(page):
                print("Login timeout!")
                await browser.close()
                return
            await page.wait_for_timeout(2000)

        # 导航到目标页面
        print(f"Navigating to form...")
        await page.goto(FORM_URL, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(3000)

        # 逐条处理
        ok = skip = fail = 0
        for i, item in enumerate(pending):
            print(f"[{i+1}/{len(pending)}] Processing...")
            try:
                await fill_one_item(page, item)
                log.setdefault('done', {})[item.get('key')] = True
                save_log(log)
                ok += 1
            except Exception as e:
                print(f"  ERROR: {e}")
                fail += 1
            if i < len(pending) - 1:
                await page.wait_for_timeout(1000)

        print(f"\nDone: {ok} ok, {skip} skip, {fail} fail")
        await asyncio.sleep(30)
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
