/**
 * @typedef {Object} RequestErrorParams
 * @property {String} message the error message
 * @property {Number} status the emitted status code
 * @property {Error} inner the inner Error
 * @property {Object|String|Number|Boolean|undefined} data some optional data
 */

module.exports = class RequestError extends Error {
  /**
   * creates a new Request Error
   * @param {RequestErrorParams|Error} params initialization parameters
   */
  constructor(params) {
    if(typeof params !== 'object') throw new TypeError('\'params\' was not an object.');
    super();

    /**@type {Number} */
    this.status;
    /**@type {Error|undefined} */
    this.inner;
    /**@type {Object|String|Number|Boolean|undefined} */
    this.data;

    this.stackTrace = this.stack.split('\n');
    this.stackTrace.shift();

    if(params instanceof Error) {
      this.message = 'An internal error occurred.';
      this.status = 500;
      this.inner = params;
    } else {
      if(typeof params.message !== 'string')
        throw new TypeError('\'params.message\' was not a string');
      if(typeof params.status !== 'number')
        throw new TypeError('\'params.status\' was not a number');

      this.message = params.message;
      this.status = params.status;

      if(typeof params.inner === 'object' && params.inner instanceof Error)
        this.inner = params.inner;

      if(typeof params.data === 'object')
        this.data = params.data;
    }
  }
};