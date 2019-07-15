// eslint-disable-next-line no-unused-vars
const express = require('express');
const error = require('../lib/error');
const config = require('../config').pages;

/**
 * handles a disabled config
 * @param {Boolean} val configuration if allowed
 */
function configEnabledHandler(val, description) {
  /**
   * @param {express.Request} req
   * @param {express.Response} res
   * @param {() => void} next
   */
  return function(req, res, next) {
    if(val) next();
    else throw new error.EndpointRemovedError({
      endpoint: {
        method: req.method,
        path: req.path,
        description: description || 'no description',
      },
      reason: 'disabled by config'
    });
  };
}

/**
 * @typedef {Object} DefaultProps
 * @prop {Object} session
 */

/**
 * handles rendering a template with the default properties
 * @param {String} name template name
 * @param {(props: Object.<DefaultProps>, req: express.Request, res: express.Response) => Object} extender an extender function to be called with the object
 */
function handleRender(name, extender) {
  /**
   * @param {express.Request} req
   * @param {express.Response} res
   */
  return function(req, res) {
    /**@type {DefaultProps} */
    let o = {
      session: req.session
    };

    if(typeof extender == 'function') {
      o = extender(o, req, res);
    }

    res.render(name, o);
  };
}

module.exports = function(app) {
  app.get('/',
    error.handler,
    configEnabledHandler(config.index, 'the servers index file'),
    handleRender('index.html'));

  app.get('/login',
    error.handler,
    configEnabledHandler(config.login, 'the login form'),
    handleRender('login.html', (o, req, res) => {
      o.returnURL = req.headers.referer;
      return o;
    }));

  app.get('/register',
    error.handler,
    configEnabledHandler(config.register, 'the register form'),
    handleRender('register.html'));
};