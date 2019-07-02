const config = require('../config');
const url = require('url');
const mongoose = require('mongoose');

module.exports.connect = async function() {
  if(typeof config.database != 'object')
    throw 'unable to read connection information';

  let conStr = url.format({
    protocol: 'mongodb',
    slashes: true,
    auth: config.database.username && config.database.password
      ? config.database.username + ':' + config.database.password
      : undefined,
    hostname: config.database.host,
    port: config.database.port,
    pathname: '/' + config.database.name
  });

  return await mongoose.connect(conStr, {
    appname: 'tsuki-api'
  });
};