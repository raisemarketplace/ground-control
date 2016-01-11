import createClient from 'example/createClient';
import { initializeStore, createApp } from 'example/app';
import routes from 'example/routes';

createClient(routes, initializeStore, createApp);
