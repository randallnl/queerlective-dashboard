const MONDAY_API_URL = "https://api.monday.com/v2";

const BOARDS = {
  colabCalendar: 8374554428,
  colabMembers: 8402413272,
};

const COLUMNS = {
  shifts: {
    date: "date0",
    memberId: "text_mm35f0vb",
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
    coverageStatus: "Open",
    isCovered: false,
    tags: ["sunday", "studio coverage"],
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

async function mondayGraphQL(env, query, variables, options = {}) {
  if (!env.MONDAY_API_TOKEN) {
    throw new Error("Missing MONDAY_API_TOKEN");
  }

  const headers = {
    Authorization: env.MONDAY_API_TOKEN,
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
    parentId: parentItem.id,
    month: parentItem.name,
    title: name,
    date: formatShiftDate(dateValue, name),
    dateValue,
    time: isSunday ? "2:00 PM - 4:00 PM" : "6:00 PM - 8:00 PM",
    memberId,
    coverageStatus: coverageStatus || "Open",
    isCovered: Boolean(memberId) || /covered|filled|confirmed/i.test(coverageStatus),
    tags: [dayTag, "studio coverage"],
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
              name
              column_values(ids: ["${COLUMNS.shifts.date}", "${COLUMNS.shifts.memberId}", "${COLUMNS.shifts.coverageStatus}"]) {
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

async function signUpForShift(request, env) {
  const { shiftId, memberId } = await request.json();
  const cleanShiftId = String(shiftId || "").trim();
  const cleanMemberId = String(memberId || "").trim();

  if (!cleanShiftId || !cleanMemberId) {
    return json(
      { error: "shiftId and memberId are required to sign up for a shift." },
      { status: 400 },
    );
  }

  await mondayGraphQL(
    env,
    `mutation SetShiftMember($boardId: ID!, $itemId: ID!, $memberColumn: String!, $statusColumn: String!, $memberId: String!, $status: String!) {
      setMember: change_simple_column_value(
        board_id: $boardId,
        item_id: $itemId,
        column_id: $memberColumn,
        value: $memberId
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
      boardId: BOARDS.colabCalendar,
      itemId: cleanShiftId,
      memberColumn: COLUMNS.shifts.memberId,
      statusColumn: COLUMNS.shifts.coverageStatus,
      memberId: cleanMemberId,
      status: "Covered",
    },
    { idempotencyKey: crypto.randomUUID() },
  );

  return json({ ok: true, shiftId: cleanShiftId, memberId: cleanMemberId });
}

async function findMember(request, env) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email")?.trim().toLowerCase();
  const memberId = url.searchParams.get("memberId")?.trim();

  if (!email && !memberId) {
    return json({ error: "Provide email or memberId." }, { status: 400 });
  }

  const data = await mondayGraphQL(
    env,
    `query CoLabMembers($boardIds: [ID!]) {
      boards(ids: $boardIds) {
        items_page(limit: 200) {
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
  const match = members.find((item) => {
    const primaryEmail = getColumnText(item.column_values, COLUMNS.members.email).toLowerCase();
    const otherEmails = getColumnText(
      item.column_values,
      COLUMNS.members.otherEmails,
    ).toLowerCase();
    const itemMemberId = getColumnText(item.column_values, COLUMNS.members.memberId);

    return (
      (email && (primaryEmail === email || otherEmails.includes(email))) ||
      (memberId && itemMemberId === memberId)
    );
  });

  if (!match) {
    return json({ member: null }, { status: 404 });
  }

  return json({
    member: {
      itemId: match.id,
      name: match.name,
      preferredName: getColumnText(match.column_values, COLUMNS.members.preferredName),
      membershipType: getColumnText(match.column_values, COLUMNS.members.membershipType),
      email: getColumnText(match.column_values, COLUMNS.members.email),
      phone: getColumnText(match.column_values, COLUMNS.members.phone),
      memberId: getColumnText(match.column_values, COLUMNS.members.memberId),
      signUpDate: getColumnText(match.column_values, COLUMNS.members.signUpDate),
      businessName: getColumnText(match.column_values, COLUMNS.members.businessName),
      website: getColumnText(match.column_values, COLUMNS.members.website),
      socialMedia: getColumnText(match.column_values, COLUMNS.members.socialMedia),
      creativeGroundLink: getColumnText(
        match.column_values,
        COLUMNS.members.creativeGroundLink,
      ),
      artistDescription: getColumnText(
        match.column_values,
        COLUMNS.members.artistDescription,
      ),
    },
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
