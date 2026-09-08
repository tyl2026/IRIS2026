/**
 * DHCExcelExport — Excel(.xls) 导出通用组件（标准组件库：HISUI-新建/通用组件库）
 *
 * 功能：将二维数据 / datagrid 表格导出为 .xls 文件（Excel HTML 表格，Excel 双击直接打开）。
 *       UTF-8 BOM 保证中文不乱码；追溯码等长数字自动按文本处理，不转科学计数法、不丢精度。
 *
 * 使用方法：
 *   1. 部署：本文件放到 csp/scripts_lib/DHCExcelExport.js
 *   2. 页面引入（在业务 JS 之前）：
 *      <script type="text/javascript" src="../scripts_lib/DHCExcelExport.js"></script>
 *   3a. 导出 datagrid 当前查询的全部行（不受分页影响）：
 *      DHCExcelExport.exportDataGrid({
 *          gridId: 'gridXXX',   // 表格 id
 *          fileName: '追溯码台账查询_' + DHCExcelExport.timestamp(), // 可省扩展名，自动补 .xls
 *          columns: [{
 *              field: 'traceCode',   // 取行数据 row[field]
 *              title: '追溯码',
 *              text: true            // true=强制按文本；缺省时 ≥12 位纯数字自动按文本
 *          }, {
 *              title: '使用状态',     // 不配 field 时用 getValue 自定义取值
 *              getValue: function (row, index) { return row.usedQty > 0 ? '使用中' : '未使用'; }
 *          }]
 *      });
 *   3b. 导出任意数组（静态数据 / 前端组装结果）：
 *      DHCExcelExport.exportRows({
 *          fileName: '导出结果',
 *          columns: [{ field: 'name', title: '姓名' }],
 *          rows: [{ name: '张三' }]
 *      });
 *
 * 兼容性：IE11（msSaveBlob）/ Chrome / Firefox；无第三方依赖。
 */
var DHCExcelExport = (function () {
    // HTML 转义（表头/单元格）
    function esc(v) {
        if (v == null) { v = ''; }
        return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // 长数字（纯数字 >=12 位）易被 Excel 转科学计数法，默认按文本导出
    function isLongNumber(v) {
        return /^\d{12,}$/.test(String(v == null ? '' : v));
    }

    // 单元格 HTML；asText=true 时加 mso-number-format 强制按文本
    function cellHtml(v, asText) {
        v = esc(v);
        if (asText) {
            return '<td style="mso-number-format:\'\\@\'">' + v + '</td>';
        }
        return '<td>' + v + '</td>';
    }

    // 取单元格值：优先 col.getValue(row,index)，其次 row[col.field]
    function cellValue(col, row, index) {
        if (typeof col.getValue === 'function') {
            return col.getValue(row, index);
        }
        if ((col.field != null) && (row != null)) {
            return row[col.field];
        }
        return '';
    }

    // 生成 Excel HTML 表格
    function buildHtml(columns, rows) {
        var html = '<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"/></head><body><table border="1">';
        html += '<tr>';
        for (var h = 0; h < columns.length; h++) {
            html += '<th>' + esc(columns[h].title) + '</th>';
        }
        html += '</tr>';
        for (var i = 0; i < rows.length; i++) {
            html += '<tr>';
            for (var j = 0; j < columns.length; j++) {
                var col = columns[j];
                var v = cellValue(col, rows[i], i);
                var asText = (col.text === true) || ((col.text !== false) && isLongNumber(v));
                html += cellHtml(v, asText);
            }
            html += '</tr>';
        }
        html += '</table></body></html>';
        return html;
    }

    // 触发下载（.xls），IE11 走 msSaveBlob
    function download(fileName, content) {
        var blob = new Blob(['\ufeff' + content], { type: 'application/vnd.ms-excel;charset=utf-8' });
        if (!/\.xls$/i.test(fileName)) {
            fileName = fileName + '.xls';
        }
        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, fileName);
            return true;
        }
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return true;
    }

    // 提示（优先 $.messager，无 jQuery 时降级 alert）
    function tip(msg) {
        if (window.$ && window.$.messager) {
            $.messager.alert('提示', msg, 'warning');
        } else if (window.alert) {
            alert(msg);
        }
    }

    // 时间戳 yyyyMMdd_HHmmss，便于拼接文件名
    function timestamp() {
        var d = new Date();
        var p = function (n) { return (n < 10 ? '0' : '') + n; };
        return '' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '_' + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds());
    }

    // 导出任意二维数据
    function exportRows(opts) {
        opts = opts || {};
        var columns = opts.columns || [];
        var rows = opts.rows || [];
        if (!columns.length) {
            tip('未配置导出列(columns)');
            return false;
        }
        if (!rows.length) {
            tip('没有可导出的数据');
            return false;
        }
        return download(opts.fileName || ('导出数据_' + timestamp()), buildHtml(columns, rows));
    }

    // 导出 datagrid 全部行（自动取 getData().rows，不受分页影响）
    function exportDataGrid(opts) {
        opts = opts || {};
        var gridId = String(opts.gridId || '').replace(/^#/, '');
        if (!gridId) {
            tip('未指定数据表格 gridId');
            return false;
        }
        var $g = $('#' + gridId);
        if (!$g.length) {
            tip('找不到表格 #' + gridId);
            return false;
        }
        var data = $g.datagrid('getData');
        var rows = (data && data.rows) ? data.rows : [];
        return exportRows({
            fileName: opts.fileName,
            columns: opts.columns,
            rows: rows
        });
    }

    return {
        exportRows: exportRows,
        exportDataGrid: exportDataGrid,
        timestamp: timestamp
    };
})();
