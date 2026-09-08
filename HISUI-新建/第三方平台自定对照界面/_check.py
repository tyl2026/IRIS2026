import re, os, subprocess
src = open(r'D:\claude code\IRIS\HISUI-新建\第三方平台自定对照界面\_make_assets.py', encoding='utf-8').read()
print('HisDict seeds 行数:', len(re.findall(r'^\s*DB\.HisDict\[', src, re.M)))
print('mock 方法覆盖:', sorted(set(re.findall(r"m === '([A-Za-z]+)'", src))))
print('pickTable/parseEnum/dictItems 都在:', all(fn in src for fn in ['pickTable', 'parseEnum', 'dictItems']))
print('SaveManualRel 残留:', 'SaveManualRel' in src)
print('SaveDictRel 用 dictItems:', 'dictItems(his7' in src)

s = open(r'D:\claude code\IRIS\HISUI-新建\第三方平台自定对照界面\01代码实现\预览.html', encoding='utf-8-sig').read()
blocks = re.findall(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', s, re.S)
print('内联脚本块数:', len(blocks))
os.makedirs(r'D:\claude code\IRIS\HISUI-新建\第三方平台自定对照界面\_tmp', exist_ok=True)
NODE = r'C:\Users\Admin\.workbuddy\binaries\node\versions\22.22.2-2\node.exe'
ok = 0
for i, b in enumerate(blocks):
    p = rf'D:\claude code\IRIS\HISUI-新建\第三方平台自定对照界面\_tmp\b{i}.js'
    open(p, 'w', encoding='utf-8').write(b)
    r = subprocess.run([NODE, '--check', p], capture_output=True, text=True)
    if r.returncode == 0:
        ok += 1
        print(f'b{i}.js OK ({len(b)} bytes)')
    else:
        print(f'b{i}.js FAIL', r.stdout, r.stderr)
print(f'{ok}/{len(blocks)} 块通过')
