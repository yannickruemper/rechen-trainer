import {
  getStrategiesFor,
  getDefaultHint,
  buildTrivial,
  buildTauschaufgabe,
  buildVerdoppeln,
  buildNachbaraufgabe,
  buildDecomposition,
} from '../../js/operations/multiplication/strategies.js';
import { section, test, assertEqual, assertTrue } from '../testUtils.js';

section('strategies');

function lastNumberIn(text) {
  const matches = text.match(/-?\d+/g);
  return matches ? Number(matches[matches.length - 1]) : NaN;
}

test('getStrategiesFor: für viele a,b ist jede Strategie mathematisch korrekt', () => {
  const pairs = [];
  for (let a = 1; a <= 20; a++) {
    for (let b = 1; b <= 20; b++) pairs.push([a, b]);
  }
  // ein paar realistische Kopfrechnen/schriftlich-Zahlenpaare dazu
  pairs.push([23, 7], [34, 12], [99, 6], [48, 19], [57, 23], [100, 10], [20, 30]);

  for (const [a, b] of pairs) {
    const strategies = getStrategiesFor(a, b);
    assertTrue(strategies.length > 0, `${a}x${b}: mindestens eine Strategie`);
    for (const s of strategies) {
      assertEqual(s.result, a * b, `${a}x${b} (${s.id}): result-Feld`);
      assertTrue(s.steps.length > 0, `${a}x${b} (${s.id}): hat Schritte`);
      const lastStepValue = lastNumberIn(s.steps[s.steps.length - 1]);
      assertEqual(lastStepValue, a * b, `${a}x${b} (${s.id}): letzter Schritt nennt das Ergebnis`);
      assertTrue(typeof s.hint === 'string' && s.hint.length > 0, `${a}x${b} (${s.id}): hat einen Tipp`);
    }
  }
});

test('Tipp verrät nie direkt das Endergebnis (Stichprobe)', () => {
  const cases = [
    [7, 8],
    [9, 6],
    [4, 7],
    [23, 7],
  ];
  for (const [a, b] of cases) {
    const hint = getDefaultHint(a, b);
    const result = String(a * b);
    assertTrue(!hint.includes(`= ${result}`), `Tipp für ${a}x${b} verrät das Ergebnis: "${hint}"`);
  }
});

test('buildTrivial: 1 mal etwas ändert nichts, 0 mal etwas ist 0', () => {
  assertEqual(buildTrivial(1, 9).result, 9);
  assertEqual(buildTrivial(9, 1).result, 9);
  assertEqual(buildTrivial(0, 9).result, 0);
});

test('getStrategiesFor: Grenzfälle mit 0/1 liefern nur die Direkt-Strategie', () => {
  assertEqual(getStrategiesFor(1, 7).length, 1);
  assertEqual(getStrategiesFor(7, 1)[0].id, 'trivial');
});

test('buildTauschaufgabe: 3x8 wird zu 8x3', () => {
  const s = buildTauschaufgabe(3, 8);
  assertEqual(s.result, 24);
  assertTrue(s.steps.some((step) => step.includes('8 × 3')), 'enthält vertauschte Aufgabe');
});

test('buildVerdoppeln: 4x7 = doppelt 2x7 (Spec-Beispiel)', () => {
  const s = buildVerdoppeln(4, 7);
  assertTrue(s !== null, 'Strategie sollte anwendbar sein');
  assertEqual(s.result, 28);
  assertTrue(s.steps.some((step) => step.includes('2 × 7 = 14')), 'Halbierungsschritt fehlt');
});

test('buildVerdoppeln: liefert null, wenn kein Faktor gerade ist', () => {
  assertEqual(buildVerdoppeln(3, 5), null);
});

test('buildNachbaraufgabe: 9x6 = 10x6 - 6 (Spec-Beispiel)', () => {
  const s = buildNachbaraufgabe(9, 6);
  assertTrue(s !== null, 'Strategie sollte anwendbar sein');
  assertEqual(s.result, 54);
  assertTrue(s.steps.some((step) => step.includes('10 × 6 = 60')), 'Nachbar-Schritt fehlt');
  assertTrue(s.steps.some((step) => step.includes('60 − 6 = 54')), 'Subtraktionsschritt fehlt');
});

test('buildNachbaraufgabe: 11x4 = 10x4 + 4 (plus-Fall)', () => {
  const s = buildNachbaraufgabe(11, 4);
  assertTrue(s !== null);
  assertEqual(s.result, 44);
  assertTrue(s.steps.some((step) => step.includes('+')), 'sollte eine Addition zeigen');
});

test('buildNachbaraufgabe: liefert null ohne Neun/Elfer-Nachbarn', () => {
  assertEqual(buildNachbaraufgabe(4, 7), null);
});

test('buildDecomposition: 7x8 = 5x8 + 2x8 (Spec-Beispiel)', () => {
  const s = buildDecomposition(7, 8);
  assertEqual(s.result, 56);
  assertEqual(s.steps[0], '7 = 5 + 2');
  assertEqual(s.steps[1], '7 × 8 = 5 × 8 + 2 × 8');
  assertEqual(s.steps[2], '= 40 + 16');
  assertEqual(s.steps[3], '= 56');
});

test('buildDecomposition: Stellenwertzerlegung bei 23x7', () => {
  const s = buildDecomposition(23, 7);
  assertEqual(s.result, 161);
  assertTrue(s.steps.some((step) => step.includes('23 = 20 + 3')), 'Stellenwert-Zerlegung fehlt');
});

test('buildDecomposition: doppelte Stellenwertzerlegung bei 34x12', () => {
  const s = buildDecomposition(34, 12);
  assertEqual(s.result, 408);
  assertEqual(s.visual.splitDim, 'both');
});

test('buildDecomposition: glatte Zehner (20x30)', () => {
  const s = buildDecomposition(20, 30);
  assertEqual(s.result, 600);
});
