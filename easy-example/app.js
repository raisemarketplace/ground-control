/* eslint-disable react/no-multi-comp, no-console */

import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

export const initializeStore = () => {
  const baseReducer = state => state;
  const store = createStore(baseReducer);
  return store;
};

export const createApp = (store, routerContext) => (
  <Provider store={store} children={routerContext} />
);
