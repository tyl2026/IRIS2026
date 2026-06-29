# 编码原则详细说明

> 代码生成器已内置执行这些原则，生成的代码自动遵循

---

## 原则一：公共方法抽离原则

> **判断标准**：使用频率 + 功能复杂度

| 条件 | 是否抽离 | 示例 |
|------|----------|------|
| 使用频率高 + 功能复杂 | **必须抽离** | 患者信息聚合查询、医保结算计算 |
| 使用频率高 + 功能简单 | 可抽离可不抽离 | 日期格式化（看团队习惯） |
| 使用频率低 + 功能简单 | **不抽离，直接内联** | `$zd(date,3)`、`$zt(time)` |

**核心思想**：避免重复书写，提高代码复用性。简单操作（如 `$zd`、`$zt`、`$p`）直接内联即可。

### 示例

```objectscript
; ❌ 错误：简单操作抽离成方法
ClassMethod formatDate(hDate) { q $zd(hDate,3) }
s admDate=..formatDate($p(admData,"^",6))

; ✅ 正确：简单操作直接内联
s admDate=$zd($p(admData,"^",6),3)
```

```objectscript
; ✅ 正确：复杂操作抽离成方法
ClassMethod getPatientInfo(patDR) As %DynamicObject
{
    ; 聚合多个表的信息，逻辑复杂
    s patInfo={}
    s patName=$p($g(^PAPER(patDR,"ALL")),"^",1)
    s patCardNo=$p($g(^PAPER(patDR,"PAT",1)),"^",22)
    ; ... 更多聚合逻辑
    q patInfo
}
```

---

## 原则二：公共参数抽离原则

> **判断标准**：是否为个性化配置参数

| 场景 | 处理方式 | 示例 |
|------|----------|------|
| 全局固定值 | 定义为类 `Parameter` | 医保机构代码、机构名称 |
| 运行时可配置值 | 定义为类 `Property` | 数据库连接、超时时间 |
| 业务常量 | 定义为类 `Parameter` | 服务类型代码、默认状态 |

**核心思想**：个性化参数集中管理，修改一处即可全局生效，保证数据来源统一性。

### 实现方式

```objectscript
Class web.DHCENS.BLL.Outpatient.XXX Extends %RegisteredObject
{
    /// ========== 公共参数定义（修改此处即可全局生效） ==========
    /// 医保机构机构代码
    Parameter OrganizCode = "";

    /// 医保机构机构名称
    Parameter OrganizName = "";

    /// 医疗服务活动类型代码
    Parameter ServiceTypeCode = "EMR";

    /// 使用方式
    ClassMethod getData() As %Stream.GlobalCharacter
    {
        s dataObj={}
        d dataObj.%Set("YBJGJGDM",..#OrganizCode)      ; 医保机构机构代码
        d dataObj.%Set("YBJGJGMC",..#OrganizName)      ; 医保机构机构名称
        d dataObj.%Set("YLFWHDLXDM",..#ServiceTypeCode) ; 医疗服务活动类型代码
    }
}
```

### 优势

| 项目 | 优化前 | 优化后 |
|------|--------|--------|
| 修改方式 | 每个方法都要修改 | 只需修改Parameter定义处 |
| 数据一致性 | 各方法可能不一致 | 统一来源，保证一致 |
| 可维护性 | 分散，难维护 | 集中，易维护 |

---

## 相关配置

代码生成器中已内置这些原则的执行逻辑：

- `src/generators/json_generator.py` — JSON格式生成器
- `src/generators/query_generator.py` — Query格式生成器
- `src/generators/xml_generator.py` — XML格式生成器
- `src/generators/base_generator.py` — 公共基类
