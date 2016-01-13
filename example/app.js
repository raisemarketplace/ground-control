/* eslint-disable react/no-multi-comp, no-console */

import React from 'react';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

const defaultStoreEnhancer = s => s;
export const initializeStore = (devtools = defaultStoreEnhancer) => {
  const baseReducer = state => state;
  const finalCreateStore = compose(
    applyMiddleware(thunk),
    devtools
  )(createStore);

  // initial state works if using redux-devtools, etc. async-nested-redux hydrates client for you.
  const initialState = { overWrittenWhenAppRenders: 'if it doesn\'t match expected shape!' };
  return finalCreateStore(baseReducer, initialState);
};

export const createApp = (store, routerContext) => (
  <Provider store={store}>{routerContext}</Provider>
);
