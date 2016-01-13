import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory } from 'react-router';
import { createDevTools } from 'redux-devtools';
import LogMonitor from 'redux-devtools-log-monitor';
import DockMonitor from 'redux-devtools-dock-monitor';
import AsyncNestedRedux from 'modules/AsyncNestedRedux';
import domready from 'domready';

// import { syncHistory, routeReducer } from 'redux-simple-router';

// if you use immutable for route reducers, set a property on route & use app level deserializer (optional)
// ...if you need to do something crazy like use combineReducers & immutable you can specify
// that on the route itself (see example/index-route/index.js)
const deserializer = (clientRoute, data) => {
  // if (clientRoute.deserializeImmutable) return fromJS(data);
  return data;
};

const DevTools = createDevTools(
  <DockMonitor toggleVisibilityKey="ctrl-h" changePositionKey="ctrl-q">
    <LogMonitor theme="solarized" />
  </DockMonitor>
);

const reducers = {
  somethingElse: (state = 'hello') => state,
};

const routerProps = (routes, history, store) => ({
  routes,
  history,
  render: props => (
    <AsyncNestedRedux
        {...props}
        store={store}
        deserializer={deserializer}
        reducers={reducers}
        />
  ),
});

export default (useDevTools, routes, initializeStore, createApp) => {
  const store = initializeStore(reducers, useDevTools ? DevTools.instrument() : undefined);
  const app = createApp(store, <Router {...routerProps(routes, browserHistory, store)} />);

  domready(() => {
    render(app, document.getElementById('app'));
    if (useDevTools) render(<DevTools store={store} />, document.getElementById('dev'));
  });
};
