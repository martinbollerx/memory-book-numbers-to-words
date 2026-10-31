import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spellingDigits, isTricky, phonemesToDigits } from '../src/phonetic.js';

// [word, pronunciation, tricky?]
const cases = [
  // easy: reading the letters with the rules on the page gives the right digits
  ['mountain', 'M AW1 N T AH0 N', false],
  ['mop', 'M AA1 P', false],
  ['bear', 'B EH1 R', false],
  ['phone', 'F OW1 N', false],   // "ph" is in the table
  ['cherry', 'CH EH1 R IY0', false], // "ch" is in the table
  ['mopper', 'M AA1 P ER0', false],  // double letters count once
  ['table', 'T EY1 B AH0 L', false],
  ['book', 'B UH1 K', false],
  // tricky: silent letters and spellings that sound different
  ['knife', 'N AY1 F', true],
  ['night', 'N AY1 T', true],
  ['lamb', 'L AE1 M', true],
  ['action', 'AE1 K SH AH0 N', true],
  ['enough', 'IH0 N AH1 F', true],
];

for (const [word, pronunciation, tricky] of cases) {
  test(`${word} is ${tricky ? 'tricky' : 'easy'}`, () => {
    assert.equal(isTricky(word, phonemesToDigits(pronunciation)), tricky);
  });
}

test('spellingDigits follows the rules on the page', () => {
  assert.equal(spellingDigits('mountain'), '3212');
  assert.equal(spellingDigits('phone'), '82');
  assert.equal(spellingDigits('cheese'), '60');
  assert.equal(spellingDigits('city'), '01'); // soft c
  assert.equal(spellingDigits('cat'), '71');  // hard c
  assert.equal(spellingDigits('giant'), '621'); // soft g
  assert.equal(spellingDigits('goat'), '71');   // hard g
  assert.equal(spellingDigits('box'), '970');   // x is 70
  assert.equal(spellingDigits('knife'), '728'); // silent k is not known to a beginner
});
