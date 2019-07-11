const RequestError = require('./RequestError');

/**
 * @typedef {Object} ForbiddenActionErrorParams
 * @property {String} action the action that was tried
 * @property {String} reason the reason why it's forbidden
 * @property {Error} inner inner Error
 */

module.exports = class ForbiddenActionError extends RequestError {
  /**
   * creates a new Forbidden Action Error
   * @param {ForbiddenActionErrorParams} params constructor parameters
   */
  constructor(params) {
    if(typeof params !== 'object')
      throw new TypeError('\'params\' is not an object');
    if(typeof params.action !== 'string')
      throw new TypeError('\'params.action\' is not a string');
    if(typeof params.reason !== 'string')
      throw new TypeError('\'params.reason\' is not a string');

    super({
      message: `This action is not allowed.\nYour action: ${params.action}\nReason: ${params.reason}`,
      status: 403,
      inner: params.inner
    });

    /**@type {string} */
    this.action = params.action;
    /**@type {string} */
    this.reason = params.reason;
  }
};