// Reine Funktionen für die schriftliche Addition (deutsches Schulverfahren):
// spaltenweise von den Einern aus, mit Übertrag.

import { digits } from '../../shared/numberUtils.js';

export { digits };

function placeName(p) {
  return p === 0 ? 'Einer' : p === 1 ? 'Zehner' : p === 2 ? 'Hunderter' : p === 3 ? 'Tausender' : `10^${p}`;
}

/** Berechnet die schriftliche Addition a + b spaltenweise mit Übertrag. */
export function computeWrittenAddition(a, b) {
  const aDigits = digits(a);
  const bDigits = digits(b);
  const maxLen = Math.max(aDigits.length, bDigits.length);
  const columns = [];
  let carry = 0;
  for (let i = 0; i < maxLen; i++) {
    const da = aDigits[i] || 0;
    const db = bDigits[i] || 0;
    const sum = da + db + carry;
    const writeDigit = sum % 10;
    const carryOut = Math.floor(sum / 10);
    columns.push({ position: i, digitA: da, digitB: db, carryIn: carry, sum, writeDigit, carryOut });
    carry = carryOut;
  }
  if (carry > 0) {
    columns.push({ position: maxLen, digitA: 0, digitB: 0, carryIn: carry, sum: carry, writeDigit: carry, carryOut: 0 });
  }
  return { a, b, answer: a + b, columns };
}

/** Liefert textuelle Schritte für die Rechenweg-Anzeige, plus die Rohdaten für das Raster. */
export function getWrittenSteps(a, b) {
  const data = computeWrittenAddition(a, b);
  const steps = data.columns.map((c) => {
    let text = `${placeName(c.position)}: ${c.digitA} + ${c.digitB}`;
    if (c.carryIn > 0) text += ` + ${c.carryIn} (Übertrag)`;
    text += ` = ${c.sum}`;
    text += c.carryOut > 0 ? ` → schreibe ${c.writeDigit}, Übertrag ${c.carryOut}` : ` → schreibe ${c.writeDigit}`;
    return text;
  });
  steps.push(`${a} + ${b} = ${data.answer}`);
  return { steps, data };
}

/** Simuliert den typischen Fehler "Übertrag vergessen": jede Spalte einzeln ohne Übertrag. */
export function simulateMissingCarry(a, b) {
  const aDigits = digits(a);
  const bDigits = digits(b);
  const maxLen = Math.max(aDigits.length, bDigits.length);
  let total = 0;
  for (let i = 0; i < maxLen; i++) {
    const sum = (aDigits[i] || 0) + (bDigits[i] || 0);
    total += (sum % 10) * Math.pow(10, i);
  }
  return total;
}
