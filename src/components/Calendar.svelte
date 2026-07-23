<script>
  import { onMount } from "svelte";

  let bridgeEvents = [];
  let fetchedShiftEvents = [];
  let events = [];
  let visible = [];
  let filter = "all";
  let monthOffset = 0;
  let shiftSource = "loading";
  let shiftError = "";
  let sourceNote = "Loading calendar events...";

  const filters = [
    ["all", "All events"],
    ["workshop", "Workshops"],
    ["member", "Member use"],
    ["project", "Project/events"],
    ["community", "Community proposals"],
    ["shift", "Filled shifts"],
    ["maintenance", "Maintenance"],
  ];

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function monthRange(offset = 0) {
    const today = new Date();
    const start = new Date(Date.UTC(today.getFullYear(), today.getMonth() + offset, 1));
    const end = new Date(Date.UTC(today.getFullYear(), today.getMonth() + offset + 1, 0));

    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      date: start,
    };
  }

  function calendarDateParts(event) {
    if (event.dateValue) {
      const date = new Date(`${event.dateValue}T00:00:00Z`);
      if (!Number.isNaN(date.getTime())) {
        return {
          day: new Intl.DateTimeFormat("en-US", {
            day: "numeric",
            timeZone: "UTC",
          }).format(date),
          month: new Intl.DateTimeFormat("en-US", {
            month: "short",
            timeZone: "UTC",
          }).format(date),
        };
      }
    }

    const parts = String(event.date || "").split(/\s+/).filter(Boolean);
    return {
      month: parts.at(-2) || "",
      day: parts.at(-1) || "",
    };
  }

  function eventDateKey(event) {
    if (event.dateValue) return event.dateValue;

    const { month, day } = calendarDateParts(event);
    if (!month || !day) return "";

    const fallbackDate = new Date(`${month} ${day}, ${new Date().getFullYear()} 00:00:00`);
    if (Number.isNaN(fallbackDate.getTime())) return "";

    return fallbackDate.toISOString().slice(0, 10);
  }

  function visibleEventsFor(allEvents, currentFilter) {
    return allEvents
      .filter((event) => currentFilter === "all" || event.type === currentFilter)
      .sort((a, b) => (a.dateValue || a.date || "").localeCompare(b.dateValue || b.date || ""));
  }

  function calendarModelFor(currentEvents, currentMonthOffset) {
    const monthDate = monthRange(currentMonthOffset).date;
    const year = monthDate.getUTCFullYear();
    const month = monthDate.getUTCMonth();
    const monthLabel = new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(monthDate);
    const firstDay = new Date(Date.UTC(year, month, 1));
    const lastDay = new Date(Date.UTC(year, month + 1, 0));
    const leadingBlanks = firstDay.getUTCDay();
    const daysInMonth = lastDay.getUTCDate();
    const eventMap = currentEvents.reduce((map, event) => {
      const key = eventDateKey(event);
      if (!key) return map;

      map[key] ||= [];
      map[key].push(event);
      return map;
    }, {});
    const cells = [
      ...Array.from({ length: leadingBlanks }, () => ({ type: "blank" })),
      ...Array.from({ length: daysInMonth }, (_, index) => {
        const day = index + 1;
        const dateValue = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return {
          type: "day",
          day,
          events: eventMap[dateValue] || [],
        };
      }),
    ];

    return { monthLabel, cells };
  }

  function eventDetails(event) {
    return [
      event.date ? `Date: ${event.date}` : "",
      event.time ? `Time/type: ${event.time}` : "",
      event.meta || "",
      event.details || "",
    ].filter(Boolean);
  }

  function shiftPersonName(shift) {
    if (shift.coveredBy) return shift.coveredBy;
    if (shift.person) return shift.person.split("|")[0].trim();
    return shift.memberId || "Member";
  }

  function shiftToEvent(shift) {
    const coveredBy = shiftPersonName(shift);

    return {
      title: "Filled CoLab shift",
      date: shift.date,
      dateValue: shift.dateValue,
      time: shift.time,
      type: "shift",
      meta: `${coveredBy} is covering ${shift.title}.`,
      details: `Coverage status: ${shift.coverageStatus || "Covered"}.`,
    };
  }

  async function loadShiftEvents() {
    try {
      const response = await fetch("/api/shifts");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to load shifts.");

      const shifts = payload.shifts || [];
      fetchedShiftEvents = shifts
        .filter((shift) => shift.isCovered)
        .map(shiftToEvent);
      shiftSource = payload.source || "dashboard";
      shiftError = "";
    } catch (error) {
      shiftError = error.message;
    }
  }

  onMount(() => {
    function handleCalendarData(event) {
      bridgeEvents = event.detail?.events || [];
    }

    window.addEventListener("colab:calendar-data", handleCalendarData);
    if (window.__colabCalendarData?.events) {
      bridgeEvents = window.__colabCalendarData.events;
    }
    loadShiftEvents();
    window.dispatchEvent(new CustomEvent("colab:calendar-ready"));

    return () => {
      window.removeEventListener("colab:calendar-data", handleCalendarData);
    };
  });

  $: events = [
    ...bridgeEvents.filter((event) => event.type !== "shift"),
    ...fetchedShiftEvents,
  ];
  $: visible = visibleEventsFor(events, filter);
  $: model = calendarModelFor(visible, monthOffset);
  $: sourceNote = shiftError
    ? shiftError
    : shiftSource === "loading"
      ? "Loading calendar events..."
      : `${visible.length} events shown · ${fetchedShiftEvents.length} filled shifts from ${shiftSource}`;
</script>

<div class="panel-actions calendar-component-actions">
  <div class="segmented-control" aria-label="Calendar month">
    <button
      class="icon-button"
      type="button"
      aria-label="Previous month"
      onclick={() => (monthOffset -= 1)}
    >
      &lsaquo;
    </button>
    <button
      class="icon-button"
      type="button"
      aria-label="Next month"
      onclick={() => (monthOffset += 1)}
    >
      &rsaquo;
    </button>
  </div>
  <select
    value={filter}
    aria-label="Filter calendar"
    onchange={(event) => (filter = event.currentTarget.value)}
  >
    {#each filters as [value, label]}
      <option value={value}>{label}</option>
    {/each}
  </select>
</div>

<div class="event-list" id="event-list">
  <div class="calendar-month-label">
    <span>{model.monthLabel}</span>
    <small>{sourceNote}</small>
  </div>
  <div class="calendar-grid" role="grid" aria-label={`${model.monthLabel} calendar`}>
    {#each weekdays as day}
      <div class="calendar-weekday" role="columnheader">{day}</div>
    {/each}

    {#each model.cells as cell}
      {#if cell.type === "blank"}
        <div class="calendar-day blank" aria-hidden="true"></div>
      {:else}
        <div class="calendar-day" role="gridcell">
          <span class="calendar-day-number">{cell.day}</span>
          <div class="calendar-day-events">
            {#each cell.events as event}
              <details class={`calendar-event ${event.type || ""}`}>
                <summary>
                  <strong>{event.title}</strong>
                  <span>{event.time}</span>
                  <small>{event.meta}</small>
                </summary>
                <div class="calendar-event-details">
                  {#each eventDetails(event) as detail}
                    <p>{detail}</p>
                  {/each}
                  {#if event.detailUrl}
                    <a class="calendar-event-link" href={event.detailUrl}>Open details</a>
                  {/if}
                </div>
              </details>
            {/each}
          </div>
        </div>
      {/if}
    {/each}
  </div>
</div>
