import React from 'react';
import { IndexLink, Link } from 'react-router';
import { createReducer } from 'redux-act';
import { merge } from 'lodash';
import { renderNestedRoute } from 'modules/AsyncNestedRedux';

import createActions from 'example/utils/createActions';
import { routeStyle, navStyle, linkStyle, activeLinkStyle } from 'example/utils/style';

export const actions = createActions('incr');
export const reducer = createReducer({
  [actions.incr]: (state, payload) => {
    if (!state.counter) state.counter = 0;
    state.counter += payload;
    return merge({}, state);
  },
}, {});

const linkProps = () => ({
  style: linkStyle,
  activeStyle: activeLinkStyle,
});

export default props => {
  const { children, nestedData, dispatch } = props;
  return (
    <div style={routeStyle}>
      <h4 style={{ margin: '0 0 20px' }}>AsyncNestedRedux - Example</h4>
      <div style={navStyle}>
        <IndexLink to="/" {...linkProps()}>Palindrome (Combined / Immutable Reducers Demo)</IndexLink>
        <Link to="/google-books" {...linkProps()}>Google Books (Data Fetching Demo)</Link>
        <Link to="/nested-counters" {...linkProps()}>Nested Counters (Nested Reducers Demo)</Link>
      </div>
      <div>
        {renderNestedRoute(children, nestedData, dispatch)}
      </div>
    </div>
  );
};
