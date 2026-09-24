/**
 * Sigil Vault — persistent store of intents the user has rolled.
 * Dedup by normalized text. Pure helpers separated for testing.
 */

function ccNormalizeSigilText(text) {
  return String(text || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Pure: filter + sort a list of sigil rows. */
function ccFilterSigils(rows, includeArchived) {
  const out = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!includeArchived && r.archived) continue;
    out.push(r);
  }
  out.sort(function (a, b) {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  return out;
}

/** Pure: find a sigil in a list by text (input is normalized internally). */
function ccFindSigilIn(rows, text) {
  const norm = ccNormalizeSigilText(text);
  if (!norm) return null;
  for (let i = 0; i < rows.length; i++) {
    if (ccNormalizeSigilText(rows[i].text) === norm) return rows[i];
  }
  return null;
}

/** Save or touch a sigil. Returns the sigil object. */
function ccSaveSigil(text) {
  const clean = String(text || '').trim();
  const norm = ccNormalizeSigilText(clean);
  if (!norm) return null;

  const existing = ccFindSigilIn(ccReadAll(CC.TABS.SIGILS), norm);
  if (existing) {
    ccTouchSigil(existing._rowNumber);
    return existing;
  }

  const sigil = {
    id: Utilities.getUuid(),
    text: clean,
    glyph: ccSigil(clean),
    createdAt: new Date(),
    useCount: 1,
    archived: false
  };
  ccAppendNamed(CC.TABS.SIGILS, sigil);
  return sigil;
}

function ccListSigils(includeArchived) {
  return ccFilterSigils(ccReadAll(CC.TABS.SIGILS), !!includeArchived);
}

function ccFindSigilById(id) {
  const rows = ccReadAll(CC.TABS.SIGILS);
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].id === id) return rows[i];
  }
  return null;
}

function ccTouchSigil(rowNumber) {
  const ss = ccGetOrCreateSheet();
  const sheet = ss.getSheetByName(CC.TABS.SIGILS);
  if (!sheet) return;
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const col = headers.indexOf('useCount');
  if (col === -1) return;
  const cell = sheet.getRange(rowNumber, col + 1);
  const current = Number(cell.getValue()) || 0;
  cell.setValue(current + 1);
}

function ccArchiveSigil(id) {
  const sigil = ccFindSigilById(id);
  if (!sigil) return false;
  const ss = ccGetOrCreateSheet();
  const sheet = ss.getSheetByName(CC.TABS.SIGILS);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const col = headers.indexOf('archived');
  if (col === -1) return false;
  sheet.getRange(sigil._rowNumber, col + 1).setValue(true);
  return true;
}