const handler = require('./handler');
// eslint-disable-next-line no-unused-vars
const express = require('express');
const config = require('../../config');

/**
 * user router
 * ---
 * binds the users handlers to their routes
 * @namespace router
 * @memberof module:api/user
 */

/**
 * handles the routes
 * @param {express.Application} app the express app
 */
module.exports = function router(app) {
  handler.create.prefix(config.api.v1.prefix).attach(app);
};