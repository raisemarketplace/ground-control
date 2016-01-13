import routes from 'example/routes';
import webpackConfig from 'example/webpack.config';

const enableServerRender = true;
const enableDevTools = true;
const enableThunk = true;

const additionalReducers = {
  somethingElse: (state = 'hello') => state,
};

const initialState = {};

export default {
  webpackConfig,
  additionalReducers,
  enableServerRender,
  enableDevTools,
  enableThunk,
  initialState,
  routes,
};
