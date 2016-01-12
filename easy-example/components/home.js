import React from 'react';
import { createReducer } from 'redux-act';
import { merge } from 'lodash';

import createActions from 'example/utils/createActions';
import { routeStyle } from 'example/utils/style';

export const actions = createActions('Home', ['incr']);
export const reducer = createReducer({
  [actions.incr]: (state) => {
    const updatedState = merge({}, state);
    updatedState.counter++;
    return updatedState;
  },
}, { counter: 0 });

export default props => {
  const { dispatch, data } = props;
  return (
    <div style={routeStyle}>
      <span>Counter: {data.counter}</span>&nbsp;
      <button onClick={() => { dispatch(actions.incr()); }}>+</button>
    </div>
  );
};
