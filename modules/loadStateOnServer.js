import loadAsyncState from './loadAsyncState';
import normalizeRoutes from './normalizeRoutes';
import { nestAndReplaceReducersAndState } from './nestReducers';
import createMemoryHistory from 'react-router/lib/createMemoryHistory';
import { map, reduce, isEmpty } from 'lodash';
import {
  FD_SERVER_RENDER,
  FD_DONE,
  ROOT_DEPTH,
} from './constants';

const createFetchDataCallback = (initialRoutes, store, cb) => {
  let needToLoadCounter = initialRoutes.length;
  const maybeFinish = () => {
    if (needToLoadCounter === 0) {
      const initialState = store.getState();
      const initialData = { initialState, initialRoutes };
      const json = JSON.stringify(initialData);
      const scriptString = `<script>window.__INITIAL_DATA__=${json};</script>`;
      cb(null, null, initialData, scriptString);
    }
  };

  return (err, redirect, type, route, index) => {
    if (err) cb(err);
    if (redirect) {
      const { pathname, query, state } = redirect;
      const history = createMemoryHistory();
      let search;
      if (query && !isEmpty(query)) {
        search = reduce(query, (result, item, key) => {
          let pair = `${key}=${item}`;
          if (result.length > 1) pair = `&${pair}`;
          return `${result}${pair}`;
        }, '?');
      }

      cb(null, history.createLocation({
        pathname,
        search,
        state,
      }, 'REPLACE'));
    }

    if (type === FD_DONE || type === FD_SERVER_RENDER) {
      initialRoutes[index].blockRender = false;
      if (type === FD_DONE) {
        initialRoutes[index].loading = false;
      }
      --needToLoadCounter;
      maybeFinish();
    }
  };
};

// on server, route is still active bc blocking!
const stillActiveCallback = () => true;
const useHydratedData = false;

export default ({
  props,
  store,
  reducers,
}, cb) => {
  const { routes, location, params: routeParams } = props;

  const initialRoutes = normalizeRoutes(routes);
  const fetchDataCallback = createFetchDataCallback(initialRoutes, store, cb);
  const routeReducers = map(initialRoutes, route => route.reducer);

  nestAndReplaceReducersAndState(
    store,
    ROOT_DEPTH,
    reducers,
    ...routeReducers
  );

  loadAsyncState(
    initialRoutes,
    location.query,
    routeParams,
    store,
    fetchDataCallback,
    stillActiveCallback,
    useHydratedData
  );
};
