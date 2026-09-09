import json, os

BASE = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(BASE, 'all_fields.json'), 'r', encoding='utf-8') as f:
    fields = json.load(f)

gm = {'BASIC': '基本信息', 'INPAT': '住院信息',
      'DIAG': '诊断信息', 'SURG': '手术信息',
      'FEE': '费用信息', 'OTHER': '其他'}

# Load titles
titles = {}
title_file = os.path.join(BASE, 'title描述.txt')
if os.path.exists(title_file):
    with open(title_file, 'r', encoding='utf-8') as tf:
        for line in tf:
            line = line.strip()
            if not line: continue
            parts = line.split('\t')
            if len(parts) >= 2:
                titles[parts[0].strip()] = parts[1].strip()
print(f'Loaded {len(titles)} titles')

# Filter to only fields with titles
fields = [f for f in fields if f['field'] in titles]
print(f'Fields with titles: {len(fields)}')

# Build GetFieldMeta
metalines = ['    s json = "["']
for f in fields:
    g = gm.get(f['group'], gm['OTHER'])
    t = titles[f['field']]
    t = t.replace('"', '')
    metalines.append('    s json = json _ "{""field"":""' + f['field'] + '"",""title"":""' + t + '"",""type"":""' + f['type'] + '"",""piece"":' + str(f['piece']) + ',""group"":""' + g + '""},"')
metalines.append('    s json = $e(json, 1, *-1) _ "]"')
metalines.append('    q json')
meta_body = '\n'.join(metalines)

# Build GetFieldPiece
piecelines = []
for f in fields:
    piecelines.append('    if field = "' + f['field'] + '" q ' + str(f['piece']))
piecelines.append('    q 0')
piece_body = '\n'.join(piecelines)

# Core template - read from existing file
core = '''Class web.YZSY.DHCMRCustomQuery Extends %RegisteredObject
{

///w ##class(web.YZSY.DHCMRCustomQuery).GetFieldMeta()
ClassMethod GetFieldMeta() As %String [ Language = objectscript ]
{
''' + meta_body + '''
}

///w ##class(web.YZSY.DHCMRCustomQuery).QueryData(columns,conditions,page,rows)
ClassMethod QueryData(columns As %String, conditions As %String, page As %Integer = 1, rows As %Integer = 20) As %String [ Language = objectscript ]
{
    s colArr = ##class(%DynamicArray).%FromJSON(columns)
    s colCount = colArr.%Size()
    s condArr = ##class(%DynamicArray).%FromJSON(conditions)
    s condCount = condArr.%Size()
    s sep = $c(1)
    s groups = ""
    s groupList = ""
    for i = 0:1:(condCount-1) {
        s c = condArr.%Get(i)
        s gid = c.%Get("groupId")
        if gid = "" s gid = "0"
        if '$data(groups(gid)) {
            s groups(gid) = ""
            if groupList = "" s groupList = gid
            else  s groupList = groupList _ "," _ gid
        }
        s piece = c.%Get("piece")
        if piece = "" s piece = 0
        if groups(gid) = "" s groups(gid) = c.%Get("field") _ "|" _ c.%Get("op") _ "|" _ c.%Get("value") _ "|" _ piece _ "|" _ c.%Get("type")
        else  s groups(gid) = groups(gid) _ sep _ c.%Get("field") _ "|" _ c.%Get("op") _ "|" _ c.%Get("value") _ "|" _ piece _ "|" _ c.%Get("type")
    }
    s feeFields = "^MR_ZFJE^MR_XYF^MR_MZF^MR_SSF^MR_KFF^MR_HLF^MR_ZYZLF^"
    s matchedRows = ""
    s totalMatched = 0
    s maxRows = 200000
    s id = 0
    for {
        s id = $o(^DHCMRInfo(id))
        q:id=""
        q:totalMatched'<maxRows
        s data = $g(^DHCMRInfo(id))
        if data '= "" {
            s groupMatch = 0
            if groupList = "" {
                s groupMatch = 1
            }
            else {
            s groupCnt = $l(groupList, ",")
            for gi = 1:1:groupCnt {
                s gid = $p(groupList, ",", gi)
                s conds = groups(gid)
                s condCnt = $l(conds, sep)
                s allPass = 1
                for ci = 1:1:condCnt {
                    s condStr = $p(conds, sep, ci)
                    s field = $p(condStr, "|", 1)
                    s op = $p(condStr, "|", 2)
                    s value = $p(condStr, "|", 3)
                    s piece = +$p(condStr, "|", 4)
                    s ftype = $p(condStr, "|", 5)
                    if piece = 0 s piece = ..GetFieldPiece(field)
                    if piece = 0 s allPass = 0 continue
                    s actualVal = $p(data, "^", piece)
                    if '..MatchValue(actualVal, op, value, ftype) s allPass = 0 continue
                }
                if allPass s groupMatch = 1 continue
            }
            }
            if groupMatch {
                s totalMatched = totalMatched + 1
                s matchedRows(totalMatched) = id
            }
        }
    }
    if totalMatched '< maxRows {
        q "{""ok"":false}"
    }
    s startIdx = (page - 1) * rows + 1
    s endIdx = startIdx + rows - 1
    if endIdx > totalMatched s endIdx = totalMatched
    s qt = $c(34)
    s resultRows = "["
    s footerSum = ""
    for idx = startIdx:1:endIdx {
        s rowId = matchedRows(idx)
        s rowData = $g(^DHCMRInfo(rowId))
        if idx > startIdx s resultRows = resultRows _ ","
        s resultRows = resultRows _ "{"
        for ci = 0:1:(colCount-1) {
            s col = colArr.%Get(ci)
            s piece = col.%Get("piece")
            s fld = col.%Get("field")
            s val = $p(rowData, "^", piece)
            if val = "" s val = "-"
            if (+val > 0)&&(col.%Get("type") = "Date") s val = $zd(val, 3)
            if ci > 0 s resultRows = resultRows _ ","
            s resultRows = resultRows _qt_ fld _qt_ ":" _qt_ ..EscapeJSON(val) _qt
            if $find(feeFields, "^" _ fld _ "^") {
                if '$data(footerSum(fld)) s footerSum(fld) = 0
                s footerSum(fld) = footerSum(fld) + val
            }
        }
        s resultRows = resultRows _ "}"
    }
    s resultRows = resultRows _ "]"
    s footerJSON = "{"
    s firstFld = 1
    s fld = $o(footerSum(""))
    while fld '= "" {
        if 'firstFld s footerJSON = footerJSON _ ","
        s firstFld = 0
        s footerJSON = footerJSON _qt_ fld _qt_ ":" _ footerSum(fld)
        s fld = $o(footerSum(fld))
    }
    s footerJSON = footerJSON _ "}"
    s result = "{""ok"":true,""total"":" _ totalMatched _ ",""rows"":" _ resultRows _ ",""footer":" _ footerJSON _ "}"
    q result
}

///w ##class(web.YZSY.DHCMRCustomQuery).GetFieldPiece(field)
ClassMethod GetFieldPiece(field As %String) As %Integer [ Language = objectscript ]
{
''' + piece_body + '''
}

///w ##class(web.YZSY.DHCMRCustomQuery).MatchValue(actualVal,op,condVal,ftype)
ClassMethod MatchValue(actualVal As %String, op As %String, condVal As %String, ftype As %String = "String") As %Boolean [ Language = objectscript ]
{
    if op = "contains" q ($find(actualVal, condVal) > 0)
    if op = "startswith" q ($e(actualVal, 1, $l(condVal)) = condVal)
    if op = "eq" {
        if ftype = "Date" { s condVal = $zdh(condVal,3) }
        q (actualVal = condVal)
    }
    if op = "neq" {
        if ftype = "Date" { s condVal = $zdh(condVal,3) }
        q (actualVal '= condVal)
    }
    if op = "gt" {
        if ftype = "Date" { s condVal = $zdh(condVal,3) }
        q (actualVal > condVal)
    }
    if op = "lt" {
        if ftype = "Date" { s condVal = $zdh(condVal,3) }
        q (actualVal < condVal)
    }
    if op = "gte" {
        if ftype = "Date" { s condVal = $zdh(condVal,3) }
        q (actualVal '< condVal)
    }
    if op = "lte" {
        if ftype = "Date" { s condVal = $zdh(condVal,3) }
        q (actualVal '> condVal)
    }
    if op = "between" {
        s v1 = $p(condVal, "~", 1)
        s v2 = $p(condVal, "~", 2)
        if ftype = "Date" {
            s v1 = $zdh(v1, 3)
            s v2 = $zdh(v2, 3)
        }
        q (actualVal '< v1)&&(actualVal '> v2)
    }
    q 1
}

///w ##class(web.YZSY.DHCMRCustomQuery).EscapeJSON(val)
ClassMethod EscapeJSON(val As %String) As %String [ Language = objectscript ]
{
    s val = $replace(val, $c(92), $c(92,92))
    s val = $replace(val, $c(34), $c(92,34))
    s val = $replace(val, $c(13,10), $c(92,110))
    s val = $replace(val, $c(10), $c(92,110))
    s val = $replace(val, $c(13), $c(92,110))
    s val = $replace(val, $c(9), $c(92,116))
    q val
}

///w ##class(web.YZSY.DHCMRCustomQuery).GetTemplateList(UserID)
ClassMethod GetTemplateList(UserID As %String) As %String [ Language = objectscript ]
{
    s rows = "["
    s first = 1
    s tId = 0
    for {
        s tId = $o(^User.DHCMRQueryTemplateD(tId))
        q:tId=""
        s td = $g(^User.DHCMRQueryTemplateD(tId))
        if $lg(td,8) '= 1 continue
        s sc = $lg(td,3)
        s cu = $lg(td,4)
        if (sc '= "G")&&(cu '= UserID) continue
        if 'first s rows = rows _ ","
        s first = 0
        s rows = rows _ "{""ID"":" _ tId _ ",""Name"":""" _ ..EscapeJSON($lg(td,2)) _ """,""Scope"":""" _ sc _ """,""CreateUserID"":""" _ cu _ """,""IsDefault"":""" _ $lg(td,7) _ """,""IsActive"":""" _ $lg(td,8) _ """,""CreateDate"":""" _ $zd($lg(td,9),3) _ """,""CreateTime"":""" _ $zt($lg(td,10),1) _ """}"
    }
    s rows = rows _ "]"
    q "{""rows"":" _ rows _ "}"
}

///w ##class(web.YZSY.DHCMRCustomQuery).SaveTemplate(ID,Name,Scope,UserID,ColumnsJSON,ConditionsJSON)
ClassMethod SaveTemplate(ID As %String = "", Name As %String, Scope As %String = "P", UserID As %String, ColumnsJSON As %String, ConditionsJSON As %String) As %String [ Language = objectscript ]
{
    if ID = "" s ID = 0
    s tId = 0
    for {
        s tId = $o(^User.DHCMRQueryTemplateD(tId))
        q:tId=""
        s td = $g(^User.DHCMRQueryTemplateD(tId))
        continue:tId=ID
        if $lg(td,2) = Name q "{""ok"":false,""error"":""模板名称已存在""}"
    }
    if ID = 0 {
        s newId = $i(^User.DHCMRQueryTemplateD(0))
        s ^User.DHCMRQueryTemplateD(newId) = $lb("User.DHCMRQueryTemplate", Name, Scope, UserID, ColumnsJSON, ConditionsJSON, 0, 1, +$h, $p($h,",",2))
        q "{""ok"":true,""id"":" _ newId _ "}"
    }
    s data = $g(^User.DHCMRQueryTemplateD(ID))
    if data = "" q "{""ok"":false,""error"":""template not found""}"
    s creator = $lg(data,4)
    if creator '= UserID q "{""ok"":false,""error"":""not owner""}"
    s ^User.DHCMRQueryTemplateD(ID) = $lb("User.DHCMRQueryTemplate", Name, Scope, UserID, ColumnsJSON, ConditionsJSON, $lg(data,7), $lg(data,8), $lg(data,9), $lg(data,10))
    q "{""ok"":true,""id"":" _ ID _ "}"
}

///w ##class(web.YZSY.DHCMRCustomQuery).DeleteTemplate(ID,UserID)
ClassMethod DeleteTemplate(ID As %String, UserID As %String) As %String [ Language = objectscript ]
{
    s data = $g(^User.DHCMRQueryTemplateD(ID))
    if data = "" q "{""ok"":false,""error"":""not found""}"
    s creator = $lg(data,4)
    if creator '= UserID q "{""ok"":false,""error"":""not owner""}"
    k ^User.DHCMRQueryTemplateD(ID)
    q "{""ok"":true}"
}

///w ##class(web.YZSY.DHCMRCustomQuery).ToggleDefault(ID,IsDefault)
ClassMethod ToggleDefault(ID As %String, IsDefault As %String) As %String [ Language = objectscript ]
{
    if IsDefault = "1" {
        s tId = 0
        for {
            s tId = $o(^User.DHCMRQueryTemplateD(tId))
            q:tId=""
            s td = $g(^User.DHCMRQueryTemplateD(tId))
            if $lg(td,7) = 1 {
                s $li(^User.DHCMRQueryTemplateD(tId),7) = 0
            }
        }
        if $d(^User.DHCMRQueryTemplateD(ID)) {
            s $li(^User.DHCMRQueryTemplateD(ID),7) = 1
        }
    }
    else {
        if $d(^User.DHCMRQueryTemplateD(ID)) {
            s $li(^User.DHCMRQueryTemplateD(ID),7) = 0
        }
    }
    q "{""ok"":true}"
}

///w ##class(web.YZSY.DHCMRCustomQuery).ToggleActive(ID,IsActive)
ClassMethod ToggleActive(ID As %String, IsActive As %String) As %String [ Language = objectscript ]
{
    if $d(^User.DHCMRQueryTemplateD(ID)) {
        s $li(^User.DHCMRQueryTemplateD(ID),8) = IsActive
    }
    q "{""ok"":true}"
}

///w ##class(web.YZSY.DHCMRCustomQuery).GetDefaultTemplate(UserID)
ClassMethod GetDefaultTemplate(UserID As %String) As %String [ Language = objectscript ]
{
    s result = ""
    s qt = $c(34)
    s tId = 0
    for {
        s tId = $o(^User.DHCMRQueryTemplateD(tId))
        q:tId=""
        s td = $g(^User.DHCMRQueryTemplateD(tId))
        if $lg(td,8) '= 1 continue
        if $lg(td,7) '= 1 continue
        s sc = $lg(td,3)
        s cu = $lg(td,4)
        if (sc '= "G")&&(cu '= UserID) continue
        s result = "{""ID"":" _ tId _ ",""Name"":""" _ ..EscapeJSON($lg(td,2)) _ """,""Scope"":""" _ sc _ """,""ColumnsJSON"":" _qt_ ..EscapeJSON($lg(td,5)) _qt_ ",""ConditionsJSON"":" _qt_ ..EscapeJSON($lg(td,6)) _qt_ "}"
        q
    }
    if result '= "" q result
    q "{}"
}

///w ##class(web.YZSY.DHCMRCustomQuery).GetTemplateDetail(ID)
ClassMethod GetTemplateDetail(ID As %String) As %String [ Language = objectscript ]
{
    s td = $g(^User.DHCMRQueryTemplateD(ID))
    if td = "" q "{}"
    s qt = $c(34)
    q "{"
        _qt_"ID"_qt_":"_ID_","
        _qt_"Name"_qt_":"_qt_..EscapeJSON($lg(td,2))_qt_","
        _qt_"Scope"_qt_":"_qt_$lg(td,3)_qt_","
        _qt_"CreateUserID"_qt_":"_qt_$lg(td,4)_qt_","
        _qt_"ColumnsJSON"_qt_":"_qt_..EscapeJSON($lg(td,5))_qt_","
        _qt_"ConditionsJSON"_qt_":"_qt_..EscapeJSON($lg(td,6))_qt_","
        _qt_"IsDefault"_qt_":"_qt_$lg(td,7)_qt_","
        _qt_"IsActive"_qt_":"_qt_$lg(td,8)_qt_
        "}"
}

}
'''

path = os.path.join(BASE, '01代码实现', 'web.YZSY.DHCMRCustomQuery.cls')
with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(core)

with open(path, 'rb') as f:
    hdr = f.read(3)
print('BOM:', 'YES' if hdr == b'\xef\xbb\xbf' else 'NO (correct)')
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()
print('{', c.count('{'), '}', c.count('}'))
print('Size:', len(c), 'chars')
print('Done')
