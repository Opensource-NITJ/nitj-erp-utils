function calculateDeficit(attended, delivered, target = 0.75) {
  let value = 0;

  if (attended / delivered >= target) {
    while (attended / (delivered + value + 1) >= target) {
      value++;
    }
  } else {
    while ((attended + value) / (delivered + value) < target) {
      value++;
    }
    value = -value;
  }

  return value;
}

module.exports = { calculateDeficit };
