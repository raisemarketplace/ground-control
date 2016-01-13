import { isObject } from 'lodash';
import {
  ANR_ROOT,
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
  return isObject(state) && state.hasOwnProperty(ANR_ROOT) && state[ANR_ROOT].hasOwnProperty(SELF);
};
