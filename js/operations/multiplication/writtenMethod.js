// Reine Funktionen für die schriftliche Multiplikation (deutsches Schulverfahren):
// Teilprodukte je Ziffer des zweiten Faktors, stellenweise eingerückt, dann addiert.

import { digits } from '../../shared/numberUtils.js';

export { digits };

/**
 * Multipliziert die mehrstellige Zahl `a` schriftlich mit der einstelligen Ziffer `d`,
 * inklusive Übertrag-Kette. Liefert das Ergebnis plus die einzelnen Spalten-Schritte.
 */
export function multiplySingleDigit(a, d) {
  const aDigits = digits(a);
  let carry = 0;
  const resultDigits = [];
  const steps = [];
  for (let i = 0; i < aDigits.length; i++) {
    const product = aDigits[i] * d + carry;
    const writeDigit = product % 10;
    const carryOut = Math.floor(product / 10);
    steps.push({ position: i, digitA: aDigits[i], carryIn: carry, product, writeDigit, carryOut });
    resultDigits.push(writeDigit);
    carry = carryOut;
  }
  while (carry > 0) {
    steps.push({ position: resultDigits.length, digitA: 0, carryIn: carry, product: carry, writeDigit: carry % 10, carryOut: Math.floor(carry / 10) });
    resultDigits.push(carry % 10);
    carry = Math.floor(carry / 10);
  }
  const value = Number(resultDigits.slice().reverse().join('')) || 0;
  return { value, steps };
}

/**
 * Berechnet die komplette schriftliche Multiplikation a × b: einen Teilprodukt-Block
 * pro Ziffer von b (um `place` Stellen eingerückt/verschoben) plus die Summe.
 */
export function computeWrittenMultiplication(a, b) {
  const bDigits = digits(b);
  const partials = bDigits.map((d, place) => {
    const { value: rawValue, steps: carrySteps } = multiplySingleDigit(a, d);
    const shiftedValue = rawValue * Math.pow(10, place);
    return { digit: d, place, rawValue, shiftedValue, carrySteps };
  });
  const sum = partials.reduce((s, p) => s + p.shiftedValue, 0);
  return { a, b, answer: a * b, partials, sum };
}

/** Liefert textuelle Schritte für die Rechenweg-Anzeige, plus die Rohdaten für das Raster. */
export function getWrittenSteps(a, b) {
  const data = computeWrittenMultiplication(a, b);
  const placeName = (p) => (p === 0 ? 'Einer' : p === 1 ? 'Zehner' : p === 2 ? 'Hunderter' : `10^${p}`);
  const steps = data.partials.map((p) => {
    let text = `${a} × ${p.digit} (${placeName(p.place)} von ${b}) = ${p.rawValue}`;
    if (p.place > 0) {
      text += ` → um ${p.place} Stelle${p.place > 1 ? 'n' : ''} nach links eingerückt: ${p.shiftedValue}`;
    }
    return text;
  });
  if (data.partials.length > 1) {
    const sumLine = data.partials.map((p) => p.shiftedValue).join(' + ');
    steps.push(`${sumLine} = ${data.answer}`);
  }
  return { steps, data };
}

/** Simuliert den typischen Fehler "Übertrag vergessen": jede Spalte wird einzeln ohne Übertrag berechnet. */
export function simulateMissingCarry(a, b) {
  const bDigits = digits(b);
  const aDigits = digits(a);
  let total = 0;
  for (const [place, d] of bDigits.entries()) {
    let partial = 0;
    for (let i = 0; i < aDigits.length; i++) {
      const product = aDigits[i] * d;
      partial += (product % 10) * Math.pow(10, i);
    }
    total += partial * Math.pow(10, place);
  }
  return total;
}

/** Simuliert den typischen Fehler "falsche Einrückung": alle Teilprodukte ohne Verschiebung addiert. */
export function simulateNoShift(a, b) {
  const bDigits = digits(b);
  return bDigits.reduce((sum, d) => sum + a * d, 0);
}
