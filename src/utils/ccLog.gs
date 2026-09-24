/**
 * Namespaced logger — avoids collision with Apps Script's Logger.
 */
function ccLog(level, msg, data) {
  const line = '[CC:' + level + '] ' + msg + (data ? ' ' + JSON.stringify(data) : '');
  console.log(line);
}
function ccInfo(msg, data)  { ccLog('INFO', msg, data); }
function ccWarn(msg, data)  { ccLog('WARN', msg, data); }
function ccError(msg, data) { ccLog('ERROR', msg, data); }
