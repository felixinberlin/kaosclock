# Chaos Clock

A Google Calendar add-on that rolls a focus mode, a duration, and a time slot from your state and intent. Then it creates a real calendar event, and occasionally rearranges your calendar according to vibes.

Chaos magick, minus the incense.

## What it does

- **Roll**: intent + energy + focus + time + chaos → mode, duration, sigil
- **Schedule**: Now / Soon / Next free slot (7-day horizon, 9am–8pm)
- **Event**: creates a calendar event titled `[Gnosis] Finish landing page copy`
- **Log**: after the session, rate flow 1–5, save a note
- **Chaos events**: time drift, phantom slots, resurface, wandering, reluctant servitor, past tense, poltergeist, prophecy, trickster, anti-calendar day, confession log
- **Vault**: every intent is hashed into a sigil and saved for reuse
- **Insights**: plain-language patterns after 7+ sessions

## Status

v0.5.0 — Sigil Vault UI shipped. 38 tests passing.

See [CONTEXT.md](CONTEXT.md) for current state, architecture, and next steps.

## Docs

- [docs/install.md](docs/install.md) — how to install locally
- [docs/architecture.md](docs/architecture.md) — how the code is structured
- [CONTEXT.md](CONTEXT.md) — where development stands right now

## Install (quick)

```bash
git clone git@github.com:felixinberlin/kaosclock.git
cd kaosclock
npm install
npm test

npx clasp login
npx clasp create --type standalone --title "Chaos Clock"
cp .clasp.json.example .clasp.json
# paste the scriptId printed by clasp into .clasp.json
npx clasp push
npx clasp open
In the Apps Script editor:

Run installTriggers once (authorize when prompted)

Run ccMigrateSigilsTab once (adds the useCount column to existing Sheets)

Deploy → Test deployments → Install

Open Google Calendar → sidebar → Chaos Clock

Repo layout
text
chaos-clock/
├── appsscript.json         # Google add-on manifest + OAuth scopes
├── package.json            # jest + clasp
├── src/
│   ├── config.gs           # all tunables (modes, chaos bands, flags)
│   ├── main.gs             # entry points + card handlers
│   ├── triggers.gs         # daily/weekly autonomous chaos
│   ├── utils/              # rng, logger
│   ├── store/              # props, sheets, calendar, sigil persistence
│   ├── engine/             # pure logic: roll, chaos events, insights, slots
│   └── cards/              # CardService UI builders
├── tests/                  # jest, mocks Apps Script globals
└── docs/
License
MIT