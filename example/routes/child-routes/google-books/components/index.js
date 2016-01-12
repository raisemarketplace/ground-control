import React from 'react';
import { createReducer } from 'redux-act';
import { merge, map } from 'lodash';

import Book from 'example/routes/child-routes/google-books/components/book';
import createActions from 'example/utils/createActions';
import { routeStyle, booksSectionStyle, previewTemplateStyle } from 'example/utils/style';

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
