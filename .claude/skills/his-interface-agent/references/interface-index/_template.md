# {系统名称} 接口索引

> 最后更新: YYYY-MM-DD

---

<!-- 
  模板说明：
  - 每个 ## 二级标题是一个接口类
  - 按方法粒度记录，便于 Agent 定位修改目标
  - "踩坑记录"是核心资产，每次遇到问题必须记录
  - 复制此模板到 {系统名}.md 使用
-->

## {接口类名}

- **包路径**: `web.DHCENS.BLL.{系统}.{类名}`
- **文件**: `{文件名}.cls`
- **功能**: 一句话描述接口用途
- **格式**: Query / JSON / XML
- **基类**: `%RegisteredObject` / `%Persistent` / ...

### 方法清单

| 方法名 | 参数 | 返回类型 | 功能 |
|--------|------|---------|------|
| `queryName(p1, p2)` | p1: 说明, p2: 说明 | Query | 查询XXX |
| `methodName(p1)` | p1: 说明 | %GlobalCharacterStream | 获取XXX |

### 入参说明

| 参数 | 类型 | 必填 | 说明 | 测试数据SQL |
|------|------|:---:|------|------------|
| `pDateFrom` | 日期 | 否 | 开始日期 | `SELECT TOP 1 AdmDate FROM PA_Adm` |
| `pAdmId` | 就诊ID | 是 | 就诊流水号 | `SELECT TOP 1 PAADM_RowID FROM PA_Adm` |

### 数据来源

```
主要 Global: ^PAADM(adm), ^PAPER(patDR)
辅助字典: ^CTLOC(locDR), ^CT("SEX",sexDR)
```

### 踩坑记录

- YYYY-MM-DD: 描述遇到的问题和解决方案
- ...

### 变更历史

| 日期 | 变更内容 |
|------|---------|
| YYYY-MM-DD | 初始创建 / 修改说明 |
