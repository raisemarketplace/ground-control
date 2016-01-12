/* eslint-disable react/no-multi-comp, no-console */

import React from 'react';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

import { createDevTools } from 'redux-devtools';
import LogMonitor from 'redux-devtools-log-monitor';
import DockMonitor from 'redux-devtools-dock-monitor';

const DevTools = createDevTools(
  <DockMonitor toggleVisibilityKey='ctrl-h' changePositionKey='ctrl-q'>
    <LogMonitor theme='solarized' />
  </DockMonitor>
);

export const initializeStore = () => {
  const baseReducer = state => state;
  const finalCreateStore = compose(
    applyMiddleware(thunk)
    // DevTools.instrument()
  )(createStore);

  // initial state works if using redux-devtools, etc. async-nested-redux hydrates
  // client for you. set default data using route api.
  const initialState = { overWrittenWhenAppRenders: 'if it doesn\'t match expected shape!' };
  const store = finalCreateStore(baseReducer, initialState);

  const logState = () => console.log('STATE --->', JSON.stringify(store.getState()));
  store.subscribe(logState);
  logState();

  return store;
};

export const createApp = (store, routerContext) => (
  <Provider store={store}>
    <div>
      <div children={routerContext} />
      {/* <DevTools /> */}
    </div>
  </Provider>
);
