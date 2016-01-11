import createClient from 'example/createClient';
import { initializeStore, createApp } from 'easy-example/app';
import routes from 'easy-example/routes';

createClient(routes, initializeStore, createApp);
