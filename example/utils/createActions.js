import { createAction } from 'redux-act';
import { reduce } from 'lodash';

export default (namespace, actions) => {
  return reduce(actions, (result, action) => {
    result[action] = createAction(`${namespace}:${action}`);
    return result;
  }, {});
};
