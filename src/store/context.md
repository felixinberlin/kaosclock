---

## `CONTEXT.md` — new file at repo root

This is the handoff document. When you or I restart the session, this is what we read first.

```markdown
# Chaos Clock — Development Context

Handoff document. Read this first when resuming work.

**Last updated:** v0.5.0 (Sigil Vault UI)

---

## One-paragraph summary

Chaos Clock is a Google Calendar add-on built as an Apps Script project. It rolls a focus mode + duration + time slot from the user's state and intent, creates a real calendar event at the next free slot, and includes a set of autonomous "chaos events" that rearrange the calendar based on a 0–100 chaos factor. Users log flow after each session. History lives in a Google Sheet in the user's own Drive. No backend, no AI, no telemetry.

---

## Current state

| Item | Value |
|---|---|
| Version | 0.5.0 |
| Tests | 38 passing (`npm test`) |
| Platform | Google Workspace Add-on (Apps Script, V8) |
| Repo | https://github.com/felixinberlin/kaosclock |
| Script ID | stored in local `.clasp.json` (not committed) |
| Owner account | felixinberlin@googlemail.com |
| Sheet tab name | "Chaos Clock Log" (auto-created in user's Drive) |

### What works

- Roll engine (6 modes, chaos-shaped weighted pick, deterministic at chaos=0)
- Free-slot finder (Now / Soon / 7-day horizon, 9–20h, 5-min buffers)
- Calendar event creation with title formatting and description
- Post-session logging with flow rating
- Sheet-backed session history (Sessions + ChaosLog + Sigils tabs)
- Sigil Vault (auto-save on roll, dedup by normalized text, use count, archive)
- Insights card (cold-start, per-mode skip/flow, best hour, chaos correlation)
- Settings card with 11 individual chaos toggles
- Daily trigger (`dailyChaos`) + weekly trigger (`weeklyConfession`)
- Chaos events shipped: Time Drift, Phantom Slots, Resurface, Wandering, Reluctant Servitor, Past Tense, Poltergeist, Prophecy, Trickster Roll, Anti-Calendar Day, Confession Log

### Known gaps / follow-ups

- `installTriggers` needs to be re-run after adding the weekly confession trigger (v0.2)
- `ccMigrateSigilsTab` needs to be run once on existing Sheets to add `useCount`
- The add-on icon uses a Google-hosted placeholder URL — swap for a real asset when ready
- No onboarding card on first install (new users see the home card with no context)

---

## Architecture in one diagram
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
├──► store/*.gs ← I/O wrappers
│ propsStore · user settings (PropertiesService)
│ sheetStore · append/read/update rows
│ calendarStore · create/move/delete events
│ sigilStore · vault persistence + dedup
│
└──► triggers.gs ← time-based autonomous chaos
dailyChaos · resurface, wander, prophecy
weeklyConfession

text

**Rule:** `engine/` must never call `CalendarApp`, `SpreadsheetApp`, or `PropertiesService`. Everything I/O lives in `store/` or `main.gs`. This is what makes the tests fast and the logic trustworthy.

---

## Key files and why they matter

| File | Purpose |
|---|---|
| `src/config.gs` | Every tunable. Add a mode here → it appears everywhere. Add a chaos flag here → toggle in Settings picks it up. |
| `src/engine/rollEngine.gs` | `ccRoll(input, rng)` — deterministic given rng. `ccSigil(text)` — FNV-1a + xorshift. |
| `src/engine/chaosEvents.gs` | All Tier 1/2/3 planners. Each is a pure `ccPlanX(...)` returning a plan or `null`. |
| `src/engine/slotFinder.gs` | `ccFindSlotPure(opts)` — pure. `ccPlanSlotForRoll(input)` — wrapper with schedule modes. |
| `src/engine/insights.gs` | `ccComputeInsights(sessions, now)` — returns `[{type, message}]`. |
| `src/store/sigilStore.gs` | `ccSaveSigil`, `ccListSigils`, `ccFindSigilIn`, `ccNormalizeSigilText`. |
| `src/main.gs` | All handlers: `onRoll`, `onSaveLog`, `onUseSigil`, etc. |

---

## Data model

### Sheet: Sessions

`id · rolledAt · intent · mode · duration · energy · focus · chaos · eventId · completed · flow · note · loggedAt · flowScore · wanderCount`

### Sheet: Sigils

`id · text · glyph · createdAt · useCount · archived`

### Sheet: ChaosLog

`timestamp · action · targetEventId · chaosFactor · note`

`action` values: `phantomSlot`, `resurface`, `wander`, `nag:<mode>`, `trickster`, `poltergeist`, `prophecy`, `confession`

---

## Chaos math (so we don't have to rediscover it)

### Roll shaping

Weighted pick with temperature: `w_i^(1/T)`, `T = 1 + chaos/100 * 5`.

- chaos = 0 → **argmax** (deterministic, no dice)
- chaos > 0 → weighted sample, lerped toward uniform as chaos rises

### Time Drift

`driftMin = round((rng*2 - 1) * (chaos/100) * DRIFT_MAX_MIN)` with `DRIFT_MAX_MIN = 20`.

### Slot finder

Walks day by day, 9:00–20:00, skips busy intervals, respects `graceMin` and `minGapMin`. Falls back to "now" if the horizon is fully booked.

---

## How to run tests

```bash
npm test          # jest with TZ=UTC
Tests load all src/**/*.gs into a vm sandbox with mocked Apps Script globals. See tests/setup.js and tests/mocks/appsScript.js. Add a mock when you touch a new global.

How to push changes
bash
npx clasp push
Then F5 in the Apps Script editor. The function dropdown does not auto-refresh after a push.

If you add a new scope to appsscript.json, re-run installTriggers once to trigger the consent flow again.

Roadmap (agreed order)
v0.6 — AI Oracle (next)
Optional. Toggle in settings + user-provided API key. When enabled, an LLM rewrites the intent into something more actionable before rolling.

Example: "Finish landing page copy" → "Write 3 bullet points for the hero section."

Requires: UrlFetchApp, new scope, API key storage in user properties, an ccOracleRewrite(intent) function, fallback to no-op when disabled.

v0.7 — Onboarding card
First-launch screen explaining the loop in three sentences and offering sensible chaos defaults.

v0.8 — Free-slot finder: user working hours
Read working hours from Google Calendar settings instead of hardcoded 9–20.

v0.9 — Group Egregore
Shared intention for teams. Probably needs a separate deployed web app or a shared Sheet. Deferred until there's demand.

Deliberately never
In-app timer with countdown

Ambient audio

Gamification (streaks, badges, points)

Social features

Anything that makes you open the app more

Design principles (do not violate)
Pure engine, impure shell. Logic in engine/ takes all inputs explicitly. Tests prove it.

User owns their data. No backend. No accounts. No telemetry. Everything in the user's Google account.

Settings live in Properties. History lives in Sheets. Don't mix.

RNG is injectable. Every engine function takes rng as an optional argument.

The calendar event is the timer. Don't build a timer.

Tone rule. Every chaos feature must pass: if you describe it to a friend, they laugh, then immediately want it. Chaos is playful, not hostile.

Every chaos behavior is individually toggleable. Defaults are safe. Opt-in is available.

Common pitfalls
clasp push doesn't refresh the editor. F5 after every push.

Missing scope → "script does not have permission". Add scope to appsscript.json, push, re-run any function to trigger consent.

Sheet tab schema drift. Use ccAppendNamed(tab, obj) instead of appendRow([...]) when adding a column.

new Date(x) in tests uses local tz. Always run with TZ=UTC (already set in package.json).

CardService is not HTML. No CSS, no animations, no SVG. Emoji and unicode only.

TextInput.setValue only pre-fills; the field is still submitted on roll.

Environment notes
Developed on WSL (DESKTOP-Q145S6A), user felix

Node 18+

npx clasp (not globally installed)

Editor language: Spanish (menus: Ejecutar, Implementar, Activadores, Configuración del proyecto)

API enabled: https://script.google.com/home/usersettings (Google Apps Script API must be ON)

Session restart checklist
If this chat is lost and you're resuming:

cd ~/amelie/clock/chaos-clock

git pull — make sure you're on latest

npm test — should show 38 passing (or more if work continued)

cat .clasp.json — confirm the scriptId is still there

npx clasp login --status — confirm you're logged in

npx clasp pull — sync any changes made directly in the editor

Read CONTEXT.md (this file) and the last entry in CHANGELOG.md (if you kept one)

Continue from the "Roadmap" section above

