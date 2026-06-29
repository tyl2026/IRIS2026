---
domain: "01-user"
name: "用户/员工域(完整版)"
version: "2.2.0"
description: "系统用户、医护人员、安全组、科室四表联合取值规则。核心Global: ^SSU/^CTPCP/^CTLOC/^rB"

# 实体表类（数据存储结构来源）
entityClasses:
  - name: "User.SSUser"
    description: "系统用户表"
    global: "^SSU(\"SSUSR\",RowId)"
    primaryKey: "SSUSR_RowId"
  - name: "User.CTCareProv"
    description: "医护人员表"
    global: "^CTPCP(RowId)"
    primaryKey: "CTPCP_RowId"
  - name: "User.SSGroup"
    description: "安全组表"
    global: "^SSU(\"sSGRP\",RowId)"
    primaryKey: "SSGRP_RowId"
  - name: "User.CTLoc"
    description: "科室地点表"
    global: "^CTLOC(RowID)"
    primaryKey: "CTLOC_RowID"

# 接口程序类（用于验证对照）
apiClasses:
  - name: "web.DHCENS.sTBLL.dICT.mETHOD.CTCareProv"
    method: "CTCareProv()"
  - name: "web.qMJK.dIC.Dictionary"
    method: "Employee() / Department()"

# 相关字典类
relatedDicts:
  - name: "User.CTCarPrvTp"
    global: "^CT(\"cPT\",RowId)"
    description: "医护人员职称类型"
  - name: "User.CTHospital"
    global: "^CT(\"HOSP\",RowId)"
    description: "院区"

totalRules: 39
lastUpdated: "2026-05-11"
relatedGlobals:
  - "^SSU(\"SSUSR\",RowId) — 系统用户主表"
  - "^SSU(\"SSUSR\",0,\"Group\",GroupId) — 按安全组索引用户"
  - "^SSU(\"SSUSR\",0,\"CTPCP\",CareProvDR) — 按医护人员索引用户"
  - "^CTPCP(RowId) — 医护人员主数据(3结点)"
  - "^CTPCP(0,\"Code\",Code) — 按代码查医护人员"
  - "^CTPCP(0,\"Decs\",Desc) — 按名称查医护人员"
  - "^CTPCP(0,\"CareProvType\",TypeDR) — 按类型查医护人员"
  - "^CTLOC(RowID) — 科室地点主数据"
  - "^CTLOC(0,\"Code\",Code) — 按代码查科室"
  - "^CTLOC(0,\"Desc\",Desc) — 按名称查科室"
  - "^SSU(\"sSGRP\",RowId) — 安全组主数据"
---

# 用户/员工域(完整版)

## 元信息

| 属性 | 值 |
|------|-----|
| 域ID | `01-user` |
| 版本 | 2.2.0 |
| 规则数 | 39 |
| 实体表 | User.SSUser / User.CTCareProv / User.SSGroup / User.CTLoc |
| 更新时间 | 2026-05-11 |

## 描述

系统用户、医护人员角色、安全组、科室四表联合取值规则。核心 Global: ^SSU("SSUSR") / ^CTPCP / ^CTLOC。

## 表关联关系

```
User.SSUser (系统用户)
  ├── ^4: SSUSR_DefaultDept_DR → ^CTLOC(RowID)         # 默认登录科室
  ├── ^5: SSUSR_Group          → ^SSU("sSGRP",RowId)   # 所属安全组
  ├── ^9: ssusrCtpcpDr       → ^CTPCP(RowId)         # 关联医护人员
  ├── ^14: SSUSR_CareProv_DR   → ^CTPCP(RowId)         # 关联医护人员(第二引用)
  └── ^98: SSUSR_Hospital_DR   → ^CT("HOSP",RowId)     # 所属院区

User.CTCareProv (医护人员)
  ├── ^4: CTPCP_CarPrvTp_DR    → ^CT("cPT",RowId)      # 职称类型
  ├── 节点3^3: ctpcpCtlocDr  → ^CTLOC(RowID)          # 关联科室
  └── ^5: CTPCP_Hosp_DR        → CTRefClin               # 关联医院

User.CTLoc (科室)
  ├── ^22: CTLOC_Hospital_DR          → CTHospital       # 所属院区
  └── ^54: CTLOC_DepartmentHeadUserDR → ^SSU("SSUSR")    # 科主任
```

## Global 结构速查

### ^SSU("SSUSR",RowId) — 系统用户

| 位 | 字段 | 说明 |
|----|------|------|
| ^1 | SSUSR_Initials | 缩写/短名(唯一索引) |
| ^2 | SSUSR_Name | 显示名称 |
| ^4 | SSUSR_DefaultDept_DR | **默认科室DR → ^CTLOC** |
| ^5 | SSUSR_Group | **安全组DR → ^SSU("sSGRP")** |
| ^7 | SSUSR_IsThisDoctor | 是否医生(Y/N) |
| ^9 | ssusrCtpcpDr | **关联医护人员DR → ^CTPCP** |
| ^11 | SSUSR_EMailName | 邮件名 |
| ^14 | SSUSR_CareProv_DR | **关联医护人员DR(第二引用) → ^CTPCP** |
| ^19 | SSUSR_Active | 有效标志(Y/N) |
| ^44 | SSUSR_DateLastLogin | 最后登录日期 |
| ^45 | SSUSR_TimeLastLogin | 最后登录时间 |
| ^69 | SSUSR_Surname | 姓 |
| ^70 | SSUSR_GivenName | 名 |
| ^78 | SSUSR_DoctorFlag | 医生标志 |
| ^79 | SSUSR_NurseFlag | 护士标志 |
| ^81 | SSUSR_LoginID | 登录ID |
| ^98 | SSUSR_Hospital_DR | 院区DR |
| ^99 | SSUSR_Mobile | 手机 |
| ^101 | SSUSR_Email | 邮箱 |
| ^122 | SSUSR_CreatedDate | 创建日期(身份证件号) |
| ^123 | SSUSR_CreatedTime | 创建时间(性别编码) |

**⚠️ ^122/^123 双重用途**：生产代码中 ^122 存证件号码(zJHM)，^123 存性别编码(xBBM)。字段名与用途不一定对应，以实际生产代码为准。

### ^CTPCP(RowId) — 医护人员 (3节点)

| 节点 | 位 | 字段 | 说明 |
|------|----|------|------|
| 1 | ^1 | CTPCP_Code | 工号/代码 |
| 1 | ^2 | CTPCP_Desc | 姓名 |
| 1 | ^4 | CTPCP_CarPrvTp_DR | **职称类型DR → ^CT("cPT")** |
| 1 | ^9 | CTPCP_ActiveFlag | 有效标志 |
| 1 | ^10 | CTPCP_Spec_DR | 专业DR |
| 2 | ^1 | CTPCP_TelO | 办公电话 |
| 2 | ^4 | CTPCP_PagerNo | 寻呼号 |
| 2 | ^14 | CTPCP_DateActiveFrom | 启用日期 |
| 2 | ^18 | CTPCP_Surgeon | 是否外科医生 |
| 2 | ^19 | CTPCP_Anaesthetist | 是否麻醉师 |
| 3 | ^3 | ctpcpCtlocDr | **关联科室DR → ^CTLOC** |
| 3 | ^4 | CTPCP_Title | 职称名称 |
| 3 | ^6 | CTPCP_MobilePhone | 手机 |
| 3 | ^9 | CTPCP_Email | 邮箱 |
| 3 | ^27 | CTPCP_FirstName | 名字 |
| 3 | ^33 | CTPCP_MentalFlag | 精神类处方权 |
| 3 | ^38 | (处方资质标志) | **cFZZBZ: 处方资质标志 Y/N →1/0** |

**⚠️ ^CTPCP 需要明确的节点号**：取值时写 `^CTPCP(RowID,1)` 或 `^CTPCP(RowID,3)`，不能省略节点号！

### ^CTLOC(RowID) — 科室 (单节点)

| 位 | 字段 | 说明 |
|----|------|------|
| ^1 | CTLOC_Code | 科室代码 |
| ^2 | CTLOC_Desc | 科室名称 |
| ^5 | CTLOC_WardFlag | 是否病区 |
| ^13 | CTLOC_Type | 类型(W/E/dI/D/C/O/oP/eM/dS/MR/oR/cL/ADM) |
| ^14 | CTLOC_ActiveFlag | 有效标志 |
| ^22 | CTLOC_Hospital_DR | **院区DR → ^CT("HOSP")** |
| ^24 | CTLOC_DateActiveFrom | 启用日期 |
| ^25 | CTLOC_DateActiveTo | **停用日期** |
| ^40 | CTLOC_Telephone | 电话 |
| ^43 | (科室简称) | 科室简称 kSJC |
| ^54 | CTLOC_DepartmentHeadUserDR | **科主任 → ^SSU("SSUSR")** |

---

## 字段映射规则

### 用户基本信息

---

#### USER_ROWID

| 属性 | 值 |
|------|-----|
| 标准名 | `userRowid` |
| 匹配模式 | SSUSR_RowId, UserRowID, SSUserRowID, 用户ID, UserId, UserDR |
| 取值表达式 | `RowID` |
| Global | `^SSU("SSUSR")` |
| 节点路径 | `^SSU("SSUSR",RowID)` 的下标值 |
| 置信度 | 1.0 |
| 分类 | 用户标识 |

**说明**：系统用户主键，自增RowID。

```objectscript
s userRowid = RowID
```

---

#### USER_INITIALS

| 属性 | 值 |
|------|-----|
| 标准名 | `userInitials` |
| 匹配模式 | SSUSR_Initials, UserInitials, 缩写, 短名, ShortName, LoginName |
| 取值表达式 | `$p($g(^SSU("SSUSR",RowID)),"^",1)` |
| Global | `^SSU("SSUSR")` |
| 节点路径 | `^SSU("SSUSR",RowID)^1` |
| 置信度 | 0.99 |
| 分类 | 用户基本信息 |

**说明**：用户缩写/短名，唯一索引。通常用作登录名。索引: `^SSU("SSUSR",0,"SSUSR_Initials",$$aLPHAUP(initials),RowID)`。

```objectscript
s userInitials = $p($g(^SSU("SSUSR",RowID)),"^",1)
```

---

#### USER_LOGIN_ID

| 属性 | 值 |
|------|-----|
| 标准名 | `userLoginId` |
| 匹配模式 | SSUSR_LoginID, UserLoginID, 登录ID, LoginUser |
| 取值表达式 | `$p($g(^SSU("SSUSR",RowID)),"^",81)` |
| Global | `^SSU("SSUSR")` |
| 节点路径 | `^SSU("SSUSR",RowID)^81` |
| 置信度 | 0.95 |
| 分类 | 用户基本信息 |

**说明**：用户登录ID。

```objectscript
s userLoginId = $p($g(^SSU("SSUSR",RowID)),"^",81)
```

---

#### USER_ACTIVE

| 属性 | 值 |
|------|-----|
| 标准名 | `userActive` |
| 匹配模式 | SSUSR_Active, UserActive, 有效标志, IsActive, 启用 |
| 取值表达式 | `$p($g(^SSU("SSUSR",RowID)),"^",19)` |
| Global | `^SSU("SSUSR")` |
| 节点路径 | `^SSU("SSUSR",RowID)^19` |
| 置信度 | 0.99 |
| 分类 | 用户状态 |

**说明**：有效标志，Y=启用，N=停用。

```objectscript
s userActive = $p($g(^SSU("SSUSR",RowID)),"^",19)
```

---

#### USER_SURNAME

| 属性 | 值 |
|------|-----|
| 标准名 | `userSurname` |
| 匹配模式 | SSUSR_Surname, UserSurname, 姓, LastName, FamilyName |
| 取值表达式 | `$p($g(^SSU("SSUSR",RowID)),"^",69)` |
| Global | `^SSU("SSUSR")` |
| 节点路径 | `^SSU("SSUSR",RowID)^69` |
| 置信度 | 0.90 |
| 分类 | 用户基本信息 |

**说明**：用户的姓。

```objectscript
s userSurname = $p($g(^SSU("SSUSR",RowID)),"^",69)
```

---

#### USER_GIVEN_NAME

| 属性 | 值 |
|------|-----|
| 标准名 | `userGivenName` |
| 匹配模式 | SSUSR_GivenName, UserGivenName, 名, FirstName |
| 取值表达式 | `$p($g(^SSU("SSUSR",RowID)),"^",70)` |
| Global | `^SSU("SSUSR")` |
| 节点路径 | `^SSU("SSUSR",RowID)^70` |
| 置信度 | 0.90 |
| 分类 | 用户基本信息 |

**说明**：用户的名。

```objectscript
s userGivenName = $p($g(^SSU("SSUSR",RowID)),"^",70)
```

---

#### USER_EMAIL

| 属性 | 值 |
|------|-----|
| 标准名 | `userEmail` |
| 匹配模式 | SSUSR_Email, UserEmail, 邮箱, Email, 电子邮件 |
| 取值表达式 | `$p($g(^SSU("SSUSR",RowID)),"^",101)` |
| Global | `^SSU("SSUSR")` |
| 节点路径 | `^SSU("SSUSR",RowID)^101` |
| 置信度 | 0.95 |
| 分类 | 用户联系方式 |

**说明**：用户的电子邮箱。

```objectscript
s userEmail = $p($g(^SSU("SSUSR",RowID)),"^",101)
```

---

#### USER_MOBILE

| 属性 | 值 |
|------|-----|
| 标准名 | `userMobile` |
| 匹配模式 | SSUSR_Mobile, UserMobile, 手机, 手机号, CellPhone |
| 取值表达式 | `$p($g(^SSU("SSUSR",RowID)),"^",99)` |
| Global | `^SSU("SSUSR")` |
| 节点路径 | `^SSU("SSUSR",RowID)^99` |
| 置信度 | 0.95 |
| 分类 | 用户联系方式 |

**说明**：用户的手机号码。

```objectscript
s userMobile = $p($g(^SSU("SSUSR",RowID)),"^",99)
```

---

#### USER_ID_CARD

| 属性 | 值 |
|------|-----|
| 标准名 | `userIdCard` |
| 匹配模式 | SSUSR_CreatedDate, zJHM, IDCard, 证件号, 身份证号 |
| 取值表达式 | `$p($g(^SSU("SSUSR",RowID)),"^",122)` |
| Global | `^SSU("SSUSR")` |
| 节点路径 | `^SSU("SSUSR",RowID)^122` |
| 置信度 | 0.90 |
| 分类 | 用户基本信息 |

**说明**：⚠️ 字段名是 CreatedDate，但生产代码中存的是证件号码(zJHM)。

```objectscript
s userIdCard = $p($g(^SSU("SSUSR",RowID)),"^",122)
```

---

#### USER_GENDER_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `userGenderCode` |
| 匹配模式 | SSUSR_CreatedTime, xBBM, GenderCode, 性别编码, 性别 |
| 取值表达式 | `$p($g(^SSU("SSUSR",RowID)),"^",123)` |
| Global | `^SSU("SSUSR")` |
| 节点路径 | `^SSU("SSUSR",RowID)^123` |
| 置信度 | 0.90 |
| 分类 | 用户基本信息 |

**说明**：⚠️ 字段名是 CreatedTime，但生产代码中存的是性别编码(xBBM)。0时默认为9(未知)。

```objectscript
s userGenderCode = $p($g(^SSU("SSUSR",RowID)),"^",123)
```

---

### 用户角色标志

---

#### USER_IS_DOCTOR

| 属性 | 值 |
|------|-----|
| 标准名 | `userIsDoctor` |
| 匹配模式 | SSUSR_IsThisDoctor, IsDoctor, 是否医生, DoctorFlag |
| 取值表达式 | `$p($g(^SSU("SSUSR",RowID)),"^",7)` |
| Global | `^SSU("SSUSR")` |
| 节点路径 | `^SSU("SSUSR",RowID)^7` |
| 置信度 | 0.99 |
| 分类 | 用户角色 |

**说明**：是否医生标志(Y/N)，用于权限判断。

```objectscript
s userIsDoctor = $p($g(^SSU("SSUSR",RowID)),"^",7)
```

---

#### USER_DOCTOR_FLAG

| 属性 | 值 |
|------|-----|
| 标准名 | `userDoctorFlag` |
| 匹配模式 | SSUSR_DoctorFlag, DoctorFlag, 医生标志 |
| 取值表达式 | `$p($g(^SSU("SSUSR",RowID)),"^",78)` |
| Global | `^SSU("SSUSR")` |
| 节点路径 | `^SSU("SSUSR",RowID)^78` |
| 置信度 | 0.90 |
| 分类 | 用户角色 |

**说明**：医生标志，与IsThisDoctor不同，此字段用于更细粒度的权限控制。

```objectscript
s userDoctorFlag = $p($g(^SSU("SSUSR",RowID)),"^",78)
```

---

#### USER_NURSE_FLAG

| 属性 | 值 |
|------|-----|
| 标准名 | `userNurseFlag` |
| 匹配模式 | SSUSR_NurseFlag, NurseFlag, 护士标志, IsNurse |
| 取值表达式 | `$p($g(^SSU("SSUSR",RowID)),"^",79)` |
| Global | `^SSU("SSUSR")` |
| 节点路径 | `^SSU("SSUSR",RowID)^79` |
| 置信度 | 0.90 |
| 分类 | 用户角色 |

**说明**：护士标志(Y/N)。

```objectscript
s userNurseFlag = $p($g(^SSU("SSUSR",RowID)),"^",79)
```

---

### 用户关联 — 医护人员

---

#### CARE_PROV_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `careProvDr` |
| 匹配模式 | ssusrCtpcpDr, ctpcpDr, CareProvDR, 医护人员ID, 医护DR |
| 取值表达式 | `$p($g(^SSU("SSUSR",RowID)),"^",9)` |
| Global | `^SSU("SSUSR")` |
| 节点路径 | `^SSU("SSUSR",RowID)^9` |
| 置信度 | 0.99 |
| 分类 | 用户关联 |

**说明**：关联医护人员RowID → ^CTPCP。通过此DR查询医护人员详情。

```objectscript
s careProvDr = $p($g(^SSU("SSUSR",RowID)),"^",9)
```

---

#### CARE_PROV_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `careProvCode` |
| 匹配模式 | CTPCP_Code, CareProvCode, 工号, 员工工号, UserCode, CareProvUserCode |
| 取值表达式 | `$p($g(^CTPCP(ctpcpDr)),"^",2)` |
| Global | `^CTPCP` |
| 节点路径 | `^CTPCP(ctpcpDr,1)^2` |
| 置信度 | 0.99 |
| 分类 | 医护人员信息 |
| 依赖 | careProvDr |

**说明**：医护人员的工号/代码。⚠️ ^CTPCP的第1节点^1位=代码, ^2位=姓名。但这里的"代码"取法比较复杂，实际名称在^2位。

```objectscript
s careProvCode = $p($g(^CTPCP(ctpcpDr)),"^",1)
```

---

#### CARE_PROV_NAME

| 属性 | 值 |
|------|-----|
| 标准名 | `careProvName` |
| 匹配模式 | CTPCP_Desc, CareProvName, 医护姓名, 人员姓名, DoctorName, CPName |
| 取值表达式 | `$p($g(^CTPCP(ctpcpDr)),"^",2)` |
| Global | `^CTPCP` |
| 节点路径 | `^CTPCP(ctpcpDr,1)^2` |
| 置信度 | 0.99 |
| 分类 | 医护人员信息 |
| 依赖 | careProvDr |

**说明**：医护人员的姓名。^CTPCP的第1节点^2位。索引: `^CTPCP(0,"Decs",$$aLPHAUP(name),RowID)`。

```objectscript
s careProvName = $p($g(^CTPCP(ctpcpDr)),"^",2)
```

---

#### CARE_PROV_TITLE

| 属性 | 值 |
|------|-----|
| 标准名 | `careProvTitle` |
| 匹配模式 | CTPCP_Title, CareProvTitle, 职称, Title, 医师职称, 医护职称 |
| 取值表达式 | `$p($g(^CTPCP(ctpcpDr)),"^",13)` |
| Global | `^CTPCP` |
| 节点路径 | `^CTPCP(ctpcpDr,2)^13` |
| 置信度 | 0.95 |
| 分类 | 医护人员信息 |
| 依赖 | careProvDr |

**说明**：⚠️ ^CTPCP跨节点，实际位置取决于哪个节点的^13位。

```objectscript
s careProvTitle = $p($g(^CTPCP(ctpcpDr)),"^",13)
```

---

#### CARE_PROV_ACTIVE

| 属性 | 值 |
|------|-----|
| 标准名 | `careProvActive` |
| 匹配模式 | CTPCP_ActiveFlag, CareProvActive, 医护有效, CTPCPActive, CPActive |
| 取值表达式 | `$p($g(^CTPCP(ctpcpDr)),"^",9)` |
| Global | `^CTPCP` |
| 节点路径 | `^CTPCP(ctpcpDr,1)^9` |
| 置信度 | 0.99 |
| 分类 | 医护人员信息 |
| 依赖 | careProvDr |

**说明**：医护人员有效标志(Y/N)。

```objectscript
s careProvActive = $p($g(^CTPCP(ctpcpDr)),"^",9)
```

---

#### CARE_PROV_MOBILE

| 属性 | 值 |
|------|-----|
| 标准名 | `careProvMobile` |
| 匹配模式 | CTPCP_MobilePhone, CareProvMobile, 医护手机, CPMobile |
| 取值表达式 | `$p($g(^CTPCP(ctpcpDr)),"^",17)` |
| Global | `^CTPCP` |
| 节点路径 | `^CTPCP(ctpcpDr,2)^17` |
| 置信度 | 0.95 |
| 分类 | 医护人员信息 |
| 依赖 | careProvDr |

**说明**：⚠️ 注意：此字段在^CTPCP的**第2节点^17位**。

```objectscript
s careProvMobile = $p($g(^CTPCP(ctpcpDr)),"^",17)
```

---

#### CARE_PROV_EMAIL

| 属性 | 值 |
|------|-----|
| 标准名 | `careProvEmail` |
| 匹配模式 | CTPCP_Email, CareProvEmail, 医护邮箱, CPEmail |
| 取值表达式 | `$p($g(^CTPCP(ctpcpDr)),"^",20)` |
| Global | `^CTPCP` |
| 节点路径 | `^CTPCP(ctpcpDr,2)^20` |
| 置信度 | 0.93 |
| 分类 | 医护人员信息 |
| 依赖 | careProvDr |

**说明**：⚠️ 注意：此字段在^CTPCP的**第2节点^20位**。

```objectscript
s careProvEmail = $p($g(^CTPCP(ctpcpDr)),"^",20)
```

---

#### CARE_PROV_SURGEON

| 属性 | 值 |
|------|-----|
| 标准名 | `careProvSurgeon` |
| 匹配模式 | CTPCP_Surgeon, SurgeonFlag, 外科医生, 是否外科 |
| 取值表达式 | `$p($g(^CTPCP(ctpcpDr)),"^",22)` |
| Global | `^CTPCP` |
| 节点路径 | `^CTPCP(ctpcpDr,2)^22` |
| 置信度 | 0.95 |
| 分类 | 医护人员角色 |
| 依赖 | careProvDr |

**说明**：⚠️ 注意：此字段在^CTPCP的**第2节点^22位**。Y=外科医生。

```objectscript
s careProvSurgeon = $p($g(^CTPCP(ctpcpDr)),"^",22)
```

---

#### CARE_PROV_ANAEST

| 属性 | 值 |
|------|-----|
| 标准名 | `careProvAnaest` |
| 匹配模式 | CTPCP_Anaesthetist, AnaestFlag, 麻醉师, 是否麻醉 |
| 取值表达式 | `$p($g(^CTPCP(ctpcpDr)),"^",23)` |
| Global | `^CTPCP` |
| 节点路径 | `^CTPCP(ctpcpDr,2)^23` |
| 置信度 | 0.95 |
| 分类 | 医护人员角色 |
| 依赖 | careProvDr |

**说明**：⚠️ 注意：此字段在^CTPCP的**第2节点^23位**。Y=麻醉师。

```objectscript
s careProvAnaest = $p($g(^CTPCP(ctpcpDr)),"^",23)
```

---

#### CARE_PROV_SPEC_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `careProvSpecDr` |
| 匹配模式 | CTPCP_Spec_DR, CareProvSpecDR, 专业ID, 专业DR |
| 取值表达式 | `$p($g(^CTPCP(ctpcpDr)),"^",10)` |
| Global | `^CTPCP` |
| 节点路径 | `^CTPCP(ctpcpDr,1)^10` |
| 置信度 | 0.95 |
| 分类 | 医护人员专业 |
| 依赖 | careProvDr |

**说明**：医护人员的专业方向DR → ^CT("sPC")等字典。

```objectscript
s careProvSpecDr = $p($g(^CTPCP(ctpcpDr)),"^",10)
```

---

#### CARE_PROV_PRESC_FLAG

| 属性 | 值 |
|------|-----|
| 标准名 | `careProvPrescFlag` |
| 匹配模式 | cFZZBZ, PrescriptionFlag, 处方资质, PrescFlag |
| 取值表达式 | `$p($g(^CTPCP(ctpcpDr,3)),"^",38)` |
| Global | `^CTPCP` |
| 节点路径 | `^CTPCP(ctpcpDr,3)^38` |
| 置信度 | 0.95 |
| 分类 | 医护人员资质 |
| 依赖 | careProvDr |

**说明**：⚠️ 在^CTPCP的**第3节点^38位**！Y=有处方权→1，N=无→0。

```objectscript
s careProvPrescFlag = $p($g(^CTPCP(ctpcpDr,3)),"^",38)
```

---

### 用户关联 — 科室

---

#### USER_DEFAULT_DEPT_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `userDefaultDeptDr` |
| 匹配模式 | SSUSR_DefaultDept_DR, UserDeptDR, 默认科室ID, 登录科室DR, DefaultLocDR |
| 取值表达式 | `$p($g(^SSU("SSUSR",RowID)),"^",4)` |
| Global | `^SSU("SSUSR")` |
| 节点路径 | `^SSU("SSUSR",RowID)^4` |
| 置信度 | 0.99 |
| 分类 | 用户关联 |

**说明**：用户默认登录科室DR → ^CTLOC。

```objectscript
s userDefaultDeptDr = $p($g(^SSU("SSUSR",RowID)),"^",4)
```

---

#### DEPT_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `deptCode` |
| 匹配模式 | CTLOC_Code, DeptCode, LocCode, 科室代码, CTLOC_Code, CTLOCDeptCode |
| 取值表达式 | `$p($g(^CTLOC($p($g(^PAADM(admId)),"^",4))),"^",1)` |
| Global | `^CTLOC` |
| 节点路径 | `^CTLOC(CTLOC_RowID)^1` |
| 置信度 | 0.99 |
| 分类 | 科室信息 |
| 依赖 | userDefaultDeptDr |

**说明**：科室代码。索引: `^CTLOC(0,"Code",$$aLPHAUP(code),RowID)`。

```objectscript
s deptCode = $p($g(^CTLOC(CTLOC_RowID)),"^",1)
```

---

#### DEPT_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `deptDesc` |
| 匹配模式 | CTLOC_Desc, DeptDesc, LocDesc, 科室名称, CTLOCName, 科室 |
| 取值表达式 | `$p($g(^CTLOC(CTLOC_RowID)),"^",2)` |
| Global | `^CTLOC` |
| 节点路径 | `^CTLOC(CTLOC_RowID)^2` |
| 置信度 | 0.99 |
| 分类 | 科室信息 |
| 依赖 | userDefaultDeptDr |

**说明**：科室名称。索引: `^CTLOC(0,"Desc",$$aLPHAUP(desc),RowID)`。

```objectscript
s deptDesc = $p($g(^CTLOC(CTLOC_RowID)),"^",2)
```

---

#### DEPT_ACTIVE

| 属性 | 值 |
|------|-----|
| 标准名 | `deptActive` |
| 匹配模式 | CTLOC_ActiveFlag, DeptActive, LocActive, 科室有效, CTLOCActive |
| 取值表达式 | `$p($g(^CTLOC(CTLOC_RowID)),"^",14)` |
| Global | `^CTLOC` |
| 节点路径 | `^CTLOC(CTLOC_RowID)^14` |
| 置信度 | 0.99 |
| 分类 | 科室状态 |
| 依赖 | userDefaultDeptDr |

**说明**：科室有效标志(Y/N)。

```objectscript
s deptActive = $p($g(^CTLOC(CTLOC_RowID)),"^",14)
```

---

#### DEPT_TYPE

| 属性 | 值 |
|------|-----|
| 标准名 | `deptType` |
| 匹配模式 | CTLOC_Type, DeptType, LocType, 科室类型, CTLOCType |
| 取值表达式 | `$p($g(^CTLOC(CTLOC_RowID)),"^",13)` |
| Global | `^CTLOC` |
| 节点路径 | `^CTLOC(CTLOC_RowID)^13` |
| 置信度 | 0.97 |
| 分类 | 科室属性 |
| 依赖 | userDefaultDeptDr |

**说明**：科室类型，W=病区/E=执行/dI=发药/D=配药/C=收银/O=其他/oP=手术室/eM=急诊/dS=日间手术/MR=病案/oR=门诊诊室/cL=诊所/ADM=入院点。

```objectscript
s deptType = $p($g(^CTLOC(CTLOC_RowID)),"^",13)
```

---

#### DEPT_WARD_FLAG

| 属性 | 值 |
|------|-----|
| 标准名 | `deptWardFlag` |
| 匹配模式 | CTLOC_WardFlag, WardFlag, 病区标志, 是否病区, IsWard |
| 取值表达式 | `$p($g(^CTLOC(CTLOC_RowID)),"^",5)` |
| Global | `^CTLOC` |
| 节点路径 | `^CTLOC(CTLOC_RowID)^5` |
| 置信度 | 0.97 |
| 分类 | 科室属性 |
| 依赖 | userDefaultDeptDr |

**说明**：是否病区标志(Y/N)。

```objectscript
s deptWardFlag = $p($g(^CTLOC(CTLOC_RowID)),"^",5)
```

---

#### DEPT_HOSPITAL_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `deptHospitalDr` |
| 匹配模式 | CTLOC_Hospital_DR, DeptHospDR, LocHospDR, 科室院区, 院区DR |
| 取值表达式 | `$p($g(^CTLOC(CTLOC_RowID)),"^",22)` |
| Global | `^CTLOC` |
| 节点路径 | `^CTLOC(CTLOC_RowID)^22` |
| 置信度 | 0.97 |
| 分类 | 科室关联 |
| 依赖 | userDefaultDeptDr |

**说明**：⚠️ 院区DR藏在^22位置！是CTLOC的隐藏字段，通过此DR → ^CT("HOSP",HospDR) 获取院区代码和名称。

```objectscript
s deptHospitalDr = $p($g(^CTLOC(CTLOC_RowID)),"^",22)
```

---

#### DEPT_TELEPHONE

| 属性 | 值 |
|------|-----|
| 标准名 | `deptTelephone` |
| 匹配模式 | CTLOC_Telephone, DeptTel, LocTel, 科室电话, CTLOCTel |
| 取值表达式 | `$p($g(^CTLOC(CTLOC_RowID)),"^",40)` |
| Global | `^CTLOC` |
| 节点路径 | `^CTLOC(CTLOC_RowID)^40` |
| 置信度 | 0.95 |
| 分类 | 科室联系方式 |
| 依赖 | userDefaultDeptDr |

**说明**：科室电话。

```objectscript
s deptTelephone = $p($g(^CTLOC(CTLOC_RowID)),"^",40)
```

---

#### DEPT_SHORT_NAME

| 属性 | 值 |
|------|-----|
| 标准名 | `deptShortName` |
| 匹配模式 | kSJC, DeptShortName, LocShortName, 科室简称 |
| 取值表达式 | `$p($g(^CTLOC(CTLOC_RowID)),"^",43)` |
| Global | `^CTLOC` |
| 节点路径 | `^CTLOC(CTLOC_RowID)^43` |
| 置信度 | 0.95 |
| 分类 | 科室信息 |
| 依赖 | userDefaultDeptDr |

**说明**：科室简称，字段名未在类定义中明确标注，实际在^43位置。

```objectscript
s deptShortName = $p($g(^CTLOC(CTLOC_RowID)),"^",43)
```

---

#### DEPT_DATE_ACTIVE_TO

| 属性 | 值 |
|------|-----|
| 标准名 | `deptDateActiveTo` |
| 匹配模式 | CTLOC_DateActiveTo, DeptDateTo, LocEndDate, 科室停用日期 |
| 取值表达式 | `s tDate=$p($g(^CTLOC(CTLOC_RowID)),"^",25) i tDate'="" s tDate=$zd(tDate,3)` |
| Global | `^CTLOC` |
| 节点路径 | `^CTLOC(CTLOC_RowID)^25` |
| 置信度 | 0.95 |
| 分类 | 科室状态 |
| 依赖 | userDefaultDeptDr |

**说明**：科室停用日期(H格式)，需$zd(,3)格式化。判断有效性: `i tDate'=""&&(tDate<+$h) s zT=0`。

```objectscript
s tDate = $p($g(^CTLOC(CTLOC_RowID)),"^",25)
i tDate'="" s tDate = $zd(tDate,3)
s deptDateActiveTo = tDate
```

---

### 用户关联 — 安全组

---

#### USER_GROUP_DR

| 属性 | 值 |
|------|-----|
| 标准名 | `userGroupDr` |
| 匹配模式 | SSUSR_Group, UserGroup, 安全组ID, 用户组DR, SSUserGroupDR |
| 取值表达式 | `$p($g(^SSU("SSUSR",RowID)),"^",5)` |
| Global | `^SSU("SSUSR")` |
| 节点路径 | `^SSU("SSUSR",RowID)^5` |
| 置信度 | 0.99 |
| 分类 | 权限管理 |

**说明**：用户所属安全组DR → ^SSU("sSGRP")。索引: `^SSU("SSUSR",0,"Group",GroupId,UserRowID)`。

```objectscript
s userGroupDr = $p($g(^SSU("SSUSR",RowID)),"^",5)
```

---

#### GROUP_CODE

| 属性 | 值 |
|------|-----|
| 标准名 | `groupCode` |
| 匹配模式 | SSGRP_Code, GroupCode, 安全组代码, SSGroupCode |
| 取值表达式 | `$p($g(^SSU("sSGRP",GroupID)),"^",1)` |
| Global | `^SSU("sSGRP")` |
| 节点路径 | `^SSU("sSGRP",GroupID)^1` |
| 置信度 | 0.95 |
| 分类 | 权限管理 |
| 依赖 | userGroupDr |

**说明**：安全组代码。

```objectscript
s groupCode = $p($g(^SSU("sSGRP",GroupID)),"^",1)
```

---

#### GROUP_DESC

| 属性 | 值 |
|------|-----|
| 标准名 | `groupDesc` |
| 匹配模式 | SSGRP_Desc, GroupDesc, 安全组名称, SSGroupName, 用户组名称 |
| 取值表达式 | `$p($g(^SSU("sSGRP",GroupID)),"^",2)` |
| Global | `^SSU("sSGRP")` |
| 节点路径 | `^SSU("sSGRP",GroupID)^2` |
| 置信度 | 0.95 |
| 分类 | 权限管理 |
| 依赖 | userGroupDr |

**说明**：安全组名称。

```objectscript
s groupDesc = $p($g(^SSU("sSGRP",GroupID)),"^",2)
```

---

### 用户登录信息

---

#### USER_LAST_LOGIN_DATE

| 属性 | 值 |
|------|-----|
| 标准名 | `userLastLoginDate` |
| 匹配模式 | SSUSR_DateLastLogin, LastLoginDate, 最后登录日期 |
| 取值表达式 | `s tDate=$p($g(^SSU("SSUSR",RowID)),"^",44) i tDate'="" s tDate=$zd(tDate,3)` |
| Global | `^SSU("SSUSR")` |
| 节点路径 | `^SSU("SSUSR",RowID)^44` |
| 置信度 | 0.95 |
| 分类 | 登录信息 |

**说明**：用户最后登录日期(H格式)，需$zd(,3)格式化。

```objectscript
s tDate = $p($g(^SSU("SSUSR",RowID)),"^",44)
i tDate'="" s tDate = $zd(tDate,3)
s userLastLoginDate = tDate
```

---

#### USER_LAST_LOGIN_TIME

| 属性 | 值 |
|------|-----|
| 标准名 | `userLastLoginTime` |
| 匹配模式 | SSUSR_TimeLastLogin, LastLoginTime, 最后登录时间 |
| 取值表达式 | `s tTime=$p($g(^SSU("SSUSR",RowID)),"^",45) i tTime'="" s tTime=$zt(tTime)` |
| Global | `^SSU("SSUSR")` |
| 节点路径 | `^SSU("SSUSR",RowID)^45` |
| 置信度 | 0.95 |
| 分类 | 登录信息 |

**说明**：用户最后登录时间。

```objectscript
s tTime = $p($g(^SSU("SSUSR",RowID)),"^",45)
i tTime'="" s tTime = $zt(tTime)
s userLastLoginTime = tTime
```

---

## 常用索引与遍历方式

### 按缩写查用户(最常用)
```objectscript
s RowID = $o(^SSU("SSUSR",0,"SSUSR_Initials",$$aLPHAUP(initials),""))
```

### 按名称查用户
```objectscript
s RowID = $o(^SSU("SSUSR",0,"SSUSR_Name",$$aLPHAUP(name),""))
```

### 按安全组遍历用户
```objectscript
s GroupID = "" f  s GroupID = $o(^SSU("SSUSR",0,"Group",GroupID)) q:GroupID=""  d
. s RowID = "" f  s RowID = $o(^SSU("SSUSR",0,"Group",GroupID,RowID)) q:RowID=""  d
. . ; 处理用户
```

### 按医护人员查用户
```objectscript
s RowID = $o(^SSU("SSUSR",0,"CTPCP",CareProvDR,""))
```

### 按工号查医护人员
```objectscript
s CTPCP_RowID = $o(^CTPCP(0,"Code",$$aLPHAUP(code),""))
```

### 按名称查医护人员
```objectscript
s CTPCP_RowID = $o(^CTPCP(0,"Decs",$$aLPHAUP(name),""))
```

### 按代码查科室
```objectscript
s CTLOC_RowID = $o(^CTLOC(0,"Code",$$aLPHAUP(code),""))
```

### 按名称查科室
```objectscript
s CTLOC_RowID = $o(^CTLOC(0,"Desc",$$aLPHAUP(desc),""))
```

### 通过资源表查医护人员的科室（^RB 关联）
```objectscript
s CTLocId = $o(^rB("rES",0,"CTPCP",CTPCPRowID,0))
i CTLocId'="" d
. s kSMC = $p($g(^CTLOC(CTLocId)),"^",2)   ; 科室名称
. s kSBM = $p($g(^CTLOC(CTLocId)),"^",1)   ; 科室代码
. s hosdr = $P(^CTLOC(CTLocId),"^",22)      ; 院区DR
```

### 全量遍历标准骨架
```objectscript
; 基础数据字典类通用遍历模式
s RowID=0 f  S RowID=$o(Global(RowID)) Q:RowID=""  d
. ; 取值 + 条件过滤 + 输出
```

## 踩坑提示

### ⚠️ CTCareProv 多节点结构（必须写节点号！）

**取值时必须写 `^CTPCP(RowID,1)` 或 `^CTPCP(RowID,3)`，不能省略节点号写 `^CTPCP(RowID)`！**

| 节点 | 内容 | 关键字段 |
|------|------|---------|
| 第1节点(^1-^16) | 基本信息 | 代码、姓名、职称类型、专业 |
| 第2节点(^1-^20) | 联系方式+角色 | 电话、寻呼、医生/外科/麻醉标志 |
| 第3节点(^1-^33) | 扩展信息 | 科室关联、手机、邮箱、姓名拆分 |

**取值时需注意字段属于第几个节点！跨节点偏移量需根据实际节点计算。**

### ⚠️ CTLOC ^22 隐藏字段

院区DR在CTLOC的^22位置，很多接口容易遗漏此字段。

### ⚠️ ^RB("RES") — 医护→科室的第三种关联路径

除了 SSUser→CTLOC 和 CTCareProv→CTLOC 外，还有第三条路：通过 `^rB("rES",0,"CTPCP",CTPCPRowID,0)` 查资源表获取科室ID。生产代码中 Employee 接口使用此方式。

### ⚠️ SSUser 双关联 CTCareProv

^9 (ssusrCtpcpDr) 和 ^14 (SSUSR_CareProv_DR) 都关联医护人员，可能指向不同记录。

### ⚠️ ^122/^123 字段名与用途不符

^122 的字段名是 CreatedDate，但生产代码中存的是证件号码(zJHM)。^123 的字段名是 CreatedTime，但生产代码中存的是性别编码(xBBM)。以实际生产代码为准！

## 别名映射表

| 标准名 | 别名列表 |
|--------|----------|
| careProvCode | CTPCP_Code, CareProvCode, 工号, 员工工号, UserCode |
| careProvName | CTPCP_Desc, CareProvName, 医护姓名, 人员姓名, DoctorName |
| deptCode | CTLOC_Code, DeptCode, LocCode, 科室代码 |
| deptDesc | CTLOC_Desc, DeptDesc, LocDesc, 科室名称 |
| userInitials | SSUSR_Initials, ShortName, LoginName, 缩写 |
| userActive | SSUSR_Active, IsActive, 有效标志 |
| careProvSurgeon | CTPCP_Surgeon, SurgeonFlag, 外科医生 |
| careProvAnaest | CTPCP_Anaesthetist, AnaestFlag, 麻醉师 |
| userIsDoctor | SSUSR_IsThisDoctor, DoctorFlag, 是否医生 |
| userNurseFlag | SSUSR_NurseFlag, NurseFlag, 护士标志 |
| userGroupDr | SSUSR_Group, UserGroup, 安全组ID |

## 规则统计

| 分类 | 规则数 | 说明 |
|------|--------|------|
| 用户基本信息 | 10 | RowID/Initials/LoginID/Active/Surname/GivenName/Email/Mobile/IDCard/GenderCode |
| 用户角色标志 | 3 | IsDoctor/DoctorFlag/NurseFlag |
| 医护人员关联 | 11 | DR/Code/Name/Title/Active/Mobile/Email/Surgeon/Anaest/SpecDR/PrescFlag |
| 科室关联 | 10 | DR/Code/Desc/Active/Type/WardFlag/HospDR/Telephone/ShortName/DateActiveTo |
| 安全组关联 | 3 | GroupDR/Code/Desc |
| 登录信息 | 2 | LastLoginDate/Time |
| **合计** | **39** | |

---
