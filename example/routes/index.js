import { connect } from 'react-redux';
import { simpleConnect } from 'modules/AsyncNestedRedux';

import App, { reducer } from 'example/routes/components';
import indexRoute from 'example/routes/index-route';
import googleBooksRoute from 'example/routes/child-routes/google-books';
import nestedCountersRoute from 'example/routes/child-routes/nested-counters';

// connect top level only & everything is automatic.
const component = simpleConnect(connect, App);

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

// routes can be defined using jsx, or as an object (my preference, especially with larger app)
export default {
  path: '/',
  component,
  reducer,
  indexRoute,
  childRoutes: [
    googleBooksRoute,
    nestedCountersRoute,
  ],
};
