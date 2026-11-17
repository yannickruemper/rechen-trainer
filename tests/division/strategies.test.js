import { getStrategiesFor, getDefaultHint, buildUmkehraufgabe, buildHalbieren, buildZerlegen } from '../../js/operations/division/strategies.js';
import { section, test, assertEqual, assertTrue } from '../testUtils.js';

section('division/strategies');

function lastNumberIn(text) {
  const matches = text.match(/-?\d+/g);
  return matches ? Number(matches[matches.length - 1]) : NaN;
}

test('getStrategiesFor: für viele a,b ist jede Strategie mathematisch korrekt', () => {
  const pairs = [];
  for (let b = 1; b <= 20; b++) {
    for (let q = 1; q <= 20; q++) pairs.push([b * q, b]);
  }
  pairs.push([96, 4], [144, 12], [891, 9], [2691, 3]);

  for (const [a, b] of pairs) {
    const strategies = getStrategiesFor(a, b);
    assertTrue(strategies.length > 0, `${a}:${b}: mindestens eine Strategie`);
    for (const s of strategies) {
      assertEqual(s.result, a / b, `${a}:${b} (${s.id}): result-Feld`);
      const lastStepValue = lastNumberIn(s.steps[s.steps.length - 1]);
      assertEqual(lastStepValue, a / b, `${a}:${b} (${s.id}): letzter Schritt nennt das Ergebnis`);
      assertTrue(typeof s.hint === 'string' && s.hint.length > 0, `${a}:${b} (${s.id}): hat einen Tipp`);
    }
  }
});

test('Tipp verrät nie direkt das Endergebnis (Stichprobe)', () => {
  const cases = [[56, 8], [96, 4], [144, 12]];
  for (const [a, b] of cases) {
    const hint = getDefaultHint(a, b);
    assertTrue(!hint.includes(`= ${a / b}`), `Tipp für ${a}:${b} verrät das Ergebnis: "${hint}"`);
  }
});

test('buildUmkehraufgabe: 56:8=7, weil 8x7=56', () => {
  const s = buildUmkehraufgabe(56, 8);
  assertEqual(s.result, 7);
  assertTrue(s.steps.some((step) => step.includes('8 × 7 = 56')));
});

test('buildHalbieren: 96:4 über zweifaches Halbieren', () => {
  const s = buildHalbieren(96, 4);
  assertTrue(s !== null);
  assertEqual(s.result, 24);
  assertEqual(s.steps[0], '96 : 2 = 48');
  assertEqual(s.steps[1], '48 : 2 = 24');
});

test('buildHalbieren: 96:8 über dreifaches Halbieren', () => {
  const s = buildHalbieren(96, 8);
  assertTrue(s !== null);
  assertEqual(s.result, 12);
});

test('buildHalbieren: liefert null, wenn Divisor keine Zweierpotenz ist', () => {
  assertEqual(buildHalbieren(96, 3), null);
});

test('buildZerlegen: 96:4 = 80:4 + 16:4 (Spec-Beispiel)', () => {
  const s = buildZerlegen(96, 4);
  assertTrue(s !== null);
  assertEqual(s.result, 24);
  assertEqual(s.steps[0], '96 = 80 + 16');
  assertEqual(s.steps[2], '= 20 + 4');
});

test('buildZerlegen: liefert null, wenn kein sinnvoller Split existiert', () => {
  assertEqual(buildZerlegen(6, 3), null); // 6 < 3*10, kein Zehner-Split möglich
});
