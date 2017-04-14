var discoveryInstance = require('../index').create({
  zones: process.env.GCE_MACHINE_ZONE || ['us-central1-b'], // zones list
  project: process.env.GCE_PROJECT || 'my-project', // your project name
  gceConfig: process.env.GCE_CONFIG_PATH || '../test/fixtures/private/wpCloud-26f2ba75bcf1', //string with path to file with object of credentials or object of credentials
  machineTags: process.env.GCE_MACHINE_TAGS || [ 'docker-server' ], // required tags a GCE machine must have to be monitored
  dockerPort: 2375, // which port on the found machines to use to connect
  watch: false, // if enabled watch Docker Daemon for changes
  docker: true,
  externalIP: true
});

discoveryInstance.on( 'ready:machines', function haveMachines( error, machines  ) {
  
  console.log('machines', require('util').inspect(machines, {showHidden: false, depth: 3, colors: true}));
  
});

discoveryInstance.on( 'ready:containers', function haveContainers( error, conatiners ) {
  
//  console.log('containers', require('util').inspect(conatiners, {showHidden: false, depth: 1, colors: true}));
  
});

//console.log('discoveryInstance', discoveryInstance );
