import routes from 'easy-example/routes';
import webpackConfig from 'easy-example/webpack.config';
import { routeReducer } from 'redux-simple-router';

const enableServerRender = false;
const enableClientRender = true;
const enableReduxSimpleRouter = false; // disabling bc of context/history warnings w react-router 2.0
const enableDevTools = false;
const enableThunk = false;
const runWebpack = true;

let additionalReducers = null;
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
