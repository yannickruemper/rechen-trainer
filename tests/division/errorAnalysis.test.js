import { analyzeError } from '../../js/operations/division/errorAnalysis.js';
import { section, test, assertEqual, assertTrue } from '../testUtils.js';

section('division/errorAnalysis');

test('analyzeError: korrekte Antwort liefert null', () => {
  assertEqual(analyzeError({ a: 56, b: 8, correctAnswer: 7, userAnswer: 7 }), null);
});

test('analyzeError: Multiplikation statt Division wird erkannt', () => {
  const result = analyzeError({ a: 56, b: 8, correctAnswer: 7, userAnswer: 448 });
  assertEqual(result.type, 'multiplikation-statt-division');
  assertTrue(!result.hint.includes('7'), 'Tipp sollte die Lösung nicht verraten');
});

test('analyzeError: Einmaleins-Nachbar (off-by-one) wird erkannt', () => {
  const result = analyzeError({ a: 56, b: 8, correctAnswer: 7, userAnswer: 8 });
  assertEqual(result.type, 'einmaleins-nachbar');
});

test('analyzeError: Stelle falsch gesetzt wird erkannt', () => {
  const result = analyzeError({ a: 96, b: 4, correctAnswer: 24, userAnswer: 240 });
  assertEqual(result.type, 'stelle-falsch');
});

test('analyzeError: unbekannter Fehler bekommt trotzdem einen nutzbaren Tipp', () => {
  const result = analyzeError({ a: 96, b: 4, correctAnswer: 24, userAnswer: 999 });
  assertEqual(result.type, 'unbekannt');
  assertTrue(typeof result.hint === 'string' && result.hint.length > 0);
});
