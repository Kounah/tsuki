const core = require('./core');
const model = require('./model');
const handler = require('./handler');
const permissions = require('./permissions');
const responses = require('./responses');
const router = require('./router');
const validation = require('./validation');

/**
 * user index module
 * ---
 * - [x] [core](./core.js) main collection of logic
 * - [x] [model](./model.js) the mongoose model
 * - [x] [handler](./handler.js) route handler
 * - [x] [permissions](./permissions.js)
 * - [x] [responses](./responses.js) response structures
 * - [x] [router](./router.js) the express router
 * - [x] [validation](./validation.js) data validation
 */

module.exports = {
  core,
  model,
  handler,
  permissions,
  responses,
  router,
  validation
};