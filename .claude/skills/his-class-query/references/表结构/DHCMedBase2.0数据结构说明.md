---
title: "DHCMedBase2.0数据结构说明"
source: "document"
source_file: "院感表结构/DHCMedBase2.0数据结构说明.xlsx"
created: "2026-05-13T06:28:08Z"
---


## Sheet1

| # | | | | 1 医政管理基础字典表 DHCMed. SS. Dictionary |
| --- | --- | --- | --- | --- |
| 序号 | 列名 | 描述 | 类型 | 备注 |
| 1 | Active | 是否有效 | Boolean | |
| 2 | Code | 代码 | Stirng | |
| 3 | Description | 描述 | Stirng | |
| 4 | DateFrom | 开始日期 | Date | |
| 5 | DateTo | 结束日期 | Date | |
| 6 | HospitalDr | 医院指针 | Integer | CT\_Hospital |
| 7 | StrA | 备用 A | Stirng | |
| 8 | StrB | 备用 B | Stirng | |
| 9 | StrC | 备用 C | Stirng | |
| 10 | StrD | 备用 D | Stirng | |
| 11 | Type | 类型 | Stirng | |
| ^DHCMed. SS. DictionaryD | | | | |
| ^DHCMed. SS. DictionaryI | | | | |
| | | | | |
| 2 医政管理产品表 DHCMed. SS. Products | | | | |
| 序号 | 列名 | 描述 | 类型 | 备注 |
| 1 | ProActive | 是否有效 | Boolean | |
| 2 | ProCode | 产品代码 | String | |
| 3 | ProName | 产品描述 | String | |
| 4 | ProResume | 备注 | String | |
| 5 | ProVersion | 版本号 | String | |
| 6 | ShowIndex | 显示顺序 | String | |
| 7 | IconClass | 图标样式 | String | |
| ^DHCMed. SS. ProductsD | | | | |
| ^DHCMed. SS. ProductsI | | | | |
| | | | | |
| 3 医政管理配置项目表 DHCMed. SS. Config | | | | |
| 序号 | 列名 | 描述 | 类型 | 备注 |
| 1 | Keys | 键 | String | |
| 2 | Val | 值 | String | |
| 3 | HospitalDr | 医院指针 | Integer | CT\_Hospital |
| 4 | ProductDr | 产品指针 | Integer | DHCMed. SS. Products |
| 5 | Resume | 备注 | String | |
| 6 | ValueDesc | 值说明 | String | |
| 7 | Description | 描述 | Stirng | |
| ^DHCMed. SS. ConfigD | | | | |
| ^DHCMed. SS. ConfigI | | | | |
| | | | | |
| 4 医政管理菜单表 DHCMed. SS. Menus | | | | |
| 序号 | 列名 | 描述 | 类型 | 备注 |
| 1 | MenuCaption | 菜单名称 | String | |
| 2 | MenuCode | 菜单代码 | String | |
| 3 | ParentMenuDr | 父菜单指针 | Integer | DHCMed. SS. Menus |
| 4 | ProductDr | 产品指针 | Integer | DHCMed. SS. Products |
| 5 | ShowIndex | 显示顺序 | Integer | |
| 6 | LinkUrl | 链接 | String | |
| 7 | IconClass | 图标 | String | |
| 8 | Expression | 表达式 | String | |
| ^DHCMed. SS. MenusD | | | | |
| ^DHCMed. SS. MenusI | | | | |
| | | | | |
| 5 医政管理菜单操作表 DHCMed. SS. MenuOperation | | | | |
| 序号 | 列名 | 描述 | 类型 | 备注 |
| 1 | MenuDr | 菜单指针 | Integer | DHCMed. SS. Menus |
| 2 | OperaCode | 操作代码 | Stirng | |
| 3 | OperaName | 操作描述 | Stirng | |
| ^DHCMed. SS. MenuOperationD | | | | |
| ^DHCMed. SS. MenuOperationI | | | | |
| | | | | |
| 6 医政管理菜单权限表 DHCMed. SS. Security | | | | |
| 序号 | 列名 | 描述 | 类型 | 备注 |
| 1 | MenuDr | 菜单指针 | Integer | DHCMed. SS. Menus |
| 2 | ProductDr | 产品指针 | Integer | DHCMed. SS. Products |
| 3 | SSGroupDr | 安全组指针 | Integer | SS\_Group |
| 4 | Authority | 权限 | Boolean | |
| ^DHCMed. SS. SecurityD | | | | |
| ^DHCMed. SS. SecurityI | | | | |
| | | | | |
| 7 医政管理菜单操作权限表 DHCMed. SS. SecurityOpera | | | | |
| 序号 | 列名 | 描述 | 类型 | 备注 |
| 1 | Authority | 权限 | Boolean | |
| 2 | MenuOperaDr | 菜单操作指针 | Integer | DHCMed. SS. MenuOperation |
| 3 | SSGroupDr | 安全组指针 | Integer | SS\_Group |
| ^DHCMed. SS. SecurityOperaD | | | | |
| ^DHCMed. SS. SecurityOperaI | | | | |
| | | | | |
| 8 消息记录表 DHCMed. SS. Message | | | | |
| 序号 | 列名 | 描述 | 类型 | 备注 |
| 1 | MessageDr | 消息指针 | String | SS\_Message |
| 2 | PaadmDr | 就诊指针 | String | PA\_Adm |
| ^DHCMed. SS. MessageD | | | | |
| ^DHCMed. SS. MessageI | | | | |
| | | | | |
| 9 疾病字典维护(DHCMed. SS. Disease) | | | | |
| 说明：用于慢病、食源性疾病、重大精神疾病、食物中毒、农业中毒等各类报卡 | | | | |
| 序号 | 列名 | 描述 | 类型 | 备注 |
| 1 | RowId | | | |
| 2 | IDCode | 疾病代码 | String | 不同产品下疾病代码不允许重复 |
| 3 | IDDesc | 疾病描述 | String | |
| 4 | IDICD10 | 疾病 ICD10 | String | |
| 5 | IDCateDr | 疾病分类 | Dr | 指向 DHCMed. SS. Dictionary |
| 6 | IDProductDr | 产品 | Dr | 指向 DHCMed. SS. Products |
| 7 | IDIsActive | 是否有效 | Boolean | |
| 8 | IDResume | 备注 | String | |
| | | | | |
| 9.1 疾病别名维护(DHCMed. SS. DiseaseAlias) | | | | |
| 序号 | 列名 | 描述 | 类型 | 备注 |
| 1 | ParRef | | | |
| 2 | ChildSub | | | |
| 3 | IDAlias | 别名 | String | |
| | | | | |
| 9.2 疾病 ICD10 维护(DHCMed. SS. DiseaseICD) | | | | |
| 序号 | 列名 | 描述 | 类型 | 备注 |
| 1 | ParRef | | | |
| 2 | ChildSub | | | |
| 3 | IDICD10 | ICD10 | String | |
| 4 | IDICDDesc | 疾病名称 | String | |
| 5 | IDExWords | 排除关键字 | String | 多值#分隔 |


---

## Sheet2


---

## Sheet3