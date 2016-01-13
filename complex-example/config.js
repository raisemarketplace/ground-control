import routes from 'complex-example/routes';
import webpackConfig from 'complex-example/webpack.config';
import { routeReducer } from 'redux-simple-router';

const enableServerRender = true;
const enableReduxSimpleRouter = false; // disabling bc of context/history warnings w react-router 2.0
const enableDevTools = true;
const enableThunk = true;

let additionalReducers = null;
if (enableReduxSimpleRouter) {
  additionalReducers = {
    routing: routeReducer,
  };
}

const initialState = {};

export default {
  webpackConfig,
  additionalReducers,
  enableServerRender,
  enableReduxSimpleRouter,
  enableDevTools,
  enableThunk,
  initialState,
  routes,
};
