import { readAttendanceLectures } from "../core/attendance-details.mjs";
import {
  getAttendanceTrend,
  getAttendanceWeekStart,
  getWeeklyAttendance,
} from "../core/attendance-trends.mjs";
import "./attendance-history.css";

const SVG_NS = "http://www.w3.org/2000/svg";
const DETAIL_PATH = "/erp/attendance_report_detail.php";
const REQUEST_BATCH_SIZE = 3;
const REQUEST_TIMEOUT_MS = 10_000;
const numberFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });
const slopeFormat = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});
const weekFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const trendLabels = { rising: "↗ Rising", stable: "→ Stable", falling: "↘ Falling" };

function findDetailUrl(cell) {
  for (const link of cell.querySelectorAll("a[href]")) {
    let url;
    try {
      url = new URL(link.getAttribute("href"), document.baseURI);
    } catch {
      continue;
    }
    if (url.origin === window.location.origin && url.pathname === DETAIL_PATH) {
      url.hash = "";
      return url.href;
    }
  }
  return null;
}

function renderChart(weeks, trend, label, expanded = false) {
  const { width, height, left, right, top, bottom } = expanded
    ? { width: 520, height: 262, left: 52, right: 14, top: 12, bottom: 60 }
    : { width: 76, height: 24, left: 2, right: 2, top: 2, bottom: 2 };
  const firstWeek = weeks[0].week;
  const span = weeks.at(-1).week - firstWeek;
  const weekWidth = (width - left - right) / (span + 1);
  const barWidth = Math.min(weekWidth * 0.72, expanded ? 28 : 10);
  const baseline = height - bottom;
  const xFor = (elapsed) => left + (elapsed + 0.5) * weekWidth;
  const yFor = (percentage) => baseline - (percentage / 100) * (baseline - top);
  const chart = document.createElementNS(SVG_NS, "svg");
  chart.classList.add("nitj-attendance-chart");
  chart.setAttribute("viewBox", `0 0 ${width} ${height}`);
  chart.setAttribute("width", width);
  chart.setAttribute("height", height);

  if (expanded) {
    chart.setAttribute("role", "img");
    chart.setAttribute("aria-label", label);
    for (const percent of [0, 25, 50, 75, 100]) {
      const y = yFor(percent);
      const guide = document.createElementNS(SVG_NS, "line");
      guide.classList.add("nitj-attendance-chart-guide");
      guide.setAttribute("x1", left);
      guide.setAttribute("x2", width - right);
      guide.setAttribute("y1", y);
      guide.setAttribute("y2", y);
      chart.appendChild(guide);

      const tick = document.createElementNS(SVG_NS, "text");
      tick.setAttribute("x", left - 8);
      tick.setAttribute("y", y);
      tick.setAttribute("text-anchor", "end");
      tick.setAttribute("dominant-baseline", "middle");
      tick.textContent = `${percent}%`;
      chart.appendChild(tick);
    }

    for (let elapsed = 0; elapsed <= span; elapsed++) {
      const x = xFor(elapsed);
      const y = baseline + 14;
      const tick = document.createElementNS(SVG_NS, "text");
      tick.classList.add("nitj-attendance-week-label");
      tick.setAttribute("x", x);
      tick.setAttribute("y", y);
      tick.setAttribute("text-anchor", "end");
      tick.setAttribute("transform", `rotate(-45 ${x} ${y})`);
      tick.textContent = weekFormat.format(getAttendanceWeekStart(firstWeek + elapsed));
      chart.appendChild(tick);
    }
  } else {
    chart.setAttribute("aria-hidden", "true");
  }

  for (const { week, percentage } of weeks) {
    const y = yFor(percentage);
    const bar = document.createElementNS(SVG_NS, "rect");
    bar.classList.add("nitj-attendance-chart-bar");
    bar.setAttribute("x", xFor(week - firstWeek) - barWidth / 2);
    bar.setAttribute("width", barWidth);
    // A baseline mark distinguishes a recorded zero from a week without marks.
    bar.setAttribute("y", percentage === 0 ? baseline - 1 : y);
    bar.setAttribute("height", percentage === 0 ? 1 : baseline - y);
    bar.setAttribute("rx", expanded ? "2" : "0.5");
    if (expanded) {
      const title = document.createElementNS(SVG_NS, "title");
      title.textContent = `Week of ${weekFormat.format(getAttendanceWeekStart(week))} · ${numberFormat.format(percentage)}%`;
      bar.appendChild(title);
    }
    chart.appendChild(bar);
  }

  if (expanded && trend) {
    let start = 0;
    let end = span;
    if (trend.slope !== 0) {
      const atZero = -trend.intercept / trend.slope;
      const atHundred = (100 - trend.intercept) / trend.slope;
      start = Math.max(0, Math.min(atZero, atHundred));
      end = Math.min(span, Math.max(atZero, atHundred));
    }
    const trendline = document.createElementNS(SVG_NS, "line");
    trendline.classList.add("nitj-attendance-chart-trend");
    trendline.setAttribute("x1", xFor(start));
    trendline.setAttribute("x2", xFor(end));
    trendline.setAttribute("y1", yFor(trend.intercept + trend.slope * start));
    trendline.setAttribute("y2", yFor(trend.intercept + trend.slope * end));
    chart.appendChild(trendline);
  }

  return chart;
}

function openChart(trigger, weeks, trend, courseCode, description) {
  const dialog = document.createElement("dialog");
  dialog.className = "nitj-attendance-chart-dialog";

  const header = document.createElement("div");
  header.className = "nitj-attendance-chart-dialog-header";
  const heading = document.createElement("h2");
  heading.id = "nitj-attendance-chart-heading";
  heading.textContent = `${courseCode} weekly attendance`;
  const close = document.createElement("button");
  close.type = "button";
  close.autofocus = true;
  close.textContent = "Close";
  close.addEventListener("click", () => dialog.close());
  header.append(heading, close);

  const caption = document.createElement("p");
  caption.id = "nitj-attendance-chart-description";
  caption.textContent = description;
  dialog.setAttribute("aria-labelledby", heading.id);
  dialog.setAttribute("aria-describedby", caption.id);
  dialog.append(header, caption, renderChart(weeks, trend, heading.textContent, true));

  dialog.addEventListener("close", () => {
    dialog.remove();
    trigger.focus();
  }, { once: true });
  document.body.appendChild(dialog);
  dialog.showModal();
}

function renderHistory(container, weeks, courseCode) {
  if (!weeks.length) {
    container.textContent = "No marked lectures";
    return;
  }

  const trend = getAttendanceTrend(weeks);
  const badge = document.createElement("span");
  badge.className = "nitj-attendance-momentum";
  badge.textContent = trend ? trendLabels[trend.direction] : "Insufficient data";
  if (trend) badge.dataset.direction = trend.direction;

  const first = numberFormat.format(weeks[0].percentage);
  const last = numberFormat.format(weeks.at(-1).percentage);
  const change = weeks.length === 1
    ? `${first}% in one recorded week.`
    : `${first}% to ${last}% across ${weeks.length} recorded weeks.`;
  const slope = trend
    ? `Dashed trend ${slopeFormat.format(trend.slope)} percentage points per week.`
    : "Trend needs at least three recorded weeks.";
  const description = `${change} ${slope}`;
  const trigger = document.createElement("button");
  trigger.className = "nitj-attendance-chart-trigger";
  trigger.type = "button";
  trigger.title = "Expand weekly attendance chart";
  trigger.setAttribute("aria-haspopup", "dialog");
  trigger.setAttribute("aria-label", `${badge.textContent}. Expand weekly attendance chart for ${courseCode}. ${description}`);

  const expand = document.createElement("span");
  expand.className = "nitj-attendance-chart-expand";
  expand.setAttribute("aria-hidden", "true");
  expand.textContent = "⤢";
  trigger.append(renderChart(weeks, trend, ""), badge, expand);
  trigger.addEventListener("click", () => openChart(trigger, weeks, trend, courseCode, description));
  container.replaceChildren(trigger);
}

async function loadHistory({ url, container, courseCode }) {
  try {
    const response = await fetch(url, {
      credentials: "same-origin",
      mode: "same-origin",
      redirect: "error",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error("Attendance detail request failed");

    const template = document.createElement("template");
    template.innerHTML = await response.text();
    const lectures = readAttendanceLectures(template.content.querySelector(".panel-body"));
    if (!lectures?.length) throw new Error("Attendance detail table is unavailable");

    renderHistory(container, getWeeklyAttendance(lectures), courseCode);
  } catch {
    container.textContent = "History unavailable";
  }
}

export async function loadAttendanceHistories(courses) {
  const entries = courses.map(({ courseCode, detailCell, trendCell }) => ({
    courseCode,
    container: trendCell,
    url: findDetailUrl(detailCell),
  }));
  const linkCounts = new Map();
  for (const { url } of entries) {
    if (url) linkCounts.set(url, (linkCounts.get(url) ?? 0) + 1);
  }

  const requests = [];
  for (const { container, courseCode, url } of entries) {
    // A shared link cannot identify an individual course's report.
    if (linkCounts.get(url) === 1) {
      container.textContent = "Loading history…";
      requests.push({ url, container, courseCode });
    } else {
      container.textContent = "History unavailable";
    }
  }

  for (let start = 0; start < requests.length; start += REQUEST_BATCH_SIZE) {
    await Promise.all(requests.slice(start, start + REQUEST_BATCH_SIZE).map(loadHistory));
  }
}
