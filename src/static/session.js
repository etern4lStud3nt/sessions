import Timer from './timer.js';
const FOCUS_DURATION = 3;//25 * 60;
const BREAK_DURATION = 2;//5 * 60;

/**
 * Represents a focus or break session managed by a countdown timer.
 */
export default class Session
{
    #timer;
    #duration;
    #state
    #eventTarget;

    #type;
    #pauseLogs;
    #startTime;
    #endTime;

    /**
     * Creates a session.
     * @param {"focus"|"break"} type The type of session to create.
     */
    constructor(type)
    {
        this.#type = type;
        this.#duration = type === "focus" ? FOCUS_DURATION : BREAK_DURATION;
        this.#timer = new Timer(this.#duration);
        this.#state = "NOT_STARTED"
        this.#eventTarget = new EventTarget();
        this.#pauseLogs = [];
        this.#startTime = null;
        this.#endTime = null;
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
        return this.#timer.remaining;
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
    get startTime()
    {
        return this.#startTime;
    }

    /** @returns {Date|null} The session end time. */
    get endTime()
    {
        return this.#endTime;
    }

    /** @returns {Array<[Date, Date|null]>} The session pause intervals. */
    get pauseLogs()
    {
        return this.#pauseLogs;
    }

    /** Starts the session if it has not already started. */
    start()
    {
        if (this.#state !== "NOT_STARTED")
            return;

        this.#timer.eventTarget.addEventListener("tick", () =>
        {
            this.#eventTarget.dispatchEvent(new Event("update"));
        });
        this.#timer.eventTarget.addEventListener("finished", this.handleTimerFinished.bind(this));

        this.#timer.start();
        this.#startTime = new Date();
        this.#state = "RUNNING";
    }

    /** Pauses a running session and records the pause interval. */
    pause(log = true)
    {
        if (this.#state !== "RUNNING")
            return;

        this.#timer.pause();
        if (log)
            this.#pauseLogs.push([new Date(), null]);
        this.#state = "PAUSED";

        this.#eventTarget.dispatchEvent(new Event("update"));
    }

    /** Closes the most recent pause interval with the current time. */
    closePauseInterval()
    {
        const lastEntry = this.#pauseLogs.at(-1);
        // If interval is already closed, return
        if (lastEntry?.[1] != null)
            return;
        // Otherwise, close it
        if (lastEntry?.[0] != null)
        {
            lastEntry[1] = new Date();
        }
    }

    /** Resumes a paused session and completes its latest pause interval. */
    unpause()
    {
        if (this.#state !== "PAUSED")
            return;

        this.#timer.start();
        this.closePauseInterval();
        this.#state = "RUNNING";

        this.#eventTarget.dispatchEvent(new Event("update"));
    }

    stop()
    {
        this.closePauseInterval();
        this.#timer.pause();
        this.#endTime = new Date();
        this.#state = "STOPPED";

        this.#eventTarget.dispatchEvent(new Event("update"));
    }

    /** Resets the session timer, state, and recorded pause intervals. */
    reset()
    {
        this.#timer.reset();
        this.#state = "NOT_STARTED";
        this.#pauseLogs = [];
        this.#startTime = null;
        this.#endTime = null;

        this.#eventTarget.dispatchEvent(new Event("update"));
    }

    /** Marks the session as finished and dispatches completion events. */
    handleTimerFinished()
    {
        this.#endTime = new Date();
        this.#state = "FINISHED";
        this.#eventTarget.dispatchEvent(new Event("finished"));
        this.#eventTarget.dispatchEvent(new Event("update"));
    }
}