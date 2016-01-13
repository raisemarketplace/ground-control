import { HYDRATE, ANR_ROOT } from './constants';
import makeHydratable from './makeHydratable';
import { atDepth, rootOmitAtDepth } from './stateAtDepth';
import { setShape } from './stateShape';
import { combineReducers } from 'redux';
import { reduceRight } from 'lodash';

const nestReducers = (...reducers) => {
  return (state, action) => {
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

export const nestAndReplaceReducers = (store, baseReducers, ...reducers) => {
  store.replaceReducer(combineReducers({
    ...baseReducers,
    [ANR_ROOT]: makeHydratable(nestReducers(...reducers)),
  }));
};

export const nestAndReplaceReducersAndState = (store, depth, baseReducers, ...reducers) => {
  // getState ------> replaceReducers ------> replaceState
  const adjustedState = rootOmitAtDepth(store.getState(), depth);
  nestAndReplaceReducers(store, baseReducers, ...reducers);
  store.dispatch({ type: HYDRATE, state: adjustedState });
};
