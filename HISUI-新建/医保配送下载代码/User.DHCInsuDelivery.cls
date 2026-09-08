/// 医保配送下载数据（3563 接口下载的配送商订单明细）
Class User.DHCInsuDelivery Extends %Persistent [ SqlRowIdName = DLV_Rowid, SqlTableName = DHC_InsuDelivery ]
{

// ============ 批次头字段（入参 + 供应商） ============

/// 配送批次流水号
Property BatchSerialNo As %String(MAXLEN = 100) [ SqlColumnNumber = 2, SqlFieldName = DLV_BatchSerialNo ];

/// 供应商 ID
Property VendorId As %String(MAXLEN = 50) [ SqlColumnNumber = 3, SqlFieldName = DLV_VendorId ];

/// 供应商名称
Property VendorName As %String(MAXLEN = 200) [ SqlColumnNumber = 4, SqlFieldName = DLV_VendorName ];

/// 院区
Property HospId As %String(MAXLEN = 50) [ SqlColumnNumber = 5, SqlFieldName = DLV_HospId ];

/// 下载科室
Property LocId As %String(MAXLEN = 50) [ SqlColumnNumber = 6, SqlFieldName = DLV_LocId ];

/// 操作员 ID
Property UserId As %String(MAXLEN = 50) [ SqlColumnNumber = 7, SqlFieldName = DLV_UserId ];

/// 操作员名称
Property UserName As %String(MAXLEN = 100) [ SqlColumnNumber = 8, SqlFieldName = DLV_UserName ];

/// 入库标志
Property IngrFlag As %String(MAXLEN = 10) [ SqlColumnNumber = 9, SqlFieldName = DLV_IngrFlag ];

// ============ 明细字段（下载数据） ============

/// 行号
Property RowIndex As %Integer [ SqlColumnNumber = 10, SqlFieldName = DLV_RowIndex ];

/// 配送日期
Property DeliveryMovement As %String(MAXLEN = 50) [ SqlColumnNumber = 11, SqlFieldName = DLV_DeliveryMovement ];

/// 配送操作员
Property DeliveryOperator As %String(MAXLEN = 100) [ SqlColumnNumber = 12, SqlFieldName = DLV_DeliveryOperator ];

/// 比例
Property Ratio As %String(MAXLEN = 50) [ SqlColumnNumber = 13, SqlFieldName = DLV_Ratio ];

/// 医疗目录编码
Property InsuCode As %String(MAXLEN = 50) [ SqlColumnNumber = 14, SqlFieldName = DLV_InsuCode ];

/// 注册名称
Property InsuName As %String(MAXLEN = 200) [ SqlColumnNumber = 15, SqlFieldName = DLV_InsuName ];

/// 药品规格
Property Spec As %String(MAXLEN = 200) [ SqlColumnNumber = 16, SqlFieldName = DLV_Spec ];

/// 单价
Property Rp As %Numeric(SCALE = 4) [ SqlColumnNumber = 17, SqlFieldName = DLV_Rp ];

/// 最小包装单位
Property UomDesc As %String(MAXLEN = 50) [ SqlColumnNumber = 18, SqlFieldName = DLV_UomDesc ];

/// 生产企业名称
Property ManfDesc As %String(MAXLEN = 200) [ SqlColumnNumber = 19, SqlFieldName = DLV_ManfDesc ];

/// 生产批次号
Property BatNo As %String(MAXLEN = 100) [ SqlColumnNumber = 20, SqlFieldName = DLV_BatNo ];

/// 有效期止
Property ExpDate As %String(MAXLEN = 50) [ SqlColumnNumber = 21, SqlFieldName = DLV_ExpDate ];

/// 数量
Property Qty As %Numeric(SCALE = 4) [ SqlColumnNumber = 22, SqlFieldName = DLV_Qty ];

/// 大包装溯源码
Property BtcCode As %String(MAXLEN = 200) [ SqlColumnNumber = 23, SqlFieldName = DLV_BtcCode ];

/// 中包装溯源码
Property MtcCode As %String(MAXLEN = 200) [ SqlColumnNumber = 24, SqlFieldName = DLV_MtcCode ];

/// 小包装溯源码
Property StcCode As %String(MAXLEN = 200) [ SqlColumnNumber = 25, SqlFieldName = DLV_StcCode ];

// ============ 落库时间 ============

/// 保存日期
Property CreateDate As %Date [ SqlColumnNumber = 26, SqlFieldName = DLV_CreateDate ];

/// 保存时间
Property CreateTime As %Time [ SqlColumnNumber = 27, SqlFieldName = DLV_CreateTime ];

// ============ 补全字段（医保平台完整列） ============

/// 配送企业信用代码
Property VendCreditCode As %String(MAXLEN = 50) [ SqlColumnNumber = 28, SqlFieldName = DLV_VendCreditCode ];

/// 收货定点医药机构编码
Property RecvOrgCode As %String(MAXLEN = 50) [ SqlColumnNumber = 29, SqlFieldName = DLV_RecvOrgCode ];

/// 收货定点医药机构名称
Property RecvOrgName As %String(MAXLEN = 200) [ SqlColumnNumber = 30, SqlFieldName = DLV_RecvOrgName ];

/// 上传状态
Property UploadStatus As %String(MAXLEN = 20) [ SqlColumnNumber = 31, SqlFieldName = DLV_UploadStatus ];

/// 上传结果
Property UploadResult As %String(MAXLEN = 200) [ SqlColumnNumber = 32, SqlFieldName = DLV_UploadResult ];

/// 药品商品名
Property GoodsName As %String(MAXLEN = 200) [ SqlColumnNumber = 33, SqlFieldName = DLV_GoodsName ];

/// 药品剂型
Property DosageForm As %String(MAXLEN = 50) [ SqlColumnNumber = 34, SqlFieldName = DLV_DosageForm ];

/// 最小包装数量
Property MinPackQty As %Numeric(SCALE = 4) [ SqlColumnNumber = 35, SqlFieldName = DLV_MinPackQty ];

/// 最小制剂单位
Property MinPrepUnit As %String(MAXLEN = 20) [ SqlColumnNumber = 36, SqlFieldName = DLV_MinPrepUnit ];

/// 批准文号
Property ApprovalNo As %String(MAXLEN = 100) [ SqlColumnNumber = 37, SqlFieldName = DLV_ApprovalNo ];

/// 生产日期
Property ProduceDate As %String(MAXLEN = 20) [ SqlColumnNumber = 38, SqlFieldName = DLV_ProduceDate ];

/// 商品条形码
Property Barcode As %String(MAXLEN = 100) [ SqlColumnNumber = 39, SqlFieldName = DLV_Barcode ];

/// 处方药标志
Property RxFlag As %String(MAXLEN = 20) [ SqlColumnNumber = 40, SqlFieldName = DLV_RxFlag ];

/// 备注
Property Remark As %String(MAXLEN = 500) [ SqlColumnNumber = 41, SqlFieldName = DLV_Remark ];

// ============ 索引 ============

/// 配送批次流水号索引
Index SerialNoIdx On BatchSerialNo;

/// 供应商索引
Index VendorIdx On VendorId;

/// 大包装溯源码索引
Index BtcIdx On BtcCode;

/// 中包装溯源码索引
Index MtcIdx On MtcCode;

/// 小包装溯源码索引
Index StcIdx On StcCode;

}
