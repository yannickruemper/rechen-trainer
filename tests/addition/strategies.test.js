import {
  getStrategiesFor,
  getDefaultHint,
  buildTauschaufgabe,
  buildVerdoppeln,
  buildZehnerUebergang,
  buildZerlegen,
} from '../../js/operations/addition/strategies.js';
import { section, test, assertEqual, assertTrue } from '../testUtils.js';

section('addition/strategies');

function lastNumberIn(text) {
  const matches = text.match(/-?\d+/g);
  return matches ? Number(matches[matches.length - 1]) : NaN;
}

test('getStrategiesFor: für viele a,b ist jede Strategie mathematisch korrekt', () => {
  const pairs = [];
  for (let a = 1; a <= 20; a++) {
    for (let b = 1; b <= 20; b++) pairs.push([a, b]);
  }
  pairs.push([23, 45], [57, 38], [100, 234], [1234, 567]);

  for (const [a, b] of pairs) {
    const strategies = getStrategiesFor(a, b);
    assertTrue(strategies.length > 0, `${a}+${b}: mindestens eine Strategie`);
    for (const s of strategies) {
      assertEqual(s.result, a + b, `${a}+${b} (${s.id}): result-Feld`);
      const lastStepValue = lastNumberIn(s.steps[s.steps.length - 1]);
      assertEqual(lastStepValue, a + b, `${a}+${b} (${s.id}): letzter Schritt nennt das Ergebnis`);
      assertTrue(typeof s.hint === 'string' && s.hint.length > 0, `${a}+${b} (${s.id}): hat einen Tipp`);
    }
  }
});

test('Tipp verrät nie direkt das Endergebnis (Stichprobe)', () => {
  const cases = [[8, 5], [7, 8], [23, 45]];
  for (const [a, b] of cases) {
    const hint = getDefaultHint(a, b);
    assertTrue(!hint.includes(`= ${a + b}`), `Tipp für ${a}+${b} verrät das Ergebnis: "${hint}"`);
  }
});

test('buildTauschaufgabe: 3+8 wird zu 8+3', () => {
  const s = buildTauschaufgabe(3, 8);
  assertEqual(s.result, 11);
  assertTrue(s.steps.some((step) => step.includes('8 + 3')));
});

test('buildVerdoppeln: 7+8 nutzt die Verdopplung von 7', () => {
  const s = buildVerdoppeln(7, 8);
  assertTrue(s !== null);
  assertEqual(s.result, 15);
  assertTrue(s.steps.some((step) => step.includes('7 + 7 = 14')));
});

test('buildVerdoppeln: liefert null bei zu großem Abstand', () => {
  assertEqual(buildVerdoppeln(2, 9), null);
});

test('buildZehnerUebergang: 8+5 = 10+3', () => {
  const s = buildZehnerUebergang(8, 5);
  assertTrue(s !== null);
  assertEqual(s.result, 13);
  assertTrue(s.steps.some((step) => step.includes('8 + 2 = 10')));
  assertTrue(s.steps.some((step) => step.includes('5 = 2 + 3')));
});

test('buildZehnerUebergang: liefert null bei glatten Zehnern', () => {
  assertEqual(buildZehnerUebergang(20, 30), null);
});

test('buildZerlegen: Stellenwertzerlegung bei 23+45', () => {
  const s = buildZerlegen(23, 45);
  assertEqual(s.result, 68);
  assertEqual(s.steps[0], '23 = 20 + 3');
  assertEqual(s.steps[1], '45 = 40 + 5');
});

test('buildZerlegen: einseitige Stellenwertzerlegung bei 23+5', () => {
  const s = buildZerlegen(23, 5);
  assertEqual(s.result, 28);
  assertTrue(s.steps.some((step) => step.includes('23 = 20 + 3')));
});
