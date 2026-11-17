// Reine Funktionen: Aufgaben erzeugen. Kein DOM-Zugriff, kein localStorage –
// Fortschrittsdaten (für die Wiederholungslogik) werden als einfache Objekte übergeben.

import { randInt, pickWeighted, weightForFact } from '../../shared/numberUtils.js';

export const MODES = ['kleines-einmaleins', 'grosses-einmaleins', 'kopfrechnen', 'schriftlich'];

function factKey(a, b) {
  return `${a}x${b}`;
}

export { weightForFact, pickWeighted, randInt };

function excludedTrivialValues(difficulty) {
  if (difficulty >= 3) return [1, 10, 20];
  if (difficulty >= 2) return [1];
  return [];
}

function buildPairs(rowsRange, colMax) {
  const pairs = [];
  for (const a of rowsRange) {
    for (let b = 1; b <= colMax; b++) pairs.push([a, b]);
  }
  return pairs;
}

function filterTrivial(pairs, difficulty) {
  const trivial = excludedTrivialValues(difficulty);
  if (trivial.length === 0) return pairs;
  const filtered = pairs.filter(([a, b]) => !trivial.includes(a) && !trivial.includes(b));
  return filtered.length > 0 ? filtered : pairs;
}

function pickEinmaleinsTask({ rowsRange, colMax, difficulty, factsMap, rng }) {
  const allPairs = buildPairs(rowsRange, colMax);
  const pairs = filterTrivial(allPairs, difficulty);
  const weights = pairs.map(([a, b]) => (factsMap ? weightForFact(factsMap[factKey(a, b)]) : 1));
  const [a, b] = pickWeighted(pairs, weights, rng);
  return { a, b };
}

function pickKopfrechnenTask({ difficulty, rng }) {
  if (difficulty === 1) {
    return { a: randInt(11, 49, rng), b: randInt(2, 9, rng) };
  }
  if (difficulty === 2) {
    return { a: randInt(11, 99, rng), b: randInt(2, 9, rng) };
  }
  return { a: randInt(11, 99, rng), b: randInt(11, 20, rng) };
}

function pickSchriftlichTask({ difficulty, rng }) {
  if (difficulty === 1) {
    return { a: randInt(10, 99, rng), b: randInt(2, 9, rng) };
  }
  if (difficulty === 2) {
    return { a: randInt(100, 999, rng), b: randInt(2, 9, rng) };
  }
  return { a: randInt(100, 999, rng), b: randInt(11, 99, rng) };
}

/**
 * Erzeugt eine Aufgabe passend zu Modus und Schwierigkeit.
 *
 * @param {object} options
 * @param {string} options.mode
 * @param {number} [options.difficulty=1] 1|2|3
 * @param {number[]} [options.selectedRows] nur für 'kleines-einmaleins': welche Reihen (1-10) erlaubt sind
 * @param {object} [options.factsMap] Fortschrittsdaten `{ "7x8": {attempts, correct}, ... }` für Wiederholungslogik
 * @param {function} [options.rng] Zufallsfunktion (für Tests austauschbar), liefert [0,1)
 */
export function generateTask({ mode, difficulty = 1, selectedRows = null, factsMap = null, rng = Math.random }) {
  if (!MODES.includes(mode)) {
    throw new Error(`Unbekannter Modus: ${mode}`);
  }

  let a, b;

  if (mode === 'kleines-einmaleins') {
    const rows = selectedRows && selectedRows.length > 0 ? selectedRows : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    ({ a, b } = pickEinmaleinsTask({ rowsRange: rows, colMax: 10, difficulty, factsMap, rng }));
  } else if (mode === 'grosses-einmaleins') {
    const rows = Array.from({ length: 20 }, (_, i) => i + 1);
    ({ a, b } = pickEinmaleinsTask({ rowsRange: rows, colMax: 20, difficulty, factsMap, rng }));
  } else if (mode === 'kopfrechnen') {
    ({ a, b } = pickKopfrechnenTask({ difficulty, rng }));
  } else {
    ({ a, b } = pickSchriftlichTask({ difficulty, rng }));
  }

  return { a, b, mode, difficulty, operation: 'multiplication', answer: a * b };
}

export { factKey };
