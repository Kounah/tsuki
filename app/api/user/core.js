/**
 * User API
 * ---
 * @namespace core
 * @memberof module:api/user
 */

const User = require('./model');
// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * creates a new User
 * @param {User.UserProperties} properties raw properties
 * ***
 * password by default expects a hex-digested sha512 hash,
 * the option `plainPassword` creates the hash from the given string
 * ***
 * ignored properties:
 * - _id
 * - _created
 * - _updated
 * @param {Object} options additional options
 * @param {Boolean} options.plainPassword when set to true the password
 * parameter is hashed before it is used
 * @throws {mongoose.Error}
 * @returns {User.UserProperties} a created object of the User Model
 */
module.exports.create = async function create(properties, options) {
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
 * @param {String} params.email the users E-Mail address
 * @param {String} params.username the Users login name
 * @param {String} params.password hex digested sha512 hash of the password\
 * can be plain text when the option `plainPassword` is set
 * @param {Object} options
 * @param {Boolean} options.plainPassword
 * @throws {mongoose.Error}
 * @returns {Promise.<Boolean>}
 */
module.exports.validate = async function validate(params, options) {
  if(typeof options == 'object') {
    if(typeof options.plainPassword == 'boolean' && options.plainPassword) {
      params.password = crypto.createHash('sha512')
        .update(params.password)
        .digest('hex');
    }
  }

  let q = User.findOne({
    $or: [{
      username: params.username,
      password: params.password
    }, {
      email: params.email,
      password: params.password
    }]
  });

  let user = await q.exec();
  return typeof user == 'object' && user !== null;
};

/**
 * checks if the User exists
 * @param {User.UserProperties} properties the user properties
 * @returns {Promise.<Boolean>}
 */
module.exports.exists = async function exists(properties) {
  let q = User.findOne(properties);

  let user = await q.exec();
  return typeof user == 'object' && user !== null;
};

/**
 * @callback queryExtension
 * @param {mongoose.Query} query
 * @param {User.UserProperties} properties
 */

/**
 * find users by properties
 * @param {User.UserProperties} properties the user properties
 * @param {Object} options additional options
 * @param {queryExtension} options.qext
 * @param {Array.<String>} options.populate
 * @returns {Promise.<Array.<User|User.UserProperties>>}
 */
module.exports.find = async function find(properties, options) {
  let q = User.find(properties);

  if(typeof options == 'object') {
    if(typeof options.populate == 'object' && options.populate instanceof Array)
      options.populate.forEach(pop => q.populate(pop));
    if(typeof options.qext == 'function')
      await options.qext(q, properties);
  }

  let users = await q.exec();
  return users;
};

/**
 * find user by properties
 * @param {User.UserProperties} properties the user properties
 * @param {Object} options additional options
 * @param {queryExtension} options.qext
 * @param {Array.<String>} options.populate
 * @returns {Promise.<User|User.UserProperties>}
 */
module.exports.findOne = async function findOne(properties, options) {
  let q = User.findOne(properties);

  if(typeof options == 'object') {
    if(typeof options.populate == 'object' && options.populate instanceof Array)
      options.populate.forEach(pop => q.populate(pop));
    if(typeof options.qext == 'function')
      await options.qext(q, properties);
  }

  let user = await q.exec();
  return user;
};

/**
 * find a user by its login
 * @param {String} login email or username property
 * @param {String} passowrd hex digested sha512 hash of the password\
 * can be plain text if the option `plainPassword` is set
 * @param {Object} options additional options
 * @param {Boolean} options.plainPassword the password parameter is plain text
 * and needs to be hashed
 * @returns {Promise.<User|User.UserProperties>}
 */
module.exports.byLoginPassword = async function byLoginPassword(login, password, options) {
  if(typeof options == 'object') {
    if(options.plainPassword) {
      password = crypto.createHash('sha512').update(password).digest('hex');
    }
  }

  let user = await this.findOne({password: password}, {
    qext: async q => {
      q.or([{
        'username': login
      }, {
        'email': login
      }]);
    }
  });
  return user;
};