import * as app from "./app.js"

// Get document elements
const startButton = document.getElementById("start-button");
const stopButton = document.getElementById("stop-button");
const resetButton = document.getElementById("reset-button");
const display = document.getElementById("display");
const progressBubbles = document.getElementById("progress-bubbles");

// Event listeners for Start, Stop, Reset buttons and app updates
startButton.addEventListener("click", handleStartButtonClick);
stopButton.addEventListener("click", handleStopButtonClick);
resetButton.addEventListener("click", handleResetButtonClick);
app.eventTarget.addEventListener("update", updateDisplay);

updateDisplay();

/** Starts the first session or toggles pause/resume for an active session. */
function handleStartButtonClick()
{
    if (app.session.state === "NOT_STARTED")
    {
        app.startSession();
    }
    else
    {
        app.togglePauseSession();
    }

    updateDisplay();
}

/** Stops the current set and refreshes the displayed state. */
function handleStopButtonClick()
{
    app.stopSet()
    updateDisplay();
}

/** Resets the current set and refreshes the displayed state. */
function handleResetButtonClick()
{
    app.resetSet();
    updateDisplay();
}

/** Refreshes every timer, button, and progress indicator on the page. */
function updateDisplay()
{
    updateTimerDisplay();
    updateProgressBubbles();
    updateStartButton();

    /** Renders the remaining session time as MM:SS. */
    function updateTimerDisplay()
    {
        const minutes = Math.floor(app.session.remaining / 60);
        const seconds = app.session.remaining % 60;

        display.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    /** Updates the start button label for the current session state. */
    function updateStartButton()
    {
        switch (app.session.state) {
            case "NOT_STARTED":
                startButton.textContent = "Start";
                break;
            case "PAUSED":
                startButton.textContent = "Continue";
                break;
            case "RUNNING":
                startButton.textContent = "Pause";
                break;
            default:
                break;
        }
    }

    /** Rebuilds the progress bubbles and marks completed/current sessions. */
    function updateProgressBubbles()
    {
        progressBubbles.replaceChildren();

        for (let index = 0; index <= app.maxIndex; index += 1)
        {
            const sessionBubble = document.createElement("span");

            sessionBubble.classList.add("bubble", "focus-bubble");
            sessionBubble.setAttribute("aria-label", `Focus session ${index}`);

            if (index < app.index)
                sessionBubble.classList.add("completed");
            else if (index === app.index)
            {
                if (app.session.type === "focus")
                    sessionBubble.classList.add("current");
                else if (app.session.type === "break")
                    sessionBubble.classList.add("completed", "break-bubble");
            }

            progressBubbles.appendChild(sessionBubble);
        }
    }
}
