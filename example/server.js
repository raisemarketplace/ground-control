import createServer from 'example/createServer';
import { initializeStore, createApp } from 'example/app';
import routes from 'example/routes';
import WebpackConfig from 'example/webpack.config';

const enableServerRender = true;
createServer(enableServerRender, routes, initializeStore, createApp, WebpackConfig);
