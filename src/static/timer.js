
/**
 * A countdown timer that emits a `finished` event when it reaches zero.
 */
export default class Timer 
{
    #duration;
    #remaining;
    #intervalId;
    #eventTarget;

    /**
     * Creates a timer.
     * @param {number} duration Duration in seconds.
     */
    constructor(duration)
    {
        this.#duration = duration;
        this.#remaining = duration;
        this.#intervalId = null;
        this.#eventTarget = new EventTarget();
    }

    /** @returns {number} The configured duration in seconds. */
    get duration()
    {
        return this.#duration;
    }

    /** @returns {number} The remaining time in seconds. */
    get remaining()
    {
        return this.#remaining;
    }

    /**
     * @returns {EventTarget} The target used to listen for timer events.
     * @example timer.eventTarget.addEventListener('finished', handler)
     */
    get eventTarget()
    {
        return this.#eventTarget;
    }

    /**
     * Decreases the remaining time by one second and emits `finished` at zero.
     */
    tick()
    {
        if(this.#intervalId != null)
        {
            this.#remaining -= 1;
            this.#eventTarget.dispatchEvent(new Event("tick"));

            if(this.#remaining <= 0)
            {
                this.pause();
                this.#eventTarget.dispatchEvent(new Event("finished"));
            }
        }
    }

    /** Starts the timer if it is not already running. */
    start()
    {
        if(this.#intervalId != null)
        {
            return; // Timer is already running
        }

        this.#intervalId = setInterval(this.tick.bind(this), 1000);
    }

    /** Pauses the timer without resetting the remaining time. */
    pause()
    {
        if(this.#intervalId == null)
            return; // Timer is not running

        clearInterval(this.#intervalId);
        this.#intervalId = null;
    }

    /** Resets the timer to its original duration. */
    reset()
    {
        this.pause();
        this.#remaining = this.#duration;
    }
}

