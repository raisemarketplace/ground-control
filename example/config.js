import routes from 'example/routes';
import webpackConfig from 'example/webpack.config';
import { routeReducer } from 'redux-simple-router';

const enableServerRender = true;
const enableReduxSimpleRouter = true;
const enableDevTools = true;
const enableThunk = true;

let additionalReducers = null;
if ( enableReduxSimpleRouter) {
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
