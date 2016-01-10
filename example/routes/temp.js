/* eslint-disable react/no-multi-comp, no-console, no-unused-vars */

import React from 'react';
import createActions from './../utils/createActions';
import { createReducer } from 'redux-act';
import { merge } from 'lodash';
import { connect } from 'react-redux';
import { renderChildren, simpleConnect } from './../../modules/AsyncRedux';
import { Link } from 'react-router';

const routeStyle = {
  margin: 10,
  padding: 10,
  border: '1px solid black',
};

const appActions = createActions(['incr']);
const appReducer = createReducer({
  [appActions.incr]: (state, payload) => {
    state.appCounter += 1;
    return merge({}, state);
  },
}, { appCounter: 0 });
const _App = props => {
  const { children, dispatch, data } = props;
  return (
    <div style={routeStyle}>
      <p onClick={() => {dispatch(appActions.incr());}}>app: {data.appCounter}</p>
      <div>{renderChildren(children, dispatch, data)}</div>
    </div>
  );
};
const App = simpleConnect(connect, _App);

const caLoader = () => (<div>Custom loader!</div>);
const caActions = createActions(['incr']);
const caReducer = createReducer({
  [caActions.incr]: (state, payload) => {
    state.aCounter += 1;
    return merge({}, state);
  },
}, { aCounter: 0 });
const caFetch = (params, dispatch, stillActive, done, clientRender, clientHydrated, serverRender) => {
  setTimeout(() => {
    setTimeout(() => {
      setTimeout(() => {
        console.log('stillActive', stillActive());
        console.log('clientHydrated', clientHydrated);

        console.log('done');
        done();
      }, 1000);

      console.log('serverRender');
      serverRender();
    }, 1000);

    console.log('clientRender');
    clientRender();
  }, 1000);
};
const ComponentA = props => {
  const { data, dispatch, loading } = props;
  if (!data) return <div/>;
  return (
    <div style={routeStyle}>
      <p>Loading: {loading ? 'yes' : 'no'}</p>
      <p onClick={() => {dispatch(caActions.incr());}}>a: {data.aCounter}</p>
      <Link to="/route-2">b</Link>
    </div>
  );
};

const cbActions = createActions(['incr']);
const cbReducer = createReducer({
  [cbActions.incr]: (state, payload) => {
    state.bCounter += 1;
    return merge({}, state);
  },
}, { bCounter: 0 });
const _ComponentB = props => {
  const { children, dispatch, data, appData } = props;
  if (!data) return <div/>;
  return (
    <div style={routeStyle}>
      <p onClick={() => {dispatch(appActions.incr());}}>app: {appData.appCounter}</p>
      <p onClick={() => {dispatch(cbActions.incr());}}>b: {data.bCounter}</p>
      <Link to="/">a</Link>
      <div>{renderChildren(children, dispatch, data)}</div>
    </div>
  );
};
const ComponentB = connect(state => {
  return {
    appData: state,
  };
})(_ComponentB);

const cb1Actions = createActions(['incr']);
const cb1Reducer = createReducer({
  [cb1Actions.incr]: (state, payload) => {
    state.cb1Counter += 1;
    return merge({}, state);
  },
}, { cb1Counter: 0 });
const cb1Fetch = (params, dispatch, stillActive, done, clientRender, clientHydrated, serverRender) => {
  clientRender();
  setTimeout(() => {
    if (stillActive()) {
      done();
    }
  }, 2500);
};
const ComponentB1 = props => {
  const { data, dispatch, loading } = props;
  if (!data) return <div/>;
  return (
    <div style={routeStyle}>
      <p>Loading: {loading ? 'yes' : 'no'}</p>
      <p onClick={() => {dispatch(cb1Actions.incr());}}>a: {data.cb1Counter}</p>
      <Link to="/route-2/nested-route">b2</Link>
    </div>
  );
};

const cb2Actions = createActions(['incr']);
const cb2Reducer = createReducer({
  [cb2Actions.incr]: (state, payload) => {
    state.cb2Counter += 1;
    return merge({}, state);
  },
}, { cb2Counter: 0 });
const ComponentB2 = props => {
  const { data, dispatch } = props;
  if (!data) return <div/>;
  return (
    <div style={routeStyle}>
      <p onClick={() => {dispatch(cb2Actions.incr());}}>a: {data.cb2Counter}</p>
      <Link to="/route-2">b1</Link>
    </div>
  );
};

export {
  App, appReducer,
  ComponentA, caFetch, caReducer, caLoader,
  ComponentB, cbReducer,
  ComponentB1, cb1Fetch, cb1Reducer,
  ComponentB2, cb2Reducer,
};
