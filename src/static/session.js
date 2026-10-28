/**
 * Represents a focus or break session managed by a countdown timer.
 */
export default class Session
{
    #duration;
    #state
    #eventTarget;
    #intervalID;
    #type;
    /** @type {[Date, Date|null][]} A list of pairs containing two Date objects. */
    #periods;

    /**
     * Creates a session.
     * @param {"focus"|"break"} type The type of session to create.
     * @param {number} duration The session duration in seconds.
     */
    constructor(type, duration)
    {
        this.#type = type;
        this.#duration = duration;
        this.#state = "NOT_STARTED"
        this.#eventTarget = new EventTarget();
        this.#periods = [];
    }

    /** @returns {"focus"|"break"} The session type. */
    get type()
    {
        return this.#type;
    }

    /** @returns {number} The session duration in seconds. */
    get duration()
    {
        return this.#duration;
    }

    /** @returns {number} The remaining time in seconds. */
    get remaining()
    {
        let remaining = this.#duration;
        for (const period of this.#periods)
        {
            let start = period[0];
            let end = period[1];
            if (period[1] == null)
                end = new Date();

            const diff = (end - start) / 1000;
            remaining -= diff;
        }

        return Math.round(remaining);
    }

    /** @returns {EventTarget} The target used for session events. */
    get eventTarget()
    {
        return this.#eventTarget;
    }

    /** @returns {"NOT_STARTED"|"RUNNING"|"PAUSED"|"STOPPED"|"FINISHED"} The current session state. */
    get state()
    {
        return this.#state;
    }

    /** @returns {Date|null} The session start time. */
    get startTimestamp()
    {
        return this.#periods.at(0)[0];
    }

    /** @returns {Date|null} The session end time. */
    get endTimestamp()
    {
        return this.#periods.at(-1)[1];
    }

    setCheckInterval()
    {
        this.#intervalID = setInterval(this.checkState.bind(this), 1000);
    }

    clearCheckInterval()
    {
        clearInterval(this.#intervalID);
        this.#intervalID = null;
    }

    /** Starts the session if it has not already started. */
    start()
    {
        if (this.#state !== "NOT_STARTED")
            return;

        this.setCheckInterval();
        this.#periods.push([new Date(), null]);
        this.#state = "RUNNING";
    }

    /** Pauses a running session and records the pause interval. */
    pause()
    {
        if (this.#state !== "RUNNING")
            return;

        this.clearCheckInterval();
        this.#periods.at(-1)[1] = new Date();
        this.#state = "PAUSED";

        this.#eventTarget.dispatchEvent(new Event("update"));
    }

    /** Resumes a paused session and completes its latest pause interval. */
    unpause()
    {
        if (this.#state !== "PAUSED")
            return;

        this.setCheckInterval();
        this.#periods.push([new Date(), null]);
        this.#state = "RUNNING";

        this.#eventTarget.dispatchEvent(new Event("update"));
    }

    /** Stops the session, closes any pause interval, and records its end time. */
    stop()
    {
        this.pause();
        this.#periods.at(-1)[1] = new Date();
        this.#state = "STOPPED";

        this.#eventTarget.dispatchEvent(new Event("update"));
    }

    /** Resets the session timer, state, and recorded pause intervals. */
    reset()
    {
        this.clearCheckInterval();
        this.#state = "NOT_STARTED";
        this.#periods = [];

        this.#eventTarget.dispatchEvent(new Event("update"));
    }

    checkState()
    {
        this.#eventTarget.dispatchEvent(new Event("update"));
        console.log("check");

        if (this.remaining <= 0)
        {
            this.clearCheckInterval();
            this.#periods.at(-1)[1] = new Date();
            this.#state = "FINISHED";
            this.#eventTarget.dispatchEvent(new Event("finished"));
            this.#eventTarget.dispatchEvent(new Event("update"));
        }
    }

}