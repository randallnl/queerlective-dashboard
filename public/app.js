const state = {
  session: {
    authenticated: false,
    email: "",
    member: null,
    isAdmin: false,
    canViewAs: false,
  },
  members: [],
  selectedMemberId: localStorage.getItem("colabSelectedMemberId") || "",
  shifts: [],
  activities: [],
  votes: [],
  payments: [],
  orders: [],
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
  orderSource: "loading",
  projectEventSource: "loading",
  adminProjectSource: "loading",
};

const shiftList = document.querySelector("#shift-list");
const modalShiftList = document.querySelector("#modal-shift-list");
const announcementList = document.querySelector("#announcement-list");
const paymentList = document.querySelector("#payment-list");
const orderList = document.querySelector("#order-list");
const orderCount = document.querySelector("#order-count");
const voteCount = document.querySelector("#vote-count");
const nextShift = document.querySelector("#next-shift");
const nextShiftCard = document.querySelector("#next-shift-card");
const shiftWindow = document.querySelector("#shift-window");
const shiftModal = document.querySelector("#shift-modal");
const memberIdInput = document.querySelector("#member-id-input");
const shiftSourceNote = document.querySelector("#shift-source-note");
const memberSelect = document.querySelector("#member-select");
const memberSelectField = document.querySelector("#member-select-field");
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
const orderSection = document.querySelector("#orders");
const headerShiftAction = document.querySelector("#header-shift-action");
const shiftNavLink = document.querySelector("#nav-shifts");
const orderNavLink = document.querySelector("#nav-orders");
const accessStatus = document.querySelector("#access-status");
const accessEmail = document.querySelector("#access-email");
const accessLogout = document.querySelector("#access-logout");
const loginForm = document.querySelector("#login-form");
const loginEmail = document.querySelector("#login-email");
const loginNote = document.querySelector("#login-note");
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
    .map((tag) => `<span class="tag ${extra} ${toneClass(tag)}">${escapeHtml(tag)}</span>`)
    .join("");
}

function toneClass(value = "") {
  const text = String(value).toLowerCase();

  if (/approve|covered|complete|active|high|admin|project/.test(text)) return "tone-teal";
  if (/pending|consent|review|medium|community|proposal/.test(text)) return "tone-gold";
  if (/don't|dont|unfulfilled|urgent|critical|blocked|cancel/.test(text)) return "tone-coral";
  if (/simple|super|vote|low|planning|workshop/.test(text)) return "tone-purple";
  if (/retail|maintenance|draft|paused/.test(text)) return "tone-slate";

  const tones = ["tone-teal", "tone-coral", "tone-gold", "tone-purple", "tone-slate"];
  const hash = Array.from(text).reduce((total, char) => total + char.charCodeAt(0), 0);
  return tones[hash % tones.length];
}

function statusPillMarkup(value, extra = "") {
  if (!value) return "";
  return `<span class="status-pill ${extra} ${toneClass(value)}">${escapeHtml(value)}</span>`;
}

function sixWeeksFromToday() {
  const end = new Date();
  end.setDate(end.getDate() + 42);
  return end.toISOString().slice(0, 10);
}

function todayValue() {
  return new Date().toISOString().slice(0, 10);
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
  return dateValue >= todayValue() && dateValue <= sixWeeksFromToday();
}

function isWithinMonth(dateValue, offset) {
  if (!dateValue) return false;
  const { start, end } = monthRange(offset);
  return dateValue >= todayValue() && dateValue >= start && dateValue <= end;
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
    state.signedUpShifts.has(shift.id) &&
      (!shift.dateValue || shift.dateValue >= todayValue()),
  );
  const member = selectedMember();
  const memberShift = state.shifts.find(
    (shift) =>
      member?.memberId &&
      shift.memberId === member.memberId &&
      (!shift.dateValue || shift.dateValue >= todayValue()),
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
    setOrderVisibility(false);
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
  setOrderVisibility(!isRetailOnlyMember(member));
}

function setShiftVisibility(isVisible) {
  shiftSection?.classList.toggle("is-hidden", !isVisible);
  nextShiftCard?.classList.toggle("is-hidden", !isVisible);
  headerShiftAction?.classList.toggle("is-hidden", !isVisible);
  shiftNavLink?.classList.toggle("is-hidden", !isVisible);
}

function setOrderVisibility(isVisible) {
  orderSection?.classList.toggle("is-hidden", !isVisible);
  orderNavLink?.classList.toggle("is-hidden", !isVisible);
}

function renderMemberSelect() {
  if (!state.members.length) {
    memberSelect.innerHTML = `<option value="">No members found</option>`;
    memberSelect.disabled = true;
    memberSelectField?.classList.toggle("is-hidden", !canViewAsMembers());
    renderMemberView();
    return;
  }

  const canViewAs = canViewAsMembers();
  memberSelect.disabled = !canViewAs;
  memberSelectField?.classList.toggle("is-hidden", !canViewAs);
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
    accessStatus.textContent = "Sign in";
    accessEmail.textContent = "Send yourself a magic link";
    loginForm?.classList.remove("is-hidden");
    accessLogout?.classList.add("is-hidden");
    setAdminVisibility(false);
    return;
  }

  accessStatus.textContent = state.session.canViewAs ? "Admin login" : "Logged in";
  accessEmail.textContent = state.session.member
    ? `${memberName} · ${state.session.email}`
    : state.session.email;
  loginForm?.classList.add("is-hidden");
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
      isAdmin: false,
      canViewAs: false,
    };
  }

  renderAccessSession();
}

async function requestLoginLink(event) {
  event.preventDefault();
  const email = loginEmail?.value.trim() || "";
  if (!email) {
    loginEmail?.focus();
    return;
  }

  const submitButton = loginForm?.querySelector("button");
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
  }
  loginNote.textContent = "Checking your member email...";

  try {
    const response = await fetch("/api/auth/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Unable to send login link.");

    loginNote.textContent = payload.message || "Check your email for a sign-in link.";
  } catch (error) {
    loginNote.textContent = error.message;
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Send link";
    }
  }
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
    const sourceLabel =
      state.shiftSource === "d1"
        ? "D1"
        : state.shiftSource === "monday+d1"
          ? "Monday synced to D1"
          : state.shiftSource === "monday"
            ? "Monday"
            : "preview data";
    shiftSourceNote.textContent = `Showing open CoLab Calendar shifts for ${windowLabel}. Source: ${sourceLabel}.`;
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
  renderEvents();
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
        <span class="activity-pill ${toneClass(item.type)}">
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

function renderEvents() {
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
      details: `Coverage status: covered by ${coveredBy}.`,
    };
  });
  const events = [...state.projectEvents, ...filledShiftEvents]
    .sort((a, b) => (a.dateValue || a.date || "").localeCompare(b.dateValue || b.date || ""));

  window.dispatchEvent(
    new CustomEvent("colab:calendar-data", {
      detail: { events },
    }),
  );
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

  renderEvents();
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
  const resources = project.resources || [];
  const thumbnail = project.thumbnailUrl
    ? `<img class="admin-project-thumb" src="${escapeHtml(project.thumbnailUrl)}" alt="" loading="lazy" />`
    : `<div class="admin-project-thumb placeholder">${escapeHtml(project.source === "community" ? "Community" : "Project")}</div>`;

  return `
    <article class="admin-project-card">
      ${thumbnail}
      <div class="admin-project-body">
        <div>
          <span class="event-meta">${escapeHtml(project.displayDate || "No date")} · ${escapeHtml(project.owner || "No owner")}</span>
          <h3>${escapeHtml(project.title)}</h3>
          ${
            project.description
              ? `<p>${escapeHtml(project.description).slice(0, 220)}${project.description.length > 220 ? "..." : ""}</p>`
              : ""
          }
          <div class="admin-project-meta">
            ${tags.map((tag) => `<span class="tag ${toneClass(tag)}">${escapeHtml(tag)}</span>`).join("")}
            ${resources.length ? `<span class="tag tone-slate">${resources.length} resource${resources.length === 1 ? "" : "s"}</span>` : ""}
          </div>
        </div>
        <a class="secondary-action link-action admin-project-action" href="${escapeHtml(project.detailUrl)}">
          Open details
        </a>
      </div>
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
              ? `<p class="vote-response-line">You voted ${statusPillMarkup(memberResponse, "vote-response-pill")}</p>`
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

function renderOrders() {
  if (isRetailOnlyMember()) {
    if (orderList) orderList.innerHTML = "";
    if (orderCount) orderCount.textContent = "Hidden";
    return;
  }

  if (orderCount) {
    orderCount.textContent = `${state.orders.length} open`;
  }

  if (!state.orders.length) {
    orderList.innerHTML = `<p class="form-note">No unfulfilled Shopify orders need CoLab support right now.</p>`;
    return;
  }

  orderList.innerHTML = state.orders
    .map(
      (order) => `
        <article class="order-item">
          <div>
            <strong>${escapeHtml(order.title || "Shopify order")}</strong>
            <small>${escapeHtml(order.orderDate)}</small>
            ${statusPillMarkup(order.fulfillmentStatus || "Unfulfilled", "order-status-pill")}
            <p>${escapeHtml(order.details || "No order details listed.")}</p>
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

async function loadOrders() {
  const member = selectedMember();

  if (!member?.memberId || isRetailOnlyMember(member)) {
    state.orders = [];
    state.orderSource = "loading";
    renderOrders();
    return;
  }

  orderList.innerHTML = `<p class="form-note">Loading open Shopify orders...</p>`;
  if (orderCount) orderCount.textContent = "Loading";

  try {
    const response = await fetch(`/api/orders?memberId=${encodeURIComponent(member.memberId)}`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Unable to load Shopify orders.");

    state.orders = payload.orders || [];
    state.orderSource = payload.source || "monday";
  } catch (error) {
    state.orders = [];
    state.orderSource = "error";
    orderList.innerHTML = `<p class="form-note">${escapeHtml(error.message)}</p>`;
    if (orderCount) orderCount.textContent = "Error";
    return;
  }

  renderOrders();
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
    renderEvents();
    shiftSourceNote.textContent = `Confirmed: ${payload.coveredBy || memberNameWithLastInitial(member)} is covering ${signedUpShift?.date || "this shift"}.`;
    return;
  } catch (error) {
    renderShifts();
    renderEvents();
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
  renderEvents();
  loadActivity();
  loadVotes();
  loadPayments();
  loadOrders();
  loadProjectEvents();
});

document.addEventListener("click", (event) => {
  handleShiftClick(event);
  handleVoteClick(event);
  if (event.target.closest("[data-open-shift-modal]")) {
    if (!shiftModal.open) shiftModal.showModal();
  }
});

shiftWindow.addEventListener("change", () => {
  renderShifts();
});

[projectSourceFilter, projectStatusFilter, projectSearch].forEach((control) => {
  control?.addEventListener("input", renderAdminProjects);
  control?.addEventListener("change", renderAdminProjects);
});

window.addEventListener("colab:calendar-ready", () => {
  renderEvents();
});

document.querySelectorAll("[data-section-link]").forEach((link) => {
  link.addEventListener("click", () => {
    document
      .querySelectorAll("[data-section-link]")
      .forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
  });
});

loginForm?.addEventListener("submit", requestLoginLink);

async function init() {
  await loadSession();
  if (!state.session.authenticated) {
    renderMemberSelect();
    setShiftVisibility(false);
    setOrderVisibility(false);
    renderEvents();
    return;
  }

  await loadMembers();
  await Promise.all([
    loadShifts(),
    loadAdminProjects(),
    loadActivity(),
    loadVotes(),
    loadPayments(),
    loadOrders(),
    loadProjectEvents(),
  ]);
}

init();
renderEvents();
