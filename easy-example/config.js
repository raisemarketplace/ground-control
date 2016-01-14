import routes from 'easy-example/routes';
import webpackConfig from 'easy-example/webpack.config';
import { routeReducer } from 'redux-simple-router';

const enableServerRender = false;
const enableReduxSimpleRouter = false; // disabling bc of context/history warnings w react-router 2.0
const enableDevTools = false;
const enableThunk = false;

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
