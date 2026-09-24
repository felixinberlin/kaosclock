describe('ccNormalizeSigilText', function () {
  test('trims and lowercases', function () {
    expect(cc.ccNormalizeSigilText('  Finish Landing Page  '))
      .toBe('finish landing page');
  });

  test('collapses internal whitespace', function () {
    expect(cc.ccNormalizeSigilText('finish   the\n\nlanding\tpage'))
      .toBe('finish the landing page');
  });

  test('handles null/empty', function () {
    expect(cc.ccNormalizeSigilText(null)).toBe('');
    expect(cc.ccNormalizeSigilText('')).toBe('');
    expect(cc.ccNormalizeSigilText('   ')).toBe('');
  });
});

describe('ccFilterSigils', function () {
  const rows = [
    { id: '1', text: 'a', createdAt: '2026-01-01T00:00:00Z', archived: false },
    { id: '2', text: 'b', createdAt: '2026-01-03T00:00:00Z', archived: false },
    { id: '3', text: 'c', createdAt: '2026-01-02T00:00:00Z', archived: true }
  ];

  test('excludes archived by default', function () {
    const out = cc.ccFilterSigils(rows, false);
    expect(out.length).toBe(2);
    expect(out.map(function (r) { return r.id; })).toEqual(['2', '1']);
  });

  test('includes archived when asked', function () {
    const out = cc.ccFilterSigils(rows, true);
    expect(out.length).toBe(3);
    expect(out[0].id).toBe('2');
  });

  test('sorts newest first', function () {
    const out = cc.ccFilterSigils(rows, false);
    expect(new Date(out[0].createdAt).getTime())
      .toBeGreaterThan(new Date(out[1].createdAt).getTime());
  });
});

describe('ccFindSigilIn', function () {
  const rows = [
    { id: '1', text: 'Finish landing page', archived: false },
    { id: '2', text: 'pay bills', archived: false }
  ];

  test('matches case-insensitively and ignoring whitespace', function () {
    expect(cc.ccFindSigilIn(rows, 'finish landing page').id).toBe('1');
    expect(cc.ccFindSigilIn(rows, '  PAY   BILLS  ').id).toBe('2');
  });

  test('returns null when no match', function () {
    expect(cc.ccFindSigilIn(rows, 'nope')).toBeNull();
  });
});