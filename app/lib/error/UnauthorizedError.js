const RequestError = require('./RequestError');

/**
 * @typedef {Object} Authorization
 * @property {String} raw the string as it was parsed from
 * - header
 * - body
 * - query
 * @property {String|('Basic')} method the authorization method
 * that was parsed from `raw`
 * @property {String|Array.<String>} content the content that was parsed from `raw`
 */

/**
 * @typedef {Object} UnauthorizedErrorParams
 * @property {Authorization} authorization the authorization that was send to the server
 * @property {Object} data some data that might be useful to be logged
 * @property {Error} inner inner error
 */

module.exports = class UnauthorizedError extends RequestError {
  /**
   * creates a new Unauthorized Error
   * @param {UnauthorizedErrorParams} params constructor parameters
   */
  constructor(params) {
    if(typeof params !== 'object')
      throw new TypeError('\'params\' is not an object');

    super({
      message: 'Your request was missing valid authorization.' +
        `Got method='${params.authorization.method}' content='${params.authorization.content}'`,
      status: 401,
      inner: params.inner
    });

    /**@type {Authorization} */
    this.authorization = params.authorization;
    this.data = params.data;
  }
};