import React from 'react';
import { createReducer } from 'redux-act';
import { merge, map } from 'lodash';

import createActions from 'complex-example/utils/createActions';
import { routeStyle, previewTemplateStyle } from 'complex-example/utils/style';

export const actions = createActions('Route-2', ['load']);
export const reducer = createReducer({
  [actions.load]: (state, payload) => {
    const updatedState = merge({}, state);
    updatedState.items = payload;
    return updatedState;
  },
}, { items: [] });

export const fetchData = (done, { dispatch, clientRender }) => {
  clientRender();
  setTimeout(() => {
    const data = map(Array(10), () => 'AsyncNestedRedux!');
    dispatch(actions.load(data));
    done();
  }, 1000);
};

export default props => {
  const { data, loading } = props;

  let items;
  if (loading) {
    items = (
      <div>
        {map(Array(10), (_, index) => (
          <div key={index} style={previewTemplateStyle} />
        ))}
      </div>
    );
  } else {
    items = map(data.items, (item, index) => (
      <p style={{ margin: 0 }} key={index}>{item}</p>
    ));
  }

  return (
    <div style={routeStyle}>
      {items}
    </div>
  );
};
