import { CHILD, SELF } from './constants';
import { setShape } from './stateShape';
import { partial, reduce, get, set } from 'lodash';
const ROOT = '@@ROOT';

const keyForDepth = depth => {
  return reduce(Array(depth), result => {
    return result + `[${CHILD}]`;
  }, `[${ROOT}]`);
};

const normalizeStateShape = state => ({ [ROOT]: state });

export const atDepth = (state, depth, key = SELF) => {
  const nestedState = get(normalizeStateShape(state), keyForDepth(depth));
  return nestedState ? get(nestedState, key) : nestedState;
};

export const validAtDepth = (state, depth) => {
  const valid = partial(atDepth, state, depth);
  return valid(SELF) || valid(CHILD);
};

export const setAtDepth = (state, data, depth) => {
  const key = keyForDepth(depth);
  const normalizedState = normalizeStateShape(state);
  const currentStateAtDepth = get(normalizedState, key);
  const updatedStateAtDepth = set(currentStateAtDepth, SELF, data);
  return set(normalizedState, key, updatedStateAtDepth)[ROOT];
};

export const omitAtDepth = (state, depth) => {
  const key = keyForDepth(depth);
  const normalizedState = normalizeStateShape(state);
  const nestedState = get(normalizedState, key);
  const severedState = setShape(get(nestedState, SELF));
  return set(normalizedState, key, severedState)[ROOT];
};
