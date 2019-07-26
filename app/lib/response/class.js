/**
 * @typedef {Object} ConstructorProperties
 * @prop {Boolean} success is the response a success
 * @prop {String} type the response data type (or constructor name if object)
 * @prop {*} data the data
 */

module.exports = class Response {
  /**
   * creates a new Response
   * @param {ConstructorProperties} props
   */
  constructor(props) {
    /**@type {Boolean} */
    this.success;
    /**@type {String} */
    this.type;
    /**@type {*} */
    this.data;

    if(typeof props !== 'object' || props === null)
      throw new TypeError('\'props\' is null or not an object');

    if(typeof props.success === 'boolean')
      this.success = props.success;
    else throw new TypeError('required property \'props.success\' is not a boolean');

    if(typeof props.type === 'string')
      this.type = props.type;
    else
      this.type = typeof props.data;

    this.data = props.data;
  }
};