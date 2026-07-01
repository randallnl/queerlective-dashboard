const MONDAY_API_URL = "https://api.monday.com/v2";

const BOARDS = {
  colabCalendar: 8374554428,
  colabMembers: 8402413272,
  activityFeedback: 18408298018,
  voteLog: 18411164142,
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
};

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

function shiftCoveredBy(person, memberId) {
  if (person) {
    return person.split("|")[0].trim();
  }

  return memberId || "";
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
    coveredBy: shiftCoveredBy(person, memberId),
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
  const closeDate = submitDate ? new Date(`${submitDate}T00:00:00Z`) : null;

  if (closeDate && voteType === "Consent Vote") {
    closeDate.setUTCDate(closeDate.getUTCDate() + 48);
  }

  return {
    id: item.id,
    question: item.name,
    details: normalized.description,
    voteType,
    submitDate,
    displayDate: normalized.displayDate,
    closesAt: closeDate ? closeDate.toISOString().slice(0, 10) : "",
    closesLabel:
      voteType === "Consent Vote" && closeDate
        ? `Auto-approves ${formatActivityDate(closeDate.toISOString().slice(0, 10))}`
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

    return {
      ...motion,
      status: isConsentApproved ? "Approved" : "Open",
      responseCounts,
      responseTotal: motionResponses.length,
      memberResponse: memberVote?.response || "",
      memberComment: memberVote?.comment || "",
    };
  });
}

async function listVotes(env, memberId) {
  const [motionData, responseData] = await Promise.all([
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
  ]);

  const motions = (motionData.boards?.[0]?.items_page?.items || [])
    .map(normalizeVoteMotion)
    .filter((motion) => VOTE_TYPES.includes(motion.voteType))
    .sort((a, b) => (b.submitDate || "").localeCompare(a.submitDate || ""));
  const responses = (responseData.boards?.[0]?.items_page?.items || []).map(
    normalizeVoteResponse,
  );

  return aggregateVotes(motions, responses, memberId);
}

async function submitVote(request, env) {
  const { voteId, motion, response, comment, memberId } = await request.json();
  const cleanVoteId = String(voteId || "").trim();
  const cleanMotion = String(motion || "").trim();
  const cleanResponse = String(response || "").trim();
  const cleanComment = String(comment || "").trim();
  const cleanMemberId = String(memberId || "").trim();

  if (!cleanVoteId || !cleanMotion || !cleanResponse || !cleanMemberId) {
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
      vote.memberId === cleanMemberId &&
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
  const member = members.find((item) => item.memberId === cleanMemberId);
  const person = member ? memberDisplayForVote(member) : `Member ID: ${cleanMemberId}`;
  const columnValues = {
    [COLUMNS.votes.response]: { label: cleanResponse },
    [COLUMNS.votes.comment]: cleanComment,
    [COLUMNS.votes.motion]: cleanMotion,
    [COLUMNS.votes.memberId]: cleanMemberId,
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
    memberId: cleanMemberId,
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

  const boardId = cleanShiftBoardId || BOARDS.colabCalendar;
  const members = await listMembers(env);
  const member = members.find((item) => item.memberId === cleanMemberId);
  const person = memberDisplayForShift(member, cleanMemberId);

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
      memberId: cleanMemberId,
      person,
      status: "Covered",
    },
    { idempotencyKey: crypto.randomUUID() },
  );

  return json({
    ok: true,
    shiftId: cleanShiftId,
    shiftBoardId: boardId,
    memberId: cleanMemberId,
    person,
    coveredBy: shiftCoveredBy(person, cleanMemberId),
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
      return json({ source: "monday", shifts: await listShifts(env) });
    } catch (error) {
      return json({
        source: "mock",
        warning: error.message,
        shifts: MOCK_SHIFTS,
      });
    }
  },
  "GET /api/members": async (_request, env) => {
    try {
      const members = await listMembers(env);
      return json({ source: "monday", members: members.map(publicMember) });
    } catch (error) {
      return json({
        source: "mock",
        warning: error.message,
        members: MOCK_MEMBERS.map(publicMember),
      });
    }
  },
  "GET /api/activity": async (request, env) => {
    const url = new URL(request.url);
    const memberId = url.searchParams.get("memberId")?.trim();

    try {
      const activity = await listActivity(env, memberId);
      return json({ source: "monday", ...activity });
    } catch (error) {
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
    const memberId = url.searchParams.get("memberId")?.trim();

    try {
      return json({ source: "monday", votes: await listVotes(env, memberId) });
    } catch (error) {
      return json({
        source: "mock",
        warning: error.message,
        votes: MOCK_VOTES,
      });
    }
  },
  "POST /api/votes": submitVote,
  "POST /api/shifts/signup": signUpForShift,
  "GET /api/member": findMember,
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const route = apiRoutes[`${request.method} ${url.pathname}`];

    if (route) {
      try {
        return await route(request, env);
      } catch (error) {
        return json({ error: error.message }, { status: 500 });
      }
    }

    return json({ error: "Not found" }, { status: 404 });
  },
};
