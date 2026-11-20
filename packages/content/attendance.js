import {
  calculateAttendanceWaffle,
  calculateDeficit,
  calculateScenario,
  TARGET_PERCENT,
} from "../core/attendance.mjs";
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

  function run() {
    if (window.location.pathname.includes("attendance_report_detail")) return;
    const [studentTable, table] = document.querySelectorAll(".panel-body table.table");
    if (!table) return;
    const rows = table.querySelectorAll("tr");
    if (!rows.length) return;
    if (rows[0].innerText.includes("Attendance Deficit")) return;
    const th = document.createElement("th");
    th.textContent = "Attendance Deficit";
    th.style.fontFamily = "Verdana";
    th.style.fontSize = "11px";
    th.style.textAlign = "center";
    rows[0].insertBefore(th, rows[0].children[rows[0].children.length - 1]);
    const subjects = [];
    const subjectTotals = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const cols = row.querySelectorAll("td");
      const code = cols[0]?.textContent.trim();
      const title = cols[1]?.textContent.trim();
      const isSubject = (code || title) && cols[0].colSpan === 1 && !row.closest("tfoot");
      if (cols.length < 6) {
        if (isSubject) subjectTotals.push(null);
        continue;
      }
      const deliveredText = cols[2].innerText.trim();
      const attendedText = cols[3].innerText.trim();
      const delivered = parseInt(deliveredText);
      const attended = parseInt(attendedText);
      if (isSubject) {
        const wholeCount = /^\d+$/;
        subjectTotals.push(wholeCount.test(deliveredText) && wholeCount.test(attendedText)
          ? { attended, delivered }
          : null);
      }
      const deficit = calculateDeficit(attended, delivered);
      if (deficit !== null && title) {
        subjects.push({ name: code ? `${title} (${code})` : title, attended, delivered });
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
      row.insertBefore(td, cols[cols.length - 1]);
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
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
