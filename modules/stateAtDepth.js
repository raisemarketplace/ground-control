import { CHILD } from './constants';
import { reduce, get, set, omit, isEmpty } from 'lodash';

const keyForDepth = depth => {
  return reduce(Array(depth + 1), result => {
    const updatedResult = result + `[${CHILD}]`;
    return updatedResult;
  }, '');
};

const normalizeStateShape = state => ({ [CHILD]: state });

export const atDepth = (state, depth) => {
  let adjustedState = get(normalizeStateShape(state), keyForDepth(depth));
  adjustedState = adjustedState ? omit(adjustedState, CHILD) : adjustedState;
  return isEmpty(adjustedState) ? undefined : adjustedState;
};

export const setAtDepth = (state, data, depth) => {
  if (depth === 0) {
    return data;
  }

  const key = keyForDepth(depth - 1);
  return set(state, key, data);
};

export const omitAtDepth = (state, depth) => {
  if (depth === 0) {
    return {};
  }

  const key = keyForDepth(depth - 1);
  const adjustedState = normalizeStateShape(state);
  return set(adjustedState, key, omit(get(adjustedState, key), CHILD))[CHILD];
};
