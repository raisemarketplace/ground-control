import { createAction } from 'redux-act';
import { reduce } from 'lodash';

export default (...actions) => {
  return reduce(actions, (result, action) => {
    result[action] = createAction();
    return result;
  }, {});
};
