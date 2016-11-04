var async = require('async');
var _ = require('lodash');
var getDockerContainers = require('./lib/getDockerContainers');
var Dockerode = require('dockerode');
var DockerEvents = require('docker-events');

module.exports.create = function containersList( options ) {
  
  var _state = {
    containers: [],
    machines: []
  };
  
  options = _.defaults(options, {
    gceConfig: {}, //path to service account JSON file or the object itself || string
    machineTags: [], // required tags a GCE machine must have to be monitored || array
    dockerPort: 2375, // which port on the found machines to use to connect || number
    watch: true // if enabled watch Docker Daemon for changes || bool
  });

  //console.log('create options', require('util').inspect(options, {showHidden: false, depth: 10, colors: true}));


  async.auto({
    get_machines_data: [function (callback) {
      console.log(require('util').inspect('inside get_machines_data', {showHidden: false, depth: 10, colors: true}));
      getDockerContainers.getDockerContainers(options, function getContainers(options, machines_data) {
        console.log(require('util').inspect('inside getDockerContainers', {showHidden: false, depth: 10, colors: true}));
        callback(null, machines_data);
      });

    }],
    instances_list: ['get_machines_data', function (results, callback) {

      //console.log('results.container_list', require('util').inspect(results.container_list, {showHidden: false, depth: 10, colors: true}));
      _state.machines = results.get_machines_data.machines;
      var instances = {};

      console.log(require('util').inspect('inside instances_list', {showHidden: false, depth: 10, colors: true}));

      async.each(results.get_machines_data.machines, function (value_each, callback_each) {

          instances[value_each.name] = new DockerEvents({
            docker: new Dockerode({
              host: value_each.host,
              port: parseInt(value_each.port)
            }),
          });
          callback_each();

      }, function (error) {
        callback(null, instances);
      });

    }],
  }, function (error, result) {

    //var containers_list = result.get_machines_data.containers;

    _.each(result.get_machines_data.containers, function(item2){
      _state.containers.push(item2)
    });

    //console.log('containers_list', require('util').inspect(containers_list, {showHidden: false, depth: 10, colors: true}));

    //console.log(require('util').inspect('final container_list', {showHidden: false, depth: 10, colors: true}));

    if(options.watch){
      _.each(result.instances_list, function (value, key) {

        value.start();
        
        value.on("connect", function () {
          console.log("connected to docker api machine [" + key + "] " + new Date());
        });

        value.on("disconnect", function () {
          console.log("disconnected to docker api machine [" + key + "] " + new Date());
        });

        value.on("create", function (message) {
          console.log("container created on [" + key + "] machine: %j " + new Date(), message);
          getDockerContainers.getDockerContainers(options, function getContainers(options, machines_data) {
            _state.containers = [];
            _.each(machines_data.containers, function(item){
              _state.containers.push(item)
            });
          });
        });

        value.on("start", function (message) {
          console.log("container started on [" + key + "] machine: %j " + new Date(), message);
          getDockerContainers.getDockerContainers(options, function getContainers(options, machines_data) {
            _state.containers = [];
            _.each(machines_data.containers, function(item){
              _state.containers.push(item)
            });
            //console.log('start _state.containers', require('util').inspect(_state.containers, {showHidden: false, depth: 1, colors: true}));
          });
        });

        value.on("stop", function (message) {
          console.log("container stopped on [" + key + "] machine: %j " + new Date(), message);

          //console.log('stop _state.containers', require('util').inspect(_state.containers, {showHidden: false, depth: 1, colors: true}));
        _.each(_state.containers, function(container, number_container){
          // console.log('container.Id', require('util').inspect(container.Id, {showHidden: false, depth: 10, colors: true}));
          // console.log('message.id', require('util').inspect(message.id, {showHidden: false, depth: 10, colors: true}));
          if(typeof container != 'undefined'){
            if (container.Id == message.id) {
              //console.log('container.Id', require('util').inspect(container.Id, {showHidden: false, depth: 1, colors: true}));
              _state.containers.splice(number_container, 1);
              //console.log('stop _state.containers', require('util').inspect(_state.containers, {showHidden: false, depth: 1, colors: true}));
            }
          }
        });

        });

        value.on("destroy", function (message) {
          console.log("container destroyed on [" + key + "] machine: %j " + new Date(), message);

          _.each(_state.containers, function(container, number_container){
            if (container.Id == message.id) {
              _state.containers.splice(number_container, 1);
              console.log('destroy _state.containers', require('util').inspect(_state.containers, {showHidden: false, depth: 1, colors: true}));
            }
          });

        });

        value.stop();

      });
    }

    //console.log(require('util').inspect(events, {showHidden: false, depth: 10, colors: true}));
  });
  
  return _state;
}


