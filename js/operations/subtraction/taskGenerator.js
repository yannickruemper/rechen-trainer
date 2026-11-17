// Reine Funktionen: Subtraktionsaufgaben erzeugen. Kein DOM-Zugriff, kein localStorage.
// Es gilt immer a >= b, damit das Ergebnis im Grundschul-Zahlenraum nicht negativ wird.

import { randInt, pickWeighted, weightForFact } from '../../shared/numberUtils.js';

export const MODES = ['kleines-einsminuseins', 'grosses-einsminuseins', 'kopfrechnen', 'schriftlich'];

function factKey(a, b) {
  return `${a}-${b}`;
}

export { weightForFact, pickWeighted, randInt };

function buildPairs(bRange, maxA) {
  const pairs = [];
  for (const b of bRange) {
    for (let a = b; a <= maxA; a++) pairs.push([a, b]);
  }
  return pairs;
}

function filterTrivial(pairs, difficulty) {
  if (difficulty < 2) return pairs;
  let filtered = pairs.filter(([, b]) => b !== 1);
  if (difficulty >= 3) {
    // Erzwingt das Entbündeln (Borgen): Einer des Minuenden kleiner als Einer des Subtrahenden.
    const borrowing = filtered.filter(([a, b]) => a % 10 < b % 10);
    if (borrowing.length > 0) filtered = borrowing;
  }
  return filtered.length > 0 ? filtered : pairs;
}

function pickEinsminuseinsTask({ bRange, maxA, difficulty, factsMap, rng }) {
  const allPairs = buildPairs(bRange, maxA);
  const pairs = filterTrivial(allPairs, difficulty);
  const weights = pairs.map(([a, b]) => (factsMap ? weightForFact(factsMap[factKey(a, b)]) : 1));
  const [a, b] = pickWeighted(pairs, weights, rng);
  return { a, b };
}

function pickKopfrechnenTask({ difficulty, rng }) {
  if (difficulty === 1) {
    const a = randInt(20, 99, rng);
    return { a, b: randInt(10, a, rng) };
  }
  if (difficulty === 2) {
    const a = randInt(50, 199, rng);
    return { a, b: randInt(20, a, rng) };
  }
  const a = randInt(100, 999, rng);
  return { a, b: randInt(50, a, rng) };
}

function pickSchriftlichTask({ difficulty, rng }) {
  if (difficulty === 1) {
    const a = randInt(10, 99, rng);
    return { a, b: randInt(10, a, rng) };
  }
  if (difficulty === 2) {
    const a = randInt(100, 999, rng);
    return { a, b: randInt(100, a, rng) };
  }
  const a = randInt(1000, 9999, rng);
  return { a, b: randInt(100, a, rng) };
}

/**
 * Erzeugt eine Subtraktionsaufgabe passend zu Modus und Schwierigkeit. Es gilt stets a >= b.
 */
export function generateTask({ mode, difficulty = 1, selectedRows = null, factsMap = null, rng = Math.random }) {
  if (!MODES.includes(mode)) {
    throw new Error(`Unbekannter Modus: ${mode}`);
  }

  let a, b;

  if (mode === 'kleines-einsminuseins') {
    const rows = selectedRows && selectedRows.length > 0 ? selectedRows : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    ({ a, b } = pickEinsminuseinsTask({ bRange: rows, maxA: 20, difficulty, factsMap, rng }));
  } else if (mode === 'grosses-einsminuseins') {
    const rows = Array.from({ length: 20 }, (_, i) => i + 1);
    ({ a, b } = pickEinsminuseinsTask({ bRange: rows, maxA: 40, difficulty, factsMap, rng }));
  } else if (mode === 'kopfrechnen') {
    ({ a, b } = pickKopfrechnenTask({ difficulty, rng }));
  } else {
    ({ a, b } = pickSchriftlichTask({ difficulty, rng }));
  }

  return { a, b, mode, difficulty, operation: 'subtraction', answer: a - b };
}

export { factKey };
