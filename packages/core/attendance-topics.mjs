const STOP_WORDS = new Set(
  "a an and are as at be by for from has have in into is it of on or that the their this to was were will with".split(" "),
);
const MISSING_TOPIC = /^(?:n\s*\/\s*a|na|none|not (?:available|recorded|entered|updated))[.!]?$/;

export function countTopicWords(lectures) {
  const counts = new Map();
  for (const { topic } of lectures) {
    const text = topic.normalize("NFC").trim().toLowerCase();
    if (MISSING_TOPIC.test(text)) continue;

    for (const word of text.match(/[\p{L}\p{M}\p{N}]+(?:\+\+|#)?/gu) ?? []) {
      if (STOP_WORDS.has(word) || !/\p{L}/u.test(word)) continue;
      counts.set(word, (counts.get(word) ?? 0) + 1);
    }
  }

  return [...counts].sort(([a, aCount], [b, bCount]) => bCount - aCount || a.localeCompare(b, "en"));
}
