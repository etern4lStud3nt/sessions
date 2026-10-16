/**
 * Default timer durations in seconds:
 * focus and break durations.
 * @type {string[]}
 */
const DEFAULT_DURATIONS = ["1500", "300"]

/**
 * Retrieves timer durations from local storage.
 *
 * If one or more saved values are missing, all durations are replaced with
 * the default values. Returned values are converted from strings to numbers.
 *
 * @returns {{focus: number, break: number}}
 * An object containing the focus and break durations.
 */
function getSavedDurations()
{
    // Prepare the keys and values for the "durations" object
    let durationsKeys = ["focus", "break"];
    // Get the saved durations from storage
    let durationsValues = [
        localStorage.getItem("focus"),
        localStorage.getItem("break")
    ];

    // If any of the durations was not found in storage, use the default ones
    if (durationsValues.some((value) => value == null))
    {
        durationsValues = DEFAULT_DURATIONS;
    }

    // Transform the durations to numbers
    durationsValues = durationsValues.map((duration) => Number(duration));

    // Create the durations object
    let entries = durationsKeys.map((key, index) => [key, durationsValues[index]]);
    let durations = Object.fromEntries(entries);

    return durations;
}


/**
 * Saves timer durations to local storage.
 *
 * @param {{focus: number, break: number}} durations
 * An object containing the focus and break durations to save.
 * @returns {void}
 */
function saveDurations(durations)
{
    Object.entries(durations).forEach(([key, value]) => {
        localStorage.setItem(key, value)
    });
}

/**
 * Returns one saved timer duration.
 *
 * @param {"focus" | "break"} key
 * The duration to retrieve.
 * @returns {number}
 * The selected duration in seconds.
 */
function getDuration(key)
{
    let durations = getSavedDurations();
    return durations[key];
}

export { getSavedDurations, saveDurations, getDuration }
