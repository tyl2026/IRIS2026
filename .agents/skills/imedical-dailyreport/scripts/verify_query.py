"""
快速验证：打开查询页面查看已填日报
"""
import asyncio
from playwright.async_api import async_playwright

QUERY_URL = "https://xt.imedway.com/ylxt/ProGroupWeek/UIProdGroupActivityList.aspx"
FIRST_DATE = "2025-05-15"
LAST_DATE = "2025-05-18"

async def main():
    print("Verify daily report submission")
    print("=" * 40)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={"width": 1280, "height": 900})
        page = await context.new_page()

        # 导航到查询页
        print(f"Goto: {QUERY_URL}")
        await page.goto(QUERY_URL, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(2000)

        # 等待登录（如果需要）
        if "Login" in page.url or "login" in page.url.lower():
            print("Waiting for login (scan QR)...")
            for i in range(120):
                await asyncio.sleep(1)
                if "Login" not in page.url and "login" not in page.url.lower():
                    print("Logged in!")
                    await page.goto(QUERY_URL, wait_until="networkidle", timeout=30000)
                    break

        # 等待表格
        print("Waiting for table...")
        try:
            await page.wait_for_selector('#ListTable', timeout=15000)
        except:
            print("Table not found, waiting for manual navigation...")
            await asyncio.sleep(5)

        await page.wait_for_timeout(2000)

        # 设日期范围
        print(f"Set date: {FIRST_DATE} ~ {LAST_DATE}")
        await page.evaluate(f"""() => {{
            $('#start').datebox('setValue', '{FIRST_DATE}');
            $('#end').datebox('setValue', '{LAST_DATE}');
        }}""")
        await page.wait_for_timeout(500)

        # 点查询
        print("Click query...")
        await page.evaluate("""() => { $('#btnQuery').click(); }""")
        await page.wait_for_timeout(3000)

        # 截图
        path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "query_result.png")
        await page.screenshot(path=path, full_page=False)
        print(f"Screenshot: {path}")

        # 结果统计
        info = await page.evaluate("""() => {
            var dg = $('#ListTable').datagrid('getData');
            if (!dg) return 'No grid data';
            var rows = dg.rows || [];
            return 'Found ' + rows.length + ' records. Dates: ' + rows.map(function(r) {
                return r.PGA_WriteDateTime || r.PGA_CreateDate || '?';
            }).join(', ');
        }""")
        print(f"Result: {info}")

        print("\nCheck the browser. Close manually when done.")
        await asyncio.sleep(120)
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
