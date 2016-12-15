'use strict';

import settings from '../../../settings';
import socketUtil from '../util/socket';
import Store from './store';

export default class FruitStore extends Store {
  constructor () {
    super();
    console.log('Init FruitStore');

    this.state = 'mall';
    this.currentTable = null;

    this.on('table_changed', async (tableName) => {
      try {
        this.currentTable = tableName;
        this.trigger('fruit_updated');

        this.fruitData = null;

        if (tableName) {
          // Get fruit types
          console.log('Getting info for ', tableName);
          // var firebaseApp = firebase.initializeApp(settings.firebase.credentials);

          // var firebaseApp = firebase.initializeApp(settings.firebase.credentials);
          // var firebaseRef = firebaseApp.database().ref(settings.firebase.ref);
          // console.log('firebase', firebaseRef);

          // let response = await fetch(settings.firebase.credentials.databaseURL + '/' + settings.firebase.refs.showcase + '.json');
          // this.fruitData = await response.json();

          this.fruitData = await socketUtil.rpc('fruit::get', tableName);
          console.log('Fruit data:', this.fruitData);
          this.trigger('db_changed');
        }
      } catch (err) {
        console.log('Error getting fruit data:', err);
      }
    });

    this.on('taste_fruit', async (type) => {
      try {
        let result = await socketUtil.rpc('taste::get', type);
        this.trigger('taste_result', {
          type: type,
          result: result.result
        });
      } catch (err) {
        console.log('Taste fruit error:', err);
        this.trigger('taste_error', {message: err});
      }
    });
  }
}
