function ccBuildLogCard(sessionId, message) {
  const card = CardService.newCardBuilder();
  card.setHeader(CardService.newCardHeader().setTitle('Log session'));

  if (message) {
    card.addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph().setText(message)));
  }

  const s = CardService.newCardSection();
  s.addWidget(ccDropdownPairs('flow', 'Flow', ['1','2','3','4','5'],
    ['1 - stuck', '2 - rough', '3 - okay', '4 - good', '5 - flow'], '3'));
  s.addWidget(CardService.newTextInput()
    .setFieldName('note')
    .setTitle('Note')
    .setMultiline(true)
    .setHint('What happened?'));
  card.addSection(s);

  const actions = CardService.newCardSection();
  actions.addWidget(CardService.newTextButton()
    .setText('Save')
    .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
    .setOnClickAction(CardService.newAction()
      .setFunctionName('onSaveLog')
      .setParameters({ sessionId: sessionId })));
  actions.addWidget(CardService.newTextButton()
    .setText('Skip')
    .setOnClickAction(CardService.newAction().setFunctionName('onHome')));
  card.addSection(actions);

  return card.build();
}
