# Architecture

## Layers

    Google Calendar UI (CardService)
        |
        v
    main.gs -- handlers + card builders
        |
        +--> engine/ (pure logic, testable)
        |
        +--> store/ (Sheets, Props, Calendar)
        |
    triggers.gs -- time-based autonomous chaos

## Principles

- **Pure engine, impure shell.** rollEngine.gs and chaosEvents planners
  take all inputs explicitly and are unit tested. Anything touching
  CalendarApp / SpreadsheetApp / PropertiesService lives in store/.
- **User owns their data.** No central backend. Each user gets a Sheet
  in their own Drive, named "Chaos Clock Log".
- **Settings live in Properties.** History lives in Sheets.
- **RNG is injectable.** ccRoll(input, rng).

## Data model

### Sheet: Sessions

| col | type |
|---|---|
| id | uuid |
| rolledAt | date |
| intent | string |
| mode | string |
| duration | int (min) |
| energy | int 1-5 |
| focus | int 1-5 |
| chaos | int 0-100 |
| eventId | string |
| completed | bool |
| flow | int 1-5 |
| note | string |
| loggedAt | date |
| flowScore | int |
| wanderCount | int |

### Sheet: ChaosLog

| col | type |
|---|---|
| timestamp | date |
| action | string |
| targetEventId | string |
| chaosFactor | int |
| note | string |

## Chaos shaping math

Weighted pick with temperature: w_i^(1/T), T = 1 + chaos/100 * 5.

- chaos = 0  -> T = 1  -> greedy
- chaos = 100 -> T = 6 -> near-uniform

## Time Drift

driftMin = round((rng*2 - 1) * (chaos/100) * DRIFT_MAX_MIN)

## Extending

- New mode: add to CC.MODES.
- New chaos event: write ccPlanX(session, now, rng) in chaosEvents.gs,
  add to CC.CHAOS_FLAGS, call from dailyChaos or onRoll. Test it.

## Deliberately not here

- No real-time timer UI. The calendar event is the timer.
- No AI. ccRoll is deterministic given RNG.
- No backend, no accounts, no telemetry.
