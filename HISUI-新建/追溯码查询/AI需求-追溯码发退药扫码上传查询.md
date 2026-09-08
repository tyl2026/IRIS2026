# AI需求文档：追溯码发退药扫码上传查询

## 一、需求概述

| 项目 | 内容 |
|------|------|
| 模块名称 | 追溯码发退药扫码上传查询（发退药查询） |
| 页面入口 | `pha.tracecode.v2.dispscanquery.csp` |
| 页面脚本 | `scripts/pha/tracecode/v2/dispscanquery.js`、`scripts/pha/tracecode/v2/api.js` |
| 后端查询类 | `PHA.DTC.Query.DispScan`（Query：`GetDrugScanInfo`） |
| 业务用途 | 统计门诊/住院发药、退药（追溯码业务）的**应扫数量、实扫数量、上传数量**，并展示扫码情况、上传状态、追溯码信息，支持按**发药日期**或**结算日期**两个口径查询，支持补扫码 |
| 业务域 | 药房发退药 + 国家医保两定接口追溯码上传（METHOD3505 销售 / METHOD3506 销售退货） |

## 二、需求背景

1. 发退药台账（`DHC_INTRANS`）记录每次发药/退药的库存流水，追溯码扫码绑定记录在 `DHC_IncBatPack`（`^INCTBP`），上传医保的日志记录在 `BS_PHA_IN.InsuDataLog`。
2. 页面需把三者关联：一条台账对应"应扫数量"，绑定的追溯码对应"实扫数量"，医保上传成功日志中的追溯码对应"上传数量"。
3. 原页面"按结算日期查询"代码不完善（日期未转换、计数器被覆盖等），且"上传成功"数据扫码情况误显示"未扫码"，需要修复；同时新增"药品医嘱子类"筛选项。

## 三、界面需求

### 3.1 筛选条件（工具栏 `gridIncItmBar`）

| 序号 | 控件ID | 控件类型 | 标签 | 数据源 | 默认值 |
|------|--------|---------|------|--------|--------|
| 1 | StartDate | hisui-datebox | 开始日期 | — | 当天（`PHA.FACE.TPS.INSUTE.LogQuery/GetDate`） |
| 2 | EndDate | hisui-datebox | 截止日期 | — | 当天 |
| 3 | cmbStatType | hisui-combobox | 日期类型 | 固定项：Disp=按发药（默认选中）/ Settle=按结算 | Disp |
| 4 | cmbChFlag | hisui-combobox | 成功标志 | A=全部（默认）/ 空=未上传 / Y=上传成功 / N=上传失败 | A |
| 5 | cmbAdmType | hisui-combobox | 就诊类型 | O=门诊 / E=急诊 / I=住院 / H=其它 | 空 |
| 6 | cmbHospital | hisui-combobox | 医院 | `PHA.STORE.Org/CTHospital`（RowId/Description） | 登录院区 |
| 7 | txtMdtrtSn | hisui-validatebox | 就医流水号 | 手工输入 | 空 |
| 8 | txtSetld | hisui-validatebox | 结算ID | 手工输入 | 空 |
| 9 | cmbScanStatus | hisui-combobox | 扫码状态 | Y=已扫码 / N=未扫码 / C=无码药品 | 空 |
| 10 | cmbIntrType | hisui-combobox | 业务类型 | 空=全部（默认）/ F=门诊发药 / H=门诊退药 / P=住院发药 / Y=住院退药 | 空 |
| 11 | cmbSelType | hisui-combobox | 结算类型 | 1=医保结算 / 2=自费结算 | 空 |
| 12 | txtbatchno | hisui-validatebox | 批次流水号 | 手工输入 | 空 |
| 13 | txtPatNo | hisui-validatebox | 登记号 | 手工输入，回车自动补全（`PHA.DTC.COM.Method/FullPatNo`）并查询 | 空 |
| 14 | cmbPhaLocId | hisui-combobox | 药房科室 | `PHA.STORE.Org/Pharmacy&HospId=登录院区`（RowId/Description） | 空 |
| 15 | cmbgridInci | hisui-lookup | 药品名称 | `PHA.STORE.Drug/INCItm`（inciCode/inciDesc，分页） | 空 |
| 16 | cmbArcItmCat | hisui-combobox | 药品医嘱子类 | `PHA.DTC.COM.Store/ArcCat`（RowId/Description） | 空 |
| 17 | cmbDspStatus | hisui-combobox | 发药状态 | A=全部（默认）/ C=已发药 / TC=未发药 | A |
| 18 | btn-find | hisui-linkbutton | 查询 | 触发 `Query()` | — |
| 19 | btn-clear | hisui-linkbutton | 清屏 | 触发 `Clear()` | — |
| 20 | btn-scancode | hisui-linkbutton | 扫码 | 触发 `RepairCode()`，调 `api.js/ShowTraceCodeModal` 补录追溯码 | — |

> 说明：`cmbStatType` 为"日期类型"；选"按结算"时后端走结算日期口径（见 4.3）。`cmbDspStatus` 仅"按结算"生效。

### 3.2 列表列定义（表格 `gridInsuData`）

| 字段 | 标题 | 宽度 | 隐藏 | 格式化/说明 |
|------|------|------|------|------------|
| logId | 日志ID | 100 | 是 | |
| type | intr | 80 | 是 | 业务类型（F/H/P/Y），扫码补录用 |
| intrTypeDesc | 业务类型 | 80 | 否 | 门诊发药/门诊退药/住院发药/住院退药 |
| intr | 台账id | 120 | 否 | |
| inText | 入参 | 120 | 否 | 链接"入参详情"→`showInputJson` |
| outText | 出参 | 120 | 否 | 链接"出参详情"→`showOutJson` |
| checkFlag | HIS上传状态 | 100 | 否 | Y=成功(绿)/ N=失败(红)/ 空=未上传 |
| insuCode | 医保编码 | 120 | 否 | |
| insuDesc | 医保名称 | 150 | 否 | |
| scanFlag | 扫码情况 | 100 | 否 | 0=未扫码(红)/ 1=已扫码(绿)/ C=无码药品(紫) |
| traceCodeInfo | 追溯码信息 | 200 | 是 | JSON：`{"trdnFlag":x,"drugtracinfo":[码...]}` |
| patNo | 登记号 | 120 | 否 | |
| patName | 患者姓名 | 100 | 否 | |
| setlId | 结算ID | 200 | 否 | |
| mdtrtSn | 就医流水号 | 240 | 否 | |
| admTypeDesc | 就诊类型 | 100 | 否 | 住院/门诊/急诊/体检 |
| trdnFlag | 拆零标志 | 80 | 否 | Y=是 / 否 |
| setlTypeDesc | 结算类型 | 100 | 否 | 医保结算/自费结算 |
| oeore | oeore | 100 | 是 | 执行记录ID，扫码补录用 |

### 3.3 弹窗

- InfoWin（hisui-dialog）：展示入参/出参 JSON（`<pre>` 格式化）。

## 四、后端查询需求

### 4.1 查询入口

- Class/Query：`PHA.DTC.Query.DispScan.GetDrugScanInfo(inputStr)`
- ROWSPEC（19列，`^`/`$lb` 顺序）：`logId,type,intr,inText,checkFlag,insuCode,insuDesc,traceCodeInfo,patNo,patName,setlId,mdtrtSn,admTypeDesc,trdnFlag,setlTypeDesc,intrTypeDesc,scanFlag,outText,oeore`
- 入参 `inputStr` 为 `^` 拼接的 17 段（**与前端 Query() 一一对应**）：

| 段 | 含义 | 取值说明 |
|----|------|---------|
| 1 | 开始日期 | 前端 `YYYY-MM-DD`；后端统一转 $H 逻辑日期（`PHA.FACE.IN.Com/DateHtmlToLogical` 优先，其次 `web.DHCSTInterfaceFromElse`，最后 `$zdh(,3)`/`$zdh(,4)`） |
| 2 | 截止日期 | 同上 |
| 3 | 成功标志 | A=全部 / 空=未上传 / Y=上传成功 / N=上传失败 |
| 4 | 批次流水号 | 当前两种模式均未实际过滤（历史遗留，保留参数位） |
| 5 | 医院 | CTHospital RowId |
| 6 | 结算类型 | 1=医保结算 / 2=自费结算 |
| 7 | 就诊类型 | O/E/I/H |
| 8 | 扫码状态 | Y=已扫码 / N=未扫码 / C=无码药品 |
| 9 | 药房科室 | CTLOC RowId |
| 10 | 药品名称 | inciDesc 文本 |
| 11 | 登记号 | |
| 12 | 业务类型 | F/H/P/Y |
| 13 | 就医流水号 | |
| 14 | 结算ID | |
| 15 | 日期类型 | Disp=按发药 / Settle=按结算（`GetDrugScanInfoExecute` 据此分发） |
| 16 | 发药状态 | A=全部 / C=已发药 / TC=未发药（仅按结算） |
| 17 | 药品医嘱子类 | ARC_ItemCat RowId（**本次新增**） |

- 分发逻辑：`^15="Disp"` → `GetDrugScanInfoByDisp`；`^15="Settle"` → `GetDrugScanInfoBySettle`；结果统一写临时节点 `^||TMP("PHA","PHA.DTC.Query.DispScan","GetDrugScanInfo",pid,count)`，Execute 中 `$o` 遍历输出。

### 4.2 按发药统计 `GetDrugScanInfoByDisp`

**数据链路**：台账日期索引 → 台账 → 库存批 → 医嘱项 → 患者/就诊 → 医保结算信息 → 上传日志 → 追溯码绑定。

**步骤与过滤规则（顺序即代码顺序）**：
1. 日期转 $H；`typeStr="F^H^P^Y"`（选中业务类型时 `typeStr=该类型`）。
2. 遍历 `^DHCINTR(0,"TypeDate",type,date,intr)`：
   - `intrData=^DHCINTR(intr)`：^7=inclb、^6=数量、^10=台账单位、^9=业务指针。
   - `inclb` 为空跳过；药房科室=`^INCI(+inclb,"IL",+$p(inclb,"||",2))` ^1，与 ^9 过滤；医院=`^CTLOC(loc)` ^22 与 ^5 过滤。
   - `inci=+inclb`：药品名称=`^INCI(inci,1)` ^2 与 ^10 过滤。
   - **医嘱子类（本次新增）**：`arcItmCatId=$p(##class(web.DHCST.Common.DrugInfoCommon).GetArcItemCat(inci),"^",1)`，与 ^17 过滤。
   - 药品类组 `GetIncStkCatGrp(inci)`：^3≠"G" 跳过、^2 含"草药"跳过。
   - `oeori=##class(PHA.DTC.COM.Method).GetTransOrdItem(intr)`，为空跳过；取就诊：`admId=^OEORD(+oeori)` ^1、`papmi=^PAADM(admId)` ^1、`patNo=^PAPER(papmi,"PAT",1)` ^2、`admType=^PAADM(admId)` ^2，分别与 ^11/^7 过滤。
   - `GetInsuSetlData(oeori)` 返回 结算类型^结算ID^就医流水号^人员编号；与 ^13/^14 过滤。
   - **数量计算**：
     - `tQty=|台账数量| × UOMFac(台账单位,基本单位)`；`needNum=应扫=tQty/小码系数`（`inciFac=UOMFac(包装单位,基本单位)`），除不尽+1。
     - `acBQty=##class(PHA.DTC.COM.Method).GetRecordBQty(intr,type)`（已绑定基本单位数量）；`acNum=实扫=acBQty/inciFac`，除不尽+1。
     - `upNum=上传数量`：按 `^BS.PHA.IN.InsuDataLogI("TypePointerManf",methodType," "_intr," 1","")`（methodType：F/P→" METHOD3505"，H/Y→" METHOD3506"）取最后一条日志，checkFlag="Y" 时解析入参 inText 的 `input.selinfo.drugtracinfo` 数组长度。
     - `equalFlag`：`needNum=acNum 且 upNum=acNum` 时为 1（应扫=实扫=上传）。
   - **上传日志字段**（`^BS.PHA.IN.InsuDataLogD(logId)`，$lg 位置，与日志查询类交叉验证）：3=SetlType、5=inText、7=checkFlag、11=outText。
   - 过滤：^6 结算类型；^3 成功标志（`pChFlag'="A"&&pChFlag'=checkFlag` 跳过）。
   - **扫码状态过滤**：已扫码(Y)：`acNum=0` 跳过；未扫码(N)：`acNum>0` 或 `equalFlag=1` 跳过。
   - **追溯码**：`acNum=0` → `trdnFlag=((acBQty # inciFac)'=0?1:"")`，无码；否则遍历 `^INCTBPi("TypePointer",type,intr,tbpId)`：取 ^9=追溯码、^12=拆零标志，全部推入 `traceCodeArr`，`scanFlag=1`（**已移除 ^15 upLoadFlag 过滤，见 6.2**）。
   - 输出 `traceCodeInfo={"trdnFlag":..,"drugtracinfo":[..]}` JSON。

### 4.3 按结算统计 `GetDrugScanInfoBySettle`

**数据链路**：结算/发票查询（`INSU.BL.Interface.DataRpUp.InvOEORDInfoQry`）→ 医嘱执行/医嘱项 → 发药记录（`^DHCOEDISQTY`）→ 台账（`^DHCINTR`）→ 与 4.2 相同的数量/日志/追溯码逻辑。

**步骤与过滤规则**：
1. 日期转 $H（**本次修复**，见 6.1），空日期直接返回 ""。
2. `rs=##class(%ResultSet)`：`ClassName="INSU.BL.Interface.DataRpUp"`、`QueryName="InvOEORDInfoQry"`，`Execute(开始日期($H),截止日期($H),就诊类型,医院)`，逐行取 `AdmRowid、OEORIRowid、OrdExecRowid`。
3. 有 `oeore`：**遍历 `^DHCOEDISQTY(0,"OEORE",oeore)` 全部发药记录**（**本次修复**，原来只取第一条）；无 `oeore`：遍历 `^DHCOEDISQTY(0,"OEORI",oeori)`。
4. `GetDspData` 过滤（按发药记录）：
   - `dspData=^DHCOEDISQTY(dspId)`：^7=dspStatus、^13=dspType、^14=dspPointer、^24=发药科室（空时取 `^OEORD(ordId,"I",ordItm,3)` ^6）。
   - 发药状态 ^16：TC 过滤；C 排除 TC。
   - 药房科室 ^9、医院 ^5、**业务类型 ^12 按 dspType 过滤（本次修复，见 6.1）**、登记号 ^11、就医流水号 ^13、结算ID ^14。
   - `inci` 由 `^INCI(0,"ARCIM_DR",arcVer,"")` 反查；药品名称、医嘱子类 ^17（**本次新增**）、药品类组 G 非草药、`^ARC("IC",arcItmCatId)` ^7 必须="R"（药品）。
   - `dspStatus="TC"`（未发药）：只输出结算信息（业务类型、追溯码、日志等为空）。
   - 已发药：按 dspType（PH/P/YH/Y/F/H）经 `^DHCINTR(0,"TypePointer",类型,业务指针,intr)` 反查台账，逐条 `SetData`。
5. `SetData`：数量计算、上传日志、成功标志过滤、扫码状态过滤、追溯码遍历、输出（规则与 4.2 完全一致，其中日志按 `^BS.PHA.IN.InsuDataLogI("TypePointerManf",methodType," "_intrId," 1","")` 取第一条）；**未发药(TC)记录补 `pChFlag` 成功标志过滤（本次修复，见 6.1）**。

## 五、数据模型（Global 结构，均已用工具表 CSV 与现有代码交叉验证）

| Global/表 | 关键 piece/$lg | 用途 |
|-----------|---------------|------|
| `^DHCINTR(intr)` 台账（DHC_INTRANS） | ^1=类型、^2=日期、^6=数量、^7=inclb、^9=业务指针、^10=台账单位、^11=操作人 | 发退药流水主表 |
| `^DHCINTR(0,"TypeDate",type,date,intr)` | — | 按发药日期索引 |
| `^DHCINTR(0,"TypePointer",type,pointer,intr)` | — | 按业务指针索引 |
| `^INCTBP(tbpId)` 追溯码绑定（DHC_IncBatPack） | ^1=TbpPointer、^4=已绑基本单位数量、^9=追溯码、^12=拆零标志 | 实扫追溯码 |
| `^INCTBPi("TypePointer",type,pointer,tbpId)` | — | 按台账找绑定码 |
| `^BS.PHA.IN.InsuDataLogD(logId)` 上传日志 | $lg：2=Type、3=SetlType、4=Pointer、5=inText、6=Active、7=checkFlag、8=Batch、9=OperDate、10=OperTime、11=outText、12=DeleteType、13=LogHosp、14=TypeManf、15=TrdnFlag、16=InciDr、17=AdmDr、18=PapmiDr、19=ExistCode、20=UpLoadTimes | 医保上传状态与内容 |
| `^BS.PHA.IN.InsuDataLogI("TypePointerManf",methodType," "_pointer," 1",logId)` | — | 按接口类型+指针查日志 |
| `^INCI(inci,1)` 库存项 | ^1=代码、^2=名称、^3=ARCIM_DR、^10=基本单位、^17=包装单位 | 药品主数据 |
| `^OEORD(ordId,"I",ordItm,1)` | ^2=arcim（医嘱项） | 医嘱项→药品 |
| `^ARCIM(arcVer,arcSub,1)` | ^10=医嘱子类(ARC_ItemCat) | 医嘱子类 |
| `^ARC("IC",arcItmCatId)` | ^7=类别（R=药品） | 医嘱子类类型 |
| `^DHCOEDISQTY(dspId)` 发药记录 | ^3=oeore、^7=dspStatus、^13=dspType、^14=dspPointer、^24=发药科室 | 发药/退药明细 |
| `^DHCOEDISQTY(0,"OEORE"/"OEORI",id,dspId)` | — | 医嘱→发药记录索引 |
| `^PAADM`/`^PAPER` | PAADM ^1=papmi、^2=admType；PAPER("PAT",1) ^2=登记号、"ALL" ^1=姓名 | 患者/就诊 |
| 结算相关 | `GetInsuSetlData(oeori)` 返回 结算类型^结算ID^就医流水号^人员编号；`INSU.BL.Interface.DataRpUp/InvOEORDInfoQry(起,止,就诊类型,医院)` 返回 SerialNo/InvInsType/AdmRowid/OEORIRowid/OrdExecRowid | 按结算日期查询入口 |
| 医保目录 | `PHA.FACE.TPS.INSUTE.Com/GetInsuData(inci,hosp)` 返回 医保编码^医保名称 | 医保编码/名称列 |

## 六、本次需求变更（新增/修复明细）

### 6.1 按结算日期查询完善（`GetDrugScanInfoBySettle` 及 `SetData`/`GetDspData`）

| # | 问题 | 根因 | 修复 |
|---|------|------|------|
| 1 | 按结算查不到数据 | 前端 `YYYY-MM-DD` 字符串未转 $H 直接传入 `InvOEORDInfoQry`，而库内日期均为 $H 数字 | 按发药/日志查询同一套逻辑补 `DateHtmlToLogical`/`$zdh` 转换 |
| 2 | 明细互相覆盖、只显示少量行 | `s count=rs.%Get("SerialNo")` 覆盖了临时 global 输出计数器（同结算流水号的多条医嘱写同一节点） | 删除该赋值，`count` 仅作输出计数 |
| 3 | 业务类型筛选不生效 | ^12 `pIntrType` 解析后未使用 | `GetDspData` 中按 `dspType`（^13）过滤 |
| 4 | 同一执行记录多条发药只取第一条 | `$o(^DHCOEDISQTY(0,"OEORE",oeore,""))` 只取首个 | 改为循环遍历全部 |
| 5 | 未发药(TC)记录绕过"成功标志"过滤 | `SetData` 的 else 分支无 `pChFlag` 判断 | 补 `q:(pChFlag'="A")&&(pChFlag'=checkFlag)` |
| 6 | 空日期返回值异常 | 空日期返回 `$$$OK`(1) 与 Execute 的 `q:pid=""` 判断不一致 | 改为返回 `""` |

### 6.2 扫码情况误显示"未扫码"（按发药与按结算 TBP 循环）

- **问题**：成功标志=上传成功(Y) 时，实际已扫码的数据"扫码情况"列显示"未扫码"。
- **根因**：TBP 循环里有 `s upLoadFlag=$p(^INCTBP(tbpId),"^",15)` + `continue:(pChFlag="Y")&&(upLoadFlag'="1")`；而 `^INCTBP` 的 ^15 **全项目无任何写入**（`PHA.DTC.Scan.Query` 等标准实现从不读它），导致 chFlag="Y" 时所有绑定码被跳过、`scanFlag` 恒为 0。
- **修复**：删除两处（按发药、按结算 SetData）的 upLoadFlag 读取与过滤。扫码情况只以**实际绑定追溯码**为准；上传状态仍由行级"成功标志"（日志 checkFlag）负责。

### 6.3 新增"药品医嘱子类"筛选项

- **前端**：csp 第三行新增 `cmbArcItmCat` 下拉（数据源 `PHA.DTC.COM.Store/ArcCat`，RowId/Description）；JS `InitDict` 注册、`Query()` 拼入 ^17、`Clear()` 重置。
- **后端**：入参新增 ^17 `pArcItmCat`；按发药在 INCI 处用 `GetArcItemCat(inci)` ^1 过滤；按结算在 `GetDspData` 用已有 `arcItmCatId`（`^ARCIM(arcVer,arcSub,1)` ^10）过滤。
- **口径验证**：`GetArcItemCat` ^1=子类ID（标识码维护页的过滤用法），^2=描述（日志页"注射/输液"判断用法）；下拉 RowId 与后端子类 ID 同为 ARC_ItemCat 表 ID。

### 6.4 前端清屏修复（`dispscanquery.js/Clear()`）

- **问题**：清屏后 `$('#cmbStatType').combobox('setValue','A')` 把"日期类型"设成无效值 'A'（应为"发药状态"），导致清屏后再查询空返回。
- **修复**：改为 `$('#cmbDspStatus').combobox('setValue','A')`。

## 七、验收标准

| # | 场景 | 预期 |
|---|------|------|
| 1 | 默认进入页面 | 起止日期=当天，日期类型=按发药，成功标志=全部，医院=登录院区，发药状态=全部 |
| 2 | 按发药查今天数据 | 列表返回应扫/实扫/上传数量关系正确，扫码情况与实际扫码一致 |
| 3 | 成功标志=上传成功(Y) 查询 | 已扫码数据"扫码情况"列显示**已扫码**（绿），HIS上传状态=成功 |
| 4 | 日期类型=按结算 查询 | 能查出结算日期范围内的数据（日期须生效，不再空返回） |
| 5 | 业务类型=门诊发药(F) | 按结算结果只含门诊发药记录 |
| 6 | 药品医嘱子类选择某子类 | 列表只含该医嘱子类的药品，选"空"为全部 |
| 7 | 发药状态=未发药(TC) + 成功标志=上传成功 | TC 记录不显示（被成功标志过滤） |
| 8 | 扫码状态=未扫码(N) | 已扫码/应扫=实扫=上传 的记录不显示 |
| 9 | 点"清屏"后再查询 | 各条件复位且查询正常返回（日期类型=Disp、发药状态=A） |
| 10 | 选中一行点"扫码" | 弹出追溯码录入窗口（api.js ShowTraceCodeModal），未开追溯码科室提示 |
| 11 | 点"入参/出参详情" | 弹窗展示格式化 JSON |

## 八、涉及文件与部署

| 文件 | 位置/编码 | 部署 |
|------|----------|------|
| `PHA.DTC.Query.DispScan.cls` | 01代码实现/（UTF-8 无 BOM，CRLF） | 导入 IRIS 编译，覆盖类 `PHA.DTC.Query.DispScan` |
| `pha.tracecode.v2.dispscanquery.csp` | 01代码实现/（UTF-8 带 BOM，CRLF） | 应用 csp 目录 |
| `dispscanquery.js` | 01代码实现/（UTF-8 带 BOM，CRLF） | `scripts/pha/tracecode/v2/dispscanquery.js` |
| `api.js`（复用，未改） | 01代码实现/（UTF-8 带 BOM，CRLF） | `scripts/pha/tracecode/v2/api.js` |

> 说明：CLS 类带 BOM 会导致导入失败；CSP/JS 缺 BOM 会导致编译后中文乱码——编码要求必须遵守。

## 九、遗留问题（本次未处理，供后续决策）

1. **批次流水号（^4）筛选**：按发药与按结算两种模式均未实际生效（历史遗留）。上传日志 `InsuDataLog` 有 Batch 字段（$lg 8），如需启用可在日志解析处按 ^4 过滤。
2. **`InvOEORDInfoQry` 依赖**：按结算查询依赖系统类 `INSU.BL.Interface.DataRpUp` 的该查询存在，且按 $H 日期入参；如该查询在某院区缺失或日期格式不同，需另行适配。
