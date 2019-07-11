const auth = require('../../lib/auth');
const error = require('../../lib/error');
const Handler = require('../../lib/handler');
const core = require('./core');
const config = require('../../config');

/**
 * user handler
 * ---
 * @namespace handler
 * @memberof module:api/user
 */


/**
 * Handler for the `POST` -> `/user` route
 * @member {Handler} create
 */
module.exports.create = new Handler({
  enabled: config.api.v1.user.create,
  path: '/user',
  method: 'POST'
})
  .register(error.handler, {unshift: true})
  .register(auth.check)
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