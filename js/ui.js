import { OPERATIONS, OPERATION_ORDER } from './operations/index.js';
import { renderVisual, renderFractionDisplay } from './visualizer.js';
import * as progressStore from './progressStore.js';

const POSITIVE_MESSAGES = [
  'Super gemacht!',
  'Richtig!',
  'Klasse, das stimmt!',
  'Genau richtig!',
  'Toll, weiter so!',
  'Stark gerechnet!',
];

const el = {};

function q(id) {
  return document.getElementById(id);
}

function cacheElements() {
  [
    'nav-start', 'nav-progress', 'view-start', 'view-practice', 'view-progress',
    'operation-grid', 'mode-grid', 'rows-select', 'rows-legend', 'rows-grid', 'rows-all', 'start-practice',
    'back-to-start', 'task-expression', 'task-a', 'task-op', 'task-b',
    'task-expression-fraction', 'frac1-display', 'task-frac-op', 'frac2-display',
    'answer-form', 'answer-input', 'fraction-answer', 'answer-num', 'answer-den', 'check-btn',
    'keypad', 'feedback', 'explanation-panel', 'explanation-title', 'other-way-btn',
    'explanation-steps', 'explanation-visual', 'next-step-btn', 'show-explanation-btn',
    'next-task-btn', 'stats-table-body', 'heatmap-tabs', 'heatmap', 'reset-progress-btn',
  ].forEach((id) => (el[id] = q(id)));
}

const state = {
  operation: null,
  mode: null,
  difficulty: 1,
  task: null,
  taskStartTime: 0,
  attemptCount: 0,
  firstAttemptRecorded: false,
  strategies: [],
  strategyIndex: 0,
  revealedSteps: 0,
  writtenData: null,
  inPractice: false,
  heatmapOperation: 'multiplication',
  activeFractionField: 'num',
};

function currentOp() {
  return OPERATIONS[state.operation];
}

function currentModeConfig() {
  const op = currentOp();
  return op ? op.modes.find((m) => m.id === state.mode) : null;
}

function switchTopView(view) {
  el['view-progress'].hidden = view !== 'progress';
  el['view-start'].hidden = view === 'progress' ? true : state.inPractice;
  el['view-practice'].hidden = view === 'progress' ? true : !state.inPractice;
  el['nav-start'].setAttribute('aria-pressed', String(view !== 'progress'));
  el['nav-progress'].setAttribute('aria-pressed', String(view === 'progress'));
  if (view === 'progress') renderProgressView();
}

function initOperationGrid() {
  el['operation-grid'].innerHTML = '';
  for (const opId of OPERATION_ORDER) {
    const op = OPERATIONS[opId];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'operation-card';
    btn.dataset.operation = opId;
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML = `<span class="operation-icon">${op.icon}</span><span class="operation-label">${op.label}</span>`;
    btn.addEventListener('click', () => selectOperation(opId));
    el['operation-grid'].appendChild(btn);
  }
}

function selectOperation(opId) {
  state.operation = opId;
  state.mode = null;
  el['operation-grid'].querySelectorAll('.operation-card').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.operation === opId)));
  renderModeGrid();
  el['rows-select'].hidden = true;
  updateStartButton();
}

function renderModeGrid() {
  const op = currentOp();
  el['mode-grid'].innerHTML = '';
  if (!op) return;
  for (const mode of op.modes) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'mode-card';
    card.dataset.mode = mode.id;
    card.setAttribute('aria-pressed', 'false');
    card.innerHTML = `<span class="mode-title">${mode.label}</span><span class="mode-desc">${mode.desc}</span>`;
    card.addEventListener('click', () => selectMode(mode.id));
    el['mode-grid'].appendChild(card);
  }
}

function selectMode(modeId) {
  state.mode = modeId;
  el['mode-grid'].querySelectorAll('.mode-card').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.mode === modeId)));
  const mode = currentModeConfig();
  if (mode && mode.rows) {
    el['rows-select'].hidden = false;
    el['rows-legend'].textContent = mode.rows.label;
  } else {
    el['rows-select'].hidden = true;
  }
  updateStartButton();
}

function initRowsGrid() {
  el['rows-grid'].innerHTML = '';
  for (let r = 1; r <= 10; r++) {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = String(r);
    input.className = 'row-checkbox';
    input.checked = true;
    input.disabled = true;
    label.appendChild(input);
    label.append(` ${r}`);
    el['rows-grid'].appendChild(label);
  }
}

function selectedRows() {
  if (el['rows-all'].checked) return null;
  const boxes = Array.from(el['rows-grid'].querySelectorAll('.row-checkbox'));
  const rows = boxes.filter((b) => b.checked).map((b) => Number(b.value));
  return rows.length > 0 ? rows : null;
}

function hasValidRowSelection() {
  if (el['rows-all'].checked) return true;
  const boxes = Array.from(el['rows-grid'].querySelectorAll('.row-checkbox'));
  return boxes.some((b) => b.checked);
}

function updateStartButton() {
  const mode = currentModeConfig();
  const needsRows = mode && mode.rows;
  el['start-practice'].disabled = !state.operation || !state.mode || (needsRows && !hasValidRowSelection());
}

function initRowsInteraction() {
  el['rows-all'].addEventListener('change', () => {
    const boxes = Array.from(el['rows-grid'].querySelectorAll('.row-checkbox'));
    boxes.forEach((b) => (b.disabled = el['rows-all'].checked));
    updateStartButton();
  });
  el['rows-grid'].addEventListener('change', updateStartButton);
}

function initKeypad() {
  const layout = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'OK'];
  el['keypad'].innerHTML = '';
  layout.forEach((key) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = key;
    if (key === 'OK') btn.classList.add('key-wide');
    btn.addEventListener('click', () => handleKeypadPress(key));
    el['keypad'].appendChild(btn);
  });
}

function activeInputEl() {
  const op = currentOp();
  if (op && op.answerType === 'fraction') {
    return state.activeFractionField === 'den' ? el['answer-den'] : el['answer-num'];
  }
  return el['answer-input'];
}

function handleKeypadPress(key) {
  const input = activeInputEl();
  if (key === '⌫') {
    input.value = input.value.slice(0, -1);
  } else if (key === 'OK') {
    el['answer-form'].requestSubmit();
    return;
  } else {
    input.value += key;
  }
  input.focus();
}

function pickDifficulty() {
  const checked = document.querySelector('input[name="difficulty"]:checked');
  return checked ? Number(checked.value) : 1;
}

function nextTask() {
  const op = currentOp();
  const mode = currentModeConfig();
  state.difficulty = pickDifficulty();
  const factsMap = progressStore.getFactsMap(state.operation);
  state.task = op.generateTask({
    mode: state.mode,
    difficulty: state.difficulty,
    selectedRows: mode.rows ? selectedRows() : null,
    factsMap,
  });
  state.taskStartTime = performance.now();
  state.attemptCount = 0;
  state.firstAttemptRecorded = false;
  state.strategies = [];
  state.strategyIndex = 0;
  state.revealedSteps = 0;
  state.writtenData = null;

  if (op.answerType === 'fraction') {
    el['task-expression'].hidden = true;
    el['task-expression-fraction'].hidden = false;
    el['answer-input'].hidden = true;
    el['fraction-answer'].hidden = false;
    el['frac1-display'].innerHTML = renderFractionDisplay(state.task.frac1.num, state.task.frac1.den);
    el['task-frac-op'].textContent = state.task.op === '+' ? '+' : '−';
    el['frac2-display'].innerHTML = renderFractionDisplay(state.task.frac2.num, state.task.frac2.den);
    el['answer-num'].value = '';
    el['answer-den'].value = '';
    el['answer-num'].disabled = false;
    el['answer-den'].disabled = false;
    state.activeFractionField = 'num';
    el['answer-num'].focus();
  } else {
    el['task-expression'].hidden = false;
    el['task-expression-fraction'].hidden = true;
    el['answer-input'].hidden = false;
    el['fraction-answer'].hidden = true;
    el['task-a'].textContent = String(state.task.a);
    el['task-op'].textContent = op.opSymbol;
    el['task-b'].textContent = String(state.task.b);
    el['answer-input'].value = '';
    el['answer-input'].disabled = false;
    el['answer-input'].focus();
  }
  el['check-btn'].disabled = false;
  el['feedback'].textContent = '';
  el['feedback'].className = 'feedback';
  el['explanation-panel'].hidden = true;
  el['show-explanation-btn'].hidden = true;
  el['next-task-btn'].hidden = true;
}

function setFeedback(text, cls) {
  el['feedback'].textContent = text;
  el['feedback'].className = `feedback ${cls}`;
}

function computeStrategiesForCurrentTask() {
  const op = currentOp();
  const mode = currentModeConfig();
  if (op.answerType === 'fraction') {
    const { frac1, frac2, op: fracOp } = state.task;
    state.strategies = op.getStrategiesFor(frac1, frac2, fracOp);
  } else if (mode.written) {
    const { a, b } = state.task;
    const { steps, data } = op.getWrittenSteps(a, b);
    state.writtenData = data;
    state.strategies = [{ id: 'schriftlich', label: 'Schriftliches Verfahren', steps, written: true }];
  } else {
    const { a, b } = state.task;
    state.strategies = op.getStrategiesFor(a, b);
  }
  state.strategyIndex = 0;
}

function renderExplanationStep() {
  const op = currentOp();
  const strategy = state.strategies[state.strategyIndex];
  el['explanation-title'].textContent = strategy.label;
  el['other-way-btn'].hidden = state.strategies.length <= 1;

  const visibleSteps = strategy.steps.slice(0, state.revealedSteps);
  el['explanation-steps'].innerHTML = visibleSteps
    .map((s) => `<div class="step">${s.replace(/</g, '&lt;')}</div>`)
    .join('');

  if (strategy.written) {
    el['explanation-visual'].innerHTML = op.renderWrittenGrid(state.writtenData, state.revealedSteps);
  } else {
    el['explanation-visual'].innerHTML = state.revealedSteps > 0 ? renderVisual(strategy.visual) : '';
  }

  const atEnd = state.revealedSteps >= strategy.steps.length;
  el['next-step-btn'].textContent = atEnd ? 'Fertig' : 'Weiter';
  if (atEnd) {
    el['next-task-btn'].hidden = false;
  }
}

function openExplanation() {
  if (state.strategies.length === 0) computeStrategiesForCurrentTask();
  state.revealedSteps = 1;
  el['explanation-panel'].hidden = false;
  renderExplanationStep();
}

function handleNextStep() {
  const strategy = state.strategies[state.strategyIndex];
  if (state.revealedSteps < strategy.steps.length) {
    state.revealedSteps += 1;
    renderExplanationStep();
  }
}

function handleOtherWay() {
  state.strategyIndex = (state.strategyIndex + 1) % state.strategies.length;
  state.revealedSteps = 1;
  renderExplanationStep();
}

function recordIfFirstAttempt(correct) {
  if (state.firstAttemptRecorded) return;
  state.firstAttemptRecorded = true;
  const timeMs = performance.now() - state.taskStartTime;
  progressStore.recordAttempt(state.operation, state.task, correct, timeMs);
}

function lockAnswerInputs() {
  const op = currentOp();
  if (op.answerType === 'fraction') {
    el['answer-num'].disabled = true;
    el['answer-den'].disabled = true;
  } else {
    el['answer-input'].disabled = true;
  }
  el['check-btn'].disabled = true;
}

function clearAndRefocusAnswerInputs() {
  const op = currentOp();
  if (op.answerType === 'fraction') {
    el['answer-num'].value = '';
    el['answer-den'].value = '';
    state.activeFractionField = 'num';
    el['answer-num'].focus();
  } else {
    el['answer-input'].value = '';
    el['answer-input'].focus();
  }
}

function readFractionAnswer() {
  const numRaw = el['answer-num'].value.trim();
  const denRaw = el['answer-den'].value.trim();
  if (numRaw === '' || denRaw === '') return null;
  const num = Number(numRaw);
  const den = Number(denRaw);
  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return null;
  return { num, den };
}

function handleSubmit(event) {
  event.preventDefault();
  const op = currentOp();
  const { mode } = state.task;

  let userAnswer, correctAnswer, diagnosisParams;
  if (op.answerType === 'fraction') {
    userAnswer = readFractionAnswer();
    if (!userAnswer) return;
    correctAnswer = state.task.answer;
    diagnosisParams = { frac1: state.task.frac1, frac2: state.task.frac2, op: state.task.op, correctAnswer, userAnswer };
  } else {
    const raw = el['answer-input'].value.trim();
    if (raw === '') return;
    userAnswer = Number(raw);
    if (!Number.isFinite(userAnswer)) return;
    correctAnswer = state.task.answer;
    diagnosisParams = { a: state.task.a, b: state.task.b, correctAnswer, userAnswer, mode };
  }

  state.attemptCount += 1;
  const correct =
    op.answerType === 'fraction' ? userAnswer.num === correctAnswer.num && userAnswer.den === correctAnswer.den : userAnswer === correctAnswer;
  recordIfFirstAttempt(correct);
  el['show-explanation-btn'].hidden = false;

  if (correct) {
    const msg = POSITIVE_MESSAGES[Math.floor(Math.random() * POSITIVE_MESSAGES.length)];
    setFeedback(msg, 'correct');
    lockAnswerInputs();
    el['next-task-btn'].hidden = false;
    return;
  }

  const diagnosis = op.analyzeError(diagnosisParams);

  if (state.attemptCount === 1) {
    setFeedback(diagnosis.hint, 'hint');
    clearAndRefocusAnswerInputs();
  } else {
    setFeedback(diagnosis.reveal, 'incorrect');
    openExplanation();
    clearAndRefocusAnswerInputs();
  }
}

function formatPercent(correct, attempts) {
  if (attempts === 0) return '–';
  return `${Math.round((correct / attempts) * 100)}%`;
}

function formatAvgTime(totalMs, attempts) {
  if (attempts === 0) return '–';
  const avgS = totalMs / attempts / 1000;
  return `${avgS.toFixed(1)} s`;
}

function renderStatsTable() {
  const rows = [];
  for (const opId of OPERATION_ORDER) {
    const op = OPERATIONS[opId];
    const stats = progressStore.getModeStats(opId);
    for (const mode of op.modes) {
      const s = stats[mode.id] || { attempts: 0, correct: 0, totalTimeMs: 0 };
      rows.push(`<tr>
        <td>${op.icon} ${op.label}</td>
        <td>${mode.label}</td>
        <td>${s.attempts}</td>
        <td>${s.correct}</td>
        <td>${formatPercent(s.correct, s.attempts)}</td>
        <td>${formatAvgTime(s.totalTimeMs, s.attempts)}</td>
      </tr>`);
    }
  }
  el['stats-table-body'].innerHTML = rows.join('');
}

function heatmapOperations() {
  return OPERATION_ORDER.filter((opId) => OPERATIONS[opId].hasHeatmap);
}

function initHeatmapTabs() {
  el['heatmap-tabs'].innerHTML = '';
  for (const opId of heatmapOperations()) {
    const op = OPERATIONS[opId];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-btn heatmap-tab';
    btn.textContent = `${op.icon} ${op.label}`;
    btn.dataset.operation = opId;
    btn.setAttribute('aria-pressed', String(opId === state.heatmapOperation));
    btn.addEventListener('click', () => {
      state.heatmapOperation = opId;
      el['heatmap-tabs'].querySelectorAll('.heatmap-tab').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.operation === opId)));
      renderHeatmap();
    });
    el['heatmap-tabs'].appendChild(btn);
  }
}

function renderHeatmap() {
  const grid = progressStore.getHeatmapData(state.heatmapOperation);
  const cols = grid[0] ? grid[0].length : 10;
  el['heatmap'].style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  el['heatmap'].innerHTML = grid
    .flat()
    .map((cell) => {
      let bg = '#dfe3ea';
      let label = cell.label;
      let title = `${cell.label}: noch nicht geübt`;
      if (cell.mastery !== null) {
        const pct = Math.round(cell.mastery * 100);
        const hue = Math.round(cell.mastery * 120); // 0=rot, 120=grün
        bg = `hsl(${hue}, 70%, 55%)`;
        label = `${pct}%`;
        title = `${cell.label}: ${pct}% richtig (${cell.attempts} Versuche)`;
      }
      return `<div class="heatmap-cell" style="background:${bg}" title="${title}">${label}</div>`;
    })
    .join('');
}

function renderProgressView() {
  renderStatsTable();
  renderHeatmap();
}

function handleReset() {
  const ok = window.confirm('Möchtest du wirklich deinen gesamten Fortschritt (alle Rechenarten) löschen? Das kann nicht rückgängig gemacht werden.');
  if (!ok) return;
  progressStore.resetProgress();
  renderProgressView();
}

export function init() {
  cacheElements();
  initOperationGrid();
  initRowsGrid();
  initRowsInteraction();
  initKeypad();
  initHeatmapTabs();

  el['start-practice'].addEventListener('click', () => {
    state.inPractice = true;
    switchTopView('start');
    nextTask();
  });

  el['back-to-start'].addEventListener('click', () => {
    state.inPractice = false;
    switchTopView('start');
  });

  el['nav-start'].addEventListener('click', () => switchTopView('start'));
  el['nav-progress'].addEventListener('click', () => switchTopView('progress'));

  el['answer-num'].addEventListener('focus', () => (state.activeFractionField = 'num'));
  el['answer-den'].addEventListener('focus', () => (state.activeFractionField = 'den'));

  el['answer-form'].addEventListener('submit', handleSubmit);
  el['show-explanation-btn'].addEventListener('click', openExplanation);
  el['next-step-btn'].addEventListener('click', handleNextStep);
  el['other-way-btn'].addEventListener('click', handleOtherWay);
  el['next-task-btn'].addEventListener('click', nextTask);
  el['reset-progress-btn'].addEventListener('click', handleReset);

  switchTopView('start');
}
