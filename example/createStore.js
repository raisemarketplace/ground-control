import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import DevTools from 'example/devtools';
import thunk from 'redux-thunk';

export default ({
  initialState,
  additionalReducers,
  enableThunk,
  enableDevTools,
}) => {
  let middleware = [];
  if (enableThunk) middleware = middleware.concat(thunk);

  let storeEnhancers = [];
  if (enableDevTools) storeEnhancers = storeEnhancers.concat(DevTools.instrument());

  const finalCreateStore = compose(
    applyMiddleware(...middleware),
    ...storeEnhancers
  )(createStore);

  return finalCreateStore(
    additionalReducers ? combineReducers(additionalReducers) : s => s,
    initialState
  );
};
