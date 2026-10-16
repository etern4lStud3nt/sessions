import { getSavedDurations, saveDurations } from "./durations.js";

let submitButton = document.getElementById("submit");

let inputFocusMin = document.getElementById("focus-duration-min");
let inputFocusSec = document.getElementById("focus-duration-sec");
let inputBreakMin = document.getElementById("break-duration-min");
let inputBreakSec = document.getElementById("break-duration-sec");

let savedDurations = getSavedDurations();
inputFocusMin.value = Math.floor(savedDurations.focus / 60);
inputFocusSec.value = savedDurations.focus % 60;
inputBreakMin.value = Math.floor(savedDurations.break / 60);
inputBreakSec.value = savedDurations.break % 60;


submitButton.addEventListener("click", saveSettings);

function saveSettings()
{
    saveDurations({
        focus: Number(inputFocusMin.value) * 60 + Number(inputFocusSec.value),
        break: Number(inputBreakMin.value) * 60 + Number(inputBreakSec.value)
    });
}
