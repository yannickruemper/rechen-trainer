// Winziges, abhängigkeitsfreies Test-Framework für `node tests/run-tests.js`.

let total = 0;
let failed = 0;

export function section(title) {
  console.log(`\n${title}`);
}

export function test(description, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ ${description}`);
  } catch (err) {
    failed++;
    console.error(`  ✗ ${description}`);
    console.error(`    ${err.message}`);
  }
}

export function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(`${msg ? msg + ': ' : ''}erwartet ${JSON.stringify(expected)}, erhalten ${JSON.stringify(actual)}`);
  }
}

export function assertTrue(value, msg) {
  if (!value) throw new Error(msg || 'erwartet einen wahren Wert');
}

export function assertInRange(value, min, max, msg) {
  if (value < min || value > max) {
    throw new Error(`${msg ? msg + ': ' : ''}${value} liegt nicht im Bereich [${min}, ${max}]`);
  }
}

export function summary() {
  console.log(`\n${total - failed}/${total} Tests bestanden.`);
  if (failed > 0) {
    console.error(`${failed} Test(s) fehlgeschlagen.`);
    process.exitCode = 1;
  }
}
