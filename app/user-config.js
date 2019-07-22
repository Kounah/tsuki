const os = require('os');
const fs = require('fs');
const path = require('path');
const ini = require('ini');

let p = path.join(os.homedir(), './.tsuki.ini');

/**
 *
 * @param {Object} o
 * @param {(val: *) => *} func
 * @param  {...any} path
 */
// eslint-disable-next-line no-unused-vars
function recursiveOverrideValues(o, func) {
  if(typeof o !== 'object' || o === null)
    return func(o);

  if(o instanceof RegExp) {
    return func(o);
  }

  Object.keys(o)
    .forEach(k => o[k] = recursiveOverrideValues(o[k], func));

  return o;
}

function create(settings) {
  delete settings.__keys;

  settings = recursiveOverrideValues(settings, val => {
    if(typeof val === 'object' && val !== null && val instanceof RegExp) {
      return ini.safe(String(val));
    }

    return val;
  });

  console.log(settings);

  if(!fs.existsSync(p)) {
    fs.writeFileSync(p, ini.encode(settings));
  }
}

function load() {
  if(fs.existsSync(p)) {
    return ini.decode(fs.readFileSync(p).toString('utf8'));
  } else return {};
}

module.exports = {
  create,
  load
};