// Reine Funktionen: Additionsaufgaben erzeugen. Kein DOM-Zugriff, kein localStorage.

import { randInt, pickWeighted, weightForFact } from '../../shared/numberUtils.js';

export const MODES = ['kleines-einspluseins', 'grosses-einspluseins', 'kopfrechnen', 'schriftlich'];

function factKey(a, b) {
  return `${a}+${b}`;
}

export { weightForFact, pickWeighted, randInt };

function buildPairs(rowsRange, colMax) {
  const pairs = [];
  for (const a of rowsRange) {
    for (let b = 1; b <= colMax; b++) pairs.push([a, b]);
  }
  return pairs;
}

function filterTrivial(pairs, difficulty) {
  if (difficulty < 2) return pairs;
  let filtered = pairs.filter(([a, b]) => a !== 1 && b !== 1);
  if (difficulty >= 3) {
    // Erzwingt den Zehnerübergang: nur Summen, die über eine Zehnergrenze gehen.
    const crossing = filtered.filter(([a, b]) => a % 10 !== 0 && a % 10 + (b % 10) >= 10);
    if (crossing.length > 0) filtered = crossing;
  }
  return filtered.length > 0 ? filtered : pairs;
}

function pickEinspluseinsTask({ rowsRange, colMax, difficulty, factsMap, rng }) {
  const allPairs = buildPairs(rowsRange, colMax);
  const pairs = filterTrivial(allPairs, difficulty);
  const weights = pairs.map(([a, b]) => (factsMap ? weightForFact(factsMap[factKey(a, b)]) : 1));
  const [a, b] = pickWeighted(pairs, weights, rng);
  return { a, b };
}

function pickKopfrechnenTask({ difficulty, rng }) {
  if (difficulty === 1) {
    return { a: randInt(11, 49, rng), b: randInt(10, 49, rng) };
  }
  if (difficulty === 2) {
    return { a: randInt(11, 89, rng), b: randInt(11, 89, rng) };
  }
  return { a: randInt(100, 499, rng), b: randInt(11, 89, rng) };
}

function pickSchriftlichTask({ difficulty, rng }) {
  if (difficulty === 1) {
    return { a: randInt(10, 99, rng), b: randInt(10, 99, rng) };
  }
  if (difficulty === 2) {
    return { a: randInt(100, 999, rng), b: randInt(100, 999, rng) };
  }
  return { a: randInt(1000, 9999, rng), b: randInt(100, 999, rng) };
}

/**
 * Erzeugt eine Additionsaufgabe passend zu Modus und Schwierigkeit.
 */
export function generateTask({ mode, difficulty = 1, selectedRows = null, factsMap = null, rng = Math.random }) {
  if (!MODES.includes(mode)) {
    throw new Error(`Unbekannter Modus: ${mode}`);
  }

  let a, b;

  if (mode === 'kleines-einspluseins') {
    const rows = selectedRows && selectedRows.length > 0 ? selectedRows : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    ({ a, b } = pickEinspluseinsTask({ rowsRange: rows, colMax: 10, difficulty, factsMap, rng }));
  } else if (mode === 'grosses-einspluseins') {
    const rows = Array.from({ length: 20 }, (_, i) => i + 1);
    ({ a, b } = pickEinspluseinsTask({ rowsRange: rows, colMax: 20, difficulty, factsMap, rng }));
  } else if (mode === 'kopfrechnen') {
    ({ a, b } = pickKopfrechnenTask({ difficulty, rng }));
  } else {
    ({ a, b } = pickSchriftlichTask({ difficulty, rng }));
  }

  return { a, b, mode, difficulty, operation: 'addition', answer: a + b };
}

export { factKey };
