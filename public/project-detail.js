const title = document.querySelector("#detail-title");
const source = document.querySelector("#detail-source");
const summary = document.querySelector("#detail-summary");
const status = document.querySelector("#detail-status");
const fields = document.querySelector("#detail-fields");
const updates = document.querySelector("#detail-updates");
const media = document.querySelector("#detail-media");
const resources = document.querySelector("#detail-resources");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

function resourceMarkup(resource) {
  const label = resource.label || resource.url || "Resource";
  const type = resource.type || "link";
  const preview =
    resource.url && type === "image"
      ? `<img src="${escapeHtml(resource.url)}" alt="" loading="lazy" />`
      : `<span class="resource-file-type">${escapeHtml(type)}</span>`;

  return `
    <a
      class="detail-resource-card"
      href="${escapeHtml(resource.url || "#")}"
      ${resource.url ? 'target="_blank" rel="noreferrer"' : 'aria-disabled="true"'}
    >
      ${preview}
      <strong>${escapeHtml(label)}</strong>
      ${resource.url ? `<small>${escapeHtml(resource.url)}</small>` : ""}
    </a>
  `;
}

function renderProject(project) {
  title.textContent = project.title || "Untitled project";
  source.textContent = project.typeLabel || project.source || "Admin project";
  status.textContent = project.status || "No status";
  status.className = `status-pill ${toneClass(project.status || "No status")}`;
  summary.textContent = [
    project.displayDate,
    project.endDateValue ? `Ends ${project.endDateValue}` : "",
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

  media.innerHTML = project.thumbnailUrl
    ? `<img class="detail-hero-image" src="${escapeHtml(project.thumbnailUrl)}" alt="" />`
    : `<div class="detail-hero-placeholder">${escapeHtml(project.typeLabel || "Project")}</div>`;

  resources.innerHTML = project.resources?.length
    ? project.resources.map(resourceMarkup).join("")
    : `<p class="form-note">No links or files found for this item.</p>`;

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
