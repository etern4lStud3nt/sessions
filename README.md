# Sessions
A productivity app for tracking focus and break sessions using the Pomodoro technique.

## Features
- Start, pause, resume, stop and reset the timer
- Record session data in SQLite
- View session history

## Run locally

### Requirements
- Python 3.10 or later
- `pip`

### Installation

Install the project dependencies from the project root:

```bash
pip install -r requirements.txt
```

### Start the application

```bash
python src/app.py
```

Open the application at <http://localhost:5000>.

The local SQLite database is stored at `data/sessions.db`.

## Run with Docker

### Requirements

- Docker

### Build the Image

Run this command from the project root to build the `sessions` image:

```bash
docker build -t sessions .
```

### Run the Container

Without persistent database storage:

```bash
docker run --rm -p 5000:5000 sessions
```

Alternatively, to persist the database using the `sessions-data` volume:

```bash
docker run --rm -p 5000:5000 -v sessions-data:/app/data sessions
```

Open the application at <http://localhost:5000>.

The `sessions-data` Docker volume stores the SQLite database at `/app/data`, allowing session history to persist when the container is removed.

## Project Structure

```text
sessions/
├── data/
├── src/
│   ├── app.py
│   ├── static/
│   ├── templates/
│   └── utils/
├── Dockerfile
├── README.md
└── requirements.txt
```