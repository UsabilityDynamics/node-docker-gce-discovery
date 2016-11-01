var async = require('async');
var _ = require('lodash');
var getDockerContainers = require('./lib/getDockerContainers');
var Dockerode = require('dockerode');
var DockerEvents = require('docker-events');

async.auto({
  container_list: [function(callback){

    getDockerContainers.getDockerContainers(null, function getContainers (options, containers){

      callback(null, containers);
    });

  }],
  instances_list: ['container_list', function(results, callback){

    var instances = {};

    async.each(results.container_list, function(value_each, callback_each){
      _.each(value_each, function(value, key){

        Object.defineProperty( instances, 'emmiter_' + key, {
          "enumerable": true,
          "value" : new DockerEvents({
            docker: new Dockerode({
              host: value.host,
              port: value.port || 2375
            }),
          })
        });
        callback_each();
      });

    }, function(error){
      callback(null, instances);
    });

  }],
}, function(error, result){

  //console.log('result.container_list', require('util').inspect(result.instances_list, {showHidden: false, depth: 10, colors: true}));

  // _.each(result.instances_list, function(value, key){
  //
  //   if(key == 'emmiter_mosul'){

  var mosul = result.instances_list.emmiter_mosul;



  mosul.start();

  mosul.on("connect", function() {
    console.log("connected to docker api");
  });

  mosul.on("create", function(message) {
        console.log("container created: %j", message);
      });

  mosul.on("start", function(message) {
        console.log("container started: %j", message);
      });

  mosul.on("stop", function(message) {
        console.log("container stopped: %j", message);
      });

  mosul.stop();

    //}

  // });



  //console.log(require('util').inspect(events, {showHidden: false, depth: 10, colors: true}));



});



