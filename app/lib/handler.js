// eslint-disable-next-line no-unused-vars
const express = require('express');
const error = require('./error');
const amw = require('./async-middleware');

/**
 * @typedef {(req: express.Request, res: express.Response, next: function) => void} HandlerFunction
 */

/**
 * @typedef {("POST"|"GET"|"PUT"|"DELETE"|"OPTIONS")} Method
 */

module.exports = class Handler {
  /**
   * @param {Object} params
   * @param {Method} params.method
   * @param {String} params.path
   * @param {String} params.prefix
   * @param {Boolean} params.enabled
   */
  constructor(params) {
    if(typeof params !== 'object')
      throw new TypeError('properties was not an Object');

    if(typeof params.method === 'string')
      /**@type {Method} */
      this._method = params.method;
    else
      this._method = 'GET';
    if(typeof params.path === 'string') this._path = params.path;
    if(typeof params.prefix === 'string') this._prefix = params.prefix;

    if(typeof params.enabled === 'boolean') this._enabled = params.enabled;

    /**@type {Array.<HandlerFunction>} */
    this.handlers = [];

    this.path = this.path.bind(this);
    this.method = this.method.bind(this);
    this.prefix = this.prefix.bind(this);
    this.enabled = this.enabled.bind(this);

    this.register = this.register.bind(this);
    this.registerAsync = this.registerAsync.bind(this);
    this.attach = this.attach.bind(this);

    this.register(function handleEnabled(req, res, next) {
      if(this._enabled) next();
      else throw new error.ForbiddenActionError({
        action: `${this._method} ${this._prefix}${this._path}`,
        reason: 'this route has been disabled by configuration'
      });
    }.bind(this));
  }

  /**
   * set/get the _path property
   * @param {String} val
   */
  path(val) {
    if(typeof val === 'string') {
      this._path = val;
      return this;
    } else return this._path;
  }

  /**
   * set/get the _prefix property
   * @param {String} val
   */
  prefix(val) {
    if(typeof val === 'string') {
      this._prefix = val;
      return this;
    } else return this._prefix;
  }

  /**
   * set/get the _method property
   * @param {Method} val
   */
  method(val) {
    if(typeof val === 'string') {
      this._method = val;
      return this;
    } else return this._method;
  }

  /**
   * set/get the _enabled property
   * @param {Boolean} val
   */
  enabled(val) {
    if(typeof val === 'boolean') {
      this._enabled = val;
      return this;
    } else return this._enabled;
  }

  /**
   * registers a new handler (at the end of the execution chain)
   * @param {HandlerFunction} fn
   * @param {Object} options
   * @param {HandlerFunction} options.before
   * @param {HandlerFunction} options.after
   * @param {Boolean} options.unshift append the function at the beginning
   */
  register(fn, options) {
    if(typeof options === 'object') {
      if(options.before) {
        this.handlers = this.handlers.splice(this.handlers.indexOf(options.before - 1), 0, fn);
        return this;
      } else if(options.after) {
        this.handlers = this.handlers.splice(this.handlers.indexOf(options.after), 0, fn);
        return this;
      }

      if(options.unshift) {
        this.handlers.unshift(fn);
        return this;
      }
    }

    this.handlers.push(fn);
    return this;
  }

  /**
   * registers a new handler (at the end of the execution chain) and wraps it
   * inside of a async-middleware
   * @param {HandlerFunction} fn
   * @param {Object} options
   * @param {HandlerFunction} options.before
   * @param {HandlerFunction} options.after
   * @param {Boolean} options.unshift append the function at the beginning
   */
  registerAsync(fn, options) {
    this.register(amw(fn), options);
    return this;
  }

  /**
   * attaches the handler to an express application
   * @param {express.Application} app
   */
  attach(app) {
    switch(this._method) {
    case 'GET':
      app.get(this._prefix + this._path, ...this.handlers);
      break;
    case 'POST':
      app.post(this._prefix + this._path, ...this.handlers);
      break;
    case 'PUT':
      app.put(this._prefix + this._path, ...this.handlers);
      break;
    case 'DELETE':
      app.delete(this._prefix + this._path, ...this.handlers);
      break;
    case 'OPTIONS':
      app.options(this._prefix + this._path, ...this.handlers);
      break;
    default:
      throw new Error('Invalid Method: ' + this._method);
    }
  }
};