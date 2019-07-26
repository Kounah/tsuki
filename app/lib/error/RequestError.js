/**
 * @typedef {Object} RequestErrorParams
 * @property {String} message the error message
 * @property {Number} status the emitted status code
 * @property {Error} inner the inner Error
 * @property {Object|String|Number|Boolean|undefined} data some optional data
 */

const path = require('path');

const pat_node_modules = new RegExp(`^.*?\\${path.sep}node_modules\\${path.sep}.*$`, 'gm');
const pat_app = new RegExp(`^.*?\\${path.sep}app\\${path.sep}.*$`, 'gm');

function objectifyError(err) {
  return Object.getOwnPropertyNames(err)
    .map(key => ({key, value: err[key]}))
    .reduce((p, c) => {
      if(c.key == 'stack') {
        let stack = String(c.value).split('\n');
        p['stack'] = stack;
        p['stack_local'] = stack
          .map((line, lineNr) => ({line, lineNr}))
          .filter(_ => pat_app.test(_.line))
          .map(_ => `${_.lineNr}:${_.line}`);
        p['stack_modules'] = stack
          .map((line, lineNr) => ({line, lineNr}))
          .filter(_ => pat_node_modules.test(_.line))
          .map(_ => `${_.lineNr}:${_.line}`);
      } else {
        p[c.key] = c.value;
      }
      return p;
    }, {});
}

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
      this.inner = objectifyError(params);
    } else {
      if(typeof params.message !== 'string')
        throw new TypeError('\'params.message\' was not a string');
      if(typeof params.status !== 'number')
        throw new TypeError('\'params.status\' was not a number');

      this.message = params.message;
      this.status = params.status;

      if(typeof params.inner === 'object' && params.inner instanceof Error)
        this.inner = objectifyError(params.inner);

      if(typeof params.data === 'object')
        this.data = params.data;
    }

    this.moduleStack = this.stackTrace
      .map((line, index) => ({line, index}))
      .filter(_ => pat_node_modules.test(_.line))
      .map(_ => `${_.index}:${_.line}`);
    this.localStack = this.stackTrace
      .map((line, index) => ({line, index}))
      .filter(_ => pat_app.test(_.line))
      .map(_ => `${_.index}:${_.line}`);
  }
};