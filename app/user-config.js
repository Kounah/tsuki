const os = require('os');
const fs = require('fs');
const path = require('path');
const ini = require('ini');

let p = path.join(os.homedir(), './.tsuki.ini');

function create(settings) {
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