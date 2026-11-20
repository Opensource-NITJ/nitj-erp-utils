const SVG_NS = "http://www.w3.org/2000/svg";

function svgElement(tag, attributes) {
  const element = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value);
  }
  return element;
}

export function renderAttendanceBoxPlot(stats, formatter) {
  const { q1, median, q3 } = stats;
  const { lowerWhisker, upperWhisker, outliers } = stats.boxPlot;
  const width = 520;
  const inset = 22;
  const x = (percentage) => inset + (percentage / 100) * (width - 2 * inset);
  const percent = (percentage) => `${formatter.format(percentage)}%`;
  const lower = x(lowerWhisker);
  const upper = x(upperWhisker);
  const boxStart = x(q1);
  const boxEnd = x(q3);
  const center = x(median);
  const outlierCounts = new Map();
  for (const value of outliers) {
    outlierCounts.set(value, (outlierCounts.get(value) ?? 0) + 1);
  }

  const svg = svgElement("svg", {
    class: "nitj-attendance-boxplot",
    viewBox: `0 0 ${width} 70`,
    role: "img",
    "aria-label": `Attendance box plot. Q1 ${percent(q1)}, median ${percent(median)}, ` +
      `Q3 ${percent(q3)}, whiskers ${percent(lowerWhisker)} to ${percent(upperWhisker)}. ` +
      (outliers.length ? `Outliers at ${outliers.map(percent).join(", ")}.` : "No outliers."),
  });

  svg.append(
    svgElement("path", { class: "nitj-attendance-boxplot-whiskers", d: `M${lower} 22H${boxStart} M${boxEnd} 22H${upper}` }),
    svgElement("rect", { class: "nitj-attendance-boxplot-box", x: boxStart, y: 11, width: boxEnd - boxStart, height: 22 }),
    svgElement("path", { class: "nitj-attendance-boxplot-whiskers", d: `M${lower} 15V29 M${upper} 15V29` }),
    svgElement("line", { class: "nitj-attendance-boxplot-median", x1: center, x2: center, y1: 10, y2: 34 }),
  );

  for (const [value, count] of outlierCounts) {
    const dot = svgElement("circle", { class: "nitj-attendance-boxplot-outlier", cx: x(value), cy: 22, r: 4 });
    const tooltip = svgElement("title", {});
    tooltip.textContent = `${percent(value)} · ${count} ${count === 1 ? "course" : "courses"}`;
    dot.appendChild(tooltip);
    svg.appendChild(dot);
  }

  svg.appendChild(svgElement("line", { class: "nitj-attendance-boxplot-axis", x1: x(0), x2: x(100), y1: 44, y2: 44 }));
  for (const value of [0, 25, 50, 75, 100]) {
    const position = x(value);
    const label = svgElement("text", { x: position, y: 64, "text-anchor": "middle" });
    label.textContent = `${value}%`;
    svg.append(
      svgElement("line", { class: "nitj-attendance-boxplot-axis", x1: position, x2: position, y1: 44, y2: 49 }),
      label,
    );
  }

  const figure = document.createElement("figure");
  figure.className = "nitj-attendance-boxplot-figure";
  const caption = document.createElement("figcaption");
  caption.textContent = "Whiskers use the 1.5×IQR rule." + (outliers.length ? " Dots mark outliers." : "");
  figure.append(svg, caption);
  return figure;
}
