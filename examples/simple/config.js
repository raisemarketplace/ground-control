import routes from 'examples/simple/routes';
import webpackConfig from 'examples/simple/webpack.config';

const enableServerRender = true;
const enableClientRender = true;
const enableReduxSimpleRouter = false;
const enableDevTools = false;
const enableThunk = false;
const runWebpack = enableClientRender;

export default {
  webpackConfig,
  runWebpack,
  enableServerRender,
  enableClientRender,
  enableReduxSimpleRouter,
  enableDevTools,
  enableThunk,
  routes,
};
