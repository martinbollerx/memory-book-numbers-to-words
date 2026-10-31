// Major System / Memory Book phonetic alphabet, applied to CMU Pronouncing
// Dictionary phonemes. The system is sound-based, so silent letters ("knife")
// disappear and "ph" counts as f ("phone") without any spelling rules.

const PHONEME_DIGITS = {
  S: '0', Z: '0',
  T: '1', D: '1', TH: '1', DH: '1', // th as in "thing" and "this"
  N: '2',
  M: '3',
  R: '4', ER: '4',
  L: '5',
  JH: '6', SH: '6', CH: '6', ZH: '6',
  K: '7', G: '7',
  F: '8', V: '8',
  P: '9', B: '9',
};

// "NG" (as in "sing") is ambiguous in the system: n alone, or n + g.
// Configurable through the `ng` option; defaults to '2'.
export const DEFAULT_OPTIONS = { ng: '2' };

export function phonemesToDigits(phonemes, options = {}) {
  const { ng } = { ...DEFAULT_OPTIONS, ...options };
  const list = typeof phonemes === 'string' ? phonemes.trim().split(/\s+/) : phonemes;
  let digits = '';
  for (const raw of list) {
    const phoneme = raw.replace(/\d/g, ''); // strip stress markers (ER0, AH1, ...)
    if (phoneme === 'NG') digits += ng;
    else digits += PHONEME_DIGITS[phoneme] ?? '';
  }
  return digits;
}

// What a beginner would get by reading the letters with the rules on the page
// (ph = f, ch = sh = j, th = t, soft/hard c and g, double letters count once,
// vowels and w, h, y are skipped). When this differs from the real sound digits,
// the word is "tricky": a silent letter ("knife"), "gh" ("night"), "ti" ("action").
const LETTER_DIGITS = {
  s: '0', z: '0', t: '1', d: '1', n: '2', m: '3', r: '4', l: '5', j: '6',
  k: '7', q: '7', f: '8', v: '8', p: '9', b: '9',
};
const DIGRAPHS = { ch: '6', sh: '6', ph: '8', th: '1' };

export function spellingDigits(word) {
  const w = word.toLowerCase().replace(/(.)\1/g, '$1').replace(/ck/g, 'k'); // double letters count once
  let digits = '';
  for (let i = 0; i < w.length; i++) {
    const letter = w[i];
    const next = w[i + 1] ?? '';
    if (DIGRAPHS[letter + next]) { digits += DIGRAPHS[letter + next]; i++; continue; }
    if (letter === 'c') digits += 'eiy'.includes(next) && next ? '0' : '7';
    else if (letter === 'g') digits += 'eiy'.includes(next) && next ? '6' : '7';
    else if (letter === 'x') digits += '70';
    else digits += LETTER_DIGITS[letter] ?? '';
  }
  return digits;
}

export function isTricky(word, soundDigits) {
  return spellingDigits(word) !== soundDigits;
}
