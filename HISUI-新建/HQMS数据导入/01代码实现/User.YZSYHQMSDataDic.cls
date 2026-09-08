Class User.YZSYHQMSDataDic Extends %Persistent
{

/// 字段码；'*' = 通用值域项；非 '*' 且 ItemValue 为空 = 字段与值域绑定行
Property FldCode As %String(MAXLEN = 30) [ SqlFieldName = DIC_FldCode ];

/// 值域编号（如 RC001）
Property DicNo As %String(MAXLEN = 20) [ SqlFieldName = DIC_DicNo ];

/// 值（如 1 / 2.1）
Property ItemValue As %String(MAXLEN = 50) [ SqlFieldName = DIC_ItemValue ];

/// 名称/说明
Property ItemDesc As %String(MAXLEN = 300) [ SqlFieldName = DIC_ItemDesc ];

Index DicIdx On (DicNo, ItemValue);
Index FldIdx On FldCode;
Index NoValIdx On (DicNo, FldCode);

}
