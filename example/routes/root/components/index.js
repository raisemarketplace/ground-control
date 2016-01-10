import React from 'react';

import createActions from 'example/utils/createActions';

export const actions = createActions(['incr']);

export default props => {
  // const { dispatch, data } = props;
  return (
    <div>
      root index!
    </div>
  );
};
