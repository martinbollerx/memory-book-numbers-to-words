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
