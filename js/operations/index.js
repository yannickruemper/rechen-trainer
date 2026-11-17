// Zentrales Register: verbindet jede Rechenart mit ihrem Aufgabengenerator,
// ihren Rechenweg-Strategien, ihrer schriftlichen Methode und ihrer Fehleranalyse.
// Die UI (ui.js) kennt keine Rechenart-spezifischen Details, nur dieses Register.

import * as multTaskGen from './multiplication/taskGenerator.js';
import * as multStrategies from './multiplication/strategies.js';
import * as multWritten from './multiplication/writtenMethod.js';
import * as multError from './multiplication/errorAnalysis.js';

import * as addTaskGen from './addition/taskGenerator.js';
import * as addStrategies from './addition/strategies.js';
import * as addWritten from './addition/writtenMethod.js';
import * as addError from './addition/errorAnalysis.js';

import * as subTaskGen from './subtraction/taskGenerator.js';
import * as subStrategies from './subtraction/strategies.js';
import * as subWritten from './subtraction/writtenMethod.js';
import * as subError from './subtraction/errorAnalysis.js';

import * as divTaskGen from './division/taskGenerator.js';
import * as divStrategies from './division/strategies.js';
import * as divWritten from './division/writtenMethod.js';
import * as divError from './division/errorAnalysis.js';

import * as fracTaskGen from './fractions/taskGenerator.js';
import * as fracStrategies from './fractions/strategies.js';
import * as fracError from './fractions/errorAnalysis.js';

import { renderWrittenGrid, renderAdditionGrid, renderSubtractionGrid, renderDivisionGrid } from '../visualizer.js';

export const OPERATIONS = {
  multiplication: {
    id: 'multiplication',
    icon: '✖️',
    label: 'Multiplikation',
    opSymbol: '×',
    answerType: 'integer',
    hasHeatmap: true,
    expression: (a, b) => `${a} × ${b}`,
    modes: [
      { id: 'kleines-einmaleins', label: 'Kleines Einmaleins', desc: '1×1 bis 10×10', rows: { applyTo: 'a', label: 'Welche Reihen möchtest du üben?' } },
      { id: 'grosses-einmaleins', label: 'Großes Einmaleins', desc: 'bis 20×20' },
      { id: 'kopfrechnen', label: 'Kopfrechnen', desc: 'zweistellige Zahlen' },
      { id: 'schriftlich', label: 'Schriftlich rechnen', desc: 'das schriftliche Verfahren', written: true },
    ],
    generateTask: multTaskGen.generateTask,
    getStrategiesFor: multStrategies.getStrategiesFor,
    getWrittenSteps: multWritten.getWrittenSteps,
    renderWrittenGrid,
    analyzeError: multError.analyzeError,
  },

  addition: {
    id: 'addition',
    icon: '➕',
    label: 'Addition',
    opSymbol: '+',
    answerType: 'integer',
    hasHeatmap: true,
    expression: (a, b) => `${a} + ${b}`,
    modes: [
      { id: 'kleines-einspluseins', label: 'Kleines Einspluseins', desc: 'Summen bis 20', rows: { applyTo: 'a', label: 'Welche Zahl möchtest du dazuzählen?' } },
      { id: 'grosses-einspluseins', label: 'Großes Einspluseins', desc: 'Summen bis 40' },
      { id: 'kopfrechnen', label: 'Kopfrechnen', desc: 'zweistellige Zahlen' },
      { id: 'schriftlich', label: 'Schriftlich rechnen', desc: 'das schriftliche Verfahren', written: true },
    ],
    generateTask: addTaskGen.generateTask,
    getStrategiesFor: addStrategies.getStrategiesFor,
    getWrittenSteps: addWritten.getWrittenSteps,
    renderWrittenGrid: renderAdditionGrid,
    analyzeError: addError.analyzeError,
  },

  subtraction: {
    id: 'subtraction',
    icon: '➖',
    label: 'Subtraktion',
    opSymbol: '−',
    answerType: 'integer',
    hasHeatmap: true,
    expression: (a, b) => `${a} − ${b}`,
    modes: [
      { id: 'kleines-einsminuseins', label: 'Kleines Einsminuseins', desc: 'Minuend bis 20', rows: { applyTo: 'b', label: 'Welche Zahl möchtest du abziehen?' } },
      { id: 'grosses-einsminuseins', label: 'Großes Einsminuseins', desc: 'Minuend bis 40' },
      { id: 'kopfrechnen', label: 'Kopfrechnen', desc: 'zweistellige Zahlen' },
      { id: 'schriftlich', label: 'Schriftlich rechnen', desc: 'das schriftliche Verfahren', written: true },
    ],
    generateTask: subTaskGen.generateTask,
    getStrategiesFor: subStrategies.getStrategiesFor,
    getWrittenSteps: subWritten.getWrittenSteps,
    renderWrittenGrid: renderSubtractionGrid,
    analyzeError: subError.analyzeError,
  },

  division: {
    id: 'division',
    icon: '➗',
    label: 'Division',
    opSymbol: ':',
    answerType: 'integer',
    hasHeatmap: true,
    expression: (a, b) => `${a} : ${b}`,
    modes: [
      { id: 'kleine-division', label: 'Kleine Division', desc: 'Umkehrung des 1×1', rows: { applyTo: 'b', label: 'Durch welche Zahl möchtest du teilen?' } },
      { id: 'grosse-division', label: 'Große Division', desc: 'bis 20', },
      { id: 'kopfrechnen', label: 'Kopfrechnen', desc: 'zweistellige Zahlen' },
      { id: 'schriftlich', label: 'Schriftlich rechnen', desc: 'das schriftliche Verfahren', written: true },
    ],
    generateTask: divTaskGen.generateTask,
    getStrategiesFor: divStrategies.getStrategiesFor,
    getWrittenSteps: divWritten.getWrittenSteps,
    renderWrittenGrid: renderDivisionGrid,
    analyzeError: divError.analyzeError,
  },

  fractions: {
    id: 'fractions',
    icon: '🍕',
    label: 'Brüche',
    opSymbol: '±',
    answerType: 'fraction',
    hasHeatmap: false,
    expression: (frac1, frac2, op) => `${frac1.num}/${frac1.den} ${op === '+' ? '+' : '−'} ${frac2.num}/${frac2.den}`,
    modes: [
      { id: 'gleichnamig', label: 'Gleichnamige Brüche', desc: 'gleicher Nenner' },
      { id: 'ungleichnamig', label: 'Ungleichnamige Brüche', desc: 'verschiedene Nenner' },
    ],
    generateTask: fracTaskGen.generateTask,
    getStrategiesFor: fracStrategies.getStrategiesFor,
    analyzeError: fracError.analyzeError,
  },
};

export const OPERATION_ORDER = ['multiplication', 'addition', 'subtraction', 'division', 'fractions'];
