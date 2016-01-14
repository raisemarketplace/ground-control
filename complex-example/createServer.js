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

const getHtml = (enableClientRender, html = '', scriptString = '') => {
  return (
    `<!DOCTYPE html>
    <html>
      <head>${enableClientRender ? `<script src="/__build__/bundle.js" async></script>` : ''}</head>
      <body style='margin:0;padding:0;'>
        <div id="app" style='padding:20px;width:70%;box-sizing:border-box;'>${html}</div>
        <div id="dev"></div>
        ${scriptString}
      </body>
    </html>`
  );
};

const getAppHtml = (renderProps, store, initialData, reducers) => renderToString(
  <Provider store={store}>
    <AsyncNestedRedux
        {...renderProps}
        store={store}
        initialData={initialData}
        reducers={reducers}
        />
  </Provider>
);

const render = ({
  routes,
  additionalReducers,
  enableThunk,
  initialState,
  enableClientRender,
}, req, res) => {
  match({ routes, location: req.url }, (
    routingErr,
    routingRedirectLocation,
    renderProps
  ) => {
    if (routingErr) {
      res.status(500).send(routingErr.message);
    } else if (routingRedirectLocation) {
      res.redirect(302, `${routingRedirectLocation.pathname}${routingRedirectLocation.search}`);
    } else if (renderProps) {
      const store = createStore({
        additionalReducers,
        enableThunk,
        initialState: {},
      });

      loadStateOnServer(renderProps, store, additionalReducers, (
        loadDataErr,
        loadDataRedirectLocation,
        initialData,
        scriptString
      ) => {
        if (loadDataErr) {
          res.status(500).send(loadDataErr.message);
        } else if (loadDataRedirectLocation) {
          res.redirect(302, `${loadDataRedirectLocation.pathname}${loadDataRedirectLocation.search}`);
        } else {
          const appHtml = getAppHtml(renderProps, store, initialData, additionalReducers);
          const html = getHtml(enableClientRender, appHtml, scriptString);
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
  runWebpack,
  additionalReducers,
  enableServerRender,
  enableClientRender,
  enableThunk,
  initialState,
  routes,
}) => {
  let finalRender = (req, res) => res.status(200).send(getHtml(enableClientRender));
  if (enableServerRender) {
    finalRender = partial(render, {
      routes,
      additionalReducers,
      enableThunk,
      initialState,
      enableClientRender,
    });
  }

  const webpackMiddleware = () => {
    if (runWebpack) return webpackDevMiddleware(webpack(webpackConfig), webpackOptions);
    return (req, res, next) => next();
  };

  express()
      .use(webpackMiddleware())
      .get('*', finalRender)
      .listen(8081, () => { console.log('Server started: 8081'); }); // eslint-disable-line
};
