'use strict';

import path from 'path';

import _ from 'underscore';
import bodyParser from 'body-parser';
import feathers from 'feathers';
import feathersPassport from 'feathers-passport';
import FS from 'fs';
import hooks from 'feathers-hooks';
import riot from 'riot';
import session from 'express-session';
import Q from 'q';

import main from '../app/components/main';
import routes from '../app/routes';
import services from './services';
import settings from '../../settings.js';
import socketUtil from '../app/util/socket';

let app = feathers();

app.use(feathers.static(path.join(process.env.APP_BASE_PATH, 'public')));

// Riot app template engine.
app.engine('html', (filePath, options, callback) => {
  async function render () {
    try {
      let view = riot.render(options.mainTag, options.tagOpts);
      let regex = new RegExp('<' + options.mainTag + '.*<\/' + options.mainTag + '>');
      // Loading HTML file
      let content = await Q.denodeify(FS.readFile)(filePath);
      let rendered = content.toString().replace(regex, view);
      return callback(null, rendered);
    } catch (e) {
      console.warn('App engine error:', e, ' Filepath:', filePath, 'Callback:', callback);
      console.warn(e.stack);
      return;
    }
  }

  render();
})

app.set('views', './build/'); // specify the views directory
app.set('view engine', 'html'); // register the template engine

// Server routes
app.configure(
  feathers.rest()
)
.configure(feathers.primus({
  transformer: 'websockets'

}, function(primus) {
}))
.configure(hooks())
.use(bodyParser.json())
.configure(feathersPassport({
  secret: 'eat-your-fruits',
  // In production use RedisStore
  store: new session.MemoryStore(),
  resave: true,
  saveUninitialized: true
}))
.use('/fruit', services.fruit)
.use('/taste', services.taste)
.use('/users', services.users);

// Client routes
routes.runRoutingTable(app);

// Authentication setup
let userService = app.service('users');

services.users.insertHooks(userService);
services.users.createTestUser(userService);
services.users.setupPassport(userService, app);

app.use(function (req, res, next) {

  let rendered = false;
  let waitBeforeRendering = [];
  if (req.waitBeforeRendering) {
    // Create a copy
    waitBeforeRendering = req.waitBeforeRendering.slice();
  }

   function renderTest() {
    if (!rendered && waitBeforeRendering.length == 0) {
      rendered = true;
      res.render('index', {mainTag: 'main', tagOpts: {'dispatcher': req.dispatcher}});
    }
  }
  // Subscribe to all events
  if (req.waitBeforeRendering) {
    req.waitBeforeRendering.forEach((eventName) => {
      req.dispatcher.one(eventName, () => {
        waitBeforeRendering = _.without(waitBeforeRendering, eventName);
        renderTest();
      });
    });
  }
  renderTest();
});

console.log('Starting server');

// Server routes
let server = app.listen(settings.port, () => {
  let hostname = server.address().address;
  let port = server.address().port;

  let protocol = (
    settings.protocol === 'http:' ||
    settings.protocol === 'https:' ?
    settings.protocol : 'http:'
  );
  let host = hostname === '::' ? 'localhost' : hostname;

  console.log('App listening at %s//%s:%s',  protocol, host, port);

  // Init the loopback socket connection.
  socketUtil.initWithUrl(settings.baseUrl);
});
