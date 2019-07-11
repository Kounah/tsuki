const process = require('process');
const ucfg = require('./user-config');

let uconfig = ucfg.load();

function setting(name, defaultvalue) {
  let val =  process.env[`tsuki.${name}`] ||
    uconfig[name] ||
    defaultvalue;
  return val;
}

// configures the connection to the database
module.exports.database = {
  host:       setting('database.host',      '127.0.0.1'),
  port:       setting('database.port',      '27017'),
  name:       setting('database.name',      'tsuki'),
  username:   setting('database.username',  undefined),
  password:   setting('database.password',  undefined)
};

// configures the server
module.exports.server = {
  port: setting('server.port', 5000)
};

// configures credentials
module.exports.credentials = {
  admin: {
    username: setting('credentials.admin.username', 'admin'),
    password: setting('credentials.admin.password', '$admin0!')
  }
};

module.exports.apis = {
  user: setting('apis.user', true)
};

module.exports.api = {
  v1: {
    prefix: setting('api.v1.prefix', '/api/v1'),
    user: {
      create: setting('api.v1.user.create', true),
    }
  }
};

ucfg.create(module.exports);