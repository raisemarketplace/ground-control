import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import AsyncNestedRedux, { loadStateOnClient } from 'modules/AsyncNestedRedux';
import createStore from 'examples/createStore';
import DevTools from 'examples/utils/devtools';
import domready from 'domready';

// if you use immutable for route reducers, set a property on route & use app level deserializer (optional)
// ...if you need to do something crazy like use combineReducers & immutable you can specify
// that on the route itself (see examples/full/index-route/index.js)
const deserializer = (clientRoute, data) => {
  // if (clientRoute.deserializeImmutable) return fromJS(data);
  return data;
};

export default ({
  additionalReducers,
  enableReduxSimpleRouter,
  enableDevTools,
  enableThunk,
  routes,
}) => {
  domready(() => {
    loadStateOnClient(routes, initialData => {
      const { initialState } = initialData;
      const { store, reducers} = createStore({
        additionalReducers,
        enableReduxSimpleRouter,
        enableDevTools,
        enableThunk,
        initialState,
        history: browserHistory,
      });

      render((
        <Provider store={store}>
          <Router
              routes={routes}
              history={browserHistory}
              render={(props) => (
                <AsyncNestedRedux
                    {...props}
                    store={store}
                    initialData={initialData}
                    reducers={reducers}
                    />
              )}/>
        </Provider>
      ), document.getElementById('app'));

      if (enableDevTools) {
        render((
          <DevTools store={store} />
        ), document.getElementById('dev'));
      }
    }, deserializer);
  });
};
