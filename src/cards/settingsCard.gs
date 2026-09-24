function ccBuildSettingsCard(savedMessage) {
  const settings = ccGetSettings();
  const card = CardService.newCardBuilder();
  card.setHeader(CardService.newCardHeader().setTitle('Chaos Clock settings'));

  if (savedMessage) {
    card.addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph().setText(savedMessage)));
  }

  const flags = CardService.newCardSection().setHeader('Chaos events');
  const flagOrder = [
    ['timeDrift', 'Time Drift', 'Jitter event start'],
    ['phantomSlots', 'Phantom Slots', 'Untitled 15-min event'],
    ['resurface', 'Resurface', 'Re-drop high-flow intentions'],
    ['wandering', 'Wandering', 'Low-flow tasks drift forward daily'],
    ['reluctantServitor', 'Reluctant Servitor', 'Passive-aggressive nudges'],
    ['pastTense', 'Past Tense', 'Schedule things in the past'],
    ['poltergeist', 'Poltergeist', 'Echo completed events next week'],
    ['prophecy', 'Prophecy', 'Locked future event, vague title'],
    ['trickster', 'Trickster', '5% chance of a mystery roll'],
    ['antiCalendarDay', 'Anti-Calendar Day', 'One day/month, no rolling'],
    ['confession', 'Confession Log', 'Weekly summary in the Sheet']
  ];

  for (let i = 0; i < flagOrder.length; i++) {
    const key = flagOrder[i][0];
    const label = flagOrder[i][1];
    const hint = flagOrder[i][2];
    flags.addWidget(CardService.newSelectionInput()
      .setType(CardService.SelectionInputType.SWITCH)
      .setFieldName('flag_' + key)
      .setTitle(label + ' - ' + hint)
      .addItem('On', 'on', !!settings.flags[key])
      .addItem('Off', 'off', !settings.flags[key]));
  }
  card.addSection(flags);

  const actions = CardService.newCardSection();
  actions.addWidget(CardService.newTextButton()
    .setText('Save')
    .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
    .setOnClickAction(CardService.newAction().setFunctionName('onSaveSettings')));
  actions.addWidget(CardService.newTextButton()
    .setText('Home')
    .setOnClickAction(CardService.newAction().setFunctionName('onHome')));
  card.addSection(actions);

  return card.build();
}
