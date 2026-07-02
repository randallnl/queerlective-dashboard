const state = {
  session: {
    authenticated: false,
    email: "",
    member: null,
    isAdmin: true,
    canViewAs: true,
  },
  members: [],
  selectedMemberId: localStorage.getItem("colabSelectedMemberId") || "",
  shifts: [],
  activities: [],
  votes: [],
  payments: [],
  projectEvents: [],
  adminProjects: [],
  activitySummary: {
    total: 0,
    thisMonth: 0,
    latestDate: "No activity yet",
    byType: [],
  },
  signedUpShifts: new Set(),
  shiftSource: "loading",
  memberSource: "loading",
  activitySource: "loading",
  voteSource: "loading",
  paymentSource: "loading",
  projectEventSource: "loading",
  adminProjectSource: "loading",
  calendarMonthOffset: 0,
};

const shiftList = document.querySelector("#shift-list");
const modalShiftList = document.querySelector("#modal-shift-list");
const eventList = document.querySelector("#event-list");
const announcementList = document.querySelector("#announcement-list");
const paymentList = document.querySelector("#payment-list");
const voteCount = document.querySelector("#vote-count");
const nextShift = document.querySelector("#next-shift");
const nextShiftCard = document.querySelector("#next-shift-card");
const calendarFilter = document.querySelector("#calendar-filter");
const shiftWindow = document.querySelector("#shift-window");
const shiftModal = document.querySelector("#shift-modal");
const memberIdInput = document.querySelector("#member-id-input");
const shiftSourceNote = document.querySelector("#shift-source-note");
const memberSelect = document.querySelector("#member-select");
const welcomeHeading = document.querySelector("#welcome-heading");
const memberAvatar = document.querySelector("#member-avatar");
const sidebarMemberName = document.querySelector("#sidebar-member-name");
const sidebarMemberDetail = document.querySelector("#sidebar-member-detail");
const membershipType = document.querySelector("#membership-type");
const memberEmail = document.querySelector("#member-email");
const activityCount = document.querySelector("#activity-count");
const activityLatest = document.querySelector("#activity-latest");
const activitySource = document.querySelector("#activity-source");
const activityBreakdown = document.querySelector("#activity-breakdown");
const activityList = document.querySelector("#activity-list");
const shiftSection = document.querySelector("#shifts");
const headerShiftAction = document.querySelector("#header-shift-action");
const shiftNavLink = document.querySelector("#nav-shifts");
const accessStatus = document.querySelector("#access-status");
const accessEmail = document.querySelector("#access-email");
const accessLogout = document.querySelector("#access-logout");
const projectManagementSection = document.querySelector("#project-management");
const projectManagementNav = document.querySelector("#nav-project-management");
const adminProjectList = document.querySelector("#admin-project-list");
const projectManagementCount = document.querySelector("#project-management-count");
const projectSourceFilter = document.querySelector("#project-source-filter");
const projectStatusFilter = document.querySelector("#project-status-filter");
const projectSearch = document.querySelector("#project-search");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function selectedMember() {
  return state.members.find((member) => member.memberId === state.selectedMemberId);
}

function canViewAsMembers() {
  return state.session.canViewAs !== false;
}

function isAdminSession() {
  return state.session.isAdmin === true;
}

function isRetailOnlyMember(member = selectedMember()) {
  return /retail only member/i.test(member?.membershipType || "");
}

function initialsFor(name) {
  return (name || "CoLab")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function memberNameWithLastInitial(member) {
  const name = member?.preferredName || member?.name || "Member";
  const parts = name.split(/\s+/).filter(Boolean);
  const firstName = parts[0] || "Member";
  const lastInitial = parts.length > 1 ? `${parts.at(-1)[0].toUpperCase()}.` : "";
  return `${firstName}${lastInitial ? ` ${lastInitial}` : ""}`;
}

function shiftPersonName(shift) {
  if (shift.coveredBy) return shift.coveredBy;
  if (shift.person) return shift.person.split("|")[0].trim();

  const member = state.members.find((item) => item.memberId === shift.memberId);
  if (member) return memberNameWithLastInitial(member);

  return shift.memberId || "Member";
}

function tagMarkup(tags, extra = "") {
  return tags
    .map((tag) => `<span class="tag ${extra}">${escapeHtml(tag)}</span>`)
    .join("");
}

function sixWeeksFromToday() {
  const end = new Date();
  end.setDate(end.getDate() + 42);
  return end.toISOString().slice(0, 10);
}

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

function isWithinNextSixWeeks(dateValue) {
  if (!dateValue) return true;
  return dateValue <= sixWeeksFromToday();
}

function isWithinMonth(dateValue, offset) {
  if (!dateValue) return false;
  const { start, end } = monthRange(offset);
  return dateValue >= start && dateValue <= end;
}

function openShiftsNextSixWeeks() {
  const windowValue = shiftWindow?.value || "six-weeks";

  return state.shifts.filter((shift) => {
    if (shift.isCovered) return false;
    if (windowValue === "this-month") return isWithinMonth(shift.dateValue, 0);
    if (windowValue === "next-month") return isWithinMonth(shift.dateValue, 1);
    return isWithinNextSixWeeks(shift.dateValue);
  });
}

function filledShiftsForCalendar() {
  return state.shifts.filter((shift) => shift.isCovered);
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

function shiftButtonLabel(shift, isSignedUp) {
  if (isSignedUp) return "Signed up";
  if (shift.isCovered) return "Covered";
  return "Sign up";
}

function shiftMarkup(shift) {
  const currentMember = selectedMember();
  const isSignedUp =
    state.signedUpShifts.has(shift.id) ||
    Boolean(currentMember?.memberId && shift.memberId === currentMember.memberId);
  const disabled = shift.isCovered && !isSignedUp;
  const statusTag = shift.isCovered
    ? `<span class="tag covered">${escapeHtml(
        isSignedUp ? "Your shift" : shift.coverageStatus || "Covered",
      )}</span>`
    : `<span class="tag">${escapeHtml(shift.coverageStatus || "Open")}</span>`;

  return `
    <article class="shift-item">
      <div>
        <p class="shift-title">${escapeHtml(shift.title)}</p>
        <span class="shift-meta">${escapeHtml(shift.date)} · ${escapeHtml(shift.time)} · ${escapeHtml(shift.month)}</span>
        <div class="tag-row">
          ${tagMarkup(shift.tags || [])}
          ${statusTag}
        </div>
      </div>
      <button
        class="shift-button"
        type="button"
        data-shift-id="${shift.id}"
        data-shift-board-id="${escapeHtml(shift.boardId || "")}"
        ${disabled ? "disabled" : ""}
      >
        ${shiftButtonLabel(shift, isSignedUp)}
      </button>
    </article>
  `;
}

function updateNextShiftMetric() {
  if (isRetailOnlyMember()) {
    nextShift.textContent = "";
    return;
  }

  const firstSignedUpShift = state.shifts.find((shift) =>
    state.signedUpShifts.has(shift.id),
  );
  const member = selectedMember();
  const memberShift = state.shifts.find(
    (shift) => member?.memberId && shift.memberId === member.memberId,
  );
  const firstOpenShift = openShiftsNextSixWeeks()[0];

  nextShift.textContent =
    memberShift?.date || firstSignedUpShift?.date || firstOpenShift?.date || "No shift yet";
}

function renderMemberView() {
  const member = selectedMember();

  if (!member) {
    welcomeHeading.textContent = "Welcome back";
    memberAvatar.textContent = "--";
    sidebarMemberName.textContent = "No member selected";
    sidebarMemberDetail.textContent = "Choose a member";
    membershipType.textContent = "Not selected";
    memberEmail.textContent = "Choose a member to view their portal.";
    memberIdInput.value = "";
    setShiftVisibility(false);
    renderActivity();
    return;
  }

  const displayName = member.preferredName || member.name;
  welcomeHeading.textContent = `Welcome back, ${displayName}`;
  memberAvatar.textContent = initialsFor(displayName);
  sidebarMemberName.textContent = displayName;
  sidebarMemberDetail.textContent = member.membershipType || "CoLab member";
  membershipType.textContent = member.membershipType || "Member";
  memberEmail.textContent = `Member ID ${member.memberId}`;
  memberIdInput.value = member.memberId;
  setShiftVisibility(!isRetailOnlyMember(member));
}

function setShiftVisibility(isVisible) {
  shiftSection?.classList.toggle("is-hidden", !isVisible);
  nextShiftCard?.classList.toggle("is-hidden", !isVisible);
  headerShiftAction?.classList.toggle("is-hidden", !isVisible);
  shiftNavLink?.classList.toggle("is-hidden", !isVisible);
}

function renderMemberSelect() {
  if (!state.members.length) {
    memberSelect.innerHTML = `<option value="">No members found</option>`;
    memberSelect.disabled = true;
    renderMemberView();
    return;
  }

  const canViewAs = canViewAsMembers();
  memberSelect.disabled = !canViewAs;
  memberSelect.innerHTML = state.members
    .map((member) => {
      const displayName = member.preferredName || member.name;
      return `<option value="${escapeHtml(member.memberId)}">${escapeHtml(displayName)}</option>`;
    })
    .join("");

  if (!canViewAs && state.session.member?.memberId) {
    state.selectedMemberId = state.session.member.memberId;
  }

  if (!state.selectedMemberId || !state.members.some((member) => member.memberId === state.selectedMemberId)) {
    state.selectedMemberId = state.members[0].memberId;
  }

  memberSelect.value = state.selectedMemberId;
  if (canViewAs) {
    localStorage.setItem("colabSelectedMemberId", state.selectedMemberId);
  } else {
    localStorage.removeItem("colabSelectedMemberId");
  }
  renderMemberView();
  if (state.shifts.length) renderShifts();
  if (state.votes.length) renderVotes();
}

function renderAccessSession() {
  const memberName =
    state.session.member?.preferredName || state.session.member?.name || "member";

  if (!accessStatus || !accessEmail) return;

  if (!state.session.authenticated) {
    accessStatus.textContent = "Local preview";
    accessEmail.textContent = "Zero Trust login appears after deployment";
    accessLogout?.classList.add("is-hidden");
    setAdminVisibility(isAdminSession());
    return;
  }

  accessStatus.textContent = state.session.canViewAs ? "Admin login" : "Logged in";
  accessEmail.textContent = state.session.member
    ? `${memberName} · ${state.session.email}`
    : state.session.email;
  accessLogout?.classList.remove("is-hidden");
  setAdminVisibility(isAdminSession());
}

function setAdminVisibility(isVisible) {
  projectManagementSection?.classList.toggle("is-hidden", !isVisible);
  projectManagementNav?.classList.toggle("is-hidden", !isVisible);
}

async function loadSession() {
  try {
    const response = await fetch("/api/session");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Unable to load login.");

    state.session = {
      authenticated: Boolean(payload.authenticated),
      email: payload.email || "",
      member: payload.member || null,
      isAdmin: payload.isAdmin !== false,
      canViewAs: payload.canViewAs !== false,
    };

    if (state.session.member?.memberId && !state.session.canViewAs) {
      state.selectedMemberId = state.session.member.memberId;
    }
  } catch {
    state.session = {
      authenticated: false,
      email: "",
      member: null,
      isAdmin: true,
      canViewAs: true,
    };
  }

  renderAccessSession();
}

function renderShifts() {
  if (isRetailOnlyMember()) {
    shiftList.innerHTML = "";
    modalShiftList.innerHTML = "";
    updateNextShiftMetric();
    return;
  }

  const openShifts = openShiftsNextSixWeeks();
  updateNextShiftMetric();

  if (!openShifts.length) {
    shiftList.innerHTML = `<p class="form-note">No open CoLab shifts are available right now.</p>`;
    modalShiftList.innerHTML = shiftList.innerHTML;
    return;
  }

  const previewShifts = openShifts.slice(0, 2);
  shiftList.innerHTML = `
    ${previewShifts.map(shiftMarkup).join("")}
    ${
      openShifts.length > previewShifts.length
        ? `<button class="secondary-action list-action" type="button" data-open-shift-modal>
            See all ${openShifts.length} open shifts
          </button>`
        : ""
    }
  `;
  modalShiftList.innerHTML = openShifts.map(shiftMarkup).join("");

  if (shiftSourceNote) {
    const windowLabel =
      shiftWindow?.selectedOptions?.[0]?.textContent?.toLowerCase() || "next 6 weeks";
    shiftSourceNote.textContent =
      state.shiftSource === "monday"
        ? `Showing open CoLab Calendar shifts for ${windowLabel}.`
        : "Using preview data until monday is available.";
  }
}

async function loadMembers() {
  try {
    const response = await fetch("/api/members");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Unable to load members.");

    state.members = payload.members || [];
    state.memberSource = payload.source || "monday";
    if (payload.canViewAs === false) state.session.canViewAs = false;
  } catch (error) {
    state.members = [];
    state.memberSource = "error";
    shiftSourceNote.textContent = error.message;
  }

  renderMemberSelect();
}

async function loadShifts() {
  shiftList.innerHTML = `<p class="form-note">Loading CoLab shifts...</p>`;
  modalShiftList.innerHTML = shiftList.innerHTML;

  try {
    const response = await fetch("/api/shifts");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Unable to load shifts.");

    state.shifts = payload.shifts || [];
    state.shiftSource = payload.source || "monday";
  } catch (error) {
    state.shifts = [];
    state.shiftSource = "error";
    shiftSourceNote.textContent = error.message;
  }

  renderShifts();
  renderEvents(calendarFilter.value);
}

function renderActivity() {
  const summary = state.activitySummary;
  const sourceLabel =
    state.activitySource === "monday"
      ? "Monday"
      : state.activitySource === "mock"
        ? "Preview"
        : state.activitySource === "error"
          ? "Offline"
          : "Loading";

  activityCount.textContent = summary.thisMonth ?? 0;
  activityLatest.textContent =
    summary.total > 0 ? `Latest: ${summary.latestDate}` : "No activity yet";
  activitySource.textContent = sourceLabel;

  if (!selectedMember()) {
    activityBreakdown.innerHTML = "";
    activityList.innerHTML = `<p class="form-note">Choose a member to view activity.</p>`;
    return;
  }

  if (!state.activities.length) {
    activityBreakdown.innerHTML = "";
    activityList.innerHTML = `<p class="form-note">No activity has been logged for this member yet.</p>`;
    return;
  }

  activityBreakdown.innerHTML = summary.byType
    .map(
      (item) => `
        <span class="activity-pill">
          ${escapeHtml(item.type)}
          <strong>${item.count}</strong>
        </span>
      `,
    )
    .join("");

  activityList.innerHTML = state.activities
    .slice(0, 5)
    .map(
      (activity) => `
        <article class="activity-item">
          <div>
            <p class="activity-title">${escapeHtml(activity.title || activity.activityType)}</p>
            <span class="event-meta">${escapeHtml(activity.displayDate)} · ${escapeHtml(activity.activityType)}</span>
            ${
              activity.description
                ? `<p class="activity-description">${escapeHtml(activity.description)}</p>`
                : ""
            }
          </div>
        </article>
      `,
    )
    .join("");
}

async function loadActivity() {
  const member = selectedMember();

  if (!member?.memberId) {
    state.activities = [];
    state.activitySummary = {
      total: 0,
      thisMonth: 0,
      latestDate: "No activity yet",
      byType: [],
    };
    state.activitySource = "loading";
    renderActivity();
    return;
  }

  activityList.innerHTML = `<p class="form-note">Loading member activity...</p>`;

  try {
    const response = await fetch(`/api/activity?memberId=${encodeURIComponent(member.memberId)}`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Unable to load activity.");

    state.activities = payload.activities || [];
    state.activitySummary = payload.summary || {
      total: state.activities.length,
      thisMonth: 0,
      latestDate: "No activity yet",
      byType: [],
    };
    state.activitySource = payload.source || "monday";
  } catch (error) {
    state.activities = [];
    state.activitySummary = {
      total: 0,
      thisMonth: 0,
      latestDate: "No activity yet",
      byType: [],
    };
    state.activitySource = "error";
    activityList.innerHTML = `<p class="form-note">${escapeHtml(error.message)}</p>`;
  }

  renderActivity();
}

function renderEvents(filter = "all") {
  const filledShiftEvents = filledShiftsForCalendar().map((shift) => {
    const isSelectedMember =
      selectedMember()?.memberId && shift.memberId === selectedMember().memberId;
    const coveredBy = shiftPersonName(shift);

    return {
      title: isSelectedMember ? "Your CoLab shift" : "Filled CoLab shift",
      date: shift.date,
      dateValue: shift.dateValue,
      time: shift.time,
      type: "shift",
      meta: `${coveredBy} is covering ${shift.title}.`,
    };
  });
  const visibleEvents = [...state.projectEvents, ...filledShiftEvents]
    .filter((event) => filter === "all" || event.type === filter)
    .sort((a, b) => (a.dateValue || a.date || "").localeCompare(b.dateValue || b.date || ""));
  const monthDate = monthRange(state.calendarMonthOffset).date;
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
  const eventMap = visibleEvents.reduce((map, event) => {
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

  eventList.innerHTML = `
    <div class="calendar-month-label">${escapeHtml(monthLabel)}</div>
    <div class="calendar-grid" role="grid" aria-label="${escapeHtml(monthLabel)} calendar">
      ${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        .map((day) => `<div class="calendar-weekday" role="columnheader">${day}</div>`)
        .join("")}
      ${cells
        .map((cell) => {
          if (cell.type === "blank") {
            return `<div class="calendar-day blank" aria-hidden="true"></div>`;
          }

          return `
            <div class="calendar-day" role="gridcell">
              <span class="calendar-day-number">${cell.day}</span>
              <div class="calendar-day-events">
                ${cell.events
                  .map(
                    (event) => `
                      <article class="calendar-event ${escapeHtml(event.type)}">
                        <strong>${escapeHtml(event.title)}</strong>
                        <span>${escapeHtml(event.time)}</span>
                        <small>${escapeHtml(event.meta)}</small>
                      </article>
                    `,
                  )
                  .join("")}
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

async function loadProjectEvents() {
  const member = selectedMember();
  const memberQuery = member?.memberId
    ? `?memberId=${encodeURIComponent(member.memberId)}`
    : "";

  try {
    const response = await fetch(`/api/events${memberQuery}`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Unable to load events.");

    state.projectEvents = payload.events || [];
    state.projectEventSource = payload.source || "monday";
  } catch {
    state.projectEvents = [];
    state.projectEventSource = "error";
  }

  renderEvents(calendarFilter.value);
}

function projectMatchesFilters(project) {
  const source = projectSourceFilter?.value || "all";
  const status = projectStatusFilter?.value || "all";
  const query = (projectSearch?.value || "").trim().toLowerCase();
  const haystack = [
    project.title,
    project.owner,
    project.location,
    project.status,
    project.category,
    project.priority,
    project.description,
  ]
    .join(" ")
    .toLowerCase();

  return (
    (source === "all" || project.source === source) &&
    (status === "all" || project.status === status) &&
    (!query || haystack.includes(query))
  );
}

function populateProjectStatusFilter() {
  if (!projectStatusFilter) return;

  const currentValue = projectStatusFilter.value || "all";
  const statuses = Array.from(
    new Set(state.adminProjects.map((project) => project.status).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));

  projectStatusFilter.innerHTML = `
    <option value="all">All statuses</option>
    ${statuses
      .map((status) => `<option value="${escapeHtml(status)}">${escapeHtml(status)}</option>`)
      .join("")}
  `;
  projectStatusFilter.value = statuses.includes(currentValue) ? currentValue : "all";
}

function projectCardMarkup(project) {
  const tags = [
    project.typeLabel,
    project.status,
    project.priority,
    project.category,
    project.location,
  ].filter(Boolean);

  return `
    <article class="admin-project-card">
      <div>
        <span class="event-meta">${escapeHtml(project.displayDate || "No date")} · ${escapeHtml(project.owner || "No owner")}</span>
        <h3>${escapeHtml(project.title)}</h3>
        ${
          project.description
            ? `<p>${escapeHtml(project.description).slice(0, 220)}${project.description.length > 220 ? "..." : ""}</p>`
            : ""
        }
        <div class="admin-project-meta">
          ${tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
        </div>
      </div>
      <a class="secondary-action link-action admin-project-action" href="${escapeHtml(project.detailUrl)}">
        Open details
      </a>
    </article>
  `;
}

function renderAdminProjects() {
  if (!adminProjectList || !projectManagementCount) return;

  if (!isAdminSession()) {
    adminProjectList.innerHTML = "";
    projectManagementCount.textContent = "Admin only";
    return;
  }

  populateProjectStatusFilter();
  const filteredProjects = state.adminProjects.filter(projectMatchesFilters);
  projectManagementCount.textContent = `${filteredProjects.length} shown`;

  if (!filteredProjects.length) {
    adminProjectList.innerHTML = `<p class="form-note">No projects match these filters.</p>`;
    return;
  }

  adminProjectList.innerHTML = filteredProjects
    .slice(0, 12)
    .map(projectCardMarkup)
    .join("");
}

async function loadAdminProjects() {
  if (!isAdminSession()) {
    state.adminProjects = [];
    renderAdminProjects();
    return;
  }

  adminProjectList.innerHTML = `<p class="form-note">Loading admin projects...</p>`;

  try {
    const response = await fetch("/api/admin/projects");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Unable to load projects.");

    state.adminProjects = payload.projects || [];
    state.adminProjectSource = payload.source || "monday";
  } catch (error) {
    state.adminProjects = [];
    state.adminProjectSource = "error";
    adminProjectList.innerHTML = `<p class="form-note">${escapeHtml(error.message)}</p>`;
    return;
  }

  renderAdminProjects();
}

function responseCount(vote, response) {
  return vote.responseCounts?.[response] || 0;
}

function renderVotes() {
  const openVotes = state.votes.filter((vote) => vote.status !== "Approved");
  voteCount.textContent = openVotes.length;

  if (!state.votes.length) {
    announcementList.innerHTML = `<p class="form-note">No community votes are open right now.</p>`;
    return;
  }

  announcementList.innerHTML = state.votes
    .map((vote) => {
      const memberResponse = vote.memberResponse || "";
      const approved = vote.status === "Approved";
      const needsComment = memberResponse === "Don't Approve(With Comment)";
      const memberHasVoted = Boolean(memberResponse);
      const disabled = approved || memberHasVoted ? "disabled" : "";

      return `
        <article class="announcement-item">
          <div class="vote-row vote-row-top">
            <div>
              <p class="announcement-title">${escapeHtml(vote.question)}</p>
              <span class="event-meta">${escapeHtml(vote.voteType)} · ${escapeHtml(vote.closesLabel)} · ${escapeHtml(vote.status)}</span>
            </div>
            <span class="status-pill">${escapeHtml(vote.responseTotal || 0)} responses</span>
          </div>
          ${
            memberHasVoted
              ? `<p class="form-note">You voted: ${escapeHtml(memberResponse)}</p>`
              : ""
          }
          ${
            vote.details
              ? `<p class="vote-details">${escapeHtml(vote.details)}</p>`
              : ""
          }
          <div class="vote-counts" aria-label="Vote response totals">
            <span>Approve <strong>${responseCount(vote, "Approve")}</strong></span>
            <span>Don't approve <strong>${responseCount(vote, "Don't Approve(With Comment)")}</strong></span>
          </div>
          <div class="vote-actions">
            <button
              class="vote-button"
              type="button"
              data-vote-id="${escapeHtml(vote.id)}"
              data-vote-motion="${escapeHtml(vote.question)}"
              data-vote-response="Approve"
              aria-pressed="${memberResponse === "Approve"}"
              ${disabled}
            >
              ${memberResponse === "Approve" ? "Approved" : "Approve"}
            </button>
            <button
              class="vote-button"
              type="button"
              data-vote-id="${escapeHtml(vote.id)}"
              data-vote-motion="${escapeHtml(vote.question)}"
              data-vote-response="Don't Approve(With Comment)"
              aria-pressed="${needsComment}"
              ${disabled}
            >
              Don't approve
            </button>
          </div>
          <label class="vote-comment">
            Comment
            <textarea
              data-vote-comment="${escapeHtml(vote.id)}"
              ${disabled}
            >${escapeHtml(vote.memberComment || "")}</textarea>
          </label>
        </article>
      `;
    })
    .join("");
}

async function loadVotes() {
  const member = selectedMember();
  const memberQuery = member?.memberId
    ? `?memberId=${encodeURIComponent(member.memberId)}`
    : "";

  announcementList.innerHTML = `<p class="form-note">Loading community votes...</p>`;

  try {
    const response = await fetch(`/api/votes${memberQuery}`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Unable to load votes.");

    state.votes = payload.votes || [];
    state.voteSource = payload.source || "monday";
  } catch (error) {
    state.votes = [];
    state.voteSource = "error";
    announcementList.innerHTML = `<p class="form-note">${escapeHtml(error.message)}</p>`;
  }

  renderVotes();
}

function renderPayments() {
  if (!state.payments.length) {
    paymentList.innerHTML = `<p class="form-note">No CoLab membership payments found for this member.</p>`;
    return;
  }

  paymentList.innerHTML = state.payments
    .map(
      (payment) => `
        <article class="payment-item">
          <div>
            <strong>${escapeHtml(payment.details)}</strong>
            <small>${escapeHtml(payment.date)} · ${escapeHtml(payment.email)}</small>
          </div>
          <div>
            <strong>${escapeHtml(payment.amount)}</strong>
          </div>
        </article>
      `,
    )
    .join("");
}

async function loadPayments() {
  const member = selectedMember();

  if (!member?.memberId) {
    state.payments = [];
    state.paymentSource = "loading";
    renderPayments();
    return;
  }

  paymentList.innerHTML = `<p class="form-note">Loading payment history...</p>`;

  try {
    const response = await fetch(`/api/payments?memberId=${encodeURIComponent(member.memberId)}`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Unable to load payment history.");

    state.payments = payload.payments || [];
    state.paymentSource = payload.source || "monday";
  } catch (error) {
    state.payments = [];
    state.paymentSource = "error";
    paymentList.innerHTML = `<p class="form-note">${escapeHtml(error.message)}</p>`;
    return;
  }

  renderPayments();
}

async function signUpForShift(shiftId, shiftBoardId, button) {
  const member = selectedMember();
  if (isRetailOnlyMember(member)) return;

  const memberId = member?.memberId || memberIdInput.value.trim();
  if (!memberId) {
    memberSelect.focus();
    shiftSourceNote.textContent = "Choose a member before signing up for a shift.";
    return;
  }

  button.disabled = true;
  button.textContent = "Signing up...";

  try {
    const response = await fetch("/api/shifts/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shiftId, shiftBoardId, memberId }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Shift signup failed.");

    const signedUpShift = state.shifts.find((shift) => shift.id === shiftId);
    state.signedUpShifts.add(shiftId);
    state.shifts = state.shifts.map((shift) =>
      shift.id === shiftId
        ? {
            ...shift,
            memberId,
            person: payload.person || `${memberNameWithLastInitial(member)} | ${memberId}`,
            coveredBy: payload.coveredBy || memberNameWithLastInitial(member),
            coverageStatus: "Covered",
            isCovered: true,
          }
        : shift,
    );
    renderShifts();
    renderEvents(calendarFilter.value);
    shiftSourceNote.textContent = `Confirmed: ${payload.coveredBy || memberNameWithLastInitial(member)} is covering ${signedUpShift?.date || "this shift"}.`;
    return;
  } catch (error) {
    renderShifts();
    renderEvents(calendarFilter.value);
    shiftSourceNote.textContent = error.message;
    return;
  }
}

function handleShiftClick(event) {
  const button = event.target.closest("[data-shift-id]");
  if (!button) return;
  signUpForShift(button.dataset.shiftId, button.dataset.shiftBoardId, button);
}

async function handleVoteClick(event) {
  const communityVoteButton = event.target.closest("[data-vote-motion]");
  if (!communityVoteButton) return;

  const member = selectedMember();
  if (!member?.memberId) {
    memberSelect.focus();
    return;
  }

  const motion = communityVoteButton.dataset.voteMotion;
  const voteId = communityVoteButton.dataset.voteId;
  const responseValue = communityVoteButton.dataset.voteResponse;
  const commentInput = Array.from(
    document.querySelectorAll("[data-vote-comment]"),
  ).find((input) => input.dataset.voteComment === voteId);
  const comment = commentInput?.value.trim() || "";

  if (responseValue === "Don't Approve(With Comment)" && !comment) {
    commentInput?.focus();
    return;
  }

  communityVoteButton.disabled = true;
  communityVoteButton.textContent = "Saving...";

  try {
    const apiResponse = await fetch("/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        voteId,
        motion,
        response: responseValue,
        comment,
        memberId: member.memberId,
      }),
    });
    const payload = await apiResponse.json();
    if (!apiResponse.ok) throw new Error(payload.error || "Vote failed.");

    await loadVotes();
  } catch (error) {
    communityVoteButton.textContent = responseValue === "Approve" ? "Approve" : "Don't approve";
    communityVoteButton.disabled = false;
    if (commentInput) commentInput.placeholder = error.message;
  }
}

memberSelect.addEventListener("change", (event) => {
  if (!canViewAsMembers()) {
    memberSelect.value = state.selectedMemberId;
    return;
  }

  state.selectedMemberId = event.target.value;
  localStorage.setItem("colabSelectedMemberId", state.selectedMemberId);
  renderMemberView();
  renderShifts();
  renderEvents(calendarFilter.value);
  loadActivity();
  loadVotes();
  loadPayments();
  loadProjectEvents();
});

document.addEventListener("click", (event) => {
  handleShiftClick(event);
  handleVoteClick(event);
  if (event.target.closest("[data-open-shift-modal]")) {
    if (!shiftModal.open) shiftModal.showModal();
  }
});

calendarFilter.addEventListener("change", (event) => {
  renderEvents(event.target.value);
});

shiftWindow.addEventListener("change", () => {
  renderShifts();
});

[projectSourceFilter, projectStatusFilter, projectSearch].forEach((control) => {
  control?.addEventListener("input", renderAdminProjects);
  control?.addEventListener("change", renderAdminProjects);
});

document.querySelectorAll("[data-calendar-shift]").forEach((button) => {
  button.addEventListener("click", () => {
    state.calendarMonthOffset += Number(button.dataset.calendarShift || 0);
    renderEvents(calendarFilter.value);
  });
});

document.querySelectorAll("[data-section-link]").forEach((link) => {
  link.addEventListener("click", () => {
    document
      .querySelectorAll("[data-section-link]")
      .forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
  });
});

async function init() {
  await loadSession();
  await loadMembers();
  await loadAdminProjects();
  await loadActivity();
  await loadVotes();
  await loadPayments();
  await loadProjectEvents();
  loadShifts();
}

init();
renderEvents();
