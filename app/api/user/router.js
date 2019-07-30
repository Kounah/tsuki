const handler = require('./handler');
// eslint-disable-next-line no-unused-vars
const express = require('express');
const config = require('../../config');

/**
 * handles the routes
 * @param {express.Application} app the express app
 */
module.exports = function router(app) {
  Array.from(Object.entries(handler))
    .map(entry => entry[1])
    .forEach(handler => handler.prefix(config.api.v1.prefix).attach(app));
};