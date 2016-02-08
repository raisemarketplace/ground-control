import routes from 'examples/simple/routes';
import webpackConfig from 'examples/simple/webpack.config';

const enableServerRender = true;
const enableClientRender = true;
const enableReactRouterRedux = false;
const enableDevTools = false;
const enableThunk = false;
const enableLoop = false;
const runWebpack = enableClientRender;

export default {
  webpackConfig, runWebpack, enableServerRender, enableClientRender,
  enableReactRouterRedux, enableDevTools, enableThunk, enableLoop, routes,
};
