// Reine Funktionen für die schriftliche Division (deutsches Schulverfahren):
// Ziffer für Ziffer herunterbringen, teilen, Rest weiterreichen. Geht hier immer restlos auf.

function digitsMSBFirst(n) {
  return String(n).split('').map(Number);
}

/** Berechnet die schriftliche Division a : b nach dem Standardverfahren. */
export function computeWrittenDivision(a, b) {
  const daDigits = digitsMSBFirst(a);
  let remainder = 0;
  let started = false;
  const quotientDigits = [];
  const steps = [];

  for (const d of daDigits) {
    const current = remainder * 10 + d;
    if (!started && current < b) {
      steps.push({ broughtDown: d, current, qDigit: null, product: null, remainder: current, skipped: true });
      remainder = current;
      continue;
    }
    started = true;
    const qDigit = Math.floor(current / b);
    const product = qDigit * b;
    remainder = current - product;
    quotientDigits.push(qDigit);
    steps.push({ broughtDown: d, current, qDigit, product, remainder, skipped: false });
  }

  const quotient = quotientDigits.length > 0 ? Number(quotientDigits.join('')) : 0;
  return { a, b, quotient, remainder, steps };
}

/** Liefert textuelle Schritte für die Rechenweg-Anzeige, plus die Rohdaten für das Raster. */
export function getWrittenSteps(a, b) {
  const data = computeWrittenDivision(a, b);
  const steps = data.steps.map((s) => {
    if (s.skipped) {
      return `${s.broughtDown} ist kleiner als ${b}, also die nächste Ziffer dazunehmen: ${s.current}.`;
    }
    return `${s.current} : ${b} = ${s.qDigit} Rest ${s.remainder} (${b} × ${s.qDigit} = ${s.product})`;
  });
  steps.push(`${a} : ${b} = ${data.quotient}`);
  return { steps, data };
}

/** Simuliert den typischen Fehler "Multiplikation statt Division". */
export function simulateMultiplyInstead(a, b) {
  return a * b;
}
