const state = {
  members: [],
  selectedMemberId: localStorage.getItem("colabSelectedMemberId") || "",
  shifts: [],
  activities: [],
  votes: [],
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

function memberNameWithLastInitial(member) {
  const name = member?.preferredName || member?.name || "Member";
  const parts = name.split(/\s+/).filter(Boolean);
  const firstName = parts[0] || "Member";
  const lastInitial = parts.length > 1 ? `${parts.at(-1)[0].toUpperCase()}.` : "";
  return `${firstName}${lastInitial ? ` ${lastInitial}` : ""}`;
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

function isWithinNextSixWeeks(dateValue) {
  if (!dateValue) return true;
  return dateValue <= sixWeeksFromToday();
}

function openShiftsNextSixWeeks() {
  return state.shifts.filter(
    (shift) => !shift.isCovered && isWithinNextSixWeeks(shift.dateValue),
  );
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
  if (state.votes.length) renderVotes();
}

function renderShifts() {
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
    shiftSourceNote.textContent =
      state.shiftSource === "monday"
        ? "Showing open CoLab Calendar shifts for the next 6 weeks."
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
    const member = state.members.find((item) => item.memberId === shift.memberId);
    const isSelectedMember =
      selectedMember()?.memberId && shift.memberId === selectedMember().memberId;
    const coveredBy =
      shift.coveredBy || (member ? memberNameWithLastInitial(member) : shift.memberId || "Member");

    return {
      title: isSelectedMember ? "Your CoLab shift" : "Filled CoLab shift",
      date: shift.date,
      dateValue: shift.dateValue,
      time: shift.time,
      type: "shift",
      meta: `${coveredBy} is covering ${shift.title}.`,
    };
  });
  const visibleEvents = [...events, ...filledShiftEvents].filter(
    (event) => filter === "all" || event.type === filter,
  ).sort((a, b) => (a.dateValue || a.date || "").localeCompare(b.dateValue || b.date || ""));
  eventList.innerHTML = visibleEvents
    .map((event) => {
      const { month, day } = calendarDateParts(event);
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

async function signUpForShift(shiftId, shiftBoardId, button) {
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
  state.selectedMemberId = event.target.value;
  localStorage.setItem("colabSelectedMemberId", state.selectedMemberId);
  renderMemberView();
  renderShifts();
  renderEvents(calendarFilter.value);
  loadActivity();
  loadVotes();
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
  await loadVotes();
  loadShifts();
}

init();
renderEvents();
renderPayments();
