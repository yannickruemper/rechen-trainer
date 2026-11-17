// Reine Funktionen: erkennt typische Rechenfehler bei der Bruchrechnung.

import { getDefaultHint } from './strategies.js';
import { simplifyFraction } from '../../shared/numberUtils.js';

/**
 * @param {object} params
 * @param {{num:number,den:number}} params.frac1
 * @param {{num:number,den:number}} params.frac2
 * @param {string} params.op '+' oder '-'
 * @param {{num:number,den:number}} params.correctAnswer bereits gekürzt
 * @param {{num:number,den:number}} params.userAnswer
 * @returns {{type: string, hint: string, reveal: string} | null} null, wenn die Antwort korrekt ist.
 */
export function analyzeError({ frac1, frac2, op, correctAnswer, userAnswer }) {
  if (userAnswer.num === correctAnswer.num && userAnswer.den === correctAnswer.den) return null;

  const naiveDen = frac1.den + frac2.den;
  const naiveNum = op === '+' ? frac1.num + frac2.num : frac1.num - frac2.num;
  if (userAnswer.num === naiveNum && userAnswer.den === naiveDen) {
    return {
      type: 'nenner-addiert',
      hint: 'Tipp: Der Nenner wird nicht mitgerechnet – erst musst du beide Brüche auf denselben Nenner bringen.',
      reveal: `${frac1.den} ${op === '+' ? '+' : '−'} ${frac2.den} = ${naiveDen} ist nicht der richtige Nenner. Brüche addierst/subtrahierst du nur, wenn die Nenner gleich sind.`,
    };
  }

  if (userAnswer.den !== 0) {
    const simplifiedUser = simplifyFraction(userAnswer.num, userAnswer.den);
    if (simplifiedUser.num === correctAnswer.num && simplifiedUser.den === correctAnswer.den) {
      return {
        type: 'nicht-gekuerzt',
        hint: 'Tipp: Dein Ergebnis stimmt, aber du kannst den Bruch noch kürzen.',
        reveal: `${userAnswer.num}/${userAnswer.den} ist richtig gerechnet, aber noch nicht vollständig gekürzt.`,
      };
    }
  }

  return {
    type: 'unbekannt',
    hint: getDefaultHint(frac1, frac2, op),
    reveal: 'Schau dir in Ruhe den Rechenweg an – dort siehst du jeden Schritt einzeln.',
  };
}
