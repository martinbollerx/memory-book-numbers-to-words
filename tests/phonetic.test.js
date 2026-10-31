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
  // th counts as 1 (voiceless as in "thing", voiced as in "this")
  ['thing', 'TH IH1 NG', '12'],
  ['this', 'DH IH1 S', '10'],
  ['both', 'B OW1 TH', '91'],
  ['birth', 'B ER1 TH', '941'],
  ['anesthesia', 'AE2 N IH0 S TH IY1 ZH AH0', '2016'],
  // examples from https://en.wikipedia.org/wiki/Mnemonic_major_system
  ['action', 'AE1 K SH AH0 N', '762'],
  ['muddy', 'M AH1 D IY0', '31'],
  ['midday', 'M IH1 D D EY2', '311'],
  ['accept', 'AH0 K S EH1 P T', '7091'],
  ['hindquarters', 'HH AY1 N D K AO2 R T ER0 Z', '2174140'],
  ['fax', 'F AE1 K S', '870'],
  ['exam', 'IH0 G Z AE1 M', '703'],
  ['pizza', 'P IY1 T S AH0', '910'],
  ['ghost', 'G OW1 S T', '701'],
  ['fear', 'F IH1 R', '84'],
  ['ring', 'R IH1 NG', '42'],
  ['finger', 'F IH1 NG G ER0', '8274'],
  ['meteor', 'M IY1 T IY0 ER0', '314'],
  ['tail', 'T EY1 L', '15'],
  ['pink', 'P IH1 NG K', '927'],
  ['call', 'K AO1 L', '75'],
  ['cell', 'S EH1 L', '05'],
  ['cello', 'CH EH1 L OW0', '65'],
  ['luxury', 'L AH1 G ZH ER0 IY0', '5764'],
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
