import React from 'react';
import { map } from 'lodash';
import { routeStyle, previewTemplateStyle } from 'examples/utils/style';

const initialState = { items: [] };

export const actions = {
  load: items => ({ type: 'Route2Load', payload: items }),
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
  case 'Route2Load':
    return { ...state, items: action.payload };
  default:
    return state;
  }
};

const getData = async () => new Promise((resolve) => {
  setTimeout(() => {
    const data = map(Array(10), () => 'GroundControl!');
    resolve(data);
  }, 1000);
});

export const fetchData = async (done, { dispatch, clientRender, isHydrated }) => {
  if (isHydrated()) {
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
