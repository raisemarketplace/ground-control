import 'isomorphic-fetch';

import React from 'react';
import express from 'express';
import webpack from 'webpack';
import { match } from 'react-router';
import { partial } from 'lodash';
import webpackDevMiddleware from 'webpack-dev-middleware';
import { renderToString } from 'react-dom/server';
import AsyncRedux, { loadStateOnServer } from 'modules/AsyncRedux';

import WebpackConfig from 'example/webpack.config';

const webpackOptions = {
  publicPath: '/__build__/',
  stats: { colors: true },
};

const getHtml = (html = '', scriptString = '') => {
  return (
    `<!DOCTYPE html>
    <html>
      <head>
        <script src="/__build__/bundle.js" async></script>
      </head>
      <body style='margin:0;padding:20px;'>
        <div id="app">${html}</div>
        ${scriptString}
      </body>
    </html>`
  );
};

const asyncReduxProps = (renderProps, routes, store) => ({ // eslint-disable-line
  ...renderProps,
  routes,
  store,
});

const getAppHtml = (createApp, store, renderProps, adjustedRoutes) => {
  const app = createApp(store, <AsyncRedux {...asyncReduxProps(renderProps, adjustedRoutes, store)} />);
  return renderToString(app);
};

const _renderApplication = (routes, initializeStore, createApp, req, res) => {
  match({ routes, location: req.url }, (routingErr, redirectLocation, renderProps) => {
    if (routingErr) {
      res.status(500).send(routingErr.message);
    } else if (redirectLocation) {
      res.redirect(302, `${redirectLocation.pathname}${redirectLocation.search}`);
    } else if (renderProps) {
      const store = initializeStore();
      loadStateOnServer(renderProps, store, (loadDataErr, adjustedRoutes, scriptString) => {
        if (loadDataErr) {
          res.status(500).send(loadDataErr.message);
        } else {
          res.status(200).send(getHtml(getAppHtml(createApp, store, renderProps, adjustedRoutes), scriptString));
        }
      });
    } else {
      res.status(404).send('Not found');
    }
  });
};

export default (renderServerSide, routes, initializeStore, createApp) => {
  let renderApplication = (req, res) => res.status(200).send(getHtml());
  if (renderServerSide) renderApplication = partial(_renderApplication, routes, initializeStore, createApp);
  express()
      .use(webpackDevMiddleware(webpack(WebpackConfig), webpackOptions))
      .get('*', renderApplication)
      .listen(8081, () => { console.log('Server started: 8081'); }); // eslint-disable-line
};
