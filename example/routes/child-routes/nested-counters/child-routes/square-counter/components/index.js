import React from 'react';
import { createReducer } from 'redux-act';
import { merge } from 'lodash';

import createActions from 'example/utils/createActions';
import { routeStyle } from 'example/utils/style';

export const actions = createActions('SquareCounter', ['incr']);
export const reducer = createReducer({
  [actions.incr]: (state) => {
    const updatedState = merge({}, state);
    updatedState.counter *= state.counter;
    return updatedState;
  },
}, {
  counter: 3,
});

export default props => {
  const { data, dispatch } = props;
  return (
    <div style={routeStyle}>
      <p>
        <span>Counter: {data.counter}</span>&nbsp;
        <button onClick={() => { dispatch(actions.incr()); }}>+</button>
      </p>
    </div>
  );
};
