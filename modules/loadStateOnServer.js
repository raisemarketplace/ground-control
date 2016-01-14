import loadAsyncState from './loadAsyncState';
import normalizeRoutes from './normalizeRoutes';
import { nestAndReplaceReducersAndState } from './nestReducers';
import { map } from 'lodash';
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
      const scriptString = `<script>window.__INITIAL_DATA__=${json}</script>`;
      cb(null, initialData, scriptString);
    }
  };

  return (type, route, index) => {
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

export default (props, store, baseReducers, cb) => {
  const { routes, params } = props;

  const initialRoutes = normalizeRoutes(routes);
  const fetchDataCallback = createFetchDataCallback(initialRoutes, store, cb);
  const reducers = map(initialRoutes, route => route.reducer);

  nestAndReplaceReducersAndState(
    store,
    ROOT_DEPTH,
    baseReducers,
    ...reducers
  );

  loadAsyncState(
    initialRoutes,
    params,
    store,
    fetchDataCallback,
    stillActiveCallback,
    useHydratedData
  );
};
