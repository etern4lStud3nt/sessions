const FOCUS_DURATION = 5;//25 * 60;
const BREAK_DURATION = 2;//5 * 60;
const TARGET_SESSIONS = 4;


/** Stores the timer's current phase, countdown progress, session number, and pause history. */
const state = {
    /** Active countdown interval identifier, or null when the timer is stopped. */
    timerId: null,
    /** Seconds remaining in the current focus or break phase. */
    remaining: FOCUS_DURATION,
    /** One-based number of the current focus session. */
    sessionIndex: 1,
    /** Current phase: "focus", "break", or null when no session is active. */
    phase: "focus",
    /** Start time of the current focus session, or null when it has not started. */
    startTime: null,
    /** Start and end timestamps for pauses in the current session. */
    pauseLogs: []
};

// Get document elements
const startButton = document.getElementById("start-button");
const stopButton = document.getElementById("stop-button");
const resetButton = document.getElementById("reset-button");
const display = document.getElementById("display");
const progressBubbles = document.getElementById("progress-bubbles");
startButton.addEventListener("click", handleStartButtonClick);
stopButton.addEventListener("click", stop);
resetButton.addEventListener("click", resetSet);

/** Returns true when the countdown interval is running. */
function isRunning()
{
    return state.timerId !== null;
}

/** Returns true when a focus or break phase is active but paused. */
function isPaused()
{
    return state.phase !== null && !isRunning();
}

/** Returns true when the timer is in a focus or break phase. */
function hasActiveSession()
{
    return state.phase !== null;
}

/** Returns true when Start() has been called once in this session and startTime is not null */
function hasStartedSession()
{
    return state.startTime != null;
}

updateDisplay();

//#region Ticking, Start, Pause, Stop, Reset
/** Decrements the timer and resets it when the countdown completes. */
function tick()
{
    state.remaining -= 1;
    updateDisplay();

    if (state.remaining <= 0)
    {
        completeSession();
        return;
    }
}


/** Starts the countdown interval if the timer is not already running. */
function startTicking()
{
    if (isRunning())
        return;

    state.timerId = setInterval(tick, 1000);
}

/** Stops the countdown interval if it is running. */
function stopTicking()
{
    if (!isRunning())
        return;

    clearInterval(state.timerId);
    state.timerId = null;
}


/** Starts the set and countdown interval and changes the button to Pause. */
function start()
{
    state.startTime = new Date();
    startTicking();
    updateDisplay();
}

/** Stops the countdown interval and changes the button to Start. */
function pause()
{
    if (!isRunning())
        return;

    stopTicking();
    state.pauseLogs.push([new Date(), null]);

    updateDisplay();
}

function unpause()
{
    if (isRunning() || !hasActiveSession())
        return;

    const lastIndex = state.pauseLogs.length - 1;

    if (lastIndex >= 0 && state.pauseLogs[lastIndex][1] === null)
    {
        state.pauseLogs[lastIndex][1] = new Date();
    }

    startTicking();
    updateDisplay();
}

function stop()
{
    if(!hasStartedSession() && state.sessionIndex == 1)
    {
        alert("No session has started yet.");
        return;
    }

    stopTicking();
    completeSession(true);
}


/** Stops the timer and restores the default focus-session duration. */
function resetSet()
{
    if (isRunning())
        stopTicking();

    state.pauseLogs = [];
    state.startTime = null;
    state.phase = "focus";
    state.remaining = FOCUS_DURATION;
    state.sessionIndex = 1;

    updateDisplay();
}
//#endregion

/** Toggles the timer between its running and paused states. */
function handleStartButtonClick()
{
    if(!hasActiveSession())
        return;

    if (hasStartedSession())
    {
        if (isPaused())
        {
            unpause();
        }
        else
        {
            pause();
        }
    }
    else
    {
        start();
    }
}


/** Updates the displayed time using a zero-padded minutes-and-seconds format. */
function updateDisplay()
{
    updateTimerDisplay();
    updateProgressBubbles();
    updateStartButton();
}

function updateTimerDisplay()
{
    const minutes = Math.floor(state.remaining / 60);
    const seconds = state.remaining % 60;

    display.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateStartButton()
{
    if(!hasActiveSession())
        return;

    if (!hasStartedSession())
    {
        startButton.textContent = "Start";
    }
    else if (isPaused())
    {
        startButton.textContent = "Resume";
    }
    else
    {
        startButton.textContent = "Pause";
    }
}

function updateProgressBubbles()
{
    progressBubbles.replaceChildren();

    for (let index = 1; index <= TARGET_SESSIONS; index += 1)
    {
        const sessionBubble = document.createElement("span");

        sessionBubble.classList.add("bubble", "focus-bubble");
        sessionBubble.setAttribute("aria-label", `Focus session ${index}`);

        if (index < state.sessionIndex)
            sessionBubble.classList.add("completed");
        else if (index === state.sessionIndex)
        {
            if (state.phase === "focus")
                sessionBubble.classList.add("current");
            else if (state.phase === "break")
                sessionBubble.classList.add("completed", "break-bubble");
        }

        progressBubbles.appendChild(sessionBubble);
    }
}



/** Switches from the focus session to the break session. */
function switchSession()
{
    state.startTime = null;

    if (state.phase === "focus")
    {
        state.phase = "break";
        state.remaining = BREAK_DURATION;
    }
    else if (state.phase === "break")
    {
        state.phase = "focus";
        state.remaining = FOCUS_DURATION;
        state.sessionIndex += 1;
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
                    sessionStartTime: state.startTime,
                    session: state.phase,
                    sessionPauseLogs: state.pauseLogs
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
    // Stop the timer
    stopTicking();

    // Close last pause log if necessary
    const lastPause = state.pauseLogs.at(-1);
    if (lastPause?.[1] === null)
        lastPause[1] = new Date();

    // Log the session without blocking the timer transition.
    void logSession();

    // Reset pause logs
    state.pauseLogs = [];

    if ((state.phase === "focus" && state.sessionIndex >= TARGET_SESSIONS) || stopped)
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
    alert(`Congratulations! You reached ${state.sessionIndex} out of ${TARGET_SESSIONS} focus sessions.`);
    resetSet();
}
