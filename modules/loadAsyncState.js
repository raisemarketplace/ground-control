import { forEach, partial } from 'lodash';
import { rootStateAtDepth } from './stateAtDepth';
import getHydratedData from './getHydratedData';
import {
  FD_SERVER_RENDER,
  FD_CLIENT_RENDER,
  FD_DONE,
  IS_CLIENT,
  IS_SERVER,
} from './constants';

const isClient = () => IS_CLIENT;
const isServer = () => IS_SERVER;

const _stillActive = (cb, route, index) => cb(route, index);
const _done = (cb, route, index) => cb(FD_DONE, route, index);
const _clientRender = (cb, route, index) => cb(FD_CLIENT_RENDER, route, index);
const _serverRender = (cb, route, index) => {
  if (IS_SERVER) cb(FD_SERVER_RENDER, route, index);
};

export default (routes, params, store, cb, stillActive, initialPageLoad) => {
  const { dispatch, getState } = store;

  if (routes.length > 0) {
    const hydratedData = getHydratedData(initialPageLoad);
    const hydrated = () => hydratedData.useHydratedData;
    forEach(routes, (route, index) => {
      const isMounted = partial(_stillActive, stillActive, route, index);
      const done = partial(_done, cb, route, index);
      const clientRender = partial(_clientRender, cb, route, index);
      const serverRender = partial(_serverRender, cb, route, index);
      const hydratedDataForRoute = () => {
        if (hydratedData.useHydratedData) return rootStateAtDepth(hydratedData.state, index);
        return null;
      };

      if (route.fetchData) {
        route.fetchData(done, {
          params,
          dispatch,
          getState,
          isMounted,
          hydrated,
          hydratedDataForRoute,
          clientRender,
          serverRender,
          isClient,
          isServer,
        });
      } else {
        done();
      }
    });
  }
};
