# Chaos Clock

A Google Calendar add-on that rolls a focus mode, a duration, and a time slot from your state and intent. Then it creates a real calendar event, and occasionally rearranges your calendar according to vibes.

Chaos magick, minus the incense.

## What it does

- **Roll**: intent + energy + focus + time + chaos → mode, duration, sigil
- **Schedule**: Now / Soon / Next free slot (7-day horizon, 9am–8pm in your calendar's time zone)
- **Event**: creates a calendar event titled `[Gnosis] Finish landing page copy`
- **Log**: after the session, rate flow 1–5, save a note
- **Chaos events**: time drift, phantom slots, resurface, wandering, reluctant servitor, past tense, poltergeist, prophecy, trickster, anti-calendar day, confession log
- **Vault**: every intent is hashed into a sigil and saved for reuse
- **Insights**: plain-language patterns after 7+ sessions

## What it promises, exactly

- **Randomness.** Rolls use `Math.random`. At chaos 0 the roll is fully deterministic: the best mode for your state, the middle of its duration range, no drift, no tricks in the roll. The daily events (resurface, wandering, prophecy) follow their own toggles in Settings, not the chaos dial. Above 0 the same inputs can give different results. The sigil is always the same for the same intent.
- **Prophecy** is an ordinary calendar event with a vague title. Nothing locks it; you can edit or delete it any time.
- **Time zone.** Working hours, "the last day of the month", prophecy and resurface times use your default calendar's time zone, not the script's.
- **Data.** Settings live in per-user properties, history in a Sheet named "Chaos Clock Log" in your own Drive, events in your default calendar. The add-on makes no outside network calls and does not request the permission to do so.

## Status

v0.5.1 — time-zone fix, fewer permissions, CC0. 47 tests passing.

See [src/store/context.md](src/store/context.md) for current state, architecture, and next steps.

## Docs

- [docs/install.md](docs/install.md) — how to install locally
- [docs/architecture.md](docs/architecture.md) — how the code is structured
- [src/store/context.md](src/store/context.md) — where development stands right now

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
```

In the Apps Script editor:

1. Run `installTriggers` once (authorize when prompted). If you installed an earlier version, run it again so the triggers use your time zone.
2. Run `ccMigrateSigilsTab` once (adds the `useCount` column to existing Sheets).
3. Deploy → Test deployments → Install.
4. Open Google Calendar → sidebar → Chaos Clock.

There is no Workspace Marketplace listing yet; installing means a test deployment.

## Repo layout

```text
chaos-clock/
├── appsscript.json         # Google add-on manifest + OAuth scopes
├── package.json            # jest + clasp
├── src/
│   ├── config.gs           # all tunables (modes, chaos bands, flags)
│   ├── main.gs             # entry points + card handlers
│   ├── triggers.gs         # daily/weekly autonomous chaos
│   ├── utils/              # rng, time zone, logger
│   ├── store/              # props, sheets, calendar, sigil persistence
│   ├── engine/             # pure logic: roll, chaos events, insights, slots
│   └── cards/              # CardService UI builders
├── tests/                  # jest, mocks Apps Script globals
└── docs/
```

## License

CC0 1.0 Universal — see [LICENSE](LICENSE). No attribution required.
