describe('time-zone helpers', function () {
  test('Berlin offset is +2h in summer, +1h in winter', function () {
    expect(cc.ccTzOffsetMs(Date.UTC(2026, 6, 1, 12), 'Europe/Berlin')).toBe(2 * 3600000);
    expect(cc.ccTzOffsetMs(Date.UTC(2026, 0, 12, 12), 'Europe/Berlin')).toBe(3600000);
  });

  test('wall clock to instant', function () {
    // 09:00 in Berlin on 12 Jan 2026 is 08:00 UTC
    expect(cc.ccTzWallToMs(2026, 1, 12, 9, 0, 'Europe/Berlin')).toBe(Date.UTC(2026, 0, 12, 8, 0));
    // 09:00 in New York on 1 Jul 2026 is 13:00 UTC
    expect(cc.ccTzWallToMs(2026, 7, 1, 9, 0, 'America/New_York')).toBe(Date.UTC(2026, 6, 1, 13, 0));
  });

  test('ccTzAtHour crosses the DST switch by calendar day, not by 24h', function () {
    // Sat 28 Mar 2026 10:00 Berlin (CET) → next day 10:00 Berlin is CEST
    const sat = Date.UTC(2026, 2, 28, 9, 0);
    expect(cc.ccTzAtHour(sat, 1, 10, 'Europe/Berlin')).toBe(Date.UTC(2026, 2, 29, 8, 0));
  });

  test('local parts use the zone, not the machine', function () {
    // 23:30 UTC on 31 Jan is already 1 Feb in Berlin
    const p = cc.ccTzParts(Date.UTC(2026, 0, 31, 23, 30), 'Europe/Berlin');
    expect(p.month).toBe(2);
    expect(p.day).toBe(1);
    expect(p.hour).toBe(0);
  });
});

describe('user time zone in the engine', function () {
  const settings = { flags: { antiCalendarDay: true, prophecy: true } };

  test('working hours are Berlin hours, not UTC hours', function () {
    const base = Date.UTC(2026, 0, 12, 6, 0); // 07:00 Berlin
    const slot = cc.ccFindSlotPure({
      from: base, now: base, horizonDays: 1, durationMin: 30, busy: [],
      workStart: 9, workEnd: 20, graceMin: 0, minGapMin: 0, tz: 'Europe/Berlin'
    });
    expect(slot.start).toBe(Date.UTC(2026, 0, 12, 8, 0)); // 09:00 Berlin
  });

  test('no slot after 20:00 Berlin even though it is only 19:xx UTC', function () {
    const base = Date.UTC(2026, 0, 12, 19, 10); // 20:10 Berlin
    const slot = cc.ccFindSlotPure({
      from: base, now: base, horizonDays: 2, durationMin: 30, busy: [],
      workStart: 9, workEnd: 20, graceMin: 0, minGapMin: 0, tz: 'Europe/Berlin'
    });
    expect(slot.start).toBe(Date.UTC(2026, 0, 13, 8, 0)); // next day 09:00 Berlin
  });

  test('anti-calendar day follows the local date', function () {
    // 31 Jan 23:30 UTC is 1 Feb in Berlin
    const t = new Date(Date.UTC(2026, 0, 31, 23, 30));
    expect(cc.ccIsAntiCalendarDay(t, settings, 'UTC')).toBe(true);
    expect(cc.ccIsAntiCalendarDay(t, settings, 'Europe/Berlin')).toBe(false);
  });

  test('prophecy lands at 10:00 local', function () {
    const now = new Date(Date.UTC(2026, 6, 1, 3, 0));
    const zero = function () { return 0; };
    const plan = cc.ccPlanProphecy(settings, now, zero, 'Europe/Berlin');
    const p = cc.ccTzParts(plan.start.getTime(), 'Europe/Berlin');
    expect(p.hour).toBe(10);
    expect(p.minute).toBe(0);
  });
});
