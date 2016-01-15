import React from 'react';
import { createReducer } from 'redux-act';
import { merge } from 'lodash';

import createActions from 'examples/utils/createActions';
import { routeStyle } from 'examples/utils/style';

export const actions = createActions('NestedCountersIndex', ['incr']);
export const reducer = createReducer({
  [actions.incr]: (state) => {
    const updatedState = merge({}, state);
    updatedState.counter += 1;
    return updatedState;
  },
}, {
  counter: 0,
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
