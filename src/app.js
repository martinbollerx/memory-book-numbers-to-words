import { suggest, normalizeNumber } from './suggest.js';

const KIND_LABELS = {
  word: 'One word',
  fewest: 'Fewest words',
  pegs: 'Book peg words',
};

const form = document.getElementById('form');
const input = document.getElementById('number');
const message = document.getElementById('message');
const results = document.getElementById('results');

// Relative URLs so this also works under a GitHub Pages sub-path.
const dataReady = Promise.all([
  fetch('data/index.json').then((r) => r.json()),
  fetch('data/pegs.json').then((r) => r.json()),
]);

function say(text, isError = false) {
  message.textContent = text;
  message.classList.toggle('error', isError);
}

function card(suggestion) {
  const li = document.createElement('li');
  li.className = 'card';

  const kind = document.createElement('p');
  kind.className = 'kind';
  kind.textContent = KIND_LABELS[suggestion.kind];

  const words = document.createElement('p');
  words.className = 'words';
  words.textContent = suggestion.parts.map((p) => p.word).join(' ');

  const breakdown = document.createElement('p');
  breakdown.className = 'breakdown';
  suggestion.parts.forEach((p, i) => {
    if (i) breakdown.append(' + ');
    const digits = document.createElement('span');
    digits.className = 'digits';
    digits.textContent = `(${p.digits})`;
    breakdown.append(`${p.word} `, digits);
  });

  li.append(kind, words, breakdown);
  return li;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  results.replaceChildren();

  const digits = normalizeNumber(input.value);
  if (!input.value.trim()) return say('Type a number first.', true);
  if (!digits) return say('Digits only, please (spaces and dashes are fine).', true);

  say('Searching…');
  let index, pegs;
  try {
    [index, pegs] = await dataReady;
  } catch {
    return say('Could not load the word list. Please reload the page.', true);
  }

  const found = suggest(digits, index, pegs, { limit: 3 });
  if (!found.length) return say(`No words found for ${digits}.`, true);
  say('');
  results.append(...found.map(card));
});
