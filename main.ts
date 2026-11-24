// Seventeen Syllables of Debugging — one haiku about debugging.
//
// The haiku:
//   Breakpoint waits, silent
//   cursor blinks at 3 a.m.
//   and the bug was me
//
// A breakpoint waits, a cursor blinks at three in the morning, and the last
// line turns the poem: after all that staring, the bug was the debugger.
//
// Gate enforced here (see RULES.txt): /output/entry.txt must be UTF-8 text
// of 1 to 200 characters, not only whitespace, with exactly 3 lines in the
// 5-7-5 syllable shape. This program checks all of those before it writes,
// and refuses to write an invalid haiku.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const HAIKU = [
  "Breakpoint waits, silent",
  "cursor blinks at 3 a.m.",
  "and the bug was me",
].join("\n");

const EXPECTED_SYLLABLES = [5, 7, 5];

// Small syllable counter: counts vowel groups, drops a trailing silent "e",
// treats a lone digit as one spoken syllable ("3" -> "three"), and splits
// dotted abbreviations ("a.m.") so each spoken letter counts.
function countSyllables(word: string): number {
  const cleaned = word.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (cleaned.length === 0) return 0;
  if (/^[0-9]+$/.test(cleaned)) return 1;
  const groups = cleaned.match(/[aeiouy]+/g);
  let count = groups ? groups.length : 0;
  if (cleaned.endsWith("e") && count > 1) count -= 1;
  return Math.max(count, 1);
}

function lineSyllables(line: string): number {
  return line
    .split(/[\s.]+/)
    .filter(Boolean)
    .reduce((sum, word) => sum + countSyllables(word), 0);
}

// Gate checks (character count, not bytes: [...HAIKU] counts code points).
const chars = [...HAIKU].length;
if (chars < 1 || chars > 200) {
  throw new Error(`Haiku is ${chars} characters; gate requires 1-200.`);
}
if (HAIKU.trim().length === 0) {
  throw new Error("Haiku must not be only whitespace.");
}
const lines = HAIKU.split("\n");
if (lines.length !== 3) {
  throw new Error(`Haiku has ${lines.length} lines; gate requires exactly 3.`);
}
lines.forEach((line, i) => {
  const syllables = lineSyllables(line);
  if (syllables !== EXPECTED_SYLLABLES[i]) {
    throw new Error(
      `Line ${i + 1} has ${syllables} syllables; gate requires ${EXPECTED_SYLLABLES[i]}.`
    );
  }
});

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", HAIKU, "utf8");

// Read it back and re-check the gate on the bytes actually written, so a
// truncated or mangled write can never pass silently.
const written = readFileSync("/output/entry.txt", "utf8");
if (written !== HAIKU) {
  throw new Error("Written file does not match the haiku.");
}
if ([...written].length !== chars) {
  throw new Error("Written file length does not match the checked length.");
}
console.log(`Wrote ${chars} characters (3 lines, 5-7-5) to /output/entry.txt`);
