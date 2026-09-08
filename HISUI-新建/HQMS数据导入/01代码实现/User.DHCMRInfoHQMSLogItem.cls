Class User.DHCMRInfoHQMSLogItem Extends %Persistent
{

/// 所属日志主表 RowID（User.DHCMRInfoHQMSLog）
Property LogID As %Integer [ SqlFieldName = ITEM_LogID ];

/// 批次内行号（从1开始）
Property RowNo As %Integer [ SqlFieldName = ITEM_RowNo ];

/// 结果：1=新增 2=更新 3=失败 4=跳过(未审核)
Property Result As %String(MAXLEN = 10) [ SqlFieldName = ITEM_Result ];

/// 目标 DHCMRINFO RowID
Property TargetRowID As %String(MAXLEN = 30) [ SqlFieldName = ITEM_TargetRowID ];

/// 明细说明（失败原因/更新到哪条记录等）
Property Msg As %String(MAXLEN = 1000) [ SqlFieldName = ITEM_Msg ];

Index LogIDIdx On LogID;
Index LogIDRowIdx On (LogID, RowNo);

}
