import React from 'react';
import { partial, forEach, isNumber } from 'lodash';
import { getNestedState } from './nestedState';
import { ROOT_DEPTH } from './constants';

export default (store, serializer, Component, props) => {
  const { routes, route } = props;

  if (route.blockRender) {
    return route.loader(props);
  }

  let depth;
  forEach(routes, (_, index) => {
    if (routes[index] === route) {
      depth = index;
    }
  });

  const state = store.getState();
  const dispatch = store.dispatch;
  const finalGetNestedState = partial(getNestedState, state);
  const getStateAndSerialize = requestedDepth => {
    const nestedState = finalGetNestedState(requestedDepth);
    const routeForRequested = !!routes[requestedDepth] ? routes[requestedDepth] : null;
    if (routeForRequested) {
      if (routeForRequested.serializer) {
        return routeForRequested.serializer(nestedState);
      }
      return serializer(routeForRequested, nestedState);
    }

    return nestedState;
  };

  const data = getStateAndSerialize(depth);
  const rootData = getStateAndSerialize(ROOT_DEPTH);

  const getRelativeParentData = (requestedDepth = 1) => {
    if (!isNumber(requestedDepth)) return null;
    return getStateAndSerialize(depth - Math.abs(requestedDepth));
  };

  return (
    <Component
        {...props}
        loading={route.loading}
        loadingError={route.loadingError}
        getRelativeParentData={getRelativeParentData}
        dispatch={dispatch}
        rootData={rootData}
        data={data}
        />
  );
};
