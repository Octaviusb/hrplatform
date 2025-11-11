@echo off
echo Iniciando servidor...
start /B npm run dev
timeout /t 5 /nobreak > nul
echo Probando endpoint de health...
curl -s http://localhost:4000/health
echo.
echo Deteniendo servidor...
taskkill /f /im node.exe > nul 2>&1
echo Prueba completada.