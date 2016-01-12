import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory } from 'react-router';
import domready from 'domready';
import AsyncNestedRedux from 'modules/AsyncNestedRedux';

// if you use immutable for route reducers, set a property on route & use app level deserializer (optional)
// ...if you need to do something crazy like use combineReducers & immutable you can specify
// that on the route itself (see example/index-route/index.js)
const deserializer = (clientRoute, data) => {
  // if (clientRoute.deserializeImmutable) return fromJS(data);
  return data;
};

export default (routes, initializeStore, createApp) => {
  const routerProps = (history, store) => ({
    routes,
    history,
    render: props => (
      <AsyncNestedRedux {...props} store={store} deserializer={deserializer} />
    ),
  });

  const store = initializeStore();
  const app = createApp(store, <Router {...routerProps(browserHistory, store)} />);

  domready(() => {
    render(app, document.getElementById('app'));
  });
};
