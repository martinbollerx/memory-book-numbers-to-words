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
pip install cmudict wordfreq openpyxl
python build/export_words.py   # writes build/words.json (not committed)
python build/export_ratings.py path/to/13428_2013_403_MOESM1_ESM.xlsx   # writes build/concreteness.json (not committed)
npm run build:index            # writes data/index.json
```

`data/index.json` is committed, so the site needs no build step.

## How it works

- `src/phonetic.js`: CMU phonemes to digits (NG defaults to 2, configurable).
- `build/`: builds `data/index.json` (digit string to words, most common first). Function words and acronyms are dropped via `blocked_words.json`; the book's peg words are always kept.
- Words are ranked by how common they are plus how easy they are to picture, using the concreteness ratings of Brysbaert, Warriner & Kuperman (2014), [Behavior Research Methods](https://link.springer.com/article/10.3758/s13428-013-0403-5). Only the combined score is stored in `data/index.json`, not the ratings.
- "Tricky" words, where reading the letters gives different digits than the sound does (silent letters like "knife", "night", "lamb"), are ranked lower so beginners see easy words first. See `spellingDigits` in `src/phonetic.js`.
- `src/suggest.js`: picks three suggestions: one word for the whole number, the fewest words covering it, and the book's peg words two digits at a time.
- `data/pegs.json`: the book's 1-100 peg list.
- `data/pegs_zero.json`: my own peg words for 00-09, since the book's list starts at 1.
