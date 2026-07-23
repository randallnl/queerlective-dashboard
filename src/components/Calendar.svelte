<script>
  import { onMount } from "svelte";

  let events = [];
  let filter = "all";
  let monthOffset = 0;

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

  function visibleEvents() {
    return events
      .filter((event) => filter === "all" || event.type === filter)
      .sort((a, b) => (a.dateValue || a.date || "").localeCompare(b.dateValue || b.date || ""));
  }

  function calendarModel() {
    const monthDate = monthRange(monthOffset).date;
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
    const eventMap = visibleEvents().reduce((map, event) => {
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

  onMount(() => {
    function handleCalendarData(event) {
      events = event.detail?.events || [];
    }

    window.addEventListener("colab:calendar-data", handleCalendarData);
    window.dispatchEvent(new CustomEvent("colab:calendar-ready"));

    return () => {
      window.removeEventListener("colab:calendar-data", handleCalendarData);
    };
  });

  $: model = calendarModel();
</script>

<div class="panel-actions calendar-component-actions">
  <div class="segmented-control" aria-label="Calendar month">
    <button
      class="icon-button"
      type="button"
      aria-label="Previous month"
      on:click={() => (monthOffset -= 1)}
    >
      &lsaquo;
    </button>
    <button
      class="icon-button"
      type="button"
      aria-label="Next month"
      on:click={() => (monthOffset += 1)}
    >
      &rsaquo;
    </button>
  </div>
  <select bind:value={filter} aria-label="Filter calendar">
    {#each filters as [value, label]}
      <option value={value}>{label}</option>
    {/each}
  </select>
</div>

<div class="event-list" id="event-list">
  <div class="calendar-month-label">{model.monthLabel}</div>
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
