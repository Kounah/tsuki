const path = require('path');
const express = require('express');
const session = require('express-session');
const nunjucks = require('nunjucks');
const bodyParser = require('body-parser');
// eslint-disable-next-line no-unused-vars
const http = require('http');
const conf = require('./app/config').server;
const nunconf = require('./app/config').nunjucks;
const api = require('./app/api');
const router = require('./app/routes');
const error = require('./app/lib/error');

/**
 * Module Server
 * ---
 * The server's core module. It sets up the express app configures the view
 * renderer and gives methods for starting and stopping the server.
 * @module server
 * @see {@link module:api}
 */


let app = express();

if(typeof conf['request-delay'] == 'number' && conf['request-delay'] > 0) {
  app.use((req, res, next) => {
    setTimeout(next, conf['request-delay']);
  });
}

if(typeof conf['response-delay'] == 'number' && conf['response-delay'] > 0) {
  let _end = app.response.end;
  app.response.end = function(...p) {
    setTimeout(() => { _end.call(this, ...p); }, conf['response-delay']);
  };
}

// CORS
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  try {
    return next();
  } catch(err) {
    return next(err);
  }
});

// body-parser
app.use(bodyParser.json({
  type: 'application/json'
}));
app.use(bodyParser.urlencoded({
  extended: true,
  type: 'application/x-www-form-urlencoded'
}));

app.use((req, res, next) => {
  console.log(req.body);
  next();
});

app.use(session({
  secret: conf.session.secret,
  resave: conf.session.resave,
  saveUninitialized: conf.session['save-uninitialized'],
  cookie: {
    secure: conf.session.cookie.secure,
    maxAge: conf.session.cookie['max-age']
  }
}));

nunjucks.configure(path.join(__dirname, 'views'), {
  autoescape: nunconf.autoescape,
  noCache: nunconf['no-cache'],
  express: app
});

/**@type {http.Server} */
let server;

module.exports.start = function start() {
  server = app.listen(conf.port, () => {
    console.log('listening on port ' + conf.port);

    router(app);

    console.log('initializing api');
    api.init(app).then(() => {
      app.use(error.handler);
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
