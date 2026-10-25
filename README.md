# Numbers to Words (Memory Book)

Type a number, get three word suggestions. Based on the phonetic alphabet from
*The Memory Book* by Harry Lorayne and Jerry Lucas, applied to sounds (via the CMU
Pronouncing Dictionary), not spelling: `knife` = 28, `phone` = 82.

Live: https://martinbollerx.github.io/memory-book-numbers-to-words

## Run and test

```
npm test              # unit tests
npm run serve         # http://localhost:8080
```

## Rebuild the word index (only when the word lists change)

```
pip install cmudict wordfreq
python build/export_words.py   # writes build/words.json (not committed)
npm run build:index            # writes data/index.json
```

`data/index.json` is committed, so the site needs no build step.

## How it works

- `src/phonetic.js`: CMU phonemes to digits (NG defaults to 2, configurable).
- `build/`: builds `data/index.json` (digit string to words, most common first). Function words and acronyms are dropped via `blocked_words.json`; the book's peg words are always kept.
- `src/suggest.js`: picks three suggestions: one word for the whole number, the fewest words covering it, and the book's peg words two digits at a time.
- `data/pegs.json`: the book's 1-100 peg list.
