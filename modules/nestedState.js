import { CHILD, SELF, META, NAMESPACE, ROOT_DEPTH } from './constants';
import { setShape, validateShape } from './nestedShape';
import { partial, reduce, get, set } from 'lodash';
const NORMALIZED_ROOT = '@@NORMALIZED_ROOT';

const keyForDepth = depth => {
  if (depth < 0) return null;
  return reduce(Array(depth), result => {
    return result + `[${CHILD}]`;
  }, `[${NORMALIZED_ROOT}]`);
};

const scopedState = (state, fromNamespace = true) => fromNamespace ? state[NAMESPACE] : state;

const normalizeStateShape = state => {
  if (!validateShape(state)) state = setShape(); // eslint-disable-line
  return {
    [NORMALIZED_ROOT]: state,
  };
};

export const getNestedState = (state, depth = ROOT_DEPTH, fromNamespace = true, key = SELF) => {
  const normalizedState = normalizeStateShape(scopedState(state, fromNamespace));
  const nestedState = get(normalizedState, keyForDepth(depth));
  return nestedState ? get(nestedState, key) : nestedState;
};

export const getNestedStateAndMeta = (baseState, depth = ROOT_DEPTH, fromNamespace = true) => {
  const normalizedState = normalizeStateShape(scopedState(baseState, fromNamespace));
  const nestedState = get(normalizedState, keyForDepth(depth));
  const state = get(nestedState, SELF);
  const meta = get(nestedState, META);
  return { state, meta };
};

export const setNestedState = (state, data, depth, fromNamespace = true) => {
  const key = keyForDepth(depth);
  const normalizedState = normalizeStateShape(scopedState(state, fromNamespace));
  const currentStateAtDepth = get(normalizedState, key);
  const updatedStateAtDepth = set(currentStateAtDepth, SELF, data);
  return set(normalizedState, key, updatedStateAtDepth)[NORMALIZED_ROOT];
};

export const nestedStateValid = (state, depth = ROOT_DEPTH, fromNamespace = true) => {
  if (!state) return false;
  const valid = partial(getNestedState, state, depth, fromNamespace);
  return !!valid(SELF) || !!valid(CHILD);
};

export const omitNestedState = (state, depth, fromNamespace = true) => {
  const key = keyForDepth(depth);
  const normalizedState = normalizeStateShape(scopedState(state, fromNamespace));
  return set(normalizedState, key, setShape())[NORMALIZED_ROOT];
};
