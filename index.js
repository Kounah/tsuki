const server = require('./server');
const api = require('./app/api');

/**
 * the main module
 * index for tsuki's API
 * @module index
 * @see {@link module:server}
 * @see {@link module:api}
 */

server.start();

module.exports = {
  server,
  api
};