// Reine Funktionen: erkennt typische Rechenfehler bei der Subtraktion.

import { getDefaultHint } from './strategies.js';
import { simulateNoBorrow } from './writtenMethod.js';

/**
 * @param {object} params
 * @returns {{type: string, hint: string, reveal: string} | null} null, wenn die Antwort korrekt ist.
 */
export function analyzeError({ a, b, correctAnswer, userAnswer }) {
  if (userAnswer === correctAnswer) return null;

  if (userAnswer === a + b) {
    return {
      type: 'addition-statt-subtraktion',
      hint: `Tipp: Du sollst ${b} von ${a} abziehen, nicht dazuzählen.`,
      reveal: `${a} + ${b} wäre eine Addition. Hier ist aber ${a} − ${b} gefragt.`,
    };
  }

  const noBorrow = simulateNoBorrow(a, b);
  if (userAnswer === noBorrow && noBorrow !== correctAnswer) {
    return {
      type: 'borgen-vergessen',
      hint: 'Tipp: Schau dir jede Spalte einzeln an – reicht eine Ziffer nicht aus, musst du dir von der nächsten Stelle einen Zehner leihen.',
      reveal: 'Du hast vermutlich in einer Spalte einfach die kleinere von der größeren Ziffer abgezogen, statt einen Zehner zu leihen (entbündeln).',
    };
  }

  return {
    type: 'unbekannt',
    hint: getDefaultHint(a, b),
    reveal: 'Schau dir in Ruhe den Rechenweg an – dort siehst du jeden Schritt einzeln.',
  };
}
