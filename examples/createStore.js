import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { syncHistory, routeReducer } from 'react-router-redux';
import { NAMESPACE } from 'modules/constants';
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
  if (enableDevTools) storeEnhancers = storeEnhancers.concat(window.devToolsExtension ? window.devToolsExtension() : f => f);

  const reducers = additionalReducers && !isEmpty(additionalReducers) ? additionalReducers : {};
  if (enableReduxSimpleRouter) {
    reducers.routing = routeReducer;
  }

  const defaultReducer = (state = {}) => state;
  const reducer = isEmpty(reducers) ? defaultReducer : combineReducers({
    [NAMESPACE]: defaultReducer, // need to set if using combineReducers top level...
    ...reducers,
  });

  const store = createStore(reducer, {}, compose(
    applyMiddleware(...middleware),
    ...storeEnhancers
  ));

  if (reduxSimpleRouterMiddleware) {
    reduxSimpleRouterMiddleware.listenForReplays(store);
  }

  return {
    store,
    reducers,
  };
};
