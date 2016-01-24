import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { syncHistory, routeReducer } from 'redux-simple-router';
import { NAMESPACE } from 'modules/constants';
import DevTools from 'examples/utils/devtools';
import { isEmpty } from 'lodash';
import thunk from 'redux-thunk';

export default ({
  additionalReducers,
  enableReduxSimpleRouter,
  enableDevTools,
  enableThunk,
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

  const reducers = additionalReducers && !isEmpty(additionalReducers) ? additionalReducers : {};
  if (enableReduxSimpleRouter) {
    reducers.routing = routeReducer;
  }

  const defaultReducer = (state = {}) => state;
  const reducer = isEmpty(reducers) ? defaultReducer : combineReducers({
    [NAMESPACE]: defaultReducer, // need to set if using combineReducers top level...
    ...reducers,
  });

  const store = finalCreateStore(reducer, {});

  if (reduxSimpleRouterMiddleware) {
    reduxSimpleRouterMiddleware.listenForReplays(store);
  }

  return {
    store,
    reducers,
  };
};
