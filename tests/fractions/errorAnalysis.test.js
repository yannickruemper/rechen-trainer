import { analyzeError } from '../../js/operations/fractions/errorAnalysis.js';
import { section, test, assertEqual, assertTrue } from '../testUtils.js';

section('fractions/errorAnalysis');

test('analyzeError: korrekte Antwort liefert null', () => {
  const result = analyzeError({
    frac1: { num: 1, den: 3 },
    frac2: { num: 1, den: 4 },
    op: '+',
    correctAnswer: { num: 7, den: 12 },
    userAnswer: { num: 7, den: 12 },
  });
  assertEqual(result, null);
});

test('analyzeError: "Nenner addiert" wird erkannt', () => {
  const result = analyzeError({
    frac1: { num: 1, den: 3 },
    frac2: { num: 1, den: 4 },
    op: '+',
    correctAnswer: { num: 7, den: 12 },
    userAnswer: { num: 2, den: 7 },
  });
  assertEqual(result.type, 'nenner-addiert');
  assertTrue(!result.hint.includes('7/12'), 'Tipp sollte die Lösung nicht verraten');
});

test('analyzeError: "nicht gekürzt" wird erkannt', () => {
  const result = analyzeError({
    frac1: { num: 1, den: 4 },
    frac2: { num: 1, den: 4 },
    op: '+',
    correctAnswer: { num: 1, den: 2 },
    userAnswer: { num: 2, den: 4 },
  });
  assertEqual(result.type, 'nicht-gekuerzt');
});

test('analyzeError: unbekannter Fehler bekommt trotzdem einen nutzbaren Tipp', () => {
  const result = analyzeError({
    frac1: { num: 1, den: 3 },
    frac2: { num: 1, den: 4 },
    op: '+',
    correctAnswer: { num: 7, den: 12 },
    userAnswer: { num: 99, den: 1 },
  });
  assertEqual(result.type, 'unbekannt');
  assertTrue(typeof result.hint === 'string' && result.hint.length > 0);
});
