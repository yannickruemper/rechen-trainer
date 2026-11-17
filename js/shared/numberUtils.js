// Kleine zahlentheoretische Hilfsfunktionen, die von mehreren Rechenarten gebraucht werden.

/** Ziffern von n, LSB (Einer) zuerst, als Zahlen-Array. n muss eine nicht-negative ganze Zahl sein. */
export function digits(n) {
  if (n === 0) return [0];
  const s = Math.abs(Math.trunc(n)).toString();
  return s.split('').reverse().map(Number);
}

export function randInt(min, max, rng = Math.random) {
  return min + Math.floor(rng() * (max - min + 1));
}

/**
 * Wählt ein Element aus `items` gewichtet nach `weights` (gleiche Länge).
 */
export function pickWeighted(items, weights, rng = Math.random) {
  const total = weights.reduce((sum, w) => sum + w, 0);
  if (total <= 0) return items[Math.floor(rng() * items.length)];
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

/**
 * Gewicht einer Aufgabe für die Wiederholungslogik: noch nie gesehene Aufgaben
 * bekommen ein mittleres Gewicht, oft falsch gelöste ein hohes Gewicht.
 */
export function weightForFact(stats) {
  if (!stats || stats.attempts === 0) return 3;
  const errorRate = 1 - stats.correct / stats.attempts;
  return 1 + errorRate * 4;
}

/** Größter gemeinsamer Teiler (Euklidischer Algorithmus). */
export function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

/** Kleinstes gemeinsames Vielfaches. */
export function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

/** Kürzt einen Bruch num/den vollständig (den bleibt positiv). */
export function simplifyFraction(num, den) {
  const sign = den < 0 ? -1 : 1;
  num *= sign;
  den *= sign;
  const g = gcd(num, den) || 1;
  return { num: num / g, den: den / g };
}
