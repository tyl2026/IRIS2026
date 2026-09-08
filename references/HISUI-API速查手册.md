# HISUI API 速查手册

> 来源：http://hisui.cn/api/（基础平台 hisui 0.1.0）官方文档全量抓取整理
> 整理时间：2026-09-07
> 说明：所有 API 名称、参数、默认值均取自官方文档原文。文档未给出的项标注为 `—` 或"文档未列"，未作臆造。标注"继承"的部分参考 EasyUI 同名组件。

---

## 目录

- [零、快速上手与通用约定](#零快速上手与通用约定)
- [一、基础](#一基础) — 数据访问 `$cm`/`$m`、导出 Excel、JSON、公共方法 `$.hisui.*`、图标 icon、插画 pic、提示 tooltip、泡芙提示 popover
- [二、布局](#二布局) — panel、tabs、accordion、layout、hstep、vstep
- [三、表单（上）](#三表单上) — label、linkbutton、menubutton、splitbutton、validatebox、searchbox、numberbox、triggerbox、datebox、timespinner
- [四、表单（下）](#四表单下) — combo、combobox、switchbox、checkbox、radio、filebox、keywords
- [五、数据表格 datagrid](#五数据表格-datagrid) — 主文档 + 滚动加载 / 行编辑 / 单元格编辑
- [六、树 · 窗口 · 极速系列](#六树--窗口--极速系列) — treegrid、tree、menutree、combogrid、combotree、window、dialog、messager、lookup、dateboxq、timeboxq、datetimeboxq

---

## 零、快速上手与通用约定

### 0.1 HISUI 是什么

HISUI 是大连东软/东华（DHCC）系医疗 HIS 系统使用的一套**基于 jQuery + EasyUI 深度定制**的前端 UI 框架。它在 EasyUI 基础上增加了医疗业务场景常用组件（放大镜 `lookup`、触发框 `triggerbox`、关键字 `keywords`、极速版日期时间框 `*q` 系列等），并统一了主题皮肤与中文语言包。

### 0.2 资源引入

```html
<!-- 1. head标签中引用HISUI -->
<HISUI></HISUI>

<!-- 2. 数据访问（可选，用 $cm/$m 时才需要） -->
<script type="text/javascript" src="../scripts/websys.jquery.js"></script>
```

可选主题 CSS：`hisui.css`（标准蓝）、`hisui.nfyy.css`（南方绿）、`hisui.min.css`（默认）。

### 0.3 三种创建组件的方式

```html
<!-- 方式一：class + data-options（推荐，页面加载后自动解析） -->
<input id="cc" class="hisui-combobox"
       data-options="url:'getDept',valueField:'id',textField:'name'">
```

```js
// 方式二：$HUI 命名空间（HISUI 推荐写法）
$HUI.combobox('#cc', { url:'getDept', valueField:'id', textField:'name' });

// 方式三：jQuery 插件式（兼容 EasyUI 习惯）
$('#cc').combobox({ url:'getDept', valueField:'id', textField:'name' });
```

### 0.4 调用方法的通用范式

```js
$('#dg').datagrid('reload');                     // 无参方法
$('#dg').datagrid('load', { name:'张' });         // 带参方法
$('#dg').datagrid('options');                     // 取配置对象
var row = $('#dg').datagrid('getSelected');       // 取值
```

记忆点：**`$(选择器).组件名('方法名', 参数)`** —— 与 EasyUI 完全一致。

### 0.5 常用全局对象速记

| 对象 | 用途 | 示例 |
|---|---|---|
| `$HUI` | 组件创建命名空间 | `$HUI.dialog('#dlg', {title:'新增'})` |
| `$.hisui.*` | 公共工具方法（数组/字符串/日期等） | `$.hisui.indexOfArray(arr,'id',2)` |
| `$.messager.*` | 消息框（alert/confirm/prompt/progress/toast） | `$.messager.alert('提示','保存成功')` |
| `$cm(data, success, error)` | 调用后台类方法或 Query（含敏感词过滤） | 见第一章 |
| `$m(...)` | 简化版后台调用 | 见第一章 |
| `$.parser` | 解析器，`$.parser.onComplete` 在解析完成后回调 | `$.parser.onComplete = function(ctx){}` |
| `HISUIStyleCode` | 全局主题代码 | `var HISUIStyleCode='blue'` |

### 0.6 后台数据交互约定

HISUI 的 `$cm` 请求默认返回：

```json
{ "rows": [ {}, {} ], "total": 3 }
```

配置 `ResultSetType:'array'` 时返回 `[{},{}]`；配置 `totalFields:'amt,cost'` 时额外返回 `footer` 合计行。组件（datagrid/combobox 等）的 `url` 属性直接指向后台 Query 或类名即可，由框架封装了 `$cm`。

### 0.7 版本与兼容性提醒

- `jquery-tag-demo.js` 仅为官网 demo 辅助脚本，生产环境不需要。
- 部分属性带日期标注（如 `2023-08-01`、`20200224`），表示该属性从该版本/日期起提供，低版本可能不支持。
- IE9+ 支持 `placeholder` 类属性；老版本 IE 需注意降级。

---

---

# 一、基础
### 数据访问（$cm / $m）

**用途**：通过 ajax 调用后台类方法或 Query；内置敏感关键词过滤（insert、select、delete、update、script、onclick、eval 等），当请求值包含这些关键词且前后有特殊字符时会被置换为空。
**引入方式**：先引入 jQuery，再引入 `websys.jquery.js`。

```html
<script type="text/javascript" src="../scripts_lib/jquery-easyui-1.3.2/jquery-1.8.0.min.js" charset="utf-8"></script>
<script type="text/javascript" src="../scripts/websys.jquery.js"></script>
```

#### 函数清单
| 函数名 | 签名 | 说明 |
|---|---|---|
| $cm | `$cm(data[,success][,error])` | 调用后台方法/Query，成功回调参数为 JSON 对象（默认） |
| $m | `$m(data[,success][,error])` | 与 `$cm` 相同，但后台返回值非 JSON 文本数据时请用 `$m`，成功回调参数为文本数据 |

#### 参数（data 对象属性）
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| ClassName | { String } | 必需项 | 类名，即包名.类名 |
| MethodName | { String } | 可选 | 后台类方法名或成员方法名 |
| QueryName | { String } | 可选 | 后台 Query 名；若配置了 MethodName 则 QueryName 无效 |
| wantreturnval | { Number } | 可选，默认 1 | 后台方法是否有返回值，1 表示有，0 表示无；决定后台以 do 还是 set 方式运行 |
| ResultSetType | { String } | 可选 | 配置后运行 Query 返回的数据格式：`array` → `[{},{},{}]`；不配置 → `{"rows":[...],"total":3}`；`Excel` → 返回下载 csv 链接；`ExcelPlugin` → 导出 Excel 到本地 |
| totalFields | { String } | 可选 | 对指定列数值合计，如 `'amt,cost'`，返回 `{"rows":[...],"footer":[{"amt":110,"cost":120}],"total":3}` |
| totalFooter | { String } | 可选 | 数值合计后拼接到数据 json 前，如 `'"colName":"押金合计"'`，返回 `{"rows":[...],"footer":[{"colName":"押金合计","amt":1100}],"total":3}` |
| dataType | { String } | 默认 "json" | 返回的数据类型，见 `$.ajax` 的 dataType |
| type | { String } | 默认 "POST" | 请求类型，见 `$.ajax` 的 type；界面卸载事件内请求应使用 `type:"BEACON"`（chrome49 后无返回值） |
| 其它 | { 任意 } | 可选 | 对应后台方法或 Query 的入参名，可以为数组 |
| success | { Function \| Boolean } | 可选项 | Function 类型：ajax 成功回调 `function(json){}`；Boolean 且值为 `false` 时表示发送同步请求 |
| error | { Function } | 可选项 | ajax 错误回调 `function(rtn){}` |

#### 示例
```js
// 1. 异步调用后台类方法（推荐）
$cm({
  ClassName: "dhc.Test",
  MethodName: "getPatInfo",
  UserName: "张三"
}, function (jsonData) {
  console.dir(jsonData); // {"name":"张三"}
});

// 返回值非 JSON 文本时
$m({
  ClassName: "dhc.Test",
  MethodName: "getPatInfo",
  UserName: "张三"
}, function (txtData) {
  console.dir(txtData); // '{"name":"张三"}'
});

// 2. 同步调用（不建议）
var jsonData = $cm({
  ClassName: "dhc.Test",
  MethodName: "getPatInfo",
  UserName: "张三"
}, false);

// 3. 调用后台 Query（支持 %String/%Integer/%Float/%Boolean）
$cm({
  ClassName: "web.SSUser",
  QueryName: "LookUpActive",
  page: 1,   // 可选，页码，默认 1
  rows: 20   // 可选，每页条数，默认 50
}, function (rs) {
  console.dir(rs); // {"rows":[{"Description":"王二","HIDDEN":"1","Active":true},...],"total":110}
});

// 4. 数组入参
$cm({
  ClassName: "dhc.Test",
  MethodName: "saveFavFruitList",
  plist: ["orange", "apple", "pear", "banana"]
});
```

---

### Excel 导出

**用途**：将后台 Query 查询结果导出为 CSV 或标准 Excel 文件。
**引入方式**：依赖 `jquery.js`、`websys.jquery.js`（IE 需 ActiveX；非 IE 界面需写入 `<ADDINS require="CmdShell"></ADDINS>`）。

#### 函数清单
| 函数名 | 签名 | 说明 |
|---|---|---|
| tkMakeServerCall | `tkMakeServerCall("websys.Query","ToExcel","excelname","web.Util.Menu","SelectGroupMenu",1)` | 后台导出 CSV，返回下载链接，无需前台插件 |
| $cm（ExcelPlugin） | `$cm({ResultSetType:"ExcelPlugin", ExcelName, PageName, ClassName, QueryName, 参数...}[,success][,error])` | 通过 DLL 生成标准 Excel（支持 IE 与 Chrome 系，Chrome 需装中间件） |

#### 参数（websys.Query 类 ToExcel 方法 / ResultSetType 配置）
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| ResultSetType | { String } | 必填项 | `Excel` 表示导出 csv；`ExcelPlugin` 表示导出标准 Excel |
| ExcelName | { String } | 必填项（默认 DHCCExcel） | 导出文件名，不用带后缀 |
| PageName | { String } | 选填项 | ResultSetType 为 ExcelPlugin 且要读配置打印内容时必填 |
| ClassName | { String } | 必填项 | 后台类名 |
| QueryName | { String } | 必填项 | 后台 Query 名 |
| p1 … p16 | { String \| Int } | 可选项 | Query 第 1 ~ 第 16 个入参 |

#### ExcelPlugin 额外支持参数
- `showLineCfg:"Y"`：显示 Excel 线条
- `ResultSetTypeDo:"Print"`：默认 Export，可设为 `PRINT` / `PREVIEW`
- `localDir:"D:\\tmp\\"`：`Self` 表示用户选择保存路径，默认保存到桌面
- `HiddenColumnHeader:1`：隐藏列头（Excel 方式下）
- `PageName`：与配置界面 `PAGENAME` 对应

#### 示例
```js
// 方式一：导出 CSV（同步）
var rtn = $cm({
  dataType: 'text',
  ResultSetType: "Excel",
  ExcelName: "excelname", // 默认 DHCCExcel
  ClassName: "web.Util.Menu",
  QueryName: "SelectGroupMenu",
  GroupId: 1
}, false);
location.href = rtn;

// 方式二：导出标准 Excel（异步）
showProgressBar("导出中....");
$cm({
  ResultSetType: "ExcelPlugin",
  ExcelName: "excelname",
  PageName: "DHCSSUserLog",
  ClassName: "web.DHCSSUserLogonLog",
  QueryName: "FindUserLog",
  Stdate: Stdate, Enddate: Enddate, Guser: Guser,
  StartTime: StartTime, EndTime: EndTime
}, function () {
  hideProgressBar();
});

// 打开列配置界面
window.open("websys.query.customisecolumn.csp?CONTEXT=K类名:Query名&PAGENAME=界面标识代码&PREFID=0");
```

---

### JSON 转换

**用途**：JSON 序列化与反序列化，兼容所有 IE 版本（源自 json2.js）。
**引入方式**：引入 `json2.js`。

#### 函数清单
| 函数名 | 签名 | 说明 |
|---|---|---|
| JSON.stringify | `JSON.stringify(obj)` | 序列化：JSON 对象转字符串 |
| JSON.parse | `JSON.parse(str)` | 反序列化：字符串转 JSON 对象（key 与字符值须用双引号，否则可能解析失败） |

#### 示例
```js
var jsonObj = { id: '01', name: 'wang' };
JSON.stringify(jsonObj);

var jsonStr = '{"id":"01","name":"wang"}'; // 标准 JSON 字符串
JSON.parse(jsonStr);

var str = "{id:'01',name:'wang'}"; // 不符合规范的字符串，尽量避免
JSON.parse(str);
```

---

### 公共方法（commfun / $.hisui.*）

**用途**：hisui 内部常用工具函数集合，主要处理数组、拼音、日期格式。
**引入方式**：引入 hisui 核心包后通过 `$.hisui.*` 与 `$.fn.*` 调用。

#### 函数清单
| 函数名 | 签名 | 说明 |
|---|---|---|
| $.hisui.indexOfArray | `$.hisui.indexOfArray(a, o, id)` | 获取元素在数组中的位置，不存在返回 -1 |
| $.hisui.removeArrayItem | `$.hisui.removeArrayItem(a, o, id)` | 移除数组中的某元素 |
| $.hisui.addArrayItem | `$.hisui.addArrayItem(a, o, r)` | 为数组增加元素，若存在则替换 |
| $.hisui.getArrayItem | `$.hisui.getArrayItem(a, o, id)` | 获取数组中某字段为某值的元素，不存在返回 null |
| $.hisui.getChineseSpellArray | `$.hisui.getChineseSpellArray(str)` | 获取字符串拼音首字母，返回简拼数组（2018-08-27） |
| $.hisui.toChineseSpell | `$.hisui.toChineseSpell(str)` | 获取字符串拼音首字母，返回简拼，多音字只返回一个（2018-08-27） |
| $.fn.datebox.defaults.formatter | `$.fn.datebox.defaults.formatter(date)` | 默认日期格式化方法，重写可控制日期格式 |
| $.fn.datebox.defaults.parser | `$.fn.datebox.defaults.parser(s)` | 默认日期解析方法，将日期字符串解析为 Date 对象 |

#### 参数明细

**indexOfArray(a, o, id)**
| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| a | 数组 | — | 目标数组 |
| o | 目标元素或字段名 | — | 元素对象或字段名 |
| id | 目标字段值 | undefined | 不传 id 时取元素 o 的索引；传 id 时取元素 o 字段值为 id 的索引 |

**removeArrayItem(a, o, id)**
| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| a | 数组 | — | 目标数组 |
| o | 目标元素或字段名 | — | 元素对象则移除该对象；字段名则移除该字段值等于 id 的元素 |
| id | 目标字段值 | undefined | o 为 string 时才生效 |

**addArrayItem(a, o, r)**
| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| a | 数组 | — | 目标数组 |
| o | 元素或字段名 | — | 不传 r 时为要增加的元素；传 r 时为字段名 |
| r | 元素 | — | 传 r 时 o 为字段名，判断数组中是否有字段与 r[o] 相等的元素，无则增加、有则替换 |

**getArrayItem(a, o, id)**
| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| a | 数组 | — | 目标数组 |
| o | 字段名 | — | 字段名 |
| id | 目标字段值 | — | 目标字段值 |

#### 示例
```js
var item = { id: '2', name: '李四' };
var arr = [{ id: '1', name: '张三' }, item, { id: '3', name: '王二' }];

// indexOfArray
$.hisui.indexOfArray(arr, { id: '2', name: '李四' }); // -1 引用不一致
$.hisui.indexOfArray(arr, item);                       // 1  同一引用
$.hisui.indexOfArray(arr, 'id', 2);                   // 1  按字段
$.hisui.indexOfArray(arr, 'id', 3);                   // 2

// removeArrayItem
$.hisui.removeArrayItem(arr, { id: '2', name: '李四' }); // 删不掉（引用不一致）
$.hisui.removeArrayItem(arr, item);                     // 可删
$.hisui.removeArrayItem(arr, 'id', 2);                  // 按字段删

// addArrayItem
$.hisui.addArrayItem(arr, { id: '2', name: '李四' });            // 引用不一致，新增
$.hisui.addArrayItem(arr, 'id', { id: '2', name: '李四（新）' }); // 存在，替换
$.hisui.addArrayItem(arr, 'id', { id: '4', name: '麻子' });       // 不存在，增加

// getArrayItem
$.hisui.getArrayItem(arr, 'id', 2); // {id:'2',name:'李四'}
$.hisui.getArrayItem(arr, 'id', 3); // {id:'3',name:'王二'}

// 拼音
$.hisui.getChineseSpellArray('你好');        // ["n","h"]
$.hisui.getChineseSpellArray('你好,hello');  // 只处理中文
$.hisui.toChineseSpell('你好');              // "nh"

// 日期格式化 / 解析
$.fn.datebox.defaults.formatter(new Date());
var datestr = $.fn.datebox.defaults.formatter(new Date());
$.fn.datebox.defaults.parser(datestr);
```

---

### 提示（Tooltip）

**用途**：鼠标悬停或点击元素时显示提示层。
**引入方式**：`<a class="hisui-tooltip" data-options="...">` 或 `$HUI.tooltip(...)` / `$("#id").tooltip(...)`。

#### 属性
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| position | { String } | bottom | 提示层位置，可选 `'top'` / `'right'` / `'bottom'` / `'left'` |
| tipWidth | { Number } | undefined | 提示层宽度，默认 undefined（宽度自适应） |

#### 示例
```html
<a id="tt1" href="#" title="这是提示信息" class="hisui-tooltip" data-options="position:'right'">鼠标移动到这(点击试试)</a>
<button id="btn">点我提示</button>
```
```js
$(function () {
  $("#btn").click(function () {
    $HUI.tooltip("#tt1", { position: 'bottom' }).show();
    // 等价写法：$("#tt1").tooltip({ position: 'bottom' }).tooltip('show');
  });
});
```

---

### 提示框（Popover）

**用途**：在某元素上显示一个带标题与内容的提示说明界面（源自 jquery webui-popover 插件）。
**引入方式**：`$("#id").popover({...})` 或 `$HUI.popover('#id', {...})`。

#### 属性
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| placement | { String } | 'auto' | 弹出方位：`auto`/`top`/`right`/`bottom`/`left`/`top-right`/`top-left`/`bottom-right`/`bottom-left`/`auto-top`/`auto-right`/`auto-bottom`/`auto-left`/`horizontal`/`vertical` |
| width | { Number\|String } | 'auto' | 提示层宽度 |
| height | { Number\|String } | 'auto' | 提示层高度 |
| trigger | { String } | 'click' | 触发动作：`click`/`hover`/`manual`(手动)/`sticky`(创建完显示) |
| animated | { String } | null | 动画效果 `'pop'` / `'fade'` |
| style | { String } | '' | 样式 `''` / `'inverse'` |
| delay | { Object\|String } | 'success' | 显示/隐藏延迟，如 `{show: null, hide: 500}` |
| cache | { Boolean } | true | 为 false 则提示层销毁或重建 |
| multi | { Boolean } | false | 为 true 则允许同时显示多个提示层 |
| arrow | { Boolean } | true | 是否显示箭头 |
| title | { String } | '' | 提示层标题 |
| content | { String } | '' | 提示层内容 |
| closeable | { Boolean } | false | 是否显示关闭按钮 |
| direction | { String } | '' | 文字方向 `ltr`/`rtl`，默认 ltr |
| padding | { Boolean } | true | 是否增加内容 padding |
| type | { String } | 'html' | 内容类型 `'html'`/`'iframe'`/`'async'` |
| url | { String } | '' | type 为 `html` 时可配置 jQuery 选择器；type 为 `async` 时通过 url 加载内容 |
| backdrop | { Boolean } | false | 为 true 时弹出层模态化打开 |
| dismissible | { Boolean } | true | 为 true 时按 esc 或点击非提示层位置关闭 |
| autoHide | { Boolean\|Number } | false | false 或数字（1000=1s） |
| offsetTop | { Number } | 0 | 与顶边偏移量 |
| offsetLeft | { Number } | 0 | 与左边偏移量 |

#### 事件
| 事件名 | 参数 | 说明 |
|---|---|---|
| onShow | e, value | 显示时触发 |
| onHide | e, value | 隐藏时触发 |

#### 方法
| 方法名 | 参数 | 返回值 | 说明 |
|---|---|---|---|
| options | — | jquery 对象 | 拿到配置项对象 |
| show | — | jquery 对象 | 显示弹出层 |
| hide | — | — | 隐藏弹出层 |
| destroy | — | — | 销毁弹出层 |
| setContent | value | jquery 对象 | 修改弹出层内容 |

#### 示例
```html
<a id="pp" href="#">点击关于显示HISUI说明</a>
<button id="showPP">弹出</button>
<button id="hidePP">隐藏</button>
```
```js
// 自动触发
$(function () {
  $("#pp").popover({ title: 'HUI关于', content: '统一常用前端组件库，统一开发界面风格' });
});

// 手动触发
$(function () {
  $("#manualpp").popover({
    trigger: 'manual', placement: 'top', title: 'HUI关于',
    content: 'HISUI是一款前端组件类库',
    delay: { show: null, hide: 500 }
  });
  $("#showPP").click(function () { $("#manualpp").popover('show'); });
  $("#hidePP").click(function () { $("#manualpp").popover('hide'); });
});
```

---

### 图标（Icon）

**用途**：各种小图标，可用于按钮（linkbutton）、菜单（menu）、工具栏（toolbar）。
**引入方式**：在组件上设置 `iconCls="icon-xxx"`。

#### 使用方式
```html
<!-- 按钮 -->
<a href="#" class="hisui-linkbutton" iconCls="icon-w-clear">清屏</a>

<!-- 菜单 -->
<a href="#" class="hisui-menubutton" menu='#mm' iconCls="icon-add-note">操作</a>
<div id="mm">
  <div data-options="iconCls:'icon-undo'">撤销</div>
  <div data-options="iconCls:'icon-redo'">恢复</div>
</div>

<!-- 工具栏 -->
toolbar: [{
  iconCls: 'icon-edit', text: '停止医嘱', handler: function () { alert('停止医嘱') }
}, {
  iconCls: 'icon-save', text: '撤销医嘱'
}, {
  iconCls: 'icon-remove', text: '作废医嘱'
}, '-', {
  iconCls: 'icon-tip'
}]
```

#### 命名规则
- 普通图标：`icon-<name>`
- 白名单图标（白色系，常用于按钮）：`icon-w-<name>`
- 大图标：`icon-big-<name>`
- 医嘱/纸张类图标：名称本身含 `paper`/`write-order` 等，仍用 `icon-<name>`（如 `icon-paper`、`icon-write-order`、`icon-stop-order`）

#### 常用图标（按类别代表性列举，非全量）
| 类别 | 代表图标类名 |
|---|---|
| 通用操作 | icon-add、icon-remove、icon-edit、icon-save、icon-ok、icon-cancel、icon-search、icon-print、icon-config、icon-import、icon-export、icon-copy、icon-find |
| 白名单（按钮常用白色系） | icon-w-add、icon-w-close、icon-w-find、icon-w-edit、icon-w-update、icon-w-save、icon-w-clear、icon-w-print、icon-w-star |
| 患者/医护 | icon-patient、icon-doctor、icon-nurse、icon-person、icon-user、icon-pat-house、icon-patient-info、icon-doc-caseload |
| 方向/箭头 | icon-arrow-left、icon-arrow-right、icon-arrow-up、icon-arrow-down、icon-back、icon-undo、icon-redo、icon-up、icon-down |
| 字体/排版 | icon-bold、icon-font、icon-underline、icon-align-left、icon-align-center、icon-align-right、icon-indentation、icon-unindent |
| 病历/医嘱 | icon-paper、icon-write-order、icon-cancel-order、icon-stop-order、icon-paper-pen、icon-paper-eye、icon-paper-ok、icon-paper-stamp |
| 医疗/药品 | icon-drug、icon-bottle-drug、icon-stethoscope、icon-injector、icon-ster-ok、icon-virus |
| 费用 | icon-fee、icon-paid、icon-money-down、icon-accept-money、icon-return-paid |
| 消息 | icon-msg、icon-msg-unread、icon-msg-read、icon-bell-blue、icon-have-message、icon-send-msg |
| 大图标 | icon-big-doctor-green、icon-big-print、icon-big-save、icon-big-home、icon-big-stamp、icon-big-refresh、icon-big-stop |

> 完整图标数千个，命名规律为上述前缀 + 英文/语义词组合，查阅时按类别在 `icon-` 前缀下检索即可。

---

### 插画（Pic）

**用途**：统一公共插画样式，用于患者头像、院方人员、就诊类型、登录方式、关于、系统状态等场景。
**引入方式**：类名以 `.pic-` 开头，直接作为元素 class（如 `<i class="pic-pat-man"></i>`）。

#### 命名规则与清单
| 类别 | 类名前缀 | 代表类名 |
|---|---|---|
| 患者头像 | `pic-pat-` | pic-pat-man、pic-pat-woman、pic-pat-unknown-gender |
| 院方人员 | `pic-usr-` | pic-usr-doctor、pic-usr-nurse、pic-usr-surgeon、pic-usr-clothing-worker、pic-usr-medi-worker、pic-usr-dep-director、pic-usr-hosp-director、pic-usr-doctor-woman |
| 就诊类型 | `pic-adm-` | pic-adm-out、pic-adm-em、pic-adm-in |
| 登录方式 | `pic-logon-` | pic-logon-cert、pic-logon-default、pic-logon-face、pic-logon-phone、pic-logon-pin、pic-logon-sound、pic-logon-ukey |
| 关于插画 | `pic-about-` | pic-about-dhcc-digitalmed、pic-about-imedical-logo |
| 系统状态 | `pic-sysst-` | pic-sysst-e403、pic-sysst-e404、pic-sysst-e500、pic-sysst-nodata、pic-sysst-nodata-msg、pic-sysst-nodata-region、pic-sysst-timeout-relogon、pic-sysst-welcome |

#### 示例
```html
<i class="pic-pat-man"></i>
<i class="pic-usr-doctor"></i>
<i class="pic-adm-in"></i>
<i class="pic-logon-face"></i>
<i class="pic-sysst-nodata"></i>
```

---

# 二、布局
> 以下 API 名称、参数、默认值均取自官方文档，文档未明确列出的项不臆造，“—”表示文档未给出默认值。

### 面板（panel）

**用途**：容器组件，可作为其他组件或元素的容器。支持卡片式、灰色系、白色等多种配色。
**引入方式**：`<div class="hisui-panel" title="..." data-options="..."></div>` 或 `$HUI.panel("#id",{...})`

#### 属性
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| headerCls | string | null（即蓝色） | 面板头样式类。可选值：'panel-header-gray'、'panel-header-blue'、'panel-header-acc'、'panel-header-white'、'panel-header-card'、'panel-header-card-gray'、'panel-header-big' |
| bodyCls | string | null | 面板内容样式类。可选值：'panel-body-gray' |
| notTrans | boolean | false | 是否不自动翻译。true 表示不翻译（2018-09-17 后增加 bodyCls；notTrans 于 20230801 增加） |
| title | string | — | 面板标题（示例中用） |
| iconCls | string | — | 标题图标样式类，如 'icon-save'、'icon-paper' |
| closable | boolean | — | 是否显示关闭按钮 |
| collapsible | boolean | — | 是否可收起 |
| minimizable | boolean | — | 是否可最小化 |
| maximizable | boolean | — | 是否可最大化 |

#### 事件
| 事件名 | 参数 | 说明 |
|---|---|---|
| onBeforeClose | — | 点击关闭前触发，返回 false 可阻止关闭 |
| onBeforeCollapse | — | 点击收起前触发，返回 false 可阻止收起 |
| onMinimize | — | 点击最小化时触发 |
| onMaximize | — | 点击最大化时触发 |

#### 方法
文档未单列方法表。通过 `$HUI.panel("#id",{...})` 初始化，或 jQuery 方式 `$('#id').panel('method',arg)` 调用。

#### 示例
```html
<!-- 灰色卡片式面板 -->
<div class="hisui-panel" title="病人信息" style="width:400px;padding:20px"
     data-options="headerCls:'panel-header-gray',iconCls:'icon-paper',
                    closable:true,collapsible:true,minimizable:true,maximizable:true"></div>

<!-- 无标题的灰色面板（增加于 2018-09-17） -->
<div class="hisui-panel panel-header-gray" title="" data-options="..."></div>
```
```javascript
var valbox = $HUI.panel("#accPanel", {
    iconCls: 'icon-paper',
    closable: true,
    onBeforeClose: function () { alert("你点击了关闭!"); return false; },
    collapsible: true,
    onBeforeCollapse: function () { alert("你点击了收起!"); return false; },
    minimizable: true,
    onMinimize: function () { alert("你点击了最小化!"); return false; },
    maximizable: true,
    onMaximize: function () { alert("你点击了最大化!"); return false; },
    headerCls: 'panel-header-gray'
});
```

### 页签（tabs）

**用途**：一次仅显示一个面板（panel），每个面板带标题、图标和关闭按钮；选中时显示对应面板内容。
**引入方式**：`<div class="hisui-tabs" ...></div>` 或 `$HUI.tabs("#id",{...})`

#### 属性
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| simpleContextMenu | boolean | false | 是否显示简单右键菜单（刷新、关闭、关闭其他等）。为 tabs 新增属性 |
| tabPosition | string | — | 页签位置，可选 'top'、'bottom'、'left'、'right' |
| headerWidth | number | — | 当 tabPosition 为 left/right 时，标题区宽度（如 100） |
| border | boolean | — | 是否显示边框，示例用 border:false 去边框 |
| fit | boolean | — | 是否自适应父容器 |
| tabHeight | string | — | 上下页签可定义高度，如 "26px"、"36px"（以属性形式写在标签上） |
| isBrandTabs | boolean | — | true 时第一个页签作为标题（图表组样式） |
| closable | boolean | — | 单个页签面板是否可关闭（写在子 div 的 data-options 上） |
| iconCls | string | — | 单个页签图标样式类 |

> 灰色页签：给容器加 class `hisui-tabs tabs-gray`；底部页签：`tabs-gray-btm`；关键字页签：`tabs-keywords`。

#### 事件
| 事件名 | 参数 | 说明 |
|---|---|---|
| onSelect | title | 切换到某页签时触发，参数 title 为页签标题 |

#### 方法
| 方法名 | 参数 | 说明 |
|---|---|---|
| tabs | {tabPosition: value} | 动态设置页签位置，如 `$('#tt3').tabs({tabPosition:'right'})` |
| tabs | 'disableTab', index | 禁用指定索引页签，如 `$('#tt2').tabs('disableTab', 0)` |

#### 示例
```html
<div id="tt2" class="hisui-tabs tabs-gray" style="width:500px;height:250px;">
  <div title="电子病历" style="padding:20px;">tab1</div>
  <div title="诊断录入" data-options="closable:true" style="padding:20px;display:none;">tab2</div>
  <div title="医嘱录入" data-options="closable:true" style="padding:20px;display:none;">tab3</div>
</div>
```
```javascript
$(function(){
  $HUI.tabs("#tt2",{
    onSelect:function(title){
      $.messager.popover({type:'info',msg:'切换到【'+title+'】'});
    }
  });
  // $('#tt2').tabs('disableTab', 0);
});
```

### 手风琴（accordion）

**用途**：折叠面板，包含一系列 panel；头部均可见，但一次仅展开一个面板 body，点击头部切换显示。
**引入方式**：`<div class="hisui-accordion" ...></div>` 或 `$HUI.accordion("#id")`

#### 属性
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| border | boolean | — | 是否显示边框，示例用 border:false |
| selected | boolean | — | 写在子面板 data-options 上，true 表示默认选中该面板 |

> 配色 class：`hisui-accordion`（蓝）、`accordion-gray`（灰）、`accordion-green`（绿）。

#### 事件
文档未单列事件表。

#### 方法
| 方法名 | 参数 | 说明 |
|---|---|---|
| add | {title, iconCls, content, selected, style} | 新增一个面板。示例：`accObj.add({title:'新标题',iconCls:'icon-w-add',content:'...',selected:true})` |
| getSelected | — | 返回当前选中的面板对象 |
| getPanelIndex | panel | 根据面板对象返回其索引 |
| remove | index | 删除指定索引的面板 |

#### 示例
```html
<div id="acc" class="hisui-accordion accordion-green" style="width:200px;height:450px;" data-options="border:false">
  <div title="等待区" data-options="iconCls:'icon-w-update'" style="overflow:auto;padding:10px;"></div>
  <div title="住院区" data-options="iconCls:'icon-w-import',selected:true" style="padding:10px;"></div>
  <div title="出院区" data-options="iconCls:'icon-w-export'"></div>
</div>
```
```javascript
var accObj = $HUI.accordion("#acc");
// 新增面板
accObj.add({title:'新标题',iconCls:'icon-w-add',content:'你点击按钮了，我就有了。',selected:true});
// 删除当前选中
var p = accObj.getSelected();
if (p) { accObj.remove(accObj.getPanelIndex(p)); }
```

### 布局（layout）

**用途**：五方布局容器，提供五个区域：north、south、east、west、center。
**引入方式**：`<div class="hisui-layout" ...></div>`（区域用 `data-options="region:'north'"` 等声明；文档示例以 data-options 调用）

#### 区域（region）用法
| 区域 | 典型用途 |
|---|---|
| north | 顶部，显示网站标语/标题栏 |
| south | 底部，显示版权及说明 |
| west | 左侧，显示导航菜单 |
| east | 右侧，显示推广项目 |
| center | 中间，显示主要内容（必填，且只能有一个） |

> 每个区域本身是一个面板，可写 `data-options="region:'north',split:true,..."`。

#### 属性
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| clickExpand | boolean | false | 点击展开与否。为 true 时，展开区域不再悬浮 |
| showCollapsedTitle | boolean | false | 区域面板处于折叠状态时是否显示 title（区域面板配置） |
| collapsed | boolean | — | 区域默认自动收起，如 `data-options="collapsed:true"` |

#### 事件
文档未单列事件表。

#### 方法
文档未单列方法表。

#### 示例
```html
<div class="hisui-layout" style="width:600px;height:400px;">
  <div data-options="region:'north',title:'标题',split:true" style="height:60px;">顶部</div>
  <div data-options="region:'south',title:'底部',split:true" style="height:40px;">底部</div>
  <div data-options="region:'west',title:'菜单',split:true" style="width:150px;">菜单</div>
  <div data-options="region:'east',title:'推广',split:true,collapsed:true" style="width:120px;">推广</div>
  <div data-options="region:'center',title:'主要的内容'">主要的内容</div>
</div>
```
```html
<!-- 折叠状态显示标题 -->
<div data-options="region:'west',showCollapsedTitle:true,collapsed:true">导航</div>
```

### 横向节点图（hstep）

**用途**：横向步骤/流程/闭环图组件。
**引入方式**：`<div id="hstp"></div>` + `$("#hstp").hstep({...})`

#### 属性
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| currentInd | number | 1 | 当前所在节点 |
| stepWidth | number | 100 | 单步宽度 |
| items | Object | — | 具体节点配置数组，每项 `{title:'title', context:"html/text"}` |
| showNumber | boolean | — | 是否显示序号（示例中注释 `//showNumber:false`） |
| titlePostion | string | — | 标题位置（示例中注释 `//titlePostion:'top'`） |

#### 事件
| 事件名 | 参数 | 说明 |
|---|---|---|
| onSelect | ind, item | 当前选中对象时触发，ind 为索引，item 为节点对象 |

#### 方法
| 方法名 | 参数 | 说明 |
|---|---|---|
| setStep | ind | 设置当前流程处于哪个节点 |
| getStep | — | 获得当前流程处于哪个节点 |
| getStepInd | — | 获得当前流程处于的索引位置 |
| prevStep | — | 跳到上一节点 |
| nextStep | — | 跳到下一节点 |

#### 示例
```html
<div id="hstp"></div>
<button id="prevbtn">上一步</button>
<button id="nextbtn">下一步</button>
```
```javascript
$(function(){
  $('#prevbtn').click(function(){ $('#hstp').hstep('prevStep'); });
  $('#nextbtn').click(function(){ $('#hstp').hstep('nextStep'); });
  $("#hstp").hstep({
    stepWidth:200,
    currentInd:3,
    onSelect:function(ind,item){ console.log(item); },
    items:[{title:'挂号',context:"王二\n2020-07-03 09:10"},
           {title:'就诊',context:"张三\n2020-07-03 10:10"},
           {title:'收费',context:"李四\n2020-07-03 11:10"},
           {title:'取药'},
           {title:'完成'}]
  });
});
```

### 纵向节点图（vstep）

**用途**：纵向步骤/流程/闭环图组件，可自定义节点后描述内容及格式（2021-02-26 增加）。
**引入方式**：`<div id="vstp"></div>` + `$("#vstp").vstep({...})`

#### 属性
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| currentInd | number | 1 | 当前所在节点 |
| stepHeight | number | 100 | 单步高度 |
| items | Object | — | 具体节点配置数组，每项 `{title:'title', context:"html/text"}` |
| showNumber | boolean | — | 是否显示序号（示例中注释 `//showNumber:false`） |
| titlePostion | string | — | 标题位置（示例中注释 `//titlePostion:'top'`） |

#### 事件
| 事件名 | 参数 | 说明 |
|---|---|---|
| onSelect | ind, item | 当前选中对象时触发，ind 为索引，item 为节点对象 |

#### 方法
| 方法名 | 参数 | 说明 |
|---|---|---|
| setStep | ind | 设置当前流程处于哪个节点 |
| getStep | — | 获得当前流程处于哪个节点 |
| getStepInd | — | 获得当前流程处于的索引位置 |
| prevStep | — | 跳到上一节点 |
| nextStep | — | 跳到下一节点 |

#### 示例
```html
<div id="vstp"></div>
<button id="prevbtn">上一步</button>
<button id="nextbtn">下一步</button>
```
```javascript
$(function(){
  $('#prevbtn').click(function(){ $('#vstp').vstep('prevStep'); });
  $('#nextbtn').click(function(){ $('#vstp').vstep('nextStep'); });
  $("#vstp").vstep({
    stepHeight:40,
    currentInd:3,
    onSelect:function(ind,item){ console.log(item); },
    items:[{title:'挂号',context:"操作人：王二\n2020-07-03 09:10"},
           {title:'就诊',context:"操作人：张三\n2020-07-03 10:10"},
           {title:'收费',context:"操作人：李四\n2020-07-03 11:10"},
           {title:'取药'},
           {title:'完成'}]
  });
});
```

---

# 三、表单（上）
### label（文字组件）

**用途**：实现表单文字标签的自动翻译、与右侧元素固定间距（10px），以及是否显示必填红星。
**引入方式**：`<input class="hisui-label" data-options="required:true,notTrans:false"/>姓名`

#### 属性
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| required | Boolean | false | 是否加红星符号（必填标记） |
| notTrans | Boolean | false | 是否自动翻译，true 表示不自动翻译（2023-08-01） |
| styleCss | String | 'r-label' | 附加样式类名，默认 'r-label' 表示与右边元素保留 10px 间距 |

#### 事件
（文档未列出）

#### 方法
（文档未列出）

#### 示例
```html
<input class="hisui-label" data-options="required:true,notTrans:false"/>姓名
<input class="hisui-label" data-options="notTrans:true"/>生日
```

---

### linkbutton（链接按钮）

**用途**：将 `<a>` 元素渲染为按钮样式的链接按钮，支持图标、色系、禁用、等待态等。
**引入方式**：`<a href="#" class="hisui-linkbutton" data-options="iconCls:'icon-w-find'">查询</a>`

#### 属性
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| plain | Boolean | false | 是否素色，为 true 时按钮素色 |
| iconImg | String | null | 图片地址，如 'unlock.png' 可自定义按钮图片 |
| stopAllEventOnDisabled | Boolean | false | 在 disabled 时是否阻止按钮事件；为 true 且按钮被禁用时，通过监听生成的子元素 span 的点击事件阻止事件冒泡 |
| notTrans | Boolean | false | 不自动翻译与否，默认自动翻译，true 表示不翻译（2023-08-01） |
| clickWaitingTime | Number | 200 | 点击后禁用时长（毫秒），默认禁用 200 毫秒后激活；点击后把按钮设置成 waiting 状态，禁用再次点击（2023-12-11） |
| waitingAlert | String | '按钮已点击过,系统响应中,请等待...' | waiting 状态的按钮再次点击时提示内容，为空时不提示（2023-12-11） |

> 其它用法：class 加 `hover-dark`（悬浮更深色）、`green`/`yellow`/`red`（绿/黄/红色系）、`big`（大图按钮，需配合 `plain:true`）；`stopAllEventOnDisabled` 为 true 时禁用态不再触发原 jq 绑定的事件。

#### 事件
（文档未以表格列出；通过 jQuery `.click()` 绑定点击事件，或 `data-options` 内联 `onClick`）

#### 方法
| 方法名 | 参数 | 说明 |
|---|---|---|
| disable | 无 | 禁用按钮（如 `$('#id').linkbutton('disable')`） |
| enable | 无 | 启用按钮 |

#### 示例
```html
<a href="#" class="hisui-linkbutton" data-options="iconCls:'icon-w-find'">查询</a>
<a href="#" class="hisui-linkbutton" data-options="iconImg:'update.png'">自定义图片按钮</a>
<a href="#" id="btn1" class="hisui-linkbutton" data-options="stopAllEventOnDisabled:true">下一步</a>
```
```js
$('#btn1').linkbutton('disable');                 // 禁用
$('#btn1').linkbutton('enable');                 // 启用
$('#btn1').click(function(){ alert('clicked'); });
```

---

### menubutton（菜单按钮）

**用途**：下拉菜单的入口按钮，平时显示为链接按钮，点击/悬停时展开绑定的菜单（menu）。
**引入方式**：`<a href="javascript:void(0)" id="mbedit" class="hisui-menubutton" data-options="menu:'#mmedit',iconCls:'icon-write-order'">修改</a>`

#### 属性
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| isTopZindex | Boolean | false | 是否覆盖在病历编辑器之上，可选值 true\|false |
| menu | String（选择器） | （无，示例 '#mmedit'） | 绑定的下拉菜单容器选择器，来自示例 data-options |
| iconCls | String | （无） | 按钮图标样式类，来自示例 data-options |
| otherCls | String | （无） | 附加样式类，可选 'menubutton-blue'（蓝色，无图标，菜单宽=按钮宽）或 'menubutton-toolbar'（显示图标、菜单不显示图标），来自示例 data-options |

> 官方属性表仅列出 `isTopZindex`；`menu`/`iconCls`/`otherCls` 为示例中的 data-options 用法。蓝色/工具栏按钮可通过 class 加 `menubutton-blue`/`menubutton-toolbar` 或 `data-options` 加 `otherCls` 实现，宽度用 style 控制。

#### 事件
（文档未列表；菜单项通过 `onclick` 或 `data-options` 绑定）

#### 方法
（文档未列表；继承 EasyUI menubutton，常见 `disable`/`enable`）

#### 示例
```html
<a href="javascript:void(0)" id="mbedit" class="hisui-menubutton menubutton-blue" style="width:130px;" data-options="menu:'#mm-blue'">操作</a>
<div id="mm-blue" style="width:100px;">
  <div onclick="console.log('停止');">停止</div>
  <div onclick="console.log('作废');">作废</div>
</div>
```
```js
$('#mbedit').menubutton({ isTopZindex: false });
```

---

### splitbutton（分割按钮）

**用途**：由一个链接按钮和一个下拉菜单组成，点击主按钮触发 onClick，悬停/点击箭头区域展开菜单（menu）。
**引入方式**：`<a href="javascript:void(0)" id="sb1" class="hisui-splitbutton" data-options="menu:'#mm2',iconCls:'icon-abort-order',onClick:function(){...}">作废医嘱</a>`

#### 属性
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| menu | String（选择器） | （无，示例 '#mm2'） | 绑定的下拉菜单容器选择器，来自示例 data-options |
| iconCls | String | （无） | 按钮图标样式类，来自示例 data-options |
| onClick | Function | （无） | 点击主按钮时触发的回调函数，来自示例 data-options |

> 文档未给出正式属性/事件/方法表，以上属性均来自示例 data-options。

#### 事件
（通过 `data-options` 的 `onClick` 或菜单项 `onclick` 绑定）

#### 方法
（文档未列表；继承 EasyUI splitbutton）

#### 示例
```html
<a href="javascript:void(0)" id="sb1" class="hisui-splitbutton" data-options="menu:'#mm2',iconCls:'icon-abort-order',onClick:function(){ $.messager.popover({msg:'按钮自己',type:'info'}); }">作废医嘱</a>
<div id="mm2" style="width:100px;" class="menu-no-icon">
  <div onclick="$.messager.popover({msg:'停止',type:'info'});">停止</div>
  <div onclick="$.messager.popover({msg:'作废',type:'info'});">作废</div>
</div>
```

---

### validatebox（验证框）

**用途**：在输入框上加入简单格式验证，支持必填、placeholder、禁用与多种 validType 校验规则。
**引入方式**：`<input id="patno" class="hisui-validatebox" data-options="required:true,placeholder:'序号必填',validType:'idcare'">`

#### 属性
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| placeholder | String | "" | 当不为空时在输入框显示占位提示，IE9+、Chrome 支持（2018-10-18） |
| disabled | Boolean / String | "false" | 当为 true 时输入框被禁止使用（2019-09-02） |
| validType | String | （无） | 格式校验规则；新增身份证号校验 'idcare'、手机号校验 'mobilephone'（2020-01-19） |

> 常见 validType 取值（文档示例/内置）：`email`（邮箱）、`url`（URL）、`number`（数字）、`date`（生日/日期）、`idcare`（身份证号，HISUI 新增）、`mobilephone`（手机号，HISUI 新增，12 位手机号自动去除首位 0）；亦支持 EasyUI 内置如 `length[6]` 等。

#### 事件
（文档未列表）

#### 方法
| 方法名 | 参数 | 说明 |
|---|---|---|
| setDisabled | false / true | 改变 disabled 属性的值，返回 jQuery 对象 |
| setValue | value | 赋值且验证，返回 jQuery 对象（2026-03-13） |
| validate | 无 | 主动触发验证（示例中使用 `valbox.validate()`） |
| isValid | 无 | 返回验证是否通过（示例中使用 `valbox.isValid()`） |

#### 自定义校验规则扩展
通过 `$.extend($.fn.validatebox.defaults.rules, {...})` 注册自定义规则，每条规则含 `validator(value, param)` 与 `message`：
```js
$.extend($.fn.validatebox.defaults.rules, {
    minLength: {
        validator: function (value, param) {
            return value.length >= param[0];
        },
        message: '请输入至少 {0} 个字符。'
    }
});
// 使用： validType:'minLength[6]'
```
> 内置扩展（无需注册）：`idcare`、`mobilephone` 已随框架提供。

#### 示例
```html
<input id="patno" class="hisui-validatebox" data-options="required:true,placeholder:'序号必填',validType:'idcare'">
<input id="urlVx" class="hisui-validatebox" data-options="validType:'url'">
```
```js
$HUI.validatebox('#patno', { required: true, placeholder: '序号必填' });
$('#patno').validatebox('setValue', '12345678');   // 赋值并验证
$('#patno').validatebox('setDisabled', true);      // 禁用
var ok = $('#patno').validatebox('isValid');        // 取验证结果
```

---

### searchbox（查询框）

**用途**：用于查询输入的文本框组件。
**引入方式**：`<input id="ss" href="#" class="hisui-searchbox"/>`

#### 属性
（文档仅给出基础用法，未列出详细属性表）

#### 事件
（文档未列出）

#### 方法
（文档未列出）

#### 示例
```html
<div class="hisui-panel" title="查询" style="width:400px;padding:10px"
     data-options="headerCls:'panel-header-gray',iconCls:'icon-search'">
  <table cellpadding="5">
    <tr>
      <td>查询框</td>
      <td><input id="ss" href="#" class="hisui-searchbox"/></td>
    </tr>
  </table>
</div>
```

---

### numberbox（数字验证框）

**用途**：验证数字表单，在输入框上加入数字范围/精度等简单验证。
**引入方式**：`<input id="nb" class="hisui-numberbox" data-options="isKeyupChange:true,fix:true">`

#### 属性
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| isKeyupChange | Boolean | false | 值为 false 时 blur 时改变组件的值；为 true 时 keyup 时改变组件的值（2019-04-18） |
| keyupChangeDelay | Number | 0 | 当 isKeyupChange 为 true 时，keyup 改变组件值的延迟时间（毫秒），用于解决输入 123 却变 523 的问题（2023-08-24） |
| fix | Boolean | true | true 时强制转换值为 min 或 max，值为 false 时只给出提示（2020-01-21） |
| forcePrecisionZoer | Boolean | true | true 强制按有效数字配置补齐，false 时不强制补 0（2022-05-22） |

#### 事件
（文档未列表；示例通过 `$('#nb').on('keyup', ...)` 监听并调用 `numberbox('getValue')`）

#### 方法
（文档未列表；常用 `getValue` / `setValue`，示例中 `$(this).numberbox('getValue')`）

#### 示例
```html
<input id="nb" class="hisui-numberbox" data-options="isKeyupChange:true,keyupChangeDelay:300,fix:true,forcePrecisionZoer:true">
```
```js
$('#nb').on('keyup', function (e) {
    console.log('numberbox value = ' + $(this).numberbox('getValue'));
});
```

---

### triggerbox（自定义触发框）

**用途**：HISUI 特色组件，用于自定义触发功能的输入框，图标可自定义，常用于弹出选择（如选卡、复制、图片等）。
**引入方式**：`<input name="card" class="hisui-triggerbox textbox" data-options="icon:'icon-card',handler:msg,plain:true"/>`

#### 属性
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| icon | String | 'icon-w-trigger-box' | 可配置按钮显示的图标，见【基础】-【图标(icon)】界面 |
| prompt | String | '' | 为空时的提示值 |
| value | String | '' | 初值 |
| disabled | Boolean | false | 是否禁用 |
| plain | Boolean | false | 图标背景是否透明（2019-12-23）；当未指定 icon 且未指定 plain 时，自动修改配置项 icon:'icon-trigger-box', plain:true |

#### 事件
| 事件名 | 参数 | 说明 |
|---|---|---|
| handler | value, name | 点击按钮时触发事件 |

#### 方法
| 方法名 | 参数 | 说明 |
|---|---|---|
| getValue | 无 | 获得组件的值，返回组件值 |
| setValue | val | 给组件赋值，返回当前 jQuery 对象 |
| disable | 无 | 禁用组件，返回当前 jQuery 对象 |
| enable | 无 | 启用组件，返回当前 jQuery 对象 |
| options | 无 | 获取组件配置项，返回配置项 |
| textbox | 无 | 获取组件输入框 jQuery 对象，返回输入框 jQuery 对象 |
| clear | 无 | 清空值，返回当前 jQuery 对象 |
| reset | 无 | 还原初值，返回当前 jQuery 对象 |
| getName | 无 | 获取 Name 属性，返回 Name 属性 |
| destroy | 无 | 销毁组件，返回当前 jQuery 对象 |
| resize | width | 调整宽度，返回当前 jQuery 对象 |

#### 示例
```html
<input id="card" name="card" class="hisui-triggerbox textbox" data-options="icon:'icon-card',handler:msg,plain:true"/>
<input id="copy" name="copy" class="hisui-triggerbox textbox" data-options="icon:'icon-copy-blue',handler:msg,plain:true"/>
```
```js
function msg(value, name) {
    $.messager.popover({ type: 'info', msg: '点击了 name=' + name + ', value=' + value });
    if (name == 'copy') {
        var v = $('#card').triggerbox('getValue');
        $('#copy').triggerbox('setValue', v);
    }
}
$('#copy').triggerbox('disable');   // 禁用
$('#copy').triggerbox('enable');   // 启用
```

---

### datebox（日期框）

**用途**：把可编辑文本框与下拉日历结合，从日历选日期或输入字符串转有效日期；支持快捷输入 t+2（二天后）、t-2（二天前）。
**引入方式**：`<input id="db" class="hisui-datebox" data-options="required:true,validParams:'YMD'">`

#### 属性
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| validParams | String | 'YMD' | 日期显示格式，'YMD' 表示显示成 YYYY-MM-DD；其它格式不强制检查，如配置成 'YM' 再实现 formatter 可实现仅年月效果（2019-07-05） |
| minDate | String / Date | null | 可选最小日期，如 '2019-11-25'（2019-11-26） |
| maxDate | String / Date | null | 可选最大日期，如 '2019-11-25'（2019-11-26） |

> 其余配置见 EasyUI 1.3.2 对应配置（formatter、onSelect 等）。

#### 事件
（文档未列表；示例 `onSelect(date)` 为日历选中回调）

#### 方法
| 方法名 | 参数 | 说明 |
|---|---|---|
| getValue | 无 | 获取日期值（示例中 `datebox('getValue')`） |
| setValue | value | 设置日期值（标准用法） |
| options | 无 | 获取配置项，可改 minDate/maxDate 动态调整可选范围（示例中 `datebox('options')`） |

#### 示例
```html
<input id="db" class="hisui-datebox" data-options="required:true,validParams:'YMD'">
```
```js
$('#db').datebox('getValue');                 // 取值
var opt = $('#db').datebox('options');
opt.minDate = '2019-11-24';                   // 动态限定可选范围
opt.maxDate = '2019-11-30';
// 文本框直接输入 t+2 / t-2 表示相对当前日期的偏移
```

---

### timespinner（时间框）

**用途**：时间输入与微调组件（时间验证框），支持时/分/秒步进及光标定位。
**引入方式**：`<input id="tsp" class="hisui-timespinner" data-options="hourStep:1,minutesStep:5,secondStep:10">`

#### 属性
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| hourStep | Number | 1（小时） | 调整时钟的增量值（2023-02-17） |
| minutesStep | Number | 1（分钟） | 调整分钟的增量值（2023-02-17） |
| secondStep | Number | 1（秒钟） | 调整秒钟的增量值（2023-02-17） |

#### 事件
（文档未列表）

#### 方法
| 方法名 | 参数 | 说明 |
|---|---|---|
| setValue | value | 设置时间值，如 '101010' 表示 HHmmss（示例中 `timespinner('setValue','101010')`） |
| setSpinStart | 正整数（如 4） | 设置当前微调位置（光标位置）；如 4 则光标在第 4 个字符位置即分钟区域；入参小于 0 或大于内容总长度时无效（2022-06-13） |

#### 示例
```html
<input id="tsp" class="hisui-timespinner" data-options="hourStep:1,minutesStep:5,secondStep:10">
```
```js
$('#tsp').timespinner('setValue', '101010');   // HHmmss
$('#tsp').timespinner('setSpinStart', 4);      // 光标定位到第4个字符（分钟区）
```

---

# 四、表单（下）
### combo（组合 combo 基类）

**用途**：在页面上显示一个可编辑文本框 + 下拉面板，是 combobox / combotree / combogrid 等复杂组合组件的基类；由 JS 从 `<select>` 或 `<input>` 创建（标记创建无效）。

**引入方式**：`$HUI.combo('#cc', {editable:false, ...})` 或 `$('#cc').combo({...})`

#### 属性
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| enterNullValueClear | boolean | `true` | 为 `false` 时，在输入框内回车，没有匹配值不清空输入框。 |
| placeholder | string | `""` | 不为空时在输入框显示 placeholder（IE9+、Chrome 支持）。 |

#### 事件
（本文档未列出 combo 专属事件表）

#### 方法
（基础方法由子类 combobox 等继承/扩展，见各子类）

#### 示例
```html
<input id="cc" />
```
```js
$(function(){
  var ccObj = $HUI.combo('#cc', {editable:false, placeholder:'自定义下拉面板'});
  // 往面板里塞自定义内容
  $('#sp').appendTo(ccObj.panel());
  $('#sp label').click(function(){
    ccObj.setValue($(this).attr('value'));
    ccObj.setText($(this).html());
    ccObj.hidePanel();
  });
});
```

---

### combobox（下拉框）

**用途**：显示一个可编辑文本框 + 下拉列表，用户可从列表中选择一个或多个值，也可直接键入文本。支持本地/远程数据、多选、过滤、分组展示等。

**引入方式**：
- HTML：`<select id="stateBox" class="hisui-combobox" name="state" data-options="..."></select>`
- JS：`$HUI.combobox('#id', {valueField:'id', textField:'text', ...})` 或 `$('#id').combobox({...})`

#### 属性（HISUI 扩展项）
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| enterNullValueClear | boolean | `true` | 继承 combo；为 `false` 时回车无匹配值不清空输入框。 |
| placeholder | string | `""` | 继承 combo；输入框占位提示。 |
| selectOnNavigation | boolean | `true` | 为 `false` 时，DOWN 键不选中行记录。 |
| defaultFilter | number | `1` | 默认过滤规则：`1`=text 左匹配(不区分大小写)；`2`=text 包含匹配；`3`=text 左匹配或拼音首字母左匹配(多音字取首个简拼)；`4`=text 包含或拼音首字母包含；`5`=text 左匹配或拼音首字母左匹配(考虑多音字)；`6`=text 包含或拼音首字母包含(考虑多音字)。 |
| spellField | string | `""` | 简拼字段名，指定行数据中的简拼字段；仅 `defaultFilter` 为 3~6 时有效，配置后取该字段值作简拼而非程序自动转换。 |
| rowStyle | string | `''` | 行显示样式，可选 `'checkbox'`（显示成可勾选行）。 |
| blurValidValue | boolean | `false` | 为 `true` 时，光标离开检查是否选中值，未选中则置空输入框。 |
| allSelectButtonPosition | string | `'top'` | 全选按钮位置，可配 `'top'`/`'bottom'`；仅 `multiple:true` 且 `rowStyle:'checkbox'` 时有效。 |
| allowNull | boolean | `false` | 单选且不可编辑时，选中后不能取消选择可设 `true`。 |
| panelHeight | number/string | `200` | 下拉面板高度，可配 `'auto'` 自适应。 |
| defaultHoverFirstRow | boolean | `false` | 查询数据时默认 hover 第一行，回车选中第一行。 |

#### 属性（标准配置项，示例中使用的 EasyUI 兼容项）
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| valueField | string | — | 数据项中"值"对应的字段名（如 `'id'`）。 |
| textField | string | — | 数据项中"显示文本"对应的字段名（如 `'text'`）。 |
| url | string | — | 远程数据地址；配合 `mode:'remote'` 使用。 |
| mode | string | — | `'local'`（本地）/ `'remote'`（远程）。 |
| multiple | boolean | — | `true` 时支持多选。 |
| data | array | — | 本地数据源数组，元素形如 `{id:'css', text:'CSS语言'}`。 |
| editable | boolean | — | 是否可编辑键入。 |
| formatter | function | — | `function(row){ return html }`，自定义每行渲染。 |
| onShowPanel | function | — | 下拉面板展开时触发（常用于延迟拉取远程数据）。 |
| onBeforeLoad | function | — | 加载前触发，可修改请求参数（`param.q` 为输入关键字）。 |

> 说明：本页文档未给出 `group` 分组相关配置表（分组继承自 EasyUI combobox 标准 `groupField` 等），如需分组请参考 EasyUI 1.3.2 combobox 说明。

#### 事件
| 事件名 | 参数 | 说明 |
|---|---|---|
| onAllSelectClick | `e` | 点击【全选/取消全选】按钮时触发；仅按钮显示时有效。示例：`onAllSelectClick:function(e){ var arr = $(this).combobox("getValues"); }` |

> 其余标准事件（如 `onSelect`、`onChange`）在示例中出现：
> - `onSelect: function(rec){...}` —— 单选选中时触发，`rec` 为选中记录。
> - `onChange: function(newval, oldval){...}` —— 值改变时触发，`newval`/`oldval` 为变更后/前的数组。

#### 方法（示例中出现）
| 方法名 | 参数 | 说明 |
|---|---|---|
| setValue | `value` | 设置选中值。 |
| setText | `text` | 设置输入框显示文本。 |
| getValue | — | 获取选中值（字符串）。 |
| getValues | — | 获取多选值数组。 |
| setValues | `array` | 设置多选值（如 `setValues(["css","html"])` 或 `setValues([])` 清空）。 |
| loadData | `data` | 加载本地数据数组。 |
| reload | `[url]` | 重新加载远程数据，可传 url。 |
| clear | — | 清空。 |
| options | — | 获取配置项对象。 |
| panel | — | 获取下拉面板 jQuery 对象。 |
| destroy | — | 销毁组件。 |

#### 示例

单选（HTML 生成，默认选中 Ohio）：
```html
<select id="stateBox" class="hisui-combobox" name="state" style="width:200px;"
        data-options="enterNullValueClear:false,onSelect:selectHandler,blurValidValue:true">
  <option value="AK">Alaska</option>
  <option value="OH" selected>Ohio</option>
  <option value="WY">Wyoming</option>
</select>
```
```js
function selectHandler(rec){ console.log(rec.text, $("#stateBox").combobox('getValue')); }
```

多选（勾选行形式）+ 全选按钮：
```js
var cbox = $HUI.combobox("#cbox",{
  valueField:'id', textField:'text', multiple:true, rowStyle:'checkbox',
  selectOnNavigation:false, allSelectButtonPosition:'top',
  panelHeight:'auto', editable:false,
  data:[{id:'css',text:'CSS语言'},{id:'html',text:'HTML语言'},{id:'java',text:'JAVA语言'}]
});
$("#cboxselbtn").click(function(){ cbox.setValues(["css","html","java"]); });
```

远程数据加载（延迟到展开时拉取，提升首屏速度）：
```js
$("#loaddataCB").combobox({
  valueField:'id', textField:'text', panelHeight:'auto',
  value:20, data:[{id:20,text:"中国"}],
  onShowPanel:function(){
    if(!$(this).combobox('options').url){
      $(this).combobox('options').url = "FindNation";
      $(this).combobox('reload');
    }
  },
  onBeforeLoad:function(param){ param.ndesc = param.q; }
});
```

带简拼过滤（defaultFilter + spellField）：
```js
$HUI.combobox("#dfCB",{
  valueField:'id', textField:'text', panelHeight:'auto',
  defaultFilter:6, // 6=包含匹配或拼音首字母包含
  data:[
    {id:'1',text:'高血压病',spell:'GXYB'},
    {id:'2',text:'伤寒性肝炎',spell:'SHXGY'}
  ]
});
```

---

### switchbox（切换开关）

**用途**：开/关切换开关，源自 Bootstrap 的 switch 插件；用于布尔状态切换。

**引入方式**：`<div id="switch1" class="hisui-switchbox" data-options="..."></div>` 或 `$HUI.switchbox('#switch2', {...})`

#### 属性
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| id | string | `''` | switchbox 的名字。 |
| onText | string | `'开'` | 开状态时显示的文本。 |
| offText | string | `'关'` | 关状态时显示的文本。 |
| disabled | boolean | `false` | 是否禁用（默认可用）。 |
| checked | boolean | `true` | 是否选中（默认开启）。 |
| animated | boolean | `false` | 是否启用动画效果。 |
| size | string | `'mini'` | 开关大小，可选 `'mini'`/`'small'`/`'large'`。 |
| onClass | string | `'success'` | 开状态样式类，可选 `'primary'`/`'info'`/`'success'`/`'warning'`/`'danger'`/`'gray'`。 |
| offClass | string | `'warning'` | 关状态样式类，可选同上。 |

#### 事件
| 事件名 | 参数 | 说明 |
|---|---|---|
| onSwitchChange | `e, obj` | 选中状态改变事件。 |

#### 方法
| 方法名 | 参数 | 返回值 | 说明 |
|---|---|---|---|
| options | — | jquery 对象 | 拿到配置项对象。 |
| toggleActivation | — | jquery 对象 | 切换禁用与可用状态。 |
| isActive | — | — | 判断当前开关是否启用。 |
| setActive | `false`/`true` | jquery 对象 | 禁用或启用开关。 |
| toggle | — | jquery 对象 | 切换开与关状态。 |
| setValue | `false`/`true`[, `skipOnChange`] | jquery 对象 | 设置值；`skipOnChange` 为可选参数，控制是否触发切换事件。 |
| getValue | `false`/`true` | jquery 对象 | 获得值。 |
| setOnText | — | jquery 对象 | 设置开状态文本。 |
| setOffText | — | jquery 对象 | 设置关状态文本。 |
| setOnClass | — | jquery 对象 | 设置开状态样式类。 |
| setOffClass | — | jquery 对象 | 设置关状态样式类。 |
| destroy | — | jquery 对象 | 销毁开关。 |

#### 示例
```html
<div id="switch1" class="hisui-switchbox" style="margin-left:5px"
     data-options="onText:'启用',offText:'禁用',size:'small',animated:true,onClass:'primary',offClass:'gray',onSwitchChange:function(event,obj){console.log(event,obj);}"></div>
```
```js
$HUI.switchbox('#switch2',{
  onText:'开', offText:'关', onClass:'primary', offClass:'gray',
  onSwitchChange:function(e,obj){ console.log(e, obj); }
});
```

---

### checkbox（勾选框）

**用途**：点击勾选，常用于多项选择；蓝色系图片勾选框。

**引入方式**：`<input type="checkbox" class="hisui-checkbox" name="...">` 或 `$('[name="x"]').checkbox({...})`

#### 属性
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| id | string | `''` | 复选框的 Id。 |
| label | string | `''` | 描述。 |
| disabled | boolean | `false` | 是否禁用（默认可用）。 |
| checked | boolean | `false` | 是否选中（默认不选中）。 |
| boxPosition | string | `'left'` | 勾选框位置，可选 `'right'`（2019-11-04）。 |
| required | boolean | `false` | name 相同判断为一组，且是否必选一项；`true` 时为必选一项，不选会变红提示（2020-07-26）。 |

#### 事件
| 事件名 | 参数 | 说明 |
|---|---|---|
| onCheckChange | `e, value` | 选中改变事件。 |
| onChecked | `e, value` | 选中事件。 |
| onUnchecked | `e, value` | 取消选中时触发。 |

#### 方法
| 方法名 | 参数 | 返回值 | 说明 |
|---|---|---|---|
| options | — | checkbox 的 options 对象 | 拿到配置项对象。 |
| setValue | `true`/`false` | jquery 对象 | 选中/取消选中元素。 |
| getValue | — | `true`/`false` | 拿到是否选中。 |
| setDisable | `false`/`true` | jquery 对象 | 禁用。 |
| check | — | jquery 对象 | 选中。 |
| uncheck | — | jquery 对象 | 取消选中。 |
| toggle | — | jquery 对象 | 切换选中。 |
| disable | — | jquery 对象 | 禁用选框。 |
| enable | — | jquery 对象 | 启用选框。 |
| update | — | jquery 对象 | 重绘选框。 |
| destroy | — | jquery 对象 | 销毁选框。 |
| isValid | — | Boolean | 必选一项验证（2020-07-26）。 |
| setRequired | `true`/`false` | jquery 对象 | 设置或取消必选状态（2021-02-05）。 |

#### 示例
```html
<input type="checkbox" name="hobby" class="hisui-checkbox" label="运动" />
<input type="checkbox" name="hobby" class="hisui-checkbox" label="音乐" />
```
```js
// 必选切换
function setRequired(){
  $('[name="hobby"]').checkbox('setRequired', true);
}
// 验证
$('.hisui-checkbox').checkbox('isValid');
```

---

### radio（单选框）

**用途**：用于多选一的业务场景；蓝色系图片单选框。

**引入方式**：`<input type="radio" class="hisui-radio" name="...">` 或 `$HUI.radio("[name='x']", {...})`

#### 属性
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| name | string | `''` | radio 的名字。 |
| label | string | `''` | 描述。 |
| disabled | boolean | `false` | 是否禁用（默认可用）。 |
| checked | boolean | `false` | 是否选中（默认不选中）。 |
| boxPosition | string | `'left'` | 勾选框位置，可选 `'right'`（2019-11-04）。 |
| requiredSel | boolean | `false` | 必选；`true` 时不可取消选中（2019-11-26）。 |
| required | boolean | `false` | name 相同判断为一组，且是否必选一项；`true` 时必选一项，不选变红提示（2020-07-26）。 |

#### 事件
| 事件名 | 参数 | 说明 |
|---|---|---|
| onCheckChange | `e, value` | 选中改变事件。 |
| onChecked | `e, value` | 选中事件。 |

#### 方法
| 方法名 | 参数 | 返回值 | 说明 |
|---|---|---|---|
| options | — | jquery 对象 | 拿到配置项对象。 |
| setValue | `true` | jquery 对象 | 选中元素（入参为 `false` 无效）；选中当前元素会自动清空同名 radio。 |
| getValue | — | `false`/`true` | 拿到值。 |
| setDisable | `false`/`true` | jquery 对象 | 禁用。 |
| check | — | jquery 对象 | 选中。 |
| uncheck | — | jquery 对象 | 取消选中。 |
| toggle | — | jquery 对象 | 切换选中。 |
| disable | — | jquery 对象 | 禁用选框。 |
| enable | — | jquery 对象 | 启用选框。 |
| update | — | jquery 对象 | 重绘选框。 |
| destroy | — | jquery 对象 | 销毁选框。 |
| isValid | — | Boolean | 验证必选状态（2020-07-26）。 |
| setRequired | `true`/`false` | jquery 对象 | 设置或取消必选状态（2021-02-05）。 |

#### 示例
```html
<input type="radio" name="wantEat" class="hisui-radio" label="苹果" />
<input type="radio" name="wantEat" class="hisui-radio" label="香蕉" />
<input type="radio" name="wantEat" class="hisui-radio" label="梨" />
```
```js
$HUI.radio("[name='wantEat']",{
  onChecked:function(e, value){ logger.info($(e.target).attr("label")); }
});
// 动态插入后需重新初始化
$("#eatlist").append('<input type="radio" class="hisui-radio" name="wantEat" label="桃">');
$HUI.radio("#eatlist input.hisui-radio",{});
// 必选切换
$('[name="sex"]').radio('setRequired', true);
```

---

### filebox（文件选择框）

**用途**：用于选择客户端文件（含多选、后缀限制、图标按钮等）。

**引入方式**：`<input class="hisui-filebox" name="file1" data-options="..." />` 或 `$HUI.filebox('#f7', {width:400, plain:true})`

#### 属性
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| buttonText | string | `'Choose File'` | 按钮文字。 |
| buttonAlign | string | `'right'` | 按钮位置，可选 `'right'`/`'left'`。 |
| accept | string | `''` | 规定可提交的文件类型（W3C 建议应在服务器端再验证）。 |
| capture | string | `''` | 捕获系统默认设备：`camera`=照相机；`camcorder`=摄像机；`microphone`=录音。 |
| multiple | boolean | `false` | 多选文件。 |
| separator | string | `','` | 多选时文件名分隔符。 |
| prompt | string | `''` | 未选择文件时的提示文字。 |
| width | number | `177` | 整体宽度。 |
| disabled | boolean | `false` | 禁用。 |
| buttonIcon | string | `null` | 图标类，一般用 `buttonIcon:'icon-folder'` 配合 `plain:true`。 |
| plain | boolean | `false` | 图标背景色是否透明（2019-12-23）。 |

#### 事件
| 事件名 | 参数 | 说明 |
|---|---|---|
| onClickButton | — | 按钮点击事件。 |
| onChange | `newVal, oldVal` | 改变事件。 |

#### 方法
| 方法名 | 参数 | 返回值 | 说明 |
|---|---|---|---|
| options | — | filebox 的 options 对象 | 拿到配置项对象。 |
| files | — | 选定的文件列表对象 | 获取选定的文件列表对象。 |
| clear | — | jq 对象 | 清空。 |
| reset | — | jq 对象 | 清空。 |
| button | — | 返回按钮 jq 对象 | 获取按钮 jq 对象。 |
| enable | — | jq 对象 | 启用。 |
| disable | — | jq 对象 | 禁用。 |

#### 示例
```html
<input class="hisui-filebox" name="file2"
       data-options="width:400,buttonText:'选择',prompt:'excel文件：*.xls,*.xlsx',plain:true"
       accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />

<input class="hisui-filebox" name="file4"
       data-options="width:400,multiple:true,plain:true,buttonText:'多选',prompt:'请选择文件(多选)'" />

<input id="f5" class="hisui-filebox" name="file5" data-options="prompt:'请选择文件',plain:true" />
<a href="#" class="hisui-linkbutton" onclick="$('#f5').filebox('clear')">清空</a>
```
```js
$HUI.filebox('#f7', { width:400, plain:true });
// 或
$('#f6').filebox({ width:400, prompt:'请选择文件', buttonText:'选择', buttonAlign:'left', plain:true });
// 取值
var files = $('#f5').filebox('files');
```

---

### keywords（关键字集组件）

**用途**：HISUI 特色组件，用于关键字多选或切换关键字功能（标签块形式，支持分组章节、单选/多选、禁用项）。

**引入方式**：`<div id="kw"></div>` + `$("#kw").keywords({ items:[...], ... })`

#### 配置项
| 配置项 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| items | array | — | 具体元素数组。元素属性：`text`, `id`, `selected`, `disabled`。 |
| text | string | `null` | 标签文本（必需项）。 |
| id | string | `null` | 标签 id（可选项）。 |
| selected | boolean | `false` | 选中当前标签（可选项）。 |
| disabled | boolean | `false` | 禁用当前标签（可选项，2023-08-22）。 |
| singleSelect | boolean | `false` | 是否为单选模式；`true` 时单选。 |
| labelCls | string | `'blue'` | 选择块样式名，可选 `'red'`/`'blue'`。 |

> items 支持嵌套分组：`chapter`（章节）→ `section`（段落）→ 具体项；`text:""` 的章节不显示蓝条但有横线。

#### 事件
| 事件名 | 参数 | 说明 |
|---|---|---|
| onClick | `item` | 当前点击对象。 |
| onUnselect | `item` | 当前取消选中对象；单选时不会触发。 |
| onSelect | `item` | 当前选中对象；单选、多选都会触发（2022-01-24）。 |

#### 方法
| 方法名 | 参数 | 返回值 | 说明 |
|---|---|---|---|
| select | `id` | 无 | 选中对象，入参为元素的 id。 |
| getSelected | 无 | Array | 获得所有已选对象。 |
| switchById | `id` | 无 | 切换元素的选中状态，入参为元素的 id。 |
| clearAllSelected | 无 | 无 | 清除所有选中；不触发事件（2018-08-22）。 |

#### 示例
```html
<div id="kw"></div>
```
```js
$("#kw").keywords({
  singleSelect:false,
  labelCls:'blue',
  onClick:function(v){ console.log("点击->"+v.text); },
  onSelect:function(v){ console.log("选择->"+v.text); },
  onUnselect:function(v){ console.log("取消选择->"+v.text); },
  items:[{
    text:"诊断", type:"chapter",
    items:[{
      text:'西医诊断', type:"section",
      items:[
        {text:'上呼吸道感染', id:"x1"},
        {text:'急性酒精中毒', id:'x11', selected:true},
        {text:'腰间盘突出', id:'x5', disabled:true}
      ]
    },{
      text:"中医诊断", type:'section',
      items:[ {text:'肝热病', id:"z1"}, {text:'白喉', id:"z2"} ]
    }]
  },{
    text:"过敏药品", type:"section",
    items:[ {text:"青霉素"}, {text:"链霉素"} ]
  }]
});
// 取选中
var rs = $("#kw").keywords("getSelected");
// 清空
$("#kw").keywords("clearAllSelected");
```

---

# 五、数据表格 datagrid
> 说明：本手册内容均提炼自 HISUI 官网 API 文档（datagrid 主文档 + scroll / edit / celledit 三个扩展文档）。
> 属性「默认值」与事件/方法「参数」均为文档原文；「类型」一列系根据默认值/用法推断（原文未单列类型），推断处已尽量保守。
> 标准 datagrid 能力（url、pagination、columns、formatter 等）在示例中大量出现，凡文档出现过的均已标注，未出现的未臆造。

---

### 数据表格（datagrid）

**用途**：以表格形式展示并操作数据，支持分页、排序、选择/勾选、列冻结、行/单元格编辑、工具栏、tip 提示、远程加载等，是 HISUI 最核心的组件。

**引入方式**：
- HTML 声明式：`<table class="hisui-datagrid" data-options="..."></table>`
- JS 初始化：`$HUI.datagrid('#dg', {...})` 或 `$('#dg').datagrid({...})`
- 列与数据书写约定：`<thead>` 中定义列（每列须设 `field`），`<tbody>` 中定义数据；也可通过 `columns` / `data` 配置。

#### 属性（HISUI 扩展属性）

| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| fitColumns | boolean | none | 列自动适应。为 true 时，必须给每一列都设 width 以便按比例缩放；若某列不给宽度会以 `width:auto` 展开，其余列等比缩放（某些情况下列头可能不对齐） |
| autoSizeColumn | boolean | true | 是否自动计算列属性。不用时请设为 false（严重影响效率） |
| showRefresh | boolean | true | 是否显示翻页条上的刷新按钮 |
| showPageList | boolean | true | 是否显示翻页条上的每页行数下拉列表 |
| afterPageText | string | 页,共{pages}页 | 翻页条输入框后显示信息；值为 `''` 则不显示 |
| beforePageText | string | 第 | 翻页条输入框前显示信息；值为 `''` 则不显示 |
| displayMsg | string | 显示 {from} 到 {to} ,从 {total} 条记录 | 翻页条显示信息；值为 `''` 则不显示 |
| fixRowNumber | boolean | false | 让行号列自适应宽度（rownumbers 为 true 时有效）；true 时行号列自适应宽度（20180822） |
| btoolbar | object/selector | null | 底部工具栏，与 toolbar 对应但位置在列表底部（20190510） |
| className | string | "" | M 中类名（非常规属性），与 queryName 配合生成 columns（20190829） |
| queryName | string | "" | M 中 query 名（非常规属性），通过 className+queryName 生成 columns 且可自定义列属性（20190829） |
| defaultsColumns | array/object | null | 默认列定义（可选项），与 className/queryName 生成的 `cm` 合并成新 columns（20220818） |
| fontSize | number | "" | 表格内容字体大小（px）；nowrap:false 时设置后表格行高会变化（20200824） |
| lineHeight | number | "" | 表格内容行高（px）（20201126） |
| titleNoWrap | boolean | true | 表头是否折行；false 时表头自动折行（20200824） |
| clicksToEdit | number | 0 | 编辑行点击动作：0 默认无动作，1 单击编辑，2 双击编辑（20200907） |
| shiftCheck | boolean | false | Shift 连选：true 时按 `Shift+鼠标左键` 连选多行（20210923） |
| singleRequest | boolean | false | 是否只保留最后一个请求；true 时只保留最后一个请求（2021-11-10） |
| loadBeforeClearSelect | boolean | false | 加载数据前是否清空选中、去除全选勾；true 时加载前清空所有选中（20220126） |
| columnsUrl | string | null | 获取列定义数据的路径，返回 `{"cm":[{"field":"Code","title":"代码"},...],"pageSize":15,"originPage":"xx.csp"}`，会把 cm 重写到 columns 及 defaultColumns 中，优先于 columns 属性（20221101） |
| editColumnsPage | string | null | 编辑列定义界面路径；定义后双击列头弹出此界面（20221101） |
| editColumnsGrantUrl | string | null | 判断是否有权力编辑列定义的路径，返回 1 表示有权限；双击列头时通过此链接判断（20221101） |
| clearSelectionsOnload | boolean | false | 数据加载后清除选中信息，防止全选勾及选中信息带入下一页（20230824） |
| refLinkButton | string(selector) | null | 关联按钮的 jQuery 选择器，如 `'#Find'`，配置后联动该按钮禁用状态（20231211） |

> 文档示例中还频繁使用下列**标准 datagrid 属性**（未在上表单列默认值）：`title`、`width`、`height`、`iconCls`、`headerCls`（配置项使表格变灰，如 `'panel-header-gray'`）、`pagination`、`rownumbers`、`singleSelect`、`idField`、`columns`、`frozenColumns`、`toolbar`、`data`、`nowrap`、`showFooter`、`loadFilter`、`checkOnSelect`、`selectOnCheck`、`url`、`resizeHandle`（取值 `left`/`right`/`both`，可拖拽列头边缘改变列宽）。

#### 列属性（columns）

| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| wordBreak | string | null | nowrap 为 false 时列内容换行规则：`break-all` 任意截断、`break-word` 完整单词截断（2020-08-19） |
| fontSize | number | "" | 当前列内容字体大小（px）；nowrap:false 时设置后行高会变化（20200824） |
| lineHeight | number | "" | 当前列内容行高（px）（20201126） |
| showTip | boolean | false | 鼠标移入某单元格时弹出提示层，内容为当前单元格内容（见示例三-说明列） |
| showTipFormatter | function | null | 配置为函数时，鼠标移入单元格弹出提示层，内容为函数返回值；入参 `function(row,rowIndex){}`，返回文本或 html 片段（20220706） |
| tipWidth | number | 300 | 鼠标移入弹出提示层的宽度（px） |
| tipPosition | string | 'bottom' | 提示层位置：`top`/`bottom`/`left`/`right`（20210105） |
| tipTrackMouse | boolean | false | 提示层是否跟随鼠标移动（20210105） |
| headerCheckbox | boolean | false | 列头显示勾选框，勾选时会把当前列所有 checkbox 勾中（20230711） |
| columnHeaderTitle | string | undefined | 列头显示说明提示；有值时才显示且列头变色（20230711） |

> 标准列配置项（示例中大量使用，未在上表单列）：`field`（字段名，必填）、`title`（列标题）、`width`、`align`（内容对齐）、`halign`（列头对齐）、`checkbox`（如 `{field:'ck',checkbox:true}`）、`rowspan`、`colspan`、`hidden`、`sortable`、`order`（`asc`/`desc`）、`editor`（编辑配置）、`formatter(value,row,index)`、`styler(value,row,index)`。

#### 事件

| 事件名 | 参数 | 说明 |
|---|---|---|
| onDblClickHeader | e, field | 双击列头触发 |
| onBeforeSelect | rowIndex, rowData | 选中行之前触发，返回 false 时取消动作；rowIndex 从 0 开始 |
| onBeforeUnselect | rowIndex, rowData | 取消选中行之前触发，返回 false 时取消动作；rowIndex 从 0 开始 |
| onBeforeCheck | rowIndex, rowData | 用户勾选一行之前触发，返回 false 时取消动作；rowIndex 从 0 开始 |
| onBeforeUncheck | rowIndex, rowData | 取消勾选一行之前触发，返回 false 时取消动作；rowIndex 从 0 开始 |
| onHighlightRow | rowIndex, rowData | 高亮行事件 |
| onColumnsLoad | cm | 获得 columns 后触发；配置 className 与 queryName 后有效（可加工 columns，如增改 formatter/styler）（2019-09-31） |
| onInitBefore | options | 表格生成前修改上下文，当前 this 指向 datagrid（20221101） |

> 文档示例中还用到标准事件：`onLoadSuccess(data)`（数据加载成功后）、`onSelect(rowIndex,rowData)`（选中行后）、`onClickRow(index)`（点击行，编辑示例中用于触发 beginEdit）。标准编辑事件 `onBeforeEdit`/`onBeginEdit`/`onAfterEdit`/`onEndEdit`/`onCancelEdit` 遵循 EasyUI datagrid 编辑 API。

#### 方法

| 方法名 | 参数 | 说明 |
|---|---|---|
| setColumnTitle | colOpt | 重设置列头标题，如 `{'datetime':'时间列标题','code':'代码列标题'}`（20181009） |
| getEditingIndex | — | 获得当前编辑行索引，返回编辑行（从 0 开始）（20200907） |
| uncheckAll | isAllPage | 取消当前页所有勾选；入参 true 可取消所有页勾选（20230208） |
| unselectAll | isAllPage | 取消当前页所有选中；入参 true 可取消所有页选中（20230208） |
| getCheckboxRows | fieldName | 获得某列所有勾选的记录，返回 rows（20230711） |

> 文档示例中使用的其它常用方法（遵循标准 datagrid API）：

| 方法名 | 参数 | 说明（示例用法） |
|---|---|---|
| beginEdit | index | 开始编辑指定行：`$('#dg').datagrid('beginEdit', index)` |
| endEdit | index | 结束编辑并写回数据：`$('#dg').datagrid('endEdit', index)` |
| deleteRow | index | 删除指定行：`$('#dg').datagrid('deleteRow', index)` |
| selectRow | index | 选中指定行，可链式调用 beginEdit |
| validateRow | index | 校验指定行，返回 boolean（编辑保存前调用） |
| getEditor | {index, field} | 获取指定单元格编辑器，如 `getEditor({index:editIndex,field:'feetypeid'})`，再用 `.target` 取组件 |
| getRows | — | 返回当前页所有行数据 |
| getRowIndex | row | 根据行数据返回其索引 |
| getSelected | — | 返回选中行 |
| getPanel | — | 返回面板 jQuery 对象，用于 DOM 操作（如去修改标志样式） |
| loadData | rows | 加载本地数据数组 |
| columnMoving | — | 列拖动（示例中注释提及） |

> 标准编辑方法 `cancelEdit(index)`、`insertRow`、`getChanges` 遵循 EasyUI datagrid 编辑 API（本文档示例未逐一展开参数）。

#### 数据格式

服务端返回的 JSON 结构（本地 `data` 或远程 `url` 返回同构）：

```json
{
  "rows": [
    {"col1": "value", "col2": "value" /* ... 一页显示的数据 */}
  ],
  "footer": [{"col1": "value", "col2": "value"}] /* 脚行数据，一般用于总计，可选 */,
  "total": 10 /* 总行数 */
}
```

#### 示例

最小可用（HTML 声明 + columns 在 thead 中定义）：

```html
<table id="dg" class="hisui-datagrid" title="病人列表"
       style="width:600px;height:400px"
       data-options="pagination:true,rownumbers:true,fitColumns:true,
                     headerCls:'panel-header-gray',iconCls:'icon-paper'">
  <thead>
    <tr>
      <th data-options="field:'code',width:40">编码</th>
      <th data-options="field:'name',width:40">姓名</th>
      <th data-options="field:'dept',width:50">科室</th>
    </tr>
  </thead>
</table>
```

JS 初始化（含冻结列、footer、tip、toolbar）：

```javascript
$HUI.datagrid('#mytable3', {
  url: 'getpatdata.jsp',          // 远程加载，返回 {total,rows,footer}
  idField: 'id',
  rownumbers: true,
  singleSelect: false,
  pagination: true,
  showFooter: true,
  headerCls: 'panel-header-gray',
  iconCls: 'icon-paper',
  shiftCheck: true,
  loadFilter: function (data) {    // 拿到数据后为合计行赋值
    if (data.footer && data.footer.length > 0) {
      data.footer[0]["code"] = "合计";
    }
    return data;
  },
  frozenColumns: [[
    { field: 'ck', checkbox: true },
    { field: 'id', title: 'ID', width: 40 },
    { field: 'code', title: '代码', width: 80, showTip: true, tipWidth: 100, tipPosition: "top" }
  ]],
  columns: [[
    { field: 'name', title: '描述', width: 60, showTipFormatter: function (row, rowIndex) {
        return "代码：" + row['code'] + "<br>描述：" + row['name'];
      } },
    { field: 'price', title: '价格', width: 60, align: 'right' },
    { field: 'desc', title: '说明', width: 300, showTip: true, tipWidth: 450, tipTrackMouse: true }
  ]],
  onLoadSuccess: function (data) { /* ... */ },
  onColumnsLoad: function (cm) {   // className/queryName 方式有效
    for (var i = 0; i < cm.length; i++) {
      if (cm[i]['field'] == "TStDate") {
        cm[i].formatter = function (val, row, index) { return "日期" + val; };
        cm[i].styler = function (val, row, index) { return 'color:red;'; };
      }
    }
  }
});
```

M 中通过 className/queryName 自动生成列（免写 columns）：

```javascript
$("#querydg").datagrid({
  className: "web.Test",
  queryName: "LookUp",
  url: $URL + "?ClassName=web.Test&QueryName=LookUp&...",
  defaultsColumns: [
    { field: "TID", hidden: true },
    { field: 'TDisableLogon', width: 60,
      formatter: function (val, row, index) { return val == 1 ? "禁用" : "可用"; },
      editor: { type: 'checkbox', options: { on: 1, off: 0 } } },
    { field: 'TDisableLogonDate', width: 150, editor: { type: 'dateboxq' } }
  ]
});
```

---

### 滚动加载（datagrid + scroll）

**用途**：不使用翻页条、且数据量很大时，滚动到可视区域才渲染对应行，提升大数据量体验。需额外引入滚动视图插件。

**引入方式**：
- 在引入 hisui 之后引入插件：`<script type="text/javascript" src="../../dist/plugin/datagrid-scrollview.js"></script>`
- 用法与普通 datagrid 一致，再配合 `detailFormatter` 定义行展开格式。

#### 属性

| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| detailFormatter | function | null | 定义格式显示行数据的函数，`function(rowIndex, rowData){ return html; }` |

#### 事件

> 滚动加载本身未在文档中单列新事件，复用标准 datagrid 事件（如 `onLoadSuccess`、`onClickRow` 等）。

#### 方法

> 复用标准 datagrid 方法，本地数据通过 `loadData(rows)` 一次加载全部再按需渲染；远程数据滚动时按页加载。

#### 示例

本地数据（一次加载所有，滚动时渲染可视行）：

```javascript
$.parser.onComplete = function(){
  var rows = [];
  for (var i = 1; i <= 8000; i++) {
    rows.push({ no: i, name: '姓名'+i, loc: '内三科', diag: 'diag'+i, code: 'ABC'+i, stdate: '2020-01-01' });
  }
  $("#dg").datagrid('loadData', rows);
};

$('#dg').datagrid({
  detailFormatter: function (rowIndex, rowData) {
    return '<div>姓名: ' + rowData.name + '<br>科室: ' + rowData.loc +
           '<br>就诊日期: ' + rowData.stdate + '<br>序号: ' + rowData.no + '</div>';
  }
});
```

远程数据（滚动时一次加载一页）：

```javascript
$(function(){
  $('#dg1').datagrid({
    url: 'getpatdata.jsp',
    detailFormatter: function (rowIndex, rowData) {
      return '<div>姓名: ' + rowData.name + '<br>科室: ' + rowData.loc +
             '<br>就诊日期: ' + rowData.stdate + '<br>序号: ' + rowData.no + '</div>';
    }
  });
});
// 后台返回 {total:8000, rows:[...]}，滚动到底部自动请求下一页
```

---

### 行编辑（datagrid edit）

**用途**：在 datagrid 行内进行编辑，支持 text、textarea、checkbox、numberbox、validatebox、datebox、datetimebox、combobox、combotree、combogrid、icheckbox、linkbutton、switchbox、timespinner 等编辑器类型，以及自定义编辑器。

**引入方式**：直接对 datagrid 使用 `beginEdit`/`endEdit` 等编辑方法即可（编辑能力内置于 datagrid），列须通过 `editor` 配置编辑类型。

#### 列编辑类型（editor.type）

| 编辑类型 | 说明 | 显示 / 返回 |
|---|---|---|
| text | 解析成原生 input | — |
| textarea | 解析成原生 textarea | — |
| checkbox | 解析成原生 checkbox | — |
| numberbox | 解析成 numberbox | — |
| validatebox | 解析成 validatebox | — |
| datebox | 解析成 datebox 组件 | — |
| datetimebox | 解析成 datetimebox | — |
| combobox | 解析成 combobox | — |
| combotree | 解析成 combotree | — |
| combogrid | 解析成 combogrid | — |
| icheckbox | 解析成 checkbox 组件（非原生） | 显示 `on`/`off`，返回 `on`/`off` |
| linkbutton | 解析成 linkbutton 组件 | — |
| switchbox | 解析成 switchbox 组件 | 默认显示 `开`/`关`，返回 `onText`/`offText` |
| timespinner | 解析成 timespinner 组件 | — |
| dateboxq / timeboxq | 文档示例中出现的扩展类型（如 `editor:{type:'dateboxq'}`） | — |

> 列上配置编辑：`editor:{type:'text'}`、`editor:{type:'validatebox',options:{required:true}}`、`editor:{type:'checkbox',options:{on:1,off:0}}`。

#### 事件

> 文档示例采用 `onClickRow(index)` 进入编辑；标准编辑事件（`onBeforeEdit`/`onBeginEdit`/`onAfterEdit`/`onEndEdit`/`onCancelEdit`）遵循 EasyUI datagrid 编辑 API，本文档未单列参数表。

#### 方法（文档示例用法）

| 方法名 | 参数 | 说明 |
|---|---|---|
| beginEdit | index | 开始编辑指定行：`$('#dg').datagrid('beginEdit', index)` |
| endEdit | index | 结束编辑并写回该行数据 |
| validateRow | index | 校验该行，返回 boolean，保存前调用 |
| getEditor | {index, field} | 获取单元格编辑器，如 `getEditor({index:editIndex,field:'feetypeid'})`，用 `$(ed.target).combobox('getText')` 取显示值 |
| selectRow | index | 选中指定行（常与 beginEdit 链式调用） |
| getRows | — | 返回当前页所有行，如 `getRows()[editIndex]` 取某行 |
| getRowIndex | row | 根据行数据取索引 |
| getSelected | — | 返回选中行 |
| deleteRow | index | 删除指定行 |
| getEditingIndex | — | 获取当前编辑行索引（主文档方法表） |
| cancelEdit / insertRow / getChanges | index / 等 | 标准编辑方法，遵循 EasyUI datagrid 编辑 API |

#### 示例

典型「点击行进入编辑、离开保存」模式：

```javascript
var editIndex = undefined;
var modifyBeforeRow = {}, modifyAfterRow = {};

function endEditing() {
  if (editIndex == undefined) return true;
  if ($('#dg').datagrid('validateRow', editIndex)) {
    // 下拉框回写显示名
    var ed = $('#dg').datagrid('getEditor', { index: editIndex, field: 'feetypeid' });
    var feetypename = $(ed.target).combobox('getText');
    $('#dg').datagrid('getRows')[editIndex]['feetypename'] = feetypename;
    $('#dg').datagrid('endEdit', editIndex);
    modifyAfterRow = $('#dg').datagrid('getRows')[editIndex];
    editIndex = undefined;
    return true;
  } else {
    return false;
  }
}

function onClickRow(index) {
  if (editIndex != index) {
    if (endEditing()) {
      $('#dg').datagrid('selectRow', index).datagrid('beginEdit', index);
      editIndex = index;
      modifyBeforeRow = $.extend({}, $('#dg').datagrid('getRows')[editIndex]);
    } else {
      $('#dg').datagrid('selectRow', editIndex);
    }
  }
}

$('#dg').datagrid({
  url: 'data.csp',
  onClickRow: onClickRow,
  columns: [[
    { field: 'patid', title: '病人Id', width: 80 },
    { field: 'feetypeid', title: '费用类型', width: 120,
      editor: { type: 'combobox', options: { url: 'feetype.csp', valueField: 'feetypeid', textField: 'feetypename' } } },
    { field: 'feeprice', title: '价格', width: 80, editor: { type: 'numberbox' } },
    { field: 'active', title: '激活', width: 60, editor: { type: 'checkbox' } }
  ]]
});
```

自定义编辑器（扩展 `$.fn.datagrid.defaults.editors`）：

```javascript
$.extend($.fn.datagrid.defaults.editors, {
  mybtns: {
    init: function (container, options) {
      var opt = $.extend({ on: 'on', off: 'off' }, options);
      var el = $("<div></div>").appendTo(container);
      el.data("opt", opt);
      return el;
    },
    getValue: function (el) { /* 取各 checkbox 状态，返回 "id^label^1#..." */ },
    setValue: function (el, val) { /* 按 "id^label^checked#..." 还原 */ }
  }
});
// 列配置：editor:{type:'mybtns'}
```

---

### 单元格编辑（datagrid celledit）

**用途**：基于 EasyUI cellediting 组件，支持在任意单元格直接编辑（而非整行编辑），适合体温单等逐格录入场景。

**引入方式**：对普通 datagrid 调用 `enableCellEditing()` 开启，再用 `gotoCell()` 定位编辑单元格。

#### 方法

| 方法名 | 参数 | 说明 |
|---|---|---|
| enableCellEditing | — | 开启单元格编辑模式 |
| gotoCell | {index, field} | 定位到指定单元格并进入编辑，如 `{index:0, field:'temperature'}` |

#### 事件

| 事件名 | 参数 | 说明 |
|---|---|---|
| onCellEnterHandler | index, field | 编辑框中回车事件（20200908） |

#### 单元格编辑类型

| 编辑类型 | 说明 |
|---|---|
| celltextarea | 解析成 textarea，编辑时自适应内容高度，宽度与列同宽（2020-12-03） |

> 标准单元格编辑还支持 `clickCell`/`editCell` 等事件（遵循 EasyUI cellediting API）。

#### 示例

```javascript
var data = {"total": 28, "rows": [
  {"no": 1, "opdate": "2020-09-06", "temperature": 38.8, "pulse": 60,
   "heartbeat": 68, "breath": 25, "bloodpress": 120, "status": "Y", "note": "abcd"},
  {"no": 2, "opdate": "2020-09-07", "temperature": 37.5, "pulse": 66,
   "heartbeat": 78, "breath": 24, "bloodpress": 110, "status": "Y", "note": "abcd"}
  /* ... */
]};

$(function () {
  $('#dg').datagrid({ data: data })
    .datagrid('enableCellEditing')
    .datagrid('gotoCell', { index: 0, field: 'temperature' });
});

// 监听回车
$('#dg').datagrid({
  onCellEnterHandler: function (index, field) {
    console.log('单元格回车：', index, field);
  }
});
```

---

# 六、树 · 窗口 · 极速系列
> 说明：本手册提炼自 HISUI 官网 API 文档。标注「继承」的属性/事件/方法未在本文档中逐项列出，请参考对应基础组件（DataGrid / Tree / Combo / Validatebox）或 EasyUI 同名组件。文档未提及的内容不臆造。

---

### treegrid（树形网格）

**用途**：在 DataGrid 基础上支持行之间的父/子节点关系，需指定 `treeField` 指明树节点字段。
**引入方式**：

```html
<table class="hisui-treegrid" id="treegrid2" data-options="idField:'id',treeField:'menuName',checkbox:true,...">
  <thead><tr>
    <th field="menuName" width="160">菜单名</th>
    <th field="menuLink" width="100">链接</th>
  </tr></thead>
</table>
```

```js
var treegridObj = $HUI.treegrid("#treegrid2", {
  onCheckNode: function(row, checked){ /* ... */ },
  onBeforeCheckNode: function(row, checked){ /* ... */ }
});
treegridObj.loadData({ total: 19, rows: [ /* 含 _parentId 字段表示父子关系 */ ] });
```

> 数据约定：父节点通过子行的 `_parentId` 字段关联（值等于父行的 `id`）。其余属性/事件/方法（如 `idField`、`treeField`、`rownumbers`、`checkbox`、`toolbar`、`getCheckedNodes` 等）继承 DataGrid 与 1.5 版 treegrid。

#### 属性（HISUI 1.3.6 树组件扩展）
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| checkbox | boolean | false | 可勾选树（从 1.5 代码修改） |

#### 事件（HISUI 1.3.6 树组件扩展）
| 事件名 | 参数 | 说明 |
|---|---|---|
| onCheckNode | row, checked | 勾选后触发 |
| onBeforeCheckNode | row, checked | 勾选前触发，返回 false 可取消动作 |

#### 方法（HISUI 1.3.6 树组件扩展）
| 方法名 | 参数 | 说明 |
|---|---|---|
| getCheckedNodes | checked | 获得所有选中节点 |
| uncheckNode | id | 取消选中指定节点 |
| checkNode | id | 选中指定节点 |

#### 示例
```html
<table title="菜单管理" class="hisui-treegrid" id="treegrid2"
  data-options="fit:true,idField:'id',treeField:'menuName',checkbox:true,rownumbers:true">
  <thead><tr>
    <th field="menuName" width="160">菜单名</th>
    <th field="menuLink" width="100">链接</th>
  </tr></thead>
</table>
```
```js
var tg = $HUI.treegrid("#treegrid2", {});
tg.loadData({ total: 2, rows: [
  {"id":1,"menuName":"配置管理","menuLink":"cfgmgr.csp"},
  {"id":11,"menuName":"菜单管理","menuLink":"menumgr.csp","_parentId":1}
]});
// 选中 / 取消选中
$('#treegrid2').treegrid('checkNode', 1);
$('#treegrid2').treegrid('uncheckNode', 1);
var checked = $('#treegrid2').treegrid('getCheckedNodes', 'checked');
```

---

### tree（树）

**用途**：从 `<ul>` 标记或数据创建树形菜单，支持自定义节点 formatter、手风琴样式。
**引入方式**：

```html
<ul id="mytt" class="hisui-tree"></ul>
```
```js
$('#mytt').tree({
  data: [ /* {id,text,state,children,iconCls} */ ],
  lines: true,
  autoNodeHeight: true,
  onClick: function(node){ /* ... */ }
});
```

> 节点数据结构：`{id, text, state:'open'|'closed', children:[...], iconCls}`。示例中还用到 `toggle`、`find`、`getRoots`、`collapse` 等基础 tree 方法（继承 EasyUI tree）。

#### 属性（HISUI 扩展）
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| autoNodeHeight | boolean | false | 当 `lines:true` 且 `formatter` 返回的 html 高度不定时，须配置为 true 以自动计算线条高度 |

#### 事件
> 继承基础 tree（文档未单独列出新增事件）。示例用到 `onClick(node)`。

#### 方法
> 继承基础 tree（文档未单独列出新增方法）。常用：`find(id)`、`toggle(target)`、`getRoots()`、`collapse(target)`、`expand(target)`。

#### 示例
```js
$('#sptt').tree({
  data: [{ "id":1, "text":"病程记录", "state":"open",
    "children":[{ "id":11, "text":"Node 11" }] }],
  formatter: function(node){
    if (node.children) return node.text;
    return '<span class="icon-edit" data-id="'+node.id+'"></span>' + node.text;
  },
  lines: true, autoNodeHeight: true
});
// 监听右侧小图标点击
$('#sptt').on('click', '.icon-edit', function(){
  var node = $('#sptt').tree('find', $(this).data('id'));
  alert(node.text);
});
```

---

### menutree（菜单树）

**用途**：基于 tree 组件实现的菜单树，支持搜索、折叠、同级单展开等，适合做系统左侧导航菜单。
**引入方式**：

```html
<div id="menuTree" class="hisui-menutree"></div>
```
```js
$('#menuTree').menutree({
  url: 'getMenu',
  collapsible: true,
  searchable: true,
  onlyOneExpanded: true,
  onMenuClick: function(node){ /* ... */ }
});
// 或 $HUI.menutree('#menuTree', {...})
```

#### 属性
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| url | string | （空） | 获取远程数据的 URL |
| collapsible | boolean | false | 是否可向左折叠 |
| rootCollapsible | boolean | true | 根节点是否可折叠 |
| fit | boolean | false | 自适应父容器大小 |
| width | number/string | （空） | 宽度 |
| height | number/string | 'auto' | 高度 |
| title | string | '' | 标题，仅炫彩风格会显示 |
| onlyOneExpanded | boolean | true | 同级菜单是否只能展开一个 |
| searchable | boolean | true | 是否显示搜索框 |
| searchFields | string | '' | 除 text 字段外用于查询匹配的字段 |
| animate | boolean | true | 动画 |

#### 方法
| 方法名 | 参数 | 返回值 | 说明 |
|---|---|---|---|
| selectById | id | — | 根据 id 字段选择节点 |
| getTree | — | jq 对象 | 获取树的 jq 对象 |
| findNode | id | node 节点对象 | 根据 id 获取树节点 |

#### 事件
| 事件名 | 参数 | 说明 |
|---|---|---|
| onMenuClick | node（树的 node 节点对象） | 菜单点击事件 |
| onMenuGroupClick | node（树的 node 节点对象） | 菜单组点击事件 |
| onPanelCollapse | width（折叠后的宽度） | 向左折叠事件 |
| onPanelExpand | width（展开后的宽度） | 向右展开事件 |

#### 示例
```js
$('#menuTree').menutree({
  url: 'getMenuTree',
  collapsible: true,
  searchable: true,
  onlyOneExpanded: true,
  onMenuClick: function(node){
    console.log('点击菜单', node.id, node.text);
  }
});
// 根据 id 选中并定位
$('#menuTree').menutree('selectById', '12');
var node = $('#menuTree').menutree('findNode', '12');
```

---

### combogrid（下拉表格 / 组合网格）

**用途**：把可编辑文本框与下拉 DataGrid 面板结合，支持键盘导航快速查找选择。
**引入方式**：

```html
<select class="hisui-combogrid" id="combogrid" style="width:250px" data-options="
  panelWidth:500, idField:'itemid', textField:'productname',
  columns:[[ {field:'itemid',title:'Item ID',width:80}, {field:'productname',title:'Product',width:120} ]],
  fitColumns:true">
</select>
```
```js
var trObj = $HUI.combogrid("#combogrid");
var grid = trObj.grid();           // 获取内部 datagrid 对象
grid.datagrid("loadData", { total:5, rows:[ /* ... */ ] });
```

> 其余属性/方法（`idField`、`textField`、`columns`、`pagination`、`mode`、`delay` 等）继承 combogrid + datagrid。

#### 属性（HISUI 扩展）
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| enterNullValueClear | boolean | true | 当为 false 时，在输入框内回车，没有匹配值不清空输入框 |
| blurValidValue | boolean | false | 为 true 时，光标离开检查是否选中值，没选中则置空输入框的值（2018-12-26） |
| paginationNoWrap | boolean | false | 当为 true 时，保存翻页条不折行（2025-11-13） |

#### 事件 / 方法
> 继承基础 combogrid（文档未单独列出新增事件/方法）。可通过 `grid()` 获取内部 datagrid 进行操作。

#### 示例
```html
<select class="hisui-combogrid" id="combogrid" style="width:250px" data-options="
  panelWidth:500, idField:'itemid', textField:'productname',
  blurValidValue:true,
  columns:[[ {field:'itemid',title:'ID',width:80}, {field:'productname',title:'名称',width:120} ]],
  fitColumns:true"></select>
```
```js
$.parser.onComplete = function(cxt){
  if (cxt) return;
  var g = $HUI.combogrid("#combogrid").grid();
  g.datagrid("loadData", { total:2, rows:[
    {"itemid":"EST-1","productname":"Koi"},
    {"itemid":"EST-2","productname":"Dalmation"}
  ]});
};
```

---

### combotree（下拉树 / 组合树）

**用途**：把选择控件与下拉 tree 结合，支持带复选框的多选树。
**引入方式**：

```html
<input id="cbtree" class="hisui-combotree" placeholder="请点击下拉"/>
```
```js
var cbtree = $HUI.combotree('#cbtree', { editable: true });
cbtree.loadData([{
  id: 1, text: 'Languages',
  children: [ {id:11,text:'Java'}, {id:12,text:'C'} ]
}]);
```

> 数据格式同 tree（`{id, text, children}`）。属性/事件/方法继承 combobox + tree（文档未单独列出新增项）。多选需配合 tree 的 `checkbox` 相关配置。

#### 示例
```html
<input id="cbtree" class="hisui-combotree" style="width:200px"/>
```
```js
$HUI.combotree('#cbtree', { editable:true, multiple:true });
$('#cbtree').combotree('loadData', [{
  id:1, text:'Languages', children:[ {id:11,text:'Java'}, {id:12,text:'C++'} ]
}]);
```

---

### window（窗口）

**用途**：可拖拽、可伸缩的浮动窗口，默认带四个工具按钮。
**引入方式**：

```html
<div class="hisui-window" title="完成接诊" style="width:400px;height:200px;top:10px;left:500px;padding:10px"
  data-options="iconCls:'icon-w-save', resizable:true, modal:false, isTopZindex:true">
  我是一个Window窗口
</div>
```

> 默认四个工具：`collapsible`、`minimizable`、`maximizable`、`closable`。其余属性/事件/方法（如 `title`、`width`、`height`、`modal`、`resizable`、`iconCls`、以及 `open`/`close`/`resize` 等方法）继承基础 window。

#### 属性（HISUI 扩展）
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| isTopZindex | boolean | false | 是否覆盖控件界面。默认会被病历控件遮盖；true 时显示到最上层，但 DOM 会复杂些 |
| constrain | Boolean | false | 限制在容器内拖动。true 时拖动范围不超出容器，false 允许超出（20250721） |

#### 示例
```html
<div id="win1" class="hisui-window" title="提示" style="width:400px;height:200px"
  data-options="resizable:true, isTopZindex:true, constrain:true"></div>
```
```js
$('#win1').window('open');
$('#win1').window('close');
```

---

### dialog（模态窗 / 对话框）

**用途**：特殊的 window，可带顶部 toolbar 与底部 buttons，默认不可改变大小（设 `resizable:true` 可改）。
**引入方式**：

```html
<div id="dd2" class="hisui-dialog" title="完成接诊" style="width:400px;height:350px;padding:10px"
  data-options="iconCls:'icon-save', resizable:true, modal:true,
    toolbar:[{text:'修改',iconCls:'icon-write-order',handler:function(){alert('edit')}}],
    buttons:[{text:'保存',handler:function(){}},{text:'关闭',handler:function(){$HUI.dialog('#dd2').close();}}]">
  这是一个模态操作框
</div>
```
```js
function opennew(){
  $('#dd3').dialog({ title:'d3', width:400, height:200, top:150, left:220, closeKeyCode:113, content:'dd3' });
}
```

> 常用方法：`open`、`close`、`setTitle` 等继承 window；iframe 用法即把 `<iframe>` 写在 content 区域或用 `href` 加载远程页。

#### 属性（HISUI 扩展）
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| isTopZindex | boolean | false | 是否覆盖控件界面。默认会被病历控件遮盖；true 时显示到最上层，但 DOM 会复杂些 |
| closeKeyCode | Number | 不响应事件 | 弹出窗口后关闭快捷键。如 27 表示 Esc，113 表示 F2（20230728） |

#### iframe 用法示例
```html
<div id="dlgIframe" class="hisui-dialog" title="详情" style="width:800px;height:500px"
  data-options="modal:true, resizable:true, closed:true"></div>
```
```js
$('#dlgIframe').dialog('open').dialog('refresh', 'detail.csp?id=123');
// 或在 content 中直接放 iframe：
// <iframe src="detail.csp?id=123" style="width:100%;height:100%;border:0"></iframe>
// 关闭：$HUI.dialog('#dlgIframe').close();
```

---

### messager（消息框）

**用途**：提供 alert / confirm / prompt / progress / show / popover 等异步消息框，全部异步，回调中处理交互结果。
**引入方式**：纯函数式调用 `$.messager.*`（无需 HTML 容器）。

#### 函数
| 函数 | 参数 | 说明 |
|---|---|---|
| $.messager.alert | (title, msg, icon) 或 ({width,icon,title,msg,fn}) | 警示框。icon 可选 info/success/error/warning |
| $.messager.confirm | (title, msg, fn(r)) | 确认框。fn 的 r 为 true/false |
| $.messager.confirm3 | (title, msg, fun(r)) | 三选提示（2022-02-23）。r：第一个按钮 ok→true，第二个 no→false，第三个 cancel→undefined |
| $.messager.prompt | (title, msg, fn(r)) | 输入提示框。r 为输入值，取消或空返回 falsy |
| $.messager.progress | ({title,msg,text}) 或 "close" | 进度框；关闭用 `$.messager.progress("close")` |
| $.messager.show | ({title,msg,timeout,showType}) | 右下角自动消失提示 |
| $.messager.popover | ({msg,type,timeout,showSpeed,showType,style}) | 轻量级气泡提示（详见下表） |
| $.messager.alertSrcMsg / confirmSrcMsg / promptSrcMsg / popoverSrcMsg | 同对应方法 | 与上述同名方法一致，但**不自动翻译** msg 入参内容（20230601 增加） |

> 修改按钮文字：`$.messager.defaults.ok` / `.cancel` / `.no`（建议在回调内恢复）。

#### popover 配置项
| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| msg | string | '' | 提示内容 |
| type | string | 'error' | 提示样式，可选 'success'、'info'、'alert'、'error' |
| timeout | number | 3000 | 显示时长（毫秒）；0 表示一直显示不消失 |
| showSpeed | string/number | 'fast' | 显示速度，可选 'fast'、'slow'、'normal' 或数字（毫秒） |
| showType | string | 'slide' | 显示方式，可选 'slide'、'fade'、'show' |
| style | object | 顶部中间 | 显示位置，可设 right/top/left/bottom |

#### confirm3 参数说明
| 入参 | 说明 |
|---|---|
| title | 第一个入参：提示标题 |
| msg | 第二个入参：提示内容 |
| fun | 第三个入参：点击按钮后的回调函数 `function(r){ /* ok→true, no→false, cancel→undefined */ }` |

#### 示例
```js
// alert
$.messager.alert("简单提示", "请求超出预计时间", 'info');

// confirm（修改按钮文字）
var oldOk = $.messager.defaults.ok, oldCancel = $.messager.defaults.cancel;
$.messager.defaults.ok = "同意"; $.messager.defaults.cancel = "拒绝";
$.messager.confirm("删除", "确定提交并保存?", function(r){
  if (r) $.messager.popover({ msg:"点击了确定", type:'info' });
  $.messager.defaults.ok = oldOk; $.messager.defaults.cancel = oldCancel;
});

// confirm3 三选
$.messager.confirm3("提示", "病历内容有修改,你确定保存吗?", function(r){
  if (true===r) $.messager.popover({msg:"保存病历",type:'info'});
  else if (false===r) $.messager.popover({msg:"不保存病历",type:'info'});
  else $.messager.popover({msg:"取消"});
});

// prompt
$.messager.prompt("提示", "修改前请签名：", function(r){
  if (r) $.messager.popover({ msg:"你的签名是："+r, type:'info' });
});

// progress
$.messager.progress({ title:"提示", msg:"正在导入数据", text:"导入中...." });
setTimeout('$.messager.progress("close");', 4000);

// popover 轻提示
$.messager.popover({ msg:"保存成功！", type:"success", timeout:2000, showType:"slide" });
```

---

### lookup（放大镜 / 组合查询）

**用途**：HISUI 核心特色组件，继承 comboq 与 datagrid，把输入查询与下拉表格结合；首次不初始化列表，全局只保留一个下拉列表（只保留当前激活数据），在 IE8/IE11 下速度大幅提升。
**引入方式**：

```html
<input id="group" class="hisui-lookup" style="width:200px"/>
```
```js
$("#group").lookup({
  width: 200,
  panelWidth: 746,
  url: 'getGroup',
  mode: 'remote',
  idField: 'HIDDEN',
  textField: 'Description',
  columns: [[
    {field:'Description', title:'安全组名称', width:200},
    {field:'HIDDEN', title:'安全组ID', width:100}
  ]],
  pagination: true,
  onSelect: function(index, rowData){ console.log(index, rowData); }
});
```

> 数据格式：远程 `mode:'remote'` 时，把输入框值作为名为 `q` 的 HTTP 参数发到 `url`；行对象含 `idField`（如 `HIDDEN`）、`textField`（如 `Description`）、`Code` 等业务字段。本地模式 `mode:'local'` 用 `data:[...]` + `filter(q,row)` 过滤。与 datagrid 配合通过 `grid()` 获取内部表格；`columnsLoader` 返回列定义（函数式，便于动态列）。

#### 属性（扩展自 validatebox 与 datagrid）
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| loadMsg | string | null | 当 datagrid 加载远程数据时显示的消息 |
| idField | string | null | id 的字段名（选中后记录的值字段） |
| textField | string | null | 显示在文本框中的 text 字段名 |
| mode | string | 'remote' | 文本改变时如何加载数据。'remote' 时输入值作为 `q` 参数发送；'local' 时本地过滤 |
| filter | function(q, row) | — | 当 `mode:'local'` 时选择本地数据，返回 true 则选择该行 |
| width | number/string | 'auto' | 组件宽度 |
| panelWidth | number | null | 下拉面板宽度 |
| panelHeight | number | 200 | 下拉面板高度 |
| selectOnNavigation | boolean | false | 当通过键盘导航项目时是否选择项目 |
| editable | boolean | true | 用户是否可直接往文本域输入文字 |
| disabled | boolean | false | 是否禁用 |
| readonly | boolean | false | 是否只读 |
| hasDownArrow | boolean | true | 是否有下拉按钮 |
| delay | number | 200 | 从最后一个键输入事件起，延迟进行搜索（毫秒） |
| isCombo | boolean | false | 是否输入字符即触发事件进行搜索 |
| minQueryLen | number | 0 | `isCombo:true` 时可搜索要求的最小字符长度 |
| queryOnSameQueryString | boolean | true | 查询条件与上一次一致时，回车或点下拉按钮是否重新搜索 |
| columnsLoader | function | null | 函数类型，返回 columns（见示例三） |
| enableNumberEvent | boolean | false | 是否开启数字选行功能（在 `isCombo:true` 时生效，2020-02-14） |
| forceFocus | boolean | true | 加载数据后光标是否回到放大镜输入框（2020-06-22，便于使用 toolbar） |
| singleRequest | boolean | true | 是否只保留最后一个请求（2021-11-10） |
| panelHeightFix | boolean | false | 是否自适应高度（可见区域内最大化显示）。配置 `selectRowRender` 时自动为 true |
| panelMaxHeight | number | 500 | 自适应高度时的最大高度 |
| panelMinHeight | number | 160 | 自适应高度时的最小高度 |
| rowSummaryHeight | number | 0 | 行提示区域高度。为 0 时区域高度为第一次提示信息区域高度（20230705） |

#### 事件
| 事件名 | 参数 | 说明 |
|---|---|---|
| onBeforeShowPanel | null | 下拉面板展开前触发，返回 false 则阻止展开 |
| onShowPanel | null | 当下拉面板显示时触发 |
| onHidePanel | null | 隐藏时触发 |
| selectRowRender | row（当前行数据） | 高亮一行时调用，返回提示内容的 html（复现原 extjs 的 lookup 行提示） |

#### 方法
| 方法名 | 参数 | 返回值 | 说明 |
|---|---|---|---|
| options | — | 配置对象 | 拿到配置项对象 |
| grid | — | jquery 对象 | 返回内部 datagrid 对象（注意：所有 lookup 共用一个 grid，获取的未必对应此 lookup） |
| setText | text | jquery 对象 | 设置文本框的值 |
| getText | — | — | 获取输入框的文本 |
| setValue | text | — | 设置放大镜的值，只设值不校验（选中行后组件用此方法记录 idField 值，2020-02-12） |
| getValue | — | — | 获得放大镜的值（2020-02-12） |
| clear | — | jquery 对象 | 清空组件值 |
| reset | — | jquery 对象 | 重置组件的值 |
| resize | width | jquery 对象 | 调整组件宽度 |
| showPanel | — | jquery 对象 | 显示面板 |
| hidePanel | — | jquery 对象 | 隐藏面板 |
| disable | — | jquery 对象 | 禁用组件 |
| enable | — | jquery 对象 | 启用组件 |
| readonly | mode(true\|false) | jquery 对象 | 启用/禁用只读模式 |
| isValid | — | true\|false | 返回验证结果 |
| fixPanelTLWH | 无 | 无 | 重计算弹出框位置及大小（继承自 comboq，2020-02-12） |

#### 典型用法示例
```html
<input id="loc" class="hisui-lookup" style="width:200px"/>
<button class="op-btn">禁用</button><button class="op-btn">启用</button>
```
```js
// 1) 远程模式 + 本地列定义
$("#loc").lookup({
  width:200, panelWidth:446, url:'getLoc', mode:'remote',
  idField:'HIDDEN', textField:'Description',
  columns:[[ {field:'Code',title:'科室代码',width:150},
             {field:'Description',title:'科室描述',width:200},
             {field:'HIDDEN',title:'科室ID',width:50} ]],
  pagination:true, isCombo:true, enableNumberEvent:true, minQueryLen:1,
  onSelect:function(index,rowData){ console.log(index,rowData); }
});

// 2) 本地数据
$("#group-local").lookup({
  width:200, panelWidth:800, mode:'local',
  data:[ {Description:'住院医师',HIDDEN:'1'}, {Description:'门诊医师',HIDDEN:'2'} ],
  idField:'HIDDEN', textField:'Description',
  columns:[[ {field:'Description',title:'名称',width:200}, {field:'HIDDEN',title:'ID',width:100} ]],
  isCombo:true, pagination:true
});

// 3) 动态列（columnsLoader）
$("#user").lookup({
  url:'getUser', mode:'remote', idField:'HIDDEN', textField:'Description',
  columnsLoader:function(){ return [[
    {field:'Code',title:'工号',width:150},
    {field:'Description',title:'姓名',width:150},
    {field:'HIDDEN',title:'用户ID',width:100} ]]; },
  pagination:true, panelWidth:446
});

// 4) 禁用/启用/只读
$('.op-btn').linkbutton({ onClick:function(){
  if ($(this).text()=="禁用") $("#loc").lookup("disable");
  if ($(this).text()=="启用") $("#loc").lookup("enable");
  if ($(this).text()=="只读") $("#loc").lookup("readonly",true);
  if ($(this).text()=="取消只读") $("#loc").lookup("readonly",false);
}});

// 5) 阻止展开 + 行提示
$("#group2").lookup({
  url:'getGroup', mode:'remote', idField:'HIDDEN', textField:'Description',
  onBeforeShowPanel:function(){ if ($(this).val()=="ad") return false; },
  selectRowRender:function(row){
    if (!row) return '无提示信息';
    if (row.Description.length>10) return '安全组'+row.Description+'，字符超过10';
    return '无提示信息';
  }
});
```

---

### dateboxq（快速日期框）

**用途**：继承 comboq / datebox，初始化时不初始化日历，按钮实现不同，IE8/IE11 下速度大幅提升；支持 `t+2`（两天后）、`t-2`（两天前）快捷输入。
**引入方式**：

```html
<input id="db" class="hisui-dateboxq" style="width:160px"/>
```
```js
$('#db').dateboxq({
  validParams: 'YMD',
  minDate: '2019-11-25', maxDate: '2020-12-31',
  format: 'yyyy-MM-dd',
  onSelect: function(date){ /* ... */ },
  onChange: function(newVal, oldValue){ /* ... */ }
});
```

#### 属性
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| validParams | string | 'YMD' | 日期显示成 YYYY-MM-DD；其它格式不强制检查（如配成 'YM' 再实现 formatter 可做年月选择） |
| minDate | string | null | 可选最小日期，如 '2019-11-25' |
| maxDate | string | null | 可选最大日期，如 '2019-11-25' |
| format | string | '' | 日期格式（yyyy-MM-dd、dd/MM/yyyy、yyyy年MM月dd日）。空时走 formatter；非空时强制覆盖 formatter（2020-12-31） |
| options | — | null | 获得配置项目 |

#### 方法
| 方法名 | 参数 | 说明 |
|---|---|---|
| setValue | value | 设置日期框值（如 "yyyy-MM-dd"） |
| getValue | — | 获得日期值 |
| setDisabled | value | 禁用日期框。false 启用，true 禁用 |
| disable | 无 | 禁用日期框 |
| enable | 无 | 启用日期框 |

#### 事件
| 事件名 | 参数 | 说明 |
|---|---|---|
| onSelect | date | 选中日期时触发 |
| onChange | newVal, oldValue | 值变化时触发 |

#### 示例
```html
<input id="db" class="hisui-dateboxq" style="width:160px"/>
```
```js
$('#db').dateboxq({ format:'yyyy-MM-dd', validParams:'YMD', onSelect:function(d){ $('#result').text(d); } });
$('#db').dateboxq('setValue', '2024-01-15');
var v = $('#db').dateboxq('getValue');
// 快捷输入：在框内输入 t+2 / t-2 即可表示相对今天
```

---

### timeboxq（快速时间框）

**用途**：继承 validatebox，简洁时间框，支持数字输入及 `n` 输入，光标离开时自动转换成要求格式（11→11:00:00，118→11:08:00，n+15→15 分钟后，n-15→15 分钟前）。
**引入方式**：

```html
<input id="tb" class="hisui-timeboxq" style="width:120px"/>
```
```js
$("#tb").timeboxq({
  timeFormat: "HMS",
  minTime: "8:30", maxTime: "17:30",
  onChange: function(newTime, oldTime){ /* ... */ }
});
```

#### 属性
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| timeFormat | string | 'HMS' | 显示成 HH:MM:SS；可设 'HM'；其它格式重写 formatter 实现 |
| minTime | string | '00:00:00' | 最小时间，如 '8:30' |
| maxTime | string | '23:59:59' | 最大时间，如 '17:30' |

#### 事件
| 事件名 | 参数 | 说明 |
|---|---|---|
| onChange | newTime, oldTime | 值变化后调用 |

#### 示例
```html
<input id="exeTime" class="hisui-timeboxq" style="width:120px"/>
```
```js
$.parser.onComplete = function(){
  var opt = $('#exeTime').timeboxq('options');
  var target = document.getElementById('exeTime');
  $("#af15").html(opt.formatter.call(target, opt.parser.call(target, "n+15")));
  $("#bf15").html(opt.formatter.call(target, opt.parser.call(target, "n-15")));
  $("#exeTime").timeboxq({
    onChange:function(n,o){ console.log("new="+n+",old="+o); },
    validType:["TimeG['endtb']"]
  });
};
// 动态设置可选范围
$("#setTimeDisBtn").click(function(){
  var opt = $("#tb2").timeboxq('options');
  var t = document.getElementById('tb2');
  opt.minTime = opt.formatter.call(t, opt.parser.call(t, "9:00"));
  opt.maxTime = opt.formatter.call(t, opt.parser.call(t, "21:00"));
});
```

---

### datetimeboxq（快速日期时间框）

**用途**：继承 dateboxq，初始化时不初始化日历，IE8/IE11 下速度大幅提升，兼具日期与时间选择。
**引入方式**：

```html
<input id="dtbq1" class="hisui-datetimeboxq" style="width:200px"/>
```
```js
$('#dtbq1').datetimeboxq({
  showSeconds: true,
  minDate: '2019-11-25', maxDate: '2020-12-31',
  onSelect: function(date){ /* ... */ },
  onHidePanel: function(){ /* ... */ }
});
```

> 继承 dateboxq 的属性（`minDate`、`maxDate`、`options`）与方法（`setValue`、`getValue`、`setDisabled`）。

#### 属性
| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| showSeconds | boolean | true | 是否显示到秒 |
| minDate | string | null | 可选最小日期，如 '2019-11-25' |
| maxDate | string | null | 可选最大日期，如 '2019-11-25' |
| options | — | null | 获得配置项目 |

#### 方法
| 方法名 | 参数 | 说明 |
|---|---|---|
| setValue | value | 设置日期时间 |
| getValue | — | 获得日期时间 |
| setDisabled | value | 禁用日期框。false 启用，true 禁用 |

#### 事件
| 事件名 | 参数 | 说明 |
|---|---|---|
| onHidePanel | — | 隐藏面板时触发 |
| onSelect | date | 选中日期时触发 |

#### 示例
```html
<input id="dtbq1" class="hisui-datetimeboxq" style="width:200px"/>
```
```js
$('#dtbq1').datetimeboxq({ showSeconds:true, format:'yyyy-MM-dd HH:mm:ss',
  onSelect:function(d){ $('#result').text(d); } });
$('#dtbq1').datetimeboxq('setValue', '2024-01-15 14:30:00');
var v = $('#dtbq1').datetimeboxq('getValue');
```
