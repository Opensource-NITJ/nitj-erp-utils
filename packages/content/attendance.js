import {
  calculateAttendanceWaffle,
  calculateDeficit,
  calculateScenario,
  TARGET_PERCENT,
} from "../core/attendance.mjs";
import { summarizeAttendance } from "../core/attendance-statistics.mjs";
import { renderAttendanceBoxPlot } from "./attendance-boxplot.js";
import { loadAttendanceHistories } from "./attendance-history.js";
import "./attendance-summary.css";
import attendanceCss from "./attendance.css?inline";

(function () {
  function injectCalculator(anchor, subjects) {
    const calculator = document.createElement("details");
    calculator.className = "nitj-att-surface nitj-att-planner";
    calculator.innerHTML = `
      <summary>
        <span class="nitj-att-title">What-If Planner</span>
        <span class="nitj-att-target">${TARGET_PERCENT}% target</span>
      </summary>`;
    anchor.before(calculator);

    if (!subjects.length) {
      calculator.insertAdjacentHTML("beforeend", `
        <p class="nitj-att-empty">Subject attendance data is unavailable.</p>`);
      return;
    }

    calculator.insertAdjacentHTML("beforeend", `
      <div class="nitj-planner-body">
        <div class="nitj-planner-fields">
          <label>
            Subject
            <select class="form-control input-sm"></select>
          </label>
          <div class="nitj-planner-counts">
            <label>
              Classes to attend
              <input class="form-control input-sm" type="number" min="0" step="1" value="0">
            </label>
            <label>
              Classes to miss
              <input class="form-control input-sm" type="number" min="0" step="1" value="0">
            </label>
          </div>
        </div>
        <output class="nitj-planner-result" aria-live="polite">
          <span class="nitj-projection" hidden>Projected attendance <strong></strong></span>
          <span class="nitj-planner-message"></span>
        </output>
      </div>`);

    const select = calculator.querySelector("select");
    const inputs = [...calculator.querySelectorAll("input")];
    const output = calculator.querySelector("output");
    const projection = output.querySelector(".nitj-projection");
    const projectedValue = projection.querySelector("strong");
    const message = output.querySelector(".nitj-planner-message");
    for (const subject of subjects) {
      select.add(new Option(subject.name));
    }

    function showResult(guidance, percentage = "", status = "") {
      output.dataset.status = status;
      projection.hidden = !percentage;
      projectedValue.textContent = percentage;
      message.textContent = guidance;
    }

    function update() {
      if (inputs.some((input) => !input.validity.valid)) {
        showResult("Enter whole numbers of classes, zero or more.");
        return;
      }

      const { attended, delivered } = subjects[select.selectedIndex];
      const [futureAttended, futureMissed] = inputs.map((input) =>
        input.value === "" ? 0 : input.valueAsNumber,
      );
      const scenario = calculateScenario(
        attended, delivered, futureAttended, futureMissed,
      );
      if (!scenario) {
        showResult("Enter smaller class counts.");
        return;
      }
      if (scenario.percentage === null) {
        showResult("Projected attendance is available once at least one class is counted.");
        return;
      }

      const { deficit } = scenario;
      const rounded = scenario.percentage.toFixed(2);
      const percentage = deficit < 0 && Number(rounded) >= TARGET_PERCENT
        ? `<${TARGET_PERCENT}%`
        : `${rounded}%`;
      const count = Math.abs(deficit);
      const classes = `${count} more ${count === 1 ? "class" : "classes"}`;
      let guidance = `You meet the ${TARGET_PERCENT}% target. Attend the next class to stay there.`;
      if (deficit < 0) {
        guidance = `Attend ${classes} to reach ${TARGET_PERCENT}%.`;
      } else if (deficit > 0) {
        guidance = `You can miss ${classes} and stay at or above ${TARGET_PERCENT}%.`;
      }
      showResult(guidance, percentage, deficit < 0 ? "below-target" : "meets-target");
    }

    calculator.addEventListener("input", update);
    update();
  }

  function createOverallCard(totals) {
    const overall = document.createElement("section");
    overall.className = "nitj-att-surface nitj-overall";
    overall.innerHTML = `<h2 class="nitj-att-title">Overall Attendance</h2>`;
    if (!totals?.delivered) {
      overall.insertAdjacentHTML("beforeend", `<p class="nitj-att-empty">${
        totals ? "No classes have been delivered." : "Overall attendance data is unavailable."
      }</p>`);
      return overall;
    }

    const { attended, attendedTiles, delivered, percentage } = totals;
    const attendedTile = '<span class="nitj-attended"></span>';
    const missedTile = '<span class="nitj-missed"></span>';
    overall.insertAdjacentHTML("beforeend", `
      <div class="nitj-overall-body">
        <div class="nitj-overall-details">
          <strong class="nitj-overall-value">${percentage.toFixed(2)}%</strong>
          <progress class="nitj-att-progress" aria-label="Overall attendance" max="100" value="${percentage}"></progress>
          <div class="nitj-att-counts">
            <span class="nitj-attended"><strong>${attended}</strong> attended</span>
            <span class="nitj-missed"><strong>${delivered - attended}</strong> missed</span>
          </div>
        </div>
        <div class="nitj-waffle" aria-hidden="true">
          ${attendedTile.repeat(attendedTiles)}${missedTile.repeat(100 - attendedTiles)}
        </div>
      </div>`);
    return overall;
  }

  function renderSummary(table, percentages) {
    const summary = document.createElement("section");
    summary.className = "nitj-attendance-summary";

    const heading = document.createElement("h2");
    heading.id = "nitj-attendance-summary-heading";
    heading.textContent = "Attendance summary";
    summary.setAttribute("aria-labelledby", heading.id);

    const count = document.createElement("p");
    const stats = summarizeAttendance(percentages);
    count.textContent = stats
      ? `${percentages.length} ${percentages.length === 1 ? "course" : "courses"}`
      : "No courses with recorded attendance.";
    summary.append(heading, count);

    if (stats) {
      const formatter = new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 1,
      });
      const metrics = [
        ["Minimum", stats.min, "%"],
        ["Q1", stats.q1, "%"],
        ["Median", stats.median, "%"],
        ["Q3", stats.q3, "%"],
        ["Maximum", stats.max, "%"],
        ["IQR", stats.iqr, " pp"],
        ["Std. deviation", stats.standardDeviation, " pp"],
      ];
      const list = document.createElement("dl");

      for (const [label, value, unit] of metrics) {
        const metric = document.createElement("div");
        const term = document.createElement("dt");
        const description = document.createElement("dd");
        term.textContent = label;
        description.textContent = `${formatter.format(value)}${unit}`;
        metric.append(term, description);
        list.appendChild(metric);
      }

      summary.append(list, renderAttendanceBoxPlot(stats, formatter));
    }

    const caption = table.createCaption();
    caption.classList.add("nitj-attendance-summary-caption");
    caption.prepend(summary);
  }

  function run() {
    if (window.location.pathname.includes("attendance_report_detail")) return;
    const [studentTable, table] = document.querySelectorAll(".panel-body table.table");
    if (!table) return;
    const rows = table.querySelectorAll("tr");
    if (!rows.length) return;
    const header = rows[0];
    if (header.innerText.includes("Attendance Deficit")) return;
    const originalColumnCount = header.cells.length;
    const reportHeader = header.lastElementChild;
    for (const label of ["Weekly trend", "Attendance Deficit"]) {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = label;
      th.style.fontFamily = "Verdana";
      th.style.fontSize = "11px";
      th.style.textAlign = "center";
      header.insertBefore(th, reportHeader);
    }

    const subjects = [];
    const subjectTotals = [];
    const percentages = [];
    const courses = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const cols = row.querySelectorAll("td");
      const code = cols[0]?.textContent.trim();
      const title = cols[1]?.textContent.trim();
      const isSubject = (code || title) && cols[0].colSpan === 1 &&
        !row.closest("tfoot") && !/^(grand total|total|overall total|overall)$/i.test(code || title);
      if (cols.length < 6) {
        if (isSubject) subjectTotals.push(null);
        if (cols.length === 1 && cols[0].colSpan === originalColumnCount) {
          cols[0].colSpan += 2;
        }
        continue;
      }
      const deliveredText = cols[2].innerText.trim();
      const attendedText = cols[3].innerText.trim();
      const delivered = Number(deliveredText);
      const attended = Number(attendedText);
      const wholeCounts = /^\d+$/.test(deliveredText) && /^\d+$/.test(attendedText);
      const deficit = wholeCounts ? calculateDeficit(attended, delivered) : null;
      const detailCell = cols[cols.length - 1];
      const trendCell = document.createElement("td");
      trendCell.className = "nitj-attendance-history";
      row.insertBefore(trendCell, detailCell);
      trendCell.textContent = "—";
      if (isSubject) {
        subjectTotals.push(deficit !== null ? { attended, delivered } : null);
        if (deficit !== null) {
          subjects.push({ name: code ? `${title} (${code})` : title, attended, delivered });
          if (delivered > 0) {
            percentages.push((attended / delivered) * 100);
            courses.push({ courseCode: code || title, detailCell, trendCell });
          }
        }
      }
      const value = deficit ?? 0;
      const td = document.createElement("td");
      td.setAttribute("align", "center");
      td.style.color = "#000000";
      td.style.fontFamily = "Verdana";
      td.style.fontSize = "12px";
      td.style.verticalAlign = "middle";
      const badge = document.createElement("span");
      badge.classList.add("label");
      badge.style.fontSize = "12px";
      if (value > 0) {
        badge.classList.add("label-success");
        badge.textContent = value;
      } else if (value === 0) {
        badge.classList.add("label-default");
        badge.textContent = "0";
      } else {
        badge.classList.add("label-danger");
        badge.textContent = value;
      }
      td.appendChild(badge);
      row.insertBefore(td, detailCell);
    }
    const style = document.createElement("style");
    style.textContent = attendanceCss;
    document.head.append(style);

    // Keep the planner outside the ERP form and the table's scroll area.
    const anchor = table.closest("form") ?? table.closest(".table-responsive") ?? table;
    const overall = createOverallCard(calculateAttendanceWaffle(subjectTotals));
    const studentPanel = studentTable.closest(".panel");
    if (studentPanel && !studentPanel.contains(table)) {
      studentPanel.after(overall);
    } else {
      anchor.before(overall);
    }
    injectCalculator(anchor, subjects);
    renderSummary(table, percentages);
    void loadAttendanceHistories(courses);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
