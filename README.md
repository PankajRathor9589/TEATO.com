# TEATO.com

Cleaned Django starter structure for **TEATO Food Studio**.

## Structure

- `manage.py`
- `run_teato.bat` (one-command Windows start script)
- `food_studio/` (project config: settings, urls, asgi, wsgi)
- `teato_app/` (app: views, urls, models, admin)
- `templates/home.html`
- `static/style.css`
- `media/`

## Ab kya kare (quick start)

Windows CMD me project root par:

```bat
run_teato.bat
```

Ye script automatic ye kaam karegi:
- `.venv` activate
- dependencies install/update
- `python manage.py check`
- `python manage.py migrate`
- `python manage.py runserver`

## Run (Windows)

```bat
.venv\Scripts\activate
pip install django pillow
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

Open: <http://127.0.0.1:8000>

## Create admin user (superuser)

```bat
python manage.py createsuperuser
```

Username tips:
- Use only letters, numbers, and `@ . + - _`
- Do not use spaces before/after username

Password tips:
- Minimum 8 characters
- Avoid very common passwords

If interactive input is giving issues, use:

```bat
python manage.py createsuperuser --username Pankaj_12 --email you@example.com
```

## Windows CMD troubleshooting

- Do **not** type the terminal prompt text like `(.venv) E:\TEATO>`; run only the command after it.
- Run multi-argument commands on a **single line**.

Correct:

```bat
python -m compileall manage.py food_studio teato_app
```

Wrong (this runs `food_studio` as a separate command):

```bat
python -m compileall manage.py
food_studio teato_app
```

## Notes

- This repo now follows a standard Django layout.
- Keep duplicate folders like `*- Copy` or `media - Copy` out of the project root.
