import 'isomorphic-fetch';

import React from 'react';
import express from 'express';
import webpack from 'webpack';
import { match } from 'react-router';
import { partial } from 'lodash';
import { Provider } from 'react-redux';
import webpackDevMiddleware from 'webpack-dev-middleware';
import { renderToString } from 'react-dom/server';
import AsyncNestedRedux, { loadStateOnServer } from 'modules/AsyncNestedRedux';
import createStore from 'complex-example/createStore';

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
      <body style='margin:0;padding:0;'>
        <div id="app" style='padding:20px;width:70%;box-sizing:border-box;'>${html}</div>
        <div id="dev"></div>
        ${scriptString}
      </body>
    </html>`
  );
};

const getAppHtml = (renderProps, store, routes, reducers) => {
  return renderToString(
    <Provider store={store}>
      <AsyncNestedRedux
          {...renderProps}
          store={store}
          routes={routes}
          reducers={reducers}
          />
    </Provider>
  );
};

const render = ({
  routes,
  additionalReducers,
  enableThunk,
  initialState,
}, req, res) => {
  match({ routes, location: req.url }, (routingErr, redirectLocation, renderProps) => {
    if (routingErr) {
      res.status(500).send(routingErr.message);
    } else if (redirectLocation) {
      res.redirect(302, `${redirectLocation.pathname}${redirectLocation.search}`);
    } else if (renderProps) {
      const store = createStore({
        additionalReducers,
        enableThunk,
        initialState,
      });

      loadStateOnServer(renderProps, store, additionalReducers, (loadDataErr, adjustedRoutes, scriptString) => {
        if (loadDataErr) {
          res.status(500).send(loadDataErr.message);
        } else {
          const appHtml = getAppHtml(renderProps, store, adjustedRoutes, additionalReducers);
          const html = getHtml(appHtml, scriptString);
          res.status(200).send(html);
        }
      });
    } else {
      res.status(404).send('Not found');
    }
  });
};

export default ({
  webpackConfig,
  additionalReducers,
  enableServerRender,
  enableThunk,
  initialState,
  routes,
}) => {
  let finalRender = (req, res) => res.status(200).send(getHtml());
  if (enableServerRender) {
    finalRender = partial(render, {
      routes,
      additionalReducers,
      enableThunk,
      initialState,
    });
  }

  express()
      .use(webpackDevMiddleware(webpack(webpackConfig), webpackOptions))
      .get('*', finalRender)
      .listen(8081, () => { console.log('Server started: 8081'); }); // eslint-disable-line
};