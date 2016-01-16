import { forEach, partial } from 'lodash';
import { applicationState } from './nestedState';
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
const _done = (cb, route, index) => cb(null, null, FD_DONE, route, index);
const _err = (cb, route, index, errorObject = {}) => cb(errorObject, null, null, route, index);
const _redirect = (cb, redirectObject) => cb(null, redirectObject);
const _clientRender = (cb, route, index) => cb(null, null, FD_CLIENT_RENDER, route, index);
const _serverRender = (cb, route, index) => {
  if (IS_SERVER) cb(null, null, FD_SERVER_RENDER, route, index);
};

export default (
  routes,
  params,
  store,
  fetchDataCallback,
  stillActive,
  useInitialState,
  initialState = {}
) => {
  const { dispatch, getState } = store;

  if (routes.length > 0) {
    const isHydrated = () => useInitialState;
    forEach(routes, (route, index) => {
      const isMounted = partial(_stillActive, stillActive, route, index);
      const done = partial(_done, fetchDataCallback, route, index);
      const clientRender = partial(_clientRender, fetchDataCallback, route, index);
      const serverRender = partial(_serverRender, fetchDataCallback, route, index);
      const err = partial(_err, fetchDataCallback, route, index);
      const redirect = partial(_redirect, fetchDataCallback);
      const hydratedDataForRoute = () => {
        if (useInitialState) return applicationState(initialState, index);
        return null;
      };

      if (route.fetchData) {
        route.fetchData(done, {
          clientRender, serverRender, redirect, err,
          params, dispatch, getState, isMounted, isClient,
          isHydrated, hydratedDataForRoute, isServer,
        });
      } else {
        done();
      }
    });
  }
};
