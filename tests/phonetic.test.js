import { test } from 'node:test';
import assert from 'node:assert/strict';
import { phonemesToDigits } from '../src/phonetic.js';

// Pronunciations as they appear in the CMU Pronouncing Dictionary.
const cases = [
  ['knife', 'N AY1 F', '28'],
  ['phone', 'F OW1 N', '82'],
  ['cherry', 'CH EH1 R IY0', '64'],
  ['mopper', 'M AA1 P ER0', '394'],
  ['imbiber', 'IH1 M B AY2 B ER0', '3994'],
  ['mop', 'M AA1 P', '39'],
  ['bear', 'B EH1 R', '94'],
  ['tie', 'T AY1', '1'],
  ['solarism', 'S OW1 L ER0 IH2 Z AH0 M', '05403'],
  ['sam', 'S AE1 M', '03'],
  ['slower', 'S L OW1 ER0', '054'],
  ['disease', 'D IH0 S IY1 Z', '100'],
  ['ax', 'AE1 K S', '70'],
  ['judge', 'JH AH1 JH', '66'],
  ['shoe', 'SH UW1', '6'],
  ['vision', 'V IH1 ZH AH0 N', '862'],
  ['when', 'W EH1 N', '2'],
  ['yes', 'Y EH1 S', '0'],
  ['hi', 'HH AY1', ''],
  ['thing-less th/dh ignored', 'TH DH', ''],
];

for (const [word, phonemes, digits] of cases) {
  test(`${word} -> "${digits}"`, () => {
    assert.equal(phonemesToDigits(phonemes.split(' ')), digits);
  });
}

test('accepts a pronunciation as a string', () => {
  assert.equal(phonemesToDigits('N AY1 F'), '28');
});

test('leading zeros are kept', () => {
  assert.equal(phonemesToDigits('S OW1 L ER0 IH2 Z AH0 M'), '05403');
  assert.notEqual(phonemesToDigits('S OW1 L ER0 IH2 Z AH0 M'), '5403');
});

test('NG defaults to 2 and is configurable', () => {
  const sing = ['S', 'IH1', 'NG'];
  assert.equal(phonemesToDigits(sing), '02');
  assert.equal(phonemesToDigits(sing, { ng: '27' }), '027');
  assert.equal(phonemesToDigits(sing, { ng: '' }), '0');
});

test('unknown phonemes are ignored', () => {
  assert.equal(phonemesToDigits(['T', 'XX', 'N']), '12');
});
