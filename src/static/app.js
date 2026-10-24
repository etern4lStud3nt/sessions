import Session from "./session.js";
import { getDuration } from "./duration-settings.js";

/** The highest session index in a set. */
const maxIndex = 3;
/** The index of the currently active session in the set. */
let index = 0;
/** The active focus or break session. */
let session = createSession("focus");
/** Emits updates whenever the active session changes. */
let eventTarget = new EventTarget();


/**
 * Creates a new session and adds event listeners
 * @param {"focus"|"break"} type The type of session to create
 * @returns {Session} The created session
 */
function createSession(type)
{
    let duration = getDuration(type);
    let session = new Session(type, duration);
    session.eventTarget.addEventListener("update", () => eventTarget.dispatchEvent(new Event("update")));
    session.eventTarget.addEventListener("finished", handleSessionFinished);
    return session;
}

/** Starts the active session. */
function startSession()
{
    session.start();
}

/** Pauses the active session or resumes it when it is paused. */
function togglePauseSession()
{
    if (session.state === "PAUSED")
        session.unpause();
    else if (session.state === "RUNNING")
        session.pause();
}

/** Sends the active session's timing and pause data to the server. */
async function logSession()
{
    console.log("logging session...")
    try
    {
        const response = await fetch("/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
                {
                    start_timestamp: session.startTimestamp,
                    end_timestamp: session.endTimestamp,
                    type: session.type,
                }
            )
        });

        if (!response.ok)
            throw new Error(`Session log request failed: ${response.status}`);
    }
    catch (error)
    {
        console.log("Error posting to /sessions.");
        console.error(error);
    }
}

/** Logs a completed session and advances or resets the current set. */
function handleSessionFinished()
{
    void logSession();


    // If the set hasn't finished, move to the next session
    if (index < maxIndex)
    {
        if (session.type === "break")
        {
            session = createSession("focus");
            index += 1;
        }
        else if (session.type === "focus")
            session = createSession("break")
    }
    // If a session with maxIndex finished, reset
    else
    {
        if (session.type === "break")
        {
            alert("Congratulations, you completed all sessions in this Set!")
            resetSet();
        }
        else if (session.type === "focus")
            session = createSession("break")
    }
}

/** Stops and logs the active session, then resets the set. */
function stopSet()
{
    session.stop();
    void logSession();
    alert("Set stopped. Your last session was logged.")
    resetSet();
}

/** Replaces the active session with a new focus session. */
function resetSet()
{
    session.reset();
    
    index = 0;
    session = createSession("focus");
}

export
{
    eventTarget,
    index, maxIndex, session,
    startSession, togglePauseSession,
    stopSet, resetSet
}