import React from 'react';
import { createReducer } from 'redux-act';

import createActions from 'examples/utils/createActions';
import { routeStyle } from 'examples/utils/style';

export const actions = createActions('SquareCounter', ['incr']);
export const reducer = createReducer({
  [actions.incr]: (state) => {
    return { ...state, counter: state.counter * state.counter };
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
