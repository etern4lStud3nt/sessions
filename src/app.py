import sqlite3
import db
from flask import Flask, jsonify, render_template, request, redirect, flash
from utils.jinja_filters import get_date_diff, get_natural_date, format_hour


app = Flask(__name__)
app.secret_key = "dev-key"

app.jinja_env.filters["get_date_diff"] = get_date_diff
app.jinja_env.filters["get_natural_date"] = get_natural_date
app.jinja_env.filters["format_hour"] = format_hour

db.create_table()


@app.route("/", endpoint="home")
def render_index():
    return render_template("index.html")

@app.route("/history", endpoint="history", methods=["GET"])
def render_history():
    searched_date = request.values.get("date")
    sessions = db.get_latest_sessions(10)
    print("passing" + str(sessions))
    return render_template("history.html", sessions=sessions)

@app.route("/settings", endpoint="settings", methods=["GET"])
def render_settings():
    return render_template("settings.html")

@app.route("/sessions", methods=["GET"])
def get_sessions():
    sessions = db.get_sessions()
    return jsonify(sessions)

@app.route("/sessions/search", methods=["GET"])
def search_sessions():
    date = request.args.get("search-date-input")
    sessions = db.get_sessions(date)
    return jsonify(sessions)

@app.route("/sessions", methods=["POST"])
def create_session():
    session = request.get_json()
    db.add_session(session)
    return "Success", 204

@app.route("/sessions", methods=["DELETE"])
def delete_all_sessions():
    db.delete_sessions()
    return "Success", 204

@app.route("/settings", methods=["POST"])
def on_settings_updated():
    return redirect("/")    

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
