const mongoose = require('mongoose');
const permissions = require('./permissions');

/**
 * user model
 * ---
 * @namespace model
 * @memberof module:api/user
 */

/**
 * @typedef {Object} UserProperties
 * @property {String} username the login name used to login
 * @property {String} password the sha512 hash of the password
 * @property {String} email the Users email address
 * @property {Object} name
 * @property {String} name.first
 * @property {Array.<String>} name.middle
 * @property {String} name.last
 * @property {Array.<permissions.Key>} permissions
 * @property {mongoose.Types.ObjectId} _id
 * @property {Date} _created
 * @property {Date} _updated
 */

let schema = new mongoose.Schema({
  login: {
    type: String,
    required: [true, 'Users require a login name'],
    unique: [true, 'login is a unique property'],
    validator: function(v, cb) {
      let pattern = /^[a-zA-Z]+[-_a-zA-Z0-9]*$/gm;
      let msg = v + ' is not a valid login.'
        + 'It shold match the following pattern ' + pattern;
      cb(pattern.test(v), msg);
    }
  },
  password: {
    type: String,
    required: [true, 'Users require a password hash (sha512)'],
  },
  email: {
    type: String,
    unique: true,
    validator: function(v, cb) {
      // eslint-disable-next-line no-useless-escape
      let pattern = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/gm;
      let msg = v + ' is not a valid email address.';

      cb(pattern.test(v), msg);
    }
  },
  name: {
    first: {
      type: String,
      required: true,
      default: function() {
        return this.login;
      }
    },
    middle: [{
      type: String
    }],
    last: {
      type: String,
      required: true,
      default: function() {
        return this.login;
      }
    }
  },
  permissions: [{
    type: String,
    enum: Object.keys(permissions.keys)
  }]
}, {
  timestamps: {
    createdAt: '_created',
    updatedAt: '_updated'
  },
});

let model = mongoose.model('User', schema);

module.exports = model;