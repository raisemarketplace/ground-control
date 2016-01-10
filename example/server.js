import React from 'react';
import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import WebpackConfig from './webpack.config';
import { renderToString } from 'react-dom/server';
import { match } from 'react-router';
import routes from './routes';
import { createApp, initializeStore } from './app';
import AsyncRedux, { loadStateOnServer } from './../modules/AsyncRedux';

const webpackOptions = {
  publicPath: '/__build__/',
  stats: { colors: true },
};

const getHtml = (html = '', scriptTag = '') => {
  return (
    `<!DOCTYPE html>
    <html>
      <head>
        <script src="/__build__/bundle.js" async></script>
      </head>
      <body>
        <div id="app">${html}</div>
      </body>
    </html>`
  );
};

const getAppHtml = (store, renderProps, adjustedRoutes) => {
  const app = createApp(store, <AsyncRedux {...renderProps} routes={adjustedRoutes} store={store} />);
  return renderToString(app);
};

const renderApplication = (req, res) => {
  match({ routes, location: req.url }, (routingErr, redirectLocation, renderProps) => {
    if (routingErr) {
      res.status(500).send(routingErr.message);
    } else if (redirectLocation) {
      res.redirect(302, `${redirectLocation.pathname}${redirectLocation.search}`);
    } else if (renderProps) {
      const store = initializeStore();
      loadStateOnServer(renderProps, store, (loadDataErr, adjustedRoutes, scriptTag) => {
        if (loadDataErr) {
          res.status(500).send(loadDataErr.message);
        } else {
          res.status(200).send(getHtml(getAppHtml(store, renderProps, adjustedRoutes)));
        }
      });
    } else {
      res.status(404).send('Not found');
    }
  });
};

express()
    .use(webpackDevMiddleware(webpack(WebpackConfig), webpackOptions))
    .get('*', renderApplication)
    .listen(8081, () => { console.log('Server started: 8081'); }); // eslint-disable-line
