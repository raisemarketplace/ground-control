import React from 'react';
import { forEach, isNumber } from 'lodash';
import { getNestedState } from './nestedState';

export default (store, Component, props) => {
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
  const data = getNestedState(state, depth);
  const parentData = getNestedState(state, depth - 1);
  const getParentData = (requestedDepth = 1) => {
    if (!isNumber(requestedDepth) || requestedDepth === 0) return null;
    return getNestedState(Math.abs(requestedDepth));
  };

  return (
    <Component
        {...props}
        loading={route.loading}
        loadingError={route.loadingError}
        getParentData={getParentData}
        parentData={parentData}
        dispatch={dispatch}
        depth={depth}
        data={data}
        />
  );
};
