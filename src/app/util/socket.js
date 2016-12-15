/* global Primus */

// Socket Util.
// Users primus.js.

import PrimusNode from 'primus';
import PrimusEmitter from 'primus-emitter';

import settings from '../../../settings';

class SocketUtil {
  initWithUrl (url) {
    this.url = url;
    this.client = null;

    if (typeof window === 'undefined') {
      // Server init
      console.log('Socket util - Server init with URL:', url);
      let Socket = PrimusNode.createSocket({
        transformer: 'websockets',
        parser: 'json',
        plugin: {
          emitter: PrimusEmitter
        }
      });
      this.client = new Socket(url);
    } else {
      // Client init.
      console.log('Socket util - Client init with URL:', url);
      this.client = Primus.connect(settings.baseUrl);
    }

    this.client.on('open', () => {
      console.log('Socket connection is open');
    });

    this.client.on('error', (error) => {
      console.warn('Error connecting to socket:', error);
    });
  }

  reconnect () {
    console.log('Socket Util - Reconnecting socket');
    this.initWithUrl(this.url);
  }

  rpc (service, args) {
    return new Promise((resolve, reject) => {
      console.log('Socket util sending', args, 'to', service);

      this.client.send(service, args, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
}

// Singleton.
let instance = new SocketUtil();
export default instance;
