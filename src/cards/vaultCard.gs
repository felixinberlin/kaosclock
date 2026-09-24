function ccBuildVaultCard(message) {
  const card = CardService.newCardBuilder();
  card.setHeader(CardService.newCardHeader()
    .setTitle('Sigil Vault')
    .setSubtitle('Reuse an intention'));

  if (message) {
    card.addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph().setText(message)));
  }

  const sigils = ccListSigils(false).slice(0, CC.DEFAULTS.vaultLimit);
  const body = CardService.newCardSection();

  if (sigils.length === 0) {
    body.addWidget(CardService.newTextParagraph()
      .setText('Empty. Roll something and it lands here.'));
  } else {
    for (let i = 0; i < sigils.length; i++) {
      const s = sigils[i];
      const uses = Number(s.useCount) || 0;
      body.addWidget(CardService.newTextParagraph()
        .setText('<b>' + s.glyph + '</b>  ' + ccEscape(s.text) +
                 (uses > 1 ? '  <i>(' + uses + 'x)</i>' : '')));
      body.addWidget(CardService.newButtonSet()
        .addButton(CardService.newTextButton()
          .setText('Use')
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
          .setOnClickAction(CardService.newAction()
            .setFunctionName('onUseSigil')
            .setParameters({ sigilId: s.id })))
        .addButton(CardService.newTextButton()
          .setText('Archive')
          .setOnClickAction(CardService.newAction()
            .setFunctionName('onArchiveSigil')
            .setParameters({ sigilId: s.id }))));
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

/** Minimal HTML escape for CardService text. */
function ccEscape(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}