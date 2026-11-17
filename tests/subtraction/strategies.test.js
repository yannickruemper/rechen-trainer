import {
  getStrategiesFor,
  getDefaultHint,
  buildNachbaraufgabe,
  buildErgaenzen,
  buildZerlegen,
} from '../../js/operations/subtraction/strategies.js';
import { section, test, assertEqual, assertTrue } from '../testUtils.js';

section('subtraction/strategies');

function lastNumberIn(text) {
  const matches = text.match(/-?\d+/g);
  return matches ? Number(matches[matches.length - 1]) : NaN;
}

test('getStrategiesFor: für viele a,b (a>=b) ist jede Strategie mathematisch korrekt', () => {
  const pairs = [];
  for (let a = 0; a <= 40; a++) {
    for (let b = 0; b <= a; b++) pairs.push([a, b]);
  }
  pairs.push([45, 23], [100, 37], [1234, 567], [1000, 1]);

  for (const [a, b] of pairs) {
    const strategies = getStrategiesFor(a, b);
    assertTrue(strategies.length > 0, `${a}-${b}: mindestens eine Strategie`);
    for (const s of strategies) {
      assertEqual(s.result, a - b, `${a}-${b} (${s.id}): result-Feld`);
      const lastStepValue = lastNumberIn(s.steps[s.steps.length - 1]);
      assertEqual(lastStepValue, a - b, `${a}-${b} (${s.id}): letzter Schritt nennt das Ergebnis`);
      assertTrue(typeof s.hint === 'string' && s.hint.length > 0, `${a}-${b} (${s.id}): hat einen Tipp`);
    }
  }
});

test('Tipp verrät nie direkt das Endergebnis (Stichprobe)', () => {
  const cases = [[15, 7], [23, 9], [45, 23]];
  for (const [a, b] of cases) {
    const hint = getDefaultHint(a, b);
    assertTrue(!hint.includes(`= ${a - b}`), `Tipp für ${a}-${b} verrät das Ergebnis: "${hint}"`);
  }
});

test('buildNachbaraufgabe: 23-9 = 23-10+1', () => {
  const s = buildNachbaraufgabe(23, 9);
  assertTrue(s !== null);
  assertEqual(s.result, 14);
  assertTrue(s.steps.some((step) => step.includes('23 − 10 = 13')));
});

test('buildNachbaraufgabe: 23-11 = 23-10-1', () => {
  const s = buildNachbaraufgabe(23, 11);
  assertTrue(s !== null);
  assertEqual(s.result, 12);
});

test('buildNachbaraufgabe: liefert null ohne Neun/Elfer-Nachbarn', () => {
  assertEqual(buildNachbaraufgabe(23, 7), null);
});

test('buildErgaenzen: 15-7 = 3+5 (Spec-Beispiel)', () => {
  const s = buildErgaenzen(15, 7);
  assertTrue(s !== null);
  assertEqual(s.result, 8);
  assertEqual(s.steps[0], '7 + 3 = 10');
  assertEqual(s.steps[2], '15 − 7 = 3 + 5 = 8');
});

test('buildErgaenzen: liefert null bei glattem Subtrahend', () => {
  assertEqual(buildErgaenzen(50, 20), null);
});

test('buildZerlegen: 45-23 ohne Entbündeln', () => {
  const s = buildZerlegen(45, 23);
  assertEqual(s.result, 22);
  assertEqual(s.steps[0], '45 = 40 + 5');
});

test('buildZerlegen: 15-7 mit Entbündeln', () => {
  const s = buildZerlegen(15, 7);
  assertEqual(s.result, 8);
  assertTrue(s.steps.some((step) => step.includes('entbündelt')));
});

test('getStrategiesFor: kein Tauschaufgabe-Eintrag (Subtraktion ist nicht kommutativ)', () => {
  const strategies = getStrategiesFor(15, 7);
  assertTrue(!strategies.some((s) => s.id === 'tauschaufgabe'));
});
