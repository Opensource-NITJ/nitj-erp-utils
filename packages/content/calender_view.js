(function () {
  const STORAGE_KEY = "nitj-att-calendar-view";

  function shouldRun() {
    return (
      window.location.href.includes("attendance_report_detail.php") ||
      document.title.includes("Attendance Report")
    );
  }

  function getSavedView() {
    try {
      return localStorage.getItem(STORAGE_KEY) || "calendar";
    } catch {
      return "calendar";
    }
  }

  function saveView(view) {
    try {
      localStorage.setItem(STORAGE_KEY, view);
    } catch {}
  }

  function getSemesterInfo(label) {
    const text = (label || "").toLowerCase();
    const firstHalf = text.includes("january-june");
    const secondHalf = text.includes("july to december");
    const yearMatch = label?.match(/20\d{2}/g);
    const fallbackYear = new Date().getFullYear();
    const year = yearMatch
      ? Number(yearMatch[yearMatch.length - 1])
      : fallbackYear;

    return {
      label:
        label ||
        (firstHalf
          ? `January-June ${year}`
          : secondHalf
            ? `July to December ${year}`
            : `${year}`),
      monthRange: firstHalf
        ? [0, 1, 2, 3, 4, 5]
        : secondHalf
          ? [6, 7, 8, 9, 10, 11]
          : null,
    };
  }

  function setView(view) {
    const calendar = document.getElementById("nitj-att-calendar");
    const toggle = document.getElementById("nitj-view-toggle");
    if (!calendar || !toggle) return;

    const isCalendar = view === "calendar";
    calendar.hidden = !isCalendar;
    toggle.textContent = isCalendar ? "Normal view" : "Calendar view";
    toggle.setAttribute("aria-pressed", isCalendar ? "true" : "false");
    saveView(view);
  }

  function injectCalendar() {
    if (document.getElementById("nitj-att-calendar")) return true;

    const panel = document.querySelector(".panel-body");
    if (!panel) return false;

    // ── 1. SCRAPE DATA ───────────────────────────────────────────
    const detailTable =
      panel.querySelector("table.table-bordered.table-striped") ||
      panel.querySelector("table.table-striped") ||
      panel.querySelectorAll("table")[1];
    if (!detailTable) return false;

    const headers = [...detailTable.querySelectorAll("thead tr th")];
    const cells = [...detailTable.querySelectorAll("tbody tr:first-child td")];
    const topicCells = [
      ...detailTable.querySelectorAll("tbody tr:nth-child(2) td"),
    ];

    const classes = [];
    for (let i = 1; i < headers.length - 3; i++) {
      const hdr = headers[i];
      const dateText =
        hdr.querySelector(".label-primary")?.textContent.trim() ?? "";
      const typeText = hdr.querySelector("b")?.textContent.trim() ?? "";
      const cell = cells[i - 1];
      const status = cell?.querySelector(".label-success")
        ? "P"
        : cell?.querySelector(".label-danger")
          ? "A"
          : "?";
      const topic =
        topicCells[i - 1]?.textContent.replace(/\s+/g, " ").trim() ?? "";
      if (dateText)
        classes.push({ date: dateText, type: typeText, status, topic });
    }

    const attended =
      parseInt(
        document.querySelector(".label-primary[style*='14px']")?.textContent,
      ) || 0;
    const delivered =
      parseInt(
        document.querySelector(".label-default[style*='14px']")?.textContent,
      ) || 0;
    const pct = delivered > 0 ? Math.round((attended / delivered) * 100) : 0;

    const semesterCell =
      panel.querySelector("table tbody tr td:nth-child(1)") ?? null;
    const anchor = semesterCell?.closest("div") ?? panel.firstElementChild;
    if (!anchor) return false;

    // ── 2. GROUP BY MONTH ────────────────────────────────────────
    function parseDate(str) {
      const [d, m, y] = str.split("-");
      return new Date(`${m} ${d} ${y}`);
    }

    const months = {};
    classes.forEach((c) => {
      const dt = parseDate(c.date);
      const key = `${dt.getFullYear()}-${dt.getMonth()}`;
      if (!months[key])
        months[key] = {
          year: dt.getFullYear(),
          month: dt.getMonth(),
          days: {},
        };
      const day = dt.getDate();
      if (!months[key].days[day]) months[key].days[day] = [];
      months[key].days[day].push(c);
    });

    const MONTH_NAMES = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    // ── 3. BUILD MONTH ───────────────────────────────────────────
    function buildMonth(year, month, daysMap) {
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      let html = `<div class="nitj-cal-month">
        <div class="nitj-cal-month-title">${MONTH_NAMES[month]} ${year}</div>
        <div class="nitj-cal-dow-row">${DAY_NAMES.map((d) => `<span>${d}</span>`).join("")}</div>
        <div class="nitj-cal-grid">`;

      for (let i = 0; i < firstDay; i++)
        html += `<div class="nitj-cal-empty"></div>`;

      for (let d = 1; d <= daysInMonth; d++) {
        const cls = daysMap[d];
        let cellClass = "nitj-cal-day";
        let dot = "";
        let tooltip = "";

        if (cls) {
          const total = cls.length;
          const pCount = cls.filter((c) => c.status === "P").length;
          const ratio = pCount / total;

          // Intensity shading: GitHub contribution graph style
          if (ratio === 1) {
            cellClass += " nitj-heat-p4"; // 100% attended (e.g. 4/4, 1/1) - deep green
          } else if (ratio >= 0.6) {
            cellClass += " nitj-heat-p3"; // 60-99% attended (e.g. 3/4) - lighter green
          } else if (ratio >= 0.4) {
            cellClass += " nitj-heat-mid"; // 40-59% attended (e.g. 2/4, 1/2) - amber / mixed
          } else if (ratio > 0) {
            cellClass += " nitj-heat-a3"; // 1-39% attended (e.g. 1/4) - light red
          } else {
            cellClass += " nitj-heat-a4"; // 0% attended (e.g. 0/4, 0/1) - deep red
          }

          dot =
            cls.length > 1
              ? `<span class="nitj-multi">${cls.length}</span>`
              : "";

          const summaryRow =
            cls.length > 1
              ? `<div class="nitj-tt-summary">${pCount}/${total} attended (${Math.round(ratio * 100)}%)</div>`
              : "";

          const rows = cls
            .map(
              (c) => `
            <span class="nitj-tt-row">
              <span class="nitj-tt-topic ${c.status === "P" ? "nitj-tt-p" : c.status === "A" ? "nitj-tt-a" : ""}">${c.topic || c.type}</span>
            </span>`,
            )
            .join("");
          tooltip = `<div class="nitj-tooltip">${summaryRow}${rows}</div>`;
        }

        html += `<div class="${cellClass}">${d}${dot}${tooltip}</div>`;
      }

      html += `</div></div>`;
      return html;
    }

    // ── 4. INJECT CSS ────────────────────────────────────────────
    if (!document.getElementById("nitj-cal-styles")) {
      const style = document.createElement("style");
      style.id = "nitj-cal-styles";
      style.textContent = `
        #nitj-att-calendar {
          background: var(--bg-panel, #111E30);
          color: var(--text-primary, #E2EAF4);
          border: 1px solid var(--border, #1F3352);
          border-radius: 10px;
          padding: 16px;
          margin: 16px 0;
          font-family: inherit;
        }
        .nitj-cal-header {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 15px; font-weight: bold; margin-bottom: 10px;
          color: var(--text-primary, #E2EAF4);
        }
        .nitj-cal-toolbar {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          margin-bottom: 10px;
        }
        .nitj-term-label {
          font-size: 12px; font-weight: normal;
          color: var(--text-secondary, #94A8C0); margin-left: 10px;
        }
        .nitj-pct { font-size: 18px; font-weight: bold; }
        .nitj-pct-ok   { color: var(--success, #10B981); }
        .nitj-pct-warn { color: var(--warning, #F59E0B); }
        .nitj-view-toggle {
          border: 1px solid var(--border-strong, #2A4570);
          background: var(--bg-raised, #162436);
          color: var(--text-primary, #E2EAF4);
          border-radius: 999px; padding: 6px 12px; font-size: 12px;
          cursor: pointer; font-family: inherit;
        }
        .nitj-view-toggle:hover { background: var(--bg-hover, #1C2E44); }
        .nitj-cal-stats {
          display: flex; gap: 14px; flex-wrap: wrap; align-items: center;
          font-size: 12px; color: var(--text-secondary, #94A8C0); margin-bottom: 14px;
        }
        .nitj-cal-stats b { color: var(--text-primary, #E2EAF4); }
        .nitj-legend-scale {
          display: flex; align-items: center; gap: 4px;
          margin-left: auto; font-size: 11px;
        }
        .nitj-scale-box {
          width: 12px; height: 12px; border-radius: 2px; display: inline-block;
        }
        .nitj-cal-months {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
        }
        .nitj-cal-month {
          background: var(--bg-raised, #162436);
          border: 1px solid var(--border, #1F3352);
          border-radius: 8px; padding: 10px;
        }
        .nitj-cal-month-title {
          font-size: 13px; font-weight: bold; color: var(--accent-blue, #3B82F6);
          text-align: center; margin-bottom: 8px;
        }
        .nitj-cal-dow-row {
          display: grid; grid-template-columns: repeat(7, 1fr);
          font-size: 10px; color: var(--text-muted, #5A7A99);
          text-align: center; margin-bottom: 4px;
        }
        .nitj-cal-grid {
          display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px;
        }
        .nitj-cal-day, .nitj-cal-empty {
          height: 26px; border-radius: 4px;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; position: relative; overflow: visible;
        }
        .nitj-cal-day {
          color: var(--text-secondary, #94A8C0);
          background: var(--bg-input, #0F1E30);
          transition: transform 0.1s ease;
        }
        .nitj-cal-day:hover {
          z-index: 10;
        }
        .nitj-heat-p4 { background: rgba(16,185,129,0.45) !important; border: 1px solid rgba(16,185,129,0.55) !important; color: #ECFDF5 !important; font-weight: bold; }
        .nitj-heat-p3 { background: rgba(16,185,129,0.22) !important; border: 1px solid rgba(16,185,129,0.32) !important; color: #A7F3D0 !important; font-weight: bold; }
        .nitj-heat-mid { background: rgba(245,158,11,0.24) !important; border: 1px solid rgba(245,158,11,0.38) !important; color: #FDE68A !important; font-weight: bold; }
        .nitj-heat-a3 { background: rgba(239,68,68,0.22)  !important; border: 1px solid rgba(239,68,68,0.32)  !important; color: #FECACA !important; font-weight: bold; }
        .nitj-heat-a4 { background: rgba(239,68,68,0.45)  !important; border: 1px solid rgba(239,68,68,0.55)  !important; color: #FEE2E2 !important; font-weight: bold; }
        .nitj-p     { background: rgba(16,185,129,0.45) !important; color: #ECFDF5 !important; font-weight: bold; }
        .nitj-a     { background: rgba(239,68,68,0.45)  !important; color: #FEE2E2 !important; font-weight: bold; }
        .nitj-mixed { background: rgba(245,158,11,0.24) !important; color: #FDE68A !important; font-weight: bold; }
        .nitj-multi {
          position: absolute; top: 1px; right: 2px;
          font-size: 8px; opacity: 0.75; line-height: 1;
        }

        /* ── Tooltip ─────────────────────────────────────────── */
        .nitj-tooltip {
          display: none;
          position: absolute;
          bottom: calc(100% + 6px);
          left: 50%;
          transform: translateX(-50%);
background: #0d1b2a;
          border: 1px solid #2A4570;
          border-radius: 6px;
          padding: 7px 10px;
          min-width: 150px;
          max-width: 220px;
          z-index: 9999;
          pointer-events: none;
          box-shadow: 0 4px 16px rgba(0,0,0,0.5);
          flex-direction: column;
          gap: 5px;
        }
        .nitj-cal-day:hover .nitj-tooltip { display: flex; }
        .nitj-tt-summary {
          font-size: 11px; font-weight: 600; color: #E2EAF4;
          padding-bottom: 4px; border-bottom: 1px solid #1F3352; margin-bottom: 3px;
        }
        .nitj-tt-row { display: flex; flex-direction: column; gap: 2px; }
        .nitj-tt-row + .nitj-tt-row { border-top: 1px solid #1F3352; padding-top: 5px; }
        .nitj-tt-topic { font-size: 11px; color: #E2EAF4; line-height: 1.4; }
        .nitj-tt-topic.nitj-tt-p { color: var(--success, #10B981) !important; font-weight: 500; }
        .nitj-tt-topic.nitj-tt-a { color: var(--danger, #EF4444) !important; font-weight: 500; }

        #nitj-view-controls { margin: 16px 0 10px; }
        #nitj-view-controls, #nitj-att-calendar { color: var(--text-primary, #E2EAF4); }
      `;
      document.head.appendChild(style);
    }

    // ── 5. RENDER ────────────────────────────────────────────────
    const semesterLabel = semesterCell?.textContent.trim() || "";
    const semesterInfo = getSemesterInfo(semesterLabel);

    const renderedMonths = Object.values(months)
      .filter((m) =>
        semesterInfo.monthRange
          ? semesterInfo.monthRange.includes(m.month)
          : true,
      )
      .sort((a, b) => a.year - b.year || a.month - b.month);

    const shellHTML = `
      <div id="nitj-calendar-shell">
        <div id="nitj-view-controls">
          <div class="nitj-cal-toolbar">
            <div class="nitj-cal-header">
              <span class="nitj-pct ${pct >= 75 ? "nitj-pct-ok" : "nitj-pct-warn"}">${pct}%</span>
              <span class="nitj-term-label">${semesterInfo.label}</span>
            </div>
            <button id="nitj-view-toggle" type="button" class="nitj-view-toggle" aria-pressed="true">
              Normal view
            </button>
          </div>
        </div>
        <div id="nitj-att-calendar" hidden>
          <div class="nitj-cal-stats">
            <span>Total classes: <b>${delivered}</b></span>
            <span>Attended: <b>${attended}</b></span>
            <span>Absent: <b>${delivered - attended}</b></span>
            <div class="nitj-legend-scale" title="Attendance Intensity Scale">
              <span>0%</span>
              <span class="nitj-scale-box nitj-heat-a4" title="0% attended"></span>
              <span class="nitj-scale-box nitj-heat-a3" title="~25% attended"></span>
              <span class="nitj-scale-box nitj-heat-mid" title="50% attended"></span>
              <span class="nitj-scale-box nitj-heat-p3" title="~75% attended"></span>
              <span class="nitj-scale-box nitj-heat-p4" title="100% attended"></span>
              <span>100%</span>
            </div>
          </div>
          <div class="nitj-cal-months">
            ${renderedMonths.map((m) => buildMonth(m.year, m.month, m.days)).join("")}
          </div>
        </div>
      </div>`;

    anchor.insertAdjacentHTML("afterend", shellHTML);

    const toggle = document.getElementById("nitj-view-toggle");
    if (toggle && !toggle.dataset.bound) {
      toggle.dataset.bound = "true";
      toggle.addEventListener("click", () => {
        const nextView =
          document.getElementById("nitj-att-calendar")?.hidden === true
            ? "calendar"
            : "normal";
        setView(nextView);
      });
    }

    setView(getSavedView());
    return true;
  }

  function boot() {
    if (!shouldRun()) return;
    if (injectCalendar()) return;

    const observer = new MutationObserver(() => {
      if (injectCalendar()) observer.disconnect();
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
