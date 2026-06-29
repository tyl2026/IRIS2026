---
ruleId: "COMMON-001"
title: "Global 访问模式"
version: "1.0"
category: "coding-standards"
---

# Global 访问模式

## 概述

DHC/ENS 系统使用 InterSystems IRIS 的 Global 存储数据。本规则汇总了常用的 Global 访问模式。

## 核心 Global 清单

| Global | 用途 | 典型节点 |
|--------|------|---------|
| `^PAPER` | 患者主索引 (Pa_PatMas) | ALL, PAT, PER, EMP |
| `^PAADM` | 就诊记录 (Pa_Adm) | 直接访问 |
| `^OEORD` | 医嘱 (OE_Order) | I (医嘱项) |
| `^MR` | 医疗记录 (MR_Adm) | DIA (诊断) |
| `^CT` | 字典表 (各类字典) | SEX, OCC, MAR, COU, NAT 等 |
| `^PAC` | 证件类型字典 | CARD |
| `^DHCCARD` | 就诊卡 | CF |
| `^DHCPB` | 计费信息 | O (收费项) |
| `^DHCINV` | 发票信息 | - |

## 访问模式

### 1. 直接访问（知道 RowID）

```objectscript
s data = $g(^PAPER(PatRowID, "ALL"))
s name = $p(data, "^", 1)
```

### 2. 索引遍历（按条件查找）

```objectscript
s id = ""
f {
    s id = $o(^PAPERi("PAPMI_PatNo", regNo, id))
    q:id=""
    // 处理每条记录
}
```

### 3. 字典查询（两步式）

```objectscript
// 第一步：取 RowID
s sexRowID = $p($g(^PAPER(PatRowID, "ALL")), "^", 7)

// 第二步：查字典
s sexDesc = $p($g(^CT("SEX", sexRowID)), "^", 2)
```

## 常用索引

| Global | 索引名 | 用途 |
|--------|--------|------|
| `^PAPERi` | PAPMI_PatNo | 按登记号查患者 |
| `^PAPERi` | SSN | 按证件号查患者 |
| `^PAADMi` | PAADM_AdmDate | 按入院日期查就诊 |
| `^PAADMi` | DischDate | 按出院日期查就诊 |
| `^OEORDi` | 0,"Adm" | 按就诊查医嘱 |

## 安全访问规范

1. **始终使用 $g() 包装**：防止未定义节点导致错误
   ```objectscript
   s value = $g(^PAPER(id, "ALL"))  // 正确
   s value = ^PAPER(id, "ALL")      // 错误！可能导致 <UNDEFINED>
   ```

2. **检查空值**：在使用前检查返回值
   ```objectscript
   q:rowID="" ""
   s desc = $p($g(^CT("SEX", rowID)), "^", 2)
   ```

3. **使用 $p 提取字段**：标准的字段提取方式
   ```objectscript
   s field = $p(globalNode, "^", position)
   ```

## 相关规则

- R02: 包路径命名规范
- R03: 自包含原则
