/*
  Apache II 评分系统 — IRIS 一键部署脚本
  ==========================================
  Terminal 中执行：
    do ##class(ApacheII.Setup).Run()

  也可单独指定命名空间：
    do ##class(ApacheII.Setup).Run("USER")
*/

Class ApacheII.Setup
{

/// 一键部署入口
ClassMethod Run(namespace As %String = {$namespace}) As %Status
{
  Write !, "========================================", !
  Write "  Apache II 评分系统 — IRIS 部署向导", !
  Write "========================================", !

  Set ns = namespace
  Write !, "命名空间: ", ns

  // 1. 编译持久化类
  Write !, "[1/4] 编译持久化类 ApacheII.Model.Assessment ..."
  Set sc = $system.OBJ.Compile("ApacheII.Model.Assessment", "ck")
  If $$$ISERR(sc) {
    Write " 失败!", !, $system.Status.GetErrorText(sc)
    Quit sc
  }
  Write " 完成"

  // 1.5 创建 SQL 表（DdlAllowed 已启用，显式确保表存在）
  Write !, "[2/4] 创建 SQL 表 ApacheII_Model.Assessment ..."
  Try {
    Do ##class(ApacheII.Model.Assessment).%KillExtent()
    Set sc = ##class(ApacheII.Model.Assessment).%BuildIndices()
    If $$$ISERR(sc) {
      Write " 索引创建失败!", !, $system.Status.GetErrorText(sc)
    } Else {
      Write " 完成 (表已就绪)"
    }
  } Catch ex {
    Write " 警告: ", ex.DisplayString()
  }

  // 2. 编译 REST 处理类
  Write !, "[3/4] 编译 REST 处理类 ApacheII.API.Handler ..."
  Set sc = $system.OBJ.Compile("ApacheII.API.Handler", "ck")
  If $$$ISERR(sc) {
    Write " 失败!", !, $system.Status.GetErrorText(sc)
    Quit sc
  }
  Write " 完成"

  // 3. 注册 REST Web Application（切换到 %SYS 命名空间）
  Write !, "[4/4] 注册 REST Web Application /api/apache2 ..."

  New $namespace
  Set $namespace = "%SYS"

  Set webApp = "/api/apache2"
  If ##class(Security.Applications).Exists(webApp) {
    Set sc = ##class(Security.Applications).Delete(webApp)
    If $$$ISERR(sc) {
      Write " 删除旧配置失败!", !, $system.Status.GetErrorText(sc)
    }
  }

  Kill props
  Set props("Name")           = webApp
  Set props("NameSpace")      = ns
  Set props("DispatchClass")  = "ApacheII.API.Handler"
  Set props("Enabled")        = 1
  Set props("AutheEnabled")   = 32
  Set props("CorsOrigin")     = "*"

  Set sc = ##class(Security.Applications).Create(webApp, .props)
  If $$$ISERR(sc) {
    Write " 失败!", !, $system.Status.GetErrorText(sc)
    Quit sc
  }
  Write " 完成"

  Write !!, "========================================", !
  Write "  部署成功！", !
  Write !, "  CSP 页面（直接使用 IRIS 默认 /csp/user/）:", !
  Write "    将 apache2.csp 复制到 <IRIS>\CSP\user\ 目录下", !
  Write "    访问: http://<IRIS主机>:52773/csp/user/apache2.csp", !
  Write !, "  REST API:", !
  Write "    POST http://<IRIS主机>:52773/api/apache2/save", !
  Write "    GET  http://<IRIS主机>:52773/api/apache2/records", !
  Write "    GET  http://<IRIS主机>:52773/api/apache2/health", !
  Write "========================================", !

  Quit $$$OK
}

}