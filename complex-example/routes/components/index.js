import React from 'react';
import { IndexLink, Link } from 'react-router';
import { createReducer } from 'redux-act';
import { merge } from 'lodash';
import { renderNestedRoute } from 'modules/AsyncNestedRedux';

import createActions from 'complex-example/utils/createActions';
import { routeStyle, navStyle, linkStyle, inlineLinkStyle, errorLinkStyle, activeLinkStyle } from 'complex-example/utils/style';

export const actions = createActions('Index', ['incr']);
export const reducer = createReducer({
  [actions.incr]: (state, payload) => {
    if (!state.counter) state.counter = 0;
    const updatedState = merge({}, state);
    updatedState.counter += payload;
    return updatedState;
  },
}, {});

const linkProps = () => ({
  style: linkStyle,
  activeStyle: activeLinkStyle,
});

const inlineLinkProps = error => ({
  style: error ? errorLinkStyle : inlineLinkStyle,
  activeStyle: activeLinkStyle,
});

export default props => {
  const { children, nestedData, dispatch } = props;
  return (
    <div style={routeStyle}>
      <h4 style={{ margin: '0 0 20px' }}>AsyncNestedRedux - Example</h4>
      <div style={navStyle}>
        <IndexLink to="/" {...linkProps()}>Palindrome (Combined / Immutable Reducers Demo)</IndexLink>
        <div style={{ marginBottom: 10 }}>
          <Link to={{ pathname: '/google-books' }} {...inlineLinkProps()}>Google Books (Data Fetching Demo)</Link>
          <Link to={{ pathname: '/google-books', query: { error: true }}} {...inlineLinkProps(true)}>(Demo ?error=true)</Link>
          <Link to={{ pathname: '/google-books', query: { redirect: true }}} {...inlineLinkProps(true)}>(Demo ?redirect=true)</Link>
        </div>
        <Link to="/nested-counters" {...linkProps()}>Nested Counters (Nested Reducers Demo)</Link>
      </div>
      <div>
        {renderNestedRoute(children, nestedData, dispatch)}
      </div>
    </div>
  );
};
