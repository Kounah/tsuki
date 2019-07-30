const auth = require('../../lib/auth');
const error = require('../../lib/error');
const Handler = require('../../lib/handler');
const config = require('../../config');
const core = require('./core');
const model = require('./model');
const responses = require('./responses');

/**
 * Handler for the `POST` -> `/user` route
 */
module.exports.create = new Handler({
  enabled: config.api.v1.user.create,
  path: '/user',
  method: 'POST'
})
  .register(auth.handleCheck)
  .registerAsync(async (req, res) => {
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
  .register(auth.handleSession({
    invert: true
  }))
  .registerAsync(async (req, res) => {
    if(typeof req.body !== 'object')
      throw new TypeError('\'body\' is not an object');

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
        value: req.body.login,
        inner: new TypeError('\'req.body.login\' was not a string')
      });

    if(typeof req.body.password !== 'string')
      throw new error.MissingParameterError({
        parameter: {
          name: 'password',
          type: 'String',
          description: 'the user\'s password',
          location: 'body'
        },
        value: req.body.password,
        inner: new TypeError('\'req.body.password\' was not a string')
      });

    let user = await core.byLoginPassword(req.body.login, req.body.password, {
      plainPassword: plainPassword
    });

    if(typeof user === 'object' && user !== null && user instanceof model) {
      req.session.user = user;

      if(req.accepts('json')) {
        res.json(new responses.LoginResponse({
          success: true,
          data: new responses.LoginResponseData({
            redirectUrl: req.body.redirectUrl,
            user: user
          })
        }));
      } else {
        if(typeof req.body.redirectUrl === 'string')
          res.redirect(req.body.redirectUrl);
        else res.status(200).redirect('/account');
      }

    } else throw new error.UnauthorizedError({
      authorization: {
        method: 'session'
      },
      inner: new Error('incorrect username/password')
    });
  });

module.exports.register = new Handler({
  enabled: config.api.v1.user.register,
  path: '/user/register',
  method: 'POST'
})
  .register(auth.handleSession({
    invert: true
  }))
  .registerAsync(async (req, res) => {
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

module.exports.logout = new Handler({
  enabled: config.api.v1.user.logout,
  path: '/user/logout',
  method: 'POST'
})
  .register(auth.handleSession())
  .register((req, res) => {
    if(typeof req.body !== 'object' || req.body === null)
      throw new TypeError('\'req.body\' was not an object');

    req.session.user = null;
    delete req.session.user;

    if(typeof req.body.redirectUrl === 'string' && Boolean(req.body.redirectUrl))
      res.redirect(req.body.redirectUrl);
    else res.redirect('/');
  });