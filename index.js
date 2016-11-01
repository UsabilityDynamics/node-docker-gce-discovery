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

    //console.log('results.container_list', require('util').inspect(results.container_list, {showHidden: false, depth: 10, colors: true}));

    var instances = {};
    // var instances = new DockerEvents({
    //     docker: new Dockerode({
    //       host: '10.0.0.9',
    //       port: 12110
    //     }),
    //   });
    //
    // callback(null, instances);

    async.each(results.container_list, function(value_each, callback_each){
      _.each(value_each, function(value, key){

        // Object.defineProperty( instances, 'emmiter_' + key, {
        //   "enumerable": true,
        //   "value" : new DockerEvents({
        //     docker: new Dockerode({
        //       host: value.host,
        //       port: value.port || 2375
        //     }),
        //   })
        // });

        instances[key] = new DockerEvents({
          docker: new Dockerode({
            host: value.host,
            port: parseInt(value.port)
          }),
        });
        callback_each();
      });

    }, function(error){
      callback(null, instances);
    });

  }],
}, function(error, result){


  //console.log('result.container_list', require('util').inspect(result.instances_list, {showHidden: false, depth: 10, colors: true}));

  _.each(result.instances_list, function(value, key){

    //if(key == 'emmiter_mosul'){

  //var mosul = result.instances_list.emmiter_mosul;

    value.start();

    value.on("connect", function() {
      console.log("connected to docker api machine [" + key + "]");
    });

    value.on("create", function(message) {
      console.log("container created on [" + key + "] machine: %j", message);
    });

    value.on("start", function(message) {
      console.log("container started on [" + key + "] machine: %j", message);
    });

    value.on("stop", function(message) {
      console.log("container stopped on [" + key + "] machine: %j", message);
    });

    value.stop();

  //}

  });

  //console.log(require('util').inspect(events, {showHidden: false, depth: 10, colors: true}));



});



