/* eslint-disable react/no-multi-comp, no-console */

import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

export const initializeStore = () => {
  const baseReducer = state => state;
  const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
  const store = createStoreWithMiddleware(baseReducer, { overWrittenWhenAppRenders: '!!!' });
  const s = () => console.log('STATE --->', JSON.stringify(store.getState()));
  store.subscribe(s);
  s();
  return store;
};

export const createApp = (store, routerContext) => (
  <Provider store={store} children={routerContext} />
);
