/**
 * Thin wrapper around CalendarApp.
 */
function ccCalendar() {
  return CalendarApp.getDefaultCalendar();
}

function ccCreateEvent(input) {
  const ev = ccCalendar().createEvent(input.title, input.start, input.end, {
    description: input.description || ''
  });
  return ev;
}

function ccGetEventById(id) {
  try {
    return ccCalendar().getEventById(id);
  } catch (err) {
    ccWarn('getEventById failed', { id, err: String(err) });
    return null;
  }
}

function ccMoveEvent(id, newStart, newEnd) {
  const ev = ccGetEventById(id);
  if (!ev) return false;
  ev.setTime(newStart, newEnd);
  return true;
}

function ccDeleteEvent(id) {
  const ev = ccGetEventById(id);
  if (!ev) return false;
  ev.deleteEvent();
  return true;
}

/** Return busy intervals as epoch-ms pairs, ignoring all-day events. */
function ccBusyIntervals(from, to) {
  const events = ccCalendar().getEvents(from, to);
  const out = [];
  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    const isAllDay = typeof ev.isAllDayEvent === 'function' && ev.isAllDayEvent();
    if (isAllDay) continue;
    out.push({
      start: ev.getStartTime().getTime(),
      end: ev.getEndTime().getTime()
    });
  }
  out.sort(function (a, b) { return a.start - b.start; });
  return out;
}
