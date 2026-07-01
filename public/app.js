const state = {
  shifts: [],
  signedUpShifts: new Set(),
  memberVotes: new Set(),
  shiftSource: "loading",
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

function tagMarkup(tags, extra = "") {
  return tags.map((tag) => `<span class="tag ${extra}">${tag}</span>`).join("");
}

function shiftButtonLabel(shift, isSignedUp) {
  if (isSignedUp) return "Signed up";
  if (shift.isCovered) return "Covered";
  return "Sign up";
}

function shiftMarkup(shift) {
  const isSignedUp = state.signedUpShifts.has(shift.id);
  const disabled = shift.isCovered && !isSignedUp;
  const statusTag = shift.isCovered
    ? `<span class="tag covered">${shift.coverageStatus || "Covered"}</span>`
    : `<span class="tag">${shift.coverageStatus || "Open"}</span>`;

  return `
    <article class="shift-item">
      <div>
        <p class="shift-title">${shift.title}</p>
        <span class="shift-meta">${shift.date} · ${shift.time} · ${shift.month}</span>
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
  nextShift.textContent = firstShift ? firstShift.date : "No shift yet";

  if (shiftSourceNote) {
    shiftSourceNote.textContent =
      state.shiftSource === "monday"
        ? "Loaded from the CoLab Calendar monday board."
        : "Using preview data until monday is available.";
  }
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
  const memberId = memberIdInput.value.trim();
  if (!memberId) {
    memberIdInput.focus();
    shiftSourceNote.textContent = "Enter your CoLab member ID before choosing a shift.";
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

loadShifts();
renderEvents();
renderAnnouncements();
renderPayments();
