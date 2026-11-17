import {
  getStrategiesFor,
  getDefaultHint,
  buildGleichnamig,
  buildHauptnenner,
  buildNennerMultiplizieren,
} from '../../js/operations/fractions/strategies.js';
import { computeAnswer } from '../../js/operations/fractions/taskGenerator.js';
import { section, test, assertEqual, assertTrue } from '../testUtils.js';

section('fractions/strategies');

test('getStrategiesFor: für viele Brüche stimmt jede Strategie mit computeAnswer überein', () => {
  const cases = [];
  for (let d = 2; d <= 10; d++) {
    for (let n1 = 1; n1 < d; n1++) {
      for (let n2 = 1; n2 < d; n2++) {
        cases.push([{ num: n1, den: d }, { num: n2, den: d }, '+']);
      }
    }
  }
  cases.push([{ num: 1, den: 3 }, { num: 1, den: 4 }, '+']);
  cases.push([{ num: 3, den: 4 }, { num: 1, den: 4 }, '-']);
  cases.push([{ num: 2, den: 3 }, { num: 1, den: 6 }, '+']);
  cases.push([{ num: 5, den: 6 }, { num: 1, den: 4 }, '-']);
  cases.push([{ num: 2, den: 3 }, { num: 3, den: 5 }, '+']);

  for (const [frac1, frac2, op] of cases) {
    if (op === '-' && frac1.num / frac1.den < frac2.num / frac2.den) continue; // nur gültige (nicht-negative) Fälle
    const expected = computeAnswer(frac1, frac2, op);
    const strategies = getStrategiesFor(frac1, frac2, op);
    assertTrue(strategies.length > 0, 'mindestens eine Strategie');
    for (const s of strategies) {
      assertEqual(s.result.num, expected.num, `${frac1.num}/${frac1.den} ${op} ${frac2.num}/${frac2.den} (${s.id}): Zähler`);
      assertEqual(s.result.den, expected.den, `${frac1.num}/${frac1.den} ${op} ${frac2.num}/${frac2.den} (${s.id}): Nenner`);
      assertTrue(s.steps.length > 0, `${s.id}: hat Schritte`);
      assertTrue(typeof s.hint === 'string' && s.hint.length > 0, `${s.id}: hat einen Tipp`);
    }
  }
});

test('getStrategiesFor: gleicher Nenner liefert nur eine Strategie', () => {
  const strategies = getStrategiesFor({ num: 2, den: 5 }, { num: 1, den: 5 }, '+');
  assertEqual(strategies.length, 1);
  assertEqual(strategies[0].id, 'gleichnamig');
});

test('getStrategiesFor: ungleicher Nenner liefert den Hauptnenner-Weg zuerst', () => {
  const strategies = getStrategiesFor({ num: 1, den: 3 }, { num: 1, den: 4 }, '+');
  assertEqual(strategies[0].id, 'hauptnenner');
});

test('buildGleichnamig: 3/7 + 2/7 = 5/7', () => {
  const s = buildGleichnamig({ num: 3, den: 7 }, { num: 2, den: 7 }, '+');
  assertEqual(s.result.num, 5);
  assertEqual(s.result.den, 7);
});

test('buildGleichnamig: kürzt das Ergebnis, wenn nötig (2/6 + 1/6 = 1/2)', () => {
  const s = buildGleichnamig({ num: 2, den: 6 }, { num: 1, den: 6 }, '+');
  assertEqual(s.result.num, 1);
  assertEqual(s.result.den, 2);
  assertTrue(s.steps.some((step) => step.includes('gekürzt')));
});

test('buildHauptnenner: 1/3 + 1/4 = 7/12', () => {
  const s = buildHauptnenner({ num: 1, den: 3 }, { num: 1, den: 4 }, '+');
  assertEqual(s.result.num, 7);
  assertEqual(s.result.den, 12);
  assertTrue(s.steps[0].includes('12'));
});

test('buildNennerMultiplizieren: liefert dasselbe Endergebnis wie buildHauptnenner', () => {
  const a = buildHauptnenner({ num: 2, den: 3 }, { num: 3, den: 5 }, '+');
  const b = buildNennerMultiplizieren({ num: 2, den: 3 }, { num: 3, den: 5 }, '+');
  assertEqual(a.result.num, b.result.num);
  assertEqual(a.result.den, b.result.den);
});

test('Tipp verrät nie direkt das Endergebnis (Stichprobe)', () => {
  const hint = getDefaultHint({ num: 1, den: 3 }, { num: 1, den: 4 }, '+');
  assertTrue(!hint.includes('7/12'), `Tipp verrät das Ergebnis: "${hint}"`);
});
