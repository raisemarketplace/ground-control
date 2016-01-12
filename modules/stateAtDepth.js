import { CHILD, SELF } from './constants';
import { reduce, get, set, omit } from 'lodash';
const ROOT = '@@ROOT';

const keyForDepth = depth => {
  return reduce(Array(depth >= 0 ? depth : 0), result => {
    return result + `[${CHILD}]`;
  }, `[${ROOT}]`);
};

const normalizeStateShape = state => ({ [ROOT]: state });

export const atDepth = (state, depth) => {
  const nestedState = get(normalizeStateShape(state), keyForDepth(depth));
  return nestedState ? get(nestedState, SELF) : nestedState;
};

export const setAtDepth = (state, data, depth) => {
  const key = keyForDepth(depth);
  const normalizedState = normalizeStateShape(state);
  const currentStateAtDepth = get(normalizedState, key);
  const updatedStateAtDepth = set(currentStateAtDepth, SELF, data);
  return set(normalizedState, key, updatedStateAtDepth)[ROOT];
};

export const omitAtDepth = (state, depth) => {
  const key = keyForDepth(depth - 1);
  const normalizedState = normalizeStateShape(state);
  const nestedState = get(normalizedState, key);
  const severedState = omit(nestedState, CHILD);
  return set(normalizedState, key, severedState)[ROOT];
};
