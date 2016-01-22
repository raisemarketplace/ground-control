import React from 'react';
import { IndexLink, Link } from 'react-router';
import { createReducer } from 'redux-act';

import { actions as appActions } from 'examples/full/routes/components/index';
import createActions from 'examples/utils/createActions';
import { routeStyle, navStyle, linkStyle, activeLinkStyle } from 'examples/utils/style';

export const actions = createActions('NestedCounters', ['incr']);
export const reducer = createReducer({
  [actions.incr]: (state, payload) => {
    return { ...state, counter: state.counter + payload };
  },
}, {
  counter: 0,
});

const linkProps = () => ({ style: linkStyle, activeStyle: activeLinkStyle });

// if you need parent data to adjust current reducer, use thunk actions
const specialAction = count => (dispatch/* , getState */) => {
  dispatch(appActions.incr(count));
  dispatch(actions.incr(count));
};

const component = (props, context) => {
  const { children, dispatch, data } = props;
  return (
    <div style={routeStyle}>
      <div style={navStyle}>
        <IndexLink to="/nested-counters" {...linkProps()}>Nested Counters Home</IndexLink>
        <Link to="/nested-counters/multiply-counter" {...linkProps()}>Multiply Counters (Start at 3 (* 2))</Link>
        <Link to="/nested-counters/square-counter" {...linkProps()}>Square Counters (Start at 3)</Link>
      </div>
      <div>
        <p>
          <span>App Counter: {context.appCounter}</span>&nbsp;
          <span>Counter: {data.counter}</span>&nbsp;
          <button onClick={() => { dispatch(specialAction(1)); }}>+</button>
        </p>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

component.contextTypes = {
  appCounter: React.PropTypes.number,
};

export default component;
