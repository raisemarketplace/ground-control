import React from 'react';
import { createReducer } from 'redux-act';

import createActions from 'example/utils/createActions';
import { routeStyle } from 'example/utils/style';

export const actions = createActions();
export const reducer = createReducer({}, {});

export default () => {
  return (
    <div style={routeStyle}>
      nested counters index
    </div>
  );
};
