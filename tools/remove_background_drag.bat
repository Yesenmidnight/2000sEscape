@echo off
setlocal enabledelayedexpansion

SET PYTHON=C:\Users\Administrator\AppData\Local\Programs\Python\Python312\python.exe
SET SCRIPT=%~dp0remove_background.py

echo ============================================
echo     Batch Remove Image Background Tool
echo ============================================
echo.

REM Check Python
if not exist "%PYTHON%" (
    echo ERROR: Python not found
    pause
    exit /b 1
)

REM Check Script
if not exist "%SCRIPT%" (
    echo ERROR: Script not found: %SCRIPT%
    pause
    exit /b 1
)

REM Check if folder was dragged
if "%~1"=="" (
    echo Usage: Drag a folder onto this bat file
    echo.
    echo Or run: remove_background_drag.bat "folder_path"
    echo.
    pause
    exit /b 1
)

REM Get input folder (handle paths with spaces)
set "INPUT=%~1"
set "OUTPUT=%INPUT%\_transparent"

echo Input: %INPUT%
echo Output: %OUTPUT%
echo.

REM Check input folder
if not exist "%INPUT%\" (
    echo ERROR: Folder not found
    pause
    exit /b 1
)

echo Processing...
echo.

REM Run Python script (use quotes for paths with spaces)
"%PYTHON%" "%SCRIPT%" "%INPUT%" "%OUTPUT%"

echo.
if errorlevel 1 (
    echo ============================================
    echo Error! Code: %errorlevel%
    echo ============================================
) else (
    echo ============================================
    echo Done!
    echo ============================================
)
echo.
pause
