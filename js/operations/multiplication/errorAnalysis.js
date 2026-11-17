// Reine Funktionen: erkennt typische Rechenfehler aus der falschen Antwort.
// Liefert { type, hint, reveal }. `hint` verrät die Lösung NICHT (für den 1. Fehlversuch),
// `reveal` darf die Zahlen benennen (wird zusammen mit dem vollen Rechenweg gezeigt).

import { getDefaultHint } from './strategies.js';
import { computeWrittenMultiplication, simulateMissingCarry, simulateNoShift } from './writtenMethod.js';

function analyzeWrittenError(a, b, userAnswer) {
  const data = computeWrittenMultiplication(a, b);
  if (userAnswer === simulateMissingCarry(a, b) && simulateMissingCarry(a, b) !== data.answer) {
    return {
      type: 'uebertrag-vergessen',
      hint: 'Tipp: Schau dir jede Spalte einzeln an – reicht das Ergebnis über 9, musst du etwas zur nächsten Spalte dazuschreiben.',
      reveal: 'Du hast vermutlich einen Übertrag vergessen. Verfolge im Rechenweg unten, wie jeder Übertrag weitergegeben wird.',
    };
  }
  if (userAnswer === simulateNoShift(a, b) && simulateNoShift(a, b) !== data.answer) {
    return {
      type: 'einrueckung-falsch',
      hint: 'Tipp: Achte auf die Einrückung – jede neue Zeile rutscht eine Stelle weiter nach links.',
      reveal: 'Du hast die Teilprodukte vermutlich nicht richtig eingerückt. Jede Zeile steht eine Stelle weiter links als die vorherige.',
    };
  }
  return null;
}

/**
 * @param {object} params
 * @param {number} params.a
 * @param {number} params.b
 * @param {number} params.correctAnswer
 * @param {number} params.userAnswer
 * @param {string} params.mode
 * @returns {{type: string, hint: string, reveal: string} | null} null, wenn die Antwort korrekt ist.
 */
export function analyzeError({ a, b, correctAnswer, userAnswer, mode }) {
  if (userAnswer === correctAnswer) return null;

  if (userAnswer === a + b) {
    return {
      type: 'addition-statt-multiplikation',
      hint: `Tipp: Multiplizieren heißt, ${a} genau ${b}-mal zu nehmen – das ist mehr als nur einmal addieren.`,
      reveal: `${a} + ${b} = ${a + b}, aber ${a} × ${b} ist nicht dasselbe wie eine einzelne Addition.`,
    };
  }

  if (
    userAnswer === correctAnswer + a ||
    userAnswer === correctAnswer - a ||
    userAnswer === correctAnswer + b ||
    userAnswer === correctAnswer - b
  ) {
    const step = userAnswer > correctAnswer ? a : b;
    return {
      type: 'reihe-verrutscht',
      hint: `Tipp: Du bist wahrscheinlich eine Reihe verrutscht. Zähl noch einmal in ${step}er-Schritten.`,
      reveal: 'Beim Abzählen ist dir vermutlich eine Reihe zu viel oder zu wenig passiert.',
    };
  }

  if (mode === 'schriftlich') {
    const writtenError = analyzeWrittenError(a, b, userAnswer);
    if (writtenError) return writtenError;
  }

  return {
    type: 'unbekannt',
    hint: getDefaultHint(a, b),
    reveal: 'Schau dir in Ruhe den Rechenweg an – dort siehst du jeden Schritt einzeln.',
  };
}
