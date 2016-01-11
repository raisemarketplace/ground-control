import { cloneElement } from 'react';
import { SELF, CHILD } from './constants';

export default (children, childData, dispatch) => {
  return cloneElement(children, {
    dispatch,
    data: childData[SELF],
    childData: childData[CHILD],
  });
};
