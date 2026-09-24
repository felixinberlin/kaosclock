/**
 * Time-zone helpers.
 *
 * Apps Script evaluates Date#setHours / getHours in the *script* time zone
 * (appsscript.json, here Etc/UTC), not in the user's. Everything that means
 * a wall-clock hour ("9 am", "the last day of the month") goes through these
 * helpers with the user's IANA zone instead.
 *
 * Pure functions: `tz` defaults to 'UTC' so the engine stays testable
 * independent of the machine's TZ.
 */

const CC_TZ_FORMATTERS = {};

function ccTzFormatter(tz) {
  if (!CC_TZ_FORMATTERS[tz]) {
    CC_TZ_FORMATTERS[tz] = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hourCycle: 'h23',
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric',
      weekday: 'short'
    });
  }
  return CC_TZ_FORMATTERS[tz];
}

/** Wall-clock parts of an instant in `tz`. month is 1–12, dow 0 = Sunday. */
function ccTzParts(ms, tz) {
  tz = tz || 'UTC';
  const parts = ccTzFormatter(tz).formatToParts(new Date(ms));
  const out = {};
  for (let i = 0; i < parts.length; i++) out[parts[i].type] = parts[i].value;
  const dows = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    year: Number(out.year),
    month: Number(out.month),
    day: Number(out.day),
    hour: Number(out.hour) % 24,
    minute: Number(out.minute),
    second: Number(out.second),
    dow: dows[out.weekday]
  };
}

/** Offset of `tz` from UTC at instant `ms`, in ms (Berlin summer: +7200000). */
function ccTzOffsetMs(ms, tz) {
  const p = ccTzParts(ms, tz);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(ms / 1000) * 1000;
}

/** Instant of a wall-clock time in `tz`. Month 1–12; day may overflow. */
function ccTzWallToMs(year, month, day, hour, minute, tz) {
  const guess = Date.UTC(year, month - 1, day, hour, minute || 0, 0);
  let ms = guess - ccTzOffsetMs(guess, tz);
  ms = guess - ccTzOffsetMs(ms, tz); // second pass settles DST edges
  return ms;
}

/** The instant at `hour`:00 local time, `dayOffset` calendar days after the local date of `ms`. */
function ccTzAtHour(ms, dayOffset, hour, tz) {
  const p = ccTzParts(ms, tz);
  return ccTzWallToMs(p.year, p.month, p.day + (dayOffset || 0), hour, 0, tz);
}

/** The user's zone: their calendar's, then the script's, then UTC. */
function ccUserTz() {
  try {
    const tz = CalendarApp.getDefaultCalendar().getTimeZone();
    if (tz) return tz;
  } catch (err) { /* fall through */ }
  try {
    const tz = Session.getScriptTimeZone();
    if (tz) return tz;
  } catch (err) { /* fall through */ }
  return 'UTC';
}
