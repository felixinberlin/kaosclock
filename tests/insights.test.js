describe('ccComputeInsights', function () {
  const now = new Date('2026-01-15T12:00:00Z');

  test('cold start below threshold', function () {
    const out = cc.ccComputeInsights([{ completed: true, rolledAt: now, mode: 'banish' }], now);
    expect(out[0].type).toBe('cold-start');
  });

  test('flags a mode with low completion', function () {
    const sessions = [];
    for (let i = 0; i < 5; i++) {
      sessions.push({ mode: 'gnosis', completed: false, rolledAt: '2026-01-10T10:00:00Z', flow: 0 });
    }
    for (let i = 0; i < 5; i++) {
      sessions.push({ mode: 'banish', completed: true, rolledAt: '2026-01-11T10:00:00Z', flow: 4 });
    }
    const out = cc.ccComputeInsights(sessions, now);
    const skip = out.find(function (i) { return i.type === 'skip:gnosis'; });
    expect(skip).toBeDefined();
  });

  test('flags a high-flow mode', function () {
    const sessions = [];
    for (let i = 0; i < 5; i++) {
      sessions.push({ mode: 'gnosis', completed: true, rolledAt: '2026-01-10T10:00:00Z', flow: 5 });
    }
    // pad to clear the cold-start threshold (7)
    for (let i = 0; i < 3; i++) {
      sessions.push({ mode: 'banish', completed: true, rolledAt: '2026-01-10T10:00:00Z', flow: 3 });
    }
    const out = cc.ccComputeInsights(sessions, now);
    const flow = out.find(function (i) { return i.type === 'flow:gnosis'; });
    expect(flow).toBeDefined();
  });
});