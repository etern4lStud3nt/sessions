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
    reset();
    renderHourBlocks();
    showCalendarContainer();

    function reset()
    {
        calendar.innerHTML = "";

        const header = document.getElementById("calendar-title");
        header.textContent = dayDate;
    }

    function renderHourBlocks()
    {
        // Create a calendar fragment
        const calendarFragment = document.createDocumentFragment();

        // Generate hour block fragments and add them to the calendar fragment
        const hourBlockFragments = generateHourBlockFragments();
        for (const hourBlockFragment of hourBlockFragments)
        {
            calendarFragment.appendChild(hourBlockFragment);
        }

        // Add the calendar fragment to the document's calendar div and render it
        const calendarDiv = document.getElementById("calendar");
        calendarDiv.appendChild(calendarFragment);

        function generateHourBlockFragments()
        {
            const blockFragments = [];
            for (let index = 0; index < 24; index++) 
            {
                // Create and hour block fragment from template
                const hourBlockTemplate = document.getElementById("hour-block-template");
                const hourBlockFragment = hourBlockTemplate.content.cloneNode(true);

                // Set the text displaying this hour block
                const textSpan = hourBlockFragment.querySelector(".text-span");
                textSpan.textContent = `${index.toString().padStart(2, "0")}:00`;

                // Add session block fragments from template and append them to the hour block fragment
                const sessionBlockFragments = generateSessionBlockFragments(index);
                const hourBlockDiv = hourBlockFragment.querySelector(".hour-block");
                for (const sessionBlockFragment of sessionBlockFragments)
                {
                    hourBlockDiv.appendChild(sessionBlockFragment)
                }

                // Push fragment to the list
                blockFragments.push(hourBlockFragment);
            }

            return blockFragments;


            function generateSessionBlockFragments(hourIndex)
            {
                const { dayStartDateTime, dayEndDateTime } = getDayBounds(dayDate);
                const { hourStartDateTime, hourEndDateTime } = getHourBounds();
                const clampedSessions = clampSessionsToDay(daySessions, dayStartDateTime, dayEndDateTime);

                const generatedFragments = [];
                // Evaluate each session for intersection with this hour block
                for (const clampedSession of clampedSessions)
                {
                    // Skip sessions outside the current hour window
                    if (clampedSession.endDateTime <= hourStartDateTime || clampedSession.startDateTime >= hourEndDateTime)
                    {
                        continue;
                    }

                    // Determine exact overlap segment within this hour
                    const blockStartDateTime = clampedSession.startDateTime > hourStartDateTime ? clampedSession.startDateTime : hourStartDateTime;
                    const blockEndDatetime = clampedSession.endDateTime < hourEndDateTime ? clampedSession.endDateTime : hourEndDateTime;

                    // Calculate positional offsets in seconds from the start of the hour
                    const startSecondsIntoHour = blockStartDateTime.getMinutes() * 60 + blockStartDateTime.getSeconds();
                    const endSecondsIntoHour = blockEndDatetime.getMinutes() * 60 + blockEndDatetime.getSeconds();

                    // Calculate position and height relative to parent element
                    const topPercent = (startSecondsIntoHour / 3600) * 100;
                    const heightPercent = Math.max(((endSecondsIntoHour - startSecondsIntoHour) / 3600) * 100, 1);

                    // Create fragment from template
                    const wrapperTemplate = document.getElementById("wrapper-template");
                    const wrapperFragment = wrapperTemplate.content.cloneNode(true);

                    // Add style to 
                    const wrapperDiv = wrapperFragment.querySelector(".wrapper");
                    wrapperDiv.style.top = `${topPercent}%`;
                    wrapperDiv.style.height = `${heightPercent}%`;
                    wrapperDiv.classList.add(clampedSession.type);

                    generatedFragments.push(wrapperFragment);
                }

                return generatedFragments;


                function getHourBounds()
                {
                    const hourStartDateTime = new Date(dayDate);
                    hourStartDateTime.setHours(hourIndex, 0, 0, 0);

                    const hourEndDateTime = new Date(dayDate);
                    hourEndDateTime.setHours(hourIndex, 59, 59, 999);
                    return { hourStartDateTime, hourEndDateTime };
                }

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
            }
        }
    }

    function showCalendarContainer()
    {
        const calendarContainer = document.getElementById("calendar-container");
        calendarContainer.classList.remove("hidden");
    }
}