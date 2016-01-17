import { CHILD, SELF, NAMESPACE, ROOT_DEPTH } from './constants';
import { setShape } from './nestedShape';
import { partial, reduce, get, set } from 'lodash';
const NORMALIZED_ROOT = '@@NORMALIZED_ROOT';

const keyForDepth = depth => {
  if (depth < 0) return null;
  return reduce(Array(depth), result => {
    return result + `[${CHILD}]`;
  }, `[${NORMALIZED_ROOT}]`);
};

const normalizeStateShape = state => {
  return {
    [NORMALIZED_ROOT]: state,
  };
};

const scopedState = (state, fromNamespace = true) => {
  return fromNamespace ? state[NAMESPACE] : state;
};

export const getNestedState = (state, depth = ROOT_DEPTH, fromNamespace = true, key = SELF) => {
  const normalizedState = normalizeStateShape(scopedState(state, fromNamespace));
  const nestedState = get(normalizedState, keyForDepth(depth));
  return nestedState ? get(nestedState, key) : nestedState;
};

export const setNestedState = (state, data, depth, fromNamespace = true) => {
  const key = keyForDepth(depth);
  const normalizedState = normalizeStateShape(scopedState(state, fromNamespace));
  const currentStateAtDepth = get(normalizedState, key);
  const updatedStateAtDepth = set(currentStateAtDepth, SELF, data);
  return set(normalizedState, key, updatedStateAtDepth)[NORMALIZED_ROOT];
};

export const nestedStateValid = (state, depth, fromNamespace = true) => {
  if (!state) return false;
  const valid = partial(getNestedState, state, depth, fromNamespace);
  return !!valid(SELF) || !!valid(CHILD);
};

export const omitNestedState = (state, depth, fromNamespace = true) => {
  const key = keyForDepth(depth);
  const normalizedState = normalizeStateShape(scopedState(state, fromNamespace));
  return set(normalizedState, key, setShape())[NORMALIZED_ROOT];
};
