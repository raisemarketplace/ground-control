import component, { reducer } from 'complex-example/routes/child-routes/nested-counters/components';
import indexRoute from 'complex-example/routes/child-routes/nested-counters/index-route';
import multiplyCounterRoute from 'complex-example/routes/child-routes/nested-counters/child-routes/multiply-counter';
import squareCounterRoute from 'complex-example/routes/child-routes/nested-counters/child-routes/square-counter';

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
