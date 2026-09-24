const _props = {};

const PropertiesService = {
  getUserProperties: function () {
    return {
      getProperty: function (k) { return _props[k] || null; },
      setProperty: function (k, v) { _props[k] = String(v); },
      deleteProperty: function (k) { delete _props[k]; }
    };
  }
};

const Utilities = {
  getUuid: function () { return 'uuid-' + Math.random().toString(36).slice(2, 10); },
  formatDate: function (d, tz, fmt) { return d.toISOString(); }
};

const Session = { getScriptTimeZone: function () { return 'UTC'; } };

const SpreadsheetApp = {
  create: function () {
    return {
      getId: function () { return 'sheet-1'; },
      getSheetByName: function () { return null; },
      insertSheet: function () { return { appendRow: function () {}, setFrozenRows: function () {} }; }
    };
  },
  openById: function () { throw new Error('not implemented in mock'); }
};

const CalendarApp = {
  getDefaultCalendar: function () {
    return {
      createEvent: function (title, start, end) {
        return {
          getId: function () { return 'ev-' + title; },
          setTime: function () {},
          deleteEvent: function () {}
        };
      },
      getEvents: function () { return []; },
      getEventById: function () { return null; }
    };
  }
};

const ScriptApp = {
  getProjectTriggers: function () { return []; },
  deleteTrigger: function () {},
  newTrigger: function () {
    return {
      timeBased: function () { return this; },
      everyDays: function () { return this; },
      atHour: function () { return this; },
      create: function () { return {}; }
    };
  }
};

function _fluent() {
  const o = {};
  ['setTitle', 'setSubtitle', 'setFieldName', 'setHint', 'setMultiline',
   'setText', 'setTextButtonStyle', 'setOnClickAction', 'setParameters',
   'setNavigation', 'setNotification', 'addItem', 'addWidget', 'addSection',
   'setType', 'setHeader', 'setFunctionName', 'pushCard'].forEach(function (m) {
    o[m] = function () { return o; };
  });
  o.build = function () { return o; };
  return o;
}

const CardService = {
  newCardBuilder: function () { return _fluent(); },
  newCardHeader: function () { return _fluent(); },
  newCardSection: function () { return _fluent(); },
  newTextInput: function () { return _fluent(); },
  newTextParagraph: function () { return _fluent(); },
  newTextButton: function () { return _fluent(); },
  newSelectionInput: function () { return _fluent(); },
  newAction: function () { return _fluent(); },
  newActionResponseBuilder: function () { return _fluent(); },
  newNavigation: function () { return _fluent(); },
  newNotification: function () { return _fluent(); },
  SelectionInputType: { DROPDOWN: 'DROPDOWN', SWITCH: 'SWITCH' },
  TextButtonStyle: { FILLED: 'FILLED' }
};

module.exports = {
  PropertiesService,
  Utilities,
  Session,
  SpreadsheetApp,
  CalendarApp,
  ScriptApp,
  CardService,
  __props: _props,
  __reset: function () { Object.keys(_props).forEach(function (k) { delete _props[k]; }); }
};
