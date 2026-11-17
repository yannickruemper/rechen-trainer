import { generateTask } from '../../js/operations/subtraction/taskGenerator.js';
import { section, test, assertEqual, assertTrue, assertInRange } from '../testUtils.js';

section('subtraction/taskGenerator');

test('generateTask: answer ist immer a-b, und a>=b', () => {
  for (const mode of ['kleines-einsminuseins', 'grosses-einsminuseins', 'kopfrechnen', 'schriftlich']) {
    for (let i = 0; i < 50; i++) {
      const t = generateTask({ mode, difficulty: 1 + (i % 3) });
      assertEqual(t.answer, t.a - t.b, `${mode} answer`);
      assertTrue(t.a >= t.b, `${mode}: a (${t.a}) sollte >= b (${t.b}) sein`);
      assertEqual(t.operation, 'subtraction');
    }
  }
});

test('kleines-einsminuseins: b liegt in 1..10, a in b..20', () => {
  for (let i = 0; i < 100; i++) {
    const t = generateTask({ mode: 'kleines-einsminuseins', difficulty: 1 });
    assertInRange(t.b, 1, 10, 'b');
    assertInRange(t.a, t.b, 20, 'a');
  }
});

test('kleines-einsminuseins: selectedRows wird auf b angewendet', () => {
  for (let i = 0; i < 100; i++) {
    const t = generateTask({ mode: 'kleines-einsminuseins', difficulty: 1, selectedRows: [3, 7] });
    assertTrue(t.b === 3 || t.b === 7, `b sollte 3 oder 7 sein, war ${t.b}`);
  }
});

test('grosses-einsminuseins: b liegt in 1..20, a in b..40', () => {
  for (let i = 0; i < 100; i++) {
    const t = generateTask({ mode: 'grosses-einsminuseins', difficulty: 2 });
    assertInRange(t.b, 1, 20, 'b');
    assertInRange(t.a, t.b, 40, 'a');
  }
});

test('schriftlich: Stellenzahl wächst mit der Schwierigkeit', () => {
  for (let i = 0; i < 30; i++) {
    const easy = generateTask({ mode: 'schriftlich', difficulty: 1 });
    assertInRange(easy.a, 10, 99, 'a (leicht, zweistellig)');
    const hard = generateTask({ mode: 'schriftlich', difficulty: 3 });
    assertInRange(hard.a, 1000, 9999, 'a (schwer, vierstellig)');
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
