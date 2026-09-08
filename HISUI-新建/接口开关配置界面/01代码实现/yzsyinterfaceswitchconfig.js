﻿﻿﻿﻿﻿/**
 * 接口开关配置 — HISUI 前端逻辑
 * IE11 compatible — custom CSS toggle switches
 */
var gIfList = [];

/* ============================== AJAX ============================== */
function api(method, params, cb) {
    var data = { ClassName: 'web.YZSY.YZSYInterfaceSwitchManager', MethodName: method };
    for (var key in params) {
        if (params.hasOwnProperty(key)) { data[key] = params[key]; }
    }
    $m(data, function(txt) {
        var result = {};
        if (typeof txt === 'string') {
            try { result = JSON.parse(txt); } catch(e) { result = {}; }
        } else if (txt && typeof txt === 'object') {
            result = txt;
        }
        if (cb) { cb(result); }
    });
}

/* ============================== Toast ============================== */
function toast(msg, err) {
    var el = $('<div></div>').text(msg).css({
        position: 'fixed', top: '18px', left: '50%', transform: 'translateX(-50%)',
        background: err ? '#d44' : '#15428b', color: '#fff',
        padding: '10px 28px', borderRadius: '4px', fontSize: '14px',
        zIndex: 99999, boxShadow: '0 2px 12px rgba(0,0,0,0.18)'
    }).appendTo('body');
    el.fadeIn(200).delay(1600).fadeOut(400, function() { el.remove(); });
}

/* ============================== Load ============================== */
function loadAll() {
    api('GetAllInterfaces', {}, function(data) {
        gIfList = Array.isArray(data) ? data : (data.InterfaceCode ? [data] : []);
        renderAll(gIfList);
    });
}

function renderAll(list) {
    var h = '';
    for (var i = 0; i < list.length; i++) { h += buildPanelHTML(list[i]); }
    $('#paneList').html(h);
    for (var j = 0; j < list.length; j++) { initPanel(list[j]); }
}

/* ============================== Panel HTML ============================== */
function buildPanelHTML(iface) {
    var code = escHtml(iface.InterfaceCode);
    var name = escHtml(iface.InterfaceName);
    var on   = (iface.MasterSwitch === 'ON');
    var cls  = on ? '' : ' if-disabled';

    var h = '<div class="if-panel' + cls + '" id="panel-' + code + '">';
    h += '<div class="if-head">';
    h += '<div class="if-head-left">';
    h += '<span class="if-caret" id="crt-' + code + '" onclick="togglePanel(\'' + escQuote(code) + '\')">▼</span>';
    h += '<span class="if-title">' + name + '</span><span class="if-badge">' + code + '</span>';
    h += '</div>';
    h += '<div class="if-head-right">';
    h += '<span class="if-sw-label">总开关</span>';
    h += buildToggle('ms-' + code, on, 'toggleMaster(\'' + escQuote(code) + '\')');
    h += '<a class="if-link danger" onclick="confirmDelIf(\'' + escQuote(code) + '\',\'' + escQuote(name) + '\')">删除</a>';
    h += '</div></div>';
    h += '<div class="if-body" id="body-' + code + '">';
    h += '<table class="if-grid" id="grid-' + code + '"></table>';
    h += '<div class="if-foot"><a class="if-link" onclick="showAddNodeDlg(\'' + escQuote(code) + '\')">+ 新增节点</a></div>';
    h += '</div></div>';
    return h;
}

/* ============================== Toggle HTML ============================== */
function buildToggle(id, on, click) {
    var cls = 'if-toggle' + (on ? ' on' : '');
    return '<div class="' + cls + '" id="' + id + '" onclick="' + click + '"><span class="if-toggle-knob"></span></div>';
}

/* ============================== Panel Init ============================== */
function initPanel(iface) {
    var code = iface.InterfaceCode;
    initGrid(code, iface);
}

/* ============================== Grid ============================== */
function initGrid(ifCode, iface) {
    var sel  = '#grid-' + ifCode;
    var mOn  = (iface.MasterSwitch === 'ON');
    var nodes = iface.Nodes || [];
    var rows  = [];
    for (var i = 0; i < nodes.length; i++) {
        var nd = nodes[i];
        rows.push({ Code: nd.Code, Name: nd.Name, Switch: nd.Switch, Status: calcStatus(mOn, nd.Switch), MasterOn: mOn });
    }
    try { $(sel).datagrid('destroy'); } catch(e) {}

    var gridWidth = $('#panel-' + ifCode).width() || 800;
    $(sel).datagrid({
        data: { total: rows.length, rows: rows },
        width: gridWidth - 4,
        fitColumns: true, rownumbers: false, singleSelect: true,
        striped: true, pagination: false, nowrap: true,
        rowStyler: function(idx, row) {
            if (!row.MasterOn) return 'background:#f2f2f2;color:#aaa;';
            return '';
        },
        columns: [[
            { field: 'Name',   title: '节点名称 / 代码', width: 200,
              formatter: function(v, row) {
                  return '<span style="font-size:13px;">' + escHtml(row.Name) + '</span> <span class="if-badge">' + escHtml(row.Code) + '</span>';
              }
            },
            { field: 'Switch', title: '节点开关', width: 100,
              formatter: function(v, row) {
                  var on  = (v === 'ON');
                  var dis = row.MasterOn ? '' : ' dis';
                  var id  = 'ns-' + ifCode + '-' + row.Code;
                  var cls = 'if-toggle' + (on ? ' on' : '') + dis;
                  return '<div class="' + cls + '" id="' + id + '" data-if="' + ifCode + '" data-nd="' + row.Code + '" onclick="toggleNode(this)"><span class="if-toggle-knob"></span></div>';
              }
            },
            { field: 'Status', title: '状态', width: 60, align: 'center',
              formatter: function(v, row) {
                  if (!row.MasterOn) return '<span style="color:#e88800;">关*</span>';
                  return (v === '开') ? '<span style="color:#2a8;font-weight:bold;">开</span>' : '<span style="color:#999;">关</span>';
              }
            },
            { field: 'op', title: '操作', width: 50, align: 'center',
              formatter: function(v, row) {
                  return '<a class="if-link danger" onclick="confirmDelNode(\'' + escQuote(ifCode) + '\',\'' + escQuote(row.Code) + '\',\'' + escQuote(row.Name) + '\')">删除</a>';
              }
            }
        ]],
        onLoadSuccess: function() {}
    });
}

/* ============================== Toggle Actions ============================== */
function toggleMaster(ifCode) {
    var el = document.getElementById('ms-' + ifCode);
    if (!el || hasClass(el, 'dis')) return;
    var newOn = !hasClass(el, 'on');
    api('SetMasterSwitch', { interfaceCode: ifCode, value: newOn ? 'ON' : 'OFF' }, function(rs) {
        if (isOk(rs)) {
            setToggle(el, newOn);
            setPanelState(ifCode, newOn ? 'ON' : 'OFF');
            toast('总开关已' + (newOn ? '开启' : '关闭'));
        } else {
            toast(rs.msg || '操作失败', true);
            loadAll();
        }
    });
}

function toggleNode(el) {
    var $el = $(el);
    if ($el.hasClass('dis')) return;
    var ifc = $el.attr('data-if');
    var ndc = $el.attr('data-nd');
    var newOn = !$el.hasClass('on');
    api('SetNodeSwitch', { interfaceCode: ifc, nodeCode: ndc, value: newOn ? 'ON' : 'OFF' }, function(rs) {
        if (isOk(rs)) {
            setToggle(el, newOn);
            refreshGridRow(ifc, ndc);
            toast('节点已' + (newOn ? '开启' : '关闭'));
        } else {
            toast(rs.msg || '操作失败', true);
            refreshGridRow(ifc, ndc);
        }
    });
}

function setToggle(el, on) {
    if (!el) return;
    if (on) { addClass(el, 'on'); removeClass(el, 'off'); }
    else    { removeClass(el, 'on'); addClass(el, 'off'); }
}

/* ============================== Panel State ============================== */
function setPanelState(ifCode, mSwitch) {
    var panel = $('#panel-' + ifCode);
    if (mSwitch === 'ON') { panel.removeClass('if-disabled'); }
    else                  { panel.addClass('if-disabled'); }
    refreshGridData(ifCode);
}

function refreshGridData(ifCode) {
    api('GetAllInterfaces', {}, function(list) {
        var arr = Array.isArray(list) ? list : (list.InterfaceCode ? [list] : []);
        gIfList = arr;
        var data = null;
        for (var k = 0; k < arr.length; k++) {
            if (arr[k].InterfaceCode === ifCode) { data = arr[k]; break; }
        }
        if (!data) return;
        var mOn = (data.MasterSwitch === 'ON');
        var nodes = data.Nodes || [];
        var rows = [];
        for (var i = 0; i < nodes.length; i++) {
            var nd = nodes[i];
            rows.push({ Code: nd.Code, Name: nd.Name, Switch: nd.Switch, Status: calcStatus(mOn, nd.Switch), MasterOn: mOn });
        }
        try {
            var g = $('#grid-' + ifCode);
            g.datagrid({ data: { total: rows.length, rows: rows } });
            g.datagrid('resize');
        } catch(e) {}
    });
}

function refreshGridRow(ifCode, nodeCode) {
    api('GetSwitchStatus', { interfaceCode: ifCode, nodeCode: nodeCode }, function(data) {
        if (!data.InterfaceCode) return;
        var mOn = (data.MasterSwitch === 'ON');
        var grid = $('#grid-' + ifCode);
        try {
            var rows = grid.datagrid('getRows');
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].Code === nodeCode) {
                    rows[i].Switch = data.Switch;
                    rows[i].MasterOn = mOn;
                    rows[i].Status = calcStatus(mOn, data.Switch);
                    grid.datagrid('refreshRow', i);
                    break;
                }
            }
        } catch(e3) {}
    });
}

/* ============================== Panel Toggle ============================== */
function togglePanel(ifCode) {
    var body = $('#body-' + ifCode);
    var crt  = $('#crt-' + ifCode);
    if (body.is(':visible')) { body.slideUp(200); crt.text('▶'); }
    else                     { body.slideDown(200); crt.text('▼'); }
}

/* ============================== Dialogs ============================== */
function ensureDlgBox() {
    // always recreate a clean div; EasyUI destroy doesn't always fully clean up
    var old = document.getElementById('dlgBox');
    if (old && old.parentNode) { old.parentNode.removeChild(old); }
    $('<div id="dlgBox"></div>').appendTo('body');
}

function showAddDlg() {
    ensureDlgBox();
    var h = '<div class="dlg-inner">';
    h += '<div class="dl-row"><label>接口编码</label><input id="fCode" class="hisui-validatebox" placeholder="如 REG"></div>';
    h += '<div class="dl-row"><label>接口名称</label><input id="fName" class="hisui-validatebox" placeholder="如 挂号接口"></div></div>';
    $('#dlgBox').html(h);
    $('#dlgMode').val('interface'); $('#dlgIfCode').val('');
    $('#dlgBox').dialog({
        title: '新增接口', closed: false, modal: true, width: 420, top: 140,
        buttons: [{ text: '确定', iconCls: 'icon-ok', handler: submitDlg }, { text: '取消', handler: function() { $('#dlgBox').dialog('close'); } }]
    });
    setTimeout(function() { try { $('#fCode').focus(); } catch(e2) {} }, 200);
}

function showAddNodeDlg(ifCode) {
    ensureDlgBox();
    var h = '<div class="dlg-inner">';
    h += '<div class="dl-row"><label>节点编码</label><input id="fCode" class="hisui-validatebox" placeholder="如 REG_QUERY"></div>';
    h += '<div class="dl-row"><label>节点名称</label><input id="fName" class="hisui-validatebox" placeholder="如 挂号查询"></div></div>';
    $('#dlgBox').html(h);
    $('#dlgMode').val('node'); $('#dlgIfCode').val(ifCode);
    $('#dlgBox').dialog({
        title: '新增节点', closed: false, modal: true, width: 420, top: 140,
        buttons: [{ text: '确定', iconCls: 'icon-ok', handler: submitDlg }, { text: '取消', handler: function() { $('#dlgBox').dialog('close'); } }]
    });
    setTimeout(function() { try { $('#fCode').focus(); } catch(e2) {} }, 200);
}

function submitDlg() {
    var mode   = $('#dlgMode').val();
    var ifCode = $('#dlgIfCode').val();
    var code   = $.trim($('#fCode').val());
    var name   = $.trim($('#fName').val());
    if (!code) { toast('编码不能为空', true); return; }
    if (!name) { toast('名称不能为空', true); return; }
    if (code.indexOf('^') >= 0) { toast('编码不能含 ^', true); return; }
    if (mode === 'interface') {
        api('AddInterface', { interfaceCode: code, interfaceName: name }, function(rs) {
            if (isOk(rs)) {
                try { $('#dlgBox').dialog('close'); } catch(e) {}
                setTimeout(function() { loadAll(); }, 150);
                toast('添加成功');
            } else { toast(rs.msg || '添加失败', true); }
        });
    } else {
        api('AddNode', { interfaceCode: ifCode, nodeCode: code, nodeName: name }, function(rs) {
            if (isOk(rs)) {
                try { $('#dlgBox').dialog('close'); } catch(e) {}
                setTimeout(function() { loadAll(); }, 150);
                toast('添加成功');
            } else { toast(rs.msg || '添加失败', true); }
        });
    }
}

/* ============================== Delete ============================== */
var gDelFn = null;

function ensureCfmBox() {
    var old = document.getElementById('cfmBox');
    if (old && old.parentNode) { old.parentNode.removeChild(old); }
    $('<div id="cfmBox"></div>').appendTo('body');
}

function confirmDelIf(code, name) {
    ensureCfmBox();
    $('#cfmBox').html('<div class="dlg-cfm"><span class="dlg-cfm-icon">&#9888;</span><p class="dlg-cfm-msg">确定删除接口「' + name + '」及其下属所有节点？此操作不可恢复。</p></div>');
    gDelFn = function() {
        api('DeleteInterface', { interfaceCode: code }, function(rs) {
            if (isOk(rs)) { try { $('#panel-' + code).fadeOut(300, function() { $(this).remove(); }); } catch(e) {} setTimeout(function() { loadAll(); }, 150); toast('已删除: ' + name); }
            else { toast(rs.msg || '删除失败', true); }
        });
    };
    $('#cfmBox').dialog({
        title: '确认删除接口', closed: false, modal: true, width: 440, top: 180,
        buttons: [{ text: '确认删除', iconCls: 'icon-cancel', handler: doDelete }, { text: '取消', handler: function() { $('#cfmBox').dialog('close'); } }]
    });
}

function confirmDelNode(ifCode, ndCode, ndName) {
    ensureCfmBox();
    $('#cfmBox').html('<div class="dlg-cfm"><span class="dlg-cfm-icon">&#9888;</span><p class="dlg-cfm-msg">确定删除节点「' + ndName + '」？此操作不可恢复。</p></div>');
    gDelFn = function() {
        api('DeleteNode', { interfaceCode: ifCode, nodeCode: ndCode }, function(rs) {
            if (isOk(rs)) { setTimeout(function() { loadAll(); }, 150); toast('已删除: ' + ndName); }
            else { toast(rs.msg || '删除失败', true); }
        });
    };
    $('#cfmBox').dialog({
        title: '确认删除节点', closed: false, modal: true, width: 440, top: 180,
        buttons: [{ text: '确认删除', iconCls: 'icon-cancel', handler: doDelete }, { text: '取消', handler: function() { $('#cfmBox').dialog('close'); } }]
    });
}

function doDelete() {
    if (gDelFn) { gDelFn(); gDelFn = null; }
    try { $('#cfmBox').dialog('close'); } catch(e) {}
}

/* ============================== Utils ============================== */
function calcStatus(mOn, nSw) { if (!mOn) return '关*'; return (nSw === 'ON') ? '开' : '关'; }
function escHtml(s)  { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escQuote(s) { return String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'"); }
function isOk(rs) { if (rs === true || rs === 1) return true; if (rs && (rs.success === true || rs.success === 'true' || rs.success === 1)) return true; return false; }
function hasClass(el, cls) { return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') >= 0; }
function addClass(el, cls) { if (!hasClass(el, cls)) { el.className += ' ' + cls; } }
function removeClass(el, cls) { el.className = (' ' + el.className + ' ').replace(' ' + cls + ' ', ' ').replace(/^\s+|\s+$/g, ''); }

/* ============================== Init ============================== */
$(function() {
    try { $('#btnAddIf').linkbutton({ iconCls: 'icon-add' }); } catch(e) {}
    loadAll();
    $(document).on('keydown', '#fName', function(e) { if ((e.keyCode || e.which) === 13) submitDlg(); });
});
