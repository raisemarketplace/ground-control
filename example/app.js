/* eslint-disable react/no-multi-comp, no-console, no-unused-vars, no-unreachable */

import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, Link, browserHistory, RouterContext } from 'react-router';
import { createReducer } from 'redux-act';
import createActions from './createActions';
import { createStore } from 'redux';
import { reduce, assign, merge } from 'lodash';
import AsyncRedux, { makeHydratable, simpleConnect, renderChildren } from 'async-redux';
import { Provider, connect } from 'react-redux';

const baseReducer = createReducer({}, {});
const store = createStore(makeHydratable(baseReducer));
const s = () => console.log('STATE --->', JSON.stringify(store.getState()));
store.subscribe(s);
s();

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

const caActions = createActions(['incr']);
const caReducer = createReducer({
  [caActions.incr]: (state, payload) => {
    state.aCounter += 1;
    return merge({}, state);
  },
}, { aCounter: 0 });
const caFetch = (params, dispatch, stillActive, done, clientRender, clientHydrated, serverRender) => {
  console.log('sa', stillActive());
  setTimeout(() => {
    setTimeout(() => {
      done();
    }, 2500);
    clientRender();
  }, 500);
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

const loader = () => (<div>Custom loader!</div>);

render((
  <Provider store={store}>
    <Router
      history={browserHistory}
      render={(props) => (
        <AsyncRedux {...props} store={store} />
      )}>
      <Route path="/" component={App} reducer={appReducer}>
        <IndexRoute component={ComponentA} fetchData={caFetch} reducer={caReducer} loader={loader} />
        <Route path="/route-2" component={ComponentB} reducer={cbReducer}>
          <IndexRoute component={ComponentB1} fetchData={cb1Fetch} reducer={cb1Reducer} />
          <Route path="/route-2/nested-route" component={ComponentB2} reducer={cb2Reducer} />
        </Route>
      </Route>
    </Router>
  </Provider>
), document.getElementById('app'));
