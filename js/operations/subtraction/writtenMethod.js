// Reine Funktionen für die schriftliche Subtraktion (deutsches Schulverfahren):
// spaltenweise von den Einern aus, mit Entbündeln (Borgen). Es gilt stets a >= b.

import { digits } from '../../shared/numberUtils.js';

export { digits };

function placeName(p) {
  return p === 0 ? 'Einer' : p === 1 ? 'Zehner' : p === 2 ? 'Hunderter' : p === 3 ? 'Tausender' : `10^${p}`;
}

/** Berechnet die schriftliche Subtraktion a − b spaltenweise mit Entbündeln. */
export function computeWrittenSubtraction(a, b) {
  const aDigits = digits(a);
  const bDigits = digits(b);
  const columns = [];
  let borrow = 0;
  for (let i = 0; i < aDigits.length; i++) {
    const rawA = aDigits[i];
    const db = bDigits[i] || 0;
    let effectiveA = rawA - borrow;
    let borrowOut = 0;
    if (effectiveA < db) {
      effectiveA += 10;
      borrowOut = 1;
    }
    const diff = effectiveA - db;
    columns.push({ position: i, rawA, digitB: db, borrowIn: borrow, effectiveA, borrowOut, diff });
    borrow = borrowOut;
  }
  return { a, b, answer: a - b, columns };
}

/** Liefert textuelle Schritte für die Rechenweg-Anzeige, plus die Rohdaten für das Raster. */
export function getWrittenSteps(a, b) {
  const data = computeWrittenSubtraction(a, b);
  const steps = data.columns.map((c) => {
    const name = placeName(c.position);
    if (c.borrowOut === 1) {
      const borrowedText = c.borrowIn > 0 ? `${c.rawA} − ${c.borrowIn} (geliehen) reicht nicht für − ${c.digitB}` : `${c.rawA} reicht nicht für − ${c.digitB}`;
      return `${name}: ${borrowedText}, deshalb leihst du einen Zehner: ${c.effectiveA} − ${c.digitB} = ${c.diff}`;
    }
    if (c.borrowIn > 0) {
      return `${name}: ${c.rawA} − ${c.borrowIn} (geliehen) − ${c.digitB} = ${c.diff}`;
    }
    return `${name}: ${c.rawA} − ${c.digitB} = ${c.diff}`;
  });
  steps.push(`${a} − ${b} = ${data.answer}`);
  return { steps, data };
}

/** Simuliert den typischen Fehler "Borgen vergessen": in jeder Spalte wird die kleinere von der größeren Ziffer abgezogen. */
export function simulateNoBorrow(a, b) {
  const aDigits = digits(a);
  const bDigits = digits(b);
  let total = 0;
  for (let i = 0; i < aDigits.length; i++) {
    const diff = Math.abs(aDigits[i] - (bDigits[i] || 0));
    total += diff * Math.pow(10, i);
  }
  return total;
}
