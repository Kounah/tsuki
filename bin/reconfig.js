#!/usr/bin/env node
'use strict';

const config = require('../app/config');
const uconfig = require('../app/user-config');
const process = require('process');
const readline = require('readline');
require('colors');

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
});

console.log('exit the process to save changes');

function jsonpath(o, newval, ...path) {
  try {
    if(path.length > 0) {
      let cur = path.shift();
      o[cur] = jsonpath(o[cur], newval, ...path);
      return o;
    } else {
      return newval;
    }
  } catch(err) {
    return undefined;
  }
}

let reconf = config;
async function exec() {

  config.__keys.map(conf => resolve => {
    rl.write(String(typeof conf.mod === 'function' ? conf.mod(conf.val) : conf.val));
    rl.question(conf.key.cyan + ': ', answer => {
      conf.val = answer
        ? answer === '#def'
          ? conf.def
          : typeof conf.mod === 'function' ? conf.mod(answer) : answer
        : conf.val;
      resolve(conf);
    });
  }).reduce((p, c) => {
    return new Promise(async resolve => {
      if(typeof p === 'object' && p !== null && p instanceof Promise) {
        let result = await p;
        jsonpath(reconf, typeof result.mod === 'function' ? result.mod(result.val) : result.val, ...result.key.split('.'));
      }
      resolve(new Promise(c));
    });
  });
}

process.on('exit', (code) => {
  uconfig.create(reconf);
  console.log('\nexited with code ' + code);
});

exec();