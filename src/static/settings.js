import
{
    getSavedDurations, saveDurations,
    saveAutoSwitchSetting, getAutoSwitchSetting
} from "./session-settings.js";

const form = document.getElementById("settings-form");
const inputFocusMin = document.getElementById("focus-duration-min");
const inputFocusSec = document.getElementById("focus-duration-sec");
const inputBreakMin = document.getElementById("break-duration-min");
const inputBreakSec = document.getElementById("break-duration-sec");
const deleteButton = document.getElementById("delete-btn");
const autoSwitchCheckbox = document.getElementById("auto-switch");

let savedDurations = getSavedDurations();
inputFocusMin.value = Math.floor(savedDurations.focus / 60);
inputFocusSec.value = savedDurations.focus % 60;
inputBreakMin.value = Math.floor(savedDurations.break / 60);
inputBreakSec.value = savedDurations.break % 60;

if (getAutoSwitchSetting())
    autoSwitchCheckbox.checked = true;
else
    autoSwitchCheckbox.checked = false;


form.addEventListener("submit", handleFormSubmission);
deleteButton.addEventListener("click", handleDeleteButton);

function handleFormSubmission(event)
{
    event.preventDefault();

    saveDurations({
        focus: Number(inputFocusMin.value) * 60 + Number(inputFocusSec.value),
        break: Number(inputBreakMin.value) * 60 + Number(inputBreakSec.value)
    });

    saveAutoSwitchSetting(autoSwitchCheckbox.checked);  

    form.submit();
}

function handleDeleteButton()
{
    let confirmed = confirm("Are you sure you want to delete all your data?");
    if (confirmed)
    {
        fetch("/sessions", {
            method: "DELETE"
        }).then((response) =>
        {
            if (response.ok)
                alert("Data deleted");
            else
                alert("There was a problem deleting your data");
        });
    }
}
