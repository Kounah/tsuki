const Response = require('../../lib/response').Response;
// eslint-disable-next-line no-unused-vars
const model = require('./model');

/**
 * @typedef {Object} LoginResponseDataProperties
 * @prop {String} redirectUrl a url to redirect to
 * @prop {model|model.UserProperties} user
 */
class LoginResponseData {
  /**
   * creates a new LoginResponseData
   * @param {LoginResponseDataProperties} props
   */
  constructor(props) {
    if(typeof props !== 'object' || props === null)
      throw new TypeError('\'props\' is not an object');

    /**@type {String} */
    this.redirectUrl;
    /**@type {model|model.UserProperties} */
    this.user;

    if(typeof props.redirectUrl === 'string')
      this.redirectUrl = props.redirectUrl;

    if(typeof props.user === 'object' && props.user instanceof model)
      this.user = props.user;
  }
}

class LoginResponse extends Response {
  /**
   * creates a new LoginResponse
   * @param {Object} props
   * @param {Boolean} success
   * @param {LoginResponseData} data
   */
  constructor(props) {
    if(typeof props !== 'object' || props === null)
      throw new TypeError('\'props\' is not an object');

    super({
      success: props.success,
      type: 'LoginResponseData',
      data: props.data
    });

    /**@type {LoginResponseData} */
    this.data;
  }
}

module.exports = {
  LoginResponse,
  LoginResponseData
};