import * as app from "./app.js"

// Get document elements
const startButton = document.getElementById("start-button");
const stopButton = document.getElementById("stop-button");
const resetButton = document.getElementById("reset-button");
const display = document.getElementById("display");
const progressBubbles = document.getElementById("progress-bubbles");

startButton.addEventListener("click", handleStartButtonClick);
stopButton.addEventListener("click", handleStopButtonClick);
resetButton.addEventListener("click", handleResetButtonClick);

updateDisplay();

function handleStartButtonClick()
{
    if (app.session.state === "NOT_STARTED")
    {
        app.startSession();
        app.session.eventTarget.addEventListener("update", updateDisplay)
    }
    else
    {
        app.togglePauseSession();
    }
}

function handleStopButtonClick()
{
    app.stopSet()
    updateDisplay();
}

function handleResetButtonClick()
{
    app.resetSet();
    updateDisplay();
}

function updateDisplay()
{
    updateTimerDisplay();
    updateProgressBubbles();
    updateStartButton();

    function updateTimerDisplay()
    {
        const minutes = Math.floor(app.session.remaining / 60);
        const seconds = app.session.remaining % 60;

        display.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

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
