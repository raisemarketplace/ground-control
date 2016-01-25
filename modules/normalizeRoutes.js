import React from 'react';
import { map, partial } from 'lodash';
import { getNestedState } from './nestedState';
import { ROOT_DEPTH } from './constants';

const defaultLoader = () => <div/>;

export default (routes, props, startIndex = ROOT_DEPTH, force = false) => {
  return map(routes, (route, index) => {
    if (!route.normalized || force) {
      if (props && route.onLeave) {
        const { location: { query }, params, store } = props;
        const getReducerState = () => getNestedState(store.getState(), startIndex + index);
        route.onLeave = partial(route.onLeave, {
          getReducerState,
          params,
          query,
        });
      }

      if (!route.reducer) route.reducer = state => state;
      if (!route.loader) route.loader = defaultLoader;

      route.loading = true;
      route.loadingError = null;
      route.blockRender = true;
      route.normalized = true;
    }

    return route;
  });
};
