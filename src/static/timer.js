const FOCUS_TIME = 5;//25 * 60;
const BREAK_TIME = 2;//5 * 60;
const TARGET_SESSIONS = 4;

let ticking = false;
let timerId = null;

let sessionIndex = 1;
let timer = FOCUS_TIME;
let session = "focus";

let startButton = document.getElementById("start-button");
let resetButton = document.getElementById("reset-button");
let display = document.getElementById("display");
let progressBubbles = document.getElementById("progress-bubbles");
startButton.addEventListener("click", handleStartButtonClick);
resetButton.addEventListener("click", reset);
update_display();


/** Decrements the timer and resets it when the countdown completes. */
function tick()
{
    timer -= 1;
    update_display();

    if (timer <= 0)
    {
        finishSession();
        return;
    }
}

/** Starts the countdown interval and changes the button to Pause. */
function start()
{
    timerId = setInterval(tick, 1000);
    ticking = true;

    startButton.textContent = "Pause";
}

/** Stops the countdown interval and changes the button to Start. */
function pause()
{
    update_display();
    
    if (timerId !== null && ticking)
    {
        clearInterval(timerId);
        timerId = null;
        ticking = false;

        startButton.textContent = "Start";
    }
}

/** Stops the timer and restores the default focus-session duration. */
function reset()
{
    pause();
    session = "focus";
    timer = FOCUS_TIME;
    sessionIndex = 1;
    update_display();
    startButton.textContent = "Start";
}

/** Toggles the timer between its running and paused states. */
function handleStartButtonClick()
{
    if (ticking)
        pause();
    else
        start();
}


/** Updates the displayed time using a zero-padded minutes-and-seconds format. */
function update_display()
{
    let minutes = Math.floor(timer / 60);
    let seconds = timer % 60;

    display.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    updateBubbles();

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
            else if (index === sessionIndex && session === "focus")
                sessionBubble.classList.add("current");
            else if (index === sessionIndex && session === "break")
                sessionBubble.classList.add("completed", "break-bubble");

            progressBubbles.appendChild(sessionBubble);
        }
    }
}



/** Switches from the focus session to the break session. */
function switchSession()
{
    if (session === "focus")
    {
        session = "break";
        timer = BREAK_TIME;
    }
    else if (session === "break")
    {
        session = "focus";
        timer = FOCUS_TIME;
        sessionIndex += 1;
    }

    update_display();
}

/** Switches phases or completes the session cycle after the target is reached. */
function finishSession()
{
    if (session === "focus" && sessionIndex >= TARGET_SESSIONS)
    {
        pause();
        alert(`Congratulations! You completed ${TARGET_SESSIONS} focus sessions.`);
        reset();
    }
    else
    {
        switchSession();
    }
}
