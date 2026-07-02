const MONDAY_API_URL = "https://api.monday.com/v2";

const BOARDS = {
  colabCalendar: 8374554428,
  colabMembers: 8402413272,
  activityFeedback: 18408298018,
  voteLog: 18411164142,
  shopifyTransactions: 18410480642,
  projectEvents: 8390893779,
  communityEventSubmissions: 8052311890,
};

const VOTE_TYPES = [
  "Super Majority Vote",
  "Consent Vote",
  "Simple Majority Vote",
];

const VOTE_RESPONSES = {
  approve: "Approve",
  dontApprove: "Don't Approve(With Comment)",
};

const COLUMNS = {
  shifts: {
    date: "date0",
    memberId: "text_mm35f0vb",
    person: "text_mm4vxh9t",
    coverageStatus: "color_mkw122gj",
  },
  members: {
    preferredName: "text_mm35brvq",
    membershipType: "color_mkw1xfh2",
    email: "email_mkmvg87g",
    phone: "phone_mknqvkap",
    businessName: "text_mkmv5bft",
    website: "text_mkmv5n45",
    socialMedia: "text_mkmvj6ks",
    creativeGroundLink: "text_mkq03vne",
    artistDescription: "long_text_mkmv2eh9",
    artistPhotoLogo: "files_mkmv5d0k",
    artistProfileBanner: "file_mkqx9xa3",
    signUpDate: "date_1_mkmvqa90",
    memberId: "pulse_id_mm34sv67",
    otherEmails: "text_mm358g6e",
  },
  activity: {
    activityType: "single_selectis1ajb9",
    submitDate: "date_mm2mqnq2",
    description: "long_text3mhw34i5",
    person: "text_mm34jrzj",
  },
  votes: {
    response: "color_mm4vbrwr",
    comment: "long_texta8lzlxn7",
    motion: "text_mm4vp4ny",
    memberId: "text_mm4vff42",
    voteId: "text_mm4ve8bt",
  },
  transactions: {
    amount: "numeric_mm2fgrdz",
    details: "text_mm2fb4c7",
    email: "text_mm2f5770",
    fulfillmentStatus: "color_mm4wf14k",
    orderDate: "pulse_log_mm4jc9jv",
  },
  projectEvents: {
    owner: "person",
    strategicGoal: "dropdown_mm0smk1",
    category: "color_mm0srja3",
    priority: "color_mm0sh4fe",
    startDate: "date_mkns6cak",
    endDate: "date_mm171v9p",
    status: "status",
    location: "dropdown_mknqezw8",
    posters: "file_mknscbex",
    filesLink: "file_mkpbye8s",
    registration: "link_mkppdhq5",
    postEventSurvey: "link_mkpp7m53",
    description: "text_mm2vbpn3",
    googleCalendarEvent: "integration_mm17v8nx",
    spaceReservation: "color_mm2vwpkb",
  },
  communityEvents: {
    links: "link_mm345aqv",
    poster: "upload_file_Mjj7BNI5",
    organizer: "short_text_Mjj7ibQU",
    organizerEmail: "email_mkp6jep",
    additionalOrganizers: "short_text_Mjj7sypL",
    description: "long_text_Mjj74ax2",
    toolEquipmentRequests: "long_text_Mjj7yY69",
    materialsRequest: "number_Mjj7dbxa",
    supportFundsUse: "long_text_mkmt1fs8",
    requestedDate: "date_Mjj7b71V",
    canvaLink: "link_mkn89n3g",
    additionalInfo: "long_text_1_Mjj7QGiT",
    processStatus: "status_mkmxzk3x",
    submissionId: "pulse_id_mm2twrhw",
    submittedAt: "pulse_log_mm4wyjyr",
    spaceRequested: "multi_selectgtgkuzvw",
  },
};

const MEMBER_VISIBLE_LOCATIONS = /board room|colab|community room|gym/i;
const APPROVED_STATUS = /approved/i;
const COLAB_SPACE_REQUEST = /queerlective'?s colab space/i;

const MOCK_SHIFTS = [
  {
    id: "mock-shift-01",
    parentId: "mock-july",
    month: "July 2026",
    title: "Weekday studio coverage",
    date: "Wed Jul 8",
    dateValue: "2026-07-08",
    time: "6:00 PM - 8:00 PM",
    memberId: "",
    person: "",
    coverageStatus: "Open",
    isCovered: false,
    tags: ["weekday", "studio coverage"],
  },
  {
    id: "mock-shift-02",
    parentId: "mock-july",
    month: "July 2026",
    title: "Sunday studio coverage",
    date: "Sun Jul 12",
    dateValue: "2026-07-12",
    time: "2:00 PM - 4:00 PM",
    memberId: "",
    person: "",
    coverageStatus: "Open",
    isCovered: false,
    tags: ["sunday", "studio coverage"],
  },
];

const MOCK_MEMBERS = [
  {
    itemId: "mock-member-01",
    name: "Ari Rivera",
    preferredName: "Ari",
    membershipType: "Studio Member",
    email: "ari@example.com",
    phone: "",
    memberId: "mock-member-01",
    signUpDate: "2024-01-15",
    businessName: "",
    website: "",
    socialMedia: "",
    creativeGroundLink: "",
    artistDescription: "",
    otherEmails: "",
  },
];

const MOCK_ACTIVITY = [
  {
    id: "mock-activity-01",
    title: "Hosted open studio",
    activityType: "Shift",
    submitDate: "2026-07-01",
    description: "Covered an evening studio host shift.",
    person: "Ari R. | Member ID: mock-member-01",
  },
];

const MOCK_VOTES = [
  {
    id: "mock-vote-01",
    question: "Extend Sunday studio hours for the summer",
    details: "Preview vote loaded while monday is unavailable.",
    voteType: "Consent Vote",
    submitDate: "2026-07-01",
    displayDate: "Jul 1, 2026",
    closesAt: "2026-08-18",
    closesLabel: "Auto-approves Aug 18, 2026",
    status: "Open",
    responseCounts: { Approve: 2, "Don't Approve(With Comment)": 0 },
    responseTotal: 2,
    memberResponse: "",
    memberComment: "",
    requiresComment: true,
  },
];

const MOCK_PAYMENTS = [
  {
    id: "mock-payment-01",
    date: "Jun 15, 2026",
    dateValue: "2026-06-15",
    details: "CoLab Membership Subscription",
    amount: "$45.00",
    email: "ari@example.com",
  },
];

const MOCK_SHOPIFY_ORDERS = [
  {
    id: "mock-order-01",
    title: "Community print pack",
    details: "Pickup order with assorted zines and prints.",
    fulfillmentStatus: "Unfulfilled",
    orderDate: "Jul 1, 2026",
    orderDateValue: "2026-07-01",
  },
];

const MOCK_PROJECT_EVENTS = [
  {
    id: "mock-project-event-01",
    title: "CoLab community open studio",
    date: "Jul 17",
    dateValue: "2026-07-17",
    endDateValue: "2026-07-17",
    time: "Project/Event",
    type: "project",
    location: "CoLab",
    meta: "CoLab event in CoLab.",
    adminOnly: false,
  },
];

const MOCK_COMMUNITY_EVENTS = [
  {
    id: "mock-community-event-01",
    title: "Community zine swap proposal",
    date: "Jul 24",
    dateValue: "2026-07-24",
    endDateValue: "2026-07-24",
    time: "Community proposal",
    type: "community",
    organizer: "Ari Rivera",
    organizerEmail: "ari@example.com",
    organizerMemberId: "mock-member-01",
    processStatus: "Pending",
    consentStatus: "Pending consent",
    meta: "Pending consent · Organized by Ari Rivera.",
    details: "Preview community-led event proposal.",
  },
];

function json(data, init = {}) {
  return Response.json(data, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...init.headers,
    },
  });
}

function getColumnText(columnValues, columnId) {
  return columnValues.find((column) => column.id === columnId)?.text?.trim() || "";
}

function getColumnValue(columnValues, columnId) {
  const value = columnValues.find((column) => column.id === columnId)?.value;
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function columnTextOrValue(columnValues, columnId) {
  const text = getColumnText(columnValues, columnId);
  const value = getColumnValue(columnValues, columnId);

  if (text) return text;
  if (value?.url) return value.url;
  if (value?.linkedPulseIds) return value.linkedPulseIds.join(", ");
  if (Array.isArray(value?.files)) {
    return value.files
      .map((file) => file.name || file.assetId || file.id)
      .filter(Boolean)
      .join(", ");
  }

  return "";
}

function urlsFromText(value) {
  return Array.from(String(value || "").matchAll(/https?:\/\/[^\s,)"]+/g)).map(
    (match) => match[0],
  );
}

function isImageUrl(url) {
  return /\.(apng|avif|gif|jpe?g|png|svg|webp)(\?|#|$)/i.test(url || "");
}

function columnResources(columnValues, columnId, label) {
  const text = getColumnText(columnValues, columnId);
  const value = getColumnValue(columnValues, columnId);
  const resources = [];

  if (value?.url) {
    resources.push({
      label: value.text || text || label,
      url: value.url,
      type: isImageUrl(value.url) ? "image" : "link",
    });
  }

  if (Array.isArray(value?.files)) {
    value.files.forEach((file) => {
      const url = file.url || file.public_url || file.linkToFile || "";
      resources.push({
        label: file.name || label,
        url,
        type: isImageUrl(url) ? "image" : "file",
      });
    });
  }

  urlsFromText(text).forEach((url) => {
    if (!resources.some((resource) => resource.url === url)) {
      resources.push({
        label,
        url,
        type: isImageUrl(url) ? "image" : "link",
      });
    }
  });

  if (!resources.length && text) {
    resources.push({
      label: text,
      url: "",
      type: "file",
    });
  }

  return resources;
}

function firstImageResource(resources = []) {
  return resources.find((resource) => resource.url && resource.type === "image") || null;
}

function isUpcomingRecord(record) {
  if (!record.dateValue) return true;

  const today = new Date();
  const todayValue = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  )
    .toISOString()
    .slice(0, 10);

  return record.dateValue >= todayValue;
}

function normalizeUpdates(updates = []) {
  return updates.map((update) => ({
    id: update.id,
    body: String(update.body || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
    createdAt: update.created_at || "",
    creator: update.creator?.name || "",
  }));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatShiftDate(dateValue, fallback) {
  if (!dateValue) return fallback;

  const date = new Date(`${dateValue}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function weekdayIndex(dateValue) {
  if (!dateValue) return null;

  const date = new Date(`${dateValue}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;

  return date.getUTCDay();
}

function formatActivityDate(dateValue) {
  if (!dateValue) return "No date";

  const date = new Date(`${dateValue}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return dateValue;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatMoney(value) {
  const amount = Number.parseFloat(String(value || "").replace(/[^0-9.-]/g, ""));
  if (Number.isNaN(amount)) return value || "$0.00";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function memberEmails(member) {
  return [member.email, ...(member.otherEmails || "").split(/[,;\s]+/)]
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminMember(member) {
  return /admin/i.test(member?.membershipType || "");
}

function isRetailOnlyMember(member) {
  return /retail only member/i.test(member?.membershipType || "");
}

function accessEmail(request) {
  return (
    request.headers.get("cf-access-authenticated-user-email") ||
    request.headers.get("Cf-Access-Authenticated-User-Email") ||
    ""
  )
    .trim()
    .toLowerCase();
}

function findMemberByEmail(members, email) {
  if (!email) return null;
  return members.find((member) => memberEmails(member).includes(email)) || null;
}

function addDays(dateValue, days) {
  if (!dateValue) return "";

  const date = new Date(`${dateValue}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "";

  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function isWithinPastDays(dateValue, days) {
  if (!dateValue) return false;

  const date = new Date(`${dateValue}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  const todayValue = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  const startValue = new Date(todayValue);
  startValue.setUTCDate(startValue.getUTCDate() - days);

  return date >= startValue && date <= todayValue;
}

function requestsColabSpace(submission) {
  return COLAB_SPACE_REQUEST.test(submission?.spaceRequested || "");
}

function dateFromCreationLog(columnValues, columnId, fallback = "") {
  const columnValue = getColumnValue(columnValues, columnId);
  const text = getColumnText(columnValues, columnId);
  const rawDate =
    columnValue?.created_at ||
    columnValue?.date ||
    columnValue?.time ||
    columnValue?.value ||
    text;
  const match = String(rawDate || "").match(/\d{4}-\d{2}-\d{2}/);

  return match?.[0] || fallback;
}

function memberEmailRequiredError() {
  const error = new Error("Your login email is not connected to a CoLab member profile.");
  error.status = 403;
  return error;
}

function accessDeniedHtml(email) {
  return new Response(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CoLab Access Required</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #fbfaf7;
        color: #17211f;
        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main {
        width: min(92vw, 560px);
        border: 1px solid #d9e0dc;
        border-radius: 8px;
        background: #fff;
        padding: 28px;
        box-shadow: 0 18px 50px rgba(23, 33, 31, 0.1);
      }
      p {
        color: #60706b;
        line-height: 1.6;
      }
      a {
        color: #0c4f4b;
        font-weight: 800;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>CoLab member access required</h1>
      <p>${escapeHtml(email || "This login")} is not connected to a CoLab member profile. Use the email listed on your CoLab membership or ask an admin to add this email to the members board.</p>
      <p><a href="/cdn-cgi/access/logout">Log out and try another email</a></p>
    </main>
  </body>
</html>`,
    {
      status: 403,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    },
  );
}

async function requireMatchedAccessMember(request, env) {
  const session = await accessSession(request, env);

  if (session.authenticated && !session.member?.memberId) {
    throw memberEmailRequiredError();
  }

  return session;
}

async function accessSession(request, env) {
  const email = accessEmail(request);

  if (!email) {
    return {
      authenticated: false,
      email: "",
      member: null,
      isAdmin: true,
      canViewAs: true,
    };
  }

  const members = await listMembers(env);
  const member = findMemberByEmail(members, email);
  const isAdmin = isAdminMember(member);

  return {
    authenticated: true,
    email,
    member,
    isAdmin,
    canViewAs: isAdmin,
  };
}

async function authorizeMemberRequest(request, env, requestedMemberId) {
  const session = await accessSession(request, env);
  const cleanRequestedMemberId = String(requestedMemberId || "").trim();

  if (!session.authenticated) {
    return {
      ...session,
      memberId: cleanRequestedMemberId,
    };
  }

  if (!session.member?.memberId) {
    throw memberEmailRequiredError();
  }

  if (session.isAdmin) {
    return {
      ...session,
      memberId: cleanRequestedMemberId || session.member.memberId,
    };
  }

  if (cleanRequestedMemberId && cleanRequestedMemberId !== session.member.memberId) {
    const error = new Error("You can only view your own member dashboard.");
    error.status = 403;
    throw error;
  }

  return {
    ...session,
    memberId: session.member.memberId,
  };
}

async function requireAdminSession(request, env) {
  const session = await requireMatchedAccessMember(request, env);

  if (!session.isAdmin) {
    const error = new Error("Admin access is required.");
    error.status = 403;
    throw error;
  }

  return session;
}

function memberIdFromPerson(personText) {
  const match = personText.match(/Member ID:\s*([^|\s]+)/i);
  return match?.[1]?.trim() || "";
}

function memberDisplayForVote(member) {
  const name = member?.preferredName || member?.name || "Member";
  const parts = name.split(/\s+/).filter(Boolean);
  const firstName = parts[0] || "Member";
  const lastInitial = parts.length > 1 ? `${parts.at(-1)[0].toUpperCase()}.` : "";
  return `${firstName}${lastInitial ? ` ${lastInitial}` : ""} | Member ID: ${member.memberId}`;
}

function memberNameWithLastInitial(member) {
  const name = member?.preferredName || member?.name || "Member";
  const parts = name.split(/\s+/).filter(Boolean);
  const firstName = parts[0] || "Member";
  const lastInitial = parts.length > 1 ? `${parts.at(-1)[0].toUpperCase()}.` : "";
  return `${firstName}${lastInitial ? ` ${lastInitial}` : ""}`;
}

function memberDisplayForShift(member, memberId) {
  return `${memberNameWithLastInitial(member)} | ${member?.memberId || memberId}`;
}

function shiftCoveredBy(person) {
  if (person) {
    return person.split("|")[0].trim();
  }

  return "";
}

async function mondayToken(env) {
  const binding = env.MONDAY_API_TOKEN;

  if (typeof binding === "string") {
    return binding;
  }

  if (binding && typeof binding.get === "function") {
    return binding.get();
  }

  return "";
}

async function mondayGraphQL(env, query, variables, options = {}) {
  const token = await mondayToken(env);

  if (!token) {
    throw new Error("Missing MONDAY_API_TOKEN");
  }

  const headers = {
    Authorization: token,
    "Content-Type": "application/json",
  };

  if (options.idempotencyKey) {
    headers["Idempotency-Key"] = options.idempotencyKey;
  }

  const response = await fetch(MONDAY_API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const payload = await response.json();
  if (!response.ok || payload.errors) {
    const message = payload.errors?.[0]?.message || `monday API ${response.status}`;
    throw new Error(message);
  }

  return payload.data;
}

function normalizeShift(parentItem, subitem) {
  const memberId = getColumnText(subitem.column_values, COLUMNS.shifts.memberId);
  const person = getColumnText(subitem.column_values, COLUMNS.shifts.person);
  const coverageStatus = getColumnText(
    subitem.column_values,
    COLUMNS.shifts.coverageStatus,
  );
  const name = subitem.name || "CoLab shift";
  const dateColumn = getColumnValue(subitem.column_values, COLUMNS.shifts.date);
  const dateValue = dateColumn?.date || getColumnText(subitem.column_values, COLUMNS.shifts.date);
  const day = weekdayIndex(dateValue);
  const isSunday = day === 0 || (!dateValue && /\bsun(day)?\b/i.test(name));
  const dayTag = day === 6 ? "saturday" : isSunday ? "sunday" : "weekday";

  return {
    id: subitem.id,
    boardId: subitem.board?.id || "",
    parentId: parentItem.id,
    month: parentItem.name,
    title: name,
    date: formatShiftDate(dateValue, name),
    dateValue,
    time: isSunday ? "2:00 PM - 4:00 PM" : "6:00 PM - 8:00 PM",
    memberId,
    person,
    coveredBy: shiftCoveredBy(person),
    coverageStatus: coverageStatus || "Open",
    isCovered: Boolean(memberId || person) || /covered|filled|confirmed/i.test(coverageStatus),
    tags: [dayTag, "studio coverage"],
  };
}

function normalizeMember(item) {
  return {
    itemId: item.id,
    name: item.name,
    preferredName: getColumnText(item.column_values, COLUMNS.members.preferredName) || item.name,
    membershipType: getColumnText(item.column_values, COLUMNS.members.membershipType),
    email: getColumnText(item.column_values, COLUMNS.members.email),
    phone: getColumnText(item.column_values, COLUMNS.members.phone),
    memberId: getColumnText(item.column_values, COLUMNS.members.memberId) || item.id,
    signUpDate: getColumnText(item.column_values, COLUMNS.members.signUpDate),
    businessName: getColumnText(item.column_values, COLUMNS.members.businessName),
    website: getColumnText(item.column_values, COLUMNS.members.website),
    socialMedia: getColumnText(item.column_values, COLUMNS.members.socialMedia),
    creativeGroundLink: getColumnText(
      item.column_values,
      COLUMNS.members.creativeGroundLink,
    ),
    artistDescription: getColumnText(
      item.column_values,
      COLUMNS.members.artistDescription,
    ),
    otherEmails: getColumnText(item.column_values, COLUMNS.members.otherEmails),
  };
}

function normalizeActivity(item) {
  const submitDateColumn = getColumnValue(
    item.column_values,
    COLUMNS.activity.submitDate,
  );
  const submitDate =
    submitDateColumn?.date || getColumnText(item.column_values, COLUMNS.activity.submitDate);
  const person = getColumnText(item.column_values, COLUMNS.activity.person);

  return {
    id: item.id,
    title: item.name,
    activityType:
      getColumnText(item.column_values, COLUMNS.activity.activityType) || "Activity",
    submitDate,
    displayDate: formatActivityDate(submitDate),
    description: getColumnText(item.column_values, COLUMNS.activity.description),
    person,
    personMemberId: memberIdFromPerson(person),
  };
}

function normalizeVoteMotion(item) {
  const normalized = normalizeActivity(item);
  const voteType = normalized.activityType;
  const submitDate = normalized.submitDate;
  const closesAt = voteType === "Consent Vote" ? addDays(submitDate, 48) : "";

  return {
    id: item.id,
    question: item.name,
    details: normalized.description,
    voteType,
    submitDate,
    displayDate: normalized.displayDate,
    closesAt,
    closesLabel:
      voteType === "Consent Vote" && closesAt
        ? `Auto-approves ${formatActivityDate(closesAt)}`
        : "Open for member votes",
    requiresComment: voteType === "Consent Vote",
  };
}

function normalizeVoteResponse(item) {
  return {
    id: item.id,
    response: getColumnText(item.column_values, COLUMNS.votes.response),
    comment: getColumnText(item.column_values, COLUMNS.votes.comment),
    question: getColumnText(item.column_values, COLUMNS.votes.motion),
    memberId: getColumnText(item.column_values, COLUMNS.votes.memberId),
    voteId: getColumnText(item.column_values, COLUMNS.votes.voteId),
  };
}

function normalizePayment(item) {
  const dateValue = item.created_at?.slice(0, 10) || "";

  return {
    id: item.id,
    date: formatActivityDate(dateValue),
    dateValue,
    details: getColumnText(item.column_values, COLUMNS.transactions.details),
    amount: formatMoney(getColumnText(item.column_values, COLUMNS.transactions.amount)),
    email: getColumnText(item.column_values, COLUMNS.transactions.email).toLowerCase(),
  };
}

function normalizeShopifyOrder(item) {
  const orderDateValue = dateFromCreationLog(
    item.column_values,
    COLUMNS.transactions.orderDate,
    item.created_at?.slice(0, 10) || "",
  );

  return {
    id: item.id,
    title: item.name,
    details: getColumnText(item.column_values, COLUMNS.transactions.details),
    fulfillmentStatus: getColumnText(
      item.column_values,
      COLUMNS.transactions.fulfillmentStatus,
    ),
    orderDate: formatActivityDate(orderDateValue),
    orderDateValue,
  };
}

function normalizeProjectEvent(item) {
  const startColumn = getColumnValue(
    item.column_values,
    COLUMNS.projectEvents.startDate,
  );
  const endColumn = getColumnValue(item.column_values, COLUMNS.projectEvents.endDate);
  const startDate =
    startColumn?.date || getColumnText(item.column_values, COLUMNS.projectEvents.startDate);
  const endDate =
    endColumn?.date || getColumnText(item.column_values, COLUMNS.projectEvents.endDate);
  const location = getColumnText(item.column_values, COLUMNS.projectEvents.location);
  const isMemberVisible = MEMBER_VISIBLE_LOCATIONS.test(location);

  return {
    id: item.id,
    title: item.name,
    date: formatShiftDate(startDate, item.name),
    dateValue: startDate,
    endDateValue: endDate,
    time: endDate && endDate !== startDate ? `${formatActivityDate(startDate)} - ${formatActivityDate(endDate)}` : "Project/Event",
    type: "project",
    location,
    meta: `${location || "Location TBD"}${isMemberVisible ? "" : " · Admin only"}`,
    adminOnly: !isMemberVisible,
  };
}

function normalizeCommunityEventSubmission(item, members = []) {
  const requestedDateColumn = getColumnValue(
    item.column_values,
    COLUMNS.communityEvents.requestedDate,
  );
  const requestedDate =
    requestedDateColumn?.date ||
    getColumnText(item.column_values, COLUMNS.communityEvents.requestedDate);
  const organizer = getColumnText(item.column_values, COLUMNS.communityEvents.organizer);
  const organizerEmail = getColumnText(
    item.column_values,
    COLUMNS.communityEvents.organizerEmail,
  ).toLowerCase();
  const organizerMember = findMemberByEmail(members, organizerEmail);
  const processStatus =
    getColumnText(item.column_values, COLUMNS.communityEvents.processStatus) || "Pending";
  const submitDate = dateFromCreationLog(
    item.column_values,
    COLUMNS.communityEvents.submittedAt,
    item.created_at?.slice(0, 10) || "",
  );
  const closesAt = addDays(submitDate, 48);
  const description = getColumnText(
    item.column_values,
    COLUMNS.communityEvents.description,
  );
  const materialsRequest = getColumnText(
    item.column_values,
    COLUMNS.communityEvents.materialsRequest,
  );
  const spaceRequested = getColumnText(
    item.column_values,
    COLUMNS.communityEvents.spaceRequested,
  );
  const consentStatus = APPROVED_STATUS.test(processStatus)
    ? "Approved"
    : "Pending consent";
  const organizerLabel =
    organizerMember?.preferredName || organizerMember?.name || organizer || "Community member";
  const organizerMeta = organizerMember
    ? `${organizerLabel} (CoLab member)`
    : organizerLabel;

  return {
    id: item.id,
    title: item.name || "Community-led event proposal",
    date: formatShiftDate(requestedDate, item.name),
    dateValue: requestedDate,
    endDateValue: requestedDate,
    time: "Community proposal",
    type: "community",
    organizer,
    organizerEmail,
    organizerMemberId: organizerMember?.memberId || "",
    organizerMemberName: organizerMember?.preferredName || organizerMember?.name || "",
    processStatus,
    consentStatus,
    submitDate,
    displayDate: formatActivityDate(submitDate),
    closesAt,
    closesLabel: closesAt
      ? `Auto-approves ${formatActivityDate(closesAt)}`
      : "Consent vote pending",
    details: description,
    materialsRequest,
    spaceRequested,
    submissionId:
      getColumnText(item.column_values, COLUMNS.communityEvents.submissionId) || item.id,
    meta: `${consentStatus} · Organized by ${organizerMeta}.`,
  };
}

function communitySubmissionToVoteMotion(submission) {
  const detailParts = [
    submission.dateValue
      ? `Requested date: ${formatActivityDate(submission.dateValue)}.`
      : "",
    submission.organizer || submission.organizerMemberName
      ? `Organizer: ${submission.organizerMemberName || submission.organizer}.`
      : "",
    submission.materialsRequest
      ? `Materials request: ${submission.materialsRequest}.`
      : "",
    submission.details || "",
  ].filter(Boolean);

  return {
    id: submission.id,
    question: `Community-led event: ${submission.title}`,
    details: detailParts.join(" "),
    voteType: "Consent Vote",
    submitDate: submission.submitDate,
    displayDate: submission.displayDate,
    closesAt: submission.closesAt,
    closesLabel: submission.closesLabel,
    requiresComment: true,
    statusOverride: submission.consentStatus === "Approved" ? "Approved" : "",
  };
}

function applyCommunityConsentStatus(submission, responses = []) {
  const nowValue = new Date().toISOString().slice(0, 10);
  const question = `Community-led event: ${submission.title}`;
  const motionResponses = responses.filter(
    (response) =>
      response.voteId === submission.id ||
      (!response.voteId && response.question === question),
  );
  const objectionCount = motionResponses.filter(
    (response) => response.response === VOTE_RESPONSES.dontApprove,
  ).length;
  const isApproved =
    APPROVED_STATUS.test(submission.processStatus) ||
    (submission.closesAt && submission.closesAt < nowValue && objectionCount === 0);
  const consentStatus = isApproved ? "Approved" : "Pending consent";
  const organizerLabel =
    submission.organizerMemberName || submission.organizer || "Community member";
  const organizerMeta = submission.organizerMemberId
    ? `${organizerLabel} (CoLab member)`
    : organizerLabel;

  return {
    ...submission,
    consentStatus,
    meta: `${consentStatus} · Organized by ${organizerMeta}.`,
  };
}

function normalizeAdminProjectItem(item) {
  const startColumn = getColumnValue(item.column_values, COLUMNS.projectEvents.startDate);
  const endColumn = getColumnValue(item.column_values, COLUMNS.projectEvents.endDate);
  const startDate =
    startColumn?.date || getColumnText(item.column_values, COLUMNS.projectEvents.startDate);
  const endDate =
    endColumn?.date || getColumnText(item.column_values, COLUMNS.projectEvents.endDate);
  const status = getColumnText(item.column_values, COLUMNS.projectEvents.status);
  const category = getColumnText(item.column_values, COLUMNS.projectEvents.category);
  const priority = getColumnText(item.column_values, COLUMNS.projectEvents.priority);
  const location = getColumnText(item.column_values, COLUMNS.projectEvents.location);
  const resources = [
    ...columnResources(item.column_values, COLUMNS.projectEvents.posters, "Poster"),
    ...columnResources(item.column_values, COLUMNS.projectEvents.filesLink, "File / link"),
    ...columnResources(item.column_values, COLUMNS.projectEvents.registration, "Registration"),
    ...columnResources(item.column_values, COLUMNS.projectEvents.postEventSurvey, "Post-event survey"),
    ...columnResources(
      item.column_values,
      COLUMNS.projectEvents.googleCalendarEvent,
      "Google Calendar event",
    ),
  ];
  const thumbnail = firstImageResource(resources);

  return {
    id: item.id,
    source: "project",
    title: item.name,
    dateValue: startDate,
    displayDate: formatActivityDate(startDate),
    endDateValue: endDate,
    typeLabel: "Project/Event",
    owner: getColumnText(item.column_values, COLUMNS.projectEvents.owner),
    status,
    category,
    priority,
    location,
    description: getColumnText(item.column_values, COLUMNS.projectEvents.description),
    thumbnailUrl: thumbnail?.url || "",
    resources,
    detailUrl: `/projects/detail/?source=project&id=${encodeURIComponent(item.id)}`,
    updates: normalizeUpdates(item.updates || []),
    details: {
      strategicGoal: getColumnText(item.column_values, COLUMNS.projectEvents.strategicGoal),
      spaceReservation: getColumnText(item.column_values, COLUMNS.projectEvents.spaceReservation),
      registration: columnTextOrValue(item.column_values, COLUMNS.projectEvents.registration),
      postEventSurvey: columnTextOrValue(item.column_values, COLUMNS.projectEvents.postEventSurvey),
      googleCalendarEvent: columnTextOrValue(
        item.column_values,
        COLUMNS.projectEvents.googleCalendarEvent,
      ),
      posters: columnTextOrValue(item.column_values, COLUMNS.projectEvents.posters),
      filesLink: columnTextOrValue(item.column_values, COLUMNS.projectEvents.filesLink),
    },
  };
}

function normalizeAdminCommunityItem(item, members = []) {
  const submission = normalizeCommunityEventSubmission(item, members);
  const resources = [
    ...columnResources(item.column_values, COLUMNS.communityEvents.poster, "Poster"),
    ...columnResources(item.column_values, COLUMNS.communityEvents.links, "Link"),
    ...columnResources(item.column_values, COLUMNS.communityEvents.canvaLink, "Canva link"),
  ];
  const thumbnail = firstImageResource(resources);

  return {
    id: item.id,
    source: "community",
    title: item.name || "Community-led event proposal",
    dateValue: submission.dateValue,
    displayDate: formatActivityDate(submission.dateValue),
    endDateValue: submission.dateValue,
    typeLabel: "Community-led",
    owner: submission.organizerMemberName || submission.organizer,
    status: submission.processStatus,
    category: "Community proposal",
    priority: "",
    location: submission.spaceRequested,
    description: submission.details,
    thumbnailUrl: thumbnail?.url || "",
    resources,
    detailUrl: `/projects/detail/?source=community&id=${encodeURIComponent(item.id)}`,
    updates: normalizeUpdates(item.updates || []),
    details: {
      projectLead: submission.organizer,
      projectLeadEmail: submission.organizerEmail,
      additionalOrganizers: getColumnText(
        item.column_values,
        COLUMNS.communityEvents.additionalOrganizers,
      ),
      toolEquipmentRequests: getColumnText(
        item.column_values,
        COLUMNS.communityEvents.toolEquipmentRequests,
      ),
      requestedSupportAmount: submission.materialsRequest,
      supportFundsUse: getColumnText(item.column_values, COLUMNS.communityEvents.supportFundsUse),
      links: columnTextOrValue(item.column_values, COLUMNS.communityEvents.links),
      canvaLink: columnTextOrValue(item.column_values, COLUMNS.communityEvents.canvaLink),
      poster: columnTextOrValue(item.column_values, COLUMNS.communityEvents.poster),
      additionalInfo: getColumnText(item.column_values, COLUMNS.communityEvents.additionalInfo),
      submissionId: submission.submissionId,
      submittedAt: submission.submitDate,
      consentStatus: submission.consentStatus,
    },
  };
}

function publicMember(member) {
  return {
    itemId: member.itemId,
    name: member.name,
    preferredName: member.preferredName,
    membershipType: member.membershipType,
    memberId: member.memberId,
    signUpDate: member.signUpDate,
  };
}

async function listShifts(env) {
  const data = await mondayGraphQL(
    env,
    `query CoLabCalendar($boardIds: [ID!]) {
      boards(ids: $boardIds) {
        items_page(limit: 12) {
          items {
            id
            name
            subitems {
              id
              board {
                id
              }
              name
              column_values(ids: ["${COLUMNS.shifts.date}", "${COLUMNS.shifts.memberId}", "${COLUMNS.shifts.person}", "${COLUMNS.shifts.coverageStatus}"]) {
                id
                text
                value
              }
            }
          }
        }
      }
    }`,
    { boardIds: [BOARDS.colabCalendar] },
  );

  const items = data.boards?.[0]?.items_page?.items || [];
  const today = new Date();
  const todayValue = today.toISOString().slice(0, 10);

  return items
    .flatMap((item) =>
      (item.subitems || []).map((subitem) => normalizeShift(item, subitem)),
    )
    .filter((shift) => !shift.dateValue || shift.dateValue >= todayValue)
    .sort((a, b) => (a.dateValue || "9999-12-31").localeCompare(b.dateValue || "9999-12-31"))
    .slice(0, 40);
}

async function listMembers(env) {
  const data = await mondayGraphQL(
    env,
    `query CoLabMembers($boardIds: [ID!]) {
      boards(ids: $boardIds) {
        items_page(limit: 300) {
          items {
            id
            name
            column_values(ids: [
              "${COLUMNS.members.preferredName}",
              "${COLUMNS.members.membershipType}",
              "${COLUMNS.members.email}",
              "${COLUMNS.members.phone}",
              "${COLUMNS.members.businessName}",
              "${COLUMNS.members.website}",
              "${COLUMNS.members.socialMedia}",
              "${COLUMNS.members.creativeGroundLink}",
              "${COLUMNS.members.artistDescription}",
              "${COLUMNS.members.signUpDate}",
              "${COLUMNS.members.memberId}",
              "${COLUMNS.members.otherEmails}"
            ]) {
              id
              text
              value
            }
          }
        }
      }
    }`,
    { boardIds: [BOARDS.colabMembers] },
  );

  const members = data.boards?.[0]?.items_page?.items || [];
  return members
    .map(normalizeMember)
    .filter((member) => member.memberId)
    .sort((a, b) => a.preferredName.localeCompare(b.preferredName));
}

function summarizeActivities(activities) {
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const byType = activities.reduce((counts, activity) => {
    const type = activity.activityType || "Activity";
    counts[type] = (counts[type] || 0) + 1;
    return counts;
  }, {});
  const thisMonth = activities.filter((activity) =>
    activity.submitDate?.startsWith(currentMonth),
  ).length;

  return {
    total: activities.length,
    thisMonth,
    latestDate: activities[0]?.displayDate || "No activity yet",
    byType: Object.entries(byType)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type)),
  };
}

async function listActivity(env, memberId) {
  const cleanMemberId = String(memberId || "").trim();

  if (!cleanMemberId) {
    return { activities: [], summary: summarizeActivities([]) };
  }

  const data = await mondayGraphQL(
    env,
    `query CoLabActivity($boardIds: [ID!]) {
      boards(ids: $boardIds) {
        items_page(limit: 200) {
          items {
            id
            name
            column_values(ids: [
              "${COLUMNS.activity.activityType}",
              "${COLUMNS.activity.submitDate}",
              "${COLUMNS.activity.description}",
              "${COLUMNS.activity.person}"
            ]) {
              id
              text
              value
            }
          }
        }
      }
    }`,
    { boardIds: [BOARDS.activityFeedback] },
  );

  const items = data.boards?.[0]?.items_page?.items || [];
  const activities = items
    .map(normalizeActivity)
    .filter((activity) => {
      const personMember = activity.personMemberId;

      return (
        personMember === cleanMemberId ||
        activity.person.includes(`Member ID: ${cleanMemberId}`)
      );
    })
    .sort((a, b) => (b.submitDate || "").localeCompare(a.submitDate || ""));

  return {
    activities: activities.slice(0, 12),
    summary: summarizeActivities(activities),
  };
}

async function listCommunityEventSubmissions(env, members = null) {
  const memberList = members || (await listMembers(env));
  const data = await mondayGraphQL(
    env,
    `query CommunityEventSubmissions($boardIds: [ID!]) {
      boards(ids: $boardIds) {
        items_page(limit: 200) {
          items {
            id
            name
            created_at
            column_values(ids: [
              "${COLUMNS.communityEvents.organizer}",
              "${COLUMNS.communityEvents.organizerEmail}",
              "${COLUMNS.communityEvents.description}",
              "${COLUMNS.communityEvents.materialsRequest}",
              "${COLUMNS.communityEvents.requestedDate}",
              "${COLUMNS.communityEvents.processStatus}",
              "${COLUMNS.communityEvents.submissionId}",
              "${COLUMNS.communityEvents.submittedAt}",
              "${COLUMNS.communityEvents.spaceRequested}"
            ]) {
              id
              text
              value
            }
          }
        }
      }
    }`,
    { boardIds: [BOARDS.communityEventSubmissions] },
  );

  return (data.boards?.[0]?.items_page?.items || [])
    .map((item) => normalizeCommunityEventSubmission(item, memberList))
    .filter((submission) => submission.dateValue)
    .sort((a, b) => (a.dateValue || "").localeCompare(b.dateValue || ""));
}

async function listVoteResponses(env) {
  const data = await mondayGraphQL(
    env,
    `query CoLabVoteResponses($boardIds: [ID!]) {
      boards(ids: $boardIds) {
        items_page(limit: 500) {
          items {
            id
            name
            column_values(ids: [
              "${COLUMNS.votes.response}",
              "${COLUMNS.votes.comment}",
              "${COLUMNS.votes.motion}",
              "${COLUMNS.votes.memberId}",
              "${COLUMNS.votes.voteId}"
            ]) {
              id
              text
              value
            }
          }
        }
      }
    }`,
    { boardIds: [BOARDS.voteLog] },
  );

  return (data.boards?.[0]?.items_page?.items || []).map(normalizeVoteResponse);
}

function aggregateVotes(motions, responses, memberId) {
  const cleanMemberId = String(memberId || "").trim();
  const nowValue = new Date().toISOString().slice(0, 10);

  return motions.map((motion) => {
    const motionResponses = responses.filter(
      (response) =>
        response.voteId === motion.id ||
        (!response.voteId && response.question === motion.question),
    );
    const memberVote = motionResponses.find(
      (response) => response.memberId === cleanMemberId,
    );
    const responseCounts = motionResponses.reduce((counts, response) => {
      const label = response.response || "No response";
      counts[label] = (counts[label] || 0) + 1;
      return counts;
    }, {});
    const objectionCount = responseCounts[VOTE_RESPONSES.dontApprove] || 0;
    const isConsentApproved =
      motion.voteType === "Consent Vote" &&
      motion.closesAt &&
      motion.closesAt < nowValue &&
      objectionCount === 0;
    const status =
      motion.statusOverride ||
      (isConsentApproved ? "Approved" : "Open");

    return {
      ...motion,
      status,
      responseCounts,
      responseTotal: motionResponses.length,
      memberResponse: memberVote?.response || "",
      memberComment: memberVote?.comment || "",
    };
  });
}

async function listVotes(env, memberId) {
  const [motionData, responseData, members] = await Promise.all([
    mondayGraphQL(
      env,
      `query CoLabVoteMotions($boardIds: [ID!]) {
        boards(ids: $boardIds) {
          items_page(limit: 200) {
            items {
              id
              name
              column_values(ids: [
                "${COLUMNS.activity.activityType}",
                "${COLUMNS.activity.submitDate}",
                "${COLUMNS.activity.description}"
              ]) {
                id
                text
                value
              }
            }
          }
        }
      }`,
      { boardIds: [BOARDS.activityFeedback] },
    ),
    mondayGraphQL(
      env,
      `query CoLabVoteResponses($boardIds: [ID!]) {
        boards(ids: $boardIds) {
          items_page(limit: 500) {
            items {
              id
              name
              column_values(ids: [
                "${COLUMNS.votes.response}",
                "${COLUMNS.votes.comment}",
                "${COLUMNS.votes.motion}",
                "${COLUMNS.votes.memberId}",
                "${COLUMNS.votes.voteId}"
              ]) {
                id
                text
                value
              }
            }
          }
        }
      }`,
      { boardIds: [BOARDS.voteLog] },
    ),
    listMembers(env),
  ]);

  const activityMotions = (motionData.boards?.[0]?.items_page?.items || [])
    .map(normalizeVoteMotion)
    .filter((motion) => VOTE_TYPES.includes(motion.voteType))
    .sort((a, b) => (b.submitDate || "").localeCompare(a.submitDate || ""));
  const communityMotions = (await listCommunityEventSubmissions(env, members))
    .filter((submission) => isWithinPastDays(submission.submitDate, 7))
    .filter(requestsColabSpace)
    .map(communitySubmissionToVoteMotion);
  const motions = [...activityMotions, ...communityMotions].sort((a, b) =>
    (b.submitDate || "").localeCompare(a.submitDate || ""),
  );
  const responses = (responseData.boards?.[0]?.items_page?.items || []).map(
    normalizeVoteResponse,
  );

  return aggregateVotes(motions, responses, memberId);
}

async function listPayments(env, memberId) {
  const cleanMemberId = String(memberId || "").trim();
  if (!cleanMemberId) return [];

  const members = await listMembers(env);
  const member = members.find((item) => item.memberId === cleanMemberId);
  if (!member) return [];

  const emails = new Set(memberEmails(member));
  if (!emails.size) return [];

  const data = await mondayGraphQL(
    env,
    `query ShopifyTransactions($boardIds: [ID!]) {
      boards(ids: $boardIds) {
        items_page(limit: 500) {
          items {
            id
            name
            created_at
            column_values(ids: [
              "${COLUMNS.transactions.amount}",
              "${COLUMNS.transactions.details}",
              "${COLUMNS.transactions.email}"
            ]) {
              id
              text
              value
            }
          }
        }
      }
    }`,
    { boardIds: [BOARDS.shopifyTransactions] },
  );

  return (data.boards?.[0]?.items_page?.items || [])
    .map(normalizePayment)
    .filter(
      (payment) =>
        emails.has(payment.email) &&
        /colab membership subscription/i.test(payment.details),
    )
    .sort((a, b) => (b.dateValue || "").localeCompare(a.dateValue || ""));
}

async function listOpenShopifyOrders(env, memberId) {
  const cleanMemberId = String(memberId || "").trim();
  if (!cleanMemberId) return [];

  const members = await listMembers(env);
  const member = members.find((item) => item.memberId === cleanMemberId);
  if (isRetailOnlyMember(member)) return [];

  const data = await mondayGraphQL(
    env,
    `query ShopifyOpenOrders($boardIds: [ID!]) {
      boards(ids: $boardIds) {
        items_page(limit: 500) {
          items {
            id
            name
            created_at
            column_values(ids: [
              "${COLUMNS.transactions.details}",
              "${COLUMNS.transactions.fulfillmentStatus}",
              "${COLUMNS.transactions.orderDate}"
            ]) {
              id
              text
              value
            }
          }
        }
      }
    }`,
    { boardIds: [BOARDS.shopifyTransactions] },
  );

  return (data.boards?.[0]?.items_page?.items || [])
    .map(normalizeShopifyOrder)
    .filter(
      (order) =>
        /unfulfilled/i.test(order.fulfillmentStatus) &&
        !/colab membership subscription/i.test(order.details),
    )
    .sort((a, b) => (a.orderDateValue || "").localeCompare(b.orderDateValue || ""));
}

async function listProjectEvents(env, memberId, members = null) {
  const cleanMemberId = String(memberId || "").trim();
  const memberList = members || (cleanMemberId ? await listMembers(env) : []);
  const member = memberList.find((item) => item.memberId === cleanMemberId);
  const isAdmin = isAdminMember(member);

  const data = await mondayGraphQL(
    env,
    `query ProjectEvents($boardIds: [ID!]) {
      boards(ids: $boardIds) {
        items_page(limit: 500) {
          items {
            id
            name
            column_values(ids: [
              "${COLUMNS.projectEvents.startDate}",
              "${COLUMNS.projectEvents.endDate}",
              "${COLUMNS.projectEvents.location}"
            ]) {
              id
              text
              value
            }
          }
        }
      }
    }`,
    { boardIds: [BOARDS.projectEvents] },
  );

  return (data.boards?.[0]?.items_page?.items || [])
    .map(normalizeProjectEvent)
    .filter((event) => event.dateValue)
    .filter((event) => isAdmin || !event.adminOnly)
    .sort((a, b) => (a.dateValue || "").localeCompare(b.dateValue || ""));
}

async function listCalendarEvents(env, memberId) {
  const cleanMemberId = String(memberId || "").trim();
  const members = cleanMemberId ? await listMembers(env) : [];
  const member = members.find((item) => item.memberId === cleanMemberId);
  const shouldShowCommunityEvents = !isRetailOnlyMember(member);
  const [projectEvents, communityEvents, voteResponses] = await Promise.all([
    listProjectEvents(env, cleanMemberId, members),
    shouldShowCommunityEvents
      ? listCommunityEventSubmissions(env, members)
      : Promise.resolve([]),
    shouldShowCommunityEvents
      ? listVoteResponses(env)
      : Promise.resolve([]),
  ]);
  const consentAwareCommunityEvents = communityEvents.map((submission) =>
    applyCommunityConsentStatus(submission, voteResponses),
  );

  return [...projectEvents, ...consentAwareCommunityEvents].sort((a, b) =>
    (a.dateValue || "").localeCompare(b.dateValue || ""),
  );
}

async function listAdminProjectItems(env) {
  const data = await mondayGraphQL(
    env,
    `query AdminProjectItems($boardIds: [ID!]) {
      boards(ids: $boardIds) {
        items_page(limit: 500) {
          items {
            id
            name
            updates(limit: 5) {
              id
              body
              created_at
              creator {
                name
              }
            }
            column_values(ids: [
              "${COLUMNS.projectEvents.owner}",
              "${COLUMNS.projectEvents.strategicGoal}",
              "${COLUMNS.projectEvents.category}",
              "${COLUMNS.projectEvents.priority}",
              "${COLUMNS.projectEvents.startDate}",
              "${COLUMNS.projectEvents.endDate}",
              "${COLUMNS.projectEvents.status}",
              "${COLUMNS.projectEvents.location}",
              "${COLUMNS.projectEvents.posters}",
              "${COLUMNS.projectEvents.filesLink}",
              "${COLUMNS.projectEvents.registration}",
              "${COLUMNS.projectEvents.postEventSurvey}",
              "${COLUMNS.projectEvents.description}",
              "${COLUMNS.projectEvents.googleCalendarEvent}",
              "${COLUMNS.projectEvents.spaceReservation}"
            ]) {
              id
              text
              value
            }
          }
        }
      }
    }`,
    { boardIds: [BOARDS.projectEvents] },
  );

  return (data.boards?.[0]?.items_page?.items || [])
    .map(normalizeAdminProjectItem)
    .sort((a, b) => (a.dateValue || "9999-12-31").localeCompare(b.dateValue || "9999-12-31"));
}

async function listAdminCommunityItems(env, members = null) {
  const memberList = members || (await listMembers(env));
  const data = await mondayGraphQL(
    env,
    `query AdminCommunityItems($boardIds: [ID!]) {
      boards(ids: $boardIds) {
        items_page(limit: 500) {
          items {
            id
            name
            created_at
            updates(limit: 5) {
              id
              body
              created_at
              creator {
                name
              }
            }
            column_values(ids: [
              "${COLUMNS.communityEvents.links}",
              "${COLUMNS.communityEvents.poster}",
              "${COLUMNS.communityEvents.organizer}",
              "${COLUMNS.communityEvents.organizerEmail}",
              "${COLUMNS.communityEvents.additionalOrganizers}",
              "${COLUMNS.communityEvents.description}",
              "${COLUMNS.communityEvents.toolEquipmentRequests}",
              "${COLUMNS.communityEvents.materialsRequest}",
              "${COLUMNS.communityEvents.supportFundsUse}",
              "${COLUMNS.communityEvents.requestedDate}",
              "${COLUMNS.communityEvents.canvaLink}",
              "${COLUMNS.communityEvents.additionalInfo}",
              "${COLUMNS.communityEvents.spaceRequested}",
              "${COLUMNS.communityEvents.processStatus}",
              "${COLUMNS.communityEvents.submissionId}",
              "${COLUMNS.communityEvents.submittedAt}"
            ]) {
              id
              text
              value
            }
          }
        }
      }
    }`,
    { boardIds: [BOARDS.communityEventSubmissions] },
  );

  return (data.boards?.[0]?.items_page?.items || [])
    .map((item) => normalizeAdminCommunityItem(item, memberList))
    .sort((a, b) => (a.dateValue || "9999-12-31").localeCompare(b.dateValue || "9999-12-31"));
}

async function listAdminProjectRecords(env) {
  const members = await listMembers(env);
  const [projectItems, communityItems] = await Promise.all([
    listAdminProjectItems(env),
    listAdminCommunityItems(env, members),
  ]);

  return [...projectItems, ...communityItems]
    .filter(isUpcomingRecord)
    .sort((a, b) =>
      (a.dateValue || "9999-12-31").localeCompare(b.dateValue || "9999-12-31"),
    );
}

async function getAdminProjectRecord(env, source, id) {
  const records =
    source === "project"
      ? await listAdminProjectItems(env)
      : source === "community"
        ? await listAdminCommunityItems(env)
        : [];

  return records.find((record) => record.id === id) || null;
}

async function submitVote(request, env) {
  const { voteId, motion, response, comment, memberId } = await request.json();
  const cleanVoteId = String(voteId || "").trim();
  const cleanMotion = String(motion || "").trim();
  const cleanResponse = String(response || "").trim();
  const cleanComment = String(comment || "").trim();
  const cleanMemberId = String(memberId || "").trim();

  const authorized = await authorizeMemberRequest(request, env, cleanMemberId);
  const authorizedMemberId = authorized.memberId;

  if (!cleanVoteId || !cleanMotion || !cleanResponse || !authorizedMemberId) {
    return json(
      { error: "voteId, motion, response, and memberId are required." },
      { status: 400 },
    );
  }

  if (!Object.values(VOTE_RESPONSES).includes(cleanResponse)) {
    return json({ error: "Choose a valid vote response." }, { status: 400 });
  }

  if (cleanResponse === VOTE_RESPONSES.dontApprove && !cleanComment) {
    return json(
      { error: "A comment is required when voting Don't Approve." },
      { status: 400 },
    );
  }

  const existingData = await mondayGraphQL(
    env,
    `query ExistingCommunityVotes($boardIds: [ID!]) {
      boards(ids: $boardIds) {
        items_page(limit: 500) {
          items {
            id
            column_values(ids: [
              "${COLUMNS.votes.motion}",
              "${COLUMNS.votes.memberId}",
              "${COLUMNS.votes.voteId}"
            ]) {
              id
              text
              value
            }
          }
        }
      }
    }`,
    { boardIds: [BOARDS.voteLog] },
  );
  const existingResponses = (
    existingData.boards?.[0]?.items_page?.items || []
  ).map(normalizeVoteResponse);
  const duplicate = existingResponses.find(
    (vote) =>
      vote.memberId === authorizedMemberId &&
      (vote.voteId === cleanVoteId ||
        (!vote.voteId && vote.question === cleanMotion)),
  );

  if (duplicate) {
    return json(
      {
        error: "This member has already voted on this question.",
        existingVoteId: duplicate.id,
      },
      { status: 409 },
    );
  }

  const members = await listMembers(env);
  const member = members.find((item) => item.memberId === authorizedMemberId);
  const person = member ? memberDisplayForVote(member) : `Member ID: ${authorizedMemberId}`;
  const columnValues = {
    [COLUMNS.votes.response]: { label: cleanResponse },
    [COLUMNS.votes.comment]: cleanComment,
    [COLUMNS.votes.motion]: cleanMotion,
    [COLUMNS.votes.memberId]: authorizedMemberId,
    [COLUMNS.votes.voteId]: cleanVoteId,
  };

  const data = await mondayGraphQL(
    env,
    `mutation LogCommunityVote($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
      create_item(
        board_id: $boardId,
        item_name: $itemName,
        column_values: $columnValues
      ) {
        id
      }
    }`,
    {
      boardId: BOARDS.voteLog,
      itemName: person,
      columnValues: JSON.stringify(columnValues),
    },
    { idempotencyKey: crypto.randomUUID() },
  );

  return json({
    ok: true,
    voteId: data.create_item?.id,
    motionId: cleanVoteId,
    motion: cleanMotion,
    response: cleanResponse,
    memberId: authorizedMemberId,
  });
}

async function signUpForShift(request, env) {
  const { shiftId, shiftBoardId, memberId } = await request.json();
  const cleanShiftId = String(shiftId || "").trim();
  const cleanShiftBoardId = String(shiftBoardId || "").trim();
  const cleanMemberId = String(memberId || "").trim();

  if (!cleanShiftId || !cleanMemberId) {
    return json(
      { error: "shiftId and memberId are required to sign up for a shift." },
      { status: 400 },
    );
  }

  const authorized = await authorizeMemberRequest(request, env, cleanMemberId);
  const authorizedMemberId = authorized.memberId;
  const boardId = cleanShiftBoardId || BOARDS.colabCalendar;
  const members = await listMembers(env);
  const member = members.find((item) => item.memberId === authorizedMemberId);
  const person = memberDisplayForShift(member, authorizedMemberId);

  await mondayGraphQL(
    env,
    `mutation SetShiftMember($boardId: ID!, $itemId: ID!, $memberColumn: String!, $personColumn: String!, $statusColumn: String!, $memberId: String!, $person: String!, $status: String!) {
      setMember: change_simple_column_value(
        board_id: $boardId,
        item_id: $itemId,
        column_id: $memberColumn,
        value: $memberId
      ) {
        id
      }
      setPerson: change_simple_column_value(
        board_id: $boardId,
        item_id: $itemId,
        column_id: $personColumn,
        value: $person
      ) {
        id
      }
      setStatus: change_simple_column_value(
        board_id: $boardId,
        item_id: $itemId,
        column_id: $statusColumn,
        value: $status
      ) {
        id
      }
    }`,
    {
      boardId,
      itemId: cleanShiftId,
      memberColumn: COLUMNS.shifts.memberId,
      personColumn: COLUMNS.shifts.person,
      statusColumn: COLUMNS.shifts.coverageStatus,
      memberId: authorizedMemberId,
      person,
      status: "Covered",
    },
    { idempotencyKey: crypto.randomUUID() },
  );

  return json({
    ok: true,
    shiftId: cleanShiftId,
    shiftBoardId: boardId,
    memberId: authorizedMemberId,
    person,
    coveredBy: shiftCoveredBy(person),
    coverageStatus: "Covered",
  });
}

async function findMember(request, env) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email")?.trim().toLowerCase();
  const memberId = url.searchParams.get("memberId")?.trim();

  if (!email && !memberId) {
    return json({ error: "Provide email or memberId." }, { status: 400 });
  }

  const session = await accessSession(request, env);
  const members = await listMembers(env);
  const match = members.find((item) => {
    const primaryEmail = item.email.toLowerCase();
    const otherEmails = item.otherEmails.toLowerCase();
    const itemMemberId = item.memberId;

    return (
      (email && (primaryEmail === email || otherEmails.includes(email))) ||
      (memberId && itemMemberId === memberId)
    );
  });

  if (!match) {
    return json({ member: null }, { status: 404 });
  }

  if (session.authenticated && !session.member) {
    return json(
      { error: "Your login email is not connected to a CoLab member profile." },
      { status: 403 },
    );
  }

  if (
    session.authenticated &&
    !session.isAdmin &&
    match.memberId !== session.member.memberId
  ) {
    return json({ error: "You can only view your own member dashboard." }, { status: 403 });
  }

  return json({
    member: match,
  });
}

const apiRoutes = {
  "GET /api/health": () =>
    json({
      ok: true,
      service: "queerlective-dashboard",
      timestamp: new Date().toISOString(),
    }),
  "GET /api/shifts": async (_request, env) => {
    try {
      await requireMatchedAccessMember(_request, env);
      return json({ source: "monday", shifts: await listShifts(env) });
    } catch (error) {
      if (error.status) return json({ error: error.message }, { status: error.status });

      return json({
        source: "mock",
        warning: error.message,
        shifts: MOCK_SHIFTS,
      });
    }
  },
  "GET /api/members": async (_request, env) => {
    try {
      const session = await requireMatchedAccessMember(_request, env);
      const members = await listMembers(env);
      const visibleMembers =
        session.authenticated && !session.isAdmin && session.member
          ? members.filter((member) => member.memberId === session.member.memberId)
          : members;

      return json({
        source: "monday",
        members: visibleMembers.map(publicMember),
        canViewAs: session.canViewAs,
      });
    } catch (error) {
      if (error.status) return json({ error: error.message }, { status: error.status });

      return json({
        source: "mock",
        warning: error.message,
        members: MOCK_MEMBERS.map(publicMember),
      });
    }
  },
  "GET /api/activity": async (request, env) => {
    const url = new URL(request.url);
    let memberId = url.searchParams.get("memberId")?.trim();

    try {
      memberId = (await authorizeMemberRequest(request, env, memberId)).memberId;
      const activity = await listActivity(env, memberId);
      return json({ source: "monday", ...activity });
    } catch (error) {
      if (error.status) return json({ error: error.message }, { status: error.status });

      const mockActivities = MOCK_ACTIVITY.filter(
        (activity) =>
          !memberId ||
          memberIdFromPerson(activity.person) === memberId ||
          activity.person.includes(`Member ID: ${memberId}`),
      ).map((activity) => ({
        ...activity,
        displayDate: formatActivityDate(activity.submitDate),
        personMemberId: memberIdFromPerson(activity.person),
      }));

      return json({
        source: "mock",
        warning: error.message,
        activities: mockActivities,
        summary: summarizeActivities(mockActivities),
      });
    }
  },
  "GET /api/votes": async (request, env) => {
    const url = new URL(request.url);
    let memberId = url.searchParams.get("memberId")?.trim();

    try {
      memberId = (await authorizeMemberRequest(request, env, memberId)).memberId;
      return json({ source: "monday", votes: await listVotes(env, memberId) });
    } catch (error) {
      if (error.status) return json({ error: error.message }, { status: error.status });

      return json({
        source: "mock",
        warning: error.message,
        votes: MOCK_VOTES,
      });
    }
  },
  "GET /api/payments": async (request, env) => {
    const url = new URL(request.url);
    let memberId = url.searchParams.get("memberId")?.trim();

    try {
      memberId = (await authorizeMemberRequest(request, env, memberId)).memberId;
      return json({ source: "monday", payments: await listPayments(env, memberId) });
    } catch (error) {
      if (error.status) return json({ error: error.message }, { status: error.status });

      return json({
        source: "mock",
        warning: error.message,
        payments: MOCK_PAYMENTS,
      });
    }
  },
  "GET /api/orders": async (request, env) => {
    const url = new URL(request.url);
    let memberId = url.searchParams.get("memberId")?.trim();

    try {
      memberId = (await authorizeMemberRequest(request, env, memberId)).memberId;
      return json({ source: "monday", orders: await listOpenShopifyOrders(env, memberId) });
    } catch (error) {
      if (error.status) return json({ error: error.message }, { status: error.status });

      return json({
        source: "mock",
        warning: error.message,
        orders: MOCK_SHOPIFY_ORDERS,
      });
    }
  },
  "GET /api/events": async (request, env) => {
    const url = new URL(request.url);
    let memberId = url.searchParams.get("memberId")?.trim();

    try {
      memberId = (await authorizeMemberRequest(request, env, memberId)).memberId;
      return json({ source: "monday", events: await listCalendarEvents(env, memberId) });
    } catch (error) {
      if (error.status) return json({ error: error.message }, { status: error.status });

      return json({
        source: "mock",
        warning: error.message,
        events: [...MOCK_PROJECT_EVENTS, ...MOCK_COMMUNITY_EVENTS],
      });
    }
  },
  "GET /api/admin/projects": async (request, env) => {
    try {
      await requireAdminSession(request, env);
      return json({ source: "monday", projects: await listAdminProjectRecords(env) });
    } catch (error) {
      return json({ error: error.message }, { status: error.status || 500 });
    }
  },
  "GET /api/admin/projects/detail": async (request, env) => {
    const url = new URL(request.url);
    const source = url.searchParams.get("source")?.trim();
    const id = url.searchParams.get("id")?.trim();

    try {
      await requireAdminSession(request, env);
      if (!source || !id) {
        return json({ error: "source and id are required." }, { status: 400 });
      }

      const project = await getAdminProjectRecord(env, source, id);
      if (!project) return json({ error: "Project not found." }, { status: 404 });

      return json({ source: "monday", project });
    } catch (error) {
      return json({ error: error.message }, { status: error.status || 500 });
    }
  },
  "POST /api/votes": submitVote,
  "POST /api/shifts/signup": signUpForShift,
  "GET /api/member": findMember,
  "GET /api/session": async (request, env) => {
    const session = await requireMatchedAccessMember(request, env);

    return json({
      authenticated: session.authenticated,
      email: session.email,
      member: session.member ? publicMember(session.member) : null,
      isAdmin: session.isAdmin,
      canViewAs: session.canViewAs,
    });
  },
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const route = apiRoutes[`${request.method} ${url.pathname}`];

    if (route) {
      try {
        return await route(request, env);
      } catch (error) {
        return json({ error: error.message }, { status: error.status || 500 });
      }
    }

    if (request.method === "GET" || request.method === "HEAD") {
      try {
        await requireMatchedAccessMember(request, env);
        return env.ASSETS.fetch(request);
      } catch (error) {
        if (error.status === 403) return accessDeniedHtml(accessEmail(request));
        return json({ error: error.message }, { status: error.status || 500 });
      }
    }

    return json({ error: "Not found" }, { status: 404 });
  },
};
