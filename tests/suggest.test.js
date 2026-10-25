import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { suggest, normalizeNumber } from '../src/suggest.js';

const load = (f) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), 'utf8'));
const index = load('index.json');
const pegs = load('pegs.json');

const phrases = (number, limit = 100) =>
  suggest(number, index, pegs, { limit }).map((s) => s.parts.map((p) => p.word.toLowerCase()).join(' '));

test('3994 includes "mop bear"', () => {
  assert.ok(phrases('3994').includes('mop bear'));
});

test('05403 includes "solarism" and "slower sam"', () => {
  const found = phrases('05403');
  assert.ok(found.includes('solarism'), found.slice(0, 10).join(' | '));
  assert.ok(found.includes('slower sam'), found.slice(0, 10).join(' | '));
});

test('1989 has a two-word option', () => {
  const twoWord = suggest('1989', index, pegs, { limit: 100 }).filter((s) => s.parts.length === 2);
  assert.ok(twoWord.length > 0);
});

test('single words: 28 knife, 82 phone, 64 cherry, 394 mopper', () => {
  assert.ok(phrases('28').includes('knife'));
  assert.ok(phrases('82').includes('phone'));
  assert.ok(phrases('64').includes('cherry'));
  assert.ok(phrases('394').includes('mopper'));
});

test('leading zeros matter', () => {
  assert.notDeepEqual(phrases('05403'), phrases('5403'));
});

test('returns exactly 3 suggestions by default', () => {
  assert.equal(suggest('3994', index, pegs).length, 3);
  assert.equal(suggest('28', index, pegs).length, 3);
});

test('every part spells its digits', () => {
  // words may have several pronunciations, so check against the index itself
  for (const s of suggest('7316408', index, pegs, { limit: 20 })) {
    assert.equal(s.parts.map((p) => p.digits).join(''), '7316408');
  }
});

test('input is normalised, invalid input gives nothing', () => {
  assert.equal(normalizeNumber('555-1234'), '5551234');
  assert.equal(normalizeNumber('12a'), null);
  assert.deepEqual(suggest('', index, pegs), []);
  assert.deepEqual(suggest('abc', index, pegs), []);
});

test('each peg word maps to its own number', () => {
  const reverse = new Map();
  for (const [digits, list] of Object.entries(index)) {
    for (const [w] of list) (reverse.get(w) ?? reverse.set(w, new Set()).get(w)).add(digits);
  }
  const bad = [];
  for (const [number, peg] of Object.entries(pegs)) {
    const words = peg.toLowerCase().split(' ');
    // all single- or two-word combinations of pronunciations
    let options = [''];
    for (const w of words) {
      const d = [...(reverse.get(w) ?? [])];
      options = options.flatMap((o) => d.map((x) => o + x));
    }
    if (!options.includes(number)) bad.push(`${number}=${peg}`);
  }
  assert.deepEqual(bad, []);
});
