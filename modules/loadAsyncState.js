import { forEach, partial } from 'lodash';
import { atDepth } from './stateAtDepth';

const DEFAULT_STILL_ACTIVE = () => true;
const DEFAULT_HYDRATED_DATA = () => null;

const IS_CLIENT = typeof window !== 'undefined';
const IS_SERVER = !IS_CLIENT;
const isClient = () => IS_CLIENT;
const isServer = () => IS_SERVER;

const _stillActive = (__stillActive, route, index) => __stillActive(route, index);
const _done = (cb, route, index) => cb('done', route, index);
const _clientRender = (cb, route, index) => cb('client', route, index);
const _serverRender = (cb, route, index) => {
  if (IS_SERVER) {
    cb('server', route, index);
  }
};

export default (routes, params, dispatch, cb, stillActive = DEFAULT_STILL_ACTIVE, getHydratedData = DEFAULT_HYDRATED_DATA) => {
  if (routes.length > 0) {
    const hydratedData = getHydratedData();
    const hydrated = () => !!hydratedData;
    forEach(routes, (route, index) => {
      const isMounted = partial(_stillActive, stillActive, route, index);
      const done = partial(_done, cb, route, index);
      const clientRender = partial(_clientRender, cb, route, index);
      const serverRender = partial(_serverRender, cb, route, index);
      const hydratedDataForRoute = () => {
        if (hydratedData) {
          return atDepth(hydratedData.state, index);
        }
        return null;
      };

      if (route.fetchData) {
        route.fetchData(done, {
          params,
          dispatch,
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
