#!/usr/bin/env node
'use strict';

const process = require('process');
const readline = require('readline');
const user = require('../app/api/user');
const mongoose_connect = require('../app/lib/mongoose').connect;

const Writable = require('stream').Writable;

var mutableStdout = new Writable({
  write: function(chunk, encoding, callback) {
    if (!this.muted)
      process.stdout.write(chunk, encoding);
    callback();
  }
});

function mute() {
  mutableStdout.muted = true;
}

function unmute() {
  mutableStdout.muted = false;
}

unmute();

let rl = readline.createInterface({
  input: process.stdin,
  output: mutableStdout,
  terminal: true
});

(async() => {
  console.log('connecting to database');
  await mongoose_connect();
  console.log('connected to database');

  console.log('checking for admin user');
  if(!await user.api.exists({login: 'admin'})) {
    let created = await user.api.create({
      login: 'admin',
      password: await new Promise(resolve => {
        rl.question('set new admin password: ', data => {
          unmute();
          resolve(data);
        });
        mute();
      }),
      permissions: Object.keys(require('../app/api/user/permissions'))
    }, {
      plainPassword: true
    });

    console.log('created admin: ', created);
  } else {
    console.log('admin user exists');
  }
})()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });