var async = require('async');
var _ = require('lodash');
var getDockerContainers = require('./lib/getDockerContainers');
var dockerContainers = [];
var DockerEvents = require('docker-events');
var emitter = new DockerEvents({
  docker: new Dockerode({

  }),
});

async.auto({
  container_list: [function(callback){

  }],
}, function(error, result){

});

getDockerContainers.getDockerContainers(null, function getContainers (options, containers){

  dockerContainers = containers;

  console.log('dockerContainers', require('util').inspect(dockerContainers, {showHidden: false, depth: 10, colors: true}));

});

