import routes from 'examples/full/routes';
import webpackConfig from 'examples/full/webpack.config';

const enableServerRender = true;
const enableClientRender = true;
const enableReactRouterRedux = true;
const enableDevTools = true;
const enableThunk = true;
const enableLoop = true;
const runWebpack = enableClientRender;

export default {
  webpackConfig, runWebpack, enableServerRender, enableClientRender,
  enableReactRouterRedux, enableDevTools, enableThunk, enableLoop, routes,
};
