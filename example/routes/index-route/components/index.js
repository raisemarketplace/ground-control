import React from 'react';
import { createReducer } from 'redux-act';
import { merge } from 'lodash';

import createActions from 'example/utils/createActions';
import { routeStyle } from 'example/utils/style';

export const actions = createActions(['update']);
export const reducer = createReducer({
  [actions.update]: (state, payload) => {
    state.value = payload;
    return merge({}, state);
  },
}, { value: 'Simple route with an input...' });

export default props => {
  const { dispatch, data } = props;
  return (
    <div style={routeStyle}>
      <p style={{marginTop: 0}}>{data.value}</p>
      <input
        type="text"
        style={{width: '100%', padding: 10, boxSizing: 'border-box'}}
        value={data.value}
        onChange={(e) => {
          dispatch(actions.update(e.target.value));
        }}
        />
    </div>
  );
};
