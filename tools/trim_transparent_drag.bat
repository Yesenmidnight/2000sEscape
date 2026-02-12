@echo off
setlocal enabledelayedexpansion

SET PYTHON=C:\Users\Administrator\AppData\Local\Programs\Python\Python312\python.exe
SET SCRIPT=%~dp0trim_transparent.py

echo ============================================
echo     Trim Transparent Edges Tool
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
    echo Usage: Drag a folder containing PNG images onto this bat file
    echo.
    echo This tool will crop transparent edges from all PNG images.
    echo Output will be saved to: input_folder\_trimmed
    echo.
    pause
    exit /b 1
)

REM Get input folder
set "INPUT=%~1"
set "OUTPUT=%INPUT%\_trimmed"

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

"%PYTHON%" "%SCRIPT%" "%INPUT%" "%OUTPUT%"

echo.
pause
