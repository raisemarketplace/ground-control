/* eslint-disable react/no-multi-comp, no-console */

import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

export const initializeStore = () => {
  const baseReducer = state => state;
  const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
  // initial state works if using redux-devtools, etc. but we hydrate for you in loadAsyncState
  // set your default data on the route
  const initialState = { overWrittenWhenAppRenders: 'if it doesn\'t match expected shape!' };
  const store = createStoreWithMiddleware(baseReducer, initialState);
  const logState = () => console.log('STATE --->', JSON.stringify(store.getState()));
  store.subscribe(logState);
  logState();
  return store;
};

export const createApp = (store, routerContext) => (
  <Provider store={store} children={routerContext} />
);
