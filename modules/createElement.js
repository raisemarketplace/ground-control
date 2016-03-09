import React from 'react';
import { partial } from 'lodash';
import { getNestedStateAndMeta } from './nestedState';

const getStateAndMetaAndSerialize = (depth, finalGetNestedState, routes, serializer) => {
  const nestedStateAndMeta = finalGetNestedState(depth);
  const { state, meta } = nestedStateAndMeta;

  const routeForRequested = !!routes[depth] ? routes[depth] : null;
  if (routeForRequested) {
    if (routeForRequested.serializer) return { state: routeForRequested.serializer(state), meta };
    return { state: serializer(routeForRequested, state), meta };
  }

  return { state, meta };
};

export default (store, serializer, Component, props) => {
  const { routes, route } = props; // eslint-disable-line

  const storeState = store.getState();
  const depth = routes.indexOf(route);

  const finalGetNestedState = partial(getNestedStateAndMeta, storeState);
  const { state: routeState, meta: routeMeta } = getStateAndMetaAndSerialize(depth, finalGetNestedState, routes, serializer);

  const blockRender = routeMeta.blockRender;
  if (blockRender) return route.loader(props);

  const loading = routeMeta.loading;
  const loadingError = routeMeta.loadingError;

  const componentProps = {
    ...props,
    dispatch: store.dispatch,
    loadingError,
    loading,
    data: routeState,
  };

  return <Component {...componentProps} />;
};
