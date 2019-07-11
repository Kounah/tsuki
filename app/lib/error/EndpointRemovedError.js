const RequestError = require('./RequestError');

/**
 * @typedef {Object} EndpointRemovedErrorParams
 * @property {Object} endpoint
 * @property {String} endpoint.path
 * @property {String} endpoint.description
 * @property {('GET'|'POST'|'DELETE'|'PUT'|'OPTIONS')} endpoint.method
 * @property {String} reason
 */

module.exports = class EndpointRemovedError extends RequestError {
  /**
   * creates a new Endpoint Removed Error
   * @param {EndpointRemovedErrorParams} params
   */
  constructor(params) {
    super({
      message: 'this endpoint has been removed',
      data: {},
      name: 'EndpointRemovedError',
      status: 410
    });

    this.endpoint = params.endpoint;
    this.reason = params.reason;
  }
};