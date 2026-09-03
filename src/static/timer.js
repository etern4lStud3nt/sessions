// Set the timer to 25 minutes
const INITIAL_TIME = 25 * 60;
let timer = INITIAL_TIME;
let ticking = false;
let timerId = null;

let startButton = document.getElementById("start-button")
let resetButton = document.getElementById("reset-button")
let display = document.getElementById("display")

startButton.addEventListener("click", startButtonHandler)
resetButton.addEventListener("click", reset)


function tick()
{
    timer -= 1;

    if (timer < 0)
    {
        reset();
        return;
    }
    else
        update_display();
}

function start()
{
    timerId = setInterval(tick, 1000);
    ticking = true;

    startButton.textContent = "pause";
}

function pause()
{
    if (timerId !== null && ticking)
    {
        clearInterval(timerId);
        timerId = null;
        ticking = false;

        startButton.textContent = "start";
    }
}

function reset()
{
    pause();
    timer = INITIAL_TIME;
    update_display();
    startButton.textContent = "Start";
}

function startButtonHandler()
{
    if (ticking)
        pause();
    else
        start();
}

function update_display()
{
    let minutes = Math.floor(timer / 60);
    let seconds = timer % 60;

    display.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
