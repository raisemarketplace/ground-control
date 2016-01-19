import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory } from 'react-router';
import GroundControl, { loadStateOnClient } from 'modules/GroundControl';
import createStore from 'examples/createStore';
import DevTools from 'examples/utils/devtools';
import domready from 'domready';

// if you use immutable for route reducers, set a property on route & use app level deserializer (optional)
// ...if you need to do something crazy like use combineReducers & immutable you can specify
// that on the route itself (see examples/full/index-route/index.js)

const deserializer = (route, data) => {
  // if (route.deserializeImmutable) return fromJS(data);
  return data;
};

const serializer = (route, data) => {
  // if (route.serializeImmutable) return data.toJS();
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
    loadStateOnClient({ routes, deserializer }, initialData => {
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
        <Router
            routes={routes}
            history={browserHistory}
            render={(props) => (
              <GroundControl
                  {...props}
                  store={store}
                  initialData={initialData}
                  serializer={serializer}
                  reducers={reducers}
                  />
            )}/>
      ), document.getElementById('app'));

      if (enableDevTools) {
        render((
          <DevTools store={store} />
        ), document.getElementById('dev'));
      }
    });
  });
};
