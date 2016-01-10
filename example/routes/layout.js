import React from 'react';
import { IndexLink, Link } from 'react-router';
import { renderChildren } from 'modules/AsyncRedux';

import { routeStyle, navStyle, linkStyle, activeLinkStyle } from 'example/utils/style';

const linkProps = () => ({
  style: linkStyle,
  activeStyle: activeLinkStyle,
});

export default props => {
  const { children, dispatch, data } = props;
  return (
    <div style={routeStyle}>
      <div style={navStyle}>
        <IndexLink to="/" {...linkProps()}>Home</IndexLink>
        <Link to="/google-books" {...linkProps()}>Google Books</Link>
        <Link to="/nested-counters" {...linkProps()}>Nested Counters</Link>
      </div>
      <div>
        {renderChildren(children, dispatch, data)}
      </div>
    </div>
  );
};
