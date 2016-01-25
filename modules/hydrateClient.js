/* global __INITIAL_DATA__ */

import matchRoutes from 'react-router/lib/matchRoutes';
import { createRoutes } from 'react-router/lib/RouteUtils';
import { browserHistory } from 'react-router';
import normalizeRoutes from './normalizeRoutes';
import deserialize from './deserialize';
import { IS_CLIENT } from './constants';
import { map } from 'lodash';

const initialData = IS_CLIENT && typeof __INITIAL_DATA__ !== 'undefined' ? __INITIAL_DATA__ : null;
const defaultData = {};
let cachedData = null;

const deserializeRoutes = (props, routes, hydratedRoutes) => {
  return map(normalizeRoutes(routes, props), (route, index) => {
    const hydratedRoute = hydratedRoutes[index];
    route.blockRender = hydratedRoute.blockRender;
    route.loadingError = hydratedRoute.loadingError;
    route.loading = hydratedRoute.loading;
    return route;
  });
};

export default (props, routes, deserializer) => {
  if (cachedData) return cachedData;

  if (initialData) {
    const {
      initialState,
      initialRoutes,
    } = initialData;

    const unlisten = browserHistory.listen(location => {
      matchRoutes(createRoutes(routes), location, (err, matchedRoutes) => {
        if (err) return;
        const hydratedRoutes = deserializeRoutes(props, matchedRoutes.routes, initialRoutes);
        const hydratedState = deserialize(initialState, hydratedRoutes, deserializer);
        cachedData = { hydratedRoutes, hydratedState };
      });
    });

    unlisten();
    return cachedData;
  }

  return defaultData;
};
