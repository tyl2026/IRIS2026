/// desc: VTE质控 — 公用查询（科室下拉等）
/// author：tyl2026
/// date：2026-06-12
Class web.dhcvte.QryCommon Extends %RegisteredObject [ Not ProcedureBlock ]
{

/// desc: 科室下拉数据源
/// d ##class(%ResultSet).RunQuery("web.dhcvte.QryCommon","FindLocation")
Query FindLocation() As %Query(ROWSPEC = "RowID:%String,Code:%String,CName:%String") [ SqlProc ]
{
}

ClassMethod FindLocationExecute(ByRef qHandle As %Binary) As %Status
{
    s repid = $I(^CacheTemp)
    s ind = 1
    s qHandle = $lb(0, repid, 0)

    #; 遍历 ^CTLOC 科室 Global
    #; Global 结构: ^CTLOC(locId) = code(p1) ^ name(p2) ^ ... ^
    #;               ActiveFlag(p14) ^ DateActiveFrom(p24) ^ DateActiveTo(p25)
    #; 仅返回在用的住院科室
    #;
    #; TODO: 根据实际医院限制返回科室范围（如仅住院科室、仅开放科室）
    #; TODO: 若需权限过滤，联动 %session.Get("LOGON.CTLOCID")

    s locId = ""
    for {
        s locId = $o(^CTLOC(locId))
        q:(locId = "")

        s locData = $g(^CTLOC(locId))

        #; 跳过已停用科室 (DateActiveTo 不为空 = 已停用)
        continue:($p(locData, "^", 25) '= "")

        s code = $p(locData, "^", 1)
        s name = $p(locData, "^", 2)

        #; 去掉名称中的 "-" 前缀（DHCDoc.Util 惯例）
        if $e(name, 1) = "-" {
            s name = $e(name, 2, $l(name))
        }

        s ^CacheTemp(repid, ind) = $lb(locId, code, name)
        s ind = ind + 1
    }

    s qHandle = $lb(0, repid, 0)
    q $$$OK
}

ClassMethod FindLocationFetch(ByRef qHandle As %Binary, ByRef Row As %List, ByRef AtEnd As %Integer = 0) As %Status
{
    s AtEnd = $li(qHandle, 1)
    s repid = $li(qHandle, 2)
    s ind = $li(qHandle, 3)
    s ind = ind + 1
    if $d(^CacheTemp(repid, ind)) {
        s Row = ^CacheTemp(repid, ind)
        s qHandle = $lb(0, repid, ind)
    } else {
        s AtEnd = 1
        s Row = ""
    }
    q $$$OK
}

ClassMethod FindLocationClose(ByRef qHandle As %Binary) As %Status
{
    s repid = $li(qHandle, 2)
    k ^CacheTemp(repid)
    q $$$OK
}

}
