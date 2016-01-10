import { forEach, partial } from 'lodash';

const _stillActive = (__stillActive, route, index) => __stillActive(route, index);
const _done = (cb, route, index) => cb('done', route, index);
const _clientRender = (cb, route, index) => cb('client', route, index);
const _serverRender = (cb, route, index) => cb('server', route, index);

const DEFAULT_STILL_ACTIVE = () => true;

export default (routes, params, dispatch, cb, __stillActive = DEFAULT_STILL_ACTIVE) => {
  if (routes.length > 0) {
    forEach(routes, (route, index) => {
      const stillActive = partial(_stillActive, __stillActive, route, index);
      const done = partial(_done, cb, route, index);
      const clientRender = partial(_clientRender, cb, route, index);
      const serverRender = partial(_serverRender, cb, route, index);

      if (route.fetchData) {
        const clientHydrated = false;
        route.fetchData(
          params,
          dispatch,
          stillActive,
          done,
          clientRender,
          clientHydrated,
          serverRender
        );
      } else {
        done();
      }
    });
  }
};
