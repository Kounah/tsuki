// eslint-disable-next-line no-unused-vars
const express = require('express');

/**
 * wrapper function for async middleware
 * @param {(req: express.Request, res: express.Response, next: (err: Error) => void) => void} fn
 */
module.exports = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    next(err);
  });
};