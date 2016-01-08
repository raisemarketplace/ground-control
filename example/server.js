import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import WebpackConfig from './webpack.config';
import path from 'path';

express()
    .use(webpackDevMiddleware(webpack(WebpackConfig), {
      publicPath: '/__build__/',
      stats: { colors: true },
    }))
    .use(express.static(__dirname)).get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'index.html'));
    })
    .listen(8081, () => {
      console.log('Server listening on http://localhost:8081, Ctrl+C to stop'); // eslint-disable-line
    });
