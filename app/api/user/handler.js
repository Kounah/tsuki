const auth = require('../../lib/auth');
const error = require('../../lib/error');
const Handler = require('../../lib/handler');
const config = require('../../config');
const core = require('./core');

/**
 * user handler
 * ---
 * @namespace handler
 * @memberof module:api/user
 */


/**
 * Handler for the `POST` -> `/user` route
 */
module.exports.create = new Handler({
  enabled: config.api.v1.user.create,
  path: '/user',
  method: 'POST'
})
  .register(error.handler, {unshift: true})
  .register(auth.handleCheck)
  .register(async (req, res) => {
    let user = await core.create(req.body, {
      plainPassword: typeof req.query.plainPassword == 'string'
    });

    res.status(201);
    switch(req.headers['accept']) {
    case 'application/json':
      res.json(user);
      break;
    case 'text/html':
      res.render('user', user);
      break;
    default:
      res.sendStatus(201);
      break;
    }
  });

/**
 * Handler for the `POST` -> `/user/login` route
 */
module.exports.login = new Handler({
  enabled: config.api.v1.user.login,
  path: '/user/login',
  method: 'POST'
})
  .register(error.handler, {unshift: true})
  .register(auth.handleSession({
    invert: true
  }))
  .register(async (req, res) => {
    if(typeof req.body !== 'object')
      throw new TypeError('\'body\' is not');

    let plainPassword = true;
    if(typeof req.body.plainPassword !== 'undefined')
      plainPassword = Boolean(req.body.plainPassword);


    if(typeof req.body.login !== 'string')
      throw new error.MissingParameterError({
        parameter: {
          name: 'login',
          type: 'String',
          description: 'the user\'s name or email',
          location: 'body'
        },
        value: req.body.login
      });

    if(typeof req.body.password !== 'string')
      throw new error.MissingParameterError({
        parameter: {
          name: 'password',
          type: 'String',
          description: 'the user\'s password',
          location: 'body'
        },
        value: req.body.password
      });

    let user = await core.byLoginPassword(req.body.login, req.body.password, {
      plainPassword: plainPassword
    });

    req.session.user = user;

    if(typeof req.body.redirectUrl === 'string')
      res.redirect(req.body.redirectUrl);
    else res.redirect('/account');
  });

module.exports.register = new Handler({
  enabled: config.api.v1.user.register,
  path: '/user/register',
  method: 'POST'
})
  .register(error.handler, {unshift: true})
  .register(auth.handler({
    invert: true
  }))
  .register(async (req, res) => {
    // required props
    if(typeof req.body !== 'object' || req.body === null)
      throw new TypeError('\'req.body\' was not an object');

    let user = core.create(req.body, {
      plainPassword: typeof req.body.plainPassword !== 'undefined' && Boolean(req.body.plainPassword)
    });

    req.session.user = user;
    if(typeof req.body.redirecturl === 'string')
      res.redirect(req.body.redirectUrl);
    else res.redirect('/account');
  });