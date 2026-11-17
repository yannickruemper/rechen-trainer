import { computeWrittenDivision, getWrittenSteps } from '../../js/operations/division/writtenMethod.js';
import { section, test, assertEqual, assertTrue } from '../testUtils.js';

section('division/writtenMethod');

test('computeWrittenDivision: 84 : 4 = 21', () => {
  const data = computeWrittenDivision(84, 4);
  assertEqual(data.quotient, 21);
  assertEqual(data.remainder, 0);
});

test('computeWrittenDivision: 96 : 4 = 24 mit Zwischenrest', () => {
  const data = computeWrittenDivision(96, 4);
  assertEqual(data.quotient, 24);
  assertEqual(data.remainder, 0);
  assertEqual(data.steps[0].qDigit, 2);
  assertEqual(data.steps[0].remainder, 1);
  assertEqual(data.steps[1].qDigit, 4);
});

test('computeWrittenDivision: 120 : 6 = 20, erste Ziffer wird übersprungen', () => {
  const data = computeWrittenDivision(120, 6);
  assertEqual(data.quotient, 20);
  assertEqual(data.steps[0].skipped, true);
});

test('computeWrittenDivision: 144 : 12 = 12 (zweistelliger Divisor)', () => {
  const data = computeWrittenDivision(144, 12);
  assertEqual(data.quotient, 12);
  assertEqual(data.remainder, 0);
});

test('computeWrittenDivision: quotient * b + remainder ergibt a, für viele Zahlen', () => {
  const cases = [
    [84, 4],
    [96, 4],
    [120, 6],
    [144, 12],
    [2691, 3],
    [891, 9],
    [1000, 8],
  ];
  for (const [a, b] of cases) {
    const data = computeWrittenDivision(a, b);
    assertEqual(data.quotient * b + data.remainder, a, `${a}:${b}`);
  }
});

test('getWrittenSteps: letzter Schritt nennt das Endergebnis', () => {
  const { steps, data } = getWrittenSteps(96, 4);
  assertTrue(steps[steps.length - 1].includes(String(data.quotient)));
});
