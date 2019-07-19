const process = require('process');
const ucfg = require('./user-config');

let uconfig = ucfg.load();

function jsonpath(o, ...path) {
  try {
    if(path.length > 0) {
      let cur = path.shift();
      return jsonpath(o[cur], ...path);
    } else {
      return o;
    }
  } catch(err) {
    return undefined;
  }
}

/**
 * handles the settings
 * @param {String} name - setting name\
 * no property name may include `.` since the name consists of a dot-separated
 * list of property names
 * @param {*} defaultvalue - the default value of the setting
 * @param {(val:*) => *} vcb - value callback\
 * a callback executed on `val`
 */
function setting(name, defaultvalue, vcb) {
  let val =  process.env[`tsuki.${name}`] ||
    jsonpath(uconfig, ...name.split('.')) ||
    defaultvalue;
  if(typeof vcb === 'function')
    val = vcb(val);
  return val;
}

function ifEmptyString(returnvalue) {
  return function (val) {
    return /\s*/.test(val) ? val : returnvalue;
  };
}

// configures the connection to the database
module.exports.database = {
  host:       setting('database.host',      '127.0.0.1'),
  port:       setting('database.port',      27017, (val) => Number(val)),
  name:       setting('database.name',      'tsuki'),
  username:   setting('database.username',  '', ifEmptyString(undefined)),
  password:   setting('database.password',  '', ifEmptyString(undefined))
};

// configures the server
module.exports.server = {
  port: setting('server.port', 5000, (val) => Number(val)),
  'request-delay': setting('server.request-delay', 0, (val) => Number(val)),
  'response-delay': setting('server.request-delay', 0, (val) => Number(val)),
  session: {
    secret: setting('server.session.secret', ((os, crypto, package) => {
      return crypto.createHash('sha512').update([
        package['name'],
        package['version'],
        os.userInfo().username,
        os.hostname(),
        os.platform(),
        os.arch(),
        os.release(),
        os.type()
      ].join(':')).digest('hex');
    })(require('os'), require('crypto'), require('../package.json'))),
    resave: setting('server.session.resave', false, val => Boolean(val)),
    'save-uninitialized': setting('server.session.save-uninitialized', true, val => Boolean(val)),
    cookie: {
      secure: setting('server.session.cookie.secure', true, val => Boolean(val)),
      'max-age': setting('server.session.cookie.max-age', null, val => eval(val))
    }
  }
};

// configures credentials
module.exports.credentials = {
  admin: {
    username: setting('credentials.admin.username', 'admin'),
    password: setting('credentials.admin.password', '$admin0!')
  },
  _rules: {
    user: {
    }
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
      login: setting('api.v1.user.login', true),
      register: setting('api.v1.user.register', true)
    }
  }
};

module.exports.nunjucks = {
  autoescape: setting('nunjucks.autoescape', true),
  'no-cache': setting('nunjucks.no-cache', false),
};

module.exports.pages = {
  index: setting('pages.index', true),
  login: setting('pages.login', true),
  register: setting('pages.register', true)
};

module.exports.templates = {
  'use-no-cache': setting('templates.use-no-cache', true),
  validation: {
    'user-min-pwd-length': setting('templates.validation.user-min-pwd-length', 8, val => Number(val))
  }

};
console.log('config:', module.exports);

ucfg.create(module.exports);