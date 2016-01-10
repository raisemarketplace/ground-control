import { createReducer } from 'redux-act';
import { merge } from 'lodash';

import component, { actions } from 'example/routes/root/components';

const reducer = createReducer({
  [actions.incr]: (state, payload) => {
    state.counter += payload;
    return merge({}, state);
  },
}, { counter: 0 });

export default {
  component,
  reducer,
};
