/* global __INITIAL_DATA__ */

import { HYDRATE } from './constants';

export default store => {
  const hydratedData = typeof __INITIAL_DATA__ !== 'undefined' ? __INITIAL_DATA__ : null;
  let routes = null;

  if (hydratedData) {
    const { state } = hydratedData;
    routes = hydratedData.routes;
    store.dispatch({ type: HYDRATE, state });
  }

  return {
    hydratedData,
    routes,
  };
};
