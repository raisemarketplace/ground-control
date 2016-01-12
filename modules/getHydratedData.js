/* global __INITIAL_DATA__ */

export default initialPageLoad => {
  let state = null;
  let routes = null;
  let useHydratedData = false;

  if (initialPageLoad) {
    const hydratedData = typeof __INITIAL_DATA__ !== 'undefined' ? __INITIAL_DATA__ : null;
    if (hydratedData) {
      useHydratedData = true;
      state = hydratedData.state;
      routes = hydratedData.routes;
    }
  }

  return {
    useHydratedData,
    state,
    routes,
  };
};
