// Reine Funktionen: Rechenweg-Strategien für a − b (es gilt stets a >= b).

function placeValueParts(x) {
  const tens = Math.floor(x / 10) * 10;
  return [tens, x - tens];
}
function friendlyParts(x) {
  if (x > 5) return [5, x - 5];
  if (x > 1) return [x - 1, 1];
  return [x, 0];
}

/** Rundet den Subtrahenden auf/ab zu einer Nachbarzahl (…9 → +1, …1 → −1). */
export function buildNachbaraufgabe(a, b) {
  const result = a - b;
  const lastDigit = b % 10;
  if (lastDigit === 9) {
    const neighbor = b + 1;
    const partial = a - neighbor;
    return {
      id: 'nachbaraufgabe',
      label: 'Nachbaraufgabe',
      hint: `Tipp: ${b} liegt direkt neben ${neighbor}. Rechne erst mit ${neighbor}.`,
      steps: [`${a} − ${neighbor} = ${partial}`, `${a} − ${b} = ${a} − ${neighbor} + 1 = ${partial} + 1 = ${result}`],
      result,
      visual: { type: 'numberline', start: a, jumps: [-neighbor, 1] },
    };
  }
  if (lastDigit === 1 && b > 1) {
    const neighbor = b - 1;
    const partial = a - neighbor;
    return {
      id: 'nachbaraufgabe',
      label: 'Nachbaraufgabe',
      hint: `Tipp: ${b} liegt direkt neben ${neighbor}. Rechne erst mit ${neighbor}.`,
      steps: [`${a} − ${neighbor} = ${partial}`, `${a} − ${b} = ${a} − ${neighbor} − 1 = ${partial} − 1 = ${result}`],
      result,
      visual: { type: 'numberline', start: a, jumps: [-neighbor, -1] },
    };
  }
  return null;
}

/** Ergänzt den Subtrahenden zuerst zum nächsten Zehner (Zehnerübergang rückwärts). */
export function buildErgaenzen(a, b) {
  const result = a - b;
  if (b % 10 === 0) return null;
  const comp = 10 - (b % 10);
  if (comp > result) return null;
  const bridge = b + comp;
  const rest = result - comp;
  return {
    id: 'ergaenzen',
    label: 'Ergänzen',
    hint: `Tipp: Ergänze die ${b} zuerst zum nächsten Zehner.`,
    steps: [
      `${b} + ${comp} = ${bridge}`,
      `${bridge} + ${rest} = ${a}`,
      `${a} − ${b} = ${comp} + ${rest} = ${result}`,
    ],
    result,
    visual: { type: 'numberline', start: b, jumps: [comp, rest] },
  };
}

export function buildZerlegen(a, b) {
  const result = a - b;

  if (a >= 11 || b >= 11) {
    const [a1, a2] = placeValueParts(a);
    const [b1, b2] = placeValueParts(b);
    if (a2 >= b2) {
      return {
        id: 'stellenwertzerlegung',
        label: 'Stellenwertzerlegung',
        hint: `Tipp: Zerlege beide Zahlen in Zehner und Einer.`,
        steps: [
          `${a} = ${a1} + ${a2}`,
          `${b} = ${b1} + ${b2}`,
          `${a} − ${b} = (${a1} − ${b1}) + (${a2} − ${b2})`,
          `= ${a1 - b1} + ${a2 - b2}`,
          `= ${result}`,
        ],
        result,
        visual: { type: 'numberline', start: a, jumps: [-b1, -b2] },
      };
    }
    const a1Entbuendelt = a1 - 10;
    const a2Entbuendelt = a2 + 10;
    return {
      id: 'stellenwertzerlegung',
      label: 'Stellenwertzerlegung',
      hint: `Tipp: Du musst einen Zehner entbündeln, weil ${a2} kleiner als ${b2} ist.`,
      steps: [
        `${a} = ${a1} + ${a2}`,
        `${b} = ${b1} + ${b2}`,
        `Ein Zehner wird entbündelt: ${a} = ${a1Entbuendelt} + ${a2Entbuendelt}`,
        `${a} − ${b} = (${a1Entbuendelt} − ${b1}) + (${a2Entbuendelt} − ${b2})`,
        `= ${a1Entbuendelt - b1} + ${a2Entbuendelt - b2}`,
        `= ${result}`,
      ],
      result,
    };
  }

  const [p1, p2] = friendlyParts(b);
  if (p2 === 0) {
    return {
      id: 'zerlegen',
      label: 'Zerlegen',
      hint: `Tipp: ${a} − ${b} direkt abzählen.`,
      steps: [`${a} − ${b} = ${result}`],
      result,
      visual: { type: 'numberline', start: a, jumps: [-b] },
    };
  }
  return {
    id: 'zerlegen',
    label: 'Zerlegen',
    hint: `Tipp: Zerlege die ${b} in ${p1} und ${p2}.`,
    steps: [`${b} = ${p1} + ${p2}`, `${a} − ${b} = ${a} − ${p1} − ${p2}`, `= ${a - p1} − ${p2}`, `= ${result}`],
    result,
    visual: { type: 'numberline', start: a, jumps: [-p1, -p2] },
  };
}

/**
 * Liefert alle sinnvollen Strategien für a − b, die erste in der Liste ist die
 * Standard-Strategie; weitere können per "Anderer Weg" durchgeschaltet werden.
 */
export function getStrategiesFor(a, b) {
  const list = [];
  const nachbar = buildNachbaraufgabe(a, b);
  const ergaenzen = buildErgaenzen(a, b);
  const decomposition = buildZerlegen(a, b);

  if (nachbar) list.push(nachbar);
  if (ergaenzen) list.push(ergaenzen);
  list.push(decomposition);

  return list;
}

export function getDefaultHint(a, b) {
  return getStrategiesFor(a, b)[0].hint;
}
