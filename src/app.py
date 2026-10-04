from pathlib import Path
from flask import Flask, jsonify, render_template, request
from utils.jinja_filters import get_date_diff, get_natural_date
import sqlite3


app = Flask(__name__)
app.jinja_env.filters["get_date_diff"] = get_date_diff
app.jinja_env.filters["get_natural_date"] = get_natural_date

database_path = Path("data/sessions.db")
database_path.parent.mkdir(parents=True, exist_ok=True)


with sqlite3.connect(database_path) as db:
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS SESSIONS
        (
            id INTEGER PRIMARY KEY,
            type TEXT NOT NULL
                CHECK (type IN ('focus', 'break', 'pause')),
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL
        )
        """
    )
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS PAUSES
        (
            id INTEGER PRIMARY KEY,
            session_id INTEGER NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            FOREIGN KEY (session_id) REFERENCES SESSIONS(id)
        )
        """
    )


@app.route("/")
def home():
    return render_template("index.html")

@app.route("/sessions", methods=["POST"])
def log_session():
    data = request.get_json()
    session_type = data["session"]
    session_start_time = data["sessionStartTime"]
    session_end_time = data["sessionEndTime"]
    pause_logs = data.get("sessionPauseLogs", [])

    with sqlite3.connect(database_path) as db:
        session_id = db.execute(
            """
            INSERT INTO SESSIONS (type, start_time, end_time)
            VALUES (?, ?, ?)
            RETURNING id
            """,
            (session_type, session_start_time, session_end_time),
        ).fetchone()[0]

        for pause_start, pause_end in pause_logs:
            db.execute(
                """
                INSERT INTO PAUSES (session_id, start_time, end_time)
                VALUES (?, ?, ?)
                """,
                (session_id, pause_start, pause_end),
            )

        db.commit()

        sessions = db.execute("SELECT * FROM SESSIONS").fetchall()
        pauses = db.execute("SELECT * FROM PAUSES").fetchall()

    return jsonify({
        "sessions": sessions,
        "pauses": pauses,
    }), 201
    
@app.route("/history", methods=["GET"])
def history():
    with sqlite3.connect(database_path) as db:
        sessions = db.execute("SELECT * FROM SESSIONS").fetchall()
        # Get pauses as well in the future        
    return render_template("history.html", sessions=sessions)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)