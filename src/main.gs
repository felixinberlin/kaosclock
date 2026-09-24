function onHomepage(e) {
  const settings = ccGetSettings();
  if (ccIsAntiCalendarDay(new Date(), settings, ccUserTz())) {
    return ccBuildAntiCalendarCard();
  }
  return ccBuildHomeCard();
}

function onCalendarEventOpen(e) { return onHomepage(e); }
function onHome(e) { return ccRespondWithCard(ccBuildHomeCard()); }
function onOpenInsights(e) { return ccRespondWithCard(ccBuildInsightsCard()); }

function onRoll(e) {
  const settings = ccGetSettings();

  // Anti-Calendar Day blocks rolling
  if (ccIsAntiCalendarDay(new Date(), settings, ccUserTz())) {
    return ccRespondWithCard(ccBuildAntiCalendarCard());
  }

  const input = {
    intent: e.formInput.intent,
    energy: Number(e.formInput.energy),
    focus: Number(e.formInput.focus),
    timeAvailable: Number(e.formInput.time),
    chaos: Number(e.formInput.chaos),
    schedule: e.formInput.schedule || CC.SCHEDULE_DEFAULT
  };

  settings.chaos = input.chaos;
  ccSaveSettings(settings);

  // Trickster Roll
  if (ccRollTrickster(input.chaos, settings, ccRng)) {
    const now = new Date();
    const start = new Date(now.getTime() + 5 * 60000);
    const end = new Date(start.getTime() + 20 * 60000);
    const title = '[???] Something else entirely';
    const sessionId = Utilities.getUuid();
    const ev = ccCreateEvent({
      title: title, start: start, end: end,
      description: 'A trickster rolled this. Fill it, delete it, or ignore it. Session ' + sessionId
    });
    ccAppendRow(CC.TABS.SESSIONS, [
      sessionId, now, input.intent, 'trickster', 20,
      input.energy, input.focus, input.chaos, ev.getId(),
      false, '', '[trickster]', '', 0, 0
    ]);
    ccAppendRow(CC.TABS.CHAOS, [now, 'trickster', ev.getId(), input.chaos, input.intent]);
    const fakeRoll = {
      mode: 'trickster', modeName: '???', duration: 20,
      sigil: ccSigil(input.intent), driftMin: 0, phantom: false
    };
    return ccRespondWithCard(
      ccBuildResultCard(fakeRoll, sessionId, ev.getId(), start, end,
        'The trickster took your roll. You decide what this means.')
    );
  }

  // Normal roll
  const roll = ccRoll(input, ccRng);
  const now = new Date();

  // Past Tense overrides timing entirely
  const busy = ccBusyIntervals(
    now,
    new Date(now.getTime() + CC.SLOT_HORIZON_DAYS * 86400000)
  );
  const slot = ccPlanSlotForRoll({
    now: now,
    durationMin: roll.duration,
    schedule: input.schedule,
    driftMin: roll.driftMin || 0,
    busy: busy,
    tz: ccUserTz()
  });
  let start = slot.start;
  let end = slot.end;
  let title = '[' + roll.modeName + '] ' + (input.intent || 'Untitled');
  let pastTenseNote = null;

  const pt = ccPlanPastTense(roll.modeName, input.intent || 'Untitled', input.chaos, now, ccRng);
  if (pt) {
    title = pt.title;
    start = pt.start;
    end = pt.end;
    pastTenseNote = 'Scheduled in the past. Do it now and edit forward if you want.';
  }

  const sessionId = Utilities.getUuid();
  const description =
    'Sigil: ' + roll.sigil + '\n' +
    'Intent: ' + (input.intent || '') + '\n' +
    'Chaos: ' + input.chaos + '\n' +
    'Session: ' + sessionId;

  const ev = ccCreateEvent({ title: title, start: start, end: end, description: description });

  ccAppendRow(CC.TABS.SESSIONS, [
    sessionId, now, input.intent, roll.mode, roll.duration,
    input.energy, input.focus, input.chaos, ev.getId(),
    false, '', '', '', 0, 0
  ]);

  // Phantom slot
  let phantomNote = null;
  if (roll.phantom) {
    const pStart = new Date(now.getTime() + (roll.duration + 30) * 60000);
    const pEnd = new Date(pStart.getTime() + 15 * 60000);
    ccCreateEvent({
      title: '[' + roll.sigil + ']', start: pStart, end: pEnd,
      description: 'A phantom slot. Fill it or let it vanish.'
    });
    ccAppendRow(CC.TABS.CHAOS, [now, 'phantomSlot', ev.getId(), input.chaos, roll.sigil]);
    phantomNote = 'Phantom slot at ' + Utilities.formatDate(pStart, ccUserTz(), 'HH:mm') + '.';
  }

  // Reluctant servitor
  let nagNote = null;
  if (ccShouldNag(ccRecentSessions(10), roll.mode, settings)) {
    nagNote = ccNagText(roll.mode);
    ccAppendRow(CC.TABS.CHAOS, [now, 'nag:' + roll.mode, '', input.chaos, nagNote]);
  }

  const note = [pastTenseNote, phantomNote, nagNote].filter(Boolean).join(' ');
  return ccRespondWithCard(
    ccBuildResultCard(roll, sessionId, ev.getId(), start, end, note)
  );
}

function onOpenLog(e) {
  return ccRespondWithCard(ccBuildLogCard(e.parameters.sessionId, null));
}

function onSaveLog(e) {
  const sessionId = e.parameters.sessionId;
  const flow = Number(e.formInput.flow);
  const note = e.formInput.note || '';

  const session = ccFindSessionById(sessionId);
  if (!session) return ccRespondWithCard(ccBuildHomeCard('Session not found. Rolling again?'));

  ccUpdateSessionRow(session._rowNumber, {
    completed: true, flow: flow, note: note,
    loggedAt: new Date(), flowScore: flow
  });

  // Poltergeist check
  const settings = ccGetSettings();
  const ghost = ccPlanPoltergeist(
    { id: sessionId, rolledAt: session.rolledAt, intent: session.intent,
      mode: session.mode, duration: session.duration, completed: true },
    Number(session.chaos) || 0, ccRng, ccUserTz()
  );
  if (ghost) {
    ccCreateEvent(ghost);
    ccAppendRow(CC.TABS.CHAOS, [new Date(), 'poltergeist', '', session.chaos, session.intent]);
  }

  return ccRespondWithCard(ccBuildHomeCard('Logged. Flow ' + flow + '/5.'));
}

function onReroll(e) {
  const eventId = e.parameters.eventId;
  if (eventId) ccDeleteEvent(eventId);
  return ccRespondWithCard(ccBuildHomeCard('Rerolled.'));
}

function onOpenSettings(e) {
  return ccRespondWithCard(ccBuildSettingsCard(null));
}

function onSaveSettings(e) {
  const settings = ccGetSettings();
  const flagOrder = [
    'timeDrift', 'phantomSlots', 'resurface', 'wandering', 'reluctantServitor',
    'pastTense', 'poltergeist', 'prophecy', 'trickster', 'antiCalendarDay', 'confession'
  ];
  for (let i = 0; i < flagOrder.length; i++) {
    const key = flagOrder[i];
    const v = e.formInput['flag_' + key];
    if (v === 'on') settings.flags[key] = true;
    else if (v === 'off') settings.flags[key] = false;
  }
  ccSaveSettings(settings);
  return ccRespondWithCard(ccBuildSettingsCard('Saved.'));
}

function ccRespondWithCard(card) {
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(card))
    .build();
}

function ccRecentSessions(n) {
  const rows = ccReadAll(CC.TABS.SESSIONS);
  rows.sort(function (a, b) { return new Date(b.rolledAt) - new Date(a.rolledAt); });
  return rows.slice(0, n);
}