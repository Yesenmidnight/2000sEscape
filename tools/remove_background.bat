@echo off
REM 批量去除图片背景工具启动器

SET PYTHON=C:\Users\Administrator\AppData\Local\Programs\Python\Python312\python.exe
SET SCRIPT=%~dp0remove_background.py

if "%~1"=="" (
    echo 用法: remove_background.bat ^<输入文件夹^> ^<输出文件夹^> [选项]
    echo.
    echo 示例:
    echo   remove_background.bat ./input ./output
    echo   remove_background.bat ./input ./output --tolerance 30
    echo   remove_background.bat ./input ./output --bg-color FFFFFF
    echo.
    "%PYTHON%" "%SCRIPT%" --help
    exit /b 1
)

"%PYTHON%" "%SCRIPT%" %*
