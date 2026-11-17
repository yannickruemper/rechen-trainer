// Reine Funktionen: Rechenweg-Strategien für a + b.

function placeValueParts(x) {
  const tens = Math.floor(x / 10) * 10;
  return [tens, x - tens];
}
function friendlyParts(x) {
  if (x > 5) return [5, x - 5];
  if (x > 1) return [x - 1, 1];
  return [x, 0];
}

export function buildTauschaufgabe(a, b) {
  const result = a + b;
  return {
    id: 'tauschaufgabe',
    label: 'Tauschaufgabe',
    hint: `Tipp: Bei der Addition darfst du die Reihenfolge vertauschen: ${b} + ${a}.`,
    steps: [`${a} + ${b} = ${b} + ${a}`, `${b} + ${a} = ${result}`],
    result,
    visual: { type: 'numberline', start: 0, jumps: [b, a] },
  };
}

export function buildVerdoppeln(a, b) {
  if (Math.abs(a - b) > 2) return null;
  const result = a + b;
  if (a === b) {
    return {
      id: 'verdoppeln',
      label: 'Verdoppeln',
      hint: `Tipp: ${a} + ${b} ist eine Verdopplung.`,
      steps: [`${a} + ${b} ist eine Verdopplung.`, `${a} + ${b} = 2 × ${a} = ${result}`],
      result,
      visual: { type: 'numberline', start: a, jumps: [b] },
    };
  }
  const base = Math.min(a, b);
  const other = Math.max(a, b);
  const diff = other - base;
  return {
    id: 'verdoppeln',
    label: 'Verdoppeln',
    hint: `Tipp: ${a} und ${b} liegen nah beieinander – verdopple die kleinere Zahl.`,
    steps: [
      `${base} + ${base} = ${base * 2} (Verdopplung)`,
      `${other} ist ${diff} mehr als ${base}.`,
      `${a} + ${b} = ${base * 2} + ${diff} = ${result}`,
    ],
    result,
    visual: { type: 'numberline', start: base, jumps: [base, diff] },
  };
}

export function buildZehnerUebergang(a, b) {
  let X = null, Y = null;
  if (a % 10 !== 0) {
    X = a;
    Y = b;
  } else if (b % 10 !== 0) {
    X = b;
    Y = a;
  } else {
    return null;
  }
  const comp = (10 - (X % 10)) % 10;
  if (comp === 0 || comp > Y) return null;

  const nextTen = X + comp;
  const rest = Y - comp;
  const result = a + b;
  return {
    id: 'zehneruebergang',
    label: 'Zehnerübergang',
    hint: `Tipp: Ergänze die ${X} zuerst zum nächsten Zehner.`,
    steps: [
      `${X} + ${comp} = ${nextTen}`,
      `${Y} = ${comp} + ${rest}`,
      `${a} + ${b} = ${nextTen} + ${rest} = ${result}`,
    ],
    result,
    visual: { type: 'numberline', start: X, jumps: [comp, rest] },
  };
}

export function buildZerlegen(a, b) {
  const result = a + b;

  if (a >= 11 && b >= 11) {
    const [a1, a2] = placeValueParts(a);
    const [b1, b2] = placeValueParts(b);
    return {
      id: 'stellenwertzerlegung',
      label: 'Stellenwertzerlegung',
      hint: `Tipp: Zerlege beide Zahlen in Zehner und Einer: ${a} in ${a1} und ${a2}, ${b} in ${b1} und ${b2}.`,
      steps: [
        `${a} = ${a1} + ${a2}`,
        `${b} = ${b1} + ${b2}`,
        `${a} + ${b} = (${a1} + ${b1}) + (${a2} + ${b2})`,
        `= ${a1 + b1} + ${a2 + b2}`,
        `= ${result}`,
      ],
      result,
      visual: { type: 'numberline', start: 0, jumps: [a1, a2, b1, b2] },
    };
  }

  if (a >= 11 || b >= 11) {
    const X = a >= 11 ? a : b;
    const Y = X === a ? b : a;
    const [x1, x2] = placeValueParts(X);
    return {
      id: 'stellenwertzerlegung',
      label: 'Stellenwertzerlegung',
      hint: `Tipp: Zerlege die ${X} in ${x1} und ${x2}.`,
      steps: [
        `${X} = ${x1} + ${x2}`,
        `${X} + ${Y} = ${x1} + ${x2} + ${Y}`,
        `= ${x1} + ${x2 + Y}`,
        `= ${result}`,
      ],
      result,
      visual: { type: 'numberline', start: 0, jumps: [x1, x2, Y] },
    };
  }

  const [p1, p2] = friendlyParts(a);
  if (p2 === 0) {
    return {
      id: 'zerlegen',
      label: 'Zerlegen',
      hint: `Tipp: ${a} + ${b} direkt abzählen.`,
      steps: [`${a} + ${b} = ${result}`],
      result,
      visual: { type: 'numberline', start: 0, jumps: [a, b] },
    };
  }
  return {
    id: 'zerlegen',
    label: 'Zerlegen',
    hint: `Tipp: Zerlege die ${a} in ${p1} und ${p2}.`,
    steps: [`${a} = ${p1} + ${p2}`, `${a} + ${b} = ${p1} + ${p2} + ${b}`, `= ${p1} + ${p2 + b}`, `= ${result}`],
    result,
    visual: { type: 'numberline', start: 0, jumps: [p1, p2, b] },
  };
}

/**
 * Liefert alle sinnvollen Strategien für a + b, die erste in der Liste ist die
 * Standard-Strategie; weitere können per "Anderer Weg" durchgeschaltet werden.
 */
export function getStrategiesFor(a, b) {
  const list = [];
  const zehnerUebergang = buildZehnerUebergang(a, b);
  const verdoppeln = buildVerdoppeln(a, b);
  const decomposition = buildZerlegen(a, b);
  const tausch = a !== b ? buildTauschaufgabe(a, b) : null;

  if (zehnerUebergang) list.push(zehnerUebergang);
  if (verdoppeln) list.push(verdoppeln);
  list.push(decomposition);
  if (tausch) list.push(tausch);

  return list;
}

export function getDefaultHint(a, b) {
  return getStrategiesFor(a, b)[0].hint;
}
