const CC = {
  VERSION: '0.5.0',
  SHEET_NAME: 'Chaos Clock Log',
  TABS: {
    SESSIONS: 'Sessions',
    SIGILS: 'Sigils',
    CHAOS: 'ChaosLog'
  },
  SESSION_HEADERS: [
    'id', 'rolledAt', 'intent', 'mode', 'duration',
    'energy', 'focus', 'chaos', 'eventId',
    'completed', 'flow', 'note', 'loggedAt', 'flowScore',
    'wanderCount'
  ],
  CHAOS_HEADERS: [
    'timestamp', 'action', 'targetEventId', 'chaosFactor', 'note'
  ],
  SIGIL_HEADERS: ['id', 'text', 'glyph', 'createdAt', 'useCount', 'archived'],
  MODES: [
    { id: 'banish',   name: 'Banish',   min: 2,  max: 5,  minEnergy: 1, minFocus: 1 },
    { id: 'ground',   name: 'Ground',   min: 5,  max: 20, minEnergy: 1, minFocus: 1 },
    { id: 'divinate', name: 'Divinate', min: 5,  max: 10, minEnergy: 1, minFocus: 1 },
    { id: 'manifest', name: 'Manifest', min: 5,  max: 15, minEnergy: 2, minFocus: 2 },
    { id: 'sigilize', name: 'Sigilize', min: 15, max: 25, minEnergy: 2, minFocus: 2 },
    { id: 'gnosis',   name: 'Gnosis',   min: 30, max: 60, minEnergy: 3, minFocus: 3 }
  ],
  CHAOS_BANDS: [
    { id: 'zen',      label: 'Zen',       value: 0,   hint: 'deterministic, no tricks' },
    { id: 'calm',     label: 'Calm',      value: 25,  hint: 'mild drift' },
    { id: 'playful',  label: 'Playful',   value: 50,  hint: 'phantom slots, resurface' },
    { id: 'wild',     label: 'Wild',      value: 75,  hint: 'wandering, past tense' },
    { id: 'unhinged', label: 'Unhinged',  value: 100, hint: 'trickster, prophecy, poltergeist' }
  ],
  DEFAULTS: {
    chaos: 25,
    energy: 3,
    focus: 3,
    time: 60,
    schedule: 'week',
    vaultLimit: 10
  },
  CHAOS_FLAGS: {
    timeDrift:         true,
    phantomSlots:      false,
    resurface:         true,
    wandering:         false,
    reluctantServitor: true,
    pastTense:         true,
    poltergeist:       false,
    prophecy:          false,
    trickster:         true,
    antiCalendarDay:   true,
    confession:        true
  },
  DRIFT_MAX_MIN: 20,
  PHANTOM_MIN_CHAOS: 60,
  RESURFACE_MIN_FLOW: 4,
  RESURFACE_MIN_AGE_DAYS: 3,
  WANDER_MAX_COUNT: 7,
  WANDER_MIN_FLOW: 2,
  RELUCTANT_THRESHOLD: 3,
  PAST_TENSE_MIN_CHAOS: 60,
  POLTERGEIST_MIN_CHAOS: 80,
  POLTERGEIST_CHANCE: 0.3,
  TRICKSTER_CHANCE: 0.05,
  TRICKSTER_MIN_CHAOS: 50,
  PROPHECY_HORIZON_DAYS: 5,
  INSIGHTS_MIN_SESSIONS: 7,
  SLOT_HORIZON_DAYS: 7,
  SLOT_WORKING_START: 9,
  SLOT_WORKING_END: 20,
  SLOT_GRACE_MIN: 5,
  SLOT_MIN_GAP_MIN: 5,
  SCHEDULE_DEFAULT: 'week'
};

function ccMode(id) {
  for (let i = 0; i < CC.MODES.length; i++) {
    if (CC.MODES[i].id === id) return CC.MODES[i];
  }
  return null;
}