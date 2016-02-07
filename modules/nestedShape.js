import { isObject } from 'lodash';
import { NAMESPACE, SELF, CHILD, META } from './constants';

export const setShape = (self, child, meta) => {
  return {
    [SELF]: self,
    [CHILD]: child,
    [META]: meta,
  };
};

export const validateShape = state => isObject(state) && (state.hasOwnProperty(SELF) || state.hasOwnProperty(CHILD));
export const validateRootShape = state => isObject(state) && state.hasOwnProperty(NAMESPACE) && validateShape(state[NAMESPACE]);
