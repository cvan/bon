import fetchUtil from '../../app/util/fetch';

const fruitService = {
  get: tableName => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('Fruit Service --> Get fruit:', tableName);
        if (tableName === 'showcase') {
          let get = await fetchUtil.getJSON(settings.firebaseJSONUrl(tableName));
          let response = await get.json();
          resolve(response);
        } else {
          reject('Unknown type of fruit');
        }
      }, 1000);
    });
  }
};

export default fruitService;
