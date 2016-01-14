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

const getData = async () => new Promise((resolve) => {
  setTimeout(() => {
    const data = map(Array(10), () => 'AsyncNestedRedux!');
    resolve(data);
  }, 1000);
});

export const fetchData = async (done, { dispatch, clientRender, hydrated }) => {
  if (hydrated()) {
    done();
  } else {
    clientRender();
    const data = await getData(data);
    dispatch(actions.load(data));
    done();
  }
};

export default props => {
  const { data, loading } = props;

  let items;
  if (loading) {
    items = <div>{map(Array(10), (_, index) => <div key={index} style={previewTemplateStyle} />)}</div>;
  } else {
    items = map(data.items, (item, index) => <p style={{ margin: 0 }} key={index}>{item}</p>);
  }

  return <div style={routeStyle}>{items}</div>;
};
