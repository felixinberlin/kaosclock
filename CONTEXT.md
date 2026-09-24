# Chaos Clock — Development Context

Handoff document. Read this first when resuming work.

**Last updated:** v0.5.2

---

## Summary

Chaos Clock is a Google Calendar add-on built as an Apps Script project. It rolls
a focus mode + duration + time slot from the user's state and intent, creates a
real calendar event at the next free slot, and includes a set of autonomous
"chaos events" that rearrange the calendar based on a 0–100 chaos factor. Users
log flow after each session. History lives in a Google Sheet in the user's own
Drive. No backend, no AI, no telemetry, no network calls.

---

## Current state

| Item | Value |
|---|---|
| Version | 0.5.2 |
| Tests | 47 passing (`npm test`) |
| License | CC0-1.0 |
| Platform | Google Workspace Add-on (Apps Script, V8) |
| Repo | https://github.com/felixinberlin/kaosclock |
| Owner account | felixinberlin@googlemail.com |
| OAuth scopes | calendar.events, calendar.readonly, spreadsheets, script.scriptapp |
| Sheet tab name | "Chaos Clock Log" (auto-created in the user's Drive) |

### What works

- Roll engine (6 modes, chaos-shaped weighted pick, fully deterministic at chaos=0)
- Free-slot finder (Now / Soon / 7-day horizon, 9–20h user-local, 5-min buffers)
- Calendar event creation with title formatting and description
- Post-session logging with flow rating
- Sheet-backed history (Sessions, Sigils, ChaosLog tabs)
- Sigil Vault (auto-save on roll, dedup by normalized text, use count, archive)
- Insights card (cold-start, per-mode skip/flow, best hour, chaos correlation)
- Settings card with 11 individual chaos toggles
- Daily trigger (`dailyChaos`) + weekly trigger (`weeklyConfession`)
- All wall-clock logic in the user's calendar time zone (`src/utils/tz.gs`)

### Known follow-ups

- Add-on icon uses a Google-hosted placeholder URL
- No onboarding card on first install
- No `CHANGELOG.md` entry for pre-0.5.0 versions beyond the current file
- `installTriggers` must be re-run after any time-zone change

---

## Architecture
Google Calendar sidebar
│
▼
main.gs ────────── cards/.gs (CardService UI)
│
├──► engine/.gs ← pure logic, unit tested
│ rollEngine · roll + sigil
│ chaosEvents · Tier 1/2/3 planners
│ insights · pattern computation
│ slotFinder · free-slot search
│
├──► store/.gs ← I/O wrappers
│ propsStore · user settings (PropertiesService)
│ sheetStore · append/read/update rows
│ calendarStore · create/move/delete events
│ sigilStore · vault persistence + dedup
│
├──► utils/.gs ← rng, time zone, logger
│
└──► triggers.gs ← time-based autonomous chaos
dailyChaos · resurface, wander, prophecy
weeklyConfession

text

**Rule:** `engine/` must never call `CalendarApp`, `SpreadsheetApp`, or
`PropertiesService`. All I/O lives in `store/` or `main.gs`.

---

## Data model

### Sheet: Sessions

`id · rolledAt · intent · mode · duration · energy · focus · chaos · eventId ·
completed · flow · note · loggedAt · flowScore · wanderCount`

### Sheet: Sigils

`id · text · glyph · createdAt · useCount · archived`

### Sheet: ChaosLog

`timestamp · action · targetEventId · chaosFactor · note`

`action` values: `phantomSlot`, `resurface`, `wander`, `nag:<mode>`, `trickster`,
`poltergeist`, `prophecy`, `confession`

---

## Chaos math

Weighted pick with temperature: `w_i^(1/T)`, `T = 1 + chaos/100 * 5`.

- chaos = 0 → **argmax** + midpoint duration (fully deterministic, no dice)
- chaos > 0 → weighted sample, lerped toward uniform as chaos rises

Time Drift: `driftMin = round((rng*2 - 1) * (chaos/100) * DRIFT_MAX_MIN)` with
`DRIFT_MAX_MIN = 20`.

---

## Tests

```bash
npm test          # runs jest with TZ=UTC
Tests load all src/**/*.gs into a vm sandbox with mocked Apps Script
globals (tests/setup.js, tests/mocks/appsScript.js). Add a mock when you
touch a new global.

The tz suite (tests/tz.test.js) exercises DST transitions and is expected to
pass under any host TZ.

Deploy
bash
npx clasp push
Then F5 in the Apps Script editor. The function dropdown does not auto-refresh.

After any scope change in appsscript.json, re-run installTriggers to trigger
the consent flow again.

After any time-zone change, re-run installTriggers so triggers use the new zone.

Design principles
Pure engine, impure shell. Logic in engine/ takes all inputs explicitly.

User owns their data. No backend, no accounts, no telemetry. Everything in the user's Google account.

Settings live in Properties. History lives in Sheets. Don't mix.

RNG is injectable. Every engine function takes rng as an optional argument.

The calendar event is the timer. Don't build a timer.

Tone rule. Every chaos feature must pass: if you describe it to a friend, they laugh, then immediately want it. Chaos is playful, not hostile.

Every chaos behavior is individually toggleable. Defaults are safe; opt-in is available.

Wall-clock means user wall-clock. Any hour-of-day logic goes through ccTzAtHour, never Date#setHours.

Common pitfalls
clasp push doesn't refresh the editor — F5 after every push.

Missing scope → "script does not have permission". Add it, push, re-run any function.

Sheet schema drift → use ccAppendNamed(tab, obj) when adding a column.

Tests must run with TZ=UTC (set in package.json).

CardService is not HTML — no CSS, no animations, no SVG. Emoji only.

Date#setHours uses the script's tz, not the user's. Use ccTz* helpers.

Environment
Developed on WSL, user felix

Node 18+

npx clasp (not globally installed)

Editor language: Spanish (Ejecutar, Implementar, Activadores)

Google Apps Script API enabled: https://script.google.com/home/usersettings

Session restart checklist
cd ~/amelie/clock/chaos-clock && git pull

npm test — should show 47 passing

cat .clasp.json — confirm scriptId

npx clasp login --status — confirm account

npx clasp pull — sync any editor-side changes

Read this file

Continue from the roadmap below

Roadmap
v0.5.2 (this commit)
Cleanup: jest warning, dead link, tz memoization, version alignment.

v0.6 — Onboarding card
First-launch card explaining the loop. onHomepage checks a cc.onboarded
user property; if absent, show a three-sentence intro with one button that
starts a default roll.

v0.7 — Granular OAuth + @OnlyCurrentDoc
Make the "no network calls" claim visible in the consent screen. Restrict the
Sheet access to the current document where possible.

Later
Real add-on icon (48×48 PNG, hosted publicly)

CHANGELOG.md backfill for pre-0.5.0

Group Egregore (shared intentions) — deferred until there's demand

Never
In-app timer with countdown

Ambient audio

Gamification (streaks, badges, points)

Social features

Anything that makes you open the app more

text

---