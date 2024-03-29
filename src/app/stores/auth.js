'use strict';

import fetchUtil from '../util/fetch';
import settings from '../../../settings';
import socketUtil from '../util/socket';
import Store from './store';

export default class AuthStore extends Store {
  constructor () {
    super();
    console.log('Init AuthStore');
    this.user = null;

    this.on('user_login', async (loginData) => {
      try {
        console.log('User login:', loginData);

        let post = await fetchUtil.postJSON(settings.url('login'), loginData);
        let response = await post.json();

        console.log('Login reply:', response);

        if (response.status === 'error') {
          this.trigger('login_error', response.message);
          return;
        }

        if (response.status === 'success') {
          this.user = response.data.user;
          // Reconnect the socket to gain session auth.
          socketUtil.reconnect();
          this.trigger('login_success', response.data.user);
        }
      } catch (e) {
        console.log('Error logging in', e);
      }
    });
  }
}
