// Turns a digit string into ranked word suggestions.
//   index: { "<digits>": [[word, score], ...] }  (data/index.json, best first; the score
//          combines how common a word is with how easy it is to picture)
//   pegs:  { "<number>": word }                 (data/pegs.json, the book's 1-100 list,
//                                                plus data/pegs_zero.json for 00-09)
//
// A suggestion is { kind, parts: [{ word, digits }] } where kind is
//   'word'    one word covering the whole number
//   'fewest'  the fewest words that cover the number (dynamic programming)
//   'pegs'    the book's peg words, two digits at a time

const WORDS_PER_SEGMENT = 8;   // candidates tried per digit segment in the DP
const SINGLE_DIGIT_PENALTY = 1; // one-digit words are weak pictures
const MAX_SEGMENT = 12;        // longest digit run a single word may cover

export function normalizeNumber(input) {
  const digits = String(input).replace(/[\s\-.,_]/g, '');
  if (!/^\d+$/.test(digits)) return null;
  return digits;
}

export function suggest(number, index, pegs, { limit = 3 } = {}) {
  const digits = normalizeNumber(number);
  if (!digits) return [];

  const groups = [
    wholeWords(digits, index, pegs),
    fewestWords(digits, index, Math.max(40, limit * 3)),
    pegCombos(digits, index, pegs),
  ];

  // Pass 1 takes at most 2 per kind so each strategy gets a say. Passes 1 and 2
  // skip suggestions that reuse a word (or one starting the same, like
  // "power" and "powers") from an earlier pick, so the choices look different.
  // Pass 3 fills any remaining slots without that rule.
  const result = [];
  const seen = new Set();
  const stems = new Set();
  const stemsOf = (s) => s.parts.map((p) => p.word.toLowerCase().slice(0, 4));
  const add = (s, requireDifferent) => {
    const key = s.parts.map((p) => p.word.toLowerCase()).join(' ');
    if (seen.has(key) || result.length >= limit) return false;
    if (requireDifferent && stemsOf(s).some((x) => stems.has(x))) return false;
    seen.add(key);
    stemsOf(s).forEach((x) => stems.add(x));
    result.push(s);
    return true;
  };
  for (const group of groups) {
    let taken = 0;
    for (const s of group) {
      if (taken >= 2) break;
      if (add(s, true)) taken++;
    }
  }
  for (const group of groups) for (const s of group) add(s, true);
  for (const group of groups) for (const s of group) add(s, false);
  return result;
}

function wholeWords(digits, index, pegs) {
  const words = (index[digits] ?? []).map(([word]) => word);
  // For 1-100 the book's own peg word comes first.
  const peg = pegs[digits];
  if (peg) words.unshift(peg);
  return words.map((word) => ({ kind: 'word', parts: [{ word, digits }] }));
}

// K-best dynamic programming over all splits: fewest words first, then the
// most common words.
function fewestWords(digits, index, k) {
  const n = digits.length;
  const best = Array.from({ length: n + 1 }, () => []);
  best[0] = [{ parts: [], score: 0 }];

  for (let i = 1; i <= n; i++) {
    const found = [];
    for (let j = Math.max(0, i - MAX_SEGMENT); j < i; j++) {
      if (!best[j].length) continue;
      const segment = digits.slice(j, i);
      const words = (index[segment] ?? []).slice(0, WORDS_PER_SEGMENT);
      for (const [word, score] of words) {
        for (const prev of best[j]) {
          found.push({ parts: [...prev.parts, { word, digits: segment }], score: prev.score + score - (segment.length === 1 ? SINGLE_DIGIT_PENALTY : 0) });
        }
      }
    }
    found.sort((a, b) => a.parts.length - b.parts.length || b.score / b.parts.length - a.score / a.parts.length);
    best[i] = found.slice(0, k);
  }
  // A single word is already covered by wholeWords
  return best[n].filter((c) => c.parts.length > 1).map((c) => ({ kind: 'fewest', parts: c.parts }));
}

// Pegs for each two-digit pair; an odd leftover digit goes at the end or the
// start (both are tried). Pairs without a peg (e.g. "05") fall back to the
// most common word for those digits.
function pegCombos(digits, index, pegs) {
  const results = [];
  const variants = digits.length % 2 === 1 ? [[1, 'start'], [1, 'end']] : [[0, 'none']];
  for (const [, where] of variants) {
    const chunks = [];
    let rest = digits;
    if (where === 'start') { chunks.push(rest[0]); rest = rest.slice(1); }
    for (let i = 0; i < rest.length; i += 2) chunks.push(rest.slice(i, i + 2));
    // 'end' variant: the odd digit is the last one-digit chunk, already produced by the loop above

    let pegsUsed = 0;
    const parts = [];
    let ok = true;
    for (const chunk of chunks) {
      const peg = pegs[chunk];
      if (peg) { parts.push({ word: peg, digits: chunk }); pegsUsed++; continue; }
      const fallback = index[chunk]?.[0];
      if (!fallback) { ok = false; break; }
      parts.push({ word: fallback[0], digits: chunk });
    }
    if (ok && pegsUsed > 0 && parts.length > 1) results.push({ kind: 'pegs', parts });
  }
  return results;
}
