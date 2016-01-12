import { HYDRATE } from './constants';
import makeHydratable from './makeHydratable';
import { atDepth, omitAtDepth } from './stateAtDepth';
import { setShape } from './stateShape';
import { reduceRight } from 'lodash';

const nestReducers = (...reducers) => {
  return (state, action) => {
    if (action.type === HYDRATE) {
      return state;
    }

    return reduceRight(reducers, (result, reducer, depth) => {
      const previousState = atDepth(state, depth);
      const nextState = reducer(previousState, action);
      if (result) {
        const newResult = setShape(nextState, result);
        return newResult;
      }

      return setShape(nextState);
    }, null);
  };
};

export const nestAndReplaceReducers = (store, ...reducers) => {
  const nestedReducer = nestReducers(...reducers);
  const hydratableReducer = makeHydratable(nestedReducer);
  store.replaceReducer(hydratableReducer);
};

export const nestAndReplaceReducersAndState = (store, depth, ...reducers) => {
  // clear out state at x depth, then replace reducer
  const adjustedState = omitAtDepth(store.getState(), depth);
  store.dispatch({ type: HYDRATE, state: adjustedState });
  nestAndReplaceReducers(store, ...reducers);
};
