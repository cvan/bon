'use strict';

import _ from 'underscore';
import riot from 'riot';
import page from 'page';
import pageExpressMapper from 'page.js-express-mapper.js';

import main from '../app/components/main';  // eslint-disable-line
import routes from '../app/routes';
import settings from '../../settings';
import socketUtil from '../app/util/socket';

let loadContext = {};

// Activate `page.js`'s `express-mapper` plugin.
window.page = page;
pageExpressMapper({
  renderMethod: null,
  expressAppName: 'app'
});

socketUtil.initWithUrl(settings.baseUrl);

routes.runRoutingTable(window.app, loadContext);

page();

let rendered = false;
let waitBeforeRendering = [];
if (loadContext.waitBeforeRendering) {
  // Create a copy.
  waitBeforeRendering = loadContext.waitBeforeRendering.slice();
}

console.log('Context after routing', loadContext, waitBeforeRendering, document.querySelector('main'));

function renderTest () {
  if (!rendered && !waitBeforeRendering.length &&
      document.querySelector('main')) {
    rendered = true;
    console.log('Rendering client');
    riot.mount('main', {dispatcher: routes.browserDispather});
  }
}

// Subscribe to all events
if (loadContext.waitBeforeRendering) {
  loadContext.waitBeforeRendering.forEach(eventName => {
    routes.browserDispather.one(eventName, () => {
      waitBeforeRendering = _.without(waitBeforeRendering, eventName);
      renderTest();
    });
  });
}

renderTest();

window.onload = () => {
  console.log('Page loaded!');
  renderTest();
};
