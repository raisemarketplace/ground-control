import React from 'react';

export default (Component, props) => {
  const { route } = props;

  if (route.blockRender) {
    return route.loader(props);
  }

  return (<Component {...props} loading={route.loading} />);
};
