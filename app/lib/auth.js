/**
 * The Authorization module
 * @module app/lib/auth
 */

// eslint-disable-next-line no-unused-vars
const express = require('express');
const error = require('./error');
const user = require('../api/user');
const config = require('../config');
const amw = require('./async-middleware');

/**
 * generates a express request handler function using `options`
 * @param {Object} options
 * @param {Boolean} options.invert
 */
function handleCheck(options) {
  /**
   * @function check checks for authorization
   * @param {express.Request} req the express request
   * @param {express.Response} res the express response
   * @param {() => void} next the next function
   */
  return amw(async function check(req, res, next) {
    /**@type {String} */
    let authorization = req.headers['authorization']
      || req.body['__authorization']
      || req.query['__authorization'];

    let data = authorization.split(' ');
    let method = data.shift();

    /**
     * check for inverted option
     * if there is no header (or authorization body/query parameter) given and `options.invert`
     * is `true` the request will be rejected with an `ForbiddenActionError`
     */
    if(typeof options === 'object' && options !== null
    && typeof options.invert == 'boolean'
    && Boolean(options.invert)) {
      if(!/^[\s]*$/.test(method) && data.length > 0) {
        throw new error.ForbiddenActionError({
          action: req.method + ' ' + req.path,
          reason: 'This call requires you not to have any authorization set in header',
        });
      } else next();
    }

    if(method == 'Basic') {
      let credentials = Buffer.from(data.shift(), 'base64').toString('utf8').split(':');

      let login = credentials.shift();
      let password = credentials.shift();

      let valid = await user.api.validate({
        email: login,
        username: login,
        password: password
      }, {
        plainPassword: true
      });

      if(valid) {
        req.user = await user.api.findOne({
          email: login,
          password: password
        });

        next();
      } else {
        reject(req, res, new error.UnauthorizedError({
          authorization: {
            raw: authorization,
            method: method,
            content: data
          },
          data: {
            login: login,
            password: password
          }
        }), {
          method: 'Basic',
          data: {
            'realm': 'Our Site'
          }
        });
      }
    } else {
      reject(req, res, new error.UnauthorizedError({
        authorization: {
          raw: authorization,
          method: method,
          content: data
        }
      }), {
        method: 'Basic',
        data: {
          'realm': 'Our Site'
        }
      });
    }
  });
}
module.exports.handleCheck = handleCheck;

/**
 * reject a request and request authorization
 * @param {express.Request} req the express request
 * @param {express.Response} res the express response
 * @param {Error|error.RequestErrro} error the error that lead to rejection
 * @param {Object} options additional options
 * @param {String|('Basic')} options.method the method used for authentication
 * @param {Object.<string, string>} options.data the data added to
 * the WWW-Authenticate header
 */
function reject(req, res, err, options) {
  if(typeof options !== 'object') {
    res.set('WWW-Authenticate', 'Basic realm="Our Site"');
  } else {
    res.set('WWW-Authenticate', options.method + ' ' +
      Object.keys(options.data)
        .map(key => `${key}="${options.data[key]}"`)
        .join(' '));
  }

  let handled = error.handle(err);
  res.status(handled.status);

  switch(req.headers.accept) {
  case 'application/json':
    res.json(handled);
    break;
  case 'text/html':
    res.render('error', {
      error: handled
    });
    break;
  default:
    res.sendStatus(handled.status);
    break;
  }
}
module.exports.reject = reject;

/**
 * gets the content of the session using the config
 * @param {Object} session
 */
function sessionContent(session) {
  config.server.security['print-session']
    ? config.server.security['print-session-json']
      ? JSON.stringify(session)
      : Object.entries(session).map(_ => `${_[0]}: ${_[1]}`)
    : 'for security reasons, sessions willl not be printed';
}

/**
 *
 * @param {Object} options additional options
 * @param {Boolean} options.invert
 */
function handleSession(options) {
  // shorten the code by saving the test for options.invert in a local var
  let _invert = typeof options === 'object' && options !== null
    && typeof options.invert !== 'undefined' && Boolean(options.invert);

  /**
   * handles session authorization
   * @param {express.Request} req
   * @param {express.Response} res
   * @param {() => void} next
   */
  return amw(async function check(req, res, next) {
    // type check for req.session
    if(typeof req.session !== 'object' || req.session === null) {
      // req session is non null object
      // checking for req.session.user
      if(typeof req.session.user !== 'object' || req.session.user === null || req.session.user instanceof user.model) {
        // req.session.user is non null object and instance of user.model
        // get u from database for validation
        let u = await user.core.byLoginPassword(req.session.user.email || req.session.user.login, req.session.user.password, {plainPassword: false});

        // check for u
        if(typeof u === 'object' && u !== null && u instanceof user.model) {
          // u is non null object
          // req.session.user is a valid user, u being not null confirms that

          // updating req.session.user
          req.session.user = u;

          // handle options.invert
          if(_invert) {
            // iverting the checks result by throwing an ForbiddenActionError
            throw new error.ForbiddenActionError({
              action: req.method + ' ' + req.path,
              reason: 'This call requires you not to have any authorization in the session',
            });
          } else {
            // it is a valid session -> continue
            return next();
          }
        } else {
          // u was either not an object or null
          // -> mongodb did not have a user with this sessions user._id
          // -> session is invalid

          // delete session.user
          delete req.session.user;

          // handle options.invert
          if(_invert) {
            // inverting the checks result by continuing
            return next();
          } else {
            // throw an UnauthorizedError
            throw new error.UnauthorizedError({
              authorization: {
                method: 'Session',
                content: sessionContent(req.session),
                raw: 'N/A'
              },
              inner: new TypeError('\'u\' is not an object')
            });
          }
        }
      } else {
        // req.session.user is either not an object or null
        // there is no login in the session

        // handle options.invert
        if(_invert) {
          // invalid session and invert, continue
          return next();
        } else {
          // invalid session and not invert, throw
          throw new error.UnauthorizedError({
            authorization: {
              method: 'Session',
              content: sessionContent(req.session),
              raw: 'N/A'
            },
            inner: new TypeError('\'req.session.user\' is not an User')
          });
        }
      }
    } else {
      // req.session is either not an object or null
      if(_invert) {
        // invalid session and invert, continue
        return next();
      } else {
        // invalid session and not invert, throw
        throw new error.UnauthorizedError({
          authorization: {
            method: 'Session',
            content: sessionContent(req.session),
            raw: 'N/A'
          },
          inner: new TypeError('\'req.session\' is not an object')
        });
      }
    }
  });
}
module.exports.handleSession = handleSession;

/**
 * generates an auth check handler by certain options
 * @param {Object} options
 * @param {Object} options.session
 * @param {Boolean} options.session.use
 * @param {Boolean} options.session.invert
 * @param {Object} options.check
 * @param {Boolean} options.check.use
 * @param {Boolean} options.check.invert inverts the result (rejects when there is a valid login)
 */
module.exports.handler = function handler(options) {
  if(typeof options !== 'object' && options === null)
    throw new TypeError('\'options\' is not an Object');

  /**
   * the async function handling the request making use of the options in handler
   * @param {express.Request} req
   * @param {express.Response} res
   * @param {() => void} next
   */
  return amw(async function(req, res, next) {
    return await new Promise(resolve => {
      if(typeof options.session === 'object' && options.session !== null && Boolean(options.session))
        handleSession({
          invert: options.session.invert
        })(req, res, () => {
          resolve();
          next();
        });

      if(typeof options.check === 'object' && options.check !== null && Boolean(options.check))
        handleCheck({
          invert: options.check.invert
        })(req, res, () => {
          resolve();
          next();
        });
    });
  });
};