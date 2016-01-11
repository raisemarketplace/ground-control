import createServer from 'example/createServer';
import { initializeStore, createApp } from 'example/app';
import routes from 'example/routes';

createServer(true, routes, initializeStore, createApp);
