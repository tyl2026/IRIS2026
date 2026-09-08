/**
 * DHCExcelImport — Excel 批量导入通用组件
 *
 * 使用方法：
 *   // 1. 页面引入
 *   <script src="../scripts_lib/DHCExcelImport.js"></script>
 *   // 2. 配置
 *   DHCExcelImport.config({
 *       templateUrl: '../../med/Results/Template/xxx.xlsx',
 *       previewCols: [[...]],
 *       backendClass: 'web.XXX',
 *       importMethod: 'ImportXXX',
 *       extraParams: { UserID: session['LOGON.USERID'] },
 *       onSuccess: function() { gridReload(); }
 *   });
 *   // 3. 触发
 *   DHCExcelImport.open();
 */
var DHCExcelImport = (function() {
    var _cfg = {
        templateUrl: '',
        previewCols: [],
        backendClass: '',
        importMethod: 'ImportData',
        extraParams: {},
        onSuccess: null
    };
    var _inited = false;

    function _initPreview() {
        if (_inited) return;
        $('#DHCExcelImportPreview').datagrid({
            columns: _cfg.previewCols,
            fitColumns: true, singleSelect: true,
            rownumbers: true, width: 840, height: 200
        });
        _inited = true;
    }

    return {
        /** 配置组件参数 */
        config: function(cfg) {
            _cfg = $.extend(_cfg, cfg);
        },

        /** 打开导入对话框 */
        open: function() {
            document.getElementById('DHCExcelImportFile').value = '';
            document.getElementById('DHCExcelImportFileName').innerHTML = '未选择文件';
            document.getElementById('DHCExcelImportTSV').value = '';
            document.getElementById('DHCExcelImportResult').style.display = 'none';
            $('#DHCExcelImportDialog').dialog('open');
            _initPreview();
            $('#DHCExcelImportPreview').datagrid('loadData', []);
        },

        /** 关闭对话框 */
        close: function() {
            $('#DHCExcelImportDialog').dialog('close');
        },

        /** 下载模板 */
        downloadTemplate: function() {
            window.open(_cfg.templateUrl);
        },

        /** 选择文件后解析预览 */
        handleFile: function(event) {
            var file = event.target.files[0];
            if (!file) return;
            document.getElementById('DHCExcelImportFileName').innerHTML = file.name;
            document.getElementById('DHCExcelImportResult').style.display = 'none';

            var reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    var wb = XLSX.read(new Uint8Array(evt.target.result), {type: 'array'});
                    var sheet = wb.Sheets[wb.SheetNames[0]];
                    var tsv = XLSX.utils.sheet_to_csv(sheet, {FS: '\t', RS: '\n', strip: true});
                    document.getElementById('DHCExcelImportTSV').value = tsv;

                    // 预览前3行
                    var lines = tsv.split('\n');
                    var previewRows = [];
                    var max = Math.min(3, lines.length - 1);
                    for (var i = 1; i <= max; i++) {
                        if (lines[i] && lines[i].trim() !== '') {
                            var cols = lines[i].split('\t');
                            var row = {};
                            var colDefs = _cfg.previewCols[0] || [];
                            for (var c = 0; c < Math.min(cols.length, colDefs.length); c++) {
                                row[colDefs[c].field] = cols[c] || '';
                            }
                            previewRows.push(row);
                        }
                    }
                    $('#DHCExcelImportPreview').datagrid('loadData', previewRows);

                    var totalRows = 0;
                    for (var j = 1; j < lines.length; j++) {
                        if (lines[j] && lines[j].trim() !== '') totalRows++;
                    }
                    $.messager.show({title:'提示', msg:'解析成功，共' + totalRows + '条记录'});

                } catch(err) {
                    $.messager.alert('错误', '文件解析失败: ' + (err.message || err), 'error');
                    document.getElementById('DHCExcelImportTSV').value = '';
                }
            };
            reader.onerror = function() { $.messager.alert('错误', '文件读取失败', 'error'); };
            reader.readAsArrayBuffer(file);
        },

        /** 执行导入 */
        doImport: function() {
            var tsv = document.getElementById('DHCExcelImportTSV').value;
            if (!tsv) {
                $.messager.alert('提示', '请先选择 Excel 文件', 'info');
                return;
            }
            $.messager.progress({title: '请稍等', msg: '正在导入...'});

            var params = $.extend({
                ClassName: _cfg.backendClass,
                MethodName: _cfg.importMethod,
                TSVContent: tsv,
                dataType: 'text'
            }, _cfg.extraParams);

            $.cm(params, function(resultText) {
                $.messager.progress('close');
                try {
                    var result = JSON.parse(resultText);
                    var summary = result.total == 0
                        ? '<span style="color:#d32f2f">导入失败：未读取到有效数据，请检查Excel文件</span>'
                        : '导入完成：成功 <b>' + result.success + '</b> 条，跳过 <b>' + result.skip + '</b> 条，共 <b>' + result.total + '</b> 条';
                    document.getElementById('DHCExcelImportSummary').innerHTML = summary;
                    document.getElementById('DHCExcelImportResult').style.display = 'block';

                    var errHtml = '<table class="tblList" style="width:100%;font-size:12px"><tr><th style="width:80px">行号</th><th>原因</th></tr>';
                    if (result.errors && result.errors.length > 0) {
                        for (var k = 0; k < result.errors.length; k++) {
                            errHtml += '<tr><td style="color:#d32f2f">' + result.errors[k].row + '</td><td>' + result.errors[k].reason + '</td></tr>';
                        }
                    } else if (result.total == 0) {
                        errHtml += '<tr><td colspan="2" style="color:#d32f2f;text-align:center">未读取到有效数据</td></tr>';
                    } else {
                        errHtml += '<tr><td colspan="2" style="color:#4CAF50;text-align:center">全部导入成功，无错误</td></tr>';
                    }
                    errHtml += '</table>';
                    document.getElementById('DHCExcelImportErrors').innerHTML = errHtml;

                    if (_cfg.onSuccess) _cfg.onSuccess(result);
                } catch(e) {
                    $.messager.alert('错误', '导入结果解析失败', 'error');
                }
            });
        }
    };
})();
