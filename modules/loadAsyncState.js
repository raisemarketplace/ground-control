import { forEach, partial } from 'lodash';

const _stillActive = (__stillActive, route, index) => __stillActive(route, index);
const _done = (cb, route, index) => cb('done', route, index);
const _clientRender = (cb, route, index) => cb('client', route, index);
const _serverRender = (cb, route, index) => cb('server', route, index);

const DEFAULT_STILL_ACTIVE = () => true;
const DEFAULT_CLIENT_HYDRATED = () => false;

const IS_CLIENT = typeof window !== 'undefined';
const IS_SERVER = !IS_CLIENT;
const isClient = () => IS_CLIENT;
const isServer = () => IS_SERVER;

export default (routes, params, dispatch, cb, stillActive = DEFAULT_STILL_ACTIVE, clientHydrated = DEFAULT_CLIENT_HYDRATED) => {
  if (routes.length > 0) {
    forEach(routes, (route, index) => {
      const isMounted = partial(_stillActive, stillActive, route, index);
      const done = partial(_done, cb, route, index);
      const clientRender = partial(_clientRender, cb, route, index);
      const serverRender = partial(_serverRender, cb, route, index);

      if (route.fetchData) {
        route.fetchData(done, {
          params,
          dispatch,
          isMounted,
          clientRender,
          clientHydrated,
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
