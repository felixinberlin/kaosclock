function ccBuildInsightsCard() {
  const sessions = ccRecentSessions(200);
  const insights = ccComputeInsights(sessions, new Date(), ccUserTz());

  const card = CardService.newCardBuilder();
  card.setHeader(CardService.newCardHeader()
    .setTitle('Insights')
    .setSubtitle(sessions.length + ' sessions'));

  const body = CardService.newCardSection();
  if (insights.length === 0) {
    body.addWidget(CardService.newTextParagraph().setText('Nothing yet. Keep rolling.'));
  } else {
    for (let i = 0; i < insights.length; i++) {
      body.addWidget(CardService.newTextParagraph()
        .setText('• ' + insights[i].message));
    }
  }
  card.addSection(body);

  const actions = CardService.newCardSection();
  actions.addWidget(CardService.newTextButton()
    .setText('Home')
    .setOnClickAction(CardService.newAction().setFunctionName('onHome')));
  card.addSection(actions);

  return card.build();
}