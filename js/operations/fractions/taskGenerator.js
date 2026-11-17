// Reine Funktionen: Bruchrechenaufgaben erzeugen (Addition & Subtraktion von Brüchen).
// Kein DOM-Zugriff, kein localStorage. Bei Subtraktion gilt stets frac1 >= frac2 (kein negatives Ergebnis).

import { randInt, lcm, simplifyFraction } from '../../shared/numberUtils.js';

export const MODES = ['gleichnamig', 'ungleichnamig'];

function pickOp(rng) {
  return rng() < 0.5 ? '+' : '-';
}

/** Vergleicht zwei Brüche: true, wenn f1 >= f2. */
function isAtLeast(f1, f2) {
  return f1.num * f2.den >= f2.num * f1.den;
}

function denRangeForGleichnamig(difficulty) {
  if (difficulty === 1) return [2, 6];
  if (difficulty === 2) return [4, 10];
  return [6, 12];
}

function pickGleichnamigTask(difficulty, rng) {
  const [min, max] = denRangeForGleichnamig(difficulty);
  const den = randInt(min, max, rng);
  let num1 = randInt(1, den - 1, rng);
  let num2 = randInt(1, den - 1, rng);
  let op = pickOp(rng);
  if (op === '-' && num1 === num2) op = '+';
  if (op === '-' && num1 < num2) [num1, num2] = [num2, num1];
  return { frac1: { num: num1, den }, frac2: { num: num2, den }, op };
}

function pickUngleichnamigTask(difficulty, rng) {
  let den1, den2;
  if (difficulty === 1) {
    den1 = randInt(2, 6, rng);
    const k = randInt(2, 3, rng);
    den2 = den1 * k;
  } else if (difficulty === 2) {
    den1 = randInt(2, 8, rng);
    do {
      den2 = randInt(2, 8, rng);
    } while (den2 === den1);
  } else {
    den1 = randInt(3, 12, rng);
    do {
      den2 = randInt(3, 12, rng);
    } while (den2 === den1);
  }
  if (rng() < 0.5) [den1, den2] = [den2, den1];

  let frac1 = { num: randInt(1, den1 - 1, rng), den: den1 };
  let frac2 = { num: randInt(1, den2 - 1, rng), den: den2 };
  let op = pickOp(rng);
  if (op === '-' && !isAtLeast(frac1, frac2)) {
    [frac1, frac2] = [frac2, frac1];
  }
  return { frac1, frac2, op };
}

function computeAnswer(frac1, frac2, op) {
  const L = lcm(frac1.den, frac2.den);
  const n1 = frac1.num * (L / frac1.den);
  const n2 = frac2.num * (L / frac2.den);
  const combined = op === '+' ? n1 + n2 : n1 - n2;
  return simplifyFraction(combined, L);
}

/**
 * Erzeugt eine Bruchrechenaufgabe (Addition oder Subtraktion) passend zu Modus und Schwierigkeit.
 */
export function generateTask({ mode, difficulty = 1, rng = Math.random }) {
  if (!MODES.includes(mode)) {
    throw new Error(`Unbekannter Modus: ${mode}`);
  }

  const { frac1, frac2, op } = mode === 'gleichnamig' ? pickGleichnamigTask(difficulty, rng) : pickUngleichnamigTask(difficulty, rng);
  const answer = computeAnswer(frac1, frac2, op);

  return { frac1, frac2, op, mode, difficulty, operation: 'fractions', answer };
}

export { computeAnswer };
