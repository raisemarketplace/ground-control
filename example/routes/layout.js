import React from 'react';
import { renderChildren } from 'modules/AsyncRedux';

import routeStyle from 'example/utils/routeStyle';
import createActions from 'example/utils/createActions';

export const actions = createActions(['incr']);

export default props => {
  const { children, dispatch, data } = props;
  return (
    <div style={routeStyle}>
      <p onClick={() => {dispatch(actions.incr(3));}}>app: {data.counter}</p>
      <div>{renderChildren(children, dispatch, data)}</div>
    </div>
  );
};
