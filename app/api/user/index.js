const core = require('./core');
const model = require('./model');
const permissions = require('./permissions');
const handler = require('./handler');
const router = require('./router');

/**
 * user index module
 * ---
 * - [ ] [core](./core.js) main collection of logic
 * - [x] [model](./model.js) the mongoose model
 * - [x] [permissions](./permissions.js)
 * - [x] [handler](./handler.js)
 * - [x] [router](./router.js) the express router
 * @module api/user
 * @memberof module:api
 * @see {@link module:api/user.core}
 * @see {@link module:api/user.model}
 * @see {@link module:api/user.permissions}
 * @see {@link module:api/user.handler}
 * @see {@link module:api/user.router}
 */


module.exports = {
  core,
  model,
  permissions,
  handler,
  router
};