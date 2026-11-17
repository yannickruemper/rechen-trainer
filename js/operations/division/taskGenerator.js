// Reine Funktionen: Divisionsaufgaben erzeugen. Kein DOM-Zugriff, kein localStorage.
// Alle Aufgaben gehen restlos auf (a % b === 0) – passend für die Grundschule.

import { randInt, pickWeighted, weightForFact } from '../../shared/numberUtils.js';

export const MODES = ['kleine-division', 'grosse-division', 'kopfrechnen', 'schriftlich'];

function factKey(a, b) {
  return `${a}:${b}`;
}

export { weightForFact, pickWeighted, randInt };

function buildPairs(bRange, qMax) {
  const pairs = [];
  for (const b of bRange) {
    for (let q = 1; q <= qMax; q++) pairs.push([b * q, b]);
  }
  return pairs;
}

function filterTrivial(pairs, difficulty, qMax) {
  if (difficulty < 2) return pairs;
  let filtered = pairs.filter(([, b]) => b !== 1);
  if (difficulty >= 3) {
    const stricter = filtered.filter(([a, b]) => {
      const q = a / b;
      return q !== 1 && q !== qMax;
    });
    if (stricter.length > 0) filtered = stricter;
  }
  return filtered.length > 0 ? filtered : pairs;
}

function pickDivisionTask({ bRange, qMax, difficulty, factsMap, rng }) {
  const allPairs = buildPairs(bRange, qMax);
  const pairs = filterTrivial(allPairs, difficulty, qMax);
  const weights = pairs.map(([a, b]) => (factsMap ? weightForFact(factsMap[factKey(a, b)]) : 1));
  const [a, b] = pickWeighted(pairs, weights, rng);
  return { a, b };
}

function pickKopfrechnenTask({ difficulty, rng }) {
  const b = randInt(2, 9, rng);
  let q;
  if (difficulty === 1) q = randInt(11, 20, rng);
  else if (difficulty === 2) q = randInt(11, 50, rng);
  else q = randInt(50, 99, rng);
  return { a: b * q, b };
}

function pickSchriftlichTask({ difficulty, rng }) {
  if (difficulty === 1) {
    const b = randInt(2, 9, rng);
    return { a: b * randInt(100, 299, rng), b };
  }
  if (difficulty === 2) {
    const b = randInt(2, 9, rng);
    return { a: b * randInt(100, 999, rng), b };
  }
  const b = randInt(11, 20, rng);
  return { a: b * randInt(50, 199, rng), b };
}

/**
 * Erzeugt eine Divisionsaufgabe passend zu Modus und Schwierigkeit. Geht immer restlos auf.
 */
export function generateTask({ mode, difficulty = 1, selectedRows = null, factsMap = null, rng = Math.random }) {
  if (!MODES.includes(mode)) {
    throw new Error(`Unbekannter Modus: ${mode}`);
  }

  let a, b;

  if (mode === 'kleine-division') {
    const rows = selectedRows && selectedRows.length > 0 ? selectedRows : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    ({ a, b } = pickDivisionTask({ bRange: rows, qMax: 10, difficulty, factsMap, rng }));
  } else if (mode === 'grosse-division') {
    const rows = Array.from({ length: 20 }, (_, i) => i + 1);
    ({ a, b } = pickDivisionTask({ bRange: rows, qMax: 20, difficulty, factsMap, rng }));
  } else if (mode === 'kopfrechnen') {
    ({ a, b } = pickKopfrechnenTask({ difficulty, rng }));
  } else {
    ({ a, b } = pickSchriftlichTask({ difficulty, rng }));
  }

  return { a, b, mode, difficulty, operation: 'division', answer: a / b };
}

export { factKey };
