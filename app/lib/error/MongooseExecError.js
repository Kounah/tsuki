const RequestError = require('./RequestError');
// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose');

/**
 * @typedef {Object} MongooseExecErrorParams
 * @property {mongoose.Query} query
 * @property {Error} inner
 */

module.exports = class MongooseExecError extends RequestError {
  /**
   * creates a new Request Error
   * @param {MongooseExecErrorParams} params
   */
  constructor(params) {
    super({
      data: {
        query: params.query.getQuery()
      },
      message: 'an Error occured executing a mongoose query',
      name: 'MongooseExecError',
      inner: params.inner,
      status: 500
    });
  }
};