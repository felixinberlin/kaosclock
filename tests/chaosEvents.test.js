describe('chaos events planners', function () {
  const now = new Date('2026-01-15T12:00:00Z');
  const settings = { flags: { resurface: true, reluctantServitor: true } };

  test('resurface: eligible for high-flow, old, completed', function () {
    const s = {
      rolledAt: '2026-01-01T10:00:00Z',
      completed: true,
      flow: 5,
      note: ''
    };
    expect(cc.ccIsResurfaceCandidate(s, now, settings)).toBe(true);
  });

  test('resurface: not eligible if already resurfaced', function () {
    const s = {
      rolledAt: '2026-01-01T10:00:00Z',
      completed: true,
      flow: 5,
      note: '[resurfaced]'
    };
    expect(cc.ccIsResurfaceCandidate(s, now, settings)).toBe(false);
  });

  test('resurface: not eligible if flag off', function () {
    const s = { rolledAt: '2026-01-01T10:00:00Z', completed: true, flow: 5, note: '' };
    const off = { flags: { resurface: false } };
    expect(cc.ccIsResurfaceCandidate(s, now, off)).toBe(false);
  });

  test('resurface: not eligible if too fresh', function () {
    const s = { rolledAt: '2026-01-14T10:00:00Z', completed: true, flow: 5, note: '' };
    expect(cc.ccIsResurfaceCandidate(s, now, settings)).toBe(false);
  });

  test('wander: returns null once cap reached', function () {
    const s = { rolledAt: '2026-01-10T10:00:00Z', duration: 15, wanderCount: 7, completed: false };
    expect(cc.ccPlanWander(s, now, Math.random)).toBeNull();
  });

  test('wander: moves low-flow sessions into the future', function () {
    const s = { rolledAt: '2026-01-10T10:00:00Z', duration: 15, wanderCount: 0, completed: false };
    const plan = cc.ccPlanWander(s, now, Math.random);
    expect(plan).not.toBeNull();
    expect(plan.newStart.getTime()).toBeGreaterThan(new Date(s.rolledAt).getTime());
  });

  test('reluctant servitor: nags after 3 skips of the same mode', function () {
    const sessions = [
      { mode: 'gnosis', completed: false },
      { mode: 'banish', completed: true },
      { mode: 'gnosis', completed: false },
      { mode: 'gnosis', completed: false }
    ];
    expect(cc.ccShouldNag(sessions, 'gnosis', settings)).toBe(true);
    expect(cc.ccShouldNag(sessions, 'banish', settings)).toBe(false);
  });

  describe('Tier 3 planners', function () {
  const now = new Date('2026-01-15T12:00:00Z');
  const settings = {
    flags: { trickster: true, pastTense: true, prophecy: true, antiCalendarDay: true }
  };

  test('past tense: returns event in the past', function () {
    const alwaysSmall = function () { return 0.05; };
    const pt = cc.ccPlanPastTense('Banish', 'wash dishes', 100, now, alwaysSmall);
    expect(pt).not.toBeNull();
    expect(pt.start.getTime()).toBeLessThan(now.getTime());
    expect(pt.title).toContain('You already did this');
  });

  test('past tense: null below threshold', function () {
    const pt = cc.ccPlanPastTense('Banish', 'x', 10, now, cc.ccMulberry32(1));
    expect(pt).toBeNull();
  });

  test('trickster: respects chaos floor', function () {
    expect(cc.ccRollTrickster(20, settings, cc.ccMulberry32(1))).toBe(false);
  });

  test('anti-calendar: true on last day of month', function () {
    const lastDay = new Date('2026-01-31T12:00:00Z');
    expect(cc.ccIsAntiCalendarDay(lastDay, settings)).toBe(true);
    expect(cc.ccIsAntiCalendarDay(new Date('2026-01-15T12:00:00Z'), settings)).toBe(false);
  });

  test('confession summarizes the week', function () {
    const text = cc.ccBuildConfession([
      { rolledAt: '2026-01-14T10:00:00Z', completed: true, mode: 'gnosis', note: '' },
      { rolledAt: '2026-01-13T10:00:00Z', completed: false, mode: 'banish', note: '' },
      { rolledAt: '2026-01-12T10:00:00Z', completed: true, mode: 'banish', note: '[trickster]' }
    ], now);
    expect(text).toContain('rolled 3');
    expect(text).toContain('completed 2');
    expect(text).toContain('trickster visited 1');
  });
});
});
