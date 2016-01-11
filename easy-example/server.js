import createServer from 'example/createServer';
import { initializeStore, createApp } from 'easy-example/app';
import routes from 'easy-example/routes';
import WebpackConfig from 'easy-example/webpack.config';

createServer(true, routes, initializeStore, createApp, WebpackConfig);
