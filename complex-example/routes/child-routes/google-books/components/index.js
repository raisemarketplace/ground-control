import React from 'react';
import { createReducer } from 'redux-act';
import { merge, map } from 'lodash';

import Book from 'complex-example/routes/child-routes/google-books/components/book';
import createActions from 'complex-example/utils/createActions';
import { routeStyle, booksSectionStyle, previewTemplateStyle } from 'complex-example/utils/style';

const FROWN_FACE = ':(';

export const actions = createActions('GoogleBooks', ['loadFiction', 'loadJavascript']);
export const reducer = createReducer({
  [actions.loadFiction]: (state, payload) => {
    const updatedState = merge({}, state);
    updatedState.fiction = payload;
    return updatedState;
  },
  [actions.loadJavascript]: (state, payload) => {
    const updatedState = merge({}, state);
    updatedState.javascript = payload;
    return updatedState;
  },
}, {
  fiction: [],
  javascript: [],
});

export default props => {
  const { data, loading, loadingError } = props;

  let topBooks;
  if (loadingError && loadingError.topBooks) {
    topBooks = (
      <div>{FROWN_FACE}</div>
    );
  } else {
    topBooks = map(data.fiction, (book, index) => (
      <Book key={index} {...book} />
    ));
  }

  let bottomBooks;
  if (loading) {
    bottomBooks = map(Array(10), (_, index) => (
      <div key={index} style={previewTemplateStyle} />
    ));
  } else {
    bottomBooks = map(data.javascript, (book, index) => (
      <Book key={index} {...book} />
    ));
  }

  return (
    <div style={routeStyle}>
      <div style={merge({}, booksSectionStyle, { marginBottom: 20 })}>
        <p style={{ marginTop: 0 }}>Top of page: fiction</p>
        <div>{topBooks}</div>
      </div>
      <div style={booksSectionStyle}>
        <p style={{ marginTop: 0 }}>Bottom of page: javascript</p>
        <div>{bottomBooks}</div>
      </div>
    </div>
  );
};
