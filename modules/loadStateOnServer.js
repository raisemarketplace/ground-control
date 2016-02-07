import asyncEnter from './asyncEnter';
import normalizeRoutes from './normalizeRoutes';
import { nestAndReplaceReducersAndState } from './nestReducers';
import createMemoryHistory from 'react-router/lib/createMemoryHistory';
import { reduce, isEmpty } from 'lodash';
import { FD_SERVER_RENDER, FD_DONE, UPDATE_ROUTE_STATE } from './constants';
import updateRouteState from './updateRouteState';

const createAsyncEnterCallback = (initialRoutes, store, cb) => {
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

  return (err, redirect, type, route, depth) => {
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
      updateRouteState(store, depth, type);
      --needToLoadCounter;
      maybeFinish();
    }
  };
};

// on server, route is still active bc blocking!
const stillActiveCallback = () => true;
const useHydratedData = false;

export default ({
  props, store, reducers,
}, cb) => {
  const {
    routes, params,
    location: {
      query,
    },
  } = props;

  const initialRoutes = normalizeRoutes(routes);
  const asyncEnterCallback = createAsyncEnterCallback(initialRoutes, store, cb);
  nestAndReplaceReducersAndState(store, initialRoutes, reducers);

  asyncEnter(
    initialRoutes, params, query, store,
    asyncEnterCallback,
    stillActiveCallback,
    useHydratedData
  );
};
