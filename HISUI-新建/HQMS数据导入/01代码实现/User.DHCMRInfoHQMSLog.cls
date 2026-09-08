Class User.DHCMRInfoHQMSLog Extends %Persistent
{

/// 批次号（对应暂存批次 ^web.YZSY.DHCMRInfoHQMSImp("Batch",批次号)）
Property BatchNo As %String(MAXLEN = 50) [ SqlFieldName = LOG_BatchNo ];

/// 源文件名
Property FileName As %String(MAXLEN = 200) [ SqlFieldName = LOG_FileName ];

/// 批次记录总数
Property TotalRows As %Integer [ SqlFieldName = LOG_TotalRows ];

/// 审核通过行数
Property PassRows As %Integer [ SqlFieldName = LOG_PassRows ];

/// 导入成功行数
Property SuccRows As %Integer [ SqlFieldName = LOG_SuccRows ];

/// 导入失败行数
Property FailRows As %Integer [ SqlFieldName = LOG_FailRows ];

/// 新增行数
Property AddRows As %Integer [ SqlFieldName = LOG_AddRows ];

/// 更新行数
Property UpdateRows As %Integer [ SqlFieldName = LOG_UpdateRows ];

/// 状态：1=导入完成 2=部分失败 3=失败
Property Status As %String(MAXLEN = 10) [ SqlFieldName = LOG_Status ];

/// 导入人
Property ImpUser As %String(MAXLEN = 50) [ SqlFieldName = LOG_ImpUser ];

/// 导入日期
Property ImpDate As %Date [ SqlFieldName = LOG_ImpDate ];

/// 导入时间
Property ImpTime As %String(MAXLEN = 10) [ SqlFieldName = LOG_ImpTime ];

/// 错误说明
Property ErrMsg As %String(MAXLEN = 1000) [ SqlFieldName = LOG_ErrMsg ];

Index BatchNoIdx On BatchNo;
Index ImpDateIdx On ImpDate;

}
