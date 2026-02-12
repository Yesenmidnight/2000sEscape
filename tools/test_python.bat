@echo off
echo Testing Python...
echo.

SET PYTHON=C:\Users\Administrator\AppData\Local\Programs\Python\Python312\python.exe

echo Checking Python path: %PYTHON%
if exist "%PYTHON%" (
    echo Python found!
    echo.
    echo Python version:
    "%PYTHON%" --version
    echo.
    echo Pillow check:
    "%PYTHON%" -c "from PIL import Image; print('Pillow is installed and working!')"
) else (
    echo Python NOT found at: %PYTHON%
    echo.
    echo Searching for Python in PATH...
    where python
)

echo.
echo Press any key to close...
pause >nul
