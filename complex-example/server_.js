process.env.NODE_PATH = `${__dirname}/..`;
require('module').Module._initPaths();
// wrap server for module resolution
require('./server');
