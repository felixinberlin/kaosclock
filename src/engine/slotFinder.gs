/**
 * Pure slot finder. Takes busy intervals, working hours, and a search
 * window; returns the earliest free slot that fits.
 *
 * All times are epoch ms except where noted. workStart/workEnd are
 * wall-clock hours in opts.tz (IANA zone, default 'UTC').
 */
function ccFindSlotPure(opts) {
  const from = opts.from;
  const horizonMs = opts.horizonDays * 86400000;
  const durationMs = opts.durationMin * 60000;
  const busy = opts.busy || [];
  const workStart = opts.workStart;
  const workEnd = opts.workEnd;
  const graceMs = (opts.graceMin || 0) * 60000;
  const minGapMs = (opts.minGapMin || 0) * 60000;
  const nowMs = opts.now || Date.now();
  const tz = opts.tz || 'UTC';

  const earliest = Math.max(from, nowMs + graceMs);
  const limit = earliest + horizonMs;

  let cursor = earliest;

  while (cursor < limit) {
    const dayStartMs = ccTzAtHour(cursor, 0, workStart, tz);
    const dayEndMs = ccTzAtHour(cursor, 0, workEnd, tz);

    let scan = Math.max(cursor, dayStartMs);

    if (scan < dayEndMs) {
      let placed = null;
      for (let i = 0; i < busy.length; i++) {
        const b = busy[i];
        if (b.end <= scan) continue;
        if (b.start >= dayEndMs) break;
        if (b.start - scan >= durationMs + minGapMs) {
          placed = scan;
          break;
        }
        if (b.end > scan) scan = b.end + minGapMs;
      }
      if (placed === null && dayEndMs - scan >= durationMs + minGapMs) {
        placed = scan;
      }
      if (placed !== null) {
        return { start: placed, end: placed + durationMs };
      }
    }

    // Next day, at work start.
    cursor = ccTzAtHour(dayStartMs, 1, workStart, tz);
  }

  return null;
}

/**
 * Wraps ccFindSlotPure with schedule-mode handling and a fallback.
 */
function ccPlanSlotForRoll(input) {
  const driftMs = (input.driftMin || 0) * 60000;
  const baseFrom = input.now.getTime() + driftMs;
  const fallback = {
    start: new Date(baseFrom),
    end: new Date(baseFrom + input.durationMin * 60000)
  };

  if (input.schedule === 'now') return fallback;

  const horizonDays = input.schedule === 'soon' ? 1 : CC.SLOT_HORIZON_DAYS;

  const slot = ccFindSlotPure({
    from: baseFrom,
    horizonDays: horizonDays,
    durationMin: input.durationMin,
    busy: input.busy || [],
    workStart: CC.SLOT_WORKING_START,
    workEnd: CC.SLOT_WORKING_END,
    graceMin: CC.SLOT_GRACE_MIN,
    minGapMin: CC.SLOT_MIN_GAP_MIN,
    now: input.now.getTime(),
    tz: input.tz || 'UTC'
  });

  if (!slot) return fallback;
  return { start: new Date(slot.start), end: new Date(slot.end) };
}