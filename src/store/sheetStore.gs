/**
 * Google Sheet as append-only log store.
 */
function ccGetOrCreateSheet() {
  const existingId = ccGetSheetId();
  if (existingId) {
    try {
      return SpreadsheetApp.openById(existingId);
    } catch (err) {
      ccWarn('sheet missing, recreating', { err: String(err) });
    }
  }
  const ss = SpreadsheetApp.create(CC.SHEET_NAME);
  ccSetSheetId(ss.getId());
  ccEnsureTabs(ss);
  return ss;
}

function ccEnsureTabs(ss) {
  ccEnsureTab(ss, CC.TABS.SESSIONS, CC.SESSION_HEADERS);
  ccEnsureTab(ss, CC.TABS.SIGILS, ['id', 'text', 'glyph', 'createdAt', 'archived']);
  ccEnsureTab(ss, CC.TABS.CHAOS, CC.CHAOS_HEADERS);
}

function ccEnsureTab(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function ccAppendRow(tabName, row) {
  const ss = ccGetOrCreateSheet();
  const sheet = ss.getSheetByName(tabName) || ccEnsureTab(ss, tabName, []);
  sheet.appendRow(row);
}

function ccReadAll(tabName) {
  const ss = ccGetOrCreateSheet();
  const sheet = ss.getSheetByName(tabName);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0];
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const obj = {};
    for (let j = 0; j < headers.length; j++) obj[headers[j]] = values[i][j];
    obj._rowNumber = i + 1;
    rows.push(obj);
  }
  return rows;
}

function ccUpdateSessionRow(rowNumber, patch) {
  const ss = ccGetOrCreateSheet();
  const sheet = ss.getSheetByName(CC.TABS.SESSIONS);
  if (!sheet) return;
  const headers = CC.SESSION_HEADERS;
  for (const key in patch) {
    const col = headers.indexOf(key);
    if (col === -1) continue;
    sheet.getRange(rowNumber, col + 1).setValue(patch[key]);
  }
}

function ccFindSessionById(id) {
  const rows = ccReadAll(CC.TABS.SESSIONS);
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].id === id) return rows[i];
  }
  return null;
}

/**
 * Append a row using an object keyed by header name.
 * Missing headers in the sheet are silently ignored — lets older sheets
 * keep working when config gains new columns.
 */
function ccAppendNamed(tabName, rowObj) {
  const ss = ccGetOrCreateSheet();
  const sheet = ss.getSheetByName(tabName);
  if (!sheet) return;
  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const row = headers.map(function (h) {
    return rowObj[h] != null ? rowObj[h] : '';
  });
  sheet.appendRow(row);
}

/**
 * One-shot migration: adds any missing columns from CC.SIGIL_HEADERS
 * to the Sigils tab. Run manually from the editor once after upgrading.
 */
function ccMigrateSigilsTab() {
  const ss = ccGetOrCreateSheet();
  const sheet = ss.getSheetByName(CC.TABS.SIGILS);
  if (!sheet) return;
  const lastCol = sheet.getLastColumn();
  const existing = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const missing = CC.SIGIL_HEADERS.filter(function (h) {
    return existing.indexOf(h) === -1;
  });
  if (missing.length > 0) {
    sheet.getRange(1, lastCol + 1, 1, missing.length).setValues([missing]);
    ccInfo('sigils tab migrated', { added: missing });
  } else {
    ccInfo('sigils tab already up to date');
  }
}