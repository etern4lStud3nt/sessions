from pathlib import Path
from flask import Flask, render_template
import sqlite3

app = Flask(__name__)

database_path = Path("data/sessions.db")
database_path.parent.mkdir(parents=True, exist_ok=True)
db = sqlite3.connect(database_path)

# Create the database if it doesn't exist
try:
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
    db.commit()
except Exception as error:
    print(error)


@app.route("/")
def home():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)