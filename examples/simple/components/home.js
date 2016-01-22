import React from 'react';
import { routeStyle } from 'examples/utils/style';

const initialState = { counter: 0 };

export const actions = {
  incr: count => ({ type: 'HomeIncr', payload: count }),
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
  case 'HomeIncr':
    return { ...state, counter: state.counter + action.payload };
  default:
    return state;
  }
};

export default props => {
  const { dispatch, data } = props;
  return (
    <div style={routeStyle}>
      <span>Counter: {data.counter}</span>&nbsp;
      <button onClick={() => { dispatch(actions.incr(1)); }}>+</button>
    </div>
  );
};
