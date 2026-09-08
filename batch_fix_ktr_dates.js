// 批量修改 KTR 文件的日期变量：${sdate}/${edate} → ${start_date}/${end_date}（与监控界面入参一致）
// 用法: node batch_fix_ktr_dates.js <SPT目录>
// 说明: 只处理顶层 *.ktr（跳过子目录如 cs\）；文件为 ASCII(中文已XML转义)，替换安全
const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
if (!dir) {
  console.error('用法: node batch_fix_ktr_dates.js <目录>');
  process.exit(1);
}
if (!fs.existsSync(dir)) {
  console.error('目录不存在: ' + dir);
  process.exit(1);
}

const files = fs.readdirSync(dir).filter((f) => {
  if (!f.toLowerCase().endsWith('.ktr')) return false;
  return fs.statSync(path.join(dir, f)).isFile();
});

let changed = 0;
let totalRepl = 0;
const report = [];

for (const f of files) {
  const full = path.join(dir, f);
  let content = fs.readFileSync(full, 'utf8');
  const before = content;
  let repl = 0;

  // 1) sdate/edate 变量改名（XML 转义形式 &#x24;&#x7b; = ${, &#x7d; = }）
  const c1 = content.split('&#x24;&#x7b;sdate&#x7d;').length - 1;
  const c2 = content.split('&#x24;&#x7b;edate&#x7d;').length - 1;
  content = content.split('&#x24;&#x7b;sdate&#x7d;').join('&#x24;&#x7b;start_date&#x7d;');
  content = content.split('&#x24;&#x7b;edate&#x7d;').join('&#x24;&#x7b;end_date&#x7d;');
  repl += c1 + c2;

  // 1b) 万一有未转义形式（'${sdate}'）
  const c1b = content.split("'${sdate}'").length - 1;
  const c2b = content.split("'${edate}'").length - 1;
  content = content.split("'${sdate}'").join("'${start_date}'");
  content = content.split("'${edate}'").join("'${end_date}'");
  repl += c1b + c2b;

  // 2) 硬编码日期 → 变量（现有 68 号文件是 '2026-04-01','2026-04-15'）
  const c3 = content.split("&#x27;2026-04-01&#x27;").length - 1;
  const c4 = content.split("&#x27;2026-04-15&#x27;").length - 1;
  content = content.split("&#x27;2026-04-01&#x27;").join("&#x27;&#x24;&#x7b;start_date&#x7d;&#x27;");
  content = content.split("&#x27;2026-04-15&#x27;").join("&#x27;&#x24;&#x7b;end_date&#x7d;&#x27;");
  repl += c3 + c4;

  if (content !== before) {
    fs.writeFileSync(full, content, 'utf8');
    changed++;
    totalRepl += repl;
    report.push(f + '  (+' + repl + ' 处)');
  }
}

console.log('目录: ' + dir);
console.log('ktr 文件总数: ' + files.length);
console.log('修改文件数: ' + changed);
console.log('替换总数: ' + totalRepl);
if (report.length) {
  console.log('--- 修改明细 ---');
  report.forEach((r) => console.log('  ' + r));
}
