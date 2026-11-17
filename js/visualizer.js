// Erzeugt SVG/HTML-Markup als reine Strings (kein direkter DOM-Zugriff), damit
// diese Funktionen sowohl im Browser als auch in Tests ohne DOM aufrufbar sind.

import { digits } from './shared/numberUtils.js';

const COLOR_A = '#2458d9';
const COLOR_B = '#e8a128';
const COLOR_C = '#4fae6c';
const COLOR_D = '#a35fd1';

function escapeLabel(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

function secondPartColor(variant, op) {
  if (variant === 'neighbor') return op === 'minus' ? '#d1495b' : COLOR_C;
  return COLOR_B;
}

function unitGrid(rows, cols, splitDim, parts, variant, op) {
  const cell = Math.max(14, Math.min(28, Math.floor(260 / Math.max(rows, cols))));
  const width = cols * cell;
  const height = rows * cell;
  const colorB = secondPartColor(variant, op);
  let rects = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let color = COLOR_A;
      if (splitDim === 'cols' && parts) color = c < parts[0] ? COLOR_A : colorB;
      if (splitDim === 'rows' && parts) color = r < parts[0] ? COLOR_A : colorB;
      rects += `<rect x="${c * cell + 1}" y="${r * cell + 1}" width="${cell - 2}" height="${cell - 2}" fill="${color}" opacity="0.85" rx="2" />`;
    }
  }
  let dividerLine = '';
  if (splitDim === 'cols' && parts) {
    const x = parts[0] * cell;
    dividerLine = `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="#1a2330" stroke-width="2" stroke-dasharray="4 3" />`;
  } else if (splitDim === 'rows' && parts) {
    const y = parts[0] * cell;
    dividerLine = `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="#1a2330" stroke-width="2" stroke-dasharray="4 3" />`;
  }
  return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Flächenmodell ${rows} mal ${cols}">${rects}${dividerLine}</svg>`;
}

function schematicSingleSplit(rows, cols, splitDim, parts, variant, op) {
  const W = 300, H = 170, pad = 1;
  const [p1, p2] = parts;
  const total = splitDim === 'rows' ? rows : cols;
  const ratio = p1 / total;
  const colorB = secondPartColor(variant, op);
  let html = '';
  if (splitDim === 'cols') {
    const w1 = Math.round(W * ratio);
    html += `<rect x="0" y="0" width="${w1 - pad}" height="${H}" fill="${COLOR_A}" opacity="0.85" />`;
    html += `<rect x="${w1 + pad}" y="0" width="${W - w1 - pad}" height="${H}" fill="${colorB}" opacity="0.85" />`;
    html += `<text x="${w1 / 2}" y="${H / 2}" text-anchor="middle" fill="#fff" font-weight="700" font-size="16">${rows}×${p1}=${rows * p1}</text>`;
    html += `<text x="${w1 + (W - w1) / 2}" y="${H / 2}" text-anchor="middle" fill="#fff" font-weight="700" font-size="16">${rows}×${p2}=${rows * p2}</text>`;
  } else {
    const h1 = Math.round(H * ratio);
    html += `<rect x="0" y="0" width="${W}" height="${h1 - pad}" fill="${COLOR_A}" opacity="0.85" />`;
    html += `<rect x="0" y="${h1 + pad}" width="${W}" height="${H - h1 - pad}" fill="${colorB}" opacity="0.85" />`;
    html += `<text x="${W / 2}" y="${h1 / 2}" text-anchor="middle" fill="#fff" font-weight="700" font-size="16">${p1}×${cols}=${p1 * cols}</text>`;
    html += `<text x="${W / 2}" y="${h1 + (H - h1) / 2}" text-anchor="middle" fill="#fff" font-weight="700" font-size="16">${p2}×${cols}=${p2 * cols}</text>`;
  }
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Flächenmodell ${rows} mal ${cols}, zerlegt">${html}</svg>`;
}

function schematicBothSplit(rowParts, colParts) {
  const W = 300, H = 200, pad = 2;
  const [r1, r2] = rowParts;
  const [c1, c2] = colParts;
  const rTotal = r1 + r2, cTotal = c1 + c2;
  const h1 = Math.round((H * r1) / rTotal);
  const w1 = Math.round((W * c1) / cTotal);
  const cells = [
    { x: 0, y: 0, w: w1, h: h1, color: COLOR_A, label: `${r1}×${c1}=${r1 * c1}` },
    { x: w1 + pad, y: 0, w: W - w1 - pad, h: h1, color: COLOR_B, label: `${r1}×${c2}=${r1 * c2}` },
    { x: 0, y: h1 + pad, w: w1, h: H - h1 - pad, color: COLOR_C, label: `${r2}×${c1}=${r2 * c1}` },
    { x: w1 + pad, y: h1 + pad, w: W - w1 - pad, h: H - h1 - pad, color: COLOR_D, label: `${r2}×${c2}=${r2 * c2}` },
  ];
  let html = '';
  for (const c of cells) {
    html += `<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" fill="${c.color}" opacity="0.85" />`;
    html += `<text x="${c.x + c.w / 2}" y="${c.y + c.h / 2}" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-weight="700" font-size="13">${c.label}</text>`;
  }
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Flächenmodell, in vier Teilprodukte zerlegt">${html}</svg>`;
}

/**
 * Baut das SVG-Flächenmodell für eine Rechenweg-`visual`-Beschreibung
 * ({ rows, cols, splitDim, parts|rowParts/colParts }). Gibt '' zurück, wenn kein
 * sinnvolles Bild darstellbar ist (splitDim 'none' oder kein visual übergeben).
 */
export function renderAreaModel(visual) {
  if (!visual) return '';
  const { rows, cols, splitDim, parts, rowParts, colParts, variant, op } = visual;
  if (splitDim === 'both') {
    return schematicBothSplit(rowParts, colParts);
  }
  const hasSplit = (splitDim === 'rows' || splitDim === 'cols') && parts;
  if (rows <= 12 && cols <= 12) {
    return unitGrid(rows, cols, hasSplit ? splitDim : null, hasSplit ? parts : null, variant, op);
  }
  if (hasSplit) {
    return schematicSingleSplit(rows, cols, splitDim, parts, variant, op);
  }
  // Große Zahlen ohne Split: einfaches beschriftetes Rechteck.
  const W = 260, H = 150;
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Flächenmodell ${rows} mal ${cols}">
    <rect x="0" y="0" width="${W}" height="${H}" fill="${COLOR_A}" opacity="0.85" />
    <text x="${W / 2}" y="${H / 2}" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-weight="700" font-size="18">${rows} × ${cols} = ${rows * cols}</text>
  </svg>`;
}

function makeGridHelpers(totalCols) {
  function cellsFor(value, place = 0) {
    const digs = digits(value).reverse().map(String);
    const content = [...digs, ...Array(place).fill('')];
    const leading = Array(Math.max(0, totalCols - content.length)).fill('');
    return [...leading, ...content].slice(-totalCols);
  }

  function rowHtml(cells, { op = '', highlight = false, rule = false } = {}) {
    const cls = rule ? ' class="rule-row"' : '';
    const tds = cells
      .map((c) => `<td class="${highlight ? 'highlight' : ''}">${c === '' ? '' : escapeLabel(c)}</td>`)
      .join('');
    return `<tr${cls}><td class="op-col">${op}</td>${tds}</tr>`;
  }

  return { cellsFor, rowHtml };
}

/**
 * Baut das Rechenkästchen-Raster für die schriftliche Multiplikation als HTML-Tabelle.
 * `revealCount` steuert, wie viele Teilprodukt-Zeilen (und ob die Summenzeile) sichtbar sind;
 * die zuletzt aufgedeckte Zeile wird per CSS-Klasse hervorgehoben.
 */
export function renderWrittenGrid(data, revealCount) {
  const totalCols = Math.max(digits(data.answer).length, digits(data.a).length + digits(data.b).length);
  const { cellsFor, rowHtml } = makeGridHelpers(totalCols);

  let html = '<table class="written-grid">';
  html += rowHtml(cellsFor(data.a, 0));
  html += rowHtml(cellsFor(data.b, 0), { op: '×' });

  const visiblePartials = data.partials.slice(0, Math.min(revealCount, data.partials.length));
  visiblePartials.forEach((p, idx) => {
    const isLast = idx === visiblePartials.length - 1 && revealCount <= data.partials.length;
    html += rowHtml(cellsFor(p.rawValue, p.place), { op: idx === 0 ? '=' : '+', highlight: isLast, rule: idx === 0 });
  });

  if (revealCount > data.partials.length) {
    html += rowHtml(cellsFor(data.answer, 0), { op: '=', highlight: true, rule: true });
  }

  html += '</table>';
  return html;
}

/**
 * Baut das Rechenkästchen-Raster für die schriftliche Addition. `revealCount` zählt die
 * aufgedeckten Spalten von den Einern aus (eine Spalte pro Rechenschritt).
 */
export function renderAdditionGrid(data, revealCount) {
  const totalCols = Math.max(digits(data.answer).length, digits(data.a).length, digits(data.b).length) + 1;
  const { cellsFor, rowHtml } = makeGridHelpers(totalCols);
  const n = data.columns.length;
  const shown = Math.min(revealCount, n);

  let html = '<table class="written-grid">';
  html += rowHtml(cellsFor(data.a));
  html += rowHtml(cellsFor(data.b), { op: '+' });

  // Übertrag-Zeile: kleine Ziffern über der jeweils nächsten (linken) Spalte.
  const carryDigits = Array(totalCols).fill('');
  for (let i = 0; i < shown; i++) {
    const col = data.columns[i];
    if (col.carryOut > 0 && i + 1 < totalCols) {
      carryDigits[totalCols - 1 - (i + 1)] = String(col.carryOut);
    }
  }
  if (carryDigits.some((d) => d !== '')) {
    const tds = carryDigits.map((d) => `<td class="carry">${d}</td>`).join('');
    html += `<tr><td class="op-col"></td>${tds}</tr>`;
  }

  const sumDigits = Array(totalCols).fill('');
  for (let i = 0; i < shown; i++) {
    const col = data.columns[i];
    sumDigits[totalCols - 1 - i] = String(col.writeDigit);
  }
  const highlightPos = shown > 0 ? totalCols - shown : -1;
  const sumCells = sumDigits.map((d, idx) => (idx === highlightPos ? `<td class="highlight">${d}</td>` : `<td>${d}</td>`));
  html += `<tr class="rule-row"><td class="op-col">=</td>${sumCells.join('')}</tr>`;

  html += '</table>';
  return html;
}

/**
 * Baut das Rechenkästchen-Raster für die schriftliche Subtraktion (mit Entbündeln).
 */
export function renderSubtractionGrid(data, revealCount) {
  const totalCols = Math.max(digits(data.a).length, digits(data.b).length);
  const { cellsFor, rowHtml } = makeGridHelpers(totalCols);
  const n = data.columns.length;
  const shown = Math.min(revealCount, n);

  let html = '<table class="written-grid">';
  html += rowHtml(cellsFor(data.a));
  html += rowHtml(cellsFor(data.b), { op: '−' });

  const diffDigits = Array(totalCols).fill('');
  for (let i = 0; i < shown; i++) {
    diffDigits[totalCols - 1 - i] = String(data.columns[i].diff);
  }
  const highlightPos = shown > 0 ? totalCols - shown : -1;
  const diffCells = diffDigits.map((d, idx) => (idx === highlightPos ? `<td class="highlight">${d}</td>` : `<td>${d}</td>`));
  html += `<tr class="rule-row"><td class="op-col">=</td>${diffCells.join('')}</tr>`;

  html += '</table>';
  return html;
}

/**
 * Baut die schriftliche Division im "Bogen"-Schema (Dividend : Divisor = Quotient,
 * darunter die Teilsubtraktionen). `revealCount` steuert, wie viele Rechenschritte sichtbar sind.
 */
export function renderDivisionGrid(data, revealCount) {
  const shown = Math.min(revealCount, data.steps.length);
  const quotientSoFar = data.steps
    .slice(0, shown)
    .filter((s) => !s.skipped)
    .map((s) => s.qDigit)
    .join('');

  let html = '<div class="division-grid">';
  html += `<div class="division-head"><span class="division-dividend">${data.a}</span> : <span class="division-divisor">${data.b}</span> = <span class="division-quotient">${quotientSoFar || '?'}</span></div>`;
  html += '<div class="division-steps">';
  for (let i = 0; i < shown; i++) {
    const s = data.steps[i];
    if (s.skipped) continue;
    html += `<div class="division-step"><span class="division-sub">− ${s.product}</span><span class="division-rest">Rest ${s.remainder}</span></div>`;
  }
  html += '</div></div>';
  return html;
}

/** Zahlenstrahl mit Sprüngen, für Additions-/Subtraktionsstrategien wie Ergänzen oder Verdoppeln. */
export function renderNumberLine({ start, jumps }) {
  const waypoints = [start];
  let cur = start;
  for (const j of jumps) {
    cur += j;
    waypoints.push(cur);
  }
  const min = Math.min(...waypoints);
  const max = Math.max(...waypoints);
  const W = 320, H = 120, marginX = 24;
  const range = Math.max(1, max - min);
  const scale = (W - 2 * marginX) / range;
  const xFor = (v) => marginX + (v - min) * scale;
  const baseY = H - 34;

  let svg = `<rect x="0" y="0" width="${W}" height="${H}" fill="#eef1f8" rx="10" />`;
  svg += `<line x1="${marginX}" y1="${baseY}" x2="${W - marginX}" y2="${baseY}" stroke="#51607a" stroke-width="2" />`;

  const uniqueVals = [...new Set(waypoints)];
  for (const v of uniqueVals) {
    const x = xFor(v);
    svg += `<line x1="${x}" y1="${baseY - 5}" x2="${x}" y2="${baseY + 5}" stroke="#1a2330" stroke-width="2" />`;
    svg += `<text x="${x}" y="${baseY + 22}" text-anchor="middle" font-size="13" fill="#1a2330">${v}</text>`;
  }

  jumps.forEach((j, i) => {
    const x1 = xFor(waypoints[i]);
    const x2 = xFor(waypoints[i + 1]);
    const midX = (x1 + x2) / 2;
    const topY = baseY - 30;
    const color = i % 2 === 0 ? COLOR_A : COLOR_B;
    svg += `<path d="M ${x1} ${baseY} Q ${midX} ${topY} ${x2} ${baseY}" fill="none" stroke="${color}" stroke-width="2.5" marker-end="url(#arrow)" />`;
    svg += `<text x="${midX}" y="${topY - 2}" text-anchor="middle" font-size="13" font-weight="700" fill="${color}">${j > 0 ? '+' : ''}${j}</text>`;
  });

  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Zahlenstrahl ab ${start}">
    <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#1a2330"/></marker></defs>
    ${svg}
  </svg>`;
}

/**
 * Bruchstreifen: ein Rechteck aus `den` gleich großen Feldern, eingefärbt nach den
 * zwei Teil-Zählern (`parts`). Bei Addition werden beide Teile nacheinander eingefärbt,
 * bei Subtraktion wird der zweite Teil als "entfernt" vom ersten markiert.
 */
export function renderFractionBar({ den, parts, op }) {
  const [p1, p2] = parts;
  const cell = Math.max(16, Math.min(34, Math.floor(320 / den)));
  const width = den * cell;
  const height = cell;
  let rects = '';
  for (let i = 0; i < den; i++) {
    let color = '#dfe3ea';
    if (op === '+') {
      if (i < p1) color = COLOR_A;
      else if (i < p1 + p2) color = COLOR_B;
    } else {
      if (i < p1 - p2) color = COLOR_A;
      else if (i < p1) color = '#d1495b';
    }
    rects += `<rect x="${i * cell + 1}" y="1" width="${cell - 2}" height="${height - 2}" fill="${color}" opacity="0.85" stroke="#1a2330" stroke-width="1" />`;
  }
  return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Bruchstreifen mit ${den} Teilen">${rects}</svg>`;
}

/** Statische, nicht editierbare Anzeige eines Bruchs (Zähler über Nenner) als HTML. */
export function renderFractionDisplay(num, den) {
  return `<span class="fraction-display"><span class="fraction-num">${num}</span><span class="fraction-rule"></span><span class="fraction-den">${den}</span></span>`;
}

/** Zeigt die passende SVG-Visualisierung für eine Rechenweg-`visual`-Beschreibung an, egal welcher Typ. */
export function renderVisual(visual) {
  if (!visual) return '';
  if (visual.type === 'numberline') return renderNumberLine(visual);
  if (visual.type === 'fractionbar') return renderFractionBar(visual);
  if ('rows' in visual && 'cols' in visual) return renderAreaModel(visual);
  return '';
}
