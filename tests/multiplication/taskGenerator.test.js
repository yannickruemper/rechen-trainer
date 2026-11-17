import { generateTask, weightForFact, pickWeighted } from '../../js/operations/multiplication/taskGenerator.js';
import { section, test, assertEqual, assertTrue, assertInRange } from '../testUtils.js';

section('taskGenerator');

test('generateTask: answer ist immer a*b', () => {
  for (const mode of ['kleines-einmaleins', 'grosses-einmaleins', 'kopfrechnen', 'schriftlich']) {
    for (let i = 0; i < 50; i++) {
      const t = generateTask({ mode, difficulty: 1 + (i % 3) });
      assertEqual(t.answer, t.a * t.b, `${mode} answer`);
    }
  }
});

test('kleines-einmaleins: a,b liegen in 1..10', () => {
  for (let i = 0; i < 100; i++) {
    const t = generateTask({ mode: 'kleines-einmaleins', difficulty: 1 });
    assertInRange(t.a, 1, 10, 'a');
    assertInRange(t.b, 1, 10, 'b');
  }
});

test('kleines-einmaleins: selectedRows wird respektiert', () => {
  for (let i = 0; i < 100; i++) {
    const t = generateTask({ mode: 'kleines-einmaleins', difficulty: 1, selectedRows: [3, 7] });
    assertTrue(t.a === 3 || t.a === 7, `a sollte 3 oder 7 sein, war ${t.a}`);
  }
});

test('kleines-einmaleins: Schwierigkeit 3 vermeidet 1, 10', () => {
  for (let i = 0; i < 100; i++) {
    const t = generateTask({ mode: 'kleines-einmaleins', difficulty: 3 });
    assertTrue(t.a !== 1 && t.b !== 1 && t.a !== 10 && t.b !== 10, `unerwartet trivial: ${t.a}x${t.b}`);
  }
});

test('grosses-einmaleins: a,b liegen in 1..20', () => {
  for (let i = 0; i < 100; i++) {
    const t = generateTask({ mode: 'grosses-einmaleins', difficulty: 2 });
    assertInRange(t.a, 1, 20, 'a');
    assertInRange(t.b, 1, 20, 'b');
  }
});

test('kopfrechnen: a ist zweistellig, b passt zur Schwierigkeit', () => {
  for (let i = 0; i < 50; i++) {
    const easy = generateTask({ mode: 'kopfrechnen', difficulty: 1 });
    assertInRange(easy.a, 11, 49, 'a (leicht)');
    assertInRange(easy.b, 2, 9, 'b (leicht)');

    const hard = generateTask({ mode: 'kopfrechnen', difficulty: 3 });
    assertInRange(hard.a, 11, 99, 'a (schwer)');
    assertInRange(hard.b, 11, 20, 'b (schwer), zweistellig');
  }
});

test('schriftlich: Stellenzahl wächst mit der Schwierigkeit', () => {
  for (let i = 0; i < 50; i++) {
    const easy = generateTask({ mode: 'schriftlich', difficulty: 1 });
    assertInRange(easy.a, 10, 99, 'a (leicht, zweistellig)');
    assertInRange(easy.b, 2, 9, 'b (leicht, einstellig)');

    const hard = generateTask({ mode: 'schriftlich', difficulty: 3 });
    assertInRange(hard.a, 100, 999, 'a (schwer, dreistellig)');
    assertInRange(hard.b, 11, 99, 'b (schwer, zweistellig)');
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

test('weightForFact: unbekannte Aufgabe bekommt mittleres Gewicht', () => {
  assertEqual(weightForFact(null), 3);
  assertEqual(weightForFact({ attempts: 0, correct: 0 }), 3);
});

test('weightForFact: fehlerhafte Aufgaben bekommen höheres Gewicht als sichere', () => {
  const safe = weightForFact({ attempts: 10, correct: 10 });
  const shaky = weightForFact({ attempts: 10, correct: 2 });
  assertTrue(shaky > safe, `shaky (${shaky}) sollte > safe (${safe}) sein`);
});

test('pickWeighted: ein Element mit Gewicht 0 wird nie gewählt', () => {
  const items = ['a', 'b'];
  const weights = [1, 0];
  for (let i = 0; i < 50; i++) {
    const picked = pickWeighted(items, weights, Math.random);
    assertEqual(picked, 'a');
  }
});

test('pickWeighted: deterministische rng wählt das erwartete Element', () => {
  const items = ['a', 'b', 'c'];
  const weights = [1, 1, 1]; // Gesamtgewicht 3, Grenzen bei 1 und 2
  assertEqual(pickWeighted(items, weights, () => 0), 'a');
  assertEqual(pickWeighted(items, weights, () => 0.5), 'b'); // 0.5*3=1.5 -> nach Abzug von 1 bleibt 0.5>0 -> b
  assertEqual(pickWeighted(items, weights, () => 0.9999), 'c');
});
