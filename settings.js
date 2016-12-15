'use strict';

const path = require('path');
const urllib = require('url');

const objectAssign = require('deep-assign');

const settingsDefault = require('./settings.default');

let settingsLocal = {};

try {
  // Using CommonJS instead of ES6 imports because ES6 imports allow
  // only top-level `import` calls.
  if (path.join(__dirname, './settings.local.json')) {
    settingsLocal = require('./settings.local.json');
  }
} catch (e) {
  settingsLocal = {};
}

let settings = objectAssign({}, settingsDefault, settingsLocal);

settings.baseUrl = urllib.format({
  protocol: settings.protocol,
  hostname: settings.hostname,
  port: settings.port,
  pathname: settings.pathname
});

settings.url = urlPath => {
  return urllib.resolve(settings.baseUrl, urlPath);
};

settings.firebaseJSONUrl = firebaseRefName => {
  var fn = (settings.firebase.refs[refname] || settings.firebase.refs.root) + '.json';
  return urllib.resolve(settings.firebase.credentials.databaseURL, fn);
};

module.exports = settings;
