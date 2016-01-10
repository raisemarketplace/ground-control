import { connect } from 'react-redux';
import { simpleConnect } from 'modules/AsyncRedux';

import Layout from 'example/routes/layout';
import indexRoute from 'example/routes/root';
import googleBooksRoute from 'example/routes/google-books';
import nestedCountersRoute from 'example/routes/nested-counters';

// connect top level only & everything is automatic.
const component = simpleConnect(connect, Layout);

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

// routes can be defined using jsx, or as an object (my preference, especially with larger api)
export default {
  path: '/',
  indexRoute,
  component,
  childRoutes: [
    googleBooksRoute,
    nestedCountersRoute,
  ],
};
