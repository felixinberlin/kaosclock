/**
 * Pure insight computation from session history.
 * Returns an array of { type, message }.
 */
function ccComputeInsights(sessions, now) {
  const insights = [];
  const completed = sessions.filter(function (s) { return s.completed; });

  if (sessions.length < CC.INSIGHTS_MIN_SESSIONS) {
    insights.push({
      type: 'cold-start',
      message: 'Keep rolling. Patterns appear after ' + CC.INSIGHTS_MIN_SESSIONS +
               ' sessions. You have ' + sessions.length + '.'
    });
    return insights;
  }
  // Per-mode completion + flow
  const byMode = {};
  for (let i = 0; i < sessions.length; i++) {
    const s = sessions[i];
    if (!byMode[s.mode]) byMode[s.mode] = { total: 0, done: 0, flowSum: 0 };
    byMode[s.mode].total++;
    if (s.completed) {
      byMode[s.mode].done++;
      byMode[s.mode].flowSum += Number(s.flow) || 0;
    }
  }
  for (const mode in byMode) {
    const m = byMode[mode];
    if (m.total < 3) continue;
    const rate = m.done / m.total;
    const flow = m.done ? m.flowSum / m.done : 0;
    if (rate < 0.3) {
      insights.push({
        type: 'skip:' + mode,
        message: 'You skip ' + mode + ' often (' + Math.round(rate * 100) + '%). Try a different mode or lower chaos.'
      });
    }
    if (flow >= 4 && m.done >= 2) {
      insights.push({
        type: 'flow:' + mode,
        message: mode + ' produces your best flow (' + flow.toFixed(1) + '/5).'
      });
    }
  }

  // Best hour
  const hourFlow = {};
  for (let i = 0; i < completed.length; i++) {
    const s = completed[i];
    const h = new Date(s.rolledAt).getHours();
    if (!hourFlow[h]) hourFlow[h] = { sum: 0, n: 0 };
    hourFlow[h].sum += Number(s.flow) || 0;
    hourFlow[h].n++;
  }
  let bestHour = null, bestAvg = 0;
  for (const h in hourFlow) {
    if (hourFlow[h].n < 2) continue;
    const avg = hourFlow[h].sum / hourFlow[h].n;
    if (avg > bestAvg) { bestAvg = avg; bestHour = h; }
  }
  if (bestHour !== null) {
    insights.push({
      type: 'hour',
      message: 'Your gnosis hour is around ' + bestHour + ':00 (flow ' + bestAvg.toFixed(1) + ').'
    });
  }

  // Chaos correlation: does higher chaos hurt completion?
  const low = sessions.filter(function (s) { return Number(s.chaos) <= 30; });
  const high = sessions.filter(function (s) { return Number(s.chaos) >= 70; });
  if (low.length >= 3 && high.length >= 3) {
    const lowRate = low.filter(function (s) { return s.completed; }).length / low.length;
    const highRate = high.filter(function (s) { return s.completed; }).length / high.length;
    if (lowRate - highRate > 0.2) {
      insights.push({
        type: 'chaos',
        message: 'You complete more at low chaos (' + Math.round(lowRate * 100) + '% vs ' + Math.round(highRate * 100) + '%).'
      });
    } else if (highRate - lowRate > 0.2) {
      insights.push({
        type: 'chaos',
        message: 'You complete more at high chaos (' + Math.round(highRate * 100) + '% vs ' + Math.round(lowRate * 100) + '%). Wild.'
      });
    }
  }

  return insights;
}