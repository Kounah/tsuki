const path = require('path');
const express = require('express');
const nunjucks = require('nunjucks');
// eslint-disable-next-line no-unused-vars
const http = require('http');
const conf = require('./app/config').server;
const api = require('./app/api');

/**
 * Module Server
 * ---
 * The server's core module. It sets up the express app configures the view
 * renderer and gives methods for starting and stopping the server.
 * @module server
 * @see {@link module:api}
 */


let app = express();

nunjucks.configure(path.join(__dirname, 'views'), {
  autoescape: true,
  express: app
});

/**@type {http.Server} */
let server;

module.exports.start = function start() {
  server = app.listen(conf.port, () => {
    console.log('listening on port ' + conf.port);

    console.log('initializing api');
    api.init(app).then(() => {
      console.log('initialized api');
    });

    server.on('connection', (socket) => {
      socket.on('data', chunk => {
        console.log(chunk.toString('utf8'));
      });
    });
  });
};

module.exports.stop = function stop() {
  server.close((err) => {
    if(err) {
      console.error(err);
    } else {
      console.log('server closed');
    }
  });
};

module.exports.app = app;