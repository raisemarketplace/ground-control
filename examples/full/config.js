import routes from 'examples/full/routes';
import webpackConfig from 'examples/full/webpack.config';
import { routeReducer } from 'redux-simple-router';

const enableServerRender = true;
const enableClientRender = true;
const enableReduxSimpleRouter = true;
const enableDevTools = true;
const enableThunk = true;
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
