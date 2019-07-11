const RequestError = require('./RequestError');

/**
 * @typedef {Object} Parameter
 * @property {string} name the name of the parameter
 * @property {string} description the parameters description
 * @property {string} location the parameters location
 * @property {string} type the type of the parameter
 */

/**
 * @typedef {Object} MissingParameterErrorParams
 * @property {Parameter} parameter the missing parameter
 * @property {*} value the value of the parameter
 * @property {Error} inner an inner error
 */

module.exports = class MissingParameterError extends RequestError {
  /**
   * Creates a new Missing Parameter Error
   * @param {MissingParameterErrorParams} params constructor parameters
   */
  constructor(params) {
    if(typeof params !== 'object')
      throw new TypeError('\'params\' is not an object.');

    if(typeof params.parameter !== 'object')
      throw new TypeError('\'params.parameter\' is not an object.');

    super({
      status: 400,
      message: `The parameter '${params.parameter.name}' was either missing in ${params.parameter.location} or it's type was not ${params.parameter.type}.\nDescription: ${params.parameter.description}\nValue: ${params.value}`,
      inner: params.inner
    });

    /**@type {Parameter} */
    this.parameter = params.parameter;
    /**@type {*} */
    this.value = params.value;
  }
};