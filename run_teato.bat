@echo off
setlocal

cd /d "%~dp0"

echo [1/5] Activating virtual environment...
if not exist ".venv\Scripts\activate.bat" (
  echo ERROR: .venv not found. Create it first: python -m venv .venv
  exit /b 1
)
call .venv\Scripts\activate.bat

echo [2/5] Installing dependencies...
python -m pip install --upgrade pip >nul
python -m pip install django pillow

echo [3/5] Running checks...
python manage.py check || exit /b 1

echo [4/5] Applying migrations...
python manage.py migrate || exit /b 1

echo [5/5] Starting server at http://127.0.0.1:8000 ...
python manage.py runserver

endlocal
