const searchForm = document.getElementById("search-form");

searchForm.addEventListener("submit", handleFormSubmission);

// Fetch sessions for the selected date and render the calendar
async function handleFormSubmission(event)
{
    event.preventDefault();

    const formData = new FormData(searchForm);
    const searchDate = formData.get("search-date-input");

    const url = new URL(searchForm.action, window.location.origin);
    url.searchParams.append("search-date-input", searchDate);

    try
    {
        const response = await fetch(url, { method: "GET" });
        const rawSessions = await response.json();

        // Transform raw array tuples into clean, self-documenting objects
        const sessions = rawSessions.map(session => ({
            id: session[0],
            type: session[1],
            start: session[2],
            end: session[3]
        }));

        renderDayCalendar(searchDate, sessions);
    }
    catch (error)
    {
        console.error(error);
    }
}

// Orchestrate rendering the 24-hour day calendar view
function renderDayCalendar(dayDate, daySessions)
{
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";

    const header = document.getElementById("calendar-title");
    header.textContent = dayDate;

    const { dayStartDateTime, dayEndDateTime } = getDayBounds(dayDate);
    const clampedSessions = clampSessionsToDay(daySessions, dayStartDateTime, dayEndDateTime);

    const hourBlockTemplate = document.getElementById("hour-block-template");
    const calendarFragment = document.createDocumentFragment();

    for (let index = 0; index < 24; index++)
    {
        const hourBlockFragment = createHourBlockFragment(
            index, 
            dayStartDateTime, 
            clampedSessions, 
            hourBlockTemplate
        );
        calendarFragment.appendChild(hourBlockFragment);
    }

    calendar.appendChild(calendarFragment);
    showCalendarContainer();

    // --- Agnostic Local Helper Functions ---

    // Calculate start and end Date objects for the given day
    function getDayBounds(dateString)
    {
        const start = new Date(dateString);
        start.setHours(0, 0, 0, 0);

        const end = new Date(dateString);
        end.setHours(23, 59, 59, 999);

        return { dayStartDateTime: start, dayEndDateTime: end };
    }

    // Clamp session boundaries to fit within the active day
    function clampSessionsToDay(sessions, startDateTime, endDateTime)
    {
        const clamped = [];

        // Process each session's temporal bounds
        for (const session of sessions)
        {
            let sessionStartDateTime = new Date(session.start);
            let sessionEndDateTime = new Date(session.end);

            // Constrain session limits to day boundaries
            if (sessionStartDateTime < startDateTime)
                sessionStartDateTime = new Date(startDateTime);
            if (sessionEndDateTime > endDateTime)
                sessionEndDateTime = new Date(endDateTime);

            clamped.push({
                startDateTime: sessionStartDateTime,
                endDateTime: sessionEndDateTime,
                type: session.type
            });
        }

        return clamped;
    }

    // Build a single hour block fragment with its overlapping session segments
    function createHourBlockFragment(hourIndex, startDateTime, sessions, template)
    {
        // Clone and configure the base hour block element
        const hourBlockFragment = template.content.cloneNode(true);

        const hourBlockTextSpan = hourBlockFragment.querySelector(".text-span");
        hourBlockTextSpan.textContent = `${hourIndex.toString().padStart(2, "0")}:00`;

        // Define exact hourly temporal boundaries
        const hourStartDateTime = new Date(startDateTime);
        hourStartDateTime.setHours(hourIndex, 0, 0, 0);

        const hourEndDateTime = new Date(startDateTime);
        hourEndDateTime.setHours(hourIndex, 59, 59, 999);

        const hourBlockDiv = hourBlockFragment.querySelector(".hour-block");

        // Evaluate each session for intersection with this hour block
        for (const sessionPeriod of sessions)
        {
            // Skip sessions outside the current hour window
            if (sessionPeriod.endDateTime <= hourStartDateTime || sessionPeriod.startDateTime >= hourEndDateTime)
            {
                continue;
            }

            // Determine exact overlap segment within this hour
            const segmentStartDateTime = sessionPeriod.startDateTime > hourStartDateTime ? sessionPeriod.startDateTime : hourStartDateTime;
            const segmentEndDateTime = sessionPeriod.endDateTime < hourEndDateTime ? sessionPeriod.endDateTime : hourEndDateTime;

            // Calculate positional offsets in seconds from the start of the hour
            const startSecondsIntoHour = segmentStartDateTime.getMinutes() * 60 + segmentStartDateTime.getSeconds();
            const endSecondsIntoHour = segmentEndDateTime.getMinutes() * 60 + segmentEndDateTime.getSeconds();

            // Convert offsets into percentage-based layout styles
            const topPercent = (startSecondsIntoHour / 3600) * 100;
            const heightPercent = Math.max(((endSecondsIntoHour - startSecondsIntoHour) / 3600) * 100, 1);

            // Create and append the session segment element
            const sessionElement = document.createElement("div");
            sessionElement.className = `wrapper ${sessionPeriod.type}`;
            sessionElement.style.top = `${topPercent}%`;
            sessionElement.style.height = `${heightPercent}%`;

            hourBlockDiv.appendChild(sessionElement);
        }

        return hourBlockFragment;
    }

    // Reveal the main calendar container element
    function showCalendarContainer()
    {
        const calendarContainer = document.getElementById("calendar-container");
        calendarContainer.classList.remove("hidden");
    }
}