import { createStore, applyMiddleware, compose, combineReducers as reduxCombineReducers } from 'redux';
import { syncHistory, routeReducer } from 'react-router-redux';
import { NAMESPACE } from 'modules/constants';
import { install as installLoop, combineReducers as loopCombineReducers } from 'redux-loop';
import { isEmpty } from 'lodash';
import thunk from 'redux-thunk';

export default ({
  additionalReducers, enableReduxSimpleRouter, enableDevTools, enableThunk, enableLoop, history,
}) => {
  let middleware = [];
  let reduxSimpleRouterMiddleware;
  if (enableThunk) middleware = middleware.concat(thunk);
  if (enableReduxSimpleRouter && history) reduxSimpleRouterMiddleware = syncHistory(history);
  if (reduxSimpleRouterMiddleware) middleware = middleware.concat(reduxSimpleRouterMiddleware);

  let storeEnhancers = [];
  if (enableLoop) storeEnhancers = storeEnhancers.concat(installLoop());
  if (enableDevTools) storeEnhancers = storeEnhancers.concat(window.devToolsExtension ? window.devToolsExtension() : f => f);

  const reducers = additionalReducers && !isEmpty(additionalReducers) ? additionalReducers : {};
  if (enableReduxSimpleRouter) reducers.routing = routeReducer;

  const defaultReducer = (state = {}) => state;
  const cr = enableLoop ? loopCombineReducers : reduxCombineReducers;
  const reducer = isEmpty(reducers) ? defaultReducer : cr({
    [NAMESPACE]: defaultReducer, // need to set if using combineReducers top level...
    ...reducers,
  });

  const store = createStore(reducer, {}, compose(
    applyMiddleware(...middleware),
    ...storeEnhancers
  ));

  if (reduxSimpleRouterMiddleware) reduxSimpleRouterMiddleware.listenForReplays(store);
  return { store, reducers };
};
