@echo off
start "Test Carte" cmd /k "set PENTAHO_DI_JAVA_OPTIONS=-Xmx1024m && cd /d D:\kettle2012\data-integration && Carte.bat D:\kettle2012\data-integration\pwd\carte-config-master-8080.xml"
echo STARTED
