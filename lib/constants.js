'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var IS_CLIENT = exports.IS_CLIENT = typeof window !== 'undefined';
var IS_SERVER = exports.IS_SERVER = !IS_CLIENT;
var REHYDRATE_REDUCERS = exports.REHYDRATE_REDUCERS = '@@anr/REHYDRATE_REDUCERS';
var NAMESPACE = exports.NAMESPACE = 'anr';
var CHILD = exports.CHILD = 'child';
var SELF = exports.SELF = 'self';
var FD_DONE = exports.FD_DONE = 'done';
var FD_CLIENT_RENDER = exports.FD_CLIENT_RENDER = 'client';
var FD_SERVER_RENDER = exports.FD_SERVER_RENDER = 'server';
var ROOT_DEPTH = exports.ROOT_DEPTH = 0;