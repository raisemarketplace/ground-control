import routes from 'examples/full/routes';
import webpackConfig from 'examples/full/webpack.config';

const enableServerRender = false;
const enableClientRender = true;
const enableReduxSimpleRouter = true;
const enableDevTools = true;
const enableThunk = true;
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
