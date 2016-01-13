import { ANR_ROOT, SEVER_STATE, REHYDRATE_REDUCERS } from './constants';
import makeHydratable from './makeHydratable';
import { atDepth, rootOmitAtDepth } from './stateAtDepth';
import { setShape } from './stateShape';
import { combineReducers } from 'redux';
import { reduceRight, omit } from 'lodash';

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
  const otherReducers = omit(baseReducers, ANR_ROOT);
  store.replaceReducer(combineReducers({
    ...otherReducers,
    [ANR_ROOT]: makeHydratable(nestReducers(...reducers)),
  }));
};

export const nestAndReplaceReducersAndState = (store, depth, baseReducers, ...reducers) => {
  const adjustedState = rootOmitAtDepth(store.getState(), depth);
  store.dispatch({ type: SEVER_STATE, state: adjustedState });
  nestAndReplaceReducers(store, baseReducers, ...reducers);
  store.dispatch({ type: REHYDRATE_REDUCERS, state: adjustedState });
};
