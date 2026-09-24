/**
 * Home card — the main sidebar UI.
 * Contains inputs, Roll button, and navigation to Vault/Insights/Settings.
 */

function ccBuildHomeCard(message, prefillIntent) {
  const settings = ccGetSettings();
  const card = CardService.newCardBuilder();

  card.setHeader(CardService.newCardHeader()
    .setTitle('Chaos Clock')
    .setSubtitle('Roll the dice.'));

  if (message) {
    card.addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph().setText(message)));
  }

  // ---------- Intent ----------
  const input = CardService.newCardSection().setHeader('Intent');
  const intentInput = CardService.newTextInput()
    .setFieldName('intent')
    .setTitle('What are you doing?')
    .setHint('One sentence.');
  if (prefillIntent) intentInput.setValue(prefillIntent);
  input.addWidget(intentInput);
  card.addSection(input);

  // ---------- State ----------
  const state = CardService.newCardSection().setHeader('State');
  state.addWidget(ccDropdown('energy', 'Energy', ['1','2','3','4','5'], String(CC.DEFAULTS.energy)));
  state.addWidget(ccDropdown('focus', 'Focus', ['1','2','3','4','5'], String(CC.DEFAULTS.focus)));
  state.addWidget(ccDropdown('time', 'Minutes available', ['15','30','45','60','90','120'], String(CC.DEFAULTS.time)));

  const chaosItems = CC.CHAOS_BANDS.map(function (b) { return b.value; });
  const chaosLabels = CC.CHAOS_BANDS.map(function (b) { return b.label + ' (' + b.hint + ')'; });
  state.addWidget(ccDropdownPairs('chaos', 'Chaos factor', chaosItems, chaosLabels, String(settings.chaos)));

  state.addWidget(ccDropdownPairs('schedule', 'Schedule',
    ['now', 'soon', 'week'],
    ['Now', 'Soon (next 2h)', 'Next free slot (7 days)'],
    CC.SCHEDULE_DEFAULT));

  card.addSection(state);

  // ---------- Actions ----------
  const actions = CardService.newCardSection();
  actions.addWidget(CardService.newTextButton()
    .setText('Roll Chaos')
    .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
    .setOnClickAction(CardService.newAction().setFunctionName('onRoll')));

  actions.addWidget(CardService.newTextButton()
    .setText('Vault')
    .setOnClickAction(CardService.newAction().setFunctionName('onOpenVault')));

  actions.addWidget(CardService.newTextButton()
    .setText('Insights')
    .setOnClickAction(CardService.newAction().setFunctionName('onOpenInsights')));

  actions.addWidget(CardService.newTextButton()
    .setText('Settings')
    .setOnClickAction(CardService.newAction().setFunctionName('onOpenSettings')));

  card.addSection(actions);

  return card.build();
}

/**
 * Shown on the last day of each month when Anti-Calendar Day is enabled.
 * No inputs, no roll button. Just a message.
 */
function ccBuildAntiCalendarCard() {
  const card = CardService.newCardBuilder();
  card.setHeader(CardService.newCardHeader()
    .setTitle('Chaos Clock')
    .setSubtitle('Today is not a day for clocks.'));

  card.addSection(CardService.newCardSection()
    .addWidget(CardService.newTextParagraph()
      .setText('No rolls today. The calendar rests.\n\nCome back tomorrow.')));

  return card.build();
}

/* ---------- UI builders ---------- */

function ccDropdown(field, title, values, selected) {
  const sel = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setFieldName(field)
    .setTitle(title);
  for (let i = 0; i < values.length; i++) {
    sel.addItem(String(values[i]), String(values[i]), String(values[i]) === String(selected));
  }
  return sel;
}

function ccDropdownPairs(field, title, values, labels, selected) {
  const sel = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setFieldName(field)
    .setTitle(title);
  for (let i = 0; i < values.length; i++) {
    sel.addItem(String(labels[i]), String(values[i]), String(values[i]) === String(selected));
  }
  return sel;
}