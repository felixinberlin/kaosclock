describe('ccRoll', function () {
  function rngFrom(values) {
    let i = 0;
    return function () { return values[(i++) % values.length]; };
  }

  test('produces a valid mode and duration in range', function () {
    const roll = cc.ccRoll({
      intent: 'write docs',
      energy: 3, focus: 3, timeAvailable: 60, chaos: 0
    }, rngFrom([0.5, 0.5, 0.5, 0.5, 0.5]));
    const mode = cc.ccMode(roll.mode);
    expect(mode).not.toBeNull();
    expect(roll.duration).toBeGreaterThanOrEqual(mode.min);
    expect(roll.duration).toBeLessThanOrEqual(Math.min(mode.max, 60));
  });

  test('chaos=0 with high energy/focus/time picks Gnosis (deterministic)', function () {
    const roll = cc.ccRoll({
      intent: 'deep work',
      energy: 5, focus: 5, timeAvailable: 90, chaos: 0
    }, rngFrom([0.0, 0.5, 0.5, 0.5]));
    expect(roll.mode).toBe('gnosis');
  });

  test('chaos=0 with low energy picks a light mode', function () {
    const roll = cc.ccRoll({
      intent: 'ugh',
      energy: 1, focus: 1, timeAvailable: 15, chaos: 0
    }, rngFrom([0.0, 0.5]));
    expect(['banish', 'ground', 'divinate']).toContain(roll.mode);
  });

  test('high chaos produces drift', function () {
    const roll = cc.ccRoll({
      intent: 'x', energy: 3, focus: 3, timeAvailable: 60, chaos: 100
    }, rngFrom([0.9, 0.9, 0.9, 0.9, 0.9]));
    expect(Math.abs(roll.driftMin)).toBeGreaterThan(0);
  });

  test('sigil is deterministic for same intent', function () {
    const a = cc.ccSigil('Finish landing page copy');
    const b = cc.ccSigil('Finish landing page copy');
    const c = cc.ccSigil('Something else');
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });

  test('never returns a duration longer than available time', function () {
    for (let i = 0; i < 50; i++) {
      const roll = cc.ccRoll({
        intent: 'x', energy: 3, focus: 3, timeAvailable: 10, chaos: 50
      }, Math.random);
      expect(roll.duration).toBeLessThanOrEqual(10);
    }
  });
});

describe('chaos 0 is fully deterministic', function () {
  test('same inputs, same roll, whatever the rng says', function () {
    const input = { intent: 'Finish landing page copy', energy: 4, focus: 4, timeAvailable: 60, chaos: 0 };
    const a = cc.ccRoll(input, cc.ccMulberry32(1));
    const b = cc.ccRoll(input, cc.ccMulberry32(999));
    const c = cc.ccRoll(input, Math.random);
    expect(b).toEqual(a);
    expect(c).toEqual(a);
    expect(a.driftMin).toBe(0);
    expect(a.phantom).toBe(false);
  });
});
