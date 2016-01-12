import { isObject } from 'lodash';
import {
  SELF,
  CHILD,
} from './constants';

export const setShape = (self, child) => {
  return {
    [SELF]: self,
    [CHILD]: child,
  };
};

export const validateShape = state => {
  return isObject(state) && state.hasOwnProperty(SELF);
};
