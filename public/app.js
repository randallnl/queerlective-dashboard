const shifts = [
  {
    id: "shift-01",
    title: "Open studio host",
    date: "Wed Jul 3",
    time: "5:30 PM - 8:30 PM",
    spots: 1,
    tags: ["front desk", "closing"],
  },
  {
    id: "shift-02",
    title: "Tool orientation assistant",
    date: "Sat Jul 6",
    time: "10:00 AM - 1:00 PM",
    spots: 2,
    tags: ["workshop", "member support"],
  },
  {
    id: "shift-03",
    title: "Supply reset",
    date: "Tue Jul 9",
    time: "6:00 PM - 7:30 PM",
    spots: 3,
    tags: ["organizing", "quick shift"],
  },
];

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

const signedUpShifts = new Set(["shift-01"]);
const memberVotes = new Set();

const shiftList = document.querySelector("#shift-list");
const modalShiftList = document.querySelector("#modal-shift-list");
const eventList = document.querySelector("#event-list");
const announcementList = document.querySelector("#announcement-list");
const paymentList = document.querySelector("#payment-list");
const voteCount = document.querySelector("#vote-count");
const nextShift = document.querySelector("#next-shift");
const calendarFilter = document.querySelector("#calendar-filter");
const shiftModal = document.querySelector("#shift-modal");

function tagMarkup(tags) {
  return tags.map((tag) => `<span class="tag">${tag}</span>`).join("");
}

function renderShifts() {
  const markup = shifts
    .map((shift) => {
      const isSignedUp = signedUpShifts.has(shift.id);
      return `
        <article class="shift-item">
          <div>
            <p class="shift-title">${shift.title}</p>
            <span class="shift-meta">${shift.date} · ${shift.time} · ${shift.spots} open spot${shift.spots === 1 ? "" : "s"}</span>
            <div class="tag-row">${tagMarkup(shift.tags)}</div>
          </div>
          <button class="shift-button" type="button" data-shift-id="${shift.id}">
            ${isSignedUp ? "Signed up" : "Sign up"}
          </button>
        </article>
      `;
    })
    .join("");

  shiftList.innerHTML = markup;
  modalShiftList.innerHTML = markup;

  const firstShift = shifts.find((shift) => signedUpShifts.has(shift.id));
  nextShift.textContent = firstShift ? `${firstShift.date}` : "No shift yet";
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
      const selected = memberVotes.has(announcement.id);
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

function handleShiftClick(event) {
  const button = event.target.closest("[data-shift-id]");
  if (!button) return;

  const shiftId = button.dataset.shiftId;
  if (signedUpShifts.has(shiftId)) {
    signedUpShifts.delete(shiftId);
  } else {
    signedUpShifts.add(shiftId);
  }

  renderShifts();
}

function handleVoteClick(event) {
  const button = event.target.closest("[data-vote-id]");
  if (!button) return;

  const voteId = button.dataset.voteId;
  if (memberVotes.has(voteId)) {
    memberVotes.delete(voteId);
  } else {
    memberVotes.add(voteId);
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

renderShifts();
renderEvents();
renderAnnouncements();
renderPayments();
