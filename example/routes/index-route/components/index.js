/* eslint-disable new-cap */

import React from 'react';
import { createReducer } from 'redux-act';
import { combineReducers } from 'redux';
import { Map } from 'immutable';

import createActions from 'example/utils/createActions';
import { routeStyle } from 'example/utils/style';

export const actions = createActions(['update']);

const palindrome = 'tacocat';

const forwards = createReducer({
  [actions.update]: (state, payload) => {
    return state.set('value', payload);
  },
}, Map({ value: palindrome })); // support for immutable.js/etc w/ hydrationSerializer

const backwards = createReducer({
  [actions.update]: (state, payload) => {
    return payload.split('').reverse().join('');
  },
}, palindrome);

export const reducer = combineReducers({ // and for combinedReducers. whatever you want
  forwards,
  backwards,
});

export default props => {
  const { dispatch, data } = props;
  const valueForwards = data.forwards.get('value');
  const valueBackwards = data.backwards;

  return (
    <div style={routeStyle}>
      <p style={{marginTop: 0}}>{valueBackwards}</p>
      <input
        type="text"
        style={{width: '100%', padding: 10, boxSizing: 'border-box'}}
        value={valueForwards}
        onChange={(e) => {
          dispatch(actions.update(e.target.value));
        }}
        />
    </div>
  );
};
