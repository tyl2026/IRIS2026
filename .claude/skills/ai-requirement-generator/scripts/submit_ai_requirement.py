# -*- coding: utf-8 -*-
"""
AI需求自动提交到协同网 - Playwright
流程: 读取需求文件 → 逐条填写 → 创建需求
"""
import asyncio, os, re, sys
from playwright.async_api import async_playwright

# 需求文件路径（可通过环境变量覆盖）
# 自动检测项目根目录（向上查找 CLAUDE.md）
_script_dir = os.path.dirname(os.path.abspath(__file__))
_project_root = _script_dir
for _ in range(10):
    if os.path.exists(os.path.join(_project_root, "CLAUDE.md")):
        break
    _project_root = os.path.dirname(_project_root)

_DEFAULT_DIR = os.path.join(_project_root, "AI需求")
_FALLBACK_DIR = os.path.join(os.environ.get("USERPROFILE", ""), "Desktop", "AI需求")
_REQUIREMENT_DIR = _DEFAULT_DIR if os.path.isdir(_DEFAULT_DIR) else _FALLBACK_DIR

# 附件目录
ATTACH_DIR = os.path.join(_REQUIREMENT_DIR, "需求附件")

def _get_latest_file():
    """自动取 AI需求 目录下序号最大且未提交的文件"""
    files = [f for f in os.listdir(_REQUIREMENT_DIR)
             if f.endswith('_AI需求.txt') and '_已提交' not in f]
    if not files:
        return None
    files.sort()
    return os.path.join(_REQUIREMENT_DIR, files[0])

REQUIREMENT_FILE = os.environ.get("AI_REQUIREMENT_FILE") or _get_latest_file() or ""


def mark_submitted(filepath):
    """标记需求文件已提交（重命名加 _已提交 后缀）"""
    if not filepath or not os.path.exists(filepath):
        return
    dirname, basename = os.path.split(filepath)
    name, ext = os.path.splitext(basename)
    new_path = os.path.join(dirname, f"{name}_已提交{ext}")
    os.rename(filepath, new_path)
    print(f"已标记: {basename} → {os.path.basename(new_path)}")

# 协同网地址
REQUIREMENT_URL = "https://xt.imedway.com/ylxt/UIdemand/UIDemandCreatePjtoPjByPWP.aspx"
LOGIN_URL = "https://xt.imedway.com/ylxt/Login.aspx"

# 附件目录

# 固定参数
RECEIVER_NAME = "谭有良"
DEMAND_TYPE = "新项开发"
PERSON_TYPE = 1  # 0=工程总监, 1=本组人员, 2=本分区, 3=本区域


def get_seq_from_filename(filepath):
    """从文件名提取序号，如 001_20260703_xxx.txt → 001"""
    basename = os.path.basename(filepath)
    seq = basename.split('_')[0]
    return seq


def find_attachment(seq, req_index=None):
    """根据序号查找附件
    seq=001, req_index=None → 需求附件/1.png (整文件附件，向后兼容)
    seq=001, req_index=1   → 需求附件/1-1.png (需求1的附件)
    seq=001, req_index=2   → 需求附件/1-2.png (需求2的附件)
    """
    if not os.path.isdir(ATTACH_DIR):
        return None
    num = str(int(seq))
    if req_index is not None:
        # 精确匹配: N-M.png
        target = f"{num}-{req_index}"
        for f in os.listdir(ATTACH_DIR):
            name = os.path.splitext(f)[0]
            if name == target:
                return os.path.join(ATTACH_DIR, f)
        # 回退: 无独立附件时尝试共用 N.png
    # 匹配 N.png（向后兼容）
    for f in os.listdir(ATTACH_DIR):
        name = os.path.splitext(f)[0]
        if name == num:
            return os.path.join(ATTACH_DIR, f)
    return None


def parse_requirements(filepath):
    """解析 AI 需求文件，返回需求列表"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    reqs = []
    # 按"需求N："分割
    blocks = re.split(r'\n(?=需求[一二三四五六七八九十\d]+：)', content.strip())
    for block in blocks:
        if not block.strip():
            continue
        req = {}
        for line in block.strip().split('\n'):
            line = line.strip()
            if line.startswith('需求') and '：[AI需求]' in line:
                # 需求1：[AI需求]特殊患者管理 — 下载导入模板
                req['title'] = '[AI需求]' + line.split('：[AI需求]', 1)[1].strip()
            elif line.startswith('模块：'):
                req['module'] = line.replace('模块：', '').strip()
            elif line.startswith('产品线：'):
                req['product_line'] = line.replace('产品线：', '').strip()
            elif line.startswith('产品组：'):
                req['product_group'] = line.replace('产品组：', '').strip()
            elif line.startswith('现状：'):
                req['current'] = line.replace('现状：', '').strip()
            elif line.startswith('需求：'):
                req['demand'] = line.replace('需求：', '').strip()
            elif line.startswith('截图：'):
                req['screenshot'] = line.replace('截图：', '').strip()
        if req:
            reqs.append(req)
    return reqs


async def wait_for_login(page, timeout=120):
    """等待用户登录"""
    print("等待登录...")
    for i in range(timeout):
        await asyncio.sleep(1)
        url = page.url
        if "Login" not in url and "login" not in url.lower():
            print("登录完成")
            return True
    print("登录超时")
    return False


async def wait_for_ready(page, timeout=60):
    """等待 easyUI 和页面组件加载完成"""
    print("等待页面加载...")
    try:
        await page.wait_for_load_state('networkidle', timeout=30000)
    except:
        pass
    for i in range(timeout):
        await asyncio.sleep(1)
        try:
            ready = await page.evaluate("""() => {
                if (typeof $ === 'undefined') return false;
                if (typeof $.fn.combobox === 'undefined') return false;
                if (typeof $.fn.combogrid === 'undefined') return false;
                var d = $('#DrpDemandType');
                if (d.length === 0) return false;
                return true;
            }""")
            if ready:
                print("页面加载完成")
                return True
        except Exception as e:
            pass
    print("页面加载超时")
    return False


async def close_masks(page):
    """关闭页面上可能存在的遮罩/弹窗"""
    await page.evaluate("""() => {
        try { $.messager.progress('close'); } catch(e) {}
        try { $('.window-mask').remove(); } catch(e) {}
        try { $('.messager-window').remove(); } catch(e) {}
        try { $('.panel-tool-close').trigger('click'); } catch(e) {}
    }""")
    await asyncio.sleep(0.3)


async def fill_demand_type(page):
    """选择需求类型为'新项开发'"""
    for i in range(15):
        data = await page.evaluate("""() => {
            var d = $('#DrpDemandType').combobox('getData');
            return d ? d.length : 0;
        }""")
        if data > 0:
            break
        await asyncio.sleep(1)

    # 先输出现有选项用于调试
    debug = await page.evaluate("""() => {
        var cb = $('#DrpDemandType').combobox('getData');
        var names = [];
        for (var i = 0; i < cb.length; i++) {
            var keys = Object.keys(cb[i]);
            names.push(cb[i].DS_Name || cb[i].name || cb[i].text || JSON.stringify(cb[i]));
        }
        return names.slice(0, 10).join(' | ');
    }""")
    print(f"需求类型可选项: {debug}")

    val = await page.evaluate(f"""() => {{
        var cb = $('#DrpDemandType').combobox('getData');
        for (var i = 0; i < cb.length; i++) {{
            var name = cb[i].DS_Name || cb[i].name || cb[i].text || '';
            if (name.indexOf('{DEMAND_TYPE}') >= 0) {{
                $('#DrpDemandType').combobox('setValue', cb[i].DS_ID || cb[i].value || cb[i].id);
                return 'OK: ' + name;
            }}
        }}
        return 'NOT FOUND';
    }}""")
    print(f"需求类型: {val}")


async def fill_title(page, title):
    """填写需求名称"""
    await page.evaluate(f"""$('#TxtTitle').textbox('setValue', {json.dumps(title, ensure_ascii=False)})""")
    print(f"需求名称: {title}")


async def select_module(page, module_name):
    """在模块 combogrid 中搜索并选择模块"""
    # 先关遮罩
    await close_masks(page)

    # 展开 dropdown
    await page.evaluate("""$('#TxtProduct').combogrid('showPanel')""")
    await asyncio.sleep(1)

    # 在搜索面板中键入模块名搜索
    await page.evaluate(f"""$('#TxtPName').val({json.dumps(module_name, ensure_ascii=False)})""")
    await page.evaluate("""$('#btnQueryProduct').trigger('click')""")
    await asyncio.sleep(2)

    result = await page.evaluate(f"""() => {{
        var g = $('#TxtProduct').combogrid('grid');
        var rows = g.datagrid('getRows');
        for (var i = 0; i < rows.length; i++) {{
            if (rows[i].PI_Name) {{
                $('#TxtProduct').combogrid('setValue', rows[i].PI_Name);
                g.datagrid('selectRow', i);
                var opts = $('#TxtProduct').combogrid('options');
                if (opts.onSelect) opts.onSelect(i, rows[i]);
                return 'OK: ' + rows[i].PI_Name;
            }}
        }}
        return 'NOT FOUND, rows=' + rows.length;
    }}""")
    print(f"模块选择: {result}")


async def select_person(page, person_type, person_name):
    """选择接收人员"""
    await close_masks(page)

    # 1. 点击本组人员 radio
    await page.evaluate(f"""$('input[name=bumen][value={person_type}]').prop('checked', true).trigger('click')""")
    await asyncio.sleep(0.5)

    # 2. 填入姓名并查询
    await page.evaluate(f"""$('#TxtName').val({json.dumps(person_name, ensure_ascii=False)})""")
    await page.evaluate("""$('#btnQuery').trigger('click')""")
    await asyncio.sleep(1.5)

    # 3. 选择匹配行
    result = await page.evaluate(f"""() => {{
        var rows = $('#ListTable').datagrid('getRows');
        if (rows.length > 0) {{
            for (var i = 0; i < rows.length; i++) {{
                if (rows[i].U_NAME && rows[i].U_NAME.indexOf({json.dumps(person_name, ensure_ascii=False)}) >= 0) {{
                    $('#ListTable').datagrid('selectRow', i);
                    var row = $('#ListTable').datagrid('getSelected');
                    if (typeof onSelect === 'function') onSelect(i, row);
                    return 'OK: ' + row.U_NAME;
                }}
            }}
        }}
        return 'NOT FOUND, rows=' + rows.length;
    }}""")
    print(f"人员选择: {result}")


async def verify_receiver(page, expected_name):
    """验证需求接收人是否正确显示"""
    text = await page.evaluate("""() => $('#userlist').text().trim()""")
    ok = expected_name in text
    status = 'OK' if ok else ('FAIL, expected: ' + expected_name)
    print(f"Receiver verify: '{text}' -> {status}")
    return ok


async def fill_content(page, req, attach_path=None):
    """填充需求描述（summernote 编辑器），附件图片转 base64 内联到备注"""
    img_html = ''
    if attach_path and os.path.isfile(attach_path):
        import base64 as b64
        ext = os.path.splitext(attach_path)[1].lower()
        mime_map = {'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
                    '.gif': 'image/gif', '.bmp': 'image/bmp', '.webp': 'image/webp'}
        mime = mime_map.get(ext, 'image/png')
        with open(attach_path, 'rb') as f:
            data = b64.b64encode(f.read()).decode('ascii')
        img_html = f'<img src="data:{mime};base64,{data}" style="max-width:100%"/>'
        print(f"附件转 base64 内联: {attach_path} ({len(data)} chars)")

    if img_html:
        content = f"""<p>[现状]</p><p>{req.get('current', '')}</p><p>[需求]</p><p>{req.get('demand', '')}</p><p>[备注]</p>{img_html}"""
    else:
        content = f"""<p>[现状]</p><p>{req.get('current', '')}</p><p>[需求]</p><p>{req.get('demand', '')}</p><p>[备注]</p><p></p>"""
    await page.evaluate(f"""$('#TxtContent').summernote('code', {json.dumps(content, ensure_ascii=False)})""")
    print(f"需求描述已填充{' (含 base64 内联图片)' if img_html else ''}")


async def upload_attachment(page, seq):
    """上传需求附件"""
    attach_path = find_attachment(seq)
    if not attach_path:
        print(f"未找到附件（序号 {seq}），跳过上传")
        return False

    print(f"上传附件: {attach_path}")
    try:
        await page.set_input_files('#file1', attach_path)
        await asyncio.sleep(1)
        print("附件上传完成")
        return True
    except Exception as e:
        print(f"附件上传失败: {e}")
        return False


async def submit_requirement(page):
    """点击创建需求按钮"""
    # 先检查按钮是否可用
    disabled = await page.evaluate("""() => $('#btnSave').linkbutton('options').disabled""")
    if disabled:
        print("创建按钮被禁用，请检查必填项")
        return False

    await page.click('#btnSave')
    print("已点击「创建需求」按钮")

    # 等待提交结果
    await asyncio.sleep(3)

    # 检查是否有提示弹窗
    try:
        msg = await page.evaluate("""() => {
            var panels = $('.messager-body .panel-body');
            for (var i = 0; i < panels.length; i++) {
                var t = $(panels[i]).text().trim();
                if (t) return t;
            }
            return '';
        }""")
        if msg:
            print(f"提交结果: {msg}")
            # 关闭提示弹窗
            await page.evaluate("""$('.messager-body').closest('.messager-window').find('.panel-tool-close').trigger('click')""")
            await asyncio.sleep(0.5)
    except:
        pass

    return True


async def main():
    if not REQUIREMENT_FILE:
        print("没有待提交的需求文件，所有需求已提交完毕。")
        return

    reqs = parse_requirements(REQUIREMENT_FILE)
    print(f"共解析到 {len(reqs)} 条需求")
    for i, r in enumerate(reqs):
        print(f"  {i+1}. {r.get('title', 'N/A')}")

    if not reqs:
        print("未解析到需求，退出")
        return


    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()

        # 打开需求创建页面
        await page.goto(REQUIREMENT_URL)

        # 等待登录
        logged_in = await wait_for_login(page)
        if not logged_in:
            print("登录失败，请手动登录后重试")
            await browser.close()
            return

        # 确保在正确页面
        current_url = page.url
        print(f"当前 URL: {current_url}")
        if "UIDemandCreate" not in current_url:
            print("重定向到需求创建页面...")
            await page.goto(REQUIREMENT_URL)
            await page.wait_for_load_state('networkidle')

        # 等待页面组件加载
        if not await wait_for_ready(page):
            print("页面加载失败，请检查是否已登录且页面正常显示")
            input("按 Enter 关闭浏览器...")
            await browser.close()
            return

        # 逐条提交需求
        seq = get_seq_from_filename(REQUIREMENT_FILE)
        for idx, req in enumerate(reqs):
            req_num = idx + 1  # 需求序号（1-based）
            print(f"\n{'='*50}")
            print(f"提交第 {req_num}/{len(reqs)} 条需求: {req.get('title')}")
            print(f"{'='*50}")

            # 查找本条需求的附件: 需求附件/N-M.png → 需求附件/N.png（fallback）
            attach_path = find_attachment(seq, req_num)
            if attach_path:
                print(f"附件: {os.path.basename(attach_path)}")
            else:
                print(f"无附件")

            # 每次提交前先清理弹窗遮罩
            await close_masks(page)

            # 1. 选择需求类型
            await fill_demand_type(page)
            await asyncio.sleep(0.5)

            # 2. 填写需求名称
            await fill_title(page, req.get('title', ''))
            await asyncio.sleep(0.3)

            # 3. 选择模块
            module_name = req.get('module', '')
            await select_module(page, module_name)
            await asyncio.sleep(1)

            # 4. 选择接收人员
            await select_person(page, PERSON_TYPE, RECEIVER_NAME)
            await asyncio.sleep(0.5)

            # 5. 关闭遮罩
            await close_masks(page)

            # 5. 验证接收人
            ok = await verify_receiver(page, RECEIVER_NAME)
            if not ok:
                print(f"接收人验证失败，跳过本条")
                continue

            # 6. 填写需求描述（附件转 base64 内联）
            await fill_content(page, req, attach_path)
            await asyncio.sleep(0.5)

            # 7. 提交
            success = await submit_requirement(page)

            if success:
                print(f"第 {idx+1} 条需求提交完成")
                # 等待页面重置
                await asyncio.sleep(2)
            else:
                print(f"第 {idx+1} 条需求提交可能失败")

        print(f"\n全部 {len(reqs)} 条需求处理完成")
        mark_submitted(REQUIREMENT_FILE)
        await asyncio.sleep(5)
        await browser.close()


if __name__ == '__main__':
    import json
    asyncio.run(main())
