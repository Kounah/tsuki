const Material = require('./model');
// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose');
const url = require('url');
const http = require('http');
const https = require('https');

/**
 * creates a new Material
 * @param {Material.MaterialProperties} properties raw properties
 * ***
 * __ignored properties__:
 * - _id
 * - _created
 * - _updated
 * @throws {mongoose.Error}
 * @returns {Promise.<Material.MaterialProperties>} a created object of the Material Model
 */
module.exports.create = async function create(properties) {
  if(typeof properties !== 'object' || properties === null)
    throw new TypeError('\'properties\' is not an Object');

  delete properties._id;
  delete properties._created;
  delete properties._updated;

  let material = await Material.create(properties);
  return material;
};

module.exports.deleteAll = async function deleteAll() {
  let result = await Material.deleteMany({});
  return result;
};

/**
 * loads materials from a URL and stores them in the database
 * @param {String} source
 */
module.exports.loadFromURL = async function loadFromURL(source) {
  let u = url.parse(source, true);

  if(['http:', 'https:'].includes(u.protocol)) {
    // source is url

    let h = http;
    if(u.protocol === 'https:') h = https;

    let data = await new Promise(resolve => {
      h.get(url.format(u, {
        slashes: true
      }), res => {
        let body = '';
        res.on('data', chunk => {
          body += chunk.toString('utf8');
        });

        res.on('end', () => {
          resolve(JSON.parse(body));
        });
      });
    });

    if(typeof data === 'object' && data !== null && Array.isArray(data)) {
      return await Promise.all(data.map(d => this.create(d)));
    } else throw Error('\'data\' is not an Array');

  } else if (u.protocol === 'file:') {
    // source is local file
  } else {
    throw new Error('Invalid Protocol: ' + u.protocol);
  }
};