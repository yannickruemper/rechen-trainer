import { digits, computeWrittenAddition, getWrittenSteps, simulateMissingCarry } from '../../js/operations/addition/writtenMethod.js';
import { section, test, assertEqual, assertTrue } from '../testUtils.js';

section('addition/writtenMethod');

test('computeWrittenAddition: 48 + 37 = 85 mit korrektem Übertrag', () => {
  const data = computeWrittenAddition(48, 37);
  assertEqual(data.answer, 85);
  assertEqual(data.columns[0].writeDigit, 5);
  assertEqual(data.columns[0].carryOut, 1);
  assertEqual(data.columns[1].writeDigit, 8);
  assertEqual(data.columns[1].carryIn, 1);
});

test('computeWrittenAddition: answer stimmt für viele Zahlen', () => {
  const cases = [[7, 5], [48, 37], [123, 789], [999, 1], [1234, 5678], [100, 100]];
  for (const [a, b] of cases) {
    const data = computeWrittenAddition(a, b);
    assertEqual(data.answer, a + b, `${a}+${b}`);
  }
});

test('computeWrittenAddition: zusätzliche Spalte bei finalem Übertrag', () => {
  const data = computeWrittenAddition(99, 1); // 99+1=100, dritte Spalte durch Übertrag
  assertEqual(data.answer, 100);
  assertEqual(data.columns.length, 3);
  assertEqual(data.columns[2].writeDigit, 1);
});

test('getWrittenSteps: letzter Schritt nennt das Endergebnis', () => {
  const { steps, data } = getWrittenSteps(48, 37);
  assertTrue(steps[steps.length - 1].includes(String(data.answer)));
  assertEqual(steps.length, data.columns.length + 1);
});

test('simulateMissingCarry: weicht bei Übertrags-Fällen vom richtigen Ergebnis ab', () => {
  const correct = 48 + 37;
  const wrong = simulateMissingCarry(48, 37);
  assertTrue(wrong !== correct);
  assertEqual(wrong, 75); // (8+7)%10=5, (4+3)%10=7 -> 75
});

test('digits: funktioniert weiterhin wie erwartet', () => {
  assertEqual(digits(85).join(','), '5,8');
});
