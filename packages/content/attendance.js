(function () {
  //TODO: Somehow make this 0.73 for female students and 0.75 for male students.
  const TARGET = 0.75;
  function run() {
    if (window.location.pathname.includes("attendance_report_detail")) return;
    const tables = document.querySelectorAll(".panel-body table.table");
    if (tables.length < 2) return;
    const table = tables[1];
    const rows = table.querySelectorAll("tr");
    if (!rows.length) return;
    if (rows[0].innerText.includes("Attendance Deficit")) return;
    const th = document.createElement("th");
    th.textContent = "Attendance Deficit";
    th.style.fontFamily = "Verdana";
    th.style.fontSize = "11px";
    th.style.textAlign = "center";
    rows[0].insertBefore(th, rows[0].children[rows[0].children.length - 1]);
    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i].querySelectorAll("td");
      if (cols.length < 6) continue;
      const delivered = parseInt(cols[2].innerText);
      const attended = parseInt(cols[3].innerText);
      let value = 0;
      if (attended / delivered >= TARGET) {
        while (attended / (delivered + value + 1) >= TARGET) {
          value++;
        }
      } else {
        while ((attended + value) / (delivered + value) < TARGET) {
          value++;
        }
        value = -value;
      }
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
      rows[i].insertBefore(td, cols[cols.length - 1]);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
