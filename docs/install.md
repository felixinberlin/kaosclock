# Install

## 1. Prerequisites

- Node 18+
- A Google account
- Google Calendar

## 2. Install deps

    npm install

## 3. Connect to Apps Script

    npx clasp login
    npx clasp create --type standalone --title "Chaos Clock"
    cp .clasp.json.example .clasp.json
    # paste the scriptId from the clasp output into .clasp.json
    npx clasp push

## 4. Enable the Calendar add-on

1. Open the Apps Script editor: `npx clasp open`
2. Project Settings -> check "Show appsscript.json in editor"
3. Run `installTriggers` once (authorize when prompted)
4. Deploy -> Test deployments -> Install
5. Open Google Calendar -> sidebar -> **Chaos Clock**

## 5. First run

- Open the sidebar
- Type an intent, set state, click **Roll Chaos**
- Look at your calendar

## Troubleshooting

- **Sidebar doesn't show**: reload Calendar, check Deploy -> Test deployments.
- **"Not authorized"**: re-run `installTriggers` to trigger consent flow.
- **Sheet missing**: delete `cc.sheetId` in User Properties; it recreates.
