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
    #startTimestamp;
    #endTimestamp;

    /**
     * Creates a session.
     * @param {"focus"|"break"} type The type of session to create.
    * @param {number} duration The session duration in seconds.
     */
    constructor(type, duration)
    {
        this.#type = type;
        this.#duration = duration;
        this.#timer = new Timer(this.#duration);
        this.#state = "NOT_STARTED"
        this.#eventTarget = new EventTarget();
        this.#startTimestamp = null;
        this.#endTimestamp = null;
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
    get startTimestamp()
    {
        return this.#startTimestamp;
    }

    /** @returns {Date|null} The session end time. */
    get endTimestamp()
    {
        return this.#endTimestamp;
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
        this.#startTimestamp = new Date();
        this.#state = "RUNNING";
    }

    /** Pauses a running session and records the pause interval. */
    pause()
    {
        if (this.#state !== "RUNNING")
            return;

        this.#timer.pause();
        this.#state = "PAUSED";

        this.#eventTarget.dispatchEvent(new Event("update"));
    }

    /** Resumes a paused session and completes its latest pause interval. */
    unpause()
    {
        if (this.#state !== "PAUSED")
            return;

        this.#timer.start();
        this.#state = "RUNNING";

        this.#eventTarget.dispatchEvent(new Event("update"));
    }

    /** Stops the session, closes any pause interval, and records its end time. */
    stop()
    {
        this.pause();
        this.#endTimestamp = new Date();
        this.#state = "STOPPED";

        this.#eventTarget.dispatchEvent(new Event("update"));
    }

    /** Resets the session timer, state, and recorded pause intervals. */
    reset()
    {
        this.#timer.reset();
        this.#state = "NOT_STARTED";
        this.#startTimestamp = null;
        this.#endTimestamp = null;

        this.#eventTarget.dispatchEvent(new Event("update"));
    }

    /** Marks the session finished when its timer reaches zero. */
    handleTimerFinished()
    {
        this.#endTimestamp = new Date();
        this.#state = "FINISHED";
        this.#eventTarget.dispatchEvent(new Event("finished"));
        this.#eventTarget.dispatchEvent(new Event("update"));
    }
}