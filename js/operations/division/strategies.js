// Reine Funktionen: Rechenweg-Strategien für a : b (geht immer restlos auf).

export function buildUmkehraufgabe(a, b) {
  const result = a / b;
  return {
    id: 'umkehraufgabe',
    label: 'Umkehraufgabe',
    hint: `Tipp: Überlege, mit welcher Zahl du ${b} multiplizieren musst, um ${a} zu erhalten.`,
    steps: [`Überlege: ${b} × ? = ${a}`, `${b} × ${result} = ${a}`, `${a} : ${b} = ${result}`],
    result,
    visual: { rows: result, cols: b },
  };
}

export function buildHalbieren(a, b) {
  const result = a / b;
  if (b === 4) {
    const half1 = a / 2;
    return {
      id: 'halbieren',
      label: 'Halbieren',
      hint: `Tipp: Du kannst zweimal halbieren, weil 4 = 2 × 2 ist.`,
      steps: [`${a} : 2 = ${half1}`, `${half1} : 2 = ${result}`, `${a} : 4 = ${result}`],
      result,
    };
  }
  if (b === 8) {
    const half1 = a / 2;
    const half2 = half1 / 2;
    return {
      id: 'halbieren',
      label: 'Halbieren',
      hint: `Tipp: Du kannst dreimal halbieren, weil 8 = 2 × 2 × 2 ist.`,
      steps: [`${a} : 2 = ${half1}`, `${half1} : 2 = ${half2}`, `${half2} : 2 = ${result}`, `${a} : 8 = ${result}`],
      result,
    };
  }
  return null;
}

export function buildZerlegen(a, b) {
  const result = a / b;
  const a1 = Math.floor(a / (b * 10)) * (b * 10);
  const a2 = a - a1;
  if (a1 === 0 || a2 === 0) return null;
  const q1 = a1 / b;
  const q2 = a2 / b;
  return {
    id: 'zerlegen',
    label: 'Zerlegen',
    hint: `Tipp: Zerlege die ${a} in ${a1} und ${a2} – beide lassen sich glatt durch ${b} teilen.`,
    steps: [
      `${a} = ${a1} + ${a2}`,
      `${a} : ${b} = ${a1} : ${b} + ${a2} : ${b}`,
      `= ${q1} + ${q2}`,
      `= ${result}`,
    ],
    result,
    visual: { rows: result, cols: b, splitDim: 'rows', parts: [q1, q2] },
  };
}

/**
 * Liefert alle sinnvollen Strategien für a : b, die erste in der Liste ist die
 * Standard-Strategie; weitere können per "Anderer Weg" durchgeschaltet werden.
 */
export function getStrategiesFor(a, b) {
  const list = [buildUmkehraufgabe(a, b)];
  const halbieren = buildHalbieren(a, b);
  const zerlegen = buildZerlegen(a, b);
  if (halbieren) list.push(halbieren);
  if (zerlegen) list.push(zerlegen);
  return list;
}

export function getDefaultHint(a, b) {
  return getStrategiesFor(a, b)[0].hint;
}
