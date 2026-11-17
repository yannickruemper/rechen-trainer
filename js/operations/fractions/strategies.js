// Reine Funktionen: Rechenweg-Strategien für frac1 ± frac2 (Bruchrechnung).

import { lcm, simplifyFraction } from '../../shared/numberUtils.js';

function opSymbol(op) {
  return op === '+' ? '+' : '−';
}
function fracLabel(f) {
  return `${f.num}/${f.den}`;
}

export function buildGleichnamig(frac1, frac2, op) {
  const d = frac1.den;
  const combinedNum = op === '+' ? frac1.num + frac2.num : frac1.num - frac2.num;
  const simplified = simplifyFraction(combinedNum, d);
  const steps = [
    `Die Nenner sind schon gleich: beide ${d}.`,
    `${fracLabel(frac1)} ${opSymbol(op)} ${fracLabel(frac2)} = (${frac1.num} ${opSymbol(op)} ${frac2.num}) / ${d} = ${combinedNum}/${d}`,
  ];
  if (simplified.den !== d || simplified.num !== combinedNum) {
    steps.push(`gekürzt: ${simplified.num}/${simplified.den}`);
  }
  return {
    id: 'gleichnamig',
    label: 'Gleichnamige Brüche',
    hint: 'Tipp: Bei gleichen Nennern rechnest du nur mit den Zählern – der Nenner bleibt.',
    steps,
    result: simplified,
    visual: { type: 'fractionbar', den: d, parts: [frac1.num, frac2.num], op },
  };
}

export function buildHauptnenner(frac1, frac2, op) {
  const L = lcm(frac1.den, frac2.den);
  const factor1 = L / frac1.den;
  const factor2 = L / frac2.den;
  const n1 = frac1.num * factor1;
  const n2 = frac2.num * factor2;
  const combinedNum = op === '+' ? n1 + n2 : n1 - n2;
  const simplified = simplifyFraction(combinedNum, L);
  const steps = [
    `Der Hauptnenner von ${frac1.den} und ${frac2.den} ist ${L}.`,
    `${fracLabel(frac1)} = ${n1}/${L} (erweitert mit ${factor1})`,
    `${fracLabel(frac2)} = ${n2}/${L} (erweitert mit ${factor2})`,
    `${n1}/${L} ${opSymbol(op)} ${n2}/${L} = ${combinedNum}/${L}`,
  ];
  if (simplified.den !== L || simplified.num !== combinedNum) {
    steps.push(`gekürzt: ${simplified.num}/${simplified.den}`);
  }
  return {
    id: 'hauptnenner',
    label: 'Hauptnenner bilden',
    hint: `Tipp: Finde den Hauptnenner von ${frac1.den} und ${frac2.den}.`,
    steps,
    result: simplified,
    visual: { type: 'fractionbar', den: L, parts: [n1, n2], op },
  };
}

export function buildNennerMultiplizieren(frac1, frac2, op) {
  const L = frac1.den * frac2.den;
  const n1 = frac1.num * frac2.den;
  const n2 = frac2.num * frac1.den;
  const combinedNum = op === '+' ? n1 + n2 : n1 - n2;
  const simplified = simplifyFraction(combinedNum, L);
  const steps = [
    `Du multiplizierst einfach beide Nenner: ${frac1.den} × ${frac2.den} = ${L}.`,
    `${fracLabel(frac1)} = ${n1}/${L}`,
    `${fracLabel(frac2)} = ${n2}/${L}`,
    `${n1}/${L} ${opSymbol(op)} ${n2}/${L} = ${combinedNum}/${L}`,
  ];
  if (simplified.den !== L || simplified.num !== combinedNum) {
    steps.push(`gekürzt: ${simplified.num}/${simplified.den}`);
  }
  return {
    id: 'nenner-multiplizieren',
    label: 'Nenner multiplizieren',
    hint: `Tipp: Multipliziere einfach beide Nenner miteinander – das funktioniert immer.`,
    steps,
    result: simplified,
    visual: { type: 'fractionbar', den: L, parts: [n1, n2], op },
  };
}

/**
 * Liefert alle sinnvollen Strategien für frac1 ± frac2. Bei gleichem Nenner gibt es nur
 * einen Weg; bei ungleichem Nenner wird der Hauptnenner bevorzugt, mit "Nenner
 * multiplizieren" als Alternative, wenn sie sich vom Hauptnenner unterscheidet.
 */
export function getStrategiesFor(frac1, frac2, op) {
  if (frac1.den === frac2.den) {
    return [buildGleichnamig(frac1, frac2, op)];
  }
  const list = [buildHauptnenner(frac1, frac2, op)];
  if (frac1.den * frac2.den !== lcm(frac1.den, frac2.den)) {
    list.push(buildNennerMultiplizieren(frac1, frac2, op));
  }
  return list;
}

export function getDefaultHint(frac1, frac2, op) {
  return getStrategiesFor(frac1, frac2, op)[0].hint;
}
