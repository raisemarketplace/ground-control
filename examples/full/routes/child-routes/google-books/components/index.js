import React from 'react';
import { createReducer } from 'redux-act';
import { merge, map } from 'lodash';

import Book from 'examples/full/routes/child-routes/google-books/components/book';
import createActions from 'examples/utils/createActions';
import { routeStyle, booksSectionStyle, previewTemplateStyle } from 'examples/utils/style';

const FROWN_FACE = ':(';

export const actions = createActions('GoogleBooks', ['loadTop', 'loadBottom']);
export const reducer = createReducer({
  [actions.loadTop]: (state, payload) => {
    const updatedState = merge({}, state);
    updatedState.topBooks = payload;
    return updatedState;
  },
  [actions.loadBottom]: (state, payload) => {
    const updatedState = merge({}, state);
    updatedState.bottomBooks = payload;
    return updatedState;
  },
}, {
  topBooks: [],
  bottomBooks: [],
});

export default props => {
  const { data, loading, loadingError } = props;

  let topBooks;
  if (loadingError && loadingError.topBooks) {
    topBooks = (
      <div>{FROWN_FACE}</div>
    );
  } else {
    topBooks = map(data.topBooks, (book, index) => (
      <Book key={index} {...book} />
    ));
  }

  let bottomBooks;
  if (loading) {
    bottomBooks = map(Array(10), (_, index) => (
      <div key={index} style={previewTemplateStyle} />
    ));
  } else {
    bottomBooks = map(data.bottomBooks, (book, index) => (
      <Book key={index} {...book} />
    ));
  }

  return (
    <div style={routeStyle}>
      <div style={merge({}, booksSectionStyle, { marginBottom: 20 })}>
        <p style={{ marginTop: 0 }}>Top of page</p>
        <div>{topBooks}</div>
      </div>
      <div style={booksSectionStyle}>
        <p style={{ marginTop: 0 }}>Bottom of page</p>
        <div>{bottomBooks}</div>
      </div>
    </div>
  );
};
