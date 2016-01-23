/* eslint-disable new-cap */

import React from 'react';
import { createReducer } from 'redux-act';
import { combineReducers } from 'redux';
import { Map } from 'immutable';

import createActions from 'examples/utils/createActions';
import { routeStyle, flashStyle } from 'examples/utils/style';

export const actions = createActions('IndexRoute', ['update', 'hydrateForwards', 'hydrateBackwards']);

const palindrome = 'tacocat';

const forwards = createReducer({
  [actions.hydrateForwards]: (state, payload) => payload,
  [actions.update]: (state, payload) => state.set('value', payload),
}, Map({ value: palindrome })); // support for immutable.js/etc w/ deserializer

const backwards = createReducer({
  [actions.hydrateBackwards]: (state, payload) => payload,
  [actions.update]: (state, payload) => payload.split('').reverse().join(''),
}, palindrome);

export const reducer = combineReducers({ // and for combinedReducers. whatever you want
  forwards,
  backwards,
});

export default props => {
  const { dispatch, data, location } = props;
  const valueForwards = data.forwards.value;
  const valueBackwards = data.backwards;

  let redirectedMessage;
  if (location.query && location.query.redirected) {
    redirectedMessage = <p style={flashStyle}>Redirected!</p>;
  }

  return (
    <div style={routeStyle}>
      {redirectedMessage}
      <p style={{marginTop: 0}}>{valueBackwards}&nbsp;</p>
      <input
        type="text"
        style={{width: '100%', padding: 10, boxSizing: 'border-box'}}
        value={valueForwards}
        placeholder={palindrome}
        onChange={(e) => {
          dispatch(actions.update(e.target.value));
        }}
        />
    </div>
  );
};
