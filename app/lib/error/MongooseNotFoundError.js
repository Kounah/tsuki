const RequestError = require('./RequestError');
// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose');

/**
 * @typedef {Object} MongooseNotFoundErrorParams
 * @property {mongoose.Query} query
 * @property {Error} inner
 */

module.exports = class MongooseNotFoundError extends RequestError {
  /**
   * creates a new Mongoose Not Found Error
   * @param {MongooseNotFoundErrorParams} params
   */
  constructor(params) {
    super({
      data: {},
      inner: params.inner,
      message: 'the given query did not return any results',
      name: 'MongooseNotFoundError',
      status: 404
    });

    this.query = params.query.getQuery();
  }
};