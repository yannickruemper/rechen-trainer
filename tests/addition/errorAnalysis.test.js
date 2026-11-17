import { analyzeError } from '../../js/operations/addition/errorAnalysis.js';
import { simulateMissingCarry } from '../../js/operations/addition/writtenMethod.js';
import { section, test, assertEqual, assertTrue } from '../testUtils.js';

section('addition/errorAnalysis');

test('analyzeError: korrekte Antwort liefert null', () => {
  assertEqual(analyzeError({ a: 8, b: 5, correctAnswer: 13, userAnswer: 13 }), null);
});

test('analyzeError: Subtraktion statt Addition wird erkannt', () => {
  const result = analyzeError({ a: 8, b: 5, correctAnswer: 13, userAnswer: 3 });
  assertEqual(result.type, 'subtraktion-statt-addition');
  assertTrue(!result.hint.includes('13'), 'Tipp sollte die Lösung nicht verraten');
});

test('analyzeError: vergessener Übertrag wird erkannt', () => {
  const a = 48, b = 37;
  const correct = a + b;
  const wrong = simulateMissingCarry(a, b);
  assertTrue(wrong !== correct);
  const result = analyzeError({ a, b, correctAnswer: correct, userAnswer: wrong });
  assertEqual(result.type, 'uebertrag-vergessen');
});

test('analyzeError: unbekannter Fehler bekommt trotzdem einen nutzbaren Tipp', () => {
  const result = analyzeError({ a: 23, b: 45, correctAnswer: 68, userAnswer: 999 });
  assertEqual(result.type, 'unbekannt');
  assertTrue(typeof result.hint === 'string' && result.hint.length > 0);
});
