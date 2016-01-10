/* global __INITIAL_DATA__ */

import { HYDRATE } from './constants';

export default store => {
  const initialData = typeof __INITIAL_DATA__ !== 'undefined' ? __INITIAL_DATA__ : null;
  let routes = null;

  if (initialData) {
    const { state } = initialData;
    routes = initialData.routes;
    store.dispatch({ type: HYDRATE, state });
  }

  return {
    didHydrate: !!initialData,
    routes,
  };
};
