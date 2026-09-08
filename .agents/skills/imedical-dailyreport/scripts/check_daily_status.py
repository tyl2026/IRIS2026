# -*- coding: utf-8 -*-
"""快速预检：8月日报在协同网的提交状态（findtasksave API）"""
import asyncio
from playwright.async_api import async_playwright

LOGIN_URL = "https://xt.imedway.com/ylxt/Login.aspx"
FILL_URL = "https://xt.imedway.com/ylxt/ProGroupWeek/UIProGroupAcitvewrite.aspx"

DATES = [
    "2026-08-03", "2026-08-04", "2026-08-05", "2026-08-06", "2026-08-07",
    "2026-08-10", "2026-08-11", "2026-08-12", "2026-08-13", "2026-08-14",
    "2026-08-17", "2026-08-18", "2026-08-19", "2026-08-20", "2026-08-21",
    "2026-08-24", "2026-08-25",
]


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.goto(LOGIN_URL, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(1000)
        if "Login" in page.url or "login" in page.url.lower():
            print("请扫码登录...")
            for i in range(120):
                await asyncio.sleep(1)
                if "Login" not in page.url and "login" not in page.url.lower():
                    print("已登录")
                    break
            else:
                print("登录超时")
                await browser.close()
                return

        await page.goto(FILL_URL, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(1500)
        for i in range(30):
            if "UIProGroupAcitvewrite" in page.url:
                break
            await asyncio.sleep(1)
        await page.wait_for_selector('#form1', timeout=15000)
        await page.wait_for_timeout(1000)

        filled, empty = [], []
        for date in DATES:
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
            (filled if result else empty).append(date)
            print(f"  {date}: {'FILLED' if result else 'EMPTY'}")

        print(f"\nFilled ({len(filled)}): {', '.join(filled)}")
        print(f"Empty ({len(empty)}): {', '.join(empty)}")
        await asyncio.sleep(3)
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
