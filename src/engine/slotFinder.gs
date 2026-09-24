/**
 * Pure slot finder. Takes busy intervals, working hours, and a search
 * window; returns the earliest free slot that fits.
 *
 * All times are epoch ms except where noted.
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

  const earliest = Math.max(from, nowMs + graceMs);
  const limit = earliest + horizonMs;

  let cursor = new Date(earliest);

  while (cursor.getTime() < limit) {
    const dayStart = new Date(cursor);
    dayStart.setHours(workStart, 0, 0, 0);
    const dayEnd = new Date(cursor);
    dayEnd.setHours(workEnd, 0, 0, 0);

    let scan = Math.max(cursor.getTime(), dayStart.getTime());

    if (scan < dayEnd.getTime()) {
      let placed = null;
      for (let i = 0; i < busy.length; i++) {
        const b = busy[i];
        if (b.end <= scan) continue;
        if (b.start >= dayEnd.getTime()) break;
        if (b.start - scan >= durationMs + minGapMs) {
          placed = scan;
          break;
        }
        if (b.end > scan) scan = b.end + minGapMs;
      }
      if (placed === null && dayEnd.getTime() - scan >= durationMs + minGapMs) {
        placed = scan;
      }
      if (placed !== null) {
        return { start: placed, end: placed + durationMs };
      }
    }

    // Next day, at work start.
    const nextDay = new Date(dayStart.getTime() + 86400000);
    nextDay.setHours(workStart, 0, 0, 0);
    cursor = nextDay;
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
    now: input.now.getTime()
  });

  if (!slot) return fallback;
  return { start: new Date(slot.start), end: new Date(slot.end) };
}