import React from 'react';
import { IndexLink, Link } from 'react-router';
import { createReducer } from 'redux-act';

import createActions from 'examples/utils/createActions';
import { routeStyle, navStyle, linkStyle, inlineLinkStyle, errorLinkStyle, activeLinkStyle } from 'examples/utils/style';

export const actions = createActions('Index', ['incr']);
export const reducer = createReducer({
  [actions.incr]: (state, payload) => {
    const counter = (state.counter || 0) + payload;
    return { ...state, counter };
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
  const { children } = props;
  return (
    <div style={routeStyle}>
      <h4 style={{ margin: '0 0 20px' }}>GroundControl - Example</h4>
      <div style={navStyle}>
        <IndexLink to="/" {...linkProps()}>Palindrome (Combined / Immutable Reducers Demo)</IndexLink>
        <div style={{ marginBottom: 10 }}>
          <Link to={{ pathname: '/google-books/fiction/javascript' }} {...inlineLinkProps()}>Google Books (Data Fetching Demo)</Link>
          <Link to={{ pathname: '/google-books/fiction/javascript', query: { error: true }}} {...inlineLinkProps(true)}>(Demo ?error=true)</Link>
          <Link to={{ pathname: '/google-books/fiction/javascript', query: { redirect: true }}} {...inlineLinkProps(true)}>(Demo ?redirect=true)</Link>
        </div>
        <Link to="/nested-counters" {...linkProps()}>Nested Counters (Nested Reducers Demo)</Link>
      </div>
      <div>
        {children}
      </div>
    </div>
  );
};
