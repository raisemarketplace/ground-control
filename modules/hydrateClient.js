/* global __INITIAL_DATA__ */

export default () => {
  const hydratedData = typeof __INITIAL_DATA__ !== 'undefined' ? __INITIAL_DATA__ : null;
  let state = null;
  let routes = null;

  if (hydratedData) {
    state = hydratedData.state;
    routes = hydratedData.routes;
  }

  return {
    state,
    routes,
  };
};
