/**
 * Seedable PRNG (mulberry32) + weighted pick helpers.
 */
function ccMulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ccRng() {
  return Math.random();
}

function ccPickWeighted(weights, rng) {
  let total = 0;
  for (let i = 0; i < weights.length; i++) total += weights[i];
  if (total <= 0) return Math.floor(rng() * weights.length);
  let r = rng() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

function ccRandInt(min, max, rng) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function ccRandMid(min, max, rng) {
  const a = rng();
  const b = rng();
  const t = (a + b) / 2;
  return Math.round(min + t * (max - min));
}
