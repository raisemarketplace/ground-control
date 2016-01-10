import React from 'react';
import { map } from 'lodash';

const defaultLoader = () => <div/>;

export default (routes) => {
  return map(routes, route => {
    if (!route.normalized) {
      route.normalized = true;

      if (!route.reducer) {
        route.reducer = state => state;
      }

      if (!route.loader) {
        route.loader = defaultLoader;
      }

      route.blockRender = true;
      route.loading = true;
    }

    return route;
  });
};
