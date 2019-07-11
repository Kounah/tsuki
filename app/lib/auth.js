/**
 * The Authorization module
 * @module app/lib/auth
 */

// eslint-disable-next-line no-unused-vars
const express = require('express');
const error = require('./error');
const user = require('../api/user');

/**
 * @function check checks for authorization
 * @param {express.Request} req the express request
 * @param {express.Response} res the express response
 * @param {() => void} next the next function
 */
module.exports.check = async function check(req, res, next) {
  /**@type {String} */
  let authorization = req.headers['authorization']
    || req.body['__authorization']
    || req.query['__authorization'];

  let data = authorization.split(' ');
  let method = data.shift();

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
      this.reject(req, res, new error.UnauthorizedError({
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
    this.reject(req, res, new error.UnauthorizedError({
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
};

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
module.exports.reject = function reject(req, res, err, options) {
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
};