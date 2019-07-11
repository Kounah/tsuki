const RequestError = require('./RequestError');

/**
 * @typedef {Object} Resource
 * @property {String} name the resources name that could not be found
 * @property {String} path the path of the resource if it is on the local fs
 * @property {String} uri the uri to the requested resource
 */

/**
 * @typedef {Object} NotFoundErrorParams
 * @property {Resource} resource the resource
 * @property {Error} inner inner error
 */

module.exports = class NotFoundError extends RequestError {
  /**
   * creates a new Not Found Error
   * @param {NotFoundErrorParams} params constructor parameters
   */
  constructor(params) {
    if(typeof params !== 'object')
      throw new TypeError('\'params\' is not an object.');
    if(typeof params.resource !== 'object')
      throw new TypeError('\'params.resource\' is not an object.');

    super({
      message: `The requested resource (${params.resource.name}) could not be found at ${params.resource.path || params.resource.uri}.`,
      status: 404,
      inner: params.inner
    });

    /**@type {Resource} */
    this.resource = params.resource;
  }
};

