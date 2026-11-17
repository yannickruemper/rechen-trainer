import { analyzeError } from '../../js/operations/multiplication/errorAnalysis.js';
import { simulateMissingCarry, simulateNoShift, computeWrittenMultiplication } from '../../js/operations/multiplication/writtenMethod.js';
import { section, test, assertEqual, assertTrue } from '../testUtils.js';

section('errorAnalysis');

test('analyzeError: korrekte Antwort liefert null', () => {
  const result = analyzeError({ a: 6, b: 2, correctAnswer: 12, userAnswer: 12, mode: 'kleines-einmaleins' });
  assertEqual(result, null);
});

test('analyzeError: Addition statt Multiplikation wird erkannt', () => {
  const result = analyzeError({ a: 6, b: 2, correctAnswer: 12, userAnswer: 8, mode: 'kleines-einmaleins' });
  assertEqual(result.type, 'addition-statt-multiplikation');
  assertTrue(!result.hint.includes('12'), 'Tipp sollte die Lösung nicht verraten');
  assertTrue(result.reveal.length > 0);
});

test('analyzeError: um eine Reihe verrutscht (zu viel)', () => {
  // 7x8=56; 64 = 56 + 8 -> eine Achterreihe zu viel
  const result = analyzeError({ a: 7, b: 8, correctAnswer: 56, userAnswer: 64, mode: 'kleines-einmaleins' });
  assertEqual(result.type, 'reihe-verrutscht');
});

test('analyzeError: um eine Reihe verrutscht (zu wenig)', () => {
  // 7x8=56; 49 = 56 - 7 -> eine Siebenerreihe zu wenig
  const result = analyzeError({ a: 7, b: 8, correctAnswer: 56, userAnswer: 49, mode: 'kleines-einmaleins' });
  assertEqual(result.type, 'reihe-verrutscht');
});

test('analyzeError: schriftlich – vergessener Übertrag wird erkannt', () => {
  const a = 59, b = 7;
  const correct = a * b;
  const wrong = simulateMissingCarry(a, b);
  assertTrue(wrong !== correct, 'Testannahme: simulierter Fehler weicht ab');
  const result = analyzeError({ a, b, correctAnswer: correct, userAnswer: wrong, mode: 'schriftlich' });
  assertEqual(result.type, 'uebertrag-vergessen');
});

test('analyzeError: schriftlich – falsche Einrückung wird erkannt', () => {
  const a = 34, b = 12;
  const correct = a * b;
  const wrong = simulateNoShift(a, b);
  assertTrue(wrong !== correct, 'Testannahme: simulierter Fehler weicht ab');
  const result = analyzeError({ a, b, correctAnswer: correct, userAnswer: wrong, mode: 'schriftlich' });
  assertEqual(result.type, 'einrueckung-falsch');
});

test('analyzeError: unbekannter Fehler bekommt trotzdem einen nutzbaren Tipp', () => {
  const result = analyzeError({ a: 23, b: 7, correctAnswer: 161, userAnswer: 999, mode: 'kopfrechnen' });
  assertEqual(result.type, 'unbekannt');
  assertTrue(typeof result.hint === 'string' && result.hint.length > 0);
});

test('schriftliche Fehlerfälle sind untereinander unterscheidbar (keine Zufallstreffer)', () => {
  // Stellt sicher, dass die simulierten Fehlerwerte für ein 2-stelliges a x 2-stelliges b
  // nicht zufällig mit der echten Lösung übereinstimmen.
  const cases = [
    [78, 13],
    [57, 23],
    [48, 19],
  ];
  for (const [a, b] of cases) {
    const data = computeWrittenMultiplication(a, b);
    assertTrue(simulateMissingCarry(a, b) !== data.answer, `${a}x${b}: missingCarry sollte abweichen`);
    assertTrue(simulateNoShift(a, b) !== data.answer, `${a}x${b}: noShift sollte abweichen`);
  }
});
