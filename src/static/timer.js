const FOCUS_DURATION = 5;//25 * 60;
const BREAK_DURATION = 2;//5 * 60;
const TARGET_SESSIONS = 4;

let timerId = null;

let timer = FOCUS_DURATION;
let sessionIndex = 1;
let session = "focus";

let sessionStartTime = null;
// The pause and unpause times for this session
let sessionPauseLogs = [];

let startButton = document.getElementById("start-button");
let stopButton = document.getElementById("stop-button");
let resetButton = document.getElementById("reset-button");
let display = document.getElementById("display");
let progressBubbles = document.getElementById("progress-bubbles");
startButton.addEventListener("click", handleStartButtonClick);
stopButton.addEventListener("click", stop);
resetButton.addEventListener("click", reset);
updateDisplay();

//#region Ticking, Start, Pause, Stop, Reset
/** Decrements the timer and resets it when the countdown completes. */
function tick()
{
    timer -= 1;
    updateDisplay();

    if (timer <= 0)
    {
        completeSession();
        return;
    }
}


/** Starts the countdown interval if the timer is not already running. */
function startTicking()
{
    if (timerId !== null)
        return;

    timerId = setInterval(tick, 1000);
}

/** Stops the countdown interval if it is running. */
function stopTicking()
{
    if (timerId === null)
        return;

    clearInterval(timerId);
    timerId = null;
}


/** Starts the set and countdown interval and changes the button to Pause. */
function start()
{
    if (sessionStartTime === null)
        sessionStartTime = new Date();

    startTicking();
    updateDisplay();
}

/** Stops the countdown interval and changes the button to Start. */
function pause()
{
    if (timerId === null)
        return;

    stopTicking();
    sessionPauseLogs.push([new Date(), null]);

    updateDisplay();
}

function unpause()
{
    if (timerId !== null)
        return;

    const lastIndex = sessionPauseLogs.length - 1;

    if (lastIndex >= 0 && sessionPauseLogs[lastIndex][1] === null)
    {
        sessionPauseLogs[lastIndex][1] = new Date();
    }

    startTicking();
    updateDisplay();
}

/** Returns true when there is an open pause interval awaiting a resume. */
function isPaused()
{
    return sessionPauseLogs.length > 0 &&
        sessionPauseLogs[sessionPauseLogs.length - 1][1] === null;
}

function stop()
{
    stopTicking();
    completeSession(true);
}


/** Stops the timer and restores the default focus-session duration. */
function reset()
{
    if (timerId !== null)
        stopTicking();

    sessionPauseLogs = [];
    sessionStartTime = null;

    session = "focus";
    timer = FOCUS_DURATION;
    sessionIndex = 1;

    updateDisplay();
}
//#endregion

/** Toggles the timer between its running and paused states. */
function handleStartButtonClick()
{
    if (timerId !== null)
    {
        pause();
        return;
    }

    if (isPaused())
    {
        unpause();
    }
    else
    {
        start();
    }
}


/** Updates the displayed time using a zero-padded minutes-and-seconds format. */
function updateDisplay()
{
    let minutes = Math.floor(timer / 60);
    let seconds = timer % 60;

    display.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    updateBubbles();

    startButton.textContent = timerId === null ? "Start" : "Pause";

    /** Updates the focus and break icons for the current session. */
    function updateBubbles()
    {
        progressBubbles.replaceChildren();

        for (let index = 1; index <= TARGET_SESSIONS; index += 1)
        {
            let sessionBubble = document.createElement("span");

            sessionBubble.classList.add("bubble", "focus-bubble");
            sessionBubble.setAttribute("aria-label", `Focus session ${index}`);

            if (index < sessionIndex)
                sessionBubble.classList.add("completed");
            else if (index === sessionIndex)
            {
                if (session === "focus")
                    sessionBubble.classList.add("current");
                else
                    sessionBubble.classList.add("completed", "break-bubble");
            }

            progressBubbles.appendChild(sessionBubble);
        }
    }
}



/** Switches from the focus session to the break session. */
function switchSession()
{
    sessionStartTime = null;

    if (session === "focus")
    {
        session = "break";
        timer = BREAK_DURATION;
    }
    else if (session === "break")
    {
        session = "focus";
        timer = FOCUS_DURATION;
        sessionIndex += 1;
    }

    updateDisplay();
}

async function logSession()
{
    try
    {
        const response = await fetch("/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
                {
                    sessionStartTime: sessionStartTime,
                    session: session,
                    sessionPauseLogs: sessionPauseLogs
                }
            )
        });

        if (!response.ok)
            throw new Error(`Session log request failed: ${response.status}`);
    }
    catch (error)
    {
        console.error(error);
    }
}

/** Switches phases or completes the session set after the target is reached. */
function completeSession(stopped = false)
{
    stopTicking();

    // Log the session without blocking the timer transition.
    logSession();

    if ((session === "focus" && sessionIndex >= TARGET_SESSIONS) || stopped)
    {
        completeSet();
    }
    else
    {
        switchSession();
    }
}


function completeSet()
{
    // Congratulate user and reset
    alert(`Congratulations! You reached ${sessionIndex} out of ${TARGET_SESSIONS} focus sessions.`);
    reset();
}
