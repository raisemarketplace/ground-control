import React from 'react';
import { IndexLink, Link } from 'react-router';
import { routeStyle, navStyle, linkStyle, activeLinkStyle } from 'examples/utils/style';

const linkProps = () => ({
  style: linkStyle,
  activeStyle: activeLinkStyle,
});

export default props => {
  const { children } = props;
  return (
    <div style={routeStyle}>
      <h4 style={{ margin: '0 0 20px' }}>AsyncNestedRedux - Easy Example</h4>
      <div style={navStyle}>
        <IndexLink to="/" {...linkProps()}>Home</IndexLink>
        <Link to="/route-2" {...linkProps()}>Route 2</Link>
      </div>
      <div>
        {children}
      </div>
    </div>
  );
};
