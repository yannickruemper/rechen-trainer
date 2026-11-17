// Reine Funktionen: erkennt typische Rechenfehler bei der Addition.

import { getDefaultHint } from './strategies.js';
import { simulateMissingCarry } from './writtenMethod.js';

/**
 * @param {object} params
 * @returns {{type: string, hint: string, reveal: string} | null} null, wenn die Antwort korrekt ist.
 */
export function analyzeError({ a, b, correctAnswer, userAnswer }) {
  if (userAnswer === correctAnswer) return null;

  if (userAnswer === Math.abs(a - b)) {
    return {
      type: 'subtraktion-statt-addition',
      hint: `Tipp: Du sollst ${a} und ${b} zusammenzählen, nicht den Unterschied bilden.`,
      reveal: `${a} − ${b} wäre eine Subtraktion. Hier ist aber ${a} + ${b} gefragt.`,
    };
  }

  const missingCarry = simulateMissingCarry(a, b);
  if (userAnswer === missingCarry && missingCarry !== correctAnswer) {
    return {
      type: 'uebertrag-vergessen',
      hint: 'Tipp: Schau dir jede Spalte einzeln an – reicht die Summe über 9, musst du etwas zur nächsten Spalte dazuschreiben.',
      reveal: 'Du hast vermutlich einen Übertrag vergessen. Verfolge im Rechenweg, wie jeder Übertrag weitergegeben wird.',
    };
  }

  return {
    type: 'unbekannt',
    hint: getDefaultHint(a, b),
    reveal: 'Schau dir in Ruhe den Rechenweg an – dort siehst du jeden Schritt einzeln.',
  };
}
