import { analyzeError } from '../../js/operations/subtraction/errorAnalysis.js';
import { simulateNoBorrow } from '../../js/operations/subtraction/writtenMethod.js';
import { section, test, assertEqual, assertTrue } from '../testUtils.js';

section('subtraction/errorAnalysis');

test('analyzeError: korrekte Antwort liefert null', () => {
  assertEqual(analyzeError({ a: 15, b: 7, correctAnswer: 8, userAnswer: 8 }), null);
});

test('analyzeError: Addition statt Subtraktion wird erkannt', () => {
  const result = analyzeError({ a: 15, b: 7, correctAnswer: 8, userAnswer: 22 });
  assertEqual(result.type, 'addition-statt-subtraktion');
  assertTrue(!result.hint.includes('8'), 'Tipp sollte die Lösung nicht verraten');
});

test('analyzeError: vergessenes Borgen wird erkannt', () => {
  const a = 52, b = 38;
  const correct = a - b;
  const wrong = simulateNoBorrow(a, b);
  assertTrue(wrong !== correct);
  const result = analyzeError({ a, b, correctAnswer: correct, userAnswer: wrong });
  assertEqual(result.type, 'borgen-vergessen');
});

test('analyzeError: unbekannter Fehler bekommt trotzdem einen nutzbaren Tipp', () => {
  const result = analyzeError({ a: 45, b: 23, correctAnswer: 22, userAnswer: 999 });
  assertEqual(result.type, 'unbekannt');
  assertTrue(typeof result.hint === 'string' && result.hint.length > 0);
});
