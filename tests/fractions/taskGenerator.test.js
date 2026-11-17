import { generateTask, computeAnswer } from '../../js/operations/fractions/taskGenerator.js';
import { gcd } from '../../js/shared/numberUtils.js';
import { section, test, assertEqual, assertTrue, assertInRange } from '../testUtils.js';

section('fractions/taskGenerator');

function isReduced(f) {
  return gcd(f.num, f.den) === 1 || f.num === 0;
}

test('generateTask: answer stimmt mit computeAnswer überein und ist gekürzt', () => {
  for (const mode of ['gleichnamig', 'ungleichnamig']) {
    for (let i = 0; i < 100; i++) {
      const t = generateTask({ mode, difficulty: 1 + (i % 3) });
      const expected = computeAnswer(t.frac1, t.frac2, t.op);
      assertEqual(t.answer.num, expected.num, `${mode} answer.num`);
      assertEqual(t.answer.den, expected.den, `${mode} answer.den`);
      assertTrue(isReduced(t.answer), `${mode}: Ergebnis ${t.answer.num}/${t.answer.den} sollte gekürzt sein`);
      assertEqual(t.operation, 'fractions');
    }
  }
});

test('generateTask: bei Subtraktion ist das Ergebnis nie negativ', () => {
  for (const mode of ['gleichnamig', 'ungleichnamig']) {
    for (let i = 0; i < 100; i++) {
      const t = generateTask({ mode, difficulty: 1 + (i % 3) });
      if (t.op === '-') {
        assertTrue(t.answer.num >= 0, `${mode}: ${t.frac1.num}/${t.frac1.den} - ${t.frac2.num}/${t.frac2.den} wurde negativ`);
      }
    }
  }
});

test('gleichnamig: beide Brüche haben denselben Nenner', () => {
  for (let i = 0; i < 100; i++) {
    const t = generateTask({ mode: 'gleichnamig', difficulty: 2 });
    assertEqual(t.frac1.den, t.frac2.den);
    assertInRange(t.frac1.num, 1, t.frac1.den - 1, 'Zähler im gültigen Bereich');
  }
});

test('ungleichnamig: Nenner unterscheiden sich', () => {
  for (let i = 0; i < 100; i++) {
    const t = generateTask({ mode: 'ungleichnamig', difficulty: 2 });
    assertTrue(t.frac1.den !== t.frac2.den, `Nenner sollten sich unterscheiden: ${t.frac1.den} vs ${t.frac2.den}`);
  }
});

test('ungleichnamig Schwierigkeit 1: ein Nenner ist Vielfaches des anderen', () => {
  for (let i = 0; i < 100; i++) {
    const t = generateTask({ mode: 'ungleichnamig', difficulty: 1 });
    const bigger = Math.max(t.frac1.den, t.frac2.den);
    const smaller = Math.min(t.frac1.den, t.frac2.den);
    assertEqual(bigger % smaller, 0, `${bigger} sollte Vielfaches von ${smaller} sein`);
  }
});

test('generateTask wirft bei unbekanntem Modus', () => {
  let threw = false;
  try {
    generateTask({ mode: 'unsinn' });
  } catch {
    threw = true;
  }
  assertTrue(threw, 'sollte werfen');
});
