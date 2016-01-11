import { cloneElement } from 'react';
import { CHILD } from './constants';

export default (children, dispatch, data) => {
  if (!data) throw new Error('renderChildren called without data');
  return cloneElement(children, { dispatch, data: data[CHILD] });
};
