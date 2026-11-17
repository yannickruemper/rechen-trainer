// Fortschritts-Speicherung in localStorage, getrennt nach Rechenart. Läuft nur im Browser;
// defensiv gegen fehlende/korrupte Daten, damit ein kaputter Speicher die Seite nicht zum Absturz bringt.

const STORAGE_KEY = 'mal-trainer-progress';
const OPERATIONS = ['multiplication', 'addition', 'subtraction', 'division', 'fractions'];

function emptyOperationData() {
  return { facts: {}, modes: {} };
}

function defaultData() {
  const operations = {};
  for (const op of OPERATIONS) operations[op] = emptyOperationData();
  return { operations };
}

function loadRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.operations) return defaultData();
    const data = defaultData();
    for (const op of OPERATIONS) {
      if (parsed.operations[op]) {
        data.operations[op] = {
          facts: parsed.operations[op].facts || {},
          modes: parsed.operations[op].modes || {},
        };
      }
    }
    return data;
  } catch {
    return defaultData();
  }
}

function save(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Speicher voll oder nicht verfügbar – Fortschritt geht dann nur für diese Sitzung verloren.
  }
}

function factKeyFor(operation, a, b) {
  if (operation === 'multiplication') return `${a}x${b}`;
  if (operation === 'addition') return `${a}+${b}`;
  if (operation === 'subtraction') return `${a}-${b}`;
  return `${a}:${b}`; // division
}

function factKeyForTask(operation, task) {
  if (operation === 'fractions') {
    return `${task.frac1.num}/${task.frac1.den}${task.op}${task.frac2.num}/${task.frac2.den}`;
  }
  return factKeyFor(operation, task.a, task.b);
}

export function recordAttempt(operation, task, correct, timeMs) {
  const data = loadRaw();
  const opData = data.operations[operation];
  const key = factKeyForTask(operation, task);
  const { mode } = task;

  const fact = opData.facts[key] || { attempts: 0, correct: 0, totalTimeMs: 0, lastSeen: 0, lastCorrect: false };
  fact.attempts += 1;
  if (correct) fact.correct += 1;
  fact.totalTimeMs += timeMs;
  fact.lastSeen = Date.now();
  fact.lastCorrect = correct;
  opData.facts[key] = fact;

  const modeStat = opData.modes[mode] || { attempts: 0, correct: 0, totalTimeMs: 0 };
  modeStat.attempts += 1;
  if (correct) modeStat.correct += 1;
  modeStat.totalTimeMs += timeMs;
  opData.modes[mode] = modeStat;

  save(data);
  return opData;
}

export function getFactsMap(operation) {
  return loadRaw().operations[operation].facts;
}

export function getModeStats(operation) {
  return loadRaw().operations[operation].modes;
}

export function getAllModeStats() {
  const data = loadRaw();
  const all = {};
  for (const op of OPERATIONS) all[op] = data.operations[op].modes;
  return all;
}

/**
 * Heatmap-Raster für eine Rechenart. Jede Rechenart hat eine eigene, zu ihr passende
 * 10×10- (bzw. 10×11-) Übersicht, analog zum kleinen Einmaleins.
 */
export function getHeatmapData(operation) {
  if (operation === 'fractions') return [];
  const data = loadRaw();
  const facts = data.operations[operation].facts;
  const grid = [];

  if (operation === 'subtraction') {
    // Zeilen: Subtrahend b (1-10), Spalten: Differenz d (0-10), Minuend a = b + d.
    for (let b = 1; b <= 10; b++) {
      const row = [];
      for (let d = 0; d <= 10; d++) {
        const a = b + d;
        const f = facts[factKeyFor('subtraction', a, b)];
        const mastery = f && f.attempts > 0 ? f.correct / f.attempts : null;
        row.push({ label: `${a}−${b}`, mastery, attempts: f ? f.attempts : 0 });
      }
      grid.push(row);
    }
    return grid;
  }

  for (let x = 1; x <= 10; x++) {
    const row = [];
    for (let y = 1; y <= 10; y++) {
      let a, b, label;
      if (operation === 'division') {
        b = x; // Divisor
        const q = y; // Quotient
        a = b * q;
        label = `${a}:${b}`;
      } else {
        a = x;
        b = y;
        label = operation === 'multiplication' ? `${a}×${b}` : `${a}+${b}`;
      }
      const f = facts[factKeyFor(operation, a, b)];
      const mastery = f && f.attempts > 0 ? f.correct / f.attempts : null;
      row.push({ label, mastery, attempts: f ? f.attempts : 0 });
    }
    grid.push(row);
  }
  return grid;
}

export function resetProgress() {
  save(defaultData());
}
