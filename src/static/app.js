import Session from "./session.js";

const maxIndex = 3;
let index = 0;
let session = createSession("focus");
let eventTarget = new EventTarget();


/**
 * Creates a new session and adds event listeners
 * @param {"focus|break"} type The type of session to create
 * @returns {Session} The created session
 */
function createSession(type)
{
    let session = new Session(type);
    session.eventTarget.addEventListener("update", () => eventTarget.dispatchEvent(new Event("update")));
    session.eventTarget.addEventListener("finished", handleSessionFinished);
    return session;
}

function startSession()
{
    session.start();
}

function togglePauseSession()
{
    if (session.state === "PAUSED")
        session.unpause();
    else if (session.state === "RUNNING")
        session.pause();
}

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
                    sessionStartTime: session.startTime,
                    sessionEndTime: session.endTime,
                    session: session.type,
                    sessionPauseLogs: session.pauseLogs
                }
            )
        });

        if (!response.ok)
            throw new Error(`Session log request failed: ${response.status}`);

        const loggedData = await response.json();

        console.log("Logged data:", loggedData);
    }
    catch (error)
    {
        console.error(error);
    }
}

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

function stopSet()
{
    session.stop();
    void logSession();
    alert("Set stopped. Your last session was logged.")
    resetSet();
}

function resetSet()
{
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