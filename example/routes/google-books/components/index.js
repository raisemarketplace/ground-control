import React from 'react';
import { createReducer } from 'redux-act';
import { merge, map } from 'lodash';

import Book from 'example/routes/google-books/components/book';
import createActions from 'example/utils/createActions';
import { routeStyle, booksSectionStyle, previewTemplateStyle } from 'example/utils/style';

export const actions = createActions('loadFiction', 'loadJavascript');
export const reducer = createReducer({
  [actions.loadFiction]: (state, payload) => {
    state.fiction = payload;
    return merge({}, state);
  },
  [actions.loadJavascript]: (state, payload) => {
    state.javascript = payload;
    return merge({}, state);
  },
}, {
  fiction: [],
  javascript: [],
});

export default props => {
  const { data, loading } = props;

  let bottomBooks;
  if (loading) {
    bottomBooks = (
      <div>
        {map(Array(10), (_, index) => (
          <div key={index} style={previewTemplateStyle} />
        ))}
      </div>
    );
  } else {
    bottomBooks = map(data.javascript, (book, index) => (
      <Book key={index} {...book} />
    ));
  }

  return (
    <div style={routeStyle}>
      <div style={merge({}, booksSectionStyle, { marginBottom: 20 })}>
        <p style={{ marginTop: 0 }}>Top of page: fiction</p>
        <div>
          {map(data.fiction, (book, index) => (
            <Book key={index} {...book} />
          ))}
        </div>
      </div>
      <div style={booksSectionStyle}>
        <p style={{ marginTop: 0 }}>Bottom of page: javascript</p>
        <div>
          {bottomBooks}
        </div>
      </div>
    </div>
  );
};
