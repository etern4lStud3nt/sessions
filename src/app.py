import sqlite3
from pathlib import Path
from flask import Flask, jsonify, render_template, request, redirect, url_for
from utils.jinja_filters import get_date_diff, get_natural_date, format_hour


app = Flask(__name__)

app.jinja_env.filters["get_date_diff"] = get_date_diff
app.jinja_env.filters["get_natural_date"] = get_natural_date
app.jinja_env.filters["format_hour"] = format_hour

database_path = Path("data/sessions.db")
database_path.parent.mkdir(parents=True, exist_ok=True)

def create_tables():
    db = sqlite3.connect(database_path)
    try:
        db.execute(
            """
            CREATE TABLE IF NOT EXISTS SESSIONS (
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
            CREATE TABLE IF NOT EXISTS PAUSES (
                id INTEGER PRIMARY KEY,
                session_id INTEGER NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT NOT NULL,
                FOREIGN KEY (session_id) REFERENCES SESSIONS(id)
            )
            """
        )

        db.commit()
    finally:
        db.close()

@app.route("/", endpoint="home")
def render_index():
    return render_template("index.html")

@app.route("/history", endpoint="history", methods=["GET"])
def render_history():
    searched_date = request.values.get("date")

    db = sqlite3.connect(database_path)
    try:
        if searched_date:
            searched_date = searched_date.split("T", 1)[0]

            sessions = db.execute(
                """
                SELECT * FROM SESSIONS
                WHERE date(?) BETWEEN date(start_time) AND date(end_time)
                """,
                (searched_date,),
            ).fetchall()
        else:
            sessions = db.execute(
                "SELECT * FROM SESSIONS"
            ).fetchall()
    finally:
        db.close()

    return render_template("history.html", sessions=sessions)

@app.route("/settings", endpoint="settings", methods=["GET"])
def render_settings():
    return render_template("settings.html")    

@app.route("/sessions", methods=["GET"])
def get_all_sessions():
    db = sqlite3.connect(database_path)
    try:
        sessions = db.execute("SELECT * FROM SESSIONS").fetchall()
        pauses = db.execute("SELECT * FROM PAUSES").fetchall()
    finally:
        db.close()

    return jsonify({
        "sessions": sessions,
        "pauses": pauses,
    })

@app.route("/sessions", methods=["POST"])
def create_session():
    data = request.get_json()

    session_type = data["session"]
    session_start_time = data["sessionStartTime"]
    session_end_time = data["sessionEndTime"]
    pause_logs = data.get("sessionPauseLogs", [])

    db = sqlite3.connect(database_path)
    try:
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

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

    return jsonify({
        "sessions": sessions,
        "pauses": pauses,
    }), 201

@app.route("/sessions", methods=["DELETE"])
def delete_all_sessions():
    db = sqlite3.connect(database_path)
    try:
        # Delete child records before parent records.
        db.execute("DELETE FROM PAUSES")
        db.execute("DELETE FROM SESSIONS")
        db.commit()
    except Exception:
        db.rollback()
        app.logger.exception("Error deleting database records")
        return jsonify({"error": "Failed to delete sessions"}), 500
    finally:
        db.close()

    return "", 204

@app.route("/settings", methods=["POST"])
def update_settings():
    # TODO: Process and save submitted settings.
    return redirect(url_for("index"))


if __name__ == "__main__":
    create_tables()
    app.run(host="0.0.0.0", port=5000, debug=True)
