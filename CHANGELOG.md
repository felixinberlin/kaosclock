# Changelog

## v0.5.2
- Fixed Jest validation warning (`setupFilesAfterEach` is not a Jest option)
- `ccUserTz()` memoized per execution (was calling CalendarApp 3–5× per click)
- `CC.VERSION` aligned with `package.json`
- Handoff doc moved to repo root (`CONTEXT.md`); README link fixed
- No behavior changes

## v0.5.1
- Time zone: working hours, anti-calendar day, prophecy, resurface, wander,
  echo and insights use the user's calendar time zone (`src/utils/tz.gs`);
  triggers are installed `inTimezone`. Before, all of it ran in `Etc/UTC`
  (9–20 meant 11–22 in Berlin) and tests only passed with `TZ=UTC`.
  Re-run `installTriggers` after updating.
- Chaos 0 is fully deterministic: duration is the middle of the range.
- Removed the unused `script.external_request` scope.
- Settings no longer call Prophecy "locked" — it never was.
- License: CC0-1.0 (LICENSE file added; README said MIT, no file existed).
- README: fixed code fences, dead CONTEXT.md link, added "What it promises".
- 47 tests, green under any `TZ`.

## v0.5.0
- Sigil Vault UI, auto-save on roll, dedup, archive
- `ccSaveSigil`, `ccListSigils`, `ccFindSigilIn`
- `ccMigrateSigilsTab` for existing Sheets
- 38 tests passing

## v0.4.0
- Free-slot finder, schedule modes
- `slotFinder.gs`, `ccBusyIntervals`
- 30 tests passing

## v0.3.0
- Insights card, `insights.gs`

## v0.2.0
- Tier 3 chaos: past tense, poltergeist, prophecy, trickster, anti-calendar day, confession

## v0.1.0
- Roll engine, 6 modes, time drift, phantom slots, resurface, wandering, reluctant servitor
- Sheet logging, settings card, triggers