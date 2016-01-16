import React from 'react';
import { forEach } from 'lodash';
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

  return (
    <Component
        {...props}
        loading={route.loading}
        loadingError={route.loadingError}
        getState={store.getState}
        dispatch={dispatch}
        depth={depth}
        data={data}
        />
  );
};
