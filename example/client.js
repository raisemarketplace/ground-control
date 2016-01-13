import createClient from 'example/createClient';
import { initializeStore, createApp } from 'example/app';
import routes from 'example/routes';

const enableDevTools = true;
createClient(enableDevTools, routes, initializeStore, createApp);
