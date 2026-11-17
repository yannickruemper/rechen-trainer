import { digits, computeWrittenSubtraction, getWrittenSteps, simulateNoBorrow } from '../../js/operations/subtraction/writtenMethod.js';
import { section, test, assertEqual, assertTrue } from '../testUtils.js';

section('subtraction/writtenMethod');

test('computeWrittenSubtraction: 52 - 38 = 14 mit Entbündeln', () => {
  const data = computeWrittenSubtraction(52, 38);
  assertEqual(data.answer, 14);
  assertEqual(data.columns[0].diff, 4);
  assertEqual(data.columns[0].borrowOut, 1);
  assertEqual(data.columns[1].diff, 1);
  assertEqual(data.columns[1].borrowIn, 1);
});

test('computeWrittenSubtraction: answer stimmt für viele Zahlen', () => {
  const cases = [[9, 5], [52, 38], [900, 1], [1000, 1], [12345, 6789], [100, 100]];
  for (const [a, b] of cases) {
    const data = computeWrittenSubtraction(a, b);
    assertEqual(data.answer, a - b, `${a}-${b}`);
  }
});

test('getWrittenSteps: letzter Schritt nennt das Endergebnis', () => {
  const { steps, data } = getWrittenSteps(52, 38);
  assertTrue(steps[steps.length - 1].includes(String(data.answer)));
  assertEqual(steps.length, data.columns.length + 1);
});

test('simulateNoBorrow: weicht bei Entbündel-Fällen vom richtigen Ergebnis ab', () => {
  const correct = 52 - 38;
  const wrong = simulateNoBorrow(52, 38);
  assertTrue(wrong !== correct);
  assertEqual(wrong, 26); // |2-8|=6, |5-3|=2 -> 26
});

test('digits: funktioniert weiterhin wie erwartet', () => {
  assertEqual(digits(14).join(','), '4,1');
});
