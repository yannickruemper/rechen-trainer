// Reine Funktionen: Rechenweg-Strategien für a × b. Jede Strategie liefert
// { id, label, hint, steps, result, visual? }. `hint` ist ein kurzer Tipp, der
// die Lösung NICHT verrät; `steps` ist der vollständige, schrittweise Rechenweg.

function isMultipleOfTen(x) {
  return x >= 10 && x % 10 === 0;
}
function needsPlaceValueSplit(x) {
  return x >= 11 && x % 10 !== 0;
}
function placeValueParts(x) {
  const tens = Math.floor(x / 10) * 10;
  const ones = x - tens;
  return [tens, ones];
}
function friendlyParts(x) {
  if (x > 5) return [5, x - 5];
  if (x > 1) return [x - 1, 1];
  return [x, 0];
}

export function buildTrivial(a, b) {
  const result = a * b;
  let steps;
  let hint;
  if (a === 0 || b === 0) {
    steps = ['Alles mal 0 ergibt immer 0.', `${a} × ${b} = ${result}`];
    hint = 'Tipp: Alles mal 0 ergibt immer 0.';
  } else {
    steps = ['Eine Zahl mal 1 bleibt unverändert.', `${a} × ${b} = ${result}`];
    hint = 'Tipp: 1 mal eine Zahl bleibt diese Zahl.';
  }
  return { id: 'trivial', label: 'Direkt', hint, steps, result, visual: { rows: a, cols: b } };
}

export function buildTauschaufgabe(a, b) {
  const result = a * b;
  return {
    id: 'tauschaufgabe',
    label: 'Tauschaufgabe',
    hint: `Tipp: Du darfst die Reihenfolge vertauschen: ${b} × ${a}.`,
    steps: [
      `${a} × ${b} = ${b} × ${a}`,
      `${b} × ${a} = ${result}`,
    ],
    result,
    visual: { rows: b, cols: a },
  };
}

export function buildVerdoppeln(a, b) {
  const evenFactor = a % 2 === 0 && a >= 2 && a <= 20 ? a : b % 2 === 0 && b >= 2 && b <= 20 ? b : null;
  if (evenFactor === null) return null;
  const otherFactor = evenFactor === a ? b : a;
  const half = evenFactor / 2;
  const halfResult = half * otherFactor;
  const result = evenFactor * otherFactor;
  return {
    id: 'verdoppeln',
    label: 'Verdoppeln',
    hint: `Tipp: ${evenFactor} ist doppelt so groß wie ${half}. Rechne erst mit ${half}.`,
    steps: [
      `${evenFactor} ist doppelt so groß wie ${half}.`,
      `${half} × ${otherFactor} = ${halfResult}`,
      `${evenFactor} × ${otherFactor} = 2 × ${halfResult} = ${result}`,
    ],
    result,
    visual: {
      rows: a,
      cols: b,
      splitDim: evenFactor === a ? 'rows' : 'cols',
      parts: [half, half],
    },
  };
}

function nachbarInfo(x) {
  const lastDigit = x % 10;
  if (lastDigit === 9) return { neighbor: x + 1, op: 'minus' };
  if (lastDigit === 1 && x > 1) return { neighbor: x - 1, op: 'plus' };
  return null;
}

export function buildNachbaraufgabe(a, b) {
  let x = a, y = b, info = nachbarInfo(a);
  if (!info) {
    info = nachbarInfo(b);
    if (!info) return null;
    x = b;
    y = a;
  }
  const { neighbor, op } = info;
  const neighborResult = neighbor * y;
  const result = x * y;
  const steps =
    op === 'minus'
      ? [
          `${neighbor} × ${y} = ${neighborResult}`,
          `${x} × ${y} = ${neighbor} × ${y} − ${y} = ${neighborResult} − ${y} = ${result}`,
        ]
      : [
          `${neighbor} × ${y} = ${neighborResult}`,
          `${x} × ${y} = ${neighbor} × ${y} + ${y} = ${neighborResult} + ${y} = ${result}`,
        ];

  const axis = x === a ? 'rows' : 'cols';
  const big = op === 'minus' ? neighbor : x;
  const small = op === 'minus' ? x : neighbor;
  const visual =
    axis === 'rows'
      ? { rows: big, cols: y, splitDim: 'rows', parts: [small, 1], variant: 'neighbor', op }
      : { rows: y, cols: big, splitDim: 'cols', parts: [small, 1], variant: 'neighbor', op };

  return {
    id: 'nachbaraufgabe',
    label: 'Nachbaraufgabe',
    hint: `Tipp: ${x} liegt direkt neben ${neighbor}. Rechne erst mit ${neighbor}.`,
    steps,
    result,
    visual,
  };
}

export function buildDecomposition(a, b) {
  const result = a * b;

  if (needsPlaceValueSplit(a) && needsPlaceValueSplit(b)) {
    const [a1, a2] = placeValueParts(a);
    const [b1, b2] = placeValueParts(b);
    const parts = [a1 * b1, a1 * b2, a2 * b1, a2 * b2];
    return {
      id: 'stellenwertzerlegung',
      label: 'Stellenwertzerlegung',
      hint: `Tipp: Zerlege beide Zahlen in Zehner und Einer: ${a} in ${a1} und ${a2}, ${b} in ${b1} und ${b2}.`,
      steps: [
        `${a} = ${a1} + ${a2}`,
        `${b} = ${b1} + ${b2}`,
        `${a} × ${b} = (${a1} + ${a2}) × (${b1} + ${b2})`,
        `= ${a1} × ${b1} + ${a1} × ${b2} + ${a2} × ${b1} + ${a2} × ${b2}`,
        `= ${parts.join(' + ')}`,
        `= ${result}`,
      ],
      result,
      visual: { rows: a, cols: b, splitDim: 'both', rowParts: [a1, a2], colParts: [b1, b2] },
    };
  }

  if (needsPlaceValueSplit(a) || needsPlaceValueSplit(b)) {
    const X = needsPlaceValueSplit(a) ? a : b;
    const Y = X === a ? b : a;
    const [x1, x2] = placeValueParts(X);
    return {
      id: 'stellenwertzerlegung',
      label: 'Stellenwertzerlegung',
      hint: `Tipp: Zerlege die ${X} in ${x1} und ${x2}.`,
      steps: [
        `${X} = ${x1} + ${x2}`,
        `${X} × ${Y} = ${x1} × ${Y} + ${x2} × ${Y}`,
        `= ${x1 * Y} + ${x2 * Y}`,
        `= ${result}`,
      ],
      result,
      visual: { rows: a, cols: b, splitDim: X === a ? 'rows' : 'cols', parts: [x1, x2] },
    };
  }

  if (isMultipleOfTen(a) && isMultipleOfTen(b)) {
    const fa = a / 10, fb = b / 10;
    return {
      id: 'zerlegen',
      label: 'Zerlegen',
      hint: `Tipp: ${a} ist ${fa} × 10 und ${b} ist ${fb} × 10.`,
      steps: [
        `${a} = ${fa} × 10 und ${b} = ${fb} × 10`,
        `${a} × ${b} = ${fa} × 10 × ${fb} × 10 = (${fa} × ${fb}) × 100`,
        `= ${fa * fb} × 100 = ${result}`,
      ],
      result,
    };
  }

  if (isMultipleOfTen(a) || isMultipleOfTen(b)) {
    const X = isMultipleOfTen(a) ? a : b;
    const Y = X === a ? b : a;
    const f = X / 10;
    return {
      id: 'zerlegen',
      label: 'Zerlegen',
      hint: `Tipp: ${X} ist ${f} × 10.`,
      steps: [
        `${X} = ${f} × 10`,
        `${X} × ${Y} = ${f} × 10 × ${Y} = ${f} × ${Y} × 10`,
        `= ${f * Y} × 10 = ${result}`,
      ],
      result,
      visual: { rows: a, cols: b, splitDim: 'none' },
    };
  }

  // Beide Faktoren <= 10 (und > 1): freundliche Zerlegung des ersten Faktors.
  const [p1, p2] = friendlyParts(a);
  if (p2 === 0) {
    return {
      id: 'zerlegen',
      label: 'Zerlegen',
      hint: `Tipp: ${a} × ${b} direkt auswendig oder über das Punktefeld abzählen.`,
      steps: [`${a} × ${b} = ${result}`],
      result,
      visual: { rows: a, cols: b, splitDim: 'none' },
    };
  }
  return {
    id: 'zerlegen',
    label: 'Zerlegen',
    hint: `Tipp: Zerlege die ${a} in ${p1} und ${p2}.`,
    steps: [
      `${a} = ${p1} + ${p2}`,
      `${a} × ${b} = ${p1} × ${b} + ${p2} × ${b}`,
      `= ${p1 * b} + ${p2 * b}`,
      `= ${result}`,
    ],
    result,
    visual: { rows: a, cols: b, splitDim: 'rows', parts: [p1, p2] },
  };
}

/**
 * Liefert alle sinnvollen Strategien für a × b, die erste in der Liste ist die
 * Standard-Strategie; weitere können per "Anderer Weg" durchgeschaltet werden.
 */
export function getStrategiesFor(a, b) {
  if (a <= 1 || b <= 1 || a === 0 || b === 0) {
    return [buildTrivial(a, b)];
  }

  const list = [];
  const nachbar = buildNachbaraufgabe(a, b);
  const verdoppeln = buildVerdoppeln(a, b);
  const decomposition = buildDecomposition(a, b);
  const tausch = a !== b ? buildTauschaufgabe(a, b) : null;

  if (nachbar) list.push(nachbar);
  if (verdoppeln) list.push(verdoppeln);
  list.push(decomposition);
  if (tausch) list.push(tausch);

  return list;
}

export function getDefaultHint(a, b) {
  return getStrategiesFor(a, b)[0].hint;
}
