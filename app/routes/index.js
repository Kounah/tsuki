// eslint-disable-next-line no-unused-vars
const express = require('express');
const pages = require('./pages');
const src = require('./src');

/**
 * @param {express.Application} app
 */
module.exports = function router(app) {
  pages(app);
  src(app);
};