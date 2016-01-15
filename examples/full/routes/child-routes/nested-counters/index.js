import component, { reducer } from 'examples/full/routes/child-routes/nested-counters/components';
import indexRoute from 'examples/full/routes/child-routes/nested-counters/index-route';
import multiplyCounterRoute from 'examples/full/routes/child-routes/nested-counters/child-routes/multiply-counter';
import squareCounterRoute from 'examples/full/routes/child-routes/nested-counters/child-routes/square-counter';

export default {
  path: '/nested-counters',
  component,
  reducer,
  indexRoute,
  childRoutes: [
    multiplyCounterRoute,
    squareCounterRoute,
  ],
};
