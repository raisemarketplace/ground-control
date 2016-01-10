import { connect } from 'react-redux';
import { createReducer } from 'redux-act';
import { merge } from 'lodash';
import { simpleConnect } from 'modules/AsyncRedux';

import Layout, { actions } from 'example/routes/layout';
import indexRoute from 'example/routes/root';

// connect top level only & everything is automatic.
const component = simpleConnect(connect, Layout);
const reducer = createReducer({
  [actions.incr]: (state, payload) => {
    state.counter += payload;
    return merge({}, state);
  },
}, { counter: 0 });

// adjusted route api...
// {
//   path,
//   component,
//   childRoutes,
//   getChildRoutes,
//   ...
//   reducer (optional),
//   fetchData (optional),
//   loader (optional),
// }

// routes can be defined using jsx, or as an object (my preference)
export default {
  path: '/',
  indexRoute,
  component,
  reducer,
};
