const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

function parseLectureDate(text) {
  const parts = /^(\d{1,2})-([a-z]{3,9}|\d{1,2})-(\d{4}|\d{2})$/i.exec(text);
  if (!parts) return null;

  const [, dayText, monthText, yearText] = parts;
  const day = Number(dayText);
  const monthName = monthText.toLowerCase();
  const month = /^\d+$/.test(monthText)
    ? Number(monthText) - 1
    : MONTHS.findIndex((name) => name.startsWith(monthName));
  const parsedYear = Number(yearText);
  const year = yearText.length === 2
    ? parsedYear + (parsedYear < 50 ? 2000 : 1900)
    : parsedYear;
  const date = new Date(Date.UTC(year, month, day));

  const matchesDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month &&
    date.getUTCDate() === day;
  return matchesDate ? date : null;
}

function getClassStart(text) {
  const match = text.match(/\b(0?[1-9]|1[0-2]):([0-5]\d)\s*([AP]M)\b/i);
  if (!match) return null;
  const [, hour, minute, period] = match;
  return (Number(hour) % 12) * 60 + Number(minute) +
    (period.toUpperCase() === "PM" ? 720 : 0);
}

export function readAttendanceLectures(panel) {
  const table =
    panel?.querySelector("table.table-bordered.table-striped") ||
    panel?.querySelector("table.table-striped") ||
    panel?.querySelectorAll("table")[1];
  if (!table) return null;

  const headers = table.querySelectorAll("thead tr th");
  const cells = table.querySelectorAll("tbody tr:first-child td");
  const topics = table.querySelectorAll("tbody tr:nth-child(2) td");
  const lectures = [];

  for (let index = 1; index < headers.length; index++) {
    const header = headers[index];
    const dateText = header.querySelector(".label-primary")?.textContent.trim() ?? "";
    const date = parseLectureDate(dateText);
    if (!date) continue;

    const attendance = cells[index - 1];
    const status = attendance?.querySelector(".label-success")
      ? "P"
      : attendance?.querySelector(".label-danger")
        ? "A"
        : "?";
    const type = header.querySelector("b")?.textContent.trim() ?? "";
    const topic = topics[index - 1]?.textContent.replace(/\s+/g, " ").trim() ?? "";
    const startTime = getClassStart(header.innerText || header.textContent);
    lectures.push({ date, startTime, status, type, topic });
  }

  return lectures;
}
