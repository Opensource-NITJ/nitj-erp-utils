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
  function createCalculator(subjects, updateDeficits) {
    const calculator = document.createElement("details");
    calculator.className = "nitj-att-surface nitj-att-planner";
    calculator.open = true;
    calculator.innerHTML = `
      <summary>
        <span class="nitj-att-title">Planner</span>
        <span class="nitj-att-target">${TARGET_PERCENT}% target</span>
      </summary>`;

    if (!subjects.length) {
      calculator.insertAdjacentHTML("beforeend", `
        <p class="nitj-att-empty">Subject attendance data is unavailable.</p>`);
      return calculator;
    }

    calculator.insertAdjacentHTML("beforeend", `
      <div class="nitj-planner-body">
        <div class="nitj-planner-fields">
          <label>
            Subject
            <select class="form-control input-sm"></select>
          </label>
          <fieldset class="nitj-planner-targets">
            <legend>Attendance target</legend>
            <div class="nitj-target-options">
              <label><input type="radio" name="nitj-planner-target" value="72"><span>72%</span></label>
              <label><input type="radio" name="nitj-planner-target" value="75" checked><span>75%</span></label>
              <label><input type="radio" name="nitj-planner-target" value="custom"><span>Custom</span></label>
            </div>
            <label class="nitj-custom-target" hidden>
              Custom target (%)
              <input class="form-control input-sm" type="number" min="0.01" max="100" step="0.01" value="75" required disabled>
            </label>
          </fieldset>
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
    const inputs = [...calculator.querySelectorAll(".nitj-planner-counts input")];
    const customTarget = calculator.querySelector(".nitj-custom-target");
    const targetInput = customTarget.querySelector("input");
    const targetLabel = calculator.querySelector(".nitj-att-target");
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
      const selectedTarget = calculator.querySelector('input[name="nitj-planner-target"]:checked').value;
      const isCustom = selectedTarget === "custom";
      customTarget.hidden = !isCustom;
      targetInput.disabled = !isCustom;
      const target = isCustom ? targetInput.valueAsNumber : Number(selectedTarget);
      targetLabel.textContent = Number.isFinite(target) ? `${target}% target` : "Custom target";
      if (isCustom && !targetInput.validity.valid) {
        updateDeficits(null);
        showResult("Enter a target from 0.01% to 100%, with up to two decimal places.");
        return;
      }
      updateDeficits(target);
      if (inputs.some((input) => !input.validity.valid)) {
        showResult("Enter whole numbers of classes, zero or more.");
        return;
      }

      const { attended, delivered } = subjects[select.selectedIndex];
      const [futureAttended, futureMissed] = inputs.map((input) =>
        input.value === "" ? 0 : input.valueAsNumber,
      );
      const scenario = calculateScenario(
        attended, delivered, futureAttended, futureMissed, target,
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
      const percentage = deficit < 0 && Number(rounded) >= target
        ? `<${target}%`
        : `${rounded}%`;
      if (deficit === null) {
        showResult("A 100% target cannot be reached after a missed class.", percentage, "below-target");
        return;
      }
      const count = Math.abs(deficit);
      const classes = `${count} more ${count === 1 ? "class" : "classes"}`;
      let guidance = `You meet the ${target}% target. Attend the next class to stay there.`;
      if (deficit < 0) {
        guidance = `Attend ${classes} to reach ${target}%.`;
      } else if (deficit > 0) {
        guidance = `You can miss ${classes} and stay at or above ${target}%.`;
      }
      showResult(guidance, percentage, deficit < 0 ? "below-target" : "meets-target");
    }

    calculator.addEventListener("input", update);
    update();
    return calculator;
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
    const summary = document.createElement("details");
    summary.className = "nitj-attendance-summary";
    summary.open = true;

    const heading = document.createElement("summary");
    heading.id = "nitj-attendance-summary-heading";
    heading.textContent = "Summary";

    const count = document.createElement("span");
    count.className = "nitj-summary-count";
    const stats = summarizeAttendance(percentages);
    count.textContent = stats
      ? `${percentages.length} ${percentages.length === 1 ? "course" : "courses"}`
      : "No courses with recorded attendance.";
    heading.append(count);
    const body = document.createElement("div");
    body.className = "nitj-summary-body";
    summary.append(heading, body);

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

      body.append(renderAttendanceBoxPlot(stats, formatter), list);
    }

    const wrapper = table.closest(".table-responsive");
    (wrapper && table.closest(".nitj-att-report").contains(wrapper) ? wrapper : table).before(summary);
  }

  function arrangeAttendancePage(studentTable, table, overall, planner) {
    const reportPanel = table.closest(".panel");
    const container = table.closest(".container") ?? document.body;
    const studentPanel = [...container.querySelectorAll(".panel")].find((panel) =>
      !panel.contains(table) && /^welcome\b/i.test(panel.querySelector(".panel-heading")?.textContent.trim() ?? ""),
    ) ?? studentTable.closest(".panel");
    let sidebar = studentPanel?.parentElement;
    let report = reportPanel?.parentElement;
    let layout;

    if (studentPanel && reportPanel && studentPanel !== reportPanel &&
        sidebar !== report && sidebar.parentElement === report.parentElement &&
        !sidebar.parentElement.closest("form")) {
      layout = sidebar.parentElement;
    } else {
      const form = table.closest("form");
      const wrapper = table.closest(".table-responsive");
      const reportBlock = form ?? (reportPanel && !reportPanel.contains(studentTable) ? reportPanel
        : wrapper && !wrapper.contains(studentTable) ? wrapper : table);
      const studentBlock = studentPanel && !studentPanel.contains(table) ? studentPanel : studentTable;
      const studentControls = [...studentBlock.querySelectorAll("input, select, textarea, button")]
        .map((control) => [control, control.form]);
      layout = document.createElement("div");
      sidebar = document.createElement("div");
      report = document.createElement("div");
      reportBlock.before(layout);
      layout.append(sidebar, report);
      sidebar.append(studentBlock);
      report.append(reportBlock);
      for (const [control, originalForm] of studentControls) {
        if (originalForm && control.form !== originalForm) {
          originalForm.id ||= "nitj-att-erp-form";
          control.setAttribute("form", originalForm.id);
        }
      }
    }

    layout.classList.add("nitj-att-layout");
    sidebar.classList.add("nitj-att-sidebar");
    report.classList.add("nitj-att-report");
    sidebar.append(overall, planner);
    layout.closest(".container")?.classList.add("nitj-att-container");

    for (const content of [studentTable, table, layout]) {
      for (let node = content.parentElement; node && node !== container && node !== document.body; node = node.parentElement) {
        node.classList.add("nitj-att-fit-content");
      }
    }
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
    const deficitBadges = [];
    const deficitHeader = header.cells[header.cells.length - 2];
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
      const td = document.createElement("td");
      td.setAttribute("align", "center");
      td.style.color = "#000000";
      td.style.fontFamily = "Verdana";
      td.style.fontSize = "12px";
      td.style.verticalAlign = "middle";
      const badge = document.createElement("span");
      badge.style.fontSize = "12px";
      deficitBadges.push({ badge, attended, delivered, wholeCounts });
      td.appendChild(badge);
      row.insertBefore(td, detailCell);
    }
    table.setAttribute("role", "table");
    table.classList.add("nitj-att-course-table");
    const columnLabels = [...header.cells].map((cell) => cell.textContent.trim());
    for (const row of rows) {
      row.setAttribute("role", "row");
      for (const [index, cell] of [...row.cells].entries()) {
        cell.setAttribute("role", cell.tagName === "TH" ? "columnheader" : "cell");
        if (row.cells.length === columnLabels.length) cell.dataset.label = columnLabels[index];
      }
    }
    function updateDeficits(target) {
      const label = target === null ? "Attendance Deficit" : `Attendance Deficit (${target}%)`;
      deficitHeader.textContent = label;
      for (const { badge, attended, delivered, wholeCounts } of deficitBadges) {
        const value = wholeCounts && target !== null ? calculateDeficit(attended, delivered, target) : null;
        badge.className = `label ${value === null || value === 0 ? "label-default" : value > 0 ? "label-success" : "label-danger"}`;
        badge.textContent = value ?? "—";
        badge.title = value !== null ? `${target}% attendance target`
          : target === 100 && wholeCounts && attended < delivered ? "A 100% target cannot be reached after a missed class."
            : target === null ? "Enter a valid attendance target in the planner." : "Attendance calculation unavailable.";
        badge.parentElement.dataset.label = label;
      }
    }
    updateDeficits(TARGET_PERCENT);
    const style = document.createElement("style");
    style.textContent = attendanceCss;
    document.head.append(style);

    const overall = createOverallCard(calculateAttendanceWaffle(subjectTotals));
    arrangeAttendancePage(studentTable, table, overall, createCalculator(subjects, updateDeficits));
    renderSummary(table, percentages);
    void loadAttendanceHistories(courses);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
