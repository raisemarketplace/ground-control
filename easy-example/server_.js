process.env.NODE_PATH = `${__dirname}/..`;
require('module').Module._initPaths();
require('babel-register');
require('babel-polyfill');
require('./server');
