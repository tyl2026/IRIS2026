/// 病案编目数据自定义查询模板
Class User.DHCMRQueryTemplate Extends %Persistent [ SqlRowIdName = Tpl_Rowid, SqlTableName = DHCMR_QueryTemplate ]
{

/// 模板名称（中文描述，≥4字）
Property Name As %String(MAXLEN = 100, MINLEN = 4) [ Required, SqlColumnNumber = 2, SqlFieldName = Tpl_Name ];

/// 可见范围：G/P
Property Scope As %String(MAXLEN = 1, VALUELIST = ",G,P") [ InitialExpression = "P", Required, SqlColumnNumber = 3, SqlFieldName = Tpl_Scope ];

/// 创建用户 ID
Property CreateUserID As %String [ SqlColumnNumber = 4, SqlFieldName = Tpl_CreateUserID ];

/// 输出列配置 JSON
Property ColumnsJSON As %String(MAXLEN = "") [ Required, SqlColumnNumber = 5, SqlFieldName = Tpl_ColumnsJSON ];

/// 查询条件配置 JSON
Property ConditionsJSON As %String(MAXLEN = "") [ Required, SqlColumnNumber = 6, SqlFieldName = Tpl_ConditionsJSON ];

/// 是否默认模板
Property IsDefault As %Boolean [ InitialExpression = 0, SqlColumnNumber = 7, SqlFieldName = Tpl_IsDefault ];

/// 启用状态
Property IsActive As %Boolean [ InitialExpression = 1, SqlColumnNumber = 8, SqlFieldName = Tpl_IsActive ];

/// 创建日期
Property CreateDate As %Date [ InitialExpression = {+$h}, SqlColumnNumber = 9, SqlFieldName = Tpl_CreateDate ];

/// 创建时间
Property CreateTime As %Time [ InitialExpression = {+$p($h,",",2)}, SqlColumnNumber = 10, SqlFieldName = Tpl_CreateTime ];

/// 模板名称唯一索引
Index NameIdx On Name;


Storage Default
{
<Data name="DHCMRQueryTemplateDefaultData">
<Value name="1">
<Value>%%CLASSNAME</Value>
</Value>
<Value name="2">
<Value>Name</Value>
</Value>
<Value name="3">
<Value>Scope</Value>
</Value>
<Value name="4">
<Value>CreateUserID</Value>
</Value>
<Value name="5">
<Value>ColumnsJSON</Value>
</Value>
<Value name="6">
<Value>ConditionsJSON</Value>
</Value>
<Value name="7">
<Value>IsDefault</Value>
</Value>
<Value name="8">
<Value>IsActive</Value>
</Value>
<Value name="9">
<Value>CreateDate</Value>
</Value>
<Value name="10">
<Value>CreateTime</Value>
</Value>
</Data>
<DataLocation>^User.DHCMRQueryTemplateD</DataLocation>
<DefaultData>DHCMRQueryTemplateDefaultData</DefaultData>
<ExtentSize>100000</ExtentSize>
<IdLocation>^User.DHCMRQueryTemplateD</IdLocation>
<IndexLocation>^User.DHCMRQueryTemplateI</IndexLocation>
<SqlRowIdName>Tpl_Rowid</SqlRowIdName>
<StreamLocation>^User.DHCMRQueryTemplateS</StreamLocation>
<Type>%Storage.Persistent</Type>
}

}
