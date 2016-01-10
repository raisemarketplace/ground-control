import React from 'react';
import { map } from 'lodash';

const defaultLoader = () => <div/>;

export default (routes, force = false) => {
  return map(routes, route => {
    if (!route.normalized || force) {
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
