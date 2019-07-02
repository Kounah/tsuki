const User = require('./model');
// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * creates a new User
 * @param {User.UserProperties} properties raw properties\
 * password by default expects a hex-digested sha512 hash,
 * the option `plainPassword` creates the hash from the given string\
 * _id, _created, _updated are ignored
 * @param {Object} options
 * @param {Boolean} options.plainPassword
 * @throws {mongoose.Error}
 * @returns {User.UserProperties} a created object of the User Model
 */
module.exports.create = async function (properties, options) {
  if(typeof properties !== 'object')
    throw TypeError('\'properties\' is not an Object');

  delete properties._id;
  delete properties._created;
  delete properties._updated;

  if(typeof options == 'object') {
    if(typeof options.plainPassword == 'boolean' && options.plainPassword) {
      properties.password = crypto.createHash('sha512')
        .update(properties.password)
        .digest('hex');
    }
  }

  /**@type {User|User.UserProperties}*/
  let user = new User(properties);

  return await user.save();
};

/**
 * validates if the given username/password combination exists
 * @param {Object} params
 * @param {String} params.login the Users login name
 * @param {String} params.password hex digested sha512 hash of the password\
 * can be plain text when option plain password is set
 * @param {Object} options
 * @param {Boolean} options.plainPassword
 * @throws {mongoose.Error}
 * @returns {Boolean}
 */
module.exports.validate = async function (params, options) {
  if(typeof options == 'object') {
    if(typeof options.plainPassword == 'boolean' && options.plainPassword) {
      params.password = crypto.createHash('sha512')
        .update(params.password)
        .digest('hex');
    }
  }

  let q = User.findOne({
    login: params.login,
    password: params.password
  });

  let user = await q.exec();
  return typeof user == 'object' && user !== null;
};

/**
 * checks if the User exists
 * @param {User.UserProperties} properties
 * @returns {Boolean}
 */
module.exports.exists = async function (properties) {
  let q = User.findOne(properties);

  let user = await q.exec();
  return typeof user == 'object' && user !== null;
};