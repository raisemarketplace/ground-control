import React from 'react';
import { merge } from 'lodash';
import { routeStyle } from 'examples/full/utils/style';

const initialState = { counter: 0 };

export const actions = {
  incr: count => ({ type: 'HomeIncr', payload: count }),
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
  case 'HomeIncr':
    const updatedState = merge({}, state);
    updatedState.counter += action.payload;
    return updatedState;
  default:
    return state;
  }
};

export default props => {
  const { dispatch, data } = props;
  return (
    <div style={routeStyle}>
      <span>Counter: {data.counter}</span>&nbsp;
      <button onClick={() => { dispatch(actions.incr(2)); }}>+</button>
    </div>
  );
};
