import { isObject } from 'lodash';
import {
  NAMESPACE,
  SELF,
  CHILD,
} from './constants';

export const setShape = (self, child) => {
  return {
    [SELF]: self,
    [CHILD]: child,
  };
};

export const validateRootShape = state => {
  return isObject(state) && state.hasOwnProperty(NAMESPACE) && (state[NAMESPACE].hasOwnProperty(SELF) || state[NAMESPACE].hasOwnProperty(CHILD));
};
