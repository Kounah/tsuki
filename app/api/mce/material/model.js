const mongoose = require('mongoose');
const config = require('../../../config');

/**
 * @typedef {Object} MaterialProperties
 * @prop {String} name a human readable name used for displaying
 * @prop {String} description a human readable description used for displaying
 * @prop {String} color a CSS color property
 * @prop {Object} icon base64 encoded icon
 * @prop {String} icon.data the icons data string
 * @prop {String} icon.mime the icons mime type (has to be image/*)
 * @prop {String} itemId the minecraft item id of this material
 * @prop {Boolean} public is the material publically available
 * @prop {mongoose.Types.ObjectId} _id
 * @prop {Date} _created
 * @prop {Date} _updated
 */

let schema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  color: {
    type: String,
    required: true
  },
  icon: {
    data: {
      type: String,
      required: true,
      maxlength: config.api.v1.mce.material.icon_limit
    },
    mime: {
      type: String,
      required: true,
      validator: function(v, cb) {
        let pattern = /^[\s]*?image\/.*?$/gm;
        let msg = v + ' is not a valid mimeType for icon';

        cb(pattern.test(v), msg);
      }
    },
  },
  itemId: {
    type: String,
    required: false
  },
  public: {
    type: Boolean
  }
}, {
  timestamps: {
    createdAt: '_created',
    updatedAt: '_updated'
  },
});

let model = mongoose.model('MinecraftEditorMaterial', schema);

module.exports = model;