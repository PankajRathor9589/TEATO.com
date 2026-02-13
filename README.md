# TEATO.com
Food , food delivery

## Windows quick help (CMD)

Agar `nl` ya `tail` command ka error aaye (`not recognized`), CMD me ye alternatives use karo:

```bat
REM README ko line numbers ke saath dekhne ke liye
findstr /n ".*" README.md

REM .gitignore ke last 20 lines dekhne ke liye (PowerShell call)
powershell -Command "Get-Content .gitignore | Select-Object -Last 20"
```

## Git status clean karne ke liye

Agar `git status` me `.venv`, `__pycache__`, `* - Copy`, `gh`, `db.sqlite3` ya media files aa rahi ho:

```bat
git restore .
git clean -fd
```

Agar galti se tracked ho chuki ho to:

```bat
git rm -r --cached -- ".venv" "__pycache__" "* - Copy" "gh" "db.sqlite3" "media"
git commit -m "Stop tracking local generated files"
```

## Agar `ModuleNotFoundError: No module named django` aaye

`git clean -fd` ne aapki `.venv` ke untracked packages delete kar diye honge. Fix ke liye direct ye chalao:

```bat
cd /d E:\TEATO
.venv\Scripts\activate
python -m pip install --upgrade pip
pip install django pillow
python manage.py check
python manage.py migrate
python manage.py runserver
```

## Agar `ImportError: cannot import name 'views' from 'teato_app'` aaye

Is error ka matlab hai `teato_app/views.py` missing ya kharab hai. CMD me ye run karo:

```bat
cd /d E:\TEATO
.venv\Scripts\activate

(
echo from django.shortcuts import render
echo.
echo def home(request):
echo     return render(request, "index.html")
) > teato_app\views.py

(
echo from django.urls import path
echo from . import views
echo.
echo urlpatterns = [
echo     path("", views.home, name="home"),
echo ]
) > teato_app\urls.py

for /d /r %d in (__pycache__) do @if exist "%d" rmdir /s /q "%d"
del /s /q *.pyc

python manage.py check
python manage.py migrate
python manage.py runserver
```

### Important (safe clean)
Aage se `.venv` delete hone se bachane ke liye:

```bat
git clean -fd -e .venv/
```
