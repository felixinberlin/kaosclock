function installTriggers() {
  const existing = ScriptApp.getProjectTriggers();
  for (let i = 0; i < existing.length; i++) ScriptApp.deleteTrigger(existing[i]);

  ScriptApp.newTrigger('dailyChaos').timeBased().everyDays(1).atHour(5).create();
  ScriptApp.newTrigger('weeklyConfession').timeBased().onWeekDay(ScriptApp.WeekDay.SUNDAY).atHour(20).create();
  ccInfo('triggers installed');
}

function uninstallTriggers() {
  const existing = ScriptApp.getProjectTriggers();
  for (let i = 0; i < existing.length; i++) ScriptApp.deleteTrigger(existing[i]);
  ccInfo('triggers removed');
}

function dailyChaos() {
  const settings = ccGetSettings();
  const now = new Date();
  const sessions = ccRecentSessions(200);

  if (settings.flags.resurface) ccRunResurface(sessions, now, settings);
  if (settings.flags.wandering) ccRunWander(sessions, now, settings);
  if (settings.flags.prophecy) ccRunProphecy(settings, now);
}

function ccRunProphecy(settings, now) {
  const plan = ccPlanProphecy(settings, now, ccRng);
  if (!plan) return;
  const ev = ccCreateEvent(plan);
  ccAppendRow(CC.TABS.CHAOS, [now, 'prophecy', ev.getId(), settings.chaos, plan.title]);
}

function weeklyConfession() {
  const settings = ccGetSettings();
  if (!settings.flags.confession) return;
  const now = new Date();
  const sessions = ccRecentSessions(200);
  const text = ccBuildConfession(sessions, now);
  ccAppendRow(CC.TABS.CHAOS, [now, 'confession', '', settings.chaos, text]);
  ccInfo('confession written', { text: text });
}

function ccRunResurface(sessions, now, settings) {
  const rng = ccRng;
  const pick = ccPickResurfaceCandidate(sessions, now, settings, rng);
  if (!pick) return;

  const dayOffset = ccRandInt(1, 3, rng);
  const hour = ccRandInt(9, 20, rng);
  const start = new Date(now.getTime() + dayOffset * 86400000);
  start.setHours(hour, 0, 0, 0);
  const end = new Date(start.getTime() + (Number(pick.duration) || 15) * 60000);

  const mode = ccMode(pick.mode) || ccMode('banish');
  const title = '[' + mode.name + '] ' + pick.intent + ' (resurface)';
  const ev = ccCreateEvent({
    title: title,
    start: start,
    end: end,
    description: 'Resurfaced because it vibed. Sigil: ' + ccSigil(pick.intent)
  });

  ccAppendRow(CC.TABS.SESSIONS, [
    Utilities.getUuid(), new Date(), pick.intent, mode.id, pick.duration,
    '', '', settings.chaos, ev.getId(), false, '', '[resurfaced]', '', 0, 0
  ]);
  ccAppendRow(CC.TABS.CHAOS, [now, 'resurface', ev.getId(), settings.chaos, pick.intent]);
}

function ccRunWander(sessions, now, settings) {
  const rng = ccRng;
  for (let i = 0; i < sessions.length; i++) {
    const s = sessions[i];
    if (!s.eventId) continue;
    if (s.completed) continue;
    const plan = ccPlanWander(s, now, rng);
    if (!plan) continue;
    if (ccMoveEvent(s.eventId, plan.newStart, plan.newEnd)) {
      const wanderCount = (Number(s.wanderCount) || 0) + 1;
      ccUpdateSessionRow(s._rowNumber, { wanderCount: wanderCount });
      ccAppendRow(CC.TABS.CHAOS, [now, 'wander', s.eventId, settings.chaos,
        'moved to ' + plan.newStart.toISOString()]);
    }
  }
}
