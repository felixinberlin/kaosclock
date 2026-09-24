/**
 * Per-user settings + ephemeral state, via PropertiesService.
 */
const CC_PROP_KEYS = {
  SETTINGS: 'cc.settings',
  PENDING:  'cc.pending',
  SHEET_ID: 'cc.sheetId'
};

const CC_DEFAULT_SETTINGS = {
  chaos: CC.DEFAULTS.chaos,
  flags: Object.assign({}, CC.CHAOS_FLAGS),
  showMarkers: false
};

function ccGetSettings() {
  const raw = PropertiesService.getUserProperties().getProperty(CC_PROP_KEYS.SETTINGS);
  if (!raw) return Object.assign({}, CC_DEFAULT_SETTINGS);
  try {
    const parsed = JSON.parse(raw);
    return Object.assign({}, CC_DEFAULT_SETTINGS, parsed, {
      flags: Object.assign({}, CC_DEFAULT_SETTINGS.flags, parsed.flags || {})
    });
  } catch (err) {
    ccWarn('settings parse failed', { err: String(err) });
    return Object.assign({}, CC_DEFAULT_SETTINGS);
  }
}

function ccSaveSettings(settings) {
  PropertiesService.getUserProperties()
    .setProperty(CC_PROP_KEYS.SETTINGS, JSON.stringify(settings));
}

function ccGetPending() {
  const raw = PropertiesService.getUserProperties().getProperty(CC_PROP_KEYS.PENDING);
  return raw ? JSON.parse(raw) : null;
}

function ccSetPending(pending) {
  PropertiesService.getUserProperties()
    .setProperty(CC_PROP_KEYS.PENDING, JSON.stringify(pending));
}

function ccClearPending() {
  PropertiesService.getUserProperties().deleteProperty(CC_PROP_KEYS.PENDING);
}

function ccGetSheetId() {
  return PropertiesService.getUserProperties().getProperty(CC_PROP_KEYS.SHEET_ID);
}

function ccSetSheetId(id) {
  PropertiesService.getUserProperties().setProperty(CC_PROP_KEYS.SHEET_ID, id);
}
