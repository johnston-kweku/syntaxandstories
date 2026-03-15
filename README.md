# SAS (SyntaxAndStories)

SAS is a Django-powered blogging and social platform for developers and writers. It combines article publishing, social features (follow, like, save), and AJAX-driven interactions for a responsive UX.

Table of contents
- Features
- Tech stack
- Requirements
- Installation
- Development
- Troubleshooting
- Contributing
- License

## Features

- Content publishing: title + content, drafts, prevent empty publishes
- Dynamic delete and interactions via AJAX
- Social: follow/unfollow, likes, saves
- Profile pages (posts, liked, saved)
- Feed: engagement ranking + time decay
- Responsive UI built with TailwindCSS

## Tech Stack

- Backend: Python, Django
- Frontend: HTML, TailwindCSS, JavaScript
- Database (dev): SQLite

## Requirements

- Python 3.10+ (recommendation)
- Pip dependencies are in `requirements.txt` (project root)

If you prefer Pipenv the repository also contains `Pipfile` (optional). The instructions below use `requirements.txt`.

## Installation (quick start)

Clone and prepare the environment:

```bash
git clone https://github.com/johnston-kweku/syntaxandstories.git
cd syntaxandstories
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Apply migrations and run the dev server:

```bash
python manage.py migrate
python manage.py runserver
```

## Development

- Static assets are built with Tailwind; see `package.json` if you run a dev watcher (`npm run dev`).
- To create a superuser:

```bash
python manage.py createsuperuser
```

## Troubleshooting

- If you see migration or DB errors during development, removing `db.sqlite3` and re-running `migrate` can help (dev only).
- If dependencies mismatch, recreate the virtualenv and reinstall: remove `.venv`, recreate and `pip install -r requirements.txt`.

## Screenshots

Place screenshots in the `screenshots/` directory. File names should avoid special characters.

## Contributing

Contributions welcome. Please open issues or PRs. Add a short `CONTRIBUTING.md` for contribution guidelines.

## License

Add a `LICENSE` file to the project root. If you want MIT, Apache-2.0, or another license, let me know and I can add it.

---
If you'd like, I can: add badges, create `CONTRIBUTING.md` and `LICENSE`, or switch the README to reference Pipenv commands instead. Tell me which.

