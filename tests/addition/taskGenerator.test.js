import { generateTask } from '../../js/operations/addition/taskGenerator.js';
import { section, test, assertEqual, assertTrue, assertInRange } from '../testUtils.js';

section('addition/taskGenerator');

test('generateTask: answer ist immer a+b', () => {
  for (const mode of ['kleines-einspluseins', 'grosses-einspluseins', 'kopfrechnen', 'schriftlich']) {
    for (let i = 0; i < 50; i++) {
      const t = generateTask({ mode, difficulty: 1 + (i % 3) });
      assertEqual(t.answer, t.a + t.b, `${mode} answer`);
      assertEqual(t.operation, 'addition');
    }
  }
});

test('kleines-einspluseins: a,b liegen in 1..10', () => {
  for (let i = 0; i < 100; i++) {
    const t = generateTask({ mode: 'kleines-einspluseins', difficulty: 1 });
    assertInRange(t.a, 1, 10, 'a');
    assertInRange(t.b, 1, 10, 'b');
  }
});

test('kleines-einspluseins: selectedRows wird respektiert', () => {
  for (let i = 0; i < 100; i++) {
    const t = generateTask({ mode: 'kleines-einspluseins', difficulty: 1, selectedRows: [3, 7] });
    assertTrue(t.a === 3 || t.a === 7, `a sollte 3 oder 7 sein, war ${t.a}`);
  }
});

test('grosses-einspluseins: a,b liegen in 1..20', () => {
  for (let i = 0; i < 100; i++) {
    const t = generateTask({ mode: 'grosses-einspluseins', difficulty: 2 });
    assertInRange(t.a, 1, 20, 'a');
    assertInRange(t.b, 1, 20, 'b');
  }
});

test('kopfrechnen: Zahlen wachsen mit der Schwierigkeit', () => {
  for (let i = 0; i < 30; i++) {
    const easy = generateTask({ mode: 'kopfrechnen', difficulty: 1 });
    assertInRange(easy.a, 11, 49, 'a (leicht)');
    const hard = generateTask({ mode: 'kopfrechnen', difficulty: 3 });
    assertInRange(hard.a, 100, 499, 'a (schwer, dreistellig)');
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
