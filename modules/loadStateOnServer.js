import loadAsyncState from './loadAsyncState';
import normalizeRoutes from './normalizeRoutes';
import { nestAndReplaceReducersAndState } from './nestReducers';
import { map, cloneDeep } from 'lodash';

export default (props, store, cb) => {
  const { routes: rawRoutes, params } = props;

  const routes = cloneDeep(normalizeRoutes(rawRoutes));
  const reducers = map(routes, route => route.reducer);
  nestAndReplaceReducersAndState(store, 0, ...reducers);

  let needToLoadCounter = routes.length;
  const maybeFinish = () => {
    if (needToLoadCounter === 0) {
      cb(null, routes);
    }
  };

  loadAsyncState(
    routes,
    params,
    store.dispatch,
    (type, route, index) => {
      if (type === 'done' || type === 'server') {
        routes[index].blockRender = false;
        routes[index].loading = false;
        --needToLoadCounter;
        maybeFinish();
      }
    }
  );
};
