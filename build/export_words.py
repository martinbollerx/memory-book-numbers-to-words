"""Export every cmudict word with its first pronunciation(s) and a frequency.

Writes build/words.json (not committed): [{"w": word, "z": zipf, "p": ["S OW1 ...", ...]}, ...]
build_index.js then turns the pronunciations into digit strings using
src/phonetic.js, so the digit mapping lives in exactly one place.

Requires: pip install cmudict wordfreq
"""
import json
import re
from pathlib import Path

import cmudict
from wordfreq import zipf_frequency

MIN_ZIPF = 2.0  # drop very rare words
HERE = Path(__file__).parent

# Words that must always be in the index even if rare: the book's peg words.
pegs = json.loads((HERE.parent / "data" / "pegs.json").read_text(encoding="utf-8"))
pegs.update(json.loads((HERE.parent / "data" / "pegs_zero.json").read_text(encoding="utf-8")))
forced = {w.lower() for peg in pegs.values() for w in peg.split()}

pron = cmudict.dict()

rows = []
for word, prons in pron.items():
    if not re.fullmatch(r"[a-z]+", word):
        continue  # skip hyphens, apostrophes, digits
    zipf = zipf_frequency(word, "en")
    if word in forced:
        zipf = max(zipf, MIN_ZIPF)
    if zipf < MIN_ZIPF:
        continue
    rows.append({"w": word, "z": round(zipf, 2), "p": [" ".join(p) for p in prons]})

(HERE / "words.json").write_text(json.dumps(rows), encoding="utf-8")
print(f"{len(rows)} words written")
