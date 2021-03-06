const process = require('process');
const ucfg = require('./user-config');
const pregex = require('./lib/parse-regular-expression');

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

module.exports.__keys = [];

/**
 * handles the settings
 * @param {Object} params
 * @param {String} params.key - setting name\
 * no property name may include `.` since the name consists of a dot-separated
 * list of property names
 * @param {*} params.def - the default value of the setting
 * @param {(val:*) => *} params.mod - value modifier callback\
 * a callback executed on `val`
 */
function setting(params) {
  if(typeof params !== 'object' || params === null)
    throw new TypeError('\'params\' was not an object');

  if(typeof params.key !== 'string' || !params.key)
    throw new TypeError('\'params.key\' was not a string or falsy');

  let envval = process.env[`tsuki.${params.key}`];
  let userconfval = jsonpath(uconfig, ...params.key.split('.'));
  let val = typeof envval !== 'undefined'
    ? envval
    : typeof userconfval !== 'undefined'
      ? userconfval
      : params.def;
  if(typeof params.mod === 'function')
    val = params.mod(val);

  module.exports.__keys.push({
    key: params.key,
    def: params.def,
    val: val,
    mod: params.mod
  });
  return val;
}

function ifEmptyString(returnvalue) {
  return function (val) {
    return /\s*/.test(val) ? val : returnvalue;
  };
}

const timespanPat = /^(([1-9][0-9]*)d){0,1}(([1-9][0-9]*)h){0,1}(([1-9][0-9]*)m){0,1}(([1-9][0-9]*)s){0,1}([1-9][0-9]*){0,1}$/gm;
/**
 * parses a timespan string
 * @param {String|Number} val
 * `typeof val === 'string'`:
 * - parses the string as a timestring to a number representing the total milliseconds
 *   of that timespan
 * - `1d2h3m4s5` would be the string for 1 day, 2 hours, 3 minutes, 4 seconds and 5 milliseconds
 * - the least valid string you can parse is `'1'` since anything that fails returns
 *  `0`
 * `typeof val === 'number'`:
 * - parses the number to a timestring, is working the other direction as `typeof val === 'string'`
 */
function parseTimespan(val) {
  if(typeof val === 'string') {
    if(val === 'null') return null;

    let m;
    let pat = new RegExp(timespanPat, 'gm');
    while((m = pat.exec(val)) !== null) {
      if(m.index === pat.lastIndex) {
        pat.lastIndex++;
      }

      return 0 +
        (Number(m[9]) || 0) +
        (Number(m[8]) || 0) * 1000 +
        (Number(m[6]) || 0) * 1000 * 60 +
        (Number(m[4]) || 0) * 1000 * 60 * 60 +
        (Number(m[2]) || 0) * 1000 * 60 * 60 * 24;
    }
  } else if(typeof val === 'number') {
    if(isNaN(val)) return null;

    let _ = {
      d: 1000 * 60 * 60 * 24,
      h: 1000 * 60 * 60,
      m: 1000 * 60,
      s: 1000
    };

    let result = '';
    Array.from(Object.entries(_)).forEach(c => {
      let d = Math.floor(val / c[1]);
      result += d ? d + c[0] : '';
      val = val % c[1];
    });
    result += val || '';
    return result;
  } else if(typeof val === 'object' && val === null) {
    return null;
  } else throw new TypeError('unsupported type');
}

// configures the connection to the database
module.exports.database = {
  /**@type {String} */
  host: setting({
    key: 'database.host',
    def: '127.0.0.1'
  }),
  /**@type {Number} */
  port: setting({
    key: 'database.port',
    def: 27017,
    mod: val => Number(val)
  }),
  /**@type {String} */
  name: setting({
    key: 'database.name',
    def: 'tsuki'
  }),
  /**@type {String} */
  username: setting({
    key: 'database.username',
    def: '',
    mod: ifEmptyString(undefined)
  }),
  /**@type {String} */
  password: setting({
    key: 'database.password',
    def: '',
    mod: ifEmptyString(undefined)
  })
};

// configures the server
module.exports.server = {
  /**@type {Number} */
  'port': setting({
    key: 'server.port',
    def: 5000,
    mod: val => Number(val)
  }),
  /**@type {Number} */
  'request-delay': setting({
    key: 'server.request-delay',
    def: 0,
    mod: val => Number(val)
  }),
  'response-delay': setting({
    key: 'server.response-delay',
    def: 0,
    mod: val => Number(val)
  }),
  'session': {
    /**@type {String} */
    'secret': setting({
      key: 'server.session.secret',
      // creating the secret for the system it runs on
      def: ((os, crypto, package) => {
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
      })(require('os'), require('crypto'), require('../package.json'))
    }),
    /**@type {Boolean} */
    'resave': setting({
      key: 'server.session.resave',
      def: true,
      mod: val => Boolean(val)
    }),
    /**@type {Boolean} */
    'save-uninitialized': setting({
      key: 'server.session.save-uninitialized',
      def: true,
      mod: val => Boolean(val)
    }),
    'cookie': {
      /**@type {Boolean} */
      'secure': setting({
        key: 'server.session.cookie.secure',
        def: true,
        mod: val => Boolean(val)
      }),
      /**@type {Number} */
      'max-age': setting({
        key: 'server.session.cookie.max-age',
        def: null,
        mod: val => parseTimespan(val)
      }),
      'expires': setting({
        key: 'server.session.cookie.expires',
        def: new Date(new Date().setUTCFullYear(new Date().getUTCFullYear() + 1)),
        mod: val => new Date(val)
      })
    }
  },
  'security': {
    /**@type {Boolean} */
    'print-session': setting({
      key: 'server.security.print-session',
      def: false,
      mod: val => Boolean(val)
    }),
    /**@type {Boolean} */
    'print-session-json': setting({
      key: 'server.security.print-session-json',
      def: false,
      mod: val => Boolean(val)
    }),
  }
};

// configures credentials
module.exports.credentials = {
  admin: {
    /**@type {String} */
    username: setting({
      key: 'credentials.admin.username',
      def: 'admin'
    }),
    /**@type {String} */
    password: setting({
      key: 'credentials.admin.password',
      def: '$admin0!'
    })
  },
};

// enable or disable apis
module.exports.apis = {
  v1: {
    /**@type {Boolean} */
    user: setting({
      key: 'apis.v1.user',
      def: true,
      mod: val => Boolean(val)
    })
  }
};

module.exports.api = {
  v1: {
    /**@type {String} */
    prefix: setting({
      key: 'api.v1.prefix',
      def: '/api/v1'}),
    user: {
      /**@type {Boolean} */
      create: setting({
        key: 'api.v1.user.create',
        def: true,
        mod: val => Boolean(val)
      }),
      /**@type {Boolean} */
      login: setting({
        key: 'api.v1.user.login',
        def: true,
        mod: val => Boolean(val)
      }),
      /**@type {Boolean} */
      register: setting({
        key: 'api.v1.user.register',
        def: true,
        mod: val => Boolean(val)
      }),
      /**@type {Boolean} */
      logout: setting({
        key: 'api.v1.user.logout',
        def: true,
        mod: val => Boolean(val)
      }),

      validation: {
        username: {
          /**@type {RegExp} */
          'pattern': setting({
            key: 'api.v1.user.validation.username.pattern',
            def: /^[a-zA-Z]+[-_a-zA-Z0-9]*$/gm,
            mod: pregex
          }),
          /**@type {Number} */
          'min-length': setting({
            key: 'api.v1.user.validation.username.min-length',
            def: 4,
            mod: val => Number(val)
          }),
          /**@type {Number} */
          'max-length': setting({
            key: 'api.v1.user.validation.username.max-length',
            def: 20,
            mod: val => Number(val)
          })
        },
        password: {
          /**@type {RegExp} */
          'pattern': setting({
            key: 'api.v1.user.validation.password.pattern',
            def: /^.*$/,
            mod: pregex
          }),
          /**@type {Number} */
          'min-length': setting({
            key: 'api.v1.user.validation.password.min-length',
            def: 8,
            mod: val => Number(val)
          }),
          /**@type {Number} */
          'max-length': setting({
            key: 'api.v1.user.validation.password.max-length',
            def: 512,
            mod: val => Number(val)
          })
        }
      }
    }
  }
};

module.exports.nunjucks = {
  /**@type {Boolean} */
  'autoescape': setting({
    key: 'nunjucks.autoescape',
    def: true,
    mod: val => Boolean(val)
  }),
  /**@type {Boolean} */
  'no-cache': setting({
    key: 'nunjucks.no-cache',
    def: false,
    mod: val => Boolean(val)
  }),
};

module.exports.pages = {
  /**@type {Boolean} */
  index: setting({
    key: 'pages.index',
    def: true,
    mod: val => Boolean(val)
  }),
  /**@type {Boolean} */
  login: setting({
    key: 'pages.login',
    def: true,
    mod: val => Boolean(val)
  }),
  /**@type {Boolean} */
  register: setting({
    key: 'pages.register',
    def: true,
    mod: val => Boolean(val)
  })
};

module.exports.templates = {
  /**@type {Boolean} */
  'use-no-cache': setting({
    key: 'templates.use-no-cache',
    def: true,
    mod: val => Boolean(val)
  }),
};

console.log('config:', module.exports);

ucfg.create(module.exports);