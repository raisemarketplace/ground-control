import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { syncHistory } from 'redux-simple-router';
import DevTools from 'example/devtools';
import thunk from 'redux-thunk';

export default ({
  additionalReducers,
  enableReduxSimpleRouter,
  enableDevTools,
  enableThunk,
  initialState,
  history,
}) => {
  let middleware = [];
  let reduxSimpleRouterMiddleware;
  if (enableThunk) middleware = middleware.concat(thunk);
  if (enableReduxSimpleRouter && history) reduxSimpleRouterMiddleware = syncHistory(history);
  if (reduxSimpleRouterMiddleware) middleware = middleware.concat(reduxSimpleRouterMiddleware);

  let storeEnhancers = [];
  if (enableDevTools) storeEnhancers = storeEnhancers.concat(DevTools.instrument());

  const finalCreateStore = compose(
    applyMiddleware(...middleware),
    ...storeEnhancers
  )(createStore);

  const store = finalCreateStore(
    additionalReducers ? combineReducers(additionalReducers) : s => s,
    initialState
  );

  if (reduxSimpleRouterMiddleware) {
    reduxSimpleRouterMiddleware.syncHistoryToStore(store);
  }

  return store;
};
