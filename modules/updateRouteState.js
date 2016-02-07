import { FD_DONE, UPDATE_ROUTE_STATE } from './constants';
import { getNestedStateAndMeta } from './nestedState';
import deepEqual from 'deep-equal';

export default (store, depth, type, loadingError = false) => {
  const { meta: currentMeta } = getNestedStateAndMeta(store.getState(), depth);
  let meta = { ...currentMeta, blockRender: false };
  if (loadingError) meta = { ...meta, loadingError };
  if (type === FD_DONE) meta = { ...meta, loading: false };
  if (!deepEqual(currentMeta, meta)) store.dispatch({ type: UPDATE_ROUTE_STATE, meta, depth });
};
