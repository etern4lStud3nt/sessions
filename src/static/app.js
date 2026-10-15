import Session from "./session.js";

let index = 0;
const maxIndex = 3;
let session = new Session("focus");

function startSession()
{
    session.start();
    session.eventTarget.addEventListener("finished", handleSessionFinished);
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
            session = new Session("focus");
            index += 1;
        }
        else if (session.type === "focus")
            session = new Session("break")
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
            session = new Session("break")
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
    session = new Session("focus");
}

export {
    index, maxIndex, session,
    startSession, togglePauseSession,
    stopSet, resetSet
}