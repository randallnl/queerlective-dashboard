const state = {
  members: [],
  selectedMemberId: localStorage.getItem("colabSelectedMemberId") || "",
  shifts: [],
  activities: [],
  activitySummary: {
    total: 0,
    thisMonth: 0,
    latestDate: "No activity yet",
    byType: [],
  },
  signedUpShifts: new Set(),
  memberVotes: new Set(),
  shiftSource: "loading",
  memberSource: "loading",
  activitySource: "loading",
};

const events = [
  {
    title: "Print night",
    date: "Jul 3",
    time: "6:00 PM",
    type: "member",
    meta: "Member-led studio session in the main room.",
  },
  {
    title: "Intro to risograph",
    date: "Jul 6",
    time: "11:00 AM",
    type: "workshop",
    meta: "Limited seats. Tool orientation required afterward.",
  },
  {
    title: "Tool wall reset",
    date: "Jul 8",
    time: "9:00 AM",
    type: "maintenance",
    meta: "Back bench access will be limited until noon.",
  },
  {
    title: "Mutual aid poster build",
    date: "Jul 11",
    time: "5:00 PM",
    type: "member",
    meta: "Shared project table reserved for organizers.",
  },
];

const announcements = [
  {
    id: "vote-01",
    title: "Extend Sunday studio hours for the summer",
    closes: "Closes Jul 5",
    support: 68,
    votes: 34,
  },
  {
    id: "vote-02",
    title: "Add a monthly member skill-share night",
    closes: "Closes Jul 12",
    support: 82,
    votes: 29,
  },
];

const payments = [
  { date: "Jun 15, 2026", label: "Monthly dues", amount: "$45.00", status: "Paid" },
  { date: "May 15, 2026", label: "Monthly dues", amount: "$45.00", status: "Paid" },
  { date: "Apr 15, 2026", label: "Monthly dues", amount: "$45.00", status: "Paid" },
];

const shiftList = document.querySelector("#shift-list");
const modalShiftList = document.querySelector("#modal-shift-list");
const eventList = document.querySelector("#event-list");
const announcementList = document.querySelector("#announcement-list");
const paymentList = document.querySelector("#payment-list");
const voteCount = document.querySelector("#vote-count");
const nextShift = document.querySelector("#next-shift");
const calendarFilter = document.querySelector("#calendar-filter");
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

function initialsFor(name) {
  return (name || "CoLab")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function tagMarkup(tags, extra = "") {
  return tags
    .map((tag) => `<span class="tag ${extra}">${escapeHtml(tag)}</span>`)
    .join("");
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
        ${disabled ? "disabled" : ""}
      >
        ${shiftButtonLabel(shift, isSignedUp)}
      </button>
    </article>
  `;
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
}

function renderMemberSelect() {
  if (!state.members.length) {
    memberSelect.innerHTML = `<option value="">No members found</option>`;
    memberSelect.disabled = true;
    renderMemberView();
    return;
  }

  memberSelect.disabled = false;
  memberSelect.innerHTML = state.members
    .map((member) => {
      const displayName = member.preferredName || member.name;
      return `<option value="${escapeHtml(member.memberId)}">${escapeHtml(displayName)}</option>`;
    })
    .join("");

  if (!state.selectedMemberId || !state.members.some((member) => member.memberId === state.selectedMemberId)) {
    state.selectedMemberId = state.members[0].memberId;
  }

  memberSelect.value = state.selectedMemberId;
  localStorage.setItem("colabSelectedMemberId", state.selectedMemberId);
  renderMemberView();
  if (state.shifts.length) renderShifts();
}

function renderShifts() {
  if (!state.shifts.length) {
    shiftList.innerHTML = `<p class="form-note">No open CoLab shifts are available right now.</p>`;
    modalShiftList.innerHTML = shiftList.innerHTML;
    nextShift.textContent = "No shift yet";
    return;
  }

  const markup = state.shifts.map(shiftMarkup).join("");
  shiftList.innerHTML = markup;
  modalShiftList.innerHTML = markup;

  const firstShift = state.shifts.find((shift) => state.signedUpShifts.has(shift.id));
  const member = selectedMember();
  const memberShift = state.shifts.find(
    (shift) => member?.memberId && shift.memberId === member.memberId,
  );
  nextShift.textContent = memberShift?.date || firstShift?.date || "No shift yet";

  if (shiftSourceNote) {
    shiftSourceNote.textContent =
      state.shiftSource === "monday"
        ? "Loaded from the CoLab Calendar monday board."
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
  const visibleEvents = events.filter((event) => filter === "all" || event.type === filter);
  eventList.innerHTML = visibleEvents
    .map((event) => {
      const [month, day] = event.date.split(" ");
      return `
        <article class="event-item">
          <div class="date-badge"><span>${day}</span><small>${month}</small></div>
          <div>
            <p class="event-title">${event.title}</p>
            <span class="event-meta">${event.time} · ${event.meta}</span>
            <div class="tag-row"><span class="tag">${event.type}</span></div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderAnnouncements() {
  voteCount.textContent = announcements.length;
  announcementList.innerHTML = announcements
    .map((announcement) => {
      const selected = state.memberVotes.has(announcement.id);
      return `
        <article class="announcement-item">
          <div class="vote-row">
            <div>
              <p class="announcement-title">${announcement.title}</p>
              <span class="event-meta">${announcement.closes} · ${announcement.votes} member votes</span>
            </div>
            <button class="vote-button" type="button" data-vote-id="${announcement.id}" aria-pressed="${selected}">
              ${selected ? "Voted yes" : "Vote yes"}
            </button>
          </div>
          <div class="progress" aria-label="${announcement.support}% support">
            <span style="width: ${announcement.support}%"></span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderPayments() {
  paymentList.innerHTML = payments
    .map(
      (payment) => `
        <article class="payment-item">
          <div>
            <strong>${payment.label}</strong>
            <small>${payment.date}</small>
          </div>
          <div>
            <strong>${payment.amount}</strong>
            <small>${payment.status}</small>
          </div>
        </article>
      `,
    )
    .join("");
}

async function signUpForShift(shiftId, button) {
  const member = selectedMember();
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
      body: JSON.stringify({ shiftId, memberId }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Shift signup failed.");

    state.signedUpShifts.add(shiftId);
    state.shifts = state.shifts.map((shift) =>
      shift.id === shiftId
        ? {
            ...shift,
            memberId,
            coverageStatus: "Covered",
            isCovered: true,
          }
        : shift,
    );
    shiftSourceNote.textContent = "Shift signup saved.";
  } catch (error) {
    shiftSourceNote.textContent = error.message;
  }

  renderShifts();
}

function handleShiftClick(event) {
  const button = event.target.closest("[data-shift-id]");
  if (!button) return;
  signUpForShift(button.dataset.shiftId, button);
}

function handleVoteClick(event) {
  const button = event.target.closest("[data-vote-id]");
  if (!button) return;

  const voteId = button.dataset.voteId;
  if (state.memberVotes.has(voteId)) {
    state.memberVotes.delete(voteId);
  } else {
    state.memberVotes.add(voteId);
  }

  renderAnnouncements();
}

document.querySelectorAll("[data-open-shift-modal]").forEach((button) => {
  button.addEventListener("click", () => shiftModal.showModal());
});

memberSelect.addEventListener("change", (event) => {
  state.selectedMemberId = event.target.value;
  localStorage.setItem("colabSelectedMemberId", state.selectedMemberId);
  renderMemberView();
  renderShifts();
  loadActivity();
});

document.addEventListener("click", (event) => {
  handleShiftClick(event);
  handleVoteClick(event);
});

calendarFilter.addEventListener("change", (event) => {
  renderEvents(event.target.value);
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
  await loadMembers();
  await loadActivity();
  loadShifts();
}

init();
renderEvents();
renderAnnouncements();
renderPayments();
