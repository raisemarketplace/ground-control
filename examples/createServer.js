import 'isomorphic-fetch';

import React from 'react';
import express from 'express';
import webpack from 'webpack';
import { match } from 'react-router';
import { partial } from 'lodash';
import webpackDevMiddleware from 'webpack-dev-middleware';
import { renderToString } from 'react-dom/server';
import GroundControl, { loadStateOnServer } from 'modules/GroundControl';
import { combineReducers as loopCombineReducers } from 'redux-loop';
import createStore from 'examples/createStore';

const webpackOptions = { publicPath: '/__build__/', stats: { colors: true } };
const getHtml = (enableClientRender, html = '', scriptString = '') => {
  return (
    `<!DOCTYPE html>
    <html>
      <head>${enableClientRender ? `<script src="/__build__/bundle.js" async></script>` : ''}</head>
      <body style='margin:0;padding:0;'>
        <div id="app" style='padding:20px;box-sizing:border-box;'>${html}</div>
        ${scriptString}
      </body>
    </html>`
  );
};

const getAppHtml = (props, store, initialData, reducers, enableLoop) => {
  // only props, store, initialData are required
  let groundControlOpts = { store, initialData, reducers };
  if (enableLoop) groundControlOpts = { ...groundControlOpts, combineReducers: loopCombineReducers };
  const groundControlProps = () => ({ ...props, ...groundControlOpts });
  return renderToString(<GroundControl {...groundControlProps()} />);
};

const render = ({ routes, additionalReducers, enableThunk, enableLoop, enableClientRender }, req, res) => {
  match({ routes, location: req.url }, (routingErr, routingRedirectLocation, props) => {
    if (routingErr) {
      res.status(500).send(routingErr.message);
    } else if (routingRedirectLocation) {
      res.redirect(302, `${routingRedirectLocation.pathname}${routingRedirectLocation.search}`);
    } else if (props) {
      const { store, reducers } = createStore({ additionalReducers, enableThunk, enableLoop });
      let serverOpts = { props, store, reducers };
      if (enableLoop) serverOpts = { ...serverOpts, combineReducers: loopCombineReducers };

      loadStateOnServer(serverOpts, (loadDataErr, loadDataRedirectLocation, initialData, scriptString) => {
        if (loadDataErr) {
          res.status(500).send(loadDataErr.message);
        } else if (loadDataRedirectLocation) {
          res.redirect(302, `${loadDataRedirectLocation.pathname}${loadDataRedirectLocation.search}`);
        } else {
          const appHtml = getAppHtml(props, store, initialData, reducers, enableLoop);
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
  webpackConfig, runWebpack, additionalReducers, enableServerRender, enableClientRender, enableThunk, enableLoop, routes,
}) => {
  let finalRender = (req, res) => res.status(200).send(getHtml(enableClientRender));
  if (enableServerRender) finalRender = partial(render, { routes, additionalReducers, enableThunk, enableLoop, enableClientRender });
  const webpackMiddleware = () => {
    if (runWebpack) return webpackDevMiddleware(webpack(webpackConfig), webpackOptions);
    return (req, res, next) => next();
  };

  express().use(webpackMiddleware()).get('*', finalRender).listen(8081, () => {
    console.log('Server started: 8081'); // eslint-disable-line
  });
};
