import componentFactory from '../component-factory';

import mall from './mall';  // eslint-disable-line
import login from './login';  // eslint-disable-line

componentFactory.createComponent('main', `

<account-status></account-status>
<mall if={stores.main.state=='mall'}></mall>
<login if={stores.main.state=='login'}></login>

<style>
  main {
    display: block;
    background-color: pink;
  }
</style>

`, function (opts) {
  this.on('mount', () => {
    console.log('Main mounted');
  });

  this.dispatcher.on('main_state_updated', () => {
    this.update();
  });
});
