# MCP 实体类查找规范

> 通过 MCP iris_doc 读取 HIS 实体类的标准方法，用于 L2 深度学习阶段获取精确字段映射。

## 一、SQL 表名 → 实体类名转换规则

**核心规则**：去掉下划线，每段首字母大写，加 `User.` 前缀和 `.cls` 后缀。

| SQL 表名 | 实体类名 |
|----------|---------|
| DHC_OEDispensing | User.DHCOEDispensing.cls |
| DHC_OrderLinkTar | User.DHCOrderLinkTar.cls |
| DHC_PhaRetRequest | User.DHCPhaRetRequest.cls |
| DHC_AccPayINV | User.DHCAccPayINV.cls |
| DHC_BillConINV | User.DHCBillConINV.cls |
| DHC_PHARWIN | User.DHCPHARWIN.cls |
| DHC_TarItemPrice | User.DHCTarItemPrice.cls |
| DHC_PHACollectItm | User.DHCPHACollectItm.cls |

**规律总结**：
- `DHC_` 前缀 → `User.DHC`
- 去掉所有下划线 `_`
- 每个原下划线后的首字母变大写
- 末尾加 `.cls`

**特殊情况**：
- `OE_OrdItem` → `User.OEOrdItem.cls`（`OE_` 前缀同理）
- `PA_Adm` → `User.PAAdm.cls`
- `CT_Loc` → `User.CTLoc.cls`
- `ARC_ItmMast` → `User.ARCItmMast.cls`
- `SS_User` → `User.SSUser.cls`

## 二、iris_doc 调用方法

```
iris_doc(mode="get", name="User.DHCXxx.cls")
```

返回实体类完整源码，包含 Property 定义和 Storage SQLStorage 段。

## 三、从源码提取的关键信息

### 3.1 Global 名

从 `<Global>` 标签提取：
```xml
<Global>^DHCOEDISQTY</Global>
```

### 3.2 字段 Piece 位置

从 `<Data>` 标签提取字段名和 Piece 编号：
```xml
<Data name="DSP_OEORI_DR">
  <Delimiter>"^"</Delimiter>
  <Piece>1</Piece>
</Data>
```
含义：`^DHCOEDISQTY(rowId)` 的第 1 个 `^` 分隔段 = `DSP_OEORI_DR`（医嘱表指针）

### 3.3 索引定义

从 `<SQLMap name="INDEXxxx">` 提取索引结构：
```xml
<SQLMap name="INDEXOEORI">
  <Subscript name="1"><Expression>0</Expression></Subscript>
  <Subscript name="2"><Expression>"OEORI"</Expression></Subscript>
  <Subscript name="3"><Expression>{DSP_OEORI_DR}</Expression></Subscript>
  <Subscript name="4"><Expression>{DSP_RowId}</Expression></Subscript>
</SQLMap>
```
含义：`^DHCOEDISQTY(0,"OEORI",医嘱DR,rowId)` 可按医嘱查找打包记录

### 3.4 父子表关系

从 `<Relationship>` 提取：
```xml
<Relationship ChildBatch As User.DHCOEDispBatch [ Cardinality=children ]>
```

### 3.5 子表 Global

子表通常存储在父表 Global 的子节点下：
```
^DHCTARI(计费项DR,"P",子表sub)  → DHC_TarItemPrice（计费项价格子表）
^DHCINVPRTAP(发票DR,"Mode",sub) → DHC_AccPayINVMode（支付方式子表）
```

## 四、常见 Global 命名规律

| 前缀 | 业务域 | 示例 |
|------|--------|------|
| ^DHC | DHC 扩展表 | ^DHCOEDISQTY, ^DHCOLT, ^DHCPHARW |
| ^OEORD | 医嘱 | ^OEORD(就诊DR,"I",医嘱sub) |
| ^PAADM | 就诊 | ^PAADM(就诊DR) |
| ^ARCIM | 医嘱项 | ^ARCIM(sub,ver) |
| ^DHCTARI | 计费项 | ^DHCTARI(rowId) |
| ^RETRQ | 退药申请 | ^RETRQ(rowId) |
| ^DHCBCI | 账单发票关联 | ^DHCBCI(rowId) |
| ^DHCINVPRTAP | 一卡通发票 | ^DHCINVPRTAP(rowId) |

索引 Global 通常以 `i` 结尾：`^DHCPHARWi`, `^DHCINVPRTAPi`, `^DHCTARIi`

## 五、禁止使用的查找方式

| 方式 | 问题 |
|------|------|
| `INFORMATION_SCHEMA.COLUMNS` | DDL 表在 USER 命名空间查不到列信息 |
| `%Dictionary.CompiledProperty` | 类名不确定时查不到 |
| `iris_symbols(DHC.Xxx*)` | 带点号搜索不到，应用 `DHCXxx*` |
| `iris_execute(write ...)` | 输出始终为空（工具限制） |

## 六、完整查找流程

```
1. 从接口文档/规则库获取 SQL 表名（如 DHC_OEDispensing）
2. 转换为实体类名（User.DHCOEDispensing.cls）
3. 检查 his-table-moc.md 是否已有类名和 Global
4. iris_doc(get, "User.DHCOEDispensing.cls") 读取源码
5. 从 Storage 段提取 Global + Piece + 索引
6. 对比 his-data-flow.md 中的字段描述，修正不准确的 Piece 位置
7. 将新发现的 Global/类名回填到 his-table-moc.md
```
