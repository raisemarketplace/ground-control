import routes from 'examples/simple/routes';
import webpackConfig from 'examples/simple/webpack.config';
import { routeReducer } from 'redux-simple-router';

const enableServerRender = true;
const enableClientRender = true;
const enableReduxSimpleRouter = false;
const enableDevTools = false;
const enableThunk = false;
const runWebpack = enableClientRender;

let additionalReducers = {};
if (enableReduxSimpleRouter) {
  additionalReducers = {
    routing: routeReducer,
  };
}

export default {
  webpackConfig,
  runWebpack,
  additionalReducers,
  enableServerRender,
  enableClientRender,
  enableReduxSimpleRouter,
  enableDevTools,
  enableThunk,
  routes,
};
