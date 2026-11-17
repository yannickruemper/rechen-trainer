import {
  digits,
  multiplySingleDigit,
  computeWrittenMultiplication,
  getWrittenSteps,
  simulateMissingCarry,
  simulateNoShift,
} from '../../js/operations/multiplication/writtenMethod.js';
import { renderWrittenGrid } from '../../js/visualizer.js';
import { section, test, assertEqual, assertTrue } from '../testUtils.js';

section('writtenMethod');

test('digits: Ziffern LSB-zuerst', () => {
  assertEqual(digits(0).join(','), '0');
  assertEqual(digits(7).join(','), '7');
  assertEqual(digits(59).join(','), '9,5');
  assertEqual(digits(413).join(','), '3,1,4');
});

test('multiplySingleDigit: 59 x 7 = 413 mit korrektem Übertrag', () => {
  const { value, steps } = multiplySingleDigit(59, 7);
  assertEqual(value, 413);
  // Einerspalte: 9*7=63 -> schreibe 3, Übertrag 6
  assertEqual(steps[0].writeDigit, 3);
  assertEqual(steps[0].carryOut, 6);
  // Zehnerspalte: 5*7+6=41 -> schreibe 1, Übertrag 4 (als zusätzliche Ziffer)
  assertEqual(steps[1].writeDigit, 1);
});

test('computeWrittenMultiplication: answer und Summe stimmen für viele Zahlen', () => {
  const cases = [
    [7, 3],
    [59, 7],
    [84, 6],
    [23, 7],
    [34, 12],
    [57, 23],
    [123, 4],
    [246, 38],
    [999, 99],
    [100, 10],
  ];
  for (const [a, b] of cases) {
    const data = computeWrittenMultiplication(a, b);
    assertEqual(data.answer, a * b, `${a}x${b} answer`);
    assertEqual(data.sum, a * b, `${a}x${b} sum der Teilprodukte`);
    const bDigitCount = digits(b).length;
    assertEqual(data.partials.length, bDigitCount, `${a}x${b}: ein Teilprodukt je Ziffer von b`);
  }
});

test('getWrittenSteps: letzter Schritt nennt das Endergebnis', () => {
  const cases = [
    [59, 7],
    [34, 12],
    [246, 38],
  ];
  for (const [a, b] of cases) {
    const { steps, data } = getWrittenSteps(a, b);
    assertTrue(steps.length > 0, `${a}x${b}: hat Schritte`);
    assertTrue(steps[steps.length - 1].includes(String(data.answer)), `${a}x${b}: letzter Schritt nennt ${data.answer}`);
  }
});

test('getWrittenSteps: bei einstelligem zweiten Faktor kein redundanter Summenschritt', () => {
  const { steps, data } = getWrittenSteps(59, 7);
  assertEqual(steps.length, 1);
  assertTrue(steps[0].includes(String(data.answer)));
});

test('getWrittenSteps: bei zweistelligem zweiten Faktor zwei Teilprodukte + Summe', () => {
  const { steps } = getWrittenSteps(34, 12);
  assertEqual(steps.length, 3); // Einer-Zeile, Zehner-Zeile, Summen-Zeile
});

test('simulateMissingCarry: weicht bei mehrstelligen Zahlen vom richtigen Ergebnis ab', () => {
  const correct = 59 * 7;
  const wrong = simulateMissingCarry(59, 7);
  assertTrue(wrong !== correct, 'sollte sich vom richtigen Ergebnis unterscheiden');
  assertEqual(wrong, 53); // 9*7=63 -> 3 (Übertrag verworfen); 5*7=35 -> 5 an Zehnerstelle -> 3 + 50 = 53
});

test('simulateNoShift: weicht bei mehrstelligem zweiten Faktor vom richtigen Ergebnis ab', () => {
  const correct = 34 * 12;
  const wrong = simulateNoShift(34, 12);
  assertTrue(wrong !== correct, 'sollte sich vom richtigen Ergebnis unterscheiden');
  // 34*2 + 34*1 (ohne Verschiebung) = 68 + 34 = 102
  assertEqual(wrong, 102);
});

test('renderWrittenGrid: enthält die Ziffern des Ergebnisses, wenn vollständig aufgedeckt', () => {
  const data = computeWrittenMultiplication(59, 7);
  const html = renderWrittenGrid(data, data.partials.length);
  for (const d of String(data.answer)) {
    assertTrue(html.includes(`>${d}<`), `Ziffer ${d} fehlt im Raster`);
  }
});
