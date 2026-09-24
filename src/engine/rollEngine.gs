function ccRoll(input, rng) {
  rng = rng || ccRng;
  const chaos = ccClamp(input.chaos == null ? CC.DEFAULTS.chaos : input.chaos, 0, 100);
  const energy = ccClamp(input.energy == null ? CC.DEFAULTS.energy : input.energy, 1, 5);
  const focus = ccClamp(input.focus == null ? CC.DEFAULTS.focus : input.focus, 1, 5);
  const time = Math.max(1, input.timeAvailable || CC.DEFAULTS.time);
  const intent = (input.intent || '').trim() || 'Untitled intention';

  const feasible = ccFeasibleModes(energy, focus, time);
  const weights = ccWeights(feasible, energy, focus, time);

  let pickIdx;
  if (chaos === 0) {
    // Zen: deterministic argmax, no dice.
    pickIdx = ccArgmax(weights);
  } else {
    const shaped = ccShapeByChaos(weights, chaos);
    pickIdx = ccPickWeighted(shaped, rng);
  }

  const mode = feasible[pickIdx];
  // Zen: no dice for the duration either — take the middle of the range.
  const duration = chaos === 0 ? ccMidDuration(mode, time) : ccRollDuration(mode, time, rng);
  const drift = ccRollDrift(chaos, rng);
  const phantom = chaos >= CC.PHANTOM_MIN_CHAOS && rng() < (chaos - CC.PHANTOM_MIN_CHAOS) / 200;

  return {
    mode: mode.id,
    modeName: mode.name,
    duration: duration,
    sigil: ccSigil(intent),
    driftMin: drift,
    phantom: phantom
  };
}

function ccClamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

function ccArgmax(arr) {
  let best = 0;
  for (let i = 1; i < arr.length; i++) if (arr[i] > arr[best]) best = i;
  return best;
}

function ccFeasibleModes(energy, focus, time) {
  const out = [];
  for (let i = 0; i < CC.MODES.length; i++) {
    const m = CC.MODES[i];
    if (time < m.min) continue;
    if (energy + 1 < m.minEnergy) continue;
    if (focus + 1 < m.minFocus) continue;
    out.push(m);
  }
  if (out.length === 0) out.push(ccMode('banish'));
  return out;
}

function ccWeights(modes, energy, focus, time) {
  const w = [];
  for (let i = 0; i < modes.length; i++) {
    const m = modes[i];
    let weight = 1;
    if (energy < m.minEnergy) weight *= 0.15;
    if (focus < m.minFocus) weight *= 0.15;
    if (time < m.max) weight *= 0.7;
    if (m.id === 'gnosis' && energy >= 4 && focus >= 4 && time >= 45) weight *= 2.0;
    if (m.id === 'banish' && energy <= 2) weight *= 2.5;
    if (m.id === 'ground' && energy <= 2) weight *= 2.0;
    w.push(weight);
  }
  return w;
}

function ccShapeByChaos(weights, chaos) {
  const t = 1 + (chaos / 100) * 5;
  const shaped = [];
  for (let i = 0; i < weights.length; i++) {
    shaped.push(Math.pow(Math.max(weights[i], 1e-6), 1 / t));
  }
  return shaped;
}

function ccRollDuration(mode, timeAvailable, rng) {
  const hi = Math.min(mode.max, timeAvailable);
  const lo = Math.min(mode.min, hi);
  if (lo === hi) return lo;
  return ccRandMid(lo, hi, rng);
}

function ccMidDuration(mode, timeAvailable) {
  const hi = Math.min(mode.max, timeAvailable);
  const lo = Math.min(mode.min, hi);
  return Math.round((lo + hi) / 2);
}

function ccRollDrift(chaos, rng) {
  if (chaos <= 0) return 0;
  const maxDrift = Math.round((chaos / 100) * CC.DRIFT_MAX_MIN);
  const signed = (rng() * 2 - 1);
  return Math.round(signed * maxDrift);
}

const CC_SIGIL_GLYPHS = '⌀△▽◇◈✦✧⌘⎔⚚⟁⟒⟟⟠⟡⟢⟣⟤⟥⟦⟧⟨⟩';

function ccSigil(intent) {
  const s = (intent || '').toLowerCase().replace(/\s+/g, '');
  if (!s) return '⌀';

  // FNV-1a
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }

  // Mix between glyph picks so consecutive picks are independent.
  let x = h >>> 0;
  let out = '';
  for (let i = 0; i < 4; i++) {
    x ^= (x << 13) | 0;
    x ^= x >>> 17;
    x ^= (x << 5) | 0;
    x = x >>> 0;
    out += CC_SIGIL_GLYPHS[x % CC_SIGIL_GLYPHS.length];
  }
  return out;
}