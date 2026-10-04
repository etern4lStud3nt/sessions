# Sessions

#### Video demo: <https://youtu.be/mQZ--X2JmGM>

Sessions is a simple, productivity web application, based around the pomodoro technique. As described in Wikipedia:
> The original technique consists of deciding on the task, setting the timer (typically for 25 minutes), working on the task, taking a short break (typically 5–10 minutes) when the timer rings. This repeats until four pomodori are completed, after which a long break (typically 20 to 30 minutes) is taken before starting the cycle again.

In this app each session can be categorized as either a `focus` or a `break` session. The target amount of pomodoros is set to four, they are 25 minutes each and are accompanied by three 5-minute breaks. When the fourth pomodoro is completed, the `set` is considered finished and the timer resets to its initial state.

The app features 3 key elements: 
- A text display with the remaining time for the `focus/break` session that is currently running
- A bubble progress bar: Black bubbles represent focus sessions, grey bubbles represent break sessions and white bubbles indicate the user hasn't reached this session yet.
- The user can use the `Start`, `Stop` and `Reset` buttons to control the timer.
    - The `Start` button also works as a pause and unpause button and is responsible for whether the timer runs or not.
    - Pressing the `Stop` button finishes the session and set early, while also logging the progress in an SQLite database.
    - `Reset` resets the timer to its initial state without logging progress.

## Features 
<!-- Partially AI Generated -->

- Start, pause, resume, stop, and reset
- Move automatically between focus and break phases.
- Track progress across a four-focus-session set.
- Record start and end timestamps for every completed phase.
- Record pause intervals associated with a session.
- Display a readable history table with natural-language dates and durations.
- Run directly with Python or package the application as a Docker image.

## How it works

### Project structure

<!-- Partial AI Generation (ChatGPT) -->

```text
sessions/
├── data/sessions.db
├── src/
│   ├── app.py
│   ├── static/
│   │   ├── style.css
│   │   └── timer.js
│   ├── templates/
│   │   ├── index.html
│   │   └── history.html
│   └── utils/
│       └── jinja_filters.py
├── .github/workflows/ci.yml
├── .gitignore
├── Dockerfile
├── LICENSE
├── README.md
└── requirements.txt
```

### Content & Styling
The style for every page stored inside the `src/templates` directory is handled by `style.css` within `src/static`. A minimal, simple approach was used for the styling of the pages as it helps with minimizing user distraction. The general design of each page is centered around flexbox, which makes aligning document elements simpler. `index.html` essentially consists of four elements, the counter display, the bubble progress bar, and the three `Start`, `Stop`, and `Reset` buttons. `history.html` holds a table with five headers (`ID, Session, Start Date, End Date, Duration (seconds)`), that display information about previously logged sessions.

### The frontend

`Timer.js` is responsible for all the frontend operations. A `state` object is responsible for tracking the real-time state of the timer. It includes seven elements: `timerId, remaining, sessionIndex, phase, startTime, endTime, pauseLogs` responsible for identifying the current running session and the timer remaining for its completion, as well as holding the values of the times it started, ended and was paused in `Date` format. Functions present in the file include `start`, `pause`, `unpause`, `stop`, `reset` and `switchSession`, which are self-explanatory. 

Once a timer runs out or the user presses the `Stop` button, `timer.js` stops the timer, executes `logSession`, a function that asynchronously makes a `POST` request at the `/sessions` page, passing all the session information as JSON, using the `JSON.stringify` method and serializing the `startTime` and `endTime` fields as ISO date strings in the process.

### The backend

`app.py` is responsible for the main backend operations like routing `GET` endpoints in the `/` and `/history` pages and rendering the corresponding `.html`, as well as handling the `POST` request that was referenced earlier. It connects to the sessions database at the `data/sessions.db` path and creates one if it doesn't exist. The `SESSIONS` table consists of four fields: `id`, `type`, `start_time` and `end_time`. The `PAUSES` table records pause intervals associated with a session.

Once the server detects a `POST` request at `/sessions`, `app.py` gets the JSON object, connects to `sessions.db`, and inserts the data into the database, returning a `201` message.

A helper script called `jinja_filters` is created under `src/utils/`. It contains three functions `parse_js_date`, `get_date_diff` and `get_natural_date`, responsible for parsing ISO date strings to Python `datetime` objects, returning the time difference between two ISO date strings and converting an ISO date to natural language format, respectively. The main use of this file is to assist in representing the `Duration` column of the session logs table in `history.html`, using Jinja environment filters.

## Running locally

### Requirements

- Python 3.10 or later
- `pip`

Install the only application dependency from the project root:

```bash
pip install -r requirements.txt
```

Start the development server with:

```bash
python src/app.py
```

Then open <http://localhost:5000>. If it doesn't already exist, the application creates
the `data/` directory and the SQLite database at `data/sessions.db`. The server runs locally on port 5000.

## Running with Docker

Build the image from the project root:

```bash
docker build -t sessions .
```

Run it without persistent storage:

```bash
docker run --rm -p 5000:5000 sessions
```

To preserve the history after removing the container, mount a named volume:

```bash
docker run --rm -p 5000:5000 -v sessions-data:/app/data sessions
```