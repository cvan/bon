import componentFactory from '../component-factory';

import apple from './apple';  // eslint-disable-line

componentFactory.createComponent('mall', `

<h1>Welcome to the fruit shopping mall</h1>
<a href="/apple">Visit apple store</a>
<apple if={stores.fruit.currentFruit=='apple'}></apple>
<style>
  mall {
    a {
      display: flex;
    }
  }
</style>

`, function (opts) {
  this.dispatcher.on('fruit_updated', fruit => {
    console.log('Mall - fruit updated!');
    this.update();
  });
});
