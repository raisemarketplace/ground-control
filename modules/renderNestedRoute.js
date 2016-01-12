import { cloneElement } from 'react';
import { SELF, CHILD } from './constants';

export default (children, nestedData, dispatch) => {
  return cloneElement(children, {
    dispatch,
    data: nestedData[SELF],
    nestedData: nestedData[CHILD],
  });
};
