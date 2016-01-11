/* eslint-disable new-cap */

import React from 'react';
import { createReducer } from 'redux-act';
import { Map } from 'immutable';

import createActions from 'example/utils/createActions';
import { routeStyle } from 'example/utils/style';

export const actions = createActions(['update']);
const reducer = createReducer({
  [actions.update]: (state, payload) => {
    return state.set('value', payload);
  },
}, Map({ value: 'Simple route with an input...' }));
reducer.immutable = true; // support for immutable.js/etc w/ hydrationSerializer
export { reducer };

export default props => {
  const { dispatch, data } = props;
  const value = data.get('value');

  return (
    <div style={routeStyle}>
      <p style={{marginTop: 0}}>{value}</p>
      <input
        type="text"
        style={{width: '100%', padding: 10, boxSizing: 'border-box'}}
        value={value}
        onChange={(e) => {
          dispatch(actions.update(e.target.value));
        }}
        />
    </div>
  );
};
