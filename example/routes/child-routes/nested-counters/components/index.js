import React from 'react';
import { IndexLink, Link } from 'react-router';
import { createReducer } from 'redux-act';
import { connect } from 'react-redux';
import { merge } from 'lodash';
import { renderNestedRoute, stateAtDepth } from 'modules/AsyncNestedRedux';

import { actions as appActions } from 'example/routes/components/index';
import createActions from 'example/utils/createActions';
import { routeStyle, navStyle, linkStyle, activeLinkStyle } from 'example/utils/style';

export const actions = createActions('incr');
export const reducer = createReducer({
  [actions.incr]: (state, payload) => {
    state.counter += payload;
    return merge({}, state);
  },
}, {
  counter: 0,
});

const linkProps = () => ({
  style: linkStyle,
  activeStyle: activeLinkStyle,
});

// if you need parent data to adjust current reducer, use thunk actions
const specialAction = count => (dispatch/* , getState */) => {
  dispatch(appActions.incr(count));
  dispatch(actions.incr(count));
};

const Component = props => {
  const { children, dispatch, data, appData, nestedData } = props;
  return (
    <div style={routeStyle}>
      <div style={navStyle}>
        <IndexLink to="/nested-counters" {...linkProps()}>Nested Counters Home</IndexLink>
        <Link to="/nested-counters/multiply-counter" {...linkProps()}>Multiply Counters (Start at 3 (* 2))</Link>
        <Link to="/nested-counters/square-counter" {...linkProps()}>Square Counters (Start at 3)</Link>
      </div>
      <div>
        <p>
          <span>App Counter: {appData.counter || 0}</span>&nbsp;
          <span>Counter: {data.counter}</span>&nbsp;
          <button onClick={() => { dispatch(specialAction(1)); }}>+</button>
        </p>
        <div>
          {renderNestedRoute(children, nestedData, dispatch)}
        </div>
      </div>
    </div>
  );
};

// if you want access in view to higher level app state, just connect
export default connect(state => ({
  appData: stateAtDepth(state, 0) || {},
}))(Component);
