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
    forEach(routes, (route, depth) => {
      const done = partial(_done, asyncEnterCallback, route, depth);
      if (route.asyncEnter && depth >= replaceAtDepth) {
        const isInitialLoad = () => useInitialState;
        const isMounted = partial(_stillActive, stillActive, route, depth);
        const clientRender = partial(_clientRender, asyncEnterCallback, route, depth);
        const serverRender = partial(_serverRender, asyncEnterCallback, route, depth);
        const err = partial(_err, asyncEnterCallback, route, depth);
        const redirect = partial(_redirect, asyncEnterCallback);
        const getReducerState = () => getNestedState(currentState, depth);

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
