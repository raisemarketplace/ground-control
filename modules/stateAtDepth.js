
import { CHILD, SELF, ANR_ROOT } from './constants';
import { setShape } from './stateShape';
import { partial, reduce, get, set } from 'lodash';
const ROOT = '@@ROOT';

const keyForDepth = depth => {
  if (depth < 0) return null;
  return reduce(Array(depth), result => {
    return result + `[${CHILD}]`;
  }, `[${ROOT}]`);
};

const normalizeStateShape = state => ({ [ROOT]: state });

export const atDepth = (state, depth, key = SELF) => {
  const nestedState = get(normalizeStateShape(state), keyForDepth(depth));
  return nestedState ? get(nestedState, key) : nestedState;
};

export const applicationState = (state, depth = 0) => atDepth(state[ANR_ROOT], depth);

export const setAtDepth = (state, data, depth) => {
  const key = keyForDepth(depth);
  const normalizedState = normalizeStateShape(state);
  const currentStateAtDepth = get(normalizedState, key);
  const updatedStateAtDepth = set(currentStateAtDepth, SELF, data);
  return set(normalizedState, key, updatedStateAtDepth)[ROOT];
};

export const rootValidAtDepth = (state, depth) => {
  if (!state) return false;
  const valid = partial(atDepth, state[ANR_ROOT], depth);
  return !!valid(SELF) || !!valid(CHILD);
};

export const rootOmitAtDepth = (state, depth) => {
  const key = keyForDepth(depth);
  const normalizedState = normalizeStateShape(state[ANR_ROOT]);
  return set(normalizedState, key, setShape())[ROOT];
};
