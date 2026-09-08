# HIS 接口对接

## 集成平台接口（Ensemble）

主入口类 `web.DHCENS.EnsHISService`，方法 `DHCHisInterface(actionCode, data)`：

| ActionCode                     | 触发时机                  | 说明                   |
| ------------------------------ | ------------------------- | ---------------------- |
| `SENDTAKEAPPTSCHEDULEINFO`   | 预约创建成功              | 推送预约挂号信息       |
| `SENDCANCELAPPTSCHEDULEINFO` | 预约取消                  | 推送取消预约信息       |

```objectscript
s rtn = ##class(web.DHCENS.EnsHISService).DHCHisInterface("SENDTAKEAPPTSCHEDULEINFO", RBAppId)
```

## 外部系统接口

| 接口类                                | 方法                                     | 用途              |
| ------------------------------------- | ---------------------------------------- | ----------------- |
| `dhcinterface.TeleClient`           | `notifyGetNumber(RBASRowId)`           | 通知 114 电话平台 |
| `dhcinterface.DoctorApptScheClient` | `SetScreenDisplayMsg(RBASId,FullFlag)` | 刷新大屏号别      |

## 配置驱动功能开关

```objectscript
s AppStartTime = ##class(web.DHCOPRegConfig).GetSpecConfigNode("AppStartTime", HospitalID)
```

| 配置键                      | 功能               |
| --------------------------- | ------------------ |
| `IFTeleAppStart`          | 114 电话预约对接    |
| `IFScreenStart`           | 大屏号别显示        |
| `AppReturnNotAllowRegAdd` | 预约回归不释放增号   |
| `ReturnNotAllowAdd`       | 退号不释放增资源     |
| `AppStartTime` / `AddStartTime` | 预约/加号开放时间 |
| `AppBreakLimit`           | 爽约次数限制        |
| `AdvanceAppAdm`           | 提前取预约号        |

## REST API 模式

```objectscript
Class ApacheII.API.Handler Extends %CSP.REST
{
XData UrlMap
{
<Routes>
  <Route Url="/save"    Method="POST" Call="SaveData"/>
  <Route Url="/records" Method="GET"  Call="GetRecords"/>
</Routes>
}
```

## 会话与认证

`websys.SessionLogon.Logon()` → Session 变量：

| 变量 | 含义 |
|------|------|
| `%session.Get("LOGON.USERID")` | 用户 ID |
| `%session.Get("LOGON.USERNAME")` | 用户名 |
| `%session.Get("LOGON.GROUPID")` | 安全组 ID |
| `%session.Get("LOGON.CTLOCID")` | 登录科室 ID |
| `%session.Get("LOGON.HOSPID")` | 登录院区 ID |
| `%session.Get("LOGON.WARDID")` | 登录病区 ID |

## 前端调用后端（加密模式）

```javascript
// JS
var encrypted = websys.Page.Encrypt($lb("web.Class", "Method", paramStr));
$.ajax({ url: $URL, data: { Encrypt: encrypted } });
```

```objectscript
// ObjectScript
Set decrypted = ##class(websys.Page).Decrypt(%request.Get("Encrypt"))
Set className = $lg(decrypted, 1), methodName = $lg(decrypted, 2)
```

## 外部系统依赖

| 系统 | 地址/类 | 用途 |
|------|---------|------|
| 湖南省医保平台 | `dps.hun.hsip.gov.cn` | 医保结算 |
| 药品信息查询 | `192.168.90.235/LCYY/interface/YPXX.aspx` | 药品同步 |
| CA 数字签名 | `CA.DigitalSignatureService` | 电子签名 |
| 临床决策支持(CDSS) | `DHCDSS.js` | 辅助诊疗 |
| Portal 门户 | `DtPortal.Doctor.DHCDocComService` | 数据推送 |

## 部署

```objectscript
do ##class(ApacheII.Setup).Run()
```
