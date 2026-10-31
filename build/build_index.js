// Turns build/words.json (from export_words.py) into data/index.json:
//   { "<digit string>": [[word, zipf], ...] }  sorted by frequency, most common first.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { phonemesToDigits, isTricky } from '../src/phonetic.js';

const MIN_ZIPF = 2.0;          // drop very rare words
const MAX_PER_DIGITS = 60;     // keep the index small
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const words = JSON.parse(readFileSync(join(root, 'build', 'words.json'), 'utf8'));

// Extra ways to say a word that the dictionary lacks, e.g. "anesthesia" with a plain z.
const variants = JSON.parse(readFileSync(join(root, 'build', 'extra_variants.json'), 'utf8'));
for (const row of words) if (Object.hasOwn(variants, row.w)) row.p.push(...variants[row.w]);

// The book's peg words stay in the index even past the per-digit cap.
const pegs = {
  ...JSON.parse(readFileSync(join(root, 'data', 'pegs.json'), 'utf8')),
  ...JSON.parse(readFileSync(join(root, 'data', 'pegs_zero.json'), 'utf8')),
};
const forced = new Set(Object.values(pegs).flatMap((p) => p.toLowerCase().split(' ')));

// Function words and acronyms are frequent but make poor memory pictures.
const blockedLists = JSON.parse(readFileSync(join(root, 'build', 'blocked_words.json'), 'utf8'));
const blocked = new Set(Object.values(blockedLists).flat());

// How easy a word is to picture (1 abstract .. 5 concrete), from build/export_ratings.py.
// Names, places and rare words are not rated, so they get a low default.
const concreteness = JSON.parse(readFileSync(join(root, 'build', 'concreteness.json'), 'utf8'));
const UNRATED = 2.3;
const MAX_ZIPF = 4.5;          // very common words should not outrank better picture words
const PICTURE_WEIGHT = 1.2;    // how much one concreteness point is worth, in zipf points
const TRICKY_PENALTY = 1.5;    // words whose spelling does not match their sound come later

// Combined score: how common the word is plus how easy it is to picture.
// Only this score ends up in data/index.json, not the ratings themselves.
// Tricky words (silent letters etc.) lose TRICKY_PENALTY so beginners see easy ones first.
// The book's peg words are not penalised, for being unrated or for being tricky.
const score = (w, z, tricky) => {
  const picture = PICTURE_WEIGHT * ((concreteness[w] ?? (forced.has(w) ? 3 : UNRATED)) - 3);
  const penalty = tricky && !forced.has(w) ? TRICKY_PENALTY : 0;
  return Math.round((Math.min(z, MAX_ZIPF) + picture - penalty) * 100) / 100;
};

const index = {};
for (const { w, z, p } of words) {
  if (blocked.has(w) && !forced.has(w)) continue;
  if (w.length < 2) continue;                      // spelled-out letters ("b", "c") make bad pegs
  if (z < MIN_ZIPF && !forced.has(w)) continue;
  const seen = new Set();
  for (const pronunciation of p) {
    const digits = phonemesToDigits(pronunciation);
    if (!digits || seen.has(digits)) continue;     // no consonant sounds = no number
    seen.add(digits);
    (index[digits] ??= []).push([w, score(w, z, isTricky(w, digits))]);
  }
}

const out = {};
let entries = 0;
for (const digits of Object.keys(index).sort()) {
  const list = index[digits].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  out[digits] = list.filter(([w], i) => i < MAX_PER_DIGITS || forced.has(w));
  entries += out[digits].length;
}

mkdirSync(join(root, 'data'), { recursive: true });
writeFileSync(join(root, 'data', 'index.json'), JSON.stringify(out));
console.log(`${Object.keys(out).length} digit strings, ${entries} words`);
