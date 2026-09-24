function ccBuildResultCard(roll, sessionId, eventId, eventStart, eventEnd, extraNote) {
  const card = CardService.newCardBuilder();
  card.setHeader(CardService.newCardHeader()
    .setTitle('Rolled: ' + roll.modeName)
    .setSubtitle(roll.duration + ' min'));

  const body = CardService.newCardSection();
  body.addWidget(CardService.newTextParagraph()
    .setText('<b>' + roll.sigil + '</b>'));
  body.addWidget(CardService.newTextParagraph()
    .setText(ccFmtRange(eventStart, eventEnd)));
  if (roll.driftMin) {
    body.addWidget(CardService.newTextParagraph()
      .setText('Drifted ' + (roll.driftMin > 0 ? '+' : '') + roll.driftMin + ' min'));
  }
  if (extraNote) {
    body.addWidget(CardService.newTextParagraph().setText(extraNote));
  }
  card.addSection(body);

  const actions = CardService.newCardSection();
  actions.addWidget(CardService.newTextButton()
    .setText('Log session')
    .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
    .setOnClickAction(CardService.newAction()
      .setFunctionName('onOpenLog')
      .setParameters({ sessionId: sessionId })));
  actions.addWidget(CardService.newTextButton()
    .setText('Reroll')
    .setOnClickAction(CardService.newAction()
      .setFunctionName('onReroll')
      .setParameters({ sessionId: sessionId, eventId: eventId })));
  actions.addWidget(CardService.newTextButton()
    .setText('Home')
    .setOnClickAction(CardService.newAction().setFunctionName('onHome')));
  card.addSection(actions);

  return card.build();
}

function ccFmtRange(start, end) {
  const tz = Session.getScriptTimeZone();
  return Utilities.formatDate(start, tz, 'EEE HH:mm') + ' -> ' +
         Utilities.formatDate(end, tz, 'HH:mm');
}
