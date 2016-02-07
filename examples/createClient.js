import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory as history } from 'react-router';
import GroundControl from 'modules/GroundControl';
import createStore from 'examples/createStore';
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
  additionalReducers, enableReactRouterRedux,
  enableDevTools, enableThunk, routes,
}) => {
  domready(() => {
    const { store, reducers} = createStore({
      additionalReducers, enableReactRouterRedux,
      enableDevTools, enableThunk, history,
    });

    const groundControlProps = props => ({
      ...props, store, serializer,
      deserializer, reducers,
    });

    const routerProps = () => ({
      routes, history,
      render: props => {
        return <GroundControl {...groundControlProps(props)} />;
      },
    });

    const router = <Router {...routerProps()} />;
    render(router, document.getElementById('app'));
  });
};
