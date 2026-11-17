import { generateTask } from '../../js/operations/division/taskGenerator.js';
import { section, test, assertEqual, assertTrue, assertInRange } from '../testUtils.js';

section('division/taskGenerator');

test('generateTask: answer ist immer a/b, geht restlos auf', () => {
  for (const mode of ['kleine-division', 'grosse-division', 'kopfrechnen', 'schriftlich']) {
    for (let i = 0; i < 50; i++) {
      const t = generateTask({ mode, difficulty: 1 + (i % 3) });
      assertEqual(t.a % t.b, 0, `${mode}: ${t.a} sollte durch ${t.b} teilbar sein`);
      assertEqual(t.answer, t.a / t.b, `${mode} answer`);
      assertEqual(t.operation, 'division');
    }
  }
});

test('kleine-division: b in 1..10, Quotient in 1..10', () => {
  for (let i = 0; i < 100; i++) {
    const t = generateTask({ mode: 'kleine-division', difficulty: 1 });
    assertInRange(t.b, 1, 10, 'b');
    assertInRange(t.answer, 1, 10, 'Quotient');
  }
});

test('kleine-division: selectedRows wird auf den Divisor angewendet', () => {
  for (let i = 0; i < 100; i++) {
    const t = generateTask({ mode: 'kleine-division', difficulty: 1, selectedRows: [3, 7] });
    assertTrue(t.b === 3 || t.b === 7, `b sollte 3 oder 7 sein, war ${t.b}`);
  }
});

test('grosse-division: b in 1..20, Quotient in 1..20', () => {
  for (let i = 0; i < 100; i++) {
    const t = generateTask({ mode: 'grosse-division', difficulty: 2 });
    assertInRange(t.b, 1, 20, 'b');
    assertInRange(t.answer, 1, 20, 'Quotient');
  }
});

test('schriftlich: Divisor wird bei Schwierigkeit 3 zweistellig', () => {
  for (let i = 0; i < 30; i++) {
    const hard = generateTask({ mode: 'schriftlich', difficulty: 3 });
    assertInRange(hard.b, 11, 20, 'b (schwer, zweistellig)');
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
