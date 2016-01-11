import { CHILD, SELF } from './constants';
import { reduce, get, set, omit, isEmpty } from 'lodash';
const ROOT = '@@ROOT';

const keyForDepth = depth => {
  return reduce(Array(depth), result => {
    return result + `[${CHILD}]`;
  }, `[${ROOT}]`);
};

const normalizeStateShape = state => ({ [ROOT]: state });

export const atDepth = (state, depth) => {
  let nestedState = get(normalizeStateShape(state), keyForDepth(depth));
  nestedState = nestedState ? get(nestedState, SELF) : nestedState;
  return isEmpty(nestedState) ? undefined : nestedState;
};

export const setAtDepth = (state, data, depth) => {
  console.warn('todo');
  // if (depth === 0) return data;
  // const key = keyForDepth(depth);
  // return set(state, key, data);
};

export const omitAtDepth = (state, depth) => {
  const key = keyForDepth(depth);
  const normalizedState = normalizeStateShape(state);
  const nestedState = omit(get(normalizedState, key), [SELF, CHILD]);
  return set(normalizedState, key, nestedState)[ROOT];
};
