// Reine Funktionen: erkennt typische Rechenfehler bei der Division.

import { getDefaultHint } from './strategies.js';

/**
 * @param {object} params
 * @returns {{type: string, hint: string, reveal: string} | null} null, wenn die Antwort korrekt ist.
 */
export function analyzeError({ a, b, correctAnswer, userAnswer }) {
  if (userAnswer === correctAnswer) return null;

  if (userAnswer === a * b) {
    return {
      type: 'multiplikation-statt-division',
      hint: `Tipp: Du sollst ${a} durch ${b} teilen, nicht multiplizieren.`,
      reveal: `${a} × ${b} wäre eine Multiplikation. Hier ist aber ${a} : ${b} gefragt.`,
    };
  }

  if (userAnswer === correctAnswer + 1 || userAnswer === correctAnswer - 1) {
    return {
      type: 'einmaleins-nachbar',
      hint: `Tipp: Dein Ergebnis ist nah dran – prüfe die ${b}er-Reihe noch einmal genau.`,
      reveal: `${b} × ${userAnswer} ist nicht ${a}. Zähl die ${b}er-Reihe noch einmal nach.`,
    };
  }

  if (userAnswer === correctAnswer * 10 || (correctAnswer % 10 === 0 && userAnswer === correctAnswer / 10)) {
    return {
      type: 'stelle-falsch',
      hint: 'Tipp: Überprüfe, ob dein Ergebnis die richtige Anzahl an Stellen hat.',
      reveal: 'Dein Ergebnis hat vermutlich eine Stelle zu viel oder zu wenig.',
    };
  }

  return {
    type: 'unbekannt',
    hint: getDefaultHint(a, b),
    reveal: 'Schau dir in Ruhe den Rechenweg an – dort siehst du jeden Schritt einzeln.',
  };
}
