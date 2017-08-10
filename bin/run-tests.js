#!/usr/bin/env node
var spawn = require('child_process').spawn;
var RSVP = require('rsvp');

switch (process.env.TEST_SUITE) {
  case 'node':
    console.log('suite: node');
    require('./run-node-tests');
    return;
  case 'browser':
    console.log('suite: browser');
    testemSauce();
    return;
}

function testemSauce() {
  RSVP.Promise.resolve().then(() => {
    return run('./node_modules/.bin/ember', ['sauce:connect']);
  }).then(() => {
    return run('./node_modules/.bin/ember', ['test', '--test-port=7000', '--config-file=testem-sauce.js']);
  }).finally(() => {
    return run('./node_modules/.bin/ember', ['sauce:disconnect']);
  }).catch((e) => {
    console.log(e);
    process.exit(1);
  }).then(() => {
    console.log('Success!');
    process.exit(0);
  })
}

function run(command, _args) {
  var args = _args || [];

  return new Promise(function(resolve, reject) {
    console.log('Running: ' + command + ' ' + args.join(' '));

    var child = spawn(command, args);

    child.stdout.on('data', function(data) {
      console.log(data.toString());
    });

    child.stderr.on('data', function(data) {
      console.error(data.toString());
    });

    child.on('error', function(err) {
      reject(err);
    });

    child.on('exit', function(code) {
      if (code === 0) {
        resolve();
      } else {
        reject(code);
      }
    });
  });
}
