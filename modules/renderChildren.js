import { cloneElement } from 'react';
import { CHILD } from './constants';

export default (children, dispatch, data) => {
  return cloneElement(children, { dispatch, data: data[CHILD] });
};
