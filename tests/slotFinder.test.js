describe('ccFindSlotPure', function () {
  // Monday 2026-01-12, 08:00 UTC
  const base = Date.UTC(2026, 0, 12, 8, 0, 0);

  function opts(overrides) {
    return Object.assign({
      from: base,
      horizonDays: 1,
      durationMin: 30,
      busy: [],
      workStart: 9,
      workEnd: 20,
      graceMin: 0,
      minGapMin: 0,
      now: base
    }, overrides);
  }

  test('lands at work start when free', function () {
    const slot = cc.ccFindSlotPure(opts({}));
    expect(slot).not.toBeNull();
    expect(new Date(slot.start).getUTCHours()).toBe(9);
    expect(slot.end - slot.start).toBe(30 * 60000);
  });

  test('skips a busy interval', function () {
    const busyStart = Date.UTC(2026, 0, 12, 9, 0, 0);
    const busyEnd   = Date.UTC(2026, 0, 12, 10, 0, 0);
    const slot = cc.ccFindSlotPure(opts({
      busy: [{ start: busyStart, end: busyEnd }]
    }));
    expect(slot).not.toBeNull();
    // Should land at 10:00 UTC
    expect(new Date(slot.start).getUTCHours()).toBe(10);
  });

  test('chains through multiple busy intervals', function () {
    const busy = [
      { start: Date.UTC(2026, 0, 12, 9, 0, 0),  end: Date.UTC(2026, 0, 12, 9, 30, 0) },
      { start: Date.UTC(2026, 0, 12, 9, 30, 0), end: Date.UTC(2026, 0, 12, 11, 0, 0) },
      { start: Date.UTC(2026, 0, 12, 11, 0, 0), end: Date.UTC(2026, 0, 12, 13, 0, 0) }
    ];
    const slot = cc.ccFindSlotPure(opts({ busy: busy }));
    expect(slot).not.toBeNull();
    expect(new Date(slot.start).getUTCHours()).toBe(13);
  });

  test('rolls over to next day when the day is full', function () {
    const busy = [
      { start: Date.UTC(2026, 0, 12, 9, 0, 0),  end: Date.UTC(2026, 0, 12, 20, 0, 0) }
    ];
    const slot = cc.ccFindSlotPure(opts({ busy: busy, horizonDays: 2 }));
    expect(slot).not.toBeNull();
    expect(new Date(slot.start).getUTCDate()).toBe(13);
    expect(new Date(slot.start).getUTCHours()).toBe(9);
  });

  test('returns null when the horizon is fully booked', function () {
    const busy = [];
    for (let d = 0; d < 3; d++) {
      busy.push({
        start: Date.UTC(2026, 0, 12 + d, 0, 0, 0),
        end:   Date.UTC(2026, 0, 12 + d, 23, 59, 0)
      });
    }
    const slot = cc.ccFindSlotPure(opts({ busy: busy, horizonDays: 3 }));
    expect(slot).toBeNull();
  });

  test('respects the grace period', function () {
    const nowMs = Date.UTC(2026, 0, 12, 9, 0, 0);
    const slot = cc.ccFindSlotPure(opts({
      from: nowMs, now: nowMs, graceMin: 30
    }));
    expect(slot).not.toBeNull();
    // 9:00 + 30 min grace = 9:30 UTC
    expect(new Date(slot.start).getUTCHours()).toBe(9);
    expect(new Date(slot.start).getUTCMinutes()).toBe(30);
  });

  test('enforces min gap between events', function () {
    const busy = [
      { start: Date.UTC(2026, 0, 12, 9, 0, 0), end: Date.UTC(2026, 0, 12, 10, 0, 0) }
    ];
    const slot = cc.ccFindSlotPure(opts({
      busy: busy, minGapMin: 15, durationMin: 30
    }));
    expect(new Date(slot.start).getUTCHours()).toBe(10);
    expect(new Date(slot.start).getUTCMinutes()).toBe(15);
  });
});

describe('ccPlanSlotForRoll', function () {
  const now = new Date('2026-01-12T08:00:00Z');

  test('schedule=now returns now + drift', function () {
    const slot = cc.ccPlanSlotForRoll({
      now: now, durationMin: 30, schedule: 'now', driftMin: 10, busy: []
    });
    expect(slot.start.getTime()).toBe(now.getTime() + 10 * 60000);
    expect(slot.end.getTime() - slot.start.getTime()).toBe(30 * 60000);
  });

  test('schedule=week finds a future slot', function () {
    const slot = cc.ccPlanSlotForRoll({
      now: now, durationMin: 30, schedule: 'week', driftMin: 0, busy: []
    });
    expect(slot.start.getTime()).toBeGreaterThan(now.getTime());
  });
});