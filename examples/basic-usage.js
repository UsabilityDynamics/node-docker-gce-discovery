var discoveryInstance = require('../index').create({
  gceConfig: '../test/fixtures/private/wpCloud-26f2ba75bcf1',
  machineTags: [ 'docker-server' ], // required tags a GCE machine must have to be monitored
  dockerPort: 12110, // which port on the found machines to use to connect
  watch: true // if enabled watch Docker Daemon for changes
});

//if "watch" parameter if false
setTimeout(function(){
   console.log('basic-usage.js', require('util').inspect(discoveryInstance.containers, {showHidden: false, depth: 1, colors: true}));
   console.log('basic-usage.js', require('util').inspect('done', {showHidden: false, depth: 1, colors: true}));
}, 5000);

setTimeout(function(){
  console.log('basic-usage.js', require('util').inspect(discoveryInstance.containers, {showHidden: false, depth: 1, colors: true}));
  console.log('basic-usage.js', require('util').inspect('done', {showHidden: false, depth: 1, colors: true}));
}, 15000);