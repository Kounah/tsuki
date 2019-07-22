const user = require('./user');
const mongooselib = require('../lib/mongoose');
const config = require('../config');
// eslint-disable-next-line no-unused-vars
const express = require('express');

/**
 * API
 * ---
 * index module for the API
 * @namespace api
 * @module index
 * @see {@link module:api/user}
 */

/**
 * @param {express.Application} app
 */
module.exports.init = async function init(app) {
  console.log('connecting to database');
  await mongooselib.connect();
  console.log('connected to database');

  if(typeof app === 'undefined')
    throw new TypeError('\'app\' is not defined');

  if(config.apis.v1.user) user.router(app);
};

module.exports.user = user;