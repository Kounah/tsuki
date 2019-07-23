const mongoose = require('mongoose');
const permissions = require('./permissions');
const validation = require('./validation');

/**
 * user model
 * ---
 * @namespace model
 * @memberof module:api/user
 */

/**
 * @typedef {Object} UserProperties
 * @prop {String} username the username (used to display and login)
 * @prop {String} password the sha512 hash of the password
 * @prop {String} email the Users email address
 * @prop {Object} name
 * @prop {String} name.first
 * @prop {Array.<String>} name.middle
 * @prop {String} name.last
 * @prop {Array.<permissions.Key>} permissions
 * @prop {Boolean} verified
 * @prop {mongoose.Types.ObjectId} _id
 * @prop {Date} _created
 * @prop {Date} _updated
 */

let schema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Users require a username'],
    unique: [true, 'username is a unique property'],
    validator: function(v, cb) {
      let validity = validation.validateUsername(v);
      cb(validity.valid, validity.message);
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
        return this.username;
      }
    },
    middle: [{
      type: String
    }],
    last: {
      type: String,
      required: true,
      default: function() {
        return this.username;
      }
    }
  },
  permissions: [{
    type: String,
    enum: Object.keys(permissions.keys)
  }],
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: {
    createdAt: '_created',
    updatedAt: '_updated'
  },
});

let model = mongoose.model('User', schema);

module.exports = model;