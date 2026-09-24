/**
 * Pure-ish planners for autonomous chaos behavior.
 * Everything here is deterministic given (input, rng) and unit tested.
 */

/* ---------- Resurface ---------- */

function ccIsResurfaceCandidate(session, now, settings) {
  if (!settings.flags.resurface) return false;
  if (!session.completed) return false;
  const flow = Number(session.flow) || 0;
  if (flow < CC.RESURFACE_MIN_FLOW) return false;
  const rolledAt = new Date(session.rolledAt);
  const ageDays = (now - rolledAt) / 86400000;
  if (ageDays < CC.RESURFACE_MIN_AGE_DAYS) return false;
  if (String(session.note || '').indexOf('[resurfaced]') !== -1) return false;
  return true;
}

function ccPickResurfaceCandidate(sessions, now, settings, rng) {
  rng = rng || ccRng;
  const eligible = sessions.filter(function (s) {
    return ccIsResurfaceCandidate(s, now, settings);
  });
  if (eligible.length === 0) return null;
  return eligible[Math.floor(rng() * eligible.length)];
}

/* ---------- Wandering ---------- */

function ccPlanWander(session, now, rng, tz) {
  rng = rng || ccRng;
  tz = tz || 'UTC';
  const flow = Number(session.flow) || 0;
  if (session.completed && flow > CC.WANDER_MIN_FLOW) return null;
  const wanderCount = Number(session.wanderCount) || 0;
  if (wanderCount >= CC.WANDER_MAX_COUNT) return null;

  const start = new Date(session.rolledAt);
  const durationMs = (Number(session.duration) || 15) * 60000;

  const shiftOptions = [
    function () { return start.getTime() + ccRandInt(15, 90, rng) * 60000; },
    function () { return ccTzAtHour(start.getTime(), 1, 9 + ccRandInt(0, 4, rng), tz); },
    function () { return ccTzAtHour(start.getTime(), 1, 18 + ccRandInt(0, 3, rng), tz); }
  ];
  const newStartMs = shiftOptions[Math.floor(rng() * shiftOptions.length)]();
  return { newStart: new Date(newStartMs), newEnd: new Date(newStartMs + durationMs) };
}

/* ---------- Reluctant servitor ---------- */

function ccShouldNag(sessions, modeId, settings) {
  if (!settings.flags.reluctantServitor) return false;
  let skips = 0;
  for (let i = 0; i < sessions.length && i < 10; i++) {
    const s = sessions[i];
    if (s.mode !== modeId) continue;
    if (s.completed) continue;
    skips++;
    if (skips >= CC.RELUCTANT_THRESHOLD) return true;
  }
  return false;
}

function ccNagText(modeId) {
  const m = ccMode(modeId);
  const name = m ? m.name : modeId;
  return 'Fine. I\'ll wait. (' + name + ' skipped ' + CC.RELUCTANT_THRESHOLD + 'x)';
}

/* ---------- Past Tense ---------- */

/**
 * Occasionally place the event in the past, in past tense.
 * Returns { title, start, end } or null.
 */
function ccPlanPastTense(modeName, intent, chaos, now, rng) {
  rng = rng || ccRng;
  if (chaos < CC.PAST_TENSE_MIN_CHAOS) return null;
  const chance = (chaos - CC.PAST_TENSE_MIN_CHAOS) / 200; // up to 20% at chaos=100
  if (rng() > chance) return null;

  const offsetMin = ccRandInt(30, 90, rng);
  const start = new Date(now.getTime() - offsetMin * 60000);
  const end = new Date(start.getTime() + 2 * 60000);
  return {
    title: '[' + modeName + '] You already did this. (' + intent + ')',
    start: start,
    end: end
  };
}

/* ---------- Poltergeist ---------- */

function ccPlanPoltergeist(session, chaos, rng, tz) {
  rng = rng || ccRng;
  tz = tz || 'UTC';
  if (chaos < CC.POLTERGEIST_MIN_CHAOS) return null;
  if (!session.completed) return null;
  if (rng() > CC.POLTERGEIST_CHANCE) return null;

  const originalStart = new Date(session.rolledAt);
  const localHour = ccTzParts(originalStart.getTime(), tz).hour;
  const echoStart = new Date(ccTzAtHour(originalStart.getTime(), 7, localHour, tz));
  const duration = Number(session.duration) || 15;
  const mode = ccMode(session.mode) || { name: '?' };
  return {
    title: '[' + mode.name + '] ' + session.intent + ' (echo)',
    start: echoStart,
    end: new Date(echoStart.getTime() + duration * 60000),
    description: 'Echo of session ' + session.id
  };
}

/* ---------- Prophecy ---------- */

function ccPlanProphecy(settings, now, rng, tz) {
  rng = rng || ccRng;
  tz = tz || 'UTC';
  if (!settings.flags.prophecy) return null;
  if (rng() > 0.15) return null; // ~once a week at daily trigger
  const days = ccRandInt(3, CC.PROPHECY_HORIZON_DAYS, rng);
  const start = new Date(ccTzAtHour(now.getTime(), days, 10, tz));
  const end = new Date(start.getTime() + 30 * 60000);
  return {
    title: '[Gnosis] You\'ll know what this is for.',
    start: start,
    end: end,
    description: 'A prophecy. Fill it or delete it.'
  };
}

/* ---------- Trickster ---------- */

function ccRollTrickster(chaos, settings, rng) {
  rng = rng || ccRng;
  if (!settings.flags.trickster) return false;
  if (chaos < CC.TRICKSTER_MIN_CHAOS) return false;
  return rng() < CC.TRICKSTER_CHANCE * (chaos / 100);
}

/* ---------- Anti-Calendar Day ---------- */

function ccIsAntiCalendarDay(now, settings, tz) {
  if (!settings.flags.antiCalendarDay) return false;
  const p = ccTzParts(now.getTime(), tz || 'UTC');
  const lastDay = new Date(Date.UTC(p.year, p.month, 0)).getUTCDate();
  return p.day === lastDay;
}

/* ---------- Confession ---------- */

function ccBuildConfession(sessions, now) {
  const week = sessions.filter(function (s) {
    const d = new Date(s.rolledAt);
    return (now - d) < 7 * 86400000;
  });
  const rolled = week.length;
  const completed = week.filter(function (s) { return s.completed; }).length;
  const banishes = week.filter(function (s) { return s.mode === 'banish'; }).length;
  const tricksters = week.filter(function (s) {
    return String(s.note || '').indexOf('[trickster]') !== -1;
  }).length;

  const lines = [
    'You rolled ' + rolled + ' times and completed ' + completed + '.',
    'You banished ' + banishes + ' times.',
    'The trickster visited ' + tricksters + ' time(s).'
  ];
  if (rolled > 0 && completed / rolled < 0.4) {
    lines.push('You\'re rolling more than you\'re doing. Try lower chaos.');
  }
  return lines.join(' ');
}