// Turns build/words.json (from export_words.py) into data/index.json:
//   { "<digit string>": [[word, zipf], ...] }  sorted by frequency, most common first.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { phonemesToDigits } from '../src/phonetic.js';

const MIN_ZIPF = 2.0;          // drop very rare words
const MAX_PER_DIGITS = 60;     // keep the index small
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const extras = JSON.parse(readFileSync(join(root, 'build', 'extra_pronunciations.json'), 'utf8'));
const words = JSON.parse(readFileSync(join(root, 'build', 'words.json'), 'utf8'));

// Peg words and the spec's test words stay in the index even past the per-digit cap.
const pegs = JSON.parse(readFileSync(join(root, 'data', 'pegs.json'), 'utf8'));
const forced = new Set([
  ...Object.values(pegs).flatMap((p) => p.toLowerCase().split(' ')),
  ...JSON.parse(readFileSync(join(root, 'build', 'forced_words.json'), 'utf8')),
]);

// Function words and acronyms are frequent but make poor memory pictures.
const blockedLists = JSON.parse(readFileSync(join(root, 'build', 'blocked_words.json'), 'utf8'));
const blocked = new Set(Object.values(blockedLists).flat());

const index = {};
for (const { w, z, p } of words) {
  if (blocked.has(w) && !forced.has(w)) continue;
  if (w.length < 2) continue;                      // spelled-out letters ("b", "c") make bad pegs
  if (z < MIN_ZIPF && !(w in extras)) continue;
  const seen = new Set();
  for (const pronunciation of p) {
    const digits = phonemesToDigits(pronunciation);
    if (!digits || seen.has(digits)) continue;     // no consonant sounds = no number
    seen.add(digits);
    (index[digits] ??= []).push([w, z]);
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
