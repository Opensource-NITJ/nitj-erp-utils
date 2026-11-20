function quantile(sortedPercentages, fraction) {
  // Interpolate at the fractional index between adjacent observations.
  const index = (sortedPercentages.length - 1) * fraction;
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);

  return (
    sortedPercentages[lowerIndex] +
    (sortedPercentages[upperIndex] - sortedPercentages[lowerIndex]) *
      (index - lowerIndex)
  );
}

export function summarizeAttendance(percentages) {
  const count = percentages.length;
  if (count === 0) return null;

  const sorted = [...percentages].sort((a, b) => a - b);
  const q1 = quantile(sorted, 0.25);
  const q3 = quantile(sorted, 0.75);
  const iqr = q3 - q1;
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  const mean =
    percentages.reduce((sum, percentage) => sum + percentage, 0) / count;
  // The report describes all courses in view, so use population variance.
  const squaredDeviations = percentages.reduce(
    (sum, percentage) => sum + (percentage - mean) ** 2,
    0,
  );

  return {
    min: sorted[0],
    q1,
    median: quantile(sorted, 0.5),
    q3,
    max: sorted[count - 1],
    iqr,
    standardDeviation: Math.sqrt(squaredDeviations / count),
    boxPlot: {
      lowerWhisker: sorted.find((value) => value >= lowerFence),
      upperWhisker: sorted.findLast((value) => value <= upperFence),
      outliers: sorted.filter((value) => value < lowerFence || value > upperFence),
    },
  };
}
