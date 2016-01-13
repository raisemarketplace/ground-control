/* eslint-disable react/no-multi-comp, no-console */

import React from 'react';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

const defaultStoreEnhancer = s => s;
export const initializeStore = (reducers, devtools = defaultStoreEnhancer) => {
  const baseReducer = combineReducers(reducers);
  const finalCreateStore = compose(
    applyMiddleware(thunk),
    devtools
  )(createStore);

  return finalCreateStore(baseReducer, {});
};

export const createApp = (store, routerContext) => <Provider store={store} children={routerContext} />;
