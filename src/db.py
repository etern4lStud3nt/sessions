import sqlite3
from pathlib import Path

DATABASE_PATH = Path("data/sessions.db")
DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)

def _connect():
    return sqlite3.connect(DATABASE_PATH)

def create_table():
    db = _connect()
    try:
        db.execute(
            """
            CREATE TABLE IF NOT EXISTS SESSIONS (
                id INTEGER PRIMARY KEY,
                type TEXT NOT NULL
                CHECK (type IN ('focus', 'break')),
                start_timestamp TEXT NOT NULL,
                end_timestamp TEXT NOT NULL
            )
            """
        )
        db.commit()
    except:
        print("Error trying to create SESSIONS table")
        db.rollback()
        raise
    finally:
        db.close()
        
def get_sessions(date: str = None):
    db = _connect()
    try:
        if date is None:
            sessions = db.execute("SELECT * FROM SESSIONS").fetchall()
        else:
            sessions = db.execute(
                """
                SELECT * FROM SESSIONS
                WHERE date(?) BETWEEN date(start_timestamp) AND date(end_timestamp)
                """
            , (date,)).fetchall()
    except:
        raise
    finally:
        db.close()

    return sessions

def get_latest_sessions(amount):
    db = _connect()
    try:
        sessions = db.execute(
            """
            SELECT * FROM SESSIONS
            ORDER BY end_timestamp DESC
            LIMIT ?
            """
        , (amount,)).fetchall()
    finally:
        db.close()
        
    return sessions
    

def add_session(session: dict):
    db = _connect()
    try:
        db.execute(
            """
            INSERT INTO SESSIONS (type, start_timestamp, end_timestamp)
            VALUES (?, ?, ?)
            RETURNING id
            """,
            (session["type"], session["start_timestamp"], session["end_timestamp"],)).fetchone()[0]
        db.commit()
        fetched_sessions = db.execute("SELECT * FROM SESSIONS").fetchall()
        
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

    print("Added a session to the database: " + str(fetched_sessions))

def delete_sessions():
    db = _connect()
    try:
        # Delete child records before parent records.
        db.execute("DELETE FROM SESSIONS")
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()