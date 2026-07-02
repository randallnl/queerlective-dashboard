const title = document.querySelector("#detail-title");
const source = document.querySelector("#detail-source");
const summary = document.querySelector("#detail-summary");
const status = document.querySelector("#detail-status");
const fields = document.querySelector("#detail-fields");
const updates = document.querySelector("#detail-updates");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function fieldMarkup(label, value) {
  if (!value) return "";

  const displayValue = /^https?:\/\//i.test(value)
    ? `<a href="${escapeHtml(value)}" target="_blank" rel="noreferrer">${escapeHtml(value)}</a>`
    : escapeHtml(value);

  return `
    <div class="detail-field">
      <span>${escapeHtml(label)}</span>
      <strong>${displayValue}</strong>
    </div>
  `;
}

function renderProject(project) {
  title.textContent = project.title || "Untitled project";
  source.textContent = project.typeLabel || project.source || "Admin project";
  status.textContent = project.status || "No status";
  summary.textContent = [
    project.displayDate,
    project.owner,
    project.location,
  ].filter(Boolean).join(" · ") || "No summary details";

  const detailFields = [
    ["Date", project.displayDate],
    ["End date", project.endDateValue],
    ["Owner / lead", project.owner],
    ["Status", project.status],
    ["Category", project.category],
    ["Priority", project.priority],
    ["Location / space", project.location],
    ["Description", project.description],
    ...Object.entries(project.details || {}).map(([key, value]) => [
      key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase()),
      value,
    ]),
  ];

  fields.innerHTML =
    detailFields.map(([label, value]) => fieldMarkup(label, value)).join("") ||
    `<p class="form-note">No details found for this item.</p>`;

  updates.innerHTML = project.updates?.length
    ? project.updates
        .map(
          (update) => `
            <article class="activity-item">
              <div>
                <p class="activity-title">${escapeHtml(update.creator || "Update")}</p>
                <span class="event-meta">${escapeHtml(update.createdAt || "")}</span>
                <p class="activity-description">${escapeHtml(update.body || "")}</p>
              </div>
            </article>
          `,
        )
        .join("")
    : `<p class="form-note">No updates have been posted yet.</p>`;
}

async function loadProjectDetail() {
  const params = new URLSearchParams(window.location.search);
  const recordSource = params.get("source") || "";
  const id = params.get("id") || "";

  if (!recordSource || !id) {
    title.textContent = "Missing project";
    summary.textContent = "This detail page needs a source and id.";
    return;
  }

  try {
    const response = await fetch(
      `/api/admin/projects/detail?source=${encodeURIComponent(recordSource)}&id=${encodeURIComponent(id)}`,
    );
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Unable to load project.");

    renderProject(payload.project);
  } catch (error) {
    title.textContent = "Project unavailable";
    summary.textContent = error.message;
    status.textContent = "Error";
    fields.innerHTML = "";
    updates.innerHTML = "";
  }
}

loadProjectDetail();
