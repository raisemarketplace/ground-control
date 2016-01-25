import { forEach, partial } from 'lodash';
import { getNestedState } from './nestedState';
import {
  FD_SERVER_RENDER, FD_CLIENT_RENDER,
  FD_DONE, IS_CLIENT, IS_SERVER,
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
  routes, routeParams, queryParams,
  store, asyncEnterCallback, stillActive,
  useInitialState, replaceAtDepth = 0
) => {
  const { dispatch, getState } = store;
  const currentState = store.getState();

  if (routes.length > 0) {
    forEach(routes, (route, index) => {
      const done = partial(_done, asyncEnterCallback, route, index);

      if (route.asyncEnter && index >= replaceAtDepth) {
        const isInitialLoad = () => useInitialState;
        const isMounted = partial(_stillActive, stillActive, route, index);
        const clientRender = partial(_clientRender, asyncEnterCallback, route, index);
        const serverRender = partial(_serverRender, asyncEnterCallback, route, index);
        const err = partial(_err, asyncEnterCallback, route, index);
        const redirect = partial(_redirect, asyncEnterCallback);
        const getReducerState = () => getNestedState(currentState, index);

        route.asyncEnter(done, {
          clientRender, serverRender, redirect, err, routeParams,
          queryParams, dispatch, getState, isMounted, isClient,
          isInitialLoad, getReducerState, isServer,
        });
      } else {
        done();
      }
    });
  }
};
